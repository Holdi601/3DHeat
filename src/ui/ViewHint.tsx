import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { Rich } from './controls';
import { t, useLang } from '../i18n';
import { viewHasKeys } from './viewKeys';

/**
 * The key hint under the view, which says whether the view has the keys.
 *
 * Its letters act only while it has the focus (ui/viewKeys.ts), so the line
 * says "click the view" until it does, and what the keys and the wheel do once
 * it has.
 */
export function ViewHint() {
  useLang();
  const zoom = useStore((s) => s.camera.wheel !== 'speed');
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    // A focus change has settled by the next task; the events fire before it has.
    const check = () => window.setTimeout(() => setFocused(viewHasKeys()), 0);
    check();
    window.addEventListener('focusin', check);
    window.addEventListener('focusout', check);
    return () => {
      window.removeEventListener('focusin', check);
      window.removeEventListener('focusout', check);
    };
  }, []);
  const text = !focused ? t('shell.hint.click') : zoom ? t('shell.hint.zoom') : t('shell.hint');
  return (
    <div className={`help${focused ? ' has-keys' : ''}`} data-testid="view-hint">
      <Rich text={text} />
    </div>
  );
}
