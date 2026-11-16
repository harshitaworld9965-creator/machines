import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mouse } from '../../devices/Placeholders'
import { AimedSpot } from '../../stage/AimedSpot'
import { progress } from '../../experience/store'
import { useRoom, roomOrigin } from '../../stage/room'
import { smooth } from '../../stage/math'

/**
 * EXHIBIT 005: TOAD. Lit and filmed like a supercar, on a cream turntable.
 * The playground (a 2D physics world) takes over in the second half; see ToadPlayground.jsx.
 */
export function ToadScene() {
  const root = useRoom('toad')
  const mouse = useRef()
  const table = useRef()

  useFrame((state, dt) => {
    const a = progress.toad
    const spin = 1 - smooth(a, 0.42, 0.52)
    table.current.rotation.y += dt * 0.25 * spin
    mouse.current.position.y = 0.02 + Math.sin(state.clock.elapsedTime * 1.4) * 0.006
  })

  return (
    <group ref={root} position={roomOrigin('toad')} visible={false}>
      <hemisphereLight args={['#fffaf0', '#cfc4a6', 1.1]} />
      <AimedSpot at={[0, 0.2, 0]} position={[-3, 5, 2]} angle={0.35} penumbra={0.6} intensity={160} color="#fff6e0" distance={14} />
      <AimedSpot at={[0, 0.2, 0]} position={[3, 1.2, -3]} angle={0.5} penumbra={1} intensity={90} color="#9bd28f" distance={10} />

      <group ref={table}>
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[1.2, 1.25, 0.06, 96]} />
          <meshStandardMaterial color="#e6dcc0" roughness={0.35} metalness={0.1} />
        </mesh>
        <group ref={mouse}>
          <Mouse />
        </group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#F1E9D2" roughness={1} />
      </mesh>
    </group>
  )
}
