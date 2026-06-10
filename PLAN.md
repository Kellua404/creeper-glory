# Creeper Glory — Build Plan

> An animated, single-page landing site celebrating the Minecraft Creeper.
> Themed: *"The Glory of the Creeper — Keeper of the Minecraft."*
> This document is the complete handoff spec. Sonnet should be able to build the
> entire site from this file alone.

---

## 1. Goal

A **magnificent, highly interactive animated landing page** that proves frontend +
AI-assisted development skill. Must be:

- Visually striking (Minecraft voxel/pixel aesthetic, Creeper-green palette)
- Smooth 60fps animations (motion on scroll, hover, entrance)
- Fast to load, fully responsive (mobile → desktop)
- Deployable **for free** on **Vercel** or **GitHub Pages**

This is project #1 in a portfolio series. Keep code clean and reusable.

---

## 2. Tech Stack (decided)

| Layer | Choice | Reason |
|-------|--------|--------|
| Build tool | **Vite** | Instant dev server, fast builds, tiny output |
| Framework | **React 18** (JS, not TS — keep it simple for v1) | Component model, huge ecosystem |
| Styling | **Tailwind CSS** | Utility-first, no CSS bloat, fast iteration |
| Animation | **Framer Motion** | Declarative, production-grade motion |
| Icons | **lucide-react** | Clean, lightweight |
| Fonts | **"Press Start 2P"** (pixel) for headings + **Inter** for body | Pixel font = instant Minecraft vibe |
| Optional 3D | **@react-three/fiber + drei** *(stretch goal — see §8)* | Real 3D voxel Creeper head |

> Decision: ship the 2D/CSS-voxel version first (§5). Only add Three.js (§8) if
> time allows — it is a stretch goal, not a blocker.

---

## 3. Color Palette & Design Tokens

Add these to `tailwind.config.js` under `theme.extend.colors`:

```js
creeper: {
  50:  '#eaffea',
  green: '#54a832',   // primary creeper body
  dark:  '#3b7a22',   // shading
  light: '#7ed957',   // highlight
  face:  '#1a3d12',   // the black face pixels (very dark green)
},
night: {
  900: '#0b160a',     // page background (deep dark green-black)
  800: '#12230f',
  700: '#1b3416',
},
tnt:   '#d83c2c',     // accent / explosion red
gold:  '#f5c542',     // "glory" accent (crown, highlights)
```

- **Background:** dark (`night.900`) with subtle pixel-grid texture.
- **Primary:** creeper green gradients.
- **Accent:** gold for "glory/keeper" wording, TNT red for the explosion easter egg.

---

## 4. Page Structure (sections, top → bottom)

All sections live on **one page**, separated by scroll. Sticky nav at top.

1. **Navbar** — pixel logo "⛏ CREEPER GLORY", anchor links (Home, Legend, Powers, Glory), all with smooth scroll.
2. **Hero** — full viewport. Giant animated Creeper face, glowing eyes, floating particles, headline + subtitle, two CTA buttons. Parallax on mouse move.
3. **The Legend** (about) — scroll-reveal text blocks telling the Creeper lore ("Keeper of the Minecraft"). Pixel-card layout.
4. **Powers / Stats** — animated stat bars (Stealth, Blast Radius, Silence, Fear) that fill when scrolled into view. Grid of ability cards with hover lift.
5. **The Glory** — centerpiece. The Creeper crowned in gold. Big animated quote. Gold shimmer effect.
6. **Explosion Easter Egg** — a "Do NOT press" TNT button. On click → screen-shake + particle burst + flash, then reassembles. Pure fun, shows interaction skill.
7. **Footer** — credits, "Built with React + Vite + Framer Motion", social links, back-to-top.

---

## 5. Component Breakdown (build order)

Create under `src/components/`. Build in this order:

| # | Component | Key animations |
|---|-----------|----------------|
| 1 | `PixelGrid.jsx` | Animated background grid / drifting pixels (CSS + canvas optional) |
| 2 | `CreeperFace.jsx` | The signature Creeper face built from divs (CSS grid of pixels). Idle breathing scale + glowing eyes. Reusable in Hero + Glory. |
| 3 | `Navbar.jsx` | Fade-in on load, blur backdrop on scroll, animated underline links |
| 4 | `Hero.jsx` | Parallax (mouse), particle field, staggered text entrance, button hover/tap |
| 5 | `Section.jsx` | Wrapper that does `whileInView` scroll-reveal (fade + slide up). Reuse everywhere. |
| 6 | `Legend.jsx` | Staggered card reveals, typewriter headline |
| 7 | `StatBar.jsx` + `Powers.jsx` | Bars animate width 0→value `whileInView`; cards hover-lift + glow |
| 8 | `Glory.jsx` | Crowned creeper, gold shimmer (animated gradient), pulsing glow |
| 9 | `ExplosionButton.jsx` | Click → `useAnimate` shake, particle burst, white flash overlay, reset |
| 10 | `Footer.jsx` | Simple reveal, back-to-top smooth scroll |

---

## 6. Animation Spec (the important part)

Use **Framer Motion** throughout. Concrete patterns Sonnet should apply:

- **Entrance / scroll reveal:** wrap sections in `motion.div` with
  `initial={{opacity:0, y:40}}` `whileInView={{opacity:1, y:0}}`
  `viewport={{once:true, margin:"-100px"}}` `transition={{duration:0.6, ease:"easeOut"}}`.
- **Stagger:** parent `variants` with `staggerChildren: 0.12` for card grids & headline letters.
- **Hero parallax:** track mouse with `useMotionValue` + `useTransform`; move creeper layers at different depths. Use `useSpring` for smoothness.
- **Creeper idle:** `animate={{ scale:[1,1.02,1] }}` `transition={{repeat:Infinity, duration:4}}`. Eyes glow via animated `boxShadow`.
- **Floating particles:** array of dots, each `animate={{ y:[...], opacity:[...] }}` with randomized duration/delay.
- **Stat bars:** `whileInView` animate `width` from `0%` to target %.
- **Hover:** `whileHover={{ y:-6, scale:1.03 }}` + glow; `whileTap={{ scale:0.97 }}` on buttons.
- **Explosion:** sequence with `useAnimate` — shake container (x keyframes), spawn ~40 particle divs flying outward, full-screen white flash (opacity 1→0), then restore.
- **Gold shimmer (Glory):** animated background-position on a gold gradient text.
- **Respect `prefers-reduced-motion`** — gate big motion behind a check.

Target **60fps**: animate only `transform` and `opacity` where possible. Avoid layout-thrashing properties.

---

## 7. File / Folder Structure

```
creeper-glory/
├── PLAN.md                 ← this file
├── index.html
├── package.json
├── vite.config.js          ← set `base` for GitHub Pages (see §9)
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon (pixel creeper)
└── src/
    ├── main.jsx
    ├── App.jsx             ← assembles all sections
    ├── index.css          ← Tailwind directives + base styles + fonts
    ├── hooks/
    │   └── useReducedMotion.js
    └── components/
        ├── PixelGrid.jsx
        ├── CreeperFace.jsx
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── Section.jsx
        ├── Legend.jsx
        ├── StatBar.jsx
        ├── Powers.jsx
        ├── Glory.jsx
        ├── ExplosionButton.jsx
        └── Footer.jsx
```

---

## 8. Stretch Goal — Real 3D Creeper (optional)

If core site is done and polished:

- Add `@react-three/fiber`, `@react-three/drei`.
- Build a low-poly **voxel Creeper head** from boxes (or load a `.glb`).
- Slow auto-rotate + rotate-toward-cursor.
- Glowing emissive face. Place in Hero or Glory.

Keep it lazy-loaded (`React.lazy` + `Suspense`) so it never blocks first paint.

---

## 9. Deployment (free)

### Option A — Vercel (recommended, easiest)
- Push repo to GitHub → import in Vercel → it auto-detects Vite → deploy. Zero config.
- `base` in `vite.config.js` stays `/`.

### Option B — GitHub Pages
- In `vite.config.js` set `base: '/creeper-glory/'` (repo name).
- Add `gh-pages` dev dep + scripts:
  ```json
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
  ```
- `npm run deploy` → enable Pages on `gh-pages` branch.

> Build the site so it works at both `/` and a sub-path (use relative asset paths).

---

## 10. Setup Commands (Sonnet runs these first)

```bash
cd "creeper-glory"
npm create vite@latest . -- --template react      # if folder empty; else scaffold manually
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion lucide-react
# stretch only:
# npm install three @react-three/fiber @react-three/drei
npm run dev
```

Then:
1. Configure `tailwind.config.js` `content` globs + the color tokens (§3).
2. Add Tailwind directives + Google Fonts (Press Start 2P, Inter) to `index.css`.
3. Build components in the order of §5.
4. Assemble in `App.jsx`.
5. Test responsive + `npm run build` + preview before deploy.

---

## 11. Definition of Done

- [ ] All 7 sections present and styled (§4)
- [ ] Smooth scroll-reveal on every section
- [ ] Hero parallax + particles working
- [ ] Animated Creeper face (idle + glowing eyes)
- [ ] Stat bars animate on scroll
- [ ] Explosion easter-egg button works
- [ ] Fully responsive (test 375px, 768px, 1440px)
- [ ] `prefers-reduced-motion` respected
- [ ] Lighthouse: Performance ≥ 90
- [ ] `npm run build` succeeds, preview looks correct
- [ ] README with run + deploy instructions

---

## 12. Copy / Content (ready-to-use text)

**Hero headline:** "THE CREEPER"
**Hero subtitle:** "Keeper of the Minecraft. Glory in the shadows. Silence before the storm."
**CTA buttons:** "Witness the Glory" / "Do Not Approach"

**Legend section:** Short lore — the Creeper as the silent guardian, born of glitch and
legend, the keeper who walks unseen and ends worlds with a whisper.

**Powers (stat names + values):**
- Stealth — 98%
- Blast Radius — 90%
- Silence — 100%
- Fear Induced — 95%

**Glory quote:** "Ssssss... and the world remembered the Keeper."

**Footer:** "Built with React · Vite · Tailwind · Framer Motion — Portfolio Project #1"

---


