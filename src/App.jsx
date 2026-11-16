import { Suspense, lazy, useEffect, useState } from 'react'
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from './experience/scroll'
import { input, setUI } from './experience/store'
import { Prologue } from './chapters/prologue/Prologue'
import { Vesper } from './chapters/vesper/Vesper'
import { Passage } from './chapters/Passage'
import { Aurelius } from './chapters/aurelius/Aurelius'
import { Atlas } from './chapters/atlas/Atlas'
import { Nova } from './chapters/nova/Nova'
import { Toad } from './chapters/toad/Toad'
import { ToadPlayground } from './chapters/toad/ToadPlayground'
import { Hush } from './chapters/hush/Hush'
import { Moxie } from './chapters/moxie/Moxie'
import { Elsewhere } from './chapters/elsewhere/Elsewhere'
import { Finale } from './chapters/finale/Finale'
import { MuseumNav } from './nav/MuseumNav'
import { StaticExhibition } from './a11y/StaticExhibition'

const Stage = lazy(() => import('./stage/Stage'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

function readMotionPref() {
  try {
    const saved = localStorage.getItem('tmkm-motion')
    if (saved) return saved
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full'
}

const quality = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4 ? 'low' : 'high'

export default function App() {
  const [webgl] = useState(hasWebGL)
  const [motion, setMotion] = useState(readMotionPref)
  const mode = webgl && motion === 'full' ? 'cinematic' : 'static'

  const toggleMotion = () => {
    const next = motion === 'full' ? 'reduced' : 'full'
    try {
      localStorage.setItem('tmkm-motion', next)
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0)
    setMotion(next)
  }

  useEffect(() => {
    setUI({ reducedMotion: mode === 'static', webgl })
    if (mode !== 'cinematic') return
    startSmoothScroll()
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      input.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      input.pointerY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      window.removeEventListener('pointermove', onMove)
      stopSmoothScroll()
    }
  }, [mode, webgl])

  return (
    <div className={`app mode-${mode}`}>
      <a className="skip" href="#vesper">
        Skip to Exhibit 001
      </a>
      <MuseumNav mode={mode} onToggleMotion={toggleMotion} />
      {mode === 'cinematic' ? (
        <>
          <Suspense fallback={null}>
            <Stage quality={quality} />
          </Suspense>
          <ToadPlayground />
          <main>
            <Prologue />
            <Vesper />
            <Passage id="p-vesper" />
            <Aurelius />
            <Passage id="p-aurelius" />
            <Atlas />
            <Passage id="p-atlas" />
            <Nova />
            <Passage id="p-nova" />
            <Toad />
            <Passage id="p-toad" iris />
            <Hush />
            <Passage id="p-hush" />
            <Moxie />
            <Passage id="p-moxie" />
            <Elsewhere />
            <Passage id="p-elsewhere" />
            <Finale />
          </main>
        </>
      ) : (
        <StaticExhibition webgl={webgl} onToggleMotion={toggleMotion} />
      )}
    </div>
  )
}
