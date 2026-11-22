/**
 * The native viewport's copies of the engine's shaders and constants are what
 * the page builds now (`shaderExport.ts`). After a shader change:
 *
 *   UPDATE_WGSL=1 npx vitest run src/render/native/shaderExport.test.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { nativeConstants, nativeShaders } from './shaderExport';
import { FRAME_AT, FRAME_WORDS, PacketWriter, SECTION, writePlan } from './framePacket';
import { SAMPLE_BLOCK } from '../types';

const crate = resolve(__dirname, '../../../native/crates/viewport');
const update = !!process.env.UPDATE_WGSL;

function same(path: string, text: string): void {
  if (update) {
    mkdirSync(resolve(path, '..'), { recursive: true });
    writeFileSync(path, text);
    return;
  }
  expect(existsSync(path), `${path} missing: run UPDATE_WGSL=1 npx vitest run src/render/native/shaderExport.test.ts`).toBe(true);
  // Line endings as checked out on Windows do not count.
  expect(readFileSync(path, 'utf8').replace(/\r\n/g, '\n'), `${path} is stale: run UPDATE_WGSL=1 npx vitest run src/render/native/shaderExport.test.ts`).toBe(
    text,
  );
}

describe('native viewport shaders', () => {
  it('match the engine', () => {
    for (const [name, text] of Object.entries(nativeShaders())) same(join(crate, 'wgsl', name), text);
    same(join(crate, 'src', 'generated.rs'), nativeConstants());
  });

  it('lay the frame out without overlaps', () => {
    expect(FRAME_AT.viewProj).toBe(0);
    expect(FRAME_AT.cameraPos).toBe(16);
    expect(FRAME_WORDS).toBeGreaterThan(80);
  });

  it('send a whole-chunk plan as one run', () => {
    const w = new PacketWriter();
    w.begin(7);
    w.open(SECTION.plan);
    const starts = new Uint32Array(100).map((_, i) => 12 + i * SAMPLE_BLOCK);
    writePlan(w, [{ chunk: 3, blockStarts: starts, blockCount: 100, minRow: 12, maxRow: 100 * SAMPLE_BLOCK }], 65536);
    w.close();
    const u = new Uint32Array(w.view().slice().buffer);
    // header 4, tag + length, entries, then chunk, min, max, count, mode, runs, (start, count)
    expect(Array.from(u.slice(6))).toEqual([1, 3, 12, 100 * SAMPLE_BLOCK, 100, 1, 1, 12, 100]);
    expect(u[5]).toBe(9);
  });

  it('send scattered blocks one by one', () => {
    const w = new PacketWriter();
    w.begin(1);
    w.open(SECTION.plan);
    const starts = Uint32Array.from([0, 3 * SAMPLE_BLOCK, 9 * SAMPLE_BLOCK]);
    writePlan(w, [{ chunk: 0, blockStarts: starts, blockCount: 3, minRow: 0, maxRow: 10 * SAMPLE_BLOCK }], 65536);
    w.close();
    const u = new Uint32Array(w.view().slice().buffer);
    expect(Array.from(u.slice(11))).toEqual([0, 3, 0, 3 * SAMPLE_BLOCK, 9 * SAMPLE_BLOCK]);
  });
});
