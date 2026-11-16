/**
 * What each unit of a table was seen to carry: the weapon, ammunition and
 * loadout names on its own rows (on the rows where it fires, launches, kills,
 * equips or buys when the table says which rows those are, so a victim never
 * takes on the weapon that hit it), and the names of the weapons an ACMI
 * recording says it launched (their `Parent`).
 *
 * Found in one pass over the rows, a slice a frame (`step`), so a table of
 * millions of rows never stalls a frame.
 */

import type { AttributeColumn, Dataset } from '../state/types';

/** Columns that name a weapon, a round or a loadout. */
export const WEAPON_COLUMN = /^(weapons?|weapon[ _]?(name|type|class|id)|loadout|ammo|ammunition|ammo[ _]?(name|type)|munition|ordnance|primary|secondary|(primary|secondary)[ _]?(weapon|class)|gun|equipment|kit|inflictor)$/i;
/** Event words of rows that are the unit's own use of a weapon. */
const OWN_USE = /shot|shoot|fire|launch|release|drop|throw|kill|reload|equip|loadout|buy|purchase|pickup|spawn|weapon/i;
const NOT_OWN = /killed|death|died|hurt|damaged|struck|victim|hit_?by|got_?hit/i;
const EVENT_COLUMN = /^(event|events|event[ _]?type|type)$/i;

/** Rows a frame. */
const SLICE = 250_000;

export class Loadouts {
  private d: Dataset | null = null;
  private cols: AttributeColumn[] = [];
  private event: AttributeColumn | null = null;
  private ownEvent: Uint8Array | null = null;
  private parent: AttributeColumn | null = null;
  private name: AttributeColumn | null = null;
  private next = 0;
  /** Per person, the category labels seen (column index * 2^24 + category). */
  private seen = new Map<number, Set<number>>();
  /** Weapon person -> its launcher's ACMI id, and its name. */
  private launched = new Map<number, { parent: string; name: string }>();
  private labels: Map<number, string[]> | null = null;
  /** Bumped when the labels change, for caches over them. */
  version = 0;

  /** Whether all rows have been read. */
  get done(): boolean {
    return this.labels !== null;
  }

  /** Read the next slice of `d`'s rows; true while there is more to read. */
  step(d: Dataset, slice = SLICE): boolean {
    if (d !== this.d) this.reset(d);
    if (this.labels) return false;
    const pid = d.personId;
    const end = Math.min(d.count, this.next + slice);
    if (pid && (this.cols.length || this.parent)) {
      const own = this.ownEvent;
      const ev = this.event ? (this.event.data as Uint32Array) : null;
      for (let r = this.next; r < end; r++) {
        const p = pid[r];
        if (this.parent) {
          const pc = (this.parent.data as Uint32Array)[r];
          const parent = this.parent.categories![pc];
          if (parent && !this.launched.has(p)) this.launched.set(p, { parent: parent.trim().toLowerCase(), name: this.name ? (this.name.categories![(this.name.data as Uint32Array)[r]] ?? '') : '' });
        }
        if (own && ev && !own[ev[r]]) continue;
        for (let c = 0; c < this.cols.length; c++) {
          const v = (this.cols[c].data as Uint32Array)[r];
          let s = this.seen.get(p);
          if (!s) this.seen.set(p, (s = new Set()));
          s.add(c * 0x1000000 + v);
        }
      }
    }
    this.next = end;
    if (end < d.count) return true;
    this.finish(d);
    return false;
  }

  /** Every label found, of every unit. */
  all(): string[] {
    const s = new Set<string>();
    for (const l of this.labels?.values() ?? []) for (const x of l) s.add(x);
    return [...s];
  }

  /** The labels found for a person (empty until `done`). */
  of(person: number): readonly string[] {
    return this.labels?.get(person) ?? [];
  }

  private reset(d: Dataset): void {
    this.d = d;
    this.next = 0;
    this.seen = new Map();
    this.launched = new Map();
    this.labels = null;
    const cats = d.attrs.filter((a) => a.kind === 'category' && a.categories);
    this.cols = cats.filter((a) => WEAPON_COLUMN.test(a.name.trim()));
    this.event = cats.find((a) => EVENT_COLUMN.test(a.name.trim()) && a.categories!.some((c) => OWN_USE.test(c))) ?? null;
    this.ownEvent = this.event ? Uint8Array.from(this.event.categories!, (c) => (OWN_USE.test(c) && !NOT_OWN.test(c) ? 1 : 0)) : null;
    this.parent = cats.find((a) => a.name === 'Parent') ?? null;
    this.name = cats.find((a) => a.name === 'Name') ?? null;
  }

  private finish(d: Dataset): void {
    const out = new Map<number, string[]>();
    const add = (p: number, l: string) => {
      const t = l.trim();
      if (!t) return;
      const list = out.get(p);
      if (!list) out.set(p, [t]);
      else if (!list.includes(t)) list.push(t);
    };
    for (const [p, s] of this.seen) for (const k of s) add(p, this.cols[Math.floor(k / 0x1000000)].categories![k % 0x1000000] ?? '');
    if (this.launched.size) {
      // An ACMI object's person label ends in its id (`#1a2b`).
      const byId = new Map<string, number>();
      d.personLabels.forEach((l, p) => {
        const id = /#([0-9a-f]+)$/i.exec(l ?? '')?.[1]?.toLowerCase();
        if (id) byId.set(id, p);
      });
      for (const [, w] of this.launched) {
        const p = byId.get(w.parent);
        if (p !== undefined && w.name) add(p, w.name);
      }
    }
    this.labels = out;
    this.seen = new Map();
    this.launched = new Map();
    this.version++;
  }
}
