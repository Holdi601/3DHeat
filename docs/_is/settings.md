---
title: "Stillingar, einingar og lyklar"
nav_order: 16
lang: "is"
source: "settings.md"
source_hash: "f25e4cbaf3bb"
translated: true
outdated: false
---

# Stillingar, einingar og lyklar

Litlu stjórntækin efst í hliðarstikunni breyta því hvernig skoðarinn talar við þig: tungumálið, einingarnar (metrar eða fet, km/klst eða hnútar) og hjálparham sem útskýrir litina. Val þitt er munað í vafranum þínum.

## Hausinn {#the-header}

Efst í hliðarstikunni:

| Stýring | Hvað hún gerir |
|---|---|
| **?** | Hjálparhamur: hvað hver litur merkir (líka `?` eða `F1`) |
| **Einingar**-valmynd | Metric, Imperial, Aviation eða Nautical |
| **...**-hnappur við hliðina á **Einingar** | Opnar „Choose a unit for each quantity“: eina fellilista fyrir hverja stærð |
| **Tungumál**-valmynd | Tungumál skoðarans: [40 tungumál](languages.md), eða tungumál vafrans |

![Hausinn með Units-valmyndinni og einingagluggann fyrir hverja stærð opinn](../assets/img/is/settings-units.webp)

Tölur sem þú slærð inn í reit mega nota annað hvort punkt eða kommu (`0.35` eða `0,35`). Skoðarinn les hvort tveggja og sýnir tölur eins og tungumál skoðarans skrifar þær.

## Einingar {#units}

1. Veldu forstillingu í **Einingar**-valmyndinni. Allar stærðir skipta saman.
2. Til að breyta aðeins einni stærð, smelltu á **...**-hnappinn við hliðina á henni og veldu einingu fyrir hana. Valmyndin sýnir þá `*` á eftir forstillingunni.
3. Stærð sem þú stillir ekki fylgir forstillingunni. Veldu „As preset“ til að fara til baka.

| Stærð | Metric (sjálfgefið) | Imperial | Aviation | Nautical |
|---|---|---|---|---|
| Distance | km | mi | NM | NM |
| Altitude, length | m | ft | ft | m |
| Speed | km/h | mph | kt | kt |
| Vertical speed | m/s | ft/min | ft/min | m/s |
| Temperature | °C | °F | °C | °C |
| Pressure | hPa | inHg | hPa | hPa |
| Mass, fuel | kg, l | lb, gal | lb, gal | t, m³ |
| Angle | degrees | degrees | degrees | degrees |

Aðrar einingar sem þú getur valið fyrir eina stærð: fjarlægð km, mi, NM; hraði km/klst, m/s, kt, mph; lóðréttur hraði m/s, ft/min, m/min; hiti °C, °F, K; þrýstingur hPa, inHg, mmHg, psi; massi kg, lb, t; horn gráður eða NATO-mil (6400 á hringinn). Einingarnar eru þær sömu alls staðar í skoðaranum: merkimiðar, spjöld, línurit, tölfræði.

## Hjálparhamur {#help-mode}

![Hjálparhamur: hvað litirnir merkja](../assets/img/is/help.webp)

Ýttu á `?` eða `F1`, eða smelltu á **?**-hnappinn. Hann sýnir *What the colours mean*: skýringar á 3D-sýninni, hitastigunum, liðalitunum, litum borðsins, stöðulitum spjaldanna, leikspjaldinu og kappakstursyfirlitinu. Hann helst á þar til þú slekkur á honum. Á flipanum Match útskýrir hann líka liti leikspjaldsins.

![Hjálparhamur á flipanum Match](../assets/img/is/settings-help-match.webp)

## Það sem vafrinn man {#what-the-browser-remembers}

Þessar stillingar eru geymdar í vafranum þínum milli heimsókna (ekkert er sent neitt):

- tungumálið, einingarnar og hjálparhamurinn;
- stillingar endurspilunar á fígúrum, táknum, merkimiðum, myndavél og taktískri birtingu;
- hraði spilunar og speglun;
- bókamerki fyrir hverja upptöku, rúmmál fyrir hvert gagnasafn, markmiðslög;
- stillingar ytri gervigreindar (lykillinn aðeins ef þú hakar við *Remember*).

Hitastillingar, síur og hamurinn byrja upp á nýtt við hverja hleðslu. Allur, sjálfvirkt mynduður listi: [Vistaðar stillingar](ref-settings-storage.md).

## Lyklar sem skoðarinn heldur úr vafranum {#keys-the-viewer-keeps-from-the-browser}

Lota með miklum gögnum tekur tíma að hlaðast, svo skoðarinn kemur í veg fyrir að vafrinn henti henni óvart:

- `Ctrl`/`Cmd` + stafir sem myndu prenta, vista, opna, endurhlaða, loka eða opna nýja glugga gera ekkert utan textareita; `F1`, `F3`, `F5`, `F6` og `F7` gera ekkert.
- Að loka eða endurhlaða flipanum þegar gögn eða borð eru hlaðin spyr fyrst.
- Í öllum skjá læsir skoðarinn lyklunum sem hann notar (W, T, N, S, R, P, Q, Esc), svo vafrinn taki þá ekki.

Nákvæmi listinn: [Lyklar vafrans](ref-browser-keys.md). Allir eigin lyklar skoðarans: [Tilvísun lyklaborðs og músar](keyboard-reference.md).
