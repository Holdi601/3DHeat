---
title: "Racinganalys: metoden"
parent: "Racinganalys"
nav_order: 58
lang: "sv"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Racinganalys: metoden

Kort sagt:

- Varv jämförs **efter sträcka**, inte efter tid, så samma plats på banan hamnar på rätt ställe.
- Varje kurva bedöms **som en helhet**, från en inbromsningszon till nästa.
- Tiden som förloras **delas upp** efter var den förlorades (inbromsning, insväng, utgång, raka) och hur stor del av den som bilen förklarar.
- Orsaken **förklaras med ord**, med råd.
- För att använda den, inte för att läsa hur den fungerar: se [Racinganalys](race-analysis.md).

Den här sidan beskriver metoden bakom fliken **Racinganalys**: vad den mäter, hur den avgör var tiden försvann och hur den gör om det till råd. Det är den specifikation som analyskoden (`src/race/`) följer, så varje regel här har en motsvarighet där och ett test som låser den.

## Vad de professionella verktygen gör {#what-the-professional-tools-do}

De etablerade verktygen är överens i kärnan och skiljer sig mest i hur långt de går mot *orsaker*:

- **Allt jämförs efter sträcka, inte tid.** Två varv samplas om till en gemensam sträckaxel. Skillnaden i förfluten tid vid samma sträcka är *deltat* (MoTeC kallar det time variance, andra kallar det tidsglapp eller deltakurva). Dess lutning visar var tid förloras just nu: en flack lutning är acceleration, luftmotstånd eller ihållande grepp, en brant lutning är en skillnad i inbromsning eller gaspådrag, och ett upp-och-ner-vågmönster är en avvägning mellan insvängsfart och utgångsfart.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [analys av sektortid](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Varje kurva delas upp i faser**: inbromsning, insväng, mitt, utgång. Bromspunkt, toppbromsning och släpp, lägsta fart och var den sker, växel, gasinsättning, återgång till full gas och utgångsfart.
  ([Driver61: sex faser](https://driver61.com/uni/corner-phases/),
  [iRacing-guide för varvanalys](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Minisektorer per kurva och ett teoretiskt bästa varv**, sammansatt av den snabbaste delen av varje. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Den körda linjen jämförs också**, men aldrig ensam: "en linje på en bild betyder ingenting förrän du vet de bidragande faktorerna". Den läses mot hastighetskurvan och deltat.
  ([Track Titan: så analyserar du telemetri](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racinglinjer](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Grundorsak, inte symptom.** Är förlusten på raksträckan verkligen gasen, eller tvingade en dålig insväng fram sen gas? Misstag rangordnas efter kostnad i varvtid och förklaras med enkla ord.
  ([Track Titan: coachningsflöden](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Vad som gick fel i första versionen, och varför det spelar roll {#what-went-wrong-in-the-first-version-and-why-it-matters}

Första versionen räknade varje *fas* för sig och tittade bara på förluster. Ett varv som bromsade tidigare förlorade tid i inbromsningsfasen, och fick rådet att bromsa senare, även när den tidigare bromsningen gjorde att bilen svängde snabbare, fick kraften tidigare och kom ut ur kurvan fortare, och vann tillbaka allt på raksträckan. I ett test sa den till varvet som gjorde så att det "ska bromsa mycket senare", medan det andra varvet, som hade bromsat senare, hade missat aveln, kört brett och förlorat exakt det det hade vunnit. Tidsdata visade att de två körsätten var jämna, men rådet sa tvärtom.

Lösningen är regeln som alla källor ovan är överens om: **en kurva bedöms som en helhet**, från inbromsningszonen för den till inbromsningszonen för nästa. Det beror på att "ibland kan en avvägning med några tusendelar i en kurva förbättra den totala varvtiden, eftersom snabbare sträckor kommer efteråt"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Racingkunskap som reglerna bygger på {#racing-knowledge-the-rules-encode}

**Utgångsfart betyder mer än insvängsfart**, och mer ju längre den efterföljande raksträckan är: "tid på raksträckor dominerar tid i kurvor", och ett fartunderskott vid utgången bärs med till nästa bromspunkt. Det snabbaste sättet genom en kurva och raksträcka är ofta att ta kurvan långsammare så att gasen kommer tidigare. *Långsamt in, snabbt ut.*
([Race & Track Driving: ordning för att förbättra varvtiden](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritering av kurvor](https://driver61.com/uni/prioritising-corners/))
En planerare för minsta tid som också belönas för utgångsfart flyttar sina aveln senare och får ett *snabbare* varv. Belöningen som balanserar de två är värd `L / v²` per enhet utgångsfart för en raksträcka med längden `L` vid farten `v`. Tiden som en hastighetsskillnad kostar nerför en raksträcka växer med dess längd och minskar med kvadraten på farten
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Kurvor efter vad de leder till.** En som leder ut på en raksträcka: maximera utgångsfarten, sen apex, tillbaka på gas så snart som möjligt. En i slutet av en raksträcka: maximera farten in i den, bromsa så sent som möjligt, en tidigare apex är acceptabel. En mellan två kurvor: kompromissa för den som betyder mest efteråt. En kurva som kan vara båda behandlas som en som leder ut på en raksträcka. Snabbare kurvor väger tyngre: vid hög fart accelererar en bil svagt, och en förlorad km/h hämtas inte tillbaka.
([Allen Berg: tre typer av kurvor](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritering av kurvor](https://driver61.com/uni/prioritising-corners/),
[Driver61: olika kurvor, olika tekniker](https://driver61.com/uni/different-corner-technique/))

**Friktionscirkeln.** Ett däck har en grepp-budget som går åt till inbromsning, kurvtagning och acceleration i vilken blandning som helst. Den totala accelerationen är `sqrt(lat² + long²)`. Trail braking följer cirkelns kant: bromsen släpps när styrningen och sidolasten byggs upp.
([friktionscirkeln](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g-diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Frirullning**, där varken gas eller broms är nedtryckt, är det långsammaste sättet att tappa fart, och ett eget mätbart nyckeltal.
([Racecar Engineering / OptimumG: frirullningsfaktor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Slip.** Längsgående kraft når sin topp vid ett slipförhållande på cirka 10-20 % och sjunker sedan. Bortom det låser hjulet sig vid inbromsning eller spinner under kraft. Forza rapporterar slip normaliserat: 0 är fullt grepp, ett belopp över 1 betyder att greppet är borta.
([längsgående slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Understyrning och översyrning.** Om slipvinkeln fram är större än bak är det understyrning. Om den bak är större än fram är det översyrning. Utan slipvinklar: bilen svänger mindre än styrningen begär (styrvinkeln över den Ackermannvinkel `L/R` som bilen behöver vid låg fart).
([understyrning, översikt](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometrin i en linje {#the-geometry-of-a-line}

Farten en bil kan hålla på en radie `R` är `v = sqrt(a R)`, där `a` är den sidacceleration däcken ger (plus det som downforce tillför, som växer med `v²`). **Farten växer alltså med kvadratroten ur radien**: en linje genom mitten på en 20 % större radie är cirka 10 % snabbare där.
([maximal kurvfart](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: kurvtagning](https://www.formula1-dictionary.net/cornering_tech.html))

**Den geometriska linjen** är den största bågen genom en kurva: från den yttre kanten, tangerar innerkanten vid apex, och tillbaka till den yttre kanten. För en kurva som vrids `θ` på en väg med bredden `w` (minus bilens bredd) ger en båge som tangerar båda yttre kanterna och rör innerhörnet `R = w / (1 - cos(θ/2))` (plus innerkantens egen radie). För en rät vinkel är det cirka `3,4 w`, för en hårnålskurva `w`. Därför spelar det mest roll att använda bredden i mellanstora kurvor och minst i hårnålar.
([Racinglinje](https://en.wikipedia.org/wiki/Racing_line))

**Den sena apexen** svänger in senare och djupare, på en först snävare radie, och öppnar radien på vägen ut: långsammare genom mitten, rakare tidigare, platt tidigare. "En något lägre minsta fart men en starkare accelerationsprofil i utgången". **Den tidiga apexen** är tvärtom: snabbare in, och en radie som snävar åt på vägen ut och håller tillbaka gasen. Det är i stort sett ett misstag, utom på mycket lågt grepp, där fart som förloras in inte kan hämtas tillbaka ut.
([Racinglinje](https://en.wikipedia.org/wiki/Racing_line),
[ordlista för racingtelemetri](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V" och "U".** U är den klassiska runda linjen: den bredaste radien och minst styrningsändring. V svänger in tidigare, går djupare, roterar bilen snabbt i mitten och lägger upp utgången för en rakare körning ut: inbromsningen är rak (så den kan göras senare), minsta farten är lägre men nås senare, och full gas kommer mycket tidigare.
([Track Titan: V-linjen](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Krökning mot sträcka.** Den snabbaste linjen är en kompromiss mellan kortaste vägen och den minst krökta. På en bana med bredd spelar krökningen större roll, och en linje med minsta krökning kommer nära linjen för minsta tid där bilen är vid sin gräns. Den viker av från den där bilen kan accelerera.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Kurvor i rad**, en dubbel apex eller en chicane, är ett enda problem: utgångslinjen i den ena är insvänglinjen i nästa, och de körs baklänges från den som leder ut på en raksträcka.
([Driver61: olika kurvor, olika tekniker](https://driver61.com/uni/different-corner-technique/))


## Vilken linje som passar vilken bil {#which-line-suits-which-car}

Det som avgör är bilens **effekt i förhållande till grepp** vid den kurvans farter. "Momentum är grepp mot effekt, en kvot".
([Ross Bentley: momentumbilar](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum framför hästkrafter](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Bil, i den här kurvan | Linje | Varför |
|---|---|---|
| Accelererar hårt för sitt grepp ("point and shoot") | V: bromsa rakt och sent, rotera i en kort, snäv mitt, rak och platt tidigt | tiden vinns på full gas, inte på minsta fart |
| Accelererar svagt för sitt grepp ("momentum") | bred U, något sen apex, håll uppe minsta farten | den kan inte hämta fart som den tappar |
| Något mittemellan | långsamt in, snabbt ut: sen-apex-U | den klassiska kompromissen |
| Snabb kurva, och mer så med downforce | U, nära den geometriska linjen | accelerationen är svag vid hög fart; downforce-greppet växer med `v²`, så fart genom mitten betalar dubbelt |
| Mycket lågt grepp (vått, snö) | tidigare apex | fart som förloras in kan inte hämtas ut |
| Effekt långt över greppet | linjen spelar mindre roll | det är dragkraften, inte linjen, som begränsar utgången |

"Ju snabbare kurvan, desto närmare den geometriska linjen; ju långsammare, desto mer ändrar du den med en senare apex."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: V-linjen](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grepp](https://driver61.com/uni/grip/))

Drivlinan ändrar hur linjen körs mer än linjen i sig. En framdriven bil roteras på bromsen (trail braking) och får kraft först när hjulet rullar ut, annars går den brett. En kraftfull bakdriven bil måste vara rak innan full gas, annars glider bakvagnen ut. Fyrhjulsdrift kan ge kraft medan bilen fortfarande svänger, så den tar gasen tidigare.
([FWD-teknik](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD i kurvor](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Visaren mäter bilens kvot mellan effekt och grepp i varje kurva utifrån dess egen körning: accelerationen på full gas vid utgångsfarten delat med sidogreppet vid minsta fart. Den kallar det "point and shoot" vid 0,45 och över, och "momentum" vid 0,25 och under. En bil vars grepp vid 150-250 km/h är mer än 15 % över dess grepp vid 55-110 km/h har downforce som verkar.

## Metoden {#the-method}

Siffrorna nedan är resonemanget. Tröskelvärdena som koden använder finns på en sida var, och de sidorna är facit när en siffra här skiljer sig: [Kurva för kurva-analys](race-corner-analysis.md), [Bilens kontrollhändelser](race-control-events.md), [Bilprofiler och jämförelse](race-car-profiles.md) och [Banstatistik](race-course-statistics.md).

### 1. En sträckaxel {#one-distance-axis}

Det snabbaste varvet är referens, om inte användaren väljer ett annat. Dess körda väg är axeln: varje annat varvs samplingar projiceras på den, och varje sampling får en sträcka längs referensen `s` och en förskjutning åt sidan `d` med tecken. Projiceringen söker bara framåt från föregående träff, så ett varv som korsar sig själv hoppar aldrig över till fel sida av en bro. Varven samplas sedan om till ett gemensamt rutnät, var 2 m, för varje kanal. Varje varv bärs de sista metrarna vidare med den fart det hade, så dess delta vid mållinjen är dess skillnad i varvtid.

### 2. Kurvor, och varje kurvas andel av varvet {#corners-and-each-corners-share-of-the-lap}

Hur kurvor, sektioner och komplex hittas: [Kurva för kurva-analys](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Tidsredovisningen för en kurva {#the-time-account-of-a-corner}

Netto, uppdelning, utgångsfart och bilarnas dragkraft: [Kurva för kurva-analys](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Omdömet och orsaken {#the-verdict-and-the-cause}

Mönstren i omdömet och orsakerna in och ut ur kurvan: [Kurva för kurva-analys](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Bilen mot föraren {#the-car-against-the-driver}

När varven är i olika bilar dras den förlust som bilen förklarar bort, i delar:

- **dragkraft**: bilarna från samma fart nerför raksträckan, som ovan;
- **grepp**: av den lägre minsta farten som inte förklaras av en snävare radie, andelen `½ ln(grepp_annan / grepp_min) / ln(fart_annan / fart_min)`, när varvet var vid sin bils gräns (90 % av vad den har visat vid den farten);
- **bromsar**: från `u` ner till `v` med retardation `a1` mot `a2`, och slutar på samma punkt, kostar `(1/a1 - 1/a2)(u - v)² / 2u`. Det gäller bara när varvet bromsade ungefär så hårt som bilen kan över zonen i genomsnitt, inte bara i en topp.

Vad en bil kan göra kommer från varje inläst varv med den. Sidogrepp, inbromsning och acceleration på full gas per 5 m/s farthink (95:e, 95:e och 90:e percentilen). Grepp är vad bilen **höll i en halv sekund**, alltså sidaccelerationen medelvärdad över 0,5 s, inte vad ett enskilt sampel nuddade. En kantsten, en sladd som fångas upp, en bil som hålls tillbaka ger alla en tillfällig topp, och en bil som gör det ofta verkade ha mer grepp än den har. (Kontrollerat mot inspelade varv av två olika bilar: måttet per sampel lade dem nära varandra. Hållet i en halv sekund skiljer dem åt på samma sätt som deras varvtider gör.) Inbromsning och dragkraft tar varje sampel som medianen av sig själv och sina grannar. Luften, lugnandet efter en landning och varje träff (avsnitt 6) tills bilen har återhämtat sig utelämnas.

**Vilken sorts bil var och en är** (`profile.ts`): från samma varv,

- **grepp som hålls**: 95:e percentilen av den halvsekundens sidaccelerationen;
- **dragkraft** på full gas till 50 km/h, 50-120, 120-200 och över 200, och det mesta den visade;
- **inbromsning** från 60 till 160 km/h;
- **topphastighet**: där den slutade öka på full gas i en sekund på en raksträcka. Körd rakt, inte en lång kurva tagen platt, där en bil tappar fart oavsett effekt. Där ingen raksträcka var tillräckligt lång, säger vad den fortfarande drog med vid sin högsta fart hur långt ifrån den var. Ingen gissning utöver vad varven visar: en anpassning av effekt över fart mot luftmotstånd satte en vanlig bil 100 km/h över dess riktiga topphastighet, eftersom växellådan och begränsaren avslutar en bils dragkraft långt före luftmotståndet gör det;
- **tappar bakvagnen**: hur många gånger per varv den gled förbi 10° drift (20° på löst underlag) med hjulet vridet mot kurvan, fångad med motriktat ratt. Hur många av dessa som började på gasen, och vid vilken andel av sitt grepp de började. En bil som körs lite på sned med flit tappar ingenting. En som behöver fångas gör det. Räknas likadant för varje bil, så två bilar kan jämföras;
- **balans**, där varven har slipvinklar: fram mot bak vid gränsen.

**Bilarna jämförda** ställer bilarna bredvid varandra: en tabell, en mening för varje om vad bilen är jämfört med den andra ("X accelererar bättre, men kan inte svänga lika hårt, behöver längre att stanna och tappar bakvagnen lättare"), varje skillnad som är tydlig (4 % av grepp, 5 % av dragkraft eller inbromsning, 4 km/h av topphastighet, en bakvagn som fångas minst en gång per varv mer och hälften så ofta igen), och hur var och en ska köras. Med en bil säger den vad den bilen är.

**I varje kurva**, när varven är i olika bilar, säger omdömet vad av det som bilarna avgör, och hur man får ut mesta möjliga av just den här:

- **genom mitten**: på den andra bilens linje tillåter denna bils grepp `v_annan · √(grepp_min / grepp_annan)`. Om varvet höll det, beror gapet på bilen, och ingen bromspunkt ändrar det. Det sägs, och kurvan skrivs på bilen snarare än på föraren. Om varvet höll mindre, finns resten där att vinnas, och hur mycket som sägs. Sedan var tiden kan vinnas i stället: på en raksträcka, eller i en bil som drar hårdare, efter apexen - bromsa rakt, sväng in senare och få bilen riktad mot utgången tidigt. Annars den bredaste radie som vägen tillåter, eftersom en större radie är det enda sättet till mer fart utan mer grepp;

- **ett bakhjul som släppte** här, i en bil som tappar det lättare än den andra: vad som ska göras i den här bilen - gasen tillförs när ratten rullar ut, eller bromsen släpps mjukt utan att lyfta mitt i kurvan, beroende på hur sladdarna börjar;
- **raksträckan efter**: vad den andra bilens starkare dragkraft från samma fart tog, och var den här bilen tog slut på dragkraft på den;
- **en tidigare bromspunkt** i en bil som bromsar mindre hårt.

Ett varv som gled genom mitten av en kurva (över 10° drift på asfalt) var över sitt grepp, inte under det. Det får aldrig höra att det hade grepp över där. Och där bilens bakvagn har släppt i det här varvet vid mindre sidaccelerationen än kurvan krävde, säger "grepp över" att man ska hitta det i små steg.

### 6. Bilkontroll: låsningar, hjulspinn, sladdar och understyrning, träffar och krockar {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Varje varv läses också för hur bilen hanterades: var ett hjul låste sig, var de drivna hjulen spann, var bakvagnen gled ut, var framvagnen gick brett. Det är de misstag som tiden ensam inte namnger. Tre saker gör att det håller över spel och underlag.

**Var greppet tar slut mäts från bilens egen körning.** Ingenjörer ställer en låsningsgräns per bil vid den slip som gav mest retardation (MoTeC-kanalerna i OptimumGs bromsserie använder -0,07 för en bil), inte ett bokvärde. Bokvärdena skiljer sig ändå åt: kraften når sin topp vid 5-20 % slip på asfalt beroende på däck och modell, vid 6 % eller vid 20-60 % på snö beroende på källan, och ingen källa ger ett värde för grus. Spel skalar slip på olika sätt igen: Forzas är "normaliserat" så att grepp är borta över 1. Ändå kan en bils bromsar ge sitt bästa långt under eller långt över 1, och vanliga bromszoner kan gå över 1. Därför binds, för varje bil och över varje inläst varv med den, kraften den gav mot slipen den hade. Retardation mot hjulens slipförhållande vid rak inbromsning, acceleration (som andel av vad bilen ger vid den farten) mot de drivna hjulens slip, och kurvgrepp (som andel av bilens grepp vid den farten) mot varje axels slipvinkel. Gränsen är slipen bortom det bästa där kraften har fallit 8 %. En kurva som aldrig faller i datan - Forza Horizons kurvtagning och dragkraft - har ingen gräns, och slip ensam flaggar ingenting där. Med för lite data är gränsen en och en halv gång den nominella toppen.

**Underlaget är känt för varje sampel**, där spelet säger det. Forza skakar däcken på grus, grus och gräs (få sampel på en asfaltsbana, många på grusbanor och terrängbanor), Trackmania namnger materialet under varje hjul, och ett rallyetapps underlag hittas som avsnitt 11 säger. Kurvor, driftvanor och tröskelvärden hålls isär för asfalt och löst underlag.

**Varje händelse läggs mot det andra varvet över samma meter.** På grus, på snö, i en drift-tung arkadracer är sladd hur en kurva körs. Studier av optimal styrning hittar "lågdrift"-lösningar på asfalt och "aggressiva, högdrift, även motstyrning" utanför väg. Rallydata visar däck "väl inom det icke-linjära området", och att låsa ett hjul på mycket löst underlag kan till och med stoppa bilen snabbare. Så en händelse som det andra varvet också gjorde - 80 % av den eller mer - är hur kurvan körs, inte ett misstag. En som det inte gjorde är ett fel bara om den kostade tid: tiden som förlorades från strax före den till 40 m efter. Ett fel som förklarar 40 % eller mer av en kurvas förlust blir kurvans orsak.

Detektionströsklar, testet mot det andra varvet, träffar och krockar samt rådtexterna: [Bilens kontrollhändelser](race-control-events.md).

### 6b. Många varv: banans statistik {#b-many-laps-the-courses-statistics}

Jämförelse mellan klasser, vad som räknas som ett misstag, statistiken och misstagskartan: [Banstatistik](race-course-statistics.md).

### 7. Den körda linjen {#the-driven-line}

För varje varv och kurva, enbart från positioner: var det började svänga (en femtedel av dess skarpaste krökning), dess skarpaste radie (över ±8 m), medelradien över den första och den andra halvan av dess riktningsändring, och så vidare.

- **form**: skarpaste delat med medelradie under 0,55 är ett V, över 0,75 ett U;
- **apex**: utgångsradie delat med insvängsradie över 1,25 är sen, under 0,8 tidig;
- **farts-apex**: dess långsammaste punkt mer än 15 m före halvvägspunkten i svängen är långsam in, snabb ut. Mer än 15 m efter, och fortfarande bromsande förbi mitten.

Mot det andra varvet: hur långt in eller ut det körde vid insvängen, genom den skarpaste delen och där båda var platta, och var och en svängde in. Varje omdöme avslutas med linjen som passar varvets bil i den kurvan - efter vad kurvan leder till och bilens uppmätta effekt-grepp-kvot, downforce och drivlina - och om varvet körde den. Tabellen "Kurva för kurva" listar det snabbaste varvet genom varje kurva med formen på dess linje, och de bästa kurvorna satta ihop.

### 8. Två kartor {#two-maps}

- **Var**: banan färgad efter `dΔt/ds` mot referensen, röd där tid förloras och grön där den vinns.
- **Varför**: varje förlust ritad där dess orsak finns, färgad efter orsakens grupp - inbromsning, insväng, utgång, raka, bil - och bredare för en dyrare.

### 9. Uppspelning {#replay}

En klocka, tre sätt att göra om den till varje varvs egen tid: från start, uppställda (varje varv når en punkt på banan vid samma ögonblick, sedan släpps de) och sida vid sida (varje varv hålls vid referensens sträcka).

### 10. Vilket håll världen är åt {#which-way-round-the-world-is}

Visarens värld är högerhänt med Y uppåt. Ett spel med en vänsterhänt värld (Forza bland dem) hamnar speglat i den: varje högersväng ritas som en vänstersväng, både banan och varven. Varven säger det själva: positiv styrning är åt höger i varje adapter, och den yttre fjädringen i en sväng pressas ihop. Racinganalys-fliken erbjuder därför att rätta det, och **Kamera & scen → Invertera världens axel** gör det: X, Y eller Z ritas omvänt. Bara ritningen ändras, en spegling som viks in i vymatrisen. Kameran flyger i den ritade världen, men datan, analysen och varje koordinat som verktygen visar förblir spelets egna. Analysen namnger kurvor vänster eller höger med samma mätning.

### 11. Rally: sladden, vänsterfoten, luften {#rally-the-slide-the-left-foot-the-air}

En rallyetapp är inte en bana körd på sämre grepp. På grus och snö är sladden hur en kurva tas: bilen vrids på väg in genom att flytta sin tyngd - "bromsar flyttar bilens tyngd framåt ... framdäcken får grepp, bakdäcken tappar grepp, och bilen roterar och sladdar in i kurvan", och sedan tillbaka till gasen när den är "uppställd i den riktning du vill åka" ([DirtFish: så använder du bromsarna](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Vänsterfoten sköter bromsen så att gas och broms kan spelas mot varandra. Handbromsen vrider bilen i snäva kurvor
([RallySport Ontario: rallykörning, grunderna](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)),
och bilen lämnar marken. Avsnitt 6 läser redan sladdar mot det andra varvet. Dessa regler bär resten.

- **Underlaget.** Det som varvet säger (`meta.surface`, rallyinspelarnas `--surface`), annars evenemangets namn: asfaltsrallyna (Spanien, Kroatien, Centraleuropa, Tyskland, Japan, Korsika, Ypres), vinterrallyna (snö), Monte Carlos asfalt med snö och is på (blandat), annars hur bilen kördes. En Rally2-bils sidgräns är 0,7-0,9 g på grus och 1,3-1,4 g på asfalt ([grenzbereich, referensvärden](https://github.com/GitCrush/grenzbereich)), och på grus körs mycket mer drift (avsnitt 6). Så en etapp där bilen drog 10 m/s² eller mer (95:e percentilen, vid fart, på underlaget) med medianen för driften under 6 grader där den svängde inom 70 % av det, var asfalt. Allt annat, eller för lite för att avgöra, är löst.
- **Vad bilen kan göra, på det underlag den gjorde det på.** Grepp, inbromsning och dragkraft (avsnitt 5) mäts för asfalt och löst underlag var för sig när varven körde en femtedel eller mer av sina sampel på vardera, och varje kurva bedöms med underlaget under bilen vid dess långsammaste punkt. Sampel i luften och under 0,3 s efter en landning utelämnas från allt som mäter bilen: hölje, däckkurvor, låsningar och hjulspinn. En landning skakar bilen förbi allt dess däck klarar, och hjul som spinner upp i luften är inte hjulspinn. Downforce bedöms inte på löst underlag, där en etapps snabba och långsamma sträckor är olika vägar.
- **Ett lätt tryck med vänsterfoten är inte inbromsning.** En lätt beröring av bromsen med gasen fortfarande på halvgas eller mer, på mindre än 15 m, får bilen att lugna sig eller svänga. Där ett varv började bromsa för en kurva är den första bromsen under vilken gasen släpptes, eller den som varade längre.
- **Bilen vreds på väg in.** För varje varv och kurva, den största driftvinkeln från dess inbromsning till 5 m efter dess långsammaste punkt. På löst underlag gäller: ett varv som fick bilen vriden 8 grader eller mer mindre än det andra (som vred den 12 eller mer) och kom på kraften senare **vred bilen mindre**. Då är rådet att släppa eller tippa vänsterfotens broms när bilen vrider in, så att bakvagnen kommer runt - med det andra varvets handbromspunkt när det använde en, eller handbromsen i en kurva långsammare än 54 km/h - och ha den riktad mot utgången före apexen. Ett varv som vred den 12 grader eller mer utöver det andra och ändå kom på kraften senare **vred den för långt**: den behövde räta upp innan kraften kunde gå på. Båda är kurvans orsak på vägen ut, efter ett fel i bilkontrollen. Linjerådet på löst underlag säger detsamma för varje kurva.
- **Luften.** En flygning 0,2 s eller mer längre än det andra varvets, som kostade tid från 10 m före avfärden till 40 m efter landningen (eller slutet av kurvan), är orsaken när den förklarar 40 % eller mer av kurvans förlust. Kurvan efter den, som nås långsammare, säger det. I luften kan bilen inte svänga, bromsa eller köra. Rådet håller gasen på vid avfärden - "släpp inte gasen under avfärden", vilket får nosen att sjunka - och tar krönet något långsammare eller med en lätt inbromsning så att bilen håller sig låg ([DirtFish: så hoppar du med en rallybil](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Komplex med högst tre kurvor.** En slingrig sektion som aldrig körs platt är inte ett enda långt komplex: efter tre kurvor börjar ett nytt.

`src/race/rally.test.ts` håller analysen till allt detta på etapper som körs med en enkel modell: en bil som vreds mindre och sent på kraften, en längre flygning, vänsterfotens tryck, en slingrig sektion, asfalt mot grus.

## Data, och vad varje källa tillåter {#data-and-what-each-source-allows}

| Källa | Takt | Kanaler | Tillåter |
|---|---|---|---|
| FH Companion-varvfiler | ~5 m | position, fart, gas, broms, styrning, längs- och sidacceleration, växel | allt utom bilkontroll, som kräver telemetrin bredvid |
| FH Companions `.tele.gz`, bredvid varje varvfil | spelets 64 Hz (en inspelare som behåller varje paket skriver cirka 110 per sekund; upprepningarna tas bort) | Forzas hela Data Out: slipförhållande per hjul, slipvinkel, kombinerad slip, rotation, fjädring, underlagets skakning; hastigheten i bilens ram; gir-hastighet | allt, inklusive bilkontroll |
| Forza Data Out, inspelad med `heat3d_capture telemetry` | 60 Hz | allt ovan, plus per hjul: däcktemperatur, slipförhållande, slipvinkel, kombinerad slip, fjädringsrörelse, hjulhastighet, räfflor; varv per minut, effekt, vridmoment, gir-hastighet | allt |
| Assetto Corsa, ACC, AC EVO, AC Rally (delat minne, `heat3d_capture telemetry --game ...`) | 60-333 Hz | en överuppsättning: däckkärnans och inner-/mitt-/ytterdelens temperaturer, tryck, bromstemperaturer, hjullaster, camber, slipförhållande och vinkel; hastigheten i bilens ram; ABS och TC i arbete (ACC, EVO, AC Rally) | allt |
| iRacing `.ibt`, läst direkt | 60 Hz | position från GPS, pedaler, styrning, g, gir, däckkarkasstemperatur per hjul, stötdämparens utslag, tryck, slitage | allt; bilkontroll från driftvinkeln (dess gir mot färdriktningen) och styrningen, ingen slip (loggas inte) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | per bildruta; 100 Hz | position, världshastighet och bilens axlar, per hjul kontaktytans hastighet och fjädring, pedaler, styrning, etappens klocka och längd | allt; slip och driftvinkel härledda |
| Richard Burns Rally (NGP UDP) | per fysiksteg | position, bilens egna hastigheter, per hjul fjäderutslag och kraft, pedaler | allt utom hjulslip |
| BeamNG.drive (`heat3d`-protokollmoddet) | upp till 100 Hz | position, världshastighet och axlar, per hjul ytans hastighet, rotation, last och markkontakt | allt; slip och driftvinkel härledda |
| Trackmania (Openplanet-insticksprogrammet) | per bildruta | position, fram- och sidhastighet, pedaler (broms på/av), styrning, per hjul slipkoefficient och löst underlag, i luften | allt; driftvinkeln från sidhastigheten |

Varje källa görs om till ett enda varvformat, `heat3d-lap`, vars kanaler har kanoniska namn (`speed`, `throttle`, `tireTemp[FL]` ...). Bilsymbolen och diagrammen ritar de kanaler ett varv har.

## Källor {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (deltat i sträckdomänen)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing-guide för varvanalys](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: varv i en session](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analys av racinglinjer](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teoretiskt bästa av sektorerna](https://overcut.gg/)
- [Track Titan: så analyserar du telemetri](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: nyckeltal för inbromsning, låsning och stabilitet (sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: på gasen (jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: nyckeltal för racingförare (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Däck-vägfriktionsmodeller och optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: däck-vägbanefriktion, slip vid topp på snö och is](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: däckfriktionskoefficienter, topp och glidning](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: längsgående krafter](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: sidokrafter](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Fordonsstabilitet, gränser för kroppsslip (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rallykörning vid hög sidslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manövrar för minsta tid i rally (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC:s referensgirhastighet (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Detektion av under- och översyrning genom styrning mot girning (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: styrvinkel, Ackermann och understyrningsgradienten](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: matematikkanaler (Kus, kombinerat g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: reglage för under- och översyrning](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: låsning på mycket löst underlag](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: datalogg i grusrally](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: så använder du bromsarna](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: så hoppar du med en rallybil](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rallykörning, grunderna](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rallyfordonsdynamik, referensvärden](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift-tränare, insticksprogram (konstanter)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide, genomgång](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coachningsflöden](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: V-linjen](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (utgångsfart mot minsta tid)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: ordning för att förbättra varvtiden](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: tre typer av kurvor](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritering av kurvor](https://driver61.com/uni/prioritising-corners/)
- [Driver61: olika kurvor, olika tekniker](https://driver61.com/uni/different-corner-technique/)
- [Driver61: en kurvas sex faser](https://driver61.com/uni/corner-phases/)
- [Driver61: grepp](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (utdrag)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: vad är en momentumbil](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Debatten om momentum framför hästkrafter](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, del 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, del 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD-teknik](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD i kurvor](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racinglinje](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: kurvtagningsteknik](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximal kurvfart](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Ordlista för racingtelemetri](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global planering av racingbanor](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: frirullningsfaktorn](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Introduktion till friktionscirkeln](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g-diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Längsgående slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, en översikt](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out-dokumentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: accelerationsbegränsad av grepp](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: accelerationsbegränsad av effekt](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO delat minne](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetriläsare](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT-tolkning](https://github.com/teamjorge/ibt)

