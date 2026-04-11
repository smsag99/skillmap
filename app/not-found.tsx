'use client'
import { useRouter } from 'next/navigation'
import PageWrapper from '@/components/PageWrapper'

export default function NotFound() {
  const router = useRouter()
  return (
    <PageWrapper>
    <div style={{
      minHeight: '100vh', background: '#0d0d0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", textAlign: 'center',
      padding: '24px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <div style={{
        width: 64, height: 64, borderRadius: 16, marginBottom: 24,
        background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
      }}>✦</div>
      <h1 style={{ color: '#e8e6e0', fontSize: 48, fontWeight: 400, margin: '0 0 8px', letterSpacing: '-0.03em' }}>404</h1>
      <p style={{ color: '#555565', fontSize: 16, margin: '0 0 32px' }}>This page doesn't exist.</p>
      <button onClick={() => router.push('/')} style={{
        padding: '12px 28px', background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
        border: 'none', borderRadius: 10, color: '#fff',
        fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
      }}>Go home</button>
    </div>
    </PageWrapper>
  )
}