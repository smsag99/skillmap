'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useIsMobile } from '@/lib/useIsMobile'

// inside component:
const isMobile = useIsMobile()

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const inputStyle = {
    padding: '12px 16px', background: '#1a1a20',
    border: '1px solid #2a2a34', borderRadius: 10,
    color: '#e8e6e0', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <div style={{
        width: '100%', maxWidth: 400, padding: '40px',
        background: '#111114', border: '1px solid #1e1e24', borderRadius: 16,
      }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>✦</div>
          <h1 style={{ color: '#e8e6e0', fontSize: 22, fontWeight: 500, margin: 0 }}>Create account</h1>
          <p style={{ color: '#555565', fontSize: 14, marginTop: 6 }}>Start building your career roadmap</p>
        </div>

        <button onClick={handleGoogle} style={{
          width: '100%', padding: '12px', marginBottom: 20,
          background: '#1a1a20', border: '1px solid #2a2a34',
          borderRadius: 10, color: '#e8e6e0', fontSize: 14,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#1e1e24' }}/>
          <span style={{ color: '#333340', fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#1e1e24' }}/>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle}/>
          <input type="password" placeholder="Password (min 6 characters)" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSignup()} style={inputStyle}/>
          {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
          <button onClick={handleSignup} disabled={loading} style={{
            padding: '12px', marginTop: 4,
            background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
            border: 'none', borderRadius: 10, color: '#fff',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#555565', fontSize: 13, marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#a78bfa', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}