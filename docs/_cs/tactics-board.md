---
title: "Taktická tabule"
nav_order: 12
has_children: true
lang: "cs"
source: "tactics-board.md"
source_hash: "e89ef050b0f2"
translated: true
outdated: false
---

# Taktická tabule

Záložka **Taktika** je kreslicí tabule pro plán týmu: na mapu dáte malé figury, nakreslíte šipky, kam mají jít, a stisknete přehrávání, abyste viděli, jak se to odehraje. Slouží k plánování kola nebo útoku dřív, než hrajete. Plátno, kameru a [úroveň](levels.md) sdílí s ostatními záložkami a nic dalšího; plán není data a nekreslí žádné teplo.

## Váš první plán {#your-first-plan}

1. Otevřete záložku **Taktika**. Vyberte **Hru** (například Counter-Strike 2) a u Valorantu stiskněte **Načíst mapy Valorantu** a vyberte **Mapu**. Nebo nejdřív načtěte [úroveň](levels.md).
2. Vyberte **Stranu** (určí barvu) a stiskněte **Pohled shora**.
3. Zvolte **Místo**, vyberte figuru v **Figury** (pro nalezení použijte **Hledat figury**) a klikněte na mapu. Umístěte dvě nebo tři.
4. Zvolte **Šipka**, klikněte na figuru, klikněte podél cesty, kterou má jít, a stiskněte **Enter**, čímž šipku ukončíte.
5. Stiskněte **+** pod pohledem a přidejte krok 2. Každá figura začíná tam, kde skončila její šipka. Nakreslete tam další šipky.
6. Stiskněte **▶** (nebo `K`) a plán se přehraje od zobrazeného kroku až do konce.
7. Pojmenujte plán v **Název plánu** a stiskněte **Uložit**.

![Záložka Taktika v pohledu shora: hra, strany a nástroje vlevo, tři figury se šipkami Posunout, oblouk hodu kouřové granáty, oblast a kroky podél spodního okraje](../assets/img/cs/tactics.webp)

## Začátek plánu {#starting-a-plan}

| Ovládací prvek | Co dělá |
|---|---|
| **Hra** | Určí strany a figury, které paleta nabízí: Counter-Strike 2 (T, CT; hráči a pomůcky), Valorant (Útok, Obrana; hráči a obecné schopnosti), Battlefield, Squad, Arma (pěchota, pozemní vozidla, letadla, lodě), DCS / War Thunder / IL-2 (proudová letadla, vrtulová letadla, vrtulníky, protivzdušná obrana, pozemní, lodě, zbraně) a Jiné. Plán, který už figury má, si při změně hry ponechá své strany. |
| **Název plánu** | Jméno, pod kterým se plán uloží. |
| **Mapa**, **Načíst mapy Valorantu** | Při zvoleném Valorantu: **Načíst mapy Valorantu** stáhne seznam map z [valorant-api.com](https://valorant-api.com); **Mapa** pak položí minimapu zvolené mapy jako úroveň, zarámovanou shora. Obrázek se stáhne při výběru a nikdy se neposílá s prohlížečem. Oznámení Riotu se zobrazuje, dokud je na obrazovce (viz níže). |
| **Strana** | Strana, které patří další figura, šipka nebo oblast; převezme barvu strany. |

Bez úrovně je tabule rovná zemská plocha. Plánovat na skutečné mapě můžete načtením úrovně v části **Úroveň**: mapa CS2 exportovaná nástrojem pro CS2, úroveň z knihovny, nebo obrázek mapy.

## Nástroje {#tools}

| Nástroj | Klik | Poznámky |
|---|---|---|
| **Vybrat** | Figura, bod trasy, šipka, oblast nebo poznámka se označí. | Shift+klik přidá nebo odebere; Shift+tažení nakreslí rámeček kolem toho, co přidat. Výběr dostane úchyty pro transformaci (viz níže); `Delete` nebo `Backspace` ho odstraní. `M` posune vybranou figuru k dalšímu kliknutí. |
| **Místo** | Položí zvolenou figuru. | Figura se vybírá v paletě **Figury** (s **Hledat figury**). Když nic není vybráno, `R` otočí další figuru o 15° dřív, než je položena (`Shift+R` opačným směrem). |
| **Šipka** | Každý klik přidá bod; Enter, dvojklik nebo pravý klik ji ukončí, Esc ji zahodí. | **Posunout**, **Útok** (širší hrot) nebo **Sledování** (tenká čára ve výšce očí). Šipka začatá na figuře je trasou té figury v tomto kroku: při přehrání po ní figura jde a další krok začíná tam, kde skončila. |
| **Hod** | Hazeč, pak místo dopadu. | Čárkovaný oblouk z jednoho do druhého a zvolená pomůcka (kouř, záblesk, molotov, ...) se objeví tam, kde dopadne, a od tohoto kroku tam zůstane. |
| **Oblast** | Střed, pak okraj. | Kotouč v barvě strany. |
| **Poznámka** | Kam poznámka patří; vyžádá si její text. | Zobrazí se jako špendlík a nad ním její text. |
| **Smazat** | Figura, šipka, oblast nebo poznámka. | Odstraní ji od tohoto kroku dál; v jejím prvním kroku ji odstraní úplně. |

**Zpět** a **Znovu** (`Ctrl+Z`; `Ctrl+Y` nebo `Ctrl+Shift+Z`) procházejí každou změnu. Řádek pod plánem ukazuje, kolik má figur, šipek a kroků. **Pohled shora** se dívá kolmo dolů (ortogonální), **3D pohled** se vrátí k perspektivě, **Snímek** zarámuje plán, nebo úroveň, je-li plán prázdný.

**Velikost figur** mění měřítko všech figur na tabuli; 1× je skutečná velikost, která je z velké výšky pro člověka několik pixelů.

## Posouvání, otáčení a měřítko {#moving-turning-and-scaling}

Vše na tabuli se dá posouvat jako v 3D editoru: figury, pomůcky, značky, jednotlivé body trasy i celé šipky, oblasti a poznámky. Co je vybráno, dostane ovladač uprostřed:

| Režim | Klávesy | Úchyty |
|---|---|---|
| **Posunout** | W (nebo G) | Šipka pro každou osu (X červená, Y zelená a nahoru, Z modrá) posouvá podél ní; čtverec posouvá v její rovině; střed se posouvá po úrovni pod ukazatelem. |
| **Otočit** | E (nebo R) | Kruh pro každou osu se otáčí kolem ní. Kruhy jedné figury jsou její vlastní natočení, sklon a náklon; skupina se otáčí kolem os světa kolem svého středu. |
| **Měřítko** | R (nebo S) | Roztáhne nebo stáhne výběr od svého středu podél osy nebo všemi směry; poloměr oblasti s ním roste. |

**Klávesy** přepínají mezi W / E / R (Unity, Unreal) a G / R / S (Blender); klávesy vybírají režim jen tehdy, když je něco vybrané, jinak létají kamerou. Takže `R` znamená **Měřítko** s klávesami W / E / R a **Otočit** s klávesami G / R / S, když je něco vybrané, a když nic vybrané není, otočí další figuru k položení. Všechny klávesy tabule jsou v [referenci klávesnice](keyboard-reference.md#tactics-board). Při tažení podržte **Ctrl**, aby se posun přichytil k **Mřížce** (metry), nebo otočení k **Kroku úhlu**. **Přichytit k zemi** (ve výchozím stavu zapnuto) položí posunuté lidi, vozidla, značky, body trasy a oblasti na povrch úrovně; letadla a vrtulníky si zachovají výšku a tažení podél šipky Y se nikdy nepřichytí. Tažení úchytem kameru nikdy nehýbe. **Esc** tažení zruší a každá změna je jeden krok Zpět.

Body trasy se ukazují jako tečky na šipkách zobrazeného kroku: kliknutím je vyberete, tažením posunete, klávesou Delete odstraníte. Sekce **Vybrané** ukazuje místo výběru v metrech, natočení, sklon a náklon figury ve stupních a poloměr oblasti, každé se dá upsat.

## Časování {#timing}

Trasa figury je časovaná: každý úsek trvá tolik, kolik je jeho délka přes úroveň – vzorkovaná na povrchu každé pár metrů, takže se počítá kopec nebo schodiště mezi dvěma body – rychlostí jejího pohybového **režimu** pro danou figuru v dané hře, plus jakékoli **čekání** u bodu trasy. Pěchota se plazí, přikrčí, jde (tiše), běží nebo sprintuje; vozidla a lodě se plazí, jedou opatrně, normálně nebo spěchají; letadla a vrtulníky letí pomalu, cestovní rychlostí, bojovou rychlostí nebo maximální. Režim, který hra nemá (CS2 nemá sprint), vezme nejbližší, který má. Jak svah zpomaluje, závisí na hře: v CS2 a Valorantu se počítá jen vodorovná vzdálenost, jako ve hrách; vojenské simulace zpomalují pěchotu do kopce (Toblerova funkce chůze) a vozidla podle sklonu.

Rychlosti pocházejí z tabulek pro každou hru se zdroji (viz [Rychlosti pohybu](tactics-speeds.md)): CS2 podle držené zbraně, z herních definic zbraní; Valorant podle zbraně; Battlefield, Squad, Arma a letecké hry podle typu a třídy vozidla. **Pohybuje se jako** vybere profil figury (zbraň, typ vozidla); **Vlastní (m/s)** přepíše libovolný režim pro danou figuru. Režimy se jmenují tak, jak je tabule ukazuje: *Plazení*, *Přikrčení*, *Chůze (tiše)*, *Běh*, *Sprint*; *Opatrně*, *Normálně*, *Spěchat*; *Pomalu*, *Cestovní*, *Boj*, *Maximum*.

Každý bod trasy ukazuje čas od posledního bodu a čas od začátku plánu („+3,9 s · 0:12“). Trasa vybrané figury vypisuje každý úsek s jeho režimem, délkou a časem, čekání a příjezd. **Příchody** pod **Časomírou** postaví každou routovanou figuru na jednu časovou osu, první příjezd nahoře. Při **Přehrát v reálném čase** (ve výchozím stavu zapnuto) krok trvá, dokud nedorazí nejpomalejší trasa, a každá figura se pohybuje svou vlastní rychlostí; **Sekundy** jsou pak nejkratší délkou kroku. **Jednotek úrovně na metr** říká, v čem je úroveň: 39,37 pro mapy CS2 (herní jednotky), 1 pro mapy v metrech.

## Porovnání s daty zápasů {#compare-with-match-data}

**Načíst soubory zápasů…** načte tabulky zápasů CS2 pro danou mapu (soubory Parquet z nástroje pro CS2, kolik chcete; jen potřebné sloupce, na pozadí); **Použít načtená data** vezme data načtená v prohlížeči. Pak:

- **Nejdřívější příchod na mapě** obarví mapu podle času od začátku kola, kdy hráč poprvé dosáhl každého místa – tlačítko **Nejrychlejší** ukáže nejrychlejší přes všechna kola, **Typický (medián)** prostřední kolo – od zelené na začátku po červenou na konci, pro jednu stranu nebo obě. Ukazuje, co je možné a kdy.
- Vybraná trasa se porovná s tím, čeho hráči dosáhli od jejího začátku (nebo od začátku kola) do jejího konce, přičemž každý konec je kotouč daného poloměru: „Nejrychlejší pozorovaný 14,2 s, p10 15,0 s, medián 18,3 s z 41 pokusů; váš plán 15,1 s“.
- Rychlosti, kterými se hráči skutečně pohybovali – běh, chůze, přikrčení, z tabulkových sloupců chůze a přikrčení – v m/s.

## Kroky {#steps}

Lišta pod pohledem obsahuje kroky. Plán začíná jedním; **+** přidá další, a každá figura v něm začíná tam, kde skončila její trasa v posledním kroku; **−** odstraní zobrazený. **Sekundy** ukazují, jak dlouho zobrazený krok trvá při přehrání. **▶** (K) přehraje od zobrazeného kroku do konce: figury s trasou po ní jdou, figury přesunuté na nové místo v dalším kroku tam sklouznou, ostatní stojí. Když je krok zobrazen, místo každé figury v dalším kroku se kreslí jako bledý přízrak a šipky posledního kroku slabě pod šipkami tohoto.

## Ukládání {#saving}

Sekce **Soubor** obsahuje **Uložit**, **Otevřít** a **Vymazat**. **Uložit** zapíše plán jako `<name>.h3dplan.json` (prostý JSON: strany, kroky, figury s místem v každém kroku, šipky, oblasti, poznámky); **Otevřít** ho načte zpět. Soubor jiné verze nebo soubor, který není plánem, se odmítne s důvodem. **Vymazat** plán vyprázdní; Zpět ho vrátí.

## Figury {#figures}

Každou figuru staví sám prohlížeč: jednoduché tvary v publikované velikosti daného typu, s rysy, podle kterých se liší od sousedních – kolečka a věž tanku, zbraně, rakety a radary protivzdušného vozidla, půdorys křídla, ocasní plochy a motory letadla, rotory a krátká křídla vrtulníku. Nic se nepřebírá z žádné hry. Design, který si hra vymyslela, se zobrazí jako obecná figura své třídy. Jak data najdou svou figuru, viz [Figury](figures.md#which-figure-a-unit-gets).

## Oznámení Riotu {#riots-notice}

Mapy Valorantu se zobrazují podle zásad Riot Games „Legal Jibber Jabber“, které dovolují volným komunitním projektům je používat a žádají toto oznámení všude, kde se objeví: *3DHeat vznikl podle zásad Riot Games „Legal Jibber Jabber“ s použitím aktiv vlastněných společností Riot Games. Riot Games tento projekt neschvaluje ani nesponzoruje.* Schopnosti na tabuli jsou obecné tvary, ne umění Riotu.
