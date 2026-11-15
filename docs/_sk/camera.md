---
title: "Kamera a ovládanie"
nav_order: 14
has_children: true
lang: "sk"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera a ovládanie

Lietate scénou ako vták: **W A S D** na pohyb, ťahaním myši sa pozeráte. Na tejto stránke sa naučíte lietať, skočiť na pohľad zhora alebo z boku a zistiť presne, kde kamera je.

## Lietanie v 4 krokoch {#fly-in-4-steps}

1. Raz kliknite na zobrazenie, aby malo klávesnicu.
2. Držte **W**, aby ste leteli dopredu, **S** dozadu, **A** a **D** do strán, **Medzera** nahor, **Q** nadol.
3. Držte ľavé alebo pravé tlačidlo myši a ťahajte, aby ste sa rozzerali.
4. Stlačte **F**, aby sa všetky dáta znova zarámovali.

Kamera je voľne lietajúca kamera s perspektívnou a rovnobežnou projekciou, prednastavenými pohľadmi, zadanou polohou a hĺbkou ostrosti. Jej nastavenia sú na paneli **Kamera a scéna** dole na bočnom paneli (zobrazujú sa aj na kartách Analýza pretekov a Zápas). Implementácia je v [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Lietanie {#flying}

| Vstup | Účinok |
|---|---|
| `W` `A` `S` `D` alebo šípky | Dopredu (pozdĺž pohľadu, vrátane jeho sklonu), vľavo, dozadu, vpravo |
| `Medzera` alebo `E` | Nahor (svetovo nahor) |
| `Q` alebo ľavý `Ctrl` | Nadol |
| `Shift` (podržaný) | 6× rýchlejšie |
| ľavý `Alt` (podržaný) | 15 % rýchlosti |
| Ťahanie ľavým alebo pravým tlačidlom myši | Rozzeranie. Ukazovateľ je počas ťahania zamknutý. |
| Koliesko myši | Rýchlosť letu ×1,5 za zarážku (perspektíva); priblíženie (rovnobežná) |
| `F` | Zarámovať dáta |
| Kliknutie (bez ťahania) | Ukáže, čo je pod ukazovateľom ([Preskúmanie zobrazenia](#inspecting-the-view)) |
| `C` | Skopíruje polohu kamery, otočenie a sklon |
| `G` | Prejde na napísaný bod |
| `Esc` | Zavrie kartu výberu (a prestane sledovať jednotku) |

### Počas sledovania jednotky {#while-following-a-unit}

Keď kamera sleduje jednotku v prehrávaní ([Prehranie zápasu](match-replay.md)), kláves na lietanie robí niečo iné:

| Vstup | Účinok |
|---|---|
| Koliesko, `W` / `S` | Bližšie k jednotke / ďalej od nej (vyššie / nižšie v satelitnom pohľade) |
| `A` / `D`, `Q` / `E` | Obieha okolo jednotky (pohľady chase a orbit) |
| Ťahanie | Rozzerá sa okolo jednotky (kokpit: rozzerá sa vnútri) |
| `V` / `Shift+V` | Ďalší / predchádzajúci pohľad kamery |
| `Esc` | Najprv prestane pozerať na druhú jednotku, potom prestane sledovať |

Pohybové klávesy sa sčítajú s [gamepadom](gamepad.md); pre všetko ostatné pozri [referenciu klávesnice](keyboard-reference.md). Klávesy sa ignorujú, keď má fokus textové pole alebo rozbaľovací zoznam. Sklon je obmedzený tesne pod priamo hore a priamo dole.

## Panel Kamera a scéna {#camera--scene-panel}

![Panel Kamera a scéna: Projekcia, Prednastavené pohľady, tlačidlá Zorné pole, Rýchlosť letu a Poloha](../assets/img/en/camera-panel.webp)

### Projekcia {#projection}

**Projekcia**: *Perspektíva* (predvolené) alebo *Rovnobežná*.

*Rovnobežná* (ortografická) odstráni skrátenie, takže dve miesta s rovnakou hustotou sa javia ako rovnako veľké kdekoľvek v zábere - presne to porovnanie, na ktoré existuje heatmapa mapy - a práve vďaka nej je izometrický pohľad izometrický. V režime rovnobežnej projekcie koliesko myši priblížuje (nič dopredu nemení mierku) a [zobrazenie rýchlosti](#fly-speed) je skryté.

**Prepnutie zachová predmet rovnako veľký.** Rovnobežná projekcia nemá zorné pole, takže jej výška zarámovania nesúvisí so vzdialenosťou kamery; prepnutie naslepo buď prudko priblíži, alebo nič neukáže. Prechod na rovnobežnú nastaví výšku zarámovania na to, čo perspektívna kamera pokrýva na vzdialenosti zaostrenia (2 × vzdialenosť × tan(zorné pole / 2), pričom vzdialenosť zaostrenia je vzdialenosť posledného zarámovania). Návrat obnoví perspektívnu polohu, z ktorej ste odišli, v rovnakej zdanlivej mierke, a nie tam, kam sa rovnobežný pohľad medzitým dostal.

### Prednastavené pohľady {#preset-views}

| Skupina | Tlačidlá | Orientácia |
|---|---|---|
| **Izometria** | **SV**, **SZ**, **JV**, **JZ** | Rovnobežná, sklon -35,264° (= atan(1/√2), uhol, pri ktorom sa všetky tri osi premietajú na rovnakú dĺžku), otočenie -45°, 45°, -135°, 135°. Štyri rohy, lebo jeden vždy skryje polovicu mapy za tým, čo je bližšie. |
| **Pravouhlé pohľady** | **Zhora**, **Zdola**, **Spredu**, **Zozadu**, **Zľava**, **Sprava** | Rovnobežná. Zhora pozerá priamo nadol (sklon -89,9°), Zdola priamo nahor, Spredu pozdĺž -Z (otočenie 0°), Zozadu pozdĺž +Z (180°), Zľava pozdĺž -X (-90°), Sprava pozdĺž +X (90°). |
| | **Späť na perspektívu** | Návrat do perspektívnej polohy, z ktorej ste odišli. V perspektíve nedostupné. |
| | **Pohľad z troch štvrtín** | Perspektíva, otočenie -35°, sklon -28°. |

Každý prednastavený pohľad prepne samotnú projekciu - v perspektíve „pohľad zhora“ stále konverguje k úbežníku a rovnaké plochy prestanú vyzerať rovnako - a zarámuje dáta z tohto smeru.

### Zorné pole {#field-of-view}

**Zorné pole** - zvislý uhol. Predvolene 65°, 10-140° na lište (179° s rukoväťou), s tlačidlami **Ploché 20°**, **Dlhé 35°**, **Normálne 50°**, **Široké 65°**, **Veľmi široké 90°**. Úzke uhly sploštia perspektívu a viac pripomínajú rovnobežnú projekciu; široké uhly zveličujú hĺbku a vzdialenosti sa ťažko odhadujú. Zostáva živé aj v rovnobežnom režime, kde nastavuje mierku, na ktorú sa vracia prepnutie, a vzdialenosť, ktorú používa **Snímka**.

### Rýchlosť letu {#fly-speed}

**Rýchlosť letu** - svetové jednotky (metre) za sekundu pri plnom plyne. Predvolene 120; pri každom načítaní sa rovná vodorovnému rozsahu dát / 12. Logaritmická, 0,02-20 000 (200 000 s rukoväťou; rukoväť ju mení pomermi, nie sumami). Koliesko myši ju násobí alebo delí 1,5 za zarážku, v rozsahu 0,02-200 000.

Rovnaká hodnota sa zobrazuje v pravom dolnom rohu zobrazenia (len v perspektíve): rýchlosť v m/s alebo km/s a čas, za ktorý sa pri tejto rýchlosti prejde cez dáta (alebo level, keď je načítaný 3D level). Potiahnutím nahor alebo nadol zmeníte rýchlosť.

### Blízko a ďaleko {#near-and-far}

**Blízko** (predvolene 0,5) a **Ďaleko** (predvolene 40 000) sú vzdialenosti orezania. Obe sa pri každom načítaní prepočítajú z dát (blízko = max(0,05; rozsah / 20 000), ďaleko = rozsah × 12) a rozšíria, nikdy nezúžia, 3D levelom, ktorý je väčší ([Levely](levels.md#what-a-level-does-for-the-heat)). Ich pomer určuje presnosť hĺbky, na ktorej sa spolieha zakrývanie, takže malé blízko s veľkým ďaleko oslabí [zakrývanie](depth-and-culling.md). Pri pohľade zvonka scény alebo vysoko nad jej zemou sa skutočne použitá blízka rovina posunie na 2 % tej vzdialenosti, takže mapa videná z diaľky zachová dosť presnosti hĺbky, aby voda a pobrežie neblikali; políčko stále ukazuje nastavenú hodnotu.

### Ostatné ovládacie prvky {#other-controls}

| Ovládací prvok | Predvolene | Význam |
|---|---|---|
| **Invertovať Y** | vypnuté | Obráti rozzeranie myšou hore/dole. |
| **Hĺbka ostrosti** | vypnuté | Pozri nižšie. |
| **Gamepad** | zapnutý | Pozri [Gamepad a HOTAS](gamepad.md). |
| **Poloha** | | Pozri nižšie. |
| **Preskúmať** | | Údaj kamery, výber kliknutím, konvencia otočenia a *Prejsť na bod*; pozri [Preskúmanie zobrazenia](#inspecting-the-view). |
| **Snímka datasetu (F)** | | Prispôsobí dáta (na karte Analýza pretekov: kolá) zobrazeniu a zachová aktuálny smer. Kamera sa umiestni na r / tan(zorné pole / 2) od stredu, kde r je polovica uhlopriečky hraníc dát. |
| **Mriežka**, **Osi** | zapnuté, zapnuté | Zemná mriežka s rozstupom 1/2/5 × 10ⁿ okolo 1/40 rozpätia dát (siahajúca do 1,5 × dát, medzi 8 a 120 krokmi mriežky) a farebné osi. |
| **Invertovať os sveta** X, Y, Z | vypnuté | Pozri nižšie. |

### Poloha {#pose}

Päť poľí na čísla - **X**, **Y**, **Z** a **otočenie °**, **sklon °** - ktoré sledujú kameru, kým žiadne z nich nemá fokus. Napíšte hodnotu a stlačte `Enter` (alebo opustite pole), aby sa kamera presunula tam. **kopírovať** dá na schránku `pos X Y Z · yaw A · pitch B` (s `(game yaw)` za ním, keď je zvolená táto konvencia). Lietanie slúži na prieskum; súradnice slúžia na zopakovanie pohľadu. Sú to tie isté čísla ako [údaj kamery](#camera-readout): vlastné súradnice dát, aj keď je os obrátená, a otočenie vo zvolenej [konvencii](#yaw-conventions).

### Invertovať os sveta {#invert-world-axis}

**Invertovať os sveta X / Y / Z** kreslí svet s touto osou obrátenou. Hra, ktorá drží ľavotočivý svet, sa v tomto pravotočivom prehliadači zobrazí zrkadlovo - pravotočivé zákruty sa kreslia ako ľavotočivé - a obrátenie X alebo Z to vráti. **Mení sa len kreslenie**: dáta, analýza a každá súradnica, ktorú nástroje ukazujú (poloha, pravítko, rez), zostávajú vlastné hry. Pohľad sa obráti na mieste a ostane pozerať na to isté miesto. Toto nastavenie sa pamätá v prehliadači (kľúč `localStorage` `heat3d.mirror`); porovnajte [prevrátenia](axes-units-and-time.md#flips) pri načítaní, ktoré menia dáta.

## Preskúmanie zobrazenia {#inspecting-the-view}

Kde je kamera, čo je pod ukazovateľom a prechod na bod - blok **Preskúmať** na paneli Kamera a scéna a dva prekryvné údaje v ľavom hornom rohu zobrazenia. Kód je v [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) a [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Ovládací prvok | Predvolene | Význam |
|---|---|---|
| **Poloha kamery nad zobrazením** | zapnuté | Údaj kamery, nižšie. Zatvorí sa aj tlačidlom **×**. |
| **Kliknutie ukáže, čo tam je** | zapnuté | Výber kliknutím, nižšie. |
| **Konvencia otočenia** | Prehliadač | Aké otočenie zobrazuje a číta údaj, políčka polohy a políčko skoku. |

Tieto tri sa pamätajú v prehliadači (kľúč `localStorage` `heat3d.inspect`).

### Údaj kamery {#camera-readout}

V ľavom hornom rohu zobrazenia: **x**, **y**, **z**, **otočenie** a **sklon** kamery, živo, so značkou, ktorá pomenúva konvenciu otočenia. Zobrazuje tie isté čísla ako políčka [Poloha](#pose) a počas lietania nič nestojí (zapisuje sa na stránku v takte snímkov, bez prekresľovania panelov).

- **kopírovať** (alebo `C` kdekoľvek mimo textového poľa) dá na schránku `x X y Y z Z yaw A pitch B (viewer yaw)`, s desatinnými bodkami bez ohľadu na jazyk - riadok, ktorý políčko skoku a každý skript prečíta späť.
- **prejsť** (alebo `G`) otvorí pod ním políčko: vložte bod a stlačte `Enter`, aby ste sa naň pozreli, alebo vložte celú skopírovanú polohu, aby ste sa postavili do toho pohľadu. `Esc` políčko zavrie.

### Súradnice: vlastná sústava dát {#coordinates-the-datas-own-frame}

Každá súradnica, ktorú nástroje preskúmania ukazujú alebo prijmú, je v **vlastnej sústave načítaných dát**: [mapovanie osí](axes-units-and-time.md) pri načítaní (hore, prevrátenia, mierka) je vrátené späť. Poloha odčítaná z pohľadu je číslo, ktoré drží zdrojová tabuľka, a číslo z tabuľky napísané do políčka skoku pristane na tom mieste. Keď mapovanie nič nemení (načítanie s Y nahor bez mierky - čo zapisujú nástroje záznamu a exportéry levelov), je to jednoducho svet; inak údaj nesie značku **sústava dát**. Bez datasetu sú súradnice svetové. Otočenie a sklon sú vždy vzhľadom na svet diváka, Y nahor.

### Konvencie otočenia {#yaw-conventions}

| Konvencia | Otočenie 0° pozerá pozdĺž | Rastie smerom k | Používa |
|---|---|---|---|
| **Prehliadač** | -Z | -X | lietajúca kamera, [prednastavené pohľady](#preset-views) |
| **Hra / nástroje záznamu** | +X | -Z | stĺpce `yaw` a polohy nástrojov záznamu; v leveli exportovanom v sústave prehliadača je to vlastné otočenie hry |

Sklon je v oboch rovnaký: nahor od vodorovnej roviny. Obe sa líšia štvrtinovým otočením a ničím iným:

> otočenie prehliadača = otočenie hry - 90°

Smer `d` je `(cos p · cos y, sin p, -cos p · sin y)` v konvencii hry a `(-sin y · cos p, sin p, -cos y · cos p)` v konvencii prehliadača. Zvoľte **Hra / nástroje záznamu**, ak chcete napísať otočenie priamo z tabuľky záznamu, alebo ak chcete porovnať údaj s jedným takým.

### Prechod na bod {#going-to-a-point}

**Prejsť na bod**, v bloku Preskúmať (a v políčku **prejsť** údaja):

- textové pole prijme `x, y, z` alebo `x y z` (alebo `x; y; z`), s desatinnou bodkou alebo desatinnou čiarkou - `-321.6, 137.8, -59.9` a `-321,6 137,8 -59,9` sú ten istý bod. Päť čísel pridá otočenie a sklon a poloha skopírovaná z údaja alebo z políčok polohy sa prečíta celá, aj s označeniami a konvenciou;
- **otočenie °** a **sklon °** (voliteľné) otočia kameru vo zvolenej konvencii;
- **Pozrieť sa** zachová smer (ak sa pozeral vodorovne, naklonený tak, aby sa pozeral dole aspoň o 20°) a cúva pozdĺž neho na aktuálnu vzdialenosť, udržiavanú medzi 0,3 % a 3 % šírky scény - 6 až 60 m na dvoch kilometroch leveli. Vzdialenosť zaostrenia, výška rovnobežného pohľadu a rýchlosť letu nasledujú, takže pohľad je použiteľný hneď po príchode;
- **Postaviť sa sem** postaví kameru na bod, otočenú na zadané otočenie a sklon, alebo tak, ako bola.

Vložená poloha s vlastným otočením a sklonom vždy zaujme ten pohľad.

### Výber kliknutím {#click-to-pick}

Kliknutie na zobrazenie - stlačenie a uvoľnenie bez ťahania viac ako 4 pixely; ťahanie sa stále rozzerá - ukáže kartu v ľavom hornom rohu s tým, čo je pod ukazovateľom. Keď je [pravítko](measure.md) zapnuté, kliknutia idú pravítku.

**Nakreslený dátový bod vyhráva.** Najbližšia vzorka do 8 pixelov od kliknutia, spomedzi tých, ktoré sa skutočne kreslia: riadky v časovom okne a životnosti, prechádzajúce [filtrami](filters.md), zobrazenými skupinami a rozdelením rozdielu, vo vnútri orezania vzdialenosti a rezu, ktorý orezáva teplo. Pri prehrávaní v boxoch box pod ukazovateľom (kdekoľvek na ňom). Karta uvádza každý stĺpec, ktorý riadok nesie, pod vlastnými názvami stĺpcov zdroja - čas (nástenný čas, alebo vlastné sekundy súboru s `m:ss.ss`), osoba, skupina, relácia, každý zachovaný stĺpec, poloha a smer pohľadu - a vzdialenosť od kamery. V pamäti sú len stĺpce, ktoré načítanie zachovalo: stĺpec, ktorý nebol zvolený ako [stĺpec filtra](column-mapping.md), sa nezobrazí.

**Inak povrch levelu**: bod, kde lúč kliknutia zasiahne skutočné trojuholníky levelu (nie referenčnú rovinu pravítka), s **časťou**, ku ktorej patrí (názov od exportéra, `structure:props`, `ground:terrain …`), jej **druhom** (zem, objekt, voda, obrazová mapa), súradnicami a vzdialenosťou. Geometria skrytá rezom alebo orezaním vzdialenosťou sa preskočí. Keď level má [navigačnú sieť](model-levels.md#navigation-meshes), riadok ju pomenuje a povie, či miesto na nej leží (✓). Názov časti s predponou `≈` bol odhadnutý z ohraničujúcich kvádrov častí, lebo táto časť levelu bola pri načítaní zjednodušená.

Karta zostáva, kým ju nezavriete (**×**, `Esc`), ďalší klik neodpovie na niečo iné alebo kliknutie na prázdne miesto. V scéne sa na bode nakreslí tyrkysový kríž a na obrazovke nad ním kruh. Jej tlačidlá: **kopírovať** (každú hodnotu a súradnice ako `x, y, z`), **Pozrieť sa** a **Postaviť sa sem** (pri dátovom bode sa pozerá tak, ako sa pozeral riadok, keď má smer pohľadu; pri povrchu 1,7 m nad ním).

Level sa indexuje na výber pri prvom kliknutí, ktoré ho potrebuje: mriežka stĺpcov nad jeho pôdorysom, postavená po niekoľkých milisekundách medzi snímkami, aby sa pohľad nikdy nezastavil (asi sekunda práce pre level s niekoľkými miliónmi trojuholníkov), a uchovaná, kým sa level nezmení. Dovtedy karta hovorí *Pripravuje sa level na výber* s percentom a na klik odpovie, keď je pripravený. Hľadanie dátového bodu nad štyrmi miliónmi nakreslených riadkov sa rozloží na snímky rovnakým spôsobom.

## Hĺbka ostrosti {#depth-of-field}

Zbaliteľná sekcia v Kamera a scéna, s nadpisom *Hĺbka ostrosti - zapnutá*, keď je zapnutá. Predvolene vypnutá: je to efekt prezentácie a predvolený pohľad má ukazovať dáta, nie ich interpretáciu.

| Ovládací prvok | Predvolene | Rozsah (ťah) | Význam |
|---|---|---|---|
| **Zapnuté** | vypnuté | | |
| **Zaostriť na to, čo bolo zarámované** | zapnuté | | Zaostrenie na vzdialenosť, ktorú použilo posledné zarámovanie (*Zaostrené na N m.*). |
| **Vzdialenosť zaostrenia** | 1000 | 1-200 000, logaritmicky (10 000 000) | Zobrazí sa, keď je zaostrenie ručné. |
| **Clona** | ±35 % | ±2 % až ±200 %, logaritmicky (±3200 %) | Hĺbka, ktorá zostáva ostrá, ako zlomok vzdialenosti zaostrenia - relatívne, nie ako clonové číslo, lebo scény siahajú od miestnosti po osem kilometrov dlhú mapu. |
| **Maximálne rozmazanie** | 12 px | 1-48 (256) | Najväčší polomer rozmazania; náklady s ním rastú. |

Rozmazáva **level, mriežku a boxy** - *nie teplo*. Teplo v pixeli je súčet sprite-ov v mnohých hĺbkach, takže nemá jednu hĺbku, v ktorej by bolo mimo zaostrenia; rozmazať ho podľa geometrie, ktorá je za ním, by bolo nesprávne tam, kde sa vznáša pred ňou. Ostré dáta na zmäkčenom kontexte sú navyše z oboch užitočnejšie. Rozmazanie je zbieranie 24 vzoriek so zlatým uhlom v kompozitnom prechode, vážené tak, aby ostrý popredie nebolo roztiahnuté dozadu rozmazaným pozadím za ním. Zmena ho prekreslí bez reštartovania akumulácie tepla.

## Rozlíšenie plátna {#canvas-resolution}

Plátno sa vykresľuje v pomere pixelov displeja, najviac 2. Vyrovnávacia pamäť tepla sa môže vykresľovať v nižšom rozlíšení, než je toto ([Rozlíšenie tepla](performance-and-stats.md)).

## Stránky v tejto sekcii {#pages-in-this-section}

- [Gamepad a HOTAS](gamepad.md)
- [Referencia klávesnice a myši](keyboard-reference.md)
