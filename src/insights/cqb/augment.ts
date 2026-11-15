/** The close-quarters block of the lens metrics (`report.lens.cqb`), declared here so the lens file stays as it is. */

import type { CqbMetrics } from './finish';

declare module '../lensMetrics' {
  interface LensMetrics {
    /** Close-quarters and esports measures (`cqb/`): win probability, duels, setups, funnels, impact. */
    cqb?: CqbMetrics;
  }
}

export {};
