---
title: "Pretvorniki ohranijo vse"
parent: "Uvoz podatkov"
nav_order: 8
lang: "sl"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Pretvorniki ohranijo vse

Ta stran vam ni potrebna, da odprete posnetek. Namenjena je ljudem, ki pišejo orodja, ki spreminjajo datoteke iger v tabele 3DHeat, in vsakomur, ki želi vedeti, zakaj te tabele vsebujejo toliko.

Vsako orodje, ki spremeni posnetek igre, demo, dnevnik ali živo telemetrijo v
nekaj, kar pregledovalnik odpre, ubere eno pravilo:

> **Pretvori vse, kar izvor vsebuje in kar se da zdaj prebrati, preostanek pa ohrani celega, da ga je mogoče prebrati pozneje brez izvirne datoteke.**

Posnetek pogosto izgine po posodobitvi igre, ponovni namestitvi ali polnem disku, živi tok pa izgine v trenutku, ko je poslan. Kar pretvornik zavrže, je izgubljeno za vedno; kar ohrani celega, se da dekodirati tisti dan, ko nekdo to razume. Pretvornik zato nikoli ne odloča, kaj bo koristno: dekodira, kar lahko, vsako drugo sporočilo, paket, dogodek, lastnost ali vrstico pa ohrani nespremenjeno ob tabeli, in v svojem izpisu pove, koliko od vsega je prebral in koliko je samo ohranil.

Ta stran je dogovor, ki si ga delijo vsi pretvorniki: pretvorniki posnetkov War Thunder, World of Tanks, World of Warships in Squad, pretvornik demo datotek CS2, ozadni nadzornik (njegov dekoder posnetkov Dota in vsak živi vmesnik) ter bralniki telemetrije orodja za zajem igre in lastni uvozi pregledovalnika (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Lastna bralnika pregledovalnika sta opisana v [Tacview posnetki](tacview-acmi.md) in [Nalaganje datotek](loading-files.md); oblika ene datoteke je [Ena datoteka na tekmo](container.md). Ena tekma postane tabela, `match.json` in spremljevalne datoteke, po izbiri spakirane v eno datoteko `.3dheat`. Vsako orodje ima v README razdelek **Popolnost**, ki za ta izvor našteje, kaj je prebrano, kaj je ohranjeno surovo in kaj ni na voljo, ter zakaj.

## Trije domovi za vsak element {#three-homes-for-every-item}

Vse, kar izvor vsebuje, konča na natanko enem od treh mest:

| Dom | Kaj tja pride |
|---|---|
| **Dekodirano** | Tabela (ena vrstica na vzorec ali dogodek, stolpci, ki jih bere pregledovalnik, dodatni stolpci za vsako drugo vrednost, ki pripada vrstici) in dokument tekme `<match>.match.json` (vse, kar pripada tekmi kot celoti: nastavitve, seznami igralcev, rezultati, tablice rezultatov, samopreverjanje). |
| **Ohranjeno surovo** | Spremljevalna datoteka ob tabeli: vsak element, ki ni dekodiran ali je dekodiran samo deloma, celega in nespremenjenega, z vrsto, časom in enoto ali entiteto, ki mu pripada. |
| **Ni na voljo** | Navedeno v razdelku Popolnost v README z razlogom: format tega ne nosi (odjemalski posnetek nima vhodov drugih igralcev), izvor tega nikoli ne pošlje ali pa branje ni dovoljeno (zaščiten proces, šifriran blok, katerega ključ ni naš za uporabo). |

Element, ki je **delno** dekodiran, je dekodiran *in* ohranjen surovo: tabela
dobi tisto, kar je razumljeno, spremljevalna datoteka pa celoten element, tako da
boljši dekoder pozneje ne potrebuje izvirne datoteke.

Četrtega mesta ni. Zavreči nekaj, ker se je zdelo neuporabno, ker je bilo
"verjetno" podvojeno ali ker je bilo veliko, je napaka. Redčenje je dovoljeno
samo v tabeli (kamera na 2 Hz namesto 60), nikoli v spremljevalni datoteki.

## Spremljevalne datoteke {#sidecars}

Spremljevalna datoteka je datoteka Parquet ob tabeli, poimenovana po njej:

```
<folder>/<match>.parquet              the table
<folder>/<match>.match.json           the match document
<folder>/<match>.<what>.parquet       a sidecar
```

`<what>` je ena beseda s tega seznama. Nov pretvornik izbere besedo, ki ustreza,
ali tukaj doda novo **in** jo doda v `SIDECAR_PARQUET` v
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
da jo pregledovalnik izpusti, kadar se naloži cela mapa.

| `<what>` | Vsebuje | Uporablja |
|---|---|---|
| `messages` | paketi, klici metod entitet in posodobitve lastnosti omrežnega toka, celi | War Thunder, World of Tanks, World of Warships |
| `flight` | vnosi modela leta po letalu, celi | War Thunder |
| `packets` | celi okvirji in omrežna sporočila ali deli vsebnika, zunaj toka entitet | CS2, Dota 2, Squad |
| `events` | dogodki igre z vsemi ključi, kot jih poda razčlenjevalnik | CS2 |
| `entities` | posodobitve entitet in lastnosti, oddaljeni klici, odprti in zaprti kanali z izvozi, ki jih dekoder potrebuje | Squad, Dota 2 |
| `props` | vsaka lastnost entitete, ki jo razčlenjevalnik prebere, ob vsaki spremembi | CS2 |
| `units` | stanje enot zunaj tabele položajev | Dota 2 |
| `combatlog` | bojni dnevnik, vsak vnos z vsemi polji | Dota 2 |
| `strings` | vsak vnos vsake tabele nizov | CS2, Dota 2 |
| `objectives` | območja zajetja in cilji, vsaka sprememba z njenim časom | War Thunder |
| `raw` | živi tok: vsak prejeti paket, vrstica, dokument API-ja ali branje pomnilnika, celi | seje nadzornika (`heat.raw.parquet`), snemalniki krogov orodja za zajem igre (`<stamp>_<game>.raw.parquet`), datoteke posnetkov osu!, LoL in Valorant nadzornika |

Nalaganje mape v pregledovalniku preskoči vsak `*.<what>.parquet` s tega seznama
in vsak `*.match.json`, `*.meta.json`, `*.summary.json` ter druge datoteke JSON
kot spremljevalne; če eno od njih odprete samo po sebi, z izbiro ali spustitvijo
te datoteke, se naloži kot katerakoli druga tabela (glejte [Nalaganje datotek](loading-files.md)).

To so datoteke, kot jih pretvornik zapiše z `--loose`. Privzeto orodja War Thunder, CS2 in Tacview spakirajo tabelo, dokument in spremljevalne datoteke tekme v eno datoteko `<match>.3dheat` pod istimi imeni (glejte [Ena datoteka na tekmo](container.md)); vse tukaj velja za vsak člen.

### Stolpci {#columns}

Vsaka vrstica spremljevalne datoteke je en element. Stolpci so v tem vrstnem redu, tisti, ki veljajo:

| Stolpec | Vrsta | Kaj |
|---|---|---|
| `time` | float64 | sekunde na isti uri kot `time` tabele (ali `tick`, kjer izvor šteje ticke; tedaj oboje) |
| `type` | niz (slovar) | kaj element je, v lastnih izrazih izvora: vrsta paketa, id sporočila, ime dogodka, pot lastnosti, predpona vrstice |
| `name` | niz (slovar) | njegovo ime, kjer je znano (ime skupnosti, ime razreda), sicer prazno |
| `entity` / `unit` / `uid` / `player` | celo število ali niz | komu pripada, v istih id-jih kot v tabeli, da se vrstica spremljevalne datoteke lahko pridruži sledi |
| `decoded` | niz (JSON) | kar je o njem razumljeno, kjer je kaj; sicer prazno |
| `payload` | binarno | bajti elementa, celi in nespremenjeni (binarni izviri) |
| `text` | niz | besedilo elementa, celo in nespremenjeno (besedilni izviri: vrstica dnevnika, objekt JSON, blok ključ-vrednost) |

Dodatni stolpci so dovoljeni (zamik bitov, velikost, kanal). Nizi, ki se ponavljajo, so kodirani s slovarjem, datoteka pa je zapisana z zstd, zato spremljevalna datoteka ostane delček velikosti samega posnetka.

Spremljevalna datoteka mora biti sama po sebi dovolj: pozneje napisan dekoder bere spremljevalno datoteko, nikoli izvirnega posnetka. Kjer elementa ni mogoče razumeti brez konteksta (razred entitete, tabela nizov, ključ, na katerega sporočilo kaže), gre kontekst tudi v spremljevalno datoteko ali v dokument tekme.

### Živi viri {#live-sources}

Živi vmesniki (telemetrija UDP, deljeni pomnilnik, dnevnik igre, lokalni API) nimajo datoteke, h kateri bi se lahko vrnili. **Zabeležijo vsako polje, ki ga vir pošlje**, tudi tiste, ki jih nič ne uporablja še:

- tok paketov: vsak paket celega, `payload` so bajti, `type` njegov id paketa ali format, s hitrostjo, s katero prihaja;
- deljeni pomnilnik ali anketiran API: vsako polje vsakega branja, bodisi kot imenovani stolpci bodisi kot celoten blok v `payload`, s hitrostjo, s katero ga vmesnik bere;
- dnevnik: vsaka vrstica, `text` je vrstica, `type` vrsta vrstice, vključno z vrsticami, na katere vmesnik ne reagira.

To gre v `<session>.raw.parquet` ob tabeli seje. Velikost je cena pravila; zmanjšuje jo zstd in kodiranje s slovarjem, ne izpuščanje stvari.

## Samopreverjanje {#the-self-check}

Vsak pretvornik zapiše v svoj dokument tekme (ali v `meta.json` seje, ali v povzetek, kjer nima dokumenta tekme) blok `completeness` pod `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Polje | Pomen |
|---|---|
| `seen` | koliko elementov te vrste izvor vsebuje |
| `decoded` | prebrano celo v tabelo ali dokument tekme |
| `partial` | prebrano delno v tabelo ali dokument, celo ohranjeno v spremljevalni datoteki |
| `raw` | ohranjeno celo samo v spremljevalni datoteki, ni dekodirano |
| `lost` | `seen - decoded - partial - raw`: mora biti 0 |

Najvišji `lost` je vsota. Preizkusi pretvornika trdijo, da je na njihovih sintetičnih vzorcih 0, README pa pove, kakšen je bil na pravih. Neničeln `lost` je pretvornik, ki pove, da je prekršil pravilo; poimenuje vrsto, da se vrzel da najti.

»Vrste« so izvorove lastne: vrste paketov, id-ji sporočil, imena dogodkov, skupine lastnosti, vrste vrstic. Štejejo se tam, kjer jih pretvornik sreča, ne z vnaprej pripravljenega seznama pričakovanega, zato se vrsta, ki je nihče ni poznal, pokaže s svojim številom, namesto da bi izginila.

## Razdelek Popolnost v README {#the-readmes-completeness-section}

README vsakega pretvornika ima razdelek z naslovom **Popolnost** s tremi seznami:

- **Prebrano**: kaj gre v tabelo in dokument tekme ter kako je bilo vsako novo polje preverjeno proti nečemu neodvisnemu (lastnim številkam igre, drugemu viru, posnetku, narejenemu zato).
- **Ohranjeno surovo**: kaj je v kateri spremljevalni datoteki, pod katerim `type`, in kar je o tem doslej znano.
- **Ni na voljo**: kar izvor ne nosi ali kar se sme prebrati, in zakaj.

Povezuje nazaj sem.

## Kje stoji vsak pretvornik {#where-each-converter-stands}

| Pretvornik | Spremljevalne datoteke | Njegov razdelek Popolnost |
|---|---|---|
| Posnetki War Thunder | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (števila samopreverjanja so pod `counts`; blok `completeness` bo sledil) |
| Posnetki World of Tanks | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Posnetki World of Warships | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demo datoteke strežnikov Squad | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demo datoteke CS2 | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Posnetki Dota 2 (nadzornik) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Posnetki Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Posnetki osu!, LoL, Valorant (nadzornik) | `raw` | njihove strani v [dokumentaciji nadzornika](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Živi vmesniki (nadzornik) | `raw` | stran vsake igre v [dokumentaciji nadzornika](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), in [razvoj](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) za `Session.raw` |
| Snemalniki krogov (orodje za zajem igre) | `raw` in bajti `unparsed` v datoteki kroga Forza | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Lastni uvozi pregledovalnika | nobene: glejte spodaj | ta stran |

### Lastni uvozi pregledovalnika {#the-viewers-own-imports}

Tacview ACMI, OCAP in formati GPS se berejo v brskalniku iz uporabnikove lastne
datoteke; pregledovalnik nič od tega ne shranjuje, zato datoteka sama ostane zapis.
Kljub temu prebere, kar more:

- **Tacview ACMI** (`src/data/acmi.ts`): vsaka vrstica predmeta s položajem je vrstica z vsako lastnostjo, ki jo posnetek nosi; vsak dogodek je vrstica, vsaka odstranitev je vrstica; lastne lastnosti posnetka (z FileType in FileVersion iz glave) so na vsaki vrstici kot `RecordingInfo`; vrstica s komentarjem je dogodek `Comment`, predmet, ki nikoli ne dobi položaja, pa vrstica `Unplaced` na referenčni točki, in U/V sta stolpca, kadarkoli ju ima katera koli vrstica. Vrstica lastnosti brez položaja je prebrana delno: njene vrednosti dosežejo naslednjo vrstico predmeta, ne ob svojem času. `AcmiTable.completeness` šteje vrstice datoteke po vrsti.
- **OCAP** (`src/data/ocap.ts`): vsi okvirji entitet, streli, oznake, vsaka vrsta dogodka (neznane vrste kot vrstice "Mission" z njihovim besedilom) in lastna polja dokumenta (`Info`). Še ni prebrano: polja entitet in dodatni elementi položaja, razen tistih, navedenih v njegovi glavi (dodatki novejšega snemalnika), in ponovljeni okvirji mrtve enote po njeni smrti (namerno redčeni: v njih se nič ne spremeni).
- **Formati GPS** (`src/data/geoTracks.ts`): fiksni položaji, njihov čas, višina, smer in hitrost ter srčni utrip, kadenca, moč, temperatura, sateliti, HDOP in tlačna višina, kjer jih datoteka beleži. Še ni prebrano: druge razširitve GPX in KML, stavki NMEA, razen tistih s položajem, zapisi IGC, razen fiksnih položajev in njihovih razširitev, ter sporočila FIT, razen zapisov (krogi, seje, podatki o napravi).

Te vrzeli so navedene, da se zaprejo, ne da bi se opravičevale; izvozi pregledovalnika naložene posnetke (`src/data/exportRecording.ts`) zapišejo samo to, kar je bilo prebrano.

## Dodajanje pretvornika {#adding-a-converter}

1. Naštejte, kaj format vsebuje, iz njegove dokumentacije, njegovih lastnih struktur ali s štetjem vsake vrste sporočila v pravih vzorcih. Seznam je `types` samopreverjanja.
2. Dekodirajte, kar se da zdaj preveriti. Vsako novo polje se pred vstopom v tabelo preveri proti nečemu neodvisnemu; polje, ki se še ne da preveriti, ostane surovo.
3. Ostalo ohranite celo v spremljevalni datoteki, poimenovani kot zgoraj, s stolpci zgoraj.
4. Zapišite blok `completeness` in preizkus, da ima `lost` 0.
5. Napišite razdelek Popolnost v README in povežite sem.
6. Če je `<what>` spremljevalne datoteke nov, ga dodajte v zgornjo tabelo in v `SIDECAR_PARQUET` v `src/data/filePick.ts`.

Pretvorniki so čista izdelava: napisani so iz formatov, dokumentacije in vzorcev, nikoli iz kode GPL ali AGPL. Vzorci pravih posnetkov ostanejo na računalniku, ki jih je naredil; preizkusi uporabljajo sintetične datoteke.

