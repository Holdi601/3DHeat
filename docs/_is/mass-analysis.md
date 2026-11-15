---
title: "Fjöldagreining"
nav_order: 8
lang: "is"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: false
---

# Fjöldagreining: þúsundir leikja í einu

**Fjöldagreining** sýnir þér hvað heil mappa af leikjum leggur saman: hvaða farartæki vinnur mest, hvaða lið nýtur forskots, hvar átökin eru. Notaðu hana þegar þú átt miklu fleiri leiki en þú gætir horft á.

Hún vinnur út frá lítilli samantekt af hverjum leik, svo að þúsund eða tíu þúsund leikir opnast hratt. Hún hleður öllum línunum aðeins fyrir þá leiki sem þú smellir á.

## Prófaðu það {#try-it}

1. Opnaðu **Fjöldagreining** á hliðarstiku Hitakorts.
2. Ýttu á **Mappa…** (eða **Skrár…**) og veldu `.3dheat`-leikina þína.
3. Bíddu meðan spjaldið les samantektirnar („Samantektir… n af N“).
4. Ýttu á **Opna greiningu**. Gluggi opnast með flipum.
5. Stilltu síurnar (Leikur, Kort, Hamur, Frá, Til), og lestu síðan flipa, til dæmis Jafnvægi.
6. Smelltu á línu, reit eða innsýn: leikir hennar hlaðast í 3D sýnina, með myndavélina á staðnum.

![Flipinn Jafnvægi: vinningshlutfall og dráp á hvern dauða eftir farartæki](../assets/img/en/mass-balance.webp)

```
mappa með .3dheat -> samantektir -> gluggi (flipar) -> smelltu á línu -> leikir opnast í 3D
```

Skráin `.3dheat` er einn leikur ([Ein skrá fyrir hvern leik](container.md)). *Hitakort* og *lína* eru útskýrð í [orðasafninu](glossary.md).

## Að fá samantektirnar {#getting-the-summaries}

Flestir þurfa ekkert að gera: spjaldið reiknar sjálft þær samantektir sem vantar. Til að undirbúa stóra möppu einu sinni skaltu nota verkfærið án nettengingar hér að neðan.

Hver `.3dheat`-leikur fær samantekt (`src/mass/summarize.ts`), geymda í gámnum sem skráin `<leikur>.summary.json` (hlutverk `summary`, sjá [Ein skrá fyrir hvern leik](container.md)). Verkfærið skrifar þær, og vísitölu fyrir hverja möppu. Það er þróunarverkfæri; keyrðu það á stóra möppu til að spara spjaldinu vinnuna:

```
node tools/3dheat-summarize.mjs <mappa>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Leikur sem er þegar samantekinn (sama útgáfa sniðs) er aðeins lesinn; `--force` reiknar hann út aftur. `--no-write` lætur gámana í friði.
- Skrá sem var breytt á síðustu `--settle` mínútum (10) er sleppt: breytir gæti enn verið að skrifa hana.
- `<mappa>/3dheat-index.jsonl.gz`: ein lína fyrir hvern leik - slóð hans, stærð, tími og samantekt án netsins. `<mappa>/3dheat-index.grids.jsonl.gz`: ein lína fyrir hvern leik með netinu hans.
- Keyrðu það á vélinni sem geymir skrárnar, með lágum forgangi (til dæmis `nice -n 19 ionice -c3` á Linux).

Spjaldið tekur, fyrir hvern leik, það fyrsta af þessu: vísitölulínu möppunnar (sama slóð og stærð), skyndiminni vafrans (IndexedDB, eftir nafni, stærð og tíma), `summary`-hluta gámsins, eða samantekt sem reiknuð er í hópi vinnsluþráða og geymd. Mappa án vísitölu virkar því líka - í fyrsta skipti á hraða lestrar taflnanna, en eftir það úr skyndiminni.

## Spjaldið {#the-panel}

Veldu mappu (eða skrár; **Bæta við möppu…** bætir annarri við). Glugginn hefur síurnar **Leikur**, **Kort**, **Hamur**, **Frá** og **Til**, valið **Skipta eftir**, **Fæst líf** og **Aðeins leikmenn**, og þessa flipa. Hver tala kemur úr samantektunum, og smellur á línu, reit eða innsýn hleður leikjum hennar í sýnina sem yfirlag margra leikja, með síunum sem sýna hana (farartæki, flokkur, vopn, lið, spilari), og myndavélinni á staðnum:

| Flipi | Hvað |
|---|---|
| Yfirlit | leikir, klukkustundir, spilarar, líf, línur, dagsetningar; leikir á dag; eftir leik, korti, ham; samtölur atburða; hagkerfi eftir gjaldmiðli; hvenær í leiknum hlutirnir gerast |
| Jafnvægi | eftir farartæki, flokki, vopni eða liði, skipt eftir korti, ham, þrepi eða leik: K/D með ~95% vikmörkum, sigurhlutfall (Wilson), lifun, dráp og högg á mínútu, unnið á mínútu, og q - Benjamini-Hochberg hlutfall falskra uppgötvana fyrir K/D og sigur miðað við hitt í skiptingunni. **Fæst líf** felur línur með of fá líf til að treysta; **Aðeins leikmenn** sleppir því sem gervigreind verkefnisins ók |
| Þróun | notkun (hlutdeild í viðveru), K/D eða sigurhlutfall efstu farartækjanna eða flokkanna á dag, viku eða mánuði |
| Spilarar | mismunandi spilarar, leikir á spilara, spilarar á leik, algengustu spilararnir |
| Liðshliðar | hvor hlið hvers korts: leikir unnir miðað við jafna skiptingu |
| Nánir bardagar | umferðagögn: opnunareinvígi eftir hlið og hlutfall þeirra, skipti, sá sem kíkir á móti þeim sem heldur, krossskot, innkomur með blindu, markmið, sprengjur, mannayfirburðir og, **Eftir korti**, staðirnir sem drepa spilarana sem koma inn - hver sem hlutdeild með Wilson-bili sínu, úr `cqb`-tölum samantektanna ([Nánir bardagar og lotur](close-quarters.md)) |
| Kort | summað net korts: viðvera, dráp, dauðsföll, K/D, hvaða atburður sem er, flæði, og **heitt í hversu mörgum leikjum** (stöðugleiki); eftir liði, við 1, 2, 4 eða 8 sinnum reitinn |
| Staðir | staðir sem skera sig úr í tölunum en ekki á hitakortinu (stórt svæði sem er líflegt í heild, gangar, hæðarbönd); **Finna staði** |
| Hólf | hópar sem standa sig greinilega betur eða verr en hinir (farartæki á einu korti, geiri í einni hæð); **Finna hólf** |
| Innsýn | fjöldaskynjararnir og kortaskynjararnir (hér að neðan); **Afrita skýrslu (JSON)** gefur JSON sem málmódel les |

## Innsýn yfir marga leiki {#insights-over-many-matches}

Flipinn **Staðir** finnur staði sem skera sig úr í tölunum en ekki á hitakortinu - stórt svæði sem er líflegt í heild, gangur, hæðarband, staður sem er aðeins líflegur í einum hluta leiksins - merkir þá sem hitakortið sýnir ekki sem **falda**, og dregur útlínur þeirra í 3D sýninni; **Hlaða** flýgur þangað með leikjunum sem hann hélt. Flipinn **Hólf** finnur hópa (farartæki á einu korti og hlið, geira í einni hæð) sem standa sig greinilega betur eða verr en hinir; smelltu á einn til að sjá nákvæmari skilgreiningar hans.

Flipinn **Innsýn** finnur, yfir alla leiki, farartæki sem skipta eða vinna betur eða verr en hin, staði sem eru heitir í stöðugu hlutfalli leikja, hlið sem vinna meira en jafna skiptingu, farartæki þar sem notkun þeirra breytist eftir dagsetningum, og hluta leiksins sem halda fleiri dráp en jöfn dreifing gefur. Hver niðurstaða ber með sér talningar sínar, áhrif, bil og hlutfall falskra uppgötvana (haldið í 5%), og smellur hleður leikjum hennar. Nánar: [Fyrir forritara](#for-developers).

## Stærð {#scale}

Þú getur endurtekið litla útgáfu af þessu sjálfur: `node tools/demo-data.mjs` skrifar 150 tilbúna skriðdrekaleiki í `tools/.shots/demo/mass` (um 1.000 línur hver). Mælt á þessum 150 tilbúnu kynningarleikjum `tools/demo-data.mjs` á borðtölvu (raunverulegur leikur er mun stærri):

- `tools/3dheat-summarize.mjs` með 4 vinnsluþráðum: 2,6 til 4,8 s fyrir alla 150, 8 til 21 ms á leik inni í vinnsluþræði; önnur keyrsla sem les aðeins samantektirnar tekur um 2 s.
- Að opna möppuna í spjaldinu, með vísitöluna til staðar, þar til glugginn birtist: 0,9 til 1,6 s (hluti vinnsluþráðarins, lestur 150 vísitölulína, er 20 til 40 ms).
- Skipt yfir í flipa, þar til taflan hans er teiknuð: Yfirlit 10 til 30 ms, Jafnvægi 30 til 70 ms, Þróun 30 til 45 ms, Spilarar 15 til 35 ms, Liðshliðar 15 til 20 ms, Kort 55 til 130 ms.
- Geymslan heldur 150 leikjum í um 0,5 MB.

Það tekur einn stuttan ramma að opna gluggann: valdar skrár fara til vinnsluþráðarins 16 í einu, og dagsetningareitirnir og fyrsti flipinn koma ramma á eftir glugganum.

Geymslan heldur um 15 KB á leik, svo 10.000 leikir taka ~150 MB í vinnsluþræðinum; netin eru aldrei geymd lengur en kortið sem var beðið um.

## Fyrir forritara {#for-developers}

### Innsýn yfir marga leiki {#insights-over-many-matches}

`src/mass/detect.ts` - hver niðurstaða með talningum sínum, áhrifum og bili, p og q (Benjamini-Hochberg yfir allt sem skynjarinn reyndi, haldið í 5%), leiðin niður sem hleður leikjum hennar og setningarlykill með gildum hennar; skýrslan (`heat3d.mass/1`) er það sem `massReportForModel` afhendir sagnaþul, í sömu lögun og skýrsla eins leiks (`insights/seam.ts`).

| Skynjari | Finnur |
|---|---|
| `balance` | farartæki spilara sem skipta eða vinna betur eða verr en hin á korti eða í ham |
| `hotspot` | staði sem eru heitir í stöðugu hlutfalli þeirra leikja sem komu þangað (heitir leikir / leikir sem sáust, miðað við önnur hólf kortsins) - ekki bara heitir í heild |
| `side` | hlið korts sem vinnur meira en jafna skiptingu |
| `meta` | hlutdeild farartækis í lífum spilara eða K/D þess sem færist milli fyrri og seinni hluta dagsetninganna, eftir korti - nógu stórt til að skipta máli, þróast yfir ársfjórðunga, á sama veg á flestum kortum (hér að neðan) |
| `phase` | hluti lengdar leiksins sem heldur fleiri drápum, höggum, skotum... en jöfn dreifing gefur |
| `place` | staðir sem skera sig úr yfir marga leiki (Stig B, hér að neðan): tíðni svæðis eða hlutur dráps miðað við hvern leik fyrir sig, hringir, gangar, vaxin belti, hæðarbönd, fasar; falin þegar venjulegt hitakort sýnir þá ekki |
| `niche` | hópar sem standa sig greinilega betur eða verr (Stig B, hér að neðan) |
| `grid.*` | skynjararnir fyrir eitt gagnasafn (orkupunktar, heitir og rólegir reitir, flokkastaðir) á summuðum netum hvers korts: `GridMerge.toInsightJob` fyllir net innsýnarumferðarinnar úr samantektunum; skynjararnir sem þurfa slóðir sleppa |

### Samantektin {#the-summary}

Venjulegt JSON (`src/mass/types.ts`), um 5-30 KB þjöppuð á hvern leik:

- leikurinn: leikur, kort, hamur, verkefni, byrjun, lengd, línur, líf, spilarar,
  gervigreind, lið (líf, spilarar, viðvera, dráp, dauðsföll, sigur, peningar), sigurvegari;
- eftir farartæki og lið: flokkur, þrep, líf, líf spilara, viðvera, atburðir
  eftir staðlaðri tegund, dráp eftir flokki skotmarksins, sigrar, peningar;
- eftir spilara (eftir notandaauðkenni, annars nafni): lið, líf, viðvera, dráp, dauðsföll,
  högg, skot, sigrar, farartæki; eftir vopni: atburðir eftir tegund;
- dálkar hagkerfisins (`cost_*`, `earn_*`) og samtölur þeirra;
- fasar: atburðir eftir tegund í 20 bilum eftir lengd leiksins og eftir mínútu;
- hegðun: mælingar á sameiginlegri hegðun leiksins (röðun, hjarðhegðun eftir leiðum, akreinar, þröng, foringjar, eftirbátar, brotpunktur, áhætta eftir töp, rákir, samkomulag um kaup, bæling), hver með sitt eigið núlllíkan, p og q - sjá [Sameiginleg hegðun](collective-behaviour.md);
- netið (hér að neðan).

Talið eins og skoðarinn telur: dálkar fundnir eins og hleðslutækið fyrir marga leiki finnur þá (`leanSpec`), atburðir eftir `data/canonical.ts`; dráp sem vopn Tacview skorar telur fyrir skotmanninn; dauðsfall sem sagt er tvisvar í einu (`dead`, `death`) telst einu sinni.

#### Netið: það sem Stig B byggir á {#the-grid-what-stage-b-builds-on}

Rúmfræðilegi hlutinn er gerður fyrir skannatölfræði yfir svæði af hvaða stærð og lögun sem er, ekki bara hitamyndir:

- **Pýramídi.** Reitir eru jöfn veldi tveggja í heimseiningum (x, z eins og skoðarinn staðsetur þá). Stig `k` eru reitirnir sem summaðir eru með `ix >> k, iz >> k` - nákvæmt, innan leiks og yfir leiki með öðrum reitastærðum - og hvert svæði (kassi, gangur eftir línu, hringur) er summa reita. Fínasta stigið passar í þekkta útbreiðslu leiksins (reitirnir sem halda 99% viðverunnar) í 128 reitum; ráfarar utan þess eru geymdir.
- **Útsetning við hliðina á hverri talningu.** Viðverusekúndur á hvern reit, fyrir hvert lið (`pt`), fyrir hvern flokk farartækis (`pc`) og fyrir hvert hæðarband (`ph`), svo að hlutfall, væntigildi og hlutfall svæðis sé reiknað fyrir hvaða undirhóp sem er.
- **Hæð.** Bönd yfir lágmarki leiksins (1. hundraðshluti hæðar): undir 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, yfir; skrá með dálki `floor`/`storey`/`deck` setur í bönd eftir hæðum sínum í staðinn. `y` er meðalhæð hvers reits, `y0` sú lægsta (gólf hans, fyrir hæð fyrir ofan það).
- **Atburðir** sem tvíundir `[reitur, tegund, lið, flokkur, band, fjöldi]`.
- **Tímasneiðar** á grófu stigi (8 reitir á hlið), eftir mínútu frá byrjun leiksins: `[cx, cz, mínúta, tegund, gildi]`, viðverusekúndur sem tegund `GRID_KINDS.length`; fasar leiksins eru mínútur yfir lengdinni.
- Strjált, talningar heiltölur, sekúndur niður í tíunda hluta: takmarkað af því sem gerðist.

### Stig B: staðir og hólf {#stage-b-places-and-niches}

Stig B leitar að því sem skerst úr í tölunum án þess að grípa augað: stórt svæði sem er líflegt í heild án heits reits í því, undarlegt hlutfall dráps og dauða við fá atvik, gang, hæðarband, þyrpingu sem er þar aðeins í einum hluta leiksins - og hópa (farartæki á einu korti á einni hlið, geira í einni hæð) sem standa sig greinilega betur eða verr en hinir. Ein aðgerð **Finna staði** / **Finna hólf** / **Finna innsýn** keyrir alla skynjarana; flipaarnir þrír deila skýrslunni.

#### Staðir (`src/mass/scan.ts`) {#places-srcmassscants}

Leikir hvers korts eru lesnir tvisvar, einn leik í einu; minnið geymir summur á grind með að hámarki 64 reitum á hlið (16 fyrir rúm-tíma skönnunina), aldrei leikina sjálfa.

- **Mælingar.** Tíðni atburðar á sekúndu viðveru - dráp, dauðsföll, högg, skot, yfirtökur, fyrir allar einingar, eftir flokki (þeir 4 með flesta atburði), eftir hæðarbandi - og hlutdeild drápa í drápum og dauðsföllum (öllum, eftir hlið, eftir bandi). Hvaða flokkar og hliðar koma úr hausunum (`planOf`).
- **Væntigildi eftir leik.** Tíðni hvers leiks, dreifð yfir eigin viðveru hans í reit, er væntigildi reitsins (Kulldorff-skönnun aðlöguð að þekjandi breytum og lagskipt eftir leik): nokkrir blóðugir leikir eða einn upptekinn þjónn búa ekki til stað.
- **Dreifing.** Leikir eru ósammála langt umfram Poisson. Afgangar hvers leiks eru lagðir saman í blokkum af 1, 2, 4, 8, 16 reitum; dreifing hverrar blokkastærðar (afgangar í öðru veldi deilt með núlldreifingunni, sameinað, versta 5% blokkanna sleppt) skalar hverja prófun á svæði af þeirri stærð: quasi-líkindahlutfall, Poisson fyrir tíðni, tvíliða fyrir hlutdeild.
- **Svæði.** Hringir frá 0,75 til 18 reitum; sporbaugar í sex hornum, 3 og 6 sinnum lengri en breiðir, 3 til 18 reitir (gangar; ásinn er `place.path` innsýnarinnar); belti sem vaxa reit fyrir reit frá sterkustu staðbundnu Getis-Ord Gi* reitunum á meðan svæðið stækkar (óreglulegar lögun) - vaxin á öðrum helmingi leikjanna og prófuð á hinum, svo að frelsi vaxtarins kostar engan falskan stað; hvert hæðarband gegn öðrum böndum leiksins yfir allt kortið (þyrpingaöruggt); rúmtíma-strokka: hringur á einum eða tveimur fimmtu hluta lengdar leiksins, gegn eigin dreifingu atburða leiksins í stað og tíma (rúmtíma-umröðunarskönnunin).
- **Prófun.** p úr quasi-líkindahlutfallinu; Benjamini-Hochberg yfir hvert svæði sem reynt var á hverju korti (700.000 á þremur kortum er venjulegt) í 5%. Það sem stenst er skorið (svæði sem er að mestu innan sterkara svæðis af sömu mælingu segir það sama), lesið aftur fyrir **stöðugleika** sinn - leikir sem sáu það, leikir sem það hélt í, stefna þess í fimm foldum leikjanna - og prófað enn einu sinni við þá dreifingu sem leikirnir sjálfir sýna (þyrpingaöruggt, leikir sem þyrpingar, aldrei undir Poisson), BH aftur. Rólegir staðir á grunni (2% eða meira af hrygningum, flugtökum og lendingum kortsins) eru sleppt.
- **Áhrif.** Hlutfall tíðni (eða líkinda), dregið saman með reynslu-Bayes (gamma-forgildi passað við 2x2 blokkir korts), með ~95% bili við dreifinguna; Gi* við 1, 2 og 4 reiti og staðbundið Moran í miðjunni.
- **Sjónræn augljósleiki.** Hversu mikið svæðið sést þegar á venjulega hitakortinu af atburðinum (logaritmískur kvarði upp að bjartasta reit, eins og sýnin teiknar hann): andstæða þess við hring í kringum það (tíundi hluti litatöflunnar er erfitt að sjá, tveir fimmtu hlutar skýrt) og bjartur tindur sem ber umframmagnið; hlutfall er aldrei teiknað af hitakortinu, svo hlutdeild telst hálf. Undir 35% er **falinn**. Röðunin: styrkur (áhrif sem mettast við 4 sinnum, rólegir staðir við 0,7) sinnum `1 - 0,7 x augljósleiki` sinnum samkomulag foldanna.

Flipinn **Staðir** listar þá (aðeins faldir sem sjálfgefið; eftir korti, lögun, stefnu), smellur dregur útlínur staða kortsins í 3D sýninni (`placeLines.ts`: efstu línur vélarinnar, smíðaðar einu sinni - magenta fyrir falda, gulbrúnt fyrir venjulega, cyan fyrir rólega, sá sem var valinn fullur; band sem kassi frá gólfi þess upp í loft) og á striga flipans Kort; **Hlaða** flýgur þangað og hleður þeim 60 leikjum sem það hélt í mest, síuðum eftir atburði sínum (og flokki).

#### Hólf (`src/mass/niche.ts`) {#niches-srcmassnichets}

Geislaleit (breidd 24, dýpt 3) yfir þrjár töflur: **líf** (líf spilara: leikur, kort, hamur, flokkur, farartæki, hlið, þrep, ársfjórðungur dagsetninganna, þriðjungur lengdar leikjanna; K/D, sigur, dauði sem líf, dráp á klukkustund, unnið á mínútu), **staðir** (dráp og dauðsföll eftir korti, ham, dagsetningum, geira kortsins 4 x 4, flokki, hlið, bandi) og **fasar** (geiri og fimmti hluti leiksins: K/D, dauðsföll á klukkustund viðveru). Hópur er prófaður gegn heildinni með leikjum sem þyrpingum (samlokudreifing afganga hans eftir leik), áhrif hans eru hlutfall líkinda eða tíðni dregið saman með forgildi upp á 20 niðurstöður; hann þarf 30 niðurstöður í 8 leikjum, betrumbót verður að vera 10% sterkari en foreldri hennar, og hópar þar sem niðurstaðan er engin eða öll (ekki skráð fyrir þá) eru sleppt. Haldið: BH undir 5% yfir alla hópa sem metnir voru, dregið saman hlutfall upp á 1,25 (eða 1/1,25) að minnsta kosti, fjórir af fimm foldum sammála, og engin betrumbót sem endurtekur aðeins foreldri sitt. Flipinn **Hólf** listar þá; smellur sýnir hverja betrumbót með einu skilyrði hópsins (könnuðinn), **Hlaða** hleður leikjum hans. Útbúnaður er ekki í samantektunum enn.

#### Breytingar á meta með hagnýtri þýðingu {#meta-shifts-with-practical-significance}

Á blönduðum dagsetningum taldi tvíliðan á lífum næstum allar breytingar marktækar. `meta` prófar nú þyrpingaöruggt (líf hvers leiks sem þyrping), heldur aðeins notkunarbreytingu sem er að minnsta kosti 2 stig og 25%, K/D-breytingu upp á 1,3 sinnum, að ársfjórðungar dagsetninganna þróist á sama veg (Kendall-tau að minnsta kosti 0,5) og, fyrir farartæki á nokkrum kortum, sömu stefnu á flestum þeirra. Eftir standa aðeins fáar breytingar á prófunarsetti þar sem venjulega prófunin merkti næstum allar.

#### Fyrir líkan {#for-a-model}

`massReportForModel` gefur hverjum stað `region` hans (lögun, falinn, augljósleiki, hæðir, fasi) og hverju hólfi `conditions` þess, auk þess hve mörg svæði og hópar voru prófuð. Þekkingarlinsan getur lesið staði sem drápssvæði og áhlaupsleiðir: tegundir þeirra eru `place.*` og `niche.*`.

#### Athuganir {#checks}

`scan.test.ts` setur inn dreifðu svæði (1,6 sinnum dauðsfallatíðnin yfir hring af 22 reitum, dauft í hverjum reit), gang, hæðarband og þyrpingu sem er aðeins í fasa í 240 tilbúnum ofdreifðum leikjum - allt fundið, það dreifða falið - og keyrir átta núllsett af 60 leikjum: enginn staður. `niche.test.ts` finnur innsettan hóp farartækis x korts x hliðar og ekkert í fimm núlltöflum.
