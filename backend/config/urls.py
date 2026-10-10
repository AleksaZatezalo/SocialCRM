from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from apps.people.views import RelationshipViewSet

# Create router for relationships at top level
relationship_router = DefaultRouter()
relationship_router.register(r'relationships', RelationshipViewSet, basename='relationship')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/people/', include('apps.people.urls')),
    path('api/', include(relationship_router.urls)),
    path('api/interactions/', include('apps.interactions.urls')),
    path('api/targets/', include('apps.targets.urls')),
    path('api/goals/', include('apps.goals.urls')),
    path('api/queries/', include('apps.queries.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]
