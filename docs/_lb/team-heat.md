---
title: "Equipen-Heat"
parent: "Hëtztmodi"
nav_order: 6
lang: "lb"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Equipen-Heat

Equipen-Heat weist, wou all Equipe war, all Equipe a senger eegener Faarf. Wou Equipe sech iwwerlappen, mëschen sech d'Faarwen.

**Equipen-Heat** (Tast 3) ass d'Dichtefeld vun [Heat](heat.md), wou all [Grupp](glossary.md) eng eege Faarfton kritt. Wou Gruppe sech iwwerlappen, mëschen sech hir Faarwen; e gläichen Duell kënnt neutral eraus. Déckkraaft drägt d'Dicht nach ëmmer exakt wéi an den anere Modi, sou datt d'Bild zur selwechter Zäit *wéi vill* an *wiem* beäntwert. Et brauch eng Gruppekolonn.

![Equipen-Heat: all Säit a senger eegener Faarf; wou se sech iwwerlappen, mëschen sech d'Faarwen](../assets/img/lb/heat-teams.webp)

Et ass **net** de [Figuren-Overlay](box-replay.md): deen zeechent eng Figur pro Persoun; dat hei ass en Hëtztfeld, dat mat déiselwechter Kolonn gefierft ass.

## Wéi een et benotzt {#how-to-use-it}

1. Drëckt `3` (oder wielt **Equipen-Heat** an der Modus-Leescht).
2. Maacht **Heat-Faarwen** op. D'Faarfproben weisen d'Faarf vun all Grupp; wann Dir mat der Maus iwwer eng Probe fiert, gesitt Dir den Numm vun der Equipe.
3. Wann alles grau ausgesäit, erhéicht **Faarftrennung**.
4. Huekt eng Grupp an der [Team-Lëscht](teams-list.md) of, fir se erauszehuelen; d'anerer Faarwe bleiwen, wou se waren.

## Steierungen {#controls}

An der Sektioun **Heat-Faarwen**:

| Steierung | Standard | Bedeutung |
|---|---|---|
| Faarfproben | | D'Faarf vun all Grupp, fir déi éischt 12 Gruppen, dann *+N méi*. Mat der Maus driwwer fueren fir den Gruppennumm an d'Faarf. |
| **Faarftrennung** | 1.4 | Wéi wäit eng Mëschung vum Neutrale wegdréckt gëtt, 0-4. 0 mécht alles grau; 1 ass de richtege Duerchschnëtt; ab ongeféier 2 falen déi hellste Mëschungen aus dem Bildberäich a ginn pro Kanal begrenzt, wat hir Faarfton verréckt. |
| **Deckkraaftverlaf (d’Faarf kënnt vun der Grupp)** | den Standard-Hëtztverlaf | Nëmmen den **Alpha**-Wäert vum Verlaf gëtt hei benotzt: transparent, wou näischt ass, undurchsiichtig uewen. Seng Faarwen ginn ignoréiert. |

All déi anerer Hëtzt-Steierunge - Form, Sättegung, Reaktioun, minimal Hëtzt, Déift, Ausblenden - funktionéiere wéi bei [Heat](heat.md).

D'[Team-Lëscht](teams-list.md) weist an dësem Modus d'Equipenfaarf vun all Grupp als hir Probe. Eng Grupp verstoppen léisst all anerer Grupp hir Faarf, wou se war: d'Faarftéin kommen aus der Gesamtzuel vun de Gruppen, net aus deem, wat ageschalt ass, sou datt zwee Biller vergläichbar bleiwen.

## D'Palette {#the-palette}

Aus [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Faarwen liewen op der **Oklab**-Faarfebene mat fixer Hellegkeet (0.7) an Chroma (0.115), sou datt all Grupp gläich hell ass an eng rout Grupp net méi waarm wierkt wéi eng blo.
- Mat *n* Gruppen gëtt de Faarfkrees a *n* gläich Deeler opgedeelt, a Grupp *i* kritt d'**Mëtt** vu sengem Deel, `(i + 0.5) / n` vun enger Ëmdréiung. All zwou Gruppe sinn sou wäit ewech, wéi d'Zuel et erlaabt, a Géigesätz bleiwen Géigesätz, egal wéi vill et sinn.
- Héchstens **16** verschidde Faarftéin ginn benotzt. Bei méi Gruppen ginn d'IDen duerch wiederholtes Halbéieren zougewisen (bit-ëmgedréint: 0, ½, ¼, ¾, ⅛, …), sou datt Noper-IDen keng Faarf deelen; Gruppen iwwer 16 deelen sech zwangsleefeg eng.
- Eng Grupp, déi "keng Grupp" heescht - `0`, eidel, `none`, `unknown`, `null` oder `-1`, ouni Ënnerscheed vun Grouss an Klengbuschtawen - gëtt **neutralgrau** gemoolt, amplaz e Stéck vum Krees ze huelen. Nëmmen déi éischt sou Bezeechnung an der Gruppelëscht gëtt esou behandelt.

D'Standard-Trennung ass 1.4 an net 1, well bei 1 eng Mëschung vu fënnef gläichméisseg verdeelte Faarftéin *grau* ass: richteg, awer net liesbar. E bëssen iwwer 1 hält Gläichstänn éierlech a mécht eng 60/40-Opdeelung siichtbar.

## Wéi et funktionnéiert {#how-it-works}

D'Hëtzt-Ziel huet an dësem Modus véier Kanäl. All Sprite addéiert seng Dicht *v* zum éischten Kanal a *v* × d'Oklab-Koordinaten *a* a *b* vun der Grupp zum zweeten an drëtten. Beim Zesummesetzen ass d'Mëschung vum Pixel dat dicht-gewiichtete Mëttel: *a* = G / R, *b* = B / R, skaléiert mat der Faarftrennung an an sRGB ëmgerechent bei der Hellegkeet vun der Palette. Dat Deelen duerch d'akkumuléiert Dicht hält d'Faarfton onofhängeg dovun, wéi vill Daten do sinn; dofir wierkt all Dichtsteierung nëmmen op d'Déckkraaft.

Dat Véier-Kanal-Ziel kascht bei gläicher Opléisung véier Mol sou vill GPU-Späicher wéi dat eenkanalegt Hëtzt-Ziel.
