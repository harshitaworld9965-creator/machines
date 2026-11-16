import { useRef } from 'react'
import { useChapterTimeline } from '../../timeline/useChapterTimeline'
import { byId, classificationLine, sections } from '../../data/exhibits'
import { Split } from '../Split'
import { VesperControls } from './VesperControls'

const ex = byId.vesper
const VH = sections.find((s) => s.id === 'vesper').vh

export function Vesper() {
  const ref = useRef()

  useChapterTimeline(ref, 'vesper', (tl) => {
    tl.fromTo('.v-cls', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.01)
    // fig. 1, the macro
    tl.fromTo('.v-card', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.03)
    tl.from('.v-card .ci', { yPercent: 110, stagger: 0.003, duration: 0.05 }, 0.03)
    tl.fromTo('.v-annot', { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.04 }, 0.07)
    tl.fromTo('.v-annot-line', { scaleX: 0 }, { scaleX: 1, duration: 0.05 }, 0.07)
    tl.to('.v-card, .v-annot', { autoAlpha: 0, y: -24, duration: 0.04 }, 0.24)
    // the name
    tl.fromTo('.v-name .ci', { yPercent: 115 }, { yPercent: 0, stagger: 0.012, duration: 0.07, ease: 'power3.out' }, 0.3)
    tl.to('.v-name', { letterSpacing: '0.18em', opacity: 0.16, duration: 0.1, ease: 'power1.inOut' }, 0.5)
    tl.to('.v-name .ch', { y: (i) => (i % 2 ? -1 : 1) * (12 + i * 6), duration: 0.12 }, 0.5)
    // who it is
    tl.fromTo('.v-statement', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.52)
    tl.from('.v-statement .ci', { yPercent: 110, stagger: 0.0018, duration: 0.05 }, 0.52)
    tl.from('.v-device', { autoAlpha: 0, x: 30, duration: 0.04 }, 0.54)
    tl.to('.v-statement', { autoAlpha: 0, y: -30, duration: 0.04 }, 0.72)
    // the archive
    tl.to('.v-name', { autoAlpha: 0, duration: 0.05 }, 0.74)
    tl.fromTo('.v-secondary', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.84)
    tl.fromTo('.v-controls', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.58)
  })

  return (
    <section id="vesper" ref={ref} className="chapter vesper" style={{ height: `${VH}vh` }} aria-labelledby="vesper-name">
      <div className="sticky">
        <p className="cls v-cls">
          {classificationLine(ex)}
          <span className="cls-status">{ex.device.toUpperCase()}</span>
        </p>

        <div className="v-card">
          <span className="mono">EXHIBIT {ex.number}</span>
          <span className="v-card-title" aria-label={ex.title}>
            <Split text={ex.title} />
          </span>
        </div>

        <div className="v-annot" aria-hidden="true">
          <span className="v-annot-line" />
          <span className="mono">FIG. 1 · REAR CAMERA, MAGNIFIED · PROVISIONAL MODEL</span>
        </div>

        <h2 id="vesper-name" className="v-name display" aria-label={`${ex.nickname}.`}>
          <Split text={`${ex.nickname}.`} />
        </h2>

        <div className="v-statement">
          <span className="mono v-device">{ex.device.toUpperCase()} · {ex.theme}</span>
          <p aria-label={ex.statement}>
            <Split text={ex.statement} />
          </p>
        </div>

        <p className="v-secondary">{ex.secondary}</p>

        <VesperControls />
      </div>
    </section>
  )
}
