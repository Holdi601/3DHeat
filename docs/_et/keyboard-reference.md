---
title: "Klaviatuuri ja hiire viide"
parent: "Kaamera ja juhtimine"
nav_order: 2
lang: "et"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Klaviatuuri ja hiire juhend

Iga klahv ja hiiretoiming ühes kohas, et leiaksid vajaliku. Klõpsa kõigepealt vaatel, et sellel oleks klaviatuur. Klahve ignoreeritakse, kui tekstikast või rippmenüü on fookuses. Lühike versioon on kuvatud ka vaate all vasakul.

Kiire otsing:

| Ma tahan ... | Vajuta |
|---|---|
| lennata | `W A S D`, vaatamiseks lohista |
| näha kõike | `F` |
| esitada või peatada | `K` |
| esitada tagurpidi | `J` (vajuta uuesti peatamiseks), edasi `L` |
| näha, mida värvid tähendavad | `?` või `F1` |
| tagasi võtta Taktika sakis | `Ctrl+Z` |

## Kaamera {#camera}

[`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts) järgi.

| Sisend | Mõju |
|---|---|
| `W` / `↑` | Edasi mööda vaatesuunda |
| `S` / `↓` | Tagasi |
| `A` / `←` | Külgsamm vasakule |
| `D` / `→` | Külgsamm paremale |
| `Tühik` / `E` | Üles |
| `Q` / vasak `Ctrl` | Alla |
| `Shift` (kumbki) | Hoia: 6× kiirus |
| vasak `Alt` | Hoia: 15% kiirus |
| Vaates vasak või parem lohistus | Vaatamine (hiireklahv kinni hoitud ajal lukus) |
| Ratas (perspektiiv) | Lennukiirus ×1,5 sakki kohta (kõige rohkem 4 sakki ühe ratta sündmuse kohta) |
| Ratas (paralleelne) | Suurendus |
| Parem klõps | Vaate kohal ei avane kontekstimenüüd |

## Üldine {#global}

[`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx) järgi.

| Klahv | Mõju |
|---|---|
| `K` | [Ajajoone](timeline.md) esitamine / peatamine |
| `F` | Andmete raamimine |
| `C` | Kopeeri kaamera asukoht, yaw ja pitch ([kaamera näit](camera.md#camera-readout)) |
| `G` | Mine sisestatud punkti: avab kasti kaamera näidu all |
| `Esc` | Sulgeb valiku kaardi; siis lõpetab teise üksuse vaatamise; siis lõpetab üksuse jälgimise |
| `T` | Taktikalise kuvamise vaade sees või väljas ([Mängu taasesitus](match-replay.md#display-style)) |
| `?` / `F1` | Abirežiim: mida värvid tähendavad ([Seaded, üksused ja klahvid](settings.md#help-mode)) |
| `1` | [Soojus](heat.md) |
| `2` | [Erinevus](difference.md) |
| `3` | [Võistkondade soojus](team-heat.md) |
| `4` | [Jooned](line-heat.md) |
| `]` | Kauge lõikepiir välja ×1,12 (`Shift`: ×1,35) |
| `[` | Kauge lõikepiir sisse ÷1,12 (`Shift`: ÷1,35) |
| `\` | Kauge lõikepiir välja / tagasi sisse, kus see oli ([Sügavus ja kärpimine](depth-and-culling.md#keyboard)) |

Režiimil **Kujude ülekate** ei ole numbriklahvi; vali see režiimiribalt või ava Mängu sakk. Numbriklahvid läbivad sama kontrolli mis režiimiriba: klahv režiimi jaoks, mida riba näitab laetud andmete jaoks kättesaamatuna, ei tee midagi.

## Mängu taasesitus {#match-replay}

Režiimis Kujude ülekate, mida kasutab Mängu sakk ([Mängu taasesitus](match-replay.md)). Need töötavad, kas üksust jälgitakse või mitte, välja arvatud kus märgitud:

| Klahv | Mõju |
|---|---|
| `B` | Lisa järjehoidja: hetk ja kaamera |
| `M` | 2D kaart: nurk, kogu vaade, väljas |
| `V` / `Shift+V` | Jälgitava üksuse järgmine / eelmine kaamera vaade |
| `H` | Peavaate kuva kabiinis ja lukuvaadetes |
| `Page Down` / `Page Up` | Järgmine / eelmine sündmus liikidest, mida sündmuste loend näitab |
| `J` | Esita tagurpidi; uuesti peatamiseks |
| `L` | Esita edasi; uuesti peatamiseks |
| `.` / `,` | Sekund edasi / tagasi, peatatult (`Shift`: kümme sekundit) |
| `Esc` | Lõpeta sihtmärgi vaatamine esmalt, siis lõpeta jälgimine |
| `Ctrl`+klõps või `Alt`+klõps üksusel (vaates või üksuste loendis) | Vaata seda jälgitavalt üksuselt (kahe üksuse vaade); klõpsa uuesti, et see lahti lasta |
| `Shift`+klõps kahel üksusel | Mõõda nende vahel: laager, kaugus, kõrguste vahe |

`V` nõuab jälgitavat üksust. `M` on siin 2D kaart, Taktika sakis aga "liiguta".

## Üksuse jälgimine {#following-a-unit}

Kui kaamera jälgib üksust, juhib ratas ja lennuklahvid kaamerat ümber üksuse, mitte ei lenda vabalt ([Kaamera](camera.md#while-following-a-unit)):

| Sisend | Mõju |
|---|---|
| Ratas, `W` / `S` | Lähemale / kaugemale (satelliitvaates kõrgemale / madalamale). Mitte kabiinis ja lukuvaadetes. |
| `A` / `D`, `Q` / `E` | Tiir ümber üksuse (jälitus- ja tiirevaated) |
| Lohistamine | Vaata ümber üksuse; kabiinis vaata ringi seesmiselt |
| `V` / `Shift+V` | Järgmine / eelmine kaamera vaade |
| `H` | Peavaate kuva (kabiin ja lukuvaated) |
| `Esc` | Lõpeta teise üksuse vaatamine, siis lõpeta jälgimine |

## Taktika tahvel {#tactics-board}

Taktika sakis ([Taktika tahvel](tactics-board.md)). `F`, `C`, `G` ja `T` töötavad nagu ülal; numbriklahvid ei tee midagi.

| Klahv | Mõju |
|---|---|
| `Ctrl+Z` | Tagasi võtmine |
| `Ctrl+Y` või `Ctrl+Shift+Z` | Taastamine |
| `Enter` | Lõpeta joonistatav nool (topeltklõps või parem klõps teeb sama) |
| `Esc` | Tühista lohistamine; muidu eemalda nool või pooleli olev liigutamine; muidu tühista valik |
| `Delete` või `Backspace` | Kustuta valik |
| `W` / `E` / `R` | Liiguta / Pööra / Skaleeri žest valiku jaoks (klahviskeem **W / E / R**) |
| `G` / `R` / `S` | Liiguta / Pööra / Skaleeri žest valiku jaoks (klahvi skeem **G / R / S**) |
| `R` | Kui midagi pole valitud: pööra järgmist asetatavat kuju 15° võrra. `Shift+R` pöörab tagasi. |
| `M` | Kui kuju on valitud: liiguta see järgmise klõpsu kohta |
| `K` | Esita või peata plaan |
| Shift+klõps | Lisa valikule või eemalda sealt |
| Shift+lohistamine | Joonista kast, mida valida |
| `Ctrl` käepidet lohistades | Kinnita ruudustikule või nurga sammule |

Žesti klahvid töötavad ainult siis, kui midagi on valitud; kui midagi pole valitud, lendab `W A S D` kaamerat nagu tavaliselt.

## Klõpsamine valimiseks {#click-to-pick}

Kui **Klõps näitab, mis seal on** on sees ja joonlaud väljas ([Klõpsamine valimiseks](camera.md#click-to-pick)):

| Sisend | Mõju |
|---|---|
| Vasak klõps (lohistamata rohkem kui 4 px) | Näita andmepunkti või muidu taseme kohta osuti all |

## Mõõtmine {#measure}

Kui **Joonlaud aktiivne** ([Mõõtmine](measure.md)):

| Sisend | Mõju |
|---|---|
| Vasak klõps (lohistamata rohkem kui 4 px) | Pane punkt |
| Parem klõps | Eemalda viimane punkt |

## Mujal {#elsewhere}

| Kus | Sisend | Mõju |
|---|---|---|
| Iga liugur (käepide numbri kõrval) | Lohista üles / alla | Muuda väärtust pidevalt, seda kiiremini, mida kaugemale lohistad; hoia `Shift` peenhäälestuseks. Vabasta peatamiseks. |
| Kiiruse näit vaate kohal | Lohista üles / alla | Muuda lennukiirust samamoodi. |
| Asendi kastid | `Enter` | Rakenda sisestatud asukoht või orientatsioon. |
| Kõvera redaktor | Topeltklõps / Alt-klõps / parem klõps | Lisa punkt / eemalda punkt ([Spraidi kuju](sprite-shape.md#the-curve-editor)). |

## Raja analüüsi sakk {#race-analysis-tab}

Raja analüüsi sakis esitab ja peatab `K` raja taasesituse, `Home` kerib selle tagasi ja numbriklahvid ei tee midagi. Vt [Raja analüüs](race-analysis.md).

## Klahvid, mille vaataja hoiab brauserist kinni {#keys-the-viewer-keeps-from-the-browser}

Mõned brauseri otseteed sulgeksid või laeksid lehe uuesti ja kaotaksid laetud seansi; vaataja hoiab need enda jaoks. Loend on koodist genereeritud: [Brauseri klahvid](ref-browser-keys.md).

## Mängupult {#gamepad}

Vt [Mängupult ja HOTAS](gamepad.md).
