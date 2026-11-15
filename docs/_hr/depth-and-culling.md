---
title: "Dubina i odbacivanje"
parent: "Načini topline"
nav_order: 4
lang: "hr"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Dubina i odsijecanje

Dubina tera brda i zidove da skrivaju toplinu iza sebe, kao što stvaran zid skriva osobu. Odsijecanje po udaljenosti zadržava samo toplinu između bliske i udaljene granice od kamere.

![Niska kamera iza brda, s Sakrij iza terena isključeno (lijevo) i uključeno (desno)](../assets/img/en/depth-and-culling-terrain.webp)

![Odsijecanje po udaljenosti s Daleko na 400 m i Reži i razinu uključeno: isječak karte oko kamere](../assets/img/en/depth-and-culling-far.webp)

Bez dubine, toplinska karta preko 3D [razine](levels.md) je ravan prekrivni sloj: sve što skup podataka sadrži svijetli kroz svaki zid punom jačinom, dubinski znakovi koje razina pruža poništavaju se, a vruća točka unutar zgrade izgleda isto kao ona na njezinu krovu. Odjeljak **Dubina** tjera razinu da sakrije ono što je iza nje. **Odsijecanje po udaljenosti** ograničava toplinu na ljusku ili ploču oko kamere, a [Isječak](slice.md) izrezuje ploču iz svijeta. Sva tri djeluju na načine topline i mijenjaju koji redci doprinose, pa njihova promjena ponovno pokreće akumulaciju.

## Dubina {#depth}

Oba upravljača trebaju [razinu](levels.md): sliku karte ili 3D model. Bez učitane razine nema ničega iza čega bi nešto bilo, pa ne rade ništa. Oba su isključena dok je uključeno [Spljošti na ravninu tla](sprite-shape.md#flatten-onto-ground-plane).

### Sakrij iza terena {#hide-behind-terrain}

**Sakrij iza terena** (zadano uključeno): podatkovna točka čija je najbliža površina prema kameri *tlo* (a ne građevina) potpuno se odbacuje, ne samo zatamnjuje.

Teren i zidovi neprozirni su na različite načine. Namjerno gledate *kroz* zid, da vidite na kojem je katu bio promet. Kroz brdo nikad ne želite gledati, jer iza njega je druga strana karte, a na karti dugoj kilometre to je većina podataka. Ona se zbraja duž horizonta u pojas svjetliji od svega u prednjem planu. Jedno zatamnjenje ne može služiti oboma, pa teren dobiva granicu odsijecanja, a zidovi zadržavaju zatamnjenje u nastavku.

### Skriveno iza geometrije {#hidden-behind-geometry}

**Skriveno iza geometrije** (zadano 0,8): koliko se snažno potiskuje podatkovna točka iza geometrije razine. Vrijednost znači *prosijava* na 0, *N% tamnije* između (položaj klizača, a ne izmjereno zatamnjenje), a *potpuno skriveno* na 1.

Svaki zid ili pod između točke i kamere dodatno je zatamnjuje. Jedan zid na zadanoj postavci ostavlja nekoliko postotaka, a svaka dodatna površina prepolovljuje ono što je ostalo, do četiri površine. Na 1 ništa iza geometrije se ne crta, a to je ujedno i najjeftinija postavka.

Pogledajte i [Izgled razine](level-appearance.md).

## Odsijecanje po udaljenosti {#distance-culling}

**Odsijecanje po udaljenosti** (zadano zatvoreno) ograničava toplinu na retke između bliske i udaljene granice od kamere. Postavite udaljenu granicu da čitate gustoću unutar zgrade, a da se daleka strana karte ne zbraja preko nje. Postavite blisku granicu da letite *kroz* vruću točku, a ne u nju.

| Upravljač | Zadano | Raspon (klizanje) | Značenje |
|---|---|---|---|
| **Blizu** | isključeno | 0,5–5000 m, logaritamski; donjih 5% klizača = isključeno (200.000) | Retci bliži od ove granice preskaču se. |
| **Daleko** | isključeno | 1–200.000 m, logaritamski; dno = isključeno (10.000.000) | Retci dalji od ove granice preskaču se. |
| **Reži ravninom** | uključeno | | Granice se mjere duž osi pogleda, a ne od oka, pa je rez ravnina paralelna sa zaslonom, a ne kugla oko vas. Rub kugle se savija preko kadra i pomiče se čim okrenete glavu, dok ravnina ostaje tamo gdje ste je stavili. |
| **Reži i razinu** | uključeno | | Teren, građevine i vodu reže na istim granicama. Kad je razina ostavljena cijela, rez uklanja podatkovne točke, a zgrada ostaje stajati ispred njih. Kad su oba rezana, to je presjek karte, a točke leže uz svoje zidove i podove. Ovo samo ponovno iscrtava i ne pokreće akumulaciju ispočetka. |

### Tipkovnica {#keyboard}

Daleka granica je upravljač koji pomičete. Provedete je kroz zgradu i gledate na kojem se katu pojavljuje promet, pa je tijekom letenja dostupna na tipkovnici ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tipka | Učinak |
|---|---|
| `]` | Gura daleku granicu van za faktor 1,12 (Shift: 1,35) |
| `[` | Povlači je unutra za isti faktor |
| `\` | Isključuje daleku granicu ili je ponovno uključuje na udaljenosti na kojoj je ostavljena (prvi put 6000) |

Koraci su geometrijski, jer korisni raspon obuhvaća četiri reda veličine, od sobe do karte. Tipkovnica drži daleku granicu između 100 i 400.000. Tipke ne rade dok je fokus u tekstnom polju ili izborniku.

## Za razvojne programere {#for-developers}

### Sakrij iza terena {#hide-behind-terrain}

Građevine se crtaju u vlastitu teksturu dubine. Fragment koji je iza dubine scene, ali *ne* iza dubine građevina, nalazi se iza tla i odbacuje se. Košta jedan prolaz dubine preko građevina, koji se preskače kad je prekidač isključen.

### Skriveno iza geometrije {#hidden-behind-geometry}

Računa se **po površini**. Jedna usporedba dubine može reći samo "nešto je ispred", pa bi točka iza jednog zida i točka četiri sobe duboko u zgradi bile jednako zatamnjene, a unutrašnjost bi se čitala kao jedan blijedi trag. Umjesto toga, geometrija građevina **se peelira po dubini** u do 3 dodatna sloja ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Svaki fragment broji koliko je površina ispred njega (dubina same scene plus peelirani slojevi: do četiri), a zatamnjenja se slažu:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Klizač | 1 površina | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (zadano) | 4% | 2% | 1% | 0,6% (donja granica) |
| 1,0 | nije crtano | nije crtano | nije crtano | nije crtano |

Zašto dva faktora: klizač je baždaren tako da jedan zid ostavi nekoliko postotaka, što izgleda kao "iza nečega". Nekoliko postotaka slaganih zajedno kod trećeg zida bilo bi ništa, pa prepolovljavanje po svakoj daljnjoj površini zadržava četiri razlučiva koraka. Zašto na kvadrat: linearno je ostavljalo zasićeno polje i dalje zasićeno iza zida, a četvrta potencija je na 0,8 izbrisala sve. Zašto donja granica: potpuno skrivanje zakrivene topline čini sobu punu skrivenog prometa praznom sobom, bez ičega što bi potaklo da posegnete za [Isječkom](slice.md). Samo klizač na 1 skriva potpuno, a to je i najjeftinija postavka, jer se zakrivene točke tada odbacuju.

Kako ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), shaderi točkaste topline): usporedba se radi po fragmentu, prema teksturi dubine scene, u **dubini prozora**, a ne u svjetskoj udaljenosti. Dohvat teksture dubine u fazi vrhova na nekim upravljačkim programima (među njima rasterizator ANGLE u softveru) čita "daleko" posvuda, a linearizacija obiju dubina u metre gubi razdvajanje zbog preciznosti pri širokom rasponu bliže i dalje ravnine. Pomak je jedan polumjer spritea pretvoren u jedinice prozora plus nekoliko najmanjih bitova, pa točka koja leži na površini ne zasjenjuje samu sebe.

Građevine se crtaju prozirno, ali se crtaju u dubinu koju čita zakrivljenje. Razina čije građevine ne bi dospjele u teksturu dubine zakrivljivala bi se samo prema terenu.

### Odsijecanje po udaljenosti {#distance-culling}

Obje granice se računaju u shaderu vrhova, pa odsječeni redak košta jedan vrh i nijedan fragment.
