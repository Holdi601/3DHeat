/**
 * The words of a person hit's card (docs/person-hits.md "The hit"): whether
 * the shot went through a wall, what it passed, and where that came from -
 * the game's own on a kill, the shot traced through the map elsewhere.
 */

import { num, t } from '../i18n';
import type { PersonHitDetail } from './analyze';

/** Where a through-a-wall answer came from, in words (CS2's derived answer is the traced shot). */
export function wallSourceText(d: Pick<PersonHitDetail, 'game' | 'penetrationSource'>): string {
  if (d.penetrationSource === 'recorded') return t('phits.hit.recorded');
  if (d.penetrationSource === 'derived' && d.game === 'cs2') return t('phits.hit.traced');
  return t(`phits.source.${d.penetrationSource}`);
}

/** "yes (2 surfaces: wood_panel, concrete, 14 cm) - traced through the map". */
export function wallText(d: Pick<PersonHitDetail, 'game' | 'penetrated' | 'penetrationSource' | 'walls' | 'wallCm' | 'surfaces' | 'grates'>): string {
  if (d.penetrated < 0) return t('phits.hit.wallUnknown');
  const answer = d.penetrated === 1 ? t('phits.hit.wallYes') : t('phits.hit.wallNo');
  const parts: string[] = [];
  if (d.penetrated === 1 && d.walls > 0) {
    parts.push(d.surfaces.length ? t('phits.hit.surfaces', { n: d.walls, list: d.surfaces.join(', ') }) : t('phits.hit.surfaceCount', { n: d.walls }));
    if (Number.isFinite(d.wallCm)) parts.push(t('phits.hit.cm', { cm: num(d.wallCm, d.wallCm < 10 ? 1 : 0) }));
  }
  if (d.grates > 0) parts.push(t('phits.hit.grates', { n: d.grates }));
  const source = wallSourceText(d);
  return parts.length ? t('phits.hit.wallLine', { answer, detail: parts.join(', '), source }) : t('phits.hit.wallLineShort', { answer, source });
}
