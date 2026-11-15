---
title: "Atnaujinimai"
nav_order: 18
lang: "lt"
source: "updates.md"
source_hash: "0d33b694a31d"
translated: true
outdated: false
---

# Atnaujinimai

Peržiūra praneša, kai yra naujesnė versija, ir atsinaujina pati tik tada, kai pasakote taip. Jūsų kompiuteryje nieko nekeičiama be jūsų atsakymo.

## Atnaujinkite peržiūrą {#update-the-viewer}

1. **Puslapyje.** Kai yra naujesnė versija, po pavadinimu šoninės juostos viršuje pasirodo langelis: „Yra naujesnė 3DHeat versija". Spustelėkite **Atnaujinti dabar**. Baigus puslapis persikrauna pats. **Vėliau** paslepia langelį, kol perkrausite puslapį.
2. **Jei rašoma paleisti restart.bat**, uždarykite serverio langą (juodą langą, kurį atidarė `start.bat`) ir du kartus spustelėkite `restart.bat`.
3. **Paleidžiant peržiūrą.** `start.bat` taip pat tikrina. Jei yra naujesnė versija, jis klausia **Atnaujinti dabar? [Y/N]**. Spauskite `Y`, kad atnaujintumėte. Spauskite `N` arba palaukite 60 sekundžių be atsakymo, kad paleistumėte turimą versiją.

![Atnaujinimo pranešimas su Atnaujinti dabar ir Vėliau](../assets/img/lt/updates-notice.webp)

Kopijos su jūsų pakeitimais niekada neatnaujinamos už jus; langelis tik praneša, kad laukia atnaujinimas, ir pataria įrašyti arba paslėpti jūsų pakeitimus bei paleisti `git pull`. Kopija, kuri
nebuvo įdiegta su git (pavyzdžiui, zip failas), nieko nerodo.

Kaip tikrinimas veikia, žingsnis po žingsnio:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## Saugumo taisyklės {#the-safety-rules}

- **Tik pirmyn** (`git pull --ff-only`): atnaujinimas niekada nesulieja, neperkelia ir nieko nepersirašo.
- **Jokių vietinių pakeitimų**: kopija su neįrašytais pakeitimais sekamuose failuose (`git status --porcelain --untracked-files=no` nėra tuščias) niekada neatnaujinama
  automatiškai - kieno nors darbo atnaujinimas neturi teisės perrašyti. Jai tik pranešama, kad laukia atnaujinimas. Nesekami failai (duomenys, eksportai) nelaikomi pakeitimais.
- **Jokių vietinių įrašų**: kopija su įrašais, kurių nėra aukštesniame šaltinyje („išsiskyrusi"), neatnaujinama - tiesiai pirmyn to neužtikrina, o sujungti galima tik
  rankiniu `git pull`. Puslapis ir `start.bat` sako tai tais pačiais žodžiais, o `start.bat` paleidžia turimą versiją.
- **Tik iš pačios svetainės**: serverio atnaujinimo užklausa turi turėti pasirinktinę antraštę ir, kai naršyklė siunčia `Origin`, ji turi ateiti iš serverio
  pačios pagrindinės kompiuterio (žemiau).
- Atnaujinama tik git kopija su aukštesniu šaka; viskas kita (kopija be `.git`, kompiuteryje nėra git, statinė versija) paliekama ramybėje ir nieko nesako.

## Ką daro start.bat {#what-startbat-does}

`start.bat` (du kartus spustelėkite; langas yra serveris) daro, eilės tvarka:

1. Randa Node.js - `PATH` kintamajame, arba `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ar `%LOCALAPPDATA%\Programs\nodejs` - ir, jei jo nėra,
   siūlo jį įdiegti su `winget install -e --id OpenJS.NodeJS.LTS` (klausiama Y/N; po to langą reikia atidaryti iš naujo, kad Windows perskaitytų naują `PATH`).
2. **Atnaujinimai**, kai įdiegtas git ir aplankas turi `.git`:
   - `git fetch --quiet` (be tinklo ar be aukštesniojo šakos: praleidžiama tyliai);
   - skaičiuoja `git rev-list --count HEAD..@{u}`; nieko nėra už jūsų - nieko nesakoma;
   - vietiniai pakeitimai: „Yra naujesnė 3DHeat versija (N pakeitimų), bet šioje kopijoje yra vietinių pakeitimų, todėl ji neatnaujinama. Įrašykite arba paslėpkite juos,
     tada paleiskite git pull." - ir paleidžiama turimą versiją;
   - savi įrašai (`git rev-list --count @{u}..HEAD` nėra 0): „Yra naujesnė 3DHeat versija (N pakeitimų), bet šioje kopijoje yra savų įrašų, kurių naujausia versija neturi,
     todėl ji neatnaujinama. Atnaujinkite ją su git pull." - ir paleidžiama turimą versiją;
   - kitu atveju „Yra naujesnė 3DHeat versija (N pakeitimų)." ir klausimas **Atnaujinti dabar? [Y/N]**. `N` arba jokio atsakymo 60 sekundžių išveda „Neatnaujinta; paleidžiama turima versija." ir
     paleidžiama turima versija. Su `Y`: „Atnaujinama...", nurodo, ar keičiasi `package.json` ar `package-lock.json`,
     paleidžia `git pull --ff-only` (jei ir tada nepavyksta - pvz., tinklas: „Atnaujinimas nepavyko; paleidžiama turima versija."), tada `git submodule update --init`
     (prisegti įrankiai, žr. [Dokumentacijos priežiūra](maintaining.md#the-tools-under-exporters)), tada `npm install`, kai paketo failai pasikeitė ir `node_modules` egzistuoja, ir „Atnaujinta."
3. Neleidžia paleisti antro serverio: kai kas nors jau klauso prievado **5273**, tai pasakoma ir nukreipiama į `restart.bat` / `stop.bat`.
4. Pirmą kartą paleidus (nėra `node_modules`), klausia prieš atsisiunčiant priklausomybes (apie 300 MB į `node_modules\`, nieko sistemoje).
5. Paleidžia kūrimo serverį `127.0.0.1:5273` (`--strictPort`) ir, kai jis pasiruošęs, atidaro naršyklę.

`restart.bat` sustabdo serverį (pagal prievadą) ir paleidžia `start.bat` iš naujo, todėl klausia to paties klausimo. `stop.bat` tik sustabdo.

## Kūrėjams {#for-developers}

### Kol veikia: atnaujinimo kelias {#while-it-runs-the-update-route}

Kūrimo serveris (Vite įskiepis `heat3d-self-update` faile `vite.config.ts`) teikia `/__heat3d/update`. Jis egzistuoja tik kūrimo serveryje - ne statinėje versijoje
ir ne `vite preview`.

**`GET /__heat3d/update`** atsako, ar kopija atsilieka:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, kai aplankas nėra git kopija;
- paleidžia `git fetch --quiet` **ne dažniau kaip kas 30 minučių** (užklausos tarp tų kartų atsakomos pagal paskutinį atsisiuntimą);
- `behind` / `ahead` iš `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` iš `git status --porcelain --untracked-files=no`, `latest` - aukštesniojo naujausio įrašo tema;
- jei aukštesniojo šakos nėra, `upstream: null` ir `behind: 0`.

**`POST /__heat3d/update/apply`** atnaujina kopiją:

1. Atmetama su `403 { ok: false, reason: "forbidden" }`, nebent užklausa turi antraštę `X-Heat3d-Update: 1` ir, kai ji turi `Origin`, tos kilmės host yra užklausos `Host`. Tarpsvetainė forma negali
   siųsti pasirinktinės antraštės be CORS preflight, kurio šis serveris niekada neduoda.
2. Nieko daryti nereikia (ne kopija, nėra aukštesniojo, neatsilieka): `{ ok: true, updated: false }`.
3. Vietiniai pakeitimai: `{ ok: false, reason: "dirty" }`; vietiniai įrašai: `{ ok: false, reason: "diverged" }`.
4. Kitu atveju: nurodo keičiamus failus (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (2 min. laiko riba), `git submodule update --init`
   (klaida ignoruojama), `npm install`, kai pasikeitė `package.json` ar `package-lock.json` (15 min. laiko riba), ir atsako
   `{ ok: true, updated: true, restart }` - `restart` paaiškina, kodėl veikiantis serveris negali pritaikyti atnaujinimo: `"dependencies"`, kai jos buvo iš naujo įdiegtos,
   `"config"`, kai pasikeitė tik `vite.config` failas, `false`, kai perkrovimo nereikia.
5. Nepavykusi git ar npm komanda atsako `{ ok: false, reason: "<klaida, iki 300 simbolių>" }`.

Atsakymai yra JSON su `Cache-Control: no-store`. Serveris klauso tik `127.0.0.1`, todėl maršrutas nepasiekiamas iš tinklo.

### Pranešimas puslapyje {#the-notice-in-the-page}

`UpdateBanner`, po pavadinimu šoninės juostos viršuje:

- Jis klausia maršruto **4 sekundes** po puslapio įkėlimo (ne pirmomis sekundėmis: puslapis dar turi įkelti duomenis ir paleisti GPU) ir vėl
  **kas 6 valandas**, kol puslapis atviras.
- Jis **nieko** nerodo, kai tokio maršruto nėra (statinė versija), aplankas nėra kopija arba niekas nėra naujesnio - pranešimas kiekvieno paleidimo metu
  yra toks, kurį žmonės išmoksta ignoruoti.
- Atsilieka, be vietinių pakeitimų: „Yra naujesnė 3DHeat versija (N pakeitimų, naujausias: <tema>)." su **Atnaujinti dabar** ir **Vėliau**
  (*Vėliau* paslepia, kol puslapis perkraunamas).
- Atsilieka, su vietiniais pakeitimais: tas pats sakinys ir „Ši kopija turi vietinių pakeitimų, todėl ji neatnaujinama automatiškai; įrašykite arba paslėpkite juos,
  tada paleiskite git pull." - be mygtuko.
- **Atnaujinti dabar** siunčia į `/apply` („Atnaujinama..."). Tada:
  - „Atnaujinta. Puslapis persikrauna." - ir jis persikrauna po 1,5 s (serveris jau teikia naujus failus);
  - kai priklausomybės buvo iš naujo įdiegtos: „Atnaujinta. Jos priklausomybės pasikeitė: uždarykite serverio langą ir paleiskite **restart.bat**, kad baigtumėte.";
  - kai pasikeitė tik serverio nustatymai: „Atnaujinta. Jo serverio nustatymai pasikeitė: uždarykite serverio langą ir paleiskite **restart.bat**, kad baigtumėte.";
  - galiausiai nieko atnaujinti nereikia (`updated: false` - kopija tuo metu jau atnaujinta, pavyzdžiui, `start.bat`): „Nėra ką atnaujinti: ši kopija jau naujausia versija." - ir puslapis nepersikrauna;
  - atmesta: *dirty* sakinys, arba „Ši kopija turi savų įrašų, kurių naujausia versija neturi; atnaujinkite ją su git pull.", arba „Atnaujinimas nepavyko: <priežastis>".

