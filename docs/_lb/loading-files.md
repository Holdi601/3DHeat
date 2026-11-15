---
title: "Dateien lueden"
parent: "Daten astellen"
nav_order: 1
lang: "lb"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Dateien lueden

Dës Säit weist, wéi Dir 3DHeat Är Dateien gitt a wat et mat hinnen mécht. Zitt en Dossier eran, an et sicht sech d'Dateien eraus, déi Positiounen hunn, a verbënnt se zu engem Bild.

1. Maacht **Quell** uewen an der Säitelëscht vum Heatmap op.
2. Zitt Dateien oder e Dossier op d'Zon fir d'Dateien, oder dréckt **Fichieren…** oder **Dossier…**.
3. Lest d'Auswiel-Zeil an d'**Späicherschätzung** (kuckt d'Bild hei ënnen).
4. Dréckt **Lueden**.

![Den Quell-Panel nodeem en Dossier mat zéng Matcher erageholl gouf: 1 d'Auswiel-Zeil, 2 d'Späicherschätzung passt, an 3 Lueden 10 Dateien](../assets/img/en/loading-files-source.webp)

*Nodeem Dir e Dossier erageholl hutt, seet Iech 3DHeat, wat et fonnt huet an ob et passt.*

D'Dateien ginn am **Quell**-Panel uewen an der Säitelëscht vum Heatmap-Tab gelueden. Alles, wat op eemol ausgewielt ass, gëtt **ee** Datesaz.

## D'Dateien auswielen {#choosing-files}

| Element | Wat et mécht |
|---|---|
| **Fichieren oder en Dossier heihinner zéien** (d'Zon) | Zitt all Mëschung vu Dateien a Dossieren eran. Dossiere ginn duerchsicht, bis an d'Ënnerdossieren. Wann Dir op d'Zon klickt, geet déiselwecht Auswiel op wéi **Fichieren…**. |
| **Ee Fichier…** | Eng Auswiel fir eng eenzeg Datei. |
| **Fichieren…** | Eng Auswiel, déi méi Dateien annimmt. |
| **Dossier…** | Eng Dossier-Auswiel (dem Browser seng `webkitdirectory`-Auswiel); all Datei am Dossierbaum gëtt ugebueden. |

D'Auswiele huelen d'Dateitypen, déi an der [Lëscht vun de lueden Dateien](data-formats.md#files) stinn. Kuerz: `.parquet`/`.pq` ginn als Parquet gelies, `.csv`/`.tsv`/`.txt` als Text mat Trennzeechen, `.acmi` (Tacview), OCAP-`.json`/`.json.gz` an d'GPS-Formater (GPX, KML, KMZ, NMEA, IGC, FIT) gi laanscht hir eegen Lieser, an `.3dheat`-Match-Behälter ginn als d'Tabellen gelueden, déi se hunn ([Eng Datei pro Match](container.md)). E Behälter, dee sech net liesen léisst, gëtt iwwersprongen als *keng csv/parquet-Datei*.

Erageholl Dossiere ginn bis 12 Ebenen déif duerchsicht, an héchstens 20 000 Dateien, als Schutz géint Symlink-Schleifen an endlos Beem.

## Wéi Dateien bleiwen {#which-files-are-kept}

Ier eppes gelies gëtt, gëtt d'Auswiel gefiltert ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Eng Datei mat enger anerer Endung gëtt iwwersprongen: *keng csv/parquet-Datei*.
- Eng Datei vun 0 Bytes gëtt iwwersprongen: *eidel (0 Bytes)*.
- **Konverter-Begleeder** - d'Rohdaten, déi e Konverter nieft der Tabell vun engem Match behält, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` an déi anerer, déi an [Konverter behalen alles](converters.md) stinn - ginn iwwersprongen: *e Begleeder vum Konverter*. Fir een opzemaachen, wielt en oder zitt en eleng op d'Zon (oder nëmmen Begleeder): eng Auswiel, déi nëmmen aus Begleederen besteet, lued si wéi all Tabell. Déi JSON nieft enger Tabelle (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` an `.hints.json`) gëtt nie als Positiounen ugebueden.
- **D'Bewegungsdatei-Regel.** Wann eng Datei an der Auswiel `movement*.parquet`, `movement*.csv` heescht (an déi anerer Endungen) - `movement.parquet`, `movement_1.parquet` an esou weider - dann gëtt all aner Datendatei iwwersprongen: *keng Bewegungsdatei, an dësem Dossier leien Bewegungsdateien*. Telemetrie-Exporte hunn oft eng Tabell mat Positiounen nieft Dutzende Tabellen ouni Positiounen, an nëmmen déi éischt kann gemoolt ginn. E Dossier ouni Bewegungsdatei lued all seng Datendateien. Beispill: e Dossier mat `movement_1.parquet`, `kills.parquet` a `shop.parquet` lued `movement_1.parquet`; déi zwou anerer stinn als iwwersprongen. Beispill: e Dossier mat `movement_1.parquet`, `kills.parquet` a `shop.parquet` lued `movement_1.parquet`; déi zwou anerer stinn als iwwersprongen.
- D'Dateien, déi bleiwen, ginn no hirem Pad an der Auswiel sortéiert. Sou gëtt dat selwecht Dossier ëmmer dee selwechte Datesaz an déiselwecht Faarwen.

De Panel weist dann d'Auswiel (den Numm vun enger Datei, oder `Dossier (N Dateien)` mat dem längste gemeinsame Dossier), d'Zuel vun de Dateien, hir Gesamtgréisst an d'Gesamtzuel vun de Zeilen - genau, wann all Datei Parquet ass, mat `≈` markéiert, wann eng CSV ass. Iwwersprongen Dateien stinn mat hirem Grond opgelëscht, déi éischt véier mat Numm.

## D'Schema liesen {#reading-the-schema}

D'**éischt** Datei vun der Auswiel gëtt opgemaach, fir d'Schema ze beschreiwen ("Schema gëtt gelies"): hir Kolonnennimm, hir éischt 50 Datenzeilen, wéi vill Kolonnen no Zuelen ausgesinn an, bei Parquet, de logeschen Typ vun all Kolonn an den `heat3d`-Eintrag am Fouss. E Dossier mat Exporten vun enger Tabell deelt sech ee Schema, also steet eng Datei fir all. Dann gëtt all Datei gemooss ("Zeilen zielen"): en Parquet-Fouss gëtt d'genau Zuel an engem klenge Lieser; bei enger CSV gëtt d'Zuel aus der duerchschnëttleche Zeilelängt vum éischte Megabyte geschat.

De Panel [Kolonnenzouweisung](column-mapping.md) mécht sech mat den automatesche Vermutungen op, an d'[Späicherschätzung](memory-and-budgets.md) erscheint iwwer dem Knäppchen **Lueden**.

## Noriichten virum Lueden {#messages-before-loading}

Ënner der Auswiel listt de Panel op, aus [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Feeler** (rout) - de Lueden kann net ufänken: manner wéi zwou Positiounsachsen, déiselwecht Kolonn op zwou Achsen, eng zougewisen Kolonn, déi net an der Datei ass, eng Positiounskolonn, déi net no Zuelen ausgesäit, eng Zäitkolonn, deenen hir Probewäerter Text sinn, wann d'Eenheet eng Zuel ass (all Zeil wier NaN a läit op Zäit 0), eng Zäitkolonn op ISO-8601, vun deenen kee Probewäert e Datum ass, an eng Eenheeskala vun 0.
- **Warnungen** (gielt) - et lued, awer wahrscheinlech net wéi gemeint: eng Gruppekolonn, déi op de meeschte Probezeilen en anere Wäert huet (also eng ID, keng Gruppe), eng `DATE`-Zäitkolonn (all Zeil vun engem Dag deelt sech dee selwechte Moment), eng Blécksrichtung ouni hir Kolonnen.
- **Hiweiser** - wat d'Zouweisung bedeit: op enger Fläch zeechnen, wann eng Achs net zougewise ass, keng Zäitlinn ouni Zäitkolonn, keng Spuren ouni Persoun-Kolonn, an ouni Gruppekolonn eng Faarf fir alles an en Ënnerscheed, deen nëmmen no enger Kolonn kann opgedeelt ginn, déi fir de Filter behale ass.

## Lueden {#loading}

De Knäppchen **Lueden** liest *Datei lueden*, *N Dateien lueden* oder *N Dateien lueden (1 vun K)*, wann e [Decimatiounsschrëtt](memory-and-budgets.md#decimation) agestallt ass. Et liest *Ze grouss - reduzéieren oder decimatiséieren* a gëtt ausgegraut, wann de [Passungs-Test](memory-and-budgets.md#the-fit-check) seet, datt de Lueden net passt; et ass och ausgegraut, solang d'Zouweisung Feeler huet oder en anere Lueden leeft.

Wärend dem Lueden weist de Panel den aktuelle Schrëtt (mat `[Datei/Dateien]` virdrun, wann et méi wéi eng gëtt), d'Zeilen, déi bis elo gelies sinn, eng Fortschrëttsbalken an **Ofbriechen**. Ofbriechen hält de Lieser-Worker un, an domat all Parser-Worker, déi en gestart huet.

D'Säit zeechent weider beim Lueden, well d'Aarbecht am Hannergrond leeft. Dir gesitt den aktuelle Schrëtt, d'Zeilen, déi gelies sinn, eng Fortschrëttsbalken an **Ofbriechen**. Nom läschte Datei weist de Panel d'Schrëtt *Zeilen an Zäitreiefolleg bréngen*, *Kolonnen neu uerdnen (n vu m)*, *Ausmooss messen*, *Lëscht vun de Leit opbauen*, *Sessiounen zesummefaassen* an *Liewensdauer ausrechnen*, dann *N Zeilen op d'GPU lueden* fir ee Frame, sou datt e laangt Lueden ni fir en Hänger gehalen gëtt.

### Wéi et leeft {#how-it-works}

De Lueden leeft an engem Web-Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Bei e puer Dateien an méi wéi engem [Parser-Strang](memory-and-budgets.md#parser-threads) ginn bis zu sou vill Dateien **gläichzäiteg** gelies, all an engem eegene Parser-Worker ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), sou wäit de RAM-Budget Plaz léisst. Si ginn awer nach ëmmer eng nom anerer an der Reiefolleg vun der Auswiel zesummegefouert, sou datt de Datesaz deeselwechte ass wéi bei engem Lueden no engem aneren. Solang e puer ënnerwee sinn, nennt d'Fortschrëttszeil d'Datei, déi zoulescht gemellt huet, an d'Balken an d'Zeilenzuel zielen all Datei zesumme, déi ënnerwee ass. Mat engem Strang oder bei enger eenzeger Datei ginn d'Dateien nacheneen am Ingest-Worker selwer gelies. Nëmmen d'Kolonnen, déi d'Zouweisung nennt, ginn gelies: eng net zougewisen Kolonn an enger Parquet-Datei kascht näischt; eng CSV gëtt Byte fir Byte duerchsicht, awer nëmmen d'zougewisen Felder ginn dekodéiert.

## E puer Dateien ginn ee Datesaz {#several-files-become-one-dataset}

Wann méi wéi eng Datei gelueden gëtt ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Eng gemeinsam Lëscht vun de Persounen.** Persounen, Gruppen, Sessiounen an d'Wäerter vun de Kategorien sinn Wierderbicher, déi all Dateie gemeinsam hunn, sou datt deeselwechte Spiller a béide Exporter eng Persoun mat enger Spuer ass.
- **Ee Zäit-Ufank.** D'Zäiten bleiwen beim Zesummeféieren als 64-Bit-Sekonnen a ginn op de fréisten Zäitpunkt vun der *ganzer* Auswiel gesat, dann als 32-Bit-Sekonnen vun deem Ufank gespäichert. Véier Exporter vun véier Nomëttager ginn an hirer richteger Reiefolleg gesat, net op-enee-gestapelt.
- **Eng Zäitreiefolleg.** Zeilen aus all Dateien ginn no der Zäit mat engem Radix-Sort sortéiert (kuckt [d'Sortéiergrenz](memory-and-budgets.md#the-sort-ceiling)).
- **Eng Kolonn `Source file`.** All Zeil erënnert sech, aus wéi enger Datei si koum, als Kategoriekolonn mat dem Numm `Source file`. Si erscheint bei de [Filteren](filters.md) an als *Source file - zwou Lueden vergläichen* bei der [Ënnerscheedsopdeelung](difference.md). E Lueden aus enger eenzeger Datei kritt se net - eng konstant Kolonn kascht 4 Byte pro Zeil, fir näischt ze soen.
- **Fehlend Kolonnen.** Eng Datei, déi eng vun de *Filter*-Kolonnen net huet, steuert einfach keng Wäerter dofir bäi. Eng Datei, déi eng zougewisen *Roll*-Kolonn net huet (X, Zäit, Persoun, ...), mécht *Datei huet keng Kolonn "Numm"*; bei engem Lueden mat méi Dateien gëtt déi Datei iwwersprongen, an déi anerer ginn trotzdem gelueden, an d'iwwersprongen Dateien stinn um Datesaz. E Lueden aus enger eenzeger Datei, dat feelt, mellt de Feeler.
- **Warnung bei engem Manko.** Wann d'Zeilen, déi gelueden sinn, manner wéi 95 % vun de Zeilen sinn, déi virdru gezielt goufen, dréit de Datesaz eng Warnung mat dem feelenden Undeel - vun Dateien, déi net liesbar sinn, oder vu Zeilen ouni brauchbar Positioun, déi beim Erafueren fortgeworf ginn.

## Nom Lueden {#after-loading}

De neie Datesaz ersetzt den aalen. Bei all Lueden ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- all Filteren an d'Sichtbarkeet vun de Gruppen ginn geläscht;
- d'Ënnerscheedsopdeelung no Gruppen gëtt zréckgesat: déi éischt Halschent vun de Gruppen (opgerënnt) positiv, de Rescht negativ;
- de Radius vun de Sprites gëtt op d'horizontal Ausmooss / 120 gesat, an d'Sättigung op eng analytesch Schätzung; d'Würfelgréisst, d'Längt vum Blécksstrahl, d'Fluggeschwindegkeet an d'Nopeschtsfläch an d'Weitfläch ginn aus dem Ausmooss gesat (kuckt [Sessiounen, Persounen a Gruppen](sessions-persons-groups.md#entity-size));
- d'Sessioun vum Box-Replay gëtt op d'Sessioun mat de meeschte Zeilen gesat;
- d'Linnewäermen-Routen ginn nei geroden ([Linn-Hëtzt](line-heat.md));
- de Usiichtsmodus fällt op **Heat** zréck, wann de aktuelle Modus vun den neien Daten net ënnerstëtzt gëtt; d'Zäitlinn fällt op **Alles** zréck ouni Zäitkolonn, an d'Geschicht op **Kumulativ** ouni Liewensdauer;
- de Playhead steet um Ufank, an d'Wiedergab hält un;
- d'Kamera rahmt de ganze Datesaz aus der Standardrichtung (kuckt an der -Z-Richtung, mat ongeféier 36° no ënnen geneigt).

De Panel **Datesaz** weist dann den Numm vum Datesaz (d'Auswiel, d'Zuel vun de Zeilen an Dateien, an de Schrëtt, wann een benotzt gouf), `N Equippen · N Persounen · N s Spann`, an all Warnung, déi d'Lueden erzeechent huet, a Gielt, sou laang wéi de Datesaz gelueden ass. **Entlueden** an deem Panel mécht de Datesaz fort.
