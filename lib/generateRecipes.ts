/**
 * lib/generateRecipes.ts
 *
 * Core AI recipe generation engine using multi-model fallback:
 * 1. Groq (Ultra-fast, ~1.3s response)
 * 2. OpenRouter (Multi-model auto router, flexible)
 * 3. NVIDIA NIM (Llama 3.1 Nemotron / 3.2 Vision)
 * 4. Gemini (Flash 2.0)
 *
 * Zero hardcoded seeds or template strings — all dishes and quantities are AI-generated.
 */

export interface GenerateInput {
  ingredients?: string[] | null
  category?: string | null
  diet?: string | null
  time?: number | null
  servings?: number
  region?: string | null
  allergies?: string[] | null
  count?: number
  exclude?: string[]
}

export interface RecipeStep {
  id: string
  step_order: number
  instruction: string
  duration_minutes: number | null
  parallel: boolean
}

export interface RecipeMatch {
  id: string
  name: string
  category: string
  timeMinutes: number
  diet: string
  matchScore: number
  missingIngredients: string[]
  allIngredients: { name: string; quantity: string; optional: boolean }[]
  steps?: RecipeStep[]
}

// ─── 1. Groq ────────────────────────────────────────────────────────────────
async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.LLM_API_KEY || process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const models = ['groq/compound-mini', 'openai/gpt-oss-120b']
  for (const model of models) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an executive chef AI. You must start your response directly with "[" and output ONLY a valid JSON array of recipes without any preamble, reasoning, or markdown fences.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 950,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.ok) {
        const data = await res.json()
        const msg = data.choices?.[0]?.message
        const content = msg?.content || (msg as any)?.reasoning
        if (content && content.trim().length > 10) return content
      }
    } catch (err) {
      console.warn(`[generateRecipes] Groq model ${model} failed:`, err)
    }
  }
  throw new Error('All Groq models failed')
}

// ─── 2. OpenRouter ──────────────────────────────────────────────────────────
async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const models = [
    'openrouter/auto',
    'meta-llama/llama-3.3-70b-instruct',
    'mistralai/mistral-nemo',
  ]

  for (const model of models) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 16000)

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://mise.app',
          'X-Title': 'Mise AI Cookbook',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an executive chef AI. Return ONLY a valid JSON array of recipes — no markdown fences, no conversational prose.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 2500,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content && content.trim().length > 10) return content
      }
    } catch (err) {
      console.warn(`[generateRecipes] OpenRouter model ${model} failed:`, err)
    }
  }
  throw new Error('All OpenRouter models failed')
}

// ─── 3. NVIDIA NIM ──────────────────────────────────────────────────────────
async function callNvidia(prompt: string): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) throw new Error('NVIDIA_API_KEY not set')

  const models = [
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'meta/llama-3.2-11b-vision-instruct',
  ]

  for (const model of models) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)

      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an executive chef AI. Return ONLY a valid JSON array of recipes — no markdown fences, no conversational prose.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 2500,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content && content.trim().length > 10) return content
      }
    } catch (err) {
      console.warn(`[generateRecipes] NVIDIA NIM model ${model} failed:`, err)
    }
  }
  throw new Error('All NVIDIA NIM models failed')
}

// ─── 4. Gemini ──────────────────────────────────────────────────────────────
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: 'You are an executive chef AI. Return ONLY a valid JSON array of recipes — no markdown fences, no conversational prose.',
          },
        ],
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 2500 },
    }),
  })

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ─── Multi-tier fallback ────────────────────────────────────────────────────
async function callAIWithFallback(prompt: string): Promise<string> {
  try {
    return await callGroq(prompt)
  } catch (err) {
    console.warn('[generateRecipes] Groq failed, trying OpenRouter:', err)
  }

  try {
    return await callOpenRouter(prompt)
  } catch (err) {
    console.warn('[generateRecipes] OpenRouter failed, trying NVIDIA NIM:', err)
  }

  try {
    return await callNvidia(prompt)
  } catch (err) {
    console.warn('[generateRecipes] NVIDIA NIM failed, trying Gemini:', err)
  }

  return callGemini(prompt)
}

function parseRecipes(raw: string, input: GenerateInput): RecipeMatch[] {
  try {
    let cleaned = raw.trim()
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (jsonMatch) {
      cleaned = jsonMatch[1].trim()
    } else {
      const firstArr = cleaned.indexOf('[')
      const firstObj = cleaned.indexOf('{')
      const startIdx = firstArr !== -1 ? firstArr : firstObj
      if (startIdx !== -1) {
        cleaned = cleaned.slice(startIdx).trim()
      }
    }

    let parsed: any = null
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      // Find the last complete top-level recipe object boundary if truncated: "} , {"
      const regex = /\}\s*,\s*\{/g
      let lastMatchIdx: number | null = null
      let m: RegExpExecArray | null
      while ((m = regex.exec(cleaned)) !== null) {
        lastMatchIdx = m.index
      }
      if (lastMatchIdx !== null) {
        const candidate = cleaned.slice(0, lastMatchIdx + 1) + ']'
        try {
          parsed = JSON.parse(candidate)
        } catch {}
      }
    }

    if (!parsed) return []
    const arr = Array.isArray(parsed) ? parsed : parsed.recipes ?? [parsed]

    return arr
      .filter((r: any) => r && typeof r.name === 'string' && r.name.trim().length > 0)
      .map((r: any, idx: number) => {
        const slug = r.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 35)

        return {
          id: `ai-gen-${slug}-${Date.now().toString(36)}-${idx}`,
          name: String(r.name).trim(),
          category: String(r.category || input.category || 'meal').toLowerCase(),
          timeMinutes: Number(r.time_minutes || r.timeMinutes || input.time || 15),
          diet: String(r.diet || input.diet || 'vegetarian').toLowerCase(),
          matchScore: typeof r.matchScore === 'number' ? r.matchScore : 0.95,
          missingIngredients: Array.isArray(r.missingIngredients) ? r.missingIngredients : [],
          allIngredients: (r.ingredients || []).map((ing: any) => ({
            name: typeof ing === 'string' ? ing : String(ing.name || '').trim(),
            quantity: typeof ing === 'object' && ing.quantity ? String(ing.quantity) : 'to taste',
            optional: Boolean(ing.optional),
          })),
          steps: Array.isArray(r.steps) && r.steps.length > 0
            ? r.steps.map((s: any, sIdx: number) => ({
                id: String(s.id || `step-${sIdx + 1}`),
                step_order: typeof s.step_order === 'number' ? s.step_order : sIdx + 1,
                instruction: String(s.instruction || '').trim(),
                duration_minutes: typeof s.duration_minutes === 'number' ? s.duration_minutes : null,
                parallel: Boolean(s.parallel),
              })).filter((s: any) => s.instruction.length > 0)
            : undefined,
        }
      })
      .slice(0, input.count ?? 5)
  } catch (err) {
    console.error('[parseRecipes] Parse error:', err, 'Raw:', raw)
    return []
  }
}

function buildPrompt(input: GenerateInput): string {
  const count = input.count ?? 4
  const parts: string[] = []

  parts.push(
    `Generate ${count} distinct, creative, restaurant-quality recipe suggestions as a JSON array.`
  )

  if (input.ingredients && input.ingredients.length > 0) {
    parts.push(`User's available ingredients: ${input.ingredients.join(', ')}.`)
    parts.push(
      `Craft authentic dishes that prominently feature these ingredients. Do NOT use generic placeholder names. Use REAL dish names (e.g. "Street Masala Shikanji", "Lemon Mint Mojito", "Zesty Kurkure Chaat", "Creamy Tomato Basil Penne", "Crispy Aloo Jeera").`
    )
  }

  if (input.category) parts.push(`Course category: ${input.category}.`)
  if (input.diet && input.diet !== 'all') parts.push(`Dietary requirement: ${input.diet}.`)
  if (input.time) parts.push(`Maximum prep & cook time: ${input.time} minutes.`)
  if (input.region && input.region !== 'all') parts.push(`Cuisine style: ${input.region}.`)
  if (input.servings) parts.push(`Portion for ${input.servings} people.`)
  if (input.allergies && input.allergies.length > 0) {
    parts.push(`EXCLUDE all allergens: ${input.allergies.join(', ')}.`)
  }
  if (input.exclude && input.exclude.length > 0) {
    parts.push(`Do NOT repeat these previous recipe IDs or names: ${input.exclude.join(', ')}.`)
  }

  parts.push(`
Format each object in the JSON array:
{
  "name": "string (mouthwatering authentic recipe name)",
  "category": "drink | salad | snack | meal | dessert",
  "diet": "vegan | vegetarian | non-veg",
  "time_minutes": number,
  "matchScore": 0.95,
  "missingIngredients": [],
  "ingredients": [
    { "name": "string", "quantity": "realistic amount (e.g. 250ml, 1 whole, 2 tbsp)", "optional": boolean }
  ],
  "steps": [
    { "id": "step-1", "step_order": 1, "instruction": "clear culinary step", "duration_minutes": 2, "parallel": false }
  ]
}`)

  return parts.join(' ')
}

export async function generateRecipesWithAI(input: GenerateInput): Promise<RecipeMatch[]> {
  const count = Math.min(input.count ?? 4, 8)
  const prompt = buildPrompt({ ...input, count })
  const raw = await callAIWithFallback(prompt)
  return parseRecipes(raw, { ...input, count })
}
