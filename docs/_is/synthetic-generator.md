---
title: "Gervigagnaframleiðandi"
parent: "Hvernig gögn eru sett inn"
nav_order: 5
lang: "is"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Gervigagnagjafi

Engin gögn sem þú átt? Ýttu á einn takka og 3DHeat býr til látna orrustu fyrir þig, eins litla eða stóra og þú vilt.

1. Opnaðu spjaldið **Gagnasafn** í hliðarstiku Heatmap (fyrir neðan **Uppruni**).
2. Skrunaðu að **Gervigagnagjafi**.
3. Stilltu **Raðir (milljónir)**. Prófaðu 1 fyrst: sjálfgefna gildið 8 milljónir er þungt í fyrstu tilraun.
4. Ýttu á **Búa til**.

![1 milljón lína, 8 lið, teiknuð í Team heat](../assets/img/en/synthetic-generator-team-heat.webp)

Spjaldið **Gagnasafn** getur búið til gagnasafn í stað þess að hlaða því. Það er ætlað í tvennt: að prófa skoðarann án eigin gagna, og að athuga hvort tiltekinn fjöldi lína, pixlaradíus sprita og heimild haldi nothæfum rammahraða á tölvu *áður en* stór raunveruleg hleðsla er sett á hana. Hreyfingin er löguð eins og leikur í battle royale - lið byrja aðskilin og þjappast síðan saman - því einsleitur hávaði lítur vel út við hvaða heimild sem er og felur einmitt þá galla sem vert er að ná.

## Stýringar {#controls}

| Stýring | Sjálfgefið | Merking |
|---|---|---|
| **Raðir (milljónir)** | 8 | Línur til að búa til. Námundaðar niður í heila tölu af tikkum fyrir hvern leikmann. |
| **Lið** | 8 | Fjöldi hópa (að minnsta kosti 1). |
| **Í hverju liði** | 12 | Leikmenn í hverjum hópi (að minnsta kosti 1). |
| **Hálf breidd korts (m)** | 4000 | Hálf breidd leiksvæðisins á X og Z. |
| Áætlunarlína | | „≈ X GB af vinnsluminni, Y GB á GPU eftir kvörðun.“ (um 26 bæti af vinnsluminni og 8 bæti á GPU fyrir hverja línu). |
| **Búa til** | | Býr til í innsendingarverkanum, með framvindu, og kemur í stað hvaða gagnasafns sem er hlaðið. |

Gerð fer fram í bakgrunnsverkanum, svo tugir milljóna lína frysta ekki síðuna.

## Hvað það býr til {#what-it-generates}

Úr [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Dálkar:** staða, tími, persóna (`P000`, `P001`, ...), hópur (`Team 1`, `Team 2`, ...), snúningur og halli, og líftímar. Enginn setudálkur og engir síudálkar.
- **Tími:** eitt sýni á hvern leikmann á 0,25 s fresti, byrjar á 0 (afstæður tími, engin veggklukka).
- **Hreyfing:** hvert lið byrjar í sínum geira á hring við 55-95% af hálfri breidd. Öruggur hringur með miðju nærri miðjunni (færður af handahófi um allt að fjórðung af hálfri breidd) minnkar í 8% af hálfri breidd í sex áföngum með hléum; hver leikmaður stýrir að reikandi punkti innan hans, með dempun og hávaða. Hæðin sveiflast á milli 0 og 220 m.
- **Sjónstefna:** snúningur eftir stefnu ferðarinnar, halli út frá lóðréttum hraða.
- **Endurtakanlegt:** slembifræið er fast (1337), svo sömu stillingar gefa alltaf sömu gögn.

Sérhver hitahamur, box replay og línuhiti (heilar slóðir, því enginn atburðadálkur er til staðar) virka á því. Saga líftímanna virkar líka.
