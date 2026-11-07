/**
 * Real cars the viewer knows: for one generation, its published length, width,
 * height and wheelbase in metres, rounded, and what makes it recognisable from
 * across a track - the line of its roof and tail, its headlamps, its wing, its
 * arches. `carBodies.ts` builds the body from these, modelled here after the real
 * car: no badge, no maker's grille, and nothing read out of any game.
 *
 * To add a car, add a line. `words` is tried against the lap's car name with the
 * make taken out; of the lines that match, the one whose years hold the car's
 * year wins, else the nearest.
 */

import type { BodyKind } from './carBodies';

/**
 * A silhouette. The cabin's points run forward from the car's middle as shares of
 * half its length; the lower body's heights are shares of its height.
 */
export interface CarLook {
  screen: number;
  roofFront: number;
  roofBack: number;
  rearScreen: number;
  nose: number;
  cowl: number;
  deck: number;
  tail: number;
  /** The cabin's top half-width, as a share of the body's. */
  tumble: number;
  /** How far the roof curves, 0 flat to 1 a single arch. */
  arch?: number;
}

export type Lamps = 'round2' | 'round4' | 'rect' | 'slim' | 'hidden';
export type Wing = 'none' | 'lip' | 'duck' | 'whale' | 'gt';

export interface CarSpec {
  look?: CarLook;
  lamps?: Lamps;
  wing?: Wing;
  /** How far the arches stand out from the body's sides, metres. */
  flare?: number;
  name: string;
  make: string;
  words: RegExp;
  from: number;
  to: number;
  kind: BodyKind;
  length: number;
  width: number;
  height: number;
  wheelbase: number;
}

type Row = [name: string, make: string, words: RegExp, from: number, to: number, kind: BodyKind, length: number, width: number, height: number, wheelbase: number];

const BMW_3 = /\b(3[0-9]{2}[a-z]{0,2}|m3|3 series|3er|e30|e36|e46|e9[0-3]|f30|f80|g20|g80)\b/i;
const BMW_5 = /\b(5[0-9]{2}[a-z]{0,2}|m5|5 series|5er)\b/i;
const GOLF = /\b(golf|gti|rabbit)\b/i;
const NINE11 = /\b(911|964|993|996|997|991|992|carrera|gt3)\b/i;

const ROWS: Row[] = [
  ['BMW 2002', 'BMW', /\b(2002|02)\b/i, 1966, 1976, 'saloon', 4.23, 1.59, 1.41, 2.5],
  ['BMW 3 Series E30', 'BMW', BMW_3, 1982, 1993, 'saloon', 4.33, 1.65, 1.38, 2.57],
  ['BMW 3 Series E36', 'BMW', BMW_3, 1990, 2000, 'saloon', 4.43, 1.71, 1.39, 2.7],
  ['BMW 3 Series E46', 'BMW', BMW_3, 2001, 2006, 'saloon', 4.47, 1.74, 1.42, 2.73],
  ['BMW 3 Series E90', 'BMW', BMW_3, 2007, 2013, 'saloon', 4.52, 1.82, 1.42, 2.76],
  ['BMW 3 Series F30', 'BMW', BMW_3, 2014, 2019, 'saloon', 4.67, 1.88, 1.43, 2.81],
  ['BMW 3 Series G20', 'BMW', BMW_3, 2020, 2030, 'saloon', 4.71, 1.83, 1.44, 2.85],
  ['BMW 5 Series E34', 'BMW', BMW_5, 1988, 1996, 'saloon', 4.72, 1.75, 1.41, 2.76],
  ['BMW 5 Series E39', 'BMW', BMW_5, 1997, 2003, 'saloon', 4.78, 1.8, 1.44, 2.83],
  ['BMW 5 Series E60', 'BMW', BMW_5, 2004, 2010, 'saloon', 4.84, 1.85, 1.47, 2.89],
  ['BMW 5 Series F10', 'BMW', BMW_5, 2011, 2017, 'saloon', 4.91, 1.86, 1.46, 2.97],
  ['BMW M1', 'BMW', /\bm1\b/i, 1978, 1981, 'supercar', 4.36, 1.82, 1.14, 2.56],
  ['BMW M2', 'BMW', /\bm2\b/i, 2016, 2030, 'coupe', 4.47, 1.85, 1.41, 2.69],
  ['BMW M4', 'BMW', /\b(m4|4 series)\b/i, 2014, 2030, 'coupe', 4.67, 1.87, 1.38, 2.81],
  ['BMW Z4', 'BMW', /\bz4\b/i, 2003, 2030, 'sports', 4.24, 1.79, 1.29, 2.5],
  ['BMW X5', 'BMW', /\bx5\b/i, 2000, 2030, 'suv', 4.85, 1.93, 1.77, 2.93],
  ['Porsche 911, early', 'Porsche', NINE11, 1964, 1988, 'sports', 4.16, 1.61, 1.32, 2.27],
  ['Porsche 911, 964 and 993', 'Porsche', NINE11, 1989, 1998, 'sports', 4.25, 1.65, 1.31, 2.27],
  ['Porsche 911, 996 and 997', 'Porsche', NINE11, 1999, 2012, 'sports', 4.43, 1.81, 1.3, 2.35],
  ['Porsche 911, 991 and 992', 'Porsche', NINE11, 2013, 2030, 'sports', 4.52, 1.85, 1.3, 2.45],
  ['Porsche Cayman and Boxster', 'Porsche', /\b(cayman|boxster|718)\b/i, 1997, 2030, 'sports', 4.38, 1.8, 1.29, 2.48],
  ['Ford Mustang, first', 'Ford', /\bmustang\b/i, 1964, 1973, 'muscle', 4.61, 1.73, 1.3, 2.74],
  ['Ford Mustang, S197', 'Ford', /\bmustang\b/i, 2005, 2014, 'muscle', 4.78, 1.88, 1.41, 2.72],
  ['Ford Mustang, S550', 'Ford', /\bmustang\b/i, 2015, 2030, 'muscle', 4.79, 1.92, 1.38, 2.72],
  ['Ford Focus, first', 'Ford', /\bfocus\b/i, 1998, 2004, 'hatch', 4.17, 1.7, 1.43, 2.62],
  ['Ford Focus, third', 'Ford', /\bfocus\b/i, 2011, 2018, 'hatch', 4.39, 1.82, 1.47, 2.65],
  ['Ford Fiesta', 'Ford', /\bfiesta\b/i, 2008, 2023, 'hatch', 3.98, 1.72, 1.48, 2.49],
  ['Ford Escort', 'Ford', /\bescort\b/i, 1968, 1980, 'saloon', 4.21, 1.73, 1.43, 2.55],
  ['Ford F-150', 'Ford', /\b(f-?150|raptor)\b/i, 2009, 2030, 'pickup', 5.89, 2.1, 1.98, 3.68],
  ['Ford GT', 'Ford', /\bgt\b(?!.*mustang)/i, 2005, 2022, 'supercar', 4.7, 1.97, 1.12, 2.71],
  ['Chevrolet Camaro, first', 'Chevrolet', /\bcamaro\b/i, 1967, 1969, 'muscle', 4.7, 1.85, 1.3, 2.75],
  ['Chevrolet Camaro, fifth', 'Chevrolet', /\bcamaro\b/i, 2010, 2015, 'muscle', 4.84, 1.92, 1.38, 2.85],
  ['Chevrolet Corvette, C1', 'Chevrolet', /\bcorvette\b/i, 1953, 1962, 'sports', 4.25, 1.8, 1.3, 2.59],
  ['Chevrolet Corvette, C6', 'Chevrolet', /\bcorvette\b/i, 2005, 2013, 'sports', 4.43, 1.84, 1.25, 2.69],
  ['Chevrolet Corvette, C7', 'Chevrolet', /\bcorvette\b/i, 2014, 2019, 'sports', 4.49, 1.88, 1.24, 2.71],
  ['Chevrolet Corvette, C8', 'Chevrolet', /\bcorvette\b/i, 2020, 2030, 'supercar', 4.63, 1.93, 1.24, 2.72],
  ['Dodge Challenger, first', 'Dodge', /\bchallenger\b/i, 1970, 1974, 'muscle', 4.86, 1.95, 1.3, 2.79],
  ['Dodge Challenger, third', 'Dodge', /\bchallenger\b/i, 2008, 2023, 'muscle', 5.02, 1.92, 1.45, 2.95],
  ['Dodge Viper', 'Dodge', /\bviper\b/i, 1992, 2017, 'sports', 4.46, 1.94, 1.25, 2.51],
  ['Nissan Skyline R32', 'Nissan', /\b(skyline|r32)\b/i, 1989, 1994, 'coupe', 4.55, 1.76, 1.34, 2.62],
  ['Nissan Skyline R34', 'Nissan', /\b(skyline|r33|r34)\b/i, 1995, 2002, 'coupe', 4.6, 1.79, 1.36, 2.67],
  ['Nissan GT-R', 'Nissan', /\b(gt-?r|r35)\b/i, 2007, 2030, 'coupe', 4.71, 1.9, 1.37, 2.78],
  ['Nissan Silvia', 'Nissan', /\b(silvia|s13|s14|s15|180sx|240sx)\b/i, 1988, 2002, 'coupe', 4.45, 1.7, 1.29, 2.47],
  ['Datsun 240Z', 'Datsun', /\b(240z|260z|280z)\b/i, 1969, 1978, 'sports', 4.14, 1.63, 1.28, 2.31],
  ['Nissan 350Z and 370Z', 'Nissan', /\b(350z|370z)\b/i, 2002, 2020, 'sports', 4.31, 1.82, 1.32, 2.65],
  ['Toyota Supra A80', 'Toyota', /\bsupra\b/i, 1993, 2002, 'sports', 4.52, 1.81, 1.28, 2.55],
  ['Toyota Supra A90', 'Toyota', /\bsupra\b/i, 2019, 2030, 'sports', 4.38, 1.85, 1.29, 2.47],
  ['Toyota Corolla AE86', 'Toyota', /\b(ae86|sprinter|trueno|levin)\b/i, 1983, 1987, 'coupe', 4.2, 1.63, 1.33, 2.4],
  ['Toyota GT86', 'Toyota', /\b(gt ?86|86|gr86)\b/i, 2012, 2030, 'sports', 4.24, 1.78, 1.29, 2.57],
  ['Toyota Hilux', 'Toyota', /\bhilux\b/i, 1980, 2030, 'pickup', 5.33, 1.86, 1.82, 3.09],
  ['Toyota GR Yaris', 'Toyota', /\byaris\b/i, 2020, 2030, 'hatch', 3.99, 1.81, 1.46, 2.56],
  ['Mazda MX-5, first', 'Mazda', /\b(mx-?5|miata)\b/i, 1989, 1997, 'sports', 3.97, 1.68, 1.23, 2.27],
  ['Mazda MX-5, fourth', 'Mazda', /\b(mx-?5|miata)\b/i, 2015, 2030, 'sports', 3.92, 1.73, 1.23, 2.31],
  ['Mazda RX-7', 'Mazda', /\brx-?7\b/i, 1992, 2002, 'sports', 4.29, 1.76, 1.23, 2.43],
  ['Honda Civic, sixth', 'Honda', /\bcivic\b/i, 1995, 2000, 'hatch', 4.18, 1.7, 1.36, 2.62],
  ['Honda Civic, tenth', 'Honda', /\bcivic\b/i, 2017, 2030, 'hatch', 4.56, 1.88, 1.43, 2.7],
  ['Honda NSX, first', 'Honda', /\bnsx\b/i, 1990, 2005, 'supercar', 4.43, 1.81, 1.17, 2.53],
  ['Honda S2000', 'Honda', /\bs2000\b/i, 1999, 2009, 'sports', 4.12, 1.75, 1.29, 2.4],
  ['Subaru Impreza, first', 'Subaru', /\b(impreza|wrx|sti)\b/i, 1992, 2000, 'saloon', 4.34, 1.69, 1.41, 2.52],
  ['Subaru Impreza, second', 'Subaru', /\b(impreza|wrx|sti)\b/i, 2001, 2030, 'saloon', 4.42, 1.74, 1.44, 2.54],
  ['Mitsubishi Lancer Evolution VI', 'Mitsubishi', /\b(lancer|evo\w*)\b/i, 1996, 2006, 'saloon', 4.35, 1.77, 1.41, 2.51],
  ['Mitsubishi Lancer Evolution X', 'Mitsubishi', /\b(lancer|evo\w*)\b/i, 2007, 2016, 'saloon', 4.5, 1.81, 1.48, 2.65],
  ['Volkswagen Golf, first', 'Volkswagen', GOLF, 1974, 1983, 'hatch', 3.71, 1.61, 1.39, 2.4],
  ['Volkswagen Golf, second', 'Volkswagen', GOLF, 1984, 1991, 'hatch', 3.99, 1.68, 1.41, 2.47],
  ['Volkswagen Golf, fourth', 'Volkswagen', GOLF, 1998, 2003, 'hatch', 4.15, 1.74, 1.44, 2.51],
  ['Volkswagen Golf, seventh', 'Volkswagen', GOLF, 2013, 2030, 'hatch', 4.27, 1.8, 1.45, 2.63],
  ['Volkswagen Beetle', 'Volkswagen', /\b(beetle|bug|käfer)\b/i, 1950, 1979, 'saloon', 4.08, 1.54, 1.5, 2.4],
  ['Audi R8', 'Audi', /\br8\b/i, 2007, 2030, 'supercar', 4.43, 1.9, 1.25, 2.65],
  ['Audi RS 6', 'Audi', /\b(rs ?6|a6)\b/i, 2002, 2030, 'estate', 5.0, 1.95, 1.46, 2.93],
  ['Audi Quattro', 'Audi', /\bquattro\b/i, 1980, 1991, 'coupe', 4.4, 1.72, 1.35, 2.52],
  ['Audi TT', 'Audi', /\btt\b/i, 1998, 2023, 'sports', 4.19, 1.83, 1.35, 2.51],
  ['Mercedes 190', 'Mercedes', /\b190\w*\b/i, 1982, 1993, 'saloon', 4.45, 1.71, 1.36, 2.67],
  ['Mercedes C-Class', 'Mercedes', /\b(c ?63|c-?class|c ?43)\b/i, 2007, 2030, 'saloon', 4.69, 1.84, 1.44, 2.84],
  ['Mercedes G-Class', 'Mercedes', /\b(g ?63|g-?class|g ?500)\b/i, 1979, 2030, 'suv', 4.76, 1.86, 1.95, 2.85],
  ['Mercedes-AMG GT', 'Mercedes', /\bamg gt\b|\bgt ?[rs63]*\b/i, 2015, 2030, 'sports', 4.55, 1.94, 1.29, 2.63],
  ['Ferrari F40', 'Ferrari', /\bf40\b/i, 1987, 1992, 'supercar', 4.36, 1.97, 1.12, 2.45],
  ['Ferrari Testarossa', 'Ferrari', /\btestarossa\b/i, 1984, 1996, 'supercar', 4.49, 1.98, 1.13, 2.55],
  ['Ferrari 458 and 488', 'Ferrari', /\b(458|488)\b/i, 2009, 2020, 'supercar', 4.55, 1.95, 1.21, 2.65],
  ['Ferrari LaFerrari', 'Ferrari', /\blaferrari\b/i, 2013, 2018, 'supercar', 4.7, 1.99, 1.12, 2.65],
  ['Lamborghini Countach', 'Lamborghini', /\bcountach\b/i, 1974, 1990, 'supercar', 4.14, 2.0, 1.07, 2.45],
  ['Lamborghini Huracan', 'Lamborghini', /\bhurac[aá]n\b/i, 2014, 2024, 'supercar', 4.46, 1.92, 1.17, 2.62],
  ['Lamborghini Aventador', 'Lamborghini', /\baventador\b/i, 2011, 2022, 'supercar', 4.78, 2.03, 1.14, 2.7],
  ['McLaren F1', 'McLaren', /\bf1\b/i, 1992, 1998, 'supercar', 4.29, 1.82, 1.14, 2.72],
  ['McLaren P1', 'McLaren', /\bp1\b/i, 2013, 2015, 'supercar', 4.59, 1.95, 1.19, 2.67],
  ['McLaren 720S', 'McLaren', /\b(720s|650s|570s)\b/i, 2014, 2030, 'supercar', 4.54, 1.93, 1.2, 2.67],
  ['Bugatti Veyron', 'Bugatti', /\bveyron\b/i, 2005, 2015, 'supercar', 4.46, 2.0, 1.19, 2.71],
  ['Bugatti Chiron', 'Bugatti', /\bchiron\b/i, 2016, 2030, 'supercar', 4.54, 2.04, 1.21, 2.71],
  ['Aston Martin DB5', 'Aston Martin', /\bdb5\b/i, 1963, 1965, 'coupe', 4.57, 1.68, 1.34, 2.49],
  ['Lancia Delta', 'Lancia', /\b(delta|integrale)\b/i, 1986, 1995, 'hatch', 3.9, 1.7, 1.37, 2.48],
  ['Lancia Stratos', 'Lancia', /\bstratos\b/i, 1973, 1978, 'sports', 3.71, 1.75, 1.11, 2.18],
  ['Peugeot 205', 'Peugeot', /\b205\b/i, 1983, 1998, 'hatch', 3.71, 1.57, 1.35, 2.42],
  ['Renault 5 Turbo', 'Renault', /\b5 turbo\b|\br5\b/i, 1980, 1986, 'hatch', 3.66, 1.75, 1.32, 2.43],
  ['Renault Clio', 'Renault', /\bclio\b/i, 1998, 2030, 'hatch', 4.05, 1.73, 1.45, 2.59],
  ['Mini, classic', 'MINI', /\b(mini|cooper)\b/i, 1959, 2000, 'micro', 3.05, 1.41, 1.35, 2.04],
  ['Mini, modern', 'MINI', /\b(mini|cooper|jcw)\b/i, 2001, 2030, 'hatch', 3.82, 1.73, 1.41, 2.5],
  ['Jeep Wrangler', 'Jeep', /\bwrangler\b/i, 1987, 2030, 'suv', 4.22, 1.87, 1.8, 2.42],
  ['Land Rover Defender', 'Land Rover', /\bdefender\b/i, 1983, 2016, 'suv', 4.0, 1.79, 1.97, 2.36],
  ['Alfa Romeo 4C', 'Alfa Romeo', /\b4c\b/i, 2013, 2020, 'sports', 3.99, 1.87, 1.18, 2.38],
  ['Alfa Romeo Giulia', 'Alfa Romeo', /\bgiulia\b/i, 2016, 2030, 'saloon', 4.64, 1.86, 1.44, 2.82],
];

const LOOKS: Record<string, CarLook> = {
  /** Upright 1970s-80s three-box: flat bonnet and deck, big glass. */
  box: { screen: 0.4, roofFront: 0.18, roofBack: -0.4, rearScreen: -0.58, nose: 0.58, cowl: 0.64, deck: 0.66, tail: 0.66, tumble: 0.88 },
  /** The saloon that followed: a raked screen and a rising tail. */
  saloon: { screen: 0.46, roofFront: 0.1, roofBack: -0.36, rearScreen: -0.62, nose: 0.52, cowl: 0.65, deck: 0.7, tail: 0.69, tumble: 0.8, arch: 0.12 },
  /** Wide two-door with a long roof. */
  coupe: { screen: 0.44, roofFront: 0.06, roofBack: -0.34, rearScreen: -0.7, nose: 0.48, cowl: 0.63, deck: 0.68, tail: 0.68, tumble: 0.76, arch: 0.15 },
  /** Engine behind the rear axle: the roof a curve running down to the tail. */
  rearEngine: { screen: 0.34, roofFront: 0.02, roofBack: -0.3, rearScreen: -0.92, nose: 0.48, cowl: 0.6, deck: 0.62, tail: 0.52, tumble: 0.78, arch: 0.45 },
  /** Long bonnet, short deck, fastback. */
  fastback: { screen: 0.08, roofFront: -0.18, roofBack: -0.42, rearScreen: -0.88, nose: 0.62, cowl: 0.68, deck: 0.7, tail: 0.72, tumble: 0.74, arch: 0.1 },
  /** Long bonnet, cabin set back, two seats. */
  longNose: { screen: 0.1, roofFront: -0.14, roofBack: -0.42, rearScreen: -0.62, nose: 0.5, cowl: 0.64, deck: 0.66, tail: 0.68, tumble: 0.72, arch: 0.25 },
  /** The 1970s-90s mid-engine wedge: a straight line from nose to tail. */
  wedge: { screen: 0.62, roofFront: 0.14, roofBack: -0.2, rearScreen: -0.8, nose: 0.34, cowl: 0.6, deck: 0.74, tail: 0.8, tumble: 0.64 },
  /** Today's mid-engine shape: a low nose and a cab far forward. */
  midEngine: { screen: 0.68, roofFront: 0.08, roofBack: -0.24, rearScreen: -0.84, nose: 0.3, cowl: 0.56, deck: 0.7, tail: 0.74, tumble: 0.64, arch: 0.2 },
  /** Two-box with a near-upright tailgate. */
  hatch: { screen: 0.42, roofFront: 0.12, roofBack: -0.76, rearScreen: -0.94, nose: 0.52, cowl: 0.64, deck: 0.68, tail: 0.68, tumble: 0.84 },
  /** Long roof to the very tail. */
  estate: { screen: 0.4, roofFront: 0.12, roofBack: -0.86, rearScreen: -0.97, nose: 0.5, cowl: 0.65, deck: 0.68, tail: 0.68, tumble: 0.82 },
  /** Upright and square at both ends, the bonnet almost level with the belt. */
  boxOffRoad: { screen: 0.46, roofFront: 0.38, roofBack: -0.92, rearScreen: -0.98, nose: 0.6, cowl: 0.62, deck: 0.62, tail: 0.62, tumble: 0.95 },
  /** Round and arched: the roof a single curve over a small cabin, the tail falling away. */
  round: { screen: 0.36, roofFront: 0.1, roofBack: -0.3, rearScreen: -0.82, nose: 0.44, cowl: 0.56, deck: 0.58, tail: 0.44, tumble: 0.74, arch: 1 },
  /** Small and square: a tall cabin on four corners. */
  smallBox: { screen: 0.5, roofFront: 0.3, roofBack: -0.62, rearScreen: -0.8, nose: 0.58, cowl: 0.62, deck: 0.64, tail: 0.64, tumble: 0.9 },
};

/** What sets each car apart: its silhouette, headlamps, wing and arches. */
const TRAITS: Record<string, [look: keyof typeof LOOKS, lamps: Lamps, wing: Wing, flare: number]> = {
  'BMW 2002': ['box', 'round2', 'none', 0],
  'BMW 3 Series E30': ['box', 'round4', 'lip', 0.02],
  'BMW 3 Series E36': ['saloon', 'round4', 'none', 0],
  'BMW 3 Series E46': ['saloon', 'rect', 'none', 0.01],
  'BMW 3 Series E90': ['saloon', 'slim', 'none', 0.01],
  'BMW 3 Series F30': ['saloon', 'slim', 'none', 0.02],
  'BMW 3 Series G20': ['saloon', 'slim', 'none', 0.02],
  'BMW 5 Series E34': ['box', 'round4', 'none', 0],
  'BMW 5 Series E39': ['saloon', 'round4', 'none', 0],
  'BMW 5 Series E60': ['saloon', 'slim', 'none', 0],
  'BMW 5 Series F10': ['saloon', 'slim', 'none', 0],
  'BMW M1': ['wedge', 'hidden', 'none', 0.03],
  'BMW M2': ['coupe', 'slim', 'lip', 0.04],
  'BMW M4': ['coupe', 'slim', 'lip', 0.03],
  'BMW Z4': ['longNose', 'slim', 'none', 0.02],
  'BMW X5': ['estate', 'slim', 'none', 0.02],
  'Porsche 911, early': ['rearEngine', 'round2', 'duck', 0.02],
  'Porsche 911, 964 and 993': ['rearEngine', 'round2', 'whale', 0.04],
  'Porsche 911, 996 and 997': ['rearEngine', 'round2', 'lip', 0.03],
  'Porsche 911, 991 and 992': ['rearEngine', 'round2', 'lip', 0.03],
  'Porsche Cayman and Boxster': ['midEngine', 'round2', 'lip', 0.02],
  'Ford Mustang, first': ['fastback', 'round2', 'none', 0],
  'Ford Mustang, S197': ['fastback', 'round2', 'lip', 0.02],
  'Ford Mustang, S550': ['fastback', 'slim', 'lip', 0.03],
  'Ford Focus, first': ['hatch', 'rect', 'lip', 0],
  'Ford Focus, third': ['hatch', 'slim', 'lip', 0.02],
  'Ford Fiesta': ['hatch', 'slim', 'lip', 0],
  'Ford Escort': ['box', 'round2', 'none', 0.05],
  'Ford F-150': ['saloon', 'rect', 'none', 0.03],
  'Ford GT': ['midEngine', 'slim', 'none', 0.03],
  'Chevrolet Camaro, first': ['fastback', 'round2', 'none', 0],
  'Chevrolet Camaro, fifth': ['fastback', 'slim', 'lip', 0.03],
  'Chevrolet Corvette, C1': ['longNose', 'round2', 'none', 0.03],
  'Chevrolet Corvette, C6': ['longNose', 'slim', 'lip', 0.03],
  'Chevrolet Corvette, C7': ['longNose', 'slim', 'lip', 0.03],
  'Chevrolet Corvette, C8': ['midEngine', 'slim', 'lip', 0.03],
  'Dodge Challenger, first': ['fastback', 'round4', 'none', 0],
  'Dodge Challenger, third': ['fastback', 'round4', 'lip', 0.02],
  'Dodge Viper': ['longNose', 'slim', 'none', 0.05],
  'Nissan Skyline R32': ['coupe', 'rect', 'gt', 0.03],
  'Nissan Skyline R34': ['coupe', 'rect', 'gt', 0.03],
  'Nissan GT-R': ['coupe', 'slim', 'gt', 0.04],
  'Nissan Silvia': ['coupe', 'hidden', 'lip', 0],
  'Datsun 240Z': ['fastback', 'round2', 'none', 0],
  'Nissan 350Z and 370Z': ['fastback', 'slim', 'lip', 0.03],
  'Toyota Supra A80': ['fastback', 'rect', 'gt', 0.03],
  'Toyota Supra A90': ['longNose', 'slim', 'duck', 0.04],
  'Toyota Corolla AE86': ['coupe', 'hidden', 'lip', 0],
  'Toyota GT86': ['coupe', 'slim', 'lip', 0.02],
  'Toyota Hilux': ['saloon', 'rect', 'none', 0.03],
  'Toyota GR Yaris': ['hatch', 'slim', 'lip', 0.04],
  'Mazda MX-5, first': ['longNose', 'hidden', 'none', 0],
  'Mazda MX-5, fourth': ['longNose', 'slim', 'none', 0.02],
  'Mazda RX-7': ['round', 'hidden', 'lip', 0.03],
  'Honda Civic, sixth': ['hatch', 'rect', 'lip', 0],
  'Honda Civic, tenth': ['hatch', 'slim', 'gt', 0.04],
  'Honda NSX, first': ['wedge', 'hidden', 'lip', 0.02],
  'Honda S2000': ['longNose', 'rect', 'none', 0.02],
  'Subaru Impreza, first': ['saloon', 'rect', 'gt', 0.02],
  'Subaru Impreza, second': ['saloon', 'rect', 'gt', 0.03],
  'Mitsubishi Lancer Evolution VI': ['saloon', 'rect', 'gt', 0.03],
  'Mitsubishi Lancer Evolution X': ['saloon', 'slim', 'gt', 0.03],
  'Volkswagen Golf, first': ['hatch', 'round2', 'none', 0],
  'Volkswagen Golf, second': ['hatch', 'round2', 'none', 0],
  'Volkswagen Golf, fourth': ['hatch', 'rect', 'lip', 0],
  'Volkswagen Golf, seventh': ['hatch', 'slim', 'lip', 0.01],
  'Volkswagen Beetle': ['round', 'round2', 'none', 0.05],
  'Audi R8': ['midEngine', 'slim', 'none', 0.03],
  'Audi RS 6': ['estate', 'slim', 'lip', 0.05],
  'Audi Quattro': ['box', 'rect', 'lip', 0.05],
  'Audi TT': ['round', 'slim', 'lip', 0.02],
  'Mercedes 190': ['box', 'rect', 'lip', 0.01],
  'Mercedes C-Class': ['saloon', 'slim', 'lip', 0.03],
  'Mercedes G-Class': ['boxOffRoad', 'round2', 'none', 0.03],
  'Mercedes-AMG GT': ['longNose', 'slim', 'lip', 0.03],
  'Ferrari F40': ['wedge', 'hidden', 'gt', 0.03],
  'Ferrari Testarossa': ['wedge', 'hidden', 'none', 0.06],
  'Ferrari 458 and 488': ['midEngine', 'slim', 'lip', 0.03],
  'Ferrari LaFerrari': ['midEngine', 'slim', 'lip', 0.04],
  'Lamborghini Countach': ['wedge', 'hidden', 'gt', 0.05],
  'Lamborghini Huracan': ['midEngine', 'slim', 'none', 0.03],
  'Lamborghini Aventador': ['midEngine', 'slim', 'lip', 0.03],
  'McLaren F1': ['midEngine', 'slim', 'none', 0.02],
  'McLaren P1': ['midEngine', 'slim', 'whale', 0.03],
  'McLaren 720S': ['midEngine', 'slim', 'lip', 0.02],
  'Bugatti Veyron': ['round', 'slim', 'lip', 0.04],
  'Bugatti Chiron': ['midEngine', 'slim', 'lip', 0.04],
  'Aston Martin DB5': ['longNose', 'round2', 'none', 0],
  'Lancia Delta': ['hatch', 'round4', 'lip', 0.06],
  'Lancia Stratos': ['round', 'hidden', 'whale', 0.04],
  'Peugeot 205': ['hatch', 'rect', 'none', 0],
  'Renault 5 Turbo': ['hatch', 'rect', 'lip', 0.08],
  'Renault Clio': ['hatch', 'slim', 'lip', 0.01],
  'Mini, classic': ['smallBox', 'round2', 'none', 0.02],
  'Mini, modern': ['smallBox', 'round2', 'lip', 0.02],
  'Jeep Wrangler': ['boxOffRoad', 'round2', 'none', 0.05],
  'Land Rover Defender': ['boxOffRoad', 'round2', 'none', 0.03],
  'Alfa Romeo 4C': ['midEngine', 'round2', 'lip', 0.03],
  'Alfa Romeo Giulia': ['saloon', 'slim', 'lip', 0.02],
};

export const CAR_SPECS: CarSpec[] = ROWS.map(([name, make, words, from, to, kind, length, width, height, wheelbase]) => ({
  look: TRAITS[name] ? LOOKS[TRAITS[name][0]] : undefined,
  lamps: TRAITS[name]?.[1],
  wing: TRAITS[name]?.[2],
  flare: TRAITS[name]?.[3],
  name,
  make,
  words,
  from,
  to,
  kind,
  length,
  width,
  height,
  wheelbase,
}));

const OTHER_MAKE_NAMES: Record<string, string[]> = {
  Mercedes: ['mercedes-benz', 'mercedes-amg', 'mercedes', 'amg', 'benz'],
  Volkswagen: ['volkswagen', 'vw'],
  Chevrolet: ['chevrolet', 'chevy'],
  'Alfa Romeo': ['alfa romeo', 'alfa'],
  'Aston Martin': ['aston martin', 'aston'],
  MINI: ['mini'],
};

/** The generation of a car this name speaks of, or null. */
export function findSpec(name: string, year: number | null): CarSpec | null {
  const low = name.toLowerCase();
  let best: CarSpec | null = null;
  let bestGap = Infinity;
  for (const spec of CAR_SPECS) {
    const makes = OTHER_MAKE_NAMES[spec.make] ?? [spec.make.toLowerCase()];
    const said = makes.find((m) => new RegExp(`(^|[^a-z0-9])${m.replace(/[-]/g, '.')}([^a-z0-9]|$)`).test(low));
    if (!said) continue;
    // MINI names itself by the make alone, so keep the name whole for it.
    const rest = spec.make === 'MINI' ? low : low.replace(said, ' ');
    if (!spec.words.test(rest)) continue;
    // No year: the newest generation.
    const gap = year === null ? 3000 - spec.to : year < spec.from ? spec.from - year : year > spec.to ? year - spec.to : 0;
    if (gap < bestGap) {
      best = spec;
      bestGap = gap;
    }
  }
  return best;
}
