---
title: "Predvajanje in 3D prizor"
parent: "Analiza dirke"
nav_order: 52
lang: "sl"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Predvajanje in 3D prizor

Krogi se predvajajo skupaj, kot dirka, in vidite, kje se en avto oddalji. Tukaj je opisano vse, kar vidite v 3D pogledu zavihka **Analiza dirke**: vožene linije, barve na progi, avti in oznake.

![Zemljevid vzrokov z avti, poravnanimi 40 m pred ovinkom: obarvana proga, dva avta in zastavica](../assets/img/en/race-replay-lined-up.webp)

## Ura predvajanja {#the-replay-clock}

Ena ura poganja vsak krog: sekunde **referenčnega** kroga. Motor jo med predvajanjem premakne v vsakem okviru (za čas okvirja × hitrost predvajanja); ob koncu se, kadar je vklopljen **Ponavljaj**, vrne na 0, sicer se ustavi. Ura namerno ni del shrambe, da se stranska vrstica ne prikazuje znova vsak okvir; zaslon in grafi se nanjo naročijo in se posodobijo največ enkrat na okvir.

**Dolžina predvajanja** je najdaljši čas, ki ga kateri koli krog preteče na uri: čas vsakega kroga (minus njegov zamik v *Poravnano*), ali čas reference v *Drug ob drugem*.

## Vrstica za predvajanje {#the-transport-bar}

Pod pogledom, od leve proti desni:

| Kontrola | Naredi |
|---|---|
| ⏮ | nazaj na začetek (tudi **Home**) |
| ▶ / ❚❚ | predvajaj / premor (tudi **K**) |
| hitrost | 0,25×, 0,5×, 1×, 2×, 4× |
| drsnik za pregled | nastavi uro neposredno, v korakih po 0,01 s |
| ura | `čas / dolžina · metri`: ura kot čas kroga, dolžina predvajanja in kako daleč po referenci je avto reference |
| *Od štartne črte* / *Poravnano* / *Drug ob drugem* | način predvajanja (spodaj) |
| **Poravnaj tukaj** | postavi vsak avto tja, kjer je zdaj referenca, in nadaljuje od tam |
| **Ponavljaj** | ob koncu začni znova (privzeto vklopljeno) |
| **Skrij grafe** / **Prikaži grafe** | grafi razdalje pod vrstico |

Gumbi so onemogočeni, dokler niso naloženi krogi (en krog zadostuje za predvajanje; primerjave potrebujejo dva).

## Načini predvajanja {#replay-modes}

Kako čas vsakega kroga sledi uri:

| Način | Čas vsakega kroga | Kaj prikaže |
|---|---|---|
| **Od štartne črte** (`start`) | sama ura | vsak krog od svojega začetka: dirka med njimi, razlika raste, kot je rasla na progi |
| **Poravnano** (`anchor`) | ura plus zamik kroga | vsak avto na istem mestu ob istem trenutku, nato spuščen – kaj se zgodi od tam naprej, ne od začetka kroga |
| **Drug ob drugem** (`locked`) | čas, ob katerem je krog dosegel trenutno razdaljo reference | vsak avto zadržan na razdalji reference ves krog: hitrosti in vnosi primerjani meter za metrom |

Uporabite, kadar:

- **Od štartne črte**: želite videti, kdo je naprej in kako raste razlika.
- **Poravnano**: želite vedeti, kaj se zgodi v enem ovinku ali na eni ravnini, pri čemer je vsak tam na enaki točki.
- **Drug ob drugem**: želite primerjati, kaj vozniki počnejo s pedali in volanom na istem mestu na progi.

**Zamiki v *Poravnano*:** za sidro na `s` metrih vzdolž reference je zamik vsakega kroga njegov lastni čas pri `s` minus čas reference pri `s`, obe vrednosti sta prebrani iz poravnanih krogov (glej [ena os razdalje](race-corner-analysis.md#one-distance-axis)). Krog, ki ne pokrije `s`, ohrani zamik 0. Izbira *Poravnano* na gumbih načina pripne sidro na trenutno razdaljo reference.

Bel drog z zastavico (14 m visok) označi sidro v načinu *Poravnano*.

### Poravnavanje {#lining-up}

| Dejanje | Sidro | Ura |
|---|---|---|
| **Poravnaj tukaj** | kjer je zdaj referenca | nespremenjena |
| Shift+klik na grafe | kliknjeni meter | 1,5 s pred trenutkom, ko jo referenca doseže |
| ugotovitev v *Kje se izboljšati*, oštevilčena značka na progi, vrstica *Ovinek za ovinkom* z ugotovitvijo | 40 m pred mestom, kjer se začne vzrok ugotovitve | 1,5 s pred tem mestom; nato predvaja |
| dogodek nadzora avta, oznaka zadetka | 40 m pred dogodkom | 1,5 s pred; nato predvaja |
| krog v statistiki proge | kot njegova ugotovitev ali dogodek | kot zgoraj, s tem krogom v fokusu |

Če si ogledate ugotovitev, jo kamera tudi uokviri – krogla okoli sredine razpona ugotovitve, polmer je večji od 40 m in polovice njene dolžine plus 30 m (60 m za dogodek) – razen če kamera sledi avtu.

### Kamera za zasledovanje {#chase-camera}

⌖ na seznamu krogov naredi, da kamera sledi temu avtu: 2,5 + 4 × velikost avta metrov za njim in 0,9 + 1,1 × velikost avta metrov nad njim, gleda vzdolž smeri vožnje, nagnjena navzdol proti avtu, zglajena (20 % poti vsak okvir), da se ne trese ob vsakem nihaju. ⌖ še enkrat jo sprosti. Zasledovani avto je narisan nekoliko svetlejše, z belim obročem na tleh, njegova kartica pa je poudarjena.

## Razdelek Pogled {#the-view-section}

| Kontrola | Privzeto | Naredi |
|---|---|---|
| **Črte** / **Zemljevid časa** / **Zemljevid vzrokov** / **Zemljevid napak** | Zemljevid časa | kar je naslikano vzdolž proge (spodaj); *Črte* ne riše ničesar |
| legenda | - | *pridobi ↔ izgublja* za zemljevid časa, barve vzrokov za zemljevid vzrokov, *malo krogov ↔ največ krogov* za zemljevid napak |
| **Vožene linije** | vklopljeno | linija vsakega vidnega kroga v njegovi barvi |
| **Avti** | vklopljeno | avti in viri kartic HUD |
| **Pnevmatike in vzmetenje** | vklopljeno | temperatura pnevmatik, obroči zdrsa, potisne palice vzmetenja in drugi simboli po kolesih ter strešne luči na avtih |
| **Oznake** | vklopljeno | imena ovinkov, oštevilčene značke, oznake zadetkov, oznake ovinkov na zemljevidu napak |
| **Steza iz krogov** | vklopljeno | cestna površina za progo brez izločenega modela (skrito, ko je naložen model proge) |
| **Vse vrednosti na karticah** | izklopljeno | vsak kanal, naveden na vsaki kartici HUD |
| **Prave oblike avtomobilov** | vklopljeno | vsak avto v obliki svojega ustreznika (glej [Avti](#the-cars)); izklopljeno: odprt enosedež, ki ne skriva ničesar od telemetrije |
| **Velikost avta** | 1× | od 1× do 10× v korakih po 0,5; 1× je prava velikost avta, dolg in širok, kot je v igri. Nič drugega ne spremeni tega drsnika |

## Vožene linije {#driven-lines}

Pot vsakega vidnega kroga skozi lastne vzorce, v njegovi barvi, narisana
0,12 m pod zabeleženim položajem (zabeleženi položaj avta je njegova referenčna
točka, 0,28 do 0,47 m nad cesto na izločenih progah Forze). Točka se ohrani na
vsakih 1,5 m; pri več kot 10 vidnih krogih krogi, ki si jih ne ogledujete,
ohranijo eno na vsakih 6 m (vsako oglišče gre v grafično kartico vsak okvir).

## Zemljevidi {#the-maps}

Vsi trije so traki vzdolž poti **reference**, 0,2 m pod zabeleženimi položaji,
en četverokotnik na vsak korak mreže 2 m.

### Zemljevid časa (`where`) {#time-map-where}

Za izbrani krog: sekunde pridobljene ali izgubljene na meter v primerjavi s
krogom, s katerim se primerja na tisti točki (najboljši iz njegovega razreda ali,
za referenco, najhitrejši drugi krog skozi vsak odsek), iz spremembe poravnane
delte na korak mreže, zglajene čez ±10 m. Rdeče tam, kjer izgublja čas, zeleno
tam, kjer pridobi, sivo vmes; barvna lestvica je 95. percentil absolutnih
vrednosti, zato so konice odrezane in je večina kroga v razponu. Širina 6 m.

### Zemljevid vzrokov (`why`) {#cause-map-why}

Za izbrani krog: vsaka izguba je naslikana na razponu, kjer je njen **vzrok**
(ne tam, kjer se čas kaže), obarvana z skupino vzroka, pri čemer najdražja
ugotovitev zmaga, kadar se dva prekrivata. Širina `3 + 9·√(strošek / največji strošek)`
metrov; kjer ni bilo izgube, siv pas 2 m. Ugotovitev, izbrana v
*Kje se izboljšati*, je naslikana belo.

| Skupina | Barva | Ugotovitve |
|---|---|---|
| zaviranje | oranžna | izgube voznika v fazi zaviranja |
| vstop | magenta | izgube voznika pri vstopu in skozi sredino |
| izhod | modra | izgube voznika na izhodu |
| ravnina | rumena | izgube voznika na ravnini |
| avto | siva | kar pojasni avto |
| okoliščine | temno siva | situacija (štart dirke proti letečemu krogu) |

### Zemljevid napak {#mistake-map}

Koliko vseh krogov (izbranih razredov v statistiki proge) je naredilo napako na
vsakem metru – katere koli vrste ali samo tiste, izbrane v statistiki. Vsak krog
šteje enkrat na meter; razpon vsake napake je razširjen za 6 m na vsako stran, da
se kratka vidi. Širina `3 + 10·(krogi / največ krogov)` metrov in barva od
zatemnjene rjave do svetle oranžne; siv pas 2 m tam, kjer ni napake naredil noben
krog. Glej [Statistika proge](race-course-statistics.md#the-mistake-map).

## Steza iz krogov {#track-from-the-laps}

Za igro, katere proga še ni izločena, se pod črtami nariše cesta: tako široka,
kot se krogi razprostirajo čez referenco (bočni odmiki znotraj 25 m se štejejo)
plus 2 m na vsako stran, vsaj 4 m na vsako stran referenčne črte, zglajena čez
±8 točk mreže (±16 m), v asfaltno sivi barvi z svetlimi robnimi črtami, 0,3 m pod
zabeleženimi položaji. Skrito, ko je v **Nivoju** naložen model proge.

## Zadetki in trki na progi {#hits-and-crashes-on-the-track}

Zadetki in trki vsakega vidnega kroga (glej
[Dogodki nadzora avta](race-control-events.md#hits-and-crashes)) so označeni tam,
kjer so se zgodili, kadarkoli so narisane črte ali avti: koničasta zvezda –
rdeča za trk, jantarna za zadetek – na drogu, z obročem v barvi kroga ob vznožju,
velikost sledi velikosti avta (trki so večji). Ko avto mine trenutek zadetka, se
od njega za 0,8 s razširi udarni obroč.

## Način pomoči {#help-mode}

**?** poleg izbirnika jezika ali tipka **?** ali **F1** vklopi ključ za vsako barvo na zaslonu, na vseh treh zavihkih ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Izbira ostane v tem brskalniku.

- **Ključ** v kotu pogleda navaja barve za zavihek in način, ki se uporablja. Vsaka lestvica pride od tam, od koder jo pogled dobi, zato lestvica toplote, ki ste jo uredili, prikaže urejeno. Na zavihku dirke so navedene samo tiste, ki jih nosijo naloženi krogi.
- **Kartica vsakega avta** dobi tabelo tega, kar je narisano na njegovih kolesih, po imenu, z vrednostjo vsakega kolesa v barvi, v kateri je narisana.
- **Avto v fokusu** dobi oznako pri vsakem kolesu, ki pove isto, nameščeno ven pri ovinkih. Skrito, kadar je avto na zaslonu premajhen, da bi se vanjo prilegle.

## Avti {#the-cars}

**Vsak avto v svoji obliki**, v barvi svojega kroga in v pravi velikosti. Oblike
prihajajo iz datoteke avta, ki je izdelana enkrat, na računalniku, na katerem je igra:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Brez nje je vsak avto narisan kot **lasten avto pogleda** svoje vrste in dobe:
limuzina, kupe, hatchback, karavan, športni avto, superavto, muscle car,
terenec, pickup, kombi ali mikroavto, vsak kot klasik (pred letom 1980), iz
osemdesetih in devetdesetih ali sodoben ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Te so zgrajene tukaj iz
splošnih razmerij: brez logotipov, brez imen modelov in brez česar koli iz datotek katere koli igre, zato so del pogleda. Vrsta pride iz imena avta, doba iz leta v njem; avto brez obojega se vzame po svojem razredu. Okoli sto
resničnih generacij je znanih po objavljeni dolžini, širini, višini in medosni razdalji ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); vrstica za vsakega, zaokroženo), zato
ima BMW serije 3 iz devetdesetih velikost in držo tistega avta, še vedno kot preprosta oblika brez
značke ali rešetke.

Datoteka avta je narejena na vašem računalniku iz vaše lastne kopije igre. Vsebuje model vsakega avta z nizko podrobnostjo, okoli 900 trikotnikov, z
njegovimi položaji koles (glej [ukaz `cars` izvlečnika](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Naloži datoteko z avtomobili...** v nastavitvah pogleda ali spust datoteke na
zavihek dirke jo naloži; ostane v tem brskalniku. Vsebuje oblike igre, zato je ni
treba posredovati naprej, pogled pa nobene ne prinaša.

Kateri avto nadomesti avto kroga, se izračuna iz tega, kar je naloženo vsakič
znova, in se nikoli ne shrani; avto brez ustreznika danes dobi svojega, takoj ko
novejša datoteka vsebuje njega ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Avto kroga | Narisan kot |
|---|---|
| njegova številka je v datoteki za isto igro | točno ta avto |
| ista znamka in beseda modela v imenu | ta model, najbližji po letnicah |
| ista znamka, ista generacija | avto te znamke, najbližji po letnicah |
| karkoli drugega, z datoteko avtomobilov | najbližji iste znamke, če obstaja, sicer isti tip karoserije, najbližji po letnicah |
| enosedež z odprtimi kolesi po imenu | enosedež spodaj |
| nič od prvih dveh, in pogled pozna avto po njegovi velikosti | lasten avto pogleda v pravi velikosti tega avta, z datoteko ali brez nje |
| karkoli drugega brez datoteke | lasten avto pogleda te vrste in dobe |

Tako krog BMW serije 3 iz leta 1990 iz druge igre prikaže BMW iz približno tega leta, avto, novejši od datoteke, pa prikaže svojega najbližjega sorodnika, dokler datoteka ni ponovno izdelana. Opisek kroga ob premiku z miško in vrstica pod velikostjo avta za izbrani krog povesta, kako je narisan in kako blizu je.

Lastni avtomobili pogleda imajo temna okna. Modeli iz datoteke avtomobilov so povsod ene barve, ker datoteka nima barve ali stekel, po katerih bi se ravnala. Kolesa, zadnje luči, luči in simboli telemetrije so spodaj narisani kot na enosedežu; palica vzmeti teče po zunanji strani kolesa, kjer je vidna, vilice pa so izpuščene.

**Enosedež** je odprtokoleski dirkalnik v barvi kroga, zato je sprednji del očiten z vsakega kota in nič ne skriva koles: karoserija, pokrov motorja, bočni deli, kokpit s čelado, halo, dno, sprednja in zadnja krilca; štiri okrogla kolesa, sprednja zavita s krmiljenjem (do 0,5 rad pri polnem zavoju), vsako na dveh vilicah z zgornjo osjo, prečno palico (sprednja) ali pogonsko gred (zadnja) in potisno palico. Model je spuščen za 0,3 m od zabeleženega položaja, da kolesa ležijo na cesti, in je skaliran z **Velikost avta**.

**Karoserija se premika na vzmeteh**: kadar krog nosi vse štiri hode vzmetenja, se vsak kot spusti za svoj hod (poudarjen na 0,12 m od polnega odboja do polnega stiska, da je viden z zasledovalne kamere), karoserija pa se pogrezne, nagne in zavije na ravnini skozi štiri.

**Kar se riše iz telemetrije** (ko je *Pnevmatike in vzmetenje* vklopljeno), sledi
[tabeli kanalov](race-charts-and-hud.md#the-channel-table):

| Simbol | Iz | Risba |
|---|---|---|
| barva pnevmatike | `tireTemp` | sama pnevmatika, modra hladna → cian → zelena delovna → rumena → rdeča vroča, nad 40–130 °C |
| obroč zdrsa | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (največji) | obroč na tleh pod kolesom, zelen z oprijemom na voljo, jantaren pri 0,66, rdeč pri 1 (rob oprijema, kot ga poroča igra); bled pod 0,3 |
| vzmetna palica | `suspension` (0..1) | potisna palica, obarvana po hodu: modra iztegnjena, bela sredi, rdeča stisnjena |
| žar zavore | `brakeTemp` (100–900 °C) | disk na zunanji ploskvi kolesa, od temne do oranžne |
| pas obrabe | `tireWear` (0..1) | pas okoli roba profila, bela nova → rdeča obrabljena |
| pas obremenitve | `wheelLoad` (0–12 000 N) | drog ob kolesu, visok kot obremenitev |

Zavorne luči (dežna luč in krilni robovi) svetijo s pedalom zavore. Vsak kanal `lamp`, ki je
vklopljen (nad polovico svojega razpona), prižge luč nad sprejemnikom zraka v svoji barvi: ABS deluje, nadzor vleke deluje, DRS, omejevalnik v boksih, ročna zavora, v zraku.

**V gneči** (več kot 10 vidnih) so avti, ki si jih ne ogledujete, narisani preprosto: karoserija, krilca, kolesa in zavorna luč.

## Oznake {#labels}

Pripete na progo in postavljene v vsakem okviru iz projekcije kamere (zunaj zaslona ali za kamero, skrite). Ko je **Oznake** vklopljeno:

| Oznaka | Kje | Klik |
|---|---|---|
| imena ovinkov (`T1`, `T2` …) | nad vrhom vsakega ovinka na referenci | - |
| oštevilčene značke 1–5 | pet največjih izgub voznika izbranega kroga, na sredini razpona vsakega vzroka, obrobljene z barvo vzroka; ob premiku z miško naslov in strošek | poravnaj in predvajaj to ugotovitev |
| oznake zadetka / trka | nad vsakim sunkom **izbranega** kroga: "Trk −45 km/h" / "Zadetek −12 km/h"; ob premiku z miško celoten opis in nasvet | poravnaj in predvajaj udarec |
| oznake ovinkov na zemljevidu napak (namesto imen ovinkov in značk, kadar je zemljevid zemljevid napak) | vrh vsakega ovinka: "T3 · 5/40 zgodnje zaviranje" (najpogostejša napaka, krogi, ki so jo naredili / krogi, ki so ovinek vozili), "T3 · 5/40", kadar je izbrana ena vrsta, "T3 · čist", kadar nobena; ob premiku z miško izgube ovinka in njegovih pet najpogostejših napak | odpri ali zapri ta ovinek v statistiki proge |

## Zrcaljeni svetovi {#mirrored-worlds}

Svet v pogledu je desnosučen z Y navzgor: gledano od zgoraj, avto, katerega smer vožnje `atan2(dx, dz)` raste, zavija levo. Igra z levosučnim svetom – med njimi Forza – pride zrcaljena, vsak desni ovinek je narisan kot levi, tako proga kot krogi.

Krogi to povedo sami
([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)):
če gremo po vsakem krogu po nekaj metrov (3 m) naenkrat, se zavijanje njegove poti
primerja s stiskom vzmetenja na zunanji strani (`suspension.FR` minus
`suspension.FL`) in, brez vzmetenja, s krmiljenjem (pozitivno na desno v vsakem vmesniku). Krog, ki se skupno zavija manj kot π, ne pove nič; dokaz šteje, kadar presega 2 % zavijanja. Krogi glasujejo; izenačeno je "ni mogoče
ugotoviti".

Kadar se sodba krogov ne ujema s trenutno inverzijo osi (liho število obrnjenih osi v **Kamera in prizor → Obrni os sveta**), razdelek **Krogi** to pove pod seznamom:

- igra je zrcaljena in nič ni obrnjeno: "Ti krogi zavijajo desno, kjer je proga narisana levo …" z **Obrni X**;
- osi so obrnjene, krogi pa niso zrcaljeni: "Obrnjene osi te kroge rišejo zrcaljeno …" z **Ponastavi osi**.

Spremeni se le risba – zrcaljenje, vloženo v pogledno matriko; podatki, analiza in vsaka koordinata, ki jo kažejo orodja, ostanejo igrini. Inverzija se shrani v brskalniku. Analiza poimenuje ovinke levo ali desno s
isto meritvijo (neznan svet se vzame kot zrcaljen, kot je Forzin).

## Za razvijalce {#for-developers}

Koda: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Kaj je avto v trenutku {#what-a-car-is-at-a-moment}

`stateAt` interpolira vsak kanal med dvema vzorcema okoli časa kroga. Kanali, ki
skačejo (prestava, zastavice), vzamejo najbližji vzorec. Krog, ki je končal, se
ustavi na črti.

**Smer vožnje.** Smer vožnje pride iz položajev, nekaj metrov narazen (vsaj 2 m na vsako stran, da nihaj ne zasuka avta). Smer karoserije pride iz zasuka igre šele, ko je prilagojen smeri vožnje – predznak in odmik, s krožno povprečno vrednostjo čez vzorce, hitrejše od 10 m/s (vsaj 20) – in samo, če se nato ujema z njo (krožna varianca pod 0,05, približno 18° razpršitve); sicer karoserija kaže vzdolž smeri vožnje. Tako ostane zdrs viden (karoserija in smer vožnje narazen), ne da bi zaupali kotni konvenciji igre.

**Krmiljenje in strani.** Na katero stran pozitivno krmiljenje zavije avto in kateri strani igrinih desnih koles pripadajo, se izmeri iz kroga: krmiljenje glede na zavijanje poti in katera stran vzmetenja se stisne na zunanji strani ovinkov (brez podatkov o vzmetenju se igre Forza vzamejo kot zrcaljene).
