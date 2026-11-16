import { ExhibitChapter } from '../ExhibitChapter'
import { Toggle } from '../Controls'
import { setUI, useUI } from '../../experience/store'
import { AURELIUS_HOTSPOTS } from './AureliusScene'

function LidControl() {
  const lid = useUI((s) => s.lid)
  const inspect = useUI((s) => s.inspect)
  const value = lid < 0 ? 100 : Math.round(lid * 100)
  return (
    <>
      <div className="lid-control">
        <label className="mono" htmlFor="lid-range">
          Lid · {lid < 0 ? 'follows scroll' : `${value}%`}
        </label>
        <input
          id="lid-range"
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setUI({ lid: Number(e.target.value) / 100 })}
          aria-valuetext={`${value} percent open`}
        />
        <div className="ctl-row">
          <button type="button" className="pill pill-quiet" onClick={() => setUI({ lid: value > 50 ? 0 : 1 })}>
            {value > 50 ? 'Close the lid' : 'Open the lid'}
          </button>
          <Toggle on={inspect} onChange={(v) => setUI({ inspect: v })}>
            Inspect
          </Toggle>
        </div>
      </div>
      {inspect && (
        <aside className="inspect-panel" aria-label="Archival inspection">
          <p className="mono">ARCHIVAL INSPECTION · 002</p>
          <ol>
            {AURELIUS_HOTSPOTS.map((h) => (
              <li key={h.id}>
                <span>{h.label}</span>
                <span className="mono">AWAITING VERIFICATION</span>
              </li>
            ))}
          </ol>
          <p className="inspect-note">Brass rings mark each detail on the model. They will show verified photographs once the owner confirms the exact machine.</p>
        </aside>
      )}
    </>
  )
}

export function Aurelius() {
  return (
    <ExhibitChapter id="aurelius" reveal="rise" at={{ name: 0.04, nameOut: 0.42, statement: 0.12, statementOut: 0.3, secondary: 0.82, controls: 0.36 }}>
      <LidControl />
    </ExhibitChapter>
  )
}
