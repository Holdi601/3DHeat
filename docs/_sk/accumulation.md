---
title: "Akumulácia"
parent: "Vnútorné časti renderovania"
nav_order: 2
lang: "sk"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akumulácia

Keď prehliadač nevie nakresliť každú bodku v jednej snímke, nakreslí jednu časť, potom ďalšiu a pri nehybnom držaní myši obrázky sčíta. Obraz sa zjasňuje, ako sa vyvíja fotografia. Pohyb kamerou začne od začiatku. Riadok **Pokrytie** v prekrytí štatistík ukazuje, ako ďaleko to je.

![Prekrytie štatistík: Pokrytie ukazuje percento, kým sa obraz vyvíja, a *presné* keď je hotový](../assets/img/en/performance-stats-overlay.webp)

## Pre vývojárov {#for-developers}

Keď jeden snímok nemôže nakresliť každý riadok, nakreslí vzorok a zváži ho; obraz je potom nezaujatý, ale hlučný odhad. **Akumulácia** spája po sebe idúce snímky, aby odhad konvergoval k presnej odpovedi, kým sa nič nemení. Každý snímok vyberie jeden z piatich režimov ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); naposledy použitý je na `engine.live.accumMode`.

| Režim | Kedy | Čo sa stane s akumulátorom |
|---|---|---|
| **reset** | kamera sa pohla, zmenilo sa niečo, čo mení pole, postupné spresňovanie je vypnuté, začína rastúce okno (prvý snímok prehrávania, po posune), alebo sa pohol teplo z prehrávaných čiar | Nahradí sa odhadom tohto snímku. |
| **extend** | **Kumulatívne** okno, ktoré od posledného snímku len narástlo | Tento snímok kreslí len riadky, ktoré práve pribudli viditeľné, s plnou váhou, a pripočíta ich. Nič sa nerozkladá. |
| **ema** | kĺzavé okno (**Okno**, **Životnosť**) sa posunulo | `acc = acc × (1 - 0,34) + frame × 0,34` – exponenciálny kĺzavý priemer asi tri snímky. |
| **mean** | nič sa nezmenilo a odhad nie je úplný | `acc = acc × (1 - 1/n) + frame × 1/n` pri *n*-tom snímku: bežiaci priemer. |
| **skip** (nečinný) | skonvergované a nič sa nezmenilo | Nič sa nekreslí; snímok sa len znova skladá. |

### Prečo každý {#why-each}

- **Bežiaci priemer, nie súčet.** Škálovanie bufferu faktorom 1 - 1/n a pripočítanie 1/n nového snímku je algebraicky to isté ako sčítanie a delenie *n* na konci, ale buffer vždy drží jednu hodnotu poľa. Súčet by dosiahol *n*-násobok poľa a na 16-bitovom cieli by sa nasýtil pri 65 504; s deliteľom, ktorý stále rastie, by nehybný pohľad zoslabol, čím dlhšie stojí – kým pohybujúca sa kamera, ktorá sa resetuje každý snímok, vyzerá úplne správne. Test smoke tvrdí, že 16 spojených snímkov drží 1,00× toho, čo jeden snímok.
- **Extend pre kumulatívne prehrávanie.** Riadky už nahromadené sú stále viditeľné, takže snímok potrebuje len zlomok sekundy, ktorý práve prišiel – čo sa zmestí do jedného snímku, takže sa pridá presne. Nové odhadnutie by každý snímok rozsvietilo inú náhodnú podmnožinu a zoslabilo ju, čo sa číta ako záblesky, ktoré vzplanú a zmiznú, a pozastavený snímok by stále dopĺňal. Test tvrdí, že celkový súčet počas prehrávania monotónne rastie a pri 2,5 s pozastavenia drží v rozsahu 0,02 %.
- **Kĺzavý priemer pre kĺzavé okná.** Tie sa naozaj menia každý snímok. Pevná váha miešania sleduje pohyblivé okno (priemer cez všetky snímky od začiatku prehrávania by zaostával za prehrávacou hlavou) a je oveľa tichší než začínanie od nuly.
- **Reset pre prehrávané čiary.** Hlavy čiar tepla sa hýbu každý snímok; kĺzavý priemer by každú rozmazal do pruhu, preto sa každý snímok kreslí celý a doznievanie chvosta je vlastné zobrazenie obrazu.
- **Čiastočné snímky idú cez pracovný cieľ.** Snímok spojený pri zlomku plnej váhy sa rozstrelí do samostatného cieľa od nuly a až potom sa zmieša do akumulátora, namiesto toho, aby sa rozstrelil priamo s váhou 1/n. Priamo by sa každý sprite pridal ako 1/n veľkosti celku, do ktorého vstupuje, čo polovičný float cieľ zaokrúhli preč – najhoršie tam, kde je najhustejšie ([Akumulácia v half-float](half-float-accumulation.md)).

### Konvergencia {#convergence}

Plán každého snímku pozná, koľko je kandidátskych riadkov a koľko ich odosiela, takže počet snímkov potrebných na pokrytie každého riadku je ⌈kandidáti / odoslaní⌉. Keď sa spojí toľko snímkov, pohľad je **skonvergovaný**: riadok *Pokrytie* v prekrytí štatistík sa zmení z percenta na *presné* a ďalšie snímky sú nečinné. Keď je **Kresliť každý riadok v každej snímke** zapnuté (predvolene), jeden snímok zvyčajne pokryje všetko, takže konvergencia je okamžitá, a postupný mechanizmus je potrebný len vtedy, keď okno drží viac riadkov, než dokáže niesť jeden plán kreslenia (asi 67 miliónov).

### Čo to reštartuje {#what-restarts-it}

Nastavenia spadajú do troch skupín podľa toho, čo ešte nahromadený buffer znamená po ich zmene:

| Skupina | Zmeny | Účinok |
|---|---|---|
| **Geometria** – ktoré riadky prispievajú a koľko | režim pohľadu; trasy čiar; polomer spritu, intenzita v strede a na okraji, útlm, hladký priebeh, krivka, obmedzenia pixelov, sploštenie; orezanie vzdialenosti blízko, ďaleko a rovinou; zakrytie a skrytie za terénom; rez; veľkosť plátna; rozlíšenie tepla; viditeľnosť a znamienka skupín; delenie rozdielu; Všetko / Prehrať; história; filtre stĺpcov a výber entít; zisk half-float | Reset. |
| **Okno** – časový rozsah | pohyb prehrávacej hlavy; záložný režim a doznievanie Životnosti | Rozšírenie (kumulatívne) alebo kĺzavý priemer (kĺzavé). |
| **Skladanie** – len sfarbenie | sýtosť, odozva hustoty, minimálne teplo, farebné škály; rezanie levelu; mriežka a osi; nastavenia prehrávania kociek a relácia; hĺbka ostrosti | Prekreslenie bez dotknutia tepla. |

Pohyb kamery vždy resetuje. Takže ťahanie sýtosti alebo škály je zadarmo; ťahanie polomeru spritu reštartuje konvergenciu pri každom kroku.
