---
title: "Camerapad en video"
nav_order: 15
lang: "nl"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Camerapad en video

Maak een film van je data: je zet de camera op een paar plekken, de viewer vliegt ertussen en slaat een video op. Elk frame is heel schoon, zonder korrel. De camera en de afspeelkop bewegen samen, dus hetzelfde paneel maakt een timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Een vlucht maken {#make-a-flythrough}

1. Vlieg naar waar de film begint en druk op **Hier keyframe toevoegen** in **Camerapad & renderen**.
2. Vlieg naar de volgende plek en druk er opnieuw op. Herhaal dat voor elke stop.
3. Vink **Voorvertoning langs het pad** aan en sleep **Positie langs het pad** om de beweging te controleren.
4. Stel de **Duur** in (hoe lang de video is). Een beweging die klopt maar te snel is, heeft alleen een langere duur nodig.
5. Druk op **Video renderen**. Wacht op de voortgangslijn; het bestand wordt gedownload als het klaar is.

![Het paneel Camerapad & renderen met drie keyframes, Vloeiende interpolatie, 12 s, 30 fps en 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Keyframes {#keyframes}

| Regelaar | Effect |
|---|---|
| **Hier keyframe toevoegen** | Voegt de huidige camerapositie, gier, stamp en gezichtsveld toe als keyframe. |
| **Wissen** | Verwijdert alle keyframes. |
| Lijst met keyframes | Eén rij per keyframe: het nummer (klik om de camera daarheen te vliegen, met ook het gezichtsveld), de positie, `gier° / stamp°`, en **×** om het te verwijderen. |

Keyframes worden **gelijkmatig** verdeeld langs een genormaliseerde padas van 0 tot 1 zodra er een wordt toegevoegd of verwijderd; de uitvoerduur rekt dan de hele beweging uit, dus een shot dat klopt maar te snel is, heeft alleen een langere duur nodig. De gier wordt tussen de keyframes ontvouwd, zodat de camera de korte kant om draait.

Zonder keyframes houdt een render de huidige camera voor de hele clip stil - een prima timelapse.

## Padinstellingen {#path-settings}

| Regelaar | Standaard | Bereik (schuifregelaar) | Betekenis |
|---|---|---|---|
| **Interpolatie** (2+ keys) | *Vloeiend* | *Vloeiend* / *Recht* | *Vloeiend*: een kubieke Hermite-curve door de keyframes met raakvectoren uit de buurkeyframes, zodat de snelheid bij elk keyframe aansluit en er geen schok is waar segmenten samenkomen. *Recht*: rechte lijnen tussen de keyframes, voorspelbaar, met een zichtbare hoek bij elk keyframe. Het gezichtsveld wordt altijd lineair geïnterpoleerd. |
| Reislijn (2+ keys) | | | `N eenheden reisafstand - M per seconde bij deze duur`, of een melding dat alle keyframes op dezelfde plek staan. |
| **Voorvertoning langs het pad** (1+ keys) | uit | | Stuurt de camera van het beeldvenster vanuit het pad, en verplaatst de afspeelkop mee zoals de render doet, zodat je de beweging kunt beoordelen voor het renderen. |
| **Positie langs het pad** (tijdens de voorvertoning) | 0% | 0-100% | Waar op het pad je voorvertoont. |
| **Duur** | 12 s | 1-120 s (3600) | Lengte van de video. |
| **Framerate** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logaritmisch (400) | Warmteverlopen krijgen bij lage bitrates banding: er is weinig detail waarachter een codec fouten kan verbergen. |
| **Wachtgrens voor convergentie** | 240 frames | 2-600 (10.000) | Het langst dat één uitvoerframe mag wachten om exact te worden. Frames die de grens raken, worden toch geschreven en geteld. |
| Samenvatting | | | `N frames · venster: cumulatief/vast/levensduur`, en als de tijdlijn in de modus Alles staat: *(de render zet Alles om naar Afspelen, zodat de afspeelkop iets betekent)*. |
| **Video renderen** / **Annuleren** | | | Start de render; terwijl hij loopt, toont hij `frame i / n · gewacht w · X MB` en hoeveel frames niet exact waren. Heeft een dataset nodig. |

## Tips {#tips}

- De uitvoergrootte is de canvasgrootte in apparaatpixels (de pixelverhouding van het scherm, begrensd op 2). Verander het formaat van het browservenster om hem te wijzigen.
- Een cumulatieve geschiedenis bouwt de warmte over de clip op; een venster- of levensduurgeschiedenis toont een bewegend stuk tijd.
- Keyframe-posities zijn schermcoördinaten: bij een [omgekeerde wereldas](camera.md#invert-world-axis) wijzen sleutels die vóór het omschakelen zijn gemaakt na het omschakelen ergens anders heen.

## Voor ontwikkelaars {#for-developers}

### Wat een render doet {#what-a-render-does}

1. Maakt een testopname van het frame om de exacte uitvoergrootte in apparaatpixels te leren.
2. Kiest een codec via WebCodecs: **VP9** (`vp09.00.10.08`), anders **VP8**, bij de gekozen bitrate en framerate. Zonder `VideoEncoder` stopt het met *Deze browser heeft geen VideoEncoder - WebCodecs is nodig om een video te schrijven*; zonder beide codecs met *Geen ondersteunde videocodec (geprobeerd VP9, VP8)*.
3. Neemt de instellingen over die een render nodig heeft: pauzeert het afspelen, zet **adaptief budget uit**, **progressieve verfijning aan** en het spritebudget op 64M per frame (het adaptieve budget beschermt de framesnelheid, wat hier het verkeerde doel is: het zou elk traag convergerend frame lezen als reden om minder rijen uit te smeren, wat meer frames nodig heeft om te convergeren), en zet de tijdlijn van **Alles** naar **Afspelen**. De geschiedenisinstelling (cumulatief, venster, levensduur) blijft zoals hij is: een render moet het zijn wat je aan het bekijken was, afgespeeld en vastgelegd.
4. Voor elk uitvoerframe *f* van *n*, bij *u* = f / (n - 1):
   - zet de camera op de houding van het pad bij *u* (als er keyframes zijn);
   - zoekt de afspeelkop naar hetzelfde deel *u* van het bereik van de tijdlijn (de duur van de gekozen sessie bij boxreplay);
   - forceert een verse schatting, ook als de camera niet bewoog - de accumulatie van het vorige frame overnemen zou een spook van het vorige venster achterlaten;
   - wacht, frame voor frame, tot het beeld exact is (alle kandidaatrijen in één frame getekend, of de accumulatie voltooid), tot de wachtgrens;
   - legt het samengestelde frame vast en codeert het, met een keyframe elke 2 seconden uitvoer zodat het bestand doorzoekbaar is.
5. Voegt de frames samen tot een WebM-bestand ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) met tijdstempels gekozen uit de framerate - de kloktijd die elk frame kostte doet er niet toe.
6. Herstelt het budget, het gezichtsveld, de tijdlijnmodus, de afspeelkop en of er werd afgespeeld.
7. Downloadt de video als `3dheat-<breedte>x<hoogte>-<frames>f.webm` en meldt `N frames op W×H, X MB - elk frame exact`, of hoeveel frames de wachtgrens raakten.

**Annuleren** stopt na het huidige frame (*Render geannuleerd.*) en herstelt de instellingen.
