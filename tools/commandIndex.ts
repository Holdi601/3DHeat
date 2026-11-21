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
 *
 * Labels that are not written where they are drawn are found as well:
 * - a table or a function at the top of a module (`const TOOLS = [{ label:
 *   'volumes.tool.box' }]`, `function presetLabel() { return t('...') }`),
 *   here or imported, used by code inside a section: the keys the table
 *   holds, the keys the function returns;
 * - the same in a component (`const word = { soft: 'heat.heatPanel...' }`,
 *   `const label = t('...')`), wherever the component uses the name;
 * - keys built at run time from a list written in place,
 *   `(['figure', 'arrow'] as const).map((m) => t(`far.${m}`))`: each one.
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
  /** The component's own names that hold label keys (a table, a `t()` kept in a const). */
  vars?: Map<string, { keys: string[]; table: boolean }>;
  /** Names bound to each of a list of words (`[...].map((m) => ...)`), for keys built from them. */
  subst?: Map<string, string[]>;
}

interface Source {
  file: string;
  /** Components defined here, by name. */
  defs: Map<string, Node>;
  /** Imported names: local name -> [file, exported name]. */
  imports: Map<string, [string, string]>;
  /** Everything declared at the top of the module, by name: the tables and functions labels may be kept in. */
  tables: Map<string, Node>;
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
  // A name to search for: short, and a word in it (not a separator such as ", ").
  const isLabel = (k: string) => isKey(k) && english[k].length <= MAX_LABEL && /\p{L}{2}/u.test(english[k]);

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
    const tables = new Map<string, Node>();
    for (let st of ast.body as Node[]) {
      if ((st.type === 'ExportNamedDeclaration' || st.type === 'ExportDefaultDeclaration') && isNode(st.declaration)) st = st.declaration;
      if (st.type === 'FunctionDeclaration' && isNode(st.id)) {
        tables.set(st.id.name as string, st);
        if (/^[A-Z]/.test(st.id.name as string)) defs.set(st.id.name as string, st);
      } else if (st.type === 'VariableDeclaration')
        for (const d of st.declarations as Node[]) {
          const id = d.id as Node;
          if (id.type !== 'Identifier' || !isNode(d.init)) continue;
          tables.set(id.name as string, d.init);
          if (/^[A-Z]/.test(id.name as string)) defs.set(id.name as string, d.init);
        }
      else if (st.type === 'ImportDeclaration') {
        const spec = (st.source as Node).value as string;
        const target = spec.startsWith('.') ? resolveModule(dirname(file), spec) : null;
        if (target)
          for (const sp of st.specifiers as Node[])
            if (sp.type === 'ImportSpecifier') imports.set((sp.local as Node).name as string, [target, ((sp.imported as Node).name ?? (sp.imported as Node).value) as string]);
      }
    }
    const s = { file, defs, imports, tables };
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

  /** Where an expression is read: its module and the component's names, to look a name up in. */
  interface Scope {
    src: Source;
    ctx: Ctx;
  }

  /**
   * The message keys an expression names: `t('k')`, either side of a
   * condition, and with `wide` every key a `t(`prefix.${x}`)` can name (just
   * the ones its listed words make, when it is built from such a list). With a
   * scope, also what a name stands for, `t(table[k])`, and what a function
   * called here returns (`presetLabel(p)`).
   */
  const keysOf = (e: unknown, wide = false, subst?: Map<string, string[]>, scope?: Scope): string[] => {
    if (!isNode(e)) return [];
    e = strip(e);
    const n = e as Node;
    const callee = n.type === 'CallExpression' ? strip(n.callee as Node) : null;
    if (callee?.type === 'Identifier' && callee.name === 't') {
      const args = n.arguments as Node[];
      if (!args.length) return [];
      const arg = strip(args[0]);
      if (arg.type === 'Literal' && typeof arg.value === 'string') return isKey(arg.value) ? [arg.value] : [];
      if (args.length !== 1 || !wide) return [];
      if (arg.type === 'TemplateLiteral') {
        const quasis = (arg.quasis as Node[]).map((q) => (q.value as { cooked: string }).cooked ?? '');
        const exprs = (arg.expressions as Node[]).map(strip);
        // Built from words listed in place: exactly the keys those words make.
        const lists = exprs.map((x) => (x.type === 'Identifier' ? subst?.get(x.name as string) : undefined));
        if (lists.length && lists.every((l) => !!l)) {
          let made = [quasis[0]];
          lists.forEach((l, i) => (made = made.flatMap((m) => l!.map((w) => `${m}${w}${quasis[i + 1]}`))));
          return made.filter(isKey);
        }
        const parts = quasis.map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        // A key named by its start: `heat.viewPanel.camera.preset.${p}`, never a bare `${x}`.
        if (parts[0].split('.').length < 3) return [];
        const re = new RegExp(`^${parts.join('[\\w-]+')}$`);
        return keyList.filter((k) => re.test(k) && isKey(k));
      }
      // `t(word[p])`, `t(TOOLS[i].label)`: the keys the table it is read from holds.
      let root = arg;
      while (root.type === 'MemberExpression') root = strip(root.object as Node);
      return scope && root.type === 'Identifier' ? nameKeys(scope, root.name as string, false) : [];
    }
    if (n.type === 'ConditionalExpression') return [...keysOf(n.consequent, wide, subst, scope), ...keysOf(n.alternate, wide, subst, scope)];
    if (n.type === 'LogicalExpression') return [...keysOf(n.left, wide, subst, scope), ...keysOf(n.right, wide, subst, scope)];
    if (!wide) return [];
    // A label kept under a name: `{redetectLabel}`.
    if (scope && n.type === 'Identifier') return nameKeys(scope, n.name as string, false);
    if (callee) {
      // What a function called here returns, and a helper drawing a control given its label: `field('yaw', t('...'))`.
      const made = scope && callee.type === 'Identifier' ? nameKeys(scope, callee.name as string, false) : [];
      return [...made, ...(n.arguments as Node[]).flatMap((a) => keysOf(a, false, subst)).filter((k) => isTableLabel(k))];
    }
    return [];
  };

  /** A key written as a plain string in a table: a label, not a tooltip or a hint kept beside it. */
  const isTableLabel = (k: string) => isLabel(k) && !/[a-z](Title|Hint|Tip)$/.test(k);

  /** What a name holds: its label keys, and whether it is a table (a list or a record) rather than a function or a value. */
  interface Held {
    keys: string[];
    table: boolean;
  }
  const NONE: Held = { keys: [], table: false };

  /**
   * The label keys held by a table or returned by a function: every key a
   * string or a `t()` in it names, and those of the names it uses in turn.
   * Only tables (arrays, records) and functions: a store or a hook made by a
   * call is not a list of labels.
   */
  const heldKeys = (src: Source, node: Node, depth: number): Held => {
    const keys: string[] = [];
    // A key built into a const first: `const key = `tactics.figure.${name}`; ... t(key)`.
    const built = new Map<string, Node>();
    const consts = (n: Node) => {
      if (n.type === 'VariableDeclarator' && (n.id as Node).type === 'Identifier' && isNode(n.init) && strip(n.init).type === 'TemplateLiteral') built.set((n.id as Node).name as string, strip(n.init));
      for (const [k, v] of Object.entries(n)) {
        if (SKIP.has(k)) continue;
        if (Array.isArray(v)) v.forEach((c) => isNode(c) && consts(c));
        else if (isNode(v)) consts(v);
      }
    };
    consts(node);
    const scan = (n: Node) => {
      if (n.type === 'Literal' && typeof n.value === 'string') {
        if (isTableLabel(n.value)) keys.push(n.value);
        return;
      }
      if (n.type === 'CallExpression' && (n.callee as Node).type === 'Identifier' && (n.callee as Node).name === 't') {
        const arg = (n.arguments as Node[])[0];
        const tpl = arg && arg.type === 'Identifier' ? built.get(arg.name as string) : undefined;
        keys.push(...keysOf(tpl ? { ...n, arguments: [tpl] } : n, true).filter(isTableLabel));
        return;
      }
      if (n.type === 'Identifier' && depth < 3) keys.push(...namedKeys(src, n.name as string, depth + 1).keys);
      for (const [k, v] of Object.entries(n)) {
        if (SKIP.has(k) || (k === 'key' && n.type === 'Property' && !n.computed) || (k === 'property' && n.type === 'MemberExpression' && !n.computed)) continue;
        if (Array.isArray(v)) v.forEach((c) => isNode(c) && scan(c));
        else if (isNode(v)) scan(v);
      }
    };
    const body = strip(node);
    if (body.type === 'ArrayExpression' || body.type === 'ObjectExpression') {
      scan(body);
      return { keys: [...new Set(keys)], table: true };
    }
    if (body.type !== 'FunctionDeclaration' && body.type !== 'ArrowFunctionExpression' && body.type !== 'FunctionExpression') return NONE;
    // What it returns.
    const fn = body.body as Node;
    const returns = (n: Node) => {
      if (n.type === 'ReturnStatement' && isNode(n.argument)) scan(n.argument);
      for (const [k, v] of Object.entries(n)) {
        if (SKIP.has(k)) continue;
        if (Array.isArray(v)) v.forEach((c) => isNode(c) && returns(c));
        else if (isNode(v)) returns(v);
      }
    };
    if (fn.type === 'BlockStatement') returns(fn);
    else scan(fn);
    return { keys: [...new Set(keys)], table: false };
  };

  const tableCache = new Map<string, Held>();
  /** What a name at the top of a module holds, here or imported (cached). */
  const namedKeys = (src: Source, name: string, depth = 0): Held => {
    let home: Source | null = src;
    let local = name;
    if (!src.tables.has(name)) {
      const imp = src.imports.get(name);
      home = imp ? load(imp[0]) : null;
      local = imp ? imp[1] : name;
    }
    const node = home?.tables.get(local);
    if (!home || !node) return NONE;
    const id = `${home.file}#${local}`;
    let held = tableCache.get(id);
    if (!held) {
      tableCache.set(id, NONE); // a table naming itself
      held = heldKeys(home, node, depth);
      tableCache.set(id, held);
    }
    return held;
  };

  /** The label keys a name stands for: the component's own names first, then the module's; with `tables`, only a table's. */
  const nameKeys = (scope: Scope, name: string, tables: boolean): string[] => {
    const held = scope.ctx.vars?.get(name) ?? namedKeys(scope.src, name);
    return tables && !held.table ? [] : held.keys;
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
    walk(home, def, { ...ctx, pending: optionLabels(def), vars: new Map(), subst: undefined });
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
        if (ctx.path.length && (node.key as Node).type === 'Identifier' && (node.key as Node).name === 'label') for (const k of keysOf(node.value, true, ctx.subst, { src, ctx }).filter(isLabel)) add(ctx, k);
        break;
      case 'VariableDeclarator': {
        // The component's own: `const label = t('...')`, `const word = { soft: 'heat...' }`, `const name = () => t(...)`.
        const id = node.id as Node;
        const init = isNode(node.init) ? strip(node.init) : null;
        if (ctx.vars && id.type === 'Identifier' && init) {
          const held = /^(Array|Object)Expression$|Function/.test(init.type)
            ? heldKeys(src, init, 0)
            : { keys: [...new Set(keysOf(init, true, ctx.subst, { src, ctx }).filter(isLabel))], table: false };
          if (held.keys.length) ctx.vars.set(id.name as string, held);
        }
        if (init) walk(src, init, ctx);
        return;
      }
      case 'CallExpression': {
        // `(['figure', 'arrow'] as const).map((m) => ...)`: inside, m is each of the words.
        const callee = node.callee as Node;
        const fn = (node.arguments as Node[])[0];
        const method = callee.type === 'MemberExpression' && !callee.computed ? ((callee.property as Node).name as string) : '';
        const list = method === 'map' ? strip(callee.object as Node) : null;
        const param = fn && /Function/.test(fn.type) ? (fn.params as Node[])[0] : null;
        // `TOOLS.map(...)`, `Object.entries(word).map(...)` in a section: a table drawn as controls, its labels.
        if (ctx.path.length && /^(map|flatMap|filter|forEach)$/.test(method)) {
          let root: Node | undefined = strip(callee.object as Node);
          for (let i = 0; i < 8 && root; i++) {
            if (root.type === 'MemberExpression') root = strip(root.object as Node);
            else if (root.type === 'CallExpression') {
              const c = strip(root.callee as Node);
              if (c.type !== 'MemberExpression') break;
              const of = strip(c.object as Node);
              // Object.entries(x), Object.keys(x): x; x.filter(...): x.
              root = of.type === 'Identifier' && of.name === 'Object' ? (root.arguments as Node[])[0] && strip((root.arguments as Node[])[0]) : of;
            } else break;
          }
          if (root?.type === 'Identifier') for (const k of nameKeys({ src, ctx }, root.name as string, true)) add(ctx, k);
        }
        if (list?.type === 'ArrayExpression' && param?.type === 'Identifier') {
          const words = (list.elements as Node[]).map((e) => (isNode(e) && e.type === 'Literal' && typeof e.value === 'string' ? e.value : null));
          if (words.length && words.every((w) => w !== null)) {
            const subst = new Map(ctx.subst ?? []);
            subst.set(param.name as string, words as string[]);
            walk(src, fn.body as Node, { ...ctx, subst });
            return;
          }
        }
        break;
      }
    }
    for (const [k, v] of Object.entries(node)) {
      if (SKIP.has(k)) continue;
      // `x.label`, `{ label: ... }`: a field's name, not a name in scope.
      if ((k === 'property' && node.type === 'MemberExpression' && !node.computed) || (k === 'key' && node.type === 'Property' && !node.computed)) continue;
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
      inner = { tab: ctx.tab, mode: ctx.mode, path: [...ctx.path, keys[0]], vars: ctx.vars, subst: ctx.subst };
      add(inner);
      // The options the component listed before drawing this, its first section.
      for (const k of ctx.pending ?? []) add(inner, k);
      ctx.pending = undefined;
    } else if (ctx.path.length) {
      const scope = { src, ctx };
      for (const attr of ['label', 'options']) for (const k of keysOf(attrs.get(attr), true, ctx.subst, scope).filter(isLabel)) add(ctx, k);
      // The words of a button, a label, an option, a heading...: whatever a control is found by on the page.
      for (const c of node.children as Node[]) if (c.type === 'JSXExpressionContainer') for (const k of keysOf(c.expression, true, ctx.subst, scope).filter(isLabel)) add(ctx, k);
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
