
import React, { memo, useCallback, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { Wand2, GripHorizontal } from 'lucide-react';
import { EntityData } from '../types';
import { generateDescription } from '../services/openrouterService';

// Define the props for the custom node
const EntityNode = ({ id, data, selected }: NodeProps<EntityData>) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTitleChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onDataChange) {
      data.onDataChange(id, 'title', evt.target.value);
    }
  }, [data, id]);

  const handleContentChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data.onDataChange) {
      data.onDataChange(id, 'content', evt.target.value);
    }
  }, [data, id]);

  const handleGenerate = useCallback(async () => {
    if (!data.title) return;
    setIsGenerating(true);
    try {
      const description = await generateDescription(data.title);
      if (data.onDataChange) {
        data.onDataChange(id, 'content', description);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [data, id]);

  return (
    <>
      <NodeResizer 
        color="#2563eb" 
        isVisible={selected} 
        minWidth={200} 
        minHeight={150} 
      />
      
      <div className={`h-full w-full flex flex-col bg-white rounded-lg shadow-lg border transition-colors duration-200 overflow-hidden ${selected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'}`}>
        {/* Header Bar */}
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center gap-2 cursor-move handle-drag">
          <GripHorizontal className="w-4 h-4 text-gray-400" />
          <input 
            className="flex-1 bg-transparent font-semibold text-gray-900 focus:outline-none focus:bg-white rounded px-1 text-sm placeholder-gray-500" 
            value={data.title} 
            onChange={handleTitleChange}
            placeholder="Nome Entità"
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !data.title}
            className={`p-1 rounded hover:bg-blue-100 transition-colors ${isGenerating ? 'text-blue-400 animate-pulse' : 'text-gray-500 hover:text-blue-600'}`}
            title="Genera descrizione con AI"
          >
            <Wand2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-2 min-h-0 bg-white">
          <textarea 
            className="w-full h-full resize-none text-sm text-gray-900 bg-transparent focus:outline-none p-1 rounded focus:bg-gray-50 placeholder-gray-400"
            value={data.content}
            onChange={handleContentChange}
            placeholder="Descrizione entità..."
            style={{ cursor: 'text' }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking text area
          />
        </div>

        {/* Handles for connections */}
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 !bg-blue-500 border-2 border-white" 
        />
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 !bg-blue-500 border-2 border-white" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-3 h-3 !bg-blue-500 border-2 border-white" 
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 !bg-blue-500 border-2 border-white" 
        />
      </div>
    </>
  );
};

export default memo(EntityNode);
