---
title: "Līmeņa izskats"
parent: "Līmeņi un fona ģeometrija"
nav_order: 3
lang: "lv"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Līmeņa izskats

Šīs vadības maina, kā izskatās 3D līmenis, lai siltums no tā izceltos un tu joprojām varētu lasīt vietu. Nekas šeit nemaina datus.

## Ātrais starts {#quick-start}

1. Ielādē 3D līmeni ([3D līmeņi](model-levels.md)).
2. Sadaļā **Fons / līmenis** samazini **Spilgtums**, līdz siltums ir spilgtākā lieta ekrānā.
3. Atver **Zemes reljefs** un paaugstini **Nogāžu ēnojums** vai **Horizontāļu stiprums**, līdz vari atšķirt kalnu no līdzenuma.
4. Atver **Būves**. Samazini **Skaldņu necaurredzamību**, lai redzētu ēku iekšpusi, vai ieslēdz **Būvju tekstūru**, lai tās redzētu cietas.
5. Ja uz zemes ir uzgleznots attēls, izmēģini **Zemes tekstūra** izslēgtu un ieslēgtu.

![Atvērtās sadaļas Zemes reljefs un Būves, līmenis rādīts ar reljefa pazīmēm](../assets/img/en/level-appearance-sections.webp)

Ar ielādētu [3D līmeni](model-levels.md) Fona / līmeņa panelis rāda šīs vadības. Noklusējumi ir tie, ko saņem jauni importēts līmenis ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Tās mainot, tiek tikai pārzīmēta aina; siltuma uzkrāšana paliek.

## Viss līmenis {#the-whole-level}

| Vadība | Noklusējums | Diapazons | Nozīme |
|---|---|---|---|
| **Necaurredzamība** | 100% | 0–100% | Zem 100% līmenis tiek sajaukts un neraksta dziļumu, tāpēc vairs [neaizsedz](depth-and-culling.md) siltumu. |
| **Spilgtums** | 0,9 | 0–2 (kustināšana 64) | |

Līmenis tiek zīmēts ar zemu piesātinājumu: pelēka zeme, tonēts apvalks, tā ka siltums ir vienīgā piesātinātā lieta ekrānā. Atšķirībā no [kartes attēla](map-images.md) 3D līmenim nav Desaturācijas slīdņa.

## Zemes reljefs {#ground-relief}

No tāluma kalns un līdzenums izskatās vienādi pelēki, tāpēc skatītājs pievieno trīs norādes. Katra atbild uz citu problēmu:

| Vadība | Noklusējums | Nozīme |
|---|---|---|
| **Horizontāļu intervāls** | no zemes augstuma diapazona | Augstums starp horizontāļu līnijām, logaritmiski no 1/4000 līdz 1/2 no līmeņa augstuma diapazona. Apakšējā daļa no trases ir *izslēgta*. Noklusējums ir 1/40 no zemes augstuma diapazona, noapaļots līdz 1/2/5 solim: 10 m līnijas der kalna nogāzei, bet ir bezjēdzīgas karjera dibenā. Katra piektā līnija tiek zīmēta stiprāk. Horizontāles tiek zīmētas ekrāna telpā, tāpēc tās paliek vienu pikseli platas jebkurā tālummaiņā. Tās ir vienīgā pazīme, kas paliek zemei, kas ir pārāk līdzena, lai to ēnotu. |
| **Horizontāļu stiprums** | 35% | 0–100% |
| **Nogāžu ēnojums** | 55% | Tumšo pēc stāvuma, tāpēc krasti un klintis lasās no jebkura kameras leņķa. Gaisma tā nedara: tā saplacina, kad skaties uz to. |
| **Augstuma skala** | 50% | Zemā zeme tumšāka, augstā zeme gaišāka, pa zemes augstuma diapazonu: lielā mēroga forma. |

Sadaļas galvene rāda horizontāļu stāvokli: *ik pēc N m*, horizontāļu intervālu vai *nav horizontāļu*, kad intervāls ir izslēgts.

## Zemes virsma {#ground-surface}

| Vadība | Noklusējums | Rāda, kad | Nozīme |
|---|---|---|---|
| **Ūdens** | ieslēgts | līmenim ir ūdens | Ezeri, upes un jūra, zīmēti plakani bālā zilpelēkā krāsā. Neviena reljefa pazīme neattiecas uz virsmu, kas pēc definīcijas ir līdzena. |
| **Ūdens necaurredzamība** | 60% | Ūdens ir ieslēgts | Krastlīnija un zeme seklumā redzama caur caurspīdīgu ūdeni. |
| **Zemes trijstūri** | 30% (0 līmenim ar tekstūrām) | vienmēr | Reljefa paša malas, zīmētas pāri ēnotajai virsmai, izzūd starp 6% un 25% no līmeņa platuma no kameras. Rāda, cik rupji zeme ir paraugota, un dod nogāzei kaut ko, pēc kā spriest attālumu. Tiek veidota pie pirmās lietošanas, kas lielā līmenī aizņem brīdi. |
| **Zeme tikai kā karkass** | izslēgts | vienmēr | Aizstāj zemes virsmu ar tās malām. Tas ir pilnīgi shematisks — tajā arī zūd ēnojums, horizontāles un aizsegšana, tāpēc *Zemes trijstūri* parasti ir labāka izvēle. |
| **Zemes tekstūra** | ieslēgts | līmenim ir tekstūras | Zīmē zemi ar tekstūrām, ko nes fails (asfalts, grāvmala, zāle). Virs tās maigi tiek uzlikts tīkla apgaismojums, jo tekstūra jau nes savu smalko reljefu. **Spilgtums** ir veids, kā to nomierināt zem siltuma; Desaturācija pieder kartes attēliem. |
| **Uztvertā krāsa** | izslēgts | līmenim ir virsotņu krāsas | Ēno zemi ar krāsu, ko uzņēma skenējums, nevis pelēku — citādi rekonstruēts ceļš nav atšķirams no grāvmalas. Dzinēju eksportiem krāsu nav; ja tās nav, panelis saka *Šajam līmenim nav krāsas.* |

## Būves {#structures}

Galvene **Būves** rāda būvju trijstūru skaitu. Zemākais norādījums saka, kā tās tiek zīmētas (*zīmētas cietas savās tekstūrās* vai *zīmētas kā caurspīdīgs apvalks, lai redzētu siltumu iekšā*), un cik daļu ir būves.

| Vadība | Noklusējums | Nozīme |
|---|---|---|
| **Būvju tekstūra** | ieslēgts, ja būvēm ir tekstūras | Zīmē būves cietas, savās tekstūrās. Ieslēdzot, skaldņu necaurredzamība kļūst 100% un šķautnes tiek izslēgtas; izslēdzot, atgriežas pie tonēta caurspīdīga apvalka ar 25%. Būve ar tekstūru tiek apgaismota no puses, ko redz kamera, jo zīme ir divas skaldnes, viena aiz otras, un tas, kura uzvar dziļuma pārbaudē, ir atkarīgs no noapaļošanas. |
| **Karkasa šķautnes** | ieslēgts; izslēgts virs 300 000 būvju trijstūru vai ja ir tekstūra | Būvju dublēto šķautņu līnijas, viena līnija katrai šķautnei. |
| **Šķautņu necaurredzamība** | 50% | |
| **Čaulas skaldnes** | ieslēgts | Vāja virsma ar spilgtu Fresnela malu, lai ēka lasās kā tilpums, nevis kā būris vai miglas kamols. |
| **Skaldņu necaurredzamība** | 25% (35% virs 300 000 būvju trijstūru, 100% ar tekstūru) | 0–60% uz trases, līdz 100% ar rokturi. Turi zemu: cietas būves paslēpj datus iekšpusē. |
| **Asas šķautnes** | ieslēgts (izslēgts ar tekstūru) | Ēno katru trijstūri pēc tā paša normāles, aprēķinātas fragmenta šeiderī no ekrāna telpas atvasinājumiem. Eksportētie līmeņi ir savienoti un nes vidējotas normāles, kas noapaļo katru kastes stūri "izkususi folija" izskatā. Katru virsotni sadalīt, lai to labotu, reizinātu virsotņu bufera izmēru. Izslēdz to līmenim, kura izliektām virsmām ir lielāka nozīme nekā stūriem. |
| **Būvju tonis** | Ciāns | Krāsu izvēlnes un iestatījumi **Ciāns**, **Dzintara**, **Violets**, **Balts**. |
| **Rādīt daļu klasifikāciju (N)** | | Katra daļa, tās klase un iemesls; skat. [3D līmeņi](model-levels.md#ground-structures-and-water). |

## Līmeņa griešana {#cutting-the-level}

[Griezums](slice.md) un, ar *Griezt arī līmeni*, [atmešana pēc attāluma](depth-and-culling.md#distance-culling) griež zemi, būves un ūdeni tajās pašās plaknēs kā siltumu.
