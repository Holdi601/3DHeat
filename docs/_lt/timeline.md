---
title: "Laiko juosta ir atkūrimas"
nav_order: 5
lang: "lt"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Laiko juosta ir atkūrimas

Juosta po paveikslėliu veikia kaip vaizdo grotuvas: duomenis galite leisti kaip filmą, sustabdyti, peršokti į kitą vietą ir keisti greitį.

![Laiko juosta: 1 Visi/Groti, 2 valdymo mygtukai, 3 laikrodis, 4 Greitis, 5 Istorija, su Langu ir 30 s Intervalu](../assets/img/en/timeline-bar.webp)

Juosta po vaizdu yra laiko juosta ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Ji nusprendžia, kurios eilutės matomos bet kuriuo metu. Jai reikia laiko stulpelio; be jo visa juosta išjungiama, vaizdas lieka režime **Visi**, o šoninėje juostoje rodoma: *Šiuose duomenyse nėra laiko stulpelio — laiko juosta išjungta, visi duomenų taškai rodomi vienu metu.*

## Visi ir Groti {#all-and-play}

Yra du pagrindiniai režimai, nes jie atsako į skirtingus klausimus.

- **Visi** (numatytasis kiekvieno įkėlimo metu) visiškai ignoruoja atkūrimo galvutę ir rodo visas eilutes, praeinančias filtrus. Tai rodinys „kur tai vyksta“, ir jis nėra tas pats, kas patempti iki pabaigos. Slankiklis išjungtas, o laikrodis rodo `visi · <span> duomenų`.
- **Groti** paleidžia duomenis kaip laiko kadrą. Atsiranda slankiklis, valdymo mygtukai ir istorijos nustatymai.

Pasirinkus **Visi**, atkūrimas taip pat sustoja.

## Valdikliai {#the-controls}

| Valdiklis | Numatytoji | Reiškia |
|---|---|---|
| Slankiklis | pradžia | Atkūrimo galvutė. Tempkite, kad peršoktumėte; 20 000 žingsnių per visą intervalą. |
| **Visi** / **Groti** | Visi | Žr. aukščiau. |
| ▶ / ❚❚ | sustabdyta | Paleisti arba sustabdyti; taip pat `K`. |
| ◀ **Groti atgal (J)** | | Leidžia duomenis atvirkščiai. Rodoma tik režime **Figūrų sutapdinimas**; ten veikia ir klavišas `J` (žr. [Klaviatūra](#keyboard)). |
| ⏮ | | Grįžti į intervalo pradžią. |
| Laikrodis | | `praėjęs / iš viso` kaip `mm:ss.s` (arba `h:mm:ss`) ir, kai laiko stulpelis yra absoliutus laiko žymuo, atkūrimo galvutės paros laikas kaip `HH:MM:SSZ` (UTC). |
| **Greitis** | 1× | Duomenų sekundžių per tikrą sekundę. Meniu yra 17 žingsnių nuo 0,01× iki 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800) ir **Pasirinktinis…**: įveskite bet kokį greitį nuo 0,001× iki 3600× (pavyzdžiui, 0,3 arba 12) ir paspauskite Enter; Esc palieka dabartinį greitį. Paskutinis greitis įsimenamas kitam apsilankymui (žr. [Išsaugoti nustatymai](ref-settings-storage.md)). |
| **Istorija** | Kaupiamasis | Kas laikoma matomu prie atkūrimo galvutės: *Kaupiamasis*, *Langas* arba *Gyvavimo trukmė* (žemiau). |
| **Intervalas** (Langas; linijų režime – ir Gyvavimo trukmė) | 30 s | Lango, kuris baigiasi prie atkūrimo galvutės, ilgis; ne mažiau nei 0,01 s. [Linijų šiluma](line-heat.md#playback) tai yra uodegos ilgis. |
| **Atsarginė trukmė** (tik Gyvavimo trukmė, ne linijų režime) | 10 s | Kiek laiko matomas duomenų taškas, kurio asmuo neturi kito mėginio. |
| **Blėsimas** (tik Gyvavimo trukmė, ne linijų režime) | 0,4 | Kiekvieno duomenų taško gyvavimo dalis, skirta išblėsti, 0–1. |
| **Kartoti** | įjungta | Pasibaigus pradeda iš naujo; išjungus, sustoja pabaigoje. |
| Dešinė pusė | | Duomenų rinkinio pavadinimas. |

**Intervalas** yra duomenų rinkinio laiko trukmė – arba, [figūrų sutapdinime](box-replay.md) pasirinkus sesiją, tos sesijos trukmė.

## Istorija {#history}

Režime Groti:

- **Kaupiamasis** – viskas nuo intervalo pradžios iki atkūrimo galvutės. Šiluma kaupiasi, kol leidžiama.
- **Langas** – fiksuotas istorijos ruožas, baigiantis prie atkūrimo galvutės (*Intervalas*).
- **Gyvavimo trukmė** – kiekvienas duomenų taškas gyvena iki **to paties asmens kito mėginio** (tos pačios sesijos), todėl kiekvienu momentu aktuali tiksliai viena kiekvieno asmens pozicija. Duomenų taškas, kurio asmuo daugiau nepasirodo – mirtis, atsijungimas, žurnalo pabaiga – neturi kito mėginio ir gyvena *Atsarginę trukmę*, o ne dingsta iš karto ar išlieka amžinai. Duomenų taškai **išblėsta** per paskutinę savo gyvavimo *Blėsimo* dalį, o ne išnyksta staiga: kai kiekvienas asmuo turi vieną gyvą mėginį, duomenų taškui dingstant tarp dviejų kadrų, visas laukas mirgėtų mėginių dažniu. *Blėsimas* 0 grąžina staigų nutraukimą.

Gyvavimo trukmei reikia ir asmens stulpelio, ir laiko stulpelio; be asmens stulpelio istorija įkėlimo metu grįžta prie Kaupiamojo. [Linijų šiluma](line-heat.md#playback) istorija nustato, kaip ilgai matoma maršruto uodega; [figūrų sutapdinime](box-replay.md) *Atsarginė trukmė* yra tiek, kiek asmuo be tolesnių mėginių vis dar laikomas.

## Atkūrimo elgsena {#playback-behaviour}

Iš kadrų ciklo ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Atkūrimo galvutė juda per *kadro laiką × greitį*. Kadro laikas ribojamas 0,1 s, todėl perjungus skirtukus galvutė neperšoka.
- Paspaudus groti intervalo pabaigoje, pradedama nuo pradžios, kaip medijos grotuve. Kiekvieno įkėlimo metu galvutė padedama į pradžią, todėl pirmas paspaudimas paleidžia.
- Intervalo pabaigoje atkūrimo galvutė grįžta į pradžią (Kartoti įjungta) arba ten sustoja ir atkūrimas baigiasi (Kartoti išjungta).
- Slankiklis kiekvieną kadrą tiesiogiai skaito variklio atkūrimo galvutę; programos būsena atnaujinama peršokant, paleidžiant, sustabdant ir kartojant.
- Pasirinkus sesiją sesijų parinkiklyje, peršokama į tos sesijos pradžią.

## Kodėl atkūrimas sklandus ir pigus {#why-playback-is-smooth-and-cheap}

Eilutės saugomos surikiuotos pagal laiką, todėl laiko langas – tai du dvejetainiai paieškos žingsniai laiko stulpelyje: poslinkis atkūrimo galvutės perkelia du sveikuosius skaičius ir nepaliečia nė vienos eilutės, o atkūrimo kaina priklauso nuo eilučių skaičiaus lange, o ne nuo viso duomenų rinkinio dydžio.

Kaip šiluma išlieka stabili, kai langas juda, priklauso nuo istorijos ([Kaupimas](accumulation.md)):

- **Kaupiamasis** tik didėja, todėl kiekvienas kadras prideda tik tas eilutes, kurios tapo matomos nuo paskutinio kadro, pilnu svoriu. Laukas kaupiasi monotoniškai, o sustabdymas nieko nekeičia, nes nebėra ko atvykti. (Vietoj to iš naujo įvertinus, kiekvienas kadras apšviestų kitą atsitiktinį pogrupį, o paskui jį išblėsintų, ir tai atrodytų kaip sprogimai, kurie užsiliepsnoja ir dingsta.)
- **Langas** ir **Gyvavimo trukmė** tikrai keičiasi kiekvieną kadrą ir yra įvertinami iš naujo, sumaišomi kaip slenkantis eksponentinis vidurkis (naujo kadro svoris 0,34); stabilioje būsenoje tai nešališka ir daug ramiau nei pradėti iš naujo.
- Gyvavimo trukmės režime kandidatės eilutės yra tos, kurios nuo *atkūrimo galvutė − max(ilgiausias tarpas duomenyse, Atsarginė trukmė)* iki atkūrimo galvutės; šešėliuotuvas tada atmeta kiekvieną eilutę, kurios gyvavimas baigėsi, ir taiko išblėsimą.

Perjungus tarp Visi ir Groti arba pakeitus istoriją, kaupimas pradedamas iš naujo.

## Klaviatūra {#keyboard}

| Klavišas | Veikimas |
|---|---|
| `K` | Groti / pauzė |
| `J` | Groti atgal; paspaudus dar kartą – pauzė (tik Figūrų sutapdinime) |
| `L` | Groti pirmyn; paspaudus dar kartą – pauzė (tik Figūrų sutapdinime) |

`J` ir `L` taip pat perjungia laiko juostą į **Groti**. Klavišai ignoruojami, kai fokusas yra tekstiniame laukelyje ar meniu. Lenktynių analizės skirtuke `K` valdo to skirtuko paties pakartojimą.
