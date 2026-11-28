/**
 * The shell's icons: line drawings on a 24-unit grid, drawn in the text
 * colour, never carrying meaning alone (every icon sits beside a word or has a
 * label and a tooltip). Hidden from assistive technology.
 */

const PATHS = {
  heat: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.4 1.2-3.8 2.4-5 .2 1.6 1 2.6 2.1 3.1C11 8.6 11.3 5.8 12 3Z',
  race: 'M5 21V4m0 0h11l-2 4 2 4H5',
  match: 'M4 18l5-6 4 3 7-9M4 6h4M16 18h4',
  plan: 'M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2V6Zm5-2v14m6-12v14',
  vehicle: 'M3 15l2-5h14l2 5v3H3v-3Zm4-5 1.5-4h7L17 10M7 18v2m10-2v2',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4.5 4.5',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2.5-11.5a2.6 2.6 0 0 1 5 1c0 1.8-2.5 2.2-2.5 4M12 17.2v.1',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.5 7.5 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-2.2-1.3L14.4 3h-4l-.4 2.4a7.4 7.4 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 2.2 1.3l.4 2.4h4l.4-2.4a7.4 7.4 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3Z',
  keyboard: 'M3 7h18v11H3V7Zm3 3h1m3 0h1m3 0h1m3 0h1M6 14h1m3 0h4m3 0h1',
  panel: 'M4 4h16v16H4V4Zm6 0v16',
  play: 'M8 5v14l11-7L8 5Z',
  pause: 'M8 5v14m8-14v14',
  frame: 'M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5m8-1a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  above: 'M12 3v4m0 0-2-2m2 2 2-2M4 14l8-4 8 4-8 4-8-4Zm0 0v3l8 4 8-4v-3',
  bookmark: 'M7 3h10v18l-5-4-5 4V3Z',
  ruler: 'M3 17 17 3l4 4L7 21l-4-4Zm4-4 2 2m1-5 2 2m1-5 2 2',
  load: 'M12 3v12m0 0-4-4m4 4 4-4M4 17v3h16v-3',
  explore: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z',
  compare: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  analyse: 'M4 4v16h16M8 15l3-4 3 2 5-6',
  draw: 'M4 20l4-1L19 8l-3-3L5 16l-1 4Zm10-13 3 3',
  checklist: 'M9 3h6v3H9V3ZM9 4.5H6V21h12V4.5h-3M9 12l2 2 4-4M9 17h6',
  undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  redo: 'M15 14l5-5-5-5m5 5H10a6 6 0 0 0 0 12h3',
  rotl: 'M3 4v5h5M3.5 13a8.5 8.5 0 1 0 2-6.5L3 9',
  rotr: 'M21 4v5h-5m4.5 4a8.5 8.5 0 1 1-2-6.5L21 9',
  file: 'M6 3h8l4 4v14H6V3Zm8 0v4h4',
  present: 'M3 4h18v12H3V4Zm9 12v4m-4 0h8M10 8l4 2-4 2V8Z',
  all: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  close: 'M6 6l12 12M18 6 6 18',
  enter: 'M20 5v6a3 3 0 0 1-3 3H5m0 0 4-4m-4 4 4 4',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-14v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z',
  cursor: 'M5 3l14 7-6 2-2 6L5 3Z',
  note: 'M5 3h10l4 4v14H5V3Zm10 0v4h4M8 11h8M8 15h8M8 19h5',
  people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0 0-6m2.5 15a6 6 0 0 0-3.5-5.5',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  sync: 'M4 10a8 8 0 0 1 14.5-3.5L20 8m0-4v4h-4m4 6a8 8 0 0 1-14.5 3.5L4 16m0 4v-4h4',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={`icon-svg${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
