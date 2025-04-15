from rest_framework import viewsets, permissions
from django.core.paginator import Paginator
from django.core.cache import cache
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import Product, User, SellerRating, Notification
from .serializers import ProductSerializer, RegisterSerializer, SimpleProductSerializer, ProductListSerializer, CustomTokenObtainPairSerializer, SellerRatingSerializer, NotificationSerializer, NotificationSettingsSerializer
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from promotions.models import Promotion
from django.views.generic import TemplateView
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Sum, Avg
from django.shortcuts import get_object_or_404

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = SimpleProductSerializer
    permission_classes = [permissions.AllowAny]

class ProductListView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        if not request.user.has_permission('view_products'):
            return Response({'error': 'Unauthorized access'}, status=status.HTTP_403_FORBIDDEN)

        if hasattr(request.user, 'user_type') and request.user.user_type not in ['admin', 'owner', 'customer']:
            return Response({'error': 'Unauthorized access'}, status=status.HTTP_403_FORBIDDEN)

        cache_key = 'product_list'
        products = cache.get(cache_key)

        if not products:
            products = Product.objects.filter(is_active=True).select_related('category', 'brand')
            cache.set(cache_key, products, timeout=300)

        products = products.filter(is_banned=False)  # استبعاد المنتجات المحظورة

        paginator = Paginator(products, 10)
        page = request.GET.get('page')
        products = paginator.get_page(page)
        return Response({'products': ProductListSerializer(products, many=True).data})

# Signal handlers to clear cache when products are updated
@receiver(post_save, sender=Product)
@receiver(post_delete, sender=Product)
def clear_product_cache(sender, **kwargs):
    cache.delete('product_list')

class ProductSearchView(APIView):
    permission_classes = [permissions.AllowAny]  # السماح لجميع المستخدمين بالوصول

    def get(self, request):
        if not request.user.has_permission('view_products'):
            return Response({'error': 'Unauthorized access'}, status=status.HTTP_403_FORBIDDEN)

        query = request.GET.get('q', '')
        category = request.GET.get('category', None)
        min_price = request.GET.get('min_price', None)
        max_price = request.GET.get('max_price', None)

        products = Product.objects.filter(is_active=True)

        if query:
            products = products.filter(Q(name__icontains=query) | Q(description__icontains=query))
        if category:
            products = products.filter(category_id=category)
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)

        products = products.filter(is_banned=False)  # استبعاد المنتجات المحظورة

        products = products.select_related('category', 'brand').prefetch_related('images')
        return Response({'products': ProductListSerializer(products, many=True).data})
    

class RegisterAPIView(APIView):
    """API view for user registration."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully!",
                "user_type": user.user_type
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class HomePageView(TemplateView):
    template_name = "home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['promotions'] = Promotion.objects.filter(is_active=True)
        return context

class LoginAPIView(APIView):
    """API view for user login."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)

        if user:
            if user.is_banned:
                return Response({"error": "User is banned."}, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user_type": user.user_type,
                "permissions": user.get_all_permissions()
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutAPIView(APIView):
    """API view for user logout."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analytics_summary(request):
    """Provide a summary of platform interactions."""
    if request.user.user_type == 'customer':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    data = {}
    if request.user.user_type == 'admin':
        data['total_users'] = User.objects.count()
        data['total_products'] = Product.objects.count()
        data['total_views'] = Product.objects.aggregate(Sum('views'))['views__sum']
    elif request.user.user_type == 'owner':
        shop = request.user.owner_profile.shop
        data['total_products'] = shop.products.count()
        data['total_views'] = shop.products.aggregate(Sum('views'))['views__sum']

    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analytics_product(request, product_id):
    """Provide detailed analytics for a specific product."""
    product = get_object_or_404(Product, pk=product_id)

    if request.user.user_type == 'owner' and product.shop.owner.user != request.user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    data = {
        'name': product.name,
        'views': product.views,
        'likes': product.likes,
        'dislikes': product.dislikes,
        'neutrals': product.neutrals,
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analytics_user_interactions(request):
    """Provide user interaction data."""
    if request.user.user_type == 'customer':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.user.user_type == 'admin':
        interactions = Product.objects.values('name').annotate(
            total_views=Sum('views'),
            total_likes=Sum('likes'),
            total_dislikes=Sum('dislikes')
        )
    elif request.user.user_type == 'owner':
        shop = request.user.owner_profile.shop
        interactions = shop.products.values('name').annotate(
            total_views=Sum('views'),
            total_likes=Sum('likes'),
            total_dislikes=Sum('dislikes')
        )

    return Response(list(interactions))

class SellerRatingListView(APIView):
    """Retrieve all seller ratings."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        ratings = SellerRating.objects.all()
        seller_id = request.GET.get('seller')
        if seller_id:
            ratings = ratings.filter(seller_id=seller_id)
        serializer = SellerRatingSerializer(ratings, many=True)
        return Response(serializer.data)

class SellerRatingDetailView(APIView):
    """Retrieve details of a specific seller's ratings."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, sellerId):
        ratings = SellerRating.objects.filter(seller_id=sellerId)
        average_rating = ratings.aggregate(Avg('rating'))['rating__avg']
        serializer = SellerRatingSerializer(ratings, many=True)
        return Response({
            "average_rating": average_rating,
            "ratings": serializer.data
        })

class SellerRatingCreateView(APIView):
    """Create a new seller rating."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SellerRatingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SellerRatingUpdateView(APIView):
    """Update an existing seller rating."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, ratingId):
        rating = get_object_or_404(SellerRating, id=ratingId, user=request.user)
        serializer = SellerRatingSerializer(rating, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SellerRatingDeleteView(APIView):
    """Delete a seller rating."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, ratingId):
        rating = get_object_or_404(SellerRating, id=ratingId, user=request.user)
        rating.delete()
        return Response({"message": "Rating deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class SellerRatingAnalysisView(APIView):
    """Retrieve analytical report for a seller."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, sellerId):
        ratings = SellerRating.objects.filter(seller_id=sellerId)
        average_rating = ratings.aggregate(Avg('rating'))['rating__avg']
        total_ratings = ratings.count()
        positive_comments = ratings.filter(rating__gte=4).count()
        negative_comments = ratings.filter(rating__lte=2).count()
        return Response({
            "average_rating": average_rating,
            "total_ratings": total_ratings,
            "positive_comments": positive_comments,
            "negative_comments": negative_comments
        })

class NotificationListView(APIView):
    """Retrieve all notifications for the current user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class NotificationDetailView(APIView):
    """Retrieve, update, or delete a specific notification."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, notificationId):
        notification = get_object_or_404(Notification, id=notificationId, recipient=request.user)
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)

    def put(self, request, notificationId):
        notification = get_object_or_404(Notification, id=notificationId, recipient=request.user)
        serializer = NotificationSerializer(notification, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, notificationId):
        notification = get_object_or_404(Notification, id=notificationId, recipient=request.user)
        notification.delete()
        return Response({"message": "Notification deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class NotificationCreateView(APIView):
    """Create and send a new notification."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationSettingsView(APIView):
    """Retrieve or update user notification settings."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Example: Fetch settings from a database or cache
        settings = {
            "email_notifications": True,
            "push_notifications": True,
            "sms_notifications": False,
        }
        serializer = NotificationSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        serializer = NotificationSettingsSerializer(data=request.data)
        if serializer.is_valid():
            # Example: Save settings to a database or cache
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

