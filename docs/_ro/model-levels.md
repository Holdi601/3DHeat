---
title: "Niveluri 3D"
parent: "Niveluri și geometria fundalului"
nav_order: 2
lang: "ro"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# Niveluri 3D

Un nivel 3D este un model al locului – dealuri, străzi, clădiri – în care stau datele tale. Îți permite să vezi pe ce etaj, deal sau acoperiș este căldura. Vizualizatorul îl împarte în terenul solid (terestru), structuri (transparente, ca să te poți uita înăuntru) și apă.

## Încarcă un nivel 3D {#load-a-3d-level}

1. Încarcă mai întâi datele tale ([Încărcarea datelor](getting-data-in.md)). Modelul trebuie să folosească același spațiu al lumii și aceeași unitate ca datele, Y în sus.
2. La **Fundal / nivel**, alege o **Ținta simplificării**. Lasă-o pe *Completă - fără simplificare* decât dacă modelul este uriaș.
3. Apasă **Model 3D…** și alege un fișier `.glb`, `.gltf`, `.obj`, `.stl` sau `.ply`.
4. Așteaptă linia de progres. **Anulează** o oprește.
5. Apasă **F** în vedere. Terenul este solid, structurile sunt carcase transparente, apa este plată.
6. Ajustează aspectul în [Aspectul nivelului](level-appearance.md). Apasă **Salvează în bibliotecă** ca să păstrezi rezultatul ([Biblioteca de niveluri](level-library.md)).

![Un nivel 3D încărcat: teren opac cu curbe de nivel, clădiri transparente, apă plată](../assets/img/en/model-levels-loaded.webp)

**Model 3D…** încarcă plasa nivelului. Este analizată, clasificată și simplificată într-un worker de fundal ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)), cu o linie de progres și **Anulează**: *Se citește modelul*, *Se analizează fișierul*, *Se împachetează N texturi*, *Se clasifică N părți*, *Se simplifică terenul (N triunghiuri)*, *Se simplifică structurile (N triunghiuri)*, *Se construiește wireframe-ul*.

## Formate {#formats}

| Format | Ce se citește | Limite |
|---|---|---|
| `.glb` | Fiecare primitivă de plasă cu `mode` 4 (triunghiuri) sau fără mod, cu transformarea în lume a fiecărui nod aplicată; `POSITION`; `COLOR_0` (vec3 sau vec4) ca culoare a vârfului; `baseColorTexture` al materialului și `TEXCOORD_n` al lui ca textură; numele nodurilor și ale plaselor ca nume de părți. | Liniile și punctele sunt sărite. |
| `.gltf` | Același lucru. | Doar cu bufferele încorporate: un glTF care trimite la un `.bin` extern este refuzat cu *Exportă ca un singur .glb, ca geometria să fie încorporată.* |
| `.obj` | Fețe, cu blocurile `o` și `g` ca părți. | Doar geometrie (fără materiale). |
| `.stl` | Binar și ASCII (`solid …`). | O singură parte. |
| `.ply` | Doar ASCII. | PLY binar este refuzat cu *Convertește în .glb sau .stl binar.* |

Doar geometrie: poziții, normale și triunghiuri sudate într-un singur buffer, plus culori și coordonate de textură acolo unde există ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Un model fără triunghiuri este refuzat. Modelul trebuie să fie în același spațiu al lumii și în aceeași unitate ca datele (Y în sus): nimic nu este transformat ca să se potrivească.

## Terenul, structurile și apa {#ground-structures-and-water}

Un nivel este împărțit la import în trei clase, pentru că cer tratamente opuse ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Terestre** – desenat opac și umbrit, cu indicii de relief (pantă, curbe de nivel, o rampă de altitudine), ca poziția să poată fi citită față de el.
- **Structuri** – clădirile și recuzita stau între cameră și căldura din interiorul lor, deci sunt desenate ca o **carcasă transparentă** (fețe șterse cu o margine luminoasă, plus muchii fără duplicate) – sau, când au texturi, solide, în texturile lor.
- **Apă** – plată, fără indicii de teren: o curbă de nivel peste un lac nu are sens.

Fiecare parte (nod glTF, obiect OBJ sau grup) este clasificată singură, după prima regulă care se aplică:

1. **Eticheta exportatorului.** Un nume care începe cu `ground:`, `structure:` sau `water:` (sau cu `|` în loc de `:`) este luat ca atare. Exportatorii proiectului își etichetează fiecare parte așa.
2. **Numele de apă.** `water` ca cuvânt (nu *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Numele de teren.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Numele de structură.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometria.** O parte care acoperă mai mult de 25% din aria X-Z a hărții, cu mai mult de 60% din aria triunghiurilor ei cu fața în sus, este terestră. O parte cu mai puțin de 45% cu fața în sus, sau mai înaltă de 15% din înălțimea nivelului, în timp ce acoperă sub 10% din arie, este o structură. Partea cu fața în sus este ponderată după arie, deci o casă nu este numită plată pentru că are un acoperiș.
6. **Altfel terestră** – o parte ambiguă este implicit terestră, pentru că o carcasă implicită aproape invizibilă ar face nivelul să arate ca o eroare de randare.

Un model care este o singură parte clasificată drept structură devine în schimb teren (*plasă singură fără nume - tratată ca teren*).

### Plase de navigare {#navigation-meshes}

O parte numită `nav:…` (un `nav:walkable` al exportatorului de niveluri) este o plasă de navigare: unde poate sta un soldat. Este listată ca teren (*plasă de navigare - nedesenată, pentru că stă pe sol; clicurile o găsesc totuși*), dar **nu este desenată**. Este așezată peste terenul din care a fost generată, coplanară cu el în limita centimetrilor, iar dacă ar fi desenată ca teren, cele două suprafețe s-ar lupta pentru fiecare pixel: pe un nivel cu o textură de teren coaptă, întreaga zonă jucabilă apărea ca pete cu margini tăioase, gri și bej, câte una pentru fiecare triunghi de navigare. Este păstrată, nesimplificată, ca [selecția cu clic](camera.md#click-to-pick) să poată spune dacă un punct este accesibil pe jos. Intrările din bibliotecă nu o păstrează.

**Arată clasificarea părților (N)** în panou (arătat pentru modelele cu mai multe părți) listează fiecare parte cu clasa ei și motivul – *etichetată de exportator*, *numele se potrivește cu un tipar*, *acoperă X% din hartă, Y% cu fața în sus*, *Y% cu fața în sus, Z% din înălțimea nivelului*, *ambiguu - trecut implicit ca teren*. Ca să schimbi una, redenumește partea în modelul sursă și importă din nou; împărțirea este coaptă în bufferele de indici.

## Simplificarea {#simplification}

**Ținta simplificării** stabilește bugetul de triunghiuri pentru următorul import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Setare | Triunghiuri |
|---|---|
| *Completă - fără simplificare* (implicit) | toate |
| *Înaltă - 8M triunghiuri* | 8.000.000 |
| *Medie - 3M triunghiuri* | 3.000.000 |
| *Joasă - 800k triunghiuri* | 800.000 |
| *Siluetă - 100k triunghiuri* | 100.000 |

Bugetul este împărțit **60% pentru structuri și 40% pentru teren**, simplificate separat – structurile își pierd forma cel mai repede la decimare. Apa nu este simplificată. Simplificarea este contracția muchiilor cu metrici de eroare quadrică ([meshoptimizer](https://github.com/zeux/meshoptimizer), prin WebAssembly), după sudarea vârfurilor coincidente, astfel încât siluetele și muchiile tari supraviețuiesc. Nota de import raportează `sursă → acum triunghiuri, abatere X%`, împărțirea terenului / structurilor / apei peste părți și – când s-a folosit *Completă* pe un model peste 8M triunghiuri – propune *Înaltă* (până la 30M) sau *Medie* (peste). Fără WebAssembly simplificatorul nu este disponibil, iar importul spune asta.

Nivelurile exportatorilor proiectului au deja buget; ținta există pentru arta brută, fără niciun buget în spatele ei.

## Texturi {#textures}

Un `.glb` ale cărui părți poartă texturi de culoare de bază este desenat cu ele – un export de traseu de curse, de exemplu, are una pentru fiecare placă de teren și una pentru fiecare model plasat.

Textura terenului este arătată implicit, când există; structurile care au texturi pornesc **solide, în texturile lor** (bordurile, parapetele, zidurile de cauciucuri și panourile sunt marginile unui drum, nu clădiri în care să te uiți), cu wireframe-ul oprit și umbrirea plată oprită. Vezi [Aspectul nivelului](level-appearance.md).

## Niveluri mari {#large-levels}

- Peste **300.000** de triunghiuri de structură, muchiile structurilor pornesc oprite, iar opacitatea fețelor la 35%: cu o muchie în fiecare pixel, cartierul se citește ca alb plat.
- Planul îndepărtat al camerei se lărgește ca să încapă nivelul ([Niveluri](levels.md#what-a-level-does-for-the-heat)).

## Pentru dezvoltatori {#for-developers}

### Atlasul de texturi {#texture-atlas}

Fiecare textură este împachetată într-un **singur atlas** în workerul de import ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), astfel încât nivelul rămâne un singur desen, un singur eșantionator și un singur atribut de coordonate de textură pe ambele backend-uri:

- împachetat în rafturi, la propria mărime a fiecărei imagini, micșorat doar dacă setul nu ar încăpea **8192 px** pe oricare latură (limita implicită de mărime a texturii WebGPU);
- un **spațiu de 16 pixeli** în jurul fiecărei imagini și doar cele 5 niveluri de mip pe care le protejează acel spațiu, astfel încât un panou îndepărtat nu eșantionează textura vecinului;
- **texturile repetitive** rămân repetitive. O imagine al cărei eșantionator glTF se repetă (implicitul glTF) și ale cărei coordonate de textură ies din 0..1 – un perete de cărămidă a cărui UV merge de la 0 la 40 de-a lungul lui – devine un *plăcuț*: vârfurile își păstrează propriile coordonate și un număr de plăcuț pe 16 biți, iar shaderele încadrează coordonata în dreptunghiul plăcuțului pe fiecare pixel, luând nivelul de mip din coordonata neîncadrată, ca îmbinările să nu se vadă. Spațiul unui plăcuț conține propria margine opusă. O axă al cărei eșantionator fixează este fixată; o imagine ale cărei coordonate rămân în 0..1 este desenată ca înainte. Un nivel cu plăcuțe costă 4 octeți în plus pe vârf.

### Contractul exportatorului {#the-exporter-contract}

Ce cere vizualizatorul de la un nivel, oricine l-ar fi făcut:

- un singur `.glb`, autonom;
- `POSITION` float32, primitive triunghiulare;
- nume de noduri `ground:*`, `structure:*` și `water:*` (orice altceva este clasificat după regulile de mai sus), și `nav:*` pentru o plasă de navigare, care este păstrată, dar nu desenată;
- coordonate în spațiul lumii, **Y în sus**, în aceeași unitate ca telemetria, astfel încât datele stau pe nivel fără niciun pas de plasare.
