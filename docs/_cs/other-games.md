---
title: "Ostatní závodní hry"
parent: "Analýza závodu"
nav_order: 59
lang: "cs"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Ostatní závodní hry v prohlížeči

Prohlížeč čte kola z mnoha závodních her, ne jen z jedné. Tato stránka je vypisuje a říká, jak z každé dostat kolo.

## Hry {#the-games}

| Hra | Nahrávač | Prokluz v souboru? | Svět zrcadlen? | Poznámky |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out přes UDP), nebo soubory kol z FH Companion a jejich `.tele.gz` | ano, u každého kola (normalizovaný) | ano (levotočivý svět) | `.tele.gz` vedle každého souboru kola z FH Companion dává prokluz každého kola; samotný soubor kola ne |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (sdílená paměť) | ano, u každého kola | změřeno z kol | také zásah ABS a trakční kontroly, zatížení kol, teploty |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | ne, dopočítá se z rychlostí kol | změřeno z kol | rallye: volný povrch a skoky se posuzují jinak |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | ne | změřeno z kol | žádné rychlosti kol |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (mod) | ne, dopočítá se z rychlostí kol | změřeno z kol | |
| Trackmania | plugin Openplanet, `telemetry --game trackmania --install` | koeficient prokluzu u každého kola | změřeno z kol | arkádová fyzika: smyky se posuzují jinak |
| iRacing | žádný: vlastní soubor `.ibt` | ne (nezaznamenává se); dopočítá se z otáčení kolem svislé osy | ne (podle GPS) | zapněte záznam v autě klávesami Alt+L |

## Jak nahrát kolo {#how-to-record-a-lap}

1. Vyberte svou hru v tabulce a nastavte ji podle stránky nahrávače pro tuto hru (nastavení ve hře, mod, nebo nic u iRacing). Kroky se u jednotlivých her liší, proto jsou v dokumentech nahrávačů: [GameCapture: hry](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Spusťte nahrávač a jeďte. Zapisuje jeden soubor na kolo.
3. Na kartě **Analýza závodu** stiskněte **Načíst soubory kol…** a vyberte dvě nebo více kol stejné trati (viz [Načítání kol](race-loading-laps.md)).

U rallye her zapisuje nahrávač jeden soubor na jeden průjezd etapou. U Forzy je nejsnazší začít s knihovnou FH Companion a soubory `.tele.gz` vedle souborů kol.

## Co dokumentují nahrávače {#what-the-recorders-document}

Jak se která hra nahrává, co posílá, zdroje jejích rozložení a které tratě lze z jejích souborů exportovat, to dokumentují nahrávače: [GameCapture: hry](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (veřejné, v [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Formát souboru kola, který každý nahrávač zapisuje, je popsán v [GameCapture: formát kola](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Co s nimi prohlížeč dělá {#what-the-viewer-does-with-them}

Každá hra skončí jako soubory `heat3d-lap` (nebo jako CSV kola, nebo se čte přímo, jako `.ibt` od iRacing), s kanonickými názvy kanálů z `src/race/schema.ts` a blokem `meta`, který říká, co jejich čísla znamenají: jak se škáluje prokluz, zda jde o okruh, rallye nebo arkádu, a povrch, je-li znám. Karta **Analýza závodu** se proto ke všem chová stejně. Když není načten model tratě, karta **Analýza závodu** nakreslí silnici z rozptylu samotných kol, takže je každá hra použitelná i bez modelu.

Co žádná z rallye her neposílá, prokluz pneumatik, prohlížeč dopočítá: z kontaktní plochy každého kola nebo z rychlosti povrchu proti rychlosti auta, tam kde hra nějakou posílá (`(kolo - auto) / auto`), a z otáčení kola a poloměru kola změřeného na samotném kole, tam kde posílá jen otáčení. Úhel driftu se bere z vlastní rychlosti auta (Forza, hry AC, Trackmania, RBR), nebo z rychlosti ve světě promítnuté na osy auta (EA WRC, DiRT, BeamNG), nebo z natočení vůči dráze. To, zda je auto ve vzduchu, plyne z kontaktu kol, zatížení nebo odpružení. Viz `src/race/derive.ts`.

Kde je svět hry levotočivý, jako u Forzy, prohlížeč trať zrcadlí. Vydají to řízení a odpružení kol a karta **Analýza závodu** nabídne převrácení osy. Hry, jejichž orientace není zdokumentována (RBR, BeamNG, Trackmania), se řeší stejně: měří se, nepředpokládá se.

Kromě jízdních kanálů si nahrávače ponechávají to, co každá hra přidává: u her AC zásahy ABS a trakční kontroly, rozložení brzd, DRS, omezovač pit, boost a životnost destiček a kotoučů brzd; u iRacing nastavení asistencí, rozložení brzd, palivo, teploty oleje a vody a každý další kanál, který loguje pod vlastním názvem. Prohlížeč je kreslí podle své tabulky kanálů (kontrolky, úrovně, symboly, grafy), takže nahrávání dalších kanálů nevyžaduje žádnou změnu prohlížeče.
