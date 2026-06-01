import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

const PIXEL_COUNT = 30

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

export default function PixelGrid() {
  const reduced = useReducedMotion()
  const containerRef = useRef(null)

  // Drifting pixel squares — pure CSS animation via inline style
  const pixels = Array.from({ length: PIXEL_COUNT }, (_, i) => ({
    id: i,
    size: Math.round(randomBetween(4, 14)),
    left: randomBetween(0, 100),
    top: randomBetween(0, 100),
    duration: randomBetween(8, 24),
    delay: randomBetween(0, 12),
    opacity: randomBetween(0.05, 0.25),
  }))

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 pixel-grid-bg overflow-hidden"
    >
      {!reduced && pixels.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: '#54a832',
            opacity: p.opacity,
            imageRendering: 'pixelated',
            animation: `drift-${p.id % 3} ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes drift-0 {
          0%, 100% { transform: translate(0, 0); }
          33%       { transform: translate(18px, -24px); }
          66%       { transform: translate(-12px, 16px); }
        }
        @keyframes drift-1 {
          0%, 100% { transform: translate(0, 0); }
          33%       { transform: translate(-20px, 14px); }
          66%       { transform: translate(16px, -18px); }
        }
        @keyframes drift-2 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(10px, 22px); }
        }
      `}</style>
    </div>
  )
}
