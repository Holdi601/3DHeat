---
title: "Sessioonid, isikud ja rühmad"
parent: "Andmete sisselugemine"
nav_order: 4
lang: "et"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---


# Seansid, isikud ja grupid

**Isik** on üks liikuv asi (mängija, auto). **Meeskond/grupp** on pool, kuhu nad kuuluvad. **Seanss** on
üks matš või ring. Vaata [sõnastikku](glossary.md).

Faili üks rida võib nimetada kõik kolm:

| x | y | aeg | mängija | meeskond | matš |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` on isik, `team` on grupp, `match` on seanss.

Kolm valikulist veergu kirjeldavad, *kellele* ja *kus loos* rida kuulub. Iga neist kodeeritakse laadimisel
sõnastikuna: tekstiväärtused muutuvad iga rea kohta väikesteks täisarvu ID-deks ning ühe sildiloendi järgi,
mida jagavad kõik selle laadimise failid.

## Isik {#person}

Veerg **Isiku ID** nimetab liikuva asja, kuhu rida kuulub: mängija, bot, auto. See salvestatakse iga rea kohta
32-bitise ID-na.

Isiku ja ajaveeru olemasolul arvutab laadimine iga rea **eluea**: aeg kuni sama isiku järgmise proovini *samas
seansis*, või "puudub" (valvur, -1), kui järgmist proovi ei ole - isik suri, lahkus või logi lõppes. Eluead annavad
jõu [ajajoone](timeline.md) ajaloole **Eluiga**, [kastiesituse](box-replay.md) interpolatsioonile ja vananemisele
ning [joonesoojuse](line-heat.md) marsruutide katkestustele. See, mida rida ilma järgmiseta teeb, on vaatamise
seade (*Varuelu*), mitte andmetesse kirjutatud.

Iga isik saab grupi, mis on tema **esimesel** realil ajas; see määrab tema kasti värvi kastiesituses ja selle, mille
grupi nähtavuse lüliti teda seal peidab. Soojusrežiimid kasutavad iga rea enda gruppi.

### Mitu asja korraga kantud nimed {#names-worn-by-several-things-at-once}

Nimi ei ole alati üks olem: mõne eksporti logib iga matši iga bot ühe nime all. Selle "isiku" kahe proovi
ühendamine - interpolatsiooni, jälje või marsruudi abil - joonistab kaardile joone kahe erineva olendi vahele.

Laadimisel ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) märgitakse nimi
**jagatuks**, kui kaks selle kirjet

- on samas seansis,
- on sama ajaga,
- on sama liiki (iga säilitatud kategooriaveeru väärtus on sama), ja
- on üksteisest kaugemal kui 1% andmete ulatuse diagonaalist.

Jagatud nimed joonistatakse üksikute proovidena - interpolatsiooni, jälge ega joonesoojuse marsruuti ei ole.
Kõik muu nende kohta (nende soojus) on puutumata. Andmestiku paneel loetleb, mitu nime märgiti, koos kuni kolme
näitega, ja kastiesituse paneel kordab arvu.

## Seanss {#session}

Veerg **Seanss / matš** ütleb, milline matš, rüüs, voor, sõit või ring rida kuulub. Just see teeb isiku proovid üheks
pidevaks rajaks: päris telemeetria lõikab sageli samaaegseid matše, ja mängija proov enne mängupead ning proov pärast
seda võivad olla eri matšidest, sadade meetrite kaugusel. Seansiveeru olemasolul:

- interpolatsioon, jäljed ja joonesoojuse marsruudid ei ületa kunagi seansivahetust;
- rea eluiga lõpeb tema enda seansi lõpus;
- **Seanss**-valija ilmub külgriba ülaossa, režiimiriba alla.

Seansiveerg on väga sageli *ajatempel* - matši algushetk, mis kordub iga selle matši real. Automaatvastendaja
otsib sel põhjusel seansinimesid enne isikut ja gruppi ([Veergude vastendus](column-mapping.md#session-person-group)).
Võistlusring või -stint on samuti seanss: sama auto kaks ringi ei tohi ühineda üheks rajaks.

### Seansi valija {#the-session-picker}

![Seansi valija lahti ühe kümne matšiga faili peal: Kõik seansid (10), Match 01, Match 02 ja nii edasi](../assets/img/en/sessions-persons-groups-picker.webp)

*Kümme matši ühes failis: vali üks või vaata kõiki.*

Näidatakse, kui andmestikul on loetletud seansid (vt piirangut allpool).

| Osa | Tähendus |
|---|---|
| Silt paremal | Valitud seansi ridade arv või *kõik korraga*. |
| Menüü | *Kõik seansid (N)*, siis iga seanss, kõige hõivatum esimesena, kujul `silt - N rida, ulatus` (ulatus sekundites alla 90 s, minutites alla 90 min, tundides üle selle). |
| Kollane vihje | Näidatakse *Kõik seansid* puhul: positsioone ei ühendata ikka üle seansside, aga samaaegsed matšid panevad kaardile kokku seotud mängijad. |
| Vihje | Näidatakse soojusrežiimides, kui on valitud üks seanss: valik liigutab ainult mängupead. |

Laadimisel valitakse kõige hõivatum seanss. Seansi valimine viib mängupea selle seansi algusse.

Mida valik muudab:

- **[kastiesituses](box-replay.md)** otsustab see, milline seanss mängitakse: joonistatakse ainult selle seansi kastid ja jäljed ning ajajoone vahemik muutub seansi enda ulatuseks.
- **soojusrežiimides** see soojust ei piira, ja valija all olev vihje ütleb seda: *Soojusrežiimides liigutab see ainult mängupea seansi algusesse; soojus loeb ikka iga seanssi. Kastiesitus mängib valitud seanssi üksi.* Et soojust piirata ühe seansiga, hoia seansiveergu ka filtriveerguna (*Säilita filtreerimiseks*) ja filtreeri selle järgi. Veerg võib olla nii seansiveerg kui ka filtriveerg: laadur loeb iga märgitud filtriveergu eraldi, sõltumata sellest, millist rolli see ka mängib.

### Liiga palju seansse {#too-many-sessions}

Loetletakse kuni **100 000** seanssi. Sellest üle on veerg tegelikult ID (kaust miljonite seanssidega, igaüks mõne reaga),
ja nii palju silte töötajalt lehele saatmine ajab vahelehe mälust välja. Laadimine hoiab siis seansi **ID-sid** - nii et
piirid jõustuvad ikka kõikjal - aga jätab sildid ja valija ära, ning andmestiku paneel ütleb seda.

## Grupp {#group}

Veerg **Võistkond / rühm** on mis tahes väikese arvu väärtustega veerg: meeskond, pool, salk, fraktsioon, mängija-vs-AI
lipp, auto klass. See salvestatakse iga rea kohta 16-bitise ID-na ning juhib:

- [Meeskondade loendit](teams-list.md) (nähtavus grupi kohta, + / − pooled),
- [meeskonna soojust](team-heat.md) (toon iga grupi kohta),
- [vahet](difference.md) grupi järgi jagatuna,
- kastide värve [kastiesituses](box-replay.md) (tooni perekond grupi kohta, toon liikme kohta).

### Piirangud {#limits}

Kõige rohkem **4096** erinevat gruppi. Grupi ID sõidab iga rea positsioonitekseli neljandas kanalis GPU-l ning iga grupp
vajab tekselit 4096 laiuses märgitabelis, mida shader loeb, et otsustada *peidetud*, *lisatud* või *lahutatud*. Veerg,
millel on rohkem erinevaid väärtusi, on ID, mitte grupp: **laadimine hoiab iga rea alles ja loobub ainult grupeerimisest**,
andmestikul on hoiatus, mis soovitab seda hoopis isiku veeruna seostada või hoida filtriveeruna.

Sama 4096 piir kehtib ka säilitatud *kategooria*-filtriveeru kohta; laiem ei jää alles ja andmestik ütleb seda. Arvuline veerg
(näiteks ajatempel) sellist piiri vahemikufiltrina ei oma.

Grupi väärtused `0`, tühi väärtus, `none`, `unknown`, `null` ja `-1` (suur-väike tähed ei loe) tähendavad
[meeskonna soojusele](team-heat.md) "gruppi ei ole" ja joonistatakse neutraalse halli, mitte kindla värvina.

## Üksuse suurus {#entity-size}

Kui suur on üks jälgitav asi - mängija kokkupõrkekast, auto - määrab ära, kui suured on [kastiesituse](box-replay.md)
kastid ja vaatekiired. Paneelil selle jaoks välja ei ole; see tuleb faili [`heat3d` vihjetest](data-formats.md#the-heat3d-hints)
(`entity.size`, faili enda ühikutes; CS2 konverter kirjutab 32). Laadimine korrutab selle ühikuskaalaga.

Igal laadimisel ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), kus *ulatus* on andmete
X- ja Z-ulatuse suurem:

| Seade | Üksuse suurusega | Ilma selleta |
|---|---|---|
| Kuubi suurus | üksuse suurus | ulatus / 500 |
| Vaatekiire pikkus | üksuse suurus × 4 | ulatus / 200 |
| Osakese raadius | ulatus / 120 | ulatus / 120 |
| Küllastuspunkt | analüütiline hinnang (siis mõõdetud) | sama |
| Lennukiirus | ulatus / 12 | sama |
| Kaugtasand | ulatus × 12 | sama |
| Lähitasand | max(0,05; ulatus / 20 000) | sama |

## Andmestiku paneel {#the-dataset-panel}

Allikapaneeli all. Kui andmestik on laaditud, näitab see:

- andmestiku **nime** - valik, ridade arv, failide arv, samm, kui seda kasutati;
- **`N meeskonda · N isikut · N s ulatus`**;
- iga **hoiatuse**, mida laadimine andis, kollasena, nii kaua kui andmestik on laaditud: grupid või filtriveerg jäeti välja liiga paljude väärtuste tõttu, seansid pole loetletud, jagatud nimed, puuduvad read, vahele jäetud failid;
- [sünteetilise generaatori](synthetic-generator.md);
- **Eemalda**, mis eemaldab andmestiku.

Ridade arv on näidatud paneeli päises.
