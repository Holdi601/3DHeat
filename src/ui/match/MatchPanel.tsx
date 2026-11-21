import { Fragment, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { int, list, num, t } from '../../i18n';
import type { Values } from '../../i18n/message';
import { applyFocus, clearFocus, type Focus } from '../../match/focus';
import {
  aggregate,
  halves,
  isDraw,
  isSuicide,
  pct,
  placeName,
  plantSite,
  plantTime,
  startsHalf,
  type Aggregate,
  type AggregatePlayer,
  type MatchDoc,
  type MatchPlayer,
  type MatchRound,
  type Rate,
  type Side,
} from '../../match/matchDoc';
import { matchesOf, pickedMatches } from '../../match/matches';
import { ALL, ALL_FILES, useMatchStore, wantMatch } from '../../state/matchStore';
import { SummaryCard } from './SummaryCard';
import { loadObjectiveFiles } from '../../state/objectivesStore';
import { useStore } from '../../state/store';
import { Section } from '../controls';
import { SortControl, SortTh } from '../sort/SortControl';
import { useRecent, useSort, useSorted, type Sort } from '../sort/useSort';
import { RecordingInfoSection } from './RecordingInfo';

/** How a round ended: its mark in the round strip, and the message that says it. */
const REASON: Record<MatchRound['reason'], { mark: string; words: string }> = {
  bomb: { mark: 'B', words: 'match.reason.bomb' },
  defuse: { mark: 'D', words: 'match.reason.defuse' },
  elimination: { mark: 'K', words: 'match.reason.elimination' },
  time: { mark: 'T', words: 'match.reason.time' },
  surrender: { mark: 'S', words: 'match.reason.surrender' },
  draw: { mark: '=', words: 'match.reason.draw' },
  other: { mark: '?', words: 'match.reason.other' },
};

/** How a round ended, in words; an end the viewer does not know as the export names it. */
function reasonWords(reason: string): string {
  return Object.hasOwn(REASON, reason) ? t(REASON[reason as MatchRound['reason']].words) : reason;
}

/** The messages for the export's buy types. */
const BUY: Record<string, string> = {
  pistol: 'match.buy.pistol',
  eco: 'match.buy.eco',
  force: 'match.buy.force',
  full: 'match.buy.full',
};

/** A side's buy in a round, in words; '—' for none. */
function buyWords(buy: string | undefined): string {
  return buy && Object.hasOwn(BUY, buy) ? t(BUY[buy]) : '—';
}

function clock(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—';
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function money(v: number | undefined): string {
  return v === undefined ? '—' : t('match.money', { v: int(v) });
}

/** A whole percentage, "57%". */
function percentOf(p: number): string {
  return Number.isFinite(p) ? t('match.percent', { v: num(p, 0) }) : '—';
}

function percent(r: Rate): string {
  return percentOf(pct(r));
}

/**
 * A message with React nodes in some of its places - a command set in mono, a
 * team in its side's colour - the rest of its values filled in as text.
 */
function rich(key: string, nodes: Record<string, ReactNode>, values: Values = {}): ReactNode[] {
  const marks: Values = {};
  for (const name of Object.keys(nodes)) marks[name] = `\u0001${name}\u0001`;
  return t(key, { ...values, ...marks })
    .split('\u0001')
    .map((part, i) => (i % 2 === 1 && part in nodes ? <Fragment key={i}>{nodes[part]}</Fragment> : part));
}

/** Matches of a many-match load whose files the match tab reads when they are the ones shown. */
const MAX_READ = 4;

/** The command that converts demos, as the hints name it. */
const COMMAND = 'python -m heat3d_cs2 demos';

function SideTag({ side, children }: { side: Side | ''; children?: ReactNode }) {
  return <span className={`side side-${side || 'none'}`}>{children ?? side}</span>;
}

/** Show something in the heatmap - the tab's heat view - and say what could not be shown. */
function focus(f: Focus, replay = false) {
  // The heat of all of it, not of the moment a replay left the playhead at.
  if (!replay) {
    if (useStore.getState().mode === 'team') useStore.getState().setMode('heat-simple');
    useStore.getState().patchTimeline({ mode: 'all' });
  }
  const missing = applyFocus(f, replay);
  useMatchStore.getState().setNotice(missing.length ? missing.join('; ') : null);
}

// ------------------------------------------------------------------ matches

function MatchesSection() {
  const docs = useMatchStore((s) => s.docs);
  const games = useMatchStore((s) => s.games);
  const summaries = useMatchStore((s) => s.summaries);
  const reading = useMatchStore((s) => s.reading);
  const open = useMatchStore((s) => s.open);
  const error = useMatchStore((s) => s.error);
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const session = useStore((s) => s.team.session);
  const store = useMatchStore.getState();
  // Of a many-match load, the matches shown, a few at most: what their files say, read now (`wantMatch`).
  const shownIds = useMemo(() => {
    if (!dataset) return '';
    const set = matchesOf(dataset);
    if (set.via === 'whole') return ALL_FILES;
    const picked = pickedMatches(set, filters, session);
    const ids = set.entries.filter((e) => picked === null || picked.includes(e.index)).map((e) => e.id);
    return ids.length <= MAX_READ ? ids.join('\n') : '';
  }, [dataset, filters, session]);
  useEffect(() => {
    for (const id of shownIds.split('\n')) if (id) wantMatch(id);
  }, [shownIds]);
  // The summaries of the matches shown, where they have no scoreboard of their own (a load of one match: its own,
  // whatever the data calls the match).
  const single = !!dataset && matchesOf(dataset).entries.length <= 1;
  const shownSummaries = single || !shownIds ? summaries : summaries.filter((s) => shownIds.split('\n').some((id) => id === s.id || id.startsWith(s.id) || s.id.startsWith(id)));
  const input = useRef<HTMLInputElement>(null);
  const recent = useRecent('match.list');
  const sort = useSort<MatchDoc>(
    'match.list',
    [
      { id: 'order', label: t('ui.sort.order'), key: null },
      { id: 'recent', label: t('ui.sort.recent'), key: (d) => recent.at(d.match), kind: 'number' },
      { id: 'name', label: t('ui.sort.name'), key: (d) => d.teams.join(' ') },
      { id: 'map', label: t('ui.sort.map'), key: (d) => d.map },
      { id: 'count', label: t('ui.sort.count'), key: (d) => d.rounds.length, kind: 'number' },
    ],
    'order',
  );
  const sorted = useSorted(docs, sort, [recent.at]);
  // Loaded data brings its own scoreboard or summary (every `.3dheat` holds one, or a table to work one out
  // from): nothing to load by hand then, and nothing to show while there is nothing.
  if (dataset && docs.length + games.length + shownSummaries.length === 0 && !reading && !error) return null;
  return (
    <Section title={t('match.matches.title')} defaultOpen={docs.length > 0 || shownSummaries.length > 0 || games.length === 0} right={<span className="count">{docs.length + games.length + shownSummaries.length || ''}</span>}>
      <div className="row wrap" style={{ gap: 6 }}>
        {!dataset && (
          <button
            className="primary"
            onClick={() => input.current?.click()}
            title={t('match.matches.loadTitle', { matchJson: '.match.json', command: COMMAND, parquet: '.parquet' })}
          >
            {t('match.matches.load')}
          </button>
        )}
        {docs.length + games.length > 0 && (
          <button className="link" onClick={() => store.clear()}>
            {t('match.matches.clear')}
          </button>
        )}
        <input
          ref={input}
          type="file"
          multiple
          accept=".json,.3dheat,.parquet"
          style={{ display: 'none' }}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = '';
            void store.load(files);
            // The battles' capture zones over time (`<match>.objectives.parquet`), chosen with them.
            void loadObjectiveFiles(files);
          }}
        />
      </div>
      {error && <pre className="hint race-error">{error}</pre>}
      {reading > 0 && <div className="hint">{t('mass.working')}</div>}
      {shownSummaries.map((s) => (
        <SummaryCard key={s.id} s={s} />
      ))}
      {games.length > 0 && docs.length === 0 && (
        <div className="hint">{t('match.matches.gamesLoaded', { count: games.length })}</div>
      )}
      {!dataset && docs.length === 0 && games.length === 0 && (
        <div className="hint">
          {rich('match.matches.hint', {
            command: <span className="mono">{COMMAND}</span>,
            matchJson: <span className="mono">.match.json</span>,
            parquet: <span className="mono">.parquet</span>,
          })}
        </div>
      )}
      {docs.length > 1 && (
        <div className={`match-row${open === ALL ? ' on' : ''}`} onClick={() => store.setOpen(ALL)}>
          <div className="match-name">{t('match.matches.all')}</div>
          <div className="match-sub">
            {t('match.matches.allSub', { matches: docs.length, rounds: docs.reduce((n, d) => n + d.rounds.length, 0) })}
          </div>
        </div>
      )}
      {docs.length > 1 && <SortControl sort={sort} />}
      <div className="match-list">
        {sorted.map((d) => (
          <div
            key={d.match}
            className={`match-row${open === d.match ? ' on' : ''}`}
            onClick={() => {
              recent.touch(d.match);
              store.setOpen(d.match);
            }}
          >
            <div className="match-name">
              {d.teams.map((team, i) => (
                <span key={team}>
                  {i > 0 && <span className="vs"> {t('match.matches.vs')} </span>}
                  {team} <b>{d.score[team] === undefined ? '' : int(d.score[team])}</b>
                </span>
              ))}
            </div>
            <div className="match-sub mono">
              {d.map} · {t('match.matches.rounds', { count: d.rounds.length })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------ heat links

/** The kinds of event to show, in the current language. */
const events = (): { id: string; label: string; events: string[]; title: string }[] => [
  { id: 'positions', label: t('match.heatLinks.positions'), events: ['position'], title: t('match.heatLinks.positionsTitle') },
  { id: 'kills', label: t('match.heatLinks.kills'), events: ['kill'], title: t('match.heatLinks.killsTitle') },
  { id: 'deaths', label: t('match.heatLinks.deaths'), events: ['death'], title: t('match.heatLinks.deathsTitle') },
  { id: 'openings', label: t('match.heatLinks.openings'), events: [], title: t('match.heatLinks.openingsTitle') },
  { id: 'smokes', label: t('match.heatLinks.smokes'), events: ['smoke'], title: t('match.heatLinks.smokesTitle') },
  { id: 'flashes', label: t('match.heatLinks.flashes'), events: ['flash'], title: t('match.heatLinks.flashesTitle') },
  { id: 'molotovs', label: t('match.heatLinks.molotovs'), events: ['molotov'], title: t('match.heatLinks.molotovsTitle') },
  { id: 'he', label: t('match.heatLinks.he'), events: ['he'], title: t('match.heatLinks.heTitle') },
  { id: 'plants', label: t('match.heatLinks.plants'), events: ['plant'], title: t('match.heatLinks.plantsTitle') },
  { id: 'shots', label: t('match.heatLinks.shots'), events: ['shot'], title: t('match.heatLinks.shotsTitle') },
];

function HeatLinks({ match, round }: { match?: string; round?: number }) {
  const dataset = useStore((s) => s.dataset);
  const notice = useMatchStore((s) => s.notice);
  const hasOpening = !!dataset?.attrs.find((a) => a.name === 'opening');
  return (
    <div className="heat-links">
      <div className="label-row">
        {match
          ? round
            ? t('match.heatLinks.round', { round: int(round) })
            : t('match.heatLinks.match')
          : t('match.heatLinks.all')}
      </div>
      <div className="row wrap" style={{ gap: 4 }}>
        {events().map((e) =>
          e.id === 'openings' && !hasOpening ? null : (
            <button
              key={e.id}
              className="small"
              title={e.title}
              onClick={() => {
                if (e.id === 'openings') {
                  focus({ match, round, events: ['kill', 'death'] });
                  // Narrow to the opening duels with the retained opening flag.
                  const s = useStore.getState();
                  s.setFilters([...s.filters, { kind: 'range', column: 'opening', min: 1, max: 1 }]);
                } else focus({ match, round, events: e.events });
              }}
            >
              {e.label}
            </button>
          ),
        )}
        <button className="small link" onClick={() => (clearFocus(), useMatchStore.getState().setNotice(null))}>
          {t('match.heatLinks.showAll')}
        </button>
      </div>
      {!dataset && <div className="hint">{t('match.heatLinks.noData', { parquet: '.parquet' })}</div>}
      {notice && <div className="hint warn">{notice}</div>}
    </div>
  );
}

// ------------------------------------------------------------------ one match

function Header({ doc }: { doc: MatchDoc }) {
  const h = useMemo(() => halves(doc), [doc]);
  return (
    <div className="match-head">
      <div className="score-line">
        {doc.teams.map((team, i) => (
          <span key={team} className="team-score">
            {i > 0 && <span className="colon">:</span>}
            <span className="team-name">{team}</span> <b>{int(doc.score[team] ?? 0)}</b>
          </span>
        ))}
      </div>
      <div className="match-sub mono">
        {doc.map} ·{' '}
        {t('match.header.halves', {
          first: doc.teams.map((team) => int(h.first[team])).join('-'),
          second: doc.teams.map((team) => int(h.second[team])).join('-'),
        })}
        {h.overtimeRounds > 0 &&
          ` · ${t('match.header.overtime', { score: doc.teams.map((team) => int(h.overtime[team])).join('-') })}`}
        {doc.incomplete.length > 0 && ` · ${t('match.header.cutOff', { count: doc.incomplete.length })}`}
      </div>
    </div>
  );
}

/** A round's result in one line: who won, how, and where the bomb went down; a draw as a draw. */
function roundTitle(r: MatchRound): string {
  if (isDraw(r)) return t('match.roundStrip.draw', { round: int(r.number) });
  const values = { round: int(r.number), team: r.winnerTeam, side: r.winner, reason: reasonWords(r.reason) };
  if (!r.plant) return t('match.roundStrip.title', values);
  const site = plantSite(r);
  return site ? t('match.roundStrip.titlePlant', { ...values, site }) : t('match.roundStrip.titlePlantUnknown', values);
}

function RoundStrip({ doc }: { doc: MatchDoc }) {
  const round = useMatchStore((s) => s.round);
  const setRound = useMatchStore((s) => s.setRound);
  return (
    <div className="round-strip">
      {doc.rounds.map((r) => (
        <button
          key={r.number}
          className={`round-cell ${isDraw(r) ? 'draw' : `win-${r.winner}`}${round === r.number ? ' on' : ''}${startsHalf(doc, r.number) ? ' half' : ''}`}
          title={`${roundTitle(r)}\nT ${buyWords(r.buy.T)} ${money(r.equipment.T)} · CT ${buyWords(r.buy.CT)} ${money(r.equipment.CT)}`}
          onClick={() => setRound(round === r.number ? null : r.number)}
        >
          <span className="n">{int(r.number)}</span>
          <span className="m">{isDraw(r) ? REASON.draw.mark : (REASON[r.reason]?.mark ?? REASON.other.mark)}</span>
        </button>
      ))}
    </div>
  );
}

function RoundDetail({ doc, r }: { doc: MatchDoc; r: MatchRound }) {
  const teamOf = (side: Side) => Object.entries(r.sides).find(([, s]) => s === side)?.[0] ?? side;
  const sort = useSort<MatchRound['kills'][number]>(
    'match.kills',
    [
      { id: 'time', label: t('ui.sort.time'), key: (k) => k.time, kind: 'number', dir: 'asc' },
      { id: 'player', label: t('ui.sort.player'), key: (k) => k.attacker },
      { id: 'weapon', label: t('ui.sort.weapon'), key: (k) => k.weapon },
    ],
    'time',
  );
  const kills = useSorted(r.kills, sort);
  return (
    <div className="round-detail">
      <div className="round-title">
        {isDraw(r)
          ? t('match.roundStrip.draw', { round: int(r.number) })
          : rich(
              'match.roundDetail.title',
              { team: <SideTag side={r.winner}>{r.winnerTeam || r.winner}</SideTag> },
              { round: int(r.number), reason: reasonWords(r.reason) },
            )}
        <span className="dim"> · {clock(r.end - r.start)}</span>
      </div>
      <div className="economy">
        {(['T', 'CT'] as const).map((s) => (
          <span key={s}>
            <SideTag side={s} /> {teamOf(s)}: {buyWords(r.buy[s])} {money(r.equipment[s])}
          </span>
        ))}
      </div>
      {r.plant && (
        <div className="dim">
          {plantSite(r)
            ? t('match.roundDetail.plant', { site: plantSite(r), player: r.plant.player, time: clock(plantTime(doc, r)) })
            : t('match.roundDetail.plantUnknown', { player: r.plant.player, time: clock(plantTime(doc, r)) })}
        </div>
      )}
      {r.kills.length > 1 && <SortControl sort={sort} />}
      <table className="kill-feed">
        <tbody>
          {kills.map((k, i) => (
            <tr key={i} className={k.after ? 'after' : ''}>
              <td className="mono dim">{clock(k.time)}</td>
              <td className={`side-${k.attackerSide || 'none'}`}>{k.attacker || t('match.roundDetail.world')}</td>
              <td className="weapon">
                {k.weapon}
                {k.headshot && (
                  <span className="flag" title={t('match.roundDetail.headshotTitle')}>
                    HS
                  </span>
                )}
                {k.wallbang && (
                  <span className="flag" title={t('match.roundDetail.wallbangTitle')}>
                    {t('match.roundDetail.wallbang')}
                  </span>
                )}
                {k.throughSmoke && (
                  <span className="flag" title={t('match.roundDetail.smokeTitle')}>
                    {t('match.roundDetail.smoke')}
                  </span>
                )}
              </td>
              <td className={`side-${k.victimSide || 'none'}`}>{k.victim}</td>
              <td className="flags">
                {k.opening && (
                  <span className="flag open" title={t('match.roundDetail.openTitle')}>
                    {t('match.roundDetail.open')}
                  </span>
                )}
                {k.trade && (
                  <span className="flag" title={t('match.roundDetail.tradeTitle')}>
                    {t('match.roundDetail.trade')}
                  </span>
                )}
                {k.traded && (
                  <span className="flag" title={t('match.roundDetail.tradedTitle')}>
                    {t('match.roundDetail.traded')}
                  </span>
                )}
                {k.teamkill && !isSuicide(k) && <span className="flag bad">{t('match.roundDetail.team')}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {r.clutches.map((c, i) => (
        <div key={i} className="dim">
          {t(c.won ? 'match.roundDetail.clutchWon' : 'match.roundDetail.clutchLost', {
            player: c.player,
            side: c.side,
            against: int(c.against),
          })}
        </div>
      ))}
      <div className="dim">
        {t('match.roundDetail.alive', {
          tSide: 'T',
          tPlayers: r.survivors.T?.length ? list(r.survivors.T) : t('match.roundDetail.nobody'),
          ctSide: 'CT',
          ctPlayers: r.survivors.CT?.length ? list(r.survivors.CT) : t('match.roundDetail.nobody'),
        })}
      </div>
      <div className="row wrap" style={{ gap: 4, marginTop: 6 }}>
        <button
          className="small"
          onClick={() => focus({ match: doc.match, round: r.number })}
          title={t('match.roundDetail.showTitle')}
        >
          {t('match.roundDetail.show')}
        </button>
        <button
          className="small primary"
          onClick={() => focus({ match: doc.match, round: r.number }, true)}
          title={t('match.roundDetail.replayTitle')}
        >
          {t('match.roundDetail.replay')}
        </button>
      </div>
    </div>
  );
}

function Scoreboard({ doc }: { doc: MatchDoc }) {
  // One sort for both teams' tables, each sorted within itself.
  const sort = useSort<MatchPlayer>(
    'match.scoreboard',
    [
      { id: 'name', label: t('ui.sort.name'), key: (p) => p.name },
      { id: 'kills', label: t('ui.sort.kills'), key: (p) => p.kills, kind: 'number' },
      { id: 'deaths', label: t('ui.sort.deaths'), key: (p) => p.deaths, kind: 'number' },
      { id: 'assists', label: t('match.scoreboard.assistsTitle'), key: (p) => p.assists + p.flashAssists, kind: 'number' },
      { id: 'diff', label: t('ui.sort.difference'), key: (p) => p.diff, kind: 'number' },
      { id: 'adr', label: 'ADR', key: (p) => p.adr, kind: 'number' },
      { id: 'kast', label: 'KAST', key: (p) => p.kast, kind: 'number' },
      { id: 'hs', label: 'HS', key: (p) => p.headshotPct, kind: 'number' },
      { id: 'open', label: t('match.scoreboard.open'), key: (p) => p.openingKills - p.openingDeaths, kind: 'number' },
      { id: 'clutches', label: t('match.scoreboard.clutches'), key: (p) => p.clutchesWon, kind: 'number' },
      { id: 'order', label: t('ui.sort.order'), key: null },
    ],
    'kills',
  );
  return (
    <>
      {doc.teams.map((team) => (
        <TeamScore key={team} doc={doc} team={team} sort={sort} />
      ))}
      <div className="hint">{t('match.scoreboard.hint')}</div>
    </>
  );
}

function TeamScore({ doc, team, sort }: { doc: MatchDoc; team: string; sort: Sort<MatchPlayer> }) {
  const players = useMemo(() => doc.players.filter((p) => p.team === team), [doc, team]);
  const rows = useSorted(players, sort);
  return (
    <table className="score-table">
      <thead>
        <tr>
          <SortTh sort={sort} id="name">{team}</SortTh>
          <SortTh sort={sort} id="kills" title={t('match.scoreboard.killsTitle')}>K</SortTh>
          <SortTh sort={sort} id="deaths" title={t('match.scoreboard.deathsTitle')}>D</SortTh>
          <SortTh sort={sort} id="assists" title={t('match.scoreboard.assistsTitle')}>A</SortTh>
          <SortTh sort={sort} id="diff" title={t('match.scoreboard.diffTitle')}>±</SortTh>
          <SortTh sort={sort} id="adr" title={t('match.scoreboard.adrTitle')}>ADR</SortTh>
          <SortTh sort={sort} id="kast" title={t('match.scoreboard.kastTitle')}>KAST</SortTh>
          <SortTh sort={sort} id="hs" title={t('match.scoreboard.headshotsTitle')}>HS</SortTh>
          <SortTh sort={sort} id="open" title={t('match.scoreboard.openTitle')}>{t('match.scoreboard.open')}</SortTh>
          <SortTh sort={sort} id="clutches" title={t('match.scoreboard.clutchesTitle')}>{t('match.scoreboard.clutches')}</SortTh>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <PlayerRow key={p.steamid} doc={doc} p={p} />
        ))}
      </tbody>
    </table>
  );
}

function PlayerRow({ doc, p }: { doc: MatchDoc; p: MatchPlayer }) {
  const multi = Object.entries(p.multiKills)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${int(n)}×${k}`);
  const values = {
    name: p.name,
    trades: p.tradeKills,
    traded: int(p.tradedDeaths),
    flashAssists: p.flashAssists,
    flashed: p.enemiesFlashed,
    damage: int(p.utilityDamage),
  };
  return (
    <tr
      onClick={() => focus({ match: doc.match, player: p.name, events: ['kill', 'death'] })}
      title={
        multi.length
          ? t('match.playerRow.titleMulti', { ...values, multi: list(multi) })
          : t('match.playerRow.title', values)
      }
    >
      <td className="who">{p.name}</td>
      <td>{int(p.kills)}</td>
      <td>{int(p.deaths)}</td>
      <td>{int(p.assists + p.flashAssists)}</td>
      <td className={p.diff > 0 ? 'good' : p.diff < 0 ? 'bad' : ''}>{p.diff > 0 ? `+${int(p.diff)}` : int(p.diff)}</td>
      <td>{num(p.adr, 0)}</td>
      <td>{percentOf(p.kast)}</td>
      <td>{percentOf(p.headshotPct)}</td>
      <td>
        {int(p.openingKills)}-{int(p.openingDeaths)}
      </td>
      <td>
        {int(p.clutchesWon)}/{int(p.clutches)}
      </td>
    </tr>
  );
}

// ------------------------------------------------------------------ across matches

/** The buys the across-matches table has a column for, and the messages that head them. */
const BUY_COLUMNS: [string, string][] = [
  ['eco', 'match.across.eco'],
  ['force', 'match.across.force'],
  ['full', 'match.across.full'],
];

function Across({ agg }: { agg: Aggregate }) {
  // The tables show the first few of the whole list in its sort: the leaders by what it is sorted by.
  const openingSort = useSort<Aggregate['openings'][number]>(
    'match.openings',
    [
      { id: 'name', label: t('ui.sort.name'), key: (o) => placeName(o.place) },
      { id: 'count', label: t('ui.sort.count'), key: (o) => o.duels, kind: 'number' },
      { id: 'share', label: t('ui.sort.share'), key: (o) => o.tWon / o.duels, kind: 'number' },
    ],
    'count',
  );
  const playerSort = useSort<AggregatePlayer>(
    'match.across.players',
    [
      { id: 'name', label: t('ui.sort.name'), key: (p) => p.name },
      { id: 'matches', label: t('ui.sort.matches'), key: (p) => p.matches, kind: 'number' },
      { id: 'kd', label: t('ui.sort.difference'), key: (p) => p.kills - p.deaths, kind: 'number' },
      { id: 'adr', label: 'ADR', key: (p) => p.adr, kind: 'number' },
      { id: 'kast', label: 'KAST', key: (p) => p.kast, kind: 'number' },
      { id: 'hs', label: 'HS', key: (p) => p.headshotPct, kind: 'number' },
      { id: 'open', label: t('match.across.open'), key: (p) => p.openingKills - p.openingDeaths, kind: 'number' },
    ],
    'kd',
  );
  const openings = useSorted(agg.openings, openingSort);
  const players = useSorted(agg.players, playerSort);
  return (
    <>
      <div className="dim">
        {t('match.across.summary', { matches: agg.matches, rounds: agg.rounds, maps: list(agg.maps) })}
        {agg.draws > 0 && ` · ${t('match.across.draws', { count: agg.draws })}`}
      </div>
      <table className="score-table compact">
        <thead>
          <tr>
            <th>{t('match.across.roundsWon')}</th>
            <th>{t('match.across.all')}</th>
            <th>{t('match.across.pistol')}</th>
            {BUY_COLUMNS.map(([b, key]) => (
              <th key={b}>{t(key)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(['T', 'CT'] as const).map((s) => (
            <tr key={s}>
              <td>
                <SideTag side={s} />
              </td>
              <td>{percent(agg.sides[s])}</td>
              <td title={`${int(agg.pistol[s].won)}/${int(agg.pistol[s].played)}`}>{percent(agg.pistol[s])}</td>
              {BUY_COLUMNS.map(([b]) => {
                const r = agg.buys[s][b] ?? { played: 0, won: 0 };
                return (
                  <td key={b} title={t('match.across.ofRounds', { won: int(r.won), played: r.played })}>
                    {percent(r)}
                    <span className="dim"> ({int(r.played)})</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dim">
        {t('match.across.bomb', {
          sites:
            [
              ...Object.entries(agg.sites)
                .sort()
                .map(([site, r]) => t('match.across.site', { count: r.played, site, side: 'T', pct: percent(r) })),
              ...(agg.unknownSite.played
                ? [t('match.across.siteUnknown', { count: agg.unknownSite.played, side: 'T', pct: percent(agg.unknownSite) })]
                : []),
            ].join(' · ') || t('match.across.neverPlanted'),
        })}
        {' · '}
        {t('match.across.endedBy', {
          reasons: Object.entries(agg.reasons)
            .sort((a, b) => b[1] - a[1])
            .map(([why, n]) => `${reasonWords(why)} ${int(n)}`)
            .join(', '),
        })}
      </div>
      <div className="dim">{t('match.across.openingConverted', { pct: percent(agg.openingConverted) })}</div>
      <table className="score-table compact">
        <thead>
          <tr>
            <SortTh sort={openingSort} id="name">{t('match.across.openingsWhere')}</SortTh>
            <SortTh sort={openingSort} id="count">{t('match.across.duels')}</SortTh>
            <SortTh sort={openingSort} id="share">{t('match.across.sideWon', { side: 'T' })}</SortTh>
          </tr>
        </thead>
        <tbody>
          {openings.slice(0, 10).map((o) => (
            <tr key={o.place}>
              <td className="who">{placeName(o.place)}</td>
              <td>{int(o.duels)}</td>
              <td>{percentOf((100 * o.tWon) / o.duels)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="score-table compact">
        <thead>
          <tr>
            <SortTh sort={playerSort} id="name">{t('match.across.players')}</SortTh>
            <SortTh sort={playerSort} id="matches" title={t('match.across.matchesTitle')}>{t('match.across.matchesShort')}</SortTh>
            <SortTh sort={playerSort} id="kd">K-D</SortTh>
            <SortTh sort={playerSort} id="adr">ADR</SortTh>
            <SortTh sort={playerSort} id="kast">KAST</SortTh>
            <SortTh sort={playerSort} id="hs">HS</SortTh>
            <SortTh sort={playerSort} id="open" title={t('match.across.openTitle')}>{t('match.across.open')}</SortTh>
          </tr>
        </thead>
        <tbody>
          {players.slice(0, 15).map((p) => (
            <tr key={p.steamid} onClick={() => focus({ player: p.name, events: ['kill', 'death'] })} title={`${p.name} (${p.team})`}>
              <td className="who">{p.name}</td>
              <td>{int(p.matches)}</td>
              <td>
                {int(p.kills)}-{int(p.deaths)}
              </td>
              <td>{num(p.adr, 0)}</td>
              <td>{percentOf(p.kast)}</td>
              <td>{percentOf(p.headshotPct)}</td>
              <td>
                {int(p.openingKills)}-{int(p.openingDeaths)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function MatchPanel() {
  const docs = useMatchStore((s) => s.docs);
  const open = useMatchStore((s) => s.open);
  const round = useMatchStore((s) => s.round);
  const doc = docs.find((d) => d.match === open) ?? null;
  const r = doc && round !== null ? doc.rounds.find((x) => x.number === round) ?? null : null;
  const agg = useMemo(() => (docs.length && !doc ? aggregate(docs) : null), [docs, doc]);
  return (
    <>
      <RecordingInfoSection />
      <MatchesSection />
      {doc && (
        <Section title={t('match.panel.match')} defaultOpen right={<span className="count">{doc.map}</span>}>
          <Header doc={doc} />
          <RoundStrip doc={doc} />
          {r ? <RoundDetail doc={doc} r={r} /> : <div className="hint">{t('match.panel.roundHint')}</div>}
          <HeatLinks match={doc.match} round={r?.number} />
        </Section>
      )}
      {doc && (
        <Section title={t('match.panel.scoreboard')} defaultOpen>
          <Scoreboard doc={doc} />
        </Section>
      )}
      {agg && (
        <Section title={t('match.panel.across')} defaultOpen right={<span className="count">{int(agg.matches)}</span>}>
          <Across agg={agg} />
          <HeatLinks />
        </Section>
      )}
    </>
  );
}
