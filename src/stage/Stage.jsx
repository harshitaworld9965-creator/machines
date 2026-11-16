import { Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import { CameraDirector } from './CameraDirector'
import { Atmosphere } from './Atmosphere'
import { PrologueScene } from '../chapters/prologue/PrologueScene'
import { VesperScene } from '../chapters/vesper/VesperScene'
import { setUI, useUI } from '../experience/store'
import { sectionById } from '../data/exhibits'

// Every later room is code-split, and only mounted while the visitor is within one room of it.
const named = (p, n) => lazy(() => p().then((m) => ({ default: m[n] })))
const SCENES = [
  ['aurelius', named(() => import('../chapters/aurelius/AureliusScene'), 'AureliusScene')],
  ['atlas', named(() => import('../chapters/atlas/AtlasScene'), 'AtlasScene')],
  ['nova', named(() => import('../chapters/nova/NovaScene'), 'NovaScene')],
  ['toad', named(() => import('../chapters/toad/ToadScene'), 'ToadScene')],
  ['hush', named(() => import('../chapters/hush/HushScene'), 'HushScene')],
  ['moxie', named(() => import('../chapters/moxie/MoxieScene'), 'MoxieScene')],
  ['elsewhere', named(() => import('../chapters/elsewhere/ElsewhereScene'), 'ElsewhereScene')],
  ['finale', named(() => import('../chapters/finale/FinaleScene'), 'FinaleScene')],
]
const ORDER = ['vesper', ...SCENES.map(([r]) => r)]

function roomOfSection(id) {
  const s = sectionById[id]
  return s.room || s.to
}

// Procedural studio lighting for reflections: no HDR file to download.
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2} color="#f6e7da" position={[0, 5, -6]} scale={[10, 2, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#E7A7A0" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} />
      <Lightformer form="rect" intensity={0.9} color="#c7c2ff" position={[6, -1, 1]} rotation-y={-Math.PI / 2} scale={[6, 0.6, 1]} />
      <Lightformer form="ring" intensity={1.4} color="#ffffff" position={[0, 0, 6]} scale={2} />
    </Environment>
  )
}

export default function Stage({ quality }) {
  const section = useUI((s) => s.section)
  const here = ORDER.indexOf(roomOfSection(section))
  const near = (room) => Math.abs(ORDER.indexOf(room) - here) <= 1
  const dpr = quality === 'low' ? [1, 1.25] : [1, 1.5]

  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
        camera={{ fov: 42, near: 0.05, far: 260, position: [0, 1.6, 18] }}
        onCreated={() => requestAnimationFrame(() => setUI({ stageReady: true }))}
      >
        <AdaptiveDpr pixelated={false} />
        <Atmosphere />
        <CameraDirector />
        <Suspense fallback={null}>
          <Studio />
          {near('vesper') && <PrologueScene />}
          {near('vesper') && <VesperScene quality={quality} />}
        </Suspense>
        {SCENES.map(([room, Scene]) =>
          near(room) ? (
            <Suspense key={room} fallback={null}>
              <Scene quality={quality} />
            </Suspense>
          ) : null
        )}
      </Canvas>
    </div>
  )
}
