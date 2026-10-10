import uuid
from datetime import timedelta
from django.db import models
from django.contrib.postgres.fields import ArrayField


class Person(models.Model):
    """PostgreSQL model for person data with searchable fields"""
    
    LIFESTYLE_CHOICES = [
        ('minimalist', 'Minimalist'),
        ('luxury', 'Luxury'),
        ('adventurous', 'Adventurous'),
        ('traditional', 'Traditional'),
        ('balanced', 'Balanced'),
        ('bohemian', 'Bohemian'),
        ('corporate', 'Corporate'),
        ('creative', 'Creative'),
    ]
    
    AMBITION_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very_high', 'Very High'),
    ]
    
    INDICATOR_CHOICES = [
        ('builder', 'Builder'),
        ('investor', 'Investor'),
        ('middleman', 'Middleman'),
    ]
    
    # Lifestyle traits options (10 traits as requested)
    TRAIT_CHOICES = [
        'fitness-focused',
        'travel-enthusiast', 
        'foodie',
        'tech-savvy',
        'art-lover',
        'party-goer',
        'intellectual',
        'family-oriented',
        'ambitious-networker',
        'wellness-focused',
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic info
    name = models.CharField(max_length=255)
    age = models.IntegerField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    
    # Professional
    occupation = models.CharField(max_length=255, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=255, blank=True)
    
    # Custom attributes - Lifestyle
    lifestyle_type = models.CharField(max_length=50, choices=LIFESTYLE_CHOICES, blank=True)
    lifestyle_traits = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True
    )
    
    # Custom attributes - Ambition/Drive
    ambition_level = models.CharField(max_length=20, choices=AMBITION_CHOICES, default='medium')
    ambition_indicators = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True
    )
    
    # Relationship metadata
    relationship_strength = models.IntegerField(
        default=3,
        choices=[(i, str(i)) for i in range(1, 6)]
    )
    preferred_contact_frequency = models.IntegerField(
        default=30,
        help_text="Preferred days between contacts"
    )
    last_contact_date = models.DateField(null=True, blank=True)
    next_contact_date = models.DateField(
        null=True, 
        blank=True,
        help_text="Calculated or manually set date for next contact"
    )
    
    # Tagging and notes
    tags = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True
    )
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['industry']),
            models.Index(fields=['location']),
            models.Index(fields=['ambition_level']),
            models.Index(fields=['last_contact_date']),
            models.Index(fields=['next_contact_date']),
        ]
    
    def __str__(self):
        return self.name
    
    def calculate_next_contact_date(self):
        """Calculate next contact date based on last contact and frequency"""
        if self.last_contact_date and self.preferred_contact_frequency:
            return self.last_contact_date + timedelta(days=self.preferred_contact_frequency)
        return None
    
    def save(self, *args, **kwargs):
        """Auto-populate next_contact_date if not manually set"""
        # Only auto-calculate if next_contact_date is not manually set
        # Check if this is an update and next_contact_date was explicitly provided
        if not kwargs.pop('skip_auto_next_contact', False):
            if not self.next_contact_date:
                calculated = self.calculate_next_contact_date()
                if calculated:
                    self.next_contact_date = calculated
        
        super().save(*args, **kwargs)
    
    def to_neo4j_dict(self):
        """Convert to dictionary for Neo4j node creation"""
        return {
            'id': str(self.id),
            'name': self.name,
            'age': self.age,
            'location': self.location or '',
            'nationality': self.nationality or '',
            'occupation': self.occupation or '',
            'industry': self.industry or '',
            'company': self.company or '',
            'lifestyle_type': self.lifestyle_type or '',
            'lifestyle_traits': self.lifestyle_traits,
            'ambition_level': self.ambition_level,
            'ambition_indicators': self.ambition_indicators,
            'tags': self.tags,
            'relationship_strength': self.relationship_strength,
            'preferred_contact_frequency': self.preferred_contact_frequency,
            'notes': self.notes or '',
        }


class Relationship(models.Model):
    """Model to track relationships between people"""
    
    TYPE_CHOICES = [
        ('professional', 'Professional'),
        ('friend', 'Friend'),
        ('acquaintance', 'Acquaintance'),
        ('mentor', 'Mentor'),
        ('mentee', 'Mentee'),
        ('family', 'Family'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('dormant', 'Dormant'),
        ('inactive', 'Inactive'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_person = models.ForeignKey(
        Person, 
        on_delete=models.CASCADE, 
        related_name='relationships_from'
    )
    to_person = models.ForeignKey(
        Person, 
        on_delete=models.CASCADE, 
        related_name='relationships_to'
    )
    
    relationship_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='acquaintance')
    strength = models.IntegerField(
        default=3,
        choices=[(i, str(i)) for i in range(1, 6)]
    )
    context = models.TextField(
        blank=True,
        help_text="How you met or context of relationship"
    )
    since = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['from_person', 'to_person']
        indexes = [
            models.Index(fields=['from_person', 'to_person']),
            models.Index(fields=['strength']),
        ]
    
    def __str__(self):
        return f"{self.from_person.name} -> {self.to_person.name} ({self.relationship_type})"
    
    def to_neo4j_dict(self):
        """Convert to dictionary for Neo4j relationship"""
        return {
            'type': self.relationship_type,
            'strength': self.strength,
            'context': self.context or '',
            'since': self.since.isoformat() if self.since else '',
            'status': self.status,
        }
