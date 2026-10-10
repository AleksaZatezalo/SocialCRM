from django.contrib import admin
from .models import Person, Relationship


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ['name', 'occupation', 'industry', 'location', 'ambition_level', 'relationship_strength', 'created_at']
    list_filter = ['ambition_level', 'lifestyle_type', 'industry', 'relationship_strength']
    search_fields = ['name', 'occupation', 'company', 'tags']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Relationship)
class RelationshipAdmin(admin.ModelAdmin):
    list_display = ['from_person', 'to_person', 'relationship_type', 'strength', 'status', 'created_at']
    list_filter = ['relationship_type', 'strength', 'status']
    search_fields = ['from_person__name', 'to_person__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
