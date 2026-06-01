import { motion } from 'framer-motion'
import Section from './Section'
import { useReducedMotion } from '../hooks/useReducedMotion'

const LORE_CARDS = [
  {
    title: 'Born of Glitch',
    body: 'In the early days of Minecraft, the Creeper emerged not from design but from error — a pig model flipped wrong, a creature of accident that became legend. Its very existence is a monument to chaos.',
    icon: '🔮',
  },
  {
    title: 'Silent Guardian',
    body: 'It does not growl. It does not roar. The Creeper walks unseen through shadow and stone, a sentinel of the night that needs no words to command fear.',
    icon: '👁',
  },
  {
    title: 'Keeper of Worlds',
    body: 'Every world bears its mark. Every survivor carries the memory of that hiss — the soft, terrible sound that means the Keeper has found you.',
    icon: '🌍',
  },
  {
    title: 'Glory in Destruction',
    body: 'Where others see ending, the Creeper sees creation. Each explosion reshapes the land, writes new history, and reminds the living that impermanence is the only truth.',
    icon: '💥',
  },
]

// Heading: each character flicks up individually
const letterContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.055 } },
}
const letterVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

// Cards: alternating left/right pincer convergence
const cardContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const cardVariants = {
  hidden: (i) => ({ opacity: 0, x: i % 2 === 0 ? -36 : 36 }),
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const legendTitle = 'The Legend'.split('')

export default function Legend() {
  const reduced = useReducedMotion()

  return (
    <Section id="legend" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      <motion.h2
        variants={reduced ? {} : letterContainerVariants}
        initial={reduced ? {} : 'hidden'}
        whileInView={reduced ? {} : 'visible'}
        viewport={{ once: true, margin: '-80px' }}
        className="font-pixel text-2xl sm:text-3xl text-creeper-green text-center mb-4"
      >
        {legendTitle.map((ch, i) => (
          <motion.span
            key={i}
            variants={reduced ? {} : letterVariants}
            style={{ display: 'inline-block' }}
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </motion.h2>

      <motion.p
        initial={reduced ? {} : { opacity: 0 }}
        whileInView={reduced ? {} : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="font-body text-white/50 text-center text-sm mb-16 max-w-xl mx-auto"
      >
        Born of glitch, keeper of worlds — the Creeper's story is written in craters.
      </motion.p>

      <motion.div
        variants={reduced ? {} : cardContainerVariants}
        initial={reduced ? {} : 'hidden'}
        whileInView={reduced ? {} : 'visible'}
        viewport={{ once: true, margin: '-80px' }}
        className="flex flex-col"
      >
        {LORE_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            variants={reduced ? {} : cardVariants}
            className="flex items-start gap-8 sm:gap-12 py-10 border-b border-white/[0.06] last:border-0"
          >
            {/* Ordinal anchor — muted, structural, not decorative */}
            <div
              className="font-pixel text-creeper-dark/60 shrink-0 leading-none pt-0.5 select-none"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg leading-none" role="img" aria-hidden="true">{card.icon}</span>
                <h3 className="font-pixel text-xs sm:text-sm text-creeper-light">{card.title}</h3>
              </div>
              <p className="font-body text-white/60 text-sm leading-relaxed max-w-2xl">{card.body}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}
