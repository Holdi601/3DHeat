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
import { extractorIcon, hideBroken } from '../../extractors/icon';
import { Section } from '../controls';
import { Dialog } from '../shell/kit';
import './extractors.css';

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
  const none = !state.extractors.some((x) => x.installed);
  return (
    <div className="extractors">
      <div className="hint">{t('extractors.intro')}</div>
      <div className="ext-where hint" title={state.data}>
        <span className="mono">{t('extractors.levels', { dir: state.levels })}</span>
        {state.free != null && <span>{t('extractors.free', { size: formatBytes(state.free) })}</span>}
      </div>
      {none && (
        <ol className="ext-steps" aria-label={t('extractors.start.title')}>
          <li>{t('extractors.start.step1')}</li>
          <li>{t('extractors.start.step2')}</li>
          <li>{t('extractors.start.step3')}</li>
        </ol>
      )}
      <div className="ext-toolbar">
        {updates.length > 0 && (
          <button className="primary" onClick={() => setAsking(updates)}>
            {t('extractors.updateAll')} <span className="ext-count">{updates.length}</span>
          </button>
        )}
        <button
          onClick={() => {
            // A fresh look: the manager forgets the map status too, and the panel asks again.
            statusAsked.current.clear();
            void act('/refresh?fresh=1');
          }}
        >
          {t('extractors.refresh')}
        </button>
        <label className="ext-auto" title={t('extractors.autoUpdateTitle')}>
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
      </div>
      {error && <Problem text={error} todo={t('extractors.fix.manager')} fix={t('extractors.fix.retry')} onFix={() => void reload().then(() => setError(null))} />}
      {state.extractors.map((x) => (
        <Extractor key={x.id} x={x} act={act} ask={() => setAsking([x])} />
      ))}
      {asking && <UpdateAsk items={asking} act={act} close={() => setAsking(null)} />}
    </div>
  );
}

/** Something that went wrong, said plainly, with what to do and the button that does it. */
function Problem({ text, todo, fix, onFix, disabled }: { text: string; todo: string; fix?: string; onFix?: () => void; disabled?: boolean }) {
  return (
    <div className="ext-problem" role="alert">
      <div className="ext-problem-text">{text}</div>
      <div className="ext-problem-todo">{todo}</div>
      {fix && onFix && (
        <button className="small" disabled={disabled} onClick={onFix}>
          {fix}
        </button>
      )}
    </div>
  );
}

/** Update now / Later / Skip this version, with the versions and their release notes. */
function UpdateAsk({ items, act, close }: { items: Item[]; act: Act; close: () => void }) {
  const one = items.length === 1;
  return (
    <Dialog title={t('extractors.ask.title')} onClose={close} className="extractors-ask">
      {items.map((x) => (
        <div key={x.id} data-ask={x.id} className="ext-ask-item">
          <div>
            <strong>{t('extractors.ask.version', { name: x.name, installed: x.installed ?? '–', latest: x.latest ?? '–' })}</strong>
            {x.published && <span className="hint"> · {x.published.slice(0, 10)}</span>}
          </div>
          <div className="ext-notes">{x.notes?.trim() || t('extractors.ask.noNotes')}</div>
        </div>
      ))}
      <div className="dialog-actions">
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
        <button onClick={close}>{t('extractors.ask.later')}</button>
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
      </div>
    </Dialog>
  );
}

/** The colour of each state's badge and card edge. */
const TONE: Record<string, string> = { unsupported: 'muted', missing: 'muted', installed: 'good', update: 'accent', running: 'accent', busy: 'accent', extracting: 'accent', error: 'bad' };
/** The install's steps in order, for "Step n of 5". */
const PHASES = ['lookup', 'download', 'verify', 'unpack', 'check'];

function Extractor({ x, act, ask: askUpdate }: { x: Item; act: Act; ask: () => void }) {
  const status = statusOf(x);
  const job = x.job;
  const busy = status === 'busy' || status === 'extracting';
  const failed = job?.phase === 'failed';
  const badChecks = x.check?.checks.filter((c) => !c.ok) ?? [];
  const tone = TONE[status] ?? 'muted';
  return (
    <article className={`ext-card ${tone}`} data-extractor={x.id} data-status={status}>
      <header className="ext-card-head">
        <img className="ext-icon" src={extractorIcon(x.id)} alt="" width={32} height={32} onError={hideBroken} />
        <div className="ext-card-name">
          <strong>{x.name}</strong>
          <span className="hint">{x.games.join(', ')}</span>
        </div>
        <span className={`ext-badge ${tone}`}>
          <span className="dot" aria-hidden="true" />
          {t(`extractors.status.${status}`)}
        </span>
      </header>
      <div className="hint">{x.what}</div>
      <div className="hint mono ext-ver">
        {x.installed
          ? t('extractors.versions', { installed: x.installed, latest: x.latest ?? '–' })
          : x.latest
            ? x.latestSize && x.supported
              ? t('extractors.latestSize', { latest: x.latest, size: formatBytes(x.latestSize) })
              : t('extractors.latestOnly', { latest: x.latest })
            : !x.latestError && t('extractors.versions', { installed: '–', latest: '–' })}
        {x.skipped && <> · {t('extractors.skipped')}</>}
        {x.latestError && !x.latest && <>{x.installed ? ' · ' : ''}{x.latestError}</>}
      </div>
      {status === 'busy' && job && (
        <div className="ext-progress" role="status">
          <div className="hint">
            <span className="ext-step">{t('extractors.phase.step', { n: Math.max(1, PHASES.indexOf(job.phase) + 1), total: PHASES.length })}</span>
            {t(`extractors.phase.${job.phase}`)}
            {job.phase === 'download' && job.total > 0 && ` ${formatBytes(job.done)} / ${formatBytes(job.total)}`}
          </div>
          <div className="bar">
            <div style={{ width: job.total > 0 ? `${Math.min(100, (100 * job.done) / job.total)}%` : '100%', opacity: job.total > 0 ? 1 : 0.5 }} />
          </div>
        </div>
      )}
      {failed && (
        <Problem
          text={job?.error || t('extractors.phase.failed')}
          todo={t('extractors.fix.install')}
          fix={t('extractors.fix.retry')}
          onFix={() => void act(`/install/${x.id}${x.installed && x.latest ? `?version=${encodeURIComponent(x.latest)}` : ''}`)}
        />
      )}
      {x.check?.error && <Problem text={x.check.error} todo={t('extractors.fix.check')} fix={t('extractors.fix.checkAgain')} disabled={busy} onFix={() => void act(`/check/${x.id}`)} />}
      {x.check && x.check.checks.length > 0 && (
        <ul className="ext-checks">
          {x.check.checks.map((c) => (
            <li key={c.id} className={c.ok ? 'ok' : 'bad'}>
              {c.ok ? '✓' : '✗'} {c.label}
              {c.detail && <span className="hint"> — {c.detail}</span>}
            </li>
          ))}
        </ul>
      )}
      {badChecks.length > 0 && !x.check?.error && (
        <div className="ext-todo">
          <span className="hint">{t('extractors.fix.checks')}</span>
          <button className="small" disabled={busy} onClick={() => void act(`/check/${x.id}`)}>
            {t('extractors.fix.checkAgain')}
          </button>
        </div>
      )}
      {x.installed && <Maps x={x} act={act} busy={busy} />}
      {x.supported ? (
        <div className="ext-actions">
          {!x.installed && !busy && !failed && x.latest && (
            <button className="primary" onClick={() => void act(`/install/${x.id}`)}>
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
            <span className="ext-more">
              <button className="ghost small" disabled={busy || x.running} onClick={() => void act(`/run/${x.id}`)} title={t('extractors.runTitle')}>
                {t('extractors.run')}
              </button>
              <button className="ghost small" disabled={busy} onClick={() => void act(`/check/${x.id}`)} title={t('extractors.checkTitle')}>
                {t('extractors.check')}
              </button>
              <button className="ghost small danger" disabled={busy || x.running} onClick={() => void act(`/remove/${x.id}`)}>
                {t('extractors.remove')}
              </button>
            </span>
          )}
        </div>
      ) : (
        <div className="hint">
          <a href={releasesUrl(x.repo)} target="_blank" rel="noreferrer">
            {t('extractors.releases')}
          </a>
        </div>
      )}
    </article>
  );
}

/** What the extractor finds in the install against what it extracted, and extracting it. */
function Maps({ x, act, busy }: { x: Item; act: Act; busy: boolean }) {
  const [picking, setPicking] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const ex = x.extract;
  const games = (x.status?.games ?? []).filter((g) => g.maps.length > 0 || g.counts.new + g.counts.changed + g.counts.outdated > 0);
  const last = ex?.maps[ex.maps.length - 1];
  const failedMaps = ex && !ex.running ? ex.maps.filter((m) => m.state === 'failed') : [];
  // Extracting the failed ones again needs their game: plain when the extractor has one.
  const oneGame = x.status?.games.length === 1 ? x.status.games[0].game : null;
  return (
    <div className="extractor-maps">
      {x.status?.error && (
        <Problem text={x.status.error} todo={t('extractors.fix.status')} fix={t('extractors.fix.lookAgain')} disabled={busy || x.running} onFix={() => void act(`/status/${x.id}?fresh=1`)} />
      )}
      {ex?.running && (
        <div className="ext-progress" role="status">
          <div className="ext-progress-row">
            <span className="hint" data-extract-progress>
              {t('extractors.maps.progress', { done: ex.ok + ex.failed, total: ex.total })}
              {last && ` · ${last.id} ${last.state === 'ok' ? '✓' : '✗'}`}
            </span>
            <button className="small" onClick={() => void act(`/cancel/${x.id}`)}>
              {t('extractors.maps.stop')}
            </button>
          </div>
          <div className="bar">
            <div style={{ width: ex.total > 0 ? `${Math.min(100, (100 * (ex.ok + ex.failed)) / ex.total)}%` : '100%', opacity: ex.total > 0 ? 1 : 0.5 }} />
          </div>
        </div>
      )}
      {ex && !ex.running && (ex.ok > 0 || ex.failed > 0 || ex.error) && (
        <div className="hint" data-extract-done>
          {t('extractors.maps.done', { ok: ex.ok, failed: ex.failed })}
          {ex.error && ` · ${ex.error}`}
        </div>
      )}
      {failedMaps.length > 0 && (
        <div className="ext-problem" role="alert">
          {failedMaps.map((m) => (
            <div key={m.index} className="ext-problem-text">
              ✗ {m.id}
              {m.detail && ` — ${m.detail}`}
            </div>
          ))}
          <div className="ext-problem-todo">{t('extractors.fix.mapsFailed')}</div>
          {oneGame && (
            <button className="small" disabled={busy || x.running} onClick={() => void act(`/extract/${x.id}`, { game: oneGame, maps: failedMaps.map((m) => m.id) })}>
              {t('extractors.fix.extractAgain')}
            </button>
          )}
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
    <div className="ext-game" data-game={g.game}>
      <div className="ext-game-head">
        <strong>{g.label}</strong>
        {!g.found && <span className="ext-chip bad">{t('extractors.maps.notFound')}</span>}
      </div>
      <div className="ext-chips" data-map-counts>
        <span className={`ext-chip${c.new ? ' accent' : ''}`}>{t('extractors.maps.new', { n: c.new })}</span>
        {c.changed > 0 && <span className="ext-chip warn">{t('extractors.maps.changed', { n: c.changed })}</span>}
        {c.outdated > 0 && <span className="ext-chip warn">{t('extractors.maps.outdated', { n: c.outdated })}</span>}
        {c.current > 0 && <span className="ext-chip good">{t('extractors.maps.current', { n: c.current })}</span>}
        {c.missing > 0 && <span className="ext-chip">{t('extractors.maps.missing', { n: c.missing })}</span>}
      </div>
      <div className="ext-actions">
        {c.new > 0 && (
          <button className="primary" disabled={busy} onClick={() => void act(`/extract/${x.id}`, { game: g.game, new: true })}>
            {t('extractors.maps.extractNew', { n: c.new })}
          </button>
        )}
        {redo > 0 && (
          <button className={c.new ? undefined : 'primary'} disabled={busy} onClick={() => void act(`/extract/${x.id}`, { game: g.game, changed: true, outdated: true })}>
            {t('extractors.maps.redo')}
          </button>
        )}
        {g.maps.length > 0 && (
          <button className="ghost small" aria-expanded={picking} onClick={() => setPicking(!picking)}>
            {t('extractors.maps.choose')}
          </button>
        )}
      </div>
      {picking && (
        <div className="ext-pick">
          {g.maps
            .filter((m) => m.state !== 'missing')
            .map((m) => (
              <label key={m.id} className="ext-pick-row" data-map={m.id}>
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
                <span className="ext-pick-name">{m.title}</span>
                <span className={`ext-chip ${m.state === 'new' ? 'accent' : m.state === 'current' ? 'good' : 'warn'}`}>{t(`extractors.mapState.${m.state}`)}</span>
              </label>
            ))}
          <button
            className="primary"
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
      <ul className="ext-get">
        {INDEX.map((x) => (
          <li key={x.id}>
            <a href={releasesUrl(x.repo)} target="_blank" rel="noreferrer">
              {x.name}
            </a>
            <span className="hint">{x.what}</span>
          </li>
        ))}
      </ul>
      <div className="hint">{t('extractors.get.note')}</div>
    </div>
  );
}
