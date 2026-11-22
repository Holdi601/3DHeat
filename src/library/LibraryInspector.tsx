/**
 * The Library's right column: the focused item whole - its picture, what the
 * match was, where the file is, its rating, flag, tags and note, the files it
 * was converted into (or from), the level it is played on, copies of it, the
 * sessions saved from it, and its last conversion jobs. With several items
 * selected: what the selection is, and rating, flag and tags for all of them.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { t, useLang } from '../i18n';
import { toast } from '../ui/shell/kit';
import { lib, type ItemDetail } from './api';
import { date, formatName, gameName, kindName, length, size } from './games';
import { ConvTag, Stars, Thumb } from './LibraryGrid';
import { convertItems, installHint } from './LibraryQueue';
import { openItems } from './open';
import { refreshItems, targets, useLibrary } from './store';

export async function editTargets(e: { rating?: number; flag?: number; addTags?: string[]; removeTags?: string[]; note?: string | null }): Promise<void> {
  const ids = targets();
  if (!ids.length) return;
  await lib.edit({ ids, ...e }).catch((err: Error) => toast(err.message, 'bad'));
  refreshItems();
  window.dispatchEvent(new Event('heat3d:library-edited'));
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  if (v === null || v === undefined || v === '') return null;
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}

function TagEditor({ tags }: { tags: string[] }) {
  const [text, setText] = useState('');
  return (
    <div className="lib-tags">
      {tags.map((tg) => (
        <span key={tg} className="lib-chip">
          {tg}
          <button type="button" aria-label={t('library.tag.remove', { tag: tg })} onClick={() => void editTargets({ removeTags: [tg] })}>
            ×
          </button>
        </span>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const add = text
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          if (add.length) void editTargets({ addTags: add });
          setText('');
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('library.tag.add')} aria-label={t('library.tag.add')} />
      </form>
    </div>
  );
}

function Note({ d }: { d: ItemDetail }) {
  const [text, setText] = useState(d.note ?? '');
  useEffect(() => setText(d.note ?? ''), [d.id, d.note]);
  return (
    <textarea
      className="lib-note"
      value={text}
      placeholder={t('library.note.placeholder')}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        if (text !== (d.note ?? '')) void lib.edit({ ids: [d.id], note: text || null }).then(() => refreshItems());
      }}
    />
  );
}

function Flag({ flag }: { flag: number }) {
  return (
    <span className="lib-flags" role="group" aria-label={t('library.flag.label')}>
      <button type="button" className={flag === 1 ? 'on pick' : ''} onClick={() => void editTargets({ flag: flag === 1 ? 0 : 1 })} title={`${t('library.flag.pick')} (P)`}>
        {t('library.flag.pick')}
      </button>
      <button type="button" className={flag === -1 ? 'on reject' : ''} onClick={() => void editTargets({ flag: flag === -1 ? 0 : -1 })} title={`${t('library.flag.reject')} (X)`}>
        {t('library.flag.reject')}
      </button>
    </span>
  );
}

export function LibraryInspector() {
  useLang();
  const focus = useLibrary((s) => s.focus);
  const selected = useLibrary((s) => s.selected);
  const token = useLibrary((s) => s.status?.thumbToken);
  const [d, setD] = useState<ItemDetail | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((x) => x + 1);
    window.addEventListener('heat3d:library-edited', on);
    return () => window.removeEventListener('heat3d:library-edited', on);
  }, []);
  useEffect(() => {
    if (focus === null) {
      setD(null);
      return;
    }
    let live = true;
    lib
      .item(focus)
      .then((x) => live && setD(x))
      .catch(() => live && setD(null));
    return () => {
      live = false;
    };
  }, [focus, tick]);

  if (selected.size > 1) {
    return (
      <aside className="lib-insp" aria-label={t('library.insp.label')}>
        <h3>{t('library.insp.selected', { count: selected.size })}</h3>
        <div className="lib-insp-acts">
          <button type="button" className="primary" onClick={() => void openItems([...selected])} data-usage="cmd:lib.open">
            {t('library.act.open')}
          </button>
          <button type="button" onClick={() => void convertItems([...selected])} data-usage="cmd:lib.convert">
            {t('library.act.convert')}
          </button>
        </div>
        <div className="lib-insp-sec">
          <Stars n={0} onSet={(n) => void editTargets({ rating: n })} />
          <Flag flag={0} />
        </div>
        <div className="lib-insp-sec">
          <div className="lib-side-title">{t('library.insp.tags')}</div>
          <TagEditor tags={[]} />
        </div>
      </aside>
    );
  }
  if (!d) {
    return (
      <aside className="lib-insp empty" aria-label={t('library.insp.label')}>
        <div className="lib-hint">{t('library.insp.none')}</div>
      </aside>
    );
  }
  const extra = d.extra ?? {};
  const pilots = typeof extra.pilots === 'number' ? extra.pilots : null;
  const rows = typeof extra.rows === 'number' ? extra.rows : null;
  const models = typeof extra.models === 'number' ? extra.models : null;
  const acmi = (extra.acmi ?? {}) as Record<string, string>;
  const job = d.jobs[0];
  return (
    <aside className="lib-insp" aria-label={t('library.insp.label')}>
      <div className="lib-insp-thumb">
        <Thumb it={d} token={token} />
      </div>
      <h3 title={d.name}>{d.title || d.name}</h3>
      <div className="lib-insp-sub">
        {gameName(d.game)} · {d.kind === 'replay' || d.kind === 'match' ? formatName(d.format) : kindName(d.kind)} <ConvTag it={d} />
      </div>
      <div className="lib-insp-acts">
        {d.kind !== 'level' && d.kind !== 'models' && (
          <button type="button" className="primary" onClick={() => void openItems([d.id])} disabled={d.kind === 'replay' && d.conv !== 'current' && d.conv !== 'outdated'} data-usage="cmd:lib.open">
            {t('library.act.open')}
          </button>
        )}
        {(d.kind === 'replay' || d.source !== null) && (
          <button type="button" onClick={() => void convertItems([d.id], d.conv === 'current' || d.kind === 'match')} data-usage="cmd:lib.convert">
            {d.conv === 'none' || d.conv === null ? t('library.act.convert') : t('library.act.reconvert')}
          </button>
        )}
      </div>
      {job && job.state === 'failed' && (
        <div className="lib-error" role="alert">
          <div>{job.message}</div>
          {installHint(job.hint)}
        </div>
      )}
      {d.missing && <div className="lib-error">{t('library.insp.missing')}</div>}
      {d.error && <div className="lib-error">{t('library.insp.unreadable', { error: d.error })}</div>}
      <div className="lib-insp-sec">
        <Stars n={d.rating} onSet={(n) => void editTargets({ rating: n })} />
        <Flag flag={d.flag} />
      </div>
      <dl className="lib-dl">
        <Row k={t('library.col.map')} v={d.map} />
        <Row k={t('library.insp.mode')} v={d.mode} />
        <Row k={t('library.col.date')} v={date(d.started)} />
        <Row k={t('library.col.length')} v={length(d.duration)} />
        <Row k={t('library.col.players')} v={d.players ?? (pilots !== null ? t('library.insp.pilots', { count: pilots }) : null)} />
        <Row k={t('library.insp.teams')} v={d.teams?.join(', ')} />
        <Row k={t('library.col.outcome')} v={d.outcome ? t('library.insp.won', { side: d.outcome }) : null} />
        <Row k={t('library.insp.mission')} v={acmi.Title ?? (typeof extra.mission === 'string' ? extra.mission : null)} />
        <Row k={t('library.insp.rows')} v={rows !== null ? rows.toLocaleString() : null} />
        <Row k={t('library.insp.models')} v={models} />
        <Row k={t('library.insp.gameVersion')} v={d.gameVersion} />
        <Row k={t('library.insp.converter')} v={d.converter ? `${d.converter}${d.converterVersion ? ` ${d.converterVersion}` : ''}` : null} />
        <Row k={t('library.col.size')} v={size(d.size)} />
        <Row k={t('library.insp.fingerprint')} v={d.sha256 ? <code title={d.sha256}>{d.sha256.slice(0, 16)}…</code> : d.qhash ? <code title={t('library.insp.quickHash')}>{d.qhash.slice(0, 12)}…</code> : null} />
        <Row k={t('library.insp.file')} v={<span className="lib-path" title={d.path}>{d.path}</span>} />
      </dl>
      {d.level && (
        <div className="lib-insp-sec">
          <div className="lib-side-title">{t('library.insp.level')}</div>
          <button type="button" className="lib-link" onClick={() => useLibrary.setState({ focus: d.level!.id, selected: new Set([d.level!.id]) })}>
            {d.level.name}
          </button>
        </div>
      )}
      {d.outputs.length > 0 && (
        <div className="lib-insp-sec">
          <div className="lib-side-title">{t('library.insp.outputs')}</div>
          {d.outputs.map((o) => (
            <button key={o.id} type="button" className="lib-link lib-rel" onClick={() => useLibrary.setState({ focus: o.id, selected: new Set([o.id]) })}>
              {o.name} <ConvTag it={o} />
            </button>
          ))}
        </div>
      )}
      {d.sourceItem && (
        <div className="lib-insp-sec">
          <div className="lib-side-title">{t('library.insp.madeFrom')}</div>
          <button type="button" className="lib-link lib-rel" onClick={() => useLibrary.setState({ focus: d.sourceItem!.id, selected: new Set([d.sourceItem!.id]) })}>
            {d.sourceItem.name}
          </button>
        </div>
      )}
      {d.copies && d.copies.length > 0 && (
        <div className="lib-insp-sec">
          <div className="lib-side-title">{t('library.insp.copies', { count: d.copies.length })}</div>
          {d.copies.map((c) => (
            <button key={c.id} type="button" className="lib-link lib-rel" title={c.path} onClick={() => useLibrary.setState({ focus: c.id, selected: new Set([c.id]) })}>
              {c.path}
            </button>
          ))}
        </div>
      )}
      <div className="lib-insp-sec">
        <div className="lib-side-title">{t('library.insp.tags')}</div>
        <TagEditor tags={d.tags} />
      </div>
      {d.collections.length > 0 && (
        <div className="lib-insp-sec">
          <div className="lib-side-title">{t('library.side.collections')}</div>
          <div className="lib-tags">
            {d.collections.map((c) => (
              <span key={c.id} className="lib-chip">
                {c.name}
                <button type="button" aria-label={t('library.coll.removeFrom', { name: c.name })} onClick={() => void lib.removeFromCollection(c.id, [d.id]).then(() => setTick((x) => x + 1))}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="lib-insp-sec">
        <div className="lib-side-title">{t('library.insp.note')}</div>
        <Note d={d} />
      </div>
      {d.links.length > 0 && (
        <div className="lib-insp-sec">
          <div className="lib-side-title">{t('library.insp.links')}</div>
          {d.links.map((l) => (
            <div key={l.id} className="lib-hint">
              {t(`library.link.${l.kind}`)}: {l.label} · {date(l.created)}
            </div>
          ))}
        </div>
      )}
      {d.playerNames.length > 0 && (
        <details className="lib-insp-sec">
          <summary className="lib-side-title">{t('library.insp.playerList', { count: d.playerNames.length })}</summary>
          <div className="lib-players">
            {d.playerNames.map((p) => (
              <button key={p} type="button" className="lib-chip" onClick={() => useLibrary.getState().setFilter({ player: [p] })}>
                {p}
              </button>
            ))}
          </div>
        </details>
      )}
    </aside>
  );
}
