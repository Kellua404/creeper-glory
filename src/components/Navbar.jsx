import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const LINKS = [
  { label: 'Home',    href: '#hero' },
  { label: 'Legend',  href: '#legend' },
  { label: 'Powers',  href: '#powers' },
  { label: 'Glory',   href: '#glory' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-night-900/80 backdrop-blur-md border-b border-creeper-dark/30'
          : 'bg-transparent'
      }`}
    >
      <nav aria-label="Site navigation" className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a
          href="#hero"
          className="inline-flex items-center gap-2 min-h-[44px] font-pixel text-creeper-green text-xs sm:text-sm tracking-wider hover:text-creeper-light transition-colors shrink-0"
        >
          <span aria-hidden="true">⛏</span>
          <span className="hidden sm:inline">CREEPER GLORY</span>
          <span className="sr-only">Creeper Glory home</span>
        </a>

        <ul className="flex items-center gap-4 sm:gap-8">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setActive(link.href.slice(1))}
                className="inline-flex items-center min-h-[44px] px-1 sm:px-2 font-pixel text-[10px] sm:text-xs text-white/70 hover:text-creeper-light transition-colors group"
              >
                <span className="relative">
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-creeper-green group-hover:w-full transition-all duration-300" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </motion.header>
  )
}
