---
title: "Minnisdvöl skjákorts"
parent: "Innri hlutar myndvinnslu"
nav_order: 5
lang: "is"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Minnisbúseta GPU

Skjákortið hefur aðeins takmarkað minni. Ef gögnin þín passa ekki sýnir skoðarinn það sem passar og segir frá því: tölfræðigluggann fær gulbrúna línu **Ekki í minni** með fjölda lína sem voru skildar eftir. Stytt gagnasafn sem leit út fyrir að vera heilt væri versta mistök sem greiningartól getur gert, svo þessi lína er aldrei falin.

![Tölfræðigluggi með gulbrúnu Not resident línunni](../assets/img/en/gpu-memory-not-resident.webp)

Til að passa meira skaltu hækka GPU-heimildina undir **Auðlindaheimildir** og hlaða aftur ([Minni og heimildir](memory-and-budgets.md#raising-the-gpu-budget)), þrengja gögnin fyrst, eða nota kort með meira minni.

## Fyrir forritara {#for-developers}

### Hvernig línur eru geymdar á GPU {#how-rows-are-stored-on-the-gpu}

Línur eru sendar inn einu sinni, þegar gagnasafn kemur, í **hlutum** af 8.388.608 línum (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Hver hluti er kvarðaður miðað við eigin afmörkunarbox og tímabil:

| Gögn | Snið | Bæti á línu |
|---|---|---|
| Staða X, Y, Z og hópauðkenni | fjórar 16 bita óteiknaðar heiltölur (RGBA16UI á WebGL2); X, Y, Z innan afmörkunarboxs hlutans | 8 |
| Tími og líftími (þegar gagnasafnið hefur bæði tíma og persónu) | tvær 16 bita óteiknaðar heiltölur (RG16UI): tími innan tímabils hlutans; líftími þar sem 65.535 þýðir „ekkert næsta sýni“ | 4 |

Afmörkunarbox á hvern hluta eru það sem gera 16 bita nóg: hluti þekur venjulega brot af kortinu, svo kvörðunarskrefið lendir langt undir sentimetra á korti sem er kílómetrar á breidd, langt undir suðinu í raunverulegum mælingum. Hópauðkennið í fjórðu rásinni kostar ekkert - og þess vegna geta verið að hámarki 4.096 hópar ([Hópar](sessions-persons-groups.md#limits)).

Á WebGL2 er hver hluti áferð 8.192 texel á breidd, fyllt upp í heilar áferðarraðir; línunum er náð úr `gl_VertexID` í gegnum blokkavísa-áferð sem er endurnýjuð á hverjum ramma. Á WebGPU eru þær geymslubuffar.

Frekara GPU-minni á línu, úthlutað við notkun:

- hver virk dálkasía ([sía](filters.md)): 4 bæti á línu (32 bita fleytigildi eða flokkaauðkenni), send inn á hvern hluta í fyrsta skipti sem síunni er beitt;
- [línuhiti](line-heat.md): 8 bæti á línu (upphaf hvers hluta, kvarðað innan afmörkunarboxs gagnanna, og flaggar hans) meðan Lines-hamurinn er á.

Auk þess skotmörk teiknunar: litur og dýpt senunnar, hitamarkið og skrifmarkið þess (fjórar rásir í [Team heat](team-heat.md)), dýptarlögin fyrir [hulu](depth-and-culling.md); og rúmfræði borðsins.

### Heimildin er framfylgd við innsendingu {#the-budget-is-enforced-at-upload}

WebGL tekur við úthlutunum sem það getur ekki þjónað og tapar síðan samhenginu eða fellur yfir í kerfisminni á hrikalegum kostnaði, svo GPU-heimildin er framfylgd þegar gagnasafnið er sent inn ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- hlutar eru sendir inn í röð (það er í tímaröð) meðan þeir passa;
- fyrsti hlutinn sem passar ekki er sendur inn **að hluta** - eins margar heilar áferðarraðir og eftirstandandi heimild rúmar - frekar en alls ekki, svo heimild sem rúmar ekki heilan hluta sýnir samt eins mikið og hún getur, og þar sem línurnar eru tímaraðaðar er sýnilegi hlutinn samfelldur tímabútur;
- allt sem á eftir kemur er **ekki í minni**.

Skorturinn er ekki falinn: tölfræðigluggi sýnir línu **Ekki í minni** með fjölda lína sem pössuðu ekki, í gulbrúnu, alltaf þegar hún er yfir núlli. Stytt gagnasafn sem lítur heilt út er versta bilun sem greiningartól getur haft. [Passaprófið](memory-and-budgets.md#the-fit-check) fyrir hleðslu er ætlað til að koma í veg fyrir þetta tilvik.

Heimildin sem teiknarinn notar er GPU-heimildin úr **Auðlindaheimildir**, sama tala og passaprófið notar - einnig yfir greindu tölunni, upp að hámarki sleðans (sjá [Hækka GPU-heimildina](memory-and-budgets.md#raising-the-gpu-budget)). Hún er beitt þegar gagnasafn er sent inn; breyting á henni eftir á tekur gildi við næstu hleðslu.
