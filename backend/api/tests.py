from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from .models import Item


class ItemAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='testuser1', password='password123')
        self.user2 = User.objects.create_user(username='testuser2', password='password123')

        self.item1 = Item.objects.create(
            title='Test Item 1',
            description='Description 1',
            price=10.00,
            seller=self.user1
        )
        self.item2 = Item.objects.create(
            title='Test Item 2',
            description='Description 2',
            price=20.00,
            seller=self.user2,
            status='sold',
            buyer=self.user1
        )
        self.list_create_url = reverse('item-list')  # Assumes 'item-list' is the name for ItemViewSet list/create
        self.detail_url = lambda pk: reverse('item-detail', kwargs={'pk': pk})

    def test_list_on_sale_items_unauthenticated(self):
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Only item1 is on-sale
        self.assertEqual(response.data[0]['title'], 'Test Item 1')

    def test_create_item_authenticated(self):
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'New Item', 'description': 'New Desc', 'price': 30.00}
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Item.objects.count(), 3)
        self.assertEqual(Item.objects.latest('id').seller, self.user1)

    def test_create_item_unauthenticated(self):
        data = {'title': 'Fail Item', 'description': 'Fail Desc', 'price': 40.00}
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code,
                         status.HTTP_401_UNAUTHORIZED)  # or 403 if AllowAny for GET but IsAuth for POST

# Add more tests for Cart, User registration etc.