# Migrazione da Google Gemini a OpenRouter

Questa guida documenta la migrazione del servizio AI da Google Gemini a OpenRouter.

## 📋 Sommario delle Modifiche

### File Rimossi
- ❌ Nessuna dipendenza fisica rimossa ancora, ma `@google/genai` può essere disinstallata

### File Aggiunti

```
config/
  └── openrouter.config.ts          # Configurazione centralizzata OpenRouter

services/
  └── openrouterService.ts          # Nuovo servizio AI con OpenRouter

docs/
  ├── OPENROUTER_SETUP.md           # Guida completa configurazione
  └── MIGRATION_FROM_GEMINI.md      # Questo file

.env.example                         # Template variabili d'ambiente
QUICKSTART.md                        # Guida rapida per iniziare
```

### File Modificati

```
components/ChatBot.tsx               # Aggiornato import del servizio
package.json                         # Rimossa dipendenza @google/genai
README.md                            # Aggiornata documentazione
```

## 🔄 Mapping API: Gemini → OpenRouter

### Inizializzazione Client

**Prima (Gemini):**
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY 
});
```

**Dopo (OpenRouter):**
```typescript
// Nessun client SDK necessario, usiamo fetch nativo
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
```

### Chiamata Chat

**Prima (Gemini):**
```typescript
const chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: systemPrompt,
    tools: [{ functionDeclarations: [tool] }],
  },
  history: history
});

const result = await chat.sendMessage({ message: message });
const functionCalls = result.functionCalls;
```

**Dopo (OpenRouter):**
```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: config.model,
    messages: [...history, { role: 'user', content: message }],
    tools: tools,
    tool_choice: 'auto'
  })
});

const data = await response.json();
const toolCalls = data.choices[0].message.tool_calls;
```

### Format dei Messaggi

**Prima (Gemini):**
```typescript
{
  role: 'user' | 'model',
  parts: [{ text: 'contenuto' }]
}
```

**Dopo (OpenRouter):**
```typescript
{
  role: 'user' | 'assistant' | 'system',
  content: 'contenuto'
}
```

### Tool Definitions

**Prima (Gemini):**
```typescript
import { FunctionDeclaration, Type } from "@google/genai";

const tool: FunctionDeclaration = {
  name: 'propose_plan',
  description: '...',
  parameters: {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING },
      actions: { type: Type.ARRAY, items: {...} }
    }
  }
};
```

**Dopo (OpenRouter):**
```typescript
const tool = {
  type: 'function',
  function: {
    name: 'propose_plan',
    description: '...',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        actions: { type: 'array', items: {...} }
      }
    }
  }
};
```

### Tool Call Response

**Prima (Gemini):**
```typescript
const functionCalls = result.functionCalls;
if (functionCalls && functionCalls[0]) {
  const args = functionCalls[0].args;
  // Use args...
}
```

**Dopo (OpenRouter):**
```typescript
const toolCalls = data.choices[0].message.tool_calls;
if (toolCalls && toolCalls[0]) {
  const args = JSON.parse(toolCalls[0].function.arguments);
  // Use args...
}
```

## ✅ Vantaggi della Migrazione

### 1. Flessibilità nei Modelli

**Prima:** Bloccati su Gemini
```typescript
model: 'gemini-2.5-flash'  // Solo Gemini
```

**Dopo:** 400+ modelli disponibili
```typescript
model: 'anthropic/claude-3.5-sonnet'  // Claude
model: 'openai/gpt-4o'                 // GPT-4
model: 'meta-llama/llama-3.3-70b'      // Llama
model: 'google/gemini-2.5-flash'       // Anche Gemini!
```

### 2. Fallback Automatici

**Prima:** Se Gemini è down, l'app non funziona

**Dopo:** Fallback automatici su altri provider
```typescript
provider: {
  order: ['anthropic', 'openai'],
  allow_fallbacks: true
}
```

### 3. Controllo Costi

**Prima:** Prezzo fisso di Google

**Dopo:** Scelta tra gratuiti, economici, premium
```typescript
// Gratuito
model: 'google/gemini-2.0-flash-exp:free'

// Economico
model: 'meta-llama/llama-3.3-70b-instruct'

// Premium
model: 'anthropic/claude-3.5-sonnet'
```

### 4. Routing Intelligente

**Prima:** Routing manuale

**Dopo:** OpenRouter gestisce tutto
```typescript
provider: {
  sort: 'price',          // Più economico
  sort: 'throughput',     // Più veloce
  sort: 'latency',        // Minima latenza
}
```

### 5. Privacy Control

**Prima:** Nessun controllo

**Dopo:** Scelta provider per privacy
```typescript
provider: {
  data_collection: 'deny'  // Solo provider che non raccolgono dati
}
```

## 🔧 Passi per Completare la Migrazione

### 1. Rimuovi Dipendenza Gemini (Opzionale)

```bash
npm uninstall @google/genai
```

### 2. Aggiorna Variabili d'Ambiente

**Rimuovi da `.env`:**
```env
API_KEY=...  # Vecchia key Gemini
```

**Aggiungi:**
```env
VITE_OPENROUTER_API_KEY=sk-or-v1-...
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=LinkHub Canvas
```

### 3. (Opzionale) Rimuovi File Vecchio

Il file `services/geminiService.ts` non è più necessario e può essere eliminato:

```bash
rm services/geminiService.ts
```

### 4. Testa l'Applicazione

```bash
npm run dev
```

Apri la chat AI e prova:
- "Ciao, come stai?"
- "Crea un template OKR"
- "Aggiungi 3 nodi per un sistema di login"

## 📊 Comparazione Caratteristiche

| Caratteristica | Gemini | OpenRouter |
|---------------|--------|------------|
| **Modelli disponibili** | 1 | 400+ |
| **Fallback automatici** | ❌ | ✅ |
| **Load balancing** | ❌ | ✅ |
| **Controllo costi** | Limitato | Avanzato |
| **Privacy options** | Limitato | Flessibile |
| **Vendor lock-in** | Alto | Nessuno |
| **Routing intelligente** | ❌ | ✅ |
| **Tool calling** | ✅ | ✅ |
| **Streaming** | ✅ | ✅ |
| **Context window** | Variabile | Fino a 1M+ tokens |

## ⚠️ Breaking Changes

### 1. Variabile d'Ambiente

**Prima:**
```env
API_KEY=...
```

**Dopo:**
```env
VITE_OPENROUTER_API_KEY=...
```

### 2. History Format

**Prima:**
```typescript
{
  role: 'model',
  parts: [{ text: 'messaggio' }]
}
```

**Dopo:**
```typescript
{
  role: 'assistant',
  content: 'messaggio'
}
```

### 3. Import Path

**Prima:**
```typescript
import { sendMessageToBot } from '../services/geminiService';
```

**Dopo:**
```typescript
import { sendMessageToBot } from '../services/openrouterService';
```

## 🎯 Compatibilità

### Cosa Funziona Uguale

- ✅ Function/Tool calling
- ✅ System instructions
- ✅ Chat history
- ✅ Conversazioni multi-turn
- ✅ Structured outputs (JSON)

### Cosa Cambia

- ❌ Format dei messaggi (minore)
- ❌ Tool definition syntax (minore)
- ❌ Client initialization (semplificato)
- ⚠️ Rate limits (dipende dal modello scelto)

## 🚀 Prossimi Passi

1. ✅ **Testa l'app** - Verifica che tutto funzioni
2. 📊 **Monitora i costi** - Usa [openrouter.ai/activity](https://openrouter.ai/activity)
3. 🎨 **Sperimenta modelli** - Prova Claude, GPT-4, Llama
4. ⚙️ **Ottimizza config** - Tuning temperatura, max_tokens, ecc.
5. 📚 **Leggi la docs** - [docs/OPENROUTER_SETUP.md](OPENROUTER_SETUP.md)

## 📞 Supporto

Problemi con la migrazione?

- 📖 [Guida Completa OpenRouter](OPENROUTER_SETUP.md)
- 💬 [Discord OpenRouter](https://discord.gg/openrouter)
- 🐛 [Issues GitHub](../../issues)
- 📚 [Documentazione OpenRouter](https://openrouter.ai/docs)

---

**Migrazione completata! 🎉**

Ora hai accesso a 400+ modelli AI con una singola integrazione.

