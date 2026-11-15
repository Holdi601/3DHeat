---
title: "Referenca tastature i miša"
parent: "Kamera i upravljanje"
nav_order: 2
lang: "bs"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Referenca tastature i miša

Svaka tipka i radnja mišem na jednom mjestu, da lako nađeš onu koja ti treba. Prvo klikni na prikaz da bi imao tastaturu. Tipke se ignorišu dok je fokus u polju za tekst ili padajućem meniju. Kratka verzija je također ispisana dolje lijevo na prikazu.

Brzi pronalazak:

| Želim da ... | Pritisni |
|---|---|
| letim | `W A S D`, prevuci za gledanje |
| vidim sve | `F` |
| pustim ili pauziram | `K` |
| reproduciram unazad | `J` (pritisni ponovo za pauzu), unaprijed `L` |
| vidim šta znače boje | `?` ili `F1` |
| poništim u kartici Taktika | `Ctrl+Z` |

## Kamera {#camera}

Iz [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Unos | Efekat |
|---|---|
| `W` / `↑` | Naprijed u smjeru gledanja |
| `S` / `↓` | Nazad |
| `A` / `←` | Bočno lijevo |
| `D` / `→` | Bočno desno |
| `Space` / `E` | Gore |
| `Q` / lijevi `Ctrl` | Dolje |
| `Shift` (bilo koji) | Držanje: 6× brzina |
| lijevi `Alt` | Držanje: 15% brzine |
| Lijevo ili desno prevlačenje na prikazu | Gledanje (pokazivač zaključan dok je dugme pritisnuto) |
| Točkić (perspektiva) | Brzina letenja ×1,5 po zarezu (najviše 4 zareza po događaju točkića) |
| Točkić (paralelno) | Zumiranje |
| Desni klik | Na prikazu ne otvara kontekstni meni |

## Opšte {#global}

Iz [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tipka | Efekat |
|---|---|
| `K` | Reprodukcija / pauza [vremenske linije](timeline.md) |
| `F` | Uokviri podatke |
| `C` | Kopiraj poziciju kamere, yaw i pitch ([očitavanje kamere](camera.md#camera-readout)) |
| `G` | Idi na upisanu tačku: otvara okvir ispod očitavanja kamere |
| `Esc` | Zatvori karticu izbora; zatim prestani gledati drugu jedinicu; zatim prestani pratiti jedinicu |
| `T` | Taktički prikaz uključen ili isključen ([Reprodukcija meča](match-replay.md#display-style)) |
| `?` / `F1` | Režim pomoći: šta znače boje ([Postavke, jedinice i tipke](settings.md#help-mode)) |
| `1` | [Toplota](heat.md) |
| `2` | [Razlika](difference.md) |
| `3` | [Toplota timova](team-heat.md) |
| `4` | [Linije](line-heat.md) |
| `]` | Granica daljinskog odsijecanja van ×1,12 (`Shift`: ×1,35) |
| `[` | Granica daljinskog odsijecanja unutra ÷1,12 (`Shift`: ÷1,35) |
| `\` | Granica daljinskog odsijecanja isključena / ponovo uključena tamo gdje je bila ([Dubina i odsijecanje](depth-and-culling.md#keyboard)) |

Režim **Preklapanje figura** nema tipku s brojem; izaberi ga u traci režima ili otvori karticu Meč. Tipke s brojevima prolaze kroz istu provjeru kao traka režima: tipka za režim koji traka prikazuje kao nedostupan za učitane podatke ne radi ništa.

## Reprodukcija meča {#match-replay}

U režimu Preklapanje figura, koji koristi kartica Meč ([Reprodukcija meča](match-replay.md)). Rade bez obzira na to da li je jedinica praćena ili ne, osim gdje je naznačeno:

| Tipka | Efekat |
|---|---|
| `B` | Dodaj oznaku: trenutak i kameru |
| `M` | 2D karta: ugao, cijeli prikaz, isključeno |
| `V` / `Shift+V` | Sljedeći / prethodni pogled kamere praćene jedinice |
| `H` | Prikaz na čeonom staklu u kokpitu i pogledima padlock |
| `Page Down` / `Page Up` | Sljedeći / prethodni događaj vrsta koje lista događaja prikazuje |
| `J` | Reprodukcija unazad; ponovo, za pauzu |
| `L` | Reprodukcija unaprijed; ponovo, za pauzu |
| `.` / `,` | Sekunda naprijed / nazad, pauzirano (`Shift`: deset sekundi) |
| `Esc` | Prvo prestani gledati cilj, zatim prestani pratiti |
| `Ctrl`+klik ili `Alt`+klik na jedinicu (u prikazu ili u listi jedinica) | Gledaj je iz praćene jedinice (prikaz dvije jedinice); ponovo klikni da je odbaciš |
| `Shift`+klik na dvije jedinice | Mjeri između njih: smjer, daljina, razlika visine |

`V` treba praćenu jedinicu. `M` je ovdje 2D karta, a u kartici Taktika znači „pomjeri".

## Praćenje jedinice {#following-a-unit}

Dok kamera prati jedinicu, točkić i tipke za letenje upravljaju oko jedinice umjesto da slobodno lete ([Kamera](camera.md#while-following-a-unit)):

| Unos | Efekat |
|---|---|
| Točkić, `W` / `S` | Bliže / dalje (više / niže u satelitskom prikazu). Ne u pogledima kokpita i padlock. |
| `A` / `D`, `Q` / `E` | Kruženje oko jedinice (pogledi Iza i Orbita) |
| Prevlačenje | Gledanje oko jedinice; u kokpitu, gledanje unutar njega |
| `V` / `Shift+V` | Sljedeći / prethodni pogled kamere |
| `H` | Prikaz na čeonom staklu (pogledi kokpita i padlock) |
| `Esc` | Prestani gledati drugu jedinicu, zatim prestani pratiti |

## Tabla taktike {#tactics-board}

U kartici Taktika ([Tabla taktike](tactics-board.md)). `F`, `C`, `G` i `T` rade kao gore; tipke s brojevima ne rade ništa.

| Tipka | Efekat |
|---|---|
| `Ctrl+Z` | Poništi |
| `Ctrl+Y` ili `Ctrl+Shift+Z` | Ponovi |
| `Enter` | Završi strelicu koja se crta (dupli klik ili desni klik radi isto) |
| `Esc` | Otkaži prevlačenje; inače ukloni strelicu ili pomjeranje u toku; inače poništi izbor |
| `Delete` ili `Backspace` | Obriši izbor |
| `W` / `E` / `R` | Alat za pomjeranje / rotaciju / skaliranje za izbor (šema tipki **W / E / R**) |
| `G` / `R` / `S` | Alat za pomjeranje / rotaciju / skaliranje za izbor (šema tipki **G / R / S**) |
| `R` | Kada ništa nije izabrano: okreni sljedeću figuru za postavljanje za 15°. `Shift+R` je vraća. |
| `M` | Kada je figura izabrana: pomjeri je na sljedeći klik |
| `K` | Reprodukcija / pauza plana |
| Shift+klik | Dodaj u izbor ili ukloni iz njega |
| Shift+prevlačenje | Nacrtaj okvir oko onoga što treba izabrati |
| `Ctrl` dok prevlačiš ručicu | Poravnaj na mrežu ili korak ugla |

Tipke alata rade samo dok je nešto izabrano; kada ništa nije izabrano, `W A S D` lete kamerom kao i obično.

## Klik za izbor {#click-to-pick}

Uz uključeno **Klik pokazuje šta je tamo** i isključeno ravnalo ([Klik za izbor](camera.md#click-to-pick)):

| Unos | Efekat |
|---|---|
| Lijevi klik (bez prevlačenja više od 4 px) | Prikaži tačku podataka, ili inače mjesto na nivou, ispod pokazivača |

## Mjera {#measure}

Uz **Ravnalo aktivno** ([Mjera](measure.md)):

| Unos | Efekat |
|---|---|
| Lijevi klik (bez prevlačenja više od 4 px) | Postavi tačku |
| Desni klik | Ukloni posljednju tačku |

## Drugdje {#elsewhere}

| Gdje | Unos | Efekat |
|---|---|---|
| Ručica svakog klizača (ručica pored broja) | Prevuci gore / dolje | Mijenja vrijednost neprekidno, što brže što dalje prevlačiš; drži `Shift` za fino podešavanje. Otpusti za zaustavljanje. |
| Prikaz brzine iznad prikaza | Prevuci gore / dolje | Mijenja brzinu letenja na isti način. |
| Okviri položaja | `Enter` | Primijeni upisani položaj ili orijentaciju. |
| Uređivač krive | Dupli klik / Alt-klik / desni klik | Dodaj tačku / ukloni tačku ([Oblik sprajta](sprite-shape.md#the-curve-editor)). |

## Kartica Analiza utrke {#race-analysis-tab}

U kartici Analiza utrke `K` pušta i pauzira reprodukciju utrke, `Home` je vraća unazad, a tipke s brojevima ne rade ništa. Vidi [Analiza utrke](race-analysis.md).

## Tipke koje prikaz zadržava iz preglednika {#keys-the-viewer-keeps-from-the-browser}

Neke prečice preglednika bi zatvorile ili ponovo učitale stranicu i izgubile učitanu sesiju; prikaz ih zadržava za sebe. Spisak je generisan iz koda: [Tipke preglednika](ref-browser-keys.md).

## Gamepad {#gamepad}

Vidi [Gamepad i HOTAS](gamepad.md).
