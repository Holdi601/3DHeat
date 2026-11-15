---
title: "3D ravni"
parent: "Ravni in geometrija ozadja"
nav_order: 2
lang: "sl"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---


# 3D ravni

3D raven je model kraja – hribov, ulic, stavb –, v katerem so vaši podatki. Pokaže, na katerem nadstropju, hribu ali strehi je toplotna karta. Pregledovalnik ga razdeli na kopno (trdno), strukture (prosojne, da lahko pogledate v notranjost) in vodo.

## Naložite 3D raven {#load-a-3d-level}

1. Najprej naložite svoje podatke ([Uvoz podatkov](getting-data-in.md)). Model mora uporabljati isti svetovni prostor in enoto kot podatki, Y navzgor.
2. V **Ozadje / nivo** izberite **Cilj poenostavitve**. Pustite ga na *Polno - brez poenostavitve*, razen če je model zelo velik.
3. Pritisnite **3D-model…** in izberite datoteko `.glb`, `.gltf`, `.obj`, `.stl` ali `.ply`.
4. Počakajte na vrstico napredka. **Prekliči** ga ustavi.
5. Pritisnite **F** v pogledu. Kopno je trdno, strukture so prosojne lupine, voda je ravna.
6. Prilagodite videz v [Videz ravni](level-appearance.md). Pritisnite **Shrani v knjižnico**, da rezultat ohranite ([Knjižnica ravni](level-library.md)).

![Naložena 3D raven: neprosojno kopno s konturnimi črtami, prosojne stavbe, ravna voda](../assets/img/en/model-levels-loaded.webp)

**3D-model…** naloži mrežo ravni. Razčleni se, razvrsti in poenostavi v ozadnjem delavcu ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) z vrstico napredka in **Prekliči**: *Branje modela*, *Razčlenjevanje datoteke*, *Pakiranje N tekstur*, *Razvrščanje N delov*, *Poenostavljanje kopna (N trik.)*, *Poenostavljanje struktur (N trik.)*, *Gradnja žične mreže*.

## Oblike {#formats}

| Oblika | Kaj se prebere | Omejitve |
|---|---|---|
| `.glb` | Vsak primitiv mreže z `mode` 4 (trikotniki) ali brez načina, z uporabljeno svetovno preobrazbo vsakega vozlišča; `POSITION`; `COLOR_0` (vec3 ali vec4) kot barva oglišč; `baseColorTexture` materiala in njegov `TEXCOORD_n` kot tekstura; imena vozlišč in mrež kot imena delov. | Črte in točke so preskočene. |
| `.gltf` | Enako. | Samo z vgrajenimi medpomnilniki: glTF, ki se sklicuje na zunanjo datoteko `.bin`, je zavrnjen s sporočilom *Izvozite kot eno datoteko .glb, da je geometrija vgrajena.* |
| `.obj` | Ploskve, z blokoma `o` in `g` kot deli. | Samo geometrija (brez materialov). |
| `.stl` | Binarni in ASCII (`solid …`). | En del. |
| `.ply` | Samo ASCII. | Binarni PLY je zavrnjen s sporočilom *Pretvorite v .glb ali binarni .stl.* |

Samo geometrija: položaji, normale in trikotniki, zvarjeni v en medpomnilnik, plus barve in koordinate
teksture, kjer so prisotne ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Model brez
trikotnikov je zavrnjen. Model mora biti v istem svetovnem prostoru in enoti kot podatki (Y navzgor):
nič se ne preoblikuje, da bi se prilegalo.

## Kopno, strukture in voda {#ground-structures-and-water}

Raven se ob uvozu razdeli na tri razrede, ker zahtevajo nasprotno obdelavo ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Kopno** – riše se neprosojno in senčeno z znaki reliefa (naklon, konture, lestvica nadmorskih višin), da je položaj mogoče brati glede nanj.
- **Strukture** – stavbe in rekviziti stojijo med kamero in toploto v njih, zato so narisani kot **prosojna lupina** (bledi obrazi s svetlim robom, plus podvojeni robovi odstranjeni) – ali, če so teksturirani, trdni v svojih teksturah.
- **Voda** – ravna, brez znakov terena: obrisna črta čez jezero nima smisla.

Vsak del (vozlišče glTF, predmet OBJ ali skupina) se razvrsti sam, po prvem pravilu, ki velja:

1. **Oznaka izvoznika.** Ime, ki se začne z `ground:`, `structure:` ali `water:` (ali z `|` namesto `:`), se vzame dobesedno. Izvozniki projekta vsak del označijo tako.
2. **Imena vode.** `water` kot beseda (ne *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Imena kopna.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Imena struktur.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometrija.** Del, ki pokriva več kot 25 % območja X-Z zemljevida, z več kot 60 % površine trikotnikov obrnjene navzgor, je kopno. Del z manj kot 45 % obrnjenih navzgor ali višji od 15 % višine ravni, medtem ko pokriva manj kot 10 % njenega območja, je struktura. Delež obrnjen navzgor je tehtan s površino, zato hiša ni razglašena za ravno, ker ima streho.
6. **Sicer kopno** – nejasen del je privzeto kopno, ker bi skoraj nevidna privzeta lupina naredila, da bi raven izgledala kot napaka upodabljanja.

Model, ki je en sam del, razvrščen kot struktura, se namesto tega naredi kot kopno (*en neimenovan model - obravnavan kot kopno*).

### Navigacijske mreže {#navigation-meshes}

Del z imenom `nav:…` (`nav:walkable` izvoznika ravni) je navigacijska mreža: mesto, kjer lahko vojak stoji. Naveden je kot kopno (*navigacijska mreža - ni narisana, ker leži na kopnem; kliki jo vseeno najdejo*), vendar **ni narisan**. Položen je čez kopno, iz katerega je nastal, skoraj v isti ravnini do nekaj centimetrov; če bi bili obe površini narisani kot kopno, bi se borili za vsako slikovno piko: na ravni s pečeno teksturo tal bi se celotno igralno območje pokazalo kot ostro omejene lise sive in bež barve, po ena za vsak trikotnik nav. Ohranjena je, nepoenostavljena, da lahko [izbira s klikom](camera.md#click-to-pick) pove, ali je mesto prehodno. Vnosi v knjižnici je ne ohranijo.

**Pokaži razvrstitev delov (N)** na plošči (prikazano za modele z več kot enim delom) našteje vsak del z njegovim razredom in razlogom – *označil izvoznik*, *ime se ujema z vzorcem*, *pokriva X % zemljevida, Y % obrnjeno navzgor*, *Y % obrnjeno navzgor, Z % višine ravni*, *nejasno – privzeto kopno*. Če želite enega spremeniti, preimenujte del v izvornem modelu in uvozite znova; razdelitev je vpečena v medpomnilnike indeksov.

## Poenostavitev {#simplification}

**Cilj poenostavitve** določi proračun trikotnikov za naslednji uvoz ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Nastavitev | Trikotniki |
|---|---|
| *Polno - brez poenostavitve* (privzeto) | vsi |
| *Visoko - 8M trikotnikov* | 8.000.000 |
| *Srednje - 3M trikotnikov* | 3.000.000 |
| *Nizko - 800k trikotnikov* | 800.000 |
| *Silhueta - 100k trikotnikov* | 100.000 |

Proračun se razdeli **60 % na strukture in 40 % na kopno**, poenostavljeno ločeno – strukture najhitreje izgubijo obliko pri redčenju. Voda se ne poenostavlja. Poenostavitev je skrajšanje robov s kvadratnimi metrikami napak ([meshoptimizer](https://github.com/zeux/meshoptimizer), prek WebAssembly), potem ko so sovpadajoča oglišča zvarjena, tako da obrisi in ostri robovi ostanejo. Opomba ob uvozu poroča `vir → zdaj trikotnikov, odklon X %`, razdelitev kopno / strukture / voda po delih in – kadar je bilo uporabljeno *Polno* na modelu nad 8M trikotniki – predlaga *Visoko* (do 30M) ali *Srednje* (nad tem). Brez WebAssembly poenostavitev ni na voljo in uvoz to pove.

Ravni iz lastnih izvoznikov projekta so že omejene s proračunom; cilj obstaja za surove umetniške izdelke brez proračuna.

## Teksture {#textures}

`.glb`, katerega deli nosijo teksture osnovne barve, se riše v njih – izvoz dirkališča je na primer ena na ploščico terena in ena na postavljen model.

Tekstura kopna se prikaže privzeto, kadar obstaja; strukture, ki nosijo teksture, se začnejo **trdne, v svojih teksturah** (robniki, varnostne ograje, stene pnevmatik in znaki so robovi ceste, ne stavbe, v katere bi lahko pogledali), z izklopljeno žično mrežo in izklopljenim ravnim senčenjem. Glejte [Videz ravni](level-appearance.md).

## Velike ravni {#large-levels}

- Nad **300.000** trikotniki struktur se robovi struktur najprej izklopijo, neprosojnost ploskev pa je 35 %: z robom v vsaki slikovni piki okrožje izgleda kot ploska bela.
- Daljna ravnina kamere se razširi, da se prilega ravni ([Ravni](levels.md#what-a-level-does-for-the-heat)).

## Za razvijalce {#for-developers}

### Atlas tekstur {#texture-atlas}

Vsaka tekstura je zapakirana v **en atlas** v delavcu uvoza ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), zato raven ostane en risalni klic, en vzorčevalnik in en atribut koordinat teksture na obeh zaledjih:

- zloženo v police pri vsaki sliki njeni lastni velikosti, skrčeno samo, če niz ne bi zapolnil **8192 slikovnih pik** v nobeni smeri (privzeta meja velikosti teksture WebGPU);
- **16-slikovni rob** okoli vsake slike in samo 5 stopenj mip, ki jih rob ščiti, tako da oddaljen znak nikoli ne vzorči teksture svojega soseda;
- **ponavljajoče se teksture** ostanejo ponavljajoče se. Slika, katere vzorčevalnik glTF se ponavlja (privzeto za glTF) in katere koordinate teksture ostanejo zunaj 0..1 – zidna opeka, katere UV teče od 0 do 40 vzdolž nje – postane *ploščica*: njena oglišča ohranijo svoje koordinate in 16-bitno številko ploščice, senčilniki pa koordinato ovijejo v pravokotnik ploščice na vsako slikovno piko, stopnjo mip pa vzamejo iz neovite koordinate, da se šivi ne pokažejo. Rob ploščice vsebuje svoj nasprotni rob. Os, katere vzorčevalnik omejuje, je omejena; slika, katere koordinate ostanejo znotraj 0..1, se riše kot prej. Raven s ploščicami stane 4 bajte več na oglišče.

### Pogodba izvoznika {#the-exporter-contract}

Kaj pregledovalnik potrebuje od ravni, ne glede na to, kdo jo je naredil:

- en sam samostojen `.glb`;
- `POSITION` float32, primitivi trikotnikov;
- imena vozlišč `ground:*`, `structure:*` in `water:*` (vse drugo se razvrsti po zgornjih pravilih), ter `nav:*` za navigacijsko mrežo, ki je ohranjena, a ni narisana;
- koordinate svetovnega prostora, **Y navzgor**, v isti enoti kot telemetrija, tako da podatki ležijo na ravni brez koraka umeščanja.

