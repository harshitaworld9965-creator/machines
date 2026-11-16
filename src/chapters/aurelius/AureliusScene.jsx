import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Laptop } from '../../devices/Placeholders'
import { AimedSpot } from '../../stage/AimedSpot'
import { progress, getUI, leaving } from '../../experience/store'
import { useRoom, roomOrigin, drivePortal } from '../../stage/room'
import { portalAnchor } from '../../stage/cameras'
import { seeded, smooth, damp, lerp } from '../../stage/math'

/**
 * EXHIBIT 002: AURELIUS. A technological conservation gallery.
 * Signature: the camera barely moves; the object does. The lid opens with scroll (or by hand),
 * the screen becomes the only light, interfaces from another era drift out, and the machine
 * is finally lifted off its plinth, suspended outside time.
 */

const LID_OPEN = -1.85

function eraTexture(i) {
  // Abstract windows from an earlier era of computing: title bars, pinstripes, pixel grids. No real UI.
  const c = document.createElement('canvas')
  c.width = 320
  c.height = 220
  const g = c.getContext('2d')
  const r = seeded(30 + i)
  g.fillStyle = '#eceae4'
  g.fillRect(0, 0, 320, 220)
  for (let y = 0; y < 220; y += 3) {
    g.fillStyle = 'rgba(160,156,148,0.12)'
    g.fillRect(0, y, 320, 1)
  }
  const bar = g.createLinearGradient(0, 0, 0, 22)
  bar.addColorStop(0, '#f7f6f2')
  bar.addColorStop(1, '#cfccc4')
  g.fillStyle = bar
  g.fillRect(0, 0, 320, 22)
  ;['#d8a39a', '#d9c59a', '#a9c3a2'].forEach((col, k) => {
    g.fillStyle = col
    g.beginPath()
    g.arc(14 + k * 16, 11, 5, 0, Math.PI * 2)
    g.fill()
  })
  g.fillStyle = '#8c8780'
  const kind = i % 4
  if (kind === 0) for (let k = 0; k < 6; k++) g.fillRect(20, 40 + k * 26, 80 + r() * 200, 8)
  if (kind === 1)
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 6; x++) {
        g.fillStyle = r() > 0.5 ? '#B08D4C' : '#bdb8b0'
        g.fillRect(24 + x * 48, 42 + y * 42, 32, 28)
      }
  if (kind === 2) {
    g.strokeStyle = '#6e6962'
    g.lineWidth = 2
    g.beginPath()
    for (let x = 0; x < 280; x += 4) g.lineTo(20 + x, 120 + Math.sin(x * 0.05 + i) * 40 * r())
    g.stroke()
  }
  if (kind === 3) {
    for (let k = 0; k < 40; k++) {
      g.fillStyle = `rgba(110,105,98,${0.2 + r() * 0.6})`
      g.fillRect(20 + (k % 10) * 28, 40 + Math.floor(k / 10) * 40, 20, 20)
    }
  }
  g.strokeStyle = '#8C8780'
  g.strokeRect(0.5, 0.5, 319, 219)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function screenTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 340
  const g = c.getContext('2d')
  const gr = g.createRadialGradient(256, 150, 10, 256, 170, 380)
  gr.addColorStop(0, '#fbf6ec')
  gr.addColorStop(0.5, '#d9d2c4')
  gr.addColorStop(1, '#8c8780')
  g.fillStyle = gr
  g.fillRect(0, 0, 512, 340)
  g.fillStyle = 'rgba(110,105,98,0.5)'
  g.font = '500 18px "Martian Mono", monospace'
  g.fillText('002 / AURELIUS', 30, 310)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Dust({ count = 700 }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const r = seeded(77)
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (r() - 0.5) * 16
      arr[i * 3 + 1] = r() * 7 - 0.5
      arr[i * 3 + 2] = (r() - 0.5) * 14
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [count])
  useFrame((s, dt) => {
    // time slows to a stop as the machine is suspended
    const still = smooth(progress.aurelius, 0.78, 0.92)
    ref.current.rotation.y += dt * 0.012 * (1 - still)
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.022} color="#fff6e6" transparent opacity={0.6} depthWrite={false} />
    </points>
  )
}

function Suspended() {
  const rods = useMemo(() => {
    const r = seeded(12)
    return Array.from({ length: 22 }, () => {
      const a = r() * Math.PI * 2
      const rad = 3.6 + r() * 6
      const bottom = 1.8 + r() * 3.5
      return { x: Math.sin(a) * rad, z: Math.cos(a) * rad - 1.5, bottom, len: 14 - bottom }
    })
  }, [])
  return rods.map((rd, i) => (
    <mesh key={i} position={[rd.x, rd.bottom + rd.len / 2, rd.z]}>
      <cylinderGeometry args={[0.012, 0.012, rd.len, 6]} />
      <meshStandardMaterial color="#8a847b" metalness={0.5} roughness={0.5} />
    </mesh>
  ))
}

// hotspots for inspection mode, laptop-local
export const AURELIUS_HOTSPOTS = [
  { id: 'lid', pos: [0, 0.09, 0.2], label: 'Lid finish and logo' },
  { id: 'hinge', pos: [0, 0.05, -0.6], label: 'Hinge' },
  { id: 'edge', pos: [0.86, 0.03, 0.2], label: 'Side profile and ports' },
  { id: 'keys', pos: [-0.4, 0.06, -0.1], label: 'Keyboard layout' },
]

export function AureliusScene() {
  const root = useRoom('aurelius')
  const laptop = useRef()
  const lid = useRef()
  const screen = useRef()
  const glow = useRef()
  const shaft = useRef()
  const frags = useRef([])
  const portal = useRef()
  const hotspots = useRef()
  const lidAngle = useRef(0)
  const camera = useRef()
  const screenMap = useMemo(() => screenTexture(), [])
  const eraMaps = useMemo(() => Array.from({ length: 4 }, (_, i) => eraTexture(i)), [])
  const fragLayout = useMemo(() => {
    const r = seeded(5)
    return Array.from({ length: 16 }, (_, i) => ({
      to: new THREE.Vector3((r() - 0.5) * 4.4, 0.9 + r() * 1.6, -0.8 - i * 0.42 - r() * 0.3),
      rot: (r() - 0.5) * 0.3,
      size: 0.45 + r() * 0.4,
      map: i % 4,
    }))
  }, [])

  useFrame((state, dt) => {
    camera.current = state.camera
    const a = progress.aurelius
    const ui = getUI()
    const out = leaving('aurelius')

    // lid: scroll opens it; once the visitor takes the control, their angle wins
    const scrollLid = smooth(a, 0.24, 0.46)
    const want = ui.lid >= 0 && a > 0.3 ? ui.lid : scrollLid
    lidAngle.current = lerp(lidAngle.current, want, damp(5, dt))
    lid.current.rotation.x = LID_OPEN * lidAngle.current

    // the screen becomes the light in the room
    const on = smooth(lidAngle.current, 0.35, 0.9) * (1 + out)
    screen.current.color.setScalar(on)
    glow.current.intensity = on * 14

    // suspended outside time
    const lift = smooth(a, 0.78, 0.92)
    laptop.current.position.y = 0.64 + lift * 1.0 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015 * lift
    laptop.current.rotation.y = -0.3 + a * 0.3 + lift * 0.25
    laptop.current.rotation.z = lift * 0.06
    shaft.current.material.opacity = 0.03 + 0.04 * lift

    // interfaces from another era leave the screen and hang in layers the camera passes through
    const emerge = smooth(a, 0.5, 0.66)
    const fade = 1 - smooth(a, 0.86, 0.95)
    frags.current.forEach((m, i) => {
      if (!m) return
      const f = fragLayout[i]
      const e = smooth(emerge, i / 32, 0.5 + i / 32)
      m.visible = e * fade > 0.01
      m.position.set(lerp(0, f.to.x, e), lerp(1.2, f.to.y, e), lerp(-0.35, f.to.z, e))
      m.rotation.set(0, f.rot * e, 0)
      m.scale.setScalar(lerp(0.1, f.size, e))
      m.material.opacity = e * fade
    })

    hotspots.current.visible = ui.inspect && a > 0.3
    hotspots.current.children.forEach((h, i) => (h.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.15)))

    // the beam: a thin line of light from the display that stretches across the gallery
    if (portal.current) {
      const t = Math.min(1, out * 2)
      const stretch = smooth(t, 0, 0.5)
      drivePortal(portal.current, 'aurelius', state.camera, portalAnchor.aurelius, [0.02 + stretch * 6, 0.02 + smooth(t, 0.4, 0.8) * 1.2])
    }
  })

  return (
    <group ref={root} position={roomOrigin('aurelius')} visible={false}>
      <hemisphereLight args={['#f3eee6', '#9a958d', 1.6]} />
      <AimedSpot at={[0, 0.6, 0]} position={[0, 9, 2]} angle={0.32} penumbra={0.7} intensity={90} color="#fff3df" distance={20} />
      <directionalLight position={[-6, 4, 6]} intensity={0.6} color="#d8cfc0" />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#a39e96" roughness={1} />
      </mesh>
      <mesh position={[0, 10, -14]}>
        <planeGeometry args={[80, 30]} />
        <meshStandardMaterial color="#99948c" roughness={1} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2.6, 0.6, 1.9]} />
        <meshStandardMaterial color="#bdb8b0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.61, 0.955]}>
        <boxGeometry args={[2.6, 0.012, 0.012]} />
        <meshStandardMaterial color="#B08D4C" metalness={1} roughness={0.4} />
      </mesh>

      <group ref={laptop} position={[0, 0.64, 0]}>
        <Laptop lidRef={lid} screenRef={screen} screenMap={screenMap} />
        <pointLight ref={glow} position={[0, 0.8, 0.6]} intensity={0} distance={6} color="#fff1dc" />
        <group ref={hotspots} visible={false}>
          {AURELIUS_HOTSPOTS.map((h) => (
            <mesh key={h.id} position={h.pos} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.035, 0.05, 32]} />
              <meshBasicMaterial color="#B08D4C" toneMapped={false} side={THREE.DoubleSide} depthTest={false} />
            </mesh>
          ))}
        </group>
      </group>

      {fragLayout.map((f, i) => (
        <mesh key={i} ref={(el) => (frags.current[i] = el)} visible={false}>
          <planeGeometry args={[1.45, 1]} />
          <meshBasicMaterial map={eraMaps[f.map]} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}

      <mesh ref={shaft} position={[0, 4.7, 0.2]}>
        <cylinderGeometry args={[0.35, 1.7, 9, 48, 1, true]} />
        <meshBasicMaterial color="#fff6e8" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </mesh>

      <mesh ref={portal} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#f7efe1" toneMapped={false} fog={false} side={THREE.DoubleSide} />
      </mesh>

      <Suspended />
      <Dust />
    </group>
  )
}
