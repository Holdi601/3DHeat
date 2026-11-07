/**
 * A car's body as the scene draws it: triangles in the car's own frame, on the
 * road, each with its normal and whether it is glass. A car file's shell becomes
 * one, and so does each of the viewer's own bodies (`carBodies.ts`).
 */

/** Forward, side (right positive) and radius of one wheel, metres. */
export interface ModelWheel {
  fx: number;
  side: number;
  radius: number;
}

export interface CarModel {
  name: string;
  /** Three numbers a vertex: forward, right, up from the road. */
  positions: Float32Array;
  faces: Uint16Array;
  /** Three numbers a face, in the same order: pointing away from the car's middle. */
  normals: Float32Array;
  /** 1 for a face of the glasshouse or a grille, drawn dark; 2 for a headlamp, drawn pale. */
  glass: Uint8Array;
  /** FL, FR, RL, RR. */
  wheels: ModelWheel[];
  /** Forward, right, up of each tail light. */
  lights: [number, number, number][];
  /** The highest point of the body. */
  roof: number;
}

/** A shell as the file has it: x right, y up, z forward. */
export interface CarShell {
  positions: Float32Array;
  faces: Uint16Array;
  wheels: number[][];
  lights: number[][];
}

/** Above this share of the height, a steep face is a window rather than a door. */
const BELT = 0.6;
/** A face looking more upward than this is a roof, a bonnet or a wing, not glass. */
const FLAT = 0.82;

export function finishModel(
  name: string,
  positions: Float32Array,
  faces: Uint16Array,
  wheels: ModelWheel[],
  lights: [number, number, number][],
): CarModel {
  let roof = 0;
  let rear = Infinity;
  let nose = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    roof = Math.max(roof, positions[i + 2]);
    rear = Math.min(rear, positions[i]);
    nose = Math.max(nose, positions[i]);
  }
  const middle = (rear + nose) / 2;
  const n = faces.length / 3;
  const normals = new Float32Array(n * 3);
  const glass = new Uint8Array(n);
  const belt = roof * BELT;
  for (let k = 0; k < n; k++) {
    const a = faces[k * 3] * 3;
    const b = faces[k * 3 + 1] * 3;
    const c = faces[k * 3 + 2] * 3;
    const ux = positions[b] - positions[a];
    const uy = positions[b + 1] - positions[a + 1];
    const uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a];
    const vy = positions[c + 1] - positions[a + 1];
    const vz = positions[c + 2] - positions[a + 2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l;
    ny /= l;
    nz /= l;
    const cx = (positions[a] + positions[b] + positions[c]) / 3;
    const cy = (positions[a + 1] + positions[b + 1] + positions[c + 1]) / 3;
    const cz = (positions[a + 2] + positions[b + 2] + positions[c + 2]) / 3;
    // Away from a line down the car at half the roof: the shell's winding is not relied on.
    if (nx * (cx - middle) * 0.2 + ny * cy + nz * (cz - roof / 2) < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    normals[k * 3] = nx;
    normals[k * 3 + 1] = ny;
    normals[k * 3 + 2] = nz;
    glass[k] = cz > belt && Math.abs(nz) < FLAT ? 1 : 0;
  }
  return { name, positions, faces, normals, glass, wheels, lights, roof };
}

/** A file's shell, turned into the car's frame and stood on the road. */
export function shellModel(shell: CarShell, name: string): CarModel {
  const ground = shell.wheels.reduce((sum, w) => sum + (w[1] - w[3]), 0) / shell.wheels.length;
  const positions = new Float32Array(shell.positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = shell.positions[i + 2];
    positions[i + 1] = shell.positions[i];
    positions[i + 2] = shell.positions[i + 1] - ground;
  }
  const model = finishModel(
    name,
    positions,
    shell.faces,
    shell.wheels.map((w) => ({ fx: w[2], side: w[0], radius: w[3] })),
    shell.lights.map((p): [number, number, number] => [p[2], p[0], p[1] - ground]),
  );
  // A shell says nothing of which faces are glass, and telling by height and slope
  // blackens fenders, spoilers and door pillars in jagged patches that read as holes.
  // It is all paint: the shape is what these are for.
  model.glass.fill(0);
  return model;
}
