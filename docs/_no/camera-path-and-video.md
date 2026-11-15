---
title: "Kamerabane og video"
nav_order: 15
lang: "no"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kamerabane og video

Lag en film av dataene dine: du plasserer kameraet på noen få steder, og visningen flyr mellom dem og lagrer en video. Hvert bilde er svært rent, uten korn. Kameraet og spillehodet beveger seg sammen, så det samme panelet lager en tidsraffinert film ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Lag en gjennomflyging {#make-a-flythrough}

1. Fly til stedet der filmen starter, og trykk **Legg til nøkkelbilde her** i **Kamerabane og rendering**.
2. Fly til neste sted og trykk den igjen. Gjenta for hvert stopp.
3. Kryss av for **Forhåndsvis langs banen** og dra **Posisjon langs banen** for å sjekke bevegelsen.
4. Sett **Varighet** (hvor lang videoen er). En bevegelse som er riktig, men for rask, trenger bare en lengre varighet.
5. Trykk **Rendre video**. Vent på fremdriftslinjen; filen lastes ned når den er ferdig.

![Panelet Kamerabane og rendering med tre nøkkelbilder, Myk interpolering, 12 s, 30 fps og 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Nøkkelbilder {#keyframes}

| Kontroll | Effekt |
|---|---|
| **Legg til nøkkelbilde her** | Legger til den gjeldende kameraposisjonen, gir, stigning og synsfelt som et nøkkelbilde. |
| **Tøm** | Fjerner alle nøkkelbilder. |
| Nøkkelbildeliste | Én rad per nøkkel: nummeret (klikk for å fly kameraet dit, og sette synsfeltet også), posisjonen, `gir° / stigning°`, og **×** for å fjerne den. |

Nøklene fordeles **jevnt** langs en normalisert banelinje fra 0 til 1 hver gang en legges til eller fjernes; utdatavarigheten strekker deretter hele bevegelsen, så et skudd som er riktig, men for rask, trenger bare en lengre varighet. Gir blir løst opp mellom nøklene, slik at kameraet snur den korte veien.

Uten nøkkelbilder holder en rendering det gjeldende kameraet stille hele klippet – en helt god tidsraffinert film.

## Baneinnstillinger {#path-settings}

| Kontroll | Standard | Område (jog) | Betydning |
|---|---|---|---|
| **Interpolering** (2+ nøkler) | *Myk* | *Myk* / *Rett* | *Myk*: en kubisk Hermite-kurve gjennom nøklene, med tangenter fra nabonøklene, slik at farten stemmer over hver nøkkel og det ikke blir noe rykk der segmentene møtes. *Rett*: rette linjer mellom nøklene, forutsigbart, med et synlig hjørne ved hver nøkkel. Synsfeltet interpoleres alltid lineært. |
| Reiselinje (2+ nøkler) | | | `N enheter reise – M per sekund ved denne varigheten`, eller en merknad om at nøklene alle ligger på ett sted. |
| **Forhåndsvis langs banen** (1+ nøkler) | av | | Styrer visningskameraet etter banen, og flytter spillehodet med det slik rendering gjør, slik at bevegelsen kan bedømmes før rendering. |
| **Posisjon langs banen** (mens du forhåndsviser) | 0 % | 0–100 % | Hvor på banen som forhåndsvises. |
| **Varighet** | 12 s | 1–120 s (3600) | Lengden på videoen. |
| **Bildefrekvens** | 30 fps | 6–60 (240) | |
| **Bithastighet** | 16 Mbps | 1–60 Mbps, logaritmisk (400) | Varmetoner blir dårlige ved lav bithastighet: det er lite detalj for en kodek å skjule feil bak. |
| **Ventetak for konvergens** | 240 bilder | 2–600 (10 000) | Lengst et utdata-bilde kan vente på å bli nøyaktig. Bilder som treffer taket, skrives likevel, og telles. |
| Sammendrag | | | `N bilder · vindu: kumulativt/fast/levetid`, og når tidslinjen er i Alle-modus: *(rendering bytter Alle til Spill av, slik at spillehodet betyr noe)*. |
| **Rendre video** / **Avbryt** | | | Starter renderingen; mens den kjører, vises `bilde i / n · ventet w · X MB` og hvor mange bilder som ikke var nøyaktige. Krever et datasett. |

## Tips {#tips}

- Utdatastørrelsen er lerretets størrelse i enhetspiksler (skjermens pikselforhold, begrenset til 2). Endre størrelse på nettleservinduet for å endre den.
- En kumulativ historikk bygger opp varmen over klippet; et vindu eller en levetid viser et bevegelig utsnitt av tid.
- Nøkkelposisjoner er visningskoordinater: med en [invertert verdensakse](camera.md#invert-world-axis) peker nøkler laget før du byttet, et annet sted etterpå.

## For utviklere {#for-developers}

### Hva en rendering gjør {#what-a-render-does}

1. Tar et testopptak av bildet for å finne den nøyaktige utdatastørrelsen i enhetspiksler.
2. Velger en kodek gjennom WebCodecs: **VP9** (`vp09.00.10.08`), ellers **VP8**, med valgt bithastighet og bildefrekvens. Uten `VideoEncoder` stopper den med *Denne nettleseren har ingen VideoEncoder – WebCodecs kreves for å skrive en video*; uten noen av kodekene, *Ingen støttet videokodek (prøvde VP9, VP8)*.
3. Overtar innstillingene en rendering trenger: pauser avspillingen, slår **adaptivt budsjett av**, **progressiv forbedring på** og setter sprite-budsjettet til 64 M per bilde (det adaptive budsjettet beskytter bildefrekvensen, som er feil mål her: det ville tolket hvert tregt konvergerende bilde som en grunn til å tegne færre rader, og det krever flere bilder for å konvergere), og bytter tidslinjen fra **Alle** til **Spill av**. Historikkinnstillingen (kumulativ, vindu, levetid) beholdes som den er: en rendering skal være det du så på, spilt av og skrevet ned.
4. For hvert utdatabilde *f* av *n*, ved *u* = f / (n - 1):
   - plasserer kameraet i banens stilling ved *u* (hvis det finnes nøkler);
   - spoler spillehodet til samme brøkdel *u* av tidslinjens område (det valgte øktens spenn i boksreprisen);
   - tvinger et nytt estimat, selv når kameraet ikke beveget seg – å arve forrige bildes akkumulering ville etterlatt et spøkelse av forrige vindu;
   - venter, bilde for bilde, til bildet er nøyaktig (alle kandidatrader tegnet i ett bilde, eller akkumuleringen fullført), opptil ventetaket;
   - fanger det sammensatte bildet og koder det, med et nøkkelbilde hvert 2. sekund av utdata slik at filen kan søkes i.
5. Pakker bildene inn i en WebM-fil ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) med tidsstempler valgt ut fra bildefrekvensen – tiden på veggklokken hvert bilde tok, er uten betydning.
6. Gjenoppretter budsjettet, synsfeltet, tidslinjemodusen, spillehodet og om det spilte av.
7. Laster ned videoen som `3dheat-<bredde>x<høyde>-<bilder>f.webm` og melder `N bilder på W×H, X MB – hvert bilde nøyaktig`, eller hvor mange som traff ventetaket.

**Avbryt** stopper etter gjeldende bilde (*Rendering avbrutt.*) og gjenoppretter innstillingene.
