/**
 * The quick bar over the view: the actions used most, one click each, with
 * their keys in the tooltips - play, frame the data, look from above, save
 * the view, the ruler, the side panel and the command palette - and, while a
 * unit is followed, the unit with the way out next to it. Re-renders only
 * when what it shows changes (play state, follow, side panel), never per frame.
 */

import { t, useLang } from '../../i18n';
import { usePlanStore } from '../../state/planStore';
import { useRaceStore } from '../../state/raceStore';
import { useReplayStore } from '../../state/replayStore';
import { useStore } from '../../state/store';
import { useEngine } from '../EngineContext';
import { clearLook } from '../replay/pair';
import { clickControl, saveViewNow, togglePlay } from './commands';
import { Icon, type IconName } from './Icon';
import { comboText, shortcut } from './shortcuts';
import { useShell } from './shellStore';

function QuickButton({
  icon,
  label,
  keyId,
  onClick,
  on,
  disabled,
}: {
  icon: IconName;
  label: string;
  keyId?: string;
  onClick: () => void;
  on?: boolean;
  disabled?: boolean;
}) {
  const s = keyId ? shortcut(keyId) : undefined;
  const title = s ? `${label} (${s.keys.map(comboText).join(' / ')})` : label;
  return (
    <button type="button" className={`quick-btn${on ? ' on' : ''}`} aria-label={label} aria-pressed={on} data-tip={title} onClick={onClick} disabled={disabled}>
      <Icon name={icon} size={16} />
    </button>
  );
}

export function QuickBar() {
  useLang();
  const engine = useEngine();
  const tab = useRaceStore((s) => s.tab);
  const timelinePlaying = useStore((s) => s.timeline.playing);
  const racePlaying = useRaceStore((s) => s.replay.playing);
  const boardPlaying = usePlanStore((s) => s.playing);
  const hasData = useStore((s) => !!s.dataset || !!s.level);
  const follow = useReplayStore((s) => s.follow);
  const followName = useStore((s) => (follow !== null ? (s.dataset?.personLabels[follow] ?? null) : null));
  const sidebarHidden = useShell((s) => s.sidebarHidden);
  if (tab === 'vehicle') return null;
  const playing = tab === 'race' ? racePlaying : tab === 'plan' ? boardPlaying : timelinePlaying;
  const heatLike = tab === 'heat' || tab === 'match';
  return (
    <div className="quick-bar" role="toolbar" aria-label={t('shell.quick.bar')}>
      <QuickButton icon={playing ? 'pause' : 'play'} label={t('shell.cmd.play')} keyId="play" on={playing} onClick={togglePlay} />
      <QuickButton icon="frame" label={t('shell.cmd.frame')} keyId="frame" onClick={() => engine?.frameDataset()} disabled={!hasData} />
      <QuickButton icon="above" label={t('shell.quick.above')} onClick={() => engine?.applyPreset('Top')} disabled={!hasData} />
      {heatLike && (
        <>
          <span className="quick-sep" />
          <QuickButton icon="bookmark" label={t('shell.cmd.saveView')} onClick={() => saveViewNow(engine)} disabled={!engine} />
          {tab === 'heat' && (
            <QuickButton
              icon="ruler"
              label={t('shell.quick.ruler')}
              onClick={() => void clickControl({ tab: 'heat', path: ['heat.measurePanel.title'], label: 'heat.measurePanel.active' })}
            />
          )}
        </>
      )}
      <span className="quick-sep" />
      <QuickButton
        icon="panel"
        label={sidebarHidden ? t('shell.cmd.sidebarShow') : t('shell.cmd.sidebarHide')}
        keyId="sidebar"
        on={!sidebarHidden}
        onClick={() => useShell.getState().setSidebarHidden(!sidebarHidden)}
      />
      <QuickButton icon="search" label={t('shell.palette.title')} keyId="palette" onClick={() => useShell.getState().setPalette(true)} />
      <QuickButton icon="keyboard" label={t('shell.cmd.sheet')} keyId="sheet" onClick={() => useShell.getState().setSheet(true)} />
      {heatLike && follow !== null && (
        <span className="quick-context">
          <span className="quick-context-label">{t('shell.quick.following', { name: followName ?? `#${follow}` })}</span>
          <button
            type="button"
            className="quick-btn wide"
            title={`${t('shell.quick.stopFollow')} (Esc)`}
            onClick={() => {
              if (!clearLook()) useReplayStore.getState().stopFollow();
            }}
          >
            <Icon name="close" size={14} /> {t('shell.quick.stopFollow')}
          </button>
        </span>
      )}
    </div>
  );
}
