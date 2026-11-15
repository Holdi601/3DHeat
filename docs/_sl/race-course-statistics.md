---
title: "Statistika proge"
parent: "Analiza dirke"
nav_order: 57
lang: "sl"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statistika proge

Naložite veliko krogov ene proge in pregledovalnik prešteje napake: kateri ovinek stane največ časa, na koliko krogih je tam šlo narobe in zakaj. Uporabite ga, da najdete ovinek, ki se ga splača vaditi.

Poskusite: **Demo krogi** da tri kroge, dovolj, da se ta razdelek prikaže.

![Statistika proge z zemljevidom napak: proga, pobarvana glede na to, koliko krogov je izgubilo čas v vsakem ovinku, in seznam ovinkov](../assets/img/en/race-course-mistake-map.webp)

Naložite celotno mapo proge - desetine krogov, več avtomobilov, več razredov zmogljivosti - in vsak krog se oceni, nato prešteje. Ta stran zajema primerjavo po razredu, kaj šteje za napako, razdelek **Statistika proge**, zemljevid napak, izvoz toplotnega zemljevida, proge iz več tras ter zmogljivost pri mnogih krogih.

## Proti najboljšemu v lastnem razredu {#against-the-best-of-its-own-class}

Vsak krog se primerja ovinek za ovinkom z **najhitrejšim popolnim krogom lastnega razreda zmogljivosti** (referenca, v razredu reference); sam ta krog pa z najhitrejšim iz svojega razreda pri vsakem ovinku, ali pa z vsemi krogi, če je v razredu sam. Avtomobili so združeni po razredu zmogljivosti, ki ga določi igra (v Forzi od D do X; C in S2 sta dva izmed njih). Zavorna točka avtomobila razreda C, primerjana z zavorno točko avtomobila S2, ne pove nič o vožnji. Časovni zemljevid, razlike v seznamu krogov in tabela *Ovinek za ovinkom* sledijo isti primerjavi (glejte [s katerim krogom se primerja vsak krog](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistika temelji na analizi vsakega kroga, ne ob njej.

## Kaj šteje za napako {#what-counts-as-a-mistake}

**Pojav** je ena napaka enega kroga v enem ovinku (odseku). Napake kroga v ovinku so:

1. **Vzrok vožnje**, ki ga je analiza našla za njegovo izgubo tam - ugotovitev, ki je izguba in se pripiše vozniku (ne avtu ali razmeram), stane **0,05 s** ali več glede na primerjalni krog. Njen strošek je izguba ovinka.
2. **Vsaka napaka pri obvladovanju avta**, ki jo je naredil tam in je drugi krog ni (neskupna), stane **0,03 s** ali več - blokada, spodrsavanje, zadek ušel, potiskanje, zavrtenje. Njen strošek je strošek dogodka.
3. **Vsak zadetek in trk**, skupen ali ne, ne glede na to, koliko je stal.

En ovinek jih lahko vsebuje več; vsaka vrsta se šteje **enkrat na krog in ovinek**. Pridobitve, delež avta in počasnejši prihod, ki je bil odločen že v prejšnjem ovinku, niso napake.

### Od ugotovitev do napak {#from-findings-to-mistakes}

| Ugotovitev | Napaka |
|---|---|
| prehitro noter, počasi ven, ker se je zaviralo več kot nekaj metrov pozneje kot pri drugem | Prepozno zaviranje |
| zaviralo zgodaj | Prezgodnje zaviranje |
| zaviralo nežno | Premehko zaviranje |
| blokada kot vzrok | Blokirano kolo |
| kotalilo | Kotaljenje |
| oprijem na razpolago, počasneje do vrha, zaviralo tam, kjer je drugi samo popustil | Prepočasi skozi sredino |
| preozka linija | Preozka linija |
| potisnjeno navzven | Potiskanje ven |
| avto je bil obrnjen premalo / preveč | Napačno obrnjen avto |
| na plin pozneje, polni plin pozneje, oklevanje | Pozno na plin |
| počasneje iz ovinka | Počasnejši izhod |
| spodrsavanje koles | Spodrsavanje koles |
| zadek je ušel, vstran skozi sredino | Zadek je ušel |
| zapeljano preširoko | Preširoko |
| izgubljena hitrost | Izgubljanje hitrosti |
| plin odvzet (na poti noter ali na ravnini) | Odvzem plina |
| skoraj ustavitev, zavrtenje, udarec ali trk kot vzrok | Zavrtenje / Udarec / Trčenje, kadar dogodki kroga tam povedo, katero (najprej trčenje, nato zavrtenje, nato udarec); sicer Skoraj ustavljen |
| daljši let | Predolg let |

Dva vzorca se štejeta kot vzrok, ki je v njiju najden, po isti tabeli. *Preveč oddal pri vstopu, kar izhod ni nadoknadil* je napaka vzroka svojega vnosa: zgodnje zaviranje je *Prezgodnje zaviranje*, blokada *Blokirano kolo*, kotaljenje *Kotaljenje*, neizkoriščen oprijem *Prepočasi skozi sredino*. *Prehitro noter, počasi ven* je *Prepozno zaviranje*, kadar krog zavira pozneje kot drugi; sicer napaka vzroka njegovega izhoda - *Pozno na plin*, *Spodrsavanje koles*, *Zadek je ušel*, *Preširoko*, *Počasnejši izhod*. Vzorec, katerega vzrok je avto ali počasnejši prihod, se ne šteje.

Ne šteje se: počasnejši prihod, start, vsaka ugotovitev o *avtu* (vleka, oprijem, zavore, pogon) ter vsaka pridobitev ali ravni ovinek.

### Vrste, po vrstnem redu {#the-kinds-in-their-order}

Zaviranje: *Prepozno zaviranje*, *Prezgodnje zaviranje*, *Premehko zaviranje*, *Blokirano kolo*. Vstop: *Kotaljenje*, *Prepočasi skozi sredino*, *Preozka linija*, *Potiskanje ven*, *Napačno obrnjen avto*. Izhod: *Pozno na plin*, *Počasnejši izhod*, *Spodrsavanje koles*, *Zadek je ušel*, *Preširoko*, *Izgubljanje hitrosti*. Ravnina: *Odvzem plina*. Incidenti: *Zavrtenje*, *Udarec*, *Trčenje*, *Skoraj ustavljen*, *Predolg let*.

## Razdelek Statistika proge {#the-course-statistics-section}

Prikaže se od **3** krogov naprej, med **Krogi** in **Kje se izboljšati**.

- **Povzetek**: „40 krogov z 9 avtomobili, 3 razredi: vsak ovinek ocenjen proti najhitrejšemu krogu lastnega razreda.” (avtomobili so šteti po številki ali imenu).
- **Čipi razredov** (pri več razredih): **Vse** in po en čip za vsak razred, vsak s številom krogov, v vrstnem redu igre (D, C, B, A, S1, S2, R, X, nato drugi). Kliknite razred za njegove kroge samo; **Shift+klik** doda ali odstrani enega. Vse spodaj - seznami, zemljevid, izvoz toplotnega zemljevida - sledi izbranim razredom.
- **Najpogosteje narobe**: vsaka vrsta napake, najprej krogi z največ napakami (nato največ pojavov, nato največ stroška), največ 8 (**Vseh N vrst** pokaže ostale, **Manj** jih spet skrije). Vsaka vrstica: njeno ime, „N od M krogov”, stolpec tega deleža in „K-krat · okoli X s · največ v T3 (5), T7 (4), T1 (2)” - kolikokrat je bila narejena (krog po ovinku), koliko je stala skupaj in tri ovinke, kjer jo je največ krogov naredilo. **Kliknite vrstico**, da jo prikažete na zemljevidu napak (in ga vklopite); spet kliknite za vse napake.
- **Ovinek za ovinkom** (ali *Ovinek za ovinkom - <napaka>*, če je ena izbrana): za vsak odsek „N od M izgubilo čas · X s” - krogi, ki so prevozili celoten ovinek, tisti, ki so tam izgubili **0,05 s** ali več glede na najboljšega v razredu, in ves čas, ki so ga izgubili. Zložen prikaže tri najpogostejše napake s številom krogov. **Kliknite ovinek**, da ga odprete, ga s kamero uokvirite in preklopite na zemljevid napak: za vsako napako (ali samo izbrano) vrstica, na primer „12 od 40 krogov je tu zaviralo prezgodaj. V 9 različnih avtomobilih - okoli 0,21 s vsak.” ter krogi, ki so jo naredili, **najslabši najprej**, vsak s svojim stroškom - največ 8, „+N več” za ostale. **Kliknite krog**, da se osredotoči in predvaja to napako (poravnano 40 m pred njo).
- **Prikaži na toplotnem zemljevidu**: glejte spodaj. „Gradnja toplotnega zemljevida…” med delovanjem; onemogočeno, kadar ni napak.

## Zemljevid napak {#the-mistake-map}

**Pogled → Zemljevid napak** po referenčni poti nariše, koliko krogov (izbranih razredov) je naredilo napako na vsakem metru - vsake vrste ali tiste, izbrane v statistiki. Vsak krog šteje enkrat na meter; razpon vsakega pojava (kjer je bil njegov vzrok ali dogodek) se razširi za 6 m na vsako stran, da je tudi kratek viden. Širše in svetleje tam, kjer je več krogov: širina `3 + 10 · (krogi tu / največ krogov kjerkoli)` metrov, barva od temno rjave do svetlo oranžne; siva 2 m črta tam, kjer nihče. Legenda: *malo krogov ↔ največ krogov*.

Z vklopljenimi **Oznakami** ima točka vsakega ovinka svojo najpogostejšo napako: „T3 · 12/40 zgodnje zaviranje” (krogi, ki so jo naredili / krogi, ki so prevozili ovinek), „T3 · 12/40” z izbrano vrsto, „T3 · čisto” brez nje. Če se premaknete nad oznako, se prikažejo izgube ovinka in njegovih pet najpogostejših napak; klik nanjo odpre ali zapre ta ovinek v statistiki.

## Prikaži na toplotnem zemljevidu {#show-in-the-heatmap}

**Prikaži na toplotnem zemljevidu** isto preda zavihku toplotnega zemljevida kot nabor podatkov z imenom „Napake na <progi>” (ali „Napake na progi”), tako da celotno orodje toplotnega zemljevida - načini toplote, filtri, časovnica, rezanje - deluje na tem, kje krogi gredo narobe.

Gre za CSV, zgrajen v pomnilniku (`mistakeTable`), po ena vrstica za vsako mrežno točko (na vsaka 2 m) vsakega pojava, na **lastnem položaju kroga** tam:

| Stolpec | Vsebina |
|---|---|
| `x`, `y`, `z` | položaj kroga na tem metru (koordinate igre) |
| `elapsed` | čas kroga tam, s |
| `lap` | oznaka kroga |
| `car` | ime avtomobila (ali „car 1234”) |
| `mistake` | ime napake v trenutnem jeziku |
| `car_class` | razred, `-` če ga ni |
| `corner` | oznaka ovinka, `T3` |
| `cost` | strošek pojava, s |

Naloži se prek lastnega nalagalnika toplotnega zemljevida s namigi za preslikavo: Y navzgor, brez obračanja osi, merilo 1; čas `elapsed` v sekundah; **oseba** = `car`, **skupina** = `mistake`, **seja** = `lap`; brez smeri pogleda; `car_class`, `corner` in `cost` ohranjeni kot filtrski stolpci. Zavihek nato preklopi na **Toplotni zemljevid** in uokvirja podatke. Izvozijo se samo razredi, izbrani v statistiki.

## Proge iz več tras {#courses-from-several-tracks}

Krogi se analizirajo **po eno progo naenkrat**. Mapa, v kateri so krogi več prog - celotna knjižnica krogov - ponudi vsako progo za nalaganje posebej (s številom krogov, najprej največ); krogi voženj, ki nikoli niso bila dokončana (`unfinished/` pri FH Companion), gredo k svoji progi in so označeni kot *delni*. Krogi več imenovanih prog, izbranih kot datoteke, so ponujeni na enak način; krogi brez imena proge gredo k tisti, ki je izbrana. Nalaganje krogov druge imenovane proge, kot so tiste naložene, jih zamenja. Podrobnosti: [Nalaganje krogov](race-loading-laps.md#folders-and-courses).

## Zmogljivost pri mnogih krogih {#performance-with-many-laps}

Desetine krogov se analizirajo v sekundi ali dveh (vedno vsi). Kar se riše, je omejeno, da pogled ostane pri hitrosti okvirjev:

| Omejitev | Vrednost | Učinek |
|---|---|---|
| privzeto narisani krogi | 8 (`SHOW_ALL_UP_TO`) | nad 8 naloženimi krogi so novo dodani krogi skriti, razen če so referenca, osredotočeni krog ali najboljši v svojem razredu. **Prikaži vse** nariše vsak krog; **Samo ogledovani** se vrne. Osredotočenje kroga ga spet prikaže in tudi najboljšega v njegovem razredu |
| preprosti avtomobili in tanke črte | več kot 10 vidnih (`PLAIN_PAST`) | krogi, ki niso osredotočeni, zasledovani avto in referenca: ena točka črte na vsakih 6 m (namesto 1,5 m), avtomobili narisani preprosto |
| krogi v grafih | 8 (`CHART_LAPS`) | najprej osredotočeni, njihov najboljši v razredu in referenca; „+N več narisanih, ni v grafu” |
| kartice HUD | 6 | prvih šest vidnih krogov |
| statistika | od 3 krogov | razdelek je pod tem skrit |
| naštete ugotovitve | 12 voznik, 8 avto/kontekst, 10 pridobitev | na osredotočen krog |
| prikazani pari avtomobilov | 3 | čez 3 pare, en par z izbirnikom |

Pojavi napak se izračunajo enkrat na analizo in shranijo v predpomnilnik; gostota zemljevida napak se shrani v predpomnilnik po izboru razreda in napake.

## Za razvijalce {#for-developers}

Koda: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` v [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
