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
 * Prepared from the model's own geometry: its pieces closed and united into
 * one body (hidden insides drop out), cut at the turret ring and the gun,
 * and each level of detail decimated from that body by quadric edge
 * collapse; the coarse and far ones (and the full one where the wheels come
 * out lumpy) carry each side's running gear as its outline. Judged on
 * compare renders against the built figure and the published size; still to
 * be measured with the silhouette checker.
 */

import type { MeshFigureData } from '../meshfig';
import { CROMWELL } from './cromwell';
import { PZ_IV_G } from './pz-iv-g';
import { T_34_1941 } from './t-34-1941';

export const MESH_FIGURES: Record<string, MeshFigureData> = {
  cromwell: CROMWELL,
  'pz-iv-g': PZ_IV_G,
  't-34-1941': T_34_1941,
};
