---
title: "Početna"
nav_order: 1
lang: "hr"
source: "index.md"
source_hash: "b93bb646bdad"
translated: true
outdated: false
---

# 3DHeat

3DHeat pokazuje gdje su se stvari dogodile u igri - kamo su igrači išli, gdje su se borili i gdje su pali - kao svjetleće boje kroz koje možete letjeti ili kao male 3D figure koje ponovno prikazuju utakmicu.

Učitajte pozicije - CSV, Parquet, Tacview snimke, pretvorene reprodukcije, jednu datoteku, mapu ili tisuće utakmica - i vidite ih kao **toplinsku kartu kroz koju možete letjeti**, kao **figure koje ponovno prikazuju utakmicu**, kao crte duž putanja kojima su ljudi išli ili kao jednu populaciju naspram druge. Sam pronalazi ono što se ističe, i radi potpuno u vašem pregledniku: ništa se nigdje ne šalje.

![Toplina deset utakmica tenkova nad demo dolinom](../assets/img/en/heat-hero.webp)

**Prvi put ovdje?** Napravite [demo podatke](demo-data.md) i slijedite njihovih sedam koraka. Svaka slika na ovoj stranici snimljena je s njima.

## Što radi {#what-it-does}

| | |
|---|---|
| ![Razlika](../assets/img/en/heat-difference.webp) | **[Načini topline](heat-modes.md)** - toplina, [razlika](difference.md) (crveno tamo gdje je jedna strana bila više, zeleno-plavo tamo gdje je bila druga), [toplina timova](team-heat.md), [linijska toplina](line-heat.md); [usmjerena toplina](directional-heat.md) s klinovima, poljima strelica i polarnim grafikonima; toplina [ponderirana vrijednošću](value-weighting.md): što oružje, vozila i gorivo koštaju. |
| ![Reprodukcija](../assets/img/en/replay-tanks.webp) | **[Reprodukcija utakmice](match-replay.md)** - svaka jedinica kao [figura](figures.md) onoga što jest, NATO ili ruski simboli na daljinu, projektili i tragovi, oznake pogodaka, olupine, požari, kupole, ciljevi, kamere u stilu Tacviewa i taktički prikaz; [mnogo utakmica odjednom](many-matches.md). |
| ![Uvidi](../assets/img/en/insights.webp) | **[Uvidi](insights.md)** - jake pozicije, smrtonosno tlo, zamke za spawnanje, uska grla i istaknuti igrači, pronađeni i rangirani s dokazima; pisani sažetak, po želji pomoću UI-ja po vašem izboru; komentator za jednu utakmicu; [leća znanja](knowledge.md). |
| ![Volumeni](../assets/img/en/compare.webp) | **[Volumeni](volumes.md)** - crtajte kutije, prizme, valjke i kugle, filtrirajte na njih, brojite što se događa unutra, izvezite to i usporedite mjesta jedno uz drugo; [raščlamba](breakdown.md) tko i što najbolje radi na nekom mjestu. |
| ![Filtri](../assets/img/en/filters.webp) | **[Filtri](filters.md)** - po vrsti događaja, igraču ili UI-ju, klasi vozila, vrijednosti, bilo kojem stupcu, na grafičkoj kartici pri bilo kojoj veličini podataka. |
| ![Razina](../assets/img/en/level-panel.webp) | **[Razine](levels.md)** - slike karata, 3D razine napravljene [alatima za podatke](#related-repositories), pojednostavljenje, [pozadina svijeta](world-backdrop.md) sa stvarnim terenom za podatke o letu. |

Također: kartica [Analiza utrke](race-analysis.md) za krugove utrkaških igara, kartica [Meč](match-analysis.md) za sažetke Counter-Strike 2 utakmica, [Ploča taktika](tactics-board.md) za planove na razini, [analiza pogodaka](hit-analysis.md) po vozilu, [masovna analiza](mass-analysis.md) tisuća utakmica, [putanje kamere i video](camera-path-and-video.md), [40 jezika](languages.md), [metričke ili imperijalne jedinice](settings.md).

## Kartice {#the-tabs}

Kartice su na vrhu bočne trake, ispod naziva, jedinica i izbornika jezika.

| Kartica | Čemu služi |
|---|---|
| **Toplinska karta** | Bilo koja tablica s pozicijama: načini topline, prekrivanje figura, filtri, volumeni, uvidi, razine, mjerenje i video. |
| **Analiza utrke** | Dva ili više krugova jedne staze: gdje se gubi vrijeme, zašto i što promijeniti. |
| **Meč** | Reprodukcija utakmice s figurama i sažeci Counter-Strike 2 utakmica. |
| **Taktika** | Planovi na razini: figure, rute, bačeni pomoćni predmeti, područja i bilješke u koracima koji se reproduciraju. |
| **Vozila** | Gdje je svaka jedinica pogođena, od koga i čime. |

## Instalacija i pokretanje {#install-and-run}

### Windows, jednostavan način {#windows-the-easy-way}

Korijenski direktorij repozitorija sadrži tri batch datoteke.

| Datoteka | Što radi |
|---|---|
| `start.bat` | Pokreće preglednik podataka. Pronalazi Node.js čak i kad nije u `PATH`-u (traži u `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` i `%LOCALAPPDATA%\Programs\nodejs`), a kad Node.js nedostaje, nudi instalaciju LTS izdanja naredbom `winget install -e --id OpenJS.NodeJS.LTS`. Pri prvom pokretanju pita prije preuzimanja ovisnosti (oko 300 MB u `node_modules\` unutar mape, ništa na razini sustava). Odbija pokretanje kad nešto već sluša na portu 5273 i upućuje na `restart.bat`. Kad je mapa git checkout bez lokalnih promjena i postoji novija verzija, pita želite li ažurirati (Y/N; bez odgovora u 60 s zadržava ovu verziju; vidi [Ažuriranja](updates.md)). Zatim pokreće razvojni poslužitelj na `http://127.0.0.1:5273/` i otvara preglednik. **Prozor je poslužitelj**: ostavite ga otvorenim, zatvorite ga ili pritisnite Ctrl+C za zaustavljanje. |
| `restart.bat` | Pokreće `stop.bat quiet`, pa zatim `start.bat`. Potrebno samo nakon promjene `vite.config.ts`, dodavanja ovisnosti ili kad se poslužitelj zaglavi - izmjene izvornog koda se učitavaju same. |
| `stop.bat` | Zaustavlja što god sluša na portu 5273, po identifikatoru procesa pronađenom kroz `netstat`, nikad po imenu slike, pa drugi Node.js procesi na računalu ostaju netaknuti. Čeka otprilike dvije sekunde da se utičnica oslobodi. S argumentom `quiet` ne čeka na kraju. |

### Ručno (bilo koji OS) {#by-hand-any-os}

```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

Mapa `exporters/` sadrži zasebne alate za podatke kao git submodule, svaki vlastiti repozitorij; nakon običnog kloniranja pokrenite `git submodule update --init`. Sam preglednik ih ne treba za rad. Mapa `exporters/ext/` sadrži opcionalne pretvarače (War Thunder, World of Tanks, World of Warships, Squad reprodukcije; DCS i IL-2 karte), odvojene tako da problem s jednim od njih ne utječe ni na jedan drugi.

Uz sve to ne dolaze nikakvi podaci iz igara: razine, karte i snimke izrađuju se na vašem računalu alatima, iz igara koje posjedujete.

### npm skripte {#npm-scripts}

| Skripta | Što pokreće |
|---|---|
| `npm run dev` | Vite razvojni poslužitelj na portu 5273, vezan na `127.0.0.1`. |
| `npm run build` | Provjera tipova (`tsc --noEmit`) i produkcijski paket u `dist/`. |
| `npm run preview` | Poslužuje produkcijski paket. |
| `npm run typecheck` | Sama provjera tipova. |
| `npm test` / `npm run test:watch` | Jedinični i integracijski testovi (vitest). |
| `npm run smoke` | Pokreće pravu aplikaciju u headless Chromiumu i provjerava ima li platno piksela obojenih podacima; snimke zaslona idu u `tools/.smoke/`. Očekuje da razvojni poslužitelj radi. |
| `npm run smoke:f16` | Isti skup s `?heat=f16`, što prisiljava put akumulacije u polupreciznom formatu (vidi [Akumulacija u polupreciznom formatu](half-float-accumulation.md)). |
| `npm run bench` | Mjerenje učitavanja, piše `tools/.smoke/ingest-bench.json`. |
| `npm run test:heavy` | Testovi koji trebaju velike stvarne datoteke s podacima; sami se preskaču kad datoteke nisu prisutne. |
| `npm run inspect -- <file.parquet>` | Ispisuje shemu Parquet datoteke i nekoliko redaka (`tools/inspect-parquet.mjs`). |

### Što dodaje razvojni poslužitelj {#what-the-dev-server-adds}

Preglednik je statička web stranica, ali razvojni poslužitelj (vidi `vite.config.ts`) dodaje dvije lokalne rute koje statička objava `dist/` nema:

- `/__host/memory` izvješćuje o instaliranoj i slobodnoj RAM memoriji računala i, gdje je može očitati, o memoriji grafičke kartice (iz `nvidia-smi`, ili na Windowsu iz registra adaptera zaslona). Zahvaljujući tome [proračuni memorije](memory-and-budgets.md) koriste stvarne brojke umjesto ograničenih procjena preglednika.
- `/__heat3d/update` provjerava zaostaje li checkout i može ga brzo ažurirati ([Ažuriranja](updates.md)).

Poslužitelj se veže samo na `127.0.0.1`, pa do obje rute nije moguće doći s mreže. Otvorite ga kao `http://127.0.0.1:5273`: `localhost` može se razriješiti u IPv6 loopback `::1`, gdje ništa ne sluša. Ne šalje zaglavlja za međusobnu izolaciju izvora (COOP/COEP): ništa u pregledniku ne koristi `SharedArrayBuffer`, a radnici podatke predaju prijenosom, što ne traži ništa više.

## Zahtjevi za preglednik i GPU {#browser-and-gpu-requirements}

- **Preglednik s WebGPU ili WebGL2.** WebGPU se isprobava prvi (Chrome i Edge ga imaju); bez njega koristi se WebGL2 pozadina. WebGL2 mora nuditi `EXT_color_buffer_float` (iscrtavanje u teksture s pomičnom točkom), inače preglednik prikazuje „Cannot initialise the renderer.” Vidi [Dva pozadinska sustava](backends.md). Preglednik se razvija i testira u Chromiumu; ostali preglednici nisu provjereni.
- **Uključena hardverska akceleracija.** Kad preglednik crta na CPU-u (SwiftShader, llvmpipe, Microsoft Basic Render Driver i slično), crveni baner na vrhu bočne trake to kaže i pokazuje kako to popraviti. Vidi [Otkrivanje softverskog iscrtavanja](software-rendering.md).
- **Diskretni GPU pomaže, ali nije obavezan.** Obje pozadine traže adapter za visoke performanse. Količina podataka koja se može držati na GPU-u je proračun koji vidite i možete ga mijenjati ([Memorija i proračuni](memory-and-budgets.md)).
- **Neobavezne značajke** koriste dodatne API-je preglednika: iscrtavanje videa traži WebCodecs `VideoEncoder` s VP9 ili VP8 ([Putanja kamere i video](camera-path-and-video.md)); pojednostavljenje mreže razina traži WebAssembly; ispuštanje mapa koristi File and Directory Entries API; biblioteka razina koristi IndexedDB; gamepadovi koriste Gamepad API.

## Karta dokumentacije {#documentation-map}

**Početak**: [Demo podaci](demo-data.md) · [Unos podataka](getting-data-in.md) ([učitavanje datoteka](loading-files.md), [mapiranje stupaca](column-mapping.md), [osi, jedinice i vrijeme](axes-units-and-time.md), [sesije, osobe i grupe](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [pretvarači](converters.md), [.3dheat](container.md), [memorija i proračuni](memory-and-budgets.md))

**Pogledajte**: [Načini topline](heat-modes.md) ([toplina](heat.md), [oblik spritea](sprite-shape.md), [boja i ekspozicija](colour-and-exposure.md), [dubina i odbacivanje](depth-and-culling.md), [razlika](difference.md), [toplina timova](team-heat.md), [linijska toplina](line-heat.md), [reprodukcija kutije](box-replay.md), [usmjerena toplina](directional-heat.md), [ponderiranje vrijednosti](value-weighting.md)) · [Vremenska traka](timeline.md) · [Razine](levels.md) ([slike karata](map-images.md), [3D razine](model-levels.md), [izgled](level-appearance.md), [biblioteka](level-library.md), [pozadina svijeta](world-backdrop.md), [njezini izvori](world-backdrop-sources.md)) · [Kamera](camera.md) ([gamepad](gamepad.md), [tipke](keyboard-reference.md)) · [Putanja kamere i video](camera-path-and-video.md)

**Analiza**: [Filtri i alati](filters-and-tools.md) ([filtri](filters.md), [timovi](teams-list.md), [entiteti](entities.md), [presjek](slice.md), [mjerenje](measure.md), [volumeni](volumes.md), [raščlamba](breakdown.md)) · [Uvidi](insights.md) ([leća znanja](knowledge.md)) · [Masovna analiza](mass-analysis.md)

**Reprodukcija**: [Reprodukcija utakmice](match-replay.md) · [Mnogo utakmica odjednom](many-matches.md) · [Figure](figures.md) ([u prekrivanju figura](figure-replay.md), [zasluge](figure-credits.md)) · [Paritet s Tacviewom](tacview-parity.md) · [Analiza pogodaka](hit-analysis.md)

**Ostale kartice**: [Analiza utrke](race-analysis.md) ([metoda](race-analytics.md), [ostale igre](other-games.md)) · [Analiza utakmice](match-analysis.md) · [Ploča taktika](tactics-board.md) ([brzine](tactics-speeds.md))

**Preglednik**: [Pojmovnik](glossary.md) · [Postavke, jedinice i tipke](settings.md) · [Jezici](languages.md) · [Ažuriranja](updates.md) · [Unutarnji dijelovi iscrtavanja](rendering-internals.md) ([pozadine](backends.md), [akumulacija](accumulation.md), [uzorkovanje i proračuni](sampling-and-budgets.md), [polupreciznost](half-float-accumulation.md), [memorija GPU-a](gpu-memory.md), [softversko iscrtavanje](software-rendering.md), [performanse i statistika](performance-and-stats.md)) · [Formati podataka](data-formats.md) · [Referenca](reference.md) · [Održavanje dokumentacije](maintaining.md)

## Srodni repozitoriji {#related-repositories}

Preglednik čita podatke; ovi alati ih stvaraju. Svaki je zaseban javni repozitorij (MIT) s vlastitom dokumentacijom. Nijedan ne isporučuje podatke iz igara: razine, karte i snimke izrađuju se na vašem računalu, iz igara koje posjedujete.

| Repozitorij | Što radi | Korisno za |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Čita staze i razine iz arhiva koje igre isporučuju (Forza Horizon, BeamNG, Assetto Corsa Rally; čitači za Unreal, Unity, Frostbite i Source 2) kao glTF | 3D razinu ispod vaše topline ili reprodukcije |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Bilježi telemetriju krugova iz sučelja koja utrkaške igre objavljuju, i rekonstruira razine iz videa igranja | krugove za Analizu utrke; razinu tamo gdje se datoteke ne mogu čitati |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Dodatak za Unreal Editor koji izvozi razinu kao jednu glTF datoteku | razine vaših vlastitih Unreal projekata |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Counter-Strike 2 demo snimke u tablice toplinskih karata i sažetke utakmica, CS2 karte u geometriju | CS2 toplinu, reprodukcije i karticu Meč |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Bilježi vašu igru u pozadini iz onoga što igre objavljuju: telemetriju, integracije stanja igre, zapisnike, reprodukcije | vašu vlastitu statistiku bez ručnog rada |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | War Thunder reprodukcije (`.wrpl`) u tablice: zračne i kopnene putanje, pucanja, pogodci, ubojstva, kupole, ciljevi | War Thunder reprodukcije, oznake pogodaka i uvide |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | World of Tanks reprodukcije u tablice: položaj svakog vozila, smrti i ubojstva | World of Tanks toplinu i reprodukcije |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | World of Warships reprodukcije u tablice: položaj svakog broda i potonuća | World of Warships toplinu i reprodukcije |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Squad demo snimke servera u tablice: položaj, tim i odred svakog igrača | Squad toplinu i reprodukcije |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | DCS World terene iz vaše vlastite instalacije u razine: tlo, ceste, gradove, zračne luke, polja, vodu | DCS i Tacview snimke na njihovom stvarnom terenu |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | IL-2 Great Battles karte u razine | IL-2 snimke na njihovoj karti |

## Raspored izvornog koda, ukratko {#source-layout-briefly}

| Mapa | Sadržaj |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | Odabir datoteka, unos CSV i Parquet, automatsko mapiranje, provjera, model memorije, graditelj skupa podataka, obrada modela, klasifikacija, pojednostavljenje, biblioteka razina |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | Petlja okvira (`engine.ts`), uzorkovanje, obje pozadine, kamera, gamepad, mjerenje, putanja kamere, snimanje videa |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | Stanje aplikacije (`store.ts`) sa svim zadanim vrijednostima, domenski tipovi (`types.ts`), krivulja sprite-a |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | Paneli bočne trake, vremenska traka, prekrivanja |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | Kartice Analiza utrke i Meč |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Prijevodi |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | Uvidi: detektori, sažetak, komentator, pružatelji UI-ja, leća znanja |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | Masovna analiza mnogo utakmica |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | Volumeni, njihova statistika, izvoz i usporedba |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | Raščlamba i čimbenici |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | Prekrivanje za mnogo utakmica |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | Katalog figura i njegov graditelj |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | Analiza pogodaka (kartica Vozila) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | Ploča taktika |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | Pozadina svijeta |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | Mjerne jedinice |
