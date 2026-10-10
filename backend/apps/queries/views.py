from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.neo4j_service import Neo4jService
from apps.people.models import Person, Relationship
from .cql_parser import CQLParser, parse_cql


class NetworkGraphView(APIView):
    """Get network graph data for visualization"""
    
    def get(self, request):
        """
        Get all people and relationships as graph data
        Query params:
        - limit: max nodes to return (default 500)
        """
        try:
            limit = int(request.query_params.get('limit', 500))
            
            # Get graph data from Neo4j
            graph_data = Neo4jService.get_network_graph(limit=limit)
            
            # Transform Neo4j nodes to frontend format
            nodes = []
            for node in graph_data['nodes']:
                nodes.append({
                    'id': node.get('id'),
                    'name': node.get('name', 'Unknown'),
                    'location': node.get('location', ''),
                    'occupation': node.get('occupation', ''),
                    'industry': node.get('industry', ''),
                    'ambition_level': node.get('ambition_level', 'medium'),
                    'relationship_strength': node.get('relationship_strength', 3),
                    'tags': node.get('tags', []),
                    'lifestyle_type': node.get('lifestyle_type', ''),
                })
            
            # Transform edges
            edges = []
            for edge in graph_data['edges']:
                edges.append({
                    'source': edge.get('source'),
                    'target': edge.get('target'),
                    'strength': edge.get('strength', 3),
                    'type': edge.get('type', 'acquaintance'),
                })
            
            return Response({
                'nodes': nodes,
                'edges': edges,
                'count': len(nodes)
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ShortestPathView(APIView):
    """Find shortest path between two people"""
    
    def get(self, request):
        """
        Find shortest path between two people
        Query params:
        - from_id: source person ID
        - to_id: target person ID
        """
        from_id = request.query_params.get('from_id')
        to_id = request.query_params.get('to_id')
        
        if not from_id or not to_id:
            return Response(
                {'error': 'Both from_id and to_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            path_data = Neo4jService.find_shortest_path(from_id, to_id)
            
            if not path_data:
                return Response({
                    'found': False,
                    'message': 'No path found between these people'
                })
            
            return Response({
                'found': True,
                'path': path_data.get('path', []),
                'hops': path_data.get('hops', 0)
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class IntroductionFinderView(APIView):
    """Find people who can introduce you to targets"""
    
    def get(self, request):
        """
        Find introduction opportunities
        Query params:
        - my_id: your person ID
        - industry: filter by industry
        - location: filter by location
        - ambition_level: filter by ambition
        - tags: filter by tags (comma-separated)
        """
        my_id = request.query_params.get('my_id')
        
        if not my_id:
            return Response(
                {'error': 'my_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        filters = {}
        if request.query_params.get('industry'):
            filters['industry'] = request.query_params.get('industry')
        if request.query_params.get('location'):
            filters['location'] = request.query_params.get('location')
        if request.query_params.get('ambition_level'):
            filters['ambition_level'] = request.query_params.get('ambition_level')
        if request.query_params.get('tags'):
            filters['tags'] = request.query_params.get('tags').split(',')
        
        try:
            connectors = Neo4jService.find_introduction_connectors(my_id, filters)
            
            return Response({
                'connectors': connectors,
                'count': len(connectors)
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CQLFilterView(APIView):
    """Filter network graph using CQL (Connection Query Language)"""
    
    def post(self, request):
        """
        Filter network graph using CQL
        Request body:
        - query: CQL query string (e.g., "industry = tech AND ambition = very_high")
        - limit: max results (default 500)
        """
        query_string = request.data.get('query', '')
        limit = request.data.get('limit', 500)
        
        if not query_string:
            # Return all if no query
            return NetworkGraphView().get(request)
        
        try:
            # Parse CQL
            parser = CQLParser()
            parsed_query = parser.parse(query_string)
            
            # Build Cypher query
            cypher_filter = parser.to_cypher_filter(parsed_query, 'p')
            order_clause = parser.get_order_by_clause(parsed_query, 'p')
            limit_clause = parser.get_limit_clause(parsed_query) or f"LIMIT {limit}"
            
            # Get filtered nodes
            cypher_nodes = f"""
                MATCH (p:Person)
                {cypher_filter}
                RETURN p
                {order_clause}
                {limit_clause}
            """
            
            nodes_result = Neo4jService.execute_query(cypher_nodes)
            filtered_node_ids = [record['p']['id'] for record in nodes_result]
            
            if not filtered_node_ids:
                return Response({
                    'nodes': [],
                    'edges': [],
                    'count': 0,
                    'query': query_string
                })
            
            # Get edges between filtered nodes
            cypher_edges = """
                MATCH (p1:Person)-[r:KNOWS]-(p2:Person)
                WHERE p1.id IN $node_ids AND p2.id IN $node_ids
                RETURN DISTINCT p1.id as source, p2.id as target, r.strength as strength, r.type as type
            """
            
            edges_result = Neo4jService.execute_query(cypher_edges, {'node_ids': filtered_node_ids})
            
            # Transform to frontend format
            nodes = []
            for record in nodes_result:
                node = record['p']
                nodes.append({
                    'id': node.get('id'),
                    'name': node.get('name', 'Unknown'),
                    'location': node.get('location', ''),
                    'occupation': node.get('occupation', ''),
                    'industry': node.get('industry', ''),
                    'ambition_level': node.get('ambition_level', 'medium'),
                    'relationship_strength': node.get('relationship_strength', 3),
                    'tags': node.get('tags', []),
                    'lifestyle_type': node.get('lifestyle_type', ''),
                })
            
            edges = []
            for record in edges_result:
                edges.append({
                    'source': record['source'],
                    'target': record['target'],
                    'strength': record.get('strength', 3),
                    'type': record.get('type', 'acquaintance'),
                })
            
            return Response({
                'nodes': nodes,
                'edges': edges,
                'count': len(nodes),
                'query': query_string,
                'parsed': {
                    'conditions': len(parsed_query.conditions),
                    'order_by': parsed_query.order_by,
                    'limit': parsed_query.limit
                }
            })
            
        except Exception as e:
            return Response(
                {'error': str(e), 'query': query_string},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def get(self, request):
        """
        Validate CQL query without executing
        Query params:
        - query: CQL query string to validate
        """
        query_string = request.query_params.get('query', '')
        
        if not query_string:
            return Response({
                'valid': False,
                'error': 'No query provided'
            })
        
        try:
            parser = CQLParser()
            parsed_query = parser.parse(query_string)
            cypher_filter = parser.to_cypher_filter(parsed_query, 'p')
            
            return Response({
                'valid': True,
                'query': query_string,
                'parsed': {
                    'conditions': len(parsed_query.conditions),
                    'order_by': parsed_query.order_by,
                    'limit': parsed_query.limit
                },
                'cypher': cypher_filter
            })
            
        except Exception as e:
            return Response({
                'valid': False,
                'error': str(e),
                'query': query_string
            })
