import { forwardRef, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { roundedRectGeometry } from '../stage/geometry'

/**
 * PROVISIONAL placeholder devices. None of these is verified against the owner's hardware:
 * proportions are generic, there are no logos, and ports or buttons are deliberately left out.
 * Each one is a self-contained component, so a verified glTF model can replace it one-for-one.
 * See src/data/manifest.json.
 */

/** Laptop with a hinged lid. `lidRef` rotates on X: 0 = closed, about -1.85 = open. */
export const Laptop = forwardRef(function Laptop(
  { w = 1.7, d = 1.18, color = '#cfccc6', metalness = 0.55, roughness = 0.34, lidRef, screenRef, screenMap },
  ref
) {
  const screenGeo = useMemo(() => roundedRectGeometry(w * 0.9, d * 0.86, 0.025), [w, d])
  return (
    <group ref={ref}>
      <RoundedBox args={[w, 0.042, d]} radius={0.018} smoothness={4} position={[0, 0.021, 0]}>
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </RoundedBox>
      {/* keyboard well: a darker field, no keys drawn (layout unverified) */}
      <mesh position={[0, 0.0425, -0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.82, d * 0.42]} />
        <meshStandardMaterial color="#2b2a29" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.0425, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.3, d * 0.22]} />
        <meshStandardMaterial color={color} metalness={metalness * 0.8} roughness={roughness + 0.1} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group ref={lidRef} position={[0, 0.045, -d / 2]}>
        <RoundedBox args={[w, 0.03, d]} radius={0.012} smoothness={4} position={[0, 0.015, d / 2]}>
          <meshStandardMaterial color={color} metalness={metalness} roughness={roughness - 0.04} />
        </RoundedBox>
        <mesh geometry={screenGeo} position={[0, -0.001, d / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial ref={screenRef} map={screenMap} color="#000000" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
})

/** Tablet slab, 16:10, screen on +z. */
export const Tablet = forwardRef(function Tablet({ w = 2.6, h = 1.62, depth = 0.07, color = '#5b6070', screenRef, screenMap }, ref) {
  const screenGeo = useMemo(() => roundedRectGeometry(w - 0.12, h - 0.12, 0.05), [w, h])
  const backGeo = useMemo(() => roundedRectGeometry(w - 0.02, h - 0.02, 0.1), [w, h])
  return (
    <group ref={ref}>
      <RoundedBox args={[w, h, depth]} radius={0.03} smoothness={5}>
        <meshStandardMaterial color="#3a3d46" metalness={0.8} roughness={0.35} />
      </RoundedBox>
      <mesh geometry={backGeo} position={[0, 0, -depth / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh geometry={screenGeo} position={[0, 0, depth / 2 + 0.002]}>
        <meshBasicMaterial ref={screenRef} map={screenMap} color="#000000" toneMapped={false} />
      </mesh>
    </group>
  )
})

/** Wireless mouse: a soft pebble with a wheel and a seam. */
export const Mouse = forwardRef(function Mouse({ color = '#2d3a2c' }, ref) {
  const mats = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.25 }),
      wheel: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.6 }),
    }),
    [color]
  )
  return (
    <group ref={ref}>
      <mesh material={mats.body} scale={[0.36, 0.2, 0.6]} position={[0, 0.17, 0]}>
        <sphereGeometry args={[1, 64, 40]} />
      </mesh>
      <mesh material={mats.wheel} position={[0, 0.36, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 24]} />
      </mesh>
    </group>
  )
})

/** Earbuds charging case with a lid, and two buds. */
export const BudsCase = forwardRef(function BudsCase({ color = '#e9e6e0', lidRef, budsRef }, ref) {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2 }), [color])
  const budMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, clearcoat: 0.8 }), [color])
  const tip = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a4844', roughness: 0.9 }), [])
  return (
    <group ref={ref}>
      <RoundedBox args={[0.66, 0.34, 0.3]} radius={0.12} smoothness={6} position={[0, 0.17, 0]} material={mat} />
      <group ref={lidRef} position={[0, 0.34, -0.15]}>
        <RoundedBox args={[0.66, 0.16, 0.3]} radius={0.075} smoothness={6} position={[0, 0.06, 0.15]} material={mat} />
      </group>
      <group ref={budsRef}>
        {[-0.15, 0.15].map((x, i) => (
          <group key={i} position={[x, 0.3, 0]} rotation={[0, 0, i ? -0.2 : 0.2]}>
            <mesh material={budMat} position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.075, 32, 24]} />
            </mesh>
            <mesh material={tip} position={[0, 0.1, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.04, 0.05, 20]} />
            </mesh>
            <mesh material={budMat} position={[0, -0.02, 0]}>
              <capsuleGeometry args={[0.025, 0.16, 6, 12]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
})

/** Round smartwatch: face on +z, strap running along Y. */
export const Watch = forwardRef(function Watch({ faceRef, faceMap, bezel = '#2a2a2a', strap = '#1b1b1b' }, ref) {
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 0.2, 96]} />
        <meshStandardMaterial color="#3b3b3b" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.1]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.62, 0.04, 16, 96]} />
        <meshStandardMaterial color={bezel} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.101]}>
        <circleGeometry args={[0.58, 96]} />
        <meshBasicMaterial ref={faceRef} map={faceMap} toneMapped={false} />
      </mesh>
      <mesh position={[0.7, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.09, 24]} />
        <meshStandardMaterial color="#4a4a4a" metalness={1} roughness={0.3} />
      </mesh>
      {[1, -1].map((s) => (
        <RoundedBox key={s} args={[0.62, 1.5, 0.12]} radius={0.05} position={[0, s * 1.25, -0.03]}>
          <meshStandardMaterial color={strap} roughness={0.85} />
        </RoundedBox>
      ))}
    </group>
  )
})

/** Television: thin frame on two feet, screen on +z. Stand configuration unverified. */
export const Television = forwardRef(function Television({ w = 4.8, h = 2.75, screenRef, screenMap }, ref) {
  return (
    <group ref={ref}>
      <RoundedBox args={[w, h, 0.08]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#141414" metalness={0.6} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[w - 0.06, h - 0.06]} />
        <meshBasicMaterial ref={screenRef} map={screenMap} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.5), -h / 2 - 0.16, 0.05]} rotation={[0, 0, s * 0.35]}>
          <boxGeometry args={[0.05, 0.36, 0.34]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
})
