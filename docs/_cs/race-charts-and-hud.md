---
title: "Grafy a HUD"
parent: "Analýza závodu"
nav_order: 53
lang: "cs"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafy a HUD

Grafy srovnávají vaše kola metr po metru, takže vidíte, kde jeden řidič brzdil později nebo ubral dříve. Karty vlevo nahoře ve výhledu ukazují, co právě dělá každý vůz a řidič.

![Grafy pod pohledem: řádky rozdílu, rychlosti, plynu, brzdy a řízení pro dvě kola, pruhy času a příčiny nahoře a kurzor s kartami](../assets/img/en/race-charts-rows.webp)

## Grafy {#the-charts}

Všechna kola jsou na jedné ose vzdálenosti – metry podél reference (viz [jedna osa vzdálenosti](race-corner-analysis.md#one-distance-axis)) – takže stejné x je pro každé kolo na trati stejné místo. Jedno kolo se zobrazí samo (a přehrává se); druhé kolo téže trati se zobrazí proti němu. Když nejsou načtena žádná kola (nebo analýza selhala), oblast říká: „Grafy se zobrazí po načtení kola; načtěte další kolo téže trati, abyste je porovnali.“

### Co na nich je {#what-is-on-them}

- **Legenda**: barva a označení každého zobrazeného kola, referenční kolo označeno „(reference)“; „+N dalších vykresleno, bez grafu“, když je viditelných více kol, než se zobrazuje v grafu; **Grafy (N) ▾**; **Celé kolo** při přiblížení; jeden řádek nápovědy.
- **Dva pruhy** nahoře, pro zaostřené kolo:
  - *čas*: [mapa času](race-replay-and-scene.md#time-map-where) jako pruh, červeně ztráta, zeleně zisk;
  - *příčina*: každá jeho ztráta jako sloupec nad místem, kde je její příčina, v barvě příčiny; najetí na sloupec ukáže jeho název a cenu.
- **Pásy zatáček**: stínovaný pás od vjezdu do zatáčky po výjezd (jak je nalezen na referenci) a její název (`T1` …) pod osou u vrcholu.
- **Vybraný nález**: pás v jeho barvě příčiny nad jeho rozsahem.
- **Řádky** (grafy), jeden pro každý zvolený kanál, každý s názvem a horní a spodní hodnotou rozsahu vlevo; nulová čára tam, kde rozsah prochází nulou. Každé kolo je čára ve své barvě: zaostřené kolo 2 px široké a neprůhledné, referenční neprůhledné, ostatní 1,5 px na 75 %. Řádek rozdílu referenci vynechává (je vůči sobě nulový).
- **Kurzor**: svislá čára tam, kde je referenční vůz (nebo kde je ukazatel), a tečka pro každý vůz na každém řádku kromě rozdílu – u kurzoru je každý vůz na stejném metru; jinak je to vzdálenost každého vozu podle hodin přehrávání.

Zobrazí se nejvýš **8** kol: zaostřené kolo, nejlepší ze své třídy a reference jako první, pak ostatní v pořadí načtení.

### Řádky a jejich výšky {#rows-and-their-heights}

Řádky sdílejí výšku grafu podle váhy, žádný není nižší než 16 px:

| Řádek | Váha |
|---|---|
| Rozdíl (vůči referenci, sekundy, se znaménkem) | 1,7 |
| Rychlost (km/h) | 1,7 |
| jeden pedál (plyn, brzda, spojka) | 1 |
| řízení | 1,1 |
| převodový stupeň | 0,8 |
| kontrolka (ruční brzda, ABS …) | 0,55 |
| cokoli jiného | 1 |

Kanál s pevným rozsahem zobrazení v tabulce (pedály 0–100 %) jej použije; ostatní se přizpůsobí viditelnému úseku kol. Název řádku, který je na daný prostor příliš dlouhý (dlouhé slovo v jiném jazyce), posune horní hodnotu o řádek níž, kde je řádek dost vysoký, a kde není, se zkrátí s tečkami; celý název je v popisku.

### Výchozí grafy {#the-default-graphs}

Dokud nejsou grafy vybrány: **rozdíl**, pak každý kanál, který tabulka označí jako `graph` a který kola mají – plyn, brzda, spojka, ruční brzda, řízení, převodový stupeň, rychlost – kromě pedálu nebo kontrolky, které se vynechají, pokud je nějaké kolo nepohne přes 0,02 (spojka, která se nikdy nemačká, není graf). Pořadí je podle tabulky.

### Výběr grafů {#the-graph-picker}

**Grafy (N) ▾** otevře panel nad tlačítkem:

- pole filtru (hledá podle názvu nebo id kanálu);
- **Výchozí** (návrat na výchozí sadu; jeho popisek říká, kolik jich je) a **Zavřít**;
- *Rozdíl vůči referenci*, pak každý kanál, který zobrazená kola mají, seskupený (pohyb, vstupy, motor, pomocníci, pneumatiky, brzdy, odpružení, kola, ostatní, časování, pozice), s políčkem u každého; kanál pro jednotlivá kola je jeden řádek s čipem pro každé kolo (FL, FR, RL, RR).

Zaškrtnutí zachová pořadí tabulky, bez ohledu na pořadí zaškrtávání. Výběr platí, dokud nestisknete **Výchozí** nebo nenačtete znovu. Kanály, které tabulka nezná, se nabízejí pod *ostatní* a pojmenují se podle svého id („brakeLinePress“ → „Brake line press“).

### Najetí, kolečko, přiblížení, klik {#hover-wheel-zoom-click}

| Vstup | Co dělá |
|---|---|
| najetí | každý vůz, jeho karta a vstupy se přesunou na ten metr; sloupek to označí na trati; tabulka vypíše hodnotu každého zobrazeného kola na každém řádku v tom místě (rozdíl se u reference ukáže jako „ref“); nad kartami „v N m – kurzor grafů“. Když myš odjede z plochy grafu, řízení se vrátí k přehrávání |
| kolečko | posune přehrávání po kole o 1/200 viditelného rozsahu na zářez (Shift: 5×) a přehrávání zastaví; při přiblížení pohled sleduje kurzor |
| Ctrl+kolečko (Cmd+kolečko) | přibližuje osu vzdálenosti kolem ukazatele, 1,25× pryč / 0,8× k sobě na zářez, nikdy užší než 40 m; oddálení na celé kolo přiblížení ukončí |
| kolečko do strany | posouvá při přiblížení (10 % rozsahu na 100 jednotek posunu) |
| dvojklik, **Celé kolo** | oddálení |
| klik | přeskočí přehrávání tam, kam referenční vůz na ten metr dojede |
| Shift+klik | srovná vozy na tom místě (viz [srovnání](race-replay-and-scene.md#lining-up)) |

Grafy se při změně jazyka překreslí v aktuálním jazyce.

Řádek nápovědy v legendě říká totéž stručně: „Najetí: všechny vozy tam · kolečko: krok po kole · Ctrl+kolečko: přiblížení · klik: skok · Shift+klik: srovnání“.

## Karty vozů (HUD) {#the-car-cards-hud}

Vlevo nahoře ve výhledu je karta pro každé viditelné kolo – nejvýš **6**, prvních šest viditelných kol v pořadí načtení – pro okamžik, kde je přehrávání (nebo kurzor grafů).

**Hlavička:** barva a označení kola; živý rozdíl – čas tohoto kola k dosažení jeho aktuální vzdálenosti minus čas reference k dosažení téže vzdálenosti, „+0,48 s“ – nebo „reference“; **⋯** ukáže nebo skryje všechny ostatní hodnoty (stejné jako *Všechny hodnoty na kartách*). Karta pronásledovaného vozu je zvýrazněna.

**Vůz shora:** obrys karoserie v barvě kola se šipkou vpředu, čtyři pneumatiky (přední natočené až o 28° podle řízení), každá obarvená podle své teploty, se stejnými značkami jako 3D vůz nakreslený naplocho: prstenec prokluzu, tyč odpružení, žár brzdy, pás opotřebení, pruh zatížení.

**Údaje:** rychlost v km/h, vlastní čas kola, jeho vzdálenost podél reference.

**Vstupy:**

- volant natočený podle vstupu řízení (plný zámek se kreslí jako 180°) s procenty pod ním;
- sloupek pro každý pedál, zleva doprava jako v pedálnici – spojka, brzda, plyn – každý s procenty a krátkým názvem, v jeho barvě (jen pedály, které kolo má);
- převodový stupeň (R pro zpátečku, N pro neutrál);
- malá kontrolka pro každý zapnuto/vypnuto kanál, který kolo má – ruční brzda, ABS, TC, DRS, limiter boxů, ve vzduchu – svítí ve své barvě, když je zapnutá (nad polovinou svého rozsahu);
- údaj pro každý úrovňový kanál: rozdělení brzd, nastavení ABS a TC, přeplňování, palivo.

**Stopa vstupů:** posledních **6 sekund** každého pedálu (jeden pruh, každý ve své barvě) a řízení (vlastní pruh, uprostřed), končící v tomto okamžiku – co řidič dělal, než se do něj dostal. Až 160 bodů.

**Všechny hodnoty** (⋯ nebo *Všechny hodnoty na kartách*): každá další skalární hodnota, kterou kolo v tomto okamžiku má, pak každý kanál pro jednotlivá kola jako čtyři hodnoty (FL FR RL RR), pojmenované z tabulky kanálů nebo z vlastního názvu kanálu, seřazené podle skupiny.

## Pro vývojáře {#for-developers}

Kód: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Tabulka kanálů {#the-channel-table}

`CHANNELS` v [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
je jediné místo, kde se kanál popisuje: jeho jednotka, zda je to jedna hodnota na vzorek, nebo jedna na kolo (ukládá se jako `name.FL` …), jeho skupina, rozsah zobrazení, jak se kreslí na voze (`glyph`), jak se objeví na kartě (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), zda je výchozím grafem, zda se mění skokově, a ne plynule (převodový stupeň, příznaky), a jak se zobrazuje (měřítko, jednotka, číslice). Popisky a krátké názvy jsou zprávy v každém jazyce (`race.channel.<name>.label` / `.short`).

Kanály s kreslením nebo výchozím grafem:

| Kanál | Jednotka | Kresleno jako | Výchozí graf |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedál (zelený, červený, …), zobrazeno v % | ano |
| `handbrake` | 0..1 | kontrolka | ano |
| `steer` | -1..1, doprava kladné | volant | ano |
| `gear` | - | převodový stupeň | ano |
| `speed` | m/s, zobrazeno km/h | - | ano |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | kontrolka | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | údaj úrovně | - |
| `tireTemp` (na kolo) | °C, zobrazení 40–130 | barva pneumatiky | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (na kolo) | jak je hra měřítkuje, zobrazení ±1,5 | prstenec prokluzu | - |
| `combinedSlip`, `slipIndex` (na kolo) | zobrazení 0–1,5, 0–1 | prstenec prokluzu | - |
| `suspension` (na kolo) | 0..1 | tyč odpružení | - |
| `brakeTemp` (na kolo) | °C, zobrazení 100–900 | žár brzdy | - |
| `tireWear` (na kolo) | 0..1 | pás opotřebení | - |
| `wheelLoad` (na kolo) | N, zobrazení 0–12 000 | pruh zatížení | - |

Ostatní v tabulce (v grafu a v seznamu, nekreslí se): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (úhel driftu), `loose`, `lateral` (odchylka od
reference), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, a dále `time`, `distance`, `x`, `y`, `z`.

**Kanál, který není v tabulce,** se přesto načte, zobrazí v grafu (pod *ostatní*) a vypíše na kartách, pojmenovaný podle vlastního názvu. **Aby dostal řádné jméno, jednotku a kreslení**, přidejte jedno položku do tabulky (a její zprávu s popiskem do každého `src/i18n/locales/<jazyk>/race-channels.json`). Nový *druh* kreslení kola je jedna položka v `WHEEL_GLYPHS` (glyph.ts) a její plochý protějšek `CARD_GLYPHS` (RaceHud.tsx); oba jsou typované podle druhu, takže sestavení selže, dokud nebudou existovat oba. `src/race/extensible.test.ts` ověřuje, že neznámé kanály se dostanou do grafů, že každý glyf v tabulce lze nakreslit a že kontrolky svítí.
