import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

// Smooth scrolling that keeps the native scrollbar, keyboard and history behaviour.
export function startSmoothScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time) => lenis && lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  lenis._tick = tick
  return lenis
}

export function stopSmoothScroll() {
  if (!lenis) return
  gsap.ticker.remove(lenis._tick)
  lenis.destroy()
  lenis = null
}

// Scroll to a section id, optionally to a fraction of the way through it.
export function scrollToSection(id, fraction = 0, immediate = false) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.offsetTop + (el.offsetHeight - window.innerHeight) * fraction
  // long jumps across several rooms are made instantly (the veils hide the cut); short ones glide
  const far = Math.abs(top - window.scrollY) > window.innerHeight * 6
  if (lenis && !immediate && !far) lenis.scrollTo(top, { duration: 1.6 })
  else if (lenis) lenis.scrollTo(top, { immediate: true })
  else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' })
}

export { gsap, ScrollTrigger }
