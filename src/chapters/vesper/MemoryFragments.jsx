import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getFragmentTextures, FRAGMENT_KINDS } from './textures'
import { progress, getUI, leaving } from '../../experience/store'
import { PHONE } from '../../stage/world'
import { seeded, smooth, damp, lerp } from '../../stage/math'

/**
 * Abstract memory fragments. Four states, blended per frame:
 *   screen  -> tiny, flat on the display
 *   cloud   -> released in front of the phone
 *   archive -> shelved on a floorless cylindrical archive with the phone as its axis
 *   orbit   -> Memory Orbit: three tilted rings circling the phone (user-controlled)
 */

const RING_TILT = [
  new THREE.Euler(0.42, 0, 0.18),
  new THREE.Euler(-0.55, 0.3, 0.32),
  new THREE.Euler(0.12, -0.2, -0.46),
]

function buildLayout(count) {
  const r = seeded(2024)
  const items = []
  const rows = 11
  for (let i = 0; i < count; i++) {
    const aspect = r() > 0.5 ? 0.75 : r() > 0.5 ? 1 : 0.6
    const size = 0.55 + r() * 0.45
    // screen
    const screen = new THREE.Vector3((r() - 0.5) * PHONE.w * 0.78, (r() - 0.5) * PHONE.h * 0.8, PHONE.d / 2 + 0.02)
    // cloud
    const cloud = new THREE.Vector3((r() - 0.5) * 6.5, (r() - 0.5) * 4.2 + 0.3, 0.6 + r() * 3.4)
    // archive: rows of shelves on two radii, gap left where the camera looks in
    const row = i % rows
    const col = Math.floor(i / rows)
    const cols = Math.ceil(count / rows)
    let angle = (col / cols) * Math.PI * 2 + (row % 2) * (Math.PI / cols) + (r() - 0.5) * 0.08
    const radius = 4.4 + (r() > 0.6 ? 1.6 : 0) + r() * 0.3
    const y = -6.5 + row * 1.45 + (r() - 0.5) * 0.25
    const archive = new THREE.Vector3(Math.sin(angle) * radius, y, Math.cos(angle) * radius)
    const archiveRot = new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.1, Math.atan2(archive.x, archive.z) * 0.35, 0))
    // orbit
    const ring = i % 3
    items.push({
      size,
      aspect,
      screen,
      cloud,
      cloudRot: new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.6, (r() - 0.5) * 0.9, (r() - 0.5) * 0.4)),
      archive,
      archiveRot,
      ring,
      ringRadius: 2.7 + ring * 1.15 + r() * 0.4,
      ringAngle: r() * Math.PI * 2,
      ringLift: (r() - 0.5) * 0.35,
      speed: (0.32 - ring * 0.07) * (ring === 1 ? -1 : 1),
      delay: r() * 0.08,
    })
  }
  return items
}

const _m = new THREE.Matrix4()
const _p = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _s = new THREE.Vector3()
const _o = new THREE.Vector3()
const _qo = new THREE.Quaternion()
const _id = new THREE.Quaternion()

export function MemoryFragments({ perKind = 12 }) {
  const textures = useMemo(() => getFragmentTextures(), [])
  const count = perKind * FRAGMENT_KINDS
  const layout = useMemo(() => buildLayout(count), [count])
  const meshes = useRef([])
  const materials = useMemo(
    () =>
      textures.map(
        (map) =>
          new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })
      ),
    [textures]
  )
  const geo = useMemo(() => new THREE.PlaneGeometry(0.64, 0.48), [])
  const orbitBlend = useRef(0)
  const camera = useThree((s) => s.camera)

  useLayoutEffect(() => () => materials.forEach((m) => m.dispose()), [materials])

  useFrame((state, dt) => {
    const v = progress.vesper
    const passage = leaving('vesper')
    const time = state.clock.elapsedTime
    orbitBlend.current = lerp(orbitBlend.current, getUI().orbit && v > 0.5 ? 1 : 0, damp(2.2, dt))
    const ob = orbitBlend.current

    const alpha = smooth(v, 0.6, 0.66) * (1 - smooth(passage, 0.35, 0.5))
    materials.forEach((m) => (m.opacity = alpha * 0.95))
    const visible = alpha > 0.001
    meshes.current.forEach((m) => m && (m.visible = visible))
    if (!visible) return

    for (let i = 0; i < count; i++) {
      const it = layout[i]
      const e1 = smooth(v, 0.6 + it.delay, 0.7 + it.delay)
      const e2 = smooth(v, 0.74 + it.delay, 0.9 + it.delay * 0.5)
      _p.copy(it.screen).lerp(it.cloud, e1).lerp(it.archive, e2)
      _q.copy(_id).slerp(it.cloudRot, e1).slerp(it.archiveRot, e2)
      if (ob > 0.001) {
        const a = it.ringAngle + time * it.speed
        _o.set(Math.cos(a) * it.ringRadius, it.ringLift, Math.sin(a) * it.ringRadius).applyEuler(RING_TILT[it.ring])
        _p.lerp(_o, ob)
        _qo.copy(camera.quaternion)
        _q.slerp(_qo, ob)
      }
      const sc = lerp(0.14, it.size, e1) * lerp(1, 0.8, ob)
      _s.set(sc, sc * it.aspect / 0.75, sc)
      _m.compose(_p, _q, _s)
      const mesh = meshes.current[i % FRAGMENT_KINDS]
      mesh.setMatrixAt(Math.floor(i / FRAGMENT_KINDS), _m)
    }
    meshes.current.forEach((m) => (m.instanceMatrix.needsUpdate = true))
  })

  return (
    <group>
      {materials.map((mat, k) => (
        <instancedMesh key={k} ref={(el) => (meshes.current[k] = el)} args={[geo, mat, perKind]} frustumCulled={false} />
      ))}
    </group>
  )
}
