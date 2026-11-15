---
title: "Tacview-upptökur (ACMI)"
parent: "Hvernig gögn eru sett inn"
nav_order: 7
lang: "is"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
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
