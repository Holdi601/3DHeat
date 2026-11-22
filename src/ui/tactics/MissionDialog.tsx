import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from '../shell/kit';
import { int, list, num, t } from '../../i18n';
import { usePlanStore } from '../../state/planStore';
import { planToMission } from '../../tactics/missions/fromPlan';
import { theatreOf, writeDcsMiz, type ExportWarning, type MissionExportSummary } from '../../tactics/missions/dcsWrite';
import { writeArmaMission } from '../../tactics/missions/armaWrite';
import { ARMA3_WORLDS } from '../../tactics/missions/arma';
import { writeIl2Mission } from '../../tactics/missions/il2Write';
import { REFORGER_WORLDS, writeReforgerLayer } from '../../tactics/missions/reforgerWrite';
import { catalogItems } from '../panels/autoLevel';
import { LEVEL_FOLDER, levelNameOf } from './missionLevel';
import { keepMissionFile, missionFile } from '../../tactics/missions/sources';
import { writeWtBlk } from '../../tactics/missions/wtWrite';
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
      {m.map && <div className="hint">{t('tactics.mission.setOn', { map: m.map })}</div>}
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

type Written = { bytes: Uint8Array; summary: MissionExportSummary; ext?: string };

/** The games a plan is written back for, with what differs between them. */
export type MissionFormat = 'dcs' | 'wt' | 'arma' | 'il2' | 'reforger';
interface FormatDef {
  /** The reader's id (`Plan.mission.format`). */
  id: string;
  /** The game's name, as it calls itself. */
  game: string;
  ext: string;
  type: string;
  write: (m: MissionState, original: Uint8Array | null, target: string) => Promise<Written>;
  /** Maps a new mission can be set on, beside the levels folder's levels of the game. */
  targets: string[];
}
const FORMATS: Record<MissionFormat, FormatDef> = {
  dcs: { id: 'dcs-miz', game: 'DCS World', ext: '.miz', type: 'application/zip', write: (m, o, target) => writeDcsMiz(m, o, target), targets: [] },
  wt: { id: 'wt-blk', game: 'War Thunder', ext: '.blk', type: 'text/plain', write: async (m, o, target) => writeWtBlk(m, o, target), targets: [] },
  arma: { id: 'arma-sqm', game: 'Arma 3', ext: '.sqm', type: 'text/plain', write: (m, o, target) => writeArmaMission(m, o, target), targets: Object.keys(ARMA3_WORLDS) },
  il2: { id: 'il2-mission', game: 'IL-2 Great Battles', ext: '.Mission', type: 'text/plain', write: async (m, o, target) => writeIl2Mission(m, o, target), targets: [] },
  reforger: { id: 'reforger-layer', game: 'Arma Reforger', ext: '.layer', type: 'text/plain', write: async (m, o, target) => writeReforgerLayer(m, o, target), targets: REFORGER_WORLDS },
};
const FORMAT_KEYS = Object.keys(FORMATS) as MissionFormat[];

/** The format a plan is written in by default: its mission's, else by its game. */
function formatOf(missionFormat: string | undefined, game: string): MissionFormat {
  const own = FORMAT_KEYS.find((k) => FORMATS[k].id === missionFormat);
  if (own) return own;
  return game.startsWith('arma') ? 'arma' : 'dcs';
}

/** The file name a written mission is saved as: never the original's, so the original stays. */
function fileName(f: FormatDef, base: Base, stem: string, ext: string, map: string): string {
  const safe = (s: string) => s.replace(/[\\/:*?"<>|]+/g, '_');
  // Arma 3 reads a mission from its folder's mission.sqm, a .pbo by its name: <mission>.<world>.pbo.
  if (f.id === 'arma-sqm') return ext === '.pbo' ? `${safe(stem.replace(/\.[A-Za-z0-9_]+$/, ''))}_3DHeat.${safe(levelNameOf(map) || 'Altis')}.pbo` : 'mission.sqm';
  return base === 'patch' ? `${safe(stem)} (3DHeat)${ext}` : `${safe(stem)}${ext}`;
}

/**
 * Save as mission: for a game (DCS World, War Thunder, Arma 3, IL-2, Arma
 * Reforger), into the mission the plan came from (or another file picked
 * here), or as a new mission for a theatre, level or map; what will change,
 * what stays, and what the mission cannot hold as the board has it, before
 * the file is written.
 */
export function MissionSaveDialog({ onClose }: { onClose: () => void }) {
  const plan = usePlanStore((s) => s.plan);
  const link = plan.mission;
  const [format, setFormat] = useState<MissionFormat>(formatOf(link?.format, plan.game));
  const f = FORMATS[format];
  const source = link?.format === f.id ? link.source : '';
  const [picked, setPicked] = useState<{ name: string; bytes: Uint8Array; format: MissionFormat } | null>(null);
  const own = picked && picked.format === format ? picked : null;
  const original = own?.bytes ?? (source ? missionFile(source) : null);
  const [base, setBase] = useState<Base>(original ? 'patch' : 'new');
  const guess = theatreOf(link?.map ?? plan.level);
  const [theatre, setTheatre] = useState(DCS_THEATRES.find((th) => th.id.toLowerCase() === guess.toLowerCase())?.id ?? DCS_THEATRES[0].id);
  const [level, setLevel] = useState(levelNameOf(link?.map ?? plan.level).replace(/\.[a-z0-9]+$/i, ''));
  const [levels, setLevels] = useState<string[]>([]);
  const mission = useMemo(() => planToMission(plan), [plan]);
  const [result, setResult] = useState<Written | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mode: Base = original ? base : 'new';

  // The levels folder's levels of the game, offered as maps for a new mission.
  useEffect(() => {
    let live = true;
    const folder = LEVEL_FOLDER[f.id];
    void catalogItems().then((items) => {
      if (!live) return;
      const names = items.filter((it) => it.kind === 'level' && it.game === folder).map((it) => it.name);
      setLevels([...new Set([...f.targets, ...names])].sort((a, b) => a.localeCompare(b)));
    });
    return () => {
      live = false;
    };
  }, [f]);

  useEffect(() => {
    let live = true;
    setBusy(true);
    setError(null);
    f.write(mission, mode === 'patch' ? original : null, format === 'dcs' ? theatre : level.trim())
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
  }, [mission, mode, original, theatre, level, format, f]);

  const pick = async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const name = file.name.replace(/\.(miz|blk|sqm|mission|layer|ent)$/i, '');
    keepMissionFile(name, bytes);
    setPicked({ name, bytes, format });
    setBase('patch');
  };

  const save = () => {
    if (!result) return;
    const ext = result.ext ?? f.ext;
    const stem = mode === 'patch' ? (own?.name ?? source) : plan.title || 'mission';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([result.bytes.slice()], { type: ext === '.pbo' ? 'application/octet-stream' : f.type }));
    a.download = fileName(f, mode, stem, ext, link?.map ?? plan.level ?? level);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    onClose();
  };

  const s = result?.summary;
  const warnings = s ? warningLines([...planWarnings(mission), ...s.warnings]) : [];
  const nothing = s && mode === 'patch' && !s.changed.length && !s.added.length && !s.removed.length;
  const ext = result?.ext ?? f.ext;
  return (
    <Dialog title={t('tactics.mission.saveTitle')} onClose={onClose} className="mission-dialog">
      <label className="field mission-theatre">
        <span>{t('tactics.mission.game')}</span>
        <select value={format} onChange={(e) => setFormat(e.target.value as MissionFormat)}>
          {FORMAT_KEYS.map((k) => (
            <option key={k} value={k}>
              {FORMATS[k].game}
            </option>
          ))}
        </select>
      </label>
      <div className="mission-base" role="radiogroup" aria-label={t('tactics.dcs.base')}>
        <span>{t('tactics.dcs.base')}</span>
        <label>
          <input type="radio" name="mission-base" checked={mode === 'patch'} disabled={!original} onChange={() => setBase('patch')} />
          {original ? t('tactics.dcs.base.patch', { name: own?.name ?? source }) : t('tactics.dcs.base.patchNone')}
        </label>
        <label>
          <input type="radio" name="mission-base" checked={mode === 'new'} onChange={() => setBase('new')} />
          {t('tactics.dcs.base.new')}
        </label>
      </div>
      {source && !original && <div className="hint">{t('tactics.mission.missing', { name: source })}</div>}
      <div className="tactics-tools">
        <button type="button" onClick={() => fileRef.current?.click()}>
          {t('tactics.mission.pick', { ext: format === 'arma' ? '.sqm / .pbo' : f.ext })}
        </button>
        {mode === 'new' && format !== 'dcs' && (
          <label className="field mission-theatre">
            <span>{t('tactics.wt.level')}</span>
            <input type="text" list="mission-levels" value={level} onChange={(e) => setLevel(e.target.value)} />
            <datalist id="mission-levels">
              {levels.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </label>
        )}
        {mode === 'new' && format === 'dcs' && (
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
        accept={format === 'arma' ? '.sqm,.pbo' : format === 'reforger' ? '.layer,.ent' : f.ext}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void pick(file);
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
          {mode === 'patch' && s.untouched > 0 && <div className="hint">{t('tactics.dcs.untouched', { n: s.untouched })}</div>}
          {format === 'arma' && <div className="hint">{t('tactics.arma.where')}</div>}
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
          {t('tactics.mission.write', { ext })}
        </button>
      </div>
    </Dialog>
  );
}
