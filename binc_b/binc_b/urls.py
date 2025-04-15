from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView, TemplateView
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth.decorators import login_required
from core.views import CustomTokenObtainPairView  # Import the custom token view
from core.views import LoginAPIView, LogoutAPIView, RegisterAPIView  # Import authentication views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('core/', include('core.urls')),  # Ensure core app endpoints are included
    path('reviews/', include('reviews.urls')),  # Reviews app endpoints
    path('products/', include('products.urls')),  # Ensure this path is correct
    path('', login_required(TemplateView.as_view(template_name="home.html")), name='home'),  # Require login for homepage
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # Replace with custom view
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT token refresh endpoint
    path('promotions/', include('promotions.urls')),  # Promotions app endpoints
    path('api/auth/login/', LoginAPIView.as_view(), name='api-login'),  # Login endpoint
    path('api/auth/logout/', LogoutAPIView.as_view(), name='api-logout'),  # Logout endpoint
    path('api/auth/register/', RegisterAPIView.as_view(), name='api-register'),  # Register endpoint
]
