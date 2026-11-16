/**
 * Sorts a long list's keys off the page (`useSorted`), so a list of a hundred
 * thousand names re-sorts without a frame of the 3D view lost.
 */
import { orderOf, type SortDir, type SortKey, type SortKind } from './order';

export interface SortRequest {
  id: number;
  keys: SortKey[];
  kind: SortKind;
  dir: SortDir;
  locale: string;
}

self.onmessage = (e: MessageEvent<SortRequest>) => {
  const { id, keys, kind, dir, locale } = e.data;
  const order = orderOf(keys, kind, dir, locale);
  (self as unknown as Worker).postMessage({ id, order }, [order.buffer]);
};
