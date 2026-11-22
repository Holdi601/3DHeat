/**
 * The heat-tile source's way to a core (`native/proto/heat3d/v1/heat3d.proto`,
 * `HeatTileQuery` / `ReadHeatTiles`): the app's own core, or a session host's
 * through its gateway (files by token only, replies capped per member).
 */

import type { MessageInitShape } from '@bufbuild/protobuf';
import { call, type CoreEndpoint } from '../../data/native/core';
import type { HeatTileQuerySchema, RowFilterClause } from '../../data/native/gen/heat3d/v1/heat3d_pb';
import type { PyramidInfo, TileBatch, TileTransport } from './source';

export type HeatTileQueryInit = MessageInitShape<typeof HeatTileQuerySchema>;
export type { RowFilterClause };

export function heatTileTransport(at: CoreEndpoint, query: HeatTileQueryInit): TileTransport {
  return {
    async query(): Promise<PyramidInfo> {
      const r = await call(at, { case: 'heatTileQuery', value: query }, 'heatPyramid');
      const p = r.body;
      return {
        key: p.key,
        x0: p.x0,
        y0: p.y0,
        size: p.size,
        leafLevel: p.leafLevel,
        complete: p.complete,
        estimateLevels: p.estimateLevels,
        levelMax: p.levelMax,
        rowsCounted: Number(p.rowsCounted),
        fraction: p.fraction,
        how: p.how,
        error: p.error,
        channelNames: p.channelNames,
        otherChannel: p.otherChannel,
      };
    },
    async read(key: string, ids: bigint[], budgetBytes: number): Promise<TileBatch> {
      const r = await call(
        at,
        {
          case: 'readHeatTiles',
          value: { key, tiles: ids, budgetBytes: BigInt(budgetBytes) },
        },
        'heatTiles',
      );
      const b = r.body;
      return {
        tiles: b.tiles.map((t) => ({
          id: t.id,
          bytes: new Uint8Array(r.frame, r.payloadAt + Number(t.data?.offset ?? 0), Number(t.data?.length ?? 0)),
          estimate: t.estimate,
        })),
        empty: b.empty,
        pending: b.pending,
        deferred: b.deferred,
      };
    },
  };
}
