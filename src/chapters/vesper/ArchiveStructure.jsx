import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { progress, leaving } from '../../experience/store'
import { smooth } from '../../stage/math'

// Hairline shelving: rings and uprights that appear as the fragments are shelved.
export function ArchiveStructure({ color = '#E7A7A0' }) {
  const ref = useRef()
  const geometry = useMemo(() => {
    const pts = []
    const radii = [4.25, 5.95]
    for (let row = 0; row < 12; row++) {
      const y = -6.9 + row * 1.45
      radii.forEach((r) => {
        const n = 96
        for (let i = 0; i < n; i++) {
          const a0 = (i / n) * Math.PI * 2
          const a1 = ((i + 1) / n) * Math.PI * 2
          pts.push(Math.sin(a0) * r, y, Math.cos(a0) * r, Math.sin(a1) * r, y, Math.cos(a1) * r)
        }
      })
    }
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2
      const r = i % 2 ? 5.95 : 4.25
      pts.push(Math.sin(a) * r, -14, Math.cos(a) * r, Math.sin(a) * r, 16, Math.cos(a) * r)
    }
    // the axis: a single line running through the phone
    pts.push(0, -16, 0, 0, -1.9, 0, 0, 1.9, 0, 0, 18, 0)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])

  useFrame(() => {
    const a = smooth(progress.vesper, 0.76, 0.94) * (1 - smooth(leaving('vesper'), 0.3, 0.5))
    ref.current.material.opacity = a * 0.22
    ref.current.visible = a > 0.001
    ref.current.scale.y = 0.6 + 0.4 * a
  })

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </lineSegments>
  )
}
