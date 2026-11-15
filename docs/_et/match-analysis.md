---
title: "Matšianalüüs (CS2)"
nav_order: 10
lang: "et"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Matšianalüüs (Counter-Strike 2)

Vahekaart **Matš** esitab salvestise kujudena ja Counter-Strike 2 matši puhul näitab ka tulemustabelit: kes võitis iga raundi, kuidas ning kes tegi tapmised. Seda kasutades vaata matš läbi raund-raundilt ja hüppa siis sama hetke juurde soojuskaardil.

Vahekaart Matš esitab iga salvestise kujudena: War Thunderi või Tacview salvestise või CS2 demo, mis on loetletud jaotises **Korduse matšid** ([Matši kordus](match-replay.md)). CS2 `.match.json` fail lisab selle lehe kirjeldatud tulemustabeli.

## Vaata CS2 matš üle {#review-a-cs2-match}

1. Konverteeri demo ([allpool](#where-the-data-comes-from)) `.parquet` ja `.match.json` failiks.
2. Vahekaardil **Soojuskaart** laadi `.parquet` fail jaotise **Allikas** all.
3. Ava vahekaart **Matš** ja klõpsa **Laadi matšifailid…** või lohista `.match.json` fail vaatele.
4. Klõpsa matšil jaotises **Matšide kokkuvõtted**, seejärel raundi ribal lahtril, et see raund avada.
5. Klõpsa **Näita raundi**, et näha seda raundi soojuskaardil, või **Raundi kordus**, et vaadata seda kujudena.

![Vahekaart Matš: raundiriba, avatud raund, tapmiste voog ja tulemustabel](../assets/img/en/match-analysis-round.webp)

Sõnad nagu KAST, ADR, eco, force buy ja trade on [sõnastikus](glossary.md#counter-strike-words).

## Kust andmed tulevad {#where-the-data-comes-from}

[3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) demokonverter
muudab demod matši kohta kaheks failiks, kaardi kaupa omas kaustas:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Fail | Laaditakse | Sisaldab |
|---|---|---|
| `<match>.parquet` | vahekaart **Soojuskaart** (paneel Allikas, nagu iga Parquet – üks fail, mitu või terve kaust) | iga mängija asukoht kaheksa korda sekundis ja iga sündmus, kus see toimus: tapmine, surm, haavamine, laskmine, viskamine, suits, pimestusgranaat, HE, molotov, decoy, pimestamine, pommi panek, pommi desarmeerimine, plahvatus; koos `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, vaatesuunaga, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | vahekaart **Matš** | meeskonnad, skoor, iga raund (võitja, kuidas, majandus, pommi panek, iga tapmine järjekorras, clutchid, ellujäänud), iga mängija tulemustabeli rida |

Parquet-faili jaluses on lugemisjuhised (võti `heat3d`), nii et see avaneb ilma
seadistuseta: mängija kui isik, pool kui rühm, iga raund (`roundId`, "<match> #NN") kui seanss,
vaatesuund sees ja maailm õiges suunas (CS2 maailm on parempoolne, Z üleval; vaikimisi
Z-üles-kaardistusega loetuna tuleks see peegelpildis). Vt [Veergude kaardistamine](column-mapping.md)
ja [Failide laadimine](loading-files.md). `python -m heat3d_cs2 map <map>` eksportib kaardi geomeetria
samas teljestikus, laaditav jaotises **Tase**.

Numbrite taga olevad kokkulepped on konverteri omad (öeldud tema README-s ja kantud
iga kokkuvõttesse): surm on **trade'itud**, kui tema tapja tapeti ühe ohvri meeskonnakaaslase
poolt **5 s** jooksul; **KAST** on nende raundide osa, kus on tapmine, abi (pimestusabi loeb),
ellujäämine või trade'itud surm; **kahju** on tegelikult kaotatud tervis, ainult vastased; **clutch**
on viimane elus pool vastastega seismas, võidetud, kui pool võidab. **Ost** iga poole kohta
on keskmine varustuse väärtus vaba aja lõpus – iga regulatsioonipoolaja esimene raund on püstoliraund
(ülejõu ajal mitte), seejärel alla 1500 dollari eco, alla 4000 dollari force buy, rohkem täis ost.

## Vahekaart {#the-tab}

Vahekaardi Matš külgribal on ülal soojuskaardi režiimi lüliti ja seansi valija, seejärel all
matši jaotised, ning soojuskaardi paneelid **Filtrid**, **Tase** ja **Kaamera** – vaade on
soojuskaart mis tahes Parquet-ist, mis on laaditud vahekaardil Soojuskaart.

### Matšide kokkuvõtted {#match-summaries}

| Juhtelement | Teeb |
|---|---|
| **Laadi matšifailid…** | valib `.json` faile (mitu korraga): `.match.json` kokkuvõtted |
| lohista vaatele | vaatele lohistatud JSON-failid laaditakse samamoodi, kui vahekaart Matš on avatud (muud failid ignoreeritakse) |
| **Tühjenda** | eemaldab kõik matšid |
| **Kõik matšid** (kahe või rohkema korral) | "N matši, M raundi": statistika kõigi üle |
| matši rida | "TeamA 13 vs TeamB 9", kaart · N raundi: avab selle matši |

Fail võetakse vastu, kui see on JSON ja sisaldab `"format": "heat3d-cs2-match"` ning massiive
`rounds`, `players` ja `teams`. Vead loetakse nuppude all: "<file>: not JSON" (ei ole JSON),
"<file>: not a CS2 match summary (heat3d-cs2-match)" (ei ole CS2 matši kokkuvõte),
"<file>: rounds, players or teams missing" (puudub rounds, players või teams). Matš, mis laaditakse
uuesti (sama `match` nimi), asendab varasema. Matšid on sorteeritud kaardi, seejärel nime järgi.
Kui laaditud on täpselt üks matš, avatakse see; muidu valik jääb (vaikimisi kõik matšid).

Kui midagi pole laaditud, selgitab jaotis: konverteeri käsuga `python -m heat3d_cs2
demos`, laadi siia `.match.json` failid ja vahekaardil Soojuskaart `.parquet` failid.

### Matš (üks matš avatud) {#match-one-match-open}

**Päis:** mõlemad meeskonnad oma skooriga, kaart, poolajad –
"halves 7-5, 6-6": raundid 1–12 ja 13–24 (premier- ja võistlusmäng MR12;
kokkuvõtte enda poolaja pikkus, kui see on öeldud, seega 1–15 ja 16–30 MR15 puhul) –
seejärel, kui matš läks ülejõule, selle skoor eraldi: "overtime 4-2", raundid pärast mõlemat poolaega.
Viigiraund ei loe kummalegi meeskonnale. Ja "N rounds cut off in the demo", kui kokkuvõte loetleb
katkestatud raunde.

**Raundiriba:** lahter iga raundi kohta, värvitud selle poole järgi, kes võitis, koos numbri ja
märgiga, kuidas see lõppes. Viigiraund (võitjat pole) on neutraalne hall lahter märgiga `=`, mitte
kunagi poole värv; selle vihje ütleb "Round 30: a draw - neither side won it".

| Märk | Lõpetas |
|---|---|
| B | pomm plahvatas |
| D | pomm lõhkamata |
| K | kõik likvideeritud |
| T | aeg sai otsa |
| S | alistumine |
| = | viik |
| ? | muu |

Jaotusjoon märgib teise poolaja algust (raund 13 või raund pärast kokkuvõtte poolaja pikkust) ja
iga kolmeraundilise ülejõu poolaja algust (raundid 25, 28, 31 …). Hoia lahtril: "Round 7: TeamA (T) - bomb exploded, planted A"
("…, planted, site unknown", kui kokkuvõttes pole ala) ning mõlema poole ost ja varustuse väärtus. Klõpsa raundi avamiseks;
klõpsa uuesti sulgemiseks ("Click a round for its kills, economy and replay.").

**Raund:**

- "Round 7: <team> won - <how>" ("Round 30: a draw - neither side won it", viigi korral) ja kui kaua raund kestis (külmutuse lõpust otsuseni, m:ss);
- majandus: iga poole meeskond, ost (püstol, eco, force buy, täis ost) ja varustuse väärtus ("$4,350");
- pommi panek: ala, mängija ja aeg raundis (kummastki kokkuvõtte versioonist); "Planted by <player> at 1:05, site unknown", kui ala pole teada;
- **tapmiste voog** järjekorras: aeg raundis, ründaja (poole värvis; "world", kui ründajat pole), relv ja märgid – **HS** pealelöök,
  **WB** läbi seina, **SM** läbi suitsu; **open** raundi esimene tapmine,
  **trade** (kättemaks kaaslase eest 5 s jooksul), **traded** (tapja tapeti 5 s jooksul), **team** meeskonnakaaslase tapmine (enesetapp ei ole). Tapmised pärast raundi otsust on tuhmid;
- clutchid: "<player> (T) alone against 3: won the clutch" / "lost it";
- kes oli lõpus elus, poole kaupa ("nobody");
- **Näita raundi**: kõik selles raundis soojuskaardil;
- **Raundi kordus**: esitab raundi kastidena selle algusest (allpool).

**Näita soojuskaardil** nupud (vt [allpool](#show-in-the-heatmap)) sellele matšile või avatud raundile.

### Tulemustabel {#scoreboard}

Tabel iga meeskonna kohta, rida iga mängija kohta:

| Veerg | On |
|---|---|
| K, D | tapmised, surmad |
| A | abid, sh pimestusabid |
| ± | tapmised miinus surmad (roheline üle 0, punane alla) |
| ADR | kahju raundi kohta, tegelikult kaotatud tervis |
| KAST | % raundidest, kus on tapmine, abi, ellujäämine või trade'itud surm |
| HS | % pealelöögi tapmistest |
| Open | avaduellid võidetud-kaotatud |
| Cl | clutchid võidetud/mängitud |

Hoia mängijal: trade'i tapmised, trade'itud kordi, pimestusabid, pimestatud vastased,
abilise kahju ja mitme tapmise raundid ("2×3k"). **Klõpsa mängijal**, et näha tema tapmisi ja surmi soojuskaardil (sellel matšil).

### Matšide lõikes (Kõik matšid) {#across-matches-all-matches}

Üle kõigi laaditud matšide:

- "N matši · M raundi · <kaardid>", ja "N rounds drawn, won by neither side", kui viike oli;
- **Võidetud ringid** iga poole kohta: üldiselt, **püstoliraundidel** (kokkuvõtte püstoliraundid) ning **eco**, **force** ja **täis** ostudel (igaüks protsendina mängitud raundidega; hoia "won of played" jaoks). Viigiraund on mängitud mõlema poole poolt ja ei võida kumbki;
- **Pomm**: pommi paigaldused ala kohta ja kui sageli T pool neid raunde edasi võitis ("12 plants on A (T won 67%)"), paigaldused, mille ala kokkuvõte ei tea iseseisvalt ("2 plants on an unknown site (T won 50%)"), või "never planted"; kuidas raundid lõppesid, kõige levinum esimesena;
- "The side that took the opening kill won N% of those rounds." (enesetapp ei ole avatapmine; viigiraund ei muuda avatapmist);
- **Avaduellid, kus**: kümme kohta kõige rohkema avatapmisega (ohvri asukoha järgi; mängu kohanimed loetavaks, "TopofMid" → "Top of Mid"), duellid ja osa, mille T pool võitis;
- **Mängijad**: viisteist parimat tapmiste miinus surmade järgi, kokku kõigi nende matšide peale (sobitatud Steam ID järgi): matšid, K-D, ADR ja KAST kaalutud mängitud raundidega, HS% kaalutud tapmistega, avaduellid. **Klõpsa mängijal**, et näha tema tapmisi ja surmi kõigis matšides soojuskaardil.

Nuppude Näita soojuskaardil kõigi laaditud matšide jaoks on selle all.

## Näita soojuskaardil {#show-in-the-heatmap}

Iga link seab soojuskaardi enda **filtrid**, nii et see, mida näidatakse, jääb nähtavaks ja muudetavaks paneelis Filtrid, ja **Näita kõiki** tühjendab need.
Need töötavad vahekaardil Soojuskaart laaditud soojuskaardi tabelil; vahekaart Matš ei laadi seda kunagi ise.

| Nupp | Näidatavad sündmused |
|---|---|
| **Asukohad** | `position` – kus mängijad olid, kaheksa korda sekundis |
| **Tapmised** | `kill` – kus tapja seisis |
| **Surmad** | `death` – kus ohver langes |
| **Avatapmised** | `kill` ja `death` väärtusega `opening` = 1 – iga raundi esimene tapmine, kus mõlemad seisid (pakutakse ainult siis, kui tabelil on veerg `opening`) |
| **Suitsud** | `smoke` – kus suitsud maandusid |
| **Flashid** | `flash` – kus pimestusgranaadid plahvatasid |
| **Molotovid** | `molotov` – kus molotovid ja süütegranaadid põlesid |
| **HE** | `he` – kus HE granaadid plahvatasid |
| **Pommi panekud** | `plant` – kus pomm paigaldati |
| **Laskud** | `shot` – kust laskudi |

Ulatus sõltub nuppude asukohast: kõik laaditud matšid, see matš või see raund ("Näita soojuskaardil – round 7").

Seda, mida ei saa rakendada, öeldakse nuppude all, mitte ei filtrita vaikselt tühjaks: "no match column retained - match not applied",
"match: X not in the loaded data", sama raundi ja sündmuste kohta, "player X not in the loaded data", "side X not in the loaded data",
"soojuskaardi andmeid pole laaditud: laadi matšide failid .parquet vahekaardil Soojuskaart". Kui andmeid pole laaditud, ütlevad lingid
ka "Load the matches' .parquet files in the Soojuskaart tab to see them on the map."

**Raundi kordus** lisaks lülitab soojuskaardi **Kastikordusele**, ajajoone režiimi *esita* koos aknaga *eluiga*,
kerib raundi seansi algusesse ja esitab. Kui raund ei ole laaditud andmete seanss: "this round is not a session of the loaded data: nothing to replay".

## Arendajatele {#for-developers}

Kood: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Kokkuvõtte versioonid {#summary-versions}

Vahekaart loeb versiooni 1 ja versiooni 2 kokkuvõtteid (failis `"version"`) kõrvuti ja
käsitleb neid ühtmoodi:

| | Versioon 2 | Versioon 1 |
|---|---|---|
| pommi panemise aeg | sekundid raundis, nagu tapmised | matši sekundid; vahekaart lahutab raundi alguse |
| pommi panemise ala | `A` või `B`; tühi, kui demo seda ei ütle | `A`, `B` või olemi number – loetakse teadmata alaks |
| poolaja pikkus | `halfLength`, sealt, kus pooled esimest korda vahetuvad; 12, kui see on null | 12 (MR12) |
| püstoliraundid | `pistolRounds` (raund 1 ja esimene raund pärast poolaega) | raundid, mille ost on `pistol` |
| viigiraund | `winner` ja `winnerTeam` tühjad | - |
| enesetapp | `suicide` tapmisel, mitte kunagi meeskonnakaaslase tapmine | öeldud, et ründaja ja ohver on sama mängija |

Tapmise `noscope` ja `attackerBlind` (versioon 2) ei näidata vahekaardil Matš, mis ei näita ka
ühtegi kohta soojuskaardi tabelist, seega ei muuda granaadirea tühi `place` siin midagi.

Kuidas fookus muutub filtriteks (`focusFilters`):

- **match** → kategooriafilter veerus `match`;
- **round** → vahemikufilter `round` = N arvulisel veerul `round` (kategooriafilter kategoorilisel), ja raundi seanss
  (`<match> #NN`) valitakse seansivalijas;
- **events** → kategooriafilter veerus `event`;
- **player** → isikufilter sellel mängijal;
- **side** → rühmafilter.
