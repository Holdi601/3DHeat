---
title: "Kappakstursgreining"
nav_order: 14
has_children: true
lang: "is"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---


# Kappakstursgreining

Þú ókst sömu braut tvisvar. Flipinn **Kappakstursgreining** spilar báða aksturana saman í 3D, sýnir hvar einn hringur var hægari og segir þér af hverju. Engir hringir enn? Ýttu á **Sýnishringir**.

![Flipinn Kappakstursgreining með sýnishringjum: hliðarstikan með Hringir og Hvar má bæta sig, bílarnir á brautinni, línuritin undir sýninni](../assets/img/en/race-analysis-overview.webp)

Flipinn ber saman tvo eða fleiri hringi á einni braut. Hann deilir striganum, myndavélinni og brautarlíkaninu (**Bakgrunnur / borð**) með hitakortinu; allt annað er hans eigið: eigin hliðarstika og eigin stika undir sýninni. Orð eins og *hringur*, *viðmiðun* og *toppur beygju* eru í [orðasafninu](glossary.md).

Þessi síða er kort yfir flipann. Hver hluti hefur sína eigin síðu:

| Síða | Hvað hún fjallar um |
|---|---|
| [Hleðsla hringja](race-loading-laps.md) | hvert skráarsnið, möppur og brautir, heiti bíla, sýnishringir, listi hringja, viðmiðun og fókus |
| [Endurspilun og þrívíð sena](race-replay-and-scene.md) | spilunarstikan, þrjár endurspilunarstillingar, röðun bíla, eltingarmyndavélin, línur, kort, bílar, merkingar, speglaðir heimar |
| [Línurit og HUD](race-charts-and-hud.md) | fjarlægðarlínuritin, val á línuriti, bendill og aðdráttur, bílaspjöld, rásatafla |
| [Atburðir í stýringu bíls](race-control-events.md) | læsingar, spól, ofstýring, snúningar, undirstýring, högg, árekstrar, ABS/TC, handbremsa, loft - hvernig hver þeirra er greind, með hverjum þröskuldi |
| [Greining beygju fyrir beygju](race-corner-analysis.md) | röðun eftir vegalengd, beygjur og bil, tímareikningur beygju, hvert orsök og í hvaða röð þær eru prófaðar, lögun línunnar og ráðin |
| [Bílasnið og samanburður](race-car-profiles.md) | hvað hver bíll getur, mælt út frá hringjum hans; *Bílar bornir saman*; hvað bíllinn ræður í hverri beygju |
| [Tölfræði brautar](race-course-statistics.md) | margir hringir á einni braut: mistök á hverja beygju og tegund, mistakakort, útflutningur hitakorts, afkastamörk |
| [Kappakstursgreining: aðferðin](race-analytics.md) | rannsóknin á bak við reglurnar, með heimildum |
| [Aðrir kappakstursleikir](other-games.md) | hvað skoðarinn gerir við hringi úr hverjum leik: sleði og reki reiknaður þar sem leikur sendir þá ekki, speglaðir heimar, aukarásirnar |

## Skjárinn {#the-screen}

**Hliðarstikan**, að ofan og niður (hlutar má leggja saman):

1. **Hringir** - hleðsla, listi, sýna/fela, viðmiðun, fókus, eltingarmyndavél.
   Sjá [Hleðsla hringja](race-loading-laps.md).
2. **Brautartölfræði** - aðeins frá þremur hlöðnum hringjum.
   Sjá [Tölfræði brautar](race-course-statistics.md).
3. **Hvar má bæta sig** - niðurstöður fókushringsins, beygju fyrir beygju.
   Sjá [Greining beygju fyrir beygju](race-corner-analysis.md).
4. **Beygja fyrir beygju** (eða *Beygja fyrir beygju - flokkur X* með nokkrum flokkum) - hraðasti hringurinn í gegnum hverja beygju og lína hans. Birtist með tveimur eða fleiri hringjum.
5. **Stjórn á bílnum** - læsingar, rennur, ýtingar og högg fókushringsins.
   Sjá [Atburðir í stýringu bíls](race-control-events.md).
6. **Bílar bornir saman** (eða **Bíllinn** með einum bíl) - sjá [Bílasnið og samanburður](race-car-profiles.md).
7. **Sýn** - hvaða kort er málað á brautina og hvað er teiknað.
   Sjá [Endurspilun og þrívíð sena](race-replay-and-scene.md).
8. Sameiginlegu spjöldin **Borð** og **Myndavél og sena** (brautarlíkan, öfugsnúningur ása, myndavél) - skjalfest með hitakortinu og [Myndavél](camera.md).

**Sýnin** sýnir brautina, ekin línur, kortið, bílana, merkingar festar við brautina, og allt að sex bílaspjöld efst til vinstri (sjá [Línurit og HUD](race-charts-and-hud.md)). Án hlaðinna hringja stendur "No laps loaded - Drop two or more lap files here, or load the demo laps from the sidebar."

**Stikan undir sýninni** geymir spilunarstýringarnar og fjarlægðarlínuritin, nema þau séu falin.

## Fljótleg byrjun {#quick-start}

1. Opnaðu flipann **Kappakstursgreining** (við hliðina á **Hitakorti** efst í hliðarstikunni).
2. Settu hringi inn. Ýttu á **Sýnishringir** til að sjá hvað flipinn gerir við þrjá uppspunnin hringi. Fyrir eigin hringi, taktu þá fyrst upp ([skráarsnið og upptökutæki](race-loading-laps.md#file-formats)), ýttu síðan á **Hlaða hringjaskrám…** eða **Mappa…**, eða slepptu skrám eða möppum á sýnina.
3. Hraðasti heili hringurinn verður viðmiðunin; hægasti hinna hringjanna er í fókus. Smelltu á hvaða hring sem er á listanum til að fókusa á hann; ★ gerir hring að viðmiðun.
4. Lestu **Hvar má bæta sig**. Smelltu á niðurstöðu: bílarnir eru raðaðir 40 m fyrir hana, myndavélin rammar hana inn, endurspilunin spilar í gegnum hana og mælingarnar opnast.
5. Færðu bendilinn yfir línuritin til að færa alla bíla á þann metra; Shift+smellur raðar þeim þar.

## Lyklaborð {#keyboard}

Meðan flipinn Kappakstur er opinn:

| Takki | Gerir |
|---|---|
| **K** | spila / gera hlé á endurspilun |
| **Home** | aftur á upphaf endurspilunar |
| tölutakkar | ekkert (í hitakortinu skipta þeir um stillingu) |

Takkar sem eru skrifaðir í textareit eða fellilista eru hunsaðir. Myndavélartakkarnir virka eins og í hitakortinu (**W A S D**, **Space** upp, **Q** niður, **Shift** hraðar, **Alt** hægar, mús til að líta; allt í [Myndavél](camera.md)); **F** rammar inn hlöðnu hringina (eins og hleðsla hringja gerir).

## Margir hringir {#many-laps}

- Allir hlaðnir hringir eru greindir og taldir; tugir taka sekúndu eða tvær.
- Eftir **8** hringi (`SHOW_ALL_UP_TO`) eru hringir sem bætast við aðeins teiknaðir þegar þeir eru viðmiðunin, fókushringurinn, eða besti hringur fókushringsins flokks. *Sýna alla* / *Aðeins þá sem er horft á* skipta.
- Eftir **10** sýnilega bíla (`PLAIN_PAST`) eru hringir sem ekki er horft á (ekki fókus, eltur bíll eða viðmiðun) teiknaðir með línum grisjuðum niður í punkt á 6 m fresti í stað 1,5 m, og sem venjulegir bílar.
- Línuritin teikna mest **8** hringi; HUD sýnir mest **6** spjöld.
- Brautartölfræðin birtist frá **3** hringjum.

Nánar: [Tölfræði brautar](race-course-statistics.md#performance-with-many-laps).

## Sjálfgefnar sýnstillingar {#default-view-settings}

| Stilling | Sjálfgildi |
|---|---|
| Kort | Tímakort |
| Ekin línur, Bílar, Dekk og fjöðrun, Merkingar, Braut úr hringjunum | kveikt |
| Allt gildi á spjöldunum | slökkt |
| Stærð bíls | 1× |
| Línurit | sýnd |
| Endurspilunarhamur | Frá línunni |
| Hraði endurspilunar | 1× |
| Endurtaka | kveikt |

Engin af þessum er vistuð; endurhleðsla byrjar á sjálfgildunum. Það sem er munað í vafranum: tungumálið, og bílaheitin sem lærð eru af hringjaskrám (sjá [Hleðsla hringja](race-loading-laps.md#car-names)).

## Fyrir forritara {#for-developers}

### What happens when laps are loaded {#what-happens-when-laps-are-loaded}

Every time the set of laps, the reference or the language changes, the whole
analysis is redone (`analyse` in
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Derived channels are added to each lap where the game does not send them:
   drift angle, wheel slip from wheel speeds, in the air, loose ground, yaw
   rate ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. The reference is chosen and every lap is projected onto its path and
   resampled every 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Whether the game's world is mirrored is worked out from the laps
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Corners are found on the reference, and grouped into segments from one
   braking zone to the next ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per car: its envelope (grip, braking, pull per speed), its profile, its
   tyre curves ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per lap and segment: what it did (brake point, slowest point, full
   throttle, ...) and the line it drove ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per lap: its car-control events, each laid against the lap it is compared
   with there.
8. Per lap and segment: the time account against its comparison lap and the
   finding in words.
9. The time map and the cause map per lap.

The texts are produced in the current language; switching language runs the
analysis again (and renames the demo laps). A failure in the analysis is
shown under the **Laps** buttons as an error and the laps stay loaded.

### Source files {#source-files}

| File | Role |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | reading lap files |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | the lap type, naming, demo laps |
| `src/race/derive.ts`, `handedness.ts` | derived channels, mirrored worlds |
| `src/race/align.ts`, `segments.ts`, `line.ts` | distance axis, corners, lines |
| `src/race/analysis.ts` | corners compared, causes, findings |
| `src/race/envelope.ts`, `profile.ts` | what a car can do |
| `src/race/control.ts`, `impacts.ts` | car control, hits and crashes |
| `src/race/stats.ts` | many laps |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay and drawing |
| `src/race/schema.ts`, `graphs.ts` | the channel table, the charts' rows |
| `src/ui/race/*` | the sidebar, the charts, the HUD, the labels |
| `src/state/raceStore.ts` | the tab's state and the replay clock |
