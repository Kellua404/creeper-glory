import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

// 12×12 pixel grid: 1=green body, 3=dark (eyes/mouth)
// Faithful to the original Minecraft Creeper 8×8 face texture, scaled to 12×12
const FACE_GRID = [
  [1,1,1,1,1,1,1,1,1,1,1,1],  // solid square head — no rounded corners
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,3,3,1,1,1,1,3,3,1,1],  // eyes top
  [1,1,3,3,1,1,1,1,3,3,1,1],  // eyes bottom
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,3,3,1,1,1,1,1],  // mouth: narrow top (2px center)
  [1,1,1,3,3,1,1,3,3,1,1,1],  // mouth: widens outward (split)
  [1,1,1,3,1,1,1,1,3,1,1,1],  // mouth: bottom outer corners
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
]

const COLOR = {
  0: 'transparent',
  1: '#54a832',
  2: '#3b7a22',
  3: '#1a3d12',
  4: '#7ed957',
}

export default function CreeperFace({ size = 240, crowned = false }) {
  const reduced = useReducedMotion()
  const cellSize = size / 12

  const eyeGlow = {
    animate: reduced ? {} : {
      boxShadow: [
        '0 0 4px 2px rgba(84,168,50,0.6)',
        '0 0 12px 6px rgba(84,168,50,0.9)',
        '0 0 4px 2px rgba(84,168,50,0.6)',
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
            top: -cellSize * 1.5,
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
                width: cellSize * 0.9,
                height: cellSize * h * 1.2,
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

      {/* Pixel face grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(12, ${cellSize}px)`,
          gridTemplateRows: `repeat(12, ${cellSize}px)`,
          imageRendering: 'pixelated',
        }}
      >
        {FACE_GRID.flat().map((cell, idx) => {
          const isEye = cell === 3
          const row = Math.floor(idx / 12)
          const col = idx % 12
          // Eye pixel positions: rows 3-4, cols 2-3 and 8-9
          const isGlowEye = isEye && row >= 3 && row <= 4 && (
            (col >= 2 && col <= 3) || (col >= 8 && col <= 9)
          )

          return (
            <motion.div
              key={idx}
              style={{
                width: cellSize,
                height: cellSize,
                background: COLOR[cell],
              }}
              {...(isGlowEye ? eyeGlow : {})}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
