from rest_framework import serializers
from core.models import User  # Import the correct User model

from .models import Review


class ReviewUserSerializer(serializers.ModelSerializer):
    """Serializer for user information in reviews."""
    
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User  # Use the correct User model
        fields = ('id', 'name', 'avatar')
    
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for the Review model."""
    
    user = ReviewUserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'user', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')


class CreateReviewSerializer(serializers.ModelSerializer):
    """Serializer for creating a review."""
    
    class Meta:
        model = Review
        fields = ('rating', 'comment')
    
    def create(self, validated_data):
        product_id = self.context['product_id']
        user = self.context['request'].user
        
        # Check if user has already reviewed this product
        if Review.objects.filter(product_id=product_id, user=user).exists():
            raise serializers.ValidationError("You have already reviewed this product.")
        
        review = Review.objects.create(
            product_id=product_id,
            user=user,
            **validated_data
        )
        return review
