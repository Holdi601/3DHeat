---
title: "Profily vozidel a porovnání"
parent: "Analýza závodu"
nav_order: 56
lang: "cs"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Profily vozidel a porovnání

Auto dokáže brzdit, zatáčet a zrychlovat jen do určité míry. Prohlížeč měří, jak moc, z vašich vlastních kol, takže vám nikdy neřekne, abyste udělali něco, co vaše auto neumí. Vysvětlí také, kolik ze ztracené vteřiny bylo chybou auta a kolik vaší.

![Srovnání vozů: dvě auta vedle sebe s jejich přilnavostí, brzděním a tahem](../assets/img/en/race-cars-compared.webp)

Analýza řekne kolu jen to, že má brzdit silněji, držet vyšší rychlost nebo zrychlovat dříve, tam, kde to jeho auto ukázalo, že umí. Z každé ztráty odečte to, co vysvětlují samotná auta. Limity každého auta (jeho *obálka*, níže) a jeho povaha (jeho *profil*) se proto měří ze všech načtených kol daného auta. Tato stránka popisuje obálku, profil, sekci **Srovnání vozů** a to, co auta rozhodují v každé zatáčce.

**Jedno auto** = kola se stejným číslem auta (nebo se jménem, pokud číslo není) a stejným indexem výkonu: jiné vyladění je jiné auto.

## Obálka: co auto umí při každé rychlosti {#the-envelope-what-the-car-can-do-at-each-speed}

Pro každé auto, ze všech jeho načtených kol, v **pásmech rychlosti po 5 m/s** (24 pásem, až 120 m/s). Vzorky ve vzduchu, ustalování 0,3 s po dopadu a vše od 0,1 s před každým zásahem do 1 s po něm se vynechají. Zrychlení 80 m/s² a více se ignoruje (víc, než jakékoli auto s přítlakem udrží).

| Obálka | Vzorky | Hodnota v pásmu | Potřebuje |
|---|---|---|---|
| **boční přilnavost** | boční zrychlení **držené půl sekundy** (průměr jeho absolutní hodnoty přes středově centrované okno 0,5 s), jen tam, kde auto zatáčelo: aspoň třetina 99. percentilu všech takových vzorků | 95. percentil | 6 vzorků |
| **brzdění** | brzda > 0,3; podélné zrychlení jako medián každého vzorku a jeho dvou sousedů | 95. percentil zpomalení | 4 vzorky |
| **tah na plný plyn** | plyn > 0,95, brzda pod 0,05; stejný medián z trojice | 90. percentil | 4 vzorky |

Proč držené půl sekundy: obrubník, smyk, který se zase chytí, nebo zachycené auto krátce vyskočí v bočním zrychlení, a auto, které to dělá často, vypadá přilnavější, než je. Proč medián z trojice: při rozestupu pěti metrů je jeden vzorek daleko, a jednorázový výkyv je obrubník, nerovnost nebo zeď.

Čtení obálky při dané rychlosti interpoluje mezi středy pásem a v prázdném pásmu vezme nejbližší pásmo s daty.

**O dvou druzích povrchu.** Když kola daného auta jela na asfaltu a na sypkém povrchu aspoň v pětině svých vzorků, drží se pro každý zvlášť samostatná obálka a každá zatáčka se posuzuje s povrchem pod autem v jejím nejpomalejším bodě.

**Přechod.** Rychlost, od které tah klesá jako `1/v` (omezený výkonem), místo aby držel rovně (omezený trakcí): první pásmo, jehož `a·v` je do 15 % nejvyššího viděného `a·v`.

## Profil: jaký druh auta to je {#the-profile-what-kind-of-car-it-is}

`profile` ze stejných kol (vzorky na zemi, neudeřené, rychleji než 8 m/s):

| Míra | Jak |
|---|---|
| **držená přilnavost** (m/s²) | 95. percentil půlsekundového drženého bočního zrychlení |
| **tah** do 50 km/h, 50–120, 120–200, nad 200 (m/s²) | průměr tahu obálky na plný plyn přes 3–14, 14–33, 33–56 a 56–90 m/s, při rychlostech, kterých auto dosáhlo (až do jeho nejvyšší + 2 m/s), z aspoň tří kroků po 1 m/s; a nejvíc, co ukázalo, a kde |
| **brzdění** (m/s²) | brzdění obálky zprůměrované od 60 do 160 km/h (16,7–44,4 m/s), pásmo, které srovnání pojmenuje |
| **nejrychlejší** | nejvyšší rychlost, které dosáhlo |
| **dosažená maximální rychlost** | kde přestalo zrychlovat na plný plyn na rovince (níže) |
| **pořád táhne na nejvyšší rychlosti** | tah obálky při nejvyšší rychlosti: jak daleko ještě mělo jít |
| **zadek zachycen, na kolo** | kolikrát na kolo smýkalo a muselo se zachytit (níže) |
| **podíl na plynu** | z těchto případů podíl, který začal s plynem nad 0,5 a bez brzdy |
| **pouští se při** | medián drženého bočního zrychlení 0,15 s před každým začátkem smyku, jako podíl přilnavosti |
| **nad 10° driftu, při tvrdé jízdě do zatáček** | ze vzorků zatáčejících na 60 % přilnavosti nebo víc podíl, který smýká (10° na asfaltu, 20° na sypkém); potřebuje 30 vzorků |
| **medián driftu** | přes stejné vzorky |
| **vyvážení** | úhel skluzu přední mínus zadní (násobky jmenovitého vrcholu) tam, kde tvrdě zatáčí a nesmýká, průměr aspoň 30 vzorků: + tlačí ven |
| **povrch** | nad 80 % sypkých vzorků: sypký; pod 20 %: asfalt; jinak smíšený |

**Dosažení maximální rychlosti.** Vzorek se počítá, když byla celá sekunda kolem něj (±0,5 s, aspoň 0,9 s dat) na plný plyn (> 0,95, bez brzdy), na zemi, jet **rovně** (|boční| pod větším z 4 m/s² a čtvrtiny své přilnavosti), zrychlení pod **0,35 m/s²**, rychleji než 25 m/s a do 90 % nejrychlejšího kola – plný plyn do kopce nebo dlouhou zatáčkou také přestane zrychlovat, výrazně pod nejvyšší rychlostí auta. Při aspoň **jedné sekundě** takové plošiny přes všechna kola je medián těch rychlostí místem, kde auto dosáhne maxima. Jinak nejvyšší rychlost není: kde žádná rovinka nebyla dost dlouhá, řekne *pořád táhne na nejvyšší rychlosti*, jak daleko to bylo. Nic se nedomýšlí nad rámec toho, co kola ukazují – převodovka a omezovač ukončí tah auta dávno předtím, než to udělá odpor vzduchu.

**Ztráta zadku.** Počítá se tam, kde ho řidič musel zachytit: zatáčení na 60 % přilnavosti nebo víc, smyk (drift nad 10° na asfaltu, 20° na sypkém povrchu), s řízením (nad 0,06) natočeným **proti** zatáčce. Který znak řízení odpovídá kterému znaménku boční síly v zatáčce, se měří pro každé kolo zvlášť (vzorky, které se točí bez smyku). Smyk se počítá jednou, dokud auto nepřestane smýkat. Auto, které záměrně trochu jede bokem, nic neztrácí; to, které potřebuje protiřízení, ano. Počítá se stejně pro každé auto, takže lze porovnat dvě auta. Potřebuje řízení a úhel driftu.

## Srovnání vozů {#cars-compared}

Sekce v postranním panelu se jmenuje **Vůz**, když je jedno auto, a **Srovnání vozů**, když jich je víc.

**Tabulka**: sloupec na auto, řádek na každou míru, kterou nějaké auto má. Držená přilnavost; tah do 50 km/h, 50–120, 120–200, nad 200; brzdění; nejrychlejší; dosažená maximální rychlost („pořád táhne“, pokud nikdy nedosáhlo); pořád táhne na nejvyšší rychlosti; zadek zachycen, na kolo; nad 10° driftu, při tvrdé jízdě do zatáček. Kde se auta liší o víc než 3 %, označí se lepší hodnota (vyšší u přilnavosti, tahu, brzdění, rychlostí; nižší u smyků zadku).

**Jedno auto samo**: věty o tom, jaké je podle kol – přilnavost, kterou drží (m/s² a g), jeho tah v každém pásmu, kde přestalo zrychlovat na dlouhých rovinkách (nebo že nikdy nedosáhlo maxima a co ještě táhlo na nejvyšší rychlosti), jak často musel být zadek zachycen („téměř nikdy“ při méně než jednou za kolo, „většinou na plynu“, když 60 % nebo víc začalo tam).

**Dvě auta**: pro každou dvojici jedna věta o tom, jaké je auto oproti druhému („X zrychluje lépe, ale neumí zatáčet tak tvrdě, potřebuje delší brzdnou dráhu a snadněji ztrácí zadek“), tabulka, každý jasný rozdíl od největšího, pak **Jak jezdit s každým**. Při více než **3** dvojicích se ukáže jedna dvojice: auto zaostřeného kola proti autu vybranému z rozbalovacího seznamu (ve výchozím nastavení auto nejlepšího kola své třídy, jinak auto referenčního kola, jinak první jiné).

Rozdíl se říká jen tehdy, když ho kola jasně ukazují:

| Rozdíl | Říká se od | Věta |
|---|---|---|
| přilnavost | **4 %** | „X drží v zatáčkách o N % více přilnavosti … to je o M % více rychlosti ve středu každé zatáčky“ (rychlost = √ poměru přilnavosti) |
| tah | **5 %**, v prvním pásmu, které mají obě auta, z 120–200, 50–120, nad 200 km/h | „X zrychluje o N % silněji ze 120 na 200 km/h“; i z místa startu, nebo „ačkoli Y se rozjíždí silněji“, když se rozjezd liší o 8 % |
| nejvyšší rychlost | **4 km/h** | „X dosahuje vyšší maximální rychlosti: přestalo zrychlovat při …“ |
| nejvyšší rychlost, jen jedno | jedno auto dosáhlo maxima, druhé ne | „Y došlo tah při …; X ještě zrychlovalo, když brzdilo“ |
| nejvyšší rychlost, ani jedno | ani jedno nedosáhlo maxima | při čem každé ještě zrychlovalo na nejvyšší rychlosti |
| brzdění | **5 %** | „X zastavuje o N % silněji … Y musí brzdit dříve“ |
| ztráta zadku | aspoň jednou na kolo víc **a** o polovinu častěji | „X snadněji ztrácí zadek: smýká natolik, že potřebuje protiřízení N krát na kolo proti M …“ – většinou na plynu (60 % a víc), nebo většinou při vjezdu do zatáčky a s uvolněným plynem (30 % nebo méně), od zhruba P % své přilnavosti; na sypkém povrchu „něco z toho je tím, jak se auto točí; zachytávání ne“ |
| bokem | **12 procentních bodů** tvrdé jízdy do zatáček nad prahem driftu | „X na hranici jede víc bokem“ |
| vyvážení vpředu | **0,3** jmenovitého vrcholu | „X víc tlačí vpředu … chce zpomalit a natočit se dřív, než dojede do vrcholu zatáčky“ |

Rysy v souhrnu: *drží víc přilnavosti* / *neumí zatáčet tak tvrdě*, *zrychluje lépe* / *táhne méně*, *dosahuje vyšší maximální rychlosti* / *dosahuje nižší maximální rychlosti*, *pořád táhne na konci rovinek* / *dojde mu tah*, *brzdí silněji* / *potřebuje delší brzdnou dráhu*, *je stabilnější* / *snadněji ztrácí zadek* (*je mnohem smykovější …* při dvojnásobné četnosti plus jedna; *potřebuje zachycování častěji* na sypkém povrchu), *tlačí vpředu*. „Podle těchto kol je těžké je rozlišit od Y“, když žádný rozdíl není.

**Jak jezdit s každým:**

- jedno auto více drží a druhé více tahne: neste rychlost středem na širokou, kulatou stopu (tvar „U“) u auta s přilnavostí; brzděte rovně, natočte ho v krátkém úzkém středu a narovnejte výjezd (tvar „V“) u silného auta;
- jedno auto je horší v obou: jeho nejlepší kolo je nejčistší – brzdit rovně, nejširší poloměr, plný plyn co nejdřív, jak to drží;
- auto, které snadněji ztrácí zadek: přidávejte plyn, jen když se volant odvíjí, a řaďte brzy (smyky na plynu), nebo jemně povolte brzdu a držte stálý plyn uprostřed (smyky při vjezdu).

Hint pod sekcí opakuje, jak se každé měří.

## Co auta rozhodují v zatáčce {#what-the-cars-decide-in-a-corner}

Když jsou kola v různých autech, končí nález každé ztracené zatáčky částí **Vozy:** – to, co z něj rozhodují auta, a jak z tohoto auta vytěžit co nejvíc (`carNote`):

- **Středem**, když toto auto drží méně než 96 % přilnavosti druhého, druhé bylo v nejpomalejším bodě o víc než 0,5 m/s rychlejší a toto kolo nezůstalo daleko za tím, co jeho přilnavost vysvětluje (nad 70 %): na stopě druhého auta přilnavost tohoto auta dovolí `v_druhé · √(přilnavost_moje / přilnavost_druhé)`. Jestli kolo tohle drželo (v rámci 1 m/s), je rozdíl v autě a žádný brzdný bod to nezmění; jestli méně, zbývá ještě, kolik se dá získat. Pak kde se čas dá získat jinak: na rovinku, mezi dvěma zatáčkami, nebo v autě, které táhne o 5 % silněji – až za vrcholem zatáčky (brzdit rovně, zatočit později, namířit brzy na výjezd); jinak nejširší poloměr, který silnice dovolí.
- **Zadek, který zde povolil** (nesdílený smyk nebo protáčení, nebo drift nad prahem smyku cestou dovnitř), v autě, které ho ztrácí aspoň jednou na kolo víc a o polovinu častěji: co dělat v tomto autě – plyn přidávat, jen když se volant odvíjí (jeho smyky začínají na plynu v 60 % nebo víc případů), nebo brzdu jemně povolit bez uvolnění plynu.
- **Rovinka po ní**: když tah aut vysvětlil 0,03 s nebo víc, silnější tah druhého auta ze stejné rychlosti, s tahy obou aut od 120 do 200 km/h.
- **Nejvyšší rychlost**: když toto kolo dosáhlo 98 % toho, kde jeho auto přestává zrychlovat na rovince delší než 150 m, a druhé jelo o 1,5 m/s rychleji: to je maximální rychlost auta a každý další km/h z výjezdu pomáhá, dokud se k ní nedostane.
- **Brzdění**: když druhé auto brzdí o 5 % silněji a toto kolo brzdilo o víc než 5 m dříve, že část dřívějšího brzdění je dána autem.

Podíl auta se odečítá i od samotného času – viz [podíl auta](race-corner-analysis.md#the-cars-share) – a zatáčka, kde auto vysvětlí 60 % nebo víc, se připisuje autu.

## Pro vývojáře {#for-developers}

Kód: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` v [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` v [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
