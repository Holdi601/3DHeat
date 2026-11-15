---
title: "Trefferanalyse (fanen Kjøretøy)"
parent: "Repriser"
nav_order: 4
lang: "no"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Treffanalyse

Fanen **Kjøretøy** viser hvor én stridsvogn, ett skip eller én soldat ble truffet, og av hvem. Bruk den til å se hvilken side av en stridsvogn som blir skutt, eller hvilken fiende som gjør skaden.

## Prøv det {#try-it}

1. Last inn en kamp som har treff (se tabellen under for hvilke spill som gir dem).
2. Åpne fanen **Kjøretøy** øverst.
3. Velg en enhet under **Kjøretøy**, for eksempel en stridsvogntype. Tallet i parentes er hvor mange treff den tok.
4. Les figuren: hvert merke er et treff, plassert der det traff.
5. Åpne **Hvem traff** for å se skytterne, våpnene eller skytterkjøretøyene, med treff, skade, drap og avstand.

![Kjøretøy-fanen: en demostridsvogn med treffmerker, og Hvem traff åpen](../assets/img/en/hit-analysis-tank.webp)

Hvis ingenting er lastet inn, eller dataene ikke har treff på kjøretøy, sier fanen hva som mangler og hvilken konverter du skal bruke.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

Figuren viser treffene der dataene gir et punkt eller en kroppsdel. Oppdelingen (hvem som traff, med hva, hvor hardt, fra hvor langt) virker for alle kilder.

## Hva hver kilde gir {#what-each-source-gives}

| Kilde | Punkt på enheten | Skytter | Våpen | Skade / utfall |
|---|---|---|---|---|
| War Thunder | ja, i enhetens ramme, med skuddets retning | ja | skytterens kjøretøy | kritisk, alvorlig, moduler ødelagt, dødelig skudd |
| CS2 | kroppsdel (hitgroup) | ja | ja | skade, panser, gjenværende helse |
| World of Tanks | ja (komponentboks, inngang og utgang) | ja | - | skade, eller ingen (avpreller, ingen gjennomslag) |
| World of Warships | ja, i skipets ramme | ja | treffype | - |
| Squad | kjøretøy: ja – nedslaget plassert i kjøretøyets ramme fra dets egen posisjon og kurs | nei (dataene navngir ingen) | skadetypen | fallet i kjøretøyets helse på det øyeblikket, ødelagt |
| Squad-soldater | nei: treffresultatene (ben og nedslagspunkt) beholdes rå av konverteren; rader `impact` med `hitBone` leses så snart den skriver dem | | | sår og dødsfall bare |
| Arma (OCAP, Arma 3-opptakeren) | nei: OCAP registrerer hvem som traff eller drepte hvem, med hva, fra hvor langt, ikke hvor | ja | ja | treff eller drap, avstand |
| Tacview ACMI | ja der et våpenobjekt slutter innen 30 m fra en enhet (ikke utskytningsrøret): dets siste sted i enhetens ramme (kurs, stigning, rulling), og kommer den veien det fløy | våpenets `Parent` | våpenets navn, eller en Timeouts AmmoType | Timeouts Outcome, fall i `Health`, `Destroyed`; uten våpen, et drap eller en skade uten et punkt |
| IL-2-telemetri (Watcher) | ja: `hit`- / `damage`-hendelser bærer punktet i spillerens eget flys ramme (tatt som x forover, y opp, z høyre) | nei | nei | styrken |
| Dota 2 | nei: kamploggen har ingen plass på en helt | den angripende enheten | evnen eller gjenstanden (ingen: et angrep) | skade, heltens død |
| Battlefield 6 (GameCapture) | nei: opptaket leser drapsfeeden (drap, dødsfall, hodeskuddsflagg), ikke treff | | | |
| DCS / andre Watcher-direktekilder | ingen treffhendelser utover det Tacview-opptakene deres inneholder | | | |

Der ingen treff på enheten har et punkt, viser figuren ingen merker, og oppdelingen **Hvem traff** åpnes av seg selv: etter skytter, våpen eller skytterens kjøretøy, hver med sine treff, skade og drap, og medianen og lengste avstand.

## Begrens til et område {#restrict-to-an-area}

Delen **Område** begrenser analysen til treff som skjedde på et sted på kartet.

1. Trykk **Tegn rektangel** eller **Tegn polygon**, og tegn på bakken i 3D eller på det taktiske kartet.
2. Velg **Offer innenfor** (tell et treff når enheten som ble truffet var i området) eller **Skytter innenfor** (når den som skjøt var der).
3. Trykk **Bruk dem som filter**. Brikkene viser «{n} av {total} treff i området».
4. **Tilbakestill område** fjerner alle områder.

Hvert område er et [volum](volumes.md), så de samme formene filtrerer også varmekartet og reprisen. Et område kan inkludere eller ekskludere (et ekskluderende område later treffene sine ligge utenfor, vist som «{n} av {total} treff utenfor området»). Hvert område vises som en brikke med hvor mange av enhetens treff som var i det; × på en brikke fjerner den. Tellingene, figuren, oppdelingen og filterlistene følger alle med.

Et treffs steder: radene det kom fra holder den ene partens (offerets for et skadet eller et truffet, skytterens for et skudd); den andres er den enhetens egen måling nærmest i tid (innen 5 s). Et treff der partens sted ikke er kjent, blir utelatt mens et område filtrerer, og panelet sier hvor mange («Utelatt, ingen kjent plassering»).

## For utviklere {#for-developers}

Enhver konverter kan legge til treff: en rad for offeret (`hit`, `impact`, `hurt`, `wounded`) med `hitBone` (et skjelettben, et Arma-utvalg, en Reforger-treffsone – kartlagt til hode, bryst, mage, armer og ben) eller `hitLocalX/Y/Z` (meter, x forover, y opp, z høyre), med `other` som skytteren og `damage`.
