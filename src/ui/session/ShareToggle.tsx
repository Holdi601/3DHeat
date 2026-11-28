/**
 * Shared or private, for one note, analysis, dashboard or chart: shared
 * (the default) everyone in a session has it and edits it live with you;
 * private it stays with you alone. One click either way.
 */

import { t, useLang } from '../../i18n';
import { useSessionStore } from '../../session/store';
import { Icon } from '../shell/Icon';

export function ShareToggle({ isPrivate, onChange, compact = false }: { isPrivate: boolean; onChange: (isPrivate: boolean) => void; compact?: boolean }) {
  useLang();
  const inSession = useSessionStore((s) => s.state === 'joined');
  const label = isPrivate ? t('session.item.private') : t('session.item.shared');
  const hint = isPrivate ? t('session.item.privateHint') : t(inSession ? 'session.item.sharedHint' : 'session.item.sharedLater');
  return (
    <span className={`share-toggle${isPrivate ? ' private' : ''}`} title={hint}>
      {!compact && (
        <span className="share-state">
          <Icon name={isPrivate ? 'eye' : 'people'} size={14} />
          {label}
        </span>
      )}
      <button
        type="button"
        className="small"
        data-share={isPrivate ? 'share' : 'keep'}
        onClick={() => onChange(!isPrivate)}
        aria-label={`${label}: ${isPrivate ? t('session.item.share') : t('session.item.keep')}`}
      >
        {isPrivate ? t('session.item.share') : t('session.item.keep')}
      </button>
    </span>
  );
}
