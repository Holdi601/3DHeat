---
title: "Posodobitve"
nav_order: 21
lang: "sl"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Posodobitve

Pregledovalnik vam pove, kdaj obstaja novejša različica, in se posodobi samo, če rečete da. Na računalniku se nič ne spremeni brez vašega odgovora.

## Posodobite pregledovalnik {#update-the-viewer}

1. **Na strani.** Ko obstaja novejša različica, se pod imenom na vrhu stranske vrstice pojavi okence: »Na voljo je novejša različica 3DHeat«. Kliknite **Posodobi zdaj**. Stran se ob koncu sama osveži. **Pozneje** skrije okence do osveževanja strani.
2. **Če piše, naj zaženete restart.bat**, zaprite okno strežnika (črno okno, ki ga je odprl `start.bat`) in dvakrat kliknite `restart.bat`.
3. **Ob zagonu pregledovalnika.** `start.bat` prav tako preveri. Če obstaja novejša različica, vpraša **Posodobi zdaj? [Y/N]**. Pritisnite `Y`, da posodobite. Pritisnite `N` ali počakajte 60 sekund brez odgovora, da zaženete različico, ki jo imate.

![Obvestilo o posodobitvi z Posodobi zdaj in Pozneje](../assets/img/en/updates-notice.webp)

Kopija s spremembami, ki ste jih naredili sami, se nikoli ne posodobi samodejno; okence vam samo pove, da čaka posodobitev, in naroči, naj shranite ali skrijete spremembe ter zaženete `git pull`. Kopija, ki ni bila nameščena z gitom (na primer datoteka zip), ne prikaže ničesar.

Kako preverjanje deluje, korak za korakom:

```
stran ---(po 4 s, nato na 6 h)---> razvojni strežnik ---> git fetch
   zaostaja?  ne  -> nič se ne prikaže
              da  -> lastne spremembe ali commiti?  da -> samo obvesti
                                                   ne -> [Posodobi zdaj] -> git pull
                                                          -> ponovno naloži ali „zaženite restart.bat“
```

## Varnostna pravila {#the-safety-rules}

- **Samo hitro naprej** (`git pull --ff-only`): posodobitev nikoli ne združi, ne prestavi in ne prepiše ničesar.
- **Brez lokalnih sprememb**: kopija z nepotrjenimi spremembami sledenih datotek (`git status --porcelain --untracked-files=no` ni prazno) se nikoli ne posodobi samodejno - tuje delo ni nekaj, kar posodobitev sme prepisati. Samo pove, da čaka posodobitev. Nesledene datoteke (podatki, izvozi) se ne štejejo kot spremembe.
- **Brez lokalnih potrditev**: kopija s potrditvami, ki jih izvorna veja nima (»razhajanje«), se ne posodobi - hitro naprej je ne more dvigniti, združevanje pa je za `git pull` ročno. Stran in `start.bat` to povesta z enakimi besedami, `start.bat` pa zažene različico, ki je tam.
- **Samo z same strani**: zahteva za posodobitev razvojnega strežnika mora nositi lastno glavo in, kadar brskalnik pošlje `Origin`, prihajati z gostitelja strežnika (spodaj).
- Posodobi se le git kopija z izvorno vejo; vse drugo (kopija brez `.git`, brez nameščenega gita, statična izdelava) pusti pri miru in ne pove ničesar.

## Kaj naredi start.bat {#what-startbat-does}

`start.bat` (dvakrat kliknite ga; okno je strežnik) naredi, po vrsti:

1. Najde Node.js - v `PATH`, sicer v `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ali `%LOCALAPPDATA%\Programs\nodejs` - in ob manjkanju ponudi namestitev z `winget install -e --id OpenJS.NodeJS.LTS` (vpraša, Y/N; potem je treba okno znova odpreti, da Windows prevzame novi `PATH`).
2. **Posodobitve**, kadar je git nameščen in mapa vsebuje `.git`:
   - `git fetch --quiet` (brez omrežja ali brez izvorne veje: tiho preskoči);
   - šteje `git rev-list --count HEAD..@{u}`; nič za njim: nič ne pove;
   - lokalne spremembe: »Na voljo je novejša različica 3DHeat (N sprememb), vendar ta kopija ima lokalne spremembe, zato ni posodobljena. Shranite jih ali skrijte, nato zaženite git pull.« - in zažene različico, ki je tam;
   - lastne potrditve (`git rev-list --count @{u}..HEAD` ni 0): »Na voljo je novejša različica 3DHeat (N sprememb), vendar ta kopija ima lastne potrditve, ki jih najnovejša različica nima, zato ni posodobljena. Posodobite jo z git pull.« - in zažene različico, ki je tam;
   - sicer »Na voljo je novejša različica 3DHeat (N sprememb).« in vprašanje **Posodobi zdaj? [Y/N]**. `N` ali brez odgovora 60 sekund izpiše »Ni posodobljeno; zaganjam različico, ki jo imate.« in zažene različico, ki je tam. Ob `Y`: »Posodabljam...«, pove, ali se `package.json` ali `package-lock.json` spremenita, zažene `git pull --ff-only` (če tudi to ne uspe - na primer zaradi omrežja: »Posodobitev ni uspela; zaganjam različico, ki jo imate.«), nato `git submodule update --init` (pripete orodje, glejte [Vzdrževanje dokumentacije](maintaining.md#the-tools-under-exporters)), nato `npm install`, če so se datoteke paketa spremenile in obstaja `node_modules`, in »Posodobljeno.«
3. Zavrne zagon drugega strežnika: kadar nekaj že posluša na vratih **5273**, to pove in napoti na `restart.bat` / `stop.bat`.
4. Ob prvem zagonu (ni `node_modules`) vpraša, preden prenese odvisnosti (okoli 300 MB v `node_modules\`, nič sistemsko).
5. Zažene razvojni strežnik na `127.0.0.1:5273` (`--strictPort`) in odpre brskalnik, ko je pripravljen.

`restart.bat` ustavi strežnik (po vratih) in znova zažene `start.bat`, zato vpraša isto vprašanje. `stop.bat` samo ustavi.


## Za razvijalce {#for-developers}

### Med delovanjem: pot posodobitve {#while-it-runs-the-update-route}

Razvojni strežnik (vtičnik Vite `heat3d-self-update` v `vite.config.ts`) streže `/__heat3d/update`. Obstaja samo na razvojnem strežniku - ne v statičnem buildu in ne v `vite preview`.

**`GET /__heat3d/update`** odgovori, ali kopija zaostaja:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "predmet najnovejšega commita" }
```

- `checkout: false`, kadar mapa ni git kopija;
- zažene `git fetch --quiet` **največ vsakih 30 minut** (vmesna vprašanja odgovorijo z zadnjega pridobljenega stanja);
- `behind` / `ahead` iz `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` iz `git status --porcelain --untracked-files=no`, `latest` je predmet najnovejšega commita nadrejene veje;
- brez nadrejene veje `upstream: null` in `behind: 0`.

**`POST /__heat3d/update/apply`** posodobi kopijo:

1. Zavrnjeno s `403 { ok: false, reason: "forbidden" }`, razen če zahteva nosi glavo `X-Heat3d-Update: 1` in, kadar nosi `Origin`, se gostitelj tega izvora ujema z `Host` zahteve. Obrazec z drugega spletnega mesta ne more poslati lastne glave brez predhodne zahteve CORS, ki je ta strežnik nikoli ne odobri.
2. Ni kaj narediti (ni git kopija, ni nadrejene veje, ni zaostanka): `{ ok: true, updated: false }`.
3. Lokalne spremembe: `{ ok: false, reason: "dirty" }`; lokalni commiti: `{ ok: false, reason: "diverged" }`.
4. Sicer: zapiše, katere datoteke se spreminjajo (`git diff --name-only HEAD @{u}`), zažene `git pull --ff-only` (časovna omejitev 2 min), `git submodule update --init` (napaka se prezre), `npm install`, če so se spremenili `package.json` ali `package-lock.json` (časovna omejitev 15 min), in odgovori `{ ok: true, updated: true, restart }`. `restart` pove, zakaj tekoči strežnik posodobitve ne more prevzeti: `"dependencies"`, kadar so bile odvisnosti znova nameščene; `"config"`, kadar se je spremenila le datoteka `vite.config`; `false`, kadar ponovni zagon ni potreben.
5. Neuspešen ukaz git ali npm odgovori `{ ok: false, reason: "<napaka, največ 300 znakov>" }`.

Odgovori so JSON s `Cache-Control: no-store`. Strežnik posluša samo na `127.0.0.1`, zato pot ni dosegljiva iz omrežja.

### Obvestilo na strani {#the-notice-in-the-page}

`UpdateBanner`, pod imenom na vrhu stranske vrstice:

- Pot sprašuje **4 sekunde** po nalaganju strani (ne v prvih sekundah: stran še nalaga podatke in zaganja GPE) in nato znova **vsakih 6 ur**, dokler je stran odprta.
- Ne prikaže **ničesar**, kadar takšne poti ni (statični build), mapa ni git kopija ali nič ni novejšega - obvestilo ob vsakem zagonu bi se ljudje naučili ignorirati.
- Zaostaja brez lokalnih sprememb: „Na voljo je novejša različica 3DHeat (N sprememb, najnovejša: <predmet>).“ z gumboma **Posodobi zdaj** in **Pozneje** (*Pozneje* skrije obvestilo, dokler stran ni znova naložena).
- Zaostaja z lokalnimi spremembami: enak stavek in „Ta kopija ima lokalne spremembe, zato se ne posodobi samodejno; naredite commit ali stash in nato zaženite git pull.“ - brez gumba.
- **Posodobi zdaj** pošlje zahtevo na `/apply` („Posodabljam ...“). Nato:
  - „Posodobljeno. Stran se znova naloži.“ - in čez 1,5 s se stran znova naloži (strežnik že streže nove datoteke);
  - ko so bile odvisnosti znova nameščene: „Posodobljeno. Odvisnosti so se spremenile: zaprite okno strežnika in zaženite **restart.bat**, da se posodobitev dokonča.“;
  - ko so se spremenile samo nastavitve strežnika: „Posodobljeno. Nastavitve strežnika so se spremenile: zaprite okno strežnika in zaženite **restart.bat**, da se posodobitev dokonča.“;
  - na koncu ni ničesar za prevzem (`updated: false` - kopijo je medtem uredil npr. `start.bat`): „Ni česa posodobiti: ta kopija je že najnovejša različica.“ - brez ponovnega nalaganja;
  - zavrnjeno: stavek o lokalnih spremembah, ali „Ta kopija ima lastne commite, ki jih najnovejša različica nima; posodobite jo z git pull.“, ali „Posodobitev ni uspela: <razlog>“.
