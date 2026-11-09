/** The glyph atlas drawn off the main thread (`atlas.ts` warmSymbolAtlas). */

import { symbolAtlas } from './atlas';

const pixels = symbolAtlas();
(self as unknown as Worker).postMessage(pixels, pixels ? [pixels.buffer] : []);
