---
title: "Seancat, personat dhe grupet"
parent: "Si të futni të dhënat"
nav_order: 4
lang: "sq"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Seancat, personat dhe grupet

Një **person** është një gjë që lëviz (një lojtar, një makinë). Një **ekip/grup** është pala ku bën pjesë. Një **seancë** është një ndeshje ose xhiro. Shih [fjalorthin](glossary.md).

Një rresht i një skedari mund t'i emërojë të tre:

| x | y | koha | lojtari | ekipi | ndeshja |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` është personi, `team` është grupi, `match` është seanca.

Tre kolona opsionale përshkruajnë *kë* dhe *në cilën pjesë të historisë* i përket një rresht. Çdo një kodohet me fjalor gjatë ngarkimit: vlerat e tekstit bëhen id të vogla të plota për rresht plus një listë etiketash, të përbashkëta në çdo skedar të ngarkimit.

## Personi {#person}

Kolona **ID e personit** emëron gjënë që lëviz ku i përket një rresht: një lojtar, një bot, një makinë. Ruhet si një id 32-bit për rresht.

Me një kolonë personi dhe një kolonë kohe, ngarkimi llogarit **jetëgjatësinë** e çdo rreshti: kohën deri te mostra e radhës së të njëjtit person *në të njëjtën seancë*, ose "asnjë" (një vlerë rojë, -1) kur nuk ka mostër të radhës - personi vdiq, u largua, ose regjistri mbaroi. Jetëgjatësitë fuqizojnë historinë **Jetëgjatësi** të [kohëvizatës](timeline.md), ndërmjetësimin dhe moshën e vjetër te [riluajtja e kutisë](box-replay.md), dhe ndërprerjet e rrugës te [nxehtësia e vijave](line-heat.md). Çfarë bën një rresht pa pasardhës është një cilësim shikimi (*Jetë rezervë*), jo i ngulitur në të dhëna.

Çdo personi i jepet grupi i rreshtit të tij **të parë** në kohë; ky caktim ngjyros kutinë e tij te riluajtja e kutisë dhe përcakton grupin e dukshmërisë që e fsheh atje. Mënyrat e nxehtësisë përdorin grupin e çdo rreshti vetë.

### Emra të veshur nga disa gjëra njëherësh {#names-worn-by-several-things-at-once}

Një emër nuk është gjithmonë një entitet: në disa eksporte çdo bot i çdo ndeshjeje regjistrohet me një emër. Bashkimi i dy mostrave të një "personi" të tillë - me ndërmjetësim, gjurmë ose rrugë - vizaton një vijë midis dy krijesave të ndryshme nëpër hartë.

Në ngarkim ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) një emër shënohet **i përbashkët** kur dy regjistrimet e tij

- janë në të njëjtën seancë,
- kanë të njëjtën kohë,
- janë të së njëjtës natyrë (çdo kolonë kategorie e mbajtur ka të njëjtën vlerë), dhe
- janë më larg njëri-tjetrit se 1% e diagonales së shtrirjes së të dhënave.

Emrat e përbashkët vizatohen si mostra të vetme - pa ndërmjetësim, pa gjurmë, pa rrugë nxehtësie vijash. Gjithçka tjetër për ta (nxehtësia e tyre) nuk preket. Paneli i Grupit të të dhënave liston sa emra u shënuan, me deri në tre shembuj, dhe paneli i riluajtjes së kutisë e përsërit numrimin.

## Seanca {#session}

Kolona **Seanca / ndeshja** thotë cilës ndeshje, raid, raund, garë ose xhiro i përket një rresht. Ajo është ajo që e bën mostrat e një personi një gjurmë të vazhdueshme: telemetria e vërtetë shpesh ndërthur ndeshje njëkohëshme, dhe mostra e lojtarit pak para kokës së riluajtjes dhe ajo pak pas saj mund të jenë nga ndeshje të ndryshme, qindra metra larg njëra-tjetrës. Me një kolonë seance:

- ndërmjetësimi, gjurmët dhe rrugët e nxehtësisë së vijave nuk kalojnë kurrë një ndërrim seance;
- jetëgjatësia e një rreshti mbaron në fund të seancës së vet;
- **zgjedhësi i seancës** shfaqet lart në shiritin anësor, nën shiritin e mënyrave.

Një kolonë seance shpesh është një *timestamp* - çasti i fillimit të ndeshjes, i përsëritur në çdo rresht të asaj ndeshjeje. Përcaktuesi automatik kërkon emrat e seancës para personit dhe grupit për këtë arsye ([Përcaktimi i kolonave](column-mapping.md#session-person-group)). Një xhiro ose një stint garash është gjithashtu seancë: dy xhiro nga i njëjti automjet nuk duhet të bashkohen në një gjurmë të vetme.

### Zgjedhësi i seancës {#the-session-picker}

![Zgjedhësi i seancës i hapur mbi një skedar me dhjetë ndeshje: Të gjitha seancat (10), Match 01, Match 02 e kështu me radhë](../assets/img/en/sessions-persons-groups-picker.webp)

*Dhjetë ndeshje në një skedar: zgjidhni një ose shikoni të gjitha.*

Shfaqet kur grupi i të dhënave ka seanca të listuara (shih kufirin më poshtë).

| Pjesa | Kuptimi |
|---|---|
| Etiketa djathtas | Numri i rreshtave të seancës së zgjedhur, ose *të gjitha njëherësh*. |
| Menuja | *Të gjitha seancat (N)*, pastaj çdo seancë, më e zënë e para, si `etiketa - N rreshta, shtrirja` (shtrirja në sekonda nën 90 s, në minuta nën 90 min, në orë mbi të). |
| Sugjerimi i portokallit | Shfaqet për *Të gjitha seancat*: pozicionet nuk bashkohen kurrë mes seancave, por ndeshjet njëkohëshme vendosin lojtarë të palidhur së bashku në hartë. |
| Sugjerimi | Shfaqet te mënyrat e nxehtësisë kur zgjidhet një seancë: zgjedhja e lëviz vetëm kokën e riluajtjes. |

Në ngarkim zgjidhet seanca më e zënë. Zgjedhja e një seance e çon kokën e riluajtjes te fillimi i asaj seance.

Çfarë ndryshon zgjedhja:

- Te **[riluajtja e kutisë](box-replay.md)** vendos cila seancë luhet: vizatohen vetëm kutitë dhe gjurmët e asaj seance, dhe intervali i kohëvizatës bëhet shtrirja e vetë seancës.
- Te **mënyrat e nxehtësisë** nuk e kufizon nxehtësinë, dhe një sugjerim nën zgjedhësin e thotë këtë: *Në mënyrat e nxehtësisë kjo vetëm e çon kokën në fillimin e seancës; nxehtësia numëron ende çdo seancë. Riluajtja e kutisë luan vetëm seancën e zgjedhur.* Për ta kufizuar nxehtësinë në një seancë, mbajeni edhe kolonën e seancës si kolonë filtri (*Mbaj për filtrim*) dhe filtroni mbi të. Një kolonë mund të jetë edhe kolona e seancës edhe kolona e filtrit: ngarkuesi lexon çdo kolonë filtri të zgjedhur veç e veç, pavarësisht rolit tjetër që luan.

### Shumë seanca {#too-many-sessions}

Listohen deri në **100,000** seanca. Përtej kësaj kolona është me të vërtetë një id (një dosje me miliona seanca me disa rreshta secila), dhe dërgimi i kaq shumë etiketave nga punëtori te faqja është ajo që e mbyll një skedë nga memoria. Ngarkimi atëherë i mban **id-të** e seancave - kështu kufijtë zbatohen ende kudo - por i heq etiketat dhe zgjedhësin, dhe paneli i Grupit të të dhënave e thotë këtë.

## Grupi {#group}

Kolona **Ekipi / grupi** është çdo kolonë me pak vlera të ndryshme: një ekip, një palë, një skuadër, një faksion, një flamur lojtar kundër AI, një klasë makine. Ruhet si një id 16-bit për rresht dhe drejton:

- [Lista e ekipeve](teams-list.md) (dukshmëria për grup, palët + / −),
- [nxehtësia e ekipeve](team-heat.md) (një nuancë për grup),
- ndarjen e [diferencës](difference.md) sipas grupit,
- ngjyrat e kutive te [riluajtja e kutisë](box-replay.md) (një familje nuancash për grup, një hije për anëtar).

### Kufijtë {#limits}

Të shumtën **4,096** grupe të ndryshme. Id-ja e grupit udhëton në kanalin e katërt të teksel-it të pozicionit të çdo rreshti në GPU, dhe çdo grup ka nevojë për një teksel në tabelën e shenjave 4,096-gjerë që hija e lexon për të vendosur *të fshehur*, *të shtuar* ose *të zbritur*. Një kolonë me më shumë vlera të ndryshme është një id, jo grup: **ngarkimi i mban çdo rresht dhe heq vetëm grupimin**, me një paralajmërim te grupi i të dhënave që sugjeron ta hartëzoni si kolonë personi në vend të kësaj, ose ta mbani si kolonë filtri.

I njëjti kufi 4,096 zbatohet për një kolonë filtri *kategorie* të mbajtur; një më e gjerë nuk mbahet dhe grupi i të dhënave e thotë këtë. Një kolonë numerike (një timestamp, për shembull) nuk ka asnjë kufi të tillë si filtër *diapazoni*.

Vlerat e grupit `0`, një vlerë bosh, `none`, `unknown`, `null` dhe `-1` (pa dallim shkronjash) do të thonë "pa grup" për [nxehtësinë e ekipeve](team-heat.md), që i vizaton gri neutrale në vend të një ngjyre të sigurt.

## Madhësia e entitetit {#entity-size}

Sa e madhe është një gjë e ndjekur - një kuti përplasjeje e lojtarit, një makinë - përcakton sa të mëdha vizatohen kutitë dhe rrezet e shikimit të [riluajtjes së kutisë](box-replay.md). Nuk ka fushë për të në panel; vjen nga [sugjerimet `heat3d`](data-formats.md#the-heat3d-hints) të skedarit (`entity.size`, në njësitë e vetë skedarit; konvertuesi i CS2 shkruan 32). Ngarkimi e shumëzon me shkallën e njësive.

Në çdo ngarkim ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), me *shtrirjen* si më e madhja nga shtrirjet X dhe Z të të dhënave:

| Cilësimi | Me madhësi entiteti | Pa të |
|---|---|---|
| Madhësia e kubit | madhësia e entitetit | shtrirja / 500 |
| Gjatësia e rrezes së shikimit | madhësia e entitetit × 4 | shtrirja / 200 |
| Rrezja e pikës | shtrirja / 120 | shtrirja / 120 |
| Pika e ngopjes | vlerësim analitik (pastaj matet) | e njëjta |
| Shpejtësia e fluturimit | shtrirja / 12 | e njëjta |
| Plani i largët | shtrirja × 12 | e njëjta |
| Plani i afërt | max(0.05, shtrirja / 20,000) | e njëjta |

## Paneli i Grupit të të dhënave {#the-dataset-panel}

Nën panelin Burimi. Kur është ngarkuar një grup të dhënash, shfaq:

- **emrin** e grupit - zgjedhjen, numrin e rreshtave, numrin e skedarëve, hapin kur është përdorur;
- **`N ekipe · N persona · Ns shtrirje`**;
- çdo **paralajmërim** që prodhoi ngarkimi, me ngjyrë portokalli, për aq kohë sa grupi është i ngarkuar: grupe ose një kolonë filtri të hequra për shumë vlera, seanca të palistuara, emra të përbashkët, rreshta që mungojnë, skedarë të kapërcyer;
- [gjeneratori sintetik](synthetic-generator.md);
- **Hiq**, që e heq grupin e të dhënave.

Numri i rreshtave shfaqet te koka e panelit.
