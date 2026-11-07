/**
 * Propeller aircraft from the First World War to Korea: fighters, dive and
 * torpedo bombers, twin-engined fighters and bombers, four-engined bombers,
 * transports and gliders; biplanes, triplanes and pushers. One figure serves
 * a type in every game that has it (DCS, IL-2, Battlefield, War Thunder);
 * marks that look alike outside share it (every Bf 109 F to K).
 *
 * Length, span and height are published values; fuselage girth, chords and
 * tail sizes come from three-view proportions (estimates). Helpers below
 * make the common layouts from those few numbers.
 */

import type { Named, SpecSet } from './index';
import type { FixedWingSpec, WingSpec } from '../air';

const A: Named<FixedWingSpec> = {};

export interface Single {
  /** A radial engine: a blunt round nose. */
  radial?: boolean;
  blades?: number;
  /** Propeller diameter (default from the span). */
  prop?: number;
  bubble?: boolean;
  gull?: boolean;
  /** Wing position: -1 low, 0 mid, 1 high. */
  mount?: number;
  /** Wing chord at the root, share of the length (default 0.26). */
  chord?: number;
  /** Fixed spatted gear. */
  gear?: boolean;
  /** A long greenhouse canopy for two or three crew. */
  crew?: number;
  floats?: boolean;
  /** Forward position of the wing's root middle, share of the length (default 0.08). */
  wingAt?: number;
}

/** A single-engined tractor monoplane from length, span and height. */
export function single(cls: string, length: number, span: number, height: number, o: Single = {}): FixedWingSpec & { cls: string } {
  const bw = o.radial ? Math.max(1.15, length * 0.13) : Math.max(0.9, length * 0.105);
  const chord = (o.chord ?? 0.26) * length;
  const crew = o.crew ?? 1;
  return {
    cls,
    length,
    span,
    height,
    bodyWidth: bw,
    bodyHeight: bw * 1.2,
    nose: o.radial ? 0.14 : 0.2,
    blunt: o.radial ? 1 : 0.2,
    wing: { x: length * (o.wingAt ?? 0.08), span, rootChord: chord, tipChord: chord * 0.5, sweep: 4, mount: o.mount ?? -0.8, dihedral: o.mount === 1 ? 2 : 6, gull: o.gull },
    tail: { kind: 'single', finHeight: height * 0.36, finChord: length * 0.12, tailSpan: span * 0.33, tailChord: length * 0.09 },
    engines: { kind: 'nose-prop', count: 1 },
    propeller: { diameter: o.prop ?? Math.min(4.2, span * 0.3), blades: o.blades ?? 3 },
    canopy: { x: length * (crew > 1 ? 0.02 : -0.02), length: length * (crew > 1 ? 0.3 : 0.17), kind: crew > 1 ? 'framed' : o.bubble ? 'bubble' : 'framed' },
    fixedGear: o.gear,
    floats: o.floats,
  };
}

interface Twin {
  radial?: boolean;
  glassNose?: boolean;
  twinTail?: boolean;
  mount?: number;
  blades?: number;
  prop?: number;
  /** Engine nacelles out along the half span (default 0.3). */
  at?: number;
  /** Four engines (two each side). */
  four?: boolean;
  /** Body width (default from the length). */
  body?: number;
  /** Jets in pods instead of propellers. */
  jets?: boolean;
}

/** A twin- or four-engined monoplane from length, span and height. */
export function multi(cls: string, length: number, span: number, height: number, o: Twin = {}): FixedWingSpec & { cls: string } {
  const bw = o.body ?? Math.max(1.3, length * 0.1);
  const chord = span * 0.13;
  return {
    cls,
    length,
    span,
    height,
    bodyWidth: bw,
    bodyHeight: bw * 1.25,
    nose: 0.12,
    blunt: 0.6,
    wing: { x: length * 0.1, span, rootChord: chord, tipChord: chord * 0.45, sweep: 5, mount: o.mount ?? -0.2, dihedral: 5 },
    tail: o.twinTail ? { kind: 'h', finHeight: height * 0.4, finChord: length * 0.1, tailSpan: span * 0.33, tailChord: length * 0.08 } : { kind: 'single', finHeight: height * 0.45, finChord: length * 0.14, tailSpan: span * 0.33, tailChord: length * 0.08 },
    engines: o.jets ? { kind: 'wing-pods', count: o.four ? 4 : 2, diameter: Math.max(0.8, span * 0.06), at: o.four ? [0.25, 0.5] : [o.at ?? 0.3] } : { kind: 'wing-props', count: o.four ? 4 : 2, diameter: o.radial ? Math.max(1.3, span * 0.07) : Math.max(1.0, span * 0.06), at: o.four ? [0.25, 0.5] : [o.at ?? 0.3] },
    propeller: { diameter: o.prop ?? Math.min(4.2, span * 0.16), blades: o.blades ?? 3 },
    canopy: o.glassNose ? { x: length * 0.45, length: length * 0.14, kind: 'glass-nose' } : { x: length * 0.3, length: length * 0.15, kind: 'framed' },
  };
}

interface Bi {
  /** Lower wing span (default the same as the upper). */
  lower?: number;
  triplane?: boolean;
  /** A parasol or shoulder monoplane (one wing above the fuselage). */
  parasol?: boolean;
  /** A single low or mid wing (Fokker E.III). */
  mono?: boolean;
  /** Pusher with open booms (DH.2, F.E.2b). */
  pusher?: boolean;
  /** Two engines between the wings (Gotha, O/400, DH.10). */
  twin?: boolean;
  /** Four engines (Ilya Muromets). */
  four?: boolean;
  floats?: boolean;
  blades?: number;
  /** Two cockpits. */
  crew?: number;
}

/** A WWI or inter-war biplane (or triplane, parasol, pusher) from length, span and height. */
export function biplane(cls: string, length: number, span: number, height: number, o: Bi = {}): FixedWingSpec & { cls: string } {
  const bw = Math.max(0.8, length * 0.12);
  const chord = Math.max(1.0, span * (o.twin || o.four ? 0.1 : 0.17));
  const gap = height * 0.42;
  const w = (s: number, up: number, x = length * 0.15): WingSpec => ({ x, span: s, rootChord: chord, tipChord: chord, sweep: 0, mount: up / (bw * 1.2 * 0.4), dihedral: up < 0 ? 3 : 0 });
  const upper = w(span, gap * 0.75, length * 0.17);
  const lowerSpan = o.lower ?? span;
  const spec: FixedWingSpec & { cls: string } = {
    cls,
    length,
    span,
    height,
    bodyWidth: bw,
    bodyHeight: bw * 1.2,
    nose: 0.15,
    blunt: 0.9,
    wing: o.parasol ? upper : o.mono ? w(span, -bw * 0.4) : w(lowerSpan, -gap * 0.35),
    upperWing: o.parasol || o.mono ? undefined : upper,
    extraWings: o.triplane ? [w(span * 0.97, gap * 0.2, length * 0.16)] : undefined,
    tail: { kind: 'single', finHeight: height * 0.32, finChord: length * 0.12, tailSpan: span * 0.33, tailChord: length * 0.1 },
    engines: o.pusher ? { kind: 'pusher', count: 1 } : o.twin || o.four ? { kind: 'wing-props', count: o.four ? 4 : 2, diameter: 1.0, at: o.four ? [0.2, 0.36] : [0.25] } : { kind: 'nose-prop', count: 1 },
    propeller: { diameter: Math.min(3.2, span * (o.twin || o.four ? 0.13 : 0.3)), blades: o.blades ?? 2 },
    canopy: { x: length * 0.05, length: length * (o.crew && o.crew > 1 ? 0.3 : 0.12), kind: 'none' },
    fixedGear: !o.floats,
    floats: o.floats,
  };
  if (o.pusher) {
    // A short nacelle ahead of the wing, open booms back to the tail.
    spec.bodyLength = length * 0.4;
    spec.booms = { x: length * 0.1, spacing: span * 0.22, diameter: 0.12 };
    spec.tail = { kind: 'twin', finHeight: height * 0.3, finChord: length * 0.1, tailSpan: span * 0.3, tailChord: length * 0.08 };
  }
  return spec;
}

// ---------------------------------------------------------------- inter-war, gliders and light aircraft

// The monoplane fighters, bombers and transports are drawn from their outlines in ./prop-variants.ts.

A['cg-4a'] = { ...multi('glider', 14.8, 25.5, 3.7, { body: 1.8, mount: 1 }), engines: undefined, propeller: undefined };


// ---------------------------------------------------------------- WWI

A['airco-dh2'] = biplane('biplane', 7.68, 8.61, 2.91, { pusher: true });
A['fe-2b'] = biplane('biplane', 9.83, 14.55, 3.85, { pusher: true, crew: 2 });
A['hansa-brandenburg-w12'] = biplane('biplane', 9.65, 11.2, 3.3, { floats: true, crew: 2 });
A['gotha-g5'] = biplane('ww1-bomber', 11.86, 23.7, 4.3, { twin: true, crew: 3 });
A['handley-page-o400'] = biplane('ww1-bomber', 19.16, 30.48, 6.71, { twin: true, crew: 3 });
A['airco-dh10'] = biplane('ww1-bomber', 12.08, 19.96, 4.42, { twin: true, crew: 3 });
A['caproni-ca5'] = biplane('ww1-bomber', 12.62, 23.4, 4.48, { twin: true, crew: 3 });
A['ilya-muromets'] = biplane('ww1-bomber', 17.1, 29.8, 4.0, { four: true, crew: 3 });

// ---------------------------------------------------------------- odd ones out

// Horten Ho 229 (7.47 x 16.76 x 2.81 m) and AW.52 (11.4 x 27.43 x 4.45 m): flying wings.
A['horten-ho-229'] = { cls: 'flying-wing', length: 7.47, span: 16.76, height: 2.81, bodyWidth: 1.6, bodyHeight: 1.2, nose: 0.3, wing: { x: -0.6, span: 16.76, rootChord: 6.5, tipChord: 0.8, sweep: 35, mount: 0 }, tail: { kind: 'none', finHeight: 0, finChord: 0, tailSpan: 0, tailChord: 0 }, engines: { kind: 'internal', count: 2, diameter: 0.7 }, canopy: { x: 2.0, length: 1.4, kind: 'bubble' } };
A['aw-52'] = { ...A['horten-ho-229'], length: 11.4, span: 27.43, height: 4.45, wing: { x: -1.0, span: 27.43, rootChord: 8.0, tipChord: 1.6, sweep: 30, mount: 0 } };
// XF-85 Goblin, a tiny parasite jet (4.53 x 6.44 x 2.53 m); Ba 349 Natter (6.02 x 4.0 x 2.25 m).
A['xf-85-goblin'] = { cls: 'jet-fighter', length: 4.53, span: 6.44, height: 2.53, bodyWidth: 1.2, bodyHeight: 1.4, nose: 0.2, blunt: 0.7, wing: { x: 0, span: 6.44, rootChord: 1.8, tipChord: 0.8, sweep: 37, mount: 0 }, tail: { kind: 'single', finHeight: 0.9, finChord: 0.9, tailSpan: 2.0, tailChord: 0.6 }, engines: { kind: 'internal', count: 1, diameter: 0.6 }, intakes: 'nose', canopy: { x: 1.0, length: 1.0, kind: 'bubble' } };
A['ba-349-natter'] = { cls: 'rocket-plane', length: 6.02, span: 4.0, height: 2.25, bodyWidth: 0.9, bodyHeight: 0.9, nose: 0.15, blunt: 0.7, wing: { x: -0.3, span: 4.0, rootChord: 1.0, tipChord: 1.0, sweep: 0, mount: 0 }, tail: { kind: 'single', finHeight: 1.0, finChord: 0.8, tailSpan: 2.0, tailChord: 0.7 }, engines: { kind: 'internal', count: 1, diameter: 0.4 }, canopy: { x: 1.4, length: 0.8, kind: 'bubble' } };

export const PROPS: SpecSet = { air: A };
