---
title: "Vnitřní fungování vykreslování"
nav_order: 22
has_children: true
lang: "cs"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Vnitřek vykreslování

Prohlížeč kreslí miliony bodů jako zářící skvrny a sčítá je. Tato část vysvětluje triky, které to drží rychle, a co znamenají čísla v přehledu statistik. Čtěte ji, pokud se prohlížeč zdá pomalý, nebo chcete pracovat na rendereru.

```
data -> časové okno -> filtry na GPU -> plán vzorkování -> splat -> akumulace -> barva -> obrazovka
```

Jak si váš počítač vede, zjistíte v okně statistik vpravo nahoře v zobrazení: [Panel výkonu a statistiky](performance-and-stats.md). Nová slova (GPU, řádek, sprite, teplotní mapa) jsou ve [slovníčku](glossary.md).

## Hlavní problém {#the-core-problem}

Součet přesahujících se radiálních rampových funkcí stojí *N* × π*r*² smíchaných fragmentů za snímek. Při 100 milionech spritů o poloměru 8 px je to 2 × 10¹⁰ fragmentů, asi sekunda práce na špičkové GPU. Nedá se to každý snímek hrubou silou, takže prohlížeč kombinuje:

- **řádky seřazené podle času**: časové okno jsou dvě binární vyhledávání, a cena přehrávání sleduje řádky v okně, ne celý datový soubor;
- **žádnou práci na řádek na CPU za snímek**: řádky žijí v paměti GPU, kvantované; filtry, znaménka skupin, test životnosti, okno, ořez a řez se počítají ve vertex shaderu;
- **stratifikované vzorkování** s vyrovnávacími váhami, když snímek nemůže nakreslit každý řádek, a **progresivní akumulaci**, která se během toho, jak je zobrazení v klidu, sbíhá k přesné odpovědi nad všemi řádky ([Vzorkování a rozpočty](sampling-and-budgets.md), [Akumulace](accumulation.md));
- **dvoustupňový regulátor**, který obětuje sprity za snímek, a pak rozlišení tepla, aby získal snímkovou frekvenci ([Vzorkování a rozpočty](sampling-and-budgets.md#the-adaptive-budget));
- **vynucené rozpočty paměti**, takže data, která se nevejdou, se viditelně ořežou místo pádu ([Rezidence paměti GPU](gpu-memory.md)).

## Jeden snímek {#one-frame}

Smyčka snímků je [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Vše, co se mění každý snímek (kamera, playhead, rozpočet), žije v enginu, ne ve stavu aplikace, takže snímek nestojí žádnou práci Reactu; stav se načte jednou za snímek a zapíše zpět jen pro nízkofrekvenční údaje.

1. **Nová data?** Nová datová sada se oznámí (*Nahrávám N řádků do GPU*) v jednom snímku a nahraje se v dalším, aby se zpráva vykreslila dřív, než práce zablokuje vlákno. Nová úroveň se předá rendereru; trasy čárového tepla se sestaví nebo uvolní.
2. **Playhead** se posune (nejvýše 0,1 s reálného času na snímek), smyčka se otočí nebo se zastaví.
3. **Kamera** čte klávesy, myš a gamepad; zrcadlení osy se připočítá do matice pohledu; na WebGPU matice přemapování hloubky převede rozsah hloubky z OpenGL stylu three.js na rozsah WebGPU.
4. **Co je vidět**: časový rozsah z časové osy a historie; tabulka znamének skupin (viditelnost jen při rozdělení podle sloupce); až čtyři filtry: filtry sloupců a výběr Entit; rozdílové rozdělení.
5. **Tabulky barev a křivek** se přestavějí, pokud se jejich nastavení změnila.
6. **Rozpočet**: adaptivní regulátor nastaví rozpočet spritů a rozlišení tepla pro tento snímek; s *Kreslit každý řádek v každém snímku* se rozpočet zvedne, aby pokryl každý kandidátní řádek.
7. **Podpisy** rozhodnou, co pro akumulační buffer ještě znamená: změna čehokoli, co mění, které řádky přispívají nebo jak (*geometrie*), časového okna, nebo jen způsobu, jak se výsledek barví (*složení*). Viz [Akumulace](accumulation.md#what-restarts-it).
8. **Plán vzorkování**: které bloky řádků se mají kreslit ([Vzorkování a rozpočty](sampling-and-budgets.md)).
9. **Režim akumulace**: reset, rozšíření, klouzavý průměr, běžící průměr, nebo nečinnost.
10. **Geometrie přehrávání krabic** (krychle, stopy) na CPU, jen v tomto režimu a jen když není nečinnost.
11. **Vykreslení**: backend nakreslí scénu (úroveň, mřížku, osy, krabice, stopy, pravítko), nastříkne teplo do cíle tepla, sloučí je do akumulátoru a složí teplo přes scénu na plátno.
12. **Automatická expozice** se spustí, když odpočet dojde na nulu; sonda tepla pravítka přečte nejvýše jeden pixel každých 120 ms; údaje se zveřejní.

Nečinný snímek (zkonvergovaný, nic se nezměnilo) přeskočí scénu a stříkání, ale stále **znovu skládá**: plátno WebGL vytvořené bez `preserveDrawingBuffer` má po složení nedefinovaný obsah, takže spoléhat na to, že zachová poslední snímek, není bezpečné. Cíle scény a tepla jsou vlastní framebuffery prohlížeče a obsah si zachovávají, takže nečinný snímek stojí jeden celoobrazovkový průchod.

## Stránky v této části {#pages-in-this-section}

- [Dva backendy](backends.md): WebGPU a WebGL2, jak se jeden vybere, přepínače v adrese
- [Akumulace](accumulation.md): reset, rozšíření, klouzavý průměr, běžící průměr
- [Vzorkování a rozpočty](sampling-and-budgets.md): stratifikovaný vzorkovač, přesný režim, adaptivní rozpočet
- [Akumulace v half-float](half-float-accumulation.md): rozsah a přesnost na 16bitových cílích
- [Rezidence paměti GPU](gpu-memory.md): kvantované uložení řádků a vynucený rozpočet GPU
- [Detekce softwarového vykreslování](software-rendering.md)
- [Panel výkonu a statistiky](performance-and-stats.md)
