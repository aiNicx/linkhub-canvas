# Guida OKR Chatbot LinkHub

## Panoramica

Il chatbot è stato potenziato per diventare un vero **OKR Coach LinkHub**, specializzato nella metodologia RiskHub per aiutare i team a creare e gestire Strategy Canvas OKR completi.

## Cultura LinkHub integrata

Il bot ora incorpora i **tre pilastri culturali** LinkHub:

### 1. 🥊 COMBATTERE
- Non arrendersi mai, c'è sempre un altro modo
- Gli OKR sono outcome-based e richiedono mentalità resiliente
- Se hai già provato → MEGLIO, hai appreso qualcosa
- Se non funziona → MEGLIO, hai eliminato un'opzione

### 2. 🧠 CONSAPEVOLEZZA  
- Più si punta in alto, più ostacoli si creano (è normale!)
- I rischi sono scarico di responsabilità, non fallimenti
- Chi non ha rischi sta puntando troppo in basso
- Essere ottimisti ≠ essere positivi (serve consapevolezza)

### 3. 🤝 CONFRONTO
- Rispetto profondo per opinioni diverse
- Astenersi dal giudizio
- L'allineamento nasce dalla capacità di mettersi nei panni degli altri
- Ogni visione è valida nel suo contesto

## Metodologia RiskHub

Il bot guida nella creazione di Strategy Canvas con questa struttura:

```
OBJECTIVE (livello 1)
└─ KEY RESULT 1 (livello 2)
└─ KEY RESULT 2 (livello 2)
   └─ RISCHIO 1 (livello 3)
      └─ KPI 1.1 (livello 4)
      └─ INIZIATIVA 1.1 (livello 5)
      └─ INIZIATIVA 1.2 (livello 5)
   └─ RISCHIO 2 (livello 3)
      └─ KPI 2.1 (livello 4)
      └─ INIZIATIVA 2.1 (livello 5)
```

### Componenti del Canvas

#### 📍 OBJECTIVE (O)
- Direzione qualitativa, il "perché"
- Stabile nel tempo, ispirante
- Non contiene numeri
- **Domande guida**:
  - "Qual è lo scopo di ciò che fate?"
  - "Cosa vi chiede l'azienda prima di ogni altra cosa?"

#### 🎯 KEY RESULT (KR)
- 1-2 indicatori di obiettivo SEMPLICI (non composti)
- Target ambizioso: +30% del MEV (Miglior Esito Verificabile)
- Mai calcolare % completamento vs target
- **Domande guida**:
  - "Quale numero guarderete per primo a fine trimestre?"
  - "Come capirete se avete lavorato meglio dell'anno scorso?"

#### ⚠️ RISCHI
- 3-5 ostacoli principali che potrebbero impedire di raggiungere l'OKR
- Divisione per: importanza / componenti / fasi
- Sono scarico di responsabilità
- **Domande guida (tecnica post-mortem)**:
  - "Immaginate di aver fallito... cosa è probabilmente successo?"
  - "Quali problemi accadono più spesso?"

#### 📊 KPI
- Indicatori di rischio con soglie di allerta
- Possono essere composti (percentuali, rapporti)
- Misurano efficacia delle iniziative
- **Domande guida**:
  - "Come possiamo misurare questo rischio?"
  - "Quali numeri vedreste in una dashboard?"

#### ⚡ INIZIATIVE
- Azioni concrete per mitigare i rischi
- Focus su ciò che il team sta già facendo
- Mentalità "c'è sempre un altro modo"
- **Domande guida**:
  - "Cosa state già facendo per diminuire quel rischio?"
  - "Quale soluzione potremmo testare per prima?"

## Le Due Leggi Fondamentali

### 🔒 PRIMA LEGGE
**Gli OKR NON devono essere collegati alla valutazione personale**

Servono a:
- Fornire direzione comune
- Stimolare le persone a dare il massimo
- Farci sentire una vera squadra

Siamo tutti sulla stessa barca, non a scuola con i voti.

### 🚀 SECONDA LEGGE
**Il target deve essere ambizioso (regola del +30%)**

- Prendere il risultato attuale/probabile
- Aggiungere +30%
- Puntare a quello
- Per definire un target bastano 10 secondi
- L'indicatore è più importante del numero preciso

## ⚡ Il Peccato Originale

**NON calcolare mai: % completamento = raggiunto / target**

✅ **Approccio corretto**: Guardare solo quanto abbiamo raggiunto **rispetto al passato**

- Guardare indietro solo per vedere se stiamo migliorando
- Mai per dare meriti o colpe
- Il tempo degli OKR è il futuro
- Niente report del passato, solo strategia futura

## Template disponibili

Il bot può creare template predefiniti per:

1. **Team Vendite**: Focus su fatturato e conversione
2. **Team Marketing**: Focus su lead generation
3. **Team Prodotto**: Focus su engagement utenti
4. **Canvas Base**: Template generico personalizzabile

## Come usare il bot

### Esempi di richieste

**Per iniziare da zero:**
```
"Voglio creare un Canvas OKR per il mio team di vendite"
"Aiutami a definire gli obiettivi del team marketing"
"Creiamo insieme un Strategy Canvas"
```

**Per esplorare la metodologia:**
```
"Spiegami la differenza tra KR e KPI"
"Come si definisce un buon Objective?"
"Cos'è il Peccato Originale?"
```

**Per modifiche al canvas:**
```
"Aggiungi un rischio legato alla qualità del prodotto"
"Modifica il target del KR principale"
"Crea delle iniziative per il rischio 1"
```

## Approccio di Coaching

Il bot segue un approccio da Coach, non da esecutore:

1. **Fa domande** invece di dare risposte preconfezionate
2. **Esplora** la situazione del team
3. **Guida** attraverso il processo di definizione
4. **Normalizza** gli ostacoli come parte del percorso
5. **Celebra** i progressi
6. **Trasmette fiducia** nelle capacità delle persone

### Tono di voce

- Caldo e motivante
- Empatico ma diretto
- Professionale ma accessibile
- Focus su "efficace" non su "giusto"
- Semplifica ma non banalizza

## Principi tecnici

### Quando chiede chiarimenti
Il bot fa domande se:
- La richiesta è troppo vaga
- Mancano informazioni chiave per procedere
- Vuole esplorare meglio il contesto del team

### Quando propone modifiche
Il bot usa il tool `propose_plan` quando:
- Ha abbastanza informazioni per creare/modificare il canvas
- L'utente chiede esplicitamente di creare template
- È il momento di tradurre la conversazione in azioni concrete

### Struttura delle modifiche
Le proposte seguono sempre la gerarchia:
1. Objective (top)
2. Key Results (sotto O)
3. Rischi (sotto KR)
4. KPI (sotto Rischi)  
5. Iniziative (sotto Rischi)

Collegamenti automatici tra nodi padre-figlio.

## File di configurazione

### `config/okr-templates.ts`
Template predefiniti per diversi tipi di team (vendite, marketing, prodotto, generico).

### `config/coaching-questions.ts`
Domande guida per ogni elemento del canvas, tecniche di divisione rischi, principi culturali.

### `services/openrouterService.ts`
System prompt potenziato con metodologia LinkHub e logica di coaching.

## Best Practices

### Per l'utente
1. **Inizia con l'Objective**: Definisci prima la direzione qualitativa
2. **Sii ambizioso**: Usa la regola del +30% per i target
3. **Non aver paura dei rischi**: Più ne hai, più stai puntando in alto
4. **Concentrati sul miglioramento**: Non sul % completamento vs target
5. **Itera**: Il canvas è vivo, va aggiornato continuamente

### Per il Coach (bot)
1. **Fai domande potenti**: Esplora prima di proporre
2. **Rispetta il ritmo**: Non forzare tutte le informazioni in una volta
3. **Normalizza le difficoltà**: Gli ostacoli sono parte del percorso
4. **Celebra i progressi**: Rinforza positivamente ogni passo
5. **Mantieni il focus**: 1-2 KR, 3-5 Rischi max

## Risorse LinkHub

- 🌐 [OKR LinkHub](https://www.okrlinkhub.com/)
- 📚 Guide e materiali formativi
- 🎓 Corsi di certificazione
- 👥 Network di Coach certificati

---

**Ricorda**: Gli OKR sono pensati per un **gioco infinito**, dove l'unico scopo è rimanere in gioco il più possibile, migliorando continuamente.

