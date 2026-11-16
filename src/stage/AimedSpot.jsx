import { useLayoutEffect, useRef } from 'react'

// A spotlight whose target lives inside the same room group, so it aims at the room, not the world origin.
export function AimedSpot({ at = [0, 0, 0], ...props }) {
  const light = useRef()
  const target = useRef()
  useLayoutEffect(() => {
    light.current.target = target.current
  }, [])
  return (
    <>
      <spotLight ref={light} {...props} />
      <object3D ref={target} position={at} />
    </>
  )
}
