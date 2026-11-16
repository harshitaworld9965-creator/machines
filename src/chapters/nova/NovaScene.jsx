import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Tablet } from '../../devices/Placeholders'
import { AimedSpot } from '../../stage/AimedSpot'
import { progress, getUI, leaving, frame } from '../../experience/store'
import { useRoom, roomOrigin, drivePortal } from '../../stage/room'
import { seeded, smooth, damp, lerp } from '../../stage/math'

/**
 * EXHIBIT 004: NOVA. An observatory where the picture leaves the screen.
 * Signature: the camera goes into the picture and back out. Three miniature worlds (Tide, Orchard,
 * Glass City); choosing one redraws the screen, recolours the observatory and grows that world around it.
 */

export const WORLDS = ['Tide', 'Orchard', 'Glass City']
const SKY = ['#cfe0e7', '#ebe5cf', '#d7daf1']
const ULTRA = '#2B3FD6'

function worldTexture(i) {
  const c = document.createElement('canvas')
  c.width = 640
  c.height = 400
  const g = c.getContext('2d')
  const r = seeded(60 + i)
  const sky = g.createLinearGradient(0, 0, 0, 400)
  if (i === 0) {
    sky.addColorStop(0, '#e9f2f4')
    sky.addColorStop(1, '#8fb2c4')
  } else if (i === 1) {
    sky.addColorStop(0, '#f7f1dc')
    sky.addColorStop(1, '#d9caa0')
  } else {
    sky.addColorStop(0, '#eef0fb')
    sky.addColorStop(1, '#9aa3d8')
  }
  g.fillStyle = sky
  g.fillRect(0, 0, 640, 400)
  g.fillStyle = ULTRA
  if (i === 0) {
    g.globalAlpha = 0.9
    g.beginPath()
    g.arc(470, 120, 46, 0, Math.PI * 2)
    g.fill()
    g.globalAlpha = 1
    for (let k = 0; k < 9; k++) {
      g.strokeStyle = `rgba(43,63,214,${0.25 + k * 0.08})`
      g.lineWidth = 2 + k * 0.6
      g.beginPath()
      for (let x = 0; x <= 640; x += 8) g.lineTo(x, 230 + k * 20 + Math.sin(x * 0.02 + k) * (6 + k))
      g.stroke()
    }
  } else if (i === 1) {
    for (let k = 0; k < 26; k++) {
      const x = r() * 640
      const y = 200 + r() * 170
      const s = 14 + (y - 200) * 0.18
      g.fillStyle = '#5a4a2c'
      g.fillRect(x - 2, y, 4, s)
      g.fillStyle = k % 5 === 0 ? '#f2a35c' : ULTRA
      g.beginPath()
      g.arc(x, y, s, 0, Math.PI * 2)
      g.fill()
    }
  } else {
    for (let k = 0; k < 22; k++) {
      const w = 20 + r() * 50
      const h = 80 + r() * 250
      const x = r() * 620
      g.fillStyle = `rgba(43,63,214,${0.25 + r() * 0.5})`
      g.fillRect(x, 400 - h, w, h)
      g.strokeStyle = 'rgba(255,255,255,0.7)'
      g.strokeRect(x + 0.5, 400 - h + 0.5, w, h)
    }
  }
  g.fillStyle = 'rgba(20,17,15,0.55)'
  g.font = '500 16px "Martian Mono", monospace'
  g.fillText(`004 / NOVA / ${WORLDS[i].toUpperCase()}`, 24, 380)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Tide({ show }) {
  const ref = useRef()
  const geo = useMemo(() => new THREE.PlaneGeometry(70, 70, 70, 70), [])
  const base = useMemo(() => geo.attributes.position.array.slice(), [geo])
  useFrame((s) => {
    const k = show.current[0]
    ref.current.visible = k > 0.01
    if (!ref.current.visible) return
    const p = geo.attributes.position.array
    const t = s.clock.elapsedTime
    for (let i = 0; i < p.length; i += 3) {
      const x = base[i]
      const y = base[i + 1]
      p[i + 2] = (Math.sin(x * 0.25 + t * 0.8) + Math.cos(y * 0.3 + t * 0.6)) * 0.45 * k
    }
    geo.attributes.position.needsUpdate = true
    ref.current.position.y = lerp(-6, -1.2, k)
    ref.current.material.opacity = k * 0.6
  })
  return (
    <mesh ref={ref} geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial color={ULTRA} wireframe transparent opacity={0} />
    </mesh>
  )
}

function Orchard({ show }) {
  const trunks = useRef()
  const crowns = useRef()
  const trees = useMemo(() => {
    const r = seeded(11)
    return Array.from({ length: 70 }, () => {
      const a = r() * Math.PI * 2
      const d = 4 + r() * 22
      return { x: Math.cos(a) * d, z: Math.sin(a) * d - 4, h: 1.2 + r() * 2.6, s: 0.6 + r() * 1.1, warm: r() > 0.85 }
    })
  }, [])
  useMemo(() => {}, [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const k = show.current[1]
    trunks.current.visible = crowns.current.visible = k > 0.01
    if (k <= 0.01) return
    trees.forEach((t, i) => {
      const g = smooth(k * 1.5 - (i / trees.length) * 0.5, 0, 1)
      sc.set(0.06, Math.max(0.001, t.h * g), 0.06)
      trunks.current.setMatrixAt(i, m.compose(v.set(t.x, -1.2 + (t.h * g) / 2, t.z), q, sc))
      sc.setScalar(Math.max(0.001, t.s * g))
      crowns.current.setMatrixAt(i, m.compose(v.set(t.x, -1.2 + t.h * g, t.z), q, sc))
    })
    trunks.current.instanceMatrix.needsUpdate = crowns.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={trunks} args={[null, null, 70]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#6b5a3a" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[null, null, 70]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={ULTRA} roughness={0.6} flatShading />
      </instancedMesh>
    </>
  )
}

function GlassCity({ show }) {
  const ref = useRef()
  const towers = useMemo(() => {
    const r = seeded(21)
    return Array.from({ length: 60 }, () => {
      const a = r() * Math.PI * 2
      const d = 5 + r() * 24
      return { x: Math.cos(a) * d, z: Math.sin(a) * d - 6, h: 2 + r() * 12, w: 0.8 + r() * 1.8 }
    })
  }, [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const k = show.current[2]
    ref.current.visible = k > 0.01
    if (k <= 0.01) return
    towers.forEach((t, i) => {
      const g = smooth(k * 1.5 - (i / towers.length) * 0.5, 0, 1)
      const h = Math.max(0.001, t.h * g)
      ref.current.setMatrixAt(i, m.compose(v.set(t.x, -1.2 + h / 2, t.z), q, sc.set(t.w, h, t.w)))
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, 60]} frustumCulled={false}>
      <boxGeometry />
      <meshPhysicalMaterial color="#9aa6ff" roughness={0.08} metalness={0.1} transparent opacity={0.42} clearcoat={1} />
    </instancedMesh>
  )
}

export function NovaScene() {
  const root = useRoom('nova')
  const tablet = useRef()
  const screen = useRef()
  const spill = useRef()
  const rings = useRef()
  const portal = useRef()
  const show = useRef([0, 0, 0])
  const maps = useMemo(() => [0, 1, 2].map(worldTexture), [])
  const currentWorld = useRef(0)
  const anchor = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const a = progress.nova
    const out = leaving('nova')
    const w = getUI().world

    // a thin silhouette that turns to face us, then wakes
    const turn = smooth(a, 0.08, 0.3)
    tablet.current.rotation.y = lerp(Math.PI / 2 - 0.02, -0.12, turn) + smooth(a, 0.85, 1) * 0.25
    tablet.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 0.6) * 0.05
    screen.current.color.setScalar(smooth(a, 0.26, 0.36))
    if (currentWorld.current !== w) {
      currentWorld.current = w
      screen.current.map = maps[w]
      spill.current.material.map = maps[w]
    }

    // the picture spills past the bezel and becomes the room
    const sp = smooth(a, 0.4, 0.55)
    const spFade = 1 - smooth(a, 0.58, 0.7)
    spill.current.visible = sp * spFade > 0.01
    spill.current.scale.set(lerp(2.5, 70, sp * sp), lerp(1.55, 43, sp * sp), 1)
    spill.current.material.opacity = sp * spFade

    const emerge = smooth(a, 0.5, 0.66) * (1 - smooth(out * 2, 0, 0.6))
    for (let i = 0; i < 3; i++) show.current[i] = lerp(show.current[i], (i === w ? 1 : 0) * emerge, damp(2.6, dt))

    rings.current.rotation.z += dt * 0.03
    rings.current.rotation.x = 0.3 + a * 0.4

    // the observatory takes the colour of the chosen world
    frame.bgRoom = 'nova'
    frame.bg = a > 0.38 ? SKY[w] : null

    // a small moving point crosses the screen and becomes Toad's cursor
    if (portal.current) {
      const t = Math.min(1, out * 2)
      anchor.set(lerp(-1.0, 0.1, smooth(t, 0, 0.35)), 1.2 + Math.sin(t * 9) * 0.15 * (1 - t), 0.25)
      drivePortal(portal.current, 'nova', state.camera, anchor, [0.07, 0.07])
    }
  })

  return (
    <group ref={root} position={roomOrigin('nova')} visible={false}>
      <hemisphereLight args={['#ffffff', '#b8c4c0', 1.4]} />
      <AimedSpot at={[0, 1.2, 0]} position={[3, 6, 6]} angle={0.5} penumbra={0.9} intensity={120} color="#ffffff" distance={20} />

      <group ref={tablet} position={[0, 1.2, 0]}>
        <Tablet screenRef={screen} screenMap={maps[0]} />
      </group>

      <mesh ref={spill} position={[0, 1.2, -0.4]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={maps[0]} transparent opacity={0} toneMapped={false} depthWrite={false} fog={false} />
      </mesh>

      {/* celestial geometry: thin orbits around the observatory */}
      <group ref={rings} position={[0, 1.2, -6]}>
        {[6, 9, 13, 18].map((r, i) => (
          <mesh key={r} rotation={[Math.PI / 2 + i * 0.2, 0, i * 0.4]}>
            <torusGeometry args={[r, 0.012, 6, 160]} />
            <meshBasicMaterial color={ULTRA} transparent opacity={0.35} />
          </mesh>
        ))}
      </group>

      <Tide show={show} />
      <Orchard show={show} />
      <GlassCity show={show} />

      <mesh ref={portal} visible={false}>
        <circleGeometry args={[0.5, 48]} />
        <meshBasicMaterial color="#F1E9D2" toneMapped={false} fog={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
