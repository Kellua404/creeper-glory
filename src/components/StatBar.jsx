import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function StatBar({ label, value, delay = 0 }) {
  const reduced = useReducedMotion()

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="font-pixel text-xs text-white/80">{label}</span>
        <span className="font-pixel text-xs text-creeper-green">{value}%</span>
      </div>
      <div className="h-3 bg-night-700 rounded-sm overflow-hidden border border-creeper-dark/30">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={reduced ? { duration: 0 } : { duration: 1.2, delay, ease: 'easeOut' }}
          className="h-full bg-creeper-green rounded-sm"
          style={{ width: `${value}%`, originX: 0, boxShadow: '0 0 8px rgba(84,168,50,0.5)' }}
        />
      </div>
    </div>
  )
}
