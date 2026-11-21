/**
 * The tactics board's keys, while its tab is open: undo and redo, finishing
 * and taking back what is being drawn, removing the selection (after asking),
 * the gizmo's modes, turning, moving, playback, and a key for every tool (a
 * digit, and a letter the camera does not fly with), and the tasks' keys:
 * `I` opens the task picker (`Shift+I` the legend), `Shift` and a digit
 * gives the selection one of nine tasks at once (`TaskDef.quick`). Listed in
 * docs/keyboard-reference.md#tactics-board.
 */

import { BOARD_TOOLS, usePlanStore } from '../../state/planStore';
import { t } from '../../i18n';
import { TASKS, taskDef } from '../../tactics/tasks';

/** Asks before removing the selection; true when it was removed. */
export function confirmRemoveSelection(): boolean {
  const s = usePlanStore.getState();
  const n = s.selection.length;
  if (!n) return false;
  const ok = typeof window === 'undefined' || typeof window.confirm !== 'function' ? true : window.confirm(t('tactics.removeConfirm', { n }));
  if (!ok) return false;
  usePlanStore.getState().removeSelection();
  return true;
}

/** A tool's key hint for a tooltip: "3 / L". */
export function toolKeys(id: string): string {
  const k = BOARD_TOOLS.find((x) => x.id === id);
  return k ? `${k.digit} / ${k.letter}` : '';
}

/** Handles a key on the board; true when it was the board's (the caller stops there). */
export function boardKeyDown(ev: KeyboardEvent): boolean {
  const board = usePlanStore.getState();
  const ctrl = ev.ctrlKey || ev.metaKey;
  if (ctrl && ev.code === 'KeyZ') {
    ev.preventDefault();
    if (ev.shiftKey) board.redo();
    else board.undo();
    return true;
  }
  if (ctrl && ev.code === 'KeyY') {
    ev.preventDefault();
    board.redo();
    return true;
  }
  if (ctrl && ev.code === 'KeyA') {
    ev.preventDefault();
    board.selectAll();
    return true;
  }
  const drawing = !!board.draft || !!board.taskDraft || (board.tool === 'measure' && !!board.measure && !board.measure.done);
  if (ev.code === 'Enter' || ev.code === 'NumpadEnter') {
    if (!drawing) return false;
    // Not also a click on the tool button that still has the focus.
    ev.preventDefault();
    board.finish();
    return true;
  }
  if (ev.code === 'Escape') {
    if (board.aiming) board.startAim(null);
    else if (board.taskPicker) board.setTaskPicker(false);
    else if (board.taskDraft) {
      // Esc keeps what a task has of its points, if that is enough for it; else it stays as it was.
      const task = board.plan.tasks.find((x) => x.id === board.taskDraft!.task);
      if (task && board.taskDraft.points.length >= Math.max(1, taskDef(task.kind).min)) board.finish();
      else board.cancel();
    } else if (board.dragBase) board.cancelDrag();
    else if (drawing) {
      // Esc ends a route that has a way to go, and drops one that has only its start.
      const pts = board.draft?.points.length ?? board.measure?.points.length ?? 0;
      if (pts >= 2) board.finish();
      else board.cancel();
    } else if (board.moving) board.cancel();
    else if (board.measure) board.cancel();
    else board.select(null);
    return true;
  }
  if (ev.code === 'Backspace' && drawing) {
    ev.preventDefault();
    board.undoPoint();
    return true;
  }
  if ((ev.code === 'Delete' || ev.code === 'Backspace') && board.selection.length) {
    ev.preventDefault();
    confirmRemoveSelection();
    return true;
  }
  if (ctrl || ev.altKey) return false;
  // The gizmo's keys: W/E/R as in Unity and Unreal, or G/R/S as in Blender, while something is selected.
  const gizmoKeys: Record<string, Record<string, 'move' | 'rotate' | 'scale'>> = {
    editor: { KeyW: 'move', KeyE: 'rotate', KeyR: 'scale' },
    blender: { KeyG: 'move', KeyR: 'rotate', KeyS: 'scale' },
  };
  const gm = board.selection.length ? gizmoKeys[board.keyScheme][ev.code] : undefined;
  if (gm) {
    board.setGizmo(gm);
    return true;
  }
  if (ev.code === 'KeyR') {
    board.rotateSelected(ev.shiftKey ? -Math.PI / 12 : Math.PI / 12);
    return true;
  }
  if (ev.code === 'KeyM' && board.selected) {
    board.startMove();
    return true;
  }
  // Tasks: the picker, the legend, and nine at a keystroke.
  if (ev.code === 'KeyI') {
    if (ev.shiftKey) board.setTaskLegend(!board.taskLegend);
    else board.setTaskPicker(!board.taskPicker);
    return true;
  }
  const quick = ev.shiftKey && /^(Digit|Numpad)[1-9]$/.test(ev.code) ? TASKS.find((x) => x.quick === Number(ev.code.slice(-1))) : undefined;
  if (quick) {
    ev.preventDefault();
    board.addTask(quick.id);
    return true;
  }
  if (ev.code === 'KeyK') {
    ev.preventDefault();
    board.play(!board.playing);
    return true;
  }
  if (!ev.shiftKey) {
    const tool = BOARD_TOOLS.find((x) => ev.code === `Digit${x.digit}` || ev.code === `Numpad${x.digit}` || ev.code === `Key${x.letter}`);
    if (tool) {
      board.setTool(tool.id);
      return true;
    }
  }
  return false;
}
