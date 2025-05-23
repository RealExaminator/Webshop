# backend/api/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer as DefaultTokenObtainPairSerializer
from .models import Item, CartItem

class MyTokenObtainPairSerializer(DefaultTokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        return data

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}, 'email': {'required': True}}

class ItemSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True, allow_null=True)
    class Meta:
        model = Item
        fields = ('id', 'title', 'description', 'price', 'date_added', 'status', 'seller', 'seller_username', 'buyer', 'buyer_username')
        read_only_fields = ('id', 'date_added', 'status', 'seller', 'seller_username', 'buyer', 'buyer_username')
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive value.")
        return value

class CartItemSerializer(serializers.ModelSerializer):
    item_details = ItemSerializer(source='item', read_only=True)
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), write_only=True)
    price_at_add = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True) # For display via API

    class Meta:
        model = CartItem
        fields = ('id', 'user', 'item', 'item_details', 'added_at', 'price_at_add')
        read_only_fields = ('id', 'user', 'item_details', 'added_at', 'price_at_add')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})