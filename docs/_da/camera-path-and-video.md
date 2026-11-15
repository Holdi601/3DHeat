---
title: "Kamerabane og video"
nav_order: 15
lang: "da"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kamerabane og video

Lav en film af dine data: du placerer kameraet få steder, og viseren flyver mellem dem og gemmer en video. Hvert billede er meget rent, uden korn. Kameraet og afspilningshovedet bevæger sig sammen, så det samme panel laver en timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Lav en flyvning {#make-a-flythrough}

1. Flyv hen til, hvor filmen starter, og tryk på **Tilføj nøglebillede her** i **Kamerarute og rendering**.
2. Flyv til det næste sted, og tryk igen. Gentag for hvert stop.
3. Sæt **Forhåndsvis langs ruten** til og træk i **Position langs ruten** for at tjekke bevægelsen.
4. Sæt **Varighed** (hvor lang videoen er). En bevægelse, der er rigtig, men for hurtig, behøver kun en længere varighed.
5. Tryk på **Render video**. Vent på fremskridtslinjen; filen hentes, når den er færdig.

![Panelet Kamerarute og rendering med tre nøglebilleder, Blød interpolation, 12 s, 30 fps og 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Nøglebilleder {#keyframes}

| Indstilling | Virkning |
|---|---|
| **Tilføj nøglebillede her** | Tilføjer kameraets nuværende position, gir, hældning og synsfelt som et nøglebillede. |
| **Ryd** | Fjerner alle nøglebilleder. |
| Nøglebilleder-listen | En række pr. nøgle: dens nummer (klik for at flyve kameraet derhen, og synsfeltet sættes også), position, `gir° / hældning°`, og **×** for at fjerne den. |

Nøgler fordeles **jævnt** langs en normaliseret baneakse fra 0 til 1, hver gang en tilføjes eller fjernes; varigheden for output strækker så hele bevægelsen, så et skud, der er rigtigt, men for hurtigt, kun behøver en længere varighed. Gir pakkes ud mellem nøglerne, så kameraet drejer den korte vej.

Uden nøglebilleder holder en render det nuværende kamera stille i hele klippet - en helt god timelapse.

## Baneindstillinger {#path-settings}

| Indstilling | Standard | Interval (skyder) | Betydning |
|---|---|---|---|
| **Interpolation** (2+ nøgler) | *Blød* | *Blød* / *Lige* | *Blød*: en kubisk Hermite-kurve gennem nøglerne med tangenter fra de tilstødende nøgler, så hastigheden passer ved hver nøgle, og der ikke er noget ryk, hvor segmenter mødes. *Lige*: rette linjer mellem nøglerne, forudsigelige, med et synligt hjørne ved hver nøgle. Synsfeltet interpoleres altid lineært. |
| Rejselinje (2+ nøgler) | | | `N enheder rejse - M pr. sekund ved denne varighed`, eller en note om at nøglerne alle står ét sted. |
| **Forhåndsvis langs ruten** (1+ nøgler) | fra | | Styrer visningskameraet fra banen og flytter afspilningshovedet med, som renderingen gør, så bevægelsen kan bedømmes, før den renderes. |
| **Position langs ruten** (mens du forhåndsviser) | 0 % | 0-100 % | Hvor på banen der forhåndsvises. |
| **Varighed** | 12 s | 1-120 s (3600) | Videoens længde. |
| **Billedfrekvens** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logaritmisk (400) | Varmegradienter bliver stribede ved lav bitrate: der er få detaljer, en codec kan skjule fejl bag. |
| **Ventegrænse for konvergens** | 240 billeder | 2-600 (10.000) | Det længste et outputbillede må vente på at blive eksakt. Billeder, der rammer grænsen, skrives stadig og tælles. |
| Oversigt | | | `N billeder · vindue: kumulativt/fast/levetid`, og når tidslinjen er i Alle-tilstand: *(renderingen skifter Alle til Afspil, så afspilningshovedet betyder noget)*. |
| **Render video** / **Annullér** | | | Starter renderingen; mens den kører, vises `billede i / n · ventet w · X MB` og hvor mange billeder der ikke var eksakte. Kræver et datasæt. |

## Tips {#tips}

- Outputstørrelsen er lærredets størrelse i enhedspixels (skærmens pixelforhold, højst 2). Ændr browservinduets størrelse for at ændre den.
- En kumulativ historik bygger varmen op over klippet; et vindue eller en levetid viser et bevægeligt udsnit af tiden.
- Nøglepositioner er visningskoordinater: med en [invertet verdensakse](camera.md#invert-world-axis) peger nøgler, der blev lavet før skiftet, et andet sted efter.

## For udviklere {#for-developers}

### Hvad en render gør {#what-a-render-does}

1. Tager en testoptagelse af billedet for at finde den eksakte outputstørrelse i enhedspixels.
2. Vælger en codec via WebCodecs: **VP9** (`vp09.00.10.08`), ellers **VP8**, med den valgte bitrate og billedfrekvens. Uden `VideoEncoder` stopper den med *Denne browser har ingen VideoEncoder - WebCodecs kræves for at skrive en video*; uden nogen af codecs: *Ingen understøttet videocodec (prøvede VP9, VP8)*.
3. Overtager de indstillinger, en render behøver: sætter afspilningen på pause, slår **adaptivt budget fra**, **progressiv forfining til** og spritebudgettet til 64M pr. billede (det adaptive budget beskytter billedfrekvensen, hvilket er det forkerte mål her: det ville læse hvert langsomt konvergerende billede som grund til at splatte færre rækker, hvilket kræver flere billeder at konvergere), og skifter tidslinjen fra **Alle** til **Afspil**. Historikindstillingen (kumulativ, vindue, levetid) lades være: en render skal være det, du så på, afspillet igennem og skrevet ned.
4. For hvert outputbillede *f* af *n*, ved *u* = f / (n - 1):
   - placerer kameraet i banens stilling ved *u* (hvis der er nøgler);
   - søger afspilningshovedet til den samme brøkdel *u* af tidslinjens interval (den valgte sessions spænd i boksreplay);
   - gennemtvinger et friskt skøn, selv når kameraet ikke flyttede sig - at arve det forrige billedes akkumulering ville efterlade et spøgelse af det forrige vindue;
   - venter billede for billede, til billedet er eksakt (alle kandidatrækker tegnet i ét billede, eller akkumuleringen færdig), op til ventegrænsen;
   - fanger det sammensatte billede og koder det, med et nøglebillede hvert 2. sekund af output, så filen kan søges i.
5. Samler billederne i en WebM-fil ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) med tidsstempler valgt ud fra billedfrekvensen - det vægtid, hvert billede tog, er uden betydning.
6. Gendanner budgettet, synsfeltet, tidslinjetilstanden, afspilningshovedet og om den spillede.
7. Henter videoen som `3dheat-<bredde>x<højde>-<billeder>f.webm` og melder `N billeder ved W×H, X MB - alle billeder eksakte`, eller hvor mange der ramte ventegrænsen.

**Annullér** stopper efter det aktuelle billede (*Render annulleret.*) og gendanner indstillingerne.
