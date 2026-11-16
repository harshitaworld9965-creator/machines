import { useEffect, useRef, useState } from 'react'
import { getActive, setUI } from '../../experience/store'

/**
 * TOAD's playground: a giant cursor in a small physics world (matter-js, loaded only when needed).
 * The cursor follows the visitor's pointer (or arrow keys); click and hold grabs whatever it touches.
 * Until the visitor takes over, the cursor performs on its own. In the passage, it clicks Mute.
 * The layer is fixed to the viewport so it can carry on into the passage to Hush.
 */

const GREEN = '#3f7d3a'
const CREAM = '#F1E9D2'
const INK = '#14110f'

// is the playground on stage, and is the mute scene playing?
function phase() {
  const { section, t } = getActive()
  if (section.id === 'toad') return t >= 0.5 ? 'play' : 'off'
  if (section.id === 'p-toad') return t < 0.5 ? 'mute' : 'off'
  return 'off'
}

export function ToadPlayground() {
  const wrap = useRef()
  const canvas = useRef()
  const api = useRef({})
  const [grabbed, setGrabbed] = useState(false)
  const [took, setTook] = useState(false)

  useEffect(() => {
    let raf = 0
    let alive = true
    let world = null

    const start = async () => {
      const M = (await import('matter-js')).default
      if (!alive) return
      const { Engine, Bodies, Body, Composite, Constraint, Query, Vertices } = M
      const engine = Engine.create({ gravity: { y: 1.1 } })
      const c = canvas.current
      const g = c.getContext('2d')
      let W = 0
      let H = 0
      let dpr = 1
      let walls = []
      let things = []
      let mute = null
      const target = { x: 0, y: 0 }
      let userControl = false
      let grab = null
      let last = 0
      let acc = 0

      const unit = () => Math.min(W, H)

      function makeCursor() {
        const s = unit() * 0.0011
        const pts = [
          { x: 0, y: 0 },
          { x: 0, y: 150 },
          { x: 36, y: 116 },
          { x: 62, y: 172 },
          { x: 86, y: 160 },
          { x: 60, y: 106 },
          { x: 106, y: 104 },
        ].map((p) => ({ x: p.x * s, y: p.y * s }))
        const b = Bodies.fromVertices(W * 0.7, H * 0.3, [pts], { frictionAir: 0.2, label: 'cursor' })
        Body.setMass(b, 40)
        Body.setInertia(b, Infinity)
        // the physics body is the arrow's hull; the drawing keeps the true arrow shape
        const c0 = Vertices.centre(pts)
        b.render = { kind: 'cursor', pts: pts.map((p) => ({ x: p.x - c0.x, y: p.y - c0.y })) }
        return b
      }

      function letter(ch, x, y, w) {
        const b = Bodies.rectangle(x, y, w, w * 1.15, { chamfer: { radius: w * 0.06 }, restitution: 0.25, friction: 0.4, label: 'letter' })
        b.render = { kind: 'letter', ch, w, h: w * 1.15 }
        return b
      }

      function build() {
        Composite.clear(engine.world, false)
        const u = unit()
        const t = 200
        walls = [
          Bodies.rectangle(W / 2, H + t / 2 - 2, W * 3, t, { isStatic: true }),
          Bodies.rectangle(-t / 2, H / 2, t, H * 4, { isStatic: true }),
          Bodies.rectangle(W + t / 2, H / 2, t, H * 4, { isStatic: true }),
        ]
        const lw = Math.max(70, u * 0.2)
        things = [
          ...'TOAD'.split('').map((ch, i) => letter(ch, W * 0.3 + i * lw * 1.2, -lw * (0.6 + i * 0.5), lw)),
        ]
        const ui = [
          { kind: 'ok', w: u * 0.2, h: u * 0.08 },
          { kind: 'folder', w: u * 0.16, h: u * 0.12 },
          { kind: 'check', w: u * 0.08, h: u * 0.08 },
          { kind: 'close', r: u * 0.045 },
          { kind: 'knob', r: u * 0.055 },
          { kind: 'scroll', w: u * 0.05, h: u * 0.26 },
          { kind: 'ok', w: u * 0.16, h: u * 0.07, label: 'CANCEL' },
        ]
        ui.forEach((o, i) => {
          const x = W * (0.2 + (i / ui.length) * 0.7)
          const y = -u * (0.3 + i * 0.18)
          const b = o.r
            ? Bodies.circle(x, y, o.r, { restitution: 0.55, friction: 0.2 })
            : Bodies.rectangle(x, y, o.w, o.h, { chamfer: { radius: Math.min(o.w, o.h) * (o.kind === 'ok' ? 0.5 : 0.12) }, restitution: 0.35 })
          b.render = o
          things.push(b)
        })
        api.current.cursor = makeCursor()
        Composite.add(engine.world, [...walls, ...things, api.current.cursor])
        mute = null
      }

      function resize() {
        const r = wrap.current.getBoundingClientRect()
        dpr = Math.min(window.devicePixelRatio || 1, 2)
        W = r.width
        H = r.height
        c.width = W * dpr
        c.height = H * dpr
        build()
      }

      // ── drawing: flat print, hard shadows ──
      function shape(b, fill, shadow = true) {
        const v = b.vertices
        if (shadow) {
          g.fillStyle = INK
          g.beginPath()
          v.forEach((p, i) => (i ? g.lineTo(p.x + 6, p.y + 6) : g.moveTo(p.x + 6, p.y + 6)))
          g.closePath()
          g.fill()
        }
        g.fillStyle = fill
        g.strokeStyle = INK
        g.lineWidth = 2
        g.beginPath()
        v.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)))
        g.closePath()
        g.fill()
        g.stroke()
      }
      function centred(b, draw) {
        g.save()
        g.translate(b.position.x, b.position.y)
        g.rotate(b.angle)
        draw()
        g.restore()
      }
      function draw(t) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0)
        g.clearRect(0, 0, W, H)
        for (const b of things) {
          const r = b.render
          if (r.kind === 'letter') {
            shape(b, GREEN)
            centred(b, () => {
              g.fillStyle = CREAM
              g.font = `400 ${r.w * 0.9}px Gloock, serif`
              g.textAlign = 'center'
              g.textBaseline = 'middle'
              g.fillText(r.ch, 0, r.w * 0.06)
            })
          } else if (r.kind === 'ok') {
            shape(b, '#f7f2e4')
            centred(b, () => {
              g.fillStyle = INK
              g.font = `500 ${r.h * 0.32}px "Martian Mono", monospace`
              g.textAlign = 'center'
              g.textBaseline = 'middle'
              g.fillText(r.label || 'OK', 0, 1)
            })
          } else if (r.kind === 'folder') {
            shape(b, '#e8b04a')
            centred(b, () => {
              g.fillStyle = '#c9902e'
              g.fillRect(-r.w / 2, -r.h / 2 - 6, r.w * 0.4, 8)
            })
          } else if (r.kind === 'check') {
            shape(b, '#f7f2e4')
            centred(b, () => {
              g.strokeStyle = GREEN
              g.lineWidth = r.w * 0.12
              g.beginPath()
              g.moveTo(-r.w * 0.25, 0)
              g.lineTo(-r.w * 0.05, r.w * 0.2)
              g.lineTo(r.w * 0.28, -r.w * 0.22)
              g.stroke()
            })
          } else if (r.kind === 'close') {
            shape(b, '#d9634a')
            centred(b, () => {
              g.strokeStyle = CREAM
              g.lineWidth = r.r * 0.22
              g.beginPath()
              g.moveTo(-r.r * 0.4, -r.r * 0.4)
              g.lineTo(r.r * 0.4, r.r * 0.4)
              g.moveTo(r.r * 0.4, -r.r * 0.4)
              g.lineTo(-r.r * 0.4, r.r * 0.4)
              g.stroke()
            })
          } else if (r.kind === 'knob') shape(b, '#f7f2e4')
          else if (r.kind === 'scroll') shape(b, '#cfc4a6')
          else if (r.kind === 'mute') {
            shape(b, '#f7f2e4')
            centred(b, () => {
              const s = r.r
              g.fillStyle = INK
              g.beginPath()
              g.moveTo(-s * 0.45, -s * 0.18)
              g.lineTo(-s * 0.2, -s * 0.18)
              g.lineTo(s * 0.12, -s * 0.45)
              g.lineTo(s * 0.12, s * 0.45)
              g.lineTo(-s * 0.2, s * 0.18)
              g.lineTo(-s * 0.45, s * 0.18)
              g.fill()
              g.strokeStyle = '#d9634a'
              g.lineWidth = s * 0.1
              g.beginPath()
              g.moveTo(-s * 0.6, -s * 0.6)
              g.lineTo(s * 0.6, s * 0.6)
              g.stroke()
            })
          }
        }
        // the cursor, last and on top
        const cur = api.current.cursor
        g.save()
        g.translate(cur.position.x, cur.position.y)
        const v = cur.render.pts
        g.fillStyle = INK
        g.beginPath()
        v.forEach((p, i) => (i ? g.lineTo(p.x + 8, p.y + 8) : g.moveTo(p.x + 8, p.y + 8)))
        g.fill()
        g.fillStyle = grab ? GREEN : '#ffffff'
        g.strokeStyle = INK
        g.lineWidth = 3
        g.beginPath()
        v.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)))
        g.closePath()
        g.fill()
        g.stroke()
        g.restore()
      }

      // the cursor's own routine, until someone takes the mouse
      function autopilot(t) {
        target.x = W * (0.5 + 0.34 * Math.sin(t * 0.55))
        target.y = H * (0.62 + 0.22 * Math.sin(t * 1.1 + 1))
      }

      function tick(now) {
        raf = requestAnimationFrame(tick)
        const p = phase()
        const on = p !== 'off' && document.visibilityState === 'visible'
        wrap.current.style.visibility = on ? 'visible' : 'hidden'
        wrap.current.dataset.phase = p
        if (!on) {
          last = 0
          return
        }
        const t = now / 1000
        const cur = api.current.cursor

        if (p === 'mute') {
          if (!mute) {
            const r = unit() * 0.09
            mute = Bodies.circle(W / 2, H * 0.46, r, { isStatic: true })
            mute.render = { kind: 'mute', r }
            things.push(mute)
            Composite.add(engine.world, mute)
          }
          // walk to the mute button and press it
          target.x = W / 2 + 10
          target.y = H * 0.46 - 10
        } else {
          if (mute) {
            Composite.remove(engine.world, mute)
            things = things.filter((b) => b !== mute)
            mute = null
          }
          if (!userControl) autopilot(t)
        }

        // fixed 60 Hz physics steps on real elapsed time, so slow frames don't slow the world down
        const elapsed = Math.min(80, now - (last || now))
        last = now
        acc += elapsed
        let n = 0
        while (acc >= 1000 / 60 && n < 5) {
          Body.setVelocity(cur, { x: (target.x - cur.position.x) * 0.22, y: (target.y - cur.position.y) * 0.22 })
          Engine.update(engine, 1000 / 60)
          acc -= 1000 / 60
          n++
        }
        // keep things in the room
        for (const b of things) if (b.position.y > H + 400) Body.setPosition(b, { x: W / 2, y: -100 })
        draw(t)
      }

      // ── input ──
      const toLocal = (e) => {
        const r = c.getBoundingClientRect()
        return { x: e.clientX - r.left, y: e.clientY - r.top }
      }
      const take = () => {
        if (!userControl) {
          userControl = true
          setTook(true)
          setUI({ toadUser: true })
        }
      }
      const doGrab = () => {
        const cur = api.current.cursor
        const tip = { x: cur.position.x + cur.render.pts[0].x, y: cur.position.y + cur.render.pts[0].y }
        const hits = Query.point(things, tip).concat(Query.region(things, cur.bounds))
        const hit = hits.find((b) => !b.isStatic)
        if (hit) {
          grab = Constraint.create({ bodyA: cur, bodyB: hit, pointB: { x: 0, y: 0 }, stiffness: 0.08, length: 0 })
          Composite.add(engine.world, grab)
          setGrabbed(true)
        }
      }
      const release = () => {
        if (grab) Composite.remove(engine.world, grab)
        grab = null
        setGrabbed(false)
      }
      const onMove = (e) => {
        if (e.pointerType === 'touch') return
        take()
        Object.assign(target, toLocal(e))
      }
      const onDown = (e) => {
        take()
        Object.assign(target, toLocal(e))
        if (e.pointerType !== 'touch') doGrab()
      }
      const onUp = () => release()
      const onKey = (e) => {
        const step = 40
        const k = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key]
        if (k) {
          take()
          target.x = Math.max(0, Math.min(W, target.x + k[0]))
          target.y = Math.max(0, Math.min(H, target.y + k[1]))
          e.preventDefault()
        } else if (e.key === ' ' || e.key === 'Enter') {
          take()
          grab ? release() : doGrab()
          e.preventDefault()
        }
      }
      c.addEventListener('pointermove', onMove)
      c.addEventListener('pointerdown', onDown)
      window.addEventListener('pointerup', onUp)
      c.addEventListener('keydown', onKey)

      api.current.reset = () => {
        release()
        build()
      }
      api.current.shake = () => {
        things.forEach((b) => {
          if (!b.isStatic) Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * 0.4 * b.mass, y: -0.5 * b.mass })
        })
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(wrap.current)
      raf = requestAnimationFrame(tick)
      world = () => {
        ro.disconnect()
        c.removeEventListener('pointermove', onMove)
        c.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointerup', onUp)
        c.removeEventListener('keydown', onKey)
        Engine.clear(engine)
      }
    }

    // only load the physics engine when the visitor is getting close
    const wait = () => {
      const { section } = getActive()
      if (['toad', 'p-nova', 'p-toad', 'nova'].includes(section.id)) start()
      else raf = requestAnimationFrame(wait)
    }
    raf = requestAnimationFrame(wait)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      world?.()
    }
  }, [])

  return (
    <div ref={wrap} className="toad-layer" style={{ visibility: 'hidden' }}>
      <canvas
        ref={canvas}
        tabIndex={0}
        aria-label="Toad's playground. Move your pointer and Toad's giant cursor follows; click and hold to grab. Keyboard: arrow keys move, Space grabs and releases."
      />
      <div className="toad-tools">
        <span className={`hint ${took ? 'is-gone' : ''}`}>Move your pointer · click and hold to grab</span>
        {grabbed && <span className="hint">Holding on</span>}
        <div className="ctl-row">
          <button type="button" className="pill" onClick={() => api.current.shake?.()}>
            Shake the desk
          </button>
          <button type="button" className="pill pill-quiet" onClick={() => api.current.reset?.()}>
            Drop it all again
          </button>
        </div>
      </div>
    </div>
  )
}
