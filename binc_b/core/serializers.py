from rest_framework import serializers
from core.models import Product, User, SellerRating, Notification
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class SimpleProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'category', 'shop', 'price',
            'release_date', 'last_price_update', 'description',
            'image_url', 'video_url', 'rating', 'likes',
            'dislikes', 'neutrals', 'views', 'created_at',
            'is_banned',  # إضافة حقل الحظر
        ]

class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for listing products."""
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image_url', 'rating', 'likes', 'dislikes']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'user_type', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        if data['user_type'] not in ['admin', 'owner', 'customer']:
            raise serializers.ValidationError("Invalid user type.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')  # Remove password2 as it's not needed for user creation
        user = User.objects.create_user(**validated_data)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add user_type to the token
        token['user_type'] = user.user_type
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class SellerRatingSerializer(serializers.ModelSerializer):
    """Serializer for seller ratings."""
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = SellerRating
        fields = ['id', 'seller', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for the Notification model."""
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'content', 'notification_type', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

class NotificationSettingsSerializer(serializers.Serializer):
    """Serializer for user notification settings."""
    email_notifications = serializers.BooleanField(default=True)
    push_notifications = serializers.BooleanField(default=True)
    sms_notifications = serializers.BooleanField(default=False)

