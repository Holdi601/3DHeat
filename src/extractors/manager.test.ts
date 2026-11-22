import { describe, expect, it } from 'vitest';
import { compareVersions, INDEX, isState, mapCounts, offeredUpdates, onlyQuery, releasesUrl, statusOf, type Item, type MapStatus } from './manager';

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
  notes: null,
  published: null,
  skipped: false,
  running: false,
  job: null,
  check: null,
  status: null,
  extract: null,
  ...over,
});

describe('the extractors manager, as the panel sees it', () => {
  it('ships the public extractors only, each from its own repository', () => {
    expect(INDEX).toHaveLength(22);
    const ids = new Set(INDEX.map((e) => e.id));
    expect(ids.size).toBe(22);
    for (const e of INDEX) {
      expect(e.id).toMatch(/^heat3d-[a-z0-9-]+$/);
      expect(e.id).not.toMatch(/fetch|models/);
      expect(e.repo).toMatch(/^Holdi601\/[\w.-]+$/);
      expect(Object.keys(e.assets)).toEqual(Object.keys(e.exe));
      expect(e.assets['windows-x64']).toBe('{id}-{version}-windows-x64.zip');
      if (e.assets['macos-arm64']) expect(e.assets['macos-arm64']).toBe('{id}-{version}-macos-arm64.tar.gz');
      expect(e.sums).toBe('SHA256SUMS');
    }
    const on = (p: string) => INDEX.filter((e) => p in e.assets).map((e) => e.id);
    expect(on('linux-x64')).toHaveLength(19);
    expect(on('linux-x64')).not.toContain('heat3d-battlefield');
    expect(on('macos-arm64').sort()).toEqual(
      ['heat3d-dota-maps', 'heat3d-dota-replay', 'heat3d-gamecapture', 'heat3d-gamefiles', 'heat3d-riot', 'heat3d-warthunder', 'heat3d-watcher', 'heat3d-wot', 'heat3d-wows'].sort(),
    );
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
    expect(statusOf(item({ installed: '1.0.0', extract: { running: true, total: 2, ok: 0, failed: 0, maps: [], error: null, finished: false } }))).toBe('extracting');
    expect(isState({ format: '3dheat-extractors-state', extractors: [] })).toBe(true);
    expect(isState('<!doctype html>')).toBe(false);
  });

  it('offers updates only for versions not skipped, and confirms exactly those', () => {
    const a = item({ id: 'heat3d-a', installed: '1.0.0', latest: '1.1.0' });
    const b = item({ id: 'heat3d-b', installed: '1.0.0', latest: '2.0.0', skipped: true });
    const c = item({ id: 'heat3d-c', installed: '1.0.0', latest: '1.0.0' });
    expect(offeredUpdates([a, b, c]).map((x) => x.id)).toEqual(['heat3d-a']);
    expect(onlyQuery([a, item({ id: 'heat3d-d', latest: '0.3.0+b' })])).toBe('?only=heat3d-a@1.1.0,heat3d-d@0.3.0%2Bb');
  });

  it('adds up the map counts over the games', () => {
    const counts = (n: number) => ({ new: n, changed: 1, outdated: 0, current: 2, missing: 0 });
    const s: MapStatus = {
      version: '1',
      levels: null,
      error: null,
      at: 0,
      games: [
        { game: 'a', label: 'A', found: true, build: null, maps: [], counts: counts(2) },
        { game: 'b', label: 'B', found: true, build: null, maps: [], counts: counts(1) },
      ],
    };
    expect(mapCounts(s)).toEqual({ new: 3, changed: 2, outdated: 0, current: 4, missing: 0 });
    expect(mapCounts(null).new).toBe(0);
  });
});
