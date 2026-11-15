---
title: "Taktikatahvel"
nav_order: 15
has_children: true
lang: "et"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Taktikatahvel

Vahekaart **Taktika** on joonistuslaud meeskonnaplaani jaoks: paned kaardile väikesed kujud, joonistad nooli selle kohta, kuhu nad lähevad, ja vajutad esitamist, et näha, kuidas see toimub. Kasuta seda, et planeerida voor või rünnak enne mängimist. Ta jagab lõuendit, kaamerat ja [taset](levels.md) teiste vahekaartidega, aga muud mitte; plaan ei ole andmed ega joonista soojust.

## Sinu esimene plaan {#your-first-plan}

1. Ava vahekaart **Taktika**. Vali **Mäng** (näiteks Counter-Strike 2) ja Valorantile vajuta **Laadi Valoranti kaardid** ning vali **Kaart**. Või laadi enne [tase](levels.md).
2. Vali **Pool** (see määrab värvi) ja vajuta **Pealtvaade**.
3. Vali **Koht**, vali kujund jaotisest **Kujud** (kasuta **Otsi kujusid**, et leida) ja klõpsa kaardil. Pane kaks-kolm.
4. Vali **Nool**, klõpsa kujul, klõpsa teekonnal, kuhu see peaks minema, ja vajuta **Enter**, et nool lõpetada.
5. Vajuta vaate all **+**, et lisada samm 2. Iga kuju algab sealt, kus tema nool lõppes. Joonista seal rohkem nooli.
6. Vajuta **▶** (või `K`), et esitada plaan näidatud sammust lõpuni.
7. Nimeta plaan jaotises **Plaani nimi** ja vajuta **Salvesta**.

![Taktikavahekaart pealtvaates: mäng, pooled ja tööriistad vasakul, kolm kuju Nihuta-nooltega, suitsu Vise-kaar, Ala ja sammud allservas](../assets/img/en/tactics.webp)

## Plaani alustamine {#starting-a-plan}

| Juhtnupp | Mida ta teeb |
|---|---|
| **Mäng** | Valib pooled ja kujud, mida paletis pakutakse: Counter-Strike 2 (T, CT; mängijad ja utiliit), Valorant (Rünnak, Kaitse; mängijad ja üldised võimed), Battlefield, Squad, Arma (jalavägi, maismaasõidukid, õhusõidukid, paadid), DCS / War Thunder / IL-2 (reaktiivlennukid, propellerlennukid, helikopterid, õhutõrje, maismaa, laevad, relvad) ja Muu. Plaan, millel on juba kujud, säilitab oma pooled, kui mäng muutub. |
| **Plaani nimi** | Nimi, mille all plaan salvestatakse. |
| **Kaart**, **Laadi Valoranti kaardid** | Kui on valitud Valorant: **Laadi Valoranti kaardid** toob kaartide loendi saidilt [valorant-api.com](https://valorant-api.com); **Kaart** paneb valitud kaardi miniatuurkaardi tasemeks, kadreeritud ülevalt. Pilt laaditakse alles valimisel ja seda ei kaasata kunagi. Riot'i teade näidatakse, kui see on ekraanil (vt allpool). |
| **Pool** | Pool, millele järgmine kuju, nool või ala kuulub; see võtab poole värvi. |

Taseme puudumisel on laud lame maapinnatasand. Laadi tase jaotises **Tase**, et planeerida päris kaardil: CS2 tööriistaga eksporditud CS2 kaart, teegist tase või kaardipilt.

## Tööriistad {#tools}

| Tööriist | Klõps | Märkused |
|---|---|---|
| **Vali** | Kuju, teepunkt, nool, ala või märkus valib selle. | Shift+klõps lisab või eemaldab; Shift+lohistus joonistab kasti, mille sees valida. Valikul on teisenduse juhik (vt allpool); `Delete` või `Backspace` eemaldab. `M` liigutab valitud kuju järgmise klõpsuni. |
| **Koht** | Paneb valitud kuju maha. | Kuju valitakse paletist **Kujud** (koos **Otsi kujusid**). Kui midagi pole valitud, pöörab `R` järgmist kuju 15° võrra enne paigutamist (`Shift+R` vastupidi). |
| **Nool** | Iga klõps lisab punkti; Enter, topeltklõps või parem klõps lõpetab, Esc loobub. | **Nihuta**, **Rünnak** (laiem ots) või **Jälgimine** (õhuke joon silmade kõrgusel). Kujult alanud nool on selle kuju marsruut selles sammus: esitamisel kuju käib seda mööda ja järgmine samm algab seal, kus see lõppes. |
| **Vise** | Viskaja, siis koht, kuhu see maandub. | Katkendlik kaar ühest teiseni, ja valitud utiliit (suits, välk, molotov jne) ilmub sinna, kus ta maandub, ja jääb sellest sammust alates. |
| **Ala** | Keskpunkt, siis serv. | Ketas pooli värvis. |
| **Märkus** | Koht, kuhu märkus läheb; küsib selle teksti. | Näidatakse nõelana ja tema tekst selle kohal. |
| **Kustuta** | Kuju, nool, ala või märkus. | Eemaldab selle sellest sammust alates; esimesel sammul eemaldab täielikult. |

**Tagasivõtmine** ja **Uuesti tegemine** (`Ctrl+Z`; `Ctrl+Y` või `Ctrl+Shift+Z`) liiguvad läbi iga muudatuse. Plaani all olev rida näitab, mitu kuju, nool ja sammu tal on. **Pealtvaade** vaatab otse alla (ortograafiline), **3D-vaade** läheb tagasi perspektiivi, **Kaader** sobitab plaani või, kui plaan on tühi, taseme.

**Kujude suurus** skaleerib kõiki laua kujusid; 1× on päris suurus, mis kõrgelt vaadatuna on inimese puhul mõni piksel.

## Liigutamine, pööramine ja skaleerimine {#moving-turning-and-scaling}

Kõike laual saab liigutada nagu 3D-redaktoris: kujud, utiliit, markerid, üksikud teepunktid ja terved nooled, alad ja märkused. Valitul on oma keskel juhik:

| Režiim | Klahvid | Käepidemed |
|---|---|---|
| **Nihuta** | W (või G) | Nool igal teljel (X punane, Y roheline ja üles, Z sinine) liigub mööda seda; ruut liigub oma tasandil; keskpunkt liigub kursori all oleval tasemel. |
| **Pööra** | E (või R) | Rõngas igal teljel pöörleb selle ümber. Ühe kuju rõngad on tema enda kursi, kalde ja rulli rõngad; grupp pöördub ümber maailma telgede oma keskpunkti ümber. |
| **Skaleeri** | R (või S) | Laiendab või koondab valiku selle keskpunktist mööda telge või igas suunas; ala raadius kasvab koos sellega. |

**Klahvid** vahetavad W / E / R (Unity, Unreal) ja G / R / S (Blender) vahel; klahvid valivad režiimi ainult siis, kui midagi on valitud, muidu lendavad kaameraga. Seega `R` tähendab **Skaleerimist** klahvidega W / E / R ja **Pööramist** klahvidega G / R / S, kui midagi on valitud, ja pöörab järgmist paigutatavat kuju, kui midagi pole valitud. Kõik laua klahvid on loetletud [klaviatuuri viites](keyboard-reference.md#tactics-board). Hoia **Ctrl** all lohistades, et joondada nihe **Ruudustikule** (meetrites) või pööre **Nurgasammule**. **Joonda maapinnale** (vaikimisi sees) paneb liigutatud inimesed, sõidukid, markerid, teepunktid ja alad taseme pinnale; lennukid ja helikopterid säilitavad oma kõrguse ning lohistus mööda Y-noolt ei joondu kunagi. Käepideme lohistamine ei liiguta kunagi kaamerat. **Esc** tühistab lohistuse ja iga muudatus on üks samm Tagasivõtmises.

Teepunktid näevad välja punktidena näidatud sammu nooltel: klõpsa ühel, et see valida, lohista, et liigutada, Delete, et eemaldada. Jaotis **Valitud** näitab valiku asukohta meetrites, kuju kurssi, kallet ja rulli kraadides ning ala raadiust, igaüks sisestatav.

## Ajastus {#timing}

Kuju marsruut on ajastatud: iga lõik võtab oma pikkuse suhtes tasemega - pinnalt proovitud iga paari meetri tagant, nii et künka või trepi arvestatakse kahe punkti vahel - selle kuju liikumisrežiimi kiirusega sellel mängus, pluss mis tahes **ootamine** teepunktis. Jalavägi roomab, kükitab, kõnnib (vaikne), jookseb või sprindib; sõidukid ja paadid roomavad, liiguvad ettevaatlikult, tavaliselt või kiirustavad; lennukid ja helikopterid lendavad aeglaselt, kruiisil, lahingukiirusel või maksimumil. Režiim, mida mängul pole (CS2-l pole sprinti), võtab lähima, mis tal on. Kuidas nõlv aeglustab, sõltub mängust: CS2-s ja Valorantis loetakse ainult horisontaalset vahemaad, nagu mängudes; mil-sim'id aeglustavad jalaväge mäkke (Tobleri matkafunktsioon) ja sõidukeid kalde järgi.

Kiirused tulevad mängukaupa tabelitest koos allikatega (vt [Liikumiskiirused](tactics-speeds.md)): CS2 hoitava relva järgi, mängu relvamääratlustest; Valorant relva järgi; Battlefield, Squad, Arma ja õhumängud sõiduki tüübi ja klassi järgi. **Liigub nagu** valib kuju profiili (relv, sõiduki tüüp); **Oma (m/s)** tühistab mis tahes režiimi selle kuju jaoks. Režiimid on nimetatud nii, nagu laud need näitab: *Roomamine*, *Kükitamine*, *Kõndimine (vaikne)*, *Jooksmine*, *Sprint*; *Ettevaatlik*, *Tavaline*, *Kiirustamine*; *Aeglane*, *Kruiis*, *Lahing*, *Maksimum*.

Iga teepunkt näitab aega eelmisest ja aega plaani algusest ("+3,9 s · 0:12"). Valitud kuju marsruut loetleb iga lõigu koos režiimi, pikkuse ja ajaga, ootamise ja saabumise. **Saabumised** jaotises **Ajavõtt** paneb iga marsruudiga kuju ühele ajajoonele, esimene saabuja üleval. Lülitiga **Mängi reaalajas** (vaikimisi sees) kestab samm, kuni tema aeglaseim marsruut saabub, ja iga kuju liigub oma kiirusega; **Sekundid** on siis sammu lühim pikkus. **Taseme ühikut meetri kohta** ütleb, mis ühikutes tase on: 39,37 CS2 kaartide puhul (mängu ühikud), 1 meetrikaartide puhul.

## Võrdlus matšiandmetega {#compare-with-match-data}

**Laadi matšifailid…** loeb kaardi CS2 matšitabeleid (CS2 tööriista Parquet-failid, nii palju kui tahad; ainult vajalikud veerud, taustal); **Kasuta laaditud andmeid** võtab vaaturis laetud andmed. Seejärel:

- **Varaseim saabumine kaardil** värvib kaardi ajaga alates vooru algusest, mil mängija esimest korda iga koha jõudis - nupp **Kiireim** näitab kiireimat kõigi voorude üle, **Tüüpiline (mediaan)** keskmist vooru - roheline varajane kuni punane hiline, ühe või mõlema poole kohta. See näitab, mis on ajas võimalik.
- Valitud marsruuti võrreldakse sellega, mida mängijad sellest algusest (või vooru algusest) lõpuni saavutasid, iga lõpp on määratud raadiusega ketas: "Kiireim täheldatud 14,2 s, p10 15,0 s, mediaan 18,3 s 41 sõidu põhjal; sinu plaan 15,1 s".
- Kiirused, millega mängijad tegelikult liikusid - jooksmine, kõndimine, kükitamine, tabelite kõnnimis- ja kükitamisveergudest - m/s.

## Sammud {#steps}

Vaate all olev riba hoiab samme. Plaan algab ühega; **+** lisab ühe ja iga kuju algab seal, kus tema marsruut viimases sammus lõppes; **−** eemaldab näidatud sammu. **Sekundid** on, kui kaua näidatud samm esitamisel kestab. **▶** (K) esitab näidatud sammust lõpuni: marsruudiga kujud käivad seda mööda, järgmises sammus uude kohta liigutatud kujud libisevad sinna, ülejäänud seisavad. Kui samm on näidatud, joonistatakse iga kuju koht järgmises sammus nõrga kummituse ja viimase sammu nooled nõrgalt selle sammu all.

## Salvestamine {#saving}

Jaotis **Fail** sisaldab **Salvesta**, **Ava** ja **Tühjenda**. **Salvesta** kirjutab plaani kui `<nimi>.h3dplan.json` (lihtne JSON: pooled, sammud, kujud koos kohaga igas sammus, nooled, alad, märkused); **Ava** loeb ühe tagasi. Teist versiooni või faili, mis pole plaan, keeldutakse koos põhjusega. **Tühjenda** tühjendab plaani; Tagasivõtmine toob selle tagasi.

## Kujud {#figures}

Iga kuju ehitab vaatur ise: lihtsad kujundid tüübi avaldatud suuruseni koos omadustega, mis eristavad neid naabritest - tanki maanteerattad ja torn, õhutõrjesõiduki relvad, raketid ja radarid, lennuki tiivaplaan, saba ja mootorid, helikopteri rootorid ja tüükad-tiivad. Midagi ei võeta mängust. Mängu leiutatud disain näidatakse oma klassi üldise kujuna. Vt [Kujud](figures.md#which-figure-a-unit-gets), kuidas andmed oma kuju leiavad.

## Riot'i teade {#riots-notice}

Valorandi kaarte näidatakse Riot Gamesi "Legal Jibber Jabber" poliitika alusel, mis lubab tasuta kogukonnaprojektidel neid kasutada ja nõuab seda teadet kõikjal, kus need ilmuvad: *3DHeat on loodud Riot Gamesi "Legal Jibber Jabber" poliitika alusel, kasutades Riot Gamesile kuuluvaid varasid. Riot Games ei toeta ega sponsori seda projekti.* Laual olevad võimed on üldised kujundid, mitte Riot'i kunst.
