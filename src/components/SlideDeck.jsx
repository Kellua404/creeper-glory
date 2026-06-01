import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VoidCanvas from './VoidCanvas'
import CreeperModel from './CreeperModel'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { TitlePanel, LegendPanel, PowersPanel, GloryPanel, FinalPanel } from './SlidePanels'

/* ──────────────────────────────────────────────────────────
   The cinematic deck.

   One persistent voxel Creeper lives on its own layer and slides
   left / centre / right while content panels swap in beside it.
   The mob can be detonated at any slide by clicking it; the final
   slide also wires the forbidden button to the very same blast.
   ────────────────────────────────────────────────────────── */

const PANELS = [TitlePanel, LegendPanel, PowersPanel, GloryPanel, FinalPanel]
const N = PANELS.length

// Where the Creeper sits on each slide, and which side its content takes.
// pose values are fractions of viewport width / height.
const SLIDES = [
  { creeper: { fx: -0.21, fy: 0.24,  scale: 1.72 }, side: 'bottom' },
  { creeper: { fx: -0.28, fy: 0.0,   scale: 0.76 }, side: 'right'  },
  { creeper: { fx: 0.29,  fy: 0.0,   scale: 0.76 }, side: 'left'   },
  { creeper: { fx: -0.28, fy: 0.0,   scale: 0.80 }, side: 'right'  },
  { creeper: { fx: 0.27,  fy: 0.02,  scale: 0.90 }, side: 'left'   },
]

function useViewport() {
  const [v, setV] = useState({ vw: 1280, vh: 800 })
  useEffect(() => {
    const calc = () => setV({ vw: window.innerWidth, vh: window.innerHeight })
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return v
}

const sideJustify = {
  left:   'justify-start',
  right:  'justify-end',
  bottom: 'justify-center',
}
const sidePad = {
  left:   'pl-[6vw] sm:pl-[9vw] pr-4 items-center',
  right:  'pr-[6vw] sm:pr-[9vw] pl-4 items-center',
  bottom: 'items-end pb-[7vh] px-4',
}
function enterX(side) {
  if (side === 'left') return -48
  if (side === 'right') return 48
  return 0
}

export default function SlideDeck() {
  const reduced = useReducedMotion()
  const { vw, vh } = useViewport()
  const [active, setActive] = useState(0)
  const [armed, setArmed] = useState(false)
  const [flash, setFlash] = useState(false)
  const creeperRef = useRef(null)
  const lockRef = useRef(false)
  const touchRef = useRef(null)

  const stage = Math.max(340, Math.min(vw * 0.94, vh * 0.94, 820))
  const slide = SLIDES[active]
  const pose = {
    x: slide.creeper.fx * vw,
    y: slide.creeper.fy * vh,
    scale: slide.creeper.scale,
  }

  const go = useCallback((dir) => {
    setActive((a) => Math.min(N - 1, Math.max(0, a + dir)))
  }, [])
  const goto = useCallback((i) => setActive(Math.min(N - 1, Math.max(0, i))), [])

  // Lock briefly between slides so one gesture = one slide.
  const navLocked = useCallback(() => {
    if (lockRef.current) return true
    lockRef.current = true
    setTimeout(() => { lockRef.current = false }, 820)
    return false
  }, [])

  // Wheel / trackpad
  useEffect(() => {
    const el = document.getElementById('deck-root')
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < 14 && Math.abs(e.deltaX) < 14) return
      if (navLocked()) return
      const d = (e.deltaY + e.deltaX) > 0 ? 1 : -1
      go(d)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [go, navLocked])

  // Keyboard + touch
  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); if (!navLocked()) go(1) }
      else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); if (!navLocked()) go(-1) }
      else if (e.key === 'Home') goto(0)
      else if (e.key === 'End') goto(N - 1)
    }
    const onTouchStart = (e) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const onTouchEnd = (e) => {
      if (!touchRef.current) return
      const dx = e.changedTouches[0].clientX - touchRef.current.x
      const dy = e.changedTouches[0].clientY - touchRef.current.y
      const m = Math.abs(dx) > Math.abs(dy) ? dx : dy
      if (Math.abs(m) > 46 && !navLocked()) go(m < 0 ? 1 : -1)
      touchRef.current = null
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [go, goto, navLocked])

  // The blast — fired by the Creeper itself or the forbidden button.
  const onBlast = useCallback(() => {
    setFlash(true)
    setTimeout(() => setFlash(false), 260)
  }, [])

  const detonate = useCallback(() => {
    if (armed) return
    if (reduced) { onBlast(); return }
    setArmed(true)
    creeperRef.current && creeperRef.current.explode()
    // charge (~1.15s) + flight (~1.5s) before it's whole again
    setTimeout(() => setArmed(false), 3000)
  }, [armed, reduced, onBlast])

  const Panel = PANELS[active]
  const side = slide.side

  return (
    <div
      id="deck-root"
      className="fixed inset-0 overflow-hidden bg-night-900"
      style={{ touchAction: 'none' }}
    >
      <VoidCanvas progress={N > 1 ? active / (N - 1) : 0} still />

      {/* Deep, even veil on every slide — keeps the world dim and calm so the
          text always reads (the opening slide's darkness is the reference). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{ background: 'rgba(3,8,3,0.62)' }}
      />
      {/* Cinematic vignette — darker toward the edges where the content sits */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 78% 70% at 50% 46%, transparent 14%, rgba(2,7,2,0.86) 100%)' }}
      />
      {/* A touch more depth on the opening title card */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: active === 0 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 44%, rgba(2,7,2,0.35) 0%, rgba(2,6,2,0.6) 100%)' }}
      />

      {/* Giant wordmark behind the head — only on the opening slide.
          Kept mounted but faded fully to 0 (invisible) on every other slide. */}
      <motion.div
        aria-hidden={active !== 0}
        initial={false}
        animate={{ opacity: active === 0 ? 1 : 0, scale: active === 0 ? 1 : 1.05 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-[5vw] top-[44%] z-[6] -translate-y-1/2 text-right pointer-events-none select-none"
        style={{ visibility: active === 0 ? 'visible' : 'hidden', transitionProperty: 'visibility', transitionDelay: active === 0 ? '0s' : '0.7s' }}
      >
        <p
          className="font-pixel text-creeper-light/55 mb-4 sm:mb-6"
          style={{ fontSize: 'clamp(0.5rem, 1.3vw, 0.8rem)', letterSpacing: '0.3em' }}
        >
          KEEPER OF THE MINECRAFT
        </p>
        <h1
          className="font-pixel block leading-[1.02]"
          style={{
            fontSize: 'clamp(2rem, 8.5vw, 6.5rem)',
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(126,217,87,0.66)',
            textShadow: '0 0 50px rgba(84,168,50,0.5)',
          }}
        >
          THE<br />CREEPER
        </h1>
      </motion.div>

      {/* The persistent Creeper layer */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-20"
        style={{ width: stage, height: stage, marginLeft: -stage / 2, marginTop: -stage / 2 }}
        initial={false}
        animate={pose}
        transition={{ duration: reduced ? 0 : 1.0, ease: [0.16, 1, 0.3, 1] }}
      >
        <CreeperModel ref={creeperRef} size={stage} onExplode={onBlast} menacing={active === N - 1} />
      </motion.div>

      {/* Content panel — opposite side, swaps per slide. Keyed on `active`
          so React remounts it every slide (each panel plays its own entrance);
          a plain remount avoids AnimatePresence getting stuck on jump-nav. */}
      <div className={`absolute inset-0 z-30 flex ${sideJustify[side]} ${sidePad[side]} pointer-events-none`}>
        <motion.div
          key={active}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: enterX(side), y: side === 'bottom' ? 24 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="[&_a]:pointer-events-auto [&_button]:pointer-events-auto"
        >
          {active === N - 1
            ? <FinalPanel reduced={reduced} onDetonate={detonate} armed={armed} />
            : <Panel reduced={reduced} />}
        </motion.div>
      </div>

      {/* Progress dots */}
      <nav
        aria-label="Slides"
        className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goto(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            className="group grid place-items-center w-6 h-6"
          >
            <span
              className="block transition-all duration-300"
              style={{
                width: i === active ? 12 : 7,
                height: i === active ? 12 : 7,
                background: i === active ? '#54a832' : 'rgba(255,255,255,0.28)',
                boxShadow: i === active ? '0 0 12px rgba(84,168,50,0.8)' : 'none',
                imageRendering: 'pixelated',
              }}
            />
          </button>
        ))}
      </nav>

      {/* Prev / Next */}
      <div className="absolute left-1/2 bottom-6 -translate-x-1/2 z-40 flex items-center gap-5">
        <button
          onClick={() => go(-1)}
          disabled={active === 0}
          aria-label="Previous slide"
          className="font-pixel text-creeper-light/70 text-xs px-3 py-2 rounded hover:text-creeper-light disabled:opacity-25 transition-colors"
        >◂</button>
        <span className="font-pixel text-[10px] text-white/40 tabular-nums select-none">
          {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
        </span>
        <button
          onClick={() => go(1)}
          disabled={active === N - 1}
          aria-label="Next slide"
          className="font-pixel text-creeper-light/70 text-xs px-3 py-2 rounded hover:text-creeper-light disabled:opacity-25 transition-colors"
        >▸</button>
      </div>

      {/* Brand mark */}
      <span className="absolute left-5 sm:left-8 top-6 z-40 font-pixel text-creeper-green/80 text-[10px] sm:text-xs tracking-wider select-none">
        ⛏ CREEPER GLORY
      </span>

      {/* Detonation flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34 }}
            aria-hidden="true"
            className="fixed inset-0 bg-white z-[9999] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
