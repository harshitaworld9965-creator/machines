// Where each room sits in the shared world, and the camera choreography for each one.
// Camera keys are relative to the room's origin.

export const PHONE_ORIGIN = [0, 0, -40]

// Phone size in world units: 163.3 x 77.9 x 8.9 mm scaled so height = 3.2
export const PHONE = { h: 3.2, w: 3.2 * (77.9 / 163.3), d: 3.2 * (8.9 / 163.3) }

// The middle rear lens, seen from behind (phone rotated by PI). World-space offset from PHONE_ORIGIN.
const LENS = [-0.4, 0.94, 0.18]

export const prologueKeys = [
  { t: 0.0, pos: [0, 1.6, 60], look: [0, 1.2, 20], fov: 42 },
  { t: 0.3, pos: [0.6, 1.3, 46], look: [0, 1.0, 10], fov: 40 },
  { t: 0.58, pos: [-0.8, 1.1, 28], look: [0, 0.6, 0], fov: 38 },
  { t: 0.8, pos: [0.4, 0.9, 11], look: [0, 0.4, 0], fov: 34 },
  { t: 0.92, pos: [0.1, 1.0, 4.0], look: [-0.2, 0.9, 0], fov: 32 },
  { t: 1.0, pos: [LENS[0] + 0.2, LENS[1] + 0.1, 0.95], look: LENS, fov: 30 },
]
// Note: prologue keys z values are relative to PHONE_ORIGIN as well (camera starts 58 units in front).

export const vesperKeys = [
  { t: 0.0, pos: [LENS[0] + 0.2, LENS[1] + 0.1, 0.95], look: LENS, fov: 30 },
  { t: 0.12, pos: [LENS[0] + 0.05, LENS[1] + 0.02, 0.62], look: LENS, fov: 26 },
  { t: 0.3, pos: [-0.2, 0.4, 3.4], look: [-0.15, 0.4, 0], fov: 34 },
  { t: 0.4, pos: [0, 0.05, 6.4], look: [0, 0, 0], fov: 36 },
  { t: 0.5, pos: [1.9, 0.5, 5.6], look: [0, 0.05, 0], fov: 36 },
  { t: 0.6, pos: [0.5, 0.2, 6.6], look: [0.25, 0.05, 0], fov: 36 },
  { t: 0.72, pos: [0, 0.5, 8.8], look: [0, 0.2, 0], fov: 40 },
  { t: 0.88, pos: [-2.6, 4.2, 15.5], look: [0, 0.9, 0], fov: 44 },
  { t: 1.0, pos: [-1.4, 3.2, 14.0], look: [0, 1.0, 0], fov: 44 },
]

// Passage: camera pushes towards the window fragment (masked cut at 0.5).
export const passageKeys = [
  { t: 0.0, pos: [-1.4, 3.2, 14.0], look: [0, 1.0, 0], fov: 44 },
  { t: 0.5, pos: [1.6, 2.5, 8.6], look: [2.6, 2.3, 4.2], fov: 46 },
]

export const aureliusKeys = [
  { t: 0.0, pos: [0, 2.1, 13], look: [0, 0.9, 0], fov: 38 },
  { t: 0.35, pos: [0, 1.5, 8.2], look: [0, 0.75, 0], fov: 34 },
  { t: 0.7, pos: [2.6, 1.4, 6.6], look: [0, 0.7, 0], fov: 32 },
  { t: 1.0, pos: [3.6, 1.7, 7.6], look: [-1.1, 0.8, 0], fov: 32 },
]
