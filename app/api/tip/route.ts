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
  throw new Error('All models unavailable')
}

export async function POST(req: Request) {
  const { title, description, day, goal } = await req.json()

  const prompt = `
You are a career coach. Give a short, practical, actionable tip for this learning task.

Career goal: ${goal}
Day ${day} task: ${title}
Task description: ${description}

Write 2-3 sentences maximum. Be specific, encouraging, and practical.
No bullet points, no headers, just plain text advice.
`

  try {
    const response = await generateWithRetry(prompt)
    const tip = response.text?.trim() ?? ''
    return Response.json({ tip })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 503 })
  }
}