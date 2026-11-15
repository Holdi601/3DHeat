---
title: "Nahrávky Tacview (ACMI)"
parent: "Ako dostať dáta dnu"
nav_order: 7
lang: "sk"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---


# Nahrávky Tacview (ACMI)

Tacview je program, ktorý zaznamenáva lety v leteckých simulátoroch; jeho súbory končia na `.acmi`. 3DHeat ich otvára, aby ste videli, kam lietalo každé lietadlo.

Nahrávky letov z Tacview sa načítajú ako každá tabuľka: vyberte alebo pretiahnite `.acmi` (text, `.txt.acmi`, alebo zabalený, `.zip.acmi`) a stlačte **Načítať**. Potom dostanete teplo všetkých letov a na karte **Zápas** prehrávanie s figúrkami, stopami a zoznamom udalostí ([Prehrávanie zápasu](match-replay.md)). ACMI je verejný formát súborov Tacview ([dokumentácia](https://www.tacview.net/documentation/acmi/)); DCS (cez exportér Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS a ďalšie ho zapisujú, takže to číta ktorýkoľvek z nich.

## Čím sa nahrávka stane {#what-a-recording-becomes}

Jeden riadok vždy, keď sa zapíše pozícia objektu, jeden riadok na každú udalosť na mieste objektu a jeden riadok, keď objekt zmizne (`Removed`, kde bol naposledy). Udalosť o objekte, ktorý ešte nebol videný - záložka, správa pre všetkých - je riadok objektu `(recording)` v referenčnom bode. Nahrávka nesie vlastné pokyny na čítanie, takže krok mapovania sa vyplní sám. Čítač zapisuje tieto stĺpce: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, a potom ďalšie vlastnosti, ktoré nahrávka má. Ich úlohy:

| Stĺpec | Úloha | Význam |
|---|---|---|
| Time | čas | Sekundy po ReferenceTime nahrávky; Unixové sekundy, keď ju má, takže hodiny ukážu skutočný čas. |
| X, Y | pozícia | Východ a sever, metre, na rovine dotýkajúcej sa zeme v referenčnom bode nahrávky: vzdialenosti a smery sú pri ňom pravdivé, s odchýlkou pod tisícinu pri 100 km. Sever sa stáva svetovým -Z. |
| Altitude | pozícia (hore) | Metre. |
| Object | osoba | Pilot a názov objektu s jeho id, napr. `Viper 1 (F-16C_50) #a01`; bezpilotný objekt `(T-90A) #401`. |
| Coalition | tím | Strana (alebo farba, keď nie je koalícia). |
| Heading, Pitch | pohľad | Stupne; smer 0 je sever. |
| Recording | relácia | Title nahrávky, alebo názov súboru: viac nahrávok sa načíta vedľa seba bez spojenia ich stôp. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtre | Uchované na filtrovanie; Type a Name vyberú [figúrku](figures.md) každého objektu, Event napája zoznam udalostí rozboru, Roll nakláňa lietadlo. |
| U, V | | Vlastné ploché metre hry, keď ich má každá vzorka (DCS ich zapisuje). |
| EventObjects | filtre | Každý objekt, ktorý udalosť pomenuje (`Message|a01|b02|...`), podľa id. |
| RecordingInfo | | Vlastnosti nahrávky, ako boli v tom okamihu - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - ako JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtre | Akákoľvek ďalšia číselná vlastnosť, ktorú nahrávka nesie. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtre | Akákoľvek ďalšia textová vlastnosť, ktorú nahrávka nesie; vlastnosť s hodnotou, ktorá nie je číslo, je text. |

Všetky štyri tvary pozície z Tacview (`lon|lat|alt`, s `u|v`, s `roll|pitch|yaw`, a so všetkými a smerom) sa čítajú; prázdne polia si ponechajú poslednú hodnotu; `-id` odstráni objekt a id použité znova po ňom je nový objekt. Escapované čiarky a pokračujúce riadky sa spracujú.

Pozície sa vždy premietajú zo zemepisnej šírky a dĺžky, nikdy sa neberú z U/V, takže nahrávky zo všetkých hier zdieľajú jednu projekciu s pozadím skutočného sveta.

## Servery DCS: kto vyhral a ako sa skončil každý bojový let {#dcs-servers-who-won-and-how-each-sortie-ended}

Server DCS pre viac hráčov nahráva svoje misie cez Tacview nepretržite a trvalý PvP server na mnohých z nich vedie kampaň: strana vyhrá, keď obsadí každé letisko, FARP a zónu tej druhej, čo trvá dni a veľa reštartov misie. Nahrávky obsahujú lety, nie kampaň: žiadna správa nehovorí, kto čo obsadil, letiská sa zapíšu raz na začiatku a nič nehovorí, kto vyhral. Konvertor Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) pridá do každého riadku to, čo sa dá vedieť, a čo sa vedieť nedá, nechá prázdne - nikdy nehádá.

| Stĺpec | Význam |
|---|---|
| `server` | server alebo kampaň, z hlavičky nahrávky (jej Title, Author a Comments pomenúvajú známe verejné servery - Blue Flag, SPS Contention, Growling Sidewinder; inak Author, ktorý niekoho pomenúva); `--server Name` ho pomenuje pre celý priečinok. Nahrávka, ktorej hlavička nepomenúva žiadny server - Author ako `Admin`, Title a Comments, aké nepíše žiadny známy server - zostane nepriradená: `server` je prázdny, aj keď bola stiahnutá zo stránky s nahrávkami nejakého servera, lebo tá stránka môže obsahovať aj misie iných komunít |
| `mission` | Title nahrávky bez verzie a mesiaca kampane: `Operation_Example_V7.7.99` sa zmení na `Operation Example` |
| `campaign` | kolo kampane, ku ktorému nahrávka patrí, podľa servera, mapy a čísla: `Example Server North 3`. Jedna nahrávka je jedna relácia (od reštartu po reštart); kolo trvá cez mnoho relácií, dni alebo týždne |
| `round` | číslo toho kola: vlastné číslo servera, ak ho zverejňuje, inak n-té kolo videné na tom serveri a mape; zo súboru kôl (nižšie), bez neho prázdne |
| `session` | poradie nahrávky medzi reláciami kola, 1, 2, ...; `sessionStart` jej skutočný začiatok (sekundy Unix) |
| `heldRed`, `heldBlue` | sporné miesta, ktoré každá strana držala na začiatku relácie, zo zreťazeného súboru kôl (nižšie) |
| `won`, `matchWon` | 1, keď strana riadku (jeho Color, Red alebo Blue) tú kampaň vyhrala, 0, keď prehrala; prázdne tam, kde žiadny súbor kôl nepomenúva víťaza, a v neutrálnych riadkoch. Kampaň je zároveň kolo aj zápas, takže obe obsahujú to isté |
| `roundEndReason` | `capture` pre kampaň vyhranú obsadením všetkého |
| `won`, `matchWon` v každej relácii kola | výsledok kola, zapísaný do každej jeho nahrávky, keď je známy jeho koniec |
| `sortie` | v riadkoch lietadla: jeho let, 1, 2, ... od vzletu po vzlet; čas na zemi pred prvým vzletom a po pristátí sa počíta k letu, ku ktorému patrí |
| `sortieResult` | ako sa ten let skončil: `landed`, `landed damaged` (po zásahu vo vzduchu), `ejected`, `shot down`, `destroyed` (na zemi), `crashed`, `despawned` (zmizlo vo vzduchu bez viditeľnej príčiny - hráč odišiel), `airborne at end`, `no takeoff` |
| `sortieKills` | zostrely pripísané lietadlu v tom lete |

Na trvalom serveri je bojový let jednotka, ktorá niečo znamená: filtrujte `sortieResult` = `shot down`, aby ste videli, kde sa lety stratili, alebo rozdeľte teplo podľa `sortieResult` alebo `server` v [rozpise](breakdown.md). Vzlety, pristátia, katapultovania, zostrely a havárie, z ktorých sa skladá, sú udalosti, ktoré konvertor odvodí z pohybu lietadla (vyššie).

Miesta obsadené medzi dvoma reláciami kola - známe zo súboru kôl, nižšie - sú udalosti `capture` na začiatku neskoršej nahrávky: `Object` `(campaign)`, na tom mieste, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Letisko alebo FARP, ktoré zmení stranu tam, kde to nahrávka ukazuje - znova zapísané v druhej farbe, alebo odstránené a do piatich minút znova zapísané na svojom mieste v druhej farbe - sa stane udalosťou `capture` na ploche: `Event` = `capture`, `Airfield` jeho názov, `Detail` `Red to Blue`, `Coalition` jeho nová strana. Plocha prvýkrát zapísaná v nejakej farbe nie je dobytie. Servery, ktoré sme si doteraz pozreli, zapisujú svoje plochy raz, takže ich nahrávky neobsahujú žiadne dobytia.

### Súbory kôl {#rounds-files}

Súbor kôl hovorí pre každý server jeho kolá kampane, kto ich vyhral a relácie každého z nich. Pochádza z toho, čo server zverejňuje, alebo zo samotných nahrávok (nižšie).

Kto vyhral kampaň, zverejňuje server - denník kampane na svojej webovej stránke -, v nahrávke to nie je. Nesie to súbor kôl a konvertor ho číta cez `--rounds file.json` (dá sa zadať viac ako jeden):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Nahrávka patrí ku kolám svojho `server`, ktorých `title` (regulárny výraz) sa zhoduje s jej Title; každý riadok patrí ku kolu, do ktorého padne jeho skutočný čas - RecordingTime nahrávky plus sekundy riadku, nie dátum misie v hre. Časy sú v UTC. Kolo bez víťaza (vystriedané, ešte beží) dá svojim riadkom číslo kola a prázdny výsledok.

Náprotivok dokumentu zápasu, pätička `acmi`, hovorí, odkiaľ výsledok pochádza, tak ako `result.source` zápasu War Thunder: `outcome.result` je `{ winner, round, endReason, source }`, `source` je `source` súboru kôl, alebo `null`, keď nič nepomenovalo víťaza. `outcome` uvádza aj kolá nahrávky, jej dobytia a jej bojové lety podľa toho, ako sa skončili:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Riadok pilota `Viper 1 (F-16C_50) #a01` na modrej strane v tej kampani potom znie: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Kolá zo samotných nahrávok {#rounds-from-the-recordings-themselves}

Trvalý server si kampaň drží cez reštarty a každá nahrávka začína pozemnými jednotkami a statickými objektmi oboch strán tam, kde ich kampaň nechala. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` prečíta prvé minúty každej nahrávky ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), zoradí nahrávky každého servera z jednej mapy podľa času a zreťazí ich:

- **Miesta**: zem v bunkách s veľkosťou asi 2 km; bunka patrí strane, keď sú jej tri štvrtiny jednotiek, ktoré tam sú na začiatku relácie. *Sporné* miesta sú tie, ktoré boli videné v držbe oboch strán.
- **Dobytia**: miesto, ktoré na začiatku ďalšej relácie drží druhá strana - obsadené medzi misiami alebo počas tej predchádzajúcej.
- **Nové kolo**: relácia, ktorej miesta sa od miest predchádzajúcej líšia vo viac ako 60 % z nich - počiatočné rozloženie nového kola, nie krok starého. Kolo sa skončí aj vtedy, keď server prejde na inú mapu (jej relácie začínajú po poslednej a pokračujú ďalej).
- **Kto vyhral**: pri kole, ktoré sa skončilo, strana, ktorá držala každé miesto na začiatku jeho poslednej relácie (`capture`, istota vysoká), inak strana, ktorá držala viac sporných miest (stredná pri dvojnásobku druhej strany, inak nízka; nízka, keď sa skončilo zmenou mapy). Otvorené kolo nemá víťaza, ale každá relácia hovorí, koľko miest každá strana držala na jej začiatku, takže je vidno, kto bol vpredu.
- Server, ktorého relácie začínajú všetky rovnako, si medzi nimi nedrží žiadny stav: nezreťazí sa.

Začiatok poslednej relácie môže byť hodiny pred koncom kola, preto na istote záleží. Overené na serveri, ktorý zverejňuje svojich víťazov: reťaz našla každé nové kolo v relácii, v ktorej sa začalo zverejnené kolo, a strana vpredu pri poslednom začiatku bola zverejneným víťazom v každom z 9 kôl, ktoré mohla overiť. `--official file.json` ponechá zverejnené kolá takého servera a pridá k nim relácie z reťaze; `validation` v súbore hovorí, nakoľko sa reťaz zhodovala. Vo vymyslenej kampani:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Sledovanie kola kampane ako série {#watching-a-campaign-round-as-a-series}

Načítajte nahrávky jedného kola spolu - súbory s rovnakým `campaign` - a prehliadač ich prehrá ako jednu sériu: reláciu za reláciou v ich skutočnom poradí, hodiny alebo dni medzi dvoma skrátené na jednominútovú prestávku. Časová os označí začiatok každej relácie žltou a prestávky ako tmavé pásy a hodiny ukazujú, ktorá relácia sa hrá, a jej skutočný dátum (`session 4/12 · 2026-11-02 12:38 UTC`). Teplo, prehrávanie, filtre a Zistenia fungujú na celej sérii ako na akýchkoľvek načítaných dátach. Sekcia **Kolo kampane** na karte Zápas uvádza relácie s ich dátumami, koľko sporných miest každá strana držala na každom začiatku - aj ako graf za celé kolo - a koľko ich bolo obsadených predtým; kliknutie prejde na začiatok relácie. Nahrávka načítaná samostatne tam hovorí, ktoré kolo a ktorá relácia to je. Nahrávky rôznych kôl načítané spolu nie sú séria: každá začína od nuly, ako samostatné zápasy. Načítanie mnohých zápasov (**Veľa zápasov naraz**) prehrá kolo tiež ako sériu, streamované a prispôsobené GPU, pre kolá s veľkosťou mnohých gigabajtov.

Miesta, ktoré počas kola zmenili majiteľa, sa kreslia na mape ako zóny obsadenia, zafarbené podľa strany, ktorá každé z nich držala na začiatku práve hranej relácie, a prepínajú sa na hraniciach relácií; každá zmena je dobytie v zozname udalostí prehrávania. Odvodzujú sa z načítaných riadkov - pozemné jednotky a statické objekty každej relácie v jej prvých minútach, v bunkách s veľkosťou asi 2 km, ako to robí reťaz -, takže potrebujú plné načítanie (načítanie mnohých zápasov si z každého riadku ponechá príliš málo).

**Načítanie celého kola z jednej z jeho nahrávok.** V obyčajnom webovom prehliadači prehliadač nemôže otvoriť súbory, ktoré ste nevybrali: načítajte súbory kola spolu. Keď ho poskytuje lokálny server prehliadača (`npm run dev` alebo `npm run preview`), môže: dajte súboru `tools/local-data.json`, ktorý git ignoruje, položku `campaigns`, ktorá pomenúva priečinok so súbormi kôl a priečinky s konvertovanými nahrávkami, a sekcia Kolo kampane jednej nahrávky ponúkne **Načítať celé kolo**, stiahne relácie kola, ktoré sa tam nájdu, a načíta ich načítaním mnohých zápasov:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Poskytujú sa len nahrávky, ktoré pomenúva súbor kôl (`tools/campaign-files.mjs`); relácia, ktorá sa v týchto priečinkoch nenájde, sa započíta, ale nenačíta.

Čo zverejňujú známe servery:

| Server | Kolo | Ako strana vyhrá | Kde sa dá prečítať víťaz |
|---|---|---|---|
| SPS Contention | kampaň na jednej mape a v jednej ére (dni), cez mnoho reštartov | obsadené každé letisko, FARP a pevnosť; kampaň skončená bez víťaza bola vystriedaná | verejný denník kampaní servera (víťaz, začiatok a koniec každej kampane) |
| Blue Flag | kolo kampane cez mnoho 5-hodinových misií; `_YYYY_MM` v Title postúpi pri každom reštarte o jeden mesiac | obsadená každá nepriateľská pozícia; staršie kolá vyhlásili stranu, ktorá po pevnom čase držala viac | doteraz sa nenašlo v zverejnenej podobe; reťaz nahrávok sleduje každé kolo a kto koľko drží na každom začiatku |
| Growling Sidewinder | beh misie (6 hodín) misie s otvoreným konfliktom | obsadené zóny a letiská | jeho stránka so štatistikami ukazuje pilotov, nie výsledky; každá relácia začína rovnako, takže žiadne kolo nepresahuje viac relácií: prázdne |
| Misie proti AI (misie s obsadzovaním zón) | beh misie | strana hráčov proti AI misie: žiadny výsledok PvP | prázdne |
| Nepriradené (hlavička nepomenúva žiadny server) | - | - | prázdne, aj `server` je prázdny |
