/** A buy label as 0..1: eco 0, pistol 0.3, force 0.5, full 1; NaN unknown. */
export function buyScore(label: string): number {
  const s = label.trim().toLowerCase();
  if (!s) return NaN;
  if (/full|rifle|gun/.test(s)) return 1;
  if (/force|half|semi|hero/.test(s)) return 0.5;
  if (/pistol/.test(s)) return 0.3;
  if (/eco|save|none/.test(s)) return 0;
  return NaN;
}
