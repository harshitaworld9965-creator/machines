import { ExhibitChapter } from '../ExhibitChapter'
import { Choice } from '../Controls'
import { setUI, useUI } from '../../experience/store'
import { CHANNELS } from './ElsewhereScene'

function ChannelSelector() {
  const ch = useUI((s) => s.channel)
  return <Choice legend="Channels · original worlds" options={CHANNELS} value={ch} onChange={(i) => setUI({ channel: i })} />
}

export function Elsewhere() {
  return (
    <ExhibitChapter id="elsewhere" reveal="track" at={{ name: 0.24, nameOut: 0.4, statement: 0.3, statementOut: 0.44, secondary: 0.9, secondaryOut: 1.2, controls: 0.26 }}>
      <ChannelSelector />
    </ExhibitChapter>
  )
}
