/**
 * Template OKR predefiniti per LinkHub
 * 
 * Questi template seguono la metodologia RiskHub e forniscono
 * strutture di partenza per diversi tipi di team.
 */

export interface OKRTemplate {
  name: string;
  description: string;
  objective: string;
  keyResults: Array<{
    indicator: string;
    target: string;
    date: string;
  }>;
  risks: Array<{
    title: string;
    description: string;
    kpis?: Array<{
      indicator: string;
      threshold: string;
    }>;
    initiatives?: string[];
  }>;
}

/**
 * Template OKR per team di Vendita
 */
export const salesTemplate: OKRTemplate = {
  name: "Team Vendite",
  description: "Template per un team commerciale focalizzato sulla crescita del fatturato",
  objective: "Aumentare significativamente il fatturato aziendale",
  keyResults: [
    {
      indicator: "Fatturato trimestrale",
      target: "€150.000",
      date: "31/12/2024"
    }
  ],
  risks: [
    {
      title: "Non troviamo abbastanza opportunità",
      description: "Il funnel è scarico, pochi lead qualificati entrano",
      kpis: [
        {
          indicator: "N. lead mensili",
          threshold: "< 50"
        }
      ],
      initiatives: [
        "Campagna LinkedIn ads",
        "Partecipazione a eventi di settore"
      ]
    },
    {
      title: "Non convertiamo abbastanza",
      description: "Troppi lead persi durante il processo di vendita",
      kpis: [
        {
          indicator: "% conversione lead-to-deal",
          threshold: "< 15%"
        }
      ],
      initiatives: [
        "Training su tecniche di closing",
        "Migliorare presentazione commerciale"
      ]
    },
    {
      title: "Valore medio contratto troppo basso",
      description: "Vendiamo ma con ticket medio insufficiente",
      kpis: [
        {
          indicator: "€ medio per contratto",
          threshold: "< €5.000"
        }
      ],
      initiatives: [
        "Sviluppare offerte premium",
        "Cross-selling su clienti esistenti"
      ]
    }
  ]
};

/**
 * Template OKR per team di Marketing
 */
export const marketingTemplate: OKRTemplate = {
  name: "Team Marketing",
  description: "Template per un team marketing focalizzato sulla generazione di lead",
  objective: "Diventare il motore di crescita dell'azienda",
  keyResults: [
    {
      indicator: "N. lead qualificati generati",
      target: "500",
      date: "31/12/2024"
    }
  ],
  risks: [
    {
      title: "Bassa visibilità online",
      description: "Non ci trovano quando cercano soluzioni come le nostre",
      kpis: [
        {
          indicator: "Traffico organico mensile",
          threshold: "< 2.000"
        }
      ],
      initiatives: [
        "Piano editoriale SEO",
        "Guest posting su blog di settore"
      ]
    },
    {
      title: "Contenuti poco ingaggianti",
      description: "I visitatori non interagiscono e non convertono",
      kpis: [
        {
          indicator: "Bounce rate",
          threshold: "> 70%"
        },
        {
          indicator: "Tempo medio sulla pagina",
          threshold: "< 1 min"
        }
      ],
      initiatives: [
        "A/B test su landing pages",
        "Video testimonial clienti"
      ]
    },
    {
      title: "Canali pubblicitari poco efficaci",
      description: "Spesa alta con pochi lead qualificati",
      kpis: [
        {
          indicator: "Costo per lead",
          threshold: "> €50"
        }
      ],
      initiatives: [
        "Ottimizzazione campagne Google Ads",
        "Test nuovi canali (LinkedIn, TikTok)"
      ]
    }
  ]
};

/**
 * Template OKR per team di Prodotto
 */
export const productTemplate: OKRTemplate = {
  name: "Team Prodotto",
  description: "Template per un team prodotto focalizzato sull'engagement degli utenti",
  objective: "Rendere il prodotto indispensabile per i nostri utenti",
  keyResults: [
    {
      indicator: "Utenti attivi mensili (MAU)",
      target: "10.000",
      date: "30/06/2024"
    }
  ],
  risks: [
    {
      title: "Onboarding complesso",
      description: "Gli utenti abbandonano prima di capire il valore",
      kpis: [
        {
          indicator: "% completamento onboarding",
          threshold: "< 40%"
        }
      ],
      initiatives: [
        "Tutorial interattivo in-app",
        "Email drip sequence di onboarding"
      ]
    },
    {
      title: "Feature poco utilizzate",
      description: "Sviluppiamo funzionalità che non vengono adottate",
      kpis: [
        {
          indicator: "% utenti che usa feature X",
          threshold: "< 10%"
        }
      ],
      initiatives: [
        "User research mensile",
        "In-app tooltips sulle nuove feature"
      ]
    },
    {
      title: "Churn elevato",
      description: "Gli utenti se ne vanno dopo poco tempo",
      kpis: [
        {
          indicator: "Churn rate mensile",
          threshold: "> 8%"
        }
      ],
      initiatives: [
        "Programma di success stories",
        "Alert automatici per utenti a rischio"
      ]
    }
  ]
};

/**
 * Template OKR generico per iniziare
 */
export const genericTemplate: OKRTemplate = {
  name: "Canvas OKR Base",
  description: "Template generico per iniziare con qualsiasi tipo di obiettivo",
  objective: "Raggiungere un risultato significativo per il team",
  keyResults: [
    {
      indicator: "Indicatore principale",
      target: "Valore target",
      date: "31/12/2024"
    }
  ],
  risks: [
    {
      title: "Rischio 1",
      description: "Primo possibile ostacolo da superare",
      kpis: [
        {
          indicator: "KPI di monitoraggio",
          threshold: "Soglia di allerta"
        }
      ],
      initiatives: [
        "Prima iniziativa per mitigare il rischio"
      ]
    },
    {
      title: "Rischio 2",
      description: "Secondo possibile ostacolo da superare",
      kpis: [
        {
          indicator: "KPI di monitoraggio",
          threshold: "Soglia di allerta"
        }
      ],
      initiatives: [
        "Prima iniziativa per mitigare il rischio"
      ]
    }
  ]
};

/**
 * Tutti i template disponibili
 */
export const allTemplates = {
  sales: salesTemplate,
  marketing: marketingTemplate,
  product: productTemplate,
  generic: genericTemplate
};

/**
 * Ottieni la lista di template disponibili con metadati
 */
export const getTemplatesList = () => [
  { id: 'sales', name: salesTemplate.name, description: salesTemplate.description },
  { id: 'marketing', name: marketingTemplate.name, description: marketingTemplate.description },
  { id: 'product', name: productTemplate.name, description: productTemplate.description },
  { id: 'generic', name: genericTemplate.name, description: genericTemplate.description }
];

