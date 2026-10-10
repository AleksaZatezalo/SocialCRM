import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { peopleApi } from '../services/api';

const PersonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: person, isLoading, error } = useQuery({
    queryKey: ['person', id],
    queryFn: () => peopleApi.getById(id!),
    enabled: !!id,
  });

  const { data: connections } = useQuery({
    queryKey: ['connections', id],
    queryFn: () => peopleApi.getConnections(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => peopleApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      navigate('/people');
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${person?.name}?`)) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="container"><div className="loading">Loading...</div></div>;
  }

  if (error || !person) {
    return (
      <div className="container">
        <div className="error">Failed to load person details.</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link to="/people" style={{ color: '#7f8c8d', textDecoration: 'none', marginBottom: '0.5rem', display: 'block' }}>
            ← Back to People
          </Link>
          <h1>{person.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        <div>
          <div className="card">
            <h2 className="card-title">Basic Information</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {person.age && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Age</div>
                  <div>{person.age}</div>
                </div>
              )}
              {person.location && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Location</div>
                  <div>{person.location}</div>
                </div>
              )}
              {person.nationality && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Nationality</div>
                  <div>{person.nationality}</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Professional</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {person.occupation && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Occupation</div>
                  <div>{person.occupation}</div>
                </div>
              )}
              {person.industry && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Industry</div>
                  <div>{person.industry}</div>
                </div>
              )}
              {person.company && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Company</div>
                  <div>{person.company}</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Lifestyle</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {person.lifestyle_type && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Type</div>
                  <div style={{ textTransform: 'capitalize' }}>{person.lifestyle_type}</div>
                </div>
              )}
              {person.lifestyle_traits.length > 0 && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Traits</div>
                  <div className="tag-list">
                    {person.lifestyle_traits.map(trait => (
                      <span key={trait} className="tag" style={{ backgroundColor: '#9b59b6' }}>
                        {trait.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 className="card-title">Ambition & Drive</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Level</div>
                <div style={{ 
                  textTransform: 'capitalize',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: person.ambition_level === 'very_high' ? '#e74c3c' : 
                         person.ambition_level === 'high' ? '#e67e22' : 
                         person.ambition_level === 'medium' ? '#f39c12' : '#95a5a6'
                }}>
                  {person.ambition_level.replace('_', ' ')}
                </div>
              </div>
              {person.ambition_indicators.length > 0 && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Indicators</div>
                  <div className="tag-list">
                    {person.ambition_indicators.map(indicator => (
                      <span key={indicator} className="tag" style={{ backgroundColor: '#e67e22', textTransform: 'capitalize' }}>
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Relationship</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Strength</div>
                <div className="strength-indicator">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={`strength-star ${i <= person.relationship_strength ? '' : 'empty'}`}>
                      ★
                    </span>
                  ))}
                  <span style={{ marginLeft: '0.5rem', color: '#7f8c8d' }}>
                    {person.relationship_strength}/5
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Contact Frequency</div>
                <div>Every {person.preferred_contact_frequency} days</div>
              </div>
              {person.last_contact_date && (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.875rem' }}>Last Contact</div>
                  <div>{new Date(person.last_contact_date).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>

          {person.tags.length > 0 && (
            <div className="card">
              <h2 className="card-title">Tags</h2>
              <div className="tag-list">
                {person.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {connections && connections.connection_count > 0 && (
            <div className="card">
              <h2 className="card-title">Connections ({connections.connection_count})</h2>
              <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                This person is connected to {connections.connection_count} other people in your network.
              </div>
            </div>
          )}
        </div>
      </div>

      {person.notes && (
        <div className="card">
          <h2 className="card-title">Notes</h2>
          <div style={{ whiteSpace: 'pre-wrap' }}>{person.notes}</div>
        </div>
      )}
    </div>
  );
};

export default PersonDetail;
