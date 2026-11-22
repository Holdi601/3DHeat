import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from '../shell/kit';
import { int, list, num, t } from '../../i18n';
import { usePlanStore } from '../../state/planStore';
import { planToMission } from '../../tactics/missions/fromPlan';
import { theatreOf, writeDcsMiz, type ExportWarning, type MissionExportSummary } from '../../tactics/missions/dcsWrite';
import { keepMissionFile, missionFile } from '../../tactics/missions/sources';
import type { MissionState } from '../../tactics/missions';
import { THEATRES } from '../../world/theatres';

/** DCS theatres a new mission can be set on, by the names missions give them. */
const DCS_THEATRES = THEATRES.filter((th) => th.game === 'dcs');

/** A warning in words, the same ones counted once. */
function warningLines(ws: ExportWarning[]): string[] {
  const seen = new Map<string, number>();
  for (const w of ws) {
    const line = t(`tactics.dcs.warn.${w.code}`, { group: w.group ?? '', n: w.n ?? 1, what: w.what ?? '' });
    seen.set(line, (seen.get(line) ?? 0) + 1);
  }
  return [...seen].map(([line, n]) => (n > 1 ? `${line} (×${int(n)})` : line));
}

/** The board's notes on what it left out (`planToMission`), as warnings. */
function planWarnings(m: MissionState): ExportWarning[] {
  return m.notes.map((n) => {
    const [code, count] = n.split(':');
    return { code, ...(count ? { n: Number(count) } : {}) };
  });
}

function Counts({ groups, units, waypoints }: { groups: number; units: number; waypoints: number }) {
  return <p className="confirm-text">{t('tactics.dcs.counts', { groups, units, waypoints })}</p>;
}

/** A mission's start, weather and place, in a line or two. */
function MissionFacts({ m }: { m: MissionState }) {
  const info = m.info;
  const when: string[] = [];
  if (info?.date) when.push(new Date(Date.UTC(info.date.year, info.date.month - 1, info.date.day)).toLocaleDateString(undefined, { timeZone: 'UTC' }));
  if (info?.start !== undefined) {
    const sec = ((info.start % 86400) + 86400) % 86400;
    when.push(`${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}`);
  }
  const w = info?.weather;
  const weather: string[] = [];
  if (w?.temperature !== undefined) weather.push(t('tactics.dcs.weather.temp', { t: num(w.temperature) }));
  if (w?.windSpeed !== undefined) weather.push(t('tactics.dcs.weather.wind', { speed: num(w.windSpeed, 1), dir: num(w.windFrom ?? 0) }));
  if (w?.cloudBase !== undefined && (w.cloudDensity ?? 1) > 0) weather.push(t('tactics.dcs.weather.clouds', { base: num(w.cloudBase) }));
  if (w?.visibility !== undefined) weather.push(t('tactics.dcs.weather.vis', { km: num(w.visibility / 1000) }));
  if (w?.fog) weather.push(t('tactics.dcs.weather.fog'));
  return (
    <>
      {m.map && <div className="hint">{t('tactics.mission.map', { map: m.map })}</div>}
      {when.length > 0 && <div className="hint">{t('tactics.dcs.start', { when: when.join(' ') })}</div>}
      {weather.length > 0 && <div className="hint">{t('tactics.dcs.weather', { text: list(weather, 'unit') })}</div>}
      {info?.sortie && <div className="hint">{info.sortie}</div>}
    </>
  );
}

/** What a mission file brought onto the board: its groups, units and waypoints, start, weather, what could not be read. */
export function MissionOpenedDialog({ mission, onClose }: { mission: MissionState; onClose: () => void }) {
  const units = mission.groups.reduce((n, g) => n + g.units.length, 0);
  const waypoints = mission.groups.reduce((n, g) => n + g.route.length, 0);
  return (
    <Dialog title={t('tactics.dcs.openedTitle')} onClose={onClose}>
      <p className="confirm-text">
        <b>{mission.title}</b>
      </p>
      <Counts groups={mission.groups.length} units={units} waypoints={waypoints} />
      <MissionFacts m={mission} />
      {mission.notes.length > 0 && (
        <ul className="mission-warnings">
          {mission.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      <div className="dialog-actions">
        <button type="button" className="primary" autoFocus onClick={onClose}>
          {t('shell.confirm.ok')}
        </button>
      </div>
    </Dialog>
  );
}

type Base = 'patch' | 'new';

/**
 * Save as DCS mission: into the mission the plan came from (or another .miz
 * picked here), or as a new mission for a theatre; what will change, what
 * stays, and what the mission cannot hold, before the file is written.
 */
export function MissionSaveDialog({ onClose }: { onClose: () => void }) {
  const plan = usePlanStore((s) => s.plan);
  const link = plan.mission;
  const source = link?.format === 'dcs-miz' ? link.source : '';
  const [picked, setPicked] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const original = picked?.bytes ?? (source ? missionFile(source) : null);
  const [base, setBase] = useState<Base>(original ? 'patch' : 'new');
  const guess = theatreOf(link?.map ?? plan.level);
  const [theatre, setTheatre] = useState(DCS_THEATRES.find((th) => th.id.toLowerCase() === guess.toLowerCase())?.id ?? DCS_THEATRES[0].id);
  const mission = useMemo(() => planToMission(plan), [plan]);
  const [result, setResult] = useState<{ bytes: Uint8Array; summary: MissionExportSummary } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    setBusy(true);
    setError(null);
    writeDcsMiz(mission, base === 'patch' ? original : null, theatre)
      .then((r) => live && setResult(r))
      .catch((e) => {
        if (!live) return;
        setResult(null);
        setError(t('tactics.dcs.failed', { reason: e instanceof Error ? e.message : String(e) }));
      })
      .finally(() => live && setBusy(false));
    return () => {
      live = false;
    };
  }, [mission, base, original, theatre]);

  const pick = async (f: File) => {
    const bytes = new Uint8Array(await f.arrayBuffer());
    const name = f.name.replace(/\.miz$/i, '');
    keepMissionFile(name, bytes);
    setPicked({ name, bytes });
    setBase('patch');
  };

  const save = () => {
    if (!result) return;
    const stem = (base === 'patch' ? (picked?.name ?? source) : plan.title || 'mission').replace(/[\\/:*?"<>|]+/g, '_');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([result.bytes.slice()], { type: 'application/zip' }));
    // Always a new file: the original stays as it was.
    a.download = base === 'patch' ? `${stem} (3DHeat).miz` : `${stem}.miz`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    onClose();
  };

  const s = result?.summary;
  const warnings = s ? warningLines([...planWarnings(mission), ...s.warnings]) : [];
  const nothing = s && base === 'patch' && !s.changed.length && !s.added.length && !s.removed.length;
  return (
    <Dialog title={t('tactics.dcs.saveTitle')} onClose={onClose} className="mission-dialog">
      <div className="mission-base" role="radiogroup" aria-label={t('tactics.dcs.base')}>
        <span>{t('tactics.dcs.base')}</span>
        <label>
          <input type="radio" name="mission-base" checked={base === 'patch'} disabled={!original} onChange={() => setBase('patch')} />
          {original ? t('tactics.dcs.base.patch', { name: picked?.name ?? source }) : t('tactics.dcs.base.patchNone')}
        </label>
        <label>
          <input type="radio" name="mission-base" checked={base === 'new'} onChange={() => setBase('new')} />
          {t('tactics.dcs.base.new')}
        </label>
      </div>
      {source && !original && <div className="hint">{t('tactics.dcs.missing', { name: source })}</div>}
      <div className="tactics-tools">
        <button type="button" onClick={() => fileRef.current?.click()}>
          {t('tactics.dcs.pick')}
        </button>
        {base === 'new' && (
          <label className="field mission-theatre">
            <span>{t('tactics.dcs.theatre')}</span>
            <select value={theatre} onChange={(e) => setTheatre(e.target.value)}>
              {DCS_THEATRES.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".miz"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void pick(f);
          e.target.value = '';
        }}
      />
      {busy && <div className="hint">{t('tactics.dcs.busy')}</div>}
      {error && <div className="hint warn">{error}</div>}
      {s && (
        <>
          <Counts groups={s.groups} units={s.units} waypoints={s.waypoints} />
          {nothing && <div className="hint">{t('tactics.dcs.nothing')}</div>}
          {s.changed.length > 0 && <div className="hint">{t('tactics.dcs.changed', { list: list(s.changed) })}</div>}
          {s.added.length > 0 && <div className="hint">{t('tactics.dcs.added', { list: list(s.added) })}</div>}
          {s.removed.length > 0 && <div className="hint">{t('tactics.dcs.removed', { list: list(s.removed) })}</div>}
          {base === 'patch' && s.untouched > 0 && <div className="hint">{t('tactics.dcs.untouched', { n: s.untouched })}</div>}
          {warnings.length > 0 && (
            <>
              <div className="tactics-group-name">{t('tactics.dcs.warnings')}</div>
              <ul className="mission-warnings">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      <div className="dialog-actions">
        <button type="button" onClick={onClose}>
          {t('shell.confirm.cancel')}
        </button>
        <button type="button" className="primary" disabled={!result || busy} onClick={save}>
          {t('tactics.dcs.write')}
        </button>
      </div>
    </Dialog>
  );
}
