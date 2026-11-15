---
title: "Tabamuste analüüs (Sõidukid)"
parent: "Kordus"
nav_order: 4
lang: "et"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Tabamuste analüüs

Sakk **Sõidukid** näitab, kus üks tank, laev või sõdur tabati ja kes tabas. Seda kasutatakse selleks, et näha, millisel küljel tanki tulistatakse, või selleks, milline vaenlane kahju teeb.

## Proovi {#try-it}

1. Laadi mäng, kus on tabamusi (allpool olevast tabelist näed, millised mängud neid annavad).
2. Ava ülal sakk **Sõidukid**.
3. Jaotise **Sõiduk** all vali üksus, nt tanki tüüp. Sulgudes olev number on tabamuste arv.
4. Vaata joonist: iga märk on tabamus, asetatud sinna, kus see tabas.
5. Ava **Kes tabas**, et näha laskjaid, relvi või laskjate sõidukeid koos tabamuste, kahju, tappude ja kaugusega.

![Sõidukite sakk: demotank tabamuste märkidega ja avatud Kes tabas](../assets/img/en/hit-analysis-tank.webp)

Kui midagi pole laetud või andmetes pole sõidukite tabamusi, ütleb sakk, mis puudu on ja millist konverterit kasutada.

```
        laskja ----> o  tabamuse märk joonisel
        laskja ----> o
  [ tanki joonis ]
```

Joonisel on tabamused näidatud seal, kus andmed annavad punkti või kehaosa. Jaotus (kes tabas, millega, kui tugevasti, kui kaugelt) töötab kõigi allikate puhul.

## Mida iga allikas annab {#what-each-source-gives}

| Allikas | Punkt üksusel | Laskja | Relv | Kahju / tulemus |
|---|---|---|---|---|
| War Thunder | jah, üksuse raamis koos lasu suunaga | jah | laskja sõiduk | kriitiline, raske, moodulid hävitatud, tappev tabamus |
| CS2 | kehaosa (hitgroup) | jah | jah | kahju, soomus, järelejäänud tervis |
| World of Tanks | jah (komponendi kast, sisenemine ja väljumine) | jah | - | kahju või mitte midagi (põrkumine, ei läbi) |
| World of Warships | jah, laeva raamis | jah | tabamuse tüüp | - |
| Squad | sõidukid: jah - mõju paigutatakse sõiduki raami, lähtudes selle enda asukohast ja suunast | ei (andmed ei nimeta ühtegi) | kahju tüüp | sõiduki tervise langus sel hetkel, hävitatud |
| Squadi sõdurid | ei: tabamuse tulemused (luu ja mõjupunkt) jäävad konverteri poolt toorelt alles; read `impact` koos `hitBone`-iga loetakse kohe, kui konverter need kirjutab | | | ainult haavad ja surmad |
| Arma (OCAP, Arma 3 salvestaja) | ei: OCAP salvestab, kes kellele haavata või tappis, millega ja kui kaugelt, mitte kust | jah | jah | tabamus või tapmine, kaugus |
| Tacview ACMI | jah, kui relvaobjekt lõpeb 30 m piires üksusest (mitte selle käivitajast): selle viimane koht üksuse raamis (suund, kallak, rull), tulles sinna, kuhu see lendas | relvaobjekti `Parent` | relvaobjekti nimi või Timeouti AmmoType | Timeouti Outcome, `Health` langused, `Destroyed`; ilma relvata tapmine või kahju ilma punktita |
| IL-2 telemeetria (Watcher) | jah: sündmused `hit` / `damage` kannavad punkti mängija enda lennuki raamis (võetud nii, et x on ees, y üleval, z paremal) | ei | ei | jõud |
| Dota 2 | ei: lahingulogil pole kangelase asukohta | ründav üksus | oskus võiese (puudub: rünnak) | kahju, kangelase surm |
| Battlefield 6 (GameCapture) | ei: salvestus loeb tapmisteadet (tapmised, surmad, pealelöögi lipp), mitte tabamusi | | | |
| DCS / muud Watcheri otseallikad | tabamuse sündmusi ei ole peale selle, mis nende Tacview salvestistes on | | | |

Kui ühelgi üksuse tabamusel pole punkti, ei näita joonis märke ja jaotis **Kes tabas** avaneb ise: laskja, relva või laskja sõiduki järgi, igaühel tabamused, kahju ja tapmised, samuti mediaan- ja kõige kaugem kaugus.

## Piira alaga {#restrict-to-an-area}

Jaotis **Ala** piirab analüüsi tabamustega, mis juhtusid kaardil kindlas kohas.

1. Vajuta **Joonista ristkülik** või **Joonista hulknurk** ja joonista 3D maapinnale või taktikalisele kaardile.
2. Vali **Ohver sees** (loe tabamus, kui tabatud üksus oli alal) või **Laskja sees** (kui tulistaja oli alal).
3. Vajuta **Kasuta filtrina**. Märgid näitavad "{n} of {total} hits in the area" - see tähendab, mitu tabamust on alal.
4. **Lähtesta ala** eemaldab kõik alad.

Iga ala on [maht](volumes.md), seega samad kujud filtreerivad ka soojuskaarti ja taasesitust. Ala võib kaasata või välistada (välistav ala jätab oma tabamused välja ja näitab "{n} of {total} hits outside the area"). Iga ala kuvatakse märgina, millel on näidatud, mitu üksuse tabamust seal oli; märgi × eemaldab selle. Arvud, joonis, jaotus ja filtrite loendid järgivad seda kõike.

Tabamuse kohad: rida, millest tabamus tuli, sisaldab ühe osapoole (kannatanu, kui teda haavati või tabati; laskja, kui lasti) asukohta; teise osapoole koht on selle üksuse enda proov, mis on ajaliselt kõige lähem (5 s piires). Tabamus, mille osapoole asukoht pole teada, jäetakse ala filtri ajal välja ja paneel ütleb, mitu neid on ("Left out, no known place").

## Arendajatele {#for-developers}

Iga konverter võib lisada tabamusi: kannatanu rida (`hit`, `impact`, `hurt`, `wounded`) koos `hitBone`-iga (skeleti luu, Arma valik, Reforgeri tabamustsoon - kaardistatud pea, rinna, kõhu, käte ja jalgadena) või `hitLocalX/Y/Z`-ga (meetrites, x ees, y üleval, z paremal), `other` on laskja ja `damage`.
