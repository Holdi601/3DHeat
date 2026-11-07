import { chromium } from 'playwright';

const SCENE = `
  const s = globalThis.__3dheat.useStore.getState();
  const rows = 20000;
  const px = new Float32Array(rows), py = new Float32Array(rows), pz = new Float32Array(rows);
  for (let i = 0; i < rows; i++) {
    px[i] = (i % 2 ? 1 : -1) * (200 + Math.random() * 600);
    py[i] = (Math.random() - 0.5) * 100;
    pz[i] = (Math.random() - 0.5) * 400;
  }
  s.setDataset({ id:'d', name:'d', count:rows, px, py, pz, time:null, epochMs:null, lifetime:null,
    maxLifetimeGap:0, yaw:null, pitch:null, personId:null, teamId:null, personLabels:[], teamLabels:[],
    personTeam:null, personSlot:null, teamSizes:null, attrs:[], warnings:[],
    bounds:{minX:-1000,minY:-50,minZ:-200,maxX:1000,maxY:50,maxZ:200}, timeRange:[0,0], timeSorted:true });
  s.setMode('heat-simple');
  s.patchTimeline({ mode:'all' });
  s.patchHeat({ radius:40, occlusion:0.8 });
  const q = []; const nrm = [0,0,1];
  for (const c of [[-1200,-600],[-50,-600],[-50,600],[-1200,-600],[-50,600],[-1200,600]]) q.push(c[0], c[1], 1000, ...nrm);
  s.setLevel({ kind:'model', name:'wall', vertices:new Float32Array(q), indices:new Uint32Array([0,1,2,3,4,5]),
    triangles:2, sourceTriangles:2, partNames:['ground:wall'], partClasses:['ground'], partReasons:['p'],
    bounds:{minX:-1200,minY:-600,minZ:1000,maxX:-50,maxY:600,maxZ:1000},
    opacity:1, desaturate:1, brightness:0.9, wireframe:false });
  const e = globalThis.__3dheat_engine;
  e.camera.position.set(0, 0, 3000);
  e.camera.setOrientationDegrees(0, 0);
  e.camera.moved = true;
`;

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

for (const [mode, label] of [
  ['99', 'sampled window depth'],
  ['98', 'vOccludeAt (window depth - bias)'],
  ['97', 'occluded flag (1 = behind)'],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => console.log('PAGEERR:', e.message.slice(0, 200)));
  await page.goto(`http://localhost:5273/?backend=webgl2&occdebug=${mode}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(2800);
  await page.evaluate(SCENE);
  await page.waitForTimeout(3200);
  const r = await page.evaluate(async () => {
    // One frame only, so values are single samples rather than blended sums.
    globalThis.__3dheat.useStore.getState().patchBudget({ progressive: false });
    await new Promise((res) => setTimeout(res, 900));
    const raw = await globalThis.__3dheat_engine.renderer.readHeatField(30000);
    let mn = 1e9;
    let mx = -1e9;
    let nz = 0;
    for (const v of raw) {
      if (v > 0.0001) {
        nz++;
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
    }
    return { n: raw.length, nonzero: nz, min: nz ? mn : 0, max: nz ? mx : 0 };
  });
  console.log(`${label.padEnd(38)} ${JSON.stringify(r)}`);
  await page.close();
}
await browser.close();

