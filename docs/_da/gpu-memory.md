---
title: "GPU-hukommelsesresidens"
parent: "Renderingens indre"
nav_order: 5
lang: "da"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU-hukommelsesresidens

Grafikkortet har kun en vis mængde hukommelse. Passer dine data ikke, viser fremviseren det, der passer, og siger det. Statistikoverlejringen får en gulbrun linje **Ikke indlæst** med antallet af rækker, der blev udeladt. Et forkortet datasæt, der så ud til at være komplet, er den værste fejl, et analyseværktøj kan lave, så denne linje skjules aldrig.

![Statistikoverlejringen med den gulbrune linje Ikke indlæst](../assets/img/en/gpu-memory-not-resident.webp)

For at få plads til mere, hæv GPU-budgettet under **Ressourcebudgetter** og indlæs igen ([Hukommelse og budgetter](memory-and-budgets.md#raising-the-gpu-budget)). Du kan også indsnævre dataene først eller bruge et kort med mere hukommelse.

## Til udviklere {#for-developers}

### Sådan gemmes rækker på GPU'en {#how-rows-are-stored-on-the-gpu}

Rækker uploades én gang, når et datasæt kommer, i **bidder** på 8.388.608 rækker (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Hver bid kvantiseres mod sin egen afgrænsningsboks og sit eget tidsspænd:

| Data | Format | Bytes pr. række |
|---|---|---|
| Position X, Y, Z og gruppe-id | fire 16-bit usignerede heltal (RGBA16UI på WebGL2). X, Y, Z inden for bidens afgrænsningsboks | 8 |
| Tid og levetid (når datasættet har både tid og person) | to 16-bit usignerede heltal (RG16UI): tid inden for bidens tidsspænd. Levetid, hvor 65.535 betyder "ingen næste prøve" | 4 |

Afgrænsningsboksene pr. bid er det, der gør 16 bit nok. En bid dækker normalt kun en del af kortet, så kvantiseringstrinnet bliver langt under en centimeter på et kort, der er kilometer bredt. Det er langt under støjen i rigtig telemetri. Gruppe-id'et i den fjerde kanal er gratis, og det er grunden til, at der højst kan være 4.096 grupper ([Grupper](sessions-persons-groups.md#limits)).

På WebGL2 er hver bid en tekstur, der er 8.192 texels bred og fyldt op til hele teksturrækker. Rækker nås fra `gl_VertexID` gennem en blokindekstekstur pr. billede. På WebGPU er de lagerbuffere.

Yderligere GPU-hukommelse pr. række, allokeret efter behov:

- hvert aktivt kolonnefilter: 4 byte pr. række (32-bit float-værdier eller kategori-id'er), uploadet pr. bid første gang filteret bruges;
- [linjevarme](line-heat.md): 8 byte pr. række (hvert segments start, kvantiseret inden for datasættets afgrænsningsboks, og dets flag), mens linjetilstanden er slået til.

Dertil kommer renderingsmålene: scenens farve og dybde, varmemålet og dets arbejdskopi (fire kanaler i [Holdvarme](team-heat.md)), dybdepeeling-lagene til [okklusion](depth-and-culling.md) og banens geometri.

### Budgettet håndhæves ved upload {#the-budget-is-enforced-at-upload}

WebGL accepterer allokeringer, den ikke kan betjene. Så taber den enten konteksten eller falder tilbage til systemhukommelse til en ødelæggende pris. GPU-budgettet håndhæves derfor, når datasættet uploades ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- bidder uploades i rækkefølge (det vil sige i tidsorden), så længe de passer;
- den første bid, der ikke passer, uploades **delvist**: så mange hele teksturrækker, som det resterende budget rummer, i stedet for slet ikke. Et budget, der ikke kan rumme en hel bid, viser dermed så meget, det kan. Da rækkerne er tidsordnede, er den viste del et sammenhængende stykke tid;
- alt efter det er **ikke indlæst**.

Manglen skjules ikke. Statistikoverlejringen viser en gulbrun linje **Ikke indlæst** med antallet af rækker, der ikke passede, når tallet er over nul. Et afkortet datasæt, der ser komplet ud, er den værste fejl, et analyseværktøj kan have. [Pladstjekket](memory-and-budgets.md#the-fit-check) før indlæsning skal forhindre dette tilfælde.

Budgettet, rendereren bruger, er GPU-budgettet fra **Ressourcebudgetter**, det samme tal som pladstjekket bruger. Det gælder også over det registrerede tal, op til skyderens loft (se [Hæv GPU-budgettet](memory-and-budgets.md#raising-the-gpu-budget)). Det anvendes, når et datasæt uploades. Ændres det bagefter, træder ændringen i kraft ved næste indlæsning.
