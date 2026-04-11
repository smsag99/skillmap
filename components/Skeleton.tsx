export default function Skeleton({ width = '100%', height = 20, borderRadius = 6 }: {
  width?: string | number
  height?: number
  borderRadius?: number
}) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #1a1a20 25%, #22222a 50%, #1a1a20 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}