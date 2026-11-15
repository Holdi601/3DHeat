---
title: "Tölfræði brautar"
parent: "Kappakstursgreining"
nav_order: 57
lang: "is"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Brautartölfræði

Hlaðið mörgum hringjum á einni braut og skoðunartækið telur mistökin: hvaða beygja kostar mestan tíma, hversu margir hringir fóru úrskeiðis þar og hvers vegna. Notaðu þetta til að finna beygjuna sem vert er að æfa.

Prófaðu: **Sýnishringir** gefur þrjá hringi, nóg til að þessi hluti birtist.

![Brautartölfræði með mistakakortinu: brautin litað eftir því hversu margir hringir töpuðu tíma í hverri beygju, og listinn yfir beygjurnar](../assets/img/en/race-course-mistake-map.webp)

Hlaðið allri möppu braut - tugum hringja, nokkrum bílum, nokkrum afkastaflokkum - og hver hringur er dæmdur og síðan talinn. Þessi síða fjallar um samanburðinn eftir flokki, hvað telst mistök, hlutann **Brautartölfræði**, mistakakortið, útflutning á hitakorti, brautir úr mörgum brautum og takmarkanir afkasta með marga hringi.

## Gegn þeim bestu í sínum eigin flokki {#against-the-best-of-its-own-class}

Hver hringur er borinn saman beygju fyrir beygju við **hraðasta heila hringinn í sínum eigin afkastaflokki** (viðmiðunina, í flokki viðmiðunarinnar). Hringurinn sjálfur er borinn saman við þann í sama flokki sem var fljótastur í gegnum hverja beygju, eða við alla hringi ef hann er einn í sínum flokki. Bílum er raðað eftir afkastaflokki leiksins (í Forza, D upp í X; C og S2 eru tveir þeirra). Bremsupunktur C-flokks bíls borinn saman við bíl í S2 segir ekkert um aksturinn. Tímakortið, bilin í hringjalistanum og taflan *Beygja fyrir beygju* fylgja sama samanburði (sjá [hverjum hver hringur er borinn saman við](race-corner-analysis.md#who-each-lap-is-compared-with)).

Tölfræðin er byggð á greiningu allra hringja, ekki til hliðar við hana.

## Hvað telst mistök {#what-counts-as-a-mistake}

**Atvik** er mistök eins hrings í einni beygju (hluta). Mistök hrings í beygju eru:

1. **Akstursorsökin** sem greiningin fann fyrir tapi hans þar. Það er niðurstaða sem er tap og er rakin til ökumannsins (ekki bílsins eða aðstæðna), og kostar **0,05 s** eða meira miðað við viðmiðunarhringinn. Kostnaðurinn er tap beygjunnar.
2. **Sérhver stjórnunarvilla bílsins** sem hann gerði þar og hinn hringurinn gerði ekki (ekki sameiginleg), og kostar **0,03 s** eða meira - læsing, spól, afturendinn rennur út, ýtingur, snúningur. Kostnaðurinn er atviksins sjálfs.
3. **Sérhver högg og árekstur**, sameiginlegt eða ekki, hvað sem það kostaði.

Í einni beygju geta verið nokkur atvik. Hver tegund er talin **einu sinni á hvern hring og beygju**. Hagnaður, hlutdeild bílsins og seinni koma í beygjunni á undan ráðast ekki sem mistök.

### Frá niðurstöðum til mistaka {#from-findings-to-mistakes}

| Niðurstaða | Mistök |
|---|---|
| of hratt inn, hægt út, eftir að hafa bremsað nokkrum metrum síðar en hinn | Bremsað of seint |
| bremsað snemma | Bremsað of snemma |
| bremsað laust | Bremsað of laust |
| læsing sem orsök | Hjól læstist |
| rann | Rann |
| grip eftir, hægt að toppnum, bremsað þar sem hinn sleppti aðeins | Of hægt í gegnum miðjuna |
| of þröng lína | Of þröng lína |
| ýtt út | Ýtt út |
| snúið bílnum minna / of mikið | Bílnum snúið vitlaust |
| gefið í seinna, fullan pedala seinna, hikað | Seint í gjöf |
| hægar út úr beygjunni | Hægar út |
| spól | Spól |
| afturendinn rann út, út til hliðar um miðjuna | Afturendinn rann út |
| fór of breitt | Fór of breitt |
| misst hraða | Misst hraða |
| sleppt gjöf (á leiðinni inn, eða á beina kaflanum) | Sleppt gjöf |
| næstum stöðvun, snúningur, högg eða árekstur sem orsök | Snerist / Lenti á einhverju / Hrapaði þegar atburðir hringsins þar segja til um það (árekstur fyrst, síðan snúningur, síðan högg); annars Næstum stöðvaðist |
| lengra flug | Flaug of langt |

Mynstrin tvö eru talin sem sú orsök sem fannst innan þeirra, samkvæmt sömu töflu. *Gaf meira frá sér á leiðinni inn en útgangurinn vann til baka* er mistök orsakar færslunnar: snemmbúin bremsun er *Bremsað of snemma*, læsing *Hjól læstist*, rennsli *Rann*, ónotað grip *Of hægt í gegnum miðjuna*. *Of hratt inn, hægt út* er *Bremsað of seint* þar sem hringurinn bremsaði seinna en hinn. Annars eru það mistök orsakar útgangsins - *Seint í gjöf*, *Spól*, *Afturendinn rann út*, *Fór of breitt*, *Hægar út*. Mynstur þar sem orsökin er bílsins, eða seinni koma, telst ekki.

Ekki talið: seinni koma, ræsingin og hver *bíl*-niðurstaða (tog, grip, bremsur, aflrás) og hvert hagnaðar- eða eðlileg beygja.

### Tegundirnar í sinni röð {#the-kinds-in-their-order}

Hemlun: *Bremsað of seint*, *Bremsað of snemma*, *Bremsað of laust*, *Hjól læstist*. Innkeyrsla: *Rann*, *Of hægt í gegnum miðjuna*, *Of þröng lína*, *Ýtt út*, *Bílnum snúið vitlaust*. Útkeyrsla: *Seint í gjöf*, *Hægar út*, *Spól*, *Afturendinn rann út*, *Fór of breitt*, *Misst hraða*. Beinn kafli: *Sleppt gjöf*. Atvik: *Snerist*, *Lenti á einhverju*, *Hrapaði*, *Næstum stöðvaðist*, *Flaug of langt*.

## Hlutinn Brautartölfræði {#the-course-statistics-section}

Birtist frá **3** hringjum, á milli **Hringir** og **Hvar má bæta sig**.

- **Yfirlitið**: "40 hringir á 9 bílum, 3 flokkar: hvert dæmt beygju fyrir beygju á móti hraðasta hringnum í sínum eigin flokki." (bílar taldir eftir bílnúmeri, eða nafni).
- **Flokkamerki** (þegar nokkrir flokkar eru): **Allir** og eitt merki fyrir hvern flokk, hvert með fjölda hringja, í röð leiksins (D, C, B, A, S1, S2, R, X, síðan aðrir). Smelltu á flokk til að sjá aðeins hringi hans; **Shift+smell** bætir einum við eða tekur hann út. Allt fyrir neðan - listarnir, kortið, útflutningurinn á hitakorti - fylgir völdu flokkunum.
- **Hvað fer oftast úrskeiðis**: hver tegund mistaka, flestir hringir fyrst (síðan flestar sinnum, síðan mestur kostnaður), mest átta (**Allar tegundir (N)** sýnir hinar, **Færri** felur þær aftur). Hver röð: heiti hennar, "N af M hringjum", stika fyrir þann hluta, og "K sinnum · um X s · mest í T3 (5), T7 (4), T1 (2)" - hversu oft hún var gerð (hringur eftir beygju), hvað hún kostaði samtals og þrjár beygjur þar sem flestir hringir gerðu hana. **Smelltu á röð** til að sýna hana á mistakakortinu (og kveikja á kortinu); smelltu aftur fyrir öll mistök.
- **Beygja fyrir beygju** (eða *Beygja fyrir beygju - <mistök>* þegar eitt er valið): fyrir hvern hluta, "N af M töpuðu tíma · X s" - hringir sem óku alla beygjuna, þeir sem töpuðu **0,05 s** eða meira þar miðað við besta í flokknum, og allur tíminn sem þeir töpuðu. Þegar hún er felld saman sýnir hún þrjú algengustu mistökin með fjölda hringja. **Smelltu á beygju** til að opna hana, ramma hana inn með myndavélinni og skipta yfir á mistakakortið: fyrir hvert mistök (eða aðeins það valda) lína eins og "12 af 40 hringjum bremsuðu of snemma hér. Í 9 ólíkum bílum - um 0,21 s hver." og hringirnir sem gerðu það, **verstu fyrst**, hver með sínum kostnaði - mest 8, "+N í viðbót" fyrir hina. **Smelltu á hring** til að einblína á hann og spila mistökin aftur (stillt 40 m fyrir þau).
- **Sýna á hitakortinu**: sjá hér að neðan. "Bý til hitakortið…" meðan það keyrir; óvirkt þegar engin mistök eru.

## Mistakakortið {#the-mistake-map}

**Sýn → Mistakakort** málar meðfram viðmiðunarleiðinni hversu margir hringjanna (í völdu flokkunum) gerðu mistök á hverjum metra - af hvaða tegund sem er, eða þeirri sem valin er í tölfræðinni. Hver hringur telst einu sinni á hvern metra. Svið hvers atviks (þar sem orsökin eða atburðurinn var) er breikkað um 6 m til hvorrar handar svo að stutt atvik sjáist. Breiðara og bjartara þar sem fleiri hringir fóru: breidd `3 + 10 · (hringir hér / flestir hringir hvar sem er)` metrar, litur frá daufu brúnu yfir í bjartan appelsínugulan; grá 2 m rönd þar sem enginn fór. Skýring: *fáir hringir ↔ flestir hringir*.

Þegar **Merkingar** eru kveikt ber toppur hverrar beygju algengustu mistök hennar: "T3 · 12/40 snemmbúin bremsun" (hringir sem gerðu það / hringir sem óku beygjuna), "T3 · 12/40" þegar ein tegund er valin, "T3 · hreint" þegar engin er valin. Ef bendill er settur á merkið birtast töp beygjunnar og fimm algengustu mistök hennar; smellur opnar eða lokar þeirri beygju í tölfræðinni.

## Sýna á hitakortinu {#show-in-the-heatmap}

**Sýna á hitakortinu** sendir sama gagnasafn yfir á flipann **Hitakort**, undir heitinu "Mistök á <braut>" (eða "Mistök á brautinni"), þannig að allt verkfæri hitakortsins - hitastillingar, síur, tímalínan, sneiðing - virkar á því hvar hringirnir fara úrskeiðis.

Þetta er CSV-skrá búin til í minni (`mistakeTable`), ein röð fyrir hvern punkt á neti (á 2 m fresti) í hverju atviki, á **eigin staðsetningu hrings** þar:

| Dálkur | Efni |
|---|---|
| `x`, `y`, `z` | staðsetning hringsins á þeim metra (hnit leiksins) |
| `elapsed` | tími hringsins þar, s |
| `lap` | merki hringsins |
| `car` | heiti bílsins (eða "car 1234") |
| `mistake` | heiti mistakanna á núverandi tungumáli |
| `car_class` | flokkurinn, `-` ef enginn |
| `corner` | merki beygjunnar, `T3` |
| `cost` | kostnaður atviksins, s |

Það er hlaðið í gegnum eigin hleðslutæki hitakortsins með vísbendingum um varpun: Y upp, engar speglanir á ásum, kvarði 1; tími `elapsed` í sekúndum; **manneskja** = `car`, **hópur** = `mistake`, **lota** = `lap`; engin stefna á sjónarhorn; `car_class`, `corner` og `cost` geymd sem síudálkar. Flipinn skiptir þá yfir í **Hitakort** og rammar gögnin inn. Aðeins flokkarnir sem valdir eru í tölfræðinni eru fluttir út.

## Brautir úr mörgum brautum {#courses-from-several-tracks}

Hringir eru greindir **eina braut í einu**. Mappa sem geymir hringi úr nokkrum brautum - allt hringjasafnið - býður hverja braut til hleðslu fyrir sig (með fjölda hringja, flestir fyrst). Hringir úr keyrslum sem aldrei kláruðust (`unfinished/` í FH Companion) fylgja sinni braut og eru merktir *hlutaðir*. Hringir úr nokkrum nefndum brautum sem valdar eru sem skrár eru boðnir á sama hátt; hringir sem ekki nefna braut fylgja þeirri sem er valin. Hleðsla hringja úr annarri nefndri braut en þeim sem eru hlaðnir kemur í stað þeirra. Nánar: [Hleðsla hringja](race-loading-laps.md#folders-and-courses).

## Afkoma með marga hringi {#performance-with-many-laps}

Tugir hringja eru greindir á einni eða tveimur sekúndum (allir, alltaf). Það sem er teiknað er takmarkað svo að sýnin haldist á rammahraða:

| Takmörk | Gildi | Áhrif |
|---|---|---|
| hringir teiknaðir sjálfgefið | 8 (`SHOW_ALL_UP_TO`) | eftir 8 hlaðna hringi eru nýbættir hringir faldir nema þeir séu viðmiðunin, einblínt hringur eða sá besti í sínum flokki. **Sýna alla** teiknar hvern hring; **Aðeins þá sem eru skoðaðir** fer til baka. Að einblína á hring sýnir hann aftur og besta hring flokksins hans |
| einfaldir bílar og þunnar línur | yfir 10 sýnilegir (`PLAIN_PAST`) | hringir aðrir en sá í brennidepli, bíllinn sem er elt og viðmiðunin: línupunktur á 6 m fresti (í stað 1,5 m), bílar teiknaðir einfaldlega |
| hringir á línuriti | 8 (`CHART_LAPS`) | brennidepill, besti hringur flokksins og viðmiðunin fyrst; "+N í viðbót teiknaðir, ekki á línuriti" |
| HUD-spjöld | 6 | fyrstu sex sýnilegu hringirnir |
| tölfræði | frá 3 hringjum | hlutinn er falinn þar undir |
| niðurstöður listaðar | 12 ökumaður, 8 bíll/samhengi, 10 hagnaður | á hvern einblínda hring |
| bílapör sýnd | 3 | eftir 3 pör, eitt par með valmynd |

Mistakaatvik eru reiknuð einu sinni í hverri greiningu og geymd í skyndiminni; þéttleiki mistakakortsins er geymdur í skyndiminni fyrir hvert flokkaval og mistök.

## Fyrir forritara {#for-developers}

Kóði: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` í [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
