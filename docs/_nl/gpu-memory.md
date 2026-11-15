---
title: "GPU-geheugenverblijf"
parent: "Renderinginterne werking"
nav_order: 5
lang: "nl"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU-geheugenverblijf

De grafische kaart heeft maar een beperkte hoeveelheid geheugen. Past je data er niet in, dan toont de viewer wat er wel in past en zegt dat erbij: de statistiekenoverlay krijgt een oranje regel **Niet in het geheugen** met het aantal rijen dat is weggelaten. Een ingekorte dataset die compleet leek, zou de ergste fout zijn die een analysehulpmiddel kan maken, dus deze regel wordt nooit verborgen.

![De statistiekenoverlay met de oranje regel Niet in het geheugen](../assets/img/en/gpu-memory-not-resident.webp)

Om meer te laten passen, verhoog je het GPU-budget onder **Resourcebudgetten** en laad je opnieuw ([Geheugen en budgetten](memory-and-budgets.md#raising-the-gpu-budget)), maak je eerst de data smaller, of gebruik je een kaart met meer geheugen.

## Voor ontwikkelaars {#for-developers}

### Hoe rijen op de GPU worden opgeslagen {#how-rows-are-stored-on-the-gpu}

Rijen worden één keer geüpload, wanneer een dataset binnenkomt, in **blokken** van 8.388.608 rijen (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Elk blok wordt gekwantiseerd met zijn eigen begrenzingskader en tijdspanne:

| Data | Formaat | Bytes per rij |
|---|---|---|
| Positie X, Y, Z en de groeps-id | vier 16-bit-gehele getallen zonder teken (RGBA16UI op WebGL2); X, Y, Z binnen het begrenzingskader van het blok | 8 |
| Tijd en levensduur (wanneer de dataset zowel tijd als persoon heeft) | twee 16-bit-gehele getallen zonder teken (RG16UI): tijd binnen de tijdspanne van het blok; levensduur, waarbij 65.535 "geen volgend monster" betekent | 4 |

De begrenzingskaders per blok maken dat 16 bits genoeg zijn: een blok beslaat meestal een deel van de kaart, dus de kwantisatiestap komt ruim onder een centimeter uit op een kaart die kilometers breed is, ver onder de ruis in echte telemetrie. De groeps-id in het vierde kanaal is gratis - en daarom kunnen er hooguit 4.096 groepen zijn ([Groepen](sessions-persons-groups.md#limits)).

Op WebGL2 is elk blok een textuur van 8.192 texels breed, opgevuld tot hele texturrijen; rijen worden benaderd vanuit `gl_VertexID` via een per-frame blokindex-textuur. Op WebGPU zijn het opslagbuffers.

Verder GPU-geheugen per rij, dat pas wordt toegewezen bij gebruik:

- elk actief kolomfilter ([Filters](filters.md)): 4 bytes per rij (waarden als 32-bit-floats of categorie-id's), per blok geüpload de eerste keer dat het filter wordt gebruikt;
- [Lijnwarmte](line-heat.md): 8 bytes per rij (het beginpunt van elk segment, gekwantiseerd binnen het begrenzingskader van de data, en de vlaggen) zolang de modus Lijnen aan staat.

Daarbij komen de rendertargets: scènekleur en diepte, het warmtedoel en zijn tijdelijke tweelingdoel (vier kanalen in [Teamwarmte](team-heat.md)), en de laagjes voor depth-peeling voor [occlusie](depth-and-culling.md); en de geometrie van het niveau.

### Het budget wordt afgedwongen bij het uploaden {#the-budget-is-enforced-at-upload}

WebGL accepteert toewijzingen die het niet kan bedienen en verliest dan de context, of valt terug op systeemgeheugen tegen een ruïneuze prijs. Daarom wordt het GPU-budget afgedwongen wanneer de dataset wordt geüpload ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- blokken worden in volgorde geüpload (dus in tijdsvolgorde) zolang ze passen;
- het eerste blok dat niet past, wordt **gedeeltelijk** geüpload - zoveel hele texturrijen als het resterende budget bevat - in plaats van helemaal niet, zodat een budget dat geen heel blok kan bevatten toch zoveel toont als het kan; en omdat rijen op tijd zijn geordend, is het getoonde deel een samenhangend stuk tijd;
- alles daarna is **niet in het geheugen**.

Het tekort is niet verborgen: de statistiekenoverlay toont een oranje regel **Niet in het geheugen** met het aantal rijen dat niet paste, zodra dat boven nul ligt. Een afgekapte dataset die compleet lijkt, is de ergste fout die een analysehulpmiddel kan hebben. De [passingscontrole](memory-and-budgets.md#the-fit-check) vóór het laden moet dit geval voorkomen.

Het budget dat de renderer gebruikt is het GPU-budget uit **Resourcebudgetten**, hetzelfde getal als de passingscontrole gebruikt - ook boven het gedetecteerde getal, tot het plafond van de schuifregelaar (zie [GPU-budget verhogen](memory-and-budgets.md#raising-the-gpu-budget)). Het wordt toegepast wanneer een dataset wordt geüpload; wijzigen daarna werkt bij het volgende laden.
