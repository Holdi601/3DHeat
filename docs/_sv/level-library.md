---
title: "Banbibliotek"
parent: "Banor och bakgrundsgeometri"
nav_order: 4
lang: "sv"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Banbibliotek

Biblioteket sparar dina banor i den här webbläsaren, så att du inte behöver läsa in och förenkla dem igen. **Rensar du sidans data i webbläsaren tas biblioteket bort, och det finns ingen export.** Behåll dina originalfiler.

Att bearbeta en bana (läsa in, klassificera, svetsa, decimera, packa texturer) är långsamt, och resultatet blir detsamma varje gång. **Biblioteket** längst ner i panelen Bakgrund / bana behåller bearbetade banor i den här webbläsaren, så ett decimerat nät aldrig byggs två gånger ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Spara och läs in en bana igen {#save-and-reload-a-level}

1. Läs in en kartbild eller en 3D-modell och kontrollera att den ser rätt ut.
2. Tryck på **Spara i biblioteket**. Panelen säger *Sparad. Den läses in direkt nästa gång.*
3. Nästa gång: öppna listan **Bibliotek** och tryck på ▸ vid banan.
4. Tryck på ✕ för att ta bort en post du inte längre behöver.

## Använda det {#using-it}

| Reglage | Effekt |
|---|---|
| **Spara i biblioteket** | Lagrar den aktuella banan. En kartbild lagras som en PNG med dess två ankare. En modell lagras som sina bearbetade buffrar. Panelen säger *Sparad. Den läses in direkt nästa gång.* |
| Bibliotekslistan | En rad per lagrad bana: namnet (med dess lagrade storlek när du för musen över det), trianglar för en modell eller bredd i pixlar för en bild. |
| ▸ (*Läs in*) | Läser in posten som aktuell bana. |
| ✕ (*Ta bort*) | Tar bort posten. |
| Användningsraden | `Using X of Y.` blir ”Använder X av Y.”: webbläsarens uppskattning av lagringsutrymmet för den här sidan. |

Med inget lagrat säger listan *Empty. Load a map or model, then "Save to library".* På svenska: ”Tom. Läs in en karta eller modell och tryck sedan på ”Spara i biblioteket”.”

## Vad som lagras {#what-is-stored}

| Slag | Lagras | Lagras inte |
|---|---|---|
| Kartbild | Bilden (PNG), dess storlek och dess ankare | Höjd, spegling, opacitet, ljusstyrka och avmattning. Dessa återställs till standardvärdena (höjd = den aktuella datamängdens lägsta Y, spegling på). |
| 3D-bana | Hörnpunkter, hörnfärger, texturkoordinater, deras rutor och texturatlasen, mark-, struktur- och vattentrianglar, strukturkanter och antal trianglar | Delnamn och klassificeringsskäl, och alla utseendeinställningar. Dessa återställs till standardvärdena för en ny import. |

En modell som läses in från biblioteket har ingen delförteckning. Dess gränser och markhöjdsband räknas om från dess hörnpunkter.

## Var den finns {#where-it-lives}

Den finns i webbläsarens IndexedDB, i databasen `3dheat` och objektlagret `levels`, för sidans ursprung (adressen i webbläsarens adressfält). Den hör till just den webbläsarprofilen. En annan webbläsare, en annan profil eller en annan adress (till exempel `localhost` i stället för `127.0.0.1`) ser ett annat, tomt bibliotek. Rensar du sidans data i webbläsaren tas biblioteket bort. Poster som sparats av äldre versioner utan strukturer, färger eller vatten läses fortfarande in.
