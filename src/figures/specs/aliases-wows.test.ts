import { describe, expect, it } from 'vitest';
import { CATALOG } from '../catalog';
import { figureFor } from '../match';
import { WOWS_ALIASES } from './aliases-wows';

describe('World of Warships ships', () => {
  it('every ship is drawn as a ship figure', () => {
    const wrong = Object.entries(WOWS_ALIASES.aliases!).filter(([, f]) => CATALOG[f]?.domain !== 'sea');
    expect(wrong).toEqual([]);
  });

  it('a ship known only by its number is drawn as its class', () => {
    // The converter writes every ship but the recording player's by the game's ship number, typed "ship".
    expect(figureFor(['4253956080'], ['ship'])).toBe('fletcher');
    expect(figureFor(['4276041424'], ['ship'])).toBe('yamato');
    expect(figureFor(['4182685680'], ['ship'])).toBe('new-orleans');
    expect(figureFor(['3763288016'], ['ship'])).toBe('hood');
  });

  it("the recording player's ship is drawn as its class by its index name", () => {
    expect(figureFor(['PASB518-Massachusetts'], ['battleship'])).toBe('south-dakota');
    expect(figureFor(['PJSB018-Yamato-1944'], ['battleship'])).toBe('yamato');
  });
});
