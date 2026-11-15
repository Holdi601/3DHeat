---
title: "Kaupimas"
parent: "Atvaizdavimo vidus"
nav_order: 2
lang: "lt"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Kaupimas

Kai peržiūra negali nupiešti visų taškų viename kadre, ji piešia vieną jų dalį, paskui kitą dalį, ir sudeda paveikslėlius, kol stovite vietoje. Vaizdas darosi ryškesnis, kaip fotografija, kuri ryškėja. Judinant kamerą viskas prasideda iš naujo. Statistikos perdangos eilutė **Aprėptis** rodo, kiek toli tai nuėjo.

![Statistikos perdanga: Aprėptis rodo procentus, kol vaizdas ryškėja, ir *tikslu*, kai jis baigtas](../assets/img/en/performance-stats-overlay.webp)

## Kūrėjams {#for-developers}

Kai vienas kadras negali nupiešti visų eilučių, jis nupiešia imtį ir ją sveria; tada vaizdas yra nešališkas, bet triukšmingas įvertinimas. **Kaupimas** sujungia gretimus kadrus, kad įvertinimas, kol nieko nekeičiama, konverguotų į tikslų atsakymą. Kiekvienas kadras pasirenka vieną iš penkių režimų ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); paskutinis naudotas yra `engine.live.accumMode`.

| Režimas | Kada | Kas nutinka kaupikliui |
|---|---|---|
| **reset** | kamera pajudėjo, kažkas, kas keičia lauką, pasikeitė, laipsniškas tikslinimas išjungtas, auga langas (pirmas grojimo kadras, po peršokimo), arba grojamų linijų šiluma pasislinko | Pakeičiamas šio kadro įvertinimu. |
| **extend** | **Kaupiamasis** langas, kuris nuo paskutinio kadro tik išaugo | Šis kadras nupiešia tik eilutes, kurios ką tik tapo matomos, pilnu svoriu, ir jas prideda. Nieko nenyksta. |
| **ema** | slankusis langas (**Langas**, **Gyvavimo trukmė**) pasislinko | `acc = acc × (1 - 0,34) + frame × 0,34` – eksponentinis slenkantis vidurkis maždaug per tris kadrus. |
| **mean** | niekas nepasikeitė ir įvertinimas nebaigtas | `acc = acc × (1 - 1/n) + frame × 1/n` *n*-tajame kadre: einamasis vidurkis. |
| **skip** (laisva) | konverguota ir niekas nepasikeitė | Nieko nepiešiama; kadras tik sudedamas iš naujo. |

### Kodėl kiekvienas {#why-each}

- **Einamasis vidurkis, o ne suma.** Buferio mastelio keitimas į 1 - 1/n ir pridėjimas 1/n naujo kadro algebriškai yra tas pats, kas sudėti ir galiausiai padalyti iš *n*, bet buferis visada laiko vieno lauko vertę. Suma pasiekia *n* kartų lauko vertę, o 16 bitų tikslo atveju prisotinama ties 65 504; su vis augančiu daliklių sustabdytas vaizdas tada blankdavo, kuo ilgiau stovėtų – o judanti kamera, kuri kiekvieną kadrą pradeda iš naujo, atrodytų visiškai teisingai. Dūmų testų rinkinys tvirtina, kad 16 sujungtų kadrų turi 1,00× to, ką turi vienas kadras.
- **Extend kaupiamajam atkūrimui.** Jau sukauptos eilutės vis dar matomos, todėl kadrui reikia tik ką atkeliavusios sekundės dalies – ji telpa viename kadre, todėl įtraukiama tiksliai. Perskaičiavus iš naujo kiekvieną kadrą būtų įjungtas kitas atsitiktinis poaibis ir jis blankdavo, todėl atrodytų, kad šuoliai įsiplieskia ir dingsta, o sustabdytas kadras toliau pildytųsi. Rinkinys tvirtina, kad suma grojimo metu auga monotoniškai, o sustabdyta 2,5 s išlieka 0,02 % ribose.
- **Slenkantis vidurkis slankiems langams.** Tie tikrai keičiasi kiekvieną kadrą. Fiksuotas mišinio svoris seka judantį langą (visų kadrų nuo grojimo pradžios vidurkis atsiliktų nuo grojimo žymeklio) ir yra daug ramesnis nei pradėti iš naujo.
- **Reset grojamoms linijoms.** Linijų šiluma kiekvieną kadrą juda; slenkantis vidurkis kiekvieną jų paverstų ruožu, todėl kiekvienas kadras piešiamas visas, o uodegos blukimas yra paties vaizdo.
- **Dalinius kadrus eina per laikinąjį tikslą.** Kadras, sujungtas dalies pilnojo svorio, nupiešiamas į atskirą tikslą nuo nulio ir tada sumaišomas į kaupiklį, o ne tiesiogiai nupiešiamas 1/n svoriu. Tiesiogiai kiekvienas spraitas būtų pridėtas 1/n dydžio nuo sumos, prie kurios jungiasi, o pusiau tikslus slankiojo kablelio tikslas tai suapvalina – blogiausia ten, kur tankiausia ([Pusiau tikslusis kaupimas](half-float-accumulation.md)).

### Konvergavimas {#convergence}

Kiekvieno kadro planas žino, kiek yra kandidatinių eilučių ir kiek jų pateikia, todėl kadrų, reikalingų aprėpti kiekvieną eilutę, skaičius yra ⌈kandidatai / pateikti⌉. Kai tiek kadrų sujungta, vaizdas yra **konverguotas**: statistikos perdangos eilutė *Aprėptis* iš procentų virsta *tiksliai*, o tolesni kadrai yra laisvi. Įjungus **Piešti kiekvieną eilutę kiekviename kadre** (numatyta), vienas kadras paprastai aprėpia viską, todėl konvergavimas yra akimirksniu, o laipsniška mechanika reikalinga tik tada, kai langas talpina daugiau eilučių, nei gali nešti vienas piešimo planas (apie 67 milijonus).

### Kas jį paleidžia iš naujo {#what-restarts-it}

Nustatymai skirstomi į tris grupes pagal tai, ką sukauptas buferis dar reiškia po to, kai jie pasikeičia:

| Grupė | Keičia | Poveikis |
|---|---|---|
| **Geometrija** – kurios eilutės prisideda ir kiek | rodinio režimas; linijų maršrutai; spraito spindulys, centro ir krašto intensyvumas, nuslopimas, glotni skalė, kreivė, pikselių ribos, išlyginimas; atrinkimas pagal atstumą artimas, tolimas ir plokštuminis; užslėpimas ir slėpimas už reljefo; pjūvis; drobės dydis; šilumos raiška; grupių matomumas ir ženklai; skirtumo padalijimas; Viskas / Groti; istorija; stulpelių filtrai ir pasirinkimas Objektai; pusiau tikslaus kaupimo stiprinimas | Pradedama iš naujo. |
| **Langas** – laiko intervalas | grojimo žymeklio judėjimas; gyvavimo trukmės atsarginis variantas ir blukimas | Extend (kaupiamasis) arba slenkantis vidurkis (slankusis). |
| **Sudėtinis** – tik spalvinimas | sodrumas, tankio atsakas, mažiausia šiluma, spalvų skalės; lygio pjovimas; tinklelis ir ašys; dėžučių pakartojimo nustatymai ir sesija; lauko gylis | Perpiešiama, nepaliečiant šilumos. |

Rodinio judėjimas visada paleidžia iš naujo. Taigi vilkti sodrumą ar skalę nemoka nieko; vilkti spraito spindulį kiekvienu žingsniu iš naujo paleidžia konvergavimą.
