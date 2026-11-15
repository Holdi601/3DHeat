---
title: "Kisa-analytiikka: menetelmä"
parent: "Kisa-analyysi"
nav_order: 58
lang: "fi"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Kisa-analytiikka: menetelmä

Lyhyesti:

- Kierroksia verrataan **matkan** mukaan, ei ajan, joten sama paikka radalla asettuu kohdalleen.
- Jokainen mutka arvioidaan **kokonaisena**, yhdeltä jarrutusalueelta seuraavaan.
- Menetetty aika **jaetaan** sen mukaan, missä se menetettiin (jarrutus, sisäänajo, ulosajo, suora) ja kuinka suuren osan siitä auto selittää.
- Syy **selitetään sanoin**, neuvon kanssa.
- Tämän käyttämiseen, ei sen toiminnan lukemiseen: katso [Kisa-analyysi](race-analysis.md).

Tämä on menetelmä, joka on **Kisa-analyysi**-välilehden takana: mitä se mittaa, miten se päättää, mihin aika meni, ja miten se muuttaa sen neuvoksi. Se on määritys, jota analyysikoodi (`src/race/`) noudattaa, joten jokaisella tässä sääntöjen kohdalla on vastine koodissa ja testi, joka sen lukitsee.

## Mitä ammattilaistyökalut tekevät {#what-the-professional-tools-do}

Vakiintuneet työkalut ovat samassa ytimessä, ja eroavat pääasiassa siinä, kuinka pitkälle ne menevät kohti *syitä*:

- **Kaikki verrataan matkan mukaan, ei ajan.** Kaksi kierrosta uudelleennäytteistetään yhdelle matkaakselille; sama matka vastaa kuluneen ajan juoksevaa eroa, joka on *delta* (MoTeC kutsuu sitä ajan varianssiksi, muut ajan viiveeksi tai delta-jäljeksi). Sen kulmakerroin kertoo, missä aikaa menetetään juuri nyt: loiva kulmakerroin on kiihtyvyys, ilmanvastus tai jatkuva pito; jyrkkä jarrutus- tai kaasuero; ylös-alas-aalto on kaupankäyntiä sisäänajon nopeuden ja ulosajon välillä.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [osuusajan analyysi](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Jokainen mutka jaetaan vaiheisiin**: jarrutus, sisäänajo, keskikohta, ulosajo - jarrutuspiste, huippujarrutus ja vapautus, pienin nopeus ja missä se tapahtuu, vaihde, kaasun otto, paluu täyteen kaasuun, ulosajon nopeus.
  ([Driver61: kuusi vaihetta](https://driver61.com/uni/corner-phases/),
  [iRacingin kierrosanalyysin opas](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Minisektorit mutkittain, ja teoreettinen paras** koottuna kunkin nopeimmista. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Ajettu linja verrataan myös**, mutta ei koskaan yksinään: "viiva kuvassa ei merkitse mitään, ennen kuin tiedät vaikuttavat tekijät" - sitä luetaan nopeuskäyrää ja deltaa vasten.
  ([Track Titan: telemetrian analysointi](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: ajolinjat](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Juurisyy, ei oire.** Onko suoralla menetys todella kaasusta, vai pakottiko huono sisäänajo myöhäisen kaasun? Virheet järjestetään kierrosaikakustannuksen mukaan ja selitetään selkokielellä.
  ([Track Titan: valmennusvirrat](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Mikä meni pieleen ensimmäisessä versiossa, ja miksi se on tärkeää {#what-went-wrong-in-the-first-version-and-why-it-matters}

Ensimmäinen versio laski jokaisen *vaiheen* erikseen ja katsoi vain menetyksiä. Kierros, joka jarrutti aikaisemmin, menetti aikaa jarrutusvaiheessa, ja sille sanottiin jarruttaa myöhemmin - vaikka tuo aikaisempi jarrutus kääntäisi auton aiemmin, ottaisi kaasun aiemmin ja ulos mutkasta nopeammin, ja voittaisi kaiken takaisin suoralla. Yhdessä testissä se kertoi kierrokselle, joka näin teki, "jarruta paljon myöhemmin", vaikka toinen kierros - joka jarrutti myöhemmin - oli missannut apeksin, ajanut leveästi ja menettänyt juuri sen, minkä oli voittanut. Aikadata sanoi, että kaksi tapaa ajaa mutka oli tasan; neuvo sanoi päinvastaista.

Korjaus on sääntö, johon jokainen yllä oleva lähde on yhtä mieltä: **mutka arvioidaan kokonaisena**, jarrutusalueelta siihen seuraavan jarrutusalueelle, koska "joskus muutaman millisekunnin uhraaminen mutkassa voi parantaa koko kierrosaikaa, kun seuraavat osuudet ovat nopeampia"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Kilpailutiedot, joita säännöt koodaavat {#racing-knowledge-the-rules-encode}

**Ulosajon nopeus on tärkeämpi kuin sisäänajon nopeus**, ja sitä enemmän, mitä pidempi seuraava suora on: "suorilla vietetty aika hallitsee mutkissa vietettyä aikaa", ja ulosajon nopeusvaje kulkee mukana seuraavaan jarrutuspisteeseen. Nopein tapa mutkan ja suoran läpi on usein ajaa mutka hitaammin, jotta kaasu tulee aiemmin - *hidas sisään, nopea ulos*.
([Race & Track Driving: kierrosajan parantamisen järjestys](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: mutkien priorisointi](https://driver61.com/uni/prioritising-corners/))
Vähimmäisajan suunnittelija, joka palkitaan myös ulosajon nopeudesta, siirtää apeksejään myöhemmin ja saa *nopeamman* kierroksen; palkinto, joka tasapainottaa kaksi, on `L / v²` ulosajon nopeuden yksikköä kohti pitkälle suoralle, jonka pituus on `L` ja nopeus `v` - aika, jonka nopeusero maksaa suoralla, kasvaa pituuden mukana ja pienenee nopeuden neliöllä
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Mutkat sen mukaan, mihin ne johtavat.** Suoralle johtava: maksimoi ulosajon nopeus, myöhäinen apeksi, takaisin kaasulle mahdollisimman pian. Suoran päässä oleva: maksimoi suoralle kuljetettu nopeus, jarruta mahdollisimman myöhään, aikainen apeksi on hyväksyttävä. Mutkien välinen: kompromissi sen hyväksi, joka on tärkeämpi sen jälkeen. Mutka, joka voisi olla kumpi tahansa, käsitellään suoralle johtavana. Nopeammat mutkat painavat enemmän: nopeudessa auto kiihtyy heikosti, eikä menetettyä km/h:ta voiteta takaisin.
([Allen Berg: kolme mutkatyyppiä](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: mutkien priorisointi](https://driver61.com/uni/prioritising-corners/),
[Driver61: eri mutkat, eri tekniikat](https://driver61.com/uni/different-corner-technique/))

**Kitkaympyrä.** Renkaalla on yksi pitobudjetti, jota käytetään jarrutukseen, kääntymiseen ja kiihtyvyyteen missä tahansa sekoituksessa; kokonaiskiihtyvyys on `sqrt(lat² + long²)`. Jarrutus kulkee sen reunaa pitkin: jarru vapautetaan, kun ohjaus ja sivukuorma kasvavat.
([kitkaympyrä](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g-kaavio](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Rullaus** - kumpikaan pedaali ei ole alhaalla - on hitain tapa menettää nopeutta, ja mitattava suorituskykyindikaattori sellaisenaan.
([Racecar Engineering / OptimumG: rullauskerroin](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Lipsu.** Pitkittäisvoima huipentuu lipsuluvulla noin 10-20 %, ja laskee sen jälkeen; sen yli pyörä lukkiutuu jarrutuksessa tai pyörii tehon alla. Forza raportoi lipsun normalisoituna: 0 on täysi pito, suuruus yli 1 tarkoittaa pidon menetystä.
([pitkittäinen lipsu](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Alistuva ja ylistuva ohjaus.** Etulipsukulma suurempi kuin takana on alistuvaa ohjausta; takana suurempi kuin edessä on ylistuvaa. Ilman lipsukulmia: auto kääntyy vähemmän kuin ohjaus pyytää (ohjaus Ackermann-kulman `L/R` yläpuolella, jonka auto tarvitsee pienellä nopeudella).
([alistuva ohjaus, yleiskatsaus](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Linjan geometria {#the-geometry-of-a-line}

Nopeus, jonka auto pystyy pitämään säteellä `R`, on `v = sqrt(a R)`, jossa `a` on renkaiden antama poikittaiskiihtyvyys (plus se, mitä alaspaine lisää, joka kasvaa `v²`:n mukana). Joten **nopeus kasvaa säteen neliöjuuren mukana**: keskikohdan kautta kulkeva linja 20 % suuremmalla säteellä on siellä noin 10 % nopeampi.
([suurin kääntymisnopeus](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: kääntyminen](https://www.formula1-dictionary.net/cornering_tech.html))

**Geometrinen linja** on suurin kaari mutkan läpi: ulkoreunasta, koskien sisäpuolta apeksissa, takaisin ulkoreunaan. Mutkalle, joka kääntyy kulman `θ` verran tiellä, jonka leveys on `w` (vähennettynä auton leveydellä), kaari, joka koskettaa molempia ulkoreunoja ja koskettaa sisämutkaa, on `R = w / (1 - cos(θ/2))` (plus sisäreunan oma säde) - suorakulmalle noin `3,4 w`, hiukkasmutkalle `w`. Siksi leveyden käyttö on tärkeintä keskinopeissa mutkissa ja vähiten hiukkasmutkissa.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Myöhäinen apeksi** kääntyy sisään myöhemmin ja syvemmälle, aluksi tiukemmalla säteellä, ja avaa säteen ulosajossa: hitaammin keskellä, suoralle aiemmin, täydelle kaasulle aiemmin - "hieman alempi minimiään, mutta voimakkaampi kiihtyvyysprofiili ulosajossa". **Aikainen apeksi** on päinvastainen: nopeammin sisään, ja säde kiristyy ulosajossa ja pidättää kaasua - enimmäkseen virhe, paitsi hyvin pienellä pidolla, jossa sisään menetettyä nopeutta ei saa takaisin ulos.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry -sanasto](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[matematiikka ajolinjasta](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V" ja "U".** U on klassinen pyöreä linja: leveimmällä säteellä, pienimmällä ohjausmuutoksella. V kääntyy sisään aiemmin, menee syvemmälle, kääntää auton nopeasti keskellä ja asettaa ulosajon suoremmalle ulosajolle: jarrutus pysyy suorana (joten se voi olla myöhäisempi), minimi nopeus on alempi mutta saavutetaan myöhemmin, täysi kaasu tulee paljon aiemmin.
([Track Titan: V-linja](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Kaarevuus matkaa vastaan.** Nopein linja on kompromissi lyhimmän polun ja vähiten kaarevan välillä; radan leveydellä kaarevuus on tärkeämpi, ja vähimmäiskaarevuuslinja tulee lähelle vähimmäisaikalinjaa aina, kun auto on rajallaan - se eroaa siitä siellä, missä auto voisi kiihtyä.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Peräkkäiset mutkat** - kaksoisapeksi, chicane - ovat yksi ongelma: yhden ulosajon linja on seuraavan sisäänajon linja, ja ne ajetaan takaperin siitä, joka johtaa suoralle.
([Driver61: eri mutkat, eri tekniikat](https://driver61.com/uni/different-corner-technique/))

## Mikä linja sopii mihinkin autoon {#which-line-suits-which-car}

Sen ratkaisee auton **teho suhteessa pitoon** kyseisen mutkan nopeuksilla - "vauhti on pitoa vastaan tehoa, suhdeluku".
([Ross Bentley: vauhtiautot](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[vauhti yli hevosvoimien](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Auto, tässä mutkassa | Linja | Miksi |
|---|---|---|
| Kiihtyy kovaa pitoonsa nähden ("pistä ja ammu") | V: jarru suoraan ja myöhään, pyöri lyhyessä tiukassa keskiosassa, suora ja tasainen aiemmin | aika voitetaan täydellä kaasulla, ei minimi­nopeudella |
| Kiihtyy heikosti pitoonsa nähden ("vauhti") | leveä U, hieman myöhäinen apeksi, pidä minimi­nopeus korkealla | se ei voi voittaa takaisin nopeutta, jonka se hukkaa |
| Välissä | hidas sisään, nopea ulos: myöhäisen apeksin U | klassinen kompromissi |
| Nopea mutka, ja enemmän alaspaineen kanssa | U, lähellä geometrista linjaa | kiihtyvyys on heikko nopeudessa; alaspainepito kasvaa `v²`:n mukana, joten nopeus keskellä maksaa kaksi kertaa |
| Hyvin pieni pito (märkä, lumi) | aikaisempi apeksi | sisään menetettyä nopeutta ei saa takaisin |
| Teho paljon pidon yli | linjalla on vähemmän merkitystä | veto, ei linja, rajoittaa ulosajoa |

"Mitä nopeampi mutka, sitä lähempänä geometrista linjaa; mitä hitaampi, sitä enemmän muutat sitä myöhäisellä apeksilla."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[matematiikka ajolinjasta](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: V-linja](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: pito](https://driver61.com/uni/grip/))

Vetotapa muuttaa, kuinka linja ajetaan, enemmän kuin linja itse: etuvetoista autoa käännetään jarruilla (jarrutus kääntyessä) ja sille annetaan teho vain pyörän purkautuessa, muuten se leviää leveästi; tehokasta takavetoista autoa on suoristettava ennen täyttä kaasua, tai takapää lähtee; nelivetoinen voi ottaa tehoa vielä kääntyessä, joten se ottaa kaasun aiemmin.
([FWD-tekniikka](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD -kääntyminen](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Katselin mittaa auton teho-pitosuhteen jokaisessa mutkassa sen omasta ajosta - täyden kaasun kiihtyvyys ulosajon nopeudella jaettuna sivupidolla minimi­nopeudessa - ja kutsuu sitä "pistä ja ammu" -autoksi arvolla 0,45 ja yli, "vauhti" -autoksi arvolla 0,25 ja alle. Auto, jonka pito 150-250 km/h on yli 15 % sen pidon yläpuolella 55-110 km/h, sai alaspainetta toimimaan.

## Menetelmä {#the-method}

Alla olevat luvut ovat perustelu. Koodin käyttämät kynnysarvot on pidetty kukin omalla sivullaan, ja nuo sivut ovat viitteenä, kun tämän sivun luku eroaa: [Mutka mutkalta -analyysi](race-corner-analysis.md), [Auton hallintatapahtumat](race-control-events.md), [Autoprofiilit ja vertailu](race-car-profiles.md) ja [Ratatilastot](race-course-statistics.md).

### 1. Yksi matkaakseli {#one-distance-axis}

Nopein kierros on vertailu, ellei käyttäjä valitse toista. Sen ajettu polku on akseli: jokaisen muun kierroksen näytteet projisoidaan siihen, jolloin jokaisella näytteellä on matka pitkin vertailua `s` ja merkitty sivusiirtymä `d`. Projisointi etsii vain eteenpäin edellisestä osumasta, joten kierros, joka risteää itsensä yli, ei koskaan hyppää väärälle puolelle siltaa. Kierrokset uudelleennäytteistetään sitten yhdelle ruudukolle, joka 2 m, jokaiselle kanavalle. Kierros kuljetetaan viimeiset muutama metri nopeudella, jolla se oli, joten sen delta viivalla on sen kierrosaikojen ero.

### 2. Mutkat ja jokaisen mutkan osuus kierroksesta {#corners-and-each-corners-share-of-the-lap}

Miten mutkat, osuudet ja kompleksit löydetään: [Mutka mutkalta -analyysi](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Mutkan aikalaskelma {#the-time-account-of-a-corner}

Netto, jako, ulosajon nopeus ja autojen veto: [Mutka mutkalta -analyysi](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Tuomio ja syy {#the-verdict-and-the-cause}

Tuomiokuviot sekä syyt sisään- ja ulosajossa: [Mutka mutkalta -analyysi](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Auto kuljettajaa vastaan {#the-car-against-the-driver}

Kun kierrokset ovat eri autoilla, menetys, jonka auto selittää, otetaan pois osittain:

- **veto**: autot samasta nopeudesta alas suoralle, kuten yllä;
- **pito**: alemman minimi­nopeuden osuus, jota ei selitä tiukempi säde, osuus `½ ln(pito_toinen / pito_oma) / ln(v_toinen / v_oma)`, kun kierros oli auton rajalla (90 % siitä, mitä se on tuolla nopeudella näyttänyt);
- **jarrut**: `u`:sta `v`:hen hidastuvuudella `a1` vastaan `a2`, päättyen samaan pisteeseen, maksaa `(1/a1 - 1/a2)(u - v)² / 2u` - vain kun kierros jarrutti suunnilleen niin kovaa kuin auto pystyy alueella keskimäärin, ei vain huipussa.

Mitä auto pystyy tekemään, tulee jokaisesta sen ladatusta kierroksesta: poikittaispito, jarrutus ja täysi kaasukiihtyvyys per 5 m/s nopeusalue (95., 95. ja 90. persentiili). Pito on se, minkä auto **piti puoli sekuntia** - poikittaiskiihtyvyys keskiarvona 0,5 s yli - ei se, minkä yksi näyte kosketti: reunakivi, liukun takaisin napsahdus, auton kiinnisaaminen nostavat kaikki sitä hetkeksi, ja auto, joka tekee niin usein, näytti pitävämmältä kuin on. (Tarkistettu tallennetuilla kierroksilla kahdella eri autolla: näytekohtainen mitta asetti ne lähelle toisiaan; puoli sekuntia pidettynä ne erottuvat niin kuin niiden kierrosajat tekevät.) Jarrutus ja veto ottavat jokaisen näytteen itsensä ja naapureidensa mediaanina. Ilma, lasku laskeutumisen jälkeen ja jokainen isku (osa 6), kunnes auto on toipunut, jätetään pois.

**Millainen auto kukin on** (`profile.ts`): samoista kierroksista:

- **pito**: sen puoli sekunnin poikittaiskiihtyvyyden 95. persentiili;
- **veto** täydellä kaasulla 0-50 km/h, 50-120, 120-200 ja yli 200, ja sen suurin näytetty;
- **jarrutus** 60 km/h:sta 160 km/h:iin;
- **huippunopeus**: kohta, jossa se lakkasi kiihtymästä täydellä kaasulla sekunnin ajan suoralla - ajettu suoraan, ei pitkä mutka otettuna tasaisesti, missä auto hiertää nopeutta millä tahansa teholla. Kun mikään suora ei ollut tarpeeksi pitkä, se, mitä auto vielä veti huipullaan, kertoo, kuinka kaukana se oli. Ei arvausta sen ulkopuolella, minkä kierrokset näyttävät: teho nopeuden yli ilmanvastusta vasten sovitettuna työnsi tieauton 100 km/h yli sen todellisen huippunopeuden, koska vaihteisto ja rajoitin lopettavat auton vedon paljon ennen kuin ilmanvastus tekee sen;
- **takapään menetys**: kuinka monta kertaa kierroksella auto liukui yli 10° ajautumisen (20° irtonaisella maalla) ohjauksen ollessa mutkaa vastaan - kiinni otettu vastakkaisella lukolla - kuinka moni niistä alkoi kaasulla, ja missä osassa pitoa ne alkoivat. Auto, jota ajetaan hieman sivuttain tarkoituksella, ei menetä mitään; se, joka vaatii kiinni ottamista, menettää. Lasketaan samalla tavalla jokaiselle autolle, joten kaksi autoa voidaan verrata;
- **tasapaino**, kun kierroksissa on lipsukulmat: etu vastaan takana rajalla.

**Autot verrattuna** asettaa autot rinnakkain - taulukko, lause kummastakin siitä, mikä auto on toiseen verrattuna ("X kiihtyy paremmin, mutta ei käänny yhtä kovaa, tarvitsee pidemmän jarrutusmatkan ja menettää takapään helpommin"), jokainen selvä ero (4 % pidosta, 5 % vedosta tai jarrutuksesta, 4 km/h huippunopeudesta, takapää kiinni otettuna vähintään kerran kierroksella enemmän ja puolitoista kertaa niin usein), ja miten kumpaakin ajetaan. Yhdellä autolla se kertoo, mikä auto on.

**Jokaisessa mutkassa**, kun kierrokset ovat eri autoilla, löydös kertoo, mitä siitä autot päättävät ja miten tämän autosta saadaan irti eniten:

- **keskikohdassa**: toisen auton linjalla tämän auton pito sallii `v_toinen · √(pito_oma / pito_toinen)`. Jos kierros ajoi sen, rako on auto, eikä mikään jarrutuspiste muuta sitä - se sanotaan, ja mutka kirjataan autolle eikä kuljettajalle; jos kierros ajoi vähemmän, loput on saatavissa, ja sanotaan kuinka paljon. Sitten missä aika voidaan voittaa sen sijaan: suoralle, tai autossa, joka vetää kovemmin, apeksin jälkeen - jarruta suoraan, käänny myöhemmin, saa sen osoittamaan ulosajoon aikaisin; muuten suurin säde, jonka tie sallii, koska suurempi säde on ainoa tapa saada enemmän nopeutta ilman enempää pitoa;
- **takapää, joka päästi irti**: tässä, autossa, joka menettää sen helpommin kuin toinen: mitä tehdä tässä autossa - kaasu syötetään pyörän purkautuessa, tai jarru vapautetaan pehmeästi ilman nostoa kesken mutkan, sen mukaan miten sen liukut alkavat;
- **suora sen jälkeen**: mitä toisen auton vahvempi veto samasta nopeudesta vei, ja missä tämä auto loppui vedosta siinä;
- **aikaisempi jarrutuspiste** autossa, joka pysähtyy vähemmän kovasti.

Kierros, joka liukui mutkan keskikohdassa (yli 10° ajautumista asfaltilla), oli ylittänyt pitonsa, ei jäänyt siitä lyhyeksi: sille ei koskaan sanota, että pitoa olisi jäänyt käyttämättä siellä. Ja jos auton takapää on päästänyt irti tällä kierroksella vähemmällä sivukiihtyvyydellä kuin mutka vaati, "pitoa jäljellä" sanoo, että se löydetään pienin askelin.

### 6. Auton hallinta: lukot, pyöriminen, liukut ja työnnöt, osumat ja kolarit {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Jokainen kierros luetaan myös sen mukaan, miten autoa käsiteltiin - missä pyörä lukittui, missä vedetyt pyörät pyörivät, missä takapää lähti, missä etupää leveni - koska nämä ovat virheitä, joita pelkkä aika ei nimeä. Kolme asiaa pitää tämän pitämässä eri peleissä ja pinnoilla.

**Missä pito loppuu, mitataan auton omasta ajosta.** Insinöörit asettavat lukkoraja-arvon kullekin autolle lipsulla, joka antoi eniten hidastuvuutta (OptimumGin jarrusarjan MoTeC-kanavat käyttävät -0,07 yhdelle autolle), ei kirjan arvoa, ja kirjan arvot ovat kuitenkin erimielisiä: voima huipentuu 5-20 %:n lipsulla asfaltilla renkaasta ja mallista riippuen, 6 %:ssa tai 20-60 %:ssa lumella lähteestä riippuen, eikä mikään lähde anna yhtä arvoa soralle. Pelit skaalaavat lipsun taas eri tavalla: Forzan on "normalisoitu", joten yli 1:n kohdalla pito on menetetty - silti auton jarrut voivat antaa parhaansa selvästi alle tai yli 1:n, ja tavalliset jarrutusalueet voivat ylittää 1:n. Joten jokaiselle autolle, sen kaikista ladatuista kierroksista, tehdään se voima, jonka se teki, lokeroittain sitä lipsua vastaan, jolla se ajoi - hidastuvuus renkaiden lipsuluvun suhteen suoraviivaisessa jarrutuksessa, kiihtyvyys (osuutena siitä, mitä auto tekee sillä nopeudella) vedettyjen pyörien lipsua vastaan, mutkapito (osuutena auton pidosta sillä nopeudella) kunkin akselin kulmalipsua vastaan - ja raja on se lipsu, joka on parhaan jälkeen, jossa voima on laskenut 8 %. Käyrä, joka ei koskaan laske datassa - Forza Horizonin mutka- ja vetopito - ei sisällä rajaa, eikä pelkkä lipsu merkitse siellä mitään. Liian vähällä datalla raja on puolitoista kertaa nimellinen huippu.

**Maa tunnetaan näytekohtaisesti**, missä peli kertoo: Forza tärisyttää renkaita soralla, mudalla ja nurmella (vähän näytteitä asfalttiradalla, paljon mudalla ja maastoradoilla), Trackmania nimeää materiaalin kunkin pyörän alla, ja rallierikoiskokeen maa löydetään kuten osa 11 kertoo. Käyrät, ajotavat ja kynnysarvot pidetään erillään asfaltille ja irtonaiselle maalle.

**Jokainen tapahtuma asetetaan toista kierrosta vastaan samoille metreille.** Soralla, lumella, ajautumisvoittoisessa arcade-kilpailussa liukuminen on tapa, jolla mutka ajetaan: optimaalisen ohjauksen tutkimukset löytävät "matalan ajautumisen" ratkaisuja asfaltilla ja "aggressiivisia, korkean ajautumisen, jopa vastaohjaavia" ratkaisuja maastossa, rallidata näyttää renkaat "hyvin epälineaarisella alueella", ja pyörän lukitseminen hyvin löyhällä maalla voi jopa pysäyttää auton aiemmin. Joten tapahtuma, jonka toinen kierros teki myös - 80 % siitä tai enemmän - on tapa, jolla mutka ajetaan, ei virhe; ja sellainen, jota se ei tehnyt, on virhe vain, jos se maksoi aikaa: aika, joka menetettiin juuri ennen sitä ja 40 m sen jälkeen. Virhe, joka selittää 40 % tai enemmän mutkan menetyksestä, tulee sen mutkan syyksi.

Tunnistuskynnykset, toisen kierroksen testi, osumat ja kolarit sekä neuvotekstit: [Auton hallintatapahtumat](race-control-events.md).

### 6b. Monta kierrosta: radan tilastot {#b-many-laps-the-courses-statistics}

Luokkavertailu, mikä lasketaan virheeksi, tilastot ja virhekartta: [Ratatilastot](race-course-statistics.md).

### 7. Ajettu linja {#the-driven-line}

Jokaiselle kierrokselle ja mutkalle pelkistä sijainneista: missä se alkoi kääntyä (viidesosa tiukimmasta kaarevuudestaan), sen tiukin säde (±8 m yli), keskisäde suunnanmuutoksensa ensimmäisellä ja toisella puoliskolla, ja niin edelleen

- **muoto**: tiukin säde jaettuna keskisäteellä alle 0,55 on V, yli 0,75 U;
- **apeksi**: ulosajon säde jaettuna sisäänajon säteellä yli 1,25 on myöhäinen, alle 0,8 aikainen;
- **nopeusapeksi**: sen hitain piste yli 15 m ennen käännöksensä puoliväliä on hidas sisään, nopea ulos; yli 15 m jälkeen, yhä hidastaa keskellä.

Toista kierrosta vastaan: kuinka paljon sisällä tai ulkona se ajoi sisäänkääntyessä, tiukimmassa kohdassa ja missä molemmat olivat tasaisella, ja missä kukin kääntyi sisään. Jokainen löydös päättyy linjaan, joka sopii kierroksen autolle siinä mutkassa - sen mukaan, mihin mutka johtaa, ja auton mitatun teho-pitosuhteen, alaspaineen ja vetotavan mukaan - ja siihen, ajoiko kierros sen. Taulukko "Mutka mutkalta" luettelee nopeimman kierroksen jokaisessa mutkassa linjansa muodon kanssa, ja parhaat mutkat kootaan yhteen.

### 8. Kaksi karttaa {#two-maps}

- **Missä**: rata väritettynä `dΔt/ds`:llä vertailua vastaan, punainen missä aikaa menetetään ja vihreä missä se voitetaan.
- **Miksi**: jokainen menetys piirretään siihen, missä sen syy on, väritettynä syyryhmän mukaan - jarrutus, sisäänajo, ulosajo, suora, auto - ja leveämpänä kalliimmalle.

### 9. Toisto {#replay}

Yksi kello, kolme tapaa muuttaa se kunkin kierroksen omaksi ajaksi: lähtöviivalta, samasta kohdasta (jokainen kierros saavuttaa radan yhden pisteen samaan aikaan, sitten päästetään irti) ja rinnakkain (jokainen kierros pidetään vertailun matkalla).

### 10. Mihin suuntaan maailma on päin {#which-way-round-the-world-is}

Katselimen maailma on oikeakätinen, Y ylös. Vasenkätinen maailma (Forza niiden joukossa) tulee siinä peilattuna: jokainen oikean käden mutka piirretään vasemman käden mutkana, rata ja kierrokset samoin. Kierrokset kertovat sen itse - positiivinen ohjaus on oikealle jokaisessa sovittimessa, ja mutkan ulkopuolinen jousitus puristuu - joten kierrosvälilehti tarjoaa korjata sen, ja **Kamera ja näkymä → Käännä maailman akseli** tekee sen: X, Y tai Z piirretään käännettynä. Vain piirtäminen muuttuu - heijastus, joka on taitettu näkymämatriisiin; kamera lentää piirretyssä maailmassa, ja data, analyysi ja jokainen koordinaatti, jonka työkalut näyttävät, pysyvät pelin omina. Analyysi nimeää mutkat vasemmalle tai oikealle samalla mittauksella.

### 11. Rally: liuku, vasen jalka, ilma {#rally-the-slide-the-left-foot-the-air}

Rallierikoiskoe ei ole kierros, jota ajetaan huonommalla pidolla. Soralla ja lumella liuku on tapa, jolla mutka otetaan: auto käännetään sisään siirtämällä sen painoa - "jarrut siirtävät auton painon eteen ... etupyörät saavat pitoa, takapyörät menettävät pitoa, ja auto kääntyy liukuen mutkaan" - ja sitten takaisin kaasulle, kun se on "linjassa haluamaasi suuntaan" ([DirtFish: jarrujen käyttö](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Vasen jalka tekee jarrutuksen, jotta kaasua ja jarrua voidaan pelata toisiaan vastaan, käsijarru kääntää auton tiukoissa mutkissa
([RallySport Ontario: rallauksen perusteet](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)),
ja auto irtoaa maasta. Osa 6 lukee jo liukuja toista kierrosta vastaan; nämä säännöt kantavat loput.

- **Maa.** Mitä kierros sanoo (`meta.surface`, rallitallentimien `--surface`), muuten tapahtuman nimi - asfalttirallit (Espanja, Kroatia, Keski-Eurooppa, Saksa, Japani, Korsika, Ypres), talviset (lumi), Monten asfaltti, jolla on lunta ja jäätä (sekapinta) - muuten miten autoa ajettiin. Rally2-auton sivuraja on 0,7-0,9 g soralla ja 1,3-1,4 g asfaltilla ([grenzbereich, vertailuarvot](https://github.com/GitCrush/grenzbereich)), ja soralla se ajaa paljon enemmän ajautumista (osa 6). Joten vaihe, jossa auto veti 10 m/s² tai enemmän (95. persentiili, nopeudella, maalla) ja jonka mediaani-ajautuminen oli alle 6 astetta missä tahansa, missä se kääntyi 70 %:lla tuosta, oli asfalttia; kaikki muu, tai liian vähän tietoa, on irtonaista.
- **Mitä auto pystyy tekemään, sillä maalla, jolla se teki sen.** Pito, jarrutus ja veto (osa 5) mitataan asfaltille ja irtonaiselle maalle erikseen, kun kierrokset ajoivat viidesosan tai enemmän näytteistään kummallekin, ja jokainen mutka arvioidaan sen maan mukaan, joka oli auton alla sen hitaimmassa pisteessä. Ilmassa olevat näytteet ja 0,3 s laskeutumisen jälkeen jätetään pois kaikesta, mikä mittaa autoa - verhokäyrät, renkaiden käyrät, lukot ja pyöriminen: laskeutuminen tärähtää auton yli kaiken, mitä renkaat kestävät, ja ilmassa pyörineitä pyöriä ei lasketa pyörimiseksi. Alaspainetta ei arvioida irtonaisella alustalla, missä vaiheen nopeat ja hitaat osuudet ovat eri teitä.
- **Vasemman jalan koskettaminen ei ole jarrutusta.** Pieni jarrukoskettaminen, kun kaasu on yhä puolessa tai enemmän, alle 15 m:n matkalla, vakauttaa auton tai kääntää sen; se, mistä kierros alkoi jarruttaa mutkaa varten, on ensimmäinen jarrutus, jonka aikana kaasu nousi pois, tai joka kesti pidempään.
- **Auto kääntyi sisään.** Jokaiselle kierrokselle ja mutkalle suurin ajautumiskulma jarrutuksesta 5 m hitaimman pisteen jälkeen. Irtonaisella maalla kierros, joka kääntyi 8 astetta tai enemmän vähemmän kuin toinen (joka kääntyi 12 tai enemmän) ja kaasulle tai tasaiselle myöhemmin, **käänsi autoa vähemmän**: neuvo on nostaa tai koskettaa vasenta jarrua, kun se kääntyy sisään, jotta takapää tulee mukaan - toisen kierroksen käsijarrun pisteen kanssa, kun se käytti sitä, tai käsijarru mutkassa, joka on hitaampi kuin 54 km/h - ja pitää se osoittamassa ulosajoon ennen apeksia. Se, joka kääntyi 12 astetta tai enemmän toisen yli ja silti pääsi kaasulle myöhemmin, **käänsi sitä liian pitkälle**: se piti suoristaa, ennen kuin veto voi tulla. Kumpikin on mutkan syy ulosajossa, auton hallintavirheen jälkeen. Irtonaisella alustalla linjaneuvo sanoo saman jokaisesta mutkasta.
- **Ilma.** Lento, joka oli 0,2 s tai enemmän pidempi kuin toisen kierroksen, ja joka maksoi aikaa 10 m ennen ilmaan lähtöä 40 m laskeutumisen jälkeen (tai mutkan loppuun), on syy, kun se selittää 40 % tai enemmän mutkan menetyksestä, ja seuraava mutka, johon päästään hitaammin, sanoo sen. Ilmassa auto ei voi kääntyä, jarruttaa eikä ajaa. Neuvo pitää kaasun päällä lähtiessä - "älä nosta kaasua lähdön aikana", mikä päästää nokan alas - ja ottaa harjanteen hieman hitaammin tai jarrun pienellä koskettamisella, jotta auto pysyy matalana
([DirtFish: rallilaiturin hyppääminen](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Enintään kolmen mutkan kompleksit.** Mutkitteleva osuus, jota ajetaan koskaan olematta tasaisella, ei ole yksi pitkä kompleksi: yli kolmen mutkan jälkeen alkaa uusi.

`src/race/rally.test.ts` pitää analyysin kaikessa tässä yksinkertaisella mallilla ajetuilla vaiheilla: auto, joka kääntyi vähemmän ja myöhään kaasulle, pidempi lento, vasemman jalan koskettamiset, mutkitteleva osuus, asfaltti vastaan sora.

## Data ja mitä kukin lähde sallii {#data-and-what-each-source-allows}

| Lähde | Nopeus | Kanavat | Sallii |
|---|---|---|---|
| FH Companion -kierrostiedostot | noin 5 m | sijainti, nopeus, kaasu, jarru, ohjaus, pitkittäis- ja poikittaiskiihtyvyys, vaihde | kaiken muun paitsi auton hallinnan, joka tarvitsee vierellä olevan telemetrian |
| FH Companionin `.tele.gz`, jokaisen kierrostiedoston vieressä | pelin 64 Hz (tallennin, joka säilyttää jokaisen paketin, kirjoittaa noin 110 sekunnissa; toistot pudotetaan) | Forzan koko Data Out: pyöräkohtainen lipsuluku, lipsukulma, yhdistetty lipsu, pyöriminen, jousitus, pinnan tärinä; auton koordinaatistoon suhteutettu nopeus; kulmanopeus | kaiken, auton hallinta mukaan lukien |
| Forza Data Out, tallennettu `heat3d_capture telemetry`llä | 60 Hz | kaikki yllä, sekä pyöräkohtaisesti: renkaan lämpötila, lipsuluku, lipsukulma, yhdistetty lipsu, jousituksen matka, pyörän nopeus, tärinäraita; kierrosluku, teho, vääntömomentti, kulmanopeus | kaiken |
| Assetto Corsa, ACC, AC EVO, AC Rally (jaettu muisti, `heat3d_capture telemetry --game ...`) | 60-333 Hz | ylijoukko: renkaan ydin ja sisä-/keski-/ulkolämpötilat, paineet, jarrujen lämpötilat, pyörien kuormat, kallistus, lipsuluku ja -kulma; auton koordinaatistoon suhteutettu nopeus; ABS ja vetonesto toiminnassa (ACC, EVO, AC Rally) | kaiken |
| iRacing `.ibt`, luettu suoraan | 60 Hz | sijainti GPS:stä, pedaalit, ohjaus, g-voimat, kulmanopeus, pyöräkohtainen rungon lämpötila, iskunvaimentimen taipuma, paine, kuluminen | kaiken; auton hallinta ajautumiskulmasta (sen kulma suuntaan nähden) ja ohjauksesta, ei lipsua (ei tallenneta) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | kehyksittäin; 100 Hz | sijainti, maailmanvauhti ja auton akselit, pyöräkohtainen kosketuspinnan nopeus ja jousitus, pedaalit, ohjaus, erikoiskokeen kello ja pituus | kaiken; lipsu ja ajautumiskulma johdettuina |
| Richard Burns Rally (NGP UDP) | fysiikka-askelittain | sijainti, auton omat nopeudet, pyöräkohtainen jousen taipuma ja voima, pedaalit | kaiken paitsi pyörän lipsun |
| BeamNG.drive (`heat3d`-protokollamodi) | enintään 100 Hz | sijainti, maailmanvauhti ja akselit, pyöräkohtainen pinnan nopeus, pyöriminen, kuorma ja maakosketus | kaiken; lipsu ja ajautumiskulma johdettuina |
| Trackmania (Openplanet-liitännäinen) | kehyksittäin | sijainti, etu- ja sivunopeus, pedaalit (jarru päällä/pois), ohjaus, pyöräkohtainen lipsukerroin ja irtonainen maa, ilmassa | kaiken; ajautumiskulma sivunopeudesta |

Jokainen lähde muunnetaan yhdeksi kierrosmuodoksi, `heat3d-lap`:iksi, jonka kanavilla on kanoniset nimet (`speed`, `throttle`, `tireTemp[FL]` ...). Autopiirrokset ja kaaviot piirtävät ne kanavat, jotka kierroksella on.

## Lähteet {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Osuuksien nopeuttaminen: ajan varianssin muodot](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (matkatason delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacingin kierrosanalyysin opas](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session-kierrokset](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: ajolinjojen analysointi](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teoreettinen paras sektoreista](https://overcut.gg/)
- [Track Titan: telemetrian analysointi](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: jarrujen analyysi, lukko- ja vakaus-KPI:t (syys 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: kaasulla (tammikuu 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: kilpakuljettajien suorituskykyindikaattorit (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Rengas-tie-kitkamallit ja optimaalinen lipsu (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: rengas-tie-kitka, lipsu huipussa lumella ja jäällä](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: renkaiden kitkakertoimet, huippu ja liukuminen](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: pitkittäisvoimat](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: poikittaisvoimat](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Ajoneuvon vakaus, sivuluisun rajat (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rallikuljetus suurella sivuluisulla (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Vähimmäisaikaiset rallimanööverit (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC:n vertailukulmanopeus (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Alistuvan ja ylistuvan ohjauksen tunnistus ohjausta vastaan kulmanopeutta (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: ohjauskulma, Ackermann ja alistuvuusgradientti](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: laskukanavat (Kus, yhdistetty g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: alistuva ja ylistuva ohjaus -widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: lukitseminen hyvin löyhillä pinnoilla](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: soran rallin datan tallennus](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: jarrujen käyttö](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: rallauton hyppääminen](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rallauksen perusteet](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rallin ajoneuvodynamiikka, vertailuarvot](https://github.com/GitCrush/grenzbereich)
- [Trackmania nopeusajautumisen harjoitin -liitännäinen (vakiot)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania nopeusliukun kirjoitus](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: valmennusvirrat](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: V-linja](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Tekoälykuljettajan ajotyylin ohjaaminen (ulosajon nopeus vs. vähimmäisaika)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: kierrosajan parantamisen järjestys](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: kolme mutkatyyppiä](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: mutkien priorisointi](https://driver61.com/uni/prioritising-corners/)
- [Driver61: eri mutkat, eri tekniikat](https://driver61.com/uni/different-corner-technique/)
- [Driver61: mutkan kuusi vaihetta](https://driver61.com/uni/corner-phases/)
- [Driver61: pito](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (ote)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: mikä on vauhtiauto](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Vauhti yli hevosvoimien -keskustelu](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Ajolinjan matematiikka, osa 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, osa 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD-tekniikka](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD -kääntyminen](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: kääntymistekniikka](https://www.formula1-dictionary.net/cornering_tech.html)
- [Suurin kääntymisnopeus](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing-telemetrian sanasto](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Vähimmäisaikaisen ajoradan suunnittelu, kaarevuus ja matka huomioiden](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globaali kilparadan optimointi](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: rullauskerroin](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Kitkaympyrän johdanto](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g-kaavio](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Pitkittäinen lipsu](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Alistuva ohjaus, yleiskatsaus](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out -dokumentaatio](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: vetorajoitteinen kiihtyvyys](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: tehorajoitteinen kiihtyvyys](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO -jaettu muisti](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally -telemetrian lukija](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT -jäsennys](https://github.com/teamjorge/ibt)
