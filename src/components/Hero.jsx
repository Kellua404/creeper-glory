import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useAnimate } from 'framer-motion'
import CreeperModel from './CreeperModel'
import { useReducedMotion } from '../hooks/useReducedMotion'

const PARTICLE_COUNT = 28

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.floor(Math.random() * 5),
  duration: 4 + Math.random() * 8,
  delay: Math.random() * 6,
  dy: -(30 + Math.random() * 60),
}))

function Particles({ reduced }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
      {!reduced && PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: '#54a832',
            imageRendering: 'pixelated',
          }}
          animate={{ y: [0, p.dy, 0], opacity: [0, 0.6, 0] }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

const headlineLetters = 'THE CREEPER'.split('')

// Responsive square size for the WebGL stage.
function useStageSize() {
  const [size, setSize] = useState(360)
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      setSize(Math.round(Math.max(300, Math.min(480, w * 0.78, window.innerHeight * 0.52))))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return size
}

export default function Hero() {
  const reduced = useReducedMotion()
  const stageSize = useStageSize()
  const [flash, setFlash] = useState(false)
  const [scope, animate] = useAnimate()

  const handleExplode = useCallback(() => {
    setFlash(true)
    setTimeout(() => setFlash(false), 220)
    if (!reduced) {
      animate(
        scope.current,
        { x: [0, -12, 11, -8, 7, -4, 3, 0], y: [0, 7, -6, 5, -4, 2, -1, 0] },
        { duration: 0.55, ease: 'easeInOut' },
      )
    }
  }, [animate, scope, reduced])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-16"
    >
      <Particles reduced={reduced} />

      {/* Flash on detonation */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="hero-flash"
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            aria-hidden="true"
            className="fixed inset-0 bg-white z-[9999] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Radial glow behind the mob */}
      <div
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle, rgba(84,168,50,0.16) 0%, transparent 68%)',
          width: 640,
          height: 640,
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          borderRadius: '50%',
        }}
      />

      {/* 3D voxel Creeper */}
      <motion.div
        ref={scope}
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-2"
        style={{ height: stageSize }}
      >
        <CreeperModel size={stageSize} onExplode={handleExplode} />
        {/* contact-shadow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: stageSize * 0.06,
            left: '50%',
            transform: 'translateX(-50%)',
            width: stageSize * 0.46,
            height: stageSize * 0.06,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 72%)',
            borderRadius: '50%',
            filter: 'blur(3px)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="font-pixel text-[10px] text-creeper-light/55 mb-6 relative z-10 select-none"
      >
        {reduced ? 'Keeper of the Minecraft' : 'tap the Creeper, if you dare'}
      </motion.p>

      {/* Headline — staggered letters */}
      <motion.h1
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.3 } } }}
        className="font-pixel text-3xl sm:text-5xl lg:text-6xl text-creeper-green mb-4 relative z-10 tracking-wider"
        style={{ textShadow: '0 0 30px rgba(84,168,50,0.5)' }}
      >
        {headlineLetters.map((ch, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
            }}
            style={{ display: 'inline-block' }}
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="font-body text-white/60 text-sm sm:text-base max-w-md px-4 mb-10 relative z-10 leading-relaxed"
      >
        Keeper of the Minecraft. Glory in the shadows. Silence before the storm.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 relative z-10"
      >
        <motion.a
          href="#glory"
          whileHover={{ y: -6, scale: 1.03, boxShadow: '0 0 24px rgba(84,168,50,0.5)' }}
          whileTap={{ scale: 0.97 }}
          className="font-pixel text-xs px-6 py-3 bg-creeper-green text-night-900 rounded cursor-pointer select-none"
        >
          Witness the Glory
        </motion.a>
        <motion.a
          href="#explosion"
          whileHover={{ y: -6, scale: 1.03, boxShadow: '0 0 24px rgba(216,60,44,0.5)' }}
          whileTap={{ scale: 0.97 }}
          className="font-pixel text-xs px-6 py-3 border border-tnt text-tnt rounded cursor-pointer select-none"
        >
          Do Not Approach
        </motion.a>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={reduced ? {} : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="w-px h-12 bg-gradient-to-b from-creeper-green/60 to-transparent mx-auto"
        />
      </motion.div>
    </section>
  )
}
