import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../../i18n';
import { formatBytes } from '../../data/memory';
import { ask, findManager, INDEX, isState, releasesUrl, statusOf, type Item, type Route, type State } from '../../extractors/manager';
import { Section } from '../controls';

/**
 * The extractors (docs/extractors.md): separate programs that turn a game's
 * replays and levels from the user's own install into what the viewer reads.
 *
 * With the native app or `3dheat serve` behind the page (its owner only),
 * the manager installs, updates, removes, checks and starts them in their
 * own folder; the panel only asks it. Anywhere else (a plain web build, a
 * session's member) it says where each one is downloaded by hand.
 */
export function ExtractorsPanel() {
  return (
    <Section title={t('extractors.title')}>
      <ExtractorsBody />
    </Section>
  );
}

function ExtractorsBody() {
  const [route, setRoute] = useState<Route | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [looked, setLooked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checked = useRef(new Set<string>());

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

  // While something installs or runs, follow it.
  const active = !!state?.extractors.some((x) => x.running || (x.job && x.job.phase !== 'failed'));
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => void reload(), 700);
    return () => clearInterval(id);
  }, [active, reload]);

  // Each installed extractor's requirements, once per opening.
  useEffect(() => {
    if (!route || !state) return;
    for (const x of state.extractors) {
      if (!x.installed || x.check || checked.current.has(x.id)) continue;
      checked.current.add(x.id);
      void ask(route, 'POST', `/check/${x.id}`).then(() => reload(), () => {});
    }
  }, [route, state, reload]);

  const act = async (path: string) => {
    if (!route) return;
    setError(null);
    try {
      const s = await ask(route, 'POST', path);
      if (isState(s)) setState(s);
      else await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!looked) return <div className="hint">{t('extractors.looking')}</div>;
  if (!route || !state) return <GetThem />;

  const updates = state.extractors.filter((x) => statusOf(x) === 'update').length;
  return (
    <div className="extractors">
      <div className="hint">{t('extractors.intro')}</div>
      <div className="hint mono" title={state.data}>
        {t('extractors.levels', { dir: state.levels })}
        {state.free != null && <> · {t('extractors.free', { size: formatBytes(state.free) })}</>}
      </div>
      <div className="row wrap" style={{ margin: '6px 0' }}>
        <button disabled={!updates} onClick={() => void act('/update-all')}>
          {t('extractors.updateAll')}
        </button>
        <button onClick={() => void act('/refresh?fresh=1')}>{t('extractors.refresh')}</button>
      </div>
      {error && <div className="err">{error}</div>}
      {state.extractors.map((x) => (
        <Extractor key={x.id} x={x} act={act} />
      ))}
    </div>
  );
}

function Extractor({ x, act }: { x: Item; act: (path: string) => Promise<void> }) {
  const status = statusOf(x);
  const job = x.job;
  const busy = status === 'busy';
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
        {x.latestError && !x.latest && <> · {x.latestError}</>}
      </div>
      {busy && job && (
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
      {x.supported ? (
        <div className="row wrap">
          {!x.installed && (
            <button className="primary" disabled={busy} onClick={() => void act(`/install/${x.id}`)}>
              {t('extractors.install')}
            </button>
          )}
          {status === 'update' && (
            <button className="primary" onClick={() => void act(`/install/${x.id}`)}>
              {t('extractors.update')}
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
