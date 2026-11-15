---
title: "Gylis ir atrinkimas"
parent: "Šilumos režimai"
nav_order: 4
lang: "lt"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Gylis ir atrinkimas

Gylis verčia kalvas ir sienas slėpti šilumą už jų, kaip tikra siena slepia žmogų. Atrinkimas pagal atstumą palieka tik šilumą tarp artimo ir tolimo atstumo nuo kameros.

![Žema kamera už kalvos, su išjungta Slėpti už reljefo (kairėje) ir įjungta (dešinėje)](../assets/img/en/depth-and-culling-terrain.webp)

![Atrinkimas pagal atstumą su Tolima 400 m ir įjungta Pjauti ir lygį: kameros aplinkos žemėlapio dalis](../assets/img/en/depth-and-culling-far.webp)

Be gylio šilumos žemėlapis ant 3D [lygio](levels.md) yra plokščias sluoksnis: viskas, ką turi duomenų rinkinys, šviečia per kiekvieną sieną visu stiprumu, lygis suteikiamų gylio užuominų neutralizuojamas, o karštas taškas pastate atrodo lygiai taip pat kaip ant jo stogo. Skyrius **Gylis** priverčia lygį slėpti tai, kas yra už jo; **Atrinkimas pagal atstumą** apriboja šilumą apvalkalu ar plokšte aplink kamerą; [Pjūvis](slice.md) iškerta plokštę iš pasaulio. Visi trys taikomi šilumos režimams ir keičia tai, kurios eilutės prisideda, todėl jų keitimas iš naujo paleidžia kaupimą.

## Gylis {#depth}

Abiems valdikliams reikia [lygio](levels.md) – žemėlapio vaizdo ar 3D modelio. Jei lygis neįkeltas, nėra kas slėpti, ir jie nieko nedaro. Abu išjungiami, kol įjungta [Nuspausti į žemės plokštumą](sprite-shape.md#flatten-onto-ground-plane).

### Slėpti už reljefo {#hide-behind-terrain}

**Slėpti už reljefo** (numatyta įjungta): duomenų taškas, kurio artimiausias paviršius kameros link yra *žemė* (ne statinys), yra visiškai išmetamas, o ne tik prigesinamas.

Reljefas ir sienos yra nepermatomi skirtingai. Žiūrite *per* sieną sąmoningai, kad pamatytumėte, kuriuo aukštu judėjo eismas; niekada nenorite žiūrėti per kalvą, nes už jos yra tolimoji žemėlapio pusė – o žemėlapyje, kurio kilometrai per visą plotį, tai yra didžioji duomenų dalis, ir ji horizonte susumuojama į juostą, šviesesnę už bet ką priekyje. Vienas prigesinimas negali tenkinti abiejų, todėl reljefui taikoma riba, o sienos paliekamos prie žemiau esančio prigesinimo.

### Paslėpta už geometrijos {#hidden-behind-geometry}

**Paslėpta už geometrijos** (numatytoji 0,8): kaip stipriai slopinamas duomenų taškas, esantis už lygio geometrijos. Reikšmė reiškia *rodoma per*, kai 0, *N % tamsesnė* tarpinėse reikšmėse (slankiklio padėtis, o ne išmatuotas prigesinimas), *visiškai paslėpta*, kai 1.

Kiekviena siena ar grindys tarp taško ir kameros jį dar prigesina: viena siena numatytuoju atveju palieka kelis procentus, o kiekvienas papildomas paviršius perpus sumažina likusią dalį, iki keturių paviršių. Esant 1, nieko už geometrijos nepiešiama, ir tai pigiausias nustatymas.

Taip pat žr. [Lygio išvaizda](level-appearance.md).

## Atrinkimas pagal atstumą {#distance-culling}

**Atrinkimas pagal atstumą** (numatyta uždarytas) apriboja šilumą eilutėmis tarp artimos ir tolimos ribos nuo kameros. Nustatykite tolimąją ribą, kad matytumėte tankį pastate, nesudedant tolimosios žemėlapio pusės; nustatykite artimąją ribą, kad skristumėte *per* karštą vietą, o ne į ją.

| Valdiklis | Numatytoji | Intervalas (vilkimas) | Reikšmė |
|---|---|---|---|
| **Artima** | išjungta | 0,5–5000 m, logaritminis, apatiniai 5 % takelio = išjungta (200 000) | Eilutės, esančios arčiau, praleidžiamos. |
| **Tolima** | išjungta | 1–200 000 m, logaritminis, apačia = išjungta (10 000 000) | Eilutės, esančios toliau, praleidžiamos. |
| **Pjauti plokštuma** | įjungta | | Matuoti ribas išilgai žiūrėjimo ašies, o ne nuo akies, kad pjūvis būtų plokštuma, lygiagreti ekranui, o ne sfera aplink jus. Sferos kraštas nuo rėmo nusisuka ir slysta, kai pasukate; plokštuma lieka ten, kur ją padėjote. |
| **Pjauti ir lygį** | įjungta | | Iškirpti žemę, statinius ir vandenį tomis pačiomis ribomis. Kai lygis paliktas nepjaustytas, pjūvis pašalina duomenų taškus, o pastatas lieka stovėti prieš juos; kai pjaunama abu, tai pjūvis per žemėlapį, ir taškai remiasi į savo sienas bei grindis. Šis valdiklis tik perpiešia; kaupimo iš naujo nepaleidžia. |

### Klavišai {#keyboard}

Tolimoji riba yra valdiklis, kurį braukiate – nuvedate ją per pastatą ir stebite, kuriame aukšte atsiranda eismas – todėl ji yra ant klaviatūros, kol skrendate ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Klavišas | Poveikis |
|---|---|
| `]` | Pastumti tolimąją ribą į išorę 1,12 karto (Shift: 1,35) |
| `[` | Traukti ją į vidų tuo pačiu koeficientu |
| `\` | Išjungti tolimąją ribą arba vėl įjungti ją atstumu, kuriuo buvo palikta (pirmą kartą – 6000) |

Žingsniai yra geometriniai, nes naudingas intervalas apima keturias eiles – nuo kambario iki žemėlapio. Klaviatūra tolimąją ribą laiko tarp 100 ir 400 000. Klavišai nieko nedaro, kai fokusas yra teksto laukelyje ar meniu.

## Kūrėjams {#for-developers}

### Slėpti už reljefo {#hide-behind-terrain}

Statiniai piešiami į savo gylio tekstūrą. Fragmentas, kuris yra už scenos gylio, bet *ne* už statinių gylio, yra už žemės ir išmetamas. Tam reikia vieno gylio perėjimo per statinius; jis praleidžiamas, kai jungiklis išjungtas.

### Paslėpta už geometrijos {#hidden-behind-geometry}

Tai skaičiuojama **kiekvienam paviršiui atskirai**. Vienas gylio palyginimas gali pasakyti tik „kažkas yra priekyje“, todėl taškas už vienos sienos ir taškas keturis kambarius pastato gilumoje būtų prigesinti vienodai, o interjeras atrodytų kaip vienas silpnas dėmuo. Vietoj to statinių geometrija **nuvelkama gylyje** į iki 3 papildomų sluoksnių ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); kiekvienas fragmentas suskaičiuoja, kiek paviršių yra priekyje (scenos gylis plius nuvelkti sluoksniai: iki keturių), o prigesinimas sudėtinai didėja:

```
stiprumas     = 1 - (1 - slankiklis)²              (slankiklis 1 → 1)
matomumas     = (1 - stiprumas) × 0,5 ^ (paviršiai - 1)
matomumas     = max(matomumas, 0,006)              (ribos nėra, kai slankiklis 1)
```

| Slankiklis | 1 paviršius | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (numatytoji) | 4 % | 2 % | 1 % | 0,6 % (riba) |
| 1,0 | nepiešiama | nepiešiama | nepiešiama | nepiešiama |

Kodėl du koeficientai: slankiklis sukalibruotas taip, kad viena siena palieka kelis procentus – tai išvaizda, kuri atrodo kaip „kažkas už kažko“ – o keli procentai, sudėti sudėtinai, po trečios sienos nieko nebereikštų; perpus mažinant kiekvienam papildomam paviršiui, išlieka keturi atskiri žingsniai. Kodėl kvadratu: tiesinis paliko prisotintą lauką prisotintą už sienos; ketvirtasis laipsnis jį panaikino esant 0,8. Kodėl riba: visiškai paslėpus užslėptą šilumą, kambarys pilnas paslėpto eismo atrodytų kaip tuščias kambarys, ir nieko nepaskatintų pasiekti [Pjūvį](slice.md). Tik slankiklis, prispaustas prie 1, paslepia visiškai – ir tai pigiausias nustatymas, nes užslėpti taškai tada išmetami.

Kaip ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), taškinės šilumos šešėliuotojai): palyginimas daromas kiekvienam fragmentui su scenos gylio tekstūra **lango gylio** vienetais, o ne pasaulio atstumu. Viršūnių etapo gylio tekstūros nuskaitymas kai kuriose tvarkyklėse (tarp jų ANGLE programinis rastrizatorius) visur rodo „toli“, o abiejų gylių išlyginimas metrais su plačiu artimo / tolimo intervalu praranda atskyrimą dėl tikslumo. Poslinkis yra vieno spindulio spraitas, konvertuotas į lango vienetus, plius keli mažiausiai reikšmingi bitai, todėl taškas, gulintis ant paviršiaus, pats neužtemdo savęs.

Statiniai piešiami permatomai, bet į gylį, kurį skaito užslėpimas; lygis, kurio statiniai nepasiekė gylio tekstūros, užslėptų tik prieš reljefą.

### Atrinkimas pagal atstumą {#distance-culling}

Abi ribos įvertinamos viršūnių šešėliuotojuje, todėl atrinkta eilutė kainuoja vieną viršūnę ir jokių fragmentų.
