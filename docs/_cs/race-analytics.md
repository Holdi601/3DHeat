---
title: "Analytika závodů: metoda"
parent: "Analýza závodu"
nav_order: 58
lang: "cs"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analytika závodů: metoda

Stručně:

- Kola se porovnávají **podle vzdálenosti**, ne podle času, takže stejné místo na trati se srovná.
- Každá zatáčka se hodnotí **celá**, od jedné brzdné zóny k další.
- Ztracený čas se **rozdělí** podle toho, kde vznikl (brzdění, vjezd, výjezd, rovinka), a podle toho, kolik z něj vůz vysvětluje.
- Příčina se **vysvětlí slovy** a doplní se radou.
- Pokud chcete analýzu jen používat a nechcete číst, jak funguje, podívejte se na [Analýza závodu](race-analysis.md).

Toto je metoda za záložkou **Analýza závodu**: co měří, jak rozhoduje, kde čas odešel, a jak z toho udělá radu. Je to specifikace, kterou se řídí kód analýzy (`src/race/`), takže každé pravidlo zde má protějšek v kódu a test, který ho hlídá.

## Co dělají profesionální nástroje {#what-the-professional-tools-do}

Zavedené nástroje mají stejné jádro. Liší se hlavně tím, jak daleko jdou k *příčinám*:

- **Vše se porovnává podle vzdálenosti, ne podle času.** Dvě kola se přepočítají na jednu osu vzdálenosti. Rozdíl uplynulého času ve stejné vzdálenosti je *delta* (MoTeC tomu říká time variance, jiné nástroje time slip nebo delta trace). Její sklon ukazuje, kde se čas právě ztrácí: mírný sklon znamená zrychlení, odpor vzduchu nebo trvalou přilnavost; strmý sklon rozdíl v brzdění nebo v plynu; vlna nahoru a dolů střídání mezi rychlostí při vjezdu a rychlostí při výjezdu.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [analýza časů úseků](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Každá zatáčka se dělí na fáze**: brzdění, vjezd, střed, výjezd. Brzdný bod, maximální brzdění a uvolnění, nejnižší rychlost a kde se dosáhne, rychlostní stupeň, přidání plynu, návrat na plný plyn, rychlost na výjezdu.
  ([Driver61: šest fází](https://driver61.com/uni/corner-phases/),
  [iRacing: průvodce analýzou kola](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-úseky u každé zatáčky a teoretické nejlepší kolo** složené z nejrychlejších částí.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Projetá stopa se také porovnává**, ale nikdy sama. „Čára na obrázku nic neznamená, dokud neznáte faktory, které k ní přispívají.“ Čte se společně s průběhem rychlosti a deltou.
  ([Track Titan: jak analyzovat telemetrii](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: závodní stopy](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Příčina, ne příznak.** Je ztráta na rovince opravdu plynem, nebo špatný vjezd donutil přidat plyn pozdě? Chyby se řadí podle ztráty na čase kola a vysvětlují se prostým jazykem.
  ([Track Titan: koučovací postupy](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Co se pokazilo v první verzi a proč na tom záleží {#what-went-wrong-in-the-first-version-and-why-it-matters}

První verze účtovala každou *fázi* zvlášť a dívala se jen na ztráty. Kolo, které brzdilo dřív, ztratilo čas ve fázi brzdění a dostalo radu brzdit později. Přitom díky dřívějšímu brzdění vůz zatočil dřív, dřív přidal plyn, z zatáčky vyjel rychleji a na rovince to všechno dohnal. V jednom testu řekla kolu, které tak jelo, aby „brzdilo mnohem později“. Druhé kolo brzdilo opravdu později, ale minulo apex, vyjelo široko a ztratilo přesně to, co předtím získalo. Časová data říkala, že obě cesty jsou vyrovnané. Rada tvrdila opak.

Oprava je pravidlo, na kterém se shodují všechny zdroje výše: **zatáčka se hodnotí celá**, od brzdné zóny pro ni až po brzdnou zónu pro další. Důvod: „někdy obětování několika milisekund v zatáčce může zlepšit celkový čas kola tím, že umožní rychlejší úseky potom“ ([Ovlivnění stylu jízdy umělého závodního řidiče](https://arxiv.org/abs/2504.12744)).

## Závodnické znalosti, které pravidla zakódovávají {#racing-knowledge-the-rules-encode}

**Rychlost na výjezdu je důležitější než rychlost na vjezdu**, a tím víc, čím delší je následující rovinka. „Čas strávený na rovinkách převažuje nad časem v zatáčkách.“ Ztráta rychlosti na výjezdu se přenese do dalšího brzdného bodu. Nejrychlejší průjezd zatáčkou a rovinkou je často jet zatáčku pomaleji, aby plyn přišel dřív. *Pomalu dovnitř, rychle ven.*
([Race & Track Driving: posloupnost pro zlepšení času kola](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: určování priority zatáček](https://driver61.com/uni/prioritising-corners/))
Plánovač nejkratšího času, který je odměňován také za rychlost na výjezdu, posune apexy později a dostane *rychlejší* kolo. Odměna, která obě věci vyrovnává, má hodnotu `L / v²` na jednotku rychlosti na výjezdu pro rovinku délky `L` při rychlosti `v`. Čas, který rozdíl rychlosti stojí na rovince, roste s její délkou a klesá s druhou mocninou rychlosti
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Zatáčky podle toho, kam vedou.** Zatáčka na rovinku: maximalizovat rychlost na výjezdu, pozdní apex, co nejdřív zpátky na plyn. Zatáčka na konci rovinky: maximalizovat rychlost, se kterou se do ní vjíždí, brzdit co nejpozději, dřívější apex je přijatelný. Zatáčka mezi dvěma zatáčkami: kompromis kvůli té, na které záleží potom. Zatáčka, která může být obojí, se bere jako zatáčka na rovinku. Rychlejší zatáčky váží víc: při vysoké rychlosti vůz zrychluje slabě a ztracený km/h se nedoběhne.
([Allen Berg: tři typy zatáček](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: určování priority zatáček](https://driver61.com/uni/prioritising-corners/),
[Driver61: různé zatáčky, různé techniky](https://driver61.com/uni/different-corner-technique/))

**Třecí kruh.** Pneumatika má jeden rozpočet přilnavosti. Utrácí se za brzdění, projíždění zatáček a zrychlování v libovolném poměru. Celkové zrychlení je `sqrt(lat² + long²)`. Dobrzďování (trail braking) se drží na jeho okraji: brzda se uvolňuje, jak roste natáčení volantu a boční zatížení.
([třecí kruh](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Jízda bez pedálů** (coasting), tedy žádný pedál sešlápnutý, je nejpomalejší způsob, jak ztratit rychlost. Je to také měřený klíčový ukazatel výkonu.
([Racecar Engineering / OptimumG: koeficient jízdy bez pedálů](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Prokluz.** Podélná síla dosáhne maxima při poměru prokluzu asi 10–20 %, pak klesá. Za tímto bodem se kolo při brzdění zablokuje nebo se při plynu protáčí. Forza uvádí prokluz normalizovaný: 0 znamená plnou přilnavost, velikost nad 1 znamená ztrátu přilnavosti.
([podélný prokluz](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Podsteer a přesteer.** Větší úhel prokluzu vpředu než vzadu je podsteer. Větší vzadu než vpředu je přesteer. Bez úhlů prokluzu: vůz se otáčí méně, než volant žádá. Volant je pak nad Ackermannovým úhlem `L/R`, který vůz potřebuje při nízké rychlosti.
([podsteer, přehled](https://www.sciencedirect.com/topics/engineering/understeer),
[Podsteer a přesteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometrie linie {#the-geometry-of-a-line}

Rychlost, kterou vůz udrží na poloměru `R`, je `v = sqrt(a R)`. Hodnota `a` je boční zrychlení, které dávají pneumatiky (plus to, co přidá přítlak, a ten roste s `v²`). **Rychlost tedy roste s odmocninou poloměru.** Linie středem na poloměru o 20 % větším je tam asi o 10 % rychlejší.
([maximální rychlost v zatáčce](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: zatáčení](https://www.formula1-dictionary.net/cornering_tech.html))

**Geometrická linie** je největší oblouk zatáčkou: od vnější hrany, dotýká se vnitřní strany v apexu a vrací se k vnější hraně. Pro zatáčku, která se otáčí o `θ` na silnici široké `w` (mínus šířka vozu), má oblouk, který se dotýká obou vnějších hran a vnitřního rohu, poloměr `R = w / (1 - cos(θ/2))` (plus vlastní poloměr vnitřní hrany). U pravého úhlu je to asi `3,4 w`, u serpentiny `w`. Proto je využití šířky nejdůležitější u středních zatáček a nejméně u serpentin.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Pozdní apex** se zatočí později a hlouběji, zpočátku na těsnějším poloměru, a na výjezdu se poloměr rozevírá. Střed projede pomaleji, ale dřív se narovná a dřív je plyn plný. „Trochu nižší nejnižší rychlost, ale silnější profil zrychlení na výjezdu.“ **Brzký apex** je opak: vjezd je rychlejší, ale poloměr se na výjezdu utahuje a drží plyn zpátky. Je to z velké části chyba. Výjimkou je velmi nízká přilnavost, kdy rychlost ztracená na vjezdu se už na výjezdu nedoběhne.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Slovník telemetrie závodů](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[matematika závodní linie](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**Linie „V“ a „U“.** U je klasická kulatá linie: nejširší poloměr a nejmenší změna natočení volantu. V se zatáčí dřív, jede hlouběji, rychle otočí vůz ve středu a připraví výjezd pro přímější jízdu ven. Brzdění zůstává rovné (takže může být pozdější). Nejnižší rychlost je nižší, ale dosáhne se později. Plný plyn přijde mnohem dřív.
([Track Titan: linie V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Křivost proti vzdálenosti.** Nejrychlejší linie je kompromis mezi nejkratší cestou a nejmenší křivostí. Na šířce závodní trati je křivost důležitější. Linie s minimální křivostí se blíží linii s minimálním časem všude tam, kde je vůz na hranici svých možností. Odchyluje se od ní tam, kde by vůz ještě mohl zrychlovat.
([Globální trajektorie s minimálním časem](https://www.nature.com/articles/s41598-025-21211-2),
[TUM: globální optimalizace závodní trajektorie](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Zatáčky za sebou**, dvojitý apex nebo šikana, jsou jeden problém. Výjezdová linie jedné je vjezdová linie další. Počítají se pozpátku od té, která vede na rovinku.
([Driver61: různé zatáčky, různé techniky](https://driver61.com/uni/different-corner-technique/))

## Který vůz potřebuje jakou linii {#which-line-suits-which-car}

Rozhoduje **výkon proti přilnavosti** při rychlostech dané zatáčky. „Momentum je přilnavost proti výkonu, věc poměru.“
([Ross Bentley: momentové vozy](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum nad výkonem](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Vůz v této zatáčce | Linie | Proč |
|---|---|---|
| Silně zrychluje na svou přilnavost („point and shoot“) | V: brzdit rovně a pozdě, krátce a těsně se otočit ve středu, na výjezdu se narovnat a brzy jít na plný plyn | čas se získává plným plynem, ne nejnižší rychlostí |
| Slabě zrychluje na svou přilnavost („momentum“) | široké U, mírně pozdní apex, udržet nejnižší rychlost vysoko | nedokáže dohnat rychlost, kterou ztratí |
| Mezi tím | pomalu dovnitř, rychle ven: U s pozdním apexem | klasický kompromis |
| Rychlá zatáčka, o to víc s přítlakem | U, blízko geometrické linie | zrychlení je při vysoké rychlosti slabé; přilnavost z přítlaku roste s `v²`, takže rychlost ve středu se vyplatí dvakrát |
| Velmi nízká přilnavost (mokro, sníh) | dřívější apex | rychlost ztracená na vjezdu se nedá dohnat na výjezdu |
| Výkon daleko nad přilnavostí | linie záleží méně | na výjezdu omezuje trakce, ne linie |

„Čím rychlejší zatáčka, tím blíž geometrické linii; čím pomalejší, tím víc ji měníte pozdním apexem.“
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[matematika závodní linie](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: linie V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: přilnavost](https://driver61.com/uni/grip/))

Převodovka mění způsob, jak se linie jede, víc než samotná linie. Vůz s pohonem předních kol se natáčí brzdou (dobrzďování) a dostane výkon až tehdy, když se kolo odvíjí, jinak vyjede široko. Silný vůz se zadním pohonem musí být narovnaný dřív, než přidá plný plyn, jinak zadek uteče. Pohon všech kol může přidávat výkon i při natáčení, takže plyn přidá dřív.
([technika FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD v zatáčkách](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Prohlížeč měří poměr výkonu k přilnavosti u každé zatáčky z vlastní jízdy: zrychlení na plném plynu při rychlosti na výjezdu děleno boční přilnavostí při nejnižší rychlosti. Při 0,45 a víc to nazve „point and shoot“, při 0,25 a méně „momentum“. Vůz, jehož přilnavost při 150–250 km/h je o více než 15 % vyšší než při 55–110 km/h, má v činnosti přítlak.

## Metoda {#the-method}

Čísla níže jsou úvaha. Prahové hodnoty, které kód používá, jsou uvedeny na jedné stránce pro každou oblast. Když se číslo tady liší, rozhodují tyto stránky: [Analýza zatáčku po zatáčce](race-corner-analysis.md), [Události ovládání vozu](race-control-events.md), [Profily vozů a srovnání](race-car-profiles.md) a [Statistiky tratě](race-course-statistics.md).

### 1. Jedna osa vzdálenosti {#one-distance-axis}

Nejrychlejší kolo je referenční, pokud uživatel nevybere jiné. Jeho projetá dráha je osa. Každý vzorek každého dalšího kola se promítne na tuto osu, takže každý vzorek dostane vzdálenost `s` podél reference a boční odchylku `d` se znaménkem. Promítání hledá jen dopředu od předchozí shody, takže kolo, které se kříží samo se sebou, nikdy neskočí na špatnou stranu mostu. Kola se pak přepočítají na jednu mřížku po 2 m pro každý kanál. Každé kolo se na posledních několika metrech vede dál rychlostí, jakou mělo, takže jeho delta na startovní čáře je rozdíl časů kol.

### 2. Zatáčky a podíl každé zatáčky na kole {#corners-and-each-corners-share-of-the-lap}

Jak se najdou zatáčky, úseky a skupiny zatáček: [Analýza zatáčku po zatáčce](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Časová bilance zatáčky {#the-time-account-of-a-corner}

Čistý čas, rozdělení, rychlost na výjezdu a tah vozů: [Analýza zatáčku po zatáčce](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Verdikt a příčina {#the-verdict-and-the-cause}

Vzory verdiktů a příčiny při vjezdu i na výjezdu: [Analýza zatáčku po zatáčce](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Vůz proti jezdci {#the-car-against-the-driver}

Když jsou kola v různých vozech, odečte se ztráta, kterou vysvětluje vůz. Dělá se to po částech:

- **tah**: vozy od stejné rychlosti na rovince, jak je uvedeno výše;
- **přilnavost**: z nižší nejnižší rychlosti, která není vysvětlena těsnějším poloměrem, podíl `½ ln(přilnavost_druhého / přilnavost_mého) / ln(v_druhého / v_mého)`, pokud kolo bylo na hranici svého vozu (90 % toho, co vůz v dané rychlosti ukázal);
- **brzdy**: z `u` na `v` při zpomalení `a1` proti `a2`, končí ve stejném bodě, stojí `(1/a1 - 1/a2)(u - v)² / 2u`. Jen když kolo brzdilo zhruba tak silně, jak vůz v zóně dokáže v průměru, ne jen ve špičce.

Co vůz umí, se bere ze všech jeho načtených kol: boční přilnavost, brzdění a zrychlení na plný plyn v pásmech rychlosti po 5 m/s (95., 95. a 90. percentil). Přilnavost je to, co vůz **udržel půl sekundy**, tedy boční zrychlení zprůměrované přes 0,5 s. Nejde o to, čeho se dotkl jeden vzorek. Obrubník, zadek, který se vrátí zpět, nebo chycení smyku všechny dají na chvíli špičku. Vůz, který to dělá často, pak vypadal přilnavější, než je. (Ověřeno na zaznamenaných kolech dvou různých vozů: měření po vzorcích je dalo blízko u sebe; držená půl sekundy je rozdělila tak, jak to ukazují jejich časy kol.)
Brzdění a tah vezmou každý vzorek jako medián z něj samotného a jeho sousedů.
Vynechají se vzduch, ustálení po dopadu a každý náraz (oddíl 6), dokud se vůz nevzpamatuje.

**Jaký vůz který je** (`profile.ts`): ze stejných kol:

- **udržená přilnavost**: 95. percentil té půlsekundové boční akcelerace;
- **tah** na plný plyn do 50 km/h, 50–120, 120–200 a nad 200, a nejvyšší tah, jaký ukázal;
- **brzdění** od 60 do 160 km/h;
- **nejvyšší rychlost**: místo, kde přestal přibírat na plném plynu po dobu jedné sekundy na rovince. Jede se rovně, ne dlouhá zatáčka projetá naplno, kde vůz ztrácí rychlost při jakémkoli výkonu. Kde žádná rovinka nebyla dost dlouhá, říká, jak daleko byl, to, co ještě tahal při nejvyšší rychlosti. Nic víc se nedohaduje, než ukazují kola. Přizpůsobení výkonu podle rychlosti proti odporu dalo silničnímu autu o 100 km/h víc, než byla jeho skutečná nejvyšší rychlost, protože převodovka a omezovač ukončí tah vozu mnohem dřív, než to udělá odpor;
- **ztráta zadku**: kolikrát za kolo smykl přes 10° driftu (na sypkém povrchu přes 20°) s kolem natočeným proti zatáčce, tedy chycen protizáklonem. Kolikrát z těchto smyků začal na plynu a při jakém podílu přilnavosti začal. Vůz, který záměrně jede trochu bokem, nic neztrácí. Vůz, který je potřeba chytat, ano. Počítá se stejně pro každý vůz, takže lze porovnat dva vozy;
- **vyvážení**, kde kola nesou úhly prokluzu: přední proti zadní na hranici.

**Srovnání vozů** postaví vozy vedle sebe. Je tu tabulka a u každého vozu věta o tom, čím je oproti druhému („X zrychluje lépe, ale nedokáže zatáčet tak tvrdě, potřebuje delší brzdnou dráhu a snadněji ztrácí zadek“). Dále každý jasný rozdíl (4 % přilnavosti, 5 % tahu nebo brzdění, 4 km/h nejvyšší rychlosti, zadek chycený alespoň o jeden víc za kolo a o polovinu častěji) a jak jet každý z nich. Při jednom voze říká, čím ten vůz je.

**U každé zatáčky**, když jsou kola v různých vozech, nález říká, co z ní rozhodují vozy, a jak z tohoto vozu vytěžit co nejvíc:

- **středem**: na lince druhého vozu dovolí přilnavost tohoto vozu `v_druhého · √(přilnavost_mého / přilnavost_druhého)`. Pokud kolo tuto rychlost drželo, rozdíl je ve voze a žádný brzdný bod ho nezmění. To se řekne a zatáčka se přičte autu, ne jezdci. Pokud držela méně, zbytek je k získání a říká se, kolik. Potom se říká, kde jinde jde čas získat: na rovinku, nebo ve voze, který táhne silněji, za apexem. Brzdit rovně, zatočit později, včas nasměrovat na výjezd. Jinak nejširší poloměr, který silnice dovolí, protože větší poloměr je jediný způsob, jak dosáhnout vyšší rychlosti bez větší přilnavosti;
- **zadek, který tu povolil**, u vozu, který ho ztrácí snadněji než druhý: co dělat v tomto voze. Plyn přidávat, jak se kolo odvíjí, nebo brzdu pustit jemně bez odlehčení uprostřed zatáčky, podle toho, jak jeho smyky začínají;
- **rovinka po ní**: co vzal silnější tah druhého vozu od stejné rychlosti a kde tomuto vozu na ní došel tah;
- **dřívější brzdný bod** u vozu, který brzdí méně silně.

Kolo, které uprostřed zatáčky smyklo (přes 10° driftu na asfaltu), bylo za svou přilnavostí, ne pod ní. Nikdy se mu neřekne, že tam měl přilnavost navíc. A kde zadek vozu v tomto kole povolil při menším bočním zrychlení, než zatáčka žádala, „přilnavost navíc“ říká, aby ji hledal po malých krocích.

### 6. Ovládání vozu: zablokování, protáčení, smyky a podsteer, nárazy a nehody {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Každé kolo se také čte podle toho, jak se s vozem zacházelo. Kde se kolo zablokovalo, kde se hnací kola protočila, kde zadek vyskočil, kde přední vyjel široko. Tyto chyby čas sám nepojmenuje. Tři věci zajišťují, že to platí napříč hrami a povrchy.

**Kde přilnavost končí, se měří z vlastní jízdy vozu.** Inženýři nastaví práh zablokování pro každý vůz při prokluzu, který dal největší zpomalení (kanály MoTeC v brzdové sérii OptimumG používají u jednoho vozu -0,07). Neberou tabulkovou hodnotu, a ty se stejně neshodují. Síla dosáhne maxima při prokluzu 5–20 % na asfaltu podle pneumatiky a modelu, při 6 % nebo při 20–60 % na sněhu podle zdroje, a žádný zdroj ji neuvádí pro štěrk. Hry škálují prokluz ještě jinak. U Forzy je „normalizovaný“, takže za hodnotou 1 se přilnavost ztrácí. Brzdy vozu ovšem mohou dát nejlepší výsledek hluboko pod nebo hluboko nad 1 a běžné brzdné zóny mohou jít přes 1. Proto se u každého vozu, přes všechna jeho načtená kola, síla, kterou vytvořil, rozdělí do pásem podle prokluzu, při kterém jel. Zpomalení proti poměru prokluzu kol při brzdění v přímce. Zrychlení (jako podíl toho, co vůz v dané rychlosti vytvoří) proti prokluzu hnacích kol. Přilnavost v zatáčce (jako podíl přilnavosti vozu v dané rychlosti) proti úhlu prokluzu každé nápravy. Limit je prokluz za nejlepším bodem, kde síla klesla o 8 %. Křivka, která v datech nikdy neklesne (zatáčková a trakční přilnavost Forza Horizon), nemá limit. Samotný prokluz tam nic neoznačuje. Při málo datech je limit jeden a půl násobku jmenovité špičky.

**Povrch je znám u každého vzorku**, kde to hra říká. Forza rozechvívá pneumatiky na štěrku, hlíně a trávě (málo vzorků na asfaltovém okruhu, hodně na hlinitých a terénních tratích). Trackmania pojmenuje materiál pod každým kolem a povrch rallye etapy se najde podle oddílu 11. Křivky, návyky driftu a prahy jsou pro asfalt a sypký povrch odděleny.

**Každá událost se klade proti druhému kolu přes stejné metry.** Na štěrku, na sněhu nebo v arkádovém závodě plném driftu je smyk způsob, jak se zatáčka jede. Studie optimálního řízení najdou řešení „s malým driftem“ na asfaltu a „agresivní, s velkým driftem, i s protizáklonem“ mimo silnici. Data z rallye ukazují pneumatiky „hluboko v nelineární oblasti“. Zablokování kola na velmi sypkém povrchu může vůz dokonce zastavit dřív. Proto událost, kterou udělalo i druhé kolo, tedy 80 % nebo víc, je způsob, jak se zatáčka jede, ne chyba. Událost, kterou druhé kolo neudělalo, je chyba jen tehdy, když stála čas: ztracený čas od chvíle těsně před ní až do 40 m za ní. Chyba, která vysvětluje 40 % a víc ztráty zatáčky, se stane příčinou této zatáčky.

Prahy detekce, test druhého kola, nárazy a nehody a texty rad: [Události ovládání vozu](race-control-events.md).

### 6b. Mnoho kol: statistiky tratě {#b-many-laps-the-courses-statistics}

Porovnání tříd, co se počítá jako chyba, statistiky a mapa chyb: [Statistiky tratě](race-course-statistics.md).

### 7. Projetá stopa {#the-driven-line}

Pro každé kolo a zatáčku, jen z pozic: kde začalo zatáčet (pětina nejtužší křivosti), jeho nejmenší poloměr (přes ±8 m), průměrný poloměr v první a ve druhé polovině změny směru, a tedy:

- **tvar**: nejmenší poloměr ku průměrnému pod 0,55 je V, nad 0,75 je U;
- **apex**: poloměr na výjezdu ku poloměru na vjezdu nad 1,25 je pozdní, pod 0,8 brzký;
- **rychlostní apex**: jeho nejpomalejší bod více než 15 m před polovinou jeho zatáčení je pomalu dovnitř, rychle ven. Více než 15 m po ní, stále zpomaluje za středem.

Proti druhému kolu: jak daleko uvnitř nebo vně jelo při zatáčení, nejtěsnější částí a tam, kde byla obě rovná, a kde se každé zatáčelo. Každý nález končí linií, která sedí vozu daného kola v té zatáčce. Podle toho, kam zatáčka vede, a podle změřeného poměru výkonu k přilnavosti, přítlaku a pohonu. A také tím, zda kolo tuto linii jelo. Tabulka „Zatáčka po zatáčce“ uvádí nejrychlejší kolo každou zatáčkou s tvarem jeho linie a dohromady nejlepší zatáčky.

### 8. Dvě mapy {#two-maps}

- **Kde**: trať obarvená podle `dΔt/ds` proti referenci. Červeně tam, kde se čas ztrácí, zeleně tam, kde se získává.
- **Proč**: každá ztráta se nakreslí tam, kde je její příčina, obarvená podle skupiny příčiny (brzdění, vjezd, výjezd, rovinka, vůz) a širší, je-li dražší.

### 9. Přehrání {#replay}

Jeden čas a tři způsoby, jak z něj udělat čas každého kola: od startovní čáry; seřazená, kdy každé kolo dosáhne jednoho bodu trati ve stejný okamžik a pak se pustí; a vedle sebe, kdy je každé kolo drženo na vzdálenosti reference.

### 10. Kterým směrem je svět otočen {#which-way-round-the-world-is}

Svět prohlížeče je pravotočivý, s osou Y nahoru. Hra s levotočivým světem (mezi nimi Forza) se v něm zobrazí zrcadlově: každá zatáčka doprava se nakreslí jako zatáčka doleva, trať i kola stejně. Kola to sama potvrzují. Kladné řízení je doprava u každého adaptéru a vnější odpružení zatáčky se stlačuje. Záložka závodu proto nabídne opravu a **Kamera a scéna → Převrátit osu světa** to udělá: X, Y nebo Z se nakreslí obráceně. Mění se jen kreslení, zrcadlení vložené do matice pohledu. Kamera létá v nakresleném světě, ale data, analýza a každá souřadnice, kterou nástroje ukazují, zůstávají takové, jaké je poslala hra. Analýza pojmenovává zatáčky doleva nebo doprava stejným měřením.

### 11. Rallye: smyk, levá noha, vzduch {#rally-the-slide-the-left-foot-the-air}

Etapa rallye není okruh jetý s horší přilnavostí. Na štěrku a sněhu je smyk způsob, jak se zatáčka bere. Vůz se při vjezdu natočí přesunem váhy: „brzdy přesunou váhu vozu dopředu ... přední pneumatiky získají přilnavost, zadní ji ztratí a vůz se otáčí a v zatáčce smýká“. Pak se vrací na plyn, až je „seřazen ve směru, kterým chcete jet“ ([DirtFish: jak používat brzdy](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Levá noha brzdí, takže plyn a brzdu lze hrát proti sobě. Ruční brzda natočí vůz v těsných zatáčkách ([RallySport Ontario: rallye, základy](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Skandinávský flick](https://en.wikipedia.org/wiki/Scandinavian_flick)). A vůz se odlepí od země. Oddíl 6 už čte smyky proti druhému kolu. Tato pravidla nesou zbytek.

- **Povrch.** Co říká kolo (`meta.surface`, parametr `--surface` u záznamníků rallye). Jinak název akce: asfaltové rallye (Španělsko, Chorvatsko, Střední Evropa, Německo, Japonsko, Korsika, Ypry), zimní (sníh), asfaltová část Monte se sněhem a ledem (smíšený). Jinak se to pozná podle toho, jak byl vůz řízen. Boční limit vozu Rally2 je 0,7–0,9 g na štěrku a 1,3–1,4 g na asfaltu ([grenzbereich, referenční hodnoty](https://github.com/GitCrush/grenzbereich)). Na štěrku jede mnohem víc driftu (oddíl 6). Etapa, kde vůz táhl 10 m/s² nebo víc (95. percentil, při rychlosti, na povrchu), s mediánem driftu pod 6 stupňů všude, kde zatáčel v rámci 70 % této hodnoty, byla asfalt. Cokoli jiného, nebo příliš málo na rozpoznání, je sypké.
- **Co vůz umí, na povrchu, na kterém to dělal.** Přilnavost, brzdění a tah (oddíl 5) se měří zvlášť pro asfalt a sypký povrch, když kola jela pětinu a víc svých vzorků na každém. Každá zatáčka se posuzuje s povrchem pod vozem v jeho nejpomalejším bodě. Vzorky ve vzduchu a 0,3 s po dopadu se vynechají ze všeho, co měří vůz: obálky, křivky pneumatik, zablokování a protáčení. Dopad vůz otřese víc, než zvládnou jeho pneumatiky, a kola roztočená ve vzduchu nejsou protáčení. Přítlak se na sypkém povrchu neposuzuje, protože rychlé a pomalé úseky etapy jsou různé cesty.
- **Špetka levé nohy není brzdění.** Lehký dotek brzdy při plynu na půl nebo víc, na méně než 15 m, vyrovná vůz nebo ho natočí. Kde kolo začalo brzdit pro zatáčku, je první brzda, po které se plyn ubral, nebo která trvala déle.
- **Vůz se natočil při vjezdu.** Pro každé kolo a zatáčku největší úhel driftu od jeho brzdění až 5 m za nejpomalejší bod. Na sypkém povrchu kolo, které mělo vůz natočen o 8 stupňů nebo víc méně než druhé (které se natočilo o 12 nebo víc) a dostalo se na výkon nebo na plný plyn později, **otočilo vůz méně**. Rada: zvednout nebo lehce přibrzdit levou nohou, když se vůz natáčí, aby zadek přišel. S bodem ruční brzdy druhého kola, pokud ji použilo, nebo ruční brzdou v zatáčce pomalejší než 54 km/h. A mít vůz směřovaný na výjezd před apexem. Kolo, které se natočilo o 12 stupňů nebo víc více než druhé a na výkon se dostalo později, **otočilo ho příliš**. Musel se narovnat, než mohl výkon dolů. Obojí je příčinou zatáčky na výjezdu, po chybě v ovládání vozu. Rada k linii na sypkém povrchu říká totéž pro každou zatáčku.
- **Vzduch.** Let o 0,2 s a více delší než u druhého kola, který stál čas od 10 m před odrazem až 40 m za dopadem (nebo do konce zatáčky), je příčinou, když vysvětluje 40 % a víc ztráty zatáčky. Zatáčka po něm, kam se dorazí pomaleji, to říká. Ve vzduchu vůz nemůže zatáčet, brzdit ani jet. Rada drží plyn při odrazu („neubírat plyn při odrazu“, což sklopí přídi). Hřbet se vezme o něco pomaleji, nebo s lehkým dotekem brzdy, aby vůz zůstal nízko ([DirtFish: jak přeskočit rallye auto](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Skupiny až tří zatáček.** Klikatý úsek, který se nikdy nejede na rovinu, není jedna dlouhá skupina. Po třech zatáčkách začíná nová.

`src/race/rally.test.ts` ověřuje analýzu na všem tomto, na etapách běžících na jednoduchém modelu: vůz, který se natočil méně a na výkon přišel pozdě, delší let, dotyky levé nohy, klikatý úsek, asfalt proti štěrku.

## Data a co každý zdroj dovolí {#data-and-what-each-source-allows}

| Zdroj | Vzorkování | Kanály | Umožňuje |
|---|---|---|---|
| FH Companion lap files | ~5 m | poloha, rychlost, plyn, brzda, řízení, zrychlení podél a napříč, rychlostní stupeň | vše kromě ovládání vozu, které potřebuje telemetrii vedle nich |
| FH Companion `.tele.gz`, vedle každého souboru kola | 64 Hz hry (záznamník, který drží každý paket, zapisuje asi 110 za sekundu; opakování se zahazují) | celý Forza Data Out: pro každé kolo poměr prokluzu, úhel prokluzu, kombinovaný prokluz, otáčení, odpružení, rozechvění povrchu; rychlost v rámu vozu; rychlost natáčení kolem svislé osy | vše, včetně ovládání vozu |
| Forza Data Out, nahraný `heat3d_capture telemetry` | 60 Hz | všechno výše, plus pro každé kolo: teplota pneumatiky, poměr prokluzu, úhel prokluzu, kombinovaný prokluz, zdvih odpružení, rychlost kola, pás rozechvění; otáčky, výkon, točivý moment, rychlost natáčení | vše |
| Assetto Corsa, ACC, AC EVO, AC Rally (sdílená paměť, `heat3d_capture telemetry --game ...`) | 60–333 Hz | nadmnožina: teplota jádra pneumatiky a vnitřní, střední a vnější teploty, tlaky, teploty brzd, zatížení kol, úhel rozbíhavosti (camber), poměr prokluzu a úhel; rychlost v rámu vozu; ABS a TC v činnosti (ACC, EVO, AC Rally) | vše |
| iRacing `.ibt`, čtený přímo | 60 Hz | poloha z GPS, pedály, řízení, g, natočení, u každého kola teplota kostry pneumatiky, výchylka tlumiče, tlak, opotřebení | vše; ovládání vozu z úhlu driftu (jeho natočení proti směru jízdy) a řízení, bez prokluzu (ten se nezaznamenává) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | po snímku; 100 Hz | poloha, rychlost světa a osy vozu, pro každé kolo rychlost styčné plochy a odpružení, pedály, řízení, časomíra etapy a délka | vše; prokluz a úhel driftu odvozeny |
| Richard Burns Rally (NGP UDP) | po kroku fyziky | poloha, vlastní rychlosti vozu, pro každé kolo výchylka a síla pružiny, pedály | vše kromě prokluzu kol |
| BeamNG.drive (modifikace protokolu `heat3d`) | až 100 Hz | poloha, rychlost světa a osy, pro každé kolo rychlost povrchu, otáčení, zatížení a dotyk se zemí | vše; prokluz a úhel driftu odvozeny |
| Trackmania (plugin Openplanet) | po snímku | poloha, přední a boční rychlost, pedály (brzda zapnutá/vypnutá), řízení, pro každé kolo koeficient prokluzu a sypký povrch, ve vzduchu | vše; úhel driftu z boční rychlosti |

Každý zdroj se převede na jeden formát kola, `heat3d-lap`, jehož kanály mají jednotné názvy (`speed`, `throttle`, `tireTemp[FL]` ...). Symbol vozu a grafy kreslí, jaké kanály kolo má.

## Zdroje {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Zrychlování úseků: tvary time variance](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta v doméně vzdálenosti)](https://github.com/taishiliu25/lap-delta-analyzer)
- [průvodce analýzou kola iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: kola v session](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analýza závodních linií](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teoretické nejlepší kolo ze sektorů](https://overcut.gg/)
- [Track Titan: jak analyzovat telemetrii](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: KPI brzdění, zablokování a stability (září 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: na plynu (leden 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: klíčové ukazatele výkonu závodních jezdců (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modely tření pneumatika–vozovka a optimální prokluz (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tření pneumatika–povrch, prokluz u maxima na sněhu a ledu](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: součinitele tření pneumatik, špička a smyk](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: podélné síly](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: boční síly](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Stabilita vozidla, limity skluzu karoserie (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rallye jízda při velkém bočním skluzu (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manévry rallye pro minimální čas (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [Referenční rychlost natáčení ESC (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Detekce podsteeru a přesteeru řízením proti rychlosti natáčení (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: úhel řízení, Ackermann a gradient podsteeru](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: matematické kanály (Kus, kombinovaná g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: widget přesteeru a podsteeru](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Kadenční brzdění: zablokování na velmi sypkém povrchu](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: záznam dat z rallye na štěrku](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: jak používat brzdy](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: jak přeskočit rallye auto](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rallye, základy](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Skandinávský flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: dynamika rallye vozidel, referenční hodnoty](https://github.com/GitCrush/grenzbereich)
- [Trackmania: konstanty pluginu speed-drift trainer](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania: popis speedslide](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: koučovací postupy](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: linie V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Ovlivnění stylu jízdy umělého závodního řidiče (rychlost na výjezdu proti minimálnímu času)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: posloupnost pro zlepšení času kola](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: tři typy zatáček](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: určování priority zatáček](https://driver61.com/uni/prioritising-corners/)
- [Driver61: různé zatáčky, různé techniky](https://driver61.com/uni/different-corner-technique/)
- [Driver61: šest fází zatáčky](https://driver61.com/uni/corner-phases/)
- [Driver61: přilnavost](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (výňatek)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: co je momentový vůz](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Debata o momentu nad výkonem](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matematika závodní linie, část 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, část 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [Technika FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD v zatáčkách](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Závodní linie](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: technika zatáčení](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximální rychlost v zatáčce](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Slovník telemetrie závodů](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globální trajektorie s minimálním časem s ohledem na křivost a vzdálenost](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globální optimalizace závodní trajektorie](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: koeficient jízdy bez pedálů](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Úvod do třecího kruhu](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Podélný prokluz](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Podsteer, přehled](https://www.sciencedirect.com/topics/engineering/understeer)
- [Podsteer a přesteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Dokumentace Forza Motorsport Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: zrychlení omezené trakcí](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: zrychlení omezené výkonem](https://hpwizard.com/accelerating-power-limit.html)
- [Dokumentace sdílené paměti AC EVO](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [Čtečka telemetrie AC Rally](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [Čtení IBT pro iRacing](https://github.com/teamjorge/ibt)
