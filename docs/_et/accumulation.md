---
title: "Akumulatsioon"
parent: "Renderdamise sisemine tööpõhimõte"
nav_order: 2
lang: "et"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akumulatsioon

Kui vaatleja ei suuda ühes kaadris joonistada kõiki punkte, joonistab ta osa neist, siis veel osa ja liidab pildid kokku, kui sa paigal seisad. Pilt muutub selgemaks, nagu foto ilmub välja. Kaamera liigutamine alustab otsast. Statistika kattekihi rida **Katvus** näitab, kui kaugel see on.

![Statistika kattekiht: Katvus näitab protsenti, kui pilt areneb, ja *täpne*, kui pilt on valmis](../assets/img/en/performance-stats-overlay.webp)

## Arendajatele {#for-developers}

Kui üks kaader ei suuda joonistada kõiki ridu, joonistab ta valimi ja kaalub selle suuremaks. Pilt on siis moonutamata, kuid müraga hinnang. **Akumulatsioon** ühendab järjestikused kaadrid, nii et hinnang läheneb täpsele vastusele, kui miski ei muutu. Igal kaadril valitakse üks viiest režiimist ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)). Viimati kasutatud režiim on `engine.live.accumMode`-is.

| Režiim | Millal | Mis juhtub akumulaatoriga |
|---|---|---|
| **reset** | kaamera liikus, midagi, mis väljakut muudab, muutus, täiustamine on välja lülitatud, kasvav aken algab (esituse esimene kaader, pärast kerimist) või mängitud joonte soojus liikus | Asendatakse selle kaadri hinnanguga. |
| **extend** | **Kumulatiivne** aken, mis kasvas ainult viimasest kaadrist saadik | See kaader joonistab ainult read, mis just nähtavaks said, täies kaalus, ja liidab need juurde. Midagi ei vaibu. |
| **ema** | liikuv aken (**Aken**, **Eluiga**) liikus | `acc = acc × (1 - 0,34) + kaader × 0,34`, eksponentsiaalne liikuv keskmine umbes kolme kaadri ulatuses. |
| **mean** | midagi ei muutunud ja hinnang pole täielik | `acc = acc × (1 - 1/n) + kaader × 1/n` *n*-ndal kaadril: jooksev keskmine. |
| **skip** (ootel) | läheneb lõpule ja midagi ei muutunud | Midagi ei joonistata; kaader ainult komponeeritakse uuesti. |

### Miks igaüks {#why-each}

- **Jooksev keskmine, mitte summa.** Puhvri korrutamine väärtusega 1 - 1/n ja uue kaadri 1/n liitmine on algebraliselt sama, mis summeerimine ja jagamine *n*-ga lõpus. Puhver hoiab aga alati ühe välja väärtuse. Summa jõuaks *n*-kordse väljani, ja 16-bitisel sihtpinnal jõuaks see küllastuda väärtuseni 65 504. Kui jagaja kasvaks edasi, tuhmuks paigal seisev vaade, mida kauem ta seisab. Liikuv kaamera, mis lähtestub igal kaadril, näeks seevastu täiesti õige välja. Suitsutestide kogum kontrollib, et 16 ühendatud kaadrit annavad täpselt 1,00 korda selle, mis ühe kaadriga.
- **Laienda kumulatiivse esituse jaoks.** Juba kogunenud read on endiselt nähtavad, seega kaader vajab ainult sekundi murdosa, mis just saabus. See mahub ühte kaadrisse, nii et see läheb täpselt sisse. Uuesti hindamine süttiks igal kaadril teise juhusliku alamhulga, mis vilgub ja kaob, ning paus täidaks pilti edasi. Kontroll näitab, et kogusumma kasvab esituse ajal monotoonselt, ja jääb 2,5 sekundi pausi ajal 0,02% piires.
- **Liikuv keskmine liikuvate akende jaoks.** Need muutuvad tõesti igal kaadril. Fikseeritud segamiskaal jälgib liikuvat akent (kõigi kaadrite keskmine alates esituse algusest jääks mängupea taha) ja on palju rahulikum kui otsast alustamine.
- **Lähtesta mängitud joonte jaoks.** Joonesoojuse otsad liiguvad igal kaadril; liikuv keskmine venitaks need triibudeks. Seetõttu joonistatakse iga kaader tervikuna ja sabaliikme hääbumine on pildi enda oma.
- **Osalised kaadrid lähevad läbi vahepealse sihtpinna.** Kaader, mis ühendatakse osalise kaaluga, pritsitakse eraldi sihtpinda nullist ja segatakse seejärel akumulaatorisse. Otse 1/n kaaluga pritsimisel lisaks iga sprait oma osa, mis on 1/n suurus kogusummast, millega ta liitub. Pool-ujukomaga (half-float) sihtpind ümardab selle ära, kõige rohkem seal, kus punkte on kõige tihedamalt ([Pool-ujukomaga akumulatsioon](half-float-accumulation.md)).

### Koondumine {#convergence}

Iga kaadri plaan teab, mitu kandidaatrida on ja mitu neist esitatakse. Seega on kaadrite arv, mis katab kõik read, ⌈kandidaadid / esitatud⌉. Kui nii palju kaadrit on ühendatud, on vaade **koondunud**: statistika kattekihi rida *Katvus* muutub protsendist sõnaks *täpne* ja edasised kaadrid on ootel. Kui valik **Joonista igas kaadris kõik read** on sisse lülitatud (vaikimisi), katab üks kaader tavaliselt kõik, seega koondumine on kohe. Progressiivne mehhanism on vajalik ainult siis, kui aknas on rohkem ridu, kui üks joonistusplaan kanda suudab (umbes 67 miljonit).

### Mis hindamist taaskäivitab {#what-restarts-it}

Seaded jagunevad kolme rühma, sõltuvalt sellest, mida akumuleeritud puhver pärast nende muutmist veel tähendab:

| Rühm | Muudatused | Mõju |
|---|---|---|
| **Geomeetria** - millised read panustavad ja kui palju | vaaterežiim; joonte marsruudid; spraidi raadius, keskpunkt ja servaintensiivsus, sumbumine, sujuv skaala, kõver, piksli piirangud, lamestamine; kauguse järgi kärpimine lähedal, kaugel ja tasapinnaliselt; varjestus ja peitmine maastiku taha; lõige; kanvase suurus; soojuse eraldusvõime; rühmade nähtavus ja märgid; erinevuse jaotus; Kõik / Mäng; ajalugu; veergude filtrid ja üksuste valik; pool-ujukomaga võimendus | Lähtestamine. |
| **Aken** - ajavahemik | mängupea liikumine; Eluea varuväärtus ja hääbumine | Laienda (kumulatiivne) või liikuv keskmine (liikuv aken). |
| **Komponeerimine** - ainult värvimine | küllastus, tiheduse vastus, minimaalne soojus, värviskaalad; level lõigatakse; ruudustik ja teljed; kasti esituse seaded ja seanss; teravussügavus | Joonistatakse uuesti, soojust ei puudutata. |

Kaamera liigutamine lähtestab alati. Seega on küllastuse või skaala lohistamine tasuta, aga spraidi raadiuse lohistamine taaskäivitab koondumise igal sammul.
