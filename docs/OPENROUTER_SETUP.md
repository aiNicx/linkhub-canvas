# Configurazione OpenRouter

Questa guida spiega come configurare e utilizzare OpenRouter per l'AI del LinkHub Canvas.

## Indice
- [Perché OpenRouter?](#perché-openrouter)
- [Setup Iniziale](#setup-iniziale)
- [Configurazione Modelli](#configurazione-modelli)
- [Presets Disponibili](#presets-disponibili)
- [Gestione Costi](#gestione-costi)
- [Troubleshooting](#troubleshooting)

## Perché OpenRouter?

OpenRouter è stata scelta per questi vantaggi:

✅ **Accesso a 400+ modelli** - Un'unica API per GPT-4, Claude, Gemini, Llama e molti altri  
✅ **Routing intelligente** - Fallback automatici e load balancing  
✅ **Controllo costi** - Scelta tra modelli gratuiti, economici o premium  
✅ **Nessuna dipendenza vendor** - Cambia modello senza modificare il codice  
✅ **Privacy flessibile** - Supporto per provider che non raccolgono dati  

## Setup Iniziale

### 1. Ottieni una API Key

1. Vai su [OpenRouter](https://openrouter.ai/)
2. Registrati o accedi
3. Vai su [Keys](https://openrouter.ai/keys)
4. Crea una nuova API key
5. Copia la chiave (inizia con `sk-or-v1-...`)

### 2. Configura le Variabili d'Ambiente

1. Copia il file `.env.example` in `.env`:
   ```bash
   cp .env.example .env
   ```

2. Modifica `.env` e inserisci la tua API key:
   ```env
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   VITE_SITE_URL=http://localhost:5173
   VITE_SITE_NAME=LinkHub Canvas
   ```

### 3. Installa le Dipendenze

```bash
npm install
```

### 4. Avvia l'Applicazione

```bash
npm run dev
```

## Configurazione Modelli

### File di Configurazione

La configurazione si trova in `config/openrouter.config.ts`.

### Cambiare Modello

Modifica il campo `model` nel file di configurazione:

```typescript
export const defaultOpenRouterConfig: OpenRouterConfig = {
  model: "google/gemini-2.0-flash-exp:free", // <-- Cambia qui
  // ... resto della config
};
```

### Modelli Consigliati

#### 🆓 Gratuiti
- `google/gemini-2.0-flash-exp:free` - Veloce, buona qualità, gratuito
- `meta-llama/llama-3.2-3b-instruct:free` - Leggero e gratuito

#### 💰 Economici
- `google/gemini-flash-1.5` - $0.075/$0.30 per 1M tokens
- `anthropic/claude-3.5-haiku` - $0.80/$4.00 per 1M tokens
- `meta-llama/llama-3.3-70b-instruct` - ~$0.50/$0.50 per 1M tokens

#### 🚀 Premium (Alta Qualità)
- `anthropic/claude-3.5-sonnet` - $3.00/$15.00 per 1M tokens
- `openai/gpt-4o` - $2.50/$10.00 per 1M tokens
- `google/gemini-2.5-pro-preview` - Varia in base al provider

#### ⚡ Alta Velocità (Nitro)
Aggiungi `:nitro` al nome del modello per prioritizzare il throughput:
- `meta-llama/llama-3.3-70b-instruct:nitro`

#### 💸 Prezzo Minimo (Floor)
Aggiungi `:floor` per prioritizzare il costo più basso:
- `meta-llama/llama-3.3-70b-instruct:floor`

### Esplora Tutti i Modelli

Visita [openrouter.ai/models](https://openrouter.ai/models) per vedere:
- Prezzi in tempo reale
- Context window
- Provider disponibili
- Benchmark di performance

## Presets Disponibili

Il file di configurazione include presets predefiniti:

### Usare un Preset

```typescript
import { openRouterPresets } from '../config/openrouter.config';

// Nel tuo codice, usa uno dei preset
const config = openRouterPresets.quality;  // Per massima qualità
const config = openRouterPresets.speed;    // Per massima velocità
const config = openRouterPresets.free;     // Solo modelli gratuiti
const config = openRouterPresets.privacy;  // Privacy-first
```

### Preset: `quality` - Massima Qualità
```typescript
{
  model: "anthropic/claude-3.5-sonnet",
  provider: {
    sort: 'latency',
    allow_fallbacks: true,
  }
}
```
Usa i migliori modelli disponibili con latenza minima.

### Preset: `speed` - Massima Velocità
```typescript
{
  model: "meta-llama/llama-3.3-70b-instruct:nitro",
  temperature: 0.5,
  provider: {
    sort: 'throughput',
    allow_fallbacks: true,
  }
}
```
Prioritizza throughput per risposte rapidissime.

### Preset: `free` - Solo Gratuiti
```typescript
{
  model: "google/gemini-2.0-flash-exp:free",
  provider: {
    sort: 'price',
    allow_fallbacks: false,
  }
}
```
Usa solo modelli completamente gratuiti (con rate limits).

### Preset: `privacy` - Privacy First
```typescript
{
  model: "anthropic/claude-3.5-sonnet",
  provider: {
    data_collection: 'deny',
    allow_fallbacks: true,
    sort: 'price',
  }
}
```
Solo provider che **non** raccolgono dati utente per training.

## Gestione Costi

### Monitorare l'Utilizzo

1. Dashboard: [openrouter.ai/activity](https://openrouter.ai/activity)
2. Vedi token usage nei log browser (console)
3. Imposta limiti di credito su OpenRouter

### Strategie per Ridurre i Costi

#### 1. Usa Modelli Gratuiti per Sviluppo
```typescript
model: "google/gemini-2.0-flash-exp:free"
```

#### 2. Imposta Max Price
```typescript
provider: {
  max_price: {
    prompt: 1.0,      // Max $1 per milione di token input
    completion: 2.0,  // Max $2 per milione di token output
  }
}
```

#### 3. Riduci Max Tokens
```typescript
maxTokens: 1000  // Limita la lunghezza delle risposte
```

#### 4. Usa Temperature Bassa
```typescript
temperature: 0.3  // Risposte più deterministiche e brevi
```

### Stima Costi Tipici

Per un diagramma medio (10 nodi, 5 edge):
- **Messaggio semplice**: ~500 token = $0.0004 - $0.002 (modelli economici)
- **Creazione template**: ~2000 token = $0.002 - $0.008 (modelli economici)
- **Con modelli gratuiti**: $0 🎉

## Provider Routing

### Ordinamento Provider Specifici

```typescript
provider: {
  order: ['anthropic', 'openai', 'google'],  // Prova in questo ordine
  allow_fallbacks: true,  // Fallback su altri se non disponibili
}
```

### Disabilitare Fallback

```typescript
provider: {
  order: ['anthropic'],
  allow_fallbacks: false,  // Usa SOLO Anthropic, fallisci se offline
}
```

### Ignorare Provider

```typescript
provider: {
  ignore: ['deepinfra'],  // Non usare mai DeepInfra
}
```

### Solo Provider Specifici

```typescript
provider: {
  only: ['openai', 'anthropic'],  // Usa SOLO questi provider
}
```

## Parametri Avanzati

### Temperature (0.0 - 2.0)
- `0.0` - Deterministico, sempre la stessa risposta
- `0.7` - Bilanciato (default)
- `1.5+` - Molto creativo, variato

### Top P (0.0 - 1.0)
Nucleus sampling, limita le scelte del modello:
- `1.0` - Tutte le opzioni (default)
- `0.9` - Solo le top 90% più probabili
- `0.5` - Molto focalizzato

### Max Tokens
Limita la lunghezza della risposta:
- `1000` - Risposte brevi
- `4000` - Risposte medie (default)
- `8000+` - Risposte lunghe e dettagliate

## Troubleshooting

### Errore: "API Key non valida"

**Soluzione:**
1. Verifica che `.env` contenga `VITE_OPENROUTER_API_KEY`
2. Controlla che la chiave inizi con `sk-or-v1-`
3. Verifica su [openrouter.ai/keys](https://openrouter.ai/keys) che la key sia attiva

### Errore: "Limite di rate raggiunto"

**Soluzione:**
1. Attendi qualche minuto
2. Usa modelli a pagamento (senza rate limits)
3. Ricarica credito su OpenRouter

### Errore: "Credito insufficiente"

**Soluzione:**
1. Ricarica su [openrouter.ai/credits](https://openrouter.ai/credits)
2. Usa modelli gratuiti temporaneamente

### Il modello non risponde correttamente

**Soluzione:**
1. Prova un modello diverso (es. Claude o GPT-4)
2. Aumenta `maxTokens` se le risposte sono troncate
3. Abbassa `temperature` per risposte più coerenti

### Risposte troppo lunghe/costose

**Soluzione:**
1. Riduci `maxTokens` a 1000-2000
2. Usa modelli più economici
3. Abbassa `temperature` a 0.3-0.5

## Migrazione da Gemini

Il vecchio servizio Gemini è stato sostituito con OpenRouter. I vantaggi:

| Aspetto | Gemini | OpenRouter |
|---------|--------|------------|
| Modelli disponibili | 1 (Gemini) | 400+ |
| Fallback automatici | ❌ | ✅ |
| Controllo costi | Limitato | Avanzato |
| Privacy options | Limitato | Flessibile |
| Vendor lock-in | Sì | No |

## Risorse Utili

- 📚 [Documentazione OpenRouter](https://openrouter.ai/docs)
- 🤖 [Lista Modelli](https://openrouter.ai/models)
- 💳 [Dashboard Crediti](https://openrouter.ai/credits)
- 📊 [Activity Log](https://openrouter.ai/activity)
- 🔑 [Gestione API Keys](https://openrouter.ai/keys)
- 💬 [Discord Community](https://discord.gg/openrouter)

## Supporto

Per problemi o domande:
1. Controlla questo documento
2. Consulta la [documentazione ufficiale](https://openrouter.ai/docs)
3. Chiedi su [Discord OpenRouter](https://discord.gg/openrouter)

