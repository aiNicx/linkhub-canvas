/**
 * OpenRouter AI Service
 * 
 * Servizio per l'integrazione con OpenRouter API.
 * Gestisce la comunicazione con il modello AI per operazioni sul canvas.
 */

import { Node, Edge } from 'reactflow';
import { CanvasAction } from '../types';
import { getOpenRouterConfig, OpenRouterConfig } from '../config/openrouter.config';

/**
 * Ottiene il client configurato per OpenRouter
 */
const getApiKey = (): string | null => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("VITE_OPENROUTER_API_KEY non trovata nelle variabili d'ambiente");
    return null;
  }
  return apiKey;
};

/**
 * Interfaccia per i messaggi della chat
 */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Interfaccia per la risposta di OpenRouter
 */
interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Definizione del tool per le modifiche al canvas
 */
const getCanvasTools = () => [{
  type: 'function',
  function: {
    name: 'propose_plan',
    description: 'OBBLIGATORIO: Usa questo tool per proporre modifiche al canvas (creazione, modifica, spostamento nodi o collegamenti). DEVI usare questo tool quando l\'utente chiede di creare template o fare modifiche strutturali. NON mostrare JSON nella risposta testuale - usa SOLO questo tool.',
    parameters: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Una breve spiegazione di cosa faranno queste modifiche.',
        },
        actions: {
          type: 'array',
          description: 'Lista sequenziale di azioni da eseguire.',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['add_node', 'update_node', 'delete_node', 'add_edge', 'delete_edge'],
                description: 'Tipo di azione'
              },
              payload: {
                type: 'object',
                description: 'Dati necessari per l\'azione',
                properties: {
                  id: { 
                    type: 'string',
                    description: 'ID univoco del nodo (es. "okr-1234567890")'
                  },
                  title: { 
                    type: 'string',
                    description: 'SOLO la tipologia dell\'entità (es. "OKR", "KR", "Rischio", "KPI", "Iniziativa"). NON inserire qui la descrizione completa.'
                  },
                  content: { 
                    type: 'string',
                    description: 'La descrizione completa dell\'entità (es. "Aumentare le vendite del 30%", "Tasso di conversione < 2%", "Campagna marketing digitale"). NON lasciare vuoto.'
                  },
                  x: { 
                    type: 'number',
                    description: 'Coordinata X del nodo'
                  },
                  y: { 
                    type: 'number',
                    description: 'Coordinata Y del nodo'
                  },
                  source: { 
                    type: 'string',
                    description: 'ID del nodo sorgente (per add_edge)'
                  },
                  target: { 
                    type: 'string',
                    description: 'ID del nodo target (per add_edge)'
                  },
                },
              }
            },
            required: ['type', 'payload']
          }
        }
      },
      required: ['description', 'actions']
    }
  }
}];

/**
 * Costruisce il system prompt con il contesto del canvas
 */
const buildSystemPrompt = (nodes: Node[], edges: Edge[]): string => {
  const canvasContext = JSON.stringify({
    nodes: nodes.map(n => ({ 
      id: n.id, 
      type: n.type, 
      title: n.data.title, 
      content: n.data.content, 
      position: n.position 
    })),
    edges: edges.map(e => ({ 
      id: e.id, 
      source: e.source, 
      target: e.target 
    }))
  }, null, 2);

  return `Sei un esperto OKR Coach di LinkHub (www.okrlinkhub.com), specializzato nella metodologia RiskHub per aiutare i team a creare e gestire Strategy Canvas OKR.

CONTESTO ATTUALE DEL CANVAS:
${canvasContext}

TUA IDENTITÀ:
Sei un Coach OKR certificato che incarna la cultura LinkHub basata su tre pilastri:
1. COMBATTERE: Non arrendersi mai, c'è sempre un altro modo. Gli OKR sono outcome-based e richiedono mentalità resiliente.
2. CONSAPEVOLEZZA: Più si punta in alto, più ostacoli si creano. I rischi sono scarico di responsabilità, non fallimenti.
3. CONFRONTO: Rispetto profondo per opinioni diverse, senza giudizio. L'allineamento nasce dalla capacità di mettersi nei panni degli altri.

METODOLOGIA LINKHUB OKR:
- OBJECTIVE (O): La direzione qualitativa, il "perché" facciamo le cose. Rimane stabile nel tempo.
- KEY RESULT (KR): 1-2 indicatori di obiettivo semplici (non composti), con target ambizioso (+30% del MEV). Mai calcolare % completamento vs target.
- RISCHI: Gli ostacoli che potrebbero impedirci di raggiungere l'OKR. Dividere per importanza/componenti/fasi.
- KPI: Indicatori di rischio con soglie di allerta, misurano efficacia iniziative. Possono essere composti.
- INIZIATIVE: Azioni concrete per mitigare i rischi e raggiungere l'OKR.

DUE LEGGI FONDAMENTALI:
1. PRIMA LEGGE: Gli OKR NON devono essere collegati alla valutazione personale. Servono a dare direzione, stimolare le persone e creare squadra.
2. SECONDA LEGGE: Il target deve essere ambizioso (regola del +30%). Puntare alla luna per credere che nulla è impossibile con la giusta strategia.

PECCATO ORIGINALE:
Non confrontare mai "quanto raggiunto / target", ma solo "quanto raggiunto rispetto al passato". Guardare indietro solo per imparare, mai per dare meriti o colpe.

REGOLE TECNICHE:
1. Rispondi SEMPRE in Italiano, in modo empatico e da Coach (fai domande, esplora, guida).
2. Hai pieno accesso visivo al canvas tramite il JSON sopra.
3. Per modifiche al canvas:
   - Se la richiesta è vaga, fai domande di chiarimento seguendo la metodologia (es. "Qual è lo scopo di ciò che fate?").
   - Se hai abbastanza info, DEVI chiamare il tool 'propose_plan' con la lista delle azioni.
   - NON mostrare mai JSON nella risposta testuale.
   - La tua risposta deve essere una spiegazione umana e da Coach (es. "Perfetto! Ho preparato uno Strategy Canvas OKR per il tuo team. Vediamo se rispecchia la tua visione...").
   - Quando crei nodi, usa ID univoci (es. 'okr-{timestamp}') e posizioni sensate (distanza min 250px).

4. STRUTTURA STRATEGY CANVAS OKR:
   - Livello 1 (top): Objective (frase qualitativa)
   - Livello 2: 1-2 Key Results (indicatore + target + data)
   - Livello 3: 3-5 Rischi principali
   - Livello 4: KPI collegati ai rischi (indicatore + soglia)
   - Livello 5: Iniziative per ogni rischio
   
   IMPORTANTE - FORMATO NODI:
   Per OGNI nodo che crei, devi separare correttamente:
   - title: SOLO la tipologia (es. "OKR", "KR", "Rischio", "KPI", "Iniziativa")
   - content: La descrizione completa (es. "Aumentare la soddisfazione cliente del 30%")
   
   ESEMPI CORRETTI:
   ✅ { "title": "OKR", "content": "Diventare leader di mercato nel settore B2B" }
   ✅ { "title": "KR", "content": "Revenue ricorrente > €500K entro Q4 2025" }
   ✅ { "title": "Rischio", "content": "Reticenza al cambiamento dei colleghi" }
   ✅ { "title": "KPI", "content": "Percentuale di adesione ai nuovi processi > 70%" }
   ✅ { "title": "Iniziativa", "content": "Rilasciare 3 app a settimana" }
   
   ESEMPI SBAGLIATI (NON FARE MAI COSÌ):
   ❌ { "title": "Essere innovativi nei processi", "content": "" }
   ❌ { "title": "Rilasciare 3 app a settimana", "content": "" }
   ❌ { "title": "KPI: Percentuale di adesione > 70%", "content": "Descrizione entità..." }

5. DOMANDE GUIDA per scoprire gli elementi:
   
   Per OBJECTIVE:
   - "Qual è lo scopo di ciò che fate?"
   - "Cosa vi chiede l'azienda prima di ogni altra cosa?"
   
   Per KEY RESULT:
   - "Alla fine del trimestre, qual è il primo numero che guardate?"
   - "Come capirete se avete lavorato meglio dell'anno scorso?"
   
   Per RISCHI (tecnica post-mortem):
   - "Immaginate di aver fallito l'obiettivo... cosa è probabilmente successo?"
   - "Quali problemi accadono più spesso?"
   
   Per KPI:
   - "Come possiamo misurare questo rischio?"
   - "Quali numeri vedreste in una dashboard per capire se le iniziative funzionano?"
   
   Per INIZIATIVE:
   - "Cosa state già facendo per diminuire quel rischio?"
   - "Quale soluzione potremmo testare per prima?"

6. PRINCIPI DI COACHING:
   - Semplificate ma non banalizzate
   - Focus su "efficace" non su "giusto"
   - Trasparenza > riservatezza
   - Logica > procedure rigide
   - Astenersi dal giudizio
   - Fare domande potenti, non dare soluzioni preconfezionate

IMPORTANTE: 
- Sei un Coach, non un esecutore. Guida, esplora, fai riflettere.
- Usa un tono caldo, motivante, che trasmette fiducia nelle persone.
- Celebra i progressi e normalizza gli ostacoli come parte del percorso.
- Se l'utente sembra confuso sulla metodologia, offri spiegazioni brevi e chiedi se vuole approfondire.`;
};

/**
 * Effettua una chiamata all'API di OpenRouter
 */
const callOpenRouter = async (
  messages: ChatMessage[],
  config: OpenRouterConfig,
  tools?: any[]
): Promise<OpenRouterResponse> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key mancante");
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // Aggiungi header opzionali per il ranking su OpenRouter
  if (config.siteUrl) {
    headers['HTTP-Referer'] = config.siteUrl;
  }
  if (config.siteName) {
    headers['X-Title'] = config.siteName;
  }

  const body: any = {
    model: config.model,
    messages: messages,
  };

  // Aggiungi parametri opzionali
  if (config.temperature !== undefined) {
    body.temperature = config.temperature;
  }
  if (config.maxTokens !== undefined) {
    body.max_tokens = config.maxTokens;
  }
  if (config.topP !== undefined) {
    body.top_p = config.topP;
  }

  // Aggiungi provider preferences se specificate
  if (config.provider) {
    body.provider = config.provider;
  }

  // Aggiungi tools se forniti
  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

/**
 * Genera una descrizione per un'entità (legacy helper)
 */
export const generateDescription = async (title: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "Errore: API Key mancante.";
  }

  const config = getOpenRouterConfig();

  try {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Scrivi una descrizione concisa e tecnica (massimo 30 parole) per un'entità di sistema chiamata "${title}". In Italiano.`
      }
    ];

    const response = await callOpenRouter(messages, config);
    
    return response.choices[0]?.message?.content || "Nessuna descrizione generata.";
  } catch (error) {
    console.error("Errore generazione descrizione:", error);
    return "Impossibile generare la descrizione al momento.";
  }
};

/**
 * Rimuove blocchi JSON dalla risposta testuale per evitare che vengano mostrati in chat
 */
const sanitizeResponseText = (text: string): string => {
  if (!text) return text;
  
  const originalText = text;
  let sanitized = text;
  
  // Pattern per trovare blocchi JSON (anche multilinea)
  const jsonBlockPattern = /```json\s*[\s\S]*?```/g;
  if (jsonBlockPattern.test(sanitized)) {
    console.warn('⚠️ Rilevato JSON nella risposta del bot - rimosso automaticamente');
    sanitized = sanitized.replace(jsonBlockPattern, '');
  }
  
  // Pattern per blocchi JSON senza markdown (con "description" e "actions")
  const jsonPattern = /\{[\s\S]*"description"[\s\S]*"actions"[\s\S]*\}/g;
  if (jsonPattern.test(sanitized)) {
    console.warn('⚠️ Rilevato JSON nella risposta del bot - rimosso automaticamente');
    sanitized = sanitized.replace(jsonPattern, '');
  }
  
  // Rimuove anche blocchi di codice generici che contengono JSON
  const codeBlockPattern = /```[\s\S]*?\{[\s\S]*?\}[\s\S]*?```/g;
  if (codeBlockPattern.test(sanitized)) {
    console.warn('⚠️ Rilevato blocco di codice con JSON nella risposta del bot - rimosso automaticamente');
    sanitized = sanitized.replace(codeBlockPattern, '');
  }
  
  // Pulisce spazi multipli e newline eccessive
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n').trim();
  
  // Se dopo la pulizia non rimane nulla, usa un messaggio di default
  if (!sanitized || sanitized.length < 3) {
    console.warn('⚠️ Risposta del bot completamente rimossa (conteneva solo JSON) - usando messaggio di default');
    return "Ho preparato un piano di modifiche.";
  }
  
  // Log se il testo è stato modificato
  if (originalText !== sanitized) {
    console.log('✅ Risposta del bot sanitizzata (rimosso JSON)');
  }
  
  return sanitized;
};

/**
 * Invia un messaggio al bot e gestisce eventuali tool calls
 */
export const sendMessageToBot = async (
  history: ChatMessage[], 
  message: string, 
  currentNodes: Node[], 
  currentEdges: Edge[]
): Promise<{ text: string; actions?: CanvasAction[]; actionDescription?: string }> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key mancante");
  }

  const config = getOpenRouterConfig();
  const systemPrompt = buildSystemPrompt(currentNodes, currentEdges);

  try {
    // Costruisci la lista dei messaggi
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    // Chiama OpenRouter con i tools
    const response = await callOpenRouter(messages, config, getCanvasTools());

    const choice = response.choices[0];
    
    // Log usage se disponibile
    if (response.usage) {
      console.log('OpenRouter usage:', response.usage);
    }

    // Controlla se ci sono tool calls
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      
      if (toolCall.function.name === 'propose_plan') {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          // Sanitizza anche la descrizione per sicurezza
          const description = sanitizeResponseText(args.description || "Ho preparato un piano di modifiche.");
          return {
            text: description,
            actions: args.actions,
            actionDescription: args.description
          };
        } catch (parseError) {
          console.error("Errore nel parsing degli argomenti del tool:", parseError);
          return { text: "Ho riscontrato un errore nell'elaborazione del piano." };
        }
      }
    }

    // Risposta normale senza tool calls
    // Sanitizza la risposta per rimuovere eventuali JSON
    const rawText = choice.message.content || "Nessuna risposta.";
    const sanitizedText = sanitizeResponseText(rawText);
    
    return { 
      text: sanitizedText
    };

  } catch (error) {
    console.error("Errore nella comunicazione con OpenRouter:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('API error: 401')) {
        return { text: "Errore: API Key non valida. Verifica la tua chiave OpenRouter." };
      }
      if (error.message.includes('API error: 429')) {
        return { text: "Errore: Limite di rate raggiunto. Riprova tra qualche istante." };
      }
      if (error.message.includes('API error: 402')) {
        return { text: "Errore: Credito insufficiente. Ricarica il tuo account OpenRouter." };
      }
    }
    
    return { text: "Scusa, ho riscontrato un errore di connessione. Riprova." };
  }
};

/**
 * Helper per convertire la history da Gemini a OpenRouter
 */
export const convertHistoryToOpenRouter = (history: any[]): ChatMessage[] => {
  return history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : msg.role,
    content: msg.parts?.[0]?.text || msg.text || ''
  }));
};

