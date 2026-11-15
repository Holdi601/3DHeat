/**
 * What an external model is sent: the insight report as the seam gives it
 * (`reportForModel`: sentences, numbers, places, filters by name) or the
 * caster's moments, with a few totals for context - never rows. Player names
 * are replaced by P1, P2... unless the user allows them; the replacement runs
 * over every string, so a name inside a sentence goes too. The dataset's own
 * name (often a file name) goes only with the names.
 */

import { LANGUAGES } from '../../i18n/languages';
import { fullCite } from '../knowledge';
import { topEntries, type LensPick } from '../lens';
import { cqbNames } from '../cqb/shows';
import { reportForModel } from '../seam';
import type { InsightReport } from '../types';
import type { Moment } from '../cast/moments';
import type { ChatPrompt } from './provider';

const languageName = (code: string) => {
  const own = LANGUAGES.find((l) => l.code === code)?.name ?? code;
  return code === 'en' ? own : `${own} (${code})`;
};

/** Replaces each name in every string of a JSON value; longer names first, so one inside another is not split. */
export function pseudonymize<T>(value: T, names: Map<string, string>): T {
  const list = [...names.keys()].filter((n) => n.trim().length >= 2).sort((a, b) => b.length - a.length);
  if (!list.length) return value;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(list.map(esc).join('|'), 'g');
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return v.replace(re, (m) => names.get(m) ?? m);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(value) as T;
}

/** P1, P2... for the names, in the order given. */
export function aliases(names: Iterable<string>): Map<string, string> {
  const m = new Map<string, string>();
  for (const n of names) if (n && !m.has(n)) m.set(n, `P${m.size + 1}`);
  return m;
}

/** The names a report mentions: subjects, person filters and the `player` value of sentences. */
function reportNames(r: InsightReport): string[] {
  const out: string[] = [];
  for (const i of r.insights) {
    if (i.subject.person) out.push(i.subject.person);
    for (const f of i.filters) if (f.by === 'person') out.push(...f.values);
    const p = i.sentence.params.player;
    if (typeof p === 'string') out.push(p);
  }
  out.push(...cqbNames(r.lens?.cqb));
  return out;
}

const MAX_FINDINGS = 30;

export interface PromptOptions {
  language: string;
  names: boolean;
  question?: string;
  /** The knowledge lens to ground the debrief in; false sends no knowledge. */
  lens?: LensPick | false;
}

/** Knowledge entries sent with a debrief at most. */
const MAX_KNOWLEDGE = 14;

/** The knowledge base entries most relevant to the report, as a model reads them (`lens.ts`). */
export function knowledgeForModel(r: InsightReport, lens: LensPick = 'auto') {
  const top = topEntries(r, lens, MAX_KNOWLEDGE * 2);
  // Concepts and literature first, but always a few historical parallels.
  const cases = top.filter((x) => x.entry.type === 'case').slice(0, 5);
  const rest = top.filter((x) => x.entry.type !== 'case').slice(0, MAX_KNOWLEDGE - cases.length);
  return [...rest, ...cases].map(({ entry: e, score, about }) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    relevance: Math.round(score * 100) / 100,
    about,
    summary: e.summary,
    lesson: e.lesson,
    ...(e.measure ? { measure: e.measure } : {}),
    ...(e.when ? { when: e.when, where: e.where, outcome: e.outcome } : {}),
    references: e.refs.map(fullCite),
  }));
}

export function debriefPrompt(r: InsightReport, say: (key: string, params: Record<string, number | string>) => string, opt: PromptOptions): ChatPrompt {
  // The strongest findings are what a debrief says; the rest would only make the request longer.
  const top = { ...r, insights: [...r.insights].sort((a, b) => b.strength - a.strength).slice(0, MAX_FINDINGS) };
  let report = reportForModel(top, say);
  if (!opt.names) {
    report = pseudonymize({ ...report, dataset: { ...report.dataset, name: '' } }, aliases(reportNames(top)));
  }
  const knowledge = opt.lens === false ? [] : knowledgeForModel(top, opt.lens ?? 'auto');
  const system = [
    'You write the debrief of a gameplay analysis for players, coaches and level designers.',
    'You get the findings of a statistical engine as JSON: each with an id, a sentence, an effect (a ratio; 1 means like the rest of the map) with its 95% interval, p and q values, the counts behind it, a place in world units and filters.',
    'Write a short debrief: what stands out most, what it means for tactics, what it means for balance, and how sure each point is. Say only what the numbers support; never invent numbers, places or names. Cite each finding you use by its id in square brackets, like [power.kd:3:4].',
    ...(knowledge.length
      ? [
          'The report\'s "lens" holds measures of military operations analysis (a Lanchester fit of losses on strengths, local force ratios at kills, exchange ratios, viewsheds of kill places, energy states of aircraft, persistent hotspots, trade rate, first-strike advantage); its "behaviour" holds measures of collective behaviour, each with its own null model, p and q (group alignment and milling, route herding, lanes and trails, crowding, leader-follower lags, straggling, the breaking point under losses, risk after losses, streaks with the Miller-Sanjurjo correction, buy agreement, reaction to fire). You also get "knowledge": entries of a curated knowledge base - doctrine, operations research, historical battles, game and level design, analytics studies - each with its references and the findings it relates to (about).',
          ...(top.lens?.cqb
            ? ['The lens\'s "cqb" holds close-quarters and esports measures: a round win-probability model fitted to these rounds with its out-of-fold calibration, the win probability each kind of action added, opening duels, trades, peeker against holder, aim before the duel, crossfires, utility before entries, man advantage, clutches against the model, stacks, rotations, lurks, post-plant and retake, fatal funnels by place and player impact (shrunk win probability added, ridge plus-minus); every share has a 95% interval and every test a q over all of them.']
            : []),
          'Judge the findings through that literature like a professional analyst: name the concept that explains a finding, and where a historical case genuinely shares its pattern, give it as a parallel with its date and outcome. Cite entries by id in curly braces, like {concept.lanchester-square}, and name their sources as author and year. Use only the entries and references given; never invent sources, quotes or historical facts. Say where a parallel stops holding.',
        ]
      : []),
    `Write in ${languageName(opt.language)}. Plain text, short paragraphs, no headings or tables; at most about ${knowledge.length ? 350 : 250} words.`,
  ].join('\n');
  const user = `${opt.question?.trim() ? `Question: ${opt.question.trim()}\n\n` : ''}Report:\n${JSON.stringify(report)}${knowledge.length ? `\n\nKnowledge:\n${JSON.stringify(knowledge)}` : ''}`;
  return { system, user, maxTokens: 16000 };
}

export interface CastContext {
  /** Players by unit index, and teams by index. */
  player: (unit: number) => string;
  team: (team: number) => string;
  /** The vehicle class of each side of the moment, where known. */
  className: (cls: string) => string;
}

/** The moments for a caster's lines: one line per moment, `m3: ...`. */
export function castPrompt(moments: Moment[], ctx: CastContext, opt: PromptOptions): ChatPrompt {
  const who = (u: number) => (u >= 0 ? ctx.player(u) : '');
  const list: Record<string, string | number>[] = moments.map((m) => ({
    id: m.id,
    kind: m.kind,
    at: Math.round(m.time),
    player: who(m.actor),
    other: who(m.other),
    team: m.team >= 0 ? ctx.team(m.team) : '',
    ...Object.fromEntries(
      Object.entries(m.params).map(([k, v]) => [k, k === 'victim' && typeof v === 'number' ? who(v) : k === 'class' && typeof v === 'string' ? ctx.className(v) : v]),
    ),
  }));
  const names = aliases(list.flatMap((m) => [m.player, m.other, m.victim].filter((x): x is string => typeof x === 'string')));
  const data = opt.names ? list : pseudonymize(list, names);
  const system = [
    'You are an esports caster commenting on a replay. You get its key moments as JSON (time in seconds, kind, the players, numbers).',
    'For each moment write one vivid, short line (at most 25 words) a caster would say as it happens. Use only the facts given; no invented names or numbers.',
    `Answer in ${languageName(opt.language)}, one line per moment, each starting with its id and a colon, like "m3: ...". Nothing else.`,
  ].join('\n');
  return { system, user: `Moments:\n${JSON.stringify(data)}`, maxTokens: 16000 };
}

/** Lines `m3: text` out of a (possibly partial) answer. */
export function parseCastLines(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*[-*]?\s*\[?(m\d+)\]?\s*[:：\-–—]\s*(.+?)\s*$/.exec(line);
    if (m) out.set(m[1], m[2]);
  }
  return out;
}

/** The insight ids an answer cites, in order, of those the report has. */
export function citedIds(text: string, ids: Set<string>): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\[([^\]\s]+)\]/g)) if (ids.has(m[1]) && !out.includes(m[1])) out.push(m[1]);
  return out;
}
