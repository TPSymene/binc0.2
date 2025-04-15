from django.contrib import admin

from .models import User, Owner, Shop, Product, Specification, ProductSpecification, Brand, Category
from core.models import SellerRating

class ShopAdmin(admin.ModelAdmin):
    readonly_fields = ('is_banned',)

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return []
        return self.readonly_fields

    def get_queryset(self, request):
        """عرض جميع المتاجر في لوحة تحكم الأدمن"""
        return super().get_queryset(request)

    def has_change_permission(self, request, obj=None):
        if request.user.user_type == 'admin':
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.user_type == 'admin':
            return True
        return False

class UserAdmin(admin.ModelAdmin):
    # إزالة القيود السابقة للسماح بالتعديل
    fields = ('username', 'email', 'first_name', 'last_name', 'date_joined', 'user_type', 
              'last_login', 'is_staff', 'is_active', 'is_banned', 'groups', 'user_permissions')

    def get_queryset(self, request):
        """Admin يمكنه رؤية جميع المستخدمين"""
        return super().get_queryset(request)

    def has_change_permission(self, request, obj=None):
        """السماح للأدمن بتعديل المستخدمين"""
        return True

    def has_delete_permission(self, request, obj=None):
        """السماح للأدمن بحذف المستخدمين"""
        return True

class ProductAdmin(admin.ModelAdmin):
    readonly_fields = ('name', 'brand', 'category', 'shop', 'price', 'release_date', 
                       'last_price_update', 'description', 'image_url', 'video_url', 
                       'rating', 'likes', 'dislikes', 'neutrals', 'views', 'created_at')

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return self.readonly_fields
        return super().get_readonly_fields(request, obj)

    def get_fields(self, request, obj=None):
        if request.user.is_superuser:
            return ('is_active', 'in_stock', 'is_banned')  # الحقول القابلة للتعديل
        return super().get_fields(request, obj)

    def get_queryset(self, request):
        """عرض جميع المنتجات في لوحة تحكم الأدمن"""
        if hasattr(request.user, 'user_type') and request.user.user_type == 'admin':
            return super().get_queryset(request)
        return self.model.objects.none()

    def has_change_permission(self, request, obj=None):
        if request.user.user_type in ['admin', 'owner']:
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.user_type == 'admin':
            return True
        return False

    def has_add_permission(self, request, obj=None):
        """السماح للأدمن بإضافة المنتجات"""
        return True

admin.site.register(User, UserAdmin)
admin.site.register(Owner)
admin.site.register(Shop, ShopAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Specification)
admin.site.register(ProductSpecification)
admin.site.register(Brand)
admin.site.register(Category)
admin.site.register(SellerRating)