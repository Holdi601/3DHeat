import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { FlyCamera, MouseDeltaFilter, ORTHO_ZOOM_PER_NOTCH } from './camera';
import { targetAt } from '../ui/help/helpTarget';

const ASPECT = 16 / 9;

function settle(cam: FlyCamera): void {
  cam.update(0, ASPECT, 60, 0.05, 40_000);
}

/** Where a world point lands in normalised device coordinates. */
function ndc(cam: FlyCamera, p: Vector3): Vector3 {
  return p.clone().project(cam.camera);
}

describe('mouse look without the browser spikes', () => {
  it('drops the first locked event when it is a jump, and a lone spike out of a steady drag', () => {
    const f = new MouseDeltaFilter();
    f.reset(true);
    // The pointer parked by the lock: hundreds of pixels at once.
    expect(f.accept(0, -640, 0)).toBe(false);
    let t = 10;
    for (let i = 0; i < 10; i++) expect(f.accept(4, -3, (t += 8))).toBe(true);
    // Chromium's spike: one event of 900 px straight up in the middle of a slow drag.
    expect(f.accept(0, -900, (t += 8))).toBe(false);
    expect(f.accept(5, -2, (t += 8))).toBe(true);
  });

  it('believes a flick that builds up, and a run of large moves', () => {
    const f = new MouseDeltaFilter();
    let t = 0;
    for (const d of [20, 60, 150, 320, 500, 420]) expect(f.accept(d, 0, (t += 8))).toBe(true);
    const g = new MouseDeltaFilter();
    // Three big events in a row from rest: the first two may go, the third is the hand.
    const got = [g.accept(400, 0, 0), g.accept(400, 0, 8), g.accept(400, 0, 16)];
    expect(got[2]).toBe(true);
  });

  it('never takes a non-finite movement', () => {
    const f = new MouseDeltaFilter();
    expect(f.accept(Number.NaN, 0, 0)).toBe(false);
    expect(f.accept(0, Number.POSITIVE_INFINITY, 0)).toBe(false);
  });
});

describe('a pose that went non-finite', () => {
  it('falls back to the last good one rather than snapping anywhere', () => {
    const cam = new FlyCamera();
    cam.position.set(10, 20, 30);
    cam.pitch = -0.2;
    settle(cam);
    cam.pitch = Number.NaN;
    cam.position.y = Number.NaN;
    settle(cam);
    expect(cam.pitch).toBeCloseTo(-0.2);
    expect(cam.position.toArray()).toEqual([10, 20, 30]);
  });
});

describe('the isometric view', () => {
  function iso(): FlyCamera {
    const cam = new FlyCamera();
    cam.setPreset('Iso NE');
    cam.position.set(0, 100, 0);
    cam.orthoHeight = 2000;
    settle(cam);
    return cam;
  }

  it('pans with forward and back instead of flying along the view axis', () => {
    const cam = iso();
    const ground = new Vector3(300, 0, -300);
    const before = ndc(cam, ground);
    cam.moveOrtho(1, 0, 0, 200);
    settle(cam);
    const after = ndc(cam, ground);
    // Screen up: the ground moves down the picture, not at all sideways.
    expect(after.y).toBeLessThan(before.y - 0.1);
    expect(Math.abs(after.x - before.x)).toBeLessThan(1e-6);
  });

  it('moves up and down visibly', () => {
    const cam = iso();
    const ground = new Vector3(0, 0, -200);
    const before = ndc(cam, ground);
    cam.moveOrtho(0, 0, 1, 300);
    settle(cam);
    expect(ndc(cam, ground).y).toBeLessThan(before.y - 0.1);
  });

  it('zooms about the pointer, a quarter a notch', () => {
    const cam = iso();
    const pointer = new Vector3(0.5, -0.4, 0);
    // The world point under the pointer, on the camera's plane.
    const under = pointer.clone().unproject(cam.camera);
    cam.zoomOrthoAt(ORTHO_ZOOM_PER_NOTCH ** -3, pointer.x, pointer.y, ASPECT);
    settle(cam);
    expect(cam.orthoHeight).toBeCloseTo(2000 / ORTHO_ZOOM_PER_NOTCH ** 3);
    const back = ndc(cam, under);
    expect(back.x).toBeCloseTo(pointer.x, 5);
    expect(back.y).toBeCloseTo(pointer.y, 5);
  });

  it('draws what lies behind the camera position, so flying down does not cut the ground', () => {
    const cam = iso();
    cam.orthoBack = 5000;
    settle(cam);
    // A point 1 km behind the camera along the view axis is still between the planes.
    const f = cam.forward(new Vector3());
    const behind = cam.position.clone().addScaledVector(f, -1000);
    const z = ndc(cam, behind).z;
    expect(z).toBeGreaterThan(-1);
    expect(z).toBeLessThan(1);
  });
});

describe('the down key', () => {
  it('can be moved off Ctrl, so Ctrl+W is no flight key', () => {
    const cam = new FlyCamera();
    const canvas = { addEventListener() {}, removeEventListener() {} } as unknown as HTMLCanvasElement;
    const listeners = new Map<string, (e: unknown) => void>();
    const g = globalThis as unknown as { window?: unknown; document?: unknown; HTMLInputElement?: unknown; HTMLTextAreaElement?: unknown };
    g.HTMLInputElement ??= class {};
    g.HTMLTextAreaElement ??= class {};
    const hadWin = 'window' in g;
    const hadDoc = 'document' in g;
    if (!hadWin) g.window = { addEventListener: (type: string, fn: (e: unknown) => void) => listeners.set(type, fn), removeEventListener() {} };
    if (!hadDoc) g.document = { addEventListener() {}, removeEventListener() {} };
    try {
      cam.attach(canvas);
      const down = (code: string) => listeners.get('keydown')!({ code, target: null, preventDefault() {} });
      cam.position.set(0, 100, 0);
      down('ControlLeft');
      cam.update(1, ASPECT, 60, 0.05, 40_000);
      expect(cam.position.y).toBeLessThan(100);
      cam.descendKey = 'z';
      cam.position.set(0, 100, 0);
      cam.update(1, ASPECT, 60, 0.05, 40_000);
      expect(cam.position.y).toBe(100);
    } finally {
      if (!hadWin) delete g.window;
      if (!hadDoc) delete g.document;
    }
  });
});

describe('the help under the pointer', () => {
  it('finds the label whose box holds the point, the most specific kind first', () => {
    const els = [
      { sel: '.objective-label', box: { left: 0, top: 0, right: 100, bottom: 100 } },
      { sel: '.objective-label.zone', box: { left: 40, top: 40, right: 60, bottom: 60 } },
      { sel: '.replay-engage', box: { left: 200, top: 0, right: 260, bottom: 20 } },
    ];
    const find = (s: string) => els.filter((e) => e.sel === s || (s === '.objective-label' && e.sel.startsWith('.objective-label')));
    const box = (e: (typeof els)[number]) => e.box;
    expect(targetAt(50, 50, find, box)).toBe('zone');
    expect(targetAt(10, 10, find, box)).toBe('marker');
    expect(targetAt(230, 10, find, box)).toBe('engage');
    expect(targetAt(500, 500, find, box)).toBe(null);
  });
});
