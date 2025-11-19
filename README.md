<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LinkHub Canvas

Un'applicazione interattiva per creare e gestire diagrammi a nodi con AI integrata.

## 🚀 Caratteristiche

- 🎨 **Canvas Interattivo**: Crea e collega nodi visivamente
- 🤖 **AI Assistant**: Bot intelligente per creare template e modificare il diagramma
- 🔄 **OpenRouter Integration**: Accesso a 400+ modelli AI (GPT-4, Claude, Gemini, Llama, ecc.)
- 💰 **Controllo Costi**: Scegli tra modelli gratuiti, economici o premium
- 🎯 **Smart Routing**: Fallback automatici e load balancing tra provider

## 📋 Prerequisites

- Node.js (v18 o superiore)
- Account OpenRouter (gratuito) - [Registrati qui](https://openrouter.ai/)

## 🛠️ Setup Iniziale

### 1. Clona il Repository

```bash
git clone <repository-url>
cd linkhub-canvas
```

### 2. Installa le Dipendenze

```bash
npm install
```

### 3. Configura le Variabili d'Ambiente

```bash
# Copia il file .env.example
cp .env.example .env

# Modifica .env con le tue credenziali
```

Apri `.env` e inserisci la tua API key di OpenRouter:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=LinkHub Canvas
```

**Come ottenere una API Key:**
1. Vai su [OpenRouter](https://openrouter.ai/)
2. Registrati o accedi
3. Vai su [Keys](https://openrouter.ai/keys)
4. Crea una nuova API key
5. Copia e incolla nel file `.env`

### 4. Avvia l'Applicazione

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`

## 🤖 Configurazione AI

### Modelli Consigliati

Il modello predefinito è **Gemini 2.0 Flash (gratuito)**. Puoi cambiarlo in `config/openrouter.config.ts`:

**Gratuiti:**
- `google/gemini-2.0-flash-exp:free` ✅ (default)
- `meta-llama/llama-3.2-3b-instruct:free`

**Economici:**
- `google/gemini-flash-1.5` ($0.075/$0.30 per 1M tokens)
- `meta-llama/llama-3.3-70b-instruct` (~$0.50 per 1M tokens)

**Premium (Alta Qualità):**
- `anthropic/claude-3.5-sonnet` ($3/$15 per 1M tokens)
- `openai/gpt-4o` ($2.5/$10 per 1M tokens)

Vedi tutti i modelli su [openrouter.ai/models](https://openrouter.ai/models)

### Presets Disponibili

Usa i preset predefiniti per diversi casi d'uso:

```typescript
import { openRouterPresets } from './config/openrouter.config';

// Massima qualità
openRouterPresets.quality

// Massima velocità
openRouterPresets.speed

// Solo gratuiti
openRouterPresets.free

// Privacy-first
openRouterPresets.privacy
```

## 📚 Documentazione Completa

Per informazioni dettagliate su configurazione, costi e troubleshooting, vedi:

👉 **[Guida Completa OpenRouter](docs/OPENROUTER_SETUP.md)**

## 🎯 Come Usare

1. **Crea Nodi**: Clicca sul pulsante "+" per aggiungere nuovi nodi
2. **Collega Nodi**: Trascina dalle maniglie per creare collegamenti
3. **Modifica Contenuto**: Clicca su un nodo per editarlo
4. **Usa l'AI**: Clicca sull'icona chat per chiedere all'AI di:
   - Creare template (es. "Crea un template OKR")
   - Aggiungere nodi (es. "Aggiungi 3 nodi per un sistema di login")
   - Ristrutturare il diagramma (es. "Organizza i nodi gerarchicamente")

## 🏗️ Struttura del Progetto

```
linkhub-canvas/
├── components/          # Componenti React
│   ├── ChatBot.tsx     # AI Assistant UI
│   └── EntityNode.tsx  # Nodo canvas
├── config/             # Configurazioni
│   └── openrouter.config.ts  # Config OpenRouter
├── services/           # Servizi backend
│   └── openrouterService.ts  # Integrazione OpenRouter
├── docs/              # Documentazione
│   └── OPENROUTER_SETUP.md
├── types.ts           # TypeScript types
├── App.tsx            # Componente principale
└── .env.example       # Template variabili d'ambiente
```

## 💡 Migrazione da Gemini

Questo progetto è stato migrato da Google Gemini a OpenRouter per:
- ✅ Accesso a più modelli
- ✅ Controllo migliore sui costi
- ✅ Fallback automatici
- ✅ Nessun vendor lock-in

Il vecchio file `services/geminiService.ts` può essere rimosso.

## 🐛 Troubleshooting

### Errore: "API Key non valida"
- Verifica che `.env` contenga `VITE_OPENROUTER_API_KEY`
- Controlla che la chiave inizi con `sk-or-v1-`

### Errore: "Limite di rate raggiunto"
- Attendi qualche minuto
- Usa modelli a pagamento (senza rate limits)

### Il bot non risponde correttamente
- Prova un modello diverso (es. Claude o GPT-4)
- Aumenta `maxTokens` in `config/openrouter.config.ts`

Vedi la [Guida Completa](docs/OPENROUTER_SETUP.md) per altri problemi.

## 📄 License

MIT

## 🤝 Supporto

- 📚 [Documentazione OpenRouter](https://openrouter.ai/docs)
- 💬 [Discord OpenRouter](https://discord.gg/openrouter)
- 🐛 [Issues](../../issues)
