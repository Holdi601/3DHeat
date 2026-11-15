---
title: "Kolomtoewijzing"
parent: "Gegevens binnenhalen"
nav_order: 2
lang: "nl"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Kolomtoewijzing

Een bestand is een tabel, en 3DHeat moet weten welke kolom de positie oost-west bevat, welke de tijd, welke de naam van de speler, enzovoort. Dit paneel laat zien wat het gegist heeft, en hier corrigeer je een verkeerde gok.

![Het paneel Kolomtoewijzing na het laden van een Parquet-bestand: elk vak al ingevuld - 1 X, 2 Y, 3 Z, 4 Tijd, 5 Persoons-ID, 6 Sessie / match, 7 Team / groep](../assets/img/en/column-mapping-panel.webp)

*Het bestand heeft zijn eigen kolommen benoemd, dus elk vak is al ingevuld.*

Een CSV met de kop `x,y,z,t,player,team` wijst zichzelf toe: x, y en z worden de positie, `t` de tijd, `player` de [persoon](glossary.md) en `team` de [groep](glossary.md).

Nadat bestanden gekozen zijn, opent het paneel **Kolomtoewijzing** onder het paneel Bron. Het zegt welke kolom welke rol speelt. Het wordt automatisch ingevuld, en elk veld kan veranderd worden voordat je op **Laden** drukt; de toewijzing wordt op het moment van laden gelezen, dus veranderen ervan daarna betekent opnieuw laden.

## De velden {#the-fields}

Alle kolommenmenu's tonen elke kolom van het eerste bestand, plus *- geen -*.

| Veld | Rol | Opmerkingen |
|---|---|---|
| **Scheidingsteken** | Alleen CSV: het veldscheidingsteken. | Menu: *Komma ,*, *Puntkomma ;*, *Tab*, *Pijp \|*, *Spatie*; of typ elk enkel teken in *of typ één teken*. Wordt automatisch herkend (zie hieronder). Wijzigen draait de automatische toewijzing opnieuw, dus eerdere wijzigingen gaan verloren. |
| **X**, **Y**, **Z** | Positie. | Minstens twee zijn nodig; een niet-toegewezen derde as is 0 (de data ligt op een vlak). Dezelfde kolom op twee assen is een fout. |
| **Opwaartse as in de bron** | Welke bronas omhoog wijst. | *Z is omhoog (de meeste game-engines)* of *Y is omhoog (grafische conventie)*. Zie [Assen, eenheden en tijd](axes-units-and-time.md). |
| **Eenheidsschaal** | Vermenigvuldigt elke positie. | Knoppen *1 (m)* en *0,01 (cm→m)*, of typ een waarde. |
| **Keer X om / Keer Y om / Keer Z om** | Keert een bronas om. | Toegepast op posities en op kijkrichtingvectoren. |
| **Tijd** | De tijdas. | Optioneel. Zonder die is er geen tijdlijn. |
| **Tijdseenheid** | Hoe de tijdkolom gelezen wordt. | Zeven eenheden; zie [Assen, eenheden en tijd](axes-units-and-time.md#time). Genegeerd bij Parquet-kolommen `TIMESTAMP`/`DATE`, wat het paneel zegt. |
| **Persoons-ID** | Wie of wat bij een rij hoort. | Optioneel. Maakt sporen, levensduren, boxreplay en lijnwarmte mogelijk. |
| **Sessie / match** | Welke match, raid, ronde, run of rondje bij een rij hoort. | Optioneel. Posities worden nooit geïnterpoleerd, nagesleept of over een sessiegrens heen tot een route verbonden. Zie [Sessies, personen en groepen](sessions-persons-groups.md). |
| **Team / groep** | Elke kolom met weinig verschillende waarden. | Optioneel. Stuurt de groepskleuren, teamwarmte en de verschilverdeling per groep. |
| **Kijkrichting** | *Geen*, *Gier-/stampkolommen* of *Richtingsvectorkolommen*. | Met gier/stamp: **Gierhoek**, **Stamphoek** en **Hoekeenheid** (*Graden* / *Radialen*). Met een vector: **Richting X**, **Richting Y**, **Richting Z**. Gebruikt voor de kijkstralen van [boxreplay](box-replay.md). |
| **Bewaren om te filteren** | Extra kolommen die in het geheugen blijven. | Een vinkje per kolom, en voor elk aangevinkt een *bereik* (numeriek) of *categorie*. Elk kost 4 bytes per rij en een decodeerronde bij het laden. Alleen bewaarde kolommen kunnen [gefilterd](filters.md) worden, gebruikt voor een [verschilverdeling](difference.md) of als gebeurteniskolom van [lijnwarmte](line-heat.md). |
| **Voorbeeldrijen tonen** | Een tabel met de eerste 12 gesamplede rijen, alle kolommen. | Om de gissingen te controleren. |

Een aangevinkte filterkolom die niet expliciet ingesteld is, wordt als *bereik* gelezen; een id-kolom die numeriek lijkt, is vaak nuttiger als *categorie*. Er kunnen maar 4 filters tegelijk actief zijn ([Filters](filters.md)).

## Hoe de automatische toewijzing gist {#how-the-auto-mapping-guesses}

Het gissen zit in [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Het kijkt naar kolomnamen, naar welke kolommen numeriek zijn in de gesamplede rijen (meer dan 90% van de niet-lege waarden leest als getal), naar hoeveel verschillende waarden elke kolom in het sample heeft, en naar de logische Parquet-typen. Naampatronen worden in volgorde geprobeerd, zonder hoofdlettergevoeligheid, en het eerste patroon dat een nog vrije kolom vindt, wint.

### Positie {#position}

| As | Naampatronen, in volgorde (alleen numerieke kolommen) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Als een as nog leeg is, vullen de eerste overgebleven numerieke kolommen (zonder `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) hem in volgorde. Een verkeerde gok is op het scherm duidelijk; een lege as zou een leeg beeld geven.

### Tijd {#time}

- **Eerst de Parquet-tijdstempelkolommen.** Van de kolommen waarvan het logische type `TIMESTAMP` of `DATE` is, wordt de beste gekozen op score: +10.000 als de naam een tijdpatroon past, -5.000 voor een gewone `DATE`, plus het aantal verschillende waarden in het sample. Een datum voor de hele dag en een vaste sessiestart hebben bijna geen verschillende waarden, dus wint het moment van de gebeurtenis. De eenheid is dan *Unix-tijdstempel (ms)*.
- **Anders op naam:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, daarna namen van verstreken tijd (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). De eenheid wordt dan uit de waarden geschat: ISO-8601 als een waarde eruitziet als `JJJJ-MM-DDT…` of `JJJJ-MM-DD …`; anders naar de grootste grootte: boven 10^17 nanoseconden, boven 10^14 microseconden, boven 10^11 Unix-milliseconden, boven 10^8 Unix-seconden, boven 10^6 milliseconden, anders seconden.

Als een kolom met verstreken tijd gekozen wordt, merkt het paneel op dat elke sessie dan op haar eigen begin wordt uitgelijnd - goed om matches over elkaar te leggen, niet om ze in echte volgorde te zien.

### Sessie, persoon, groep {#session-person-group}

De sessie wordt **na** de tijdas en **vóór** persoon en groep geclaimd, omdat een sessiekolom vaak een tijdstempel is (het startmoment van de match op elke rij van de match).

| Rol | Naampatronen, in volgorde |
|---|---|
| Sessie | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (elk precies, eventueel met `_id`) |
| Persoon | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, daarna `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (racedata: de auto is wat beweegt) |
| Groep | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Groep, terugval | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Een groepskandidaat die op de meeste gesamplede rijen een andere waarde heeft (meer dan max(48, 60% van het sample)) is een id, geen groep: hij wordt de persoonskolom als er geen gevonden werd, en niet als groep gebruikt. Als er helemaal geen groepskolom gevonden werd, wordt de niet-numerieke kolom met de minste verschillende waarden tussen 2 en 12 gebruikt.

### Kijkrichting {#look-direction}

Een numerieke kolom met de naam `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` of `rot_z` / `rotation_z` zet de kijkrichting op gier/stamp; stamp wordt gezocht als `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Graden worden aangenomen als een gesamplede gier boven 7 in grootte uitkomt, anders radialen. Een richtingsvector wordt nooit geraden; die komt uit de hints hieronder of van jou.

### Filterkolommen {#filter-columns}

Er worden automatisch hoogstens **6** kolommen bewaard, gerangschikt:

1. `region`, `sessionMode`, `actor` - kolommen die bestaan om op te filteren (score 1200);
2. categoriekolommen die in het sample variëren, met de minste verschillende waarden eerst (1000 min het aantal);
3. een kolom die in het sample constant is, maar alleen als er meerdere bestanden geladen zijn - ze kan per bestand verschillen, zoals een regio of een testrun-id (600);
4. numerieke kolommen (500).

Kolommen die al een rol spelen, de hierboven genoemde ruisnamen, kolommen die bij een load van één bestand constant zijn, en vrije-tekstkolommen (meer dan max(16, de helft van het sample) verschillende waarden) worden niet automatisch aangeboden. Elke kolom kan nog steeds met de hand aangevinkt worden.

### Opwaartse as {#up-axis}

Met alle drie de assen toegewezen wordt de as met de kleinste spreiding van Y en Z in het sample als omhoog genomen (een kaart is veel breder dan hoog); anders wordt Z-omhoog aangenomen.

## De `heat3d`-hints in een Parquet-voet {#the-heat3d-hints-in-a-parquet-footer}

Een Parquet-bestand kan zeggen hoe het gelezen moet worden. Als de sleutel/waarde-metadata van de voet van het bestand een item met de sleutel **`heat3d`** heeft, wordt de waarde als JSON geparseerd en over de gissingen heen gelegd ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). De CS2-democonverter schrijft zo'n item, dus zijn tabellen openen met de speler als persoon, de kant als groep, elke ronde als sessie, kijkrichting aan, en de wereld met de goede kant boven.

Alleen het **eerste** bestand van een selectie wordt voor hints gelezen. Elk item is optioneel, en elke gegeven waarde verschijnt nog steeds in het paneel en kan veranderd worden. Een volledige beschrijving van het schema, met een voorbeeld en hoe je het schrijft, staat in de [Referentie gegevensformaten](data-formats.md#the-heat3d-hints).

De regels, kort:

- Een kolom die door een hint genoemd wordt, wordt alleen toegepast als het bestand die kolom heeft.
- `lookMode: "vector"` werkt alleen als `dirX`, `dirY` en `dirZ` alle drie gezet zijn; `"yawPitch"` alleen als `yaw` gezet is.
- `extra`, als die er is, vervangt de automatische filterlijst (onbekende namen en kolommen die al een rol spelen, vallen weg); het bereik/categorie-type van elk volgt of het numeriek leek. Als hij ontbreekt, blijft de automatische lijst behouden, min elke kolom die een hint een rol gaf.
- `axes.up` moet `"y"` of `"z"` zijn, keer-omen moeten booleans zijn, `scale` moet positief zijn.
- `entity.size`, als die positief is, is de grootte van één gevolgd ding in de eenheden van het bestand ([entiteitsgrootte](sessions-persons-groups.md#entity-size)); het is de enige manier om hem te zetten.

## Bekend probleem: het CSV-scheidingsteken overschrijven {#known-issue-overriding-the-csv-separator}

Als je het scheidingsteken verandert in een ander dan het herkende, verandert de kolomlijst en de voorbeeldrijen niet (het voorbeeld splitst nog steeds met het herkende scheidingsteken). Het gekozen scheidingsteken wordt wel gebruikt voor het laden zelf. Als het herkende scheidingsteken fout is:

1. Open het bestand in een teksteditor.
2. Vervang het scheidingsteken overal door een komma (en decimale komma's door punten).
3. Sla op en laad het bestand opnieuw.

De oorzaak zit in [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
