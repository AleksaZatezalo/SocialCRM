export interface Person {
  id: string;
  name: string;
  age?: number;
  location: string;
  nationality?: string;
  occupation?: string;
  industry?: string;
  company?: string;
  lifestyle_type?: string;
  lifestyle_traits: string[];
  ambition_level: string;
  ambition_indicators: string[];
  relationship_strength: number;
  preferred_contact_frequency: number;
  last_contact_date?: string;
  next_contact_date?: string;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonCreate {
  name: string;
  age?: number;
  location?: string;
  nationality?: string;
  occupation?: string;
  industry?: string;
  company?: string;
  lifestyle_type?: string;
  lifestyle_traits?: string[];
  ambition_level?: string;
  ambition_indicators?: string[];
  relationship_strength?: number;
  preferred_contact_frequency?: number;
  last_contact_date?: string;
  next_contact_date?: string;
  tags?: string[];
  notes?: string;
}

export interface PersonUpdate {
  name?: string;
  age?: number;
  location?: string;
  nationality?: string;
  occupation?: string;
  industry?: string;
  company?: string;
  lifestyle_type?: string;
  lifestyle_traits?: string[];
  ambition_level?: string;
  ambition_indicators?: string[];
  relationship_strength?: number;
  preferred_contact_frequency?: number;
  last_contact_date?: string;
  next_contact_date?: string;
  tags?: string[];
  notes?: string;
}

export interface Relationship {
  id: string;
  from_person: string;
  to_person: string;
  from_person_name: string;
  to_person_name: string;
  relationship_type: string;
  strength: number;
  context?: string;
  since?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RelationshipCreate {
  from_person: string;
  to_person: string;
  relationship_type: string;
  strength: number;
  context?: string;
  since?: string;
  status?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  location?: string;
  occupation?: string;
  industry?: string;
  ambition_level: string;
  relationship_strength: number;
  tags: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: number;
  type: string;
}

export interface NetworkGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ChoicesResponse {
  lifestyle_types: Choice[];
  ambition_levels: Choice[];
  ambition_indicators: Choice[];
  lifestyle_traits: Choice[];
  relationship_strengths: Choice[];
}

export interface Choice {
  value: string | number;
  label: string;
}
