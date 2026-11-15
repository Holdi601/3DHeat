---
title: "Näytönohjaimen muistin pysyvyys"
parent: "Piirron sisäiset"
nav_order: 5
lang: "fi"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Näytönohjaimen muistin pysyvyys

Näytönohjaimessa on vain tietty määrä muistia. Jos aineisto ei mahdu siihen, katselija näyttää sen, mikä mahtuu, ja kertoo sen. Tilastopaneeliin tulee oranssi rivi **Ei muistissa** ja poisjätettyjen rivien määrä. Analyysityökalun pahin virhe olisi lyhennetty aineisto, joka näyttää täydelliseltä, joten tätä riviä ei koskaan piiloteta.

![Tilastopaneeli oranssilla rivillä Ei muistissa](../assets/img/en/gpu-memory-not-resident.webp)

Jotta mahtuisi enemmän, nosta GPU-budjettia kohdassa **Resurssibudjetit** ja lataa uudelleen ([Muisti ja budjetit](memory-and-budgets.md#raising-the-gpu-budget)). Voit myös rajata aineistoa ensin tai käyttää näytönohjainta, jossa on enemmän muistia.

## Kehittäjille {#for-developers}

### Miten rivit tallennetaan GPU:lle {#how-rows-are-stored-on-the-gpu}

Rivit ladataan kerran, kun aineisto saapuu, **osina** 8 388 608 riviä (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Jokainen osa kvantisoidaan omalla rajauslaatikollaan ja aikavälillään:

| Data | Muoto | Tavua per rivi |
|---|---|---|
| Sijainti X, Y, Z ja ryhmän tunniste | neljä 16-bittistä etumerkitöntä kokonaislukua (RGBA16UI WebGL2:ssa); X, Y, Z osan rajauslaatikon sisällä | 8 |
| Aika ja elinikä (kun aineistossa on sekä aika että henkilö) | kaksi 16-bittistä etumerkitöntä kokonaislukua (RG16UI): aika osan aikavälin sisällä; elinikä, jossa 65 535 tarkoittaa "ei seuraavaa näytettä" | 4 |

Osakohtaiset rajauslaatikot tekevät 16 bitistä riittävän: osa kattaa yleensä vain murto-osan kartasta, joten kvantisointiaskel jää selvästi alle senttimetrin kilometrien levyisellä kartalla. Neljännen kanavan ryhmätunniste on ilmainen. Sen takia ryhmiä voi olla enintään 4 096 ([Ryhmät](sessions-persons-groups.md#limits)).

WebGL2:ssa jokainen osa on tekstuuri, joka on 8 192 texelin leveä ja täytetty kokonaisiin tekstuuririvteihin. Riveihin päästään `gl_VertexID`:n kautta kehyskohtaisen lohkoindeksitekstuurin läpi. WebGPU:ssa ne ovat tallennuspuskureita.

Rivikohtaista lisä-GPU-muistia varataan käytön mukaan:

- jokainen aktiivinen sarakkeen [suodatin](filters.md): 4 tavua rivillä (32-bittiset float-arvot tai luokkatunnisteet), ladataan osa kerrallaan, kun suodatinta käytetään ensimmäisen kerran;
- [viivalämpö](line-heat.md): 8 tavua rivillä (jokaisen segmentin alku, kvantisoituna datan rajauslaatikon sisällä, ja sen liput), kun Lines-tila on päällä.

Lisäksi tulevat piirtokohteet: kohtauksen väri ja syvyys, lämpökohde ja sen välipuskuri (neljä kanavaa tilassa [Joukkuelämpö](team-heat.md)), syvyyskerrokset [peittämistä](depth-and-culling.md) varten sekä kentän geometria.

### Budjetti pakotetaan latauksessa {#the-budget-is-enforced-at-upload}

WebGL hyväksyy varaukset, joita se ei pysty palvelemaan. Sitten se joko menettää kontekstin tai siirtyy järjestelmämuistiin, mikä maksaa valtavasti. Siksi GPU-budjetti pakotetaan, kun aineisto ladataan ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- osat ladataan järjestyksessä (eli aikajärjestyksessä), niin kauan kuin ne mahtuvat;
- ensimmäinen osa, joka ei mahdu, ladataan **osittain**: niin monta kokonaista tekstuuririvia kuin jäljellä oleva budjetti pitää. Se ladataan siis eikä jätetä kokonaan pois. Budjetti, joka ei pidä kokonaista osaa, näyttää silti niin paljon kuin pystyy. Koska rivit ovat aikajärjestyksessä, näkyvä osa on yhtenäinen aikaväli;
- kaikki sen jälkeen on **ei muistissa**.

Puutetta ei piilotettu: tilastopaneelissa näkyy oranssi rivi **Ei muistissa** ja niiden rivien määrä, jotka eivät mahtuneet, aina kun luku on suurempi kuin nolla. Katkaistu aineisto, joka näyttää täydelliseltä, on analyysityökalun pahin vika. Ennen latausta tehtävä [sovituksen tarkistus](memory-and-budgets.md#the-fit-check) on tarkoitettu estämään tämä tapaus.

Renderöijän käyttämä budjetti on GPU-budjetti kohdasta **Resurssibudjetit**, sama luku, jota sovituksen tarkistus käyttää. Se on myös tunnistettua lukua suurempi, liukusäätimen ylärajaan asti (katso [GPU-budjetin nostaminen](memory-and-budgets.md#raising-the-gpu-budget)). Se sovelletaan, kun aineisto ladataan. Jos sitä muutetaan myöhemmin, muutos tulee voimaan seuraavassa latauksessa.
