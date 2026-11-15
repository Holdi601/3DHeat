/**
 * Patterns of close-quarters fighting and round-based esports, measured by
 * `../cqb` and spoken to by the entries of `cqb.ts`.
 */

import type { Pattern } from './patterns';

export const CQB_PATTERNS: Pattern[] = [
  { id: 'fatal-funnel', family: 'urban', label: 'Fatal funnel', sign: 'Players entering one doorway, room or choke die there within moments far more often than entering elsewhere.' },
  { id: 'crossfire', family: 'force', label: 'Crossfire', sign: 'Holders whose lines of fire converge from different angles win more duels than a single holder.' },
  { id: 'peeker-advantage', family: 'time', label: 'Peeker against holder', sign: 'The player who moves into view wins duels against the one holding the angle more (or less) often than half.' },
  { id: 'entry', family: 'time', label: 'Entry and opening duel', sign: 'The first kill of a round decides much of the round; entries win or lose by place and support.' },
  { id: 'utility-support', family: 'force', label: 'Utility before the entry', sign: 'A flash or smoke just before a duel changes who wins it.' },
  { id: 'man-advantage', family: 'force', label: 'Man advantage', sign: 'Rounds are won by the side with more players alive, and some sides convert or throw an advantage.' },
  { id: 'clutch', family: 'people', label: 'Clutch', sign: 'Last players alive win more (or less) often than the state of the round predicts.' },
  { id: 'action-value', family: 'people', label: 'Value of an action', sign: 'Kills, trades, plants and utility differ in how much they change the chance to win.' },
  { id: 'lurk', family: 'movement', label: 'Lurk', sign: 'A player alone far from the team kills (or dies) at a different rate from the pack.' },
  { id: 'rotation', family: 'movement', label: 'Rotation', sign: 'How fast a side shifts players to the fight or the objective decides whether it holds or retakes.' },
];
