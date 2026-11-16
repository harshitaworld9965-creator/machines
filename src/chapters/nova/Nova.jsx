import { ExhibitChapter } from '../ExhibitChapter'
import { Choice } from '../Controls'
import { setUI, useUI } from '../../experience/store'
import { WORLDS } from './NovaScene'

function WorldPicker() {
  const world = useUI((s) => s.world)
  return <Choice legend="Worlds inside the tablet" options={WORLDS} value={world} onChange={(i) => setUI({ world: i })} />
}

export function Nova() {
  return (
    <ExhibitChapter id="nova" reveal="scatter" at={{ name: 0.05, nameOut: 0.44, statement: 0.28, statementOut: 0.44, secondary: 0.72, secondaryOut: 0.92, controls: 0.5 }}>
      <WorldPicker />
    </ExhibitChapter>
  )
}
