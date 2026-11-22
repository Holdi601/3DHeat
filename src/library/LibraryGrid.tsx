/**
 * The Library's items: a grid of thumbnails or a list, drawn only where the
 * view is (100,000 items scroll as smoothly as 100), each page of 200 loaded
 * when it comes into sight. Click selects, Ctrl+click adds, Shift+click
 * selects a run; a double click opens in 3DHeat.
 */

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactElement, type RefObject } from 'react';
import { t, useLang } from '../i18n';
import { thumbSrc, type Item } from './api';
import { date, formatName, gameMark, gameName, kindName, length, size } from './games';
import { openItems } from './open';
import { itemAt, loadPage, PAGE, useLibrary } from './store';

const GAP = 12;
const LIST_ROW = 34;

/** Selects on click as a photo library does. */
export function pick(e: MouseEvent | { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }, index: number, id: number): void {
  const s = useLibrary.getState();
  if (e.shiftKey && s.anchor !== null) {
    const [a, b] = s.anchor < index ? [s.anchor, index] : [index, s.anchor];
    const next = new Set(e.ctrlKey || e.metaKey ? s.selected : []);
    for (let i = a; i <= b; i++) {
      const it = itemAt(i);
      if (it) next.add(it.id);
    }
    useLibrary.setState({ selected: next, focus: id });
    return;
  }
  if (e.ctrlKey || e.metaKey) {
    const next = new Set(s.selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    useLibrary.setState({ selected: next, focus: id, anchor: index });
    return;
  }
  useLibrary.setState({ selected: new Set([id]), focus: id, anchor: index });
}

function Badge({ game }: { game: string | null }) {
  const { mark, hue } = gameMark(game);
  return (
    <span className="lib-badge" style={{ ['--hue' as string]: String(hue) }} title={gameName(game)}>
      {mark}
    </span>
  );
}

/** What a replay's conversion is, in a word, when there is something to say. */
export function ConvTag({ it }: { it: Pick<Item, 'conv' | 'kind'> }) {
  if (it.kind !== 'replay' && it.conv !== 'outdated') return null;
  const c = it.conv ?? 'none';
  if (c === 'current') return <span className="lib-tag good">{t('library.conv.current')}</span>;
  return <span className={`lib-tag ${c === 'failed' ? 'bad' : c === 'outdated' ? 'warn' : ''}`}>{t(`library.conv.${c}`)}</span>;
}

export function Stars({ n, onSet }: { n: number; onSet?: (n: number) => void }) {
  return (
    <span className="lib-stars" aria-label={t('library.rating', { count: n })}>
      {[1, 2, 3, 4, 5].map((i) =>
        onSet ? (
          <button key={i} type="button" className={i <= n ? 'on' : ''} onClick={() => onSet(i === n ? 0 : i)} aria-label={t('library.rateTo', { count: i })}>
            ★
          </button>
        ) : (
          <span key={i} className={i <= n ? 'on' : ''}>
            ★
          </span>
        ),
      )}
    </span>
  );
}

/** The picture of an item: its thumbnail, else its game's mark on a quiet ground. */
export function Thumb({ it, token }: { it: Item; token: string | undefined }) {
  const [broken, setBroken] = useState(false);
  if (it.thumb && token && !broken) return <img className="lib-thumb-img" src={thumbSrc(token, it.id)} alt="" loading="lazy" decoding="async" draggable={false} onError={() => setBroken(true)} />;
  const { mark, hue } = gameMark(it.game);
  return (
    <div className="lib-thumb-none" style={{ ['--hue' as string]: String(hue) }}>
      <span>{mark}</span>
      <small>{it.kind === 'replay' ? formatName(it.format) : kindName(it.kind)}</small>
    </div>
  );
}

const Card = memo(function Card({ it, index, selected, focused, token }: { it: Item; index: number; selected: boolean; focused: boolean; token: string | undefined }) {
  const title = it.title || it.name;
  return (
    <div
      className={`lib-card${selected ? ' sel' : ''}${focused ? ' focus' : ''}${it.missing ? ' missing' : ''}`}
      role="option"
      aria-selected={selected}
      data-id={it.id}
      onMouseDown={(e) => {
        if (e.button === 0) pick(e, index, it.id);
      }}
      onDoubleClick={() => void openItems([it.id])}
      title={title}
    >
      <div className="lib-thumb">
        <Thumb it={it} token={token} />
        <Badge game={it.game} />
        {it.flag === 1 && <span className="lib-flag pick" aria-label={t('library.flag.pick')} />}
        {it.flag === -1 && <span className="lib-flag reject" aria-label={t('library.flag.reject')} />}
        {it.duration ? <span className="lib-dur">{length(it.duration)}</span> : null}
        {it.missing && <span className="lib-missing">{t('library.missing')}</span>}
      </div>
      <div className="lib-meta">
        <div className="lib-title">{title}</div>
        <div className="lib-sub">
          {it.kind === 'level' || it.kind === 'models' ? kindName(it.kind) : [it.map, it.mode].filter(Boolean).join(' · ') || kindName(it.kind)}
        </div>
        <div className="lib-sub lib-row">
          <span>{date(it.started, false)}</span>
          {it.players ? <span>{t('library.players', { count: it.players })}</span> : null}
          <ConvTag it={it} />
          {it.rating > 0 && <Stars n={it.rating} />}
        </div>
      </div>
    </div>
  );
});

function useSize(ref: RefObject<HTMLElement | null>) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [ref]);
  return box;
}

export function LibraryGrid() {
  useLang();
  const layout = useLibrary((s) => s.layout);
  const thumbW = useLibrary((s) => s.thumb);
  const total = useLibrary((s) => s.total);
  const pages = useLibrary((s) => s.pages);
  const selected = useLibrary((s) => s.selected);
  const focus = useLibrary((s) => s.focus);
  const generation = useLibrary((s) => s.generation);
  const token = useLibrary((s) => s.status?.thumbToken);
  const scroller = useRef<HTMLDivElement>(null);
  const { w, h } = useSize(scroller);
  const [top, setTop] = useState(0);

  const cols = layout === 'grid' ? Math.max(1, Math.floor((w - GAP) / (thumbW + GAP))) : 1;
  const cardW = layout === 'grid' ? Math.floor((w - GAP * (cols + 1)) / cols) : w;
  const rowH = layout === 'grid' ? Math.round(cardW * 0.625) + 78 + GAP : LIST_ROW;
  const rows = Math.ceil(total / cols);
  const first = Math.max(0, Math.floor(top / rowH) - 2);
  const last = Math.min(rows, Math.ceil((top + h) / rowH) + 2);

  // A new listing starts at the top.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    setTop(0);
  }, [generation]);

  // The pages in sight.
  useEffect(() => {
    const a = Math.floor((first * cols) / PAGE);
    const b = Math.floor((Math.max(first, last - 1) * cols + cols - 1) / PAGE);
    for (let p = a; p <= b && p * PAGE < Math.max(total, 1); p++) void loadPage(p);
  }, [first, last, cols, total, generation]);

  // The focused item kept in sight when moved by keys.
  const keepInSight = useCallback(
    (index: number) => {
      const el = scroller.current;
      if (!el) return;
      const y = Math.floor(index / cols) * rowH;
      if (y < el.scrollTop) el.scrollTop = y;
      else if (y + rowH > el.scrollTop + el.clientHeight) el.scrollTop = y + rowH - el.clientHeight;
    },
    [cols, rowH],
  );
  useEffect(() => {
    const onMove = (e: Event) => keepInSight((e as CustomEvent<number>).detail);
    window.addEventListener('heat3d:library-focus', onMove);
    return () => window.removeEventListener('heat3d:library-focus', onMove);
  }, [keepInSight]);
  useEffect(() => {
    (window as unknown as { __libraryCols?: number }).__libraryCols = cols;
  }, [cols]);

  const cells: ReactElement[] = [];
  for (let r = first; r < last; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= total) break;
      const it = pages[Math.floor(i / PAGE)]?.[i % PAGE];
      const style = layout === 'grid' ? { left: GAP + c * (cardW + GAP), top: GAP + r * rowH, width: cardW, height: rowH - GAP } : { left: 0, top: r * rowH, width: '100%', height: LIST_ROW };
      if (!it) {
        cells.push(<div key={`p${i}`} className={layout === 'grid' ? 'lib-card placeholder' : 'lib-lrow placeholder'} style={style} />);
        continue;
      }
      cells.push(
        <div key={it.id} className="lib-cell" style={style}>
          {layout === 'grid' ? <Card it={it} index={i} selected={selected.has(it.id)} focused={focus === it.id} token={token} /> : <ListRow it={it} index={i} selected={selected.has(it.id)} focused={focus === it.id} />}
        </div>,
      );
    }
  }
  return (
    <div className={`lib-scroll ${layout}`} ref={scroller} role="listbox" aria-multiselectable="true" aria-label={t('library.items')} tabIndex={0} onScroll={(e) => setTop((e.target as HTMLDivElement).scrollTop)}>
      {layout === 'list' && (
        <div className="lib-lhead">
          <span className="c-game">{t('library.col.game')}</span>
          <span className="c-title">{t('library.col.title')}</span>
          <span className="c-map">{t('library.col.map')}</span>
          <span className="c-date">{t('library.col.date')}</span>
          <span className="c-len">{t('library.col.length')}</span>
          <span className="c-pl">{t('library.col.players')}</span>
          <span className="c-out">{t('library.col.outcome')}</span>
          <span className="c-conv">{t('library.col.converted')}</span>
          <span className="c-size">{t('library.col.size')}</span>
          <span className="c-rate">{t('library.col.rating')}</span>
        </div>
      )}
      <div className="lib-space" style={{ height: rows * rowH + GAP * 2 }}>
        {cells}
      </div>
    </div>
  );
}

const ListRow = memo(function ListRow({ it, index, selected, focused }: { it: Item; index: number; selected: boolean; focused: boolean }) {
  return (
    <div
      className={`lib-lrow${selected ? ' sel' : ''}${focused ? ' focus' : ''}${it.missing ? ' missing' : ''}`}
      role="option"
      aria-selected={selected}
      data-id={it.id}
      onMouseDown={(e) => {
        if (e.button === 0) pick(e, index, it.id);
      }}
      onDoubleClick={() => void openItems([it.id])}
    >
      <span className="c-game">
        <Badge game={it.game} />
      </span>
      <span className="c-title" title={it.name}>
        {it.title || it.name}
        <small>{it.kind === 'replay' || it.kind === 'match' ? formatName(it.format) : kindName(it.kind)}</small>
      </span>
      <span className="c-map">{it.map}</span>
      <span className="c-date">{date(it.started)}</span>
      <span className="c-len">{length(it.duration)}</span>
      <span className="c-pl">{it.players ?? ''}</span>
      <span className="c-out">{it.outcome}</span>
      <span className="c-conv">
        <ConvTag it={it} />
      </span>
      <span className="c-size">{size(it.size)}</span>
      <span className="c-rate">{it.rating > 0 ? <Stars n={it.rating} /> : null}</span>
    </div>
  );
});
