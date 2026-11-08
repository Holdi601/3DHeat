import { useEffect, useRef, useState } from 'react';
import { t, useLang } from '../i18n';
import { useUnitsStore } from '../state/unitsStore';
import { PRESET_UNITS, PRESETS, QUANTITIES, UNIT_CHOICES, type Quantity, type UnitPreset, type UnitPrefs } from '../units/units';

/** A unit's name in a list: "Feet (ft)". */
function unitName(q: Quantity, u: string): string {
  return t(`units.unit.${q}.${u}`);
}

/**
 * The units everything is shown in: a preset, and any quantity in a unit of
 * its own. The whole of it, for a panel or the header's popover.
 */
export function UnitsSettings() {
  useLang();
  const settings = useUnitsStore((s) => s.settings);
  const prefs = useUnitsStore((s) => s.prefs);
  const { setPreset, setUnit } = useUnitsStore.getState();
  const base = PRESET_UNITS[settings.preset];
  return (
    <div className="units-settings">
      <div className="seg units-presets">
        {PRESETS.map((p) => (
          <button key={p} className={settings.preset === p ? 'on' : ''} title={t(`units.preset.${p}Title`)} onClick={() => setPreset(p)}>
            {t(`units.preset.${p}`)}
          </button>
        ))}
      </div>
      <div className="hint">{t('units.overridesHint')}</div>
      <div className="units-grid">
        {QUANTITIES.map((q) => {
          const own = settings.overrides[q] !== undefined;
          return (
            <label key={q} className={own ? 'own' : ''}>
              <span>{t(`units.quantity.${q}`)}</span>
              <select
                value={own ? (prefs[q] as string) : ''}
                onChange={(e) => setUnit(q, e.target.value ? (e.target.value as UnitPrefs[typeof q]) : null)}
              >
                <option value="">{t('units.fromPreset', { unit: unitName(q, base[q]) })}</option>
                {(UNIT_CHOICES[q] as string[]).map((u) => (
                  <option key={u} value={u}>
                    {unitName(q, u)}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The header's units: the preset at a glance, and the rest a click away.
 * Kept in this browser, for every panel, label, chart and export.
 */
export function UnitsPicker() {
  useLang();
  const settings = useUnitsStore((s) => s.settings);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);
  const custom = Object.keys(settings.overrides).length > 0;
  return (
    <div className="units-picker" ref={box}>
      <select
        className="language-picker"
        value={settings.preset}
        onChange={(e) => useUnitsStore.getState().setPreset(e.target.value as UnitPreset)}
        aria-label={t('units.title')}
        title={t('units.pickerTitle')}
      >
        {PRESETS.map((p) => (
          <option key={p} value={p}>
            {t(`units.preset.${p}`)}
            {custom && p === settings.preset ? ' *' : ''}
          </option>
        ))}
      </select>
      <button type="button" className={`units-more${open ? ' on' : ''}`} title={t('units.moreTitle')} aria-expanded={open} onClick={() => setOpen(!open)}>
        ⋯
      </button>
      {open && (
        <div className="units-popover" role="dialog" aria-label={t('units.title')}>
          <div className="units-popover-title">{t('units.title')}</div>
          <UnitsSettings />
        </div>
      )}
    </div>
  );
}
