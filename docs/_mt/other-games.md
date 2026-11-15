---
title: "Logħob ieħor tat-tellieqa"
parent: "Analiżi tat-tellieqa"
nav_order: 59
lang: "mt"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Logħob ieħor tat-tellieqa

Il-viewer jaqra dawriet minn ħafna logħob tas-sewqan, mhux minn wieħed biss. Din il-paġna telenka dawn il-logħob u tgħid kif tikseb dawriet minn kull wieħed.

## Il-logħob {#the-games}

| Logħba | Registratur | Slip fil-fajl? | Id tad-dinja mqalba? | Noti |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out fuq UDP), jew il-fajls tad-dawriet ta' FH Companion u l-fajl `.tele.gz` tagħhom | iva, għal kull rota (normalizzat) | iva (dinja b'xellug) | il-fajl `.tele.gz` ta' kull dawriet ta' FH Companion jagħti l-slip ta' kull rota; il-fajl tad-dawriet waħdu le |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (memorja kondiviża) | iva, għal kull rota | miksuba mid-dawriet | wkoll l-ABS u t-traction control li jaħdmu, it-tagħbija tar-roti, it-temperaturi |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | le, jinħadem mill-veloċitajiet tar-roti | miksuba mid-dawriet | rally: l-art imħalla u l-qfiż jiġu evalwati b'mod differenti |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | le | miksuba mid-dawriet | ma jibgħatx veloċitajiet tar-roti |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (mod) | le, jinħadem mill-veloċitajiet tar-roti | miksuba mid-dawriet | |
| Trackmania | il-plugin tal-Openplanet, `telemetry --game trackmania --install` | koeffiċjent ta' slip għal kull rota | miksuba mid-dawriet | fiżika arcade: l-iżliq jiġi evalwat b'mod differenti |
| iRacing | ħadd: il-fajl tiegħu `.ibt` | le (mhux irreġistrat); jinħadem mill-yaw | le (ibbażat fuq GPS) | ixgħel ir-reġistrazzjoni fil-karozza b'Alt+L |

## Kif tirreġistra dawriet {#how-to-record-a-lap}

1. Agħżel il-logħba tiegħek fit-tabella u oħloq it-tagħmir kif tgħid il-paġna tar-registratur għal dik il-logħba (issettjar fil-logħba, mod, jew xejn għal iRacing). Il-passi jvarjaw minn logħba għal oħra, għalhekk jinsabu fid-dokumenti tar-registraturi: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Ibda r-registratur, imbagħad issuq. Hu jikteb fajl wieħed għal kull dawriet.
3. Fit-tab **Analiżi tat-tellieqa** agħfas **Iftaħ fajls tad-dawriet…** u agħżel tnejn jew aktar mid-dawriet tal-istess kors (ara [Tagħbija tad-dawriet](race-loading-laps.md)).

Għal logħob tar-rally, ir-registratur jagħti fajl wieħed għal kull taqsima ta' stage, u għal Forza l-aktar bidu faċli huwa l-librerija ta' FH Companion bil-fajls `.tele.gz` tagħha ħdejn il-fajls tad-dawriet.

## Dak li d-dokumenti tar-registraturi jgħidu {#what-the-recorders-document}

Kif kull logħba tiġi rreġistrata, x'tibgħat, is-sorsi għat-layouts tagħha, u liema korsi jistgħu jiġu esportati mill-fajls tagħha, huwa dokumentat mir-registraturi stess: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (pubbliku, fi [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)), u l-fajl tad-dawriet li kull registratur jikteb huwa [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Dak li l-viewer jagħmel bihom {#what-the-viewer-does-with-them}

Kull logħba tispiċċa bħala fajls `heat3d-lap` (jew CSV tad-dawriet, jew tinqara direttament, bħalma jsir mal-fajl `.ibt` ta' iRacing), bl-ismijiet kanoniċi tal-kanali ta' `src/race/schema.ts` u blokk `meta` li jgħid x'tfisser in-numri tagħha: kif jitkejjel l-slip tagħha, jekk hijiex circuit jew rally jew arcade, u l-wiċċ meta jkun magħruf. Għalhekk it-tab **Analiżi tat-tellieqa** iħares lejhom kollha bl-istess mod. Meta ma jkunx imħabbat ebda mudell tal-kors, it-tab **Analiżi tat-tellieqa** jpingi triq mill-firxa stess tad-dawriet, għalhekk kull logħba tkun tista' tintuża mingħajr mudell tal-kors.

Dak li l-ebda logħba tar-rally ma tibgħat - is-slip tar-roti - il-viewer jaħdmu: mill-punt ta' kuntatt ta' kull rota jew mill-veloċità tal-wiċċ meta mqabbla mal-veloċità tal-karozza fejn logħba tibgħat waħda (`(rota - karozza) / karozza`), u mid-dawran tagħha u raġġ ta' rollar imkejjel fuq id-dawriet innifsu fejn tibgħat id-dawran biss. L-angolu tad-drift ejja mill-veloċità stess tal-karozza (Forza, il-logħob AC, Trackmania, RBR), jew mill-veloċità tad-dinja proġettata fuq l-assi tal-karozza (EA WRC, DiRT, BeamNG), jew mid-direzzjoni meta mqabbla mal-mogħdija. Jekk il-karozza tkunx fl-ajru ejja mill-kuntatt tar-roti tagħha, mit-tagħbijiet jew mis-suspensjoni. Ara `src/race/derive.ts`.

Fejn id-dinja ta' logħba hija b'xellug - ta' Forza hija hekk - il-kors joħroġ imqalleb fil-viewer; l-iSterzar u s-suspensjoni tad-dawriet jagħtuh bil-lest, u t-tab **Analiżi tat-tellieqa** joffri li jqallab assi. Logħob li l-handedness tagħha mhix dokumentata (RBR, BeamNG, Trackmania) jiġi ttrattat l-istess: jitkejjel, mhux jiġi assunt.

Minbarra l-kanali tas-sewqan, ir-registraturi jżommu dak li kull logħba żżid: l-ABS u t-traction control li jaħdmu fil-logħob AC, il-bias tal-brejk, id-DRS, il-pit limiter, il-boost u l-ħajja tal-pads u tad-discs tal-brejk; l-aid settings ta' iRacing, il-bias tal-brejk, il-fjuwil, it-temperaturi taż-żejt u tal-ilma, u kull kanal ieħor li jirreġistra taħt ismu stess. Il-viewer jpingihom mit-tabella tal-kanali tiegħu - lampi, livelli, glyphs, grafiċi - għalhekk irreġistrar ta' aktar ma jeħtieġ l-ebda bidla fil-viewer.
