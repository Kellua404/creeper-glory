import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

const VERT = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_scroll;

out vec4 o_color;

/* ──────────────────────────────────────────
   Utilities
   ────────────────────────────────────────── */
float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float h2(vec2 p)  { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float n1(float x) {
  float i = floor(x); float f = fract(x);
  return mix(h1(i), h1(i + 1.0), f * f * (3.0 - 2.0 * f));
}
float n2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(h2(i), h2(i + vec2(1.0, 0.0)), u.x),
    mix(h2(i + vec2(0.0, 1.0)), h2(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

/* ──────────────────────────────────────────
   World constants
   ────────────────────────────────────────── */
const float BS = 16.0;      // block size in pixels

const int AIR         = 0;
const int GRASS       = 1;
const int DIRT        = 2;
const int STONE       = 3;
const int COAL_ORE    = 4;
const int IRON_ORE    = 5;
const int GOLD_ORE    = 6;
const int DIAMOND_ORE = 7;
const int TNT         = 8;
const int REDSTONE    = 9;
const int NETHERRACK  = 10;
const int LAVA        = 11;
const int GLOWSTONE   = 12;
const int BEDROCK     = 13;

/* ──────────────────────────────────────────
   Terrain helpers
   ────────────────────────────────────────── */

// Returns the world-Y block index where the grass surface starts
float surfaceAt(float wx) {
  return 2.0 + floor(n1(wx * 0.14) * 3.0 + n1(wx * 0.33) * 2.5);
}

// True when (wx, wy) is a hollow cave pocket
bool caveAt(vec2 wp) {
  if (wp.y < 13.0) return false;
  float a = n2(wp * 0.09);
  float b = n2(wp * 0.17 + vec2(4.1, 2.7));
  return a * b < 0.08;
}

/* ──────────────────────────────────────────
   Block-type resolver
   ────────────────────────────────────────── */
int blockAt(vec2 wp) {
  float sH = surfaceAt(wp.x);

  if (wp.y < sH)         return AIR;
  if (wp.y < sH + 1.0)   return GRASS;
  if (wp.y < sH + 4.0)   return DIRT;

  if (caveAt(wp)) return AIR;

  // Stone + ore layers  (y 0–145)
  if (wp.y < 145.0) {
    float r = h2(wp + vec2(0.5));
    if (wp.y > 24.0 && r < 0.038) return COAL_ORE;
    if (wp.y > 40.0 && r < 0.022) return IRON_ORE;
    if (wp.y > 68.0 && r < 0.012) return GOLD_ORE;
    if (wp.y > 98.0 && r < 0.007) return DIAMOND_ORE;
    return STONE;
  }

  // TNT chamber zone  (y 145–195)
  if (wp.y < 195.0) {
    float r = h2(wp + vec2(0.5));
    bool tntCell = mod(wp.y - 145.0, 9.0) < 3.5 && mod(wp.x, 7.0) < 3.5;
    if (tntCell) return TNT;
    if (r < 0.07) return REDSTONE;
    return STONE;
  }

  // Bedrock transition  (y 200–220)
  if (wp.y < 220.0) return BEDROCK;

  // Nether zone  (y >= 220)
  float nc1 = n2(wp * 0.10 + vec2(0.0, -22.0));
  float nc2 = n2(wp * 0.19 + vec2(5.3, -25.0));
  bool netherAir = nc1 * nc2 < 0.09;
  if (netherAir) {
    float ld = mod(wp.y - 232.0, 36.0);
    if (ld < 5.5) return LAVA;
    return AIR;
  }
  if (h2(floor(wp * 0.22) * 4.55 + vec2(88.3, 0.0)) < 0.09) return GLOWSTONE;
  return NETHERRACK;
}

/* ──────────────────────────────────────────
   Block renderer
   ────────────────────────────────────────── */
vec3 renderBlock(int bt, vec2 buv, vec2 bp, float t) {
  float bx = buv.x, by = buv.y;

  // Subtle edge shading — simulates cube depth
  float edgeW = 0.065;
  float ed = (bx < edgeW || bx > 1.0 - edgeW ||
              by < edgeW || by > 1.0 - edgeW) ? 0.70 : 1.0;

  float tv = n2(buv * 2.6 + bp * 0.35);
  float rv = h2(bp + vec2(0.5));

  if (bt == GRASS) {
    if (by < 0.25) {
      // Green top with slight wind animation
      float w = 0.03 * sin(t * 1.6 + bp.x * 0.9);
      return vec3(0.22 + w, 0.65, 0.13) * ed;
    }
    return mix(vec3(0.34, 0.21, 0.09), vec3(0.44, 0.29, 0.16), rv) * ed;
  }

  if (bt == DIRT) {
    return mix(vec3(0.33, 0.20, 0.08), vec3(0.43, 0.28, 0.15), tv) * ed;
  }

  if (bt == STONE) {
    float s = 0.37 + 0.17 * tv;
    vec3 c = vec3(s, s * 0.98, s * 0.95) * ed;
    // Crack lines
    if ((abs(bx - 0.32) < 0.025 && by > 0.28) ||
        (abs(by - 0.56) < 0.025 && bx < 0.72)) c *= 0.62;
    return c;
  }

  if (bt == COAL_ORE) {
    float s = 0.37 + 0.17 * tv;
    vec3 c = vec3(s) * ed;
    float ov = n2(buv * 4.5 + bp);
    if (ov < 0.28) c = vec3(0.055, 0.055, 0.055) * ed;
    return c;
  }

  if (bt == IRON_ORE) {
    float s = 0.37 + 0.17 * tv;
    vec3 c = vec3(s) * ed;
    float ov = n2(buv * 3.8 + bp);
    if (ov < 0.24) c = vec3(0.72, 0.56, 0.44) * ed;
    return c;
  }

  if (bt == GOLD_ORE) {
    float s = 0.37 + 0.17 * tv;
    vec3 c = vec3(s) * ed;
    float ov = n2(buv * 3.8 + bp);
    if (ov < 0.24) c = vec3(0.96, 0.78, 0.26) * ed;
    return c;
  }

  if (bt == DIAMOND_ORE) {
    float s = 0.37 + 0.17 * tv;
    vec3 c = vec3(s) * ed;
    float ov = n2(buv * 3.8 + bp);
    if (ov < 0.22) {
      // Diamond has a faint inner glow
      float glint = 0.8 + 0.2 * sin(t * 1.8 + bp.x + bp.y);
      c = vec3(0.34, 0.84, 0.94) * glint * ed;
    }
    return c;
  }

  if (bt == TNT) {
    float stripe = step(0.5, mod(bx * 4.0, 1.0));
    vec3 c;
    if (by < 0.18 || by > 0.82) {
      c = mix(vec3(0.84, 0.84, 0.84), vec3(0.96, 0.96, 0.96), stripe);
    } else {
      c = mix(vec3(0.847, 0.235, 0.173), vec3(0.96, 0.30, 0.20), stripe);
    }
    // Danger pulse
    float pulse = 0.5 + 0.5 * sin(t * 3.8 + bp.x * 1.5);
    c += vec3(0.22, 0.0, 0.0) * pulse;
    return c * ed;
  }

  if (bt == REDSTONE) {
    float s = 0.34 + 0.14 * tv;
    vec3 c = vec3(s) * ed;
    float rv2 = n2(buv * 5.2 + bp * 0.6);
    if (rv2 < 0.20) {
      float fl = 0.55 + 0.45 * sin(t * 5.5 + bp.x + bp.y * 0.7);
      c = vec3(0.82, 0.08, 0.04) * fl * ed;
    }
    return c;
  }

  if (bt == NETHERRACK) {
    float s = 0.22 + 0.14 * tv;
    return vec3(s * 0.68, s * 0.13, s * 0.10) * ed;
  }

  if (bt == LAVA) {
    // Animated lava — flowing noise
    float anim = 0.5 + 0.5 * sin(t * 0.8 + bp.x * 0.45 + bp.y * 0.18);
    float flow = n2(vec2(bp.x * 0.33, bp.y * 0.33 - t * 0.14));
    vec3 c = mix(vec3(0.92, 0.28, 0.0), vec3(1.0, 0.72, 0.0), anim * flow);
    c = mix(c, vec3(1.0, 0.94, 0.5), pow(flow, 3.0) * 0.38);
    return c;
  }

  if (bt == GLOWSTONE) {
    float gv = 0.62 + 0.38 * n2(buv * 2.8 + bp * 0.28);
    vec3 c = vec3(0.96, 0.77, 0.26) * gv;
    // Tile crack pattern
    if (abs(bx - 0.5) < 0.045 || abs(by - 0.5) < 0.045) c *= 0.52;
    // Gentle pulse
    c *= 0.82 + 0.18 * sin(t * 2.1 + bp.x * 0.6);
    return c;
  }

  if (bt == BEDROCK) {
    float bv = 0.13 + 0.09 * n2(bp * 2.8 + buv);
    vec3 c = vec3(bv) * ed;
    if (h2(bp + vec2(2.3, 1.7)) < 0.28) c *= 0.45;
    return c;
  }

  return vec3(0.0);
}

/* ──────────────────────────────────────────
   Air / sky renderer
   ────────────────────────────────────────── */
vec3 renderAir(vec2 wp, vec2 sb, float t) {
  float wy = wp.y;

  // ---- Sky (above and at surface level) ----
  // caveAt() returns false for wy < 12, so any AIR at wy < 14 is above-ground sky
  if (wy < 14.0) {
    vec3 sky = vec3(0.043, 0.086, 0.039);

    // Twinkling stars — fixed in screen space using sb
    float starSeed = h2(floor(sb * vec2(0.68, 0.55)) + vec2(17.3, 8.9));
    float hasStar  = step(0.86, starSeed);
    float twinkle  = 0.4 + 0.6 * sin(t * (1.8 + starSeed * 4.0) + starSeed * 6.28);
    sky += vec3(0.55, 0.8, 0.55) * hasStar * twinkle;

    // Faint atmospheric glow near the surface horizon
    float horizonGlow = 1.0 - clamp(wy / 14.0, 0.0, 1.0);
    sky = mix(sky, vec3(0.07, 0.18, 0.06), horizonGlow * 0.35);

    return sky;
  }

  // ---- Cave air ----
  if (wy < 145.0) {
    float fog = clamp(wy / 145.0, 0.0, 1.0);
    vec3 c = mix(vec3(0.043, 0.086, 0.039), vec3(0.005, 0.005, 0.005), fog * 0.75);

    // Scattered torch glows — every 16 world blocks, randomly placed
    vec2 torchZone = floor(wp / 16.0);
    float tSeed = h2(torchZone);
    if (tSeed > 0.55 && wy > 14.0) {
      vec2 torchPos = torchZone * 16.0 + vec2(h2(torchZone + 0.5) * 16.0, 10.0);
      float dist  = length(wp - torchPos);
      float fl    = 0.72 + 0.28 * sin(t * 3.8 + tSeed * 6.28);
      float glow  = exp(-dist * dist * 0.013) * 0.38;
      c += vec3(1.0, 0.55, 0.14) * glow * fl;
    }
    return c;
  }

  // ---- TNT-zone air ----
  if (wy < 215.0) {
    float rdGlow = 0.5 + 0.5 * sin(t * 0.7);
    return vec3(0.025, 0.006, 0.005) + vec3(0.05, 0.012, 0.002) * rdGlow * 0.4;
  }

  // ---- Nether air ----
  vec3 c = vec3(0.058, 0.012, 0.006);
  // Ambient heat shimmer
  float heat = n2(wp * 0.08 + vec2(t * 0.03, -t * 0.04));
  c += vec3(0.09, 0.022, 0.002) * heat * 0.5;
  // Glowstone light bleed — approximated through proximity noise
  float gsProx = n2(wp * 0.26 + vec2(55.0, 0.0));
  if (gsProx > 0.72) {
    c += vec3(0.55, 0.42, 0.10) * (gsProx - 0.72) * 0.9;
  }
  return c;
}

/* ──────────────────────────────────────────
   Main
   ────────────────────────────────────────── */
void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / u_res;

  // Camera: descend through the world as page scrolls
  // At scroll=0: show surface (worldY ≈ -28 to +39) — plenty of starfield sky
  // At scroll=1: show deep Nether (worldY ≈ 272 to 339)
  float camY = u_scroll * 300.0 - 28.0;
  float camX = (u_mouse.x - 0.5) * 3.5;  // subtle mouse parallax

  // Block-grid coordinates
  // Y is flipped so row 0 of blockCoord = top of canvas
  vec2 screenBlock = floor(vec2(fc.x, u_res.y - fc.y) / BS);
  vec2 blockUV     = fract(vec2(fc.x, u_res.y - fc.y) / BS);

  // World position
  vec2 worldPos = screenBlock + vec2(camX, camY);

  int bt = blockAt(worldPos);

  vec3 col;
  if (bt == AIR) {
    col = renderAir(worldPos, screenBlock, u_time);
  } else {
    col = renderBlock(bt, blockUV, worldPos, u_time);
  }

  // ──── Atmospheric overlays ────

  // Depth darkening — underground feels progressively heavier
  float depth = clamp(worldPos.y / 280.0, 0.0, 1.0);
  col *= mix(1.0, 0.55, depth * depth);

  // Nether orange drench — tints everything as we enter the Nether zone
  float netherT = smoothstep(210.0, 250.0, worldPos.y);
  col = mix(col, col * vec3(1.25, 0.48, 0.22), netherT * 0.28);

  // ──── Vignette ────
  vec2 vd = uv - 0.5;
  float vig = 1.0 - dot(vd * vec2(1.3, 1.6), vd * vec2(1.3, 1.6)) * 0.85;
  vig = clamp(vig, 0.22, 1.0);
  // Slightly reduce vignette in the Nether (it's already glowing)
  vig = mix(vig, mix(vig, 1.0, 0.25), netherT);
  col *= vig;

  // ──── Subtle film grain ────
  col += (h2(uv + fract(u_time * 7.37)) - 0.5) * 0.008;

  col = clamp(col, 0.0, 1.0);
  col = pow(col, vec3(0.9));  // mild gamma lift

  o_color = vec4(col, 1.0);
}`

function compileShader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('[VoidCanvas] shader error:', gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  return s
}

function buildProgram(gl) {
  const v = compileShader(gl, gl.VERTEX_SHADER, VERT)
  const f = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!v || !f) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, v)
  gl.attachShader(prog, f)
  gl.linkProgram(prog)
  gl.deleteShader(v)
  gl.deleteShader(f)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('[VoidCanvas] link error:', gl.getProgramInfoLog(prog))
    return null
  }
  return prog
}

export default function VoidCanvas() {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      powerPreference: 'default',
    })
    if (!gl) { setWebglFailed(true); return }

    const prog = buildProgram(gl)
    if (!prog) { setWebglFailed(true); return }

    // Fullscreen triangle — one draw call covers the entire viewport
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const posLoc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)

    const uRes    = gl.getUniformLocation(prog, 'u_res')
    const uTime   = gl.getUniformLocation(prog, 'u_time')
    const uMouse  = gl.getUniformLocation(prog, 'u_mouse')
    const uScroll = gl.getUniformLocation(prog, 'u_scroll')

    let raf = 0
    let startTime = performance.now()
    let mouse = [0.5, 0.5]
    let scrollProgress = 0
    let alive = true

    function resize() {
      canvas.width  = Math.min(window.innerWidth,  1920)
      canvas.height = Math.min(window.innerHeight, 1080)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    function onMouse(e) {
      mouse = [e.clientX / window.innerWidth, e.clientY / window.innerHeight]
    }

    function onScroll() {
      const max = document.body.scrollHeight - window.innerHeight
      scrollProgress = max > 0 ? window.scrollY / max : 0
    }

    function frame() {
      if (!alive) return
      if (document.hidden) { raf = requestAnimationFrame(frame); return }

      const t = (performance.now() - startTime) * 0.001
      gl.useProgram(prog)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, t)
      gl.uniform2f(uMouse, mouse[0], mouse[1])
      gl.uniform1f(uScroll, scrollProgress)
      gl.bindVertexArray(vao)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      gl.bindVertexArray(null)
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('scroll', onScroll, { passive: true })
    frame()

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('scroll', onScroll)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
      gl.deleteVertexArray(vao)
    }
  }, [reduced])

  if (reduced || webglFailed) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 pixel-grid-bg"
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ width: '100vw', height: '100vh', display: 'block' }}
    />
  )
}
