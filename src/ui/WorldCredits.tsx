import { useStore } from '../state/store';
import type { LevelCredit } from '../render/level';
import { t } from '../i18n';

/** Each source's credit and where it points. */
const CREDIT: Record<LevelCredit, { key: string; href: string }> = {
  openfreemap: { key: 'heat.world.credit.openfreemap', href: 'https://www.openstreetmap.org/copyright' },
  terrarium: { key: 'heat.world.credit.terrarium', href: 'https://github.com/tilezen/joerd/blob/master/docs/attribution.md' },
};

/**
 * The credit a world backdrop owes its sources, bottom right of the view.
 *
 * Always on while the backdrop is the level, never behind a click: the
 * OpenStreetMap attribution guidelines ask for a credit visible without
 * interaction, and a screenshot or a rendered video of the view is a work
 * produced from the data that must carry it too. See docs/world-backdrop.md.
 */
export function WorldCredits() {
  const credits = useStore((s) => (s.level?.kind === 'model' ? s.level.credits : undefined));
  if (!credits?.length) return null;
  return (
    <div className="world-credits">
      {credits.map((c, i) => (
        <span key={c}>
          {i > 0 && ' · '}
          <a href={CREDIT[c].href} target="_blank" rel="noreferrer">
            {t(CREDIT[c].key)}
          </a>
        </span>
      ))}
    </div>
  );
}
