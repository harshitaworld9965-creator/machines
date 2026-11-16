// Small shared control pieces. Every control is a real <button> or <input>, keyboard reachable.

export function Toggle({ on, onChange, children, label }) {
  return (
    <button type="button" className={`pill ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => onChange(!on)}>
      <span className="pill-dot" aria-hidden="true" />
      {children}
      {label !== false && <span className="pill-state">{on ? 'ON' : 'OFF'}</span>}
    </button>
  )
}

export function Choice({ options, value, onChange, legend }) {
  return (
    <div className="choice" role="radiogroup" aria-label={legend}>
      {legend && <span className="mono choice-legend">{legend}</span>}
      <div className="choice-row">
        {options.map((o, i) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === i}
            className={`pill ${value === i ? 'is-on' : ''}`}
            onClick={() => onChange(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                onChange((value + 1) % options.length)
              }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                onChange((value + options.length - 1) % options.length)
              }
            }}
          >
            <span className="mono choice-n">{String(i + 1).padStart(2, '0')}</span>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Hint({ children, gone }) {
  return <span className={`hint ${gone ? 'is-gone' : ''}`}>{children}</span>
}
