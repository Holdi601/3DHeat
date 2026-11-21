import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_LAYER } from './plan';
import { usePlanStore } from '../state/planStore';
import { boardKeyDown } from '../ui/tactics/boardKeys';
import { BoardScene, noteShown } from './scene';
import { applyTransform, pickRef } from './gizmo';

const at = (x: number, z: number) => ({ x, y: 0, z });
const st = () => usePlanStore.getState();
const press = (code: string) => boardKeyDown({ code, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, preventDefault() {} } as unknown as KeyboardEvent);
const view = { step: 0, u: 0, selected: null, draft: null, cursor: null, placing: null, instanced: true };

beforeEach(() => {
  st().clear();
  usePlanStore.setState({ past: [], future: [], step: 0, tool: 'select', selected: null, selection: [], draft: null, stroke: null, activeLayer: BASE_LAYER, scrub: null });
  st().setDrawStyle({ kind: 'stroke', width: 0, always: false, color: [1, 0.85, 0.25] });
  st().setTool('select');
});

describe('the Draw tool', () => {
  it('draws a freehand stroke from a drag, a point every half width, in one undo step', () => {
    press('Digit7');
    expect(st().tool).toBe('draw');
    st().beginStroke(at(0, 0));
    // 25 m in CS2's game units.
    for (let x = 1; x <= 1000; x += 1) st().extendStroke(at(x, 0));
    st().endStroke();
    const d = st().plan.drawings;
    expect(d).toHaveLength(1);
    expect(d[0].kind).toBe('stroke');
    // CS2: arrows 0.5 m, a pen half that, in game units; a point every half pen width.
    expect(d[0].points.length).toBeGreaterThan(10);
    expect(d[0].points.length).toBeLessThan(400);
    const scene = new BoardScene();
    expect(scene.build(st().plan, view).tris.count).toBeGreaterThan(0);
    st().undo();
    expect(st().plan.drawings).toHaveLength(0);
  });

  it('draws a circle from two clicks and a highlighter mark in every step', () => {
    press('KeyB');
    st().setDrawStyle({ kind: 'circle' });
    st().click(at(0, 0), null);
    st().click(at(5, 0), null);
    st().setDrawStyle({ kind: 'highlight', always: true });
    st().beginStroke(at(0, 0));
    st().extendStroke(at(50, 0));
    st().endStroke();
    const [c, h] = st().plan.drawings;
    expect(c.kind).toBe('circle');
    expect(c.points).toHaveLength(2);
    expect(h).toMatchObject({ kind: 'highlight', always: true });
    expect(h.width).toBeGreaterThan(c.width);
    // In every step: still drawn in a later one; the circle only in its own.
    st().addStep();
    const scene = new BoardScene();
    const later = scene.build(st().plan, { ...view, step: 1 }).tris.count;
    const first = scene.build(st().plan, view).tris.count;
    expect(later).toBeGreaterThan(0);
    expect(first).toBeGreaterThan(later);
  });

  it('picks, moves and erases a drawing like anything else', () => {
    st().setTool('draw');
    st().beginStroke(at(0, 0));
    st().extendStroke(at(10, 0));
    st().endStroke();
    const id = st().plan.drawings[0].id;
    expect(pickRef(st().plan, 0, at(5, 0.1), () => 1, 0.5)).toBe(id);
    const moved = applyTransform(st().plan, 0, [id], { kind: 'move', d: { x: 0, y: 0, z: 3 } });
    expect(moved.drawings[0].points.every((p) => p.z === 3)).toBe(true);
    st().setTool('erase');
    st().click(at(10, 0), null);
    expect(st().plan.drawings).toHaveLength(0);
  });
});

describe('notes', () => {
  it('takes the note style, and shows in its step, always, or in its window of playback', () => {
    vi.stubGlobal('window', { prompt: () => 'Smoke here', confirm: () => true });
    st().setNoteStyle({ color: [1, 0, 0], size: 22, show: 'timed', duration: 3 });
    st().setScrub(null);
    st().setTool('note');
    st().click(at(1, 1), null);
    const n = st().plan.notes[0];
    expect(n).toMatchObject({ text: 'Smoke here', color: [1, 0, 0], size: 22, show: 'timed', start: 0, duration: 3 });
    expect(noteShown(n, { step: 0, time: 2 })).toBe(true);
    expect(noteShown(n, { step: 0, time: 3.5 })).toBe(false);
    st().setNote(n.id, { show: 'always' });
    const a = st().plan.notes[0];
    expect(a.start).toBeUndefined();
    expect(noteShown(a, { step: 5, time: null })).toBe(true);
    st().setNote(n.id, { show: 'step' });
    expect(st().plan.notes[0].show).toBeUndefined();
    expect(noteShown(st().plan.notes[0], { step: 1 })).toBe(false);
    vi.unstubAllGlobals();
  });
});
