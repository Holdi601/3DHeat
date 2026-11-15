---
title: "Imagini de hartă"
parent: "Niveluri și geometria fundalului"
nav_order: 1
lang: "ro"
source: "map-images.md"
source_hash: "d56614ef6bd1"
translated: true
outdated: false
---

# Imagini de hartă

O imagine de hartă este o poză plată - o hartă mică, o fotografie din satelit, un plan de etaj - așezată sub datele tale, ca să vezi unde stă căldura. Îi spui vizualizatorului unde trebuie să stea imaginea fixând două puncte ale ei în două locuri din lume (ancorele).

## Încarcă și plasează o imagine de hartă {#load-and-place-a-map-image}

1. Încarcă mai întâi datele ([Încărcarea datelor](getting-data-in.md)).
2. În **Fundal / nivel**, apasă **Imagine de hartă…** și alege poza. Este întinsă peste suprafața datelor.
3. Apasă **Potrivește la limitele datelor** dacă poza a fost mutată. Ancora 1 merge în colțul de sus-stânga al pozei, ancora 2 în colțul de jos-dreapta, la marginile datelor.
4. Dacă căldura nu se aliniază cu poza, alege două repere aflate departe unul de altul (de exemplu două colțuri opuse ale unei clădiri sau două intersecții). Citește pixelul fiecăruia de pe poză și poziția lui în lume (treci cu mouse-ul peste [riglă](measure.md) ca să citești **X** și **Z**).
5. Scrie-le în **Plasare**: pentru **Ancora 1**, **px** și **py** ale reperului, **X în lume** și **Z în lume**; la fel pentru **Ancora 2**.
6. Verifică: o urmă sau un punct fierbinte pe care îl știi pe un drum ar trebui acum să stea pe acel drum. Ajustează cifrele până când stă.

![Secțiunea Plasare cu două ancore și căldură desenată pe o poză de hartă](../assets/img/en/map-images-placement.webp)

Cele două repere trebuie să difere atât pe coloanele de pixeli, cât și pe rândurile de pixeli, altfel panoul spune *Cele două ancore au același rând sau aceeași coloană de pixeli*.

## Încărcarea {#loading}

Orice format de imagine pe care îl poate decoda browserul. O imagine a cărei latură lungă depășește **8192 px** este redusă la 8192 (cea mai mare latură pe care i se cere GPU-ului să o țină), iar panoul spune *Redusă de la W×H la w×h*.

La încărcare, imaginea este întinsă peste limitele X-Z ale setului de date (sau ±1000 de unități fără set de date), cu nordul sus, la cea mai mică Y a setului de date. Implicitele sunt **Opacitate** 100%, **Luminozitate** 0,7, **Desaturare** 100%, **Inversează nord/sud** pornit: desaturată și estompată, pentru că rolul fundalului este să te ajute să găsești un punct fierbinte, nu să concureze cu el.

## Comenzi {#controls}

| Comandă | Implicit | Interval | Înțeles |
|---|---|---|---|
| **Opacitate** | 100% | 0-100% | |
| **Luminozitate** | 0,7 | 0-2 (cursor 64) | |
| **Desaturare** | 100% | 0-100% | Fundal gri, căldură saturată. Culoarea din hartă ar concura cu culoarea din date. |
| **Inversează nord/sud** | pornit | | Care rând al imaginii este Z-ul maxim al lumii. Dacă o schimbi cu un set de date încărcat, reajustează și ancorele la limitele datelor. |
| **Plasare**: Ancora 1, Ancora 2 | colțurile imaginii pe limitele datelor | | Fiecare ancoră este un pixel al imaginii - **px** (de la stânga, 0 până la lățime) și **py** (de sus, 0 până la înălțime) - și coordonata din lume la care stă, **X în lume** și **Z în lume**. Scara și decalajul rezultă din pereche. |
| **Potrivește la limitele datelor** | | | Pune ancora 1 în colțul de sus-stânga al imaginii și ancora 2 în colțul de jos-dreapta, la limitele X-Z ale datelor. Un punct de plecare pentru plasarea exactă. Are nevoie de un set de date. |
| **Altitudine** | cea mai mică Y a setului de date | Y minim al datelor - 500 până la Y maxim + 500 (cursor Y maxim + 100.000) | Înălțimea planului hărții. Pune-l chiar sub date, ca nimic să nu fie ascuns de el. |

Linia cu numele arată `lățime×înălțime px · x × z m/px`, adică mărimea în lume a unui pixel pe fiecare axă.

## În scenă {#in-the-scene}

Imaginea este un singur patrulater cu textură, la altitudinea stabilită. La opacitate completă scrie adâncime, deci participă la [ocluzie](depth-and-culling.md) ca sol; sub 100% de opacitate este amestecată și nu scrie adâncime, deci nu ocluzionează nimic. [Rigla](measure.md) măsoară pe planul ei. [Biblioteca de niveluri](level-library.md) stochează un nivel cu imagine împreună cu ancorele sale.

## Harta Dota 2 {#dota-2-map}

**Harta Dota 2** de lângă **Imagine de hartă…** aduce desenul hărții Dota 2 actuale pe care [OpenDota](https://www.opendota.com) îl arată pe paginile sale de meci și îl plasează sub tabelele pe care [Watcher-ul](https://github.com/Holdi601/3DHeat-Watcher) le scrie din reluările Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Imaginea este adusă de pe opendota.com când se apasă butonul și nu face parte din 3DHeat; desenul celui mai nou patch este luat din lista proprie a OpenDota, iar desenul 7.40 când lista nu poate fi citită.

| | |
|---|---|
| Sursă | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Plasare | Calibrarea OpenDota: imaginea se întinde pe unitățile lumii Dota de la -8192 la 8064 pe ambele axe (celulele de 128 de unități, de la 64 la 191), nordul sus. Cu axele tabelului de reluare (Z în sus, Y inversat), aceasta înseamnă X al lumii de la -8192 la 8064 și Z al lumii de la -8064 la 8192. Aproximativ 18 unități pe pixel. |
| Altitudine | 0. Eroii stau de la 0 până la aproximativ 600. |
| Aspect | Luminozitate 0,8, desaturare 50%. |

Verificat pe reluarea unui meci public din patch-ul 7.40: traseul fiecărui erou urmează culoarele desenate, iar turnurile, cazărmile și anticii pe care îi plasează reluarea cad pe bazele desenate. Vederea **Sus** arată harta cu nordul în partea de jos a ecranului, cum arată orice tabel cu Z în sus și Y inversat.

Desenul este al OpenDota, după harta Valve; Valve nu susține 3DHeat. O hartă 3D a Dota are nevoie de jocul instalat: vezi notele Watcher-ului despre reluările Dota 2.

## Pentru dezvoltatori {#for-developers}

### Cum plasează ancorele imaginea {#how-the-anchors-place-the-image}

Din [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), cu ancorele *a* și *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Două ancore fixează atât scara, cât și decalajul pe fiecare axă independent, deci o hartă poate fi întinsă diferit pe X și pe Z, dar nu rotită. Ancorele trebuie să difere în **ambele** coordonate de pixel; când împart un rând sau o coloană, nu se poate deduce nicio scară, harta nu se desenează, iar panoul spune *Cele două ancore au același rând sau aceeași coloană de pixeli*.
