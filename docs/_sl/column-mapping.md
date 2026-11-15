---
title: "Preslikava stolpcev"
parent: "Uvoz podatkov"
nav_order: 2
lang: "sl"
source: "column-mapping.md"
source_hash: "9d5e1f5e0c62"
translated: true
outdated: false
---

# Dodelitev stolpcev

Datoteka je tabela, 3DHeat pa mora vedeti, kateri stolpec hrani položaj vzhod-zahod, kateri čas, kateri ime igralca in tako naprej. Ta plošča pove, kaj je uganil, in tu popravite napačno ugibanje.

![Plošča Dodelitev stolpcev po nalaganju datoteke Parquet: vsa polja že izpolnjena - 1 X, 2 Y, 3 Z, 4 Čas, 5 ID osebe, 6 Seja / tekma, 7 Ekipa / skupina](../assets/img/en/column-mapping-panel.webp)

*Datoteka je poimenovala svoje stolpce, zato so vsa polja že izpolnjena.*

Na primer, CSV z glavo `x,y,z,t,player,team` se dodeli sam: x, y in z postanejo položaj, `t` čas, `player` [oseba](glossary.md) in `team` [skupina](glossary.md).

Ko izberete datoteke, se pod ploščo Vir odpre plošča **Dodelitev stolpcev**. Pove, kateri stolpec igra katero vlogo. Izpolni se samodejno, vsako polje pa je mogoče spremeniti, preden pritisnete **Naloži**; dodelitev se prebere ob nalaganju, zato je po spremembi treba znova naložiti.

## Polja {#the-fields}

Vsi meniji stolpcev navajajo vsak stolpec prve datoteke, plus *- nič -*.

| Polje | Vloga | Opombe |
|---|---|---|
| **Ločilo** | Samo CSV: ločilo polj. | Meni: *Vejica ,*, *Podpičje ;*, *Tabulator*, *Navpična črta \|*, *Presledek*; ali vpišite poljuben en znak v *ali vpišite en znak*. Zazna se samodejno (glejte spodaj). Sprememba znova zažene samodejno dodelitev, zato se prej narejeni popravki izgubijo. |
| **X**, **Y**, **Z** | Položaj. | Potrebni sta vsaj dve; nedodeljena tretja os je 0 (podatki ležijo na ravnini). Isti stolpec na dveh oseh je napaka. |
| **Os navzgor v viru** | Katera izvorna os kaže navzgor. | *Z je navzgor (večina igralnih pogonov)* ali *Y je navzgor (grafična konvencija)*. Glejte [Osi, enote in čas](axes-units-and-time.md). |
| **Merilo enot** | Pomnoži vsak položaj. | Gumba *1 (m)* in *0,01 (cm→m)*, ali vpišite vrednost. |
| **Obrni X / Obrni Y / Obrni Z** | Zanika izvorno os. | Uporabi se na položajih in na vektorjih smeri pogleda. |
| **Čas** | Časovna os. | Izbirno. Brez njega ni časovnice. |
| **Enota časa** | Kako brati stolpec časa. | Sedem enot; glejte [Osi, enote in čas](axes-units-and-time.md#time). Pri stolpcih Parquet `TIMESTAMP`/`DATE` se prezre, kar plošča pove. |
| **ID osebe** | Kdo ali kaj pripada vrstici. | Izbirno. Omogoča poti, življenjske dobe, predvajanje škatle in toploto črt. |
| **Seja / tekma** | Kateri tekmi, napadu, rundi, vožnji ali krogu pripada vrstica. | Izbirno. Položaji se nikoli ne interpolirajo, ne vlečejo in ne povežejo v traso čez spremembo seje. Glejte [Seje, osebe in skupine](sessions-persons-groups.md). |
| **Ekipa / skupina** | Poljuben stolpec z malo vrednostmi. | Izbirno. Poganja barve skupin, toploto ekip in delitev razlike po skupinah. |
| **Smer pogleda** | *Brez*, *Stolpci zasuka / naklona* ali *Stolpci vektorja smeri*. | Z zasukom/naklonom: **Zasuk**, **Naklon** in **Enota kota** (*Stopinje* / *Radiani*). Z vektorjem: **Smer X**, **Smer Y**, **Smer Z**. Uporablja se za žarke pogleda [predvajanja škatle](box-replay.md). |
| **Ohrani za filtriranje** | Dodatni stolpci, ohranjeni v pomnilniku. | Potrditveno polje za vsak stolpec, pri vsakem označenem pa *razpon* (številsko) ali *kategorija*. Vsak stane 4 bajte na vrstico in en prehod dekodiranja ob nalaganju. Filtrirati, uporabiti za [delitev razlike](difference.md) ali kot stolpec dogodkov [toplote črt](line-heat.md) je mogoče samo ohranjene stolpce. |
| **Prikaži vzorčne vrstice** | Tabela prvih 12 vzorčenih vrstic, vsi stolpci. | Za preverjanje ugibanj. |

Označen stolpec filtra, ki ni izrecno nastavljen, se bere kot *razpon*; stolpec ID-jev, ki izgleda številsko, je pogosto bolj uporaben kot *kategorija*. Hkrati sta lahko aktivna samo 4 filtri ([Filtri](filters.md)).

## Kako samodejna dodelitev ugiba {#how-the-auto-mapping-guesses}

Ugibanje je v [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Gleda na imena stolpcev, na to, kateri stolpci so številski v vzorčenih vrsticah (več kot 90 % neprazne vrednosti se razčleni kot številka), na to, koliko različnih vrednosti zavzame vsak stolpec v vzorcu, in na logične tipe Parquet. Vzorci imen se preizkusijo po vrsti, neodvisno od velikosti črk, in prvi vzorec, ki se ujema s katerim koli še prostim stolpcem, zmaga.

### Položaj {#position}

| Os | Vzorci imen, po vrsti (samo številski stolpci) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Če je os še prazna, prvi prosti številski stolpci (brez `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) jo zapolnijo po vrsti. Napačno ugibanje je na zaslonu očitno; prazno bi pustilo prazen pogled.

### Čas {#time}

- **Najprej stolpci časovnega žiga Parquet.** Med stolpci, katerih logični tip je `TIMESTAMP` ali `DATE`, se najboljši izbere po oceni: +10.000, če ime ustreza vzorcu časa, -5.000 za navaden `DATE`, plus število različnih vrednosti v vzorcu. Datum celega dne in konstantni začetek seje imata skoraj nič različnih vrednosti, zato zmaga trenutek dogodka. Enota je nato *Unix časovni žig (ms)*.
- **Sicer po imenu:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, nato imena pretečenega časa (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Enota se nato ugiba iz vrednosti: ISO-8601, kadar vrednost izgleda kot `YYYY-MM-DDT…` ali `YYYY-MM-DD …`; sicer po največji velikosti: nad 10^17 nanosekund, nad 10^14 mikrosekund, nad 10^11 Unix milisekund, nad 10^8 Unix sekund, nad 10^6 milisekund, sicer sekunde.

Ko je izbran stolpec pretečenega časa, plošča zabeleži, da je vsaka seja nato poravnana na svoj začetek - dobro za prekrivanje tekem, ne za ogled v pravem zaporedju.

### Seja, oseba, skupina {#session-person-group}

Seja se prevzame **po** časovni osi in **pred** osebo in skupino, ker je stolpec seje pogosto časovni žig (trenutek začetka tekme na vsaki vrstici tekme).

| Vloga | Vzorci imen, po vrsti |
|---|---|
| Seja | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (vsak natanko, po izbiri z `_id`) |
| Oseba | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, nato `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (podatki dirk: premika se avto) |
| Skupina | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Skupina, rezerva | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result`, `event_env`, `playtest_id` |

Kandidat za skupino, ki na večini vzorčenih vrstic zavzame različno vrednost (več kot max(48, 60 % vzorca)), je ID, ne skupina: postane stolpec osebe, če ga ni bilo najti, in se ne uporabi kot skupina. Če sploh ni bilo najdenega stolpca skupine, se uporabi nenumerični stolpec z najmanj različnimi vrednostmi med 2 in 12.

### Smer pogleda {#look-direction}

Številski stolpec z imenom `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` ali `rot_z` / `rotation_z` preklopi smer pogleda na zasuk/naklon; naklon se išče kot `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Predpostavljene so stopinje, kadar je katerikoli vzorčeni zasuk po absolutni vrednosti večji od 7, sicer radiani. Vektor smeri se nikoli ne ugiba; pride iz namigov spodaj ali od vas.

### Stolpci filtra {#filter-columns}

Samodejno se ohrani največ **6** stolpcev, razvrščenih:

1. `region`, `sessionMode`, `actor` - stolpci, ki obstajajo zato, da se filtrirajo (ocena 1200);
2. stolpci kategorij, ki se spreminjajo v vzorcu, z manj različnimi vrednostmi najprej (1000 minus število);
3. stolpec, konstanten v vzorcu, vendar samo pri nalaganju več datotek - lahko se razlikuje med datotekami, na primer regija ali ID preskusne vožnje (600);
4. številski stolpci (500).

Stolpci, ki že igrajo vlogo, zgoraj našteta šumna imena, stolpci, konstantni pri nalaganju ene datoteke, in stolpci prostega besedila (več kot max(16, polovica vzorca) različnih vrednosti) se samodejno ne ponudijo. Vsak stolpec je še vedno mogoče označiti ročno.

### Os navzgor {#up-axis}

Ko so vse tri osi dodeljene, se os z manjšim razmikom Y in Z v vzorcu vzame kot navzgor (zemljevid je veliko širši kot višji); sicer se predpostavi Z navzgor.

## Namigi `heat3d` v nogi Parquet {#the-heat3d-hints-in-a-parquet-footer}

Datoteka Parquet lahko pove, kako naj se bere. Če ima metapodatki ključ/vrednost v nogi datoteke vnos s ključem **`heat3d`**, se njegova vrednost razčleni kot JSON in naloži čez ugibanja ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Pretvornik demo datotek CS2 tak vnos zapiše, zato se njegove tabele odprejo z igralcem kot osebo, stranjo kot skupino, vsako rundo kot sejo, smerjo pogleda vklopljeno in svetom v pravilni smeri.

Za namige se prebere samo **prva** datoteka izbire. Vsak vnos je izbiren, vsaka namigovana vrednost pa se vseeno prikaže na plošči in jo je mogoče spremeniti. Popoln opis sheme, s primerom in načinom zapisa, je v [Referenci oblik podatkov](data-formats.md#the-heat3d-hints).

Pravila na kratko:

- Stolpec, ki ga imenuje namig, se uporabi samo, če ga datoteka ima.
- `lookMode: "vector"` začne veljati samo, kadar so `dirX`, `dirY` in `dirZ` vsi nastavljeni; `"yawPitch"` samo, kadar je nastavljen `yaw`.
- `extra`, če je prisoten, nadomesti samodejni seznam filtrov (neznana imena in stolpci, ki že igrajo vlogo, odpadejo); tip razpon/kategorija vsakega sledi temu, ali je videti številski. Kadar ga ni, se samodejni seznam ohrani brez stolpcev, ki so dobili vlogo po namigu.
- `axes.up` mora biti `"y"` ali `"z"`, obrati morajo biti logične vrednosti, `scale` mora biti pozitiven.
- `entity.size`, kadar je pozitiven, je velikost ene sledene stvari v enotah datoteke ([velikost entitete](sessions-persons-groups.md#entity-size)); je edini način, da jo nastavite.

## Znana napaka: prepisovanje ločila CSV {#known-issue-overriding-the-csv-separator}

Ko spremenite ločilo na drugačno od zaznanega, se seznam stolpcev in vzorčne vrstice ne spremenijo (predogled še vedno deli z zaznanim ločilom). Izbrano ločilo se še vedno uporabi za samo nalaganje. Če je zaznano ločilo napačno:

1. Odprite datoteko v urejevalniku besedila.
2. Zamenjajte ločilo z vejico povsod (in decimalne vejice s piko).
3. Shranite in nato znova naložite datoteko.

Vzrok je v [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
