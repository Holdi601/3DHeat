---
title: "Objektai"
parent: "Filtrai ir įrankiai"
nav_order: 3
lang: "lt"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Objektai

**Objektai** leidžia pasirinkti vieną žaidėją (arba kelis) ir matyti tik tai, kur tas žaidėjas nuėjo. Naudokite, kad sektumėte savo judėjimą arba vieną priešininką.

Skydelis rodomas, kai duomenų rinkinyje yra asmens stulpelis. Jo antraštėje rodomas asmenų skaičius arba `pasirinkta iš viso`, kol aktyvus pasirinkimas (*asmuo* yra vienas žaidėjas ar DI, žr. [žodynėlį](glossary.md)).

## Pasirinkite žaidėją {#pick-a-player}

1. Šoninėje juostoje atidarykite **Objektai**.
2. Paieškos laukelyje įveskite dalį vardo.
3. Pažymėkite žaidėją. Antraštėje matysite, pavyzdžiui, `2 iš 10`, o viskas kita dings.
4. **Išvalyti** vėl parodo visus.

![Objektai su dviem iš dešimties pasirinktų žaidėjų](../assets/img/en/entities-selected.webp)

Pasirinkimas rodo tik pasirinktus asmenis šilumos režimuose (taškai, linijos, skirtumas, komandų šiluma), taip pat [figūrų pakartojimo](box-replay.md) takuose, figūrose ir pėdsakuose. Palikite tuščią, kad būtų rodomi visi; pasirinkus visus, tas pats kaip nepasirinkus nieko.

## Skydelis {#the-panel}

| Dalis | Reikšmė |
|---|---|
| Paieškos laukelis | *Ieškoti N objektų...* – filtruoja sąrašą pagal pavadinimo dalį, nepaisant raidžių dydžio. Rodo `N atitikmenų` arba `N atitikmenų, rodomi pirmi 200`; *Nieko neatitinka „...“*, kai paieška nieko nerado. |
| Sąrašas | Iki 200 asmenų (pirmi 200 atitinkantys), kiekvienas su langeliu, asmens spalvos atspalviu ir pavadinimu (*(be vardo)*, jei vardo nėra). |
| Patarimas apie žaidimą | Kai laikas teka, sąraše yra tie, kurie *yra žaidime grojimo galvutės vietoje*; paieška randa visus. |
| **DI (n)** | Sutraukiama grupė su DI valdomais vienetais, atskirai nuo žaidėjų. |
| **Pridėti rodomus** | Prideda visus dabar sąraše esančius prie pasirinkimo. |
| **Tik rodomi** | Padaro pasirinkimą tiksliai tokį, kokie yra sąraše. |
| **Išvalyti** | Ištuština pasirinkimą. |

## Apribojimai {#limits}

Šilumoje pasirinkimas yra filtras ir naudoja vieną iš keturių [filtrų vietų](filters.md#rules). Kai kiti filtrai jau naudoja visas keturias, skydelis rodo *Šilumai nepritaikyta: visos filtrų vietos užimtos. Figūrų pakartojimas vis tiek rodo tik šiuos objektus. Išvalykite filtrą skiltyje Filtrai, kad atlaisvintumėte vietą.* Išvalykite filtrą, kad atlaisvintumėte vietą.

Pasirinkimas išvalomas su kiekvienu nauju duomenų rinkiniu. Rungtynių skirtukas nustato tą patį pasirinkimą, kai sufokusuoja vieną žaidėją.

## Kūrėjams {#for-developers}

Pasirinkimas saugomas kaip *asmenų* filtras ([Filtrai](filters.md#for-developers)). Šešėliavimo kaukė laiko 65 536 asmenų id; asmuo, viršijantis tą ribą, šilumoje nepiešiamas, kai pasirinkimas aktyvus.
