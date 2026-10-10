from neo4j import GraphDatabase
from django.conf import settings
from typing import List, Dict, Any, Optional


class Neo4jService:
    """Service for interacting with Neo4j graph database"""
    
    _driver = None
    
    @classmethod
    def get_driver(cls):
        """Get or create Neo4j driver instance"""
        if cls._driver is None:
            cls._driver = GraphDatabase.driver(
                settings.NEO4J_BOLT_URL,
                auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
            )
        return cls._driver
    
    @classmethod
    def close_driver(cls):
        """Close the driver connection"""
        if cls._driver:
            cls._driver.close()
            cls._driver = None
    
    @classmethod
    def execute_query(cls, query: str, parameters: Dict[str, Any] = None) -> List[Dict]:
        """Execute a Cypher query and return results"""
        driver = cls.get_driver()
        with driver.session() as session:
            result = session.run(query, parameters or {})
            return [record.data() for record in result]
    
    @classmethod
    def create_person_node(cls, person_data: Dict[str, Any]) -> Dict:
        """Create a person node in Neo4j"""
        query = """
        CREATE (p:Person {
            id: $id,
            name: $name,
            location: $location,
            occupation: $occupation,
            industry: $industry,
            company: $company,
            age: $age,
            nationality: $nationality,
            lifestyle_type: $lifestyle_type,
            lifestyle_traits: $lifestyle_traits,
            ambition_level: $ambition_level,
            ambition_indicators: $ambition_indicators,
            tags: $tags,
            relationship_strength: $relationship_strength,
            preferred_contact_frequency: $preferred_contact_frequency,
            notes: $notes,
            created_at: datetime()
        })
        RETURN p
        """
        result = cls.execute_query(query, person_data)
        return result[0]['p'] if result else None
    
    @classmethod
    def update_person_node(cls, person_id: str, updates: Dict[str, Any]) -> Dict:
        """Update a person node"""
        set_clause = ', '.join([f'p.{key} = ${key}' for key in updates.keys()])
        query = f"""
        MATCH (p:Person {{id: $id}})
        SET {set_clause}
        RETURN p
        """
        params = {'id': person_id, **updates}
        result = cls.execute_query(query, params)
        return result[0]['p'] if result else None
    
    @classmethod
    def get_person_node(cls, person_id: str) -> Optional[Dict]:
        """Get a person node by ID"""
        query = """
        MATCH (p:Person {id: $id})
        RETURN p
        """
        result = cls.execute_query(query, {'id': person_id})
        return result[0]['p'] if result else None
    
    @classmethod
    def delete_person_node(cls, person_id: str) -> bool:
        """Delete a person node and all relationships"""
        query = """
        MATCH (p:Person {id: $id})
        DETACH DELETE p
        RETURN count(p) as deleted
        """
        result = cls.execute_query(query, {'id': person_id})
        return result[0]['deleted'] > 0 if result else False
    
    @classmethod
    def create_relationship(cls, from_id: str, to_id: str, rel_data: Dict[str, Any]) -> Dict:
        """Create a KNOWS relationship between two people"""
        query = """
        MATCH (p1:Person {id: $from_id})
        MATCH (p2:Person {id: $to_id})
        CREATE (p1)-[r:KNOWS {
            type: $type,
            strength: $strength,
            context: $context,
            since: $since,
            status: $status
        }]->(p2)
        RETURN r
        """
        params = {
            'from_id': from_id,
            'to_id': to_id,
            **rel_data
        }
        result = cls.execute_query(query, params)
        return result[0]['r'] if result else None
    
    @classmethod
    def delete_relationship(cls, from_id: str, to_id: str) -> bool:
        """Delete a KNOWS relationship between two people (bidirectional)"""
        query = """
        MATCH (p1:Person {id: $from_id})-[r:KNOWS]-(p2:Person {id: $to_id})
        DELETE r
        RETURN count(r) as deleted
        """
        result = cls.execute_query(query, {'from_id': from_id, 'to_id': to_id})
        return result[0]['deleted'] > 0 if result else False
    
    @classmethod
    def get_person_connections(cls, person_id: str) -> List[Dict]:
        """Get all connections for a person"""
        query = """
        MATCH (p:Person {id: $id})-[r:KNOWS]-(connected:Person)
        RETURN connected, r, 
               id(connected) as node_id,
               type(r) as rel_type
        ORDER BY r.strength DESC
        """
        return cls.execute_query(query, {'id': person_id})
    
    @classmethod
    def get_network_graph(cls, limit: int = 500) -> Dict[str, List]:
        """Get entire network graph data for visualization"""
        nodes_query = """
        MATCH (p:Person)
        RETURN p
        LIMIT $limit
        """
        
        edges_query = """
        MATCH (p1:Person)-[r:KNOWS]-(p2:Person)
        RETURN p1.id as source, p2.id as target, 
               r.strength as strength, r.type as type
        LIMIT $limit
        """
        
        nodes = cls.execute_query(nodes_query, {'limit': limit})
        edges = cls.execute_query(edges_query, {'limit': limit})
        
        return {
            'nodes': [n['p'] for n in nodes],
            'edges': edges
        }
    
    @classmethod
    def find_shortest_path(cls, from_id: str, to_id: str) -> Optional[List]:
        """Find shortest path between two people"""
        query = """
        MATCH path = shortestPath(
            (p1:Person {id: $from_id})-[:KNOWS*..5]-(p2:Person {id: $to_id})
        )
        RETURN [node in nodes(path) | node.id] as path,
               length(path) as hops
        """
        result = cls.execute_query(query, {'from_id': from_id, 'to_id': to_id})
        return result[0] if result else None
    
    @classmethod
    def find_introduction_connectors(cls, my_id: str, filters: Dict[str, Any]) -> List[Dict]:
        """Find people who can introduce you to targets matching criteria"""
        where_clauses = []
        params = {'my_id': my_id}
        
        if filters.get('industry'):
            where_clauses.append('target.industry = $industry')
            params['industry'] = filters['industry']
        
        if filters.get('location'):
            where_clauses.append('target.location = $location')
            params['location'] = filters['location']
        
        if filters.get('ambition_level'):
            where_clauses.append('target.ambition_level = $ambition_level')
            params['ambition_level'] = filters['ambition_level']
        
        if filters.get('tags'):
            where_clauses.append('ANY(tag IN $tags WHERE tag IN target.tags)')
            params['tags'] = filters['tags']
        
        where_clause = ' AND '.join(where_clauses) if where_clauses else 'true'
        
        query = f"""
        MATCH (me:Person {{id: $my_id}})-[r1:KNOWS]-(connector:Person)-[r2:KNOWS]-(target:Person)
        WHERE NOT (me)-[:KNOWS]-(target)
          AND r1.strength >= 3
          AND {where_clause}
        WITH connector, collect(DISTINCT target) as targets
        RETURN connector, targets, size(targets) as target_count
        ORDER BY target_count DESC
        LIMIT 20
        """
        
        return cls.execute_query(query, params)
    
    @classmethod
    def get_top_connectors(cls, my_id: str, limit: int = 10) -> List[Dict]:
        """Get people with most second-degree connections"""
        query = """
        MATCH (me:Person {id: $my_id})-[:KNOWS]-(friend:Person)-[:KNOWS]-(second_degree:Person)
        WHERE NOT (me)-[:KNOWS]-(second_degree)
          AND me <> second_degree
        WITH friend, count(DISTINCT second_degree) as reach
        RETURN friend, reach
        ORDER BY reach DESC
        LIMIT $limit
        """
        return cls.execute_query(query, {'my_id': my_id, 'limit': limit})
    
    @classmethod
    def get_second_degree_connections(cls, my_id: str, filters: Dict[str, Any] = None) -> List[Dict]:
        """Get second-degree connections with optional filters"""
        where_clauses = ['NOT (me)-[:KNOWS]-(prospect)', 'me <> prospect']
        params = {'my_id': my_id}
        
        if filters:
            if filters.get('industry'):
                where_clauses.append('prospect.industry = $industry')
                params['industry'] = filters['industry']
            
            if filters.get('location'):
                where_clauses.append('prospect.location = $location')
                params['location'] = filters['location']
        
        where_clause = ' AND '.join(where_clauses)
        
        query = f"""
        MATCH (me:Person {{id: $my_id}})-[:KNOWS]-(connector:Person)-[:KNOWS]-(prospect:Person)
        WHERE {where_clause}
        RETURN prospect, connector, 
               connector.name as connector_name,
               prospect.name as prospect_name
        LIMIT 100
        """
        
        return cls.execute_query(query, params)


# Initialize connection on import
def init_neo4j():
    """Initialize Neo4j connection and ensure constraints"""
    service = Neo4jService()
    try:
        # Create uniqueness constraint on Person.id
        service.execute_query(
            "CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE"
        )
    except Exception as e:
        print(f"Neo4j initialization warning: {e}")
