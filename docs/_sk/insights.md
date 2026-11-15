---
title: "Zistenia"
nav_order: 7
has_children: true
lang: "sk"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: false
---

# Zistenia

**Zistenia** prejdú načítané dáta a hľadajú, čo vyniká - silné pozície, smrtiace terény, pasce na spawnoch, úzke miesta, hráči ďaleko nad svojimi rovesníkmi - a povedia vám to, najsilnejšie prvé, s dôkazmi. Použite ich, ak sa za minútu chcete dozvedieť, kde sa zápas vyhral alebo prehral. Potom môžu napísať zhrnutie a v jednom prehraní fungovať ako komentátor, ktorý skáče ku veľkým momentom.

Všetko sa počíta vo vašom prehliadači. Nič neodchádza z vášho počítača, pokiaľ nezapnete externú AI (pozri [Externú AI](#external-ai)).

![Zistenia na ukážke tankov: 14 zistení, najsilnejšie prvé](../assets/img/en/insights.webp)

Sekcia **Zistenia** je na bočnom paneli kariet Heatmapa a Zápas. Má tri záložky: **Zistenia**, **Zhrnutie** a **Komentátor**.

## Zistenia {#findings}

1. Načítajte dáta a otvorte **Zistenia**. Stlačte **Nájsť zistenia** (ukazuje sa „Počítam… n%“ ako priebeh).
2. Čítajte zoznam. Každé zistenie má pruh sily, jednu vetu, kvalitu dôkazov (*Silné dôkazy*, *Dobré dôkazy* alebo *Nejaké dôkazy*), detektor, ktorý ho našiel, a triedu vozidla, kde na tom záleží.
3. **Kliknite na zistenie**: prehliadač použije jeho filtre, presunie kameru na miesto a skočí na čas, a otvorí podrobnosti: efekt s 95 % intervalom, hodnoty p a q, spočítané dôkazy a **Objem tu**, ktorý nakreslí [objem](volumes.md) okolo miesta.
4. **Obnoviť filtre** vráti vaše filtre. **Kopírovať JSON** skopíruje celú správu.

Počítanie používa aktuálne filtre, skryté skupiny a vybraný zápas v celom časovom rozsahu. Keď potom filtre zmeníte, poznámka to povie; stlačte **Spočítať znova**.

Riadky na vrchu zoznamu (napríklad súčty peňazí) zhrnú celé dáta pred zisteniami.

![Otvorené zistenie: horúca zóna výstrelov, jej čísla a zodpovedajúci úryvok z literatúry](../assets/img/en/insights-finding.webp)

### Detektory {#the-detectors}

| Detektor | Čo nájde | Potrebuje v dátach |
|---|---|---|
| **Silné pozície** | Miesta s oveľa lepšími pomermi zabití ku smrti než zvyšok mapy a *bezpečný terén*, kde na čas strávený tam zomiera málo ľudí | udalosti zabití a smrti |
| **Horúce a studené zóny** | Miesta, kde sa druh udalosti (výstrely, zásahy, dobývanie ...) deje oveľa častejšie alebo zriedkavejšie, než predpovedá čas strávený tam | stĺpec udalostí |
| **Otvorený terén a krytie** | Smrti na otvorenom proti blízkej geometrii levelu a pomaly oproti rýchlemu pohybu | smrti; 3D level pre časť geometrie |
| **Spawny** | Silné spawny, pasce na spawnoch, bezpečné spawny, čas do prvého kontaktu | čas a osoby |
| **Trieda podľa miesta** | Trieda vozidla alebo hráči proti AI, ktorí si v oblasti vedú oveľa lepšie alebo horšie | zabitia plus stĺpec triedy vozidla alebo hráč/AI |
| **Hráči** | Hráči, ktorí zabíjajú alebo umierajú oveľa viac alebo menej než ostatní v tej istej triede | osoby a zabitia |
| **Úzke miesta a boky** | Úzke miesta (oveľa viac prechodov než okolitý terén) a bočné trasy (málo použité, no vedú k zabitiam) | osoby |
| **Hodnota** | *Drahý terén* a *Zárobkový terén* | [stĺpce hodnôt](value-weighting.md) |

Detektory, ktoré na dátach nemôžu bežať, sú dole v zozname s dôvodom.

### Ako sa zistenia radia {#how-findings-are-ranked}

Každé miesto alebo skupina sa testuje voči zvyšku mapy (presné binomické alebo mierové testy). Miera falošných objavov je držaná na 5 % (Benjamini-Hochberg). Náhoda môže vyzerať ako vzor; toto drží falošné poplachy nízko: medzi zobrazenými zisteniami sa očakáva najviac asi jedno z dvadsiatich ako náhoda. Efekty z málo udalostí sa pred radením stiahnu k „žiadnemu efektu“. Zobrazí sa najviac 60 zistení a každý detektor dostane niekoľko miest pri vrchu.

## Zhrnutie {#debrief}

Záložka **Zhrnutie** zapíše zistenia do krátkeho textu: úvod, najjasnejšie zistenie, jedno o taktike, jedno o vyvažovaní, zvyšok zoskupený podľa detektora a koľko stojí na slabších dôkazoch. Každý odsek má očíslované tlačidlá, ktoré ukazujú jeho zistenia. **Kopírovať text** ho skopíruje.

![Zhrnutie napísané vstavaným rozprávačom](../assets/img/en/debrief.webp)

Vstavaný rozprávač funguje offline, vo vašom jazyku. Výber **Optika** nad ním (pozri [Šošovku znalostí](knowledge.md)) určuje, akú literatúru odseky citujú.

### Externá AI {#external-ai}

**Nastavenia AI** umožňuje, aby zhrnutie napísal model AI podľa vašej voľby:

| Nastavenie | Význam |
|---|---|
| **Poskytovateľ** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (lokálne), LM Studio (lokálne), server llama.cpp (lokálne) alebo ľubovoľný koncový bod kompatibilný s OpenAI |
| **Základná URL**, **Model** | Vyplní poskytovateľ; **Vypísať modely** sa opýta servera |
| **Kľúč API** | Posiela sa iba na základnú URL. Nikdy sa nezapisuje do logov ani sa neukladá v pohľadoch, exportoch či súboroch `.3dheat`. Väčšina lokálnych serverov nepotrebuje žiadny. |
| **Zapamätať kľúč v tomto prehliadači** | Predvolene vypnuté: kľúč sa zabudne pri zatvorení stránky |
| **Použiť externú AI** | Predvolene vypnuté |
| **Posielať mená hráčov** | Predvolene vypnuté: hráči sa posielajú ako P1, P2 ... |

Potom napíšte voliteľnú otázku a stlačte **Napísať pomocou AI**. Posielajú sa len zistenia a ich čísla - nikdy riadky vašich dát. Odpoveď sa postupne načíta; citované zistenia sa stanú tlačidlami.

## Komentátor {#caster}

Pre **jeden zápas** (ak je načítaných viac, vyberte jeden) **Komentátor** nájde momenty hodné pozornosti: prvú krv, viacnásobné zabitia, výmeny, záchrany v koncovke, zmeny pri cieľoch, návraty, vynikajúcich hráčov, dlhé výstrely.

![Momenty komentátora pre jedno kolo ukážky streľby](../assets/img/en/caster.webp)

- Kliknite na moment: pohľad prejde na prehrávanie, skočí tesne pred neho, prelietne tam a sleduje hráča.
- **Prehrať momenty** prehrá každý až do konca a ide ďalej; **Predchádzajúci** / **Ďalší** sa pohybujú medzi nimi.
- S externou AI zapnutou **Komentár od AI** napíše komentár zo zoznamu momentov (druhy, časy, mená alebo pseudonymy, tímy, triedy, vzdialenosti).

Potrebuje osoby a udalosti zabití/smrti (alebo dobývania); stĺpec `other`/`victim` umožňuje výmeny a dlhé výstrely.

## Šošovka znalostí {#knowledge-lens}

Zistenie sa dá čítať cez **optiku** zavedených poznatkov: vojenská doktrína, vzdušný a námorný boj, operácie v mestách, herný dizajn a esport (alebo *Automaticky*, podľa jednotiek v dátach). Otvorené zistenie potom ukáže najbližšiu položku **doktríny a literatúry** a **historickú paralelu**, s odkazmi, a **Miery optiky** počíta miery z tejto literatúry na dátach (prispôsobenia Lanchester, pomery výmen, pomery síl, polia paľby, kľúčový terén, výmeny, iniciatíva). Zhrnutie a výzva pre AI ich obsahujú. Všetko o tom: [Šošovka znalostí](knowledge.md).

Miery optiky merajú aj to, ako sa hráči správajú ako dav a ako skupina - zarovnanie a krúženie, navádzanie trás, pruhy a stopy, nahustenie, vodcovia a nasledovníci, zaostávajúci, zlomový bod pri stratách, riziko po stratenom živote, série, zhoda pri nákupe a reakcia na prichádzajúcu paľbu - každé voči vlastnému nulovému modelu: [Kolektívne správanie](collective-behaviour.md).

## Dáta, vďaka ktorým zistenia fungujú {#data-that-makes-insights-work}

- pozície s **časom**, **osobou** a stĺpcom **tímu**;
- stĺpec **udalostí** so zabitiami a smrťami (`kill`, `death`) a inými (`hit`, `fire`, `capture` ...);
- stĺpec **druhej strany** (`other`, `victim`) pre výmeny a smery;
- stĺpec **vozidla** alebo **typu** pre triedy; stĺpec `ai` pre hráčov proti AI;
- stĺpec **relácie** / **zápasu** / **kola**, keď je zápasov viac.

[Ukážkové dáta](demo-data.md) majú všetky.
