from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render
from django.db import transaction

from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError as DRFValidationError
from rest_framework_simplejwt.views import TokenObtainPairView as DefaultTokenObtainPairView

from .models import Item, CartItem
from .serializers import (
    UserCreateSerializer,
    ItemSerializer,
    CartItemSerializer,
    MyTokenObtainPairSerializer,
    ChangePasswordSerializer
)


class MyTokenObtainPairView(DefaultTokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        old_password = serializer.validated_data.get('old_password')
        new_password = serializer.validated_data.get('new_password')

        if not user.check_password(old_password):
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

        if old_password == new_password:
            return Response({"new_password": ["New password cannot be the same as the old password."]},
                            status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password updated successfully. Please log in again."}, status=status.HTTP_200_OK)


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all().order_by('-date_added')
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.query_params.get('search', None)
        if self.action == 'list':
            queryset = queryset.filter(status='on-sale')
            if search_query:
                queryset = queryset.filter(title__icontains=search_query)
        return queryset

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def perform_update(self, serializer):
        item = self.get_object()
        if item.seller != self.request.user:
            raise PermissionDenied("You do not have permission to edit this item.")
        if item.status == 'sold':
            raise DRFValidationError({"detail": "Cannot edit a sold item."})
        serializer.save()

    def perform_destroy(self, instance):
        if instance.seller != self.request.user:
            raise PermissionDenied("You do not have permission to delete this item.")
        if instance.status == 'sold':
            raise DRFValidationError({"detail": "Sold items cannot be deleted."})
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_items(self, request):
        items = Item.objects.filter(seller=request.user).order_by('-date_added')
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_purchases(self, request):
        items = Item.objects.filter(buyer=request.user, status='sold').order_by('-date_added')
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related('item', 'item__seller').order_by(
            '-added_at')

    def perform_create(self, serializer):
        item_instance = serializer.validated_data['item']
        if item_instance.seller == self.request.user:
            raise DRFValidationError({"detail": "You cannot add your own item to the cart."})
        if item_instance.status != 'on-sale':
            raise DRFValidationError({"detail": "This item is not available for sale."})
        if CartItem.objects.filter(user=self.request.user, item=item_instance).exists():
            raise DRFValidationError({"detail": "This item is already in your cart."})
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        user_cart_items = CartItem.objects.filter(user=request.user).select_related('item')
        if not user_cart_items.exists():
            return Response({"detail": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)
        items_with_issues = []
        items_to_purchase_db_instances = []
        for cart_item_obj in user_cart_items:
            try:
                db_item = Item.objects.get(pk=cart_item_obj.item.pk)
            except Item.DoesNotExist:
                items_with_issues.append({"cart_item_id": cart_item_obj.id, "item_id": cart_item_obj.item.pk,
                                          "title": getattr(cart_item_obj.item, 'title', 'Unknown Item'),
                                          "issue": "item_not_found", "message": "Item no longer exists."})
                continue
            if db_item.status != 'on-sale':
                items_with_issues.append(
                    {"cart_item_id": cart_item_obj.id, "item_id": db_item.id, "title": db_item.title,
                     "issue": "not_available", "message": f"Item '{db_item.title}' is no longer available."})
                continue
            items_to_purchase_db_instances.append(db_item)
        if items_with_issues:
            return Response({"detail": "Transaction halted. Please review your cart.", "issues": items_with_issues},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                for item_to_sell in items_to_purchase_db_instances:
                    locked_item = Item.objects.select_for_update().get(pk=item_to_sell.pk)
                    if locked_item.status != 'on-sale':
                        raise DRFValidationError(f"Item '{locked_item.title}' became unavailable during transaction.")
                    locked_item.status = 'sold'
                    locked_item.buyer = request.user
                    locked_item.save()
                user_cart_items.delete()
        except DRFValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return Response({"detail": "An unexpected error occurred during checkout."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"detail": "Purchase successful! Items have been processed."}, status=status.HTTP_200_OK)


def populate_db_view(request):
    CartItem.objects.all().delete()
    Item.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()
    users_created = []
    for i in range(1, 7):
        username = f'testuser{i}'
        password = f'pass{i}'
        email = f'testuser{i}@shop.aa'
        user = User.objects.create_user(username=username, password=password, email=email)
        users_created.append(user)
    items_created_count = 0
    for seller_idx, seller in enumerate(users_created[:3]):
        for j in range(1, 11):
            Item.objects.create(title=f'Sample Item {(seller_idx * 10) + j} by {seller.username}',
                                description=f'A fantastic description for sample item number {(seller_idx * 10) + j}.',
                                price=round(10.00 + (j * 1.5) + (seller_idx * 5.25), 2), seller=seller)
            items_created_count += 1
    message = (
        f"Database populated successfully! {len(users_created)} users created. {items_created_count} items added by the first 3 users.")
    request.session['db_populated_message'] = message
    return HttpResponseRedirect(reverse('landing-page'))


def landing_page_view(request):
    message = request.session.pop('db_populated_message', None)
    context = {'message': message, 'react_app_url': 'http://localhost:3000'}
    return render(request, 'landing_page.html', context)