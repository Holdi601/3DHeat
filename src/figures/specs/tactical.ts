/**
 * Close-quarters figures (`../tactical.ts` says which a row is): the
 * close-quarters soldier with each weapon class, standing, crouching and
 * prone, plain and with each side's band; every Rainbow Six Siege operator as
 * their own figure (`../operators.ts`); and the gadgets of `../gadgets.ts`.
 * Own designs at true size; the aliases map gadget names in data to them.
 */

import type { FigureEntry } from '../catalog';
import type { SpecSet } from './index';
import { buildPerson, type Stance } from '../infantry';
import { buildGadget, GADGET_KINDS } from '../gadgets';
import { OPERATOR_CARRIES, operatorName, SIDE_BAND } from '../tactical';
import { buildOperator, OPERATORS, operatorFigureName, operatorSlug } from '../operators';

const F: Record<string, FigureEntry> = {};

for (const carry of OPERATOR_CARRIES) {
  for (const stance of ['stand', 'crouch', 'prone', 'supine'] as Stance[]) {
    for (const side of [null, 'attack', 'defense'] as const) {
      const band = side ? SIDE_BAND[side] : undefined;
      F[operatorName(carry, stance, side)] = { domain: 'person', cls: 'operator', build: () => buildPerson({ carry, stance, vest: true, band }) };
    }
  }
}

// Each operator with the weapon classes of their primaries, in each stance, on their own side.
for (const [name, { look, carries }] of Object.entries(OPERATORS)) {
  const slug = operatorSlug(name);
  for (const carry of carries) {
    for (const stance of ['stand', 'crouch', 'prone', 'supine'] as Stance[]) {
      F[operatorFigureName(slug, carry, stance, look.side)] = { domain: 'person', cls: 'operator', build: () => buildOperator(look, carry, stance, SIDE_BAND[look.side]) };
    }
  }
}

for (const kind of GADGET_KINDS) F[kind] = { domain: 'marker', cls: kind, build: () => buildGadget(kind) };

/** Names in data for the gadget figures, beside their own. */
const ALIASES: Record<string, string> = {
  'barbed wire': 'barbed-wire',
  'breach charge': 'breach-charge',
  'hard breach charge': 'hard-breach-charge',
  'deployable shield': 'deployable-shield',
  'bulletproof camera': 'bulletproof-camera',
  'proximity alarm': 'proximity-sensor',
  'stun grenade': 'stun-grenade',
  'smoke grenade': 'smoke-grenade',
  'frag grenade': 'grenade',
  'impact grenade': 'grenade',
  'nitro cell': 'sticky-charge',
  'reinforced wall': 'wall-reinforcement',
};

export const TACTICAL: SpecSet = { figures: F, aliases: ALIASES };
