/**
 * An external model, called straight from the browser: Anthropic's Messages
 * API, or any OpenAI-compatible chat endpoint (OpenAI, OpenRouter and other
 * hosts, a local Ollama, LM Studio or llama.cpp server). The answer streams
 * (server-sent events) into a callback and can be cancelled.
 *
 * The key is the user's: it goes in the request's header to the base URL the
 * user set and nowhere else - never logged, never in an error, never saved
 * here (`settings.ts` keeps it, in memory unless the user opts in).
 */

export type ProviderKind = 'anthropic' | 'openai';

export interface AiConfig {
  kind: ProviderKind;
  /** E.g. https://api.anthropic.com, https://api.openai.com/v1, http://localhost:11434/v1. */
  baseUrl: string;
  model: string;
  key: string;
}

export interface Preset {
  id: string;
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  /** Whether the endpoint wants a key (local servers usually do not). */
  key: boolean;
}

export const ANTHROPIC_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5'];

export const PRESETS: Preset[] = [
  { id: 'anthropic', kind: 'anthropic', baseUrl: 'https://api.anthropic.com', model: 'claude-opus-5-5', key: true },
  { id: 'openai', kind: 'openai', baseUrl: 'https://api.openai.com/v1', model: '', key: true },
  { id: 'openrouter', kind: 'openai', baseUrl: 'https://openrouter.ai/api/v1', model: '', key: true },
  { id: 'ollama', kind: 'openai', baseUrl: 'http://localhost:11434/v1', model: '', key: false },
  { id: 'lmstudio', kind: 'openai', baseUrl: 'http://localhost:1234/v1', model: '', key: false },
  { id: 'llamacpp', kind: 'openai', baseUrl: 'http://localhost:8080/v1', model: '', key: false },
  { id: 'custom', kind: 'openai', baseUrl: '', model: '', key: false },
];

export type AiErrorCode = 'config' | 'network' | 'cors' | 'mixed' | 'auth' | 'notFound' | 'rate' | 'http' | 'refusal' | 'empty' | 'stream';

/** A failure said by its code (`insights.ai.err.<code>`) with the values its message needs. */
export class AiError extends Error {
  constructor(
    readonly code: AiErrorCode,
    readonly values: Record<string, string> = {},
  ) {
    super(code);
    this.name = 'AiError';
  }
}

const trimSlash = (u: string) => u.trim().replace(/\/+$/, '');
/** Anthropic's paths start at /v1; a base URL given with it is taken as it is. */
const anthropicBase = (u: string) => trimSlash(u).replace(/\/v1$/, '');

/** A host on this computer or the local network: where a "no answer" is most often CORS or a server not started. */
export function isLocalUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return /^(localhost|127\.|0\.0\.0\.0|\[?::1\]?$|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || h.endsWith('.local');
  } catch {
    return false;
  }
}

function headers(cfg: AiConfig): Record<string, string> {
  const h: Record<string, string> = { 'content-type': 'application/json' };
  if (cfg.kind === 'anthropic') {
    h['anthropic-version'] = '2026-10-21';
    // The browser calls the API itself, with the user's own key.
    h['anthropic-dangerous-direct-browser-access'] = 'true';
    // A refusal is answered again by the model the API picks (`fallbacks: "default"` below).
    if (ANTHROPIC_MODELS.includes(cfg.model)) h['anthropic-beta'] = 'server-side-fallback-2026-07-01';
    if (cfg.key) h['x-api-key'] = cfg.key;
  } else if (cfg.key) {
    h.authorization = `Bearer ${cfg.key}`;
  }
  return h;
}

/** fetch, with the failures a browser gives turned into ones a user can act on. */
async function call(cfg: AiConfig, url: string, init: RequestInit): Promise<Response> {
  if (typeof location !== 'undefined' && location.protocol === 'https:' && url.startsWith('http:') && !isLocalUrl(url)) {
    throw new AiError('mixed', { url });
  }
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: headers(cfg) });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    const origin = typeof location !== 'undefined' ? location.origin : '';
    throw new AiError(isLocalUrl(url) ? 'cors' : 'network', { url: trimSlash(url.replace(/[?#].*$/, '')), origin });
  }
  if (!res.ok) {
    const status = String(res.status);
    let detail = '';
    try {
      const body = await res.text();
      const j = JSON.parse(body) as { error?: { message?: string } | string; message?: string };
      detail = (typeof j.error === 'string' ? j.error : j.error?.message) ?? j.message ?? body;
    } catch {
      /* no body to tell */
    }
    detail = detail.replace(/\s+/g, ' ').slice(0, 300);
    if (res.status === 401 || res.status === 403) throw new AiError('auth', { status, detail });
    if (res.status === 404) throw new AiError('notFound', { status, detail });
    if (res.status === 429 || res.status === 402 || res.status === 529) throw new AiError('rate', { status, detail });
    throw new AiError('http', { status, detail: detail || res.statusText });
  }
  return res;
}

/** Server-sent events off a response body: each event's name and its joined data lines. */
export async function* sseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<{ event: string; data: string }> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  const parse = function* (block: string) {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith(':')) continue;
      const c = line.indexOf(':');
      const field = c < 0 ? line : line.slice(0, c);
      const value = c < 0 ? '' : line.slice(c + 1).replace(/^ /, '');
      if (field === 'event') event = value;
      else if (field === 'data') data.push(value);
    }
    if (data.length) yield { event, data: data.join('\n') };
  };
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let m: RegExpExecArray | null;
      while ((m = /\r?\n\r?\n/.exec(buf))) {
        const block = buf.slice(0, m.index);
        buf = buf.slice(m.index + m[0].length);
        yield* parse(block);
      }
    }
    buf += dec.decode();
    if (buf.trim()) yield* parse(buf);
  } finally {
    reader.releaseLock();
  }
}

export interface ChatPrompt {
  system: string;
  user: string;
  /** The answer's ceiling in tokens. */
  maxTokens?: number;
}

/** Ask the model; each piece of the answer to `onText` as it arrives. Resolves to the whole answer. */
export async function streamChat(cfg: AiConfig, prompt: ChatPrompt, onText: (piece: string) => void, signal?: AbortSignal): Promise<string> {
  if (!cfg.baseUrl.trim() || !cfg.model.trim()) throw new AiError('config');
  const anthropic = cfg.kind === 'anthropic';
  const url = anthropic ? `${anthropicBase(cfg.baseUrl)}/v1/messages` : `${trimSlash(cfg.baseUrl)}/chat/completions`;
  const body = anthropic
    ? {
        model: cfg.model,
        max_tokens: prompt.maxTokens ?? 16000,
        stream: true,
        // A short summary: the lowest effort says it well and soonest.
        output_config: { effort: 'low' },
        ...(ANTHROPIC_MODELS.includes(cfg.model) ? { fallbacks: 'default' } : {}),
        system: prompt.system,
        messages: [{ role: 'user', content: prompt.user }],
      }
    : {
        model: cfg.model,
        stream: true,
        max_tokens: prompt.maxTokens ?? 16000,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
      };
  const res = await call(cfg, url, { method: 'POST', body: JSON.stringify(body), signal });
  if (!res.body) throw new AiError('empty');
  let text = '';
  const add = (s: unknown) => {
    if (typeof s === 'string' && s) {
      text += s;
      onText(s);
    }
  };
  for await (const { event, data } of sseEvents(res.body)) {
    if (data === '[DONE]') break;
    let j: Record<string, unknown>;
    try {
      j = JSON.parse(data);
    } catch {
      continue;
    }
    if (anthropic) {
      const type = (j.type as string) ?? event;
      if (type === 'content_block_delta') {
        const d = j.delta as { type?: string; text?: string };
        if (d?.type === 'text_delta') add(d.text);
      } else if (type === 'message_delta') {
        if ((j.delta as { stop_reason?: string })?.stop_reason === 'refusal') throw new AiError('refusal');
      } else if (type === 'error') {
        throw new AiError('stream', { detail: String((j.error as { message?: string })?.message ?? '') });
      }
    } else {
      if (j.error) throw new AiError('stream', { detail: String((j.error as { message?: string })?.message ?? j.error) });
      const choice = (j.choices as { delta?: { content?: string }; finish_reason?: string }[] | undefined)?.[0];
      add(choice?.delta?.content);
      if (choice?.finish_reason === 'content_filter') throw new AiError('refusal');
    }
  }
  if (!text.trim()) throw new AiError('empty');
  return text;
}

/** The endpoint's models, where it lists them (`GET /models`); Anthropic's own list for Anthropic when it does not answer. */
export async function listModels(cfg: AiConfig, signal?: AbortSignal): Promise<string[]> {
  if (!cfg.baseUrl.trim()) throw new AiError('config');
  const anthropic = cfg.kind === 'anthropic';
  const url = anthropic ? `${anthropicBase(cfg.baseUrl)}/v1/models?limit=100` : `${trimSlash(cfg.baseUrl)}/models`;
  const res = await call(cfg, url, { method: 'GET', signal });
  const j = (await res.json()) as { data?: { id?: string }[]; models?: { name?: string; model?: string }[] };
  const ids = (j.data ?? []).map((m) => m.id).concat((j.models ?? []).map((m) => m.model ?? m.name));
  return [...new Set(ids.filter((x): x is string => typeof x === 'string' && !!x))].sort();
}
