import { useMemo, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { rgbToCss, teamBaseColor } from '../../render/colors';
import { t, useLang } from '../../i18n';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { datasetFields, fieldName, fieldText, inFieldOrder } from './fields';
import { FieldPicker } from './FieldPicker';
import { personAt, unitsOf } from './units';
import { groundProbe, teamName } from './replayView';
import { unitsPerMetre } from './replayData';
import { selectAndFollow } from './ReplayOverlay';

/**
 * The selected unit's live data, top left of the view: the fields the viewer
 * chose (the gear changes them), updating as the replay plays - Tacview's
 * telemetry window. Written into the DOM each frame, not through React.
 */
export function UnitCard() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const selected = useReplayStore((s) => s.selected);
  const followUnit = useReplayStore((s) => s.followUnit);
  const cardFields = useReplayStore((s) => s.cardFields);
  const [config, setConfig] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLDivElement>(null);
  useLang();
  const unit = useMemo(() => (dataset && selected ? (unitsOf(dataset).byKey.get(selected) ?? null) : null), [dataset, selected]);
  const fields = useMemo(() => (dataset ? datasetFields(dataset) : []), [dataset]);
  const on = !!engine && !!dataset && !!unit && mode === 'team';

  useAnimationFrame(() => {
    if (!engine || !dataset || !unit || !body.current) return;
    const r = useReplayStore.getState();
    const now = engine.live.playhead;
    // Its newest track, where a track that just ended is still drawn beside it.
    const now0 = personAt(unit, now);
    const tr = engine.liveTracks.find((x) => x.person === now0) ?? engine.liveTracks.find((x) => unit.persons.includes(x.person));
    const k = unitsPerMetre(dataset);
    const refTr = r.follow !== null && r.followUnit !== unit.key ? engine.liveTracks.find((x) => x.person === r.follow) : undefined;
    let html = '';
    if (tr) {
      const c = {
        d: dataset,
        unit,
        person: tr.person,
        time: now,
        session: useStore.getState().team.session,
        units: r.units,
        pos: tr,
        k,
        ref: refTr ? { person: refTr.person, pos: refTr } : null,
        groundAt: groundProbe(engine, dataset),
      };
      for (const f of inFieldOrder(r.cardFields)) {
        // Only what this data can have: no row of dashes for a recording without fuel.
        if (f === 'name' || !fields.includes(f)) continue;
        // Range, bearing and aspect are from the followed unit: nothing to say without one.
        if (!c.ref && (f === 'range' || f === 'bearing' || f === 'aspect' || f === 'closure')) continue;
        const v = fieldText(c, f, (i) => teamName(dataset, i));
        // Who it is says nothing when empty; a flight value says it has none now.
        if (!v && (f === 'vehicle' || f === 'team' || f === 'kind')) continue;
        html += `<span>${esc(fieldName(f))}</span><b>${v ? esc(v) : '—'}</b>`;
      }
    }
    if (body.current.innerHTML !== html) body.current.innerHTML = html;
    if (status.current) {
      const s = tr ? '' : t(now < unit.spans[0][0] ? 'replay.card.notYet' : 'replay.card.gone');
      if (status.current.textContent !== s) status.current.textContent = s;
    }
  }, on);

  if (!on || !unit || !dataset) return null;
  const color = unit.team >= 0 ? rgbToCss(teamBaseColor(unit.team)) : '#9aa3ad';
  const following = followUnit === unit.key;
  return (
    <div className="unit-card">
      <div className="uc-head">
        <span className="swatch" style={{ background: color }} />
        <b>{unit.name}</b>
        <span className="uc-actions">
          <button
            className={`small${following ? ' on' : ''}`}
            onClick={() => {
              if (following) useReplayStore.getState().stopFollow();
              else selectAndFollow(unit, personAt(unit, engine?.live.playhead ?? 0));
            }}
            title={following ? t('replay.card.stopTitle') : t('replay.card.followTitle')}
          >
            {following ? t('replay.card.following') : t('replay.card.follow')}
          </button>
          <button className={`small${config ? ' on' : ''}`} onClick={() => setConfig(!config)} title={t('replay.card.fieldsTitle')}>
            ⚙
          </button>
          <button className="link" onClick={() => useReplayStore.getState().select(null)} title={t('replay.card.close')}>
            ×
          </button>
        </span>
      </div>
      <div className="uc-sub">
        {[unit.vehicle, unit.team >= 0 ? teamName(dataset, unit.team) : '', t(`replay.kind.${unit.kind}`)].filter(Boolean).join(' · ')}
      </div>
      <div className="uc-status" ref={status} />
      <div className="uc-grid" ref={body} />
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

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'));
}
