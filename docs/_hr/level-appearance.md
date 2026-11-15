---
title: "Izgled razine"
parent: "Razine i geometrija pozadine"
nav_order: 3
lang: "hr"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Izgled razine

Ove kontrole mijenjaju kako izgleda 3D razina, tako da toplina izlazi iz nje i da i dalje možete čitati mjesto. Ništa ovdje ne mijenja podatke.

## Brzi početak {#quick-start}

1. Učitajte 3D razinu ([3D razine](model-levels.md)).
2. U **Pozadina / razina** smanjite **Svjetlinu** dok toplina ne bude najsvjetlija stvar na zaslonu.
3. Otvorite **Reljef tla** i povećajte **Sjenčanje nagiba** ili **Jačinu izohipsa** dok ne razlikujete brdo od ravnice.
4. Otvorite **Objekti**. Smanjite **Neprozirnost ploha** da vidite unutrašnjost zgrada, ili uključite **Teksturu objekata** da ih vidite čvrste.
5. Ako je na tlu nacrtana slika, isprobajte **Teksturu tla** uključeno i isključeno.

![Otvoreni odjeljci Reljef tla i Objekti, razina prikazana s naznakama reljefa](../assets/img/en/level-appearance-sections.webp)

Kad je učitana [3D razina](model-levels.md), panel Pozadina / razina prikazuje ove kontrole. Zadane vrijednosti su one koje dobije svježe uvezena razina ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Promjena ih samo ponovno iscrtava scenu; akumulacija topline ostaje.

## Cijela razina {#the-whole-level}

| Kontrola | Zadano | Raspon | Značenje |
|---|---|---|---|
| **Neprozirnost** | 100% | 0–100% | Ispod 100% razina se miješa i ne piše dubinu, pa više ne [zakriva](depth-and-culling.md) toplinu. |
| **Svjetlina** | 0,9 | 0–2 (klizanje 64) | |

Razina se crta bez zasićenja: siva tla, nijansirana ljuska, pa je toplina jedina zasićena stvar na zaslonu. Za razliku od [slike karte](map-images.md), 3D razina nema klizač Desaturiraj.

## Reljef tla {#ground-relief}

Izdaleka brdo i ravnica izgledaju jednako sivo, pa prikaz dodaje tri naznake. Svaka odgovara drugom problemu:

| Kontrola | Zadano | Značenje |
|---|---|---|
| **Razmak izohipsa** | iz raspona visina tla | Visina između linija izohipsi, logaritamski od 1/4000 do 1/2 raspona visina razine; donji kraj klizača je *isključeno*. Zadano je 1/40 raspona visina tla zaokruženo na korak 1/2/5. Linije od 10 m pristaju uz padinu i beskorisne su na dnu kamenoloma. Svaka peta linija crta se jače. Izohipse se crtaju u prostoru zaslona, pa ostaju jedan piksel široke pri svakom zumiranju, i one su jedina naznaka koja preživi tlo premalo nagnuto da se uopće sjenči. |
| **Jačina izohipsa** | 35% | 0–100% |
| **Sjenčanje nagiba** | 55% | Zatamnjuje prema strmini, pa obale i litice čitate iz svakog kuta kamere. Za razliku od svjetla, koje se izravnava kad mu okrenete lice. |
| **Visinska skala** | 50% | Nisko tlo tamnije, visoko svjetlije, preko raspona visina tla: velik oblik. |

Zaglavlje odjeljka pokazuje stanje izohipsa: *svakih N m*, razmak izohipsa, ili *bez izohipsa* kad je razmak isključen.

## Površina tla {#ground-surface}

| Kontrola | Zadano | Prikazuje se kad | Značenje |
|---|---|---|---|
| **Voda** | uključeno | razina ima vodu | Jezera, rijeke i more, nacrtani ravno u blijedoj plavo-sivoj: nijedna naznaka terena se ne primjenjuje na površinu koja je po definiciji ravna. |
| **Neprozirnost vode** | 60% | Voda je uključena | Obala i tlo ispod plićaka vide se kroz prozirnu vodu. |
| **Trokuti tla** | 30% (0 za razinu s teksturama) | uvijek | Vlastiti rubovi terena, nacrtani preko sjenčane površine, blijede između 6% i 25% širine razine od kamere. Pokazuje koliko je grubo tlo uzorkovano i daje nagibu nešto po čemu se procjenjuje udaljenost. Gradi se pri prvoj upotrebi, što potraje na velikoj razini. |
| **Tlo samo kao žičani model** | isključeno | uvijek | Zamjenjuje površinu terena njegovim rubovima. Potpuno shematski: odriče se i sjenčanja, izohipsa i zakrivanja, pa je *Trokuti tla* obično bolji izbor. |
| **Tekstura tla** | uključeno | razina ima teksture | Crta tlo u teksturama koje datoteka nosi (asfalt, bankina, trava). Osvjetljenje mreže se blago primjenjuje preko toga, jer tekstura već nosi vlastiti sitni reljef. **Svjetlina** je način da je utišate ispod topline; Desaturiraj pripada slikama karata. |
| **Snimljena boja** | isključeno | razina ima boje vrhova | Sjenči tlo bojom koju je skener snimio umjesto sivom. Rekonstruirana cesta inače se ne razlikuje od bankine. Izvozi motora ne nose boje; kad ih nema, panel kaže *Ova razina ne nosi boju.* |

## Objekti {#structures}

Zaglavlje **Objekti** pokazuje broj trokuta objekata; savjet ispod kaže kako se crtaju (*nacrtano punim u vlastitim teksturama* ili *nacrtano kao prozirna ljuska da vidite toplinu unutar njih*) i koliko je dijelova objekata.

| Kontrola | Zadano | Značenje |
|---|---|---|
| **Tekstura objekata** | uključeno kad objekti nose teksture | Crta objekte punim, u vlastitim teksturama. Uključivanje postavlja neprozirnost ploha na 100% i isključuje rubove; isključivanje vraća na nijansiranu prozirnu ljusku na 25%. Objekt s teksturom osvjetljava se sa strane koju kamera vidi, jer je znak dvije plohe leđa uz leđa, a koja pobijedi u testu dubine ovisi o zaokruživanju. |
| **Bridovi žičanog modela** | uključeno; isključeno iznad 300.000 trokuta objekata ili kad su s teksturom | Dedupliciranih rubova objekata, jedna linija po rubu. |
| **Neprozirnost bridova** | 50% | |
| **Plohe ljuske** | uključeno | Blijeda površina s jasnim Fresnelovim rubom, pa se zgrada čita kao volumen, a ne kao kavez ili magla. |
| **Neprozirnost ploha** | 25% (35% iznad 300.000 trokuta objekata, 100% s teksturom) | Od 0 do 60% na stazi, do 100% s ručicom. Držite je nisko: čvrsti objekti skrivaju podatke unutar sebe. |
| **Oštri bridovi** | uključeno (isključeno kad je s teksturom) | Sjenči svaki trokut prema vlastitoj normali, računatoj u shaderu fragmenata iz derivacija u prostoru zaslona. Izvezene razine su zavarene i nose prosječne normale, što svaki kut kutije zaokružuje u "rastopljenu foliju"; razdvajanje svakog vrha za popravak umnožilo bi spremnik vrhova. Isključite za razinu čije zakrivljene površine više vrijede od njenih kutova. |
| **Nijansa objekata** | Cijan | Birač boja i pretpostavke **Cijan**, **Jantarna**, **Ljubičasta**, **Bijela**. |
| **Prikaži klasifikaciju dijelova (N)** | | Svaki dio, njegova klasa i razlog; pogledajte [3D razine](model-levels.md#ground-structures-and-water). |

## Rezanje razine {#cutting-the-level}

[Isječak](slice.md) i, uz *Reži i razinu*, [odsijecanje po udaljenosti](depth-and-culling.md#distance-culling) režu tlo, objekte i vodu na istim ravninama kao toplinu.
