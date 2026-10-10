import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField


class TargetProfile(models.Model):
    """Target profile for matching people to your networking goals"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Name of target profile (e.g., 'Tech Entrepreneurs in Serbia')")
    description = models.TextField(blank=True, help_text="Optional description of what you're looking for")
    active = models.BooleanField(default=True, help_text="Whether this profile is actively being tracked")
    priority = models.IntegerField(default=1, help_text="Priority/importance of this target (1-5)")
    
    # Criteria stored as simple fields for easy querying
    location_filter = models.CharField(max_length=255, blank=True, help_text="Location to match (e.g., 'Serbia', 'Belgrade')")
    industry_filter = models.CharField(max_length=100, blank=True, help_text="Industry to match (e.g., 'Technology', 'Media')")
    
    required_tags = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True,
        help_text="Tags that must be present"
    )
    
    ambition_levels = ArrayField(
        models.CharField(max_length=20),
        default=list,
        blank=True,
        help_text="Acceptable ambition levels (e.g., ['high', 'very_high'])"
    )
    
    ambition_indicators = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True,
        help_text="Acceptable ambition indicators (e.g., ['builder', 'investor'])"
    )
    
    lifestyle_types = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True,
        help_text="Acceptable lifestyle types"
    )
    
    min_relationship_strength = models.IntegerField(
        null=True,
        blank=True,
        help_text="Minimum relationship strength (1-5)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['active', 'priority']),
        ]
    
    def __str__(self):
        return f"{self.name} ({'Active' if self.active else 'Inactive'})"
