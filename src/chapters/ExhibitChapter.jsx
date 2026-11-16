import { useRef } from 'react'
import { useChapterTimeline } from '../timeline/useChapterTimeline'
import { byId, classificationLine, sectionById } from '../data/exhibits'
import { Split } from './Split'

/**
 * The editorial layer of one exhibit: classification, monumental nickname, actual device,
 * personality statement, secondary line, interaction controls.
 * Composition comes from the chapter's CSS (.ch-<id>); type motion from `reveal`.
 * Timing (fractions of the chapter's scroll) comes from `at`.
 */

const REVEALS = {
  rise: (tl, q, t) => tl.fromTo(q, { yPercent: 115 }, { yPercent: 0, stagger: 0.01, duration: 0.07, ease: 'power3.out' }, t),
  slide: (tl, q, t) => tl.fromTo(q, { xPercent: -130, scaleY: 0.2 }, { xPercent: 0, scaleY: 1, stagger: 0.012, duration: 0.08, ease: 'expo.out' }, t),
  drop: (tl, q, t) => tl.fromTo(q, { yPercent: -260 }, { yPercent: 0, stagger: 0.02, duration: 0.09, ease: 'bounce.out' }, t),
  blur: (tl, q, t) => tl.fromTo(q, { opacity: 0, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0px)', stagger: 0.012, duration: 0.1 }, t),
  tick: (tl, q, t) => tl.fromTo(q, { yPercent: 115 }, { yPercent: 0, stagger: 0.02, duration: 0.05, ease: 'steps(3)' }, t),
  scatter: (tl, q, t) =>
    tl.fromTo(q, { y: (i) => (i % 2 ? -1 : 1) * (120 + i * 30), opacity: 0 }, { y: 0, opacity: 1, stagger: 0.01, duration: 0.1, ease: 'power2.out' }, t),
  track: (tl, q, t, scope) =>
    tl.fromTo(scope.querySelector('.x-name'), { letterSpacing: '0.7em', opacity: 0 }, { letterSpacing: '0.02em', opacity: 1, duration: 0.14, ease: 'power2.out' }, t),
}

export function ExhibitChapter({ id, reveal = 'rise', at = {}, children, extra, build, tag }) {
  const ref = useRef()
  const ex = byId[id]
  const vh = sectionById[id].vh
  const A = { cls: 0.01, name: 0.08, nameOut: 0.5, statement: 0.2, statementOut: 0.46, secondary: 0.6, secondaryOut: 0.95, controls: 0.5, ...at }

  useChapterTimeline(ref, id, (tl) => {
    tl.fromTo('.x-cls', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, A.cls)
    tl.set('.x-name', { autoAlpha: 1 }, A.name)
    REVEALS[reveal](tl, '.x-name .ci', A.name, ref.current)
    tl.to('.x-name', { opacity: 0.14, duration: 0.06 }, A.nameOut)
    tl.fromTo('.x-statement', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, A.statement)
    tl.from('.x-statement .ci', { yPercent: 110, stagger: 0.0016, duration: 0.05 }, A.statement)
    tl.from('.x-device', { autoAlpha: 0, x: 24, duration: 0.04 }, A.statement + 0.02)
    tl.to('.x-statement', { autoAlpha: 0, y: -24, duration: 0.04 }, A.statementOut)
    tl.fromTo('.x-secondary', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.05 }, A.secondary)
    tl.to('.x-secondary', { autoAlpha: 0, duration: 0.04 }, A.secondaryOut)
    tl.fromTo('.x-controls', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, A.controls)
    if (build) build(tl)
  })

  return (
    <section id={id} ref={ref} className={`chapter exhibit ch-${id}`} style={{ height: `${vh}vh` }} aria-labelledby={`${id}-name`}>
      <div className="sticky">
        <p className="cls x-cls">
          {classificationLine(ex)}
          <span className="cls-status">
            {ex.device.toUpperCase()} · {tag || 'PROVISIONAL MODEL'}
          </span>
        </p>
        <h2 id={`${id}-name`} className="x-name display" aria-label={`${ex.nickname}.`}>
          <Split text={`${ex.nickname}.`} />
        </h2>
        <div className="x-statement">
          <span className="mono x-device">
            {ex.title} · {ex.theme}
          </span>
          <p aria-label={ex.statement}>
            <Split text={ex.statement} />
          </p>
        </div>
        <p className="x-secondary">{ex.secondary}</p>
        {extra}
        <div className="x-controls">{children}</div>
      </div>
    </section>
  )
}
