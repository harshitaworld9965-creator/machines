import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import monoFont from '@fontsource/martian-mono/files/martian-mono-latin-400-normal.woff?url'
import { Watch } from '../../devices/Placeholders'
import { AimedSpot } from '../../stage/AimedSpot'
import { progress, getUI, frame } from '../../experience/store'
import { useRoom, roomOrigin, drivePortal } from '../../stage/room'
import { portalAnchor } from '../../stage/cameras'
import { smooth, damp, lerp } from '../../stage/math'

/**
 * EXHIBIT 007: MOXIE. A kinetic timekeeping laboratory.
 * Signature: metronomic. The camera ticks (see cameras.js), the rings step with the seconds,
 * and the watch appears to drive the whole room. Four face concepts each re-tune the face,
 * the ring colours, their tilt and how they move. Times shown are the visitor's own clock;
 * no fitness data is shown, real or invented.
 */

export const FACES = ['Analogue', 'Digital', 'Orbit', 'Bold']
const YELLOW = '#F5C400'
const FACE_ENV = [
  { ring: YELLOW, tilt: 0, step: false, bg: '#0E0E0E' },
  { ring: '#f2f2f2', tilt: 0, step: true, bg: '#101013' },
  { ring: '#ff6a2e', tilt: 1, step: false, bg: '#120a06' },
  { ring: YELLOW, tilt: 0.35, step: true, bg: '#0E0E0E' },
]
const RINGS = [1.25, 1.9, 2.7, 3.6, 4.7, 6.0, 7.6]

function drawFace(g, face, now) {
  const S = 512
  const c = S / 2
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds() + now.getMilliseconds() / 1000
  g.fillStyle = '#0b0b0b'
  g.fillRect(0, 0, S, S)
  g.save()
  g.translate(c, c)
  if (face === 0) {
    for (let i = 0; i < 60; i++) {
      g.save()
      g.rotate((i / 60) * Math.PI * 2)
      g.fillStyle = i % 5 ? '#555' : YELLOW
      g.fillRect(-1.5, -230, 3, i % 5 ? 14 : 30)
      g.restore()
    }
    const hand = (ang, len, w, col) => {
      g.save()
      g.rotate(ang)
      g.fillStyle = col
      g.fillRect(-w / 2, -len, w, len + 20)
      g.restore()
    }
    hand(((h % 12) + m / 60) * (Math.PI / 6), 120, 14, '#f4f4f4')
    hand((m + s / 60) * (Math.PI / 30), 185, 9, '#f4f4f4')
    hand(s * (Math.PI / 30), 205, 3, YELLOW)
    g.fillStyle = YELLOW
    g.beginPath()
    g.arc(0, 0, 10, 0, Math.PI * 2)
    g.fill()
  } else if (face === 1) {
    g.fillStyle = '#f4f4f4'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '400 150px "Martian Mono", monospace'
    g.fillText(String(h).padStart(2, '0'), 0, -70)
    g.fillStyle = YELLOW
    g.fillText(String(m).padStart(2, '0'), 0, 80)
    g.fillStyle = '#777'
    g.font = '400 26px "Martian Mono", monospace'
    g.fillText(String(Math.floor(s)).padStart(2, '0'), 150, 180)
  } else if (face === 2) {
    ;[200, 150, 100].forEach((r, k) => {
      g.strokeStyle = '#333'
      g.lineWidth = 2
      g.beginPath()
      g.arc(0, 0, r, 0, Math.PI * 2)
      g.stroke()
      const ang = [s / 60, (m + s / 60) / 60, ((h % 12) + m / 60) / 12][k] * Math.PI * 2 - Math.PI / 2
      g.fillStyle = ['#ff6a2e', '#f4f4f4', YELLOW][k]
      g.beginPath()
      g.arc(Math.cos(ang) * r, Math.sin(ang) * r, [14, 18, 22][k], 0, Math.PI * 2)
      g.fill()
    })
  } else {
    g.fillStyle = YELLOW
    g.fillRect(-256, -256, 512, 512)
    g.fillStyle = '#0b0b0b'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '400 210px Gloock, serif'
    g.fillText(String(h % 12 || 12), 0, -40)
    g.font = '500 30px "Martian Mono", monospace'
    g.fillText(`${String(m).padStart(2, '0')} · STAND UP`, 0, 130)
  }
  g.restore()
}

export function MoxieScene() {
  const root = useRoom('moxie')
  const watch = useRef()
  const rings = useRef([])
  const ringGroup = useRef()
  const markers = useRef()
  const numbers = useRef()
  const portal = useRef()
  const lastDraw = useRef(0)
  const tiltBlend = useRef(0)
  const colour = useMemo(() => new THREE.Color(YELLOW), [])
  const tmpC = useMemo(() => new THREE.Color(), [])
  const { canvas, ctx, tex } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 512
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return { canvas: c, ctx: c.getContext('2d'), tex: t }
  }, [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(1, 1, 1), [])

  useFrame((state, dt) => {
    const a = progress.moxie
    const face = getUI().face
    const env = FACE_ENV[face]
    const now = new Date()
    const sec = now.getSeconds() + (env.step ? 0 : now.getMilliseconds() / 1000)

    // redraw the face ten times a second
    if (state.clock.elapsedTime - lastDraw.current > 0.1 || lastDraw.current === 0) {
      drawFace(ctx, face, now)
      tex.needsUpdate = true
      lastDraw.current = state.clock.elapsedTime
    }

    frame.bgRoom = 'moxie'
    frame.bg = env.bg

    // the dial becomes architecture: rings expand out of the bezel
    const expand = smooth(a, 0.3, 0.52)
    tiltBlend.current = lerp(tiltBlend.current, env.tilt, damp(2.5, dt))
    colour.lerp(tmpC.set(env.ring), damp(3, dt))
    rings.current.forEach((r, i) => {
      if (!r) return
      const k = smooth(expand * 1.4 - i * 0.06, 0, 1)
      r.visible = k > 0.01
      r.scale.setScalar(lerp(0.52 / RINGS[i], 1, k))
      const dir = i % 2 ? -1 : 1
      // the watch drives the room: every ring is geared to the seconds
      r.rotation.z = dir * (sec / 60) * Math.PI * 2 * (1 + i * 0.35)
      r.rotation.x = tiltBlend.current * (i % 2 ? 0.9 : -0.7) * (0.3 + i * 0.12) + Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.04 * tiltBlend.current
      r.material.color.copy(colour)
      r.material.opacity = (0.25 + 0.6 * (1 - i / RINGS.length)) * k
    })

    // markers and kinetic numbers
    const mk = smooth(a, 0.55, 0.7)
    markers.current.visible = mk > 0.01
    for (let i = 0; i < 60; i++) {
      const ang = (i / 60) * Math.PI * 2 - (sec / 60) * Math.PI * 2 * (env.step ? 1 : 1)
      const r = RINGS[5] + (i % 5 === 0 ? 0.35 : 0)
      v.set(Math.cos(ang) * r, Math.sin(ang) * r, 0)
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), ang)
      const big = i % 5 === 0
      sc.set(big ? 0.5 : 0.22, 0.05, 0.05).multiplyScalar(mk)
      markers.current.setMatrixAt(i, m.compose(v, q, sc))
    }
    markers.current.instanceMatrix.needsUpdate = true
    markers.current.material.color.copy(colour)
    numbers.current.visible = mk > 0.01
    numbers.current.rotation.z = -(sec / 60) * Math.PI * 2 * 0.25
    numbers.current.scale.setScalar(lerp(0.6, 1, mk))

    ringGroup.current.rotation.x = smooth(a, 0.45, 0.6) * -0.5
    watch.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.12 * smooth(a, 0.8, 1)
    watch.current.position.y = smooth(a, 0.8, 1) * 0.4

    // the dial opens into an aperture
    if (portal.current) drivePortal(portal.current, 'moxie', state.camera, portalAnchor.moxie, [0.05, 0.05])
  })

  return (
    <group ref={root} position={roomOrigin('moxie')} visible={false}>
      <ambientLight intensity={0.25} />
      <AimedSpot at={[0, 0, 0]} position={[2, 4, 5]} angle={0.5} penumbra={0.8} intensity={120} color="#ffffff" distance={20} />
      <pointLight position={[-3, -2, 2]} intensity={20} color={YELLOW} distance={10} />

      <group ref={watch}>
        <Watch faceMap={tex} />
      </group>

      <group ref={ringGroup}>
        {RINGS.map((r, i) => (
          <mesh key={r} ref={(el) => (rings.current[i] = el)} visible={false}>
            <torusGeometry args={[r, i === 3 ? 0.05 : 0.018, 8, 200, i % 3 === 0 ? Math.PI * 1.7 : Math.PI * 2]} />
            <meshBasicMaterial color={YELLOW} transparent opacity={0} toneMapped={false} />
          </mesh>
        ))}
        <instancedMesh ref={markers} args={[null, null, 60]} frustumCulled={false} visible={false}>
          <boxGeometry />
          <meshBasicMaterial color={YELLOW} toneMapped={false} />
        </instancedMesh>
        <group ref={numbers} visible={false}>
          {Array.from({ length: 12 }, (_, i) => {
            const ang = (i / 12) * Math.PI * 2
            const r = RINGS[6] + 0.7
            return (
              <Text key={i} font={monoFont} fontSize={0.42} color="#f4f4f4" position={[Math.sin(ang) * r, Math.cos(ang) * r, 0]} rotation={[0, 0, -ang]} anchorX="center" anchorY="middle">
                {String(i * 5).padStart(2, '0')}
              </Text>
            )
          })}
        </group>
      </group>

      <mesh ref={portal} visible={false}>
        <circleGeometry args={[0.5, 64]} />
        <meshBasicMaterial color="#120305" toneMapped={false} fog={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
