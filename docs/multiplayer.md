---
title: Multiplayer sessions
nav_order: 90
---

# Multiplayer sessions

Look at the same data together, each with your own camera, filters and modes; point the others at what you found; plan on one shared tactics board; set notes and draw on the scene. One person hosts, the others join from a browser.

A session has a **host**: the session server runs on the host's machine and decides everything - who is in, who may do what, the order of every change. Each member's viewer renders the data itself, on its own GPU; what travels is small: where each camera is, the changes to the shared layers, and requests.

## Host from the browser version: `3dheat serve`

**Without a terminal (Windows):** double-click `3dheat.exe` and answer **Yes** to "Host a 3DHeat session from this PC now?". The server starts, the host page opens in your browser, and a small window says where others join; its **Yes** opens the host page again, **No** stops the server. Anyone who opens the server's page on the same PC (it lost the host page, say) gets **Host this session** in the session panel instead of the join form: only a page on this PC, straight over loopback, with no proxy or tunnel in between, and never on a server started with `--expose-internet` (`--no-local-claim` turns it off).

In the session, **Invite people** (at the top of the panel) holds everything to let others in: a password for people without a link, an **invite link** to copy (for one person or more, valid for so many hours), the server's address on your network to copy, **Make session public** for people outside your network, and **Stop the server**.

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
| `--max-clients N` | Members at most. By default there is no fixed number: big teams join, bounded by the connection limit and each member's budgets. Set it to cap the session. |
| `--max-per-addr N`, `--max-members-per-addr N` | From one address: clients not let in yet (the waiting room) at most (3), and members once in by an invite link, the password or admitted (256, so a team behind one office or home address all get in). |
| `--max-waiting N` | Clients in the waiting room at most (64). The host, invite links and members coming back still get in. |
| `--max-connections N` | TCP connections at most, all clients together (4096; 256 from one address). |
| `--publish FILE` | Makes a file fetchable by the members, by its content hash; the first is announced as the session's data. |
| `--cert FILE --key FILE` | A real certificate (PEM), e.g. from Let's Encrypt, instead of the self-signed one. |
| `--plain-http` | No TLS, on this machine only (`127.0.0.1`), for trying it out. |
| `--allow-origin ORIGIN` | Also accept a viewer from this origin (a development server). |
| `--state-dir DIR` | Where the certificate and published files are kept. |
| `--no-sandbox` | Run the network gateway inside the server's own process instead of a locked-down process of its own (for debugging; not with `--expose-internet`). |
| `--expose-internet` | Expert mode: answer any address directly, see [Port forwarding](#port-forwarding-expert). |
| `--trusted-proxy ADDR` | A reverse proxy (an address or a network such as `10.0.0.0/8`; repeatable) whose `X-Forwarded-For` / `X-Real-IP` name the client. See [Who the client is](#who-the-client-is-trusted-proxies). |
| `--trust-cloudflared` | Believe `CF-Connecting-IP` from `cloudflared` on this machine (a tunnel you run yourself; the server's own tunnel does this by itself). |
| `--local-config FILE` | This machine's settings for going public and for sharing (default: `local.json` in the state folder). Never put it in a repository. |
| `--catalog DIR` | The catalogue folder whose items the host may share (default: the `HEAT3D_LEVELS` folder). |

**The certificate.** On the local network the server makes a self-signed certificate once and keeps it, so its fingerprint stays the same. A browser warns about it the first time: compare the fingerprint the server printed with the one the browser shows (the padlock, *Certificate*), then accept it. TLS matters beyond privacy: browsers give WebGPU only to secure pages, so without it the members would fall back to WebGL2.

## Host from the desktop app

The desktop app (in the making, Stage 2a) embeds the same server: `heat3d_session::server::start` with the same settings, the app's own window as the host's viewer, and the join address and fingerprint shown in the app to send to the others. Everything below is the same. Until the app ships, host with `3dheat serve`.

## Joining

Open the join address (or press the people button at the top of the side panel and type the server's address), give your name and the session password, and press **Join**. With an **invite link** (`…#invite=…`) there is no password and no waiting room: the link carries a role.

The button at the top of the side panel shows the connection: green connected, amber connecting or waiting, red disconnected. A dropped connection comes back by itself, with the same place in the session, and catches up on what it missed. Edits made while it was away are sent when it is back.

**Your own view.** Every member has their own camera, mode, filters and selection. What the session shares is listed below; nothing else changes on your screen because someone else changed theirs.

**Your data.** Each member loads the same data in their own viewer. When the host has published it (**Share your data** in the panel, after ticking that they may share it), the panel offers **Load the host's data**: the file is fetched from the host's server by its content hash and checked against it before it is used. Levels, the catalogue and packs travel the same way, by content hash, once the host shares them: see [Sharing assets](#sharing-assets).

## What is shared

| Layer | Who changes it |
|---|---|
| **Presence**: each member's camera (a frustum with their name, in their colour) and pointer, in the same workspace | Everyone, by moving |
| **The view** (for those who keep it in sync): the workspace, the mode, heat, difference and team settings, the figures, lines, filters, the slice, layers, the replay display, the race, match, tactics and vehicle views, and playback | Everyone (the host's changes are asked about) |
| **Marks**: notes set on the scene and freehand drawings (the panel's *Marks*, or the command palette) | Draw-only and up: their own; elevated and up: anyone's |
| **The tactics board**: figures, routes, tasks, layers, keyframes, notes, drawings | Elevated and up; draw-only: their own drawings and notes on it |
| **Data notes and analysis documents**, chart signs, BI dashboards, volumes, replay bookmarks, and any other layer that registers itself; each note, analysis, dashboard or chart is shared or private | As for marks: draw-only and up their own, elevated and up anyone's |
| **Follow me** for everyone (each member says yes or no) | Admin and host |

Shared layers are changed by small operations - add this, set that field, delete that - which the host numbers in the order they arrive and sends to everyone. Where two members change the same field at the same moment, the one the host received last is kept, for both. A change the host refuses (the role does not allow it, the member is muted) disappears from the member's screen again.

**The pointer.** Where your mouse points, the others see a point in the world: a ring lying on what the ray from your camera hits (the level's ground, a building, a unit's figure, else the floor of the action), a short stalk with your name, and a dashed line from your camera to it. A pointer left still fades out after a few seconds.

**Shared or private.** A note, a written analysis, a dashboard or a chart sign is shared by default: everyone in the session has it. **Keep to myself** beside it makes it private (only you have it; it leaves the others' screens), **Share** shares it again in one click. Several people can type in the same note or analysis at once: each edit travels as the place it was made and what it changed, and is laid onto the text as it is by then, so nobody's words are lost; the host keeps the server's copy up to date, so whoever joins later gets the merged text.

**View sync.** *Keep my view in sync with everyone* is on for everyone who joins (full sync: the view below, the host's camera, playback, marks and the pointer); turning it off is the one box at the top of the panel's *View sync*. While it is on, a change anyone makes to the mode, the settings, the filters or playback reaches everyone who keeps in sync, in every workspace (heatmap, difference, team, figure overlay, lines, race, match, tactics, vehicles). Joining (or turning it on) takes the session's view from the host. *Move my camera with the host's* (on with it) keeps you where the host is while you look around freely; stopping on the follow bar turns that box off, and you move your own camera again.

- When the **host** changes something, a card asks: **Apply too** (take it), **Ignore** (not this time) or **Ignore all from now on** (sync off). *Ask me before I take the host's changes* in the panel turns the question off.
- A change that went in says who made it, with **Back to my previous view**, also in the panel and the command palette: it puts your own view back for you alone.
- Turned off, your view is your own: other people's changes do not reach you and yours do not reach them.
- **Ask everyone to switch to my view** (or the host, or one member with the arrows button in their row) sends your whole view; each one switches or says no.
- Playback is shared in time: play, pause, seek, speed and direction travel with the server's clock, so a member whose message took 80 ms starts 80 ms further on, and while it plays the member who started it says the time every two seconds so a slow machine catches up. The race and tactics playbacks work the same way.
- Names, not numbers: a filter is sent by its values' names, a team by its label, a match by its name, as a saved view is, so the same data loaded on two machines means the same. Whatever arrives is checked against the viewer's own settings (only fields it has, of the same types, within sizes) before it goes in.

**Look where I look.** *Ask everyone to look where I look* sends your camera with a note; each one decides to **Look** (their camera jumps to yours) or to dismiss it. At most three such requests a minute per member.

**Follow me.** *Ask everyone to follow me* is a request too: each member answers **Follow** or **No thanks**, nobody is forced. While following, you are where they are but look around freely (drag); *Look where they look* takes their look again. **Stop following** or the **X** on the bar at the top ends it at once, and the same request is not asked again. *Let everyone go* stops everyone following you.

**See what they see.** The eye in a member's row shows their view for a while: their camera, their settings, and the name of their data if it is not yours; their changes keep coming while you look. **Back to my view** (on the bar at the top) brings your own view and camera back.

## Roles

| | Host | Admin | Elevated | Draw only | Viewer |
|---|---|---|---|---|---|
| Own camera and filters, see the others | ✓ | ✓ | ✓ | ✓ | ✓ |
| Look here, follow me, switch to my view (3 a minute) | ✓ | ✓ | ✓ | ✓ | ✓ |
| View sync, see a member's view | ✓ | ✓ | ✓ | ✓ | ✓ |
| Own marks and drawings, erase them | ✓ | ✓ | ✓ | ✓ | — |
| Erase anyone's, edit the tactics board, set the session's data | ✓ | ✓ | ✓ | — | — |
| Ask everyone to follow (for members joining later too) | ✓ | ✓ | — | — | — |
| Let in from the waiting room, invite links, mute, remove, ban, unban, give roles | ✓ | ✓ (up to elevated, never against admins or the host) | — | — | — |
| Password, waiting room, publish data, open a session file into the session | ✓ | — | — | — | — |

**Moderation.** Open a member's menu (**⋯**) in the panel: change the role, **mute** (no marks, no drawing, no requests; for 5 minutes, an hour, a day or for good), **remove** (they may knock again), **ban** (for a while or for good; lifted from the *Bans* list). A ban holds the member's browser key, name and address; anyone determined can come back under another name, which is why invite links and the waiting room are the reliable way to keep a session among the people meant to be in it.

## Saving and opening a session

A session file needs no server: it is your work as one file. **Save session** and **Open session…** are in the data panel (the **Load** tab of the sidebar), in this panel under **Session file** (apart from joining a server, below it), and in the command palette (Ctrl+K). **Save session** writes one file, `name.3dheat-session`. It holds:

- every shared layer: marks and notes, the tactics board, and any other layer that registered itself, as their state;
- the saved views and the view on screen;
- the session's settings: the waiting room, follow, the invite links by who they were for and their role, the members' roles by name;
- the data and level it was made on, by name, size and fingerprint - not the data itself, unless **Pack the data in** is ticked (then the files follow the JSON in the same file, for handing the whole thing to someone).

Never in it: the password, any token, the ban list.

**Open session** works alone too: the layers come back on your board and in your view at once, and a report (in the data panel and in this panel) says what the file was made on that is not loaded here, and follows it until everything is back:

- **The level** loads by itself, by name, from the levels folder or the level library. Where it is in neither, the report says so, with a button to the level panel.
- **The data**: **Load the missing data…** asks for the folder that holds it. Only the files that are this session's data (the same name, size and fingerprint, also inside `.3dheat` files) are loaded, and they load at once; **Pick files…** does the same with single files. Where the browser can (Chromium), the folder is remembered: the next session file that lacks data offers it again (**From** *folder*), and the browser asks to allow reading it. A packed session file loads its own data by itself.
- **The view on screen** (camera, mode, filters, time, the match picked, layers) comes back once its data and level are loaded, not before: its filters name the data's columns and values. **Put it back now** applies it with what is there.
- The list of missing data shrinks as data is loaded (also data loaded by hand in the data panel) and goes when nothing is missing. The host opening a session file in a session replaces what everyone shares, and everyone sees the change. The host's viewer also keeps a copy every two minutes in the browser (**Restore the autosave** in the panel).

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
| TCP connections | 4096 in all, 256 from one address (an IPv6 /64 counts as one); the core refuses the rest before a byte is read |
| TLS handshake, a request's head | 10 seconds each; a head is 16 KiB at most |
| A quiet connection | closed after 75 seconds; one whose client stops reading, after 30 seconds of no progress |
| HTTP requests | 400 at once, then 100 a second, from one address; then *429* |
| WebSocket upgrades | 60 at once, then five a second, from one address (a team joining from one office address) |
| Before the hello | 5 seconds; 8 such connections from one address, 256 in all; they hold no place in the session |
| Members, waiting room | no fixed number of members unless the host sets one (`--max-clients`); 256 members from one address; 64 waiting, 3 of them from one address; the host always gets in |
| Presence | each member's camera ten times a second; only who moved goes out, everyone once a second; from 24 members on each member's pose is thinned (every `members / 24` ticks, at most one a second), so the traffic grows with the room, not its square |
| A message | 64 KiB, checked before decoding; no compression (no decompression bombs) |
| Per member | messages, bytes, batches, presence, look-here and follow (3 a minute), view sync (10 a second, 48 KiB each; "switch to my view" 3 a minute), moderation and invites each have a budget; a flood is cut off; one that falls 8 MB behind is cut off; a slow one loses only presence frames |
| The shared layers | 1 MiB a second of operations for the whole session (every change goes to everyone), 64 MiB of documents in all, 16,000 characters per text, 512 operations per batch, 32 documents |
| Uploads | the host's only; 8 GiB each, two at a time; a session file 64 MiB |

### Identity, passwords and tokens

- **The browser's key.** Each browser makes an Ed25519 key pair once and keeps it in IndexedDB, its private half not extractable. Joining, the server sends a fresh challenge and the browser signs it: the server then knows the browser by its public key, not by anything the browser merely says. A member's own marks stay their own by it, a resume token works only from the browser that was given it (a copied token is useless), bans hold to it (and to the address and name), and an invite link used up still lets back in the browsers that joined with it. A browser without Ed25519 (or without IndexedDB) names a random key instead, which the server keeps apart (`u:...`) so it can never pass for a proven one.
- **Passwords** are kept only as an argon2id hash (64 MiB, 3 passes), never in the gateway's environment, and checked two at a time at most, one per address, eight waiting at most (a guess past that is turned away at once, so a flood of guesses cannot pile up work that outlasts it). Five wrong passwords from one address (an IPv6 /64 counts as one) lock it out for 15 minutes, twice as long each time it happens again; many failures across addresses slow every login down and tell the host. A wrong password, invite or host token all get the same answer.
- **Tokens** (the host's, resume and invite tokens) are 256 random bits, compared in constant time. Invite links expire (a day by default, a week at most) and are used up (one link may let in up to 1,000 people: a whole team); a member's token changes when their role does; the host's travels only in the address's fragment and is taken out of the address bar at once.

### What members send

- **Checked on the server**, before anything is done with it: its size, then its shape, then its values (finite coordinates inside the world, names and notes normalised and stripped of control and direction-override characters, no `__proto__`-style keys, bounded depth and length), then the sender's role (each operation of a batch on its own: what the role may not do is dropped and said), mute and budgets.
- **View sync is passed on, never kept.** The server checks a view message's kind, its size (48 KiB), that it is a JSON object, the sender's mute and budget, and sends it to the members named; each viewer then takes from it only the fields its own settings have, of the same types and within sizes, and matches names against its own data.
- **Shown as text.** Names, notes and labels are never markup. Notes and analysis documents are Markdown, rendered by the viewer's own renderer, which escapes all HTML, allows links only to `http`, `https`, `mailto` and the viewer's own places, and renders 64 KiB at most; pictures in notes must be raster images. Exported and printed analyses carry their own content security policy.
- **The page** has a strict content security policy (scripts only from the server itself, no frames, no plugins, no inline script), `nosniff`, no referrer, `frame-ancestors 'none'`, and HSTS with a real certificate. The WebSocket opens only from the server's own origin (and the origins you allow), so another site's page cannot use a member's browser to talk to it.
- **Files** go out only if the host published them, by their SHA-256, as `application/octet-stream` and an attachment; there are no paths. The data API (`/v1`) answers members only, with a member's rights (never a file by path). The desktop app's own window server answers its window only. The local usage statistics (`/__heat3d/usage`, off unless switched on) answer the host's own browser only, by the host's token; a member's request never reaches them.

### The audit log

`audit.log` in the state folder (`--state-dir`) has one JSON line per join (how: host token, invite, password, admitted), failed login, lockout, role change, mute, kick, ban and unban, invite made and revoked, settings change (that the password changed, never the password), session file opened, file published, gateway restart, and once a minute how many connections and requests the limits refused. It never holds a password or a token. It does hold members' addresses: it stays on your machine, and the session never shows anyone another member's address.

### Supply chain and testing

`cargo-deny` and `cargo-audit` check the native workspace's dependencies (known vulnerabilities, sources, licences) and `npm audit` the viewer's, in CI (`.github/workflows/session-security.yml`), which also fuzzes every target for a minute on each change (`native/crates/session/fuzz`: every client message, structure-aware; the session file; the paths and assets through the gateway and the core; the channel between the two processes; and `tools/fuzz-markdown.mjs` for the Markdown renderer), and checks the sandbox on Windows and Linux. Lockfiles pin every version.

## Public sessions

By default only this machine and its local network get an answer. To let people in from the internet, the host opens the session panel and uses **Make session public**. It offers three ways, says first what becomes reachable (the session's page, its connection and the files the host shares - nothing else on the machine) and whether the host's IP address can be seen, starts the way picked, runs a **self-test** (it fetches `/session.json` through the public address, and through the proxy on the local network where it knows it), and only then shows the join link to copy. **Stop public** ends it; so does ending the server. Public links keep the **waiting room** on: the host lets in everyone who joins with the password, and invite links (which carry their role) skip it. While the session is public, invite links point at its public address.

### Cloudflare Tunnel (the default)

For anyone without a domain of their own. Put the `cloudflared` program (from Cloudflare's releases; no installation, no administrator rights, no service) on the `PATH` or next to `3dheat`. **Make session public** then starts a *quick tunnel*: a random `https://….trycloudflare.com` address, no account, no open port on your router, your IP address hidden behind Cloudflare. For a fixed address, create a named tunnel with your Cloudflare account and name it in the local configuration (`"cloudflared": { "tunnel": "<name>", "hostname": "<its hostname>" }`). Quick tunnels have no uptime guarantee; they suit a session, not a service.

While the tunnel runs, the server takes each visitor's address from `CF-Connecting-IP`, and only from `cloudflared` on this machine (see below). The last hop is this machine's loopback to the server's own certificate.

### Your own domain, through a reverse proxy

If you have a domain with a valid certificate, run a small reverse proxy on a machine of your local network (a NAS, a small server) and forward one port of your router to it. The proxy terminates TLS with the real certificate, forwards to `3dheat serve` on your PC (WebSocket included) and filters floods before they reach it. A proxy that fits the server's own limits:

- per client address: 64 connections, 100 requests a second after a burst of 400, one WebSocket upgrade a second after 20; 1024 connections and 50 upgrades a second in all (a flood from many addresses cannot pile up password checks);
- request heads within 10 seconds, 16 KiB at most; bodies of 1 MiB (16 MiB for `/v1`); 75 seconds idle; WebSocket reads for 90 seconds;
- `X-Real-IP` and `X-Forwarded-For` **set** to the client's address (never appended to what the client sent), `CF-Connecting-IP` and `Forwarded` removed;
- `/api/publish`, `/api/load`, `/api/docs` and `/__heat3d/` refused: the host's own endpoints are for the host's browser on the PC, never through the public door;
- the server's certificate checked on the last hop (the self-signed one, by its name `localhost`), one upstream connection per request or WebSocket, no temporary files for large downloads;
- HSTS only while the certificate is valid; memory and CPU capped; no access log (visitors' addresses stay out of the proxy's logs);
- **off while no session is public**: started when the host makes the session public and stopped afterwards, and stopping by itself when the PC has been unreachable for a while.

nginx handles all of this with its stock modules (`limit_conn`, `limit_req`, `proxy_ssl_verify`, WebSocket upgrade headers).

**Keep the proxy updated.** It is the first thing the internet reaches. Pin its image by tag **and digest**, let the start command refuse an image older than the oldest release without known vulnerabilities (and raise that minimum with every security advisory), and serve only what the session needs: HTTP/1.1 and WebSocket, so turn HTTP/2 off, open no HTTP/3 / QUIC listener, configure no resolver and no mail or stream blocks. Scan the image for known vulnerabilities (Trivy, Grype) when you update it. Then tell the server about it in the local configuration (`local.json` in the state folder):

```json
{
  "trustedProxies": ["192.168.1.20"],
  "ownDomain": {
    "url": "https://sessions.example.org:8443",
    "upstream": "192.168.1.10",
    "start": ["ssh", "-o", "BatchMode=yes", "me@proxy-box", "~/heat3d-proxy/ctl.sh start {upstream}"],
    "stop": ["ssh", "-o", "BatchMode=yes", "me@proxy-box", "~/heat3d-proxy/ctl.sh stop"],
    "checkVia": "192.168.1.20:8443"
  }
}
```

`start` and `stop` are commands the server runs to start and stop the proxy (here over SSH with a key); `{upstream}` becomes this PC's address and the server's port, and the server's certificate is written to the start command's input, so the proxy can check whom it talks to. `checkVia` is the proxy's own address on the local network, for the self-test through it (routers often do not loop a public address back, so the test from outside may fail from inside even when it works).

On the PC: the server must listen on the local network (the default, `--bind 0.0.0.0`), and the firewall should let in **only the proxy's address**, on the server's port only. On Windows, as administrator:

```
New-NetFirewallRule -DisplayName "3DHeat session (reverse proxy)" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 7878 -RemoteAddress 192.168.1.20 -Program "C:\path\to\3dheat.exe" -Profile Private
```

Create the rule before the server first listens on the network, so Windows does not ask (an answer of *Cancel* there makes a blocking rule that wins over this one). Your domain points at your public IP address: everyone with the link can see it.

### Port forwarding (expert)

`--expose-internet` makes the server answer any address directly (TLS required; with `--cert` and `--key` for a real certificate); off by default, and the viewer shows a note while it is on. Forward the port on your router to the PC. The server is **hardened** for it (see [Security](#security)), but nothing in front of it filters a flood that saturates your line, and your address is visible to everyone you invite. Name the address in `"portForward": { "url": "https://…:7878" }` to have **Make session public** test it and show the link. Use a long password, invite links and the waiting room, and stop the server when the session ends.

### Who the client is: trusted proxies

Behind a proxy or a tunnel every connection comes from the proxy, so every limit, lockout and ban by address would hit everyone at once. The server takes the client's address from forwarding headers **only** from peers it was told to trust:

| The connection comes from | The client's address is |
|---|---|
| a `--trusted-proxy` (or `trustedProxies` in the local configuration) | the right-most `X-Forwarded-For` entry that is not itself a trusted proxy, else `X-Real-IP` |
| `cloudflared` on loopback, while the server's tunnel runs or with `--trust-cloudflared` | `CF-Connecting-IP` - and nothing else (`X-Forwarded-For` from loopback is ignored) |
| anyone else | the connection's own address: forwarding headers are ignored |

A forwarded address that is this machine, no address or garbage is not believed (it would earn the host's own exemptions): such requests count as one unknown address together. A trusted proxy's connections count against the server's total only, and each request's client is then held to the per-address limits (requests, upgrades, waiting hellos, members per address, lockouts, bans), each request on its own (a proxy may carry several clients on one connection). Through a trusted proxy or tunnel the session says it is reachable from the internet.

## The host's room: everyone on the same map

The host's viewer keeps a small document only the host may write (`host-room`): the map it has loaded, that game's unit catalogue and model pack, and the loaded data, with what of it is shared. Every member's viewer follows it:

- **The host loads a map: every member loads it.** From the member's own levels folder when it has the map, else from what the host shares.
- A member who lacks something is told so ("The host has the map X, but you do not"), and the host is asked - when such a member joins and whenever the map changes - **"Share your map with the others?"**, with who lacks what and how big it is. Nothing is shared unless the host says so; **Not now** holds until someone new lacks something or the map changes.
- What the host shares and a member lacks: the member is asked once, **"The host shared these. Download them?"**. After **Yes** every file is fetched, checked by its hash and loaded by itself: the map becomes the level, the unit catalogue names the units, the model pack draws them as their own models. What is already in the browser's cache loads without asking.
- The same works for the host's data: once the host shares it, members download and load it.

What a member lacks goes back to the host with the member's presence (a list of short ids of the room's items, never names or paths).

## Sharing assets

The host can share **levels, the catalogue and figure or model packs** from the catalogue folder (the levels folder the extractors write into; `--catalog`, `share.catalog` in the local configuration, or `HEAT3D_LEVELS`) with the members, by content hash. Nothing is shared until the host presses a Share button in the session panel (**Share with the others**):

- **Share the loaded level** shares the whole level in one press: its model with everything beside it that belongs to it (layouts, side file, map pictures, tiled terrain; a `.gltf`'s buffers and images), and with the game's unit catalogue and model pack when the folder has them. Further items are ticked in a list and shared with one **Share** press. Shared items leave that list for the **Shared** list, where each can be stopped.
- **The host confirms the rights**: by the tick "I may share what I pick here" in the panel or the room's question, or in a confirmation before the share; the server logs it with the time for each item (in the audit log: what was shared, never where it lies). Anything over 512 MiB in all is warned about first: everyone downloads it from the host's machine.
- **Confidential items** are recognised and marked in the panel: anything under a folder named in the local configuration (`"share": { "blocked": ["D:/levels/licensed"], "blockedWords": ["codename"] }`), anything in or under a folder holding a file named `.3dheat-confidential`, and anything whose path has a word that marks confidential material. Links are followed before the check. Whether such data may go to the people in a session (colleagues under the same agreement, say) is the host's call: sharing one needs a second, explicit confirmation with a clear warning, is logged as such in the audit log, and members see the item marked confidential. For such a session the panel suggests invite links only and the waiting room. Nothing outside the catalogue folder is ever shared.
- **Packs made from a game's own model files** (model packs, car packs, local figure packs) stay on the host's machine: sharing one needs a second confirmation for that pack, with a warning.
- **Members** see each shared item's name, kind and size - never a path - and are asked to download what they lack (see the room above), or **Load** it from the list: its manifest first, then every file by its SHA-256, each checked before it is used. A level becomes the level (with its layouts and tiled terrain), a unit catalogue or model pack is installed in the figures, another single-file item is saved for the member; files are kept in the browser's cache by hash and checked again when taken from it.
- Members fetch the files from the host's server: through your own domain or a port forward they can see its address, which the panel asks the host to agree to before sharing; through a Cloudflare Tunnel the address stays hidden.

## Video mode (for devices that cannot draw the data)

A member whose device cannot draw the session's data - a phone, a weak graphics chip, a dataset far larger than its memory - can get **its own view as video** instead: the host's app draws that member's camera in its native viewport, encodes it on the graphics card (NVENC on NVIDIA, AMF on AMD, Quick Sync on Intel; Microsoft's software H.264 where there is none) and sends it over WebRTC. The member's page plays it where its own picture would be; its panels, labels and marks stay its own, and moving its camera moves the host's drawing of it.

- **Chosen by itself** when the device looks too weak for the session's data (no WebGPU or WebGL2, the data far beyond its memory, or its own picture slower than 20 frames a second for six seconds), or **by hand** in the session panel's *Video mode*: *Watch as video*, and *Stop the video* to draw it yourself again. *Turn on by itself when this device is too slow* (on by default, kept per browser) switches the automatic choice off.
- **The host's own frames come first**: members' views are drawn in the gaps between the host's frames, and when a host frame comes late the members get fewer frames until it keeps its pace again.
- **The host** needs the desktop app with **Settings > Native viewport** on. No fixed number of members: everyone who **follows the host** shares one video of the host's view (drawn and encoded once, sent to each), so a whole team can watch at the cost of one stream. Members with a view of their own get one each for as long as the graphics card and its encoders keep up: when they get tight, the members' pictures get fewer frames, then smaller, before anyone is turned away; a member the host has no room for is told so and tried again every 15 seconds. `--video-streams N` caps the views of their own by hand (0 for none). Viewers get up to 1280x720 at 30 fps, draw-only members 1920x1080 at 30, elevated and up 1920x1080 at 60. The bitrate follows the link; when the link is slow, the frame rate drops before the picture breaks up.
- **Local network only** for now: the picture goes straight between the two machines, never through a relay. A member who joined through a tunnel or proxy gets no video.
- **Security**: the offer and answer go through the session server with the member's token, like every other member request; the gateway names the member and role, and nothing else gets a stream. A stream ends within 15 seconds when its member leaves, is kicked or banned.
- What is in the video: the heat, the level, the grid, figures and their trails. Not yet: capture zones, spawn marks, engagement ranges and the labels drawn over the picture.

## For developers

- Protocol: [`native/proto/heat3d/session/v1/session.proto`](https://github.com/Holdi601/3DHeat/blob/main/native/proto/heat3d/session/v1/session.proto) (prost on the server, protobuf-es in the viewer: `npm run proto:session` regenerates `src/session/proto/`).
- Server: [`native/crates/session`](https://github.com/Holdi601/3DHeat/tree/main/native/crates/session): `session.rs` is every rule as pure logic, `gateway.rs` the network side (TLS, HTTP, WebSocket, limits), `server.rs` the core (port, files, audit log, the gateway process), `ipc.rs` the channel between them; [`native/crates/sandbox`](https://github.com/Holdi601/3DHeat/tree/main/native/crates/sandbox) locks the gateway down. `cargo test` runs the role matrix, limits, ordering and catch-up tests; `cargo +nightly fuzz run <target>` (in `fuzz/`: `client_msg`, `client_structured`, `doc_json`, `asset_paths`, `ipc_frames`) fuzzes it; `examples/attack.rs` and `tools/pentest-dos.mjs` are the pentest's load and abuse tools (`attack` also tries your own proxy on the local network with `HEAT3D_ATTACK_LAN=1`); `proxy.rs` decides whom to believe about client addresses, `share.rs` holds the block list.
- Viewer: [`src/session`](https://github.com/Holdi601/3DHeat/tree/main/src/session): `client.ts` the connection, `shared.ts` the shared layers (`registerSharedDoc` adds one), `sessionFile.ts` the session file, `sessionOpen.ts` an opened file followed until its data, level and view are back (`dataFolder.ts` the remembered data folder, `levelRequest.ts` a level asked for by name).
- `node tools/smoke-session.mjs` starts a server and 2 to 20 headless viewers, and tries every action in every role; with `--proxy` the members join through a reverse proxy on this machine (`tools/proxy-chain.mjs`, each member its own client address), as in a public session.
