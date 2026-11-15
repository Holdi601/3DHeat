---
title: "Globina in izrezovanje"
parent: "Načini toplote"
nav_order: 4
lang: "sl"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Globina in izrezovanje

Globina naredi, da hribi in zidovi skrijejo toploto za seboj, tako kot pravi zid skrije človeka. Izločanje po razdalji ohrani samo toploto med bližnjo in oddaljeno razdaljo od kamere.

![Nizka kamera za hribom, z izklopljeno (levo) in vklopljeno (desno) možnostjo Skrij za terenom](../assets/img/en/depth-and-culling-terrain.webp)

![Izločanje po razdalji z Daleč pri 400 m in vklopljenim Reži tudi nivo: rezina zemljevida okoli kamere](../assets/img/en/depth-and-culling-far.webp)

Brez globine je toplotna karta nad 3D [ravnjo](levels.md) ploska prekrivna plast: vse, kar vsebuje nabor podatkov, sveti skozi vsak zid s polno močjo, globinski znaki, ki jih raven ponuja, se izničijo, vroča točka v stavbi pa izgleda enako kot tista na strehi. Razdelek **Globina** poskrbi, da raven skrije, kar je za njo; **Izločanje po razdalji** omeji toploto na lupino ali ploščo okoli kamere; [Rezina](slice.md) izreže ploščo iz sveta. Vse tri veljajo za načine toplote in spreminjajo, katere vrstice prispevajo. Zato jih spremembe ponovno zaženejo kopičenje.

## Globina {#depth}

Obe nastavitvi potrebujeta [ravnjo](levels.md) – sliko zemljevida ali 3D model. Brez naložene ravni ni ničesar, kar bi bilo za čim, in nastavitvi nič ne naredita. Obe sta izklopljeni, kadar je vklopljeno [Poravnaj na ravnino tal](sprite-shape.md#flatten-onto-ground-plane).

### Skrij za terenom {#hide-behind-terrain}

**Skrij za terenom** (privzeto vklopljeno): podatkovna točka, katere najbližja površina proti kameri je *tla* (ne stavba), se povsem izloči, ne zatemni se.

Teren in zidovi so neprozorni na različne načine. Namenoma gledate *skozi* zid, da vidite, na katerem nadstropju je bil promet; nikoli pa ne želite gledati skozi hrib, ker je za njim drugi del zemljevida – ki je na zemljevidu, širokem kilometre, večina podatkov in se ob obzorju sešteje v pas, svetlejši od vsega v ospredju. En zatemnilnik ne more služiti obema, zato dobi teren mejo, zidovi pa ohranijo zatemnilnik spodaj.

### Skrito za geometrijo {#hidden-behind-geometry}

**Skrito za geometrijo** (privzeto 0,8): kako močno se zatemni podatkovna točka za geometrijo ravni. Vrednost 0 pomeni *prosojno*, vmes *N % temneje* (položaj drsnika, ne izmerjeno zatemnjevanje), 1 pa *popolnoma skrito*.

Vsak zid ali tla med točko in kamero jo dodatno zatemnijo: en zid pri privzeti nastavitvi pusti nekaj odstotkov, vsaka dodatna površina prepolovi, kar je ostalo, do največ štirih površin. Pri 1 se nič za geometrijo ne nariše, to je najcenejša nastavitev.

Glejte tudi [Videz ravni](level-appearance.md).

## Izločanje po razdalji {#distance-culling}

**Izločanje po razdalji** (privzeto zaprto) omeji toploto na vrstice med bližnjo in oddaljeno mejo od kamere. Nastavite oddaljeno mejo, če želite prebrati gostoto v stavbi, ne da bi se na njo seštela oddaljena stran zemljevida; nastavite bližnjo mejo, če želite leteti *skozi* vročo točko, ne vanjo.

| Nastavitev | Privzeto | Obseg (drsnik) | Pomen |
|---|---|---|---|
| **Blizu** | izklopljeno | 0,5–5000 m, logaritemsko; spodnjih 5 % proge = izklopljeno (200.000) | Vrstice, ki so bližje od tega, se preskočijo. |
| **Daleč** | izklopljeno | 1–200.000 m, logaritemsko; spodaj = izklopljeno (10.000.000) | Vrstice, ki so dlje od tega, se preskočijo. |
| **Reži z ravnino** | vklopljeno | | Meje merimo vzdolž osi pogleda namesto od oči, tako da je rez ravnina, vzporedna z zaslonom, ne krogla okoli vas. Rob krogle se po kadru ukrivi stran in zdrsne, kadar se obrnete; ravnina ostane tam, kamor ste jo postavili. |
| **Reži tudi nivo** | vklopljeno | | Teren, stavbe in vodo izreže pri istih mejah. Če ostane raven cela, rez odstrani podatkovne točke in stavba stoji pred njimi; če sta oba izrezana, je to prerez skozi zemljevid in točke so ob svojih zidovih in tleh. To le preriše zaslon; kopičenja ne zažene znova. |

### Tipkovnica {#keyboard}

Daljno mejo nastavljate z gibom – premaknete jo skozi stavbo in opazujete, na katerem nadstropju se pojavi promet – zato je med letenjem na tipkovnici ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tipka | Učinek |
|---|---|
| `]` | Potisne daljno mejo navzven za faktor 1,12 (Shift: 1,35) |
| `[` | Potegne jo navznoter za isti faktor |
| `\` | Izklopi daljno mejo ali jo ponovno vklopi na razdalji, kjer je bila izklopljena (prvič 6000) |

Koraki so geometrijski, ker uporabno območje obsega štiri velikostne rede, od sobe do zemljevida. Tipkovnica drži daljno mejo med 100 in 400.000. Tipke nič ne naredijo, medtem ko ima polje za besedilo ali meni fokus.

## Za razvijalce {#for-developers}

### Skrij za terenom {#hide-behind-terrain}

Strukture se narišejo v lastno teksturo globine. Fragment, ki je za globino prizora, vendar *ni* za globino struktur, je za tlemi in se zavrže. To stane en prehod globine čez strukture, ki se preskoči, kadar je stikalo izklopljeno.

### Skrito za geometrijo {#hidden-behind-geometry}

Šteje se **na površino**. Ena primerjava globine lahko pove le »nekaj je spredaj«, zato bi točka za enim zidom in točka štiri sobe globoko v stavbi zatemnili enako in notranjost bi izgledala kot ena bleda lisa. Zato se geometrija strukture **globinsko lupi** do največ 3 dodatnih plasti ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Vsak fragment prešteje, koliko površin je pred njim (globina prizora in lupljene plasti: največ štiri), zatemnitev pa se sestavlja:

```
moč           = 1 - (1 - drsnik)²                  (drsnik 1 → 1)
vidnost       = (1 - moč) × 0,5 ^ (površine - 1)
vidnost       = max(vidnost, 0,006)                (brez spodnje meje pri drsniku 1)
```

| Drsnik | 1 površina | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (privzeto) | 4 % | 2 % | 1 % | 0,6 % (meja) |
| 1,0 | ni narisano | ni narisano | ni narisano | ni narisano |

Zakaj dva faktorja: drsnik je umerjen tako, da en zid pusti nekaj odstotkov – videz, ki se bere kot »za nečim« – in nekaj odstotkov, zloženih skupaj, bi pri tretjem zidu pomenilo nič; prepolovitev za vsako dodatno površino ohrani štiri razločljive stopnje. Zakaj kvadrat: linearno je nasičeno polje za zidom ostalo nasičeno; četrta potenca je pri 0,8 vse izbrisala. Zakaj meja: če bi skrito toploto popolnoma skrili, bi soba, polna skritega prometa, izgledala kot prazna soba, brez namiga, da bi segli po [Rezini](slice.md). Samo drsnik, pripet na 1, jo skrije povsem – in je najcenejša nastavitev, ker se skrite točke zavržejo.

Kako ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), senčilniki toplotnih točk): primerjava se opravi na fragment, proti teksturi globine prizora, v **globini okna**, ne v svetovni razdalji. Pridobivanje teksture globine v stopnji vozlišč na nekaterih gonilnikih vrne »daleč« povsod (med njimi rasterizator ANGLE v programski izvedbi), pretvorba obeh globin v metre pa pri širokem obsegu bližina/daljava izgubi ločljivost zaradi natančnosti. Odmik je en polmer sprajta, pretvorjen v enote okna, plus nekaj najmanj pomembnih bitov, tako da točka, ki leži na površini, ne zasenči sama sebe.

Strukture so narisane prosojno, vendar se narišejo v globino, ki jo bere zakrivanje; raven, katere strukture ne bi dosegle teksture globine, bi zakrivala samo proti terenu.

### Izločanje po razdalji {#distance-culling}

Obe meji se ovrednotita v senčilniku vozlišč, zato izločena vrstica stane eno vozlišče in nobenega fragmenta.
