/**
 * The mesh figures (`../meshfig.ts`) by catalogue name: each replaces the
 * built figure of that name, which keeps its spec, class, aliases and cues.
 * Only models measured or judged truer than the built figure in the views
 * that matter (ground: side and turret; air: top, then side) and clean in
 * the renderer are listed, each in a file of its own here (packed from the
 * prepared model: 16-bit positions and indices, full / coarse / far, at most
 * about 60 KB gzipped); their sources go in `../specs/sources.md` and
 * docs/figure-credits.md.
 *
 * None yet: the free models prepared so far (2026-11-09) come out of their
 * remesh and decimation fragmented and folded, and draw mottled, which no
 * built figure is.
 */

import type { MeshFigureData } from '../meshfig';

export const MESH_FIGURES: Record<string, MeshFigureData> = {};
