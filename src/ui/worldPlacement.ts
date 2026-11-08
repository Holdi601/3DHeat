import { useEffect } from 'react';
import { useStore } from '../state/store';
import type { GeoPlacement } from '../state/types';
import { movePoint, reproject, samePlacement, streamBounds } from '../world/reproject';
import { theatreById } from '../world/theatres';

/**
 * Keeps a world backdrop under the data. A backdrop built for a theatre on
 * its own reference, or under one recording, is moved when data on another
 * reference is loaded (or the same data with other axes), so the tracks and
 * the ground meet whichever came first. Mounted with the canvas overlay, not
 * in a panel, because a closed panel is not mounted at all.
 */
export function useBackdropUnderData(): void {
  const level = useStore((s) => s.level);
  const geo = useStore((s) => s.dataset?.geo);
  const axes = useStore((s) => s.dataset?.axes);
  const setLevel = useStore((s) => s.setLevel);
  useEffect(() => {
    if (!geo || level?.kind !== 'model' || !level.placement) return;
    const to: GeoPlacement = { geo, axes: axes ?? null };
    if (samePlacement(level.placement, to)) return;
    // A streamed theatre's level has no triangles: its box is worked out on the
    // new placement (an empty mesh moved has none, and an infinite box hides
    // the whole scene), its names moved one by one.
    const from = level.placement;
    const th = level.stream ? theatreById(level.stream.theatre) : undefined;
    if (level.stream && th && level.vertices.length === 0) {
      const { bounds, band } = streamBounds(to, th.box);
      setLevel({
        ...level,
        bounds,
        ...(level.labels ? { labels: level.labels.map((l) => ({ ...l, ...movePoint(l, from, to) })) } : {}),
        ...(level.relief ? { relief: { ...level.relief, lowY: band.minY, highY: band.maxY } } : {}),
        placement: to,
      });
      return;
    }
    const sets = [level.indices, level.structureIndices, level.waterIndices, level.navIndices];
    const present = sets.filter((s): s is Uint32Array => !!s);
    const r = reproject(level.vertices, present, level.placement, to);
    const moved = new Map(present.map((s, i) => [s, r.indices[i]]));
    const lowY = level.relief?.lowY;
    const highY = level.relief?.highY;
    const band = lowY !== undefined && highY !== undefined ? r.band(lowY, highY) : null;
    setLevel({
      ...level,
      vertices: r.vertices,
      indices: moved.get(level.indices)!,
      ...(level.structureIndices ? { structureIndices: moved.get(level.structureIndices) } : {}),
      ...(level.waterIndices ? { waterIndices: moved.get(level.waterIndices) } : {}),
      ...(level.navIndices ? { navIndices: moved.get(level.navIndices) } : {}),
      bounds: r.bounds,
      ...(level.labels ? { labels: level.labels.map((l) => ({ ...l, ...r.move(l.x, l.y, l.z) })) } : {}),
      ...(level.relief && band ? { relief: { ...level.relief, ...band } } : {}),
      placement: to,
    });
  }, [level, geo, axes, setLevel]);
}
