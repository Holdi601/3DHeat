import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { useVehicleStore } from '../../state/vehicleStore';
import { vehicleView } from '../../vehicle/view';
import { useVolumeStore } from '../../volumes/store';
import { autoRadius, categoryColours, heatOf, markRadius, OUTCOME_COLOURS, sizeOf, templateOfFigure } from '../../vehicle/scene';
import { heatMeshOf, paint, rampOfLut, type HeatMesh } from '../../vehicle/surface';
import { personRegions } from '../../vehicle/regions';
import { offsetFor, shiftHits } from '../../vehicle/fit';
import { drawSide, sheetScale, sidePoint, SIDES, splitVertices } from '../../vehicle/sheet';
import { buildColorLut, stopToCss } from '../../render/colors';
import { CATALOG } from '../../figures/catalog';
import { VertexBuffer } from '../../race/geometry';
import { num, t } from '../../i18n';

/** The sheet's size in pixels: A4 landscape's proportions, sharp enough to print. */
const W = 2400;
const H = 1650;
const HEAD = 170;
const FOOT = 130;

const meshes = new Map<string, HeatMesh>();

/**
 * The vehicle heatmap flat, for print: the six sides of the figure with the
 * heat on them, at one scale, with the vehicle's name, what was counted and
 * the colour ramp. Saved as a PNG or printed.
 */
export function VehicleSheet() {
  const dataset = useStore((s) => s.dataset);
  const scheme = useStore((s) => s.heat.scheme);
  const s = useVehicleStore();
  useVolumeStore((v) => v.volumes);
  useVolumeStore((v) => v.filter);
  const view = vehicleView(dataset, s);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !view.figure || !view.vehicle) return;
    let m = meshes.get(view.figure);
    if (!m) {
      const tpl = templateOfFigure(view.figure);
      if (!tpl) return;
      m = heatMeshOf(tpl, 60_000, 24, false);
      meshes.set(view.figure, m);
    }
    const tags = CATALOG[view.figure]?.domain === 'person' ? personRegions(m) : null;
    const radius = s.radius > 0 ? s.radius : autoRadius(sizeOf(m));
    const tpl = templateOfFigure(view.figure);
    const hits = tpl && s.fit && view.fits ? shiftHits(view.hits, offsetFor(tpl, view.placed)) : view.hits;
    const r = heatOf(m, hits, radius, tags);
    const saturation = r.auto * Math.pow(2, -s.exposure);
    const vb = new VertexBuffer();
    paint(m, s.showHeat ? r.heat : new Float32Array(m.count), saturation, rampOfLut(buildColorLut(scheme)), vb);
    const { pos, rgba } = splitVertices(vb.data, vb.count);

    const ctx = canvas.getContext('2d')!;
    const img = ctx.createImageData(W, H);
    img.data.fill(255);
    const cols = 3;
    const rows = 2;
    const cw = Math.floor(W / cols);
    const ch = Math.floor((H - HEAD - FOOT) / rows);
    const scale = sheetScale(m.min, m.max, cw, ch - 50, 0.88);
    const cells = SIDES.map((side, i) => {
      const cell = { x: (i % cols) * cw, y: HEAD + Math.floor(i / cols) * ch + 50, w: cw, h: ch - 50 };
      return { side, cell, depth: drawSide(img, side, pos, m!.nrm, rgba, m!.count, m!.min, m!.max, cell, scale, 0.45, true) };
    });
    ctx.putImageData(img, 0, 0);
    // Each hit where it struck, on the sides that see it: a dot in its colour, the killing shot ringed.
    if (s.showPoints) {
      const colours = categoryColours(r.marks.map((k) => k.hit), s.colourBy);
      const dot = Math.max(3, markRadius(sizeOf(m)) * scale);
      const slack = sizeOf(m) * 0.02;
      for (const { side, cell, depth } of cells) {
        for (const k of r.marks) {
          const q = sidePoint(side, k.p, k.n, m.min, m.max, cell, scale);
          const px = Math.floor(q.x - cell.x), py = Math.floor(q.y - cell.y);
          if (!q.facing || px < 0 || py < 0 || px >= cell.w || py >= cell.h || q.z > depth[py * cell.w + px] + slack) continue;
          const c = colours.of(k.hit);
          ctx.beginPath();
          ctx.arc(q.x, q.y, dot, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${c.map((v) => Math.round(v * 255)).join(',')})`;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(10,10,14,0.85)';
          ctx.stroke();
          if (k.hit.killingShot) {
            ctx.beginPath();
            ctx.arc(q.x, q.y, dot * 2.2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgb(${OUTCOME_COLOURS.kill.map((v) => Math.round(v * 255)).join(',')})`;
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        }
      }
    }

    ctx.fillStyle = '#16181b';
    ctx.font = '600 54px system-ui, sans-serif';
    ctx.fillText(view.vehicle.name, 48, 82);
    ctx.font = '32px system-ui, sans-serif';
    ctx.fillStyle = '#444';
    const layer = t(`vehicle.layer.${s.layer}`);
    ctx.fillText(t('vehicle.sheet.sub', { layer, n: view.hits.length, matches: new Set(view.hits.map((h) => h.match)).size }), 48, 132);
    ctx.font = '600 30px system-ui, sans-serif';
    ctx.fillStyle = '#16181b';
    SIDES.forEach((side, i) => ctx.fillText(t(`vehicle.side.${side}`), (i % cols) * cw + 40, HEAD + Math.floor(i / cols) * ch + 40));
    // A metre at the sheet's scale, and the ramp.
    const fy = H - FOOT + 40;
    const metres = niceLength(220 / scale);
    ctx.fillRect(48, fy, metres * scale, 8);
    ctx.font = '28px system-ui, sans-serif';
    ctx.fillText(t('vehicle.look.metres', { n: num(metres, metres < 1 ? 2 : 0) }), 48, fy + 44);
    const stops = [...scheme.positive].sort((a, b) => a.pos - b.pos);
    const gx = W - 760, gw = 520;
    const grad = ctx.createLinearGradient(gx, 0, gx + gw, 0);
    for (const st of stops) grad.addColorStop(Math.max(0, Math.min(1, st.pos)), stopToCss({ ...st, alpha: 1 }));
    ctx.fillStyle = grad;
    ctx.fillRect(gx, fy - 6, gw, 24);
    ctx.fillStyle = '#16181b';
    ctx.fillText(t('vehicle.hud.few'), gx, fy + 56);
    const many = t('vehicle.hud.many');
    ctx.fillText(many, gx + gw - ctx.measureText(many).width, fy + 56);
    ctx.fillStyle = '#777';
    ctx.font = '24px system-ui, sans-serif';
    const note = t('vehicle.sheet.note');
    ctx.fillText(note, W - 48 - ctx.measureText(note).width, 82);
    setUrl(canvas.toDataURL('image/png'));
  }, [view.figure, view.vehicle, view.hits, view.placed, view.fits, s.fit, s.radius, s.exposure, s.layer, s.showPoints, s.showHeat, s.colourBy, scheme]);

  const close = () => s.patch({ sheetOpen: false });
  const file = `${(view.vehicle?.name ?? 'vehicle').replace(/[^\w\- ]+/g, '_')} hits.png`;
  return (
    <div className="vehicle-sheet" onClick={close}>
      <div className="vehicle-sheet-card" onClick={(e) => e.stopPropagation()}>
        <div className="vehicle-sheet-bar">
          <strong>{t('vehicle.sheet.title')}</strong>
          <span className="spacer" />
          {url && (
            <a className="button" href={url} download={file}>
              {t('vehicle.sheet.save')}
            </a>
          )}
          <button disabled={!url} onClick={() => url && printImage(url, view.vehicle?.name ?? '')}>
            {t('vehicle.sheet.print')}
          </button>
          <button onClick={close}>{t('vehicle.sheet.close')}</button>
        </div>
        <canvas ref={canvasRef} width={W} height={H} />
        <div className="hint">{t('vehicle.sheet.hint', { n: view.hits.length })}</div>
      </div>
    </div>
  );
}

/** 1, 2 or 5 times a power of ten, at most `max`. */
function niceLength(max: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(max, 1e-3))));
  for (const k of [5, 2, 1]) if (k * p <= max) return k * p;
  return p;
}

/** Prints the sheet on its own page: a window holding only the picture. */
function printImage(url: string, title: string): void {
  const w = window.open('', '_blank');
  if (!w) return;
  const doc = w.document;
  doc.title = title;
  const style = doc.createElement('style');
  style.textContent = '@page { size: landscape; margin: 8mm; } html, body { margin: 0; } img { width: 100%; height: auto; display: block; }';
  doc.head.appendChild(style);
  const img = doc.createElement('img');
  img.onload = () => {
    w.focus();
    w.print();
  };
  img.src = url;
  doc.body.appendChild(img);
}
