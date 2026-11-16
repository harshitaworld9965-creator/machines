import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { input, frame, getActive } from '../experience/store'
import { rooms, sectionById } from '../data/exhibits'
import { sampleKeys, damp, lerp, easeInOut } from './math'
import { chapterKeys, portalAnchor, metronome } from './cameras'
import { passageKeys } from './world'

/**
 * Decides where the camera should be from section progress, and eases towards it.
 * Rooms are joined by masked cuts: when the room changes the camera snaps while a veil covers the frame.
 */
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()

function chapterPose(id, t, pos, look) {
  if (id === 'moxie') t = metronome(t)
  return sampleKeys(chapterKeys[id], t, pos, look)
}

export function CameraDirector() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const goal = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }), [])
  const look = useRef(new THREE.Vector3(0, 1, -20))
  const lastRoom = useRef(null)
  const dir = useMemo(() => new THREE.Vector3(), [])
  const shake = useRef(0)

  useFrame((state, dt) => {
    const { section, t } = getActive()
    let room
    let fov

    if (section.from) {
      if (t < 0.5) {
        // leaving: start from the chapter's last pose and turn towards the room's portal
        room = section.from
        const u = easeInOut(t * 2)
        if (section.id === 'p-vesper') {
          fov = sampleKeys(passageKeys, t * 2, goal.pos, goal.look)
        } else {
          const keys = chapterKeys[room]
          const last = keys[keys.length - 1]
          const anchor = _a.fromArray(portalAnchor[room])
          goal.pos.fromArray(last.pos).lerp(anchor, 0.45 * u)
          goal.look.fromArray(last.look).lerp(anchor, u)
          fov = lerp(last.fov ?? 40, (last.fov ?? 40) + 8, u)
        }
      } else {
        // arriving: drift in from slightly further back to the chapter's first pose
        room = section.to
        const first = chapterKeys[room][0]
        const u = easeInOut(Math.min(1, (t - 0.5) * 2))
        _b.fromArray(first.pos).sub(_a.fromArray(first.look)).multiplyScalar(0.35)
        goal.pos.fromArray(first.pos).addScaledVector(_b, 1 - u)
        goal.look.fromArray(first.look)
        fov = first.fov ?? 40
      }
    } else {
      room = section.room
      fov = chapterPose(section.id, t, goal.pos, goal.look)
    }

    // Portrait screens: step back along the view line and widen slightly, so the subject still fits.
    const aspect = size.width / size.height
    if (aspect < 1.1) {
      const k = (1.1 - aspect) * 1.15
      dir.copy(goal.pos).sub(goal.look)
      goal.pos.addScaledVector(dir, k * 0.7)
      fov += k * 10
    }

    // Subtle pointer parallax, plus any shake a room asks for (Hush's restless opening).
    goal.pos.x += input.pointerX * 0.12
    goal.pos.y += input.pointerY * 0.08
    shake.current = lerp(shake.current, room === 'hush' ? frame.shake || 0 : 0, damp(3, dt))
    if (shake.current > 0.001) {
      const tt = state.clock.elapsedTime
      goal.pos.x += Math.sin(tt * 13.1) * Math.sin(tt * 3.7) * shake.current
      goal.pos.y += Math.sin(tt * 11.3 + 1) * Math.sin(tt * 2.9) * shake.current
    }

    const origin = _a.fromArray(rooms[room].origin)
    goal.pos.add(origin)
    goal.look.add(origin)

    if (lastRoom.current !== room) {
      camera.position.copy(goal.pos)
      look.current.copy(goal.look)
      lastRoom.current = room
    } else {
      const k = damp(room === 'moxie' ? 9 : 4.2, dt)
      camera.position.lerp(goal.pos, k)
      look.current.lerp(goal.look, k)
    }
    camera.lookAt(look.current)
    camera.fov = lerp(camera.fov, fov, damp(4, dt))
    camera.updateProjectionMatrix()
  })
  return null
}

export { sectionById }
