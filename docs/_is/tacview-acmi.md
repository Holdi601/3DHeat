---
title: "Tacview-upptökur (ACMI)"
parent: "Hvernig gögn eru sett inn"
nav_order: 7
lang: "is"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Upptökur Tacview (ACMI)

Tacview er forrit sem tekur upp flug í flughermum; skrárnar þess enda á `.acmi`. 3DHeat opnar þær svo þú getir séð hvar hver flugvél flaug.

Flugupptökur Tacview hlaðast eins og hver önnur tafla: veldu eða slepptu `.acmi` (texti, `.txt.acmi`, eða þjappað, `.zip.acmi`) og ýttu á **Hlaða**. Þá færðu hita allra flugferða, og á flipanum **Leikur** endurspilun með fígúrum, slóðum og atburðalista ([Endurspilun leiks](match-replay.md)). ACMI er opið skráarsnið Tacview ([skjölun](https://www.tacview.net/documentation/acmi/)); DCS (í gegnum útflutning Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS og fleiri skrifa það, svo þessi les hvaða þeirra sem er.

## Hvað upptaka verður {#what-a-recording-becomes}

Ein lína í hvert skipti sem staða hlutar er skráð, ein lína fyrir hvern atburð á stað hlutarins, og ein lína þegar hlutur hverfur (`Removed`, þar sem hann var síðast). Atburður um hlut sem ekki hefur sést ennþá - bókamerki, skilaboð til allra - er lína hlutarins `(recording)` á viðmiðunarpunktinum. Upptakan ber sínar eigin lestrarleiðbeiningar, svo kortlagningarskrefið fyllir sig sjálft. Lesarinn skrifar þessa dálka: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, og síðan allar aðrar eiginleikar sem upptakan hefur. Hlutverk þeirra:

| Dálkur | Hlutverk | Merking |
|---|---|---|
| Time | tími | Sekúndur eftir ReferenceTime upptökunnar; Unix-sekúndur þegar hún hefur þær, svo klukkan sýnir raunverulegan tíma. |
| X, Y | staða | Austur og norður, metrar, á fleti sem snertir jörðina í viðmiðunarpunkti upptökunnar: vegalengdir og stefnur eru réttar nálægt honum, og reka minna en einn hluti af þúsund við 100 km. Norður verður -Z heimsins. |
| Altitude | staða (upp) | Metrar. |
| Object | persóna | Flugmaðurinn og nafn hlutarins með auðkenni hans, t.d. `Viper 1 (F-16C_50) #a01`; ómannaður hlutur `(T-90A) #401`. |
| Coalition | lið | Hliðin (eða liturinn, þegar ekkert bandalag er). |
| Heading, Pitch | sjónarhorn | Gráður; stefna 0 er norður. |
| Recording | seta | Titill upptökunnar, eða skráarheitið: nokkrar upptökur hlaðast hlið við hlið án þess að slóðir þeirra tengist. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | síur | Geymt til síunar; Type og Name velja [fígúru](figures.md) hvers hlutar, Event fóðrar atburðalista yfirferðarinnar, Roll hallar flugvélinni. |
| U, V | | Eigin flötu heimsmetrar leiksins, þegar hvert sýni hefur þá (DCS skrifar þá). |
| EventObjects | síur | Sérhver hlutur sem atburður nefnir (`Message|a01|b02|...`), eftir auðkenni. |
| RecordingInfo | | Eigineiginleikar upptökunnar eins og þeir voru á því augnabliki - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - sem JSON. |
| IAS, Mach, AOA, FuelWeight, ... | síur | Hver annar talnaeiginleiki sem upptakan ber. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | síur | Hver annar textaeiginleiki sem upptakan ber; eiginleiki með hvaða gildi sem er sem ekki er tala er texti. |

Allar fjórar gerðir staðsetningar Tacview (`lon|lat|alt`, með `u|v`, með `roll|pitch|yaw`, og með þeim öllum og stefnu) eru lesnar; tómir reitir halda síðasta gildi. `-id` fjarlægir hlut, og auðkenni sem er notað aftur eftir það er nýr hlutur. Escaped kommur og framhaldslínur eru meðhöndlaðar.

Staðsetningarnar eru alltaf varpaðar frá breiddar- og lengdargráðu, aldrei teknar úr U/V, svo upptökur úr öllum leikjum deila einni varpun með bakgrunni úr raunverulegum heimi.

## DCS-þjónar: hver vann og hvernig hvert flug endaði {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS-fjölspilunarþjónn tekur verkefni sín upp með Tacview allan sólarhringinn, og varanlegur PvP-þjónn keyrir herferð yfir mörg þeirra: lið vinnur með því að taka alla flugvelli, FARP-stöðvar og svæði hins liðsins, sem tekur daga og margar endurræsingar verkefnisins. Upptökurnar geyma flugin, ekki herferðina: engin skilaboð segja hver tók hvað, flugvellirnir eru skrifaðir einu sinni í byrjun og ekkert segir hver vann. Tacview-breytirinn (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) bætir því sem hægt er að vita við hverja röð og skilur eftir autt það sem ekki er hægt að vita - hann giskar aldrei.

| Dálkur | Merking |
|---|---|
| `server` | þjónninn eða herferðin, úr haus upptökunnar (Title, Author og Comments hennar nefna þekktu opinberu þjónana - Blue Flag, SPS Contention, Growling Sidewinder; annars Author sem nefnir einhvern); `--server Name` gefur heilli möppu nafn. Upptaka þar sem hausinn nefnir engan þjón - Author eins og `Admin`, Title og Comments sem enginn þekktur þjónn skrifar - er áfram óeignuð: `server` autt, líka þegar hún var sótt af upptökusíðu þjóns, því síðan getur líka geymt verkefni annarra samfélaga |
| `mission` | Title upptökunnar án útgáfu eða herferðarmánaðar: `Operation_Example_V7.7.99` verður `Operation Example` |
| `campaign` | herferðarumferðin sem upptakan tilheyrir, eftir þjóni, korti og númeri: `Example Server North 3`. Ein upptaka er ein lota (frá endurræsingu til endurræsingar); umferð nær yfir margar lotur, daga eða vikur |
| `round` | númer umferðarinnar: eigið númer þjónsins þar sem hann birtir það, annars n-ta umferðin sem sést hefur á þeim þjóni og korti; úr umferðaskrá (sjá neðar), autt án hennar |
| `session` | sæti upptökunnar meðal lota umferðarinnar, 1, 2, ...; `sessionStart` raunverulegt upphaf hennar (Unix-sekúndur) |
| `heldRed`, `heldBlue` | umdeildu staðirnir sem hvort lið hélt í upphafi lotunnar, úr keðjaðri umferðaskrá (sjá neðar) |
| `won`, `matchWon` | 1 þegar lið raðarinnar (Color hennar, Red eða Blue) vann herferðina, 0 þegar það tapaði; autt þar sem engin umferðaskrá nefnir sigurvegara, og á hlutlausum röðum. Herferð er bæði umferðin og leikurinn, svo báðir dálkar hafa sama gildi |
| `roundEndReason` | `capture` fyrir herferð sem vannst með því að taka allt |
| `won`, `matchWon` á hverri lotu umferðar | niðurstaða umferðarinnar, skrifuð á hverja upptöku hennar þegar endir hennar er þekktur |
| `sortie` | á röðum flugvélar: flug hennar, 1, 2, ... frá flugtaki til flugtaks; tíminn á jörðu fyrir fyrsta flugtak og eftir lendingu telst til flugsins sem hann tilheyrir |
| `sortieResult` | hvernig flugið endaði: `landed`, `landed damaged` (eftir högg á lofti), `ejected`, `shot down`, `destroyed` (á jörðu), `crashed`, `despawned` (horfin á lofti án sýnilegrar ástæðu - leikmaður sem fer), `airborne at end`, `no takeoff` |
| `sortieKills` | drápin sem flugvélinni voru eignuð í því flugi |

Á varanlegum þjóni er flugið einingin sem skiptir máli: síaðu á `sortieResult` = `shot down` til að sjá hvar flug töpuðust, eða skiptu hitanum eftir `sortieResult` eða `server` í [sundurliðuninni](breakdown.md). Flugtökin, lendingarnar, útskotin, drápin og brotlendingarnar sem það er gert úr eru atburðirnir sem breytirinn reiknar út frá því hvernig flugvélarnar hreyfast (sjá ofar).

Staðir sem voru teknir á milli tveggja lota í umferð - þekktir úr umferðaskránni, sjá neðar - eru `capture`-atburðir í upphafi seinni upptökunnar: `Object` `(campaign)`, á staðnum, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Flugvöllur eða FARP-stöð sem skiptir um lið þar sem upptakan sýnir það - skrifuð aftur í hinum litnum, eða fjarlægð og skrifuð aftur á sínum stað í hinum innan fimm mínútna - verður `capture`-atburður við stöðina: `Event` = `capture`, `Airfield` nafn hennar, `Detail` `Red to Blue`, `Coalition` nýja liðið hennar. Stöð sem er fyrst skrifuð í lit er engin yfirtaka. Þjónarnir sem hafa verið skoðaðir hingað til skrifa stöðvar sínar einu sinni, svo upptökur þeirra geyma engar yfirtökur.

### Umferðaskrár {#rounds-files}

Umferðaskrá segir, fyrir hvern þjón, herferðarumferðir hans, hver vann þær og lotur hverrar umferðar. Hún kemur úr því sem þjónninn birtir, eða úr upptökunum sjálfum (sjá neðar).

Hver vann herferð er það sem þjónninn birtir - herferðarskrá á vefsíðu hans - ekki eitthvað í upptökunni. Umferðaskrá geymir það og breytirinn les hana með `--rounds file.json` (gefa má fleiri en eina):

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

Upptaka tilheyrir þeim umferðum síns `server` þar sem `title` (regluleg segð) passar við Title hennar; hver röð tilheyrir umferðinni sem raunverulegur tími hennar fellur í - RecordingTime upptökunnar auk sekúndna raðarinnar, ekki dagsetning verkefnisins í leiknum. Tímar eru í UTC. Umferð án sigurvegara (skipt út, enn í gangi) gefur röðum sínum umferðarnúmerið og auða niðurstöðu.

Hliðstæða leikjaskjalsins, `acmi`-fótur, segir hvaðan niðurstaðan kom, eins og `result.source` í War Thunder-leik gerir: `outcome.result` er `{ winner, round, endReason, source }`, `source` er `source` umferðaskrárinnar, eða `null` þegar ekkert nefndi sigurvegara. `outcome` telur líka upp umferðir upptökunnar, yfirtökur hennar og flug hennar eftir því hvernig þau enduðu:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Röð flugmanns `Viper 1 (F-16C_50) #a01` í Blue-liðinu í þeirri herferð hljóðar þá svo: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Umferðir úr upptökunum sjálfum {#rounds-from-the-recordings-themselves}

Varanlegur þjónn heldur herferð sinni á milli endurræsinga, og hver upptaka byrjar á landeiningum og kyrrstæðum hlutum beggja liða þar sem herferðin skildi við þá. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` les fyrstu mínútur hverrar upptöku ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), raðar upptökum hvers þjóns af einu korti í tímaröð og keðjar þær saman:

- **Staðir**: jörðin í reitum um 2 km; reitur tilheyrir liði þegar þrír fjórðu eininganna þar í upphafi lotu eru þess. *Umdeildir* staðir eru þeir sem hafa sést í höndum beggja liða.
- **Yfirtökur**: staður sem hitt liðið heldur í upphafi næstu lotu - tekinn á milli verkefnanna, eða í því fyrra.
- **Ný umferð**: lota þar sem staðirnir eru frábrugðnir þeim í síðustu lotu í meira en 60 % þeirra - upphafsstaða nýrrar umferðar, ekki skref í þeirri gömlu. Umferð lýkur líka þegar þjónninn skiptir yfir á annað kort (lotur hans þar byrja eftir þá síðustu og halda áfram).
- **Hver vann**: í umferð sem lauk, liðið sem hélt öllum stöðum í upphafi síðustu lotu hennar (`capture`, mikil vissa), annars liðið sem hélt fleiri af umdeildu stöðunum (miðlungs við tvöfalt fleiri en hitt, annars lítil; lítil þegar henni lauk með kortaskiptum). Opin umferð hefur engan sigurvegara, en hver lota segir hve marga staði hvort lið hélt í upphafi hennar, svo það sést hver var yfir.
- Þjónn þar sem allar lotur byrja eins geymir ekkert ástand á milli þeirra: hann er ekki keðjaður.

Upphaf síðustu lotunnar getur verið klukkustundum fyrir lok umferðarinnar, svo vissan skiptir máli. Prófað á móti þjóni sem birtir sigurvegara sína: keðjan fann hverja nýja umferð í lotunni þar sem birta umferðin hófst, og liðið sem var yfir í síðasta upphafi var birti sigurvegarinn í hverri af þeim 9 umferðum sem hún gat prófað. `--official file.json` heldur birtum umferðum slíks þjóns og bætir lotum keðjunnar við þær; `validation` skrárinnar segir hve vel keðjan var sammála. Í tilbúinni herferð:

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

### Að horfa á herferðarumferð sem röð {#watching-a-campaign-round-as-a-series}

Hladdu upptökum einnar umferðar saman - skránum með sama `campaign` - og skoðarinn spilar þær sem eina röð: lotu eftir lotu í raunverulegri röð, og klukkustundirnar eða dagarnir á milli tveggja styttir í eins mínútu hlé. Tímalínan merkir upphaf hverrar lotu með gulu og hléin sem dökk bönd, og klukkan segir hvaða lota er spiluð og raunverulega dagsetningu hennar (`session 4/12 · 2026-11-02 12:38 UTC`). Hiti, endurspilunin, síur og Innsýn virka á alla röðina eins og á öll hlaðin gögn. Hlutinn **Herferðarumferð** í flipanum Leikur telur upp loturnar með dagsetningum þeirra, hve marga umdeilda staði hvort lið hélt í hverju upphafi - líka sem graf yfir umferðina - og hve margir voru teknir fyrir hana; smellur fer í upphaf lotu. Upptaka sem er hlaðin ein og sér segir þar hvaða umferð og lota hún er. Upptökur úr ólíkum umferðum sem eru hlaðnar saman eru ekki röð: hver byrjar á núlli, eins og aðskildir leikir gera. Hleðslan fyrir marga leiki (**Margir leikir í einu**) spilar líka umferð sem röð, streymda og sniðna að skjákortinu, fyrir umferðir sem eru mörg gígabæti.

Staðirnir sem skiptu um hendur í umferðinni eru teiknaðir á kortið sem yfirtökusvæði, litaðir eftir liðinu sem hélt hverjum þeirra í upphafi lotunnar sem er spiluð, og skipta um lit við lotumörkin; hver skipting er yfirtaka í atburðalista endurspilunarinnar. Þeir eru reiknaðir út frá hlöðnu röðunum - landeiningum og kyrrstæðum hlutum hverrar lotu á fyrstu mínútum hennar, í reitum um 2 km, eins og keðjan gerir - svo þeir þurfa fullu hleðsluna (hleðslan fyrir marga leiki geymir of lítið af hverri röð).

**Að hlaða allri umferðinni úr einni upptöku hennar.** Í venjulegum vafra getur skoðarinn ekki opnað skrár sem þú valdir ekki: hladdu skrám umferðarinnar saman. Þegar staðbundni skoðaraþjónninn keyrir hann (`npm run dev` eða `npm run preview`) getur hann það: gefðu `tools/local-data.json`, sem git hunsar, `campaigns`-færslu sem nefnir möppuna með umferðaskrám og möppurnar með umbreyttum upptökum, og þá býður hlutinn Herferðarumferð fyrir staka upptöku upp á **Hlaða allri umferðinni**, sækir þær lotur umferðarinnar sem finnast þar og hleður þeim með hleðslunni fyrir marga leiki:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Aðeins upptökurnar sem umferðaskrá nefnir eru afhentar (`tools/campaign-files.mjs`); lota sem finnst ekki í þeim möppum er talin, ekki hlaðin.

Hvað þekktu þjónarnir birta:

| Þjónn | Ein umferð | Hvernig lið vinnur | Hvar má lesa sigurvegarann |
|---|---|---|---|
| SPS Contention | herferð á einu korti og tímabili (dagar), yfir margar endurræsingar | allir flugvellir, FARP-stöðvar og vígi tekin; herferð sem lauk án sigurvegara var skipt út | opinber herferðarskrá þjónsins (sigurvegari, upphaf, lok hverrar herferðar) |
| Blue Flag | herferðarumferð yfir mörg 5 klukkustunda verkefni; `_YYYY_MM` í Title færist fram um einn mánuð við hverja endurræsingu | allar stöður óvinarins teknar; eldri umferðir nefndu liðið sem hélt meiru eftir fastan tíma | ekki birt á formi sem hefur fundist hingað til; keðja upptakanna fylgir hverri umferð og hver heldur hve miklu í hverju upphafi |
| Growling Sidewinder | keyrsla (6 klukkustundir) á verkefni með opnum átökum | svæði og flugvellir tekin | tölfræðisíða hans sýnir flugmenn, ekki úrslit; hver lota byrjar eins, svo engin umferð nær yfir fleiri lotur: autt |
| Verkefni gegn gervigreindinni (verkefni þar sem svæði eru tekin) | keyrsla á verkefni | lið leikmanna gegn gervigreind verkefnisins: engin PvP-úrslit | autt |
| Óeignað (hausinn nefnir engan þjón) | - | - | autt, `server` líka autt |
