from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import FormSchema, FormSubmission
from .serializers import (
    FormSchemaSerializer, 
    FormSubmissionSerializer,
    FormSubmissionListSerializer
)


class FormSchemaViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing form schemas.
    
    - list: Get all forms created by the user
    - create: Create a new form schema
    - retrieve: Get a specific form by slug
    - update: Update form structure
    - destroy: Delete a form
    """
    queryset = FormSchema.objects.all()
    serializer_class = FormSchemaSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Filter forms by the authenticated user"""
        if self.request.user.is_authenticated:
            return FormSchema.objects.filter(created_by=self.request.user)
        # For unauthenticated users (development), return all forms
        return FormSchema.objects.all()
    
    def perform_create(self, serializer):
        """Automatically assign the current user as the creator"""
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            # For unauthenticated requests, use a default user or create one
            from django.contrib.auth import get_user_model
            User = get_user_model()
            default_user, _ = User.objects.get_or_create(
                username='anonymous',
                defaults={'email': 'anonymous@example.com'}
            )
            serializer.save(created_by=default_user)
    
    @action(detail=True, methods=['get'])
    def public(self, request, slug=None):
        """
        Public endpoint to retrieve form structure by slug.
        This is used by the frontend to render the form for end users.
        No authentication required.
        """
        form = get_object_or_404(FormSchema, slug=slug)
        serializer = self.get_serializer(form)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def submissions(self, request, slug=None):
        """
        Get all submissions for a specific form.
        Used by the dashboard view.
        """
        form = self.get_object()
        submissions = form.submissions.all()
        
        # Apply search filter if provided
        search = request.query_params.get('search', None)
        if search:
            # Search across all JSON data fields (PostgreSQL specific)
            submissions = submissions.filter(
                data__icontains=search
            )
        
        # Apply field-specific filters
        # Example: ?filter_field_1=John&filter_field_2=Option A
        for key, value in request.query_params.items():
            if key.startswith('filter_'):
                field_id = key.replace('filter_', '')
                # Use JSONField contains lookup
                submissions = submissions.filter(
                    data__contains={field_id: value}
                )
        
        serializer = FormSubmissionListSerializer(submissions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related_data(self, request, slug=None):
        """
        Get data from a related form to populate dropdowns.
        Used when rendering relationship fields.
        """
        target_slug = request.query_params.get('target_slug')
        display_field = request.query_params.get('display_field')
        
        if not target_slug:
            return Response(
                {'error': 'target_slug parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        target_form = get_object_or_404(FormSchema, slug=target_slug)
        submissions = target_form.submissions.all()
        
        # Extract the display field values
        options = []
        for submission in submissions:
            if display_field in submission.data:
                options.append({
                    'id': submission.id,
                    'label': submission.data[display_field]
                })
        
        return Response(options)


class FormSubmissionViewSet(viewsets.ModelViewSet):
    """
    API endpoints for form submissions.
    
    - list: Get all submissions (filtered by user's forms)
    - create: Submit a new form response
    - retrieve: Get a specific submission
    """
    queryset = FormSubmission.objects.all()
    serializer_class = FormSubmissionSerializer
    
    def get_queryset(self):
        """Only show submissions for forms the user owns"""
        if self.request.user.is_authenticated:
            return FormSubmission.objects.filter(
                form_schema__created_by=self.request.user
            )
        return FormSubmission.objects.none()
    
    def create(self, request, *args, **kwargs):
        """
        Handle form submission.
        This endpoint is public and doesn't require authentication.
        """
        # Get the form slug from the request
        slug = request.data.get('slug')
        if not slug:
            return Response(
                {'error': 'Form slug is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the form schema
        form_schema = get_object_or_404(FormSchema, slug=slug)
        
        # Prepare submission data
        submission_data = {
            'form_schema': form_schema.id,
            'data': request.data.get('data', {}),
            'ip_address': self.get_client_ip(request)
        }
        
        if request.user.is_authenticated:
            submission_data['submitted_by'] = request.user.id
        
        serializer = self.get_serializer(data=submission_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(
            {
                'message': 'Form submitted successfully',
                'submission_id': serializer.data['id']
            },
            status=status.HTTP_201_CREATED
        )
    
    def get_client_ip(self, request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
