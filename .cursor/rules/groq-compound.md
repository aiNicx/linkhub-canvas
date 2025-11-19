Compound
groq/compound

Try it in Playground
TOKEN SPEED
~450 tps
Powered by
groq
INPUT
Text
OUTPUT
Text
CAPABILITIES
Web Search, Code Execution, Visit Website, Browser Automation, Wolfram Alpha, JSON Object Mode
Groq logo
Groq
Groq's Compound system integrates OpenAI's GPT-OSS 120B and Llama 4 models with external tools like web search and code execution. This allows applications to access real-time data and interact with external environments, providing more accurate and current responses than standalone LLMs. Instead of managing separate tools and APIs, Compound systems offer a unified interface that handles tool integration and orchestration, letting you focus on application logic rather than infrastructure complexity.

Rate limits for groq/compound are determined by the rate limits of the individual models that comprise them.

PRICING
Underlying Model Pricing (per 1M tokens)
Pricing (GPT-OSS-120B)
Input
$0.15
Output
$0.60
Pricing (Llama 4 Scout)
Input
$0.11
Output
$0.34
Built-in Tool Pricing
Basic Web Search
$5 / 1000 requests
Advanced Web Search
$8 / 1000 requests
Visit Website
$1 / 1000 requests
Code Execution
$0.18 / hour
Browser Automation
$0.08 / hour
Wolfram Alpha
Based on your API key from Wolfram, not billed by Groq
Final pricing depends on which underlying models and tools are used for your specific query. See the Pricing page for more details or the Compound page for usage breakdowns.
LIMITS
CONTEXT WINDOW
131,072
MAX OUTPUT TOKENS
8,192
QUANTIZATION
This uses Groq's TruePoint Numerics, which reduces precision only in areas that don't affect accuracy, preserving quality while delivering significant speedup over traditional approaches. Learn more here.
Key Technical Specifications
Model Architecture
Compound is powered by Llama 4 Scout and GPT-OSS 120B for intelligent reasoning and tool use.

Performance Metrics
Groq developed a new evaluation benchmark for measuring search capabilities called RealtimeEval. This benchmark is designed to evaluate tool-using systems on current events and live data. On the benchmark, Compound outperformed GPT-4o-search-preview and GPT-4o-mini-search-preview significantly.
Learn More About Agentic Tooling
Discover how to build powerful applications with real-time web search and code execution
Use Cases
Realtime Web Search
Automatically access up-to-date information from the web using the built-in web search tool.

Code Execution
Execute Python code automatically using the code execution tool powered by E2B.

Code Generation and Technical Tasks
Create AI tools for code generation, debugging, and technical problem-solving with high-quality multilingual support.
Best Practices
Use system prompts to improve steerability and reduce false refusals. Compound is designed to be highly steerable with appropriate system prompts.
Consider implementing system-level protections like Llama Guard for input filtering and response validation.
Deploy with appropriate safeguards when working in specialized domains or with critical content.
Compound should not be used by customers for processing protected health information. It is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum for customers at this time.
Quick Start
Experience the capabilities of groq/compound on Groq:

curl
JavaScript
Python
JSON
shell

pip install groq
Python

from groq import Groq
client = Groq()
completion = client.chat.completions.create(
    model="groq/compound",
    messages=[
        {
            "role": "user",
            "content": "Explain why fast inference is critical for reasoning models"
        }
    ]
)
print(completion.choices[0].message.content)