---
title: "Referenca tipkovnice i miša"
parent: "Kamera i upravljanje"
nav_order: 2
lang: "hr"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Referenca tipkovnice i miša

Svaka tipka i radnja mišem na jednom mjestu, da lako nađete onu koja vam treba. Najprije kliknite na prikaz da bi imao tipkovnicu. Tipke se ignoriraju dok je fokus u tekstnom polju ili padajućem izborniku. Kratka verzija ispisana je i dolje lijevo u prikazu.

Brzo traženje:

| Želim ... | Pritisnite |
|---|---|
| letjeti | `W A S D`, povlačenje za gledanje |
| vidjeti sve | `F` |
| pustiti ili pauzirati | `K` |
| pustiti unatrag | `J` (ponovno pritisnite za pauzu), naprijed `L` |
| vidjeti što znače boje | `?` ili `F1` |
| poništiti na kartici Taktika | `Ctrl+Z` |

## Kamera {#camera}

Iz [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Ulaz | Učinak |
|---|---|
| `W` / `↑` | Naprijed u smjeru gledanja |
| `S` / `↓` | Natrag |
| `A` / `←` | Bočno lijevo |
| `D` / `→` | Bočno desno |
| `Space` / `E` | Gore |
| `Q` / lijevi `Ctrl` | Dolje |
| `Shift` (bilo koji) | Držite: 6 puta brže |
| lijevi `Alt` | Držite: 15% brzine |
| Lijevo ili desno povlačenje na prikazu | Gledanje (pokazivač zaključan dok je tipka držana) |
| Kotačić (perspektiva) | Brzina letenja ×1,5 po koraku (najviše 4 koraka po događaju kotačića) |
| Kotačić (paralelno) | Zumiranje |
| Desni klik | Iznad prikaza ne otvara kontekstni izbornik |

## Opće {#global}

Iz [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tipka | Učinak |
|---|---|
| `K` | Pusti / pauziraj [vremensku crtu](timeline.md) |
| `F` | Uokviri podatke |
| `C` | Kopira položaj kamere, skretanje i nagib ([očitavanje kamere](camera.md#camera-readout)) |
| `G` | Idi na upisanu točku: otvara okvir pod očitavanjem kamere |
| `Esc` | Zatvara karticu odabira; zatim prestaje gledati drugu jedinicu; zatim prestaje pratiti jedinicu |
| `T` | Uključuje ili isključuje izgled taktičkog prikaza ([Reprodukcija meča](match-replay.md#display-style)) |
| `?` / `F1` | Način pomoći: što znače boje ([Postavke, jedinice i tipke](settings.md#help-mode)) |
| `1` | [Toplina](heat.md) |
| `2` | [Razlika](difference.md) |
| `3` | [Toplina timova](team-heat.md) |
| `4` | [Linije](line-heat.md) |
| `]` | Granica udaljenog odsijecanja van ×1,12 (`Shift`: ×1,35) |
| `[` | Granica udaljenog odsijecanja unutra ÷1,12 (`Shift`: ÷1,35) |
| `\` | Granica udaljenog odsijecanja isključena / vraćena tamo gdje je bila ([Dubina i odsijecanje](depth-and-culling.md#keyboard)) |

Način **Preklapanje figura** nema tipku s brojem; odaberite ga u traci načina ili otvorite karticu Meč. Tipke s brojevima prolaze kroz istu provjeru kao traka načina: tipka za način koji traka za učitane podatke prikazuje kao nedostupan ne radi ništa.

## Reprodukcija meča {#match-replay}

U načinu Preklapanje figura, koji koristi kartica Meč ([Reprodukcija meča](match-replay.md)). Rade kad je jedinica praćena ili nije, osim gdje je napomenuto:

| Tipka | Učinak |
|---|---|
| `B` | Dodaje zabilješku: trenutak i kameru |
| `M` | 2D karta: kut, cijeli prikaz, isključeno |
| `V` / `Shift+V` | Sljedeći / prethodni pogled kamere na praćenu jedinicu |
| `H` | Prikaz na čelnom staklu u pogledima iz kokpita i zaključavanja |
| `Page Down` / `Page Up` | Sljedeći / prethodni događaj vrsta koje prikazuje popis događaja |
| `J` | Pusti unatrag; ponovno za pauzu |
| `L` | Pusti naprijed; ponovno za pauzu |
| `.` / `,` | Sekunda naprijed / natrag, pauzirano (`Shift`: deset sekundi) |
| `Esc` | Prvo prestaje gledati cilj, zatim prestaje pratiti |
| `Ctrl`+klik ili `Alt`+klik na jedinicu (u prikazu ili na popisu jedinica) | Gleda je iz praćene jedinice (prikaz dviju jedinica); ponovni klik je ispušta |
| `Shift`+klik na dvije jedinice | Mjeri među njima: smjer, udaljenost, razlika visina |

`V` treba praćenu jedinicu. Ovdje je `M` 2D karta, a na kartici Taktika znači "pomak".

## Praćenje jedinice {#following-a-unit}

Dok kamera prati jedinicu, kotačić i tipke za letenje upravljaju oko jedinice umjesto da slobodno lete ([Kamera](camera.md#while-following-a-unit)):

| Ulaz | Učinak |
|---|---|
| Kotačić, `W` / `S` | Bliže / dalje (više / niže u pogledu satelita). Ne u pogledima iz kokpita i zaključavanja. |
| `A` / `D`, `Q` / `E` | Kruženje oko jedinice (pogledi iza i orbite) |
| Povlačenje | Gledanje oko jedinice; u kokpitu, gledanje unutar njega |
| `V` / `Shift+V` | Sljedeći / prethodni pogled kamere |
| `H` | Prikaz na čelnom staklu (pogledi iz kokpita i zaključavanja) |
| `Esc` | Prestaje gledati drugu jedinicu, zatim prestaje pratiti |

## Ploča taktike {#tactics-board}

Na kartici Taktika ([Ploča taktike](tactics-board.md)). `F`, `C`, `G` i `T` rade kao gore; tipke s brojevima ne rade ništa.

| Tipka | Učinak |
|---|---|
| `Ctrl+Z` | Poništi |
| `Ctrl+Y` ili `Ctrl+Shift+Z` | Ponovi |
| `Enter` | Završava strelicu koja se crta (dvostruki klik ili desni klik radi isto) |
| `Esc` | Otkazuje povlačenje; inače ispušta strelicu ili pomak u tijeku; inače poništava odabir |
| `Delete` ili `Backspace` | Briše odabir |
| `W` / `E` / `R` | Alat Pomakni / Rotiraj / Skaliraj za odabir (shema tipki **W / E / R**) |
| `G` / `R` / `S` | Alat Pomakni / Rotiraj / Skaliraj za odabir (shema tipki **G / R / S**) |
| `R` | Ništa nije odabrano: okreće sljedeću figuru za postavljanje za 15°. `Shift+R` je vraća. |
| `M` | Odabrana figura: pomiče je na sljedeći klik |
| `K` | Pušta ili pauzira plan |
| Shift+klik | Dodaje ili uklanja iz odabira |
| Shift+povlačenje | Crta okvir oko onoga što treba odabrati |
| `Ctrl` dok povlačite ručicu | Hvata na mrežu ili na korak kuta |

Tipke alata rade samo dok je nešto odabrano. Kad ništa nije odabrano, `W A S D` lete kamerom kao i obično.

## Odabir klikom {#click-to-pick}

S uključenim **Klik pokazuje što je ondje** i isključenim ravnalom ([Odabir klikom](camera.md#click-to-pick)):

| Ulaz | Učinak |
|---|---|
| Lijevi klik (bez povlačenja više od 4 px) | Pokazuje podatkovnu točku ili, ako nje nema, mjesto na razini ispod pokazivača |

## Mjera {#measure}

S uključenim **Ravnalo aktivno** ([Mjera](measure.md)):

| Ulaz | Učinak |
|---|---|
| Lijevi klik (bez povlačenja više od 4 px) | Postavlja točku |
| Desni klik | Uklanja zadnju točku |

## Ostalo {#elsewhere}

| Gdje | Ulaz | Učinak |
|---|---|---|
| Hvatište bilo kojeg klizača (ručica uz broj) | Povlačenje gore / dolje | Mijenja vrijednost neprekidno, što brže što dalje povučete; držite `Shift` za fino podešavanje. Otpustite za zaustavljanje. |
| Prikaz brzine preko prikaza | Povlačenje gore / dolje | Mijenja brzinu letenja na isti način. |
| Okviri položaja | `Enter` | Primjenjuje upisani položaj ili orijentaciju. |
| Uređivač krivulje | Dvostruki klik / Alt-klik / desni klik | Dodaje točku / uklanja točku ([Oblik spritea](sprite-shape.md#the-curve-editor)). |

## Kartica Analiza utrke {#race-analysis-tab}

Na kartici Analiza utrke `K` pušta i pauzira reprodukciju utrke, `Home` je vraća na početak, a tipke s brojevima ne rade ništa. Pogledajte [Analiza utrke](race-analysis.md).

## Tipke koje preglednik prepušta prikazu {#keys-the-viewer-keeps-from-the-browser}

Neke prečice preglednika zatvorile bi ili ponovno učitale stranicu i izgubile učitanu sesiju, pa ih prikaz zadržava za sebe. Popis se generira iz koda: [Tipke preglednika](ref-browser-keys.md).

## Gamepad {#gamepad}

Pogledajte [Gamepad i HOTAS](gamepad.md).
