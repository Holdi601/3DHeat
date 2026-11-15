---
title: "Söfnun"
parent: "Innri hlutar myndvinnslu"
nav_order: 2
lang: "is"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Söfnun

Þegar skoðarinn getur ekki teiknað alla depla í einum ramma, teiknar hann einn hluta, síðan annan, og leggur myndirnar saman á meðan þú heldur kyrru fyrir. Myndin verður skýrari, eins og ljósmynd sem er framkölluð. Ef þú hreyfir myndavélina byrjar það upp á nýtt. Línan **Þekja** á tölfræðiyfirlaginu sýnir hversu langt það er komið.

![Tölfræðiyfirlagið: Þekja sýnir prósentu meðan myndin er framkölluð og *nákvæmt* þegar hún er fullgerð](../assets/img/en/performance-stats-overlay.webp)

## Fyrir forritara {#for-developers}

Þegar einn rammi getur ekki teiknað allar raðir, teiknar hann úrtak og vegur það upp; myndin er þá óhlutdræg en hávaðasöm áætlun. **Söfnun** sameinar kynslóðir ramma svo áætlunin nálgist hið nákvæma svar meðan ekkert breytist. Hver rammi velur eina af fimm stillingum ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); sú síðasta sem var notuð er á `engine.live.accumMode`.

| Stilling | Hvenær | Hvað gerist við söfnunina |
|---|---|---|
| **reset** | myndavélin hreyfðist, eitthvað sem breytir flötinum breyttist, fínpússun stigvaxandi er slökkt, vaxandi gluggi er að byrja (fyrsti rammi spilunar, eftir leit), eða línuhiti í spilun hreyfðist | Skipt út fyrir mat þessa ramma. |
| **extend** | **Uppsafnaður** gluggi sem bara stækkaði frá síðasta ramma | Þessi rammi teiknar aðeins raðirnar sem voru rétt að verða sýnilegar, á fullri þyngd, og leggur þær við. Ekkert dvínar. |
| **ema** | rennandi gluggi (**Gluggi**, **Líftími**) hreyfðist | `acc = acc × (1 - 0,34) + frame × 0,34` - veldisvísismeðaltal yfir um þrjá ramma. |
| **mean** | ekkert breyttist og matið er ekki fullgert | `acc = acc × (1 - 1/n) + frame × 1/n` á *n*-ta ramma: keyrandi meðaltal. |
| **skip** (aðgerðalaus) | samleitni náð og ekkert breyttist | Ekkert er teiknað; rammi setur bara saman aftur. |

### Af hverju hver {#why-each}

- **Keyrandi meðaltal, ekki summa.** Að skala buffann með 1 - 1/n og bæta við 1/n af nýja rammanum er algebrulega það sama og að leggja saman og deila með *n* í lokin, en buffinn heldur alltaf einu sviði að stærð. Summa nær *n* sinnum sviðinu, og á 16 bita skotmarki mettast hún við 65.504; með deili sem stöðugt vex myndi kyrr sýn þá dofna því lengur sem hún stendur - á meðan hreyfð myndavél, sem byrjar upp á nýtt í hverjum ramma, lítur fullkomlega rétt út. Reykprófunin staðfestir að 16 sameinaðir rammar gefa 1,00× það sem einn rammi gefur.
- **Extend fyrir uppsafnaða spilun.** Raðirnar sem þegar hafa safnast eru enn sýnilegar, svo rammi þarf aðeins brotið af sekúndu sem var rétt að berast - sem kemst í einn ramma, og fer því þangað nákvæmlega. Að meta aftur myndi lýsa upp annað handahófskennt undirmengi í hverjum ramma og dofna það, og lesast sem hrinur sem blossa upp og hverfa, og hléramma héldi áfram að fylla inn. Prófunin staðfestir að heildin hækkar einsleitt meðan spilað er og helst innan 0,02% yfir 2,5 s í hléi.
- **Hreyfandi meðaltal fyrir rennandi glugga.** Þeir breytast í raun í hverjum ramma. Fast blöndunarvægi fylgir hreyfanlega glugganum (meðaltal yfir alla ramma frá því spilun hófst myndi dragast aftur úr spilunarhausnum) og er mun rólegra en að byrja upp á nýtt.
- **Endurstilling fyrir spiluðu línurnar.** Línuhitahausar hreyfast í hverjum ramma; hreyfandi meðaltal myndi strjúka hvern þeirra í rák, svo hver rammi er teiknaður heill og dvínun halans er mynd sjálf.
- **Hlutrammar fara um vinnuskotmark.** Rammi sem er sameinaður á broti af fullri þyngd er teiknaður í sérstakt skotmark frá núlli og síðan blandaður í söfnunina, í stað þess að vera beint teiknaður á 1/n þyngd. Beint myndi hver sprite vera lagður við á 1/n af stærð heildarinnar sem hann bætist við, sem hálffljóts skotmark rúnnar burt - verst þar sem þéttast er ([Hálffljóts söfnun](half-float-accumulation.md)).

### Samleitni {#convergence}

Áætlunin fyrir hvern ramma veit hversu margar frambjóðendaraðir eru og hversu margar hún sendir, svo fjöldi ramma sem þarf til að þekja allar raðir er ⌈frambjóðendur / sendir⌉. Þegar svo margir rammar hafa verið sameinaðir er sýnin **samleitin**: línan *Þekja* á tölfræðiyfirlaginu breytist úr prósentu í *nákvæmt*, og frekari rammar eru aðgerðalausir. Með **Teikna allar raðir í hverjum ramma** á (sjálfgefið) þekur einn rammi yfirleitt allt, svo samleitni er strax, og framvindubúnaðurinn þarf aðeins þegar glugginn geymir fleiri raðir en ein teikniáætlun getur borið (um 67 milljónir).

### Hvað endurræsir hana {#what-restarts-it}

Stillingar falla í þrjá hópa, eftir því hvað söfnunarbuffinn merkir enn eftir að þær breytast:

| Hópur | Breytist | Áhrif |
|---|---|---|
| **Rúmfræði** - hvaða raðir telja með og hversu mikið | sýnham; línuleiðir; radíus sprites, styrkur í miðju og á jaðri, dvínun, mjúkur skali, ferillinn, pixlamörk, flötun; fjarlægðarútilokun nær, fjær og flatarútilokun; hulning og falið á bak við landslag; sneiðin; stærð striga; hitaupplausn; sýnileiki hópa og formerki; mismunarskiptingin; Allt / Spila; sagan; dálkasíur og val á Einingum; hálffljóts-hagnaðurinn | Endurstilling. |
| **Gluggi** - tímabilið | spilunarhausinn hreyfist; varalíftími og dvínun Líftíma | Extend (uppsafnað) eða hreyfandi meðaltal (rennandi). |
| **Samsetning** - aðeins litunin | mettun, þéttleikasvörun, lágmarkshiti, litaskalarnir; að skera borðið; net og ásar; stillingar kassaendurspilunar og setu; dýptarskerpa | Teikna aftur án þess að snerta hitann. |

Myndavélarhreyfing endurstillir alltaf. Svo að draga mettunina eða skalann er ókeypis; að draga radíus sprites endurræsir samleitnina í hverju skrefi.
