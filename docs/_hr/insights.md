---
title: "Uvidi"
nav_order: 7
has_children: true
lang: "hr"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: false
---

# Uvidi

**Uvidi** pregledavaju učitane podatke tražeći ono što se ističe - jake pozicije, smrtonosno tlo, zamke za spawnanje, uska grla, igrače daleko iznad njihovih vršnjaka - i govore vam, od najjačeg prema najslabijem, uz dokaze. Koristite ih da za minutu saznate gdje je utakmica dobivena ili izgubljena. Zatim mogu napisati sažetak, a u jednoj reprodukciji mogu raditi kao komentator koji skače na velike trenutke.

Sve se broji u vašem pregledniku. Ništa ne napušta vaše računalo osim ako ne uključite vanjski UI (vidi [Vanjski UI](#external-ai)).

![Uvidi na demo tenkova: 14 nalaza, od najjačeg prema najslabijem](../assets/img/hr/insights.webp)

Odjeljak **Uvidi** nalazi se u bočnoj traci kartica Toplinska karta i Meč. Ima tri kartice: **Nalazi**, **Sažetak** i **Komentator**.

## Nalazi {#findings}

1. Učitajte podatke i otvorite **Uvide**. Pritisnite **Pronađi uvide** (*Brojanje… n%* pokazuje napredak).
2. Pročitajte popis. Svaki nalaz ima traku snage, rečenicu, koliko su dokazi dobri (*Jaki dokazi*, *Dobri dokazi* ili *Neki dokazi*), koji detektor ga je našao i klasu vozila tamo gdje je to važno.
3. **Kliknite nalaz**: preglednik primjenjuje njegove filtre, leti kamerom do mjesta i skače na vrijeme, i otvara detalje: učinak s njegovim intervalom od 95%, vrijednosti p i q, prebrojane dokaze i **Volumen ovdje**, koji crta [volumen](volumes.md) oko mjesta.
4. **Vrati filtre** vraća vaše filtre. **Kopiraj JSON** kopira cijeli izvještaj.

Brojanje koristi trenutne filtre, skrivene grupe i odabranu utakmicu kroz cijeli vremenski raspon. Kad poslije promijenite filtre, bilješka to kaže; pritisnite **Prebroji ponovno**.

Retci na vrhu popisa (na primjer ukupni iznosi novca) sažimaju cijele podatke prije nalaza.

![Otvoren nalaz: vruća zona ispaljenih hitaca, njezini brojevi i odgovarajući odlomak iz literature](../assets/img/hr/insights-finding.webp)

### Detektori {#the-detectors}

| Detektor | Što nalazi | Treba u podacima |
|---|---|---|
| **Jake pozicije** | Mjesta s mnogo boljim omjerom ubojstava i smrti od ostatka karte, i *sigurno tlo* gdje malo tko pogine za provedeno vrijeme | događaji ubojstva i smrti |
| **Vruće i hladne zone** | Mjesta gdje se vrsta događaja (hici, pogoci, zauzimanja ...) događa znatno češće ili rjeđe nego što vrijeme provedeno tamo predviđa | stupac događaja |
| **Otvoreni teren i zaklon** | Smrti na otvorenom uz blisku geometriju razine, i sporo naspram brzog kretanja | smrti; 3D razina za dio geometrije |
| **Spawnovi** | Jaki spawnovi, zamke za spawnanje, sigurni spawnovi, vrijeme do prvog kontakta | vrijeme i osobe |
| **Klasa po mjestu** | Klasa vozila, ili igrači naspram UI-ja, koji rade znatno bolje ili lošije u nekom području | ubojstva plus stupac klase vozila ili igrač/UI |
| **Igrači** | Igrači koji ubijaju ili ginu znatno više ili manje od drugih u istoj klasi | osobe i ubojstva |
| **Uska grla i bokovi** | Uska grla (znatno više prijelaza od okolnog tla) i bočne rute (rijetko korištene, ali vode do ubojstava) | osobe |
| **Vrijednost** | *Skupo tlo* i *Tlo koje donosi* | [stupci vrijednosti](value-weighting.md) |

Detektori koje podaci ne mogu pokrenuti navedeni su na dnu s razlogom.

### Kako se nalazi rangiraju {#how-findings-are-ranked}

Svako mjesto ili grupa testira se naspram ostatka karte (točni binomni testovi ili testovi stope). Stopa lažnih otkrića drži se na 5% (Benjamini-Hochberg). Slučajnost može izgledati kao uzorak; ovo drži lažne uzbune niskima: među prikazanim nalazima očekuje se najviše otprilike jedan od dvadeset koji je slučajan. Učinci iz malo događaja vuku se prema „nema učinka” prije rangiranja. Najviše 60 nalaza navodi se, i svaki detektor dobiva nekoliko mjesta blizu vrha.

## Sažetak {#debrief}

Kartica **Sažetak** piše nalaze kao kratak tekst: uvod, najjasniji nalaz, jedan za taktiku, jedan za balansiranje, ostali grupirani po detektoru i koliko ih se oslanja na slabije dokaze. Svaki odlomak ima numerirane gumbe koji prikazuju njegove nalaze. **Kopiraj tekst** ga kopira.

![Sažetak koji je napisao ugrađeni pripovjedač](../assets/img/hr/debrief.webp)

Ugrađeni pripovjedač radi izvan mreže, na vašem jeziku. Birač **Leća** iznad njega (vidi [Leća znanja](knowledge.md)) određuje koju literaturu odlomci citiraju.

### Vanjski UI {#external-ai}

**Postavke UI-ja** umjesto toga omogućuju da model UI-ja po vašem izboru napiše sažetak:

| Postavka | Značenje |
|---|---|
| **Pružatelj** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (lokalno), LM Studio (lokalno), llama.cpp poslužitelj (lokalno) ili bilo koja krajnja točka kompatibilna s OpenAI |
| **Osnovni URL**, **Model** | Popunjava pružatelj; **Prikaži modele** pita poslužitelj |
| **API ključ** | Šalje se samo na osnovni URL. Nikad se ne bilježi, nikad se ne sprema u prikaze, izvoze ili `.3dheat` datoteke. Većini lokalnih poslužitelja ne treba. |
| **Zapamti ključ u ovom pregledniku** | Prema zadanom isključeno: ključ se zaboravlja kad se stranica zatvori |
| **Koristi vanjski UI** | Prema zadanom isključeno |
| **Šalji imena igrača** | Prema zadanom isključeno: igrači se šalju kao P1, P2 ... |

Zatim upišite neobavezno pitanje i pritisnite **Napiši uz UI**. Šalju se samo nalazi i njihovi brojevi - nikad retci vaših podataka. Odgovor se pojavljuje u tijeku, a navedeni nalazi postaju gumbi.

## Komentator {#caster}

Za **jednu utakmicu** (odaberite jednu ako je učitano više), **Komentator** pronalazi trenutke vrijedne gledanja: prvu krv, višestruka ubojstva, razmjene, završnice, promjene ciljeva, preokrete, istaknute igrače, dalekometne pucnjeve.

![Trenutci komentatora za jednu rundu demo strijelca](../assets/img/hr/caster.webp)

- Kliknite trenutak: prikaz prelazi na reprodukciju, skače na malo prije njega, leti do tamo i prati igrača.
- **Reproduciraj trenutke** pušta svaki do kraja i prelazi dalje; **Prethodno** / **Sljedeće** se kreću kroz njih.
- Uz uključen vanjski UI, **Komentar UI-ja** piše komentar iz popisa trenutaka (vrste, vremena, imena ili pseudonimi, timovi, klase, udaljenosti).

Treba osobe i događaje ubojstva/smrti (ili zauzimanja); stupac `other`/`victim` omogućuje razmjene i dalekometne pucnjeve.

## Leća znanja {#knowledge-lens}

Nalaz se može čitati kroz **leću** utvrđenog znanja: vojnu doktrinu, zračnu i pomorsku borbu, urbane operacije, dizajn igara i e-sport (ili *Auto*, koji odabiru jedinice u podacima). Otvoren nalaz tada prikazuje najbliži unos **doktrine i literature** i **povijesnu paralelu**, s referencama, a **Mjere leće** računa mjere iz te literature na podacima (Lanchesterova prilagođavanja, omjeri razmjene, omjeri snaga, polja vatre, ključni teren, razmjene, inicijativa). Sažetak i upit za UI ih uključuju. Sve o tome: [Leća znanja](knowledge.md).

Mjere leće također mjere kako se igrači ponašaju kao gomila i kao grupa - poravnanje i kruženje, usmjeravanje ruta, trake i tragovi, gužva, vođe i pratitelji, zaostali, točka sloma pod gubicima, rizik nakon izgubljenog života, nizovi, slaganje kupnje i odgovor na dolaznu vatru - svaka naspram vlastitog nultog modela: [Kolektivno ponašanje](collective-behaviour.md).

## Podaci koji čine uvide korisnima {#data-that-makes-insights-work}

- pozicije s **vremenom**, **osobom** i stupcem **tima**;
- stupac **događaja** s ubojstvima i smrtima (`kill`, `death`), i drugima (`hit`, `fire`, `capture` ...);
- stupac **druge strane** (`other`, `victim`) za razmjene i smjerove;
- stupac **vozila** ili **tipa** za klase; stupac `ai` za igrače naspram UI-ja;
- stupac **sesije** / **utakmice** / **runde** kad ima više utakmica.

[Demo podaci](demo-data.md) imaju sve to.
