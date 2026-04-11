'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Roadmap {
  id: string
  goal: string
  created_at: string
  skill_gaps: string[]
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)

    const { data } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setRoadmaps(data || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getProgress = async (roadmapId: string) => {
    const { data } = await supabase
      .from('tasks')
      .select('done')
      .eq('roadmap_id', roadmapId)
    if (!data) return 0
    const done = data.filter(t => t.done).length
    return Math.round((done / data.length) * 100)
  }

  const userName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'there'

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#555565', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    }}>Loading...</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid #1e1e24',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>✦</div>
          <span style={{ color: '#e8e6e0', fontWeight: 500 }}>SkillMap</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#7a7a8e', fontSize: 14 }}>
            Hey, <span style={{ color: '#a78bfa', fontWeight: 500 }}>{userName}</span> 👋
          </span>
          <button onClick={handleSignOut} style={{
            padding: '7px 16px', background: 'transparent',
            border: '1px solid #2a2a34', borderRadius: 8,
            color: '#7a7a8e', fontSize: 13, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{
          color: '#e8e6e0', fontSize: 28, fontWeight: 400,
          letterSpacing: '-0.02em', margin: '0 0 8px',
        }}>
          Your roadmaps
        </h1>
        <p style={{ color: '#555565', fontSize: 15, margin: '0 0 40px' }}>
          {roadmaps.length === 0
            ? 'No roadmaps yet. Create your first one!'
            : `${roadmaps.length} roadmap${roadmaps.length > 1 ? 's' : ''} in progress.`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* New roadmap button */}
          <button
            onClick={() => router.push('/new')}
            style={{
              width: '100%', padding: '28px 32px',
              background: '#111114', border: '2px dashed #2a2a34',
              borderRadius: 14, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', transition: 'border-color 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = '#7c6af7')}
            onMouseOut={e => (e.currentTarget.style.borderColor = '#2a2a34')}
          >
            <div style={{ color: '#a78bfa', fontSize: 22, marginBottom: 8 }}>+</div>
            <div style={{ color: '#e8e6e0', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
              New roadmap
            </div>
            <div style={{ color: '#555565', fontSize: 13 }}>
              Paste your CV and tell us your dream job
            </div>
          </button>

          {/* Existing roadmaps */}
          {roadmaps.map(roadmap => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              onClick={() => router.push(`/roadmap/${roadmap.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function RoadmapCard({ roadmap, onClick }: { roadmap: Roadmap, onClick: () => void }) {
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from('tasks')
      .select('done')
      .eq('roadmap_id', roadmap.id)
      .then(({ data }) => {
        if (!data || data.length === 0) { setProgress(0); return }
        const done = data.filter(t => t.done).length
        setProgress(Math.round((done / data.length) * 100))
      })
  }, [roadmap.id])

  const date = new Date(roadmap.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div
      onClick={onClick}
      style={{
        padding: '24px 28px', background: '#111114',
        border: '1px solid #1e1e24', borderRadius: 14,
        cursor: 'pointer', transition: 'border-color 0.15s',
      }}
      onMouseOver={e => (e.currentTarget.style.borderColor = '#2a2a44')}
      onMouseOut={e => (e.currentTarget.style.borderColor = '#1e1e24')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ color: '#e8e6e0', fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>
            {roadmap.goal}
          </h3>
          <span style={{ color: '#333340', fontSize: 12 }}>Created {date}</span>
        </div>
        {progress !== null && (
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: progress === 100 ? '#4ade80' : '#a78bfa',
          }}>
            {progress === 100 ? '✓ Complete' : `${progress}%`}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#1e1e24', borderRadius: 2 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${progress ?? 0}%`,
          background: progress === 100
            ? '#4ade80'
            : 'linear-gradient(90deg, #7c6af7, #a78bfa)',
          transition: 'width 0.4s ease',
        }}/>
      </div>

      {/* Skill gaps */}
      {roadmap.skill_gaps && roadmap.skill_gaps.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {roadmap.skill_gaps.slice(0, 4).map((skill: string, i: number) => (
            <span key={i} style={{
              padding: '3px 10px', background: '#1a1a28',
              border: '1px solid #2a2a44', borderRadius: 20,
              color: '#7a7a8e', fontSize: 11,
            }}>
              {skill}
            </span>
          ))}
          {roadmap.skill_gaps.length > 4 && (
            <span style={{ color: '#333340', fontSize: 11, padding: '3px 0' }}>
              +{roadmap.skill_gaps.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}