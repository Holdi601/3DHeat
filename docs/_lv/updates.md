---
title: "Atjauninājumi"
nav_order: 21
lang: "lv"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Atjauninājumi

Skatītājs jums paziņo, kad ir jaunāka versija, un atjaunina sevi tikai tad, kad sakāt jā. Jūsu datorā nekas netiek mainīts bez jūsu atbildes.

## Atjauniniet skatītāju {#update-the-viewer}

1. **Lapā.** Kad ir jaunāka versija, zem nosaukuma sānjoslas augšdaļā parādās lodziņš: "Pieejama jaunāka 3DHeat versija". Noklikšķiniet uz **Atjaunināt tagad**. Lapa pati pārlādējas, kad tas ir pabeigts. **Vēlāk** paslēpj lodziņu, līdz pārlādējat lapu.
2. **Ja tiek teikts palaist restart.bat**, aizveriet servera logu (melno logu, ko atvēra `start.bat`) un divreiz noklikšķiniet uz `restart.bat`.
3. **Kad palaižat skatītāju.** `start.bat` arī pārbauda. Ja ir jaunāka versija, tas jautā **Atjaunināt tagad? [Y/N]**. Nospiediet `Y`, lai atjauninātu. Nospiediet `N` vai pagaidiet 60 sekundes bez atbildes, lai palaistu versiju, kas jums ir.

![Atjauninājuma paziņojums ar Atjaunināt tagad un Vēlāk](../assets/img/lv/updates-notice.webp)

Kopija ar jūsu pašu izmaiņām nekad netiek atjaunināta automātiski; lodziņš tikai saka, ka atjauninājums gaida, un liek saglabāt vai paslēpt izmaiņas un palaist `git pull`. Kopija, kas nav instalēta ar git (piemēram, zip fails), nerāda neko.

Kā pārbaude darbojas, soli pa solim:

```
lapa ---(pēc 4 s, tad ik pēc 6 h)---> izstrādes serveris ---> git fetch
   aiz?  nē  -> nekas netiek rādīts
         jā  -> jūsu pašu izmaiņas vai commit?  jā  -> tikai jums paziņo
                                                nē  -> [Atjaunināt tagad] -> git pull
                                                       -> pārlādēt vai "palaist restart.bat"
```

## Drošības noteikumi {#the-safety-rules}

- **Tikai uz priekšu** (`git pull --ff-only`): atjauninājums nekad nesapludina, nepārbāzē un nepārraksta neko.
- **Nav lokālu izmaiņu**: kopija ar nesaglabātām izmaiņām izsekotajos failos (`git status --porcelain --untracked-files=no` nav tukšs) nekad netiek atjaunināta automātiski - cilvēka paša darbs nav atjauninājuma pārrakstāms. Tai tikai saka, ka atjauninājums gaida. Neizsekotie faili (dati, eksporti) nav izmaiņas.
- **Nav lokālu commit**: kopija ar commit, kādu augšupējais zars nemaz nav ("atšķirīga"), netiek atjaunināta - uz priekšu nevar to vest, un sapludināšana ir `git pull` darbs ar roku. Lapa un `start.bat` to saka vienos vārdos, un `start.bat` palaiž pieejamo versiju.
- **Tikai no pašas lapas**: izstrādes servera atjaunināšanas pieprasījumam jānes pielāgota galvene, un, ja pārlūks sūta `Origin`, tam jānāk no servera pašu hosta (zemāk).
- Atjaunina tikai git kopiju ar augšupējo zaru; viss pārējais (kopija bez `.git`, nav git, statisks build) tiek atstāts neskarts un neko neteic.

## Ko dara start.bat {#what-startbat-does}

`start.bat` (divreiz noklikšķiniet; logs ir serveris) dara, pēc kārtas:

1. Atrod Node.js - `PATH` vai `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` vai `%LOCALAPPDATA%\Programs\nodejs` - un, ja tā nav, piedāvā to instalēt ar `winget install -e --id OpenJS.NodeJS.LTS` (jautā, Y/N; pēc tam logs jāatver atkal, lai Windows paņem jauno `PATH`).
2. **Atjauninājumi**, ja git ir instalēts un mapē ir `.git`:
   - `git fetch --quiet` (nav tīkla vai augšupējā zara: klusi izlaists);
   - saskaita `git rev-list --count HEAD..@{u}`; nav aiz: nekas netiek teikts;
   - lokālas izmaiņas: "Pieejama jaunāka 3DHeat versija (N izmaiņas), bet šai kopijai ir lokālas izmaiņas, tāpēc tā netiek atjaunināta. Saglabājiet vai paslēpiet tās un palaidiet git pull." - un tiek palaista pieejamā versija;
   - paša commit (`git rev-list --count @{u}..HEAD` nav 0): "Pieejama jaunāka 3DHeat versija (N izmaiņas), bet šai kopijai ir paša commit, kurus jaunākā versija nesatur, tāpēc tā netiek atjaunināta. Atjauniniet to ar git pull." - un tiek palaista pieejamā versija;
   - citādi "Pieejama jaunāka 3DHeat versija (N izmaiņas)." un jautājums **Atjaunināt tagad? [Y/N]**. `N` vai nekāda atbilde 60 sekundes laikā izdrukā "Nav atjaunināts; tiek palaista versija, kas jums ir." un palaiž pieejamo versiju. Ar `Y`: "Atjaunina...", norāda, vai mainās `package.json` vai `package-lock.json`, palaiž `git pull --ff-only` (ja tas vēl neizdodas - piemēram, tīkla dēļ: "Atjauninājums neizdevās; tiek palaista versija, kas jums ir."), tad `git submodule update --init` (piespraustie rīki, skatiet [Dokumentācijas uzturēšana](maintaining.md#the-tools-under-exporters)), tad `npm install`, ja paketes faili ir mainījušies un `node_modules` eksistē, un "Atjaunināts."
3. Neļauj palaist otru serveri: ja portā **5273** kaut kas jau klausās, tas to saka un norāda uz `restart.bat` / `stop.bat`.
4. Pirmajā palaišanā (nav `node_modules`) jautā, pirms lejupielādē atkarības (apmēram 300 MB mapē `node_modules\`, nekas nav instalēts sistēmā).
5. Palaiž izstrādes serveri `127.0.0.1:5273` (`--strictPort`) un, kad tas ir gatavs, atver pārlūku.

`restart.bat` aptur serveri (pēc porta) un palaiž `start.bat` vēlreiz, tāpēc tas jautā to pašu jautājumu. `stop.bat` tikai aptur.

## Izstrādātājiem {#for-developers}

### Kamēr tas darbojas: atjaunināšanas maršruts {#while-it-runs-the-update-route}

Izstrādes serveris (Vite spraudnis `heat3d-self-update` `vite.config.ts`) apkalpo `/__heat3d/update`. Tas pastāv tikai izstrādes serverī - ne statiskā build un ne `vite preview`.

**`GET /__heat3d/update`** atbild, vai kopija ir aiz:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, kad mape nav git kopija;
- tas palaiž `git fetch --quiet` **ne biežāk kā ik pēc 30 minūtēm** (pieprasījumi starpā atbild no pēdējā fetch);
- `behind` / `ahead` no `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` no `git status --porcelain --untracked-files=no`, `latest` augšupējā jaunākā commit tēma;
- bez augšupējā zara `upstream: null` un `behind: 0`.

**`POST /__heat3d/update/apply`** atjauno kopiju:

1. Noraidīts ar `403 { ok: false, reason: "forbidden" }`, ja pieprasījumam nav galvenes `X-Heat3d-Update: 1` un, ja tam ir `Origin`, tā hosts nav pieprasījuma `Host`. Starpvietņu forma bez CORS preflight nevar nosūtīt pielāgotu galveni, un šis serveris to nekad nedod.
2. Nav ko darīt (nav kopija, nav augšupējā, nav aiz): `{ ok: true, updated: false }`.
3. Lokālas izmaiņas: `{ ok: false, reason: "dirty" }`; lokāli commit: `{ ok: false, reason: "diverged" }`.
4. Citādi: atzīmē mainītos failus (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (2 min taimauts), `git submodule update --init` (kļūda ignorēta), `npm install`, ja mainījās `package.json` vai `package-lock.json` (15 min taimauts), un atbild `{ ok: true, updated: true, restart }` - `restart` saka, kāpēc darbojošais serveris nevar paņemt atjauninājumu: `"dependencies"`, kad tās tika pārinstalētas, `"config"`, kad mainījās tikai `vite.config` fails, `false`, kad restarts nav vajadzīgs.
5. Neizdevusies git vai npm komanda atbild `{ ok: false, reason: "<kļūda, līdz 300 rakstzīmēm>" }`.

Atbildes ir JSON ar `Cache-Control: no-store`. Serveris klausās tikai `127.0.0.1`, tāpēc maršruts nav sasniedzams no tīkla.

### Paziņojums lapā {#the-notice-in-the-page}

`UpdateBanner`, zem nosaukuma sānjoslas augšdaļā:

- Tas jautā pēc **4 sekundēm** pēc lapas ielādes (ne pirmajās sekundēs: lapai ir datu kopa, ko ielādēt, un GPU, ko palaist) un atkal **ik pēc 6 stundām**, kamēr lapa paliek atvērta.
- Tas **neko nerāda**, ja maršruta nav (statisks build), mape nav kopija, vai nekas nav jaunāks - paziņojums katrā startā ir tāds, ko cilvēki iemācās ignorēt.
- Aiz, bez lokālām izmaiņām: "Pieejama jaunāka 3DHeat versija (N izmaiņas, jaunākā: <tēma>)." ar **Atjaunināt tagad** un **Vēlāk** (*Vēlāk* paslēpj līdz lapas pārlādēšanai).
- Aiz, ar lokālām izmaiņām: tas pats teikums un "Šai kopijai ir lokālas izmaiņas, tāpēc tā netiek atjaunināta automātiski; saglabājiet vai paslēpiet tās un palaidiet git pull." - bez pogas.
- **Atjaunināt tagad** nosūta uz `/apply` ("Atjaunina..."). Tad:
  - "Atjaunināts. Lapa tiek pārlādēta." - un pārlādē pēc 1,5 s (serveris jau pasniedz jaunos failus);
  - kad atkarības tika pārinstalētas: "Atjaunināts. Tā atkarības mainījās: aizveriet servera logu un palaidiet **restart.bat**, lai pabeigtu.";
  - kad mainījās tikai servera iestatījumi: "Atjaunināts. Tā servera iestatījumi mainījās: aizveriet servera logu un palaidiet **restart.bat**, lai pabeigtu.";
  - galu galā nav ko ienest (`updated: false` - kopiju jau atjaunoja, piemēram, `start.bat`): "Nav ko atjaunināt: šī kopija jau ir jaunākā versija." - un bez pārlādes;
  - noraidīts: teikums par lokālām izmaiņām, vai "Šai kopijai ir paša commit, kurus jaunākā versija nesatur; atjauniniet to ar git pull.", vai "Atjauninājums neizdevās: <iemesls>".
