---
title: "Tabela e taktikave"
nav_order: 12
has_children: true
lang: "sq"
source: "tactics-board.md"
source_hash: "e89ef050b0f2"
translated: true
outdated: false
---

# Tabela e taktikave

Skeda **Taktika** është një tabelë vizatimi për një plan ekipi: vendosni figura të vogla në një hartë, vizatoni shigjeta për ku shkojnë, dhe shtypni luaj për ta parë të ndodhë. Përdoreni për të planifikuar një raund ose një sulm para se të luani. Ajo ndan vizën, kamerën dhe [nivelin](levels.md) me skedat e tjera dhe asgjë më shumë; një plan nuk është të dhëna dhe nuk vizaton nxehtësi.

## Plani juaj i parë {#your-first-plan}

1. Hapni skedën **Taktika**. Zgjidhni **Lojën** (për shembull Counter-Strike 2) dhe, për Valorant, shtypni **Ngarko hartat e Valorant** dhe zgjidhni një **Hartë**. Ose ngarkoni fillimisht një [nivel](levels.md).
2. Zgjidhni një **Pală** (cakton ngjyrën) dhe shtypni **Pamje nga lart**.
3. Zgjidhni **Vendi**, përzgjidhni një figurë te **Figurat** (përdorni **Kërko figura** për ta gjetur) dhe klikoni në hartë. Vendosni dy ose tre.
4. Zgjidhni **Shigjetë**, klikoni mbi një figurë, klikoni përgjatë rrugës që duhet të ndjekë, dhe shtypni **Enter** për të mbaruar shigjetën.
5. Shtypni **+** nën pamjen për të shtuar hapin 2. Çdo figurë fillon aty ku mbaroi shigjeta e saj. Vizatoni më shumë shigjeta atje.
6. Shtypni **▶** (ose `K`) për të luajtur planin nga hapi i shfaqur deri në fund.
7. Emërojeni planin te **Emri i planit** dhe shtypni **Ruaj**.

![Skeda Taktika në pamjen nga lart: loja, palët dhe veglat majtas, tri figura me shigjeta Zhvendos, një hedhje tymi me hark, një Zonë dhe hapat përgjatë fundit](../assets/img/sq/tactics.webp)

## Fillimi i një plani {#starting-a-plan}

| Kontrolli | Çfarë bën |
|---|---|
| **Lojë** | Zgjedh palët dhe figurat që ofron paleta: Counter-Strike 2 (T, CT; lojtarët dhe veglat ndihmëse), Valorant (Sulm, Mbrojtje; lojtarët dhe aftësitë e përgjithshme), Battlefield, Squad, Arma (këmbësoria, mjetet tokësore, avionët, anijet), DCS / War Thunder / IL-2 (avionë jet, avionë me helikë, helikopterë, mbrojtja ajrore, toka, anijet, armët), dhe Tjetër. Një plan që ka tashmë figura mban palët e veta kur ndryshon loja. |
| **Emri i planit** | Emri me të cilin ruhet plani. |
| **Hartë**, **Ngarko hartat e Valorant** | Me Valorant të zgjedhur: **Ngarko hartat e Valorant** merr listën e hartave nga [valorant-api.com](https://valorant-api.com); **Hartë** vendos më pas hartën e vogël të zgjedhur si nivel, të kornizuar nga lart. Imazhi merret kur zgjidhet dhe nuk dërgohet kurrë me programin. Njoftimi i Riot shfaqet ndërsa është në ekran (shih më poshtë). |
| **Pala** | Pala së cilës i përket figura, shigjeta ose zona e radhës; merr ngjyrën e palës. |

Pa nivel, tabela është sipërfaqja e sheshtë e tokës. Ngarkoni një nivel te **Niveli** për të planifikuar mbi një hartë reale: një hartë CS2 e eksportuar me veglën e CS2, një nivel nga biblioteka, ose një foto harte.

## Veglat {#tools}

| Vegla | Klikimi | Shënime |
|---|---|---|
| **Zgjidh** | Një figurë, një pikë, një shigjetë, një zonë ose një shënim e zgjedh. | Shift+klik shton ose heq; Shift+tërheqje vizaton një kuti rreth asaj që do të shtohet. Zgjedhja merr një gizmo transformimi (shih më poshtë); `Delete` ose `Backspace` e heq. `M` e zhvendos figurën e zgjedhur te klikimi tjetër. |
| **Vendi** | Vendos figurën e zgjedhur. | Një figurë zgjidhet te paleta **Figurat** (me **Kërko figura**). Pa asgjë të zgjedhur, `R` e rrotullon figurën tjetër me 15° para se të vendoset (`Shift+R` në drejtim tjetër). |
| **Shigjetë** | Çdo klikim shton një pikë; Enter, dy klikime ose një klikim me të djathtën e mbyll, Esc e heq. | **Zhvendos**, **Sulm** (kokë më e gjerë) ose **Vëzhgim** (një vijë e hollë në lartësinë e syrit). Një shigjetë e nisur mbi një figurë është rruga e asaj figure në këtë hap: kur luhet, figura e ecën, dhe hapi tjetër nis aty ku mbaroi. |
| **Hedhje** | Hedhësi, pastaj aty ku bie. | Një hark me pika nga njëri te tjetri, dhe vegla e zgjedhur (tym, dritë, molotov, ...) shfaqet aty ku bie dhe qëndron nga ky hap e tutje. |
| **Zonë** | Qendra, pastaj skaji. | Një disk në ngjyrën e palës. |
| **Shënim** | Ku shkon shënimi; kërkon tekstin e tij. | Shfaqet si një pin, dhe teksti i tij mbi të. |
| **Fshi** | Një figurë, shigjetë, zonë ose shënim. | E heq nga ky hap e tutje; te hapi i parë, e heq gjithmonë. |

**Zhbëj** dhe **Ribëj** (`Ctrl+Z`; `Ctrl+Y` ose `Ctrl+Shift+Z`) kalojnë nëpër çdo ndryshim. Një vijë nën plan tregon sa figura, shigjeta dhe hapa ka. **Pamje nga lart** shikon drejt poshtë (ortografike), **Pamje 3D** kthehet te perspektiva, **Kuadri** e përshtat planin, ose nivelin kur plani është bosh.

**Madhësia e figurës** e shkallëzon çdo figurë në tabelë; 1× është madhësia reale, që nga lart është disa piksela për një njeri.

## Lëvizja, rrotullimi dhe shkallëzimi {#moving-turning-and-scaling}

Çdo gjë në tabelë mund të zhvendoset si në një redaktor 3D: figura, vegla, shenja, pika të vetme dhe shigjeta të tëra, zona dhe shënime. Ajo që është e zgjedhur merr një gizmo në mes:

| Mënyra | Çelësat | Dorezat |
|---|---|---|
| **Zhvendos** | W (ose G) | Një shigjetë për çdo bosht (X e kuqe, Y e gjelbër dhe lart, Z blu) zhvendos përgjatë tij; një katror zhvendoset në planin e vet; qendra zhvendoset mbi nivelin nën tregues. |
| **Rrotullo** | E (ose R) | Një unazë për çdo bosht rrotullohet rreth tij. Unazat e një figure të vetme janë devijimi, pjerrësia dhe rrotullimi i saj; një grup rrotullohet rreth boshteve të botës, rreth mesit të vet. |
| **Shkallëzo** | R (ose S) | Shpërndan ose mbledh zgjedhjen nga mesi i saj përgjatë një boshti ose në çdo drejtim; rrezja e një zone rritet me të. |

**Çelësat** ndërron midis W / E / R (Unity, Unreal) dhe G / R / S (Blender); çelësat zgjedhin mënyrën vetëm kur diçka është e zgjedhur, dhe e fluturojnë kamerën përndryshe. Pra `R` do të thotë **Shkallëzo** me çelësat W / E / R dhe **Rrotullo** me çelësat G / R / S kur diçka është e zgjedhur, dhe rrotullon figurën tjetër për t'u vendosur kur nuk ka asgjë të zgjedhur. Të gjithë çelësat e tabelës listohen te [referenca e tastierës](keyboard-reference.md#tactics-board). Mbajeni **Ctrl** gjatë tërheqjes që një zhvendosje të ngjitet te **Rrjeta** (metra) ose një rrotullim te **Hapi i këndit**. **Ngjit në tokë** (i ndezur si parazgjedhje) i vendos njerëzit, mjetet, shenjat, pikat dhe zonat e zhvendosura mbi sipërfaqen e nivelit; avionët dhe helikopterët e mbajnë lartësinë e tyre, dhe një tërheqje përgjatë shigjetës Y nuk ngjitet kurrë. Tërheqja e një dorëze nuk e zhvendos kurrë kamerën. **Esc** anulon një tërheqje, dhe çdo ndryshim është një hap i Zhbëj.

Pikat e rrugës shfaqen si pika mbi shigjetat e hapit të shfaqur: klikoni një që ta zgjidhni, tërhiqeni që ta zhvendosni, Delete për ta hequr. Seksioni **Të zgjedhura** tregon vendin e zgjedhjes në metra, devijimin, pjerrësinë dhe rrotullimin e një figure në gradë dhe rrezen e një zone, secila për t'u shkruar.


## Koha {#timing}

Rruga e një figure është e kohëzuar: çdo segment merr gjatësinë e vet mbi nivelin - e marrë si mostër mbi sipërfaqe çdo dy metra rreth, kështu që një kodër ose shkallët midis dy pikave numërohen - me shpejtësinë e **mënyrës** së lëvizjes së asaj figure në atë lojë, plus çdo **pritje** te një pikë rruge. Këmbësoria zvarritet, kucudhet, ecën (pa zhurmë), vrapon ose sprinton; mjetet dhe anijet zvarriten, shkojnë me kujdes, normalisht ose nxitojnë; avionët dhe helikopterët fluturojnë ngadalë, me shpejtësi kreuzimi, me shpejtësi luftimi ose maksimale. Një mënyrë që loja nuk e ka (CS2 s'ka sprint) merr më të afërtën që ka. Si e ngadalëson një pjerrësi varet nga loja: në CS2 dhe Valorant numërohet vetëm distanca horizontale, si në lojërat; simulimet ushtarake e ngadalësojnë këmbësorinë në ngjitje (funksioni i ecjes së Tobler-it) dhe mjetet sipas pjerrësisë.

Shpejtësitë vijnë nga tabela për çdo lojë me burimet e tyre (shih [Shpejtësitë e lëvizjes](tactics-speeds.md)): CS2 sipas armës së mbajtur, nga përkufizimet e armëve të lojës; Valorant sipas armës; Battlefield, Squad, Arma dhe lojërat ajrore sipas llojit dhe klasës së mjetit. **Lëviz si** zgjedh profilin e një figure (një armë, një lloj mjeti); **E vetja (m/s)** e anashkalon çdo mënyrë për atë figurë. Mënyrat emërtohen ashtu si i tregon tabela: *Zvarritje*, *Kucudhje*, *Ecje (pa zhurmë)*, *Vrapim*, *Sprint*; *Me kujdes*, *Normale*, *Nxitim*; *Ngadalë*, *Kreuzim*, *Luftim*, *Maksimale*.

Çdo pikë rruge tregon kohën nga pika e fundit dhe kohën nga fillimi i planit ("+3.9 s · 0:12"). Rruga e figurës së zgjedhur liston çdo segment me mënyrën, gjatësinë dhe kohën e tij, pritjen dhe mbërritjen. **Mbërritjet** nën **Koha** vendos çdo figurë me rrugë në një vijë kohe të vetme, mbërritja e parë lart. Me **Luaj në kohë reale** (i ndezur si parazgjedhje) një hap zgjat deri sa të mbërrijë rruga më e ngadaltë dhe çdo figurë lëviz me shpejtësinë e vet; **Sekonda** është atëherë gjatësia më e shkurtër e hapit. **Njësi niveli për metër** tregon se në çfarë është niveli: 39.37 për hartat CS2 (njësi lojës), 1 për hartat në metra.

## Krahasimi me të dhënat e ndeshjes {#compare-with-match-data}

**Ngarko skedarët e ndeshjeve…** lexon tabelat e ndeshjeve CS2 të hartës (skedarët Parquet të veglës CS2, sa të duhen; vetëm kolonat e nevojshme, në sfond); **Përdor të dhënat e ngarkuara** merr të dhënat e ngarkuara në shikues. Pastaj:

- **Mbërritja më e hershme në hartë** e ngjyros hartën sipas kohës nga fillimi i raundit kur një lojtar arriti për herë të parë çdo vend - butoni **Më i shpejti** tregon më të shpejtin mbi të gjitha raundet, **Tipik (mediana)** raundin e mesëm - nga jeshile herët deri te e kuqe vonë, për një palë ose për të dyja. Tregon çfarë është e mundur, dhe kur.
- Rruga e zgjedhur krahasohet me atë që arritën lojtarët nga fillimi i saj (ose nga fillimi i raundit) deri në fund, çdo skaj një disk me rrezen e caktuar: "Më e shpejta e vërejtur 14.2 s, p10 15.0 s, mediana 18.3 s nga 41 vrapime; plani juaj 15.1 s".
- Shpejtësitë me të cilat lëviznin vërtet lojtarët - vrapim, ecje, kucudhje, nga kolonat e ecjes dhe të kucudhjes së tabelave - në m/s.

## Hapat {#steps}

Shiriti poshtë pamjes mban hapat. Një plan nis me një; **+** shton një, dhe çdo figurë nis aty ku mbaroi rruga e saj në hapin e fundit; **−** heq atë të shfaqur. **Sekonda** është sa zgjat hapi i shfaqur kur luhet. **▶** (K) luan nga hapi i shfaqur deri në fund: figurat me rrugë e ecin atë, figurat e zhvendosura në një vend të ri në hapin tjetër rrëshqasin atje, pjesa tjetër qëndron. Ndërsa një hap shfaqet, vendi i çdo figure në hapin tjetër vizatohet si një fantazmë e zbehtë, dhe shigjetat e hapit të fundit nën ato të këtij hapi, të zbehta.

## Ruajtja {#saving}

Seksioni **Skedari** mban **Ruaj**, **Hapje** dhe **Pastro**. **Ruaj** shkruan planin si `<emri>.h3dplan.json` (JSON i thjeshtë: palët, hapat, figurat me një vend për hap, shigjetat, zonat, shënimet); **Hapje** e lexon përsëri. Një skedar i një versioni tjetër, ose që nuk është plan, refuzohet me arsyen. **Pastro** e zbraz planin; Zhbëj e kthen.

## Figurat {#figures}

Çdo figurë ndërtohet nga vetë shikuesi: forma të thjeshta me madhësinë e publikuar të një lloji, me veçoritë që e dallojnë nga fqinjët - rrotat rrugore dhe kulla e tankut, topat, raketat dhe radarët e një mjeti mbrojtjeje ajrore, plani i krahut të avionit, bishti dhe motorët, rotorët dhe krahët e shkurtër të një helikopteri. Asgjë nuk merret nga një lojë. Një dizajn që e shpiku një lojë shfaqet si figura e përgjithshme e klasës së tij. Shih [Figurat](figures.md#which-figure-a-unit-gets) për mënyrën si të dhënat gjejnë figurën e tyre.

## Njoftimi i Riot {#riots-notice}

Hartat e Valorant shfaqen sipas politikës "Legal Jibber Jabber" të Riot Games, që lejon projektet e lira të komunitetit t'i përdorin dhe kërkon këtë njoftim kudo që shfaqen: *3DHeat u krijua sipas politikës "Legal Jibber Jabber" të Riot Games duke përdorur asete që zotëron Riot Games. Riot Games nuk e miraton dhe nuk e sponsorizon këtë projekt.* Aftësitë në tabelë janë forma të përgjithshme, jo arti i Riot.
