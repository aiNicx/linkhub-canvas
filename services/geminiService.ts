
import { GoogleGenAI, FunctionDeclaration, Type, Schema } from "@google/genai";
import { Node, Edge } from 'reactflow';
import { CanvasAction } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key non trovata in process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper for description generation (legacy)
export const generateDescription = async (title: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Errore: API Key mancante.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Scrivi una descrizione concisa e tecnica (massimo 30 parole) per un'entità di sistema chiamata "${title}". In Italiano.`,
    });

    return response.text || "Nessuna descrizione generata.";
  } catch (error) {
    console.error("Errore generazione Gemini:", error);
    return "Impossibile generare la descrizione al momento.";
  }
};

// --- CHAT & TOOLS DEFINITION ---

const proposePlanTool: FunctionDeclaration = {
  name: 'propose_plan',
  description: 'Proponi una serie di modifiche al canvas (creazione, modifica, spostamento nodi o collegamenti). Usa questo tool quando l\'utente chiede di creare template o fare modifiche strutturali.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      description: {
        type: Type.STRING,
        description: 'Una breve spiegazione di cosa faranno queste modifiche.',
      },
      actions: {
        type: Type.ARRAY,
        description: 'Lista sequenziale di azioni da eseguire.',
        items: {
          type: Type.OBJECT,
          properties: {
            type: { 
              type: Type.STRING, 
              enum: ['add_node', 'update_node', 'delete_node', 'add_edge'],
              description: 'Tipo di azione'
            },
            payload: {
              type: Type.OBJECT,
              description: 'Dati necessari per l\'azione (es. x, y, title, content per add_node; source, target per add_edge)',
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                source: { type: Type.STRING },
                target: { type: Type.STRING },
              }
            }
          },
          required: ['type', 'payload']
        }
      }
    },
    required: ['description', 'actions']
  }
};

export const sendMessageToBot = async (
  history: any[], 
  message: string, 
  currentNodes: Node[], 
  currentEdges: Edge[]
): Promise<{ text: string, actions?: CanvasAction[], actionDescription?: string }> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key mancante");

  // Serialize canvas context for the bot
  const canvasContext = JSON.stringify({
    nodes: currentNodes.map(n => ({ id: n.id, type: n.type, title: n.data.title, content: n.data.content, position: n.position })),
    edges: currentEdges.map(e => ({ id: e.id, source: e.source, target: e.target }))
  }, null, 2);

  const systemInstruction = `
    Sei un esperto assistente per la gestione di diagrammi a nodi (Canvas Entità).
    
    CONTESTO ATTUALE DEL CANVAS:
    ${canvasContext}

    REGOLE:
    1. Rispondi in modo utile e conciso in Italiano.
    2. Hai pieno accesso visivo (virtuale) al canvas tramite il JSON sopra.
    3. Se l'utente chiede di modificare il canvas (creare template, aggiungere nodi, spostare cose):
       - Se la richiesta è vaga, fai domande di chiarimento.
       - Se hai abbastanza info, chiama il tool 'propose_plan' con la lista delle azioni.
       - NON dire "Lo faccio subito", usa il tool per proporre il piano.
       - Quando crei nuovi nodi, inventa ID univoci (es. 'node-timestamp') e posizioni sensate (x, y) per non sovrapporli troppo (distanziali di almeno 300px).
    4. Per creare template (es. OKR, Family Tree), struttura i nodi gerarchicamente.
  `;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [proposePlanTool] }],
      },
      history: history
    });

    // Updated to use object parameter as per @google/genai spec
    const result = await chat.sendMessage({ message: message });
    
    // Check for function calls
    // FIX: result IS the response object, do not access .response property
    const functionCalls = result.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'propose_plan') {
        const args = call.args as any;
        return {
          text: args.description || "Ho preparato un piano di modifiche.",
          actions: args.actions,
          actionDescription: args.description
        };
      }
    }

    return { text: result.text || "Nessuna risposta." };
  } catch (error) {
    console.error("Errore chat:", error);
    return { text: "Scusa, ho riscontrato un errore di connessione o nel formato della risposta." };
  }
};
