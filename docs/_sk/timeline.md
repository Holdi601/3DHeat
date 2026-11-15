---
title: "Časová os a prehrávanie"
nav_order: 5
lang: "sk"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Časová os a prehrávanie

Lišta pod obrázkom je ako videoprehrávač: dáta môžete prehrať ako film, pozastaviť, preskakovať a meniť rýchlosť.

![Lišta časovej osi: 1 Všetko/Prehrať, 2 tlačidlá prehrávania, 3 hodiny, 4 Rýchlosť, 5 História, s Okno a Rozsahom 30 s](../assets/img/en/timeline-bar.webp)

Lišta pod pohľadom je časová os ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Rozhoduje, ktoré riadky sú v danom okamihu viditeľné. Potrebuje stĺpec času; bez neho je celá lišta vypnutá, pohľad zostane v režime **Všetko** a bočný panel hovorí: *V týchto dátach nie je stĺpec času - časová os je vypnutá a každý dátový bod sa zobrazuje naraz.*

## Všetko a Prehrať {#all-and-play}

Dva hlavné režimy, lebo odpovedajú na rozdielne otázky.

- **Všetko** (predvolené pri každom načítaní) úplne ignoruje hlavu prehrávania a zobrazí každý riadok, ktorý prejde filtrami. Je to pohľad „kde sa to deje“ a nie je to to isté ako posunúť sa na koniec. Posuvník je vypnutý a hodiny ukazujú `všetko · <span> dát`.
- **Prehrať** spustí dáta ako časozberné video. Objavia sa posuvník, ovládanie prehrávania a nastavenia histórie.

Výber **Všetko** prehrávanie tiež zastaví.

## Ovládanie {#the-controls}

| Ovládač | Predvolená hodnota | Význam |
|---|---|---|
| Posuvník | začiatok | Hlava prehrávania. Ťahaním sa presúvate; 20 000 krokov cez rozsah. |
| **Všetko** / **Prehrať** | Všetko | Pozri vyššie. |
| ▶ / ❚❚ | pozastavené | Spustenie alebo pozastavenie; aj `K`. |
| ◀ **Prehrávať dozadu (J)** | | Prehrá dáta v opačnom smere. Zobrazuje sa len v režime **Prekrytie figúrok**; rovnaká klávesa `J` funguje aj tam (pozri [Klávesnicu](#keyboard)). |
| ⏮ | | Späť na začiatok rozsahu. |
| Hodiny | | `uplynulé / celkom` ako `mm:ss.s` (alebo `h:mm:ss`) a, ak je stĺpec času absolútna časová pečiatka, aj čas dňa hlavy prehrávania ako `HH:MM:SSZ` (UTC). |
| **Rýchlosť** | 1× | Sekundy dát za reálnu sekundu. Ponuka má 17 krokov od 0,01× do 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), plus **Vlastná…**: zadajte ľubovoľnú rýchlosť od 0,001× do 3600× (napríklad 0,3 alebo 12) a stlačte Enter; Esc ponechá aktuálnu rýchlosť. Posledná rýchlosť sa zapamätá pre ďalšiu návštevu (pozri [Uložené nastavenia](ref-settings-storage.md)). |
| **História** | Kumulatívne | Čo sa počíta ako viditeľné pri hlave prehrávania: *Kumulatívne*, *Okno* alebo *Životnosť* (nižšie). |
| **Rozsah** (Okno; v režime Čiary aj Životnosť) | 30 s | Dĺžka okna končiaceho pri hlave prehrávania; aspoň 0,01 s. V [Teple čiar](line-heat.md#playback) je to dĺžka chvosta. |
| **Náhradná životnosť** (len Životnosť, nie v režime Čiary) | 10 s | Ako dlho zostane viditeľný dátový bod, ktorému osoba nemá ďalšiu vzorku. |
| **Miznutie** (len Životnosť, nie v režime Čiary) | 0,4 | Podiel životnosti každého dátového bodu, počas ktorého sa vytráca, 0-1. |
| **Slučka** | zapnuté | Na konci začne znova; vypnuté zastaví na konci. |
| Pravá strana | | Názov dátovej sady. |

**Rozsah** je časové rozpätie dátovej sady - alebo, v [prekrytí figúrok](box-replay.md) s vybranou reláciou, rozpätie tej relácie.

## História {#history}

V režime Prehrať:

- **Kumulatívne** - všetko od začiatku rozsahu po hlavu prehrávania. Teplo sa počas prehrávania hromadí.
- **Okno** - pevné rozpätie histórie končiace pri hlave prehrávania (*Rozsah*).
- **Životnosť** - každý dátový bod žije, kým nepríde **ďalšia vzorka tej istej osoby** (v tej istej relácii), takže v každom okamihu je aktuálna presne jedna pozícia na osobu. Dátový bod, ktorého osoba sa už nikdy neobjaví - smrť, odpojenie, koniec záznamu - nemá ďalšiu vzorku a žije dobu *Náhradnej životnosti*, namiesto toho, aby okamžite zmizol alebo navždy zostal. Dátové body sa počas posledného podielu *Miznutia* ich životnosti **vytrácajú**, namiesto aby vyskočili: pri jednej živej vzorke na osobu by zmiznutie dátového bodu medzi dvoma snímkami spôsobilo blikanie celého poľa rýchlosťou vzoriek. *Miznutie* 0 obnoví tvrdý rez.

Životnosť potrebuje stĺpec osoby aj stĺpec času; bez neho sa história pri načítaní vráti na Kumulatívne. V [Teple čiar](line-heat.md#playback) história určuje, ako dlho zostáva viditeľný chvost trasy; v [prekrytí figúrok](box-replay.md) je *Náhradná životnosť* doba, po ktorú sa drží osoba bez ďalších vzoriek.

## Správanie pri prehrávaní {#playback-behaviour}

Zo slučky snímok ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Hlava prehrávania postupuje o *čas snímky × rýchlosť*. Čas snímky je obmedzený na 0,1 s, takže prepnutie karty hlavu neskočí.
- Stlačenie prehrávania na úplnom konci rozsahu začne od začiatku, ako v mediálnom prehrávači. Pri každom načítaní je hlava prehrávania nastavená na začiatok, takže prvé stlačenie prehrať prehrá.
- Na konci rozsahu hlava skočí späť na začiatok (Slučka zapnutá) alebo sa tam zastaví a prehrávanie skončí (Slučka vypnutá).
- Posuvník číta hlavu prehrávania priamo z motora každú snímku; stav aplikácie sa aktualizuje pri posunoch, spusteniach, zastaveniach a slučkách.
- Výber relácie vo výbere relácií posunie na začiatok tej relácie.

## Prečo je prehrávanie plynulé a lacné {#why-playback-is-smooth-and-cheap}

Riadky sú uložené zoradené podľa času, takže časové okno sú dve binárne vyhľadávania v stĺpci času: posun hlavy prehrávania posunie dve celé čísla a nedotkne sa žiadneho riadku; cena prehrávania závisí od počtu riadkov v okne, nie od veľkosti dátovej sady.

Ako sa teplo udrží stabilné, kým sa okno pohybuje, závisí od histórie ([Akumulácia](accumulation.md)):

- **Kumulatívne** iba rastie, takže každá snímka pridá len riadky, ktoré sa od poslednej stali viditeľnými, s plnou váhou. Pole sa buduje monotónne a pozastavenie nič nemení, lebo už nič neprichádza. (Prepočítavanie by spôsobilo, že každá snímka osvetlí inú náhodnú podmnožinu a potom ju vytratí, čo vyzerá ako záblesky a miznutia.)
- **Okno** a **Životnosť** sa naozaj menia každú snímku a prepočítavajú sa, zmiešané ako exponenciálny kĺzavý priemer (váha 0,34 pre novú snímku), ktorý je v ustálenom stave nevychýlený a oveľa tichší než začínať odznova.
- V režime Životnosť sú kandidátske riadky tie od *hlavy prehrávania - max(najdlhšia medzera v dátach, Náhradná životnosť)* po hlavu prehrávania; shader potom vyradí každý riadok, ktorého vlastná životnosť skončila, a aplikuje miznutie.

Prepínanie medzi Všetko a Prehrať alebo zmena histórie reštartuje akumuláciu.

## Klávesnica {#keyboard}

| Klávesa | Účinok |
|---|---|
| `K` | Prehrať / pozastaviť |
| `J` | Prehrávať dozadu; ďalšie stlačenie pozastaví (len Prekrytie figúrok) |
| `L` | Prehrávať dopredu; ďalšie stlačenie pozastaví (len Prekrytie figúrok) |

`J` a `L` tiež prepnú časovú os na **Prehrať**. Klávesy sa ignorujú, keď má fokus textové pole alebo ponuka. V karte Analýza pretekov `K` ovláda vlastné prehrávanie tej karty.
