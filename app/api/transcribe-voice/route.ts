import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null)
    if (!formData) {
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 })
    }

    const audioFile = formData.get('audio')
    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: 'Invalid audio file' }, { status: 400 })
    }

    const groqKey = process.env.LLM_API_KEY || process.env.GROQ_API_KEY
    if (!groqKey) {
      return NextResponse.json(
        { error: 'Groq API key not configured for voice transcription' },
        { status: 500 }
      )
    }

    const whisperForm = new FormData()
    whisperForm.append('file', audioFile, 'voice-search.webm')
    whisperForm.append('model', 'whisper-large-v3')
    whisperForm.append('language', 'en')
    whisperForm.append('response_format', 'json')
    whisperForm.append(
      'prompt',
      'Culinary ingredients and grocery items such as garlic, tomatoes, pasta, rice, chicken, cheese, olive oil, basil, onions, potatoes.'
    )

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
      },
      body: whisperForm,
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.warn('[Transcription Error]:', response.status, errText)
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const rawText = (data.text || '').trim()

    // Clean conversational phrases
    const cleanedText = rawText
      .replace(/^(i have|i've got|find|search for|recipes with|show me|cook with|give me|tell me|make)\s+/i, '')
      .replace(/[.!?]+$/, '')
      .trim()

    return NextResponse.json({
      transcript: cleanedText || rawText,
      raw: rawText,
    })
  } catch (error: any) {
    console.error('[Voice Transcription Handler Error]:', error)
    return NextResponse.json(
      { error: error?.message || 'Server error transcribing audio' },
      { status: 500 }
    )
  }
}
