import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { clampTo, formatBox, parseNumber, stepValue } from './numberInput';

/**
 * A number box that writes and reads numbers the viewer's language's way. The
 * native number input follows the Windows regional format instead, so the box
 * and the label beside it disagreed about the decimal mark.
 *
 * Typing is live: every complete number typed is passed on (clamped when `min`
 * or `max` are given); the text is tidied on Enter and on blur. ArrowUp/Down and
 * the wheel (while focused) step by `step`, Shift for ten.
 */
export function NumberBox({
  value,
  onChange,
  step = 1,
  min,
  max,
  digits = 4,
  ...rest
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  /** Most decimals shown; a function when it depends on the size of the value. */
  digits?: number | ((v: number) => number);
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'step' | 'min' | 'max'>) {
  const [draft, setDraft] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const live = useRef({ value, onChange, step, min, max });
  live.current = { value, onChange, step, min, max };
  const shown = formatBox(value, typeof digits === 'function' ? digits(value) : digits);

  const stepBy = (dir: 1 | -1, fast: boolean) => {
    const c = live.current;
    c.onChange(stepValue(c.value, dir, c.step, fast, c.min, c.max));
    setDraft(null);
  };

  // React's wheel listener is passive and cannot stop the panel scrolling.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (document.activeElement !== el || e.deltaY === 0) return;
      e.preventDefault();
      stepBy(e.deltaY < 0 ? 1 : -1, e.shiftKey);
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, []);

  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      inputMode="decimal"
      value={draft ?? shown}
      onChange={(e) => {
        setDraft(e.target.value);
        const v = parseNumber(e.target.value);
        if (v !== null) onChange(clampTo(v, min, max));
      }}
      onBlur={(e) => {
        setDraft(null);
        rest.onBlur?.(e);
      }}
      onKeyDown={(e) => {
        rest.onKeyDown?.(e);
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          stepBy(e.key === 'ArrowUp' ? 1 : -1, e.shiftKey);
        } else if (e.key === 'Enter') setDraft(null);
      }}
    />
  );
}
