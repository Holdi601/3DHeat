import { useRef, useState } from 'react';
import { num, t, useLang } from '../i18n';
import { formatPoint, worldToData } from '../render/pose';
import { geoFrame } from '../world/geoFrame';
import { formatLatLon, toMgrs } from '../world/mgrs';
import { useInspectStore, type PickResult } from '../state/inspectStore';
import { useStore } from '../state/store';
import { useAnimationFrame, useEngine } from './EngineContext';
import { coord, copyText, rowFields } from './inspectFormat';
import { formatLength } from '../render/measure';
import { useUnits } from '../state/unitsStore';

/**
 * Eye height for "stand here" on a surface, in world units (metres): standing
 * exactly on the ground puts the camera inside it.
 */
const EYE_HEIGHT = 1.7;

/**
 * What a click on the view found: a data point with every column its row
 * carries, or a spot on the level with the part it belongs to.
 *
 * Stays until it is closed, `Esc` is pressed, or another click answers
 * something else - a card that vanished when the camera moved would be gone
 * exactly when you fly closer to look at what it describes. A ring marks the
 * spot on screen, over the cross drawn in the scene.
 */
export function PickCard() {
  const engine = useEngine();
  const pick = useInspectStore((s) => s.pick);
  const convention = useInspectStore((s) => s.yawConvention);
  const axes = useStore((s) => s.dataset?.axes ?? null);
  const dataset = useStore((s) => s.dataset);
  useLang();
  useUnits();
  const ring = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // The ring follows the point as the camera moves, without React.
  useAnimationFrame(() => {
    const el = ring.current;
    if (!el || !engine) return;
    const p = useInspectStore.getState().pick?.point;
    const at = p ? engine.project(p.x, p.y, p.z) : null;
    if (!at) {
      if (el.style.display !== 'none') el.style.display = 'none';
      return;
    }
    el.style.display = '';
    // Canvas pixels, less where the column it sits in starts on the canvas.
    const hud = el.parentElement;
    const ox = hud?.offsetLeft ?? 0;
    const oy = hud?.offsetTop ?? 0;
    el.style.transform = `translate(${at.x - ox - 9}px, ${at.y - oy - 9}px)`;
  }, !!engine && !!pick?.point);

  if (!pick) return null;
  const close = () => engine?.inspector.clear();

  if (pick.kind === 'pending') {
    return (
      <div className="pick-card">
        <div className="pick-head">
          <b>{t('heat.inspect.working')}</b>
          <button className="link" onClick={close} title={t('heat.inspect.closeTitle')}>
            ×
          </button>
        </div>
        <div className="hint">
          {pick.progress === null || pick.progress === undefined
            ? t('heat.inspect.scanning')
            : t('heat.inspect.indexing', { percent: num((pick.progress ?? 0) * 100, 0) })}
        </div>
      </div>
    );
  }

  const point = pick.point;
  const fields = pick.kind === 'data' && pick.dataset && pick.row !== undefined ? rowFields(pick.dataset, pick.row, convention) : [];
  const local = point ? worldToData(point, axes) : null;
  // On a recording placed on the earth: where the point is in latitude and longitude, and in MGRS.
  const frame = dataset ? geoFrame(dataset) : null;
  const place = frame && point ? frame.latLon(point.x, point.y, point.z) : null;

  const copy = () => {
    const lines: string[] = [];
    if (pick.kind === 'data') for (const f of fields) lines.push(`${f.label}: ${f.copy}`);
    else if (pick.surface?.part) lines.push(`part: ${pick.surface.part}`);
    if (local) lines.push(formatPoint(local, 3));
    if (place) lines.push(formatLatLon(place[0], place[1]), toMgrs(place[0], place[1]));
    void copyText(lines.join('\n')).then((ok) => {
      setCopied(ok);
      if (ok) setTimeout(() => setCopied(false), 1200);
    });
  };

  const lookAt = () => {
    if (engine && point) engine.jumpTo(point, 'look');
  };
  const standHere = () => {
    if (!engine || !point) return;
    if (pick.kind === 'data') engine.jumpTo(point, 'stand', pick.look ?? null);
    else engine.jumpTo({ ...point, y: point.y + EYE_HEIGHT }, 'stand');
  };

  return (
    <>
      <div className="pick-ring" ref={ring} />
      <div className="pick-card">
        <div className="pick-head">
          <b>{pick.kind === 'data' ? t('heat.inspect.dataPoint') : t('heat.inspect.surface')}</b>
          <button className="link" onClick={close} title={t('heat.inspect.closeTitle')}>
            ×
          </button>
        </div>
        <div className="pick-fields">
          {pick.kind === 'surface' && pick.surface && <SurfaceLines pick={pick} />}
          {pick.kind === 'data' &&
            fields.map((f, i) => (
              <div className="line" key={`${f.label}-${i}`}>
                <span>{f.label}</span>
                <b title={f.value}>{f.value}</b>
              </div>
            ))}
          {pick.kind === 'surface' && local && (
            <>
              <div className="line">
                <span>x</span>
                <b>{coord(local.x)}</b>
              </div>
              <div className="line">
                <span>y</span>
                <b>{coord(local.y)}</b>
              </div>
              <div className="line">
                <span>z</span>
                <b>{coord(local.z)}</b>
              </div>
            </>
          )}
          {place && (
            <>
              <div className="line">
                <span>{t('heat.inspect.latLon')}</span>
                <b>{formatLatLon(place[0], place[1])}</b>
              </div>
              <div className="line">
                <span>MGRS</span>
                <b>{toMgrs(place[0], place[1]) || '—'}</b>
              </div>
            </>
          )}
          <div className="line">
            <span>{t('heat.inspect.distance')}</span>
            <b>{formatLength(pick.distance)}</b>
          </div>
        </div>
        <div className="pick-actions">
          <button onClick={copy} title={t('heat.inspect.copyPickTitle')}>
            {copied ? t('heat.inspect.copied') : t('heat.inspect.copy')}
          </button>
          <button onClick={lookAt} title={t('heat.inspect.lookAtTitle')}>
            {t('heat.inspect.lookAt')}
          </button>
          <button
            onClick={standHere}
            title={
              pick.kind === 'data'
                ? pick.look
                  ? t('heat.inspect.standRowLookTitle')
                  : t('heat.inspect.standRowTitle')
                : t('heat.inspect.standSurfaceTitle', { height: num(EYE_HEIGHT, 1) })
            }
          >
            {t('heat.inspect.standHere')}
          </button>
        </div>
      </div>
    </>
  );
}

function SurfaceLines({ pick }: { pick: PickResult }) {
  const s = pick.surface!;
  const cls =
    s.cls === 'ground'
      ? t('heat.inspect.class.ground')
      : s.cls === 'structure'
        ? t('heat.inspect.class.structure')
        : s.cls === 'water'
          ? t('heat.inspect.class.water')
          : t('heat.inspect.class.map');
  return (
    <>
      <div className="line">
        <span>{t('heat.inspect.part')}</span>
        <b title={s.approximate ? t('heat.inspect.approximateTitle') : (s.part ?? undefined)}>
          {s.part ? (s.approximate ? t('heat.inspect.approximate', { part: s.part }) : s.part) : t('heat.inspect.unnamed')}
        </b>
      </div>
      <div className="line">
        <span>{t('heat.inspect.kind')}</span>
        <b>{cls}</b>
      </div>
      {s.nav && (
        // The nav part's own name as the label: it says what is being answered.
        <div className="line">
          <span>{s.nav.part}</span>
          <b>{s.nav.walkable ? '✓' : '—'}</b>
        </div>
      )}
    </>
  );
}
