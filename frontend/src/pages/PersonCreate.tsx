import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { peopleApi } from '../services/api';
import type { PersonCreate as PersonCreateType } from '../types';

const PersonCreate: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: choices } = useQuery({
    queryKey: ['choices'],
    queryFn: peopleApi.getChoices,
  });

  const [formData, setFormData] = useState<PersonCreateType>({
    name: '',
    age: undefined,
    location: '',
    nationality: '',
    occupation: '',
    industry: '',
    company: '',
    lifestyle_type: '',
    lifestyle_traits: [],
    ambition_level: 'medium',
    ambition_indicators: [],
    relationship_strength: 3,
    preferred_contact_frequency: 30,
    tags: [],
    notes: '',
  });

  const [currentTag, setCurrentTag] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: peopleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      navigate('/people');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      lifestyle_traits: selectedTraits,
      ambition_indicators: selectedIndicators,
      age: formData.age || undefined,
    };
    createMutation.mutate(dataToSubmit);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), currentTag.trim()],
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || [],
    });
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const toggleIndicator = (indicator: string) => {
    setSelectedIndicators(prev =>
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Add New Person</h1>

      {createMutation.isError && (
        <div className="error">
          Failed to create person. Please check all fields and try again.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 className="card-title">Basic Information</h2>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Age"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Belgrade, Serbia"
              />
            </div>

            <div className="form-group">
              <label>Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="e.g., Serbian"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Professional</h2>
          <div className="grid grid-3">
            <div className="form-group">
              <label>Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g., Entrepreneur"
              />
            </div>

            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Technology, Media"
              />
            </div>

            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Lifestyle Indicators</h2>
          
          <div className="form-group">
            <label>Lifestyle Type</label>
            <select
              value={formData.lifestyle_type}
              onChange={(e) => setFormData({ ...formData, lifestyle_type: e.target.value })}
            >
              <option value="">Select lifestyle type...</option>
              {choices?.lifestyle_types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Lifestyle Traits (select multiple)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
              {choices?.lifestyle_traits.map(trait => (
                <label key={trait.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedTraits.includes(trait.value as string)}
                    onChange={() => toggleTrait(trait.value as string)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {trait.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Ambition & Drive</h2>
          
          <div className="form-group">
            <label>Ambition Level</label>
            <select
              value={formData.ambition_level}
              onChange={(e) => setFormData({ ...formData, ambition_level: e.target.value })}
            >
              {choices?.ambition_levels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ambition Indicators (select multiple)</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {choices?.ambition_indicators.map(indicator => (
                <label key={indicator.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedIndicators.includes(indicator.value as string)}
                    onChange={() => toggleIndicator(indicator.value as string)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {indicator.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Relationship</h2>
          
          <div className="grid grid-2">
            <div className="form-group">
              <label>Relationship Strength</label>
              <select
                value={formData.relationship_strength}
                onChange={(e) => setFormData({ ...formData, relationship_strength: parseInt(e.target.value) })}
              >
                {choices?.relationship_strengths.map(strength => (
                  <option key={strength.value} value={strength.value}>
                    {strength.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Contact Frequency (days)</label>
              <input
                type="number"
                value={formData.preferred_contact_frequency}
                onChange={(e) => setFormData({ ...formData, preferred_contact_frequency: parseInt(e.target.value) })}
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Tags & Notes</h2>
          
          <div className="form-group">
            <label>Tags</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag and press Enter"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-secondary"
              >
                Add Tag
              </button>
            </div>
            <div className="tag-list">
              {formData.tags?.map(tag => (
                <span key={tag} className="tag" style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)}>
                  {tag} ×
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Any additional notes about this person..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/people')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Person'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonCreate;
