import * as THREE from 'three'

export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const smooth = (v, a, b) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const lerp = (a, b, t) => a + (b - a) * t

// Frame-rate independent damping factor
export const damp = (lambda, dt) => 1 - Math.exp(-lambda * dt)

/**
 * Camera keyframes: [{ t, pos:[x,y,z], look:[x,y,z], fov? }]
 * Returns eased interpolation between the surrounding keys.
 */
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
export function sampleKeys(keys, t, outPos, outLook) {
  let i = 0
  while (i < keys.length - 2 && t > keys[i + 1].t) i++
  const k0 = keys[i]
  const k1 = keys[Math.min(i + 1, keys.length - 1)]
  const span = k1.t - k0.t || 1
  const u = easeInOut(clamp01((t - k0.t) / span))
  outPos.copy(_a.fromArray(k0.pos)).lerp(_b.fromArray(k1.pos), u)
  outLook.copy(_a.fromArray(k0.look)).lerp(_b.fromArray(k1.look), u)
  const f0 = k0.fov ?? 40
  const f1 = k1.fov ?? 40
  return lerp(f0, f1, u)
}

// Seeded random so layouts are identical on every load.
export function seeded(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
