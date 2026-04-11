'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useIsMobile } from '@/lib/useIsMobile'

// inside component:
const isMobile = useIsMobile()
interface Task {
  id: string
  day: number
  title: string
  description: string
  done: boolean
}

interface Roadmap {
  id: string
  goal: string
  skill_gaps: string[]
  created_at: string
}

export default function RoadmapPage() {
  const { id } = useParams()
  const router = useRouter()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  useEffect(() => {
    loadRoadmap()
  }, [id])

  const loadRoadmap = async () => {
    const { data: roadmapData } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('id', id)
      .single()

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('roadmap_id', id)
      .order('day')

    setRoadmap(roadmapData)
    setTasks(tasksData || [])
    setLoading(false)
  }

  const toggleTask = async (task: Task) => {
    const { data } = await supabase
      .from('tasks')
      .update({ done: !task.done })
      .eq('id', task.id)
      .select()
      .single()

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))
  }

  const completedCount = tasks.filter(t => t.done).length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#555565', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    }}>
      Loading your roadmap...
    </div>
  )

  if (!roadmap) return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#555565', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    }}>
      Roadmap not found.
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid #1e1e24',
      }}>
        <div
          onClick={() => router.push('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>✦</div>
          <span style={{ color: '#e8e6e0', fontWeight: 500 }}>SkillMap</span>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '7px 16px', background: 'transparent',
            border: '1px solid #2a2a34', borderRadius: 8,
            color: '#7a7a8e', fontSize: 13, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            color: '#e8e6e0', fontSize: 26, fontWeight: 400,
            letterSpacing: '-0.02em', margin: '0 0 8px',
          }}>
            {roadmap.goal}
          </h1>
          <p style={{ color: '#555565', fontSize: 14, margin: '0 0 24px' }}>
            30-day personalized learning roadmap
          </p>

          {/* Progress bar */}
          <div style={{
            padding: '20px 24px', background: '#111114',
            border: '1px solid #1e1e24', borderRadius: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#a0a0b0', fontSize: 13 }}>Overall progress</span>
              <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 500 }}>
                {completedCount}/{tasks.length} tasks · {progress}%
              </span>
            </div>
            <div style={{ height: 8, background: '#1e1e24', borderRadius: 4 }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c6af7, #a78bfa)',
                transition: 'width 0.4s ease',
              }}/>
            </div>
          </div>
        </div>

        {/* Skill gaps */}
        {roadmap.skill_gaps && roadmap.skill_gaps.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: '#555565', fontSize: 12, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Targeting these skill gaps
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {roadmap.skill_gaps.map((skill: string, i: number) => (
                <span key={i} style={{
                  padding: '5px 12px', background: '#1a1a28',
                  border: '1px solid #2a2a44', borderRadius: 20,
                  color: '#a78bfa', fontSize: 12,
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tasks list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(task => (
            <div
              key={task.id}
              style={{
                background: '#111114',
                border: `1px solid ${expandedDay === task.day ? '#2a2a44' : '#1e1e24'}`,
                borderRadius: 12, overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Task header */}
              <div
                onClick={() => setExpandedDay(expandedDay === task.day ? null : task.day)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', cursor: 'pointer',
                }}
              >
                {/* Checkbox */}
                <div
                  onClick={e => { e.stopPropagation(); toggleTask(task) }}
                  style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${task.done ? '#7c6af7' : '#2a2a34'}`,
                    background: task.done ? 'linear-gradient(135deg, #7c6af7, #a78bfa)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {task.done && <span style={{ color: '#fff', fontSize: 13 }}>✓</span>}
                </div>

                {/* Day badge */}
                <span style={{
                  fontSize: 11, color: '#555565', flexShrink: 0,
                  background: '#1a1a20', border: '1px solid #2a2a34',
                  padding: '2px 8px', borderRadius: 4,
                }}>
                  Day {task.day}
                </span>

                {/* Title */}
                <span style={{
                  color: task.done ? '#555565' : '#e8e6e0',
                  fontSize: 14, flex: 1,
                  textDecoration: task.done ? 'line-through' : 'none',
                  transition: 'color 0.15s',
                }}>
                  {task.title}
                </span>

                {/* Expand arrow */}
                <span style={{
                  color: '#333340', fontSize: 12, flexShrink: 0,
                  transform: expandedDay === task.day ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}>
                  ▼
                </span>
              </div>

              {/* Expanded description */}
              {expandedDay === task.day && (
                <div style={{
                  padding: '0 20px 16px 56px',
                  color: '#7a7a8e', fontSize: 13, lineHeight: 1.7,
                  borderTop: '1px solid #1a1a20',
                  paddingTop: 12,
                }}>
                  {task.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Completion message */}
        {progress === 100 && (
          <div style={{
            marginTop: 40, padding: '32px', textAlign: 'center',
            background: '#111114', border: '1px solid #2a2a44',
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <h2 style={{ color: '#e8e6e0', fontSize: 20, fontWeight: 400, margin: '0 0 8px' }}>
              Roadmap complete!
            </h2>
            <p style={{ color: '#555565', fontSize: 14, margin: 0 }}>
              You&apos;ve finished all 30 days. Time to apply for that dream job!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}