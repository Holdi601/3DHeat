---
title: "Sintetinis generatorius"
parent: "Duomenų įkėlimas"
nav_order: 5
lang: "lt"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Sintetinis generatorius

Neturite savo duomenų? Paspauskite vieną mygtuką, ir 3DHeat jums sugalvos išgalvotą mūšį, kiek norite mažą ar didelį.

1. Atidarykite skydelį **Duomenų rinkinys** šiluminio žemėlapio šoninėje juostoje (po **Šaltinis**).
2. Slinkite iki **Sintetinis generatorius**.
3. Nustatykite **Eilutės (milijonais)**. Pirmiausia pabandykite 1: numatytieji 8 milijonai pirmam bandymui per daug.
4. Spauskite **Generuoti**.

![1 milijonas eilučių, 8 komandos, nupieštos skirtuke Komandų šiluma](../assets/img/en/synthetic-generator-team-heat.webp)

Skydelis **Duomenų rinkinys** gali sugeneruoti duomenų rinkinį vietoj jo įkėlimo. Jis skirtas dviem dalykams: peržiūros programos išbandymui be jūsų duomenų ir patikrinimui, ar tam tikras eilučių skaičius, taškų spindulys ir biudžetas išlaiko tinkamą kadrų dažnį kompiuteryje *prieš* skiriant jam didelį tikrą įkėlimą. Jo judėjimas sukurtas kaip mūšio „battle royale“ rungtynės – komandos pradeda atskirai, paskui yra suspaudžiamos kartu – nes vienodas triukšmas atrodo gerai bet kokiame biudžete ir slepia tiksliai tuos artefaktus, kuriuos verta pagauti.

## Valdikliai {#controls}

| Valdiklis | Numatytoji reikšmė | Reikšmė |
|---|---|---|
| **Eilutės (milijonais)** | 8 | Generuotinos eilutės. Kiekvienam žaidėjui suapvalinamos žemyn iki sveiko žymių skaičiaus. |
| **Komandos** | 8 | Grupių skaičius (bent 1). |
| **Komandoje** | 12 | Žaidėjai grupėje (bent 1). |
| **Žemėlapio pusplotis (m)** | 4000 | Pusė žaidimo zonos pločio X ir Z ašimis. |
| Įvertinimo eilutė | | „≈ X GB RAM, Y GB GPU po kvantavimo.“ (apie 26 baitus RAM ir 8 baitus GPU vienai eilutei). |
| **Generuoti** | | Generuoja įkėlimo darbininke, rodydamas eigą, ir pakeičia įkeltą duomenų rinkinį. |

Generavimas vyksta fone esančiame darbininke, todėl dešimtys milijonų eilučių nesustabdo puslapio.

## Ką jis generuoja {#what-it-generates}

Iš [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Stulpeliai:** padėtis, laikas, asmuo (`P000`, `P001`, ...), grupė (`Team 1`, `Team 2`, ...), posūkis ir kryptis aukštyn bei gyvavimo trukmės. Nėra sesijos stulpelio ir nėra filtrų stulpelių.
- **Laikas:** vienas mėginys kiekvienam žaidėjui kas 0,25 s, pradedant nuo 0 (santykinis laikas, be sieninio laikrodžio).
- **Judėjimas:** kiekviena komanda pradeda savo sektoriuje žiede, esančiame 55–95 % pusplociu. Saugus apskritimas, centruotas arti vidurio (atsitiktinai pastumtas iki ketvirtadalio pusplocio), šešiais etapais su pastoviais tarpais susitraukia iki 8 % pusplocio; kiekvienas žaidėjas vairuoja link klajojančio taško jame, su slopinimu ir triukšmu. Aukštis banguoja tarp 0 ir 220 m.
- **Žiūrėjimo kryptis:** posūkis pagal judėjimo kryptį, kryptis aukštyn pagal vertikalų greitį.
- **Pakartojama:** atsitiktinių skaičių sėkla fiksuota (1337), todėl tie patys nustatymai visada duoda tuos pačius duomenis.

Su juo veikia visi šilumos režimai, dėžių pakartojimas ir linijų šiluma (visi takai, nes įvykių stulpelio nėra). Veikia ir gyvavimo trukmės istorija.
