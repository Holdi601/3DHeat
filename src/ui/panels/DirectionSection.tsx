import { int, t, useLang } from '../../i18n';
import { DIR_SOURCES, eventColumn, type DirSource } from '../../render/direction';
import { useDirectionStore } from '../../state/directionStore';
import { useStore } from '../../state/store';
import { selectedVolume, useVolumeStore } from '../../volumes/store';
import { DirectionSpot } from '../DirectionSpot';
import { Check, Section, Segmented, Slider } from '../controls';
import { SortControl } from '../sort/SortControl';
import { useSort, useSorted } from '../sort/useSort';

const NO_KINDS: string[] = [];

/** Directional heat's settings: the source, the wedge, the field, and directions on click (render/direction.ts). */
export function DirectionSection() {
  useLang();
  const heat = useStore((s) => s.heat);
  const patchHeat = useStore((s) => s.patchHeat);
  const dataset = useStore((s) => s.dataset);
  const counts = useDirectionStore((s) => s.counts);
  const askVolume = useDirectionStore((s) => s.askVolume);
  const volume = useVolumeStore((s) => selectedVolume(s));
  const on = heat.wedgeOpening < 360 || heat.dirField !== 'off' || heat.dirOnClick;
  const found = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;
  const events = dataset ? eventColumn(dataset) : null;
  const sort = useSort<string>(
    'direction.kinds',
    [
      { id: 'name', label: t('ui.sort.name'), key: (k) => k },
      { id: 'order', label: t('ui.sort.order'), key: null },
    ],
    'name',
  );
  const kinds = useSorted(events?.categories ?? NO_KINDS, sort);
  const setKind = (kind: string, v: string) => {
    const by = { ...heat.dirSourceBy };
    if (v === '') delete by[kind];
    else by[kind] = v as DirSource;
    patchHeat({ dirSourceBy: by });
  };
  return (
    <Section title={t('direction.section')}>
      <div className="hint">{t('direction.hint')}</div>
      <Segmented
        value={heat.dirSource}
        options={DIR_SOURCES.map((value) => ({ value, label: t(`direction.src.${value}`) }))}
        onChange={(dirSource) => patchHeat({ dirSource })}
      />
      <div className="hint">{t('direction.srcHint')}</div>
      {events && events.categories.length <= 40 && (
        <details>
          <summary>{t('direction.byEvent', { column: events.name })}</summary>
          {events.categories.length > 1 && <SortControl sort={sort} />}
          {kinds.map((kind) => (
            <div className="line" key={kind}>
              <span>{kind || '—'}</span>
              <select value={heat.dirSourceBy[kind] ?? ''} onChange={(e) => setKind(kind, e.target.value)}>
                <option value="">{t('direction.src.inherit')}</option>
                {DIR_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {t(`direction.src.${s}`)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </details>
      )}
      {on && dataset && (
        <div className="hint">{counts ? (found ? t('direction.found', { count: int(found) }) : t('direction.none')) : t('direction.working')}</div>
      )}
      <Slider
        label={t('direction.opening')}
        value={heat.wedgeOpening}
        min={10}
        max={360}
        step={1}
        onChange={(wedgeOpening) => patchHeat({ wedgeOpening })}
        format={(v) => `${Math.round(v)}°`}
        hint={t('direction.openingHint')}
      />
      <Slider
        label={t('direction.softness')}
        value={heat.wedgeSoftness}
        min={0}
        max={1}
        step={0.01}
        onChange={(wedgeSoftness) => patchHeat({ wedgeSoftness })}
      />
      <Segmented
        value={heat.dirField}
        options={(['off', 'arrows', 'streams', 'both'] as const).map((value) => ({ value, label: t(`direction.field.${value}`) }))}
        onChange={(dirField) => patchHeat({ dirField })}
      />
      <div className="hint">{t('direction.fieldHint')}</div>
      {heat.dirField !== 'off' && (
        <>
          <Slider
            label={t('direction.spacing')}
            value={heat.dirFieldSpacing}
            min={12}
            max={96}
            step={1}
            onChange={(dirFieldSpacing) => patchHeat({ dirFieldSpacing })}
            format={(v) => `${Math.round(v)} px`}
          />
          {heat.dirField !== 'arrows' && (
            <Check label={t('direction.animate')} checked={heat.dirFieldAnimate} onChange={(dirFieldAnimate) => patchHeat({ dirFieldAnimate })} />
          )}
        </>
      )}
      <Check label={t('direction.onClick')} checked={heat.dirOnClick} onChange={(dirOnClick) => patchHeat({ dirOnClick })} title={t('direction.onClickHint')} />
      <button disabled={!volume || !counts} onClick={() => volume && askVolume(volume.id)} title={t('direction.volumeHint')}>
        {t('direction.volume')}
      </button>
      <DirectionSpot />
    </Section>
  );
}
