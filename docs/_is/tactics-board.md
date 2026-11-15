---
title: "Taktíkartafla"
nav_order: 12
has_children: true
lang: "is"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: true
---


# Taktíkartafla

Flipinn **Leikfræði** er teikniborð fyrir liðsáætlun: þú setur litlar fígúrur á kort, teiknar örvar fyrir það sem þær fara, og ýtir á spila til að sjá það gerast. Notaðu hann til að skipuleggja umferð eða árás áður en þú spilar. Hann deilir striganum, myndavélinni og [borðinu](levels.md) með hinum flipunum og engu öðru; áætlun eru ekki gögn og teiknar engan hita.

## Fyrsta áætlunin þín {#your-first-plan}

1. Opnaðu flipann **Leikfræði**. Veldu **Leikur** (til dæmis Counter-Strike 2) og, fyrir Valorant, ýttu á **Hlaða Valorant-kortum** og veldu **Kort**. Eða hladdu [borði](levels.md) fyrst.
2. Veldu **Hlið** (hún ræður litnum) og ýttu á **Ofan frá**.
3. Veldu **Staður**, veldu fígúru í **Fígúrur** (notaðu **Leita að fígúrum** til að finna hana) og smelltu á kortið. Settu tvær eða þrjár.
4. Veldu **Ör**, smelltu á fígúru, smelltu eftir leiðinni sem hún á að fara, og ýttu á **Enter** til að ljúka örinni.
5. Ýttu á **+** undir sýninni til að bæta við skrefi 2. Hver fígúra byrjar þar sem ör hennar endaði. Teiknaðu fleiri örvar þar.
6. Ýttu á **▶** (eða `K`) til að spila áætlunina frá sýnda skrefinu til loka.
7. Gefðu áætluninni heiti í **Heiti áætlunar** og ýttu á **Vista**.

![Flipinn Leikfræði í sýn ofan frá: leikur, hliðar og verkfæri vinstra megin, þrjár fígúrur með Færa-örvum, reykkast-bogi, svæði og skrefin neðst](../assets/img/is/tactics.webp)

## Að byrja áætlun {#starting-a-plan}

| Stjórn | Hvað hún gerir |
|---|---|
| **Leikur** | Velur hliðarnar og fígúrurnar sem spjaldið býður upp á: Counter-Strike 2 (T, CT; leikmenn og hjálpartæki), Valorant (Attack, Defense; leikmenn og almennir hæfileikar), Battlefield, Squad, Arma (fótgöngulið, landfarartæki, loftför, bátar), DCS / War Thunder / IL-2 (þotur, skrúfuflugvélar, þyrlur, loftvarnir, land, skip, vopn), og Annað. Áætlun sem þegar hefur fígúrur heldur hliðum sínum þegar leikurinn breytist. |
| **Heiti áætlunar** | Heitið sem áætlunin er vistuð undir. |
| **Kort**, **Hlaða Valorant-kortum** | Með Valorant valið: **Hlaða Valorant-kortum** sækir listann yfir kort frá [valorant-api.com](https://valorant-api.com); **Kort** setur þá smákort valda kortsins sem borð, rammað ofan frá. Myndin er sótt þegar hún er valin og aldrei send með. Tilkynning Riot er sýnd meðan hún er á skjánum (sjá hér að neðan). |
| **Hlið** | Hliðin sem næsta fígúra, ör eða svæði tilheyrir; hún tekur lit hliðarinnar. |

Án borðs er taflan sléttur grunnflötur. Hlaðið borð undir **Borð** til að skipuleggja á raunverulegu korti: CS2-kort sem flutt er út með CS2-verkfærinu, borð úr safninu, eða kortamynd.

## Verkfæri {#tools}

| Verkfæri | Smellur | Athugasemdir |
|---|---|---|
| **Velja** | Fígúra, viðkomupunktur, ör, svæði eða athugasemd velur hana. | Shift+smellur bætir við eða tekur út; Shift+drag teiknar kassa utan um það sem á að bæta við. Valið fær umbreytingartákn (sjá hér að neðan); `Delete` eða `Backspace` fjarlægir það. `M` færir valda fígúru á næsta smell. |
| **Staður** | Setur valda fígúru niður. | Fígúra er valin í **Fígúrur**-spjaldinu (með **Leita að fígúrum**). Án vals snýr `R` næstu fígúru um 15° áður en hún er sett niður (`Shift+R` hina leiðina). |
| **Ör** | Hver smellur bætir við punkti; Enter, tvísmellur eða hægri smellur lýkur henni, Esc hendir henni. | **Færa**, **Árás** (breiðara haus) eða **Fylgjast með** (þunn lína í augnhæð). Ör sem byrjar á fígúru er leið hennar í þessu skrefi: þegar hún er spiluð gengur fígúran hana, og næsta skref byrjar þar sem hún endaði. |
| **Kast** | Kastarinn, og síðan hvar það lendir. | Bogi úr punktalínu milli þeirra, og valið hjálpartæki (reykur, blossi, molotov, ...) birtist þar sem það lendir og helst þar frá þessu skrefi og áfram. |
| **Svæði** | Miðjan, og síðan jaðarinn. | Diskur í lit hliðarinnar. |
| **Athugasemd** | Hvar athugasemdin fer; biður um texta hennar. | Sýnd sem nál, og textinn yfir henni. |
| **Eyða** | Fígúra, ör, svæði eða athugasemd. | Fjarlægir hana frá þessu skrefi og áfram; í fyrsta skrefi sínu fjarlægir það hana alveg. |

**Afturkalla** og **Endurtaka** (`Ctrl+Z`; `Ctrl+Y` eða `Ctrl+Shift+Z`) fara í gegnum hverja breytingu. Lína undir áætluninni sýnir hversu margar fígúrur, örvar og skref hún hefur. **Ofan frá** horfir beint niður (samsíða), **3D-sýn** fer aftur í sjónarhorn, **Rammi** passar áætlunina, eða borðið þegar áætlunin er tóm.

**Stærð fígúra** stillir allar fígúrur á töflunni; 1× er raunstærð, sem úr mikilli hæð er nokkur pixlar fyrir manneskju.

## Að færa, snúa og kvarða {#moving-turning-and-scaling}

Allt á töflunni má færa eins og í 3D-ritli: fígúrur, hjálpartæki, merki, stakar viðkomupunkta og heilar örvar, svæði og athugasemdir. Það sem er valið fær tákn á miðju sinni:

| Hamur | Takkar | Handföng |
|---|---|---|
| **Færa** | W (eða G) | Ör fyrir hvern ás (X rautt, Y grænt og upp, Z blátt) færist eftir honum; ferningur færist yfir sitt plan; miðjan færist yfir borðið undir bendlinum. |
| **Snúa** | E (eða R) | Hringur fyrir hvern ás snýst um hann. Hringir einnar fígúru eru hennar eigið stefnu-, halla- og veltihorn; hópur snýst um ása heimsins í kringum miðju sína. |
| **Kvarða** | R (eða S) | Dreifir eða þjappar valinu frá miðju sinni eftir ás eða í allar áttir; radíus svæðis vex með því. |

**Lyklar** skipta á milli W / E / R (Unity, Unreal) og G / R / S (Blender); takkarnir velja hamin aðeins meðan eitthvað er valið, og fljúga myndavélinni annars. Þannig þýðir `R` **Kvarða** með W / E / R-lyklunum og **Snúa** með G / R / S-lyklunum meðan eitthvað er valið, og snýr næstu fígúru sem á að setja niður þegar ekkert er valið. Allir takkar töflunnar eru á [lyklaborðsyfirlitinu](keyboard-reference.md#tactics-board). Haltu **Ctrl** niðri við drag til að smella færslu á **Hnitanet** (metrar) eða snúning á **Hornþrep**. **Smella við jörð** (sjálfgefið á) setur færðar manneskjur, farartæki, merki, viðkomupunkta og svæði á yfirborð borðsins; loftför og þyrlur halda hæð sinni, og drag eftir Y-örinni smellir aldrei. Drag á handfangi færir aldrei myndavélina. **Esc** hættir við drag, og sérhver breyting er eitt skref í Afturkalla.

Viðkomupunktar birtast sem punktar á örvum sýnda skrefsins: smelltu á einn til að velja hann, dragðu til að færa hann, Delete til að taka hann út. Hlutinn **Valdar** sýnir stöðu valsins í metrum, stefnu-, halla- og veltihorn fígúru í gráðum og radíus svæðis, hvert um sig hægt að slá inn.

## Tímataka {#timing}

Leið fígúru er tímasett: hver hluti tekur lengd sína yfir borðið - sýnd á yfirborðinu á um tveggja metra fresti, svo hæð eða stigi milli tveggja punkta telst - á hraða **hams** hreyfingar hennar í þeim leik, auk allrar **bið** við viðkomupunkt. Fótgönguliðar skríða, krjúpa, ganga (hljóðlaust), hlaupa eða spretta; farartæki og bátar skríða, fara gætilega, eðlilega eða þjóta; loftför og þyrlur fljúga hægt, á siglingu, á bardagahraða eða hámarki. Hamur sem leikurinn hefur ekki (CS2 hefur engan sprett) tekur þann næsta sem hann hefur. Hvernig halli hægir á fer eftir leiknum: í CS2 og Valorant telst aðeins lárétta vegalengdin, eins og í leikjunum; hermileikir hægja á fótgönguliðum upp brekkur (göngufall Toblers) og farartækjum eftir halla.

Hraðinn kemur úr töflum fyrir hvern leik með heimildum sínum (sjá [Hraði hreyfinga](tactics-speeds.md)): CS2 eftir vopninu sem er haldið, úr vopnalýsingum leiksins; Valorant eftir vopni; Battlefield, Squad, Arma og loftleikirnir eftir gerð og flokki farartækis. **Hreyfist sem** velur snið fígúru (vopn, gerð farartækis); **Eigin (m/s)** yfirskrifar hvaða hám sem er fyrir þá fígúru. Hamir heita eins og taflan sýnir þá: *Crawl*, *Crouch*, *Walk (silent)*, *Run*, *Sprint*; *Cautious*, *Normal*, *Rush*; *Slow*, *Cruise*, *Combat*, *Maximum*.

Hver viðkomupunktur sýnir tímann frá þeim síðasta og tímann frá upphafi áætlunarinnar ("+3.9 s · 0:12"). Leið valinnar fígúru sýnir alla hluta með hami, lengd og tíma, biðina og komuna. **Komur** undir **Tímataka** setur hverja fígúru með leið á eina tímalínu, fyrsta koma efst. Með **Spila í rauntíma** (sjálfgefið á) varir skref þar til hægasta leiðin kemur og hver fígúra hreyfist á sínum eigin hraða; **Sekúndur** er þá minnsta lengd skrefsins. **Borðseiningar á metra** segir hvað borðið er í: 39,37 fyrir CS2-kort (leikseiningar), 1 fyrir metra-kort.

## Berðu saman við leikjagögn {#compare-with-match-data}

**Hlaða leikjaskrám…** les CS2-leikjatöflur kortsins (Parquet-skrár CS2-verkfæris, eins margar og vilt; aðeins dálkarnir sem þarf, í bakgrunni); **Nota hlaðin gögn** tekur gögnin sem eru hlaðin í skoðaranum. Þá:

- **Fyrsta koma á kortinu** litar kortið eftir tímanum frá upphafi umferðar sem leikmaður kom fyrst á hvern stað - hnappurinn **Hraðast** sýnir þann fljótasta yfir allar umferðir, **Dæmigert (miðgildi)** miðumferðina - grænt snemma til rautt seint, fyrir aðra hliðina eða báðar. Það sýnir hvað er mögulegt og hvenær.
- Valin leið er borin saman við það sem leikmenn náðu frá upphafi hennar (eða frá upphafi umferðarinnar) til loka hennar, hver endi er diskur af settum radíus: "Fastest observed 14.2 s, p10 15.0 s, median 18.3 s over 41 runs; your plan 15.1 s".
- Hraðarnir sem leikmenn fóru í raun á - hlaup, ganga, krjúpa, úr göngu- og krjúpadálkum taflnanna - í m/s.

## Skref {#steps}

Stikan undir sýninni geymir skrefin. Áætlun byrjar með einu; **+** bætir við einu, og hver fígúra byrjar það þar sem leið hennar í síðasta skrefi endaði; **−** fjarlægir það sem sýnt er. **Sekúndur** er hversu lengi sýnda skrefið tekur þegar það er spilað. **▶** (K) spilar frá sýnda skrefinu til loka: fígúrur með leið ganga hana, fígúrur sem færðar eru á nýjan stað í næsta skrefi renna þangað, hinar standa kyrrar. Meðan skref er sýnt er staða hverrar fígúru í næsta skrefi teiknuð sem daufur draugur, og örvar síðasta skrefs daufar undir þessu.

## Vistun {#saving}

Hlutinn **Skrá** geymir **Vista**, **Opn** og **Hreinsa**. **Vista** skrifar áætlunina sem `<name>.h3dplan.json` (venjulegt JSON: hliðar, skref, fígúrur með stöðu í hverju skrefi, örvar, svæði, athugasemdir); **Opn** les hana aftur inn. Skrá í annarri útgáfu, eða sem er ekki áætlun, er hafnað með ástæðunni. **Hreinsa** tæmir áætlunina; Afturkalla skilar henni.

## Fígúrur {#figures}

Sérhver fígúra er smíðuð af skoðaranum sjálfum: einfaldar lögun í birtri stærð gerðarinnar, með einkennunum sem greina hana frá nágrönnunum - belti og turn skriðdreka, byssurnar, flaugar og ratsjár loftvarnafarartækis, vængjalögun flugvélar, hali og hreyflar, snúningsvængir þyrlu og stubbavængir. Ekkert er tekið úr neinum leik. Hönnun sem leikur fann upp er sýnd sem almenn fígúra flokks síns. Sjá [Fígúrur](figures.md#which-figure-a-unit-gets) fyrir hvernig gögn finna fígúru sína.

## Tilkynning Riot {#riots-notice}

Valorant-kort eru sýnd samkvæmt stefnu Riot Games "Legal Jibber Jabber", sem leyfir frjálsum samfélagsverkefnum að nota þau og biður um þessa tilkynningu hvar sem þau birtast: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* Hæfileikarnir á töflunni eru almenn form, ekki listaverk Riot.
