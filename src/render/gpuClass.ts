/**
 * What the renderer string actually says about the hardware.
 *
 * `UNMASKED_RENDERER_WEBGL` is the only identification a page gets, and it is a
 * driver blob rather than a field: a real card arrives as
 *
 *   ANGLE (NVIDIA, NVIDIA GeForce RTX 5080 (0x00002C02) Direct3D11 vs_5_0 ps_5_0, D3D11)
 *
 * and a software fallback as
 *
 *   ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
 *
 * Two things have to come out of that. The first is whether this is hardware at
 * all, because a software rasteriser is not a slow GPU — it is a different
 * order of performance, and a viewer built for ten million points on a discrete
 * card becomes unusable on it. That is worth saying plainly rather than leaving
 * the user to conclude the tool is broken.
 *
 * The second is a name a human can read. The panel showed the whole blob, which
 * is accurate and nearly unreadable at a glance.
 *
 * Deliberately string matching, because there is nothing else to match on. The
 * WebGPU adapter exposes structured fields but is not always present, and WebGL
 * exposes only this. Unknown strings classify as `unknown`, never as software:
 * a wrong "your GPU is not being used" warning is worse than no warning, since
 * it sends people to reconfigure a browser that was working correctly.
 */

import { t } from '../i18n';

export type RendererKind = 'hardware' | 'software' | 'unknown';

export interface RendererClass {
  kind: RendererKind;
  /** A short human-readable name, e.g. "NVIDIA GeForce RTX 5080". */
  short: string | null;
  /** The unmodified string, for the details view and for bug reports. */
  raw: string | null;
}

/**
 * Substrings that only ever appear in a CPU rasteriser.
 *
 * Each is a product name, not a descriptive word. "Software" on its own would
 * be a trap — plenty of hardware drivers mention software queues, software
 * vertex processing, or a software command list in their renderer string.
 */
const SOFTWARE_MARKERS = [
  'swiftshader',
  'llvmpipe',
  'softpipe',
  'swrast',
  'microsoft basic render driver',
  'apple software renderer',
  'generic renderer',
];

/**
 * Vendors that mean real silicon.
 *
 * Used only to promote an otherwise unrecognised string to `hardware`; absence
 * never demotes anything, or every new or renamed vendor would be reported to
 * its owner as broken.
 */
const HARDWARE_VENDORS = [
  'nvidia',
  'geforce',
  'rtx',
  'quadro',
  'amd',
  'radeon',
  'intel',
  'arc',
  'apple m',
  'adreno',
  'mali',
  'powervr',
  'xclipse',
];

export function classifyRenderer(raw: string | null | undefined): RendererClass {
  if (!raw || typeof raw !== 'string' || raw.trim() === '') {
    return { kind: 'unknown', short: null, raw: raw ?? null };
  }
  const lower = raw.toLowerCase();

  if (SOFTWARE_MARKERS.some((m) => lower.includes(m))) {
    return { kind: 'software', short: shortName(raw), raw };
  }
  const kind: RendererKind = HARDWARE_VENDORS.some((v) => lower.includes(v))
    ? 'hardware'
    : 'unknown';
  return { kind, short: shortName(raw), raw };
}

/**
 * Pull the device out of an ANGLE string, or pass a plain one through.
 *
 * ANGLE wraps the real name as `ANGLE (<vendor>, <device> (0x…) <api…>, <backend>)`.
 * The device is the second comma-separated field, minus the PCI id and the
 * shader-model noise that follows it. Anything that does not parse falls back to
 * the original string trimmed — a slightly long name beats an empty one.
 */
function shortName(raw: string): string {
  const angle = /^ANGLE \((.*)\)$/s.exec(raw.trim());
  if (angle?.[1]) {
    const inner = angle[1];
    // Split only on the commas that separate ANGLE's own fields, not on commas
    // inside the parenthesised device description.
    const fields: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of inner) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        fields.push(current);
        current = '';
        continue;
      }
      current += ch;
    }
    fields.push(current);

    const device = (fields[1] ?? fields[0] ?? '').trim();
    if (device) {
      const cleaned = device
        // The PCI device id tells the user nothing.
        .replace(/\s*\(0x[0-9a-fA-F]+\)/g, '')
        // The API and shader model that trail the name on D3D and GL backends.
        // No word boundary after the API name: it is followed by its version
        // digits ("Direct3D11"), and `\b` between "D" and "1" does not exist.
        // Leading whitespace is required, so a device field that *begins* with
        // an API name — SwiftShader reports "Vulkan 1.3.0 (SwiftShader …)" —
        // keeps the only identifying text it has.
        .replace(/\s+(?:Direct3D|D3D|OpenGL ES|OpenGL|Vulkan|Metal)[\d.]*(?:\s.*)?$/i, '')
        .replace(/\s+vs_\d+_\d+.*$/i, '')
        .trim();
      if (cleaned) return cleaned;
    }
  }
  return raw.trim();
}

/**
 * The line to put in front of someone whose browser is rasterising on the CPU.
 *
 * Written for a person who has not opted into anything and does not know the
 * term: name the consequence first, then the fix. `null` when there is nothing
 * to say, so the caller can render it or not without further branching.
 */
export function softwareRenderingAdvice(c: RendererClass): string | null {
  if (c.kind !== 'software') return null;
  return t('render.gpuClass.softwareAdvice', { browser: 'Chrome' });
}
