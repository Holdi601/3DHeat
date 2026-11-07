import { describe, expect, it } from 'vitest';
import { VertexBuffer } from './geometry';
import { buildCar } from './glyph';
import { stateAt } from './replay';
import { BODY_ERAS, BODY_KINDS, bodyModel, eraOf } from './carBodies';
import { carBody, kindOf, matchCar, yearIn } from './carMatch';
import { shellModel } from './carModel';
import { packCarModel, packCarName, parseCarPack, type CarPack, type PackCar } from './carPack';
import { syntheticLap, DEMO_CARS } from './synthetic';

function car(key: string, make: string, model: string, year: number | null, ordinals: number[] = [], height = 1.35): PackCar {
  return {
    key,
    ordinals,
    make,
    model,
    year,
    height,
    length: 4.5,
    wheels: [
      [-0.8, 0.2, 1.4, 0.32],
      [0.8, 0.2, 1.4, 0.32],
      [-0.8, 0.2, -1.3, 0.32],
      [0.8, 0.2, -1.3, 0.32],
    ],
    lights: [],
    vertexAt: 0,
    vertices: 0,
    faceAt: 0,
    faces: 0,
  };
}

const PACK: CarPack = {
  game: 'forza-horizon',
  source: 'test',
  data: new ArrayBuffer(0),
  cars: [
    car('BMW_325i_89', 'BMW', '325i', 1989, [3037]),
    car('BMW_E36M3_97', 'BMW', 'E36M3', 1997, [382]),
    car('BMW_M4_21', 'BMW', 'M4', 2021, [3000]),
    car('BMW_X5M_11', 'BMW', 'X5M', 2011, [1500], 1.75),
    car('FOR_Mustang_18', 'Ford', 'Mustang', 2018, [3085]),
    car('FOR_Mustang_65', 'Ford', 'Mustang', 1965, [1000]),
    car('FER_F40_87', 'Ferrari', 'F40', 1987, [700], 1.13),
    car('TOY_Hilux_80', 'Toyota', 'Hilux', 1980, [800], 1.7),
    car('REN_Clio_05', 'Renault', 'Clio', 2005, [900]),
    car('REN_Clio_Traffic_05', 'Renault', 'Clio_Traffic', 2005, [901]),
  ],
};

describe('which car stands in', () => {
  it('takes the very car by its number, in the same game', () => {
    const m = matchCar({ ordinal: 382 }, 'forza-horizon', [PACK]);
    expect(m.kind).toBe('exact');
    expect(m.car?.key).toBe('BMW_E36M3_97');
  });

  it('does not take a number from another game', () => {
    const m = matchCar({ ordinal: 382, name: "Ford Mustang '20" }, 'iracing', [PACK]);
    expect(m.car?.key).toBe('FOR_Mustang_18');
  });

  it('takes the same make nearest in years for a car it does not have', () => {
    // A 3 series of 1990 with no entry of its own: the BMW of those years.
    const m = matchCar({ name: "BMW 318i '90" }, 'assetto-corsa', [PACK]);
    expect(m.kind).toBe('sameMake');
    expect(m.car?.key).toBe('BMW_325i_89');
  });

  it('prefers the same model over a nearer year', () => {
    const m = matchCar({ name: 'Ford Mustang 1970' }, 'assetto-corsa', [PACK]);
    expect(m.kind).toBe('sameModel');
    expect(m.car?.key).toBe('FOR_Mustang_65');
    expect(matchCar({ name: 'BMW E36 M3 2003' }, 'x', [PACK]).car?.key).toBe('BMW_E36M3_97');
  });

  it('works for a future number with only its name', () => {
    const m = matchCar({ ordinal: 99999, name: "Ford Mustang Dark Horse '25" }, 'forza-horizon', [PACK]);
    expect(m.kind).toBe('sameModel');
    expect(m.car?.key).toBe('FOR_Mustang_18');
  });

  it('gets its own as soon as a newer file has it', () => {
    const later: CarPack = { ...PACK, cars: [...PACK.cars, car('FOR_DarkHorse_25', 'Ford', 'DarkHorse', 2025, [99999])] };
    expect(matchCar({ ordinal: 99999 }, 'forza-horizon', [PACK]).kind).toBe('similar');
    const m = matchCar({ ordinal: 99999 }, 'forza-horizon', [later]);
    expect(m.kind).toBe('exact');
    expect(m.car?.key).toBe('FOR_DarkHorse_25');
  });

  it('falls to the same kind of body for a make it does not have', () => {
    const tall = matchCar({ name: "Tata Xenon Pickup '80" }, 'x', [PACK]);
    expect(tall.kind).toBe('similar');
    expect(tall.car?.key).toBe('TOY_Hilux_80');
    expect(matchCar({ name: "Unknownmake GT3 '87" }, 'x', [PACK]).car?.key).toBe('FER_F40_87');
  });

  it('goes by the class when a car has no name at all', () => {
    const m = matchCar({ ordinal: 123456, class: 'D' }, 'forza-horizon', [PACK]);
    expect(m.kind).toBe('similar');
    expect(m.car?.year).toBeLessThan(1990);
  });

  it('prefers a proper car to the traffic version of it', () => {
    expect(matchCar({ name: "Renault Clio '05" }, 'x', [PACK]).car?.key).toBe('REN_Clio_05');
  });

  it('takes a road car called F1 for what it is, and the car number before the name', () => {
    expect(matchCar({ name: "McLaren F1 '94" }, 'x', []).kind).toBe('plain');
    expect(matchCar({ name: "McLaren F1 '94" }, 'x', []).spec?.name).toBe('McLaren F1');
    const m = matchCar({ name: 'Dallara F3', ordinal: 382 }, 'forza-horizon', [PACK]);
    expect(m.kind).toBe('exact');
  });

  it('does not take a shared word for the model', () => {
    const pack: CarPack = { ...PACK, cars: [car('REN_5Turbo_80', 'Renault', '5Turbo', 1980, [7]), car('REN_Twingo_18', 'Renault', 'Twingo', 2018, [8])] };
    expect(matchCar({ name: "Renault Espace Turbo '18" }, 'x', [pack]).car?.key).toBe('REN_Twingo_18');
  });

  it('keeps the single-seater for an open-wheel car, but not for Formula Drift', () => {
    expect(matchCar({ name: 'Dallara F3' }, 'iracing', [PACK]).kind).toBe('openWheel');
    expect(matchCar({ name: 'Formula Renault 2.0' }, 'x', [PACK]).kind).toBe('openWheel');
    expect(matchCar({ name: "Formula Drift #98 BMW 325i '89" }, 'x', [PACK]).kind).toBe('sameModel');
  });

  it("draws the viewer's own car of the right kind and era with no file", () => {
    expect(matchCar({ name: 'Unknownmake Racer GT3' }, 'x', [])).toEqual({ kind: 'plain', body: 'supercar', era: 'modern' });
    expect(matchCar({ name: "Opel Astra '90" }, 'x', [])).toEqual({ kind: 'plain', body: 'saloon', era: 'retro' });
    expect(matchCar({ name: "Tata Xenon Pickup '95" }, 'x', [])).toEqual({ kind: 'plain', body: 'pickup', era: 'retro' });
  });

  it('builds a real car it knows at that car\'s size, the right generation by the year', () => {
    const name = (car: string) => matchCar({ name: car }, 'x', []).spec?.name;
    expect(name("BMW 318i '90")).toBe('BMW 3 Series E30');
    expect(name("BMW M3 '97")).toBe('BMW 3 Series E36');
    expect(name("BMW M3 '08")).toBe('BMW 3 Series E90');
    expect(name("Ford Mustang '65")).toBe('Ford Mustang, first');
    expect(name("Volkswagen Golf GTI '84")).toBe('Volkswagen Golf, second');
    expect(name('Mercedes-AMG G63')).toBe('Mercedes G-Class');
    expect(name("Porsche 911 '95")).toBe('Porsche 911, 964 and 993');
    expect(name("Opel Astra '90")).toBeUndefined();
    const m = matchCar({ name: "BMW M3 '97" }, 'x', []);
    const model = bodyModel(m.body, m.era, m.spec);
    let nose = -Infinity;
    let tail = Infinity;
    let wide = 0;
    for (let i = 0; i < model.positions.length; i += 3) {
      nose = Math.max(nose, model.positions[i]);
      tail = Math.min(tail, model.positions[i]);
      wide = Math.max(wide, Math.abs(model.positions[i + 1]));
    }
    expect(nose - tail).toBeCloseTo(4.43, 1);
    expect(wide * 2).toBeCloseTo(1.71, 2);
    expect(model.roof).toBeCloseTo(1.39, 2);
    expect(model.wheels[0].fx - model.wheels[2].fx).toBeCloseTo(2.7, 2);
    expect(model).not.toBe(bodyModel('saloon', 'retro'));
  });

  it('prefers the file\'s very model, and its own real car to a file\'s mere relation', () => {
    expect(matchCar({ name: 'Ford Mustang 1970' }, 'x', [PACK]).kind).toBe('sameModel');
    const noRow: CarPack = { ...PACK, cars: PACK.cars.filter((c) => c.make !== 'Mercedes') };
    const m = matchCar({ name: "Mercedes 190E '88" }, 'x', [noRow]);
    expect(m.kind).toBe('plain');
    expect(m.spec?.name).toBe('Mercedes 190');
  });

  it('reads years and kinds from names', () => {
    expect(yearIn("BMW M3 '97")).toBe(1997);
    expect(yearIn("Mazda RX-7 '02")).toBe(2002);
    expect(yearIn('Porsche 911 1973')).toBe(1973);
    expect(yearIn('BMW M4 GT3')).toBeNull();
    expect(kindOf({ name: 'Porsche Cayenne' })).toBe('suv');
    expect(kindOf({ class: 'S2' })).toBe('supercar');
    expect(kindOf({ name: 'Peel P50' })).toBe('micro');
    expect(eraOf(1979)).toBe('classic');
    expect(eraOf(1980)).toBe('retro');
    expect(eraOf(2000)).toBe('modern');
    expect(eraOf(null)).toBe('modern');
  });
});

describe('a car body', () => {
  it('stands on the road, at its real size', () => {
    const positions = new Float32Array([0, -0.1, 2, 1, -0.1, -2, -1, 1.2, 0, 1, 1.2, 0]);
    const model = shellModel(
      {
        positions,
        faces: new Uint16Array([0, 1, 2, 1, 3, 2]),
        wheels: [
          [-0.8, 0.2, 1.4, 0.3],
          [0.8, 0.2, 1.4, 0.3],
          [-0.8, 0.2, -1.3, 0.3],
          [0.8, 0.2, -1.3, 0.3],
        ],
        lights: [[0.5, 0.7, -2]],
      },
      'test',
    );
    // Forward, right, up; the road is the wheels' underside: 0.2 - 0.3 = -0.1.
    expect(Array.from(model.positions.slice(0, 3)).map((v) => +v.toFixed(5) + 0)).toEqual([2, 0, 0]);
    expect(model.roof).toBeCloseTo(1.3);
    expect(model.wheels[0]).toEqual({ fx: 1.4, side: -0.8, radius: 0.3 });
    expect(model.lights[0][0]).toBe(-2);
    expect(model.lights[0][2]).toBeCloseTo(0.8);
  });

  it('is drawn at its real size at a car size of 1, and by the factor otherwise', () => {
    // A shell 4.4 m long, 1.8 m wide and 1.3 m over the road.
    const shell = {
      positions: new Float32Array([-0.9, -0.1, 2.2, 0.9, -0.1, 2.2, 0, 1.2, -2.2]),
      faces: new Uint16Array([0, 1, 2]),
      wheels: [
        [-0.8, 0.2, 1.4, 0.3],
        [0.8, 0.2, 1.4, 0.3],
        [-0.8, 0.2, -1.3, 0.3],
        [0.8, 0.2, -1.3, 0.3],
      ],
      lights: [],
    };
    const model = shellModel(shell, 'test');
    const extent = (scale: number) => {
      const out = new VertexBuffer();
      const state = { x: 100, y: 0.3, z: 50, heading: 0, steer: 0, brake: 0, wheels: {}, values: {} } as unknown as ReturnType<typeof stateAt>;
      buildCar(out, state, [1, 0, 0], { scale, steerSign: 1, wheelSide: 1, telemetry: false, selected: false, detail: 'plain', model });
      // The body is the first triangle written: its three corners.
      const p = [0, 1, 2].map((v) => [out.data[v * 7], out.data[v * 7 + 1], out.data[v * 7 + 2]]);
      const nose = [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2, (p[0][2] + p[1][2]) / 2];
      return {
        length: Math.hypot(nose[0] - p[2][0], nose[1] - p[2][1], nose[2] - p[2][2]),
        width: Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1], p[0][2] - p[1][2]),
      };
    };
    expect(extent(1).width).toBeCloseTo(1.8, 3);
    expect(extent(2).width).toBeCloseTo(3.6, 3);
    // Nose to tail along the ground, and the tail's 1.3 m up: sqrt(4.4^2 + 1.3^2).
    expect(extent(1).length).toBeCloseTo(Math.hypot(4.4, 1.3), 3);
    expect(extent(2).length).toBeCloseTo(2 * Math.hypot(4.4, 1.3), 3);
  });

  it("has a body of each kind and era, standing on its wheels at a car's size", () => {
    for (const kind of BODY_KINDS) {
      for (const era of BODY_ERAS) {
        const m = bodyModel(kind, era);
        const n = m.faces.length / 3;
        expect(m.faces.reduce((top, v) => Math.max(top, v), 0)).toBeLessThan(m.positions.length / 3);
        let nose = -Infinity;
        let tail = Infinity;
        let low = Infinity;
        for (let i = 0; i < m.positions.length; i += 3) {
          nose = Math.max(nose, m.positions[i]);
          tail = Math.min(tail, m.positions[i]);
          low = Math.min(low, m.positions[i + 2]);
        }
        expect(nose - tail).toBeGreaterThan(2.5);
        expect(nose - tail).toBeLessThan(6);
        expect(low).toBeGreaterThan(0);
        expect(m.roof).toBeGreaterThan(1);
        expect(m.wheels[0].fx).toBeGreaterThan(0);
        expect(m.wheels[2].fx).toBeLessThan(0);
        expect(m.wheels[0].side).toBeLessThan(0);
        // Windows, and more paint than glass.
        const glass = m.glass.reduce((sum, g) => sum + g, 0);
        expect(glass).toBeGreaterThan(0);
        expect(glass).toBeLessThan(n / 2);
      }
    }
  });

  it('tells the kinds and the eras apart', () => {
    expect(bodyModel('van', 'modern').roof).toBeGreaterThan(bodyModel('saloon', 'modern').roof);
    expect(bodyModel('saloon', 'modern').roof).toBeGreaterThan(bodyModel('supercar', 'modern').roof);
    expect(bodyModel('saloon', 'classic').positions).not.toEqual(bodyModel('saloon', 'modern').positions);
  });

  it('uses the single-seater for an open-wheel lap only', () => {
    const lap = syntheticLap(DEMO_CARS[0]);
    lap.car = { name: 'Dallara F3' };
    expect(carBody(lap, []).model).toBeUndefined();
    lap.car = { name: 'Opel Astra' };
    expect(carBody(lap, []).model).toBe(bodyModel('saloon', 'modern'));
  });
});

describe('the car file', () => {
  function file(): ArrayBuffer {
    const entry = { ...car('BMW_E36M3_97', 'BMW', 'E36M3', 1997, [382]), vertices: 3, faces: 1, vertexAt: 0, faceAt: 18 };
    const header = new TextEncoder().encode(JSON.stringify({ format: 'heat3d-cars', version: 1, game: 'forza-horizon', source: 'test', cars: [entry] }));
    const pad = -(12 + header.length) & 3;
    const out = new Uint8Array(12 + header.length + pad + 24);
    out.set(new TextEncoder().encode('H3DCARS1'));
    new DataView(out.buffer).setUint32(8, header.length, true);
    out.set(header, 12);
    out.fill(32, 12 + header.length, 12 + header.length + pad);
    const start = 12 + header.length + pad;
    const view = new DataView(out.buffer);
    [1000, 200, 2000, -1000, 200, -2000, 0, 1300, 0].forEach((v, i) => view.setInt16(start + i * 2, v, true));
    [0, 1, 2].forEach((v, i) => view.setUint16(start + 18 + i * 2, v, true));
    return out.buffer;
  }

  it('reads what the extractor writes', () => {
    const pack = parseCarPack(file());
    expect(pack.game).toBe('forza-horizon');
    expect(packCarName(pack.cars[0])).toBe("BMW E36M3 '97");
    const model = packCarModel(pack, pack.cars[0]);
    expect(model.faces.length).toBe(3);
    // The road is 0.2 - 0.32 = -0.12 in the file's axes.
    expect(model.positions[0]).toBeCloseTo(2);
    expect(model.positions[1]).toBeCloseTo(1);
    expect(model.positions[2]).toBeCloseTo(0.32);
  });

  it('refuses anything else', () => {
    expect(() => parseCarPack(new TextEncoder().encode('not a car file at all').buffer)).toThrow();
  });

  it('refuses a file whose insides do not add up, rather than failing later', () => {
    const made = (change: (c: PackCar) => void, top: Record<string, unknown> = {}): ArrayBuffer => {
      const entry = { ...car('A_B_01', 'A', 'B', 2001, [1]), vertices: 3, faces: 1, vertexAt: 0, faceAt: 18 };
      change(entry);
      const header = new TextEncoder().encode(JSON.stringify({ format: 'heat3d-cars', version: 1, game: 'g', source: 's', cars: [entry], ...top }));
      const pad = -(12 + header.length) & 3;
      const out = new Uint8Array(12 + header.length + pad + 24);
      out.set(new TextEncoder().encode('H3DCARS1'));
      new DataView(out.buffer).setUint32(8, header.length, true);
      out.set(header, 12);
      const view = new DataView(out.buffer);
      [0, 1, 2].forEach((v, i) => view.setUint16(12 + header.length + pad + 18 + i * 2, v, true));
      return out.buffer;
    };
    expect(parseCarPack(made(() => {})).cars).toHaveLength(1);
    expect(() => parseCarPack(made(() => {}, { version: 99 }))).toThrow();
    expect(() => parseCarPack(made(() => {}, { cars: 'none' }))).toThrow();
    expect(() => parseCarPack(made((c) => void (c.wheels = c.wheels.slice(0, 3))))).toThrow();
    expect(() => parseCarPack(made((c) => void (c.vertexAt = 1)))).toThrow();
    expect(() => parseCarPack(made((c) => void (c.faceAt = 100000)))).toThrow();
    expect(() => parseCarPack(made((c) => void (c.vertices = 2)))).toThrow();
  });
});
