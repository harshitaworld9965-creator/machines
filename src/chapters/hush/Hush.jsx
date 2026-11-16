import { ExhibitChapter } from '../ExhibitChapter'
import { setUI, useUI } from '../../experience/store'

function NoiseCancellation() {
  const on = useUI((s) => s.ncOn)
  return (
    <div className="nc-control">
      <button type="button" role="switch" aria-checked={on} className={`pill nc-switch ${on ? 'is-on' : ''}`} onClick={() => setUI({ ncOn: !on })}>
        <span className="pill-dot" aria-hidden="true" />
        Noise Cancellation
        <span className="pill-state">{on ? 'ON' : 'OFF'}</span>
      </button>
      <span className="hint">{on ? 'The world can wait.' : 'Everything is a little too loud.'}</span>
    </div>
  )
}

export function Hush() {
  return (
    <ExhibitChapter id="hush" reveal="blur" at={{ name: 0.14, nameOut: 0.95, statement: 0.3, statementOut: 0.6, secondary: 0.86, secondaryOut: 1.2, controls: 0.06 }}>
      <NoiseCancellation />
    </ExhibitChapter>
  )
}
