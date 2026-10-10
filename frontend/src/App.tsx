import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import PeopleList from './pages/PeopleList';
import PersonDetail from './pages/PersonDetail';
import PersonDetailView from './pages/PersonDetailView';
import PersonCreate from './pages/PersonCreate';
import NetworkView from './pages/NetworkView';
import CQLDocsView from './pages/CQLDocsView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-title">Social CRM</div>
        <ul className="nav-links">
          <li><Link to="/" className={isActive('/')}>Dashboard</Link></li>
          <li><Link to="/people" className={isActive('/people')}>People</Link></li>
          <li><Link to="/network" className={isActive('/network')}>Network</Link></li>
          <li><Link to="/docs" className={isActive('/docs')}>CQL Docs</Link></li>
        </ul>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/people" element={<PeopleList />} />
            <Route path="/people/new" element={<PersonCreate />} />
            <Route path="/people/:id" element={<PersonDetailView />} />
            <Route path="/network" element={<NetworkView />} />
            <Route path="/docs" element={<CQLDocsView />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
