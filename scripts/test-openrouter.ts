/**
 * Script di Test per OpenRouter Integration
 * 
 * Questo script testa la connessione a OpenRouter senza avviare l'app completa.
 * Utile per verificare che l'API key funzioni correttamente.
 * 
 * Esegui con: npx tsx scripts/test-openrouter.ts
 */

interface TestConfig {
  apiKey: string | undefined;
  model: string;
  baseURL: string;
}

const config: TestConfig = {
  apiKey: process.env.VITE_OPENROUTER_API_KEY,
  model: "google/gemini-2.0-flash-exp:free",
  baseURL: "https://openrouter.ai/api/v1"
};

async function testOpenRouterConnection() {
  console.log("🧪 Test OpenRouter Connection\n");
  console.log("=" .repeat(50));
  
  // Check API Key
  if (!config.apiKey) {
    console.error("❌ ERRORE: VITE_OPENROUTER_API_KEY non trovata!");
    console.log("\n📝 Soluzione:");
    console.log("1. Crea un file .env nella root del progetto");
    console.log("2. Aggiungi: VITE_OPENROUTER_API_KEY=sk-or-v1-your-key");
    console.log("3. Ottieni una key su: https://openrouter.ai/keys\n");
    process.exit(1);
  }

  console.log("✅ API Key trovata");
  console.log(`   Key prefix: ${config.apiKey.substring(0, 15)}...`);
  console.log(`📦 Modello: ${config.model}`);
  console.log(`🌐 Base URL: ${config.baseURL}\n`);
  
  // Test Request
  console.log("🚀 Invio richiesta di test...\n");
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'LinkHub Canvas Test',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: 'Rispondi solo con "OK" se mi ricevi.'
          }
        ],
        max_tokens: 50,
      }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Errore HTTP ${response.status}:`);
      console.error(errorText);
      
      if (response.status === 401) {
        console.log("\n💡 Suggerimento: API Key non valida o scaduta");
        console.log("   Verifica su: https://openrouter.ai/keys");
      } else if (response.status === 429) {
        console.log("\n💡 Suggerimento: Rate limit raggiunto");
        console.log("   Attendi qualche minuto o usa un modello a pagamento");
      } else if (response.status === 402) {
        console.log("\n💡 Suggerimento: Credito insufficiente");
        console.log("   Ricarica su: https://openrouter.ai/credits");
      }
      
      process.exit(1);
    }

    const data = await response.json();
    
    console.log("=" .repeat(50));
    console.log("✅ TEST SUPERATO!\n");
    
    // Response Info
    const message = data.choices[0]?.message?.content || "Nessuna risposta";
    console.log("📨 Risposta AI:");
    console.log(`   "${message}"\n`);
    
    // Timing
    console.log(`⏱️  Tempo risposta: ${duration}ms`);
    
    // Usage Info
    if (data.usage) {
      console.log("\n📊 Token Usage:");
      console.log(`   Prompt: ${data.usage.prompt_tokens} tokens`);
      console.log(`   Completion: ${data.usage.completion_tokens} tokens`);
      console.log(`   Totale: ${data.usage.total_tokens} tokens`);
      
      // Cost Estimation (for paid models)
      if (config.model.includes(':free')) {
        console.log(`   💰 Costo: GRATIS ✨`);
      }
    }
    
    // Model Info
    if (data.model) {
      console.log(`\n🤖 Modello usato: ${data.model}`);
    }
    
    console.log("\n" + "=" .repeat(50));
    console.log("🎉 OpenRouter è configurato correttamente!");
    console.log("   Puoi ora avviare l'app con: npm run dev\n");
    
  } catch (error) {
    console.error("❌ ERRORE durante la richiesta:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    
    console.log("\n💡 Suggerimenti:");
    console.log("- Verifica la connessione internet");
    console.log("- Controlla che l'API key sia corretta");
    console.log("- Prova ad eseguire: npm run dev\n");
    
    process.exit(1);
  }
}

// Execute test
testOpenRouterConnection();

