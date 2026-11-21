/**
 * What the difference sets against what, right under the mode switch where
 * Difference is picked (docs/win-rate.md#won-against-lost): the teams, or won
 * against lost - over all sides or one - and how each half is scaled before
 * they are compared. Any other column stays in Compare › Difference split.
 */

import { heatModeFor } from '../../data/lines';
import { shownSide, sideVisibility, wonLostColumns, wonLostOf, wonLostRule, type WonLostBy } from '../../data/wonLost';
import { int, t, useLang } from '../../i18n';
import { useSplitStatus } from '../../state/splitStatus';
import { useStore } from '../../state/store';
import { Rich, Segmented } from '../controls';

type Scaling = 'counts' | 'rows' | 'matches';

export function DifferenceBar() {
  useLang();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => heatModeFor(s.mode, s.lines));
  const split = useStore((s) => s.split);
  const visibility = useStore((s) => s.teamVisibility);
  const shares = useStore((s) => s.heat.splitShares);
  const per = useStore((s) => s.heat.splitPer);
  const rate = useStore((s) => s.heat.splitRate);
  const status = useSplitStatus();
  if (!dataset || mode !== 'heat-difference') return null;

  const st = useStore.getState();
  const cols = wonLostColumns(dataset);
  const wl = wonLostOf(split, dataset);
  const what = wl ?? (split.kind === 'teams' ? 'teams' : 'other');
  const teamCount = dataset.teamLabels.length;
  const side = shownSide(teamCount, visibility);
  const hasMatches = !!dataset.sessionId && dataset.sessionLabels.length > 1;

  const choose = (v: string) => {
    if (v === 'teams') {
      st.setSplit({ kind: 'teams' });
      return;
    }
    const col = cols[v as WonLostBy];
    if (!col) return;
    st.setSplit(wonLostRule(col));
    // A side that lost more often would otherwise look hotter by its number of matches alone.
    st.patchHeat({ splitRate: false, splitShares: true, splitPer: hasMatches ? 'matches' : 'rows' });
  };
  const options = [
    ...(teamCount >= 2 ? [{ value: 'teams', label: t('heat.diffBar.teams'), title: t('heat.diffBar.teamsTitle') }] : []),
    ...(cols.round ? [{ value: 'round', label: t(cols.match ? 'heat.diffBar.wonRound' : 'heat.diffBar.won'), title: t('heat.diffBar.wonTitle', { column: cols.round }) }] : []),
    ...(cols.match ? [{ value: 'match', label: t('heat.diffBar.wonMatch'), title: t('heat.diffBar.wonTitle', { column: cols.match }) }] : []),
    ...(what === 'other' ? [{ value: 'other', label: t('heat.diffBar.other'), title: t('heat.diffBar.otherTitle') }] : []),
  ];
  const scaling: Scaling = !shares ? 'counts' : per === 'matches' && hasMatches ? 'matches' : 'rows';
  const scale = (v: Scaling) => st.patchHeat(v === 'counts' ? { splitShares: false } : { splitShares: true, splitPer: v });
  const known = status.positive + status.negative > 0;

  return (
    <div className="diff-bar" data-testid="diff-bar">
      {options.length > 1 && (
        <div className="field">
          <div className="label">
            <span>{t('heat.diffBar.compare')}</span>
          </div>
          <Segmented value={what} options={options} onChange={(v) => v !== 'other' && choose(v)} />
        </div>
      )}
      {wl && teamCount >= 2 && (
        <label className="row diff-bar-side">
          <span>{t('heat.diffBar.side')}</span>
          <select
            data-testid="diff-bar-side"
            value={side === null ? '' : String(side)}
            onChange={(e) => {
              const v = e.target.value === '' ? null : Number(e.target.value);
              useStore.setState({ teamVisibility: sideVisibility(teamCount, v) });
            }}
          >
            <option value="">{t('heat.diffBar.allSides')}</option>
            {dataset.teamLabels.map((l, i) => (
              <option key={i} value={String(i)}>
                {String(l)}
              </option>
            ))}
          </select>
        </label>
      )}
      {!rate && (
        <div className="field">
          <div className="label">
            <span>{t('heat.diffBar.scale')}</span>
          </div>
          <Segmented
            value={scaling}
            onChange={scale}
            options={[
              { value: 'counts' as const, label: t('heat.diffBar.counts'), title: t('heat.diffBar.countsTitle') },
              { value: 'rows' as const, label: t('heat.diffBar.rows'), title: t('heat.diffBar.rowsTitle') },
              ...(hasMatches ? [{ value: 'matches' as const, label: t('heat.diffBar.matches'), title: t('heat.diffBar.matchesTitle') }] : []),
            ]}
          />
        </div>
      )}
      {known && (
        <div className="hint" data-testid="diff-bar-sides">
          <Rich
            text={t(wl ? 'heat.diffBar.sidesWon' : 'heat.diffBar.sides', {
              plus: int(status.positive),
              minus: int(status.negative),
              plusMatches: int(status.positiveMatches),
              minusMatches: int(status.negativeMatches),
              matches: hasMatches ? 'yes' : 'no',
            })}
          />{' '}
          {!rate && t(`heat.diffBar.scaled.${scaling}`)}
        </div>
      )}
    </div>
  );
}
