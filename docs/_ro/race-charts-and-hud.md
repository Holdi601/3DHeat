---
title: "Grafice și HUD"
parent: "Analiză de cursă"
nav_order: 53
lang: "ro"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafice și HUD

Graficele aliniază turele tale metru cu metru, ca să vezi unde a frânat un pilot mai târziu sau a ridicat piciorul mai devreme. Cardurile din stânga sus a vederii arată ce face fiecare mașină și fiecare pilot chiar acum.

![Grafice sub vedere: rânduri de decalaj, viteză, accelerație, frână și direcție pentru două ture, benzile de timp și cauză sus, și cursorul cu cardurile](../assets/img/en/race-charts-rows.webp)

## Graficele {#the-charts}

Fiecare tură pe o singură axă de distanță - metri de-a lungul referinței (vezi [o singură axă de distanță](race-corner-analysis.md#one-distance-axis)) - așa că același x este același loc pe traseu pentru fiecare tură. O tură este reprezentată singură (și se redă); o a doua tură din același traseu este reprezentată în raport cu ea. Fără nicio tură încărcată (sau când analiza a eșuat), zona spune: "Graficele apar după ce este încărcată o tură; încarcă o altă tură din același traseu ca să le compari."

### Ce conțin {#what-is-on-them}

- **Legenda**: culoarea și eticheta fiecărei ture reprezentate, referința marcată "(referință)"; "+N desenate, nereprezentate" când sunt mai multe ture vizibile decât cele reprezentate; **Grafice (N) ▾**; **Tot turul** cât timp este mărit; o linie de ajutor.
- **Două benzi** sus, pentru tura în focus:
  - *timp*: [harta timpului](race-replay-and-scene.md#time-map-where) ca bandă, roșu când pierzi, verde când câștigi;
  - *cauză*: fiecare pierdere a ei ca o bară peste locul cauzei ei, în culoarea cauzei; treci cu mouse-ul peste o bară ca să-i vezi titlul și costul.
- **Benzile de viraje**: o bandă umbrită de la intrarea în fiecare viraj până la ieșire (așa cum a fost găsită pe referință) și numele ei (`T1` …) sub axă, la apex.
- **Constatarea selectată**: o bandă în culoarea cauzei ei peste intervalul ei.
- **Rândurile** (grafice), câte unul pentru fiecare canal ales, fiecare cu numele lui și valorile de sus și de jos ale intervalului în stânga, o linie de zero acolo unde intervalul trece prin zero. Fiecare tură este o linie în culoarea ei: tura în focus de 2 px lățime și opacă, referința opacă, celelalte de 1,5 px la 75%. Rândul de decalaj lasă referința afară (este zero față de ea însăși).
- **Cursorul**: o linie verticală acolo unde este mașina de referință (sau unde este indicatorul), și un punct pentru fiecare mașină pe fiecare rând în afară de decalaj - la cursor toate mașinile sunt la același metru; altfel distanța fiecăreia la ceasul redării.

Cel mult **8** ture sunt reprezentate: tura în focus, cea mai bună din clasa ei și referința întâi, apoi celelalte în ordinea încărcării.

### Rândurile și înălțimile lor {#rows-and-their-heights}

Rândurile împart înălțimea graficului după greutate, niciunul mai jos de 16 px:

| Rând | Greutate |
|---|---|
| Decalaj (față de referință, secunde, cu semn) | 1,7 |
| Viteză (km/h) | 1,7 |
| un pedal (accelerație, frână, ambreiaj) | 1 |
| direcție | 1,1 |
| treaptă | 0,8 |
| un indicator luminos (frâna de mână, ABS …) | 0,55 |
| orice altceva | 1 |

Un canal cu un interval fix de afișare în tabel (pedalele 0-100%) îl folosește; ceilalți sunt potriviți cu porțiunea vizibilă a turelor. Un nume de rând prea lung pentru spațiu (un cuvânt lung într-o altă limbă) coboară valoarea de sus cu un rând acolo unde rândul este destul de înalt și este tăiat cu puncte de suspensie unde nu este; numele complet apare ca text de ajutor.

### Graficele implicite {#the-default-graphs}

Până când sunt alese graficele: **decalajul**, apoi fiecare canal pe care tabelul îl marchează `graph` și pe care turele le au - accelerație, frână, ambreiaj, frâna de mână, direcție, treaptă, viteză - cu excepția faptului că un canal de pedală sau indicator este lăsat afară, dacă nicio tură nu-l mișcă peste 0,02 (un ambreiaj care nu este apăsat niciodată nu este grafic). Ordinea este cea din tabel.

### Alegerea graficelor {#the-graph-picker}

**Grafice (N) ▾** deschide un panou deasupra butonului:

- o casetă de filtrare (se potrivește cu numele sau id-ul unui canal);
- **Implicite** (înapoi la setul implicit; textul de ajutor spune câte sunt) și **Închide**;
- *Decalaj față de referință*, apoi fiecare canal pe care îl au turele reprezentate, grupat (mișcare, comenzi, motor, ajutoare, pneuri, frâne, suspensie, roți, altele, cronometrare, poziție), câte o căsuță pentru fiecare; un canal pe fiecare roată este o linie cu un cip pentru fiecare roată (FL, FR, RL, RR).

Bifarea păstrează ordinea din tabel, oricare ar fi ordinea în care ai bifat. Alegerea rămâne până apeși **Implicite** sau până reîncarci. Canalele pe care tabelul nu le cunoaște sunt oferite la *altele*, numite după id-ul lor ("brakeLinePress" → "Brake line press").

### Mouse, rotița, mărirea, clicul {#hover-wheel-zoom-click}

| Acțiune | Face |
|---|---|
| mouse-ul deasupra | fiecare mașină, cardul ei și comenzile ei se mută la acel metru; un stâlp marchează locul pe traseu; un tabel listează valoarea fiecărei ture reprezentate pe fiecare rând de acolo (decalajul arătat ca "ref" pentru referință); deasupra cardurilor, "la N m - cursorul graficelor". Ieșirea din grafic predă controlul redării |
| rotița | avansează redarea de-a lungul turei cu 1/200 din deschiderea vizibilă la fiecare clic (Shift: de 5 ori), oprind redarea; când este mărit, vederea urmărește cursorul |
| Ctrl+rotița (Cmd+rotița) | mărește axa de distanță în jurul indicatorului, 1,25× ieșire / 0,8× intrare la fiecare clic, niciodată mai îngustă de 40 m; micșorarea până la tot turul încheie mărirea |
| rotița pe orizontală | panorează când este mărit (10% din deschidere la fiecare 100 de unități de derulare) |
| dublu clic, **Tot turul** | micșorează |
| clic | sare redarea la locul unde referința ajunge la acel metru |
| Shift+clic | aliniază mașinile acolo (vezi [alinierea](race-replay-and-scene.md#lining-up)) |

Graficele se redesenează în limba curentă când aceasta se schimbă.

Linia de ajutor din legendă spune același lucru pe scurt: "Mouse: toate mașinile acolo · rotița: pas de-a lungul turei · Ctrl+rotița: mărire · clic: sari · Shift+clic: aliniază".

## Cardurile mașinilor (HUD) {#the-car-cards-hud}

Sus în stânga a vederii, câte un card pentru fiecare tură vizibilă - cel mult **6**, primele șase ture vizibile în ordinea încărcării - pentru momentul în care se află redarea (sau cursorul graficelor).

**Antetul:** culoarea și eticheta turei; decalajul în direct - timpul acestei ture ca să ajungă la distanța ei curentă minus timpul referinței ca să ajungă la aceeași distanță, "+0,48 s" - sau "referință"; **⋯** ca să arăți sau să ascunzi toate celelalte valori (același lucru cu *Toate valorile de pe carduri*). Cardul mașinii urmărite este evidențiat.

**Mașina de sus:** conturul caroseriei în culoarea turei, cu o săgeată în față, patru pneuri (cele din față întoarse până la 28° odată cu direcția), fiecare colorat după temperatura lui, cu aceleași simboluri ca mașina 3D desenată plată: inelul de derapaj, bara suspensiei, strălucirea frânei, banda de uzură, bara de sarcină.

**Citirile:** viteza în km/h, timpul propriu al turei, distanța ei de-a lungul referinței.

**Comenzile:**

- un volan rotit de comanda de direcție (blocarea completă desenată ca 180°), cu procentul sub el;
- o bară pentru fiecare pedală, de la stânga la dreapta ca într-o cutie de pedale - ambreiaj, frână, accelerație - fiecare cu procentul și numele scurt, în culoarea ei (doar pedalele pe care le are tura);
- treapta (R pentru mers înapoi, N pentru neutru);
- un indicator mic pentru fiecare canal pornit/oprit pe care îl are tura - frâna de mână, ABS, TC, DRS, limitatorul de la boxe, în aer - aprins în culoarea lui cât timp este pornit (peste jumătate din interval);
- o citire pentru fiecare canal de nivel: distribuția frânei, setările ABS și TC, supraalimentarea, combustibilul.

**Urma comenzilor:** ultimele **6 secunde** ale fiecărei pedale (o bandă, fiecare în culoarea ei) și ale direcției (banda ei proprie, centrată), terminând în acest moment - ce a făcut pilotul pe drumul până aici. Până la 160 de puncte.

**Toate valorile** (⋯ sau *Toate valorile de pe carduri*): fiecare altă valoare scalară pe care o are tura în acest moment, apoi fiecare canal pe roată ca patru valori (FL FR RL RR), numite din tabelul canalelor sau din numele propriu al canalului, ordonate pe grup.

## Pentru dezvoltatori {#for-developers}

Cod: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Tabelul canalelor {#the-channel-table}

`CHANNELS` din [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) este singurul loc în care un canal este descris: unitatea lui, dacă este o valoare pe eșantion sau una pe roată (stocată ca `name.FL` …), grupul lui, un interval de afișare, cum este desenat pe mașină (`glyph`), cum apare pe card (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), dacă este un grafic implicit, dacă sare pe trepte în loc să se amestece (treaptă, indicatoare) și cum este arătat (scară, unitate, cifre). Etichetele și numele scurte sunt mesaje în fiecare limbă (`race.channel.<name>.label` / `.short`).

Canale cu un desen sau un grafic implicit:

| Canal | Unitate | Desenat ca | Grafic implicit |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedală (verde, roșu, …), arătat în % | da |
| `handbrake` | 0..1 | indicator | da |
| `steer` | -1..1, dreapta pozitivă | volan | da |
| `gear` | - | treaptă | da |
| `speed` | m/s, arătat km/h | - | da |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | indicator | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | citire de nivel | - |
| `tireTemp` (pe roată) | °C, afișare 40-130 | culoarea pneului | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (pe roată) | cum le scalează jocul, afișare ±1,5 | inel de derapaj | - |
| `combinedSlip`, `slipIndex` (pe roată) | afișare 0-1,5, 0-1 | inel de derapaj | - |
| `suspension` (pe roată) | 0..1 | bara suspensiei | - |
| `brakeTemp` (pe roată) | °C, afișare 100-900 | strălucirea frânei | - |
| `tireWear` (pe roată) | 0..1 | banda de uzură | - |
| `wheelLoad` (pe roată) | N, afișare 0-12 000 | bara de sarcină | - |

Altele din tabel (reprezentate grafic și listate, nedesenate): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (unghiul de derapare), `loose`, `lateral` (decalajul față de referință),
`rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, plus `time`, `distance`, `x`, `y`, `z`.

**Un canal care nu este în tabel** este tot citit, reprezentat grafic (la *altele*) și listat pe carduri, cu eticheta din numele lui propriu. **Ca să-i dai un nume, o unitate și un desen potrivite**, adaugă o intrare în tabel (și mesajul ei de etichetă în fiecare `src/i18n/locales/<language>/race-channels.json`). Un *fel* nou de desen pentru roată este o intrare în `WHEEL_GLYPHS` (glyph.ts) și gemenul ei plat `CARD_GLYPHS` (RaceHud.tsx); ambele sunt tipizate după fel, deci construcția eșuează până când există amândouă. `src/race/extensible.test.ts` verifică că necunoscutele ajung la grafice, că fiecare simbol din tabel poate fi desenat și că indicatoarele se aprind.
