'use client'
import { useEffect, useState } from 'react'

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
      background: '#0d0d0f',
      minHeight: '100vh',
    }}>
      {children}
    </div>
  )
}