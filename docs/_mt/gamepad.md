---
title: "Gamepad u HOTAS"
parent: "Kamera u kontrolli"
nav_order: 1
lang: "mt"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad u HOTAS

Tista' ttajjar il-kamera b'kontrollur bi stil Xbox minflok bit-tastiera. Uża dan meta trid tistrieħ u tħares madwar xena kbira. L-input tiegħu **iżid** ma' dak tat-tastiera, għalhekk tista' tuża t-tnejn fl-istess ħin.

## Qabbad kontrollur {#connect-a-controller}

1. Ħalli l-kontrollur jiġi mqabbad (jew agħmel pairing tiegħu).
2. Ikklikkja fuq il-view u agħfas kwalunkwe buttuna fuq il-kontrollur. Il-browsers juru kontrollur biss wara l-ewwel input tiegħu.
3. Iftaħ **Kamera u xena → Gamepad**. Il-lista tal-apparati turih bi `●`.
4. Imbotta l-istick tax-xellug biex ittajjar, l-istick tal-lemin biex tħares. Jekk il-kamera tiżvija bl-isticks f'nofshom, oħloq **Żona mejta** ogħla.

Kwalunkwe apparat li l-browser jorbot mal-layout standard tal-gamepad jaħdem. Flight stick jew throttle (HOTAS) jiġi injorat b'mod awtomatiku; ara hawn taħt.

## Mapping {#mapping}

| Kontroll | Effett |
|---|---|
| Stick tax-xellug | Moviment: 'l quddiem/lura u strafe |
| Stick tal-lemin | Ħarsa: yaw u pitch, bil-*Veloċità tal-ħarsa* gradi kull sekonda f'deflection sħiħ |
| `RT` / `LT` (analogu) | 'Il fuq / 'l isfel; fil-projezzjoni paralella, zoom in / zoom out |
| `RB` (miżmum) | 6× aktar mgħaġġel |
| `LB` (miżmum) | 15% tal-veloċità |
| `A` (miżmum) | 3× sprint (jiġi flimkien ma' RB/LB) |
| `Y` (aħfas) | Qiegħed l-view fuq id-dejta kollha |

In-numri tal-buttuni jsegwu l-layout standard: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; l-isticks fuq l-assi 0-1 (xellug) u 2-3 (lemin).

## Is-settings tal-Gamepad {#the-gamepad-settings}

Fi **Kamera u xena → Gamepad**. **Settings** / **Aħbi** jiftaħ il-kontrolli tal-ittunjar.

| Kontroll | Default | Firxa (jog) | Tifsira |
|---|---|---|---|
| **Attivat** | on | | |
| Status tal-apparat | | | Kull apparat imqabbad, `●` meta jkun segwit, `○` meta ma jkunx, b'*- not an XInput pad, ignored* jew *- not an XInput pad, used anyway* għal apparati mhux standard. Meta ma jkun hemm xejn: *No pad detected. Browsers only reveal a controller after it sends its first input - press a button on it.* |
| **Uża l-apparat** | *XInput pads only (recommended)* | | Jidher meta jkun imqabbad apparat mhux standard. Agħżel apparat bl-isem tiegħu biex issegwih minflok. |
| **Veloċità tal-ħarsa** | 150°/s | 20-540 (5000) | Ir-rata tad-dawran f'deflection sħiħ tal-istick tal-lemin. |
| **Żona mejta** | 12% | 0-50% (95%) | Radjali: Daqqa dijagonali qatt ma titlaq f'assi wieħed waħdu. Oġħlieha jekk il-kamera tiżvija bl-isticks f'nofshom. |
| **Kurva tal-istick** | x² | lineari (1) sa x⁴ (16) | L-esponent tar-rispons wara ż-żona mejta: kontroll aktar fin qrib iċ-ċentru, u xorta veloċità sħiħa fuq il-bord. |
| **Aqleb Y tal-istick** | off | | |
| **Aqleb l-isticks** | off | | Ittajjar bl-istick tal-lemin, u ħares bl-istick tax-xellug. |

Il-forma tal-istick: b'deflection *m* (it-tul tal-vettur tal-istick) u żona mejta *d*, l-output = ((m - d) / (1 - d)) ^ curve lungo id-direzzjoni tal-istick, u 0 ġewwa ż-żona mejta.

## Għalfejn bl-default biss gamepads standard {#why-only-standard-pads-by-default}

Il-Gamepad API jirrapporta **kull** apparat HID b'assi - flight sticks, throttles, pedals, wheels - u dawn ma jistrieħux fiċ-ċentru: assi tad-dawran jew levier tal-throttle jqgħod f'deflection sħiħ meta ħadd ma jmissu. Jekk jinqara bħala stick, huwa input permanenti b'veloċità sħiħa li l-ebda żona mejta ma tista' tgħatti, u l-kamera tduru waħedha mill-mument li tinfetaħ il-paġna (u kull mod tas-sħana jidher ħażin, għax kamera li timxi terġa' tibda l-akkumulazzjoni f'kull frame).

Għalhekk apparat jiġi segwit biss meta l-browser jirrapporta `mapping: "standard"`, il-mod tiegħu li jgħid "pad bi stil XInput bl-assi fejn tistenna". Apparati oħra jiġu elenkati u mmarkati bħala injorati, u **Uża l-apparat** jagħżel wieħed b'mod espliċitu - pereżempju biex tittajjar il-kamera b'HOTAS. Ladarba pad jiġi segwit, il-kamera tibqa' magħha, sabiex żewġ kontrolluri ma jiġġieldux fuq il-kamera skont l-ordni li jinstabu fiha.

**HOTAS:** jinqraw biss l-assi 0-3 (żewġ isticks) u l-buttuni standard. Throttle jew pedals fuq assi oħra ma jagħmlu xejn, u stick jew throttle li l-assi tiegħu ma jistrieħux fiċ-ċentru jista' jkollu bżonn **Żona mejta** akbar.

Il-browsers jaħbu kontrollur sakemm ikun bagħat l-ewwel input tiegħu, għalhekk pad imqabbad li ma ġiex immiss għadu ma jeżistix għall-paġna.
