'use client'

import Link from 'next/link'
import { useIsMobile } from '@/lib/useIsMobile'

// inside component:
const isMobile = useIsMobile()

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0f',
      fontFamily: "'DM Sans', sans-serif", color: '#e8e6e0',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '14px 20px' : '20px 48px', borderBottom: '1px solid #1e1e24',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>✦</div>
          <span style={{ fontWeight: 500, fontSize: 16 }}>SkillMap</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid #2a2a34',
            color: '#a0a0b0', fontSize: 14, textDecoration: 'none',
          }}>Log in</Link>
          <Link href="/signup" style={{
            padding: '8px 20px', borderRadius: 8,
            background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
            color: '#fff', fontSize: 14, textDecoration: 'none', fontWeight: 500,
          }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: isMobile ? '60px 16px 40px' : '100px 24px 60px',
      }}>
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 20,
          background: '#1a1a28', border: '1px solid #2a2a44',
          color: '#a78bfa', fontSize: 13, marginBottom: 32,
        }}>
          AI-powered career coaching
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 400,
          lineHeight: 1.15, letterSpacing: '-0.03em',
          margin: '0 0 24px', maxWidth: 700,
        }}>
          From your CV to your{' '}
          <span style={{ color: '#a78bfa' }}>dream job</span>
          {' '}in 30 days
        </h1>

        <p style={{
          fontSize: 18, color: '#666676', lineHeight: 1.7,
          maxWidth: 520, margin: '0 0 40px',
        }}>
          Paste your CV, pick your dream job. SkillMap analyzes your skill gaps
          and builds a personalized 30-day learning roadmap — powered by AI.
        </p>

        <Link href="/signup" style={{
          padding: '14px 36px', borderRadius: 12,
          background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
          color: '#fff', fontSize: 16, fontWeight: 500,
          textDecoration: 'none', letterSpacing: '-0.01em',
        }}>
          Build my roadmap →
        </Link>
      </div>

      {/* Features */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20, maxWidth: 900, margin: '0 auto', padding: '40px 24px 100px',
      }}>
        {[
          { icon: '📄', title: 'Paste your CV', desc: 'Drop in your experience and skills. No formatting required.' },
          { icon: '🎯', title: 'Pick your goal', desc: 'Tell us your dream role. Junior dev, product manager, data scientist — anything.' },
          { icon: '🧠', title: 'AI gap analysis', desc: 'Gemini identifies exactly what skills you\'re missing for that role.' },
          { icon: '🗺️', title: '30-day roadmap', desc: 'Get a day-by-day learning plan with tasks, resources, and milestones.' },
          { icon: '✅', title: 'Track progress', desc: 'Check off tasks daily. Watch your progress bar grow.' },
          { icon: '🚀', title: 'Land the job', desc: 'Show up to interviews with proof of what you\'ve learned.' },
        ].map((f, i) => (
          <div key={i} style={{
            padding: '28px', background: '#111114',
            border: '1px solid #1e1e24', borderRadius: 14,
          }}>
            <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px', color: '#e8e6e0' }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: '#555565', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '24px',
        borderTop: '1px solid #1e1e24', color: '#333340', fontSize: 13,
      }}>
        Built with Next.js · Supabase · Gemini
      </div>
    </div>
  )
}