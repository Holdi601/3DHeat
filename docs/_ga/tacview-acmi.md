---
title: "Taifeadtaí Tacview (ACMI)"
parent: "Sonraí a iontráil"
nav_order: 7
lang: "ga"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Taifeadtaí Tacview (ACMI)

Is clár é Tacview a thaifeadann eitiltí i gcluichí eitilte; comhaid a chríochnaíonn le `.acmi` a dhéanann sé. Oscailtear 3DHeat iad ionas gur féidir leat a fheiceáil cá eitil gach aerárthach.

Lódálann taifeadtaí eitilte Tacview cosúil le gach tábla: roghnaigh nó scaoil `.acmi` (téacs, `.txt.acmi`, nó zipáilte, `.zip.acmi`) agus brúigh **Lódáil**. Faigheann tú ansin teas gach eitilte, agus sa chluaisín **Cluiche** athsheinm le figiúir, rianta agus liosta imeachtaí ([Athsheinm cluiche](match-replay.md)). Is é ACMI formáid phoiblí comhaid Tacview ([doiciméadú](https://www.tacview.net/documentation/acmi/)); scríobhann DCS (tríd an easpórtálaí Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS agus cinn eile é, mar sin léitear aon cheann acu leis seo.

## Cad a bhíonn de thaifead {#what-a-recording-becomes}

Sraith amháin gach uair a scríobhtar suíomh réad, sraith amháin in aghaidh imeachta ag áit an réada, agus sraith amháin nuair a fhágann réad (`Removed`, san áit ar deineadh é a fheiceáil go deireanach). Is sraith de réad `(recording)` ag an bpointe tagartha imeacht maidir le réad nach bhfacthas fós - leabharmharc, teachtaireacht chuig gach duine. Iompraíonn an taifead a threoracha léirmhínithe féin, mar sin líonann an chéim mapála í féin. Scríobhann an léitheoir na colúin seo: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, agus ansin aon mhaoin eile a bhíonn ag an taifead. A bpríomhról:

| Colún | Ról | Brí |
|---|---|---|
| Time | am | Soicindí tar éis ReferenceTime an taifid; soicindí Unix nuair a bhíonn ceann aige, ionas go dtaispeánann an clog an t-am fíor. |
| X, Y | suíomh | Soir agus thuaidh, méadair, ar phlána a theagmhaíonn leis an talamh ag pointe tagartha an taifid: tá fad agus treonna fíor in aice leis, ag sleamhnú faoi chuid amháin de mhíle ag 100 km. Bíonn an tuaisceart ina -Z an domhain. |
| Altitude | suíomh (suas) | Méadair. |
| Object | duine | An píolóta agus ainm an réad lena aitheantas, mar shampla `Viper 1 (F-16C_50) #a01`; réad gan duine `(T-90A) #401`. |
| Coalition | foireann | An taobh (nó an dath, nuair nach bhfuil comhcheangal ann). |
| Heading, Pitch | féachaint | Céimeanna; is é 0 an treo thuaidh. |
| Recording | seisiún | Teideal an taifid, nó ainm an chomhaid: lódáiltear roinnt taifead taobh le taobh gan a rianta a cheangal. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | scagairí | Coinnítear le haghaidh scagadh; roghnaíonn Type agus Name [figiúr](figures.md) gach réad, cothaíonn Event liosta imeachtaí an díbhriefe, bánann Roll an aerárthach. |
| U, V | | Méadair talún comhthreomhar an chluiche féin, nuair a bhíonn siad i ngach sampla (scríobhann DCS iad). |
| EventObjects | scagairí | Gach réad a ainmníonn imeacht (`Message|a01|b02|...`), de réir aitheantais. |
| RecordingInfo | | Maoine an taifid mar a bhí siad ag an nóiméad sin - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - mar JSON. |
| IAS, Mach, AOA, FuelWeight, ... | scagairí | Aon mhaoin uimhriúil eile a iompraíonn an taifead. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | scagairí | Aon mhaoin téacs eile a iompraíonn an taifead; is téacs maoin a bhfuil luach nach uimhir ann. |

Léitear na ceithre fhoirm de shuíomh Tacview go léir (`lon|lat|alt`, le `u|v`, le `roll|pitch|yaw`, agus le gach ceann acu agus ceann tosaigh), agus coinníonn réimsí folmha an luach deiridh; scriosann `-id` réad, agus is réad nua é id a úsáidtear arís ina dhiaidh. Láimhseáiltear comhartha scapaithe agus línte leanúnacha.

Projectáiltear na suíomhanna i gcónaí ó domhanleithead agus fadlíne, ní ghlactar le U/V riamh, mar sin roinneann taifeadtaí ó gach cluiche tionscadal amháin le cúlra den domhan fíor.
