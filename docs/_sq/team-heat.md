---
title: "Nxehtësi ekipi"
parent: "Mënyrat e nxehtësisë"
nav_order: 6
lang: "sq"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Nxehtësi ekipi

Nxehtësia e ekipit tregon ku ishte çdo ekip, çdo ekip me ngjyrën e vet. Aty ku ekipet mbivendosen, ngjyrat përzihen.

**Nxehtësi ekipi** (tasti 3) është fusha e dendësisë së [Nxehtësisë](heat.md) me çdo [grup](glossary.md) të dhënë një nuancë të vetën. Aty ku grupet mbivendosen, nuancat përzihen; një garë e barabartë del neutrale. Opaciteti ende mbart dendësinë saktësisht si në modalitetet e tjera, kështu që figura përgjigjet *sa* dhe *kujt* njëherësh. Kërkon një kolonë grupi.

![Nxehtësi ekipi: secila anë me ngjyrën e vet; aty ku mbivendosen, ngjyrat përzihen](../assets/img/sq/heat-teams.webp)

Nuk është [mbivendosja e figurave](box-replay.md): ajo vizaton një figurë për person; kjo është një fushë nxehtësie e ngjyrosur sipas së njëjtës kolonë.

## Si ta përdorësh {#how-to-use-it}

1. Shtyp `3` (ose zgjidh **Nxehtësi ekipi** në shiritin e modeve).
2. Hap **Ngjyrat e nxehtësisë**. Mostrat tregojnë ngjyrën e çdo grupi; kalo mbi një mostër për emrin e ekipit.
3. Nëse gjithçka duket gri, rrit **Ndarja e ngjyrave**.
4. Hiq shenjën e një grupi te [Lista e skuadrave](teams-list.md) për ta hequr; ngjyrat e tjerave mbeten aty ku ishin.

## Kontrollet {#controls}

Në seksionin **Ngjyrat e nxehtësisë**:

| Kontrolli | Parazgjedhja | Kuptimi |
|---|---|---|
| Mostrat | | Ngjyra e çdo grupi, për 12 grupet e para, pastaj *+N të tjerë*. Kalo mbi to për emrin e grupit dhe ngjyrën. |
| **Ndarja e ngjyrave** | 1.4 | Sa larg shtyhet një përzierje nga neutrali, 0-4. 0 e bën gjithçka gri; 1 është mesatarja e vërtetë; mbi rreth 2 përzierjet më të ndritshme dalin jashtë gamës së shfaqshme dhe kufizohen për secilin kanal, çka ndryshon nuancën e tyre. |
| **Shkalla e opacitetit (ngjyra vjen nga grupi)** | shkalla e nxehtësisë parazgjedhur | Këtu përdoret vetëm **alfa** e shkallës: transparente aty ku s'ka asgjë, e errët në majë. Ngjyrat e saj injorohen. |

Të gjitha kontrollet e tjera të nxehtësisë - forma, ngopja, përgjigja, nxehtësia minimale, thellësia, heqja - punojnë si te [Nxehtësi](heat.md).

[Lista e skuadrave](teams-list.md) shfaq ngjyrën e nxehtësisë së ekipit të çdo grupi si mostrën e tij në këtë modalitet. Fshehja e një grupi lë ngjyrën e çdo grupi tjetër aty ku ishte: nuancat vijnë nga numri total i grupeve, jo nga ato që janë të ndezura, kështu që dy figura mbeten të krahasueshme.

## Paleta {#the-palette}

Nga [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Ngjyrat jetojnë në planin e ngjyrave **Oklab** me ndriçim (0.7) dhe kromë (0.115) të fiksuar, kështu që çdo grup është po aq i ndritshëm, dhe një grup i kuq nuk duket më i nxehtë se një i kaltër.
- Me *n* grupe, rrethi i nuancave ndahet në *n* pjesë të barabarta, dhe grupi *i* merr **qendrën** e pjesës së vet, `(i + 0.5) / n` e një rrotullimi. Çdo dy grupe janë sa më larg njëri-tjetrit sa lejon numri, dhe të kundërtat mbeten të kundërta sado që të jetë numri.
- Përdoren më së shumti **16** nuanca të dallueshme. Me më shumë grupe, id-të vendosen me përgjysmim të përsëritur (id-të e kthyera me bit: 0, ½, ¼, ¾, ⅛, …) që id-të fqinje të mos ndajnë një nuancë; grupet pas 16-ës patjetër ndajnë.
- Një grup, etiketa e të cilit do të thotë "pa grup" - `0`, bosh, `none`, `unknown`, `null` ose `-1`, pa dallim shkronjash - vizatohet **gri neutrale** në vend që të marrë një copë nga rrethi. Vetëm etiketa e parë e tillë në listën e grupeve trajtohet kështu.

Ndarja parazgjedhur është 1.4 e jo 1, sepse me 1, një përzierje e pesë nuancave të shpërndara njësoj *është* gri: e saktë dhe e pakuptueshme. Pak mbi 1 i mban barazimet të ndershme duke e bërë të dukshme një ndarje 60/40.

## Si funksionon {#how-it-works}

Objektivi i nxehtësisë ka katër kanale në këtë modalitet. Çdo sprite shton dendësinë e vet *v* në kanalin e parë dhe *v* × koordinatat Oklab *a* dhe *b* të grupit në të dytin dhe të tretin. Në kohën e kompozimit, përzierja e pikselit është mesatarja e peshuar me dendësinë: *a* = G / R, *b* = B / R, e shkallëzuar me ndarjen e ngjyrave dhe e kthyer në sRGB me ndriçimin e paletës. Pjesëtimi me dendësinë e grumbulluar e mban nuancën të pavarur nga sa të dhëna ka, dhe kjo është arsyeja pse çdo kontroll dendësie vazhdon të veprojë vetëm mbi opacitetin.

Objektivi me katër kanale kushton katër herë kujtesën e GPU-së të objektivit të nxehtësisë me një kanal, në të njëjtën rezolucion.
