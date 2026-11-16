import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getRoom, leaving } from '../experience/store'
import { rooms } from '../data/exhibits'
import { smooth } from './math'

/** A room's group is only rendered while that room is on screen. */
export function useRoom(id) {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) ref.current.visible = getRoom() === id
  }, -1)
  return ref
}

export const roomOrigin = (id) => rooms[id].origin

const _cam = new THREE.Vector3()
const _fwd = new THREE.Vector3()
const _anchor = new THREE.Vector3()
const _q = new THREE.Quaternion()

/**
 * Drives a room's portal while the visitor leaves it.
 * The portal travels from its anchor (room-local) to just in front of the camera, turning to face it and
 * growing until it covers the frame at the halfway point of the passage, where the veil takes over.
 * mesh: a unit-sized plane or circle, base scale given by `size`.
 */
export function drivePortal(mesh, room, camera, anchor, size = [1, 1], baseQuat = null) {
  const t = Math.min(1, leaving(room) * 2)
  mesh.visible = t > 0.001
  if (!mesh.visible) return 0
  const e = smooth(t, 0, 1)
  const o = rooms[room].origin
  camera.getWorldDirection(_fwd)
  _cam.copy(camera.position).addScaledVector(_fwd, 1.0).sub(_anchor.set(o[0], o[1], o[2]))
  _anchor.fromArray(Array.isArray(anchor) ? anchor : anchor.toArray())
  mesh.position.copy(_anchor).lerp(_cam, e * e)
  _q.copy(baseQuat || mesh.userData.baseQuat || new THREE.Quaternion())
  mesh.quaternion.copy(_q).slerp(camera.quaternion, e)
  const cover = 3.4
  const grow = e * e
  mesh.scale.set(
    THREE.MathUtils.lerp(size[0], Math.max(size[0], cover), grow),
    THREE.MathUtils.lerp(size[1], Math.max(size[1], cover), grow),
    1
  )
  return e
}
