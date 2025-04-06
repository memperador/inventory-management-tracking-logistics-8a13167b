
import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeChange,
  NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Define custom node component
const CustomNode: React.FC<{
  data: { label: string; status?: 'pending' | 'completed' | 'error' };
}> = ({ data }) => {
  const getNodeClass = () => {
    if (!data.status) return 'bg-white';
    switch (data.status) {
      case 'completed':
        return 'bg-green-100 border-green-500';
      case 'error':
        return 'bg-red-100 border-red-500';
      default:
        return 'bg-blue-100 border-blue-500';
    }
  };

  return (
    <div className={`px-4 py-2 rounded-md shadow border ${getNodeClass()}`}>
      <div className="font-medium">{data.label}</div>
    </div>
  );
};

// Define node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface WorkflowVisualizerProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Edge | Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  readOnly?: boolean;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: externalOnNodesChange,
  onEdgesChange: externalOnEdgesChange,
  onConnect: externalOnConnect,
  onNodeClick,
  readOnly = false,
}) => {
  // Use default nodes and edges if none provided
  const defaultNodes: Node[] = initialNodes.length > 0 ? initialNodes : [
    {
      id: 'start',
      type: 'custom',
      data: { label: 'Start', status: 'completed' },
      position: { x: 250, y: 0 },
    },
    {
      id: 'process',
      type: 'custom',
      data: { label: 'Process Data', status: 'pending' },
      position: { x: 250, y: 100 },
    },
    {
      id: 'validate',
      type: 'custom',
      data: { label: 'Validate', status: 'pending' },
      position: { x: 250, y: 200 },
    },
    {
      id: 'complete',
      type: 'custom',
      data: { label: 'Complete', status: 'pending' },
      position: { x: 250, y: 300 },
    },
  ];

  const defaultEdges: Edge[] = initialEdges.length > 0 ? initialEdges : [
    {
      id: 'e1-2',
      source: 'start',
      target: 'process',
      animated: true,
    },
    {
      id: 'e2-3',
      source: 'process',
      target: 'validate',
      animated: true,
    },
    {
      id: 'e3-4',
      source: 'validate',
      target: 'complete',
      animated: true,
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);

  // Define the connection callback
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = {
        ...params,
        animated: true,
      };
      
      if (externalOnConnect) {
        externalOnConnect(newEdge);
      } else {
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [externalOnConnect, setEdges],
  );

  // Handle nodes changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      if (externalOnNodesChange) {
        externalOnNodesChange(changes);
      }
    },
    [externalOnNodesChange, onNodesChange],
  );

  // Handle edges changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      if (externalOnEdgesChange) {
        externalOnEdgesChange(changes);
      }
    },
    [externalOnEdgesChange, onEdgesChange],
  );

  return (
    <ErrorBoundary>
      <div style={{ width: '100%', height: '500px' }} className="border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.2}
          maxZoom={2}
          nodesConnectable={!readOnly}
          nodesDraggable={!readOnly}
          elementsSelectable={!readOnly}
        >
          <Controls />
          <MiniMap />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </ErrorBoundary>
  );
};

export default WorkflowVisualizer;
