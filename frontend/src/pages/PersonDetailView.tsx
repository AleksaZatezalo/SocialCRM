import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { peopleApi, relationshipsApi } from '../services/api';
import type { Person, PersonUpdate, RelationshipCreate } from '../types';

const PersonDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddConnection, setShowAddConnection] = useState(false);

  // Fetch person data
  const { data: person, isLoading, error } = useQuery({
    queryKey: ['person', id],
    queryFn: () => peopleApi.getById(id!),
    enabled: !!id,
  });

  // Fetch relationships
  const { data: relationships } = useQuery({
    queryKey: ['relationships', id],
    queryFn: () => relationshipsApi.forPerson(id!),
    enabled: !!id,
  });

  // Fetch all people for connection dropdown
  const { data: allPeople } = useQuery({
    queryKey: ['people'],
    queryFn: peopleApi.getAll,
  });

  // Fetch choices for dropdowns
  const { data: choices } = useQuery({
    queryKey: ['choices'],
    queryFn: peopleApi.getChoices,
  });

  // Form state
  const [formData, setFormData] = useState<PersonUpdate>({});
  const [newConnection, setNewConnection] = useState<Partial<RelationshipCreate>>({
    relationship_type: 'professional',
    strength: 3,
    status: 'active',
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PersonUpdate }) =>
      peopleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['person', id] });
      queryClient.invalidateQueries({ queryKey: ['people'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: peopleApi.delete,
    onSuccess: () => {
      navigate('/people');
    },
  });

  const createConnectionMutation = useMutation({
    mutationFn: relationshipsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', id] });
      queryClient.invalidateQueries({ queryKey: ['network-graph'] });
      setShowAddConnection(false);
      setNewConnection({
        relationship_type: 'professional',
        strength: 3,
        status: 'active',
      });
    },
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: relationshipsApi.delete,
    onSuccess: () => {
      console.log('Delete mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['relationships', id] });
      queryClient.invalidateQueries({ queryKey: ['network-graph'] });
    },
    onError: (error) => {
      console.error('Failed to delete connection:', error);
      alert('Failed to delete connection. Please try again.');
    },
  });

  // Initialize form data when person loads
  React.useEffect(() => {
    if (person && !isEditing) {
      setFormData({
        name: person.name,
        age: person.age,
        location: person.location,
        nationality: person.nationality,
        occupation: person.occupation,
        industry: person.industry,
        company: person.company,
        lifestyle_type: person.lifestyle_type,
        lifestyle_traits: person.lifestyle_traits,
        ambition_level: person.ambition_level,
        ambition_indicators: person.ambition_indicators,
        tags: person.tags,
        notes: person.notes,
        relationship_strength: person.relationship_strength,
        preferred_contact_frequency: person.preferred_contact_frequency,
        last_contact_date: person.last_contact_date,
      });
    }
  }, [person, isEditing]);

  const handleSave = () => {
    if (id) {
      updateMutation.mutate({ id, data: formData });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${person?.name}?`)) {
      if (id) {
        deleteMutation.mutate(id);
      }
    }
  };

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConnection.to_person) {
      createConnectionMutation.mutate({
        from_person: id!,
        to_person: newConnection.to_person,
        relationship_type: newConnection.relationship_type!,
        strength: newConnection.strength!,
        status: newConnection.status!,
        context: newConnection.context,
      });
    }
  };

  // Helper function to get relationship strength label
  const getRelationshipStrengthLabel = (strength: number): string => {
    const strengthChoice = choices?.relationship_strengths?.find(c => c.value === strength);
    return strengthChoice?.label || `${strength}/5`;
  };

  // Helper to toggle array values
  const toggleArrayValue = (array: string[] | undefined, value: string): string[] => {
    const current = array || [];
    if (current.includes(value)) {
      return current.filter(v => v !== value);
    } else {
      return [...current, value];
    }
  };

  if (isLoading) return <div className="container"><div className="loading">Loading...</div></div>;
  if (error) return <div className="container"><div className="error">Error loading person</div></div>;
  if (!person) return <div className="container"><div className="error">Person not found</div></div>;

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/people" style={{ color: '#3498db', textDecoration: 'none' }}>
          ← Back to People
        </Link>
      </div>

      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>{person.name}</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="btn-primary">
                  Edit
                </button>
                <button onClick={handleDelete} className="btn-danger">
                  Delete
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} className="btn-primary">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Info */}
        <div>
          {/* Basic Information */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Basic Information</h2>
            {isEditing ? (
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <label>Age</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                />

                <label>Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />

                <label>Nationality</label>
                <input
                  type="text"
                  value={formData.nationality || ''}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <p><strong>Age:</strong> {person.age || 'N/A'}</p>
                <p><strong>Location:</strong> {person.location || 'N/A'}</p>
                <p><strong>Nationality:</strong> {person.nationality || 'N/A'}</p>
              </div>
            )}
          </div>

          {/* Professional */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Professional</h2>
            {isEditing ? (
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  value={formData.occupation || ''}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                />

                <label>Industry</label>
                <input
                  type="text"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />

                <label>Company</label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <p><strong>Occupation:</strong> {person.occupation || 'N/A'}</p>
                <p><strong>Industry:</strong> {person.industry || 'N/A'}</p>
                <p><strong>Company:</strong> {person.company || 'N/A'}</p>
              </div>
            )}
          </div>

          {/* Lifestyle & Ambition */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Lifestyle & Ambition</h2>
            {isEditing ? (
              <div className="form-group">
                <label>Lifestyle Type</label>
                <select
                  value={formData.lifestyle_type || ''}
                  onChange={(e) => setFormData({ ...formData, lifestyle_type: e.target.value })}
                >
                  <option value="">Select...</option>
                  {choices?.lifestyle_types?.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>

                <label>Lifestyle Traits</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {choices?.lifestyle_traits?.map((trait) => (
                    <label
                      key={trait.value}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: (formData.lifestyle_traits || []).includes(trait.value as string) ? '#3498db' : '#ecf0f1',
                        color: (formData.lifestyle_traits || []).includes(trait.value as string) ? 'white' : '#2c3e50',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(formData.lifestyle_traits || []).includes(trait.value as string)}
                        onChange={() => setFormData({
                          ...formData,
                          lifestyle_traits: toggleArrayValue(formData.lifestyle_traits, trait.value as string)
                        })}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {trait.label}
                    </label>
                  ))}
                </div>

                <label>Ambition Level</label>
                <select
                  value={formData.ambition_level || 'medium'}
                  onChange={(e) => setFormData({ ...formData, ambition_level: e.target.value })}
                >
                  {choices?.ambition_levels?.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>

                <label>Ambition Indicators</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {choices?.ambition_indicators?.map((indicator) => (
                    <label
                      key={indicator.value}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: (formData.ambition_indicators || []).includes(indicator.value as string) ? '#e74c3c' : '#ecf0f1',
                        color: (formData.ambition_indicators || []).includes(indicator.value as string) ? 'white' : '#2c3e50',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(formData.ambition_indicators || []).includes(indicator.value as string)}
                        onChange={() => setFormData({
                          ...formData,
                          ambition_indicators: toggleArrayValue(formData.ambition_indicators, indicator.value as string)
                        })}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {indicator.label}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p><strong>Lifestyle:</strong> {person.lifestyle_type || 'N/A'}</p>
                <p><strong>Lifestyle Traits:</strong> {person.lifestyle_traits?.join(', ') || 'N/A'}</p>
                <p><strong>Ambition:</strong> {person.ambition_level || 'N/A'}</p>
                <p><strong>Ambition Indicators:</strong> {person.ambition_indicators?.join(', ') || 'N/A'}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card">
            <h2>Notes</h2>
            {isEditing ? (
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={5}
                style={{ width: '100%' }}
              />
            ) : (
              <p>{person.notes || 'No notes'}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Relationship Metadata */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3>My Relationship</h3>
            {isEditing ? (
              <div className="form-group">
                <label>Strength</label>
                <select
                  value={formData.relationship_strength || 3}
                  onChange={(e) => setFormData({ ...formData, relationship_strength: parseInt(e.target.value) })}
                >
                  {choices?.relationship_strengths?.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>

                <label>Contact Frequency (days)</label>
                <input
                  type="number"
                  value={formData.preferred_contact_frequency || 30}
                  onChange={(e) => setFormData({ ...formData, preferred_contact_frequency: parseInt(e.target.value) })}
                />

                <label>Last Contact</label>
                <input
                  type="date"
                  value={formData.last_contact_date || ''}
                  onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value })}
                />

                <label>Next Contact</label>
                <input
                  type="date"
                  value={formData.next_contact_date || ''}
                  onChange={(e) => setFormData({ ...formData, next_contact_date: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <p><strong>Strength:</strong> {getRelationshipStrengthLabel(person.relationship_strength)}</p>
                <p><strong>Contact Frequency:</strong> Every {person.preferred_contact_frequency} days</p>
                <p><strong>Last Contact:</strong> {person.last_contact_date || 'Never'}</p>
                <p><strong>Next Contact:</strong> {person.next_contact_date ? (
                  <span style={{ color: new Date(person.next_contact_date) < new Date() ? '#e74c3c' : '#27ae60' }}>
                    {new Date(person.next_contact_date).toLocaleDateString()}
                    {new Date(person.next_contact_date) < new Date() && ' (overdue)'}
                  </span>
                ) : 'Not set'}</p>
              </div>
            )}
          </div>

          {/* Connections */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Connections</h3>
              <button onClick={() => setShowAddConnection(true)} className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                + Add
              </button>
            </div>

            {showAddConnection && (
              <form onSubmit={handleAddConnection} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div className="form-group">
                  <label>Person *</label>
                  <select
                    value={newConnection.to_person || ''}
                    onChange={(e) => setNewConnection({ ...newConnection, to_person: e.target.value })}
                    required
                  >
                    <option value="">Select person...</option>
                    {allPeople
                      ?.filter((p: Person) => p.id !== id)
                      .map((p: Person) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>

                  <label>Type *</label>
                  <select
                    value={newConnection.relationship_type}
                    onChange={(e) => setNewConnection({ ...newConnection, relationship_type: e.target.value })}
                  >
                    <option value="professional">Professional</option>
                    <option value="friend">Friend</option>
                    <option value="acquaintance">Acquaintance</option>
                    <option value="mentor">Mentor</option>
                    <option value="mentee">Mentee</option>
                    <option value="family">Family</option>
                  </select>

                  <label>Strength (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newConnection.strength}
                    onChange={(e) => setNewConnection({ ...newConnection, strength: parseInt(e.target.value) })}
                  />

                  <label>Context</label>
                  <input
                    type="text"
                    placeholder="How they know each other..."
                    value={newConnection.context || ''}
                    onChange={(e) => setNewConnection({ ...newConnection, context: e.target.value })}
                  />

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn-primary">Create</button>
                    <button
                      type="button"
                      onClick={() => setShowAddConnection(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {!relationships || relationships?.length === 0 ? (
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No connections yet</p>
              ) : (
                relationships?.map((rel: any) => {
                  const otherPerson = rel.from_person === id ? rel.to_person_detail : rel.from_person_detail;
                  return (
                    <div
                      key={rel.id}
                      style={{
                        padding: '0.75rem',
                        borderBottom: '1px solid #ecf0f1',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Link
                          to={`/people/${otherPerson.id}`}
                          style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#3498db', textDecoration: 'none' }}
                        >
                          {otherPerson.name}
                        </Link>
                        <div style={{ fontSize: '0.875rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                          Strength: {rel.strength}/5
                        </div>
                        {rel.context && (
                          <div style={{ fontSize: '0.875rem', color: '#95a5a6', marginTop: '0.25rem' }}>
                            {rel.context}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (window.confirm(`Delete connection with ${otherPerson.name}?`)) {
                            console.log('Deleting connection:', rel.id);
                            deleteConnectionMutation.mutate(rel.id);
                          }
                        }}
                        style={{
                          background: '#fee',
                          border: '1px solid #e74c3c',
                          borderRadius: '4px',
                          color: '#e74c3c',
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0',
                          lineHeight: '1',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e74c3c';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fee';
                          e.currentTarget.style.color = '#e74c3c';
                        }}
                        title="Delete connection"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetailView;
