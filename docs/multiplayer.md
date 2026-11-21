---
title: Multiplayer sessions
nav_order: 90
---

# Multiplayer sessions

Look at the same data together, each with your own camera, filters and modes; point the others at what you found; plan on one shared tactics board; set notes and draw on the scene. One person hosts, the others join from a browser.

A session has a **host**: the session server runs on the host's machine and decides everything - who is in, who may do what, the order of every change. Each member's viewer renders the data itself, on its own GPU; what travels is small: where each camera is, the changes to the shared layers, and requests.

## Host from the browser version: `3dheat serve`

The session server is one program, `3dheat` (built in `native/` with `cargo build --release -p heat3d-server`; the desktop app's `3dheat-app serve` is the same). It also answers the native core's data API at `/v1` ([The native app](native-app.md)). It serves the viewer itself, so the others need nothing but a browser.

1. Build the viewer once: `npm run build` (makes `dist/`).
2. Start the server next to it:

   ```
   3dheat serve --web dist --password-env HEAT3D_SESSION_PASSWORD
   ```

   It prints the **host address** (with a token after `#host=`: keep it to yourself), a **join address** for every network this machine is on, and the certificate's fingerprint.
3. Open the host address in your browser. You are in, as the host.
4. Send the join address to the others. They open it, type their name and the session password, and wait in the **waiting room** until you let them in (the session panel lists them under *Waiting*).

| Option | Meaning |
|---|---|
| `--port N` | The port (7878). |
| `--bind ADDR` | The address to listen on: all of this machine's (`0.0.0.0`) by default. |
| `--password-env VAR` / `--password-file FILE` | The session password (at least 12 characters), from an environment variable or a file - never on the command line, where other programs can read it. |
| `--no-waiting-room` | Members with the password join at once. Without a password there is always a waiting room. |
| `--max-clients N`, `--max-per-addr N` | Members at most: 32, and 3 from one address. |
| `--max-waiting N` | Clients in the waiting room at most (16). The host, invite links and members coming back still get in. |
| `--max-connections N` | TCP connections at most, all clients together (1024; 64 from one address). |
| `--publish FILE` | Makes a file fetchable by the members, by its content hash; the first is announced as the session's data. |
| `--cert FILE --key FILE` | A real certificate (PEM), e.g. from Let's Encrypt, instead of the self-signed one. |
| `--plain-http` | No TLS, on this machine only (`127.0.0.1`), for trying it out. |
| `--allow-origin ORIGIN` | Also accept a viewer from this origin (a development server). |
| `--state-dir DIR` | Where the certificate and published files are kept. |
| `--no-sandbox` | Run the network gateway inside the server's own process instead of a locked-down process of its own (for debugging; not with `--expose-internet`). |
| `--expose-internet` | Expert mode, see [Security](#security). |

**The certificate.** On the local network the server makes a self-signed certificate once and keeps it, so its fingerprint stays the same. A browser warns about it the first time: compare the fingerprint the server printed with the one the browser shows (the padlock, *Certificate*), then accept it. TLS matters beyond privacy: browsers give WebGPU only to secure pages, so without it the members would fall back to WebGL2.

## Host from the desktop app

The desktop app (in the making, Stage 2a) embeds the same server: `heat3d_session::server::start` with the same settings, the app's own window as the host's viewer, and the join address and fingerprint shown in the app to send to the others. Everything below is the same. Until the app ships, host with `3dheat serve`.

## Joining

Open the join address (or press the people button at the top of the side panel and type the server's address), give your name and the session password, and press **Join**. With an **invite link** (`…#invite=…`) there is no password and no waiting room: the link carries a role.

The button at the top of the side panel shows the connection: green connected, amber connecting or waiting, red disconnected. A dropped connection comes back by itself, with the same place in the session, and catches up on what it missed. Edits made while it was away are sent when it is back.

**Your own view.** Every member has their own camera, mode, filters and selection. What the session shares is listed below; nothing else changes on your screen because someone else changed theirs.

**Your data.** Each member loads the same data in their own viewer. When the host has published it (**Share your data** in the panel, after ticking that they may share it), the panel offers **Load the host's data**: the file is fetched from the host's server by its content hash and checked against it before it is used. Asset sharing with full consent and a block list (levels, the figure catalogue) comes in a later stage.

## What is shared

| Layer | Who changes it |
|---|---|
| **Presence**: each member's camera (a frustum with their name, in their colour) and pointer, in the same workspace | Everyone, by moving |
| **Marks**: notes set on the scene and freehand drawings (the panel's *Marks*, or the command palette) | Draw-only and up: their own; elevated and up: anyone's |
| **The tactics board**: figures, routes, tasks, layers, keyframes, notes, drawings | Elevated and up; draw-only: their own drawings and notes on it |
| **Data notes and analysis documents**, chart signs, and any other layer that registers itself | As for marks: draw-only and up their own, elevated and up anyone's |
| **Follow**: everyone follows one camera, or is locked to it | Admin and host |

Shared layers are changed by small operations - add this, set that field, delete that - which the host numbers in the order they arrive and sends to everyone. Where two members change the same field at the same moment, the one the host received last is kept, for both. A change the host refuses (the role does not allow it, the member is muted) disappears from the member's screen again.

**Look here.** *Ask everyone to look* sends your camera to the others with a note; each one decides to **Look** (their camera jumps to yours) or to dismiss it. *Ask everyone to follow me* asks them to follow your camera until they stop. At most three such requests a minute per member.

**Follow and lock.** An admin can have everyone follow a camera (members may stop following) or lock everyone to it (they cannot). A bar at the top says whom you follow.

## Roles

| | Host | Admin | Elevated | Draw only | Viewer |
|---|---|---|---|---|---|
| Own camera and filters, see the others | ✓ | ✓ | ✓ | ✓ | ✓ |
| Look here, follow me (3 a minute) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Own marks and drawings, erase them | ✓ | ✓ | ✓ | ✓ | — |
| Erase anyone's, edit the tactics board, set the session's data | ✓ | ✓ | ✓ | — | — |
| Follow / lock everyone's camera | ✓ | ✓ | — | — | — |
| Let in from the waiting room, invite links, mute, remove, ban, unban, give roles | ✓ | ✓ (up to elevated, never against admins or the host) | — | — | — |
| Password, waiting room, publish data, open a session file into the session | ✓ | — | — | — | — |

**Moderation.** Open a member's menu (**⋯**) in the panel: change the role, **mute** (no marks, no drawing, no requests; for 5 minutes, an hour, a day or for good), **remove** (they may knock again), **ban** (for a while or for good; lifted from the *Bans* list). A ban holds the member's browser key, name and address; anyone determined can come back under another name, which is why invite links and the waiting room are the reliable way to keep a session among the people meant to be in it.

## Saving and opening a session

**Save session** (in the panel, and in the command palette, Ctrl+K) writes one file, `name.3dheat-session`. It holds:

- every shared layer: marks and notes, the tactics board, and any other layer that registered itself, as their state;
- the saved views and the view on screen;
- the session's settings: the waiting room, follow, the invite links by who they were for and their role, the members' roles by name;
- the data and level it was made on, by name, size and fingerprint - not the data itself, unless **Pack the data in** is ticked (then the files follow the JSON in the same file, for handing the whole thing to someone).

Never in it: the password, any token, the ban list.

**Open session** works alone too: the layers come back on your board and in your view, and a report says what the file was made on that is not loaded here (which data files, which level), so you know what to load. The host opening a session file in a session replaces what everyone shares, and everyone sees the change. The host's viewer also keeps a copy every two minutes in the browser (**Restore the autosave** in the panel).

The file is JSON with `schema: heat3d.session/1`; a later version opens older files through its migrations.

## Security

The session server is built to be reached by people you did not choose: everything they send is checked before it is used, every resource they can claim has a limit, and the part that reads their bytes cannot touch your machine. `3dheat serve` was fuzzed and pentested before this was written (the gateway, its sandbox, limits, identity and content checks are described below).

### Two processes

`3dheat serve` is two processes:

- the **core**, with your rights: it listens on the port, keeps the files (the web build, what you published, uploads), the native core's data API, and the audit log;
- the **gateway**, with none: TLS, HTTP, the WebSocket, every limit and the session's rules - everything a stranger's bytes reach. It has no network of its own: the core accepts each connection and relays its bytes over a pipe, and serves the gateway's few requests for files on the same pipe, answering them as it would answer any member (published files by hash, the web build, never a file by path).

What the gateway gives up:

| System | The gateway runs as |
|---|---|
| Windows | an **AppContainer** without a single capability (no network at all, none of your files, folders or registry, read or write), in a **job** (one process: it cannot start programs; 2 GiB of memory; no clipboard, desktop or system settings; ended with the core), with the child-process policy (no process creation by any route) and mitigations (no dynamic code, no images from the network or of low integrity, strict handle checks), with an environment of its system folders only. Where no AppContainer can be made, a restricted token at low integrity instead (it could then still read what you can read). |
| Linux | `no_new_privs`, **Landlock** granting nothing (no file read, write or execute; on kernels 6.7 and later no TCP bind or connect), **seccomp** refusing sockets, `exec`, `ptrace`, namespaces, mounts, kernel modules and BPF, no core dumps, an empty environment, and the user `nobody` when started as root. |
| macOS and others | a separate process with an empty environment, nothing more yet. |

`3dheat sandbox-check` starts a gateway as `serve` does and has it try what someone who took it over would try: read and list your files, write there, connect to this machine, be reached on a port of its own, start a program. Each must say `blocked` (CI runs it on Windows and Linux). `3dheat serve` prints what is in force when it starts. If the gateway ends, the core starts a new one; the session then starts afresh (members come back through the waiting room or their invite links).

### Limits

| What | Limit |
|---|---|
| TCP connections | 1024 in all, 64 from one address (an IPv6 /64 counts as one); the core refuses the rest before a byte is read |
| TLS handshake, a request's head | 10 seconds each; a head is 16 KiB at most |
| A quiet connection | closed after 75 seconds; one whose client stops reading, after 30 seconds of no progress |
| HTTP requests | 400 at once, then 100 a second, from one address; then *429* |
| WebSocket upgrades | 20 at once, then one a second, from one address |
| Before the hello | 5 seconds; 8 such connections from one address, 256 in all; they hold no place in the session |
| Members, waiting room | 32 members (3 from one address), 16 waiting; the host always gets in |
| A message | 64 KiB, checked before decoding; no compression (no decompression bombs) |
| Per member | messages, bytes, batches, presence, look-here and follow (3 a minute), moderation and invites each have a budget; a flood is cut off; one that falls 8 MB behind is cut off; a slow one loses only presence frames |
| The shared layers | 1 MiB a second of operations for the whole session (every change goes to everyone), 64 MiB of documents in all, 16,000 characters per text, 512 operations per batch, 32 documents |
| Uploads | the host's only; 8 GiB each, two at a time; a session file 64 MiB |

### Identity, passwords and tokens

- **The browser's key.** Each browser makes an Ed25519 key pair once and keeps it in IndexedDB, its private half not extractable. Joining, the server sends a fresh challenge and the browser signs it: the server then knows the browser by its public key, not by anything the browser merely says. A member's own marks stay their own by it, a resume token works only from the browser that was given it (a copied token is useless), bans hold to it (and to the address and name), and an invite link used up still lets back in the browsers that joined with it. A browser without Ed25519 (or without IndexedDB) names a random key instead, which the server keeps apart (`u:...`) so it can never pass for a proven one.
- **Passwords** are kept only as an argon2id hash (64 MiB, 3 passes), never in the gateway's environment, and checked two at a time at most, one per address, eight waiting at most (a guess past that is turned away at once, so a flood of guesses cannot pile up work that outlasts it). Five wrong passwords from one address (an IPv6 /64 counts as one) lock it out for 15 minutes, twice as long each time it happens again; many failures across addresses slow every login down and tell the host. A wrong password, invite or host token all get the same answer.
- **Tokens** (the host's, resume and invite tokens) are 256 random bits, compared in constant time. Invite links expire (a day by default, a week at most) and are used up; a member's token changes when their role does; the host's travels only in the address's fragment and is taken out of the address bar at once.

### What members send

- **Checked on the server**, before anything is done with it: its size, then its shape, then its values (finite coordinates inside the world, names and notes normalised and stripped of control and direction-override characters, no `__proto__`-style keys, bounded depth and length), then the sender's role (each operation of a batch on its own: what the role may not do is dropped and said), mute and budgets.
- **Shown as text.** Names, notes and labels are never markup. Notes and analysis documents are Markdown, rendered by the viewer's own renderer, which escapes all HTML, allows links only to `http`, `https`, `mailto` and the viewer's own places, and renders 64 KiB at most; pictures in notes must be raster images. Exported and printed analyses carry their own content security policy.
- **The page** has a strict content security policy (scripts only from the server itself, no frames, no plugins, no inline script), `nosniff`, no referrer, `frame-ancestors 'none'`, and HSTS with a real certificate. The WebSocket opens only from the server's own origin (and the origins you allow), so another site's page cannot use a member's browser to talk to it.
- **Files** go out only if the host published them, by their SHA-256, as `application/octet-stream` and an attachment; there are no paths. The data API (`/v1`) answers members only, with a member's rights (never a file by path). The desktop app's own window server answers its window only. The local usage statistics (`/__heat3d/usage`, off unless switched on) answer the host's own browser only, by the host's token; a member's request never reaches them.

### The audit log

`audit.log` in the state folder (`--state-dir`) has one JSON line per join (how: host token, invite, password, admitted), failed login, lockout, role change, mute, kick, ban and unban, invite made and revoked, settings change (that the password changed, never the password), session file opened, file published, gateway restart, and once a minute how many connections and requests the limits refused. It never holds a password or a token. It does hold members' addresses: it stays on your machine, and the session never shows anyone another member's address.

### Supply chain and testing

`cargo-deny` and `cargo-audit` check the native workspace's dependencies (known vulnerabilities, sources, licences) and `npm audit` the viewer's, in CI (`.github/workflows/session-security.yml`), which also fuzzes every target for a minute on each change (`native/crates/session/fuzz`: every client message, structure-aware; the session file; the paths and assets through the gateway and the core; the channel between the two processes; and `tools/fuzz-markdown.mjs` for the Markdown renderer), and checks the sandbox on Windows and Linux. Lockfiles pin every version.

**The internet.** `--expose-internet` makes the server answer any address (TLS required); off by default, and the viewer shows a note while it is on. The server is **hardened** for it (see the security notes above). Still: your address is visible to everyone you invite, nothing in front of the server filters a flood that saturates your line, and anyone with the link can knock. Use a long password, invite links and the waiting room, and stop the server when the session ends. Stage 4 brings tunnels (no open port, no visible address).

## For developers

- Protocol: [`native/proto/heat3d/session/v1/session.proto`](https://github.com/Holdi601/3DHeat/blob/main/native/proto/heat3d/session/v1/session.proto) (prost on the server, protobuf-es in the viewer: `npm run proto:session` regenerates `src/session/proto/`).
- Server: [`native/crates/session`](https://github.com/Holdi601/3DHeat/tree/main/native/crates/session): `session.rs` is every rule as pure logic, `gateway.rs` the network side (TLS, HTTP, WebSocket, limits), `server.rs` the core (port, files, audit log, the gateway process), `ipc.rs` the channel between them; [`native/crates/sandbox`](https://github.com/Holdi601/3DHeat/tree/main/native/crates/sandbox) locks the gateway down. `cargo test` runs the role matrix, limits, ordering and catch-up tests; `cargo +nightly fuzz run <target>` (in `fuzz/`: `client_msg`, `client_structured`, `doc_json`, `asset_paths`, `ipc_frames`) fuzzes it; `examples/attack.rs` and `tools/pentest-dos.mjs` are the pentest's load and abuse tools.
- Viewer: [`src/session`](https://github.com/Holdi601/3DHeat/tree/main/src/session): `client.ts` the connection, `shared.ts` the shared layers (`registerSharedDoc` adds one), `sessionFile.ts` the session file.
- `node tools/smoke-session.mjs` starts a server and 2 to 20 headless viewers, and tries every action in every role.
