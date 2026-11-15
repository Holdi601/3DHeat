---
title: "Manévry"
parent: "Zjištění"
nav_order: 4
lang: "cs"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manévry: jak se skupiny pohybují

**Zjištění → Manévry** sleduje, jak se jednotky každé strany pohybují *jako skupiny*, a pojmenuje manévry, které provádějí – obchvat, kleště, průlom, léčku, ústup, obranu proti raketám, překřížení T. U každého ukáže, jak jistý si nástroj je, čísla, na kterých to stojí, zda se manévr vyplatil, a jeho paralely v doktríně a dějinách. **Hromadná analýza → Manévry** je počítá přes tisíce zápasů: jak často se který manévr provede podle mapy, režimu a strany a jak často se vyplatí.

Vše se počítá ve vašem prohlížeči, ve vlastním workeru (`src/insights/maneuver`). Zápas o několika stovkách jednotek trvá 10–500 ms, dvouhodinová vzdušná válka s tisíci objekty asi sekundu.

## Použití {#using-it}

- Otevřete **Zjištění**, záložku **Manévry**. Při prvním otevření počítá hned. Po změně filtrů použijte **Hledat znovu**.
- **Jistý / Pravděpodobný / Možný** nastavuje, jakou jistotu výsledky mají (výchozí je Pravděpodobný).
- **Časová osa** má řádek pro každou stranu a pruh pro každý manévr. **Seznam** pod ní ukazuje totéž seřazené podle času. Kliknutí přepne na záznam na začátku manévru, kamera tam přeletí a manévr se nakreslí ve 3D: cesta každé skupiny jako šipka (dvě ramena kleští jsou jeho dva oblouky), obrysy skupin v klíčovém okamžiku (nepřítel v barvě své strany) a čelo nepřítele jako bílá čára. **Vykreslit vše ve 3D** přidá ostatní manévry zápasu, slabě. Čáry se nahrají na grafickou kartu jednou, když se změní výběr, a ne každý snímek. Při 480 manévrech vykreslených během přehrávání jsou časy snímků na skutečné GPU (WebGL2 a WebGPU, p99 18,0–18,5 ms, max 19,5–20,8 ms) stejné jako bez nich.
- Otevřený manévr ukazuje svůj výsledek (ztráty a vyřazení jednotek, které ho provedly, během jeho běhu a těsně po něm, oproti výměně vlastní strany za celý zápas), své důkazy a položky znalostní báze k němu: doktrínu a historické paralely (Kanny u kleští, Sedan 1940 u průlomu, Cušima u překřížení T, operace Bolo u klamného útoku…).
- Malá tabulka na konci: pro každý druh a stranu počet provedených a vyplacených manévrů.

![Kleště na syntetickém ukázkovém zápase: šipky obou ramen, tělo nepřítele a jeho čelo](../assets/img/en/maneuvers.webp)

## Jak se skupiny najdou {#how-groups-are-found}

Každá jednotka se zařadí na společnou časovou osu (krok 1 s pěšky, jinak 2 s, u velmi velkých souborů delší). Při úmrtí zůstane na místě, aby oživení nekreslilo čáru přes mapu. V každém kroku se propojí jednotky jedné strany a jednoho druhu (letadla, vozidla, lodě, pěchota), když jsou blízko – 18 m pěšky, 170 m u vozidel, 3 km u lodí, 5 km u letadel – a pohybují se stejně (rychlosti se liší nejvýš o polovinu rychlejší z nich, nebo obě stojí). Shluk si ponechá id té skupiny, ve které bylo nejvíc jeho členů. Jednotka bez třídy se zařadí podle rychlosti jako pěší, pozemní nebo letecká.

**Tvar** skupiny se čte vzhledem ke směru pohybu: kolona nebo linie podle toho, jak je rozprostřená podél a napříč, klín tam, kde střed jde vpředu, šikmý šik tam, kde se členové odsunou na jednu stranu, čtverec tam, kde drží rohy.

Vše se posuzuje v měřítku samotného zápasu. **Dosah boje** `R` je 75. percentil vzdálenosti mezi zabijákem a jeho obětí (omezený na rozumné hodnoty pro danou doménu). Časy manévru se škálují podle druhu jednotky (u pěchoty je to jen třetina času pozemních jednotek).

## Co se najde {#what-it-finds}

| Manévr | Najde se, když |
|---|---|
| Formace | skupina drží jeden tvar na 60 % svých pohybových kroků po dobu 30 s |
| Čelní útok | skupina se od mimo dosahu přiblíží ke styku, ¾ R nebo víc, ze směru do 35° od toho, kam nepřítel čelí |
| Útok do boku | totéž z 50–130° (zezadu nad 130°); jistý je jen s přátelskou *podpůrnou silou*, která tam nepřítele drží v boji (vyřazení na obou stranách) |
| Kleště | dva útoky do boku jedné strany na stejné tělo nepřítele z opačných stran (100° nebo víc od sebe), do 90 s; jisté, když ramena bojují |
| Obklíčení | kompaktní skupina nepřítele, kterou obklopuje alespoň stejný počet jednotek druhé strany do 1,5 R, z dvou nebo více skupin, bez mezery většího než 100°, po dobu minuty, odříznutá od vlastní strany; jisté, když se kruh uzavřel o ½ R a kapsu bylo vidět v boji |
| Průlom | skupina projde drženou linií (nepřátelé stojí 30 s jak vlevo, tak vpravo od ní, střed jejich strany je za nimi); jisté, když se dostane o ½ R dál, zůstane 20 s a bojuje tam; průlom je až o další R za nimi |
| Střídavý postup s krytím | v malé skupině se část pohybuje, zbytek stojí, role se střídají čtyřikrát nebo víckrát a stojící část kryje palbou |
| Soustředění / rozptýlení | podíl strany u jejího nejhustšího místa stoupne z 35 % na 60 % (jednotky přijdou o 1,5 R a více blíž, pak styk), nebo klesne, když se strana rozprostře |
| Finta | malý prvek v kontaktu přitáhne dva nebo víc nepřátel jinam; větší skupina pak udeří o čtyři dosahy dál, kde je nepřítel slabší |
| Ústup / pronásledování | skupina v kontaktu se odvrátí a odsune se o R od místa boje; jisté, když tam nepřítel právě jednoho z nich zabil a skupina se od toho zabijáka dostala na 2 R (pěšky nikdy, viz níže); nepřátelé, kteří jdou stejným směrem a drží tempo, pronásledují |
| Obrana do hloubky | stojící jednotky ve dvou nebo více pásmech napříč osou nepřítele, každé hluboké R, nepřítel přichází, palba z pásem |
| Odvrácený svah | tři nebo více vyřazení na krátkou vzdálenost stojícími jednotkami obětí, které přišly přes hřbet |
| Léčka | pohybující se skupina narazí na nepřátele, kteří stáli 45 s; ti střílí první a pohybující se ztratí dvě jednotky nebo polovinu skupiny |
| Clona | jedna nebo dvě jednotky, které jedou před tělesem tří a více jednotek, a narazí na nepřítele první |
| Vnitřní linie | skupiny jedné strany jsou blízko u sebe mezi skupinami druhé strany a jejich jednotky mezi nimi přesouvají |
| Tempo | strana odpovídá na styk (zatáčkou, změnou rychlosti, prvním výstřelem) 1,5krát rychleji, Mann-Whitneyovo p menší než 0,05 |
| Crank, notch (bokem), drag, pump | cíl odpálené rakety otočí střelce do 35–70°, 75–105° nebo přes 140°, nebo jej táhne a zase otáčí |
| Vzdušné kleště, stěna, lead-trail, grinder | dvojice, která se rozdělí na jednoho nepřítele; tři vedle sebe proti nepříteli; prvek 5–20 km za jiným; dva krouživé kolem jednoho bodu o rozestupu 1 km |
| Bojová vzdušná hlídka | krouží kolem stanoviště po tři minuty |
| Energetický a úhlový boj | v blízkém souboji – kurzy 30° od sebe, každý drží druhého na špičce střídavě, nebo mezi nimi padne vyřazení – výška je využita a stoupá, nebo jsou letadla v rovině, zatáčejí tvrdě a zpomalují; jisté, když jedno druhé zabilo |
| Úderný svaz, SEAD | vzdušná skupina smíšených rolí, z nichž některé útočí na zem; vyřazení protivzdušné obrany dříve než většina ostatních pozemních vyřazení |
| Bitevní linie, překřížení T | tři lodě v koloně; kolona napříč přes hlavu nepřátelské kolony |

Každý manévr uvádí, které **vzory** ze znalostní báze ukazuje (`patterns-maneuver.ts`: formace, čelní útok, dvojité obklíčení, obklíčení, průlom, palba a manévr, finta, ústup, pronásledování, obrana do hloubky, zajištění, rozptýlení, obrana proti raketám, úhlový boj, bojová vzdušná hlídka, úderný svaz, bitevní linie, překřížení T) a položky, které se mají přečíst nejdřív. Starší položky přenášejí nové vzory přes `knowledge/maneuver-tags.ts`. Viz [Čočka znalostí](knowledge.md).

**Vyplatil se** porovnává výměnu jednotek během manévru (a minutu po něm) s výměnou jejich strany za celý zápas. Ústup se vyplatí, když po obratu ztratí méně jednotek než před ním. Obrana proti raketám se vyplatí, když letadlo přežije minutu. Obklíčení se vyplatí, když kapse ubude polovina.

## Přes mnoho zápasů {#over-many-matches}

Souhrn každého zápasu (`src/mass/summarize.ts`, viz [Hromadná analýza](mass-analysis.md)) obsahuje malou sekci `maneuvers`: pro každý druh a stranu provedené (na úrovni Pravděpodobný nebo výš), vyplacené, nevyplacené, vyřazení a ztráty. **Hromadná analýza → Manévry** je sečte přes zápasy, které filtr ponechá: podle mapy a režimu, nebo přes všechny. Míru vyplacení ukazuje s Wilsonovým intervalem; řádek načte zápasy, ve kterých byl manévr proveden. Souhrny zapsané před vznikem této sekce ji nemají. Doplníte ji příkazem `node tools/3dheat-summarize.mjs <složka> --force`.

## Jak jistý si nástroj je {#how-sure-it-is}

Syntetické zápasy s naplánovanými manévry (`synth.ts`, spouští `maneuver.test.ts`): všech 28 naplánovaných druhů se najde na úrovni Pravděpodobný nebo výš. Z 50 nahlášených manévrů jich je 31 naplánovaného druhu a dalších 19 tam skutečně je (formace pohybující se skupiny, čelní přiblížení pronikající kolony). Žádný není špatně. Na 30 nulových zápasech – náhodné procházky odděleně i smíšeně, jednotky stojící náhodně, letadla na přímých úsecích, dav, který se pohybuje bez cíle – se na úrovni Pravděpodobný nebo výš nenahlásí nic.

Na skutečných datech (desítky pozemních bitev, několik dlouhých vzdušných misí, asi deset střeleckých zápasů): čelní útoky, boky, průniky a obklíčení v tankových bitvách, formace a blízké souboje ve vzduchu, obrany proti raketám, orbity bojové vzdušné hlídky a dvojice lead-trail ve vzdušných misích, čelní popravy, kolony a několik léček a střídavých dvojic ve střílečce. Prahy jsou tvary z doktríny v měřítku hry. Jednotlivý nález čtěte s jeho důkazy a míry z hromadné tabulky s jejich intervaly.

### Proti nulovým modelům týchž zápasů {#against-null-models-of-the-same-matches}

Detektor může oklamat terén a dav: v potyčce má každá skupina nepřátele dokola. Proto se každý druh spouští i na **nulových modelech** sestavených ze stejných zápasů (`nulls.ts`), kde se strany už nesetkávají tak jako dřív. Buď se časová osa jedné strany otočí o třetinu až dvě třetiny zápasu (*shift*), nebo se její trasy otočí kolem středu mapy (*rotate*). Označení týmů se zamíchají (*teams*, což z principu zachová asi polovinu skutečných bojů). Boje se počítají jen jako vyřazení spárovaná se smrtí: zabiják do 2 R a oběť na místě. Nulové modely to rozbijí. Nálezy na úrovni Pravděpodobný nebo výš, skutečné proti nulovým modelům (30 tankových bitev; 12 střeleckých zápasů):

| Druh | Tankové bitvy: skutečné / shift / rotate | Střílečka: skutečné / shift / rotate |
|---|---|---|
| Obklíčení | 0 / 0 / 0 (bylo 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Průlom | 0,03 / 0,02 / 0,05 (bylo 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Útok do boku | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Čelní útok | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Ústup | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (proto pěšky nikdy jistý) |
| Léčka | – | 0,17 / 0,04 / 0,04 |
| Energetický boj | 1,2 / 0,1 / 0,85 | – |
| Úhlový boj | 0,6 / 0,07 / 0,3 | – |

Blízké souboje ve vzduchu nad středem bojiště přežijí otočení kolem toho středu, takže sloupec rotate jim přeje méně než pozemním druhům. Druhy uvnitř jedné strany – formace, bojová vzdušná hlídka, krank, úderný svaz, SEAD, střídavý postup, zajištění – nezávisí na druhé straně a tímto způsobem se netestují. `maneuver.test.ts` ověřuje, že nulové modely ze syntetických zápasů odstraní naplánovaný útok do boku, kleště, obklíčení, průlom, léčku a ústup.

## Omezení {#limits}

- Skupiny potřebují pozice v čase. Soubor pouhých událostí žádné nemá.
- Směr čela se z dat nečte: čelo nepřítele je tam, kde se ho podpůrná síla zapojí do boje, jinak tam, kam se pohybuje, jinak tam, odkud přišel útočník.
- Terén se čte z výšek samotných jednotek (odvrácený svah). Test výhledu není.
- Velmi velké soubory se vzorkují většími kroky. Krátké vzdušné manévry v nich se přesto čtou z kroků 2–4 s.
