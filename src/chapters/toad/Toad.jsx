import { ExhibitChapter } from '../ExhibitChapter'

// The supercar brochure, deadpan.
const SPECS = [
  ['Clicks per day', 'Uncountable'],
  ['Top speed', 'Instant'],
  ['Drivetrain', 'One finger'],
  ['Cargo', 'Every file, eventually'],
  ['Complaints filed', 'None'],
]

export function Toad() {
  return (
    <ExhibitChapter
      id="toad"
      reveal="drop"
      at={{ name: 0.22, nameOut: 0.48, statement: 0.06, statementOut: 0.2, secondary: 0.3, secondaryOut: 0.46, controls: 1 }}
      build={(tl) => {
        tl.fromTo('.toad-specs', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.08)
        tl.from('.toad-specs li', { xPercent: -20, opacity: 0, stagger: 0.012, duration: 0.04 }, 0.08)
        tl.to('.toad-specs', { autoAlpha: 0, duration: 0.03 }, 0.2)
        tl.to('.ch-toad .x-name', { autoAlpha: 0, duration: 0.03 }, 0.5)
      }}
      extra={
        <ul className="toad-specs" aria-label="Specifications, as a supercar brochure would list them">
          {SPECS.map(([k, v]) => (
            <li key={k}>
              <span>{k}</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      }
    />
  )
}
