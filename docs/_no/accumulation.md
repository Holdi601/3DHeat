---
title: "Akkumulering"
parent: "Rendering i detalj"
nav_order: 2
lang: "no"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akkumulering

Når visningen ikke kan tegne hver prikk i ett bilde, tegner den én del av dem, så en annen del, og legger bildene sammen mens du holder stille. Bildet blir skarpere, som en fotografi som framkalles. Når du flytter kameraet, starter det på nytt. Linjen **Dekning** i statistikkoverlegget viser hvor langt det er kommet.

![Statistikkoverlegget: Dekning viser en prosentandel mens bildet framkalles, og *eksakt* når det er ferdig](../assets/img/en/performance-stats-overlay.webp)

## For utviklere {#for-developers}

Når ett bilde ikke kan tegne hver rad, tegner det et utvalg og vekter det opp; bildet er da et ubetinget, men støyende estimat. **Akkumulering** slår sammen påfølgende bilder slik at estimatet konvergerer mot det eksakte svaret så lenge ingenting endrer seg. Hvert bilde velger én av fem moduser ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); den sist brukte ligger på `engine.live.accumMode`.

| Modus | Når | Hva som skjer med akkumulatoren |
|---|---|---|
| **reset** | kameraet flyttet seg, noe som endrer feltet endret seg, progressiv forbedring er av, et voksende vindu starter (første bilde i avspilling, etter et hopp), eller avspilt linjevarme flyttet seg | Erstattet av dette bildets estimat. |
| **extend** | et **Kumulativt** vindu som bare har vokst siden forrige bilde | Dette bildet tegner bare radene som nettopp ble synlige, med full vekt, og legger dem til. Ingenting forfaller. |
| **ema** | et glidende vindu (**Vindu**, **Levetid**) flyttet seg | `acc = acc × (1 - 0,34) + frame × 0,34` – et eksponentielt glidende gjennomsnitt på omtrent tre bilder. |
| **mean** | ingenting endret seg, og estimatet er ikke fullstendig | `acc = acc × (1 - 1/n) + frame × 1/n` på det *n*-te bildet: et løpende gjennomsnitt. |
| **skip** (inaktiv) | konvergert, og ingenting endret seg | Ingenting tegnes; bildet komponeres bare om. |

### Hvorfor hver {#why-each}

- **Løpende gjennomsnitt, ikke sum.** Å skalere bufferen med 1 - 1/n og legge til 1/n av det nye bildet er algebraisk det samme som å summere og dele på *n* til slutt, men bufferen inneholder alltid ett felts verdi. En sum når *n* ganger feltet, og på et 16-bit-mål metter den ved 65 504; med en divisor som stadig vokser, ville et stille bilde da blekne jo lenger det sto – mens et bevegelig kamera, som nullstilles hvert bilde, ser helt riktig ut. Røyktesten påstår at 16 sammenslåtte bilder holder 1,00× det ett bilde gjør.
- **Extend for kumulativ avspilling.** Radene som allerede er akkumulert, er fortsatt synlige, så et bilde trenger bare brøkdelen av et sekund som nettopp kom – som får plass i ett bilde, så den legges inn nøyaktig. Å estimere på nytt i stedet ville tent et annet tilfeldig utvalg hvert bilde og fått det til å blekne, og det ville sett ut som støt som blusser opp og forsvinner, og et pauset bilde ville fortsatt fylle seg. Testen påstår at totalen stiger monotont under avspilling og holder seg innen 0,02 % over 2,5 s pauset.
- **Glidende gjennomsnitt for glidende vinduer.** Disse endrer seg virkelig for hvert bilde. En fast blandevekt følger det bevegelige vinduet (et gjennomsnitt over alle bilder siden avspillingen startet ville ligge etter spillehodet), og det er mye roligere enn å starte på nytt.
- **Nullstilling for avspilte linjer.** Hoder av linjevarme beveger seg for hvert bilde; et glidende gjennomsnitt ville smøre hver enkelt ut til en strek, så hvert bilde tegnes helt, og halens utsliting er bildets egen.
- **Delbilder går gjennom et arbeidsmål.** Et bilde slått sammen med brøkdel av full vekt blir sprutet inn i et eget mål fra null, og deretter blandet inn i akkumulatoren, i stedet for å sprutes direkte med 1/n vekt. Direkte ville hver sprite blitt lagt til med 1/n av størrelsen på totalen den går inn i, noe et halvflyt-mål runder bort – verst der det er tettest ([Halvflyt-akkumulering](half-float-accumulation.md)).

### Konvergens {#convergence}

Planen for hvert bilde vet hvor mange kandidatrader det finnes, og hvor mange den sender, så antallet bilder som trengs for å dekke hver rad er ⌈kandidater / sendt⌉. Når så mange bilder er slått sammen, er visningen **konvergert**: linjen *Dekning* i statistikkoverlegget går fra en prosentandel til *eksakt*, og flere bilder er inaktive. Med **Tegn hver rad i hvert bilde** på (standard) dekker ett enkelt bilde vanligvis alt, så konvergensen skjer med en gang, og den progressive mekanismen trengs bare når vinduet har flere rader enn én tegneplan kan bære (omtrent 67 millioner).

### Hva som starter den på nytt {#what-restarts-it}

Innstillingene faller i tre grupper, ut fra hva den akkumulerte bufferen fortsatt betyr etter at de er endret:

| Gruppe | Endrer | Virkning |
|---|---|---|
| **Geometri** – hvilke rader som bidrar og hvor mye | visningsmodus; linjeruter; sprite-radius, intensitet i senter og kant, avtagning, myk rampe, kurven, pikselgrenser, utflating; avskjæring etter avstand nær, fjern og planar; okklusjon og skjul bak terrenget; skiven; lerretsstørrelse; varmeoppløsning; gruppesynlighet og fortegn; differansedelingen; Alle / Spill av; historikken; kolonnefiltrene og utvalget i Enheter; halvflyt-forsterkningen | Nullstilling. |
| **Vindu** – tidsområdet | spillehodet som flytter seg; reservelevetiden og utsliting | Extend (kumulativ) eller glidende gjennomsnitt (glidende). |
| **Komposisjon** – bare fargeleggingen | metning, tetthetsrespons, minste varme, fargeskalaene; kutting av nivået; rutenett og akser; innstillingene og økten for figuroverlegget; dybdeskarphet | Tegn på nytt uten å røre varmen. |

En kamerabevegelse nullstiller alltid. Så å dra i metningen eller skalaen er gratis; å dra i sprite-radiusen starter konvergensen på nytt for hvert steg.
