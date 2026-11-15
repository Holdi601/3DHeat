---
title: "Zäitlinn a Wiedergab"
nav_order: 5
lang: "lb"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Zäitlinn a Wiedergab

D'Leescht ënner dem Bild ass wéi e Videospiller: Dir kënnt d'Daten wéi e Film ofspillen, pausen, sprangen a d'Geschwindegkeet änneren.

![D'Zäitlinn: 1 Alles/Ofspillen, 2 Transportknäppchen, 3 Auer, 4 Geschwindegkeet, 5 Vergaangenheet, mat Fënster an engem Zäitraum vun 30 s](../assets/img/en/timeline-bar.webp)

D'Leescht ënner der Usiicht ass d'Zäitlinn ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Si entscheet, wéi Zeilen zu all Moment sichtbar sinn. Si brauch eng Zäitkolonn; ouni déi ass déi ganz Leescht ausgegraut, d'Usiicht bleift op **Alles**, an d'Säitelleescht seet *Keng Zäitkolonn an dëse Daten - d'Zäitlinn ass ausgeschalt, an all Datepunkt gëtt op eemol gewisen.*

## Alles a Ofspillen {#all-and-play}

Zwee Modi op der héchster Ebene, well se verschidden Froen beäntwerten.

- **Alles** (de Standard bei all Lueden) ignoréiert de Playhead ganz a weist all Zeil, déi d'Filteren passéiert. Dat ass d'Usiicht "wou geschitt dat", an et ass net dat selwecht wéi zum Enn réckelen. De Schieber ass ausgeschalt, an d'Auer weist `alles · <span> vun Daten`.
- **Ofspillen** spillt d'Daten als Zäitraffer of. Schieber, Transport an d'Vergaangeheetsastellunge erscheinen.

Wann Dir **Alles** wielt, stoppt d'Ofspillen och.

## D'Steierungen {#the-controls}

| Steierung | Standard | Bedeutung |
|---|---|---|
| Schieber | den Ufank | De Playhead. Zéien fir ze sprangen; 20.000 Schrëtt iwwer de ganze Beräich. |
| **Alles** / **Ofspillen** | Alles | Kuckt uewen. |
| ▶ / ❚❚ | pausiert | Ofspillen oder pausen; och `K`. |
| ◀ **Réckwäerts ofspillen (J)** | | Spillt d'Daten an der Ëmkehrung of. Nëmmen am Modus **Figuren-Overlay** gewisen; déi selwecht Tast `J` funktionéiert och do (kuckt [Tastatur](#keyboard)). |
| ⏮ | | Zréck op den Ufank vum Beräich. |
| Auer | | `verstrach / total` als `mm:ss.s` (oder `h:mm:ss`), an, wann d'Zäitkolonn e absolute Zäitstempel ass, d'Auerzäit vum Playhead als `HH:MM:SSZ` (UTC). |
| **Geschwindegkeet** | 1× | Datesekonnen pro Echtsekonn. D'Menü huet 17 Schrëtt vun 0.01× bis 1800× (0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), plus **Eegen…**: tippt all Geschwindegkeet vun 0.001× bis 3600× (zum Beispill 0.3 oder 12) an drëckt Enter; Esc behält déi aktuell Geschwindegkeet. Déi lescht Geschwindegkeet gëtt fir den nächste Besuch gemierkt (kuckt [Gespäichert Astellungen](ref-settings-storage.md)). |
| **Vergaangenheet** | Kumulativ | Wat um Playhead als sichtbar zielt: *Kumulativ*, *Fënster* oder *Liewensdauer* (hei ënnen). |
| **Zäitraum** (bei Fënster; bei Linnen-Modus och Liewensdauer) | 30 s | Längt vum Fënster, dat um Playhead endet; op d'mannst 0.01 s. Bei [Linn-Hëtzt](line-heat.md#playback) ass dat d'Längt vum Schwanz. |
| **Ersatz-Liewensdauer** (nëmmen Liewensdauer, net am Linnen-Modus) | 10 s | Wéi laang e Datepunkt bleift, deen kee nächste Sample vun senger Persoun huet. |
| **Ausblennen** (nëmmen Liewensdauer, net am Linnen-Modus) | 0.4 | Deel vun der Liewensdauer vun all Datepunkt, a deem en ausgeblend gëtt, 0-1. |
| **Endlosschleif** | un | Um Enn fänkt et vir vir; aus hält am Enn op. |
| Rietsen | | De Numm vun de Daten. |

De **Beräich** ass d'Zäitspann vun den Daten - oder, am [Figuren-Overlay](box-replay.md) mat enger gewielter Sessioun, d'Spann vun där Sessioun.

## Vergaangenheet {#history}

Am Modus Ofspillen:

- **Kumulativ** - alles vum Ufank vum Beräich bis zum Playhead. D'Hëtzt baut sech op, wann et leeft.
- **Fënster** - eng fest Zäitspann Vergaangenheet, déi um Playhead endet (*Zäitraum*).
- **Liewensdauer** - all Datepunkt lieft, bis de **nächste Sample vun deselwechter Persoun** kënnt (an der selwechter Sessioun), sou datt genau eng Positioun pro Persoun zu all Moment aktuell ass. E Datepunkt, deem seng Persoun nie méi opdaucht - en Doud, eng Verbindungsunterbriechung, de Logenn - huet kee nächste Sample a lieft d'*Ersatz-Liewensdauer* laang, anstatt direkt ze verschwannen oder ëmmer ze bleiwen. Datepunkte **blenden aus** iwwer déi lescht *Ausblennen*-Fraktioun vun hirer Liewensdauer, amplaz ofzespringen: wann eng Persoun nëmmen ee Sample lieft an en Datepunkt vun engem Bild op dat nächst verschwënnt, flackert d'ganzt Feld mat der Sample-Rate. *Ausblennen* 0 stellt de haarde Schnëtt erëm her.

Liewensdauer brauch eng Persounskolonn an eng Zäitkolonn; ouni Persounskolonn fällt d'Vergaangenheet beim Lueden op Kumulativ zréck. Bei [Linn-Hëtzt](line-heat.md#playback) stellt d'Vergaangenheet of, wéi laang de Schwanz vun engem Wee sichtbar bleift; am [Figuren-Overlay](box-replay.md) ass d'*Ersatz-Liewensdauer* wéi laang eng Persoun ouni weider Samples gehale gëtt.

## Wiedergab-Verhalen {#playback-behaviour}

Aus dem Bild-Schläif ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- De Playhead geet mat *Bildzäit × Geschwindegkeet* viru. D'Bildzäit ass bei 0.1 s begrenzt, sou datt en Tabwiessel de Playhead net sprangen léisst.
- Wann Dir um allerleschten Enn vum Beräich op Ofspillen drécke, fänkt et vum Ufank un, wéi bei engem Mediespiller. Bei all Lueden steet de Playhead um Ufank, sou datt den éischten Drock op Ofspillen spillt.
- Um Enn vum Beräich spréngt de Playhead zréck op den Ufank (Endlosschleif un) oder hält do an d'Wiedergab endet (Endlosschleif aus).
- De Schieber liest den Playhead vum Motor all Bild direkt; de Programmstatus gëtt bei Sprangen, Starten, Stoppen a Schleifen aktualiséiert.
- Wann Dir eng Sessioun am Sessiounswiel wielt, sprengt et op den Ufank vun där Sessioun.

## Firwat d'Wiedergab glat a bëlleg ass {#why-playback-is-smooth-and-cheap}

D'Zeilen sinn no Zäit sortéiert gespäichert, sou datt en Zäitfënster zwou Binärsich vun der Zäitkolonn ass: de Playhead weider réckelen beweegt zwou ganz Zuelen an d'Zeilen selwer ginn net ugeréiert, an d'Käschte vun der Wiedergab hänkt vun der Zuel vun de Zeilen am Fënster of, net vun der Gréisst vum Datesaz.

Wéi d'Hëtzt stabil bleift, wann d'Fënster sech beweegt, hänkt vun der Vergaangenheet of ([Akkumulatioun](accumulation.md)):

- **Kumulativ** wiisst nëmmen ëmmer weider, sou datt all Bild nëmmen déi Zeilen derbäisetzt, déi zënter dem leschten Bild sichtbar goungen, mat vollem Gewiicht. D'Feld baut sech monoton op, an d'Pausen ännert näischt, well näischt méi ukënnt. (Nei Schätzen géif bei all Bild eng aner zoufälleg Deelmenge beliichten an dann ausbleeën, wat sech wéi Ausbrécher liest, déi opfloren an verschwannen.)
- **Fënster** an **Liewensdauer** änneren sech bei all Bild wierklech a ginn nei geschätzt, als gläitende Duerchschnëtt gemëscht (Gewiicht 0.34 fir dat neit Bild), wat am stabilen Zoustand onverzerrt ass a vill rouegst ass wéi nei unzefänken.
- Am Liewensdauer-Modus sinn d'Kandidatezeilen déi vum *Playhead - max(längste Lück an den Daten, Ersatz-Liewensdauer)* bis zum Playhead; de Shader wierft dann all Zeil eraus, deren eegen Liewensdauer eriwwer ass, a wend d'Ausblennen un.

Wiesselen tëscht Alles an Ofspillen oder d'Vergaangenheet änneren fänkt d'Akkumulatioun nei un.

## Tastatur {#keyboard}

| Tast | Effekt |
|---|---|
| `K` | Ofspillen / Pausen |
| `J` | Réckwäerts ofspillen; nach eng Kéier drécken pauséiert (nëmmen Figuren-Overlay) |
| `L` | Vir ofspillen; nach eng Kéier drécken pauséiert (nëmmen Figuren-Overlay) |

`J` a `L` schalten d'Zäitlinn och op **Ofspillen**. D'Tasten ginn ignoréiert, wann e Textfeld oder Menü de Fokus huet. Am Course-Analys-Tab steuert `K` dee Replay vum Tab selwer.
