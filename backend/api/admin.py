from django.contrib import admin
from .models import Item, CartItem # Make sure to import your models

# To customize how Item model is displayed in admin
@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'status', 'seller', 'buyer', 'date_added') # Fields to show in the list view
    list_filter = ('status', 'date_added', 'seller', 'buyer') # Filters on the right sidebar
    search_fields = ('title', 'description', 'seller__username', 'buyer__username') # Fields to search by
    readonly_fields = ('date_added',) # Fields that cannot be edited in admin once set

# To customize how CartItem model is displayed in admin
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'item_title', 'added_at') # Show item title for easier reading
    list_filter = ('user', 'added_at')
    search_fields = ('user__username', 'item__title')
    readonly_fields = ('added_at',)

    def item_title(self, obj): # Custom method to display item's title
        return obj.item.title
    item_title.short_description = 'Item Title' # Column header

# The built-in User model is registered by default.
# If you wanted to customize it, you would unregister and re-register it:
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from django.contrib.auth.models import User
# admin.site.unregister(User)
# @admin.register(User)
# class UserAdmin(BaseUserAdmin):
#     # Add your customizations here
#     pass