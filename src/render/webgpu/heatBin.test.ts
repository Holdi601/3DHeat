import { describe, expect, it } from 'vitest';
import { binWgsl, listHeatWgsl } from './heatBin';
import { HEAT_WGSL } from './shaders';

/**
 * The bin and list shaders are cut from the splat's own text, so that what a
 * row adds is the same code in both paths. A change to the splat that moves
 * one of the anchors throws at load and the heat quietly stays on the splat;
 * this is where it shows instead.
 */
describe('heat binning shaders', () => {
  it('derive from the splat shader', () => {
    expect(() => binWgsl()).not.toThrow();
    expect(() => listHeatWgsl()).not.toThrow();
  });

  it('keep every per-row rule of the splat', () => {
    const bin = binWgsl();
    // Up to where the sprite is placed, the bin pass is the splat's vertex stage.
    const head = HEAT_WGSL.slice(HEAT_WGSL.indexOf('  let blockShift = u.rowCfg.z;'), HEAT_WGSL.indexOf('  var clip = u.viewProj * vec4<f32>(p, 1.0);'));
    const kept = head.split('\n').filter((l) => l.trim() && !l.includes('dirs[row'));
    for (const line of kept) expect(bin).toContain(line);
    expect(bin).toContain('fn csBin');
    expect(bin).not.toContain('@vertex');
    expect(bin).not.toContain('dirs[row');
  });

  it('read the listed rows instead of the block starts', () => {
    const list = listHeatWgsl();
    expect(list).toMatch(/let row = blockStarts\[\d+u \+ u\.filterModes\.y \+ sprite\];/);
    expect(list).toContain('fn fsHeat');
  });
});
