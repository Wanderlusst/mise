import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { resolveChefResponse } from '@/lib/chefMiseEngine'

export async function POST(req: NextRequest) {
  try {
    const { message, contextRecipe, userPreferences } = await req.json()
    const query = (message || '').trim()

    // 1. Check for Groq / Gemini API keys for live generative response
    const groqKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY

    // Compute rich structured response from culinary engine
    const richFallback = resolveChefResponse(query)

    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey })
        const systemPrompt = `You are Chef Mise, a personal kitchen companion and warm sous-chef with world-class culinary intuition.
You speak like a knowledgeable, encouraging chef friend in the kitchen—never like a corporate robot or generic AI.
Keep answers concise, actionable, and warm. Include 1 key pro-tip when helpful.
User preferences: ${JSON.stringify(userPreferences || {})}.
Context recipe: ${contextRecipe || 'General cooking'}.`

        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.6,
          max_tokens: 500,
        })

        const reply = completion.choices[0]?.message?.content
        if (reply) {
          return NextResponse.json({
            reply,
            chefText: reply,
            chefMood: richFallback.chefMood,
            cardType: richFallback.cardType,
            recipeCard: richFallback.recipeCard,
            substitutionCard: richFallback.substitutionCard,
            foodWasteCard: richFallback.foodWasteCard,
            shelfLifeCard: richFallback.shelfLifeCard,
            followUps: richFallback.followUps,
          })
        }
      } catch (llmErr) {
        console.warn('[POST /api/chat] LLM error, using rich culinary engine:', llmErr)
      }
    }

    // Return rich structured culinary engine response
    return NextResponse.json({
      reply: richFallback.chefText,
      ...richFallback,
    })
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return NextResponse.json(
      { error: 'Failed to process cooking question', details: String(err) },
      { status: 500 }
    )
  }
}

