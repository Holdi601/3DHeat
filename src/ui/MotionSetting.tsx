/** Animations and visual extras: Auto (off while the frame rate is low), Always on, Always off (`motion.ts`). */

import { t, useLang } from '../i18n';
import { Segmented } from './controls';
import { useMotion, type MotionSetting as Setting } from './motion';

export function MotionSetting() {
  useLang();
  const setting = useMotion((s) => s.setting);
  const degraded = useMotion((s) => s.degraded);
  const reduced = useMotion((s) => s.reduced);
  return (
    <div className="row" title={t('motion.title')}>
      <span>{t('motion.label')}</span>
      <Segmented<Setting>
        value={setting}
        onChange={(v) => useMotion.getState().setSetting(v)}
        options={[
          { value: 'auto', label: t('motion.auto'), title: t('motion.autoTitle') },
          { value: 'on', label: t('motion.on') },
          { value: 'off', label: t('motion.off') },
        ]}
      />
      {reduced ? <span className="hint">{t('motion.reduced')}</span> : setting === 'auto' && degraded ? <span className="hint">{t('motion.paused')}</span> : null}
    </div>
  );
}
