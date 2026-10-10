from rest_framework import serializers
from .models import TargetProfile


class TargetProfileSerializer(serializers.ModelSerializer):
    """Serializer for TargetProfile model"""
    match_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = TargetProfile
        fields = [
            'id', 'name', 'description', 'active', 'priority',
            'location_filter', 'industry_filter', 'required_tags',
            'ambition_levels', 'ambition_indicators', 'lifestyle_types',
            'min_relationship_strength', 'match_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TargetProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating target profiles"""
    
    class Meta:
        model = TargetProfile
        fields = [
            'name', 'description', 'active', 'priority',
            'location_filter', 'industry_filter', 'required_tags',
            'ambition_levels', 'ambition_indicators', 'lifestyle_types',
            'min_relationship_strength'
        ]
