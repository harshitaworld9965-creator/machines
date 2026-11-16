# The Machines That Know Me

A scroll-driven museum of eight personal devices: a prologue, eight rooms, the passages between them,
and a constellation finale. Every device is a **provisional placeholder** until its hardware is confirmed.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build
```

Node 18+.

## The visit

| # | Room | Camera signature | Hands-on interaction |
|---|---|---|---|
| 000 | Prologue | Slow dolly down a hall of monoliths | Pointer parallax |
| 001 | Vesper | Macro pull-back, then a three-quarter orbit | Drag or arrow keys to turn the phone; **Memory Orbit** |
| 002 | Aurelius | Almost still; the object moves, not the lens | **Lid** slider and open/close; **Inspect** (hotspots + checklist) |
| 003 | Atlas | Worm's-eye orbit, then a crane up | **Build Mode**: Grid, Beams, Stairs, Tower on/off, plus **Rearrange** |
| 004 | Nova | Into the picture and back out | **Three worlds**: Tide, Orchard, Glass City (screen, sky and landscape change) |
| 005 | Toad | Supercar commercial, played straight | **Giant cursor** in a physics world (matter-js): follow, grab, shake, reset; arrows + Space on keyboard |
| 006 | Hush | Handheld and restless, ending perfectly still | **Noise Cancellation** switch |
| 007 | Moxie | Metronomic: the camera ticks | **Four faces** (each retunes the rings); **Moxie says…** |
| 008 | Elsewhere | Longest push, straight through the screen | **Channel selector**: Midnight Ocean, Cloud City, Labyrinth |
| ∞ | Constellation | Reverse dolly out of a point of light | Hover or focus a name to light its line; click to return to that room |

Passages: each room's "portal" (a window, a beam, a folding plane, a moving point, a mute button,
a closing line, an aperture, a collapsing point) grows until it fills the frame. A veil of the same
colour holds the frame while the camera changes rooms, then lifts.

## Architecture

```
src/
  data/exhibits.js        names, copy, palettes, section order + lengths, rooms   ← edit nicknames here
  data/manifest.json      asset manifest: source, format, use, fidelity, priority
  experience/store.js     scroll progress (per frame) + UI/interaction state; getActive(), getRoom()
  experience/scroll.js    Lenis smooth scroll on GSAP's ticker; scrollToSection()
  timeline/               one scrubbed ScrollTrigger per section (useGSAP cleanup)
  stage/                  single fixed canvas, CameraDirector, cameras.js (all choreography),
                          Atmosphere, room.js (useRoom, drivePortal)
  devices/Placeholders.jsx   provisional Laptop, Tablet, Mouse, BudsCase, Watch, Television
  chapters/<room>/        Scene.jsx (3D) + <Room>.jsx (type & controls); ExhibitChapter, Passage
  chapters/toad/ToadPlayground.jsx   the 2D physics layer
  nav/MuseumNav.jsx       top bar, rail, index dialog
  a11y/StaticExhibition.jsx   reduced-motion / no-WebGL version
```

- Only the room on screen renders. Rooms more than one step away are unmounted. Toad, Hush and the finale are code-split too; the other rooms share constants with their overlays, so they ship in the main bundle.
- matter-js only loads when the visitor reaches Nova.
- DPR is capped at 1.5, or 1.25 on low-tier devices.
- Long jumps from the rail, index or finale are instant, because the veils hide the cut.

## Unverified hardware (everything is a placeholder)

| Exhibit | Needs confirmation |
|---|---|
| 001 Vesper (S22 Ultra) | colour, case, S Pen, exact lens/flash/laser positions |
| 002 Aurelius (MacBook) | model & year, colour, logo, proportions, keyboard, ports |
| 003 Atlas (EliteBook) | series/model, colour, screen size |
| 004 Nova (Motorola tablet) | model, colour, bezel, camera, case |
| 005 Toad (wireless mouse) | brand/model, colour, buttons |
| 006 Hush (CMF Buds 2) | colour, case and bud shape |
| 007 Moxie (CMF Watch Pro 2) | colour, bezel, strap, case size |
| 008 Elsewhere (Vu TV) | model/size, stand or wall mount, bezel |

All screens, worlds, fragments and watch faces are original artwork. They show no real apps, photos,
messages, footage or fitness data. Moxie's faces show the visitor's own clock.

## Known limitations

- Placeholder geometry throughout; none of it is verified against the owner's devices.
- Silent: no audio is included.
- Posters in `public/posters/` are screenshots of this build. Regenerate them when scenes change.
- Tested in headless Chrome with software WebGL at 1440×900, 834×1112 and 390×844.
  Not yet profiled on a real phone GPU.
