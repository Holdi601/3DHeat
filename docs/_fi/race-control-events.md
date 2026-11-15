---
title: "Auton hallinnan tapahtumat"
parent: "Kisa-analyysi"
nav_order: 54
lang: "fi"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: true
---

# Auton hallinnan tapahtumat

Katsoja näkee, miten kukin kierros ajettiin, ja merkitsee kohdat, joissa kuljettaja sai auton luistamaan, pyörähtämään, osumaan johonkin tai menettämään pidon. Tämä on hyödyllistä, koska virhe, joka maksoi aikaa, on nopein korjata.

![Auton hallinta -osio: kuinka usein kukin kierros lukitsi pyörän, pyörähti tai työnsi leveästi, ja virheiden luettelo, yksi auki avattuna](../assets/img/en/race-control-table.webp)

## Selkokielellä {#in-plain-words}

- **Lukkiutuminen**: jarrutat niin kovaa, että pyörä lakkaa pyörimästä ja liukuu. Auto pysähtyy huonommin eikä pysy ohjattavana.
- **Sutiminen**: painat kaasua niin kovaa, että vetävät pyörät pyörivät nopeammin kuin auto liikkuu. Menetät vetoa.
- **Yliohjaus**: auton perä liukuu leveästi. Jos se kääntyy kokonaan ympäri, se on **pyörähdys**.
- **Aliohjaus**: auton keula liukuu leveästi ("työntää"). Ratin kääntäminen enemmän ei auta.
- **Osuma** ja **maahansyöksy**: auto kosketti johonkin. Osuma on kolahdus tai raapaisu, maahansyöksy on kova törmäys.
- **ABS** ja **TC**: auton omat apujärjestelmät, jotka toimivat lukkiutumista ja sutimista vastaan. Ne eivät ole virheitä.

## Auton hallinta -osio (mitä näet) {#the-car-control-section-what-you-see}

Valitulle kierrokselle näkyy kaikki, mitä kierroksilla on. Ilman renkaiden luistoa ja driftikulmaa siinä näkyy silti se, mikä yhä löytyy, eikä mitään (alla).

**Taulukko**: yksi rivi jokaista lajia kohti, jonka jompikumpi kierros näyttää. Rivit ovat Lukkiutuneet pyörät, Sutiminen, Perä karkaa (yliohjaus ja pyörähdykset), Keula työntää, Kolarit, Osumat, ABS toiminnassa, Luistonesto toiminnassa, Käsijarru ja Ilmassa. Kussakin solussa on "määrä · sekunnit" valitulle kierrokselle ja kierrokselle, johon sitä verrataan. Lisäksi *Suurin driftikulma* näkyy, kun driftikulma on olemassa (suurin maalla).

**Luettelo**: sen itsenäiset virheet, jotka maksavat vähintään 0,02 s, kalleimmasta alkaen, enintään 12. Kukin virhe näkyy otsikkonsa ja hintansa kanssa, ja lajinsa siru on mukana. Napsauta yhtä lukeaksesi sen vihjeen, asettaaksesi autot riviin 40 m ennen sitä ja toistaaksesi sen. **Myös mitä molemmat kierrokset tekivät siellä** lisää jokaisen virheen, myös yhteiset (siru "molemmat tekivät sen", hinta "—" alle 0,01 s). Jos virheitä ei ole, teksti on: "X ei menettänyt renkaiden käytöllä aikaa missään, missä Y ei tehnyt samoin."

**Vihje sen alla** kertoo, mihin tunnistus pystyi: "Kunkin pyörän luistosta ja luistokulmasta sekä auton driftikulmasta." Vaihtoehtoina ovat luistosta ja luistokulmasta, luistosta ja driftikulmasta, pelkästä luistosta, tai "Vain auton driftikulmasta - näissä kierroksissa ei ole renkaiden luistotietoa." Vihje kertoo myös, mihin pintaan rajat mitattiin (asfaltti, irtonainen alusta tai sekapinta: yli 80 % irtonaisia näytteitä tarkoittaa irtonaista, alle 20 % asfalttia), mihin kierrokseen tapahtumat suhteutettiin ja miten hinta lasketaan.

Ilman **renkaiden luistoa ja driftikulmaa** (FH Companion -kierrostiedosto ilman telemetriaansa) taulukko ja luettelo näytetään silti. Vihje kertoo, mitä kierroksista silti löytyi: "Näissä kierroksissa ei ole renkaiden luistoa eikä driftikulmaa, joten lukkiutumisia ja sutimista ei voi tunnistaa. Silti löytyvät: aliohjaus, ohjauksesta ajolinjaan nähden; osumat ja kolarit, nopeudesta ja kiihtyvyydestä." Liu'ut kiertymisnopeudesta nimetään myös, jos kierroksissa on se. Työnnöt näytetään vain, jos kierroksissa on ohjaus. Luistoa ja driftikulmaa koskeva lause jätetään pois. Toinen vihje sanoo: "Forza Horizonissa valitse myös kunkin FH Companion -kierroksen vieressä oleva `.tele.gz`-tiedosto: se on täysi telemetria, jokaisen pyörän luisto 64 kertaa sekunnissa."

Kierroksen **kokonaishinta** (käytetään yhteenvedoissa) lasketaan kerran, kalleimman mukaan. Päällekkäiset virheet, kuten lukkiutuminen ja sen aloittama liu'u 40 metrin sisällä, lasketaan siis vain kerran.

## Miten se tunnistetaan {#how-it-is-detected}

Loppu tästä sivusta on sääntökirja: jokainen laji ja jokainen raja.

Koodi: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Perustelut ja kirjallisuus ovat sivulla [menetelmä](race-analytics.md).

## Lajit {#the-kinds}

| Laji | Taulukon rivi | Virhe? | Lyhin, joka lasketaan |
|---|---|---|---|
| `lock` | Lukkiutuneet pyörät | kyllä | 0,1 s |
| `wheelspin` | Sutiminen | kyllä | 0,15 s |
| `oversteer` | Perä karkaa | kyllä | 0,2 s |
| `spin` | (lasketaan Perä karkaa -rivillä) | kyllä | 0,1 s |
| `understeer` | Keula työntää | kyllä | 0,25 s |
| `crash` | Kolarit | kyllä | - |
| `hit` | Osumat | kyllä | - |
| `abs` | ABS toiminnassa | ei | 0,2 s |
| `tc` | Luistonesto toiminnassa | ei | 0,2 s |
| `handbrake` | Käsijarru | ei | 0,1 s |
| `airborne` | Ilmassa | ei | 0,15 s |

Lyhyet jaksot ovat kohinaa, kuten reunakivi, töyssy tai yksi näyte. Ruudukon pisteiden (2 m välein) jaksot, jotka läpäisevät testin, yhdistetään yli enintään 2 pisteen aukot. Vain **virheet** voivat olla kuljettajan virheitä ja niillä on hinta. Muut ovat sitä, mitä auto ja kuljettaja tekivät.

## Mitä jokainen testi tarvitsee {#what-every-test-needs}

### Johdetut kanavat {#derived-channels}

Ennen arviointia kullekin kierrokselle lasketaan se, mitä sen peli ei lähetä, yleisillä nimillä. Pelin oma arvo voittaa aina.

| Kanava | Mistä |
|---|---|
| `bodySlip` (driftikulma) | auton omassa koordinaatistossa oleva nopeus, `atan2(latVel, abs(longVel))`, jos peli sen lähettää (0 alle 3 m/s). Muuten keulasuunta (pelin yaw, sovitettuna ajosuuntaan merkin ja siirtymän mukaan näytteistä, jotka kulkevat yli 10 m/s, ja luotettuna vain, kun ympyrävarianssi on alle 0,05) verrattuna ajosuuntaan (sijainnit vähintään 2 m:n päässä toisistaan), yli 3 m/s nopeuksilla |
| `yawRate` | `yaw`:n muutos ajassa, kun keulasuunta on mutta nopeutta ei |
| `airborne` | jokaisen pyörän maakosketus pois (≤ 0,5). Muuten jokaisen pyörän kuorma alle 5 % mediaanistaan. Muuten jokaisen jousituksen liike enintään 0,02 (täysin venynyt). Yksittäinen harhanäyte ei ole lento |
| `slipRatio.<W>` | `(pyörän pintanopeus - auton nopeus) / auton nopeus` yli 3 m/s, kun peli lähettää pyörien pintanopeudet. Tai pyörän pyörimisestä × kierroksella mitattu vierintäsäde: mediaani `nopeus / pyöriminen` silloin, kun rullataan suoraan (nopeus > 10 m/s, kaasu < 0,3, jarru < 0,05, abs(pituuskiihtyvyys) < 3 m/s², ei ilmassa; kaikki näytteet yli 10 m/s, kun niitä on alle 20). Hyväksytään 0,1-1 m välillä. Merkitty `physical` |
| `loose` | Forzan pinnan tärinä vähintään 2 pyörässä (> 0,001) vähintään 0,33 s ajan (reunakivi on lyhyempi). Aukot alle 1 s yhdistetään |

### Ilmassa ja vakaana {#on-the-ground-and-settled}

Mitään ei arvioida ilmassa tai **0,3 s ajan laskeutumisen jälkeen**. Jousitus painuu pohjaan ja kiihtyvyydet kasvavat, mikä ei ole pitoa, jarrutusta eikä vetoa. Näytteen on myös oltava **liikkeessä**: nopeampi kuin 5 m/s.

### Pinta {#the-ground}

Kunkin näytteen pinta on **irtonainen**, kun kierroksen `loose`-kanava niin sanoo (Forzan pinnan tärinä, Trackmanian pyörämateriaalit). Muuten pinta on kierroksen pinta (katso [kilpailulaji ja pinta](race-loading-laps.md#discipline-and-surface)): asfaltti tai irtonainen kaikelle muulle. Käyrät, driftitavat ja rajat pidetään erillään asfaltille ja irtonaiselle pinnalle.

### Liukuma pidon kerrannaisena {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Pelit skaalaavat liukumaa eri tavoin. `meta.slip` kertoo, miten, ja jokainen liukuma jaetaan skaalalla, jotta noin 1 on renkaan nimellinen huippu:

| `meta.slip` | Merkitys | Jaetaan |
|---|---|---|
| `peak` | pelin normalisoima: yli 1:n pito menetetään (Forza Data Out) | 1 |
| `scaled` | fyysinen liukuma jaettuna asfaltin huipulla (Kunos-tallennin) | pinnan nimellinen huippu jaettuna asfaltin huipulla |
| `index` | 0..1 liukumismitta (Trackmanian SlipCoef) | 0,5 |
| `physical` (tai tuntematon) | liukusuhde murtolukuna, sivuliukukulma radiaaneina | pinnan nimellinen huippu |

Nimelliset huiput, kun parempaa ei tiedetä:

| Pinta | Liukusuhde | Sivuliukukulma |
|---|---|---|
| asfaltti | 0,12 | 8° |
| sekapinta | 0,18 | 12° |
| irtonainen (sora) | 0,25 | 15° |
| lumi | 0,25 | 15° |
| jää | 0,10 | 6° |

### Missä pito loppuu: kunkin auton rengaskäyrät {#where-grip-ends-each-cars-tyre-curves}

Missä rengas lakkaa antamasta lisää, mitataan **autokohtaisesti** kaikista sen kuormitetuista kierroksista (`measureTyres`). Asfaltille ja irtonaiselle pinnalle mitataan erikseen:

| Käyrä | Näytteet (nopeus > 10 m/s, vakaa, kiihtyvyydet alle 45 m/s²) | Liukuma (x) | Voima (y) |
|---|---|---|---|
| jarrutus | jarru > 0,3, käsijarru ≤ 0,2, ajetaan suoraan (sivuttainen alle 30 % kovimmasta) | abs(neljän pyörän keskimääräinen liukusuhde) | hidastuvuus |
| veto | kaasu > 0,8, jarru ≤ 0,05, suora, auton täyskaasuveto tällä nopeudella > 0,5 m/s² | suurimman vetävän pyörän liukusuhde | kiihtyvyys osuutena tuosta vedosta |
| etu | sivuttainen yli 30 % kovimmasta, auton pito tällä nopeudella > 1 m/s² | suurempi etusivuliukukulma | sivuttaiskiihtyvyys osuutena tuosta pidosta |
| taka | sama | suurempi takasivuliukukulma | sama |

"Kovin" on kierroksen abs(sivuttaiskiihtyvyyden) 99. persentiili kyseisellä pinnalla. Jos pinnalla on alle 50 näytettä, käytetään koko pintaa. Vetävät pyörät päättää vetotapa: FWD edessä, RWD takana, AWD kaikki. Tuntematon: kaikki.

Kun näytteitä on vähintään **150**, liukuma leikataan 6-14 yhtä suureen lokeroon (yksi per 40 näytettä). Kunkin lokeron voima on sen yläkvartiili eli se, mitä rengas antoi, kun kuljettaja pyysi. Voima tasoitetaan naapurilokeroilla. **Paras** on lokero, jossa on eniten voimaa. **Raja** on ensimmäinen lokero huipun jälkeen, jossa voima on laskenut **8 %**. Käyrällä, joka ei koskaan laske datassa, ei ole rajaa (ääretön). Huipun ylittäminen ei siinä pelissä maksa mitään, eikä pelkkä liukuma merkitse siellä mitään. Forza Horizonin kääntö- ja vetokäyrät ovat sellaisia. Jos yhdellä pinnalla on liian vähän näytteitä, käytetään toisen pinnan näytteitä. Jos niitä on liian vähän kaikkiaan, käytetään **nimellistä** rajaa: 1,5 kertaa nimellinen huippu.

Jokaiselle autolle lasketaan myös:

- sen **driftitapa**: driftikulman yläkvartiili siellä, missä se kääntyy vähintään 60 %:lla kovimmasta (vaatii 100 näytettä);
- sen **ohjaus per kaarevuus** (`steerGain`) per 5 m/s nopeusalue: mediaani abs(ohjaus) / radan kaarevuus, kun auto kääntyy tiukasti mutta hyvin pidon sisällä (30-60 % kovimmasta, kaarevuus tiukempi kuin 400 m:n säde, ohjaus yli 0,02; 25 näytettä per alue). Radan kaarevuus on yaw-nopeus jaettuna nopeudella, jos peli lähettää yaw-nopeuden. Muuten se lasketaan sijainneista ±5 m:n matkalta.

## Tunnistus lajeittain {#detection-kind-by-kind}

| Laji | Testi (liikkuvissa, vakaissa näytteissä) | `peak` ja `limit` |
|---|---|---|
| **lock** | jarru > 0,05, käsijarru enintään 0,2, ja minkä tahansa pyörän liukusuhde alle negatiivisen jarrurajan | negatiivisin liukuma (nimellisen huipun kerrannaisina); raja negatiivisena |
| **wheelspin** | kaasu > 0,2 (tai ei kaasukanavaa), ja vetävän pyörän liukusuhde yli vetorajan | suurin vetävä liukuma; raja |
| **oversteer** (driftikulma) | driftikulma yli suuremman arvon: pinnan lattia tai 1,5 × auton driftitapa sillä kohdalla | suurin driftikulma, radiaaneina |
| **oversteer** (sivuliukukulmat, ei driftikulmaa) | suurempi takasivuliukukulma yli takarajan ja yli 0,25 suuremman etusivuliukukulman | takasivuliukukulma (huipun kerrannaisina) |
| **oversteer** (ei driftikulmaa, mutta kiertymisnopeus ja sivuttaiskiihtyvyys) | "asennenopeus" eli abs(yaw-nopeus) miinus abs(sivuttaiskiihtyvyys) / nopeus, yli 8 m/s, yli 0,2 rad/s, ohjauksen ollessa kääntöä vastaan | rad/s; raja 0,2 |
| **spin** | yliohjausjakso, jonka driftikulma huippuaa yli **60°**:n | kuten oversteer |
| **understeer** (sivuliukukulmat) | ei liu'u, suurempi etusivuliukukulma yli eturajan ja yli 0,3 suuremman takasivuliukukulman | etusivuliukukulma; raja |
| **understeer** (ei sivuliukukulmia) | nopeampi kuin 12 m/s, ei liu'u, ei vastaohjaa, sivuttaiskiihtyvyys yli puolet kierroksen kovimmasta (99. persentiili), rata tiukempi kuin 300 m:n säde, ja ohjaus yli **1,6-kertainen** siihen, mitä auton oma ohjaus per kaarevuus sanoo radan vaatineen | tarvittavan ohjauksen kerrannainen; raja 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` yli 0,5 | - |
| **handbrake** | `handbrake` yli 0,2 | - |
| **airborne** | `airborne` yli 0,5 | - |
| **hit**, **crash** | katso [Osumat ja kolarit](#hits-and-crashes) | iskun nopeus |

Driftikulman lattiat pinnoittain: asfaltti **7°**, sekapinta **10°**, irtonainen ja lumi **15°**, jää **10°**. Auto, joka liukuu enemmän tavallisesti, kuten arcade-rengasmalli tai sorarengaserikoisuus, saa oman, korkeamman rajansa omilta kierroksiltaan (1,5 × sen tapa).

**Mihin suuntaan auto kääntyy** (kääntöä vastaan -tarkistusta varten): radan suunnanmuutos ±6 m:n matkalla (vähintään 2 ruudukkopistettä). Tiukempi kuin 600 m:n säde lasketaan kääntymiseksi. Oikea tai vasen riippuu siitä, onko maailma peilattu. Ohjaus on **kääntöä vastaan**, kun abs(ohjaus) > 0,05 ja sen merkki on kääntymisen vastainen. Tämä tarkoittaa liu'un **kiinni ottamista** vastakkaisella ratilla.

**Polkimet alussa** (`pedal`): *jarrutus*, kun jarru on yli 0,1. *Kaasu*, kun kaasu on yli 0,3. *Nostettu*, kun kaasu oli yli 0,5 kahdeksan ruudukkopisteen (16 m) sisällä ennen. Muuten *rullataan* (tai ilman kaasukanavaa).

## Verrattuna toiseen kierrokseen {#laid-against-the-other-lap}

Jokainen tapahtuma arvioidaan kierrosta vastaan, johon valittua kierrosta verrataan kyseisellä osuudella. Vertailukierros on oman luokkansa paras. Itse kierrokselle vertailukierros on se, joka oli luokastaan nopein osuuden läpi.

1. **Kuinka pitkälle toinen kierros meni** samoilla metreillä, ±8 m: toisen kierroksen omat samaa sukua olevat tapahtumat (pyörähdys lasketaan yliohjaukseksi, kolari osumaksi). Ne mitataan samoissa yksiköissä ilman kynnysarvoja ja toisen auton renkaiden käyriä käyttäen.
2. **Yhteinen**, kun toinen kierros meni **80 %** yhtä pitkälle tai pidemmälle. Silloin kyse on mutkan ajotavasta, ei virheestä. Muut kuin virhelajit ovat aina "yhteisiä".
3. **Hinta** virheelle, joka ei ole yhteinen: aika, jonka tämä kierros menetti toiseen verrattuna. Mittaus alkaa 5 m ennen tapahtumaa ja päättyy 40 m sen jälkeen. Osumalle tai kolarille mittaus jatkuu, kunnes auto saa nopeutensa takaisin. Matka sen saavuttamiseen lasketaan omalla vedolla, 40-400 m. Ilman mitattua vetoa käytetään 5 m/s². Hinta ei koskaan ole negatiivinen.
4. **Annettu nopeus rajalle**: lukkiutumisessa auton näyttämä hidastuvuus kyseisellä nopeudella miinus se, mitä auto teki, summattuna tapahtuman yli. Sutimisessa täysikaasuveto miinus se, mitä auto teki. Iskussa iskun nopeus. Se mainitaan, kun se on yli 0,5 m/s (1,8 km/h).

Virhe, joka ei ole yhteinen ja maksaa vähintään **0,02 s**, luetellaan. [Kilpailun tilastot](race-course-statistics.md) laskevat vain vähintään **0,03 s** virheet, jotta useilla kierroksilla laskettu virhe on selvä. Virhe voi olla mutkan aikahäviön syy (katso [Mutka mutkalta -analyysi](race-corner-analysis.md#car-control-faults-and-impacts)).

## Osumat ja kolarit {#hits-and-crashes}

`impacts.ts` lukee osumat kierroksen **omista näytteistä** ennen uudelleennäytteistystä, koska osuma päättyy sadasosissa sekuntia. Renkaat eivät voi tuottaa osuman voimia, joten osumaa mitataan kierroksen oman auton perusteella:

- **Sen pito `G`**: vaakasuuntaisen kiihtyvyyden `√(lat² + long²)` 99. persentiili koko kierroksella, pinnalla ja nopeammin kuin 5 m/s. Ilman kiihtyvyyskanavia tai alle 3 m/s² käytetään 15 m/s²: tavallisen tieauton pito.
- **Kynnys**: `max(1,8 G, G + 18, 30)` m/s².
- **Iskenyt näyte**: vaakasuuntainen kiihtyvyys on yli kynnyksen *ja* hyppää yli puolet `G`:stä edellisestä näytteestä. **Tai** nopeus laskee 0,1 s:n sisällä enemmän kuin kynnys veisi 0,1 s:ssä plus 1,5 m/s. Vain pinnalla ja vakaana, ja vain kun auto kulki nopeammin kuin 5 m/s.
- Iskeneet näytteet 0,4 s:n sisällä ovat yksi isku.
- **Ennen ja jälkeen**: suurin nopeus 0,15 s ennen. Pienin nopeus 0,3 s:iin viimeisen iskeneen näytteen jälkeen.
- **Ei isku**: nopeuden lasku ilman voimaa. Suurin vaakasuuntainen kiihtyvyys 0,1 s:n sisällä on alle suuremman arvon `G` ja 25 m/s². Tällöin peli kelaa tai nollaa auton.
- **Kolari**, kun iskussa menetettiin **30 km/h** tai enemmän tai auton nopeus putosi alle puoleen. Muuten **osuma**, eli kolahdus tai raapaisu seinää pitkin.
- **Suunta**: pituuskiihtyvyys on suurempi kuin sivuttainen ja negatiivinen: *suoraan päin*. Positiivinen: *takaa*. Sivuttainen on suurempi: *auton kylkeen*. Ilman kiihtyvyyksiä se on aina suoraan päin.

Mitä auto kykenee, mitataan ilman kaikkia iskuja. Mittausjakso on 0,1 s ennen iskua ja 1 s sen jälkeen (`struckMask`).

## Tekstit {#the-texts}

Jokainen tapahtuma kerrotaan nimeämällä molemmat kierrokset. Siinä kerrotaan, missä se oli (metreinä viitekierroksesta), millä nopeudella se alkoi ja kuinka paljon raja ylittyi toista kierrosta vastaan. Lisäksi siinä on vihje. Vihje seuraa lajista ja siitä, mitä mitattiin:

| Tapahtuma | Vihje |
|---|---|
| lukkiutuminen, vain edessä | lukittunut etupyörä ei voi ohjata: vähemmän painetta alueen alussa, päästä se irti mutkaan |
| lukkiutuminen, vain takana | lukittunut takapyörä antaa auton kiertyä: jarruta enemmän suoraan, hellitä kääntyessä. Siirrä jakoa eteen, jos tämä toistuu |
| lukkiutuminen, irtonainen alusta | lukittunut pyörä aurautuu: purista juuri ennen lukkiutumista |
| lukkiutuminen, muuten | liian paljon polkimea pitoon nähden: purista progressiivisemmin |
| sutiminen | syötä kaasu sisään, kun ohjaus purkautuu. Lyhennä vaihtoja, kun veto rajoittaa. Irtonaisella alustalla korkeampi vaihde pehmentää vääntöä |
| pyörähdys tai yliohjaus | polkimen mukaan: jarrutuksessa (liian kova jarrutus kääntyessä tai liian aikainen alavaihde), nostettuna (nostoyliohjaus: pidä tasainen kaasu), kaasulla (liikaa, kun vielä käännetään), ei kumpikaan (käännetty liian nopeasti sisään). "kiinni vastakkaisella ratilla", kun vastaohjattiin. Irtonaisella alustalla tai rallissa "jokin kulma on nopea tapa kiertää, toisen ajon kulma riitti" |
| aliohjaus | enemmän rattia ei auta, kun keula on jo mennyt. Saavu hitaammin, jätä vähän jarrua kuormittamaan etuakselia ja purkaa. Irtonaisella alustalla käännä auto nostolla tai vasemman jalan räpäytyksellä |
| osuma tai kolari | auton kylkeen: metrin marginaali maksaa vähemmän kuin raapaisu. Takaa: toinen auto tai liukuminen taaksepäin. Kolari suoraan päin: jarruta aiemmin. Kolahdus edessä: osui johonkin. "X osui siellä myös.", kun se on yhteinen |

Trackmaniassa liu'ussa sanotaan lisäksi: alle noin **400 km/h** (**300** irtonaisella alustalla: hiekka, nurmi, muovi) liu'un antaa vähemmän vetoa kuin pitäminen. Yli sen oikean kulman speedslide voittaa aikaa. Tämä liu'u maksoi aikaa, joten sen kulma oli väärä.

## Mitä kukin lähde sallii {#what-each-source-allows}

| Kierrokset kantavat | Lukot ja sutiminen | Yliohjaus ja pyörähdys | Aliohjaus |
|---|---|---|---|
| per-pyörä liukusuhde ja sivuliukukulma, auton nopeusvektori (Forza Data Out, AC-pelit) | luistosta | driftikulmasta tai takasivuliukukulmasta | luistokulmista |
| pyörien nopeudet, maailman nopeusvektori (rallipelit, BeamNG) | johdetusta luistosta | johdetusta driftikulmasta | ohjauksesta per kaarevuus |
| yaw ja yaw-nopeus, ei luistoa (iRacing) | - | driftikulmasta (sovitettu yaw suhteessa ajosuuntaan). Asennenopeudesta vastaohjauksella vain, kun yaw ei ole luotettava | ohjauksesta per kaarevuus |
| pelkkä keulasuunta | - | keulasuunnasta verrattuna ajosuuntaan | ohjauksesta per kaarevuus |
| FH Companion -kierrostiedosto yksin (ei yaw:ta, ei luistoa) | - | - | ohjauksesta per kaarevuus (siinä on ohjaus ja kiihtyvyydet) |

Osumat ja kolarit tarvitsevat vain nopeuden, parempi kiihtyvyyksien kanssa. Siksi jokaisella lähteellä ne on. **Auton hallinta** -osio näyttää, mitä kukin lähde sallii. FH Companion -kierrostiedostolla yksin näkyvät sen työnnöt ohjauksesta ja sen osumat. Lisäksi se vihjaa lataamaan `.tele.gz`-tiedoston loput tiedot varten.
