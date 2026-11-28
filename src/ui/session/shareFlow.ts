/**
 * The host sharing several things at once (the panel's ticked items, the
 * loaded level, what the room's members lack): one confirmation of the
 * rights for all of them (or the panel's tick), one warning for packs made
 * from a game's own files, a warning per item marked confidential (the
 * local configuration's folders and words, the marker file: the host decides
 * each), and a warning before anything big. Then each is shared in turn and
 * the room follows.
 */

import { int, t } from '../../i18n';
import { itemBytes, publishData, refreshShareIndex, shareItem, type CatalogEntry } from '../../session/assets';
import { publishRoom } from '../../session/room';
import { confirmDialog, toast } from '../shell/kit';

/** Above this, the host is warned before it is shared: members fetch it all from this machine. */
export const BIG_SHARE = 512 * 1024 * 1024;

export const sizeText = (n: number) =>
  n >= 1 << 30 ? `${(n / (1 << 30)).toFixed(1)} GiB` : n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MiB` : `${int(Math.max(1, Math.ceil(n / 1024)))} KiB`;

/**
 * Shares `items` (and the loaded data when `data`), after the warnings.
 * `rightsGiven`: the host ticked "I may share these" already (no extra
 * question). Returns how many were shared.
 */
export async function shareEntries(items: CatalogEntry[], opts: { rightsGiven?: boolean; data?: { name: string; size: number } | null } = {}): Promise<number> {
  const data = opts.data ?? null;
  if (!items.length && !data) return 0;
  const names = [...items.map((i) => i.name), ...(data ? [data.name] : [])];
  const total = items.reduce((a, i) => a + itemBytes(i), 0) + (data?.size ?? 0);
  if (!opts.rightsGiven && !(await confirmDialog(t('session.share.rightsConfirmMany', { list: names.join(', ') }), t('session.share.share')))) return 0;
  if (total > BIG_SHARE && !(await confirmDialog(t('session.share.bigWarn', { size: sizeText(total) }), t('session.share.shareAnyway')))) return 0;
  const extracted = items.filter((i) => i.extracted);
  let allowExtracted = false;
  if (extracted.length) {
    allowExtracted = await confirmDialog(t('session.share.extractedWarn', { name: extracted.map((i) => i.name).join(', ') }), t('session.share.shareAnyway'));
  }
  let n = 0;
  for (const it of items) {
    if (it.extracted && !allowExtracted) continue;
    // Marked confidential: the host decides for this one item, after a clear warning.
    let confidential = false;
    if (it.confidential) {
      confidential = await confirmDialog(t('session.share.confidentialWarn', { name: it.name }), t('session.share.shareConfidential'));
      if (!confidential) continue;
    }
    try {
      await shareItem(it.path, true, allowExtracted, confidential);
      n++;
    } catch (e) {
      toast(t('session.share.refused', { why: `${it.name}: ${e instanceof Error ? e.message : String(e)}` }), 'bad', 5000);
    }
  }
  if (data) {
    try {
      if (await publishData()) n++;
    } catch {
      toast(t('session.data.publishFailed'), 'bad');
    }
  }
  await refreshShareIndex();
  publishRoom();
  if (n) toast(t('session.share.sharedMany', { n }), 'good');
  return n;
}
