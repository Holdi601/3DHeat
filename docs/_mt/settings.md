---
title: "Settings, unitajiet u ċwievet"
nav_order: 19
lang: "mt"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Settings, unitajiet u ċwievet

Il-kontrolli ċkejkna fuq nett tas-sidebar jibdlu kif il-viewer jitkellem miegħek: il-lingwa, l-unitajiet (metri jew piedi, km/h jew nodi) u modalità tal-għajnuna li tispjega l-kuluri. L-għażliet tiegħek jinftakru fil-browser tiegħek.

## Il-header {#the-header}

Fil-quċċata tas-sidebar:

| Kontroll | X'jagħmel |
|---|---|
| **?** | Modalità tal-għajnuna: x'tfisser kull kulur (ukoll `?` jew `F1`) |
| Menu **Unitajiet** | Metriku, Imperjali, Avjazzjoni jew Nawtiku |
| Buttuna **...** ħdejn **Unitajiet** | Tiftaħ "Agħżel unità għal kull kwantità": drop-down wieħed għal kull kwantità |
| Menu **Lingwa** | Il-lingwa tal-viewer: [40 lingwa](languages.md), jew dik tal-browser |

![Il-header bil-menu Unitajiet u t-tieqa unità-għal-kull-kwantità miftuħa](../assets/img/en/settings-units.webp)

In-numri li tiktibhom f'kaxxa jistgħu jużaw jew punt jew virgola (`0.35` jew `0,35`). Il-viewer jaqra t-tnejn u juri n-numri kif tikteb il-lingwa tal-viewer.

## Unitajiet {#units}

1. Agħżel preset fil-menu **Unitajiet**. Il-kwantitajiet kollha jinbdlu flimkien.
2. Biex tbiddel kwantità waħda biss, ikklikkja l-buttuna **...** ħdejha u agħżel unità għal dik il-kwantità. Il-menu mbagħad juri `*` wara l-preset.
3. Kwantità li ma ssettjajtx tisegwi l-preset. Agħżel "Bħas-sett" biex terġa' lura.

| Kwantità | Metriku (bażi) | Imperjali | Avjazzjoni | Nawtiku |
|---|---|---|---|---|
| Distanza | km | mi | NM | NM |
| Għoli, tul | m | ft | ft | m |
| Veloċità | km/h | mph | kt | kt |
| Veloċità vertikali | m/s | ft/min | ft/min | m/s |
| Temperatura | °C | °F | °C | °C |
| Pressjoni | hPa | inHg | hPa | hPa |
| Massa, fjuwil | kg, l | lb, gal | lb, gal | t, m³ |
| Angolu | gradi | gradi | gradi | gradi |

Unitajiet oħra li tista' tagħżel għal kwantità waħda: distanza km, mi, NM; veloċità km/h, m/s, kt, mph; veloċità vertikali m/s, ft/min, m/min; temperatura °C, °F, K; pressjoni hPa, inHg, mmHg, psi; massa kg, lb, t; angolu gradi jew mils NATO (6400 għaċ-ċirku). L-unitajiet huma l-istess kullimkien fil-viewer: tikketti, kards, grafiċi, statistika.

## Modalità tal-għajnuna {#help-mode}

![Modalità tal-għajnuna: x'tfisser il-kuluri](../assets/img/en/help.webp)

Agħfas `?` jew `F1`, jew ikklikkja l-buttuna **?**. Turi *X'tfisser il-kuluri*: legends għall-veduta 3D, ir-rampi tas-sħana, il-kuluri tat-timijiet, il-kuluri tal-livell, il-kuluri tal-istatus tal-pannelli, il-pannell tal-partita u l-veduta tat-tellieqa. Tibqa' attiva sakemm titfiha. Fit-tab Partita tispjega wkoll il-kuluri tal-pannell tal-partita.

![Modalità tal-għajnuna fit-tab Partita](../assets/img/en/settings-help-match.webp)

## Dak li l-browser jiftakar {#what-the-browser-remembers}

Dawn is-settings jinżammu fil-browser tiegħek bejn żjara u oħra (xejn ma jintbagħat xi post ieħor):

- il-lingwa, l-unitajiet u l-modalità tal-għajnuna;
- is-settings tal-figura, is-simbolu, it-tikketti, il-kamera u l-wiri taktiku tar-replay;
- il-veloċità tal-playback u l-immirar;
- il-markaturi għal kull reġistrazzjoni, il-volumi għal kull dataset, is-saffi tal-għanijiet;
- is-settings tal-AI esterna (iċ-ċavetta biss jekk tiċċekkja *Ftakar*).

Is-settings tas-sħana, il-filtri u l-modalità jibdew mill-ġdid f'kull tagħbija. Il-lista sħiħa, iġġenerata: [Settings maħżuna](ref-settings-storage.md).

## Ċwievet li l-viewer iżomm mill-browser {#keys-the-viewer-keeps-from-the-browser}

Sessjoni b'data kbira tieħu żmien biex titħabbar, għalhekk il-viewer iwaqqaf lill-browser milli jitfgħha bi żball:

- `Ctrl`/`Cmd` + ittri li kieku jistampaw, jiffrankaw, jiftħu, jerġgħu jitħabbru, jagħlqu jew jiftħu tieqa ġdida ma jagħmlu xejn barra mill-kaxxi tal-kitba; `F1`, `F3`, `F5`, `F6` u `F7` ma jagħmlu xejn.
- Jekk tagħlaq jew terġa' tgħabbi t-tab b'data jew livell mgħobbi, jistaqsi l-ewwel.
- Fil-iskrin sħiħ il-viewer jaqfel iċ-ċwievet li juża (W, T, N, S, R, P, Q, Esc), sabiex il-browser ma jieħdiex dawn.

Il-lista eżatta: [Ċwievet tal-browser](ref-browser-keys.md). Iċ-ċwievet kollha tal-viewer: [Referenza tat-tastiera u tal-maws](keyboard-reference.md).
