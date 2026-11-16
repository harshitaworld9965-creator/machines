// Camera choreography for every room, in room-local coordinates.
// Each chapter has its own camera grammar (see the storyboard); keys are { t, pos, look, fov }.
import { prologueKeys, vesperKeys } from './world'

export const chapterKeys = {
  prologue: prologueKeys,
  vesper: vesperKeys,

  // AURELIUS: almost still. A conservator's camera that moves only to look closer.
  aurelius: [
    { t: 0.0, pos: [0, 2.4, 13], look: [0, 0.8, 0], fov: 36 },
    { t: 0.1, pos: [2.2, 0.78, 1.9], look: [0, 0.66, 0], fov: 26 },
    { t: 0.22, pos: [-1.9, 1.05, 2.4], look: [0, 0.7, 0], fov: 28 },
    { t: 0.45, pos: [0, 1.6, 4.6], look: [0, 0.95, 0], fov: 32 },
    { t: 0.62, pos: [0.25, 1.3, 2.3], look: [0, 1.15, -0.6], fov: 34 },
    { t: 0.76, pos: [0, 1.35, 0.9], look: [0, 1.3, -4], fov: 40 },
    { t: 0.9, pos: [3.2, 2.1, 6.6], look: [0, 1.7, 0], fov: 34 },
    { t: 1.0, pos: [3.6, 2.2, 7.4], look: [-0.7, 1.7, 0], fov: 34 },
  ],

  // ATLAS: worm's-eye orbit, then a crane up to see the whole machine.
  atlas: [
    { t: 0.0, pos: [0, -3.4, 9], look: [0, 2.6, 0], fov: 54 },
    { t: 0.15, pos: [6.5, -1.4, 5.5], look: [0, 2.5, 0], fov: 50 },
    { t: 0.3, pos: [6.5, 3.6, -4.5], look: [0, 2.5, 0], fov: 48 },
    { t: 0.44, pos: [0, 4.6, 9.5], look: [0, 3.2, 0], fov: 46 },
    { t: 0.6, pos: [-10, 6.5, 15], look: [0, 3, 0], fov: 48 },
    { t: 0.8, pos: [15, 11, 23], look: [0, 2, -2], fov: 50 },
    { t: 1.0, pos: [0, 10, 32], look: [0, 3.5, -3], fov: 48 },
  ],

  // NOVA: the camera goes into the picture and comes back out.
  nova: [
    { t: 0.0, pos: [0, 1.2, 7.5], look: [0, 1.2, 0], fov: 34 },
    { t: 0.2, pos: [0.8, 1.5, 6], look: [0, 1.2, 0], fov: 34 },
    { t: 0.36, pos: [0, 1.25, 4.4], look: [0, 1.2, 0], fov: 34 },
    { t: 0.55, pos: [0, 2.4, 10], look: [0, 1.1, 0], fov: 42 },
    { t: 0.74, pos: [-7, 0.9, -3], look: [5, 0.6, -14], fov: 50 },
    { t: 0.9, pos: [5.5, 2.8, 8.5], look: [0, 1.2, 0], fov: 40 },
    { t: 1.0, pos: [4, 2.3, 8], look: [-0.8, 1.2, 0], fov: 40 },
  ],

  // TOAD: a supercar commercial, played completely straight.
  toad: [
    { t: 0.0, pos: [0.55, 0.42, 2.1], look: [0, 0.22, 0.1], fov: 17 },
    { t: 0.12, pos: [-1.2, 0.18, 1.2], look: [0, 0.2, 0], fov: 18 },
    { t: 0.26, pos: [-2.2, 0.9, 3.4], look: [0, 0.2, 0], fov: 20 },
    { t: 0.4, pos: [3.2, 1.4, 4.2], look: [0, 0.25, 0], fov: 20 },
    { t: 0.52, pos: [0, 6, 9], look: [2.4, 0, -1], fov: 22 },
    { t: 1.0, pos: [0, 6.2, 9.4], look: [2.4, 0, -1], fov: 22 },
  ],

  // HUSH: starts handheld and restless, ends perfectly still and far away.
  hush: [
    { t: 0.0, pos: [0, 1.5, 11], look: [0, 0.6, 0], fov: 46 },
    { t: 0.15, pos: [0.9, 0.7, 2.6], look: [0, 0.35, 0], fov: 26 },
    { t: 0.3, pos: [-1.1, 0.95, 2.4], look: [0, 0.5, 0], fov: 28 },
    { t: 0.45, pos: [0, 1.4, 4.6], look: [0, 0.7, 0], fov: 32 },
    { t: 0.8, pos: [0, 1.6, 12], look: [0, 1.1, 0], fov: 38 },
    { t: 1.0, pos: [0, 1.8, 16], look: [0, 1.4, 0], fov: 36 },
  ],

  // MOXIE: metronomic. The director quantises this chapter's progress so the camera ticks.
  moxie: [
    { t: 0.0, pos: [0, 0.1, 1.1], look: [0, 0, 0], fov: 30 },
    { t: 0.18, pos: [1.6, 1.2, 2.2], look: [0, 0, 0], fov: 34 },
    { t: 0.34, pos: [-2.4, 2.6, 3.6], look: [0, 0, 0], fov: 40 },
    { t: 0.52, pos: [0, 7, 7], look: [0, 0, 0], fov: 46 },
    { t: 0.7, pos: [8, 3, 9], look: [0, 0, 0], fov: 46 },
    { t: 0.86, pos: [-4, 1.2, 12], look: [0, 0.4, 0], fov: 44 },
    { t: 1.0, pos: [0, 2.4, 13], look: [0, 0.4, 0], fov: 42 },
  ],

  // ELSEWHERE: the longest push in the building, straight through the screen, then back out.
  elsewhere: [
    { t: 0.0, pos: [0, 1.8, 46], look: [0, 1.8, 0], fov: 30 },
    { t: 0.22, pos: [0, 1.9, 14], look: [0, 1.8, 0], fov: 34 },
    { t: 0.34, pos: [3.4, 1.4, 6.5], look: [0, 1.6, 0], fov: 36 },
    { t: 0.5, pos: [0, 1.8, 4.2], look: [0, 1.8, 0], fov: 44 },
    { t: 0.6, pos: [0, 1.8, 0.4], look: [0, 1.8, -10], fov: 52 },
    { t: 0.78, pos: [0.4, 2.2, -14], look: [0, 2.6, -40], fov: 52 },
    { t: 0.86, pos: [0, 1.8, 0.6], look: [0, 1.8, -10], fov: 50 },
    { t: 1.0, pos: [0, 2.2, 12], look: [0, 1.7, 0], fov: 34 },
  ],

  // FINALE: reverse dolly out of a single point of light.
  finale: [
    { t: 0.0, pos: [0, 0, 3], look: [0, 0, 0], fov: 40 },
    { t: 0.35, pos: [0, 4, 19], look: [0, 0.5, 0], fov: 46 },
    { t: 0.7, pos: [11, 6.5, 18], look: [0, -0.8, 0], fov: 50 },
    { t: 1.0, pos: [0, 14, 30], look: [0, -1, 0], fov: 46 },
  ],
}

// Where each room's portal waits; the camera turns to it while leaving.
export const portalAnchor = {
  vesper: [2.6, 2.3, 4.2],
  aurelius: [0, 1.25, -0.35],
  atlas: [0, 6, 0],
  nova: [0, 1.2, 0.2],
  toad: [0, 0.4, 0],
  hush: [0, 1.1, 0],
  moxie: [0, 0, 0.2],
  elsewhere: [0, 1.8, 0],
}

// Moxie ticks: progress is held, then snaps forward 24 times through the chapter.
export function metronome(t) {
  const steps = 24
  const k = t * steps
  const i = Math.floor(k)
  const f = k - i
  const snap = f < 0.35 ? (f / 0.35) ** 0.5 : 1
  return Math.min(1, (i + snap) / steps)
}
