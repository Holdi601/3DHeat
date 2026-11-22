---
title: Brand
nav_exclude: true
---

# Brand

The 3DHeat logo is a glass cube holding a heat terrain: a height field drawn
as a grid, coloured by the heat ramp from blue at the bottom to red at the
peaks. Next to it, the wordmark **3DHEAT** in the same colours.

All files are vector (SVG) first; the PNG and ICO files are exports of them.
They live in [`public/brand/`](../public/brand/), the one shared place: the
viewer, the desktop app, the docs and the extractor tools all take them from
there.

## Files

| File | What it is | Use it for |
| --- | --- | --- |
| `logo.svg` | The full logo on its dark background, 1024 × 1024 | Large square placements, social avatars |
| `logo-mark.svg` | The full logo, transparent background | On any surface, 128 px and larger |
| `icon.svg` | The simplified mark: fewer grid lines, a stronger outline | Favicons and app icons, 16–96 px |
| `icon-light.svg` | The simplified mark with a darker outline | Small sizes on light backgrounds |
| `banner.svg` | Logo and wordmark on the dark background, 1584 × 672 | README and docs header |
| `banner-transparent.svg` | The banner without its background | Over dark images or panels |
| `lockup.svg` | Mark and wordmark on one line, solid letters | Headers 24–40 px tall, on dark |
| `lockup-light.svg` | The same without the glow | Headers on light backgrounds |
| `wordmark.svg` | The wordmark alone, solid letters | Where the mark is already shown |
| `png/logo-<size>.png` | `logo-mark.svg` at 16–1024 px | Places that take no SVG |
| `png/icon-<size>.png` | `icon.svg` at 16–256 px | Places that take no SVG |
| `favicon.ico` | `icon.svg` at 16, 32 and 48 px | Browsers that ask for `/favicon.ico` |
| `apple-touch-icon.png` | 180 × 180 on the dark background | iOS home screen |
| `pwa-192.png`, `pwa-512.png` | Maskable icons with a safe margin | The web app manifest |
| `social-preview.png` | The banner at 1280 × 640 | The repository's social preview (Settings → General → Social preview) |
| `installer/` | Bitmaps for the Windows installers (copied to `native/crates/app-tauri/installer/`) | NSIS header and sidebar, MSI banner and dialog |

The desktop app's icon set (`native/crates/app-tauri/icons/`) is made from
`icon.svg` and `logo-mark.svg` by `npm run icons` in `native/`.

## Usage

- Use the files as they are: do not recolour, stretch, rotate or add effects.
- Keep clear space around the mark of at least a quarter of its width.
- Below 96 px use `icon.svg`, not the full logo: the full grid turns to noise
  at small sizes.
- On light backgrounds use `icon-light.svg` and `lockup-light.svg`.

### Minimum sizes

| File | Smallest |
| --- | --- |
| `logo.svg`, `logo-mark.svg` | 96 px |
| `icon.svg`, `icon-light.svg` | 16 px |
| `lockup.svg`, `lockup-light.svg` | 24 px tall |
| `banner.svg` | 320 px wide |

## Colours

The heat ramp, from the lowest ground to the peaks:

| Step | Hex |
| --- | --- |
| Lowest ground | `#0a317b` |
| Low | `#0e5aa9` |
| Cool | `#0bafda` |
| Mid | `#3becb5` |
| Warm | `#f3e349` |
| Hot | `#ff730d` |
| Hotter | `#d91b14` |
| Peak | `#c4262a` |
| Peak tip | `#7c0f1d` |

| Use | Hex |
| --- | --- |
| Background | `#161c26` (logo), `#1b222a` (banner) |
| Wordmark "3D" | `#52e4f0` |
| Wordmark "HE" | `#62d27a` |
| Wordmark "AT" | `#f0443a` |

## Typeface

The wordmark is set in **Montserrat** (SemiBold in the banner, Bold in the
lockup) and converted to outlines, so no font file is needed to show it.
Montserrat is by Julieta Ulanovsky and the Montserrat Project Authors,
licensed under the [SIL Open Font License 1.1](https://openfontlicense.org/).

## Source

The logo was made with an image generator and redrawn as vector graphics from
a model of its geometry (the cube, the height field and the heat ramp fitted to
the picture), so it scales to any size.
