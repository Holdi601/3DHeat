---
title: "Veel wedstrijden tegelijk"
parent: "Replay"
nav_order: 2
lang: "nl"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---

# Veel wedstrijden tegelijk

**Veel wedstrijden tegelijk** speelt veel wedstrijden bovenop elkaar af, zodat je ziet waar de spelers van elke wedstrijd gewoonlijk heen gaan. Gebruik het om honderden of duizenden wedstrijden in één beeld te vergelijken.

Elke wedstrijd begint bij zijn eigen begin en zijn eenheden bewegen als figuren. De bestanden gaan rechtstreeks de grafische kaart in en er wordt geen volledige tabel opgebouwd, dus het speelt soepel af waar een normale lading geheugen tekort zou komen.

![Tien tankwedstrijden over elkaar gelegd, één kleur per wedstrijd](../assets/img/nl/many-matches.webp)

## Zo gebruik je het {#how-to-use-it}

1. Open **Veel wedstrijden tegelijk** in de zijbalk Heatmap.
2. Druk op **Bestanden…** (kies veel bestanden), **Map…** (een map en haar submappen) of **Map toevoegen…** (toevoegen aan wat er geladen is).
3. De viewer schakelt over naar de figurenoverlay en begint bij het begin. Druk op **Afspelen**.

Elk bestand is één wedstrijd (of bevat er meerdere). Parquet-bestanden en [`.3dheat`](container.md)-containers werken. Een bestand heeft een positie-, een tijd- en een eenheidskolom nodig; kolommen voor naam, type en partij blijven bewaard. Andere bestanden, en de zijbestanden van converters (vlucht, berichten, gebeurtenissen, chat, doelen), worden overgeslagen. Voor een gewone tabel, zie [Gegevens binnenhalen](getting-data-in.md).

## Instellingen {#settings}

| Instelling | Wat het doet |
|---|---|
| **Per team** / **Per wedstrijd** | Kleur op partij, of een kleur per wedstrijd. |
| **Markeren waar eenheden stierven** | Een markering waar elke eenheid stierf, gedurende 10 s, 30 s, 120 s, of allemaal tot nu toe. |

Het paneel toont hoeveel wedstrijden, eenheden, rijen en posities zijn gelezen, het gebruikte geheugen en de laadtijd. *Ruimte voor* is hoeveel extra posities de grafische kaart nog aankan. *Figuren vanaf* is de grootte op het scherm waaronder een eenheid als klein pijltje wordt getekend in plaats van als zijn figuur.

Het uiterlijk van de figuren gebruikt dezelfde bedieningen als de [wedstrijdreplay](match-replay.md#figures): **Figuurgrootte**, **Kleinste figuur op het scherm** en **Op afstand**.

## Tips {#tips}

- Wanneer alles niet in het geheugen past, worden de posities uitgedund (alleen een positie elke paar meter wordt bewaard) en het paneel zegt dat.
- De warmtemodi werken ook op de data van de overlay.
- Voor statistieken over duizenden wedstrijden zonder ze te tekenen, zie [Massa-analyse](mass-analysis.md).
