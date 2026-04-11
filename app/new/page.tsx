'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/lib/useIsMobile'


export default function NewRoadmap() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [cv, setCv] = useState('')
  const [goal, setGoal] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvMode, setCvMode] = useState<'text' | 'pdf'>('text')
  const [step, setStep] = useState<'input' | 'analyzing' | 'generating'>('input')
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if ((!cv.trim() && !cvFile) || !goal.trim()) {
      setError('Please fill in both fields')
      return
    }
    setError('')
    setStep('analyzing')

    let body: any

    if (cvMode === 'pdf' && cvFile) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.readAsDataURL(cvFile)
      })
      body = { goal, pdf: base64 }
    } else {
      body = { cv, goal }
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setAnalysis(data)
      if (data.extracted_text) setCv(data.extracted_text)
      setStep('input')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('input')
    }
  }

  const handleGenerate = async () => {
    setStep('generating')
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, goal, skill_gaps: analysis.missing_skills }),
      })
      const data = await res.json()
      router.push(`/roadmap/${data.roadmap_id}`)
    } catch {
      setError('Something went wrong generating the roadmap.')
      setStep('input')
    }
  }

  const textareaStyle = {
    width: '100%',
    padding: '14px 16px',
    background: '#1a1a20',
    border: '1px solid #2a2a34',
    borderRadius: 10,
    color: '#e8e6e0',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', padding: isMobile ? '14px 20px' : '16px 40px',
        borderBottom: '1px solid #1e1e24', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>✦</div>
        <span style={{ color: '#e8e6e0', fontWeight: 500 }}>SkillMap</span>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: isMobile ? '32px 16px' : '60px 24px' }}>
        <h1 style={{
          color: '#e8e6e0', fontSize: 28, fontWeight: 400,
          letterSpacing: '-0.02em', margin: '0 0 8px',
        }}>
          Build your roadmap
        </h1>
        <p style={{ color: '#555565', fontSize: 15, margin: '0 0 40px' }}>
          Upload your CV and tell us your dream job — AI will do the rest.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* CV Input */}
          <div>
            <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>
              Your CV / resume
            </label>

            {/* Toggle text/pdf */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(['text', 'pdf'] as const).map(mode => (
                <button key={mode} onClick={() => setCvMode(mode)} style={{
                  padding: '6px 16px', borderRadius: 8, fontSize: 13,
                  border: '1px solid #2a2a34', cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: cvMode === mode ? '#2a2a44' : 'transparent',
                  color: cvMode === mode ? '#a78bfa' : '#555565',
                }}>
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            {cvMode === 'text' ? (
              <textarea
                placeholder="Paste your full CV here — work experience, skills, education..."
                value={cv}
                onChange={e => setCv(e.target.value)}
                rows={10}
                style={textareaStyle}
              />
            ) : (
              <div
                onClick={() => document.getElementById('pdf-input')?.click()}
                style={{
                  padding: '40px', background: '#1a1a20',
                  border: `2px dashed ${cvFile ? '#7c6af7' : '#2a2a34'}`,
                  borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = '#7c6af7')}
                onMouseOut={e => (e.currentTarget.style.borderColor = cvFile ? '#7c6af7' : '#2a2a34')}
              >
                <input
                  id="pdf-input"
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={e => setCvFile(e.target.files?.[0] || null)}
                />
                <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
                <div style={{ color: cvFile ? '#a78bfa' : '#555565', fontSize: 14 }}>
                  {cvFile ? cvFile.name : 'Click to upload your PDF CV'}
                </div>
                {cvFile && (
                  <div style={{ color: '#4ade80', fontSize: 12, marginTop: 6 }}>
                    ✓ Ready to analyze
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Goal Input */}
          <div>
            <label style={{ color: '#a0a0b0', fontSize: 13, display: 'block', marginBottom: 8 }}>
              Your dream job
            </label>
            <textarea
              placeholder="e.g. Senior Frontend Developer at a product startup, Data Scientist at a fintech company..."
              value={goal}
              onChange={e => setGoal(e.target.value)}
              rows={3}
              style={textareaStyle}
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div style={{
              padding: '24px', background: '#111114',
              border: '1px solid #1e1e24', borderRadius: 14,
            }}>
              {/* Readiness score */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#a0a0b0', fontSize: 13 }}>Readiness score</span>
                  <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 500 }}>
                    {analysis.readiness_score}%
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e1e24', borderRadius: 3 }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${analysis.readiness_score}%`,
                    background: 'linear-gradient(90deg, #7c6af7, #a78bfa)',
                    transition: 'width 0.8s ease',
                  }}/>
                </div>
              </div>

              <p style={{ color: '#8a8a9e', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
                {analysis.gaps_summary}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ color: '#4ade80', fontSize: 12, margin: '0 0 8px', fontWeight: 500 }}>
                    Current skills
                  </p>
                  {analysis.current_skills?.slice(0, 6).map((s: string, i: number) => (
                    <div key={i} style={{ color: '#7a7a8e', fontSize: 13, padding: '3px 0' }}>
                      ✓ {s}
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ color: '#f87171', fontSize: 12, margin: '0 0 8px', fontWeight: 500 }}>
                    Missing skills
                  </p>
                  {analysis.missing_skills?.slice(0, 6).map((s: string, i: number) => (
                    <div key={i} style={{ color: '#7a7a8e', fontSize: 13, padding: '3px 0' }}>
                      ✗ {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!analysis ? (
            <button
              onClick={handleAnalyze}
              disabled={step === 'analyzing'}
              style={{
                padding: '14px',
                background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                border: 'none', borderRadius: 10, color: '#fff',
                fontSize: 15, fontWeight: 500, cursor: step === 'analyzing' ? 'wait' : 'pointer',
                fontFamily: 'inherit', opacity: step === 'analyzing' ? 0.7 : 1,
              }}
            >
              {step === 'analyzing' ? '⏳ Analyzing your CV...' : 'Analyze my CV →'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setAnalysis(null)}
                style={{
                  padding: '14px 20px', background: 'transparent',
                  border: '1px solid #2a2a34', borderRadius: 10,
                  color: '#7a7a8e', fontSize: 15, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ← Redo
              </button>
              <button
                onClick={handleGenerate}
                disabled={step === 'generating'}
                style={{
                  flex: 1, padding: '14px',
                  background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                  border: 'none', borderRadius: 10, color: '#fff',
                  fontSize: 15, fontWeight: 500,
                  cursor: step === 'generating' ? 'wait' : 'pointer',
                  fontFamily: 'inherit', opacity: step === 'generating' ? 0.7 : 1,
                }}
              >
                {step === 'generating' ? '⏳ Generating your 30-day roadmap...' : 'Generate my roadmap →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}