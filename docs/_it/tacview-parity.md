---
title: "Parità con Tacview"
parent: "Replay della partita"
grand_parent: "Replay"
nav_order: 1
lang: "it"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Parità con Tacview

Tacview è un programma molto diffuso per guardare le registrazioni di volo. Se lo conosci, questa pagina mostra dove si trova ciascuno dei suoi strumenti in 3DHeat.

Elenca ogni funzione di Tacview 1.9 (il suo manuale, la tabella delle stringhe dell'interfaccia e il formato di file ACMI 2.2) e dove si colloca il [replay della partita](match-replay.md) di 3DHeat rispetto a essa. Lo scopo: ciò che Tacview può fare per un replay e per i suoi dati, 3DHeat può farlo altrettanto.

**Stato:**
- **fatto**: già presente in 3DHeat.
- **nuovo**: costruito per corrispondere a una funzione di Tacview.
- **non ancora**: si applica, ma non è stato costruito.
- **n/a**: non si applica qui, con il motivo.

Dove trovare le funzioni: la scheda **Partita**, **Replay a figure** (o **Figure sovrapposte** nella scheda Calore), nelle sezioni della barra laterale **Replay**, **Unità**, **Eventi**, **Segnalibri**, **Display tattico**, **Statistiche**, **Spostamento temporale e taglio**, **Mappa e posizione**, **Audio e video** ed **Etichette**. Vedi [Replay della partita](match-replay.md).

## Telecamere

| Tacview | 3DHeat | Stato |
|---|---|---|
| Vista dal cockpit (F5), con l'orizzonte che ruota insieme al velivolo | **Cockpit**: fuori dall'unità lungo il suo assetto, come lo ha il modello di movimento. La figura dell'unità stessa viene tagliata via. Trascina per guardarti intorno; **Guarda di nuovo avanti** reimposta. | nuovo |
| HUD nella vista dal cockpit (scelta IAS/CAS/TAS) | **Display head-up** (H): orizzonte e scala di beccheggio della vista reale, marcatore della traiettoria di volo, nastro della prua, IAS, quota, TAS, Mach, G, angolo d'attacco, velocità verticale, AGL | nuovo |
| Strumenti 3D del cockpit, tracciamento della testa del pilota (PilotHead*), TrackIR | Nessun modello di cockpit; gli angoli della testa sono mostrati nella vista **Grezzo** della scheda unità | n/a (nessun modello di cockpit; il tracciamento della testa serve al volo in tempo reale) |
| Vista esterna (F6): orbita attorno all'oggetto principale | **Inseguimento** (gira con l'unità) e **Orbita** (mantiene la propria direzione) | fatto |
| Telecamera da combattimento aereo, "Guarda il bersaglio" (padlock) | **Padlock**: dal cockpit, tenuta sul bersaglio | nuovo |
| Telecamera da combattimento aereo, "Centrata" / "Guarda avanti" | **Bersaglio**: dietro l'unità sulla linea dal bersaglio, guardando oltre di esso verso il bersaglio. **Fissa** all'azimut 0 guarda in avanti da davanti. | nuovo |
| Scambia principale e secondario | **Scambia** accanto al bersaglio | nuovo |
| Vista satellite (F7), dall'alto in proiezione ortogonale | **Satellite**: dritta in basso sull'unità, nord in alto; trascina per girare. La mappa 2D è la pianta ortogonale. | nuovo |
| Telecamera libera (F8), W/A/S/D, E/C | La telecamera libera di volo (W/A/S/D, Spazio/Q, Shift/Alt) | fatto |
| Telecamera aggiuntiva Head-On; telecamera esterna fissa all'oggetto | **Fissa**: un punto attorno all'unità che gira e rolla con essa; trascina per spostarlo (dietro, a un'estremità d'ala, frontale) | nuovo |
| Telecamera aggiuntiva Lock Camera (blocca la posizione) | Smetti di seguire (Esc): la telecamera resta dov'era | fatto |
| Vista strategica (zoom indietro fino all'intera Terra) | [Sfondo del mondo](world-backdrop.md) e la cornice dell'intera registrazione della mappa 2D | fatto |
| Impostazione del campo visivo | FOV in **Telecamera e scena** | fatto |
| Cambio di vista con i tasti | **V** vista successiva, **Shift+V** indietro | nuovo |

## Vista 3D e opzioni di visualizzazione

| Tacview | 3DHeat | Stato |
|---|---|---|
| Scie a nastro, cursore della lunghezza | Scie (secondi) nel visualizzatore di squadra | fatto |
| Scia anticipata (percorso davanti) | **Percorso futuro**: dove l'unità va davvero nei prossimi secondi | nuovo |
| Linee d'altezza o pareti degli oggetti | **Linee verticali** | fatto (linee; pareti non costruite) |
| Vettori dell'oggetto selezionato: prua (punteggiata), rotta (continua), portanza | **Vettori velocità** (rotta e velocità per tot secondi, con una punta) e **Linee di muso e portanza** (muso tratteggiato, portanza corta e scura) | nuovo |
| Linea di vista del pilota | **Linea di vista del pilota**: una linea tratteggiata ciano lungo PilotHeadYaw/PilotHeadPitch (o una colonna HeadYaw, ViewYaw o LookYaw) rispetto agli assi dell'unità | nuovo |
| Cupole della portata letale SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, i gemelli "2") | **Zone di ingaggio**: cupole, ovoidi dove la portata verticale è diversa, spente mentre EngagementMode è 0 | nuovo |
| Agganci radar (LockedTarget..9) con etichette | **Agganci**: linee rosse verso ogni oggetto agganciato; ambra tratteggiata verso FocusedTarget; lungo LockedTargetAzimuth/Elevation/Range dove nessun oggetto è nominato. **Etichette di aggancio**: il nome del bersaglio e la distanza su ogni linea di aggancio | nuovo |
| Cono radar (RadarMode, Azimuth, Elevation, Roll, Range, ampiezze del fascio) e cancello di portata | **Coni radar**: bordo e anello intermedio del fascio ruotato secondo azimut, elevazione e rollio rispetto all'unità; il cancello di portata come due bordi gialli. Senza ampiezze di fascio, solo l'asse del fascio. | nuovo |
| Linea di vista tra i due oggetti selezionati (verde / rossa tratteggiata quando il terreno la blocca) | La linea della coppia misurata diventa rossa e tratteggiata quando il livello si trova tra i due | nuovo |
| Ingrandimento automatico degli oggetti lontani | Dimensione minima della figura sullo schermo (pixel) | fatto |
| Griglia di latitudine e longitudine | **Mappa e posizione → Griglia**: linee di latitudine e longitudine sul terreno sotto la telecamera, a una spaziatura tonda per l'altezza (da 10° fino a 1'), con etichette; oppure la griglia chilometrica **MGRS** della zona UTM, con la zona e il quadrato da 100 km mostrati. La griglia della mappa 2D resta com'era | nuovo |
| Anelli bullseye | Anelli attorno al bullseye di ogni squadra sulla mappa 2D | nuovo (solo 2D) |
| Sovrapposizione del sentiero di discesa | **Sentieri di discesa**: percorsi a 3° con i bordi di fondo scala ±0,7° su entrambe le estremità di ogni pista vicina alla registrazione, dalle soglie e dalle elevazioni rilevate di OurAirports (scaricati una volta, conservati offline), un segno a ogni miglio nautico, con il nome dell'aeroporto e della pista | nuovo |
| Restrizioni di quota (allarme di soffitto/pavimento) | **Restrizione di quota**: un pavimento e un soffitto; le etichette delle unità fuori diventano rosse, e ogni attraversamento (sotto il pavimento, sopra il soffitto, di nuovo dentro) è elencato - un clic porta lì e segue l'unità | nuovo |
| Oggetti distrutti in grigio, rimossi dopo 15 min | Le vite finiscono con la loro traccia; un'unità morta è attenuata nell'elenco delle unità | fatto |
| Proprietà Visible / Disabled | Mostrate in **Grezzo**; con esse nulla viene nascosto | non ancora |
| Visualizzazione delle posizioni di barra/manetta/pedali | Valori di manetta e motore in campi; ingressi di comando in **Grezzo** | fatto (come valori) |
| Commenti come sottotitoli | **Messaggi come sottotitoli** (Etichette): eventi ACMI Message e Comment, e chat di qualsiasi gioco (eventi Chat, Say o Radio, o una colonna di chat), in basso nella vista con chi l'ha detto, per sei secondi | nuovo |
| Visualizzazione dell'ora UTC e della data | Orologio della linea temporale con UTC dove la registrazione ha un'ora di riferimento | fatto |
| Posizione del mouse in lat/long, MGRS, bullseye | La scheda del punto (clic su un punto) dà latitudine/longitudine in gradi, primi e secondi e MGRS accanto ai metri del mondo; bullseye per unità (campo) | nuovo |
| Logo personalizzato | Non costruito | n/a (marchio) |
| Modelli 3D, il più vicino quando sconosciuto | Catalogo delle figure proprio, controparte più vicina, dimensione reale | fatto |
| Ingaggi multipli (linee tra tutte le coppie) | **Linee di ingaggio**: da ogni unità nell'ambito verso ogni avversario entro la portata impostata (1-200 km), ciascuna con la sua distanza, le 60 coppie più vicine; la coppia misurata come prima | nuovo |

## Etichette

| Tacview | 3DHeat | Stato |
|---|---|---|
| Etichette on/off, separatamente per oggetti selezionati e non selezionati | **Etichette** con regole per **Selezionate**, **Velivoli**, **Terra**, **Navi**, **Armi** e **IA**: mostrate o no, valori propri, priorità | nuovo |
| Campi delle etichette: nome, nominativo, pilota, velocità (TAS/CAS/IAS/Mach/GS), altezze (ASL/AGL), VS, AOA, AOS, G (verticale, laterale, longitudinale), velocità e raggio di virata, energia, peso/volume/portata del carburante, prua/rotta, rollio/beccheggio, frequenza cardiaca | Ogni valore di `fields.ts`: la stessa lista, calcolata dove non registrato (stime segnate con ~). Velocità di rollio e SpO2 solo tramite Grezzo. | fatto |
| Posizione del bullseye nelle etichette | Campo **Bullseye (rilevamento / distanza)** | nuovo |
| Deviazioni ILS, distanza percorsa | Valori grezzi; distanza percorsa nelle statistiche | fatto (in parte) |
| Sgombrare la telemetria non selezionata | **Tieni separate le etichette**, ordinate per priorità di ciascuna regola | fatto / nuovo |
| Etichettare tutti gli oggetti a terra / solo le minacce | Le regole Terra e IA | nuovo |
| Scala delle etichette | **Dimensione etichette** (60-250 %) | nuovo |
| Unità metriche / imperiali | Metriche / imperiali | fatto (due preset, non otto) |

## Informazioni sull'oggetto e telemetria

| Tacview | 3DHeat | Stato |
|---|---|---|
| Selezione principale e secondaria | Il clic segue e seleziona; maiusc-clic su due per misurare; selettore **Bersaglio** | fatto / nuovo |
| Distanza / rilevamento / aspetto / chiusura tra due oggetti | Linea BRAA della coppia misurata; campi Distanza, Rilevamento, Aspetto e Chiusura dall'unità seguita | fatto |
| Rilevamento relativo, velocità della linea di vista | Campi **Rilevamento relativo** (dal muso dell'unità seguita, S/D) e **Velocità angolare della linea di vista** (°/s) | nuovo |
| Finestre di telemetria | La scheda unità e la scheda al passaggio del mouse | fatto |
| Telemetria grezza (ogni proprietà registrata, anche quelle sconosciute) | **Grezzo** nella scheda unità: ogni colonna nella riga dell'unità così com'è scritta | nuovo |
| Elenco degli oggetti attivi | **Unità**: giocatori, IA, armi in volo; quelle vive in evidenza | fatto |
| Finestra delle proprietà della registrazione (titolo, autore, briefing...) | Conservate nella colonna RecordingInfo; mostrate in Grezzo | fatto (nessuna finestra) |
| Formati di posizione DMS/MGRS, nord magnetico | **Posizione (lat / long)** in DMS e campi **MGRS**; un campo **Prua magnetica**; **Prue magnetiche** scrive prua, rotta e rilevamento magnetici (°M) e mostra una bussola con entrambi i nord e la declinazione - il World Magnetic Model 2025 (coefficienti di dominio pubblico), calcolato qui nel punto e alla data dell'unità | nuovo |

## Grafici

| Tacview | 3DHeat | Stato |
|---|---|---|
| Grafico di un oggetto, fino a 4 valori | **Nel tempo** (e il grafico sotto Replay) | fatto |
| Tracciare fino a 4 oggetti insieme | **Confronto**: un valore di fino a 8 unità su una sola scala | nuovo |
| Valore contro valore (stile energia-manovrabilità) | **Valore vs valore**: velocità di virata contro velocità o qualsiasi coppia, ogni unità è una linea, il suo punto attuale è segnato | nuovo |
| Asse X per tempo; zoom; spostare il tempo dal grafico | La rotella ingrandisce nel tempo, doppio clic reimposta, il clic va al momento | nuovo |
| Asse X per distanza in aria o a terra | **Tempo / Distanza in aria / Distanza a terra** sui grafici del tempo e del confronto; zoom e clic-per-andare funzionano allo stesso modo | nuovo |
| Grafici predefiniti (energia, accelerazione...) | Qualsiasi valore può essere scelto (altezza di energia e la sua velocità sono valori) | fatto |

## Statistiche, registro di volo, eventi

| Tacview | 3DHeat | Stato |
|---|---|---|
| Registro di volo: decollato, atterrato, sparato, colpito da, distrutto da, uscito dall'area | **Statistiche** per unità: vite, abbattimenti, morti, colpi, colpi a segno, rapporto di colpi, decolli, atterraggi, tempo in volo, G massimo (e minimo), velocità massima, altezza e Mach, distanza. I decolli vengono dagli eventi TakenOff/Landed, OnGround, AGL, o da una stima segnata con ~. | nuovo |
| Componenti aggiuntivi di tabellone e rapporto di missione | Riepilogo per squadra e abbattimenti maggiori; il tabellone proprio del riepilogo della partita | nuovo / fatto |
| Esporta il registro di volo XML/CSV | **Esporta CSV** delle statistiche e degli eventi così come elencati | nuovo (solo CSV) |
| Esporta la telemetria CSV a una frequenza | **Telemetria dell’unità selezionata**: ogni valore, da 1 a 20 al secondo | nuovo |
| Registro degli eventi, doppio clic per andare lì e selezionare | Elenco **Eventi**, filtrato per tipo e unità; un clic vola lì | fatto |
| Evento precedente / successivo (Ctrl+←/→) | **Page Up / Page Down** | nuovo |
| Pausa all'evento | **Pausa sull’evento** | nuovo |
| Segni sulla linea temporale (rilasci, colpi, distruzioni; quelli dell'oggetto selezionato in blu; segnalibri in rosso) | Abbattimenti e morti come barra di densità, quelli dell'unità seguita in blu, segnalibri in rosso; clic per andare | nuovo |
| Rimuovere un evento, rimozione per abbattimento | Non costruito | n/a (gli eventi appartengono alla registrazione; i filtri li nascondono) |

## Segnalibri

| Tacview | 3DHeat | Stato |
|---|---|---|
| Inserire un segnalibro con la selezione e il punto di vista | **Aggiungi segnalibro** (B): il momento, la telecamera libera o l'unità seguita con la sua vista, distanza e bersaglio; con un nome; conservato in questo browser per registrazione | nuovo |
| Rimuovere un segnalibro | × nell'elenco | nuovo |
| Segnalibri sulla linea temporale e nei registri | Segni rossi; l'elenco | nuovo |
| Event=Bookmark in ACMI | Elencato tra i segni della registrazione, con abbattimenti, morti e messaggi | nuovo |
| Scorciatoia copia/incolla (condividere una vista) | **Esporta / Importa** i segnalibri come file; C copia la posa della telecamera | nuovo |

## Riproduzione

| Tacview | 3DHeat | Stato |
|---|---|---|
| Riproduzione/pausa, all'inizio, velocità, scorrimento della linea temporale | Linea temporale | fatto |
| Fotogramma per fotogramma | **,** e **.** un secondo indietro e avanti (Shift: dieci) | nuovo |
| Riproduzione all'indietro | **◀** sulla linea temporale, **J** (**L** avanti; lo stesso tasto di nuovo mette in pausa): riproduce dalla fine verso l'inizio alla velocità scelta, in ciclo o fermandosi all'inizio | nuovo |
| Finestra di salto temporale | La linea temporale e l'elenco degli eventi | fatto |
| Spostamento temporale di un oggetto (fantasma) | **Spostamento temporale e taglio**: sposta il volo di un'unità, o un'intera registrazione, di tanti secondi; **Allinea le registrazioni** sposta più registrazioni per iniziare insieme e le riproduce tutte insieme (due uscite in giorni diversi affiancate). La registrazione viene ricostruita, quindi scie, eventi, grafici e statistiche la seguono | nuovo |
| Taglio prima/dopo | **Da ora / Fino ad ora / Taglia a questo intervallo** (annullare mantiene gli spostamenti), poi **Esporta CSV** (si ricarica in 3DHeat) o **Esporta ACMI** (testo Tacview 2.2, per una registrazione posta sulla Terra) | nuovo |

## Terreno e mappa

| Tacview | 3DHeat | Stato |
|---|---|---|
| Terreno reale, elevazione e texture personalizzate | Livelli (la mappa del gioco come modello 3D), tessere dello sfondo del mondo | fatto |
| Modalità di terreno piatto / vuoto / ad alto contrasto | [Aspetto del livello](level-appearance.md): rilievo del terreno, superficie e strutture mostrate o no | fatto (non le stesse modalità) |
| Mappa tattica 2D (Tacview non ne ha: vista satellite) | **Mappa 2D**: vista d'angolo o intera, simboli per tipo e squadra (giocatori pieni, IA con contorno) girati verso la loro prua, scie, nomi, barra di scala, anelli di portata attorno all'unità seguita, anelli bullseye, il punto della telecamera 3D, morti recenti; trascina, rotella, clic per seguire (M) | nuovo |
| Oggetti statici (aeroporti, piste, waypoint, aree, KML) | Piste rilevate (OurAirports) nello sfondo del mondo e i loro sentieri di discesa; i waypoint GPX e i segnaposto KML si caricano come oggetti fermi; la [Lavagna tattica](tactics-board.md) disegna aree e percorsi | nuovo |

## Importazione, esportazione, registrazione

| Tacview | 3DHeat | Stato |
|---|---|---|
| ACMI testo e zip | [Tacview ACMI](tacview-acmi.md) | fatto |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (tracce, percorsi, waypoint; frequenza cardiaca, cadenza, potenza, temperatura Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC e GGA di qualsiasi talker, somme di controllo verificate, a cavallo della mezzanotte), **IGC** (record B, data, pilota e aliante), **FIT** (messaggi di record, timestamp compressi) - ciascuno posizionato per latitudine e longitudine sul piano al centro delle tracce, così lo sfondo del mondo si allinea; prua, beccheggio e velocità dal file o da un punto all'altro. CSV e Parquet come prima | nuovo (DIS n/a: un protocollo di rete in tempo reale) |
| Registratori nativi (DCS, BMS, IL-2, MSFS...) | I convertitori propri di 3DHeat (War Thunder, CS2, Squad, Arma e altri) | fatto (propri) |
| Telemetria in tempo reale via TCP, ADS-B | Non costruito | n/a (riproduzioni dopo la partita) |
| Audio/video sincronizzati | **Audio e video**: un file locale si riproduce, mette in pausa, cerca e cambia velocità con la linea temporale da un inizio impostato (**Inizia ora**, ±0,1 s); un video in un pannello ridimensionabile sopra la vista, o picture-in-picture. Il file resta nel browser | nuovo |
| Esportazione video | [Percorso della telecamera e video](camera-path-and-video.md) | fatto |

## Altro

| Tacview | 3DHeat | Stato |
|---|---|---|
| Componenti aggiuntivi Lua | Non costruito | n/a (open source: si cambia il visualizzatore stesso) |
| Debriefing online (sessione condivisa) | Non costruito | n/a (quello di Tacview è una sessione ospitata che tiene tutti su un'unica testina di riproduzione. 3DHeat non ha server e conserva le registrazioni sulla macchina dell'utente, e anche un collegamento peer-to-peer richiede un server di segnalazione. Un debriefing si condivide come file: la registrazione tagliata (Esporta ACMI o CSV) e il file dei segnalibri, che si aprono negli stessi momenti e viste) |
| Controllo remoto dell'istruttore | Non costruito | n/a (controlla un simulatore in esecuzione) |
| Modifica degli oggetti (aggiungere, modificare, rimuovere) | [Lavagna tattica](tactics-board.md) per gli oggetti pianificati; le registrazioni sono in sola lettura | n/a |
| Lingue | 40 lingue | fatto |
| Autenticazione delle registrazioni | Non costruito | n/a |

## Per gli sviluppatori: proprietà ACMI 2.2

Lette da `data/acmi.ts`; le proprietà numeriche diventano colonne numeriche, quelle di testo colonne di categoria. Tutte sono mostrate in **Grezzo** nella scheda unità. Queste sono lette per uno scopo:

| Proprietà | Uso |
|---|---|
| T (tutte e quattro le forme), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Posizione, assetto, figura, nome dell'unità, squadra |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Campi, grafici, HUD, rilevamento di decollo e atterraggio |
| VerticalGForce, LongitudinalGForce, LateralGForce | Campi G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Campi |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Campi del carburante, sommati sui serbatoi |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Coni radar e cancello di portata |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Linee di aggancio |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Cupole di ingaggio |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Campi |
| Health | Campo |
| Eventi: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Elenco eventi, statistiche (morti, decolli, atterraggi), segnalibri; Message e Comment come sottotitoli |
| PilotHeadYaw, PilotHeadPitch | Linea di vista del pilota |
| Tag di tipo Bullseye (Navaid+Static+Bullseye) | Campo bullseye e anelli della mappa |
| Tutto il resto (PilotHeadRoll, comandi, superfici, deviazioni ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, dimensioni...) | Mostrato come scritto in **Grezzo** |

Gli angoli del radar e dell'aggancio sono riferiti agli assi propri dell'unità: azimut verso destra, elevazione verso l'alto, rollio con l'ala destra in basso. La specifica ACMI dice che sono relativi al velivolo ma non in quale verso sia positivo; questa lettura segue la sua trasformazione (imbardata in senso orario, beccheggio verso l'alto, rollio con l'ala destra in basso).
