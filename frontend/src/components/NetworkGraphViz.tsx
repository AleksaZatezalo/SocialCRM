import React, { useCallback, useState, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { GraphNode } from '../types';

interface NetworkGraphVizProps {
  nodes: GraphNode[];
  edges: { source: string; target: string; strength: number; type: string }[];
  onNodeClick?: (node: GraphNode) => void;
  onCreateConnection?: (fromId: string, toId: string) => void;
  selectedNodeId?: string;
}

const NetworkGraphViz: React.FC<NetworkGraphVizProps> = ({ 
  nodes, 
  edges, 
  onNodeClick,
  onCreateConnection,
  selectedNodeId 
}) => {
  const fgRef = useRef<any>();
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [dragStartNode, setDragStartNode] = useState<GraphNode | null>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  
  // Track optimistic edges separately
  const [optimisticEdges, setOptimisticEdges] = useState<any[]>([]);
  
  // Merge real edges with optimistic edges - memoized
  const allEdges = useMemo(() => [...edges, ...optimisticEdges], [edges, optimisticEdges]);

  // Listen for Ctrl key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false);
        setDragStartNode(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Color mapping based on ambition level
  const getNodeColor = (node: GraphNode) => {
    if (selectedNodeId === node.id) return '#e74c3c'; // Red for selected
    if (dragStartNode?.id === node.id) return '#9b59b6'; // Purple for drag start
    
    switch (node.ambition_level) {
      case 'very_high':
        return '#e74c3c'; // Red
      case 'high':
        return '#e67e22'; // Orange
      case 'medium':
        return '#f39c12'; // Yellow
      case 'low':
        return '#95a5a6'; // Gray
      default:
        return '#3498db'; // Blue
    }
  };

  // Node size - all nodes same size
  const getNodeSize = (node: GraphNode) => {
    return 6;
  };

  // Link color based on strength
  const getLinkColor = (link: any) => {
    const strength = link.strength || 3;
    const opacity = 0.2 + (strength / 5) * 0.6;
    return `rgba(149, 165, 166, ${opacity})`;
  };

  // Link width based on strength
  const getLinkWidth = (link: any) => {
    return (link.strength || 3) * 0.5;
  };

  const handleNodeClick = useCallback((node: any) => {
    // If Ctrl is pressed and we have a start node, create connection
    if (isCtrlPressed && dragStartNode && dragStartNode.id !== node.id) {
      // Add edge to optimistic edges immediately for instant feedback
      const newEdge = {
        source: dragStartNode.id,
        target: node.id,
        strength: 3,
        type: 'professional'
      };
      console.log('Adding optimistic edge:', newEdge);
      setOptimisticEdges(prev => {
        const updated = [...prev, newEdge];
        console.log('Optimistic edges now:', updated);
        return updated;
      });
      
      // Then call API in background (don't wait for refresh)
      if (onCreateConnection) {
        console.log('Calling API to create connection...');
        onCreateConnection(dragStartNode.id, node.id);
      }
      setDragStartNode(null);
    } else if (isCtrlPressed) {
      // Start drag connection
      setDragStartNode(node as GraphNode);
    } else {
      // Normal click - just call the handler, don't trigger any refresh
      console.log('Normal node click, calling onNodeClick');
      if (onNodeClick) {
        onNodeClick(node as GraphNode);
      }
    }
  }, [onNodeClick, onCreateConnection, isCtrlPressed, dragStartNode]);

  const handleNodeHover = useCallback((node: any) => {
    // Only update if the hover node actually changed
    if (node?.id === hoverNode?.id) return;
    
    setHoverNode(node || null);
    
    if (node) {
      const neighbors = new Set();
      const links = new Set();
      
      // Use allEdges (includes optimistic) for hover highlighting
      allEdges.forEach(link => {
        if (link.source === node.id || (link.source as any).id === node.id) {
          const target = typeof link.target === 'object' ? (link.target as any).id : link.target;
          neighbors.add(target);
          links.add(link);
        }
        if (link.target === node.id || (link.target as any).id === node.id) {
          const source = typeof link.source === 'object' ? (link.source as any).id : link.source;
          neighbors.add(source);
          links.add(link);
        }
      });
      
      setHighlightNodes(neighbors);
      setHighlightLinks(links);
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [allEdges, hoverNode]);

  // Draw custom node with label
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Get node color inline to avoid dependency
    const getColor = (n: GraphNode) => {
      if (selectedNodeId === n.id) return '#e74c3c';
      switch (n.ambition_level) {
        case 'very_high': return '#e74c3c';
        case 'high': return '#e67e22';
        case 'medium': return '#f39c12';
        case 'low': return '#95a5a6';
        default: return '#3498db';
      }
    };
    const label = node.name;
    const fontSize = 12 / globalScale;
    const nodeRadius = getNodeSize(node);
    
    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = getColor(node);
    ctx.fill();
    
    // Draw border for highlighted nodes
    if (highlightNodes.has(node.id) || hoverNode?.id === node.id || selectedNodeId === node.id) {
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }
    
    // Draw label
    if (globalScale > 0.8 || hoverNode?.id === node.id || selectedNodeId === node.id) {
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#2c3e50';
      ctx.fillText(label, node.x, node.y + nodeRadius + fontSize);
    }
  }, [highlightNodes, hoverNode, selectedNodeId]);

  // Format graph data - use allEdges (real + optimistic) for instant updates
  const graphData = useMemo(() => {
    console.log('Recalculating graphData. Nodes:', nodes.length, 'AllEdges:', allEdges.length);
    return {
      nodes: nodes.map(node => ({ ...node })),
      links: allEdges.map(edge => ({
        source: edge.source,
        target: edge.target,
        strength: edge.strength,
        type: edge.type,
      }))
    };
  }, [nodes, allEdges]);

  return (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      {isCtrlPressed && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(155, 89, 182, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          {dragStartNode 
            ? `Connecting from ${dragStartNode.name} - Click target node`
            : 'Connection Mode: Click first node, then click second node'
          }
        </div>
      )}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeRelSize={6}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = color;
          const size = getNodeSize(node) + 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fill();
        }}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link: any) => highlightLinks.has(link) ? 2 : 0}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTicks={100}
        onEngineStop={() => fgRef.current?.zoomToFit(400, 50)}
      />
    </div>
  );
};

export default NetworkGraphViz;
