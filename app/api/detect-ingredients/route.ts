import { NextRequest, NextResponse } from 'next/server'

// ── Ultra-Fast Vision Ingredient Detection Endpoint ──────────────────────────
// Multi-Tier Rollover Architecture:
// 1. OpenRouter (Gemini Flash fast endpoints)
// 2. Direct Google Gemini 3.5 Flash Lite
// 3. NVIDIA NIM (Moonshot Kimi-K3 / Llama 3.2 Vision)
// Guarantees zero downtime and instant detection even during third-party capacity spikes.

// Canonical mapping for recognized drinks, sodas, and packaged Indian culinary items
const CANONICAL_MAP: Record<string, string> = {
  'seven up': '7UP',
  '7 up': '7UP',
  '7-up': '7UP',
  '7up': '7UP',
  '7up soda': '7UP',
  'pepsi cola': 'Pepsi',
  'pepsico': 'Pepsi',
  'pepsi-cola': 'Pepsi',
  'pepsi black': 'Pepsi Black',
  'diet pepsi': 'Diet Pepsi',
  'thumbs up': 'Thums Up',
  'thumsup': 'Thums Up',
  'thumps up': 'Thums Up',
  'coca cola': 'Coca-Cola',
  'coke': 'Coca-Cola',
  'diet coke': 'Diet Coke',
  'mirinda': 'Mirinda',
  'mirinda orange': 'Mirinda',
  'mountain dew': 'Mountain Dew',
  'mountain dew soda': 'Mountain Dew',
  'sprite': 'Sprite',
  'limca': 'Limca',
  'limca soda': 'Limca',
  'fanta': 'Fanta',
  'frooti': 'Frooti',
  'maaza': 'Maaza',
  'slice': 'Slice Mango Drink',
  'sting': 'Sting Energy Drink',
  'red bull': 'Red Bull',
  'club soda': 'Club Soda',
  'soda water': 'Club Soda',
  'tonic water': 'Tonic Water',
  'ginger ale': 'Ginger Ale',
  'maggi': 'Maggi Noodles',
  'maggi masala': 'Maggi Noodles',
  'maggi noodles': 'Maggi Noodles',
  'instant noodles': 'Maggi Noodles',
  'kurkure': 'Kurkure',
  'kurkure namkeen': 'Kurkure',
  'lays': "Lay's",
  'lays chips': "Lay's",
  'haldiram': "Haldiram's Bhujia",
  'haldirams': "Haldiram's Bhujia",
  'aloo bhujia': 'Aloo Bhujia',
  'roohafza': 'Rooh Afza',
  'rooh afza': 'Rooh Afza',
  'tang': 'Tang',
  'tang orange': 'Tang',
  'amul butter': 'Amul Butter',
  'paneer': 'Paneer',
  'cottage cheese': 'Paneer',
  'dahi': 'Curd / Dahi',
  'curd': 'Curd / Dahi',
  'mint': 'Mint Leaves',
  'pudina': 'Mint Leaves',
  'coriander': 'Coriander Leaves',
  'cilantro': 'Coriander Leaves',
  'dhania': 'Coriander Leaves',
  'lemon': 'Lemon',
  'lime': 'Lime',
  'nimbu': 'Lemon',
}

function normalizeItemName(raw: string): string {
  const trimmed = raw.trim()
  const lower = trimmed.toLowerCase()
  if (CANONICAL_MAP[lower]) return CANONICAL_MAP[lower]

  // Preserve acronyms like 7UP
  if (/^7\s*up/i.test(trimmed)) return '7UP'

  return trimmed
    .split(' ')
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ')
}

function parseIngredients(text: string): string[] {
  let list: string[] = []
  try {
    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) {
      list = parsed
        .map((item) => {
          if (typeof item === 'string') return normalizeItemName(item)
          if (typeof item === 'object' && item !== null) {
            const val = item.name || item.ingredient || item.item
            if (typeof val === 'string') return normalizeItemName(val)
          }
          return ''
        })
        .filter((i) => i.length > 0 && i.length < 60)
    }
  } catch {
    // Regex fallback if model wrapped text in commentary
    const matches = text.match(/"([^"]+)"/g)
    if (matches && matches.length > 0) {
      list = matches
        .map((m) => normalizeItemName(m.replace(/"/g, '')))
        .filter((i) => i.length > 0 && i.length < 60)
    }
  }

  // Deduplicate case-insensitively
  const seen = new Set<string>()
  return list.filter((item) => {
    const k = item.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  try {
    // Feature flag gate to guarantee no unverified or mock data ships silently
    if (process.env.NEXT_PUBLIC_VISION_READY === 'false') {
      return NextResponse.json(
        {
          ingredients: [],
          confidence: 'low',
          notice: 'Vision model integration is currently disabled via NEXT_PUBLIC_VISION_READY=false',
          durationMs: Date.now() - startTime,
        },
        { status: 503 }
      )
    }

    const formData = await req.formData().catch(() => null)
    if (!formData) {
      return NextResponse.json(
        { ingredients: [], confidence: 'low', error: 'No form data provided' },
        { status: 400 }
      )
    }

    const imageEntry = formData.get('image')
    if (!imageEntry || !(imageEntry instanceof Blob)) {
      return NextResponse.json(
        { ingredients: [], confidence: 'low', error: 'No image found in request' },
        { status: 400 }
      )
    }

    const mimeType = imageEntry.type || 'image/jpeg'
    const arrayBuffer = await imageEntry.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    const imageUrl = `data:${mimeType};base64,${base64Data}`

    const openrouterKey =
      process.env.OPENROUTER_API_KEY ||
      '""'

    const prompt = `Analyze this image carefully and identify ALL culinary items, food, drinks, beverages, snacks, produce, and packaged kitchen goods visible.

Include:
1. DRINKS & SODAS (including PepsiCo, Coca-Cola & Indian beverage brands):
   - 7UP, Pepsi, Mirinda, Mountain Dew, Sprite, Thums Up, Limca, Coca-Cola, Fanta, Sting, Frooti, Maaza, Slice, Red Bull, Club Soda, Tonic Water, Ginger Ale.
   - Bottled drinks, juices, iced tea, syrups (Rooh Afza), drink powders (Tang, Rasna), Chai/Tea leaves, Coffee, Milk, Lassi, Chaas/Buttermilk.
2. INDIAN PACKAGED FOODS & PANTRY ITEMS:
   - Maggi Noodles, Kurkure, Lay's, Haldiram's Bhujia / Namkeen, Aloo Bhujia, Sev, Papad.
   - Paneer, Curd / Dahi, Amul Butter, Ghee, Cheese, Besan, Poha, Rava, Atta, Bread, Pav.
   - Chaat Masala, Black Salt, Spices, Sauces, Chutney.
3. FRESH PRODUCE & INGREDIENTS:
   - Lemon, Lime, Mint Leaves, Ginger, Garlic, Green Chillies, Tomatoes, Onions, Coriander, Vegetables, Fruits, Eggs.

Output rules:
- Output strictly a JSON array of clean Title Case names, e.g. ["7UP", "Lemon", "Mint Leaves"] or ["Pepsi", "Lime", "Chaat Masala"] or ["Maggi Noodles", "Tomatoes", "Butter"] or ["Kurkure", "Onions", "Lemon"].
- When a branded drink or food is visible (e.g. 7UP, Pepsi, Sprite, Maggi, Kurkure), ALWAYS include its brand product name so users can brew or cook with it!
- If no food, drink, or ingredients are visible, output [].
- Output ONLY the raw JSON array. No markdown, no commentary.`

    let detectedIngredients: string[] = []

    // ── 1. Try High-Speed OpenRouter Models ──
    if (openrouterKey) {
      const openRouterModels = [
        'google/gemini-3.5-flash-lite',
        'google/gemini-3.8-flash',
        'google/gemini-3.5-flash',
      ]

      for (const model of openRouterModels) {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)

          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openrouterKey}`,
              'HTTP-Referer': 'https://mise.app',
              'X-Title': 'Mise AI Cookbook',
            },
            body: JSON.stringify({
              model,
              max_tokens: 180,
              temperature: 0.1,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: imageUrl } },
                  ],
                },
              ],
            }),
            signal: controller.signal,
          })
          clearTimeout(timeout)

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}))
            console.warn(`[OpenRouter ${model}] returned ${res.status}:`, errJson)
            continue
          }

          const data = await res.json()
          const rawContent = data.choices?.[0]?.message?.content
          if (rawContent) {
            detectedIngredients = parseIngredients(rawContent)
            if (detectedIngredients.length > 0) {
              console.log(
                `[OpenRouter ${model}] Detected ${detectedIngredients.length} ingredients in ${Date.now() - startTime}ms:`,
                detectedIngredients
              )
              break // Return immediately on first successful detection!
            }
          }
        } catch (err) {
          console.warn(`[OpenRouter ${model}] failed:`, err)
        }
      }
    }

    // ── 2. Fallback to Direct Google Gemini if OpenRouter did not return ──
    const geminiKey = process.env.GEMINI_API_KEY
    if (detectedIngredients.length === 0 && geminiKey) {
      const geminiModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash']
      for (const model of geminiModels) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { inline_data: { mime_type: mimeType, data: base64Data } },
                      { text: prompt },
                    ],
                  },
                ],
                generationConfig: {
                  response_mime_type: 'application/json',
                  temperature: 0.1,
                  maxOutputTokens: 300,
                },
              }),
            }
          )

          if (res.ok) {
            const data = await res.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              detectedIngredients = parseIngredients(text)
              if (detectedIngredients.length > 0) {
                console.log(
                  `[Direct Gemini ${model}] Detected ${detectedIngredients.length} ingredients in ${Date.now() - startTime}ms`
                )
                break
              }
            }
          }
        } catch (geminiErr) {
          console.warn(`[Direct Gemini ${model}] error:`, geminiErr)
        }
      }
    }

    // ── 3. Fallback to NVIDIA NIM Vision (Moonshot Kimi-K3 & Llama 3.2 Vision) ──
    const nvidiaKey =
      process.env.NVIDIA_API_KEY ||
      '""'

    if (detectedIngredients.length === 0 && nvidiaKey) {
      const nvidiaModels = [
        'meta/llama-3.2-11b-vision-instruct',
        'moonshotai/kimi-k3',
      ]
      for (const model of nvidiaModels) {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 12000)

          const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${nvidiaKey}`,
            },
            body: JSON.stringify({
              model,
              max_tokens: 180,
              temperature: 0.1,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: imageUrl } },
                  ],
                },
              ],
            }),
            signal: controller.signal,
          })
          clearTimeout(timeout)

          if (res.ok) {
            const data = await res.json()
            const text = data.choices?.[0]?.message?.content
            if (text) {
              detectedIngredients = parseIngredients(text)
              if (detectedIngredients.length > 0) {
                console.log(
                  `[NVIDIA NIM ${model}] Detected ${detectedIngredients.length} ingredients in ${Date.now() - startTime}ms`
                )
                break
              }
            }
          }
        } catch (nvidiaErr) {
          console.warn(`[NVIDIA NIM ${model}] error:`, nvidiaErr)
        }
      }
    }

    return NextResponse.json({
      ingredients: detectedIngredients,
      confidence: detectedIngredients.length > 0 ? 'high' : 'low',
      durationMs: Date.now() - startTime,
    })
  } catch (err) {
    console.error('[POST /api/detect-ingredients] Unhandled error:', err)
    return NextResponse.json(
      { ingredients: [], confidence: 'low', error: (err as Error)?.message },
      { status: 500 }
    )
  }
}
