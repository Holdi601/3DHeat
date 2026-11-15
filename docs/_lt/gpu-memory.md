---
title: "GPU atminties laikymas"
parent: "Atvaizdavimo vidus"
nav_order: 5
lang: "lt"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU atminties laikymas

Grafikos kortelė turi ribotą atmintį. Jei jūsų duomenys netelpa, peržiūros programa parodo, kas telpa, ir apie tai praneša: statistikos perdangoje atsiranda gintaro spalvos eilutė **Neįkelta į atmintį** su praleistų eilučių skaičiumi. Sutrumpinti duomenys, kurie atrodo pilni, būtų blogiausia klaida, kurią gali padaryti analizės įrankis, todėl ši eilutė niekada nepaslepiama.

![Statistikos perdanga su gintaro spalvos eilute Neįkelta į atmintį](../assets/img/en/gpu-memory-not-resident.webp)

Norėdami sutalpinti daugiau, padidinkite GPU biudžetą skiltyje **Išteklių biudžetai** ir įkelkite dar kartą ([Atmintis ir biudžetai](memory-and-budgets.md#raising-the-gpu-budget)), pirmiausia susiaurinkite duomenis arba naudokite kortelę su didesne atmintimi.

## Kūrėjams {#for-developers}

### Kaip eilutės saugomos GPU {#how-rows-are-stored-on-the-gpu}

Eilutės įkeliamos vieną kartą, kai atkeliauja duomenų rinkinys, **dalimis** po 8 388 608 eilutes (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Kiekviena dalis kvantuojama pagal savo ribojantį stačiakampį ir laiko intervalą:

| Duomenys | Formatas | Baitai vienai eilutei |
|---|---|---|
| Pozicija X, Y, Z ir grupės id | keturi 16 bitų neįženklinti sveikieji (RGBA16UI WebGL2); X, Y, Z dalies ribojančiame stačiakampyje | 8 |
| Laikas ir gyvavimo trukmė (kai duomenys turi ir laiką, ir asmenį) | du 16 bitų neįženklinti sveikieji (RG16UI): laikas dalies laiko intervale; gyvavimo trukmė, kur 65 535 reiškia „nėra kito įrašo“ | 4 |

Dalių ribojantys stačiakampiai yra tai, kas daro 16 bitų pakankamus: dalis paprastai apima dalį žemėlapio, todėl kvantavimo žingsnis yra gerokai mažesnis nei centimetras kilometrus pločio žemėlapyje – daug mažiau nei realios telemetrijos triukšmas. Grupės id, esantis ketvirtame kanale, yra nemokamas – todėl grupių gali būti daugiausia 4 096 ([Grupės](sessions-persons-groups.md#limits)).

WebGL2 kiekviena dalis yra tekstūra 8 192 texelių pločio, papildyta iki visų tekstūros eilučių; eilutės pasiekiamos per `gl_VertexID` per kiekvieno kadro bloko indeksų tekstūrą. WebGPU jos yra saugojimo buferiai.

Papildoma GPU atmintis vienai eilutei, skiriama pagal naudojimą:

- kiekvienas aktyvus stulpelio [filtras](filters.md): 4 baitai eilutei (32 bitų slankiojo kablelio reikšmės arba kategorijų id), įkeliami kiekvienai daliai, kai filtras pirmą kartą naudojamas;
- [linijų šiluma](line-heat.md): 8 baitai eilutei (kiekvieno segmento pradžia, kvantuota duomenų ribojančiame stačiakampyje, ir jo žymės), kol įjungtas linijų režimas.

Be to, atvaizdavimo tikslai: scenos spalva ir gylis, šilumos tikslas ir jo laikinasis dvynys (keturi kanalai [Komandų šilumoje](team-heat.md)), gylio sluoksniai [užslėpimui](depth-and-culling.md) ir lygio geometrija.

### Biudžetas įvykdomas įkeliant {#the-budget-is-enforced-at-upload}

WebGL priima skyrimus, kurių negali aptarnauti, ir tada arba praranda kontekstą, arba pereina prie sistemos atminties su pražūtinga kaina, todėl GPU biudžetas įvykdomas, kai duomenų rinkinys įkeliamas ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- dalys įkeliamos eilės tvarka (tai yra laiko tvarka), kol telpa;
- pirmoji dalis, kuri netelpa, įkeliama **iš dalies** – tiek visų tekstūros eilučių, kiek telpa likusiame biudžete – o ne visai, todėl biudžetas, kuris neišlaiko visos dalies, vis tiek parodo kiek įmanoma, o kadangi eilutės surikiuotos laiko tvarka, parodyta dalis yra nuoseklus laiko ruožas;
- viskas po to yra **neįkelta į atmintį**.

Trūkumas nėra paslėptas: statistikos perdanga, kai jis didesnis už nulį, rodo **Neįkelta į atmintį** eilutę gintaro spalva su eilučių skaičiumi, kurios netilpo. Sutrumpintas duomenų rinkinys, kuris atrodo pilnas, yra blogiausias analizės įrankio gedimas. Prieš įkeliant [talpos patikrinimas](memory-and-budgets.md#the-fit-check) turi tai užkirsti kelią.

Atvaizdavimo sistemos naudojamas biudžetas yra GPU biudžetas iš **Išteklių biudžetai** – tas pats skaičius, kurį naudoja talpos patikrinimas – taip pat viršijantis aptiktą reikšmę, iki slankiklio ribos (žr. [Didinti GPU biudžetą](memory-and-budgets.md#raising-the-gpu-budget)). Jis taikomas, kai duomenų rinkinys įkeliamas; pakeitus jį vėliau, įsigalioja kitą kartą įkeliant.
