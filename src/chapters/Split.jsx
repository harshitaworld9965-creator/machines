import { Fragment } from 'react'

// Splits text into masked characters, grouped by word so lines still wrap between words.
// The readable text lives on the parent's aria-label; the split copy is hidden from assistive tech.
export function Split({ text, className = '' }) {
  const words = text.split(' ')
  return (
    <span className={`split ${className}`} aria-hidden="true">
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className="word">
            {Array.from(word).map((ch, i) => (
              <span className="mask" key={i}>
                <span className="ch">
                  <span className="ci">{ch}</span>
                </span>
              </span>
            ))}
          </span>
          {w < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  )
}
