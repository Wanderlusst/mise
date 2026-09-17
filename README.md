# Mise

**A time-first and ingredient-first recipe assistant.** Tell Mise how much time you have or what's in your kitchen — it finds the best match, adapts quantities and substitutions via LLM, and walks you through each step with countdown timers.

---

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + custom design system
- **Framer Motion** for deliberate animations
- **Supabase** Postgres with pgvector
- **Groq** (llama-3.3-70b-versatile) for recipe adaptation
- **OpenAI** text-embedding-ada-002 for ingredient embeddings

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Supabase project (already created)
- Supabase CLI installed (`npm i -g supabase`)
- Groq API key (for recipe adaptation)
- OpenAI API key (for ingredient embeddings)

### 2. Install dependencies

```bash
cd mise
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your actual values
```

**Note on API keys:** `LLM_API_KEY` is used by Groq for adaptation (`lib/adaptRecipe.ts`) and by OpenAI for embeddings (`scripts/generate-embeddings.ts`). If your Groq and OpenAI keys differ, add a second variable (e.g. `OPENAI_API_KEY`) and update the embedding script accordingly.

### 4. Apply database migrations

```bash
supabase db push
```

This applies:
- `supabase/migrations/001_schema.sql` — enables pgvector, creates tables and indexes
- `supabase/migrations/002_seed.sql` — inserts 25 real recipes with ingredients and steps

### 5. Generate ingredient embeddings *(one-time, required for ingredient-first matching)*

```bash
npx tsx scripts/generate-embeddings.ts
```

This reads all ingredients from Supabase, calls OpenAI `text-embedding-ada-002`, and stores the `vector(1536)` embeddings. The script is **idempotent** — re-running only processes ingredients where `embedding IS NULL`. Run it again whenever you add new recipes or ingredients.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Running Tests

```bash
npm test
```

Tests 11 cases covering:
- `matchEngine.test.ts` — 4 cases: time-only, ingredients-only, both, diet exclusion
- `adaptRecipe.test.ts` — 4 cases: happy path, malformed JSON fallback, protein guardrail, guardrail unit tests

---

## Acceptance Criteria

| Test | How to verify |
|------|--------------|
| Ingredient match: `ice, lemon juice, tang, mint leaves` → ≥1 drink match | Enter ingredients on landing page with no time selected |
| Time-only: `10 min` with no ingredients → unconfirmed flags | Click "10 min" and submit |
| Protein guardrail holds even on bad LLM JSON | Covered by `adaptRecipe.test.ts` forced-bad-JSON case |
| Ticket matches step screen | Both screens call `/api/adapt-recipe` with the same params |
| Builds and runs | `npm run dev` |

---

## Architecture

```
mise/
├── app/
│   ├── page.tsx                  # Landing: time buttons, category chips, ingredient textarea
│   ├── results/page.tsx          # Staggered recipe card reveal
│   ├── steps/[id]/page.tsx       # Timeline + per-step countdown timers
│   ├── ticket/[id]/page.tsx      # Printable ticket (no animation)
│   └── api/
│       ├── match-recipes/route.ts
│       └── adapt-recipe/route.ts
├── lib/
│   ├── supabase.ts               # Server-only admin client
│   ├── matchEngine.ts            # Pure matching function (testable)
│   └── adaptRecipe.ts            # Pure adaptation function (testable)
├── scripts/
│   └── generate-embeddings.ts
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql
│       └── 002_seed.sql
└── __tests__/
    ├── matchEngine.test.ts
    └── adaptRecipe.test.ts
```

### Security notes

- `SUPABASE_SERVICE_ROLE_KEY` and `LLM_API_KEY` are **never** sent to the browser. All Supabase and LLM calls go through Route Handlers only.
- The public Supabase URL is exposed via `NEXT_PUBLIC_*` — that's expected.
