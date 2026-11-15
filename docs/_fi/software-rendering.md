---
title: "Ohjelmistopiirron tunnistus"
parent: "Piirron sisäiset"
nav_order: 6
lang: "fi"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Ohjelmistopiirron tunnistus

Jos selaimesi piirtää pääprosessorilla näytönohjaimen sijaan, katselija on moninkertaisesti hitaampi. Katselija huomaa tämän ja näyttää punaisen laatikon, joka kertoo, mikä kytkeä päälle.

Kun selaimen laitekiihdytys on pois päältä tai sen ajuri on estetty, se piirtää WebGL:n ja WebGPU:n CPU:lla. Kaikki toimii yhä, moninkertaisesti hitaammin, ja oire on "tämä katselija on käyttökelvottoman hidas minun datallani". Oire osoittaa työkaluun, ei selaimen asetukseen. Siksi katselija katsoo piirtäjän nimen ja kertoo sen ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Banneri {#the-banner}

Kun piirtäjä tunnistetaan varmasti ohjelmistoksi, punainen laatikko ilmestyy sivupalkin yläosaan (välilehdillä Heatmap ja Match), tilapalkin yläpuolelle:

![Punainen banneri: Ajetaan ilman näytönohjainta](../assets/img/en/software-rendering-banner.webp)

> **Ajetaan ilman näytönohjainta.**
> Tämä selain piirtää CPU:lla eikä näytönohjaimella. Se on moninkertaisesti hitaampi, eikä se kestä suuria aineistoja. Kytke laitekiihdytys päälle selaimen asetuksissa (Chrome: Asetukset → Järjestelmä → "Käytä grafiikkakiihdytystä, kun se on saatavilla", sitten käynnistä uudelleen) ja tarkista, että näytönohjaimen ajuri on ajan tasalla.

## Kehittäjille {#for-developers}

### Miten päätös tehdään {#how-it-decides}

Piirtäjän merkkijono (WebGL2:n `UNMASKED_RENDERER_WEBGL` tai WebGPU:n sovittimen valmistaja, arkkitehtuuri ja laite) muutetaan pieniksi kirjaimiksi ja luokitellaan:

- **software**, kun se sisältää `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` tai `generic renderer`;
- **hardware**, kun se sisältää tunnetun GPU-valmistajan tai -perheen (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unknown** muulloin.

Vain *software* nostaa bannerin. Tunnistamaton sovitin ei sano mitään. Toimivan näytönohjaimen omistajan lähettäminen säätämään selaintaan on pahempi virhe kuin yhden tapauksen huomaamatta jääminen.

### Lyhyt nimi {#the-short-name}

Sama moduuli lyhentää piirtäjän merkkijonon näyttöä varten. ANGLE-merkkijonosta, kuten `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, se säilyttää laitekentän, pudottaa PCI-tunnuksen sekä lopun API:n ja varjostinmallin, ja näyttää `Vendor Model`. Lyhyt nimi näkyy kohdassa **Resurssibudjetit**, ja koko merkkijono on sen työkaluvihje. Muistiarvio näyttää koko merkkijonon.
