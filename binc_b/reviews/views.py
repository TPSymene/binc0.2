from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Review
from .serializers import CreateReviewSerializer, ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    """API view for listing and creating reviews for a product."""
    
    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs['product_id'])
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateReviewSerializer
        return ReviewSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['product_id'] = self.kwargs['product_id']
        return context
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]  # السماح فقط للمستخدمين المسجلين بإنشاء مراجعات
        return [permissions.AllowAny()]  # السماح للجميع بعرض المراجعات
