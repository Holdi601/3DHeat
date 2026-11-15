---
title: "Spēles analīze (CS2)"
nav_order: 10
lang: "lv"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Spēles analīze (Counter-Strike 2)

Cilne **Mačs** atskaņo ierakstu kā attēlus, un Counter-Strike 2 mačam tā rāda arī rezultātu tabulu: kurš uzvarēja katru raundu, kā un kurš guva nogalinājumus. Izmantojiet to, lai pārskatītu maču raundu pa raundam, un pēc tam pārietu uz to pašu brīdi siltumkartē.

Cilne Mačs atskaņo jebkuru ierakstu kā attēlus: War Thunder vai Tacview ierakstu vai CS2 demo, kas uzskaitīti zem **Mači atskaņojumā** ([Mača atskaņojums](match-replay.md)). CS2 `.match.json` fails pievieno šajā lapā aprakstīto rezultātu tabulu.

## Pārskatiet CS2 maču {#review-a-cs2-match}

1. Konvertējiet demo ([zemāk](#where-the-data-comes-from)) uz `.parquet` un `.match.json` failu.
2. Cilnē **Siltumkarte** ielādējiet `.parquet` failu zem **Avots**.
3. Atveriet cilni **Mačs** un noklikšķiniet uz **Ielādēt mača failus…**, vai nometiet `.match.json` failu uz skata.
4. Noklikšķiniet uz maču **Maču kopsavilkumi**, tad uz raunda joslas šūnas, lai atvērtu šo raundu.
5. Noklikšķiniet uz **Rādīt raundu**, lai redzētu šo raundu siltumkartē, vai uz **Atskaņot raundu**, lai skatītu to kā attēlus.

![Cilne Mačs: raunda josla ar atvērtu raundu, nogalinājumu plūsma un rezultātu tabula](../assets/img/en/match-analysis-round.webp)

Vārdi, piemēram, KAST, ADR, eco, force buy un trade, ir [terminu vārdnīcā](glossary.md#counter-strike-words).

## No kurienes nāk dati {#where-the-data-comes-from}

[3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) demo konvertētājs
pārvērš demo divos failos uz maču, mapē katrai kartei:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Fails | Ielādēts | Satur |
|---|---|---|
| `<match>.parquet` | cilnē **Siltumkarte** (Avota panelis, kā jebkurš Parquet - viens fails, vairāki vai visa mape) | katra spēlētāja pozīcija astoņas reizes sekundē un katrs notikums, kur tas notika: nogalinājums, nāve, ievainojums, šāviens, metiens, dūmi, zibgranāta, HE, molotovs, māņu granāta, aklināšana, bumbas uzstādīšana, atmīnēšana, sprādziens; ar `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, skatīšanās virzienu, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | cilnē **Mačs** | komandas, rezultāts, katrs raunds (uzvarētājs, kā, ekonomika, uzstādīšana, katrs nogalinājums kārtībā, klači, izdzīvojušie), katra spēlētāja rezultātu tabulas rinda |

Parquet faila kājene satur lasīšanas norādījumus (atslēga `heat3d`), tāpēc tas atveras bez jebkādiem iestatījumiem: spēlētājs kā persona, puse kā grupa, katrs raunds (`roundId`, "<match> #NN") kā sesija, skatīšanās virziens ieslēgts, un pasaule ir pareizi pagriezta (CS2 pasaule ir labās rokas ar Z uz augšu; ja to lasītu kā noklusējuma Z-augšu kartējumu, tā izskatītos spoguļattēlā). Skat. [Kolonnu kartējums](column-mapping.md) un [Failu ielāde](loading-files.md).
`python -m heat3d_cs2 map <map>` eksportē kartes ģeometriju tajā pašā sistēmā, ielādējama cilnē **Līmenis**.

Skaitļu pamatā esošās konvencijas ir konvertētāja pašas (norādītas tā README un iekļautas katrā kopsavilkumā): nāve ir **atriebta**, ja tās slepkava tiek nogalināts ar kādu no upura komandas biedriem **5 s** laikā; **KAST** ir to raundu daļa, kuros ir nogalinājums, palīdzība (zibgranātas palīdzība skaitās), izdzīvošana vai atriebta nāve; **bojājums** ir patiesi zaudētā veselība, tikai ienaidnieki; **klačs** ir būt pēdējam dzīvam vienā pusē, kad pretinieki vēl stāv, un to uzvarē, kad puse uzvar; **pirkums** katrai pusei ir no vidējās ekipējuma vērtības sasalšanas laika beigās - katras regulārās puslaika pirmais raunds ir pistoļu raunds (pagarinājumā nav), tad zem 1500 $ - eco, zem 4000 $ - force buy, viss pārējais - pilns pirkums.

## Cilne {#the-tab}

Cilnes Mačs sānjoslas augšā ir siltumkartes režīma pārslēdzējs un sesijas izvēlne, zemāk - maču sadaļas, un pēc tam siltumkartes paneļi **Filtri**, **Līmenis** un **Kamera** - skats ir jebkura Parquet, kas ielādēts cilnē Siltumkarte, siltumkarte.

### Maču kopsavilkumi {#match-summaries}

| Vadība | Ko dara |
|---|---|
| **Ielādēt mača failus…** | izvēlas `.json` failus (vairākus uzreiz): `.match.json` kopsavilkumus |
| nomest uz skata | JSON faili, kas nomesti uz skata, kamēr ir atvērta cilne Mačs, ielādējas tāpat (citi faili tiek ignorēti) |
| **Notīrīt** | noņem katru maču |
| **Visi mači** (ja ir divi vai vairāk) | "N mači, M raundi": statistika visiem kopā |
| maču rinda | "TeamA 13 pret TeamB 9", karte · N raundi: atver šo maču |

Fails tiek pieņemts, ja tas ir JSON ar `"format": "heat3d-cs2-match"` un masīviem `rounds`, `players` un `teams`. Kļūdas tiek uzskaitītas zem pogām: "<file>: nav JSON", "<file>: nav CS2 maču kopsavilkums (heat3d-cs2-match)", "<file>: trūkst rounds, players vai teams". Mačs, kas ielādēts vēlreiz (tas pats `match` nosaukums), aizstāj iepriekšējo. Mači tiek kārtoti pēc kartes, tad pēc nosaukuma. Ja ielādēts tieši viens mačs, tas tiek atvērts; citādi izvēle paliek (pēc noklusējuma visi mači).

Ja nekas nav ielādēts, sadaļa paskaidro: konvertējiet ar `python -m heat3d_cs2 demos`, šeit ielādējiet `.match.json` failus, bet cilnē Siltumkarte - `.parquet` failus.

### Mačs (viens mačs atvērts) {#match-one-match-open}

**Galvene:** abas komandas ar savu rezultātu, karte, puslaiki -
"puslaiki 7-5, 6-6": raundi 1-12 un 13-24 (premjerlīgas un sacensību spēle MR12;
kopsavilkuma pašu puslaika garums, ja tas ir norādīts, tātad 1-15 un 16-30 MR15) -
tad, ja mačs gāja uz pagarinājumu, tā rezultāts atsevišķi: "pagarinājums 4-2",
raundi pēc abiem puslaikiem. Neizšķirts raunds neskaitās nevienai komandai. Un "N raundi nogriezti demo", ja kopsavilkumā ir nepabeigti raundi.

**Raunda josla:** šūna katram raundam, krāsota pēc puses, kas uzvarēja, ar tā numuru un atzīmi par to, kā tas beidzās. Neizšķirts raunds (bez uzvarētāja) ir neitrāli pelēka šūna ar atzīmi `=`, nekad puses krāsa; tā rīkjosla saka "30. raunds: neizšķirts - neviena puse to neuzvarēja".

| Atzīme | Beidzās ar |
|---|---|
| B | bumba sprāga |
| D | bumba atmīnēta |
| K | nogalināti |
| T | beidzās laiks |
| S | padevās |
| = | neizšķirts |
| ? | citādi |

Atdalītājs atzīmē otrā puslaika sākumu (13. raunds vai raunds pēc kopsavilkuma puslaika garuma) un katra trīs raundu pagarinājuma puslaika sākumu (25., 28., 31. raunds, …). Uzvelciet peli pāri šūnai: "7. raunds: TeamA (T) - bumba sprāga, uzstādīta A" ("…, uzstādīta, vieta nav zināma", ja kopsavilkumā nav vietas), un abu pušu pirkums un ekipējuma vērtība. Noklikšķiniet, lai atvērtu raundu; vēlreiz - lai aizvērtu ("Noklikšķiniet uz raunda, lai redzētu tā nogalinājumus, ekonomiku un atskaņojumu.").

**Raunds:**

- "7. raunds: <komanda> uzvarēja - <kā>" ("30. raunds: neizšķirts - neviena puse to neuzvarēja" neizšķirtam) un cik ilgi raunds turpinājās (no sasalšanas beigām līdz izlemšanai, m:ss);
- ekonomika: katras puses komanda, pirkums (pistole, eco, force buy, pilns pirkums) un ekipējuma vērtība ("4350 $");
- uzstādīšana: vieta, spēlētājs un laiks raundā (no jebkuras kopsavilkuma versijas); "Uzstādījis <player> 1:05, vieta nav zināma", kad vieta nav zināma;
- **nogalinājumu plūsma**, kārtībā: laiks raundā, uzbrucējs (puses krāsā; "world", ja uzbrucēja nav), ierocis un karodziņi - **HS** galvas šāviens, **WB** cauri sienai, **SM** cauri dūmiem; **pirmais** raunda pirmais nogalinājums, **atriebe** (atriebās biedram 5 s laikā), **atriebts** (slepkava tika nogalināts 5 s laikā), **komanda** - komandas nogalinājums (pašnāvība nav neviens). Nogalinājumi pēc tam, kad raunds jau bija izlemts, tiek nobalsināti;
- klači: "<player> (T) viens pret 3: uzvarēja klaču" / "zaudēja";
- kas bija dzīvs beigās, katrai pusei ("neviens");
- **Rādīt raundu**: viss šajā raundā siltumkartē;
- **Atskaņot raundu**: atskaņo raundu kā kastes, no tā sākuma (zemāk).

Pogas **Rādīt siltumkartē** (skat. [zemāk](#show-in-the-heatmap)) šim mačam vai atvērtajam raundam.

### Rezultātu tabula {#scoreboard}

Tabula katrai komandai, rinda katram spēlētājam:

| Kolonna | Ir |
|---|---|
| K, D | nogalinājumi, nāves |
| A | palīdzības, ieskaitot zibgranātu palīdzības |
| ± | nogalinājumi mīnus nāves (zaļš virs 0, sarkans zem) |
| ADR | bojājums uz raundu, patiesi zaudētā veselība |
| KAST | % no raundiem ar nogalinājumu, palīdzību, izdzīvošanu vai atriebtu nāvi |
| HS | % galvas šāvienu nogalinājumu |
| Open | uzvarēti-zaudēti pirmie dueļi |
| Cl | uzvarēti/nospēlēti klači |

Uzvelciet peli pāri spēlētājam: atriebes nogalinājumi, reizes atriebts, zibgranātu palīdzības, aklinātie ienaidnieki, utilītas bojājums un raundi ar vairākiem nogalinājumiem ("2×3k"). **Noklikšķiniet uz spēlētāja**, lai redzētu viņa nogalinājumus un nāves siltumkartē (šis mačs).

### Visos mačos (Visi mači) {#across-matches-all-matches}

Pār visiem ielādētajiem mačiem:

- "N mači · M raundi · <kartes>", un "N raundi neizšķirti, neviena puse tos neuzvarēja", ja bija neizšķirti;
- **Uzvarētie raundi** katrai pusei: kopumā, **pistoļu** raundos (kopsavilkuma pistoļu raundi) un **eco**, **force** un **pilnos** pirkumos (katrs kā procents ar nospēlētajiem raundiem; uzvelciet peli, lai redzētu "uzvarēti no nospēlētajiem"). Neizšķirts raunds tiek nospēlēts abām pusēm un neviens to neuzvar;
- **Bumba**: uzstādījumi pa vietām un cik bieži T puse turpināja uzvarēt šajos raundos ("12 uzstādījumi uz A (T uzvarēja 67%)"), uzstādījumi, kuru vietu kopsavilkums pats nezina ("2 uzstādījumi nezināmā vietā (T uzvarēja 50%)"), vai "nekad nav uzstādīta"; kā beidzās raundi, visbiežākais pirmais;
- "Puse, kas guva pirmo nogalinājumu, uzvarēja N% no šiem raundiem." (pašnāvība nav pirmais nogalinājums; neizšķirts raunds nepārvērš nevienu pirmo nogalinājumu);
- **Pirmie dueļi — kur**: desmit vietas ar visvairāk pirmajiem nogalinājumiem (pēc tā, kur bija upuris; spēles vietu nosaukumi kļuvuši lasāmi, "TopofMid" → "Top of Mid"), dueļi un daļa, ko T puse uzvarēja;
- **Spēlētāji**: piecpadsmit labākie pēc nogalinājumiem mīnus nāvēm, apvienoti pār visiem viņu mačiem (sasaistīti pēc Steam ID): mači, K-D, ADR un KAST, svērti pēc nospēlētajiem raundiem, HS% svērts pēc nogalinājumiem, pirmie dueļi. **Noklikšķiniet uz spēlētāja**, lai redzētu viņa nogalinājumus un nāves visos mačos siltumkartē.

Pogas Rādīt siltumkartē visiem ielādētajiem mačiem atrodas zem tā.

## Rādīt siltumkartē {#show-in-the-heatmap}

Katra saite uzstāda pašas siltumkartes **filtrus**, tāpēc rādītais paliek redzams un labojams filtru panelī, un **Rādīt visas** tos notīra. Tie darbojas ar siltumkartes tabulu, kas ielādēta cilnē Siltumkarte; cilne Mačs to nekad pati neielādē.

| Poga | Rādītie notikumi |
|---|---|
| **Pozīcijas** | `position` - kur atradās spēlētāji, astoņas reizes sekundē |
| **Nogalināšanas** | `kill` - kur stāvēja slepkava |
| **Nāves** | `death` - kur krita upuris |
| **Pirmie nogalinājumi** | `kill` un `death` ar `opening` = 1 - katra raunda pirmais nogalinājums, kur stāvēja abi (piedāvā tikai tad, ja tabulā ir kolonna `opening`) |
| **Dūmi** | `smoke` - kur nolaidās dūmi |
| **Zibgranātas** | `flash` - kur uzsprāga zibgranātas |
| **Molotovi** | `molotov` - kur degā molotovi un zažigi |
| **HE** | `he` - kur eksplodēja HE granātas |
| **Bumbas** | `plant` - kur bumba tika uzstādīta |
| **Šāvieni** | `shot` - no kurienes tika šauts |

Ierobežots pēc tā, kur atrodas pogas: visi ielādētie mači, šis mačs vai šis raunds ("Rādīt siltumkartē - 7. raunds").

To, ko nevar piemērot, saka zem pogām, nevis klusi nefiltrē līdz nekam: "nav saglabāta neviena maču kolonna - mačs nav piemērots", "mačs: X nav ielādētajos datos", tāpat raundam un notikumiem, "spēlētājs X nav ielādētajos datos", "puse X nav ielādētajos datos", "siltumkartes dati nav ielādēti: ielādējiet maču .parquet failus cilnē Siltumkarte". Ja dati nav ielādēti, saites arī saka "Ielādējiet maču .parquet failus cilnē Siltumkarte, lai tos redzētu kartē."

**Atskaņot raundu** papildus pārslēdz siltumkarti uz **Kastu atskaņojumu**, laika skalu uz *atskaņot* režīmu ar tās logu iestatītu uz *dzīves ilgums*, pārvieto uz raunda sesijas sākumu un atskaņo. Kad raunds nav ielādēto datu sesija: "šis raunds nav ielādēto datu sesija: nav ko atskaņot".

## Izstrādātājiem {#for-developers}

Kods: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Kopsavilkumu versijas {#summary-versions}

Cilne nolasa 1. un 2. versijas kopsavilkumus (`"version"` failā) blakus un izturas pret tiem vienādi:

| | 2. versija | 1. versija |
|---|---|---|
| uzstādīšanas laiks | sekundes raundā, kā nogalinājumi | mača sekundes; cilne atņem raunda sākumu |
| uzstādīšanas vieta | `A` vai `B`; tukša, kad demo to nesaka | `A`, `B` vai vienības numurs - nolasīts kā nezināma vieta |
| puslaika garums | `halfLength`, no vietas, kur puses pirmo reizi mainās; 12, kad tas ir null | 12 (MR12) |
| pistoļu raundi | `pistolRounds` (1. raunds un pirmais raunds pēc puslaika) | raundi, kuru pirkums ir `pistol` |
| neizšķirts raunds | `winner` un `winnerTeam` tukši | - |
| pašnāvība | `suicide` nogalinājumā, nekad komandas nogalinājums | nosaka pēc tā, ka uzbrucējs un upuris ir tas pats spēlētājs |

Nogalinājuma `noscope` un `attackerBlind` (2. versija) cilnē Mačs netiek rādīti, un cilne nerāda arī vietu no siltumkartes tabulas, tāpēc granātas rindas tukšā `place` šeit nekā nemaina.

Kā fokuss kļūst par filtriem (`focusFilters`):

- **mačs** → kategorijas filtrs kolonnā `match`;
- **raunds** → diapazona filtrs `round` = N uz skaitliskas kolonnas `round` (kategorijas filtrs uz kategoriskas), un raunda sesija (`<match> #NN`) tiek izvēlēta sesiju izvēlnē;
- **notikumi** → kategorijas filtrs kolonnā `event`;
- **spēlētājs** → personas filtrs uz šo spēlētāju;
- **puse** → grupas filtrs.
