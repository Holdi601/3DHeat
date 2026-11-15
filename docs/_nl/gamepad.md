---
title: "Gamepad en HOTAS"
parent: "Camera en bediening"
nav_order: 1
lang: "nl"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad en HOTAS

Je kunt de camera vliegen met een controller in Xbox-stijl in plaats van met het toetsenbord. Gebruik dat als je achterover wilt leunen en rond een grote scène wilt kijken. De invoer van de controller **komt bovenop** die van het toetsenbord, dus je kunt beide tegelijk gebruiken.

## Een controller aansluiten {#connect-a-controller}

1. Sluit de controller aan (of koppel hem).
2. Klik op de weergave en druk op een willekeurige knop op de controller. Browsers tonen een controller pas nadat die voor het eerst invoer heeft gegeven.
3. Open **Camera & scène → Gamepad**. De apparatenlijst toont hem met `●`.
4. Duw de linker stick om te vliegen, de rechter stick om te kijken. Als de camera wegdrijft terwijl de sticks in het midden staan, verhoog dan **Dode zone**.

Elk apparaat dat de browser op de standaardindeling van een gamepad aflegt, werkt. Een vliegstick of gashendel (HOTAS) wordt standaard genegeerd; zie hieronder.

## Toewijzing {#mapping}

| Bediening | Effect |
|---|---|
| Linker stick | Bewegen: vooruit/achteruit en zijwaarts |
| Rechter stick | Kijken: gieren en hellen, met *Kijksnelheid* graden per seconde bij volledige uitslag |
| `RT` / `LT` (analoog) | Omhoog / omlaag; bij de parallelle projectie in- / uitzoomen |
| `RB` (ingedrukt houden) | 6× sneller |
| `LB` (ingedrukt houden) | 15% snelheid |
| `A` (ingedrukt houden) | 3× sprint (combineert met RB/LB) |
| `Y` (indrukken) | De data in beeld brengen |

De knopnummers volgen de standaardindeling: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; sticks op assen 0-1 (links) en 2-3 (rechts).

## De instellingen van de gamepad {#the-gamepad-settings}

Onder **Camera & scène → Gamepad**. **Instellingen** / **Verbergen** opent of sluit de afstelbediening.

| Bediening | Standaard | Bereik (draaiknop) | Betekenis |
|---|---|---|---|
| **Ingeschakeld** | aan | | |
| Apparaatstatus | | | Elk aangesloten apparaat, `●` als het gevolgd wordt, `○` als niet, met *- geen XInput-pad, genegeerd* of *- geen XInput-pad, toch gebruikt* voor niet-standaardapparaten. Zonder apparaten: *Geen pad gevonden. Browsers tonen een controller pas nadat hij de eerste invoer heeft gestuurd - druk op een knop erop.* |
| **Apparaat gebruiken** | *Alleen XInput-pads (aanbevolen)* | | Wordt getoond wanneer een niet-standaardapparaat is aangesloten. Kies een apparaat op naam om het in plaats daarvan te volgen. |
| **Kijksnelheid** | 150°/s | 20-540 (5000) | Draaisnelheid bij volledige uitslag van de rechter stick. |
| **Dode zone** | 12% | 0-50% (95%) | Radiaal: een diagonale duw lekt nooit in één as alleen. Verhoog hem als de camera wegdrijft terwijl de sticks in het midden staan. |
| **Stickcurve** | x² | lineair (1) tot x⁴ (16) | Responsexponent na de dode zone: fijnere besturing dicht bij het midden, nog steeds volle snelheid aan de rand. |
| **Stick-Y omkeren** | uit | | |
| **Sticks wisselen** | uit | | Bewegen met de rechter stick, kijken met de linker. |

De vorming van de stick: bij uitslag *m* (de lengte van de stickvector) en dode zone *d* is de uitvoer ((m - d) / (1 - d)) ^ curve langs de richting van de stick, en 0 binnen de dode zone.

## Waarom standaard alleen standaardpads {#why-only-standard-pads-by-default}

De Gamepad-API meldt **elk** HID-apparaat met assen - vliegsticks, gashendels, pedalen, stuurwielen - en die staan niet in het midden. Een draaias of een gashendel staat op volledige uitslag als niemand hem aanraakt. Als stick gelezen, is dat een permanente invoer op volle snelheid die geen dode zone kan onderdrukken, en de camera draait vanzelf vanaf het moment dat de pagina laadt (en elke warmtemodus lijkt ook kapot, omdat een bewegende camera elk frame de opbouw opnieuw start).

Daarom wordt een apparaat alleen gevolgd als de browser `mapping: "standard"` meldt, de manier van de browser om te zeggen "een pad in XInput-stijl met de assen waar je ze verwacht". Andere apparaten worden vermeld en als genegeerd gemarkeerd, en **Apparaat gebruiken** kiest er expliciet één - bijvoorbeeld om de camera met een HOTAS te vliegen. Zodra een pad wordt gevolgd, blijft de camera daarbij, zodat twee controllers niet om de camera vechten afhankelijk van de volgorde van opsomming.

**HOTAS:** alleen assen 0-3 (twee sticks) en de standaardknoppen worden gelezen. Een gashendel of pedalen op andere assen doen niets, en een stick of gashendel waarvan de assen niet in het midden staan, heeft mogelijk een grotere **Dode zone** nodig.

Browsers verbergen een controller tot die zijn eerste invoer heeft gestuurd; een aangesloten pad dat niet is aangeraakt, bestaat voor de pagina dus nog niet.
