/**
 * The help mode's key: what each colour on the screen means, for the tab and
 * the mode in use. Each ramp is read from where the view gets it, so what is
 * explained is what is drawn, and a ramp the user edited shows as edited.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { t } from '../../i18n';
import type { Rgb } from '../../race/geometry';
import { rgbCss } from '../../race/geometry';
import { lastPointer, useHelpStore } from '../../state/helpStore';
import { useMatchStore } from '../../state/matchStore';
import { useEngine } from '../EngineContext';
import { targetInPage, type HelpTarget } from './helpTarget';
import { useRaceStore } from '../../state/raceStore';
import { heatModeFor } from '../../data/lines';
import { useStore } from '../../state/store';
import type { ColorStop } from '../../state/types';
import { RaceKey } from '../race/RaceHelp';
import './help.css';

/** A section of the key. */
export function KeyGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="help-group">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

/** One colour and what it means. */
export function KeyRow({ color, children }: { color?: string; children: ReactNode }) {
  return (
    <div className="help-row">
      {color ? <i style={{ background: color }} /> : <i className="none" />}
      <span>{children}</span>
    </div>
  );
}

/** A ramp from a colour function of 0 to 1, with what its ends (and middle) mean. */
export function KeyRamp({
  label,
  color,
  low,
  middle,
  high,
}: {
  label: string;
  color: (t: number) => Rgb;
  low: string;
  middle?: string;
  high: string;
}) {
  const stops = Array.from({ length: 9 }, (_, i) => `${rgbCss(color(i / 8))} ${(i / 8) * 100}%`);
  return <RampRow label={label} gradient={`linear-gradient(90deg, ${stops.join(', ')})`} low={low} middle={middle} high={high} />;
}

function RampRow({ label, gradient, low, middle, high }: { label: string; gradient: string; low: string; middle?: string; high: string }) {
  return (
    <div className="help-ramp">
      <div className="name">{label}</div>
      <div className="bar" style={{ backgroundImage: gradient }} />
      <div className="ends">
        <span>{low}</span>
        {middle && <span>{middle}</span>}
        <span>{high}</span>
      </div>
    </div>
  );
}

function stopsGradient(stops: ColorStop[]): string {
  const parts = stops.map((s) => `rgba(${s.rgb[0]},${s.rgb[1]},${s.rgb[2]},${s.alpha}) ${s.pos * 100}%`);
  return `linear-gradient(90deg, ${parts.join(', ')})`;
}

const HEX = (r: number, g: number, b: number) => `rgb(${r},${g},${b})`;

/** The 3D view's colours, in the mode in use. */
function ViewKey() {
  const mode = useStore((s) => heatModeFor(s.mode, s.lines));
  const scheme = useStore((s) => s.heat.scheme);
  const grid = useStore((s) => s.showGrid);
  const axes = useStore((s) => s.showAxes);
  return (
    <>
      <KeyGroup title={t('help.view.title')}>
        {(mode === 'heat-simple' || mode === 'heat-lines') && (
          <RampRow
            label={t('help.heat.ramp')}
            gradient={stopsGradient(scheme.positive)}
            low={t('help.heat.little')}
            high={t('help.heat.most')}
          />
        )}
        {mode === 'heat-difference' && (
          <>
            <RampRow
              label={t('help.heat.positive')}
              gradient={stopsGradient(scheme.positive)}
              low={t('help.heat.little')}
              high={t('help.heat.most')}
            />
            <RampRow
              label={t('help.heat.negative')}
              gradient={stopsGradient(scheme.negative)}
              low={t('help.heat.little')}
              high={t('help.heat.most')}
            />
            <KeyRow>{t('help.heat.even')}</KeyRow>
          </>
        )}
        {mode === 'heat-teams' && (
          <>
            <KeyRow>{t('help.heat.teams')}</KeyRow>
            <KeyRow color="#8d8d8d">{t('help.heat.teamsGrey')}</KeyRow>
          </>
        )}
        {mode === 'team' && (
          <>
            <KeyRow>{t('help.team.boxes')}</KeyRow>
            <KeyRow>{t('help.team.trail')}</KeyRow>
            <KeyRow color="#ffffff">{t('help.team.look')}</KeyRow>
          </>
        )}
        <KeyRow color={HEX(77, 242, 255)}>{t('help.view.pick')}</KeyRow>
        <KeyRow color={HEX(255, 242, 102)}>{t('help.view.ruler')}</KeyRow>
      </KeyGroup>
      <KeyGroup title={t('help.level.title')}>
        <KeyRow color={HEX(150, 150, 150)}>{t('help.level.ground')}</KeyRow>
        <KeyRow color={HEX(89, 217, 255)}>{t('help.level.structure')}</KeyRow>
        <KeyRow color={HEX(140, 184, 219)}>{t('help.level.water')}</KeyRow>
        {grid && <KeyRow>{t('help.level.grid')}</KeyRow>}
        {axes && <KeyRow>{t('help.level.axes')}</KeyRow>}
      </KeyGroup>
    </>
  );
}

function PanelKey() {
  return (
    <KeyGroup title={t('help.panels.title')}>
      <KeyRow color="#4ade80">{t('help.panels.good')}</KeyRow>
      <KeyRow color="#f59e0b">{t('help.panels.caution')}</KeyRow>
      <KeyRow color="#ef4444">{t('help.panels.bad')}</KeyRow>
    </KeyGroup>
  );
}

function MatchKey() {
  // Counter-Strike's sides, rounds and their reasons only where a Counter-Strike
  // scoreboard is loaded: a War Thunder or DCS battle has none of them, and
  // explaining its labels with them was wrong.
  const cs = useMatchStore((s) => s.docs.length > 0);
  return (
    <>
      <KeyGroup title={t('help.match.title')}>
        {cs ? (
          <>
            <KeyRow color="#e0a43c">{t('help.match.t')}</KeyRow>
            <KeyRow color="#5d9be0">{t('help.match.ct')}</KeyRow>
            <KeyRow color="#8d96a5">{t('help.match.none')}</KeyRow>
            <KeyRow>{t('help.match.notIn3d')}</KeyRow>
            <KeyRow>{t('help.match.rounds')}</KeyRow>
            <KeyRow>{t('help.match.reasons')}</KeyRow>
            <KeyRow>{t('help.match.after')}</KeyRow>
            <KeyRow color="#4ade80">{t('help.match.plus')}</KeyRow>
            <KeyRow color="#ef4444">{t('help.match.minus')}</KeyRow>
          </>
        ) : (
          <KeyRow>{t('help.match.teams')}</KeyRow>
        )}
      </KeyGroup>
      <ViewKey />
    </>
  );
}

/**
 * What is under the pointer, explained: the label or figure F1 was pressed
 * over, and whatever the pointer moves onto while the key is open - read a few
 * times a second at most (`helpTarget.ts`).
 */
function AtPointer() {
  const engine = useEngine();
  const [target, setTarget] = useState<HelpTarget | null>(null);
  const [control, setControl] = useState<ControlHelp | null>(null);
  useEffect(() => {
    const figureAt = (x: number, y: number) => {
      if (!engine) return false;
      const r = engine.canvas.getBoundingClientRect();
      if (x < r.left || y < r.top || x > r.right || y > r.bottom) return false;
      return engine.figureAt(x - r.left, y - r.top, true) !== null;
    };
    const read = () => {
      const c = controlAt(lastPointer.x, lastPointer.y);
      setControl(c);
      setTarget(c ? null : targetInPage(lastPointer.x, lastPointer.y, figureAt));
    };
    read();
    let timer = 0;
    const onMove = () => {
      if (!timer) timer = window.setTimeout(() => ((timer = 0), read()), 150);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(timer);
    };
  }, [engine]);
  return (
    <KeyGroup title={t('help.at.title')}>
      {control ? (
        <div className="help-row help-control">
          <i className="none" />
          <span>
            <b>{control.name}</b>
            {control.about && <span className="help-about">{control.about}</span>}
          </span>
        </div>
      ) : (
        <KeyRow>{target ? t(`help.at.${target}`) : t('help.at.none')}</KeyRow>
      )}
    </KeyGroup>
  );
}

/** A control of the panels, the bars or the settings under the pointer: its name and what its tooltip or hint says. */
interface ControlHelp {
  name: string;
  about: string | null;
}

const words = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

/**
 * The control under (x, y), read from the page a few times a second at most
 * while the help is open: every control explains itself by its label and the
 * tooltip or hint it already carries, so nothing has to be written twice.
 */
function controlAt(x: number, y: number): ControlHelp | null {
  if (x < 0 || typeof document.elementFromPoint !== 'function') return null;
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!el || !el.closest('.sidebar, .timeline-bar, .quick-bar, .settings-popover, .help-panel, .vsign-panel, .vsign-head')) return null;
  if (el.closest('.help-panel')) return null;
  const ctl = el.closest<HTMLElement>('button, select, input, textarea, label, [role="button"], [role="tab"], .field, summary');
  if (!ctl) return null;
  const field = ctl.closest('.field');
  const name =
    ctl.getAttribute('aria-label') ||
    words(field?.querySelector('.label > span')) ||
    words(ctl.tagName === 'INPUT' || ctl.tagName === 'SELECT' ? ctl.closest('label') : ctl).slice(0, 80) ||
    ctl.getAttribute('title') ||
    '';
  if (!name) return null;
  const titled = ctl.closest<HTMLElement>('[title]');
  const about = ctl.getAttribute('data-tip') || titled?.getAttribute('title') || words(field?.querySelector('.hint')) || null;
  return { name: name.replace(/^▶\s*/, ''), about: about && about !== name ? about : null };
}

/** The key over the view, while the help mode is on. */
export function HelpPanel() {
  const on = useHelpStore((s) => s.on);
  const toggle = useHelpStore((s) => s.toggle);
  const tab = useRaceStore((s) => s.tab);
  if (!on) return null;
  return (
    <div className="help-panel">
      <div className="help-head">
        <strong>{t('help.title')}</strong>
        <button type="button" className="icon" title={t('help.toggle')} onClick={toggle}>
          ×
        </button>
      </div>
      <AtPointer />
      {tab === 'race' ? (
        <RaceKey />
      ) : tab === 'match' ? (
        <MatchKey />
      ) : (
        <>
          <ViewKey />
          <PanelKey />
        </>
      )}
    </div>
  );
}

/** The button that turns the help mode on and off. */
export function HelpButton() {
  const on = useHelpStore((s) => s.on);
  const toggle = useHelpStore((s) => s.toggle);
  return (
    <button type="button" className={`help-button${on ? ' on' : ''}`} title={t('help.toggle')} aria-pressed={on} onClick={toggle}>
      ?
    </button>
  );
}
