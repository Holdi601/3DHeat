---
title: "Fundalul lumii"
parent: "Niveluri și geometria fundalului"
nav_order: 5
has_children: true
lang: "ro"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Fundalul lumii

Un fundal din lumea reală așază terenul real sub o înregistrare de zbor: dealuri, drumuri, râuri, aerodromuri și clădiri, descărcate din date cartografice deschise și gratuite. Folosiți-l când o înregistrare Tacview ar pluti altfel deasupra unei grile goale. Este un [nivel](glossary.md), așa că căldura și figurile stau pe el.

## Construiți unul {#build-one}

1. Încărcați o înregistrare de zbor care spune unde se află pe pământ (un fișier Tacview `.acmi`), sau nu încărcați nimic și alegeți un teatru la pasul 3. Vezi [Cum aduceți datele](getting-data-in.md).
2. Deschideți **Fundal / nivel** în bara laterală.
3. Apăsați **Fundal din lumea reală** ca să construiți terenul sub datele dumneavoastră. Sau alegeți o hartă de joc în **Teatru de operații** și apăsați **Construiește fundalul teatrului** (sau **Transmite teatrul**).
4. Așteptați. Panoul arată progresul (*Dale de altitudine*, *Dale de hartă*, *Se construiește fundalul*); **Anulează** îl oprește.
5. Zburați în jur. Linia de creditare pentru datele hărții este scrisă în colțul din dreapta jos al vizualizării.

Prima construcție descarcă câteva zeci de megaocteți. Browserul îi păstrează, deci o a doua construcție a aceleiași zone nu descarcă nimic. **Uită dalele de hartă** le șterge. Butonul **Fundal din lumea reală** apare doar când datele încărcate au o referință geografică (mai jos).

Totul se construiește într-un proces de fundal ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Rezultatul înlocuiește nivelul curent și se comportă ca orice [nivel 3D](model-levels.md): ascunde căldura din spatele lui, este tăiat de felie, are [comenzile de aspect](level-appearance.md) și poate fi salvat în [bibliotecă](level-library.md).

## Unde sunt datele: referința geografică {#where-the-data-is-the-geographic-reference}

Un set de date primește o referință geografică doar de la o sursă care spune una:

- **O înregistrare ACMI**: `ReferenceLatitude` și `ReferenceLongitude` din antetul ei, și poziții pe care cititorul le proiectează pe planul tangent la elipsoidul WGS84 din acel loc (X est, Y nord, metri; înălțimile sunt altitudinea înregistrării deasupra nivelului mării). Referința se păstrează când proiecția ia **X** și **Y** drept axele solului - sugestiile proprii ale înregistrării fac asta - și se pierde când solul vine din altă coloană, de pildă **U** și **V** plate ale unui joc.
- **Un tabel Parquet ale cărui sugestii `heat3d` conțin o intrare `geo`** - tabelele DCS, MSFS, X-Plane și IL-2 (Tacview) ale [Watcher](https://github.com/Holdi601/3DHeat-Watcher). Intrarea este descrisă la [Pentru dezvoltatori](#for-developers).

Încărcarea mai multor fișiere păstrează referința doar când toate au aceeași. Orice alt încărcător nu este afectat și nu aduce niciuna.

Fundalul este proiectat în același mod și apoi trecut prin maparea axelor încărcării, astfel încât să aterizeze sub date, orice răsturnare sau scară ar aplica maparea.

## Teatrele {#theatres}

Alegătorul **Teatru de operații** listează hărțile lumii reale din DCS World (Caucaz, Nevada, Normandia 2, Canalul Mânecii, Siria, Golful Persic, Mariane, Mariane al Doilea Război Mondial, Atlanticul de Sud, Sinai, Afganistan, Kola, Germania în Războiul Rece, Irak) și din IL-2 Great Battles (Stalingrad, Moscova, Kuban, Rheinland, Normandia, Prohorovka, Velikie Luki, Arras, Odesa, Golful Finlandei / Leningrad, Coreea), fiecare cu cutia ei pe pământ ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Cutiile DCS sunt întinderile editorilor, calculate din proiecțiile publicate; cutiile IL-2, și cele DCS marcate astfel, sunt estimări din dimensiunile publicate ale hărților și din orașele de la margini - panoul spune care este care.

**Construiește fundalul teatrului** construiește două niveluri de detaliu într-o singură plasă:

| Nivel | Zona | Teren | Hartă |
|---|---|---|---|
| Teatru | toată cutia | cel mai adânc zoom până la 10 care cere cel mult 64 de dale de altitudine (aproximativ 3 km pe vârf peste Caucaz, 1 km peste Normandia) | marea, lacurile, acoperirea terenului și autostrăzile din cel mult 64 de dale vectoriale la zoom 4 până la 9 |
| Zonă detaliată | **Sub date**, **În jurul unui punct** (latitudine, longitudine, 12 până la 400 km), sau niciuna | până la zoom 12, în cel mult 100 de dale, cel mult 500 000 de vârfuri | tot ce este mai jos, din cel mult 1 500 de dale vectoriale la cel mai adânc zoom până la 14 care încape |

Zona detaliată taie o gaură în grila teatrului, lărgită până la celule întregi, astfel încât ambele grile să-și împartă liniile de margine, iar un perete subțire închide cusătura unde eșantionează înălțimile diferit.

Cu date încărcate, teatrul se construiește pe planul datelor, așa că aterizează sub ele așa cum a fost construit. Fără date, se construiește în jurul punctului de referință al teatrului (grade întregi lângă zona lui detaliată). Datele încărcate ulterior pe altă referință - un fișier ACMI își numește pe al lui - mută fundalul sub ele: mutarea exactă între cele două proiecții se calculează pe o grilă de 256 × 256 peste fundal și se citește între noduri, la un metru sau două pe un teatru întreg ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Un fundal salvat în bibliotecă își păstrează locul și se mută la fel când este încărcat sub alte date.

### Transmiterea unui teatru {#streaming-a-theatre}

**Transmite teatrul** arată teatrul așa cum arată un vizualizator de hărți de simulator de zbor: terenul vine ca multe dale mici în jurul camerei, încărcate pe măsură ce zburați și eliminate când sunt departe ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Un arbore quadtree de dale Web Mercator.** Rădăcinile de la zoom 5 acoperă 1 500 km în jurul camerei, astfel încât terenul ajunge dincolo de cutia teatrului până la orizont. O dală se împarte în cei patru copii cât timp camera este mai aproape decât de 1,4 ori lățimea ei, până la zoom 15 (aproximativ 1 km o dală, 15 m între vârfurile terenului): detaliul scade cu distanța așa cum scade pe ecran.
- **Fiecare dală are propria plasă**, construită într-un proces de lucru ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): o grilă de teren de 65 × 65 cu o margine în jurul ei (astfel încât vecinii cu detalii diferite să nu arate niciodată o crăpătură), acoperire a terenului și marea pictate pe ea, drumuri, căi ferate, lacuri, râuri, aerodromuri, piste măsurate și clădiri deasupra și, opțional, imaginea din satelit a pătratului ei. Redarea desenează dalele cu aspectul și regulile de adâncime ale nivelului, astfel încât ascund căldura din spatele lor ca orice nivel.
- **Mai întâi grosier.** Dalele se cer grosier și aproape mai întâi, câte patru descărcări odată pentru fiecare sursă; cât timp copiii unei dale se încarcă, dala ține locul lor, astfel încât vizualizarea se umple imediat și apoi se ascute.
- **Memorie**: dalele construite se păstrează până la 600 MB, cele desenate cel mai demult fiind eliminate primele. **Descărcările** rămân în memoria dalelor, ținută la un buget de 2 GB, cele mai vechi ieșind primele: zburând înapoi peste o zonă nu costă nimic, iar nu există un plafon pe construcție.
- **Salvat în bibliotecă** ca ceea ce transmite - teatrul, opțiunile lui și locul lui pe pământ - nu ca dale: încărcarea lui transmite din nou, din memoria dalelor acolo unde dalele mai există. Clicurile și inspectorul lovesc dalele așa cum lovesc orice nivel.
- Ambele redări desenează dalele: verificate una lângă alta pe o placă grafică reală (WebGPU și WebGL2 pe aceeași placă), inclusiv căldura ascunsă în spatele unei creste.
- Cu date încărcate, dalele se construiesc pe planul datelor; datele încărcate mai târziu pe alt plan reconstruiesc dalele acolo (din memorie).
- Măsurat pe zboruri sintetice peste trei locuri (Normandia, Nevada, Siria): aproximativ 63, 45 și 24 MB la prima vizită cu imagini; o a doua vizită nu descarcă nimic.

## Ce se construiește {#what-is-built}

| Parte | Sursă | Cum |
|---|---|---|
| Imagini din satelit (teatre transmise, opțional) | EOX Sentinel-2 cloudless 2016 | **Imaginile din satelit** așază mozaicul fără nori din 2016 (aproximativ 10 m un pixel, zoom 14, dalele mai adânci îl măresc) peste teren, în locul acoperirii pictate; drumurile, pistele, clădirile și numele rămân deasupra. |
| Imagini mai fine (SUA, Franța) | USGS National Map orthoimagery; IGN BD ORTHO | Cu **Imaginile din satelit** pornite, o dală de hartă de la zoom 13 care se află în întregime în interiorul Statelor Unite continentale sau al Franței metropolitane ia în loc ortofotoplanul național, cu două zoomuri mai adânc decât dala (șaisprezece din dalele ei așezate într-o singură imagine, aproximativ 1-2 m un pixel de aproape). EOX peste tot în altă parte. |
| Teren (teatre transmise) | Mapterhorn | Copernicus GLO-30 peste tot (aproximativ 19 m un pixel la zoom 12), la scara metrului acolo unde există un releveu propriu al unei țări (Franța, SUA și altele); citit cu două zoomuri mai grosier decât fiecare dală. AWS Terrain Tiles dacă Mapterhorn nu poate fi atins. |
| Teren | AWS Terrain Tiles (PNG Terrarium) | O grilă de înălțimi peste cutie: zoomul este cel mai adânc până la 12 (aproximativ 28 m un pixel la 43° N) care cere cel mult 36 de dale, iar grila se rarefiază la cel mult 400 000 de vârfuri. Desenat ca sol, cu indiciile obișnuite de relief. |
| Drumuri, căi ferate | dale vectoriale OpenFreeMap, stratul `transportation` | Panglici plate așezate pe teren, dens până la distanța terenului și ridicate cu câteva procente din ea, ca să nu se bată cu el. Lățimi după clasă, de la 16 m (autostradă) la 3 m (drum forestier, cale ferată); niciodată mai înguste decât diagonala cutiei împărțită la 5000. Cărările, feriboturile și tunelurile sunt lăsate afară. |
| Aerodromuri | stratul `aeroway` | Poligoane de pistă, pistă de rulare, platformă și heliport așezate ca sol; liniile pistei și ale pistei de rulare ca panglici de 45 m și 18 m. |
| Apă | stratul `water` | Marea plată la 0 m, lacurile și bălțile plate la cel mai jos țărm al lor, râurile așezate. Desenat ca apă: umbrire plată, fără contururi. |
| Acoperirea terenului | stratele `landcover` și `landuse` | Pictată pe vârfurile proprii ale terenului, fără triunghiuri în plus: pădurile, ierburile și parcurile verzi, terenurile agricole paie, zonele umede, nisipul, stâncile, gheața; zonele rezidențiale, industriale, comerciale, militare și carierele în tonuri stinse. Apa se pictează și sub suprafața apei, astfel încât țărmul să se citească de la orice înălțime. Solul gol primește o nuanță discretă de înălțime (gri-verzui de câmpie, maro de deal, zăpadă peste 3 000 m). Lizibil la rezoluția terenului: aproximativ 30-45 m în zona detaliată, kilometri în teatru. |
| Nume de locuri | straturile `place` și `aerodrome_label` | Orașe, târguri și sate, și aerodromuri cu codul lor ICAO, scrise peste vizualizare; cât de departe se arată fiecare fel crește odată cu înălțimea camerei, cel mult 70 odată. |
| Piste măsurate | [OurAirports](https://ourairports.com/data/) `runways.csv` (domeniu public) | Opțional (**Piste de la OurAirports**, pornit implicit): fiecare pistă deschisă cu ambele capete în listă, de la prag la prag, la lățimea listată, cu dungi laterale, linie centrală întreruptă și bare de prag. O listă de 4 MB, descărcată o dată și păstrată în memorie. |
| Clădiri | stratul `building` | Amprentele extinse de la `render_min_height` până la `render_height` (6 m când lipsește) deasupra celui mai jos sol de sub ele; părțile `hide_3d` sărite. Desenate ca structuri. |

Dalele vectoriale se citesc la zoom 14 (singurul zoom cu clădiri) când cutia cere cel mult 300 dintre ele, altfel la cel mai adânc zoom care o face, până la 8. O zonă mai mare primește doar teren.

### Aspect {#look}

Un fundal pornește cu **Arată culoarea captată** pornit - culoarea este cea care deosebește un drum deschis de solul cenușiu pe care stă, o pistă întunecată de platforma ei - cu marginile triunghiurilor terenului oprite, deoarece o grilă regulată nu spune nimic, contururi slabe, o mare opacă (o podea sub ea s-ar bate cu suprafața pentru adâncime de departe), iar clădirile gri deschis și aproape pline, cum le desenează o hartă. Marea deschisă nu primește deloc triunghiuri de teren. Restul este aspectul implicit al unui nivel de model.

## Creditele pe pânză {#credits-on-the-canvas}

Cât timp un fundal este nivelul, creditul surselor sale este scris în colțul din dreapta jos al vizualizării, fără să fie nevoie de un clic, pentru ca capturile de ecran și videoclipurile redate să îl păstreze:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Fiecare parte duce la pagina de atribuire a sursei sale (openstreetmap.org/copyright și [lista de atribuire](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) a Terrain Tiles). Un fundal salvat în bibliotecă își păstrează creditele și le arată din nou la încărcare. Textul este tradus împreună cu vizualizatorul; numele nu sunt traduse.

## Surse și condițiile lor {#sources-and-their-terms}

Fiecare sursă, licența ei și cum rămâne fundalul în condițiile ei: [Fundalul lumii: surse și condiții](world-backdrop-sources.md).

## Memoria dalelor {#the-tile-cache}

Fiecare dală, și TileJSON-ul dalelor vectoriale, se păstrează în Cache API al browserului, sub `3dheat-world-tiles-v1`, după URL. A doua construcție a aceleiași zone nu face nicio cerere și funcționează offline: TileJSON-ul se cere mai întâi și, dacă eșuează, copia lui din memorie spune care dale sunt deja păstrate. Dalele pe care serverul nu le are (marea deschisă, 404) sunt reținute și ele ca lipsă.

URL-urile dalelor vectoriale poartă data de construcție a hărții, așa că, după ce OpenFreeMap publică o nouă construcție, următorul fundal descarcă dale proaspete, iar cele vechi rămân până la golire. Memoria este ținută la 2 GB: peste această limită, dalele stocate cel mai demult se șterg primele. **Uită dalele de hartă** șterge întreaga memorie. Memoria are nevoie de o origine sigură (`https://` sau `localhost`); în altă parte, fiecare construcție descarcă din nou.

## Față de Tacview {#compared-with-tacview}

Verificat cu ochiul pe câte un loc pentru fiecare teatru, cu înregistrări sintetice: rulările de decolare cad pe liniile centrale ale pistelor desenate, traversările țărmului cad pe țărm. Partea Tacview provine din documentația sa și din capturile publicate (tacview.net, pagina sa Steam), nu din rularea lui aici.

| | Tacview 1.9 | Acest fundal, transmis |
|---|---|---|
| Întindere | tot globul | 1 500 km în jurul camerei, oriunde se află ea |
| Teren | ETOPO1 (aproximativ 1,25 km) încorporat; SRTM 25-75 m dacă utilizatorul instalează fișierele; teren DCS exportat din DCS | Copernicus GLO-30 (Mapterhorn), la scara metrului în Franța și SUA |
| Imagini | niciuna încorporată; texturi pe care utilizatorul le descarcă (Mapview, SAS Planet, suplimente precum o hartă VFR a Caucazului) | EOX Sentinel-2 cloudless 2016, aproximativ 10 m, transmis |
| Acoperirea terenului | niciuna, decât dacă este într-o textură | din OpenStreetMap, pictată pe teren (fără imagini) |
| Drumuri, căi ferate | niciuna, decât dacă sunt într-o textură | fiecare clasă aproape de cameră, drumurile mari departe |
| Clădiri | niciuna | amprente extinse aproape de cameră |
| Aerodromuri | etichete și piste ca cutii plate, fără marcaje | piste de la capete măsurate, cu dungi laterale, linie centrală și bare de prag; piste de rulare, platforme; nume cu coduri ICAO |
| Nume de locuri | câteva etichete de sate și orașe | orașe, târguri, sate, aerodromuri, după distanță și înălțime |

Unde mai este în urmă:

- **Rezoluția imaginilor**: în afara SUA și a Franței, mozaicul satelit de 10 m este moale sub aproximativ 2 km; Tacview cu o textură de zoom 17 instalată de utilizator este mai ascuțit acolo.
- **Terenul în forma proprie a DCS**: Tacview poate arăta terenul pe care îl exportă chiar DCS; aici este pământul real, care diferă de terenul DCS acolo unde modelatorii hărții l-au schimbat.
- **Curbura**: solul este un plan plat, deci orizontul nu este al unui pământ curbat; Tacview desenează o sferă.
- **Viteza**: prima vizită într-un loc descarcă zeci de megaocteți înainte să fie ascuțit; într-un browser cu randare prin software (capturile de ecran) desenează la câteva cadre pe secundă cu câteva sute de dale.

## Limite și ce urmează {#limits-and-what-comes-later}

- **Rezoluția terenului**: aproximativ 30 m în cel mai bun caz, și mai grosier în zone mari. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (GeoTIFF optimizat pentru cloud pe AWS, fără cheie, cu un text fix de credit) este sursa mai bună: 30 m peste tot, GLO-90 acolo unde GLO-30 are lacune (Armenia și Azerbaidjan, pe care le acoperă DCS Caucasus). Are nevoie de un cititor GeoTIFF și nu este încă folosit.
- **Teren mai bun**: Copernicus GLO-30 pe AWS nu trimite anteturi CORS, deci un browser nu îl poate citi; oglinda OpenTopography poate fi citită (CORS și intervale), dar condițiile lor pentru utilizarea în timpul rulării unei aplicații publice nu sunt cunoscute - de întrebat înainte de orice utilizare. Mapterhorn are deja GLO-30.
- **Curbura**: solul este un plan plat, iar înălțimile nu se coboară pentru curbura pământului, potrivit cu felul în care sunt puse înregistrările (altitudinea ca înălțime); departe de referință, ambele se abat împreună, cu mai puțin de o parte la mie la 100 km. Îndoirea doar a dalelor le-ar despărți de date departe, deci nu se oferă. Un orizont curbat cere aceeași coborâre - pătratul distanței de la cameră împărțit la dublul razei pământului - aplicată în fiecare trecere care desenează o poziție (nivel, dale, căldură, linii, cutii, etichete, selectare) ca un singur uniform comun; un glob adevărat cere și poziții centrate pe pământ pentru date și redare relativă la cameră. Amândouă sunt planificate odată cu modul glob.
- **Doar lumea de azi**: hărțile istorice ale DCS și IL-2 (Normandia 2, Canalul Mânecii, Germania în Războiul Rece, fiecare hartă IL-2) sunt desenate cu orașele, drumurile și lucrările de coastă de azi; panoul spune asta. Aerodromurile din epocă nu sunt desenate.
- **Fără mod glob**: un fundal este un plan local plat. O vedere a întregului pământ este planificată.
- Drumurile sunt lărgite în zone mari, ca să rămână vizibile; de aproape sunt mai late decât în viață.
- Numele teatrelor DCS din tabelele Watcher se potrivesc cum le dă DCS în `mission.theatre`; un nume care nu este în listă revine la prima fixare rotunjită la grade întregi și la latitudine și longitudine doar.

## Hărți istorice (încă neconstruite) {#historical-maps-not-built-yet}

Hărțile de epocă ar putea texturiza mai târziu teatrele istorice. Seriile US Army Map Service (AMS) sunt lucrări ale guvernului federal al SUA, tratate în general ca domeniu public (verificați înregistrarea fiecărei scanări; multe sunt reeditări ale originalelor GSGS britanice sau germane, al căror drept de coroană sau termen pentru lucrări anonime a expirat și el):

| Teatrul | Seria | Unde sunt scanate |
|---|---|---|
| IL-2 Stalingrad, Moscova, Kuban, Velikie Luki, Prohorovka, Leningrad | AMS **N501**, Europa de Est 1:250 000 (compilată în anii 1950 din hărți sovietice și germane) | UT Austin PCL; unele foi georeferențiate la UT GeoData |
| IL-2 Normandia, DCS Normandia 2 și Canalul Mânecii | AMS **M661** / GSGS 4250, Franța 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250 000 și **M841** 1:25 000 (Germania) | UT Austin PCL |
| IL-2 Coreea | AMS **L751** 1:50 000 (ediții din 1951) și **L552** 1:250 000 | ANU Open Research (foile L751, „copyright expired”), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | hărți britanice ale tranșeelor din Primul Război Mondial (nu AMS) | McMaster University; National Library of Scotland (condiții necomerciale) |

Foile AMS au marcaje de latitudine și longitudine la colțuri, deci fiecare ar fi așezată printr-o potrivire în patru colțuri și pictată pe teren ca textură, construită și păstrată local ca dalele.

## Pentru dezvoltatori {#for-developers}

### Intrarea `geo` dintr-un tabel Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` și `up` numesc coloanele care țin metrii spre est și spre nord pe același plan tangent la (`lat0`, `lon0`) și altitudinea. Încărcarea păstrează referința când maparea ei ia exact aceste coloane (est ca X, nord și înălțimea ca Y și Z, în oricare ordine). Intrarea opțională `dcs` numește metrii proprii ai unui tabel DCS (x nord, y sus, z est) și teatrul lui: o încărcare care mapează aceste coloane se așază în schimb prin proiecția Mercator transversală a teatrului ([coordonatele DCS](#dcs-coordinates)). Un tabel fără `geo` se citește ca înainte.

### Coordonatele DCS {#dcs-coordinates}

Fiecare teatru DCS este o proiecție Mercator transversală (WGS84, scară 0,9996), cu propriul meridian central și propria origine falsă, x-ul DCS fiind nordul și z-ul estul. Constantele sunt cele publicate de proiectul pydcs; matematica este seria lui Krüger de ordinul șase (Karney 2011), portată în [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Un fundal pentru metrii DCS se construiește direct în ei, astfel încât un tabel Watcher DCS mapat prin `dcs_x`/`dcs_y`/`dcs_z`, un nivel scris de convertorul de teren DCS și fundalul împart toate același cadru. Constantele pentru Irak nu sunt publicate; sunt ajustate pe puncte de referință publicate (4 cm rădăcina pătratică medie).

Tabelele DCS ale Watcher sunt pe un plan tangent la punctul fix de referință al teatrului (același punct pe care îl folosește alegătorul de teatre, mai jos), deci mai multe misiuni pe un teatru se îmbină cu referința lor intactă și se aliniază cu un fundal de teatru fără să-l mute.

### Simplificare și buget {#simplification-and-budget}

- Clădirile sub 20 m² sunt eliminate; 60 m² când cutia are peste 30 km în lățime, 150 m² dincolo de 80 km. Restul se adaugă cele mai mari primele, până când clădirile ajung la 1,5M de triunghiuri.
- Drumurile minore, drumurile de serviciu și drumurile forestiere se elimină dincolo de 60 km în lățime; dincolo de 150 km rămân doar autostrăzile, drumurile principale, primare și secundare.
- Fundalul întreg rămâne sub aproximativ 3M de triunghiuri. Nota de import spune câte clădiri au fost lăsate afară.
