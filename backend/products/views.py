from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import ProductForm, Sales, Dashboard
from .serializers import ProductFormSerializer, SalesSerializer, DashboardSerializer

User = get_user_model()


class ProductFormViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing products with dynamic form fields.
    """
    queryset = ProductForm.objects.all()
    serializer_class = ProductFormSerializer
    lookup_field = 'product_id'
    
    def get_queryset(self):
        """Filter products by authenticated user"""
        if self.request.user.is_authenticated:
            return ProductForm.objects.filter(user=self.request.user)
        return ProductForm.objects.all()
    
    def perform_create(self, serializer):
        """Automatically assign current user"""
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # Use anonymous user for development
            default_user, _ = User.objects.get_or_create(
                username='anonymous',
                defaults={'email': 'anonymous@example.com'}
            )
            serializer.save(user=default_user)
    
    @action(detail=True, methods=['get'])
    def sales_summary(self, request, product_id=None):
        """Get sales summary for a specific product"""
        product = self.get_object()
        sales = product.sales.all()
        
        summary = {
            'total_sales': sales.aggregate(total=Sum('sales_amount'))['total'] or 0,
            'total_quantity': sales.aggregate(total=Sum('quantity'))['total'] or 0,
            'sales_count': sales.count(),
            'average_sale': sales.aggregate(avg=Avg('sales_amount'))['avg'] or 0,
            'recent_sales': SalesSerializer(sales[:5], many=True).data
        }
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get products grouped by type"""
        product_type = request.query_params.get('type')
        if product_type:
            products = self.get_queryset().filter(product_type=product_type)
        else:
            products = self.get_queryset()
        
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class SalesViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing sales records.
    """
    queryset = Sales.objects.all()
    serializer_class = SalesSerializer
    lookup_field = 'sales_id'
    
    def get_queryset(self):
        """Filter sales by user's products"""
        if self.request.user.is_authenticated:
            return Sales.objects.filter(product__user=self.request.user)
        return Sales.objects.all()
    
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get sales for a specific product"""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sales = self.get_queryset().filter(product_id=product_id)
        serializer = self.get_serializer(sales, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get sales analytics across all products"""
        queryset = self.get_queryset()
        
        analytics = {
            'total_revenue': queryset.aggregate(total=Sum('sales_amount'))['total'] or 0,
            'total_sales': queryset.count(),
            'total_quantity': queryset.aggregate(total=Sum('quantity'))['total'] or 0,
            'average_sale': queryset.aggregate(avg=Avg('sales_amount'))['avg'] or 0,
            'by_product': queryset.values('product__product_name').annotate(
                total=Sum('sales_amount'),
                count=Count('sales_id')
            )
        }
        
        return Response(analytics)


class DashboardViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing user dashboards.
    """
    queryset = Dashboard.objects.all()
    serializer_class = DashboardSerializer
    lookup_field = 'dashboard_id'
    
    def get_queryset(self):
        """Filter dashboards by authenticated user"""
        if self.request.user.is_authenticated:
            return Dashboard.objects.filter(user=self.request.user)
        return Dashboard.objects.all()
    
    def perform_create(self, serializer):
        """Automatically assign current user and product name"""
        product = serializer.validated_data.get('product')
        if self.request.user.is_authenticated:
            serializer.save(
                user=self.request.user,
                product_name=product.product_name if product else ''
            )
        else:
            default_user, _ = User.objects.get_or_create(
                username='anonymous',
                defaults={'email': 'anonymous@example.com'}
            )
            serializer.save(
                user=default_user,
                product_name=product.product_name if product else ''
            )
    
    @action(detail=True, methods=['get'])
    def data(self, request, dashboard_id=None):
        """Get dashboard data including product and sales information"""
        dashboard = self.get_object()
        product = dashboard.product
        
        data = {
            'dashboard': self.get_serializer(dashboard).data,
            'product': ProductFormSerializer(product).data,
            'sales_summary': {
                'total_sales': product.sales.aggregate(total=Sum('sales_amount'))['total'] or 0,
                'sales_count': product.sales.count(),
                'recent_sales': SalesSerializer(product.sales.all()[:10], many=True).data
            }
        }
        
        return Response(data)
