/** The session's button in the side panel's top row: opens the panel, shows the connection's state. */

import { t, useLang } from '../../i18n';
import { useSessionStore } from '../../session/store';
import { Icon } from '../shell/Icon';

export function SessionButton() {
  useLang();
  const state = useSessionStore((s) => s.state);
  const panel = useSessionStore((s) => s.panel);
  const waiting = useSessionStore((s) => s.waiting.length);
  const looks = useSessionStore((s) => s.looks.length);
  const label = `${t('session.title')}: ${t(`session.state.${state}`)}`;
  return (
    <button
      type="button"
      className={`ghost icon-btn session-btn ${state}${panel ? ' on' : ''}`}
      aria-expanded={panel}
      aria-label={label}
      title={label}
      onClick={() => useSessionStore.getState().setPanel(!panel)}
    >
      <Icon name="people" />
      {state !== 'off' && <span className="session-btn-dot" aria-hidden="true" />}
      {waiting + looks > 0 && <span className="session-btn-count">{waiting + looks}</span>}
    </button>
  );
}
