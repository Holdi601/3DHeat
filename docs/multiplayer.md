---
title: Multiplayer sessions
nav_order: 90
---

# Multiplayer sessions

Look at the same data together, each with your own camera, filters and modes; point the others at what you found; plan on one shared tactics board; set notes and draw on the scene. One person hosts, the others join from a browser.

A session has a **host**: the session server runs on the host's machine and decides everything - who is in, who may do what, the order of every change. Each member's viewer renders the data itself, on its own GPU; what travels is small: where each camera is, the changes to the shared layers, and requests.

## Host from the browser version: `3dheat serve`

The session server is one program, `3dheat` (from `native/crates/session`, built with `cargo build --release`). It serves the viewer itself, so the others need nothing but a browser.

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
| `--max-clients N`, `--max-per-addr N` | Connections at most: 32, and 3 from one address. |
| `--publish FILE` | Makes a file fetchable by the members, by its content hash; the first is announced as the session's data. |
| `--cert FILE --key FILE` | A real certificate (PEM), e.g. from Let's Encrypt, instead of the self-signed one. |
| `--plain-http` | No TLS, on this machine only (`127.0.0.1`), for trying it out. |
| `--allow-origin ORIGIN` | Also accept a viewer from this origin (a development server). |
| `--state-dir DIR` | Where the certificate and published files are kept. |
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

What is in place now:

- **Local network only, by default.** The server answers only this machine and private, link-local and carrier-grade NAT addresses (the last for Tailscale). Anything else gets *403*.
- **TLS** with a kept self-signed certificate on the local network, or your own certificate; plain HTTP only on this machine.
- **Passwords** are kept only as an argon2id hash (64 MiB, 3 passes); at most two are checked at once. Five wrong passwords from one address (an IPv6 /64 counts as one) lock it out for 15 minutes, twice as long each time it happens again; many failures across addresses slow every login down and tell the host.
- **Tokens**: the host's, resume and invite tokens are 256 random bits, compared in constant time; the host's travels only in the address's fragment and is taken out of the address bar at once.
- **Every message checked**, on the server, before anything is done with it: at most 64 KiB before decoding, then its shape, then its values (finite coordinates inside the world, names and notes normalised and stripped of control and direction-override characters, no `__proto__`-style keys, bounded depth and length), then the sender's role, mute and limits. Each kind of action has its own budget; a client that floods is cut off; one that falls 8 MB behind is too, and a slow one only ever loses presence frames, never changes.
- **The browser page**: a strict content security policy (scripts only from the server itself, no frames, no plugins), `nosniff`, no referrer, the WebSocket only from the server's own origin. Names, notes and labels are always shown as text.
- **No file access**: members can fetch only files the host published, by content hash; there are no paths.

**The internet.** `--expose-internet` makes the server answer any address (TLS required). It is off by default, and the viewer shows a warning while it is on: the server is **not hardened for the internet yet**. That is Stage 3 - the gateway as its own sandboxed process, fuzzing in CI, a full pentest - and Stage 4 brings tunnels (no open port, no visible IP), the full asset sharing with consent and fingerprints. Until then, prefer the local network or a VPN such as Tailscale; if you open a port anyway, use a long password, invite links and the waiting room, and stop the server when the session ends.

## For developers

- Protocol: [`native/proto/heat3d/session/v1/session.proto`](https://github.com/Holdi601/3DHeat/blob/main/native/proto/heat3d/session/v1/session.proto) (prost on the server, protobuf-es in the viewer: `npm run proto:session` regenerates `src/session/proto/`).
- Server: [`native/crates/session`](https://github.com/Holdi601/3DHeat/tree/main/native/crates/session): `session.rs` is every rule as pure logic, `server.rs` the network. `cargo test` runs the role matrix, limits, ordering and catch-up tests; `cargo +nightly fuzz run client_msg` (in `fuzz/`) fuzzes message handling.
- Viewer: [`src/session`](https://github.com/Holdi601/3DHeat/tree/main/src/session): `client.ts` the connection, `shared.ts` the shared layers (`registerSharedDoc` adds one), `sessionFile.ts` the session file.
- `node tools/smoke-session.mjs` starts a server and 2 to 20 headless viewers, and tries every action in every role.
