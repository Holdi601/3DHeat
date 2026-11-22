/**
 * Settings > Native viewport (preview): the native app draws the heat with its
 * own renderer under the page (Stage 5, src/render/native/nativeRenderer.ts).
 * Off by default until its pictures match the web engine's; the choice applies
 * when the window loads again. In a browser it renders nothing.
 */
import { useState } from 'react';
import { t, useLang } from '../i18n';
import { useStore } from '../state/store';
import { NATIVE_VIEWPORT_KEY, setNativeViewport } from '../render/native/nativeRenderer';
import { inApp } from '../appHost';

function stored(): boolean {
  try {
    return globalThis.localStorage?.getItem(NATIVE_VIEWPORT_KEY) === 'on';
  } catch {
    return false;
  }
}

export function NativeViewportSettingsRow() {
  useLang();
  const backend = useStore((s) => s.stats.backend);
  const [on, setOn] = useState(stored);
  if (!inApp()) return null;
  const running = backend === 'native';
  return (
    <div className="settings-row app-update-row">
      <label className="check" title={t('app.nativeViewport.hint')}>
        <input
          type="checkbox"
          checked={on}
          data-testid="native-viewport-setting"
          onChange={(e) => {
            setNativeViewport(e.target.checked);
            setOn(e.target.checked);
          }}
        />
        {t('app.nativeViewport.setting')}
      </label>
      {on !== running && (
        <button type="button" onClick={() => globalThis.location.reload()}>
          {t('app.nativeViewport.reload')}
        </button>
      )}
      {running && <span className="hint">{t('app.nativeViewport.active')}</span>}
    </div>
  );
}
