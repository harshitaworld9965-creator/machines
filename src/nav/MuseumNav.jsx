import { useEffect, useRef } from 'react'
import { exhibits, classificationLine, ARCHIVE_CODE, sectionById } from '../data/exhibits'
import { scrollToSection } from '../experience/scroll'
import { setUI, useUI } from '../experience/store'

// The exhibit a section belongs to (passages count as the room being left).
function exhibitOf(sectionId) {
  const s = sectionById[sectionId]
  if (!s || sectionId === 'prologue') return null
  if (s.room === 'finale') return 'finale'
  return s.exhibit || s.from
}

function go(id) {
  if (!id) return scrollToSection('prologue', 0)
  if (id === 'finale') return scrollToSection('finale', 0.5)
  scrollToSection(id, 0.04)
}

export function MuseumNav({ mode, onToggleMotion }) {
  const section = useUI((s) => s.section)
  const open = useUI((s) => s.indexOpen)
  const tone = useUI((s) => s.tone)
  const current = exhibitOf(section)
  const ex = exhibits.find((e) => e.id === current)

  return (
    <div className={mode === 'cinematic' && tone === 'light' ? 'tone-light' : ''}>
      <header className="topbar">
        <button type="button" className="wordmark" onClick={() => go(null)} aria-label="Return to the archive entrance">
          <span className="mono">{ARCHIVE_CODE}</span>
          <span className="wordmark-name">The Machines That Know Me</span>
        </button>
        <div className="topbar-actions">
          <button type="button" className="text-btn" onClick={onToggleMotion} aria-pressed={mode === 'static'}>
            Motion: {mode === 'static' ? 'Reduced' : 'Full'}
          </button>
          <button type="button" className="text-btn" onClick={() => setUI({ indexOpen: true })} aria-haspopup="dialog">
            Index
          </button>
        </div>
      </header>

      {mode !== 'static' && (
        <nav className="rail" aria-label="Exhibits">
          <ol>
            <li>
              <button type="button" className={`tick ${!current ? 'is-current' : ''}`} onClick={() => go(null)} aria-label="Archive entrance" aria-current={!current ? 'true' : undefined}>
                <span className="tick-mark" />
              </button>
            </li>
            {exhibits.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  className={`tick ${e.id === current ? 'is-current' : ''}`}
                  onClick={() => go(e.id)}
                  aria-current={e.id === current ? 'true' : undefined}
                  aria-label={`${e.number} ${e.nickname}`}
                >
                  <span className="tick-mark" />
                </button>
              </li>
            ))}
            <li>
              <button type="button" className={`tick ${current === 'finale' ? 'is-current' : ''}`} onClick={() => go('finale')} aria-label="The constellation" aria-current={current === 'finale' ? 'true' : undefined}>
                <span className="tick-mark" />
              </button>
            </li>
          </ol>
          <p className="rail-label" aria-live="polite">
            {ex ? (
              <>
                <span className="mono">{ex.number}</span> {ex.nickname}
              </>
            ) : current === 'finale' ? (
              <span className="mono">∞ CONSTELLATION</span>
            ) : (
              <span className="mono">000 ARCHIVE</span>
            )}
          </p>
        </nav>
      )}

      {open && <IndexPanel current={current} mode={mode} />}
    </div>
  )
}

function IndexPanel({ current, mode }) {
  const panel = useRef()
  const opener = useRef(document.activeElement)
  const close = () => setUI({ indexOpen: false })

  useEffect(() => {
    const prev = opener.current
    panel.current?.querySelector('button')?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab') {
        const f = panel.current.querySelectorAll('button:not([disabled])')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          last.focus()
          e.preventDefault()
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus()
          e.preventDefault()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [])

  const visit = (id) => {
    close()
    if (mode === 'static') document.getElementById(`static-${id ?? 'prologue'}`)?.scrollIntoView()
    else go(id)
  }

  return (
    <div className="index-backdrop" onClick={close}>
      <div ref={panel} className="index" role="dialog" aria-modal="true" aria-label="Index of exhibits" onClick={(e) => e.stopPropagation()}>
        <div className="index-head">
          <span className="mono">INDEX · EIGHT ARTIFACTS · ONE OWNER</span>
          <button type="button" className="text-btn" onClick={close}>
            Close
          </button>
        </div>
        <ol className="index-list">
          <li>
            <button type="button" className="index-row" onClick={() => visit(null)}>
              <span className="mono">000</span>
              <span className="index-name">Archive</span>
              <span className="mono index-meta">ENTRANCE</span>
            </button>
          </li>
          {exhibits.map((e) => (
            <li key={e.id}>
              <button type="button" className={`index-row ${e.id === current ? 'is-current' : ''}`} onClick={() => visit(e.id)}>
                <span className="mono">{e.number}</span>
                <span className="index-name" style={{ '--swatch': e.palette.room }}>
                  {e.nickname}
                </span>
                <span className="mono index-meta">
                  {e.theme} · {e.device.toUpperCase()} · {e.title.toUpperCase()}
                </span>
              </button>
            </li>
          ))}
          <li>
            <button type="button" className={`index-row ${current === 'finale' ? 'is-current' : ''}`} onClick={() => visit('finale')}>
              <span className="mono">∞</span>
              <span className="index-name">Constellation</span>
              <span className="mono index-meta">ALL EIGHT, TOGETHER</span>
            </button>
          </li>
        </ol>
      </div>
    </div>
  )
}
