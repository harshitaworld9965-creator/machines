import * as THREE from 'three'
import { seeded } from '../../stage/math'

// Original, abstract artwork only. These stand for "a photo", "a song", "a plan" without
// depicting anyone's real photographs, messages or apps.

const PAPER = '#EFE8DC'
const ROSE = '#E7A7A0'
const AUB = '#2A1B2E'
const MONO = '500 11px "Martian Mono", ui-monospace, monospace'

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function frame(g, w, h, code) {
  g.strokeStyle = 'rgba(239,232,220,0.55)'
  g.lineWidth = 2
  g.strokeRect(1, 1, w - 2, h - 2)
  // catalogue-card corner ticks
  g.strokeStyle = PAPER
  g.lineWidth = 3
  const t = 14
  ;[
    [0, 0, 1, 1],
    [w, 0, -1, 1],
    [0, h, 1, -1],
    [w, h, -1, -1],
  ].forEach(([x, y, sx, sy]) => {
    g.beginPath()
    g.moveTo(x + sx * 2, y + sy * (t + 2))
    g.lineTo(x + sx * 2, y + sy * 2)
    g.lineTo(x + sx * (t + 2), y + sy * 2)
    g.stroke()
  })
  g.fillStyle = 'rgba(239,232,220,0.8)'
  g.font = MONO
  g.fillText(code, 14, h - 12)
}

const painters = [
  // 0: a sky, abstracted
  (g, w, h, r) => {
    const gr = g.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, '#3b2a4a')
    gr.addColorStop(0.55, '#b9787a')
    gr.addColorStop(1, '#f2c7a0')
    g.fillStyle = gr
    g.fillRect(0, 0, w, h)
    g.fillStyle = 'rgba(255,240,220,0.9)'
    g.beginPath()
    g.arc(w * (0.3 + r() * 0.4), h * 0.62, 16, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = 'rgba(30,18,34,0.85)'
    g.fillRect(0, h * 0.74, w, h * 0.26)
  },
  // 1: a song
  (g, w, h, r) => {
    g.fillStyle = '#1d1220'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = ROSE
    g.lineWidth = 2
    for (let i = 0; i < 52; i++) {
      const x = 18 + i * ((w - 36) / 52)
      const a = (Math.sin(i * 0.5 + r() * 2) * 0.5 + 0.5) * (h * 0.32) + 4
      g.beginPath()
      g.moveTo(x, h / 2 - a)
      g.lineTo(x, h / 2 + a)
      g.stroke()
    }
  },
  // 2: a conversation (lengths only, no words)
  (g, w, h, r) => {
    g.fillStyle = '#efe8dc'
    g.fillRect(0, 0, w, h)
    let y = 20
    for (let i = 0; i < 6; i++) {
      const left = i % 2 === 0
      const bw = 50 + r() * 120
      g.fillStyle = left ? '#cdbfc9' : '#2A1B2E'
      const x = left ? 16 : w - 16 - bw
      g.beginPath()
      g.roundRect(x, y, bw, 16, 8)
      g.fill()
      y += 24
    }
  },
  // 3: a place
  (g, w, h) => {
    g.fillStyle = '#20302c'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = 'rgba(239,232,220,0.35)'
    g.lineWidth = 1
    for (let i = 1; i < 6; i++) {
      g.beginPath()
      g.arc(w * 0.62, h * 0.45, i * 18, 0, Math.PI * 2)
      g.stroke()
    }
    g.fillStyle = ROSE
    g.beginPath()
    g.arc(w * 0.62, h * 0.45, 6, 0, Math.PI * 2)
    g.fill()
  },
  // 4: a plan
  (g, w, h, r) => {
    g.fillStyle = '#2b2230'
    g.fillRect(0, 0, w, h)
    const cw = (w - 32) / 7
    const ch = (h - 52) / 4
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 7; x++) {
        const on = r() > 0.78
        g.fillStyle = on ? ROSE : 'rgba(239,232,220,0.12)'
        g.fillRect(16 + x * cw + 2, 14 + y * ch + 2, cw - 4, ch - 4)
      }
  },
  // 5: a photograph, out of focus
  (g, w, h, r) => {
    g.fillStyle = '#3a2a2f'
    g.fillRect(0, 0, w, h)
    const cols = ['#d98f7f', '#f1c48e', '#7b6aa8', '#e7d2b8']
    for (let i = 0; i < 6; i++) {
      const x = r() * w
      const y = r() * h
      const gr = g.createRadialGradient(x, y, 0, x, y, 40 + r() * 70)
      gr.addColorStop(0, cols[i % 4])
      gr.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = gr
      g.fillRect(0, 0, w, h)
    }
  },
  // 6: a late-night thought
  (g, w, h) => {
    g.fillStyle = '#120d16'
    g.fillRect(0, 0, w, h)
    g.fillStyle = PAPER
    g.font = '400 54px Gloock, Georgia, serif'
    g.fillText('2:47', 22, h * 0.6)
    g.fillStyle = ROSE
    g.fillRect(22, h * 0.68, 60, 3)
  },
  // 7: a grid of small things
  (g, w, h, r) => {
    g.fillStyle = AUB
    g.fillRect(0, 0, w, h)
    for (let y = 18; y < h - 26; y += 16)
      for (let x = 18; x < w - 12; x += 16) {
        g.fillStyle = r() > 0.92 ? ROSE : 'rgba(239,232,220,0.3)'
        g.beginPath()
        g.arc(x, y, 2.2, 0, Math.PI * 2)
        g.fill()
      }
  },
]

export const FRAGMENT_KINDS = painters.length

let cache = null
export function getFragmentTextures() {
  if (cache) return cache
  const r = seeded(47)
  cache = painters.map((paint, i) => {
    const [c, g] = canvas(256, 192)
    paint(g, 256, 192, r)
    frame(g, 256, 192, `MEM-${String(101 + i * 37).padStart(4, '0')}`)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  })
  return cache
}

// Abstract screen artwork for the phone. Not an imitation of any real interface.
export function makeScreenTexture() {
  const W = 512
  const H = 1080
  const [c, g] = canvas(W, H)
  const bg = g.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#1a0f1e')
  bg.addColorStop(0.6, '#2A1B2E')
  bg.addColorStop(1, '#0d080f')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)
  const glow = g.createRadialGradient(W * 0.5, H * 0.42, 10, W * 0.5, H * 0.42, W * 0.9)
  glow.addColorStop(0, 'rgba(231,167,160,0.85)')
  glow.addColorStop(0.35, 'rgba(160,90,120,0.35)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = glow
  g.fillRect(0, 0, W, H)
  const r = seeded(9)
  for (let i = 0; i < 26; i++) {
    const w = 40 + r() * 90
    const h = w * (0.6 + r() * 0.5)
    const x = r() * (W - w)
    const y = 120 + r() * (H - 300)
    g.fillStyle = `rgba(239,232,220,${0.05 + r() * 0.18})`
    g.fillRect(x, y, w, h)
    g.strokeStyle = 'rgba(239,232,220,0.4)'
    g.strokeRect(x + 0.5, y + 0.5, w, h)
  }
  g.fillStyle = 'rgba(239,232,220,0.85)'
  g.font = '500 20px "Martian Mono", monospace'
  g.fillText('001 / VESPER', 40, H - 70)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// The archival window: a soft view into the stone gallery of Aurelius.
// The same gradient is used by the CSS veil in the passage so the masked cut is seamless.
export const STONE_GRADIENT = 'radial-gradient(120% 90% at 50% 30%, #e6e0d6 0%, #b3ada4 38%, #8C8780 70%, #6e6962 100%)'
export function makeWindowTexture() {
  const W = 360
  const H = 480
  const [c, g] = canvas(W, H)
  const gr = g.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, H * 0.95)
  gr.addColorStop(0, '#e6e0d6')
  gr.addColorStop(0.38, '#b3ada4')
  gr.addColorStop(0.7, '#8C8780')
  gr.addColorStop(1, '#6e6962')
  g.fillStyle = gr
  g.fillRect(0, 0, W, H)
  // faint plinth silhouette, seen far away
  g.fillStyle = 'rgba(80,74,68,0.35)'
  g.fillRect(W * 0.42, H * 0.6, W * 0.16, H * 0.18)
  g.fillStyle = 'rgba(176,141,76,0.9)'
  g.lineWidth = 6
  g.strokeStyle = '#B08D4C'
  g.strokeRect(3, 3, W - 6, H - 6)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
