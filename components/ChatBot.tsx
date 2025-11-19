
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Check, Play } from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { sendMessageToBot } from '../services/openrouterService';
import { ChatMessage, CanvasAction } from '../types';

interface ChatBotProps {
  nodes: Node[];
  edges: Edge[];
  onExecuteActions: (actions: CanvasAction[]) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ nodes, edges, onExecuteActions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'Ciao! Sono il tuo assistente Canvas. Posso aiutarti a creare strutture, template (es. OKR) o modificare le entità. Dimmi cosa fare!' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    // Add User Message
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: 'user' as const, text: userText }
    ];
    setMessages(newMessages);

    try {
      // Filter history for API:
      // 1. Remove the first 'welcome' message (local only)
      // 2. Remove the last message (current user input), because it is sent via sendMessage param, not history
      const apiHistory = newMessages.slice(1, -1).map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.text || ''
      }));

      const response = await sendMessageToBot(apiHistory, userText, nodes, edges);

      // Add Bot Response
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.text,
          isProposal: !!response.actions,
          proposedActions: response.actions,
          isExecuted: false
        }
      ]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: 'Si è verificato un errore. Riprova.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProposal = (messageId: string, actions: CanvasAction[]) => {
    onExecuteActions(actions);
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, isExecuted: true } : m
    ));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <div 
        className={`bg-white w-80 sm:w-96 shadow-2xl rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out mb-4 pointer-events-auto flex flex-col ${isOpen ? 'opacity-100 translate-y-0 h-[500px]' : 'opacity-0 translate-y-10 h-0'}`}
      >
        {/* Header */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">Canvas AI Assistant</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Proposal Card */}
                {msg.isProposal && msg.proposedActions && (
                  <div className={`mt-3 p-3 rounded border ${msg.isExecuted ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <Play className="w-3 h-3" />
                      {msg.isExecuted ? 'Modifiche Applicate' : 'Proposta Modifiche'}
                    </div>
                    <ul className="list-disc list-inside text-xs text-gray-600 mb-3 space-y-1">
                      {msg.proposedActions.slice(0, 3).map((act, idx) => (
                        <li key={idx}>
                          {act.type === 'add_node' && `Creazione nodo "${act.payload.title}"`}
                          {act.type === 'update_node' && `Modifica nodo "${act.payload.title}"`}
                          {act.type === 'add_edge' && `Collegamento nodi`}
                        </li>
                      ))}
                      {msg.proposedActions.length > 3 && <li>e altre {msg.proposedActions.length - 3} azioni...</li>}
                    </ul>
                    
                    {!msg.isExecuted ? (
                      <button 
                        onClick={() => handleConfirmProposal(msg.id, msg.proposedActions!)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-xs font-bold transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Applica al Canvas
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-green-600 text-xs font-bold py-1">
                        <Check className="w-4 h-4" /> Completato
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-3 rounded-bl-none shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-200">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Chiedi di creare un template..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900 placeholder-gray-500"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ChatBot;
