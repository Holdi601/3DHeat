import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../../i18n';
import { formatBytes } from '../../data/memory';
import {
  ask,
  findManager,
  INDEX,
  isState,
  offeredUpdates,
  onlyQuery,
  releasesUrl,
  statusOf,
  type Item,
  type MapGame,
  type Route,
  type State,
} from '../../extractors/manager';
import { Section } from '../controls';

/**
 * The extractors (docs/extractors.md): separate programs that turn a game's
 * replays and levels from the user's own install into what the viewer reads.
 *
 * With the native app or `3dheat serve` behind the page (its owner only),
 * the manager installs, updates, removes, checks and starts them in their
 * own folder, and runs their map status and extracts; the panel only asks
 * it. An update is installed only after the user saw its version and notes
 * and chose "Update now" (or turned on "Update automatically"). Anywhere else
 * (a plain web build, a session's member) the panel says where each one is
 * downloaded by hand.
 */
export function ExtractorsPanel() {
  return (
    <Section title={t('extractors.title')}>
      <ExtractorsBody />
    </Section>
  );
}

type Act = (path: string, json?: unknown) => Promise<void>;

function ExtractorsBody() {
  const [route, setRoute] = useState<Route | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [looked, setLooked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState<Item[] | null>(null);
  const [autoWant, setAutoWant] = useState<boolean | null>(null);
  const checked = useRef(new Set<string>());
  const statusAsked = useRef(new Set<string>());

  useEffect(() => {
    let live = true;
    void findManager().then((m) => {
      if (!live) return;
      setLooked(true);
      if (!m) return;
      setRoute(m.route);
      setState(m.state);
      // The latest releases (cached by the manager for a few hours).
      void ask(m.route, 'POST', '/refresh').then((s) => live && isState(s) && setState(s), () => {});
    });
    return () => {
      live = false;
    };
  }, []);

  const reload = useCallback(async () => {
    if (!route) return;
    const s = await ask(route, 'GET', '').catch(() => null);
    if (isState(s)) setState(s);
  }, [route]);

  // While something installs, runs or extracts, follow it.
  const active = !!state?.extractors.some((x) => x.running || x.extract?.running || (x.job && x.job.phase !== 'failed'));
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => void reload(), 700);
    return () => clearInterval(id);
  }, [active, reload]);

  // Each installed extractor's requirements and map status, once per opening (the manager keeps the status).
  useEffect(() => {
    if (!route || !state) return;
    for (const x of state.extractors) {
      const installing = !!x.job && x.job.phase !== 'failed';
      if (installing) statusAsked.current.delete(x.id); // a new version: its status is taken again once installed
      if (!x.installed || installing) continue;
      if (!x.check && !checked.current.has(x.id)) {
        checked.current.add(x.id);
        void ask(route, 'POST', `/check/${x.id}`).then(() => reload(), () => {});
      }
      if (!x.status && !x.extract?.running && !statusAsked.current.has(x.id)) {
        statusAsked.current.add(x.id);
        void ask(route, 'POST', `/status/${x.id}`).then(() => reload(), () => {});
      }
    }
  }, [route, state, reload]);

  const act: Act = async (path, json) => {
    if (!route) return;
    setError(null);
    try {
      const s = await ask(route, 'POST', path, json);
      if (isState(s)) setState(s);
      else await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!looked) return <div className="hint">{t('extractors.looking')}</div>;
  if (!route || !state) return <GetThem />;

  const updates = offeredUpdates(state.extractors);
  return (
    <div className="extractors">
      <div className="hint">{t('extractors.intro')}</div>
      <div className="hint mono" title={state.data}>
        {t('extractors.levels', { dir: state.levels })}
        {state.free != null && <> · {t('extractors.free', { size: formatBytes(state.free) })}</>}
      </div>
      <div className="row wrap" style={{ margin: '6px 0' }}>
        <button disabled={!updates.length} onClick={() => setAsking(updates)}>
          {t('extractors.updateAll')}
        </button>
        <button
          onClick={() => {
            // A fresh look: the manager forgets the map status too, and the panel asks again.
            statusAsked.current.clear();
            void act('/refresh?fresh=1');
          }}
        >
          {t('extractors.refresh')}
        </button>
      </div>
      <label className="row" title={t('extractors.autoUpdateTitle')}>
        <input
          type="checkbox"
          checked={autoWant ?? state.settings?.autoUpdate ?? false}
          onChange={(e) => {
            // Shown at once; the manager's answer replaces it.
            setAutoWant(e.target.checked);
            void act(`/settings?autoUpdate=${e.target.checked ? 1 : 0}`).finally(() => setAutoWant(null));
          }}
        />
        {t('extractors.autoUpdate')}
      </label>
      {error && <div className="err">{error}</div>}
      {state.extractors.map((x) => (
        <Extractor key={x.id} x={x} act={act} ask={() => setAsking([x])} />
      ))}
      {asking && <UpdateAsk items={asking} act={act} close={() => setAsking(null)} />}
    </div>
  );
}

/** Update now / Later / Skip this version, with the versions and their release notes. */
function UpdateAsk({ items, act, close }: { items: Item[]; act: Act; close: () => void }) {
  const one = items.length === 1;
  return (
    <div
      className="extractors-ask"
      role="dialog"
      aria-modal="true"
      aria-label={t('extractors.ask.title')}
      onKeyDown={(e) => e.key === 'Escape' && close()}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)', borderRadius: 8, padding: 16, width: 'min(560px, 92vw)', maxHeight: '80vh', overflow: 'auto' }}>
        <strong>{t('extractors.ask.title')}</strong>
        {items.map((x) => (
          <div key={x.id} data-ask={x.id} style={{ marginTop: 10 }}>
            <div>
              {t('extractors.ask.version', { name: x.name, installed: x.installed ?? '–', latest: x.latest ?? '–' })}
              {x.published && <span className="hint"> · {x.published.slice(0, 10)}</span>}
            </div>
            <div className="hint" style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', marginTop: 4, padding: 6, border: '1px solid var(--line)' }}>
              {x.notes?.trim() || t('extractors.ask.noNotes')}
            </div>
          </div>
        ))}
        <div className="row wrap" style={{ marginTop: 12 }}>
          <button
            className="primary"
            autoFocus
            onClick={() => {
              close();
              void (one ? act(`/install/${items[0].id}?version=${encodeURIComponent(items[0].latest ?? '')}`) : act(`/update-all${onlyQuery(items)}`));
            }}
          >
            {t('extractors.ask.now')}
          </button>
          <button onClick={close}>{t('extractors.ask.later')}</button>
          <button
            onClick={() => {
              close();
              void (async () => {
                for (const x of items) await act(`/skip/${x.id}?version=${encodeURIComponent(x.latest ?? '')}`);
              })();
            }}
          >
            {one ? t('extractors.ask.skip') : t('extractors.ask.skipAll')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Extractor({ x, act, ask: askUpdate }: { x: Item; act: Act; ask: () => void }) {
  const status = statusOf(x);
  const job = x.job;
  const busy = status === 'busy' || status === 'extracting';
  return (
    <div className="extractor" data-extractor={x.id} data-status={status} style={{ borderTop: '1px solid var(--line)', padding: '6px 0' }}>
      <div className="row between">
        <strong>{x.name}</strong>
        <span className="hint">{t(`extractors.status.${status}`)}</span>
      </div>
      <div className="hint">
        {x.games.join(', ')} · {x.what}
      </div>
      <div className="hint mono">
        {t('extractors.versions', { installed: x.installed ?? '–', latest: x.latest ?? '–' })}
        {x.skipped && <> · {t('extractors.skipped')}</>}
        {x.latestError && !x.latest && <> · {x.latestError}</>}
      </div>
      {status === 'busy' && job && (
        <>
          <div className="hint">
            {t(`extractors.phase.${job.phase}`)}
            {job.phase === 'download' && job.total > 0 && ` ${formatBytes(job.done)} / ${formatBytes(job.total)}`}
          </div>
          <div className="bar">
            <div style={{ width: job.total > 0 ? `${Math.min(100, (100 * job.done) / job.total)}%` : '100%', opacity: job.total > 0 ? 1 : 0.5 }} />
          </div>
        </>
      )}
      {job?.phase === 'failed' && <div className="err">{job.error}</div>}
      {x.check?.error && <div className="err">{x.check.error}</div>}
      {x.check && x.check.checks.length > 0 && (
        <ul className="hint" style={{ margin: '2px 0', paddingLeft: 16 }}>
          {x.check.checks.map((c) => (
            <li key={c.id} style={{ color: c.ok ? undefined : 'var(--warm)' }}>
              {c.ok ? '✓' : '✗'} {c.label}
              {c.detail && ` — ${c.detail}`}
            </li>
          ))}
        </ul>
      )}
      {x.installed && <Maps x={x} act={act} busy={busy} />}
      {x.supported ? (
        <div className="row wrap">
          {!x.installed && (
            <button className="primary" disabled={busy} onClick={() => void act(`/install/${x.id}`)}>
              {t('extractors.install')}
            </button>
          )}
          {status === 'update' && (
            <button className="primary" onClick={askUpdate}>
              {t('extractors.update')}
            </button>
          )}
          {x.skipped && (
            <button onClick={() => void act(`/unskip/${x.id}`)} title={t('extractors.unskipTitle')}>
              {t('extractors.unskip')}
            </button>
          )}
          {x.installed && (
            <>
              <button disabled={busy || x.running} onClick={() => void act(`/run/${x.id}`)}>
                {t('extractors.run')}
              </button>
              <button disabled={busy} onClick={() => void act(`/check/${x.id}`)}>
                {t('extractors.check')}
              </button>
              <button disabled={busy || x.running} onClick={() => void act(`/remove/${x.id}`)}>
                {t('extractors.remove')}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="hint">
          <a href={releasesUrl(x.repo)} target="_blank" rel="noreferrer">
            {t('extractors.releases')}
          </a>
        </div>
      )}
    </div>
  );
}

/** What the extractor finds in the install against what it extracted, and extracting it. */
function Maps({ x, act, busy }: { x: Item; act: Act; busy: boolean }) {
  const [picking, setPicking] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const ex = x.extract;
  const games = (x.status?.games ?? []).filter((g) => g.maps.length > 0 || g.counts.new + g.counts.changed + g.counts.outdated > 0);
  const last = ex?.maps[ex.maps.length - 1];
  return (
    <div className="extractor-maps">
      {x.status?.error && <div className="err">{x.status.error}</div>}
      {ex?.running && (
        <>
          <div className="hint" data-extract-progress>
            {t('extractors.maps.progress', { done: ex.ok + ex.failed, total: ex.total })}
            {last && ` · ${last.id} ${last.state === 'ok' ? '✓' : '✗'}`}
          </div>
          <div className="bar">
            <div style={{ width: ex.total > 0 ? `${Math.min(100, (100 * (ex.ok + ex.failed)) / ex.total)}%` : '100%', opacity: ex.total > 0 ? 1 : 0.5 }} />
          </div>
          <button onClick={() => void act(`/cancel/${x.id}`)}>{t('extractors.maps.stop')}</button>
        </>
      )}
      {ex && !ex.running && (ex.ok > 0 || ex.failed > 0 || ex.error) && (
        <div className="hint" data-extract-done>
          {t('extractors.maps.done', { ok: ex.ok, failed: ex.failed })}
          {ex.error && ` · ${ex.error}`}
          {ex.maps
            .filter((m) => m.state === 'failed')
            .map((m) => (
              <div key={m.index} style={{ color: 'var(--warm)' }}>
                ✗ {m.id}
                {m.detail && ` — ${m.detail}`}
              </div>
            ))}
        </div>
      )}
      {games.map((g) => (
        <MapGameRow
          key={g.game}
          x={x}
          g={g}
          busy={busy || x.running}
          act={act}
          picking={picking === g.game}
          setPicking={(on) => {
            setPicking(on ? g.game : null);
            setPicked(new Set());
          }}
          picked={picked}
          setPicked={setPicked}
        />
      ))}
    </div>
  );
}

function MapGameRow({
  x,
  g,
  busy,
  act,
  picking,
  setPicking,
  picked,
  setPicked,
}: {
  x: Item;
  g: MapGame;
  busy: boolean;
  act: Act;
  picking: boolean;
  setPicking: (on: boolean) => void;
  picked: Set<string>;
  setPicked: (s: Set<string>) => void;
}) {
  const c = g.counts;
  const redo = c.changed + c.outdated;
  return (
    <div data-game={g.game} style={{ margin: '4px 0' }}>
      <div className="hint" data-map-counts>
        {g.label}: {t('extractors.maps.new', { n: c.new })}
        {c.changed > 0 && ` · ${t('extractors.maps.changed', { n: c.changed })}`}
        {c.outdated > 0 && ` · ${t('extractors.maps.outdated', { n: c.outdated })}`}
        {c.missing > 0 && ` · ${t('extractors.maps.missing', { n: c.missing })}`}
        {!g.found && ` · ${t('extractors.maps.notFound')}`}
      </div>
      <div className="row wrap">
        <button className="primary" disabled={busy || !c.new} onClick={() => void act(`/extract/${x.id}`, { game: g.game, new: true })}>
          {t('extractors.maps.extract')}
        </button>
        {redo > 0 && (
          <button disabled={busy} onClick={() => void act(`/extract/${x.id}`, { game: g.game, changed: true, outdated: true })}>
            {t('extractors.maps.redo')}
          </button>
        )}
        {g.maps.length > 0 && <button onClick={() => setPicking(!picking)}>{t('extractors.maps.choose')}</button>}
      </div>
      {picking && (
        <div style={{ maxHeight: 220, overflow: 'auto', margin: '4px 0' }}>
          {g.maps
            .filter((m) => m.state !== 'missing')
            .map((m) => (
              <label key={m.id} className="row hint" data-map={m.id}>
                <input
                  type="checkbox"
                  checked={picked.has(m.id)}
                  onChange={(e) => {
                    const n = new Set(picked);
                    if (e.target.checked) n.add(m.id);
                    else n.delete(m.id);
                    setPicked(n);
                  }}
                />
                {m.title} · {t(`extractors.mapState.${m.state}`)}
              </label>
            ))}
          <button
            disabled={busy || !picked.size}
            onClick={() => {
              void act(`/extract/${x.id}`, { game: g.game, maps: [...picked] });
              setPicking(false);
            }}
          >
            {t('extractors.maps.extractPicked', { n: picked.size })}
          </button>
        </div>
      )}
    </div>
  );
}

/** Without a manager: where each one is downloaded, to run on one's own machine. */
function GetThem() {
  return (
    <div className="extractors">
      <div className="hint">{t('extractors.get.intro')}</div>
      <ul className="hint" style={{ margin: '4px 0', paddingLeft: 16 }}>
        {INDEX.map((x) => (
          <li key={x.id}>
            <a href={releasesUrl(x.repo)} target="_blank" rel="noreferrer">
              {x.name}
            </a>{' '}
            — {x.what}
          </li>
        ))}
      </ul>
      <div className="hint">{t('extractors.get.note')}</div>
    </div>
  );
}
