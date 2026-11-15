---
title: "Manevri"
parent: "Vpogledi"
nav_order: 4
lang: "sl"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manevri: kako se skupine premikajo

**Ugotovitve → Manevri** spremlja, kako se enote vsake strani premikajo *kot skupine*, in poimenuje manevre, ki jih izvajajo: bok, obkrožitev, predor, zasedo, umik, obrambo pred raketo, prečenje T. Pri vsakem pove, kako gotovo je, številke, na katerih temelji, ali se je izplačal, in njegove vzporednice v doktrini in zgodovini. **Analiza množic → Manevri** jih prešteje čez tisoče tekem: kako pogosto se vsak izvede na zemljevidu, v načinu in na strani ter kako pogosto se izplača.

Vse se izračuna v vašem brskalniku, v njegovem lastnem delavcu (`src/insights/maneuver`). Tekma z nekaj sto enotami traja 10-500 ms, dvourna zračna vojna s tisočimi objekti pa približno sekundo.

## Uporaba {#using-it}

- Odprite **Ugotovitve**, zavihek **Manevri**. Ob prvem odprtju šteje. Po spremembi filtrov pritisnite **Išči znova**.
- **Gotov / Verjeten / Možen** nastavi raven zaupanja, ki je prikazana (privzeto Verjeten).
- **Časovnica** ima pas za vsako stran in vrstico za vsak manever; **seznam** pod njo prikazuje isto, po času. Klik preklopi na predvajanje na njegovem začetku, premakne kamero tja in ga nariše v 3D: pot vsake skupine kot puščica (dve roki obkrožitve sta njena loka), obrisi skupin v ključnem trenutku (sovražnikovi v barvi njegove strani), sovražnikova sprednja stran kot bela črta. **Nariši vse v 3D** doda druge manevre tekme, bledo. Črte se enkrat pošljejo grafični kartici, ko se izbor spremeni, ne vsak okvir: pri 480 narisanih manevrih med predvajanjem so časi okvirjev na pravi grafični kartici (WebGL2 in WebGPU, p99 18,0-18,5 ms, največ 19,5-20,8 ms) enaki kot brez njih.
- Odprt manever prikaže svoj izid (ubite in izgubljene enote, ki so ga izvedle, med njegovim potekom in tik po njem, v primerjavi z menjavo strani skozi tekmo), svoje dokaze in vnose iz baze znanja zanj: doktrino in zgodovinske vzporednice (Kana za obkrožitev, Sedan 1940 za predor, Cušima za prečenje T, operacija Bolo za lažni napad ...).
- Majhna tabela na koncu: za vsako vrsto in stran, izvedeno in izplačano.

![Klešči na sintetični demo tekmi: puščici obeh rok, sovražnikovo telo in njegova sprednja stran](../assets/img/en/maneuvers.webp)

## Kako se najdejo skupine {#how-groups-are-found}

Vsaka enota je postavljena na skupno časovnico (korak 1 s peš, sicer 2 s, pri zelo velikih datotekah daljši). Ob smrti miruje, da ob ponovnem pojavu ne nariše črte čez zemljevid. Pri vsakem koraku se enote ene strani in ene vrste (letala, vozila, ladje, pehota) povežejo, kadar so blizu - 18 m peš, 170 m za vozila, 3 km za ladje, 5 km za letala - in se gibljejo enako (hitrosti znotraj polovice hitrejše ali obe stojita). Gruča obdrži ID skupine, v kateri je bila večina njenih članov. Enota brez razreda se uvrsti med pehoto, v vozilo ali v zrak glede na hitrost.

**Obliko** skupine preberemo glede na smer, v kateri se giblje: kolona ali vrsta po njihovem razmiku vzdolž in počez, klin, kjer sredina vodi, ešalon, kjer se člani zamaknejo na eno stran, škatla, kjer zasedajo vogale.

Vse se presoja v merilu same tekme: **doseg spopada** `R` je 75. percentil razdalje med ubijalcem in njegovo žrtvijo (omejen na smisel domene), časi manevra pa se prilagodijo vrsti enote (pehota ima tretjino terena).

## Kaj najde {#what-it-finds}

| Manever | Najden, ko |
|---|---|
| Formacija | skupina na 60 % svojih gibajočih se korakov 30 s ohrani eno obliko |
| Frontalni napad | skupina se od izven dosega zbliža do stika, ¾ R ali več, iz kota 35° od smeri, kamor je obrnjen sovražnik |
| Bočni napad | isto z 50-130° (zadaj nad 130°); gotovo le s prijateljsko *krilno silo*, ki se tam bije s sovražnikom (ubiti na obeh straneh) |
| Klešči | dva bočna napada ene strani na isto sovražnikovo telo z nasprotnih strani (100° ali več narazen), v 90 s; gotovo, kadar se roki bijeta |
| Obkolitev | gosta sovražnikova skupina, ki jo ima druga stran okoli sebe vsaj enako, v 1,5 R, iz dveh ali več skupin, brez vrzeli nad 100°, minuto, odrezana od svoje strani; gotovo, ko se obroč zapre za ½ R in se bije za žep |
| Prodor | skupina prečka držano črto (sovražniki stojijo 30 s levo in desno od nje, središče njihove strani je za njimi); gotovo, ko pride ½ R naprej, ostane 20 s in se tam bije; preboj še en R naprej |
| Krita previdnost | v majhni skupini se del premika, medtem ko ostali stojijo, vloge se zamenjajo štirikrat ali večkrat, s kritnim ognjem stoječega dela |
| Koncentracija / razpršitev | delež strani blizu njene najgostejše točke naraste z 35 % na 60 % (enote pridejo 1,5 R ali več, nato stik) - ali pade, ko se stran razprši |
| Lažni napad | majhen člen v stiku privabi dva ali več sovražnikov z drugod; večja skupina nato udari štiri dosege stran, kjer je sovražnika manj |
| Umik / zasledovanje | skupina v stiku se obrne stran in odpre R od mesta boja; gotovo, ko je sovražnik tam pravkar ubil enega iz nje in je skupina prišla 2 R od tega ubijalca (nikoli peš: glej spodaj); sovražniki, ki se gibljejo v isto smer in držijo korak, zasledujejo |
| Globoka obramba | stoječe enote v dveh ali več pasovih čez sovražnikovo os, R globoko, sovražnik prihaja, ogenj iz pasov |
| Obrnjen naklon | tri ali več ubojev na kratki razdalji s strani stoječih enot žrtev, ki so prišle čez greben |
| Zaseda | premikajoča se skupina naleti na sovražnike, ki so stali 45 s; oni streljajo prvi in premikajoči izgubijo dva ali polovico skupine |
| Zastor | ena ali dve enoti, ki se premikata pred telesom treh ali več, prva naletijo na sovražnika |
| Notranje črte | skupine ene strani so tesno skupaj med drugo, njene enote preskakujejo med njimi |
| Tempo | stran, ki odgovarja na stik (zavoj, sprememba hitrosti, prvi strel), 1,5-krat hitreje; Mann-Whitneyjev p pod 0,05 |
| Kljuka, zarez, vlečenje, črpanje | tarča izstrelitve rakete obrne strelca za 35-70°, 75-105°, nad 140°, ali vleče in se vrne |
| Zračni klešči, stena, vodilni-sledilni, mlinček | par, ki se razdeli na enega sovražnika; trije v vrsti proti sovražniku; člen 5-20 km za drugim; dva krožita okoli ene točke na razdalji ene |
| Bojna zračna patrulja | kroži okoli postaje tri minute |
| Boj za energijo / kote | v tesnem boju - smeri 30° narazen, vsak drži drugega na nosu po vrsti, ali kill med njima - uporabljena višina in vzpenjanje ali ravno in ostro zavijanje ob zmanjševanju hitrosti; gotovo, ko je eden ubil drugega |
| Udarni paket, SEAD | zračna skupina mešanih vlog, nekateri izmed njih udarijo po tleh; ubojev protizračne obrambe pred večino drugih ubojev po tleh |
| Linija bitke, prečenje T | tri ladje v koloni; kolona čez glavo sovražnikove kolone |

Vsak manever pove, katere **vzorce** iz baze znanja kaže (`patterns-maneuver.ts`: formacija, frontalni napad, dvojno obkrožanje, obkrožitev, prodor, ogenj in manever, lažni napad, umik, zasledovanje, globoka obramba, zastiranje, razpršitev, obramba pred raketo, boj za kote, bojna zračna patrulja, udarni paket, linija bitke, prečenje T) in vnose, ki jih je treba najprej prebrati. Starejši vnosi nosijo nove vzorce prek `knowledge/maneuver-tags.ts`. Glejte [Leča znanja](knowledge.md).

**Se je izplačal** primerja izmenjavo enot med potekom (in minuto po njem) z izmenjavo njihove strani skozi tekmo. Umik se izplača, če je po obratu izgubil manj enot kot pred njim; obramba pred raketo, če letalo preživi minuto; obkrožitev, če žep izgubi polovico.

## Pri mnogih tekmah {#over-many-matches}

Povzetek vsake tekme (`src/mass/summarize.ts`, glejte [Analiza množic](mass-analysis.md)) vsebuje majhen oddelek `maneuvers`: za vsako vrsto in stran izvedene (pri Verjetnem ali višje), izplačane, neizplačane, ubojev in izgube. **Analiza množic → Manevri** jih sešteje po tekmah, ki jih filter obdrži - po zemljevidu in načinu ali za vse - z Wilsonovim intervalom stopnje izplačila; vrstica naloži tekme, v katerih je bil izveden. Povzetki, zapisani pred tem oddelkom, ga nimajo: zaženite `node tools/3dheat-summarize.mjs <mapa> --force`, da ga dodate.

## Kako gotovo je {#how-sure-it-is}

Sintetične tekme z vgrajenimi manevri (`synth.ts`, zažene `maneuver.test.ts`): vseh 28 vgrajenih vrst je najdenih na Verjetnem ali višje; od 50 prijavljenih manevrov jih je 31 vgrajene vrste, ostalih 19 pa je dejansko tudi tam (formacija gibajoče se skupine, frontalni pristop prodirajoče kolone); nobeden ni napačen. Na 30 ničelnih tekmah - naključni sprehodi narazen in pomešani, enote, ki stojijo naključno, letala na ravnih poteh, gruča, ki se nemirno giblje - pri Verjetnem ali višje ni prijavljeno nič.

Na pravih podatkih (desetine kopenskih bitk, nekaj dolgih zračnih misij, dvanajst tekem streljanja): frontalni napadi, boki, prodori in obkrožitve v tankovskih bitkah, formacije in tesni boji v zraku, obrambe pred raketami, patrulje CAP in pari vodilni-sledilni v zračnih misijah, frontalne likvidacije, kolone ter nekaj zased in krilnih parov pri streljanju. Pragovi so oblike doktrine v merilu igre; posamezno najdbo preberite z njenimi dokazi, stopnje iz tabele množic pa z njihovimi intervali.

### Proti ničelnim modelom istih tekem {#against-null-models-of-the-same-matches}

Detektor se lahko prevara zaradi terena in gneče: v pretepu ima vsaka skupina sovražnike na vse strani. Zato se vsaka vrsta zažene tudi na **ničelnih modelih**, zgrajenih iz istih tekem (`nulls.ts`), kjer se strani ne srečajo več tako kot prej: časovnica ene strani se zavrti za od tretjine do dveh tretjin tekme (*premik*), ali njene poti se zavrtijo okoli središča zemljevida (*zasuk*); oznake ekip se premešajo (*ekipe*, ki po konstrukciji ohrani približno polovico pravih spopadov). Boji se štejejo samo kot ubojev, povezani z njihovimi smrtmi: ubijalec v 2 R in žrtev na mestu - ničelni model to prekine. Najdbe pri Verjetnem ali višje, pravi podatki proti ničelnim modelom (30 tankovskih bitk; 12 tekem streljanja):

| Vrsta | Tankovske bitke: pravo / premik / zasuk | Streljanje: pravo / premik / zasuk |
|---|---|---|
| Obkrožitev | 0 / 0 / 0 (je bilo 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Prodor | 0,03 / 0,02 / 0,05 (je bilo 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Bok | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontalni napad | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Umik | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (zato na nogah nikoli gotovo) |
| Zaseda | - | 0,17 / 0,04 / 0,04 |
| Boj za energijo | 1,2 / 0,1 / 0,85 | - |
| Boj za kote | 0,6 / 0,07 / 0,3 | - |

Zračni boji blizu središča bojišča preživijo obrat okoli tega središča, zato stolpec zasuka tem manj škodi kot kopenskim vrstam. Vrste znotraj ene strani - formacija, bojna zračna patrulja, mlinček, udarni paket, SEAD, krita previdnost, zastor - niso odvisne od druge strani in se na ta način ne preizkušajo. `maneuver.test.ts` preveri, da ničelni modeli odstranijo vgrajene bok, klešči, obkrožitev, prodor, zasedo in umik iz sintetičnih tekem.

## Omejitve {#limits}

- Skupine potrebujejo položaje skozi čas; datoteka samih dogodkov jih nima.
- Smer obrnjenosti ni prebrana iz podatkov: sovražnikova sprednja stran je tam, kjer ga krilna sila angažira, sicer tam, kamor se premika, sicer tam, od koder je prišel napadalec.
- Teren se prebere iz lastnih višin enot (obrnjeni naklon); preizkusa vidnosti ni.
- Zelo velike datoteke so vzorčene v daljših korakih; kratki zračni manevri v njih se še vedno preberejo iz korakov 2-4 s.
