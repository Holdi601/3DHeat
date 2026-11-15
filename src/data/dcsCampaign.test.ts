import { describe, expect, it } from 'vitest';
import { CELL_DEG, campaignKey, chainCampaigns, placeChange, placesOf, roundOfChain, type SessionStart, type StartUnit } from './dcsCampaign';
import { DcsRounds } from './dcsOutcome';

/**
 * A synthetic campaign: 20 places along a line, each a few units. Round one
 * starts half Red (west) and half Blue (east); Blue takes two places a
 * session until it holds all; then the server resets to the starting layout
 * and Red pushes for a while (still open). Sessions six hours apart.
 */
const PLACES = 20;
function units(owner: (i: number) => 'Red' | 'Blue' | null, lon0 = 41): StartUnit[] {
  const out: StartUnit[] = [];
  for (let i = 0; i < PLACES; i++) {
    const side = owner(i);
    if (!side) continue;
    for (let k = 0; k < 4; k++) out.push({ lat: 42 + i * CELL_DEG * 3, lon: lon0 + k * 0.001, color: side });
  }
  // A neutral and a mixed cell count to no one.
  out.push({ lat: 41, lon: 40, color: 'Grey' });
  return out;
}
const T0 = Date.parse('2026-11-01T00:00:00Z') / 1000;
function session(n: number, owner: (i: number) => 'Red' | 'Blue' | null, title = 'Test_Campaign_V1.0', server = 'Test Server', lon0 = 41): SessionStart {
  return { file: `s${n}.acmi`, server, title, start: T0 + n * 6 * 3600, units: units(owner, lon0) };
}
function campaign(): SessionStart[] {
  const s: SessionStart[] = [];
  // Round one: Blue holds 10 + 2k places at session k.
  for (let k = 0; k <= 5; k++) s.push(session(k, (i) => (i >= 10 - 2 * k ? 'Blue' : 'Red')));
  // A new round's layout (other places), then Red takes places: all of them by the sixth session, still open.
  for (let k = 0; k < 6; k++) s.push(session(6 + k, (i) => (i >= 10 + 2 * k ? 'Blue' : 'Red'), undefined, undefined, 43));
  return s;
}

describe('DCS campaign chain', () => {
  it('reads a side’s places from the units at a session’s start', () => {
    const p = placesOf([...units((i) => (i < 5 ? 'Red' : 'Blue')), { lat: 42, lon: 41, color: 'Blue' }, { lat: 42, lon: 41, color: 'Blue' }]);
    // Place 0 has four Red and two Blue: no side holds three quarters.
    expect(p.size).toBe(PLACES - 1);
    expect([...p.values()].filter((v) => v === 'Red')).toHaveLength(4);
    expect(placeChange(p, p)).toBe(0);
  });

  it('names a campaign by server and map, or mission', () => {
    expect(campaignKey('Blue Flag', 'BlueFlag_Syria_2014_04')).toBe('Blue Flag Syria');
    expect(campaignKey('SPS Contention', 'SPS-Contention-Caucasus-CW-E2')).toBe('SPS Contention Caucasus CW');
    expect(campaignKey('Test Server', 'Test_Campaign_V1.0')).toBe('Test Server Test Campaign');
  });

  it('chains sessions into rounds: the reset ends one, its winner held every place, the next is open with who is ahead', () => {
    const [c] = chainCampaigns(campaign());
    expect(c.persistent).toBe(true);
    // Round one's west half and round two's east half changed sides.
    expect(c.contested).toBe(PLACES);
    expect(c.rounds).toHaveLength(2);
    const [r1, r2] = c.rounds;
    expect(r1.sessions).toHaveLength(6);
    expect(r1).toMatchObject({ end: 'reset', winner: 'Blue', endReason: 'capture', confidence: 'high' });
    expect(r1.endTime).toBe(T0 + 6 * 6 * 3600);
    expect(r1.sessions.map((s) => [s.red, s.blue])).toEqual([[10, 0], [8, 2], [6, 4], [4, 6], [2, 8], [0, 10]]);
    expect(r1.sessions[5]).toMatchObject({ redAll: 0, blueAll: 20 });
    // Two places taken between each pair of sessions, by Blue.
    expect(r1.sessions[1].captures.map((x) => [x.from, x.to])).toEqual([['Red', 'Blue'], ['Red', 'Blue']]);
    expect(r1.sessions[0].captures).toEqual([]);
    expect(r2).toMatchObject({ end: 'open', winner: null, ahead: 'Red' });
  });

  it('calls a round won by more places medium or low, and a tie no one’s', () => {
    const s = [
      session(0, (i) => (i < 10 ? 'Red' : 'Blue')),
      session(1, (i) => (i < 12 ? 'Red' : 'Blue')),
      session(2, (i) => (i < 10 ? 'Red' : 'Blue')),
    ];
    // A reset after session 1 needs more than 60% of the places to change: session 2 the other way round.
    s[2].units = units((i) => (i < 12 ? 'Blue' : 'Red'));
    const [c] = chainCampaigns(s);
    expect(c.rounds[0]).toMatchObject({ end: 'reset', winner: 'Red', confidence: 'low', endReason: null });
  });

  it('keeps no rounds for a server whose sessions all begin alike', () => {
    const s = [0, 1, 2].map((n) => session(n, (i) => (i < 10 ? 'Red' : 'Blue')));
    const [c] = chainCampaigns(s);
    expect(c).toMatchObject({ persistent: false, contested: 0, rounds: [] });
  });

  it('ends a map’s open round when the server moves to another map', () => {
    // Map A ends with Red holding three of its five contested places.
    const a = [10, 15, 13].map((m, n) => session(n, (i) => (i < m ? 'Red' : 'Blue'), 'Map_A_V1.0'));
    const b = [3, 4, 5, 6].map((n) => session(n, (i) => (i < 10 + n ? 'Red' : 'Blue'), 'Map_B_V1.0'));
    const cs = chainCampaigns([...a, ...b]);
    const ra = cs.find((c) => c.campaign.endsWith('Map A'))!.rounds[0];
    expect(ra).toMatchObject({ end: 'rotated', winner: 'Red', confidence: 'low' });
    expect(ra.endTime).toBe(b[0].start);
    expect(cs.find((c) => c.campaign.endsWith('Map B'))!.rounds[0].end).toBe('open');
  });

  it('writes rounds a converter reads: each recording its round, its session and the places taken before it', () => {
    const [c] = chainCampaigns(campaign());
    const file = { format: 'heat3d-dcs-rounds', version: 1, server: 'Test Server', source: 'chain', rounds: c.rounds.map(roundOfChain) };
    const r = new DcsRounds([file]);
    const s3 = campaign()[3];
    const { rounds } = r.forRecording('Test Server', 'Test_Campaign_V1.0', s3.start, s3.start + 3600);
    expect(rounds).toHaveLength(1);
    expect(rounds[0]).toMatchObject({ id: 1, campaign: 'Test Server Test Campaign 1', winner: 'Blue', session: 4, red: 4, blue: 6, confidence: 'high' });
    expect(rounds[0].captures).toHaveLength(2);
    const s7 = campaign()[7];
    expect(r.forRecording('Test Server', 'Test_Campaign_V1.0', s7.start, s7.start + 3600).rounds[0]).toMatchObject({ id: 2, session: 2, winner: null });
  });
});
