---
title: "Lygių biblioteka"
parent: "Lygiai ir fono geometrija"
nav_order: 4
lang: "lt"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Lygių biblioteka

Biblioteka saugo jūsų lygius šioje naršyklėje, todėl jų nereikia vėl įkelti ir supaprastinti. **Išvalius svetainės duomenis naršyklėje, biblioteka ištrinama, eksporto nėra.** Saugokite savo originalius failus.

Lygio apdorojimas – analizavimas, klasifikavimas, sujungimas, supaprastinimas, tekstūrų supakavimas – yra lėtas, o rezultatas kiekvieną kartą toks pat. **Biblioteka** fono / lygio skydelio apačioje saugo apdorotus lygius šioje naršyklėje, todėl supaprastinto tinklo niekada nereikia kurti du kartus ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Įrašyti ir vėl įkelti lygį {#save-and-reload-a-level}

1. Įkelkite žemėlapio vaizdą arba 3D modelį ir patikrinkite, ar atrodo teisingai.
2. Spauskite **Įrašyti į biblioteką**. Skydelis parodys *Įrašyta. Kitą kartą įkels akimirksniu.*
3. Kitą kartą atidarykite **Biblioteka** sąrašą ir spauskite ▸ ant lygio.
4. Spauskite ✕, kad ištrintumėte įrašą, kurio nebereikia.

## Naudojimas {#using-it}

| Valdiklis | Poveikis |
|---|---|
| **Įrašyti į biblioteką** | Išsaugo dabartinį lygį. Žemėlapio vaizdas išsaugomas kaip PNG su abiem inkarais; modelis – kaip apdoroti buferiai. Skydelis parodo *Įrašyta. Kitą kartą įkels akimirksniu.* |
| Bibliotekos sąrašas | Viena eilutė kiekvienam išsaugotam lygiui: pavadinimas (užvedus pelę – išsaugotas dydis), modeliui – trikampiai, vaizdui – plotis pikseliais. |
| ▸ (*Įkelti*) | Įkelia įrašą kaip dabartinį lygį. |
| ✕ (*Ištrinti*) | Pašalina įrašą. |
| Naudojimo eilutė | `Naudojama X iš Y.` – naršyklės saugyklos įvertinimas šiai svetainei. |

Jei nieko neįrašyta, sąraše rašoma *Tuščia. Įkelkite žemėlapį arba modelį, tada „Įrašyti į biblioteką“.*

## Kas saugoma {#what-is-stored}

| Tipas | Saugoma | Nesaugoma |
|---|---|---|
| Žemėlapio vaizdas | Vaizdas (PNG), jo dydis, jo inkarai | Aukštis, apvertimas, nepermatomumas, ryškumas, nuspalvinimo nuėmimas – grąžinama į numatytąsias reikšmes (aukštis = dabartinio duomenų rinkinio žemiausias Y, apvertimas įjungtas) |
| 3D lygis | Viršūnės, viršūnių spalvos, tekstūros koordinatės, jų plytelės ir tekstūrų atlasas, žemės / konstrukcijų / vandens trikampiai, konstrukcijų kraštai, trikampių skaičiai | Dalių pavadinimai ir klasifikavimo priežastys, bei visi išvaizdos nustatymai – grąžinami į naujo importo numatytąsias reikšmes |

Iš bibliotekos įkeltas modelis neturi dalių sąrašo, o jo ribos ir žemės aukščio juosta apskaičiuojamos iš naujo pagal viršūnes.

## Kur tai laikoma {#where-it-lives}

Naršyklės IndexedDB, duomenų bazė `3dheat`, objektų saugykla `levels`, tam puslapio šaltiniui (adresui naršyklės adresų juostoje). Ji yra vietinė tam naršyklės profiliui: kita naršyklė, kitas profilis ar kitas adresas (pavyzdžiui, `localhost` vietoj `127.0.0.1`) mato kitą, tuščią biblioteką. Išvalius svetainės duomenis naršyklėje, ji ištrinama. Įrašai, išsaugoti senesnėmis versijomis be konstrukcijų, spalvų ar vandens, vis dar įkeliami.
