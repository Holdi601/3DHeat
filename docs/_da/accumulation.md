---
title: "Akkumulering"
parent: "Renderingens indre"
nav_order: 2
lang: "da"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akkumulering

Når viseren ikke kan tegne alle prikker i ét billede, tegner den en del af dem, så en anden del, og lægger billederne sammen, mens du holder stille. Billedet bliver klarere, ligesom et foto der fremkaldes. Flytter du kameraet, starter det forfra. Linjen **Dækning** i statistik-overlejringen viser, hvor langt det er nået.

![Statistik-overlejringen: Dækning viser en procentdel, mens billedet fremkaldes, og *eksakt*, når det er færdigt](../assets/img/en/performance-stats-overlay.webp)

## For udviklere {#for-developers}

Når ét billede ikke kan tegne alle rækker, tegner det en stikprøve og vægter den op; billedet er så et ubiaset, men støjende skøn. **Akkumulering** lægger på hinanden følgende billeder sammen, så skønnet konvergerer mod det eksakte svar, mens intet ændrer sig. Hvert billede vælger en af fem tilstande ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); den sidst brugte ligger på `engine.live.accumMode`.

| Tilstand | Hvornår | Hvad der sker med akkumulatoren |
|---|---|---|
| **reset** | kameraet flyttede sig, noget der ændrer feltet ændrede sig, progressiv forfining er fra, et voksende vindue starter (første billede ved afspilning, efter et spring), eller afspillet linjevarme flyttede sig | Erstattes af dette billedes skøn. |
| **extend** | et **Kumulativt** vindue, der kun er vokset siden sidste billede | Dette billede tegner kun de rækker, der netop blev synlige, med fuld vægt, og lægger dem til. Intet henfalder. |
| **ema** | et glidende vindue (**Vindue**, **Levetid**) er flyttet | `acc = acc × (1 - 0,34) + billede × 0,34` - et eksponentielt glidende gennemsnit på omkring tre billeder. |
| **mean** | intet er ændret, og skønnet er ikke komplet | `acc = acc × (1 - 1/n) + billede × 1/n` på det *n*. billede: et løbende gennemsnit. |
| **skip** (inaktiv) | konvergeret, og intet er ændret | Intet tegnes; billedet sammensættes kun igen. |

### Hvorfor hver {#why-each}

- **Løbende gennemsnit, ikke sum.** At skalere bufferen med 1 - 1/n og lægge 1/n af det nye billede til er algebraisk det samme som at summere og dividere med *n* til sidst, men bufferen holder altid ét felts værdi. En sum når *n* gange feltet, og på et 16-bit-mål mættes den ved 65.504; med en divisor der bliver ved med at vokse, ville en stille visning så falme, jo længere den stod - mens et bevægeligt kamera, der nulstilles hvert billede, ser helt korrekt ud. Røgtesten bekræfter, at 16 sammenlagte billeder holder 1,00× det, ét billede gør.
- **Extend til kumulativ afspilning.** De rækker, der allerede er akkumuleret, er stadig synlige, så et billede behøver kun den brøkdel af et sekund, der netop kom - som passer i ét billede, så den lægges ind præcis. At estimere igen ville tænde en anden tilfældig delmængde hvert billede og lade den falme, hvilket ser ud som udbrud, der blusser op og forsvinder, og et stoppet billede ville blive ved med at fylde ud. Testen bekræfter, at summen stiger monotont under afspilning og holder sig inden for 0,02 % over 2,5 s på pause.
- **Glidende gennemsnit til glidende vinduer.** De ændrer sig virkelig hvert billede. En fast blandingsvægt følger det bevægelige vindue (et gennemsnit over alle billeder siden afspilningens start ville halte efter afspilningshovedet) og er meget roligere end at starte forfra.
- **Nulstilling for afspillede linjer.** Hovederne på linjevarmen flytter sig hvert billede; et glidende gennemsnit ville smøre hver ud til en stribe, så hvert billede tegnes helt, og halens udtoning er selve billedets.
- **Delvise billeder går gennem et midlertidigt mål.** Et billede lagt sammen med en brøkdel af fuld vægt splattes ind i et særskilt mål fra nul og blandes derefter ind i akkumulatoren, i stedet for at splattes direkte med 1/n vægt. Direkte ville hver sprite blive lagt til med 1/n af størrelsen af den total, den går ind i, hvilket et halv-flydende mål afrunder væk - værst, hvor det er tættest ([Halv-flydende akkumulering](half-float-accumulation.md)).

### Konvergens {#convergence}

Planen for hvert billede kender, hvor mange kandidatrækker der er, og hvor mange den indsender, så antallet af billeder, der skal til for at dække hver række, er ⌈kandidater / indsendte⌉. Når så mange billeder er sammenlagt, er visningen **konvergeret**: statistik-overlejringens linje *Dækning* skifter fra en procentdel til *eksakt*, og yderligere billeder er inaktive. Med **Tegn alle rækker i hvert billede** til (standard) dækker et enkelt billede normalt alt, så konvergensen er øjeblikkelig, og den progressive mekanik er kun nødvendig, når vinduet indeholder flere rækker, end én tegneplan kan bære (omkring 67 millioner).

### Hvad der starter den forfra {#what-restarts-it}

Indstillinger falder i tre grupper, efter hvad den akkumulerede buffer stadig betyder, efter de er ændret:

| Gruppe | Ændrer | Virkning |
|---|---|---|
| **Geometri** - hvilke rækker der bidrager, og hvor meget | visningstilstand; linjeruter; sprite-radius, intensitet i centrum og ved kanten, aftagning, blød rampe, kurven, pixelgrænser, udfladning; afstandsafskæring nær, fjern og planar; dækning og skjul bag terræn; udsnittet; lærredets størrelse; varmeopløsning; gruppesynlighed og fortegn; forskelsdelingen; Alle / Afspil; historikken; kolonnefiltrene og valget i Enheder; den halv-flydende forstærkning | Nulstilling. |
| **Vindue** - tidsintervallet | afspilningshovedet flytter sig; reservelevetiden og udtoningen | Udvidelse (kumulativ) eller glidende gennemsnit (glidende). |
| **Sammensætning** - kun farvelægningen | mætning, tæthedsrespons, minimumsvarme, farverampene; skæring af banen; gitter og akser; indstillinger og session for boksreplay; dybdeskarphed | Tegn igen uden at røre varmen. |

Et kameraflytning nulstiller altid. Så det er gratis at trække i mætningen eller rampen; at trække i sprite-radius starter konvergensen forfra ved hvert trin.
