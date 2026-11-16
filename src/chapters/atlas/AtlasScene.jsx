import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Laptop } from '../../devices/Placeholders'
import { AimedSpot } from '../../stage/AimedSpot'
import { progress, getUI, leaving } from '../../experience/store'
import { useRoom, roomOrigin, drivePortal } from '../../stage/room'
import { portalAnchor } from '../../stage/cameras'
import { seeded, smooth, damp, lerp, clamp01 } from '../../stage/math'

/**
 * EXHIBIT 003: ATLAS. An impossible computational architecture.
 * Signature: worm's-eye orbit, then a crane up. Code-like projections leave the screen and become
 * structure. Build Mode: four systems (Grid, Beams, Stairs, Tower) the visitor switches on and off,
 * plus Rearrange, which collapses the building and assembles a new one from a new seed.
 */

export const SYSTEMS = ['grid', 'beams', 'stairs', 'tower']
const GATE = { grid: 0.5, beams: 0.56, stairs: 0.64, tower: 0.72 }
const ORANGE = '#F26B21'

function layout(seed) {
  const r = seeded(seed * 97 + 3)
  const beams = Array.from({ length: 48 }, () => {
    const vertical = r() > 0.55
    return {
      pos: new THREE.Vector3((r() - 0.5) * 30, vertical ? 2 + r() * 6 : -1 + r() * 13, -16 + r() * 22),
      rot: new THREE.Euler(vertical ? 0 : 0, r() * Math.PI, vertical ? Math.PI / 2 : 0),
      len: 6 + r() * 14,
    }
  })
  const dir = r() > 0.5 ? 1 : -1
  const a0 = r() * Math.PI * 2
  const rad = 6.5 + r() * 2.5
  const steps = Array.from({ length: 30 }, (_, i) => {
    const a = a0 + i * 0.3 * dir
    return { pos: new THREE.Vector3(Math.cos(a) * rad, -3 + i * 0.42, Math.sin(a) * rad), rotY: -a }
  })
  const towers = Array.from({ length: 4 }, (_, k) => {
    const a = (k / 4) * Math.PI * 2 + r() * 0.8
    const d = 13 + r() * 5
    return { x: Math.cos(a) * d, z: Math.sin(a) * d - 4, floors: 10 + Math.floor(r() * 9), w: 2.4 + r() * 1.8 }
  })
  const slabs = []
  towers.forEach((t) => {
    for (let f = 0; f < t.floors; f++) slabs.push({ pos: new THREE.Vector3(t.x, -3 + f * 0.95, t.z), w: t.w, f: f / t.floors })
  })
  return { beams, steps, slabs }
}

function codeTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 160
  const g = c.getContext('2d')
  const r = seeded(4)
  for (let y = 10; y < 150; y += 12) {
    let x = 10 + Math.floor(r() * 3) * 14
    while (x < 230) {
      const w = 10 + r() * 50
      g.fillStyle = r() > 0.75 ? ORANGE : 'rgba(207,224,255,0.75)'
      g.fillRect(x, y, w, 5)
      x += w + 8
      if (r() > 0.8) break
    }
  }
  g.strokeStyle = 'rgba(207,224,255,0.6)'
  g.strokeRect(1, 1, 254, 158)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function screenTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 340
  const g = c.getContext('2d')
  g.fillStyle = '#0f1d33'
  g.fillRect(0, 0, 512, 340)
  g.strokeStyle = 'rgba(207,224,255,0.18)'
  for (let x = 0; x < 512; x += 32) {
    g.beginPath()
    g.moveTo(x, 0)
    g.lineTo(x, 340)
    g.stroke()
  }
  for (let y = 0; y < 340; y += 32) {
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(512, y)
    g.stroke()
  }
  g.strokeStyle = ORANGE
  g.lineWidth = 3
  g.strokeRect(150, 80, 210, 150)
  g.beginPath()
  g.moveTo(150, 230)
  g.lineTo(255, 80)
  g.lineTo(360, 230)
  g.stroke()
  g.fillStyle = 'rgba(207,224,255,0.8)'
  g.font = '500 16px "Martian Mono", monospace'
  g.fillText('003 / ATLAS  BUILD 0.1', 24, 316)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const _m = new THREE.Matrix4()
const _q = new THREE.Quaternion()
const _p = new THREE.Vector3()
const _s = new THREE.Vector3()
const _e = new THREE.Euler()
const ease = (x) => 1 - Math.pow(1 - clamp01(x), 3)
const stagger = (A, i, n, spread = 0.7) => ease(A * (1 + spread) - (i / n) * spread)

function Grid({ amount }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const pts = []
    const n = 30
    const s = 2
    for (let i = -n / 2; i <= n / 2; i++) {
      pts.push(i * s, 0, (-n / 2) * s, i * s, 0, (n / 2) * s, (-n / 2) * s, 0, i * s, (n / 2) * s, 0, i * s)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  useFrame(() => {
    const a = amount.current.grid
    ref.current.visible = a > 0.01
    ref.current.position.y = lerp(-14, -3, ease(a))
    ref.current.material.opacity = a * 0.5
  })
  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial color="#cfe0ff" transparent opacity={0} depthWrite={false} />
    </lineSegments>
  )
}

export function AtlasScene() {
  const root = useRoom('atlas')
  const machine = useRef()
  const lid = useRef()
  const screen = useRef()
  const glow = useRef()
  const beams = useRef()
  const steps = useRef()
  const slabs = useRef()
  const projections = useRef()
  const portal = useRef()
  const amount = useRef({ grid: 0, beams: 0, stairs: 0, tower: 0 })
  const seedState = useRef({ active: 1, k: 1 })
  const layouts = useRef({})
  const screenMap = useMemo(() => screenTexture(), [])
  const codeMap = useMemo(() => codeTexture(), [])
  const projLayout = useMemo(() => {
    const r = seeded(8)
    return Array.from({ length: 18 }, () => ({
      dir: new THREE.Vector3((r() - 0.5) * 2, 0.2 + r() * 0.9, 0.3 + r() * 0.8).normalize(),
      dist: 4 + r() * 9,
      spin: (r() - 0.5) * 0.8,
    }))
  }, [])
  const getLayout = (seed) => (layouts.current[seed] ||= layout(seed))

  useFrame((state, dt) => {
    const a = progress.atlas
    const out = leaving('atlas')
    const ui = getUI()

    // Rearrange: collapse, swap the seed, rebuild
    const st = seedState.current
    if (ui.buildSeed !== st.active) {
      st.k = lerp(st.k, 0, damp(6, dt))
      if (st.k < 0.03) st.active = ui.buildSeed
    } else st.k = lerp(st.k, 1, damp(2.2, dt))
    const L = getLayout(st.active)

    const collapse = 1 - smooth(out * 2, 0, 0.7)
    for (const sys of ['grid', 'beams', 'stairs', 'tower']) {
      const gate = smooth(a, GATE[sys], GATE[sys] + 0.1)
      const want = gate * (ui.build[sys] ? 1 : 0) * st.k * collapse
      amount.current[sys] = lerp(amount.current[sys], want, damp(sys === 'grid' ? 3 : 2.4, dt))
    }

    // the machine: floating, enormous; lid opens as the structure begins
    const lidT = smooth(a, 0.32, 0.46)
    lid.current.rotation.x = -1.85 * lidT
    screen.current.color.setScalar(smooth(lidT, 0.4, 1))
    glow.current.intensity = lidT * 30
    machine.current.position.y = 2.5 + Math.sin(state.clock.elapsedTime * 0.4) * 0.12
    machine.current.rotation.y = -0.25 + a * 0.5

    // projections: code leaves the screen and travels outward, then becomes structure
    const pe = smooth(a, 0.42, 0.56)
    const pf = 1 - smooth(a, 0.58, 0.68)
    projections.current.visible = pe * pf > 0.01
    projections.current.children.forEach((m, i) => {
      const p = projLayout[i]
      const e = ease(pe * 1.3 - i / 36)
      m.position.set(p.dir.x * p.dist * e, 3.6 + p.dir.y * p.dist * e, p.dir.z * p.dist * e)
      m.rotation.set(0, p.spin * e, 0)
      m.scale.setScalar(0.4 + e * 1.8)
      m.material.opacity = e * pf * 0.9
    })

    // beams
    const B = amount.current.beams
    beams.current.visible = B > 0.01
    L.beams.forEach((b, i) => {
      const k = stagger(B, i, L.beams.length)
      _p.copy(b.pos)
      _p.y -= (1 - k) * 6
      _q.setFromEuler(b.rot)
      _s.set(0.16, 0.16, Math.max(0.001, b.len * k))
      beams.current.setMatrixAt(i, _m.compose(_p, _q, _s))
    })
    beams.current.instanceMatrix.needsUpdate = true

    // stairs
    const S = amount.current.stairs
    steps.current.visible = S > 0.01
    L.steps.forEach((s, i) => {
      const k = stagger(S, i, L.steps.length)
      _p.copy(s.pos)
      _p.y -= (1 - k) * 14
      _q.setFromEuler(_e.set(0, s.rotY + (1 - k) * 2, 0))
      _s.set(0.5 + k * 1.2, 0.14, 0.6)
      steps.current.setMatrixAt(i, _m.compose(_p, _q, _s))
    })
    steps.current.instanceMatrix.needsUpdate = true

    // towers
    const T = amount.current.tower
    slabs.current.visible = T > 0.01
    slabs.current.count = L.slabs.length
    L.slabs.forEach((s, i) => {
      const k = ease(T * 1.6 - s.f * 0.6)
      _p.copy(s.pos)
      _p.y += (1 - k) * 10
      _q.identity()
      _s.set(Math.max(0.001, s.w * k), 0.12, Math.max(0.001, s.w * k))
      slabs.current.setMatrixAt(i, _m.compose(_p, _q, _s))
    })
    slabs.current.instanceMatrix.needsUpdate = true

    // the whole architecture folds into one luminous plane: Nova's screen
    if (portal.current) {
      const t = Math.min(1, out * 2)
      drivePortal(portal.current, 'atlas', state.camera, portalAnchor.atlas, [8 * (1 - smooth(t, 0.2, 0.6)) + 2.6, 0.02 + smooth(t, 0.1, 0.5) * 1.6])
    }
  })

  return (
    <group ref={root} position={roomOrigin('atlas')} visible={false}>
      <hemisphereLight args={['#9fb8dd', '#0b1626', 0.8]} />
      <AimedSpot at={[0, 2.5, 0]} position={[-8, 14, 10]} angle={0.5} penumbra={0.8} intensity={600} color="#e3ecff" distance={40} />
      <directionalLight position={[10, 4, -10]} intensity={1.4} color={ORANGE} />

      <group ref={machine} position={[0, 2.5, 0]} scale={3}>
        <Laptop color="#9a9ea6" metalness={0.7} roughness={0.32} lidRef={lid} screenRef={screen} screenMap={screenMap} />
        <pointLight ref={glow} position={[0, 0.5, 0.4]} intensity={0} distance={8} color="#ffb48a" />
      </group>

      <group ref={projections} visible={false}>
        {projLayout.map((_, i) => (
          <mesh key={i}>
            <planeGeometry args={[1.6, 1]} />
            <meshBasicMaterial map={codeMap} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>

      <Grid amount={amount} />
      <instancedMesh ref={beams} args={[null, null, 48]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#b9c8da" metalness={0.75} roughness={0.3} />
      </instancedMesh>
      <instancedMesh ref={steps} args={[null, null, 30]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color={ORANGE} metalness={0.2} roughness={0.5} emissive={ORANGE} emissiveIntensity={0.25} />
      </instancedMesh>
      <instancedMesh ref={slabs} args={[null, null, 80]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#cfe0ff" metalness={0.1} roughness={0.2} transparent opacity={0.55} />
      </instancedMesh>

      <mesh ref={portal} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#DCE6E2" toneMapped={false} fog={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
