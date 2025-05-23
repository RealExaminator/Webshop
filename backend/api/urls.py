from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserCreateView,
    ItemViewSet,
    CartItemViewSet,
    MyTokenObtainPairView,
    ChangePasswordView
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'items', ItemViewSet, basename='item')
router.register(r'cart', CartItemViewSet, basename='cartitem')

urlpatterns = [
    path('users/register/', UserCreateView.as_view(), name='user-register'),
    path('users/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]