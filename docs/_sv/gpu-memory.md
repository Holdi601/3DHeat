---
title: "GPU-minnets residens"
parent: "Rendering i detalj"
nav_order: 5
lang: "sv"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU-minnets residens

Grafikkortet har bara så mycket minne. Om dina data inte ryms visar visaren det som ryms och säger det: statistikrutan får en gul rad **Inte i minnet** med antalet rader som lämnades utanför. En förkortad datamängd som ser komplett ut vore det värsta misstag ett analysverktyg kan göra, så den raden döljs aldrig.

![Statistikrutan med den gula raden Inte i minnet](../assets/img/en/gpu-memory-not-resident.webp)

För att få plats med mer kan du höja GPU-budgeten under **Resursbudgetar** och läsa in igen ([Minne och budgetar](memory-and-budgets.md#raising-the-gpu-budget)). Du kan också smalna av datan först, eller använda ett kort med mer minne.

## För utvecklare {#for-developers}

### Så lagras rader på GPU:n {#how-rows-are-stored-on-the-gpu}

Rader laddas upp en gång, när en datamängd kommer, i **block** om 8 388 608 rader (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Varje block kvantiseras mot sin egen låda och sitt eget tidsspann:

| Data | Format | Byte per rad |
|---|---|---|
| Position X, Y, Z och gruppid | fyra 16-bitars osignerade heltal (RGBA16UI i WebGL2); X, Y, Z inom blockets låda | 8 |
| Tid och livslängd (när datamängden har både tid och person) | två 16-bitars osignerade heltal (RG16UI): tid inom blockets tidsspann; livslängd där 65 535 betyder ”inget nästa prov” | 4 |

Lådan per block är det som gör att 16 bitar räcker. Ett block täcker vanligtvis en bråkdel av kartan, så kvantiseringssteget hamnar långt under en centimeter på en karta som är kilometer bred. Det ligger långt under bruset i verklig telemetri. Gruppid:t i den fjärde kanalen är gratis, och det är därför det högst kan finnas 4 096 grupper ([Grupper](sessions-persons-groups.md#limits)).

I WebGL2 är varje block en textur 8 192 texeler bred, utfylld till hela texturrader. Rader nås från `gl_VertexID` via en blockindextextur som uppdateras varje bildruta. I WebGPU är de lagringsbuffrar.

Ytterligare GPU-minne per rad, allokeras vid behov:

- varje aktivt kolumnfilter: 4 byte per rad (32-bitars flyttalsvärden eller kategorid-id), laddas upp per block första gången filtret används ([Filter](filters.md));
- [linjevärme](line-heat.md): 8 byte per rad (varje segments start, kvantiserad inom datans låda, och dess flaggor) medan Linjer-läget är på.

Dessutom kommer renderingsmålen: scenens färg och djup, värmemålet och dess skrapkopia (fyra kanaler i [Lagvärme](team-heat.md)), och djuplagren för [skymning](depth-and-culling.md). Till det kommer banans geometri.

### Budgeten tillämpas vid uppladdning {#the-budget-is-enforced-at-upload}

WebGL godkänner allokeringar som den inte kan betjäna. Sedan förlorar den antingen kontexten eller faller tillbaka på systemminnet till en förödande kostnad. Därför tillämpas GPU-budgeten när datamängden laddas upp ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- block laddas upp i ordning, alltså i tidsordning, så länge de ryms;
- det första blocket som inte ryms laddas upp **delvis**, med så många hela texturrader som den återstående budgeten rymmer, i stället för inte alls. En budget som inte rymmer ett helt block visar då så mycket den kan. Eftersom raderna är tidsordnade är delen som visas ett sammanhängande tidsavsnitt;
- allt efter det är **inte i minnet**.

Bristen döljs inte. Statistikrutan visar en gul rad **Inte i minnet** med antalet rader som inte fick plats, varje gång antalet är över noll. En avkortad datamängd som ser komplett ut är det värsta fel ett analysverktyg kan ha. [Passformskontrollen](memory-and-budgets.md#the-fit-check) före inläsningen är till för att förhindra det här fallet.

Budgeten som renderaren använder är GPU-budgeten från **Resursbudgetar**, samma siffra som passformskontrollen använder. Den gäller också över den upptäckta siffran, upp till reglagets tak (se [Höja GPU-budgeten](memory-and-budgets.md#raising-the-gpu-budget)). Den tillämpas när en datamängd laddas upp. Ändras den efteråt gäller ändringen först vid nästa inläsning.
