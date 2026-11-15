---
title: "Reprodukcija meča"
nav_order: 9
has_children: true
lang: "bs"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Reprodukcija meča

Reprodukcija je film o meču u kojem je svaki igrač nacrtan kao stvar kojom je upravljao. Koristite je da ponovo gledate borbu, pratite jednu jedinicu i vidite ko je koga pogodio.

Hici, pogoci, požari i olupine crtaju se na jedinicama i ciljevima na nivou. Kamere, oznake i taktički prikaz pomažu da pročitate borbu. Poznajete Tacview? [Paritet s Tacviewom](tacview-parity.md) pokazuje gdje je svaki njegov alat.

![Reprodukcija figura demo tenkova: tenkovi kao sopstvene figure, s oznakama imena, vozila i brzine](../assets/img/en/replay-overview.webp)

## Pokrenite reprodukciju {#start-a-replay}

1. Učitajte snimak s **Izvor → Datoteke…** ili prevlačenjem na panel Izvor (bilo koja tabela s kolonom **osobe** i **vremena**, Tacview datoteka, konvertovana reprodukcija, [`.3dheat`](container.md) meč). Vidi [Unos podataka](getting-data-in.md).
2. Otvorite karticu **Meč** i izaberite **Reprodukcija figura**, ili izaberite **Preklapanje figura** na traci načina kartice Toplotna mapa.
3. Pod **Mečevi u snimku** izaberite jedan meč, svi odjednom, ili nekoliko.
4. Pritisnite **Reproduciraj** na vremenskoj liniji (ili `K`). Prevucite vremensku liniju da skočite.

Figure zamjenjuju kocke za svaku jedinicu čije je ime ili tip poznat (vidi [Figure](figures.md)). Podaci bez kolone imena ili tipa crtaju se kao vojnici.

![Kartica Meč: birač mečeva, odjeljak Figure, prikazi kamere, Reproduciraj i spisak događaja](../assets/img/en/match-replay-tab.webp)

## Figure {#figures}

![Gorući tenk u kameri orbite, s hicem koji ga je pogodio](../assets/img/en/replay-tanks.webp)

| Postavka (odjeljak **Figure**) | Podrazumijevano | Šta radi |
|---|---|---|
| **Figure umjesto kocki** | uključeno | Isključeno crta obične kocke. |
| **Veličina figura** (puta stvarna veličina) | 1 | 1 je prava veličina; od 0,25 do 20 puta (logaritamska skala). Veće pomaže izdaleka. |
| **Najmanja figura na ekranu** | 36 px | Figure na daljini rastu da ostanu ovoliko velike, od 0 do 200 px; 0 zadržava pravu veličinu. |
| **Na daljinu**: Figura, Strelica, Simbol | Figura | Šta postaje udaljena jedinica. |
| **Simboli** | NATO (APP-6) | NATO (APP-6), ruski taktički znakovi, ikone **Karta igre**, ili **Samo oblici (za daltoniste)**. |
| **Veličina simbola**, **Moja strana**, **Neprijateljski / Neutralni**, **Oznake kursa** | 28 px (12 do 64), automatski, neprijateljski, uključeno | Kako simboli izgledaju i koja strana je prijateljska. |
| **Okomite linije** | uključeno | Linija od svake jedinice pravo dolje do tla, pa se visine čitaju u 3D. |
| **Okomice i oznake na oružju** | isključeno | Linije do tla i oznake na raketama i bombama. |
| **Požari na jedinicama** | uključeno | Plamen od trenutka kada jedinica planu do gašenja. |
| **Pogoci na jedinicama** | uključeno | Oznake gdje su hici pogodili (dolje). **Pogoci ostaju**: 1 do 300 sekundi, ili **Cijeli život**. **Plutajuće oznake**: oznake nacrtane iznad površine. |
| **Linije pogleda i kupole** | isključeno | Isprekidano: gdje igrač gleda; punom linijom: gdje je top uperen. |
| **Zgrade** | puno | Pune ili prozirne zgrade, kada ih nivo prikazuje. |

### Simboli na daljini {#symbols-at-a-distance}

Kada bi jedinica bila manja od **Najmanja figura na ekranu**, može postati simbol koji ostaje čitljiv. Oblik kaže vrstu (na primjer zaobljena kutija s oznakom gusjenice za oklop); boja kaže stranu. Otvorite meni **Simboli** da promijenite stil.

![Isto šest jedinica kao NATO simboli, ruski taktički znakovi, ikone karte igre i samo oblici](../assets/img/en/match-replay-symbols-styles.webp)

### Oznake pogodaka, olupine i požari {#hit-marks-wrecks-and-fires}

- **Oznake pogodaka** sjede na površini na koju je hitac naišao, u razmjeri figure. Njihov izgled kaže šta se dogodilo: rupa (prošao je), svijetla prskotina (nije prošao), urez (kliznuo je), zvijezda od čađi (eksplozivna municija). Obojeni prsten kaže šta je učinio: fatalni hitac, modul uništen, kritično, teško, šteta, bez štete, pogodak. Zadržite pokazivač iznad oznake za naziv runde.
- Uništena jedinica se crta **spaljena** kao olupina od smrti do ponovnog pojavljivanja ili uklanjanja; njen simbol je precrtan.
- **Požari** gore na jedinici od trenutka kada planu do gašenja.
- **Topovi** se okreću tamo gdje podaci kažu da je top uperen (ili, bez toga, gdje igrač gleda).

### Oružje, mamci i tragači {#weapons-decoys-and-tracers}

Uz uključeno **Oružje, hici i pogoci** (odjeljak Prikaz tima): rakete, projektili, bombe i torpeda lete kao sopstvene figure s dimnim tragom; meci i granate su tragači; udari i eksplozije bljeskaju. Tragač nacrtan **isprekidano** izveden je iz pogotka, jer podaci nisu imali hitac. Mamci i čaff crtaju se kao mamci; skriveni su sa spiska jedinica osim ako nije štiklirano *Mamci i granate*.

## Kamere {#cameras}

Kliknite jedinicu ili njenu oznaku da je **pratite**; odjeljak **Reprodukcija** nudi **Iza**, **Orbita**, **Kokpit** (s prikazom na čelnom staklu, `H`), **Fiksna**, **Zaključavanje**, **Cilj** i **Satelit**. `V` ih mijenja redom, **Udaljenost kamere** određuje koliko su daleko. Esc zaustavlja.

- **Prikaz dvije jedinice**: izaberite **Cilj** (ili Ctrl/Alt-klik na jedinicu) da je gledate iz one koju pratite; **Zamijeni** ih razmjenjuje.
- **Mjera**: Shift-klik na dvije jedinice za ugao, domet i razliku visine između njih.
- **2D karta** (`M`): ugao ili puni prikaz, s tragovima i imenima.
- **Zabilješke** (`B`): sačuvajte trenutak i kameru; prikazuju se i sopstvena ubistva, smrti i oznake snimka.
- **Događaji**: svaki događaj po vremenu; klik skače tamo. `Page Up` / `Page Down` skaču između događaja; **Pauza na događaju** staje na svakom.

## Taktički prikaz {#tactical-display}

![Zračni demo s izgledom taktičkog prikaza (T): žičani teren, paneli ubistava i događaja](../assets/img/en/replay-air-tactical.webp)

Odjeljak **Taktički prikaz** crta, za nijednu jedinicu, izabrane, sve ili jednu vrstu (zrakoplovi, kopno, brodovi, oružje): vektore brzine i putanju ispred, linije nosa i uzgona, radarske konuse, zaključavanja, podatkovne veze, zone i linije angažmana, linije vidljivosti, gdje igrači gledaju (konusi pogleda), nišanjenje kupole i snimljenu kameru.

### Stil prikaza {#display-style}

`T` (ili prekidač **Prikaži kao taktički prikaz**) prebacuje izgled na stil radarskog ekrana: sjaj, obrisi, konturne linije, mrežu za mjerenje, linije skeniranja, prstenove dometa, skale visine, panele s ubistvima i događajima, i **Reditelja** koji kamerom sam ide na događaje.

![Ista zračna borba u normalnom izgledu](../assets/img/en/replay-air.webp)

## Ciljevi {#objectives}

Kada meč dolazi sa svojim ciljevima, odjeljak **Ciljevi** ih crta na nivou: zone zauzimanja (s vlasnikom i napretkom zauzimanja), spawnovi, aerodromi, oblasti i mete za bombardovanje, svaki sloj može da se uključi ili isključi, s oznakama. Vide se kroz tlo. Kada je učitano više režima igre, **Režim** filtrira mečeve po režimu. Ciljevi dolaze iz datoteke meča konvertera pored snimka ili unutar [`.3dheat`](container.md) kontejnera.

## Oznake i statistika {#labels-and-statistics}

- **Oznake**: pravila po vrsti (**Odabrane**, **Zrakoplovi**, **Kopno**, **Brodovi**, **Oružje**, **AI**): prikazane ili ne, koje vrijednosti, i **Prioritet** za to ko dobija prostor kada se oznake preklapaju. **Razmakni oznake** pomjera oznaku pored njene jedinice kada bi pokrila drugu, i izostavlja je tamo gdje nema mjesta. **Veličina oznaka** je 60 do 250 %. **Nazad na ime, vozilo, visinu i brzinu** vraća pravila.
  - Kopnene jedinice počinju s imenom, vozilom i brzinom.
  - Zrakoplovi počinju s imenom, vozilom, visinom i brzinom.
  - Brodovi počinju s imenom, vozilom, brzinom i kursom.
  - Zadržite pokazivač iznad jedinice da vidite svaku vrijednost koju ima.
- **Statistika**: po timu i jedinici: ubistva, smrti, hici, pogoci, odnos pogodaka, polijetanja, slijetanja, vrijeme u vazduhu, najveća brzina, visina i G, udaljenost. Izvoz u CSV.
- **Grafikoni**: vrijednosti jedinice kroz vrijeme, dvije jedinice upoređene, ili jedna vrijednost naspram druge.

## Mnogo mečeva odjednom {#many-matches-at-once}

Da postavite stotine ili hiljade mečeva jedan preko drugog, vidi [Mnogo mečeva odjednom](many-matches.md). Detalji o figurama (dim, vatra, drugi vremenski efekti): [Figure u preklapanju figura](figure-replay.md). Spisak Tacview mogućnosti: [Paritet s Tacviewom](tacview-parity.md), podstranica ove stranice.
