---
title: "Catalogo della conoscenza"
parent: "La lente della conoscenza"
nav_order: 2
lang: "it"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Catalogo della conoscenza

Questo è l'elenco completo di ciò che la [lente della conoscenza](knowledge.md) conosce: i pattern che cerca, le idee, i metodi, i casi storici e gli studi che cita, e i libri e gli articoli alla loro base. Usalo per cercare una voce tramite il suo id o per verificare una fonte.

Questa pagina è generata dalla base di conoscenza con `node tools/knowledge-doc.mjs`; non modificare il testo tra i marcatori.

<!-- kb:begin -->

La base di conoscenza contiene 579 voci (135 concetti, 37 metodi, 277 casi storici, 17 principi di progettazione, 113 studi) su 93 pattern, con 556 riferimenti.

### Pattern (93) {#patterns-93}

| id | famiglia | come appare nei dati |
|---|---|---|
| `concentration` | forza | La parte che porta più unità in un unico luogo vince quel luogo con un margine superiore al solo numero. |
| `local-superiority` | forza | Le uccisioni vanno a chi, nel raggio di ingaggio, supera numericamente l'altro, indipendentemente dai totali. |
| `attrition` | forza | Le perdite seguono la forza di entrambe le parti nel tempo; il combattimento è deciso da chi esaurisce prima le risorse. |
| `exchange-ratio` | forza | Il numero di uccisioni per perdita differisce molto per luogo, parte o classe. |
| `aimed-fire` | forza | Le perdite crescono con il numero dei nemici, ma non con il proprio. |
| `area-fire` | forza | Le perdite crescono con il prodotto del numero delle due parti: l'affollamento viene punito. |
| `defeat-in-detail` | forza | Una parte viene distrutta a pezzi, man mano che le sue componenti arrivano una alla volta. |
| `mutual-support` | forza | Una perdita viene subito vendicata da un compagno vicino: scambi. |
| `combined-arms` | forza | Le classi rendono bene insieme, quando ognuna copre il punto debole dell'altra, e male da sole. |
| `class-counter` | forza | Una classe vince in modo sproporzionato contro una particolare altra classe o in un particolare luogo. |
| `initiative` | forza | Chi segna per primo in un ingaggio tende a vincerlo. |
| `key-terrain` | terreno | Gli stessi pochi luoghi decidono i combattimenti partita dopo partita. |
| `fields-of-fire` | terreno | I luoghi che vedono lontano sul terreno che gli altri devono attraversare fanno più uccisioni. |
| `high-ground` | terreno | Le uccisioni avvengono dall'alto, sul terreno su cui stanno le vittime. |
| `cover` | terreno | I morti nel tempo calano dove la geometria blocca la vista e il fuoco. |
| `open-ground` | terreno | I morti nel tempo aumentano dove niente blocca la vista e il fuoco. |
| `kill-zone` | terreno | I morti si concentrano dove il movimento è costretto a passare per un terreno osservato e coperto dal fuoco. |
| `chokepoint` | terreno | Molti passaggi stretti in poco terreno, con perdite proprio lì. |
| `reverse-slope` | terreno | Sicurezza appena dietro una cresta o un muro, fuori dalla vista diretta del nemico. |
| `safe-ground` | terreno | Un luogo dove si passa del tempo ma muoiono in pochi. |
| `obstacle` | terreno | I percorsi aggirano il terreno bloccato e si restringono in poche corsie. |
| `flank` | movimento | Un percorso poco usato porta a più uccisioni dei percorsi principali. |
| `avenue-of-approach` | movimento | Il movimento scorre lungo poche corsie tra le aree. |
| `mobility` | movimento | Le unità in movimento muoiono meno (o di più) nel tempo rispetto a quelle lente o ferme. |
| `static-exposure` | movimento | Le unità ferme muoiono più in fretta, nel tempo, di quelle in movimento. |
| `interior-lines` | movimento | Una parte con percorsi brevi tra i propri combattimenti sposta la forza più in fretta dell'altra. |
| `envelopment` | movimento | Le uccisioni arrivano da più direzioni sulla posizione di una parte. |
| `ambush` | movimento | Le unità che si muovono lungo un percorso muoiono in fretta, colpite da nemici già in posizione. |
| `spawn-pressure` | tempo | Le vite finiscono presto dopo l'inizio, da un punto di comparsa. |
| `tempo` | tempo | La parte più rapida arriva allo scontro e segna prima che l'altra reagisca. |
| `surprise` | tempo | Le perdite arrivano in una raffica, prima che le vittime possano rispondere. |
| `energy-advantage` | aria | Chi uccide ha più quota e più velocità delle sue vittime. |
| `air-superiority` | aria | Gli aerei di una parte uccidono molte volte quanto perdono. |
| `sead` | aria | Le difese antiaeree a terra abbattono molti aerei finché non vengono trovate e distrutte. |
| `bvr` | aria | Le uccisioni avvengono a lunga distanza, prima che la vittima possa avvicinarsi. |
| `fleet-salvo` | mare | Una forza che colpisce per prima perde poco; l'altra sopravvive poco per rispondere. |
| `scouting` | mare | La parte che trova per prima l'altra sceglie il combattimento. |
| `urban-close` | urbano | Distanze di ingaggio brevi, molti morti tra una geometria densa, sgombero lento. |
| `vertical` | urbano | Uccisioni dai piani alti o dai tetti, sulle strade. |
| `skill-dispersion` | persone | Pochi giocatori spiegano una grande parte delle uccisioni o delle morti. |
| `ai-vs-player` | persone | Le unità controllate dall'IA se la cavano in modo diverso dai giocatori nello stesso luogo. |
| `balance` | progettazione | Parti, comparse o classi partono con possibilità diseguali. |
| `economy` | progettazione | Le risorse guadagnate, spese e perse si concentrano in pochi luoghi o giocatori. |
| `flow` | progettazione | Come i giocatori si muovono nel livello: anelli, corsie, vicoli ciechi. |
| `sightlines` | progettazione | Le linee di vista lunghe decidono dove iniziano i combattimenti e chi li vince. |
| `readability` | progettazione | Morti che i giocatori non possono vedere arrivare: da dietro, da fuori vista. |
| `formation` | movimento | Le unità di una parte si muovono insieme in una forma riconoscibile: linea, colonna, cuneo, scaglione, scatola. |
| `frontal-assault` | movimento | Un gruppo si lancia contro il nemico dritto di fronte. |
| `double-envelopment` | movimento | Due gruppi colpiscono sui due fianchi di un unico corpo nemico più o meno nello stesso momento. |
| `encirclement` | movimento | Un gruppo nemico si ritrova con l'altra parte tutt'intorno e poche vie d'uscita. |
| `penetration` | movimento | Un gruppo passa attraverso la linea nemica, dove i nemici stanno su entrambi i lati. |
| `fire-and-maneuver` | movimento | Una parte del gruppo si muove mentre il resto sta fermo e lo copre, e i ruoli si alternano. |
| `feint` | movimento | Un piccolo gruppo attira il nemico in un luogo; lo sforzo principale colpisce altrove poco dopo. |
| `withdrawal` | movimento | Un gruppo a contatto si volta e apre la distanza dal nemico. |
| `pursuit` | movimento | Un gruppo segue un nemico che si allontana, mantenendo o riducendo la distanza. |
| `defence-in-depth` | terreno | I difensori stanno in più fasce, una dietro l'altra, lungo l'asse di avanzata del nemico. |
| `screening` | movimento | Un piccolo elemento si muove molto più avanti del proprio corpo principale e incontra per primo il nemico. |
| `dispersion` | forza | Una parte si disperde nel tempo; meno sue unità condividono uno stesso luogo. |
| `missile-defence` | aria | Gli aerei sotto minaccia di missili girano la minaccia verso il fianco o la coda: crank, notch, drag, pump. |
| `angles-fight` | aria | Combattimento ravvicinato a bassa velocità e forte virata, condotto per la posizione del muso anziché per l'energia. |
| `cap` | aria | Gli aerei orbitano per minuti attorno a una stazione fissa, in attesa che arrivi il nemico. |
| `strike-package` | aria | Aerei con ruoli diversi volano insieme verso un obiettivo; alcuni attaccano il suolo, altri li coprono. |
| `line-of-battle` | mare | Le navi avanzano in colonna, una dietro l'altra, così che tutte le fiancate possano sparare. |
| `crossing-the-t` | mare | Una colonna passa davanti alla testa della colonna nemica: tutti i suoi cannoni sparano, pochi di quelli nemici. |
| `fatal-funnel` | urbano | I giocatori che entrano da un'unica porta, stanza o passaggio stretto muoiono lì in pochi istanti molto più spesso che entrando altrove. |
| `crossfire` | forza | Chi tiene posizioni le cui linee di tiro convergono da angolazioni diverse vince più duelli di chi ne tiene una sola. |
| `peeker-advantage` | tempo | Il giocatore che si sposta in vista vince i duelli contro chi tiene l'angolo più (o meno) spesso della metà. |
| `entry` | tempo | La prima uccisione di un round decide gran parte del round; gli ingressi vincono o perdono in base al luogo e al supporto. |
| `utility-support` | forza | Un flash o un fumo appena prima di un duello cambia chi lo vince. |
| `man-advantage` | forza | I round li vince la parte con più giocatori in vita, e alcune squadre trasformano o gettano via un vantaggio. |
| `clutch` | persone | Gli ultimi giocatori in vita vincono più (o meno) spesso di quanto lo stato del round lasci prevedere. |
| `action-value` | persone | Uccisioni, scambi, piazzamenti e utilità differiscono per quanto cambiano la probabilità di vincere. |
| `lurk` | movimento | Un giocatore solo, lontano dalla squadra, uccide (o muore) con un ritmo diverso dal gruppo. |
| `rotation` | movimento | La velocità con cui una parte sposta i giocatori verso lo scontro o l'obiettivo decide se tiene o riconquista. |
| `collective-order` | persone | Le unità in movimento di una parte vanno nella stessa direzione molto più spesso di quanto farebbero per caso le loro traiettorie, sfasate nel tempo. |
| `milling` | persone | Le unità di una parte girano attorno a un centro comune: rotazione senza spostamento netto. |
| `herding` | persone | Le unità lasciano un luogo come ha fatto il compagno che le precedeva, oltre le probabilità del luogo e oltre la semplice imitazione del nemico. |
| `lane-formation` | persone | I flussi opposti restano su corsie separate; il movimento si concentra su pochi sentieri riusati partita dopo partita. |
| `crowding` | persone | Velocità e flusso calano quando le unità si stringono; in un passaggio stretto, spingere più forte fa passare meno unità. |
| `leadership` | persone | Alcune unità si voltano per prime e altre copiano la loro direzione pochi secondi dopo. |
| `cohesion` | persone | Le unità che si allontanano dal gruppo muoiono più spesso di quelle che restano con esso. |
| `breaking-point` | persone | Una parte che ha perso una quota della propria forza smette di avvicinarsi e arretra, oltre quanto spiega la distanza dal nemico. |
| `panic` | persone | Sotto una minaccia improvvisa le unità si disperdono, fuggono o si bloccano, e il coordinamento crolla. |
| `loss-chasing` | persone | Dopo una perdita le unità corrono più (o meno) rischi che dopo un guadagno. |
| `hot-hand` | persone | Il successo segue il successo più spesso di quanto permettano sequenze mescolate dello stesso giocatore. |
| `conformity` | persone | I membri di una parte scelgono allo stesso modo - acquisti, equipaggiamenti, percorsi - oltre le proprie preferenze. |
| `suppression` | persone | Il fuoco in arrivo cambia il modo in cui le unità si muovono e sparano, anche quando non uccide. |
| `social-loafing` | persone | L'azione per persona cala quando sono presenti più compagni. |
| `mixed-strategy` | persone | Le scelte che dovrebbero essere imprevedibili diventano regolari: un'opzione vince più spesso, o le scelte si susseguono in sequenza. |
| `coordination` | persone | I membri agiscono all'unisono senza ordini visibili: movimento, tempi e scelte sincronizzati. |
| `contagion` | persone | Uno stato passa da unità a unità per contatto o vicinanza e si diffonde sulla mappa. |
| `territoriality` | persone | Le unità mantengono la distanza tra loro e restano sul proprio terreno. |
| `interaction-network` | persone | Chi combatte, sostiene e segue chi forma una rete con nodi, gruppi e ponti. |

### Concetti (135) {#concepts-135}

| id | titolo | lenti | pattern | fonti |
|---|---|---|---|---|
| `concept.lanchester-square` | Legge quadratica di Lanchester (fuoco mirato) | militare, aria, navale, esports | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Legge lineare di Lanchester (fuoco di area, uno contro uno) | militare, urbano, esports | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Concentrazione della forza (massa) | militare, aria, navale, esports | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Rapporti di forza e la regola 3:1 | militare | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Rapporto di scambio delle perdite | militare, aria, esports, progettazione | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Potenza di combattimento e i suoi moltiplicatori | militare | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Il sistema moderno di impiego della forza | militare | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Il ciclo OODA (osservare-orientarsi-decidere-agire) | militare, aria, esports | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Teoria dell'energia e della manovrabilità | aria | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Manovre di base da caccia e manovra di combattimento aereo | aria | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Analisi del terreno: OAKOC / KOCOA | militare, progettazione, urbano | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: variabili della missione | militare | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Terreno chiave e terreno decisivo | militare, progettazione, esports | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Osservazione e settori di tiro | militare, progettazione, esports, urbano | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Copertura e occultamento | militare, urbano, progettazione | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Assi di avvicinamento e corridoi di manovra | militare, progettazione | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Strozzature e gole | militare, progettazione, esports | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Aree di ingaggio e zone di morte | militare, urbano, progettazione | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Difesa sul contropendio e defilamento | militare, progettazione | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Il terreno alto | militare, progettazione | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Linee interne ed esterne | militare | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Sconfitta a pezzi | militare, esports | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Appoggio reciproco | militare, aria, esports | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Armi combinate | militare, progettazione | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Soppressione | militare, urbano | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Soppressione e distruzione delle difese antiaeree nemiche (SEAD/DEAD) | aria, militare | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Pattuglia aerea di combattimento e superiorità aerea | aria | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Ingaggio oltre la visuale | aria | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | L'approccio indiretto | militare, esports, progettazione | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Aggiramento e accerchiamento | militare | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Imboscata | militare, esports, progettazione | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Difesa in profondità | militare | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Attrito e nebbia della guerra | militare, esports | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Punto culminante dell'attacco | militare | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Sorpresa | militare, aria, navale, esports | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Economia della forza | militare, esports | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Terreno urbano | urbano, militare, esports | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Controllo del mare e la battaglia decisiva della flotta | navale | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Modello di salva di Hughes: attaccare per primi con efficacia | navale, aria | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Teoria della ricerca e del rilevamento | navale, aria, militare | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Ricerca operativa: misure di efficacia | militare, aria, navale, progettazione | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Il wargaming come analisi | militare, progettazione | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Guerra di manovra | militare, esports | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Coesione e fattore morale | militare | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Centro di gravità | militare | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Punti decisivi | militare, esports | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Linee di operazione | militare | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategie di annientamento e di logoramento | militare | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Battaglia in profondità e operazioni in profondità | militare | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | militare, aria | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Comando per missione (Auftragstaktik) | militare, esports | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Sfondamento e sfruttamento | militare | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Fuoco e movimento | militare, esports | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Avanzata a salti con copertura | militare, esports | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Attrazione della ricognizione e infiltrazione | militare, esports | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | La riserva | militare, esports | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Difesa elastica e contrattacco | militare | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | La catena di uccisione (trovare, fissare, seguire, bersagliare, ingaggiare, valutare) | militare, aria, navale | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Distanza di rilevamento contro distanza di ingaggio | aria, navale, militare | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Valore di efficacia del combattimento | militare, esports | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Dispersione sul campo di battaglia | militare, esports | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Appoggio aereo ravvicinato | aria, militare | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Interdizione aerea | aria, militare | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Scorta contro rastrellamento di caccia | aria | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Combattimento in energia contro combattimento in virata | aria | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Inseguimento a guida, puro e a ritardo | aria | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Lo zigzag Thach | aria | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | La formazione a quattro dita e la coppia da combattimento | aria | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flotta in essere | navale | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Attraversare la T | navale, militare | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Convoglio | navale | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Negazione dell'accesso e negazione d'area | navale, aria, militare | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Difesa di caposaldo nei centri abitati | urbano, militare | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Passaggio da un edificio all'altro e movimento tra gli edifici | urbano, militare, progettazione | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Assedio | militare, urbano | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Guerriglia | militare, urbano | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Controinsurrezione | militare, urbano | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Santuario | militare, progettazione | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Inganno (maskirovka) | militare, esports | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Vantaggio informativo | militare, esports | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Round di economia e ritmo delle risorse | esports, progettazione | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Formazioni di movimento: linea, colonna, cuneo, scaglione | militare, esports | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Attacco frontale | militare | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Doppio aggiramento (la tenaglia) | militare | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Accerchiamento sacca | militare | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Penetrazione e sfondamento | militare | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Inseguimento | militare | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Movimento retrogrado: ripiegamento, ritardo e ritirata | militare | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Finta e dimostrazione | militare, esports | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Schermo, guardia e copertura: sicurezza davanti al corpo principale | militare | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Difesa contro un missile: crank, notch, drag e pump | aria | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formazioni oltre la visuale: muro, guida-gregario, macina, tenaglia | aria | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Il combattimento sugli angoli e il combattimento in energia | aria | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Pacchetto d'attacco e sequenza della soppressione | aria | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | La linea di battaglia | navale | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | L'imbuto mortale | urbano, militare, esports, progettazione | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Bonifica delle stanze: sorpresa, velocità, violenza controllata | urbano, militare, esports | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Punti di dominio | urbano, militare, esports | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Bonifica degli angoli: tagliare la torta | urbano, militare, esports | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Fuoco incrociato e settori di tiro che si incrociano | militare, urbano, esports, progettazione | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Il vantaggio di chi sbircia | esports, progettazione | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Vantaggio numerico nei round a eliminazione | esports, militare | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Ingresso e il duello di apertura | esports, urbano | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Utilità prima dell'ingresso: flash e fumo | esports, urbano, militare | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Modello delle forze sociali del moto dei pedoni | progettazione, urbano, militare | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Formazione di corsie nel flusso contrario | progettazione, urbano | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Più veloci, più lenti | progettazione, urbano, militare | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Il diagramma fondamentale delle folle | progettazione, urbano | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Formazione di sentieri e linee del desiderio | progettazione, militare | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Il panico è raro: resilienza collettiva | militare, urbano, progettazione | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: separazione, allineamento, coesione | progettazione, militare | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Parametro d'ordine e l'inizio del moto collettivo | progettazione, militare, aria, navale | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Stormi, roteamento e stati polarizzati | progettazione, militare, navale | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Guida efficace senza segnali | militare, esports, progettazione | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Vicini per numero, non per distanza | aria, militare | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Intelligenza dello sciame | progettazione, esports, militare | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Gregarismo e cascate informative | esports, progettazione, militare | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Pigrizia sociale | esports, progettazione, militare | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Diffusione della responsabilità | esports, militare | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Coesione del gruppo primario | militare, esports | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Punti di rottura e soglie di perdite | militare | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Soppressione: cosa fa il fuoco oltre a uccidere | militare, urbano | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Paura e stress nelle decisioni di combattimento | militare, esports | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Crollo sotto pressione | esports | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Teoria del prospetto e avversione alla perdita | esports, progettazione | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Effetti del pareggio e dei soldi del banco | esports | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt (perdita di controllo emotivo) | esports | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Costo sommerso | esports, militare | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | La mano calda e il suo errore logico | esports | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Strategie miste: essere imprevedibili | esports, progettazione, militare | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Modelli mentali condivisi | esports, militare | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Le componenti del lavoro di squadra | esports, militare | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Mondi virtuali come laboratori del comportamento | progettazione, esports | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Spazio personale e territorio | progettazione, urbano | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Reti di interazione: nodi e legami deboli | esports, progettazione | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Metodi (37) {#methods-37}

| id | titolo | pattern | fonti |
|---|---|---|---|
| `method.lanchester-fit` | Adattamento degli esponenti di Lanchester ai dati di ingaggio | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Rapporto di scambio per parte e per luogo | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Rapporto di forza locale nel momento di ogni uccisione | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Campo visivo: settori di tiro in linea di vista | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Energia specifica alle uccisioni e alle morti (aria) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Persistenza dei punti caldi tra le partite | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Tasso di scambi (appoggio reciproco) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Ingaggi e vantaggio del primo colpo | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Autocorrelazione spaziale delle morti (I di Moran) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Tassi rispetto alla base propria della mappa con controllo FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Preparazione dell'informazione sul campo di battaglia (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Modelli di valutazione a confronti a coppie (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Probabilità di vittoria e valutazione delle azioni | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Controllo dello spazio e controllo del campo | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Equazione della salva adattata alle navi in contatto | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Rapporto di efficacia del combattimento per unità-ora in azione | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Distanze dal rilevamento all'ingaggio e distanze di ingaggio | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Tempi della catena di uccisione | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Dispersione rispetto alla quota di uccisioni (concentrazione della forza nel tempo) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Tasso di perdita e uccisioni per missione | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Modello della probabilità di vittoria del round | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Valore dell'azione: probabilità di vittoria aggiunta | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Plus-minus corretto con regressione ridge (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Restringimento: Bayes empirico | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Esiti attesi: dai gol attesi ai duelli attesi | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Misurare posizionamenti, rotazioni e attese | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Il problema della riflessione: copiare o causa comune | herding, conformity | Manski 1993 |
| `method.streak-correction` | Serie con la correzione per sequenze finite | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Parametri d'ordine di polarizzazione e roteamento | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Guide dalla correlazione della direzione con ritardo temporale | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Test a cascata sul percorso per il gregarismo | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Separazione delle corsie e persistenza dei sentieri | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Rischio dei ritardatari | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Curva di rottura | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Risposta al fuoco in arrivo | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Rischio dopo una perdita o un guadagno | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Accordo sugli acquisti (kappa di Fleiss) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Casi storici (277) {#historical-cases-277}

| id | caso | quando | scala | pattern | fonti |
|---|---|---|---|---|---|
| `case.thermopylae` | Termopili | 480 a.C. | battaglia | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamina | 480 a.C. | battaglia | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Maratona | 490 a.C. | battaglia | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuttra | 371 a.C. | battaglia | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 a.C. | battaglia | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Lago Trasimeno | 217 a.C. | battaglia | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Canne | 216 a.C. | battaglia | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Foresta di Teutoburgo | 9 d.C. | battaglia | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | battaglia | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Ponte di Stirling | 1297 | battaglia | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Azincourt | 1415 | battaglia | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | battaglia | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | battaglia | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | battaglia | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | battaglia | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: le alture di Marye | 1862 | ingaggio | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | ingaggio | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: la carica di Pickett | 1863 | ingaggio | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | battaglia | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | ingaggio | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | campagna | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | La Somme, primo giorno | 1 luglio 1916 | battaglia | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | campagna | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutland | 1916 | battaglia | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | battaglia | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan e le Ardenne | maggio 1940 | campagna | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Controffensiva di Arras | 21 maggio 1940 | ingaggio | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Battaglia d'Inghilterra | lug-ott 1940 | campagna | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Battaglia dell'Atlantico: ricerca operativa sui convogli | 1939-45 | campagna | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | giugno 1942 | battaglia | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Secondo El Alamein | ott-nov 1942 | battaglia | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Passo di Kasserine | feb 1943 | battaglia | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrado | ago 1942-feb 1943 | campagna | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | luglio 1943 | campagna | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prochorovka | 12 luglio 1943 | ingaggio | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13 giugno 1944 | ingaggio | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Siepi della Normandia | giugno-luglio 1944 | campagna | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operazione Cobra | luglio 1944 | campagna | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Golfo di Leyte | ott 1944 | battaglia | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | dic 1944 | battaglia | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | maggio 1905 | battaglia | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inchon | set 1950 | campagna | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | Corridoio dei MiG | 1950-53 | campagna | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | battaglia | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | nov 1965 | ingaggio | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operazione Bolo | 2 gennaio 1967 | ingaggio | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: la Valle delle Lacrime | ott 1973 | battaglia | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinai: la Fattoria Cinese | ott 1973 | battaglia | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Valle della Bekaa (Operazione Mole Cricket 19) | giugno 1982 | battaglia | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Guerra aerea delle Falkland | mag-giu 1982 | campagna | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Campagna aerea di Desert Storm | gen-feb 1991 | campagna | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 febbraio 1991 | ingaggio | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadiscio | ott 1993 | ingaggio | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozny | dic 1994-feb 1995 | battaglia | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | gen-mar 1968 | battaglia | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Campagna aerea del Kosovo | mar-giu 1999 | campagna | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Falluja (Operazione Al Fajr) | nov 2004 | battaglia | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | campagna | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadesh | c. 1274 a.C. | battaglia | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Isso | 333 a.C. | battaglia | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 a.C. | battaglia | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carre | 53 a.C. | battaglia | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsalo | 48 a.C. | battaglia | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopoli | 378 d.C. | battaglia | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmouk | 636 d.C. | battaglia | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | battaglia | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattin | 1187 | battaglia | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | battaglia | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | battaglia | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | battaglia | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | battaglia | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | battaglia | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | battaglia | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | battaglia | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | battaglia | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | campagna | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | battaglia | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | battaglia | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | battaglia | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Lipsia | 1813 | battaglia | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | battaglia | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | battaglia | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | campagna | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | battaglia | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | battaglia | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | battaglia | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | battaglia | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | ingaggio | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | campagna | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nov 1917 | battaglia | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | ott-nov 1917 | campagna | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | L'offensiva di primavera tedesca (Operazione Michael) | mar-apr 1918 | campagna | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | ago 1918 | battaglia | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Khalkhin Gol (Nomonhan) | ago 1939 | battaglia | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | La campagna di Polonia | set 1939 | campagna | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut e Gembloux | maggio 1940 | battaglia | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | maggio 1940 | ingaggio | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Il perimetro di Dunkerque | mag-giu 1940 | campagna | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operazione Compass e Beda Fomm | dic 1940-feb 1941 | campagna | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operazione Crusader e Sidi Rezegh | nov-dic 1941 | campagna | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | mag-giu 1942 | battaglia | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | ago-set 1942 | battaglia | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | giugno 1941 | battaglia | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Accerchiamento di Kiev | set 1941 | campagna | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Mosca | ott 1941-gen 1942 | campagna | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rzhev e Operazione Marte | 1942 | campagna | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Secondo Kharkov | maggio 1942 | battaglia | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Terzo Kharkov (il colpo di rovescio di Manstein) | feb-mar 1943 | campagna | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operazione Bagration | giugno-ago 1944 | campagna | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Sacca di Korsun-Cherkassy | gen-feb 1944 | battaglia | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Sacca di Kamenets-Podolsky | mar-apr 1944 | campagna | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operazione Epsom | giugno 1944 | battaglia | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operazione Goodwood | luglio 1944 | battaglia | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operazione Totalize | ago 1944 | battaglia | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | ago 1944 | battaglia | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Sacca di Falaise | ago 1944 | campagna | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden e Arnhem | set 1944 | campagna | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aquisgrana | ott 1944 | battaglia | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Foresta di Hürtgen | set 1944-feb 1945 | campagna | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | set 1944 | battaglia | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | dic 1944 | battaglia | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Cresta di Elsenborn | dic 1944 | battaglia | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Alture di Seelow | apr 1945 | battaglia | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlino | apr-mag 1945 | battaglia | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operazione Risveglio di primavera | mar 1945 | battaglia | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | dic 1943 | battaglia | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Insurrezione di Varsavia | ago-ott 1944 | campagna | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | nov 1943 | battaglia | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | set-nov 1944 | battaglia | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | feb-mar 1945 | battaglia | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | apr-giu 1945 | campagna | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | feb-mar 1945 | battaglia | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Manciuria (Tempesta d'agosto) | ago 1945 | campagna | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Perimetro di Pusan | ago-set 1950 | campagna | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Serbatoio di Chosin | nov-dic 1950 | campagna | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Fiume Imjin | apr 1951 | battaglia | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | apr 1951 | battaglia | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | apr e luglio 1953 | ingaggio | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | gen-apr 1968 | battaglia | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nov 1967 | battaglia | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Monte Ap Bia) | mag 1969 | ingaggio | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | giugno 1967 | battaglia | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | ott 1973 | battaglia | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | giugno 1982 | ingaggio | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Assedio di Beirut | giugno-ago 1982 | campagna | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libano 2006: Bint Jbeil e la minaccia anticarro | lug-ago 2006 | campagna | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | feb 1986 | battaglia | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Bassora (Karbala-5) | gen-feb 1987 | battaglia | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | gen-feb 1991 | battaglia | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Obiettivo Norfolk | 26-27 febbraio 1991 | battaglia | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27 febbraio 1991 | battaglia | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Finte di Wadi al-Batin | feb 1991 | campagna | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nassiriya | mar 2003 | battaglia | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Obiettivo Peach | apr 2003 | ingaggio | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Le Thunder Runs | apr 2003 | battaglia | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Passo di Debecka | apr 2003 | ingaggio | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | campagna | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | mar-mag 2008 | battaglia | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operazione Anaconda | mar 2002 | battaglia | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | luglio 2008 | ingaggio | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | ott 2009 | ingaggio | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala e le case-postazione del plotone | 2006-07 | campagna | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Battaglia di Algeri | 1956-57 | campagna | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Fireforce rhodesiana | 1974-79 | campagna | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Assedio di Sarajevo | 1992-96 | campagna | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozny 1999-2000 | dic 1999-feb 2000 | battaglia | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Guerra russo-georgiana | ago 2008 | campagna | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | luglio 2014 | ingaggio | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaisk | ago 2014 | battaglia | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltseve | gen-feb 2015 | battaglia | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Aeroporto di Donetsk | set 2014-gen 2015 | battaglia | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Aeroporto di Hostomel | feb 2022 | ingaggio | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | L'asse di Kyiv e l'imboscata di Brovary | mar 2022 | ingaggio | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol e Azovstal | feb-mag 2022 | battaglia | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Controffensiva di Kharkiv | set 2022 | campagna | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Attraversamento del Siverskyi Donets a Bilohorivka | mag 2022 | ingaggio | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bakhmut | ago 2022-mag 2023 | battaglia | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Offensiva di Zaporizhzhia | giugno-nov 2023 | campagna | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Guerra del Nagorno-Karabakh | set-nov 2020 | campagna | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Il Blitz | set 1940-mag 1941 | campagna | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: il primo giorno in aria | 22 giugno 1941 | battaglia | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Creta | mag 1941 | battaglia | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | L'assedio di Malta | 1940-1942 | campagna | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Il ponte aereo di Stalingrado | nov 1942-feb 1943 | campagna | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Battaglie aeree sul Kuban | apr-giu 1943 | campagna | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk in aria | luglio 1943 | battaglia | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operazione Bagration in aria | giugno-ago 1944 | campagna | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (Operazione Tidal Wave) | 1 agosto 1943 | ingaggio | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Il raid sulle dighe (Operazione Chastise) | 16-17 maggio 1943 | ingaggio | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Amburgo (Operazione Gomorra) | luglio-ago 1943 | battaglia | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Ratisbona | 17 agosto 1943 | battaglia | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Secondo Schweinfurt ("Giovedì nero") | 14 ottobre 1943 | ingaggio | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Big Week (Operazione Argument) | feb 1944 | campagna | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Il raid su Norimberga | 30-31 marzo 1944 | ingaggio | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operazione Bodenplatte | 1 gennaio 1945 | battaglia | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Battaglia del Mare di Bismarck | mar 1943 | battaglia | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutralizzazione di Rabaul | 1943-1944 | campagna | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Mar delle Filippine ("Tiro al tacchino delle Marianne") | giugno 1944 | battaglia | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Martedì nero su Namsi | 23 ottobre 1951 | ingaggio | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operazione Rolling Thunder | 1965-1968 | campagna | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Il ponte di Thanh Hoa | 1965-1972 | ingaggio | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | I Wild Weasel | 1965-1973 | campagna | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Il rapporto Ault e Top Gun | 1968-1972 | campagna | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operazione Linebacker | mag-ott 1972 | campagna | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("la guerra degli undici giorni") | dic 1972 | campagna | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operazione Focus (Moked) | 5 giugno 1967 | battaglia | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Guerra di logoramento: la cintura dei missili | 1969-1970 | campagna | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | L'ombrello SAM sul canale | ott 1973 | battaglia | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Operazione Opera) | 7 giugno 1981 | ingaggio | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operazione El Dorado Canyon | 15 aprile 1986 | ingaggio | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | La guerra aerea Iran-Iraq | 1980-1988 | campagna | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | I raid Black Buck | mag-giu 1982 | ingaggio | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: la pianificazione della campagna aerea del Golfo | ago 1990-gen 1991 | campagna | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: il primo attacco degli Apache | 17 gennaio 1991 | ingaggio | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | La grande caccia agli Scud | gen-feb 1991 | campagna | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Cresta di Mutla ("Autostrada della morte") | 26-27 febbraio 1991 | ingaggio | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operazione Anaconda: Apache nello Shahi-Kot | mar 2002 | battaglia | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | L'attacco degli Apache a Karbala | 24 marzo 2003 | ingaggio | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | La campagna aerea libica | mar-ott 2011 | campagna | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Nagorno-Karabakh: droni e difese antiaeree | set-nov 2020 | campagna | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ucraina: lo spazio aereo conteso | 2022 | campagna | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Aeroporto di Hostomel | feb 2022 | ingaggio | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | feb-mar 1971 | campagna | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operazione Eagle Claw | apr 1980 | ingaggio | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afghanistan: lo Stinger | 1986-1989 | campagna | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | battaglia | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | L'Invincibile Armada | 1588 | campagna | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Baia di Quiberon | 1759 | battaglia | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | La Chesapeake (Capi della Virginia) | 1781 | battaglia | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Il Nilo (baia di Aboukir) | 1798 | battaglia | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Copenaghen | 1801 | battaglia | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | mar 1862 | ingaggio | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | battaglia | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Lo Yalu | 1894 | battaglia | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Baia di Manila | 1898 | battaglia | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Baia di Helgoland | ago 1914 | battaglia | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel e le Falkland | nov-dic 1914 | campagna | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | gen 1915 | battaglia | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Il Río de la Plata | dic 1939 | battaglia | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | nov 1940 | ingaggio | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Capo Matapan | mar 1941 | battaglia | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Stretto di Danimarca e affondamento del Bismarck | mag 1941 | campagna | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7 dicembre 1941 | ingaggio | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales e Repulse | 10 dicembre 1941 | ingaggio | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Il mar di Giava | feb 1942 | battaglia | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Il mar dei Coralli | mag 1942 | battaglia | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Isola di Savo | ago 1942 | battaglia | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Isole Salomone orientali | ago 1942 | battaglia | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Capo Esperance | ott 1942 | battaglia | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Isole Santa Cruz | ott 1942 | battaglia | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Battaglia navale di Guadalcanal | 12-15 novembre 1942 | battaglia | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nov 1942 | ingaggio | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | La corsa attraverso la Manica | feb 1942 | ingaggio | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operazione Pedestal | ago 1942 | battaglia | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Maggio nero | mag 1943 | campagna | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Capo Nord | dic 1943 | battaglia | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | La campagna sottomarina statunitense contro il Giappone | 1941-1945 | campagna | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Al largo di Samar | 25 ottobre 1944 | battaglia | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Stretto di Surigao | 25 ottobre 1944 | battaglia | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: la campagna dei kamikaze | apr-giu 1945 | campagna | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | L'affondamento dell'Eilat | ott 1967 | ingaggio | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | ott 1973 | battaglia | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | L'affondamento del General Belgrano | 2 maggio 1982 | ingaggio | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | La perdita dell'HMS Sheffield | 4 maggio 1982 | ingaggio | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17 maggio 1987 | ingaggio | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operazione Praying Mantis | 18 aprile 1988 | battaglia | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | ago 2004 | ingaggio | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | La rivoluzione di Bisu | mar 2007 | battaglia | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Il Dream Coil a The International 2013 | ago 2013 | ingaggio | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Lo Zed di Faker contro Ryu | set 2013 | ingaggio | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Il boost sull'Overpass | nov 2014 | ingaggio | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | L'AWP che salta su Mirage | apr 2016 | ingaggio | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis e l'era delle utilità | 2018 | campagna | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five contro OG | apr 2019 | battaglia | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar raggiunge il grandmaster | 2019 | campagna | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Il gancio sinistro (offensiva di terra di Desert Storm) | 24-28 febbraio 1991 | campagna | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | L'incidente del Corrupted Blood | settembre 2005 | campagna | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Design di livelli e di gioco (17) {#game-and-level-design-17}

| id | titolo | pattern | fonti |
|---|---|---|---|
| `design.chokepoint` | Strozzature nel design dei livelli | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Percorsi di fianco e vie alternative | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Linee di vista e distanza di ingaggio | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Posizionamento e ritmo delle coperture | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Design dei punti di comparsa e protezione alla comparsa | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Equilibrio delle mappe simmetriche e asimmetriche | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Equilibrio delle classi e contromisure | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Flusso, anelli e disposizioni leggibili | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Economie di gioco e cicli di feedback | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Matchmaking e dispersione delle abilità | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Avversari IA come sonde del livello | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Gioco significativo e scelta | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Scambi e gioco di squadra negli sparatutto | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Controllo della mappa | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Mappe di calore e telemetria spaziale nel design | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Padronanza, apprendimento e divertimento | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Economie di round e decisioni di acquisto | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Studi (113) {#studies-113}

| id | titolo | fonti |
|---|---|---|
| `study.engel-1954` | Engel: la legge quadratica di Lanchester a Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: modelli di Lanchester sulle Ardenne | Bracken 1995 |
| `study.fricker-1998` | Fricker: modelli di logoramento sulle Ardenne rivisitati | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas e Turkes: Kursk e Ardenne | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley e Helmbold: verifica della legge quadratica | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Analisi GIS delle morti dei giocatori | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: visualizzare il comportamento competitivo | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Valutare le azioni in Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Rilevamento degli incontri negli esport | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: combattimento aereo sul Vietnam | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: giudizio quantificato delle battaglie storiche | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: l'impiego della forza spiega gli esiti | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Rassegna della visualizzazione dei dati di gioco | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester contro tre secoli di battaglie terrestri | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: sessanta ingaggi della Seconda guerra mondiale | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: modelli di combattimento e guerra civile americana | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: un modello statistico dei dati di logoramento | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: velocità di avanzata nei combattimenti terrestri | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas e Dinges: le circostanze contano più della legge | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | La banca dati di Kursk | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | La banca dati della campagna delle Ardenne | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson e MacKay: la battaglia d'Inghilterra come dati di Lanchester | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte e Schmidt: i numeri vincono ancora le battaglie | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: regolarità delle perdite in battaglia | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Il Modello Deterministico Numerico Tattico di Dupuy | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: la guerra in numeri | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: la potenza di combattimento | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter e Stam: le democrazie in guerra | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: il modello dinamico adattivo | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester e la guerriglia | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: il modello stocastico della salva | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: i fondamenti della tattica navale | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Il dibattito sulla regola 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modellare i conflitti armati | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Il rapporto Ault: missili lanciati fuori dal loro inviluppo | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Il circo di Blackett | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Impostazioni delle bombe di profondità nel Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Parti inferiori bianche per gli aerei antisommergibile | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: blindare dove non venivano colpiti i bombardieri che tornavano | Mangel & Samaniego 1984 |
| `study.optimal-search` | Ricerca ottimale: dai sommergibili all'AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: combattimento nell'inferno | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Negazione dell'accesso e negazione d'area | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Come i giocatori perdono interesse | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Raggruppare il comportamento dei giocatori sul campo | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Rilevare la frustrazione del giocatore | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: cruscotti di telemetria in produzione | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: analisi visiva del gioco | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Movimento degli avatar nei campi di battaglia di World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: strumentare i test con gli utenti su larga scala | Kim et al. 2008 |
| `study.game-data-science` | Data science per i giochi | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Intelligenza artificiale e giochi | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Abilità e movimento di squadra in Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Schemi di combattimento che prevedono le vittorie nei MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Ruoli dei giocatori in Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Prevedere l'esito di Dota 2 dai draft | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Previsione della vittoria in diretta negli esport professionistici | Hodge et al. 2021 |
| `study.rioult-2014` | Topologia delle posizioni dei giocatori | Rioult et al. 2014 |
| `study.bednarek-2017` | Valutare i giocatori negli sparatutto di squadra | Bednárek et al. 2017 |
| `study.katona-2019` | Prevedere chi muore dopo | Katona et al. 2019 |
| `study.block-2018` | Storie guidate dai dati per il pubblico degli esport | Block et al. 2018 |
| `study.ggviz` | ggViz: cercare stati di gioco su larga scala | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: apprendimento per rinforzo su larga scala in Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: livello grandmaster in StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Valore atteso del possesso nel basket | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: valutare le azioni con la palla nel calcio | Decroos et al. 2019 |
| `study.pitch-control` | Controllo del campo e creazione di spazio | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | La struttura spaziale dell'abilità difensiva | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Ruoli di squadra dai dati di tracciamento | Lucey et al. 2013 |
| `study.shot-quality` | Gol attesi e qualità del tiro | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: efficienza spaziale del tiro | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Analisi spazio-temporale degli sport di squadra | Gudmundsson & Horton 2017 |
| `study.ripley-k` | K di Ripley: raggruppamenti a ogni scala | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark ed Evans: dispersione del vicino più prossimo | Clark & Evans 1954 |
| `study.getis-ord` | Punti caldi di Getis-Ord | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Indicatori locali di associazione spaziale | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | La statistica a scansione spaziale | Kulldorff 1997 |
| `study.kde` | Stima della densità con nucleo | Silverman 1986 |
| `study.knox-1964` | Interazione spazio-tempo | Knox 1964; Diggle 2013 |
| `study.maup` | Il problema dell'unità areale modificabile | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isovist e grafi di visibilità | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Space syntax | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Affollamento medio | Lloyd 1967 |
| `study.survival-analysis` | Analisi di sopravvivenza per il tempo alla morte | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Modelli lineari generalizzati per i conteggi | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap e stime per intervalli | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: latenza e il vantaggio di chi sbircia | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee e Chang: sparare dietro un angolo | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: latenza e azioni dei giocatori | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: professionisti e dilettanti attraverso la probabilità di vittoria | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: decisioni economiche in Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: uccisioni intelligenti e morti inutili | Maymin 2021 |
| `study.moba-live-prediction` | Previsione dell'esito in diretta nei MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: round di Valorant dalle caratteristiche tattiche | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: ruoli nel Counter-Strike 2 professionistico | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: addestramento al combattimento ravvicinato | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Turbolenza della folla al pellegrinaggio della Mecca del 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | I gruppi in cammino modellano le folle | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Dinamiche gerarchiche di gruppo negli stormi di piccioni | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | L'influenza sociale rende il successo diseguale e imprevedibile | Salganik et al. 2006 |
| `study.wisdom-undermined` | L'influenza sociale mina la saggezza della folla | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | La forza attrattiva di una folla | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Conformità alla maggioranza unanime | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: motivazione al combattimento in Iraq | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Coesione e prestazione: meta-analisi | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Avversione alla perdita tra i golfisti professionisti | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Mani calde nel baseball | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Calci di rigore: i professionisti giocano il minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Gioco minimax a Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Intelligenza collettiva delle squadre | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Reti sociali di un mondo online | Szell et al. 2010 |
| `study.team-networks` | Reti di passaggi e prestazione della squadra | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | I comportamenti si diffondono attraverso reti raggruppate | Centola 2010 |

### Bibliografia {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(verificato 2026-11-15: dettaglio)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(verificato 2026-11-15: dettaglio)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(verificato 2026-11-15: dettaglio)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(verificato 2026-11-15: dettaglio)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(verificato 2026-11-15: dettaglio)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(verificato 2026-11-15: dettaglio)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(verificato 2026-11-15: dettaglio)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(verificato 2026-11-15: dettaglio)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(verificato 2026-11-15: dettaglio)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(verificato 2026-11-15: dettaglio)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(verificato 2026-11-15: dettaglio)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(verificato 2026-11-15: dettaglio)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(verificato 2026-11-15: dettaglio)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(verificato 2026-11-15: dettaglio)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(verificato 2026-11-15: dettaglio)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(verificato 2026-11-15: dettaglio)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(verificato 2026-11-15: dettaglio)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(verificato 2026-11-15: dettaglio)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(verificato 2026-11-15: dettaglio)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(verificato 2026-11-15: dettaglio)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(verificato 2026-11-15: dettaglio)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(verificato 2026-11-15: dettaglio)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(verificato 2026-11-15: dettaglio)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(verificato 2026-11-15: dettaglio)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(verificato 2026-11-15: dettaglio)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(verificato 2026-11-15: dettaglio)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(verificato 2026-11-15: dettaglio)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(verificato 2026-11-15: esistenza)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(verificato 2026-11-15: dettaglio)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(verificato 2026-11-15: dettaglio)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(verificato 2026-11-15: dettaglio)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(verificato 2026-11-15: dettaglio)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(verificato 2026-11-15: dettaglio)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(verificato 2026-11-15: dettaglio)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(verificato 2026-11-15: esistenza)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(verificato 2026-11-15: dettaglio)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(verificato 2026-11-15: dettaglio)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(verificato 2026-11-15: dettaglio)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(verificato 2026-11-15: dettaglio)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(verificato 2026-11-15: dettaglio)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(verificato 2026-11-15: dettaglio)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(verificato 2026-11-15: esistenza)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(verificato 2026-11-15: dettaglio)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(verificato 2026-11-15: dettaglio)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(verificato 2026-11-15: dettaglio)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(verificato 2026-11-15: dettaglio)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(verificato 2026-11-15: esistenza)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(verificato 2026-11-15: dettaglio)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(verificato 2026-11-15: dettaglio)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(verificato 2026-11-15: dettaglio)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(verificato 2026-11-15: dettaglio)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(verificato 2026-11-15: esistenza)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(verificato 2026-11-15: dettaglio)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(verificato 2026-11-15: dettaglio)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(verificato 2026-11-15: dettaglio)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(verificato 2026-11-15: dettaglio)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(verificato 2026-11-15: dettaglio)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(verificato 2026-11-15: dettaglio)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(verificato 2026-11-15: dettaglio)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(verificato 2026-11-15: dettaglio)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(verificato 2026-11-15: dettaglio)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(verificato 2026-11-15: dettaglio)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(verificato 2026-11-15: dettaglio)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(verificato 2026-11-15: dettaglio)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(verificato 2026-11-15: dettaglio)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(verificato 2026-11-15: dettaglio)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(verificato 2026-11-15: dettaglio)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(verificato 2026-11-15: dettaglio)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(verificato 2026-11-15: dettaglio)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(verificato 2026-11-15: dettaglio)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(verificato 2026-11-15: dettaglio)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(verificato 2026-11-15: dettaglio)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(verificato 2026-11-15: dettaglio)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(verificato 2026-11-15: dettaglio)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(verificato 2026-11-15: esistenza)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(verificato 2026-11-15: dettaglio)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(verificato 2026-11-15: dettaglio)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(verificato 2026-11-15: dettaglio)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(verificato 2026-11-15: esistenza)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(verificato 2026-11-15: esistenza)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(verificato 2026-11-15: dettaglio)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(verificato 2026-11-15: dettaglio)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(verificato 2026-11-15: dettaglio)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(verificato 2026-11-15: esistenza)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(verificato 2026-11-15: dettaglio)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(verificato 2026-11-15: dettaglio)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(verificato 2026-11-15: dettaglio)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(verificato 2026-11-15: dettaglio)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(verificato 2026-11-15: dettaglio)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(verificato 2026-11-15: esistenza)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(verificato 2026-11-15: dettaglio)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(verificato 2026-11-15: dettaglio)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(verificato 2026-11-15: dettaglio)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(verificato 2026-11-15: dettaglio)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(verificato 2026-11-15: dettaglio)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(verificato 2026-11-15: dettaglio)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(verificato 2026-11-15: dettaglio)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(verificato 2026-11-15: dettaglio)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(verificato 2026-11-15: esistenza)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(verificato 2026-11-15: dettaglio)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(verificato 2026-11-15: dettaglio)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(verificato 2026-11-15: dettaglio)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(verificato 2026-11-15: dettaglio)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(verificato 2026-11-15: dettaglio)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(verificato 2026-11-15: dettaglio)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(verificato 2026-11-15: dettaglio)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(verificato 2026-11-15: dettaglio)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(verificato 2026-11-15: dettaglio)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(verificato 2026-11-15: esistenza)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(verificato 2026-11-15: dettaglio)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(verificato 2026-11-15: dettaglio)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(verificato 2026-11-15: dettaglio)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(verificato 2026-11-15: dettaglio)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(verificato 2026-11-15: dettaglio)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(verificato 2026-11-15: dettaglio)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(verificato 2026-11-15: dettaglio)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(verificato 2026-11-15: dettaglio)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(verificato 2026-11-15: dettaglio)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(verificato 2026-11-15: dettaglio)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(verificato 2026-11-15: dettaglio)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(verificato 2026-11-15: dettaglio)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(verificato 2026-11-15: dettaglio)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(verificato 2026-11-15: dettaglio)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(verificato 2026-11-15: dettaglio)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(verificato 2026-11-15: dettaglio)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(verificato 2026-11-15: dettaglio)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(verificato 2026-11-15: dettaglio)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(verificato 2026-11-15: esistenza)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(verificato 2026-11-15: dettaglio)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(verificato 2026-11-15: dettaglio)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(verificato 2026-11-15: dettaglio)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(verificato 2026-11-15: dettaglio)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(verificato 2026-11-15: dettaglio)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(verificato 2026-11-15: dettaglio)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(verificato 2026-11-15: dettaglio)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(verificato 2026-11-15: dettaglio)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(verificato 2026-11-15: dettaglio)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(verificato 2026-11-15: dettaglio)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(verificato 2026-11-15: dettaglio)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(verificato 2026-11-15: dettaglio)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(verificato 2026-11-15: dettaglio)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(verificato 2026-11-15: dettaglio)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(verificato 2026-11-15: dettaglio)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(verificato 2026-11-15: dettaglio)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(verificato 2026-11-15: dettaglio)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(verificato 2026-11-15: dettaglio)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(verificato 2026-11-15: dettaglio)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(verificato 2026-11-15: dettaglio)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(verificato 2026-11-15: dettaglio)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(verificato 2026-11-15: dettaglio)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(verificato 2026-11-15: dettaglio)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(verificato 2026-11-15: dettaglio)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(verificato 2026-11-15: dettaglio)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(verificato 2026-11-15: dettaglio)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(verificato 2026-11-15: dettaglio)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(verificato 2026-11-15: dettaglio)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(verificato 2026-11-15: dettaglio)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(verificato 2026-11-15: dettaglio)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(verificato 2026-11-15: dettaglio)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(verificato 2026-11-15: dettaglio)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(verificato 2026-11-15: dettaglio)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(verificato 2026-11-15: dettaglio)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(verificato 2026-11-15: dettaglio)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(verificato 2026-11-15: dettaglio)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(verificato 2026-11-15: dettaglio)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(verificato 2026-11-15: dettaglio)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(verificato 2026-11-15: dettaglio)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(verificato 2026-11-15: dettaglio)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(verificato 2026-11-15: dettaglio)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(verificato 2026-11-15: dettaglio)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(verificato 2026-11-15: dettaglio)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(verificato 2026-11-15: dettaglio)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(verificato 2026-11-15: dettaglio)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(verificato 2026-11-15: dettaglio)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(verificato 2026-11-15: dettaglio)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(verificato 2026-11-15: dettaglio)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(verificato 2026-11-15: dettaglio)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(verificato 2026-11-15: dettaglio)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(verificato 2026-11-15: dettaglio)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(verificato 2026-11-15: dettaglio)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(verificato 2026-11-15: dettaglio)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(verificato 2026-11-15: dettaglio)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(verificato 2026-11-15: dettaglio)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(verificato 2026-11-15: dettaglio)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(verificato 2026-11-15: dettaglio)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(verificato 2026-11-15: esistenza)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(verificato 2026-11-15: dettaglio)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(verificato 2026-11-15: dettaglio)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(verificato 2026-11-15: dettaglio)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(verificato 2026-11-15: dettaglio)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(verificato 2026-11-15: dettaglio)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(verificato 2026-11-15: dettaglio)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(verificato 2026-11-15: dettaglio)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(verificato 2026-11-15: dettaglio)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(verificato 2026-11-15: dettaglio)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(verificato 2026-11-15: dettaglio)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(verificato 2026-11-15: dettaglio)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(verificato 2026-11-15: dettaglio)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(verificato 2026-11-15: dettaglio)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(verificato 2026-11-15: dettaglio)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(verificato 2026-11-15: dettaglio)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(verificato 2026-11-15: dettaglio)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(verificato 2026-11-15: dettaglio)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(verificato 2026-11-15: dettaglio)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(verificato 2026-11-15: dettaglio)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(verificato 2026-11-15: dettaglio)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(verificato 2026-11-15: dettaglio)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(verificato 2026-11-15: dettaglio)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(verificato 2026-11-15: esistenza)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(verificato 2026-11-15: dettaglio)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(verificato 2026-11-15: dettaglio)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(verificato 2026-11-15: dettaglio)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(verificato 2026-11-15: dettaglio)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(verificato 2026-11-15: dettaglio)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(verificato 2026-11-15: dettaglio)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(verificato 2026-11-15: dettaglio)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(verificato 2026-11-15: dettaglio)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(verificato 2026-11-15: dettaglio)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(verificato 2026-11-15: dettaglio)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(verificato 2026-11-15: dettaglio)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(verificato 2026-11-15: dettaglio)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(verificato 2026-11-15: dettaglio)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(verificato 2026-11-15: esistenza)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(verificato 2026-11-15: dettaglio)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(verificato 2026-11-15: dettaglio)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(verificato 2026-11-15: dettaglio)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(verificato 2026-11-15: dettaglio)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(verificato 2026-11-15: dettaglio)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(verificato 2026-11-15: dettaglio)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(verificato 2026-11-15: dettaglio)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(verificato 2026-11-15: dettaglio)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(verificato 2026-11-15: dettaglio)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(verificato 2026-11-15: dettaglio)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(verificato 2026-11-15: esistenza)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(verificato 2026-11-15: dettaglio)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(verificato 2026-11-15: dettaglio)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(verificato 2026-11-15: dettaglio)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(verificato 2026-11-15: dettaglio)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(verificato 2026-11-15: dettaglio)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(verificato 2026-11-15: esistenza)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(verificato 2026-11-15: dettaglio)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(verificato 2026-11-15: dettaglio)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(verificato 2026-11-15: dettaglio)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(verificato 2026-11-15: dettaglio)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(verificato 2026-11-15: dettaglio)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(verificato 2026-11-15: esistenza)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(verificato 2026-11-15: dettaglio)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(verificato 2026-11-15: dettaglio)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(verificato 2026-11-15: dettaglio)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(verificato 2026-11-15: dettaglio)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(verificato 2026-11-15: esistenza)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(verificato 2026-11-15: dettaglio)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(verificato 2026-11-15: dettaglio)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(verificato 2026-11-15: dettaglio)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(verificato 2026-11-15: dettaglio)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(verificato 2026-11-15: dettaglio)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(verificato 2026-11-15: dettaglio)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(verificato 2026-11-15: dettaglio)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(verificato 2026-11-15: dettaglio)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(verificato 2026-11-15: dettaglio)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(verificato 2026-11-15: dettaglio)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(verificato 2026-11-15: esistenza)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(verificato 2026-11-15: dettaglio)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(verificato 2026-11-15: dettaglio)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(verificato 2026-11-15: dettaglio)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(verificato 2026-11-15: dettaglio)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(verificato 2026-11-15: dettaglio)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(verificato 2026-11-15: dettaglio)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(verificato 2026-11-15: dettaglio)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(verificato 2026-11-15: dettaglio)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(verificato 2026-11-15: dettaglio)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(verificato 2026-11-15: dettaglio)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(verificato 2026-11-15: esistenza)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(verificato 2026-11-15: esistenza)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(verificato 2026-11-15: dettaglio)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(verificato 2026-11-15: dettaglio)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(verificato 2026-11-15: dettaglio)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(verificato 2026-11-15: dettaglio)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(verificato 2026-11-15: dettaglio)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(verificato 2026-11-15: esistenza)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(verificato 2026-11-15: esistenza)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(verificato 2026-11-15: dettaglio)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(verificato 2026-11-15: dettaglio)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(verificato 2026-11-15: esistenza)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(verificato 2026-11-15: dettaglio)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(verificato 2026-11-15: dettaglio)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(verificato 2026-11-15: dettaglio)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(verificato 2026-11-15: dettaglio)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(verificato 2026-11-15: dettaglio)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(verificato 2026-11-15: dettaglio)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(verificato 2026-11-15: dettaglio)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(verificato 2026-11-15: dettaglio)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(verificato 2026-11-15: dettaglio)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(verificato 2026-11-15: dettaglio)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(verificato 2026-11-15: dettaglio)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(verificato 2026-11-15: dettaglio)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(verificato 2026-11-15: dettaglio)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(verificato 2026-11-15: dettaglio)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(verificato 2026-11-15: esistenza)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(verificato 2026-11-15: dettaglio)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(verificato 2026-11-15: dettaglio)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(verificato 2026-11-15: dettaglio)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(verificato 2026-11-15: dettaglio)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(verificato 2026-11-15: dettaglio)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(verificato 2026-11-15: dettaglio)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(verificato 2026-11-15: dettaglio)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(verificato 2026-11-15: dettaglio)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(verificato 2026-11-15: dettaglio)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(verificato 2026-11-15: dettaglio)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(verificato 2026-11-15: dettaglio)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(verificato 2026-11-15: dettaglio)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(verificato 2026-11-15: dettaglio)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(verificato 2026-11-15: dettaglio)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(verificato 2026-11-15: dettaglio)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(verificato 2026-11-15: dettaglio)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(verificato 2026-11-15: dettaglio)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(verificato 2026-11-15: dettaglio)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(verificato 2026-11-15: dettaglio)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(verificato 2026-11-15: dettaglio)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(verificato 2026-11-15: dettaglio)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(verificato 2026-11-15: dettaglio)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(verificato 2026-11-15: dettaglio)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(verificato 2026-11-15: dettaglio)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(verificato 2026-11-15: dettaglio)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(verificato 2026-11-15: dettaglio)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(verificato 2026-11-15: dettaglio)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(verificato 2026-11-15: dettaglio)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(verificato 2026-11-15: dettaglio)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(verificato 2026-11-15: dettaglio)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(verificato 2026-11-15: dettaglio)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(verificato 2026-11-15: dettaglio)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(verificato 2026-11-15: dettaglio)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(verificato 2026-11-15: dettaglio)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(verificato 2026-11-15: dettaglio)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(verificato 2026-11-15: dettaglio)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(verificato 2026-11-15: dettaglio)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(verificato 2026-11-15: dettaglio)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(verificato 2026-11-15: dettaglio)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(verificato 2026-11-15: dettaglio)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(verificato 2026-11-15: dettaglio)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(verificato 2026-11-15: dettaglio)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(verificato 2026-11-15: dettaglio)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(verificato 2026-11-15: esistenza)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(verificato 2026-11-15: esistenza)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(verificato 2026-11-15: esistenza)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(verificato 2026-11-15: esistenza)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(verificato 2026-11-15: dettaglio)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(verificato 2026-11-15: dettaglio)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(verificato 2026-11-15: dettaglio)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(verificato 2026-11-15: dettaglio)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(verificato 2026-11-15: dettaglio)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(verificato 2026-11-15: dettaglio)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(verificato 2026-11-15: dettaglio)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(verificato 2026-11-15: dettaglio)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(verificato 2026-11-15: esistenza)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(verificato 2026-11-15: dettaglio)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(verificato 2026-11-15: dettaglio)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(verificato 2026-11-15: dettaglio)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(verificato 2026-11-15: dettaglio)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(verificato 2026-11-15: esistenza)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(verificato 2026-11-15: dettaglio)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(verificato 2026-11-15: esistenza)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(verificato 2026-11-15: dettaglio)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(verificato 2026-11-15: dettaglio)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(verificato 2026-11-15: dettaglio)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(verificato 2026-11-15: dettaglio)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(verificato 2026-11-15: esistenza)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(verificato 2026-11-15: dettaglio)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(verificato 2026-11-15: dettaglio)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(verificato 2026-11-15: dettaglio)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(verificato 2026-11-15: dettaglio)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(verificato 2026-11-15: dettaglio)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(verificato 2026-11-15: dettaglio)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(verificato 2026-11-15: dettaglio)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(verificato 2026-11-15: dettaglio)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(verificato 2026-11-15: dettaglio)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(verificato 2026-11-15: dettaglio)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(verificato 2026-11-15: dettaglio)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(verificato 2026-11-15: esistenza)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(verificato 2026-11-15: dettaglio)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(verificato 2026-11-15: dettaglio)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(verificato 2026-11-15: dettaglio)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(verificato 2026-11-15: dettaglio)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(verificato 2026-11-15: dettaglio)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(verificato 2026-11-15: dettaglio)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(verificato 2026-11-15: dettaglio)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(verificato 2026-11-15: dettaglio)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(verificato 2026-11-15: dettaglio)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(verificato 2026-11-15: dettaglio)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(verificato 2026-11-15: dettaglio)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(verificato 2026-11-15: dettaglio)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(verificato 2026-11-15: dettaglio)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(verificato 2026-11-15: dettaglio)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(verificato 2026-11-15: dettaglio)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(verificato 2026-11-15: dettaglio)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(verificato 2026-11-15: dettaglio)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(verificato 2026-11-15: dettaglio)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(verificato 2026-11-15: dettaglio)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(verificato 2026-11-15: dettaglio)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(verificato 2026-11-15: esistenza)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(verificato 2026-11-15: dettaglio)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(pubblico dominio)* *(verificato 2026-11-15: esistenza)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(verificato 2026-11-15: dettaglio)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(verificato 2026-11-15: dettaglio)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(verificato 2026-11-15: dettaglio)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(verificato 2026-11-15: dettaglio)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(verificato 2026-11-15: dettaglio)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(verificato 2026-11-15: dettaglio)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(verificato 2026-11-15: dettaglio)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(verificato 2026-11-15: dettaglio)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(verificato 2026-11-15: esistenza)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(verificato 2026-11-15: dettaglio)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(verificato 2026-11-15: esistenza)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(verificato 2026-11-15: esistenza)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(verificato 2026-11-15: dettaglio)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(verificato 2026-11-15: esistenza)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(verificato 2026-11-15: dettaglio)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(verificato 2026-11-15: dettaglio)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(verificato 2026-11-15: dettaglio)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(verificato 2026-11-15: dettaglio)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(verificato 2026-11-15: dettaglio)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(verificato 2026-11-15: esistenza)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(verificato 2026-11-15: dettaglio)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(verificato 2026-11-15: dettaglio)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(verificato 2026-11-15: dettaglio)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(verificato 2026-11-15: dettaglio)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(pubblico dominio)* *(verificato 2026-11-15: dettaglio)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(verificato 2026-11-15: dettaglio)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(verificato 2026-11-15: dettaglio)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(verificato 2026-11-15: dettaglio)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(verificato 2026-11-15: esistenza)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(verificato 2026-11-15: dettaglio)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(verificato 2026-11-15: esistenza)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(verificato 2026-11-15: esistenza)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(verificato 2026-11-15: dettaglio)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(verificato 2026-11-15: dettaglio)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(verificato 2026-11-15: dettaglio)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(verificato 2026-11-15: dettaglio)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(verificato 2026-11-15: dettaglio)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(verificato 2026-11-15: dettaglio)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(verificato 2026-11-15: dettaglio)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(verificato 2026-11-15: dettaglio)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(verificato 2026-11-15: dettaglio)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(verificato 2026-11-15: dettaglio)*

<!-- kb:end -->
