import { useRef, useState } from 'react'
import { motion, useAnimate, AnimatePresence } from 'framer-motion'
import Section from './Section'
import { useReducedMotion } from '../hooks/useReducedMotion'

const PARTICLE_COUNT = 40

function randomSign() { return Math.random() > 0.5 ? 1 : -1 }

export default function ExplosionButton() {
  const reduced = useReducedMotion()
  const [scope, animate] = useAnimate()
  const [exploding, setExploding] = useState(false)
  const [particles, setParticles] = useState([])
  const [flash, setFlash] = useState(false)
  const containerRef = useRef(null)

  async function handleExplode() {
    if (exploding) return
    if (reduced) {
      // Simple reduced-motion version
      setFlash(true)
      setTimeout(() => setFlash(false), 200)
      return
    }

    setExploding(true)

    // Spawn particles
    setParticles(
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: randomSign() * (40 + Math.random() * 200),
        y: randomSign() * (40 + Math.random() * 180),
        size: 4 + Math.floor(Math.random() * 10),
        color: Math.random() > 0.5 ? '#d83c2c' : (Math.random() > 0.5 ? '#54a832' : '#f5c542'),
        rotation: Math.random() * 360,
      }))
    )

    // Screen shake via the container
    await animate(scope.current, {
      x: [0, -10, 10, -8, 8, -6, 6, -3, 3, 0],
      y: [0,  6, -6,  4, -4,  3, -3,  2, -2, 0],
    }, { duration: 0.55, ease: 'easeInOut' })

    // White flash
    setFlash(true)
    setTimeout(() => setFlash(false), 180)

    // Clear particles after anim
    setTimeout(() => {
      setParticles([])
      setExploding(false)
    }, 900)
  }

  return (
    <Section id="explosion" className="py-24 px-4 sm:px-6 flex flex-col items-center text-center">
      <motion.h2
        initial={reduced ? {} : { opacity: 0 }}
        whileInView={reduced ? {} : { opacity: [0, 1, 0.1, 1, 0.5, 1] }}
        viewport={{ once: true, margin: '-80px' }}
        transition={reduced ? {} : { duration: 0.9, times: [0, 0.12, 0.28, 0.48, 0.68, 1], ease: 'linear' }}
        className="font-pixel text-xl sm:text-2xl text-tnt mb-4"
      >
        ⚠ DANGER ZONE ⚠
      </motion.h2>
      <motion.p
        initial={reduced ? {} : { opacity: 0 }}
        whileInView={reduced ? {} : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-white/50 text-sm mb-12 max-w-sm"
      >
        Under no circumstances should you press this button.
      </motion.p>

      {/* Flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
            className="fixed inset-0 bg-white z-[9999] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div ref={scope} className="relative">
        {/* Explosion particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0, rotate: p.rotation }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: 1,
              top: '50%',
              left: '50%',
              pointerEvents: 'none',
              zIndex: 20,
              imageRendering: 'pixelated',
            }}
          />
        ))}

        {/* The forbidden button */}
        <motion.button
          onClick={handleExplode}
          initial={reduced ? {} : { opacity: 0, scale: 0.88 }}
          whileInView={reduced ? {} : { opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduced ? {} : { y: -4, scale: 1.05, boxShadow: '0 0 32px rgba(216,60,44,0.7)' }}
          whileTap={{ scale: 0.95 }}
          disabled={exploding}
          className="relative z-10 font-pixel text-sm px-10 py-5 bg-tnt text-white rounded cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            boxShadow: '0 0 16px rgba(216,60,44,0.4)',
            imageRendering: 'pixelated',
          }}
        >
          {exploding ? 'SSSSSS...' : '[ DO NOT PRESS ]'}
        </motion.button>
      </div>

      <motion.p
        initial={reduced ? {} : { opacity: 0 }}
        whileInView={reduced ? {} : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, duration: 0.6 }}
        aria-hidden="true"
        className="font-pixel text-xs text-white/20 mt-8"
      >
        you were warned
      </motion.p>
    </Section>
  )
}
