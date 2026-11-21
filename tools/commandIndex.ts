/**
 * The command palette's index of the whole side panel (ui/shell/commands.ts):
 * every section and every labelled control in it, on every workspace, read
 * from the source rather than from a running page, so it is built with the
 * viewer itself and a new panel is in Ctrl+K as soon as it is in the code.
 *
 * Served to the page as `virtual:command-index` by the plugin in
 * vite.config.ts (dev server, build and tests alike); `node
 * tools/commandIndex.ts` prints it.
 *
 * How it reads the code: from the side panel in App.tsx (`<aside
 * className="sidebar">`), the workspace each branch of its `vehicleTab ? ...
 * : planTab ? ...` chain belongs to, and from there every component it draws,
 * followed through the imports: every `<Section title={t('key')}>` (a path of
 * section ids, outermost first, as `data-section` on the page) and in a
 * section every `label={t('key')}`, every `label: t('key')` of an option, and
 * every `{t('key')}` that is the text of a button, label or summary. Only
 * messages without values are kept: they are what a label reads back to.
 * Every branch of a condition is followed, so a section shown only with data,
 * or only in one view mode (`mode === 'heat-lines' && ...`, recorded, so the
 * palette can switch to it), is in the index too.
 */

import { parseAst } from 'rolldown/parseAst';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export interface IndexEntry {
  tab: string;
  mode?: string;
  path: string[];
  label?: string;
}

/** An ESTree node, as the parser gives it. */
type Node = { type: string; [k: string]: unknown };

interface Ctx {
  tab: string;
  mode?: string;
  path: string[];
  /** Option labels a component wrote before its JSX: given to the first section it opens. */
  pending?: string[];
}

interface Source {
  file: string;
  /** Components defined here, by name. */
  defs: Map<string, Node>;
  /** Imported names: local name -> [file, exported name]. */
  imports: Map<string, [string, string]>;
}

const TAB_OF: Record<string, string> = { vehicleTab: 'vehicle', planTab: 'plan', raceTab: 'race', matchTab: 'match' };
/** The longest label kept: longer text is a sentence, not a name to search for. */
const MAX_LABEL = 60;
const SKIP = new Set(['start', 'end', 'range', 'loc', 'typeAnnotation', 'typeArguments', 'typeParameters', 'returnType', 'decorators']);

const isNode = (v: unknown): v is Node => !!v && typeof v === 'object' && typeof (v as Node).type === 'string';

function strip(e: Node): Node {
  while (e.type === 'ParenthesizedExpression' || e.type === 'TSAsExpression' || e.type === 'TSNonNullExpression' || e.type === 'TSSatisfiesExpression') e = e.expression as Node;
  return e;
}

function tagName(n: Node): string {
  if (n.type === 'JSXIdentifier') return n.name as string;
  if (n.type === 'JSXMemberExpression') return `${tagName(n.object as Node)}.${tagName(n.property as Node)}`;
  return '';
}

/**
 * A view-mode condition: the mode its true side shows in, and the false
 * side's where it is one mode (the figure replay or the heat).
 */
function modeOf(cond: Node): [string, string | undefined] | null {
  cond = strip(cond);
  if (cond.type !== 'BinaryExpression' || cond.operator !== '===') return null;
  const l = cond.left as Node;
  const r = cond.right as Node;
  if (l.type !== 'Identifier' || r.type !== 'Literal' || typeof r.value !== 'string') return null;
  const v = r.value;
  if (l.name === 'mode') return [v, v === 'team' ? 'heat-simple' : undefined];
  if (l.name === 'matchView') return v === 'replay' ? ['team', 'heat-simple'] : ['heat-simple', 'team'];
  return null;
}

function resolveModule(dir: string, spec: string): string | null {
  const base = resolve(dir, spec);
  for (const p of [base, `${base}.tsx`, `${base}.ts`, join(base, 'index.tsx'), join(base, 'index.ts')]) if (existsSync(p) && /\.tsx?$/.test(p)) return p;
  return null;
}

export function buildCommandIndex(root: string): IndexEntry[] {
  const src = join(root, 'src');
  const english: Record<string, string> = {};
  const enDir = join(src, 'i18n', 'locales', 'en');
  for (const f of readdirSync(enDir)) if (f.endsWith('.json')) Object.assign(english, JSON.parse(readFileSync(join(enDir, f), 'utf8')));
  const isKey = (k: string) => typeof english[k] === 'string' && !english[k].includes('{');
  const isLabel = (k: string) => isKey(k) && english[k].length <= MAX_LABEL;

  const sources = new Map<string, Source | null>();
  const load = (file: string): Source | null => {
    if (sources.has(file)) return sources.get(file)!;
    let ast: Node;
    try {
      ast = parseAst(readFileSync(file, 'utf8'), { lang: file.endsWith('x') ? 'tsx' : 'ts' }) as unknown as Node;
    } catch {
      sources.set(file, null);
      return null;
    }
    const defs = new Map<string, Node>();
    const imports = new Map<string, [string, string]>();
    for (let st of ast.body as Node[]) {
      if ((st.type === 'ExportNamedDeclaration' || st.type === 'ExportDefaultDeclaration') && isNode(st.declaration)) st = st.declaration;
      if (st.type === 'FunctionDeclaration' && isNode(st.id) && /^[A-Z]/.test(st.id.name as string)) defs.set(st.id.name as string, st);
      else if (st.type === 'VariableDeclaration')
        for (const d of st.declarations as Node[]) {
          const id = d.id as Node;
          if (id.type === 'Identifier' && /^[A-Z]/.test(id.name as string) && isNode(d.init)) defs.set(id.name as string, d.init);
        }
      else if (st.type === 'ImportDeclaration') {
        const spec = (st.source as Node).value as string;
        const target = spec.startsWith('.') ? resolveModule(dirname(file), spec) : null;
        if (target)
          for (const sp of st.specifiers as Node[])
            if (sp.type === 'ImportSpecifier') imports.set((sp.local as Node).name as string, [target, ((sp.imported as Node).name ?? (sp.imported as Node).value) as string]);
      }
    }
    const s = { file, defs, imports };
    sources.set(file, s);
    return s;
  };

  const out = new Map<string, IndexEntry>();
  const add = (ctx: Ctx, label?: string) => {
    if (!ctx.path.length) return;
    const sig = `${ctx.tab}|${ctx.path.join('>')}|${label ?? ''}`;
    const had = out.get(sig);
    if (had) {
      // Shown without a mode somewhere: no mode to switch to.
      if (had.mode && !ctx.mode) delete had.mode;
      return;
    }
    out.set(sig, { tab: ctx.tab, ...(ctx.mode ? { mode: ctx.mode } : {}), path: ctx.path, ...(label ? { label } : {}) });
  };

  const keyList = Object.keys(english);
  /**
   * The message keys an expression names: `t('k')`, either side of a
   * condition, and with `wide` every key a `t(`prefix.${x}`)` can name.
   */
  const keysOf = (e: unknown, wide = false): string[] => {
    if (!isNode(e)) return [];
    e = strip(e);
    const n = e as Node;
    if (n.type === 'CallExpression' && (n.callee as Node).type === 'Identifier' && (n.callee as Node).name === 't') {
      const args = n.arguments as Node[];
      if (args.length !== 1) return [];
      if (args[0].type === 'Literal' && typeof args[0].value === 'string') return isKey(args[0].value) ? [args[0].value] : [];
      if (wide && args[0].type === 'TemplateLiteral') {
        const parts = (args[0].quasis as Node[]).map((q) => ((q.value as { cooked: string }).cooked ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        // A key named by its start: `heat.viewPanel.camera.preset.${p}`, never a bare `${x}`.
        if (parts[0].split('.').length < 3) return [];
        const re = new RegExp(`^${parts.join('[\\w-]+')}$`);
        return keyList.filter((k) => re.test(k) && isKey(k));
      }
      return [];
    }
    if (n.type === 'ConditionalExpression') return [...keysOf(n.consequent, wide), ...keysOf(n.alternate, wide)];
    return [];
  };

  const seen = new Set<string>();
  let budget = 2_000_000;

  const component = (src: Source, name: string, ctx: Ctx) => {
    let def = src.defs.get(name);
    let home = src;
    if (!def) {
      const imp = src.imports.get(name);
      const other = imp && load(imp[0]);
      def = other ? other.defs.get(imp![1]) : undefined;
      if (!other || !def) return;
      home = other;
    }
    const sig = `${home.file}#${name}|${ctx.tab}|${ctx.mode ?? ''}|${ctx.path.join('>')}`;
    if (seen.has(sig)) return;
    seen.add(sig);
    walk(home, def, { ...ctx, pending: optionLabels(def) });
  };

  /** The `label: t('k')` of option lists written in a component's code, outside its JSX. */
  const optionLabels = (def: Node): string[] => {
    const keys: string[] = [];
    const scan = (n: Node) => {
      if (n.type === 'JSXElement' || n.type === 'JSXFragment') return;
      if (n.type === 'Property' && (n.key as Node).type === 'Identifier' && (n.key as Node).name === 'label') keys.push(...keysOf(n.value, true).filter(isLabel));
      for (const [k, v] of Object.entries(n)) {
        if (SKIP.has(k)) continue;
        if (Array.isArray(v)) v.forEach((c) => isNode(c) && scan(c));
        else if (isNode(v)) scan(v);
      }
    };
    scan(def);
    return keys;
  };

  /** Follows the code to its JSX, and the JSX. */
  const walk = (src: Source, node: Node, ctx: Ctx): void => {
    if (--budget < 0) return;
    switch (node.type) {
      case 'JSXElement':
        return jsx(src, node, ctx);
      case 'ConditionalExpression': {
        const m = modeOf(node.test as Node);
        walk(src, node.consequent as Node, m ? { ...ctx, mode: m[0] } : ctx);
        walk(src, node.alternate as Node, m ? { ...ctx, mode: m[1] ?? ctx.mode } : ctx);
        return;
      }
      case 'LogicalExpression':
        if (node.operator === '&&') {
          const m = modeOf(node.left as Node);
          walk(src, node.right as Node, m ? { ...ctx, mode: m[0] } : ctx);
          return;
        }
        break;
      case 'Property':
        // A label of an option in a list written where it is used.
        if (ctx.path.length && (node.key as Node).type === 'Identifier' && (node.key as Node).name === 'label') for (const k of keysOf(node.value, true).filter(isLabel)) add(ctx, k);
        break;
    }
    for (const [k, v] of Object.entries(node)) {
      if (SKIP.has(k)) continue;
      if (Array.isArray(v)) {
        for (const c of v) if (isNode(c)) walk(src, c, ctx);
      } else if (isNode(v)) walk(src, v, ctx);
    }
  };

  const jsx = (src: Source, node: Node, ctx: Ctx) => {
    const open = node.openingElement as Node;
    const tag = tagName(open.name as Node);
    const attrs = new Map<string, Node>();
    for (const a of open.attributes as Node[])
      if (a.type === 'JSXAttribute' && isNode(a.value) && a.value.type === 'JSXExpressionContainer' && isNode(a.value.expression))
        attrs.set((a.name as Node).name as string, a.value.expression);
    let inner = ctx;
    if (tag === 'Section') {
      const keys = keysOf(attrs.get('title'));
      if (!keys.length) return; // a title with a value in it: no id the palette can name
      for (const k of keys.slice(1)) add({ ...ctx, path: [...ctx.path, k] });
      inner = { tab: ctx.tab, mode: ctx.mode, path: [...ctx.path, keys[0]] };
      add(inner);
      // The options the component listed before drawing this, its first section.
      for (const k of ctx.pending ?? []) add(inner, k);
      ctx.pending = undefined;
    } else if (ctx.path.length) {
      for (const k of keysOf(attrs.get('label'), true).filter(isLabel)) add(ctx, k);
      // The words of a button, a label, an option, a heading...: whatever a control is found by on the page.
      for (const c of node.children as Node[]) if (c.type === 'JSXExpressionContainer') for (const k of keysOf(c.expression, true).filter(isLabel)) add(ctx, k);
    }
    // Elements handed over as props (`load={<LevelPanel />}`), and the rest of the attributes' code.
    for (const [name, e] of attrs) if (name !== 'title') walk(src, e, inner);
    if (/^[A-Z]/.test(tag) && tag !== 'Section' && !tag.includes('.')) component(src, tag, inner);
    for (const c of node.children as Node[]) walk(src, c, inner);
  };

  // The side panel in App.tsx, by workspace.
  const appFile = join(src, 'App.tsx');
  const app = load(appFile)!;
  const appAst = parseAst(readFileSync(appFile, 'utf8'), { lang: 'tsx' }) as unknown as Node;
  let aside: Node | undefined;
  const find = (n: Node) => {
    if (aside) return;
    if (n.type === 'JSXElement') {
      const open = n.openingElement as Node;
      const cls = (open.attributes as Node[]).find((a) => a.type === 'JSXAttribute' && (a.name as Node).name === 'className');
      if (tagName(open.name as Node) === 'aside' && cls && isNode(cls.value) && cls.value.value === 'sidebar') {
        aside = n;
        return;
      }
    }
    for (const [k, v] of Object.entries(n)) {
      if (SKIP.has(k)) continue;
      if (Array.isArray(v)) v.forEach((c) => isNode(c) && find(c));
      else if (isNode(v)) find(v);
    }
  };
  find(appAst);
  if (!aside) throw new Error('command index: no <aside className="sidebar"> in App.tsx');
  const byTab = (n: Node, tab: string): void => {
    if (n.type === 'JSXExpressionContainer') return byTab(n.expression as Node, tab);
    n = strip(n);
    const test = n.type === 'ConditionalExpression' ? (n.test as Node) : null;
    if (test && test.type === 'Identifier' && TAB_OF[test.name as string]) {
      byTab(n.consequent as Node, TAB_OF[test.name as string]);
      byTab(n.alternate as Node, tab);
      return;
    }
    walk(app, n, { tab, path: [] });
  };
  for (const c of aside.children as Node[]) byTab(c, 'heat');
  return [...out.values()];
}

// `node tools/commandIndex.ts`: the index, one entry a line.
if (process.argv[1] && /commandIndex\.ts$/.test(process.argv[1])) {
  const list = buildCommandIndex(resolve(import.meta.dirname, '..'));
  for (const e of list) console.log(JSON.stringify(e));
  console.error(`${list.length} entries`);
}
