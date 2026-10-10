import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { peopleApi } from '../services/api';

const Dashboard: React.FC = () => {
  const { data: people, isLoading } = useQuery({
    queryKey: ['people'],
    queryFn: peopleApi.getAll,
  });

  if (isLoading) {
    return <div className="container"><div className="loading">Loading...</div></div>;
  }

  const totalPeople = people?.length || 0;
  const highAmbition = people?.filter(p => p.ambition_level === 'high' || p.ambition_level === 'very_high').length || 0;
  const recentlyAdded = people?.filter(p => {
    const createdDate = new Date(p.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  }).length || 0;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ color: '#7f8c8d', marginBottom: '0.5rem' }}>Total Contacts</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>{totalPeople}</div>
        </div>
        
        <div className="card">
          <h3 style={{ color: '#7f8c8d', marginBottom: '0.5rem' }}>High Ambition</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e67e22' }}>{highAmbition}</div>
          <div style={{ fontSize: '0.875rem', color: '#95a5a6' }}>
            {totalPeople > 0 ? Math.round((highAmbition / totalPeople) * 100) : 0}% of network
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ color: '#7f8c8d', marginBottom: '0.5rem' }}>Added This Week</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#27ae60' }}>{recentlyAdded}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-title">Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/people/new">
              <button className="btn btn-primary" style={{ width: '100%' }}>
                Add New Person
              </button>
            </Link>
            <Link to="/people">
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                View All People
              </button>
            </Link>
            <Link to="/network">
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                View Network Graph
              </button>
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Recent Additions</h2>
          {people && people.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {people.slice(0, 5).map(person => (
                <Link 
                  key={person.id} 
                  to={`/people/${person.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ecf0f1',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {person.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                      {person.occupation || 'No occupation'} 
                      {person.industry && ` • ${person.industry}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>
              No people added yet. <Link to="/people/new">Add your first contact</Link>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title">Target Profiles</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Entrepreneurs in Serbia
            </div>
            <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
              Looking for: High ambition, builders and investors
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Current matches: {people?.filter(p => 
                p.location?.toLowerCase().includes('serbia') && 
                p.ambition_indicators.includes('builder')
              ).length || 0}
            </div>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Media Figures in Serbia
            </div>
            <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
              Looking for: Industry = media, high ambition
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Current matches: {people?.filter(p => 
                p.location?.toLowerCase().includes('serbia') && 
                (p.industry?.toLowerCase().includes('media') || p.tags.some(t => t.toLowerCase().includes('media')))
              ).length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
