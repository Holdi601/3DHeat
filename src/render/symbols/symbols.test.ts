import { describe, expect, it } from 'vitest';
import { CATALOG } from '../../figures/catalog';
import { classify, classOfKind, classOfType, Domain, isEffectDomain, packWord, SYMBOL_CLASSES, symbolIndex, unpackWord, WORD_MOVING } from '../../figures/symbolClass';
import { affiliationOf, autoSide, FRIEND, HOSTILE, NEUTRAL, sideTable, UNKNOWN } from './affiliation';
import { ATLAS_COLUMNS, ATLAS_HEIGHT, ATLAS_ROWS, ATLAS_WIDTH, CELL, cellDrawings, cellOrigin, drawAtlas, EFFECTS, LAYOUT, natoFrameCell, type Ctx2D } from './atlas';
import { DART_MESHES, dartIndex, dartMesh, dartMeshes, hasDart, SHAPE_FLOAT } from './darts';
import { FAR_MODE_ID, farLook, symbolThreshold, WEAPON_PX } from './lod';
import { symbolGlslFs, symbolGlslVs, symbolWgsl } from './shaders';
import { EVAL_GLSL_VS, STREAK_GLSL_VS, TRAIL_GLSL_VS } from '../gpuTracks/glsl';
import { FINISH_WGSL, PLACE_WGSL } from '../gpuTracks/shader';
import { MESH_STRIDE } from '../../figures/instances';

describe('symbol classes', () => {
  it('maps every catalogue figure to a class that is not unknown, in a domain of its own kind', () => {
    for (const [kind, e] of Object.entries(CATALOG)) {
      const c = classOfKind(kind)!;
      expect(c, kind).not.toBeNull();
      if (e.domain === 'marker') continue;
      expect(c.cls, `${kind} (${e.cls})`).not.toBe('unknown');
      if (e.domain === 'air') expect([Domain.Air, Domain.Heli]).toContain(c.domain);
      if (e.domain === 'heli') expect(c.domain).toBe(Domain.Heli);
      if (e.domain === 'sea') expect([Domain.Sea, Domain.Sub]).toContain(c.domain);
      if (e.domain === 'missile') expect([Domain.Missile, Domain.Bomb, Domain.Rocket]).toContain(c.domain);
      if (e.domain === 'person') expect(c.domain).toBe(Domain.Person);
    }
  });
  it('tells weapons apart: air-to-air, surface-to-air, a guided bomb, a rocket', () => {
    const byCls = (dom: string, cls: string) => Object.keys(CATALOG).find((k) => CATALOG[k].domain === dom && CATALOG[k].cls === cls)!;
    expect(classOfKind(byCls('missile', 'aam'))!.cls).toBe('missile-aam');
    expect(classOfKind(byCls('missile', 'sam'))!.cls).toBe('missile-sam');
    expect(classOfKind(byCls('missile', 'guided-bomb'))).toEqual({ domain: Domain.Bomb, cls: 'guided-bomb' });
    expect(classOfKind(byCls('missile', 'rocket'))!.domain).toBe(Domain.Rocket);
    // The same class names on the ground are its air defence and anti-tank.
    expect(classOfKind(byCls('ground', 'sam'))!.cls).toBe('air-defence');
    expect(classOfKind(byCls('sea', 'submarine'))!.domain).toBe(Domain.Sub);
  });
  it('reads decoys, shells and debris from the type text, before any figure a name may match', () => {
    expect(classOfType('Misc+Decoy+Flare')!.domain).toBe(Domain.Flare);
    expect(classOfType('Misc+Decoy+Chaff')!.domain).toBe(Domain.Chaff);
    expect(classOfType('Projectile+Shell')!.domain).toBe(Domain.Shell);
    expect(classOfType('Misc+Shrapnel')!.domain).toBe(Domain.Shell);
    expect(classOfType('Ground+Light+Human+Air+Parachutist')!.cls).toBe('parachutist');
    expect(classOfType('Misc+Container')!.domain).toBe(Domain.Misc);
    expect(classOfType('Navaid+Static+Bullseye')!.domain).toBe(Domain.Misc);
    expect(classOfType('Ground+Static+Aerodrome')!.cls).toBe('installation');
    expect(classOfType('Weapon+Missile')!.domain).toBe(Domain.Missile);
    expect(classOfType('Weapon+Bomb')!.domain).toBe(Domain.Bomb);
    expect(classOfType('Air+FixedWing')).toBeNull();
    // A flare whose name matched an aircraft is still a flare.
    expect(classify('f-16c', 'Misc+Decoy+Flare').domain).toBe(Domain.Flare);
    expect(classify('f-16c', 'Air+FixedWing')).toEqual({ domain: Domain.Air, cls: 'fighter' });
    expect(classify(null, 'Weapon+Missile').domain).toBe(Domain.Missile);
    expect(classify(null, '')).toEqual({ domain: Domain.Unknown, cls: 'unknown' });
    expect(isEffectDomain(Domain.Flare) && isEffectDomain(Domain.Shell) && !isEffectDomain(Domain.Missile)).toBe(true);
  });
  it('packs class, team and domain into a word an f32 holds exactly', () => {
    const w = packWord({ domain: Domain.Sea, cls: 'carrier' }, 3);
    expect(unpackWord(w)).toEqual({ cls: symbolIndex('carrier'), team: 3, domain: Domain.Sea, moving: false });
    expect(unpackWord(packWord({ domain: Domain.Air, cls: 'fighter' }, null)).team).toBe(-1);
    const moving = (w | WORD_MOVING) >>> 0;
    expect(Math.fround(-1000 - moving)).toBe(-1000 - moving);
    expect(SYMBOL_CLASSES.length).toBeLessThan(256);
  });
});

describe('sides', () => {
  it('picks my side by name, else the first that is not neutral', () => {
    expect(autoSide(['Neutrals', 'Enemies', 'Allies', 'Neutral', ''])).toBe(2);
    expect(autoSide(['Neutral', 'Red', 'Green'])).toBe(1);
    expect(autoSide(['Brown', 'Down'])).toBe(0);
    expect(autoSide([])).toBe(0);
  });
  it('makes my team friend, the rest hostile or neutral, named neutrals neutral, no team unknown', () => {
    const s = { mySide: 1, teams: 4, others: 'hostile' as const, labels: ['A', 'B', 'Neutral', ''] };
    expect(affiliationOf(1, s)).toBe(FRIEND);
    expect(affiliationOf(0, s)).toBe(HOSTILE);
    expect(affiliationOf(2, s)).toBe(NEUTRAL);
    expect(affiliationOf(3, s)).toBe(UNKNOWN);
    expect(affiliationOf(null, s)).toBe(UNKNOWN);
    expect(affiliationOf(0, { ...s, others: 'neutral' })).toBe(NEUTRAL);
  });
  it('gives each hostile team its own colour, entry 0 for no team', () => {
    const t = sideTable('nato', { mySide: 0, teams: 4, others: 'hostile' });
    expect(t[3]).toBe(UNKNOWN);
    expect(t[4 + 3]).toBe(FRIEND);
    expect(t[8 + 3]).toBe(HOSTILE);
    expect(t[12 + 3]).toBe(HOSTILE);
    expect([t[8], t[9], t[10]]).not.toEqual([t[12], t[13], t[14]]);
    // The Russian convention: own red, the enemy blue.
    const r = sideTable('russian', { mySide: 0, teams: 2, others: 'hostile' });
    expect(r[4]).toBeGreaterThan(r[6]);
    expect(r[10]).toBeGreaterThan(r[8]);
  });
});

describe('atlas', () => {
  it('lays every cell out once, inside the texture', () => {
    const cells = cellDrawings();
    expect(cells.length).toBe(LAYOUT.cells);
    expect(LAYOUT.cells).toBeLessThanOrEqual(ATLAS_COLUMNS * ATLAS_ROWS);
    expect(LAYOUT.natoIcons).toBe(16);
    expect(LAYOUT.russianIcons - LAYOUT.natoIcons).toBe(SYMBOL_CLASSES.length);
    expect(LAYOUT.effects + EFFECTS.length).toBe(LAYOUT.cells);
    expect(natoFrameCell(3, 3)).toBe(15);
    const seen = new Set<string>();
    for (let c = 0; c < LAYOUT.cells; c++) {
      const [x, y] = cellOrigin(c);
      expect(x + CELL).toBeLessThanOrEqual(ATLAS_WIDTH);
      expect(y + CELL).toBeLessThanOrEqual(ATLAS_HEIGHT);
      seen.add(`${x},${y}`);
    }
    expect(seen.size).toBe(LAYOUT.cells);
  });
  it('draws every cell into the channels, each inside its own cell', () => {
    const touched: [number, number][] = [];
    let grads = 0;
    const ctx: Ctx2D = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineJoin: 'round',
      lineCap: 'round',
      font: '',
      textAlign: 'center',
      textBaseline: 'middle',
      globalCompositeOperation: 'source-over',
      beginPath() {},
      moveTo: (x, y) => void touched.push([x, y]),
      lineTo: (x, y) => void touched.push([x, y]),
      closePath() {},
      arc: (x, y) => void touched.push([x, y]),
      ellipse: (x, y) => void touched.push([x, y]),
      fill() {},
      stroke() {},
      fillText: (_s, x, y) => void touched.push([x, y]),
      strokeText() {},
      fillRect: (x, y) => void touched.push([x, y]),
      clearRect() {},
      createRadialGradient: () => (grads++, { addColorStop() {} }) as unknown as CanvasGradient,
      getImageData: (_x, _y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) as ImageData,
    };
    const out = drawAtlas(() => ctx);
    expect(out.length).toBe(ATLAS_WIDTH * ATLAS_HEIGHT * 4);
    expect(touched.length).toBeGreaterThan(LAYOUT.cells * 4);
    expect(grads).toBeGreaterThan(0);
    for (const [x, y] of touched) {
      expect(x).toBeGreaterThanOrEqual(-CELL);
      expect(y).toBeGreaterThanOrEqual(-CELL);
      expect(x).toBeLessThanOrEqual(ATLAS_WIDTH + CELL);
      expect(y).toBeLessThanOrEqual(ATLAS_HEIGHT + CELL);
    }
  });
});

describe('far look', () => {
  const T = symbolThreshold(36, 28);
  it('keeps the model in figure mode, a dart only below the governor', () => {
    expect(farLook(FAR_MODE_ID.figure, Domain.Air, 1, true, T, 0.25)).toMatchObject({ figure: 1, dart: false });
    expect(farLook(FAR_MODE_ID.figure, Domain.Air, 0.1, true, T, 0.25)).toMatchObject({ figure: 0, dart: true });
  });
  it('crossfades model and symbol in symbol mode, no popping', () => {
    const far = farLook(FAR_MODE_ID.symbol, Domain.Ground, 5, true, T, 2);
    const mid = farLook(FAR_MODE_ID.symbol, Domain.Ground, T * 0.85, true, T, 2);
    const near = farLook(FAR_MODE_ID.symbol, Domain.Ground, T * 2, true, T, 2);
    expect(far).toMatchObject({ figure: 0, glyph: 1 });
    expect(mid.figure).toBeGreaterThan(0);
    expect(mid.figure + mid.glyph).toBeCloseTo(1);
    expect(near).toMatchObject({ figure: 1, glyph: 0 });
  });
  it('never makes weapons, decoys or shells arrows or grown figures', () => {
    for (const mode of [0, 1, 2]) {
      for (const d of [Domain.Missile, Domain.Bomb, Domain.Rocket, Domain.Flare, Domain.Chaff, Domain.Shell]) {
        const l = farLook(mode, d, 1, true, T, 2);
        expect(l.dart).toBe(false);
        expect(l.trueSize).toBe(true);
      }
      expect(farLook(mode, Domain.Shell, 1, true, T, 2)).toMatchObject({ figure: 0, glyph: 0 });
      expect(farLook(mode, Domain.Flare, 1000, true, T, 2)).toMatchObject({ figure: 0, glyph: 1 });
      expect(farLook(mode, Domain.Missile, WEAPON_PX * 2, true, T, 2)).toMatchObject({ figure: 1, glyph: 0 });
    }
  });
  it('gives each unit domain its own dart shape, none for weapons', () => {
    const m = dartMesh();
    const shapes = new Set<number>();
    for (let v = 0; v < m.count; v++) shapes.add(m.data[v * MESH_STRIDE + SHAPE_FLOAT]);
    const own = dartMeshes();
    expect(own.length).toBe(DART_MESHES);
    for (const d of [Domain.Air, Domain.Heli, Domain.Ground, Domain.Person, Domain.Sea, Domain.Sub, Domain.Static]) {
      expect(hasDart(d)).toBe(true);
      expect(shapes.has(d + 1)).toBe(true);
      // Its own mesh holds its shape alone.
      const mm = own[dartIndex(d)];
      for (let v = 0; v < mm.count; v++) expect(mm.data[v * MESH_STRIDE + SHAPE_FLOAT]).toBe(d + 1);
    }
    // An unknown thing is the aircraft's arrow.
    expect(hasDart(Domain.Unknown)).toBe(true);
    expect(dartIndex(Domain.Unknown)).toBe(dartIndex(Domain.Air));
    for (const d of [Domain.Missile, Domain.Flare, Domain.Shell]) expect(hasDart(d)).toBe(false);
  });
});

describe('shader sources', () => {
  it('have every constant filled in', () => {
    for (const src of [symbolGlslVs(), symbolGlslFs(), symbolWgsl(), PLACE_WGSL, FINISH_WGSL, EVAL_GLSL_VS, STREAK_GLSL_VS, TRAIL_GLSL_VS]) {
      expect(src).not.toMatch(/\$\{|undefined|NaN/);
    }
  });
});
