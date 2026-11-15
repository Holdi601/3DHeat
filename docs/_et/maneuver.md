---
title: "Manöövrid"
parent: "Tähelepanekud"
nav_order: 4
lang: "et"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manöövrid: kuidas grupid liiguvad

**Tähelepanekud → Manöövrid** jälgib, kuidas mõlema poole üksused liiguvad
*grupina*, ja nimetab nende tehtud manöövrid: külgrünnaku, kahesarvelise
haarangu, läbimurde, varitsuse, taganemise, rakettide tõrje ja T-ülesõidu.
Iga manööveri juures on kindluse aste, arvud selle taga, kas see tasus ära,
ja vasted doktriinis ja ajaloos. **Massanalüüs → Manöövrid** loeb neid
tuhandete matside peale kokku: kui tihti iga manööver igal kaardil, režiimis
ja poolel tehakse ja kui tihti see tasub ära.

Kõik arvutatakse sinu brauseris, eraldi töötajas (`src/insights/maneuver`).
Mõne sajast üksusest koosneva matsi puhul kulub 10-500 ms, kahetunnise
õhusõja puhul tuhandete objektidega umbes üks sekund.

## Kasutamine {#using-it}

- Ava **Tähelepanekud**, sakk **Manöövrid**. Esimesel avamisel see loeb ise.
  Pärast filtrite muutmist vajuta **Leia uuesti**.
- **Kindel / Tõenäoline / Võimalik** määrab kindluse, mida näidatakse
  (vaikimisi Tõenäoline).
- **Ajajoon** on igal poolel oma rida ja iga manööver on riba. Allpool olev
  **loend** on sama, ajaliselt järjestatud. Klõps viib replay algusesse,
  lendab kaameraga sinna ja joonistab manööveri 3D-s: iga grupi tee on nool
  (kahe haarangu harud on kaared), grupi piirjoon otsustaval hetkel (vastase
  oma on tema poole värvis) ja vastase rinne valge joonena. **Joonista kõik
  3D-s** lisab matsi teised manöövrid, nõrgalt. Jooned saadetakse graafikakaardile
  üks kord, kui valik muutub, mitte igal kaadril. 480 manööveri joonistamisel
  mängimise ajal on kaadriajad päris GPU-l (WebGL2 ja WebGPU, p99 18,0-18,5 ms,
  max 19,5-20,8 ms) samad kui ilma nendeta.
- Avatud manööver näitab oma tulemust (selle tegevuste üksuste surmad ja kaotused
  selle käigus ja vahetult pärast seda, võrreldes poole enda vahetusega kogu
  matsi jooksul), tõendeid ning teadmusbaasi kirjeid selle kohta: doktriini ja
  ajaloolisi vasteid (Cannae kahesarvelise haarangu jaoks, Sedan 1940 läbimurde
  jaoks, Tsushima T-ülesõidu jaoks, Operation Bolo demonstratsioonirünnaku
  jaoks...).
- Väike tabel lõpus: iga liigi ja poole kohta tehtud ja ärategemised.

![Kahesarvelise haarang sünteetilisel demomatsil: mõlema haru nooled, vastase keha ja tema rinne](../assets/img/en/maneuvers.webp)

## Kuidas grupid leitakse {#how-groups-are-found}

Iga üksus asetatakse ühisele ajateljele (samm 1 s jalgsi, muidu 2 s, väga
suurte failide puhul pikem). Surma ajal hoitakse üksust paigal, et taaskerkimine
ei joonistaks kaardile joont. Igal sammul seotakse ühe poole ja ühe liigi
(lennuk, sõiduk, laev, jalavägi) üksused, kui nad on lähedal: 18 m jalgsi,
170 m sõidukitega, 3 km laevadega ja 5 km lennukitega, ning kui nad liiguvad
ühtemoodi (kiirused on kiirema kiiruse poole piires või mõlemad seisavad). Klaster
säilitab selle grupi ID, kus enamik tema liikmeid oli. Üksus ilma klassita
paigutatakse jalgsi, sõidukisse või õhku kiiruse järgi.

Grupi **kuju** loetakse selle suuna järgi. Kolonn või joon otsustatakse selle
järgi, kui laiali on liikmed piki ja risti. Kiil on siis, kui keskel olev
juhib. Echelon on siis, kui liikmed astuvad ühele küljele tagasi. Kast on siis,
kui nad hoiavad nurki.

Kõike hinnatakse matsi enda mõõtkavas. **Kaasamise ulatus** `R` on kauguse
75. protsentiil tapja ja ohvri vahel (piiratud valdkonna mõistlikkuse
järgi). Manöövri ajad skaleeritakse üksuse liigi järgi (jalavägi ühe kolmandiku
maast).

## Mida see leiab {#what-it-finds}

| Manöövrid | Leitakse, kui |
|---|---|
| Formatsioon | grupp hoiab ühte kuju 30 s jooksul 60% oma liikumise sammudest |
| Frontaalrünnak | grupp läheneb ulatusest väljast kokkupuudeni, ¾ R või rohkem, 35° piires vastase näo suunast |
| Külgrünnak | sama 50-130° nurga alt (tagant üle 130°); kindel ainult siis, kui sellel kohal võitleb sõbralik *fikseeriv jõud* vastasega (tapmised mõlemas suunas) |
| Kahesarveline haarang | ühe poole kaks külgrünnakut samale vastase kehale, vastaskülgedelt, 90 s piires (100° või rohkem eraldi); kindel, kui haarangu harud võitlevad |
| Ümbersaartamine | kompaktne vastase grupp, kellel on ümber vähemalt sama palju teise poole üksusi 1,5 R raadiuses, kahest või enamast grupist, lünkadeta üle 100°, minuti jooksul, lõigatud oma poolest ära; kindel, kui rõngas sulgus ½ R võrra ja võitles taskus |
| Läbimurre | grupp läbib hoitava joone (vastased seisavad 30 s nii tema vasakul kui paremal, tema poole kese nende taga); kindel, kui ta jõuab ½ R kaugusele, jääb 20 s ja võitleb seal; läbimurre on veel R kaugemal |
| Katvusega edasiliikumine | väikeses grupis liigub osa, ülejäänud seisavad, rollid vahetuvad neli korda või rohkem, seisev osa katab tulega |
| Koondumine / hajumine | poole osa tema tihedaima punkti lähedal tõuseb 35%-lt 60%-ni (üksused tulevad 1,5 R või rohkem, siis kokkupuude) - või langeb, kui pool hajub laiali |
| Eksitus | väike üksus kokkupuutes tõmbab kaks või enam vastast mujalt; suurem grupp lööb siis neljal raadiusel kaugusel, kus vastasel on vähem |
| Taganemine / jälitamine | kokkupuutes olev grupp pöörab ära ja avab R kauguse sellest kohast, kus võitles; kindel, kui seal olev vastane oli just tapnud selle grupi ühe liikme ja grupp sai tapjast 2 R kaugusele (jalgsi mitte kunagi, vt allpool); vastased, kes liiguvad samas suunas ja jäävad järele, jälitavad |
| Sügavkaitse | seisvad üksused kahes või enamas vööndis üle vastase telje, R sügavusel, vastane tuleb peale, tuli vööndeist |
| Pöörde nõlv | kolm või enam tappu lühikesel real seisvate üksuste poolt, kelle ohvrid tulid üle harja |
| Varitsus | liikuv grupp kohtab vastaseid, kes seisid 45 s; need tulistavad esimesena ja liikujad kaotavad kaks või poole grupist |
| Ekraan | üks või kaks üksust liiguvad kolme või enama üksuse kehast ette ja kohtavad vastast esimesena |
| Sisemised jooned | ühe poole grupid on lähestikku teise poole gruppide vahel, tema üksused liiguvad nende vahel |
| Tempo | pool vastab kokkupuutele (pööre, kiiruse muutus, esimene tulistamine) 1,5 korda kiiremini, Mann-Whitney p alla 0,05 |
| Kägistamine, sälk, lohistamine, pumpamine | raketi starti sihtmärk pöörab tulistaja 35-70°, 75-105° või üle 140° või lohistab ja pöörab tagasi |
| Õhuhaarang, sein, juht-järgija, jahvataja | paar, mis jaguneb ühe vastase peale; kolm kõrvuti vastase suunas; üksus 5-20 km teise taga; kaks tiirlevad ühe punkti ümber, ühe punkti kaugusel |
| Lahingupatrull | tiirleb jaama ümber kolm minutit |
| Energia / nurkade võitlus | lähivõitluses - suunad 30° erinevad, kumbki hoiab teist ninas järjest, või nende vahel on tapmine - kasutatakse kõrgust ja tõustakse, või lamedalt ja pööratakse kõvasti aeglustades; kindel, kui üks tappis teise |
| Löögipakett, SEAD | segarollidega õhugrupp, osa neist tabab maad; õhutõrje tapmised enne enamikku teisi maapealseid tapmisi |
| Lahinguread, T-ülesõit | kolm laeva kolonnis; kolonn risti vastase kolonni pea ees |

Iga manööver ütleb, millised teadmusbaasi **mustrid** see näitab
(`patterns-maneuver.ts`: formatsioon, frontaalrünnak, kahekordne ümbersaartamine,
ümbersaartamine, läbimurre, tuli ja manööver, eksitus, taganemine, jälitamine,
sügavkaitse, katmine, hajumine, rakettide tõrje, nurkade võitlus, lahingupatrull,
löögipakett, lahinguread, T-ülesõit) ja kirjed, mida tuleb esmalt lugeda. Vanemad
kirjed saavad uued mustrid läbi faili `knowledge/maneuver-tags.ts`. Vaata
[Teadmiste lääts](knowledge.md).

**Tasus ära** võrdleb nende üksuste vahetust selle käigus (ja minut pärast)
nende poole vahetusega kogu matsi jooksul. Taganemine tasub ära, kui pärast pööret
kaotati vähem üksusi kui enne. Rakettide tõrje tasub ära, kui lennuk elab minuti.
Ümbersaartamine tasub ära, kui tasku kaotab poole.

## Üle paljude matside {#over-many-matches}

Iga matsi kokkuvõte (`src/mass/summarize.ts`, vaata [Massanalüüs](mass-analysis.md))
sisaldab väikest `maneuvers` osa: iga liigi ja poole kohta tehtud (vähemalt
Tõenäoline), ära tasunud, mitte ära tasunud, tapmised ja kaotused. **Massanalüüs →
Manöövrid** liidab need kokku filtri alla jäävate matside kohta, kaardi ja
režiimi kaupa või kõigi kohta, ning ärategemise määr on koos Wilsoni
usaldusvahemikuga. Rida avab matsid, milles see tehti. Enne seda osa olemasolu
kirjutatud kokkuvõtetel seda ei ole. Lisamiseks käivita
`node tools/3dheat-summarize.mjs <kaust> --force`.

## Kui kindel see on {#how-sure-it-is}

Sünteetilised matsid, kuhu on sisse pandud manöövrid (`synth.ts`, käivitatakse
`maneuver.test.ts`-iga): kõik 28 sisse pandud liiki leitakse vähemalt Tõenäolisena;
50 teatatud manöövrist on 31 sisse pandud liiki ja ülejäänud 19 on tegelikult
samuti olemas (liikuva grupi formatsioon, läbimurdva kolonni frontaalne
lähenemine); ühtegi pole vale. 30 nullmatsil - juhuslikud kõnnakud eraldi ja
segamini, üksused seisavad juhuslikult, lennukid sirgetel lendudel, pöörlev
rahvamass - ei teatata midagi vähemalt Tõenäolisena.

Päris andmetel (kümneid maalahinguid, mõned pikad õhusõja missioonid, tosin
laskuri matsi): frontaalrünnakud, küljerünnakud, läbimurded ja ümbersaartamised
tankilahingutes, formatsioonid ja lähivõitlused õhus, rakettide tõrjed, CAP-
tiirud ja juht-järgija paarid õhusõja missioonides, frontaalsed tapmised, kolonnid
ning mõned varitsused ja katvuspaarid laskuris. Lävendid on doktriini kujundid
mängu mõõtkavas. Üksikut leidu loe koos tema tõenditega ja määrade tabelit koos
nende usaldusvahemikega.

### Nullmudelite vastu samadel matsidel {#against-null-models-of-the-same-matches}

Detektorit võib petta maa ja rahvamass: tülis on iga grupp kõigi kohta ümber
vaenlasi. Seepärast käivitatakse iga liik ka **nullmudelitel**, mis on tehtud
samadest matsidest ja kus pooled enam ei kohtu nii nagu päriselt: ühe poole ajajoon
pööratakse kolmandiku kuni kahe kolmandiku võrra matsi kestusest (*shift*) või
tema rajad pööratakse ümber kaardi keskpunkti (*rotate*); ja meeskonnasildid
segatakse (*teams*, mis konstruktsiooni järgi jätab alles umbes poole päris
lahingutest). Lahingud loetakse ainult tapmistena, mis on paaris oma surmadega:
tapja 2 R piires ja ohver kohal. Nullmudel seda paarimist rikub. Leitakse matsi
Tõenäoline või kõrgem, päris andmed vs nullmudelid (30 tankilahingut; 12 laskuri
matsi):

| Liik | Tankilahingud: päris / shift / rotate | Laskur: päris / shift / rotate |
|---|---|---|
| Ümbersaartamine | 0 / 0 / 0 (oli 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Läbimurre | 0,03 / 0,02 / 0,05 (oli 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Külgrünnak | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontaalrünnak | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Taganemine | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (seetõttu jalgsi ei ole kunagi kindel) |
| Varitsus | - | 0,17 / 0,04 / 0,04 |
| Energiavõitlus | 1,2 / 0,1 / 0,85 | - |
| Nurkade võitlus | 0,6 / 0,07 / 0,3 | - |

Lähivõitlused õhus lahinguvälja keskme kohal jäävad ellu ka pöörde korral selle
keskme ümber, seega rotate veerg neile vähem kallutab kui maapealsetele liikidele.
Liigid ühe poole piires - formatsioon, lahingupatrull, juht-järgija, löögipakett,
SEAD, katvus, ekraan - ei sõltu teisest poolest ega ole selliselt testitud.
`maneuver.test.ts` kontrollib, et nullmudelid eemaldavad sünteetilistelt matsidelt
sisse pandud küljerünnaku, kahesarvelise haarangu, ümbersaartamise, läbimurde,
varitsuse ja taganemise.

## Piirangud {#limits}

- Grupid vajavad positsioone ajas; pelgal sündmuste failil neid ei ole.
- Suunda ei loeta andmetest: vastase rinne on seal, kus fikseeriv jõud teda rünnab,
  muidu seal, kus ta liigub, muidu seal, kust ründaja tuli.
- Maastikku loetakse üksuste enda kõrgustest (pöörde nõlv); joonenähtavuse
  testi ei ole.
- Väga suured failid on proovitud pikemate sammudega; lühikesed õhumanöövrid neis
  loetakse ikka 2-4 s sammudest.
