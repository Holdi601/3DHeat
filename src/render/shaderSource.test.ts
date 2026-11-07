import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * A guard against one specific, repeated mistake.
 *
 * Shader source lives in tagged template literals, so a backtick anywhere inside
 * one ends the string. Written in a comment — `like this` — the result is a pile
 * of TypeScript syntax errors pointing at lines a dozen away from the cause, and
 * the fix is invisible from the error text. It has been made five times in this
 * file pair, every time while explaining a uniform by name.
 *
 * `tsc` does catch it, so this test buys nothing in correctness. It buys the
 * *message*: "line 385 has a backtick in a comment" instead of "',' expected".
 */
const SHADER_FILES = ['webgl2/shaders.ts', 'webgpu/shaders.ts'];

describe('shader source', () => {
  for (const file of SHADER_FILES) {
    it(`${file} has no backticks inside comments`, () => {
      const path = resolve(__dirname, file);
      const lines = readFileSync(path, 'utf8').split(/\r?\n/);
      const offenders: string[] = [];
      // Only comments *inside* a shader literal matter. A backtick in the
      // module's own JSDoc is ordinary prose and there is plenty of it, so the
      // first version of this test failed on four innocent lines and none of the
      // real ones. Track the literal by counting backticks on code lines.
      let inTemplate = false;
      lines.forEach((line, i) => {
        const trimmed = line.trim();
        const isComment =
          trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
        if (isComment) {
          if (inTemplate && line.includes('`')) {
            offenders.push(`${file}:${i + 1}: ${trimmed.slice(0, 90)}`);
          }
          return;
        }
        const ticks = (line.match(/`/g) ?? []).length;
        if (ticks % 2 === 1) inTemplate = !inTemplate;
      });
      expect(offenders, `backtick inside shader source:\n${offenders.join('\n')}`).toEqual([]);
    });
  }
});
