import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { keyAt } from './plan';
import { usePlanStore } from '../state/planStore';
import { boardKeyDown } from '../ui/tactics/boardKeys';
import { answerConfirm } from '../ui/shell/kit';
import { BoardScene } from './scene';

const at = (x: number, z: number) => ({ x, y: 0, z });
const st = () => usePlanStore.getState();

/** A key as the browser hands it to the board. */
function key(code: string, mods: { ctrl?: boolean; shift?: boolean } = {}) {
  const ev = { code, ctrlKey: !!mods.ctrl, metaKey: false, shiftKey: !!mods.shift, altKey: false, defaultPrevented: false, preventDefault() {
    ev.defaultPrevented = true;
  } };
  return { handled: boardKeyDown(ev as unknown as KeyboardEvent), prevented: ev.defaultPrevented };
}

function place(kind: string, x: number, z: number): string {
  st().setKind(kind);
  st().click(at(x, z), null);
  return st().selected!;
}

describe('the board tools', () => {
  beforeEach(() => {
    st().clear();
    usePlanStore.setState({ past: [], future: [], step: 0, tool: 'select', selected: null, selection: [], draft: null, measure: null, formation: true });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('ends a route by Enter, and Enter is not also a click on the focused tool button', () => {
    const id = place('soldier', 0, 0);
    st().setTool('waypoints');
    st().click(at(0, 0), id);
    st().click(at(10, 0), null);
    const k = key('Enter');
    expect(k.handled && k.prevented).toBe(true);
    expect(st().draft).toBeNull();
    expect(st().plan.arrows).toHaveLength(1);
    expect(st().plan.arrows[0].figure).toBe(id);
    // Enter with nothing drawn is not the board's.
    expect(key('Enter').handled).toBe(false);
  });

  it('ends a route by Esc when it has a way to go, and drops one with only its start', () => {
    const id = place('soldier', 0, 0);
    st().setTool('waypoints');
    st().click(at(0, 0), id);
    key('Escape');
    expect(st().draft).toBeNull();
    expect(st().plan.arrows).toHaveLength(0);
    st().click(at(0, 0), id);
    st().click(at(5, 5), null);
    key('Escape');
    expect(st().plan.arrows).toHaveLength(1);
  });

  it('takes the last point back with Backspace, and keeps a half-drawn route when the tool changes', () => {
    const id = place('soldier', 0, 0);
    st().setTool('waypoints');
    st().click(at(0, 0), id);
    st().click(at(5, 0), null);
    st().click(at(9, 0), null);
    key('Backspace');
    expect(st().draft!.points).toHaveLength(2);
    // Picking another tool finishes what was drawn instead of losing it.
    key('Digit1');
    expect(st().tool).toBe('select');
    expect(st().plan.arrows[0].points).toHaveLength(2);
  });

  it('gives a group of selected figures one route each, keeping the group shape or not', () => {
    const a = place('soldier', 0, 0);
    const b = place('soldier', 4, 0);
    st().selectRefs([a, b], false);
    st().setTool('waypoints');
    st().click(at(20, 20), null);
    expect(st().draft!.group).toEqual([a, b]);
    st().click(at(2, 10), null);
    st().finish();
    let routes = st().plan.arrows;
    expect(routes.map((r) => r.figure).sort()).toEqual([a, b].sort());
    const ra = routes.find((r) => r.figure === a)!;
    const rb = routes.find((r) => r.figure === b)!;
    // Each from where it stands, to the clicked point offset by its place in the group (the middle was x 2).
    expect(ra.points[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(ra.points[1].x).toBeCloseTo(0);
    expect(rb.points[1].x).toBeCloseTo(4);
    // Without the shape, both go to the same point; the new routes replace the old.
    st().setFormation(false);
    st().selectRefs([a, b], false);
    st().setTool('waypoints');
    st().click(at(2, 0), a);
    st().click(at(2, 10), null);
    st().finish();
    routes = st().plan.arrows;
    expect(routes).toHaveLength(2);
    for (const r of routes) expect(r.points[1].x).toBeCloseTo(2);
  });

  it("removes the selection after asking (in the viewer's dialog), in one undo step", async () => {
    const a = place('soldier', 0, 0);
    const b = place('mbt', 10, 0);
    st().selectRefs([a, b], false);
    key('Delete');
    expect(answerConfirm(false)).toBe(true);
    await Promise.resolve();
    expect(st().plan.figures).toHaveLength(2);
    key('Delete');
    expect(answerConfirm(true)).toBe(true);
    await new Promise((r) => setTimeout(r, 0));
    expect(st().plan.figures).toHaveLength(0);
    st().undo();
    expect(st().plan.figures).toHaveLength(2);
  });

  it('selects everything of the step with Ctrl+A', () => {
    place('soldier', 0, 0);
    place('soldier', 3, 0);
    key('KeyA', { ctrl: true });
    expect(st().selection).toHaveLength(2);
    expect(st().tool).toBe('select');
  });

  it('picks every tool by its digit and its letter', () => {
    const want: [string, string, string][] = [
      ['Digit2', 'KeyP', 'place'],
      ['Digit3', 'KeyL', 'waypoints'],
      ['Digit4', 'KeyH', 'throw'],
      ['Digit5', 'KeyO', 'area'],
      ['Digit6', 'KeyN', 'note'],
      ['Digit8', 'KeyX', 'erase'],
      ['Digit9', 'KeyU', 'measure'],
      ['Digit1', 'KeyV', 'select'],
    ];
    for (const [digit, letter, tool] of want) {
      key('Digit1');
      key(digit);
      expect(st().tool).toBe(tool);
      key('Digit1');
      key(letter);
      expect(st().tool).toBe(tool);
    }
    // Not with Ctrl: Ctrl+V and the like stay the browser's.
    key('Digit1');
    expect(key('KeyP', { ctrl: true }).handled).toBe(false);
    expect(st().tool).toBe('select');
  });

  it('measures a way through clicked points, finished like a route', () => {
    st().setTool('measure');
    st().click(at(0, 0), null);
    st().click(at(3, 4), null);
    key('Enter');
    expect(st().measure).toEqual({ points: [at(0, 0), at(3, 4)], done: true });
    // The next click starts a new ruler.
    st().click(at(1, 1), null);
    expect(st().measure!.points).toHaveLength(1);
    key('Escape');
    expect(st().measure).toBeNull();
  });

  it('draws an end mark on a route and the group draft', () => {
    const a = place('soldier', 0, 0);
    const b = place('soldier', 4, 0);
    st().setTool('waypoints');
    st().click(at(0, 0), a);
    st().click(at(8, 0), null);
    const scene = new BoardScene();
    const before = scene.build(st().plan, { step: 0, u: 0, selected: null, draft: null, cursor: null, placing: null }).lines.count;
    st().finish();
    const after = scene.build(st().plan, { step: 0, u: 0, selected: null, draft: null, cursor: null, placing: null }).lines.count;
    // Rings and a cross at the end, as lines.
    expect(after - before).toBeGreaterThan(60);
    st().selectRefs([a, b], false);
    st().setTool('waypoints');
    st().click(at(2, 0), null);
    const g = scene.build(st().plan, { step: 0, u: 0, selected: null, draft: st().draft, cursor: at(2, 9), placing: null });
    expect(g.tris.count).toBeGreaterThan(0);
    expect(keyAt(st().plan.figures[0], 0)).toBeTruthy();
  });
});
