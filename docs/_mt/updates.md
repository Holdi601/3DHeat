---
title: "Aġġornamenti"
nav_order: 21
lang: "mt"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Aġġornamenti

Il-viewer jgħidlek meta teżisti verżjoni iktar ġdida, u jaġġorna lilu nnifsu biss meta tgħid iva. Xejn ma jinbidel fuq il-kompjuter tiegħek mingħajr it-tweġiba tiegħek.

## Aġġorna l-viewer {#update-the-viewer}

1. **Fil-paġna.** Meta teżisti verżjoni iktar ġdida, kaxxa tidher taħt l-isem fil-quċċata tas-sidebar: "Hemm verżjoni iktar ġdida ta' 3DHeat disponibbli". Ikklikkja **Aġġorna issa**. Il-paġna terġa' titlogħba waħedha meta jispiċċa. **Aktar tard** taħbi l-kaxxa sakemm terġa' ttella' l-paġna.
2. **Jekk jgħid li għandek tmexxi restart.bat**, agħlaq it-tieqa tas-server (it-tieqa sewda li fetaħ `start.bat`) u ikklikkja darbtejn `restart.bat`.
3. **Meta tibda l-viewer.** `start.bat` jiċċekkja wkoll. Jekk teżisti verżjoni iktar ġdida jistaqsi **Aġġorna issa? [Y/N]**. Agħfas `Y` biex taġġorna. Agħfas `N`, jew stenna 60 sekonda mingħajr tweġiba, biex tibda l-verżjoni li għandek.

![In-notifika tal-aġġornament b'Aġġorna issa u Aktar tard](../assets/img/en/updates-notice.webp)

Kopja b'bidliet tiegħek innifsek qatt ma tiġi aġġornata għalik; il-kaxxa tgħidlek biss li hemm aġġornament jistenna, u tgħid biex tagħmel commit jew stash tal-bidliet tiegħek u tmexxi `git pull`. Kopja li ma ġietx installata b'git (fajl zip, pereżempju) ma turi xejn.

Kif jaħdem iċ-ċekk, pass pass:

```
paġna ---(wara 4 s, imbagħad kull 6 sigħat)---> server tal-iżvilupp ---> git fetch
   wara?  le  -> ma jintwera xejn
          iva -> bidliet jew commits tiegħek?  iva -> tgħidlek biss
                                                le -> [Aġġorna issa] -> git pull
                                                      -> terġa' ttella', jew "mexxi restart.bat"
```

## Ir-regoli tas-sikurezza {#the-safety-rules}

- **Fast-forward biss** (`git pull --ff-only`): aġġornament qatt ma jaqbad flimkien,
  ma jgħaqqadx u ma jikteb mill-ġdid xejn.
- **L-ebda bidla lokali**: checkout b'bidliet mhux kommessi għal fajls issorveljati
  (`git status --porcelain --untracked-files=no` mhux vojt) qatt ma jiġi aġġornat
  awtomatikament - ix-xogħol ta' ħadd mhuwiex dak li aġġornament għandu jaqlaq.
  Jiġi biss mgħarraf li hemm aġġornament jistenna. Fajls mhux issorveljati (data,
  esportazzjonijiet) ma jitqisux bħala bidliet.
- **L-ebda commits lokali**: checkout b'commits li l-upstream ma għandux
  ("diverġenti") ma jiġix aġġornat - fast-forward ma jistax iġibu 'l fuq, u
  l-merge huwa għal `git pull` bl-idejn. Il-paġna u `start.bat` jgħidu dan bl-istess
  kliem, u `start.bat` jibda l-verżjoni li hemm.
- **Mill-paġna nnifisha biss**: it-talba tas-server tal-iżvilupp għall-aġġornament trid
  iġġib header personalizzat u, meta l-browser jibgħat `Origin`, tiġi mill-host tas-server
  innifsu (hawn taħt).
- Biss checkout ta' git b'branch upstream qatt jiġi aġġornat; kwalunkwe ħaġa oħra
  (kopja mingħajr `.git`, git mhux installat, build statiku) titħalla waħedha u ma tgħid xejn.

## X'jagħmel start.bat {#what-startbat-does}

`start.bat` (ikklikkjah darbtejn; it-tieqa hi s-server) jagħmel, fl-ordni:

1. Isib Node.js - fuq `PATH`, inkella f'`%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` jew `%LOCALAPPDATA%\Programs\nodejs` - u joffri li
   jinstallah b'`winget install -e --id OpenJS.NodeJS.LTS` meta ma jkunx hemm (jistaqsi, Y/N;
   wara jkun meħtieġ li terġa' tiftaħ it-tieqa sabiex Windows jara l-`PATH` il-ġdid).
2. **Aġġornamenti**, meta git ikun installat u l-folder ikollu `.git`:
   - `git fetch --quiet` (mingħajr network jew upstream: jitħalla jgħaddi bla ħoss);
   - jgħodd `git rev-list --count HEAD..@{u}`; xejn wara: ma jingħad xejn;
   - bidliet lokali: "Hemm verżjoni iktar ġdida ta' 3DHeat disponibbli (N bidliet), imma din il-kopja għandha bidliet lokali, għalhekk ma tiġix aġġornata. Ikkommetti jew ipoġġi fl-istash, imbagħad mexxi git pull." - u jibda l-verżjoni li hemm;
   - commits tagħha stess (`git rev-list --count @{u}..HEAD` mhux 0): "Hemm verżjoni iktar ġdida ta' 3DHeat disponibbli (N bidliet), imma din il-kopja għandha commits tagħha stess li l-verżjoni l-aktar ġdida ma għandhiex, għalhekk ma tiġix aġġornata. Aġġornaha b'git pull." - u jibda l-verżjoni li hemm;
   - inkella "Hemm verżjoni iktar ġdida ta' 3DHeat disponibbli (N bidliet)." u l-mistoqsija **Aġġorna issa? [Y/N]**. `N`, jew l-ebda tweġiba għal 60 sekonda, jistampa "Mhux aġġornat; qed nibda l-verżjoni li għandek." u jibda l-verżjoni li hemm. Fuq `Y`: "Qed naġġorna...", jgħid jekk `package.json` jew `package-lock.json` jinbidlux,
     jmexxi `git pull --ff-only` (jekk dan għadu jfalli - in-network, pereżempju:
     "L-aġġornament ma għaddiex; qed nibda l-verżjoni li għandek."), imbagħad `git submodule update --init`
     (l-għodod immarkati, ara [Iż-żamma tad-dokumentazzjoni](maintaining.md#the-tools-under-exporters)), imbagħad `npm install` meta l-fajls tal-pakkett jinbdlu u
     `node_modules` ikun hemm, u "Aġġornat."
3. Jirrifjuta li jibda server it-tieni: meta xi ħaġa tkun diġà qed tisma' fuq il-port
   **5273** jgħid dan u jindika lejn `restart.bat` / `stop.bat`.
4. Fl-ewwel tmexxija (mingħajr `node_modules`), jistaqsi qabel jniżżel id-dipendenzi
   (madwar 300 MB fi `node_modules\`, xejn fuq is-sistema kollha).
5. Iniedi s-server tal-iżvilupp fuq `127.0.0.1:5273` (`--strictPort`) u jiftaħ
   il-browser meta jkun lest.

`restart.bat` iwaqqaf is-server (bil-port) u jħaddem `start.bat` mill-ġdid, għalhekk jistaqsi l-istess mistoqsija. `stop.bat` iwaqqaf biss.

## Għall-iżviluppaturi {#for-developers}

### Waqt li jaħdem: ir-route tal-aġġornament {#while-it-runs-the-update-route}

Is-server tal-iżvilupp (plugin ta' Vite `heat3d-self-update` f'`vite.config.ts`) jservi
`/__heat3d/update`. Jeżisti biss fuq is-server tal-iżvilupp - mhux f'build statiku
u mhux f'`vite preview`.

**`GET /__heat3d/update`** iwieġeb jekk il-checkout ikunx wara:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` meta l-folder ma jkunx checkout ta' git;
- jmexxi `git fetch --quiet` **mill-iktar kull 30 minuta** (it-talbiet bejniethom jiġu mwieġba minn dak li l-aħħar darba ġie mniżżel);
- `behind` / `ahead` minn `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`,
  `dirty` minn `git status --porcelain --untracked-files=no`, `latest` is-suġġett tal-aktar commit ġdid tal-upstream;
- bla branch upstream, `upstream: null` u `behind: 0`.

**`POST /__heat3d/update/apply`** iġib il-checkout 'il quddiem:

1. Miċħud b'`403 { ok: false, reason: "forbidden" }` sakemm it-talba ma jkollhiex
   l-header `X-Heat3d-Update: 1` u, meta tkun fiha `Origin`, il-host ta' dik l-origin ikun
   il-`Host` tat-talba. Forma minn sit ieħor ma tistax tibgħat header personalizzat
   mingħajr CORS preflight, li dan is-server qatt ma jagħti.
2. Xejn x'isir (mhux checkout, mingħajr upstream, mhux wara):
   `{ ok: true, updated: false }`.
3. Bidliet lokali: `{ ok: false, reason: "dirty" }`; commits lokali: `{ ok: false, reason: "diverged" }`.
4. Inkella: jinnota l-fajls li jinbdlu (`git diff --name-only HEAD @{u}`),
   `git pull --ff-only` (timeout ta' 2 min), `git submodule update --init`
   (il-falliment jiġi injorat), `npm install` meta `package.json` jew
   `package-lock.json` jinbdlu (timeout ta' 15-il minuta), u iwieġeb
   `{ ok: true, updated: true, restart }` - `restart` jgħid għalfejn is-server li qed jaħdem ma jistax jieħu l-aġġornament: `"dependencies"` meta reinstallaw, `"config"` meta jinbidel biss fajl `vite.config`, `false` meta xejn ma jeħtieġ restart.
5. Kmand ta' git jew npm li jfalli iwieġeb `{ ok: false, reason: "<l-iżball, sa 300 karattru>" }`.

It-tweġibiet huma JSON bi `Cache-Control: no-store`. Is-server jisma' fuq
`127.0.0.1` biss, għalhekk ir-route ma tintlaħaqx mill-network.

### In-notifika fil-paġna {#the-notice-in-the-page}

`UpdateBanner`, taħt l-isem fil-quċċata tas-sidebar:

- Jistaqsi lir-route **4 sekondi** wara li l-paġna titgħabba (mhux fl-ewwel sekondi: il-paġna għandha dataset biex titgħabba u GPU biex tibda) u mill-ġdid kull **6 sigħat** sakemm il-paġna tibqa' miftuħa.
- Juri **xejn** meta ma jkunx hemm dik ir-route (build statiku), il-folder ma jkunx checkout, jew xejn ma jkun iktar ġdid - notifika f'kull bidu hija waħda li n-nies jitgħallmu jinjorawha.
- Wara, mingħajr bidliet lokali: "Hemm verżjoni iktar ġdida ta' 3DHeat disponibbli (N bidliet, l-aktar ġdida: <suġġett>)." b'**Aġġorna issa** u **Aktar tard** (*Aktar tard* taħbiha sakemm terġa' ttella' l-paġna).
- Wara, b'bidliet lokali: l-istess sentenza u "Din il-kopja għandha bidliet lokali, għalhekk ma tiġix aġġornata awtomatikament; ikkommetti jew poġġiha fl-istash, imbagħad mexxi git pull." - bla buttuna.
- **Aġġorna issa** jibgħat lil `/apply` ("Qed naġġorna..."). Imbagħad:
  - "Aġġornat. Il-paġna terġa' titlogħba." - u terġa' titlogħba 1.5 s wara (is-server diġà qed iservi l-fajls il-ġodda);
  - meta d-dipendenzi reinstallaw: "Aġġornat. Id-dipendenzi tiegħu nbidlu: agħlaq it-tieqa tas-server u mexxi **restart.bat** biex tlesti.";
  - meta jinbdlu biss is-settings tas-server: "Aġġornat. Is-settings tas-server nbidlu: agħlaq it-tieqa tas-server u mexxi **restart.bat** biex tlesti.";
  - xejn x'jiġi miġjub wara kollox (`updated: false` - il-kopja diġà ġiet aġġornata fl-ħin, pereżempju minn `start.bat`): "Xejn x'jaġġorna: din il-kopja diġà l-verżjoni l-aktar ġdida." - u l-ebda terġa' titlogħba;
  - miċħud: is-sentenza tal-*dirty*, jew "Din il-kopja għandha commits tagħha stess li l-verżjoni l-aktar ġdida ma għandhiex; aġġornaha b'git pull.", jew "L-aġġornament ma għaddiex: <reason>".
