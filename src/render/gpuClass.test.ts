import { describe, expect, it } from 'vitest';
import { classifyRenderer, softwareRenderingAdvice } from './gpuClass';

/**
 * The strings are real, captured from the machines named. Invented ones would
 * only prove the parser is consistent with whatever the parser expects.
 */
const RTX_5080 =
  'ANGLE (NVIDIA, NVIDIA GeForce RTX 5080 (0x00002C02) Direct3D11 vs_5_0 ps_5_0, D3D11)';
const SWIFTSHADER =
  'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)';
const INTEL_UHD =
  'ANGLE (Intel, Intel(R) UHD Graphics 630 (0x00003E9B) Direct3D11 vs_5_0 ps_5_0, D3D11)';

describe('classifyRenderer', () => {
  it('reads a discrete card as hardware and names it legibly', () => {
    const c = classifyRenderer(RTX_5080);
    expect(c.kind).toBe('hardware');
    expect(c.short).toBe('NVIDIA GeForce RTX 5080');
    // The blob is kept whole, because a bug report needs the backend and the
    // PCI id that the short name throws away.
    expect(c.raw).toBe(RTX_5080);
  });

  it('recognises the CPU rasteriser the test harness runs on', () => {
    const c = classifyRenderer(SWIFTSHADER);
    expect(c.kind).toBe('software');
    expect(softwareRenderingAdvice(c)).toMatch(/CPU instead of the graphics card/);
  });

  it('treats integrated graphics as hardware, not as a fallback', () => {
    // An iGPU is a real GPU. Warning about it would be telling most laptop users
    // their working setup is broken.
    const c = classifyRenderer(INTEL_UHD);
    expect(c.kind).toBe('hardware');
    expect(c.short).toBe('Intel(R) UHD Graphics 630');
  });

  it('keeps commas inside the device description out of the field split', () => {
    // SwiftShader's device name contains its own parentheses and a comma-free
    // version string; a naive split on "," lands mid-name.
    expect(classifyRenderer(SWIFTSHADER).short).toContain('SwiftShader');
  });

  it('passes a non-ANGLE string through rather than mangling it', () => {
    const c = classifyRenderer('Mesa Intel(R) Graphics (ADL GT2)');
    expect(c.kind).toBe('hardware');
    expect(c.short).toBe('Mesa Intel(R) Graphics (ADL GT2)');
  });

  it('calls an unrecognised renderer unknown, never software', () => {
    // The failure that matters: telling someone with a working GPU to go and
    // reconfigure their browser. Silence is the correct answer here.
    const c = classifyRenderer('Some Vendor Nobody Has Heard Of 9000');
    expect(c.kind).toBe('unknown');
    expect(softwareRenderingAdvice(c)).toBe(null);
  });

  it('handles a missing renderer string', () => {
    for (const v of [null, undefined, '', '   ']) {
      const c = classifyRenderer(v);
      expect(c.kind).toBe('unknown');
      expect(softwareRenderingAdvice(c)).toBe(null);
    }
  });

  it('spots the software rasterisers that are not SwiftShader', () => {
    for (const name of [
      'llvmpipe (LLVM 15.0.6, 256 bits)',
      'Microsoft Basic Render Driver',
      'Apple Software Renderer',
      'softpipe',
    ]) {
      expect(classifyRenderer(name).kind, name).toBe('software');
    }
  });

  it('does not read a hardware driver that mentions software as software', () => {
    // The trap that a bare "software" match would fall into.
    expect(
      classifyRenderer('ANGLE (AMD, AMD Radeon RX 7900 XTX (software command list), D3D11)').kind,
    ).toBe('hardware');
  });
});
