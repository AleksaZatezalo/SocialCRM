import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { networkApi, peopleApi, relationshipsApi } from '../services/api';
import NetworkGraphViz from '../components/NetworkGraphViz';
import type { GraphNode, RelationshipCreate } from '../types';

const NetworkView: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [cqlQuery, setCqlQuery] = useState('');

  // New relationship form state
  const [newRelationship, setNewRelationship] = useState<Partial<RelationshipCreate>>({
    relationship_type: 'acquaintance',
    strength: 3,
    status: 'active',
  });

  const { data: graphData, isLoading, error } = useQuery({
    queryKey: ['network-graph', cqlQuery],
    queryFn: () => {
      console.log('FETCHING network graph from API...', cqlQuery ? 'with CQL' : 'all');
      if (cqlQuery) {
        return networkApi.filterWithCQL(cqlQuery);
      }
      return networkApi.getGraph();
    },
  });

  const { data: people } = useQuery({
    queryKey: ['people'],
    queryFn: peopleApi.getAll,
  });

  const [skipRefresh, setSkipRefresh] = useState(false);

  const createRelationshipMutation = useMutation({
    mutationFn: relationshipsApi.create,
    onSuccess: () => {
      console.log('Relationship created successfully. skipRefresh =', skipRefresh);
      // Only invalidate when using the manual form, not Ctrl+Click
      if (!skipRefresh) {
        console.log('Invalidating queries (normal flow)');
        queryClient.invalidateQueries({ queryKey: ['network-graph'] });
        queryClient.invalidateQueries({ queryKey: ['people'] });
      } else {
        console.log('Skipping query invalidation (optimistic update flow)');
      }
      setSkipRefresh(false); // Reset flag
      setShowAddRelationship(false);
      setNewRelationship({
        relationship_type: 'acquaintance',
        strength: 3,
        status: 'active',
      });
    },
  });

  const handleNodeClick = (node: GraphNode) => {
    console.log('NetworkView handleNodeClick called for:', node.name);
    setSelectedNode(node);
  };

  const handleCreateConnection = (fromId: string, toId: string) => {
    console.log('NetworkView handleCreateConnection called:', fromId, '->', toId);
    // Create connection with default settings when Ctrl+drag is used
    const relationship: RelationshipCreate = {
      from_person: fromId,
      to_person: toId,
      relationship_type: 'professional',
      strength: 3,
      status: 'active',
    };
    
    // Set flag to skip refresh (edge already added locally in NetworkGraphViz)
    console.log('Setting skipRefresh = true');
    setSkipRefresh(true);
    createRelationshipMutation.mutate(relationship);
  };

  const handleAddRelationship = () => {
    if (!selectedNode) return;
    setShowAddRelationship(true);
    setNewRelationship(prev => ({
      ...prev,
      from_person: selectedNode.id,
    }));
  };

  const handleSubmitRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRelationship.from_person && newRelationship.to_person) {
      createRelationshipMutation.mutate(newRelationship as RelationshipCreate);
    }
  };

  if (isLoading) {
    return <div className="container"><div className="loading">Loading network graph...</div></div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Failed to load network graph. Please try again.</div>
      </div>
    );
  }

  // No client-side filtering - all filtering done via CQL on backend
  const filteredNodes = graphData?.nodes || [];
  const filteredEdges = graphData?.edges || [];

  const stats = {
    totalNodes: filteredNodes.length,
    totalEdges: filteredEdges.length,
    avgConnections: filteredNodes.length > 0 
      ? (filteredEdges.length * 2 / filteredNodes.length).toFixed(1) 
      : 0,
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Network Graph</h1>
        <Link to="/people">
          <button className="btn btn-secondary">Back to People</button>
        </Link>
      </div>

      {/* CQL Filter */}
      <div className="card" style={{ marginBottom: '1.5rem', background: '#e8f5e9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>CQL Filter (Connection Query Language)</h3>
          <Link to="/docs" style={{ fontSize: '0.875rem', color: '#2e7d32', textDecoration: 'none', fontWeight: 'bold' }}>
            📚 View Docs
          </Link>
        </div>
        
        <div className="form-group" style={{ margin: 0 }}>
          <input
            type="text"
            value={cqlQuery}
            onChange={(e) => setCqlQuery(e.target.value)}
            placeholder="e.g., industry = Technology AND ambition = very_high"
            style={{ fontFamily: 'monospace', fontSize: '0.875rem', padding: '0.75rem' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                queryClient.invalidateQueries({ queryKey: ['network-graph'] });
              }
            }}
          />
        </div>
        
        <div style={{ fontSize: '0.75rem', color: '#2e7d32', marginTop: '0.5rem' }}>
          <strong>Quick Examples:</strong> 
          <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCqlQuery('industry = Technology')}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #4caf50', background: 'white', borderRadius: '3px', cursor: 'pointer' }}
            >
              Tech people
            </button>
            <button
              onClick={() => setCqlQuery('ambition = very_high')}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #4caf50', background: 'white', borderRadius: '3px', cursor: 'pointer' }}
            >
              High ambition
            </button>
            <button
              onClick={() => setCqlQuery('location ~ "Serbia"')}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #4caf50', background: 'white', borderRadius: '3px', cursor: 'pointer' }}
            >
              In Serbia
            </button>
            <button
              onClick={() => setCqlQuery('indicators HAS "investor"')}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #4caf50', background: 'white', borderRadius: '3px', cursor: 'pointer' }}
            >
              Investors
            </button>
            <button
              onClick={() => setCqlQuery('')}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #e74c3c', background: 'white', borderRadius: '3px', cursor: 'pointer', color: '#e74c3c' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#7f8c8d' }}>Network Stats</h3>
        <div style={{ fontSize: '0.875rem', display: 'flex', gap: '2rem' }}>
          <div><strong>{stats.totalNodes}</strong> people</div>
          <div><strong>{stats.totalEdges}</strong> connections</div>
          <div><strong>{stats.avgConnections}</strong> avg connections/person</div>
        </div>
      </div>

      {/* Instructions & Legend */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#e8f5e9', borderRadius: '4px', borderLeft: '4px solid #4caf50' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#2e7d32' }}>💡 How to Use:</div>
          <div style={{ fontSize: '0.875rem', color: '#33691e', lineHeight: '1.6' }}>
            <div>• <strong>Drag nodes</strong> to reposition them</div>
            <div>• <strong>Hold Ctrl/Cmd + Click two nodes</strong> to create a connection between them</div>
            <div>• <strong>Click a node</strong> to see details and add connections manually</div>
            <div>• <strong>Hover</strong> to highlight connections</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>Ambition Level:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#e74c3c' }}></div>
            <span>Very High</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#e67e22' }}></div>
            <span>High</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f39c12' }}></div>
            <span>Medium</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#95a5a6' }}></div>
            <span>Low</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#9b59b6' }}></div>
            <span>Connecting (Ctrl mode)</span>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="card" style={{ padding: 0, marginBottom: '1.5rem' }}>
        {filteredNodes.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h3 style={{ color: '#7f8c8d', marginBottom: '1rem' }}>No people in your network yet</h3>
            <p style={{ color: '#95a5a6', marginBottom: '2rem' }}>
              Add people and create relationships to see your network graph
            </p>
            <Link to="/people/new">
              <button className="btn btn-primary">Add Your First Person</button>
            </Link>
          </div>
        ) : (
          <NetworkGraphViz 
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodeClick={handleNodeClick}
            onCreateConnection={handleCreateConnection}
            selectedNodeId={selectedNode?.id}
          />
        )}
      </div>

      {/* Selected Node Info & Actions */}
      {selectedNode && (
        <div className="grid grid-2">
          <div className="card">
            <h2 className="card-title">Selected: {selectedNode.name}</h2>
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
              {selectedNode.occupation && (
                <div>
                  <strong>Occupation:</strong> {selectedNode.occupation}
                </div>
              )}
              {selectedNode.industry && (
                <div>
                  <strong>Industry:</strong> {selectedNode.industry}
                </div>
              )}
              {selectedNode.location && (
                <div>
                  <strong>Location:</strong> {selectedNode.location}
                </div>
              )}
              <div>
                <strong>Ambition:</strong> {selectedNode.ambition_level.replace('_', ' ')}
              </div>
              <div>
                <strong>Relationship Strength:</strong> {selectedNode.relationship_strength}/5
              </div>
              {selectedNode.tags && selectedNode.tags.length > 0 && (
                <div>
                  <strong>Tags:</strong>
                  <div className="tag-list" style={{ marginTop: '0.25rem' }}>
                    {selectedNode.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <Link to={`/people/${selectedNode.id}`}>
                <button className="btn btn-primary">View Details</button>
              </Link>
              <button className="btn btn-secondary" onClick={handleAddRelationship}>
                Add Connection
              </button>
            </div>
          </div>

          {/* Add Relationship Form */}
          {showAddRelationship && (
            <div className="card">
              <h2 className="card-title">Add Connection from {selectedNode.name}</h2>
              <form onSubmit={handleSubmitRelationship}>
                <div className="form-group">
                  <label>Connect to</label>
                  <select
                    required
                    value={newRelationship.to_person || ''}
                    onChange={(e) => setNewRelationship({ ...newRelationship, to_person: e.target.value })}
                  >
                    <option value="">Select person...</option>
                    {people?.filter(p => p.id !== selectedNode.id).map(person => (
                      <option key={person.id} value={person.id}>
                        {person.name} - {person.occupation || 'No occupation'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Relationship Type</label>
                  <select
                    value={newRelationship.relationship_type}
                    onChange={(e) => setNewRelationship({ ...newRelationship, relationship_type: e.target.value })}
                  >
                    <option value="professional">Professional</option>
                    <option value="friend">Friend</option>
                    <option value="acquaintance">Acquaintance</option>
                    <option value="mentor">Mentor</option>
                    <option value="mentee">Mentee</option>
                    <option value="family">Family</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Connection Strength (1-5)</label>
                  <select
                    value={newRelationship.strength}
                    onChange={(e) => setNewRelationship({ ...newRelationship, strength: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map(i => (
                      <option key={i} value={i}>{i} {"⭐".repeat(i)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Context (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="How do they know each other?"
                    value={newRelationship.context || ''}
                    onChange={(e) => setNewRelationship({ ...newRelationship, context: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={createRelationshipMutation.isPending}>
                    {createRelationshipMutation.isPending ? 'Creating...' : 'Create Connection'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddRelationship(false)}
                  >
                    Cancel
                  </button>
                </div>

                {createRelationshipMutation.isError && (
                  <div className="error" style={{ marginTop: '1rem' }}>
                    Failed to create connection. Please try again.
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkView;
