---
title: "Sessiounen, Persounen a Gruppen"
parent: "Daten astellen"
nav_order: 4
lang: "lb"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sessiounen, Persounen a Gruppen

Eng **Persoun** ass ee Ding, dat sech beweegt (e Spiller, en Auto). Eng **Equipe/Grupp** ass d'Säit, zu där se gehéieren. Eng **Sessioun** ass ee Match oder eng Ronn. Kuckt de [Glossar](glossary.md).

Eng eenzeg Zeil an enger Datei kann all dräi nennen:

| x | y | Zäit | Spiller | Equipe | Match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` ass d'Persoun, `team` d'Grupp, `match` d'Sessioun.

Dräi optional Kolonnen beschreiwen, *wiem* a *an wéi enger Phase vun der Geschicht* eng Zeil gehéiert. All gëtt beim Lueden als Wäerterbuch kodéiert: d'Textwäerter ginn pro Zeil kleng Ganzzuel-IDen plus eng Lëscht vu Bezeechnungen, déi iwwer all Datei vum Lueden gedeelt ginn.

## Persoun {#person}

D'Kolonn **Persounen-ID** nennt d'Saach, déi sech beweegt, zu där eng Zeil gehéiert: e Spiller, e Bot, en Auto. Si gëtt als 32-Bit-ID pro Zeil gespäichert.

Mat enger Persoun- an enger Zäitkolonn rechent d'Lueden fir all Zeil d'**Liewensdauer** aus: d'Zäit bis zur nächster Probe vun der selwechter Persoun *an der selwechter Sessioun*, oder "keng" (en Zeechen, -1), wann et keng nächst Probe gëtt - d'Persoun ass gestuerwen, fort gaangen, oder de Log ass zu Enn. D'Liewensdauer dréit d'**Liewensdauer**-Geschicht vun der [Zäitlinn](timeline.md), d'Interpoléierung an d'Veraalterung bei [Box-Replay](box-replay.md), an d'Routebréch bei [Linn-Hëtzt](line-heat.md). Wat eng Zeil ohne Nofolger maacht, ass eng Usiichts-Astellung (*Réserv-Lieweszäit*), net an den Donnéeë fest.

All Persoun kritt d'Grupp vun hirer **éischter** Zeil an der Zäit; dës Zouweis faarft hir Këscht bei Box-Replay an entscheet, wéi eng Grupp-Sichtbarkeet se dort verstoppt. D'Hëtzt-Modi benotzen d'Grupp vun all Zeil selwer.

### Nimm, déi vu ville Saachen op eemol gedroe ginn {#names-worn-by-several-things-at-once}

E Numm ass net ëmmer ee Wiesen: an e puer Exporter lafen all Bot vun all Match ënner engem Numm. Zwou Proben vun esou enger "Persoun" ze verbannen - duerch Interpoléierung, eng Spuer oder eng Route - zitt eng Linn tëscht zwee verschiddene Wiesen iwwer d'Kaart.

Beim Lueden ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) gëtt en Numm als **gedeelt** markéiert, wann zwee Opzeechnungen dovun

- an der selwechter Sessioun sinn,
- déi selwecht Zäit hunn,
- vun der selwechter Aart sinn (all behalen Kategoriekolonn huet deeselwechte Wäert), an
- méi wéi 1 % vun der Diagonal vum Ausmooss vun den Donnéeën ausernee sinn.

Gedeelte Nimm ginn als eenzel Proben gemoolt - keng Interpoléierung, keng Spuer, keng Linn-Hëtzt-Route. Alles anescht iwwer si (hir Hëtzt) bleift onverännert. De Panel Datesaz listt op, wéivill Nimm markéiert goufen, mat bis zu dräi Beispiller, an de Box-Replay-Panel widderhëlt d'Zuel.

## Sessioun {#session}

D'Kolonn **Sessioun / Match** seet, zu wéiem Match, Raid, Ronn, Lauf oder Ronn eng Zeil gehéiert. Dat ass dat, wat d'Proben vun enger Persoun zu enger duerchgehender Spuer mécht: richteg Telemetrie verschränkt dacks gläichzäiteg Matcher, an eng Proufe vun engem Spiller direkt virum Playhead an déi direkt drop kënnen aus Matcher sinn, déi honnert Meter ausernee leien. Mat enger Sessiouns-Kolonn gilt:

- Interpoléierung, Spuren an Linn-Hëtzt-Routen goen ni iwwer e Sessiounswiessel;
- d'Liewensdauer vun enger Zeil endegt um Enn vun hirer eegener Sessioun;
- d'Auswiel **Sessioun** erscheint uewen an der Säitelëscht, ënner der Modusleescht.

Eng Sessiouns-Kolonn ass ganz oft e *Zäitstempel* - den Ufangsmoment vum Match, op all Zeil vum Match widderholl. Den Automatik-Zouweiser sicht dofir no Sessiounsnimm virun Persoun an Grupp ([Kolonnenzouweisung](column-mapping.md#session-person-group)). Eng Racing-Ronn oder e Stint ass och eng Sessioun: zwou Ronnen vum selwechten Auto dierfen net an eng Spuer zesummegeklebt ginn.

### D'Sessiounsauswiel {#the-session-picker}

![D'Sessiounsauswiel op engem Datei mat zéng Matcher opgemaach: All Sessiounen (10), Match 01, Match 02 an sou weider](../assets/img/en/sessions-persons-groups-picker.webp)

*Zéng Matcher an enger Datei: wielt ee aus oder kuckt se all.*

Gewisen, wann den Datesaz Sessiounen opgelëscht huet (kuckt d'Limit hei drënner).

| Deel | Bedeitung |
|---|---|
| Bezeechnung riets | D'Zuel vun de Zeilen vun der gewielter Sessioun, oder *all op eemol*. |
| Menü | *All Sessiounen (N)*, dann all Sessioun, déi meescht Aktivitéit als éischt, als `Bezeechnung - N Zeilen, Spann` (Spann a Sekonnen ënner 90 s, a Minutten ënner 90 min, a Stonnen doriwwer). |
| Brongen Hiweis | Gewisen bei *All Sessiounen*: Positiounen ginn trotzdem ni iwwer Sessiounen verbonnen, awer gläichzäiteg Matcher setzen onverbonnen Spiller zesummen op d'Kaart. |
| Hiweis | Gewisen an den Hëtzt-Modi, wann eng Sessioun gewielt ass: d'Auswiel réckelt nëmmen den Playhead. |

Beim Lueden gëtt déi aktivst Sessioun gewielt. Wann Dir eng Sessioun wielt, sprengt de Playhead op den Ufank vun där Sessioun.

Wat d'Auswiel ännert:

- Am **[Box-Replay](box-replay.md)** entscheet se, welch Sessioun gespillt gëtt: nëmmen déi Sessioun hir Këschten a Spuren ginn gemoolt, an d'Beräich vun der Zäitlinn gëtt déi eege Spann vun der Sessioun.
- An de **Hëtzt-Modi** beschränkt se d'Hëtzt net, an en Hiweis ënner der Auswiel seet dat: *An de Hëtzt-Modi réckelt dat nëmmen den Playhead op den Ufank vun der Sessioun; d'Hëtzt zielt weider all Sessiounen. Box-Replay spillt déi gewielte Sessioun eleng.* Fir d'Hëtzt op eng Sessioun ze beschränken, behalt d'Sessiouns-Kolonn och als Filterkolonn (*Fir ze filteren behalen*) an filtert drop. Eng Kolonn kann souwuel d'Sessiouns-Kolonn wéi och eng Filterkolonn sinn: de Lieser liest all ugekräizt Filterkolonn fir sech, egal welch aner Roll se och spillt.

### Ze vill Sessiounen {#too-many-sessions}

Bis zu **100 000** Sessiounen ginn opgelëscht. Doriwwer ass d'Kolonn eigentlech eng ID (e Dossier mat Millioune Sessiounen, all mat enger Hand voll Zeilen), a Sessiounsnimm vum Worker op d'Säit ze schécken, wat e Tab aus dem Späicher drécke léisst. Dann behält d'Lueden d'Sessiouns-**IDen** - sou gëlle d'Grenze nach ëmmer iwwerall - awer léisst d'Bezeechnungen an d'Auswiel fort, a seet et am Panel Datesaz.

## Grupp {#group}

D'Kolonn **Equipe / Grupp** ass all Kolonn mat wéineg verschiddene Wäerter: eng Equipe, eng Säit, e Squad, eng Fraktioun, eng Spiller-gegen-KI-Markéierung, eng Autoklass. Si gëtt als 16-Bit-ID pro Zeil gespäichert an steiert:

- d'[Equipelëscht](teams-list.md) (Sichtbarkeet pro Grupp, + / − Säiten),
- [Equipe-Hëtzt](team-heat.md) (eng Faarf pro Grupp),
- d'[Ënnerscheed](difference.md)-Opdeelung no Gruppen,
- d'Këschtefaarwen am [Box-Replay](box-replay.md) (eng Faarffamill pro Grupp, eng Schattéierung pro Member).

### Limiten {#limits}

Héchstens **4 096** verschidde Gruppen. D'Gruppen-ID sëtzt an der véierter Kanal vum Positiounstexel vun all Zeil op der GPU, an all Grupp brauch e Texel an der 4 096 breeder Vorzeechentabell, déi de Shader liest fir ze entscheeden: *verstoppt*, *derbäi* oder *ofgezunn*. Eng Kolonn mat méi verschiddene Wäerter ass eng ID, keng Grupp: **d'Lueden behält all Zeil a léist nëmmen d'Gruppéierung fort**, mat enger Warnung um Datesaz, déi proposéiert, se als Persoun-Kolonn ze setzen oder als Filterkolonn ze behalen.

Dat selwecht 4 096-Limit gëllt fir eng behalen *Kategorie*-Filterkolonn; eng méi breet gëtt net behalen, an den Datesaz seet dat. Eng numeresch Kolonn (zum Beispill e Zäitstempel) huet als *Beräich*-Filter kee sou Limit.

D'Gruppewäerter `0`, en eidelen Wäert, `none`, `unknown`, `null` a `-1` (ëmmer egal ob Grouss- oder Klengschreiwung) heeschen "keng Grupp" fir [Equipe-Hëtzt](team-heat.md); déi gëtt se neutral grau, net als eng sécher Faarf.

## Entitéitsgréisst {#entity-size}

Wéi grouss ee verfollegte Gegestand ass - d'Kollisiounsbox vun engem Spiller, en Auto - bestëmmt, wéi grouss d'Këschten an d'Blécksstrahlen vum [Box-Replay](box-replay.md) gemoolt ginn. Am Panel gëtt et kee Feld dofir; et kënnt aus den [`heat3d`-Hiweiser](data-formats.md#the-heat3d-hints) vun der Datei (`entity.size`, an de Eenheeten vun der Datei; de CS2-Konverter schreift 32). D'Lueden multiplizéiert en mat der Eenheetsskala.

Bei all Lueden ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), wobei *Ausmooss* dee gréissere vun den X- an Z-Spannen vun den Donnéeën ass:

| Astellung | Mat enger Entitéitsgréisst | Ouni |
|---|---|---|
| Würfelgréisst | Entitéitsgréisst | Ausmooss / 500 |
| Längt vum Blécksstrahl | Entitéitsgréisst × 4 | Ausmooss / 200 |
| Sprite-Radius | Ausmooss / 120 | Ausmooss / 120 |
| Sättigungspunkt | analytesch Schätzung (dann gemooss) | selwecht |
| Fluggeschwindegkeet | Ausmooss / 12 | selwecht |
| Weit Ebene | Ausmooss × 12 | selwecht |
| Nah Ebene | max(0,05; Ausmooss / 20 000) | selwecht |

## De Panel Datesaz {#the-dataset-panel}

Ënner dem Quell-Panel. Wann en Datesaz gelueden ass, weist en:

- den **Numm** vum Datesaz - d'Auswiel, d'Zuel vun de Zeilen, d'Zuel vun de Dateien, de Schrëtt wann een benotzt gouf;
- **`N Equipen · N Persounen · N s Spann`**;
- all **Warnung**, déi d'Lueden erzeecht huet, a Gielt, sou laang wéi de Datesaz gelueden ass: Gruppen oder eng Filterkolonn ewechgeholl wéinst ze vill Wäerter, Sessiounen net opgelëscht, gedeelt Nimm, feelend Zeilen, iwwersprongen Dateien;
- de [synthetesche Generator](synthetic-generator.md);
- **Entlueden**, wat den Datesaz ewechmécht.

D'Zuel vun de Zeilen steet am Kapp vum Panel.
