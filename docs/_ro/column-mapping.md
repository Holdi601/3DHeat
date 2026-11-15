---
title: "Maparea coloanelor"
parent: "Încărcarea datelor"
nav_order: 2
lang: "ro"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Maparea coloanelor

Un fișier este un tabel, iar 3DHeat trebuie să știe ce coloană ține poziția est-vest, care ține timpul, care ține numele jucătorului și așa mai departe. Acest panou este locul unde spune ce a ghicit și unde corectezi o ghicire greșită.

![Panoul Maparea coloanelor după încărcarea unui fișier Parquet: fiecare casetă deja completată - 1 X, 2 Y, 3 Z, 4 Timp, 5 Id persoană, 6 Sesiune / meci, 7 Echipă / grup](../assets/img/en/column-mapping-panel.webp)

*Fișierul și-a numit singur coloanele, deci fiecare casetă este deja completată.*

De exemplu, un CSV cu antetul `x,y,z,t,player,team` se mapează singur: x, y și z devin poziția, `t` timpul, `player` [persoana](glossary.md), iar `team` [grupul](glossary.md).

După ce sunt selectate fișierele, panoul **Maparea coloanelor** se deschide sub panoul Sursă. Spune ce coloană joacă ce rol. Se completează automat, iar fiecare câmp poate fi schimbat înainte de a apăsa **Încarcă**; maparea se citește la încărcare, deci dacă o schimbi după aceea trebuie să încarci din nou.

## Câmpurile {#the-fields}

Toate meniurile de coloane listează fiecare coloană a primului fișier, plus *- niciuna -*.

| Câmp | Rol | Note |
|---|---|---|
| **Separator** | Doar CSV: delimitatorul câmpurilor. | Meniu: *Virgulă ,*, *Punct și virgulă ;*, *Tab*, *Bară verticală \|*, *Spațiu*; sau scrie orice caracter unic în *sau scrie un caracter*. Detectat automat (vezi mai jos). Schimbarea lui rulează din nou maparea automată, deci modificările făcute înainte se pierd. |
| **X**, **Y**, **Z** | Poziția. | Sunt necesare cel puțin două; o a treia axă nemapată este 0 (datele se află pe un plan). Aceeași coloană pe două axe este o eroare. |
| **Axa verticală în sursă** | Ce axă a sursei indică în sus. | *Z este sus (majoritatea motoarelor de joc)* sau *Y este sus (convenția graficii)*. Vezi [Axe, unități și timp](axes-units-and-time.md). |
| **Scara unităților** | Înmulțește fiecare poziție. | Butoanele *1 (m)* și *0,01 (cm→m)*, sau scrii o valoare. |
| **Inversează X / Inversează Y / Inversează Z** | Neagă o axă a sursei. | Aplicat pozițiilor și vectorilor direcției privirii. |
| **Timp** | Axa timpului. | Opțional. Fără ea nu există cronologie. |
| **Unitate de timp** | Cum se citește coloana de timp. | Șapte unități; vezi [Axe, unități și timp](axes-units-and-time.md#time). Ignorat pentru coloanele Parquet `TIMESTAMP`/`DATE`, lucru pe care panoul îl spune. |
| **Id persoană** | Cine sau ce aparține unui rând. | Opțional. Face posibile urmele, duratele de viață, redarea în cutie și căldura pe linii. |
| **Sesiune / meci** | Ce meci, raid, rundă, cursă sau tur aparține unui rând. | Opțional. Pozițiile nu sunt niciodată interpolate, trasate sau unite într-o rută peste o schimbare de sesiune. Vezi [Sesiuni, persoane și grupuri](sessions-persons-groups.md). |
| **Echipă / grup** | Orice coloană cu puține valori distincte. | Opțional. Conduce culorile grupurilor, căldura pe echipe și împărțirea diferenței pe grupuri. |
| **Direcția privirii** | *Niciuna*, *Coloane girație / tangaj* sau *Coloane vector de direcție*. | Cu girație/tangaj: **Girație**, **Tangaj** și **Unitate de unghi** (*Grade* / *Radiani*). Cu un vector: **Dir X**, **Dir Y**, **Dir Z**. Folosit pentru razele de privire ale [redării în cutie](box-replay.md). |
| **Păstrează pentru filtrare** | Coloane suplimentare păstrate în memorie. | O căsuță pentru fiecare coloană, și pentru fiecare bifată un *interval* (numeric) sau o *categorie*. Fiecare costă 4 octeți pe rând și o trecere de decodare la încărcare. Doar coloanele păstrate pot fi [filtrate](filters.md), folosite pentru o [împărțire a diferenței](difference.md) sau ca o coloană de evenimente a [căldurii pe linii](line-heat.md). |
| **Arată rânduri exemplu** | Un tabel cu primele 12 rânduri eșantionate, toate coloanele. | Pentru verificarea ghicitorilor. |

O coloană de filtru bifată care nu este setată explicit este citită ca *interval*; o coloană de id care arată numeric este adesea mai utilă ca *categorie*. Doar 4 filtre pot fi active deodată ([Filtre](filters.md)).

## Cum ghicesc maparea automată {#how-the-auto-mapping-guesses}

Ghicitul se află în [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Se uită la numele coloanelor, la care coloane sunt numerice în rândurile eșantionate (mai mult de 90% din valorile nevide se citesc ca numere), la câte valori distincte ia fiecare coloană în eșantion și la tipurile logice Parquet. Modelele de nume sunt încercate în ordine, fără diferență între majuscule și minuscule, iar primul model care se potrivește cu vreo coloană încă liberă câștigă.

### Poziția {#position}

| Axa | Modele de nume, în ordine (doar coloane numerice) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Dacă o axă este încă goală, primele coloane numerice libere (ignorând `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) o completează în ordine. O ghicire greșită se vede imediat pe ecran; una goală ar lăsa un areal gol.

### Timpul {#time}

- **Întâi coloanele de timestamp Parquet.** Dintre coloanele al căror tip logic este `TIMESTAMP` sau `DATE`, cea mai bună este aleasă după scor: +10.000 dacă numele se potrivește cu un model de timp, -5.000 pentru un `DATE` simplu, plus numărul de valori distincte din eșantion. O dată de întreaga zi și un început constant de sesiune iau aproape nicio valoare distinctă, deci instantul evenimentului câștigă. Unitatea este apoi *Unix timestamp (ms)*.
- **Altfel după nume:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, apoi nume de timp scurs (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Unitatea este apoi ghicită din valori: ISO-8601 când o valoare arată ca `YYYY-MM-DDT…` sau `YYYY-MM-DD …`; altfel după mărimea cea mai mare: peste 10^17 nanosecunde, peste 10^14 microsecunde, peste 10^11 milisecunde Unix, peste 10^8 secunde Unix, peste 10^6 milisecunde, altfel secunde.

Când este aleasă o coloană de timp scurs, panoul notează că fiecare sesiune este aliniată atunci la propriul ei început - bun pentru suprapunerea meciurilor, nu pentru a le vedea în succesiune reală.

### Sesiunea, persoana, grupul {#session-person-group}

Sesiunea este revendicată **după** axa timpului și **înainte** de persoană și grup, pentru că o coloană de sesiune este adesea un timestamp (instantul de început al meciului pe fiecare rând al meciului).

| Rol | Modele de nume, în ordine |
|---|---|
| Sesiune | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (fiecare exact, opțional cu `_id`) |
| Persoană | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, apoi `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (date de curse: mașina este ceea ce se mișcă) |
| Grup | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grup, rezervă | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

O candidată de grup care ia o valoare distinctă pe majoritatea rândurilor eșantionate (mai mult de max(48, 60% din eșantion)) este un id, nu un grup: devine coloana de persoană dacă nu s-a găsit niciuna și nu este folosită ca grup. Dacă nu s-a găsit deloc o coloană de grup, se folosește coloana nenumerică cu cele mai puține valori distincte între 2 și 12.

### Direcția privirii {#look-direction}

O coloană numerică numită `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` sau `rot_z` / `rotation_z` trece direcția privirii pe girație/tangaj; tangajul este căutat ca `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Se presupun grade când vreo girație eșantionată depășește 7 în mărime, altfel radiani. Un vector de direcție nu este niciodată ghicit; vine din indiciile de mai jos sau de la tine.

### Coloanele de filtru {#filter-columns}

Cel mult **6** coloane sunt păstrate automat, în ordinea clasamentului:

1. `region`, `sessionMode`, `actor` - coloane care există ca să fie filtrate (scor 1200);
2. coloane de categorie care variază în eșantion, cele cu mai puține valori distincte primele (1000 minus numărul);
3. o coloană constantă în eșantion, dar doar când sunt încărcate mai multe fișiere - poate diferi între fișiere, cum ar fi o regiune sau un id de rulare de test (600);
4. coloane numerice (500).

Coloanele care joacă deja un rol, numele de zgomot de mai sus, coloanele constante într-o încărcare dintr-un singur fișier și coloanele cu text liber (mai mult de max(16, jumătate din eșantion) valori distincte) nu sunt oferite automat. Orice coloană poate fi totuși bifată manual.

### Axa verticală {#up-axis}

Cu toate cele trei axe mapate, axa cu împrăștierea mai mică a lui Y și Z în eșantion este considerată verticală (o hartă este mult mai lată decât înaltă); altfel se presupune Z sus.

## Indiciile `heat3d` dintr-un subsol Parquet {#the-heat3d-hints-in-a-parquet-footer}

Un fișier Parquet poate spune cum trebuie citit. Dacă metadatele cheie/valoare din subsolul fișierului au o intrare cu cheia **`heat3d`**, valoarea ei este analizată ca JSON și așezată peste ghicitori ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Convertorul de demo CS2 scrie o astfel de intrare, deci tabelele lui se deschid cu jucătorul ca persoană, tabăra ca grup, fiecare rundă ca sesiune, direcția privirii pornită și lumea în sensul corect.

Doar **primul** fișier al unei selecții este citit pentru indicii. Fiecare intrare este opțională, iar fiecare valoare indicată apare totuși în panou și poate fi schimbată. O descriere completă a schemei, cu un exemplu și cum se scrie, este în [Referința formatelor de date](data-formats.md#the-heat3d-hints).

Regulile, pe scurt:

- O coloană numită de un indiciu este aplicată doar când fișierul are acea coloană.
- `lookMode: "vector"` intră în vigoare doar când `dirX`, `dirY` și `dirZ` sunt toate setate; `"yawPitch"` doar când `yaw` este setat.
- `extra`, când există, înlocuiește lista automată de filtre (numele necunoscute și coloanele care joacă deja un rol sunt eliminate); tipul de interval/categorie al fiecăreia urmează dacă arăta numeric. Când lipsește, lista automată se păstrează fără coloanele cărora un indiciu le-a dat un rol.
- `axes.up` trebuie să fie `"y"` sau `"z"`, inversările trebuie să fie booleene, `scale` trebuie să fie pozitiv.
- `entity.size`, când este pozitiv, este mărimea unui lucru urmărit în unitățile fișierului ([mărimea entității](sessions-persons-groups.md#entity-size)); este singurul mod de a o seta.

## Problemă cunoscută: schimbarea separatorului CSV {#known-issue-overriding-the-csv-separator}

Când schimbi separatorul cu unul diferit de cel detectat, lista de coloane și rândurile eșantion nu se schimbă (previzualizarea încă desparte cu separatorul detectat). Separatorul ales este folosit în continuare pentru încărcarea propriu-zisă. Dacă separatorul detectat este greșit:

1. Deschide fișierul într-un editor de text.
2. Înlocuiește separatorul cu o virgulă peste tot (și virgulele zecimale cu puncte).
3. Salvează, apoi încarcă din nou fișierul.

Cauza este în [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
