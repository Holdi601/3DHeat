import { useEffect, useMemo, useRef, useState } from 'react';
import { residentColumns } from '../../data/resident';
import { evictColumn, useColumnStore } from '../../data/columnStore';
import { formatBytes } from '../../data/memory';
import { formatCount } from '../../data/synth';
import { useStore } from '../../state/store';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { num, t } from '../../i18n';
import { Section } from '../controls';
import { useDevTools } from '../shell/shellStore';

/**
 * What is resident right now: the dataset's columns in RAM, the rows on the
 * GPU, and the tab's own JavaScript heap, each against its budget.
 *
 * Read without touching the frame path: the columns once per dataset, the GPU
 * figures from the engine's live counters (written by the renderer as it
 * allocates, no readback), the heap every two seconds.
 */

/** Share of both budgets under which the panel offers more fidelity. */
const ROOMY = 0.25;

interface Heap {
  used: number;
  limit: number | null;
  /** `measureUserAgentSpecificMemory`, which covers workers too, or Chrome's `performance.memory`. */
  source: 'uasm' | 'performance';
}

function quickHeap(): Heap | null {
  const m = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  return m ? { used: m.usedJSHeapSize, limit: m.jsHeapSizeLimit, source: 'performance' } : null;
}

/** The full measurement, where the page is cross-origin isolated; it takes a while and is asked for on demand. */
async function fullHeap(): Promise<Heap | null> {
  const p = performance as Performance & { measureUserAgentSpecificMemory?: () => Promise<{ bytes: number }> };
  if (typeof p.measureUserAgentSpecificMemory !== 'function' || !globalThis.crossOriginIsolated) return null;
  try {
    const r = await p.measureUserAgentSpecificMemory();
    return { used: r.bytes, limit: null, source: 'uasm' };
  } catch {
    return null;
  }
}

export function MemoryPanel() {
  const dataset = useStore((s) => s.dataset);
  const budgets = useStore((s) => s.budgets);
  const budget = useStore((s) => s.budget);
  const patchBudget = useStore((s) => s.patchBudget);
  const engine = useEngine();
  // The columns on demand: what is in memory, what waits in the files, what was evicted.
  const onDemand = useColumnStore();
  const columns = useMemo(() => (dataset ? residentColumns(dataset) : []), [dataset, onDemand.version]);
  const ram = columns.reduce((a, c) => a + c.bytes, 0);
  const [heap, setHeap] = useState<Heap | null>(() => quickHeap());
  const [showAll, setShowAll] = useState(false);
  const dev = useDevTools();

  // Only while the heap is shown: a render every two seconds for nothing otherwise.
  useEffect(() => {
    if (!dev) return;
    const h = setInterval(() => setHeap((prev) => (prev?.source === 'uasm' ? prev : quickHeap())), 2000);
    return () => clearInterval(h);
  }, [dev]);

  // GPU figures straight into the DOM: they change while chunks upload, and a
  // React render per frame for three numbers is work the frame does not need.
  const gpuLine = useRef<HTMLDivElement>(null);
  const gpuUsed = useRef(0);
  useAnimationFrame(() => {
    if (!engine || !gpuLine.current) return;
    const l = engine.live;
    gpuUsed.current = l.gpuBytes + l.levelBytes;
    const text = t('heat.memoryPanel.gpu', {
      rows: formatBytes(l.gpuBytes),
      level: formatBytes(l.levelBytes),
      budget: formatBytes(budgets.gpu),
      resident: formatCount(l.residentRows),
      dropped: formatCount(l.droppedRows),
    });
    if (gpuLine.current.textContent !== text) gpuLine.current.textContent = text;
  });

  if (!dataset) return null;
  const roomy = ram < budgets.ram * ROOMY && gpuUsed.current < budgets.gpu * ROOMY;
  const canFiner = budget.heatScale < 1;
  const shown = showAll ? columns : columns.slice(0, 8);

  return (
    <Section title={t('heat.memoryPanel.title')}>
      <div data-testid="memory-panel">
        <div className="hint">
          {t('heat.memoryPanel.ram', {
            used: formatBytes(ram),
            budget: formatBytes(budgets.ram),
            percent: num((ram / Math.max(1, budgets.ram)) * 100, 0),
            rows: formatCount(dataset.count),
          })}
        </div>
        <div className="hint" ref={gpuLine} />
        {/* The tab's heap and every column's bytes are for debugging the viewer:
            with the developer tools only. The totals above, the columns on
            demand and the room to spare are what a user acts on. */}
        {dev && (
          <div data-dev-tool="memory">
        {heap && (
          <div className="hint">
            {heap.limit
              ? t('heat.memoryPanel.heap', { used: formatBytes(heap.used), limit: formatBytes(heap.limit) })
              : t('heat.memoryPanel.heapAll', { used: formatBytes(heap.used) })}
          </div>
        )}
        {typeof (performance as { measureUserAgentSpecificMemory?: unknown }).measureUserAgentSpecificMemory === 'function' &&
          globalThis.crossOriginIsolated && (
            <button onClick={() => void fullHeap().then((h) => h && setHeap(h))}>{t('heat.memoryPanel.measure')}</button>
          )}
        <div className="team-list">
          {shown.map((c) => (
            <div className="team-row" key={`${c.kind}:${c.name}`}>
              <span className="name" title={c.name}>
                {c.kind === 'attr' ? c.name : t('heat.memoryPanel.core', { name: c.name })}
              </span>
              <span className="val">{formatBytes(c.bytes)}</span>
            </div>
          ))}
        </div>
        {columns.length > 8 && (
          <button onClick={() => setShowAll((v) => !v)}>
            {showAll ? t('heat.memoryPanel.fewer') : t('heat.memoryPanel.all', { count: columns.length })}
          </button>
        )}
          </div>
        )}
        {Object.keys(onDemand.entries).length > 0 && <OnDemandList entries={Object.values(onDemand.entries)} mapBytes={onDemand.mapBytes} evicted={onDemand.evicted} />}
        {roomy && (
          <div className="hint" style={{ color: 'var(--good)' }}>
            {t('heat.memoryPanel.roomy')}{' '}
            {canFiner && (
              <button onClick={() => patchBudget({ heatScale: 1, splatsPerFrame: Math.max(budget.splatsPerFrame, 8_000_000) })}>
                {t('heat.memoryPanel.finer')}
              </button>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

/** The columns a load can read again from its files, each with where it is now. */
function OnDemandList({ entries, mapBytes, evicted }: { entries: ReturnType<typeof useColumnStore.getState>['entries'][string][]; mapBytes: number; evicted: number }) {
  const resident = entries.filter((e) => e.state === 'resident');
  return (
    <div data-testid="memory-on-demand">
      <div className="hint">
        {t('heat.memoryPanel.onDemand', {
          resident: resident.length,
          count: entries.length,
          bytes: formatBytes(resident.reduce((a, e) => a + e.bytes, 0)),
          map: formatBytes(mapBytes),
          evicted,
        })}
      </div>
      <div className="team-list">
        {[...entries]
          .sort((a, b) => b.lastUsed - a.lastUsed)
          .map((e) => (
            <div className="team-row" key={e.name} data-testid={`on-demand-${e.name}`} data-state={e.state}>
              <span className="name" title={e.name}>
                {e.name}
              </span>
              <span className="val" style={{ color: e.state === 'resident' ? undefined : 'var(--text-dim)' }}>
                {t(`heat.memoryPanel.state.${e.state}`)}
              </span>
              <span className="val">{formatBytes(e.bytes)}</span>
              {e.state === 'resident' && (
                <button title={t('heat.memoryPanel.evictTitle')} onClick={() => evictColumn(e.name)}>
                  {t('heat.memoryPanel.evict')}
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
