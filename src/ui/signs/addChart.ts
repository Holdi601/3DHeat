/** Adding a chart to a volume from anywhere (the command palette, the Volumes panel): a first chart that suits the data, and its panel open. */

import { useStore } from '../../state/store';
import { useSignStore } from '../../volumes/signs/store';
import type { GroupKey } from '../../charts/types';

export function addChartTo(volumeId: string): void {
  const ds = useStore.getState().dataset;
  const firstCat = ds?.attrs.find((a) => a.kind === 'category' && a.categories && a.categories.length > 1)?.name;
  const group: GroupKey = ds?.teamId ? 'team' : firstCat ? `col:${firstCat}` : 'none';
  useSignStore.getState().add(volumeId, { kind: 'bar', group });
}
