---
title: "Uvidi"
nav_order: 7
has_children: true
lang: "bs"
source: "insights.md"
source_hash: "d09a8c07f701"
translated: true
outdated: false
---

# Uvidi

**Uvidi** pretražuju učitane podatke za ono što se ističe - jake pozicije, smrtonosno tlo, zamke na mjestima pojavljivanja, uska grla, igrače daleko iznad vršnjaka - i kažu vam, od najjačeg, uz dokaze. Koristite ih da za minut saznate gdje je meč dobijen ili izgubljen. Zatim mogu napisati sažetak, a u jednoj reprodukciji mogu djelovati kao komentator koji skače na velike trenutke.

Sve se računa u vašem pregledniku. Ništa ne napušta vaš računar, osim ako ne uključite vanjski AI (vidi [Vanjski AI](#external-ai)).

![Uvidi na demo tenkovima: 14 nalaza, najjači prvi](../assets/img/bs/insights.webp)

Odjeljak **Uvidi** nalazi se u bočnoj traci kartica Toplotna mapa i Meč. Ima tri kartice: **Nalazi**, **Sažetak** i **Komentator**.

## Nalazi {#findings}

1. Učitajte podatke i otvorite **Uvidi**. Pritisnite **Pronađi uvide** (`Brojanje… n%` pokazuje napredak).
2. Pročitajte spisak. Svaki nalaz ima traku snage, rečenicu, koliko su dokazi dobri (*Jaki dokazi*, *Dobri dokazi* ili *Neki dokazi*), koji detektor ga je našao i klasu vozila tamo gdje je to bitno.
3. **Kliknite nalaz**: prikazivač primjenjuje njegove filtere, kamera leti do mjesta i skače na vrijeme, a otvaraju se detalji: efekat s 95 % intervalom, vrijednosti p i q, prebrojani dokazi i **Volumen ovdje**, koji crta [zapreminu](volumes.md) oko mjesta.
4. **Vrati filtere** vraća vaše filtere. **Kopiraj JSON** kopira cijeli izvještaj.

Brojanje koristi trenutne filtere, sakrivene grupe i izabrani meč kroz cijeli vremenski opseg. Kada kasnije promijenite filtere, pojavi se napomena; pritisnite **Prebroji ponovo**.

Redovi na vrhu spiska (na primjer ukupni iznosi novca) sažimaju cijele podatke prije nalaza.

![Otvoren nalaz: vruća zona ispaljenih hitaca, njeni brojevi i odgovarajući odlomak iz literature](../assets/img/bs/insights-finding.webp)

### Detektori {#the-detectors}

| Detektor | Šta nalazi | Treba u podacima |
|---|---|---|
| **Jake pozicije** | Mjesta s mnogo boljim odnosom ubistava i smrti od ostatka mape, i *siguran teren* gdje malo ljudi umire u vremenu provedenom ondje | događaji ubistva i smrti |
| **Vruće i hladne zone** | Mjesta gdje se vrsta događaja (hici, pogoci, zauzimanja ...) dešava mnogo češće ili rjeđe nego što vrijeme provedeno ondje predviđa | kolona događaja |
| **Otvoreni teren i zaklon** | Smrti na otvorenom uz blisku geometriju nivoa, i sporo uz brzo kretanje | smrti; 3D nivo za dio s geometrijom |
| **Spawnovi** | Jaki spawnovi, zamke na spawnovima, sigurni spawnovi, vrijeme do prvog kontakta | vrijeme i osobe |
| **Klasa po mjestu** | Klasa vozila, ili igrači naspram AI-ja, koji rade mnogo bolje ili gore u nekoj oblasti | ubistva plus kolona klase vozila ili igrač/AI |
| **Igrači** | Igrači koji ubijaju ili umiru mnogo češće ili rjeđe od drugih u istoj klasi | osobe i ubistva |
| **Uska grla i bokovi** | Uska grla (mnogo više prelazaka nego okolnog tla) i bočne rute (rijetko korištene, ali vode do ubistava) | osobe |
| **Vrijednost** | *Skupo tlo* i *Tlo koje donosi* | [kolone vrijednosti](value-weighting.md) |
| **Šta je odlučilo runde** | Šta je razdvajalo dobijene od izgubljenih rundi i igrači koji su dodali ili koštali najviše vjerovatnoće pobjede (vidi [Ko je pobijedio](#who-won-what-decided-the-rounds)) | runde, ubistva i smrti te [kolone ishoda](data-formats.md#outcome-columns) (`won`) |

Detektori koji ne mogu raditi na podacima navedeni su na dnu, s razlogom.

### Kako se nalazi rangiraju {#how-findings-are-ranked}

Svako mjesto ili grupa poredi se s ostatkom mape (tačni binomni testovi ili testovi stope). Stopa lažnih otkrića drži se na 5 % (Benjamini-Hochberg). Slučajnost može izgledati kao obrazac; ovo drži lažne uzbune niskim: među prikazanim nalazima očekuje se najviše otprilike jedan od dvadeset slučajnih. Efekti iz malo događaja povlače se prema „nema efekta” prije rangiranja. Najviše 60 nalaza se navodi, a svaki detektor dobija nekoliko mjesta pri vrhu.

### Ko je pobijedio: šta je odlučilo runde {#who-won-what-decided-the-rounds}

Gdje podaci kažu ko je dobio svaku rundu ([kolona ishoda](data-formats.md#outcome-columns) `won`: CS2, Rainbow Six Siege, War Thunder ...), Uvidi se vrte oko rezultata. Za svaku stranu dijele runde prema onome što se u njima desilo i porede procente pobjeda:

| Faktor | Runde strane s njim | ... i bez njega |
|---|---|---|
| Otvarajući dvoboj | strana je ostvarila prvo ubistvo | strana je prva poginula |
| Kupovina | njena kupovina je bila bolja od kupovine druge strane | lošija |
| Razmijenjena prva smrt | njena prva smrt je razmijenjena unutar 5 s | nije razmijenjena |
| Postavljanje | strana je postavila bombu | bez postavljanja |
| Pomagala | više granata nego u njenoj uobičajenoj rundi | manje |
| Rani kontakt | prvi dvoboj je došao prije medijane vremena meča | kasnije |
| Držano mjesto | igrač je stajao na mjestu 5 s ili duže | niko |
| Rano dosegnuto mjesto | igrač je tamo stigao u prvih 25 s (ruta) | niko |

Svako poređenje je razlika dva procenta pobjeda s njenim intervalom od 95% (Newcombe), Fisherovim egzaktnim p i q preko svih isprobanih faktora (Benjamini-Hochberg). Grana s manje od 8 rundi označena je s *malo rundi*. One ispod stope lažnih otkrića od 5% postaju nalazi; najjači se rangiraju iznad nalaza ostalih detektora (nalaz o ishodu teži 1,35 puta više od nalaza s istim efektom i dokazima).

Izmišljeni primjer iz 40 rundi:

> **T** je dobila 79% od 19 rundi u kojima je držala **Mid**, naspram 24% od 21 bez toga (55 bodova, 95% od 26 do 74) - q 0,004.

Prati i **vjerovatnoću pobjede** runde - šansu koju je svaka strana imala u svakom trenutku, prema živim igračima, postavljanju i satu: prilagođenu rundama kada ih je 30 ili više, inače iz fiksnog apriornog modela (i tekst kaže iz kojeg). Iz nje dolaze **prekretnice** (ubistva i postavljanja koja su najviše pomjerila šansu) i **dodana vjerovatnoća pobjede** svakog igrača: ubistva i postavljanja koja je napravio broje mu se u korist, njegove smrti protiv njega, u vrijednosti rundi kroz meč, u prosjeku po rundi s intervalom, testirano naspram nule. Mjesta dobijaju isti bilans: koja je strana najviše dobila u dvobojima vođenim tamo.

Podaci trebaju runde, ubistva i smrti s obje strane te kolonu `won`; imenovana mjesta (`place`) za držana mjesta, kolonu `buy` za kupovinu.

## Sažetak {#debrief}

Kartica **Sažetak** piše nalaze kao kratak tekst: uvod, najjasniji nalaz, jedan za taktiku, jedan za balansiranje, zatim - gdje podaci kažu ko je pobijedio - šta je odlučilo runde, ostali grupisani po detektoru, i koliko ih se oslanja na slabije dokaze.

Šta je odlučilo runde dolazi u četiri pasusa: rezultat i odakle dolaze vjerovatnoće pobjede; najjači faktori s brojevima, intervalom i q (kada nijedan ne prođe stopu lažnih otkrića, tekst kaže *za sada ništa nije sigurno* i ipak navodi najjače); tri najveće prekretnice; te igrači koji su dodali i koštali najviše vjerovatnoće pobjede, s mjestima koja su najviše dobila. Izmišljeni primjer:

> T je dobila 23, a CT 17 od 40 rundi sa poznatim ishodom (T: 58%, 95% od 42% do 72%). Vjerovatnoće pobjede dolaze iz modela prilagođenog ovim rundama.
>
> Šta je razdvajalo dobijene od izgubljenih rundi: T je dobila 79% od 19 rundi u kojima je držala Mid, naspram 24% od 21 bez toga (55 bodova, 95% od 26 do 74) (q 0,004), ...
>
> Prekretnice: runda 17 u 48 s, ubistvo strane CT na mjestu B promijenilo je njene izglede sa 31% na 58%, i dobila je rundu, ...

Svaki pasus ima numerisana dugmad koja pokazuju njegove nalaze. **Kopiraj tekst** ga kopira.

![Sažetak koji je napisao ugrađeni pripovjedač](../assets/img/bs/debrief.webp)

Ugrađeni pripovjedač radi offline, na vašem jeziku. Birač **Leća** iznad njega (vidi [Sočivo znanja](knowledge.md)) odlučuje koju literaturu pasusi citiraju.

### Vanjski AI {#external-ai}

**AI postavke** omogućavaju da sažetak umjesto toga napiše model AI-ja po vašem izboru:

| Postavka | Značenje |
|---|---|
| **Pružalac** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (lokalno), LM Studio (lokalno), llama.cpp server (lokalno) ili bilo koja krajnja tačka kompatibilna s OpenAI-jem |
| **Osnovni URL**, **Model** | Popunjava pružalac; **Prikaži modele** pita server |
| **API ključ** | Šalje se samo na osnovni URL. Nikada se ne bilježi, nikada se ne čuva u prikazima, izvozima ili `.3dheat` datotekama. Većini lokalnih servera nije potreban. |
| **Zapamti ključ u ovom pregledniku** | Podrazumijevano isključeno: ključ se zaboravlja kada se stranica zatvori |
| **Koristi vanjski AI** | Podrazumijevano isključeno |
| **Šalji imena igrača** | Podrazumijevano isključeno: igrači se šalju kao P1, P2 ... |

Zatim unesite opcionalno pitanje i pritisnite **Napiši uz AI**. Šalju se samo nalazi i njihovi brojevi - nikada redovi vaših podataka. Odgovor se ispisuje postepeno; citirani nalazi postaju dugmad. Gdje podaci kažu ko je pobijedio, model dobija uputu da počne s onim što je odlučilo runde, s intervalom i q svakog broja, i da kaže kada se faktor oslanja na malo rundi ili kada vjerovatnoće pobjede dolaze iz apriornog modela.

## Komentator {#caster}

Za **jedan meč** (izaberite jedan ako ih je učitano više), **Komentator** pronalazi trenutke vrijedne gledanja: prvu krv, višestruka ubistva, razmjene, zaokrete, promjene ciljeva, povratke, istaknute igrače, dugačke hitce i **prekretnice** - ubistva koja su najviše pomjerila šansu strane da dobije rundu (prema igračima koji su ostali živi na svakoj strani, u rundama bez ponovnog pojavljivanja).

Gdje podaci kažu ko je dobio svaku rundu, to kaže svaki trenutak: *„Anna obara Bena: šansa strane T da dobije rundu mijenja se sa 38% na 62% - i dobijaju rundu.”* Trenutak strane koja je potom pobijedila vrijedi više kada komentator bira koje trenutke zadržava, a povratak se broji u dobijenim rundama.

![Trenuci komentatora za jedan krug demo shootera](../assets/img/bs/caster.webp)

- Kliknite trenutak: prikaz prelazi na reprodukciju, skače na trenutak prije njega, leti tamo i prati igrača.
- **Reproduciraj trenutke** pušta svaki do kraja i prelazi dalje; **Prethodno** / **Sljedeće** se kreću kroz njih.
- Uz uključen vanjski AI, **Komentar AI-ja** piše komentar iz spiska trenutaka (vrste, vremena, imena ili pseudonimi, timovi, klase, udaljenosti).

Treba mu osobe i događaji ubistva/smrti (ili zauzimanja); kolona `other`/`victim` omogućava razmjene i dugačke hitce.

## Sočivo znanja {#knowledge-lens}

Nalaz se može čitati kroz **leću** utvrđenog znanja: vojna doktrina, zračna i pomorska borba, urbane operacije, dizajn igara i e-sport (ili *Auto*, koje biraju jedinice u podacima). Otvoren nalaz tada prikazuje najbliži unos **doktrine i literature** i **istorijsku paralelu**, s referencama, a **Mjere leće** računa mjere iz te literature na podacima (Lanchesterova prilagođavanja, odnosi razmjena, odnosi snaga, polja vatre, ključni teren, razmjene, inicijativa). Sažetak i upit za AI ih uključuju. Sve o tome: [Sočivo znanja](knowledge.md).

Mjere leće takođe mjere kako se igrači ponašaju kao gomila i kao grupa - poravnanje i kružno kretanje, navođenje rutama, trake i tragovi, zgusnutost, vođe i pratioci, zaostali, tačka loma pod gubicima, rizik nakon izgubljenog života, nizovi, slaganje pri kupovini i odgovor na dolazeću vatru - svaku prema sopstvenom nultom modelu: [Kolektivno ponašanje](collective-behaviour.md).

## Podaci koji čine da uvidi rade {#data-that-makes-insights-work}

- pozicije s kolonom **vremena**, **osobe** i **tima**;
- kolona **događaja** s ubistvima i smrtima (`kill`, `death`), i drugim (`hit`, `fire`, `capture` ...);
- kolona **druge strane** (`other`, `victim`) za razmjene i smjerove;
- kolona **vozila** ili **tipa** za klase; kolona `ai` za igrače naspram AI-ja;
- kolona **sesije** / **meča** / **runde** kada ima više mečeva.

[Demo podaci](demo-data.md) imaju sve njih.
