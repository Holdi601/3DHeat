---
title: "Dubina i culling"
parent: "Načini toplote"
nav_order: 4
lang: "bs"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Dubina i odsijecanje

Dubina tjera brda i zidove da sakriju toplotu iza sebe, kao što pravi zid sakriva čovjeka. Odsijecanje po udaljenosti zadržava samo toplotu između bliske i daleke udaljenosti od kamere.

![Niska kamera iza brda, s Sakrij iza terena isključeno (lijevo) i uključeno (desno)](../assets/img/en/depth-and-culling-terrain.webp)

![Odsijecanje po udaljenosti s Daleko na 400 m i uključenim Sijeci i nivo: presjek karte oko kamere](../assets/img/en/depth-and-culling-far.webp)

Bez dubine, toplotna karta preko 3D [nivoa](levels.md) je ravan preklop: sve što skup podataka sadrži svijetli kroz svaki zid punom snagom, signali dubine koje nivo daje se poništavaju, a žarišna tačka unutar zgrade izgleda isto kao ona na njenom krovu. Odjeljak **Dubina** tjera nivo da sakrije ono što je iza njega; **Odsijecanje po udaljenosti** ograničava toplotu na ljusku ili ploču oko kamere; [Presjek](slice.md) izrezuje ploču iz svijeta. Sva tri važe za režime toplote i mijenjaju koji redovi doprinose, pa njihova promjena ponovo pokreće akumulaciju.

## Dubina {#depth}

Obje kontrole traže [nivo](levels.md) - sliku karte ili 3D model. Bez učitanog nivoa nema šta da bude iza, pa ne rade ništa. Obje su isključene dok je [Spljošti na ravan tla](sprite-shape.md#flatten-onto-ground-plane) uključeno.

### Sakrij iza terena {#hide-behind-terrain}

**Sakrij iza terena** (zadano uključeno): tačka podataka čija je najbliža površina prema kameri *teren* (a ne građevina) se potpuno odbacuje, ne samo zatamnjuje.

Teren i zidovi su neprozirni na različite načine. Namjerno gledaš *kroz* zid, da vidiš na kojem spratu je bio saobraćaj; nikad ne želiš gledati kroz brdo, jer iza njega je druga strana karte - a na karti širokoj kilometrima to je većina podataka, i zbroji se duž horizonta u pojas svjetliji od svega u prvom planu. Jedan zatamnjivač ne može služiti oboma, pa teren dobija granicu, a zidovi zadržavaju zatamnjivanje ispod.

### Skriveno iza geometrije {#hidden-behind-geometry}

**Skriveno iza geometrije** (zadano 0,8): koliko snažno je tačka podataka iza geometrije nivoa potisnuta. Vrijednost znači *prolazi kroz* na 0, *N% tamnije* između (položaj klizača, a ne izmjereno zatamnjenje), *potpuno skriveno* na 1.

Svaki zid ili pod između tačke i kamere je dodatno zatamnjuje: jedan zid ostavi nekoliko procenata pri zadanoj vrijednosti, a svaka dodatna površina prepolovi ono što ostane, do četiri površine. Na 1 se ništa iza geometrije ne crta, a to je najjeftinija postavka.

Vidi i [Izgled nivoa](level-appearance.md).

## Odsijecanje po udaljenosti {#distance-culling}

**Odsijecanje po udaljenosti** (zadano zatvoreno) ograničava toplotu na redove između bliske i daleke granice od kamere. Postavi daleku granicu da čitaš gustinu unutar zgrade, bez da se daleka strana karte zbraja preko nje; postavi bliski granicu da letiš *kroz* žarišnu tačku umjesto u nju.

| Kontrola | Zadano | Opseg (klizač) | Značenje |
|---|---|---|---|
| **Blizu** | isključeno | 0,5-5000 m, logaritamski, donjih 5% staze = isključeno (200.000) | Redovi bliži od ovoga se preskaču. |
| **Daleko** | isključeno | 1-200.000 m, logaritamski, dno = isključeno (10.000.000) | Redovi dalji od ovoga se preskaču. |
| **Sijeci ravninom** | uključeno | | Mjeri granice duž ose gledanja umjesto od oka, pa je rez ravan paralelna s ekranom, a ne sfera oko tebe. Ivica sfere se savija preko kadra i klizi kad god okreneš; ravan ostaje tamo gdje si je stavio. |
| **Sijeci i nivo** | uključeno | | Sijeci teren, građevine i vodu na istim granicama. Kada je nivo ostavljen cijel, rez uklanja tačke podataka, a zgrada ostaje stajati ispred njih; kada su oba presječena, to je presjek karte i tačke stoje uz svoje zidove i podove. Ovo samo ponovo iscrtava; ne pokreće ponovo akumulaciju. |

### Tastatura {#keyboard}

Daleka granica je kontrola kojom prelaziš - provedi je kroz zgradu i gledaj na kojem spratu se pojavljuje saobraćaj - pa je na tastaturi dok letiš ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tipka | Efekat |
|---|---|
| `]` | Gurni daleku granicu van za faktor 1,12 (Shift: 1,35) |
| `[` | Povuci je unutra za isti faktor |
| `\` | Isključi daleku granicu, ili je ponovo uključi na udaljenosti na kojoj je ostavljena (prvi put 6000) |

Koraci su geometrijski jer koristan opseg obuhvata četiri reda veličine, od sobe do karte. Tastatura drži daleku granicu između 100 i 400.000. Tipke ne rade ništa dok je fokus u polju za tekst ili meniju.

## Za programere {#for-developers}

### Sakrij iza terena {#hide-behind-terrain}

Građevine se crtaju u njihovu vlastitu teksturu dubine. Fragment koji je iza dubine scene, ali *ne* iza dubine građevina, nalazi se iza terena i odbacuje se. Košta jedan prolaz dubine preko građevina, koji se preskače kada je prekidač isključen.

### Skriveno iza geometrije {#hidden-behind-geometry}

Broji se **po površini**. Jedno poređenje dubine može samo reći „nešto je ispred", pa bi tačka iza jednog zida i tačka četiri sobe duboko u zgradi bile jednako zatamnjene, a unutrašnjost bi izgledala kao jedna blijeda mrlja. Umjesto toga, geometrija građevine se **skida po dubini** u do 3 dodatna sloja ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), svaki fragment broji koliko je površina ispred njega (sopstvena dubina scene plus skinuti slojevi: do četiri), a zatamnjenja se slažu:

```
jačina        = 1 - (1 - klizač)²                (klizač 1 → 1)
vidljivost    = (1 - jačina) × 0.5 ^ (površine - 1)
vidljivost    = max(vidljivost, 0.006)           (bez poda na klizaču 1)
```

| Klizač | 1 površina | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (zadano) | 4% | 2% | 1% | 0,6% (pod) |
| 1,0 | nije nacrtano | nije nacrtano | nije nacrtano | nije nacrtano |

Zašto dva faktora: klizač je kalibrisan tako da jedan zid ostavi nekoliko procenata - izgled koji se čita kao „iza nečega" - a nekoliko procenata složenih zajedno bi do trećeg zida bilo ništa; prepolovljavanje po svakoj daljoj površini čuva četiri razlučive stepenice. Zašto na kvadrat: linearno je zasićeno polje iza zida ostavljalo i dalje zasićeno; četvrti stepen je na 0,8 sve izbrisao. Zašto pod: potpuno skrivanje zaklonjene toplote čini da soba pune skrivenog saobraćaja izgleda kao prazna soba, bez ičega što bi sugerisalo da posegneš za [Presjekom](slice.md). Samo klizač zalijepljen na 1 sakriva ih potpuno - i to je najjeftinija postavka, jer se zaklonjene tačke tada odbacuju.

Kako ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), shaderi toplote tačaka): poređenje je po fragmentu, s teksturom dubine scene, u **dubini prozora** umjesto u svjetskoj udaljenosti. Čitanje teksture dubine u fazi vertexa na nekim drajverima vraća „daleko" svuda (među njima ANGLE-ov softverski rasterizator), a linearizovanje obje dubine u metre gubi razdvajanje zbog preciznosti pri širokom opsegu bliže/dalje. Pomak je jedan poluprečnik sprajta pretvoren u jedinice prozora plus nekoliko najmanje značajnih bitova, pa tačka podataka koja leži na površini ne zasjenjuje samu sebe.

Građevine se crtaju prozirno, ali se crtaju u dubinu koju čita zaklanjanje; nivo čije građevine ne bi stigle do teksture dubine zaklanjao bi se samo o teren.

### Odsijecanje po udaljenosti {#distance-culling}

Obje granice se računaju u shaderu vertexa, pa presječeni red košta jedan vertex i nijedan fragment.
