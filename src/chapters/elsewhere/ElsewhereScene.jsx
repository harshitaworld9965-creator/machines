import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Television } from '../../devices/Placeholders'
import { progress, getUI, leaving } from '../../experience/store'
import { useRoom, roomOrigin } from '../../stage/room'
import { seeded, smooth, lerp } from '../../stage/math'

/**
 * EXHIBIT 008: ELSEWHERE. An impossible cinema.
 * Signature: the longest push in the building, straight through the screen into layered worlds,
 * then back out to find them all inside an ordinary television.
 * Three original channels, drawn live: Midnight Ocean, Cloud City, Labyrinth.
 */

export const CHANNELS = ['Midnight Ocean', 'Cloud City', 'Labyrinth']
const W = 512
const H = 288

function paintChannel(g, ch, t) {
  if (ch === 0) {
    const sky = g.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, '#050a1e')
    sky.addColorStop(1, '#16305a')
    g.fillStyle = sky
    g.fillRect(0, 0, W, H)
    g.fillStyle = '#f4f7ff'
    g.beginPath()
    g.arc(380, 70, 26, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = 'rgba(244,247,255,0.15)'
    g.fillRect(372, 150, 16, 140)
    for (let k = 0; k < 12; k++) {
      g.strokeStyle = `rgba(160,190,255,${0.15 + k * 0.05})`
      g.lineWidth = 1 + k * 0.25
      g.beginPath()
      for (let x = 0; x <= W; x += 8) g.lineTo(x, 160 + k * 11 + Math.sin(x * 0.03 + t * (0.6 + k * 0.08) + k) * (3 + k * 0.6))
      g.stroke()
    }
  } else if (ch === 1) {
    const sky = g.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, '#f6b38c')
    sky.addColorStop(1, '#f7e4c8')
    g.fillStyle = sky
    g.fillRect(0, 0, W, H)
    for (let k = 0; k < 5; k++) {
      const x = ((k * 130 + t * 12) % (W + 160)) - 80
      const y = 120 + (k % 3) * 40 + Math.sin(t * 0.7 + k) * 6
      g.fillStyle = 'rgba(255,255,255,0.9)'
      g.beginPath()
      g.ellipse(x, y + 30, 70, 16, 0, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#6a4a6e'
      for (let b = 0; b < 3; b++) g.fillRect(x - 30 + b * 22, y - 30 - b * 18 - (k % 2) * 20, 16, 60 + b * 18 + (k % 2) * 20)
    }
  } else {
    g.fillStyle = '#2b1d10'
    g.fillRect(0, 0, W, H)
    const off = (t * 30) % 48
    g.strokeStyle = '#d9a65a'
    g.lineWidth = 3
    const r = seeded(9)
    for (let y = -48; y < H + 48; y += 48)
      for (let x = 0; x < W; x += 48) {
        const vert = r() > 0.5
        g.beginPath()
        g.moveTo(x, y + off)
        g.lineTo(vert ? x : x + 48, vert ? y + 48 + off : y + off)
        g.stroke()
      }
    g.fillStyle = '#f4f7ff'
    g.beginPath()
    g.arc(W / 2 + Math.sin(t) * 40, H / 2, 6, 0, Math.PI * 2)
    g.fill()
  }
}

function paintStatic(g) {
  const img = g.createImageData(W / 4, H / 4)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  g.drawImage(g.canvas, 0, 0, W / 4, H / 4, 0, 0, W, H)
}

// depth layers of each world, seen once the camera is through the screen
function layerTexture(ch, depth) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const g = c.getContext('2d')
  const r = seeded(ch * 10 + depth)
  if (ch === 0) {
    g.fillStyle = ['#1d3f78', '#16305a', '#0d1c3a'][depth]
    g.beginPath()
    g.moveTo(0, 512)
    for (let x = 0; x <= 1024; x += 16) g.lineTo(x, 330 + depth * 40 + Math.sin(x * 0.01 + depth) * (30 + depth * 15))
    g.lineTo(1024, 512)
    g.fill()
    if (depth === 2) {
      g.fillStyle = '#f4f7ff'
      g.beginPath()
      g.arc(760, 120, 60, 0, Math.PI * 2)
      g.fill()
    }
  } else if (ch === 1) {
    for (let k = 0; k < 6 - depth; k++) {
      const x = r() * 1000
      const y = 160 + r() * 260
      g.fillStyle = ['rgba(255,255,255,0.95)', 'rgba(255,240,230,0.8)', 'rgba(255,230,220,0.6)'][depth]
      g.beginPath()
      g.ellipse(x, y + 60, 150 - depth * 30, 34, 0, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = ['#5a3c60', '#7a5a7e', '#9b7f9e'][depth]
      for (let b = 0; b < 4; b++) g.fillRect(x - 60 + b * 34, y - 80 - b * 30, 26, 140 + b * 30)
    }
  } else {
    g.strokeStyle = ['#e8b66a', '#b98a46', '#7a5a2c'][depth]
    g.lineWidth = 18 - depth * 5
    for (let k = 0; k < 14; k++) {
      const x = r() * 1024
      const y = r() * 512
      g.strokeRect(x, y, 80 + r() * 200, 80 + r() * 200)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function ElsewhereScene() {
  const root = useRoom('elsewhere')
  const tv = useRef()
  const screenMat = useRef()
  const dome = useRef()
  const layers = useRef()
  const point = useRef()
  const chan = useRef({ current: 0, staticUntil: 0, last: 0 })
  const { ctx, tex } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return { ctx: c.getContext('2d'), tex: t }
  }, [])
  const layerMaps = useMemo(() => [0, 1, 2].map((ch) => [0, 1, 2].map((d) => layerTexture(ch, d))), [])

  useFrame((state) => {
    const a = progress.elsewhere
    const out = leaving('elsewhere')
    const time = state.clock.elapsedTime
    const want = getUI().channel
    const st = chan.current
    if (want !== st.current) {
      st.current = want
      st.staticUntil = time + 0.35
      layers.current.children.forEach((m, d) => (m.material.map = layerMaps[want][d]))
    }
    if (time - st.last > 1 / 30) {
      if (time < st.staticUntil) paintStatic(ctx)
      else paintChannel(ctx, st.current, time)
      tex.needsUpdate = true
      st.last = time
    }

    // the display spills past its frame and becomes the room
    const spill = smooth(a, 0.36, 0.5) * (1 - smooth(a, 0.86, 0.96))
    dome.current.visible = spill > 0.01
    dome.current.material.opacity = spill * 0.55
    dome.current.scale.setScalar(lerp(0.4, 1, spill))

    // the worlds behind the screen
    const inside = smooth(a, 0.52, 0.6) * (1 - smooth(a, 0.82, 0.88))
    layers.current.visible = inside > 0.01
    layers.current.children.forEach((m) => (m.material.opacity = inside))

    // the whole universe collapses into one luminous point
    const c = smooth(out * 2, 0.1, 0.8)
    screenMat.current.color.setScalar(1 - c * 0.9)
    tv.current.scale.setScalar(1 - c * 0.98)
    point.current.visible = c > 0.01
    point.current.scale.setScalar(0.06 + Math.sin(time * 6) * 0.01)
  })

  return (
    <group ref={root} position={roomOrigin('elsewhere')} visible={false}>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 1.8, 3]} intensity={18} color="#dbe4ff" distance={14} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#2a080d" roughness={0.9} />
      </mesh>

      <group ref={tv} position={[0, 1.8, 0]}>
        <Television screenRef={screenMat} screenMap={tex} />
      </group>

      {/* the picture, everywhere */}
      <mesh ref={dome} position={[0, 1.8, 0]} visible={false}>
        <cylinderGeometry args={[30, 30, 34, 64, 1, true, Math.PI * 0.55, Math.PI * 0.9]} />
        <meshBasicMaterial map={tex} side={THREE.BackSide} transparent opacity={0} toneMapped={false} depthWrite={false} fog={false} />
      </mesh>

      <group ref={layers} visible={false}>
        {[0, 1, 2].map((d) => (
          <mesh key={d} position={[0, 2 + d * 1.5, -12 - d * 14]}>
            <planeGeometry args={[40 + d * 20, 20 + d * 10]} />
            <meshBasicMaterial map={layerMaps[0][d]} transparent opacity={0} toneMapped={false} depthWrite={false} fog={false} />
          </mesh>
        ))}
      </group>

      <mesh ref={point} position={[0, 1.8, 0.1]} visible={false}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#f4f7ff" toneMapped={false} fog={false} />
      </mesh>
    </group>
  )
}
