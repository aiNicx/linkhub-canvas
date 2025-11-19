<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LinkHub Canvas

Un'applicazione interattiva per creare e gestire **Strategy Canvas OKR** con un **OKR Coach AI** integrato basato sulla metodologia [LinkHub](https://www.okrlinkhub.com/).

## 🚀 Caratteristiche

- 🎨 **Canvas Interattivo**: Crea e collega nodi visivamente per costruire Strategy Canvas
- 🎯 **OKR Coach AI**: Bot specializzato nella metodologia LinkHub per guidarti nella creazione di OKR
- 📊 **Metodologia RiskHub**: Struttura completa con Objective, Key Results, Rischi, KPI e Iniziative
- 🧠 **Cultura Integrata**: Incorpora i tre pilastri LinkHub (Combattere, Consapevolezza, Confronto)
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

### Guide Principali

- 👉 **[Quick Start OKR](docs/QUICK-START-OKR.md)** - Inizia in 3 minuti
- 📖 **[Guida OKR Chatbot](docs/okr-chatbot-guide.md)** - Metodologia completa LinkHub
- 💬 **[Esempi Conversazioni](docs/CONVERSATION-EXAMPLES.md)** - Come interagire con il Coach
- 🔧 **[Setup OpenRouter](docs/OPENROUTER_SETUP.md)** - Configurazione AI e costi

### Teoria e Metodologia

- 📚 [Cultura OKR LinkHub](docs/okr-cultura-william.md)
- 📊 [KR e KPI](docs/okr-kpi-marco.md)
- 🔍 [Come trovare elementi del Canvas](docs/theory-find.md)
- 💾 [Sfruttare i dati](docs/theory-sfruttare-dati.md)

## 🎯 Come Usare

### Canvas Interattivo

1. **Crea Nodi**: Clicca sul pulsante "+" per aggiungere nuovi nodi
2. **Collega Nodi**: Trascina dalle maniglie per creare collegamenti
3. **Modifica Contenuto**: Clicca su un nodo per editarlo

### OKR Coach AI

Clicca sull'icona chat per interagire con il tuo Coach OKR:

**Creare un Canvas OKR:**
```
"Crea un Canvas OKR per il mio team di vendite"
"Voglio definire gli obiettivi del team marketing"
```

**Esplorare la metodologia:**
```
"Spiegami la differenza tra KR e KPI"
"Cos'è il Peccato Originale?"
"Come definisco un buon Objective?"
```

**Usare template predefiniti:**
```
"Mostrami un template per team vendite"
"Crea un Canvas base da personalizzare"
```

Vedi la [Quick Start Guide](docs/QUICK-START-OKR.md) per esempi completi.

## 🏗️ Struttura del Progetto

```
linkhub-canvas/
├── components/          # Componenti React
│   ├── ChatBot.tsx     # OKR Coach UI
│   └── EntityNode.tsx  # Nodo canvas
├── config/             # Configurazioni
│   ├── openrouter.config.ts     # Config OpenRouter
│   ├── okr-templates.ts         # Template OKR predefiniti
│   └── coaching-questions.ts    # Domande guida metodologia
├── services/           # Servizi backend
│   └── openrouterService.ts     # Integrazione OpenRouter + System Prompt
├── docs/              # Documentazione
│   ├── QUICK-START-OKR.md       # Guida rapida
│   ├── okr-chatbot-guide.md     # Guida completa metodologia
│   ├── CONVERSATION-EXAMPLES.md # Esempi conversazioni
│   ├── CHANGELOG-okr-integration.md # Log modifiche
│   ├── okr-cultura-william.md   # Teoria: Cultura LinkHub
│   ├── okr-kpi-marco.md         # Teoria: KR e KPI
│   ├── theory-find.md           # Teoria: Trovare elementi
│   ├── theory-sfruttare-dati.md # Teoria: Uso dati
│   └── OPENROUTER_SETUP.md      # Setup AI
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
