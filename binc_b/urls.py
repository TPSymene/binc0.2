from django.urls import path, include

urlpatterns = [
    path('promotions/', include('promotions.urls')),  # Promotions app endpoints
    path('binc_b/promotions/', include('binc_b.promotions.urls')),  # Binc_b promotions endpoints
]