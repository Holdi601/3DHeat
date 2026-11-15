---
title: "Analiză de masă"
nav_order: 8
lang: "ro"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Analiză în masă: mii de meciuri deodată

**Analiza în masă** îți arată ce înseamnă, adunat, un întreg dosar de meciuri: ce vehicul câștigă cel mai des, ce tabără este favorizată, unde este acțiunea. Folosește-o când ai mult mai multe meciuri decât ai putea urmări.

Lucrează dintr-un rezumat mic al fiecărui meci, așa că o mie sau zece mii de meciuri se deschid repede. Încarcă rândurile complete doar pentru meciurile pe care le apeși.

## Încearcă {#try-it}

1. Deschide **Analiză în masă** în bara laterală a Căldurii.
2. Apasă **Dosar...** (sau **Fișiere...**) și alege meciurile tale `.3dheat`.
3. Așteaptă cât panoul citește rezumatele („Rezumate... n din N”).
4. Apasă **Deschide analiza**. Se deschide o fereastră cu file.
5. Setează filtrele (Joc, Hartă, Mod, De la, La), apoi citește o filă, de exemplu Echilibru.
6. Apasă pe un rând, pe o celulă sau pe o observație: meciurile ei se încarcă în vederea 3D, cu camera pe locul respectiv.

![Fila Echilibru: rata de victorie și uciderile la fiecare moarte, pe vehicul](../assets/img/en/mass-balance.webp)

```
dosar de .3dheat -> rezumate -> fereastră (file) -> apasă un rând -> meciurile se deschid în 3D
```

Un fișier `.3dheat` este un meci ([Un fișier pentru fiecare meci](container.md)). O *hartă de căldură* și un *rând* sunt explicate în [glosar](glossary.md).

## Obținerea rezumatelor {#getting-the-summaries}

Nu trebuie făcut nimic pentru majoritatea oamenilor: panoul calculează singur rezumatele care lipsesc. Ca să pregătești un dosar mare o singură dată, folosește instrumentul offline de mai jos.

Fiecare meci `.3dheat` primește un rezumat (`src/mass/summarize.ts`), păstrat în
container ca membrul `<match>.summary.json` (rolul `summary`, vezi
[Un fișier pentru fiecare meci](container.md)). Instrumentul offline le scrie, și
un index pentru fiecare dosar. Este un instrument pentru dezvoltatori; rulează-l pe un dosar mare ca să-i scuteasci panoul de muncă:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Un meci deja rezumat (aceeași versiune de format) este doar citit; `--force`
  îl calculează din nou. `--no-write` lasă containerele neatinse.
- Un fișier schimbat în ultimele `--settle` minute (10) este lăsat afară: un
  convertor s-ar putea să-l mai scrie.
- `<folder>/3dheat-index.jsonl.gz`: o linie pentru fiecare meci - calea, mărimea,
  ora și rezumatul, fără grilă. `<folder>/3dheat-index.grids.jsonl.gz`: o linie
  pentru fiecare meci cu grila lui.
- Rulează-l pe mașina care ține fișierele, cu prioritate mică (de exemplu `nice -n 19 ionice -c3` pe Linux).

Pentru fiecare meci, panoul ia primul dintre: linia de index a dosarului (aceeași
cale și mărime), memoria cache a browserului (IndexedDB, după nume, mărime și
oră), membrul `summary` din container sau un rezumat calculat într-un grup de
lucrători și păstrat în cache. Deci și un dosar fără index funcționează – prima
oară cu viteza citirii tabelelor, apoi din cache.

## Panoul {#the-panel}

Alege un dosar (sau fișiere; **Adaugă dosar...** adaugă încă unul). Fereastra are filtrele **Joc**, **Hartă**, **Mod**, **De la** și **La**, o alegere **Împarte după**, **Cele mai puține vieți** și **Doar jucători**, și aceste file. Fiecare număr vine din rezumate, iar un clic pe un rând, pe o celulă sau pe o observație încarcă meciurile ei în vedere, ca suprapunere pentru multe meciuri, cu filtrele care o arată (vehicul, clasă, armă, echipă, jucător) și camera pe locul respectiv:

| Filă | Ce arată |
|---|---|
| Prezentare | meciuri, ore, jucători, vieți, rânduri, date; meciuri pe zi; pe joc, hartă, mod; totaluri de evenimente; economia pe monedă; când se întâmplă lucrurile în meci |
| Echilibru | pe vehicul, clasă, armă sau echipă, împărțit pe hartă, mod, nivel sau joc: K/D cu intervalul său de ~95%, rata de victorie (Wilson), supraviețuirea, uciderile și loviturile pe minut, câștigul pe minut, și q – rata descoperirilor false (Benjamini-Hochberg) pentru K/D și victorie față de restul împărțirii. **Cele mai puține vieți** ascunde rândurile cu prea puține vieți ca să fie de încredere; **Doar jucători** lasă afară ce a condus IA misiunii |
| Tendințe | folosirea (partea din prezență), K/D sau rata de victorie ale vehiculelor sau claselor de top, pe zi, săptămână sau lună |
| Jucători | jucători distincți, meciuri pe jucător, jucători pe meci, cei mai frecvenți jucători |
| Tabere | fiecare tabără a fiecărei hărți: meciuri câștigate față de o împărțire egală |
| Lupta corp la corp | date pe runde: duelurile de deschidere pe tabără și conversia lor, schimburile, cel care iese din ascunziș față de cel care ține poziția, încrucișările, intrările sub efectul flash-ului, țintirea, plasările de bombă, avantajul de oameni și, **Pe hartă**, locurile care ucid jucătorii care intră în ele – fiecare ca o parte, cu intervalul său Wilson, din numărările `cqb` ale rezumatelor ([Lupta corp la corp și rundele](close-quarters.md)) |
| Suprafețe R6 | urmele Rainbow Six Siege pe nivel (găuri de glonț și altele asemenea) pe fiecare suprafață a nivelului: urme, pe rundă a hărții, camera, partea celor al căror trăgător a fost dedus; un clic deschide tipurile de urme, operatorii și clasele de armă ale trăgătorilor și unde sunt urmele pe suprafață (o mică hartă termică din celule de un sfert de metru); o suprafață își păstrează id-ul în meciurile aceleiași versiuni a hărții. Din numărările `marks` ale rezumatelor |
| Hartă | grila însumată a unei hărți: prezență, uciderii, morți, K/D, orice eveniment, fluxul, și **fierbinte în câte meciuri** (stabilitatea); pe echipă, la 1, 2, 4 sau 8 ori celula |
| Locuri | locuri care ies în evidență în cifre, dar nu în căldură (o zonă mare animată în ansamblu, coridoare, benzi de înălțime) și locuri ai căror ocupanți câștigă mai multe sau mai puține dintre rundele lor; **Găsește locuri** |
| Nișe | grupuri care merg mult mai bine sau mai rău decât restul (un vehicul pe o hartă, un sector la o înălțime) și grupuri de runde câștigate peste ce a câștigat tabăra lor în aceleași meciuri; **Găsește nișe** |
| Observații | detectoarele de mase și detectoarele de hartă (mai jos); **Copiază raportul (JSON)** dă JSON-ul pe care-l citește un model de limbaj |

## Observații peste multe meciuri {#insights-over-many-matches}

Fila **Locuri** găsește locuri care ies în evidență în cifre, dar nu în căldură – o zonă mare animată în ansamblu, un coridor, o bandă de înălțime, un loc animat doar într-o parte a meciului – marchează cu **ascuns** pe cele pe care harta simplă de căldură nu le arată și le conturează în vederea 3D; **Încarcă** zboară acolo cu meciurile pe care le ținea. Fila **Nișe** găsește grupuri (un vehicul pe o hartă și pe o tabără, un sector la o înălțime) care merg mult mai bine sau mai rău decât restul; apasă pe unul ca să vezi rafinările lui.

### Cine a câștigat {#who-won}

Când meciurile spun cine a câștigat fiecare rundă ([coloana de rezultat](data-formats.md#outcome-columns) `won`), rezultatul devine o țintă separată:

- **Locuri: rata de victorie.** Pentru fiecare tabără, partea din rundele ei într-un loc pe care le-a câștigat, față de partea pe care a câștigat-o în același meci oriunde – astfel echilibrul hărții, al taberei și al meciului sunt baza și ies în evidență doar locurile ai căror ocupanți câștigă mai multe (sau mai puține) dintre rundele lor. Un exemplu inventat: *„Dust: tabăra T câștigă mai multe dintre rundele ei când este aici: 61% din 412 câștigate, față de 49% așteptat din propria ei rată în aceleași meciuri (cote 1,6x; ținut în 31/48 meciuri).”* Aceleași verificări de rată a falselor descoperiri și de stabilitate ca la orice loc; **Încarcă** încarcă meciurile în care a fost ținut, arătând pozițiile acelei tabere.
- **Nișe: victoria în rundă.** Tabelul **Runde** conține runda fiecărei vieți: harta, tabăra, partea meciului (rundele 1-4, 5-8, ...), vehiculul (un operator, un agent), arma folosită cel mai mult, locul ținut cel mai mult, cumpărarea (eco, force, full) și dacă tabăra ei a făcut prima eliminare. Un grup este judecat față de ce a câștigat tabăra lui în aceleași meciuri, așa că *T pe Dust cu un AWP* este o nișă doar când acele runde au fost câștigate mai des decât celelalte runde ale lui T în acele meciuri. Un exemplu inventat: *„m1 · T · AWP: câștigă 80% din 320 de runde, față de 62% așteptat de la aceleași tabere în aceleași meciuri (cote 2,3x; 40 de meciuri).”* Ordonate după câștig înmulțit cu suportul; **Încarcă** încarcă meciurile ale căror runde îl arată cel mai mult.

Ambele au nevoie de rezumate de versiunea 2 (vezi [Obținerea rezumatelor](#getting-the-summaries)): cele mai vechi sunt calculate din nou.

Fila **Observații** găsește, peste toate meciurile, vehicule care fac schimburi sau câștigă mai bine sau mai rău decât restul, locuri fierbinți într-o parte stabilă a meciurilor, tabere care câștigă mai mult decât o împărțire egală, vehicule a căror folosire se mișcă în timp și părți ale meciului care țin mai multe uciderii decât o împărțire uniformă. Fiecare constatare vine cu numărările, efectul, intervalul și o rată a descoperirilor false (menținută la 5%), iar un clic încarcă meciurile ei. Detalii: [Pentru dezvoltatori](#for-developers).

## Scară {#scale}

Poți repeta singur o versiune mică a acestui lucru: `node tools/demo-data.mjs` scrie 150 de meciuri sintetice cu tancuri în `tools/.shots/demo/mass` (aproximativ 1.000 de rânduri fiecare). Măsurat pe aceste 150 de meciuri demonstrative sintetice ale `tools/demo-data.mjs`, pe un PC de birou (un meci real este mult mai mare):

- `tools/3dheat-summarize.mjs` cu 4 lucrători: 2,6 până la 4,8 s pentru toate cele 150, 8 până la 21 ms pe meci într-un lucrător; o a doua rulare care doar citește rezumatele durează aproximativ 2 s.
- Deschiderea dosarului în panou, cu indexul prezent, până când fereastra se arată: 0,9 până la 1,6 s (partea lucrătorului, citirea celor 150 de linii de index, este de 20 până la 40 ms).
- Trecerea pe o filă, până când tabelul ei este desenat: Prezentare 10 până la 30 ms, Echilibru 30 până la 70 ms, Tendințe 30 până la 45 ms, Jucători 15 până la 35 ms, Tabere 15 până la 20 ms, Hartă 55 până la 130 ms.
- Depozitul ține cele 150 de meciuri în aproximativ 0,5 MB.

Deschiderea ferestrei ia un singur cadru scurt: fișierele alese merg la lucrător câte 16 deodată, iar câmpurile de dată și prima filă apar un cadru după fereastră.

Depozitul păstrează aproximativ 15 KB pe meci, deci 10.000 de meciuri iau ~150 MB în lucrător; grilele nu sunt ținute niciodată pentru mai mult decât cere harta.

## Pentru dezvoltatori {#for-developers}

### Observații peste multe meciuri {#insights-over-many-matches}

`src/mass/detect.ts` - fiecare constatare cu numărările, efectul și intervalul ei,
p și q (Benjamini-Hochberg peste tot ce a încercat detectorul, menținut la 5%),
drumul de detaliu care încarcă meciurile ei și o cheie de propoziție cu valorile
ei; raportul (`heat3d.mass/1`) este ce dă `massReportForModel` unui narator, în
aceeași formă ca raportul pentru un singur meci (`insights/seam.ts`).

| Detector | Găsește |
|---|---|
| `balance` | un vehicul de jucător care face schimburi sau câștigă mai bine sau mai rău decât restul, pe o hartă sau într-un mod |
| `hotspot` | locuri fierbinți într-o parte stabilă a meciurilor care au venit (meciuri fierbinți / meciuri văzute, față de celelalte celule ale hărții) – nu doar fierbinte în sumă |
| `side` | o tabără a unei hărți care câștigă mai mult decât o împărțire egală |
| `meta` | partea unui vehicul din viețile jucătorilor sau K/D-ul lui care se mișcă între prima și a doua jumătate a datelor, pe hartă – suficient de mare ca să conteze, cu tendință peste trimestre, la fel pe cele mai multe hărți (mai jos) |
| `phase` | o parte din lungimea meciului care ține mai multe uciderii, lovituri, lansări... decât o împărțire uniformă |
| `place` | locuri care ies în evidență peste multe meciuri (Etapa B, mai jos): rata unei regiuni sau partea din uciderii față de cea a fiecărui meci, cercuri, coridoare, zone crescute, benzi de înălțime, faze; ascunse când harta simplă nu le arată |
| `niche` | grupuri care merg mult mai bine sau mai rău (Etapa B, mai jos) |
| `grid.*` | detectoarele pe un singur set de date (poziții de putere, zone fierbinți și liniștite, locuri pe clasă) pe grilele însumate ale fiecărei hărți: `GridMerge.toInsightJob` umple grilele trecerii de observații din rezumate; detectoarele care au nevoie de trasee sar peste |

### Rezumatul {#the-summary}

JSON simplu (`src/mass/types.ts`), aproximativ 5–30 KB comprimat pe meci:

- meciul: joc, hartă, mod, misiune, început, lungime, rânduri, vieți, jucători,
  IA, echipe (vieți, jucători, prezență, uciderii, morți, victorie, bani), câștigătorul;
- pe vehicul și pe echipă: clasă, nivel, vieți, vieți de jucător, prezență, evenimente
  după felul canonic, uciderii după clasa țintei, victorii, bani;
- pe jucător (după id-ul de utilizator, altfel nume): echipă, vieți, prezență, uciderii, morți,
  lovituri, lansări, victorie, vehicule; pe armă: evenimente după fel;
- cu o coloană de rezultat (versiunea 2): rundele câștigate și jucate pe echipă,
  vehicul (`rw`, fiecare o viață și o rundă), jucător și armă (rundele în care o
  tabără a folosit-o); runda fiecărei vieți (`outcome.u`: runda, tabăra, vehiculul,
  arma folosită cel mai mult, locul ținut cel mai mult, cumpărarea, victoria) și
  numărul, câștigătorul și tabăra primei eliminări ale fiecărei runde (`outcome.r`);
- coloanele economiei (`cost_*`, `earn_*`) și totalurile lor;
- faze: evenimente după fel, în 20 de intervale ale lungimii meciului și pe minut;
- comportament: măsurile de comportament colectiv ale meciului (aliniere, conducerea
  rutei, benzi, aglomerare, lideri, rămași în urmă, punctul de rupere, riscul după
  pierderi, serii, acordul la cumpărare, suprimare), fiecare cu propriul model nul,
  p și q – vezi [Comportamentul colectiv](collective-behaviour.md);
- grila (mai jos).

Numărat cum numără vizualizatorul: coloanele găsite cum le găsește încărcătorul
pentru multe meciuri (`leanSpec`), evenimentele prin `data/canonical.ts`; o ucidere
pe care o armă Tacview o marchează numără pentru cel care trage; o moarte spusă de
două ori deodată (`dead`, `death`) numără o singură dată.
#### Grila: pe ce se sprijină Etapa B {#the-grid-what-stage-b-builds-on}

Partea spațială este făcută pentru scanări statistice peste regiuni de orice mărime și formă, nu doar pentru imagini de căldură:

- **O piramidă.** Celulele sunt puteri alinite ale lui doi, în unități ale lumii (x, z așa cum le așază vizualizatorul). Nivelul `k` este suma celulelor `ix >> k, iz >> k` – exact, într-un meci și peste meciuri cu alte mărimi de celulă – iar orice regiune (o cutie, un coridor de-a lungul unei linii, un inel) este o sumă de celule. Cel mai fin nivel încape robust în întinderea meciului (celulele care țin 99% din prezență) în 128 de celule; cele rătăcite în afara lui sunt păstrate.
- **Expunerea lângă fiecare numărare.** Secunde de prezență pe celulă, pe echipă (`pt`), pe clasă de vehicul (`pc`) și pe bandă de înălțime (`ph`), astfel încât rata, așteptarea și raportul unei regiuni se calculează pentru orice subgrup.
- **Înălțimea.** Benzi peste nivelul minim al meciului (percentila 1 a înălțimii): sub 3 m, 3–10, 10–30, 30–100, 100–300, 300–1000, 1000–3000, peste; un fișier cu o coloană `floor`/`storey`/`deck` împarte în benzi după etaje. `y` este înălțimea medie a fiecărei celule, `y0` cea mai joasă (etajul ei, pentru înălțimea de deasupra lui).
- **Evenimentele** ca tuple `[celulă, fel, echipă, clasă, bandă, număr]`.
- **Runde după rezultat** (versiunea 2, cu o coloană de rezultat și două runde sau
  mai multe): `pw` ca `[cell, team, rounds won, rounds lost]` – rundele în care fiecare
  tabără a petrecut o secundă sau mai mult în celulă, după rezultatul lor.
- **Felii de timp** la un nivel grosier (8 celule pe latură), pe minut de la începutul meciului: `[cx, cz, minut, fel, valoare]`, secundele de prezență ca fel `GRID_KINDS.length`; fazele meciului sunt minute peste lungime.
- Rare, numărări întregi, secunde la o zecime: mărginite de ce s-a întâmplat.

### Etapa B: locuri și nișe {#stage-b-places-and-niches}

Etapa B caută ce iese în evidență în cifre fără să sară în ochi: o zonă mare animată în ansamblu fără nicio celulă fierbinte în ea, un raport ucideri-morți ciudat pe puține evenimente, un coridor, o bandă de înălțime, un grup care există doar într-o parte a meciului – și grupuri (un vehicul pe o hartă, pe o tabără, un sector la o înălțime) care merg mult mai bine sau mai rău decât restul. Un singur **Găsește locuri** / **Găsește nișe** / **Găsește observații** rulează toți detectoarele; cele trei file împart același raport.

#### Locuri (`src/mass/scan.ts`) {#places-srcmassscants}

Meciurile fiecărei hărți sunt citite de două ori, câte un meci pe rând; memoria ține sume pe o rastră de cel mult 64 de celule pe latură (16 pentru scanarea spațiu-timp), niciodată meciurile.

- **Măsurile.** Rata unui eveniment pe secundă de prezență – uciderii, morți,
  lovituri, lansări, capturi, pentru toate unitățile, pe clasă (cele 4 cu cele mai
  multe evenimente), pe bandă de înălțime – și partea din uciderii la uciderii și morți
  (toate, pe tabără, pe bandă), plus **rata de victorie** a fiecărei tabere: rundele ei
  în celulă câștigate față de pierdute (`pw`), acolo unde 8 meciuri ale hărții sau mai
  multe numără rundele după rezultat. Ce clase și ce tabere intră se iau din capete (`planOf`).
- **Așteptarea după meci.** Rata proprie a fiecărui meci, împărțită pe prezența lui
  proprie într-o celulă, este așteptarea celulei (o scanare Kulldorff ajustată după
  covariate, stratificată pe meci): câteva meciuri sângeroase sau un server ocupat nu fac
  un loc. Pentru rata de victorie, așteptarea este partea proprie de runde câștigate a taberei în acel meci, așa că echilibrul hărții și al taberei nu devine niciodată un loc. O rundă în mai multe celule ale unei regiuni contează în fiecare; dispersia măsurată la mărimea regiunii ține cont de asta.
- **Dispersia.** Meciurile nu se potrivesc cu mult peste Poisson. Reziduurile fiecărui
  meci sunt însumate în blocuri de 1, 2, 4, 8, 16 celule; dispersia fiecărei mărimi de
  bloc (reziduuri la pătrat peste varianța nulă, pusă laolaltă, cele mai rele 5% din
  blocuri scoase) scalează fiecare test al unei regiuni de acea mărime: un raport de
  verosimilitate cvasi, Poisson pentru rate, binomial pentru părți.
- **Regiunile.** Cercuri de la 0,75 la 18 celule; elipse la șase unghiuri, de 3 și 6 ori
  mai lungi decât late, de la 3 la 18 celule (coridoare; axa este `place.path` al
  observației); zone crescute celulă cu celulă din celulele Getis-Ord Gi* cele mai puternice
  locale, cât timp crește z-ul regiunii (forme neregulate) – crescute pe o jumătate a
  meciurilor și testate pe cealaltă, astfel încât libertatea creșterii nu costă locuri false;
  fiecare bandă de înălțime față de celelalte benzi ale meciului peste toată harta (robust la
  grupare); cilindri spațiu-timp: un cerc într-una sau două cincimi din lungimea meciului, față
  de răspândirea proprie a meciului a evenimentelor sale în loc și timp (scanarea spațiu-timp prin permutare).
- **Testarea.** p din cvasi-verosimilitate; Benjamini-Hochberg peste fiecare regiune
  încercată pe fiecare hartă (700.000 pe trei hărți este obișnuit) la 5%. Ce trece este
  curățat (o regiune mai ales în interiorul uneia mai puternice din aceeași măsură spune
  același lucru), apoi citit din nou pentru **stabilitatea** ei – meciurile care au văzut-o,
  meciurile în care a stat, direcția ei în cinci subseturi de meciuri – și testat încă o dată la
  varianța pe care o arată chiar meciurile (robust la grupare, meciurile ca grupuri, niciodată
  sub Poisson), BH din nou. Locurile liniștite pe o bază (2% sau mai mult din
  apariții, decolări și aterizări ale hărții) sunt lăsate afară.
- **Efectul.** Raportul ratei (sau al șanselor), contractat prin Bayes empiric (o
  prioritate gamma potrivită pe blocurile 2x2 ale hărții), cu un interval de ~95% la dispersia
  respectivă; Gi* la 1, 2 și 4 celule și Moran local în centru.
- **Evidența vizuală.** Cât arată deja regiunea în harta simplă de căldură a evenimentului
  ei (scară logaritmică până la celula cea mai luminoasă, așa cum o desenează vederile):
  contrastul ei cu un inel în jurul ei (o zecime din paletă e greu de văzut, două cincimi
  simplu) și un vârf luminos care poartă excesul; un raport nu este desenat niciodată de
  căldură, deci o parte numără jumătate. Sub 35% este **ascuns**. Rangul: puterea (efectul
  saturat la de 4 ori, locurile liniștite la 0,7) înmulțită cu `1 - 0,7 x evidența` și cu
  acordul subseturilor.

Fila **Locuri** le listează (ascunse doar implicit; după hartă, formă, direcție), un clic
conturează locurile hărții în vederea 3D (`placeLines.ts`: liniile de sus ale motorului,
construite o dată – magenta pentru ascunse, chihlimbar pentru simple, cyan pentru liniștite,
cea aleasă plină; o bandă ca o cutie de la podea la tavan) și pe pânza hărții din fila Hartă;
**Încarcă** zboară acolo și încarcă cele 60 de meciuri pe care le ținea cel mai des, filtrate
după evenimentul ei (și clasă).

#### Nișe (`src/mass/niche.ts`) {#niches-srcmassnichets}

Căutare cu fascicul (lățime 24, adâncime 3) peste trei tabele: **vieți** (viețile jucătorilor:
joc, hartă, mod, clasă, vehicul, tabără, nivel, trimestrul datelor, o treime din lungimile meciurilor;
K/D, victorie, moartea unei vieți, uciderii pe oră, câștig pe minut), **locuri** (uciderii și morți
pe hartă, mod, date, sector al hărții 4 x 4, clasă, tabără, bandă) și **faze** (sector și cincime din
meci: K/D, morți pe oră de prezență). Un grup este testat față de întreg cu meciurile ca
grupuri (varianța sandwich a reziduurilor lui pe meci), efectul lui un raport de șanse sau de rată,
contractat printr-o prioritate de 20 de rezultate; are nevoie de 30 de rezultate în 8 meciuri, o
rafinare trebuie să fie cu 10% mai puternică decât părintele ei, iar grupurile în care rezultatul este
niciunul sau toate (nenregistrat pentru ele) sunt lăsate afară. Se păstrează: BH sub 5% peste fiecare
grup evaluat, un raport contractat de cel puțin 1,25 (sau 1/1,25), patru din cinci subseturi care sunt de acord,
și nu o rafinare care doar repetă părintele. Fila **Nișe** le listează; un clic arată fiecare
rafinare cu o singură condiție a grupului (explorarea), **Încarcă** încarcă meciurile lui. Echipările
nu sunt încă în rezumate.

Al patrulea tabel, **runde** (`roundsTable`), are ca țintă rezultatul rundei: un
rând pe runda unei vieți – harta, tabăra, partea meciului (rundele 1-4, 5-8, ...),
vehiculul, arma folosită cel mai mult, locul ținut cel mai mult, cumpărarea, prima
eliminare sau prima moarte – judecat față de rata de victorie a propriei tabere în
propriul meci (așteptarea stratificată Mantel-Haenszel: reziduul este `won - e`, `e`
partea taberei în meci), așa că o nișă nu este niciodată echilibrul hărții sau al
taberei. Meciurile rămân clusterele. z-ul lui este calibrat: aceeași căutare în fascicul
rulează de opt ori pe rezultatele amestecate între rundele fiecărei tabere din fiecare
meci (rata taberei în fiecare meci se păstrează), iar împrăștierea acelor z nule peste o
normală standard – pe număr de condiții, din mijloc (mediana / 0,674) și din coadă
(percentila 99 / 2,576), cea mai mare, niciodată sub 1 – le împarte pe cele reale
înainte de p-ul lor și de rata falselor descoperiri (un nul empiric, Efron 2004).
Grupurile mai adânci primesc scara mai mare: fasciculul păstrează rafinări ale unor
grupuri alese pentru z-ul lor mare. Baza unei nișe este propria ei așteptare, câștigul
ei punctele peste ea, iar ea este ordonată după câștig înmulțit cu rădăcina pătrată a
rundelor ei, susținută de dovezi și de pliuri (`wracc` este suportul înmulțit cu
câștigul). Poartă meciurile în care s-a arătat cel mai mult (`matchIds`) și câteva
dintre rundele lor (`rounds`, `[match, round]`) pentru detaliere.

#### Schimbările de meta cu semnificație practică {#meta-shifts-with-practical-significance}

Pe date amestecate, binomialul pe vieți declara aproape fiecare schimbare ca semnificativă. Acum `meta`
testează robust la grupare (viețile fiecărui meci, un grup), păstrează o schimbare de folosire doar de
2 puncte și de cel puțin 25%, o schimbare de K/D de 1,3 ori, trimestrele datelor urmând aceeași direcție
(tau al lui Kendall de cel puțin 0,5) și, pentru un vehicul pe mai multe hărți, aceeași direcție pe cele
mai multe dintre ele. Rămân doar câteva schimbări pe un set de test unde testul simplu le marca aproape pe toate.

#### Pentru un model {#for-a-model}

`massReportForModel` dă fiecărui loc `region` (formă, ascuns, evidență, înălțimi, fază) și fiecărei nișe
`conditions`, plus câte regiuni și grupuri au fost încercate. Vederea cunoașterii poate citi locurile ca
zone de ucidere și căi de apropiere: felurile lor sunt `place.*` și `niche.*`.

#### Verificări {#checks}

`scan.test.ts` plantează o zonă difuză (de 1,6 ori rata de moarte peste un cerc de 22 de celule, slabă în
fiecare celulă), un coridor, o bandă de înălțime și un grup doar pe fază, în 240 de meciuri sintetice cu
supradispersie – toate găsite, cea difuză ascunsă – și rulează opt seturi nule de 60 de meciuri: niciun loc.
`niche.test.ts` găsește un grup plantat vehicul x hartă x tabără și nimic în cinci tabele nule. `outcome.test.ts` verifică rezumatul de versiunea 2 (rundele câștigate pe tabără, unitate, jucător și armă, `pw`, rundele unităților); plantează un culoar a cărui tabără câștigă 70% din runde față de 35% (fiecare meci cu propriul echilibru) – găsit – și rulează 20 de seturi nule de 50 de meciuri în care culoarele nu spun nimic: niciun loc de rată de victorie; plantează un AWP pe o hartă care câștigă rundele taberei sale cu 30 de puncte mai mult – găsit, cu meciurile și rundele lui – și rulează 30 de seturi nule de 80 de meciuri, fiecare meci cu propriul echilibru și o tabără mai puternică pe o hartă: nicio nișă.
