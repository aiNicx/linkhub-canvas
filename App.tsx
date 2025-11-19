
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
      let updatedNodes = [...currentNodes];
      
      actions.forEach((action) => {
        if (action.type === 'add_node') {
          const newNode: Node<EntityData> = {
            id: action.payload.id || `node-${Date.now()}-${Math.random()}`,
            type: NodeType.ENTITY,
            position: { 
              x: action.payload.x || Math.random() * 400 + 50, 
              y: action.payload.y || Math.random() * 400 + 50 
            },
            data: {
              title: action.payload.title || 'Nuova Entità',
              content: action.payload.content || '',
            },
            style: { width: 250, height: 180 },
          };
          updatedNodes.push(newNode);
        } else if (action.type === 'update_node') {
          updatedNodes = updatedNodes.map((node) =>
            node.id === action.payload.id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    title: action.payload.title !== undefined ? action.payload.title : node.data.title,
                    content: action.payload.content !== undefined ? action.payload.content : node.data.content,
                  },
                  position: action.payload.x !== undefined && action.payload.y !== undefined
                    ? { x: action.payload.x, y: action.payload.y }
                    : node.position,
                }
              : node
          );
        } else if (action.type === 'delete_node') {
          updatedNodes = updatedNodes.filter((node) => node.id !== action.payload.id);
        }
      });
      
      return updatedNodes;
    });

    // Process Edge Actions
    setEdges((currentEdges) => {
      let updatedEdges = [...currentEdges];
      
      actions.forEach((action) => {
        if (action.type === 'add_edge') {
          const newEdge: Edge = {
            id: action.payload.id || `edge-${Date.now()}-${Math.random()}`,
            source: action.payload.source!,
            target: action.payload.target!,
            animated: true,
            style: { stroke: '#2563eb' },
          };
          updatedEdges.push(newEdge);
        } else if (action.type === 'delete_edge') {
          updatedEdges = updatedEdges.filter((edge) => edge.id !== action.payload.id);
        }
      });
      
      return updatedEdges;
    });

    // Auto-fit view after changes
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
  }, [setNodes, setEdges, fitView]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodesWithHandler}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
        <Controls />
        
        {/* Floating Action Buttons */}
        <Panel position="top-left" className="flex gap-2">
          <button
            onClick={addNode}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Aggiungi Nodo
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Cancella Tutto
          </button>
        </Panel>
      </ReactFlow>

      {/* ChatBot */}
      <ChatBot nodes={nodes} edges={edges} onExecuteActions={executeCanvasActions} />
    </div>
  );
};

const App = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default App;