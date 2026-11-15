---
title: "Maniobres"
parent: "Troballes"
nav_order: 4
lang: "ca"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Maniobres: com es mouen els grups

**Troballes → Maniobres** segueix com es mouen les unitats de cada bàndol *com a grups*
i anomena les maniobres que fan: un flanqueig, una tenallada, una ruptura, una
emboscada, una retirada, una defensa antimíssils, creuar la T. Per a cada una
mostra com n'està de segura, les xifres que hi ha darrere, si va rendir, i les
seves semblances amb la doctrina i la història. **Anàlisi massiva → Maniobres**
les compta en milers de partides: amb quina freqüència es fa cada una per mapa,
mode i bàndol, i amb quina freqüència rendeix.

Tot es calcula al teu navegador, en el seu propi treball en segon pla
(`src/insights/maneuver`). Una partida de unes quantes centenars d'unitats triga
de 10 a 500 ms; una guerra aèria de dues hores amb milers d'objectes triga
un segon aproximadament.

## Com s'usa {#using-it}

- Obre **Troballes**, pestanya **Maniobres**. Compta en obrir-la per primera
  vegada; **Tornar a cercar** després de canviar els filtres.
- **Segura / Probable / Possible** fixa el nivell de confiança que es mostra
  (per defecte, Probable).
- La **línia de temps** té un carril per bàndol i una barra per maniobra; la
  **llista** de sota mostra el mateix, per ordre de temps. Un clic canvia a la
  repetició a l'inici de la maniobra, fa volar la càmera fins allà i la dibuixa
  en 3D: el camí de cada grup com una fletxa (els dos braços d'una tenallada són
  els seus arcs), els contorns dels grups en el moment clau (el de l'enemic, en
  el color del seu bàndol) i el front de l'enemic com una línia blanca.
  **Dibuixar-les totes en 3D** afegeix les altres maniobres de la partida, en
  tènue. Les línies van a la targeta gràfica una sola vegada, quan canvia la
  selecció, i no a cada fotograma: amb 480 maniobres dibuixades durant la
  reproducció, els temps de fotograma en una GPU real (WebGL2 i WebGPU, p99 de
  18,0-18,5 ms, màxim de 19,5-20,8 ms) són els mateixos que sense elles.
- Una maniobra oberta mostra el seu resultat (les baixes causades i les pèrdues
  de les unitats que la van fer, mentre durava i just després, comparades amb
  l'intercanvi del bàndol durant la partida), les seves proves i les entrades de
  la base de coneixement sobre ella: la doctrina i els paral·lels històrics
  (Cannes per a una tenallada, Sedan 1940 per a una ruptura, Tsushima per a
  creuar la T, Operació Bolo per a una feinta...).
- La petita taula del final: per tipus i bàndol, les fetes i les que van rendir.

![Una tenallada en la partida sintètica de demostració: les fletxes dels dos braços, el cos enemic i el seu front](../assets/img/en/maneuvers.webp)

## Com es troben els grups {#how-groups-are-found}

Cada unitat es col·loca en una línia de temps comuna (un pas d'1 s a peu, de 2 s
en la resta de casos, més llarg per als fitxers molt grans), mantinguda quieta
durant una mort perquè un renaixement no dibuixi una línia pel mapa. A cada
pas, les unitats d'un bàndol i d'un tipus (avions, vehicles, vaixells, infanteria)
s'enllacen quan estan a prop -18 m a peu, 170 m per a vehicles, 3 km per a
vaixells, 5 km per a avions- i es mouen igual (velocitats dins de la meitat de
la més ràpida, o totes dues quietes). Un grup manté l'identificador del grup on
hi havia la majoria dels seus membres. Una unitat sense classe es posa a peu, en
un vehicle o a l'aire segons la seva velocitat.

La **forma** d'un grup es llegeix en relació amb la seva direcció: una columna o
una línia segons com s'estenen al llarg i a través, una falca quan el del mig
encapçala, un escalonat quan els membres es van quedant enrere cap a un costat,
una caixa quan ocupen les cantonades.

Tot es jutja a l'escala de la mateixa partida: el **rang de combat** `R` és el
percentil 75 de la distància entre un assassí i la seva víctima (limitat al sentit
del domini), i els temps d'una maniobra escalen amb el tipus d'unitat (la
infanteria, un terç del terreny).

## Què troba {#what-it-finds}

| Maniobra | Es troba quan |
|---|---|
| Formació | un grup manté una mateixa forma en el 60 % dels seus passos en moviment durant 30 s |
| Atac frontal | un grup s'acosta des de fora de rang fins al contacte, ¾ R o més, des de dins de 35° de la direcció on mira l'enemic |
| Atac pel flanc | el mateix des de 50-130° (la reraguarda més enllà); segur només amb una *força de fixació* pròpia que està lluitant amb l'enemic allà (baixes en ambdós sentits) |
| Tenallada | dos atacs pel flanc d'un bàndol sobre el mateix cos enemic, des de costats oposats (100° o més de diferència), dins de 90 s; segura quan els braços hi lluiten |
| Encerclament | un grup enemic compacte amb almenys tants de l'altre bàndol al seu voltant dins de 1,5 R, de dos grups o més, sense cap buit de més de 100°, durant un minut, aïllat del seu propi bàndol; segur quan el cercle es va tancar en ½ R i va lluitar contra la butxaca |
| Penetració | un grup passa una línia mantinguda (enemics quiets 30 s a la seva esquerra i dreta, el centre del seu bàndol més enllà); segura quan arriba ½ R més enllà, s'hi queda 20 s i lluita allà; una ruptura un R més enllà |
| Cobertura alternada | en un grup petit, una part es mou mentre la resta està quieta, els rols canviant quatre vegades o més, amb foc de cobertura de la part quieta |
| Concentració / dispersió | la part d'un bàndol prop del seu punt més dens puja del 35 % al 60 % (unitats que arriben a 1,5 R o més, i després contacte), o baixa quan el bàndol es dispersa |
| Feinta | un element petit en contacte atrau dos o més enemics des d'un altre lloc; després un grup més gran ataca a quatre rangs de distància, on l'enemic té menys |
| Retirada / persecució | un grup en contacte es gira i s'allunya R des d'on lluitava; segura quan un enemic allà acabava de matar-ne un i el grup es va allunyar 2 R d'aquell assassí (mai a peu: vegeu més avall); els enemics que es mouen en la mateixa direcció i el segueixen perseguint |
| Defensa en profunditat | unitats quietes en dues o més franges a través de l'eix de l'enemic, R de profunditat, amb l'enemic avançant i foc des de les franges |
| Pendent invers | tres o més morts a curta distància per unitats quietes de víctimes que venien per sobre d'un carener |
| Emboscada | un grup en moviment topa amb enemics que estaven quiets 45 s; ells disparen primer i els qui es mouen perden dos o la meitat del grup |
| Pantalla | una o dues unitats que es mouen davant d'un cos de tres o més, topant primer amb l'enemic |
| Línies interiors | els grups d'un bàndol estan junts entre els de l'altre, les seves unitats canviant entre ells |
| Ritme | un bàndol que respon al contacte (gir, canvi de velocitat, primer tret) 1,5 vegades més ràpid, p de Mann-Whitney per sota de 0,05 |
| Manovella, muesca, arrossegament, bomba | l'objectiu d'un llançament de míssil gira el tirador fins a 35-70°, 75-105°, més de 140°, o l'arrossega i després gira enrere |
| Tenallada aèria, mur, guia-cua, trituradora | una parella que es separa per atacar un enemic; tres en fila contra l'enemic; un element 5-20 km darrere d'un altre; dos orbitant un punt a una distància d'un |
| Patrulla de combat aeri | orbita al voltant d'una estació durant tres minuts |
| Combat d'energia / d'angles | en un combat proper -rumbs separats 30°, cadascun tenint l'altre al morro per torns, o una mort entre ells- s'usa l'altura i puja, o s'aplana i gira fort mentre frena; segur quan un va matar l'altre |
| Paquet d'atac, SEAD | un grup aeri de rols barrejats, alguns dels quals ataquen el terra; les morts de defensa antiaèria abans que la majoria d'altres morts a terra |
| Línia de batalla, creuar la T | tres vaixells en columna; una columna quadrada a través del cap d'una columna enemiga |

Cada maniobra diu quins **patrons** de la base de coneixement mostra
(`patterns-maneuver.ts`: formació, atac frontal, doble envolupament,
encerclament, penetració, foc i moviment, feinta, retirada, persecució,
defensa en profunditat, pantalla, dispersió, defensa antimíssils, combat
d'angles, patrulla de combat aeri, paquet d'atac, línia de batalla, creuar la
T) i les entrades que cal llegir primer; les entrades més antigues porten els
patrons nous a través de `knowledge/maneuver-tags.ts`. Vegeu
[La lent del coneixement](knowledge.md).

**Va rendir** compara l'intercanvi de les unitats mentre durava (i un minut
després) amb el del seu bàndol durant la partida; una retirada rendeix quan
va perdre menys unitats després de girar que abans, una defensa antimíssils
quan l'avió sobreviu un minut, un encerclament quan la butxaca perd la meitat.

## Sobre moltes partides {#over-many-matches}

El resum de cada partida (`src/mass/summarize.ts`, vegeu [Anàlisi massiva](mass-analysis.md))
porta una petita secció `maneuvers`: per tipus i bàndol, les fetes (a Probable o
superior), les que van rendir, les que no, les baixes i les pèrdues.
**Anàlisi massiva → Maniobres** ho suma sobre les partides que deixa el filtre
-per mapa i mode, o en totes- amb l'interval de Wilson de la taxa de rendiment;
una fila carrega les partides on es va fer. Els resums escrits abans que existís
la secció no en tenen: executeu `node tools/3dheat-summarize.mjs <carpeta> --force`
per afegir-la.

## Com n'està de segura {#how-sure-it-is}

Partides sintètiques amb maniobres sembrades (`synth.ts`, executades per
`maneuver.test.ts`): es troben les 28 classes sembrades a Probable o superior; de
50 maniobres informades, 31 són la classe sembrada i les 19 restants també hi
són de veritat (la formació del grup en moviment, l'aproximació frontal de la
columna que penetra); cap no és errònia. En 30 partides nul·les -camins aleatoris
separats i barrejats, unitats quietes a l'atzar, avions en línies rectes, una
multitud que s'arrenca per allà- no se n'informa cap a Probable o superior.

Amb dades reals (desenes de batalles terrestres, unes quantes missions llargues
de guerra aèria, una dotzena de partides de tir): atacs frontals, flancs,
penetracions i encerclaments en les batalles de tancs; formacions i combats
propers a l'aire; defenses antimíssils, orbites de patrulla de combat aeri i
parelles guia-cua en les missions de guerra aèria; execucions frontals, columnes
i algunes emboscades i parelles de cobertura alternada en el tir. Els llindars són
les formes de la doctrina a l'escala del joc; llegiu una troballa amb les seves
proves, i les taxes de la taula massiva amb els seus intervals.

### Contra models nuls de les mateixes partides {#against-null-models-of-the-same-matches}

Un detector es pot enganyar amb el terreny i la multitud: en una batussa tot grup
té enemics a tot arreu. Per això cada tipus també es prova sobre **models nuls**
construïts a partir de les mateixes partides (`nulls.ts`), on els bàndols ja no es
troben com ho feien: la línia de temps d'un bàndol girada una tercera part o dues
terceres parts de la partida (*shift*), o les seves trajectòries giradas al
voltant del centre del mapa (*rotate*); i les etiquetes d'equip barrejades
(*teams*, que per construcció conserva prop de la meitat dels combats reals). Els
combats només es compten quan són morts aparellades amb els seus morts, l'assassí
dins de 2 R i la víctima al lloc; un model nul ho trenca. Troba una partida a
Probable o superior, reals contra els models nuls (30 batalles de tancs; 12
partides de tir):

| Tipus | Batalles de tancs: real / shift / rotate | Tir: real / shift / rotate |
|---|---|---|
| Encerclament | 0 / 0 / 0 (era 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Penetració | 0,03 / 0,02 / 0,05 (era 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flanc | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Atac frontal | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Retirada | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (així mai segura a peu) |
| Emboscada | - | 0,17 / 0,04 / 0,04 |
| Combat d'energia | 1,2 / 0,1 / 0,85 | - |
| Combat d'angles | 0,6 / 0,07 / 0,3 | - |

Els combats aeris propers sobre el centre d'un camp de batalla sobreviuen a un
gir al voltant d'aquell centre, així que la columna de rotate els afavoreix menys
del que afavoreix els tipus terrestres. Els tipus dins d'un mateix bàndol -formació,
patrulla de combat aeri, trituradora, paquet d'atac, SEAD, cobertura alternada,
pantalla- no depenen de l'altre bàndol i no es proven així. `maneuver.test.ts`
comprova que els models nuls treuen de les partides sintètiques la tenallada, el
flanqueig, l'encerclament, la penetració, l'emboscada i la retirada sembrats.

## Límits {#limits}

- Els grups necessiten posicions en el temps; un fitxer només d'esdeveniments no
  en té.
- La direcció no es llegeix de les dades: el front de l'enemic és on la força de
  fixació l'ataca, si no on es mou, si no d'on venia l'atacant.
- El terreny es llegeix de les alçades de les pròpies unitats (el pendent invers);
  no hi ha cap prova de línia de visió.
- Els fitxers molt grans es mostregen a passos més llargs; les maniobres aèries
  curtes hi es llegeixen encara a passos de 2-4 s.
