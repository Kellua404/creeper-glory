import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Authentic Minecraft Creeper face — the real 8×8 head-front texture.
// 0 = green body, 3 = dark (eyes + mouth).
// Eyes: two 2×2 squares. Mouth: 2px bridge → 4px row → two legs dropping down.
const FACE_GRID = [
  [0,0,0,0,0,0,0,0],
  [0,3,3,0,0,3,3,0],  // eyes — top row
  [0,3,3,0,0,3,3,0],  // eyes — bottom row
  [0,0,0,3,3,0,0,0],  // mouth — 2px bridge
  [0,0,3,3,3,3,0,0],  // mouth — 4px wide
  [0,0,3,0,0,3,0,0],  // mouth — legs
  [0,0,3,0,0,3,0,0],  // mouth — legs
  [0,0,0,0,0,0,0,0],
]

const GRID = 8

// Deterministic per-cell mottle so the green reads like the real pixel texture.
function shade(row, col) {
  const h = Math.sin(row * 12.9898 + col * 78.233) * 43758.5453
  const f = h - Math.floor(h)
  if (f < 0.18) return '#4a9a2c'
  if (f < 0.34) return '#5fb838'
  if (f < 0.5) return '#3f8a26'
  return '#54a832'
}

const DARK = '#0e2a0a'
const DARK_HL = '#16380f'

export default function CreeperFace({ size = 240, crowned = false }) {
  const reduced = useReducedMotion()
  const cellSize = size / GRID

  const eyeGlow = {
    animate: reduced ? {} : {
      boxShadow: [
        '0 0 4px 1px rgba(84,168,50,0.5) inset',
        '0 0 10px 3px rgba(84,168,50,0.85) inset',
        '0 0 4px 1px rgba(84,168,50,0.5) inset',
      ],
    },
    transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
  }

  return (
    <motion.div
      style={{ width: size, height: size, position: 'relative' }}
      animate={reduced ? {} : { scale: [1, 1.02, 1] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
    >
      {/* Crown for Glory section */}
      {crowned && (
        <div
          style={{
            position: 'absolute',
            top: -cellSize * 2.1,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
          }}
        >
          {[0.6, 1, 1.4, 1, 0.6].map((h, i) => (
            <motion.div
              key={i}
              style={{
                width: cellSize * 1.1,
                height: cellSize * h * 1.4,
                background: '#f5c542',
                alignSelf: 'flex-end',
                imageRendering: 'pixelated',
              }}
              animate={reduced ? {} : {
                boxShadow: [
                  '0 0 6px rgba(245,197,66,0.4)',
                  '0 0 18px rgba(245,197,66,0.9)',
                  '0 0 6px rgba(245,197,66,0.4)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}

      {/* Pixel face grid — authentic 8×8 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${GRID}, ${cellSize}px)`,
          imageRendering: 'pixelated',
          boxShadow: '0 0 40px rgba(84,168,50,0.25)',
        }}
      >
        {FACE_GRID.flat().map((cell, idx) => {
          const row = Math.floor(idx / GRID)
          const col = idx % GRID
          const isDark = cell === 3
          // Eyes occupy rows 1–2, cols 1–2 and 5–6.
          const isEye = isDark && row >= 1 && row <= 2 && (
            (col >= 1 && col <= 2) || (col >= 5 && col <= 6)
          )

          return (
            <motion.div
              key={idx}
              style={{
                width: cellSize,
                height: cellSize,
                background: isDark ? (isEye ? DARK : DARK_HL) : shade(row, col),
              }}
              {...(isEye ? eyeGlow : {})}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
