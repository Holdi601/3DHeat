import { int, num, t, useLang } from '../i18n';
import { bearingDegrees, ROSE_BINS, type DirStats } from '../render/direction';
import { useDirectionStore } from '../state/directionStore';

/**
 * The directions at the clicked spot or in a volume: the resultant arrow and a
 * polar chart of where the rows there point (outgoing) against where the
 * other parties that ended up there came from (incoming).
 */
export function DirectionSpot() {
  useLang();
  const spot = useDirectionStore((s) => s.spot);
  const busy = useDirectionStore((s) => s.busy);
  if (!spot) return busy ? <div className="hint">{t('direction.working')}</div> : null;
  const { outgoing, incoming } = spot.result;
  return (
    <div className="direction-spot">
      <div className="line">
        <b>{spot.volume ? t('direction.spotVolume', { name: spot.volume }) : t('direction.spotTitle')}</b>
      </div>
      <PolarChart outgoing={outgoing} incoming={incoming} />
      <StatLine label={t('direction.outgoing')} s={outgoing} />
      <StatLine label={t('direction.incoming')} s={incoming} />
    </div>
  );
}

function StatLine({ label, s }: { label: string; s: DirStats }) {
  return (
    <div className="line">
      <span>{label}</span>
      <b>
        {s.n === 0
          ? t('direction.noRows')
          : t('direction.mean', {
              bearing: num(bearingDegrees(s.mean), 0),
              r: num(s.r, 2),
              spread: Number.isFinite(s.spread) ? num((s.spread * 180) / Math.PI, 0) : '∞',
              count: int(s.n),
            })}
      </b>
    </div>
  );
}

const OUT = '#ffb347';
const IN = '#5ec8ff';

/** Rose petals per bin, scaled to the fuller of the two, and each side's resultant as an arrow. */
function PolarChart({ outgoing, incoming }: { outgoing: DirStats; incoming: DirStats }) {
  const R = 64;
  const C = R + 8;
  let peak = 1;
  for (let k = 0; k < ROSE_BINS; k++) peak = Math.max(peak, outgoing.rose[k], incoming.rose[k]);
  // Bearing 0 is "up" on the chart: the world's -z, as the compass the camera readout uses.
  const at = (b: number, r: number): [number, number] => [C + Math.sin(b) * r, C - Math.cos(b) * r];
  const petals = (s: DirStats, color: string, inset: number) =>
    Array.from({ length: ROSE_BINS }, (_, k) => {
      const v = s.rose[k];
      if (!v) return null;
      // Area, not radius, follows the count: a petal twice as long would read as four times as many.
      const r = R * Math.sqrt(v / peak);
      const half = (Math.PI / ROSE_BINS) * (1 - inset);
      const mid = (k * 2 * Math.PI) / ROSE_BINS;
      const [x0, y0] = at(mid - half, r);
      const [x1, y1] = at(mid + half, r);
      return <path key={k} d={`M${C},${C} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`} fill={color} fillOpacity={0.45} stroke={color} strokeWidth={0.75} />;
    });
  const arrow = (s: DirStats, color: string) => {
    if (s.n === 0 || !Number.isFinite(s.mean)) return null;
    const [x, y] = at(s.mean, R * Math.max(0.08, s.r));
    return <line x1={C} y1={C} x2={x} y2={y} stroke={color} strokeWidth={2.5} markerEnd={`url(#dir-head-${color.slice(1)})`} />;
  };
  return (
    <svg className="direction-polar" width={C * 2} height={C * 2} viewBox={`0 0 ${C * 2} ${C * 2}`} role="img" aria-label={t('direction.polarLabel')}>
      <defs>
        {[OUT, IN].map((c) => (
          <marker key={c} id={`dir-head-${c.slice(1)}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={c} />
          </marker>
        ))}
      </defs>
      {[0.5, 1].map((f) => (
        <circle key={f} cx={C} cy={C} r={R * f} fill="none" stroke="currentColor" strokeOpacity={0.25} />
      ))}
      <line x1={C} y1={C - R} x2={C} y2={C + R} stroke="currentColor" strokeOpacity={0.15} />
      <line x1={C - R} y1={C} x2={C + R} y2={C} stroke="currentColor" strokeOpacity={0.15} />
      <text x={C} y={9} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.6}>
        0°
      </text>
      {petals(incoming, IN, 0.35)}
      {petals(outgoing, OUT, 0)}
      {arrow(incoming, IN)}
      {arrow(outgoing, OUT)}
    </svg>
  );
}
