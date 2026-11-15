---
title: "Taktická tabuľa"
nav_order: 15
has_children: true
lang: "sk"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Taktická tabuľa

Karta **Taktika** je kresliace tabuľa pre tímový plán: na mapu dáte malé figúrky, nakreslíte šípky, kam majú ísť, a stlačením prehrávania uvidíte, ako sa to stane. Použite ju na naplánovanie kola alebo útoku ešte pred hrou. Plátno, kameru a [level](levels.md) zdieľa s ostatnými kartami a nič iné; plán nie sú dáta a nekreslí žiadne teplo.

## Váš prvý plán {#your-first-plan}

1. Otvorte kartu **Taktika**. Vyberte **Hra** (napríklad Counter-Strike 2) a pre Valorant stlačte **Načítať mapy Valorantu** a vyberte **Mapu**. Alebo najprv načítajte [level](levels.md).
2. Vyberte **Stranu** (určuje farbu) a stlačte **Pohľad zhora**.
3. Vyberte **Miesto**, vyberte figúrku v **Figúrky** (pomocou **Hľadať figúrky** ju nájdete) a kliknite na mapu. Umiestnite dve alebo tri.
4. Vyberte **Šípka**, kliknite na figúrku, kliknite pozdĺž cesty, ktorou má ísť, a stlačte **Enter** na ukončenie šípky.
5. Stlačte **+** pod pohľadom, aby ste pridali krok 2. Každá figúrka začína tam, kde skončila jej šípka. Nakreslite ďalšie šípky.
6. Stlačte **▶** (alebo `K`), aby sa plán prehral od zobrazeného kroku do konca.
7. Pomenujte plán v **Názov plánu** a stlačte **Uložiť**.

![Karta Taktika v pohľade zhora: hra, strany a nástroje vľavo, tri figúrky so šípkami Posunúť, oblúk hodu dymovej pomôcky, oblasť a kroky dole](../assets/img/en/tactics.webp)

## Začiatok plánu {#starting-a-plan}

| Ovládač | Čo robí |
|---|---|
| **Hra** | Vyberie strany a figúrky, ktoré ponúka paleta: Counter-Strike 2 (T, CT; hráči a pomôcky), Valorant (Útok, Obrana; hráči a všeobecné schopnosti), Battlefield, Squad, Arma (pechota, pozemné vozidlá, lietadlá, lode), DCS / War Thunder / IL-2 (prúdové lietadlá, vrtuľové lietadlá, vrtuľníky, protivzdušná obrana, pozemné, lode, zbrane) a Iné. Plán, ktorý už figúrky má, si pri zmene hry ponechá svoje strany. |
| **Názov plánu** | Názov, pod ktorým sa plán uloží. |
| **Mapa**, **Načítať mapy Valorantu** | Pri zvolenom Valorante: **Načítať mapy Valorantu** získa zoznam máp z [valorant-api.com](https://valorant-api.com); **Mapa** potom položí minimapu zvolenej mapy ako level, zarámovanú zhora. Obrázok sa stiahne pri výbere a nikdy sa nedodáva. Oznámenie Riot sa zobrazuje, kým je na obrazovke (pozri nižšie). |
| **Strana** | Strana, ku ktorej patrí ďalšia figúrka, šípka alebo oblasť; prevezme farbu strany. |

Bez levelu je tabuľa plochá rovina zeme. Načítajte level v **Level**, ak chcete plánovať na skutočnej mape: mapu CS2 exportovanú nástrojom CS2, level z knižnice alebo obrázok mapy.

## Nástroje {#tools}

| Nástroj | Klik | Poznámky |
|---|---|---|
| **Vybrať** | Figúrka, bod trasy, šípka, oblasť alebo poznámka ju vyberie. | Shift+klik pridá alebo odoberie; Shift+ťahanie nakreslí rámček okolo toho, čo sa má pridať. Výber dostane transformačný gizmo (pozri nižšie); `Delete` alebo `Backspace` ho odstránia. `M` presunie vybranú figúrku na ďalší klik. |
| **Miesto** | Položí zvolenú figúrku. | Figúrka sa vyberá v palete **Figúrky** (s **Hľadať figúrky**). Keď nič nie je vybrané, `R` otočí ďalšiu figúrku o 15° pred jej umiestnením (`Shift+R` opačným smerom). |
| **Šípka** | Každý klik pridá bod; Enter, dvojklik alebo pravý klik ju ukončí, Esc ju zahodí. | **Posunúť**, **Útok** (širšia hlava) alebo **Sledovanie** (tenká čiara vo výške očí). Šípka začatá na figúrke je trasa tejto figúrky v tomto kroku: pri prehrávaní ju figúrka prejde a ďalší krok začne tam, kde skončila. |
| **Hod** | Hádzajúci, potom kam pristane. | Prerušovaný oblúk medzi nimi a zvolená pomôcka (dym, záblesk, molotov, ...) sa objaví tam, kde pristane, a od tohto kroku ostáva. |
| **Oblasť** | Stred, potom okraj. | Kotúč vo farbe strany. |
| **Poznámka** | Kam poznámka patrí; pýta jej text. | Zobrazí sa ako špendlík a nad ním jej text. |
| **Zmazať** | Figúrka, šípka, oblasť alebo poznámka. | Odstráni ju od tohto kroku; v jej prvom kroku ju odstráni úplne. |

**Späť** a **Znova** (`Ctrl+Z`; `Ctrl+Y` alebo `Ctrl+Shift+Z`) prechádzajú každou zmenou. Riadok pod plánom ukazuje, koľko má figúrok, šípok a krokov. **Pohľad zhora** pozerá priamo dole (ortogonálne), **3D pohľad** vráti perspektívu, **Snímka** zarámuje plán, alebo level, keď je plán prázdny.

**Veľkosť figúrok** mení mierku každej figúrky na tabuli; 1× je skutočná veľkosť, čo z veľkej výšky znamená pre osobu niekoľko pixelov.

## Presúvanie, otáčanie a mierka {#moving-turning-and-scaling}

Všetko na tabuli sa dá presúvať ako v 3D editore: figúrky, pomôcky, značky, jednotlivé body trasy a celé šípky, oblasti a poznámky. Vybrané dostane gizmo v strede:

| Režim | Klávesy | Úchyty |
|---|---|---|
| **Posunúť** | W (alebo G) | Šípka na každú os (X červená, Y zelená a nahor, Z modrá) posúva pozdĺž nej; štvorec sa posúva v rovine; stred sa posúva po leveli pod kurzorom. |
| **Otočiť** | E (alebo R) | Krúžok na každú os sa otáča okolo nej. Krúžky jednej figúrky sú jej vlastné natočenie, sklon a náklon; skupina sa otáča okolo osí sveta okolo svojho stredu. |
| **Mierka** | R (alebo S) | Rozťahuje alebo zhŕňa výber od svojho stredu pozdĺž osi alebo na všetky strany; polomer oblasti rastie spolu s ním. |

**Klávesy** prepínajú medzi W / E / R (Unity, Unreal) a G / R / S (Blender); klávesy vyberú režim len vtedy, keď je niečo vybrané, inak lietajú kamerou. Takže `R` znamená **Mierka** pri klávesách W / E / R a **Otočiť** pri klávesách G / R / S, keď je niečo vybrané, a keď nič nie je, otočí ďalšiu figúrku na umiestnenie. Všetky klávesy tabule sú v [referencii klávesnice](keyboard-reference.md#tactics-board). Podržaním **Ctrl** počas ťahania prichytíte presun na **Mriežku** (metre) alebo otočenie na **Krok uhla**. **Prichytiť k zemi** (predvolene zapnuté) položí presúvané ľudí, vozidlá, značky, body trasy a oblasti na povrch levelu; lietadlá a vrtuľníky si zachovajú výšku a ťahanie pozdĺž šípky Y sa nikdy neprichytí. Ťahanie úchytu nikdy nepohne kamerou. **Esc** zruší ťahanie a každá zmena je jeden krok Späť.

Body trasy sa zobrazia ako bodky na šípkach zobrazeného kroku: kliknutím ich vyberiete, ťahaním presuniete, Delete ich odstráni. Sekcia **Vybrané** ukazuje miesto výberu v metroch, natočenie, sklon a náklon figúrky v stupňoch a polomer oblasti, každé možné prepísať.

## Časovanie {#timing}

Trasa figúrky je časovaná: každý úsek trvá svoju dĺžku nad leveľom - vzorkovanú na povrchu každých pár metrov, takže kopec alebo schodisko medzi dvoma bodmi sa počíta - rýchlosťou jej **režimu** pohybu v danej hre, plus prípadné **čakanie** na bode trasy. Pechota sa plazí, drepí, kráča (potichu), beží alebo šprintuje; vozidlá a lode sa plazia, idú opatrne, normálne alebo sa ponáhľajú; lietadlá a vrtuľníky lietajú pomaly, cestovnou rýchlosťou, bojovou rýchlosťou alebo maximálnou. Režim, ktorý hra nemá (CS2 nemá šprint), zoberie najbližší, ktorý má. Ako svah spomaľuje, závisí od hry: v CS2 a Valorante sa počíta len vodorovná vzdialenosť, ako v hrách; military simulátory spomaľujú pechotu do kopca (Toblerova funkcia chôdze) a vozidlá podľa sklonu.

Rýchlosti pochádzajú z tabuliek pre jednotlivé hry so zdrojmi (pozri [Rýchlosti pohybu](tactics-speeds.md)): CS2 podľa držanej zbrane, z definícií zbraní hry; Valorant podľa zbrane; Battlefield, Squad, Arma a vzdušné hry podľa typu a triedy vozidla. **Pohybuje sa ako** vyberie profil figúrky (zbraň, typ vozidla); **Vlastná (m/s)** prepíše ľubovoľný režim pre danú figúrku. Režimy sa volajú tak, ako ich tabuľa zobrazuje: *Plazenie*, *Drep*, *Chôdza (potichu)*, *Beh*, *Šprint*; *Opatrne*, *Normálne*, *Ponáhľať sa*; *Pomaly*, *Cestovná*, *Bojová*, *Maximálna*.

Každý bod trasy ukazuje čas od posledného a čas od začiatku plánu („+3,9 s · 0:12“). Trasa vybranej figúrky vypíše každý úsek s jeho režimom, dĺžkou a časom, čakaním a príchodom. **Príchody** pod **Časovanie** dá každú figúrku s trasou na jednu časovú os, prvý príchod hore. S **Prehrať v reálnom čase** (predvolene zapnuté) krok trvá, kým nedorazí jeho najpomalšia trasa, a každá figúrka sa pohybuje vlastnou rýchlosťou; **Sekundy** je potom najkratšia dĺžka kroku. **Jednotiek úrovne na meter** hovorí, v akých jednotkách je level: 39,37 pre mapy CS2 (herné jednotky), 1 pre mapy v metroch.

## Porovnanie s dátami zápasov {#compare-with-match-data}

**Načítať súbory zápasov…** prečíta tabuľky zápasov CS2 pre mapu (súbory Parquet z nástroja CS2, koľko len chcete; iba potrebné stĺpce, na pozadí); **Použiť načítané dáta** vezme dáta načítané v prehliadači. Potom:

- **Najskorší príchod na mape** sfarbí mapu podľa času od začiatku kola, kedy hráč prvýkrát dosiahol každé miesto - tlačidlo **Najrýchlejší** ukáže najrýchlejší zo všetkých kôl, **Typický (medián)** stredné kolo - zelená skoro, červená neskoro, pre jednu stranu alebo obe. Ukazuje, čo je možné a kedy.
- Vybraná trasa sa porovnáva s tým, čo hráči dosiahli od jej začiatku (alebo od začiatku kola) po jej koniec, každý koniec je kotúč nastaveného polomeru: „Najrýchlejšie pozorované 14,2 s, p10 15,0 s, medián 18,3 s z 41 behov; váš plán 15,1 s“.
- Rýchlosti, akými sa hráči naozaj pohybovali - beh, chôdza, drep, zo stĺpcov chôdze a skrčenia v tabuľkách - v m/s.

## Kroky {#steps}

Lišta pod pohľadom obsahuje kroky. Plán začína jedným; **+** pridá ďalší, a každá figúrka v ňom začína tam, kde skončila jej trasa v poslednom kroku; **−** odstráni zobrazený. **Sekundy** je, ako dlho zobrazený krok trvá pri prehrávaní. **▶** (K) prehrá od zobrazeného kroku do konca: figúrky s trasou ju prejdú, figúrky presunuté na nové miesto v ďalšom kroku tam sklznú, ostatné stoja. Kým je krok zobrazený, miesto každej figúrky v ďalšom kroku sa kreslí ako slabý duch a šípky posledného kroku sa slabo kreslia pod šípkami tohto.

## Ukladanie {#saving}

Sekcia **Súbor** obsahuje **Uložiť**, **Úvod** a **Vymazať**. **Uložiť** zapíše plán ako `<názov>.h3dplan.json` (obyčajný JSON: strany, kroky, figúrky s miestom v každom kroku, šípky, oblasti, poznámky); **Úvod** ho načíta späť. Súbor inej verzie alebo súbor, ktorý nie je plánom, sa odmietne s dôvodom. **Vymazať** plán vyprázdni; Späť ho vráti.

## Figúrky {#figures}

Každú figúrku vytvára samotný prehliadač: jednoduché tvary podľa zverejnenej veľkosti typu, s vlastnosťami, ktoré ju odlišujú od susedov - cestné kolesá a veža tanku, delá, rakety a radary vozidla protivzdušnej obrany, pôdorys krídla, chvost a motory lietadla, rotory a krátke krídla vrtuľníka. Nič sa neberie z hry. Dizajn, ktorý hra vymyslela, sa zobrazí ako všeobecná figúrka svojej triedy. Ako dáta nájdu svoju figúrku, pozri [Figúrky](figures.md#which-figure-a-unit-gets).

## Oznámenie Riot {#riots-notice}

Mapy Valorantu sa zobrazujú podľa zásad Riot Games „Legal Jibber Jabber“, ktoré dovoľujú bezplatným komunitným projektom ich používať a žiadajú toto oznámenie všade, kde sa objavia: *3DHeat bol vytvorený podľa zásad Riot Games „Legal Jibber Jabber“ s použitím aktív vlastnených spoločnosťou Riot Games. Riot Games tento projekt neschvaľuje ani nesponzoruje.* Schopnosti na tabuli sú všeobecné tvary, nie umenie Riot.
