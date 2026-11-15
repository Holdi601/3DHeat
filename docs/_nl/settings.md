---
title: "Instellingen, eenheden en toetsen"
nav_order: 16
lang: "nl"
source: "settings.md"
source_hash: "f25e4cbaf3bb"
translated: true
outdated: false
---

# Instellingen, eenheden en toetsen

De kleine bedieningen bovenaan de zijbalk bepalen hoe de viewer met je praat: de taal, de eenheden (meters of voet, km/h of knopen) en een helpmodus die de kleuren uitlegt. Je keuzes worden onthouden in je browser.

## De kop {#the-header}

Bovenaan de zijbalk:

| Bediening | Wat het doet |
|---|---|
| **?** | Helpmodus: wat elke kleur betekent (ook `?` of `F1`) |
| Menu **Eenheden** | Metrisch, Imperiaal, Luchtvaart of Scheepvaart |
| Knop **...** naast **Eenheden** | Opent "Kies een eenheid voor elke grootheid": één keuzelijst per grootheid |
| Menu **Taal** | De taal van de viewer: [40 talen](languages.md), of die van de browser |

![De kop met het menu Eenheden en het venster eenheid per grootheid open](../assets/img/nl/settings-units.webp)

Getallen die je in een vak typt, mogen een punt of een komma gebruiken (`0.35` of `0,35`). De viewer leest beide en toont getallen zoals de taal van de viewer ze schrijft.

## Eenheden {#units}

1. Kies een voorinstelling in het menu **Eenheden**. Alle grootheden schakelen samen.
2. Om maar één grootheid te wijzigen, klik je op de knop **...** ernaast en kies je een eenheid voor die grootheid. Het menu zet daarna een `*` achter de voorinstelling.
3. Een grootheid die je niet hebt ingesteld volgt de voorinstelling. Kies "Volgens voorinstelling" om terug te gaan.

| Grootheid | Metrisch (standaard) | Imperiaal | Luchtvaart | Scheepvaart |
|---|---|---|---|---|
| Afstand | km | mi | NM | NM |
| Hoogte, lengte | m | ft | ft | m |
| Snelheid | km/h | mph | kt | kt |
| Verticale snelheid | m/s | ft/min | ft/min | m/s |
| Temperatuur | °C | °F | °C | °C |
| Druk | hPa | inHg | hPa | hPa |
| Massa, brandstof | kg, l | lb, gal | lb, gal | t, m³ |
| Hoek | graden | graden | graden | graden |

Andere eenheden die je voor één grootheid kunt kiezen: afstand km, mi, NM; snelheid km/h, m/s, kt, mph; verticale snelheid m/s, ft/min, m/min; temperatuur °C, °F, K; druk hPa, inHg, mmHg, psi; massa kg, lb, t; hoek graden of NAVO-mils (6400 op de cirkel). De eenheden zijn overal in de viewer gelijk: labels, kaartjes, grafieken, statistieken.

## Helpmodus {#help-mode}

![Helpmodus: wat de kleuren betekenen](../assets/img/nl/help.webp)

Druk op `?` of `F1`, of klik op de knop **?**. Die toont *Wat de kleuren betekenen*: legenda's voor de 3D-weergave, de warmteverlopen, teamkleuren, de kleuren van het niveau, de statuskleuren van de panelen, het wedstrijdpaneel en de raceweergave. Hij blijft aan tot je hem uitzet. Op het tabblad Match legt hij ook de kleuren van het wedstrijdpaneel uit.

![Helpmodus op het tabblad Match](../assets/img/nl/settings-help-match.webp)

## Wat de browser onthoudt {#what-the-browser-remembers}

Deze instellingen worden tussen bezoeken in je browser bewaard (er wordt niets ergens naartoe gestuurd):

- de taal, de eenheden en de helpmodus;
- de instellingen van de figuur, het symbool, het label, de camera en de tactische weergave van de replay;
- de afspeelsnelheid en spiegeling;
- bladwijzers per opname, volumes per dataset, doellagen;
- de instellingen van de externe AI (de sleutel alleen als je *Onthouden* aanvinkt).

Warmte-instellingen, filters en de modus beginnen bij elke keer laden opnieuw. De volledige, gegenereerde lijst: [Opgeslagen instellingen](ref-settings-storage.md).

## Toetsen die de viewer van de browser houdt {#keys-the-viewer-keeps-from-the-browser}

Een sessie met grote data kost tijd om te laden, dus de viewer voorkomt dat de browser die er per ongeluk weggooit:

- `Ctrl`/`Cmd` + letters die zouden afdrukken, opslaan, openen, herladen, sluiten of nieuwe vensters openen doen niets buiten tekstvakken; `F1`, `F3`, `F5`, `F6` en `F7` doen niets.
- Sluiten of herladen van het tabblad met geladen data of een niveau vraagt eerst om bevestiging.
- Op volledig scherm vergrendelt de viewer de toetsen die hij gebruikt (W, T, N, S, R, P, Q, Esc), zodat de browser ze niet overneemt.

De exacte lijst: [Toetsen in de browser](ref-browser-keys.md). Alle eigen toetsen van de viewer: [Referentie toetsenbord en muis](keyboard-reference.md).
