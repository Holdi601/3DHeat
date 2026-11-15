---
title: "Analiza dirke"
nav_order: 14
has_children: true
lang: "sl"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Analiza dirke

Isto progo ste vozili dvakrat. Zavihek **Analiza dirke** predvaja obe vožnji skupaj v 3D, pokaže, kje je bil en krog počasnejši, in vam pove zakaj. Še nimate krogov? Pritisnite **Demo krogi**.

![Zavihek Analiza dirke z demo krogi: stranska vrstica z Krogi in Kje se izboljšati, avtomobili na progi, grafi pod pogledom](../assets/img/en/race-analysis-overview.webp)

Zavihek primerja dva ali več krogov ene proge. Deli platno, kamero in naloženi model proge (**Ozadje / nivo**) s toplotnim zemljevidom; vse drugo je njegovo: lastna stranska vrstica in lastna vrstica pod pogledom. Izrazi, kot so *krog*, *referenca* in *apeks*, so v [slovarju pojmov](glossary.md).

Ta stran je zemljevid zavihka. Vsak del ima svojo stran:

| Stran | Kaj pokriva |
|---|---|
| [Nalaganje krogov](race-loading-laps.md) | vsak format datotek, mape in proge, imena avtomobilov, demo krogi, seznam krogov, referenca in fokus |
| [Predvajanje in 3D prizor](race-replay-and-scene.md) | vrstica za predvajanje, trije načini predvajanja, poravnava avtomobilov, kamera za zasledovanje, črte, zemljevidi, avtomobili, oznake, zrcaljeni svetovi |
| [Grafi in HUD](race-charts-and-hud.md) | grafi razdalje, izbirnik grafov, premik miške in povečava, kartice avtomobilov, tabela kanalov |
| [Dogodki obvladovanja avta](race-control-events.md) | blokade koles, zdrs koles, podkrmiljenje, zavijanje, trki, nesreče, ABS/TC, ročna zavora, zrak - kako je vsak zaznan, z vsakim pragom |
| [Analiza ovinek za ovinkom](race-corner-analysis.md) | poravnava po razdalji, ovinki in odseki, časovni račun ovinka, vsak vzrok in vrstni red, po katerem se preizkusijo, oblika linije in nasvet |
| [Profili avtomobilov in primerjava](race-car-profiles.md) | kaj zmore vsak avto, izmerjeno iz njegovih krogov; *Primerjava avtov*; kaj avto odloči v vsakem ovinku |
| [Statistika proge](race-course-statistics.md) | veliko krogov ene proge: napake po ovinku in vrsti, zemljevid napak, izvoz toplotnega zemljevida, omejitve zmogljivosti |
| [Analitika dirke: metoda](race-analytics.md) | raziskava za pravili, z viri |
| [Druge dirkalne igre](other-games.md) | kaj pregledovalnik naredi s krogi iz vsake igre: zdrs in drift, izračunana tam, kjer je igra ne pošlje, zrcaljeni svetovi, dodatni kanali |

## Zaslon {#the-screen}

**Stranska vrstica**, od zgoraj navzdol (razdelki se lahko zložijo):

1. **Krogi** - nalaganje, seznam, prikaz/skrivanje, referenca, fokus, zasledovanje.
   Glejte [Nalaganje krogov](race-loading-laps.md).
2. **Statistika proge** - le pri treh ali več naloženih krogih.
   Glejte [Statistika proge](race-course-statistics.md).
3. **Kje se izboljšati** - ugotovitve fokusiranega kroga, ovinek za ovinkom.
   Glejte [Analiza ovinek za ovinkom](race-corner-analysis.md).
4. **Ovinek za ovinkom** (ali *Ovinek za ovinkom - razred X* pri več razredih) - najhitrejši krog skozi vsak ovinek in njegova linija. Prikazan pri dveh ali več krogih.
5. **Obvladovanje avta** - blokade, drsenja, potiskanja in trki fokusiranega kroga.
   Glejte [Dogodki obvladovanja avta](race-control-events.md).
6. **Primerjava avtov** (ali **Avto** pri enem avtomobilu) - glejte [Profili avtomobilov in primerjava](race-car-profiles.md).
7. **Pogled** - katera karta je naslikana na progi in kaj je narisano.
   Glejte [Predvajanje in 3D prizor](race-replay-and-scene.md).
8. Skupna razdelka **Raven** in **Kamera in prizor** (model proge, obrnitev osi, kamera) - dokumentirana s toplotnim zemljevidom in [Kamero](camera.md).

**Pogled** prikazuje progo, vožene linije, karto, avtomobile, oznake, pripete na progo, in do šest kartic avtomobilov zgoraj levo (glejte [Grafi in HUD](race-charts-and-hud.md)). Brez naloženih krogov piše »Ni naloženih krogov - tu spustite dve ali več datotek krogov ali naložite demo krogi iz stranske vrstice.«

**Vrstica pod pogledom** vsebuje kontrole predvajanja in, če ni skrita, grafe razdalje.

## Hitri začetek {#quick-start}

1. Odprite zavihek **Analiza dirke** (ob **Toplotnem zemljevidu** na vrhu stranske vrstice).
2. Pridobite kroge. Pritisnite **Demo krogi**, da vidite, kaj zavihek naredi s tremi izmišljenimi krogi. Za lastne kroge jih najprej posnemite ([formati datotek in snemalniki](race-loading-laps.md#file-formats)), nato pritisnite **Naloži datoteke krogov…** ali **Mapa…**, ali spustite datoteke ali mape na pogled.
3. Najhitrejši popoln krog postane referenca; najpočasnejši drugi krog je fokusiran. Kliknite kateri koli krog na seznamu, da ga fokusirate; ★ naredi krog referenco.
4. Preberite **Kje se izboljšati**. Kliknite ugotovitev: avtomobili se poravnajo 40 m pred njo, kamera jo uokviri, predvajanje teče skozi njo in odprejo se meritve.
5. Premaknite miško nad grafe, da premaknete vsak avto na ta meter; Shift+klik jih poravna tam.

## Tipkovnica {#keyboard}

Ko je zavihek Analiza dirke odprt:

| Tipka | Naredi |
|---|---|
| **K** | predvajaj / ustavi predvajanje |
| **Home** | nazaj na začetek predvajanja |
| številske tipke | nič (v toplotnem zemljevidu preklapljajo načine) |

Tipke, vtipkane v besedilno polje ali spustni meni, so prezrte. Tipke kamere delujejo kot v toplotnem zemljevidu (**W A S D**, **Presledek** gor, **Q** dol, **Shift** hitreje, **Alt** počasneje, miška za ogled; vse v [Kamera](camera.md)); **F** uokvirja naložene kroge (enako kot nalaganje krogov).

## Veliko krogov {#many-laps}

- Vsi naloženi krogi so analizirani in šteti; desetine trajajo sekundo ali dve.
- Nad **8** krogov (`SHOW_ALL_UP_TO`) se dodani krogi narišejo le, kadar so referenca, fokusirani krog ali najboljši krog razreda fokusiranega kroga. Gumba *Prikaži vse* / *Samo tisti, ki jih gledate* preklopita.
- Nad **10** vidnimi avtomobili (`PLAIN_PAST`) se krogi, ki jih ne gledate (ne fokus, ne zasledovani avtomobil in ne referenca), narišejo s črtami, zredčenimi na točko na vsakih 6 m namesto 1,5 m, in kot navadni avtomobili.
- Grafi narišejo največ **8** krogov; HUD prikaže največ **6** kartic.
- Statistika proge se pojavi od **3** krogov.

Podrobnosti: [Statistika proge](race-course-statistics.md#performance-with-many-laps).

## Privzete nastavitve pogleda {#default-view-settings}

| Nastavitev | Privzeto |
|---|---|
| Karta | Časovna karta |
| Vožene linije, Avtomobili, Gume in vzmetenje, Oznake, Proga iz krogov | vklopljeno |
| Vse vrednosti na karticah | izklopljeno |
| Velikost avtomobila | 1× |
| Grafi | prikazani |
| Način predvajanja | Od črte |
| Hitrost predvajanja | 1× |
| Ponavljaj | vklopljeno |

Nič od tega se ne shrani; ponovno nalaganje začne s privzetimi vrednostmi. V brskalniku se shranita: jezik in imena avtomobilov, naučena iz datotek krogov (glejte [Nalaganje krogov](race-loading-laps.md#car-names)).

## Za razvijalce {#for-developers}

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
shown under the **Krogi** buttons as an error and the laps stay loaded.

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
