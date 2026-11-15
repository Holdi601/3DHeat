---
title: "Leikjastýring og HOTAS"
parent: "Myndavél og stýringar"
nav_order: 1
lang: "is"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Stýripinni og HOTAS

Þú getur flogið myndavélinni með stýripinna í Xbox-stíl í stað lyklaborðsins. Notaðu hann þegar þú vilt halla þér aftur og líta í kring í stórri senu. Inntak hans **bætist við** lyklaborðið, svo þú getur notað bæði í einu.

## Tengdu stýripinna {#connect-a-controller}

1. Stingdu stýripinnanum í samband (eða paraðu hann).
2. Smelltu á sýnina og ýttu á hvaða takka sem er á stýripinnanum. Vafrar sýna stýripinna ekki fyrr en hann hefur sent sitt fyrsta inntak.
3. Opnaðu **Camera & scene → Gamepad**. Tækjalistinn sýnir hann með `●`.
4. Ýttu vinstri pinnanum til að fljúga og hægri pinnanum til að líta. Ef myndavélin rekur með pinnunum í miðju, hækkaðu **Dautt svæði**.

Hvaða tæki sem vafrinn kortleggur á staðlaða stýripinnaútlitið virkar. Flugpinni eða inngjafarstöng (HOTAS) er sjálfgefið hunsuð; sjá hér fyrir neðan.

## Kortlagning {#mapping}

| Stýring | Áhrif |
|---|---|
| Vinstri pinni | Hreyfa: áfram/afturábak og til hliðar |
| Hægri pinni | Líta: snúningur og halli, á *Look speed* gráður á sekúndu við fulla hreyfingu |
| `RT` / `LT` (hliðrænt) | Upp / niður; í samsíða varpun, aðdráttur inn / út |
| `RB` (haldið) | 6× hraðar |
| `LB` (haldið) | 15% hraði |
| `A` (haldið) | 3× spretthlaup (sameinast RB/LB) |
| `Y` (ýtt) | Ramma gögnin |

Númer takka fylgja staðlaða útlitinu: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; pinnar á ásum 0-1 (vinstri) og 2-3 (hægri).

## Stillingar stýripinnans {#the-gamepad-settings}

Í **Camera & scene → Gamepad**. **Stillingar** / **Fela** opnar stillingarstýringarnar.

| Stýring | Sjálfgefið | Svið (hreyfing) | Merking |
|---|---|---|---|
| **Virkt** | á | | |
| Device status | | | Hvert tengt tæki, `●` þegar fylgt er, `○` þegar ekki er fylgt, með *- not an XInput pad, ignored* eða *- not an XInput pad, used anyway* fyrir óstöðluð tæki. Þegar ekkert er: *No pad detected. Browsers only reveal a controller after it sends its first input - press a button on it.* |
| **Nota tæki** | *XInput pads only (recommended)* | | Birtist þegar óstaðlað tæki er tengt. Veldu tæki eftir nafni til að fylgja því í staðinn. |
| **Snúningshraði sýnar** | 150°/s | 20-540 (5000) | Snúningshraði við fulla hreyfingu hægri pinnans. |
| **Dautt svæði** | 12% | 0-50% (95%) | Geislamiðað: ská-ýting lekur aldrei yfir á einn ás eingöngu. Hækkaðu ef myndavélin rekur með pinnunum í miðju. |
| **Pinnaferill** | x² | línuleg (1) til x⁴ (16) | Svörunarvísir eftir dautt svæði: fínni stýring nálægt miðju, enn fullur hraði við jaðarinn. |
| **Snúa Y-ás pinna við** | slökkt | | |
| **Víxla pinnum** | slökkt | | Hreyfing á hægri pinna, líta á vinstri. |

Mótun pinnans: með hreyfingu *m* (lengd pinnavigursins) og dauðu svæði *d*, er úttakið ((m - d) / (1 - d)) ^ kúrva eftir stefnu pinnans, og 0 innan dauða svæðisins.

## Af hverju aðeins staðlaðir stýripinnar sjálfgefið {#why-only-standard-pads-by-default}

Gamepad-API-ið skilar **öllum** HID-tækjum með ásum - flugpinnum, inngjafarstöngum, pedölum, stýrum - og þau hvíla ekki í miðju. Snúningsás eða inngjafarstöng situr á fullri hreyfingu þegar enginn snertir hana. Ef hún er lesin sem pinni er það varanlegt fullt inntak sem ekkert dautt svæði getur kæft, og myndavélin snýst af sjálfu sér frá því síðan er hlaðin (og allir hitahamar líta líka bilaða út, því hreyfð myndavél endurræsir söfnunina á hverjum ramma).

Þess vegna er tæki aðeins fylgt þegar vafrinn skilar `mapping: "standard"`, sem þýðir „XInput-stíls pinni með ásana þar sem þú býst við þeim“. Önnur tæki eru skráð og merkt sem hunsuð, og **Nota tæki** velur eitt þeirra sérstaklega - til dæmis til að fljúga myndavélinni með HOTAS. Þegar pinni er fylgt helst myndavélin með honum, svo tveir stýripinnar berjast ekki um myndavélina eftir því í hvaða röð þeir eru taldir.

**HOTAS:** aðeins ásar 0-3 (tveir pinnar) og staðlaðir takkar eru lesnir. Inngjafarstöng eða pedalar á öðrum ásum gera ekkert, og pinni eða inngjafarstöng sem hvílir ekki í miðju gæti þurft stærra **Dautt svæði**.

Vafrar fela stýripinna þar til hann hefur sent sitt fyrsta inntak, svo tengdur pinni sem hefur ekki verið snertur er ekki til enn sem síðan séð.
