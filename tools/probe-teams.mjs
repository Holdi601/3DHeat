/**
 * Does teams mode put the right colour on the screen, and does it still not glitter?
 *
 * The mode's arithmetic exists in three places — `colors.ts` on the CPU, the WGSL
 * composite, and the GLSL composite — and twelve of its constants are the Oklab
 * matrices, hand-typed in each. A single wrong sign there produces a picture that
 * looks like a palette decision rather than like a bug, so "it renders and the
 * colours look plausible" is not evidence of anything. (One sign genuinely was
 * wrong in the first draft of the CPU version.)
 *
 * So the geometry here is arranged so the answer is known in advance. A synthetic
 * dataset puts group 0 in a block on the left, group 1 in a block on the right,
 * and both in a band down the middle, seen from straight above with the camera
 * still. With two groups the hue circle is split in half, so:
 *
 *   - the left block must come out at group 0's palette colour,
 *   - the right block at group 1's,
 *   - and the middle band, where the two are equally present, at neither: their
 *     positions on the colour plane are exact negatives, so an equal mixture is
 *     on the neutral axis and the band must be grey.
 *
 * That last one is the real test. It fails if the colours are mixed in sRGB, if
 * they are mixed in linear RGB, if the weighting is dropped, if the accumulated
 * sum is not divided by the accumulated weight, or if either backend's matrices
 * differ from the CPU's — none of which the first two checks would notice.
 *
 * Then the same flicker property `probe-flicker.mjs` guards for the other modes,
 * because this one reallocates the accumulation buffer to four channels and
 * switches to a second set of pipelines: exactness is a different code path here,
 * and "the glittering came back in the new mode only" is exactly the shape of
 * regression this mode invites.
 *
 *   node tools/probe-teams.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const wantWebgpu = /backend=webgpu/.test(url);
const browser = await chromium.launch({
  ...(wantWebgpu ? { channel: 'chromium' } : {}),
  args: wantWebgpu
    ? [
        '--enable-unsafe-webgpu',
        '--enable-features=Vulkan',
        '--disable-vulkan-surface',
        '--use-webgpu-adapter=swiftshader',
        '--ignore-gpu-blocklist',
      ]
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

let ok = 0;
let failed = 0;
const check = (label, pass, detail) => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  pass ? ok++ : failed++;
};

const backend = await page.evaluate(() => globalThis.__3dheat_engine.live.backend);
console.log(`backend: ${backend}\n`);

/**
 * Three blocks on the ground: group 0 left, group 1 right, both in the middle.
 *
 * `EXTENT` and `BAND` are in world units and the camera is placed from the
 * bounds, so the three regions land in known thirds of the frame and the sampler
 * below can read them without hunting for them.
 */
const EXTENT = 3000;
const BAND = 300;
const PER_BLOCK = 240_000;

await page.evaluate(
  ({ extent, band, per }) => {
    const n = per * 4; // left, right, and two overlapping sets in the band
    const px = new Float32Array(n);
    const py = new Float32Array(n);
    const pz = new Float32Array(n);
    const teamId = new Uint32Array(n);
    const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
    let i = 0;
    const fill = (count, team, xLo, xHi) => {
      for (let k = 0; k < count; k++, i++) {
        px[i] = rnd(xLo, xHi);
        py[i] = rnd(0, 40);
        pz[i] = rnd(-extent, extent);
        teamId[i] = team;
      }
    };
    // Left third: group 0 only. Right third: group 1 only.
    fill(per, 0, -extent, -band * 2);
    fill(per, 1, band * 2, extent);
    // The middle band: both groups, the same count each, so the mixture is an
    // exact tie and the expected colour is the neutral axis.
    fill(per, 0, -band, band);
    fill(per, 1, -band, band);

    const s = globalThis.__3dheat.useStore.getState();
    s.setDataset({
      id: 'teams-probe',
      name: 'teams probe',
      count: n,
      px,
      py,
      pz,
      time: null,
      epochMs: null,
      lifetime: null,
      maxLifetimeGap: 0,
      yaw: null,
      pitch: null,
      personId: null,
      teamId,
      personLabels: [],
      teamLabels: ['alpha', 'bravo'],
      personTeam: null,
      personSlot: null,
      teamSizes: null,
      attrs: [],
      warnings: [],
      bounds: { minX: -extent, minY: 0, minZ: -extent, maxX: extent, maxY: 40, maxZ: extent },
      timeRange: [0, 0],
      timeSorted: true,
    });
    s.patchTimeline({ mode: 'all', playing: false });
    // A wide, soft sprite and a low saturation point, so every region is well up
    // the ramp and fully opaque. The question here is hue, and a half-transparent
    // pixel is a mixture with the background rather than with another group.
    s.patchHeat({
      radius: 26,
      response: 'saturating',
      saturation: 6,
      centerIntensity: 1,
      edgeIntensity: 0,
      floor: 0,
    });
    s.setMode('heat-teams');
  },
  { extent: EXTENT, band: BAND, per: PER_BLOCK },
);

// Straight down, so the three blocks project to three vertical strips.
await page.evaluate((extent) => {
  const eng = globalThis.__3dheat_engine;
  eng.camera.position.x = 0;
  eng.camera.position.y = extent * 1.6;
  eng.camera.position.z = 0;
  eng.camera.yaw = 0;
  eng.camera.pitch = -Math.PI / 2 + 0.0001;
  eng.camera.moved = true;
  eng.invalidate(4);
}, EXTENT);
await page.waitForTimeout(3500);

/** Mean colour of a rectangle of the frame, ignoring near-background pixels. */
async function sample(x0, x1) {
  return page.evaluate(
    async ({ x0, x1 }) => {
      const read = async () => {
        const eng = globalThis.__3dheat_engine;
        if (eng?.live?.backend === 'webgpu') {
          const f = await eng.captureFrame();
          if (f) return f;
        }
        const src = document.querySelector('canvas');
        const c = document.createElement('canvas');
        c.width = src.width;
        c.height = src.height;
        c.getContext('2d').drawImage(src, 0, 0);
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height);
        return { width: c.width, height: c.height, rgba: d.data };
      };
      const f = await read();
      // The middle half vertically: the top and bottom edges of the frame see the
      // ground plane at a grazing angle where the blocks are not separated.
      const yLo = Math.floor(f.height * 0.3);
      const yHi = Math.floor(f.height * 0.7);
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let y = yLo; y < yHi; y++) {
        for (let x = Math.floor(f.width * x0); x < Math.floor(f.width * x1); x++) {
          const o = (y * f.width + x) * 4;
          const [pr, pg, pb] = [f.rgba[o], f.rgba[o + 1], f.rgba[o + 2]];
          // Background is the app's near-black; anything at or under it carries no
          // heat and would drag the mean toward the clear colour.
          if (pr < 45 && pg < 45 && pb < 50) continue;
          r += pr;
          g += pg;
          b += pb;
          n++;
        }
      }
      return n === 0 ? null : { r: r / n, g: g / n, b: b / n, n };
    },
    { x0, x1 },
  );
}

const left = await sample(0.06, 0.24);
const right = await sample(0.76, 0.94);
const middle = await sample(0.46, 0.54);

const expect = await page.evaluate(() => ({
  alpha: globalThis.__3dheat.teamHeatColor(0, 2).map((v) => v * 255),
  bravo: globalThis.__3dheat.teamHeatColor(1, 2).map((v) => v * 255),
  // What a perfect tie should be: the mixture at the origin of the colour plane,
  // which is the neutral at the palette's fixed lightness. Any boost leaves it
  // exactly there, which is why it can be predicted without knowing the setting.
  tie: globalThis.__3dheat.mixTeamColor(0, 0, 1).map((v) => v * 255),
}));

const fmt = (c) => (c ? `rgb(${c.r.toFixed(0)}, ${c.g.toFixed(0)}, ${c.b.toFixed(0)})` : 'empty');
console.log(`  left   ${fmt(left)}   expected rgb(${expect.alpha.map((v) => v.toFixed(0)).join(', ')})`);
console.log(`  right  ${fmt(right)}   expected rgb(${expect.bravo.map((v) => v.toFixed(0)).join(', ')})`);
console.log(`  middle ${fmt(middle)}   expected neutral\n`);

check('all three regions drew something', Boolean(left && right && middle),
  `${left?.n ?? 0} / ${middle?.n ?? 0} / ${right?.n ?? 0} px`);

if (left && right && middle) {
  /**
   * Hue as an angle, from the two chroma-ish differences.
   *
   * Compared as an angle rather than channel by channel because the default boost
   * is above 1, so the mixture is pushed away from neutral and the *magnitudes*
   * are deliberately not the palette's. The direction is what carries the group's
   * identity, and it is exactly what the boost leaves alone.
   */
  const angle = (c) => Math.atan2(c.g - c.b, c.r - (c.g + c.b) / 2);
  const degrees = (a) => (a * 180) / Math.PI;
  const near = (a, b, tol) => {
    let d = Math.abs(degrees(a) - degrees(b)) % 360;
    if (d > 180) d = 360 - d;
    return { pass: d <= tol, d };
  };
  const wantA = { r: expect.alpha[0], g: expect.alpha[1], b: expect.alpha[2] };
  const wantB = { r: expect.bravo[0], g: expect.bravo[1], b: expect.bravo[2] };

  const la = near(angle(left), angle(wantA), 18);
  check("the left block takes group 0's palette hue", la.pass, `${la.d.toFixed(1)} deg off`);
  const ra = near(angle(right), angle(wantB), 18);
  check("the right block takes group 1's palette hue", ra.pass, `${ra.d.toFixed(1)} deg off`);

  // The two groups must be genuinely far apart, not two shades of one colour —
  // which is what a dropped index or a collapsed chroma would produce, and which
  // the two hue checks above would both still pass.
  const apart = near(angle(left), angle(right), 0);
  check('and the two are near-opposite on the hue circle', apart.d > 120,
    `${apart.d.toFixed(0)} deg apart`);

  /**
   * The tie in the middle band is neutral.
   *
   * The strongest check here. Two opposed hues cancel on the colour plane, so an
   * equal mixture has no hue at all — but only if the mixing happens in Oklab. In
   * sRGB the same pair leaves a measured 0.044 of channel spread (about 11 of 255)
   * and in linear RGB 0.096 (about 24), both far outside this tolerance, so a
   * wrong mixing space fails here and nowhere else.
   */
  const spread = Math.max(middle.r, middle.g, middle.b) - Math.min(middle.r, middle.g, middle.b);
  check('an equal mixture of two opposed groups is neutral', spread < 9,
    `${spread.toFixed(1)} of 255 channel spread`);

  // And it is neutral because the two cancelled, not because nothing arrived: the
  // band has both groups' data on it, so it must be at least as bright as either
  // single-group block.
  const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  check('and it is bright, not empty', lum(middle) >= Math.min(lum(left), lum(right)) * 0.8,
    `luma ${lum(middle).toFixed(0)} vs ${lum(left).toFixed(0)} / ${lum(right).toFixed(0)}`);

  /**
   * The tie lands at the palette's own neutral, not merely at *some* grey.
   *
   * This is what pins the lightness constant. The hue checks are angles and the
   * spread check is a difference, so both are blind to `TEAM_LIGHTNESS` being
   * wrong in one shader — a tie at L=0.5 is just as grey and just as evenly
   * spread. The predicted value comes from the CPU implementation, so a shader
   * that disagrees about the constant, or drops the cube root, fails here.
   *
   * One-sided, and loose below: the band is composited over the background at the
   * ramp's alpha, which is near one but not one, so it can read a little darker
   * than predicted and must not read brighter.
   */
  const want = 0.2126 * expect.tie[0] + 0.7152 * expect.tie[1] + 0.0722 * expect.tie[2];
  const got = lum(middle);
  check('and it sits at the palette lightness', got <= want * 1.06 && got >= want * 0.82,
    `luma ${got.toFixed(0)} against a predicted ${want.toFixed(0)}`);
}

// ------------------------------------------------------------------ the controls

// Boost 0 collapses every mixture onto the neutral axis, whatever is there. A
// picture that stays coloured means the boost never reaches the composite — or
// that the colour is coming from the LUT rather than from the accumulated hue.
await page.evaluate(() => {
  globalThis.__3dheat.useStore.getState().patchHeat({ teamBoost: 0 });
  globalThis.__3dheat_engine.camera.moved = true;
  globalThis.__3dheat_engine.invalidate(4);
});
await page.waitForTimeout(2500);
const flat = await sample(0.06, 0.24);
if (flat) {
  const spread = Math.max(flat.r, flat.g, flat.b) - Math.min(flat.r, flat.g, flat.b);
  check('boost 0 leaves every region neutral', spread < 9,
    `${spread.toFixed(1)} of 255 channel spread`);
}

// Density still drives opacity, which is the property that lets every other heat
// control keep working in this mode. Raising the saturation point moves the whole
// field down the ramp, so the picture must get dimmer.
const ramp = await page.evaluate(async () => {
  const s = globalThis.__3dheat.useStore.getState();
  const eng = globalThis.__3dheat_engine;
  const measure = async () => {
    eng.camera.moved = true;
    eng.invalidate(4);
    // Until the accumulation has converged, not for a fixed number of frames.
    //
    // A fixed count is a race, and it read as one: the same comparison came out
    // 57% dimmer on WebGL2 and 12% on WebGPU, because under a software adapter
    // forty-five frames is not enough to settle and both measurements were taken
    // mid-convergence. What is being compared here is two settled pictures.
    for (let i = 0; i < 400; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      if (eng.live.converged && i > 8) break;
      eng.invalidate(1);
    }
    const read = async () => {
      if (eng.live.backend === 'webgpu') {
        const f = await eng.captureFrame();
        if (f) return f;
      }
      const src = document.querySelector('canvas');
      const c = document.createElement('canvas');
      c.width = src.width;
      c.height = src.height;
      c.getContext('2d').drawImage(src, 0, 0);
      return {
        width: c.width,
        height: c.height,
        rgba: c.getContext('2d').getImageData(0, 0, c.width, c.height).data,
      };
    };
    const f = await read();
    let sum = 0;
    for (let i = 0; i < f.rgba.length; i += 4) {
      sum += 0.2126 * f.rgba[i] + 0.7152 * f.rgba[i + 1] + 0.0722 * f.rgba[i + 2];
    }
    return sum / (f.rgba.length / 4);
  };
  s.patchHeat({ teamBoost: 1.4, saturation: 6 });
  const bright = await measure();
  // Twenty times, not the earlier twenty-fold-with-a-10%-margin: the point is
  // that the ramp is in play at all, and a large step makes that unambiguous
  // rather than a question about tolerances.
  s.patchHeat({ saturation: 400 });
  const dim = await measure();
  s.patchHeat({ saturation: 6 });
  return { bright, dim };
});
check('raising the saturation point still dims the field', ramp.dim < ramp.bright * 0.7,
  `mean luma ${ramp.bright.toFixed(1)} -> ${ramp.dim.toFixed(1)}`);

// ----------------------------------------------------------------- the glittering

/**
 * The same exactness property probe-flicker.mjs guards, in this mode.
 *
 * Separate because this mode is a separate code path: the accumulation target is
 * reallocated to four channels and the heat, decay and merge pipelines come from
 * a second cache keyed on that format. Everything that made the grain visible
 * before — a partial frame merged at 1/n, an under-budget draw on a moving camera
 * — can come back here while the other modes stay clean.
 */
/**
 * A second, larger dataset, because the colour checks above deliberately use a
 * small one.
 *
 * The exactness property is only *about* datasets larger than the frame budget:
 * with fewer rows than the budget every frame draws all of them whatever the
 * sampler does, so measuring it on the 1M-row colour dataset would report a pass
 * without testing anything. Sized from the budget rather than hard-coded so it
 * stays true if the default moves.
 *
 * Radius drops to 8 for this half. At 26 the overdraw of fourteen million sprites
 * under a software rasteriser is minutes per frame, and the question here is what
 * the sampler submitted, not what the pixels look like.
 */
const rows = await page.evaluate(() => {
  const b = globalThis.__3dheat.useStore.getState().budget;
  return { splats: b.splatsPerFrame, adaptive: b.adaptive };
});
const candidates = Math.round(rows.splats * 3.5);
await page.evaluate(
  ({ n, extent }) => {
    const px = new Float32Array(n);
    const py = new Float32Array(n);
    const pz = new Float32Array(n);
    const teamId = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      px[i] = (Math.random() - 0.5) * 2 * extent;
      py[i] = Math.random() * 40;
      pz[i] = (Math.random() - 0.5) * 2 * extent;
      // Six groups, so the palette divides into six and the mixing path is
      // exercised at a count where nearly every pixel is contested.
      teamId[i] = i % 6;
    }
    const s = globalThis.__3dheat.useStore.getState();
    s.setDataset({
      id: 'teams-flicker',
      name: 'teams flicker',
      count: n,
      px,
      py,
      pz,
      time: null,
      epochMs: null,
      lifetime: null,
      maxLifetimeGap: 0,
      yaw: null,
      pitch: null,
      personId: null,
      teamId,
      personLabels: [],
      teamLabels: ['a', 'b', 'c', 'd', 'e', 'f'],
      personTeam: null,
      personSlot: null,
      teamSizes: null,
      attrs: [],
      warnings: [],
      bounds: { minX: -extent, minY: 0, minZ: -extent, maxX: extent, maxY: 40, maxZ: extent },
      timeRange: [0, 0],
      timeSorted: true,
    });
    s.patchTimeline({ mode: 'all', playing: false });
    s.patchHeat({ radius: 8, response: 'log', saturation: 40, centerIntensity: 2 });
    s.setMode('heat-teams');
  },
  { n: candidates, extent: EXTENT },
);
await page.waitForTimeout(4000);
await page.evaluate(() => globalThis.__3dheat_engine.frameDataset(true));
await page.waitForTimeout(2500);

console.log(
  `\n  ${(candidates / 1e6).toFixed(1)}M rows against a ${(rows.splats / 1e6).toFixed(1)}M budget ` +
    `(adaptive ${rows.adaptive})`,
);

const fly = async (frames) =>
  page.evaluate(async (n) => {
    const eng = globalThis.__3dheat_engine;
    const seen = [];
    for (let i = 0; i < n; i++) {
      eng.camera.position.x += 4;
      eng.camera.moved = true;
      eng.invalidate(2);
      await new Promise((r) => requestAnimationFrame(r));
      seen.push({
        splats: eng.live.splats,
        candidates: eng.live.candidates,
        converge: eng.live.convergeFrames,
      });
    }
    return seen;
  }, frames);

const moving = (await fly(26)).slice(4);
const exact = moving.filter((f) => f.candidates > 0 && f.splats >= f.candidates).length;
const worst = moving.reduce((a, f) => Math.max(a, f.converge), 0);
check('every frame of a camera move draws every candidate row in teams mode',
  exact === moving.length, `${exact} of ${moving.length} frames exact`);
check('and no frame reports outstanding work', worst <= 1, `worst convergeFrames ${worst}`);
console.log(
  `  drew ${(moving[0].splats / 1e6).toFixed(2)}M of ${(moving[0].candidates / 1e6).toFixed(2)}M candidates`,
);
// The whole point of the sizing above: a pass is only meaningful if the frame was
// actually asked for more rows than the configured budget allows.
check('and the test was against more rows than the budget',
  moving[0].candidates > rows.splats,
  `${(moving[0].candidates / 1e6).toFixed(2)}M candidates vs ${(rows.splats / 1e6).toFixed(1)}M budget`);

// The configured budget must be untouched: this works by lifting the budget for
// one frame, not by rewriting what the user chose.
const after = await page.evaluate(() => {
  const b = globalThis.__3dheat.useStore.getState().budget;
  return { splats: b.splatsPerFrame, adaptive: b.adaptive };
});
check('without changing the configured budget',
  after.splats === rows.splats && after.adaptive === rows.adaptive,
  `${(after.splats / 1e6).toFixed(1)}M, adaptive ${after.adaptive}`);

// ------------------------------------------------------- switching back and forth

/**
 * The other modes survive the round trip.
 *
 * Switching modes reallocates the heat target and, on WebGPU, swaps in pipelines
 * built against a different target format — which invalidates every cached bind
 * group holding a view of the old texture. If that invalidation is missed, the
 * failure is not in the new mode: it is heat-simple rendering nothing, or
 * rendering the wrong buffer, *after* a visit to teams mode. So the check has to
 * be made on the way back.
 */
const roundTrip = await page.evaluate(async () => {
  const s = globalThis.__3dheat.useStore.getState();
  const eng = globalThis.__3dheat_engine;
  const settle = async () => {
    eng.camera.moved = true;
    eng.invalidate(4);
    for (let i = 0; i < 45; i++) await new Promise((r) => requestAnimationFrame(r));
    const read = async () => {
      if (eng.live.backend === 'webgpu') {
        const f = await eng.captureFrame();
        if (f) return f;
      }
      const src = document.querySelector('canvas');
      const c = document.createElement('canvas');
      c.width = src.width;
      c.height = src.height;
      c.getContext('2d').drawImage(src, 0, 0);
      return {
        width: c.width,
        height: c.height,
        rgba: c.getContext('2d').getImageData(0, 0, c.width, c.height).data,
      };
    };
    const f = await read();
    let lit = 0;
    for (let i = 0; i < f.rgba.length; i += 4) {
      if (f.rgba[i] > 45 || f.rgba[i + 1] > 45 || f.rgba[i + 2] > 50) lit++;
    }
    return Math.round((lit / (f.rgba.length / 4)) * 1000) / 10;
  };
  s.setMode('heat-simple');
  const first = await settle();
  s.setMode('heat-teams');
  await settle();
  s.setMode('heat-simple');
  const again = await settle();
  s.setMode('heat-difference');
  const diff = await settle();
  return { first, again, diff };
});
console.log(
  `\n  heat-simple ${roundTrip.first}% lit -> teams -> heat-simple ${roundTrip.again}% ` +
    `-> difference ${roundTrip.diff}%`,
);
check('heat-simple still renders after a visit to teams mode',
  roundTrip.again > 0 && Math.abs(roundTrip.again - roundTrip.first) < 5,
  `${roundTrip.first}% then ${roundTrip.again}%`);
check('and so does difference mode', roundTrip.diff > 0, `${roundTrip.diff}% lit`);

console.log(`\nprobe-teams: ${failed === 0 ? 'passed' : 'FAILED'} (${ok} ok, ${failed} failed)`);
await browser.close();
process.exit(failed === 0 ? 0 : 1);
