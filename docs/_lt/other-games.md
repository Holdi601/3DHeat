---
title: "Kiti lenktynių žaidimai"
parent: "Lenktynių analizė"
nav_order: 59
lang: "lt"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Kiti lenktynių žaidimai peržiūros programoje

Peržiūros programa skaito ratus ne tik iš vieno žaidimo, o iš daugelio. Šis puslapis jas išvardija ir parodo, kaip iš kiekvieno gauti ratą.

## Žaidimai {#the-games}

| Žaidimas | Įrašymo įrankis | Ar failuose yra slydimas? | Ar pasaulis atspindėtas? | Pastabos |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out per UDP) arba FH Companion ratų failai bei jų `.tele.gz` | taip, kiekvienam ratui (normalizuotas) | taip (kairiarankis pasaulis) | `.tele.gz` šalia kiekvieno FH Companion ratų failo duoda kiekvieno rato slydimą; vien ratų failas to neduoda |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (bendra atmintis) | taip, kiekvienam ratui | matuojama iš ratų | taip pat ABS ir traukos kontrolės veikimas, ratų apkrovos, temperatūros |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | ne, apskaičiuojama iš ratų greičių | matuojama iš ratų | ralis: birus gruntas ir šuoliai vertinami kitaip |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | ne | matuojama iš ratų | ratų greičių nėra |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (modifikacija) | ne, apskaičiuojama iš ratų greičių | matuojama iš ratų | |
| Trackmania | Openplanet papildinys, `telemetry --game trackmania --install` | kiekvieno rato slydimo koeficientas | matuojama iš ratų | arkadinė fizika: slydimas vertinamas kitaip |
| iRacing | nėra: jo paties `.ibt` failas | ne (neįrašoma); apskaičiuojama iš posūkio greičio | ne (pagal GPS) | įjunkite įrašymą automobilyje klavišais Alt+L |

## Kaip įrašyti ratą {#how-to-record-a-lap}

1. Raskite savo žaidimą lentelėje ir nustatykite jį taip, kaip sako įrašymo įrankio puslapis tam žaidimui (nustatymas žaidime, modifikacija arba nieko, jei tai iRacing). Žingsniai skiriasi pagal žaidimą, todėl jie aprašyti įrankių dokumentuose: [GameCapture: žaidimai](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Paleiskite įrašymo įrankį ir važiuokite. Jis įrašo po vieną failą kiekvienam ratui.
3. Skirtuke **Lenktynių analizė** spauskite **Įkelti ratų failus…** ir pasirinkite du ar daugiau to paties kelio ratų (žr. [Ratų įkėlimas](race-loading-laps.md)).

Ralio žaidimams įrankis įrašo po vieną failą kiekvienam ruožo bandymui. Forza pradėti lengviausia su FH Companion biblioteka ir jos `.tele.gz` failais šalia ratų failų.

## Ką aprašo įrašymo įrankiai {#what-the-recorders-document}

Kaip įrašomas kiekvienas žaidimas, ką jis siunčia, kokie yra jo išdėstymų šaltiniai ir kurias trasas galima eksportuoti iš jo failų, aprašo įrašymo įrankiai: [GameCapture: žaidimai](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (viešai, [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) saugykloje), o kiekvieno įrašymo įrankio rašomas ratų failas aprašytas [GameCapture: ratų formatas](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Ką peržiūros programa daro su jais {#what-the-viewer-does-with-them}

Kiekvienas žaidimas galiausiai tampa `heat3d-lap` failais (arba ratų CSV, arba skaitomas tiesiogiai, kaip iRacing `.ibt`). Jie turi kanoninius kanalų pavadinimus iš `src/race/schema.ts` ir `meta` bloką, kuris sako, ką reiškia jų skaičiai: kaip skaluojamas slydimas, ar tai trasa, ralis ar arkadinis žaidimas, ir paviršius, kai jis žinomas. Todėl skirtukas **Lenktynių analizė** su visais elgiasi vienodai. Kai trasos modelis neįkeltas, skirtukas **Lenktynių analizė** nubraižo kelią pagal pačių ratų išsibarstymą, todėl kiekvienas žaidimas tinka be trasos modelio.

Ko nesiunčia nė vienas ralio žaidimas – ratų slydimą – peržiūros programa apskaičiuoja. Kai žaidimas siunčia ratų kontaktinės dėmės arba paviršiaus greitį, ji lygina jį su automobilio greičiu (`(ratas - automobilis) / automobilis`). Kai siunčia tik sukimąsi, ji naudoja sukimąsi ir riedėjimo spindulį, išmatuotą pačiame rate. Nuokrypio kampas paimamas iš paties automobilio greičio vektoriaus (Forza, AC žaidimai, Trackmania, RBR), iš pasaulio greičio, projektuoto į automobilio ašis (EA WRC, DiRT, BeamNG), arba iš krypties palyginus su keliu. Ar automobilis ore, nustatoma pagal ratų kontaktą, apkrovas ar pakabą. Žr. `src/race/derive.ts`.

Kai žaidimo pasaulis yra kairiarankis (kaip Forza), trasa peržiūros programoje atsispindi; tai parodo paties rato vairavimas ir pakaba, o skirtukas **Lenktynių analizė** siūlo apversti ašį. Žaidimai, kurių kairiarankiškumas nedokumentuotas (RBR, BeamNG, Trackmania), tvarkomi taip pat: matuojama, o ne tariama.

Be vairavimo kanalų, įrašymo įrankiai saugo tai, ką prideda kiekvienas žaidimas: AC žaidimų ABS ir traukos kontrolės veikimą, stabdžių paskirstymą, DRS, pit limiter, turbo ir stabdžių trinkelių bei diskų ilgaamžiškumą; iRacing pagalbos nustatymus, stabdžių paskirstymą, kuro, alyvos ir vandens temperatūras bei kiekvieną kitą kanalą, kurį jis įrašo savo vardu. Peržiūros programa juos piešia pagal savo kanalų lentelę – lemputėmis, lygiais, ženklais, grafikais – todėl įrašant daugiau nereikia keisti peržiūros programos.
