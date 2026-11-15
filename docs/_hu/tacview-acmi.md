---
title: "Tacview-felvételek (ACMI)"
parent: "Adatok betöltése"
nav_order: 7
lang: "hu"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview-felvételek (ACMI)

A Tacview egy program, amely repüléseket rögzít repülőszimulátorokban; fájljai `.acmi` kiterjesztésűek. A 3DHeat megnyitja őket, hogy lásd, merre repült minden repülőgép.

A Tacview repülési felvételei úgy töltődnek be, mint bármely táblázat: válassz vagy húzz be egy `.acmi` fájlt (szöveges, `.txt.acmi`, vagy tömörített, `.zip.acmi`), és nyomd meg a **Betöltés** gombot. Ekkor megkapod az összes repülés hőtérképét, a **Meccs** fülön pedig egy visszajátszást a figurákkal, nyomvonalakkal és eseménylistával ([Meccs-visszajátszás](match-replay.md)). Az ACMI a Tacview nyilvános fájlformátuma ([dokumentáció](https://www.tacview.net/documentation/acmi/)); a DCS (a Tacview exportálóján keresztül), az IL-2 Great Battles, a Falcon BMS, az X-Plane, az MSFS és mások írják, így mindegyiket olvassa.

## Mivé lesz egy felvétel {#what-a-recording-becomes}

Minden alkalommal egy sor, amikor egy objektum helyzetét írják, egy sor minden eseményhez az objektum helyén, és egy sor, amikor egy objektum eltűnik (`Removed`, az utolsó helyén). Egy olyan eseményhez, amely még nem látott objektumra vonatkozik - egy könyvjelző, egy üzenet mindenkinek -, a `(recording)` objektum egy sora tartozik a vonatkoztatási ponton. A felvétel a saját olvasási utasításaival érkezik, így a leképezési lépés magától kitöltődik. Az olvasó ezeket az oszlopokat írja: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, majd a felvétel minden további tulajdonsága. Ezek szerepei:

| Oszlop | Szerep | Jelentés |
|---|---|---|
| Time | idő | Másodpercek a felvétel ReferenceTime-ja után; Unix-másodpercek, ha van ilyen, így az óra a valódi időt mutatja. |
| X, Y | pozíció | Kelet és észak, méterben, a felvétel vonatkoztatási pontján a Földet érintő síkon: a távolságok és az irányok a közelében valósak, 100 km-en az ezredrész alatt térnek el. Az észak a világ -Z-je lesz. |
| Altitude | pozíció (fel) | Méter. |
| Object | személy | A pilóta és az objektum neve az azonosítójával, pl. `Viper 1 (F-16C_50) #a01`; egy pilóta nélküli objektum `(T-90A) #401`. |
| Coalition | csapat | Az oldal (vagy a szín, ha nincs koalíció). |
| Heading, Pitch | tekintet | Fok; a 0-s irány észak. |
| Recording | munkamenet | A felvétel Title-je, vagy a fájlnév: több felvétel egymás mellett töltődik be úgy, hogy a nyomvonalaik nem kapcsolódnak össze. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | szűrők | Szűréshez megtartva; a Type és a Name választ minden objektumhoz [figurát](figures.md), az Event a visszaelemzés eseménylistáját táplálja, a Roll dönti a repülőgépet. |
| U, V | | A játék saját lapos világának méterei, ha minden mintában megvannak (a DCS írja). |
| EventObjects | szűrők | Minden objektum, amelyet egy esemény megnevez (`Message|a01|b02|...`), azonosító szerint. |
| RecordingInfo | | A felvétel saját tulajdonságai az adott pillanatban - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - JSON-ként. |
| IAS, Mach, AOA, FuelWeight, ... | szűrők | Minden más számszerű tulajdonság, amelyet a felvétel hordoz. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | szűrők | Minden más szöveges tulajdonság, amelyet a felvétel hordoz; egy tulajdonság, amelynek nem szám az értéke, szöveg. |

A Tacview pozíciójának mind a négy formája (`lon|lat|alt`, `u|v`-vel, `roll|pitch|yaw`-lal, és ezek mindegyikével és egy iránnyal) olvasható; az üres mezők megtartják az utolsó értéket; a `-id` eltávolít egy objektumot, és egy azonosító, amelyet utána újra használnak, új objektum. Az escapelt vesszők és a folytatott sorok is kezelve vannak.

A pozíciókat mindig a szélességből és hosszúságból vetítjük, sosem a U/V-ből, így minden játék felvétele egy vetítést oszt meg a valós világ hátterével.
