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
8. Skupna razdelka **Ozadje / nivo** in **Kamera in prizor** (model proge, obrnitev osi, kamera) - dokumentirana s toplotnim zemljevidom in [Kamero](camera.md).

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

### Kaj se zgodi ob nalaganju krogov {#what-happens-when-laps-are-loaded}

Vsakič, ko se spremeni nabor krogov, referenca ali jezik, se celotna analiza ponovi (`analyse` v [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Izpeljani kanali se dodajo vsakemu krogu tam, kjer igra teh ne pošilja: kot zdrsa, zdrs koles iz hitrosti koles, v zraku, rahlo podlago, hitrost zasuka ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Izbere se referenca in vsak krog se projicira na njeno pot ter ponovno vzorči na vsaka 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Iz krogov se izračuna, ali je svet igre zrcaljen ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Ovinki se najdejo na referenci in združijo v odseke od ene zavorne cone do naslednje ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Za vsak avto: njegova ovojnica (oprijem, zaviranje, vlečna sila glede na hitrost), njegov profil, njegove krivulje pnevmatik ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Za vsak krog in odsek: kaj je naredil (točka zaviranja, najpočasnejša točka, polni plin ...) in črta, po kateri je vozil ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Za vsak krog: njegovi dogodki vožnje avtomobila, vsak položen ob krogu, s katerim se tam primerja.
8. Za vsak krog in odsek: časovna bilanca glede na primerjalni krog in ugotovitev z besedami.
9. Časovni zemljevid in zemljevid vzrokov za vsak krog.

Besedila nastanejo v trenutnem jeziku; zamenjava jezika ponovi analizo (in preimenuje demo kroge). Napaka pri analizi se prikaže pod gumbi **Krogi** kot napaka, krogi pa ostanejo naloženi.

### Izvorne datoteke {#source-files}

| Datoteka | Vloga |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | branje datotek krogov |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | tip kroga, poimenovanje, demo krogi |
| `src/race/derive.ts`, `handedness.ts` | izpeljani kanali, zrcalni svetovi |
| `src/race/align.ts`, `segments.ts`, `line.ts` | os razdalje, ovinki, črte |
| `src/race/analysis.ts` | primerjani ovinki, vzroki, ugotovitve |
| `src/race/envelope.ts`, `profile.ts` | kaj avto zmore |
| `src/race/control.ts`, `impacts.ts` | vožnja avtomobila, zadetki in trki |
| `src/race/stats.ts` | mnogo krogov |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | predvajanje in risanje |
| `src/race/schema.ts`, `graphs.ts` | tabela kanalov, vrstice grafov |
| `src/ui/race/*` | stranska vrstica, grafi, HUD, oznake |
| `src/state/raceStore.ts` | stanje zavihka in ura predvajanja |
