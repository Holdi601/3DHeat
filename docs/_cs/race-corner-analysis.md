---
title: "Analýza zatáčku po zatáčce"
parent: "Analýza závodu"
nav_order: 55
lang: "cs"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analýza zatáčku po zatáčce

Dvě kola stejné tratě se porovnávají zatáčku po zatáčce. U každé zatáčky prohlížeč řekne, kdo byl rychlejší, kolik času to stálo a proč: brzdil moc brzy, přidal plyn pozdě, jel širší linií. Víte tak, co trénovat jako první.

![Nález otevřený v části Kde se zlepšit, vedle tabulky Zatáčku po zatáčce](../assets/img/en/race-corner-finding.webp)

Pracovní příklad: v zatáčce 3 brzdí jezdec A o 20 m dřív než jezdec B a na tom ztratí 0,15 s. Pak ale dřív přidá plyn a na výjezdu získá 0,15 s. Celkem 0,00 s. Zatáčka je vyrovnaná a nikomu se neříká, aby brzdil později.

## Co vidíte {#what-you-see}

### Kde se zlepšit {#where-to-improve}

Sekce postranního panelu pro zaměřené kolo („Načtěte alespoň dvě kola jedné tratě.“, dokud nejsou).

**Hlavička:** „<kolo> <čas> proti <reference> <čas>“ a rozdíl časů kol. U reference je to „proti nejrychlejšímu jinému kolu v každé zatáčce (…)“ a celková ztráta. Vedle ní se ztráta rozdělí na *jízdu* a *vůz / okolnosti*.

**Pruh rozdělení:** ztracený čas podle skupin příčin (brzdění, vjezd, výjezd, rovinka, vůz, okolnosti) v barvách příčin, s legendou.

**Nálezy**, tři seznamy:

1. Ztráty řidiče, nejdražší první, nejvýš **12**. Nebo „Nic, kde by jiná jízda přinesla čas, nevyniká.“
2. **Ukázat, co stál vůz nebo situace (X s)**: ztráty vozu a okolností, nejvýš 8 (ve výchozím nastavení zapnuto).
3. **Kde je <kolo> rychlejší, nebo jinak vyrovnané (N)**: zisky a vyrovnané zatáčky, nejvýš 10 (ve výchozím nastavení zapnuto).

Každý nález ukazuje své pořadí, nadpis (zatáčku a co se stalo, u ztráty i cenu), řádek verdiktu, cenu (zisky se znaménkem minus) s pruhem a štítek: *brzdění*, *vjezd*, *výjezd*, *rovinka* (u ztrát řidiče s „· vůz X“, když vůz vysvětluje 0,02 s nebo víc), *vůz*, *okolnosti*, *rychlejší*, *vyrovnané*. **Klik na něj** seřadí vozy 40 m před ním, zarámuje ho a přehraje a otevře jeho měření:

- **Brzdění:** kde každé kolo brzdilo (nebo odlehčilo) a z jaké rychlosti, a o kolik metrů dřív nebo později (od 5 m);
- **Nejpomalejší:** nejnižší rychlost každého kola a kde;
- **Plný plyn:** kde měl každé kolo plný plyn a o kolik dřív nebo později;
- **Linie:** rozdíl v natočení, nejtěsnější poloměry, jak daleko uvnitř nebo vně, a tvar linie a apex každého kola;
- **Rovinka k další zatáčce:** její délka, obě rychlosti tam, kde byla obě na plném plynu, co se ztratilo nebo získalo a čím: výchozí rychlost, silnější tah druhého, odlehčení, odřená rychlost, jak se jelo (části od 0,02 s);
- **Vůz:** kolik ztráty je vůz a čím (tah, přilnavost, brzdy; když 0,02 s nebo víc);

pak tip, **Vozy:** (v různých vozech, viz [Profily vozů](race-car-profiles.md#what-the-cars-decide-in-a-corner)) a rada k linii.

### Zatáčku po zatáčce {#corner-by-corner}

Tabulka (při dvou a více kolech), jeden řádek na úsek, pro třídu zaměřeného kola, když je tříd víc:

| Sloupec | Ukazuje |
|---|---|
| Zatáčka | `T3`, `T11-T12` |
| Nejrychlejší | kolo, které jí jelo nejrychleji (jeho vlastní čas od začátku do konce úseku) |
| o | jeho náskok před druhým nejrychlejším, s |
| linie | tvar a apex nejrychlejšího kola („V · pozdní“, „U/V · střed“); po najetí myší jeho nejtěsnější, vjezdový a výjezdový poloměr; „obojím“ u smíšeného celku |
| (zaměřené kolo) | o kolik zaostalo za nejrychlejším, nebo ✓, když bylo nejrychlejší |

Klik na řádek tam otevře nález zaměřeného kola (nebo seřadí vozy 40 m před úsekem). Pod tabulkou, když má každá zatáčka čas, je řádek: „Nejrychleji každou zatáčkou dohromady: <čas> (± na referenci / na nejlepším z třídy X)“. Jsou to nejlepší úseky plus nejrychlejší jízda k první zatáčce, pokud je to její vlastní úsek.

## Jak se to počítá {#how-it-is-worked-out}

Hlavní pravidlo: **zatáčka se hodnotí celá**, od brzdné zóny pro ni až po brzdnou zónu pro další. Kolo, které brzdí dřív, aby vůz dřív zatočil a dřív přidal plyn, dostane připsán výjezd, který tím koupilo. Neříká se mu, aby brzdilo později.

## Jedna osa vzdálenosti {#one-distance-axis}

Kola se porovnávají podle vzdálenosti, ne podle času. O sekundu později jsou dvě kola v jiných zatáčkách. Ani podle vlastního tachometru každého kola, protože užší linie ujede méně metrů. Projetá dráha **referenčního** kola je osa:

- Každý vzorek každého dalšího kola se **promítne** na referenční dráhu. Každý vzorek dostane `s`, jak daleko podél reference je, a `d`, jak daleko vlevo (kladné) nebo vpravo. Hledání běží dopředu od předchozí shody (8 úseků dráhy zpět až 40 dopředu), takže kolo, které se kříží samo se sebou, nikdy neskočí na jiný průsečík. První vzorek se hledá v první čtvrtině dráhy (na okruhu start a cíl splývají). Když nic není blíž než 30 m, vezme se nejbližší bod, který neleží za poslední shodou (po smyku nebo výjezdu ze tratě). `s` nikdy neklesne: vzorek, který se promítne za předchozí, se podrží.
- Každý kanál se **přepočítá** na jednu mřížku, **každé 2 m**, lineárně. Kanály se skoky (rychlostní stupeň, vlajky) se berou podle nejbližšího vzorku. Mimo vlastní rozsah kola jsou hodnoty prázdné.
- První a poslední vzorek kola se promítnou o kousek dovnitř od konců reference. Každé kolo se proto **dovede až 15 m** za své konce rychlostí, jakou mělo. Čas roste vzdáleností děleno rychlostí, zbytek se drží. Jeho delta na startovní čáře je tedy rozdíl časů kol.
- `delta` = čas kola v každém bodě mřížky minus čas reference: rozdíl. `lateral` = `d` na mřížce.

Kolik času jedno kolo ztratilo proti druhému mezi dvěma body mřížky, je rozdíl jejich delt: `rel(s)`. Všechno níže na tom stojí.

## Zatáčky {#corners}

Nalézají se na **referenci** (`findCorners`). Její rychlost je vyhlazena přes ±6 m a křivost (změna směru přes ±5 vzorků, vyhlazená přes ±10 m):

1. **Minima rychlosti s výraznostní.** Bod, který je nejnižší v rozmezí ±40 m, a jehož pokles od nejvyšší rychlosti na každé straně (před nižším minimem) je alespoň `max(2,5 m/s, 6 % rychlosti)`.
2. **Zlomy.** Lokální vrchol křivosti těsnější než poloměr **300 m**, bez minima rychlosti do 80 m. Zlom projetý na plný plyn je pořád zatáčka k jízdě.
3. **Fáze.** Od každého apexu zpět, dokud referenční kolo brzdí (> 0,1) nebo je pod plným plynem (< 0,95): vjezd. Dopředu, dokud je pod plným plynem: výjezd. Zlom projetý na plný plyn dostane ±30 m. Překrývající se zatáčky se drží odděleně, ale tak, aby pokryly kolo.
4. Očíslované T1, T2 … v pořadí kola. **Vlevo nebo vpravo** podle znaménka křivosti a toho, zda je svět zrcadlen (neznámé se bere jako zrcadlené).

**Okno zatáčky** (kde reference zatáčí): od nejtěsnějšího bodu v rozmezí ±40 m od apexu ven, dokud křivost zůstává nad šestinou svého maxima, plus 10 m na každou stranu. Jeho strana dává znaménko „dovnitř“.

## Úseky: od brzdné zóny k brzdné zóně {#segments-braking-zone-to-braking-zone}

Každá zatáčka vlastní cestu do poloviny k apexům na obou stranách. V ní:

- **Nejpomalejší bod každého kola** je skutečný propad rychlosti. Nic pomalejšího není do 6 m (3 body mřížky) na obě strany, a to i přes konce úseku. Výjezd předchozí zatáčky, který do ní ještě zrychluje, se tak nikdy nepočítá jako ona. Hledá se od 15 m před oknem zatáčky do 10 m za ním. Kolo, které tam nezpomalilo, se umístí do apexu.
- **Kde kolo začalo pro ni zpomalovat** (`entryOf`): zpět od jeho nejpomalejšího bodu přes brzdění nebo odlehčení, přes krátké záblesky plného plynu, dokud nemělo nohu dole (plyn ≥ 0,95, brzda ≤ 0,1) po **10 m**. Plyn přidaný znovu v posledních **30 m** před nejpomalejším bodem ještě patří k zatáčce. Na plný plyn celou cestu je to samotný nejpomalejší bod. Kolo bez kanálu plynu, nebo které od předchozí zatáčky nikdy nemělo nohu dole, začíná v nejrychlejším bodě mezi nimi.
- **Úsek začíná** u prvního ze všech kol, které pro ni začala zpomalovat (4 m dřív). Běží do začátku dalšího úseku, takže všechno brzdění každého kola je uvnitř něj a úseky pokrývají kolo.

**Celky.** Po sobě jdoucí zatáčky, mezi nimiž reference nikdy nejede na plný plyn (méně než **40 m** plného plynu), jsou jeden úsek, „T11-T12“, jetý jako jeden. Celek má nejvýš **tři** zatáčky. Klikatý úsek jetý bez jediného plného plynu začne nový celek. Celek, který zatáčí na obě strany, je *smíšený*: pro něj se nemeří žádný jediný tvar linie.

**Na okruhu** (reference končí do 50 m od místa, kde začala) běží poslední rovinka úseku přes startovní čáru až k první brzdné zóně. Jízda z čáry letmého kola se počítá k poslední zatáčce. Kolo, které začalo z klidu nebo ze startu závodu (viz [Start](#the-start)), tuto jízdu nechá odděleně.

### Kam vede zatáčka {#what-a-corner-leads-onto}

Měřeno na referenci: metry na plném plynu za zatáčkou (od jejího plného plynu do konce úseku, plus jízda přes čáru) a před ní (`after` předchozího úseku, nebo od startu).

| Typ | Pravidlo |
|---|---|
| **mezi dvěma rovinkami** (`both`) | 200 m a víc před **a** 120 m a víc za |
| **na rovinku** | 200 m a víc za, nebo 120 m a víc za a alespoň tolik co před |
| **za rovinkou** | 200 m a víc před |
| **spojka** | cokoli jiného |

## Co každé kolo dělalo v zatáčce {#what-each-lap-did-in-a-corner}

`cornerMetrics`, na každé kolo a úsek, na mřížce (krok 2 m). Pedály: brzda se počítá nad 0,1, plný plyn je 0,95 a výš.

| Měření | Pravidlo |
|---|---|
| **brzdný bod** | první brzda, pod kterou se plyn ubral (pod 0,5), nebo která trvala **15 m**. Špetka levé nohy při zapnutém výkonu není místo, kde začalo brzdění. Když jsou jen špetky, je to první špetka |
| **odlehčeno** | bez brzdění první bod, kde plyn klesl pod 0,8 |
| (bez pedálů) | bod, kde kolo začalo zpomalovat (výše) |
| **uvolnění brzdy** | poslední brzda do 30 m za nejpomalejším bodem |
| **rychlost u brzdného bodu**, **metry brzdění** | až do nejpomalejšího bodu |
| **špička brzdění**, **největší zpomalení** | přes brzdnou zónu (zrychlení nad 45 m/s² se ignorují) |
| **dobrzďování** | metry s brzdou > 0,05 a \|řízení\| > 0,1 |
| **prokluz při zablokování** | nejzápornější poměr prokluzu kola v zóně (je-li u kola prokluz) |
| **nejpomalejší bod**, **nejnižší rychlost** | jak výše |
| **plyn zapnut** | po uvolnění (nebo nejpomalejším bodě) první plyn > 0,15 bez brzdy |
| **plný plyn** | první bod poté, který se udrží na ≥ 0,95 po 10 m |
| **jízda bez pedálů** | metry od uvolnění do zapnutí plynu, kdy jsou brzda i plyn pod 0,05 |
| **poklesy plynu** | kolikrát plyn klesl o více než 0,25 pod svůj běžný vrchol mezi zapnutím plynu a plným plynem |
| **špička boční** | největší boční zrychlení od 20 m před uvolněním do pozdějšího z bodů plný plyn a 20 m za nejpomalejším bodem |
| **rychlostní stupeň v apexu** | v nejpomalejším bodě |
| **prokluz při roztočení** | největší poměr prokluzu hnaných kol mezi zapnutím plynu a plným plynem |
| **vyvážení** | úhel prokluzu přední minus zadní uprostřed (+ podsteer) |
| **rovinka na plný plyn** | podíl úseku po plném plynu (a jízdy přes čáru) při ≥ 0,95; nejdelší odlehčení na něm |
| **odřená rychlost** | největší ztráta rychlosti z vysokého bodu s plynem ≥ 0,9, bez brzdy, na zemi |
| **vjezdový drift** | největší úhel driftu od brzdného bodu do 5 m za nejpomalejším bodem, na zemi |
| **ruční brzda** | kde se zapnula (> 0,2), až 10 m za nejpomalejším bodem |
| **vzduch** | sekundy ve vzduchu nad úsekem a jeho nejdelší let |

## Kdo se s kterým kolem porovnává {#who-each-lap-is-compared-with}

- Kolo se porovnává s **nejrychlejším úplným kolem vlastní výkonnostní třídy** (referencí, ve třídě reference).
- To nejlepší kolo třídy (a reference) se porovnává úsek po úseku s **tím jiným kolem své třídy, které jím bylo nejrychlejší**. Nebo se vším, když je ve třídě samo.

Mapa času, mezery v seznamu kol, události ovládání vozu a tabulka zatáček se řídí stejným porovnáním.

## Časová bilance zatáčky {#the-time-account-of-a-corner}

`compareCorner`, pro kolo proti druhému přes úsek:

- **čistě** = `rel(konec) - rel(začátek)` (plus jízda přes čáru u letmého kola): to je verdikt. Blíž než **0,03 s** je **vyrovnané**.
- **Rozdělení**: kde uvnitř zatáčky vedoucí kolo zatočilo. V úseku od prvního brzdného bodu nebo nejpomalejšího bodu kteréhokoli z obou kol až po pozdější z jejich bodů plný plyn a nejpomalejší bod. Je to největší výkyv, který kolo pak vrátilo nebo získalo, pokud je přes **0,04 s**. Jinak pozdější ze dvou nejpomalejších bodů.
- **K apexu** = `rel(rozdělení) - rel(začátek)`; **za ním** = čistě minus to. Když jsou obě alespoň 0,04 s a mají opačná znaménka, kolo jednu část **vyměnilo** za druhou.
- **Výjezd** se znovu rozdělí tam, kde jsou obě kola na plném plynu: **výjezd** (rozdělení až po pozdější plný plyn) a **rovinka** (odtud do konce).
- **Rovinka** se dělí třemi způsoby:
  - *rychlost na výjezdu* (`byExit`) je měřená, ne modelovaná. Pomalejší vůz projde rychlostí, se kterou začal rychlejší vůz, kousek po rovince. Odtud je jeho vlastní stopa tím, co by udělal z té rychlosti, s vlastním převodem, odporem a sklonem. Posunuto zpět na ten bod (a dojeto koncovou rychlostí pro metry, které získá), je to jeho čas od rychlejšího startu. Rozdíl je cena rychlosti na výjezdu. Když pomalejší vůz tu rychlost nikdy nedosáhne (nebo jen v posledních 2 vzorcích), jeho vlastní zrychlení po úseku se vrátí jako výkon (`a·v` drženo). Nikdy přitom nejde víc, než ukazuje jeho obálka při této rychlosti (dvojnásobek měřeného zrychlení bez obálky).
  - *tah vozů* (`byPower`) je jen v různých vozech. Oba vozy jedou od stejné rychlosti přes stejné metry na plný plyn. Integruje se zrychlení na plný plyn, které každý ukázal při každé rychlosti.
  - *jak se jelo* (`driven`) je zbytek: odlehčení, odřená rychlost na plném plynu.

  Rychlost na výjezdu nikdy nevysvětlí víc, než stála rovinka, a nikdy s opačným znaménkem. Výjimkou je případ, kdy odlehčení nebo odřená rychlost nějakou část vzaly zpět. Kolo **odlehčilo** na rovince, když jeho podíl na plném plynu je pod 0,9 a zároveň pod podílem druhého minus 0,05. Odřená rychlost se počítá, když se ty dva liší o víc než 1 m/s. Nesouhlas pod 0,02 s ve znaménku se nastaví na 0.

Čistá hodnota každého úseku se sčítá na rozdíl časů kol. K apexu a za ním dají čistou hodnotu zatáčky. Testy obojí kontrolují.

### Podíl vozu {#the-cars-share}

Jen když jsou kola v **různých vozech** a kolo ztrácelo čas (`carShare`):

- **tah**: tah vozů po rovince (výše), až do ztráty;
- **přilnavost**: když bylo kolo na hranici svého vozu (boční zrychlení uprostřed alespoň **90 %** toho, co vůz v dané rychlosti drží) a druhý vůz drží o více než **5 %** víc. Z nižší nejnižší rychlosti, která není vysvětlena těsnějším poloměrem, podíl `½ ln(přilnavost_druhého / přilnavost_mého) / ln(v_druhého / v_mého)` ze zbývající ztráty;
- **brzdy**: když kolo brzdilo (neodlehčilo), druhý vůz brzdí o **5 %** silněji a průměrné zpomalení kola v zóně bylo alespoň **80 %** toho, co jeho vůz umí. Z `u` na `v` při `a1` proti `a2`, končí ve stejném bodě: `(1/a1 - 1/a2)(u - v)² / 2u`, až do toho, co zbývá.

Cena vozu je součet, nejvýš ztráta.

## Verdikt a nález {#the-verdict-and-the-finding}

`cornerFinding` napíše nejvýš jeden nález na kolo a zatáčku. Zkouší se v tomto pořadí:

| Případ | Nález | Výsledek |
|---|---|---|
| čistě do ±0,03 s, výměna, menší strana alespoň **0,1 s** | **stejně, dvě cesty**: kdo byl pomalý dovnitř a rychlý ven a kdo naopak. S rovinkou za ní (na rovinku nebo mezi dvěma) je to cesta pomalu dovnitř, rychle ven, na které se má stavět: udržet její brzký plyn a získat vjezd zpět brzděním silněji, ne později | stejně |
| čistě do ±0,03 s jinak | nic se neříká | – |
| zisk, výměna, ztráta k apexu | **pomalu dovnitř, rychle ven se vyplatilo**: nechat to, zde má výjezd větší hodnotu | zisk |
| zisk, výměna, zisk k apexu | **rychlejší na vjezdu**: vjezd je správný, dřívější plný plyn by udržel víc | zisk |
| zisk a druhé kolo má tady ztrátu | **rychlejší, kvůli tomu, co udělalo druhé**: jeho příčina a jeho rada „Pro druhé kolo: …“ | zisk |
| zisk jinak | **rychlejší na vjezdu / výjezdu**, podle toho, která polovina získala víc (brzdit později, víc rychlosti středem; nebo dřív na plný plyn, silnější tah) | zisk |
| ztráta a **náraz nebo nehoda** stála alespoň `max(0,05 s; 40 % ztráty)` | náraz je příběh zatáčky, ještě dřív než vozy | ztráta |
| ztráta a **podíl vozu** je 60 % nebo víc | **vůz**: jeho tah na rovince, přilnavost středem nebo brzdy, největší část. S částí řidiče (≥ 0,03 s) řečenou jako „Druhý X s: …“ | ztráta |
| ztráta a jedna nesdílená **chyba ovládání vozu** stála alespoň `max(0,05 s; 40 %)` | ta chyba (viz níže), s tím, jak se čas kolem ní přesunul | ztráta |
| ztráta a **delší let** stál alespoň `max(0,05 s; 40 %)` | let | ztráta |
| ztráta, výměna, zisk k apexu | **příliš rychle dovnitř, pomalu ven**: příčina výjezdu. Vzdát se vjezdu, aby zatočil a dřív byl rovně, s body brzdy a plného plynu druhého kola. Jeho kořen (`cause`, který počítají [statistiky](race-course-statistics.md)): brzdit později, když brzdilo o víc než pár metrů později než druhé. Jinak příčina výjezdu | ztráta |
| ztráta, výměna, ztráta k apexu | **dal víc pryč při vjezdu, než výjezd vzal zpět**: příčina vjezdu, která je zároveň jeho kořenem (`cause`). Výjezd si nechat, na vjezdu ztratit méně | ztráta |
| ztráta, odlehčeno na rovince, a jízda z části přesahuje polovinu ztráty | **na rovince se nejede na plný plyn**: podíl na plném plynu proti druhému, kde a jak dlouho bylo odlehčení | ztráta |
| ztráta, tah vozů přes 60 % ztráty a rovinka přes polovinu | **tah vozu na rovince** (s tahem obou vozů při 160 km/h) | ztráta |
| ztráta jinak | příčina té poloviny, která ztratila víc (k apexu alespoň tolik co za ním: vjezdová, jinak výjezdová). Pomalejší na výjezdu jen proto, že byl pomalejší středem (o více než 1 m/s): místo toho příčina středu | ztráta |

Nález u ztráty může také končit řádkem **Také:** (odřená rychlost na plném plynu, nebo odlehčení na rovince), když jízda na rovince stála víc než 0,04 s a to nebyla už příčina.

Nálezy se řadí. Nejdřív ztráty, nejdražší první, potom zisky a vyrovnané zatáčky.

### Příčiny na vjezdu {#causes-on-the-way-in}

`entryCause`, první, která platí. Rozdíly minimální rychlosti jsou v m/s. „5 m“ je práh, kdy se bod dřív nebo později počítá.

| # | Příčina (chyba) | Pravidlo |
|---|---|---|
| 1 | náraz nebo nehoda na vjezdu | nesdílený náraz začínající do 10 m za nejpomalejším bodem |
| 2 | **téměř zastavil** (incident) | nejnižší rychlost pod **60 %** toho, co přilnavost tohoto vozu dovolí tam, kudy druhé kolo prošlo (`v_druhého · √(přilnavost_mého / přilnavost_druhého)`, když druhý vůz drží víc, jinak rychlost druhého), a druhé kolo nad 8 m/s. Smyk, kontakt nebo minutá zatáčka |
| 3 | chyba ovládání vozu na vjezdu | nesdílené zablokování, přetlak, roztočení nebo smyk bez plynu, začínající do 10 m za nejpomalejším bodem, stálo ≥ 0,02 s |
| 4 | delší let před nejpomalejším bodem | viz [rallye](#rally-rotation-and-flights) |
| 5 | **odlehčeno**, kde druhé zůstalo na plném plynu nebo odlehčilo o 5 m a víc později | toto kolo jen odlehčilo |
| 6 | **brzdilo tam, kde druhé jen odlehčilo** nebo zůstalo na plném plynu | a bylo středem pomalejší o více než 0,5 m/s |
| 7 | **brzdilo jemně** | brzdilo (neodlehčilo) a mělo prostor brzdit silněji. S daty pneumatik: jeho prokluz při zablokování pod **60 %** prokluzu, kde brzdy tohoto vozu dávají nejlepší výsledek. Bez nich: největší zpomalení pod **85 %** toho, co ukazuje při této rychlosti. Pedál pod 0,95 a největší zpomalení druhého kola o více než **15 %** vyšší |
| 8 | **brzdilo brzy**, nebo **brzdy vozu** | brzdilo o více než 5 m dřív než druhé. U jiného vozu, jehož brzdy jsou o víc než 5 % silnější, a s nejvýš 10 m rezervy oproti vzdálenosti, kterou tento vůz potřebuje při vlastním zpomalení: brzdy vozu. Jinak brzdilo brzy, s radou „Brzdit později, asi N m“ (u jiného vozu v metrech navíc oproti tomu, co potřebuje) |
| 9 | **jelo bez pedálů** | více než 10 m bez jakéhokoli pedálu a o 5 m víc než druhé |
| 10 | **pomalejší středem** | o více než 0,5 m/s pomalejší v nejpomalejším bodě. Rozděleno podle `v² = a·R` (níže) |
| 11 | **přijelo pomaleji** | o více než 1 m/s pomaleji u brzdného bodu, nebrzdilo brzy. Rozhodnuto dříve: předchozí zatáčkou a tahem vozu, nebo letem v předchozí zatáčce, který byl o 0,2 s delší. U vozu, když se vozy liší |
| 12 | pomaleji k apexu | jinak: uvolnit brzdu plynuleji a přenést víc rychlosti do středu |

**Pomalejší středem** (`middleSplit`): poloměr každého kola v jeho nejpomalejším bodě se měří z jeho vlastní dráhy (±8 m). Boční zrychlení se počítá jako `v²/R` a

`ln(v_druhého / v_mého) = ½ ln(a_druhého / a_mého) + ½ ln(R_druhého / R_mého)`.

- Poloměr vysvětluje **polovinu nebo víc**: **příliš těsná linie**. „Využij víc silnice“, s oběma poloměry a podílem.
- Na hranici vozu (smyk přes 10° driftu na asfaltu, 20° na sypkém, nebo boční zrychlení alespoň 90 % toho, co vůz při této rychlosti drží) a druhý vůz drží o více než 5 % víc: **přilnavost vozu**. Místo toho chránit výjezd.
- Smykem přes ni (drift přes 10° / 20°) a druhé kolo ne (jeho vjezdový drift alespoň o 4° menší): **bokem**, za svou přilnavostí, ne pod ní. Přijet o něco pomaleji. Říká se jako vozu, když tento vůz chytí zadek alespoň o jeden víc za kolo než druhý.
- U jiného vozu, který drží méně než **96 %** přilnavosti druhého, a kolo drželo do 1 m/s od `v_druhého · √(přilnavost_mého / přilnavost_druhého)`: **přilnavost vozu**. „Brzdění později to nedohoní.“
- Jinak **přilnavost navíc**: boční zrychlení proti druhému na podobném poloměru a to, co tento vůz drží. Nést víc rychlosti do apexu. Kde zadek tohoto vozu povolí dřív, než se přilnavost vyčerpá (jeho smyky začínají pod 85 % přilnavosti a kolo bylo na 80 % této hodnoty), zbytek najít po malých krocích.

### Příčiny na výjezdu {#causes-on-the-way-out}

`exitCause`, první, která platí:

| # | Příčina (chyba) | Pravidlo |
|---|---|---|
| 1 | chyba ovládání vozu na výjezdu | nesdílené protáčení, roztočení, smyk nebo náraz, který končí ve stejném místě nebo až po 10 m před nejpomalejším bodem |
| 2 | **odřená rychlost** | o více než 1 m/s víc rychlosti ztraceno na plném plynu než u druhého. Přes **7 m/s (25 km/h)** „spíš kontakt nebo roztočení než smyk“ |
| 3 | **zatočil vůz špatně** (sypký povrch) | viz [rallye](#rally-rotation-and-flights) |
| 4 | **na výkon později** | zapnutí plynu o více než 5 m později, počítáno i od vlastního nejpomalejšího bodu každého kola. Kolo s pozdějším nejpomalejším bodem se nekárá za pozdější plyn |
| 5 | **váhal s plynem** | víc poklesů plynu než druhé |
| 6 | **jelo široko a čekalo** | o více než 1,5 m vně druhého tam, kde byla obě na plném plynu, a plný plyn o více než 5 m později od vlastního nejpomalejšího bodu |
| 7 | **plný plyn později** | plný plyn o více než 5 m později, také od vlastního nejpomalejšího bodu. S akcelerací vozu v té části |
| 8 | **jízda vozu** | u jiného vozu, který táhne pod 95 % druhého při této rychlosti, a tah vysvětloval část rovinky |
| 9 | **pomaleji z zatáčky** | jinak: pozdější apex, takže vůz je rovně dřív |

Když byla obě kola v různých rychlostních stupních v nejpomalejším bodě, končí rada větou „Rychlostní stupeň N v apexu; druhé použilo M.“

### Chyby ovládání vozu a nárazy {#car-control-faults-and-impacts}

Chyba z [Události ovládání vozu](race-control-events.md) jako příčina: zablokování je příčina *brzdění*, protáčení nebo smyk na plynu je příčina *výjezdu*, ostatní *vjezdu*. Náraz po nejpomalejším bodě je *výjezd*, před ním *vjezd*. Rada je z události samé, pak „Stálo to asi X s do 40 m za ní“ (nebo „do chvíle, kdy vůz získal rychlost zpět“ u nárazu). Zablokování s brzdným bodem o víc než 5 m dřív, než druhé, přidá, že kolo brzdilo brzy také. S kolem, které se točí, by to nebylo potřeba.

### Rallye: natočení a lety {#rally-rotation-and-flights}

Na **sypkém povrchu**, s úhly driftu u obou kol, a když je toto kolo na výkonu (nebo na plný plyn) o více než 5 m později:

- **Zatočil vůz méně**: druhé mělo vůz natočený o **12°** nebo víc do svého nejpomalejšího bodu a o alespoň **8°** víc než toto kolo. Rada: odlehčit nebo lehce přibrzdit levou nohou, když se vůz natáčí, s bodem ruční brzdy druhého kola, když ji použilo jen ono. Nebo ruční brzdou v zatáčce pomalejší než 15 m/s (54 km/h).
- **Zatočil ho příliš**: toto kolo ho mělo natočený o 12° nebo víc a alespoň o **12°** víc než druhé. Musel se narovnat, než mohl výkon dolů.

**Delší let**: ve vzduchu o 0,2 s nebo víc delší než druhé, stál alespoň 0,03 s od 10 m před odrazem až 40 m za dopadem (nebo do konce úseku). Před nejpomalejším bodem je to vjezdová příčina. Stane se příběhem zatáčky, když vysvětluje 40 % a víc. Rada: držet plyn při odrazu, hřbet vzít o něco pomaleji nebo s lehkým dotekem brzdy.

### Start {#the-start}

Před první zatáčkou, na sprintu, nebo když kterékoli kolo začalo z klidu (pod 5 m/s tam, kde jsou obě poprvé na ose), nebo na startu závodu (pod 60 % rychlosti druhého), je jízda k prvnímu brzdnému bodu vlastním nálezem (zatáčka 0), když se liší o víc než 0,03 s: *Rozjezd*, *Start závodu* nebo *K první zatáčce*. Ztráta tam se přičte situaci (*okolnosti*), když jedno kolo začalo na startu závodu a druhé v rychlosti. Přičte se vozu, když se kola liší vozem, a jinak jezdci. Rady: u jiného vozu z klidu „většinou vůz“. Rozjezd z klidu ve stejném voze: rozjet s menším protáčením a řadit na vrcholu výkonu. Start závodu: porovnat s jiným prvním kolem. Letmý start: lepší výjezd z poslední zatáčky se přenese přes čáru.

## Projetá stopa {#the-driven-line}

`lineMetrics`, pro každé kolo a úsek (ne pro smíšené celky), jen z pozic (vyhlazeno ±2 vzorky) přes okno zatáčky:

| Měření | Pravidlo |
|---|---|
| křivost | změna směru přes ±8 m vlastní dráhy kola |
| **nejtěsnější poloměr** | 1 / špičková křivost |
| **zatočení** / **konec křivky** | kde křivost poprvé / naposled přesáhne pětinu své špičky |
| **střed** | kde kolo otočilo polovinu své změny směru |
| poloměr dovnitř / ven | metry ujeté přes polovinu změny směru, před / za středem |
| **tvar** | nejtěsnější poloměr ku průměrnému poloměru při zatáčení: pod **0,55** je **V**, nad **0,75** je **U**, mezi tím „U/V“ |
| **apex** | poloměr ven ku poloměru dovnitř: nad **1,25** pozdní, pod **0,8** brzký, jinak střed |
| **rychlostní apex** | nejpomalejší bod více než **15 m** před středem: pomalu dovnitř, rychle ven. Více než 15 m za ním: stále zpomaluje za středem |

Proti druhému kolu: jak daleko uvnitř (+) nebo vně jelo při zatáčení, nejtěsnější částí a tam, kde byla obě rovná (řečeno od 1 m), a kde se každé zatáčelo (řečeno od 8 m).

### Která linie sedí tomuto vozu tady {#which-line-suits-this-car-here}

`lineFor`, z toho, kam zatáčka vede, a z povahy vozu v této zatáčce:

- **výkon k přilnavosti** = zrychlení vozu na plném plynu při rychlosti na výjezdu, děleno jeho přilnavostí při nejnižší rychlosti (z obálky). **Point and shoot** od **0,45** výš, **momentum** od **0,25** níž.
- **přítlak**: přilnavost při 151–252 km/h ku přilnavosti při 54–108 km/h **1,15** nebo víc, u zatáčky projeté na **144 km/h** (40 m/s) nebo rychleji. Pak je to zatáčka typu momentum bez ohledu na výkon. Na sypkém povrchu se nehodnotí.

| Typ zatáčky | Vůz | Linie |
|---|---|---|
| za rovinkou | point and shoot / ostatní | V / U, apex ve středu: „brzdná zóna je výhra“ |
| mezi dvěma rovinkami | momentum / ostatní | U / V, pozdní apex |
| spojka | momentum / ostatní | U / V, apex ve středu: „jeď ji pro výjezd další“ |
| na rovinku | momentum (nebo rychlá zatáčka s přítlakem) | široké kulaté U, mírně pozdní apex |
| na rovinku | point and shoot | V: brzdit rovně, zatočit pozdě, natočit se v krátkém těsném středu, rovně brzy |
| na rovinku | mezi tím | U s pozdním apexem: pomalu dovnitř, rychle ven |

Kde záleží na výjezdu (na rovinku, mezi dvěma), přidá pohon jednu větu. **FWD**: natočit brzdou, výkon přidávat až ve chvíli, kdy se kolo odvíjí. **RWD** s výkonem k přilnavosti 0,35 nebo víc: narovnat před plným plynem. **AWD**: může přidávat výkon i při natáčení. Na sypkém povrchu přidá každá linie: natočit vůz při vjezdu.

Věta pak říká, co kolo jelo, a zda to sedí. *Nejpomalejší pozdě svazuje výjezd* nebo *brzký apex svazuje výjezd*, kde se chtěl pozdní apex a kolo nebylo apexované pozdě ani nebylo nejpomalejší brzy. *Zaobleněnější, než tento vůz chce*, kde se chtělo V. *Hranatější, než tento vůz chce*, kde se chtělo U. Jinak *sedí*.

## Pro vývojáře {#for-developers}

Kód: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Úvahy a zdroje: [metoda](race-analytics.md).
