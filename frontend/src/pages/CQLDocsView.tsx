import React from 'react';
import { Link } from 'react-router-dom';

const CQLDocsView: React.FC = () => {
  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>CQL Documentation</h1>
            <p style={{ color: '#7f8c8d' }}>Connection Query Language - Filter your network with powerful queries</p>
          </div>
          <Link to="/network">
            <button className="btn btn-primary">Try CQL →</button>
          </Link>
        </div>
      </div>

      {/* Quick Start */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Quick Start</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
          CQL (Connection Query Language) is a simple, powerful way to filter people in your network. 
          Type queries directly into the network graph filter box.
        </p>
        <div style={{ backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '4px', padding: '1rem' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '0.5rem' }}>industry = Technology</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '0.5rem' }}>ambition = very_high</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '0.5rem' }}>location ~ "Serbia"</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>industry = Technology AND ambition = very_high</div>
        </div>
      </div>

      {/* Basic Syntax */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Basic Syntax</h2>
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Structure</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            field operator value [AND/OR field operator value] [ORDER BY field] [LIMIT n]
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Example</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
            industry = Technology AND ambition = very_high ORDER BY name LIMIT 20
          </div>
        </div>
      </div>

      {/* Operators */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Operators</h2>
        <table>
          <thead>
            <tr>
              <th>Operator</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontFamily: 'monospace' }}>=</td>
              <td>Equal to</td>
              <td style={{ fontFamily: 'monospace' }}>industry = Technology</td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'monospace' }}>!=</td>
              <td>Not equal to</td>
              <td style={{ fontFamily: 'monospace' }}>industry != Finance</td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'monospace' }}>~</td>
              <td>Contains (case-insensitive)</td>
              <td style={{ fontFamily: 'monospace' }}>location ~ "Serbia"</td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'monospace' }}>IN</td>
              <td>In list</td>
              <td style={{ fontFamily: 'monospace' }}>ambition IN (high, very_high)</td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'monospace' }}>NOT IN</td>
              <td>Not in list</td>
              <td style={{ fontFamily: 'monospace' }}>industry NOT IN (Finance, Legal)</td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'monospace' }}>HAS</td>
              <td>Array contains</td>
              <td style={{ fontFamily: 'monospace' }}>indicators HAS "investor"</td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'monospace' }}>{['>', '>=', '<', '<='].join(', ')}</td>
              <td>Comparison</td>
              <td style={{ fontFamily: 'monospace' }}>age {'>'} 30</td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'monospace' }}>IS EMPTY</td>
              <td>Field is null/empty</td>
              <td style={{ fontFamily: 'monospace' }}>company IS EMPTY</td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'monospace' }}>IS NOT EMPTY</td>
              <td>Field has value</td>
              <td style={{ fontFamily: 'monospace' }}>notes IS NOT EMPTY</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Available Fields */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Available Fields</h2>
        <div className="grid grid-2" style={{ gap: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.75rem' }}>Basic Info</h3>
            <table>
              <tbody>
                <tr><td style={{ fontFamily: 'monospace' }}>name</td><td>Person's name</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>age</td><td>Age (number)</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>location</td><td>City/country</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>nationality</td><td>Nationality</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ marginBottom: '0.75rem' }}>Professional</h3>
            <table>
              <tbody>
                <tr><td style={{ fontFamily: 'monospace' }}>occupation</td><td>Job title</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>industry</td><td>Industry sector</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>company</td><td>Company name</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ marginBottom: '0.75rem' }}>Lifestyle & Ambition</h3>
            <table>
              <tbody>
                <tr><td style={{ fontFamily: 'monospace' }}>lifestyle</td><td>Lifestyle type</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>ambition</td><td>Ambition level</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>traits</td><td>Traits (array)</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>indicators</td><td>Indicators (array)</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ marginBottom: '0.75rem' }}>Relationship</h3>
            <table>
              <tbody>
                <tr><td style={{ fontFamily: 'monospace' }}>my_relationship_strength</td><td>1-5 rating</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>contact_frequency</td><td>Days between</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>last_contact</td><td>Last contact date</td></tr>
                <tr><td style={{ fontFamily: 'monospace' }}>tags</td><td>Custom tags (array)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Field Values */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Field Values</h2>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Ambition Levels</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['low', 'medium', 'high', 'very_high'].map(val => (
              <span key={val} className="badge badge-primary" style={{ fontFamily: 'monospace' }}>{val}</span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Lifestyle Types</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['minimalist', 'luxury', 'adventurous', 'traditional', 'balanced', 'bohemian', 'corporate', 'creative'].map(val => (
              <span key={val} className="badge badge-primary" style={{ fontFamily: 'monospace' }}>{val}</span>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Ambition Indicators</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['builder', 'investor', 'middleman'].map(val => (
              <span key={val} className="badge badge-primary" style={{ fontFamily: 'monospace' }}>{val}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Query Examples</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ borderLeft: '4px solid #3498db', paddingLeft: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Find Tech Entrepreneurs</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
              industry = Technology AND indicators HAS "builder"
            </div>
          </div>

          <div style={{ borderLeft: '4px solid #2ecc71', paddingLeft: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Find High Ambition People in Serbia</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
              ambition IN (high, very_high) AND location ~ "Serbia"
            </div>
          </div>

          <div style={{ borderLeft: '4px solid #9b59b6', paddingLeft: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Find Investors</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
              indicators HAS "investor" AND ambition = very_high
            </div>
          </div>

          <div style={{ borderLeft: '4px solid #e67e22', paddingLeft: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Find Media Contacts in Belgrade</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
              industry = Media AND location ~ "Belgrade"
            </div>
          </div>

          <div style={{ borderLeft: '4px solid #f39c12', paddingLeft: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Find Ambitious Networkers</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
              traits HAS "ambitious-networker" AND ambition = very_high
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Advanced Features</h2>
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Combining Conditions</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
            industry = Technology AND ambition = very_high
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
            industry = Media OR industry = Technology
          </div>

          <h3 style={{ marginBottom: '0.5rem' }}>Ordering Results</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
            industry = Technology ORDER BY name
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
            ambition = very_high ORDER BY name DESC
          </div>

          <h3 style={{ marginBottom: '0.5rem' }}>Limiting Results</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
            industry = Technology LIMIT 10
          </div>
        </div>
      </div>

      {/* Tips */}
      <div style={{ backgroundColor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#1976d2' }}>💡 Pro Tips</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#1565c0' }}>
          <li style={{ marginBottom: '0.5rem' }}>Values are <strong>case-sensitive</strong> - use "Technology" not "tech"</li>
          <li style={{ marginBottom: '0.5rem' }}>Use ~ for partial matches: <code style={{ backgroundColor: '#bbdefb', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>location ~ "Serbia"</code></li>
          <li style={{ marginBottom: '0.5rem' }}>Press <strong>Enter</strong> to execute your query</li>
          <li style={{ marginBottom: '0.5rem' }}>Use the quick example buttons to get started</li>
          <li>Leave query empty to see all people</li>
        </ul>
      </div>

      {/* Try It Now */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', padding: '2rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ marginBottom: '1rem' }}>Ready to Filter Your Network?</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>Start using CQL to find exactly who you're looking for</p>
        <Link to="/network">
          <button className="btn" style={{ backgroundColor: 'white', color: '#667eea', fontWeight: 'bold' }}>
            Go to Network Graph →
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CQLDocsView;
