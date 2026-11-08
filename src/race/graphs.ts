/**
 * Which graphs the charts show, built from the channel table.
 *
 * Every channel a lap carries can be graphed - including ones no one has
 * described yet, under their own names - and the user picks which. Until they
 * do, the graphs are the gap, and every channel the table marks `graph` that
 * the laps actually use: a clutch that is never pressed is not a graph.
 */

import { num, t } from '../i18n';
import type { AlignedLap } from './align';
import { channelCatalog, withUnit, type ChannelEntry, type ChannelInfo } from './schema';

/** The gap to the reference: not a channel, but the first thing to look at. */
export const GAP = 'delta';

export interface GraphRow {
  key: string;
  label: string;
  /** Share of the chart height. */
  weight: number;
  /** The value at a grid index, in the units shown. */
  value: (lap: AlignedLap, i: number) => number;
  /** A fixed range in the units shown; otherwise fitted to the data. */
  range?: [number, number];
  /** Leave the reference out: its gap to itself is zero everywhere. */
  skipRef?: boolean;
  /** Keep zero in the range. */
  zero?: boolean;
  format: (v: number) => string;
}

/** Every channel these laps have, in display order. */
export function lapCatalog(laps: AlignedLap[]): ChannelEntry[] {
  return channelCatalog(laps.map((l) => l.channels));
}

/** Whether any lap uses a channel: an input that never leaves zero is not worth a graph. */
function used(id: string, laps: AlignedLap[]): boolean {
  return laps.some((l) => {
    const c = l.channels[id];
    if (!c) return false;
    for (let i = l.first; i <= l.last; i++) if (Math.abs(c[i]) > 0.02) return true;
    return false;
  });
}

/** The graphs shown until the user picks: the gap, then every `graph` channel in use. */
export function defaultGraphs(laps: AlignedLap[]): string[] {
  const out = [GAP];
  for (const e of lapCatalog(laps)) {
    if (!e.info.graph) continue;
    const input = e.info.input;
    if ((input === 'pedal' || input === 'lamp') && !used(e.id, laps)) continue;
    out.push(e.id);
  }
  return out;
}

function weightOf(info: ChannelInfo): number {
  if (info.input === 'pedal') return 1;
  if (info.input === 'lamp') return 0.55;
  if (info.input === 'steering') return 1.1;
  if (info.input === 'gear') return 0.8;
  return info.group === 'motion' && info.order === 0 ? 1.7 : 1;
}

/** A value already scaled to the units shown, as text. */
export function formatShown(info: ChannelInfo, v: number): string {
  if (!Number.isFinite(v)) return '–';
  return withUnit(num(v, info.show?.digits ?? 2), info.show?.unit ?? info.unit);
}

function signed(v: number, digits: number): string {
  return `${v >= 0 ? '+' : '−'}${num(Math.abs(v), digits)}`;
}

/** The rows for these graph ids, in the order given; ids the laps lack are skipped. */
export function graphRows(ids: string[], catalog: ChannelEntry[]): GraphRow[] {
  const byId = new Map(catalog.map((e) => [e.id, e]));
  const rows: GraphRow[] = [];
  for (const id of ids) {
    if (id === GAP) {
      rows.push({
        key: GAP,
        label: t('race.channel.gap.label'),
        weight: 1.7,
        value: (l, i) => l.channels.delta[i],
        skipRef: true,
        zero: true,
        format: (v) => (Number.isFinite(v) ? withUnit(signed(v, 2), 's') : '–'),
      });
      continue;
    }
    const e = byId.get(id);
    if (!e) continue;
    const scale = e.info.show?.scale ?? 1;
    const offset = e.info.show?.offset ?? 0;
    rows.push({
      key: id,
      label: e.label,
      weight: weightOf(e.info),
      value: (l, i) => {
        const c = l.channels[id];
        return c ? c[i] * scale + offset : Number.NaN;
      },
      range: e.info.show?.range,
      format: (v) => formatShown(e.info, v),
    });
  }
  return rows;
}
