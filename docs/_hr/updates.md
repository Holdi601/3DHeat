---
title: "Ažuriranja"
nav_order: 21
lang: "hr"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Ažuriranja

Preglednik vam javlja kad postoji novija verzija, a ažurira se sam tek kad to potvrdite. Ništa se na vašem računalu ne mijenja bez vašeg odgovora.

## Ažuriranje preglednika {#update-the-viewer}

1. **Na stranici.** Kad postoji novija verzija, pod nazivom na vrhu bočne trake pojavljuje se okvir: „Dostupna je novija verzija 3DHeat-a”. Kliknite **Ažuriraj sada**. Stranica se sama ponovno učitava kad je gotovo. **Kasnije** skriva okvir dok ponovno ne učitate stranicu.
2. **Ako piše da pokrenete restart.bat**, zatvorite prozor poslužitelja (crni prozor koji je otvorio `start.bat`) i dvaput kliknite `restart.bat`.
3. **Pri pokretanju preglednika.** `start.bat` također provjerava. Ako postoji novija verzija, pita **Ažurirati sada? [Y/N]**. Pritisnite `Y` za ažuriranje. Pritisnite `N`, ili pričekajte 60 sekundi bez odgovora, da pokrenete verziju koju imate.

![Obavijest o ažuriranju s gumbima Ažuriraj sada i Kasnije](../assets/img/hr/updates-notice.webp)

Primjerak s vašim vlastitim promjenama nikad se ne ažurira umjesto vas; okvir samo kaže da čeka ažuriranje i traži da spremite ili odložite svoje promjene te pokrenete `git pull`. Primjerak koji nije instaliran gitom (na primjer zip datoteka) ne prikazuje ništa.

Kako provjera radi, korak po korak:

```
stranica ---(nakon 4 s, zatim svakih 6 h)---> razvojni poslužitelj ---> git fetch
   iza?  ne  -> ništa se ne prikazuje
         da  -> vaše promjene ili commitovi?  da -> samo javi
                                              ne -> [Ažuriraj sada] -> git pull
                                                    -> ponovno učitavanje, ili "pokrenite restart.bat"
```

## Sigurnosna pravila {#the-safety-rules}

- **Samo brzo napredovanje** (`git pull --ff-only`): ažuriranje nikad ne spaja,
  ne preslaguje niti išta prepisuje.
- **Bez lokalnih promjena**: primjerak s nespremljenim promjenama u praćenim datotekama
  (`git status --porcelain --untracked-files=no` nije prazno) se nikad ne ažurira
  automatski - tuđi rad nije dio ažuriranja koje bi ga prepisalo. Samo mu se javi da
  ažuriranje čeka. Nepraćene datoteke (podaci, izvozi) se ne računaju kao promjene.
- **Bez lokalnih commitova**: primjerak s commitovima koje nadređena grana nema
  („razdvojen”) se ne ažurira - brzo napredovanje ga ne može dovesti u red, a
  spajanje je za `git pull` ručno. Stranica i `start.bat` oboje to kažu istim
  riječima, a `start.bat` pokreće verziju koja je tu.
- **Samo sa same stranice**: zahtjev za ažuriranje razvojnog poslužitelja mora nositi
  prilagođeno zaglavlje i, kad nosi `Origin`, dolaziti s vlastitog domaćina poslužitelja
  (dolje).
- Ažurira se samo git primjerak s nadređenom granom; sve ostalo (primjerak bez `.git`,
  bez instaliranog gita, statička verzija) ostaje netaknuto i ne kaže ništa.

## Što radi start.bat {#what-startbat-does}

`start.bat` (dvaput kliknite na njega; prozor je poslužitelj) redom:

1. Pronalazi Node.js - u `PATH`-u, inače u `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` ili `%LOCALAPPDATA%\Programs\nodejs` - i, kad nedostaje,
   nudi instalaciju naredbom `winget install -e --id OpenJS.NodeJS.LTS` (pita, Y/N;
   nakon toga prozor treba ponovno otvoriti da Windows pokupi novi `PATH`).
2. **Ažuriranja**, kad je git instaliran i mapa ima `.git`:
   - `git fetch --quiet` (bez mreže ili nadređene grane: preskače se bez riječi);
   - broji `git rev-list --count HEAD..@{u}`; ništa iza: ništa se ne kaže;
   - lokalne promjene: „Dostupna je novija verzija 3DHeat-a (N promjena), ali ovaj primjerak
     ima lokalne promjene, pa se ne ažurira. Spremite ili odložite ih, zatim pokrenite
     git pull." - i pokreće verziju koja je tu;
   - vlastiti commitovi (`git rev-list --count @{u}..HEAD` nije 0): „Dostupna je novija
     verzija 3DHeat-a (N promjena), ali ovaj primjerak ima vlastite commitove koje najnovija
     verzija nema, pa se ne ažurira. Ažurirajte ga naredbom git pull." - i pokreće verziju
     koja je tu;
   - inače „Dostupna je novija verzija 3DHeat-a (N promjena)." i pitanje **Ažurirati sada? [Y/N]**.
     `N`, ili bez odgovora 60 sekundi, ispisuje „Nije ažurirano; pokrećem verziju koju imate."
     i pokreće verziju koja je tu. Na `Y`: „Ažuriram...", javlja mijenjaju li se
     `package.json` ili `package-lock.json`, pokreće `git pull --ff-only` (ako i to ne uspije -
     na primjer zbog mreže: „Ažuriranje nije uspjelo; pokrećem verziju koju imate."),
     zatim `git submodule update --init` (pripadajući alati, vidi
     [Održavanje dokumentacije](maintaining.md#the-tools-under-exporters)), zatim `npm install`
     kad su se datoteke paketa promijenile i postoji `node_modules`, i „Ažurirano."
3. Odbija pokrenuti drugi poslužitelj: kad nešto već sluša na portu **5273**, to kaže i
   upućuje na `restart.bat` / `stop.bat`.
4. Pri prvom pokretanju (nema `node_modules`), pita prije preuzimanja ovisnosti (oko 300 MB
   u `node_modules\`, ništa na razini sustava).
5. Pokreće razvojni poslužitelj na `127.0.0.1:5273` (`--strictPort`) i otvara preglednik
   kad je spreman.

`restart.bat` zaustavlja poslužitelj (po portu) i ponovno pokreće `start.bat`, pa postavlja isto
pitanje. `stop.bat` samo zaustavlja.


## Za programere {#for-developers}

### Dok radi: ruta ažuriranja {#while-it-runs-the-update-route}

Razvojni poslužitelj (Vite dodatak `heat3d-self-update` u `vite.config.ts`) poslužuje
`/__heat3d/update`. Postoji samo na razvojnom poslužitelju - ne u statičkoj verziji
i ne u `vite preview`.

**`GET /__heat3d/update`** odgovara je li primjerak iza:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` kad mapa nije git primjerak;
- pokreće `git fetch --quiet` **najviše svakih 30 minuta** (upiti između odgovaraju iz zadnjeg dohvaćanja);
- `behind` / `ahead` iz `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`,
  `dirty` iz `git status --porcelain --untracked-files=no`, `latest` je naslov
  najnovijeg commita nadređene grane;
- bez nadređene grane, `upstream: null` i `behind: 0`.

**`POST /__heat3d/update/apply`** ažurira primjerak:

1. Odbija se s `403 { ok: false, reason: "forbidden" }` osim ako zahtjev nema
   zaglavlje `X-Heat3d-Update: 1` i, kad nosi `Origin`, host tog izvora nije `Host`
   zahtjeva. Obrazac s drugog sjedišta ne može poslati prilagođeno zaglavlje bez
   CORS preflighta, a ovaj poslužitelj ga nikad ne dopušta.
2. Nema što raditi (nije primjerak, nema nadređene grane, nije iza):
   `{ ok: true, updated: false }`.
3. Lokalne promjene: `{ ok: false, reason: "dirty" }`; lokalni commitovi:
   `{ ok: false, reason: "diverged" }`.
4. Inače: bilježi koje se datoteke mijenjaju (`git diff --name-only HEAD @{u}`),
   `git pull --ff-only` (2 min vremensko ograničenje), `git submodule update --init`
   (greška se ignorira), `npm install` kad se promijene `package.json` ili
   `package-lock.json` (15 min vremensko ograničenje), i odgovara
   `{ ok: true, updated: true, restart }` - `restart` kaže zašto pokrenuti poslužitelj
   ne može preuzeti ažuriranje: `"dependencies"` kad su ponovno instalirane,
   `"config"` kad se promijenila samo datoteka `vite.config`, `false` kad ponovno
   pokretanje nije potrebno.
5. Neuspjela git ili npm naredba odgovara `{ ok: false, reason: "<greška,
   do 300 znakova>" }`.

Odgovori su JSON s `Cache-Control: no-store`. Poslužitelj sluša samo na
`127.0.0.1`, pa ruta nije dostupna s mreže.

### Obavijest na stranici {#the-notice-in-the-page}

`UpdateBanner`, ispod naziva na vrhu bočne trake:

- Ruta se pita **4 sekunde** nakon učitavanja stranice (ne u prvim sekundama: stranica
  ima skup podataka za učitati i GPU za pokrenuti) i ponovno **svakih 6 sati** dok
  stranica ostaje otvorena.
- Ne prikazuje **ništa** kad takve rute nema (statička verzija), mapa nije primjerak
  ili ništa nije novije - obavijest pri svakom pokretanju je ona koju ljudi nauče
  ignorirati.
- Iza, bez lokalnih promjena: „Dostupna je novija verzija 3DHeat-a (N promjena,
  najnovija: <naslov>).” uz **Ažuriraj sada** i **Kasnije**
  (*Kasnije* skriva obavijest dok se stranica ponovno ne učita).
- Iza, s lokalnim promjenama: ista rečenica i „Ovaj primjerak ima lokalne promjene, pa
  se ne ažurira automatski; spremite ili odložite ih, zatim pokrenite git pull." -
  bez gumba.
- **Ažuriraj sada** šalje zahtjev na `/apply` („Ažuriram...”). Zatim:
  - „Ažurirano. Stranica se ponovno učitava.” - i učita se ponovno 1,5 s kasnije (poslužitelj
    već služi nove datoteke);
  - kad su ovisnosti ponovno instalirane: „Ažurirano. Ovisnosti su se promijenile:
    zatvorite prozor poslužitelja i pokrenite **restart.bat** za dovršetak.”;
  - kad su se promijenile samo postavke poslužitelja: „Ažurirano. Postavke poslužitelja
    su se promijenile: zatvorite prozor poslužitelja i pokrenite **restart.bat** za dovršetak.”;
  - ipak nema što preuzeti (`updated: false` - primjerak je u međuvremenu ažuriran, recimo
    od strane `start.bat`): „Nema što ažurirati: ovaj primjerak je već najnovija verzija.” -
    i nema ponovnog učitavanja;
  - odbijeno: rečenica o *lokalnim promjenama*, ili „Ovaj primjerak ima vlastite commitove
    koje najnovija verzija nema; ažurirajte ga naredbom git pull.”, ili „Ažuriranje nije
    uspjelo: <razlog>”.
