import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import monoFont from '@fontsource/martian-mono/files/martian-mono-latin-400-normal.woff?url'
import { Phone } from '../vesper/Phone'
import { Laptop, Tablet, Mouse, BudsCase, Watch, Television } from '../../devices/Placeholders'
import { progress, getUI } from '../../experience/store'
import { useRoom, roomOrigin } from '../../stage/room'
import { exhibits } from '../../data/exhibits'
import { seeded, smooth, damp, lerp } from '../../stage/math'

/**
 * FINALE: THE CONSTELLATION. Eight machines in one sky, each joined by a thin trajectory
 * to an unseen presence at the centre. Hovering or focusing a name in the index lights its line.
 * At the very end the devices fade back into points of light.
 */

// placement on a tilted ring around the centre
export const STAR_POS = exhibits.map((_, i) => {
  const a = (i / 8) * Math.PI * 2 + 0.3
  const r = 7 + (i % 3) * 1.4
  return new THREE.Vector3(Math.cos(a) * r, Math.sin(i * 1.7) * 2.2, Math.sin(a) * r * 0.8)
})

const DEVICE = {
  vesper: () => (
    <group scale={0.6}>
      <Phone />
    </group>
  ),
  aurelius: () => <Laptop />,
  atlas: () => <Laptop color="#9a9ea6" metalness={0.7} />,
  nova: () => (
    <group scale={0.8}>
      <Tablet />
    </group>
  ),
  toad: () => (
    <group scale={1.6}>
      <Mouse />
    </group>
  ),
  hush: () => (
    <group scale={1.4}>
      <BudsCase />
    </group>
  ),
  moxie: () => (
    <group scale={0.7}>
      <Watch />
    </group>
  ),
  elsewhere: () => (
    <group scale={0.5}>
      <Television />
    </group>
  ),
}

function trajectory(p) {
  const mid = p.clone().multiplyScalar(0.5)
  mid.y += 2.6
  const curve = new THREE.QuadraticBezierCurve3(p, mid, new THREE.Vector3(0, 0, 0))
  return new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))
}

function Stars() {
  const geo = useMemo(() => {
    const r = seeded(88)
    const arr = new Float32Array(1500 * 3)
    for (let i = 0; i < 1500; i++) {
      const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(50 + r() * 40)
      arr.set([v.x, v.y, v.z], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.12} color="#f4f0e8" transparent opacity={0.5} fog={false} />
    </points>
  )
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  gr.addColorStop(0, 'rgba(255,240,220,1)')
  gr.addColorStop(0.2, 'rgba(231,167,160,0.5)')
  gr.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gr
  g.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

export function FinaleScene() {
  const root = useRoom('finale')
  const sky = useRef()
  const items = useRef([])
  const lines = useRef([])
  const points = useRef([])
  const glow = useRef()
  const focus = useRef(exhibits.map(() => 0))
  const lineGeos = useMemo(() => STAR_POS.map(trajectory), [])
  const glowMap = useMemo(() => glowTexture(), [])

  useFrame((state, dt) => {
    const a = progress.finale
    const t = state.clock.elapsedTime
    const f = getUI().finaleFocus
    const appear = smooth(a, 0.08, 0.3)
    const resolve = smooth(a, 0.86, 0.98)
    sky.current.rotation.y = t * 0.02 + a * 0.6

    exhibits.forEach((_, i) => {
      focus.current[i] = lerp(focus.current[i], f === i ? 1 : 0, damp(5, dt))
      const g = items.current[i]
      if (g) {
        const s = Math.max(0.001, appear * (1 - resolve) * (1 + focus.current[i] * 0.3))
        g.scale.setScalar(s)
        g.position.copy(STAR_POS[i])
        g.position.y += Math.sin(t * 0.6 + i) * 0.2
        g.rotation.y = t * 0.15 + i
      }
      const l = lines.current[i]
      if (l) l.material.opacity = appear * (0.18 + focus.current[i] * 0.7) * (1 - resolve)
      const p = points.current[i]
      if (p) {
        p.visible = resolve > 0.01
        p.scale.setScalar(0.12 * resolve)
      }
    })
    glow.current.material.opacity = 0.35 + 0.25 * Math.sin(t * 0.8) * 0.5 + resolve * 0.3
    glow.current.scale.setScalar(lerp(1.2, 3.2, appear))
  })

  return (
    <group ref={root} position={roomOrigin('finale')} visible={false}>
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={60} color="#ffe6d0" distance={30} />
      <directionalLight position={[10, 14, 20]} intensity={1.2} color="#cfd6ff" />
      <Stars />

      <sprite ref={glow}>
        <spriteMaterial map={glowMap} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>

      <group ref={sky}>
        {exhibits.map((ex, i) => {
          const D = DEVICE[ex.id]
          return (
            <group key={ex.id}>
              <line ref={(el) => (lines.current[i] = el)} geometry={lineGeos[i]}>
                <lineBasicMaterial color={ex.palette.accent === '#14110F' ? '#EFE8DC' : ex.palette.accent} transparent opacity={0} />
              </line>
              <group ref={(el) => (items.current[i] = el)} scale={0.001}>
                <D />
                <Text font={monoFont} fontSize={0.22} color="#EFE8DC" anchorX="center" position={[0, -1.4, 0]} fillOpacity={0.8}>
                  {`${ex.number} ${ex.nickname} · ${ex.theme}`}
                </Text>
              </group>
              <mesh ref={(el) => (points.current[i] = el)} position={STAR_POS[i]} visible={false}>
                <sphereGeometry args={[1, 12, 12]} />
                <meshBasicMaterial color="#fff6ea" toneMapped={false} />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}
