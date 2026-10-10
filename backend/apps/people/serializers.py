from rest_framework import serializers
from .models import Person, Relationship


class PersonSerializer(serializers.ModelSerializer):
    """Serializer for Person model"""
    
    class Meta:
        model = Person
        fields = [
            'id', 'name', 'age', 'location', 'nationality',
            'occupation', 'industry', 'company',
            'lifestyle_type', 'lifestyle_traits',
            'ambition_level', 'ambition_indicators',
            'relationship_strength', 'preferred_contact_frequency',
            'last_contact_date', 'next_contact_date', 'tags', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PersonListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    
    class Meta:
        model = Person
        fields = [
            'id', 'name', 'occupation', 'industry', 'location',
            'ambition_level', 'ambition_indicators', 'relationship_strength', 
            'last_contact_date', 'next_contact_date', 'tags', 'created_at'
        ]


class RelationshipSerializer(serializers.ModelSerializer):
    """Serializer for Relationship model"""
    from_person_name = serializers.CharField(source='from_person.name', read_only=True)
    to_person_name = serializers.CharField(source='to_person.name', read_only=True)
    from_person_detail = PersonListSerializer(source='from_person', read_only=True)
    to_person_detail = PersonListSerializer(source='to_person', read_only=True)
    
    class Meta:
        model = Relationship
        fields = [
            'id', 'from_person', 'to_person',
            'from_person_name', 'to_person_name',
            'from_person_detail', 'to_person_detail',
            'relationship_type', 'strength', 'context',
            'since', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PersonConnectionSerializer(serializers.Serializer):
    """Serializer for person with their connections"""
    person = PersonSerializer()
    connections = serializers.ListField()
    connection_count = serializers.IntegerField()
