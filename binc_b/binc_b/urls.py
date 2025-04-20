from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls')),
    path('api/shop/', include('products.urls_shop')),  # إضافة مسار API للمتجر
    path('api/products/', include('products.urls')),  # إضافة مسار API للمنتجات
    path('api/dashboard/', include('products.urls_dashboard')),  # إضافة مسار API للوحة التحكم
    path('products/', include('products.urls')),
    path('categories/', include('products.urls_categories')),
    path('promotions/', include('promotions.urls')),
    path('reviews/', include('reviews.urls')),
    path('api/recommendations/', include('recommendations.urls')),
]

# إضافة مسارات للملفات الوسائط في بيئة التطوير
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
