import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './MemoryGraph.css';
import type { GraphResponse } from '../../services/memoryGraphApi';

// Custom Memory Node Component
const MemoryNode = ({ data }: { data: { label: string; fullText?: string } }) => {
  return (
    <div 
      className="react-flow__node-default" 
      title={data.fullText || data.label}
      style={{
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
        color: '#fff',
        fontSize: '12px',
        minWidth: '180px',
        maxWidth: '300px',
        wordBreak: 'break-word',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxShadow: '0 8px 16px rgba(139, 92, 246, 0.25)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

interface ProfessionalMemoryGraphProps {
  graphData: GraphResponse | null;
  onNodeClick?: (nodeId: string, node?: Node) => void;
  className?: string;
}

const ProfessionalMemoryGraph = ({ graphData, onNodeClick, className }: ProfessionalMemoryGraphProps) => {
  const parseArrayFromUnknown = (value: unknown): string[] => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed as string[];
      } catch {}
    }
    return [];
  };

  // Utility function to truncate text to 10 words with ellipses
  const truncateText = (text: string, maxWords: number = 10): string => {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const backendBase = (import.meta as any).env?.VITE_BACKEND_URL;
  const toMediaUrl = (p: string) => {
    if (!p) return p;
    if (/^https?:/i.test(p)) return p;
    return backendBase ? `${backendBase}${p}` : p;
  };

  // Convert backend graph data to React Flow format
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!graphData || !graphData.nodes) {
      return { nodes: [], edges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeIdSet = new Set<string>();

    // Add backend nodes (skip tag nodes - we'll create combined ones)
    graphData.nodes.forEach((n, idx) => {
      if (n.type === 'tag') return; // Skip individual tag nodes from backend
      
      const meta: any = n.data || {};
      
      // Determine node styling based on type
      let style: any = {
        padding: '10px 15px',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: 500,
        border: 'none',
        color: '#fff',
        minWidth: '120px',
        textAlign: 'center',
      };

      let label = n.label;

      switch (n.type) {
        case 'memory':
          const fullText = meta.document || n.label;
          label = truncateText(fullText);
          // Style will be handled by custom MemoryNode component
          break;
        case 'person':
          style = {
            ...style,
            background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
            borderRadius: '50%',
            width: '100px',
            height: '100px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)',
            fontSize: '12px',
            fontWeight: 600,
          };
          break;
        case 'event':
          style = {
            ...style,
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
            padding: '10px 14px',
          };
          break;
        case 'media':
          const mediaPath = n.label || '';
          const mediaUrl = toMediaUrl(mediaPath);
          style = {
            ...style,
            background: `url(${mediaUrl}) center/cover, linear-gradient(135deg, #EC4899 0%, #F472B6 100%)`,
            width: '90px',
            height: '90px',
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(236, 72, 153, 0.25)',
            borderRadius: '8px',
          };
          label = ''; // No text for media nodes
          break;
      }

      const nodeData: any = { label, originalNode: n };
      let nodeType = 'default';
      
      if (n.type === 'memory') {
        const fullText = meta.document || n.label;
        nodeData.fullText = fullText;
        nodeType = 'memoryNode';
      }

      nodes.push({
        id: n.id,
        type: nodeType,
        position: { x: idx * 250, y: Math.random() * 400 },
        data: nodeData,
        style: nodeType === 'memoryNode' ? undefined : style,
      });
      
      nodeIdSet.add(n.id);
    });

    // Add combined tags nodes for each memory (from metadata)
    graphData.nodes.forEach((n) => {
      if (n.type !== 'memory') return;
      
      const meta: any = n.data || {};
      const tagsArr = parseArrayFromUnknown(meta.tags);
      
      if (tagsArr.length > 0) {
        const tagsNodeId = `tags:${n.id}`;
        if (!nodeIdSet.has(tagsNodeId)) {
          nodes.push({
            id: tagsNodeId,
            type: 'default',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: tagsArr.join(', ') },
            style: {
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '10px',
              fontWeight: 500,
              border: 'none',
              color: '#fff',
              boxShadow: '0 6px 12px rgba(245, 158, 11, 0.25)',
              minWidth: '80px',
              maxWidth: '280px',
              textAlign: 'center',
            },
          });
          nodeIdSet.add(tagsNodeId);
        }
        
        edges.push({
          id: `${n.id}-${tagsNodeId}`,
          source: n.id,
          target: tagsNodeId,
          label: 'tags',
          type: ConnectionLineType.Bezier,
          animated: false,
          style: { stroke: '#D1D5DB', strokeWidth: 1.5 },
          labelStyle: { fill: '#6B7280', fontWeight: 600, fontSize: 10 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 4,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#D1D5DB', width: 18, height: 18 },
        });
      }

      // Add media nodes (from metadata)
      const mediaArr = parseArrayFromUnknown(meta.media);
      mediaArr.forEach((m: string) => {
        const mediaId = `media:${m}`;
        if (!nodeIdSet.has(mediaId)) {
          const mediaUrl = toMediaUrl(m);
          nodes.push({
            id: mediaId,
            type: 'default',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: '' },
            style: {
              background: `url(${mediaUrl}) center/cover, linear-gradient(135deg, #EC4899 0%, #F472B6 100%)`,
              width: '90px',
              height: '90px',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(236, 72, 153, 0.25)',
              borderRadius: '8px',
              border: 'none',
            },
          });
          nodeIdSet.add(mediaId);
        }
        
        edges.push({
          id: `${n.id}-${mediaId}`,
          source: n.id,
          target: mediaId,
          label: 'media',
          type: ConnectionLineType.Bezier,
          animated: false,
          style: { stroke: '#D1D5DB', strokeWidth: 1.5 },
          labelStyle: { fill: '#6B7280', fontWeight: 600, fontSize: 10 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 4,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#D1D5DB', width: 18, height: 18 },
        });
      });
    });

    // Add backend edges (skip tag edges - we created them above)
    graphData.edges.forEach((e) => {
      if (e.label === 'tag' || e.target.startsWith('tag:') || e.source.startsWith('tag:')) return;
      if (e.label === 'media' || e.target.startsWith('media:')) return; // Skip media edges too
      
      edges.push({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: ConnectionLineType.Bezier,
        animated: false,
        style: { stroke: '#D1D5DB', strokeWidth: 2 },
        labelStyle: { fill: '#6B7280', fontWeight: 600, fontSize: 10 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#D1D5DB', width: 18, height: 18 },
      });
    });

    return { nodes, edges };
  }, [graphData]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [edges, _setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id, node);
      }
    },
    [onNodeClick]
  );

  const nodeTypes = useMemo(() => ({
    memoryNode: MemoryNode,
  }), []);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: ConnectionLineType.Bezier,
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="#cbd5e1"
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
        />
        <Controls 
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};

export default ProfessionalMemoryGraph;

