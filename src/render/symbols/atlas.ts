/**
 * The far-off symbols' atlas: every symbology's frames and icons and the
 * weapons' and decoys' glyphs, drawn once with Canvas 2D into 64 px cells of
 * one RGBA texture. The shapes are our own drawings of the public
 * conventions' geometry (APP-6 / MIL-STD-2525 frames and icons, Soviet and
 * Russian topographic signs), not copied icon art.
 *
 * Channels, so that one cell takes any colour the shader gives it: R the
 * area filled with the affiliation's colour, G the lines (and solid marks)
 * in the line colour, B a glow added on top (a motor, a flare), A a halo
 * round everything for contrast on any ground.
 *
 * Cell coordinates: -1..1 across the cell, y down, the unit's forward up
 * (-y) for the glyphs that turn with their heading.
 */

import { SYMBOL_CLASSES, type SymbolClass } from '../../figures/symbolClass';

export const CELL = 64;
export const ATLAS_COLUMNS = 16;
const N = SYMBOL_CLASSES.length;

/** Affiliations, in the atlas's order. */
export const AFFILIATIONS = ['unknown', 'friend', 'hostile', 'neutral'] as const;
/** A frame's domain: how the standards bound it. */
export const FRAME_DOMAINS = ['air', 'ground', 'sea', 'sub'] as const;
/** The weapons' and decoys' glyphs. */
export const EFFECTS = ['missile', 'rocket', 'bomb', 'guided-bomb', 'flare', 'chaff', 'misc', 'shell'] as const;
/** The game-map style's glyphs, by `Domain` value. */
export const MAP_GLYPHS = 16;

/** Where each set starts, in cells: the shaders compute the same (`symbolLayoutGlsl`). */
export const LAYOUT = {
  natoFrames: 0,
  natoIcons: 16,
  russianIcons: 16 + N,
  mapGlyphs: 16 + 2 * N,
  effects: 16 + 2 * N + MAP_GLYPHS,
  cells: 16 + 2 * N + MAP_GLYPHS + EFFECTS.length,
};
export const ATLAS_ROWS = Math.ceil(LAYOUT.cells / ATLAS_COLUMNS);
export const ATLAS_WIDTH = ATLAS_COLUMNS * CELL;
export const ATLAS_HEIGHT = ATLAS_ROWS * CELL;

export function natoFrameCell(affiliation: number, frameDomain: number): number {
  return LAYOUT.natoFrames + affiliation * 4 + frameDomain;
}

/** The cell's top-left pixel. */
export function cellOrigin(cell: number): [number, number] {
  return [(cell % ATLAS_COLUMNS) * CELL, Math.floor(cell / ATLAS_COLUMNS) * CELL];
}

// ------------------------------------------------------------------ drawing

/** A path in cell coordinates. */
interface Path {
  M(x: number, y: number): Path;
  L(x: number, y: number): Path;
  Z(): Path;
  arc(x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean): Path;
  ellipse(x: number, y: number, rx: number, ry: number): Path;
  circle(x: number, y: number, r: number): Path;
  poly(pts: number[], close?: boolean): Path;
}

/** What a cell is drawn with: each call is made once a channel. */
export interface Pen {
  /** Filled with the affiliation's colour. */
  area(p: (path: Path) => void): void;
  /** Filled with the line colour. */
  ink(p: (path: Path) => void): void;
  /** Stroked with the line colour, `w` in cell units. */
  line(p: (path: Path) => void, w?: number): void;
  /** A soft glow of radius `r`. */
  glow(x: number, y: number, r: number): void;
  text(s: string, x: number, y: number, size: number): void;
}

/** The 2D context calls the atlas uses (a canvas's, or a test's recorder). */
export interface Ctx2D {
  fillStyle: string | CanvasGradient;
  strokeStyle: string;
  lineWidth: number;
  lineJoin: CanvasLineJoin;
  lineCap: CanvasLineCap;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  globalCompositeOperation: GlobalCompositeOperation;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;
  arc(x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean): void;
  ellipse(x: number, y: number, rx: number, ry: number, rot: number, a0: number, a1: number): void;
  fill(): void;
  stroke(): void;
  fillText(s: string, x: number, y: number): void;
  strokeText(s: string, x: number, y: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
  getImageData(x: number, y: number, w: number, h: number): ImageData;
}

type Layer = 'fill' | 'line' | 'glow' | 'halo';
const HALO = 0.16;
const LINE = 0.075;

/** A pen drawing one channel of the cell at (ox, oy), white on black. */
function penFor(ctx: Ctx2D, layer: Layer, ox: number, oy: number): Pen {
  const h = CELL / 2;
  const X = (x: number) => ox + h + x * h;
  const Y = (y: number) => oy + h + y * h;
  const path: Path = {
    M(x, y) {
      ctx.moveTo(X(x), Y(y));
      return path;
    },
    L(x, y) {
      ctx.lineTo(X(x), Y(y));
      return path;
    },
    Z() {
      ctx.closePath();
      return path;
    },
    arc(x, y, r, a0, a1, ccw) {
      ctx.arc(X(x), Y(y), r * h, a0, a1, ccw);
      return path;
    },
    ellipse(x, y, rx, ry) {
      ctx.moveTo(X(x + rx), Y(y));
      ctx.ellipse(X(x), Y(y), rx * h, ry * h, 0, 0, Math.PI * 2);
      return path;
    },
    circle(x, y, r) {
      ctx.moveTo(X(x + r), Y(y));
      ctx.arc(X(x), Y(y), r * h, 0, Math.PI * 2);
      return path;
    },
    poly(pts, close = true) {
      for (let i = 0; i < pts.length; i += 2) (i ? ctx.lineTo : ctx.moveTo).call(ctx, X(pts[i]), Y(pts[i + 1]));
      if (close) ctx.closePath();
      return path;
    },
  };
  const run = (p: (path: Path) => void) => {
    ctx.beginPath();
    p(path);
  };
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  return {
    area(p) {
      if (layer !== 'fill' && layer !== 'halo') return;
      run(p);
      ctx.fill();
      if (layer === 'halo') {
        ctx.lineWidth = HALO * h;
        ctx.stroke();
      }
    },
    ink(p) {
      if (layer !== 'line' && layer !== 'halo') return;
      run(p);
      ctx.fill();
      if (layer === 'halo') {
        ctx.lineWidth = HALO * h;
        ctx.stroke();
      }
    },
    line(p, w = LINE) {
      if (layer !== 'line' && layer !== 'halo') return;
      run(p);
      ctx.lineWidth = (w + (layer === 'halo' ? HALO : 0)) * h;
      ctx.stroke();
    },
    glow(x, y, r) {
      if (layer !== 'glow') return;
      const g = ctx.createRadialGradient(X(x), Y(y), 0, X(x), Y(y), r * h);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(255,255,255,0.75)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(X(x - r), Y(y - r), 2 * r * h, 2 * r * h);
      ctx.fillStyle = '#fff';
    },
    text(s, x, y, size) {
      if (layer !== 'line' && layer !== 'halo') return;
      ctx.font = `bold ${Math.round(size * h)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (layer === 'halo') {
        ctx.lineWidth = HALO * h;
        ctx.strokeText(s, X(x), Y(y));
      }
      ctx.fillText(s, X(x), Y(y));
    },
  };
}

// --- APP-6 / MIL-STD-2525 frames.

/** The quatrefoil's lobes: circles of radius R at distance D on each axis; the outer crossing's angle off each lobe's axis. */
const D = 0.3;
const R = 0.33;
const CROSS = (() => {
  const s = (D + Math.sqrt(2 * R * R - D * D)) / 2;
  return Math.atan2(s, s - D);
})();

function quatrefoil(p: Path, lobes: number[], open?: [number, number]): void {
  // Lobes by angle (canvas: 0 right, PI/2 down, PI left, 3PI/2 up).
  let first = true;
  for (const k of lobes) {
    const a = (k * Math.PI) / 2;
    const cx = D * Math.cos(a);
    const cy = D * Math.sin(a);
    const from = open && first ? a : a - CROSS;
    const to = open && k === lobes[lobes.length - 1] ? a : a + CROSS;
    if (first) p.M(cx + R * Math.cos(from), cy + R * Math.sin(from));
    p.arc(cx, cy, R, from, to);
    first = false;
  }
  if (open) {
    p.L(D + R, open[1]);
    p.M(-(D + R), open[1]).L(-(D + R), 0);
  } else p.Z();
}

/** A frame: its outline as a path, and its interior closed for the fill. */
function frame(aff: number, dom: number, closed: boolean): (p: Path) => void {
  const unknown = aff === 0, friend = aff === 1, hostile = aff === 2;
  // Air: open at the bottom; sub: open at the top; ground and sea: closed.
  if (dom === 0) {
    const yb = 0.42;
    if (friend) return (p) => (p.M(-0.62, yb).arc(0, yb, 0.62, Math.PI, Math.PI * 2), closed ? p.Z() : p);
    if (hostile) return (p) => p.poly([-0.55, yb, -0.55, -0.05, 0, -0.62, 0.55, -0.05, 0.55, yb], closed);
    if (unknown) return (p) => (closed ? quatrefoil(p, [2, 3, 0]) : quatrefoil(p, [2, 3, 0], [0, yb]));
    return (p) => p.poly([-0.52, yb, -0.52, -0.55, 0.52, -0.55, 0.52, yb], closed);
  }
  if (dom === 3) {
    const yt = -0.42;
    if (friend) return (p) => (p.M(0.62, yt).arc(0, yt, 0.62, 0, Math.PI), closed ? p.Z() : p);
    if (hostile) return (p) => p.poly([0.55, yt, 0.55, 0.05, 0, 0.62, -0.55, 0.05, -0.55, yt], closed);
    if (unknown) return (p) => (closed ? quatrefoil(p, [0, 1, 2]) : quatrefoil(p, [0, 1, 2], [0, yt]));
    return (p) => p.poly([0.52, yt, 0.52, 0.55, -0.52, 0.55, -0.52, yt], closed);
  }
  if (hostile) return (p) => p.poly([0, -0.7, 0.7, 0, 0, 0.7, -0.7, 0]);
  if (unknown) return (p) => quatrefoil(p, [0, 1, 2, 3]);
  if (aff === 3) return (p) => p.poly([-0.52, -0.52, 0.52, -0.52, 0.52, 0.52, -0.52, 0.52]);
  // Friend: a land unit's rectangle, a sea surface track's circle.
  if (dom === 2) return (p) => p.circle(0, 0, 0.58);
  return (p) => p.poly([-0.72, -0.48, 0.72, -0.48, 0.72, 0.48, -0.72, 0.48]);
}

function drawFrame(g: Pen, aff: number, dom: number): void {
  g.area(frame(aff, dom, true));
  g.line(frame(aff, dom, false));
}

// --- APP-6 / MIL-STD-2525 icons, inside the frame (about +-0.42 by +-0.3).

const X0 = 0.42, Y0 = 0.3;
const ICON_W = 0.06;

function letter(g: Pen, s: string, y = 0.02, size = 0.5): void {
  g.text(s, 0, y, size);
}

function bowtie(g: Pen): void {
  g.ink((p) => p.poly([-0.38, -0.16, 0, 0, -0.38, 0.16]));
  g.ink((p) => p.poly([0.38, -0.16, 0, 0, 0.38, 0.16]));
}

function uavChevron(g: Pen): void {
  g.ink((p) => p.poly([-0.4, -0.1, 0, 0.06, 0.4, -0.1, 0.4, 0.04, 0, 0.2, -0.4, 0.04]));
}

function missileUp(g: Pen, s = 1): void {
  g.ink((p) => p.poly([0, -0.36 * s, 0.06 * s, -0.24 * s, 0.06 * s, 0.22 * s, 0.15 * s, 0.34 * s, -0.15 * s, 0.34 * s, -0.06 * s, 0.22 * s, -0.06 * s, -0.24 * s]));
}

function hull(g: Pen, y = 0.06, w = 0.42, solid = false): void {
  const f = (p: Path) => p.poly([-w, y - 0.08, w, y - 0.08, w * 0.72, y + 0.1, -w * 0.72, y + 0.1]);
  if (solid) g.ink(f);
  else g.line(f, ICON_W);
}

function cross(g: Pen): void {
  g.line((p) => p.M(-X0, -Y0).L(X0, Y0).M(X0, -Y0).L(-X0, Y0), ICON_W);
}

function natoIcon(g: Pen, c: SymbolClass): void {
  switch (c) {
    case 'unknown':
      return letter(g, '?');
    case 'fighter':
      return letter(g, 'F');
    case 'attack':
      return letter(g, 'A');
    case 'bomber':
      return letter(g, 'B');
    case 'transport':
      return letter(g, 'C');
    case 'tanker':
      return letter(g, 'K');
    case 'recon':
      return letter(g, 'R');
    case 'trainer':
      return letter(g, 'T');
    case 'uav':
      return uavChevron(g);
    case 'rotary':
      return bowtie(g);
    case 'rotary-attack':
      bowtie(g);
      return g.text('A', 0, -0.3, 0.26);
    case 'uav-rotary':
      bowtie(g);
      return g.text('U', 0, -0.3, 0.26);
    case 'missile-aam':
    case 'missile-sam':
    case 'missile-agm':
    case 'missile-ship':
    case 'missile':
      return missileUp(g, 0.95);
    case 'bomb':
    case 'guided-bomb':
      return letter(g, 'BB', 0.02, 0.36);
    case 'rocket':
      return missileUp(g, 0.7);
    case 'armour':
      return g.line((p) => p.ellipse(0, 0, 0.36, 0.18), ICON_W);
    case 'mech-inf':
      cross(g);
      return g.line((p) => p.ellipse(0, 0, 0.3, 0.15), ICON_W);
    case 'motor-inf':
      cross(g);
      return g.line((p) => p.M(0, -Y0).L(0, Y0), ICON_W);
    case 'recon-ground':
      return g.line((p) => p.M(-X0, Y0).L(X0, -Y0), ICON_W);
    case 'anti-tank':
      return g.line((p) => p.M(-X0, Y0).L(0, -Y0).L(X0, Y0), ICON_W);
    case 'air-defence':
      return g.line((p) => p.M(-0.3, Y0).arc(0, Y0, 0.3, Math.PI, Math.PI * 2), ICON_W);
    case 'artillery':
      return g.ink((p) => p.circle(0, 0, 0.12));
    case 'rocket-artillery':
      g.ink((p) => p.circle(0, 0.12, 0.1));
      return g.line((p) => p.M(-0.14, -0.08).L(0, -0.26).L(0.14, -0.08), ICON_W);
    case 'transport-ground':
      g.line((p) => p.circle(0, 0, 0.2), ICON_W);
      return g.line((p) => p.M(-0.2, 0).L(0.2, 0).M(0, -0.2).L(0, 0.2), ICON_W * 0.8);
    case 'radar':
      g.line((p) => p.M(-0.28, -0.22).arc(-0.02, -0.02, 0.32, Math.PI * 1.15, Math.PI * 1.85).M(-0.02, -0.02).L(0.1, 0.24), ICON_W);
      return g.line((p) => p.M(0.0, -0.06).L(0.16, -0.18).L(0.14, -0.02).L(0.3, -0.14), ICON_W * 0.8);
    case 'installation':
      return g.ink((p) => p.poly([-0.18, -0.48, 0.18, -0.48, 0.18, -0.36, -0.18, -0.36]));
    case 'infantry':
      return cross(g);
    case 'medic':
      return g.line((p) => p.M(-0.24, 0).L(0.24, 0).M(0, -0.24).L(0, 0.24), ICON_W * 1.5);
    case 'at-infantry':
      cross(g);
      return g.line((p) => p.M(-X0, Y0).L(0, -Y0).L(X0, Y0), ICON_W);
    case 'parachutist':
      cross(g);
      return g.line((p) => p.M(-0.24, -0.08).arc(0, -0.08, 0.24, Math.PI, Math.PI * 2), ICON_W);
    case 'carrier':
      g.ink((p) => p.poly([-0.42, -0.1, 0.3, -0.1, 0.42, 0, 0.3, 0.1, -0.42, 0.1]));
      return;
    case 'combatant':
      hull(g, 0.08, 0.42, true);
      return g.ink((p) => p.poly([-0.1, -0.18, 0.08, -0.18, 0.08, 0, -0.1, 0]));
    case 'small-boat':
      return hull(g, 0.04, 0.26, true);
    case 'submarine':
      g.ink((p) => p.ellipse(0, 0.05, 0.38, 0.09));
      return g.ink((p) => p.poly([-0.06, -0.14, 0.08, -0.14, 0.1, 0, -0.08, 0]));
    case 'amphibious':
      hull(g, 0.12, 0.4);
      return g.text('L', 0, -0.1, 0.32);
    case 'merchant':
      hull(g, 0.12, 0.4);
      return g.text('M', 0, -0.1, 0.32);
    case 'mine-warfare':
      g.ink((p) => p.circle(0, 0, 0.12));
      return g.line((p) => p.M(0, -0.24).L(0, 0.24).M(-0.24, 0).L(0.24, 0).M(-0.17, -0.17).L(0.17, 0.17).M(0.17, -0.17).L(-0.17, 0.17), ICON_W);
    default:
      return;
  }
}

// --- Soviet / Russian tactical signs: line art in the side's colour, forward up.

function ruIcon(g: Pen, c: SymbolClass): void {
  const W = 0.08;
  const stadium = (w: number, h: number, y = 0) => (p: Path) => p.M(-w, y - h + w).arc(0, y - h + w, w, Math.PI, Math.PI * 2).L(w, y + h - w).arc(0, y + h - w, w, 0, Math.PI).Z();
  const gun = (y0: number, y1: number) => g.line((p) => p.M(0, y0).L(0, y1), W);
  const aircraft = (sweep: number, span: number, tail = 0.18) => {
    g.line((p) => p.M(0, -0.62).L(0, 0.5), W);
    g.line((p) => p.M(-span, 0.05 + sweep).L(0, -0.08).L(span, 0.05 + sweep), W);
    g.line((p) => p.M(-tail, 0.5).L(0, 0.4).L(tail, 0.5), W);
  };
  switch (c) {
    case 'fighter':
    case 'trainer':
      return aircraft(0.22, 0.46);
    case 'attack':
      aircraft(0.12, 0.5);
      return g.ink((p) => p.circle(0, -0.08, 0.08));
    case 'bomber':
      return aircraft(0.04, 0.62, 0.24);
    case 'transport':
    case 'tanker':
      aircraft(0, 0.62, 0.24);
      return g.ink((p) => p.circle(-0.3, 0.0, 0.05).circle(0.3, 0.0, 0.05));
    case 'recon':
      aircraft(0.1, 0.5);
      return g.line((p) => p.circle(0, 0.25, 0.1), W * 0.8);
    case 'uav':
      return aircraft(0.25, 0.38, 0.12);
    case 'rotary':
    case 'rotary-attack':
    case 'uav-rotary':
      g.line((p) => p.circle(0, -0.1, 0.18), W);
      g.line((p) => p.M(-0.55, -0.1).L(0.55, -0.1).M(0, 0.08).L(0, 0.6).M(-0.14, 0.6).L(0.14, 0.6), W);
      if (c === 'rotary-attack') g.ink((p) => p.circle(0, -0.1, 0.08));
      return;
    case 'missile-aam':
    case 'missile-sam':
    case 'missile-agm':
    case 'missile-ship':
    case 'missile':
    case 'rocket':
      g.line((p) => p.M(0, -0.6).L(0, 0.55).M(-0.16, -0.36).L(0, -0.6).L(0.16, -0.36), W);
      return g.line((p) => p.M(-0.14, 0.55).L(0, 0.4).L(0.14, 0.55), W);
    case 'armour':
      g.line(stadium(0.26, 0.48, 0.08), W);
      return gun(-0.4, -0.68);
    case 'mech-inf':
      g.line(stadium(0.24, 0.46, 0.08), W);
      g.line((p) => p.circle(0, 0.08, 0.1), W * 0.8);
      return gun(-0.38, -0.62);
    case 'motor-inf':
    case 'transport-ground':
      g.line((p) => p.poly([-0.24, -0.4, 0.24, -0.4, 0.24, 0.5, -0.24, 0.5]), W);
      g.ink((p) => p.circle(-0.34, -0.2, 0.07).circle(0.34, -0.2, 0.07).circle(-0.34, 0.3, 0.07).circle(0.34, 0.3, 0.07));
      if (c === 'transport-ground') g.line((p) => p.M(-0.24, -0.12).L(0.24, -0.12), W * 0.8);
      return;
    case 'recon-ground':
      g.line(stadium(0.22, 0.4, 0.1), W);
      return g.ink((p) => p.poly([0, -0.66, 0.22, -0.46, -0.22, -0.46]));
    case 'anti-tank':
      g.line((p) => p.M(0, 0.4).L(0, -0.62).M(-0.2, -0.4).L(0, -0.62).L(0.2, -0.4), W);
      return g.line((p) => p.M(-0.3, 0.4).L(0.3, 0.4), W);
    case 'artillery':
      g.line((p) => p.M(0, 0.2).L(0, -0.62), W);
      g.line((p) => p.M(-0.28, 0.2).L(0.28, 0.2).M(0, 0.2).L(-0.24, 0.6).M(0, 0.2).L(0.24, 0.6), W);
      return g.ink((p) => p.circle(0, 0.2, 0.08));
    case 'rocket-artillery':
      g.line((p) => p.poly([-0.28, -0.1, 0.28, -0.1, 0.28, 0.5, -0.28, 0.5]), W);
      return g.line((p) => p.M(-0.14, -0.1).L(-0.14, -0.6).M(0, -0.1).L(0, -0.66).M(0.14, -0.1).L(0.14, -0.6), W * 0.8);
    case 'air-defence':
      g.line((p) => p.M(-0.36, 0.5).arc(0, 0.5, 0.36, Math.PI, Math.PI * 2), W);
      return g.line((p) => p.M(0, 0.5).L(0, -0.6).M(-0.16, -0.38).L(0, -0.6).L(0.16, -0.38), W);
    case 'radar':
      g.line((p) => p.M(-0.4, -0.3).arc(0, 0.06, 0.52, Math.PI * 1.2, Math.PI * 1.8), W);
      return g.line((p) => p.M(0, -0.1).L(0, 0.5).M(-0.24, 0.5).L(0.24, 0.5), W);
    case 'installation':
      g.line((p) => p.poly([-0.36, -0.2, 0.36, -0.2, 0.36, 0.44, -0.36, 0.44]), W);
      return g.ink((p) => p.poly([-0.36, -0.2, -0.36, -0.66, 0.06, -0.54, -0.36, -0.42]));
    case 'infantry':
    case 'parachutist':
      g.line((p) => p.M(-0.3, 0.3).arc(0, 0.3, 0.3, Math.PI, Math.PI * 2), W);
      return gun(0.0, -0.6);
    case 'medic':
      g.line((p) => p.circle(0, 0, 0.36), W);
      return g.line((p) => p.M(-0.2, 0).L(0.2, 0).M(0, -0.2).L(0, 0.2), W);
    case 'at-infantry':
      g.line((p) => p.M(-0.3, 0.3).arc(0, 0.3, 0.3, Math.PI, Math.PI * 2), W);
      return g.line((p) => p.M(0, 0.0).L(0, -0.6).M(-0.16, -0.6).L(0.16, -0.6), W);
    case 'carrier':
      g.line((p) => p.poly([0, -0.68, 0.26, -0.4, 0.26, 0.6, -0.26, 0.6, -0.26, -0.4]), W);
      return g.line((p) => p.M(-0.12, 0.45).L(0.12, -0.35), W * 0.7);
    case 'combatant':
    case 'amphibious':
    case 'merchant':
    case 'mine-warfare':
      g.line((p) => p.poly([0, -0.66, 0.2, -0.3, 0.2, 0.56, -0.2, 0.56, -0.2, -0.3]), W);
      if (c === 'combatant') return g.ink((p) => p.poly([-0.08, -0.1, 0.08, -0.1, 0.08, 0.2, -0.08, 0.2]));
      if (c === 'mine-warfare') return g.ink((p) => p.circle(0, 0.1, 0.08));
      return g.line((p) => p.M(-0.2, 0.2).L(0.2, 0.2), W * 0.7);
    case 'small-boat':
      return g.line((p) => p.poly([0, -0.44, 0.14, -0.16, 0.14, 0.4, -0.14, 0.4, -0.14, -0.16]), W);
    case 'submarine':
      g.line((p) => p.ellipse(0, 0, 0.14, 0.6), W);
      return g.ink((p) => p.poly([-0.06, -0.2, 0.06, -0.2, 0.06, 0.05, -0.06, 0.05]));
    case 'unknown':
    default:
      g.line((p) => p.circle(0, 0, 0.3), W);
      return g.text('?', 0, 0.02, 0.4);
  }
}

// --- The game-map style: a compact glyph a domain (index = `Domain`), filled with the team's colour.

function mapGlyph(g: Pen, domain: number): void {
  const shape = (f: (p: Path) => void) => {
    g.area(f);
    g.line(f, 0.07);
  };
  switch (domain) {
    case 1: // air
      return shape((p) => p.poly([0, -0.44, 0.42, 0.3, 0, 0.12, -0.42, 0.3]));
    case 2: // heli
      shape((p) => p.circle(0, 0, 0.26));
      return g.line((p) => p.M(-0.46, -0.0).L(0.46, 0.0), 0.08);
    case 6: // ground
      return shape((p) => p.poly([-0.3, -0.3, 0.3, -0.3, 0.3, 0.3, -0.3, 0.3]));
    case 7: // person
      return shape((p) => p.circle(0, 0, 0.17));
    case 8: // sea
      return shape((p) => p.poly([-0.5, 0, -0.3, -0.18, 0.3, -0.18, 0.5, 0, 0.3, 0.18, -0.3, 0.18]));
    case 9: // sub
      shape((p) => p.ellipse(0, 0.04, 0.46, 0.13));
      return shape((p) => p.poly([-0.08, -0.22, 0.08, -0.22, 0.1, -0.06, -0.1, -0.06]));
    case 10: // static
      shape((p) => p.poly([-0.3, -0.3, 0.3, -0.3, 0.3, 0.3, -0.3, 0.3]));
      return g.ink((p) => p.circle(0, 0, 0.08));
    default:
      return shape((p) => p.poly([0, -0.34, 0.34, 0, 0, 0.34, -0.34, 0]));
  }
}

// --- Weapons and decoys, forward up.

function effectGlyph(g: Pen, e: (typeof EFFECTS)[number]): void {
  switch (e) {
    case 'missile':
      g.glow(0, 0.56, 0.4);
      g.area((p) => p.poly([0, -0.78, 0.06, -0.6, 0.06, 0.38, 0.16, 0.52, -0.16, 0.52, -0.06, 0.38, -0.06, -0.6]));
      return g.line((p) => p.poly([0, -0.78, 0.06, -0.6, 0.06, 0.38, 0.16, 0.52, -0.16, 0.52, -0.06, 0.38, -0.06, -0.6]), 0.05);
    case 'rocket':
      g.glow(0, 0.4, 0.3);
      g.area((p) => p.poly([0, -0.5, 0.05, -0.36, 0.05, 0.26, 0.12, 0.36, -0.12, 0.36, -0.05, 0.26, -0.05, -0.36]));
      return g.line((p) => p.poly([0, -0.5, 0.05, -0.36, 0.05, 0.26, 0.12, 0.36, -0.12, 0.36, -0.05, 0.26, -0.05, -0.36]), 0.05);
    case 'bomb':
    case 'guided-bomb': {
      // A teardrop, the blunt nose forward, a fin cross at the tail.
      const body = (p: Path) => p.M(-0.2, -0.2).arc(0, -0.2, 0.2, Math.PI, Math.PI * 2).L(0.05, 0.42).L(-0.05, 0.42).Z();
      g.area(body);
      g.line(body, 0.06);
      g.line((p) => p.M(-0.2, 0.5).L(0.2, 0.5).M(0, 0.36).L(0, 0.62), 0.07);
      if (e === 'guided-bomb') g.line((p) => p.M(-0.26, -0.24).L(-0.14, -0.24).M(0.14, -0.24).L(0.26, -0.24), 0.06);
      return;
    }
    case 'flare':
      g.glow(0, 0, 0.95);
      return g.area((p) => p.circle(0, 0, 0.12));
    case 'chaff':
      return g.area((p) => p.circle(-0.22, 0.08, 0.34).circle(0.2, 0.12, 0.3).circle(0.02, -0.18, 0.32).circle(0.1, 0.32, 0.22));
    case 'misc':
      g.area((p) => p.circle(0, 0, 0.16));
      return g.line((p) => p.circle(0, 0, 0.16), 0.06);
    case 'shell':
      return g.glow(0, 0, 0.3);
  }
}

/** Every cell's drawing, in order. */
export function cellDrawings(): ((g: Pen) => void)[] {
  const out: ((g: Pen) => void)[] = [];
  for (let a = 0; a < 4; a++) for (let d = 0; d < 4; d++) out.push((g) => drawFrame(g, a, d));
  for (const c of SYMBOL_CLASSES) out.push((g) => natoIcon(g, c));
  for (const c of SYMBOL_CLASSES) out.push((g) => ruIcon(g, c));
  for (let d = 0; d < MAP_GLYPHS; d++) out.push((g) => mapGlyph(g, d));
  for (const e of EFFECTS) out.push((g) => effectGlyph(g, e));
  return out;
}

/** Draws the atlas: `make` gives a fresh canvas's context of the atlas's size, once a channel. */
export function drawAtlas(make: () => Ctx2D): Uint8Array {
  const cells = cellDrawings();
  const out = new Uint8Array(ATLAS_WIDTH * ATLAS_HEIGHT * 4);
  const layers: Layer[] = ['fill', 'line', 'glow', 'halo'];
  layers.forEach((layer, ch) => {
    const ctx = make();
    ctx.clearRect(0, 0, ATLAS_WIDTH, ATLAS_HEIGHT);
    cells.forEach((draw, i) => {
      const [ox, oy] = cellOrigin(i);
      draw(penFor(ctx, layer, ox, oy));
    });
    const img = ctx.getImageData(0, 0, ATLAS_WIDTH, ATLAS_HEIGHT).data;
    // White on transparent: the coverage is the alpha.
    for (let p = 0; p < ATLAS_WIDTH * ATLAS_HEIGHT; p++) out[p * 4 + ch] = img[p * 4 + 3];
  });
  return out;
}

let cached: Uint8Array | null = null;

/** The atlas, drawn the first time it is asked for (null where there is no canvas). */
let warming = false;

/**
 * The atlas drawn in a worker ahead of its first use (the engine starts it):
 * twenty milliseconds of canvas text off the main thread. `symbolAtlas`
 * still draws it here if asked before the worker is done.
 */
export function warmSymbolAtlas(): void {
  if (cached || warming || typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return;
  warming = true;
  try {
    const w = new Worker(new URL('./atlasWorker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (e: MessageEvent<Uint8Array | null>) => {
      if (!cached && e.data) cached = e.data;
      w.terminate();
    };
    w.onerror = () => w.terminate();
  } catch {
    // Drawn on first use instead.
  }
}

export function symbolAtlas(): Uint8Array | null {
  if (cached) return cached;
  const make = (): Ctx2D | null => {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(ATLAS_WIDTH, ATLAS_HEIGHT).getContext('2d', { willReadFrequently: true }) as unknown as Ctx2D;
    if (typeof document !== 'undefined') {
      const c = document.createElement('canvas');
      c.width = ATLAS_WIDTH;
      c.height = ATLAS_HEIGHT;
      return c.getContext('2d', { willReadFrequently: true }) as unknown as Ctx2D;
    }
    return null;
  };
  if (!make()) return null;
  cached = drawAtlas(() => make()!);
  return cached;
}
