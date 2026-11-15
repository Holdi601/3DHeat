---
title: "Ažuriranja"
nav_order: 21
lang: "bs"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Ažuriranja

Prikazivač vam kaže kada postoji novija verzija, i ažurira se sam samo ako kažete da. Ništa se ne mijenja na vašem računaru bez vašeg odgovora.

## Ažurirajte prikazivač {#update-the-viewer}

1. **Na stranici.** Kada postoji novija verzija, pojavi se okvir ispod imena na vrhu bočne trake: „Dostupna je novija verzija programa 3DHeat”. Kliknite **Ažuriraj sada**. Stranica se sama ponovo učitava kada se završi. **Kasnije** sakriva okvir dok ne ponovo učitate stranicu.
2. **Ako kaže da pokrenete restart.bat**, zatvorite prozor servera (crni prozor koji je otvorio `start.bat`) i dvaput kliknite `restart.bat`.
3. **Kada pokrenete prikazivač.** I `start.bat` provjerava. Ako postoji novija verzija, pita **Ažurirati sada? [Y/N]**. Pritisnite `Y` za ažuriranje. Pritisnite `N`, ili sačekajte 60 sekundi bez odgovora, da pokrenete verziju koju imate.

![Obavijest o ažuriranju s dugmadima Ažuriraj sada i Kasnije](../assets/img/bs/updates-notice.webp)

Kopija s vašim sopstvenim izmjenama nikada se ne ažurira za vas; okvir samo kaže da čeka ažuriranje i traži da sačuvate ili odložite svoje izmjene i pokrenete `git pull`. Kopija koja nije instalirana preko gita (recimo zip datoteka) ne prikazuje ništa.

Kako provjera radi, korak po korak:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## Pravila sigurnosti {#the-safety-rules}

- **Samo unaprijed (fast-forward)** (`git pull --ff-only`): ažuriranje nikada ništa ne spaja, ne prepisuje i ne piše preko.
- **Nema lokalnih izmjena**: checkout s nesačuvanim izmjenama u praćenim datotekama (`git status --porcelain --untracked-files=no` nije prazno) nikada se ne ažurira automatski - tuđi rad nije nešto što ažuriranje sme da prepiše. Samo se javlja da ažuriranje čeka. Nepraćene datoteke (podaci, izvozi) se ne računaju kao izmjene.
- **Nema lokalnih commit-a**: checkout s commit-ima koje uzvodna grana nema („razišao se”) se ne ažurira - unaprijed ga ne može dovesti, a spajanje je za `git pull` ručno. Stranica i `start.bat` oboje to kažu istim riječima, a `start.bat` pokreće verziju koja je tu.
- **Samo sa same stranice**: zahtjev dev servera za ažuriranje mora nositi posebno zaglavlje i, kada šalje `Origin`, doći s hosta samog servera (dole).
- Ažurira se samo git checkout s uzvodnom granom; sve ostalo (kopija bez `.git`, bez instaliranog gita, statički build) ostaje netaknuto i ništa ne kaže.

## Šta radi start.bat {#what-startbat-does}

`start.bat` (dvaput kliknite; prozor je server) radi, redom:

1. Pronalazi Node.js - u `PATH`-u, inače u `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ili `%LOCALAPPDATA%\Programs\nodejs` - i nudi da ga instalira komandom `winget install -e --id OpenJS.NodeJS.LTS` kada nedostaje (pita, Y/N; poslije se prozor mora ponovo otvoriti da Windows pokupi novi `PATH`).
2. **Ažuriranja**, kada je git instaliran i fascikla ima `.git`:
   - `git fetch --quiet` (bez mreže ili uzvodne grane: tiho preskače);
   - broji `git rev-list --count HEAD..@{u}`; ništa iza: ništa se ne kaže;
   - lokalne izmjene: „Dostupna je novija verzija programa 3DHeat (N izmjena), ali ova kopija ima lokalne izmjene, pa se ne ažurira. Sačuvajte ili odložite ih, zatim pokrenite git pull.” - i pokreće verziju koja je tu;
   - sopstveni commit-i (`git rev-list --count @{u}..HEAD` nije 0): „Dostupna je novija verzija programa 3DHeat (N izmjena), ali ova kopija ima sopstvene commit-e koje najnovija verzija nema, pa se ne ažurira. Ažurirajte je komandom git pull.” - i pokreće verziju koja je tu;
   - inače „Dostupna je novija verzija programa 3DHeat (N izmjena).” i pitanje **Ažurirati sada? [Y/N]**. `N`, ili bez odgovora 60 sekundi, ispisuje „Nije ažurirano; pokreće se verzija koju imate.” i pokreće verziju koja je tu. Na `Y`: „Ažuriram...”, napominje da li se mijenjaju `package.json` ili `package-lock.json`, pokreće `git pull --ff-only` (ako i to ne uspije - recimo zbog mreže: „Ažuriranje nije uspjelo; pokreće se verzija koju imate.”), zatim `git submodule update --init` (fiksirani alati, vidi [Održavanje dokumentacije](maintaining.md#the-tools-under-exporters)), zatim `npm install` kada su se datoteke paketa promijenile i postoji `node_modules`, i „Ažurirano.”
3. Odbija da pokrene drugi server: kada nešto već sluša port **5273**, to kaže i upućuje na `restart.bat` / `stop.bat`.
4. Pri prvom pokretanju (nema `node_modules`), pita prije preuzimanja zavisnosti (oko 300 MB u `node_modules\`, ništa na nivou sistema).
5. Pokreće dev server na `127.0.0.1:5273` (`--strictPort`) i otvara preglednik kada je spreman.

`restart.bat` zaustavlja server (po portu) i ponovo pokreće `start.bat`, pa postavlja isto pitanje. `stop.bat` samo zaustavlja.

## Za programere {#for-developers}

### Dok radi: ruta ažuriranja {#while-it-runs-the-update-route}

Razvojni server (Vite dodatak `heat3d-self-update` u `vite.config.ts`) poslužuje `/__heat3d/update`. Postoji samo na razvojnom serveru - ne u statičkom buildu i ne u `vite preview`.

**`GET /__heat3d/update`** odgovara da li je checkout iza:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` kada mapa nije git checkout;
- pokreće `git fetch --quiet` **najviše svakih 30 minuta** (zahtjevi između dobijaju odgovor iz posljednjeg dohvaćanja);
- `behind` / `ahead` iz `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` iz `git status --porcelain --untracked-files=no`, `latest` je naslov najnovijeg commita uzvodne grane;
- bez uzvodne grane, `upstream: null` i `behind: 0`.

**`POST /__heat3d/update/apply`** dovodi checkout u red:

1. Odbija se s `403 { ok: false, reason: "forbidden" }` osim ako zahtjev nema zaglavlje `X-Heat3d-Update: 1` i, kad nosi `Origin`, host tog izvora nije `Host` zahtjeva. Forma s drugog sajta ne može poslati prilagođeno zaglavlje bez CORS preflighta, a ovaj server ga nikad ne odobrava.
2. Nema šta da se radi (nije checkout, nema uzvodne grane, nije iza): `{ ok: true, updated: false }`.
3. Lokalne izmjene: `{ ok: false, reason: "dirty" }`; lokalni commit-i: `{ ok: false, reason: "diverged" }`.
4. Inače: bilježi koje se datoteke mijenjaju (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (vremensko ograničenje 2 min), `git submodule update --init` (greška se zanemaruje), `npm install` kada se promijene `package.json` ili `package-lock.json` (vremensko ograničenje 15 min), i odgovara `{ ok: true, updated: true, restart }` - `restart` kaže zašto pokrenuti server ne može preuzeti ažuriranje: `"dependencies"` kada su ponovo instalirane, `"config"` kada se promijenila samo datoteka `vite.config`, `false` kada ponovno pokretanje nije potrebno.
5. Neuspjela git ili npm komanda odgovara `{ ok: false, reason: "<greška, do 300 znakova>" }`.

Odgovori su JSON s `Cache-Control: no-store`. Server sluša samo na `127.0.0.1`, pa ruta nije dostupna s mreže.

### Obavijest na stranici {#the-notice-in-the-page}

`UpdateBanner`, ispod imena na vrhu bočne trake:

- Traži rutu **4 sekunde** nakon učitavanja stranice (ne u prvim sekundama: stranica ima skup podataka za učitavanje i GPU za pokretanje), pa ponovo **svakih 6 sati** dok stranica ostaje otvorena.
- Ne prikazuje **ništa** kada takve rute nema (statički build), mapa nije checkout, ili ništa nije novije - obavijest na svakom pokretanju je ona na koju ljudi nauče da ne obraćaju pažnju.
- Iza, bez lokalnih izmjena: „Dostupna je novija verzija programa 3DHeat (N izmjena, najnovija: <naslov>).” uz **Ažuriraj sada** i **Kasnije** (*Kasnije* sakriva je dok se stranica ponovo ne učita).
- Iza, s lokalnim izmjenama: ista rečenica i „Ova kopija ima lokalne izmjene, pa se ne ažurira automatski; sačuvajte ili odložite ih, zatim pokrenite git pull.” - bez dugmeta.
- **Ažuriraj sada** šalje na `/apply` („Ažuriram...”). Zatim:
  - „Ažurirano. Stranica se ponovo učitava.” - i učita se 1,5 s kasnije (server već služi nove datoteke);
  - kada su zavisnosti ponovo instalirane: „Ažurirano. Zavisnosti su se promijenile: zatvorite prozor servera i pokrenite **restart.bat** da završite.”;
  - kada su se promijenile samo postavke servera: „Ažurirano. Postavke servera su se promijenile: zatvorite prozor servera i pokrenite **restart.bat** da završite.”;
  - ipak nema šta da se preuzme (`updated: false` - kopija je u međuvremenu dovedena u red, recimo od strane `start.bat`): „Nema šta da se ažurira: ova kopija je već najnovija verzija.” - i nema ponovnog učitavanja;
  - odbijeno: rečenica o lokalnim izmjenama, ili „Ova kopija ima sopstvene commit-e koje najnovija verzija nema; ažurirajte je komandom git pull.”, ili „Ažuriranje nije uspjelo: <razlog>”.
