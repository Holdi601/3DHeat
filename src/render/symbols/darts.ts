/**
 * The far stand-ins ("darts"), one shape a domain, in one mesh: an aircraft
 * an arrowhead with a fin, a helicopter a body under a rotor bar, a ship a
 * hull with a pointed bow, a submarine a slim hull with a sail, a ground
 * vehicle a low box with a raised nose, a soldier a small diamond, a building
 * a block. Each vertex carries its shape (domain + 1) in the movement
 * floats' spare slot (`SHAPE_FLOAT`); the figure shader drops the vertices
 * whose shape is not the instance's domain (`figureShaders.ts`). The GPU
 * tracks on WebGPU keep one mesh and run a domain (`dartMeshes`), so each
 * dart costs only its own vertices; WebGL2's feedback rows and the CPU path
 * draw every dart as one instanced draw of all the shapes (`dartMesh`).
 *
 * 1 m long, nose along +x, y up, z right, in the team's colour.
 */

import { MESH_STRIDE, type FigureMesh } from '../../figures/instances';
import { Domain } from '../../figures/symbolClass';

/** The vertex float that holds a dart's shape (aArt2.y). */
export const SHAPE_FLOAT = 21;

type V3 = [number, number, number];

function builder() {
  const v: number[] = [];
  let shape = 0;
  const still = new Array<number>(MESH_STRIDE - 12).fill(0);
  const tri = (a: V3, b: V3, c: V3, both = true) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l;
    ny /= l;
    nz /= l;
    const put = (p: V3, s: number) => {
      const o = v.length;
      v.push(p[0], p[1], p[2], 1, 1, 1, 1, s * nx, s * ny, s * nz, 0, 1, ...still);
      v[o + SHAPE_FLOAT] = shape;
    };
    for (const p of [a, b, c]) put(p, 1);
    if (both) for (const p of [a, c, b]) put(p, -1);
  };
  const quad = (a: V3, b: V3, c: V3, d: V3) => {
    tri(a, b, c);
    tri(a, c, d);
  };
  /** A closed prism over a polygon in the x-z plane, from y0 to y1. */
  const prism = (pts: [number, number][], y0: number, y1: number) => {
    const n = pts.length;
    for (let i = 1; i < n - 1; i++) {
      tri([pts[0][0], y1, pts[0][1]], [pts[i + 1][0], y1, pts[i + 1][1]], [pts[i][0], y1, pts[i][1]], false);
      tri([pts[0][0], y0, pts[0][1]], [pts[i][0], y0, pts[i][1]], [pts[i + 1][0], y0, pts[i + 1][1]], false);
    }
    for (let i = 0; i < n; i++) {
      const [ax, az] = pts[i];
      const [bx, bz] = pts[(i + 1) % n];
      quad([ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az]);
    }
  };
  return {
    v,
    tri,
    prism,
    set shape(s: number) {
      shape = s;
    },
  };
}

function arrow(b: ReturnType<typeof builder>): void {
  const nose: V3 = [0.5, 0, 0];
  const l: V3 = [-0.5, 0, -0.42];
  const r: V3 = [-0.5, 0, 0.42];
  const tail: V3 = [-0.3, 0, 0];
  b.tri(nose, r, tail);
  b.tri(nose, tail, l);
  b.tri([0.1, 0, 0], tail, [-0.5, 0.25, 0]);
}

/** The shapes, in dart index order (`dartIndex`): an unknown thing is drawn as an aircraft. */
const SHAPES: [number, (b: ReturnType<typeof builder>) => void][] = [
  [Domain.Air, arrow],
  [
    Domain.Heli,
    (b) => {
      b.prism([[0.25, 0], [0, 0.14], [-0.2, 0], [0, -0.14]], -0.08, 0.1);
      b.prism([[-0.15, 0.03], [-0.5, 0.02], [-0.5, -0.02], [-0.15, -0.03]], 0, 0.06);
      b.prism([[0.04, 0.48], [-0.04, 0.48], [-0.04, -0.48], [0.04, -0.48]], 0.12, 0.15);
    },
  ],
  [Domain.Ground, (b) => b.prism([[0.3, 0.26], [-0.5, 0.26], [-0.5, -0.26], [0.3, -0.26], [0.5, 0]], 0, 0.22)],
  [
    Domain.Person,
    (b) => {
      const r = 0.22;
      const top: V3 = [0, 2 * r, 0], bot: V3 = [0, 0, 0];
      const ring: V3[] = [[r, r, 0], [0, r, r], [-r, r, 0], [0, r, -r]];
      for (let i = 0; i < 4; i++) {
        const p = ring[i], q = ring[(i + 1) % 4];
        b.tri(top, q, p, false);
        b.tri(bot, p, q, false);
      }
    },
  ],
  [
    Domain.Sea,
    (b) => {
      b.prism([[0.5, 0], [0.25, 0.14], [-0.5, 0.12], [-0.5, -0.12], [0.25, -0.14]], 0, 0.08);
      b.prism([[0.05, 0.06], [-0.2, 0.06], [-0.2, -0.06], [0.05, -0.06]], 0.08, 0.22);
    },
  ],
  [
    Domain.Sub,
    (b) => {
      b.prism([[0.5, 0], [0.3, 0.09], [-0.4, 0.07], [-0.5, 0], [-0.4, -0.07], [0.3, -0.09]], 0, 0.08);
      b.prism([[0.15, 0.03], [-0.02, 0.03], [-0.02, -0.03], [0.15, -0.03]], 0.08, 0.24);
    },
  ],
  [Domain.Static, (b) => b.prism([[0.3, 0.3], [-0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]], 0, 0.5)],
];

/** How many dart meshes there are: the GPU tracks keep them first, one run each (`gpuTracks/store.ts`). */
export const DART_MESHES = SHAPES.length;

/** A domain's dart: its index among the dart meshes (an unknown thing, or one without a dart, the aircraft arrow). */
export function dartIndex(domain: number): number {
  const i = SHAPES.findIndex(([d]) => d === domain);
  return i < 0 ? 0 : i;
}

function build(shapes: typeof SHAPES, id: number): FigureMesh {
  const b = builder();
  for (const [d, draw] of shapes) {
    b.shape = d + 1;
    draw(b);
  }
  return { id, data: new Float32Array(b.v), count: b.v.length / MESH_STRIDE };
}

/** One mesh a domain's dart, in `dartIndex` order: the GPU tracks draw each from its own run, so no vertex is wasted. */
export function dartMeshes(): FigureMesh[] {
  return SHAPES.map((s, i) => build([s], -1 - i));
}

/** Every domain's dart in one mesh: one instanced draw for any mix, each instance keeping only its own shape's vertices. */
export function dartMesh(): FigureMesh {
  return build(SHAPES, -100);
}

/** Domains that have a dart of their own (the rest - weapons, decoys, shells - are glyphs, `atlas.ts`). */
export function hasDart(domain: number): boolean {
  return domain <= Domain.Heli || (domain >= Domain.Ground && domain <= Domain.Static);
}
