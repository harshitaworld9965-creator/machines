import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Phone } from './Phone'
import { AimedSpot } from '../../stage/AimedSpot'
import { MemoryFragments } from './MemoryFragments'
import { ArchiveStructure } from './ArchiveStructure'
import { makeWindowTexture } from './textures'
import { progress, input, getRoom, leaving } from '../../experience/store'
import { PHONE_ORIGIN } from '../../stage/world'
import { smooth, damp, lerp } from '../../stage/math'

const TAU = Math.PI * 2
// Where the phone waits among the other artifacts before it separates from the collection.
const WAITING = new THREE.Vector3(3.0, 1.4, 8)
const WINDOW_AT = new THREE.Vector3(2.6, 2.3, 4.2)

function phoneYaw(p, v) {
  // prologue: drifting, slightly turned; arrives showing its back
  if (v <= 0) return lerp(Math.PI + 0.85, Math.PI, smooth(p, 0.5, 0.9))
  // vesper: back -> three-quarter -> front -> square to the archive
  let y = Math.PI
  y = lerp(y, TAU - 0.75, smooth(v, 0.4, 0.5))
  y = lerp(y, TAU - 0.12, smooth(v, 0.5, 0.6))
  y = lerp(y, TAU, smooth(v, 0.7, 0.8))
  return y
}

export function VesperScene({ quality }) {
  const room = useRef()
  const phone = useRef()
  const screenMat = useRef()
  const glow = useRef()
  const glint = useRef()
  const win = useRef()
  const rot = useRef({ y: Math.PI + 0.85, x: 0 })
  const windowTex = useMemo(() => makeWindowTexture(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const p = progress.prologue
    const v = progress.vesper
    const q = leaving('vesper')
    const t = state.clock.elapsedTime
    room.current.visible = getRoom() === 'vesper'

    // position: separates from the collection, then becomes the axis
    const sep = smooth(p, 0.5, 0.88)
    tmp.copy(WAITING).lerp(new THREE.Vector3(0, 0, 0), sep)
    tmp.y += Math.sin(t * 0.7) * 0.06 * (1 - smooth(v, 0, 0.08)) + Math.sin(t * 0.35) * 0.04 * smooth(v, 0.8, 1)
    phone.current.position.copy(tmp)

    // rotation: choreographed yaw + the visitor's drag inside a controlled range
    const handsOn = smooth(v, 0.55, 0.6) * (1 - smooth(q, 0.05, 0.25))
    const goalY = phoneYaw(p, v) + input.rotY * handsOn
    const goalX = (v <= 0 ? 0.12 * (1 - sep) : 0) + input.rotX * handsOn
    rot.current.y = lerp(rot.current.y, goalY, damp(6, dt))
    rot.current.x = lerp(rot.current.x, goalX, damp(6, dt))
    phone.current.rotation.set(rot.current.x, rot.current.y, v <= 0 ? 0.08 * (1 - sep) : 0)

    // display wakes as it turns towards us
    const on = smooth(v, 0.45, 0.56)
    screenMat.current.color.setScalar(on * 1.05)
    glow.current.intensity = on * 6

    // fig. 1: a light sweeps across the lenses during the macro
    const macro = 1 - smooth(v, 0.22, 0.32)
    glint.current.intensity = v > 0 || p > 0.85 ? macro * 1.6 : 0
    glint.current.position.set(-0.4 + Math.sin(v * 18) * 0.6, 1.5, 1.1)

    // the archival window
    const wIn = smooth(v, 0.86, 0.94)
    const grow = smooth(q, 0.05, 0.5)
    win.current.visible = wIn > 0.001
    win.current.material.opacity = wIn
    win.current.scale.setScalar(lerp(1, 9.5, grow * grow))
    win.current.position.copy(WINDOW_AT)
    tmp.copy(state.camera.position).sub(room.current.position)
    win.current.lookAt(tmp.lerp(new THREE.Vector3(WINDOW_AT.x, WINDOW_AT.y, WINDOW_AT.z + 10), 1 - grow))
  })

  return (
    <group ref={room} position={PHONE_ORIGIN}>
      <AimedSpot position={[-4, 6, 6]} angle={0.5} penumbra={0.9} intensity={280} color="#f2d6cf" distance={30} />
      <AimedSpot position={[5, 2, -5]} angle={0.6} penumbra={1} intensity={220} color="#E7A7A0" distance={22} />
      <AimedSpot position={[-4, 1, -4]} angle={0.7} penumbra={1} intensity={160} color="#b9a4d6" distance={20} />
      <pointLight position={[0, -3, 3]} intensity={14} color="#7a4d7a" distance={12} />
      <pointLight ref={glint} intensity={0} color="#fff1e6" distance={3} decay={1.5} />
      <pointLight ref={glow} position={[0, 0, 1.6]} intensity={0} color="#E7A7A0" distance={7} />

      <Phone ref={phone} screenMaterialRef={screenMat} />
      <MemoryFragments perKind={quality === 'low' ? 8 : 12} />
      <ArchiveStructure />

      <mesh ref={win} visible={false}>
        <planeGeometry args={[0.9, 1.2]} />
        <meshBasicMaterial map={windowTex} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
