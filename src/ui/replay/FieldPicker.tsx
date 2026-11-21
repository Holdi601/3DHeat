import { fieldName } from './fields';
import { RELATIVE_FIELDS } from './relative';
import { isVehicleField } from './kindFields';
import { useMemo } from 'react';
import { t, useLang } from '../../i18n';
import { SortControl } from '../sort/SortControl';
import { sortList } from '../sort/order';
import { useSort } from '../sort/useSort';

/** Groups the field chips are shown in. */
const GROUPS: { id: string; fields: (f: string) => boolean }[] = [
  { id: 'who', fields: (f) => ['name', 'vehicle', 'team', 'kind'].includes(f) },
  { id: 'relative', fields: (f) => f === 'bullseye' || (RELATIVE_FIELDS as readonly string[]).includes(f) },
  { id: 'place', fields: (f) => ['position', 'mgrs', 'magHeading'].includes(f) },
  { id: 'flight', fields: (f) => ['alt', 'agl', 'tas', 'ias', 'cas', 'gs', 'mach', 'vs', 'heading', 'hdm', 'course', 'pitch', 'roll', 'aoa', 'aos'].includes(f) },
  { id: 'energy', fields: (f) => ['g', 'gLong', 'gLat', 'turnRate', 'turnRadius', 'energy', 'energyRate'].includes(f) },
  { id: 'vehicle', fields: (f) => isVehicleField(f) },
  { id: 'systems', fields: () => true },
];

/**
 * Which fields to show, as chips by group: a click adds or takes one away.
 * `available` limits the chips to what the data can have.
 */
export function FieldPicker({ available, chosen, onChange }: { available: string[]; chosen: string[]; onChange: (next: string[]) => void }) {
  const sort = useSort<string>(
    'replay.fields',
    [
      { id: 'order', label: t('ui.sort.order'), key: null },
      { id: 'name', label: t('ui.sort.name'), key: (f) => fieldName(f) },
    ],
    'order',
  );
  const language = useLang();
  // Each group's fields, sorted within the group.
  const grouped = useMemo(() => {
    const taken = new Set<string>();
    return GROUPS.map((g) => {
      const ids = available.filter((f) => !taken.has(f) && g.fields(f));
      ids.forEach((f) => taken.add(f));
      return { g, ids: sortList(ids, sort.option.key, sort.option.kind ?? 'text', sort.dir, language) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, sort.by, sort.dir, language]);
  return (
    <div className="field-picker">
      {available.length > 1 && <SortControl sort={sort} />}
      {grouped.map(({ g, ids }) => {
        if (!ids.length) return null;
        return (
          <div key={g.id} className="fp-group">
            <div className="fp-title">{t(`replay.fieldGroup.${g.id}`)}</div>
            <div className="chips">
              {ids.map((f) => (
                <button
                  key={f}
                  className={`chip${chosen.includes(f) ? ' on' : ''}`}
                  onClick={() => onChange(chosen.includes(f) ? chosen.filter((x) => x !== f) : [...chosen, f])}
                >
                  {fieldName(f)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
