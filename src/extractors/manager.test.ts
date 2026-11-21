import { describe, expect, it } from 'vitest';
import { compareVersions, INDEX, isState, releasesUrl, statusOf, type Item } from './manager';

const item = (over: Partial<Item>): Item => ({
  id: 'heat3d-x',
  name: 'X',
  games: [],
  what: '',
  repo: 'Holdi601/X',
  supported: true,
  installed: null,
  latest: null,
  latestSize: null,
  latestError: null,
  running: false,
  job: null,
  check: null,
  ...over,
});

describe('the extractors manager, as the panel sees it', () => {
  it('ships the public extractors only, each from its own repository', () => {
    expect(INDEX).toHaveLength(20);
    const ids = new Set(INDEX.map((e) => e.id));
    expect(ids.size).toBe(20);
    for (const e of INDEX) {
      expect(e.id).toMatch(/^heat3d-[a-z0-9-]+$/);
      expect(e.id).not.toMatch(/fetch|models/);
      expect(e.repo).toMatch(/^Holdi601\/[\w.-]+$/);
      expect(Object.keys(e.assets)).toEqual(Object.keys(e.exe));
      expect(e.assets['windows-x64']).toBe('{id}-{version}-windows-x64.zip');
      expect(e.sums).toBe('SHA256SUMS');
    }
    expect(releasesUrl('Holdi601/X')).toBe('https://github.com/Holdi601/X/releases/latest');
  });

  it('orders versions by number', () => {
    expect(compareVersions('v1.10.0', '1.9.9')).toBe(1);
    expect(compareVersions('1.2', 'v1.2.0')).toBe(0);
    expect(compareVersions('1.2.0', '1.2.1')).toBe(-1);
    expect(compareVersions('2.0.0-rc.1', '2.0.0')).toBe(0);
  });

  it('says what state each one is in', () => {
    expect(statusOf(item({ supported: false }))).toBe('unsupported');
    expect(statusOf(item({}))).toBe('missing');
    expect(statusOf(item({ installed: '1.0.0', latest: '1.0.0' }))).toBe('installed');
    expect(statusOf(item({ installed: '1.0.0', latest: '1.1.0' }))).toBe('update');
    expect(statusOf(item({ installed: '1.0.0', running: true }))).toBe('running');
    expect(statusOf(item({ job: { version: '1', phase: 'download', done: 1, total: 2, error: null } }))).toBe('busy');
    expect(statusOf(item({ job: { version: '1', phase: 'failed', done: 0, total: 0, error: 'x' } }))).toBe('error');
    expect(isState({ format: '3dheat-extractors-state', extractors: [] })).toBe(true);
    expect(isState('<!doctype html>')).toBe(false);
  });
});
