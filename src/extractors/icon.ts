/**
 * An extractor's icon: the 3DHeat cube with a text badge naming its game (public/brand/extractors/,
 * made by tools/extractor-kit/make_icons.py). Sizes: 16, 24, 32, 48, 64, 128, 256.
 */
export function extractorIcon(id: string, size = 64): string {
  return `${import.meta.env.BASE_URL}brand/extractors/${id}-${size}.png`;
}

/** An icon that failed to load (an extractor without one) takes no room. */
export function hideBroken(e: { currentTarget: HTMLImageElement }): void {
  e.currentTarget.style.display = 'none';
}
