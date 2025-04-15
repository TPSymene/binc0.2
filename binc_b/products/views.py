from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views import View
from django.http import JsonResponse

from core.models import Product, Category
from .serializers import ProductListSerializer, ProductDetailSerializer, CategorySerializer


class ProductListView(APIView):
    """List all products based on user permissions."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type == 'owner':
            products = Product.objects.filter(shop__owner__user=request.user)
        elif request.user.user_type == 'admin':
            products = Product.objects.all()
        else:
            products = Product.objects.filter(is_active=True)

        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class ProductDetailView(APIView):
    """Retrieve details of a specific product."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk, is_active=True)
        serializer = ProductDetailSerializer(product)
        return Response(serializer.data)


class ProductCreateView(APIView):
    """Create a new product."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.user_type not in ['owner', 'admin']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductDetailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(shop=request.user.owner_profile.shop)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductUpdateView(APIView):
    """Update a product."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        if request.user.user_type == 'owner' and product.shop.owner.user != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductDetailSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDeleteView(APIView):
    """Delete a product."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        if request.user.user_type == 'owner' and product.shop.owner.user != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        product.delete()
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class FeaturedProductsView(APIView):
    """Retrieve featured products."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        products = Product.objects.filter(is_featured=True, is_active=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class ProductSearchView(APIView):
    """Search for products with filters."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.GET.get('query', '')
        category_id = request.GET.get('category', None)
        brand = request.GET.get('brand', None)

        products = Product.objects.filter(is_active=True)
        if query:
            products = products.filter(name__icontains=query)
        if category_id:
            products = products.filter(category_id=category_id)
        if brand:
            products = products.filter(brand__name__icontains=brand)

        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class RecentlyViewedProductsView(View):
    def get(self, request, *args, **kwargs):
        # Example response for recently viewed products
        return JsonResponse({"recently_viewed": []})
