---
title: "Kujud"
nav_order: 11
has_children: true
lang: "et"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Kujud

**Kuju** on väike 3D-mudel sellest, mis üksus tegelikult on: tank, reaktiivlennuk, laev, sõdur. [Kordus](match-replay.md) joonistab iga üksuse tema kujuna õiges suuruses, mitte lihtsa kastina.

Kataloogis on umbes 2000 nimega sõidukit, lennukit, laeva, relva ja sõdurit, kõik vaaturi enda ehitatud.

![Demo tankid, joonistatud nende omade kujudena](../assets/img/en/replay-tanks.webp)

## Mis on kataloogis {#what-is-in-the-catalogue}

| Valdkond | Näited |
|---|---|
| Inimesed | sõdur seisab, kükitab, lamab; snaiper, tankitõrje, meditsiinitöötaja, meeskond |
| Maismaa | tankid, jalaväe lahingumasinad, õhutõrje, suurtükivägi, veokid ja autod, rongid ja trammid |
| Õhk | hävitajad, rünnakulennukid, pommitajad, transpordilennukid, helikopterid, kahetiivalistest kuni kaasaegsete reaktiivlennukiteni |
| Meri | sõjalaevad klasside kaupa, lennukikandjad, allveelaevad, paadid, kaubalaevad |
| Relvad | raketid, rakettid, pommid, torpeedod, valgussoojuslõksud ja tinakitid |
| Märgid | suits, välk- ja süütegranaadid, paigaldatud pommid, lipud, spawnid, teepunktid |

## Kuidas kujud on tehtud {#how-the-figures-are-made}

- **Tehtud avaldatud mõõtmete järgi.** Enamik kujusid on tehtud vaaturi enda kujuehitaja poolt avalike arvude järgi: pikkus, laius, kõrgus, rattad, torn ja kanon, tiivad ja saba. Nende kuju on seejärel häälestatud avalike fotode, jooniste ja avaldatud mõõtmete järgi. Ühegi mängu mudeleid ei kasutata.
- **Vabad mudelid.** Mõned kujud kasutavad vabu 3D-mudeleid (CC0 või CC BY), kus need on tõesemad, mõnikord koos ehitatud kerega. CC BY tööde autoreid tunnustatakse lehel [Kujude autorlus](figure-credits.md); CC0 tööd ei vaja tunnustust ja neid seal ei loetleta.
- Igal kujul on täielik, kärbitud ja kauge versioon (detailsustasemed, LOD), nii et tuhandeid saab joonistada korraga.

## Millise kuju üksus saab {#which-figure-a-unit-gets}

Vaatur vaatab andmete enda veerge:

1. **Nimed** - veerud nimedega *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* või *Figure* - sobitatakse kataloogiga: täpselt, umbes 4000 alias kaudu (mitme mängu üksuste id-d), pikima tuntud algusega (`F-16C_50` on F-16C) või lühima kujunimega, mis algab sellega.
2. Nimi, mille kuju ei sobi üksuse **tüübiga**, ei kasutata (veokit nimega *Typhoon* ei ole hävitaja).
3. **Tüübid** - veerud nimedega *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* või *Domain* - annavad klassikuju: Tacview sildid (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kaardiikoonid või tavasõnad (tank, helikopter, jalavägi).
4. Andmed, millel pole kumbagi, on inimeste andmed: kõik on sõdurid.

Seega kõige lihtsam viis õigete kujude saamiseks on `vehicle` veerg õigete nimedega või `type` veerg Tacview siltidega.

**Minu üksus on kastina või sõdurina.** Lisa `vehicle` veerg õige nimega või `type` veerg Tacview sildiga. Üksuse kohale hiirt viies näed, millist nime sobitati. Andmed, millel need veerud on, aga üksusest midagi ei ütle, jätavad selle kastiks; andmed, millel pole kumbagi, joonistatakse sõduritena.

## Seaded {#settings}

Kordusküljeriba jaotis **Kujud** seab suuruse, väikseima suuruse ekraanil, mis saavad kaugetest üksustest (kuju, nool, tähis) ja neil joonistatud efektid. Vt [Matši kordus](match-replay.md#figures). Suits, tulekahju ja muud ajastatud efektid: [Kujude ülekattes olevad kujud](figure-replay.md).

## Valikuline kohalik kujupakk {#an-optional-local-figure-pack}

Sa võid hoida oma arvutis valikulist enda kujupaki. Selle kujud võtavad koha kataloogikujude eest, millel on samad nimed. See ei ole kunagi hoidla ega avaldatud versiooni osa; ilma selleta ei muutu midagi.
