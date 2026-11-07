import { describe, expect, it } from 'vitest';
import { ALIASES, CATALOG } from '../catalog';
import { SPEC_SETS } from './index';

describe('spec sets', () => {
  it('maps every alias to a figure in the catalogue', () => {
    const broken = Object.entries(ALIASES).filter(([, name]) => !CATALOG[name]);
    expect(broken).toEqual([]);
  });

  it('keys aliases in lower case, as data is matched', () => {
    const upper = Object.keys(ALIASES).filter((k) => k !== k.toLowerCase());
    expect(upper).toEqual([]);
  });

  it('does not map one name to two figures in different sets', () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const set of SPEC_SETS) {
      for (const [k, v] of Object.entries(set.aliases ?? {})) {
        const prev = seen.get(k);
        if (prev && prev !== v) clashes.push(`${k}: ${prev} / ${v}`);
        seen.set(k, v);
      }
    }
    expect(clashes).toEqual([]);
  });
});
