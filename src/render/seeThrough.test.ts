import { describe, expect, it } from 'vitest';
import { CATALOG } from '../figures/catalog';
import { meshOf } from '../figures/instances';
import { figureGlslFs, figureGlslVs, figureWgsl, SEE_THROUGH_BELOW, seeThrough } from './figureShaders';
import { LINE_FS } from './webgl2/shaders';
import { LINE_WGSL } from './webgpu/shaders';

describe('see-through parts and effects', () => {
  it('finds a propeller disc in a prop aircraft and none in a tank', () => {
    const plane = CATALOG['bf-109-g6'];
    const tank = CATALOG['pz-iv-g'];
    expect(plane && tank).toBeTruthy();
    expect(seeThrough(meshOf(plane.build()).data)).toBe(true);
    expect(seeThrough(meshOf(tank.build()).data)).toBe(false);
  });

  it('splits by alpha in every shader that draws the scene', () => {
    // The two passes: solid ones (writing depth) and see-through ones (not), by the same threshold.
    expect(figureGlslFs()).toContain('uAlphaPass');
    expect(figureGlslVs()).toContain(`aColor.a >= ${SEE_THROUGH_BELOW}`);
    expect(figureWgsl()).toContain('override alphaPass');
    expect(figureWgsl()).toContain(`colour.a >= ${SEE_THROUGH_BELOW}`);
    expect(LINE_FS).toContain(`vColor.a >= ${SEE_THROUGH_BELOW}`);
    expect(LINE_WGSL).toContain(`in.colour.a >= ${SEE_THROUGH_BELOW}`);
  });
});
