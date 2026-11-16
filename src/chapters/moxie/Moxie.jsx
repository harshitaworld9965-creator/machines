import { ExhibitChapter } from '../ExhibitChapter'
import { Choice } from '../Controls'
import { setUI, useUI, getUI } from '../../experience/store'
import { FACES } from './MoxieScene'

// Original lines. Motivational, mildly bossy, never a real statistic.
export const MOXIE_LINES = [
  'Stand up. The chair will manage without you.',
  'That was not a walk. That was a commute to the fridge.',
  'Drink some water. You are, in fact, a plant with opinions.',
  'Breathe in. Breathe out. Now do it while walking.',
  'I have noticed you sitting. I am not angry. I am disappointed.',
  'One lap of the room. I will count. I am always counting.',
  'Bold of you to call that a stretch.',
  'Your posture just sent me a complaint.',
  'Sunlight exists. Allegedly. Go and check.',
  'I buzzed. You ignored me. We both know what happened.',
]

function MoxieControls() {
  const face = useUI((s) => s.face)
  const line = useUI((s) => s.moxieLine)
  return (
    <>
      <div className="moxie-controls">
        <Choice legend="Watch faces" options={FACES} value={face} onChange={(i) => setUI({ face: i })} />
        <div className="ctl-row">
          <button type="button" className="pill pill-accent" onClick={() => setUI({ moxieLine: (getUI().moxieLine + 1) % MOXIE_LINES.length })}>
            Moxie says…
          </button>
        </div>
      </div>
      {line >= 0 && (
        <p className="moxie-says" key={line} role="status">
          <span className="mono">MOXIE SAYS</span>
          {MOXIE_LINES[line]}
        </p>
      )}
    </>
  )
}

export function Moxie() {
  return (
    <ExhibitChapter id="moxie" reveal="tick" at={{ name: 0.08, nameOut: 0.5, statement: 0.18, statementOut: 0.44, secondary: 0.6, secondaryOut: 0.84, controls: 0.36 }}>
      <MoxieControls />
    </ExhibitChapter>
  )
}
