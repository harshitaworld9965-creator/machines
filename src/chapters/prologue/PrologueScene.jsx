import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import monoFont from '@fontsource/martian-mono/files/martian-mono-latin-400-normal.woff?url'
import { progress, getRoom } from '../../experience/store'
import { PHONE_ORIGIN } from '../../stage/world'
import { smooth, damp, lerp } from '../../stage/math'

/**
 * PROLOGUE: THE ARCHIVE IS AWAKE
 * A long hall of monoliths. Seven unidentified artifacts hang at different depths
 * (the eighth, Vesper, is the phone in VesperScene). Deliberately abstract silhouettes.
 * When Vesper begins, the hall sinks away and the floor dissolves: the chamber transforms.
 */

const silhouetteMat = new THREE.MeshStandardMaterial({ color: '#3d342e', metalness: 0.55, roughness: 0.42 })

function Laptop({ open = 1.9 }) {
  return (
    <group>
      <RoundedBox args={[2.2, 0.07, 1.5]} radius={0.03} material={silhouetteMat} />
      <group position={[0, 0.035, -0.75]} rotation={[-(Math.PI - open), 0, 0]}>
        <RoundedBox args={[2.2, 0.05, 1.5]} radius={0.02} position={[0, 0, 0.75]} material={silhouetteMat} />
      </group>
    </group>
  )
}

const ARTIFACTS = [
  { n: '002', pos: [-3.8, 1.9, 42], rot: [0.2, 0.6, 0.1], node: <Laptop open={1.75} /> },
  { n: '003', pos: [4.2, -0.4, 36], rot: [-0.3, -0.5, 0.15], node: <Laptop open={2.2} /> },
  { n: '004', pos: [-3.2, 0.1, 25], rot: [0.1, 0.7, -0.25], node: <RoundedBox args={[2.4, 1.6, 0.07]} radius={0.03} material={silhouetteMat} /> },
  { n: '005', pos: [2.7, 2.6, 19], rot: [0.4, -0.6, 0.2], node: <mesh material={silhouetteMat} scale={[0.36, 0.2, 0.58]}><sphereGeometry args={[1, 32, 24]} /></mesh> },
  { n: '006', pos: [-2.1, -1.1, 14], rot: [0.5, 0.4, 0], node: <RoundedBox args={[0.62, 0.48, 0.26]} radius={0.12} smoothness={6} material={silhouetteMat} /> },
  { n: '007', pos: [-3.6, 1.9, 6], rot: [0.2, -0.4, 0.3], node: <mesh material={silhouetteMat} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.42, 0.42, 0.12, 48]} /></mesh> },
  { n: '008', pos: [-0.6, 4.6, -9], rot: [0, 0.15, 0], node: <RoundedBox args={[6.4, 3.7, 0.1]} radius={0.04} material={silhouetteMat} /> },
]

function Hall() {
  const columns = useRef()
  const count = 26
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1
      const z = 66 - Math.floor(i / 2) * 7
      const x = side * (8 + (Math.floor(i / 2) % 3) * 0.9)
      const h = 18 + (i % 5) * 2
      m.compose(new THREE.Vector3(x, h / 2 - 4, z), new THREE.Quaternion(), new THREE.Vector3(1.3, h, 1.3))
      columns.current.setMatrixAt(i, m)
    }
    columns.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={columns} args={[null, null, count]}>
      <boxGeometry />
      <meshStandardMaterial color="#1c1714" roughness={0.85} metalness={0.1} />
    </instancedMesh>
  )
}

export function PrologueScene() {
  const root = useRef()
  const hall = useRef()
  const floor = useRef()
  const strips = useRef()
  const lantern = useRef()
  const items = useRef([])

  useFrame((state, dt) => {
    const p = progress.prologue
    const v = progress.vesper
    const t = state.clock.elapsedTime
    const leave = smooth(v, 0.02, 0.35)
    root.current.visible = leave < 0.999 && getRoom() === 'vesper'

    // the chamber transforms: monoliths descend, the floor dissolves
    hall.current.position.y = -26 * leave * leave
    floor.current.material.opacity = 1 - leave
    strips.current.material.opacity = (0.55 + 0.45 * smooth(p, 0.1, 0.5)) * (1 - leave)

    // a lantern that travels just ahead of the camera, revealing details as we pass
    lantern.current.position.copy(state.camera.position).sub(root.current.position)
    lantern.current.position.z -= 6
    lantern.current.position.y += 1.5
    lantern.current.intensity = lerp(18, 40, smooth(p, 0, 0.4)) * (1 - leave)

    items.current.forEach((g, i) => {
      if (!g) return
      const a = ARTIFACTS[i]
      g.rotation.y = a.rot[1] + t * 0.05 * (i % 2 ? 1 : -1)
      g.position.y = a.pos[1] + Math.sin(t * 0.5 + i) * 0.08 - leave * 3
      const s = 1 - smooth(v, 0.0, 0.3)
      g.scale.setScalar(Math.max(0.001, s))
    })
  })

  return (
    <group ref={root} position={PHONE_ORIGIN}>
      <hemisphereLight args={['#6b5646', '#0c0908', 0.55]} />
      <pointLight ref={lantern} color="#f0c9a0" distance={18} decay={1.6} intensity={20} />
      <directionalLight position={[0, 10, -40]} intensity={2.2} color="#e3b998" />
      <directionalLight position={[-12, 6, 40]} intensity={0.5} color="#8d7a9a" />

      <group ref={hall}>
        <Hall />
        <mesh ref={floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 25]}>
          <planeGeometry args={[40, 120]} />
          <meshStandardMaterial color="#17120f" roughness={0.62} metalness={0.15} transparent />
        </mesh>
        <mesh ref={strips} position={[0, -3.98, 25]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.03, 120]} />
          <meshBasicMaterial color="#e9c9a0" transparent toneMapped={false} />
        </mesh>
      </group>

      {ARTIFACTS.map((a, i) => (
        <group key={a.n} ref={(el) => (items.current[i] = el)} position={a.pos} rotation={a.rot}>
          {a.node}
          <Text
            font={monoFont}
            fontSize={0.11}
            letterSpacing={0.08}
            color="#EFE8DC"
            fillOpacity={0.6}
            anchorX="center"
            position={[0, -1.25, 0]}
            rotation={[-a.rot[0], -a.rot[1], -a.rot[2]]}
          >
            {`UNIDENTIFIED / ${a.n}`}
          </Text>
        </group>
      ))}
    </group>
  )
}
