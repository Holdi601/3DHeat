---
title: "GPU-minnebruk"
parent: "Rendering i detalj"
nav_order: 5
lang: "no"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU-minneresidens

Grafikkortet har bare så mye minne. Får ikke dataene plass, viser visningsprogrammet det som får plass, og sier fra om det: statistikkboksen får en gul linje **Ikke i minnet** med antallet rader som ble utelatt. Et forkortet datasett som så komplett ut, ville vært den verste feilen et analyseverktøy kan gjøre, så denne linjen skjules aldri.

![Statistikkboksen med den gule linjen Ikke i minnet](../assets/img/en/gpu-memory-not-resident.webp)

For å få plass til mer, øk GPU-budsjettet under **Ressursbudsjetter** og last inn på nytt ([Minne og budsjetter](memory-and-budgets.md#raising-the-gpu-budget)), snevr inn dataene først, eller bruk et kort med mer minne.

## For utviklere {#for-developers}

### Slik lagres rader på GPU-en {#how-rows-are-stored-on-the-gpu}

Rader lastes opp én gang, når et datasett kommer, i **biter** på 8 388 608 rader (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Hver bit kvantiseres mot sin egen avgrensningsboks og tidsspenn:

| Data | Format | Byte per rad |
|---|---|---|
| Posisjon X, Y, Z og gruppe-id | fire 16-bit usignerte heltall (RGBA16UI på WebGL2); X, Y, Z innenfor bitens avgrensningsboks | 8 |
| Tid og levetid (når datasettet har både tid og person) | to 16-bit usignerte heltall (RG16UI): tid innenfor bitens tidsspenn; levetid der 65 535 betyr "ingen neste prøve" | 4 |

Avgrensningsboksene per bit er det som gjør at 16 bit er nok: en bit dekker vanligvis en brøkdel av kartet, så kvantiseringssteget havner godt under en centimeter på et kart som er kilometer bredt, langt under støyen i ekte telemetri. Gruppe-id-en som sitter i den fjerde kanalen er gratis, og er grunnen til at det høyst kan finnes 4 096 grupper ([Grupper](sessions-persons-groups.md#limits)).

På WebGL2 er hver bit en tekstur 8 192 teksler bred, polstret til hele teksturrader; radene nås fra `gl_VertexID` gjennom en blokkindekstekstur per bilde. På WebGPU er de lagringsbuffere.

Mer GPU-minne per rad, tildelt ved bruk:

- hvert aktivt kolonnefilter ([filter](filters.md)): 4 byte per rad (32-bits flyttallsverdier eller kategori-id-er), lastet opp per bit første gang filteret brukes;
- [linjevarme](line-heat.md): 8 byte per rad (hvert segments start, kvantisert innenfor dataenes avgrensningsboks, og flaggene) mens Linjer-modus er på.

Pluss renderingsmålene: scenefarge og dybde, varmemålet og dets arbeidskopi (fire kanaler i [Lagvarme](team-heat.md)), og lagene for dybdepeeling til [okklusjon](depth-and-culling.md); og nivåets geometri.

### Budsjettet håndheves ved opplasting {#the-budget-is-enforced-at-upload}

WebGL aksepterer allokeringer den ikke kan betjene, og så enten mister konteksten eller faller tilbake til systemminnet til en ødeleggende kostnad. Derfor håndheves GPU-budsjettet når datasettet lastes opp ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- bitene lastes opp i rekkefølge (altså i tidsrekkefølge) så lenge de får plass;
- den første biten som ikke får plass lastes opp **delvis** - så mange hele teksturrader som resten av budsjettet rommer - i stedet for ikke i det hele tatt, slik at et budsjett som ikke rommer en hel bit fortsatt viser så mye det kan. Siden radene er tidsordnet, er den delen som vises et sammenhengende tidsrom;
- alt etter det er **ikke i minnet**.

Mangelen skjules ikke: statistikkboksen viser en **Ikke i minnet**-linje med antallet rader som ikke fikk plass, i gult, hver gang den er over null. Et avkuttet datasett som ser komplett ut, er den verste feilen et analyseverktøy kan ha. [Kontrollen av plass](memory-and-budgets.md#the-fit-check) før lasting er ment å forhindre dette tilfellet.

Budsjettet renderingen bruker er GPU-budsjettet fra **Ressursbudsjetter**, det samme tallet som kontrollen av plass bruker. Det er over det oppdagede tallet også, opp til glidebryterens øvre grense (se [Øke GPU-budsjettet](memory-and-budgets.md#raising-the-gpu-budget)). Det tas i bruk når et datasett lastes opp; endres det etterpå, virker det ved neste lasting.
