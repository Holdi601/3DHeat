---
title: "Analiżi tal-kolpijiet (tab tal-Vetturi)"
parent: "Replay"
nav_order: 4
lang: "mt"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analiżi tal-laqtiet

It-tab **Vetturi** juri fejn tank, bastiment jew suldat ġie laqat, u minn min. Uża dan biex tara liema naħa ta' tank tiġi msawta, jew liema għadu jagħmel il-ħsara.

## Ipprova {#try-it}

1. Tagħbi partita li fiha laqtiet (ara t-tabella hawn taħt biex tara liema logħob jagħtihom).
2. Iftaħ it-tab **Vetturi** fil-quċċata.
3. Taħt **Vettura**, agħżel unità, pereżempju tip ta' tank. In-numru bejn parentesi hu kemm laqtiet ħa.
4. Aqra l-figura: kull marka hi laqta, imqiegħda fejn laqtet.
5. Iftaħ **Min laqat** biex tara l-msawwba, l-armi jew il-vetturi tal-msawwba, bil-laqtiet, ħsara, qtil u distanza.

![It-tab Vetturi: tank demo b'marki tal-laqtiet, u Min laqat miftuħ](../assets/img/en/hit-analysis-tank.webp)

Jekk ebda dejta ma tkun mgħobbija, jew id-dejta m'għandhiex laqtiet fuq vetturi, it-tab jgħid x'hemm nieqes u liema konvertitur għandek tuża.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

Il-figura turi l-laqtiet fejn id-dejta tagħti punt jew parti tal-ġisem. It-tqassim (min laqat, b'xiex, kemm qawwi, minn kemm 'il bogħod) jaħdem għal kull sors.

## Dak li kull sors jagħti {#what-each-source-gives}

| Sors | Punt fuq l-unità | Msawwab | Arma | Ħsara / riżultat |
|---|---|---|---|---|
| War Thunder | iva, fil-qafas tal-unità, bit-triq tat-tir | iva | il-vettura tal-msawwab | kritiku, sever, moduli meqrudin, laqta li qatlet |
| CS2 | parti tal-ġisem (hitgroup) | iva | iva | ħsara, armatura, saħħa li fadal |
| World of Tanks | iva (kaxxa tal-komponent, dħul u ħruġ) | iva | - | ħsara jew xejn (rimbalz, ebda penetrazzjoni) |
| World of Warships | iva, fil-qafas tal-bastiment | iva | tip ta' laqta | - |
| Squad | vetturi: iva - l-impatt imqiegħed fil-qafas tal-vettura minn pożizzjoni u direzzjoni tagħha stess | le (id-dejta ma ssemmi ebda wieħed) | it-tip tal-ħsara | it-tnaqqis tas-saħħa tal-vettura f'dak il-mument, meqrud |
| Suldati ta' Squad | le: ir-riżultati tal-laqta (għadma u punt tal-impatt) jinżammu raw mill-konvertitur; ringieli `impact` b'`hitBone` jinqraw hekk kif jiktbuhom | | | feriti u mwiet biss |
| Arma (OCAP, ir-reġistratur ta' Arma 3) | le: OCAP jirreġistra min laqat jew qatel lil min, b'xiex, minn kemm 'il bogħod, mhux fejn | iva | iva | laqta jew qtil, distanza |
| Tacview ACMI | iva fejn oġġett ta' arma jispiċċa fi 30 m minn unità (mhux il-launcher tiegħu): l-aħħar post tiegħu fil-qafas tal-unità (heading, pitch, roll), ġej mit-triq li tar bih | il-`Parent` tal-arma | l-isem tal-arma, jew AmmoType ta' Timeout | Outcome ta' Timeout, tnaqqis ta' `Health`, `Destroyed`; mingħajr arma, qtil jew ħsara mingħajr punt |
| telemetrija ta' IL-2 (Watcher) | iva: avvenimenti `hit` / `damage` iġorru l-punt fil-qafas tal-inġenju tal-plejer stess (meqjus bħala x 'il quddiem, y 'il fuq, z lemin) | le | le | il-forza |
| Dota 2 | le: il-combat log m'għandux post fuq eroj | l-unità li tattakka | l-abilità jew l-oġġett (xejn: attakk) | ħsara, il-mewt tal-eroj |
| Battlefield 6 (GameCapture) | le: il-qbid jaqra l-kill feed (qtil, mwiet, bandiera headshot), mhux laqtiet | | | |
| DCS / sorsi live oħra tal-Watcher | le avvenimenti ta' laqta ħlief dawk li r-reġistrazzjonijiet tal-Tacview tagħhom iżommu | | | |

Fejn ebda laqta tal-unità ma għandha punt, il-figura ma turi ebda marka u t-tqassim **Min laqat** jiftaħ waħdu: skont il-msawwab, l-arma jew il-vettura tal-msawwab, kull wieħed bil-laqtiet, ħsara u qtil tiegħu, u d-distanza medjana u l-iktar 'il bogħod.

## Illimita għal erja {#restrict-to-an-area}

It-taqsima **Erja** tillimita l-analiżi għal laqtiet li seħħew f'post fuq il-mappa.

1. Agħfas **Ħażżeż rettangolu** jew **Ħażżeż poligonu**, u ħażżeż fuq l-art 3D jew fuq il-mappa taktika.
2. Agħżel **Vittma ġewwa** (tgħodd laqta meta l-unità mħabbta kienet fl-erja) jew **Min spara ġewwa** (meta dak li spara kien fiha).
3. Agħfas **Użahom bħala filtru**. Iċ-chips juru "{n} minn {total} laqtiet fl-erja".
4. **Irrisettja ż-żona** tneħħi l-erjas kollha.

Kull erja hi [volum](volumes.md), għalhekk l-istess forom jiffiltraw ukoll il-mappa tas-sħana u r-replay. Erja tista' tinkludi jew tesklud (erja li teskludi tħalli l-laqtiet tagħha barra, murija bħala "{n} minn {total} laqtiet barra l-erja"). Kull erja tidher bħala chip b'kemm mil-laqtiet tal-unità kienu fiha; il-× fuq chip inehhih. L-għadd, il-figura, it-tqassim u l-listi tal-filtru jsegwu kollha.

Post il-laqtiet: ir-ringiela li minnha ġejja tiżżamm post ta' parti waħda (il-vittma għal laqta jew ħsara, l-msawwab għal tir); il-parti l-oħra hi l-kampjun stess tal-unità l-iktar qrib fil-ħin (fi 5 s). Laqta li l-post tal-parti tagħha ma jkunx magħruf titħalla barra waqt li erja tkun qed tiffiltra, u l-pannell jgħid kemm ("Mitluf barra, l-ebda post magħruf").

## Għall-iżviluppaturi {#for-developers}

Kull konvertitur jista' jżid laqtiet: ringiela tal-vittma (`hit`, `impact`, `hurt`, `wounded`) b'`hitBone` (għadma ta' skeleton, selezzjoni ta' Arma, żona ta' laqta ta' Reforger - immappjata għal ras, sider, żaqq, dirgħajn u saqajn) jew `hitLocalX/Y/Z` (metri, x 'il quddiem, y 'il fuq, z lemin), bl-`other` bħala l-msawwab u `damage`.
