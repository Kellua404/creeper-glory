import { motion } from 'framer-motion'
import Section from './Section'
import StatBar from './StatBar'
import { useReducedMotion } from '../hooks/useReducedMotion'

const STATS = [
  { label: 'Stealth',       value: 98, delay: 0 },
  { label: 'Blast Radius',  value: 90, delay: 0.1 },
  { label: 'Silence',       value: 100, delay: 0.2 },
  { label: 'Fear Induced',  value: 95, delay: 0.3 },
]

const ABILITY_CARDS = [
  { title: 'Camouflage',    desc: 'Blends with shadow and stone. Invisible until heard.',             icon: '🌑' },
  { title: 'Detonation',    desc: 'A controlled explosion — 4 seconds from hiss to crater.',         icon: '💣' },
  { title: 'Silent Walk',   desc: 'No footstep. No warning. Just presence.',                         icon: '🔇' },
  { title: 'Persistence',   desc: 'Once it locks on, it never stops. Ever.',                         icon: '🎯' },
  { title: 'Gunpowder Drop',desc: 'In death it gifts the player the means of their own destruction.', icon: '🧨' },
  { title: 'Charge Form',   desc: 'Struck by lightning? It becomes something worse.',                icon: '⚡' },
]

// Abilities grid slides in from the right; children stagger inside it
const abilitiesContainerVariants = {
  hidden:  { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
}
const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function Powers() {
  const reduced = useReducedMotion()

  return (
    <Section id="powers" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      <motion.h2
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        whileInView={reduced ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="font-pixel text-2xl sm:text-3xl text-creeper-green text-center mb-16"
      >
        Powers &amp; Stats
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Stat bars panel slides in from the left */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, x: -40 }}
          whileInView={reduced ? {} : { opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="bg-night-800 border border-creeper-dark/30 rounded-lg p-8"
        >
          <h3 className="font-pixel text-xs text-white/50 mb-6 uppercase tracking-widest">
            Threat Assessment
          </h3>
          {STATS.map((s) => (
            <StatBar key={s.label} {...s} />
          ))}
        </motion.div>

        {/* Ability cards grid slides in from the right, children stagger inside */}
        <motion.div
          variants={reduced ? {} : abilitiesContainerVariants}
          initial={reduced ? {} : 'hidden'}
          whileInView={reduced ? {} : 'visible'}
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {ABILITY_CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={reduced ? {} : cardVariants}
              whileHover={reduced ? {} : {
                y: -4,
                boxShadow: '0 0 24px rgba(84,168,50,0.25)',
              }}
              className="bg-night-800 border border-creeper-dark/30 rounded cursor-default overflow-hidden"
              style={{ borderTop: '2px solid rgba(59,122,34,0.55)' }}
            >
              {/* Slot header: icon + title on one row */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <span
                  className="flex items-center justify-center bg-night-900/70 rounded text-base leading-none shrink-0"
                  style={{ width: 32, height: 32 }}
                  role="img"
                  aria-hidden="true"
                >
                  {card.icon}
                </span>
                <h3 className="font-pixel text-[0.6rem] text-creeper-light leading-tight">{card.title}</h3>
              </div>

              {/* Separator */}
              <div className="mx-4 border-t border-creeper-dark/25" />

              {/* Description */}
              <p className="font-body text-white/50 text-xs leading-relaxed px-4 pt-3 pb-4">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
