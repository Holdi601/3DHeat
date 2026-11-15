---
title: "Záznamy Tacview (ACMI)"
parent: "Jak nahrát data"
nav_order: 7
lang: "cs"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Záznamy Tacview (ACMI)

Tacview je program, který zaznamenává lety v leteckých simulátorech; jeho soubory končí na `.acmi`. 3DHeat je otevírá, abyste viděli, kam každé letadlo letělo.

Letové záznamy Tacview se načítají jako jakákoli tabulka: vyberte nebo přetáhněte `.acmi` (text, `.txt.acmi`, nebo zabalený, `.zip.acmi`) a stiskněte **Načíst**. Dostanete teplo všech letů a na kartě **Zápas** přehrávání s figurami, stopami a seznamem událostí ([Přehrávání zápasu](match-replay.md)). ACMI je veřejný formát souborů Tacview ([dokumentace](https://www.tacview.net/documentation/acmi/)); DCS (přes exportér Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS a další ho zapisují, takže to čte kterýkoli z nich.

## Z čeho se záznam stane {#what-a-recording-becomes}

Jeden řádek pokaždé, když se zapíše pozice objektu, jeden řádek na každou událost na místě objektu, a jeden řádek, když objekt zmizí (`Removed`, kde byl naposledy). Událost o objektu, který dosud nebyl vidět (záložka, zpráva všem), je řádek objektu `(recording)` v referenčním bodu. Záznam nese vlastní pokyny ke čtení, takže krok mapování se vyplní sám. Čtenář zapisuje tyto sloupce: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, a pak další vlastnosti, které záznam má. Jejich role:

| Sloupec | Role | Význam |
|---|---|---|
| Time | čas | Sekundy po ReferenceTime záznamu; Unixové sekundy, když ji má, takže hodiny ukazují skutečný čas. |
| X, Y | pozice | Východ a sever, metry, na rovině dotýkající se Země v referenčním bodu záznamu: vzdálenosti a směry jsou u něj správné, a na 100 km se odchylují o méně než promile. Sever se stane -Z světa. |
| Altitude | pozice (nahoru) | Metry. |
| Object | osoba | Pilot a název objektu s jeho id, např. `Viper 1 (F-16C_50) #a01`; objekt bez posádky `(T-90A) #401`. |
| Coalition | tým | Strana (nebo barva, když není koalice). |
| Heading, Pitch | pohled | Stupně; kurz 0 je sever. |
| Recording | relace | Title záznamu, nebo název souboru: několik záznamů se načte vedle sebe, aniž by se jejich stopy spojily. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtry | Ponechané pro filtrování; Type a Name vybírají [figuru](figures.md) každého objektu, Event krmí seznam událostí v debriefingu, Roll naklání letadlo. |
| U, V | | Ploché metry hry, je-li každý vzorek má (DCS je zapisuje). |
| EventObjects | filtry | Každý objekt, který událost jmenuje (`Message|a01|b02|...`), podle id. |
| RecordingInfo | | Vlastnosti záznamu tak, jak byly v tom okamžiku – DataSource, DataRecorder, Author, Category, Briefing, Comments, … – jako JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtry | Jakákoli jiná číselná vlastnost, kterou záznam nese. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtry | Jakákoli jiná textová vlastnost, kterou záznam nese; vlastnost s jakoukoli hodnotou, která není číslo, je text. |

Čtou se všechny čtyři tvary pozice Tacview (`lon|lat|alt`, s `u|v`, s `roll|pitch|yaw`, a se všemi a kurzem), prázdná pole si drží poslední hodnotu; `-id` objekt odstraní a id použité znovu po něm je nový objekt. Escapované čárky a pokračující řádky se zpracují.

Pozice se vždy promítají z šířky a délky, nikdy se nebírají z U/V, takže záznamy ze všech her sdílejí jednu projekci s podkladem skutečného světa.

## Servery DCS: kdo vyhrál a jak skončil každý let {#dcs-servers-who-won-and-how-each-sortie-ended}

Server DCS pro více hráčů nahrává své mise přes Tacview nepřetržitě a trvalý PvP server vede kampaň přes mnoho z nich: strana vyhraje, když dobude každé letiště, FARP a zónu druhé strany, což trvá dny a mnoho restartů mise. Záznamy obsahují lety, ne kampaň: žádná zpráva neříká, kdo co dobyl, letiště se zapíšou jednou na začátku a žádná neříká, kdo vyhrál. Převodník Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) přidá ke každému řádku to, co se dá vědět, a co se vědět nedá, nechá prázdné - nikdy nehádá.

| Sloupec | Význam |
|---|---|
| `server` | server nebo kampaň, z hlavičky záznamu (její Title, Author a Comments jmenují známé veřejné servery - Blue Flag, SPS Contention, Growling Sidewinder; jinak Author, který někoho jmenuje); `--server Name` ho pojmenuje pro celou složku. Záznam, jehož hlavička nejmenuje žádný server - Author jako `Admin`, Title a Comments, jaké nepíše žádný známý server -, zůstane nepřiřazený: `server` prázdný, i když byl stažen ze stránky záznamů nějakého serveru, protože ta stránka může obsahovat i mise jiných komunit |
| `mission` | Title záznamu bez verze a měsíce kampaně: z `Operation_Example_V7.7.99` se stane `Operation Example` |
| `campaign` | kolo kampaně, do kterého záznam patří, podle serveru, mapy a čísla: `Example Server North 3`. Jeden záznam je jedna relace (od restartu do restartu); kolo trvá přes mnoho relací, dny nebo týdny |
| `round` | číslo toho kola: číslo serveru, pokud nějaké zveřejňuje, jinak n-té viděné kolo toho serveru a té mapy; ze souboru kol (níže), bez něj prázdné |
| `session` | místo záznamu mezi relacemi kola, 1, 2, ...; `sessionStart` její skutečný začátek (unixové sekundy) |
| `heldRed`, `heldBlue` | sporná místa, která každá strana držela na začátku relace, ze zřetězeného souboru kol (níže) |
| `won`, `matchWon` | 1, když strana řádku (jeho Color, Red nebo Blue) tu kampaň vyhrála, 0, když prohrála; prázdné tam, kde žádný soubor kol nejmenuje vítěze, a na neutrálních řádcích. Kampaň je zároveň kolo i zápas, takže oba sloupce mají stejnou hodnotu |
| `roundEndReason` | `capture` pro kampaň vyhranou dobytím všeho |
| `won`, `matchWon` v každé relaci kola | výsledek kola, zapsaný do každého jeho záznamu, jakmile je známý jeho konec |
| `sortie` | na řádcích letadla: jeho let, 1, 2, ... od vzletu ke vzletu; čas na zemi před prvním vzletem a po přistání se počítá k letu, ke kterému patří |
| `sortieResult` | jak ten let skončil: `landed`, `landed damaged` (po zásahu ve vzduchu), `ejected`, `shot down`, `destroyed` (na zemi), `crashed`, `despawned` (zmizel ve vzduchu bez viditelné příčiny - hráč, který odchází), `airborne at end`, `no takeoff` |
| `sortieKills` | sestřely připsané letadlu v tom letu |

Na trvalém serveru je let jednotka, která něco znamená: filtrujte podle `sortieResult` = `shot down`, abyste viděli, kde se lety ztrácely, nebo rozdělte teplo podle `sortieResult` či `server` v [rozpisu](breakdown.md). Vzlety, přistání, katapultování, sestřely a havárie, ze kterých se skládá, jsou události, které převodník odvozuje z toho, jak se letadla pohybují (výše).

Místa dobytá mezi dvěma relacemi kola - známá ze souboru kol, níže - jsou události `capture` na začátku pozdějšího záznamu: `Object` `(campaign)`, na tom místě, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Letiště nebo FARP, které změní stranu tam, kde to záznam ukazuje - znovu zapsané v druhé barvě, nebo odebrané a do pěti minut znovu zapsané na svém místě v druhé barvě -, se stane událostí `capture` u přistávací plochy: `Event` = `capture`, `Airfield` její název, `Detail` `Red to Blue`, `Coalition` její nová strana. Plocha zapsaná poprvé v nějaké barvě není dobytí. Servery prozkoumané zatím zapisují své plochy jen jednou, takže jejich záznamy žádná dobytí neobsahují.

### Soubory kol {#rounds-files}

Soubor kol uvádí pro každý server jeho kola kampaně, kdo je vyhrál a relace každého z nich. Pochází z toho, co server zveřejňuje, nebo ze samotných záznamů (níže).

Kdo vyhrál kampaň, zveřejňuje server - protokol kampaní na své webové stránce -, v záznamu to není. Nese to soubor kol a převodník ho čte přes `--rounds file.json` (lze jich zadat více):

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

Záznam patří ke kolům svého `server`, jejichž `title` (regulární výraz) odpovídá jeho Title; každý řádek patří ke kolu, do kterého padne jeho skutečný čas - RecordingTime záznamu plus sekundy řádku, ne datum mise ve hře. Časy jsou v UTC. Kolo bez vítěze (vystřídané, stále běží) dá svým řádkům číslo kola a prázdný výsledek.

Protějšek v dokumentu zápasu, zápatí `acmi`, říká, odkud výsledek pochází, stejně jako `result.source` u zápasu War Thunder: `outcome.result` je `{ winner, round, endReason, source }`, přičemž `source` je `source` souboru kol, nebo `null`, když nic nejmenovalo vítěze. `outcome` také vypisuje kola záznamu, jeho dobytí a jeho lety podle toho, jak skončily:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Řádek pilota `Viper 1 (F-16C_50) #a01` na modré straně v té kampani pak zní: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Kola ze samotných záznamů {#rounds-from-the-recordings-themselves}

Trvalý server si kampaň drží přes restarty a každý záznam začíná pozemními jednotkami a statickými objekty obou stran tam, kde je kampaň nechala. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` přečte první minuty každého záznamu ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), seřadí záznamy každého serveru z jedné mapy podle času a zřetězí je:

- **Místa**: terén v buňkách o velikosti asi 2 km; buňka patří straně, když jsou tři čtvrtiny jednotek v ní na začátku relace její. *Sporná* místa jsou ta, která byla vidět v držení obou stran.
- **Dobytí**: místo, které na začátku další relace drží druhá strana - dobyté mezi misemi, nebo během té dřívější.
- **Nové kolo**: relace, jejíž místa se od míst té předchozí liší ve více než 60 % - výchozí rozestavení nového kola, ne krok toho starého. Kolo končí také tehdy, když server přejde na jinou mapu (její relace začínají po té poslední a pokračují).
- **Kdo vyhrál**: u skončeného kola strana, která na začátku jeho poslední relace držela každé místo (`capture`, spolehlivost vysoká), jinak strana, která držela víc sporných míst (střední při dvojnásobku oproti druhé, jinak nízká; nízká, když kolo skončilo změnou mapy). Otevřené kolo nemá vítěze, ale každá relace říká, kolik míst každá strana držela na jejím začátku, takže je vidět, kdo vedl.
- Server, jehož relace všechny začínají stejně, si mezi nimi žádný stav nedrží: není zřetězen.

Začátek poslední relace může být hodiny před koncem kola, proto na spolehlivosti záleží. Ověřeno na serveru, který zveřejňuje své vítěze: řetěz našel každé nové kolo v relaci, ve které začalo zveřejněné kolo, a strana, která vedla při posledním začátku, byla zveřejněným vítězem v každém z 9 kol, která mohl ověřit. `--official file.json` ponechá zveřejněná kola takového serveru a přidá k nim relace z řetězu; `validation` v souboru říká, nakolik se řetěz shodoval. Ve vymyšlené kampani:

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

### Sledování kola kampaně jako série {#watching-a-campaign-round-as-a-series}

Načtěte záznamy jednoho kola dohromady - soubory se stejnou `campaign` - a prohlížeč je přehraje jako jednu sérii: relaci po relaci v jejich skutečném pořadí, hodiny nebo dny mezi dvěma relacemi zkrácené na minutovou přestávku. Časová osa označí začátek každé relace žlutě a přestávky jako tmavé pruhy a hodiny říkají, která relace se přehrává, a její skutečné datum (`session 4/12 · 2026-11-02 12:38 UTC`). Teplo, přehrávání, filtry a Zjištění fungují na celou sérii jako na jakákoli načtená data. Sekce **Kolo kampaně** na kartě Zápas vypisuje relace s jejich daty, kolik sporných míst každá strana držela při každém začátku - také jako graf přes celé kolo - a kolik jich bylo dobyto předtím; kliknutím se přejde na začátek relace. Záznam načtený samostatně tam říká, které kolo a relace to je. Záznamy různých kol načtené dohromady nejsou série: každý začíná od nuly, jako samostatné zápasy. Načítání mnoha zápasů (**Mnoho zápasů najednou**) také přehraje kolo jako sérii, streamovaně a s velikostí podle GPU, pro kola o mnoha gigabajtech.

Místa, která během kola změnila majitele, se na mapě kreslí jako zóny dobytí, obarvené podle strany, která každé z nich držela na začátku přehrávané relace, a mění se na hranicích relací; každá změna je dobytí v seznamu událostí přehrávání. Odvozují se z načtených řádků - pozemních jednotek a statických objektů každé relace v jejích prvních minutách, v buňkách asi 2 km, stejně jako to dělá řetěz -, takže potřebují úplné načítání (načítání mnoha zápasů si z každého řádku ponechá příliš málo).

**Načtení celého kola z jednoho z jeho záznamů.** V běžném webovém prohlížeči nemůže prohlížeč 3DHeat otevřít soubory, které jste nevybrali: načtěte soubory kola dohromady. Když ho poskytuje místní server prohlížeče (`npm run dev` nebo `npm run preview`), může: dejte souboru `tools/local-data.json`, který git ignoruje, položku `campaigns`, jež uvádí složku se soubory kol a složky s převedenými záznamy, a sekce Kolo kampaně jednotlivého záznamu nabídne **Načíst celé kolo**, stáhne tam nalezené relace kola a načte je načítáním mnoha zápasů:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Poskytují se jen záznamy, které jmenuje soubor kol (`tools/campaign-files.mjs`); relace, která se v těch složkách nenajde, se započítá, ale nenačte.

Co zveřejňují známé servery:

| Server | Kolo | Jak strana vyhraje | Kde lze vítěze vyčíst |
|---|---|---|---|
| SPS Contention | kampaň na jedné mapě a v jedné éře (dny), přes mnoho restartů | dobyto každé letiště, FARP a opěrný bod; kampaň skončená bez vítěze byla vystřídána | veřejný protokol kampaní serveru (vítěz, začátek, konec každé kampaně) |
| Blue Flag | kolo kampaně přes mnoho pětihodinových misí; `_YYYY_MM` v Title se s každým restartem posune o měsíc | dobyta každá nepřátelská pozice; starší kola určovala stranu, která po pevně dané době držela víc | zatím nezveřejněno v žádné nalezené podobě; řetěz záznamů sleduje každé kolo a kdo kolik drží při každém začátku |
| Growling Sidewinder | jeden běh (6 hodin) mise otevřeného konfliktu | dobyté zóny a letiště | jeho stránka statistik ukazuje piloty, ne výsledky; každá relace začíná stejně, takže žádné kolo nepřesahuje přes více relací: prázdné |
| Mise proti AI (mise na dobývání zón) | jeden běh mise | strana hráčů proti AI mise: žádný výsledek PvP | prázdné |
| Nepřiřazené (hlavička nejmenuje žádný server) | - | - | prázdné, `server` také prázdný |
