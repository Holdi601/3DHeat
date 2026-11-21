import { describe, expect, it } from 'vitest';
import { toggledSelection } from './store';

describe('an insight row title', () => {
  it('opens a closed row and closes the open one', () => {
    expect(toggledSelection(null, 'a')).toBe('a');
    expect(toggledSelection('b', 'a')).toBe('a');
    expect(toggledSelection('a', 'a')).toBeNull();
  });
});
