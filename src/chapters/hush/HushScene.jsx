import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BudsCase } from '../../devices/Placeholders'
import { AimedSpot } from '../../stage/AimedSpot'
import { progress, getUI, leaving, frame } from '../../experience/store'
import { useRoom, roomOrigin, drivePortal } from '../../stage/room'
import { portalAnchor } from '../../stage/cameras'
import { seeded, smooth, damp, lerp } from '../../stage/math'

/**
 * EXHIBIT 006: HUSH. A sculptural acoustic chamber.
 * Signature: everything starts restless (a handheld camera, jittering particles, foam walls breathing)
 * and resolves into stillness. Noise Cancellation forces the calm at any point.
 */

const N = 2600
const LINES = 7

export function HushScene({ quality }) {
  const root = useRoom('hush')
  const pts = useRef()
  const foam = useRef()
  const lid = useRef()
  const buds = useRef()
  const key = useRef()
  const portal = useRef()
  const calmRef = useRef(0)
  const nc = useRef(0)
  const count = quality === 'low' ? 1600 : N

  const data = useMemo(() => {
    const r = seeded(31)
    const chaos = new Float32Array(count * 3)
    const wave = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      chaos[i * 3] = (r() - 0.5) * 16
      chaos[i * 3 + 1] = r() * 7 - 1
      chaos[i * 3 + 2] = (r() - 0.5) * 10 - 2
      const line = i % LINES
      wave[i * 3] = -9 + (Math.floor(i / LINES) / (count / LINES)) * 18
      wave[i * 3 + 1] = 1.1
      wave[i * 3 + 2] = -1.5 - line * 0.9
      seed[i] = r() * 100
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    return { chaos, wave, seed, g }
  }, [count])

  const foamLayout = useMemo(() => {
    const out = []
    for (let y = 0; y < 9; y++) for (let x = 0; x < 22; x++) out.push([-11 + x + (y % 2) * 0.5, -0.5 + y, -9])
    return out
  }, [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])
  const bgNoisy = useMemo(() => new THREE.Color('#a8a49c'), [])
  const bgCalm = useMemo(() => new THREE.Color('#d8d4cc'), [])
  const bg = useMemo(() => new THREE.Color(), [])

  useFrame((state, dt) => {
    const a = progress.hush
    const t = state.clock.elapsedTime
    nc.current = lerp(nc.current, getUI().ncOn ? 1 : 0, damp(2, dt))
    const calm = Math.max(smooth(a, 0.45, 0.85), nc.current)
    calmRef.current = calm

    // the room's air and the camera's nerves follow the calm
    frame.bgRoom = 'hush'
    frame.bg = '#' + bg.copy(bgNoisy).lerp(bgCalm, calm).getHexString()
    frame.shake = 0.05 * (1 - calm) * (1 - smooth(a, 0.12, 0.2) * 0.7)

    // chaos settles into seven slow waveforms
    const p = data.g.attributes.position.array
    for (let i = 0; i < count; i++) {
      const s = data.seed[i]
      const j = 0.12 * (1 - calm)
      const cx = data.chaos[i * 3] + Math.sin(t * 7 + s) * j * 3
      const cy = data.chaos[i * 3 + 1] + Math.cos(t * 9 + s * 1.3) * j * 3
      const cz = data.chaos[i * 3 + 2] + Math.sin(t * 5 + s * 0.7) * j * 2
      const line = i % LINES
      const wx = data.wave[i * 3]
      const amp = 0.45 * (1 - line / LINES) * (0.6 + 0.4 * calm)
      const wy = data.wave[i * 3 + 1] + line * 0.18 + Math.sin(wx * 0.6 + t * 0.6 + line * 0.5) * amp
      const k = smooth(calm, 0, 1) * (0.85 + 0.15 * Math.sin(s))
      p[i * 3] = lerp(cx, wx, k)
      p[i * 3 + 1] = lerp(cy, wy, k)
      p[i * 3 + 2] = lerp(cz, data.wave[i * 3 + 2], k)
    }
    data.g.attributes.position.needsUpdate = true
    pts.current.material.opacity = 0.8
    pts.current.material.size = lerp(0.05, 0.045, calm)

    // acoustic foam: restless wedges flatten into a soft wall
    foamLayout.forEach((f, i) => {
      const h = lerp(0.6 + Math.abs(Math.sin(t * 6 + i)) * 0.6, 0.25, calm)
      v.set(f[0], f[1] - calm * calm * 11, f[2] + h / 2)
      sc.set(0.48, h, 0.48)
      foam.current.setMatrixAt(i, m.compose(v, q, sc))
    })
    foam.current.instanceMatrix.needsUpdate = true

    // the product: lid opens, the buds rise
    lid.current.rotation.x = -1.9 * smooth(a, 0.28, 0.38)
    buds.current.position.y = 0.45 * smooth(a, 0.32, 0.45)
    buds.current.rotation.y = smooth(a, 0.32, 0.6) * 0.6
    key.current.intensity = lerp(70, 140, calm)

    // the line closes into a circle: Moxie's dial
    if (portal.current) drivePortal(portal.current, 'hush', state.camera, portalAnchor.hush, [0.06, 0.06])
  })

  return (
    <group ref={root} position={roomOrigin('hush')} visible={false}>
      <hemisphereLight args={['#f4f1ea', '#8f8b84', 1.2]} />
      <AimedSpot at={[0, 0.3, 0]} position={[2, 6, 4]} angle={0.45} penumbra={1} intensity={100} color="#fffaf2" distance={18} />
      <pointLight ref={key} position={[-3, 3, 3]} intensity={70} distance={12} color="#fff8ee" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#c4c0b8" roughness={1} />
      </mesh>
      <instancedMesh ref={foam} args={[null, null, foamLayout.length]} frustumCulled={false}>
        <coneGeometry args={[0.7, 1, 4]} />
        <meshStandardMaterial color="#b8b3aa" roughness={1} flatShading />
      </instancedMesh>

      <points ref={pts} geometry={data.g} frustumCulled={false}>
        <pointsMaterial color="#14110f" size={0.05} transparent opacity={0.75} depthWrite={false} />
      </points>

      <group position={[0, -0.5, 0]} scale={1.6}>
        <BudsCase lidRef={lid} budsRef={buds} />
      </group>

      <mesh ref={portal} visible={false}>
        <circleGeometry args={[0.5, 64]} />
        <meshBasicMaterial color="#0E0E0E" toneMapped={false} fog={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
