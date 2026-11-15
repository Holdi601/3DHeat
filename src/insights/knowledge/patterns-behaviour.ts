/**
 * The collective-behaviour patterns (`../behaviour`): the shapes the behaviour
 * of many players can take - crowds, flocks, herds, groups under fire,
 * decisions after wins and losses. Joined to the taxonomy in `patterns.ts`;
 * the entries that speak to them live in `behaviour.ts`.
 */

import type { Pattern } from './patterns.ts';

export const BEHAVIOUR_PATTERNS: Pattern[] = [
  { id: 'collective-order', family: 'people', label: 'Collective alignment (flocking)', sign: 'A side\'s moving units head the same way far more often than their own tracks, shifted in time, would by chance.' },
  { id: 'milling', family: 'people', label: 'Milling', sign: 'A side\'s units circle a common centre: rotation without net travel.' },
  { id: 'herding', family: 'people', label: 'Herding and cascades', sign: 'Units leave a place the way the teammate before them did, beyond the place\'s own odds and beyond copying the enemy.' },
  { id: 'lane-formation', family: 'people', label: 'Lanes, trails and desire lines', sign: 'Opposite flows keep to separate lanes; movement concentrates on a few trails reused match after match.' },
  { id: 'crowding', family: 'people', label: 'Crowding and congestion', sign: 'Speed and flow fall as units bunch; through a choke, pushing harder moves fewer through.' },
  { id: 'leadership', family: 'people', label: 'Leaders and followers', sign: 'Some units turn first and others copy their heading a few seconds later.' },
  { id: 'cohesion', family: 'people', label: 'Group cohesion and straggling', sign: 'Units that drift away from their group die more often than those that keep with it.' },
  { id: 'breaking-point', family: 'people', label: 'Breaking point', sign: 'A side that has lost a share of its strength stops closing and falls back, beyond what its distance to the enemy explains.' },
  { id: 'panic', family: 'people', label: 'Fear, panic and flight', sign: 'Under sudden threat units scatter, speed away or freeze, and coordination falls apart.' },
  { id: 'loss-chasing', family: 'people', label: 'Risk after losses and gains', sign: 'After a loss units take more (or less) risk than after a gain.' },
  { id: 'hot-hand', family: 'people', label: 'Streaks (hot hand)', sign: 'Success follows success more often than shuffled sequences of the same player allow.' },
  { id: 'conformity', family: 'people', label: 'Conformity of choices', sign: 'Members of a side choose alike - buys, loadouts, routes - beyond their own preferences.' },
  { id: 'suppression', family: 'people', label: 'Suppression', sign: 'Incoming fire changes how units move and shoot, even when it does not kill.' },
  { id: 'social-loafing', family: 'people', label: 'Social loafing and diffusion of responsibility', sign: 'Action per head falls as more teammates are present.' },
  { id: 'mixed-strategy', family: 'people', label: 'Mixed strategies and predictability', sign: 'Choices that should be unpredictable become patterned: one option wins more, or choices run in sequences.' },
  { id: 'coordination', family: 'people', label: 'Team coordination', sign: 'Members act in step without visible orders: synchronised movement, timing and choices.' },
  { id: 'contagion', family: 'people', label: 'Contagion and spread', sign: 'A state passes from unit to unit by contact or nearness and spreads across the map.' },
  { id: 'territoriality', family: 'people', label: 'Territory and personal space', sign: 'Units keep their distance from each other and hold to their own ground.' },
  { id: 'interaction-network', family: 'people', label: 'Interaction networks', sign: 'Who fights, supports and follows whom forms a network with hubs, clusters and bridges.' },
];
