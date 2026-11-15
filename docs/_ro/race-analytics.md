---
title: "Analiza cursei: metoda"
parent: "Analiză de cursă"
nav_order: 58
lang: "ro"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analiza cursei: metoda

Pe scurt:

- Turele se compară **după distanță**, nu după timp, astfel încât același loc de pe traseu să se alinieze.
- Fiecare curbă se judecă **întreagă**, de la o zonă de frânare la următoarea.
- Timpul pierdut se **împarte** în locul unde a fost pierdut (frânare, intrare, ieșire, linie dreaptă) și în cât din el explică mașina.
- Cauza este **explicată în cuvinte**, cu sfaturi.
- Pentru a folosi analiza, nu pentru a citi cum funcționează, vezi [Analiză de cursă](race-analysis.md).

Aceasta este metoda din spatele filei **Analiză de cursă**: ce măsoară, cum decide unde s-a pierdut timpul și cum transformă asta în sfaturi. Este specificația pe care o urmează codul de analiză (`src/race/`), așa că fiecare regulă de aici are o parte corespondentă acolo și un test care o verifică.

## Ce fac instrumentele profesionale {#what-the-professional-tools-do}

Instrumentele consacrate converg către același nucleu și se deosebesc mai ales prin cât de departe merg spre *cauze*:

- **Totul se compară după distanță, nu după timp.** Două ture sunt reeșantionate pe o singură axă a distanței; diferența curentă de timp scurs la aceeași distanță este *delta* (MoTeC o numește variație de timp, alții diferență de timp sau urma delta). Panta ei arată unde se pierde timp chiar acum: o pantă mică înseamnă accelerație, rezistență la înaintare sau aderență susținută; o pantă abruptă înseamnă o diferență de frânare sau de accelerator; un val care urcă și coboară înseamnă un compromis între viteza la intrare și cea la ieșire.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Fiecare curbă se împarte în faze**: frânare, intrare, mijloc, ieșire. Punctul de frânare, frânarea maximă și eliberarea, viteza minimă și locul unde apare, treapta de viteză, reluarea acceleratorului, revenirea la accelerația completă, viteza la ieșire.
  ([Driver61: six phases](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-sectoare pe curbă și un timp teoretic cel mai bun**, asamblat din cel mai rapid segment de fiecare fel.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Traiectoria parcursă este comparată și ea**, dar niciodată singură: „o linie pe o imagine nu înseamnă nimic până nu cunoști factorii care contribuie”. Ea se citește împreună cu graficul vitezei și cu delta.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Cauza, nu simptomul.** Pierderea de pe linia dreaptă se datorează chiar acceleratorului, sau o intrare greșită a forțat acceleratorul să fie apăsat târziu? Greșelile se clasează după costul în timp de tur și se explică în limbaj simplu.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Ce nu a mers în prima versiune și de ce contează {#what-went-wrong-in-the-first-version-and-why-it-matters}

Prima versiune taxa fiecare *fază* separat și se uita doar la pierderi. O tură care a frânat mai devreme pierdea timp în faza de frânare și era sfătuită să frâneze mai târziu, chiar dacă frânarea aceea mai timpurie întorcea mașina mai repede, o punea mai repede pe putere și o scotea din curbă mai rapid, recâștigând tot timpul pe linia dreaptă. Într-un test, a spus turei care făcuse asta să „frâneze mult mai târziu”, deși cealaltă tură, care frânase mai târziu, ratase apexul, ieșise larg și pierduse exact ce câștigase. Datele despre timp arătau că cele două trasee erau egale; sfatul spunea contrariul.

Remedierea este regula pe care o confirmă toate sursele de mai sus: **o curbă se judecă întreagă**, de la zona de frânare de la intrarea ei până la zona de frânare a următoarei, pentru că „uneori, sacrificarea câtorva milisecunde într-o curbă poate îmbunătăți timpul total al turei, deoarece permite segmente mai rapide după”
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Cunoștințele de curse codificate în reguli {#racing-knowledge-the-rules-encode}

**Viteza la ieșire contează mai mult decât viteza la intrare**, și cu atât mai mult cu cât urmează o linie dreaptă mai lungă: „timpul petrecut pe linii drepte domină timpul petrecut în curbe”, iar un deficit de viteză la ieșire se duce până la următorul punct de frânare. Cel mai rapid mod de a parcurge o curbă urmată de o linie dreaptă este adesea să intri mai încet în curbă, ca să apeși acceleratorul mai devreme: *intră încet, ieși repede*.
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
Un planificator de timp minim care este recompensat și pentru viteza la ieșire își mută apexurile mai târziu și obține o tură *mai rapidă*; recompensa care echilibrează cele două valorează `L / v²` pe unitate de viteză la ieșire, pentru o linie dreaptă de lungime `L` la viteza `v`. Timpul pierdut de o diferență de viteză pe o linie dreaptă crește odată cu lungimea ei și scade cu pătratul vitezei
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Curbele după ceea ce urmează.** Una care duce pe o linie dreaptă: maximizează viteza la ieșire, apex târziu, putere cât mai devreme. Una de la capătul unei linii drepte: maximizează viteza cu care intri în ea, frânare cât mai târzie, un apex mai devreme este acceptabil. Una între două curbe: se face un compromis pentru cea care contează după ea. O curbă care poate fi oricare dintre cele două se tratează ca una care duce pe o linie dreaptă. Curbele rapide cântăresc mai mult: la viteză mare, mașina accelerează slab, iar un km/h pierdut nu se mai recuperează.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**Cercul aderenței.** O anvelopă are un singur buget de aderență, cheltuit pe frânare, pe viraj și pe accelerare în orice amestec; accelerația totală este `sqrt(lat² + long²)`. Frânarea în viraj urmează marginea acestui cerc: frâna se eliberează pe măsură ce direcția și sarcina laterală cresc.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Rularea liberă** - niciun pedal apăsat - este cel mai lent mod de a pierde viteză și un indicator de performanță măsurat în sine.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Alunecarea.** Forța longitudinală atinge un maxim la un raport de alunecare de aproximativ 10-20%, apoi scade; dincolo de el roata se blochează la frânare sau patinează la putere. Forza raportează alunecarea normalizată: 0 înseamnă aderență completă, iar o valoare absolută peste 1 înseamnă aderență pierdută.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Subvirare și supravirare.** Unghiul de derapaj al fațelor mai mare decât al spatelui înseamnă subvirare; al spatelui mai mare decât al fațelor înseamnă supravirare. Fără unghiuri de derapaj: mașina se întoarce mai puțin decât cere volanul (volanul depășește unghiul Ackermann `L/R` pe care îl cere mașina la viteză mică).
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometria unei linii {#the-geometry-of-a-line}

Viteza pe care o poate menține o mașină pe raza `R` este `v = sqrt(a R)`, unde `a` este accelerația laterală pe care o dau anvelopele (plus ce adaugă forța aerodinamică, care crește cu `v²`). Deci **viteza crește cu rădăcina pătrată a razei**: o linie prin mijloc, pe o rază cu 20% mai mare, este cu aproximativ 10% mai rapidă acolo.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**Linia geometrică** este cel mai mare arc prin curbă: pornește de la marginea exterioară, atinge marginea interioară la apex și revine la cea exterioară. Pentru o curbă care se întoarce cu `θ` pe un drum de lățime `w` (minus lățimea mașinii), un arc tangent la ambele margini exterioare și care atinge colțul interior are `R = w / (1 - cos(θ/2))` (plus raza proprie a marginii interioare). Pentru un unghi drept, asta este aproximativ `3,4 w`; pentru un ac de păr, `w`. De aceea folosirea lățimii contează cel mai mult în curbele medii și cel mai puțin în acele de păr.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Apexul târziu** intră în curbă mai târziu și mai adânc, pe o rază mai strânsă la început, și deschide raza pe drumul de ieșire: mai lent prin mijloc, mai devreme pe linia dreaptă, mai devreme la accelerație completă - „o viteză minimă ușor mai mică, dar un profil de accelerație mai puternic la ieșire”. **Apexul devreme** este invers: mai rapid la intrare, iar raza se strânge pe drumul de ieșire și ține acceleratorul în loc - în mare parte o greșeală, cu excepția aderenței foarte mici, unde viteza pierdută la intrare nu mai poate fi recuperată la ieșire.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**„V” și „U”.** U este linia clasică rotundă: raza cea mai largă și cea mai mică schimbare a volanului. V intră mai devreme în curbă, merge mai adânc, rotește mașina repede la mijloc și pregătește ieșirea pentru un drum mai drept: frânarea rămâne dreaptă (ca să poată fi mai târzie), viteza minimă este mai mică, dar atinsă mai târziu, iar accelerația completă vine mult mai devreme.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Curbura în funcție de distanță.** Cea mai rapidă linie este un compromis între drumul cel mai scurt și cel cu cea mai mică curbură; pe lățimea unui circuit, curbura contează mai mult, iar o linie cu curbură minimă se apropie de linia cu timp minim oriunde mașina este la limită - se desparte de ea acolo unde mașina ar putea accelera.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Curbele una după alta** - un apex dublu, o șicană - sunt o singură problemă: linia de ieșire dintr-una este linia de intrare în următoarea, iar ele se parcurg invers, plecând de la cea care duce pe o linie dreaptă.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Ce linie se potrivește cărei mașini {#which-line-suits-which-car}

Decide **puterea mașinii față de aderența ei** la vitezele din acea curbă - „impulsul este aderență față de putere, o chestiune de raport”.
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Mașina, în această curbă | Linia | De ce |
|---|---|---|
| Accelerează puternic pentru aderența ei („point and shoot”) | V: frânare dreaptă și târzie, rotire într-un mijloc scurt și strâns, linie dreaptă și plată devreme | timpul se câștigă cu accelerația completă, nu cu viteza minimă |
| Accelerează slab pentru aderența ei („momentum”) | U larg, apex ușor târziu, viteza minimă menținută ridicată | nu poate recupera viteza pe care o pierde |
| Între cele două | intră încet, ieși repede: U cu apex târziu | compromisul clasic |
| Curbă rapidă, și mai ales cu forță aerodinamică | U, aproape de linia geometrică | accelerația este slabă la viteză mare; aderența dată de forța aerodinamică crește cu `v²`, deci viteza prin mijloc se plătește dublu |
| Aderență foarte mică (ud, zăpadă) | apex mai devreme | viteza pierdută la intrare nu mai poate fi recuperată la ieșire |
| Putere mult peste aderență | linia contează mai puțin | tracțiunea, nu linia, limitează ieșirea |

„Cu cât curba este mai rapidă, cu atât mai aproape de linia geometrică; cu cât mai lentă, cu atât o modifici mai mult printr-un apex mai târziu.”
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

Transmisia schimbă modul în care se parcurge linia mai mult decât linia în sine: o mașină cu tracțiune pe față este rotită la frână (trail braking) și primește putere abia când roata se desface, altfel iese larg; o mașină puternică cu tracțiune pe spate trebuie să fie dreaptă înainte de accelerația completă, altfel spatele se desprinde; tracțiunea integrală poate da putere în timp ce mașina încă virează, deci ridică acceleratorul mai devreme.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Vizualizatorul măsoară raportul putere-aderență al mașinii în fiecare curbă din propria conducere - accelerația cu accelerația completă la viteza de ieșire, împărțită la aderența laterală la viteza minimă - și o numește „point and shoot” de la 0,45 în sus, „momentum” de la 0,25 în jos. O mașină a cărei aderență la 150-250 km/h este cu peste 15% mai mare decât la 55-110 km/h are forța aerodinamică activă.

## Metoda {#the-method}

Cifrele de mai jos sunt raționamentul. Pragurile folosite de cod sunt păstrate fiecare pe câte o pagină, iar acele pagini sunt referința când o cifră de aici diferă: [Analiza curbă cu curbă](race-corner-analysis.md), [Evenimente de control al mașinii](race-control-events.md), [Profilele mașinilor și compararea](race-car-profiles.md) și [Statisticile traseului](race-course-statistics.md).

### 1. O axă a distanței {#one-distance-axis}

Tura cea mai rapidă este referința, dacă utilizatorul nu alege alta. Traseul ei parcurs este axa: fiecare eșantion al celorlalte ture este proiectat pe ea, primind o distanță `s` de-a lungul referinței și un decalaj lateral cu semn `d`. Proiecția caută înainte doar de la potrivirea anterioară, astfel încât o tură care se intersectează cu ea însăși nu sare niciodată pe partea greșită a unui pod. Apoi turele sunt reeșantionate pe o singură grilă, la fiecare 2 m, pentru fiecare canal. Fiecare tură este dusă ultimii câțiva metri la viteza pe care o avea, astfel încât delta ei la linia de sosire este diferența ei de timp pe tură.

### 2. Curbele și partea fiecărei curbe din tură {#corners-and-each-corners-share-of-the-lap}

Cum se găsesc curbele, segmentele și complexele: [Analiza curbă cu curbă](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Contul de timp al unei curbe {#the-time-account-of-a-corner}

Net, împărțirea, viteza la ieșire și tracțiunea mașinilor: [Analiza curbă cu curbă](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Verdictul și cauza {#the-verdict-and-the-cause}

Modelele de verdict și cauzele de la intrare și de la ieșire: [Analiza curbă cu curbă](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Mașina față de pilot {#the-car-against-the-driver}

Când turele sunt în mașini diferite, pierderea pe care o explică mașina se scoate, pe părți:

- **tracțiunea**: mașinile de la aceeași viteză pe linia dreaptă, așa cum s-a arătat mai sus;
- **aderența**: din viteza minimă mai mică, neexplicată de o rază mai strânsă, partea `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`, atunci când tura a fost la limita mașinii sale (90% din ce a arătat la acea viteză);
- **frânele**: de la `u` la `v` cu decelerația `a1` față de `a2`, terminând în același punct, costă `(1/a1 - 1/a2)(u - v)² / 2u` - doar când tura a frânat cam la fel de tare cât poate mașina pe zonă, în medie, nu doar la un vârf.

Ce poate face o mașină provine din fiecare tură încărcată a ei: aderența laterală, frânarea și accelerația cu accelerația completă, pe fiecare interval de viteză de 5 m/s (percentilele 95, 95 și 90). Aderența este ceea ce mașina **a ținut o jumătate de secundă** - accelerația laterală medie pe 0,5 s - nu ceea ce a atins un singur eșantion: o bordură, o derapare redresată, o mașină prinsă din urmă, toate produc un vârf pentru o clipă, iar o mașină care face asta des părea mai aderentă decât este. (Verificat pe ture înregistrate ale a două mașini diferite: măsura pe eșantion le punea aproape una de alta; ținută o jumătate de secundă, le separă așa cum le separă timpii pe tură.) Frânarea și tracțiunea iau fiecare eșantion ca mediana lui și a vecinilor. Aerul, asentarea după o aterizare și fiecare lovitură (secțiunea 6) până când mașina își revine sunt scoase din calcul.

**Ce fel de mașină este fiecare** (`profile.ts`): din aceleași ture,

- **aderența ținută**: percentila 95 a acelei accelerații laterale de jumătate de secundă;
- **tracțiunea** cu accelerația completă până la 50 km/h, 50-120, 120-200 și peste 200, și cel mai mare nivel arătat;
- **frânarea** de la 60 la 160 km/h;
- **viteza maximă**: punctul în care nu mai câștiga la accelerația completă timp de o secundă pe o linie dreaptă - condusă în linie dreaptă, nu o curbă lungă luată plat, unde o mașină pierde viteză la orice putere. Acolo unde nu a existat o linie dreaptă suficient de lungă, ceea ce trăgea mașina la cea mai mare viteză spune cât de departe a fost. Nicio presupunere peste ce arată turele: o potrivire a puterii în funcție de viteză, față de rezistența aerului, a pus o mașină de drum cu 100 km/h peste viteza ei reală, pentru că raportul de transmisie și limitatorul opresc tracțiunea mult înainte ca rezistența aerului să o facă;
- **pierderea spatelui**: de câte ori pe tură a alunecat dincolo de 10° de derapaj (20° pe teren neasfaltat) cu volanul întors împotriva curbei - prins cu contravolan - câte dintre acestea au început cu acceleratorul apăsat și la ce parte din aderența lui au început. O mașină condusă puțin de-a latul intenționat nu pierde nimic; una care trebuie prinsă, da. Numărată la fel pentru toate mașinile, ca două mașini să poată fi comparate;
- **echilibrul**, acolo unde turele au unghiuri de derapaj: fața față de spate la limită.

**Mașinile comparate** pun mașinile una lângă alta - un tabel, câte o propoziție despre ce este fiecare față de cealaltă („X accelerează mai bine, dar nu poate vira la fel de tare, are nevoie de mai mult spațiu ca să oprească și își pierde spatele mai ușor”), fiecare diferență clară (4% din aderență, 5% din tracțiune sau frânare, 4 km/h din viteza maximă, un spate prins cel puțin o dată pe tură în plus și jumătate mai des), și cum se conduce fiecare. Cu o singură mașină, spune ce fel de mașină este.

**În fiecare curbă**, când turele sunt în mașini diferite, concluzia spune ce din pierdere decid mașinile și cum să se profite cel mai bine de cea condusă:

- **prin mijloc**: pe linia celeilalte mașini, aderența acestei mașini permite `v_other · √(grip_mine / grip_other)`. Dacă tura a atins acest nivel, diferența vine din mașină, iar niciun punct de frânare nu o schimbă - asta se spune, iar curba se pune pe seama mașinii, nu a pilotului; dacă a atins mai puțin, restul poate fi câștigat, iar se spune cât. Apoi unde poate fi câștigat timpul în schimb: pe o linie dreaptă, sau într-o mașină care trage mai tare, după apex - frânare dreaptă, intrare mai târzie, mașina îndreptată spre ieșire devreme; altfel, raza cea mai largă pe care o permite drumul, deoarece o rază mai mare este singura cale spre o viteză mai mare fără mai multă aderență;
- **un spate care a cedat** aici, într-o mașină care îl pierde mai ușor decât cealaltă: ce să faci în această mașină - acceleratorul apăsat treptat pe măsură ce volanul se desface, sau frâna eliberată ușor fără ridicarea piciorului la mijlocul curbei, după felul în care încep alunecările;
- **linia dreaptă de după**: ce a luat tracțiunea mai puternică a celeilalte mașini de la aceeași viteză și unde a rămas această mașină fără tracțiune pe ea;
- **un punct de frânare mai devreme** la o mașină care oprește mai puțin tare.

O tură care a alunecat prin mijlocul unei curbe (peste 10° de derapaj pe asfalt) a fost peste aderența ei, nu sub ea: nu i se spune niciodată că avea aderență de rezervă acolo. Iar dacă spatele mașinii a cedat în această tură de la o accelerație laterală mai mică decât cea cerută de curbă, „aderență de rezervă” spune să o cauți în pași mici.

### 6. Controlul mașinii: blocaje, patinare, derapaje și împingeri, lovituri și accidente {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Fiecare tură este citită și pentru felul în care a fost condusă mașina - unde s-a blocat o roată, unde au patinat roțile motoare, unde a ieșit spatele din curbă, unde a ieșit fața larg - pentru că acestea sunt greșelile pe care timpul singur nu le numește. Trei lucruri fac ca asta să funcționeze în toate jocurile și pe toate suprafețele.

**Unde se termină aderența se măsoară din conducerea mașinii înseamnă.** Inginerii fixează un prag de blocare pentru fiecare mașină, la alunecarea care a dat cea mai mare decelerare (canalele MoTeC din seria de frânare OptimumG folosesc -0,07 pentru o mașină), nu o valoare din carte, iar valorile din carte oricum nu se potrivesc: forța atinge maximul la 5-20% alunecare pe asfalt, în funcție de anvelopă și model, la 6% sau la 20-60% pe zăpadă, în funcție de sursă, iar pentru pietriș nicio sursă nu dă una. Jocurile scalează alunecarea și mai diferit: a Forzei este „normalizată”, astfel încât dincolo de 1 aderența se pierde - totuși frânele unei mașini își dau cel mai bun rezultat fie mult sub, fie mult peste 1, iar zonele obișnuite de frânare pot trece de 1. Așa că, pentru fiecare mașină, peste fiecare tură încărcată a ei, forța pe care a produs-o este grupată după alunecarea pe care a avut-o - decelerarea în funcție de raportul de alunecare al roților la frânare în linie dreaptă, accelerația (ca parte din ce face mașina la acea viteză) în funcție de alunecarea roților motoare, aderența în curbă (ca parte din aderența mașinii la acea viteză) în funcție de unghiul de derapaj al fiecărei punți - iar limita este alunecarea de dincolo de cel mai bun punct, unde forța a scăzut cu 8%. O curbă care nu scade niciodată în date - aderența în curbă și tracțiunea din Forza Horizon - nu are limită, iar alunecarea singură nu semnalează nimic acolo. Cu prea puține date, limita este de o dată și jumătate față de vârful nominal.

**Terenul se cunoaște pentru fiecare eșantion**, acolo unde jocul îl spune: Forza face roțile să vibreze pe pietriș, pământ și iarbă (puține eșantioane pe un circuit de asfalt, multe pe pământ și pe traseele de cross-country), Trackmania numește materialul de sub fiecare roată, iar terenul unei probe de raliu se găsește cum spune secțiunea 11. Curbele, obiceiurile de derapaj și pragurile sunt păstrate separat pentru asfalt și pentru teren neasfaltat.

**Fiecare eveniment este pus lângă cealaltă tură, pe aceiași metri.** Pe pietriș, pe zăpadă, într-un joc de curse arcade cu multe derapaje, alunecarea este felul în care se parcurge o curbă: studiile de control optim găsesc soluții „cu puțin derapaj” pe asfalt și soluții „agresive, cu mult derapaj, chiar și contravolan” în teren, datele de raliu arată anvelope „bine în interiorul regiunii neliniare”, iar blocarea unei roți pe teren foarte neasfaltat poate chiar opri mașina mai repede. Așa că un eveniment pe care l-a făcut și cealaltă tură - 80% sau mai mult - este felul în care se parcurge curba, nu o greșeală, iar unul pe care nu l-a făcut este o greșeală doar dacă a costat timp: timpul pierdut de la puțin înainte de el până la 40 m după el. Un defect care explică 40% sau mai mult din pierderea unei curbe devine cauza acelei curbe.

Pragurile de detectare, testul cu cealaltă tură, loviturile și accidentele și textele sfaturilor: [Evenimente de control al mașinii](race-control-events.md).

### 6b. Multe ture: statisticile traseului {#b-many-laps-the-courses-statistics}

Compararea pe clase, ce se numără drept greșeală, statisticile și harta greșelilor: [Statisticile traseului](race-course-statistics.md).

### 7. Traiectoria parcursă {#the-driven-line}

Pentru fiecare tură și fiecare curbă, doar din poziții: unde a început să vireze (o cincime din curbura ei cea mai strânsă), raza ei cea mai strânsă (peste ±8 m), raza medie pe prima și a doua jumătate a schimbării ei de direcție, și așa mai departe.

- **forma**: raza cea mai strânsă împărțită la raza medie sub 0,55 este un V, peste 0,75 este un U;
- **apexul**: raza de ieșire împărțită la raza de intrare peste 1,25 este târziu, sub 0,8 este devreme;
- **apexul de viteză**: dacă punctul ei cel mai lent este cu mai mult de 15 m înainte de jumătatea virajului său este intră încet, ieși repede; dacă este cu mai mult de 15 m după, încă încetinește după mijloc.

Față de cealaltă tură: cât de mult a mers pe interior sau pe exterior la intrarea în curbă, prin cea mai strânsă parte și acolo unde ambele erau plate, și unde a virat fiecare. Fiecare constatare se încheie cu linia potrivită mașinii turei în acea curbă - după ceea ce urmează curba și după raportul măsurat putere-aderență, forța aerodinamică și tracțiunea - și cu faptul dacă tura a parcurs-o așa. Tabelul „Curbă cu curbă” enumeră cea mai rapidă tură prin fiecare curbă, cu forma liniei ei, și cele mai bune curbe puse laolaltă.

### 8. Două hărți {#two-maps}

- **Unde**: traseul colorat după `dΔt/ds` față de referință, roșu acolo unde se pierde timp și verde acolo unde se câștigă.
- **De ce**: fiecare pierdere desenată acolo unde se află cauza ei, colorată după grupul cauzei - frânare, intrare, ieșire, linie dreaptă, mașină - și mai groasă pentru una mai costisitoare.

### 9. Redare {#replay}

Un singur ceas, trei moduri de a-l transforma în timpul fiecărei ture: de pe linie, aliniate (fiecare tură ajunge într-un punct al traseului în același moment, apoi este lăsată să plece) și una lângă alta (fiecare tură ținută la distanța de referință).

### 10. În ce sens este lumea {#which-way-round-the-world-is}

Lumea vizualizatorului are un sistem de coordonate drept (regula mâinii drepte), cu Y în sus. Un joc cu sistem stâng (Forza printre ele) apare oglindit în ea: fiecare curbă la dreapta este desenată ca o curbă la stânga, atât traseul, cât și turele. Turele spun singure asta - direcția pozitivă este la dreapta în fiecare adaptor, iar suspensia exterioară a unei curbe se comprimă - așa că fila de curse oferă să o corecteze, iar **Cameră și scenă → Inversează axa lumii** o face: X, Y sau Z desenate invers. Se schimbă doar desenul - o reflexie pliată în matricea de vizualizare; camera zboară în lumea desenată, iar datele, analiza și fiecare coordonată arătată de instrumente rămân ale jocului. Analiza numește curbele la stânga sau la dreapta după aceeași măsurătoare.

### 11. Raliu: derapajul, piciorul stâng, aerul {#rally-the-slide-the-left-foot-the-air}

O probă de raliu nu este un circuit parcurs cu aderență mai slabă. Pe pietriș și zăpadă, derapajul este felul în care se ia o curbă: mașina este întoarsă la intrare prin mutarea greutății - „frânele mută greutatea mașinii înainte ... anvelopele din față câștigă aderență, cele din spate pierd aderență, iar mașina se rotește derapând în curbă”, apoi acceleratorul revine când mașina este „aliniată în direcția în care vrei să mergi” ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Piciorul stâng face frânarea, astfel încât acceleratorul și frâna pot fi folosite unul împotriva celuilalt; frâna de mână întoarce mașina în curbele strânse ([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)); iar mașina părăsește solul. Secțiunea 6 citește deja derapajele față de cealaltă tură; aceste reguli acoperă restul.

- **Terenul.** Ce spune tura (`meta.surface`, opțiunea `--surface` a înregistratoarelor de raliu), altfel numele evenimentului - raliurile pe asfalt (Spania, Croația, Europa Centrală, Germania, Japonia, Corsica, Ypres), cele de iarnă (zăpadă), raliul Monte pe asfalt cu zăpadă și gheață (mixt) - altfel cum a fost condusă mașina. Limita laterală a unei mașini Rally2 este de 0,7-0,9 g pe pietriș și 1,3-1,4 g pe asfalt ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)), iar pe pietriș derapează mult mai mult (secțiunea 6). Așa că o probă în care mașina a tras de 10 m/s² sau mai mult (percentila 95, la viteză, pe teren) cu o derapare mediană sub 6 grade oriunde a luat o curbă în 70% din acea limită a fost asfalt; orice altceva, sau prea puțin ca să se poată spune, este neasfaltat.
- **Ce poate face mașina, pe terenul pe care a făcut-o.** Aderența, frânarea și tracțiunea (secțiunea 5) se măsoară separat pe asfalt și pe teren neasfaltat atunci când turele au condus o cincime sau mai mult din eșantioanele lor pe fiecare, iar fiecare curbă se judecă cu terenul de sub mașină în punctul ei cel mai lent. Eșantioanele din aer și cele 0,3 s după o aterizare sunt scoase din tot ce măsoară mașina - înveliș, curbele anvelopelor, blocaje și patinare - pentru că o aterizare zguduie mașina peste orice pot face anvelopele, iar roțile care se învârt în aer nu sunt patinare. Forța aerodinamică nu se judecă pe teren neasfaltat, unde porțiunile rapide și lente ale unei probe sunt drumuri diferite.
- **O atingere cu piciorul stâng nu este frânare.** O atingere a frânei cu acceleratorul încă la jumătate sau mai mult, pe mai puțin de 15 m, așază mașina sau o întoarce; unde o tură a început să frâneze pentru o curbă este prima frânare sub care a fost ridicat acceleratorul sau care a durat mai mult.
- **Mașina întoarsă la intrare.** Pentru fiecare tură și fiecare curbă, cel mai mare unghi de derapaj de la frânarea ei până la 5 m după punctul ei cel mai lent. Pe teren neasfaltat, o tură care a făcut mașina să se întoarcă cu 8 grade sau mai puțin decât cealaltă (care a întors-o cu 12 sau mai mult) și a apăsat acceleratorul sau a ieșit plat mai târziu **a întors mașina mai puțin**: sfatul este să ridice sau să atingă frâna cu piciorul stâng la intrare, astfel încât spatele să vină în urmă - cu punctul de frână de mână al celeilalte ture, dacă a folosit unul, sau cu frâna de mână într-o curbă mai lentă de 54 km/h - și să fie îndreptată spre ieșire înainte de apex. Una care a întors-o cu 12 grade sau mai mult peste cealaltă și totuși a apăsat acceleratorul mai târziu **a întors-o prea mult**: trebuia îndreptată înainte ca puterea să poată fi dată. Oricare dintre ele este cauza curbei la ieșire, după o greșeală de control al mașinii. Sfatul de linie pe teren neasfaltat spune același lucru pentru fiecare curbă.
- **Aerul.** Un zbor cu 0,2 s sau mai mult mai lung decât al celeilalte ture, care a costat timp din 10 m înainte de decolare până la 40 m după aterizare (sau sfârșitul curbei), este cauza atunci când explică 40% sau mai mult din pierderea curbei, iar curba de după ea, parcursă mai lent, o spune. În aer mașina nu poate vira, frâna sau conduce. Sfatul păstrează acceleratorul apăsat la decolare - „nu ridica piciorul de pe accelerator în timpul decolării”, care lasă botul în jos - și ia creasta ceva mai încet sau cu o atingere a frânei, astfel încât mașina să rămână jos ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Complexe de cel mult trei curbe.** O secțiune sinuoasă parcursă fără să fie vreodată plată nu este un singur complex lung: după trei curbe începe unul nou.

`src/race/rally.test.ts` supune analiza tuturor acestora pe probe rulate cu un model simplu: o mașină care a virat mai puțin și târziu la putere, un zbor mai lung, atingeri cu piciorul stâng, o secțiune sinuoasă, asfalt față de pietriș.

## Date și ce permite fiecare sursă {#data-and-what-each-source-allows}

| Sursă | Frecvență | Canale | Permite |
|---|---|---|---|
| Fișiere de tură FH Companion | ~5 m | poziție, viteză, accelerator, frână, direcție, accelerație laterală și longitudinală, treaptă | totul, cu excepția controlului mașinii, care are nevoie de telemetria alăturată |
| `.tele.gz` al FH Companion, alături de fiecare fișier de tură | 64 Hz ale jocului (un înregistrator care păstrează fiecare pachet scrie ~110 pe secundă; repetările se elimină) | tot Data Out-ul Forza: pe roată raportul de alunecare, unghiul de derapaj, alunecarea combinată, rotația, suspensia, vibrația pe teren; viteza în cadrul mașinii; viteza de rotație | tot, inclusiv controlul mașinii |
| Forza Data Out, înregistrat de `heat3d_capture telemetry` | 60 Hz | tot ce e de mai sus, plus pe roată: temperatura anvelopei, raportul de alunecare, unghiul de derapaj, alunecarea combinată, cursa suspensiei, viteza roții, banda de vibrație; turația, puterea, cuplul, viteza de rotație | tot |
| Assetto Corsa, ACC, AC EVO, AC Rally (memorie partajată, `heat3d_capture telemetry --game ...`) | 60-333 Hz | un superset: temperatura nucleului anvelopei și a părților interioară/mijlocie/exterioară, presiuni, temperaturi ale frânelor, sarcini pe roți, cădere, raport de alunecare și unghi; viteza în cadrul mașinii; ABS și TC în acțiune (ACC, EVO, AC Rally) | tot |
| iRacing `.ibt`, citit direct | 60 Hz | poziție din GPS, pedale, direcție, g, viteza de rotație, pe roată temperatura carcasei, deplasarea amortizorului, presiune, uzură | tot; controlul mașinii din unghiul de derapaj (viteza de rotație față de direcția de deplasare) și din direcție, fără alunecare (nu se înregistrează) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | pe cadru; 100 Hz | poziție, viteza în lume și axele mașinii, pe roată viteza petei de contact și suspensia, pedale, direcție, ceasul și lungimea probei | tot; alunecarea și unghiul de derapaj sunt derivate |
| Richard Burns Rally (NGP UDP) | pe pas de fizică | poziție, vitezele proprii ale mașinii, pe roată deformarea și forța arcului, pedale | tot, cu excepția alunecării roților |
| BeamNG.drive (modul de protocol `heat3d`) | până la 100 Hz | poziție, viteza în lume și axele, pe roată viteza suprafeței, rotația, sarcina și contactul cu solul | tot; alunecarea și unghiul de derapaj sunt derivate |
| Trackmania (pluginul Openplanet) | pe cadru | poziție, viteza față și laterală, pedale (frână pornită/oprită), direcție, pe roată coeficientul de alunecare și terenul neasfaltat, în aer | tot; unghiul de derapaj din viteza laterală |

Fiecare sursă se transformă într-un singur format de tură, `heat3d-lap`, ale cărui canale au nume canonice (`speed`, `throttle`, `tireTemp[FL]` ...). Simbolul mașinii și graficele desenează orice canale are o tură.

## Surse {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (distance-domain delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analysing racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretical best from sectors](https://overcut.gg/)
- [Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: braking analysis, lock-up and stability KPIs (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: on the throttle (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: key performance indicators of race drivers (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Tyre-road friction models and optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tyre-pavement friction, slip at peak on snow and ice](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: tyre friction coefficients, peak and sliding](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: longitudinal forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: lateral forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Vehicle stability, body-slip limits (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally driving at high sideslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimum-time rally manoeuvres (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC reference yaw rate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer and oversteer detection by steering against yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: steering angle, Ackermann and the understeer gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: math channels (Kus, combined g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: oversteer and understeer widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: locking on very loose surfaces](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: gravel rally data logging](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rally vehicle dynamics, reference values](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide write-up](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (exit speed against minimum time)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: the three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)
- [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/)
- [Driver61: the six phases of a corner](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (excerpt)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: what is a momentum car](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [The momentum over horsepower debate](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: cornering technique](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: the coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction circle introduction](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, an overview](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out documentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traction-limited acceleration](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: power-limited acceleration](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsing](https://github.com/teamjorge/ibt)

