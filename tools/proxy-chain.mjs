/**
 * A reverse proxy for tests, on this machine only: what a public session's
 * proxy does in front of `3dheat serve`, in a few lines of Node - the
 * client's address written into `X-Real-IP` and `X-Forwarded-For`
 * (overwriting whatever the client sent), `CF-Connecting-IP` and
 * `Forwarded` dropped, the host's own endpoints refused, WebSockets passed
 * through. Each loopback address it listens on stands for one client on the
 * internet: a connection to 127.0.0.N is forwarded as from 198.18.0.N (the
 * benchmarking range), so several "clients" can be told apart on one machine.
 *
 *   node tools/proxy-chain.mjs --upstream http://127.0.0.1:5295 --port 5296 [--hosts 1-8]
 *
 * or `import { startProxy } from './proxy-chain.mjs'` (tools/smoke-session.mjs --proxy).
 */
import { createServer, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { connect as netConnect } from 'node:net';
import { connect as tlsConnect } from 'node:tls';

const HOP = new Set(['connection', 'keep-alive', 'proxy-connection', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'x-real-ip', 'x-forwarded-for', 'x-forwarded-proto', 'cf-connecting-ip', 'forwarded']);
const HOST_ONLY = /^\/(api\/(publish|load|docs)|__heat3d\/)/;

/** 127.0.0.N -> 198.18.0.N: the client a loopback address stands for. */
export function clientFor(local) {
  const m = /(?:^|:)127\.0\.0\.(\d+)$/.exec(local ?? '');
  return m ? `198.18.0.${m[1]}` : '198.18.255.254';
}

function forwardHeaders(req, client) {
  const out = {};
  for (const [k, v] of Object.entries(req.headers)) if (!HOP.has(k)) out[k] = v;
  out['x-real-ip'] = client;
  out['x-forwarded-for'] = client;
  out['x-forwarded-proto'] = 'https';
  return out;
}

/**
 * Starts the proxy on `port` at each of `hosts` (loopback addresses) in front of `upstream`
 * (http or https; a self-signed upstream is accepted). Resolves to `{ close() }`.
 */
export async function startProxy({ upstream, port, hosts = ['127.0.0.1'] }) {
  const up = new URL(upstream);
  const tls = up.protocol === 'https:';
  const upPort = Number(up.port || (tls ? 443 : 80));
  const servers = [];
  for (const host of hosts) {
    const server = createServer((req, res) => {
      if (HOST_ONLY.test(req.url ?? '')) {
        res.writeHead(403).end();
        return;
      }
      const client = clientFor(req.socket.localAddress);
      const opts = { host: up.hostname, port: upPort, method: req.method, path: req.url, headers: { ...forwardHeaders(req, client), connection: 'close' }, rejectUnauthorized: false, servername: 'localhost' };
      const p = (tls ? httpsRequest : httpRequest)(opts, (r) => {
        res.writeHead(r.statusCode ?? 502, r.headers);
        r.pipe(res);
      });
      p.on('error', () => {
        if (!res.headersSent) res.writeHead(502);
        res.end();
      });
      req.pipe(p);
    });
    server.on('upgrade', (req, socket, head) => {
      if (HOST_ONLY.test(req.url ?? '')) {
        socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
        return;
      }
      const client = clientFor(socket.localAddress);
      const h = forwardHeaders(req, client);
      h.connection = 'Upgrade';
      h.upgrade = req.headers.upgrade ?? 'websocket';
      const lines = [`${req.method} ${req.url} HTTP/1.1`, ...Object.entries(h).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => `${k}: ${x}`) : [`${k}: ${v}`])), '', ''];
      const u = tls ? tlsConnect({ host: up.hostname, port: upPort, rejectUnauthorized: false, servername: 'localhost' }) : netConnect({ host: up.hostname, port: upPort });
      u.on(tls ? 'secureConnect' : 'connect', () => {
        u.write(lines.join('\r\n'));
        if (head?.length) u.write(head);
        u.pipe(socket);
        socket.pipe(u);
      });
      const end = () => {
        u.destroy();
        socket.destroy();
      };
      u.on('error', end);
      socket.on('error', end);
      u.on('close', end);
      socket.on('close', end);
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, host, resolve);
    });
    servers.push(server);
  }
  return {
    close: () => Promise.all(servers.map((s) => new Promise((r) => { s.closeAllConnections?.(); s.close(() => r()); }))),
  };
}

if (process.argv[1]?.endsWith('proxy-chain.mjs')) {
  const arg = (name, dflt) => {
    const i = process.argv.indexOf(name);
    return i > 0 ? process.argv[i + 1] : dflt;
  };
  const upstream = arg('--upstream', 'http://127.0.0.1:5295');
  const port = Number(arg('--port', '5296'));
  const [a, b] = arg('--hosts', '1-1').split('-').map(Number);
  const hosts = Array.from({ length: (b || a) - a + 1 }, (_, i) => `127.0.0.${a + i}`);
  await startProxy({ upstream, port, hosts });
  console.log(`proxy on ${hosts.join(', ')}:${port} -> ${upstream}`);
}
