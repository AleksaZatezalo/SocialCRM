from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Person, Relationship
from .serializers import (
    PersonSerializer, 
    PersonListSerializer,
    RelationshipSerializer
)
from services.neo4j_service import Neo4jService


class PersonViewSet(viewsets.ModelViewSet):
    """ViewSet for Person CRUD operations"""
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PersonListSerializer
        return PersonSerializer
    
    @transaction.atomic
    def perform_create(self, serializer):
        """Create person in both PostgreSQL and Neo4j"""
        person = serializer.save()
        
        # Create node in Neo4j
        try:
            Neo4jService.create_person_node(person.to_neo4j_dict())
        except Exception as e:
            # Rollback will happen automatically
            raise Exception(f"Failed to create Neo4j node: {str(e)}")
    
    @transaction.atomic
    def perform_update(self, serializer):
        """Update person in both PostgreSQL and Neo4j"""
        person = serializer.save()
        
        # Update node in Neo4j
        try:
            Neo4jService.update_person_node(
                str(person.id),
                person.to_neo4j_dict()
            )
        except Exception as e:
            raise Exception(f"Failed to update Neo4j node: {str(e)}")
    
    @transaction.atomic
    def perform_destroy(self, instance):
        """Delete person from both PostgreSQL and Neo4j"""
        person_id = str(instance.id)
        
        # Delete from Neo4j first
        try:
            Neo4jService.delete_person_node(person_id)
        except Exception as e:
            raise Exception(f"Failed to delete Neo4j node: {str(e)}")
        
        # Delete from PostgreSQL
        instance.delete()
    
    @action(detail=True, methods=['get'])
    def connections(self, request, pk=None):
        """Get all connections for a person"""
        person = self.get_object()
        
        try:
            connections = Neo4jService.get_person_connections(str(person.id))
            
            return Response({
                'person': PersonSerializer(person).data,
                'connections': connections,
                'connection_count': len(connections)
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def choices(self, request):
        """Get available choices for dropdowns"""
        return Response({
            'lifestyle_types': [
                {'value': choice[0], 'label': choice[1]}
                for choice in Person.LIFESTYLE_CHOICES
            ],
            'ambition_levels': [
                {'value': choice[0], 'label': choice[1]}
                for choice in Person.AMBITION_CHOICES
            ],
            'ambition_indicators': [
                {'value': choice[0], 'label': choice[1]}
                for choice in Person.INDICATOR_CHOICES
            ],
            'lifestyle_traits': [
                {'value': trait, 'label': trait.replace('-', ' ').title()}
                for trait in Person.TRAIT_CHOICES
            ],
            'relationship_strengths': [
                {'value': i, 'label': f'{i} - {"⭐" * i}'}
                for i in range(1, 6)
            ]
        })


class RelationshipViewSet(viewsets.ModelViewSet):
    """ViewSet for Relationship CRUD operations"""
    queryset = Relationship.objects.all()
    serializer_class = RelationshipSerializer
    
    @transaction.atomic
    def perform_create(self, serializer):
        """Create relationship in both PostgreSQL and Neo4j"""
        relationship = serializer.save()
        
        # Create relationship in Neo4j
        try:
            Neo4jService.create_relationship(
                str(relationship.from_person.id),
                str(relationship.to_person.id),
                relationship.to_neo4j_dict()
            )
        except Exception as e:
            raise Exception(f"Failed to create Neo4j relationship: {str(e)}")
    
    @transaction.atomic
    def perform_destroy(self, instance):
        """Delete relationship from both PostgreSQL and Neo4j"""
        # Delete from Neo4j first
        try:
            Neo4jService.delete_relationship(
                str(instance.from_person.id),
                str(instance.to_person.id)
            )
        except Exception as e:
            print(f"Warning: Failed to delete Neo4j relationship: {str(e)}")
        
        # Delete from PostgreSQL
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def for_person(self, request):
        """Get all relationships for a specific person"""
        person_id = request.query_params.get('person_id')
        if not person_id:
            return Response(
                {'error': 'person_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        relationships = Relationship.objects.filter(
            from_person_id=person_id
        ) | Relationship.objects.filter(
            to_person_id=person_id
        )
        
        serializer = self.get_serializer(relationships, many=True)
        return Response(serializer.data)
