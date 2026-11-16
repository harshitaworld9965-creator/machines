import { ExhibitChapter } from '../ExhibitChapter'
import { Toggle } from '../Controls'
import { setUI, useUI, getUI } from '../../experience/store'
import { SYSTEMS } from './AtlasScene'

const LABELS = { grid: 'Grid', beams: 'Beams', stairs: 'Stairs', tower: 'Tower' }

function BuildMode() {
  const build = useUI((s) => s.build)
  const on = SYSTEMS.filter((s) => build[s]).length
  return (
    <div className="build-mode">
      <p className="mono build-title">
        BUILD MODE · {on}/4 SYSTEMS RUNNING
      </p>
      <div className="ctl-row">
        {SYSTEMS.map((s) => (
          <Toggle key={s} on={build[s]} onChange={(v) => setUI({ build: { ...getUI().build, [s]: v } })}>
            {LABELS[s]}
          </Toggle>
        ))}
        <button type="button" className="pill pill-accent" onClick={() => setUI({ buildSeed: getUI().buildSeed + 1 })}>
          Rearrange
        </button>
      </div>
    </div>
  )
}

export function Atlas() {
  return (
    <ExhibitChapter
      id="atlas"
      reveal="slide"
      at={{ name: 0.06, nameOut: 0.4, statement: 0.18, statementOut: 0.36, secondary: 0.74, secondaryOut: 0.9, controls: 0.56 }}
      extra={<p className="atlas-coords mono" aria-hidden="true">X 003.000 · Y 002.500 · Z 000.000 · LOAD: UNREASONABLE</p>}
    >
      <BuildMode />
    </ExhibitChapter>
  )
}
