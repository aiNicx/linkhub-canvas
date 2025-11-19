/**
 * Domande di Coaching LinkHub
 * 
 * Raccolta di domande potenti per guidare i team nella definizione
 * degli elementi del loro Strategy Canvas OKR.
 */

export interface CoachingQuestions {
  category: string;
  questions: string[];
  tips?: string[];
}

/**
 * Domande per scoprire l'Objective
 */
export const objectiveQuestions: CoachingQuestions = {
  category: "Objective (Obiettivo Qualitativo)",
  questions: [
    "Qual è lo scopo di ciò che fate?",
    "Cosa vi chiede l'azienda prima di ogni altra cosa, tralasciando i numeri?",
    "Perché guardate tutti quei numeri? Cosa dovete capire ogni volta che lo fate?",
    "Se doveste spiegare in una frase cosa volete ottenere, quale sarebbe?"
  ],
  tips: [
    "L'Objective è qualitativo e stabile nel tempo",
    "Deve ispirare e dare direzione al team",
    "Non contiene numeri, ma esprime il 'perché'"
  ]
};

/**
 * Domande per scoprire i Key Results
 */
export const keyResultQuestions: CoachingQuestions = {
  category: "Key Results (Indicatori di Obiettivo)",
  questions: [
    "Alla fine dell'anno cosa guarderemo per capire se abbiamo lavorato meglio o peggio dell'anno scorso?",
    "Qual è il primo numero che guardiamo alla fine del trimestre?",
    "Come misurereste il successo di ciò che state facendo?",
    "Quale metrica è il miglior proxy del vostro obiettivo?"
  ],
  tips: [
    "Massimo 1-2 KR per mantenere il focus",
    "Devono essere indicatori semplici, non composti",
    "Target ambizioso: +30% rispetto al valore attuale (MEV)",
    "Mai calcolare % di completamento vs target - guardiamo solo il miglioramento rispetto al passato"
  ]
};

/**
 * Domande per scoprire i Rischi
 */
export const riskQuestions: CoachingQuestions = {
  category: "Rischi (Possibili Ostacoli)",
  questions: [
    "Chiudiamo gli occhi e immaginiamoci di aver fallito l'obiettivo alla grande: probabilmente cos'è successo?",
    "Quali sono i problemi che accadono più spesso?",
    "Quali sono le tre disgrazie che ci potrebbero capitare?",
    "Se ripercorriamo le fasi del processo, dove potrebbero sorgere problemi?",
    "Quali sono i componenti principali del risultato che vogliamo ottenere?"
  ],
  tips: [
    "3-5 rischi principali per mantenere il focus",
    "Usare la tecnica post-mortem (immagina di aver fallito)",
    "Dividere per importanza / componenti / fasi del processo",
    "I rischi sono 'scarico di responsabilità', non fallimenti",
    "Più puntiamo in alto, più ostacoli creiamo - è normale!"
  ]
};

/**
 * Domande per scoprire i KPI
 */
export const kpiQuestions: CoachingQuestions = {
  category: "KPI (Indicatori di Rischio)",
  questions: [
    "Come possiamo misurare questo rischio e accorgerci quanto spesso accade?",
    "Oltre al KR, quali altri numeri consideri indispensabili da monitorare?",
    "Immagina una dashboard: che numeri vedresti?",
    "Non occorre un misuratore preciso ma ci basta un indicatore: cosa potremmo usare?",
    "Che numeri guarderesti per capire se quelle iniziative sono efficaci oppure no?"
  ],
  tips: [
    "KPI = indicatore + soglia di allerta",
    "Possono essere indicatori composti (es. percentuali, rapporti)",
    "Servono per capire quando un rischio si sta verificando",
    "Misurano l'efficacia delle iniziative (output)",
    "Evitare KPI di completamento (% fatto), preferire output misurabili"
  ]
};

/**
 * Domande per scoprire le Iniziative
 */
export const initiativeQuestions: CoachingQuestions = {
  category: "Iniziative (Azioni Concrete)",
  questions: [
    "Che cosa stiamo già facendo per diminuire quel rischio?",
    "Che cosa si potrebbe fare per evitare che succeda ancora quel problema?",
    "Se quel KPI è sotto controllo, cosa sta funzionando di quello che facciamo?",
    "Quale soluzione potremmo testare per prima?",
    "C'è sempre un altro modo: quali alternative possiamo provare?"
  ],
  tips: [
    "Iniziare descrivendo quello che il team sta già facendo",
    "Alla fine, leggendo tutte le iniziative, dovremmo ritrovare tutto ciò che il team svolge ogni giorno",
    "Se c'è un KPI mancante, creare un'iniziativa per calcolarlo",
    "Focus sull'azione, non sulla perfezione",
    "Mentalità 'combattente': non arrendersi mai, c'è sempre un altro modo"
  ]
};

/**
 * Tecniche di divisione dei rischi
 */
export const riskDivisionTechniques = {
  byImportance: {
    name: "Divisione per Importanza",
    when: "Quando il team è defocalizzato e tende a parlare di troppe cose",
    question: "Quali sono i 3 rischi maggiori in termini di importanza?"
  },
  byComponents: {
    name: "Divisione per Componenti",
    when: "Quando l'OKR riguarda risultati dell'insieme di più parti",
    example: "Es. Fatturato diviso in Europa (60%), USA (30%), Asia (10%)",
    tip: "Resistere alla tentazione di fare il 100% per non sovra-considerare le parti piccole"
  },
  byPhases: {
    name: "Divisione per Fasi",
    when: "Quando l'OKR riguarda risultati di un processo con più fasi",
    example: "Es. Vendite: Lead generation → Conversione → Ticket medio",
    tip: "Facilita la detection dei rischi seguendo il flusso del processo"
  }
};

/**
 * Principi culturali LinkHub da incorporare nel coaching
 */
export const culturalPrinciples = {
  combattere: {
    name: "Combattere",
    description: "Non arrendersi mai. C'è sempre un altro modo.",
    phrases: [
      "Se ci hai già provato in passato → MEGLIO, hai già appreso qualcosa",
      "Se qualcosa non sta funzionando → MEGLIO, hai eliminato un'opzione",
      "C'è differenza tra influenzare e controllare: i KR vanno influenzati, mai controllati al 100%"
    ]
  },
  consapevolezza: {
    name: "Consapevolezza",
    description: "Più puntiamo in alto, più ostacoli creiamo. È normale e positivo.",
    phrases: [
      "Chi pensa di non avere rischi sta puntando troppo in basso",
      "I rischi sono uno scarico di responsabilità, non una condanna",
      "Essere ottimisti ≠ essere positivi: dobbiamo essere coscienti degli ostacoli"
    ]
  },
  confronto: {
    name: "Confronto",
    description: "Rispetto profondo per opinioni diverse. Astenersi dal giudizio.",
    phrases: [
      "Non cerchiamo il dissenso, ma rispettiamo la differenza",
      "L'allineamento nasce dalla capacità di mettersi nei panni degli altri",
      "Ogni visione è valida nel contesto della propria prospettiva"
    ]
  }
};

/**
 * Le Due Leggi Fondamentali
 */
export const fundamentalLaws = {
  primaLegge: {
    name: "Prima Legge",
    statement: "Gli OKR NON devono essere collegati alla valutazione personale",
    rationale: "Gli OKR servono a dare direzione, stimolare le persone e creare squadra. La valutazione è un'altra cosa.",
    coaching: "Siamo tutti sulla stessa barca. Non siamo a scuola con i voti, ma una squadra che vince insieme."
  },
  secondaLegge: {
    name: "Seconda Legge",
    statement: "Il target deve essere ambizioso (regola del +30%)",
    rationale: "Nulla è impossibile con la giusta strategia + esecuzione, nel tempo necessario.",
    coaching: "Prendiamo il risultato attuale (o probabile), aggiungiamo +30%, e puntiamo a quello. Per definire un target bastano 10 secondi."
  }
};

/**
 * Il Peccato Originale
 */
export const originalSin = {
  name: "Peccato Originale",
  description: "Non calcolare mai % completamento (raggiunto/target)",
  correctApproach: "Guardare solo quanto abbiamo raggiunto rispetto al passato",
  coaching: "Guardare indietro solo per vedere se stiamo migliorando, mai per dare meriti o colpe. Il tempo degli OKR è il futuro."
};

/**
 * Ottieni tutte le domande in formato strutturato
 */
export const getAllCoachingQuestions = () => ({
  objective: objectiveQuestions,
  keyResults: keyResultQuestions,
  risks: riskQuestions,
  kpi: kpiQuestions,
  initiatives: initiativeQuestions
});

/**
 * Ottieni suggerimenti contestuali in base allo stato del canvas
 */
export const getContextualSuggestions = (hasObjective: boolean, hasKR: boolean, hasRisks: boolean) => {
  if (!hasObjective) {
    return {
      message: "Iniziamo definendo l'Objective. È la direzione qualitativa del tuo team.",
      questions: objectiveQuestions.questions.slice(0, 2)
    };
  }
  
  if (!hasKR) {
    return {
      message: "Ottimo Objective! Ora traduciamolo in 1-2 numeri chiave (Key Results).",
      questions: keyResultQuestions.questions.slice(0, 2)
    };
  }
  
  if (!hasRisks) {
    return {
      message: "Perfetto! Ora identifichiamo i 3-5 rischi principali che potrebbero impedirci di raggiungere questo obiettivo.",
      questions: riskQuestions.questions.slice(0, 2)
    };
  }
  
  return {
    message: "Ottimo lavoro! Il canvas sta prendendo forma. Vuoi aggiungere KPI e Iniziative ai rischi?",
    questions: ["Quali numeri ti servono per monitorare questi rischi?", "Cosa stai già facendo per mitigarli?"]
  };
};

