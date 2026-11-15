---
title: "Tacview įrašai (ACMI)"
parent: "Duomenų įkėlimas"
nav_order: 7
lang: "lt"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview įrašai (ACMI)

Tacview yra programa, kuri įrašo skrydžius skrydžio simuliatoriuose; jos failai baigiasi `.acmi`. 3DHeat juos atveria, kad galėtumėte pamatyti, kur skrido kiekvienas orlaivis.

Tacview skrydžių įrašai įkeliami kaip bet kokia lentelė: pasirinkite arba įmeskite `.acmi` (tekstinį, `.txt.acmi`, arba suspaustą, `.zip.acmi`) ir spauskite **Įkelti**. Tada gausite visų skrydžių šilumą, o skirtuke **Rungtynės** – pakartojimą su figūromis, trajektorijomis ir įvykių sąrašu ([Rungtynių pakartojimas](match-replay.md)). ACMI yra viešas Tacview failų formatas ([dokumentacija](https://www.tacview.net/documentation/acmi/)); DCS (per Tacview eksportuotoją), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS ir kiti jį rašo, todėl peržiūros programa skaito bet kurį iš jų.

## Ką tampa įrašas {#what-a-recording-becomes}

Viena eilutė kiekvieną kartą, kai įrašoma objekto padėtis, viena eilutė kiekvienam įvykiui objekto vietoje ir viena eilutė, kai objektas išeina (`Removed`, kur jis buvo paskutinį kartą). Įvykis apie dar nematytą objektą – žymė, pranešimas visiems – yra objekto `(recording)` eilutė atskaitos taške. Įraše yra savi skaitymo nurodymai, todėl susiejimo žingsnis užsipildo pats. Skaitytuvas rašo šiuos stulpelius: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, o paskui visas kitas įrašo savybes. Jų vaidmenys:

| Stulpelis | Vaidmuo | Reikšmė |
|---|---|---|
| Time | laikas | Sekundės po įrašo ReferenceTime; Unix sekundės, kai jis yra, todėl laikrodis rodo tikrą laiką. |
| X, Y | padėtis | Rytai ir šiaurė, metrais, plokštumoje, liečiančioje Žemę įrašo atskaitos taške: atstumai ir kryptys šalia jo tikslūs, o ties 100 km nukrypsta mažiau nei tūkstantine dalimi. Šiaurė tampa pasaulio -Z. |
| Altitude | padėtis (aukštyn) | Metrais. |
| Object | asmuo | Pilotas ir objekto pavadinimas su id, pvz., `Viper 1 (F-16C_50) #a01`; bepilotis objektas `(T-90A) #401`. |
| Coalition | komanda | Pusė (arba spalva, kai koalicijos nėra). |
| Heading, Pitch | žvilgsnis | Laipsniais; kryptis 0 yra šiaurė. |
| Recording | sesija | Įrašo Title arba failo vardas: keli įrašai įkeliami greta, nesujungiant jų trajektorijų. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtrai | Saugomi filtravimui; Type ir Name parenka kiekvieno objekto [figūrą](figures.md), Event maitina įvykių sąrašą atsiskaitymo metu, Roll pasuka orlaivį. |
| U, V | | Žaidimo paties plokščio pasaulio metrai, kai kiekviena mėginys juos turi (DCS juos rašo). |
| EventObjects | filtrai | Kiekvienas objektas, kurį įvykis nurodo (`Message|a01|b02|...`), pagal id. |
| RecordingInfo | | Įrašo savybės, kokios buvo tuo momentu – DataSource, DataRecorder, Author, Category, Briefing, Comments, ... – JSON formatu. |
| IAS, Mach, AOA, FuelWeight, ... | filtrai | Bet kokia kita skaitinė įrašo savybė. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtrai | Bet kokia kita teksto savybė, kurią turi įrašas; savybė, kurios reikšmė nėra skaičius, yra tekstas. |

Skaitomos visos keturios Tacview padėties formos (`lon|lat|alt`, su `u|v`, su `roll|pitch|yaw` ir su visais kartu bei kryptimi); tušti laukai palieka paskutinę reikšmę; `-id` pašalina objektą, o id, panaudotas vėl po to, yra naujas objektas. Apdorojami ekranuoti kableliai ir tęsiamos eilutės.

Padėtys visada apskaičiuojamos iš platumos ir ilgumos, niekada nepaimamos iš U/V, todėl įrašai iš visų žaidimų naudoja vieną projekciją su tikro pasaulio fonu.
