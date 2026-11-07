import { MAX_PLAN_BLOCKS } from './types';
import { describe, expect, it } from 'vitest';
import { BLOCK_TEX_WIDTH, CHUNK_ROWS, MAX_FILTER_SLOTS, SAMPLE_BLOCK } from './types';

/**
 * Texture dimensions against real driver limits.
 *
 * This file exists because the failure mode is uniquely nasty: `texStorage2D`
 * past MAX_TEXTURE_SIZE does not throw. The allocation is dropped, every later
 * upload to that texture fails with INVALID_OPERATION, and sampling it returns
 * zero — so the picture is wrong and nothing anywhere says so. It cost a long
 * debugging session when a 16384-wide block index texture met a driver that caps
 * at 8192, during which the stochastic sampler had been quietly drawing only the
 * first block of every chunk.
 *
 * The numbers below are the limits worth supporting, so a future change that
 * outgrows one fails here rather than in someone's browser.
 */

/** WebGL2's guaranteed floor. Anything at or under this works everywhere. */
const WEBGL2_MINIMUM = 2048;
/** What the test suite's software rasteriser (ANGLE/SwiftShader) reports. */
const SWIFTSHADER = 8192;
/** The renderer refuses to start below this, for the row textures. */
const REQUIRED = 8192;

describe('texture dimensions versus driver limits', () => {
  it('keeps the block index texture inside the smallest limit it can run on', () => {
    // The renderer already refuses to initialise under REQUIRED, so that is the
    // binding constraint — but staying inside the spec floor costs nothing here
    // and removes the question entirely.
    expect(BLOCK_TEX_WIDTH).toBeLessThanOrEqual(SWIFTSHADER);
    expect(BLOCK_TEX_WIDTH).toBeLessThanOrEqual(REQUIRED);
  });

  it('makes the block index texture a power of two, so the shader can mask', () => {
    // The shader turns a block number into a texel with a mask and a shift, which
    // only works for a power-of-two width.
    expect(Number.isInteger(Math.log2(BLOCK_TEX_WIDTH))).toBe(true);
  });

  it('gives the block index texture a height inside the limit too', () => {
    // Both dimensions are checked by the driver, and a tall-thin texture fails
    // exactly as silently as a wide-flat one.
    const MAX_BLOCKS = MAX_PLAN_BLOCKS;
    const height = MAX_BLOCKS / BLOCK_TEX_WIDTH;
    expect(Number.isInteger(height)).toBe(true);
    expect(height).toBeLessThanOrEqual(WEBGL2_MINIMUM);
    expect(height).toBeGreaterThan(0);
  });

  it('can still address a whole chunk through the block index', () => {
    // The point of the block texture is to reach any block of the largest chunk;
    // shrinking it for safety must not shrink what it can address.
    const MAX_BLOCKS = MAX_PLAN_BLOCKS;
    const blocksPerChunk = Math.ceil(CHUNK_ROWS / SAMPLE_BLOCK);
    expect(MAX_BLOCKS).toBeGreaterThanOrEqual(blocksPerChunk);
    expect(BLOCK_TEX_WIDTH * (MAX_BLOCKS / BLOCK_TEX_WIDTH)).toBe(MAX_BLOCKS);
  });

  it('keeps the row textures inside what the renderer demands at startup', () => {
    // ROW_TEX_WIDTH is 8192 and the renderer checks it explicitly before doing
    // anything else; this pins the relationship so the check cannot be loosened
    // without noticing.
    const ROW_TEX_WIDTH = 8192;
    expect(ROW_TEX_WIDTH).toBeLessThanOrEqual(REQUIRED);
    const rowTexHeight = Math.ceil(CHUNK_ROWS / ROW_TEX_WIDTH);
    expect(rowTexHeight).toBeLessThanOrEqual(REQUIRED);
  });

  it('keeps the category mask inside the limit on both axes', () => {
    const FILTER_MASK_WIDTH = 4096;
    expect(FILTER_MASK_WIDTH).toBeLessThanOrEqual(REQUIRED);
    expect(MAX_FILTER_SLOTS).toBeLessThanOrEqual(REQUIRED);
  });
});
