---
title: "Updates"
nav_order: 18
lang: "nl"
source: "updates.md"
source_hash: "0d33b694a31d"
translated: true
outdated: false
---

# Updates

De viewer laat je weten wanneer er een nieuwere versie is, en werkt zichzelf alleen bij als je ja zegt. Er wordt niets op je computer veranderd zonder je antwoord.

## De viewer bijwerken {#update-the-viewer}

1. **In de pagina.** Als er een nieuwere versie is, verschijnt er een vak onder de naam bovenaan de zijbalk: "Er is een nieuwere versie van 3DHeat beschikbaar". Klik op **Nu bijwerken**. De pagina laadt zichzelf opnieuw als het klaar is. **Later** verbergt het vak tot je de pagina opnieuw laadt.
2. **Als er staat dat je restart.bat moet uitvoeren**, sluit je het servervenster (het zwarte venster dat `start.bat` opende) en dubbelklik je op `restart.bat`.
3. **Wanneer je de viewer start.** `start.bat` controleert ook. Als er een nieuwere versie is, vraagt het **Nu bijwerken? [Y/N]**. Druk op `Y` om bij te werken. Druk op `N`, of wacht 60 seconden zonder te antwoorden, om de versie te starten die je hebt.

![De melding over een update met Nu bijwerken en Later](../assets/img/nl/updates-notice.webp)

Een kopie met eigen wijzigingen wordt nooit voor je bijgewerkt; het vak zegt alleen dat er een update klaarstaat, en vraagt je je wijzigingen vast te leggen of weg te zetten en `git pull` uit te voeren. Een kopie die niet met git is geïnstalleerd (bijvoorbeeld een zipbestand) toont niets.

Hoe de controle werkt, stap voor stap:

```
pagina ---(na 4 s, daarna elke 6 u)---> dev-server ---> git fetch
   achter?  nee  -> er wordt niets getoond
            ja   -> eigen wijzigingen of commits?  ja  -> alleen melden
                                                   nee -> [Nu bijwerken] -> git pull
                                                        -> opnieuw laden, of "voer restart.bat uit"
```

## De veiligheidsregels {#the-safety-rules}

- **Alleen vooruit** (`git pull --ff-only`): een update voegt nooit samen,
  herbasiseert of herschrijft iets.
- **Geen lokale wijzigingen**: een kopie met niet-vastgelegde wijzigingen in
  gevolgde bestanden (`git status --porcelain --untracked-files=no` is niet leeg)
  wordt nooit automatisch bijgewerkt - andermans eigen werk is niet aan een update
  om te overschrijven. Die krijgt alleen te horen dat er een update klaarstaat.
  Niet-gevolgde bestanden (data, exports) tellen niet als wijzigingen.
- **Geen lokale commits**: een kopie met commits die de upstream niet heeft
  ("gedivergeerd") wordt niet bijgewerkt - een vooruitspoeling kan die niet
  bijbrengen, en samenvoegen is voor `git pull` met de hand. De pagina en
  `start.bat` zeggen dat in dezelfde woorden, en `start.bat` start de versie die
  er is.
- **Alleen vanaf de pagina zelf**: het updateverzoek van de dev-server moet een
  eigen header meesturen en, als de browser een `Origin` stuurt, afkomstig zijn van
  de eigen host van de server (hieronder).
- Alleen een git-kopie met een upstream-branch wordt ooit bijgewerkt; al het andere
  (een kopie zonder `.git`, geen git geïnstalleerd, een statische build) blijft
  ongemoeid en zegt niets.

## Wat start.bat doet {#what-startbat-does}

`start.bat` (dubbelklik erop; het venster is de server) doet, in deze volgorde:

1. Zoekt Node.js - in `PATH`, anders in `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` of `%LOCALAPPDATA%\Programs\nodejs` - en biedt aan
   het te installeren met `winget install -e --id OpenJS.NodeJS.LTS` als het
   ontbreekt (gevraagd, J/N; daarna moet het venster opnieuw geopend worden zodat
   Windows het nieuwe `PATH` oppikt).
2. **Updates**, als git geïnstalleerd is en de map `.git` heeft:
   - `git fetch --quiet` (geen netwerk of geen upstream: stil overgeslagen);
   - telt `git rev-list --count HEAD..@{u}`; niets achter: er wordt niets gezegd;
   - lokale wijzigingen: "A newer version of 3DHeat is available (N changes), but
     this copy has local changes, so it is not updated. Commit or stash them,
     then run git pull." - en het start de versie die er is;
   - eigen commits (`git rev-list --count @{u}..HEAD` is niet 0): "A newer
     version of 3DHeat is available (N changes), but this copy has commits of
     its own that the newest version does not, so it is not updated. Update it
     with git pull." - en het start de versie die er is;
   - anders "A newer version of 3DHeat is available (N changes)." en de vraag **Update now? [Y/N]**. `N`, of geen antwoord binnen 60 seconden, print "Not updated; starting the version you have." en start de versie die er is. Bij `Y`: "Updating...", meldt of `package.json` of `package-lock.json` wijzigt,
     voert `git pull --ff-only` uit (mocht dat nog steeds mislukken - het netwerk, bijvoorbeeld:
     "The update did not go through; starting the version you have."), dan `git submodule update --init`
     (de vastgezette hulpmiddelen, zie [De documentatie onderhouden](maintaining.md#the-tools-under-exporters)), dan `npm install` als de pakketbestanden wijzigden en
     `node_modules` bestaat, en "Updated."
3. Weigert een tweede server te starten: als er al iets op poort **5273** luistert, zegt het dat en wijst naar `restart.bat` / `stop.bat`.
4. Bij de eerste keer (geen `node_modules`) vraagt het voordat de afhankelijkheden gedownload worden (ongeveer 300 MB in `node_modules\`, niets systeembreed).
5. Start de dev-server op `127.0.0.1:5273` (`--strictPort`) en opent de browser als hij klaar is.

`restart.bat` stopt de server (op poort) en voert `start.bat` opnieuw uit, dus het stelt dezelfde vraag. `stop.bat` stopt alleen.


## Voor ontwikkelaars {#for-developers}

### Terwijl het draait: de updateroute {#while-it-runs-the-update-route}

De dev-server (Vite-plugin `heat3d-self-update` in `vite.config.ts`) levert
`/__heat3d/update`. Die bestaat alleen op de dev-server - niet in een statische build
en niet in `vite preview`.

**`GET /__heat3d/update`** antwoordt of de kopie achterloopt:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "het onderwerp van de nieuwste commit" }
```

- `checkout: false` als de map geen git-kopie is;
- het voert `git fetch --quiet` uit **hoogstens elke 30 minuten** (verzoeken daartussen antwoorden met wat het laatst opgehaald werd);
- `behind` / `ahead` uit `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`,
  `dirty` uit `git status --porcelain --untracked-files=no`, `latest` het onderwerp
  van de nieuwste commit van de upstream;
- zonder upstream-branch: `upstream: null` en `behind: 0`.

**`POST /__heat3d/update/apply`** brengt de kopie up-to-date:

1. Geweigerd met `403 { ok: false, reason: "forbidden" }` tenzij het verzoek de header
   `X-Heat3d-Update: 1` heeft en, als het een `Origin` meestuurt, de host van die
   origin gelijk is aan de `Host` van het verzoek. Een cross-site formulier kan geen
   eigen header meesturen zonder een CORS-preflight, die deze server nooit geeft.
2. Niets te doen (geen kopie, geen upstream, niet achter):
   `{ ok: true, updated: false }`.
3. Lokale wijzigingen: `{ ok: false, reason: "dirty" }`; lokale commits:
   `{ ok: false, reason: "diverged" }`.
4. Anders: noteert de bestanden die veranderen (`git diff --name-only HEAD @{u}`),
   `git pull --ff-only` (time-out van 2 min), `git submodule update --init`
   (fout genegeerd), `npm install` als `package.json` of `package-lock.json`
   veranderd is (time-out van 15 min), en antwoordt
   `{ ok: true, updated: true, restart }` - `restart` zegt waarom de draaiende
   server de update niet kan oppikken: `"dependencies"` als ze opnieuw geïnstalleerd
   zijn, `"config"` als alleen een `vite.config`-bestand veranderde, `false` als er
   niets opnieuw gestart hoeft te worden.
5. Een mislukkend git- of npm-commando antwoordt `{ ok: false, reason: "<de fout,
   tot 300 tekens>" }`.

Antwoorden zijn JSON met `Cache-Control: no-store`. De server luistert alleen op
`127.0.0.1`, dus de route is niet vanaf het netwerk bereikbaar.

### De melding in de pagina {#the-notice-in-the-page}

`UpdateBanner`, onder de naam bovenaan de zijbalk:

- Het vraagt de route **4 seconden** nadat de pagina geladen is (niet in de eerste
  seconden: de pagina heeft een dataset om te laden en een GPU om te starten) en
  opnieuw **elke 6 uur** zolang de pagina open blijft.
- Het toont **niets** als er geen zo'n route is (een statische build), de map geen
  kopie is, of niets nieuwer is - een melding bij elke start is iets wat mensen leren
  negeren.
- Achter, zonder lokale wijzigingen: "Er is een nieuwere versie van 3DHeat beschikbaar
  (N wijzigingen, de nieuwste: <onderwerp>)." met **Nu bijwerken** en **Later**
  (*Later* verbergt het tot de pagina opnieuw geladen wordt).
- Achter, met lokale wijzigingen: dezelfde zin en "Deze kopie heeft lokale
  wijzigingen en wordt daarom niet automatisch bijgewerkt; leg ze vast of zet ze
  weg, en voer daarna git pull uit." - zonder knop.
- **Nu bijwerken** post naar `/apply` ("Bijwerken..."). Daarna:
  - "Bijgewerkt. De pagina wordt opnieuw geladen." - en hij laadt 1,5 s later
    opnieuw (de server levert de nieuwe bestanden al);
  - als de afhankelijkheden opnieuw geïnstalleerd zijn: "Bijgewerkt. De
    afhankelijkheden zijn veranderd: sluit het servervenster en voer **restart.bat**
    uit om af te ronden.";
  - als alleen de instellingen van de server veranderden: "Bijgewerkt. De
    serverinstellingen zijn veranderd: sluit het servervenster en voer **restart.bat**
    uit om af te ronden.";
  - uiteindelijk niets om binnen te halen (`updated: false` - de kopie is inmiddels
    bijgewerkt, door `start.bat` bijvoorbeeld): "Niets om bij te werken: deze kopie is
    al de nieuwste versie." - en geen herlading;
  - geweigerd: de zin over *dirty*, of "Deze kopie heeft eigen commits die de nieuwste
    versie niet heeft; werk hem bij met git pull.", of "De update is niet gelukt:
    <reden>".
