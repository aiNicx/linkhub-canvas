
import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import { Plus, Save, Trash2, Network } from 'lucide-react';
import EntityNode from './components/EntityNode';
import ChatBot from './components/ChatBot';
import { EntityData, NodeType, CanvasAction } from './types';

// Initial initial state
const initialNodes: Node<EntityData>[] = [
  {
    id: '1',
    type: NodeType.ENTITY,
    position: { x: 100, y: 100 },
    data: { title: 'Utente', content: 'Attore principale del sistema che interagisce con l\'interfaccia.' },
    style: { width: 250, height: 180 },
  },
  {
    id: '2',
    type: NodeType.ENTITY,
    position: { x: 500, y: 100 },
    data: { title: 'Database', content: 'Repository centrale per la persistenza dei dati.' },
    style: { width: 250, height: 180 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#2563eb' } },
];

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nextId, setNextId] = useState(3);
  const { fitView } = useReactFlow(); // Access ReactFlow instance methods

  // Update node data (title/content) callback
  const onNodeDataChange = useCallback((id: string, field: 'title' | 'content', value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Register Custom Node Types
  const nodeTypes = useMemo(() => ({
    [NodeType.ENTITY]: EntityNode,
  }), []);

  // Inject the update handler into node data on init and updates
  const nodesWithHandler = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onDataChange: onNodeDataChange,
      },
    }));
  }, [nodes, onNodeDataChange]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#2563eb' } }, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const id = `${Date.now()}`;
    const newNode: Node<EntityData> = {
      id,
      type: NodeType.ENTITY,
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 400 + 50,
      },
      data: {
        title: `Nuova Entità`,
        content: '',
      },
      style: { width: 240, height: 160 },
    };
    
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const clearAll = useCallback(() => {
    if (window.confirm('Sei sicuro di voler cancellare tutto il diagramma?')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  // --- BOT ACTION EXECUTOR ---
  const executeCanvasActions = useCallback((actions: CanvasAction[]) => {
    // Process Node Actions first
    setNodes((currentNodes) => {