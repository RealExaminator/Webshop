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
        return CartItem.objects.filter(user=self.request.user).select_related('item', 'item__seller',
                                                                              'item__buyer').order_by('-added_at')

    def perform_create(self, serializer):
        item_instance = serializer.validated_data['item']
        if item_instance.seller == self.request.user:
            raise DRFValidationError({"detail": "You cannot add your own item to the cart."})
        if item_instance.status != 'on-sale':
            raise DRFValidationError({"detail": "This item is not available for sale."})
        if CartItem.objects.filter(user=self.request.user, item=item_instance).exists():
            raise DRFValidationError({"detail": "This item is already in your cart."})
        # CartItem model's save() method will set price_at_add
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
                items_with_issues.append({
                    "cart_item_id": cart_item_obj.id, "item_id": cart_item_obj.item.pk,
                    "title": getattr(cart_item_obj.item, 'title', 'Unknown Item'),
                    "issue": "item_not_found", "message": "Item no longer exists."
                })
                continue

            if db_item.status != 'on-sale':
                items_with_issues.append({
                    "cart_item_id": cart_item_obj.id, "item_id": db_item.id, "title": db_item.title,
                    "issue": "not_available",
                    "message": f"Item '{db_item.title}' is no longer available for sale.",
                    "current_price": str(db_item.price)
                })
                continue

            if cart_item_obj.price_at_add is None:
                items_with_issues.append({
                    "cart_item_id": cart_item_obj.id, "item_id": db_item.id, "title": db_item.title,
                    "issue": "internal_error",
                    "message": f"Could not verify original price for '{db_item.title}'. Please remove and re-add the item to your cart.",
                    "current_price": str(db_item.price)
                })
                continue
            elif db_item.price != cart_item_obj.price_at_add:
                items_with_issues.append({
                    "cart_item_id": cart_item_obj.id, "item_id": db_item.id, "title": db_item.title,
                    "issue": "price_changed",
                    "message": f"The price for '{db_item.title}' has changed from ${cart_item_obj.price_at_add} to ${db_item.price}. To buy the item, remove it and add it to the cart again!",
                    "current_price": str(db_item.price),
                    "old_price": str(cart_item_obj.price_at_add)
                })
                continue

            items_to_purchase_db_instances.append(db_item)

        if items_with_issues:
            return Response({
                "detail": "Transaction halted. Please review your cart for issues.",
                "issues": items_with_issues
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                item_ids_to_purchase = [item.pk for item in items_to_purchase_db_instances]
                locked_items_for_purchase = Item.objects.select_for_update().filter(pk__in=item_ids_to_purchase)

                if len(locked_items_for_purchase) != len(item_ids_to_purchase):
                    raise DRFValidationError(
                        "Some items became unavailable during final processing. Please refresh your cart and try again.")

                for item_to_sell in locked_items_for_purchase:
                    if item_to_sell.status != 'on-sale':
                        raise DRFValidationError(
                            f"Item '{item_to_sell.title}' became unavailable during the transaction process.")

                    item_to_sell.status = 'sold'
                    item_to_sell.buyer = request.user
                    item_to_sell.save()

                CartItem.objects.filter(user=request.user, item__pk__in=item_ids_to_purchase).delete()

        except DRFValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return Response({"detail": "An unexpected error occurred during checkout. Please try again later."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "Purchase successful! Your items have been processed."}, status=status.HTTP_200_OK)


SEED_LISTINGS = [
    ("Natural Canvas Tote", "A roomy unbleached canvas tote for market runs and everyday carry."),
    ("Cream Ceramic Mug", "A matte cream mug that holds a full cup of coffee or tea."),
    ("White Leather Sneakers", "Clean low-top leather sneakers with a cushioned sole."),
    ("Brass Desk Lamp", "A small brass lamp with a linen shade for a desk or bedside table."),
    ("Charcoal Over-Ear Headphones", "Matte over-ear headphones for music and quiet work."),
    ("Terracotta Houseplant", "A compact leafy plant in a classic terracotta pot."),
    ("Tan Leather Watch", "A simple analog watch on a tan leather strap."),
    ("Clothbound Hardcover", "A rust-orange clothbound book with a plain cover."),
    ("Market Day Tote", "A sturdy shopper with long handles and a flat base."),
    ("Stoneware Coffee Cup", "A thick-walled cup that keeps coffee warm a little longer."),
    ("Court Leather Trainers", "Bright white trainers meant for daily wear."),
    ("Linen Shade Lamp", "A warm desk light with a tapered linen shade."),
    ("Studio Headphones", "Closed-back headphones with a padded band."),
    ("Potted Leaf Plant", "A small green plant suited to a windowsill."),
    ("Everyday Analog Watch", "A slim watch with a clear dial and leather strap."),
    ("Warm Cloth Journal", "A hardcover journal bound in textured cloth."),
    ("Everyday Carry Tote", "A lightweight canvas bag that folds flat when empty."),
    ("Matte Breakfast Mug", "A wide mug for coffee, tea, or soup."),
    ("Clean White Low-Tops", "Minimal leather sneakers with matching laces."),
    ("Reading Desk Light", "A focused brass lamp for late reading."),
    ("Matte Listening Headphones", "Comfortable over-ears for long listening sessions."),
    ("Small Desk Plant", "A tidy potted plant for a shelf or desk."),
    ("Leather Strap Watch", "An everyday wristwatch with a soft tan strap."),
    ("Hardcover Reading Book", "A plain cloth hardcover ready for a shelf."),
    ("Stonewashed Shopper", "A washed canvas tote with reinforced corners."),
    ("Studio Clay Cup", "A hand-finished cup in a warm off-white glaze."),
    ("Soft Leather Trainers", "Broken-in looking white sneakers with a light sole."),
    ("Warm Brass Lamp", "A compact brass lamp that casts a soft pool of light."),
    ("Quiet Room Headphones", "Over-ear headphones with thick ear cushions."),
    ("Clay Pot Greenery", "A leafy plant settled in a fired clay pot."),
]


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
            title, description = SEED_LISTINGS[(seller_idx * 10) + (j - 1)]
            Item.objects.create(
                title=title,
                description=description,
                price=round(10.00 + (j * 1.5) + (seller_idx * 5.25), 2),
                seller=seller,
            )
            items_created_count += 1
    message = (
        f"Database populated successfully! {len(users_created)} users created. {items_created_count} items added by the first 3 users.")
    request.session['db_populated_message'] = message
    return HttpResponseRedirect(reverse('landing-page'))


def landing_page_view(request):
    message = request.session.pop('db_populated_message', None)
    context = {'message': message, 'react_app_url': 'http://localhost:3000'}
    return render(request, 'landing_page.html', context)