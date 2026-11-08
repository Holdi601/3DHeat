import { Check, Section, Segmented } from '../controls';
import { useReplayStore } from '../../state/replayStore';
import { LOOK_COLOURS, LOOK_QUALITIES, type TacticalLook } from '../../render/tacticalLook';
import { t } from '../../i18n';

const SWITCHES: Array<keyof TacticalLook> = ['bloom', 'edges', 'contours', 'grid', 'scan', 'rings', 'ladders', 'panels', 'director'];

/**
 * The tactical display: the replay redrawn as a debrief telemetry screen
 * (`render/tacticalLook.ts`), its quality, its colour and each of its parts.
 * Off by default; T switches it.
 */
export function TacticalLookPanel() {
  const look = useReplayStore((s) => s.look);
  const set = (p: Partial<TacticalLook>) => useReplayStore.getState().setLook(p);
  return (
    <Section title={t('replay.look.title')} defaultOpen={look.on}>
      <Check label={t('replay.look.on')} checked={look.on} onChange={(on) => set({ on })} title={t('replay.look.onTitle')} />
      {look.on && (
        <>
          <div className="field">
            <div className="label">
              <span>{t('replay.look.quality')}</span>
            </div>
            <Segmented
              value={look.quality}
              options={LOOK_QUALITIES.map((q) => ({
                value: q,
                label: t(`replay.look.q.${q}`),
              }))}
              onChange={(quality) => set({ quality })}
            />
          </div>
          <div className="field">
            <div className="label">
              <span>{t('replay.look.colour')}</span>
            </div>
            <Segmented
              value={look.colour}
              options={LOOK_COLOURS.map((c) => ({
                value: c,
                label: t(`replay.look.c.${c}`),
              }))}
              onChange={(colour) => set({ colour })}
            />
          </div>
          {SWITCHES.map((k) => (
            <Check key={k} label={t(`replay.look.part.${k}`)} checked={look[k] as boolean} onChange={(v) => set({ [k]: v })} title={t(`replay.look.part.${k}Title`)} />
          ))}
        </>
      )}
    </Section>
  );
}
