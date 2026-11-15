---
title: "Analiza tekme (CS2)"
nav_order: 10
lang: "sl"
source: "match-analysis.md"
source_hash: "0b9ab06a759f"
translated: true
outdated: false
---


# Analiza tekme (Counter-Strike 2)

Zavihek **Tekma** predvaja posnetek kot figure, za tekmo Counter-Strike 2 pa prikaže tudi tablico rezultatov: kdo je zmagal vsak krog, kako, in kdo je dosegel ubitja. Uporabite ga, da pregledate tekmo krog za krogom, nato pa skočite na isti trenutek na toplotnem zemljevidu.

Zavihek Tekma predvaja vsak posnetek kot figure: posnetek War Thunder ali Tacview ali demo CS2, navedeni pod **Tekme v posnetku** ([Predvajanje tekme](match-replay.md)). Datoteka CS2 `.match.json` doda tablico rezultatov, opisano na tej strani.

## Pregled tekme CS2 {#review-a-cs2-match}

1. Pretvorite demo ([spodaj](#where-the-data-comes-from)) v datoteko `.parquet` in datoteko `.match.json`.
2. Na zavihku **Toplotni zemljevid** naložite datoteko `.parquet` pod **Vir**.
3. Odprite zavihek **Tekma** in kliknite **Naloži datoteke tekem…**, ali spustite datoteko `.match.json` na pogled.
4. Kliknite tekmo pod **Povzetki tekem**, nato celico v traku krogov, da odprete ta krog.
5. Kliknite **Prikaži rundo**, da vidite ta krog na toplotnem zemljevidu, ali **Posnetek runde**, da ga gledate kot figure.

![Zavihek Tekma: trak krogov z odprtim krogom, tok ubitij in tablica rezultatov](../assets/img/en/match-analysis-round.webp)

Besede, kot so KAST, ADR, eco, force buy in trade, so v [slovarčku](glossary.md#counter-strike-words).

## Od kod prihajajo podatki {#where-the-data-comes-from}

Pretvornik demo datotek iz [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
spremeni demo v dve datoteki na tekmo, v mapi na zemljevid:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Datoteka | Naloži se v | Vsebuje |
|---|---|---|
| `<match>.parquet` | zavihek **Toplotni zemljevid** (plošča Vir, kot vsaka datoteka Parquet – ena datoteka, več ali cela mapa) | položaj vsakega igralca osemkrat na sekundo in vsak dogodek, kjer se je zgodil: ubitje, smrt, poškodba, strel, met, dim, bliskovka, HE, molotovka, vaba, zaslepitev, postavitev, deaktivacija, eksplozija; z `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, smerjo pogleda, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | zavihek **Tekma** | ekipe, rezultat, vsak krog (zmagovalec, kako, gospodarstvo, postavitev, vsako ubitje po vrsti, odločilni trenutki, preživeli), vsaka vrstica tablice rezultatov vsakega igralca |

Noga datoteke Parquet nosi navodila za branje (ključ `heat3d`), zato se odpre
brez kakršnih koli nastavitev: igralec kot oseba, stran kot skupina, vsak krog
(`roundId`, "<match> #NN") kot seja, smer pogleda vklopljena, svet pa pravilno
obrnjen (svet CS2 je desnoročen z Z navzgor; če bi ga prebrali s privzetim
preslikavanjem Z navzgor, bi bil zrcaljen). Glejte [Preslikava stolpcev](column-mapping.md)
in [Nalaganje datotek](loading-files.md). `python -m heat3d_cs2 map <map>` izvozi
geometrijo zemljevida v istem okviru; naloži se v **Raven**.

Pravila za številke so pretvornikova (navedena v njegovem README in shranjena v
vsakem povzetku): smrt je **maščevana**, kadar ubijalca ubije eden od soigralcev
žrtve v **5 s**; **KAST** je delež krogov z ubitjem, asistenco (asistenca z bliskovko
se šteje), preživetjem ali maščevano smrtjo; **škoda** je dejansko izgubljeno zdravje,
samo sovražnikov; **zadnji preživeli** (clutch) je, kdo je zadnji živ na strani s stoječimi
sovražniki, dobljen, ko stran zmaga; **nakup** po strani iz povprečne vrednosti opreme ob
koncu zamrznitve – prvi krog vsake redne polovice je pištolski krog (v podaljšku ga ni),
nato pod 1.500 $ eco, pod 4.000 $ force buy, vse nad tem polni nakup.

## Zavihek {#the-tab}

Stranska vrstica zavihka Tekma ima na vrhu stikalo načina toplotnega zemljevida in
izbirnik sej, pod njim odseke tekme, nato plošče toplotnega zemljevida **Filtri**,
**Raven** in **Kamera** – pogled je toplotni zemljevid katerekoli datoteke Parquet, naložene
na zavihku Toplotni zemljevid.

### Povzetki tekem {#match-summaries}

| Nastavitev | Naredi |
|---|---|
| **Naloži datoteke tekem…** | izbere datoteke `.json` (več naenkrat): povzetke `.match.json` |
| spust na pogled | datoteke JSON, spuščene na pogled, medtem ko je zavihek Tekma odprt, se naložijo enako (druge datoteke so prezrte) |
| **Počisti** | odstrani vsako tekmo |
| **Vse tekme** (pri dveh ali več) | "N tekem, M krogov": statistika čez vse |
| vrstica tekme | "EkipaA 13 proti EkipaB 9", zemljevid · N krogov: odpre to tekmo |

Datoteka je sprejeta, če je JSON z `"format": "heat3d-cs2-match"` in nizi
`rounds`, `players` in `teams`. Napake so navedene pod gumbi: "<file>: ni JSON",
"<file>: ni povzetek tekme CS2 (heat3d-cs2-match)", "<file>: manjka rounds, players ali
teams". Tekma, naložena znova (isto ime `match`), nadomesti prejšnjo. Tekme so
razvrščene po zemljevidu, nato po imenu. Če je naložena natanko ena tekma, se odpre;
sicer izbor ostane (privzeto vse tekme).

Če ni naloženega ničesar, razdelek razloži: pretvorite z `python -m heat3d_cs2
demos`, tu naložite datoteke `.match.json`, na zavihku Toplotni zemljevid pa datoteke `.parquet`.

### Tekma (ena tekma odprta) {#match-one-match-open}

**Glava:** obe ekipi s svojim rezultatom, zemljevid, polovici –
"polovici 7–5, 6–6": krogi 1–12 in 13–24 (premier in tekmovalna igra MR12;
lastna dolžina polovice povzetka, kadar jo navede, zato 1–15 in 16–30 za MR15) –
nato, ko je tekma šla v podaljšek, njen rezultat zase: "podaljšek 4–2", krogi po obeh
polovicah. Izenačen krog ne šteje za nobeno ekipo. In "N krogov prekinjenih v demu",
kadar povzetek navede nepopolne kroge.

**Trak krogov:** celica za vsak krog, obarvana po strani, ki je zmagala, s svojo številko
in oznako, kako se je končal. Izenačen krog (brez zmagovalca) je nevtralna siva celica z
oznako `=`, nikoli barva strani; njen namig pravi "Krog 30: izenačeno – nobena stran ga ni
dobila".

| Oznaka | Končal ga je |
|---|---|
| B | bomba eksplodirala |
| D | bomba deaktivirana |
| K | izločen |
| T | čas je potekel |
| S | predaja |
| = | izenačeno |
| ? | drugo |

Razdelek označi začetek druge polovice (krog 13 ali krog po dolžini polovice povzetka) in
vsako tritretjinsko polovico podaljška (krogi 25, 28, 31, …). Pri lebdenju nad celico: "Krog 7:
EkipaA (T) – bomba eksplodirala, postavljena A" ("…, postavljena, mesto neznano", kadar povzetek
nima mesta) in nakup ter vrednost opreme obeh strani. Kliknite, da odprete krog; kliknite
znova, da ga zaprete ("Kliknite krog za njegova ubitja, gospodarstvo in posnetek").

**Krog:**

- "Krog 7: <ekipa> je zmagala – <kako>" ("Krog 30: izenačeno – nobena stran ga ni dobila"
  za izenačen krog) in koliko časa je krog trajal (konec zamrznitve do odločitve, m:ss);
- gospodarstvo: ekipa vsake strani, nakup (pištola, eco, force buy, polni nakup) in vrednost
  opreme ("4.350 $");
- postavitev: mesto, igralec in čas v krogu (iz katere koli različice povzetka); "Postavil
  <igralec> ob 1:05, mesto neznano", kadar mesto ni znano;
- **tok ubitij** po vrsti: čas v krogu, napadalec (v barvi strani; "world" za brez napadalca),
  orožje in zastavice – **HS** zadetek v glavo, **WB** skozi steno, **SM** skozi dim; **prvi** prvo
  ubitje kroga, **trade** (maščevan soigralec v 5 s), **traded** (ubijalec je bil ubit v 5 s),
  **team** ubitje soigralca (samomor ni nobeno). Ubitja po odločitvi kroga so zatemnjena;
- zadnji preživeli: "<igralec> (T) sam proti 3: zmagal zadnji preživeli" / "izgubil ga";
- kdo je bil živ ob koncu, po strani ("nihče");
- **Prikaži rundo**: vse v tem krogu na toplotnem zemljevidu;
- **Posnetek runde**: predvaja krog kot škatle, od njegovega začetka (spodaj).

Gumbi **Prikaži na toplotnem zemljevidu** (glejte [spodaj](#show-in-the-heatmap)) za to
tekmo ali za odprti krog.

### Tablica rezultatov {#scoreboard}

Tabela za vsako ekipo, vrstica za vsakega igralca:

| Stolpec | Je |
|---|---|
| K, D | ubitja, smrti |
| A | asistence, vključno z asistencami z bliskovko |
| ± | ubitja minus smrti (zeleno nad 0, rdeče pod 0) |
| ADR | škoda na krog, dejansko izgubljeno zdravje |
| KAST | % krogov z ubitjem, asistenco, preživetjem ali maščevano smrtjo |
| HS | % ubitij z zadetkom v glavo |
| Prvi | zmagani–izgubljeni prvi dvoboji |
| Cl | zadnji preživeli zmagani/igrani |

Pri lebdenju nad igralcem: ubitja trade, kolikokrat je bil maščevan, asistence z bliskovko,
zaslepljeni sovražniki, škoda z opremo in krogi z večkratnimi ubitji ("2×3k"). **Kliknite
igralca** za njegova ubitja in smrti na toplotnem zemljevidu (ta tekma).

### Čez tekme (Vse tekme) {#across-matches-all-matches}

Čez vsako naloženo tekmo:

- "N tekem · M krogov · <zemljevidi>" in "N izenačenih krogov, ki ga nobena stran ni dobila",
  kadar so bili izenačeni krogi;
- **Dobljeni krogi** po strani: skupno, v **pištolskih** krogih (pištolski krogi povzetka) in
  pri nakupih **eco**, **force** in **polni** (vsak kot odstotek z odigranimi krogi; pri lebdenju
  "dobljeno od odigranih"). Izenačen krog odigrata obe strani, nobena ga ne dobi;
- **Bomba**: postavitve po mestu in kako pogosto je stran T nato zmagala v teh krogih
  ("12 postavitev na A (T je zmagal 67 %)"), postavitve, katerih mesto povzetek sam ne pozna
  ("2 postavitvi na neznanem mestu (T je zmagal 50 %)"), ali "nikoli postavljeno"; kako so se
  krogi končali, najpogostejše najprej;
- "Stran, ki je dosegla prvo ubitje, je zmagala v N % teh krogov." (samomor ni prvo ubitje;
  izenačen krog ne pretvori prvega ubitja);
- **Prvi dvoboji, kje**: deset mest z največ prvimi ubitji (po kraju žrtve; imena krajev iz igre
  so berljiva, "TopofMid" → "Top of Mid"), dvoboji in delež, ki ga je dobila stran T;
- **Igralci**: petnajst najboljših po ubitjih minus smrtih, združeno čez vse njihove tekme
  (ujemanje po Steam ID): tekme, K-D, ADR in KAST, uteženi z odigranimi krogi, HS % uteženo z
  ubitji, prvi dvoboji. **Kliknite igralca** za njegova ubitja in smrti čez vse tekme na
  toplotnem zemljevidu.

Gumbi Prikaži na toplotnem zemljevidu za vse naložene tekme so pod tem.

## Kaj je odločilo kroge {#what-decided-the-rounds}

Zavihek šteje; [Ugotovitve](insights.md#who-won-what-decided-the-rounds) pojasnijo. Ko je naložena tabela toplotnega zemljevida tekme (nosi stolpec `won`), **Ugotovitve** razdelijo kroge vsake strani po tem, kaj se je v njih zgodilo - uvodni dvoboj, nakup, izmenjana prva smrt, postavitev, pripomočki, zgodnji prvi stik, vsako držano mesto in vsako mesto, doseženo v prvih 25 s - in povedo, kaj je naredilo razliko, z razliko deležev zmag, njenim 95 % intervalom in q ter *malo krogov*, kjer ima veja manj kot osem krogov. Navedejo prelomnice (ubitja in postavitve, ki so najbolj premaknila verjetnost zmage) ter igralce in mesta, ki so največ dodali ali stali, **Povzetek** in **Komentator** pa začneta z njimi. Izmišljen primer:

> T je dobila 79 % od 19 krogov, v katerih je držala Mid, proti 24 % od 21 brez njega (55 točk, 95 % od 26 do 74) - q 0,004.
>
> Prelomnice: krog 17 ob 48 s, ubitje strani CT na mestu B je premaknilo njeno možnost z 31 % na 58 % in krog je dobila.

Ena tekma ima manj kot 30 krogov, zato njene verjetnosti zmage izhajajo iz fiksnega apriornega modela živih mož, postavitve in ure; besedilo to pove. Čez veliko tekem ista vprašanja zastavi [množična analiza](mass-analysis.md#who-won).

## Prikaz na toplotnem zemljevidu {#show-in-the-heatmap}

Vsaka povezava nastavi lastne **filtre** toplotnega zemljevida, zato je prikazano ostane
vidno in urejljivo v plošči Filtri, **Vse tekme** pa jih počisti. Delujejo na tabeli toplotnega
zemljevida, naloženi na zavihku Toplotni zemljevid; zavihek Tekma je nikoli ne naloži sam.

| Gumb | Prikazani dogodki |
|---|---|
| **Položaji** | `position` – kje so bili igralci, osemkrat na sekundo |
| **Ubitja** | `kill` – kje je stal ubijalec |
| **Smrti** | `death` – kje je žrtev padla |
| **Prvi uboji** | `kill` in `death` z `opening` = 1 – prvo ubitje vsakega kroga, kjer sta stala oba (ponujeno samo, kadar ima tabela stolpec `opening`) |
| **Dimne** | `smoke` – kje so pristali dimi |
| **Bliskovke** | `flash` – kje so počile bliskovke |
| **Molotovke** | `molotov` – kje so gorele molotovke in zažigalne bombe |
| **HE** | `he` – kje so eksplodirale granate HE |
| **Postavitve** | `plant` – kje je bila bomba postavljena |
| **Streli** | `shot` – kje so bili izstreljeni streli |

Obseg je odvisen od tega, kje so gumbi: vse naložene tekme, ta tekma ali ta krog
("Prikaži na toplotnem zemljevidu – krog 7").

Kar ni mogoče uporabiti, je povedano pod gumbi, ne tiho filtrirano na nič: "ni shranjenega
stolpca tekme – tekma ni uporabljena", "tekma: X ni v naloženih podatkih", enako za krog in
dogodke, "igralec X ni v naloženih podatkih", "stran X ni v naloženih podatkih", "ni naloženih
podatkov toplotnega zemljevida: naložite datoteke .parquet tekem na zavihku Toplotni zemljevid".
Brez naloženih podatkov povezave tudi pravijo "Naložite datoteke .parquet tekem na zavihku
Toplotni zemljevid, da jih vidite na zemljevidu."

**Posnetek runde** poleg tega preklopi toplotni zemljevid na **Predvajanje škatel**, časovnico
v način *predvajanje* z oknom, nastavljenim na *življenjsko dobo*, premakne na začetek seje kroga
in predvaja. Kadar krog ni seja naloženih podatkov: "ta krog ni seja naloženih podatkov: ni česa
predvajati".

## Za razvijalce {#for-developers}

Koda: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Različice povzetkov {#summary-versions}

Zavihek bere povzetke različice 1 in različice 2 (`"version"` v datoteki) drugega ob drugem
in ju obravnava enako:

| | Različica 2 | Različica 1 |
|---|---|---|
| čas postavitve | sekunde v krogu, kot ubitja; zavihek ne odšteje | sekunde tekme; zavihek odšteje začetek kroga |
| mesto postavitve | `A` ali `B`; prazno, kadar demo tega ne pove | `A`, `B` ali številka entitete – prebrano kot neznano mesto |
| dolžina polovice | `halfLength`, od koder se strani prvič zamenjata; 12, kadar je null | 12 (MR12) |
| pištolski krogi | `pistolRounds` (krog 1 in prvi krog po polovici) | krogi, katerih nakup je `pistol` |
| izenačen krog | `winner` in `winnerTeam` prazna | – |
| samomor | `suicide` na ubitju, nikoli ubitje soigralca | prepoznano po tem, da sta napadalec in žrtev isti igralec |

`noscope` in `attackerBlind` ubitja (različica 2) nista prikazana na zavihku Tekma, ki prav tako
ne prikazuje mesta iz tabele toplotnega zemljevida, zato prazen `place` vrstice granate tu ne
spremeni ničesar.

Kako se fokus spremeni v filtre (`focusFilters`):

- **tekma** → filter kategorije na stolpcu `match`;
- **krog** → filter razpona `round` = N na številskem stolpcu `round` (filter kategorije na kategoričnem),
  seja kroga (`<match> #NN`) pa je izbrana v izbirniku sej;
- **dogodki** → filter kategorije na stolpcu `event`;
- **igralec** → filter osebe za tega igralca;
- **stran** → filter skupine.

