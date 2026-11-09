/**
 * `.3dheat` containers (docs/container.md): one file per replay, a ZIP whose
 * tables are stored, not compressed, so each one is a byte range of the
 * container that is read in place like a file of its own.
 *
 * Opening a container reads its central directory (the tail) and its head
 * (the manifest and the first table's local header): two small reads,
 * nothing of the tables. Each table is handed on as a `File` over its byte
 * range - a slice of the container, which the browser reads lazily like the
 * container itself - so every loader, the many-match workers too, reads it
 * as it reads a loose `<match>.parquet`. Every other member (sidecars, the
 * match document, members of roles this viewer does not know) is read only
 * when asked for.
 *
 * Open to what comes later: any minor version of format 1 is read, fields
 * and roles this reader does not know are kept in `manifest` and left alone,
 * a role may have many members, and a container may hold several matches.
 */

import type { PickedFile } from './filePick';

export const CONTAINER_EXT = /\.3dheat$/i;

/** The major format version this reader reads (any minor). */
export const FORMAT_MAJOR = 1;

export function isContainer(name: string): boolean {
  return CONTAINER_EXT.test(name);
}

export interface ContainerMember {
  /** Its path in the container; may hold `/`. */
  name: string;
  /** Any string: `table`, `match`, `messages`, `flight`, ... or one this viewer does not know. */
  role: string;
  media_type?: string;
  compression: 'stored' | 'deflate';
  bytes: number;
  sha256: string;
  rows?: number | null;
  schema?: { id: string; version?: string | null } | null;
  /** The match it belongs to, in a container of several (`matches[].id`). */
  match?: string;
  [more: string]: unknown;
}

export interface ContainerManifest {
  format: '3dheat';
  /** `major.minor`; read when the major is `FORMAT_MAJOR`. */
  format_version: string;
  game?: string | null;
  source?: string | null;
  converter?: { name?: string; version?: string | null } | null;
  match?: string | null;
  map?: string | null;
  mode?: string | null;
  started?: string | null;
  matches?: Array<{ id: string; [more: string]: unknown }>;
  references?: Array<{ kind?: string; name: string; sha256?: string; [more: string]: unknown }>;
  extensions?: Record<string, unknown>;
  /** Role to its first member's name. */
  roles: Record<string, string>;
  members: ContainerMember[];
  [more: string]: unknown;
}

interface Entry {
  name: string;
  method: number;
  csize: number;
  usize: number;
  /** Offset of its local header. */
  lho: number;
}

export interface Container {
  file: File;
  manifest: ContainerManifest;
  entries: Map<string, Entry>;
  /** The tables (members of role `table`, stored) as files of their own, lazy slices of the container. */
  tables: File[];
  /** The first table, named `<container>.parquet`. */
  table: File | null;
  /** A member by name: a stored one as a lazy slice, a deflated one read and inflated. */
  open: (name: string) => Promise<File | null>;
  /** The first member of a role as `open` gives it; null when there is none. */
  member: (role: string) => Promise<File | null>;
  /** The first JSON member of a role (the match document: `match`), parsed. */
  json: (role: string) => Promise<unknown>;
}

const u16 = (v: DataView, o: number) => v.getUint16(o, true);
const u32 = (v: DataView, o: number) => v.getUint32(o, true);
const u64 = (v: DataView, o: number) => Number(v.getBigUint64(o, true));

async function bytes(file: Blob, start: number, end: number): Promise<DataView> {
  const b = await file.slice(Math.max(0, start), Math.min(file.size, end)).arrayBuffer();
  return new DataView(b);
}

const utf8 = new TextDecoder();

/** The central directory: its entries, from the tail (and the directory itself where it does not fit the tail read). */
async function centralDirectory(file: Blob): Promise<Entry[]> {
  const TAIL = 4096;
  let tailStart = Math.max(0, file.size - TAIL);
  let tail = await bytes(file, tailStart, file.size);
  let eocd = findBack(tail, 0x06054b50, 22);
  if (eocd < 0 && tailStart > 0) {
    // A long archive comment: the record is within the last 64 KiB.
    tailStart = Math.max(0, file.size - 65_557);
    tail = await bytes(file, tailStart, file.size);
    eocd = findBack(tail, 0x06054b50, 22);
  }
  if (eocd < 0) throw new Error('not a ZIP container');
  let count = u16(tail, eocd + 10);
  let cdSize = u32(tail, eocd + 12);
  let cdOffset = u32(tail, eocd + 16);
  if (count === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) {
    // ZIP64: the locator just before the record points at the ZIP64 record.
    const loc = eocd - 20;
    const locView = loc >= 0 ? tail : await bytes(file, tailStart + loc, tailStart + loc + 20);
    const lo = loc >= 0 ? loc : 0;
    if (u32(locView, lo) !== 0x07064b50) throw new Error('ZIP64 locator missing');
    const at = u64(locView, lo + 8);
    const z = await bytes(file, at, at + 56);
    if (u32(z, 0) !== 0x06064b50) throw new Error('ZIP64 record missing');
    count = u64(z, 32);
    cdSize = u64(z, 40);
    cdOffset = u64(z, 48);
  }
  const cd = cdOffset >= tailStart && cdOffset + cdSize <= file.size ? new DataView(tail.buffer, tail.byteOffset + cdOffset - tailStart, cdSize) : await bytes(file, cdOffset, cdOffset + cdSize);
  const out: Entry[] = [];
  let p = 0;
  for (let i = 0; i < count; i++) {
    if (u32(cd, p) !== 0x02014b50) throw new Error('bad central directory');
    const method = u16(cd, p + 10);
    let csize = u32(cd, p + 20);
    let usize = u32(cd, p + 24);
    const n = u16(cd, p + 28);
    const m = u16(cd, p + 30);
    const k = u16(cd, p + 32);
    let lho = u32(cd, p + 42);
    const name = utf8.decode(new Uint8Array(cd.buffer, cd.byteOffset + p + 46, n));
    // ZIP64 extra: the fields that overflowed, in this order.
    for (let e = p + 46 + n; e + 4 <= p + 46 + n + m; ) {
      const id = u16(cd, e);
      const len = u16(cd, e + 2);
      if (id === 1) {
        let q = e + 4;
        if (usize === 0xffffffff) (usize = u64(cd, q)), (q += 8);
        if (csize === 0xffffffff) (csize = u64(cd, q)), (q += 8);
        if (lho === 0xffffffff) lho = u64(cd, q);
      }
      e += 4 + len;
    }
    out.push({ name, method, csize, usize, lho });
    p += 46 + n + m + k;
  }
  return out;
}

function findBack(v: DataView, sig: number, min: number): number {
  for (let i = v.byteLength - min; i >= 0; i--) if (u32(v, i) === sig) return i;
  return -1;
}

/** Where a member's bytes start: after its local header, whose name and extra lengths are its own. */
function dataStart(head: DataView, at: number, lho: number): number {
  if (u32(head, at) !== 0x04034b50) throw new Error('bad local header');
  return lho + 30 + u16(head, at + 26) + u16(head, at + 28);
}

async function memberStart(file: Blob, e: Entry): Promise<number> {
  return dataStart(await bytes(file, e.lho, e.lho + 30), 0, e.lho);
}

async function inflate(blob: Blob, method: number): Promise<Blob> {
  if (method === 0) return blob;
  if (method !== 8) throw new Error(`ZIP method ${method} not read`);
  return new Response(blob.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();
}

/** The major of a manifest's format version (`format_version`, or the first drafts' `version`). */
export function formatMajor(m: { format_version?: unknown; version?: unknown }): number {
  return Number(String(m.format_version ?? m.version ?? '1').split('.')[0]);
}

/** Tables handed out, to their container: `sidecarOf` finds a table's sidecars from them. */
const owners = new WeakMap<File, Container>();

/** Opens a container: the manifest and where the tables lie, nothing else read. */
export async function openContainer(file: File): Promise<Container> {
  const list = await centralDirectory(file);
  const entries = new Map(list.map((e) => [e.name, e]));
  const man = entries.get('manifest.json');
  if (!man) throw new Error('no manifest');
  // The head: the manifest, and the local header of what follows it (the table, as the writers lay it out).
  const after = list.filter((e) => e.lho > man.lho).reduce<Entry | null>((a, e) => (!a || e.lho < a.lho ? e : a), null);
  const headEnd = after ? after.lho + 30 : man.lho + 30 + 65_536 + man.csize;
  const head = await bytes(file, man.lho, Math.min(file.size, headEnd));
  const mStart = dataStart(head, 0, man.lho);
  const inHead = mStart + man.csize <= man.lho + head.byteLength;
  const mBlob = inHead ? new Blob([new Uint8Array(head.buffer as ArrayBuffer, head.byteOffset + mStart - man.lho, man.csize)]) : file.slice(mStart, mStart + man.csize);
  const manifest = JSON.parse(await (await inflate(mBlob, man.method)).text()) as ContainerManifest;
  if (manifest.format !== '3dheat') throw new Error('not a 3dheat container');
  if (formatMajor(manifest) !== FORMAT_MAJOR) throw new Error(`container format ${manifest.format_version} is newer than this viewer reads`);
  const members = Array.isArray(manifest.members) ? manifest.members : [];
  const stem = file.name.replace(CONTAINER_EXT, '');
  const start = async (e: Entry) => (after && e === after && head.byteLength >= after.lho - man.lho + 30 ? dataStart(head, after.lho - man.lho, after.lho) : memberStart(file, e));
  const slice = (e: Entry, at: number, name: string) => new File([file.slice(at, at + e.csize)], name, { lastModified: file.lastModified });
  const tableEntries = members.filter((m) => m.role === 'table').map((m) => entries.get(m.name)).filter((e): e is Entry => !!e && e.method === 0);
  const base = (name: string) => name.slice(name.lastIndexOf('/') + 1);
  const tables = await Promise.all(tableEntries.map(async (e, i) => slice(e, await start(e), i === 0 ? `${stem}.parquet` : base(e.name))));
  const open = async (name: string): Promise<File | null> => {
    const e = entries.get(name);
    if (!e) return null;
    const at = await start(e);
    if (e.method === 0) return slice(e, at, base(name));
    return new File([await inflate(file.slice(at, at + e.csize), e.method)], base(name), { lastModified: file.lastModified });
  };
  const firstOf = (role: string) => members.find((m) => m.role === role)?.name ?? manifest.roles?.[role];
  const c: Container = {
    file,
    manifest,
    entries,
    tables,
    table: tables[0] ?? null,
    open,
    member: async (role) => {
      if (role === 'table') return tables[0] ?? null;
      const name = firstOf(role);
      const e = name ? entries.get(name) : undefined;
      if (!e) return null;
      const f = await open(e.name);
      // A stored sidecar named as the loose one would be: `<match>.<role>.parquet`.
      return f && e.method === 0 ? new File([f], `${stem}.${role}${/\.[^./]+$/.exec(e.name)?.[0] ?? ''}`, { lastModified: f.lastModified }) : f;
    },
    json: async (role) => {
      const name = firstOf(role);
      const f = name ? await open(name) : null;
      return f ? JSON.parse(await f.text()) : null;
    },
  };
  for (const t of tables) owners.set(t, c);
  return c;
}

/** The container a table came out of, if it did. */
export function containerOf(table: File): Container | null {
  return owners.get(table) ?? null;
}

/** A table's sidecar by role (`flight`, `messages`, `events`, ...), read from its container when it came from one. */
export async function sidecarOf(table: File, role: string): Promise<File | null> {
  return (await owners.get(table)?.member(role)) ?? null;
}

/** Containers opened at once: each open is two small reads, so many in flight keep the disk busy. */
const OPEN_AT_ONCE = 32;

/**
 * Every container among `files` opened and replaced by its tables (the
 * first named `<match>.parquet` beside where the container was, any others
 * by their own names); other files as they were. A container that cannot be
 * read is left out and named in `failed`.
 */
export async function expandContainers(files: PickedFile[]): Promise<{ files: PickedFile[]; failed: string[] }> {
  if (!files.some((f) => isContainer(f.file.name))) return { files, failed: [] };
  const out: PickedFile[][] = files.map((f) => (isContainer(f.file.name) ? [] : [f]));
  const failed: string[] = [];
  let next = 0;
  const work = async () => {
    for (;;) {
      const i = next++;
      if (i >= files.length) return;
      const f = files[i];
      if (!isContainer(f.file.name)) continue;
      try {
        const c = await openContainer(f.file);
        if (!c.tables.length) throw new Error('no table');
        const dir = f.relativePath.includes('/') ? f.relativePath.slice(0, f.relativePath.lastIndexOf('/') + 1) : '';
        out[i] = c.tables.map((t) => ({ file: t, relativePath: `${dir}${t.name}` }));
      } catch {
        failed.push(f.relativePath || f.file.name);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(OPEN_AT_ONCE, files.length) }, work));
  // A folder packed in part holds a match twice, loose and packed: once is enough.
  const loose = new Set(files.filter((f) => !isContainer(f.file.name)).map((f) => f.relativePath.toLowerCase()));
  const kept = out.flatMap((group, i) => (isContainer(files[i].file.name) ? group.filter((f) => !loose.has(f.relativePath.toLowerCase())) : group));
  return { files: kept, failed };
}

/** `expandContainers` over plain files (the pickers that take a FileList). */
export async function expandContainerFiles(files: File[]): Promise<File[]> {
  const r = await expandContainers(files.map((file) => ({ file, relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name })));
  return r.files.map((f) => f.file);
}
