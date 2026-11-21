/**
 * What the help key explains under the pointer.
 *
 * The labels over the view take no pointer events - clicks go through them to
 * the view - so the browser's own hit test (`elementFromPoint`) never finds
 * them. The help asks each kind of label for its box instead, the most
 * specific kind first, and falls back to a unit's figure in the view. Read on
 * a pointer move at most a few times a second while the help is open, never on
 * the frame path.
 *
 * Kinds, not games: a capture zone is a capture zone in War Thunder and in
 * Squad, and a bomb site is only ever Counter-Strike's - so nothing here can
 * explain a War Thunder label with Counter-Strike's words, which is what the
 * old key did (its match colours were the CS sides, whatever was loaded).
 */

/** The kinds of thing under the pointer the help can explain (`help.at.<kind>`). */
export type HelpTarget =
  | 'zone'
  | 'site'
  | 'marker'
  | 'unit'
  | 'event'
  | 'lock'
  | 'engage'
  | 'braa'
  | 'place'
  | 'grid'
  | 'raceLabel'
  | 'figure'
  | 'chartButton'
  | 'chartSign';

/** Selectors for each kind, most specific first: the first whose box holds the point wins. */
export const HELP_TARGETS: ReadonlyArray<[string, HelpTarget]> = [
  ['.vsign-btn', 'chartButton'],
  ['.vsign', 'chartSign'],
  ['.objective-label.zone', 'zone'],
  ['.objective-label.site', 'site'],
  ['.objective-label', 'marker'],
  ['.replay-braa', 'braa'],
  ['.replay-lock', 'lock'],
  ['.replay-engage', 'engage'],
  ['.replay-event', 'event'],
  ['.replay-label', 'unit'],
  ['.world-label', 'place'],
  ['.geo-grid-label, .geo-grid-zone, .geo-gs-label', 'grid'],
  ['.race-label', 'raceLabel'],
];

/** A box, as `getBoundingClientRect` gives it. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * The kind of the first element whose box holds (x, y), trying the kinds in
 * order. `find` lists the elements for a selector, `box` gives an element's box
 * (both the DOM's in the viewer; stand-ins in tests). Hidden elements (an
 * empty box) never match.
 */
export function targetAt<E>(
  x: number,
  y: number,
  find: (selector: string) => Iterable<E>,
  box: (el: E) => Box,
  visible: (el: E) => boolean = () => true,
): HelpTarget | null {
  for (const [selector, kind] of HELP_TARGETS) {
    for (const el of find(selector)) {
      const b = box(el);
      if (b.right <= b.left || b.bottom <= b.top) continue;
      if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom && visible(el)) return kind;
    }
  }
  return null;
}

/** The same over the page, with a unit's figure in the view as the last resort. */
export function targetInPage(x: number, y: number, figureAt: ((x: number, y: number) => boolean) | null): HelpTarget | null {
  const hit = targetAt(
    x,
    y,
    (s) => document.querySelectorAll(s),
    (el) => el.getBoundingClientRect(),
    (el) => (el as HTMLElement).style.display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > 0.05,
  );
  if (hit) return hit;
  return figureAt?.(x, y) ? 'figure' : null;
}
