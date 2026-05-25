import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

// ── clients ──────────────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // use service role so RLS doesn't block reads
)

// ── embedding ─────────────────────────────────────────────────────────────────
async function embedText(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}` ,   {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
    }
  )
  if (!res.ok) throw new Error(`Embedding failed: ${res.statusText}`)
  const data = await res.json()
  return data.embedding.values as number[]
}

// ── vector search ─────────────────────────────────────────────────────────────
async function retrieveContext(query: string, matchCount = 5): Promise<string> {
  try {
    const embedding = await embedText(query)

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_count: matchCount,
    })

    if (error || !data || data.length === 0) return ''

    // Filter out low-relevance results — only keep docs above similarity threshold
    const relevant = (data as { content: string; similarity: number }[])
      .filter((d) => d.similarity >= 0.5)

    if (relevant.length === 0) return ''

    return relevant
      .map((d) => d.content)
      .join('\n\n---\n\n')
  } catch (err) {
    // RAG is best-effort — if it fails, fall back to plain prompt
     console.warn('RAG retrieval failed:', err)  // change this line
    return ''
  }
}

// ── gemini with retry ─────────────────────────────────────────────────────────
async function generateWithRetry(contents: any, retries = 3) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
  for (const model of models) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await ai.models.generateContent({ model, contents })
        return response
      } catch (err: any) {
        const is503 = err?.status === 503
        const is429 = err?.status === 429
        if ((is503 || is429) && i < retries - 1) {
          await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
          continue
        }
        if (is503) break
        throw err
      }
    }
  }
  throw new Error('All models unavailable')
}

// ── route handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json()
  const { goal, cv, pdf, mode = 'rag' } = body

  // 1. Retrieve context — only when mode is 'rag'
  let contextBlock = ''

  if (mode === 'rag') {
    const ragQuery = `${goal} ${cv ?? ''}`.slice(0, 1000)
    const context = await retrieveContext(ragQuery)

    if (!context) {
      return Response.json(
        { error: "I don't have enough information about this job in my knowledge base. Try switching to LLM mode." },
        { status: 404 }
      )
    }

    contextBlock = `
## Relevant industry knowledge (use this to improve your analysis):
${context}
`
  }

  // 2. Build prompt — same structure as before, RAG context injected at top if present
  const prompt = `
You are an expert career coach and CV reviewer. Analyze this CV for the given dream job goal.
${contextBlock}
Dream job goal: ${goal}

Respond ONLY with a JSON object in this exact format, no markdown, no explanation:
{
  "current_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "gaps_summary": "A 2-3 sentence summary of the main skill gaps",
  "readiness_score": 65,
  "extracted_text": "full text extracted from the CV",
  "cv_feedback": [
    {
      "section": "Summary / Objective",
      "issue": "What is wrong or missing",
      "suggestion": "Specific rewrite or improvement advice"
    },
    {
      "section": "Work Experience",
      "issue": "What is wrong or missing",
      "suggestion": "Specific rewrite or improvement advice"
    },
    {
      "section": "Skills",
      "issue": "What is wrong or missing",
      "suggestion": "Specific rewrite or improvement advice"
    },
    {
      "section": "Overall",
      "issue": "What is wrong or missing",
      "suggestion": "Specific rewrite or improvement advice"
    }
  ]
}

cv_feedback must have exactly 4 items covering different sections of the CV.
Be specific, actionable, and tailored to the dream job goal.
`

  // 3. Build contents (same PDF / text logic as before)
  let contents: any
  if (pdf) {
    contents = [
      { inlineData: { mimeType: 'application/pdf', data: pdf } },
      { text: prompt },
    ]
  } else {
    contents = `CV:\n${cv}\n\n${prompt}`
  }

  // 4. Call Gemini and return
  try {
    const response = await generateWithRetry(contents)
    const text = response.text ?? ''
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)
    return Response.json(data)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 503 })
  }
}