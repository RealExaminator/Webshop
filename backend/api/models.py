# backend/api/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

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
    price_at_add = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Field to store price when added

    class Meta:
        unique_together = ('user', 'item')

    def __str__(self):
        return f"{self.item.title} in {self.user.username}'s cart"

    def save(self, *args, **kwargs):
        # Automatically set price_at_add when a new CartItem is created if it's not already set
        if not self.pk and self.item_id and self.price_at_add is None:
            # Ensure item is fetched if only item_id is present initially (though usually item instance is passed)
            try:
                item_instance = Item.objects.get(pk=self.item_id)
                self.price_at_add = item_instance.price
            except Item.DoesNotExist:
                # Handle case where item might not exist, though this should be rare
                # or set a default/raise an error as appropriate for your logic
                pass
        super().save(*args, **kwargs)