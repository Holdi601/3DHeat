/**
 * The shell's shared pieces drawn from the design tokens: a toast (a short
 * message that goes by itself), a dialog, and a confirm that asks in the
 * viewer's own dialog rather than the browser's. Each host is mounted once,
 * in App.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { create } from 'zustand';
import { t } from '../../i18n';
import { Icon } from './Icon';
import { noteError } from '../../usage/hooks';

// ---------------------------------------------------------------- toast

interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'good' | 'bad';
}

const useToasts = create<{ list: Toast[] }>(() => ({ list: [] }));
let nextId = 1;

/** Says `text` for a moment at the bottom of the view. */
export function toast(text: string, kind: Toast['kind'] = 'info', ms = 2200): void {
  const id = nextId++;
  // A failure said to the user: the usage statistics blame what was used just before (never the words).
  if (kind === 'bad') noteError('error', 'err:toast');
  useToasts.setState((s) => ({ list: [...s.list.slice(-2), { id, text, kind }] }));
  window.setTimeout(() => useToasts.setState((s) => ({ list: s.list.filter((x) => x.id !== id) })), ms);
}

export function ToastHost() {
  const list = useToasts((s) => s.list);
  if (!list.length) return null;
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {list.map((x) => (
        <div key={x.id} className={`toast ${x.kind}`}>
          {x.text}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- dialog

/**
 * A modal dialog: the page behind dimmed, the focus moved in and kept there,
 * `Esc` and the close button and a click outside all close it.
 */
export function Dialog({
  title,
  onClose,
  children,
  className,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const first = box.current?.querySelector<HTMLElement>('[autofocus], input, button, [tabindex="0"]');
    first?.focus();
    return () => before?.focus?.();
  }, []);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    } else if (e.key === 'Tab' && box.current) {
      // The focus stays inside.
      const all = [...box.current.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex="0"]')].filter(
        (el) => !el.hasAttribute('disabled'),
      );
      if (!all.length) return;
      const i = all.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? all.length - 1 : i - 1) : i === all.length - 1 ? 0 : i + 1;
      e.preventDefault();
      all[next].focus();
    }
  };
  return (
    <div className="dialog-scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={box}
        className={`dialog${wide ? ' wide' : ''}${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={onKey}
      >
        <div className="dialog-head">
          <h2>{title}</h2>
          <button type="button" className="ghost icon-btn" aria-label={t('shell.close')} title={t('shell.close')} onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- confirm

interface Ask {
  text: string;
  ok: string;
  resolve: (v: boolean) => void;
}

const useAsk = create<{ ask: Ask | null }>(() => ({ ask: null }));

/** Asks a yes/no question in the viewer's dialog; resolves true for yes. */
export function confirmDialog(text: string, ok?: string): Promise<boolean> {
  return new Promise((resolve) => {
    useAsk.getState().ask?.resolve(false);
    useAsk.setState({ ask: { text, ok: ok ?? t('shell.confirm.ok'), resolve } });
  });
}

/** Answers the question being asked, if any (a test, or a key that stands for a button); true when there was one. */
export function answerConfirm(yes: boolean): boolean {
  const ask = useAsk.getState().ask;
  if (!ask) return false;
  useAsk.setState({ ask: null });
  ask.resolve(yes);
  return true;
}

export function ConfirmHost() {
  const ask = useAsk((s) => s.ask);
  if (!ask) return null;
  const done = (v: boolean) => {
    useAsk.setState({ ask: null });
    ask.resolve(v);
  };
  return (
    <Dialog title={t('shell.confirm.title')} onClose={() => done(false)} className="confirm">
      <p className="confirm-text">{ask.text}</p>
      <div className="dialog-actions">
        <button type="button" onClick={() => done(false)}>
          {t('shell.confirm.cancel')}
        </button>
        <button type="button" className="primary" autoFocus onClick={() => done(true)}>
          {ask.ok}
        </button>
      </div>
    </Dialog>
  );
}
