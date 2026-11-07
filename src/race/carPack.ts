/**
 * The car file `python -m heat3d_gamefiles cars` writes: each car of an
 * installed game at the game's own low detail, its wheels and its tail lights.
 *
 * The shapes are the game's, so the viewer ships none: the file is made on the
 * machine the game is on, loaded once, and kept in this browser.
 */

import { shellModel, type CarModel } from './carModel';

/** A car in the file. Numbers are metres, in the car's axes: x right, y up, z forward. */
export interface PackCar {
  key: string;
  ordinals: number[];
  make: string;
  model: string;
  year: number | null;
  /** Roof over the road, and nose to tail. */
  height: number;
  length: number;
  /** x, y, z, radius of each wheel: FL, FR, RL, RR. */
  wheels: number[][];
  lights: number[][];
  vertexAt: number;
  vertices: number;
  faceAt: number;
  faces: number;
}

export interface CarPack {
  game: string;
  source: string;
  cars: PackCar[];
  data: ArrayBuffer;
}

const MAGIC = 'H3DCARS1';
const FORMAT_VERSION = 1;

/** Read a file's bytes, after the gzip. Throws on anything that is not a car file. */
export function parseCarPack(raw: ArrayBuffer): CarPack {
  const bytes = new Uint8Array(raw);
  if (raw.byteLength < 12 || String.fromCharCode(...bytes.subarray(0, 8)) !== MAGIC) {
    throw new Error('not a car file');
  }
  const length = new DataView(raw).getUint32(8, true);
  const header = JSON.parse(new TextDecoder().decode(bytes.subarray(12, 12 + length))) as Omit<CarPack, 'data'> & { version?: number };
  const start = 12 + length + (-(12 + length) & 3);
  if (header.version !== FORMAT_VERSION || typeof header.game !== 'string' || !Array.isArray(header.cars)) {
    throw new Error('not a car file this viewer can read');
  }
  const data = raw.slice(start);
  for (const car of header.cars) checkCar(car, data);
  return { game: header.game, source: header.source, cars: header.cars, data };
}

/** Everything a car's drawing relies on, checked here so that a bad file is refused whole. */
function checkCar(car: PackCar, data: ArrayBuffer): void {
  const bad = (what: string) => new Error(`car file: ${car?.key ?? 'a car'}: ${what}`);
  const wholeWheels = Array.isArray(car.wheels) && car.wheels.length === 4 && car.wheels.every((w) => Array.isArray(w) && w.length === 4 && w.every(Number.isFinite));
  if (!wholeWheels) throw bad('wheels');
  const fits = (at: number, count: number, size: number) =>
    Number.isInteger(at) && Number.isInteger(count) && at >= 0 && count >= 0 && at % 2 === 0 && at + count * size <= data.byteLength;
  if (!fits(car.vertexAt, car.vertices, 6) || !fits(car.faceAt, car.faces, 6)) throw bad('data past the end of the file');
  const view = new DataView(data, car.faceAt, car.faces * 6);
  for (let i = 0; i < car.faces * 3; i++) if (view.getUint16(i * 2, true) >= car.vertices) throw bad('a face past the vertices');
}

export async function readCarPack(file: Blob): Promise<CarPack> {
  const stream = file.stream().pipeThrough(new DecompressionStream('gzip'));
  return parseCarPack(await new Response(stream).arrayBuffer());
}

/** How a car of the file is called: the make, the model tag, the year. */
export function packCarName(car: PackCar): string {
  const year = car.year === null ? '' : ` '${String(car.year % 100).padStart(2, '0')}`;
  return `${car.make} ${car.model.replace(/_/g, ' ')}${year}`;
}

/** One car of the file, ready to draw; made once for each car in use. */
const made = new WeakMap<PackCar, CarModel>();

export function packCarModel(pack: CarPack, car: PackCar): CarModel {
  let model = made.get(car);
  if (!model) {
    const raw = new Int16Array(pack.data.slice(car.vertexAt, car.vertexAt + car.vertices * 6));
    const positions = new Float32Array(raw.length);
    for (let i = 0; i < raw.length; i++) positions[i] = raw[i] / 1000;
    const faces = new Uint16Array(pack.data.slice(car.faceAt, car.faceAt + car.faces * 6));
    model = shellModel({ positions, faces, wheels: car.wheels, lights: car.lights }, packCarName(car));
    made.set(car, model);
  }
  return model;
}

const DB_NAME = 'heat3d-cars';
const STORE = 'packs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'game' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('car store'));
  });
}

/** Keep a file for next time, in place of the same game's earlier one. */
export async function saveCarPack(pack: CarPack): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(pack);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('car store'));
      // A full disk aborts the transaction without an error event.
      tx.onabort = () => reject(tx.error ?? new Error('car store'));
    });
  } finally {
    db.close();
  }
}

/** The files kept in this browser; none where storage is blocked. */
export async function storedCarPacks(): Promise<CarPack[]> {
  try {
    const db = await openDb();
    const packs = await new Promise<CarPack[]>((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll() as IDBRequest<CarPack[]>;
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('car store'));
    });
    db.close();
    return packs;
  } catch {
    return [];
  }
}
