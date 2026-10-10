declare module 'react-force-graph-2d' {
  import { FC, MutableRefObject } from 'react';

  export interface GraphData {
    nodes: any[];
    links: any[];
  }

  export interface ForceGraph2DProps {
    graphData: GraphData;
    nodeRelSize?: number;
    nodeCanvasObject?: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    nodePointerAreaPaint?: (node: any, color: string, ctx: CanvasRenderingContext2D) => void;
    linkColor?: string | ((link: any) => string);
    linkWidth?: number | ((link: any) => number);
    linkDirectionalParticles?: number;
    linkDirectionalParticleWidth?: number | ((link: any) => number);
    onNodeClick?: (node: any) => void;
    onNodeHover?: (node: any | null) => void;
    cooldownTicks?: number;
    onEngineStop?: () => void;
    ref?: MutableRefObject<any>;
  }

  const ForceGraph2D: FC<ForceGraph2DProps>;
  export default ForceGraph2D;
}
