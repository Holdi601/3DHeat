import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import type { Dataset } from '../../state/types';
import type { Engine } from '../../render/engine';
import { int, t } from '../../i18n';
import { Section } from '../controls';
import { useEngine } from '../EngineContext';
import {
  autoBookmarks,
  parseBookmarks,
  useBookmarkStore,
  type AutoBookmark,
  type Bookmark,
} from './bookmarks';
import { clock } from './hooks';
import { personAt, unitsOf } from './units';
import { flyTo } from './replayView';
import { selectAndFollow } from './ReplayOverlay';
import { eventWords } from './EventList';
import { download } from './stats';

/** A bookmark of now: the playhead and the camera as it is, following or free. */
export function addBookmark(engine: Engine, d: Dataset, label = ''): Bookmark {
  const r = useReplayStore.getState();
  const pose = engine.cameraPose();
  const index = unitsOf(d);
  const fu =
    r.followUnit ??
    (r.follow !== null ? (index.units[index.personUnit[r.follow]]?.key ?? null) : null);
  return useBookmarkStore.getState().add({
    time: engine.live.playhead,
    label,
    camera: {
      p: [pose.position.x, pose.position.y, pose.position.z],
      f: [pose.forward.x, pose.forward.y, pose.forward.z],
    },
    follow: fu ? { unit: fu, mode: r.followMode, distance: r.followDistance } : null,
    target: r.target,
  });
}

/** Back to a bookmark: its moment, and its camera - the unit followed as it was, or the free camera where it stood. */
export function goToBookmark(engine: Engine, d: Dataset, b: Bookmark): void {
  useStore.getState().seek(b.time);
  const r = useReplayStore.getState();
  const index = unitsOf(d);
  const u = b.follow ? index.byKey.get(b.follow.unit) : undefined;
  if (b.follow && u) {
    r.patchSaved({ followMode: b.follow.mode });
    r.setFollowDistance(b.follow.distance);
    if (b.target !== null) r.setTarget(b.target);
    useReplayStore.setState({ follow: personAt(u, b.time), followUnit: u.key, selected: u.key });
    return;
  }
  r.stopFollow();
  engine.setCameraPose(
    { x: b.camera.p[0], y: b.camera.p[1], z: b.camera.p[2] },
    { x: b.camera.f[0], y: b.camera.f[1], z: b.camera.f[2] },
  );
}

/** To a moment the recording marks: a few seconds before it, behind whoever it is about. */
export function goToMark(engine: Engine, d: Dataset, m: AutoBookmark): void {
  useStore.getState().seek(Math.max(d.timeRange[0], m.time - 4));
  const p = d.personId ? d.personId[m.row] : -1;
  const index = unitsOf(d);
  const u = p >= 0 ? index.units[index.personUnit[p]] : undefined;
  if (u && m.kind !== 'bookmark' && m.kind !== 'message') {
    useReplayStore
      .getState()
      .patchSaved({
        followMode: useReplayStore.getState().followMode === 'satellite' ? 'satellite' : 'chase',
      });
    selectAndFollow(u, personAt(u, m.time - 4));
  } else flyTo(engine, d, { x: d.px[m.row], y: d.py[m.row], z: d.pz[m.row] }, 400);
}

/** Lines the recording's own marks show at most. */
const MAX_MARKS = 400;

/**
 * Bookmarks: the viewer's own (B adds one: the moment and the camera), named,
 * kept for this recording, exported and imported as a file; and the moments
 * the recording marks - kills, deaths, its own bookmarks and messages.
 */
export function BookmarkPanel() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const session = useStore((s) => s.team.session);
  const list = useBookmarkStore((s) => s.list);
  const [editing, setEditing] = useState<string | null>(null);
  const [kinds, setKinds] = useState<Set<string>>(() => new Set(['kill', 'bookmark', 'message']));
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    useBookmarkStore.getState().open(dataset);
  }, [dataset]);
  const marks = useMemo(() => (dataset ? autoBookmarks(dataset) : []), [dataset]);
  const index = useMemo(() => (dataset ? unitsOf(dataset) : null), [dataset]);
  if (!dataset || !index || !dataset.time) return null;
  const start =
    session >= 0 && dataset.sessionStart ? dataset.sessionStart[session] : dataset.timeRange[0];
  const inSession = (row: number) =>
    session < 0 || !dataset.sessionId || dataset.sessionId[row] === session;
  const shown = marks.filter((m) => kinds.has(m.kind) && inSession(m.row));
  const counts = new Map<string, number>();
  for (const m of marks) if (inSession(m.row)) counts.set(m.kind, (counts.get(m.kind) ?? 0) + 1);
  const who = (m: AutoBookmark) => {
    const p = dataset.personId ? dataset.personId[m.row] : -1;
    return p >= 0 ? (index.units[index.personUnit[p]]?.name ?? '') : '';
  };
  const store = useBookmarkStore.getState();

  return (
    <Section
      title={t('replay.bookmarks.title')}
      right={<span className="count">{list.length ? int(list.length) : ''}</span>}
    >
      <div className="row-buttons">
        <button
          onClick={() => engine && setEditing(addBookmark(engine, dataset).id)}
          title={t('replay.bookmarks.addTitle')}
        >
          {t('replay.bookmarks.add')}
        </button>
        <button
          className="small"
          disabled={!list.length}
          onClick={() =>
            download(
              `${dataset.name.replace(/[^\w.-]+/g, '_')}.bookmarks.json`,
              JSON.stringify(list, null, 2),
              'application/json',
            )
          }
        >
          {t('replay.bookmarks.export')}
        </button>
        <button className="small" onClick={() => file.current?.click()}>
          {t('replay.bookmarks.import')}
        </button>
        <input
          ref={file}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) store.merge(parseBookmarks(await f.text()));
          }}
        />
      </div>
      {list.length === 0 && <div className="hint">{t('replay.bookmarks.none')}</div>}
      <div className="replay-events bookmark-list">
        {list.map((b) => (
          <div key={b.id} className="bm-row">
            <button
              className="bm-go"
              onClick={() => engine && goToBookmark(engine, dataset, b)}
              title={t('replay.bookmarks.goTitle')}
            >
              <span>{clock(b.time - start)}</span>
              {editing === b.id ? null : (
                <span>
                  {b.label ||
                    (b.follow
                      ? (index.byKey.get(b.follow.unit)?.name ?? '')
                      : t('replay.bookmarks.freeCamera'))}
                </span>
              )}
            </button>
            {editing === b.id ? (
              <input
                autoFocus
                className="bm-name"
                defaultValue={b.label}
                placeholder={t('replay.bookmarks.namePlaceholder')}
                onBlur={(e) => {
                  store.rename(b.id, e.target.value.trim());
                  setEditing(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape')
                    (e.target as HTMLInputElement).blur();
                  e.stopPropagation();
                }}
              />
            ) : (
              <button
                className="small link"
                onClick={() => setEditing(b.id)}
                title={t('replay.bookmarks.rename')}
              >
                ✎
              </button>
            )}
            <button
              className="small link"
              onClick={() => store.remove(b.id)}
              title={t('replay.bookmarks.remove')}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {marks.length > 0 && (
        <>
          <div className="hint">{t('replay.bookmarks.marksHint')}</div>
          <div className="chips">
            {(['kill', 'death', 'bookmark', 'message'] as const)
              .filter((k) => counts.get(k))
              .map((k) => (
                <button
                  key={k}
                  className={`chip${kinds.has(k) ? ' on' : ''}`}
                  onClick={() => {
                    const next = new Set(kinds);
                    if (next.has(k)) next.delete(k);
                    else next.add(k);
                    setKinds(next);
                  }}
                >
                  {t(`replay.bookmarks.kind.${k}`)}{' '}
                  <span className="dim">{int(counts.get(k) ?? 0)}</span>
                </button>
              ))}
          </div>
          <div className="replay-events">
            {shown.slice(0, MAX_MARKS).map((m) => (
              <button
                key={m.row}
                onClick={() => engine && goToMark(engine, dataset, m)}
                title={t('replay.bookmarks.markTitle')}
              >
                <span>{clock(m.time - start)}</span>
                <span>
                  <b>{eventWords(m.label)}</b> {who(m) ? ` · ${who(m)}` : ''}
                </span>
              </button>
            ))}
            {shown.length > MAX_MARKS && (
              <div className="hint">
                {t('replay.events.more', { count: shown.length - MAX_MARKS })}
              </div>
            )}
          </div>
        </>
      )}
    </Section>
  );
}
