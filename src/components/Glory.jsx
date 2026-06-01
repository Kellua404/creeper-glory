import { motion } from 'framer-motion'
import Section from './Section'
import CreeperFace from './CreeperFace'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function Glory() {
  const reduced = useReducedMotion()

  return (
    <Section
      id="glory"
      className="py-32 px-4 sm:px-6 flex flex-col items-center text-center"
    >
      {/* Background glow blooms in after the face arrives */}
      <motion.div
        aria-hidden="true"
        initial={reduced ? {} : { opacity: 0 }}
        whileInView={reduced ? {} : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,197,66,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Title descends from above while the face rises — they meet */}
      <motion.h2
        initial={reduced ? {} : { opacity: 0, y: -28 }}
        whileInView={reduced ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="font-pixel text-2xl sm:text-3xl mb-16 text-gold"
      >
        The Glory
      </motion.h2>

      {/* Crowned creeper face rises from below */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, scale: 0.72, y: 50 }}
        whileInView={reduced ? {} : { opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-16"
      >
        {/* Outer pulsing ring */}
        <motion.div
          aria-hidden="true"
          animate={reduced ? {} : {
            boxShadow: [
              '0 0 0 0px rgba(245,197,66,0.3)',
              '0 0 0 32px rgba(245,197,66,0)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut' }}
          style={{ borderRadius: '50%', position: 'absolute', inset: -20, pointerEvents: 'none' }}
        />
        <CreeperFace size={260} crowned />
      </motion.div>

      {/* Quote */}
      <motion.blockquote
        initial={reduced ? {} : { opacity: 0, y: 24 }}
        whileInView={reduced ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative max-w-lg"
      >
        <span className="font-pixel text-gold text-4xl leading-none select-none">"</span>
        <p
          className="font-pixel text-sm sm:text-base text-white/90 leading-relaxed my-2"
          style={{ textShadow: '0 0 20px rgba(245,197,66,0.3)' }}
        >
          Ssssss... and the world remembered the Keeper.
        </p>
        <span className="font-pixel text-gold text-4xl leading-none select-none">"</span>
      </motion.blockquote>

      {/* Gold divider */}
      <motion.div
        initial={reduced ? {} : { scaleX: 0, opacity: 0 }}
        whileInView={reduced ? {} : { scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-12 w-48 h-px origin-center"
        style={{ background: 'linear-gradient(90deg, transparent, #f5c542, transparent)' }}
      />
    </Section>
  )
}
