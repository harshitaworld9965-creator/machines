import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../experience/scroll'
import { useChapterTimeline } from '../../timeline/useChapterTimeline'
import { useUI } from '../../experience/store'
import { site, sections } from '../../data/exhibits'
import { Split } from '../Split'

const VH = sections.find((s) => s.id === 'prologue').vh

export function Prologue() {
  const ref = useRef()
  const ready = useUI((s) => s.stageReady)

  // Opening: immediate feedback while the 3D archive wakes behind the type.
  useGSAP(
    () => {
      gsap.from('.ci', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.035, delay: 0.15 })
      gsap.from('.pro-cls, .pro-sub, .pro-cue', { autoAlpha: 0, y: 12, duration: 1.2, ease: 'power3.out', stagger: 0.12, delay: 0.7 })
    },
    { scope: ref }
  )

  // Scroll: the title fragments into three depth layers as the camera advances through them.
  useChapterTimeline(ref, 'prologue', (tl) => {
    tl.to('.pro-cue', { autoAlpha: 0, duration: 0.06 }, 0.01)
    tl.to('.pro-sub, .pro-cls', { autoAlpha: 0, y: -20, duration: 0.12 }, 0.04)
    tl.to('.l1', { yPercent: -40, scale: 0.86, autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 0.05)
    tl.to('.l1 .ch', { yPercent: (i) => -30 - (i % 4) * 22, rotate: (i) => (i % 2 ? 6 : -5), stagger: 0.008, duration: 0.2 }, 0.05)
    tl.to('.l2', { xPercent: -24, autoAlpha: 0, duration: 0.34, ease: 'power1.in' }, 0.08)
    tl.to('.l2 .ch', { xPercent: (i) => -20 * i, stagger: 0.006, duration: 0.28 }, 0.08)
    tl.to('.l3', { scale: 3.6, xPercent: 18, autoAlpha: 0, duration: 0.17, ease: 'power2.in' }, 0.05)
    tl.fromTo('.pro-select', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.58)
    tl.from('.pro-select .ci', { yPercent: 110, stagger: 0.004, duration: 0.08 }, 0.58)
    tl.to('.pro-select', { autoAlpha: 0, duration: 0.06 }, 0.86)
  })

  return (
    <section id="prologue" ref={ref} className="chapter prologue" style={{ height: `${VH}vh` }} aria-labelledby="site-title">
      <div className="sticky">
        <p className="cls pro-cls">
          {site.classification}
          <span className="cls-status">{ready ? 'ARCHIVE AWAKE' : 'ARCHIVE WAKING'}</span>
        </p>

        <h1 id="site-title" className="pro-title" aria-label={site.title.join(' ')}>
          <span className="layer l1">
            <Split text={site.title[0]} />
          </span>
          <span className="layer l2">
            <Split text={site.title[1]} />
          </span>
          <span className="layer l3">
            <Split text={site.title[2]} />
          </span>
        </h1>

        <p className="pro-sub">{site.subtitle}</p>
        <p className="pro-cue">
          <span className="cue-line" />
          Scroll to enter the archive
        </p>

        <div className="pro-select" aria-live="polite">
          <span className="mono">EXHIBIT 001 / SEPARATED FROM THE COLLECTION</span>
          <span className="pro-select-line">
            <Split text="One of them knows more than the others." />
          </span>
        </div>
      </div>
    </section>
  )
}
