#!/usr/bin/env tsx
/**
 * generate-embeddings.ts
 *
 * One-time script to generate and store vector(1536) embeddings for all
 * ingredient names in the database using OpenAI text-embedding-ada-002.
 *
 * HOW TO RUN (first time or after adding new ingredients):
 *   npx tsx scripts/generate-embeddings.ts
 *
 * PREREQUISITES:
 *   - .env.local must have NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LLM_API_KEY
 *   - OpenAI key must have access to text-embedding-ada-002
 *   - Run `supabase db push` first to apply migrations (001 + 002)
 *
 * The script:
 *   1. Reads all ingredient names where embedding IS NULL
 *   2. Calls OpenAI embeddings endpoint (batched to avoid rate limits)
 *   3. UPDATEs each ingredient row with its embedding vector
 *
 * RE-RUN AFTER ADDING INGREDIENTS:
 *   Same command — it only processes rows where embedding IS NULL.
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load .env.local (Next.js convention)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('❌  Missing env vars. Check .env.local for:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or publishable key), LLM_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

const BATCH_SIZE = 20  // OpenAI allows up to 2048 inputs per call; keep small to be safe
const DELAY_MS = 200   // Pause between batches to respect rate limits

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('🔍  Fetching ingredients without embeddings…')

  const { data: ingredients, error } = await supabase
    .from('ingredients')
    .select('id, name')
    .is('embedding', null)

  if (error) {
    console.error('❌  Failed to fetch ingredients:', error.message)
    process.exit(1)
  }

  if (!ingredients || ingredients.length === 0) {
    console.log('✅  All ingredients already have embeddings. Nothing to do.')
    return
  }

  console.log(`📦  Processing ${ingredients.length} ingredient(s) in batches of ${BATCH_SIZE}…\n`)

  let processed = 0
  let failed = 0

  for (let i = 0; i < ingredients.length; i += BATCH_SIZE) {
    const batch = ingredients.slice(i, i + BATCH_SIZE)
    const names = batch.map((ing: { name: string }) => ing.name)

    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: names,
      })

      // Update each ingredient with its embedding
      for (let j = 0; j < batch.length; j++) {
        const embedding = response.data[j].embedding
        const { error: updateError } = await supabase
          .from('ingredients')
          .update({ embedding: JSON.stringify(embedding) })
          .eq('id', batch[j].id)

        if (updateError) {
          console.error(`  ❌  Failed to update "${batch[j].name}":`, updateError.message)
          failed++
        } else {
          console.log(`  ✓  ${batch[j].name}`)
          processed++
        }
      }

      if (i + BATCH_SIZE < ingredients.length) {
        await sleep(DELAY_MS)
      }
    } catch (err) {
      console.error(`  ❌  Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, err)
      failed += batch.length
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅  Done. Processed: ${processed} | Failed: ${failed}`)
  if (failed > 0) {
    console.log('   Re-run this script to retry failed ingredients.')
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
