from django.core.management.base import BaseCommand
from apps.people.models import Person, Relationship
from services.neo4j_service import Neo4jService


class Command(BaseCommand):
    help = 'Sync all people and relationships to Neo4j'

    def handle(self, *args, **options):
        self.stdout.write('Starting Neo4j sync...')
        
        # Sync all people
        people = Person.objects.all()
        self.stdout.write(f'Syncing {people.count()} people...')
        
        for person in people:
            try:
                # Check if person exists in Neo4j
                existing = Neo4jService.get_person_node(str(person.id))
                
                person_data = {
                    'id': str(person.id),
                    'name': person.name,
                    'location': person.location or '',
                    'occupation': person.occupation or '',
                    'industry': person.industry or '',
                    'company': person.company or '',
                    'age': person.age or 0,
                    'nationality': person.nationality or '',
                    'lifestyle_type': person.lifestyle_type or '',
                    'lifestyle_traits': person.lifestyle_traits or [],
                    'ambition_level': person.ambition_level or 'medium',
                    'ambition_indicators': person.ambition_indicators or [],
                    'tags': person.tags or [],
                    'relationship_strength': person.relationship_strength or 3,
                    'preferred_contact_frequency': person.preferred_contact_frequency or '',
                    'notes': person.notes or '',
                }
                
                if existing:
                    Neo4jService.update_person_node(str(person.id), person_data)
                    self.stdout.write(f'Updated: {person.name}')
                else:
                    Neo4jService.create_person_node(person_data)
                    self.stdout.write(self.style.SUCCESS(f'Created: {person.name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error syncing {person.name}: {e}'))
        
        # Sync all relationships
        relationships = Relationship.objects.all()
        self.stdout.write(f'\nSyncing {relationships.count()} relationships...')
        
        for rel in relationships:
            try:
                Neo4jService.create_relationship(
                    str(rel.from_person.id),
                    str(rel.to_person.id),
                    rel.to_neo4j_dict()
                )
                self.stdout.write(self.style.SUCCESS(
                    f'Created: {rel.from_person.name} -> {rel.to_person.name}'
                ))
            except Exception as e:
                # Relationship might already exist, that's ok
                if 'already exists' not in str(e).lower():
                    self.stdout.write(self.style.WARNING(
                        f'Relationship {rel.from_person.name} -> {rel.to_person.name}: {e}'
                    ))
        
        self.stdout.write(self.style.SUCCESS('\nSync complete!'))
