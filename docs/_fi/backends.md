---
title: "Kaksi taustaohjelmaa"
parent: "Piirron sisäiset"
nav_order: 1
lang: "fi"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Kaksi taustaohjelmaa

Selain voi antaa sivulle pääsyn näytönohjaimeen kahdella tavalla: WebGPU (uudempi) ja WebGL2. Katselija voi käyttää molempia ja valitsee itse parhaan, joten sinun ei yleensä tarvitse tehdä mitään. Näet, kumpaa käytät: **Rajapinta** tilastopaneelissa (näkymän oikeassa yläkulmassa).

![Tilastopaneeli: Rajapinta, FPS, Kuva, Rivejä ikkunassa, Spritejä / kehys, Budjetti, Lämpöresoluutio, Peitto](../assets/img/en/performance-stats-overlay.webp)

Katselijassa on kaksi täydellistä piirtäjää yhden liittymän takana ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) ja **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Molemmat piirtävät saman kuvan samoilla algoritmeilla. Varjostimet ovat rinnakkain WGSL- ja GLSL ES 3.00 -kielellä. Tilastopaneelin ensimmäinen rivi, **Rajapinta**, kertoo, kumpi on käynnissä. Kun osoitat sitä hiirellä, näkyy syy, miksi WebGPU ei ollut käytössä, jos se ei ollut.

## Kehittäjille {#for-developers}

### Miten valinta tehdään {#how-one-is-chosen}

Canvas voi pitää vain yhtä kontekstityyppiä, joten valinta tehdään kerran ennen kuin mitään piirretään ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Ellei WebGL2:ta ole pakotettu: jos `navigator.gpu` on olemassa, pyydetään sovitin asetuksella `powerPreference: 'high-performance'` ja laite, ja luodaan WebGPU-piirtäjä. Jokainen virhe muistetaan syynä.
2. Jos WebGPU oli pakotettu ja se epäonnistui, pysähdytään. Näkymä näyttää *Cannot initialise the renderer.* ja syyn.
3. Muuten luodaan WebGL2-piirtäjä (pyydetään myös suorituskykyinen sovitin). Jos WebGL2 ei ole käytettävissä tai se ei voi piirtää float-tekstuureihin (`EXT_color_buffer_float`), näkymä näyttää virheen.

`powerPreference: 'high-performance'` estää sen, että kannettava, jossa on kaksi näytönohjainta, antaa sivulle sisäisen näytönohjaimen. Sen jälkeen sivulla ei ole muuta sanaa: laitteistokiihdytys on selaimen asetus.

### URL-kytkimet {#url-switches}

Lisää ne sivun osoitteen perään, esimerkiksi `http://127.0.0.1:5273/?backend=webgl2`.

| Parametri | Vaikutus |
|---|---|
| `?backend=webgpu` | Käytä WebGPU:ta tai epäonnistu. |
| `?backend=webgl2` | Käytä WebGL2:ta, vaikka WebGPU olisi käytettävissä. Tällä erotetaan "tämä piirtyy väärin" kohdasta "tämä piirtyy väärin WebGPU:lla". |
| `?heat=f16` | Pakota 16-bittinen lämpökertymäpolku kummalle tahansa taustaohjelmalle ([Puolitarkkuuskertyminen](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: lue GL-virheet kehyksen aikana ja näytä ne kohteessa `renderer.heatDebug`. Oletuksena pois, koska `getError` pysäyttää putken. |
| `?occdebug=<n>` | WebGL2:n kehittäjäapu: korvaa lämmön peittoarvojen vianjäljitysarvoilla. Ei normaalikäyttöön. |

### Erot, jotka ovat tärkeitä {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Rivien tallennus | Tallennuspuskurit: rivin indeksi on taulukon hakemisto. Pyytää sovittimen suurinta tallennuspuskurin sidontaa ja puskurikokoja. | Kokonaislukutekstuurit (8 192 texelin leveys), joihin viitataan `gl_VertexID`:llä kehyskohtaisen lohkoindeksitekstuurin kautta. |
| 32-bittinen lämpökertymä | Kun sovitin tarjoaa sekä `float32-blendable` että `float32-filterable` | Kun `EXT_float_blend` on olemassa |
| Muuten | 16-bittinen (`r16float`) | 16-bittinen (`R16F`) |
| Syvyysalue | [0, 1]; moottori kertoo three.js:n [-1, 1] -matriisit uudelleenkartoituksella. Ilman sitä rinnakkaisprojektio, jonka syvyys on lineaarinen, osuu lähes kokonaan alle 0:n ja leikkautuu hiljaa pois. | [-1, 1], käytetään sellaisenaan |
| Uniform-arvot | Rengas 256 tavun kohdistettuja paikkoja, yksi per piirto, sidotaan siirrolla. `queue.writeBuffer` on järjestetty jonossa, joten yhden puskurin uudelleenkirjoitus per piirto saisi jokaisen piirron lukemaan viimeisen kirjoituksen. Lämpövaiheen uniform-lohko on täsmälleen yksi 256 tavun paikka. | Tavalliset uniform-arvot |
| Lämpökohde alle canvasin resoluution | Saa oman syvyystekstuurin (jokaisen liitteen passissa täytyy olla sama koko) | |
| Kehyksen tallennus | `captureFrame()` piirtää koosteen toisen kerran erilliseen kohteeseen ja lukee sen takaisin (headless Chromium piirtää WebGPU:ta, mutta ei koosta canvasiaan) | Lukee oletuspuskurin takaisin seuraavassa piirretyssä kehyksessä |
| Takaisinluku | Välipuskurit säilytetään ja käytetään uudelleen; yksi lukija kerrallaan | `readPixels`, kysyen ajurilta, mikä muoto- ja tyyppiyhdistelmä on sallittu |

Molemmat taustaohjelmat lataavat sprite-käyrätaulukon puolitarkkuuksisina lukuina. WebGPU:n `queue.writeTexture` kopioi raakoja tavuja, joten data koodataan ensin binary16-muotoon ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Tekstuurirajat {#texture-limits}

`texStorage2D` yli `MAX_TEXTURE_SIZE`:n ei heitä virhettä. Varaus pudotetaan, myöhemmät lataukset epäonnistuvat ja näytteenotto antaa nollan. WebGL2-apufunktio [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) tarkistaa molemmat mitat rajaa vasten ja heittää virheen koon kanssa. Lohkoindeksitekstuuri on kaksiulotteinen (4 096 leveä), joten se ei voi kasvaa rajan yli. `src/render/limits.test.ts` lukitsee jokaisen tekstuurimitan vastaamaan rajoja, joiden tukemisen kannattaa. WebGL2-piirtäjä myös hylkää laitteen, jonka tekstuurin enimmäiskoko on pienempi kuin rivitekstuurin 8 192 leveys.

### Molempien testaus {#testing-both}

`npm run smoke` ajaa oikean sovelluksen headless Chromiumissa WebGL2:lla (oletuksena `http://127.0.0.1:5273/`). WebGPU:lle anna `node tools/smoke.mjs` -komennolle `"http://127.0.0.1:5273/?backend=webgpu"`, ja puolitarkkuuspolulle käytä `npm run smoke:f16`. `tools/probe-webgpu.mjs` ja `tools/probe-present.mjs` (listattu kehittäjätyökaluina sivulla [Komentorivityökalut](ref-tools.md)) tarkistavat sovittimen ja esityksen saatavuuden headless-selaimissa.
