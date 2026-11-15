---
title: "Mapovanie stĺpcov"
parent: "Ako dostať dáta dnu"
nav_order: 2
lang: "sk"
source: "column-mapping.md"
source_hash: "9d5e1f5e0c62"
translated: true
outdated: false
---

# Mapovanie stĺpcov

Súbor je tabuľka a 3DHeat musí vedieť, ktorý stĺpec drží pozíciu východ-západ, ktorý čas, ktorý meno hráča a tak ďalej. Tento panel
ukazuje, čo odhadol, a tu opravíte zlý odhad.

![Panel Mapovanie stĺpcov po načítaní súboru Parquet: každé políčko je už vyplnené - 1 X, 2 Y, 3 Z, 4 Čas, 5 ID osoby, 6 Relácia / zápas, 7 Tím / skupina](../assets/img/en/column-mapping-panel.webp)

*Súbor pomenoval svoje stĺpce sám, takže každé políčko je už vyplnené.*

Napríklad CSV s hlavičkou `x,y,z,t,player,team` sa mapuje samo: x, y a z sa stanú pozíciou, `t` časom, `player`
[osobou](glossary.md) a `team` [skupinou](glossary.md).

Po výbere súborov sa pod panelom Zdroj otvorí panel **Mapovanie stĺpcov**. Hovorí, ktorý stĺpec hrá ktorú úlohu. Vypĺňa sa automaticky
a každé pole sa dá zmeniť pred stlačením **Načítať**; mapovanie sa číta pri načítaní, takže zmena neskôr znamená načítať znova.

## Polia {#the-fields}

Všetky ponuky stĺpcov vypisujú každý stĺpec prvého súboru, plus *- žiadny -*.

| Pole | Úloha | Poznámky |
|---|---|---|
| **Oddeľovač** | Len CSV: oddeľovač polí. | Ponuka: *Čiarka ,*, *Bodkočiarka ;*, *Tabulátor*, *Zvislá čiara \|*, *Medzera*; alebo napíšte ľubovoľný jeden znak do *alebo napíšte jeden znak*. Zisťuje sa automaticky (pozri nižšie). Zmena znova spustí automatické mapovanie, takže úpravy urobené predtým sa stratia. |
| **X**, **Y**, **Z** | Pozícia. | Potrebné sú aspoň dve; nenamapovaná tretia os je 0 (dáta ležia v rovine). Ten istý stĺpec na dvoch osiach je chyba. |
| **Os nahor v zdroji** | Ktorá zdrojová os smeruje nahor. | *Z je nahor (väčšina herných motorov)* alebo *Y je nahor (grafická konvencia)*. Pozri [Osi, jednotky a čas](axes-units-and-time.md). |
| **Mierka jednotiek** | Násobí každú pozíciu. | Tlačidlá *1 (m)* a *0,01 (cm→m)*, alebo napíšte hodnotu. |
| **Otočiť X / Otočiť Y / Otočiť Z** | Zneguje zdrojovú os. | Použije sa na pozície a na vektory smeru pohľadu. |
| **Čas** | Časová os. | Voliteľné. Bez nej nie je časová os. |
| **Jednotka času** | Ako čítať stĺpec času. | Sedem jednotiek; pozri [Osi, jednotky a čas](axes-units-and-time.md#time). Ignoruje sa pri stĺpcoch Parquet `TIMESTAMP`/`DATE`, na čo panel upozorní. |
| **ID osoby** | Ku komu alebo k čomu riadok patrí. | Voliteľné. Umožňuje stopy, životnosti, box replay a čiarové teplo. |
| **Relácia / zápas** | K akému zápasu, nájazdu, kolu, behu alebo okruhu riadok patrí. | Voliteľné. Pozície sa nikdy neinterpolujú, neťahajú za sebou ani nespájajú do trasy cez zmenu relácie. Pozri [Relácie, osoby a skupiny](sessions-persons-groups.md). |
| **Tím / skupina** | Ľubovoľný stĺpec s malým počtom hodnôt. | Voliteľné. Riadi farby skupín, teplo tímov a rozdelenie rozdielu podľa skupiny. |
| **Smer pohľadu** | *Žiadny*, *Stĺpce otočenia / sklonu* alebo *Stĺpce vektora smeru*. | S otočením/sklonom: **Otočenie**, **Sklon** a **Jednotka uhla** (*Stupne* / *Radiány*). S vektorom: **Smer X**, **Smer Y**, **Smer Z**. Používa sa pre lúče pohľadu [box replay](box-replay.md). |
| **Ponechať na filtrovanie** | Ďalšie stĺpce ponechané v pamäti. | Začiarkavacie políčko pri každom stĺpci a pri každom zaškrtnutom *rozsah* (číselný) alebo *kategória*. Každý stojí 4 bajty na riadok a jeden prechod dekódovania pri načítaní. Len ponechané stĺpce sa dajú [filtrovať](filters.md), použiť na [rozdelenie rozdielu](difference.md) alebo ako stĺpec udalostí [čiarového tepla](line-heat.md). |
| **Zobraziť ukážkové riadky** | Tabuľka prvých 12 vzorkovaných riadkov, všetky stĺpce. | Na kontrolu odhadov. |

Zaškrtnutý stĺpec filtra, ktorý nie je nastavený výslovne, sa číta ako *rozsah*; stĺpec ID, ktorý vyzerá číselne, je často užitočnejší ako *kategória*.
Naraz môže byť aktívnych len 4 filtre ([Filtre](filters.md)).

## Ako automatické mapovanie odhaduje {#how-the-auto-mapping-guesses}

Odhadovanie je v [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Pozerá sa na názvy stĺpcov, na to, ktoré stĺpce
sú číselné vo vzorkovaných riadkoch (viac ako 90 % neprázdnych hodnôt sa dá prečítať ako čísla), na to, koľko rôznych hodnôt každý stĺpec má vo vzorke,
a na logické typy Parquet. Vzory názvov sa skúšajú v poradí, bez ohľadu na veľkosť písmen, a vyhrá prvý vzor, ktorý sedí na niektorom ešte voľnom stĺpci.

### Pozícia {#position}

| Os | Vzory názvov v poradí (len číselné stĺpce) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Ak je os stále prázdna, prvé voľné číselné stĺpce (ignorujú sa `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) ju postupne doplnia.
Zlý odhad je na obrazovke zrejmý; prázdny by zanechal prázdny výhľad.

### Čas {#time}

- **Najprv stĺpce časovej pečiatky Parquet.** Medzi stĺpcami, ktorých logický typ je `TIMESTAMP` alebo `DATE`, sa najlepší vyberie podľa skóre: +10 000, ak názov
  zodpovedá vzoru času, -5 000 za obyčajný `DATE`, plus počet rôznych hodnôt vo vzorke. Dátum celého dňa a konštantný začiatok relácie majú takmer žiadne rôzne hodnoty,
  takže vyhráva okamih udalosti. Jednotka je potom *Unix timestamp (ms)*.
- **Inak podľa názvu:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, potom názvy uplynulého času
  (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Jednotka sa potom odhadne z hodnôt:
  ISO-8601, keď hodnota vyzerá ako `RRRR-MM-DDT…` alebo `RRRR-MM-DD …`; inak podľa najväčšej veľkosti: nad 10^17 nanosekúnd, nad 10^14 mikrosekúnd, nad 10^11
  Unix milisekúnd, nad 10^8 Unix sekúnd, nad 10^6 milisekúnd, inak sekundy.

Keď sa vybere stĺpec uplynulého času, panel upozorní, že každá relácia je potom zarovnaná na svoj vlastný začiatok - dobré na prekrytie zápasov, nie na
sledovanie ich v skutočnom poradí.

### Relácia, osoba, skupina {#session-person-group}

Relácia sa prihlási **po** časovej osi a **pred** osobou a skupinou, lebo stĺpec relácie je často časová pečiatka (okamih začiatku zápasu na každom riadku zápasu).

| Úloha | Vzory názvov v poradí |
|---|---|
| Relácia | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (každý presne, voliteľne s `_id`) |
| Osoba | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, potom `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (dáta závodov: pohybuje sa auto) |
| Skupina | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Skupina, záložná | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result`, `event_env`, `playtest_id` |

Kandidát na skupinu, ktorý nadobúda inú hodnotu na väčšine vzorkovaných riadkov (viac ako max(48, 60 % vzorky)), je identifikátor, nie skupina: ak sa nenašiel
žiadny stĺpec osoby, stane sa stĺpcom osoby, a ako skupina sa nepoužije. Ak sa nenašiel vôbec žiadny stĺpec skupiny, použije sa nečíselný stĺpec s najmenším počtom
rôznych hodnôt medzi 2 a 12.

### Smer pohľadu {#look-direction}

Číselný stĺpec s názvom `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` alebo `rot_z` / `rotation_z` prepne smer pohľadu na otočenie/sklon; sklon sa hľadá ako `pitch`,
`…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Predpokladajú sa stupne, keď nejaké vzorkované otočenie prekročí 7 v absolútnej hodnote, inak radiány. Vektor smeru
sa nikdy neodhaduje; prichádza z nápovied nižšie alebo od vás.

### Stĺpce filtra {#filter-columns}

Automaticky sa ponechá najviac **6** stĺpcov, zoradených:

1. `region`, `sessionMode`, `actor` - stĺpce, ktoré existujú na to, aby sa podľa nich filtrovalo (skóre 1200);
2. stĺpce kategórie, ktoré vo vzorke menia hodnotu, najprv tie s menším počtom rôznych hodnôt (1000 mínus počet);
3. stĺpec konštantný vo vzorke, ale len keď sa načítava viac súborov - medzi súbormi sa môže líšiť, napríklad región alebo ID testovacieho behu (600);
4. číselné stĺpce (500).

Stĺpce, ktoré už hrajú nejakú úlohu, vyššie uvedené šumové názvy, stĺpce konštantné pri načítaní jedného súboru a textové stĺpce (viac ako max(16, polovica vzorky) rôznych hodnôt)
sa automaticky neponúkajú. Akýkoľvek stĺpec sa dá stále zaškrtnúť ručne.

### Os nahor {#up-axis}

Keď sú namapované všetky tri osi, za nahor sa vezme os s menším rozptylom Y a Z vo vzorke (mapa je oveľa širšia, než vysoká); inak sa predpokladá Z nahor.

## Nápovedy `heat3d` v pätičke Parquet {#the-heat3d-hints-in-a-parquet-footer}

Súbor Parquet môže povedať, ako sa má čítať. Ak jeho metadáta páry kľúč/hodnota v pätičke obsahujú položku s kľúčom **`heat3d`**, jej hodnota sa parsuje ako JSON
a položí sa na odhady ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Konvertor dema CS2 takú položku zapisuje, takže jeho tabuľky sa otvoria
s hráčom ako osobou, stranou ako skupinou, každým kolom ako reláciou, zapnutým smerom pohľadu a svetom v správnom smere.

Na nápovedy sa číta len **prvý** súbor výberu. Každá položka je voliteľná a každá nápoveda sa stále zobrazí v paneli a dá sa zmeniť. Úplný opis schémy s príkladom
a ako ju zapísať, je v [referencii formátov dát](data-formats.md#the-heat3d-hints).

Pravidlá stručne:

- Stĺpec pomenovaný nápovedou sa použije len vtedy, keď ho súbor má.
- `lookMode: "vector"` platí len vtedy, keď sú nastavené všetky `dirX`, `dirY` a `dirZ`; `"yawPitch"` len vtedy, keď je nastavené `yaw`.
- `extra`, keď je prítomné, nahradí automatický zoznam filtrov (neznáme názvy a stĺpce, ktoré už hrajú úlohu, sa zahodia); typ rozsah/kategória každého nasleduje, či vyzeral číselne. Keď chýba, automatický zoznam sa zachová, mínus každý stĺpec, ktorému nápoveď dala úlohu.
- `axes.up` musí byť `"y"` alebo `"z"`, prevrátenia musia byť logické hodnoty, `scale` musí byť kladný.
- `entity.size`, keď je kladné, je veľkosť jednej sledovanej veci v jednotkách súboru ([veľkosť entity](sessions-persons-groups.md#entity-size)); je to jediný spôsob, ako ju nastaviť.

## Známa chyba: prepísanie oddeľovača CSV {#known-issue-overriding-the-csv-separator}

Keď zmeníte oddeľovač na iný, než aký bol zistený, zoznam stĺpcov a ukážkové riadky sa nezmenia (náhľad stále rozdeľuje podľa zisteného oddeľovača).
Zvolený oddeľovač sa stále použije pri samotnom načítaní. Ak je zistený oddeľovač zlý:

1. Otvorte súbor v textovom editore.
2. Všade nahraďte oddeľovač čiarkou (a desatinné čiarky bodkami).
3. Uložte a potom súbor načítajte znova.

Príčina je v [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
