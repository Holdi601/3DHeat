---
title: "Atburðir í stýringu bíls"
parent: "Kappakstursgreining"
nav_order: 54
lang: "is"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: true
---

# Atburðir í stýringu bíls

Skoðarinn horfir á hvernig hver hringur var ekinn og merkir staðina þar sem ökumaðurinn lét bílinn renna, snúast, lenda í einhverju eða sóa gripi. Þetta er gagnlegt, því mistök sem kostuðu tíma er fljótlegast að laga.

![Hlutinn Stjórn á bílnum: hversu oft hver hringur læsti hjóli, snérist eða ýtti út á við, og listinn yfir villurnar með einni opinni](../assets/img/en/race-control-table.webp)

## Í einföldu máli {#in-plain-words}

- **Læsing**: þú hemlar svo fast að hjól hættir að snúast og rennur til. Bíllinn stöðvast verr og getur ekki stýrt.
- **Spól**: þú stígur svo fast á inngjöfina að drifhjólin snúast hraðar en bíllinn fer. Þú missir togkraft.
- **Yfirstýring**: afturhluti bílsins rennur út á við. Ef hann snýst alla leið hring, þá er það **snúningur**.
- **Undirstýring**: framhluti bílsins rennur út á við („ýtir“); að snúa stýrinu meira hjálpar ekki.
- **Högg** og **brotlending**: bíllinn snerti eitthvað (högg er hnjask eða rispa, brotlending er harður árekstur).
- **ABS**, **TC**: hjálparkerfi bílsins sem vinna gegn læsingu og spóli. Þau eru ekki mistök.

## Hlutinn Stjórn á bílnum (það sem þú sérð) {#the-car-control-section-what-you-see}

Fyrir valda hringinn, með það sem hringirnir bera, sýnir hann það sem finnst samt, án skriðs dekkja og án rekhorns, í stað þess að sýna ekkert (hér að neðan).

**Taflan**: ein röð fyrir hverja tegund sem annar hvor hringurinn sýnir - Læst hjól, Spól, Afturhluti rennur út (yfirstýring og snúningar), Ýtt út á við, Brotlendingar, Högg, ABS virkt, Spólvörn virk, Handbremsa, Í loftinu. Hver reitur er „fjöldi · sekúndur“, fyrir valda hringinn og hringinn sem hann er borinn saman við. Einnig *Mesta rekhorn* ef rekhorn er til staðar (það mesta á jörðinni).

**Listinn**: óskiptar villur hans sem kosta að minnsta kosti 0,02 s, dýrastar fyrst, í mesta lagi 12, hver með sínum titli og kostnaði (og merki tegundar sinnar). Smelltu á eina til að lesa ábendinguna, stilltu bílunum upp 40 m fyrir hana og endurspilaðu hana. **Einnig hvað báðir hringirnir gerðu þar** bætir við hverri villu, líka þeim sameiginlegu (merki „báðir gerðu það“, kostnaður „—“ undir 0,01 s). Ef engin er: „Ekkert sem X gerði með dekkin kostaði hann tíma sem Y gerði ekki líka.“

**Vísbendingin undir henni** segir hvað greiningin gat séð út frá - „Út frá skriði og skriðhorni hvers hjóls, og rekhorni bílsins.“ (eða skriði og skriðhorni, skriði og rekhorni, aðeins skriði, eða „Út frá rekhorni bílsins eingöngu - þessir hringir bera ekkert skrið dekkja.“) - undirlagið sem mörkin voru mæld fyrir (malbik, laust, blandað: yfir 80% lausum sýnum er laust, undir 20% malbik), við hvaða hring atburðirnir voru lagðir, og hvernig kostnaðurinn er reiknaður.

Með **ekkert skrið dekkja og ekkert rekhorn** (FH Companion hringjaskrá án fjarmælingar hennar) eru taflan og listinn sýnd engu að síður, og vísbendingin segir hvað samt fannst út frá því sem hringirnir bera: „Þessir hringir bera ekkert skrið dekkja og ekkert rekhorn, svo ekki er hægt að greina læsingar og spól. Fannst samt: ýtingar, út frá stýrinu miðað við leiðina; högg og brotlendingar, út frá hraðanum og hröðuninni.“ Rennsli út frá snúningshraða er nefnt líka þar sem hringirnir hafa hann, en ýtingar aðeins þar sem þeir hafa stýri. Setningin um mörk skriðs og rekhorns er felld niður, og önnur vísbending segir: „Fyrir Forza Horizon, veldu `.tele.gz`-skrána við hlið hvers FH Companion hrings líka: hún er öll fjarmælingin, skrið hvers hjóls 64 sinnum á sekúndu.“

Heildarkostnaður stýringar hringsins (notaður í yfirlitum) telur skarast villur - læsingu og rennslið sem hún hefst á, innan 40 m - einu sinni, á dýrasta þeirra í þyrpingunni.

## Hvernig þær finnast {#how-it-is-detected}

Restin af þessari síðu er reglubókin: hver tegund, hvert mörk.

Kóði: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Rökin og heimildirnar eru í [aðferðinni](race-analytics.md).

## Tegundirnar {#the-kinds}

| Tegund | Röð í töflu | Villa? | Stysta sem telst |
|---|---|---|---|
| `lock` | Læst hjól | já | 0,1 s |
| `wheelspin` | Spól | já | 0,15 s |
| `oversteer` | Afturhluti rennur út | já | 0,2 s |
| `spin` | (talið með Afturhluti rennur út) | já | 0,1 s |
| `understeer` | Ýtt út á við | já | 0,25 s |
| `crash` | Brotlendingar | já | - |
| `hit` | Högg | já | - |
| `abs` | ABS virkt | nei | 0,2 s |
| `tc` | Spólvörn virk | nei | 0,2 s |
| `handbrake` | Handbremsa | nei | 0,1 s |
| `airborne` | Í loftinu | nei | 0,15 s |

Styttri lotur eru suð (kantsteinn, hola, eitt sýni). Lotur af punktum í grindinni (á 2 m fresti) sem standast próf eru tengdar yfir eyður allt að 2 punktum. Aðeins **villur** geta verið mistök og bera kostnað; hinar eru það sem bíllinn og ökumaðurinn gerðu.

## Það sem hvert próf þarf {#what-every-test-needs}

### Afleiddar rásir {#derived-channels}

Áður en nokkuð er dæmt fær hver hringur það sem leikurinn sendir ekki, undir stöðluðum nöfnum (eigið gildi leiksins vinnur alltaf):

| Rás | Úr |
|---|---|
| `bodySlip` (rekhorn) | hraðinn í ramma bílsins, `atan2(latVel, abs(longVel))`, þar sem leikurinn sendir hann (0 undir 3 m/s); annars stefnan (yaw leiksins, löguð að akstursstefnu með formerki og forskrift yfir sýni hraðari en 10 m/s, og treyst aðeins með hringlaga dreifingu undir 0,05) miðað við akstursstefnuna (staðsetningar að minnsta kosti 2 m á milli), á hraða yfir 3 m/s |
| `yawRate` | breyting `yaw` yfir tíma, þar sem er stefna en enginn hraði |
| `airborne` | snerting allra hjóla við jörð slitin (≤ 0,5); annars álag allra hjóla undir 5% af miðgildi þess; annars fjöðrunarferð allra hjóla á eða undir 0,02 (fullútþanið). Eitt stakt sýni er ekki flug. |
| `slipRatio.<W>` | `(yfirborðshraði hjóls - hraði bíls) / hraði bíls` yfir 3 m/s, þar sem leikurinn sendir yfirborðshraða hjóla; eða úr snúningi hjóls × veltiradíus sem mældur er á hringnum - miðgildi `hraði / snúningur` á meðan rúllað er beint (hraði > 10 m/s, inngjöf < 0,3, hemlun < 0,05, abs(lengdarhröðun) < 3 m/s², ekki í lofti; hvert sýni yfir 10 m/s þegar færri en 20 eru), samþykkt milli 0,1 og 1 m. Merkt `physical` |
| `loose` | yfirborðstitringur Forza á að minnsta kosti 2 hjólum (> 0,001) í að minnsta kosti 0,33 s (kantsteinn er styttri), eyður undir 1 s brúaðar |

### Á jörðinni og stillt {#on-the-ground-and-settled}

Ekkert er dæmt í lofti eða í **0,3 s eftir lendingu** - fjöðrunin botnar út og hröðunin rýkur upp, sem er ekki grip, hemlun né afl. Sýnið verður líka að vera **á ferð**: hraðar en 5 m/s.

### Jörðin {#the-ground}

Jörð hvers sýnis er **laus** þar sem `loose`-rás hringsins segir það (yfirborðstitringur Forza, efni hjólanna í Trackmania), annars yfirborð hringsins (sjá [keppnisgerð og yfirborð](race-loading-laps.md#discipline-and-surface)): malbik, eða laust fyrir allt annað. Beygjur, aksturslag og mörk eru aðskilin fyrir malbik og laust undirlag.

### Skrið, sem margfeldi af hámarksgripi dekksins {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Leikir skala skrið mismunandi; `meta.slip` segir hvernig, og hvert skrið er deilt með skala þannig að um 1 sé hámarksgrip dekksins (nafnhámark):

| `meta.slip` | Merking | Deilt með |
|---|---|---|
| `peak` | staðlað af leiknum: eftir 1 tapast grip (Forza Data Out) | 1 |
| `scaled` | eðlilegt skrið deilt með malbikshámarki (Kunos-upptökutækið) | nafnhámark undirlagsins deilt með malbikshámarkinu |
| `index` | 0..1 rennslismælir (SlipCoef í Trackmania) | 0,5 |
| `physical` (eða óþekkt) | skriðhlutfall sem brot, skriðhorn í radíönum | nafnhámark undirlagsins |

Nafnhámörk, þegar ekkert betra er vitað:

| Yfirborð | Skriðhlutfall | Skriðhorn |
|---|---|---|
| malbik | 0,12 | 8° |
| blandað | 0,18 | 12° |
| laust (möl) | 0,25 | 15° |
| snjór | 0,25 | 15° |
| ís | 0,10 | 6° |

### Þar sem gripið endar: grip-ferlar hvers bíls {#where-grip-ends-each-cars-tyre-curves}

Hvar dekk hættir að gefa meira er **mælt fyrir hvern bíl**, út frá hverjum hlaðna hring hans (`measureTyres`), sitt í hvoru lagi fyrir malbik og laust undirlag:

| Ferill | Sýni (hraði > 10 m/s, stillt, hröðun undir 45 m/s²) | Skrið (x) | Kraftur (y) |
|---|---|---|---|
| hemlun | hemlun > 0,3, handbremsa ≤ 0,2, ekið beint (hliðarkraftur undir 30% af mesta) | abs(meðalskriðhlutfall fjögurra hjóla) | hraðaminnkun |
| drif | inngjöf > 0,8, hemlun ≤ 0,05, beint, fullt afl bílsins við þann hraða > 0,5 m/s² | mesta skriðhlutfall drifhjóls | hröðun sem hlutfall af því afli |
| framan | hliðarkraftur yfir 30% af mesta, grip bílsins við þann hraða > 1 m/s² | stærra framskriðhornið | hliðarhröðun sem hlutfall af því gripi |
| aftan | það sama | stærra afturskriðhornið | það sama |

„Mesta“ er 99. hundraðshluti abs(hliðarhröðunar) hringsins á því undirlagi (allt undirlag ef færri en 50 sýni eru). Drifrásin ræður drifhjólunum (FWD framhjólin, RWD afturhjólin, AWD öll; óþekkt: öll).

Úr að minnsta kosti **150 sýnum** er skriðinu skipt í 6 til 14 jafnfjölmenn bil (eitt fyrir hver 40 sýni), kraftur hvers bils er efri fjórðungur hans (það sem dekkið gaf þegar ökumaðurinn bað um það), sléttaður yfir nálæg bil. **Besta** er bilið með mesta krafti; **mörkin** eru fyrsta bilið eftir það þar sem krafturinn hefur fallið um **8%**. Ferill sem aldrei fellur í gögnunum hefur engin mörk (óendanleg) - að fara yfir „hámarkið“ kostar ekkert í þeim leik, og skrið eitt og sér merkir þar ekkert (beygju- og drifferlar Forza Horizon eru þannig). Þegar of fá sýni eru á einu undirlagi eru sýni hins undirlagsins notuð; þegar of fá eru alls, þá **nafnmörkin**: 1,5 sinnum nafnhámarkið.

Hver bíll fær líka:

- **aksturslag sitt í rekhorni**: efri fjórðung rekhorns hans hvar sem hann beygir á 60% af mesta eða meira (þarf 100 sýni);
- **stýringu á hverja beygju** (`steerGain`), í hverju 5 m/s hraðabili: miðgildi abs(stýri) / beygja leiðar á meðan beygt er ákveðið en vel innan gripsins (30-60% af mesta, beygja þrengri en 400 m radíus, stýri yfir 0,02; 25 sýni á bil). Beygja leiðarinnar er yaw-hraði deilt með hraða þar sem leikurinn sendir yaw-hraða, annars úr staðsetningum ±5 m.

## Greining, tegund fyrir tegund {#detection-kind-by-kind}

| Tegund | Próf (á sýnum á ferð og stilltum) | `peak` og `limit` |
|---|---|---|
| **lock** | hemlun > 0,05, handbremsa ekki yfir 0,2, og skriðhlutfall einhvers hjóls undir neikvæðu hemlamörkunum | mesta neikvæða skriðið (margfeldi af nafnhámarki); mörkin sem neikvæð |
| **wheelspin** | inngjöf > 0,2 (eða engin inngjafarrás), og skriðhlutfall drifhjóls yfir drifmörkunum | mesta skrið drifhjóls; mörkin |
| **oversteer** (rekhorn) | rekhornið yfir þeim hærra af lágmarki yfirborðsins og 1,5 × aksturslagi bílsins þar | mesta rekhorn, radíönur |
| **oversteer** (skriðhorn, enginn rekhorn) | stærra afturskriðhornið yfir afturmörkunum og meira en 0,25 yfir því stærra framan | afturskriðhornið (margfeldi hámarks) |
| **oversteer** (enginn rekhorn, en yaw-hraði og hliðarhröðun) | „viðhorfshraðinn“ - abs(yaw-hraði) mínus abs(hliðarhröðun) / hraði, yfir 8 m/s - yfir 0,2 rad/s, með stýrinu á móti beygjunni | rad/s; mörk 0,2 |
| **spin** | yfirstýringarlota þar sem rekhornið fór yfir **60°** | eins og yfirstýring |
| **understeer** (skriðhorn) | ekki að renna, stærra framskriðhornið yfir framanmörkunum og meira en 0,3 yfir aftan | framskriðhornið; mörkin |
| **understeer** (engin skriðhorn) | hraðar en 12 m/s, ekki að renna, ekki móstýring, hliðarhröðun yfir helmingi mesta hraða hringsins (99. hundraðshluti), leiðin þrengri en 300 m radíus, og stýring meira en **1,6 sinnum** það sem stýring bílsins á beygju segir að leiðin þurfti | margfeldi þeirrar stýringar sem þurfti; mörk 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` yfir 0,5 | - |
| **handbrake** | `handbrake` yfir 0,2 | - |
| **airborne** | `airborne` yfir 0,5 | - |
| **hit**, **crash** | sjá [Högg og brotlendingar](#hits-and-crashes) | hraðinn sem áreksturinn tók |

Lágmörk rekhorns eftir yfirborði: malbik **7°**, blandað **10°**, laust og snjór **15°**, ís **10°**. Bíll sem keyrir meira sem sjálfsagt mál - arcade-dekkjalíkan, mölsérfræðingur - hefur sín eigin, hærri mörk úr eigin hringjum (1,5 × aksturslag hans).

**Hvaða leið bíllinn beygir** (fyrir „á móti beygjunni“): breyting stefnu eigin leiðar hringsins yfir ±6 m (að minnsta kosti 2 punktar í grind); þrengra en 600 m radíus telst beygja; hægri eða vinstri eftir því hvort heimurinn er speglaður. Stýrið er **á móti** beygjunni þegar abs(stýri) > 0,05 og formerki þess er andstætt beygjunni - rennsli sem er **gripið** með andstæðu stýri.

**Pedalarnir þegar hann byrjaði** (`pedal`): *hemlun* þegar hemlinn er yfir 0,1; *inngjöf* yfir 0,3; *slakað* þegar inngjöfin var yfir 0,5 innan 8 punkta grindar (16 m) þar á undan; annars *rúllað* (eða án inngjafarrásar).

## Lagt við hinn hringinn {#laid-against-the-other-lap}

Hver atburður er metinn gagnvart hringnum sem valdi hringurinn er borinn saman við á þeim hluta (sá besti í sínum flokki; fyrir hringinn sjálfan, sá úr flokki hans sem var fljótastur í gegnum hlutann):

1. **Hversu langt hinn hringurinn fór** á sömu metrum, ±8 m: eigin atburðir hins hringsins af sömu ætt (snúningur telst yfirstýring, brotlending telst högg) mældir í sömu einingum, án þröskulda, með dekkjaferlum hins bílsins.
2. **Sameiginlegt** þegar hinn hringurinn fór **80%** jafn langt eða lengra: svona er beygjan ekin, ekki mistök. Atburðir af tegundum sem eru ekki villur eru alltaf „sameiginlegir“.
3. **Kostnaður**, fyrir villu sem er ekki sameiginleg: tíminn sem þessi hringur tapaði á hinum frá 5 m fyrir atburðinn til **40 m eftir** hann (fyrir högg eða brotlendingu, þar til bíllinn hefur náð hraðanum aftur - metrarnir til að ná honum með eigin afli, 40 til 400 m; án mælds afls, 5 m/s²). Aldrei neikvætt.
4. **Hraði gefinn eftir** upp í hámark bílsins: fyrir læsingu, hraðaminnkunin sem bíllinn sýnir að hann ræður við á þeim hraða mínus það sem hann gerði, samanlagt yfir atburðinn; fyrir spól, fullt afl hans í inngjöf mínus það sem hann gerði; fyrir högg, hraðinn sem það tók. Sagt þegar yfir 0,5 m/s (1,8 km/klst).

Villa sem er ekki sameiginleg og kostar að minnsta kosti **0,02 s** er skráð ([tölfræði brauta](race-course-statistics.md) telur aðeins villur upp á **0,03 s** eða meira, svo að mistök sem talin eru yfir marga hringi séu skýr), og getur orðið orsök taps í beygju (sjá [Beygja fyrir beygju](race-corner-analysis.md#car-control-faults-and-impacts)).

## Högg og brotlendingar {#hits-and-crashes}

`impacts.ts` les högg úr **eigin sýnum hringsins**, áður en þau eru endurtekin - högg er búið á hundraðshlutum úr sekúndu. Dekk geta ekki myndað krafta höggs, svo högg er mælt gagnvart eigin bíl hringsins:

- **Grip hans `G`**: 99. hundraðshluti láréttrar hröðunar hans `√(lat² + long²)` yfir hringinn, á jörðinni og hraðar en 5 m/s. Án hröðunarrása (eða undir 3 m/s²): 15 m/s² - grip venjulegs vegabíls.
- **Þröskuldur**: `max(1,8 G, G + 18, 30)` m/s².
- **Höggsýni**: lárétt hröðun yfir þröskuldinum *og* stökk um meira en helming af `G` frá fyrra sýni; **eða** hraðinn fellur, innan 0,1 s, um meira en þröskuldurinn tæki á 0,1 s auk 1,5 m/s. Aðeins á jörðinni og stilltur, og aðeins þegar bíllinn var hraðari en 5 m/s.
- Höggsýni innan **0,4 s** eru eitt högg.
- **Fyrir / eftir**: mesti hraðinn 0,15 s áður; minnsti þar til 0,3 s eftir síðasta höggsýnið.
- **Ekki högg**: hraði horfinn án kraftar að baki - mesta lárétt hröðun innan 0,1 s undir því hærra af `G` og 25 m/s² - er leikurinn sem spólar til baka eða endurstillir bílinn.
- **Brotlending** þegar hann tók **30 km/klst** eða meira, eða þegar hún skildi bílinn eftir undir helmingi hraða síns; **högg** annars - hnjask, rispa meðfram vegg.
- **Stefna**: lengdarhröðun stærri en hliðarhröðun og neikvæð: *framan á*; jákvæð: *aftan frá*; hliðarhröðunin stærri: *meðfram hliðinni*. Án hröðunar: framan á.

Það sem bíll getur gert er mælt með öllum höggum útilokuðum, frá 0,1 s áður en þau verða til 1 s eftir þau (`struckMask`).

## Textarnir {#the-texts}

Hver atburður er lýstur með nafni beggja hringjanna, hvar (metrar eftir viðmiðinu), hraðanum sem hann byrjaði á, hversu langt yfir mörkunum miðað við hinn hringinn, og ábendingu. Ábendingin fylgir tegundinni og því sem var mælt:

| Atburður | Ábending |
|---|---|
| læsing, aðeins framhjól | læst framhjól getur ekki stýrt: minni þrýstingur í upphafi svæðisins, slakaðu á honum inn í beygjuna |
| læsing, aðeins afturhjól | læst afturhjól lætur bílinn snúast: hemlaðu meira í beinni línu, slakaðu á þegar þú beygir inn; færðu hemlaskiptinguna fram ef þetta heldur áfram |
| læsing, laust undirlag | læst hjól plægir: kreistu rétt áður en það læsist |
| læsing, annars | of mikill pedali fyrir gripið: kreistu hægar og jafnar |
| spól | gefðu inngjöf inn þegar stýrið losnar; skiptu snemma upp þar sem togið takmarkar (á lausu undirlagi: hærri gír mýkir togið) |
| snúningur / yfirstýring | eftir pedalanum: undir hemlun (of mikil hemlun inn í beygju, skipt niður of snemma), slakað (slökunaryfirstýring: haltu jöfnum inngjöf), á inngjöfinni (of mikil meðan enn er snúið), hvorugt (beygt inn of hratt); „gripið með andstæðu stýri“ þegar móstýrt var; á lausu undirlagi eða í rallý, „eitthvert horn er hraða leiðin - hitt hlaupið nægði“ |
| undirstýring | meira stýri gerir ekkert þegar framhlutinn er farinn: komdu hægar inn, dragðu aðeins af hemlinum til að þyngja framhlutann, losaðu; á lausu undirlagi, snúðu bílnum með slökun eða stuttu fótapikki á vinstri fæti |
| högg / brotlending | meðfram hliðinni: metri af bili kostar minna en rispan; aftan frá: annar bíll eða rennsli afturábak; brotlending framan á: hemlaðu fyrr; hnjask framan: þú rakst á eitthvað. „X lenti líka í högginu þar.“ þegar sameiginlegt |

Í Trackmania segir rennsli líka: undir um **400 km/klst** (**300** á lausu undirlagi: mold, gras, plast) gefur rennsli minna afl en grip; yfir því gefur hliðarrennsli í réttu horni hagnað, en þetta kostaði tíma, svo horn þess var rangt.

## Hvað hver heimild leyfir {#what-each-source-allows}

| Hringirnir bera | Læsingar / spól | Yfirstýring / snúningur | Undirstýring |
|---|---|---|---|
| skrið hvers hjóls og skriðhorn, hraði bíls (Forza Data Out, AC-leikirnir) | út frá skriði | út frá rekhorni, eða afturskriðhorni | út frá skriðhornum |
| hraði hjóla, hraði í heimi (rallíleikir, BeamNG) | út frá afleiddu skriði | út frá afleiddu rekhorni | út frá stýringu á hverja beygju |
| yaw og yaw-hraði, ekkert skrið (iRacing) | - | út frá rekhorni (yaw löguð að akstursstefnu); út frá viðhorfshraða með móstýringu aðeins þegar ekki er hægt að treysta yaw | út frá stýringu á hverja beygju |
| aðeins stefna | - | út frá stefnu miðað við akstur | út frá stýringu á hverja beygju |
| FH Companion hringjaskrá ein (ekkert yaw, ekkert skrið) | - | - | út frá stýringu á hverja beygju (hún hefur stýri og hröðun) |

Högg og brotlendingar þurfa aðeins hraða (betra með hröðun), svo hver heimild hefur þau. **Hlutinn Stjórn á bílnum** sýnir hvað hver heimild leyfir: með FH Companion hringjaskrá einni saman, ýtingar hennar út frá stýrinu og höggin hennar, og ábendinguna um að hlaða `.tele.gz` fyrir afganginn.
