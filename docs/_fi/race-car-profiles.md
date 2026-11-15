---
title: "Autoprofiilit ja vertailu"
parent: "Kisa-analyysi"
nav_order: 56
lang: "fi"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Autoprofiilit ja vertailu

Auto voi jarruttaa, kääntyä ja kiihtyä vain tietyn verran. Katseluohjelma mittaa, kuinka paljon, omista kierroksistasi, joten se ei koskaan käske sinua tekemään jotain, mihin autosi ei pysty. Tämä selittää myös, kuinka suuri osa menetetystä sekunnista oli auton eikä sinun syytäsi.

![Autojen vertailu: kaksi autoa vierekkäin pidon, jarrutuksen ja vedon kanssa](../assets/img/en/race-cars-compared.webp)

Analyysi kertoo kierrokselle vain, että sen pitää jarruttaa kovemmin, kantaa enemmän nopeutta tai kiihtyä aiemmin siellä, missä sen auto on osoittanut pystyvänsä siihen. Se vähentää menetyksestä sen, minkä autot itse selittävät. Siksi kunkin auton rajat (sen *verhokäyrä*, alla) ja luonne (sen *profiili*) mitataan jokaisesta sen ladatusta kierroksesta. Tällä sivulla käsitellään verhokäyrää, profiilia, **Autojen vertailu** -osiota ja sitä, mitä autot päättävät kussakin mutkassa.

**Yksi auto** = kierrokset, joilla on sama autonumero (tai nimi, jos numeroa ei ole) ja sama suorituskykyindeksi. Eri säätö on eri auto.

## Verhokäyrä: mitä auto pystyy tekemään kussakin nopeudessa {#the-envelope-what-the-car-can-do-at-each-speed}

Kullekin autolle kaikista sen ladatuista kierroksista, **5 m/s nopeuslokeroissa** (24 lokeroa, enintään 120 m/s). Ilmassa olevat näytteet, laskeutumisen jälkeiset 0,3 s ja jokaisesta osumasta 0,1 s ennen siihen 1 s jälkeen jätetään pois. Kiihtyvyydet 80 m/s² tai enemmän jätetään huomiotta (enemmän kuin mikään auto, jossa on alaspainetta, pitää).

| Verhokäyrä | Näytteet | Arvo lokeroa kohti | Tarvitsee |
|---|---|---|---|
| **sivuttaispito** | sivuttaiskiihtyvyys, **pidettynä puoli sekuntia** (sen itseisarvon keskiarvo keskitetyssä 0,5 s:n ikkunassa), vain siellä, missä auto kääntyi: vähintään kolmasosa kaikkien sen 99. persentiilistä | 95. persentiili | 6 näytettä |
| **jarrutus** | jarru > 0,3; pituuskiihtyvyys mediaanina jokaisesta näytteestä ja sen kahdesta naapurista | hidastuvuuden 95. persentiili | 4 näytettä |
| **täyskaasuveto** | kaasu > 0,95, jarru alle 0,05; sama kolmen mediaani | 90. persentiili | 4 näytettä |

Miksi puoli sekuntia pidettynä: reunakivi, liu'un takaiskun napsahdus tai kiinni otettu auto nostavat sivuttaiskiihtyvyyttä hetkeksi, ja auto, joka tekee niin usein, näytti pitävämmältä kuin on. Miksi kolmen mediaani: viiden metrin välein yksi näyte on pitkä matka, ja yksittäinen piikki on reunakivi, töyssy tai seinä.

Verhokäyrän luku nopeudessa interpoloi lokeroiden keskipisteiden välillä. Tyhjässä lokerossa se ottaa lähimmän lokeron, jossa on dataa.

**Kahdenlaisella pinnalla.** Kun auton kierroksista vähintään viidesosa näytteistä on ajettu sekä asfaltilla että irtonaisella pinnalla, kummallekin säilytetään oma verhokäyrä, ja kukin mutka arvioidaan sillä pinnalla, joka oli auton alla sen hitaimmassa kohdassa.

**Risteyskohta.** Nopeus, josta veto pienenee muotoon `1/v` (tehorajoitettu) sen sijaan, että se pysyisi tasaisena (pitorajoitettu): ensimmäinen lokero, jonka `a·v` on 15 %:n sisällä nähdystä korkeimmasta `a·v`:stä.

## Profiili: millainen auto on {#the-profile-what-kind-of-car-it-is}

`profile` samoista kierroksista (näytteet maalla, ei osuneita, nopeammin kuin 8 m/s):

| Mitta | Miten |
|---|---|
| **pito** (m/s²) | puoli sekuntia pidetyn sivuttaiskiihtyvyyden 95. persentiili |
| **veto** 50 km/h:iin, 50-120, 120-200, yli 200 (m/s²) | verhokäyrän täyskaasuvedon keskiarvo 3-14, 14-33, 33-56 ja 56-90 m/s:ssä, nopeuksissa, joihin auto pääsi (enintään sen nopein + 2 m/s), vähintään kolmesta 1 m/s:n askeleesta; sekä suurin nähty veto ja missä |
| **jarrutus** (m/s²) | verhokäyrän jarrutus keskiarvoistettuna 60-160 km/h (16,7-44,4 m/s), alue, jonka vertailu nimeää |
| **nopein** | suurin nopeus, jonka se saavutti |
| **huipussa** kohdassa | missä se lakkasi kiihtymästä täyskaasulla suoralla (alla) |
| **vielä vetää nopeimmillaan** | verhokäyrän veto sen nopeimmassa nopeudessa: kuinka paljon sillä vielä oli matkaa |
| **takapää kiinni, kierrosta kohti** | kertoja kierrosta, jolloin se liukui ja se piti ottaa kiinni (alla) |
| **osuus kaasulla** | näistä osuus, joka alkoi kaasulla > 0,5 eikä jarrulla |
| **päästää irti kohdassa** | pidetyn sivuttaiskiihtyvyyden mediaani 0,15 s ennen jokaisen liu'un alkua, osuutena pidosta |
| **yli 10° driftiä kovassa kaarteessa** | näytteistä, joissa auto kaartaa vähintään 60 % pidostaan, liukuvien osuus (10° asfaltilla, 20° irtonaisella); vaatii 30 näytettä |
| **driftin mediaani** | samoista näytteistä |
| **tasapaino** | etu miinus takasivuliukukulma (nimellisen huipun kerrannaisina) siellä, missä kaarretaan kovaa eikä liuku, vähintään 30 näytteen keskiarvo: + työntää leveästi |
| **pinta** | yli 80 % irtonaisia näytteitä: irtonainen; alle 20 %: asfaltti; muuten sekapinta |

**Huipussa.** Näyte lasketaan, kun sekunti sen ympärillä (±0,5 s, vähintään 0,9 s dataa) oli kaikki täyskaasulla (> 0,95, ei jarrua), maalla, ajettuna **suoraan** (|sivuttainen| alle suuremman arvon 4 m/s² tai neljäsosa sen pidosta), kiihtyy alle **0,35 m/s²**, nopeammin kuin 25 m/s ja 90 %:n sisällä kierroksen nopeimmasta. Täyskaasu ylämäkeen tai pitkän mutkan läpi pysäyttää kiihtymisen myös, selvästi auton huippunopeuden alle. Kun kaikilla kierroksilla on vähintään **yksi sekunti** tällaista tasannetta, näiden nopeuksien mediaani on kohta, jossa se huipentuu. Muuten huippunopeutta ei ole: missä mikään suora ei ollut tarpeeksi pitkä, *vielä vetää nopeimmillaan* kertoo, kuinka kaukana se oli. Kierrosten näyttämän ylittävää arvausta ei tehdä: vaihteisto ja rajoitin lopettavat auton vedon paljon ennen kuin ilmanvastus.

**Takapään menetys.** Lasketaan siellä, missä kuljettajan piti ottaa se kiinni: kaarrettaessa vähintään 60 %:lla pidosta, liukuen (drift yli 10° asfaltilla, 20° irtonaisella), ja ohjaus (yli 0,06) käännettynä **kaarretta vastaan**. Se, mikä ohjauksen merkki vastaa mitä kaarrevoiman merkkiä, mitataan kierros kerrallaan (näytteet, jotka kääntyvät ilman liukumista). Liuku lasketaan kerran, kunnes auto lakkaa liukumasta. Auto, jota ajetaan hieman sivuttain tarkoituksella, ei menetä mitään. Auto, joka tarvitsee vastaohjauksen, menettää. Laskenta on sama jokaiselle autolle, joten kaksi autoa voidaan verrata. Vaatii ohjauksen ja driftikulman.

## Autojen vertailu {#cars-compared}

Sivupalkin osio on **Auto**, kun on yksi auto, ja **Autojen vertailu**, kun niitä on useita.

**Taulukko**: sarake per auto, rivi per mitta, johon millään autolla on arvo: Pito; Veto 50 km/h:iin, 50-120, 120-200, yli 200; Jarrutus; Nopein; Huipussa kohdassa ("vielä vetää", jos se ei koskaan huipentunut); Vielä vetää nopeimmillaan; Takapää kiinni, kierrosta kohti; Yli 10° driftiä kovassa kaarteessa. Kun autot eroavat yli 3 %, parempi arvo merkitään (pidolle, vedolle, jarrutukselle ja nopeuksille korkeampi; takaliukuille matalampi).

**Yksi auto yksin**: lauseet siitä, mitä kierrokset sen näyttävät olevan: sen pito (m/s² ja g), veto kullakin alueella, missä se lakkasi kiihtymästä pitkillä suorilla (tai ettei se koskaan huipentunut, ja mitä se vielä veti nopeimmillaan), ja kuinka usein takapää tarvitsi kiinni ottamista ("melkein ei koskaan" alle kerran kierroksessa, "enimmäkseen kaasulla", kun 60 % tai enemmän alkoi siitä).

**Kaksi autoa**: jokaiselle parille lause kummastakin siitä, mikä auto on toista vastaan ("X kiihtyy paremmin, mutta ei käänny yhtä kovaa, tarvitsee pidempään pysähtyäkseen ja menettää takapään helpommin"), taulukko, jokainen selvä ero suurimmasta alkaen, ja sitten **Kunkin auton ajaminen**. Kun pareja on yli **3**, näytetään yksi pari: valitun kierroksen auto vs. auto, joka valitaan pudotusvalikosta (oletuksena sen luokan parhaan kierroksen auto, muuten vertailukierroksen, muuten ensimmäinen muu).

Ero sanotaan vain, kun kierrokset näyttävät sen selvästi:

| Ero | Sanotaan, kun | Lause |
|---|---|---|
| pito | **4 %** | "X pitää N % enemmän pitoa mutkissa … se on M % enemmän nopeutta jokaisen mutkan keskellä" (nopeus = pitosuhteen neliöjuuri) |
| veto | **5 %**, ensimmäisellä alueella, jonka molemmat autot ovat saaneet, 120-200, 50-120, yli 200 km/h | "X kiihtyy N % kovemmin 120:stä 200 km/h:iin"; lähdöstäkin, tai "vaikka Y lähtee kovemmin", kun lähtö eroaa 8 %:lla |
| huippunopeus | **4 km/h** | "X huipentuu korkeammalle: se lakkasi kiihtymästä kohdassa …" |
| huippunopeus, vain yksi | yksi auto huipentui, toinen ei | "Y loppui vedosta kohdassa …; X kiihtyi vielä, kun se jarrutti" |
| huippunopeus, kumpikaan | kumpikaan ei huipentunut | mitä kumpikin vielä kiihtyi nopeimmillaan |
| jarrutus | **5 %** | "X pysähtyy N % kovemmin … Y:n täytyy jarruttaa aiemmin" |
| takapään menetys | vähintään kerran kierroksessa enemmän **ja** puolitoista kertaa useammin | "X menettää takapään helpommin: se liukui tarpeeksi, että se tarvitsi vastaohjauksen N kertaa kierroksessa, kun M …" - enimmäkseen kaasulla (60 % tai enemmän) tai enimmäkseen kääntyessä sisään ja nostettuna (30 % tai vähemmän), noin P %:sta sen pidosta; irtonaisella pinnalla "osa siitä on sitä, miten autoa käännetään; kiinni ottaminen ei ole" |
| sivuttain | **12 prosenttiyksikköä** kovasta kaarteesta driftikynnyksen yli | "X ajaa enemmän sivuttain rajalla" |
| etutasapaino | **0,3** nimellisestä huipusta | "X työntää enemmän edestä … Se haluaa hidastua ja kääntyä ennen kärkeä" |

Yhteenvedon piirteet: *pitää enemmän pitoa* / *ei käänny yhtä kovaa*, *kiihtyy paremmin* / *vetää vähemmän*, *huipentuu korkeammalle* / *huipentuu matalammalle*, *vielä vetää suoran lopussa* / *loppuu vedosta*, *jarruttaa kovemmin* / *tarvitsee pidempään pysähtyäkseen*, *on vakaampi* / *menettää takapään helpommin* (*on paljon liukkaampi …*, kun se on kaksi kertaa niin usein plus yksi; *tarvitsee kiinni ottamista useammin* irtonaisella pinnalla), *työntää edestä*. "Vähän erottavaa Y:stä näillä kierroksilla", kun eroa ei ole.

**Kunkin auton ajaminen:**

- toinen auto pitää enemmän, toinen vetää enemmän: kanna nopeutta keskellä leveällä, pyöreällä linjalla ("U") pitävämmällä autolla; jarruta suoraan, kierrä lyhyessä tiukassa keskiosassa ja suorista ulosajo ("V") vahvemmalla autolla;
- yksi auto on heikompi molemmissa: sen paras kierros on puhtain. Jarruta suoraan, leveimmällä säteellä, täyskaasu niin aikaisin kuin se pitää;
- auto, joka menettää takapäänsä helpommin: syötä kaasu sisään vasta, kun ohjaus purkautuu, ja lyhennä vaihtoja (liu'ut kaasulla), tai päästä jarru varovasti irti ja pidä tasainen kaasu keskellä (liu'ut sisääntulossa).

Osion alla oleva vihje toistaa, miten kukin mitataan.

## Mitä autot päättävät mutkassa {#what-the-cars-decide-in-a-corner}

Kun kierrokset ovat eri autoilla, jokaisen menetetyn mutkan havainto päättyy kohtaan **Autot:** - mitä siitä autot päättävät ja miten tästä autosta saa irti eniten (`carNote`):

- **Keskellä**, kun tämän auton pito on alle 96 % toisen pidosta, toinen oli hitaimmassa kohdassa yli 0,5 m/s nopeampi, ja tämä kierros ei ollut kaukana siitä, mitä sen pito selittää (yli 70 % siitä): toisen auton linjalla tämän auton pito sallii `v_toinen · √(pito_minun / pito_toinen)`. Jos kierros kantoi sen (1 m/s:n tarkkuudella), ero on auto, eikä mikään jarrutuspiste muuta sitä. Jos vähemmän, paljonko on vielä saatavilla. Sitten missä aika voidaan voittaa sen sijaan: suoralle, kahden välissä tai autossa, joka vetää 5 % kovemmin - kärjen jälkeen (jarruta suoraan, käännä myöhemmin, osoita ulosajoon aikaisin); muuten tien sallima leveimmän säteen linja.
- **Takapää päästi irti tässä** (kiinni ottamaton liuku tai pyörähdys, tai drift liukuraja ylittäen sisääntulossa), autossa, joka menettää sen vähintään kerran kierroksessa enemmän ja puolitoista kertaa useammin: mitä tehdä tällä autolla - kaasu syötetään sisään, kun ratti purkautuu (sen liu'ut alkavat teholla 60 % tai enemmän ajasta), tai jarru päästetään varovasti irti ilman nostoa.
- **Suora sen jälkeen**: kun autojen veto selitti 0,03 s tai enemmän, toisen auton vahvempi veto samasta nopeudesta, molempien autojen veto 120:stä 200 km/h:iin.
- **Huippunopeus**: kun tämä kierros saavutti 98 % siitä, missä sen auto huipentuu yli 150 m pitkällä suoralla, ja toinen kulki 1,5 m/s nopeammin: se on auton huippunopeus, ja jokainen km/h enemmän mutkasta auttaa, kunnes se saavuttaa sen.
- **Jarrutus**: kun toinen auto jarruttaa 5 % kovemmin ja tämä kierros jarrutti yli 5 m aiemmin, osa aiemmasta jarrutuksesta on auton ansiota.

Auton osuus vähennetään myös itse ajasta. Katso [auton osuus](race-corner-analysis.md#the-cars-share). Mutka, jossa auto selittää 60 % tai enemmän, katsotaan auton ansioksi.

## Kehittäjille {#for-developers}

Koodi: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` tiedostossa [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` tiedostossa [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
