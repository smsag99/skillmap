import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// load .env.local from project root
config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function embedText(text: string): Promise<number[]> {
  const res = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,    
     { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
    }
  )
const data = await res.json()
  console.log('Embedding response:', JSON.stringify(data))  // add this back
  return data.embedding.values
}

// ✏️ ADD YOUR DOCUMENTS HERE
const documents = [
  {
    content: `AI Engineer role requirements: proficiency in Python, experience with LLMs, 
    RAG systems, LangChain, vector databases like Pinecone or pgvector, Docker, Kubernetes, 
    REST APIs, and cloud platforms like GCP or AWS. Strong understanding of ML pipelines 
    and model deployment.`
  },
  {
    content: `To learn LangChain: start with the official LangChain docs, build a simple 
    RAG pipeline using FAISS or Chroma, then move to LangGraph for agents. 
    Key concepts: chains, memory, retrievers, tools, agents.`
  },
  {
    content: `Vector databases explained: they store text as embeddings (numerical vectors) 
    and allow similarity search. Popular options: Pinecone, Weaviate, Chroma, pgvector. 
    Used in RAG systems to retrieve relevant documents before passing to an LLM.`
  },
  {
    content: `Data Science Engineer skills: Python, SQL, PyTorch or TensorFlow, 
    time series forecasting, feature engineering, model evaluation, Spark for big data, 
    MLflow for experiment tracking, Docker for deployment.`
  },
  {
    content: `Backend developer skills for AI products: Node.js or Python FastAPI, 
    REST API design, PostgreSQL, authentication (OAuth, JWT), Docker, CI/CD pipelines, 
    cloud deployment on Vercel, GCP, or AWS.`
  },
  {
    content: `Network AI Engineer at TIM: requires knowledge of TCP/IP networking, 
    Python, RAG systems, vector databases, LangChain, Git, Docker, Kubernetes, 
    GCP, and CI/CD pipelines like Jenkins or GitLab CI. Goal is autonomous network management.`
  },
]

async function main() {
  console.log(`Seeding ${documents.length} documents...`)

  for (const doc of documents) {
    const embedding = await embedText(doc.content)

    const { error } = await supabase
      .from('documents')
      .insert({ content: doc.content, embedding })

    if (error) {
      console.error('Insert failed:', error.message)
    } else {
      console.log('✅ Inserted:', doc.content.slice(0, 60) + '...')
    }

    // avoid rate limiting
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('Done!')
}

main()