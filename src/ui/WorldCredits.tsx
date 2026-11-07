import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { worldStreamer } from '../world/stream';
import type { LevelCredit } from '../render/level';
import { t } from '../i18n';
import { useBackdropUnderData } from './worldPlacement';

/** Each source's credit and where it points. */
const CREDIT: Record<LevelCredit, { key: string; href: string }> = {
  openfreemap: { key: 'heat.world.credit.openfreemap', href: 'https://www.openstreetmap.org/copyright' },
  terrarium: { key: 'heat.world.credit.terrarium', href: 'https://github.com/tilezen/joerd/blob/master/docs/attribution.md' },
  ourairports: { key: 'heat.world.credit.ourairports', href: 'https://ourairports.com/data/' },
  mapterhorn: { key: 'heat.world.credit.mapterhorn', href: 'https://mapterhorn.com/attribution' },
  eox: { key: 'heat.world.credit.eox', href: 'https://cloudless.eox.at' },
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
  // Here because this is always mounted: see the hook.
  useBackdropUnderData();
  const own = useStore((s) => (s.level?.kind === 'model' ? s.level.credits : undefined));
  const streamed = useStore((s) => s.level?.kind === 'model' && !!s.level.stream);
  // A streamed theatre's credits are its drawn tiles' sources, read from the
  // streamer rather than written into the level: a level change re-frames the
  // camera's range, and the sources change as tiles arrive.
  const [live, setLive] = useState<LevelCredit[]>([]);
  useEffect(() => {
    if (!streamed) return;
    const timer = window.setInterval(() => setLive((c) => (c.join() === worldStreamer.credits.join() ? c : [...worldStreamer.credits])), 1000);
    return () => window.clearInterval(timer);
  }, [streamed]);
  const credits = streamed ? live : own;
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
