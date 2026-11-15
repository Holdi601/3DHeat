---
title: "Diferencë"
parent: "Mënyrat e nxehtësisë"
nav_order: 5
lang: "sq"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Diferenca

Të kuqe aty ku ekipi A ishte më shumë, blu-jeshile aty ku ishte ekipi B, asgjë aty ku ishin të barabartë.

**Diferencë** (tasti 2) është nxehtësi me shenjë. Rreshtat e një popullate shtojnë nxehtësi; ata të një popullate tjetër e zbresin. Aty ku të dyja mbivendosen njësoj, rezultati është zero dhe plotësisht transparent; aty ku njëra mbizotëron, shfaqet me ngjyrat e asaj ane - si parazgjedhje të ngrohta (transparent → e kuqe → e verdhë → e bardhë) për anën **+** dhe të ftohta (transparent → jeshile → blu → vjollcë) për anën **−**.

![Nxehtësi diference: e kuqe aty ku ana + ishte më shumë, jeshile dhe blu aty ku ana − ishte më shumë](../assets/img/en/difference-split.webp)

## Si ta përdorësh {#how-to-use-it}

1. Shtyp `2` (ose zgjidh **Diferencë** në shiritin e modeve).
2. Hap **Ndarja e diferencës** në shiritin anësor.
3. Zgjidh çfarë të **Ndaj sipas**: zakonisht *Grupet*.
4. Vendos një grup (ose vlerë) në **+** dhe një tjetër në **−**.
5. Lexo ngjyrat: e ngrohta do të thotë ana **+**, e ftohta ana **−**. Paneli paralajmëron nëse një anë nuk ka rreshta (shih [Mesazhet që mund të shohësh](#messages-you-may-see)).

*Cilat* dy popullata janë e gjithë pyetja, kështu që ndarja mund të jetë çdo kolonë e mbajtur, jo vetëm grupe. Rreshtat që bien në **asnjërën** anë **lihen jashtë**, nuk numërohen si zero: kjo bën që një ndarje mbi dy nga shumë vlera të krahasojë saktësisht ato dy, dhe ajo kombinohet me [filtrat](filters.md) - filtro deri te një hartë, pastaj ndaje atë sipas versionit.

Modaliteti kërkon dy anë: një kolonë grupi me të paktën dy grupe, ose një ndarje mbi një kolonë të mbajtur për filtrim. Në të dhëna me më pak se dy grupe, një ngarkim fillon me një ndarje sipas kolonës - kolona *Skedari burim* e një ngarkimi me shumë skedarë së pari, përndryshe kolona e parë kategorike me dy vlera, përndryshe kolona e parë numerike me shtrirje - kështu që *krahaso dy ngarkime* funksionon edhe në të dhëna pa grupe. Vetëm të dhënat pa asnjë nga këto e lënë modalitetin të padisponueshëm; po ashtu e bën një ndarje kolone me asgjë në njërën anë.

## Paneli Ndarja e diferencës {#the-difference-split-panel}

Shfaqet në modalitetin Diferencë, poshtë paneleve të nxehtësisë.

**Ndaj sipas** ofron:

| Opsioni | Shfaqet si | Rregulli i ndarjes |
|---|---|---|
| Grupet | *Grupi (N)* (kur ka kolonë grupi) | Çdo grup në +, − ose asnjërën, vendoset te [Lista e skuadrave](teams-list.md) |
| Një kolonë kategorike | *kolona (N vlera)* | Vlerat në +, − ose asnjërën |
| Një kolonë numerike | *kolona (numerike)* | Një interval vlerash për secilën anë |
| Skedari burimor | *Skedari burim - krahaso dy ngarkime* (kur janë ngarkuar disa skedarë) | Skedarët në +, − ose asnjërën |

Ofrohen vetëm kolonat e mbajtura nën *Mbaje për filtrim* gjatë ngarkimit.

### Krahaso përqindjet, jo sasitë {#compare-shares-not-counts}

**Krahaso përqindjet, jo sasitë** (parazgjedhja jashtë) e peshon çdo anë me një pjesëtuar me numrin e vet të rreshtave, kështu që një anë me pesë herë më shumë rreshta nuk fiton vetëm me numra. Ngjyra tregon atëherë ku secila anë është proporcionalisht më e zakonshme se tjetra. Përdore kur dy anët kanë sasi shumë të ndryshme të dhënash, për shembull dy seanca me gjatësi të ndryshme.

### Mesazhet që mund të shohësh {#messages-you-may-see}

Paneli paralajmëron kur figura nuk është një diferencë e vërtetë:

| Mesazhi | Kuptimi |
|---|---|
| *N + / M −* (ose *N + / M − / K të papërdorura*) | Sa vlera janë në secilën anë (dhe në asnjërën). |
| Asnjë rresht në dritare nuk është në anën **+** | Vizatohet vetëm ana **−**. Lëviz dritaren e kronologjisë ose ndrysho ndarjen. |
| Asnjë rresht në dritare nuk është në anën **−** | Vizatohet vetëm ana **+**. |
| Asnjë vlerë nuk është në asnjërën anë | Diferenca nuk vizaton asgjë. Vendos të paktën një vlerë në **+** ose **−**. |
| *kolona* nuk mund të ndahet kështu | Kolona e zgjedhur nuk përshtatet me ndarjen. Zgjidhe kolonën përsëri. |
| Kolona e ndarjes nuk u përshtat në kujtesën e GPU për N nga M pjesë | Ato rreshta nuk vizatohen. Rrit buxhetin e GPU te Performanca → Buxhetet e burimeve, ose ngarko më pak rreshta. |

### Sipas grupit {#by-group}

Paneli thjesht të drejton te [Lista e skuadrave](teams-list.md), ku çdo grup ka një buton **+** dhe një **−**. Në çdo ngarkim, gjysma e parë e grupeve (e rrumbullosur lart) vendoset në +, pjesa tjetër në −; **Ndaj në mënyrë të barabartë** te Lista e skuadrave e bën përsëri të njëjtën gjë. Një grup në asnjërën anë, ose i fshehur me kutinë e tij, nuk kontribuon asgjë.

### Sipas vlerave kategorike {#by-category-values}

| Pjesa | Kuptimi |
|---|---|
| `a + / b − / c të papërdorura` | Sa vlera janë në secilën anë dhe në asnjërën. |
| **Pastro** | Vendos çdo vlerë në asnjërën anë. |
| Lista e vlerave | Çdo vlerë me një buton **+** dhe një **−** (kliko përsëri atë aktiv për ta hequr nga ajo anë). Një vlerë bosh shfaqet si *(mungon)*. |
| Shënimi i kufizimit | Shfaqen vetëm 200 vlerat e para: *Po shfaqen 200 vlerat e para nga N. Një kolonë kaq e gjerë është më mirë të ngushtohet fillimisht me filtër, ose të ndahet sipas intervalit nëse vlerat e saj janë të renditura.* |

Zgjedhja e kolonës e vendos vlerën e parë në + dhe të dytën në −. Kur asnjëra anë nuk ka asnjë vlerë, ndarja kthehet te grupet në vend që të shfaqë një kornizë bosh. *Skedari burim* funksionon njësoj, një vlerë për skedar - kështu krahasohen dy eksportime, dy seri testimi ose dy versione.

### Sipas intervalit {#by-range}

| Pjesa | Kuptimi |
|---|---|
| Ndihma | Minimumi dhe maksimumi i kolonës. |
| **Intervali pozitiv (+)**, **nga** / **deri** | Rreshtat me një vlerë në këtë interval, të përfshirë në të dy skajet, shtojnë. |
| **Intervali negativ (−)**, **nga** / **deri** | Rreshtat në këtë interval zbresin. |
| **Ndaj në pikën e mesit** | Vendos + në [minimumi, mesi] dhe − në [mesi, maksimumi] - gjithashtu atë që bën zgjedhja e kolonës. |

Një vlerë në të dy intervalet llogaritet si +. Intervalet nuk duhet të mbulojnë kolonën; vlerat në asnjërin nuk lihen jashtë. *Dy minutat e para kundrejt dy të fundit* është një ndarje intervali mbi një kolonë që ngjan me kohën.

## Ngjyrat {#colours}

Seksioni **Ngjyrat e nxehtësisë** tregon në këtë modalitet dy redaktues shkallësh: **Pozitive (ekipet shtuese)** dhe **Negative (ekipet zbritëse)**, secila me butonin e vet të rivendosjes (*Rivendos në transparent → e kuqe → e verdhë → e bardhë*, *Rivendos në transparent → jeshile → blu → vjollcë*). Kompozimi merr vlerën absolute të nxehtësisë neto përmes [pikës së ngopjes dhe përgjigjes](colour-and-exposure.md), dhe zgjedh shkallën negative aty ku neto është nën zero. Shih [Ngjyra dhe ekspozimi](colour-and-exposure.md#the-ramp-editor).

Përdor përgjigjen *Lineare* të dendësisë kur madhësia e diferencës ka rëndësi: është e vetmja përgjigje ku ngjyra e barabartë do të thotë numër i barabartë.

## Si funksionon {#how-it-works}

Çdo rresht merr një shenjë +1, -1 ose 0 në vertex shader ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); një 0 e refuzon rreshtin para se të vizatohet ndonjë fragment.

- Sipas grupit, shenja vjen nga një tabelë grupesh me 4,096 hyrje e indeksuar sipas id-së së grupit të rreshtit (id-ja e grupit kalon në kanalin e katërt të teksel-it të pozicionit të rreshtit).
- Sipas kategorisë, shenja vjen nga një tabelë e dytë me 4,096 hyrje, e mbushur për çdo vlerë kategorie, dhe vlera e rreshtit lexohet nga tekstura e filtrit të kolonës; një vlerë jashtë fundit të tabelës refuzohet në të dy backend-et.
- Sipas intervalit, vlera e rreshtit krahasohet me dy intervalet.

Ndryshimi i ndarjes e rinis grumbullimin.

**Grupet e fshehura mbeten të fshehura me çdo ndarje.** Nën një ndarje sipas kolone tabela e grupeve nuk mban më shenja; mban 1 për një grup të shfaqur dhe 0 për një të fshehur ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), dhe të dyja tabelat arrijnë te shader-i bashkë - dy rreshta të një teksture shenjash në WebGL2, dy gjysma të një buffer-i ruajtjeje në WebGPU. Një rresht vizatohet vetëm kur grupi i tij është i shfaqur *dhe* vlera e kolonës së tij është në një anë. Kështu, një grup i çaktivizuar te [Lista e skuadrave](teams-list.md), ose i lënë jashtë nga fokusi i anës së skedës Ndeshja, nuk kontribuon asgjë, sado që të ndahet diferenca.
