---
title: "Yfirlit yfir lyklaborð og mús"
parent: "Myndavél og stýringar"
nav_order: 2
lang: "is"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Lyklaborð og mús

Allar lykla- og músaaðgerðir á einum stað, svo þú finnir þá sem þú þarft. Smelltu fyrst á sýnina svo hún fái lyklaborðið. Lyklar eru hunsaðir á meðan textareitur eða fellivalmynd hefur fókus. Stutta útgáfan er líka prentuð neðst til vinstri á sýninni.

Fljótleg leit:

| Ég vil ... | Ýttu á |
|---|---|
| fljúga | `W A S D`, dragðu til að líta í kring |
| sjá allt | `F` |
| spila eða gera hlé | `K` |
| spila afturábak | `J` (ýttu aftur til að gera hlé), áfram `L` |
| sjá hvað litirnir þýða | `?` eða `F1` |
| afturkalla í Leikfræði-flipanum | `Ctrl+Z` |

## Myndavél {#camera}

Úr [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Inntak | Áhrif |
|---|---|
| `W` / `↑` | Áfram eftir sjónstefnunni |
| `S` / `↓` | Afturábak |
| `A` / `←` | Færist til vinstri |
| `D` / `→` | Færist til hægri |
| `Space` / `E` | Upp |
| `Q` / vinstri `Ctrl` | Niður |
| `Shift` (hvort sem er) | Haltu inni: 6× hraði |
| vinstri `Alt` | Haltu inni: 15% hraði |
| Vinstri eða hægri drag á sýninni | Líta í kring (bendill læstur meðan hnappurinn er niðri) |
| Hjól (perspektíf) | Flughraði ×1,5 á hvert hak (mest 4 hak á hvern hjólsatburð) |
| Hjól (samsíða) | Aðdráttur |
| Hægri smellur | Opnar ekki samhengisvalmynd yfir sýninni |

## Almennt {#global}

Úr [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Lykill | Áhrif |
|---|---|
| `K` | Spila / gera hlé á [tímalínunni](timeline.md) |
| `F` | Ramma gögnin inn |
| `C` | Afrita stöðu myndavélarinnar, stefnu (yaw) og halla (pitch) ([aflestur myndavélar](camera.md#camera-readout)) |
| `G` | Fara á punkt sem þú slærð inn: opnar reitinn undir aflestri myndavélarinnar |
| `Esc` | Loka valkortinu; síðan hætta að horfa á seinni einingu; síðan hætta að fylgja einingu |
| `T` | Taktískt útlit skjámyndar á eða af ([Endurspilun leiks](match-replay.md#display-style)) |
| `?` / `F1` | Hjálparhamur: hvað litirnir þýða ([Stillingar, einingar og lyklar](settings.md#help-mode)) |
| `1` | [Hiti](heat.md) |
| `2` | [Mismunur](difference.md) |
| `3` | [Liðahiti](team-heat.md) |
| `4` | [Línuhiti](line-heat.md) |
| `]` | Ytri útklipsmörk fjarlægðar út ×1,12 (`Shift`: ×1,35) |
| `[` | Ytri útklipsmörk fjarlægðar inn ÷1,12 (`Shift`: ÷1,35) |
| `\` | Ytri útklipsmörk fjarlægðar af / aftur á þar sem þau voru ([Dýpt og útilokun](depth-and-culling.md#keyboard)) |

Hamurinn **Fígúruyfirlögn** hefur engan talnalykil; veldu hann í valstikunni eða opnaðu Leikflipann. Talnalyklarnir fara í gegnum sömu athugun og valstikan: lykill fyrir hamur sem valstikan sýnir sem ótiltækan fyrir hlaðin gögn gerir ekkert.

## Endurspilun leiks {#match-replay}

Í hamnum Fígúruyfirlögn, sem Leikflipinn notar ([Endurspilun leiks](match-replay.md)). Þeir virka hvort sem eining er fylgt eða ekki, nema annað sé tekið fram:

| Lykill | Áhrif |
|---|---|
| `B` | Bæta við bókamerki: augnablikið og myndavélin |
| `M` | 2D kort: horn, öll sýnin, slökkt |
| `V` / `Shift+V` | Næsta / fyrri myndavélarsýn á eininguna sem er fylgt |
| `H` | Höfuðskjár í stjórnklefa- og padlock-sýnunum |
| `Page Down` / `Page Up` | Næsti / fyrri atburður af þeim tegundum sem atburðalistinn sýnir |
| `J` | Spila afturábak; aftur til að gera hlé |
| `L` | Spila áfram; aftur til að gera hlé |
| `.` / `,` | Ein sekúnda áfram / aftur á bak, í hléi (`Shift`: tíu sekúndur) |
| `Esc` | Hætta fyrst að horfa á skotmarkið, síðan að fylgja |
| `Ctrl`+smellur eða `Alt`+smellur á einingu (í sýninni eða á einingalistanum) | Horfa á hana frá einingunni sem er fylgt (sýn á tvær einingar); smelltu aftur til að sleppa henni |
| `Shift`+smellur á tvær einingar | Mæla á milli þeirra: stefnu, drægni, hæðarmun |

`V` þarf einingu sem er fylgt. `M` er 2D kortið hér, og „færa“ í Leikfræði-flipanum.

## Að fylgja einingu {#following-a-unit}

Meðan myndavélin fylgir einingu stýra hjólið og flugtakkarnir um einingu í stað þess að fljúga frjálst ([Myndavél](camera.md#while-following-a-unit)):

| Inntak | Áhrif |
|---|---|
| Hjól, `W` / `S` | Nær / fjær (hærra / lægra í gervihnattasýninni). Ekki í stjórnklefa- og padlock-sýnunum. |
| `A` / `D`, `Q` / `E` | Hringsóla um eininguna (elta- og hringsólasýnir) |
| Drag | Líta í kringum eininguna; í stjórnklefanum, líta um innan hans |
| `V` / `Shift+V` | Næsta / fyrri myndavélarsýn |
| `H` | Höfuðskjár (stjórnklefa- og padlock-sýnir) |
| `Esc` | Hætta að horfa á seinni eininguna, síðan að fylgja |

## Taktíkartafla {#tactics-board}

Í Leikfræði-flipanum ([Taktíkartafla](tactics-board.md)). `F`, `C`, `G` og `T` virka eins og að ofan; talnalyklarnir gera ekkert.

| Lykill | Áhrif |
|---|---|
| `Ctrl+Z` | Afturkalla |
| `Ctrl+Y` eða `Ctrl+Shift+Z` | Endurtaka |
| `Enter` | Ljúka örinni sem er verið að teikna (tvísmellur eða hægri smellur gerir það sama) |
| `Esc` | Hætta við drag; annars sleppa örinni eða færslunni sem er í gangi; annars afvelja |
| `Delete` eða `Backspace` | Eyða valinu |
| `W` / `E` / `R` | Stjórntæki Færa / Snúa / Kvarða fyrir valið (lyklaskipan **W / E / R**) |
| `G` / `R` / `S` | Stjórntæki Færa / Snúa / Kvarða fyrir valið (lyklaskipan **G / R / S**) |
| `R` | Án vals: snýr næstu fígúru sem á að setja niður um 15°. `Shift+R` snýr henni til baka. |
| `M` | Með fígúru valda: færir hana í næsta smell |
| `K` | Spila eða gera hlé á áætluninni |
| Shift+smellur | Bæta við eða taka úr valinu |
| Shift+drag | Draga kassa utan um það sem á að velja |
| `Ctrl` meðan handfangi er dregið | Smella að rúðunetinu eða hornabilinu |

Stjórntækjalyklarnir virka aðeins meðan eitthvað er valið; án vals fljúga `W A S D` myndavélinni eins og venjulega.

## Smella til að velja {#click-to-pick}

Með **Smellur sýnir hvað er þar** á og reglustikuna slökkta ([Smella til að velja](camera.md#click-to-pick)):

| Inntak | Áhrif |
|---|---|
| Vinstri smellur (án þess að draga meira en 4 px) | Sýnir gagnapunktinn, eða annars staðinn á borðinu, undir bendlinum |

## Mæling {#measure}

Með **Reglustika virk** ([Mæling](measure.md)):

| Inntak | Áhrif |
|---|---|
| Vinstri smellur (án þess að draga meira en 4 px) | Setur niður punkt |
| Hægri smellur | Fjarlægir síðasta punktinn |

## Annars staðar {#elsewhere}

| Hvar | Inntak | Áhrif |
|---|---|---|
| Handfang hvers sleða (reiturinn við hlið tölunnar) | Drag upp / niður | Breytir gildinu stöðugt, því hraðar sem þú dregur því lengra; haltu `Shift` niðri fyrir fínstillingu. Slepptu til að stoppa. |
| Hraðasýningin yfir sýninni | Drag upp / niður | Breytir flughraðanum á sama hátt. |
| Stöðureitir | `Enter` | Beitir innsleginni stöðu eða stefnu. |
| Ferilritill | Tvísmellur / Alt-smellur / hægri smellur | Bætir við punkti / fjarlægir punkt ([Lögun sprite-mynda](sprite-shape.md#the-curve-editor)). |

## Flipinn Kappakstursgreining {#race-analysis-tab}

Í flipanum Kappakstursgreining spilar `K` og gerir hlé á kappakstursendurspilun, `Home` spólar henni til baka, og talnalyklarnir gera ekkert. Sjá [Kappakstursgreining](race-analysis.md).

## Lyklar sem skoðarinn heldur frá vafranum {#keys-the-viewer-keeps-from-the-browser}

Sumar flýtileiðir vafrans myndu loka síðunni eða endurhlaða henni og tapa hlaðinni lotu; skoðarinn heldur þeim fyrir sig. Listinn er búinn til úr kóðanum: [Lyklar í vafra](ref-browser-keys.md).

## Leikjatölva {#gamepad}

Sjá [Leikjastýring og HOTAS](gamepad.md).
