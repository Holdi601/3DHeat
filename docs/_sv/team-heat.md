---
title: "Lagvärme"
parent: "Värmelägen"
nav_order: 6
lang: "sv"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Lagvärme

Lagvärme visar var varje lag var, varje lag i sin egen färg. Där lagen överlappar blandas färgerna.

**Lagvärme** (tangent 3) är täthetsfältet från [Värme](heat.md) med varje [grupp](glossary.md) given en egen nyans. Där grupper överlappar blandas deras nyanser. En jämn kamp blir neutral. Opaciteten bär fortfarande täthet precis som i de andra lägena, så bilden svarar på *hur mycket* och *vems* samtidigt. Den behöver en gruppkolumn.

![Lagvärme: varje sida i sin egen färg; där de överlappar blandas färgerna](../assets/img/en/heat-teams.webp)

Det här är inte [figuröverlägget](box-replay.md). Det ritar en figur per person; det här är ett värmefält färgat efter samma kolumn.

## Så använder du det {#how-to-use-it}

1. Tryck `3` (eller välj **Lagvärme** i lägesfältet).
2. Öppna **Värmefärger**. Färgproven visar varje grupps färg; för musen över ett prov för att se lagnamnet.
3. Om allt ser grått ut, höj **Färgseparation**.
4. Avmarkera en grupp i [Lagslistan](teams-list.md) för att ta bort den. De andra färgerna ligger kvar där de var.

## Reglage {#controls}

I avsnittet **Värmefärger**:

| Reglage | Standard | Betydelse |
|---|---|---|
| Färgprov | | Varje grupps färg, för de första 12 grupperna, sedan *+N till*. För musen för att se gruppnamnet och färgen. |
| **Färgseparation** | 1,4 | Hur långt en blandning trycks bort från neutralt, 0–4. 0 gör allt grått; 1 är det sanna medelvärdet. Över ungefär 2 lämnar de ljusaste blandningarna det visningsbara området och klämmes per kanal, vilket förskjuter deras nyans. |
| **Opacitetsramp (färgen kommer från gruppen)** | standardvärmerampen | Bara rampens **alfa** används här: genomskinlig där det inte finns något, ogenomskinlig högst upp. Dess färger ignoreras. |

Alla andra värmereglage – form, mättnad, respons, minsta värme, djup, bortsortering – fungerar som i [Värme](heat.md).

[Lagslistan](teams-list.md) visar varje grupps lagvärmefärg som sitt prov i det här läget. Att dölja en grupp lämnar alla andra gruppers färg där den var. Nyanserna kommer från det totala antalet grupper, inte från vad som är påslaget, så att två bilder förblir jämförbara.

## Paletten {#the-palette}

Från [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Färgerna ligger i **Oklab**-färgplanet med fast ljushet (0.7) och kroma (0.115). Därför är varje grupp lika ljus, och en röd grupp ser inte varmare ut än en blå.
- Med *n* grupper delas nyansringen i *n* lika delar. Grupp *i* tar **mitten** av sin del, `(i + 0.5) / n` av ett varv. Två grupper ligger så långt från varandra som antalet tillåter, och motsatser förblir motsatser oavsett antal.
- Högst **16** olika nyanser används. Med fler grupper placeras id:n genom upprepad halvering (bitvända id:n: 0, ½, ¼, ¾, ⅛ …) så att närliggande id:n inte delar nyans. Grupper utöver 16 delar nödvändigtvis nyans.
- En grupp vars etikett betyder ”ingen grupp” – `0`, tom, `none`, `unknown`, `null` eller `-1`, oavsett versaler – ritas i **neutral grå** i stället för att ta en bit av ringen. Bara den första sådana etiketten i grupplistan behandlas så.

Standardseparationen är 1,4 och inte 1, eftersom en blandning av fem jämnt fördelade nyanser vid 1 *är* grå: korrekt men oläsbar. Lite över 1 håller oavgjorda lägen ärliga samtidigt som en delning 60/40 syns.

## Hur det fungerar {#how-it-works}

Värmemålet har fyra kanaler i det här läget. Varje sprite adderar sin täthet *v* till den första kanalen och *v* × gruppens Oklab-koordinater *a* och *b* till den andra och tredje. Vid sammansättningen är pixelns blandning det täthetsvägda medelvärdet: *a* = G / R, *b* = B / R, skalat med färgseparationen och omvandlat till sRGB vid palettens ljushet. Att dela med den ackumulerade tätheten gör nyansen oberoende av hur mycket data som finns. Därför verkar varje täthetsreglage fortsatt bara på opaciteten.

Målet med fyra kanaler kostar fyra gånger så mycket GPU-minne som det enkanaliga värmemålet vid samma upplösning.
