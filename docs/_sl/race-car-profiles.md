---
title: "Profili avtomobilov in primerjava"
parent: "Analiza dirke"
nav_order: 56
lang: "sl"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---


# Profili avtomobilov in primerjava

Avto lahko zavira, zavija in pospešuje samo do neke meje. Gledalec to mejo meri iz vaših lastnih krogov, zato vam nikoli ne reče, naj naredite nekaj, česar vaš avto ne zmore. Prav tako pojasni, kolikšen del izgubljene sekunde je bil krivda avta in ne vaša.

![Primerjava avtov: dva avta drug ob drugem z njunim oprijemom, zaviranjem in vlečno močjo](../assets/img/en/race-cars-compared.webp)

Analiza kroga ukaže, naj zavira močneje, ohrani več hitrosti ali pospeši prej, samo tam, kjer je avto to že pokazal, in iz izgube odvzame to, kar je mogoče pojasniti z avtomobiloma samima. Zato so meje vsakega avta (njegova *ovojnica*, spodaj) in njegov značaj (njegov *profil*) izmerjeni iz vsakega naloženega kroga tega avta. Ta stran pokriva ovojnico, profil, razdelek **Primerjava avtov** in to, kar avta odločita v vsakem ovinku.

**En avto** = krogi z isto številko avta (ali z imenom, brez številke) in istim indeksom zmogljivosti: drugačna nastavitev je drug avto.

## Ovojnica: kaj avto zmore pri vsaki hitrosti {#the-envelope-what-the-car-can-do-at-each-speed}

Za vsak avto, čez vse njegove naložene kroge, v **predelkih hitrosti po 5 m/s** (24 predelkov, do
120 m/s). Vzorci v zraku, umirjanje 0,3 s po pristanku in od 0,1 s pred vsakim zadetkom do 1 s po njem
so izpuščeni, pospeški 80 m/s² ali več pa se prezrejo (nad tem noben avto s prižemno silo ne
zdrži).

| Ovojnica | Vzorci | Vrednost na predelek | Potrebuje |
|---|---|---|---|
| **bočni oprijem** | bočni pospešek **držan pol sekunde** (povprečje absolutne vrednosti v središčnem oknu 0,5 s), samo tam, kjer je avto zavijal: vsaj tretjino 99. percentila vsega tega | 95. percentil | 6 vzorcev |
| **zaviranje** | zavora > 0,3; vzdolžni pospešek kot mediana vsakega vzorca in njegovih dveh sosedov | 95. percentil pojemka | 4 vzorce |
| **polni plin vlečna moč** | plin > 0,95, zavora pod 0,05; enako mediana treh | 90. percentil | 4 vzorce |

Zakaj držano pol sekunde: robnik, zdrs, ki se nazaj zaskoči, avto, ki ga je treba ujeti, vsi
za hip dvignejo bočni pospešek, in avto, ki to počne pogosto, je videti oprijemljivejši, kot je.
Zakaj mediana treh: pri razmiku pet metrov je en vzorec daleč, enkratna konica pa je robnik,
izboklina ali zid.

Branje ovojnice pri neki hitrosti interpolira med središči predelkov in vzame najbližji predelek s
podatki, kadar je predelek prazen.

**O dveh vrstah podlage.** Kadar so krogi avta vozili petino ali več svojih vzorcev na asfaltu in
na rahli podlagi, se za vsako hrani ločena ovojnica, vsak ovinek pa se presodi s podlago pod avtom na
njegovi najpočasnejši točki.

**Prehod.** Hitrost, od katere vlečna moč pada kot `1/v` (omejena z močjo) namesto da ostane
enaka (omejena z oprijemom): prvi predelek, katerega `a·v` je znotraj 15 % največjega videnega `a·v`.

## Profil: kakšen avto je {#the-profile-what-kind-of-car-it-is}

`profile`, iz istih krogov (vzorci na tleh, nezadeti, hitreje od 8 m/s):

| Merilo | Kako |
|---|---|
| **držan oprijem** (m/s²) | 95. percentil držanega bočnega pospeška pol sekunde |
| **vlek** do 50 km/h, 50–120, 120–200, nad 200 (m/s²) | povprečje polne vlečne moči ovojnice pri 3–14, 14–33, 33–56 in 56–90 m/s, pri hitrostih, ki jih je avto dosegel (do njegove najhitrejše + 2 m/s), iz vsaj treh korakov po 1 m/s; in največ, kar je pokazal, in kje |
| **zaviranje** (m/s²) | zaviranje ovojnice, povprečeno od 60 do 160 km/h (16,7–44,4 m/s), pas, ki ga primerjava imenuje |
| **najhitrejši** | najvišja hitrost, ki jo je dosegel |
| **doseže vrh pri** | kjer je na ravnini s polnim plinom nehal pridobivati (spodaj) |
| **še vedno vleče pri svoji najvišji** | vlečna moč ovojnice pri njegovi najvišji hitrosti: koliko mu je še ostalo |
| **zadnji del ujet, na krog** | kolikokrat na krog je zdrsnil in ga je bilo treba ujeti (spodaj) |
| **delež na plinu** | od teh, delež, ki se je začel s plinom > 0,5 in brez zavore |
| **popusti pri** | mediana držanega bočnega pospeška 0,15 s pred vsakim začetkom zdrsa, kot delež oprijema |
| **čez 10° zdrsa, pri ostrem zavijanju** | med vzorci, ki zavijajo pri 60 % ali več njegovega oprijema, delež tistih, ki drsijo (10° na asfaltu, 20° na rahli podlagi); potrebuje 30 vzorcev |
| **mediana zdrsa** | čez iste vzorce |
| **ravnotežje** | kot zdrsa sprednjih minus zadnjih koles (večkratniki nazivnega vrha), kjer ostro zavija in ne drsi, povprečje vsaj 30 vzorcev: + potiska široko |
| **podlaga** | nad 80 % vzorcev na rahli podlagi: rahla; pod 20 %: asfalt; sicer mešana |

**Doseganje vrha.** Vzorec šteje, kadar je bila sekunda okoli njega (±0,5 s, vsaj 0,9 s podatkov)
ves na polnem plinu (> 0,95, brez zavore), na tleh, vožena **naravnost** (|bočno| pod večjim od 4 m/s²
in četrtine njegovega oprijema), pridobiva pod **0,35 m/s²**, hitreje od 25 m/s in znotraj 90 %
najhitrejše hitrosti kroga – polni plin navzgor po klancu ali skozi dolg ovinek tudi ustavi pridobivanje,
precej pod največjo hitrostjo avta. Če je bilo na vseh krogih vsaj **eno sekundo** takšnega platoja, je
mediana teh hitrosti mesto, kjer doseže vrh. Sicer ni največje hitrosti: kjer ni bila nobena ravnina
dovolj dolga, pove *še vedno vleče pri svoji najvišji*, koliko je bilo še do nje. Brez ugibanja čez to,
kar kažejo krogi – prestave in omejevalnik končata vlek avta dolgo preden to stori zračni upor.

**Izguba zadnjega dela.** Šteje se tam, kjer je moral voznik ujeti zdrs: zavijanje pri 60 % ali več
njegovega oprijema, zdrs (zdrs čez 10° na asfaltu, 20° na rahli podlagi), z volanom (čez 0,06) zasukanim
**proti** ovinku. Kateri predznak volana se ujema s katerim predznakom sile zavijanja, se meri za vsak
krog (vzorci, ki zavijajo brez zdrsa). Zdrs se šteje enkrat, dokler avto ne neha drseti. Avto, ki ga
voznik namenoma malo zanese vstran, ni nič izgubil; tisti, ki potrebuje nasprotno krmiljenje, pa je.
Šteje se enako za vsak avto, zato se lahko primerjata dva avta. Potrebuje krmiljenje in kot zdrsa.

## Primerjava avtov {#cars-compared}

Razdelek v stranski vrstici je **Avto** z enim avtom, **Primerjava avtov** z več.

**Tabela**: stolpec za vsak avto, vrstica za vsako merilo, za katero ima kateri koli avto vrednost:
Držan oprijem; Vlek do 50 km/h, 50–120, 120–200, nad 200; Zaviranje; Najhitrejši; Doseže vrh pri
("še vedno vleče", kjer nikoli ni), Še vedno vleče pri svoji najvišji; Zadnji del ujet, na krog; Čez
10° zdrsa, pri ostrem zavijanju. Kjer se avta razlikujeta za več kot 3 %, je označena boljša vrednost
(višja za oprijem, vlek, zaviranje, hitrosti; nižja za zdrse zadnjega dela).

**En avto sam**: stavki o tem, kaj kažejo krogi – oprijem, ki ga drži (m/s² in g), njegov vlek v vsakem
pasu, kje je nehal pridobivati na dolgih ravninah (ali da nikoli ni dosegel vrha in kaj je še vlekel pri
svoji najvišji), kako pogosto je bilo treba ujeti njegov zadnji del ("skoraj nikoli" pod enkrat na krog,
"večinoma na plinu", ko se je 60 % ali več začelo tam).

**Dva avta**: za vsak par po en stavek o tem, kaj je avto proti drugemu ("X pospešuje bolje, vendar ne
zavija tako ostro, potrebuje dlje, da se ustavi, in lažje izgubi zadnji del"), tabela, vsaka jasna razlika
od največje navzdol, nato **Vožnja vsakega**. Pri več kot **3** parih se prikaže en par: avto izbranega
kroga proti avtu, izbranemu s spustnega seznama (privzeto avto najboljšega kroga njegovega razreda, sicer
referenčnega, sicer prvega drugega).

Razlika se pove samo, kadar krogi jasno kažejo:

| Razlika | Pove se od | Stavek |
|---|---|---|
| oprijem | **4 %** | "X drži N % več oprijema skozi ovinke … to je M % več hitrosti sredi vsakega ovinka" (hitrost = √ razmerja oprijema) |
| vlek | **5 %**, v prvem pasu, ki ga imata obe vozili od 120–200, 50–120, nad 200 km/h | "X pospešuje N % močneje od 120 do 200 km/h"; tudi na startu, ali "čeprav Y bolj močno odrine od starta", ko se zagon razlikuje za 8 % |
| najvišja hitrost | **4 km/h** | "X doseže višjo najvišjo: nehal je pridobivati pri …" |
| najvišja hitrost, samo ena | en avto je dosegel vrh, drugi ne | "Y je zmanjkalo vlečne moči pri …; X je še pridobival, ko je zaviral" |
| najvišja hitrost, nobeden | nobeden ne doseže vrha | pri čem je vsak še pridobival pri svoji najvišji |
| zaviranje | **5 %** | "X se ustavi N % močneje … Y mora zavirati prej" |
| izguba zadnjega dela | vsaj enkrat na krog več **in** za polovico pogosteje | "X lažje izgubi zadnji del: zdrsne toliko, da potrebuje nasprotno krmiljenje N-krat na krog proti M …" – večinoma na plinu (60 % ali več) ali večinoma pri vstopu v ovinek in na spuščenem plinu (30 % ali manj), od približno P % njegovega oprijema; na rahli podlagi "del tega je, kako se avto zavrti; ujetje ni" |
| postrani | **12 odstotnih točk** ostrega zavijanja nad pragom zdrsa | "X na meji bolj drsi postrani" |
| sprednje ravnotežje | **0,3** nazivnega vrha | "X sprednji del bolj potiska … Želi, da ga upočasnite in obrnete pred vrhom ovinka" |

Značilnosti v povzetku: *drži več oprijema* / *ne zavija tako ostro*, *pospešuje bolje* / *vleče manj*,
*doseže višjo najvišjo* / *doseže nižjo najvišjo*, *še vedno vleče na koncu ravnin* / *zmanjka mu vlečne
moči*, *ustavi se močneje* / *potrebuje dlje, da se ustavi*, *je stabilnejši* / *lažje izgubi zadnji del*
(*je veliko bolj drseč …* pri dvakratni pogostosti plus ena; *pogosteje ga je treba ujeti* na rahli
podlagi), *potiska sprednji del*. "Malo je, kar ga loči od Y na teh krogih", kadar ni razlike.

**Vožnja vsakega:**

- en avto drži več oprijema, drugi več vleče: ohranite hitrost skozi sredino na širokem, okroglem vodilu
  (črka "U") pri avtu z oprijemom; zavirajte naravnost, obrnite v kratkem, ozkem središču in iztegnite izhod
  (črka "V") pri močnem;
- eden zaostaja v obeh: njegov najboljši krog je najčistejši – zavirajte naravnost, z največjim polmerom,
  polni plin čim prej, kakor ga oprijem drži;
- avto, ki lažje izgubi zadnji del: plin dodajajte šele, ko se volan odvija, in kratko prestavljajte (zdrsi
  na plinu), ali nežno popustite zavoro in v sredini ohranite enakomeren plin (zdrsi ob vstopu).

Opomba pod razdelkom ponovi, kako se vsaka od teh stvari meri.

## Kaj avta odločita v ovinku {#what-the-cars-decide-in-a-corner}

Kadar so krogi v različnih avtih, se vsaka ugotovitev o izgubljenem ovinku konča z **Avta:** – kaj od tega
odločita avta in kako iz tega avta kar najbolje izkoristiti (`carNote`):

- **Skozi sredino**, kadar ta avto drži manj kot 96 % oprijema drugega, je drugi bil na najpočasnejši točki
  več kot 0,5 m/s hitrejši, ta krog pa ni bil daleč pod tem, kar pojasni njegov oprijem (nad 70 % tega): na
  vodilu drugega avta oprijem tega avta dovoljuje `v_drugi · √(oprijem_moj / oprijem_drugi)`. Če je krog to
  nosil (znotraj 1 m/s), je razlika avto in nobena točka zaviranja je ne spremeni; če manj, koliko je še
  mogoče dobiti. Nato kje je čas mogoče dobiti drugje: na ravnino, med dvema, ali v avtu, ki vleče 5 % močneje
  – po vrhu (zavirajte naravnost, zavijte kasneje, usmerite proti izhodu zgodaj); sicer največji polmer, ki ga
  cesta dopušča;
- **Zadnji del je tukaj popustil** (neskupen zdrs ali zavrtenje, ali zdrs čez prag drsenja na vstopu), v avtu,
  ki ga lažje izgubi vsaj enkrat na krog in za polovico pogosteje: kaj storiti v tem avtu – plin dodajte, ko se
  volan odvija (njegovi zdrsi se začnejo na moči 60 % ali več časa), ali zavoro nežno popustite brez spusta;
- **Ravnina za tem**: kadar je vlek avtov pojasnil 0,03 s ali več, močnejši vlek drugega avta pri isti hitrosti,
  z vlekom obeh avtov od 120 do 200 km/h;
- **Najvišja hitrost**: kadar je ta krog dosegel 98 % tega, kjer njegov avto doseže vrh na ravnini, dolgi
  več kot 150 m, drugi pa je šel 1,5 m/s hitreje: to je najvišja hitrost avta, in vsak km/h več iz ovinka še
  pomaga, dokler je ne doseže;
- **Zaviranje**: kadar drugi avto zavira 5 % močneje in je ta krog zaviral več kot 5 m prej, da je del
  zgodnejšega zaviranja avtov.

Delež avta se odšteje tudi od samega časa – glejte [delež avta](race-corner-analysis.md#the-cars-share) –,
ovinek, kjer avto pojasni 60 % ali več, pa se pripiše avtu.

## Za razvijalce {#for-developers}

Koda: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` v [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` v [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).

