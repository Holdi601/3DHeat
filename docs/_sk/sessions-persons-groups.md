---
title: "Relácie, osoby a skupiny"
parent: "Ako dostať dáta dnu"
nav_order: 4
lang: "sk"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Relácie, osoby a skupiny

**Osoba** je jedna pohybujúca sa vec (hráč, auto). **Tím/skupina** je strana, ku ktorej patria. **Relácia** je jeden zápas alebo kolo.
Pozri [slovník](glossary.md).

Jeden riadok súboru môže pomenovať všetky tri:

| x | y | čas | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` je osoba, `team` je skupina, `match` je relácia.

Tri voliteľné stĺpce opisujú, *kto* a *kde v príbehu* riadok patrí. Každý sa pri načítaní zakóduje do slovníka: textové hodnoty sa stanú
malými celočíselnými ID na riadok plus jedným zoznamom označení, zdieľaným naprieč všetkými súbormi načítania.

## Osoba {#person}

Stĺpec **ID osoby** pomenúva pohybujúcu sa vec, ktorej riadok patrí: hráča, bota, auto. Ukladá sa ako 32-bitové ID na riadok.

S osobou a stĺpcom času načítanie vypočíta **životnosť** každého riadku: čas do ďalšej vzorky tej istej osoby *v tej istej relácii*, alebo "žiadna"
(stráža, -1), keď nasledujúca vzorka neexistuje - osoba zomrela, odišla, alebo záznam sa skončil. Životnosti poháňajú históriu **Životnosť**
[časovej osi](timeline.md), interpoláciu a zastaranie v [box replay](box-replay.md) a zlomy trás v [čiarovom teple](line-heat.md). Čo spraví riadok bez
nasledovníka, je nastavenie zobrazenia (*Záložná životnosť*), nie je to zapečené do dát.

Každej osobe sa priradí skupina jej **prvého** riadku v čase; toto priradenie farbí jej box v box replay a rozhoduje, viditeľnosť ktorej skupiny ju tam skryje.
Režimy tepla namiesto toho používajú skupinu vlastného riadku.

### Názvy nosené naraz viacerými vecami {#names-worn-by-several-things-at-once}

Názov nie je vždy jedna entita: v niektorých exportoch každý bot každého zápasu zapisuje pod jedným menom. Spojenie dvoch vzoriek takej "osoby" -
interpoláciou, stopou alebo trasou - nakreslí čiaru medzi dvoma rôznymi tvormi cez mapu.

Pri načítaní ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) sa názov označí ako **zdieľaný**, keď dva jeho záznamy

- sú v tej istej relácii,
- majú ten istý čas,
- sú rovnakého druhu (každý ponechaný stĺpec kategórie má tú istú hodnotu), a
- sú od seba ďalej ako 1 % uhlopriečky rozsahu dát.

Zdieľané názvy sa kreslia ako jednotlivé vzorky - bez interpolácie, bez stopy, bez trasy čiarového tepla. Všetko ostatné o nich (ich teplo) je nedotknuté.
Panel Dátová sada vypíše, koľko názvov sa označilo, s najviac troma príkladmi, a panel box replay počet zopakuje.

## Relácia {#session}

Stĺpec **Relácia / zápas** hovorí, ku ktorému zápasu, nájazdu, kolu, behu alebo okruhu riadok patrí. Vďaka nemu sú vzorky osoby jednou súvislou stopou:
reálna telemetria často prekladá súbežné zápasy a vzorka hráča tesne pred prehrávacou hlavou a tá tesne po nej môžu byť z rôznych zápasov
vzdialených stovky metrov. So stĺpcom relácie:

- interpolácia, stopy a trasy čiarového tepla nikdy neprekročia zmenu relácie;
- životnosť riadku končí na konci jeho vlastnej relácie;
- výber **Relácia** sa objaví hore v bočnom paneli, pod lištou režimov.

Stĺpec relácie je veľmi často *časová pečiatka* - okamih začiatku zápasu, zopakovaný na každom riadku toho zápasu. Automatické mapovanie preto
hľadá názvy relácií skôr než osobu a skupinu ([Mapovanie stĺpcov](column-mapping.md#session-person-group)). Pretekárske kolo alebo stint je tiež relácia:
dve kolá tým istým autom sa nesmú spojiť do jednej stopy.

### Výber relácie {#the-session-picker}

![Výber Relácia otvorený na súbore desiatich zápasov: Všetky relácie (10), Match 01, Match 02 a tak ďalej](../assets/img/en/sessions-persons-groups-picker.webp)

*Desať zápasov v jednom súbore: vyberte jeden, alebo ich uvidíte všetky.*

Zobrazí sa, keď dátová sada má vypísané relácie (pozri limit nižšie).

| Časť | Význam |
|---|---|
| Označenie vpravo | Počet riadkov vybranej relácie, alebo *všetky naraz*. |
| Ponuka | *Všetky relácie (N)*, potom každá relácia, najaktívnejšia prvá, ako `označenie - N riadkov, rozsah` (rozsah v sekundách pod 90 s, v minútach pod 90 min, v hodinách nad tým). |
| Oranžová nápoveda | Zobrazí sa pri *Všetky relácie*: pozície sa stále nikdy nespájajú naprieč reláciami, ale súbežné zápasy dávajú na mapu dokopy nesúvisiace hráče. |
| Nápoveda | Zobrazí sa v režimoch tepla, keď je vybraná jedna relácia: výber len presunie prehrávaciu hlavu. |

Pri načítaní sa vyberie najaktívnejšia relácia. Výber relácie posunie prehrávaciu hlavu na začiatok tejto relácie.

Čo výber mení:

- V **[box replay](box-replay.md)** určuje, ktorá relácia sa prehráva: kreslia sa len jej boxy a stopy a rozsah časovej osi sa stane jej vlastným rozpätím.
- V **režimoch tepla** neobmedzuje teplo a na to upozorňuje nápoveda pod výberom: *V režimoch tepla výber len presunie prehrávaciu hlavu na začiatok relácie; teplo stále počíta každú reláciu. Box replay prehráva len vybranú reláciu.*
  Aby sa teplo obmedzilo na jednu reláciu, nechajte stĺpec relácie aj ako stĺpec filtra (*Ponechať na filtrovanie*) a filtrujte podľa neho. Stĺpec môže byť aj stĺpcom relácie, aj stĺpcom filtra:
  načítavač prečíta každý zaškrtnutý stĺpec filtra samostatne, nech hrá akúkoľvek ďalšiu úlohu.

### Príliš veľa relácií {#too-many-sessions}

Vypísať sa dá až **100 000** relácií. Nad to je stĺpec v skutočnosti ID (priečinok s miliónmi relácií po hŕstke riadkov), a posielať toľko označení
z workera na stránku je to, čo vyčerpá pamäť karty. Načítanie potom ponechá relácie **ID** - takže hranice sa stále vynucujú všade - ale zahodí
označenia a výber, a panel Dátová sada to povie.

## Skupina {#group}

Stĺpec **Tím / skupina** je ľubovoľný stĺpec s malým počtom hodnôt: tím, strana, družstvo, frakcia, príznak hráč-proti-AI, trieda auta. Ukladá sa
ako 16-bitové ID na riadok a riadi:

- [Zoznam tímov](teams-list.md) (viditeľnosť na skupinu, + / − strany),
- [teplo tímov](team-heat.md) (odtieň na skupinu),
- [rozdiel](difference.md) rozdelený podľa skupiny,
- farby boxov v [box replay](box-replay.md) (rodina odtieňov na skupinu, tón na člena).

### Limity {#limits}

Najviac **4 096** rôznych skupín. ID skupiny sa nesie vo štvrtom kanáli texelu pozície každého riadku na GPU a každá skupina potrebuje texel
v 4 096-širokej tabuľke znamienok, ktorú shader číta, aby rozhodol *skrytá*, *pridaná* alebo *odčítaná*. Stĺpec s viac rôznymi hodnotami je ID, nie skupina:
**načítanie ponechá každý riadok a zahodí len zoskupenie**, s upozornením na dátovej sade, ktoré navrhne namapovať ho ako stĺpec osoby, alebo ponechať ho ako stĺpec filtra.

Rovnaký limit 4 096 platí pre ponechaný stĺpec filtra *kategórie*; širší sa neponechá a dátová sada to povie. Číselný stĺpec (napríklad časová pečiatka)
takýto limit ako filter *rozsahu* nemá.

Hodnoty skupiny `0`, prázdna hodnota, `none`, `unknown`, `null` a `-1` (bez ohľadu na veľkosť písmen) znamenajú pre [teplo tímov](team-heat.md) "žiadna skupina"
a kreslia sa neutrálnou sivou, nie ako sebavedomá farba.

## Veľkosť entity {#entity-size}

Aké veľká je jedna sledovaná vec - kolízny box hráča, auto - určuje, aké veľké sa kreslia boxy a lúče pohľadu v [box replay](box-replay.md). V paneli na to nie je pole;
prichádza z [nápovedí `heat3d`](data-formats.md#the-heat3d-hints) súboru (`entity.size`, v jednotkách samotného súboru; konvertor CS2 zapíše 32). Načítanie to
vynásobí mierkou jednotiek.

Pri každom načítaní ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), kde *rozsah* je väčší z rozpätí X a Z dát:

| Nastavenie | S veľkosťou entity | Bez nej |
|---|---|---|
| Veľkosť kocky | veľkosť entity | rozsah / 500 |
| Dĺžka lúča pohľadu | veľkosť entity × 4 | rozsah / 200 |
| Polomer sprite | rozsah / 120 | rozsah / 120 |
| Bod sýtosti | analytický odhad (potom meraný) | to isté |
| Rýchlosť letu | rozsah / 12 | to isté |
| Ďaleká rovina | rozsah × 12 | to isté |
| Blízka rovina | max(0,05; rozsah / 20 000) | to isté |

## Panel Dátová sada {#the-dataset-panel}

Pod panelom Zdroj. Keď je dátová sada načítaná, ukazuje:

- **názov** dátovej sady - výber, počet riadkov, počet súborov, krok, ak sa použil;
- **`N tímov · N osôb · N s rozpätie`**;
- každé **upozornenie**, ktoré načítanie vyvolalo, oranžovo, kým je dátová sada načítaná: skupiny alebo stĺpec filtra zahodené pre priveľa hodnôt, relácie
  nevypísané, zdieľané názvy, chýbajúce riadky, preskočené súbory;
- [generátor syntetických dát](synthetic-generator.md);
- **Uvoľniť**, ktoré dátovú sadu odstráni.

Počet riadkov sa zobrazuje v hlavičke panela.
