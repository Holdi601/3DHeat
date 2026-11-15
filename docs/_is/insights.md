---
title: "Innsýn"
nav_order: 7
has_children: true
lang: "is"
source: "insights.md"
source_hash: "d09a8c07f701"
translated: true
outdated: false
---


# Innsýn

**Innsýn** leitar í hlöðnum gögnunum að því sem sker sig úr - sterkum stöðum, banvænu landi, gildrum við upphaf, flöskuhálsum, leikmönnum langt umfram jafningja sína - og segir þér, það sterkasta fyrst, ásamt gögnunum sem styðja það. Notaðu það til að læra á einni mínútu hvar leik var unnið eða tapað. Það getur síðan skrifað samantekt, og í einni endurspilun getur það starfað sem lýsandi sem hoppar á stóru augnablikin.

Allt er talið í vafranum þínum. Ekkert fer af tölvunni þinni nema þú kveikir á ytri gervigreind (sjá [Ytri gervigreind](#external-ai)).

![Innsýn á tankasýnidæminu: 14 niðurstöður, það sterkasta fyrst](../assets/img/is/insights.webp)

Hlutinn **Innsýn** er í hliðarstiku flipanna Hitakort og Leikur. Hann hefur þrjá flipa: **Niðurstöður**, **Samantekt** og **Lýsandi**.

## Niðurstöður {#findings}

1. Hladdu gögnum og opnaðu **Innsýn**. Ýttu á **Finna innsýn** ("Tel… n%" sýnir framvinduna).
2. Lestu listann. Hver niðurstaða hefur styrkstiku, setningu, hversu góð gögnin eru (*Sterk gögn*, *Góð gögn* eða *Nokkur gögn*), hvaða greiningartól fann hana, og flokk farartækis þar sem það skiptir máli.
3. **Smelltu á niðurstöðu**: skoðarinn beitir síum hennar, flýgur myndavélinni að staðnum og hoppar að tímanum, og opnar upplýsingarnar: áhrifin með 95% öryggisbili, p- og q-gildin, taldu gögnin, og **Rúmmál hér**, sem teiknar [rúmmál](volumes.md) utan um staðinn.
4. **Endurheimta síur** setur síurnar þínar aftur. **Afrita JSON** afritar alla skýrsluna.

Talningin notar núverandi síur, földu hópana og valinn leik yfir allt tímabilið. Þegar þú breytir síunum síðar segir athugasemd það; ýttu þá á **Telja aftur**.

Línurnar efst á listanum (til dæmis heildarfjárhæðirnar) draga saman öll gögnin á undan niðurstöðunum.

![Opnuð niðurstaða: heitt svæði skota, tölurnar og samsvarandi kafli úr heimildum](../assets/img/is/insights-finding.webp)

### Greiningartólin {#the-detectors}

| Greiningartól | Hvað það finnur | Þarfnast í gögnunum |
|---|---|---|
| **Valdastöður** | Staðir með mun betri hlutfall dráps á móti dauða en restin af kortinu, og *öruggt land* þar sem fáir deyja miðað við tímann sem varið er | atburði dráps og dauða |
| **Heit og köld svæði** | Staðir þar sem tegund atburðar (skot, högg, yfirtökur ...) gerist mun oftar eða sjaldnar en tíminn sem varið er þar spáir fyrir um | atburðadálk |
| **Opið land og skjól** | Dauðsföll á opnu svæði við nálæga rúmfræði borðsins, og hægt þegar hreyfingin er hröð | dauðsföll; þrívítt borð fyrir rúmfræðihlutann |
| **Spawns** | Sterkir upphafsstaðir, gildrur við upphaf, öruggir upphafsstaðir, tími þar til fyrsta snerting | tíma og persónur |
| **Flokkur eftir stað** | Flokkur farartækis, eða leikmenn á móti gervigreind, sem standa sig mun betur eða verr á svæði | dráp og flokk farartækis eða dálk leikmanns/gervigreindar |
| **Leikmenn** | Leikmenn sem drepa eða deyja mun oftar eða sjaldnar en aðrir í sama flokki | persónur og dráp |
| **Flöskuhálsar og hliðarleiðir** | Flöskuhálsar (mun fleiri yfirferðir en landið í kring) og hliðarleiðir (sjaldan notaðar, en leiða til dráps) | persónur |
| **Gildi** | *Dýrt land* og *Tekjuland* | [gildisdálkar](value-weighting.md) |
| **Hvað réð úrslitum í lotunum** | Hvað skildi unnar lotur frá töpuðum, og leikmennirnir sem bættu við eða kostuðu mestar sigurlíkur (sjá [Hver vann](#who-won-what-decided-the-rounds)) | lotur, dráp og dauðsföll, og [úrslitadálkarnir](data-formats.md#outcome-columns) (`won`) |

Greiningartól sem geta ekki keyrt á gögnunum eru talin upp neðst með ástæðunni.

### Hvernig niðurstöður eru raðaðar {#how-findings-are-ranked}

Sérhver staður eða hópur er prófaður gegn restinni af kortinu (nákvæm tvíliðuprófun eða hlutfallspróf). Falsk-uppgötvunartíðnin er haldin í 5% (Benjamini-Hochberg). Tilviljun getur litið út eins og mynstur; þetta heldur fölskum viðvörunum í lágmarki: meðal niðurstaðnanna sem sýndar eru er búist við að í mesta lagi um einn af hverjum tuttugu sé tilviljun. Áhrif af fáum atburðum eru dregin að "engum áhrifum" áður en raðað er. Í mesta lagi 60 niðurstöður eru skráðar, og sérhvert greiningartól fær nokkra staði nálægt toppnum.

### Hver vann {#who-won-what-decided-the-rounds}

Þar sem leikirnir segja hver vann hverja lotu ([úrslitadálkurinn](data-formats.md#outcome-columns) `won`) eru úrslitin markmið út af fyrir sig:

- **Staðir: sigurhlutfall.** Fyrir hvora hlið hlutfall lotna hennar á stað sem hún vann, á móti hlutfallinu sem hún vann í sama leik hvar sem er - svo jafnvægi kortsins, hliðarinnar og leiksins sjálfs er grunnlínan, og aðeins staðir þar sem þeir sem halda þeim vinna fleiri (eða færri) af lotum sínum skera sig úr. Uppdiktað dæmi: *„Dust: hlið T vinnur fleiri af lotum sínum þegar hún er hér: 61% af 412 unnar, á móti 49% væntum út frá hennar eigin hlutfalli í sömu leikjum (líkur 1,6x; haldið í 31/48 leikjum).“* Sama hlutfall falskra uppgötvana og stöðugleikaathuganir og fyrir alla staði; **Hlaða** hleður leikjunum sem staðnum var haldið í og sýnir stöður þeirrar hliðar.
- **Hólf: lotusigur.** Taflan **Lotur** geymir lotu hvers lífs: kortið, hliðina, hluta leiksins (lotur 1-4, 5-8, ...), farartækið (stjórnandi, agent), vopnið sem það notaði mest, staðinn sem það hélt lengst, kaupin (eco, force, full) og hvort hlið þess náði fyrsta drápinu. Hópur er metinn á móti því sem hlið hans vann í sömu leikjum, svo *T á Dust með AWP* er aðeins hólf þegar þær lotur unnust oftar en aðrar lotur T í þeim leikjum. Uppdiktað dæmi: *„m1 · T · AWP: vinnur 80% af 320 lotum, á móti 62% væntum út frá sömu hliðum í sömu leikjum (líkur 2,3x; 40 leikir).“* Raðað eftir lyftunni sinnum stuðningnum; **Hlaða** hleður leikjunum þar sem lotur sýna það mest.

Hvort tveggja þarf samantektir af útgáfu 2 (sjá [Að fá samantektirnar](#getting-the-summaries)): eldri eru reiknaðar aftur.

## Samantekt {#debrief}

Flipinn **Samantekt** skrifar niðurstöðurnar upp sem stuttan texta: upphaf, skýrasta niðurstaðan, ein fyrir taktík, ein fyrir jafnvægi, síðan - þar sem gögnin segja hver vann - hvað réð úrslitum í lotunum, hinar flokkaðar eftir greiningartóli, og hversu margar byggja á veikari gögnum.

Hvað réð úrslitum í lotunum kemur í fjórum málsgreinum: staðan og hvaðan sigurlíkurnar koma; sterkustu þættirnir með tölum sínum, bili og q (þegar enginn stenst hlutfall falskra uppgötvana segir textinn *ekkert af því er öruggt enn* og nefnir samt þann sterkasta); þrír stærstu vendipunktarnir; og leikmennirnir sem bættu við og kostuðu mestar sigurlíkur, með stöðunum sem unnu mest. Uppdiktað dæmi:

> T vann 23 og CT vann 17 af 40 lotum með þekkt úrslit (T: 58%, 95% 42% til 72%). Sigurlíkurnar koma úr líkani sem er aðlagað að þessum lotum.
>
> Hvað skildi unnar lotur frá töpuðum: T vann 79% af þeim 19 lotum sem hún hélt Mid, á móti 24% af 21 án þess (55 prósentustig, 95% 26 til 74) (q 0,004), ...
>
> Vendipunktar: lota 17 á 48 s, dráp CT við B site færði líkur hennar úr 31% í 58%, og hún vann lotuna, ...

Hver málsgrein hefur tölusetta hnappa sem sýna niðurstöðurnar hennar. **Afrita texta** afritar hann.

![Samantektin sem innbyggði sögumaðurinn skrifaði](../assets/img/is/debrief.webp)

Innbyggði sögumaðurinn virkar án nettengingar, á þínu tungumáli. Valið **Linsa** fyrir ofan hann (sjá [Þekkingarlinsan](knowledge.md)) ræður hvaða heimildir málsgreinarnar vísa í.

### Ytri gervigreind {#external-ai}

**Stillingar gervigreindar** leyfir líkani af gervigreind að eigin vali að skrifa samantektina í staðinn:

| Stilling | Merking |
|---|---|
| **Þjónustuaðili** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (staðbundið), LM Studio (staðbundið), llama.cpp-þjónn (staðbundið), eða hvaða OpenAI-samhæfður endapunktur sem er |
| **Grunnslóð**, **Líkan** | Fyllt inn af þjónustuaðilanum; **Telja upp líkön** spyr þjóninn |
| **API-lykill** | Sendur aðeins á grunnslóðina. Aldrei skráður, aldrei vistaður í útsýnum, útflutningi eða `.3dheat`-skrám. Flestir staðbundnir þjónar þurfa engan. |
| **Muna lykilinn í þessum vafra** | Sjálfgefið slökkt: lykillinn gleymist þegar síðunni er lokað |
| **Nota ytri gervigreind** | Sjálfgefið slökkt |
| **Senda nöfn spilara** | Sjálfgefið slökkt: leikmenn eru sendir sem P1, P2 ... |

Skrifaðu síðan valfrjálsa spurningu og ýttu á **Skrifa með gervigreind**. Aðeins niðurstöðurnar og tölur þeirra eru sendar - aldrei línur gagnanna þinna. Svarið streymir inn; tilvitnaðar niðurstöður verða að hnöppum. Þar sem gögnin segja hver vann er líkaninu sagt að byrja á því sem réð úrslitum í lotunum, með bili og q hverrar tölu, og að segja frá þegar þáttur byggir á fáum lotum eða sigurlíkurnar koma úr forlíkaninu.

## Lýsandi {#caster}

Fyrir **einn leik** (veldu einn ef margir eru hlaðnir) finnur **Lýsandi** augnablikin sem vert er að horfa á: fyrsta blóð, margföld dráp, skipti, lokasóknir, sveiflur í markmiðum, endurkomur, áberandi leikmenn, langskot og **vendipunkta** - drápin sem færðu líkur hliðar á að vinna lotuna mest (út frá leikmönnunum sem eru eftir á lífi hvoru megin, í lotum án endurlífgunar).

Þar sem gögnin segja hver vann hverja lotu segir hvert augnablik það: *„Anna fellir Ben: líkur T á að vinna lotuna fara úr 38% í 62% - og þau vinna lotuna.“* Augnablik hliðarinnar sem vann að lokum vegur meira þegar lýsandinn velur hver eru geymd, og endurkoma er talin í unnum lotum.

![Augnablik lýsandans fyrir eina lotu í skotleikjasýnidæminu](../assets/img/is/caster.webp)

- Smelltu á augnablik: sýnin skiptir yfir í endurspilunina, hoppar rétt fyrir það, flýgur þangað og fylgir leikmanninum.
- **Spila augnablikin** spilar hvert þeirra til enda og heldur áfram; **Fyrra** / **Næsta** fara á milli þeirra.
- Með ytri gervigreind kveikt skrifar **Lýsing frá gervigreind** lýsingu út frá listanum yfir augnablikin (tegundir, tímar, nöfn eða gervinöfn, lið, flokkar, fjarlægðir).

Það þarfnast persóna og dráps/dauða (eða yfirtöku) atburða; `other`/`victim`-dálkur gerir skipti og langskot möguleg.

## Þekkingarlinsan {#knowledge-lens}

Hægt er að lesa niðurstöðu í gegnum **linsu** af viðurkenndri þekkingu: hernaðarkenningu, loft- og sjóorrustum, borgarhernaði, leikjahönnun og rafíþróttum (eða *Sjálfvirkt*, valið af einingunum í gögnunum). Opnuð niðurstaða sýnir þá næstu færslu **kenningar og heimilda** og **sögulega hliðstæðu**, með tilvísunum, og **Mælingar linsunnar** reiknar mælingar úr þeim heimildum á gögnunum (Lanchester-aðlaganir, skiptihlutföll, hlutföll herafla, skotsvið, lykilland, skipti, frumkvæði). Samantektin og gervigreindarbeiðnin innihalda þær. Allt um þetta: [Þekkingarlinsan](knowledge.md).

Mælingar linsunnar mæla líka hvernig leikmenn haga sér sem hópur og sem heild - röðun og hringsnúning, hjarðstýringu á leiðum, akreinar og slóðir, þröng, leiðtoga og fylgjendur, eftirbáta, brotpunktinn undir tapi, áhættu eftir að líf tapast, raðir, samkomulag um kaup og viðbrögð við skotum sem berast - hver miðað við sitt eigið viðmiðunarlíkan: [Hópahegðun](collective-behaviour.md).

## Gögnin sem gera innsýn mögulega {#data-that-makes-insights-work}

- staðsetningar með **tíma**, **persónu** og **liðsdálk**;
- **atburðadálk** með drápum og dauðsföllum (`kill`, `death`), og öðrum (`hit`, `fire`, `capture` ...);
- **dálk annars aðila** (`other`, `victim`) fyrir skipti og stefnur;
- **farartækis- eða tegundardálk** fyrir flokka; `ai`-dálk fyrir leikmenn á móti gervigreind;
- **lotu-/leiks-/umferðardálk** þegar margir leikir eru til.

[Sýnigögnin](demo-data.md) hafa þá alla.
