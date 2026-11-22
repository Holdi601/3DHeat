/**
 * How a split pyramid's channels are drawn in the heat modes that tell groups
 * apart (Stage 6): a pyramid split by the group column has one channel per
 * group, and the rows' rules apply to each channel as to each row of that
 * group - hidden groups weigh 0, the difference signs them (+1 / -1, times
 * each side's scale), team colours carry the group's Oklab a, b and L as the
 * splat does (render/colors.ts `teamHeatLab`).
 *
 * A channel's group is the dataset's group of the same label; with tiles alone
 * (no rows loaded) the channel's place in the list is its group id.
 */

import { TEAM_LIGHTNESS, teamHeatLab } from '../colors';
import type { ChannelWeights } from './tileFormat';

export interface ChannelRules {
  /** The pyramid's channel names (the split column's values). */
  names: readonly string[];
  /** The loaded rows' group labels, or null when tiles are drawn alone. */
  groups: readonly string[] | null;
  mode: string;
  /** Per group: +1, -1 or 0 (frameSignTables); null draws every group, unsigned. */
  teamSign: Int8Array | null;
  /**
   * The group lists of the difference's sides: used when there is no group table (tiles alone);
   * both empty splits the named channels as the store's default does (first half +, rest -).
   */
  positive: readonly number[];
  negative: readonly number[];
  visibility: Readonly<Record<number, boolean>>;
  /** The difference's split: 0 by group (the one tiles can follow). */
  splitMode: number;
  splitScale: readonly [number, number];
  teamColors: boolean;
  /** The last channel holds the rows of no listed group (`PyramidInfo.otherChannel`). */
  other?: boolean;
}

/** The other channel's colour in team colours: no hue, the team circle's lightness. */
const OTHER_LAB: [number, number, number] = [TEAM_LIGHTNESS, 0, 0];

/** The weights for these rules, or null when the plain sum is what the rows would draw. */
export function tileChannelWeights(r: ChannelRules): ChannelWeights | null {
  const n = r.names.length;
  if (n < 2) return null;
  const difference = r.mode === 'heat-difference' && r.splitMode === 0;
  const components = r.teamColors ? 4 : 1;
  const named = r.other ? n - 1 : n;
  const count = r.groups ? r.groups.length : named;
  const w = new Float32Array(n * components);
  let plain = !r.teamColors;
  for (let c = 0; c < n; c++) {
    // The other channel's rows belong to no group the rows name (or to one past the split's channels).
    const id = c >= named ? -1 : r.groups ? r.groups.indexOf(r.names[c]) : c;
    let sign: number;
    if (id < 0) sign = difference ? 0 : 1;
    else if (r.teamSign) sign = id < r.teamSign.length ? r.teamSign[id] : 1;
    else if (difference && r.positive.length + r.negative.length === 0) sign = id < Math.max(1, Math.ceil(named / 2)) ? 1 : -1;
    else if (difference) sign = r.positive.includes(id) ? 1 : r.negative.includes(id) ? -1 : 0;
    else sign = r.visibility[id] === false ? 0 : 1;
    if (difference && !r.teamSign && r.visibility[id] === false) sign = 0;
    if (difference) sign *= sign > 0 ? r.splitScale[0] : r.splitScale[1];
    if (sign !== 1) plain = false;
    if (components === 1) {
      w[c] = sign;
      continue;
    }
    const [L, a, b] = id < 0 ? OTHER_LAB : teamHeatLab(id, count);
    w.set([sign, sign * a, sign * b, sign * L], c * 4);
  }
  if (plain) return null;
  return {
    components,
    w,
    key: `${components}:${Array.from(w, (v) => v.toPrecision(6)).join(',')}`,
  };
}
