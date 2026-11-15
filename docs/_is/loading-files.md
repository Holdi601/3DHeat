---
title: "Hleðsla skráa"
parent: "Hvernig gögn eru sett inn"
nav_order: 1
lang: "is"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Hleðsla skráa

Þessi síða sýnir hvernig þú gefur 3DHeat skrárnar þínar og hvað það gerir við þær. Slepptu möppu og það velur skrárnar sem geyma staðsetningar og sameinar þær í eina mynd.

1. Opnaðu **Uppruni** efst í hliðarstikunni á Hitakorti.
2. Slepptu skrám eða möppu á svæðið, eða ýttu á **Skrár…** eða **Mappa…**.
3. Lestu valslínuna og **Minnismat** (sjá myndina hér fyrir neðan).
4. Ýttu á **Hlaða**.

![Uppruna-spjaldið eftir að mappa með tíu leikjum var sleppt á það: 1 valslínan, 2 Minnismatið sem passar, og 3 Hlaða 10 skrár](../assets/img/en/loading-files-source.webp)

*Eftir að þú sleppir möppu segir 3DHeat þér hvað það fann og hvort það passar.*

Skrár eru hlaðnar í **Uppruni**-spjaldinu efst í hliðarstiku flipans Hitakort. Allt sem er valið í einu verður **eitt** gagnasafn.

## Að velja skrár {#choosing-files}

| Stýring | Hvað hún gerir |
|---|---|
| **Slepptu skrám eða möppu hér** (svæðið) | Slepptu hvaða blöndu sem er af skrám og möppum. Möppur eru lesnar niður í alla undirmöppur. Ef smellt er á svæðið opnast sami veljari og **Skrár…**. |
| **Ein skrá…** | Skráarveljari fyrir eina skrá. |
| **Skrár…** | Skráarveljari sem tekur við nokkrum skrám. |
| **Mappa…** | Möppuveljari (`webkitdirectory` veljari vafrans); hver skrá í möpputrénu er boðin. |

Veljararnir taka við skráargerðunum í [yfirlitinu yfir skrár sem hægt er að hlaða](data-formats.md#files). Í stuttu máli: `.parquet`/`.pq` eru lesnar sem Parquet, `.csv`/`.tsv`/`.txt` sem textatöflur með skilum, `.acmi` (Tacview), OCAP `.json`/`.json.gz` og GPS-sniðin (GPX, KML, KMZ, NMEA, IGC, FIT) fara í gegnum sína eigin lesendur, og `.3dheat`-leikjaílát hlaðast sem þær töflur sem þau geyma ([Ein skrá fyrir hvern leik](container.md)). Ílát sem ekki er hægt að lesa er sleppt sem *ekki csv/parquet-skrá*.

Möppur sem sleppt er eru lesnar niður á 12 stig og í mesta lagi 20.000 skrár, sem vörn gegn lykkjum í táknhlekkjum og stjórnlausum trjám.

## Hvaða skrár eru geymdar {#which-files-are-kept}

Áður en nokkuð er lesið er valið síað ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Skrá með annarri endingu er sleppt: *ekki csv/parquet-skrá*.
- Skrá sem er 0 bæti er sleppt: *tóm (0 bæti)*.
- **Hliðarskrár breytenda** - hráu gögnin sem breytandi geymir við hlið töflu leiks, `<leikur>.messages.parquet`, `.events.parquet`, `.raw.parquet` og hinar sem taldar eru upp í [Breytar geyma allt](converters.md) - eru sleppt: *hliðarskrá breytanda*. Til að opna eina slíka velurðu hana eða sleppir henni ein sér (eða aðeins hliðarskrám): val þar sem eru bara hliðarskrár hleður þeim eins og hverri annarri töflu. JSON-skrárnar við hlið töflu (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` og `.hints.json`) eru aldrei boðnar sem staðsetningar.
- **Reglan um hreyfiskrár.** Ef einhver skrá í valinu heitir `movement*.parquet`, `movement*.csv` (og hinar endingarnar) - `movement.parquet`, `movement_1.parquet` og svo framvegis - þá er hverri annarri gagnaskrá sleppt: *ekki hreyfiskrá, og þessi mappa hefur hreyfiskrár*. Fjarmælingaútflutningur hefur oft eina töflu með staðsetningum við hlið tugi taflna án staðsetninga, og aðeins hin fyrrnefndu er hægt að teikna. Mappa án hreyfiskráa hleður öllum gagnaskrám sínum. Dæmi: mappa með `movement_1.parquet`, `kills.parquet` og `shop.parquet` hleður `movement_1.parquet`; hinum tveimur er skráð sem sleppt. Dæmi: mappa með `movement_1.parquet`, `kills.parquet` og `shop.parquet` hleður `movement_1.parquet`; hinum tveimur er skráð sem sleppt.
- Skrárnar sem eru geymdar eru raðaðar eftir slóð sinni innan valsins, svo sama mappa gefur alltaf sama gagnasafn og sömu liti.

Spjaldið sýnir síðan valið (heiti einnar skrár, eða `mappa (N skrár)` með lengstu sameiginlegu möppu), fjölda skráa, heildarstærð þeirra og heildarfjölda raða - nákvæmt þegar allar skrárnar eru Parquet, merkt `≈` þegar einhver er CSV. Sleppt skrám er skráð ásamt ástæðu, þær fyrstu fjórar með nafni.

## Lesa skemuna {#reading-the-schema}

**Fyrsta** skrá valsins er opnuð til að lýsa skemunni ("Les skemu"): dálkaheiti hennar, fyrstu 50 gagnaraðirnar, hvaða dálkar líta út fyrir að vera tölur og, fyrir Parquet, rökræn gerð hvers dálks og `heat3d`-færslan í endinum á skránni. Mappa með útflutningum á einni töflu deilir einni skemu, svo ein skrá stendur fyrir þær allar. Síðan er hver skrá mæld ("Tel raðir"): Parquet-endinn gefur nákvæman fjölda í einni lítilli lestri; fjöldi CSV-skráar er áætlaður út frá meðallengd lína í fyrsta megabætinu hennar.

Spjaldið [Dálkatengingar](column-mapping.md) opnast með sjálfvirkt tengdu tillögunum, og [minnismatið](memory-and-budgets.md) birtist fyrir ofan hnappinn **Hlaða**.

## Skilaboð áður en hleðsla fer fram {#messages-before-loading}

Undir valinu listar spjaldið, frá [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Villur** (rautt) - hleðslan getur ekki hafist: færri en tveir staðsetningarásar, sami dálkur á tveimur ásum, tengdur dálkur sem er ekki í skránni, staðsetningardálkur sem lítur ekki út fyrir að vera tala, tímadálkur þar sem sýnd gildi eru texti þótt einingin sé tala (hver röð læsist sem NaN og lendir á tíma 0), tímadálkur stilltur á ISO-8601 þar sem ekkert sýnt gildi þáttast sem dagsetning, og einingarkvarði 0.
- **Viðvaranir** (gult) - hún hleðst, en líklega ekki eins og ætlað var: hópdálkur sem tekur sérstakt gildi í flestum sýndum röðum (svo hann er auðkenni, ekki hópur), `DATE`-tímadálkur (hver röð dags deilir sama augnabliki), stefna horfs stillt án dálka sinna.
- **Athugasemdir** - það sem tengingin felur í sér: teiknun á fleti þegar annar ás er ótengdur, engin tímalína án tímadálks, engin spor án persónudálks, og án hópdálks einn litur fyrir allt og mismunur sem getur aðeins skipt eftir dálki sem er geymdur fyrir síun.

## Hleðsla {#loading}

Hnappurinn **Hlaða** les *Hlaða skrá*, *Hlaða N skrár*, eða *Hlaða N skrár (1 af K)* þegar [sleppistuðull](memory-and-budgets.md#decimation) er stilltur. Hann les *Of stórt - minnkaðu eða gisnaðu* og er óvirkur þegar [passaprófið](memory-and-budgets.md#the-fit-check) segir að hleðslan passi ekki; hann er líka óvirkur meðan tengingin hefur villur eða önnur hleðsla er í gangi.

Meðan hleðsla fer fram sýnir spjaldið núverandi skref (með `[skrá/skrár]` fyrir framan þegar þær eru nokkrar), raðirnar lesnar hingað til, framvindustiku og **Hætta við**. Hætta við stöðvar innlestrarvinnsluna, og með henni hvaða lestrarvinnsluferla sem hún ræsti.

Síðan heldur áfram að teikna meðan hún hleðst, því vinnan fer fram í bakgrunni. Þú sérð núverandi skref, raðirnar sem lesnar eru, framvindustiku og **Hætta við**. Eftir síðustu skrána sýnir spjaldið skrefin *Set raðir í tímaröð*, *Raða dálkum upp á nýtt (n af m)*, *Mæli útbreiðslu*, *Byggi lista yfir einingar*, *Tek saman lotur* og *Reikna líftíma*, síðan *Hleð N röðum upp á skjákortið* í einn ramma, svo löng upphleðsla sé aldrei ruglað saman við frost.

### Hvernig þetta virkar {#how-it-works}

Hleðslan keyrir í Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Með nokkrum skrám og fleiri en einum [lestrarþræði](memory-and-budgets.md#parser-threads) eru allt að svo margar skrár lesnar **samtímis**, hver í sínum eigin lestrarvinnsluferli ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), eins langt og RAM-kvaðinn leyfir; þær eru samt sameinaðar eina í einu í röð valsins, svo gagnasafnið er það sama og við hleðslu einnar í einu. Meðan nokkrar eru í vinnslu nefnir framvindulínan skrána sem skilaði síðast, og stikan og raðafjöldinn leggja saman allar skrár í vinnslu. Með einum þræði, eða einni skrá, eru skrárnar lesnar hver á eftir annarri í innlestrarvinnslunni sjálfri. Aðeins dálkarnir sem tengingin nefnir eru lesnir: óteiknaður dálkur í Parquet-skrá kostar ekkert; CSV er skannaður bæti fyrir bæti en aðeins tengdu reitirnir eru afkóðaðir.

## Nokkrar skrár verða eitt gagnasafn {#several-files-become-one-dataset}

Þegar fleiri en ein skrá er hlaðin ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Einn listi.** Persónur, hópar, lotur og flokksgildi eru orðabækur sem deilt er yfir allar skrár, svo sami leikmaður í tveimur útflutningum er ein persóna með eina spor.
- **Einn tímauppruni.** Tímar eru geymdir sem 64 bita sekúndur meðan skrárnar eru sameinaðar og færðir yfir á þann fyrsta tíma af *öllu* valinu, síðan geymdir sem 32 bita sekúndur frá þeim uppruna. Fjórir útflutningar frá fjórum síðdegum eru settir í sína raunverulegu röð, ekki staflaðir hver ofan á annan.
- **Ein tímaröð.** Raðir úr öllum skrám eru raðaðar eftir tíma með radix-röðun (sjá [þak á röðun](memory-and-budgets.md#the-sort-ceiling)).
- **Dálkur `Source file`.** Sérhver röð man hvaða skrá hún kom úr, sem flokksdálkur sem heitir `Source file`. Hann birtist í [Síum](filters.md) og sem *Source file - compare two loads* í [mismunarskiptingunni](difference.md). Hleðsla einnar skrár fær hann ekki - fastur dálkur kostaði 4 bæti á röð til að segja ekkert.
- **Vantar dálkar.** Skrá sem vantar einn *síudálkinn* leggur einfaldlega ekkert til gildanna hans. Skrá sem vantar tengdan *hlutverksdálk* (X, tími, persóna ...) mistekst með *skrá hefur engan dálk "heiti"*; í hleðslu margra skráa er sú skrá sleppt og hinar hlaðast samt, og sleppt skrárnar eru skráðar á gagnasafninu. Hleðsla einnar skráar sem mistekst skilar villunni.
- **Viðvörun um skort.** Þegar raðirnar sem hlaðast eru færri en 95% af röðunum sem voru taldar áður, ber gagnasafnið viðvörun með hlutfalli þess sem vantar - frá ólesanlegum skrám eða frá röðum án nothæfrar staðsetningar, sem er sleppt við innlesturinn.

## Eftir hleðslu {#after-loading}

Nýja gagnasafnið kemur í stað þess fyrra. Við hverja hleðslu ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- eru allar síur og sýnileiki hópa hreinsuð;
- mismunarskiptingin eftir hópum er endurstillt: fyrri helmingur hópanna (námundaður upp) jákvæður, hinir neikvæðir;
- radíus sprite-myndanna er stilltur á láréttu útbreiðsluna / 120 og mettunin á reiknað mat; stærð teninga, lengd horfsgeisla, flughraði og nær- og fjærplön eru stillt út frá útbreiðslunni (sjá [Lotur, persónur og hópar](sessions-persons-groups.md#entity-size));
- lota kassaendurspilunarinnar er stillt á lotuna með flestar raðir;
- línuhitaleiðirnar eru giskaðar upp á nýtt ([Línuhiti](line-heat.md));
- skoðunarhamurinn fellur aftur á **Hiti** ef núverandi hamur styður ekki nýju gögnin; tímalínan fellur aftur á **Allt** án tímadálks og sagan á **Uppsafnað** án líftíma;
- leshausinn er settur á upphaf og spilun stöðvast;
- myndavélin rammar allt gagnasafnið frá sjálfgefinni stefnu (horfandi eftir -Z, hallað niður um u.þ.b. 36°).

**Gagnasafn**-spjaldið sýnir síðan heiti gagnasafnsins (valið, fjölda raða og skráa, og sleppistuðulinn þegar hann var notaður), `N lið · N persónur · N s bil`, og allar viðvaranir sem hleðslan skilaði, gular, meðan gagnasafnið er hlaðið. **Afhlaða** í því spjaldi fjarlægir gagnasafnið.
