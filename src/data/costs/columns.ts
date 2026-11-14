/**
 * The source columns the cost model reads, by role (`data/cost.ts`). Kept free
 * of imports so the column mapping can ask for them too: a load keeps only the
 * columns it maps, and a weapon or fuel column left out prices nothing.
 *
 * In each pattern the alternatives' order is the preference.
 */

export const COST_ROLES = {
  weapon: /^(weapon.?name|weapon|ammo.?name|ammo.?type|munition|projectile|hit.?shell|grenade|ability|item)$/i,
  own: /^(vehicle.?name.?key|vehicle|name|vehicle.?name|vehicle.?short.?name|unit|unit.?name|unit.?type|object.?type|agent|type|kind|class)$/i,
  target: /^(other.?vehicle|target.?vehicle|victim.?vehicle|target.?name|target.?type|victim.?type|other.?type|other.?kind)$/i,
  type: /^(type|kind|class|category|object.?type)$/i,
  victim: /^(other|victim|target)$/i,
  resource: /^(resource|resource.?type)$/i,
  damage: /^(damage|dmg|health.?damage)$/i,
  fuel: /^(fuel|fuel.?weight|fuel.?kg|fuel.?mass|fuel.?quantity)$/i,
  throttle: /^throttle$/i,
  burner: /^afterburner$/i,
  equip: /^(equipment|equipment.?value|equip.?value|loadout.?value)$/i,
  cash: /^cash.?spent.?total$/i,
  amount: /^(amount|quantity|gathered|income)$/i,
} as const;

/** A converter's own value columns: `cost_<kind>_<currency>`, `earn_<currency>`, `net_<currency>`. */
export const VALUE_COLUMN = /^(cost|earn|net)_[a-z0-9_]+$/i;

/** Preference of a column within a role: its alternative's index, lower first. */
export function roleRank(re: RegExp, name: string): number {
  const alts = re.source.replace(/^\^\(|\)\$$/g, '').split('|');
  const i = alts.findIndex((a) => new RegExp(`^(${a})$`, 'i').test(name.trim()));
  return i < 0 ? alts.length : i;
}

/**
 * The columns worth loading for the cost model, of those a source has: the
 * best one per role (the own name and the type both, they answer different
 * questions), and every value column the converter wrote.
 */
export function costColumns(columns: readonly string[]): string[] {
  const out = new Set<string>();
  for (const [role, re] of Object.entries(COST_ROLES)) {
    const ranked = columns.filter((c) => re.test(c.trim())).sort((a, b) => roleRank(re, a) - roleRank(re, b));
    // Two weapon columns: a launch row may name the weapon in one and only its kind in the other.
    for (const c of ranked.slice(0, role === 'weapon' ? 2 : 1)) out.add(c);
  }
  for (const c of columns) if (VALUE_COLUMN.test(c.trim())) out.add(c);
  return [...out];
}

export interface ValueColumn {
  name: string;
  flow: 'cost' | 'earn' | 'net';
  /** A `ValueKind`, `total`, an income kind, or null for the plain income or net. */
  kind: string | null;
  currency: string;
}

const KIND_SET = new Set<string>(['fired', 'spent', 'lost', 'destroyed', 'damage', 'fuel', 'total']);

/** A value column's parts by its name, or null when the name is not one. */
export function parseValueColumn(name: string): ValueColumn | null {
  const m = /^(cost|earn|net)_([a-z0-9_]+)$/i.exec(name.trim());
  if (!m) return null;
  const flow = m[1].toLowerCase() as ValueColumn['flow'];
  const parts = m[2].toLowerCase().split('_');
  if (parts.some((p) => !p)) return null;
  if (parts.length === 1) {
    // `cost_lost` names no currency: it is in whatever the source counts in.
    if (flow === 'cost' && KIND_SET.has(parts[0])) return { name, flow, kind: parts[0], currency: 'units' };
    return flow === 'cost' ? null : { name, flow, kind: null, currency: parts[0] };
  }
  if (parts.length !== 2 || flow === 'net') return null;
  if (flow === 'cost' && !KIND_SET.has(parts[0])) return null;
  return { name, flow, kind: parts[0], currency: parts[1] };
}

/** A currency's short name for labels: an i18n-free unit, as games spell them. */
export function currencyUnit(currency: string, money: 'usd' | 'eur' = 'usd'): string {
  if (currency === 'usd') return money === 'eur' ? 'EUR' : 'USD';
  const known: Record<string, string> = { sl: 'SL', rp: 'RP', ge: 'GE', cs2: 'CS2 $', creds: 'creds', credits: 'credits', res: 'res', points: 'pts' };
  return known[currency] ?? currency;
}

