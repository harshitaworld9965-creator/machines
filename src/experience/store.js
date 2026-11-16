import { useSyncExternalStore } from 'react'
import { sections, sectionById } from '../data/exhibits'

// Scroll progress (0..1) per section. Written by each chapter's scrubbed timeline, read every frame by the stage.
// Kept outside React state so scrolling never re-renders components.
export const progress = Object.fromEntries(sections.map((s) => [s.id, 0]))

// Direct-manipulation input + per-frame values scenes share with the stage.
export const input = { rotY: 0, rotX: 0, pointerX: 0, pointerY: 0 }
export const frame = { bg: null, bgRoom: null, shake: 0 }

// The furthest section the visitor has entered, and how far into it they are.
export function getActive() {
  for (let i = sections.length - 1; i > 0; i--) {
    const s = sections[i]
    if (progress[s.id] > 0) return { section: s, t: progress[s.id] }
  }
  return { section: sections[0], t: progress.prologue }
}

// The room currently on screen. Passages switch rooms halfway, under the veil.
export function getRoom() {
  const { section, t } = getActive()
  if (section.from) return t < 0.5 ? section.from : section.to
  return section.room
}

// Progress of a passage leaving a room (0 if none).
export const leaving = (room) => progress[`p-${room}`] ?? 0

// UI state: changes rarely, components subscribe to it.
let ui = {
  section: 'prologue',
  reducedMotion: false,
  webgl: true,
  indexOpen: false,
  stageReady: false,
  tone: 'dark',
  // per-exhibit interaction state
  orbit: false,
  hasDragged: false,
  lid: -1,
  inspect: false,
  build: { grid: true, beams: true, stairs: true, tower: true },
  buildSeed: 1,
  world: 0,
  ncOn: false,
  face: 0,
  moxieLine: -1,
  channel: 0,
  finaleFocus: -1,
}
const listeners = new Set()

export const getUI = () => ui
export function setUI(patch) {
  const next = { ...ui, ...patch }
  if (Object.keys(patch).every((k) => next[k] === ui[k])) return
  ui = next
  listeners.forEach((l) => l())
}
function subscribe(l) {
  listeners.add(l)
  return () => listeners.delete(l)
}
export function useUI(selector) {
  return useSyncExternalStore(subscribe, () => selector(ui))
}
export { sectionById }
