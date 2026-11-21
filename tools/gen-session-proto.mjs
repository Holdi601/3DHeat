/**
 * Regenerates the viewer's session protocol types (src/session/proto/) from
 * native/proto/heat3d/session/v1/session.proto with protoc and protoc-gen-es. Needs `protoc` on PATH.
 *
 *   npm run proto:session
 */
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const repo = resolve(import.meta.dirname, '..');
const plugin = join(repo, 'node_modules', '.bin', process.platform === 'win32' ? 'protoc-gen-es.cmd' : 'protoc-gen-es');
execFileSync(
  'protoc',
  [`--plugin=protoc-gen-es=${plugin}`, '--es_out=src/session/proto', '--es_opt=target=ts,import_extension=none', '-I', 'native/proto', 'native/proto/heat3d/session/v1/session.proto'],
  { cwd: repo, stdio: 'inherit' },
);
console.log('src/session/proto/heat3d/session/v1/session_pb.ts written');
