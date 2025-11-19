/**
 * OpenRouter Configuration
 * 
 * Configurazione centralizzata per l'integrazione con OpenRouter API.
 * Modifica questi valori per personalizzare il comportamento dell'AI.
 */

export interface OpenRouterConfig {
  // Model configuration
  model: string;
  
  // API endpoints
  baseURL: string;
  
  // Request parameters
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  
  // Provider preferences
  provider?: {
    order?: string[];
    sort?: 'price' | 'throughput' | 'latency';
    allow_fallbacks?: boolean;
    require_parameters?: boolean;
    data_collection?: 'allow' | 'deny';
  };
  
  // Site attribution (optional, for OpenRouter rankings)
  siteUrl?: string;
  siteName?: string;
}

/**
 * Default OpenRouter configuration
 */
export const defaultOpenRouterConfig: OpenRouterConfig = {
  // Modello predefinito - puoi cambiarlo con qualsiasi modello disponibile su OpenRouter
  // Esempi:
  // - "anthropic/claude-3.5-sonnet" (alta qualità, versatile)
  // - "openai/gpt-4o" (eccellente per reasoning)
  // - "google/gemini-2.0-flash-thinking-exp:free" (gratuito, veloce, supporta tools)
  // - "meta-llama/llama-3.3-70b-instruct" (open source potente)
  model: "google/gemini-2.0-flash-001",
  
  // Base URL for OpenRouter API
  baseURL: "https://openrouter.ai/api/v1",
  
  // Temperature: controlla la creatività (0.0 = deterministico, 2.0 = molto creativo)
  temperature: 0.7,
  
  // Max tokens nella risposta
  maxTokens: 4000,
  
  // Top P: nucleus sampling (0.0-1.0)
  topP: 1.0,
  
  // Provider preferences (opzionale)
  provider: {
    // Ordina per prezzo (più economico prima) - utile per ottimizzare i costi
    sort: 'price',
    
    // Permetti fallback su altri provider se quello principale è offline
    allow_fallbacks: true,
    
    // Usa solo provider che supportano tutti i parametri richiesti (disabilitato per evitare 404)
    require_parameters: false,
    
    // Politica dati: 'deny' = solo provider che non collezionano dati
    data_collection: 'allow',
  },
  
  // Site attribution - letto da variabili d'ambiente
  siteUrl: import.meta.env.VITE_SITE_URL,
  siteName: import.meta.env.VITE_SITE_NAME,
};

/**
 * Configurazioni alternative predefinite per casi d'uso specifici
 */
export const openRouterPresets = {
  // Massima qualità - usa i migliori modelli disponibili
  quality: {
    ...defaultOpenRouterConfig,
    model: "anthropic/claude-3.5-sonnet",
    provider: {
      sort: 'latency',
      allow_fallbacks: true,
    }
  },
  
  // Massima velocità - privilegia throughput
  speed: {
    ...defaultOpenRouterConfig,
    model: "meta-llama/llama-3.3-70b-instruct:nitro",
    temperature: 0.5,
    provider: {
      sort: 'throughput',
      allow_fallbacks: true,
    }
  },
  
  // Gratuito - usa solo modelli free
  free: {
    ...defaultOpenRouterConfig,
    model: "google/gemini-2.0-flash-exp:free",
    provider: {
      sort: 'price',
      allow_fallbacks: false,
    }
  },
  
  // Privacy-first - solo provider che non collezionano dati
  privacy: {
    ...defaultOpenRouterConfig,
    model: "anthropic/claude-3.5-sonnet",
    provider: {
      data_collection: 'deny',
      allow_fallbacks: true,
      sort: 'price',
    }
  }
};

/**
 * Ottieni la configurazione OpenRouter dalle variabili d'ambiente
 */
export const getOpenRouterConfig = (): OpenRouterConfig => {
  return {
    ...defaultOpenRouterConfig,
    siteUrl: import.meta.env.VITE_SITE_URL || defaultOpenRouterConfig.siteUrl,
    siteName: import.meta.env.VITE_SITE_NAME || defaultOpenRouterConfig.siteName,
  };
};

