import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion'
import CreeperFace from './CreeperFace'

/* ──────────────────────────────────────────────────────────
   Authentic Minecraft Creeper — built from real voxels.

   The mob is assembled cube-by-cube at its true proportions
   (head 8³, body 8×12×4, four 4×4×6 legs). The front of the
   head carries the canonical face texture. Click it and every
   voxel detonates outward with physics, then reassembles.
   ────────────────────────────────────────────────────────── */

// The real 8×8 Creeper face. 1 = dark (eyes/mouth), 0 = green.
const FACE = [
  [0,0,0,0,0,0,0,0],
  [0,1,1,0,0,1,1,0],
  [0,1,1,0,0,1,1,0],
  [0,0,0,1,1,0,0,0],
  [0,0,1,1,1,1,0,0],
  [0,0,1,0,0,1,0,0],
  [0,0,1,0,0,1,0,0],
  [0,0,0,0,0,0,0,0],
]

// Eye cells (row,col) — these get a faint inner glow.
function isEyeCell(row, col) {
  return row >= 1 && row <= 2 && ((col >= 1 && col <= 2) || (col >= 5 && col <= 6))
}

function hash(x, y, z) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
  return n - Math.floor(n)
}

// Mottled creeper green, deterministic per voxel.
function bodyColor(x, y, z, out) {
  const f = hash(x, y, z)
  if (f < 0.2) out.setHex(0x4a9a2c)
  else if (f < 0.42) out.setHex(0x60bb39)
  else if (f < 0.62) out.setHex(0x3d8a26)
  else if (f < 0.8) out.setHex(0x54a832)
  else out.setHex(0x68c93f)
  return out
}

const DARK = 0x0c2608
const EYE = 0x0a3a12

// Geometry layout (voxel units, +y up, +z toward viewer = front).
const VOX = 1
const LEG_H = 6
const BODY_H = 12
const HEAD_H = 8
const NECK_Y = LEG_H + BODY_H          // base of head
const TOTAL_H = LEG_H + BODY_H + HEAD_H
const Y_OFF = -TOTAL_H / 2             // recentre vertically on origin

// Build the descriptor list for every voxel in one part.
// region = {x0,x1,y0,y1,z0,z1} in voxel units (half-open on the high side).
function fillRegion(region, color) {
  const out = []
  const c = new THREE.Color()
  for (let x = region.x0; x < region.x1; x++) {
    for (let y = region.y0; y < region.y1; y++) {
      for (let z = region.z0; z < region.z1; z++) {
        bodyColor(x, y, z, c)
        out.push({ x: x + 0.5, y: y + 0.5, z: z + 0.5, color: c.getHex() })
      }
    }
  }
  return out
}

// Head voxels with the face painted on the front (+z outer layer).
function buildHead() {
  const out = []
  const c = new THREE.Color()
  const x0 = -4, y0 = NECK_Y, z0 = -4
  for (let ix = 0; ix < 8; ix++) {
    for (let iy = 0; iy < 8; iy++) {
      for (let iz = 0; iz < 8; iz++) {
        let hex
        const front = iz === 7
        if (front) {
          const row = 7 - iy           // grid row 0 = top
          const col = ix
          if (FACE[row][col] === 1) {
            hex = isEyeCell(row, col) ? EYE : DARK
          } else {
            hex = bodyColor(x0 + ix, y0 + iy, z0 + iz, c).getHex()
          }
        } else {
          hex = bodyColor(x0 + ix, y0 + iy, z0 + iz, c).getHex()
        }
        out.push({
          x: x0 + ix + 0.5,
          y: y0 + iy + 0.5,
          z: z0 + iz + 0.5,
          color: hex,
          eye: front && FACE[7 - iy][ix] === 1 && isEyeCell(7 - iy, ix),
        })
      }
    }
  }
  return out
}

function buildBody() {
  const parts = []
  // Body
  parts.push(...fillRegion({ x0: -4, x1: 4, y0: LEG_H, y1: LEG_H + BODY_H, z0: -2, z1: 2 }))
  // Four legs (4×4×6). Front pair at +z, back pair at −z.
  const legs = [
    { x0: -4, x1: 0, z0: 0, z1: 4 },   // front-left
    { x0: 0, x1: 4, z0: 0, z1: 4 },    // front-right
    { x0: -4, x1: 0, z0: -4, z1: 0 },  // back-left
    { x0: 0, x1: 4, z0: -4, z1: 0 },   // back-right
  ]
  for (const l of legs) {
    parts.push(...fillRegion({ x0: l.x0, x1: l.x1, y0: 0, y1: LEG_H, z0: l.z0, z1: l.z1 }))
  }
  return parts
}

const tmpObj = new THREE.Object3D()
const tmpColor = new THREE.Color()

// Encapsulates one InstancedMesh plus its per-voxel physics state.
class VoxelCloud {
  constructor(descriptors, geometry, material) {
    this.n = descriptors.length
    this.mesh = new THREE.InstancedMesh(geometry, material, this.n)
    this.mesh.frustumCulled = false

    this.rest = descriptors.map((d) => new THREE.Vector3(d.x, d.y, d.z))
    this.pos = this.rest.map((v) => v.clone())
    this.vel = descriptors.map(() => new THREE.Vector3())
    this.rot = descriptors.map(() => new THREE.Euler())
    this.rotVel = descriptors.map(() => new THREE.Vector3())
    this.startPos = this.rest.map((v) => v.clone())
    this.startRot = descriptors.map(() => new THREE.Euler())

    // Geometric centre, for radial blast direction.
    this.center = new THREE.Vector3()
    this.rest.forEach((v) => this.center.add(v))
    this.center.multiplyScalar(1 / this.n)

    descriptors.forEach((d, i) => {
      tmpObj.position.copy(this.rest[i])
      tmpObj.rotation.set(0, 0, 0)
      tmpObj.updateMatrix()
      this.mesh.setMatrixAt(i, tmpObj.matrix)
      this.mesh.setColorAt(i, tmpColor.setHex(d.color))
    })
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }

  explode() {
    const dir = new THREE.Vector3()
    for (let i = 0; i < this.n; i++) {
      this.pos[i].copy(this.rest[i])
      dir.subVectors(this.rest[i], this.center)
      if (dir.lengthSq() < 0.001) dir.set(0, 1, 0)
      dir.normalize()
      const speed = 16 + Math.random() * 26
      this.vel[i].set(
        dir.x * speed + (Math.random() - 0.5) * 10,
        dir.y * speed + 10 + Math.random() * 14,
        dir.z * speed + (Math.random() - 0.5) * 10,
      )
      this.rot[i].set(0, 0, 0)
      this.rotVel[i].set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
      )
    }
  }

  beginReform() {
    for (let i = 0; i < this.n; i++) {
      this.startPos[i].copy(this.pos[i])
      this.startRot[i].copy(this.rot[i])
    }
  }

  // mode: 'fly' integrates physics; 'reform' eases back; e = reform progress 0..1
  update(mode, dt, e) {
    for (let i = 0; i < this.n; i++) {
      if (mode === 'fly') {
        this.vel[i].y -= 42 * dt
        this.pos[i].addScaledVector(this.vel[i], dt)
        this.rot[i].x += this.rotVel[i].x * dt
        this.rot[i].y += this.rotVel[i].y * dt
        this.rot[i].z += this.rotVel[i].z * dt
      } else {
        this.pos[i].lerpVectors(this.startPos[i], this.rest[i], e)
        this.rot[i].x = this.startRot[i].x * (1 - e)
        this.rot[i].y = this.startRot[i].y * (1 - e)
        this.rot[i].z = this.startRot[i].z * (1 - e)
      }
      tmpObj.position.copy(this.pos[i])
      tmpObj.rotation.copy(this.rot[i])
      tmpObj.updateMatrix()
      this.mesh.setMatrixAt(i, tmpObj.matrix)
    }
    this.mesh.instanceMatrix.needsUpdate = true
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}

export default function CreeperModel({ size = 360, onExplode }) {
  const reduced = useReducedMotion()
  const mountRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const explodeRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      setFailed(true)
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(size, size)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.cursor = 'pointer'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200)
    camera.position.set(0, 2, 52)
    camera.lookAt(0, 0, 0)

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0x4a5a44, 0.85))
    const key = new THREE.DirectionalLight(0xffffff, 1.45)
    key.position.set(12, 22, 30)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x66ff7a, 0.5)
    rim.position.set(-18, 8, -14)
    scene.add(rim)
    const fill = new THREE.DirectionalLight(0x7088aa, 0.35)
    fill.position.set(-10, -6, 16)
    scene.add(fill)

    // ── Build the mob ──
    const geo = new THREE.BoxGeometry(0.96, 0.96, 0.96)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.92,
      metalness: 0.0,
      flatShading: true,
    })

    const root = new THREE.Group()
    root.position.y = Y_OFF
    scene.add(root)

    const bodyCloud = new VoxelCloud(buildBody(), geo, mat)
    root.add(bodyCloud.mesh)

    // Head lives on a pivot at the neck so it can look around.
    const headGroup = new THREE.Group()
    headGroup.position.set(0, NECK_Y, 0)
    root.add(headGroup)
    // Head descriptors are in root space; shift into headGroup-local space.
    const headDesc = buildHead().map((d) => ({ ...d, y: d.y - NECK_Y }))
    const headCloud = new VoxelCloud(headDesc, geo, mat)
    headGroup.add(headCloud.mesh)

    // Glowing eyes — two point lights riding just in front of the head.
    const eyeL = new THREE.PointLight(0x7dff5a, 0, 14, 2)
    const eyeR = new THREE.PointLight(0x7dff5a, 0, 14, 2)
    eyeL.position.set(-2, HEAD_H - 2.5, 4.6)
    eyeR.position.set(2, HEAD_H - 2.5, 4.6)
    headGroup.add(eyeL, eyeR)

    // ── Interaction state ──
    const target = { yaw: 0, pitch: 0 }
    let phase = 'idle'        // idle | fly | reform
    let phaseT = 0
    const FLY_DUR = 1.45
    const REFORM_DUR = 1.15

    function onPointerMove(e) {
      const r = renderer.domElement.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      target.yaw = nx * 0.55
      target.pitch = ny * 0.32
    }
    function triggerExplode() {
      if (phase !== 'idle') return
      phase = 'fly'
      phaseT = 0
      headGroup.rotation.set(0, 0, 0)   // snap forward; blast hides the snap
      bodyCloud.explode()
      headCloud.explode()
      if (onExplode) onExplode()
    }

    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('click', triggerExplode)
    explodeRef.current = triggerExplode

    const clock = new THREE.Clock()
    let raf = 0
    let alive = true

    function frame() {
      if (!alive) return
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime

      if (phase === 'idle') {
        root.position.y = Y_OFF + Math.sin(t * 1.4) * 0.5
        root.rotation.y = Math.sin(t * 0.35) * 0.06
        headGroup.rotation.y += (target.yaw - headGroup.rotation.y) * Math.min(1, dt * 6)
        headGroup.rotation.x += (-target.pitch - headGroup.rotation.x) * Math.min(1, dt * 6)
        const pulse = 0.9 + Math.sin(t * 2.4) * 0.5
        eyeL.intensity = eyeR.intensity = 2.4 * pulse
      } else if (phase === 'fly') {
        phaseT += dt
        bodyCloud.update('fly', dt)
        headCloud.update('fly', dt)
        eyeL.intensity = eyeR.intensity = 0
        if (phaseT >= FLY_DUR) {
          phase = 'reform'
          phaseT = 0
          bodyCloud.beginReform()
          headCloud.beginReform()
        }
      } else if (phase === 'reform') {
        phaseT += dt
        const p = Math.min(1, phaseT / REFORM_DUR)
        const e = 1 - Math.pow(1 - p, 3)   // ease-out cubic
        bodyCloud.update('reform', dt, e)
        headCloud.update('reform', dt, e)
        eyeL.intensity = eyeR.intensity = 2.4 * e
        if (p >= 1) {
          phase = 'idle'
          // restore static rest matrices exactly
          bodyCloud.update('reform', 0, 1)
          headCloud.update('reform', 0, 1)
        }
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }

    if (reduced) {
      // Static, well-lit portrait. No motion, no detonation.
      eyeL.intensity = eyeR.intensity = 2.2
      headGroup.rotation.set(0, -0.25, 0)
      renderer.render(scene, camera)
    } else {
      frame()
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('click', triggerExplode)
      bodyCloud.dispose()
      headCloud.dispose()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [size, reduced, onExplode])

  if (failed) {
    return <CreeperFace size={size * 0.62} />
  }

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      role="img"
      aria-label="A three-dimensional Minecraft Creeper that turns to follow your cursor. Click it to detonate."
    />
  )
}
