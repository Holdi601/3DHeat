/**
 * The key sheet (`?`): every key from ui/shell/shortcuts.ts, grouped by where
 * it works, the current workspace's groups first.
 */

import { t, useLang } from '../../i18n';
import { useHelpStore } from '../../state/helpStore';
import { useRaceStore } from '../../state/raceStore';
import { Dialog } from './kit';
import { SCOPES, SHORTCUTS, type ShortcutScope } from './shortcuts';
import { useShell } from './shellStore';

/** The groups that apply on a workspace, in the order they matter there. */
function scopesFor(tab: string): ShortcutScope[] {
  const first: ShortcutScope[] =
    tab === 'race'
      ? ['shell', 'race', 'camera']
      : tab === 'plan'
        ? ['shell', 'tactics', 'camera']
        : tab === 'match'
          ? ['shell', 'view', 'replay', 'camera']
          : ['shell', 'view', 'camera'];
  return [...first, ...SCOPES.filter((s) => !first.includes(s))];
}

export function ShortcutSheet() {
  useLang();
  const open = useShell((s) => s.sheet);
  const tab = useRaceStore((s) => s.tab);
  if (!open) return null;
  const close = () => useShell.getState().setSheet(false);
  return (
    <Dialog title={t('shell.sheet.title')} onClose={close} className="key-sheet" wide>
      <p className="hint">{t('shell.sheet.hint')}</p>
      <div className="key-sheet-grid">
        {scopesFor(tab).map((scope) => (
          <section key={scope} className="key-group">
            <h3>{t(`shell.scope.${scope}`)}</h3>
            <dl>
              {SHORTCUTS.filter((s) => s.scope === scope).map((s) => (
                <div key={s.id} className="key-row" data-key={s.id}>
                  <dt>
                    {s.keys.map((combo, i) => (
                      <span key={i} className="combo">
                        {combo.map((cap, j) => (
                          <kbd key={j}>{cap}</kbd>
                        ))}
                      </span>
                    ))}
                  </dt>
                  <dd>{t(s.label)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <div className="dialog-actions">
        <button
          type="button"
          onClick={() => {
            close();
            if (!useHelpStore.getState().on) useHelpStore.getState().toggle();
          }}
        >
          {t('shell.cmd.help')} <kbd>F1</kbd>
        </button>
        <button type="button" className="primary" onClick={() => (close(), useShell.getState().setPalette(true))}>
          {t('shell.palette.button')} <kbd>Ctrl K</kbd>
        </button>
      </div>
    </Dialog>
  );
}
