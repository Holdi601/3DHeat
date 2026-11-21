/**
 * Where the session server is, from the page's address: the page served by
 * `3dheat serve` is on it (`#join`, `#host=<token>`, `#invite=<token>`); a
 * page from elsewhere (the dev server) names it with `?session=<address>`.
 * The tokens are read once and taken out of the address bar, so a copied
 * address never carries them.
 */

import { t } from '../../i18n';

export interface UrlIntent {
  join: boolean;
  host: string;
  invite: string;
  server: string;
}

let intent: UrlIntent | null = null;

function read(): UrlIntent {
  if (intent) return intent;
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(location.search);
  const hex = (v: string | null) => (v && /^[0-9a-f]{32,128}$/i.test(v) ? v.toLowerCase() : '');
  intent = {
    join: hash.has('join') || hash.has('host') || hash.has('invite'),
    host: hex(hash.get('host')),
    invite: hex(hash.get('invite')),
    server: query.get('session') ?? '',
  };
  if (intent.host || intent.invite) history.replaceState(null, '', location.pathname + location.search);
  return intent;
}

export function urlIntent(): UrlIntent {
  return read();
}

/** The server field's first value: the one named in the address, else this page's own (blank). */
export function defaultServer(): string {
  return read().server;
}

export function serverHint(): string {
  return t('session.join.hint');
}
