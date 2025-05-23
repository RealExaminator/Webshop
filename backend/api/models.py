from django.db import models
from django.conf import settings
from django.utils import timezone
# from django.contrib.auth.models import User # Can be used directly if preferred over settings.AUTH_USER_MODEL

class Item(models.Model):
    STATUS_CHOICES = [
        ('on-sale', 'On Sale'),
        ('sold', 'Sold'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date_added = models.DateTimeField(default=timezone.now, editable=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='on-sale')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='items_for_sale', on_delete=models.CASCADE)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='purchased_items', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title

class CartItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='cart_items', on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'item') # A user can add a specific item to their cart only once

    def __str__(self):
        return f"{self.item.title} in {self.user.username}'s cart"