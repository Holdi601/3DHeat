---
title: "Kamera a ovládání"
nav_order: 14
has_children: true
lang: "cs"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera a ovládání

Létáte scénou jako pták: **W A S D** pro pohyb, tažením myši se rozhlížíte. Na této stránce se naučíte létat, přeskočit na pohled shora nebo z boku a přečíst si, kde přesně kamera je.

## Létání ve 4 krocích {#fly-in-4-steps}

1. Jednou klikněte na zobrazení, aby mělo klávesnici.
2. Držte **W** pro let vpřed, **S** dozadu, **A** a **D** do stran, **Space** nahoru, **Q** dolů.
3. Držte levé nebo pravé tlačítko myši a tažením se rozhlížejte.
4. Stiskněte **F**, aby se všechna data znovu vešla do záběru.

Kamera je volná letová kamera s perspektivní a rovnoběžnou projekcí, předvolenými pohledy, zadanou polohou a hloubkou ostrosti. Její nastavení je v panelu **Kamera a scéna** dole v postranním panelu (zobrazuje se také na kartách Analýza závodu a Zápas). Implementace je v [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Létání {#flying}

| Vstup | Účinek |
|---|---|
| `W` `A` `S` `D` nebo šipky | Vpřed (podle pohledu, včetně jeho sklonu), vlevo, vzad, vpravo |
| `Space` nebo `E` | Nahoru (nahoru ve světě) |
| `Q` nebo levý `Ctrl` | Dolů |
| `Shift` (držený) | 6× rychleji |
| levý `Alt` (držený) | 15 % rychlosti |
| Tažení levým nebo pravým tlačítkem myši | Rozhlížení. Při tažení je ukazatel zamčený. |
| Kolečko myši | Rychlost letu ×1,5 za každé cvaknutí (perspektiva); přiblížení (rovnoběžná) |
| `F` | Zarámovat data |
| Klik (bez tažení) | Ukáže, co je pod ukazatelem ([Prohlížení pohledu](#inspecting-the-view)) |
| `C` | Zkopíruje polohu kamery, stáčení a sklon |
| `G` | Přejde na zadaný bod |
| `Esc` | Zavře kartu výběru (a přestane sledovat jednotku) |

### Při sledování jednotky {#while-following-a-unit}

Když kamera sleduje jednotku v přehrání ([Přehrání zápasu](match-replay.md)), klávesy pro let dělají něco jiného:

| Vstup | Účinek |
|---|---|
| Kolečko, `W` / `S` | Blíž k jednotce / dál od ní (výš / níž v satelitním pohledu) |
| `A` / `D`, `Q` / `E` | Obíhání kolem jednotky (pohledy Zezadu a Orbita) |
| Tažení | Rozhlížení kolem jednotky (v kokpitu rozhlížení uvnitř) |
| `V` / `Shift+V` | Další / předchozí pohled kamery |
| `Esc` | Nejprve přestane sledovat druhou jednotku, pak přestane sledovat úplně |

Pohybové klávesy se sčítají s [gamepadem](gamepad.md). Všechno ostatní najdete v [přehledu klávesnice](keyboard-reference.md). Klávesy se ignorují, když má fokus textové pole nebo rozbalovací seznam. Sklon je omezen těsně pod přímým pohledem nahoru a dolů.

## Panel Kamera a scéna {#camera--scene-panel}

![Panel Kamera a scéna: Projekce, Předvolené pohledy, tlačítka Zorné pole, Rychlost letu a Poloha](../assets/img/en/camera-panel.webp)

### Projekce {#projection}

**Projekce**: *Perspektiva* (výchozí) nebo *Rovnoběžná*.

*Rovnoběžná* (ortografická) odstraní zkracování, takže dvě horká místa o stejné hustotě vypadají stejně velká kdekoli v záběru. Právě to porovnání má teplotní mapa podporovat, a díky tomu je izometrický pohled izometrický. V rovnoběžném režimu kolečko myši přibližuje (neexistuje pohyb vpřed, který by měnil měřítko) a [ukazatel rychlosti](#fly-speed) je skrytý.

**Přepnutí zachová stejnou velikost předmětu.** Rovnoběžná projekce nemá zorné pole, takže její výška záběru nesouvisí se vzdáleností kamery. Pouhé přepnutí by buď prudce přiblížilo, nebo nic neukázalo. Přechod na rovnoběžnou nastaví výšku záběru na to, co perspektivní kamera pokrývá v zaostřovací vzdálenosti (2 × vzdálenost × tan(fov / 2); zaostřovací vzdálenost je vzdálenost při posledním zarámování). Návrat obnoví perspektivní polohu, ze které jste odešli, se stejným zdánlivým měřítkem, a ne tam, kam se rovnoběžný pohled zatoulal.

### Předvolené pohledy {#preset-views}

| Skupina | Tlačítka | Orientace |
|---|---|---|
| **Izometrie** | **SV**, **SZ**, **JV**, **JZ** | Rovnoběžná, sklon -35,264° (= atan(1/√2), úhel, při kterém se všechny tři osy promítnou se stejnou délkou), stáčení -45°, 45°, -135°, 135°. Čtyři rohy, protože jeden roh by vždy skryl půlku mapy za tím, co je blíž. |
| **Pohledy** | **Shora**, **Zdola**, **Zepředu**, **Zezadu**, **Zleva**, **Zprava** | Rovnoběžná. Shora se dívá přímo dolů (sklon -89,9°), Zdola přímo nahoru, Zepředu podél -Z (stáčení 0°), Zezadu podél +Z (180°), Zleva podél -X (-90°), Zprava podél +X (90°). |
| | **Zpět na perspektivu** | Návrat k perspektivní poloze, ze které jste odešli. V perspektivě nedostupné. |
| | **Tříčtvrteční pohled** | Perspektiva, stáčení -35°, sklon -28°. |

Každá předvolba přepne samotnou projekci. V perspektivě se „pohled shora“ pořád sbíhá k úběžníku a stejné plochy přestanou vypadat stejně. Každá předvolba také zarámuje data z daného směru.

### Zorné pole {#field-of-view}

**Zorné pole** je vertikální úhel. Výchozí je 65°, na posuvníku 10 až 140° (179° s rukojetí), s tlačítky **Ploché 20°**, **Dlouhé 35°**, **Normální 50°**, **Široké 65°**, **Velmi široké 90°**. Úzké pole perspektivu zplošťuje a víc připomíná rovnoběžnou projekci; široké pole zveličuje hloubku a vzdálenosti se hůř odhadují. V rovnoběžném režimu zůstává živé: nastavuje měřítko, které se při přepnutí zpět dopočítává, a vzdálenost, kterou používá **Zarámovat**.

### Rychlost letu {#fly-speed}

**Rychlost letu** je počet světových jednotek (metrů) za sekundu při plném plynu. Výchozí je 120; při každém načtení je to vodorovný rozsah dat / 12. Logaritmická, 0,02 až 20 000 (200 000 s rukojetí; rukojeť ji mění poměrem, ne přičítáním). Kolečko myši ji násobí nebo dělí 1,5 za každé cvaknutí, v rozsahu 0,02 až 200 000.

Stejná hodnota se ukazuje vpravo dole na zobrazení (jen v perspektivě): rychlost v m/s nebo km/s a čas, za který při této rychlosti projde data (nebo úroveň, když je načtena 3D úroveň). Tažením nahoru nebo dolů ji změníte.

### Blízko a daleko {#near-and-far}

**Blízko** (výchozí 0,5) a **Daleko** (výchozí 40 000) jsou vzdálenosti ořezu. Obě se přepočítají z dat při každém načtení (blízko = max(0,05; rozsah / 20 000), daleko = rozsah × 12) a 3D úroveň, která je větší, je rozšíří, nikdy nezúží ([Úrovně](levels.md#what-a-level-does-for-the-heat)). Jejich poměr určuje přesnost hloubky, na které se spoléhá zakrývání, takže malé blízko s velkým daleko zeslabí [zakrývání](depth-and-culling.md). Když je scéna vidět zvenčí nebo shora z velké výšky, skutečně použitá blízká rovina se posune na 2 % té vzdálenosti. Mapa viděná z dálky tak drží dost přesnosti hloubky, aby voda a břeh neblikaly. Pole v panelu stále ukazuje nastavenou hodnotu.

### Ostatní ovládání {#other-controls}

| Ovládání | Výchozí | Význam |
|---|---|---|
| **Převrátit Y** | vypnuto | Převrátí rozhlížení myší nahoru/dolů. |
| **Hloubka ostrosti** | vypnuto | Viz níže. |
| **Gamepad** | zapnuto | Viz [Gamepad a HOTAS](gamepad.md). |
| **Poloha** | | Viz níže. |
| **Prozkoumat** | | Údaj o kameře, výběr kliknutím, konvence stáčení a *Přejít na bod*; viz [Prohlížení pohledu](#inspecting-the-view). |
| **Zarámovat datovou sadu (F)** | | Přizpůsobí data (na kartě Analýza závodu: kola) zobrazení a zachová současný směr. Kamera se postaví do vzdálenosti r / tan(fov / 2) od středu, kde r je polovina úhlopříčky hranic dat. |
| **Mřížka**, **Osy** | zapnuto, zapnuto | Mřížka na zemi s rozestupem 1/2/5 × 10ⁿ, asi 1/40 rozpětí dat (sahá do 1,5 × dat, mezi 8 a 120 kroky mřížky), a barevné osy. |
| **Převrátit osu světa** X, Y, Z | vypnuto | Viz níže. |

### Poloha {#pose}

Pět políček s čísly – **X**, **Y**, **Z** a **stáčení °**, **sklon °** – která sledují kameru, dokud žádné z nich nemá fokus. Napište hodnotu a stiskněte `Enter` (nebo opusťte políčko), a kamera se tam přesune. **kopírovat** dá do schránky `pos X Y Z · yaw A · pitch B` (a za to `(stáčení hry)`, když je zvolena tato konvence). Při prozkoumávání létáte; souřadnice slouží k zopakování pohledu. Jsou to stejná čísla jako v [údaji o kameře](#camera-readout): vlastní souřadnice dat, i když je osa převrácena, a stáčení ve zvolené [konvenci](#yaw-conventions).

### Převrátit osu světa {#invert-world-axis}

**Převrátit osu světa X / Y / Z** vykreslí svět s touto osou obrácenou. Hra, která drží levoruký svět, se v tomto pravoruké prohlížeči zobrazí zrcadlově: pravotočivé zatáčky se vykreslí jako levotočivé. Převrácení X nebo Z to vrátí. **Mění se jen vykreslování**: data, analýza a každá souřadnice, kterou nástroje ukazují (poloha, pravítko, řez), zůstávají hry vlastní. Pohled se převrátí na místě a zachová vás dívat se na stejné místo. Toto nastavení se pamatuje v prohlížeči (klíč `localStorage` `heat3d.mirror`); srovnejte s převrácením při načtení ([převrácení](axes-units-and-time.md#flips)), které mění data.

## Prohlížení pohledu {#inspecting-the-view}

Kde je kamera, co je pod ukazatelem a přechod na bod – blok **Prozkoumat** v panelu Kamera a scéna a dva překryvy vlevo nahoře na zobrazení. Kód je v [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) a [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Ovládání | Výchozí | Význam |
|---|---|---|
| **Poloha kamery nad zobrazením** | zapnuto | Údaj o kameře, níže. Zavře se také tlačítkem **×**. |
| **Kliknutí ukáže, co tam je** | zapnuto | Výběr kliknutím, níže. |
| **Konvence stáčení** | Prohlížeč | Které stáčení ukazují a čtou údaj, políčka polohy a políčko skoku. |

Tyto tři se pamatují v prohlížeči (klíč `localStorage` `heat3d.inspect`).

### Údaj o kameře {#camera-readout}

Vlevo nahoře na zobrazení: **x**, **y**, **z**, **stáčení** a **sklon** kamery, živě, se štítkem s názvem konvence stáčení. Ukazuje stejná čísla jako políčka [Poloha](#pose) a při létání nic nestojí (zapisuje se do stránky podle hodin snímků, bez překreslování panelů).

- **kopírovat** (nebo `C` kdekoli mimo textové pole) dá do schránky `x X y Y z Z yaw A pitch B (stáčení prohlížeče)`, s desetinnými tečkami bez ohledu na jazyk. Je to řádek, který políčko skoku i jakýkoli skript čtou zpět.
- **přejít** (nebo `G`) otevře pod ním políčko: vložte bod a stiskněte `Enter`, abyste se na něj podívali, nebo vložte celou zkopírovanou polohu, abyste stanuli v tomto pohledu. `Esc` políčko zavře.

### Souřadnice: vlastní soustava dat {#coordinates-the-datas-own-frame}

Každá souřadnice, kterou nástroje prohlížení ukazují nebo přijímají, je v **vlastní soustavě načtených dat**: [mapování os](axes-units-and-time.md) při načtení (vzhůru, převrácení, měřítko) se vrátí zpět. Poloha přečtená z pohledu je číslo, které drží zdrojová tabulka, a číslo z tabulky zadané do políčka skoku přistane přesně na tom místě. Když mapování nic nemění (načtení s Y nahoru a bez měřítka – to zapisují nástroje záznamu a exportéry úrovní), je to prostě svět. Jinak údaj nese štítek **soustava dat**. Bez datové sady jsou souřadnice světové. Stáčení a sklon jsou vždy vůči světu prohlížeče s Y nahoru.

### Konvence stáčení {#yaw-conventions}

| Konvence | Stáčení 0° se dívá podél | Roste k | Používá |
|---|---|---|---|
| **Prohlížeč** | -Z | -X | volná letová kamera, [předvolené pohledy](#preset-views) |
| **Hra / záznamové nástroje** | +X | -Z | sloupce `yaw` a polohy nástrojů záznamu; u úrovně exportované v soustavě prohlížeče vlastní stáčení hry |

Sklon je v obou stejný: nahoru od vodorovné roviny. Obě se liší o čtvrt otáčky a nic jiného:

> stáčení prohlížeče = stáčení hry - 90°

Směr `d` je `(cos p · cos y, sin p, -cos p · sin y)` v konvenci hry a `(-sin y · cos p, sin p, -cos y · cos p)` v konvenci prohlížeče. Zvolte **Hra / záznamové nástroje**, když chcete napsat stáčení přímo z tabulky záznamu, nebo porovnat údaj s ní.

### Přechod na bod {#going-to-a-point}

**Přejít na bod** v bloku Prozkoumat (a v políčku **přejít** u údaje):

- textové políčko přijme `x, y, z` nebo `x y z` (nebo `x; y; z`), s desetinnou tečkou nebo desetinnou čárkou – `-321.6, 137.8, -59.9` a `-321,6 137,8 -59,9` jsou tentýž bod. Pět čísel přidá stáčení a sklon a zkopírovaná poloha z údaje nebo z políček polohy se přečte celá, včetně štítků a konvence;
- **stáčení °** a **sklon °** (nepovinné) otočí kameru ve zvolené konvenci;
- **Podívat se** zachová směr (při pohledu do roviny se nakloní, aby se dívala dolů alespoň o 20°) a ustoupí po něm do současné vzdálenosti, držené mezi 0,3 % a 3 % šířky scény, tedy 6 až 60 m u úrovně dlouhé dva kilometry. Zaostřovací vzdálenost, výška rovnoběžného pohledu a rychlost letu se přizpůsobí, takže pohled je hned použitelný;
- **Stát zde** postaví kameru na bod, otočenou do zadaného stáčení a sklonu, nebo tak, jak byla.

Vložená poloha s vlastním stáčením a sklonem se vždy postaví do toho pohledu.

### Výběr kliknutím {#click-to-pick}

Klik na zobrazení (stisk a uvolnění bez tažení o více než 4 pixely; tažení se stále rozhlíží) ukáže kartu vlevo nahoře s tím, co je pod ukazatelem. Když je [pravítko](measure.md) zapnuté, kliky jdou místo toho na pravítko.

**Nakreslený datový bod vyhrává.** Nejbližší vzorek do 8 pixelů od kliku, z těch, které jsou skutečně vykresleny: řádky v časovém okně a životnosti, které projdou [filtry](filters.md), zobrazenými skupinami a rozdělením rozdílu, uvnitř ořezu vzdálenosti a řezu, který ořezává teplotní mapu. V přehrávání krabic je to krabice pod ukazatelem (kdekoli na ní). Karta vypíše každý sloupec, který řádek nese, pod vlastními názvy sloupců zdroje – čas (hodiny, nebo vlastní sekundy souboru ve tvaru `m:ss.ss`), osoba, skupina, relace, každý ponechaný sloupec, poloha a směr pohledu – a vzdálenost od kamery. V paměti jsou jen sloupce, které načtení ponechalo: sloupec, který nebyl zvolen jako [sloupec filtru](column-mapping.md), se nezobrazí.

**Jinak povrch úrovně**: bod, kde paprsek kliknutí protne skutečné trojúhelníky úrovně (ne referenční rovinu pravítka), s **částí**, ke které patří (název z exportéru, `structure:props`, `ground:terrain …`), jeho **druhem** (zem, konstrukce, voda, obrazová mapa), souřadnicemi a vzdáleností. Geometrie skrytá řezem nebo ořezem vzdálenosti se přeskočí. Když úroveň má [navigační síť](model-levels.md#navigation-meshes), řádek ji pojmenuje a řekne, zda místo na ní leží (✓). Název části s předponou `≈` byl odhadnut z ohraničujících boxů částí, protože tato část úrovně byla při načtení zjednodušena.

Karta zůstane, dokud se nezavře (**×**, `Esc`), dokud další klik neodpoví na něco jiného, nebo dokud se neklikne na prázdné místo. V bodě ve scéně se nakreslí azurový kříž a na obrazovce kolem něj kroužek. Jeho tlačítka: **kopírovat** (každá hodnota a souřadnice jako `x, y, z`), **Podívat se** a **Stát zde** (u datového bodu se podívá tak, jak se řádek díval, pokud má směr pohledu; u povrchu 1,7 m nad ním).

Úroveň se pro výběr indexuje při prvním kliku, který ji potřebuje: mřížka sloupců nad jejím půdorysem, postavená po několika milisekundách mezi snímky, takže zobrazení se nikdy nezastaví (asi sekunda práce pro úroveň několika milionů trojúhelníků), a drží se, dokud se úroveň nezmění. Dokud to trvá, karta říká *Připravuji úroveň pro výběr* s procenty a na klik odpoví, až je hotovo. Hledání datového bodu přes více než čtyři miliony vykreslených řádků se rozloží přes snímky stejným způsobem.

## Hloubka ostrosti {#depth-of-field}

Sbalitelná sekce v Kamera a scéna, s nadpisem *Hloubka ostrosti – zap.*, když je zapnuto. Výchozí je vypnuto: je to prezentační efekt a výchozí pohled má ukazovat data, ne jejich výklad.

| Ovládání | Výchozí | Rozsah (posuv) | Význam |
|---|---|---|---|
| **Zapnuto** | vypnuto | | |
| **Zaostřit na zarámované** | zapnuto | | Zaostřit na vzdálenost, kterou použilo poslední zarámování (*Zaostřeno na N m.*). |
| **Vzdálenost zaostření** | 1000 | 1 až 200 000, logaritmicky (10 000 000) | Zobrazí se, když je zaostřování ruční. |
| **Clona** | ±35 % | ±2 % až ±200 %, logaritmicky (±3200 %) | Hloubka, která zůstává ostrá, jako zlomek vzdálenosti zaostření – relativně, ne jako clonové číslo, protože scény sahají od místnosti po osmikilometrovou mapu. |
| **Maximální rozmazání** | 12 px | 1 až 48 (256) | Největší poloměr rozmazání; náklady s ním rostou. |

Rozmazává **úroveň, mřížku a krabice** – *ne teplotu*. Teplota v pixelu je součet sprite v mnoha hloubkách, takže nemá jednu hloubku, ve které by byla mimo ostrost. Rozmazat ji podle geometrie za ní by bylo špatně všude, kde se vznáší před ní. Ostrá data nad změkčeným kontextem jsou navíc z obojího užitečnější. Rozmazání je 24tahové shromáždění se zlatým úhlem v kompozitním průchodu, vážené tak, aby ostrý popředí nebyl rozmazán ven rozmazaným pozadím za ním. Změna ho překreslí, aniž by restartovala akumulaci teploty.

## Rozlišení plátna {#canvas-resolution}

Plátno se vykresluje v poměru pixelů displeje, nejvýš 2. Vyrovnávací paměť teploty se může vykreslovat v nižším rozlišení než to ([Rozlišení teploty](performance-and-stats.md)).

## Stránky v této sekci {#pages-in-this-section}

- [Gamepad a HOTAS](gamepad.md)
- [Přehled klávesnice a myši](keyboard-reference.md)
