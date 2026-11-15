/**
 * The built-in debrief's outcome paragraphs (`narrate.ts`): the score and
 * where the win probabilities come from, what separated won from lost rounds
 * (the strongest factors, each with its difference, interval and q, few rounds
 * said as such, whether or not it passed the false discovery rate), the
 * turning points, and the players and places that added or cost the most.
 */

import { int, list, num, t } from '../i18n';
import type { CqbOutcome, OutcomeFactor } from './cqb/outcome';
import type { InsightReport } from './types';

const pct = (v: number) => `${num(v * 100, 0)}%`;
const pts = (v: number) => num(v * 100, Math.abs(v) < 0.1 ? 1 : 0);
const qText = (q: number) => (q < 0.001 ? '<0.001' : num(q, q < 0.01 ? 3 : 2));
/** Factors said at most, and of them those weaker than this q only when nothing stronger is there. */
const FACTORS = 3;

function factorText(f: OutcomeFactor): string {
  const said = t(`insights.say.outcome.${f.kind}`, {
    team: f.team, place: f.place ?? '', fastSecs: f.secs !== undefined ? `${num(f.secs, 0)} s` : '',
    withPct: pct(f.with.share), withoutPct: pct(f.without.share), n1: int(f.with.n), n2: int(f.without.n), diff: pts(f.diff), lo: pts(f.lo), hi: pts(f.hi),
  });
  return `${said.replace(/[.!。]\s*$/, '')} (${t('insights.outcome.evidence', { q: qText(f.q), small: f.small ? 'yes' : 'no' })})`;
}

export function outcomeParagraphs(r: InsightReport): { text: string; cites: string[] }[] {
  const o: CqbOutcome | undefined = r.lens?.cqb?.outcome;
  if (!o) return [];
  const out: { text: string; cites: string[] }[] = [];
  const ids = new Set(r.insights.map((i) => i.id));
  const [a, b] = o.wins;
  out.push({
    text: t('insights.debrief.outcome.score', {
      a: o.teams[0], b: o.teams[1], wa: int(a.k), wb: int(b.k), n: int(o.rounds), pct: pct(a.share), lo: pct(a.lo), hi: pct(a.hi), model: o.model,
    }),
    cites: [],
  });
  // The strongest factors; the ones under the false discovery rate first.
  const strong = o.factors.filter((f) => f.q <= r.fdr);
  const shown = (strong.length ? strong : o.factors).slice(0, FACTORS);
  if (shown.length) {
    out.push({
      text: t('insights.debrief.outcome.factors', { list: list(shown.map(factorText)), n: int(o.tests), sure: strong.length ? 'yes' : 'no' }),
      cites: shown.map((f) => `outcome.${f.id}`).filter((id) => ids.has(id)),
    });
  }
  if (o.turns.length) {
    const turns = o.turns.slice(0, 3).map((tp) =>
      t('insights.outcome.turn', {
        round: int(tp.round), at: `${num(tp.at, 0)} s`, team: tp.team, kind: tp.kind, before: pct(tp.before), after: pct(tp.after),
        won: tp.won === null ? 'unknown' : tp.won ? 'yes' : 'no', place: tp.place ?? '', hasPlace: tp.place ? 'yes' : 'no',
      }),
    );
    out.push({ text: t('insights.debrief.outcome.turns', { list: list(turns) }), cites: [] });
  }
  if (o.best.length || o.worst.length) {
    const say = (p: CqbOutcome['best'][number]) =>
      t('insights.outcome.player', { player: p.person ?? `#${p.personIndex}`, team: p.team, wpa: num(p.wpa, 2), rounds: int(p.rounds), perRound: pts(p.perRound), lo: pts(p.lo), hi: pts(p.hi), small: p.small ? 'yes' : 'no' });
    const spots = o.spots.slice(0, 2).map((s) => t('insights.outcome.spot', { team: s.team, place: s.place, wpa: num(s.wpa, 2), n: int(s.duels) }));
    out.push({
      text: t('insights.debrief.outcome.players', { best: o.best.length ? list(o.best.slice(0, 2).map(say)) : '—', worst: o.worst.length ? list(o.worst.slice(0, 2).map(say)) : '—', spots: spots.length ? list(spots) : '—' }),
      cites: [...o.best, ...o.worst].map((p) => `outcome.player:${p.personIndex}`).filter((id) => ids.has(id)),
    });
  }
  return out;
}
