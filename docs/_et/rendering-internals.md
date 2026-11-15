---
title: "Renderdamise sisemine tööpõhimõte"
nav_order: 22
has_children: true
lang: "et"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Renderdamise sisemus

Vaataja joonistab miljoneid punkte helendavate laikudena ja liidab need kokku. See jaotis selgitab nippe, mis teevad selle kiireks, ja seda, mida statistikakatte numbrid tähendavad. Loe seda, kui vaatajat tundub aeglane või kui tahad renderdajaga töötada.

```
andmed -> ajaaken -> GPU filtrid -> proovivõtuplaan -> splat -> kogumine -> värv -> ekraan
```

Oma arvuti tööd näed vaate paremas ülanurgas olevast statistikakastist: [Jõudluspaneel ja statistika](performance-and-stats.md). Uued sõnad (GPU, rida, sprite, soojuskaart) on [sõnastikus](glossary.md).

## Põhiprobleem {#the-core-problem}

Kattuvate radiaalsete rampide summa maksab *N* × π*r*² segatud fragmenti kaadri kohta. 8 px raadiusega 100 miljoni spraidi puhul on see 2 × 10¹⁰ fragmenti, ehk umbes sekund tööd tipptasemel GPU-l. Seda ei saa igal kaadril jõuga läbi arvutada, seega vaataja kombineerib:

- **aja järgi sorteeritud read**: ajaakna leidmine on kaks binaarotsingut ja taasesituse maksumus sõltub ridadest aknas, mitte kogu andmestikust;
- **ühtegi rida ei töödelda kaadri kohta CPU-l**: read elavad GPU mälus kvantiseeritult; filtrid, grupimärgid, eluea test, aken, varjestus ja lõige arvutatakse tipu-shaderis;
- **kihiline proovivõtt** kompenseerivate kaaludega, kui kaader ei jõua joonistada kõiki ridu, ning **järkjärguline kogumine**, mis koondub täpseks vastuseks kõigi ridade kohta, kui vaade jääb paigale ([Valimi võtmine ja eelarved](sampling-and-budgets.md), [Akumulatsioon](accumulation.md));
- **kahe astmeline piiraja**, mis vahetab kaadri kohta spraitide arvu ja seejärel soojuse lahutuse vastu kaadrisageduse ([Valimi võtmine ja eelarved](sampling-and-budgets.md#the-adaptive-budget));
- **jõustatud mälueelarved**, nii et andmestik, mis ei mahu, lõigatakse nähtavalt, mitte ei jookse kokku ([GPU mälu residentsus](gpu-memory.md)).

## Üks kaader {#one-frame}

Kaadritsükkel on [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Kõik, mis muutub kaadri sagedusega (kaamera, mängupea, eelarve), elab mootoris, mitte rakenduse olekus. Seega ei maksa kaader Reacti tööd; olek loetakse kaadri kohta üks kord ja kirjutatakse tagasi ainult madala sagedusega näitudele.

1. **Uued andmed?** Uus andmestik kuulutatakse ühel kaadril (*Laadin N rida GPU-le*) ja üles laaditakse järgmisel, nii et teade joonistatakse enne, kui töö lõime blokeerib. Uus tase antakse renderdajale; joone soojuse marsruudid luuakse või vabastatakse.
2. **Mängupea** liigub edasi (kuni 0,1 s seinakella aega kaadri kohta), kordub või peatub.
3. **Kaamera** loeb klahvid, hiire ja mängupuldi; telje peegeldus liidetakse vaatemaatriksisse; WebGPU-l teisendab sügavuse ümbervormingu maatriks three.js-i OpenGL-stiilis sügavusvahemiku WebGPU-le sobivaks.
4. **Mis on nähtav**: ajavahemik ajajoonelt ja ajaloost; grupimärkide tabel (nähtavus ainult veeru järgi jagamisel); kuni neli filtrit: veerufiltrid ja valik Üksused; erinevuse jagamine.
5. **Värvi- ja kõveratabelid** luuakse uuesti, kui nende seaded muutusid.
6. **Eelarve**: kohanduv kontroller seab selle kaadri spraitide eelarve ja soojuse lahutuse; kui on valitud *Joonista igas kaadris kõik read*, tõstetakse eelarve nii, et see katab kõik kandidaatread.
7. **Signatuurid** otsustavad, mida kogumispuhver veel tähendab: muutus, mis mõjutab seda, millised read panustavad või kuidas (*geomeetria*), ajaakent või ainult tulemuse värvimist (*komposiit*). Vt [Akumulatsioon](accumulation.md#what-restarts-it).
8. **Proovivõtuplaan**: millised ridade plokid joonistada ([Valimi võtmine ja eelarved](sampling-and-budgets.md)).
9. **Kogumisrežiim**: lähtesta, pikenda, libisev keskmine, jooksev keskmine või seisma.
10. **Kastide replay geomeetria** (kuubid, jäljed) CPU-l, ainult selles režiimis ja ainult siis, kui ei seisata.
11. **Renderdamine**: taustsüsteem joonistab stseeni (tase, võrk, teljed, kastid, jäljed, joonlaud), laotab soojuse soojussihtmärgile, liidab selle kogujasse ja komponeerib soojuse stseeni kohale canvasele.
12. **Automaatne säritus** käivitub, kui selle loendur jõuab nullini; joonlaua soojuse sond loeb üht pikslit korraga, kuid mitte sagedamini kui iga 120 ms; näidud avaldatakse.

Seisev kaader (koondunud, midagi ei muutunud) jätab stseeni ja splatimise vahele, kuid **komponeerib ikkagi uuesti**. WebGL-canvase sisu on pärast komposiitimist määratlemata, kui seda ei loodud `preserveDrawingBuffer`-iga, seega pole ohutu eeldada, et see jätab viimase kaadri alles. Stseeni ja soojussihtmärgid on vaataja enda kaadripuhvrid ja need säilitavad sisu, nii et seisev kaader maksab ühe täisekraanilise passi.

## Selle jaotise lehed {#pages-in-this-section}

- [Kaks renderdajat](backends.md): WebGPU ja WebGL2, kuidas üks valitakse, URL-i lülitid
- [Akumulatsioon](accumulation.md): lähtesta, pikenda, libisev keskmine, jooksev keskmine
- [Valimi võtmine ja eelarved](sampling-and-budgets.md): kihiline proovivõtja, täpne režiim, kohanduv eelarve
- [Pooltäpne akumulatsioon](half-float-accumulation.md): ulatus ja täpsus 16-bitistel sihtmärkidel
- [GPU mälu residentsus](gpu-memory.md): kvantiseeritud ridade salvestus ja jõustatud GPU eelarve
- [Tarkvaralise renderduse tuvastamine](software-rendering.md)
- [Jõudluspaneel ja statistika](performance-and-stats.md)
