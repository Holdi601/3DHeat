import { useMemo, useState } from 'react';
import { Section } from '../controls';
import { momentOf, usePlanStore } from '../../state/planStore';
import { ALARM_STATES, ROE_STATES, TASK_GROUPS, TASKS, taskDef, taskSchedule, winKey, type PlanTask, type TaskConflict, type TaskKind, type TaskTrigger } from '../../tactics/tasks';
import { badgeStrokes, svgPaths, PLATE } from '../../tactics/taskSymbols';
import { routesIn, type Plan } from '../../tactics/plan';
import { clock } from '../../tactics/timing';
import { t } from '../../i18n';

const DEG = 180 / Math.PI;

/** A task's badge as SVG, the same drawing the board shows. */
export function TaskIcon({ kind, size = 18 }: { kind: TaskKind | 'conflict'; size?: number }) {
  const { picto, letters } = badgeStrokes(kind);
  const p = svgPaths(picto);
  const l = svgPaths(letters);
  const [w, h] = kind === 'conflict' ? [1, 1] : PLATE;
  return (
    <svg className={`task-icon${kind === 'conflict' ? ' warn' : ''}`} width={(size * w) / h} height={size} viewBox={`${-w} ${-h} ${2 * w} ${2 * h}`} aria-hidden="true">
      <rect x={-w} y={-h} width={2 * w} height={2 * h} rx={0.25} className="plate" />
      <path d={p.lines + l.lines} fill="none" stroke="currentColor" strokeWidth={0.14} strokeLinecap="round" strokeLinejoin="round" />
      {p.fills && <path d={p.fills} fill="currentColor" />}
    </svg>
  );
}

const name = (k: TaskKind) => t(`tactics.task.${k}`);

/** What a conflict says, in words. */
function conflictText(plan: Plan, c: TaskConflict): string {
  const task = plan.tasks.find((x) => x.id === c.task);
  const other = c.other ? plan.tasks.find((x) => x.id === c.other) : undefined;
  const fig = c.figure ? (plan.figures.find((f) => f.id === c.figure)?.label ?? c.figure) : '';
  return t(`tactics.conflict.${c.kind}`, {
    task: task ? (task.label && task.kind === 'game' ? task.label : name(task.kind)) : c.task,
    other: other ? name(other.kind) : '',
    figure: fig,
    needs: c.needs !== undefined ? (c.kind === 'speed' ? c.needs.toFixed(1) : clock(c.needs)) : '',
    given: c.given !== undefined ? (c.kind === 'speed' ? c.given.toFixed(1) : clock(c.given)) : '',
    reason: c.reason ?? 'missing',
  });
}

/** A number field that may be left empty (absent). */
function Num({ label, value, onChange, step = 1, min, scale = 1 }: { label: string; value: number | undefined; onChange: (v: number | undefined) => void; step?: number; min?: number; scale?: number }) {
  return (
    <label className="task-field">
      <span>{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        value={value === undefined ? '' : Math.round(value * scale * 100) / 100}
        onChange={(e) => {
          const v = e.target.value === '' ? undefined : Number(e.target.value) / scale;
          onChange(v === undefined || Number.isFinite(v) ? v : undefined);
        }}
      />
    </label>
  );
}

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="task-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The task picker: search by name or letters, grouped; Shift and a digit for the nine at hand. */
function TaskPicker() {
  const [q, setQ] = useState('');
  const [miss, setMiss] = useState(false);
  const has = usePlanStore((s) => s.selection.length > 0);
  const query = q.trim().toLowerCase();
  const hits = TASKS.filter((d) => !query || name(d.id).toLowerCase().includes(query) || d.code.toLowerCase().includes(query) || t(`tactics.taskHint.${d.id}`).toLowerCase().includes(query));
  const pick = (k: TaskKind) => setMiss(usePlanStore.getState().addTask(k) === null);
  return (
    <div className="task-picker">
      <input
        type="search"
        autoFocus
        value={q}
        placeholder={t('tactics.tasks.search')}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && hits[0]) pick(hits[0].id);
          if (e.key === 'Escape') usePlanStore.getState().setTaskPicker(false);
          e.stopPropagation();
        }}
      />
      {!has && <div className="hint">{t('tactics.tasks.selectFirst')}</div>}
      {miss && <div className="hint warn">{t('tactics.tasks.needsUnit')}</div>}
      {TASK_GROUPS.map((g) => {
        const xs = hits.filter((d) => d.group === g);
        if (!xs.length) return null;
        return (
          <div key={g} className="task-group">
            <div className="task-group-name">{t(`tactics.taskGroup.${g}`)}</div>
            {xs.map((d) => (
              <button key={d.id} type="button" className="task-pick" onClick={() => pick(d.id)} title={t(`tactics.taskHint.${d.id}`)}>
                <TaskIcon kind={d.id} />
                <span className="task-name">{name(d.id)}</span>
                {d.quick && <kbd>⇧{d.quick}</kbd>}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** Every task's symbol and what it means. */
function TaskLegend() {
  return (
    <div className="task-legend">
      {TASK_GROUPS.map((g) => (
        <div key={g} className="task-group">
          <div className="task-group-name">{t(`tactics.taskGroup.${g}`)}</div>
          {TASKS.filter((d) => d.group === g).map((d) => (
            <div key={d.id} className="task-legend-row" title={t(`tactics.taskHint.${d.id}`)}>
              <TaskIcon kind={d.id} />
              <span>{name(d.id)}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="task-legend-row">
        <TaskIcon kind="conflict" />
        <span>{t('tactics.tasks.conflictMark')}</span>
      </div>
    </div>
  );
}

/** One task's settings: when it runs, its points, its sector, pattern, speed, target, trigger or state. */
function TaskEditor({ task }: { task: PlanTask }) {
  const plan = usePlanStore((s) => s.plan);
  const drawing = usePlanStore((s) => s.taskDraft?.task === task.id);
  const st = usePlanStore.getState;
  const def = taskDef(task.kind);
  const set = (patch: Partial<PlanTask>) => {
    const unset = (Object.keys(patch) as (keyof PlanTask)[]).filter((k) => patch[k] === undefined);
    st().setTask(task.id, patch, unset);
  };
  const route = task.figures[0] ? routesIn(plan, task.on?.step ?? task.step).get(task.figures[0]) : undefined;
  const others = plan.figures.filter((f) => !task.figures.includes(f.id));
  const trig = task.trigger;
  const setTrig = (k: TaskTrigger['kind']) => {
    const now = Math.round(momentOf(st()).time);
    const tr: TaskTrigger =
      k === 'time' ? { kind: 'time', at: now } : k === 'code' ? { kind: 'code', code: plan.codes[0]?.id ?? '' } : k === 'reach' ? { kind: 'reach', figure: others[0]?.id ?? '', step: task.step, point: 1 } : { kind: 'task', task: plan.tasks.find((x) => x.id !== task.id)?.id ?? '', edge: 'end' };
    set({ trigger: tr });
  };
  return (
    <div className="task-editor">
      <div className="task-editor-head">
        <TaskIcon kind={task.kind} size={22} />
        <strong>{task.kind === 'game' ? (task.game ?? name('game')) : name(task.kind)}</strong>
        <span className="hint">{t('tactics.tasks.units', { n: task.figures.length })}</span>
      </div>
      <label className="task-field">
        <span>{t('tactics.tasks.label')}</span>
        <input type="text" value={task.label ?? ''} onChange={(e) => set({ label: e.target.value || undefined })} />
      </label>
      {task.figures.length > 0 && (
        <Choice
          label={t('tactics.tasks.runs')}
          value={task.on ? 'route' : 'time'}
          options={[
            { value: 'time', label: t('tactics.tasks.runsTime') },
            { value: 'route', label: t('tactics.tasks.runsRoute') },
          ]}
          onChange={(v) => (v === 'route' ? set({ on: { step: task.step, from: 0 }, start: undefined, duration: task.kind === 'hold' ? undefined : task.duration }) : set({ on: undefined, start: Math.round(momentOf(st()).time) }))}
        />
      )}
      {task.on ? (
        <>
          <Num label={t('tactics.tasks.fromPoint')} value={task.on.from} min={0} onChange={(v) => set({ on: { ...task.on!, from: Math.max(0, Math.round(v ?? 0)) } })} />
          {!def.moves && task.kind !== 'hold' && <Num label={t('tactics.tasks.toPoint')} value={task.on.to} min={0} onChange={(v) => set({ on: { ...task.on!, ...(v === undefined ? { to: undefined } : { to: Math.round(v) }) } })} />}
          {!route && <div className="hint warn">{t('tactics.tasks.noRoute')}</div>}
        </>
      ) : (
        <Num label={t('tactics.tasks.start')} value={task.start} min={0} onChange={(v) => set({ start: v })} />
      )}
      {task.kind !== 'hold' && <Num label={t('tactics.tasks.duration')} value={task.duration} min={0} onChange={(v) => set({ duration: v && v > 0 ? v : undefined })} />}
      {(def.min > 0 || def.shape === 'sector' || def.shape === 'point') && (
        <div className="task-field">
          <span>{t('tactics.tasks.points', { n: task.points?.length ?? 0 })}</span>
          <button type="button" className={drawing ? 'on' : ''} onClick={() => (drawing ? st().finish() : st().drawTask(task.id))}>
            {drawing ? t('tactics.tasks.drawDone') : t('tactics.tasks.draw')}
          </button>
        </div>
      )}
      {def.sector && (
        <>
          <Num label={t('tactics.tasks.bearing')} value={task.bearing === undefined ? undefined : ((task.bearing * DEG) % 360 + 360) % 360} onChange={(v) => set({ bearing: v === undefined ? undefined : v / DEG })} />
          <Num label={t('tactics.tasks.arc')} value={task.arc === undefined ? undefined : task.arc * DEG} min={5} onChange={(v) => set({ arc: v === undefined ? undefined : Math.max(5, Math.min(360, v)) / DEG })} />
        </>
      )}
      {(def.sector || task.kind === 'orbit' || task.kind === 'smoke' || task.kind === 'cas' || task.kind === 'sead') && <Num label={task.kind === 'orbit' ? t('tactics.tasks.turnRadius') : t('tactics.tasks.range')} value={task.range} min={0} onChange={(v) => set({ range: v })} />}
      {task.kind === 'patrol' && <Choice label={t('tactics.tasks.pattern')} value={task.pattern === 'back' ? 'back' : 'loop'} options={(['loop', 'back'] as const).map((v) => ({ value: v, label: t(`tactics.tasks.pattern.${v}`) }))} onChange={(v) => set({ pattern: v })} />}
      {task.kind === 'sweep' && (
        <>
          <Choice label={t('tactics.tasks.pattern')} value={task.pattern === 'square' || task.pattern === 'sector' ? task.pattern : 'lanes'} options={(['lanes', 'square', 'sector'] as const).map((v) => ({ value: v, label: t(`tactics.tasks.pattern.${v}`) }))} onChange={(v) => set({ pattern: v })} />
          <Num label={t('tactics.tasks.spacing')} value={task.spacing} min={0} onChange={(v) => set({ spacing: v })} />
        </>
      )}
      {def.moves === 'path' && (
        <>
          <Num label={t('tactics.tasks.loops')} value={task.loops} min={0} step={task.kind === 'orbit' ? 0.5 : 1} onChange={(v) => set({ loops: v && v > 0 ? v : undefined })} />
          {task.kind === 'patrol' && <Num label={t('tactics.tasks.dwell')} value={task.dwell} min={0} onChange={(v) => set({ dwell: v })} />}
          <Num label={t('tactics.tasks.speed')} value={task.speed} min={0} step={0.5} onChange={(v) => set({ speed: v && v > 0 ? v : undefined })} />
          {task.kind === 'orbit' && <Num label={t('tactics.tasks.altitude')} value={task.altitude} onChange={(v) => set({ altitude: v })} />}
        </>
      )}
      {(def.moves === 'follow' || task.kind === 'guard') && (
        <>
          <Choice label={t('tactics.tasks.target')} value={task.target ?? ''} options={[{ value: '', label: '—' }, ...others.map((f) => ({ value: f.id, label: f.label || f.kind }))]} onChange={(v) => set({ target: v || undefined })} />
          <Num label={t('tactics.tasks.offset')} value={task.offset} min={0} onChange={(v) => set({ offset: v })} />
        </>
      )}
      {task.kind === 'hold' && (
        <>
          <Choice label={t('tactics.tasks.until')} value={trig?.kind ?? 'time'} options={(['time', 'code', 'reach', 'task'] as const).map((v) => ({ value: v, label: t(`tactics.tasks.trigger.${v}`) }))} onChange={setTrig} />
          {trig?.kind === 'time' && <Num label={t('tactics.tasks.at')} value={trig.at} min={0} onChange={(v) => set({ trigger: { kind: 'time', at: v ?? 0 } })} />}
          {trig?.kind === 'code' && <Choice label={t('tactics.tasks.code')} value={trig.code} options={[{ value: '', label: '—' }, ...plan.codes.map((c) => ({ value: c.id, label: c.name }))]} onChange={(v) => set({ trigger: { kind: 'code', code: v } })} />}
          {trig?.kind === 'reach' && (
            <>
              <Choice label={t('tactics.tasks.who')} value={trig.figure} options={[{ value: '', label: '—' }, ...others.map((f) => ({ value: f.id, label: f.label || f.kind }))]} onChange={(v) => set({ trigger: { ...trig, figure: v } })} />
              <Num label={t('tactics.tasks.stepN')} value={trig.step + 1} min={1} onChange={(v) => set({ trigger: { ...trig, step: Math.max(0, Math.round((v ?? 1) - 1)) } })} />
              <Num label={t('tactics.tasks.waypoint')} value={trig.point} min={1} onChange={(v) => set({ trigger: { ...trig, point: Math.max(1, Math.round(v ?? 1)) } })} />
            </>
          )}
          {trig?.kind === 'task' && (
            <>
              <Choice label={t('tactics.tasks.whichTask')} value={trig.task} options={[{ value: '', label: '—' }, ...plan.tasks.filter((x) => x.id !== task.id).map((x) => ({ value: x.id, label: `${name(x.kind)}${x.label ? ` (${x.label})` : ''}` }))]} onChange={(v) => set({ trigger: { ...trig, task: v } })} />
              <Choice label={t('tactics.tasks.edge')} value={trig.edge} options={(['start', 'end'] as const).map((v) => ({ value: v, label: t(`tactics.tasks.edge.${v}`) }))} onChange={(v) => set({ trigger: { ...trig, edge: v } })} />
            </>
          )}
        </>
      )}
      {task.kind === 'roe' && <Choice label={t('tactics.tasks.state')} value={(task.state ?? 'free') as (typeof ROE_STATES)[number]} options={ROE_STATES.map((v) => ({ value: v, label: t(`tactics.tasks.roe.${v}`) }))} onChange={(v) => set({ state: v })} />}
      {task.kind === 'alarm' && <Choice label={t('tactics.tasks.state')} value={(task.state ?? 'auto') as (typeof ALARM_STATES)[number]} options={ALARM_STATES.map((v) => ({ value: v, label: t(`tactics.tasks.alarm.${v}`) }))} onChange={(v) => set({ state: v })} />}
      <div className="task-actions">
        <button type="button" onClick={() => st().selectTask(null)}>
          {t('tactics.tasks.close')}
        </button>
        <button type="button" className="danger" onClick={() => st().removeTask(task.id)}>
          {t('tactics.tasks.remove')}
        </button>
      </div>
    </div>
  );
}

/**
 * The board's tasks: the picker (I) and the legend (Shift+I), the tasks of
 * the selected units (else all) with when they run, the one being edited,
 * the go-codes holds wait for, and everything that cannot work.
 */
export function TasksPanel() {
  const plan = usePlanStore((s) => s.plan);
  const selection = usePlanStore((s) => s.selection);
  const current = usePlanStore((s) => s.task);
  const picker = usePlanStore((s) => s.taskPicker);
  const legend = usePlanStore((s) => s.taskLegend);
  const st = usePlanStore.getState;
  const sched = useMemo(() => taskSchedule(plan), [plan]);
  const sel = new Set(selection);
  const list = (plan.tasks ?? []).filter((x) => !sel.size || x.figures.some((f) => sel.has(f)));
  const editing = plan.tasks.find((x) => x.id === current);
  const conflicts = sched.conflicts;
  const when = (x: PlanTask) => {
    const w = sched.windows.get(winKey(x.id, x.figures[0] ?? ''));
    return w ? `${clock(w.t0)}–${Number.isFinite(w.t1) ? clock(w.t1) : '…'}` : '—';
  };
  return (
    <Section title={t('tactics.tasks.title')} defaultOpen right={conflicts.length ? <span className="task-warn-count">{conflicts.length}</span> : undefined}>
      <div className="task-actions">
        <button type="button" className={picker ? 'on' : ''} onClick={() => st().setTaskPicker(!picker)} title={t('tactics.tasks.addHint')}>
          {t('tactics.tasks.add')} <kbd>I</kbd>
        </button>
        <button type="button" className={legend ? 'on' : ''} onClick={() => st().setTaskLegend(!legend)}>
          {t('tactics.tasks.legend')} <kbd>⇧I</kbd>
        </button>
      </div>
      {picker && <TaskPicker />}
      {legend && <TaskLegend />}
      {editing && <TaskEditor task={editing} />}
      <div className="task-list" role="list">
        {list.slice(0, 60).map((x) => (
          <button key={x.id} type="button" role="listitem" className={`task-row${x.id === current ? ' on' : ''}`} onClick={() => st().selectTask(x.id === current ? null : x.id)}>
            <TaskIcon kind={x.kind} />
            <span className="task-name">{x.label || name(x.kind)}</span>
            <span className="hint">{when(x)}</span>
          </button>
        ))}
        {list.length > 60 && <div className="hint">{t('tactics.tasks.more', { n: list.length - 60 })}</div>}
        {!list.length && <div className="hint">{t('tactics.tasks.none')}</div>}
      </div>
      <div className="task-codes">
        <div className="task-group-name">{t('tactics.tasks.codes')}</div>
        {plan.codes.map((c) => (
          <div key={c.id} className="task-code">
            <input type="text" value={c.name} aria-label={t('tactics.tasks.codeName')} onChange={(e) => st().setCode(c.id, { name: e.target.value })} />
            <input type="number" min={0} value={c.at ?? ''} aria-label={t('tactics.tasks.codeAt')} placeholder={t('tactics.tasks.codeNever')} onChange={(e) => st().setCode(c.id, { at: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })} />
            <button type="button" onClick={() => st().removeCode(c.id)} aria-label={t('tactics.tasks.remove')}>
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={() => st().addCode()}>
          {t('tactics.tasks.addCode')}
        </button>
      </div>
      {conflicts.length > 0 && (
        <div className="task-conflicts" role="list">
          <div className="task-group-name">{t('tactics.tasks.conflicts', { n: conflicts.length })}</div>
          {conflicts.slice(0, 30).map((c, i) => (
            <button key={i} type="button" role="listitem" className="task-conflict" onClick={() => st().selectTask(c.task)}>
              <TaskIcon kind="conflict" size={14} />
              <span>{conflictText(plan, c)}</span>
            </button>
          ))}
        </div>
      )}
    </Section>
  );
}
