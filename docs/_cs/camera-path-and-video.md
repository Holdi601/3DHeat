---
title: "Trasa kamery a video"
nav_order: 15
lang: "cs"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Trasa kamery a video

Natočte film ze svých dat: umístíte kameru na několik míst, prohlížeč mezi nimi přelétá a uloží video. Každý snímek je velmi čistý, bez zrnění. Kamera a hlava přehrávání se hýbou spolu, takže stejný panel udělá i timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Vytvořte přelet {#make-a-flythrough}

1. Přeletěte na místo, kde film začíná, a stiskněte **Přidat klíčový snímek zde** v **Dráha kamery a vykreslení**.
2. Přeletěte na další místo a stiskněte to znovu. Opakujte pro každou zastávku.
3. Zaškrtněte **Náhled podél dráhy** a potáhněte za **Pozice na dráze**, abyste zkontrolovali pohyb.
4. Nastavte **Délku** (jak dlouhé video bude). Pohyb, který je správný, ale rychlý, potřebuje jen delší délku.
5. Stiskněte **Vykreslit video**. Počkejte na řádek průběhu; soubor se stáhne, až to skončí.

![Panel Dráha kamery a vykreslení se třemi klíčovými snímky, Hladkou interpolací, 12 s, 30 fps a 16 Mb/s](../assets/img/en/camera-path-panel.webp)

## Klíčové snímky {#keyframes}

| Ovládací prvek | Účinek |
|---|---|
| **Přidat klíčový snímek zde** | Připojí aktuální pozici kamery, stáčení, sklon a zorné pole jako klíčový snímek. |
| **Vymazat** | Odstraní všechny klíčové snímky. |
| Seznam klíčových snímků | Jeden řádek na klíč: jeho číslo (kliknutím na něj přeletíte kamerou tam, a nastavíte i zorné pole), pozice, `stáčení° / sklon°`, a **×** k odstranění. |

Klíče se při každém přidání nebo odebrání rozmístí **rovnoměrně** podél normalizované osy dráhy od 0 do 1; výstupní délka pak natáhne celý pohyb, takže záběr, který je správný, ale rychlý, potřebuje jen delší délku. Stáčení se mezi klíči rozvíjí, takže se kamera otočí krátkou cestou.

Bez klíčových snímků vykreslení drží aktuální kameru stále po celou dobu klipu – naprosto dobrý timelapse.

## Nastavení dráhy {#path-settings}

| Ovládací prvek | Výchozí | Rozsah (posun) | Význam |
|---|---|---|---|
| **Interpolace** (2+ klíče) | *Hladká* | *Hladká* / *Přímá* | *Hladká*: kubická Hermitova křivka procházející klíči s tečnami z sousedních klíčů, takže rychlost sedí přes každý klíč a na místě, kde se úseky stýkají, není trhnutí. *Přímá*: přímé čáry mezi klíči, předvídatelné, s viditelným rohem u každého klíče. Zorné pole se vždy interpoluje lineárně. |
| Čára cesty (2+ klíče) | | | `N jednotek cesty – M za sekundu při této délce`, nebo poznámka, že všechny klíče jsou na jednom místě. |
| **Náhled podél dráhy** (1+ klíče) | vypnuto | | Řídí kameru výřezu podle dráhy a hlavu přehrávání pohybuje s ní, jako to dělá vykreslení, aby se pohyb dal posoudit před vykreslením. |
| **Pozice na dráze** (během náhledu) | 0 % | 0–100 % | Kde na dráze se náhled zobrazí. |
| **Délka** | 12 s | 1–120 s (3600) | Délka videa. |
| **Snímková frekvence** | 30 fps | 6–60 (240) | |
| **Datový tok** | 16 Mb/s | 1–60 Mb/s, logaritmicky (400) | Tepelné přechody se při nízkém datovém toku špatně dělí na pásy: kodek nemá kam schovat chybu, protože tam není dost detailu. |
| **Limit čekání na konvergenci** | 240 snímků | 2–600 (10 000) | Nejdelší čas, který může jeden výstupní snímek čekat, než bude přesný. Snímky, které ho dosáhnou, se přesto zapíší a započítají. |
| Shrnutí | | | `N snímků · okno: kumulativní/pevné/životnost`, a když je časová osa v režimu Vše: *(vykreslení přepne Vše na Přehrát, aby hlava přehrávání něco znamenala)*. |
| **Vykreslit video** / **Zrušit** | | | Spustí vykreslení; během něj ukazuje `snímek i / n · čekáno w · X MB` a kolik snímků nebylo přesných. Potřebuje datovou sadu. |

## Tipy {#tips}

- Velikost výstupu je velikost plátna ve fyzických pixelech (poměr pixelů displeje, nejvýš 2). Změnou velikosti okna prohlížeče ji změníte.
- Kumulativní historie nabuduje teplo během klipu; okno nebo životnost ukazují pohyblivý řez časem.
- Pozice klíčových snímků jsou souřadnice zobrazení: s [obrácenou osou světa](camera.md#invert-world-axis) klíče vytvořené před přepnutím ukazují po přepnutí někam jinam.

## Pro vývojáře {#for-developers}

### Co dělá vykreslení {#what-a-render-does}

1. Pořídí zkušební záznam snímku, aby zjistilo přesnou výstupní velikost ve fyzických pixelech.
2. Vybere kodek přes WebCodecs: **VP9** (`vp09.00.10.08`), jinak **VP8**, při zvoleném datovém toku a snímkové frekvenci. Bez `VideoEncoder` se zastaví hlášením *Tento prohlížeč nemá VideoEncoder – pro zápis videa je potřeba WebCodecs*; bez obou kodeků *Nepodporovaný video kodek (zkoušeno VP9, VP8)*.
3. Převezme nastavení, která vykreslení potřebuje: pozastaví přehrávání, vypne **adaptivní rozpočet**, zapne **postupné zpřesňování** a nastaví rozpočet spritů na 64 M na snímek (adaptivní rozpočet chrání snímkovou frekvenci, což je tu špatný cíl: každý pomalu konvergující snímek by bral jako důvod kreslit méně řádků, což potřebuje víc snímků ke konvergenci), a přepne časovou osu z **Vše** na **Přehrát**. Nastavení historie (kumulativní, okno, životnost) zůstane, jak je: vykreslení má být přesně to, na co jste se dívali, přehrané a zapsané.
4. Pro každý výstupní snímek *f* z *n*, při *u* = f / (n - 1):
   - umístí kameru do polohy dráhy v *u* (pokud jsou klíče);
   - přetočí hlavu přehrávání na stejný podíl *u* rozsahu časové osy (rozsah vybrané relace v přehrání krychlí);
   - vynutí čerstvý odhad, i když se kamera nehnula – převzetí akumulace předchozího snímku by zanechalo duchu předchozí okno;
   - čeká, snímek po snímku, dokud obraz není přesný (všechny kandidátní řádky nakresleny v jednom snímku, nebo akumulace dokončena), až do limitu čekání;
   - zachytí složený snímek a zakóduje ho, s klíčovým snímkem každé 2 sekundy výstupu, aby šel soubor přetáčet.
5. Složí snímky do souboru WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) s časovými značkami zvolenými podle snímkové frekvence – čas na hodinách, který každý snímek zabral, nehraje roli.
6. Obnoví rozpočet, zorné pole, režim časové osy, hlavu přehrávání a to, zda se přehrávalo.
7. Stáhne video jako `3dheat-<šířka>x<výška>-<snímky>f.webm` a ohlásí `N snímků při W×H, X MB – každý snímek přesný`, nebo kolik jich narazilo na limit čekání.

**Zrušit** zastaví po aktuálním snímku (*Vykreslení zrušeno.*) a obnoví nastavení.
