import { GoogleGenAI } from '@google/genai'
import { createSupabaseServer } from '@/lib/supabase-server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

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
          await new Promise(r => setTimeout(r, 2000 * (i + 1)))
          continue
        }
        if (is503) break
        throw err
      }
    }
  }
  throw new Error('All models unavailable, please try again in a minute')
}

export async function POST(req: Request) {
  const { cv, goal, skill_gaps } = await req.json()

  const prompt = `
You are a career coach AI. Create a 30-day learning roadmap.

CV: ${cv}
Goal: ${goal}
Skill gaps: ${JSON.stringify(skill_gaps)}

Respond ONLY with a JSON array of exactly 30 objects, no markdown, no explanation:
[
  {
    "day": 1,
    "title": "Short task title",
    "description": "What to do and why it helps"
  }
]
`

  try {
    const response = await generateWithRetry(prompt)
    const text = response.text ?? ''
    const clean = text.replace(/```json|```/g, '').trim()
    const tasks = JSON.parse(clean)

    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roadmap } = await supabase
      .from('roadmaps')
      .insert({ user_id: user.id, goal, cv_text: cv, skill_gaps })
      .select()
      .single()

    await supabase.from('tasks').insert(
      tasks.map((t: any) => ({
        roadmap_id: roadmap.id,
        day: t.day,
        title: t.title,
        description: t.description,
      }))
    )

    return Response.json({ roadmap_id: roadmap.id })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 503 })
  }
}