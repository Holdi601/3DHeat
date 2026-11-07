import { fieldName } from './fields';
import { t } from '../../i18n';

/** Groups the field chips are shown in. */
const GROUPS: { id: string; fields: (f: string) => boolean }[] = [
  { id: 'who', fields: (f) => ['name', 'vehicle', 'team', 'kind'].includes(f) },
  { id: 'relative', fields: (f) => ['range', 'bearing', 'aspect', 'closure'].includes(f) },
  { id: 'flight', fields: (f) => ['alt', 'agl', 'tas', 'ias', 'cas', 'gs', 'mach', 'vs', 'heading', 'hdm', 'course', 'pitch', 'roll', 'aoa', 'aos'].includes(f) },
  { id: 'energy', fields: (f) => ['g', 'gLong', 'gLat', 'turnRate', 'turnRadius', 'energy', 'energyRate'].includes(f) },
  { id: 'systems', fields: () => true },
];

/**
 * Which fields to show, as chips by group: a click adds or takes one away.
 * `available` limits the chips to what the data can have.
 */
export function FieldPicker({ available, chosen, onChange }: { available: string[]; chosen: string[]; onChange: (next: string[]) => void }) {
  const taken = new Set<string>();
  return (
    <div className="field-picker">
      {GROUPS.map((g) => {
        const ids = available.filter((f) => !taken.has(f) && g.fields(f));
        ids.forEach((f) => taken.add(f));
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
