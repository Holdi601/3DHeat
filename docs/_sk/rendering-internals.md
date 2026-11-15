---
title: "Vnútorné časti renderovania"
nav_order: 22
has_children: true
lang: "sk"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---


# Vnútorné časti vykresľovania

Prehliadač kreslí milióny bodov ako žiariace škvrny a sčítava ich. Táto časť vysvetľuje triky, ktoré to držia rýchle, a čo znamenajú čísla v prehľade štatistík. Čítajte ju, ak sa prehliadač zdá pomalý, alebo ak chcete pracovať na vykresľovači.

```
dáta -> časové okno -> filtre GPU -> plán vzorkovania -> splat -> akumulácia -> farba -> obrazovka
```

Ako si vedie váš počítač, zistíte v políčku štatistík vpravo hore v zobrazení: [Panel výkonu a prehľad štatistík](performance-and-stats.md). Nové slová (GPU, riadok, sprite, heatmapa) sú v [slovníku](glossary.md).

## Hlavný problém {#the-core-problem}

Súčet prekrývajúcich sa radiálnych prechodov stojí *N* × π*r*² zmiešaných fragmentov na snímku. Pri 100 miliónoch spritov s polomerom 8 px je to 2 × 10¹⁰ fragmentov - asi sekunda práce na high-end GPU. Nedá sa to každú snímku riešiť hrubou silou, preto prehliadač kombinuje:

- **riadky zoradené podľa času** - časové okno sú dve binárne vyhľadávania a cena prehrávania sa riadi riadkami v okne, nie celou množinou dát;
- **žiadna práca na riadok na CPU za snímku** - riadky žijú v pamäti GPU, kvantované; filtre, znamienka skupín, test životnosti, okno, orezávanie a rez sa vyhodnocujú vo vertex shaderi;
- **stratifikované vzorkovanie** s kompenzujúcimi váhami, keď snímka nemôže nakresliť každý riadok, a **postupná akumulácia**, ktorá sa zbieha k presnej odpovedi zo všetkých riadkov, kým pohľad stojí ([Vzorkovanie a rozpočty](sampling-and-budgets.md), [Akumulácia](accumulation.md));
- **dvojstupňové škrtenie**, ktoré najprv obmedzí sprity na snímku a potom rozlíšenie tepla, aby získalo snímky za sekundu ([Vzorkovanie a rozpočty](sampling-and-budgets.md#the-adaptive-budget));
- **vynútené rozpočty pamäte**, takže dataset, ktorý sa nezmestí, sa viditeľne skráti namiesto pádu ([Rezidencia pamäte GPU](gpu-memory.md)).

## Jedna snímka {#one-frame}

Slučka snímok je [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Všetko, čo sa mení na frekvencii snímok - kamera, prehrávacia hlava, rozpočet - žije v engine, nie v stave aplikácie, takže snímka nestojí žiadnu prácu Reactu; stav sa prečíta raz za snímku a zapíše späť len pre nízkofrekvenčné údaje.

1. **Nové dáta?** Nová množina dát sa oznámi (*Nahrávanie N riadkov na GPU*) v jednej snímke a nahrá sa v ďalšej, takže správa sa vykreslí skôr, než práca zablokuje vlákno. Nová úroveň sa odovzdá vykresľovaču; trasy tepla čiar sa vytvoria alebo uvoľnia.
2. **Prehrávacia hlava** postupuje (najviac 0,1 s reálneho času na snímku), opakuje sa alebo zastaví.
3. **Kamera** číta klávesy, myš a gamepad; zrkadlenie osí sa zloží do matice pohľadu; na WebGPU matica prepočtu hĺbky prevedie rozsah hĺbky v štýle OpenGL z three.js na WebGPU.
4. **Čo je viditeľné**: časový rozsah z časovej osi a histórie; tabuľka znamienok skupín (viditeľnosť len pri rozdelení podľa stĺpca); až štyri filtre - filtre stĺpcov a výber Entít; rozdelenie rozdielu.
5. **Tabuľky farieb a kriviek** sa znovu zostavia, ak sa zmenili ich nastavenia.
6. **Rozpočet**: adaptívny regulátor nastaví rozpočet spritov a rozlíšenie tepla pre túto snímku; pri *Kresliť každý riadok v každej snímke* sa rozpočet zvýši tak, aby pokryl každý kandidátny riadok.
7. **Podpisy** rozhodujú, čo akumulačný buffer ešte znamená: zmena čohokoľvek, čo mení, aké riadky prispievajú alebo ako (*geometria*), časové okno, alebo len spôsob zafarbenia výsledku (*kompozit*). Pozri [Akumulácia](accumulation.md#what-restarts-it).
8. **Plán vzorkovania**: ktoré bloky riadkov sa nakreslia ([Vzorkovanie a rozpočty](sampling-and-budgets.md)).
9. **Režim akumulácie**: reset, rozšírenie, kĺzavý priemer, bežiaci priemer, alebo nečinnosť.
10. **Geometria replay krabíc** (kocky, stopy) na CPU, len v tomto režime a len keď nie je nečinnosť.
11. **Vykreslenie**: backend nakreslí scénu (úroveň, mriežka, osi, krabice, stopy, pravítko), nastriekne teplo do cieľa tepla, zlúči ho do akumulátora a zloží teplo nad scénu na plátno.
12. **Automatická expozícia** sa spustí, keď jej odpočet dosiahne nulu; sonda tepla pravítka prečíta najviac jeden pixel každých 120 ms; údaje sa zverejnia.

Nečinná snímka - zbiehajúca sa, nič sa nezmenilo - preskočí scénu a striekanie, ale stále **prekomponuje**: plátno WebGL vytvorené bez `preserveDrawingBuffer` má po skladaní nedefinovaný obsah, takže spoliehať sa, že zobrazí poslednú snímku, nie je bezpečné. Ciele scény a tepla sú vlastné framebuffery prehliadača a obsah si zachovávajú, takže nečinná snímka stojí jeden celoobrazovkový prechod.

## Stránky v tejto časti {#pages-in-this-section}

- [Dva backendy](backends.md) - WebGPU a WebGL2, ako sa jeden vyberá, prepínače v adrese
- [Akumulácia](accumulation.md) - reset, rozšírenie, kĺzavý priemer, bežiaci priemer
- [Vzorkovanie a rozpočty](sampling-and-budgets.md) - stratifikovaný vzorkovač, presný režim, adaptívny rozpočet
- [Akumulácia v polovičnej presnosti](half-float-accumulation.md) - rozsah a presnosť na 16-bitových cieľoch
- [Rezidencia pamäte GPU](gpu-memory.md) - kvantované ukladanie riadkov a vynútený rozpočet GPU
- [Detekcia softvérového vykresľovania](software-rendering.md)
- [Panel výkonu a prehľad štatistík](performance-and-stats.md)
