from rest_framework import serializers

from reviews.serializers import ReviewSerializer

from core.models import Category, Product

#----------------------------------------------------------------
#                 Category Serializer
#----------------------------------------------------------------
class CategorySerializer(serializers.ModelSerializer):
    
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'image', 'product_count')
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

#----------------------------------------------------------------
#                   ProductList Serializer
#----------------------------------------------------------------
class ProductListSerializer(serializers.ModelSerializer):
    
    category = CategorySerializer(read_only=True)
    discount = serializers.SerializerMethodField()
    rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'slug', 'price', 'original_price', 'discount',
                  'category', 'image', 'rating', 'review_count', 'in_stock', 'is_featured')
    
    def get_discount(self, obj):
        return obj.discount_percentage

#----------------------------------------------------------------
#                   Product Detail Serializer
#----------------------------------------------------------------
class ProductDetailSerializer(serializers.ModelSerializer):
    
    category = CategorySerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    discount = serializers.SerializerMethodField()
    rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'slug', 'description', 'price', 'original_price',
                  'discount', 'category', 'image', 'stock', 'in_stock', 'rating',
                  'review_count', 'images', 'reviews', 'is_featured',
                  'created_at', 'updated_at')
    
    def get_discount(self, obj):
        return obj.discount_percentage
