import { useEffect, useRef } from 'react';
import { useStore } from '../../state/store';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { hitsOf, weaponOf } from '../../vehicle/hits';
import { OUTCOME_COLOURS } from '../../vehicle/scene';
import { num, t } from '../../i18n';
import './replay.css';

const css = (c: readonly number[]) => `rgb(${c.map((v) => Math.round(Math.min(1, v) * 255)).join(',')})`;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[c]};`);

/**
 * The card of the hit mark under the pointer (figures/hitmarks.ts): what the
 * hit did, who fired it, with what, and the damage where the data says. Built
 * straight into the DOM, and only looked for when the pointer has moved or
 * the playhead has.
 */
export function HitMarkTip() {
  const engine = useEngine();
  const on = useStore((s) => s.mode === 'team' && s.team.figures && s.team.hitMarks && !!s.dataset);
  const box = useRef<HTMLDivElement>(null);
  const cursor = useRef<{ x: number; y: number } | null>(null);
  const shown = useRef(-1);

  useEffect(() => {
    if (!on || !engine) return;
    const canvas = engine.canvas;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= canvas.clientWidth && y <= canvas.clientHeight && e.target === canvas;
      cursor.current = inside && e.buttons === 0 ? { x, y } : null;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [on, engine]);

  useAnimationFrame(() => {
    const el = box.current;
    if (!el || !engine) return;
    const c = cursor.current;
    const d = useStore.getState().dataset;
    const id = c && d ? engine.hitMarkAt(c.x, c.y) : -1;
    if (id < 0 || !d || !c) {
      if (shown.current !== -1) el.style.display = 'none';
      shown.current = -1;
      return;
    }
    el.style.transform = `translate(${Math.round(c.x + 14)}px, ${Math.round(c.y + 14)}px)`;
    if (id === shown.current) return;
    shown.current = id;
    const h = hitsOf(d).hits[id];
    if (!h) return;
    const rows: [string, string][] = [
      [t('vehicle.card.shooter'), h.shooter || '-'],
      [t('vehicle.card.weapon'), weaponOf(h) || '-'],
    ];
    if (h.calibre !== null) rows.push([t('far.hitCalibre'), `${num(h.calibre, h.calibre < 20 ? 1 : 0)} mm`]);
    if (h.damage !== null) rows.push([t('vehicle.card.damage'), num(h.damage, 0)]);
    if (h.modules > 0) rows.push([t('vehicle.card.modules'), String(h.modules)]);
    const what = h.killingShot ? t('vehicle.card.killingShot') : t(`vehicle.outcome.${h.outcome}`);
    el.innerHTML =
      `<div class="hh"><i class="hit-mark-swatch" style="background:${css(OUTCOME_COLOURS[h.outcome])}"></i>${esc(what)} · ${esc(h.victim || h.vehicle)}</div>` +
      `<div class="hg">${rows.map(([k, v]) => `<span>${esc(k)}</span><b>${esc(v)}</b>`).join('')}</div>`;
    el.style.display = '';
  }, on && !!engine);

  if (!on) return null;
  return <div className="replay-hover hit-mark-tip" ref={box} style={{ display: 'none' }} />;
}
