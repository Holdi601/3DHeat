/**
 * The text form of Enfusion's entity files (Arma Reforger): what the
 * Workbench saves a world's layers in (`.layer`, `.ent` saved as text) and
 * what prefabs (`.et`) and configs (`.conf`) are written in.
 *
 *     SCR_AIGroup Alpha : "{GUID}Prefabs/Groups/....et" {
 *      coords 1029.173 12 3325.666
 *      angleY -90
 *      m_aStaticWaypoints {
 *       "WP1" "WP2"
 *      }
 *      components {
 *       SomeComponent "{GUID}" {
 *        m_Value 2
 *       }
 *      }
 *      {
 *       GenericEntity : "{GUID}Prefabs/....et" {
 *        coords 1 0 -3
 *       }
 *      }
 *     }
 *
 * A statement is a line: a key and its values (numbers, bare words, quoted
 * strings), or a key (or a head of several words) ending in `{`, which opens
 * a block. A block with no head holds an entity's child entities. Read with
 * every token's place in the text, so a writer can change a value and leave
 * the rest of the file as it was, byte for byte (`reforgerWrite.ts`).
 */

export interface EnfToken {
  /** The token as written (a string with its quotes). */
  raw: string;
  start: number;
  end: number;
  /** A quoted string. */
  quoted: boolean;
  /** The first token on its line. */
  nl: boolean;
}

/** A statement that opens no block: a key and its values, or an array's items. */
export interface EnfLine {
  tokens: EnfToken[];
  start: number;
  end: number;
}

/** A block: its head (the words before `{`, none for a list of child entities), its lines and blocks. */
export interface EnfNode {
  head: EnfToken[];
  /** Where the head starts (the `{` when it has none); -1 for the file. */
  start: number;
  open: number;
  close: number;
  /** Just after the `}`. */
  end: number;
  lines: EnfLine[];
  nodes: EnfNode[];
}

const PUNCT = new Set(['{', '}']);

function tokenize(s: string): EnfToken[] {
  const out: EnfToken[] = [];
  let i = 0;
  let nl = true;
  const n = s.length;
  while (i < n) {
    const c = s[i];
    if (c === '\n') {
      nl = true;
      i++;
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v' || c === '﻿') {
      i++;
      continue;
    }
    if (c === '/' && s[i + 1] === '/') {
      const e = s.indexOf('\n', i);
      i = e < 0 ? n : e;
      continue;
    }
    if (c === '/' && s[i + 1] === '*') {
      const e = s.indexOf('*/', i + 2);
      const stop = e < 0 ? n : e + 2;
      if (s.slice(i, stop).includes('\n')) nl = true;
      i = stop;
      continue;
    }
    const start = i;
    if (c === '"') {
      i++;
      while (i < n && s[i] !== '"') i += s[i] === '\\' ? 2 : 1;
      if (i >= n) throw new Error(`Enfusion text: a string at ${lineOf(s, start)} does not end`);
      i++;
      out.push({ raw: s.slice(start, i), start, end: i, quoted: true, nl });
    } else if (PUNCT.has(c)) {
      i++;
      out.push({ raw: c, start, end: i, quoted: false, nl });
    } else {
      while (i < n && !/[\s{}"]/.test(s[i])) i++;
      out.push({ raw: s.slice(start, i), start, end: i, quoted: false, nl });
    }
    nl = false;
  }
  return out;
}

const lineOf = (s: string, at: number) => `line ${s.slice(0, at).split('\n').length}`;

/** Reads the text into its blocks; the file itself is the outermost block (no head, no braces). */
export function parseEnfusion(text: string): EnfNode {
  const tokens = tokenize(text);
  let pos = 0;
  const body = (node: EnfNode, top: boolean): void => {
    while (pos < tokens.length) {
      const tk = tokens[pos];
      if (tk.raw === '}' && !tk.quoted) {
        if (top) throw new Error(`Enfusion text: a "}" with no block at ${lineOf(text, tk.start)}`);
        node.close = tk.start;
        node.end = tk.end;
        pos++;
        return;
      }
      if (tk.raw === '{' && !tk.quoted) {
        const child: EnfNode = { head: [], start: tk.start, open: tk.start, close: -1, end: -1, lines: [], nodes: [] };
        pos++;
        body(child, false);
        node.nodes.push(child);
        continue;
      }
      const stmt = [tk];
      pos++;
      while (pos < tokens.length && !tokens[pos].nl && !(PUNCT.has(tokens[pos].raw) && !tokens[pos].quoted)) stmt.push(tokens[pos++]);
      const next = tokens[pos];
      if (next && next.raw === '{' && !next.quoted && !next.nl) {
        const child: EnfNode = { head: stmt, start: tk.start, open: next.start, close: -1, end: -1, lines: [], nodes: [] };
        pos++;
        body(child, false);
        node.nodes.push(child);
      } else node.lines.push({ tokens: stmt, start: stmt[0].start, end: stmt[stmt.length - 1].end });
    }
    if (!top) throw new Error(`Enfusion text: a block from ${lineOf(text, node.start)} does not end`);
  };
  const root: EnfNode = { head: [], start: -1, open: -1, close: text.length, end: text.length, lines: [], nodes: [] };
  body(root, true);
  return root;
}

/** A token's text: a string without its quotes and escapes. */
export function enfText(t: EnfToken | undefined): string {
  if (!t) return '';
  if (!t.quoted) return t.raw;
  return t.raw.slice(1, -1).replace(/\\(.)/g, '$1');
}

/** A string as the text writes one. */
export function enfQuote(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** A number as the Workbench writes one: up to three decimals, no trailing zeros. */
export function enfNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const s = n.toFixed(3).replace(/\.?0+$/, '');
  return s === '-0' || s === '' ? '0' : s;
}

/** A block's line of that key (its first token), or undefined. */
export function enfLine(node: EnfNode | null | undefined, key: string): EnfLine | undefined {
  return node?.lines.find((l) => !l.tokens[0].quoted && l.tokens[0].raw === key);
}

/** The values of a block's line of that key, as text. */
export function enfValues(node: EnfNode | null | undefined, key: string): string[] {
  return enfLine(node, key)?.tokens.slice(1).map(enfText) ?? [];
}

/** The first value of a line, as text ('' when there is none). */
export const enfValue = (node: EnfNode | null | undefined, key: string): string => enfValues(node, key)[0] ?? '';

/** A block's numbers of a line (`coords 1 2 3`), or null when the line is missing or not all numbers. */
export function enfNumbers(node: EnfNode | null | undefined, key: string, count: number): number[] | null {
  const v = enfValues(node, key).map(Number);
  return v.length >= count && v.slice(0, count).every(Number.isFinite) ? v.slice(0, count) : null;
}

/** A nested block by its head's first word (`components`, `m_aStaticWaypoints`). */
export function enfChild(node: EnfNode | null | undefined, key: string): EnfNode | undefined {
  return node?.nodes.find((n) => n.head.length && !n.head[0].quoted && n.head[0].raw === key);
}

/** Every value inside a block's lines, in order, as text: an array's items. */
export function enfItems(node: EnfNode | null | undefined): string[] {
  return node ? node.lines.flatMap((l) => l.tokens.map(enfText)) : [];
}

/** What an entity block's head says: its class, its name, its prefab. */
export function enfHead(node: EnfNode): { cls: string; name: string; prefab: string } {
  const h = node.head;
  const colon = h.findIndex((t) => !t.quoted && t.raw === ':');
  const own = colon < 0 ? h : h.slice(0, colon);
  return { cls: own[0] ? enfText(own[0]) : '', name: own[1] ? enfText(own[1]) : '', prefab: colon >= 0 ? enfText(h[colon + 1]) : '' };
}

/** An entity's child entities: the blocks of its head-less blocks. */
export function enfChildEntities(node: EnfNode): EnfNode[] {
  return node.nodes.filter((n) => !n.head.length).flatMap((b) => b.nodes.filter((c) => c.head.length));
}

/** The whitespace a line starts with, for the line holding `at`. */
export function enfIndent(text: string, at: number): string {
  const ls = text.lastIndexOf('\n', at - 1) + 1;
  let i = ls;
  while (i < text.length && (text[i] === ' ' || text[i] === '\t')) i++;
  return text.slice(ls, i);
}

/** The line break a file uses. */
export const enfEol = (text: string): string => (/\r\n/.test(text) ? '\r\n' : '\n');

/** One level of indentation in a file: what its first indented line uses (the Workbench writes one space). */
export function enfIndentUnit(text: string): string {
  const m = /\n([ \t]+)\S/.exec(text);
  if (!m) return ' ';
  return m[1][0] === '\t' ? '\t' : ' '.repeat(Math.min(8, m[1].length));
}

/** A block as text: `head {`, its lines one level in (a nested array is a block), `}`. */
export type EnfOut = string | [string, EnfOut[]];
export function enfBlockText(head: string, lines: EnfOut[], indent: string, unit: string, eol: string): string {
  const inner = indent + unit;
  const body = lines.map((l) => (typeof l === 'string' ? `${inner}${l}${eol}` : `${inner}${enfBlockText(l[0], l[1], inner, unit, eol)}${eol}`)).join('');
  return `${head ? `${head} ` : ''}{${eol}${body}${indent}}`;
}
