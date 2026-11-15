---
title: "Figūros"
parent: "Pakartojimas"
nav_order: 3
has_children: true
lang: "lt"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Figūros

**Figūra** yra maža 3D vieneto modelio kopija: tankas, reaktyvinis lėktuvas, laivas, kareivis. [Pakartojimas](match-replay.md) piešia kiekvieną vienetą kaip jo figūrą tikru dydžiu, o ne kaip paprastą dėžutę.

Yra apie 2 000 pavadintų transporto priemonių, orlaivių, laivų, ginklų ir karių; visas jas sukūrė pati peržiūros programa.

![Demonstracinio rinkinio tankai, nupiešti kaip jų pačių figūros](../assets/img/lt/replay-tanks.webp)

## Kas yra kataloge {#what-is-in-the-catalogue}

| Sritis | Pavyzdžiai |
|---|---|
| Žmonės | karys stovintis, tupintis, gulintis; snaiperis, prieštankinis, sanitaras, įgula |
| Sausuma | tankai, pėstininkų kovos mašinos, oro gynyba, artilerija, sunkvežimiai ir automobiliai, traukiniai ir tramvajai |
| Oras | naikintuvai, puolimo lėktuvai, bombonešiai, transportiniai lėktuvai, sraigtasparniai – nuo dvisparnių iki šiuolaikinių reaktyvinių |
| Jūra | karo laivai pagal klasę, lėktuvnešiai, povandeniniai laivai, valtys, prekybiniai laivai |
| Ginklai | raketos, rakečių paleidimo įrenginiai, bombos, torpedos, signalinės raketos ir dirbtinių debesų sviediniai |
| Žymekliai | dūmų, blyksnio ir gaisro granatos, pasodinti bombos, vėliavos, atsiradimo vietos, maršruto taškai |
| Artima kova | kariai šarvinėse liemenėse su automatu, pistoletu-kulkosvaidžiu, šautuvu su šratais, DMR, LMG, pistoletu ar skydu; dronai, kameros, spygliuota viela, skydai, sienų sutvirtinimas, barikados, pralaužimo užtaisai, spąstai, langai, granatos, išminuotuvas |

## Kaip sukuriamos figūros {#how-the-figures-are-made}

- **Sukurtos pagal paskelbtus matmenis.** Dauguma figūrų sukurtos peržiūros programos pačios figūrų kūrėjo pagal viešus skaičius: ilgį, plotį, aukštį, ratus, bokštelį ir pabūklą, sparnus ir uodegą. Jų forma tada derinama pagal viešas nuotraukas, brėžinius ir paskelbtus matmenis. Jokių žaidimų modelių nenaudojama.
- **Nemokami modeliai.** Kelios figūros naudoja nemokamus 3D modelius (CC0 arba CC BY), kur jie tikslesni, kartais sujungtus su sukurtu korpusu. CC BY kūrinių autoriai paminėti [Figūrų šaltiniai](figure-credits.md) puslapyje; CC0 kūriniams priskyrimas nereikalingas, todėl jie ten nesąrašomi.
- Kiekviena figūra turi pilną, grubią ir tolimą versijas (detalumo lygius, LOD), todėl galima nupiešti tūkstančius vienu metu.

## Kokią figūrą gauna vienetas {#which-figure-a-unit-gets}

Peržiūros programa žiūri į paties duomenų stulpelius:

1. **Pavadinimai** – stulpeliai, vadinami *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* arba *Figure* – lyginami su kataloge: tiksliai, per apie 4 000 pseudonimų (kelių žaidimų vienetų id), pagal ilgiausią žinomą pradžią (`F-16C_50` yra F-16C) arba pagal trumpiausią figūros pavadinimą, kuris prasideda tuo pačiu.
2. Pavadinimas, kurio figūra netinka vieneto **tipui**, nenaudojamas (sunkvežimis, pavadintas *Typhoon*, nėra naikintuvas).
3. **Tipai** – stulpeliai, vadinami *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* arba *Domain* – duoda klasės figūrą: Tacview žymas (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), žemėlapio piktogramas arba paprastus žodžius (tank, helicopter, infantry).
4. Duomenys be nė vieno iš jų yra žmonių duomenys: visi – kariai.

Taigi lengviausias būdas gauti teisingas figūras – stulpelis `vehicle` su tikrais pavadinimais arba stulpelis `type` su Tacview žymomis.

**Mano vienetas rodomas kaip dėžutė arba karys.** Pridėkite stulpelį `vehicle` su tikru pavadinimu arba stulpelį `type` su Tacview žyma. Užvedę pelę ant vieneto matysite, koks pavadinimas buvo suderintas. Duomenys, kuriuose yra tokie stulpeliai, bet nieko nesako apie vienetą, palieka jį dėžute; duomenys be jokių – piešiami kaip kariai.

## Artimos kovos figūros (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Lentelės, parašytos taip, kaip jas rašo Rainbow Six Siege pakartojimų skaitytuvas (stulpeliai `operator`, `pawn`, `primaryClass`, `side`), gauna savo figūras:

- **Žaidėjai** yra jų operatorius: kiekvienas iš 78 operatorių turi savo figūrą, maždaug 1,8 m aukščio, su savais drabužiais – dviem ar trimis spalvomis striukei, kelnėms ir ekipuotei pagal įprastą jų viešą išvaizdą (juoda, alyvuogių, smėlio, miesto pilka, balta, tamsiai mėlyna, su raudona, oranžine ar žalsvai mėlyna ekipuote) – ir su savo formomis, trečdaliu didesnėmis nei tikrovėje ten, kur jos turi matytis iš viršaus: galvos apdangalas (šalmai, antveidis ar sunkus šalmas, kepuraitės su snapeliu, megztos kepurės, beretės, plati boonie skrybėlė ar kailinė kepurė, gobtuvai, šalikai, plaukai), veidas (apsauginiai akiniai, dujokaukė, akiniai, kaukė, barzda, akiniai su trimis lęšiais), lengvas, vidutinis ar sunkus kūno sudėjimas (sunkieji platūs, su didelėmis pečių plokštėmis ir apykakle), ilgas paltas ar kostiumas, maskuojamasis kostiumas (ghillie), tai, ką jie neša ant nugaros (kūjis, užtaisai, dronai, kanistrai, kuro bakas, paleidimo vamzdis, arbaletas, plokštės, slopintuvas, skydas) arba ant rankos (paleidimo įtaisas, metalinė ranka), savas skydas (aukštas skydas, riaušių skydas, skydas su šviesomis) ir akcento spalva ant pečių. Jie laiko savo pagrindinio ginklo klasę. Operatorius, kurio peržiūros programa nežino, yra paprastas karys šarvinėje liemenėje komandos spalva.
- **Pusė** matosi atskirai nuo drabužių: žiedas ant žemės po kiekvienu operatoriumi, **gintaro spalvos atakai, blyškiai žydras gynybai**, su komandos spalva viduje, ir rankų bei galvos raiščiai ta pačia spalva. Stulpelis `stance` (stovi, tupi, guli) nustato jų pozą. Be jo jie stovi.
- **Atskiriami pakartojimo atstumu:** kai figūros piešiamos 48 pikselių aukščio iš viršaus ir iš trijų ketvirčių kampo, kiekvieni du tos pačios pusės operatoriai aiškiai skiriasi spalva arba forma (tai tikrina peržiūros programos testai).
- **Etiketės** nurodo žaidėją ir tuo metu žaidžiamą operatorių, o operatoriaus vaidmenį – simboliu: ✸ kietasis pralaužėjas, ⚒ minkštasis pralaužėjas, ➤ įsiveržėjas, ✦ naikintojas, ✚ palaikymas, ⬟ skydas, ◉ žvalgyba, ◇ lankstus, ↺ flango sargas, ⚓ inkaras, ✕ spąstų statytojas, ⇄ klajoklis, ↯ prieš įtaisus, ▣ prieš pralaužimą.
- **Dronai** yra metamas dviratis dronas, maždaug 30 cm pločio. Kiekvienas yra atskiras takelis, pavadintas pagal savininką („Ash · drone 2“).
- **Padėti įtaisai** stovi ten, kur buvo padėti, nuo tada iki raundo pabaigos, kiekvienas kaip figūra to, ką jis daro: kamera, spygliuota viela, išskleidžiamas skydas, pralaužimo užtaisas, kietojo pralaužimo užtaisas, mažas lipnus užtaisas, grindų spąstai, claymore mina su savo užkliuvimo lazeriu, vienpusis langas, šarvų plokštė, granata, dujų kanistras, slopintuvas, jutiklis, lazerio vartai, atsargų dėžė. Viena figūra tinka visiems įtaisams, kurie atlieka tą patį darbą. Įtaisas, kurio rūšies duomenys nenurodo, yra mažas prietaisas su lempute.
- **Išminuotuvas** stovi ten, kur buvo padėtas, savo 45 sekundes.

Kiekvienas dronas ir įtaisas, įkeliant failą, tampa atskiru takeliu, todėl paties žaidėjo figūra lieka prie jo kūno. Operatoriai yra supaprastintos formos pagal jų viešus aprašymus ir paveikslėlius (ką jie dėvi, prietaisas, kuris yra jų gebėjimas), o įtaisai suformuoti pagal tai, ką jie daro. Visa tai yra pačios peržiūros programos dizainai tikru daikto dydžiu (claymore mina maždaug 22 cm pločio, durų dydžio plokštė 1 m × 2,1 m), o ne žaidimo modeliai.

## Nustatymai {#settings}

Pakartojimo šoninės juostos skiltis **Figūros** nustato dydį, mažiausią dydį ekrane, į ką virsta tolimi vienetai (figūra, rodyklė, simbolis) ir efektus, piešiamus ant jų. Žr. [Rungtynių pakartojimas](match-replay.md#figures). Dūmai, gaisras ir kiti laikui riboti efektai: [Figūros figūrų sutapdinime](figure-replay.md).

## Neprivalomas vietinis figūrų rinkinys {#an-optional-local-figure-pack}

Savo kompiuteryje galite laikyti neprivalomą savo figūrų rinkinį. Jo figūros pakeičia katalogo figūras tais pačiais pavadinimais. Jis niekada nėra saugykloje ar paskelbtoje versijoje; be jo nieko nesikeičia.
