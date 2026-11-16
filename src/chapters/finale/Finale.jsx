import { useRef } from 'react'
import { useChapterTimeline } from '../../timeline/useChapterTimeline'
import { exhibits, sectionById } from '../../data/exhibits'
import { scrollToSection } from '../../experience/scroll'
import { setUI } from '../../experience/store'
import { Split } from '../Split'

/**
 * FINALE: the closing statement, then the museum view (every device, one button each),
 * then a quiet resolution instead of a footer.
 */
export function Finale() {
  const ref = useRef()
  useChapterTimeline(ref, 'finale', (tl) => {
    tl.fromTo('.fi-a .ci', { yPercent: 115 }, { yPercent: 0, stagger: 0.008, duration: 0.06, ease: 'power3.out' }, 0.1)
    tl.fromTo('.fi-b .ci', { yPercent: 115 }, { yPercent: 0, stagger: 0.006, duration: 0.06, ease: 'power3.out' }, 0.2)
    tl.fromTo('.fi-sub', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.3)
    tl.to('.fi-statement', { autoAlpha: 0, y: -30, duration: 0.06 }, 0.46)
    tl.fromTo('.fi-index', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.5)
    tl.from('.fi-index li', { y: 20, opacity: 0, stagger: 0.008, duration: 0.05 }, 0.5)
    tl.to('.fi-index', { autoAlpha: 0, duration: 0.05 }, 0.84)
    tl.fromTo('.fi-end', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.9)
  })

  return (
    <section id="finale" ref={ref} className="chapter finale" style={{ height: `${sectionById.finale.vh}vh` }} aria-labelledby="finale-title">
      <div className="sticky">
        <div className="fi-statement">
          <h2 id="finale-title" className="display fi-title" aria-label="Eight machines. One very human story.">
            <span className="fi-a">
              <Split text="EIGHT MACHINES." />
            </span>
            <span className="fi-b">
              <Split text="ONE VERY HUMAN STORY." />
            </span>
          </h2>
          <p className="fi-sub">None of them is extraordinary on its own. But somehow, together, they tell a story about me.</p>
        </div>

        <nav className="fi-index" aria-label="Return to any exhibit">
          <p className="mono">THE CONSTELLATION · CHOOSE A MACHINE TO RETURN TO ITS ROOM</p>
          <ol>
            {exhibits.map((e, i) => (
              <li key={e.id}>
                <button
                  type="button"
                  onMouseEnter={() => setUI({ finaleFocus: i })}
                  onMouseLeave={() => setUI({ finaleFocus: -1 })}
                  onFocus={() => setUI({ finaleFocus: i })}
                  onBlur={() => setUI({ finaleFocus: -1 })}
                  onClick={() => scrollToSection(e.id, 0.04)}
                  style={{ '--swatch': e.palette.accent === '#14110F' ? '#EFE8DC' : e.palette.accent }}
                >
                  <span className="mono">{e.number}</span>
                  <span className="fi-name">{e.nickname}</span>
                  <span className="mono fi-theme">{e.theme}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="fi-end">
          <p className="mono">TMKM / 000 / OWNER / —</p>
          <button type="button" className="text-btn" onClick={() => scrollToSection('prologue', 0)}>
            Walk through the archive again
          </button>
        </div>
      </div>
    </section>
  )
}
