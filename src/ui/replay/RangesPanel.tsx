import { Check, Section, Segmented, Slider } from '../controls';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { num, t } from '../../i18n';
import { useUnits } from '../../state/unitsStore';
import { formatLong } from '../../units/format';
import { WEAPON_CLASSES } from '../../ranges/catalog';
import { useRangeInfo } from '../../ranges/layer';
import type { RangeStyle, RangeUnits } from '../../ranges/settings';
import { unitsOf } from './units';

const rgb = (c: [number, number, number]) => `rgb(${c.map((x) => Math.round(x * 255)).join(',')})`;

/**
 * The engagement ranges (`ranges/`): on or off, for whom, which kinds of
 * weapon and which bands, how they look, whether the line of sight cuts them;
 * a legend of the weapon colours and the shown units' weapons with their
 * ranges and where each figure comes from.
 */
export function RangesPanel() {
  const dataset = useStore((s) => s.dataset);
  const r = useReplayStore((s) => s.ranges);
  const info = useRangeInfo();
  const units = useUnits();
  if (!dataset) return null;
  const set = useReplayStore.getState().setRanges;
  const index = unitsOf(dataset);
  const len = (m: number) => formatLong(m, units, m < 10 ? 1 : 0);
  return (
    <Section title={t('ranges.title')} defaultOpen={false}>
      <Check label={t('ranges.on')} checked={r.on} onChange={(v) => set({ on: v })} title={t('ranges.onTitle')} />
      {r.on && (
        <>
          <div className="field" title={t('ranges.unitsTitle')}>
            <div className="label">
              <span>{t('ranges.units')}</span>
            </div>
            <Segmented<RangeUnits>
              value={r.units}
              options={(['selected', 'team', 'all'] as const).map((u) => ({ value: u, label: t(`ranges.units.${u}`) }))}
              onChange={(v) => set({ units: v })}
            />
          </div>
          <Check label={t('ranges.view')} checked={r.view} onChange={(v) => set({ view: v })} title={t('ranges.viewTitle')} />
          {r.view && (
            <Slider
              label={t('ranges.viewLength')}
              value={r.viewLength}
              min={0}
              max={20000}
              step={50}
              onChange={(v) => set({ viewLength: v })}
              format={(v) => (v > 0 ? len(v) : t('ranges.viewLengthAuto'))}
            />
          )}
          <Check label={t('ranges.weapons')} checked={r.weapons} onChange={(v) => set({ weapons: v })} />
          {r.weapons && (
          <div className="field">
            <div className="label">
              <span>{t('ranges.classes')}</span>
            </div>
            {WEAPON_CLASSES.map((c) => (
              <label key={c} className="check">
                <input type="checkbox" checked={r.classes[c]} onChange={(e) => set({ classes: { ...r.classes, [c]: e.target.checked } })} />
                {t(`ranges.class.${c}`)}
              </label>
            ))}
          </div>
          )}
          <div className="field">
            <div className="label">
              <span>{t('ranges.bands')}</span>
            </div>
            {(['max', 'opt', 'min'] as const).map((b) => (
              <Check key={b} label={t(`ranges.band.${b}`)} checked={r.bands[b]} onChange={(v) => set({ bands: { ...r.bands, [b]: v } })} />
            ))}
          </div>
          <div className="field" title={t('ranges.styleTitle')}>
            <div className="label">
              <span>{t('ranges.style')}</span>
            </div>
            <Segmented<RangeStyle>
              value={r.style}
              options={(['glass', 'lines', 'both'] as const).map((s) => ({ value: s, label: t(`ranges.style.${s}`) }))}
              onChange={(v) => set({ style: v })}
            />
          </div>
          <Slider label={t('ranges.opacity')} value={r.opacity} min={0.05} max={1} step={0.05} onChange={(v) => set({ opacity: v })} format={(v) => `${num(v * 100, 0)} %`} />
          <Check label={t('ranges.los')} checked={r.los} onChange={(v) => set({ los: v })} title={t('ranges.losTitle')} />
          <Check label={t('ranges.ground')} checked={r.ground} onChange={(v) => set({ ground: v })} title={t('ranges.groundTitle')} />
          <Slider label={t('ranges.maxUnits')} value={r.maxUnits} min={1} max={32} step={1} onChange={(v) => set({ maxUnits: v })} format={(v) => num(v, 0)} />
          <div className="hint">{t('ranges.legend')}</div>
          {info.reading && <div className="hint">{t('ranges.reading')}</div>}
          {!info.reading && <div className="hint">{info.game ? t('ranges.game', { game: info.game }) : t('ranges.gameNone')}</div>}
          {!info.units.length && <div className="hint">{r.units === 'all' ? t('ranges.none') : t('ranges.selectHint')}</div>}
          {info.units.slice(0, 8).map((u) => (
            <div key={u.person} className="field">
              <div className="label">
                <span>{index.units[index.personUnit[u.person]]?.name ?? `#${u.person}`}</span>
              </div>
              {u.fov !== null && <div className="hint">{t('ranges.fovLine', { fov: num(u.fov, 0) })}</div>}
              {u.weapons.map((w, i) => (
                <div
                  key={w.weapon.id}
                  className="hint"
                  title={[t(`ranges.from.${w.from}`), t(`ranges.src.${w.weapon.src}`), w.weapon.note, w.weapon.source, w.weapon.date].filter(Boolean).join(' · ')}
                  style={{ opacity: r.classes[w.weapon.cls] ? 1 : 0.45 }}
                >
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, marginRight: 6, background: rgb(u.colours[i] ?? [1, 1, 1]) }} />
                  {w.weapon.name}: {t('ranges.weaponLine', { min: len(w.weapon.min), opt: len(w.weapon.opt), max: len(w.weapon.max) })}
                  {w.weapon.src === 'estimate' ? ' *' : ''}
                </div>
              ))}
            </div>
          ))}
          {info.units.length > 0 && <div className="hint">{t('ranges.estimateNote')}</div>}
        </>
      )}
    </Section>
  );
}
