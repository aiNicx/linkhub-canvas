Provider Routing

Copy page

Route requests to the best provider
OpenRouter routes requests to the best available providers for your model. By default, requests are load balanced across the top providers to maximize uptime.

You can customize how your requests are routed using the provider object in the request body for Chat Completions and Completions.

For a complete list of valid provider names to use in the API, see the full provider schema.

The provider object can contain the following fields:

Field	Type	Default	Description
order	string[]	-	List of provider slugs to try in order (e.g. ["anthropic", "openai"]). Learn more
allow_fallbacks	boolean	true	Whether to allow backup providers when the primary is unavailable. Learn more
require_parameters	boolean	false	Only use providers that support all parameters in your request. Learn more
data_collection	”allow” | “deny"	"allow”	Control whether to use providers that may store data. Learn more
zdr	boolean	-	Restrict routing to only ZDR (Zero Data Retention) endpoints. Learn more
only	string[]	-	List of provider slugs to allow for this request. Learn more
ignore	string[]	-	List of provider slugs to skip for this request. Learn more
quantizations	string[]	-	List of quantization levels to filter by (e.g. ["int4", "int8"]). Learn more
sort	string	-	Sort providers by price or throughput. (e.g. "price" or "throughput"). Learn more
max_price	object	-	The maximum pricing you want to pay for this request. Learn more
Price-Based Load Balancing (Default Strategy)
For each model in your request, OpenRouter’s default behavior is to load balance requests across providers, prioritizing price.

If you are more sensitive to throughput than price, you can use the sort field to explicitly prioritize throughput.

When you send a request with tools or tool_choice, OpenRouter will only route to providers that support tool use. Similarly, if you set a max_tokens, then OpenRouter will only route to providers that support a response of that length.

Here is OpenRouter’s default load balancing strategy:

Prioritize providers that have not seen significant outages in the last 30 seconds.
For the stable providers, look at the lowest-cost candidates and select one weighted by inverse square of the price (example below).
Use the remaining providers as fallbacks.
A Load Balancing Example
If Provider A costs $1 per million tokens, Provider B costs $2, and Provider C costs $3, and Provider B recently saw a few outages.

Your request is routed to Provider A. Provider A is 9x more likely to be first routed to Provider A than Provider C because 
(
1
/
3
2
=
1
/
9
)
(1/3 
2
 =1/9) (inverse square of the price).
If Provider A fails, then Provider C will be tried next.
If Provider C also fails, Provider B will be tried last.
If you have sort or order set in your provider preferences, load balancing will be disabled.

Provider Sorting
As described above, OpenRouter load balances based on price, while taking uptime into account.

If you instead want to explicitly prioritize a particular provider attribute, you can include the sort field in the provider preferences. Load balancing will be disabled, and the router will try providers in order.

The three sort options are:

"price": prioritize lowest price
"throughput": prioritize highest throughput
"latency": prioritize lowest latency

TypeScript Example with Fallbacks Enabled

Python Example with Fallbacks Enabled

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'meta-llama/llama-3.1-70b-instruct',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'sort': 'throughput'
    }
  }),
});
To always prioritize low prices, and not apply any load balancing, set sort to "price".

To always prioritize low latency, and not apply any load balancing, set sort to "latency".

Nitro Shortcut
You can append :nitro to any model slug as a shortcut to sort by throughput. This is exactly equivalent to setting provider.sort to "throughput".


TypeScript Example using Nitro shortcut

Python Example using Nitro shortcut

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'meta-llama/llama-3.1-70b-instruct:nitro',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ]
  }),
});
Floor Price Shortcut
You can append :floor to any model slug as a shortcut to sort by price. This is exactly equivalent to setting provider.sort to "price".


TypeScript Example using Floor shortcut

Python Example using Floor shortcut

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'meta-llama/llama-3.1-70b-instruct:floor',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ]
  }),
});
Ordering Specific Providers
You can set the providers that OpenRouter will prioritize for your request using the order field.

Field	Type	Default	Description
order	string[]	-	List of provider slugs to try in order (e.g. ["anthropic", "openai"]).
The router will prioritize providers in this list, and in this order, for the model you’re using. If you don’t set this field, the router will load balance across the top providers to maximize uptime.

You can use the copy button next to provider names on model pages to get the exact provider slug, including any variants like “/turbo”. See Targeting Specific Provider Endpoints for details.

OpenRouter will try them one at a time and proceed to other providers if none are operational. If you don’t want to allow any other providers, you should disable fallbacks as well.

Example: Specifying providers with fallbacks
This example skips over OpenAI (which doesn’t host Mixtral), tries Together, and then falls back to the normal list of providers on OpenRouter:


TypeScript Example with Fallbacks Enabled

Python Example with Fallbacks Enabled

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'mistralai/mixtral-8x7b-instruct',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'order': [
        'openai',
        'together'
      ]
    }
  }),
});
Example: Specifying providers with fallbacks disabled
Here’s an example with allow_fallbacks set to false that skips over OpenAI (which doesn’t host Mixtral), tries Together, and then fails if Together fails:


TypeScript Example with Fallbacks Disabled

Python Example with Fallbacks Disabled

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'mistralai/mixtral-8x7b-instruct',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'order': [
        'openai',
        'together'
      ],
      'allow_fallbacks': false
    }
  }),
});
Targeting Specific Provider Endpoints
Each provider on OpenRouter may host multiple endpoints for the same model, such as a default endpoint and a specialized “turbo” endpoint. To target a specific endpoint, you can use the copy button next to the provider name on the model detail page to obtain the exact provider slug.

For example, DeepInfra offers DeepSeek R1 through multiple endpoints:

Default endpoint with slug deepinfra
Turbo endpoint with slug deepinfra/turbo
By copying the exact provider slug and using it in your request’s order array, you can ensure your request is routed to the specific endpoint you want:


TypeScript Example targeting DeepInfra Turbo endpoint

Python Example targeting DeepInfra Turbo endpoint

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'deepseek/deepseek-r1',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'order': [
        'deepinfra/turbo'
      ],
      'allow_fallbacks': false
    }
  }),
});
This approach is especially useful when you want to consistently use a specific variant of a model from a particular provider.

Requiring Providers to Support All Parameters
You can restrict requests only to providers that support all parameters in your request using the require_parameters field.

Field	Type	Default	Description
require_parameters	boolean	false	Only use providers that support all parameters in your request.
With the default routing strategy, providers that don’t support all the LLM parameters specified in your request can still receive the request, but will ignore unknown parameters. When you set require_parameters to true, the request won’t even be routed to that provider.

Example: Excluding providers that don’t support JSON formatting
For example, to only use providers that support JSON formatting:


TypeScript

Python

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'require_parameters': true
    },
    'response_format': {
      'type': 'json_object'
    }
  }),
});
Requiring Providers to Comply with Data Policies
You can restrict requests only to providers that comply with your data policies using the data_collection field.

Field	Type	Default	Description
data_collection	”allow” | “deny"	"allow”	Control whether to use providers that may store data.
allow: (default) allow providers which store user data non-transiently and may train on it
deny: use only providers which do not collect user data
Some model providers may log prompts, so we display them with a Data Policy tag on model pages. This is not a definitive source of third party data policies, but represents our best knowledge.

Account-Wide Data Policy Filtering
This is also available as an account-wide setting in your privacy settings. You can disable third party model providers that store inputs for training.

Example: Excluding providers that don’t comply with data policies
To exclude providers that don’t comply with your data policies, set data_collection to deny:


TypeScript

Python

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'data_collection': 'deny'
    }
  }),
});
Zero Data Retention Enforcement
You can enforce Zero Data Retention (ZDR) on a per-request basis using the zdr parameter, ensuring your request only routes to endpoints that do not retain prompts.

Field	Type	Default	Description
zdr	boolean	-	Restrict routing to only ZDR (Zero Data Retention) endpoints.
When zdr is set to true, the request will only be routed to endpoints that have a Zero Data Retention policy. When zdr is false or not provided, it has no effect on routing.

Account-Wide ZDR Setting
This is also available as an account-wide setting in your privacy settings. The per-request zdr parameter operates as an “OR” with your account-wide ZDR setting - if either is enabled, ZDR enforcement will be applied. The request-level parameter can only ensure ZDR is enabled, not override account-wide enforcement.

Example: Enforcing ZDR for a specific request
To ensure a request only uses ZDR endpoints, set zdr to true:


TypeScript

Python

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'gpt-4',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'zdr': true
    }
  }),
});
This is useful for customers who don’t want to globally enforce ZDR but need to ensure specific requests only route to ZDR endpoints.

Disabling Fallbacks
To guarantee that your request is only served by the top (lowest-cost) provider, you can disable fallbacks.

This is combined with the order field from Ordering Specific Providers to restrict the providers that OpenRouter will prioritize to just your chosen list.


TypeScript

Python

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'allow_fallbacks': false
    }
  }),
});
Allowing Only Specific Providers
You can allow only specific providers for a request by setting the only field in the provider object.

Field	Type	Default	Description
only	string[]	-	List of provider slugs to allow for this request.
Only allowing some providers may significantly reduce fallback options and limit request recovery.

Account-Wide Allowed Providers
You can allow providers for all account requests by configuring your preferences. This configuration applies to all API requests and chatroom messages.

Note that when you allow providers for a specific request, the list of allowed providers is merged with your account-wide allowed providers.

Example: Allowing Azure for a request calling GPT-4 Omni
Here’s an example that will only use Azure for a request calling GPT-4 Omni:


TypeScript

Python

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'openai/gpt-4o',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'only': [
        'azure'
      ]
    }
  }),
});
Ignoring Providers
You can ignore providers for a request by setting the ignore field in the provider object.

Field	Type	Default	Description
ignore	string[]	-	List of provider slugs to skip for this request.
Ignoring multiple providers may significantly reduce fallback options and limit request recovery.

Account-Wide Ignored Providers
You can ignore providers for all account requests by configuring your preferences. This configuration applies to all API requests and chatroom messages.

Note that when you ignore providers for a specific request, the list of ignored providers is merged with your account-wide ignored providers.

Example: Ignoring DeepInfra for a request calling Llama 3.3 70b
Here’s an example that will ignore DeepInfra for a request calling Llama 3.3 70b:


TypeScript

Python

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'meta-llama/llama-3.3-70b-instruct',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'ignore': [
        'deepinfra'
      ]
    }
  }),
});
Quantization
Quantization reduces model size and computational requirements while aiming to preserve performance. Most LLMs today use FP16 or BF16 for training and inference, cutting memory requirements in half compared to FP32. Some optimizations use FP8 or quantization to reduce size further (e.g., INT8, INT4).

Field	Type	Default	Description
quantizations	string[]	-	List of quantization levels to filter by (e.g. ["int4", "int8"]). Learn more
Quantized models may exhibit degraded performance for certain prompts, depending on the method used.

Providers can support various quantization levels for open-weight models.

Quantization Levels
By default, requests are load-balanced across all available providers, ordered by price. To filter providers by quantization level, specify the quantizations field in the provider parameter with the following values:

int4: Integer (4 bit)
int8: Integer (8 bit)
fp4: Floating point (4 bit)
fp6: Floating point (6 bit)
fp8: Floating point (8 bit)
fp16: Floating point (16 bit)
bf16: Brain floating point (16 bit)
fp32: Floating point (32 bit)
unknown: Unknown
Example: Requesting FP8 Quantization
Here’s an example that will only use providers that support FP8 quantization:


TypeScript

Python

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    'model': 'meta-llama/llama-3.1-8b-instruct',
    'messages': [
      {
        'role': 'user',
        'content': 'Hello'
      }
    ],
    'provider': {
      'quantizations': [
        'fp8'
      ]
    }
  }),
});
Max Price
To filter providers by price, specify the max_price field in the provider parameter with a JSON object specifying the highest provider pricing you will accept.

For example, the value {"prompt": 1, "completion": 2} will route to any provider with a price of <= $1/m prompt tokens, and <= $2/m completion tokens or less.

Some providers support per request pricing, in which case you can use the request attribute of max_price. Lastly, image is also available, which specifies the max price per image you will accept.

Practically, this field is often combined with a provider sort to express, for example, “Use the provider with the highest throughput, as long as it doesn’t cost more than $x/m tokens.”

Terms of Service
You can view the terms of service for each provider below. You may not violate the terms of service or policies of third-party providers that power the models on OpenRouter.

- Weights & Biases: https://site.wandb.ai/terms/
- Cerebras: https://www.cerebras.ai/terms-of-service
- Venice: https://venice.ai/legal/tos
- Moonshot AI: https://platform.moonshot.ai/docs/agreement/modeluse
- Morph: https://morphllm.com/privacy
- kluster.ai: https://www.kluster.ai/terms-of-use
- OpenAI: https://openai.com/policies/row-terms-of-use/
- SambaNova: https://sambanova.ai/terms-and-conditions
- Amazon Bedrock: https://aws.amazon.com/service-terms/
- Mistral: https://mistral.ai/terms/#terms-of-use
- NextBit: https://www.nextbit256.com/docs/terms-of-service
- Atoma: https://atoma.network/terms_of_service
- AI21: https://www.ai21.com/terms-of-service/
- Minimax: https://www.minimax.io/platform/protocol/terms-of-service
- Groq: https://groq.com/terms-of-use/
- Baseten: https://www.baseten.co/terms-and-conditions
- Anthropic: https://www.anthropic.com/legal/commercial-terms
- Featherless: https://featherless.ai/terms
- Azure: https://www.microsoft.com/en-us/legal/terms-of-use?oneroute=true
- Lambda: https://lambda.ai/legal/terms-of-service
- nCompass: https://ncompass.tech/terms
- Mancer (private): https://mancer.tech/terms
- Hyperbolic: https://hyperbolic.xyz/terms
- Crusoe: https://legal.crusoe.ai/open-router#managed-inference-tos-open-router
- Cohere: https://cohere.com/terms-of-use
- DeepSeek: https://chat.deepseek.com/downloads/DeepSeek%20Terms%20of%20Use.html
- NovitaAI: https://novita.ai/legal/terms-of-service
- Avian.io: https://avian.io/terms
- Perplexity: https://www.perplexity.ai/hub/legal/perplexity-api-terms-of-service
- xAI: https://x.ai/legal/terms-of-service-enterprise
- Inflection: https://developers.inflection.ai/tos
- Fireworks: https://fireworks.ai/terms-of-service
- inference.net: https://inference.net/terms-of-service
- DeepInfra: https://deepinfra.com/terms
- Inception: https://www.inceptionlabs.ai/terms
- NVIDIA: https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf
- Alibaba Cloud Int.: https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-product-terms-of-service-v-3-8-0
- Friendli: https://friendli.ai/terms-of-service
- Targon: https://targon.com/terms
- Ubicloud: https://www.ubicloud.com/docs/about/terms-of-service
- Infermatic: https://infermatic.ai/terms-and-conditions/
- AionLabs: https://www.aionlabs.ai/terms/
- Cloudflare: https://www.cloudflare.com/service-specific-terms-developer-platform/#developer-platform-terms
- Nineteen: https://nineteen.ai/tos
- Liquid: https://www.liquid.ai/terms-conditions
- Chutes: https://chutes.ai/tos
- Nebius AI Studio: https://docs.nebius.com/legal/studio/terms-of-use/
- Enfer: https://enfer.ai/privacy-policy
- CrofAI: https://ai.nahcrof.com/privacy
- Relace: https://www.relace.ai/privacy-policy
- Phala: https://red-pill.ai/terms
- GMICloud: https://docs.gmicloud.ai/privacy
- Meta: https://llama.developer.meta.com/legal/terms-of-service
- OpenInference: https://www.openinference.xyz/terms
- Parasail: https://www.parasail.io/legal/terms
- Google Vertex: https://cloud.google.com/terms/
- AtlasCloud: https://www.atlascloud.ai/privacy
- Google AI Studio: https://cloud.google.com/terms/
- Together: https://www.together.ai/terms-of-service
JSON Schema for Provider Preferences
For a complete list of options, see this JSON schema:

Provider Preferences Schema

{
    "$ref": "#/definitions/Provider Preferences Schema",
    "definitions": {
      "Provider Preferences Schema": {
        "type": "object",
        "properties": {
          "allow_fallbacks": {
            "type": [
              "boolean",
              "null"
            ],
            "description": "Whether to allow backup providers to serve requests\n- true: (default) when the primary provider (or your custom providers in \"order\") is unavailable, use the next best provider.\n- false: use only the primary/custom provider, and return the upstream error if it's unavailable.\n"
          },
          "require_parameters": {
            "type": [
              "boolean",
              "null"
            ],
            "description": "Whether to filter providers to only those that support the parameters you've provided. If this setting is omitted or set to false, then providers will receive only the parameters they support, and ignore the rest."
          },
          "data_collection": {
            "anyOf": [
              {
                "type": "string",
                "enum": [
                  "deny",
                  "allow"
                ]
              },
              {
                "type": "null"
              }
            ],
            "description": "Data collection setting. If no available model provider meets the requirement, your request will return an error.\n- allow: (default) allow providers which store user data non-transiently and may train on it\n- deny: use only providers which do not collect user data.\n"
          },
          "zdr": {
            "type": [
              "boolean",
              "null"
            ]
          },
          "order": {
            "anyOf": [
              {
                "type": "array",
                "items": {
                  "anyOf": [
                    {
                      "type": "string",
                      "enum": [
                        "AnyScale",
                        "Cent-ML",
                        "HuggingFace",
                        "Hyperbolic 2",
                        "Lepton",
                        "Lynn 2",
                        "Lynn",
                        "Mancer",
                        "Modal",
                        "OctoAI",
                        "Recursal",
                        "Reflection",
                        "Replicate",
                        "SambaNova 2",
                        "SF Compute",
                        "Together 2",
                        "01.AI",
                        "AI21",
                        "AionLabs",
                        "Alibaba",
                        "Amazon Bedrock",
                        "Anthropic",
                        "AtlasCloud",
                        "Atoma",
                        "Avian",
                        "Azure",
                        "BaseTen",
                        "Cerebras",
                        "Chutes",
                        "Cloudflare",
                        "Cohere",
                        "CrofAI",
                        "Crusoe",
                        "DeepInfra",
                        "DeepSeek",
                        "Enfer",
                        "Featherless",
                        "Fireworks",
                        "Friendli",
                        "GMICloud",
                        "Google",
                        "Google AI Studio",
                        "Groq",
                        "Hyperbolic",
                        "Inception",
                        "InferenceNet",
                        "Infermatic",
                        "Inflection",
                        "InoCloud",
                        "Kluster",
                        "Lambda",
                        "Liquid",
                        "Mancer 2",
                        "Meta",
                        "Minimax",
                        "Mistral",
                        "Moonshot AI",
                        "Morph",
                        "NCompass",
                        "Nebius",
                        "NextBit",
                        "Nineteen",
                        "Novita",
                        "Nvidia",
                        "OpenAI",
                        "OpenInference",
                        "Parasail",
                        "Perplexity",
                        "Phala",
                        "Relace",
                        "SambaNova",
                        "SiliconFlow",
                        "Stealth",
                        "Switchpoint",
                        "Targon",
                        "Together",
                        "Ubicloud",
                        "Venice",
                        "WandB",
                        "xAI",
                        "Z.AI",
                        "FakeProvider"
                      ]
                    },
                    {
                      "type": "string"
                    }
                  ]
                }
              },
              {
                "type": "null"
              }
            ],
            "description": "An ordered list of provider slugs. The router will attempt to use the first provider in the subset of this list that supports your requested model, and fall back to the next if it is unavailable. If no providers are available, the request will fail with an error message."
          },
          "only": {
            "anyOf": [
              {
                "$ref": "#/definitions/Provider Preferences Schema/properties/order/anyOf/0"
              },
              {
                "type": "null"
              }
            ],
            "description": "List of provider slugs to allow. If provided, this list is merged with your account-wide allowed provider settings for this request."
          },
          "ignore": {
            "anyOf": [
              {
                "$ref": "#/definitions/Provider Preferences Schema/properties/order/anyOf/0"
              },
              {
                "type": "null"
              }
            ],
            "description": "List of provider slugs to ignore. If provided, this list is merged with your account-wide ignored provider settings for this request."
          },
          "quantizations": {
            "anyOf": [
              {
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "int4",
                    "int8",
                    "fp4",
                    "fp6",
                    "fp8",
                    "fp16",
                    "bf16",
                    "fp32",
                    "unknown"
                  ]
                }
              },
              {
                "type": "null"
              }
            ],
            "description": "A list of quantization levels to filter the provider by."
          },
          "sort": {
            "anyOf": [
              {
                "type": "string",
                "enum": [
                  "price",
                  "throughput",
                  "latency"
                ]
              },
              {
                "type": "null"
              }
            ],
            "description": "The sorting strategy to use for this request, if \"order\" is not specified. When set, no load balancing is performed."
          },
          "max_price": {
            "type": "object",
            "properties": {
              "prompt": {
                "anyOf": [
                  {
                    "type": "number"
                  },
                  {
                    "type": "string"
                  },
                  {}
                ]
              },
              "completion": {
                "$ref": "#/definitions/Provider Preferences Schema/properties/max_price/properties/prompt"
              },
              "image": {
                "$ref": "#/definitions/Provider Preferences Schema/properties/max_price/properties/prompt"
              },
              "audio": {
                "$ref": "#/definitions/Provider Preferences Schema/properties/max_price/properties/prompt"
              },
              "request": {
                "$ref": "#/definitions/Provider Preferences Schema/properties/max_price/properties/prompt"
              }
            },
            "additionalProperties": false,
            "description": "The object specifying the maximum price you want to pay for this request. USD price per million tokens, for prompt and completion."
          },
          "experimental": {
            "anyOf": [
              {
                "type": "object",
                "properties": {},
                "additionalProperties": false
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "additionalProperties": false
      }
    },
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
