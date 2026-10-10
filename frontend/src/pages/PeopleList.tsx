import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { peopleApi } from '../services/api';
import type { Person } from '../types';

const StrengthIndicator: React.FC<{ strength: number }> = ({ strength }) => {
  // Default to 3 if strength is not set
  const strengthValue = strength || 3;
  
  return (
    <div className="strength-indicator">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`strength-star ${i <= strengthValue ? '' : 'empty'}`}>
          ★
        </span>
      ))}
    </div>
  );
};

const PeopleList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAmbition, setFilterAmbition] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'next_contact_date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: people, isLoading, error } = useQuery({
    queryKey: ['people'],
    queryFn: peopleApi.getAll,
  });

  if (isLoading) {
    return <div className="container"><div className="loading">Loading people...</div></div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Failed to load people. Please try again.</div>
      </div>
    );
  }

  // Filter people based on search and filters
  const filteredPeople = people?.filter((person: Person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmbition = !filterAmbition || person.ambition_level === filterAmbition;
    const matchesLocation = !filterLocation || person.location?.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesAmbition && matchesLocation;
  }) || [];

  // Sort people
  const sortedPeople = [...filteredPeople].sort((a, b) => {
    if (sortBy === 'next_contact_date') {
      const dateA = a.next_contact_date ? new Date(a.next_contact_date).getTime() : Infinity;
      const dateB = b.next_contact_date ? new Date(b.next_contact_date).getTime() : Infinity;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }
  });

  const handleSort = (column: 'name' | 'next_contact_date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Get unique locations for filter
  const locations = Array.from(new Set(people?.map(p => p.location).filter(Boolean)));
  const ambitionLevels = [
    { value: '', label: 'All' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'very_high', label: 'Very High' },
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>People ({sortedPeople.length})</h1>
        <Link to="/people/new">
          <button className="btn btn-primary">Add New Person</button>
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="grid grid-3">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, occupation, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Ambition Level</label>
            <select value={filterAmbition} onChange={(e) => setFilterAmbition(e.target.value)}>
              {ambitionLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {sortedPeople.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#95a5a6', marginBottom: '1rem' }}>
            {searchTerm || filterAmbition || filterLocation 
              ? 'No people match your filters' 
              : 'No people added yet'}
          </p>
          {!searchTerm && !filterAmbition && !filterLocation && (
            <Link to="/people/new">
              <button className="btn btn-primary">Add Your First Contact</button>
            </Link>
          )}
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('name')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Occupation</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Ambition</th>
              <th>Indicators</th>
              <th>Strength</th>
              <th 
                onClick={() => handleSort('next_contact_date')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Next Contact {sortBy === 'next_contact_date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPeople.map((person: Person) => (
              <tr key={person.id}>
                <td>
                  <Link 
                    to={`/people/${person.id}`}
                    style={{ fontWeight: 'bold', color: '#2c3e50', textDecoration: 'none' }}
                  >
                    {person.name}
                  </Link>
                </td>
                <td>{person.occupation || '-'}</td>
                <td>{person.industry || '-'}</td>
                <td>{person.location || '-'}</td>
                <td style={{ textTransform: 'capitalize' }}>
                  {person.ambition_level.replace('_', ' ')}
                </td>
                <td>
                  {person.ambition_indicators.length > 0 ? (
                    <div className="tag-list">
                      {person.ambition_indicators.map(ind => (
                        <span key={ind} className="tag" style={{ backgroundColor: '#e67e22' }}>
                          {ind}
                        </span>
                      ))}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <StrengthIndicator strength={person.relationship_strength} />
                </td>
                <td>
                  {person.next_contact_date ? (
                    <span style={{ 
                      color: new Date(person.next_contact_date) < new Date() ? '#e74c3c' : '#2c3e50' 
                    }}>
                      {new Date(person.next_contact_date).toLocaleDateString()}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  {person.tags.length > 0 ? (
                    <div className="tag-list">
                      {person.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                      {person.tags.length > 2 && (
                        <span style={{ fontSize: '0.875rem', color: '#95a5a6' }}>
                          +{person.tags.length - 2}
                        </span>
                      )}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <Link to={`/people/${person.id}`}>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem' }}>
                      View
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PeopleList;
