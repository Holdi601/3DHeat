---
title: "Pataikymų analizė (Technikos skirtukas)"
parent: "Pakartojimas"
nav_order: 4
lang: "lt"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Pataikymų analizė

Skirtukas **Technika** rodo, kur buvo pataikyta į vieną tanką, laivą ar karį ir kas pataikė. Naudokite jį, kad pamatytumėte, kuri tanko pusė gaunama į šūvius, ar kuris priešas daro žalą.

## Išbandykite {#try-it}

1. Įkelkite rungtynes, kuriose yra pataikymų (žemiau lentelėje nurodyta, kurie žaidimai juos duoda).
2. Viršuje atidarykite skirtuką **Technika**.
3. Skiltyje **Technika** pasirinkite vienetą, pavyzdžiui, tanko tipą. Skaičius skliausteliuose rodo, kiek pataikymų jis gavo.
4. Skaitykite figūrą: kiekviena žymė yra pataikymas, padėtas ten, kur jis pataikė.
5. Atidarykite **Kas pataikė**, kad pamatytumėte šaulius, ginklus ar šaulių technikas su pataikymais, žala, nužudymais ir atstumu.

![Skirtukas Technika: demonstracinis tankas su pataikymų žymėmis ir atidarytas Kas pataikė](../assets/img/en/hit-analysis-tank.webp)

Jei nieko neįkelta arba duomenyse nėra pataikymų į techniką, skirtukas parodo, kas trūksta ir kurį konverterį naudoti.

```
        šaulys ----> o  pataikymo žyma ant figūros
        šaulys ----> o
  [ tanko figūra ]
```

Figūra rodo pataikymus, kur duomenys pateikia tašką ar kūno dalį. Išskaidymas (kas pataikė, kuo, kaip stipriai, iš kokio atstumo) veikia visiems šaltiniams.

## Ką duoda kiekvienas šaltinis {#what-each-source-gives}

| Šaltinis | Taškas ant vieneto | Šaulys | Ginklas | Žala / rezultatas |
|---|---|---|---|---|
| War Thunder | taip, vieneto rėmelyje, su šūvio kryptimi | taip | šaulio technika | kritinis, sunkus, sunaikinti moduliai, mirtinas šūvis |
| CS2 | kūno dalis (hitgroup) | taip | taip | žala, šarvai, likusi sveikata |
| World of Tanks | taip (komponento dėžutė, įėjimas ir išėjimas) | taip | - | žala arba jokios (atšokimas, neprasiskverbimas) |
| World of Warships | taip, laivo rėmelyje | taip | pataikymo tipas | - |
| Squad | technika: taip – smūgis įdėtas į technikos rėmelį pagal jos pačios padėtį ir kryptį | ne (duomenys jo nenurodo) | žalos tipas | technikos sveikatos kritimas tuo momentu, sunaikinta |
| Squad kariai | ne: pataikymų rezultatai (kaulas ir smūgio taškas) konverterio paliekami neapdoroti; eilutės `impact` su `hitBone` nuskaitomos, kai tik jas įrašo | | | tik sužeidimai ir mirtys |
| Arma (OCAP, Arma 3 įrašytuvas) | ne: OCAP įrašo, kas kam pataikė ar nužudė, kuo ir iš kokio atstumo, bet ne kur | taip | taip | pataikymas ar nužudymas, atstumas |
| Tacview ACMI | taip, kai ginklo objektas baigiasi per 30 m nuo vieneto (ne jo paleidimo įrenginys): paskutinė jo vieta vieneto rėmelyje (kryptis, polinkis, ritinys), atvykstant tuo keliu, kuriuo jis skrido | ginklo `Parent` | ginklo pavadinimas arba Timeout AmmoType | Timeout Outcome, `Health` kritimai, `Destroyed`; be ginklo – nužudymas ar žala be taško |
| IL-2 telemetrija (Watcher) | taip: `hit` / `damage` įvykiai neša tašką žaidėjo lėktuvo rėmelyje (laikoma x į priekį, y aukštyn, z į dešinę) | ne | ne | jėga |
| Dota 2 | ne: kovos žurnale nėra vietos herojui | atakuojantis vienetas | gebėjimas ar daiktas (jei nėra – atakos) | žala, herojaus mirtis |
| Battlefield 6 (GameCapture) | ne: įrašas skaito žudynių srautą (nužudymai, mirtys, galvos vėliavėlė), o ne pataikymus | | | |
| DCS / kiti Watcher gyvi šaltiniai | jokių pataikymo įvykių daugiau nei tai, ką laiko jų Tacview įrašai | | | |

Kai nė vienas vieneto pataikymas neturi taško, figūra nerodo žymių, o **Kas pataikė** išskaidymas atsiveria savaime: pagal šaulį, ginklą ar šaulio techniką, kiekvienas su savo pataikymais, žala ir nužudymais, bei mediana ir toliausias atstumas.

## Apriboti iki srities {#restrict-to-an-area}

Skiltis **Sritis** apriboja analizę pataikymais, kurie įvyko vietoje žemėlapyje.

1. Paspauskite **Brėžti stačiakampį** arba **Brėžti daugiakampį** ir piešite ant 3D žemės arba taktinio žemėlapio.
2. Pasirinkite **Auka viduje** (skaičiuoti pataikymą, kai pataikyto vieneto pataikymas buvo srityje) arba **Šaulys viduje** (kai šaudęs buvo srityje).
3. Paspauskite **Naudoti kaip filtrą**. Žetonai rodo „{n} iš {total} pataikymų srityje“.
4. **Atstatyti sritį** pašalina visas sritis.

Kiekviena sritis yra [tūris](volumes.md), todėl tos pačios formos filtruoja ir šilumos žemėlapį, ir pakartojimą. Sritis gali įtraukti arba išskirti (išskiriančioji srities pataikymus paslepia, rodoma „{n} iš {total} pataikymų už srities ribų“). Kiekviena sritis rodoma kaip žetonas su tuo, kiek vieneto pataikymų buvo joje; žetono × pašalina ją. Skaičiai, figūra, išskaidymas ir filtro sąrašai seka paskui.

Pataikymo vietos: eilutė, iš kurios jis atėjo, laiko vienos pusės vietą (nukentėjusiojo – sužeidimui ar smūgiui, šaulio – šūviui); kitos pusės vieta yra to vieneto paties mėginys, artimiausias laikui (per 5 s). Pataikymas, kurio pusės vieta nežinoma, paliekamas, kol filtruoja sritis, o skydelis nurodo, kiek jų ("Praleista, vieta nežinoma").

## Kūrėjams {#for-developers}

Bet koks konverteris gali pridėti pataikymų: nukentėjusiojo eilutę (`hit`, `impact`, `hurt`, `wounded`) su `hitBone` (skeleto kaulas, Arma pasirinkimas, Reforger pataikymo zona – susieta su galva, krūtine, pilvu, rankomis ir kojomis) arba `hitLocalX/Y/Z` (metrais, x į priekį, y aukštyn, z į dešinę), su `other` šauliu ir `damage`.
