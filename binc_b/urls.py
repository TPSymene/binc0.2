from django.urls import path, include

urlpatterns = [
    path('promotions/', include('promotions.urls')),
    path('binc_b/promotions/', include('binc_b.promotions.urls')),
]