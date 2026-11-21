/**
 * The pick card's heat: what the heat at the clicked pixel is made of and how
 * the place stands against the rest of the view.
 *
 * The stack is every drawn row whose sprite covers the pixel (read by the
 * inspector, render/heatStack.ts); Previous and Next walk through it - the
 * card's fields, the marker and "Jump to in replay" follow the row shown. The
 * relative heat compares the place (the field's cell under the pick) with
 * every place whose centre is in view, from the CPU-side field, never a
 * readback.
 */

import { useEffect, useMemo, useState } from 'react';
import { int, num, t, useLang } from '../../i18n';
import { fieldCellAt, relativeHeat, visibleCells, visibleSpread, type RelativeHeat } from '../../render/heatStack';
import { useInspectStore, type PickResult } from '../../state/inspectStore';
import { useStore } from '../../state/store';
import { useEngine } from '../EngineContext';
import { jumpToRow } from './jump';

type Order = 'weight' | 'time';

/** The relative heat words: "hotter than 93% of the 412 places in view". */
export function relativeText(r: RelativeHeat, negative: boolean): string {
  return t(negative ? 'analysis.heat.relativeNegative' : 'analysis.heat.relative', {
    percent: num(r.percentile * 100, 0),
    places: int(r.places),
    median: num(r.ofMedian, r.ofMedian >= 10 ? 0 : 1),
    peak: num(r.ofPeak * 100, 0),
  });
}

export function HeatHere({ pick }: { pick: PickResult }) {
  useLang();
  const engine = useEngine();
  const reading = useInspectStore((s) => s.stack);
  const saturation = useStore((s) => s.heat.saturation);
  const [order, setOrder] = useState<Order>('weight');
  const [at, setAt] = useState(-1);
  const [origin, setOrigin] = useState<{ id: number; pick: PickResult } | null>(null);
  const [place, setPlace] = useState<{ value: number; rows: number; rel: RelativeHeat | null } | null>(null);

  // The pick as clicked, so walking the stack can come back to it.
  useEffect(() => {
    if (!origin || origin.id !== pick.id) {
      setOrigin({ id: pick.id, pick });
      setAt(-1);
    }
  }, [pick.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const stack = reading && reading.pickId === pick.id ? reading.stack : null;
  const ds = pick.dataset ?? useStore.getState().dataset;

  // The list in the order asked for: strongest first (as read) or by time.
  const list = useMemo(() => {
    if (!stack) return null;
    if (order === 'weight' || !ds?.time) return stack.rows;
    const time = ds.time;
    return Int32Array.from(stack.rows).sort((a, b) => time[a] - time[b] || a - b);
  }, [stack, order, ds]);
  const share = useMemo(() => {
    const m = new Map<number, number>();
    if (stack) for (let i = 0; i < stack.rows.length; i++) m.set(stack.rows[i], stack.contrib[i]);
    return m;
  }, [stack]);

  // The place under the first pick against the places in view.
  useEffect(() => {
    setPlace(null);
    const p = origin?.pick.point;
    if (!engine || !p || origin?.id !== pick.id) return;
    let live = true;
    void engine.heatField.ensure().then((f) => {
      if (!live || !f) return;
      const c = fieldCellAt(f, p.x, p.y, p.z);
      const cells = visibleCells(f, (x, y, z) => engine.project(x, y, z), engine.canvas.clientWidth, engine.canvas.clientHeight);
      const value = c >= 0 ? f.value[c] : 0;
      setPlace({ value, rows: c >= 0 ? f.count[c] : 0, rel: c >= 0 ? relativeHeat(value, visibleSpread(f, cells)) : null });
    });
    return () => {
      live = false;
    };
  }, [engine, origin, pick.id]);

  if (!reading || reading.pickId !== pick.id) return null;
  if (!stack || !list) {
    return <div className="hint">{t('analysis.heat.reading', { percent: num(reading.progress * 100, 0) })}</div>;
  }

  const show = (i: number) => {
    setAt(i);
    if (!engine || !origin) return;
    if (i < 0) {
      useInspectStore.getState().setPick(origin.pick);
      engine.inspector.marker = origin.pick.point;
    } else if (ds) {
      const row = list[i];
      const point = { x: ds.px[row], y: ds.py[row], z: ds.pz[row] };
      useInspectStore.getState().setPick({ ...origin.pick, kind: 'data', row, dataset: ds, point, look: null });
      engine.inspector.marker = point;
    }
    engine.invalidate(2);
  };
  const n = list.length;
  const row = at >= 0 ? list[at] : (pick.row ?? -1);
  const total = stack.total;
  const signed = stack.negative < 0;
  const ofSat = saturation > 0 ? Math.abs(total) / saturation : 0;

  return (
    <div className="heat-here">
      <div className="line">
        <span title={t('analysis.heat.valueTitle')}>{t('analysis.heat.value')}</span>
        <b>
          {num(total, Math.abs(total) >= 100 ? 0 : 2)}
          {saturation > 0 && <small> {t('analysis.heat.ofSaturation', { percent: num(ofSat * 100, 0) })}</small>}
        </b>
      </div>
      {signed && (
        <div className="line">
          <span>{t('analysis.heat.sides')}</span>
          <b>
            +{num(stack.positive, 1)} / {num(stack.negative, 1)}
          </b>
        </div>
      )}
      <div className="line">
        <span>{t('analysis.heat.stack')}</span>
        <b>{t(stack.truncated ? 'analysis.heat.stackRowsCapped' : 'analysis.heat.stackRows', { n: int(stack.count), kept: int(n) })}</b>
      </div>
      {place && (
        <>
          <div className="line">
            <span title={t('analysis.heat.placeTitle')}>{t('analysis.heat.place')}</span>
            <b>{t('analysis.heat.placeValue', { value: num(place.value, Math.abs(place.value) >= 100 ? 0 : 1), rows: int(place.rows) })}</b>
          </div>
          {place.rel ? (
            <div className="hint heat-rel">{relativeText(place.rel, place.value < 0)}</div>
          ) : (
            <div className="hint">{t('analysis.heat.noPlaces')}</div>
          )}
        </>
      )}
      {n > 0 && (
        <div className="heat-stack-nav row wrap">
          <button onClick={() => show(at <= -1 ? n - 1 : at - 1)} title={t('analysis.heat.prevTitle')} aria-label={t('analysis.heat.prevTitle')}>
            â€¹
          </button>
          <span className="heat-stack-at">
            {at < 0 ? t('analysis.heat.picked') : t('analysis.heat.at', { i: int(at + 1), n: int(n) })}
            {at >= 0 && total !== 0 && (
              <small> Â· {t('analysis.heat.adds', { value: num(share.get(row) ?? 0, 2), percent: num(((share.get(row) ?? 0) / total) * 100, 0) })}</small>
            )}
          </span>
          <button onClick={() => show(at >= n - 1 ? -1 : at + 1)} title={t('analysis.heat.nextTitle')} aria-label={t('analysis.heat.nextTitle')}>
            â€º
          </button>
          {ds?.time && (
            <select value={order} onChange={(e) => setOrder(e.target.value as Order)} title={t('analysis.heat.orderTitle')}>
              <option value="weight">{t('analysis.heat.orderWeight')}</option>
              <option value="time">{t('analysis.heat.orderTime')}</option>
            </select>
          )}
        </div>
      )}
      {engine && ds?.time && row >= 0 && (
        <div className="pick-actions">
          <button onClick={() => jumpToRow(engine, ds, row)} title={t('analysis.heat.jumpTitle')}>
            {t('analysis.heat.jump')}
          </button>
        </div>
      )}
    </div>
  );
}
