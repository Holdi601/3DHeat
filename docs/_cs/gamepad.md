---
title: "Gamepad a HOTAS"
parent: "Kamera a ovládání"
nav_order: 1
lang: "cs"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad a HOTAS

Kameru můžete ovládat ovladačem ve stylu Xbox místo klávesnice. Použijte ho, když se chcete opřít a rozhlédnout po velké scéně. Jeho vstup se **přidává** ke vstupu z klávesnice, takže můžete používat obojí najednou.

## Připojení ovladače {#connect-a-controller}

1. Připojte ovladač (nebo ho spárujte).
2. Klikněte do zobrazení a stiskněte libovolné tlačítko na ovladači. Prohlížeče ukážou ovladač až po jeho prvním vstupu.
3. Otevřete **Kamera a scéna → Gamepad**. Seznam zařízení ho ukáže s `●`.
4. Zatlačením levé páčky letíte, pravou se rozhlížíte. Pokud kamera se středními páčkami ujíždí, zvyšte **Mrtvou zónu**.

Každé zařízení, které prohlížeč namapuje na standardní rozložení gamepadu, funguje. Letecká páčka nebo plyn (HOTAS) se ve výchozím stavu ignorují; viz níže.

## Mapování {#mapping}

| Ovládání | Účinek |
|---|---|
| Levá páčka | Pohyb: vpřed/vzad a do stran |
| Pravá páčka | Rozhlížení: otáčení a náklon, při *Rychlosti rozhlížení* stupňů za sekundu při plném vychýlení |
| `RT` / `LT` (analogové) | Nahoru / dolů; v paralelní projekci přiblížení / oddálení |
| `RB` (držet) | 6× rychleji |
| `LB` (držet) | 15 % rychlosti |
| `A` (držet) | 3× sprint (kombinuje se s RB/LB) |
| `Y` (stisknout) | Zarámovat data |

Čísla tlačítek odpovídají standardnímu rozložení: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; páčky na osách 0–1 (levá) a 2–3 (pravá).

## Nastavení gamepadu {#the-gamepad-settings}

V **Kamera a scéna → Gamepad**. **Nastavení** / **Skrýt** otevře ovládání ladění.

| Ovládání | Výchozí | Rozsah (posuv) | Význam |
|---|---|---|---|
| **Zapnuto** | zapnuto | | |
| Stav zařízení | | | Každé připojené zařízení, `●` když se sleduje, `○` když ne, s hláškou *- není XInput pad, ignorován* nebo *- není XInput pad, přesto použit* u nestandardních zařízení. Když žádné není: *Žádný pad nenalezen. Prohlížeče odhalí ovladač až po jeho prvním vstupu – stiskněte na něm tlačítko.* |
| **Použít zařízení** | *Jen XInput pady (doporučeno)* | | Ukáže se, když je připojeno nestandardní zařízení. Výběrem zařízení podle názvu ho místo toho začnete sledovat. |
| **Rychlost rozhlížení** | 150°/s | 20–540 (5000) | Rychlost otáčení při plném vychýlení pravé páčky. |
| **Mrtvá zóna** | 12 % | 0–50 % (95 %) | Radiální: šikmý tah nikdy neprosákne jen do jedné osy. Zvyšte ji, když kamera se středními páčkami ujíždí. |
| **Křivka páčky** | x² | lineární (1) až x⁴ (16) | Exponent odezvy za mrtvou zónou: jemnější ovládání u středu, plná rychlost na okraji. |
| **Převrátit Y páčky** | vypnuto | | |
| **Prohodit páčky** | vypnuto | | Pohyb na pravé páčce, rozhlížení na levé. |

Tvarování páčky: při vychýlení *m* (délka vektoru páčky) a mrtvé zóně *d* je výstup ((m - d) / (1 - d)) ^ křivka podél směru páčky, a 0 uvnitř mrtvé zóny.

## Proč ve výchozím stavu jen standardní pady {#why-only-standard-pads-by-default}

Gamepad API hlásí **každé** HID zařízení s osami: letecké páčky, plyny, pedály, volanty. Ty se nevracejí do středu: osa kroucení nebo páka plynu zůstává při plném vychýlení, když se jich nikdo nedotýká. Čteno jako páčka, je to trvalý vstup plnou rychlostí, který žádná mrtvá zóna nepotlačí, a kamera se točí sama od okamžiku načtení stránky (a všechny režimy tepla vypadají rozbitě, protože pohybující se kamera restartuje akumulaci každý snímek).

Zařízení se proto sleduje jen tehdy, když prohlížeč hlásí `mapping: "standard"`, což je jeho způsob, jak říct „pad ve stylu XInput s osami tam, kde je čekáte“. Ostatní zařízení se vypíšou a označí jako ignorovaná. **Použít zařízení** se pro jedno výslovně zapne, například pro létání kamerou pomocí HOTAS. Jakmile se pad sleduje, kamera u něj zůstává, takže dva ovladače se nepřetahují o kameru podle pořadí, v jakém je systém vyčte.

**HOTAS:** čtou se jen osy 0–3 (dvě páčky) a standardní tlačítka. Plyn nebo pedály na jiných osách nedělají nic a páčka nebo plyn, jehož osy se nevracejí do středu, možná potřebuje větší **Mrtvou zónu**.

Prohlížeče skryjí ovladač, dokud neposlal první vstup, takže připojený pad, na který se nesáhlo, pro stránku zatím neexistuje.
