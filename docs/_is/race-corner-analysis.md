---
title: "Greining beygju fyrir beygju"
parent: "Kappakstursgreining"
nav_order: 55
lang: "is"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Greining beygju fyrir beygju

Tveir hringir á sömu braut eru bornir saman beygju fyrir beygju. Fyrir hverja beygju segir skoðarinn hver var fljótari, hversu mikils tíma það var virði og af hverju: bremsað of snemma, komist of seint á afl, tekin breiðari lína. Þannig veistu hvað þú átt að æfa fyrst.

![Niðurstaða opnuð í Hvar má bæta sig, við hliðina á töflunni Beygja fyrir beygju](../assets/img/en/race-corner-finding.webp)

Dæmi sem er rakið: í beygju 3 bremsar Driver A 20 m fyrr en Driver B og tapar 0,15 s á leiðinni þangað, en er á inngjöfinni fyrr og vinnur 0,15 s á útleiðinni. Nettó 0,00 s: beygjan er jöfn, og engum er sagt að bremsa seinna.

## Það sem þú sérð {#what-you-see}

### Hvar má bæta sig {#where-to-improve}

Hliðarstikuhlutinn fyrir hringinn sem er í brennidepli („Hladdu að minnsta kosti tveimur hringjum á einni braut.“ þangað til).

**Hausinn:** „<hringur> <tími> á móti <viðmið> <tími>“ og bilið í hringtíma, eða, fyrir viðmiðið, „á móti fljótasta öðrum hring í gegnum hverja beygju (…)“ og heildartapið. Við hliðina er tapinu skipt í *akstur* og *bíl / aðstæður*.

**Tapstikan:** tíminn sem tapaðist eftir orsakahópum (bremsun, innkeyrsla, útkeyrsla, beinn kafli, bíll, aðstæður), í litum orsakanna, með skýringu.

**Niðurstöðurnar**, þrír listar:

1. Tap í akstri, dýrasta fyrst, í mesta lagi **12**, eða „Hvergi sker sig úr staður þar sem annar akstur myndi vinna tíma.“
2. **Sýna hvað bíllinn eða aðstæðurnar kostuðu (X s)**: tap vegna bíls og aðstæðna, í mesta lagi 8 (kveikt sjálfgefið).
3. **Þar sem <hringur> er fljótari, eða jafn á annan hátt (N)**: ávinningur og jafnar beygjur, í mesta lagi 10 (kveikt sjálfgefið).

Hver niðurstaða sýnir röð sína, titil (beygjuna og hvað gerðist, með kostnaðinum fyrir tap), dómslínuna, kostnaðinn (ávinningur með mínus) með stiku, og merki: *bremsun*, *innkeyrsla*, *útkeyrsla*, *beinn kafli* (tap í akstri, með „· bíll X“ þegar bíllinn skýrir 0,02 s eða meira), *bíll*, *aðstæður*, *fljótari*, *jafnt*. **Smelltu á eina** til að stilla bílunum upp 40 m fyrir hana, ramma hana inn og endurspila hana, og opna mælingar hennar:

- **Bremsun:** hvar hvor bremsaði (eða létti á) og hvaða hraða, og hversu mörgum metrum fyrr eða seinna (frá 5 m);
- **Hægast:** lágmarkshraði hvers hrings og hvar;
- **Full inngjöf:** hvar hvor var flatur, og hversu mikið fyrr eða seinna;
- **Lína:** munur á innsnúningi, þrengstu radíusar, hversu langt innar eða utar, og lögun línu og apex hvers hrings;
- **Beinn kafli að næstu beygju:** lengd hans, báðir hraðar þar sem báðir voru flatir, hvað hann tapaði eða vann og á hverju: upphafshraðinn, sterkara afl hins, lyfting, hraði sem var skrapaður af, hvernig var ekið (hlutar frá 0,02 s);
- **Bíllinn:** hversu mikið af tapinu er bíllinn, og á hverju (afl, grip, bremsur; þegar 0,02 s eða meira);

síðan ábendingin, **Bílarnir:** (á mismunandi bílum, sjá [Bílasnið](race-car-profiles.md#what-the-cars-decide-in-a-corner)), og ráðið um línuna.

### Beygja fyrir beygju {#corner-by-corner}

Tafla (með tveimur hringjum eða fleiri), ein röð fyrir hvern kafla, fyrir flokk hringsins sem er í brennidepli þegar þeir eru fleiri en einn:

| Dálkur | Sýnir |
|---|---|
| Beygja | `T3`, `T11-T12` |
| Fljótastur | hringinn sem var fljótastur í gegnum hana (eigin tími frá upphafi kaflans til enda hans) |
| munur | forskot hans á annan fljótasta, s |
| lína | lögun og apex fljótasta hringsins („V · seint“, „U/V · í miðju“); hafðu músina yfir til að sjá þrengsta, innkeyrslu- og útkeyrsluradíus; „á báða vegu“ fyrir blandaða samstæðu |
| (hringurinn í brennidepli) | hversu langt á eftir þeim fljótasta hann var, eða ✓ þegar hann var fljótastur |

Ef smellt er á röð opnast niðurstaða brennihringsins þar (eða bílunum er stillt upp 40 m fyrir kaflann). Undir töflunni, þegar sérhver beygja hefur tíma: „Þeir fljótustu í gegnum hverja beygju, settir saman: <tími> (± á móti viðmiðinu / á móti besta hring flokks X)“ – bestu kaflarnir auk fljótasta aksturs að fyrstu beygju þegar hún er sérstakur kafli.

## Hvernig þetta er reiknað {#how-it-is-worked-out}

Meginreglan: **beygja er metin í heild**, frá bremsusvæðinu fyrir hana að bremsusvæðinu fyrir þá næstu. Hringur sem bremsar fyrr til að fá bílinn snúinn og á afli fyrr fær kredit fyrir útkeyrsluna sem hann keypti, en er ekki sagt að bremsa seinna.

## Einn vegalengdarás {#one-distance-axis}

Hringir eru bornir saman eftir vegalengd, ekki tíma: sekúndu á eftir eru tveir hringir á mismunandi beygjum. Ekki heldur eftir kílómælinum hvors hrings (þrengri lína fer færri metra). Ekna leið **viðmiðshringsins** er ásinn:

- Sýnum allra annarra hringja er **varpað** á viðmiðsleiðina: hvert sýni fær `s`, hversu langt eftir viðmiðinu það er, og `d`, hversu langt til vinstri (jákvætt) eða hægri. Leitin fer fram á við frá síðustu samsvörun (8 leiðarhlutar aftur á bak til 40 fram), þannig að hringur sem fer yfir eða undir sjálfan sig smelli aldrei yfir á hinn krossinn. Fyrsta sýnið er leitað í fyrsta fjórðungi leiðarinnar (á braut falla ræsing og endamark saman); þegar ekkert er innan 30 m er tekinn næsti punktur hvar sem er sem er ekki á bak við síðustu samsvörun (eftir snúning eða útafakstur). `s` lækkar aldrei: sýni sem varpast aftar en það á undan er haldið.
- Sérhver rás er **endurtekin** á eitt rist, **á 2 m fresti**, línulega; rásir sem stökkva (gír, fánar) fá næsta sýni. Utan eigin sviðs hrings eru gildin tóm.
- Fyrstu og síðustu sýni hrings varpast aðeins innan endanna á viðmiðinu, þannig að hver hringur er **borinn allt að 15 m** framhjá endum sínum á þeim hraða sem hann hafði (tíminn vex eftir vegalengd deilt með hraða, restin helst) – þannig að deltan við ráslínuna er munurinn á hringtímunum.
- `delta` = tími hringsins í hverjum ristpunkti mínus tími viðmiðsins: bilið. `lateral` = `d` á ristinni.

Tíminn sem einn hringur tók umfram annan á milli tveggja ristpunkta er munurinn á deltum þeirra: `rel(s)`. Allt hér fyrir neðan er byggt á því.

## Beygjur {#corners}

Fundnar á **viðmiðinu** (`findCorners`), með hraða þess sléttuðum yfir ±6 m og ferli þess (stefnubreyting yfir ±5 sýni, sléttuð yfir ±10 m):

1. **Hraðalágmörk með áberandi falli.** Punktur sem er lægstur innan ±40 m, og fall hans frá hæsta hraða hvorum megin (áður en lægra lágmark kemur) er að minnsta kosti `max(2,5 m/s, 6% af hraðanum)`.
2. **Beygjuhnykkir.** Staðbundinn tindur ferilsins þrengri en **300 m** radíus án hraðalágmarks innan 80 m: hnykkur sem er ekinn á fullri inngjöf er samt beygja sem þarf að aka.
3. **Fasar.** Frá sérhverjum apex aftur á bak meðan viðmiðið bremsar (> 0,1) eða er ekki á fullri inngjöf (< 0,95): innkeyrslan; áfram meðan ekki er á fullri inngjöf: útkeyrslan. Hnykkur ekinn flatur fær ±30 m. Skarast beygjur eru haldnar aðskildum en látnar leggjast saman yfir hringinn.
4. Númeruð T1, T2 … í röð hringsins; **vinstri eða hægri** eftir formerki ferilsins og því hvort heimurinn er speglaður (óþekkt telst speglað).

**Beygjugluggin** (þar sem viðmiðið snýst): út frá þrengsta punktinum innan ±40 m frá apex meðan ferillinn helst yfir sjöttungi hámarks síns, auk 10 m hvorum megin. Hliðin gefur formerki „innan“.

## Kaflar: frá bremsusvæði til bremsusvæðis {#segments-braking-zone-to-braking-zone}

Hver beygja á veginn hálfa leið að apexunum hvorum megin. Í honum:

- **Hægasti punktur hvers hrings** er raunveruleg lækkun á hraða hans: ekkert hægara innan 6 m (3 ristpunkta) hvorum megin, og horft framhjá endum kaflans, þannig að útkeyrsla fyrri beygjunnar sem er enn að auka hraða inn í hana er aldrei tekin fyrir hana. Leitað frá 15 m fyrir beygjugluggann til 10 m eftir hann. Hringur sem hægði aldrei þar er settur á apex.
- **Hvar hringur byrjaði að hægja á sér fyrir hana** (`entryOf`): aftur frá hægasta punkti sínum í gegnum bremsuna eða lyftinguna, yfir smáa bletti af fullri inngjöf, þangað til hann hafði fótinn niðri (inngjöf ≥ 0,95, bremsa ≤ 0,1) í **10 m**. Inngjöf sem var tekin aftur upp á síðustu **30 m** fyrir hægasta punktinn tilheyrir enn beygjunni; á fullri inngjöf alla leið, hægasti punkturinn sjálfur. Hringur án inngjafarrásar, eða sem hafði aldrei fótinn niðri síðan í beygjunni á undan, byrjar á hraðasta punkti sínum þar á milli.
- **Kaflinn byrjar** við þann fyrsta af öllum hringjunum sem byrjaði að hægja á sér fyrir hana (4 m fyrr), og nær að upphafi þeirrar næstu, þannig að bremsun hvers hrings er innan hans og kaflarnir leggjast saman yfir hringinn.

**Samstæður.** Samliggjandi beygjur sem viðmiðið er aldrei ekið á fullri inngjöf á milli – minna en **40 m** af fullri inngjöf – eru einn kafli, „T11-T12“, ekinn sem einn; samstæða geymir í mesta lagi **þrjár** beygjur (krókóttur kafli sem er ekinn án þess að vera nokkurn tíma flatur byrjar nýja). Samstæða sem beygir til beggja handa er *blönduð*: engin ein lögun línu er mæld fyrir hana.

**Á braut** (viðmiðið endar innan 50 m frá því þar sem það byrjaði) heldur síðasti beini kaflinn áfram yfir endamarkið að fyrsta bremsupunktinum.

Akstur hrings yfir endamarkið telst með síðustu beygjunni. Hringur sem byrjaði kyrrstæður eða við ræsingu (sjá [Ræsinguna](#the-start)) heldur þeim akstri aðskildum.

### Á hvað beygja leiðir {#what-a-corner-leads-onto}

Mælt á viðmiðinu: metrar á fullri inngjöf eftir beygjuna (frá fullri inngjöf hennar til enda kaflans, auk aksturs yfir endamarkið) og fyrir hana (`after` fyrri kaflans, eða frá upphafi).

| Gerð | Regla |
|---|---|
| **milli tveggja beinna kafla** (`both`) | 200 m eða meira fyrir **og** 120 m eða meira eftir |
| **inn á beinan kafla** | 200 m eða meira eftir, eða 120 m eða meira eftir og að minnsta kosti jafnmikið og fyrir |
| **eftir beinan kafla** | 200 m eða meira fyrir |
| **tenging** | allt annað |

## Það sem hver hringur gerði í beygju {#what-each-lap-did-in-a-corner}

`cornerMetrics`, fyrir hvern hring og kafla, á ristinni (skref 2 m). Pedalar: bremsa telst yfir 0,1, full inngjöf er 0,95 og yfir.

| Mæling | Regla |
|---|---|
| **bremsupunktur** | fyrsta bremsan sem inngjöfin var létt undir (undir 0,5), eða sem entist í **15 m**; snerting með vinstri fæti meðan aflið er á er ekki þar sem bremsun hófst; ef aðeins eru snertingar, fyrsta snertingin |
| **létt á** | án bremsunar, fyrsti punktur þar sem inngjöfin fór undir 0,8 |
| (engir pedalar) | punkturinn þar sem hringurinn byrjaði að hægja á sér (að ofan) |
| **slepping bremsu** | síðasta bremsan allt að 30 m framhjá hægasta punkti |
| **hraði við bremsupunktinn**, **bremsumetrar** | að hægasta punkti |
| **hámarksbremsun**, **hámarkshraðaminnkun** | yfir bremsusvæðið (hröðun yfir 45 m/s² er hunsuð) |
| **slóðabremsun** | metrar með bremsu > 0,05 og |stýri| > 0,1 |
| **læsingarrenni** | mesta neikvæða renni hjólsins á svæðinu (þegar hringurinn hefur renni) |
| **hægasti punktur**, **lágmarkshraði** | eins og ofar |
| **inngjöf á** | eftir slepping (eða hægasta punkt), fyrsta inngjöf > 0,15 án bremsu |
| **full inngjöf** | fyrsti punktur eftir það sem hélst í ≥ 0,95 í 10 m |
| **án pedala** | metrar frá slepptingu að inngjöf á með bremsu og inngjöf báðum undir 0,05 |
| **inngjafarlægðir** | skiptin sem inngjöfin féll meira en 0,25 undir hæsta gildi sínu milli inngjafar á og fullrar inngjafar |
| **mesta hliðarhröðun** | mesta hliðarhröðun frá 20 m fyrir slepptingu til þess sem síðar kemur, fullrar inngjafar eða 20 m framhjá hægasta punkti |
| **gír við apex** | við hægasta punkt |
| **spólrenni** | mesta renni drifhjólsins milli inngjafar á og fullrar inngjafar |
| **jafnvægi** | framrennihorn mínus afturrennihorn í gegnum miðjuna (+ undirstýring) |
| **beint á fullri inngjöf** | hlutfall kaflans eftir fulla inngjöf (og aksturs yfir endamarkið) á ≥ 0,95; lengsta lyfting á honum |
| **hraðatap** | mesta hraðatap frá hám punkti með inngjöf ≥ 0,9, engin bremsa, á undirlaginu |
| **inngangsrenni** | mesta skriðhorn frá bremsupunkti til 5 m framhjá hægasta punkti, á undirlaginu |
| **handbremsa** | hvar hún kom á (> 0,2), allt að 10 m framhjá hægasta punkti |
| **loft** | sekúndur í loftinu yfir kaflann og lengsta flug hans |

## Hvaða hringur er borinn saman við hvern {#who-each-lap-is-compared-with}

- Hringur er borinn saman við **fljótasta heila hringinn í eigin afkastaflokki** (viðmiðið, í flokki viðmiðsins).
- Sá besti í flokknum (og viðmiðið) er borinn saman, kafla fyrir kafla, við **þann annan hring í flokknum sem var fljótastur** í gegnum hann, eða við alla hringi þegar hann er einn í sínum flokki.

Tímakortið, bilin í hringjalistanum, atburðir í stýringu bíls og beygjutaflan fylgja sama samanburði.

## Tímareikningur beygju {#the-time-account-of-a-corner}

`compareCorner`, fyrir hring á móti hinum yfir kafla:

- **nettó** = `rel(end) - rel(start)` (auk aksturs yfir endamarkið á hring á fullri ferð): dómurinn. Nær en **0,03 s** er **jafnt**.
- **Skiptingin** – hvar innan beygjunnar forystan snerist: á kaflanum frá fyrsta bremsupunkti eða hægasta punkti hvors hrings að þeim síðari af fullri inngjöf þeirra og hægasta punkti, mesta sveiflan sem hringurinn þá gaf til baka eða vann til baka, þegar sú sveifla er yfir **0,04 s**; annars hinn síðari af hægustu punktunum tveimur.
- **Að apex** = `rel(split) - rel(start)`; **eftir hann** = nettó mínus það. Þegar bæði eru að minnsta kosti 0,04 s og með gagnstæð formerki hefur hringurinn **skipt** einu fyrir annað.
- **Eftir hann** skiptist aftur þar sem báðir hringirnir eru á fullri inngjöf: **útkeyrslan** (skipting að síðari fullri inngjöf) og **beini kaflinn** (þaðan til enda).
- **Beini kaflinn** skiptist í þrennt:
  - *útkeyrsluhraði* (`byExit`) – mældur, ekki líkaður: hægari bíllinn fer framhjá upphafshraða hins hraðari eftir smávegis á beina kaflanum, og frá þeim punkti er hans eigin ferill það sem hann hefði gert frá þeim hraða, með sínum eigin gírum, viðnámi og halla í sér. Færður til baka á þann punkt (og keyrður áfram á lokahraða sínum fyrir þá metra sem hann vinnur) er það tími hans frá hraðari upphafinu; munurinn er kostnaður útkeyrsluhraðans. Þegar hægari bíllinn nær aldrei þeim hraða (eða aðeins á síðustu 2 sýnunum), er eigin hröðun hans eftir kaflanum sett aftur sem afl (`a·v` haldið), aldrei harðar en umslag hans sýnir á þeim hraða (tvöföld mæld hröðun ef ekkert umslag er).
  - *afl bílanna* (`byPower`) – aðeins á mismunandi bílum: báðir bílarnir frá sama hraða yfir sömu metra, á fullri inngjöf, með heildun á þeirri hröðun á fullri inngjöf sem hvor hefur sýnt á hverjum hraða.
  - *hvernig var ekið* (`driven`) – afgangurinn: lyfting, hraðatap á fullri inngjöf.

  Útkeyrsluhraðinn skýrir aldrei meira en tapið á beina kaflanum (og aldrei með gagnstæð formerki), nema lyfting eða hraðatap hafi tekið eitthvað til baka. Hringur **lyfti** á beina kaflanum þegar hlutdeild hans á fullri inngjöf er undir bæði 0,9 og hlutdeild hins mínus 0,05. Hraðatap telst þegar þau tvö eru ólík um meira en 1 m/s. Ágreiningur undir 0,02 s að formerki er settur á 0.

Nettó hvers kafla leggst saman í tímamismuninn á hringjunum, og tíminn að apex og eftir hann í hverri beygju leggst saman í nettóið (prófin staðfesta bæði).

### Hlutdeild bílsins {#the-cars-share}

Aðeins þegar hringirnir eru á **mismunandi bílum** og hringurinn tapaði tíma (`carShare`):

- **afl**: afl bílanna niður beina kaflann (að ofan), upp að tapinu;
- **grip**: þegar hringurinn var á mörkum bílsins (hliðarhröðun á miðjunni að minnsta kosti **90%** af því sem bíllinn heldur á þeim hraða) og hinn bíllinn heldur meira en **5%** meira: af lægra lágmarkshraða sem er ekki skýrður af þrengri radíus, hlutdeildin `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)` af því tapi sem eftir er;
- **bremsur**: þegar hringurinn bremsaði (ekki lyfti), bremsar hinn bíllinn **5%** harðar, og meðalhraðaminnkun hringsins yfir svæðið var að minnsta kosti **80%** af því sem bíllinn getur: frá `u` niður í `v` með `a1` á móti `a2`, sem endar á sama stað, `(1/a1 - 1/a2)(u - v)² / 2u`, upp að því sem eftir er.

Kostnaður bílsins er summan, í mesta lagi tapið.

## Dómurinn og niðurstaðan {#the-verdict-and-the-finding}

`cornerFinding` skrifar í mesta lagi eina niðurstöðu fyrir hvern hring og beygju, reynd í þessari röð:

| Tilvik | Niðurstaða | Útkoma |
|---|---|---|
| nettó innan ±0,03 s, skipti, minni hliðin ≥ **0,1 s** | **jafnt, tvær leiðir í gegn** – hver var hægur inn og hraður út, hver hinn veginn; með beinum kafla á eftir (inn á beinan kafla, eða milli tveggja), er leiðin hægt inn, hratt út sú sem á að byggja á: halda snemmbúinni inngjöfinni, vinna innkeyrsluna til baka með harðari bremsu, ekki seinna | jafnt |
| nettó innan ±0,03 s annars | ekkert sagt | – |
| unnið, skipti, tapað að apex | **hægt inn, hratt út borgaði sig**: halda því, hér er útkeyrslan meira virði | ávinningur |
| unnið, skipti, unnið að apex | **fljótari á leiðinni inn**: innkeyrslan er rétt, fyrri full inngjöf myndi halda meiru | ávinningur |
| unnið, og hinn hringurinn hefur tap hér | **fljótari – vegna þess sem hinn gerði**, orsök hans og ábendingin sögðu „Fyrir hinn hringinn: …“ | ávinningur |
| unnið annars | **fljótari á leiðinni inn / út**, eftir því hvor helmingurinn vann meira (bremsað seinna, meiri hraði um miðjuna; eða flatur fyrr, sterkara afl) | ávinningur |
| tapað, og **högg eða árekstur** kostaði að minnsta kosti `max(0,05 s, 40% af tapinu)` | höggið er saga beygjunnar, á undan bílunum | tap |
| tapað, og **hlutdeild bílsins** er 60% eða meira | **bíllinn**: afl hans niður beina kaflann, grip hans um miðjuna, eða bremsur hans – stærsti hlutinn; með hlut ökumannsins (≥ 0,03 s) sagðan sem „Hinir X s: …“ | tap |
| tapað, og ein óhlutdeild **bilun í stjórn bíls** kostaði að minnsta kosti `max(0,05 s, 40%)` | sú bilun (sjá að neðan), með því hvernig tíminn færðist til í kringum hana | tap |
| tapað, og **lengra flug** kostaði að minnsta kosti `max(0,05 s, 40%)` | fluginu | tap |
| tapað, skipti, unnið að apex | **of hratt inn, hægt út**: orsök útkeyrslunnar; gefa eftir innkeyrslu til að fá bílinn snúinn og flatan fyrr, með bremsu- og fullri inngjafarpunktum hins hringsins. Rót hans (`cause`, sem [tölfræðin](race-course-statistics.md) telur): bremsað seinna, þegar hann bremsaði meira en nokkrum metrum seinna en hinn; annars orsök útkeyrslunnar | tap |
| tapað, skipti, tapað að apex | **tapaði meira á leiðinni inn en útkeyrslan vann til baka**: orsök innkeyrslunnar, sem jafnframt er rót hennar (`cause`); halda útkeyrslunni, tapa minna á leiðinni inn | tap |
| tapað, lyft á beina kaflanum, og ekni hlutinn yfir helming tapsins | **ekki á fullri ferð á beina kaflanum**: hlutdeild hans á fullri inngjöf borin saman við hinn, hvar og hversu lengi lyftingin var | tap |
| tapað, afl bílanna yfir 60% af tapinu og beini kaflinn yfir helming | **afl bílsins niður beina kaflann** (með afli beggja bílanna á 160 km/h) | tap |
| tapað annars | orsök þess helmings sem tapaði meira (að apex ≥ eftir hann: innkeyrslunnar; annars útkeyrslunnar). Hægar út aðeins vegna þess að hægara var um miðjuna (um meira en 1 m/s): orsök miðjunnar í staðinn | tap |

Niðurstaða um tap getur líka endað á **Auk þess:** – hraðatapi á fullri inngjöf, eða lyftingu á beina kaflanum – þegar ekni hluti beina kaflans kostaði meira en 0,04 s og það var ekki þegar orsökin.

Niðurstöður eru raðaðar: töp fyrst, dýrasta fyrst; síðan ávinningur og jöfn beygja.

### Orsakir á leiðinni inn {#causes-on-the-way-in}

`entryCause`, sú fyrsta sem á við (munur á lágmarkshraða er í m/s; „5 m“ er þröskuldurinn fyrir að punktur fyrr eða seinna teljist):

| # | Orsök (mistök) | Regla |
|---|---|---|
| 1 | högg eða árekstur á leiðinni inn | óhlutdeilt högg sem byrjar innan 10 m framhjá hægasta punkti |
| 2 | **næstum stopp** (atvik) | hægasti hraði undir **60%** af því sem grip þessa bíls leyfir þar sem hinn fór um (`v_other · √(grip_mine / grip_other)` þegar hinn bíllinn heldur meira gripi, annars hraði hins), hringurinn hins yfir 8 m/s – snúningur, snerting eða beygju sleppt |
| 3 | bilun í stjórn bíls á leiðinni inn | óhlutdeilt læsing, ýting, snúningur eða rennsli án inngjafar, sem byrjar innan 10 m framhjá hægasta punkti, kostaði ≥ 0,02 s |
| 4 | lengra flug fyrir hægasta punkt | sjá [rall](#rally-rotation-and-flights) |
| 5 | **létt á** þar sem hinn hélt fullri inngjöf eða létti 5 m eða meira síðar | þessi hringur einn létti á |
| 6 | **bremsað þar sem hinn aðeins létti á** eða hélt fullri inngjöf | og var meira en 0,5 m/s hægari um miðjuna |
| 7 | **bremsað mjúklega** | hann bremsaði (ekki lyfti), hafði svigrúm til að bremsa harðar – með dekkjagögnum, læsingarrenni undir **60%** af rennin þar sem bremsur þessa bíls gefa sem mest; án þeirra, hraðaminnkun á tindi undir **85%** af því sem hann sýnir á þeim hraða – pedalinn undir 0,95, og hámarkshraðaminnkun hins hringsins meira en **15%** hærri |
| 8 | **bremsað snemma** – eða **bremsur bílsins** | bremsað meira en 5 m fyrr en hinn. Í öðrum bíl sem hefur bremsur meira en 5% sterkari, og með ekki meira en 10 m svigrúm miðað við vegalengdina sem þessi bíll þarf við eigin hraðaminnkun: bremsur bílsins. Annars bremsað snemma, með „Bremsa seinna – um N m“ (í öðrum bíl, metrarnir umfram það sem hann þarf) |
| 9 | **rann án pedala** | meira en 10 m án nokkurs pedala, og 5 m meira en hinn |
| 10 | **hægari um miðjuna** | meira en 0,5 m/s hægari í hægasta punkti; skipt eftir `v² = a·R` (að neðan) |
| 11 | **kom hægar** | yfir 1 m/s hægari við bremsupunktinn, án þess að bremsað væri snemma: ákveðið fyrr – af beygjunni á undan og afli bílsins, eða af flugi í beygjunni á undan sem var 0,2 s lengra. Bílsins þegar bílarnir eru ólíkir |
| 12 | hægari að apex | annars: slepptu bremsunni mjúkar og láttu meiri hraða renna inn í miðjuna |

**Hægari um miðjuna** (`middleSplit`): radíus hvers hrings á hægasta punkti hans er mældur út frá eigin ferli (±8 m), hliðarhröðun hans sem `v²/R`, og

`ln(v_other / v_mine) = ½ ln(a_other / a_mine) + ½ ln(R_other / R_mine)`.

- Radíusinn skýrir **helming eða meira**: **of þröng lína** – „nýttu meira af veginum“, með báðum radíusunum og hlutdeildinni.
- Á mörkum bílsins (rennur framhjá 10° skriði á malbiki / 20° á lausu, eða hliðarhröðun að minnsta kosti 90% af því sem hann heldur á þeim hraða) og hinn bíllinn heldur meira en 5% meira: **grip bílsins**; verndaðu útkeyrsluna í staðinn.
- Rennur í gegnum hana (skrið framhjá 10° / 20°) og hinn hringurinn gerði það ekki (innkeyrsluskrið hans að minnsta kosti 4° minna): **til hliðar** – framhjá gripinu, ekki skammt frá því; kom aðeins hægar. Sagt vera bílsins þegar þessi bíll missir afturendann að minnsta kosti einu sinni á hring oftar en hinn.
- Í öðrum bíl sem heldur undir **96%** af gripi hins, og hringurinn hélt innan 1 m/s af `v_other · √(grip_mine / grip_other)`: **grip bílsins** – „að bremsa seinna lagar það ekki“.
- Annars **grip til vara**: hliðarhröðun samanborin við hins á svipuðum radíus, og það sem þessi bíll heldur; taktu meiri hraða inn í apex. Þar sem afturendi þessa bíls sleppir áður en gripið er uppurið (rennsli hans byrjar undir 85% af gripi hans, og hringurinn var á 80% af því), finndu afganginn í litlum skrefum.

### Orsakir á leiðinni út {#causes-on-the-way-out}

`exitCause`, sú fyrsta sem á við:

| # | Orsök (mistök) | Regla |
|---|---|---|
| 1 | bilun í stjórn bíls á leiðinni út | óhlutdeilt spólrenni, snúningur, rennsli eða högg sem endar við eða eftir 10 m fyrir hægasta punkt |
| 2 | **hraðatap** | meira en 1 m/s meiri hraðatap á fullri inngjöf en hinn; yfir **7 m/s (25 km/h)** „líkara snertingu eða snúningi en rennsli“ |
| 3 | **sneri bílnum vitlaust** (laust undirlag) | sjá [rall](#rally-rotation-and-flights) |
| 4 | **á afli seinna** | inngjöf á meira en 5 m seinna, talið líka frá hægasta punkti hvers hrings (hringur sem er hægastur seinna er ekki ásakaður fyrir seinni inngjöf) |
| 5 | **hikaði á inngjöfinni** | fleiri inngjafarlægðir en hinn |
| 6 | **ók út á breiddina og beið** | meira en 1,5 m utar en hinn þar sem báðir voru flatir, og full inngjöf meira en 5 m seinna frá eigin hægasta punkti |
| 7 | **full inngjöf seinna** | full inngjöf meira en 5 m seinna, líka frá eigin hægasta punkti; með hröðun bílsins þar |
| 8 | **akstur bílsins** | í öðrum bíl sem togar minna en 95% af hinum á þeim hraða, og aflið skýrði hluta beina kaflans |
| 9 | **hægari út úr beygjunni** | annars: seinna apex, svo bíllinn er beinn fyrr |

Þegar tveir hringir voru á mismunandi gírum í hægasta punkti endar ábendingin á „Gír N í apex; hinn notaði M.“

### Bilanir í stjórn bíls og högg {#car-control-faults-and-impacts}

Bilun úr [Atburðir í stýringu bíls](race-control-events.md) sem orsök: læsing er *bremsuorsök*, spólrenni eða rennsli á inngjöf *útkeyrsluorsök*, og hitt *innkeyrsla*; högg eftir hægasta punkt er *útkeyrsla*, fyrir hann *innkeyrsla*. Ábendingin er eigin ábending atburðarins, og síðan „Það kostaði um X s fram að 40 m eftir það“ (eða „fram að því að bíllinn náði hraðanum sínum aftur“ fyrir högg). Læsing þar sem bremsupunktur var meira en 5 m fyrr en hjá hinum bætir við að hringurinn bremsaði líka snemma – með hjólin snúast hefði hann ekki þurft þess.

### Rall: snúningur og flug {#rally-rotation-and-flights}

Á **lausu undirlagi**, með skriðhornum á báðum hringjum, og þessi hringur er á afli (eða flatur) meira en 5 m seinna:

- **Sneri bílnum minna**: hinn hafði bílinn snúinn **12°** eða meira við hægasta punkt sinn og að minnsta kosti **8°** meira en þessi hringur. Ábending: létta á eða snerta vinstri fóta-bremsuna þegar hann snýst inn, með handbremsupunkti hins hringsins þegar aðeins hann notaði hana, eða handbremsuna í beygju hægari en 15 m/s (54 km/h).
- **Sneri honum of mikið**: þessi hringur hafði hann snúinn um 12° eða meira og að minnsta kosti **12°** meira en hinn: það þurfti að rétta hann áður en aflið gat farið niður.

**Lengra flug**: í loftinu 0,2 s eða meira lengur en hinn, og kostaði að minnsta kosti 0,03 s frá 10 m fyrir flugtak til 40 m eftir lendinguna (eða enda kaflans). Fyrir hægasta punkt er það orsök á innkeyrslu; það verður saga beygjunnar þegar það skýrir 40% eða meira. Ábendingin: haltu inngjöfinni á við flugtak, taktu hrygginn aðeins hægar eða með snertingu á bremsunni.

### Ræsingin {#the-start}

Áður en fyrsta beygjan kemur, á spretti eða þegar annar hvor hringurinn byrjaði kyrrstæður (undir 5 m/s þar sem báðir eru fyrstir á ásnum) eða við ræsingu í keppni (undir 60% af hraða hins), er aksturinn að fyrsta bremsupunktinum sín eigin niðurstaða (beygja 0) þegar hann er meira en 0,03 s frábrugðinn: *Ræsingin*, *Keppnisræsingin* eða *Að fyrstu beygju*. Tap þar er rakið til aðstæðna (*aðstæður*) þegar annar hringurinn byrjaði í keppnisræsingu og hinn á hraða, til bílsins þegar hringirnir eru á mismunandi bílum, og annars til ökumannsins. Ábendingar: á öðrum bíl úr kyrrstöðu, „oftast bíllinn“; kyrrstæð ræsing á sama bíl, ræstu með minna spólrenni og skiptu á efri hluta aflsviðsins; keppnisræsing, berðu hana saman við annan fyrsta hring; ræsing á hreyfingu, betri útkeyrsla úr síðustu beygju berst yfir endamarkið.

## Eknu línan {#the-driven-line}

`lineMetrics`, fyrir hvern hring og kafla (ekki fyrir blandaðar samstæður), eingöngu út frá staðsetningum (sléttaðar ±2 sýni) yfir beygjugluggann:

| Mæling | Regla |
|---|---|
| ferill | stefnubreyting yfir ±8 m af eigin leið hringsins |
| **þrengsti radíus** | 1 / hámarksferill |
| **innsnúningur** / **útsnúningur** | þar sem ferillinn fór fyrst / síðast yfir fimmtung af hámarki sínu |
| **miðja** | þar sem hringurinn hafði snúist um helming stefnubreytingar sinnar |
| radíus inn / út | metrar eknir yfir helming stefnubreytingarinnar, fyrir / eftir miðjuna |
| **lögun** | þrengsti radíus á móti meðalradíus meðan beygt er: undir **0,55** er **V**, yfir **0,75** er **U**, á milli „U/V“ |
| **apex** | radíus út á móti radíus inn: yfir **1,25** seint, undir **0,8** snemma, annars í miðju |
| **hraðaapex** | hægasti punkturinn meira en **15 m** fyrir miðjuna: hægt inn, hratt út; meira en 15 m eftir: enn að hægja á sér framhjá miðjunni |

Á móti hinum hringnum: hversu langt innar (+) eða utar hann ók við innsnúning, í gegnum þrengsta hlutann og þar sem báðir voru flatir (sagt frá 1 m); hvar hvor snerist inn (sagt frá 8 m).

### Hvaða lína hentar þessum bíl hér {#which-line-suits-this-car-here}

`lineFor`, út frá því sem beygjan leiðir inn á og eðli bílsins í þessari beygju:

- **afl á móti gripi** = fullrar inngjafar hröðun bílsins á útkeyrsluhraða deilt með gripi hans á lágmarkshraða (úr umslagi hans). **Point and shoot** við **0,45** og yfir; **momentum** við **0,25** og undir.
- **niðurtog**: grip á 151-252 km/h deilt með grip á 54-108 km/h, **1,15** eða meira, fyrir beygju ekna á **144 km/h** (40 m/s) eða hraðar – þá er hún momentum-beygja hvert sem aflið er. Ekki metið á lausu undirlagi.

| Gerð beygju | Bíll | Lína |
|---|---|---|
| eftir beinan kafla | point and shoot / annað | V / U, apex í miðju: „bremsusvæðið er verðlaunin“ |
| milli tveggja beinna kafla | momentum / annað | U / V, seint apex |
| tenging | momentum / annað | U / V, apex í miðju: „ekið henni fyrir útkeyrslu þeirrar næstu“ |
| inn á beinan kafla | momentum (eða hraðskreið niðurtogsbeygja) | breiður, kringlóttur U, aðeins seint apex |
| inn á beinan kafla | point and shoot | V: bremsa beint, snúa seint inn, snúa í stuttri þéttri miðju, beint snemma |
| inn á beinan kafla | þar á milli | U með seinu apex: hægt inn, hratt út |

Þar sem útkeyrslan skiptir máli (inn á beinan kafla, milli tveggja) bætir drifrásin við setningu: **FWD** – snúðu honum á bremsunum, gefðu afl aðeins þegar hjólið réttir úr sér; **RWD** með afl á móti gripi upp á 0,35 eða meira – réttu hann áður en full inngjöf kemur; **AWD** – hann getur tekið afl meðan hann snýst enn. Á lausu undirlagi bætist hver lína við: snúðu bílnum á leiðinni inn.

Setningin segir síðan hvað hringurinn ók, og hvort það passar: *hægasti punktur seint bindur útkeyrsluna* eða *snemmbúið apex bindur útkeyrsluna* þar sem seint apex var óskað og hringurinn hvorki tók apex seint né var hægastur snemma; *kringlóttari en þessi bíll vill* þar sem V var óskað; *ferkantaðri en þessi bíll vill* þar sem U var óskað; annars *það passar*.

## Fyrir forritara {#for-developers}

Kóði: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Rökstuðningurinn og heimildirnar: [aðferðin](race-analytics.md).
