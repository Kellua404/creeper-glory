import { motion } from 'framer-motion'
import StatBar from './StatBar'

/* Content panels that sit beside the persistent Creeper on each slide.
   Each panel mounts fresh when its slide becomes active, so it can run
   its own entrance animation. The Creeper itself lives in a separate
   layer (SlideDeck) and slides to the opposite side. */

const ease = [0.22, 1, 0.36, 1]

function rise(delay = 0, reduced) {
  return reduced
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease },
      }
}

function Eyebrow({ children, color = 'text-creeper-light/70' }) {
  return (
    <span className={`font-pixel text-[10px] tracking-[0.3em] ${color} block mb-4`}>
      {children}
    </span>
  )
}

/* ── Slide 0 · Title ─────────────────────────────────────── */
export function TitlePanel({ reduced }) {
  return (
    <div className="text-center max-w-md mx-auto">
      <motion.p
        {...rise(0.5, reduced)}
        className="font-pixel text-[10px] text-creeper-light/60 select-none"
        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
      >
        {reduced ? 'Use the dots to explore' : 'tap the Creeper, if you dare · scroll to descend'}
      </motion.p>
    </div>
  )
}

/* ── Slide 1 · Legend ────────────────────────────────────── */
const LORE = [
  { k: '01', t: 'Born of Glitch', b: 'Not designed but discovered — a pig model flipped wrong became legend. Its existence is a monument to chaos.' },
  { k: '02', t: 'Silent Guardian', b: 'No growl. No roar. It walks unseen through shadow and stone, commanding fear without a word.' },
  { k: '03', t: 'Glory in Destruction', b: 'Where others see ending, the Creeper sees creation. Every crater rewrites the world.' },
]
export function LegendPanel({ reduced }) {
  return (
    <div className="max-w-md">
      <motion.div {...rise(0, reduced)}>
        <Eyebrow>THE&nbsp;ARCHIVE</Eyebrow>
        <h2 className="font-pixel text-2xl sm:text-3xl text-creeper-green mb-8">The Legend</h2>
      </motion.div>
      <div className="flex flex-col gap-6">
        {LORE.map((l, i) => (
          <motion.div key={l.k} {...rise(0.15 + i * 0.12, reduced)} className="flex gap-4">
            <span className="font-pixel text-creeper-dark/70 text-lg leading-none pt-1 select-none">{l.k}</span>
            <div>
              <h3 className="font-pixel text-xs text-creeper-light mb-2">{l.t}</h3>
              <p className="font-body text-white/55 text-sm leading-relaxed">{l.b}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ── Slide 2 · Powers ────────────────────────────────────── */
const STATS = [
  { label: 'Stealth',      value: 98,  delay: 0 },
  { label: 'Blast Radius', value: 90,  delay: 0.08 },
  { label: 'Silence',      value: 100, delay: 0.16 },
  { label: 'Fear Induced', value: 95,  delay: 0.24 },
]
const TRAITS = ['Camouflage', 'Silent Walk', 'Gunpowder Drop', 'Charge Form']
export function PowersPanel({ reduced }) {
  return (
    <div className="max-w-md w-full">
      <motion.div {...rise(0, reduced)}>
        <Eyebrow>THREAT&nbsp;ASSESSMENT</Eyebrow>
        <h2 className="font-pixel text-2xl sm:text-3xl text-creeper-green mb-8">Powers &amp; Stats</h2>
      </motion.div>
      <motion.div
        {...rise(0.15, reduced)}
        className="bg-night-800/70 backdrop-blur-sm border border-creeper-dark/30 rounded-lg p-6 mb-5"
      >
        {STATS.map((s) => <StatBar key={s.label} {...s} />)}
      </motion.div>
      <motion.div {...rise(0.35, reduced)} className="flex flex-wrap gap-2">
        {TRAITS.map((t) => (
          <span
            key={t}
            className="font-pixel text-[9px] text-creeper-light/80 px-3 py-2 rounded bg-night-800/70 border border-creeper-dark/30"
          >
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* ── Slide 3 · Glory ─────────────────────────────────────── */
export function GloryPanel({ reduced }) {
  return (
    <div className="max-w-md">
      <motion.div {...rise(0, reduced)}>
        <Eyebrow color="text-gold/70">THE&nbsp;CROWN</Eyebrow>
        <h2 className="font-pixel text-2xl sm:text-3xl text-gold mb-8" style={{ textShadow: '0 0 24px rgba(245,197,66,0.35)' }}>
          The Glory
        </h2>
      </motion.div>
      <motion.blockquote {...rise(0.18, reduced)} className="relative mb-7">
        <span className="font-pixel text-gold text-3xl leading-none select-none">&ldquo;</span>
        <p
          className="font-pixel text-sm sm:text-base text-white/90 leading-relaxed my-2"
          style={{ textShadow: '0 0 18px rgba(245,197,66,0.3)' }}
        >
          Ssssss... and the world remembered the Keeper.
        </p>
        <span className="font-pixel text-gold text-3xl leading-none select-none">&rdquo;</span>
      </motion.blockquote>
      <motion.p {...rise(0.32, reduced)} className="font-body text-white/55 text-sm leading-relaxed">
        Every world bears its mark. Every survivor carries the memory of that hiss — the soft,
        terrible sound that means the Keeper has found you.
      </motion.p>
      <motion.div
        {...rise(0.45, reduced)}
        className="mt-9 w-40 h-px"
        style={{ background: 'linear-gradient(90deg, #f5c542, transparent)' }}
      />
    </div>
  )
}

/* ── Slide 4 · Final / Danger ────────────────────────────── */
export function FinalPanel({ reduced, onDetonate, armed }) {
  return (
    <div className="max-w-md">
      <motion.div {...rise(0, reduced)}>
        <Eyebrow color="text-tnt/80">PROCEED&nbsp;WITH&nbsp;CAUTION</Eyebrow>
        <h2 className="font-pixel text-xl sm:text-2xl text-tnt mb-5">⚠ Danger Zone ⚠</h2>
      </motion.div>
      <motion.p {...rise(0.15, reduced)} className="font-body text-white/55 text-sm leading-relaxed mb-8">
        Under no circumstances should you press this button. The Keeper is watching, and it
        leans toward the slightest provocation.
      </motion.p>
      <motion.button
        {...rise(0.3, reduced)}
        onClick={onDetonate}
        disabled={armed}
        whileHover={reduced ? {} : { y: -4, scale: 1.04, boxShadow: '0 0 32px rgba(216,60,44,0.7)' }}
        whileTap={reduced ? {} : { scale: 0.95 }}
        className="font-pixel text-sm px-9 py-5 bg-tnt text-white rounded cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ boxShadow: '0 0 16px rgba(216,60,44,0.4)', imageRendering: 'pixelated' }}
      >
        {armed ? 'SSSSSS...' : '[ DO NOT PRESS ]'}
      </motion.button>
      <motion.p {...rise(0.5, reduced)} className="font-pixel text-[10px] text-white/25 mt-7">
        you were warned
      </motion.p>
    </div>
  )
}
