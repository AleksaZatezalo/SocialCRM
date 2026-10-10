import axios from 'axios';
import type { Person, PersonCreate, Relationship, RelationshipCreate, NetworkGraph, ChoicesResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// People API
export const peopleApi = {
  getAll: async (): Promise<Person[]> => {
    const response = await api.get('/api/people/');
    return response.data.results || response.data;
  },

  getById: async (id: string): Promise<Person> => {
    const response = await api.get(`/api/people/${id}/`);
    return response.data;
  },

  create: async (data: PersonCreate): Promise<Person> => {
    const response = await api.post('/api/people/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<PersonCreate>): Promise<Person> => {
    const response = await api.patch(`/api/people/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/people/${id}/`);
  },

  getConnections: async (id: string): Promise<any> => {
    const response = await api.get(`/api/people/${id}/connections/`);
    return response.data;
  },

  getChoices: async (): Promise<ChoicesResponse> => {
    const response = await api.get('/api/people/choices/');
    return response.data;
  },
};

// Relationships API
export const relationshipsApi = {
  getAll: async (): Promise<any> => {
    const response = await api.get('/api/relationships/');
    return response.data;
  },

  forPerson: async (personId: string): Promise<any> => {
    const response = await api.get(`/api/relationships/for_person/?person_id=${personId}`);
    return response.data;
  },

  create: async (data: RelationshipCreate): Promise<Relationship> => {
    const response = await api.post('/api/relationships/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<RelationshipCreate>): Promise<Relationship> => {
    const response = await api.patch(`/api/relationships/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/relationships/${id}/`);
  },
};

// Network/Graph API
export const networkApi = {
  getGraph: async (): Promise<NetworkGraph> => {
    const response = await api.get('/api/queries/network-graph/');
    return response.data;
  },

  filterWithCQL: async (query: string, limit?: number): Promise<NetworkGraph> => {
    const response = await api.post('/api/queries/cql/filter/', {
      query,
      limit: limit || 500,
    });
    return response.data;
  },

  validateCQL: async (query: string): Promise<any> => {
    const response = await api.get(`/api/queries/cql/validate/?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default api;
