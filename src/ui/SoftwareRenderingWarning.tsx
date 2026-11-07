import { classifyRenderer, softwareRenderingAdvice } from '../render/gpuClass';
import { useStore } from '../state/store';
import { t } from '../i18n';

/**
 * Says so when the page is not drawing on the graphics card.
 *
 * Nothing a page runs can *make* a browser use the GPU. Hardware acceleration is
 * the browser's own setting, and its driver blocklist is consulted before any
 * page exists; the app already asks for the discrete adapter
 * (`powerPreference: 'high-performance'` on both backends) and that is the whole
 * of the influence it has. What it can do is notice when the answer was no.
 *
 * Worth a banner rather than a line in the resource panel, which is the mistake
 * this started as. Someone whose browser has fallen back to a CPU rasteriser
 * experiences it as the viewer being unusably slow with their data — a symptom
 * that points squarely at the tool. They have no reason to go looking in a
 * collapsed diagnostics section for the reason, so the reason has to come to
 * them, once, at the top.
 *
 * Silent unless the renderer is positively identified as software. An
 * unrecognised adapter says nothing at all: telling someone with a working GPU
 * to go and reconfigure their browser is a worse failure than missing a case.
 */
export function SoftwareRenderingWarning() {
  const gpuName = useStore((s) => s.budgets.gpuName);
  const advice = softwareRenderingAdvice(classifyRenderer(gpuName));
  if (!advice) return null;
  return (
    <div
      data-testid="software-rendering-warning"
      style={{
        margin: '8px 0 0',
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid var(--bad)',
        color: 'var(--bad)',
        fontSize: 12,
        lineHeight: 1.45,
      }}
    >
      <strong>{t('heat.softwareRenderingWarning.title')}</strong>
      <br />
      {advice}
    </div>
  );
}
