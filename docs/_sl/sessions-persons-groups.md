---
title: "Seje, osebe in skupine"
parent: "Uvoz podatkov"
nav_order: 4
lang: "sl"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Seje, osebe in skupine

**Oseba** je ena premikajoča se stvar (igralec, avto). **Ekipa / skupina** je stran, ki ji pripadajo. **Seja** je ena tekma ali krog. Glejte [slovar pojmov](glossary.md).

Ena vrstica datoteke lahko poimenuje vse tri:

| x | y | čas | igralec | ekipa | tekma |
|---|---|---|---|---|---|
| 10,5 | -30,2 | 12,0 | Blue 1 | Blue | Match 01 |

`player` je oseba, `team` je skupina, `match` je seja.

Trije izbirni stolpci opisujejo, *komu* in *kje v zgodbi* vrstica pripada. Vsak je ob nalaganju kodiran s slovarjem: besedilne vrednosti postanejo majhni celoštevilski ID-ji na vrstico in en seznam oznak, deljen med vsemi datotekami nalaganja.

## Oseba {#person}

Stolpec **ID osebe** poimenuje premikajočo se stvar, ki ji vrstica pripada: igralca, bota, avto. Shranjen je kot 32-bitni ID na vrstico.

Z osebo in stolpcem časa nalaganje izračuna **življenjsko dobo** vsake vrstice: čas do naslednjega vzorca iste osebe *v isti seji*, ali „nič” (čuvaj, -1), kadar naslednjega vzorca ni - oseba je umrla, odšla ali se je dnevnik končal. Življenjske dobe poganjajo zgodovino **Življenjska doba** [časovnice](timeline.md), interpolacijo in zastarelost v [predvajanju škatle](box-replay.md) ter prekinitve tras v [toploti črt](line-heat.md). Kaj naredi vrstica brez naslednika, je nastavitev prikaza (*Rezervna življenjska doba*), ni vgrajeno v podatke.

Vsaka oseba dobi skupino svoje **prve** vrstice v času; ta dodelitev obarva njeno škatlo v predvajanju škatle in določi, katero preklopno stikalo vidnosti skupine jo tam skrije. Načini toplote uporabijo skupino vsake vrstice posebej.

### Imena, ki jih nosi več stvari hkrati {#names-worn-by-several-things-at-once}

Ime ni vedno ena entiteta: v nekaterih izvozih vsak bot vsake tekme beleži pod enim imenom. Če se dva vzorca takšne „osebe” povežeta - z interpolacijo, sledjo ali potjo - čez zemljevid se nariše črta med dvema različnima bitjema.

Ob nalaganju ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) je ime označeno kot **skupno**, kadar sta dva njegova zapisa

- v isti seji,
- ob istem času,
- iste vrste (vsaka ohranjena vrednost stolpca kategorije ima isto vrednost), in
- oddaljena več kot 1 % diagonale razsežnosti podatkov.

Skupna imena se rišejo kot posamezni vzorci - brez interpolacije, brez sledi, brez poti toplote črt. Vse ostalo o njih (njihova toplota) je nespremenjeno. Plošča Nabor podatkov navede, koliko imen je bilo označenih, z do tremi primeri, plošča predvajanja škatle pa ponovi število.

## Seja {#session}

Stolpec **Seja / tekma** pove, kateri tekmi, napadu, rundi, vožnji ali krogu vrstica pripada. Zaradi njega so vzorci osebe ena neprekinjena pot: prave telemetrije pogosto prepletajo sočasne tekme, vzorec igralca tik pred glavo predvajanja in tisti tik za njo pa sta lahko iz različnih tekem sto metrov narazen. S stolpcem seje:

- se interpolacija, sledi in poti toplote črt nikoli ne prečkajo spremembe seje;
- se življenjska doba vrstice konča ob koncu njene lastne seje;
- se na vrhu stranske vrstice, pod vrstico načinov, pojavi izbirnik **Seja**.

Stolpec seje je zelo pogosto *časovni žig* - trenutek začetka tekme, ponovljen na vsaki vrstici te tekme. Samodejni preslikovalnik zato išče imena sej pred osebo in skupino ([Dodelitev stolpcev](column-mapping.md#session-person-group)). Dirkaški krog ali postanek je prav tako seja: dva kroga istega avtomobila se ne smeta združiti v eno progo.

### Izbirnik seje {#the-session-picker}

![Izbirnik seje odprt pri datoteki desetih tekem: Vse seje (10), Match 01, Match 02 in tako naprej](../assets/img/en/sessions-persons-groups-picker.webp)

*Deset tekem v eni datoteki: izberite eno ali jih poglejte vse.*

Prikaže se, kadar ima nabor podatkov navedene seje (glejte omejitev spodaj).

| Del | Pomen |
|---|---|
| Oznaka na desni | Število vrstic izbrane seje ali *vse hkrati*. |
| Meni | *Vse seje (N)*, nato vsaka seja, najbolj zasedena najprej, kot `oznaka - N vrstic, razpon` (razpon v sekundah pod 90 s, minutah pod 90 min, urah nad tem). |
| Jantarni namig | Prikazan pri *Vse seje*: položaji se še vedno nikoli ne povežejo čez seje, vendar sočasne tekme na zemljevid postavijo nepovezane igralce skupaj. |
| Namig | Prikazan v načinih toplote, ko je izbrana ena seja: izbira samo premakne glavo predvajanja. |

Ob nalaganju se izbere najbolj zasedena seja. Izbira seje premakne glavo predvajanja na začetek te seje.

Kaj izbira spremeni:

- V **[predvajanju škatle](box-replay.md)** določi, katera seja se predvaja: narisane so samo škatle in sledi te seje, obseg časovnice pa postane lasten obseg seje.
- V **načinih toplote** ne omeji toplote, namig pod izbirnikom to pove: *V načinih toplote ta izbira samo premakne glavo predvajanja na začetek seje; toplota še vedno šteje vse seje. Predvajanje škatle predvaja samo izbrano sejo.* Da omejite toploto na eno sejo, obdržite tudi stolpec seje kot stolpec filtra (*Ohrani za filtriranje*) in filtrirajte po njem. Stolpec je lahko hkrati stolpec seje in stolpec filtra: nalagalnik prebere vsak označen stolpec filtra posebej, ne glede na to, katero vlogo še igra.

### Preveč sej {#too-many-sessions}

Navedenih je do **100.000** sej. Čez to je stolpec v resnici ID (mapa z milijoni sej po nekaj vrstic vsaka), pošiljanje toliko oznak iz delavca na stran pa je tisto, kar izpraznii zavihek pomnilnika. Nalaganje tedaj ohrani **ID-je** sej - tako so meje še vedno uveljavljene povsod - vendar opusti oznake in izbirnik, plošča Nabor podatkov pa to pove.

## Skupina {#group}

Stolpec **Ekipa / skupina** je poljuben stolpec z malo vrednostmi: ekipa, stran, odred, frakcija, zastavica igralec proti UI, razred avtomobila. Shranjen je kot 16-bitni ID na vrstico in poganja:

- [Seznam ekip](teams-list.md) (vidnost po skupini, + / − strani),
- [toploto ekip](team-heat.md) (odtenek na skupino),
- [razliko](difference.md) razdeljeno po skupinah,
- barve škatel v [predvajanju škatle](box-replay.md) (družina odtenkov na skupino, senca na člana).

### Omejitve {#limits}

Največ **4.096** različnih skupin. ID skupine se prenaša v četrtem kanalu vsakega slikovnega elementa položaja na GPU, vsaka skupina pa potrebuje slikovni element v tabeli predznakov široki 4.096, ki jo senčilnik bere, da odloči *skrito*, *prišteto* ali *odšteto*. Stolpec z več različnimi vrednostmi je ID, ne skupina: **nalaganje ohrani vsako vrstico in zavrže samo združevanje**, z opozorilom na naboru podatkov, ki predlaga, naj ga preslikate kot stolpec osebe ali ohranite kot stolpec filtra.

Enaka omejitev 4.096 velja za ohranjen stolpec filtra *kategorije*; širši stolpec ni ohranjen in nabor to pove. Številski stolpec (na primer časovni žig) pa te omejitve nima kot filter *razpona*.

Vrednosti skupine `0`, prazna vrednost, `none`, `unknown`, `null` in `-1` (neodvisno od velikosti črk) pomenijo „brez skupine” za [toploto ekip](team-heat.md), ki jih riše kot nevtralno sivo, ne kot samozavestno barvo.

## Velikost entitete {#entity-size}

Kako velika je ena sledena stvar - trkalni okvir igralca, avtomobil - določi, kako veliki sta škatli in žarki pogleda [predvajanja škatle](box-replay.md). Za to v plošči ni polja; pride iz [namigov `heat3d`](data-formats.md#the-heat3d-hints) datoteke (`entity.size`, v enotah datoteke; pretvornik CS2 zapiše 32). Nalaganje to pomnoži z merilom enot.

Ob vsakem nalaganju ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), kjer je *razsežnost* večji od razponov X in Z podatkov:

| Nastavitev | Z velikostjo entitete | Brez nje |
|---|---|---|
| Velikost kocke | velikost entitete | razsežnost / 500 |
| Dolžina žarka pogleda | velikost entitete × 4 | razsežnost / 200 |
| Polmer pike | razsežnost / 120 | razsežnost / 120 |
| Točka nasičenja | analitična ocena (nato izmerjena) | enako |
| Hitrost letenja | razsežnost / 12 | enako |
| Daljna ravnina | razsežnost × 12 | enako |
| Bližnja ravnina | največ(0,05; razsežnost / 20.000) | enako |

## Plošča Nabor podatkov {#the-dataset-panel}

Pod ploščo Vir. Ko je nabor podatkov naložen, prikaže:

- **ime** nabora - izbiro, število vrstic, število datotek, korak, če je bil uporabljen;
- **`N ekip · N oseb · N s razpon`**;
- vsa **opozorila**, ki jih je nalaganje ustvarilo, v jantarni barvi, dokler je nabor naložen: skupine ali stolpec filtra, opuščena zaradi preveč vrednosti, seje, ki niso navedene, skupna imena, manjkajoče vrstice, preskočene datoteke;
- [sintetični generator](synthetic-generator.md);
- **Odstrani**, ki odstrani nabor podatkov.

Število vrstic je prikazano v glavi plošče.
