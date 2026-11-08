import { useMemo, useState, type ReactNode } from 'react';
import { Jog } from './Jog';
import { num, t } from '../i18n';

export function Section({
  title,
  children,
  defaultOpen = false,
  right,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  right?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`section${open ? ' open' : ''}`}>
      <header onClick={() => setOpen((v) => !v)}>
        <span>
          <span className="chev">▶</span> {title}
        </span>
        {right}
      </header>
      {open && <div className="body">{children}</div>}
    </div>
  );
}

/**
 * Slider with a typed override. Both matter here: sliders are for exploring a
 * value, typed entry is for reproducing one, and heat tuning needs both.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  format,
  hint,
  logarithmic = false,
  zeroAt,
  ceiling,
  proportional,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: string;
  logarithmic?: boolean;
  /**
   * Make the drag handle change the value by a ratio per second rather than by
   * an amount. For a quantity where only ratios mean anything — see
   * `JogSpec.proportional`. Affects the handle only, not the track.
   */
  proportional?: boolean;
  /**
   * How far above `max` the drag handle beside the track may push the value.
   *
   * Set it wherever `max` is the end of a *drawn track* rather than a real limit
   * — a sprite radius, a cull distance, an intensity. Left unset the handle stops
   * at `max`, which is right for a fraction that means something at its ends.
   *
   * The typed box has always accepted anything; this is the same freedom without
   * having to stop and type. See `Jog`.
   */
  ceiling?: number;
  /**
   * Value the bottom of the track snaps to on a log slider, for settings that are
   * "off, or a number spanning several decades". A log scale cannot reach zero, so
   * the off position has to be carved out of the track rather than mapped.
   */
  zeroAt?: number;
}) {
  const hasZero = logarithmic && zeroAt !== undefined;
  // Width of the reserved off band. Wide enough to hit, narrow enough not to eat
  // the useful bottom of the range.
  const ZB = 0.05;
  const toSlider = (v: number) => {
    if (!logarithmic) return v;
    const t = Math.log(Math.max(min, v) / min) / Math.log(max / min);
    if (!hasZero) return t;
    return v <= zeroAt! ? 0 : ZB + (1 - ZB) * t;
  };
  const fromSlider = (s: number) => {
    if (!logarithmic) return s;
    if (hasZero) {
      if (s < ZB * 0.5) return zeroAt!;
      const t = Math.max(0, (s - ZB) / (1 - ZB));
      return min * Math.pow(max / min, t);
    }
    return min * Math.pow(max / min, s);
  };

  return (
    <div className="field">
      <div className="label">
        <span>{label}</span>
        <span className="val">{format ? format(value) : trim(value)}</span>
      </div>
      <div className="row">
        <input
          type="range"
          min={logarithmic ? 0 : min}
          max={logarithmic ? 1 : max}
          step={logarithmic ? 0.001 : step}
          // A value pushed past the end of the track pins the thumb there rather
          // than wrapping or clearing; the number beside it is the truth.
          value={Math.min(logarithmic ? 1 : max, Math.max(logarithmic ? 0 : min, toSlider(value)))}
          onChange={(e) => onChange(fromSlider(Number(e.target.value)))}
        />
        <input
          className="narrow"
          type="number"
          // Shown to the digits that fit: 57.8998 in a box five characters wide
          // shows "57.89" and hides the rest. The value itself is not rounded.
          value={Number(value.toFixed(Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : Math.abs(value) >= 1 ? 2 : 3))}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v)) onChange(v);
          }}
        />
        <Jog
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          ceiling={ceiling}
          zeroAt={zeroAt}
          proportional={proportional}
          label={label}
        />
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  hint?: string;
}) {
  return (
    <div className="field">
      <div className="label">
        <span>{label}</span>
      </div>
      <input
        type="number"
        value={Number(value.toFixed(4))}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
      />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string; title?: string; disabled?: boolean }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={o.value}
          className={o.value === value ? 'on' : ''}
          title={o.title}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Check({
  label,
  checked,
  onChange,
  title,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  title?: string;
}) {
  return (
    <label className="check" title={title}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  allowEmpty,
}: {
  label: string;
  value: T | null;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T | null) => void;
  allowEmpty?: boolean;
}) {
  // Made once per list rather than on every render: a panel showing a wide
  // table's columns in a dozen of these rebuilt thousands of elements whenever it
  // redrew, which a loading dataset makes it do several times - a frame lost each.
  const items = useMemo(
    () =>
      options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      )),
    [options],
  );
  return (
    <div className="field">
      <div className="label">
        <span>{label}</span>
      </div>
      <select
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || null) as T | null)}
      >
        {allowEmpty && <option value="">{t('ui.select.none')}</option>}
        {items}
      </select>
    </div>
  );
}

/**
 * A translated message with words marked up in it: `<em>`, `<b>`, `<strong>`,
 * `<kbd>` and `<mono>` (a code span) around a run of text. In the message rather
 * than around it so a translation moves the emphasis or the key cap with the
 * words it belongs to. Not nested; anything else is text.
 */
export function Rich({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const tag = /<(em|b|strong|kbd|mono)>(.*?)<\/\1>/gs;
  let last = 0;
  for (let m = tag.exec(text); m; m = tag.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, name, inner] = m;
    const key = out.length;
    if (name === 'em') out.push(<em key={key}>{inner}</em>);
    else if (name === 'b') out.push(<b key={key}>{inner}</b>);
    else if (name === 'strong') out.push(<strong key={key}>{inner}</strong>);
    else if (name === 'kbd') out.push(<kbd key={key}>{inner}</kbd>);
    else out.push(<span key={key} className="mono">{inner}</span>);
    last = tag.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

function trim(v: number): string {
  const a = Math.abs(v);
  return num(v, a >= 1000 ? 0 : a >= 100 ? 1 : a >= 1 ? 2 : 3);
}
