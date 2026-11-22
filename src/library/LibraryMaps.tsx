/**
 * Levels and maps, by game: the extracted levels and model packs with their
 * version and fingerprint, how many matches use each, the maps matches are
 * played on that no level is there for, and what each map extractor says is
 * new, changed or outdated in the user's own install (a DLC, a game update),
 * with Extract for one map or all. Also the duplicates and the settings.
 */

import { useEffect, useMemo, useState } from 'react';
import { ask, findManager, type Item as ManagedItem, type MapGame, type Route, type State as ManagerState } from '../extractors/manager';
import { t, useLang } from '../i18n';
import { toast } from '../ui/shell/kit';
import { lib, thumbSrc, type LevelsAnswer, type MapExtractor, type Settings } from './api';
import { canonGame, date, gameMark, gameName, size } from './games';
import { openExtractors } from './LibraryQueue';
import { refreshJobs, useLibrary } from './store';

async function extract(x: MapExtractor, game: string | null, maps: string[]): Promise<void> {
  if (!x.installed) {
    openExtractors(x.id);
    return;
  }
  try {
    await lib.extract(x.id, game, maps);
    toast(maps.length ? t('library.maps.extracting', { count: maps.length }) : t('library.maps.extractingAll'), 'good');
    useLibrary.setState({ queueOpen: true });
    void refreshJobs();
  } catch (e) {
    toast((e as Error).message, 'bad', 4000);
  }
}

function ExtractorBox({ x, game, onCheck }: { x: MapExtractor; game: string; onCheck: () => void }) {
  const [open, setOpen] = useState(false);
  const pending = x.maps.filter((m) => !m.game || m.game === game);
  const n = (k: string) => pending.filter((m) => m.state === k).length;
  return (
    <div className="lib-extractor">
      <div className="lib-extractor-head">
        <strong>{x.name}</strong>
        <span className="lib-hint">{x.installed ? `${x.version ?? ''}${x.checked ? ` · ${t('library.maps.checked', { when: date(x.checked) })}` : ''}` : t('library.maps.notInstalled')}</span>
        <span className="lib-spacer" />
        {x.installed ? (
          <button type="button" className="small" onClick={onCheck} data-usage="cmd:lib.checkMaps">
            {t('library.maps.check')}
          </button>
        ) : (
          <button type="button" className="small primary" onClick={() => openExtractors(x.id)}>
            {t('library.hint.install', { id: x.id })}
          </button>
        )}
      </div>
      {x.installed && x.checked !== null && (
        <div className="lib-extractor-news">
          {pending.length ? (
            <>
              <span className="lib-news">
                {n('new') > 0 && <span className="lib-tag good">{t('library.maps.new', { count: n('new') })}</span>}
                {n('changed') > 0 && <span className="lib-tag warn">{t('library.maps.changed', { count: n('changed') })}</span>}
                {n('outdated') > 0 && <span className="lib-tag warn">{t('library.maps.outdated', { count: n('outdated') })}</span>}
              </span>
              <button type="button" className="small primary" onClick={() => void extract(x, game, pending.map((m) => m.id))} data-usage="cmd:lib.extractAll">
                {t('library.maps.extractAll', { count: pending.length })}
              </button>
              <button type="button" className="small ghost" onClick={() => setOpen(!open)}>
                {open ? t('library.maps.hideList') : t('library.maps.showList')}
              </button>
            </>
          ) : (
            <span className="lib-hint">{t('library.maps.upToDate')}</span>
          )}
        </div>
      )}
      {open && (
        <div className="lib-maplist">
          {pending.map((m) => (
            <div key={m.id} className="lib-maprow">
              <span className={`lib-tag ${m.state === 'new' ? 'good' : 'warn'}`}>{t(`library.maps.state.${m.state}`)}</span>
              <span className="lib-maprow-name">{m.name ?? m.id}</span>
              <button type="button" className="small" onClick={() => void extract(x, game, [m.id])} data-usage="cmd:lib.extractOne">
                {t('library.maps.extract')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * An installed extractor's maps of one game, as the Extractors manager keeps them
 * (`status --json`), and Extract through the manager, map by map, with its progress.
 */
function ManagedBox({ x, mg, route, onChange }: { x: ManagedItem; mg: MapGame; route: Route; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const c = mg.counts;
  const pending = mg.maps.filter((m) => m.state === 'new' || m.state === 'changed' || m.state === 'outdated');
  const run = async (body: { new?: boolean; changed?: boolean; outdated?: boolean; maps?: string[] }) => {
    try {
      await ask(route, 'POST', `/extract/${encodeURIComponent(x.id)}`, { game: mg.game, new: false, changed: false, outdated: false, maps: [], ...body });
      toast(t('library.maps.extractingAll'), 'good');
      onChange();
    } catch (e) {
      toast((e as Error).message, 'bad', 5000);
    }
  };
  const ex = x.extract;
  return (
    <div className="lib-extractor">
      <div className="lib-extractor-head">
        <strong>{x.name}</strong>
        <span className="lib-hint">
          {x.installed}
          {x.status?.at ? ` · ${t('library.maps.checked', { when: date(x.status.at * 1000) })}` : ''}
          {mg.build ? ` · ${mg.build}` : ''}
        </span>
        <span className="lib-spacer" />
        <button
          type="button"
          className="small"
          disabled={!!ex?.running}
          onClick={() => void ask(route, 'POST', `/status/${encodeURIComponent(x.id)}?fresh=1`).then(onChange, (e: Error) => toast(e.message, 'bad'))}
          data-usage="cmd:lib.checkMaps"
        >
          {t('library.maps.check')}
        </button>
      </div>
      {ex?.running ? (
        <div className="lib-extractor-news">
          <span className="lib-busy">{t('library.maps.progress', { done: ex.ok + ex.failed, count: ex.total, failed: ex.failed })}</span>
          <button type="button" className="small" onClick={() => void ask(route, 'POST', `/cancel/${encodeURIComponent(x.id)}`).then(onChange)}>
            {t('library.job.cancel')}
          </button>
        </div>
      ) : (
        <div className="lib-extractor-news">
          {pending.length ? (
            <>
              <span className="lib-news">
                {c.new > 0 && <span className="lib-tag good">{t('library.maps.new', { count: c.new })}</span>}
                {c.changed > 0 && <span className="lib-tag warn">{t('library.maps.changed', { count: c.changed })}</span>}
                {c.outdated > 0 && <span className="lib-tag warn">{t('library.maps.outdated', { count: c.outdated })}</span>}
              </span>
              <button type="button" className="small primary" onClick={() => void run({ new: true, changed: true, outdated: true })} data-usage="cmd:lib.extractAll">
                {t('library.maps.extractAll', { count: pending.length })}
              </button>
              <button type="button" className="small ghost" onClick={() => setOpen(!open)}>
                {open ? t('library.maps.hideList') : t('library.maps.showList')}
              </button>
            </>
          ) : (
            <span className="lib-hint">{t('library.maps.upToDate')}</span>
          )}
          {ex?.finished && ex.failed > 0 && <span className="lib-bad">{t('library.maps.someFailed', { count: ex.failed })}</span>}
        </div>
      )}
      {open && (
        <div className="lib-maplist">
          {pending.map((m) => (
            <div key={m.id} className="lib-maprow">
              <span className={`lib-tag ${m.state === 'new' ? 'good' : 'warn'}`}>{t(`library.maps.state.${m.state}`)}</span>
              <span className="lib-maprow-name">{m.title || m.id}</span>
              <button type="button" className="small" disabled={!!ex?.running} onClick={() => void run({ maps: [m.id] })} data-usage="cmd:lib.extractOne">
                {t('library.maps.extract')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LibraryMaps() {
  useLang();
  const token = useLibrary((s) => s.status?.thumbToken);
  const [d, setD] = useState<LevelsAnswer | null>(null);
  const [tick, setTick] = useState(0);
  const [mgr, setMgr] = useState<{ route: Route; state: ManagerState } | null>(null);
  useEffect(() => {
    void lib
      .levels()
      .then(setD)
      .catch((e: Error) => toast(e.message, 'bad'));
    // The Extractors manager, where the app has one: its map status and its extracts.
    void findManager().then(setMgr);
  }, [tick]);
  // While an extract runs: follow it; when it ends, the new levels into the catalogue.
  const extracting = mgr?.state.extractors.some((x) => x.extract?.running) ?? false;
  useEffect(() => {
    if (!extracting) return;
    const id = window.setInterval(() => void findManager().then((m) => {
      setMgr(m);
      if (m && !m.state.extractors.some((x) => x.extract?.running)) {
        void lib.rescan().catch(() => {});
        setTick((x) => x + 1);
      }
    }), 2000);
    return () => window.clearInterval(id);
  }, [extracting]);
  const managed = (g: string) =>
    (mgr?.state.extractors ?? []).flatMap((x) => (x.installed && x.status ? x.status.games.filter((mg) => canonGame(mg.game) === g || canonGame(mg.label) === g).map((mg) => ({ x, mg })) : []));
  const games = useMemo(() => {
    if (!d) return [];
    const set = new Set<string>();
    for (const l of d.levels) set.add(l.game ?? '');
    for (const w of d.withoutLevel) set.add(w.game);
    for (const x of d.extractors) for (const g of x.games) if (x.installed) set.add(g);
    for (const x of mgr?.state.extractors ?? []) for (const mg of x.status?.games ?? []) set.add(canonGame(mg.game) || canonGame(mg.label) || mg.game);
    return [...set].sort((a, b) => gameName(a).localeCompare(gameName(b)));
  }, [d, mgr]);
  const check = async (id?: string) => {
    toast(t('library.maps.checking'), 'info');
    const r = await lib.mapStatus(id).catch((e: Error) => {
      toast(e.message, 'bad', 4000);
      return null;
    });
    const bad = r?.checked.filter((c) => c.error) ?? [];
    for (const b of bad) toast(`${b.extractor}: ${b.error}`, 'bad', 6000);
    setTick((x) => x + 1);
  };
  if (!d) return <div className="lib-pane-msg">{t('library.loading')}</div>;
  const anyInstalled = d.extractors.some((x) => x.installed);
  return (
    <div className="lib-pane">
      <div className="lib-pane-head">
        <h2>{t('library.maps.title')}</h2>
        <span className="lib-hint">{t('library.maps.folder', { path: d.levelsDir })}</span>
        <span className="lib-spacer" />
        {anyInstalled && (
          <button type="button" onClick={() => void check()} data-usage="cmd:lib.checkAllMaps">
            {t('library.maps.checkAll')}
          </button>
        )}
      </div>
      {games.map((g) => {
        const levels = d.levels.filter((l) => (l.game ?? '') === g);
        const without = d.withoutLevel.filter((w) => w.game === g);
        const viaManager = managed(g);
        // The manager runs the extractors it installed; the library's own runner only stands in where there is none.
        const xs = d.extractors.filter((x) => x.games.includes(g) && !viaManager.some((v) => v.x.id === x.id));
        const { mark, hue } = gameMark(g);
        return (
          <section key={g || 'none'} className="lib-game">
            <h3>
              <span className="lib-badge" style={{ ['--hue' as string]: String(hue) }}>
                {mark}
              </span>
              {gameName(g)}
              <span className="lib-hint">{t('library.maps.count', { count: levels.filter((l) => l.kind === 'level').length })}</span>
            </h3>
            {mgr && viaManager.map(({ x, mg }) => <ManagedBox key={`${x.id}:${mg.game}`} x={x} mg={mg} route={mgr.route} onChange={() => setTick((n) => n + 1)} />)}
            {xs.map((x) => (
              <ExtractorBox key={x.id} x={x} game={g} onCheck={() => void check(x.id)} />
            ))}
            {without.length > 0 && (
              <div className="lib-without">
                <div className="lib-side-title">{t('library.maps.without', { count: without.length })}</div>
                {without.slice(0, 30).map((w) => {
                  const x = xs.find((e) => e.installed) ?? xs[0];
                  return (
                    <div key={w.map} className="lib-maprow">
                      <span className="lib-maprow-name">{w.map}</span>
                      <span className="lib-hint">{t('library.maps.uses', { count: w.uses })}</span>
                      {/* Not installed: the one Install is in the extractor's box above, each map only says what it needs. */}
                      {x?.installed ? (
                        <button type="button" className="small" onClick={() => void extract(x, g, [w.map])} data-usage="cmd:lib.extractMissing">
                          {t('library.maps.extractMissing')}
                        </button>
                      ) : x ? (
                        <span className="lib-tag">{t('library.maps.needs', { id: x.id })}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="lib-levels">
              {levels.map((l) => (
                <div key={l.id} className={`lib-level${l.missing ? ' missing' : ''}`} title={l.path}>
                  <div className="lib-level-pic">
                    {l.thumb && token ? <img src={thumbSrc(token, l.id)} alt="" loading="lazy" /> : <div className="lib-thumb-none small" style={{ ['--hue' as string]: String(hue) }}><span>{mark}</span></div>}
                  </div>
                  <div className="lib-level-meta">
                    <div className="lib-title">{l.kind === 'models' ? `${t('library.maps.pack')}: ${l.name}` : l.map ?? l.name}</div>
                    <div className="lib-sub">
                      {size(l.size)}
                      {l.extractor ? ` · ${l.extractor}` : ''}
                      {l.gameVersion ? ` · ${l.gameVersion}` : ''}
                    </div>
                    <div className="lib-sub">
                      {l.kind === 'level' && (
                        <button type="button" className="lib-link" onClick={() => useLibrary.getState().setFilter({ game: [g], map: [l.map ?? ''] })} disabled={!l.uses}>
                          {t('library.maps.uses', { count: l.uses })}
                        </button>
                      )}
                      {l.sha256 && <code title={l.sha256}> {l.sha256.slice(0, 10)}</code>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {!games.length && <div className="lib-pane-msg">{t('library.maps.none')}</div>}
    </div>
  );
}

export function LibraryDupes() {
  useLang();
  const [d, setD] = useState<Awaited<ReturnType<typeof lib.duplicates>> | null>(null);
  useEffect(() => {
    void lib.duplicates().then(setD);
  }, []);
  if (!d) return <div className="lib-pane-msg">{t('library.loading')}</div>;
  return (
    <div className="lib-pane">
      <div className="lib-pane-head">
        <h2>{t('library.dupes.title')}</h2>
        <span className="lib-hint">{t('library.dupes.summary', { count: d.groups.length, size: size(d.wastedBytes) })}</span>
      </div>
      <div className="lib-hint">{t('library.dupes.hint')}</div>
      {d.groups.map((g) => (
        <div key={g.qhash} className="lib-dupe">
          <div className="lib-sub">
            {t('library.dupes.group', { count: g.count, size: size(g.size) })} {g.confirmed ? <span className="lib-tag good">{t('library.dupes.confirmed')}</span> : <span className="lib-tag">{t('library.dupes.likely')}</span>}
          </div>
          {g.items.map((it) => (
            <button key={it.id} type="button" className="lib-link lib-rel" title={it.path} onClick={() => useLibrary.setState({ view: 'items', focus: it.id, selected: new Set([it.id]) })}>
              {it.path} <span className="lib-hint">{date(it.mtime)}</span>
            </button>
          ))}
        </div>
      ))}
      {!d.groups.length && <div className="lib-pane-msg">{t('library.dupes.none')}</div>}
    </div>
  );
}

export function LibrarySettings() {
  useLang();
  const [s, setS] = useState<Settings | null>(null);
  const [info, setInfo] = useState<{ levels: string; dataDir: string; catalogue: string; jobLimit: number } | null>(null);
  useEffect(() => {
    void lib.settings().then((r) => {
      setS(r.settings);
      setInfo(r);
    });
  }, []);
  if (!s || !info) return <div className="lib-pane-msg">{t('library.loading')}</div>;
  const save = async (next: Settings) => {
    setS(next);
    await lib.setSettings(next).catch((e: Error) => toast(e.message, 'bad'));
  };
  return (
    <div className="lib-pane lib-settings">
      <div className="lib-pane-head">
        <h2>{t('library.settings.title')}</h2>
      </div>
      <label>
        <span>{t('library.settings.output')}</span>
        <input defaultValue={s.outputDir} onBlur={(e) => e.target.value !== s.outputDir && void save({ ...s, outputDir: e.target.value })} />
        <small>{t('library.settings.outputHint')}</small>
      </label>
      <label>
        <span>{t('library.settings.libraryDir')}</span>
        <input defaultValue={s.libraryDir} onBlur={(e) => e.target.value !== s.libraryDir && void save({ ...s, libraryDir: e.target.value })} />
        <small>{t('library.settings.libraryDirHint')}</small>
      </label>
      <label>
        <span>{t('library.settings.levels')}</span>
        <input defaultValue={s.levelsDir ?? info.levels} onBlur={(e) => e.target.value !== (s.levelsDir ?? info.levels) && void save({ ...s, levelsDir: e.target.value || null })} />
      </label>
      <label>
        <span>{t('library.settings.jobs')}</span>
        <select value={s.maxJobs} onChange={(e) => void save({ ...s, maxJobs: Number(e.target.value) })}>
          <option value={0}>{t('library.settings.jobsAuto', { count: info.jobLimit })}</option>
          {[1, 2, 3, 4, 6, 8].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t('library.settings.rescan')}</span>
        <select value={s.rescanMinutes} onChange={(e) => void save({ ...s, rescanMinutes: Number(e.target.value) })}>
          {[2, 5, 10, 30, 60, 240].map((n) => (
            <option key={n} value={n}>
              {t('library.settings.minutes', { count: n })}
            </option>
          ))}
        </select>
      </label>
      <label className="lib-check">
        <input type="checkbox" checked={s.hashNetwork} onChange={(e) => void save({ ...s, hashNetwork: e.target.checked })} />
        <span className="lib-check-label">{t('library.settings.hashNetwork')}</span>
      </label>
      <div className="lib-hint">{t('library.settings.privacy')}</div>
      <div className="lib-hint">{t('library.settings.where', { path: info.catalogue })}</div>
    </div>
  );
}
