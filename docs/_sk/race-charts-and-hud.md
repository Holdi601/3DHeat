---
title: "Grafy a HUD"
parent: "Analýza pretekov"
nav_order: 53
lang: "sk"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafy a HUD

Grafy zarovnajú vaše kolá metre po metri, takže vidíte, kde niekto brzdil neskôr alebo odľahčil skôr.
Karty v ľavom hornom rohu pohľadu ukazujú, čo každé auto a vodič práve robí.

![Grafy pod pohľadom: riadky medzery, rýchlosti, plynu, brzdy a riadenia pre dve kolá, pásy času a príčiny hore a kurzor s kartami](../assets/img/en/race-charts-rows.webp)

## Grafy {#the-charts}

Každé kolo na jednej osi vzdialenosti - metre pozdĺž referencie (pozri
[jedna os vzdialenosti](race-corner-analysis.md#one-distance-axis)) - takže
rovnaké x je rovnaké miesto na trati pre každé kolo. Jedno kolo sa zobrazí
samo (a prehrá sa); druhé kolo tej istej trate sa zobrazí voči nemu.
Keď nie sú načítané žiadne kolá (alebo analýza zlyhala), oblasť hovorí "Grafy sa zobrazia,
keď sa načíta kolo; načítajte ďalšie z tej istej trate, aby ste porovnali tie dve."

### Čo na nich je {#what-is-on-them}

- **Legenda**: farba a označenie každého zobrazeného kola, referencia označená
  "(referencia)"; "+N ďalších nakreslených, nie v grafe", keď je viditeľných viac kôl, než
  sa zobrazuje v grafe; **Grafy (N) ▾**; **Celé kolo** pri priblížení; jeden riadok nápovedy.
- **Dva pásy** hore, pre zamerané kolo:
  - *čas*: [mapa času](race-replay-and-scene.md#time-map-where) ako pás, červená strata,
    zelený zisk;
  - *príčina*: každá jeho strata ako pruh nad miestom, kde je jej príčina, vo farbe príčiny;
    po prejdení myšou pruhom sa zobrazí jeho názov a cena.
- **Pásy zákrut**: tieňovaný pás od vstupu do každej zákruty po jej výstup (ako sa našiel na
  referencii) a jej názov (`T1` …) pod osou pri vrchole.
- **Vybrané zistenie**: pás vo farbe jeho príčiny nad jeho rozsahom.
- **Riadky** (grafy), jeden pre každý zvolený kanál, každý s jeho názvom a hornou a dolnou
  hodnotou rozsahu vľavo, nulová čiara tam, kde rozsah prechádza nulou. Každé kolo je čiara vo
  svojej farbe: zamerané kolo 2 px široké a nepriehľadné, referencia nepriehľadná, ostatné
  1,5 px na 75 %. Riadok medzery vynecháva referenciu (je voči sebe nulový).
- **Kurzor**: zvislá čiara tam, kde je referenčné auto (alebo kde je kurzor), a bodka za každé auto
  na každom riadku okrem medzery - pri kurzore je každé auto na tom istom metri; inak vlastná
  vzdialenosť každého auta pri hodinách prehrávania.

Najviac **8** kôl sa zobrazí v grafe: zamerané kolo, najlepšie vo svojej triede a referencia
ako prvé, potom ostatné v poradí načítania.

### Riadky a ich výšky {#rows-and-their-heights}

Riadky zdieľajú výšku grafu podľa váhy, žiadny nižší ako 16 px:

| Riadok | Váha |
|---|---|
| Medzera (voči referencii, sekundy, so znamienkom) | 1,7 |
| Rýchlosť (km/h) | 1,7 |
| pedál (plyn, brzda, spojka) | 1 |
| riadenie | 1,1 |
| prevodový stupeň | 0,8 |
| kontrolka (ručná brzda, ABS …) | 0,55 |
| čokoľvek iné | 1 |

Kanál s pevným zobrazovaným rozsahom v tabuľke (pedále 0-100 %) ho použije; ostatné sa
prispôsobia viditeľnej časti kôl. Názov riadka, ktorý je na dané miesto príliš dlhý (dlhé slovo
v inom jazyku), posunie hornú hodnotu o riadok nižšie, ak je riadok dosť vysoký, a na konci sa
skráti trojbodkou, ak nie je; úplný názov je v popise po prejdení myšou.

### Predvolené grafy {#the-default-graphs}

Kým nie sú grafy vybraté: **medzera**, potom každý kanál, ktorý tabuľka označuje `graph` a ktorý
kolá majú - plyn, brzda, spojka, ručná brzda, riadenie, prevodový stupeň, rýchlosť - okrem toho, že
kanál pedálu alebo kontrolky sa vynechá, pokiaľ niektoré kolo ho nepohne cez 0,02 (spojka, ktorá sa
nikdy nestlačí, nie je graf). Poradie je poradie tabuľky.

### Výber grafov {#the-graph-picker}

**Grafy (N) ▾** otvorí panel nad tlačidlom:

- pole na filter (zhoduje sa s názvom alebo identifikátorom kanála);
- **Predvolené** (späť na predvolenú sadu; popis hovorí, koľko ich je) a **Zavrieť**;
- *Medzera voči referencii*, potom každý kanál, ktorý zobrazené kolá nesú, zoskupený
  (pohyb, ovládanie, motor, pomôcky, pneumatiky, brzdy, odpruženie, kolesá, ostatné,
  časovanie, pozícia), s políčkom pri každom; kanál pre jednotlivé koleso je jeden riadok
  s čipom pre každé koleso (FL, FR, RL, RR).

Zaškrtnutie zachová poradie tabuľky bez ohľadu na poradie zaškrtávania. Výber platí, kým
nestlačíte **Predvolené** alebo neobnovíte stránku. Kanály, ktoré tabuľka nepozná, sa ponúknu
pod *ostatné*, pomenované podľa ich vlastného identifikátora ("brakeLinePress" →
"Brake line press").

### Pohyb myšou, koliesko, priblíženie, klik {#hover-wheel-zoom-click}

| Vstup | Robí |
|---|---|
| pohyb myšou | každé auto, jeho karta a jeho ovládanie sa presunú na ten meter; stĺpik ho označí na trati; tabuľka vypíše hodnotu každého zobrazeného kola na každom riadku tam (medzera ukázaná ako "ref" pre referenciu); nad kartami "pri N m - kurzor grafov". Odchod z plochy vráti na prehrávanie |
| koliesko | posunie prehrávanie po kole o 1/200 viditeľného rozsahu na zárez (Shift: 5×), pozastaví prehrávanie; pri priblížení pohľad sleduje kurzor |
| Ctrl+koliesko (Cmd+koliesko) | priblíži os vzdialenosti okolo ukazovateľa, 1,25× von / 0,8× dnu na zárez, nikdy užšie ako 40 m; oddialenie na celé kolo ukončí priblíženie |
| bočné koliesko | posúva pri priblížení (10 % rozsahu na 100 jednotiek posunu) |
| dvojklik, **Celé kolo** | oddialenie |
| klik | prehrávanie skočí tam, kde referencia dosiahne ten meter |
| Shift+klik | zarovná autá na tom mieste (pozri [zarovnanie](race-replay-and-scene.md#lining-up)) |

Grafy sa prekreslia v aktuálnom jazyku, keď sa zmení.

Riadok nápovedy v legende hovorí to isté stručne: "Pohyb: všetky autá tam · koliesko: krok po kole ·
Ctrl+koliesko: priblíženie · klik: skok · Shift+klik: zarovnať".

## Karty áut (HUD) {#the-car-cards-hud}

Vľavo hore pohľadu, karta pre každé viditeľné kolo - najviac **6**, prvých šesť viditeľných kôl
v poradí načítania - pre okamih, v ktorom je prehrávanie (alebo kurzor grafov).

**Hlavička:** farba a označenie kola; živá medzera - čas tohto kola na dosiahnutie jeho aktuálnej
vzdialenosti mínus čas referencie na dosiahnutie tej istej vzdialenosti, "+0,48 s" - alebo "referencia";
**⋯** ukáže alebo skryje každú ďalšiu hodnotu (to isté ako *Všetky hodnoty na kartách*). Karta
prenasledovaného auta je zvýraznená.

**Auto zhora:** obrys karosérie vo farbe kola so šípkou vpredu, štyri pneumatiky (predné natočené
až o 28° s riadením), každá zafarbená podľa svojej teploty, s rovnakými symbolmi ako 3D auto nakreslené
plocho: prstenec šmyku, tyčka odpruženia, žiara bŕzd, pás opotrebenia, pás zaťaženia.

**Údaje:** rýchlosť v km/h, vlastný čas kola, jeho vzdialenosť pozdĺž referencie.

**Ovládanie:**

- volant otočený vstupom riadenia (plný zdvih nakreslený ako 180°) s percentom pod ním;
- pruh pre každý pedál, zľava doprava ako v pedálovej skrini - spojka, brzda,
  plyn - každý s jeho percentom a krátkym názvom, vo svojej farbe (len pedále, ktoré kolo nesie);
- prevodový stupeň (R pre spiatočku, N pre neutrál);
- malá kontrolka pre každý kanál zap/vyp, ktorý kolo nesie - ručná brzda, ABS, TC, DRS,
  obmedzovač pri boxe, vo vzduchu - svieti vo svojej farbe, keď je zapnutý (nad polovicou svojho rozsahu);
- odčítanie pre každý kanál úrovne: rozdelenie brzdenia, nastavenie ABS a TC, pretlak, palivo.

**Stopa ovládania:** posledných **6 sekúnd** každého pedála (jeden pruh, každý vo svojej farbe)
a riadenia (vlastný pruh, vycentrovaný), končiaca v tomto okamihu - čo vodič robil na ceste dnu.
Až 160 bodov.

**Všetky hodnoty** (⋯ alebo *Všetky hodnoty na kartách*): každý ďalší skalárny údaj, ktorý kolo nesie
v tomto okamihu, potom každý kanál pre jednotlivé koleso ako štyri hodnoty (FL FR RL RR), pomenované
podľa tabuľky kanálov alebo podľa vlastného názvu kanála, zoradené podľa skupiny.

## Pre vývojárov {#for-developers}

Kód: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Tabuľka kanálov {#the-channel-table}

`CHANNELS` v [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
je jediné miesto, kde je kanál opísaný: jeho jednotka, či je to jedna hodnota na vzorku alebo jedna
na koleso (uložená ako `name.FL` …), jeho skupina, zobrazovaný rozsah, ako sa kreslí na aute (`glyph`),
ako sa objaví na karte (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), či je to predvolený graf,
či skáče namiesto prelínania (prevodový stupeň, príznaky) a ako sa zobrazuje (mierka, jednotka, číslice).
Štítky a krátke názvy sú správy v každom jazyku (`race.channel.<name>.label` / `.short`).

Kanály s kreslením alebo predvoleným grafom:

| Kanál | Jednotka | Kreslený ako | Predvolený graf |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedál (zelený, červený, …), zobrazený v % | áno |
| `handbrake` | 0..1 | kontrolka | áno |
| `steer` | -1..1, doprava kladné | volant | áno |
| `gear` | - | prevodový stupeň | áno |
| `speed` | m/s, zobrazené km/h | - | áno |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | kontrolka | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | odčítanie úrovne | - |
| `tireTemp` (na koleso) | °C, zobrazenie 40-130 | farba pneumatiky | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (na koleso) | ako ho hra škáluje, zobrazenie ±1,5 | prstenec šmyku | - |
| `combinedSlip`, `slipIndex` (na koleso) | zobrazenie 0-1,5, 0-1 | prstenec šmyku | - |
| `suspension` (na koleso) | 0..1 | tyčka odpruženia | - |
| `brakeTemp` (na koleso) | °C, zobrazenie 100-900 | žiara bŕzd | - |
| `tireWear` (na koleso) | 0..1 | pás opotrebenia | - |
| `wheelLoad` (na koleso) | N, zobrazenie 0-12 000 | pruh zaťaženia | - |

Ostatné v tabuľke (v grafe a v zozname, nekreslia sa): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (uhol driftu), `loose`, `lateral` (posun voči
referencii), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, plus `time`, `distance`, `x`, `y`, `z`.

**Kanál, ktorý nie je v tabuľke,** sa stále načíta, zobrazí v grafe (pod *ostatné*) a vypíše na kartách,
označený podľa svojho vlastného názvu. **Aby dostal riadne meno, jednotku a kreslenie**, pridajte jeden
záznam do tabuľky (a jeho správu so štítkom do každého `src/i18n/locales/<language>/race-channels.json`).
Nový *druh* kreslenia kolesa je jeden záznam v `WHEEL_GLYPHS` (glyph.ts) a jeho plochý dvojník `CARD_GLYPHS`
(RaceHud.tsx); obe sú typované podľa druhu, takže zostavenie zlyhá, kým neexistujú obe. `src/race/extensible.test.ts`
kontroluje, že neznáme kanály sa dostanú do grafov, že každý symbol v tabuľke sa dá nakresliť a že kontrolky svietia.
