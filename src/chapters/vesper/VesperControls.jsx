import { useRef } from 'react'
import { input, setUI, useUI } from '../../experience/store'

// Controlled range for hands-on rotation (radians): +-35 degrees of yaw, +-15 of pitch.
const MAX_Y = 0.61
const MAX_X = 0.26
const clamp = (v, m) => Math.max(-m, Math.min(m, v))

export function VesperControls() {
  const orbit = useUI((s) => s.orbit)
  const dragged = useUI((s) => s.hasDragged)
  const drag = useRef(null)
  const zone = useRef()

  const nudge = (dy, dx) => {
    input.rotY = clamp(input.rotY + dy, MAX_Y)
    input.rotX = clamp(input.rotX + dx, MAX_X)
    zone.current?.setAttribute('aria-valuenow', Math.round((input.rotY * 180) / Math.PI))
    if (!dragged) setUI({ hasDragged: true })
  }

  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, ry: input.rotY, rx: input.rotX, axis: null }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.currentTarget.classList.add('is-dragging')
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    // on touch, a mostly-vertical gesture is a scroll, not a rotation
    if (!d.axis && Math.hypot(dx, dy) > 6) d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (e.pointerType === 'touch' && d.axis === 'y') return
    const w = e.currentTarget.clientWidth
    input.rotY = clamp(d.ry + (dx / w) * 1.8, MAX_Y)
    input.rotX = clamp(d.rx + (dy / w) * 0.9, MAX_X)
    if (!dragged && Math.abs(dx) > 10) setUI({ hasDragged: true })
  }
  const onPointerUp = (e) => {
    drag.current = null
    e.currentTarget.classList.remove('is-dragging')
    zone.current?.setAttribute('aria-valuenow', Math.round((input.rotY * 180) / Math.PI))
  }
  const onKeyDown = (e) => {
    const step = 0.09
    if (e.key === 'ArrowLeft') nudge(-step, 0)
    else if (e.key === 'ArrowRight') nudge(step, 0)
    else if (e.key === 'ArrowUp') nudge(0, -step / 2)
    else if (e.key === 'ArrowDown') nudge(0, step / 2)
    else if (e.key === 'Home') {
      input.rotY = 0
      input.rotX = 0
    } else return
    e.preventDefault()
  }

  return (
    <div className="v-controls">
      <div
        ref={zone}
        className="drag-zone"
        role="slider"
        tabIndex={0}
        aria-label="Turn Vesper. Use the left and right arrow keys; up and down to tilt; Home to reset."
        aria-valuemin={-35}
        aria-valuemax={35}
        aria-valuenow={0}
        aria-valuetext="Rotation in degrees"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <span className={`drag-hint ${dragged ? 'is-gone' : ''}`}>
          <span className="drag-hint-arrows" aria-hidden="true">
            ←&nbsp;&nbsp;→
          </span>
          Drag to turn Vesper
        </span>
      </div>

      <div className="v-buttons">
        <button type="button" className={`pill ${orbit ? 'is-on' : ''}`} aria-pressed={orbit} onClick={() => setUI({ orbit: !orbit })}>
          <span className="pill-dot" aria-hidden="true" />
          Memory Orbit
          <span className="pill-state">{orbit ? 'ON' : 'OFF'}</span>
        </button>
        <button
          type="button"
          className="pill pill-quiet"
          onClick={() => {
            input.rotY = 0
            input.rotX = 0
          }}
        >
          Re-centre
        </button>
      </div>
    </div>
  )
}
