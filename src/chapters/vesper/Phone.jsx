import { forwardRef, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { PHONE } from '../../stage/world'
import { roundedRectGeometry } from '../../stage/geometry'
import { makeScreenTexture } from './textures'

/**
 * PROVISIONAL placeholder for Vesper (Samsung Galaxy S22 Ultra).
 * Proportions follow the public 163.3 x 77.9 x 8.9 mm outline. The rear layout follows public
 * reviews (four individually raised lenses, a laser AF window, a flush flash, no camera island).
 * Colour, case, finish and exact positions are NOT verified against the owner's phone.
 * Replace with a verified glTF model listed in src/data/manifest.json.
 */

const { w: W, h: H, d: D } = PHONE

// Rear elements in phone-local space, as seen from the back the cluster sits top-left,
// which is local +x because the back faces -z.
const LENSES = [
  { x: 0.42, y: 1.24, r: 0.135 },
  { x: 0.42, y: 0.94, r: 0.135 },
  { x: 0.42, y: 0.64, r: 0.135 },
  { x: 0.12, y: 0.94, r: 0.135 },
]
const LASER = { x: 0.12, y: 1.24, r: 0.06 }
const FLASH = { x: 0.12, y: 0.64, r: 0.045 }

export const Phone = forwardRef(function Phone({ screenMaterialRef, colour = '#3b3538' }, ref) {
  const screenTex = useMemo(() => makeScreenTexture(), [])
  const backGeo = useMemo(() => roundedRectGeometry(W - 0.02, H - 0.02, 0.07), [])
  const screenGeo = useMemo(() => roundedRectGeometry(W - 0.07, H - 0.07, 0.05), [])

  const mats = useMemo(
    () => ({
      frame: new THREE.MeshStandardMaterial({ color: '#4a4448', metalness: 1, roughness: 0.28 }),
      back: new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.42, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.5 }),
      ring: new THREE.MeshStandardMaterial({ color: '#2d282b', metalness: 1, roughness: 0.22 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#06050a', roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 0.6, iridescenceIOR: 1.6 }),
      inner: new THREE.MeshStandardMaterial({ color: '#0f0d14', metalness: 0.9, roughness: 0.3 }),
      flash: new THREE.MeshStandardMaterial({ color: '#8f887a', roughness: 0.5 }),
      hole: new THREE.MeshBasicMaterial({ color: '#000000' }),
      button: new THREE.MeshStandardMaterial({ color: '#4a4448', metalness: 1, roughness: 0.3 }),
    }),
    [colour]
  )

  return (
    <group ref={ref}>
      {/* frame */}
      <RoundedBox args={[W, H, D]} radius={0.06} smoothness={6} material={mats.frame} />
      {/* back glass */}
      <mesh geometry={backGeo} material={mats.back} position={[0, 0, -D / 2 - 0.002]} rotation={[0, Math.PI, 0]} />
      {/* display */}
      <mesh geometry={screenGeo} position={[0, 0, D / 2 + 0.002]}>
        <meshBasicMaterial ref={screenMaterialRef} map={screenTex} color="#000000" toneMapped={false} />
      </mesh>
      <mesh position={[0, H / 2 - 0.12, D / 2 + 0.004]} material={mats.hole}>
        <circleGeometry args={[0.035, 24]} />
      </mesh>

      {/* rear camera cluster */}
      {LENSES.map((l, i) => (
        <group key={i} position={[l.x, l.y, -D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh material={mats.ring} position={[0, 0.018, 0]}>
            <cylinderGeometry args={[l.r, l.r, 0.036, 48]} />
          </mesh>
          <mesh material={mats.inner} position={[0, 0.037, 0]}>
            <cylinderGeometry args={[l.r * 0.82, l.r * 0.82, 0.004, 48]} />
          </mesh>
          <mesh material={mats.glass} position={[0, 0.04, 0]}>
            <sphereGeometry args={[l.r * 0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
          </mesh>
        </group>
      ))}
      <group position={[LASER.x, LASER.y, -D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh material={mats.ring} position={[0, 0.012, 0]}>
          <cylinderGeometry args={[LASER.r, LASER.r, 0.024, 32]} />
        </mesh>
        <mesh material={mats.glass} position={[0, 0.025, 0]}>
          <cylinderGeometry args={[LASER.r * 0.7, LASER.r * 0.7, 0.003, 32]} />
        </mesh>
      </group>
      <mesh material={mats.flash} position={[FLASH.x, FLASH.y, -D / 2 - 0.004]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[FLASH.r, 24]} />
      </mesh>

      {/* side keys (placement provisional) */}
      <mesh material={mats.button} position={[W / 2 + 0.008, 0.62, 0]}>
        <boxGeometry args={[0.02, 0.42, 0.06]} />
      </mesh>
      <mesh material={mats.button} position={[W / 2 + 0.008, 0.14, 0]}>
        <boxGeometry args={[0.02, 0.2, 0.06]} />
      </mesh>
    </group>
  )
})
