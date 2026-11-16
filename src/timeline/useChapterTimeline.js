import { useGSAP } from '@gsap/react'
import { gsap } from '../experience/scroll'
import { progress, setUI, getRoom } from '../experience/store'
import { rooms } from '../data/exhibits'

/**
 * One ScrollTrigger per section.
 * - writes the section's scrubbed 0..1 progress into the shared store (read by the 3D stage)
 * - scrubs an optional GSAP timeline for the section's HTML typography
 * - reports which section is current, and whether the UI should be drawn dark-on-light
 * Everything is created inside useGSAP, so it is reverted on unmount.
 * build(tl) receives a timeline whose duration is mapped to 0..1 of the section.
 */
export function useChapterTimeline(sectionRef, id, build, deps = []) {
  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          progress[id] = tl.progress()
          setUI({ tone: rooms[getRoom()].tone })
        },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
          onToggle: (self) => {
            if (self.isActive) setUI({ section: id })
          },
        },
      })
      if (build) build(tl)
      if (tl.duration() < 1) tl.to({}, { duration: 1 - tl.duration() })
    },
    { scope: sectionRef, dependencies: deps }
  )
}
