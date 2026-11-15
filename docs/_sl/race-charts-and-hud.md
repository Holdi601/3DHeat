---
title: "Grafi in HUD"
parent: "Analiza dirke"
nav_order: 53
lang: "sl"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafi in HUD

Grafi poravnajo vaše kroge meter za metrom, da lahko vidite, kje je en voznik zaviral pozneje ali prej odvzel plin. Kartice v zgornjem levem kotu pogleda kažejo, kaj počne vsak avto in voznik prav zdaj.

![Grafi pod pogledom: vrstice zaostanka, hitrosti, plina, zavore in krmiljenja za dva kroga, traki časa in vzroka zgoraj ter kazalec s karticami](../assets/img/en/race-charts-rows.webp)

## Grafi {#the-charts}

Vsak krog na eni osi razdalje - metri vzdolž reference (glejte [ena os razdalje](race-corner-analysis.md#one-distance-axis)) - tako je isti x isto mesto na progi za vsak krog. En krog je narisan sam (in se predvaja); drugi krog iste proge je narisan glede na njega. Če ni naloženih krogov (ali je analiza odpovedala), območje pravi: „Grafi se prikažejo, ko je naložen krog; naložite še enega iz iste proge, da primerjate oba.”

### Kaj je na njih {#what-is-on-them}

- **Legenda**: barva in oznaka vsakega narisanega kroga, referenca označena z „(referenca)”; „+N več narisanih, ni v grafu”, kadar je vidnih več krogov, kot jih je v grafu; **Grafi (N) ▾**; **Cel krog** med povečavo; enovrstični namig.
- **Dva traku** zgoraj, za osredotočen krog:
  - *čas*: [časovni zemljevid](race-replay-and-scene.md#time-map-where) kot trak, rdeča pri izgubi, zelena pri pridobitvi;
  - *vzrok*: vsaka njegova izguba kot stolpec nad mestom njenega vzroka, v barvi vzroka; nad stolpcem se prikažeta njegov naslov in strošek.
- **Pasovi ovinkov**: senčen pas od vstopa do izhoda vsakega ovinka (kot je najden na referenci) in njegovo ime (`T1` …) pod osjo na vrhu.
- **Izbrana ugotovitev**: pas v barvi vzroka nad njenim razponom.
- **Vrstice** (grafi), po ena za vsak izbrani kanal, vsaka z imenom in zgornjo ter spodnjo mejo razpona na levi, z ničelno črto tam, kjer razpon seka nič. Vsak krog je črta v svoji barvi: osredotočen krog je 2 px širok in neprozoren, referenca neprozorna, ostali 1,5 px pri 75 %. Vrstica zaostanka izpusti referenco (sama s seboj je nič).
- **Kazalec**: navpična črta tam, kjer je referenčni avto (ali kjer je kazalec miške), in pika za vsak avto v vsaki vrstici razen zaostanka - pri kazalcu je vsak avto na istem metru; sicer je razdalja vsakega avtomobila na svoji uri predvajanja.

Narisanih je največ **8** krogov: osredotočen krog, najboljši v svojem razredu in referenca najprej, nato ostali po vrstnem redu nalaganja.

### Vrstice in njihove višine {#rows-and-their-heights}

Vrstice si delijo višino grafa glede na utež, nobena manj kot 16 px:

| Vrstica | Utež |
|---|---|
| Zaostanek (do reference, sekunde, s predznakom) | 1,7 |
| Hitrost (km/h) | 1,7 |
| pedalka (plin, zavora, sklopka) | 1 |
| krmiljenje | 1,1 |
| prestava | 0,8 |
| lučka (ročna zavora, ABS ...) | 0,55 |
| vse drugo | 1 |

Kanal z določenim prikaznim razponom v tabeli (pedalke 0-100 %) ga uporabi; ostali se prilagodijo vidnemu delu krogov. Ime vrstice, ki je za prostor predolgo (dolga beseda v drugem jeziku), premakne zgornjo vrednost za vrstico nižje, kjer je vrstica dovolj visoka, in se kjer ni, skrajša z tremi pikami; polno ime je v nasvetu ob kazalcu.

### Privzeti grafi {#the-default-graphs}

Dokler grafi niso izbrani: **zaostanek**, nato vsak kanal, ki ga tabela označi z `graph` in ga krogi imajo - plin, zavora, sklopka, ročna zavora, krmiljenje, prestava, hitrost - razen da pedalka ali lučka ni izpuščena, če se je kateri krog ne premakne nad 0,02 (sklopka, ki se nikoli ne pritisne, ni graf). Vrstni red je iz tabele.

### Izbirnik grafov {#the-graph-picker}

**Grafi (N) ▾** odpre okno nad gumbom:

- polje za filtriranje (ujema ime ali ID kanala);
- **Privzeto** (nazaj na privzeti nabor; nasvet pove, koliko jih je) in **Zapri**;
- *Zaostanek do reference*, nato vsak kanal, ki ga nesejo narisani krogi, razvrščen v skupine (gibanje, vnosi, motor, pomagala, pnevmatike, zavore, vzmetenje, kolesa, drugo, čas, položaj), z potrditvenim poljem vsakega; kanal za vsako kolo je ena vrstica s čipom za vsako kolo (FL, FR, RL, RR).

Označevanje ohrani vrstni red iz tabele, ne glede na vrstni red označevanja. Izbira velja do **Privzeto** ali ponovnega nalaganja. Kanali, ki jih tabela ne pozna, so ponujeni pod *drugo* in poimenovani po svojem ID-ju („brakeLinePress” → „Brake line press”).

### Premik, kolesce, povečava, klik {#hover-wheel-zoom-click}

| Vnos | Naredi |
|---|---|
| premik | vsak avto, njegova kartica in njegovi vnosi se premaknejo na ta meter; drog ga označi na progi; tabela našteje vrednost vsakega narisanega kroga v vsaki vrstici tam (zaostanek je prikazan kot „ref” za referenco); nad karticami „na N m - kazalec grafov”. Premik izven ploskve vrne kontrolo predvajanju |
| kolesce | pomakne predvajanje po krogu za 1/200 vidnega razpona na zarezo (Shift: 5×) in ustavi predvajanje; pri povečavi pogled sledi kazalcu |
| Ctrl+kolesce (Cmd+kolesce) | povečuje os razdalje okoli kazalca, 1,25× ven / 0,8× noter na zarezo, nikoli ožje od 40 m; oddaljitev na cel krog konča povečavo |
| stransko kolesce | pomika med povečavo (10 % razpona na 100 enot pomika) |
| dvojni klik, **Cel krog** | oddalji |
| klik | preskoči predvajanje tja, kjer referenca doseže ta meter |
| Shift+klik | tam poravna avte (glejte [poravnavo](race-replay-and-scene.md#lining-up)) |

Grafi se ob spremembi jezika narišejo v trenutnem jeziku.

Namigovalna vrstica v legendi pove isto na kratko: „Premik: vsi avti tam · kolesce: korak po krogu · Ctrl+kolesce: povečava · klik: skok · Shift+klik: poravnaj”.

## Kartice avtomobilov (HUD) {#the-car-cards-hud}

Zgoraj levo v pogledu je kartica za vsak viden krog - največ **6**, prvih šest vidnih krogov po vrstnem redu nalaganja - za trenutek, kjer je predvajanje (ali kazalec grafov).

**Glava:** barva in oznaka kroga; živi zaostanek - čas tega kroga, da doseže svojo trenutno razdaljo, minus čas reference, da doseže isto razdaljo, „+0,48 s” - ali „referenca”; **⋯** pokaže ali skrije vse ostale vrednosti (enako kot *Vse vrednosti na karticah*). Kartica zasledovanega avta je označena.

**Avto od zgoraj:** obris karoserije v barvi kroga s puščico spredaj, štiri pnevmatike (sprednje obrnjene do 28° s krmiljenjem), vsaka obarvana glede na svojo temperaturo, z enakimi simboli kot 3D avto, narisan ravno: obroč zdrsa, palica vzmetenja, žarenje zavor, pas obrabe, palica obremenitve.

**Odčitki:** hitrost v km/h, čas samega kroga, njegova razdalja vzdolž reference.

**Vnosi:**

- volan, zasukan z vnosom krmiljenja (polni zavoj narisan kot 180°), s odstotkom pod njim;
- palica za vsako pedalko, od leve proti desni kot v škatli pedalk - sklopka, zavora, plin - vsaka s svojim odstotkom in kratkim imenom, v svoji barvi (samo pedalke, ki jih krog ima);
- prestava (R za vzvratno, N za prazen tek);
- majhna lučka za vsak vklop/izklop kanal, ki ga krog ima - ročna zavora, ABS, TC, DRS, omejevalnik v boksih, v zraku - prižgana v svoji barvi, ko je vklopljena (nad polovico razpona);
- odčitek za vsak kanal stopnje: razporeditev zavor, nastavitve ABS in TC, sunek, gorivo.

**Sled vnosov:** zadnjih **6 sekund** vsake pedalke (en pas, vsaka v svoji barvi) in krmiljenja (svoj pas, na sredini), ki se konča ob tem trenutku - kaj je voznik naredil na poti do njega. Do 160 točk.

**Vse vrednosti** (⋯ ali *Vse vrednosti na karticah*): vsaka druga skalarna vrednost, ki jo krog ima v tem trenutku, nato vsak kanal za posamezno kolo kot štiri vrednosti (FL FR RL RR), poimenovane iz tabele kanalov ali iz imena samega kanala, urejene po skupinah.

## Za razvijalce {#for-developers}

Koda: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Tabela kanalov {#the-channel-table}

`CHANNELS` v [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) je edino mesto, kjer je kanal opisan: njegova enota, ali je ena vrednost na vzorec ali ena na kolo (shranjena kot `ime.FL` …), njegova skupina, prikazni razpon, kako je narisan na avtu (`glyph`), kako se pojavi na kartici (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), ali je privzeti graf, ali skače namesto da se preliva (prestava, zastavice) in kako je prikazan (merilo, enota, decimalke). Oznake in kratka imena so sporočila v vsakem jeziku (`race.channel.<ime>.label` / `.short`).

Kanali z risanjem ali privzetim grafom:

| Kanal | Enota | Narisan kot | Privzeti graf |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedalka (zelena, rdeča, …), prikazana v % | da |
| `handbrake` | 0..1 | lučka | da |
| `steer` | -1..1, desno pozitivno | volan | da |
| `gear` | - | prestava | da |
| `speed` | m/s, prikazano km/h | - | da |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lučka | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | odčitek stopnje | - |
| `tireTemp` (na kolo) | °C, prikaz 40-130 | barva pnevmatike | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (na kolo) | kot ga skalira igra, prikaz ±1,5 | obroč zdrsa | - |
| `combinedSlip`, `slipIndex` (na kolo) | prikaz 0-1,5, 0-1 | obroč zdrsa | - |
| `suspension` (na kolo) | 0..1 | palica vzmetenja | - |
| `brakeTemp` (na kolo) | °C, prikaz 100-900 | žarenje zavore | - |
| `tireWear` (na kolo) | 0..1 | pas obrabe | - |
| `wheelLoad` (na kolo) | N, prikaz 0-12 000 | palica obremenitve | - |

Ostali v tabeli (v grafu in na seznamu, ne risani): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (kot zdrsa), `loose`, `lateral` (odmik od reference),
`rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, ter `time`, `distance`, `x`, `y`, `z`.

**Kanal, ki ni v tabeli,** se še vedno prebere, nariše v grafu (pod *drugo*) in našteje na karticah, oznako pa dobi iz svojega imena. **Če mu želite dati pravo ime, enoto in risbo**, dodajte en vnos v tabelo (in njegovo oznako kot sporočilo v vsako `src/i18n/locales/<jezik>/race-channels.json`). Nova *vrsta* risbe kolesa je en vnos v `WHEEL_GLYPHS` (glyph.ts) in njegov ploski dvojnik `CARD_GLYPHS` (RaceHud.tsx); obe sta tipizirani po vrsti, zato gradnja ne uspe, dokler ne obstajata obe. `src/race/extensible.test.ts` preveri, da nepoznani kanali pridejo do grafov, da se da vsak simbol iz tabele narisati in da lučke svetijo.
