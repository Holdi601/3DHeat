---
title: "Tacview-tallenteet (ACMI)"
parent: "Datan lataaminen"
nav_order: 7
lang: "fi"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview-tallenteet (ACMI)

Tacview on ohjelma, joka tallentaa lentoja lentosimulaattoreista. Sen tiedostot päättyvät `.acmi`. 3DHeat avaa ne, jotta näet, mihin jokainen lentokone lensi.

Tacviewn lentotallenteet latautuvat kuten mikä tahansa taulukko: valitse tai pudota `.acmi` (teksti, `.txt.acmi`, tai pakattu, `.zip.acmi`) ja paina **Lataa**. Saat sen jälkeen kaikkien lentojen lämmön. Välilehdellä **Ottelu** saat toiston hahmoilla, jäljillä ja tapahtumalistalla ([Ottelun toisto](match-replay.md)). ACMI on Tacviewn julkinen tiedostomuoto ([dokumentaatio](https://www.tacview.net/documentation/acmi/)). DCS (Tacviewn viejän kautta), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS ja muut kirjoittavat sitä, joten tämä lukee mitä tahansa niistä.

## Mitä tallenne tulee olemaan {#what-a-recording-becomes}

Yksi rivi aina, kun kohteen sijainti kirjoitetaan, yksi rivi per tapahtuma kohteen paikassa ja yksi rivi, kun kohde poistuu (`Removed`, siinä missä se viimeksi oli). Tapahtuma, joka ei koske vielä nähtyä kohdetta, esimerkiksi kirjanmerkki tai viesti kaikille, on rivi kohteelle `(recording)` viitepisteessä. Tallenne kantaa omat lukuohjeensa, joten kartoitusvaihe täyttää itse itsensä. Lukija kirjoittaa nämä sarakkeet: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, sekä kaikki muut tallenteen ominaisuudet. Niiden tehtävät:

| Sarake | Tehtävä | Merkitys |
|---|---|---|
| Time | aika | Sekunteja tallenteen ReferenceTime-hetkestä. Unix-sekunteja, kun sellainen on, jotta kello näyttää oikean ajan. |
| X, Y | sijainti | Itä ja pohjoinen, metreinä, tasolla, joka koskettaa maapalloa tallenteen viitepisteessä. Etäisyydet ja suunnat ovat oikeita sen lähellä ja poikkeavat alle tuhannesosan 100 km:ssä. Pohjoinen on maailman -Z. |
| Altitude | sijainti (ylös) | Metreinä. |
| Object | henkilö | Lentäjä ja kohteen nimi sen tunnisteen kanssa, esim. `Viper 1 (F-16C_50) #a01`; miehittämätön kohde `(T-90A) #401`. |
| Coalition | joukkue | Puoli (tai väri, kun koalitiota ei ole). |
| Heading, Pitch | katse | Asteina; suunta 0 on pohjoinen. |
| Recording | istunto | Tallenteen Title tai tiedostonimi. Useat tallenteet latautuvat rinnakkain, eikä niiden radat yhdisty. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | suodattimet | Säilytetään suodatusta varten. Type ja Name valitsevat kunkin kohteen [hahmon](figures.md), Event syöttää jälkianalyysin tapahtumalistan, Roll kallistaa lentokonetta. |
| U, V | | Pelin oma tasainen maailma metreinä, kun jokaisella näytteellä niitä on (DCS kirjoittaa ne). |
| EventObjects | suodattimet | Jokainen kohde, jonka tapahtuma nimeää (`Message|a01|b02|...`), tunnisteen mukaan. |
| RecordingInfo | | Tallenteen omat ominaisuudet sellaisina kuin ne olivat sillä hetkellä (DataSource, DataRecorder, Author, Category, Briefing, Comments ja muut) JSON-muodossa. |
| IAS, Mach, AOA, FuelWeight ... | suodattimet | Mikä tahansa muu numeerinen ominaisuus, jonka tallenne kantaa. |
| Parent, CallSign, LockedTarget, Label, Shape ... | suodattimet | Mikä tahansa muu tekstiominaisuus, jonka tallenne kantaa. Ominaisuus, jonka arvo ei ole luku, on tekstiä. |

Kaikki neljä Tacviewn sijaintimuotoa luetaan: `lon|lat|alt`, `u|v`, `roll|pitch|yaw` ja kaikki nämä plus suunta. Tyhjät kentät säilyttävät edellisen arvon. `-id` poistaa kohteen, ja jos tunnistetta käytetään uudelleen sen jälkeen, se on uusi kohde. Escapoidut pilkut ja jatkorivit käsitellään.

Sijainnit projisoidaan aina leveys- ja pituusasteesta, ei koskaan U/V-arvoista. Siksi kaikkien pelien tallenteet jakavat saman projektion todellisen maailman taustakuvan kanssa.
