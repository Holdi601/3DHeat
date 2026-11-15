---
title: "Analiżi kantunata b'kantunata"
parent: "Analiżi tat-tellieqa"
nav_order: 55
lang: "mt"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analiża kantuniera b'kantuniera

Żewġ dawriet tal-istess kors jitqabblu kantuniera b'kantuniera. Għal kull kantuniera l-viewer juri min kien aktar mgħaġġel, kemm kien jiswa fil-ħin, u għaliex - ibbrejkja kmieni wisq, ħa l-gass tard, ħa linja wiesgħa - sabiex tkun taf x'għandek tipprattika l-ewwel.

![Sejbien miftuħ f'Fejn tittejjeb, ħdejn it-tabella Kantuniera b'kantuniera](../assets/img/en/race-corner-finding.webp)

Eżempju maħdum: fil-kantuniera 3, Driver A jibrejkja 20 m qabel Driver B u jitlef 0.15 s biex jasal hemm, imma jkun fuq il-gass iktar kmieni u jirbaħ 0.15 s fuq il-ħruġ. Netto 0.00 s: il-kantuniera hi ugwali, u ma jingħad lil ħadd biex jibrejkja aktar tard.

## Dak li tara {#what-you-see}

### Fejn tittejjeb {#where-to-improve}

It-taqsima tal-ġenb għad-dawra fil-fokus ("Iċċarga mill-inqas żewġ dawriet ta' kors wieħed." sakemm ma jkunx hemm).

**Ir-ras:** "<dawra> <ħin> kontra <referenza> <ħin>" u d-distakk fil-ħin tad-dawra - jew, għar-referenza, "kontra l-aktar dawra mgħaġġla l-oħra minn kull kantuniera (…)" u t-total li tilfet. Ħdejha, it-telf maqsum f'*sewqan* u *karozza / kuntest*.

**Il-bar tal-qsim:** il-ħin imitluf skont il-grupp tal-kawża (brejkjar, dħul, ħruġ, dritta, karozza, kuntest), bil-kuluri tal-kawżi, b'leġġenda.

**Is-sejbiet**, tliet listi:

1. Telf tas-sewwieq, l-aktar għali l-ewwel, sa **12** - jew "Imkien fejn is-sewqan differenti jrebaħ il-ħin ma jidher."
2. **Uri dak li l-karozza jew is-sitwazzjoni kkostat (X s)** - telf tal-karozza u tal-kuntest, sa 8 (mixgħul bħala default).
3. **Fejn <dawra> hi aktar mgħaġġla, jew ugwali b'mod ieħor (N)** - gwadanji u kantunieri ugwali, sa 10 (mixgħul bħala default).

Kull sejbien juri n-numru tar-rank tiegħu, it-titlu (il-kantuniera u dak li ġara, bil-kost għal telf), is-linja tal-verdett, il-kost (il-gwadanji bi sinjal minus) b'bar, u tikketta: *braking*, *entry*, *exit*, *straight* (telf tas-sewwieq, b'"· car X" meta l-karozza tispjega 0.02 s jew aktar), *car*, *context*, *quicker*, *level*. **Ikklikkja fuq wieħed** biex tqiegħed il-karozzi flimkien 40 m qabel, tiffoka fuqu u terġa' tarah, u tiftaħ il-kejl tiegħu:

- **Brejkjar:** fejn kull waħda bdiet tibrejkja (jew tħalla l-gass) u b'liema veloċità, u kemm metri kmieni jew tard (minn 5 m);
- **L-iktar bil-mod:** il-veloċità minima ta' kull dawra u fejn kienet;
- **Gass sħiħ:** fejn kull waħda kienet ċatta, u kemm kmieni jew tard;
- **Linja:** differenza fil-bidu tad-dħul, l-iktar raġġi stretti, kemm 'il ġewwa jew barra, u l-forma tal-linja ta' kull dawra u l-apex tagħha;
- **Dritta sal-kantuniera li jmiss:** it-tul tagħha, iż-żewġ veloċitajiet fejn it-tnejn kienu ċatti, x'tilfet jew rebħet u minn liema - il-veloċità tal-bidu, it-tibdil tal-qawwa tal-oħra, tnaqqis tal-gass, veloċità mitlufa, u kif kienet misjuqa (partijiet minn 0.02 s);
- **Il-karozza:** kemm mit-telf hu tal-karozza, u ta' liema haġa (qawwa, aderenza, brejkijiet; meta 0.02 s jew aktar);

imbagħad il-parir, **Il-karozzi:** (f'karozzi differenti, ara [Profili tal-karozzi](race-car-profiles.md#what-the-cars-decide-in-a-corner)), u l-parir dwar il-linja.

### Kantuniera b'kantuniera {#corner-by-corner}

Tabella (b'żewġ dawriet jew aktar), ringiela waħda għal kull settur, tal-klassi tad-dawra fil-fokus meta jkun hemm diversi klassijiet:

| Kolonna | Turi |
|---|---|
| Kantuniera | `T3`, `T11-T12` |
| L-aktar mgħaġġla | id-dawra l-aktar mgħaġġla minnha (il-ħin proprju tagħha mill-bidu tas-settur sat-tmiem) |
| minn | il-marġni tagħha fuq it-tieni l-aktar mgħaġġla, f'sekondi |
| linja | il-forma u l-apex tal-linja tad-dawra l-aktar mgħaġġla ("V · late", "U/V · middle"); fuq l-immaġni tgħaddi biex tara r-raġġi l-iktar stretti, tad-dħul u tal-ħruġ tagħha; "both ways" għal kumpless imħallat |
| (id-dawra fil-fokus) | kemm kienet wara l-aktar mgħaġġla, jew ✓ meta kienet hi l-aktar mgħaġġla |

Il-kliku fuq ringiela jiftaħ is-sejbien tad-dawra fil-fokus hemm (jew iqiegħed il-karozzi flimkien 40 m qabel is-settur). Taħt it-tabella, meta kull kantuniera jkollha ħin: "L-aktar mgħaġġel minn kull kantuniera, flimkien: <ħin> (± fuq ir-referenza / fuq l-aħjar tal-klassi X)" - l-aħjar setturi flimkien mal-aktar mexxejja mgħaġġla sal-ewwel kantuniera meta dik tkun il-parti tagħha stess.

## Kif jinħadem {#how-it-is-worked-out}

Ir-regola li tmexxi: **kantuniera tiġi ġudikata sħiħa**, minn żona ta' brejkjar għal dik li jmiss. Dawra li tibrejkja qabel biex il-karozza tiddawwar u tkun fuq il-gass iktar kmieni tiġi kkreditata bil-ħruġ li xtrat, mhux imqegħda taħt pressjoni biex tibrejkja aktar tard.

## Assi ta' distanza waħda {#one-distance-axis}

Id-dawriet jitqabblu skont id-distanza, mhux skont il-ħin - sekonda warajn, żewġ dawriet ikunu f'kantuniera differenti. Lanqas skont l-odometru ta' kull dawra (linja aktar stretta tkopri inqas metri). It-**triq misjuqa** tar-**referenza** hi l-assi:

- Il-kampjuni ta' kull dawra oħra jiġu **ppruvati** fuq it-triq tar-referenza: kull kampjun jieħu `s`, kemm 'il quddiem fuq ir-referenza hu, u `d`, kemm hu fuq ix-xellug (pożittiv) jew fuq il-lemin. It-tfittxija tmur 'il quddiem mill-qbil ta' qabel (8 segmenti tat-triq lura sa 40 'l quddiem), sabiex dawra li tgħaddi minn fuq jew minn taħt innifisha qatt ma tiskatta għall-inkrar l-ieħor. L-ewwel kampjun jinstab fl-ewwel kwart tat-triq (fuq ċirkwit, il-bidu u t-tmiem jaqblu); meta ma jkun hemm xejn fi 30 m, jittieħed l-iktar punt qrib kullimkien li mhux wara l-aħħar qbil (wara spin jew ħruġ mit-triq). `s` qatt ma jonqos: kampjun li jiġi ppruvat wara dak ta' qablu jinżamm.
- Kull kanal jiġi **kampjunat** fuq grilja waħda, **kull 2 m**, lineari; kanali li jaqbżu (marċa, bnadar) bl-aqrab kampjun. Barra mill-firxa tad-dawra stess il-valuri huma vojta.
- L-ewwel u l-aħħar kampjuni ta' dawra jiġu ppruvati ftit ġewwa t-truf tar-referenza, għalhekk kull dawra tiġi **miġjuba sa 15 m** lil hinn mit-truf tagħha bil-veloċità li kellha (il-ħin jikber bid-distanza fuq il-veloċità, il-bqija jibqa') - sabiex id-delta tagħha fuq il-linja tkun id-differenza tal-ħin tad-dawra tagħha.
- `delta` = il-ħin tad-dawra f'kull punt tal-grilja nieqes dak tar-referenza: id-distakk. `lateral` = `d` fuq il-grilja.

Il-ħin li dawra ħadet iktar minn oħra bejn żewġ punti tal-grilja hu d-differenza tad-delta tagħhom: `rel(s)`. Kollox taħt huwa mibni fuqha.

## Kantunieri {#corners}

Jinstabu fuq il-**referenza** (`findCorners`), bil-veloċità tagħha mħabbra fuq ±6 m u l-kurvatura tagħha (bidla fid-direzzjoni fuq ±5 kampjuni, imħabbra fuq ±10 m):

1. **Minimi ta' veloċità b'prominenza.** Punt li hu l-aktar baxx fi ±40 m, li t-tnaqqis tiegħu mill-ogħla veloċità fuq kull naħa (qabel minimu iktar baxx) hu mill-inqas `max(2.5 m/s, 6% tal-veloċità)`.
2. **Kinks.** Qmiem lokali tal-kurvatura aktar stretta minn raġġ ta' **300 m** mingħajr minimu ta' veloċità fi 80 m: kink li tittieħed bil-gass sħiħ xorta hi kantuniera biex tinqeda.
3. **Fażijiet.** Minn kull apex lura sakemm it-triq hi tibrejkja (> 0.1) jew barra mill-gass sħiħ (< 0.95): id-dħul; 'l quddiem sakemm barra mill-gass sħiħ: il-ħruġ. Kink meħuda bil-gass sħiħ tieħu ±30 m. Kantunieri li jaqbżu jinżammu separati imma magħmulin biex jgħattu l-ġirja.
4. Numerati T1, T2 … skont l-ordni tad-dawra; **xellug jew lemin** skont is-sinjal tal-kurvatura u jekk id-dinja tkunx imqallba (l-ignoti jitqiesu bħal imqallba).

**It-tieqa tal-kantuniera** (fejn ir-referenza tdur): 'il barra mill-punt l-aktar strett fi ±40 m mill-apex sakemm il-kurvatura tibqa' 'l fuq minn seba' minn tal-ogħla tagħha, bi 10 m miż-żewġ naħat. In-naħa tagħha tagħti s-sinjal ta' "ġewwa".

## Settur: minn żona ta' brejkjar għal oħra {#segments-braking-zone-to-braking-zone}

Kull kantuniera tippossjedi t-triq sa nofs il-mezz tal-apexes miż-żewġ naħat. Fiha:

- **L-iktar punt bil-mod ta' kull dawra** hu tnaqqis reali fil-veloċità tagħha - ebda ħaġa aktar bil-mod fi 6 m (3 punti tal-grilja) miż-żewġ naħat, filwaqt li jitħares lil hinn mit-truf tal-firxa, sabiex il-ħruġ tal-kantuniera ta' qabel li għadu qed jgħaġġel fiha qatt ma jitqies bħalha - imfittex minn 15 m qabel it-tieqa tal-kantuniera sa 10 m wara. Dawra li qatt ma naqqset hemm titqiegħed fl-apex.
- **Fejn dawra bdiet titnaqqas għaliha** (`entryOf`): lura mill-punt l-aktar bil-mod tagħha permezz tal-brejkjar jew tal-ħalliet tal-gass, fuq żgħar ta' gass sħiħ, sakemm ikollha s-sieq taħt (gass ≥ 0.95, brejk ≤ 0.1) għal **10 m**; gass li reġa' ttieħed fl-aħħar **30 m** qabel l-iktar punt bil-mod għadu jappartjeni għall-kantuniera; qed tieħu kull ma hu bil-gass sħiħ, il-punt l-aktar bil-mod innifsu. Dawra mingħajr kanal tal-gass, jew li qatt ma kellha s-sieq taħt minn mindu kienet il-kantuniera ta' qabel, tibda fl-iktar punt mgħaġġel tagħha bejn wieħed u ieħor.
- **Is-settur jibda** fl-ewwel minn kull dawra li bdiet titnaqqas għalih (4 m kmieni), u jmur sal-bidu tal-ieħor li jmiss, sabiex il-brejkjar ta' kull dawra jkun fih u s-setturi jgħattu l-ġirja kollha.

**Kumplessi.** Kantunieri konsekuttivi li r-referenza qatt ma tisshaħ fit-triq bejniethom - inqas minn **40 m** ta' gass sħiħ - huma settur wieħed, "T11-T12", misjur bħala wieħed; kumpless ma jżommx aktar minn **tliet** dawriet (sezzjoni torturuża misjura qatt ma titlaq bil-gass sħiħ tibda kumpless ġdid). Kumpless li jdur it-tnejn il-ġnub hu *imħallat*: ebda forma waħda tal-linja ma titkejjel għalih.

**Fuq ċirkwit** (ir-referenza tispiċċa fi 50 m minn fejn bdiet), id-dritta tal-aħħar settur tgħaddi mal-linja sal-ewwel punt tal-brejkjar: dawra mgħaġġla titlaq mil-linja tiġi maqsuma mal-aħħar kantuniera. Dawra li bdiet minn waqfa jew minn bidu ta' tellieqa (ara [Il-bidu](#the-start)) iżżomm dik id-dritta separata.

### X'iwassal wara kantuniera {#what-a-corner-leads-onto}

Imkejjel fuq ir-referenza: il-metri bil-gass sħiħ wara l-kantuniera (mill-gass sħiħ tagħha sa tmiem is-settur, flimkien mal-għadu sal-linja) u qabel (il-"wara" tas-settur ta' qabel, jew mill-bidu).

| Tip | Regola |
|---|---|
| **bejn żewġ dritti** (`both`) | 200 m jew aktar qabel **u** 120 m jew aktar wara |
| **fuq dritta** | 200 m jew aktar wara, jew 120 m jew aktar wara u mill-inqas daqs qabel |
| **wara dritta** | 200 m jew aktar qabel |
| **link** | kull ħaġa oħra |

## X għamlet kull dawra f'kantuniera {#what-each-lap-did-in-a-corner}

`cornerMetrics`, għal kull dawra u settur, fuq il-grilja (pass ta' 2 m). Pedali: brejk jgħodd fuq 0.1; gass sħiħ hu 0.95 u aktar.

| Kejl | Regola |
|---|---|
| **punt tal-brejkjar** | l-ewwel brejk li taħtu n-nagħġa tal-gass waqgħet (taħt 0.5), jew li dam **15 m** - ħabta tas-sieq tax-xellug bil-qawwa mixgħula mhix fejn beda l-brejkjar; b'ħabiet biss, l-ewwel ħabta |
| **imħalli** | mingħajr brejkjar, l-ewwel punt li fih il-gass niżel taħt 0.8 |
| (l-ebda pedal) | il-punt fejn id-dawra bdiet titnaqqas (hawn fuq) |
| **ħelsien tal-brejk** | l-aħħar brejk sa 30 m wara l-iktar punt bil-mod |
| **veloċità fil-punt tal-brejkjar**, **metri tal-brejkjar** | sal-iktar punt bil-mod |
| **l-aqwa brejk**, **l-aqwa deċelerazzjoni** | fuq iż-żona tal-brejkjar (aċċelerazzjonijiet ta' aktar minn 45 m/s² injorati) |
| **brejkjar fuq il-kantuniera** | metri b'brejk > 0.05 u |sterzjar| > 0.1 |
| **blokk tar-rota** | l-iktar ħtikk negattiv tar-rota fiż-żona (meta d-dawra jkollha ħtikk) |
| **l-iktar punt bil-mod**, **l-iktar veloċità baxxa** | kif hawn fuq |
| **gass fuq** | wara r-ħelsien (jew l-iktar punt bil-mod), l-ewwel gass > 0.15 mingħajr brejk |
| **gass sħiħ** | l-ewwel punt wara dan li baqa' fuq ≥ 0.95 għal 10 m |
| **coasting** | metri mill-ħelsien sa gass fuq, bil-brejk u l-gass it-tnejn taħt 0.05 |
| **tnaqqis fil-gass** | drabi li l-gass niżel aktar minn 0.25 taħt l-ogħla tiegħu bejn gass fuq u gass sħiħ |
| **ġenb tal-qawwa** | l-iktar aċċelerazzjoni laterali minn 20 m qabel il-ħelsien sa l-aħħar bejn il-gass sħiħ u 20 m wara l-iktar punt bil-mod |
| **marċa fl-apex** | fl-iktar punt bil-mod |
| **ħtikk tar-rota** | l-iktar ħtikk tar-rota misjuqa bejn gass fuq u gass sħiħ |
| **bilanċ** | angolu tal-ħtikk quddiem nieqes wara f'nofs il-kantuniera (+ understeer) |
| **dritta bil-gass sħiħ** | sehem tas-settur wara l-gass sħiħ (u l-għadu sal-linja) fuq ≥ 0.95; l-iktar tnaqqis fuqu |
| **veloċità mitlufa** | l-iktar veloċità mitlufa minn punt għoli bil-gass ≥ 0.9, mingħajr brejk, fuq l-art |
| **drift fid-dħul** | l-ikbar angolu ta' drift mill-punt tal-brejkjar sa 5 m wara l-iktar punt bil-mod, fuq l-art |
| **brejk tal-id** | fejn daħal (> 0.2), sa 10 m wara l-iktar punt bil-mod |
| **arja** | sekondi fl-arja fuq is-settur, u l-aktar titjira twila tagħha |

## Min hi kull dawra mqabbla miegħu {#who-each-lap-is-compared-with}

- Dawra titqabbel mal-**aħjar dawra sħiħa tal-klassi tal-prestazzjoni tagħha stess** (ir-referenza, fil-klassi tar-referenza).
- Dik l-aħjar dawra tal-klassi (u r-referenza) titqabbel, settur b'settur, ma' **min minn dawriet oħra tal-klassi kien l-aktar mgħaġġel fuqha** - jew ma' kull dawra, meta tkun waħidha fil-klassi tagħha.

Il-mappa taż-żmien, id-distakki fil-lista tad-dawriet, l-avvenimenti tal-kontroll tal-karozza u t-tabella tal-kantunieri jsegwu l-istess paragun.

## Il-kont tal-ħin ta' kantuniera {#the-time-account-of-a-corner}

`compareCorner`, għal dawra kontra l-oħra fuq settur:

- **netto** = `rel(end) - rel(start)` (flimkien mad-dritta li tgħaddi mal-linja fuq dawra fit-titjira): il-verdett. Iqrib iktar minn **0.03 s** hu **ugwali**.
- **Il-qsim** - fejn fil-kantuniera ddawwar it-tmexxija: fil-firxa mill-ewwel punt tal-brejkjar jew mill-iktar punt bil-mod ta' kwalunkwe dawra sal-aħħar mill-gass sħiħ u l-iktar punt bil-mod tagħhom, l-akbar tbandil li l-dawra mbagħad tat lura jew rebħet lura, meta dak it-tbandil ikun aktar minn **0.04 s**; inkella l-aħħar mill-iżżewġ iktar punti bil-mod.
- **Sal-apex** = `rel(split) - rel(start)`; **wara** = netto mnaqqas dan. Meta it-tnejn ikunu ta' mill-inqas 0.04 s u b'sinjali opposti, id-dawra **kkummerċjat** waħda għall-oħra.
- **Wara** jinqasam mill-ġdid fejn it-tnejn ikunu ċatti: il-**ħruġ** (il-qsim sal-aħħar gass sħiħ) u d-**dritta** (minn hemm sat-tmiem).
- **Id-dritta** tinqasam f'tliet modi:
  - *veloċità fil-ħruġ* (`byExit`) - imkejla, mhux immudellata: il-karozza l-aktar bil-mod taqsam il-veloċità tal-bidu tal-karozza l-aktar mgħaġġla ftit 'il bogħod fuq id-dritta, u minn hemm it-traċċa tagħha stess hi dak li kienet tagħmel minn dik il-veloċità, bl-ingranaġġ, id-drag u l-mejl tagħha stess fiha. Imdawra lura għal dak il-punt (u mdawra fuq it-tmiem tal-veloċità tagħha għall-metri li tikseb) hi l-ħin tagħha mill-bidu l-aktar mgħaġġel; id-differenza hi l-kost tal-veloċità fil-ħruġ. Meta l-karozza l-aktar bil-mod qatt ma tilħaq dik il-veloċità (jew biss fl-aħħar 2 kampjuni), l-aċċellerazzjoni proprja tagħha fuq it-triq titqiegħed lura bħala qawwa (`a·v` miżmum), qatt aktar iebsa minn kif turi l-envelope tagħha f'dik il-veloċità (darbtejn l-aċċellerazzjoni mkejla mingħajr envelope).
  - *il-qawwa tal-karozzi* (`byPower`) - biss f'karozzi differenti: iż-żewġ karozzi mill-istess veloċità fuq l-istess metri, bil-gass sħiħ, billi jintegra l-aċċellerazzjoni bil-gass sħiħ li kull waħda wriet f'kull veloċità.
  - *kif tmexxiet* (`driven`) - il-bqija: tnaqqis tal-gass, veloċità mnaqqsa bil-gass sħiħ.

  Il-veloċità fil-ħruġ qatt ma tispjega aktar mill-kost tad-dritta (u qatt bis-sinjal oppost), ħlief jekk tnaqqis jew veloċità mitlufa ħaditha lura. Dawra **tnaqqset** fuq id-dritta meta s-sehem tagħha bil-gass sħiħ ikun taħt it-tnejn 0.9 u s-sehem tal-oħra nieqes 0.05. Il-veloċità mitlufa tgħodd meta t-tnejn jiddifferixxu b'aktar minn 1 m/s. Nuqqas ta' qbil taħt 0.02 s fis-sinjal jitqiegħed għal 0.

Il-netto ta' kull settur iżid sal-id-differenza tal-ħin tad-dawra, u l-kantuniera kollha tiegħu sal-apex u wara jiżdiedu sal-netto tagħha (it-testijiet jikkontrollaw it-tnejn).

### Is-sehem tal-karozza {#the-cars-share}

Biss meta d-dawriet ikunu f'**karozzi differenti** u d-dawra titlef il-ħin (`carShare`):

- **qawwa**: il-qawwa tal-karozzi fuq id-dritta (hawn fuq), sal-telf;
- **aderenza**: meta d-dawra kienet fil-limitu tal-karozza tagħha (aċċelerazzjoni laterali fin-nofs ta' mill-inqas **90%** ta' dak li l-karozza tagħmel f'dik il-veloċità) u l-karozza l-oħra tieħu aktar minn **5%** iktar: mill-veloċità minima l-aktar baxxa mhux spjegata minn raġġ aktar stretti, is-sehem `½ ln(aderenza_l-oħra / aderenza_tiegħi) / ln(v_l-oħra / v_tiegħi)` tat-telf li jibqa';
- **brejkijiet**: meta d-dawra tkun ibbrejkjat (mhux ħallietx), il-karozza l-oħra tibrejkja aktar minn **5%** iebes, u d-deċelerazzjoni *medja* tad-dawra fuq iż-żona kienet mill-inqas **80%** ta' dak li l-karozza tista' tagħmel: minn `u` 'l isfel għal `v` f'`a1` kontra `a2`, li jispiċċa fl-istess punt, `(1/a1 - 1/a2)(u - v)² / 2u`, sa dak li jibqa'.

Il-kost tal-karozza hu s-somma, l-iktar sal-telf.

## Il-verdett u s-sejbien {#the-verdict-and-the-finding}

`cornerFinding` jikteb mill-iktar sejbien wieħed għal kull dawra u kantuniera, ippruvat f'dan l-ordni:

| Każ | Sejbien | Riżultat |
|---|---|---|
| netto fi ±0.03 s, kummerċ, in-naħa iż-żgħar ≥ **0.1 s** | **ugwali, b'żewġ modi** - min kien bil-mod fid-dħul u mgħaġġel fil-ħruġ, min kien bil-mod fl-ieħor; b'dritta wara (għal fuq dritta, jew bejn tnejn), it-triq bil-mod-fid-dħul u mgħaġġla fil-ħruġ hi dik li għandha tinbena fuqha: żomm il-gass bikri tagħha, irbaħ lura d-dħul billi tibrejkja iktar iebes, mhux aktar tard | ugwali |
| netto fi ±0.03 s, mod ieħor | ma jingħad xejn | - |
| rebaħ, kummerċ, tilef sal-apex | **il-bil-mod fid-dħul, mgħaġġel fil-ħruġ tagħmel tajjeb**: żommha, hawnhekk il-ħruġ jiswa aktar | rebħ |
| rebaħ, kummerċ, rebaħ sal-apex | **aktar mgħaġġel fid-dħul**: id-dħul hu tajjeb, gass sħiħ iktar kmieni iżomm aktar | rebħ |
| rebaħ, u l-linja l-oħra għandha telf hawn | **aktar mgħaġġel - minħabba dak li għamel l-ieħor**, il-kawża tiegħu u l-parir tiegħu jgħidu "Għall-linja l-oħra: …" | rebħ |
| rebaħ b'mod ieħor | **aktar mgħaġġel fid-dħul / fil-ħruġ**, b'liema nofs rebaħ iktar (brejkjar aktar tard, aktar veloċità fin-nofs; jew ċatt kmieni, qawwa aktar qawwija) | rebħ |
| tilef, u **ħsara jew tfarfir** jiswa mill-inqas `max(0.05 s, 40% tat-telf)` | l-impatt hu l-istorja tal-kantuniera, qabel il-karozzi | telf |
| tilef, u **s-sehem tal-karozza** hu 60% jew aktar | **il-karozza**: il-qawwa tagħha fuq id-dritta, l-aderenza fin-nofs, jew il-brejkijiet - l-iktar parti; bis-sehem tas-sewwieq (≥ 0.03 s) ngħad bħala "L-oħra X s: …" | telf |
| tilef, u **difett wieħed mhux maqsum fil-kontroll tal-karozza** jiswa mill-inqas `max(0.05 s, 40%)` | dak id-difett (ara hawn taħt), bi kif il-ħin tbiegħed madwaru | telf |
| tilef, u **titjira itwal** tiswa mill-inqas `max(0.05 s, 40%)` | it-titjira | telf |
| tilef, kummerċ, rebaħ sal-apex | **daħlet wisq mgħaġġla, ħruġ bil-mod**: il-kawża tal-ħruġ; ħalli xi dħul biex tiddawwar u tiġi ċatta iktar kmieni, bil-punti tal-brejk u tal-gass sħiħ tad-dawra l-oħra. Il-għerq tagħha (`cause`, li l-[istatistika](race-course-statistics.md) tgħodd): brejkjar aktar tard, meta bibrejkja iktar minn ftit metri aktar tard mill-oħra; inkella l-kawża tal-ħruġ | telf |
| tilef, kummerċ, tilef sal-apex | **ta aktar fid-dħul milli rebaħ lura fil-ħruġ**: il-kawża tad-dħul, li hi wkoll il-għerq tagħha (`cause`); żomm il-ħruġ, itlef inqas fid-dħul | telf |
| tilef, mhux bil-gass fuq id-dritta, u s-sewqan mhux mgħaġġel fuq id-dritta tieħu iktar minn nofs it-telf | **mhux mgħaġġel fuq id-dritta**: sehem tiegħu bil-gass sħiħ kontra dak tal-oħra, fejn u kemm ilu bil-kwiet | telf |
| tilef, il-qawwa tal-karozzi iktar minn 60% tat-telf u d-dritta iktar minn nofs | **il-qawwa tal-karozza fuq id-dritta** (b'qawwa t-tnejn il-karozzi f'160 km/h) | telf |
| tilef b'mod ieħor | il-kawża tan-nofs li tilef iktar (sal-apex ≥ wara: tad-dħul; inkella tal-ħruġ). Mgħaġġel barra biss għax bil-mod fin-nofs (b'iktar minn 1 m/s): minflok il-kawża tan-nofs | telf |

Sejbien dwar telf jista' wkoll jintemm b'**Barra minn hekk:** - veloċità mitlufa bil-gass sħiħ, jew ħtikk tal-gass fuq id-dritta - meta l-parti misjuqa tad-dritta kkostat iktar minn 0.04 s u dan ma kienx diġà l-kawża.

Is-sejbiet jiġu mfassla t-telf l-ewwel, l-aktar għali l-ewwel; imbagħad il-gwadanji u l-kantunieri ugwali.

### Kawżi fuq it-triq ta' ġewwa {#causes-on-the-way-in}

`entryCause`, l-ewwel wieħed li japplika (id-differenzi fil-veloċità minima huma f'm/s; "5 m" hi l-limitu għal punt kmieni/tard biex jgħodd):

| # | Kawża (żball) | Regola |
|---|---|---|
| 1 | ħabta jew tfarfir fuq it-triq ta' ġewwa | impatt mhux maqsum li jibda sa 10 m wara l-iktar punt bil-mod |
| 2 | **kważi waqfet** (inċident) | l-iktar veloċità baxxa taħt **60%** ta' dak li l-aderenza ta' din il-karozza tippermetti fejn l-oħra għaddiet (`v_l-oħra · √(aderenza_tiegħi / aderenza_l-oħra)` meta l-oħra tkun tieħu aktar aderenza, inkella veloċità tal-oħra), id-dawra l-oħra fuq 8 m/s - dawran, kuntatt jew kantuniera mitlufa |
| 3 | difett tal-kontroll tal-karozza fuq it-triq ta' ġewwa | blokk, dfigħ, dawran, jew skiv mhux maqsum mhux fuq il-gass, li jibda sa 10 m wara l-iktar punt bil-mod, b'kost ≥ 0.02 s |
| 4 | titjira itwal qabel l-iktar punt bil-mod | ara [rally](#rally-rotation-and-flights) |
| 5 | **imħalli** meta l-oħra baqgħet ċatta jew ħalliet 5 m jew aktar tard | din id-dawra ħalliet biss |
| 6 | **ibbrejkjat** meta l-oħra ħalliet biss jew baqgħet ċatta | u kienet aktar minn 0.5 m/s iktar bil-mod fin-nofs |
| 7 | **brejkjar bil-moħħ** | ibbrejkja (mhux ħalla), kellha ambjent biex tibrejkja iebes - b'dejta tat-tajers, il-ħtikk tal-blokk taħt **60%** tal-ħtikk fejn il-brejkijiet ta' din il-karozza jagħtu l-aħjar; mingħajr, deċelerazzjoni tal-aqwa taħt **85%** ta' dak li turi f'dik il-veloċità - is-sieq taħt 0.95, u d-deċelerazzjoni tal-aqwa tad-dawra l-oħra aktar minn **15%** ogħla |
| 8 | **ibbrejkjat kmieni** - jew **il-brejkijiet tal-karozza** | ibbrejkja aktar minn 5 m qabel l-oħra. F'karozza oħra li l-brejkijiet tagħha huma aktar minn 5% iebsin, u b'mhux aktar minn 10 m ta' marġni kontra d-distanza li din il-karozza teħtieġ bid-deċelerazzjoni proprja tagħha: il-brejkijiet tal-karozza. Inkella, ibbrejkja kmieni, b'"Ibrejkja aktar tard - madwar N m" (f'karozza oħra, il-metri lil hinn minn dak li teħtieġ) |
| 9 | **coasted** | aktar minn 10 m b'ebda pedal, u 5 m aktar mill-oħra |
| 10 | **aktar bil-mod fin-nofs** | aktar minn 0.5 m/s iktar bil-mod fl-iktar punt bil-mod; maqsum bil-`v² = a·R` (hawn taħt) |
| 11 | **wasal iktar bil-mod** | aktar minn 1 m/s iktar bil-mod fil-punt tal-brejkjar, mhux ibbrejkja kmieni: iddeċiż qabel - mill-kantuniera ta' qabel u l-qawwa tal-karozza, jew minn titjira fil-kantuniera ta' qabel li kienet 0.2 s itwal. Tal-karozza meta l-karozzi jiddifferixxu |
| 12 | aktar bil-mod sal-apex | inkella: aħlaq il-brejk b'mod iktar bil-mod u roll aktar veloċità fin-nofs |

**Aktar bil-mod fin-nofs** (`middleSplit`): ir-raġġ ta' kull dawra fl-iktar punt bil-mod tagħha jitkejjel minn triqitha stess (±8 m), l-aċċelerazzjoni laterali tagħha bħala `v²/R`, u

`ln(v_l-oħra / v_tiegħi) = ½ ln(a_l-oħra / a_tiegħi) + ½ ln(R_l-oħra / R_tiegħi)`.

- Ir-raġġ jispjega **nofs jew aktar**: **linja tqila wisq** - "uża iktar mit-triq", bi ż-żewġ raġġi u s-sehem.
- Fil-limitu tal-karozza (jiżżerżaq aktar minn 10° ta' drift fuq l-asfalt / 20° fuq l-art mgħobbija, jew aċċelerazzjoni laterali ta' mill-inqas 90% ta' dak li tiflaħ f'dik il-veloċità) u l-karozza l-oħra taqbad aktar minn 5% iktar: **l-aderenza tal-karozza**; ipproteġi l-ħruġ minflok.
- Jiżżerżaq minnha (drift aktar minn 10° / 20°) u d-dawra l-oħra ma għamlitx (id-drift tad-dħul tagħha mill-inqas 4° inqas): **imdawwar** - lil hinn mill-aderenza tiegħu, mhux qasir minnha; wasal ftit iktar bil-mod. Jingħad bħala dik tal-karozza meta din il-karozza tieħu r-ruħa mill-inqas darba fil-ġimgħa aktar mill-oħra.
- F'karozza oħra li taqbad inqas minn **96%** tal-aderenza tal-oħra, u d-dawra għaddiet b'inqas minn 1 m/s minn `v_l-oħra · √(aderenza_tiegħi / aderenza_l-oħra)`: **l-aderenza tal-karozza** - "il-brejkjar aktar tard ma jagħlaqx dan".
- Inkella **aderenza għall-bqija**: aċċelerazzjoni laterali kontra dik tal-oħra fuq raġġ simili, u dak li din il-karozza taqbad; ġib iktar veloċità sal-apex. Fejn ir-ruħa ta' din il-karozza titlaq qabel ma tintuża l-aderenza tagħha kollha (l-iskivi tagħha jibdew taħt 85% tal-aderenza tagħha, u d-dawra kienet fuq 80% ta' dik), sib il-bqija f'passi żgħar.

### Kawżi fuq it-triq ta' barra {#causes-on-the-way-out}

`exitCause`, l-ewwel wieħed li japplika:

| # | Kawża (żball) | Regola |
|---|---|---|
| 1 | difett tal-kontroll tal-karozza fuq it-triq ta' barra | dawran mhux maqsum, dawran tar-roti, skiv jew impatt li jispiċċa fi jew wara 10 m qabel l-iktar punt bil-mod |
| 2 | **veloċità mnaqqsa** | iktar minn 1 m/s iktar veloċità mitlufa bil-gass sħiħ mill-oħra; fuq **7 m/s (25 km/h)** "aktar bħal kuntatt jew spin milli skiv" |
| 3 | **dawret il-karozza ħażin** (art mgħobbija) | ara [rally](#rally-rotation-and-flights) |
| 4 | **fuq il-gass aktar tard** | gass fuq aktar minn 5 m aktar tard, imkejjel ukoll minn kull punt bil-mod tad-dawra stess (dawra li kienet l-aktar bil-mod aktar tard ma tiġix ikkundannata għal gass aktar tard) |
| 5 | **ħass fuq il-gass** | aktar tnaqqis fil-gass mill-oħra |
| 6 | **mar wiesa' u stenna** | aktar minn 1.5 m barra mill-oħra fejn it-tnejn kienu ċatti, u gass sħiħ aktar minn 5 m aktar tard mill-iktar punt bil-mod tagħha |
| 7 | **gass sħiħ aktar tard** | gass sħiħ aktar minn 5 m aktar tard, mill-iktar punt bil-mod tagħha wkoll; bl-aċċelerazzjoni tal-karozza hemm |
| 8 | **it-drive tal-karozza** | f'karozza oħra li tiġbed inqas minn 95% tal-oħra f'dik il-veloċità, u l-qawwa spjegat xi ftit mid-dritta |
| 9 | **aktar bil-mod barra mill-kantuniera** | inkella: apex aktar tard, sabiex il-karozza tkun dritta iktar kmieni |

Meta t-tnejn id-dawriet kienu f'ingranaġġi differenti fl-iktar punt bil-mod, it-parir jispiċċa "Marċa N fl-apex; l-oħra użat M."

### Difetti tal-kontroll tal-karozza u daqqiet {#car-control-faults-and-impacts}

Difett ta' [Avvenimenti tal-kontroll tal-karozza](race-control-events.md) bħala kawża: blokk hu kawża *tal-brejkjar*, dawran jew skiv fuq il-gass kawża *tal-ħruġ*, il-bqija *tad-dħul*; daqqa wara l-iktar punt bil-mod hi *tal-ħruġ*, qabilha *tad-dħul*. Il-parir hu dak tal-avveniment stess, imbagħad "Kostahom madwar X s sa 40 m wara" (jew "sa ma l-karozza terġa' tieħu l-veloċità" għal daqqa). Blokk b'punt tal-brejkjar aktar minn 5 m qabel l-oħra iżid li d-dawra ibbrejkjat kmieni wkoll - b'ir-roti jdawru ma kienx jeħtieġ dan.

### Rally: dawran u titjiriet {#rally-rotation-and-flights}

Fuq **art mgħobbija**, b'angoli ta' drift fuq it-tnejn id-dawriet, u din id-dawra fuq il-qawwa (jew mingħajr gass) aktar minn 5 m aktar tard:

- **Dawret il-karozza inqas**: l-oħra kellha l-karozza mdawra **12°** jew aktar sal-iktar punt bil-mod tagħha u mill-inqas **8°** aktar minn din id-dawra. Parir: ħabta tal-gass jew ħabta tal-brejk tas-sieq tax-xellug hekk kif tidħol fil-kantuniera, bil-punt tal-brejk tal-id tad-dawra l-oħra meta użatu biss hi, jew il-brejk tal-id f'kantuniera aktar bil-mod minn 15 m/s (54 km/h).
- **Dawritha 'l bogħod**: din id-dawra kellha mdawra 12° jew aktar u mill-inqas **12°** aktar mill-oħra: kellha tiġi mdawwra lura qabel jista' jinżel il-gass.

**Titjira itwal**: fl-arja 0.2 s jew aktar aktar mill-oħra, li tkun ikkostat mill-inqas 0.03 s minn 10 m qabel it-tlaq sa 40 m wara l-ħabta (jew it-tmiem tas-settur). Qabel l-iktar punt bil-mod hi kawża tad-dħul; issir l-istorja tal-kantuniera meta tispjega 40% jew aktar. Il-parir: żomm il-gass mixgħul fit-tlaq, ħu l-għoli ftit iktar bil-mod jew b'ħabta tal-brejk.

### Il-bidu {#the-start}

Qabel l-ewwel kantuniera, fuq sprint jew meta xi dawra tibda minn waqfa (taħt 5 m/s fejn it-tnejn huma l-ewwel fuq l-assi) jew f'bidu ta' tellieqa (taħt 60% tal-veloċità tal-oħra), it-triq sal-ewwel punt tal-brejkjar hi sejbien tagħha stess (kantuniera 0) meta tiddifferixxi b'aktar minn 0.03 s: *It-tlaq*, *Il-bidu tat-tellieqa* jew *Sal-ewwel kantuniera*. Telf hemm jiġi attribwit lis-sitwazzjoni (*kuntest*) meta waħda mid-dawriet bdiet f'bidu ta' tellieqa u l-oħra b'veloċità, lill-karozza meta d-dawriet huma f'karozzi differenti, u lis-sewwieq inkella. Parir: f'karozza oħra minn waqfa, "fil-biċċa l-kbira l-karozza"; bidu bil-waqfa fl-istess karozza, itlaq b'inqas skiv u aqleb fil-qofol tal-qawwa; bidu ta' tellieqa, qabbel dan ma' ewwel dawra oħra; bidu f'veloċità, ħruġ aħjar mill-aħħar kantuniera jinġarr mal-linja.

## Il-linja misjuqa {#the-driven-line}

`lineMetrics`, għal kull dawra u settur (mhux għal kumplessi imħallta), minn pożizzjonijiet biss (imħabbra fuq ±2 kampjuni) fuq it-tieqa tal-kantuniera:

| Kejl | Regola |
|---|---|
| kurvatura | bidla fid-direzzjoni fuq ±8 m tat-triq proprja tad-dawra |
| **l-iktar raġġ strett** | 1 / l-iktar kurvatura għolja |
| **dħul fid-dawran** / **ħruġ mid-dawran** | fejn il-kurvatura l-ewwel / l-aħħar taqbeż ħames tal-iktar għolja tagħha |
| **nofs** | fejn id-dawra kienet iddawret nofs il-bidla fid-direzzjoni tagħha |
| raġġ fid-dħul / barra | metri misjura fuq nofs il-bidla fid-direzzjoni, qabel / wara n-nofs |
| **forma** | l-iktar raġġ strett fuq ir-raġġ medju waqt id-dawran: taħt **0.55** **V**, fuq **0.75** **U**, bejniethom "U/V" |
| **apex** | raġġ tal-ħruġ fuq raġġ tad-dħul: fuq **1.25** tard, taħt **0.8** kmieni, inkella nofs |
| **apex tal-veloċità** | l-iktar punt bil-mod tiegħu aktar minn **15 m** qabel in-nofs: bil-mod fid-dħul, mgħaġġel fil-ħruġ; aktar minn 15 m wara: għadu qed jitnaqqas wara n-nofs |

Kontra d-dawra l-oħra: kemm kienet ġewwa (+) jew barra minnha fid-dħul, minn ġo l-parti l-aktar stretta u fejn it-tnejn kienu ċatti (miżmuma minn 1 m 'il fuq); fejn kull waħda bdiet tidħol (miżmuma minn 8 m 'il fuq).

### Liema linja taddatta ma' din il-karozza hawn {#which-line-suits-this-car-here}

`lineFor`, minn dak li l-kantuniera twassal għalih u l-karattru tal-karozza f'din il-kantuniera:

- **qawwa-għall-aderenza** = l-aċċelerazzjoni tal-karozza bil-gass sħiħ fuq il-veloċità tal-ħruġ diviża bl-aderenza tagħha fl-iktar veloċità baxxa (mill-envelope tagħha). **Point and shoot** fuq **0.45** u iktar; **momentum** fuq **0.25** u inqas.
- **downforce**: aderenza f'151-252 km/h diviża b'aderenza f'54-108 km/h ta' **1.15** jew aktar, għal kantuniera meħuda fuq **144 km/h** (40 m/s) jew aktar mgħaġġla - allura hi kantuniera momentum kull ma tkun il-qawwa. Mhux iġġudikata fuq l-art mgħobbija.

| Tip ta' kantuniera | Karozza | Linja |
|---|---|---|
| wara dritta | point and shoot / oħra | V / U, apex fin-nofs: "iż-żona tal-brejkjar hi l-premju" |
| bejn żewġ dritti | momentum / oħra | U / V, apex tard |
| link | momentum / oħra | U / V, apex fin-nofs: "imxi fiha għall-ħruġ tal-oħra li jmiss" |
| fuq dritta | momentum (jew kantuniera downforce mgħaġġla) | U wiesgħa u tonda, apex ftit tard |
| fuq dritta | point and shoot | V: ibrejkja dritt, idaħħal it-timone tard, idawwar f'nofs qasir u strett, dritt kmieni |
| fuq dritta | bejn | U b'apex tard: bil-mod fid-dħul, mgħaġġel fil-ħruġ |

Fejn il-ħruġ jimporta (fuq dritta, bejn tnejn), id-drivetrain iżid sentenza: **FWD** - iddawwar bil-brejkijiet, żid il-qawwa biss hekk kif ir-rota titħallas; **RWD** b'qawwa-għall-aderenza ta' 0.35 jew aktar - agħmilha dritta qabel il-gass sħiħ; **AWD** - tista' tieħu qawwa filwaqt li tkun għadha qed tdur. Fuq art mgħobbija kull linja tiżid: iddawwar il-karozza fid-dħul.

Is-sentenza mbagħad tgħid x'misjet id-dawra, u jekk taddattax: *l-iktar bil-mod tard iqaxxar il-ħruġ* jew *apex kmieni iqaxxar il-ħruġ* fejn kien mixtieq apex tard u d-dawra la apexat tard u lanqas kienet l-iktar bil-mod kmieni; *aktar tond milli din il-karozza trid* fejn kien mixtieq V; *aktar kwadrat milli din il-karozza trid* fejn kien mixtieq U; inkella *dan jaqbel*.

## Għall-iżviluppaturi {#for-developers}

Kodiċi: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Ir-raġunament u s-sorsi tiegħu: [il-metodu](race-analytics.md).
