/**
 * The usage statistics in the viewer: the switch in Settings, the "Your
 * usage" page (the same top lists as tools/usage-report.mjs, read from this
 * browser), its Export and Delete, and the quick feedback on a control - the
 * menu a right click on a control opens while statistics are kept, and the
 * three answers on the help card (F1). All of it local: nothing here sends
 * anything anywhere but this browser's storage and this install's own server.
 */

import { useEffect, useState } from 'react';
import { has, num, t, useLang } from '../../i18n';
import indexData from 'virtual:command-index';
import { idbAll, idbClear } from '../../usage/db';
import { extraFeatures } from '../../usage/extras';
import { feedbackForm, useFeedback, type FeedbackKind } from '../../usage/feedbackStore';
import { flush, record, USAGE_ROUTE, useUsage } from '../../usage/recorder';
import { buildReport, toFix, type IndexEntry, type Report } from '../../usage/report';
import { where } from '../../usage/hooks';
import { FEEDBACK } from '../../usage/schema';
import { confirmDialog, Dialog, toast } from '../shell/kit';
import { create } from 'zustand';
import './usage.css';

const useUsagePage = create<{ open: boolean }>(() => ({ open: false }));

const say = (k: string) => (has(k) ? t(k) : null);
const PANEL_KEY: Record<string, string> = { palette: 'shell.palette.title', sheet: 'shell.cmd.sheet', settings: 'shell.settings.title', help: 'help.title' };
const MODE_KEY: Record<string, string> = {
  'heat-simple': 'app.mode.heat.label',
  'heat-difference': 'app.mode.difference.label',
  'heat-teams': 'app.mode.teamHeat.label',
  'heat-lines': 'app.mode.lineHeat.label',
  team: 'app.mode.overlay.label',
};

/** A feature id in words: its section and label, its key, its workspace. */
export function nameOf(id: string): string {
  const colon = id.indexOf(':');
  const kind = id.slice(0, colon);
  const rest = id.slice(colon + 1);
  switch (kind) {
    case 'ctl': {
      const [a, b] = rest.split('/');
      return [say(a) ?? a, b === '_' ? '…' : (say(b) ?? b)].join(' › ');
    }
    case 'sec':
      return say(rest) ?? rest;
    case 'cmd':
      return say(`shell.key.${rest}`) ?? say(`shell.cmd.${rest}`) ?? rest;
    case 'ws':
      return say(rest === 'vehicle' ? 'vehicle.tab.label' : `app.tab.${rest}`) ?? rest;
    case 'task': {
      const [w, x] = rest.split('.');
      return `${nameOf(`ws:${w}`)} › ${say(`shell.task.${x}`) ?? x}`;
    }
    case 'panel':
      return say(PANEL_KEY[rest] ?? '') ?? rest;
    case 'mode':
      return say(MODE_KEY[rest] ?? '') ?? rest;
    case 'cam':
      return say(`heat.viewPanel.camera.preset.${rest}`) ?? rest;
    default:
      return id;
  }
}

const dur = (ms: number) => (ms >= 3_600_000 ? `${num(ms / 3_600_000, 1)} h` : ms >= 60_000 ? `${num(Math.round(ms / 60_000))} min` : `${num(Math.round(ms / 1000))} s`);

/** The row in Settings: the switch, and the page. */
export function UsageSettingsRow({ onOpen }: { onOpen: () => void }) {
  useLang();
  const choice = useUsage((s) => s.choice);
  const enabled = useUsage((s) => s.enabled);
  const setChoice = useUsage((s) => s.setChoice);
  return (
    <div className="settings-row usage-row">
      <span>{t('usage.settings.label')}</span>
      <label className="usage-toggle">
        <input type="checkbox" checked={enabled} onChange={(e) => setChoice(e.target.checked ? 'on' : 'off')} data-usage-choice={choice ?? 'unset'} />
        {t('usage.settings.toggle')}
      </label>
      <button
        type="button"
        onClick={() => {
          onOpen();
          useUsagePage.setState({ open: true });
        }}
      >
        {t('usage.settings.open')}
      </button>
    </div>
  );
}

/** Opens the usage page (the palette, a test). */
export function openUsagePage(): void {
  useUsagePage.setState({ open: true });
}

export function UsageHost() {
  const open = useUsagePage((s) => s.open);
  return (
    <>
      {open && <UsagePage onClose={() => useUsagePage.setState({ open: false })} />}
      <FeedbackHost />
    </>
  );
}

function UsagePage({ onClose }: { onClose: () => void }) {
  useLang();
  const enabled = useUsage((s) => s.enabled);
  const local = useUsage((s) => s.local);
  const choice = useUsage((s) => s.choice);
  const kept = useUsage((s) => s.kept);
  const setChoice = useUsage((s) => s.setChoice);
  const [report, setReport] = useState<Report | null>(null);
  const [failed, setFailed] = useState(false);
  const [gen, setGen] = useState(0);
  useEffect(() => {
    let live = true;
    void (async () => {
      await flush().catch(() => undefined);
      try {
        const events = await idbAll();
        const index = (indexData as { entries: IndexEntry[] }).entries;
        if (live) setReport(buildReport({ events, index, extras: extraFeatures() }));
      } catch {
        if (live) setFailed(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [gen]);

  const exportAll = async () => {
    await flush().catch(() => undefined);
    const events = await idbAll().catch(() => []);
    const blob = new Blob([JSON.stringify({ v: 1, exported: new Date().toISOString(), events })], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `3dheat-usage-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  const deleteAll = async () => {
    if (!(await confirmDialog(t('usage.delete.confirm'), t('usage.delete')))) return;
    await idbClear().catch(() => undefined);
    if (local) await fetch(USAGE_ROUTE, { method: 'DELETE', headers: { 'X-Heat3d-Usage': '1' } }).catch(() => undefined);
    toast(t('usage.deleted'), 'good');
    setReport(null);
    setGen((g) => g + 1);
  };

  const state = !enabled ? 'usage.state.off' : local ? 'usage.state.local' : 'usage.state.browser';
  return (
    <Dialog title={t('usage.title')} onClose={onClose} wide className="usage-page">
      <p className="usage-about">{t('usage.about')}</p>
      <p className="usage-about">{t('usage.aboutWords')}</p>
      <label className="usage-toggle">
        <input type="checkbox" checked={enabled} onChange={(e) => setChoice(e.target.checked ? 'on' : 'off')} />
        {t('usage.settings.toggle')}
      </label>
      <p className="usage-state">
        {t(state)}
        {enabled && local && choice === null ? ` ${t('usage.state.localKey')}` : ''}
        {enabled ? ` ${t('usage.state.counts', { kept })}` : ''}
      </p>
      <div className="dialog-actions usage-actions">
        <button type="button" onClick={() => void exportAll()}>
          {t('usage.export')}
        </button>
        <button type="button" className="danger" onClick={() => void deleteAll()}>
          {t('usage.delete')}
        </button>
      </div>
      <h3>{t('usage.page.title')}</h3>
      {failed ? <p>{t('usage.empty')}</p> : !report ? <p>{t('usage.loading')}</p> : report.events === 0 ? <p>{t('usage.empty')}</p> : <YourUsage r={report} />}
      <p className="usage-foot">{t('usage.page.report')}</p>
    </Dialog>
  );
}

function List({ title, items }: { title: string; items: Array<{ key: string; main: string; side?: string }> }) {
  return (
    <section className="usage-list">
      <h4>{title}</h4>
      {items.length ? (
        <ol>
          {items.map((x) => (
            <li key={x.key}>
              <span>{x.main}</span>
              {x.side && <span className="usage-side">{x.side}</span>}
            </li>
          ))}
        </ol>
      ) : (
        <p className="usage-none">{t('usage.page.none')}</p>
      )}
    </section>
  );
}

function YourUsage({ r }: { r: Report }) {
  const top = r.features.filter((x) => x.uses > 0).sort((a, b) => b.uses - a.uses).slice(0, 12);
  const via = (src: Record<string, number>) =>
    t('usage.page.via', { sources: Object.entries(src).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') });
  const hard = r.features.filter((x) => x.cls === 'hard-to-reach').slice(0, 10);
  const broken = toFix(r).slice(0, 10);
  const counts = new Map<string, number>();
  for (const x of r.features) if (x.uses === 0) counts.set(x.cls, (counts.get(x.cls) ?? 0) + 1);
  return (
    <div className="usage-grid">
      <p className="usage-summary">{t('usage.page.summary', { events: r.events, sessions: r.sessions, active: dur(r.activeMs) })}</p>
      <List title={t('usage.page.top')} items={top.map((x) => ({ key: x.id, main: `${num(x.uses)} · ${nameOf(x.id)}`, side: `${via(x.src)}${x.pathTypical !== null ? ` · ${t('usage.page.steps', { n: x.pathTypical })}` : ''}` }))} />
      <List title={t('usage.page.time')} items={r.workspaces.map((w) => ({ key: w.ws, main: nameOf(`ws:${w.ws}`), side: dur(w.ms) }))} />
      <List title={t('usage.page.broken')} items={broken.map((x) => ({ key: x.id, main: nameOf(x.id), side: x.evidence.join('; ') }))} />
      <List title={t('usage.page.hard')} items={hard.map((x) => ({ key: x.id, main: nameOf(x.id), side: x.evidence.join('; ') }))} />
      <List title={t('usage.page.friction')} items={r.friction.slice(0, 10).map((f) => ({ key: `${f.id}|${f.kind}`, main: `${num(f.n)} · ${nameOf(f.id)}`, side: f.kind }))} />
      <List title={t('usage.page.misses')} items={r.misses.slice(0, 10).map((m) => ({ key: m.q, main: `“${m.q}”`, side: `${num(m.n)}×` }))} />
      <List title={t('usage.page.feedback')} items={r.feedback.slice(0, 10).map((f) => ({ key: `${f.t}|${f.id}`, main: nameOf(f.id), side: `${t(`usage.feedback.${f.v}`)}${f.note ? `: ${f.note}` : ''}` }))} />
      <List title={t('usage.page.classes')} items={[...counts].map(([c, n]) => ({ key: c, main: t(`usage.class.${c}`), side: num(n) }))} />
    </div>
  );
}

// ---------------------------------------------------------------- feedback

/** The three answers, as buttons: on the help card and in the right-click menu. */
export function FeedbackButtons({ id, className }: { id: string; className?: string }) {
  useLang();
  return (
    <div className={`usage-feedback-buttons${className ? ` ${className}` : ''}`}>
      {FEEDBACK.map((v) => (
        <button key={v} type="button" role="menuitem" onClick={() => feedbackForm(id, v)}>
          {t(`usage.feedback.${v}`)}
        </button>
      ))}
    </div>
  );
}

function FeedbackHost() {
  useLang();
  const menu = useFeedback((s) => s.menu);
  const form = useFeedback((s) => s.form);
  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !(e.target as Element | null)?.closest?.('.usage-menu')) useFeedback.setState({ menu: null });
    };
    window.addEventListener('pointerdown', close, true);
    window.addEventListener('keydown', close, true);
    return () => {
      window.removeEventListener('pointerdown', close, true);
      window.removeEventListener('keydown', close, true);
    };
  }, [menu]);
  return (
    <>
      {menu && (
        <div className="usage-menu" role="menu" aria-label={t('usage.feedback.menu')} style={{ left: Math.min(menu.x, innerWidth - 240), top: Math.min(menu.y, innerHeight - 140) }}>
          <div className="usage-menu-title">{nameOf(menu.id)}</div>
          <FeedbackButtons id={menu.id} />
        </div>
      )}
      {form && <FeedbackForm id={form.id} initial={form.v} />}
    </>
  );
}

function FeedbackForm({ id, initial }: { id: string; initial: FeedbackKind }) {
  const [v, setV] = useState<FeedbackKind>(initial);
  const [note, setNote] = useState('');
  const close = () => useFeedback.setState({ form: null });
  const save = () => {
    const text = note.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, 500);
    record({ k: 'feedback', id, v, ...(text ? { note: text } : {}), ws: where.ws as never });
    void flush();
    toast(t('usage.feedback.thanks'), 'good');
    close();
  };
  return (
    <Dialog title={`${t('usage.feedback.title')}: ${nameOf(id)}`} onClose={close} className="usage-feedback">
      <div className="seg usage-kinds" role="radiogroup">
        {FEEDBACK.map((k) => (
          <button key={k} type="button" className={v === k ? 'on' : ''} aria-pressed={v === k} onClick={() => setV(k)}>
            {t(`usage.feedback.${k}`)}
          </button>
        ))}
      </div>
      <label className="usage-note">
        <span>{t('usage.feedback.note')}</span>
        <textarea value={note} maxLength={500} rows={4} onChange={(e) => setNote(e.target.value)} placeholder={v === 'wish' ? t('usage.feedback.wish') : ''} autoFocus />
      </label>
      <p className="usage-about">{t('usage.feedback.about')}</p>
      <div className="dialog-actions">
        <button type="button" onClick={close}>
          {t('shell.confirm.cancel')}
        </button>
        <button type="button" className="primary" onClick={save}>
          {t('usage.feedback.save')}
        </button>
      </div>
    </Dialog>
  );
}
