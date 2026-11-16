// Every name, line of copy, palette and chapter setting lives here.
// Change a nickname or a line of copy in this file only; no animation code reads strings directly.

export const ARCHIVE_CODE = 'TMKM'

export const site = {
  title: ['THE MACHINES', 'THAT KNOW', 'ME'],
  subtitle: 'An inventory of the things that have quietly become part of me.',
  classification: 'PERSONAL ARCHIVE / EIGHT ARTIFACTS / ONE OWNER',
  base: { ink: '#14110F', paper: '#EFE8DC' },
}

// status: 'built' = chapter exists in this build; 'teaser' = arrival room only; 'planned' = Stage 4
export const exhibits = [
  {
    id: 'vesper',
    number: '001',
    nickname: 'VESPER',
    device: 'Samsung Galaxy S22 Ultra',
    theme: 'MEMORY',
    title: 'The Keeper of Everything',
    statement: 'Somewhere between a camera, a diary and a second brain.',
    secondary: 'It probably knows too much.',
    palette: { room: '#2A1B2E', accent: '#E7A7A0' },
    status: 'built',
  },
  {
    id: 'aurelius',
    number: '002',
    nickname: 'AURELIUS',
    device: 'Apple MacBook',
    theme: 'HISTORY',
    title: 'The Beautiful Relic',
    statement: 'Some machines become obsolete. Others become artifacts.',
    secondary: 'Retired from urgency. Promoted to history.',
    palette: { room: '#8C8780', accent: '#B08D4C' },
    status: 'built',
  },
  {
    id: 'atlas',
    number: '003',
    nickname: 'ATLAS',
    device: 'HP EliteBook',
    theme: 'AMBITION',
    title: 'The Machine That Carries Ambition',
    statement: 'Carrying an unreasonable number of unfinished ideas.',
    secondary: 'And a few that might change everything.',
    palette: { room: '#1E3A5F', accent: '#F26B21' },
    status: 'built',
  },
  {
    id: 'nova',
    number: '004',
    nickname: 'NOVA',
    device: 'Motorola tablet',
    theme: 'IMAGINATION',
    title: 'The Portable Universe',
    statement: 'A universe that fits in a bag.',
    secondary: 'Reality is optional here.',
    palette: { room: '#DCE6E2', accent: '#2B3FD6' },
    status: 'built',
  },
  {
    id: 'toad',
    number: '005',
    nickname: 'TOAD',
    device: 'Wireless mouse',
    theme: 'CREATION',
    title: 'The Smallest Hero',
    statement: 'Small creature. Enormous responsibilities.',
    secondary: 'Employee of the month. Every month.',
    palette: { room: '#F1E9D2', accent: '#3F7D3A' },
    status: 'built',
  },
  {
    id: 'hush',
    number: '006',
    nickname: 'HUSH',
    device: 'CMF Buds 2',
    theme: 'ESCAPE',
    title: 'The Art of Disappearing',
    statement: 'Two tiny objects. One very effective escape plan.',
    secondary: 'The world can wait.',
    palette: { room: '#C9C5BD', accent: '#14110F' },
    status: 'built',
  },
  {
    id: 'moxie',
    number: '007',
    nickname: 'MOXIE',
    device: 'CMF Watch Pro 2',
    theme: 'MOMENTUM',
    title: 'The Tiny Boss',
    statement: 'Very fashionable. Extremely opinionated.',
    secondary: 'Apparently, sitting down is a personal failure.',
    palette: { room: '#0E0E0E', accent: '#F5C400' },
    status: 'built',
  },
  {
    id: 'elsewhere',
    number: '008',
    nickname: 'ELSEWHERE',
    device: 'Vu television',
    theme: 'STORIES',
    title: 'The Portal',
    statement: 'One screen. Approximately a thousand other lives.',
    secondary: 'Reality resumes after the next episode.',
    palette: { room: '#3B0D12', accent: '#F4F7FF' },
    status: 'built',
  },
]

export const byId = Object.fromEntries(exhibits.map((e) => [e.id, e]))

export const classificationLine = (e) =>
  `${ARCHIVE_CODE} / ${e.number} / ${e.nickname} / ${e.theme}`

// The visit, in order. Chapters belong to a room; passages carry the camera from one room to the next
// through a "portal" object that fills the frame, hidden behind a veil of the same colour.
export const sections = [
  { id: 'prologue', vh: 260, room: 'vesper' },
  { id: 'vesper', vh: 520, room: 'vesper', exhibit: 'vesper' },
  { id: 'p-vesper', vh: 170, from: 'vesper', to: 'aurelius', veil: 'radial-gradient(120% 90% at 50% 30%, #e6e0d6 0%, #b3ada4 38%, #8C8780 70%, #6e6962 100%)', note: 'One fragment is a window' },
  { id: 'aurelius', vh: 440, room: 'aurelius', exhibit: 'aurelius' },
  { id: 'p-aurelius', vh: 150, from: 'aurelius', to: 'atlas', veil: '#f7efe1', note: 'A beam of light becomes a working surface' },
  { id: 'atlas', vh: 460, room: 'atlas', exhibit: 'atlas' },
  { id: 'p-atlas', vh: 150, from: 'atlas', to: 'nova', veil: '#DCE6E2', note: 'The architecture folds into one plane' },
  { id: 'nova', vh: 440, room: 'nova', exhibit: 'nova' },
  { id: 'p-nova', vh: 150, from: 'nova', to: 'toad', veil: '#F1E9D2', note: 'A small moving point becomes a cursor' },
  { id: 'toad', vh: 440, room: 'toad', exhibit: 'toad' },
  { id: 'p-toad', vh: 150, from: 'toad', to: 'hush', veil: '#C9C5BD', note: 'Click. Mute.' },
  { id: 'hush', vh: 420, room: 'hush', exhibit: 'hush' },
  { id: 'p-hush', vh: 150, from: 'hush', to: 'moxie', veil: '#0E0E0E', note: 'The line closes into a circle' },
  { id: 'moxie', vh: 440, room: 'moxie', exhibit: 'moxie' },
  { id: 'p-moxie', vh: 150, from: 'moxie', to: 'elsewhere', veil: '#120305', note: 'The dial opens into an aperture' },
  { id: 'elsewhere', vh: 520, room: 'elsewhere', exhibit: 'elsewhere' },
  { id: 'p-elsewhere', vh: 150, from: 'elsewhere', to: 'finale', veil: '#08070c', note: 'Every world collapses into one point' },
  { id: 'finale', vh: 360, room: 'finale' },
]
export const sectionById = Object.fromEntries(sections.map((s) => [s.id, s]))

// Rooms: where they sit in the world and how their air looks. tone = colour of the UI drawn over them.
export const rooms = {
  vesper: { origin: [0, 0, -40], bg: '#1a1020', fog: [8, 38], tone: 'dark' },
  aurelius: { origin: [400, 0, -40], bg: '#8C8780', fog: [10, 34], tone: 'light' },
  atlas: { origin: [800, 0, -40], bg: '#14263f', fog: [14, 60], tone: 'dark' },
  nova: { origin: [1200, 0, -40], bg: '#DCE6E2', fog: [12, 50], tone: 'light' },
  toad: { origin: [1600, 0, -40], bg: '#F1E9D2', fog: [30, 90], tone: 'light' },
  hush: { origin: [2000, 0, -40], bg: '#C9C5BD', fog: [8, 40], tone: 'light' },
  moxie: { origin: [2400, 0, -40], bg: '#0E0E0E', fog: [12, 50], tone: 'dark' },
  elsewhere: { origin: [2800, 0, -40], bg: '#1c0508', fog: [14, 70], tone: 'dark' },
  finale: { origin: [3200, 0, -40], bg: '#0b0a10', fog: [30, 120], tone: 'dark' },
}
