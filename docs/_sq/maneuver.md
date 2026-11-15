---
title: "Manovrat"
parent: "Vëzhgime"
nav_order: 4
lang: "sq"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manovrat: si lëvizin grupet

**Vëzhgime → Manovra** ndjek si lëvizin njësitë e secilës palë *si grupe*
dhe emërton manovrat që bëjnë - një krah, një pincer, një depërtim, një
pritë, një tërheqje, një mbrojtje raketash, kalimi i T-së - secilën me sa
e sigurt është, numrat pas saj, nëse ia vlejti, dhe paralelet e saj në
doktrinë dhe histori. **Analizë masive → Manovra** i numëron ato mbi mijëra
ndeshje: sa shpesh bëhet secila për hartë, mënyrë lojë dhe palë, dhe sa
shpesh ia vlen.

Gjithçka llogaritet në shfletuesin tuaj, në punëtorin e vet
(`src/insights/maneuver`); një ndeshje me disa qindra njësi zgjat 10-500 ms,
një luftë ajrore dy-orëshe me mijëra objekte rreth një sekondë.

## Përdorimi {#using-it}

- Hapni **Vëzhgime**, skedën **Manovra**. Llogarit kur hapet për herë të
  parë; **Kërko përsëri** pasi ndryshoni filtrat.
- **E sigurt / E mundshme / E mundur** cakton besueshmërinë e shfaqur
  (E mundshme si parazgjedhje).
- **Kohëvizata** ka një shirit për secilën palë dhe një shenjë për çdo
  manovër; **lista** nën të është e njëjta, sipas kohës. Një klikim e kalon
  riluajtjen në fillimin e saj, e fluturon kamerën atje dhe e vizaton në 3D:
  rruga e secilit grup si shigjetë (dy krahët e një pinceri janë harqet e
  tij), konturet e grupeve në momentin kyç (ato të armikut në ngjyrën e
  palës së vet), përballja e armikut si vijë e bardhë. **Vizato të gjitha në
  3D** shton manovrat e tjera të ndeshjes, të zbehta. Vijat i dërgohen
  kartës grafike një herë, kur zgjedhja ndryshon, jo çdo kornizë: me 480
  manovra të vizatuara gjatë riluajtjes, kohët e kornizave në një GPU reale
  (WebGL2 dhe WebGPU, p99 18.0-18.5 ms, maksimumi 19.5-20.8 ms) përputhen me
  ato pa to.
- Një manovër e hapur tregon rezultatin e saj (asgjësimet dhe humbjet e
  njësive që e bënë, gjatë dhe pak pas saj, krahasuar me shkëmbimin e vetë
  palës gjatë gjithë ndeshjes), provat e saj, dhe hyrjet e bazës së njohurive
  për të - doktrinën dhe paralelet historike (Cannae për një pincer, Sedan
  1940 për një depërtim, Tsushima për kalimin e T-së, Operacioni Bolo për
  një finte...).
- Tabela e vogël në fund: për lloj dhe palë, të bëra dhe ato që ia vlejtën.

![Një pincer në ndeshjen demo sintetike: shigjetat e të dy krahëve, trupi i armikut dhe përballja e tij](../assets/img/en/maneuvers.webp)

## Si gjenden grupet {#how-groups-are-found}

Çdo njësi vendoset në një kohëvizatë të përbashkët (një hap prej 1 s në këmbë,
2 s përndryshe, më gjatë për skedarë shumë të mëdhenj), e mbajtur e palëvizur
mbi një vdekje, që një ripërtëritje të mos vizatojë vijë mbi hartë. Në çdo
hap, njësitë e një palë dhe një lloji (avionë, mjete, anije, këmbësoria)
lidhen kur janë afër - 18 m në këmbë, 170 m për mjetet, 3 km për anijet, 5
km për avionët - dhe lëvizin njësoj (shpejtësitë brenda gjysmës së shpejtësisë
më të shpejtë, ose të dyja në qëndrim). Një grumbull mban id-në e grupit ku
ishte shumica e anëtarëve të tij. Një njësi pa klasë vendoset në këmbë, në
mjet ose në ajër sipas shpejtësisë së saj.

**Forma** e një grupi lexohet në raport me drejtimin e tij: një kolonë ose
një vijë sipas shpërndarjes së tij përgjatë dhe tërthor, një kuneo kur
qendra prin, një eshelon kur anëtarët hapen mbrapa në një anë, një kuti kur
mbajnë qoshet.

Gjithçka gjykohet në shkallën e vetë ndeshjes: **rrezja e angazhimit** `R`
është përqindja e 75-të e distancës midis një vrasësi dhe viktimës së tij
(e kufizuar në kuptimin e domenit), dhe kohët e një manovre shkallëzohen sipas
llojit të njësisë (këmbësoria një e treta e tokës).

## Çfarë gjen {#what-it-finds}

| Manovra | Gjendet kur |
|---|---|
| Formacion | një grup mban një formë në 60% të hapave të tij në lëvizje për 30 s |
| Sulm frontal | një grup i afrohet kontaktit nga jashtë rrezes, ¾ R ose më shumë, nga brenda 35° të drejtimit ku shikon armiku |
| Sulm anësor | e njëjta gjë nga 50-130° (prapa, më tej se kjo); e sigurt vetëm me një *forcë fiksuese* miqësore që lufton armikun aty (vrasje në të dyja anët) |
| Pinçer | dy sulme anësore të një palë mbi të njëjtin trup armik, nga anët e kundërta (100° ose më shumë larg njëri-tjetrit), brenda 90 s; e sigurt kur krahët luftojnë |
| Rrethim | një grup armik i ngjeshur me të paktën aq anëtarë të palës tjetër rreth tij brenda 1.5 R, nga dy grupe ose më shumë, pa hapësirë mbi 100°, për një minutë, i shkëputur nga pala e vet; e sigurt kur unaza u mbyll me ½ R dhe luftoi xhepin |
| Depërtim | një grup kalon një vijë të mbajtur (armiq që qëndrojnë 30 s si në të majtën ashtu edhe në të djathtën e tij, qendra e palës së tij përtej tyre); e sigurt kur arrin ½ R përtej, qëndron 20 s dhe lufton aty; një depërtim një R më tej |
| Mbulim kërcimtar | në një grup të vogël, një pjesë lëviz ndërsa pjesa tjetër qëndron, rolet ndërrohen katër herë ose më shumë, me zjarr mbulues nga pjesa që qëndron |
| Përqendrim / shpërndarje | pjesa e një palë afër pikës së saj më të dendur rritet nga 35% në 60% (njësi që vijnë 1.5 R ose më shumë, pastaj kontakt) - ose bie kur pala shpërndahet |
| Finte | një element i vogël në kontakt tërheq dy ose më shumë armiq nga diku tjetër; një grup më i madh godet më pas katër rreze larg, aty ku armiku ka më pak |
| Tërheqje / ndjekje | një grup në kontakt kthehet nga ana tjetër dhe hap R nga vendi ku luftoi; e sigurt kur një armik aty sapo kishte vrarë një nga të tijtë dhe grupi u largua 2 R nga ai vrasës (kurrë në këmbë: shih më poshtë); armiqtë që lëvizin në të njëjtin drejtim dhe e mbajnë ritmin, ndjekin |
| Mbrojtje në thellësi | njësi që qëndrojnë në dy ose më shumë brezat mbi boshtin e armikut, R thellë, armiku që vjen, zjarr nga brezat |
| Shpat i kundërt | tre ose më shumë vrasje nga afër nga njësi që qëndrojnë, të viktimave që kanë kaluar një kreshtë |
| Pritë | një grup në lëvizje takon armiq që kanë qëndruar 45 s; ata qëllojnë të parët dhe lëvizësit humbin dy ose gjysmën e grupit |
| Ekran | një ose dy njësi që lëvizin përpara një trupi prej tre ose më shumë, duke takuar armikun të parat |
| Vija të brendshme | grupet e një palë afër njëri-tjetrit midis atyre të tjetrës, njësitë e saj duke lëvizur midis tyre |
| Ritmi | një palë që i përgjigjet kontaktit (kthesë, ndryshim shpejtësie, gjuajtja e parë) 1.5 herë më shpejt, p i Mann-Whitney nën 0.05 |
| Manivela, prerja, tërheqja, pompa | objektivi i një lëshimi raketash e kthen gjuajtësin në 35-70°, 75-105°, përtej 140°, ose e tërheq dhe e kthen prapa |
| Pinçer ajror, mur, udhëheqës-ndjekës, bluajtës | një çift që ndahet mbi një armik; tre pranë njëri-tjetrit ndaj armikut; një element 5-20 km prapa një tjetri; dy që rrotullohen rreth një pike, një largësi mes tyre |
| Patrullim luftarak ajror | rrotullohet rreth një stacioni për tre minuta |
| Luftë energjie / kënddhënash | në një luftë të afërt - drejtime 30° larg njëri-tjetrit, secili duke e mbajtur tjetrin përpara hundës së vet me radhë, ose një vrasje mes tyre - lartësia e përdorur dhe duke u ngjitur, ose e sheshtë dhe duke u kthyer fort ndërsa ngadalësohet; e sigurt kur njëri vrau tjetrin |
| Paketa goditëse, SEAD | një grup ajror me role të përziera, disa prej të cilëve godasin tokën; vrasjet e mbrojtjes ajrore para shumicës së vrasjeve të tjera në tokë |
| Linja e betejës, kalimi i T-së | tre anije në kolonë; një kolonë katrore mbi kokën e një kolone armike |

Çdo manovër thotë cilat **modele** të bazës së njohurive tregon
(`patterns-maneuver.ts`: formacion, sulm frontal, zarfosje e dyfishtë,
rrethim, depërtim, zjarr dhe manovër, finte, tërheqje, ndjekje, mbrojtje në
thellësi, ekranim, shpërndarje, mbrojtje raketash, luftë kënddhënash,
patrullim luftarak ajror, paketë goditëse, linjë beteje, kalimi i T-së) dhe
hyrjet që duhen lexuar së pari; hyrjet e vjetra marrin modelet e reja përmes
`knowledge/maneuver-tags.ts`. Shih [Lenteja e njohurive](knowledge.md).

**Ia vlejti** krahason shkëmbimin e njësive gjatë zhvillimit të saj (dhe një
minutë pas) me atë të palës së vet gjatë gjithë ndeshjes; një tërheqje ia
vlen kur humb më pak njësi pas kthimit sesa para tij, një mbrojtje raketash
kur avioni jeton një minutë, një rrethim kur xhepi humb gjysmën.

## Mbi shumë ndeshje {#over-many-matches}

Përmbledhja e secilës ndeshje (`src/mass/summarize.ts`, shih [Analiza
masive](mass-analysis.md)) mban një seksion të vogël `maneuvers`: për lloj
dhe palë, të bëra (në Likely ose më shumë), që ia vlejtën, që nuk ia vlejtën,
vrasje dhe humbje. **Analizë masive → Manovra** i mbledh ato mbi ndeshjet që
mban filtri - për hartë dhe mënyrë lojë, ose mbi të gjitha - me intervalin
Wilson të normës së ia vlejtës; një rresht ngarkon ndeshjet ku u bënë.
Përmbledhjet e shkruara para këtij seksioni nuk e kanë atë: ekzekutoni
`node tools/3dheat-summarize.mjs <folder> --force` për ta shtuar.

## Sa e sigurt është {#how-sure-it-is}

Ndeshje sintetike me manovra të vendosura me qëllim (`synth.ts`, ekzekutuar nga
`maneuver.test.ts`): të 28 llojet e vendosura gjenden në Likely ose më shumë; nga
50 manovra të raportuara, 31 janë llojit të vendosur dhe 19 të tjerat janë
gjithashtu realisht aty (formacioni i grupit lëvizës, afrimi frontal i
kolonës që depërton); asnjë nuk është e gabuar. Mbi 30 ndeshje null - ecje të
rastësishme veç e veç dhe të përzier, njësi që qëndrojnë në mënyrë të rastësishme,
avionë në linja të drejta, një turmë që endet - asgjë nuk raportohet në Likely ose më shumë.

Mbi të dhëna reale (dhjetëra beteja tokësore, disa misione të gjata luftash
ajrore, një duzinë ndeshje lojërash me armë): sulme frontale, krahë, depërtime dhe
rrethime në betejat me tanke, formacione dhe luftëra të afërta në ajër, mbrojtje
raketash, orbitat CAP dhe çiftet udhëheqës-ndjekës në misionet e luftës ajrore,
ekzekutime frontale, kolona dhe disa pritë dhe çifte që mbulojnë njëri-tjetrin në
lojërat me armë. Pragjet janë format e doktrinës në shkallën e lojës; lexoni një
gjetje të vetme me provat e saj, dhe normat e tabelës masive me intervalet e tyre.

### Kundër modeleve null të të njëjtave ndeshje {#against-null-models-of-the-same-matches}

Një detektor mund të mashtrohet nga toka dhe turma: në një përleshje çdo grup ka
armiq përreth. Prandaj çdo lloj ekzekutohet gjithashtu mbi **modele null** të
ndërtuara nga të njëjtat ndeshje (`nulls.ts`), ku palët nuk takohen më ashtu si
më parë: kronologjia e një pale e kthyer rreth me një të tretën deri me dy të
tretat e ndeshjes (*zhvendosje*), ose gjurmët e saj të kthyera rreth qendrës së
hartës (*rrotullim*); dhe etiketat e ekipeve të përziera (*ekipet*, që sipas
ndërtimit ruan rreth gjysmën e luftimeve reale). Luftimet numërohen vetëm si
vrasje të çiftuara me vdekjet e tyre, vrasësi brenda 2 R dhe viktima në vend -
një model null i prish ato. Gjen një ndeshje në Likely ose më shumë, reale kundrejt
modeleve null (30 beteja me tanke; 12 ndeshje me armë):

| Lloji | Betejat me tanke: reale / zhvendosje / rrotullim | Lojëra me armë: reale / zhvendosje / rrotullim |
|---|---|---|
| Rrethim | 0 / 0 / 0 (ishte 1.3 / 1.2 / 0.8) | 0 / 0 / 0 |
| Depërtim | 0.03 / 0.02 / 0.05 (ishte 1.6 / 1.8 / 1.4) | 0 / 0 / 0 |
| Sulm anësor | 0.33 / 0.07 / 0.10 | 1.0 / 0.08 / 0.21 |
| Sulm frontal | 0.87 / 0.47 / 0.12 | 14.4 / 6.5 / 4.3 |
| Tërheqje | 0.03 / 0 / 0.02 | 0.08 / 0.08 / 0.5 (kështu kurrë e sigurt në këmbë) |
| Pritë | - | 0.17 / 0.04 / 0.04 |
| Luftë energjie | 1.2 / 0.1 / 0.85 | - |
| Luftë kënddhënash | 0.6 / 0.07 / 0.3 | - |

Luftimet e ngushta ajrore mbi qendrën e një fushe betejë mbijetojnë një kthesë
rreth asaj qendre, kështu që kolona e rrotullimit i favorizon ato më pak sesa
i favorizon llojet tokësore. Llojet brenda një pale - formacioni, patrullimi
luftarak ajror, bluajtësi, paketa goditëse, SEAD, mbulimi, ekrani - nuk varen nga
pala tjetër dhe nuk testohen kështu. `maneuver.test.ts` kontrollon që modelet
null heqin nga ndeshjet sintetike pincerin anësor, pinçerin, rrethimin, depërtimin,
pritën dhe tërheqjen e vendosur.

## Kufizimet {#limits}

- Grupet kanë nevojë për pozicione në kohë; një skedar me ngjarje të vetme nuk ka asnjë.
- Drejtimi nuk lexohet nga të dhënat: fronti i armikut është aty ku e fikson forca
  fiksuese, përndryshe aty ku lëviz, përndryshe aty nga erdhi sulmuesi.
- Terreni lexohet nga lartësitë e vetë njësive (shpati i kundërt); nuk ka test
  shikimi në vijë.
- Skedarët shumë të mëdhenj merren me hapa më të gjatë; manovrat e shkurtra ajrore
  brenda tyre lexohen prapë nga hapa 2-4 s.
