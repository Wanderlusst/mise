import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Intelligent fallbacks for key culinary prompts
const PRESET_RESPONSES: Record<string, string> = {
  exhausted: `### 🍳 10-Minute Comfort Egg Fried Rice (Zero Effort)

Since you're exhausted, let's keep prep and cleanup to a single pan with zero fuss.

#### What you need:
- **Cooked rice** (1–2 cups, cold or leftover works best)
- **Eggs** (2, lightly beaten with a fork)
- **Cooking oil or butter** (1 tbsp)
- **Salt & pepper** (to taste)
- *(Optional bonus: soy sauce or chili flakes if you spot them)*

#### Quick 3-Step Method:
1. **Heat the pan**: Add 1 tbsp oil over medium-high heat.
2. **Scramble the eggs**: Pour in beaten eggs. Let them bubble for 15 seconds, then swirl until soft curds form (about 40 seconds). Push to the side of the pan.
3. **Toss in rice**: Dump in your rice. Press down lightly to break clumps and let it sizzle with the eggs. Season with salt & pepper. Stir together for 2 minutes until hot and lightly toasted.

> **💡 Low-Energy Tip:** Eat it straight from the bowl with a spoon. You're fed in under 8 minutes with only 1 pan to wash!`,

  yogurt: `### 🥛 Skipping or Replacing Yogurt

Yes, you can easily skip or substitute yogurt depending on its role in the dish:

#### 1. In Curries & Gravies (Thickener & Mild Sourness):
- **Can you skip it?** Yes! Simply add **1 tsp lemon juice or amchur (dry mango powder)** at the very end to retain the tangy note, and a splash of water or coconut milk for moisture.
- **Best Substitutes:**
  - **Cashew Paste or Cream:** 2 tbsp blended cashews with water (makes it silky rich).
  - **Tomato Puree:** Adds body and natural tang.
  - **Coconut Milk / Cream:** Great dairy-free swap.

#### 2. In Marinades (Tenderizer):
- **Swap:** 1 tbsp lemon juice or 1 tbsp vinegar mixed with 1 tbsp oil. The acid tenderizes proteins just like yogurt's lactic acid.`,

  curry_leaves: `### 🌿 Substitutes for Curry Leaves (Kadi Patta)

Curry leaves have a unique citrusy, herbal, slightly nutty aroma from the citrus/rue family. While nothing is an exact 1:1 twin, here are the best practical swaps:

1. **Lime Zest + Fresh Basil (Best Match)**:
   - Mix finely grated lime or lemon zest with a few torn basil or Thai basil leaves. Sizzle them in oil for 5 seconds at the tempering stage.
2. **Kaffir Lime Leaves**:
   - Very close citrusy aromatic profile. Use half the amount as kaffir is stronger.
3. **Bay Leaf (Tej Patta) + Lemon Juice**:
   - Provides woodsy background depth; add a squeeze of fresh lemon at the end for the citrus lift.

> **Can you simply omit it?**
> Yes! In standard dal or vegetable sabzis, bumping up **cumin seeds (jeera)** and a pinch of **asafetida (hing)** in the tadka will ensure the aroma remains vibrant.`,

  different: `### ✨ Break-the-Routine Pick: South Indian Curd Rice with Crisp Tadka

Looking at your routine, let's steer away from heavy gravies and dry stir-fries to something cooling, tangy, and deeply soothing with a crisp mustard-ginger crunch.

#### Why it's a refreshing change:
- Velvety, cooling yogurt tempered with crackling mustard seeds, ginger slivers, and green chili.
- Takes **under 10 minutes** if you have cooked rice.
- Light on the stomach, highly probiotic, and restaurant-quality taste at home.

#### The Magic Tadka:
1. Mix 1 cup soft cooked rice with 1/2 cup yogurt, splash of milk, and salt.
2. Heat 1 tsp oil: add 1/2 tsp mustard seeds, 1 chopped green chili, 1/2 tsp grated ginger, and a pinch of hing.
3. Pour the sizzling tadka over the rice and fold gently. Top with pomegranate or roasted cashews if you have them!`,

  paneer: `### 🧀 How Long Does Paneer Keep in the Fridge?

| Paneer Type | Fridge Life | Storage Rule |
|---|---|---|
| **Store-Bought (Unopened)** | 30–45 days | Check the package expiry date |
| **Store-Bought (Opened)** | **3 to 4 days** | Submerged in clean water container |
| **Fresh Homemade Paneer** | **2 to 3 days** | Airtight container or submerged |

#### 🧊 The "Water Immersion" Trick to Double Shelf Life:
Place paneer in a container and **cover it completely with fresh cold water**, then seal the lid. **Change the water every 24 hours**. This keeps the paneer moist, prevents souring, and extends freshness up to **6–7 days**!

#### ⚠️ How to Tell if Paneer Has Gone Bad:
- **Smell:** Sour, fermented, or pungent odor (fresh paneer smells mild and milky).
- **Texture:** Slimy or sticky surface when touched.
- **Color:** Yellowish or grayish discoloration on corners.
- **Taste:** Sharp sour or bitter bite. If sour, discard immediately.`,
}

export async function POST(req: NextRequest) {
  try {
    const { message, contextRecipe } = await req.json()
    const text = (message || '').toLowerCase()

    // 1. Check for Groq / Gemini API keys for live generative response
    const groqKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY

    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey })
        const systemPrompt = `You are Mise AI, an empathetic, highly skilled culinary expert and kitchen assistant.
Provide concise, practical, and beautifully structured responses with Markdown formatting.
When the user is tired or short on time, give ultra-simple, 1-pan instructions.
When asked about substitutions or recipe tweaks, provide clear ratios and specify whether they can just skip it.
Current context recipe if applicable: ${contextRecipe || 'General Indian & World cooking'}.`

        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.6,
          max_tokens: 600,
        })

        const reply = completion.choices[0]?.message?.content
        if (reply) {
          return NextResponse.json({ reply })
        }
      } catch (llmErr) {
        console.warn('[POST /api/chat] LLM error, using smart culinary fallback:', llmErr)
      }
    }

    // 2. High-quality smart fallbacks matching user scenarios
    if (text.includes('exhausted') || text.includes('tired') || text.includes('eggs and rice') || text.includes('eggs') && text.includes('rice')) {
      return NextResponse.json({ reply: PRESET_RESPONSES.exhausted })
    }
    if (text.includes('yogurt') || text.includes('curd') || text.includes('dahi')) {
      return NextResponse.json({ reply: PRESET_RESPONSES.yogurt })
    }
    if (text.includes('curry leaves') || text.includes('substitute') || text.includes('kadi patta')) {
      return NextResponse.json({ reply: PRESET_RESPONSES.curry_leaves })
    }
    if (text.includes('different') || text.includes('surprise') || text.includes('explore') || text.includes('new')) {
      return NextResponse.json({ reply: PRESET_RESPONSES.different })
    }
    if (text.includes('paneer') || text.includes('shelf life') || text.includes('fridge') || text.includes('keep')) {
      return NextResponse.json({ reply: PRESET_RESPONSES.paneer })
    }

    // Default friendly assistant fallback
    return NextResponse.json({
      reply: `### 👨‍🍳 Chef Mise here!

I can help you with:
- **Low-effort meals** when you're tired with random ingredients
- **Ingredient substitutions** for any recipe you're cooking
- **Food shelf life & kitchen science**
- **Creative ideas** different from your usual favorites

Ask me anything or tap one of the quick question cards above!`,
    })
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return NextResponse.json(
      { error: 'Failed to process cooking question', details: String(err) },
      { status: 500 }
    )
  }
}
