from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.generic import RedirectView  # Import RedirectView
from .views import ProductViewSet, RegisterAPIView  # Changed to relative import
from .views import ProductSearchView  # Import the ProductSearchView
from .views import LoginAPIView, LogoutAPIView  # Import LoginAPIView and LogoutAPIView
from .views import analytics_summary, analytics_product, analytics_user_interactions  # Import analytics views
from core.views import (
    SellerRatingListView, SellerRatingDetailView, SellerRatingCreateView,
    SellerRatingUpdateView, SellerRatingDeleteView, SellerRatingAnalysisView,
    NotificationListView, NotificationDetailView, NotificationCreateView, NotificationSettingsView
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')

urlpatterns = [
    path('', RedirectView.as_view(url='/core/api/', permanent=True)),  # Redirect /core/ to /core/api/
    path('api/', include(router.urls)),
    path('api/register/', RegisterAPIView.as_view(), name='api-register'),  # Ensure this path is defined
    path('search-products/', ProductSearchView.as_view(), name='search_products'),
    path('api/users/register/', RegisterAPIView.as_view(), name='user-register'),  # Add this line
    path('api/auth/login/', LoginAPIView.as_view(), name='api-login'),
    path('api/auth/logout/', LogoutAPIView.as_view(), name='api-logout'),
    path('api/auth/register/', RegisterAPIView.as_view(), name='api-register'),
    path('api/analytics/summary/', analytics_summary, name='analytics-summary'),  # Add analytics summary endpoint
    path('api/analytics/product/<int:product_id>/', analytics_product, name='analytics-product'),  # Add analytics product endpoint
    path('api/analytics/user-interactions/', analytics_user_interactions, name='analytics-user-interactions'),  # Add analytics user interactions endpoint
    path('api/seller-ratings/', SellerRatingListView.as_view(), name='seller-rating-list'),
    path('api/seller-ratings/<uuid:sellerId>/', SellerRatingDetailView.as_view(), name='seller-rating-detail'),
    path('api/seller-ratings/create/', SellerRatingCreateView.as_view(), name='seller-rating-create'),
    path('api/seller-ratings/<int:ratingId>/update/', SellerRatingUpdateView.as_view(), name='seller-rating-update'),
    path('api/seller-ratings/<int:ratingId>/delete/', SellerRatingDeleteView.as_view(), name='seller-rating-delete'),
    path('api/seller-ratings/<uuid:sellerId>/analysis/', SellerRatingAnalysisView.as_view(), name='seller-rating-analysis'),
    path('api/notifications/', NotificationListView.as_view(), name='notification-list'),
    path('api/notifications/<int:notificationId>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('api/notifications/create/', NotificationCreateView.as_view(), name='notification-create'),
    path('api/notifications/settings/', NotificationSettingsView.as_view(), name='notification-settings'),
]
