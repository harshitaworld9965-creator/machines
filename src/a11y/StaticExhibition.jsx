import { exhibits, site, classificationLine } from '../data/exhibits'

/**
 * Reduced-motion and no-WebGL version: every room as a still, composed plate with its full copy.
 * Posters are screenshots of the cinematic build (public/posters). Nothing moves on its own here.
 */
const POSTER_ALT = {
  vesper: 'A placeholder Galaxy S22 Ultra at the centre of a floorless cylindrical archive of glowing abstract memory fragments.',
  aurelius: 'A placeholder laptop with its lid open on a stone plinth, lifted into a shaft of light among hanging metal rods.',
  atlas: 'A floating placeholder laptop at the centre of a blueprint-blue architecture of beams, orange stairs and glass towers.',
  nova: 'A placeholder tablet floating over a blue wireframe sea that has spilled out of its own screen.',
  toad: 'A dark green placeholder mouse on a cream turntable, lit like a luxury car.',
  hush: 'A pale placeholder earbuds case in an empty felt-grey room, with one quiet dotted waveform.',
  moxie: 'A round placeholder smartwatch inside concentric yellow rings, tick marks and numbers.',
  elsewhere: 'A placeholder television glowing in a dark red cinema, showing an original moonlit ocean.',
}

export function StaticExhibition({ webgl, onToggleMotion }) {
  return (
    <main className="static">
      <section id="static-prologue" className="plate" style={{ '--room': site.base.ink }}>
        <img src="./posters/prologue.webp" alt="A long dark hall of monoliths with unidentified objects suspended at different depths." loading="eager" />
        <div className="plate-copy">
          <p className="mono">{site.classification}</p>
          <h1 className="display plate-title">{site.title.join(' ')}</h1>
          <p className="plate-lead">{site.subtitle}</p>
          <p className="mono plate-note">
            {webgl ? 'You are seeing the still version because reduced motion is on.' : 'Your browser could not start 3D, so you are seeing the still version.'}{' '}
            {webgl && (
              <button type="button" className="text-btn" onClick={onToggleMotion}>
                Switch motion on
              </button>
            )}
          </p>
        </div>
      </section>

      {exhibits.map((e) => {
        const light = ['aurelius', 'nova', 'toad', 'hush'].includes(e.id)
        return (
          <section key={e.id} id={`static-${e.id}`} className={`plate ${light ? 'plate-light' : ''}`} style={{ '--room': e.palette.room }}>
            <img src={`./posters/${e.id}.webp`} alt={POSTER_ALT[e.id]} loading="lazy" />
            <div className="plate-copy">
              <p className="mono">
                {classificationLine(e)} / {e.device.toUpperCase()}
              </p>
              <h2 className="display plate-name">{e.nickname}.</h2>
              <p className="plate-lead">{e.statement}</p>
              <p>{e.secondary}</p>
              <p className="mono plate-note">Provisional model · the hands-on interaction lives in the motion version.</p>
            </div>
          </section>
        )
      })}

      <section id="static-finale" className="plate" style={{ '--room': '#0b0a10' }}>
        <img src="./posters/finale.webp" alt="Eight devices floating in a dark sky, each joined by a thin line to a soft light at the centre." loading="lazy" />
        <div className="plate-copy">
          <h2 className="display plate-title">EIGHT MACHINES. ONE VERY HUMAN STORY.</h2>
          <p className="plate-lead">None of them is extraordinary on its own. But somehow, together, they tell a story about me.</p>
          <p className="mono plate-note">TMKM / 000 / OWNER / —</p>
        </div>
      </section>
    </main>
  )
}
