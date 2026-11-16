import { useRef } from 'react'
import { useChapterTimeline } from '../timeline/useChapterTimeline'
import { sectionById, byId } from '../data/exhibits'

/**
 * A passage between two rooms. The leaving room's portal grows until it fills the frame (in 3D);
 * this veil, painted in the portal's colour, holds the frame while the camera changes rooms,
 * then lifts to reveal the next room. `iris` veils open from a point instead of fading.
 */
export function Passage({ id, iris = false }) {
  const ref = useRef()
  const s = sectionById[id]
  const from = byId[s.from]
  const to = byId[s.to]

  useChapterTimeline(ref, id, (tl) => {
    tl.fromTo('.pa-note', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.06)
    tl.to('.pa-note', { autoAlpha: 0, duration: 0.06 }, 0.34)
    if (iris) {
      tl.fromTo('.veil', { opacity: 1, clipPath: 'circle(0% at 50% 46%)' }, { clipPath: 'circle(75% at 50% 46%)', duration: 0.16, ease: 'power2.in' }, 0.34)
    } else {
      tl.fromTo('.veil', { opacity: 0 }, { opacity: 1, duration: 0.07, ease: 'power1.in' }, 0.43)
    }
    tl.to('.veil', { opacity: 0, duration: 0.16, ease: 'power2.out' }, 0.52)
    tl.fromTo('.pa-next', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.46)
    tl.to('.pa-next', { autoAlpha: 0, duration: 0.05 }, 0.56)
  })

  return (
    <section id={id} ref={ref} className={`chapter passage passage-${s.from}`} style={{ height: `${s.vh}vh` }} aria-label={`Passage from ${from?.nickname ?? ''} to ${to?.nickname ?? 'the constellation'}`}>
      <div className="sticky">
        <p className="pa-note mono">
          {s.note} · {from?.number ?? '000'} → {to?.number ?? '∞'}
        </p>
        <div className="veil" style={{ background: s.veil }} aria-hidden="true" />
        <p className="pa-next mono" aria-hidden="true">
          {to ? `${to.number} · ${to.nickname}` : 'THE CONSTELLATION'}
        </p>
      </div>
    </section>
  )
}
