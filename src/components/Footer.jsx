import { motion } from 'framer-motion'
import { Github, ArrowUp } from 'lucide-react'
import Section from './Section'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function Footer() {
  const reduced = useReducedMotion()

  return (
    <Section
      id="footer"
      className="py-16 px-4 sm:px-6 border-t border-creeper-dark/30"
    >
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 14 }}
        whileInView={reduced ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="text-center sm:text-left">
          <p className="font-pixel text-xs text-creeper-green mb-2">⛏ CREEPER GLORY</p>
          <p className="font-body text-white/50 text-xs">
            Built with React · Vite · Tailwind · Framer Motion — Portfolio Project #1
          </p>
        </div>

        <div className="flex items-center gap-4">
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -3, color: '#54a832' }}
            whileTap={{ scale: 0.95 }}
            className="text-white/50 transition-colors"
            aria-label="GitHub"
          >
            <Github size={20} />
          </motion.a>

          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ y: -3, boxShadow: '0 0 16px rgba(84,168,50,0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 font-pixel text-[10px] text-white/50 border border-creeper-dark/40 rounded px-3 py-2 hover:border-creeper-green/50 hover:text-creeper-light transition-colors"
          >
            <ArrowUp size={12} />
            Back to top
          </motion.button>
        </div>
      </motion.div>
    </Section>
  )
}
