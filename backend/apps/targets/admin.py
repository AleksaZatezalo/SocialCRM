from django.contrib import admin
from .models import TargetProfile


@admin.register(TargetProfile)
class TargetProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'active', 'priority', 'location_filter', 'industry_filter', 'created_at']
    list_filter = ['active', 'priority']
    search_fields = ['name', 'description', 'location_filter', 'industry_filter']
    readonly_fields = ['id', 'created_at', 'updated_at']
