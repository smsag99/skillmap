import { GoogleGenAI } from '@google/genai'

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
  const body = await req.json()
  const { goal, cv, pdf } = body

  const prompt = `
You are a career coach AI. Analyze this CV and the user's dream job goal.

Dream job goal: ${goal}

Respond ONLY with a JSON object in this exact format, no markdown, no explanation:
{
  "current_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "gaps_summary": "A 2-3 sentence summary of the main skill gaps",
  "readiness_score": 65,
  "extracted_text": "full text extracted from the CV"
}
`

  let contents: any

  if (pdf) {
    contents = [
      { inlineData: { mimeType: 'application/pdf', data: pdf } },
      { text: prompt }
    ]
  } else {
    contents = `CV:\n${cv}\n\n${prompt}`
  }

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