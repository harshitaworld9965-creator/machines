import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { progress, frame, getRoom } from '../experience/store'
import { rooms, site } from '../data/exhibits'
import { smooth, damp } from './math'

// Background and fog follow the room on screen. A room may ask for a different colour
// through frame.bg (Nova's worlds, Hush's noise cancellation); it is eased, never cut.
export function Atmosphere() {
  const scene = useThree((s) => s.scene)
  const gl = useThree((s) => s.gl)
  const ink = useMemo(() => new THREE.Color(site.base.ink), [])
  const target = useMemo(() => new THREE.Color(), [])
  const current = useRef(null)
  const lastRoom = useRef(null)

  useMemo(() => {
    scene.background = new THREE.Color(site.base.ink)
    scene.fog = new THREE.Fog(site.base.ink, 10, 70)
  }, [scene])

  useFrame((_, dt) => {
    const room = getRoom()
    const r = rooms[room]
    if (room === 'vesper') {
      target.copy(ink).lerp(new THREE.Color(r.bg), smooth(progress.vesper, 0.05, 0.4))
      const inPrologue = progress.vesper <= 0
      scene.fog.near = inPrologue ? 6 + progress.prologue * 4 : r.fog[0]
      scene.fog.far = inPrologue ? 46 + progress.prologue * 18 : r.fog[1]
    } else {
      target.set(frame.bg && frame.bgRoom === room ? frame.bg : r.bg)
      scene.fog.near = r.fog[0]
      scene.fog.far = r.fog[1]
    }
    if (!current.current || lastRoom.current !== room) {
      current.current = target.clone()
      lastRoom.current = room
    } else {
      current.current.lerp(target, damp(room === 'vesper' ? 30 : 2.5, dt))
    }
    scene.background.copy(current.current)
    scene.fog.color.copy(current.current)
    gl.toneMappingExposure = 1.05
  })
  return null
}
