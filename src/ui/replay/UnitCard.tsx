import { useMemo, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { useReplayStore } from '../../state/replayStore';
import { rgbToCss, teamBaseColor } from '../../render/colors';
import type { Engine } from '../../render/engine';
import { t, useLang } from '../../i18n';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { datasetFields, fieldName, fieldShort, fieldText, inFieldOrder } from './fields';
import { FieldPicker } from './FieldPicker';
import { personAt, unitsOf, vehicleOf, type Unit } from './units';
import { groundProbe, teamName } from './replayView';
import { unitsPerMetre } from './replayData';
import { selectAndFollow } from './ReplayOverlay';
import { leanRawRows } from '../../overlay/lean/load';
import { unitPrefs } from '../../state/unitsStore';
import { RELATIVE_FIELDS } from './relative';
import { clearLook, lookAtUnit, lookTargets } from './pair';
import { usePlayhead } from './hooks';
import { personRows } from '../../data/flight';

/**
 * The selected unit's live data, top left of the view: the fields the viewer
 * chose (the gear changes them), updating as the replay plays - Tacview's
 * telemetry window. Written into the DOM each frame, not through React.
 *
 * While the camera looks from the followed unit (A) at a second one (B), the
 * values between them follow in a strip, and B's own card under it.
 */
export function UnitCard() {
  const selected = useReplayStore((s) => s.selected);
  const followUnit = useReplayStore((s) => s.followUnit);
  const target = useReplayStore((s) => s.target);
  const pair = !!followUnit && !!target && target !== followUnit;
  return (
    <>
      {selected && <UnitCardView unitKey={selected} second={false} />}
      {pair && <PairStrip a={followUnit!} b={target!} />}
      {pair && target !== selected && <UnitCardView unitKey={target!} second />}
    </>
  );
}

/** A unit's newest track, where a track that just ended is still drawn beside it. */
function liveTrackOf(engine: Engine, unit: Unit, now: number) {
  const now0 = personAt(unit, now);
  return engine.liveTracks.find((x) => x.person === now0) ?? engine.liveTracks.find((x) => unit.persons.includes(x.person));
}

const isRelative = (f: string) => (RELATIVE_FIELDS as readonly string[]).includes(f);

/**
 * A unit's card. The first is the selected unit's; `second` is B's, compact,
 * its values from A in the strip above it rather than again in the card.
 */
/** An ACMI flag's value at a row (Visible, Disabled); NaN where the recording does not say. */
function flagAt(d: Dataset, name: string, row: number): number {
  const a = d.attrs.find((x) => x.kind === 'number' && x.name === name);
  return a ? (a.data as Float32Array)[row] : NaN;
}

/** A person's last row at or before `time`; -1 for none. */
function rowAt(d: Dataset, person: number, time: number): number {
  if (person < 0 || !d.time || !d.attrs.some((x) => x.name === 'Visible' || x.name === 'Disabled')) return -1;
  const idx = personRows(d);
  if (!idx) return -1;
  let lo = idx.start[person];
  let hi = idx.start[person + 1];
  if (hi <= lo || d.time[idx.rows[lo]] > time) return -1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (d.time[idx.rows[mid]] <= time) lo = mid;
    else hi = mid;
  }
  return idx.rows[lo];
}

function UnitCardView({ unitKey, second }: { unitKey: string; second: boolean }) {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const followUnit = useReplayStore((s) => s.followUnit);
  const target = useReplayStore((s) => s.target);
  const cardFields = useReplayStore((s) => s.cardFields);
  const [config, setConfig] = useState(false);
  const [raw, setRaw] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const rawBody = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLDivElement>(null);
  useLang();
  const index = useMemo(() => (dataset ? unitsOf(dataset) : null), [dataset]);
  const unit = index?.byKey.get(unitKey) ?? null;
  const fields = useMemo(() => (dataset ? datasetFields(dataset) : []), [dataset]);
  const following = !!unit && followUnit === unit.key;
  // The look-at list, renewed now and then for the weapons that fly.
  const now = usePlayhead(1000);
  const on = !!engine && !!dataset && !!unit && mode === 'team';

  useAnimationFrame(() => {
    if (!engine || !dataset || !unit || !body.current) return;
    const r = useReplayStore.getState();
    const now = engine.live.playhead;
    const tr = liveTrackOf(engine, unit, now);
    const k = unitsPerMetre(dataset);
    const refTr = !second && r.follow !== null && r.followUnit !== unit.key ? engine.liveTracks.find((x) => x.person === r.follow) : undefined;
    let html = '';
    if (tr) {
      const c = {
        d: dataset,
        unit,
        person: tr.person,
        time: now,
        session: useStore.getState().team.session,
        units: unitPrefs(),
        pos: tr,
        k,
        ref: refTr ? { person: refTr.person, pos: refTr } : null,
        groundAt: groundProbe(engine, dataset),
      };
      for (const f of inFieldOrder(r.cardFields)) {
        // Only what this data can have: no row of dashes for a recording without fuel.
        if (f === 'name' || !fields.includes(f)) continue;
        // Range, bearing and aspect are from the followed unit: nothing to say without one.
        if (!c.ref && isRelative(f)) continue;
        const v = fieldText(c, f, (i) => teamName(dataset, i));
        // Who it is says nothing when empty; a flight value says it has none now.
        if (!v && (f === 'vehicle' || f === 'team' || f === 'kind')) continue;
        html += `<span>${esc(fieldName(f))}</span><b>${v ? esc(v) : '—'}</b>`;
      }
    }
    if (body.current.innerHTML !== html) body.current.innerHTML = html;
    // Every column the recording has at this row, as Tacview's raw telemetry: what no field reads too.
    if (rawBody.current) {
      // A lean overlay keeps no rows: the unit's own, read from its file when first asked for.
      const rows = tr && raw && tr.row >= 0 ? (leanRawRows(dataset, tr.person, now) ?? rawRows(dataset, tr.row)) : [];
      const rawHtml = rows.map(([k, v]) => `<span>${esc(k)}</span><b>${esc(v)}</b>`).join('');
      if (rawBody.current.innerHTML !== rawHtml) rawBody.current.innerHTML = rawHtml;
    }
    if (status.current) {
      // Tacview's Visible 0 and Disabled 1 at the unit's row now: hidden or out of combat, not destroyed.
      const at = tr ? tr.row : rowAt(dataset, personAt(unit, now), now);
      const s =
        at >= 0 && flagAt(dataset, 'Visible', at) < 0.5
          ? t('replay.card.hidden')
          : at >= 0 && flagAt(dataset, 'Disabled', at) >= 0.5
            ? t('replay.card.disabled')
            : tr
              ? ''
              : t(now < unit.spans[0][0] ? 'replay.card.notYet' : 'replay.card.gone');
      if (status.current.textContent !== s) status.current.textContent = s;
    }
  }, on);

  if (!on || !unit || !dataset || !index) return null;
  const color = unit.team >= 0 ? rgbToCss(teamBaseColor(unit.team)) : '#9aa3ad';
  const r = useReplayStore.getState;
  const playhead = () => engine?.live.playhead ?? 0;
  return (
    <div className={`unit-card${second ? ' uc-second' : ''}`}>
      <div className="uc-head">
        <span className="swatch" style={{ background: color }} />
        {second && (
          <span className="uc-role" title={t('replay.lookAt.bTitle')}>
            {t('replay.lookAt.b')}
          </span>
        )}
        <b>{unit.name}</b>
        <span className="uc-actions">
          {second ? (
            <button className="small" onClick={() => r().swapTarget()} title={t('replay.target.swapTitle')}>
              {t('replay.target.swap')}
            </button>
          ) : (
            <button
              className={`small${following ? ' on' : ''}`}
              onClick={() => {
                if (following) r().stopFollow();
                else selectAndFollow(unit, personAt(unit, playhead()));
              }}
              title={following ? t('replay.card.stopTitle') : t('replay.card.followTitle')}
            >
              {following ? t('replay.card.following') : t('replay.card.follow')}
            </button>
          )}
          <button className={`small${raw ? ' on' : ''}`} onClick={() => setRaw(!raw)} title={t('replay.card.rawTitle')}>
            {t('replay.card.raw')}
          </button>
          {!second && (
            <button className={`small${config ? ' on' : ''}`} onClick={() => setConfig(!config)} title={t('replay.card.fieldsTitle')}>
              ⚙
            </button>
          )}
          <button
            className="link"
            onClick={() => (second ? clearLook() : r().select(null))}
            title={second ? t('replay.lookAt.clearTitle') : t('replay.card.close')}
          >
            ×
          </button>
        </span>
      </div>
      <div className="uc-sub">
        {[vehicleOf(unit, personAt(unit, playhead())), unit.team >= 0 ? teamName(dataset, unit.team) : '', t(`replay.kind.${unit.kind}`)].filter(Boolean).join(' · ')}
      </div>
      {following && !second && (
        <label className="uc-look" title={t('replay.lookAt.pickTitle')}>
          <span>{t('replay.lookAt.pick')}</span>
          <select
            value={target ?? ''}
            onChange={(e) => {
              const u = e.target.value ? index.byKey.get(e.target.value) : undefined;
              if (u) lookAtUnit(u, personAt(u, playhead()));
              else clearLook();
            }}
          >
            <option value="">{t('replay.target.none')}</option>
            {lookTargets(index, followUnit, now).map((u) => (
              <option key={u.key} value={u.key}>
                {u.name}
                {u.vehicle && !u.name.startsWith(u.vehicle) ? ` · ${u.vehicle}` : ''}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="uc-status" ref={status} />
      <div className="uc-grid" ref={body} />
      {raw && <div className="uc-grid uc-raw" ref={rawBody} />}
      {config && (
        <FieldPicker
          available={fields.filter((f) => f !== 'name')}
          chosen={cardFields}
          onChange={(next) => useReplayStore.getState().patchSaved({ cardFields: inFieldOrder(next) })}
        />
      )}
    </div>
  );
}

/**
 * The values between A and B, between their cards: range, bearing, aspect,
 * closure, the height between them and the line-of-sight rate, every frame.
 */
function PairStrip({ a, b }: { a: string; b: string }) {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const body = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLSpanElement>(null);
  useLang();
  const index = useMemo(() => (dataset ? unitsOf(dataset) : null), [dataset]);
  const fields = useMemo(() => (dataset ? datasetFields(dataset) : []), [dataset]);
  const ua = index?.byKey.get(a) ?? null;
  const ub = index?.byKey.get(b) ?? null;
  const on = !!engine && !!dataset && !!ua && !!ub && mode === 'team';

  useAnimationFrame(() => {
    if (!engine || !dataset || !ua || !ub || !body.current) return;
    const now = engine.live.playhead;
    const ta = liveTrackOf(engine, ua, now);
    const tb = liveTrackOf(engine, ub, now);
    const c =
      ta && tb
        ? {
            d: dataset,
            unit: ub,
            person: tb.person,
            time: now,
            session: useStore.getState().team.session,
            units: unitPrefs(),
            pos: tb,
            k: unitsPerMetre(dataset),
            ref: { person: ta.person, pos: ta },
          }
        : null;
    let html = '';
    for (const f of RELATIVE_FIELDS) {
      if (!fields.includes(f)) continue;
      const v = c ? fieldText(c, f, (i) => teamName(dataset, i)) : '';
      html += `<span title="${esc(fieldName(f))}">${esc(fieldShort(f))}</span><b>${v ? esc(v) : '—'}</b>`;
    }
    if (body.current.innerHTML !== html) body.current.innerHTML = html;
    if (status.current) {
      // B lost: the camera still looks where it was for a moment, then follows A alone.
      const s = ta && !tb ? t('replay.lookAt.lost') : '';
      if (status.current.textContent !== s) status.current.textContent = s;
    }
  }, on);

  if (!on || !ua || !ub) return null;
  return (
    <div className="pair-strip" title={t('replay.lookAt.stripTitle')}>
      <div className="ps-head">
        <b>{ua.name}</b>
        <span className="ps-arrow">→</span>
        <b>{ub.name}</b>
        <span className="ps-status" ref={status} />
      </div>
      <div className="ps-grid" ref={body} />
    </div>
  );
}

/** A row's every column as name and text: categories by their label, numbers as recorded. */
export function rawRows(d: Dataset, row: number): [string, string][] {
  const out: [string, string][] = [];
  for (const a of d.attrs) {
    let v: string;
    if (a.kind === 'category') v = a.categories?.[(a.data as Uint32Array)[row]] ?? '';
    else {
      const x = (a.data as Float32Array)[row];
      v = Number.isFinite(x) ? String(Math.round(x * 1000) / 1000) : '';
    }
    if (v.trim() && a.name !== 'RecordingInfo') out.push([a.name, v.length > 80 ? `${v.slice(0, 79)}…` : v]);
  }
  return out;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'));
}
