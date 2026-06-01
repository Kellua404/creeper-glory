import { useRef, useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion'
import CreeperFace from './CreeperFace'
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
          animate={{
            y: [0, p.dy, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

const headlineLetters = 'THE CREEPER'.split('')

export default function Hero() {
  const reduced = useReducedMotion()
  const containerRef = useRef(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 })

  const faceX = useTransform(springX, [-0.5, 0.5], [-24, 24])
  const faceY = useTransform(springY, [-0.5, 0.5], [-16, 16])
  const bgX   = useTransform(springX, [-0.5, 0.5], [-8, 8])
  const bgY   = useTransform(springY, [-0.5, 0.5], [-4, 4])

  useEffect(() => {
    if (reduced) return
    const el = containerRef.current
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [reduced, mouseX, mouseY])

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  }
  const letterVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  }

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-16"
    >
      <Particles reduced={reduced} />

      {/* Radial glow behind face */}
      <motion.div
        aria-hidden="true"
        style={{
          x: bgX,
          y: bgY,
          background: 'radial-gradient(circle, rgba(84,168,50,0.12) 0%, transparent 70%)',
          width: 600,
          height: 600,
          position: 'absolute',
          top: '50%',
          left: '50%',
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          borderRadius: '50%',
        }}
      />

      {/* Creeper face with parallax */}
      <motion.div
        style={reduced ? {} : { x: faceX, y: faceY }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-10 relative z-10"
      >
        <CreeperFace size={220} />
      </motion.div>

      {/* Headline — staggered letters */}
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="font-pixel text-3xl sm:text-5xl lg:text-6xl text-creeper-green mb-4 relative z-10 tracking-wider"
        style={{ textShadow: '0 0 30px rgba(84,168,50,0.5)' }}
      >
        {headlineLetters.map((ch, i) => (
          <motion.span key={i} variants={letterVariants} style={{ display: 'inline-block' }}>
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
