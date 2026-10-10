"""
CQL (Connection Query Language) Parser
Converts CQL queries to Neo4j Cypher for filtering network connections
"""

import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass


@dataclass
class CQLQuery:
    """Parsed CQL query structure"""
    conditions: List[Dict[str, Any]]
    order_by: Optional[str] = None
    order_direction: str = "ASC"
    limit: Optional[int] = None


class CQLParser:
    """Simple CQL parser for filtering people and connections"""
    
    # Field mappings: CQL field name -> Neo4j property name
    FIELD_MAP = {
        'name': 'name',
        'age': 'age',
        'location': 'location',
        'nationality': 'nationality',
        'occupation': 'occupation',
        'industry': 'industry',
        'company': 'company',
        'lifestyle': 'lifestyle_type',
        'ambition': 'ambition_level',
        'traits': 'lifestyle_traits',
        'indicators': 'ambition_indicators',
        'tags': 'tags',
        'notes': 'notes',
        'my_relationship_strength': 'relationship_strength',
        'contact_frequency': 'preferred_contact_frequency',
        'last_contact': 'last_contact_date',
    }
    
    # Relationship field mappings
    RELATIONSHIP_FIELD_MAP = {
        'type': 'type',
        'strength': 'strength',
        'status': 'status',
        'context': 'context',
        'since': 'since',
    }
    
    # Valid enum values
    AMBITION_LEVELS = ['low', 'medium', 'high', 'very_high']
    LIFESTYLE_TYPES = ['minimalist', 'luxury', 'adventurous', 'traditional', 
                       'balanced', 'bohemian', 'corporate', 'creative']
    RELATIONSHIP_TYPES = ['professional', 'friend', 'acquaintance', 'mentor', 'mentee', 'family']
    RELATIONSHIP_STATUS = ['active', 'dormant', 'inactive']
    
    def __init__(self):
        self.query_string = ""
        
    def parse(self, query_string: str) -> CQLQuery:
        """Parse CQL query string into structured format"""
        self.query_string = query_string.strip()
        
        if not self.query_string:
            return CQLQuery(conditions=[])
        
        conditions = []
        order_by = None
        order_direction = "ASC"
        limit = None
        
        # Extract ORDER BY clause
        order_match = re.search(r'ORDER BY\s+(\w+)(?:\s+(ASC|DESC))?', self.query_string, re.IGNORECASE)
        if order_match:
            order_by = order_match.group(1)
            if order_match.group(2):
                order_direction = order_match.group(2).upper()
            # Remove ORDER BY from query
            self.query_string = self.query_string[:order_match.start()].strip()
        
        # Extract LIMIT clause
        limit_match = re.search(r'LIMIT\s+(\d+)', self.query_string, re.IGNORECASE)
        if limit_match:
            limit = int(limit_match.group(1))
            # Remove LIMIT from query
            self.query_string = self.query_string[:limit_match.start()].strip()
        
        # Remove "WHERE" keyword if present
        where_match = re.search(r'^WHERE\s+', self.query_string, re.IGNORECASE)
        if where_match:
            self.query_string = self.query_string[where_match.end():].strip()
        
        # Parse conditions (split by AND/OR)
        conditions = self._parse_conditions(self.query_string)
        
        return CQLQuery(
            conditions=conditions,
            order_by=order_by,
            order_direction=order_direction,
            limit=limit
        )
    
    def _parse_conditions(self, condition_string: str) -> List[Dict[str, Any]]:
        """Parse condition string into list of condition dicts"""
        if not condition_string:
            return []
        
        conditions = []
        
        # Split by AND/OR (case insensitive)
        # For simplicity, we'll treat AND and OR the same initially (can be enhanced later)
        parts = re.split(r'\s+(AND|OR)\s+', condition_string, flags=re.IGNORECASE)
        
        for i, part in enumerate(parts):
            if part.upper() in ('AND', 'OR'):
                # This is a logical operator, skip it for now
                continue
            
            condition = self._parse_single_condition(part.strip())
            if condition:
                # Add logical operator from previous part
                if i > 0 and parts[i-1].upper() in ('AND', 'OR'):
                    condition['operator_before'] = parts[i-1].upper()
                else:
                    condition['operator_before'] = 'AND'
                conditions.append(condition)
        
        return conditions
    
    def _parse_single_condition(self, condition: str) -> Optional[Dict[str, Any]]:
        """Parse a single condition like 'industry = tech' or 'ambition IN (high, very_high)'"""
        
        # Pattern: field operator value
        # Operators: =, !=, >, >=, <, <=, ~, IN, NOT IN, HAS, IS EMPTY, IS NOT EMPTY
        
        # Handle IN operator: field IN (val1, val2, ...)
        in_match = re.match(r'(\w+)\s+(NOT\s+)?IN\s*\((.*?)\)', condition, re.IGNORECASE)
        if in_match:
            field = in_match.group(1)
            is_not = bool(in_match.group(2))
            values = [v.strip().strip('"\'') for v in in_match.group(3).split(',')]
            return {
                'field': self._map_field(field),
                'operator': 'NOT IN' if is_not else 'IN',
                'value': values
            }
        
        # Handle HAS operator: traits HAS "ambitious-networker"
        has_match = re.match(r'(\w+)\s+HAS\s+["\']?([^"\']+)["\']?', condition, re.IGNORECASE)
        if has_match:
            field = has_match.group(1)
            value = has_match.group(2)
            return {
                'field': self._map_field(field),
                'operator': 'HAS',
                'value': value
            }
        
        # Handle IS EMPTY / IS NOT EMPTY
        empty_match = re.match(r'(\w+)\s+IS\s+(NOT\s+)?EMPTY', condition, re.IGNORECASE)
        if empty_match:
            field = empty_match.group(1)
            is_not = bool(empty_match.group(2))
            return {
                'field': self._map_field(field),
                'operator': 'IS NOT EMPTY' if is_not else 'IS EMPTY',
                'value': None
            }
        
        # Handle standard operators: =, !=, >, >=, <, <=, ~
        operator_match = re.match(r'(\w+)\s*(=|!=|>=|<=|>|<|~)\s*["\']?([^"\']+)["\']?', condition)
        if operator_match:
            field = operator_match.group(1)
            operator = operator_match.group(2)
            value = operator_match.group(3).strip()
            
            # Convert value to appropriate type
            if value.isdigit():
                value = int(value)
            
            return {
                'field': self._map_field(field),
                'operator': operator,
                'value': value
            }
        
        return None
    
    def _map_field(self, field: str) -> str:
        """Map CQL field name to Neo4j property name"""
        return self.FIELD_MAP.get(field.lower(), field)
    
    def to_cypher_filter(self, query: CQLQuery, node_var: str = 'p') -> str:
        """Convert CQL query to Cypher WHERE clause"""
        if not query.conditions:
            return ""
        
        where_parts = []
        
        for condition in query.conditions:
            field = condition['field']
            operator = condition['operator']
            value = condition['value']
            
            cypher_part = self._condition_to_cypher(node_var, field, operator, value)
            where_parts.append(cypher_part)
        
        where_clause = " AND ".join(where_parts)
        return f"WHERE {where_clause}" if where_clause else ""
    
    def _condition_to_cypher(self, node_var: str, field: str, operator: str, value: Any) -> str:
        """Convert a single condition to Cypher syntax"""
        
        if operator == '=':
            if isinstance(value, str):
                return f"{node_var}.{field} = '{value}'"
            else:
                return f"{node_var}.{field} = {value}"
        
        elif operator == '!=':
            if isinstance(value, str):
                return f"{node_var}.{field} <> '{value}'"
            else:
                return f"{node_var}.{field} <> {value}"
        
        elif operator in ('>', '>=', '<', '<='):
            return f"{node_var}.{field} {operator} {value}"
        
        elif operator == '~':
            # Contains operator (case-insensitive)
            return f"{node_var}.{field} =~ '(?i).*{value}.*'"
        
        elif operator == 'IN':
            # IN operator for lists
            values_str = ', '.join([f"'{v}'" if isinstance(v, str) else str(v) for v in value])
            return f"{node_var}.{field} IN [{values_str}]"
        
        elif operator == 'NOT IN':
            values_str = ', '.join([f"'{v}'" if isinstance(v, str) else str(v) for v in value])
            return f"NOT {node_var}.{field} IN [{values_str}]"
        
        elif operator == 'HAS':
            # Array contains operator
            return f"'{value}' IN {node_var}.{field}"
        
        elif operator == 'IS EMPTY':
            return f"{node_var}.{field} IS NULL"
        
        elif operator == 'IS NOT EMPTY':
            return f"{node_var}.{field} IS NOT NULL"
        
        return ""
    
    def get_order_by_clause(self, query: CQLQuery, node_var: str = 'p') -> str:
        """Generate ORDER BY clause"""
        if not query.order_by:
            return ""
        
        field = self._map_field(query.order_by)
        return f"ORDER BY {node_var}.{field} {query.order_direction}"
    
    def get_limit_clause(self, query: CQLQuery) -> str:
        """Generate LIMIT clause"""
        if not query.limit:
            return ""
        return f"LIMIT {query.limit}"


def parse_cql(query_string: str) -> CQLQuery:
    """Convenience function to parse CQL query"""
    parser = CQLParser()
    return parser.parse(query_string)


def cql_to_cypher_filter(query_string: str, node_var: str = 'p') -> str:
    """
    Convert CQL query directly to Cypher WHERE clause
    
    Example:
        cql_to_cypher_filter("industry = tech AND ambition = very_high")
        => "WHERE p.industry = 'tech' AND p.ambition_level = 'very_high'"
    """
    parser = CQLParser()
    query = parser.parse(query_string)
    return parser.to_cypher_filter(query, node_var)
