---
title: "Analýza zákruta po zákrute"
parent: "Analýza pretekov"
nav_order: 55
lang: "sk"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analýza zákruta po zákrute

Dve kolá tej istej trate sa porovnávajú zákrutu po zákrute. Pri každej zákrute prehliadač hovorí, kto bol rýchlejší, koľko času to stálo a prečo - brzdilo sa príliš skoro, na plyn sa išlo neskoro, zvolila sa širšia čiara - aby ste vedeli, čo treba trénovať ako prvé.

![Nález otvorený v Kde sa zlepšiť, vedľa tabuľky Zákruta po zákrute](../assets/img/en/race-corner-finding.webp)

Príklad: v zákrute 3 Driver A brzdí 20 m skôr než Driver B a stratí 0,15 s, kým sa tam dostane, ale skôr sa dostane na plyn a získa 0,15 s na výjazde. Čistý výsledok 0,00 s: zákruta je vyrovnaná a nikomu sa nehovorí, aby brzdil neskôr.

## Čo vidíte {#what-you-see}

### Kde sa zlepšiť {#where-to-improve}

Bočný panel pre zvolené kolo („Načítajte aspoň dve kolá jednej trate.“, kým sa tak nestane).

**Hlavička:** „<kolo> <čas> oproti <referencia> <čas>“ a rozdiel času kola - alebo pri referencii „oproti najrýchlejšiemu inému kolu cez každú zákrutu (…)“ a celková strata. Vedľa toho strata rozdelená na *jazdu* a *auto / kontext*.

**Pruh rozpadu:** stratený čas podľa skupiny príčiny (brzdenie, vstup, výjazd, rovinka, auto, kontext), vo farbách príčin, s legendou.

**Nálezy**, tri zoznamy:

1. Straty vodiča, najdrahšie prvé, najviac **12** - alebo „Nikde, kde by iná jazda získala čas, nevyniká.“
2. **Ukáž, čo stálo auto alebo situácia (X s)** - straty auta a kontextu, najviac 8 (predvolene zapnuté).
3. **Kde je <kolo> rýchlejšie, alebo vyrovnané inak (N)** - zisky a vyrovnané zákruty, najviac 10 (predvolene zapnuté).

Každý nález ukazuje svoje poradie, nadpis (zákrutu a čo sa stalo, pri strate s jej cenou), riadok verdiktu, cenu (zisky s mínusom) s pruhom, a štítok: *brzdenie*, *vstup*, *výjazd*, *rovinka* (straty vodiča, s „· auto X“, keď auto vysvetľuje 0,02 s alebo viac), *auto*, *kontext*, *rýchlejšie*, *vyrovnané*. **Kliknutím na jeden** sa autá zarovnajú 40 m pred ním, záber sa zarámuje a prehrá sa a otvoria sa jeho merania:

- **Brzdenie:** kde každé brzdilo (alebo odľahčilo) a z akej rýchlosti, a koľko metrov skôr alebo neskôr (od 5 m);
- **Najpomalšie:** minimálna rýchlosť každého kola a kde;
- **Plný plyn:** kde bolo každé naplno, a o koľko skôr alebo neskôr;
- **Čiara:** rozdiel pri vstupe do zákruty, najužšie polomery, ako ďaleko vnútri alebo vonku, a tvar čiary a vrchol každého kola;
- **Rovinka k ďalšej zákrute:** jej dĺžka, obe rýchlosti tam, kde boli obe naplno, čo sa stratilo alebo získalo a z čoho - počiatočná rýchlosť, silnejší ťah druhého, odľahčenie, zmiestená rýchlosť, ako sa jazdilo (časti od 0,02 s);
- **Auto:** koľko zo straty je auto a z čoho (ťah, priľnavosť, brzdy; keď 0,02 s alebo viac);

potom tip, **Autá:** (v rôznych autách, pozri [Profily áut](race-car-profiles.md#what-the-cars-decide-in-a-corner)), a rada k čiare.

### Zákruta po zákrute {#corner-by-corner}

Tabuľka (pri dvoch a viac kolách), jeden riadok na úsek, pre triedu zvoleného kola, keď je tried viac:

| Stĺpec | Zobrazuje |
|---|---|
| Zákruta | `T3`, `T11-T12` |
| Najrýchlejšie | kolo, ktoré bolo cez ňu najrýchlejšie (jeho vlastný čas od začiatku po koniec úseku) |
| o | jeho náskok pred druhým najrýchlejším, s |
| čiara | tvar a vrchol najrýchlejšieho kola („V · neskoro“, „U/V · stred“); po nabehnutí myšou jeho najužší, vstupný a výjazdový polomer; „oboma spôsobmi“ pre zmiešaný komplex |
| (zvolené kolo) | o koľko bolo za najrýchlejším, alebo ✓, keď bolo najrýchlejšie |

Kliknutie na riadok otvorí nález zvoleného kola tam (alebo zarovná autá 40 m pred úsekom). Pod tabuľkou, keď má každá zákruta čas: „Najrýchlejšie cez každú zákrutu, spojené: <čas> (± voči referencii / voči najlepšiemu z triedy X)“ - najlepšie úseky plus najrýchlejšia jazda k prvej zákrute, keď je to jej vlastný úsek.

## Ako sa to počíta {#how-it-is-worked-out}

Riadiace pravidlo: **zákruta sa posudzuje celá**, od brzdnej zóny pre ňu po brzdnú zónu pre ďalšiu. Kolo, ktoré brzdí skôr, aby auto skôr otočilo a skôr dostalo výkon, je ohodnotené výjazdom, ktorý si kúpilo, a nedostane radu brzdiť neskôr.

## Jedna os vzdialenosti {#one-distance-axis}

Kolá sa porovnávajú podľa vzdialenosti, nie času - sekundu za, dve kolá sú pri iných zákrutách. Ani podľa vlastného tachometra každého kola (tesnejšia čiara pokryje menej metrov). Odjazdená dráha kola **referencie** je os:

- Vzorky každého ďalšieho kola sa **premietnu** na dráhu referencie: každá vzorka dostane `s`, ako ďaleko je pozdĺž referencie, a `d`, ako ďaleko vľavo (kladné) alebo vpravo. Hľadanie ide dopredu od predchádzajúcej zhody (8 úsekov dráhy späť až 40 dopredu), takže kolo, ktoré sa kríži so sebou, nikdy neskočí na iný priesečník. Prvá vzorka sa hľadá v prvej štvrtine dráhy (na okruhu sa štart a cieľ zhodujú); keď nič nie je do 30 m, vezme sa najbližší bod kdekoľvek, ktorý nie je za poslednou zhodou (po pretočení alebo výjazde z trate). `s` nikdy neklesne: vzorka, ktorá sa premietne za predchádzajúcu, sa podrží.
- Každý kanál sa **prepočíta** na jednu mriežku, **po 2 m**, lineárne; kanály so skokmi (rýchlostný stupeň, vlajky) podľa najbližšej vzorky. Mimo vlastného rozsahu kola sú hodnoty prázdne.
- Prvé a posledné vzorky kola sa premietnu o kúsok dovnútra od koncov referencie, takže každé kolo sa **nesie až 15 m** za svoje konce pri rýchlosti, akú malo (čas rastie vzdialenosťou delenou rýchlosťou, zvyšok platí) - takže jeho delta na čiare je jeho rozdiel času kola.
- `delta` = čas kola v každom bode mriežky mínus čas referencie: rozdiel. `lateral` = `d` na mriežke.

Čas, ktorý jedno kolo potrebovalo viac než iné medzi dvoma bodmi mriežky, je rozdiel ich delt: `rel(s)`. Všetko nižšie je na tom postavené.

## Zákruty {#corners}

Nájdu sa na **referencii** (`findCorners`), s jej rýchlosťou vyhladenou na ±6 m a jej krivosťou (zmena smeru cez ±5 vzoriek, vyhladená na ±10 m):

1. **Minimá rýchlosti s výrazným poklesom.** Bod, ktorý je najnižší v rámci ±40 m, a ktorého pokles z najvyššej rýchlosti na každej strane (pred nižším minimom) je aspoň `max(2,5 m/s, 6 % rýchlosti)`.
2. **Zlomy.** Lokálny vrchol krivosti užší než polomer **300 m** bez minima rýchlosti do 80 m: zlom prejdený naplno je stále zákruta, ktorú treba jazdiť.
3. **Fázy.** Od každého vrcholu späť, kým referencia brzdí (> 0,1) alebo nie je naplno na plyne (< 0,95): vstup; dopredu, kým nie je naplno na plyne: výjazd. Zlom prejdený naplno dostane ±30 m. Prekrývajúce sa zákruty sa držia oddelene, ale sa dajú tak, aby pokryli kolo.
4. Očíslované T1, T2 … v poradí kola; **doľava alebo doprava** podľa znamienka krivosti a toho, či je svet zrkadlený (neznáme sa počíta ako zrkadlené).

**Okno zákruty** (kde referencia zatáča): von od najužšieho bodu do ±40 m od vrcholu, kým krivosť zostáva nad šestinou svojho vrcholu, plus 10 m na každú stranu. Jej strana dáva znamienko „dnu“.

## Úseky: od brzdnej zóny po brzdnú zónu {#segments-braking-zone-to-braking-zone}

Každá zákruta vlastní cestu do polovice k vrcholom na oboch stranách. V nej:

- **Najpomalší bod každého kola** je skutočný prepad jeho rýchlosti - nič pomalšie v rámci 6 m (3 body mriežky) na oboch stranách, pričom sa hľadá aj za koncami úseku, aby sa výjazd predchádzajúcej zákruty, ktorý sa do nej ešte zrýchľuje, nikdy nezamenil s ním - hľadaný od 15 m pred oknom zákruty po 10 m za ním. Kolo, ktoré tam nikdy nespomalilo, sa umiestni do vrcholu.
- **Kde kolo začalo spomaľovať pre ňu** (`entryOf`): spätne od jeho najpomalšieho bodu cez brzdenie alebo odľahčenie, cez krátke záblesky plného plynu, kým nemalo nohu dole (plyn ≥ 0,95, brzda ≤ 0,1) **10 m**; plyn, ktorý sa znovu pridal v posledných **30 m** pred najpomalším bodom, stále patrí zákrute; naplno celou cestou, samotný najpomalší bod. Kolo bez kanála plynu alebo také, ktoré od predchádzajúcej zákruty nikdy nemalo nohu dole, začína v svojom najrýchlejšom bode medzi tým.
- **Úsek sa začne** pri prvom zo všetkých kôl, ktoré začali pre ňu spomaľovať (o 4 m skôr), a beží po začiatok ďalšieho, takže brzdenie každého kola je vnútri a úseky pokrývajú kolo.

**Komplexy.** Po sebe idúce zákruty, medzi ktorými referencia nikdy nejde naplno - menej než **40 m** plného plynu - sú jeden úsek, „T11-T12“, jazdený ako jeden; komplex má najviac **tri** zákruty (zákrutový úsek jazdený bez toho, aby bol niekedy rovný, začne nový). Komplex, ktorý zatáča oboma smermi, je *zmiešaný*: pre neho sa nemeria žiadny jediný tvar čiary.

**Na okruhu** (referencia končí do 50 m od miesta, kde začala), rovinka posledného úseku pokračuje cez čiaru k prvému bodu brzdenia: beh z čiary v letiacom kole sa počíta k poslednej zákrute. Kolo, ktoré začalo z pokoja alebo pri štarte závodu (pozri [Štart](#the-start)), drží tento beh oddelene.

### Čo zákruta vedie {#what-a-corner-leads-onto}

Meria sa na referencii: metre na plnom plyne po zákrute (od jej plného plynu po koniec úseku, plus beh cez čiaru) a pred ňou (`po` predchádzajúceho úseku, alebo od štartu).

| Typ | Pravidlo |
|---|---|
| **medzi dvoma rovinkami** (`both`) | 200 m a viac pred **a** 120 m a viac po |
| **na rovinku** | 200 m a viac po, alebo 120 m a viac po a aspoň toľko ako pred ňou |
| **za rovinkou** | 200 m a viac pred |
| **spojka** | čokoľvek iné |

## Čo každé kolo urobilo v zákrute {#what-each-lap-did-in-a-corner}

`cornerMetrics`, pre každé kolo a úsek, na mriežke (krok 2 m). Pedále: brzda sa počíta nad 0,1, plný plyn je 0,95 a viac.

| Merač | Pravidlo |
|---|---|
| **bod brzdenia** | prvá brzda, pri ktorej sa odobral plyn (pod 0,5), alebo ktorá trvala **15 m** - dotyk ľavou nohou s výkonom zapnutým nie je miestom, kde sa začalo brzdiť; keď sú len dotyky, prvý dotyk |
| **odľahčené** | bez brzdenia, prvý bod, kde plyn klesol pod 0,8 |
| (žiadne pedále) | bod, kde kolo začalo spomaľovať (vyššie) |
| **uvoľnenie brzdy** | posledná brzda až 30 m za najpomalším bodom |
| **rýchlosť pri bode brzdenia**, **metre brzdenia** | po najpomalší bod |
| **špičková brzda**, **špičkové spomalenie** | cez brzdnú zónu (zrýchlenia nad 45 m/s² sa ignorujú) |
| **brzdenie v zákrute** | metre s brzdou > 0,05 a |riadenie| > 0,1 |
| **prešmyk pri zablokovaní** | najzápornejší pomer prešmyku kolesa v zóne (keď kolo má prešmyk) |
| **najpomalší bod**, **minimálna rýchlosť** | ako vyššie |
| **plyn zapnutý** | po uvoľnení (alebo najpomalšom bode) prvý plyn > 0,15 bez brzdy |
| **plný plyn** | prvý bod po tom, ktorý sa držal ≥ 0,95 10 m |
| **rolovanie** | metre od uvoľnenia po zapnutie plynu, s brzdou aj plynom oboma pod 0,05 |
| **prepady plynu** | koľkokrát plyn klesol o viac než 0,25 pod svoj bežiaci vrchol medzi zapnutím plynu a plným plynom |
| **špičkové bočné zrýchlenie** | najviac bočného zrýchlenia od 20 m pred uvoľnením po neskorší z plného plynu a 20 m za najpomalším bodom |
| **rýchlostný stupeň pri vrchole** | pri najpomalšom bode |
| **prešmyk pri roztočení** | najviac prešmyku hnaného kolesa medzi zapnutím plynu a plným plynom |
| **vyváženosť** | predný mínus zadný uhol driftu cez stred (+ podotáčanie) |
| **rovinka na plnom plyne** | podiel úseku po plnom plyne (a behu cez čiaru) pri ≥ 0,95; najdlhšie odľahčenie na ňom |
| **strhnutá rýchlosť** | najviac stratenej rýchlosti z vysokého bodu pri plyne ≥ 0,9, bez brzdy, na zemi |
| **driftu pri vstupe** | najväčší uhol driftu od bodu brzdenia po 5 m za najpomalším bodom, na zemi |
| **ručná brzda** | kde sa zapla (> 0,2), až 10 m za najpomalším bodom |
| **vzduch** | sekundy vo vzduchu nad úsekom a jeho najdlhší let |

## S kým sa každé kolo porovnáva {#who-each-lap-is-compared-with}

- Kolo sa porovnáva s **najrýchlejším úplným kolom svojej vlastnej triedy výkonu** (referencia, v triede referencie).
- Toto najlepšie kolo triedy (a referencia) sa porovnáva úsek po úseku s **tým iným kolom svojej triedy, ktoré bolo cez ňu najrýchlejšie** - alebo so všetkými kolami, keď je sám vo svojej triede.

Mapa času, medzery v zozname kôl, udalosti kontroly auta a tabuľka zákrut nasledujú to isté porovnanie.

## Časový účet zákruty {#the-time-account-of-a-corner}

`compareCorner`, pre jedno kolo oproti druhému nad úsekom:

- **čistý** = `rel(koniec) - rel(začiatok)` (plus beh cez čiaru pri letiacom kole): verdikt. Bližšie než **0,03 s** je **vyrovnané**.
- **Rozdelenie** - kde v zákrute viedlo to, ktoré sa zatočilo: na úseku od prvého bodu brzdenia alebo najpomalšieho bodu ktoréhokoľvek kola po neskorší z ich plného plynu a najpomalších bodov, najväčší zvrat, ktorý kolo potom vrátilo alebo získalo späť, keď je ten zvrat nad **0,04 s**; inak neskorší z oboch najpomalších bodov.
- **K vrcholu** = `rel(rozdelenie) - rel(začiatok)`; **po ňom** = čistý mínus to. Keď sú obe aspoň 0,04 s a opačných znamienok, kolo jedno **vymenilo** za druhé.
- **Po ňom** sa rozdelí znova tam, kde sú obe kolá naplno: **výjazd** (rozdelenie po neskorší plný plyn) a **rovinka** (odtiaľ po koniec).
- **Rovinka** sa rozdelí na tri časti:
  - *rýchlosť pri výjazde* (`byExit`) - meraná, nie modelovaná: pomalšie auto prejde cez počiatočnú rýchlosť rýchlejšieho auta kúsok po rovinke, a odtiaľ je jeho vlastná stopa tým, čo by spravilo z tej rýchlosti, s vlastným prevodom, odporom a sklonom v nej. Posunutá späť do toho bodu (a dobehnutá na svoju koncovú rýchlosť pre metre, ktoré získa) je to jeho čas od rýchlejšieho štartu; rozdiel je cena rýchlosti pri výjazde. Keď pomalšie auto tú rýchlosť nikdy nedosiahne (alebo len v posledných 2 vzorkách), jeho vlastné zrýchlenie pozdĺž úseku sa vráti ako výkon (`a·v` držané), nikdy tvrdšie, než ukazuje jeho obálka pri tej rýchlosti (dvojnásobok nameraného zrýchlenia bez obálky).
  - *ťah áut* (`byPower`) - len v rôznych autách: obe autá z tej istej rýchlosti cez tie isté metre, naplno, integrujúc plné zrýchlenie, ktoré každé ukázalo pri každej rýchlosti.
  - *ako sa jazdilo* (`driven`) - zvyšok: odľahčenie, strhnutá rýchlosť na plnom plyne.

  Rýchlosť pri výjazde nikdy nevysvetlí viac než stála rovinka (a nikdy s opačným znamienkom), pokiaľ odľahčenie alebo strhnutá rýchlosť niečo nevzali späť. Kolo **odľahčilo** na rovinke, keď jeho podiel na plnom plyne je pod 0,9 aj pod podiel druhého mínus 0,05.
Strhnutá rýchlosť sa počíta, keď sa dve líšia o viac než 1 m/s. Nezhoda pod 0,02 s v znamienku sa nastaví na 0.

Každý úsek čistého času sa sčíta na rozdiel času kola a každý `k vrcholu` a `po ňom` zákruty sa sčíta na jej čistý (testy kontrolujú obe).

### Podiel auta {#the-cars-share}

Len keď sú kolá v **rôznych autách** a kolo stratilo čas (`carShare`):

- **ťah**: ťah áut na rovinke (vyššie), až po stratu;
- **priľnavosť**: keď bolo kolo na limite svojho auta (bočné zrýchlenie v strede aspoň **90 %** toho, čo auto drží pri tej rýchlosti) a druhé auto drží viac než o **5 %** viac: z nižšej minimálnej rýchlosti, ktorá sa nevysvetľuje užším polomerom, podiel `½ ln(priľnavosť_iného / priľnavosť_moja) / ln(v_iného / v_moja)` zo zostávajúcej straty;
- **brzdy**: keď kolo brzdilo (nie odľahčilo), druhé auto brzdí o **5 %** tvrdšie, a *priemerné* spomalenie kola v zóne bolo aspoň **80 %** toho, čo auto dokáže: z `u` na `v` pri `a1` oproti `a2`, končiac v tom istom bode, `(1/a1 - 1/a2)(u - v)² / 2u`, až po to, čo zostáva.

Cena auta je súčet, najviac strata.

## Verdikt a nález {#the-verdict-and-the-finding}

`cornerFinding` napíše najviac jeden nález na kolo a zákrutu, skúšané v tomto poradí:

| Prípad | Nález | Výsledok |
|---|---|---|
| čistý v rámci ±0,03 s, výmena, menšia strana ≥ **0,1 s** | **vyrovnané, dve cesty cez ňu** - kto bol pomalý dnu a rýchly von, a kto naopak; s rovinkou za ňou (na rovinku alebo medzi dvoma), cesta pomalý dnu - rýchly von je tá, na ktorej sa má stavať: držať jej skorý plyn, vrátiť si vstup brzdením tvrdšie, nie neskôr | vyrovnané |
| čistý v rámci ±0,03 s inak | nič sa nehovorí | - |
| zisk, výmena, strata po vrchol | **pomalý dnu, rýchly von sa vyplatil**: držať ho, tu výjazd stojí viac | zisk |
| zisk, výmena, zisk po vrchol | **rýchlejšie pri vstupe**: vstup je správny, skorší plný plyn by udržal viac | zisk |
| zisk, a druhé kolo má tu stratu | **rýchlejšie - kvôli tomu, čo urobilo druhé**, jeho príčina a tip hovoria „Pre druhé kolo: …“ | zisk |
| inak zisk | **rýchlejšie pri vstupe / výjazde**, podľa toho, ktorá polovica priniesla viac (brzdenie neskôr, viac rýchlosti cez stred; alebo skôr naplno, silnejší ťah) | zisk |
| strata, a **náraz alebo havária** stála aspoň `max(0,05 s, 40 % straty)` | náraz je príbeh zákruty, pred autami | strata |
| strata, a **podiel auta** je 60 % alebo viac | **auto**: jeho ťah na rovinke, jeho priľnavosť cez stred, alebo jeho brzdy - najväčšia časť; s časťou vodiča (≥ 0,03 s) povedanou ako „Druhé X s: …“ | strata |
| strata, a jedna nezdieľaná **chyba ovládania auta** stála aspoň `max(0,05 s, 40 %)` | táto chyba (pozri nižšie), s tým, ako sa čas okolo nej pohol | strata |
| strata, a **dlhší let** stál aspoň `max(0,05 s, 40 %)` | let | strata |
| strata, výmena, zisk po vrchol | **príliš rýchlo dnu, pomaly von**: príčina výjazdu; vzdať sa časti vstupu, aby sa skôr otočilo a skôr bolo naplno, s bodmi brzdy a plného plynu druhého kola. Jeho koreň (`cause`, ktorý [štatistiky](race-course-statistics.md) počítajú): brzdenie neskôr, keď brzdilo o viac než pár metrov neskôr než druhé; inak príčina výjazdu | strata |
| strata, výmena, strata po vrchol | **dnu sa dalo viac, než výjazd vrátil**: príčina vstupu, ktorá je zároveň jej koreňom (`cause`); držať výjazd, stratiť menej dnu | strata |
| strata, odľahčené na rovinke, a jazdená časť nad polovicou straty | **nie naplno na rovinke**: jej podiel na plnom plyne voči druhému, kde a ako dlho bolo odľahčenie | strata |
| strata, ťah áut nad 60 % straty a rovinka nad polovicou | **ťah auta na rovinke** (s ťahom oboch áut pri 160 km/h) | strata |
| inak strata | príčina polovice, ktorá stratila viac (po vrchol ≥ po ňom: vstupná; inak výjazdová). Pomalší na výjazde len preto, že pomalší cez stred (o viac než 1 m/s): namiesto toho príčina stredu | strata |

Nález na strate môže tiež končiť s **Tiež:** - strhnutá rýchlosť na plnom plyne, alebo odľahčenie na rovinke - keď jazdená časť rovinky stála viac než 0,04 s a to nebola už príčina.

Nálezy sa triedia: straty najprv, najdrahšie prvé; potom zisky a vyrovnané zákruty.

### Príčiny pri vstupe {#causes-on-the-way-in}

`entryCause`, prvá, ktorá sa hodí (rozdiely minimálnej rýchlosti sú v m/s; „5 m“ je prah, pri ktorom sa skorší/neskorší bod počíta):

| # | Príčina (chyba) | Pravidlo |
|---|---|---|
| 1 | náraz alebo havária pri vstupe | nezdieľaný náraz začínajúci do 10 m za najpomalším bodom |
| 2 | **takmer zastavené** (incident) | najpomalšia rýchlosť pod **60 %** toho, čo priľnavosť tohto auta dovoľuje tam, kde druhé prešlo (`v_iného · √(priľnavosť_moja / priľnavosť_iného)`, keď druhé auto drží viac, inak rýchlosť druhého), kolo druhého nad 8 m/s - roztočenie, kontakt alebo zmeškaná zákruta |
| 3 | chyba ovládania auta pri vstupe | nezdieľaný zámok, tlak, roztočenie alebo šmyk nie na plyne, začínajúci do 10 m za najpomalším bodom, stál ≥ 0,02 s |
| 4 | dlhší let pred najpomalším bodom | pozri [rally](#rally-rotation-and-flights) |
| 5 | **odľahčené**, kde druhé zostalo naplno alebo odľahčilo o 5 m a viac neskôr | toto kolo len odľahčilo |
| 6 | **brzdilo tam, kde druhé len odľahčilo** alebo bolo naplno | a bolo cez stred pomalšie o viac než 0,5 m/s |
| 7 | **brzdilo jemne** | brzdilo (nie odľahčilo), malo priestor brzdiť tvrdšie - s dátami pneumatík, jeho prešmyk pri zablokovaní pod **60 %** prešmyku, pri ktorom brzdy tohto auta dávajú najlepší výkon; bez nich, špičkové spomalenie pod **85 %** toho, čo ukazuje pri tej rýchlosti - pedál pod 0,95, a špičkové spomalenie druhého kola o viac než **15 %** vyššie |
| 8 | **brzdilo skoro** - alebo **brzdy auta** | brzdilo viac než 5 m pred druhým. V inom aute, ktorého brzdy sú o viac než 5 % silnejšie, a s najviac 10 m rezervy voči vzdialenosti, ktorú toto auto potrebuje pri vlastnom spomalení: brzdy auta. Inak brzdilo skoro, s „Brzdi neskôr - asi N m“ (v inom aute, metre nad to, čo potrebuje) |
| 9 | **rolovalo** | viac než 10 m bez žiadneho pedála, a o 5 m viac než druhé |
| 10 | **pomalšie cez stred** | o viac než 0,5 m/s pomalšie v najpomalšom bode; rozdelené podľa `v² = a·R` (nižšie) |
| 11 | **prišlo pomalšie** | o viac než 1 m/s pomalšie pri bode brzdenia, nebrzdilo skoro: rozhodnuté skôr - zákrutou pred ňou a ťahom auta, alebo letom v zákrute pred ňou, ktorý bol o 0,2 s dlhší. Patrí autu, keď sa autá líšia |
| 12 | pomalšie k vrcholu | inak: uvoľniť brzdu plynulejšie a nechať naberať viac rýchlosti do stredu |

**Pomalšie cez stred** (`middleSplit`): polomer každého kola v jeho najpomalšom bode sa meria z jeho vlastnej dráhy (±8 m), jeho bočné zrýchlenie ako `v²/R`, a

`ln(v_iného / v_moja) = ½ ln(a_iného / a_moja) + ½ ln(R_iného / R_moja)`.

- Polomer vysvetľuje **polovicu alebo viac**: **príliš tesná čiara** - „využite viac cesty“, s oboma polomermi a podielom.
- Na limite auta (šmyk za 10° driftu na asfalte / 20° na uvoľnenom, alebo bočné zrýchlenie aspoň 90 % toho, čo drží pri tej rýchlosti) a druhé auto drží o viac než 5 % viac: **priľnavosť auta**; namiesto toho chrániť výjazd.
- Šmyk cez ňu (driftu nad 10° / 20°) a druhé kolo nie (jeho driftu pri vstupe aspoň o 4° menej): **bokom** - za svojou priľnavosťou, nie pod ňou; vstúpiť trochu pomalšie. Povedané ako autové, keď toto auto chytí zadok aspoň o jedno kolo viac než druhé.
- V inom aute, ktoré drží pod **96 %** priľnavosti druhého, a kolo nieslo v rámci 1 m/s `v_iného · √(priľnavosť_moja / priľnavosť_iného)`: **priľnavosť auta** - „brzdenie neskôr to nedobehne“.
- Inak **priľnavosť nazvyš**: bočné zrýchlenie oproti druhému na podobnom polomere a to, čo toto auto drží; niesť viac rýchlosti do vrcholu. Keď zadná náprava tohto auta pustí skôr, než sa jeho priľnavosť minie (jeho šmyky začínajú pod 85 % jeho priľnavosti, a kolo bolo na 80 % toho), zvyšok nájdite v malých krokoch.

### Príčiny pri výjazde {#causes-on-the-way-out}

`exitCause`, prvá, ktorá sa hodí:

| # | Príčina (chyba) | Pravidlo |
|---|---|---|
| 1 | chyba ovládania auta pri výjazde | nezdieľaný prešmyk kolies, roztočenie, šmyk alebo náraz končiaci sa alebo po 10 m pred najpomalším bodom |
| 2 | **strhnutá rýchlosť** | o viac než 1 m/s viac rýchlosti stratené na plnom plyne než druhé; nad **7 m/s (25 km/h)** „viac ako kontakt alebo roztočenie než šmyk“ |
| 3 | **otočilo auto zle** (nespevnený povrch) | pozri [rally](#rally-rotation-and-flights) |
| 4 | **na výkon neskôr** | zapnutie plynu o viac než 5 m neskôr, počítané aj od každého kola vlastného najpomalšieho bodu (kolo, ktoré má najpomalší bod neskôr, sa nekárže za neskorší plyn) |
| 5 | **váhalo s plynom** | viac prepadov plynu než druhé |
| 6 | **išlo širšie a čakalo** | o viac než 1,5 m von než druhé tam, kde boli obe naplno, a plný plyn o viac než 5 m neskôr od svojho najpomalšieho bodu |
| 7 | **plný plyn neskôr** | plný plyn o viac než 5 m neskôr, aj od vlastného najpomalšieho bodu; s zrýchlením auta tam |
| 8 | **jazda auta** | v inom aute, ktoré ťahá menej než 95 % druhého pri tej rýchlosti, a ťah vysvetlil časť rovinky |
| 9 | **pomalšie von z zákruty** | inak: neskorší vrchol, takže auto je skôr rovno |

Keď boli obe kolá na najpomalšom bode v rôznych prevodových stupňoch, tip končí „Rýchlostný stupeň N pri vrchole; druhé použilo M.“

### Chyby ovládania auta a nárazy {#car-control-faults-and-impacts}

Chyba z [Udalosti kontroly auta](race-control-events.md) ako príčina: zámok je *brzdová* príčina, roztočenie alebo šmyk na plyne *výjazdová*, zvyšok *vstupná*; náraz po najpomalšom bode je *výjazdový*, pred ním *vstupný*. Tip je vlastný tip udalosti, potom „Stálo to asi X s do 40 m za ňou“ (alebo „do času, kým auto dostalo späť svoju rýchlosť“ pri náraze). Zámok s bodom brzdenia o viac než 5 m skôr než druhé pridá, že kolo brzdilo skoro aj tak - s točiacimi sa kolesami by to nepotrebovalo.

### Rally: otočenie a lety {#rally-rotation-and-flights}

Na **nespevnenom povrchu**, s uhlami driftu na oboch kolách, a toto kolo na výkone (alebo naplno) o viac než 5 m neskôr:

- **Otočilo auto menej**: druhé ho malo otočené o **12°** alebo viac do svojho najpomalšieho bodu a aspoň o **8°** viac než toto kolo. Tip: odľahčiť alebo jemne dotknúť brzdy ľavou nohou, keď sa auto otáča do zákruty, s bodom ručnej brzdy druhého kola, keď ju použilo len ono, alebo ručnou brzdou v zákrute pomalšej než 15 m/s (54 km/h).
- **Otočilo ho príliš**: toto kolo ho malo otočené o 12° alebo viac a aspoň o **12°** viac než druhé: muselo sa vyrovnať, skôr než mohol ísť výkon dolu.

**Dlhší let**: vo vzduchu o 0,2 s alebo viac dlhší než u druhého, stojaci aspoň 0,03 s od 10 m pred odrazom po 40 m za pristátím (alebo koniec úseku). Pred najpomalším bodom je to príčina pri vstupe; stáva sa príbehom zákruty, keď vysvetľuje 40 % alebo viac. Tip: držať plyn zapnutý pri odraze, prejsť hrebeň o niečo pomalšie alebo s jemným dotykom brzdy.

### Štart {#the-start}

Pred prvou zákrutou, na sprinte alebo keď niektoré z kôl začalo z pokoja (pod 5 m/s, keď sú obe prvé na osi) alebo pri štarte závodu (pod 60 % rýchlosti druhého), beh k prvému bodu brzdenia je vlastný nález (zákruta 0), keď sa líši o viac než 0,03 s: *Rozbeh*, *Štart závodu* alebo *K prvej zákrute*. Strata tam sa pripíše situácii (*kontext*), keď jedno kolo začalo pri štarte závodu a druhé v rýchlosti, autu, keď sú kolá v rôznych autách, a inak vodičovi. Tipy: v inom aute z pokoja, „väčšinou auto“; štart z miesta v tom istom aute, rozbeh s menším prešmykom kolies a radenie na vrchole výkonovej krivky; štart závodu, porovnať ho s iným prvým kolom; štart za pohybu, lepší výjazd z poslednej zákruty sa prenesie cez čiaru.

## Odjazdená čiara {#the-driven-line}

`lineMetrics`, pre každé kolo a úsek (nie pre zmiešané komplexy), len z pozícií (vyhladené ±2 vzorky) nad oknom zákruty:

| Merač | Pravidlo |
|---|---|
| krivosť | zmena smeru cez ±8 m vlastnej dráhy kola |
| **najužší polomer** | 1 / špičková krivosť |
| **vstup do zákruty** / **výjazd z nej** | kde krivosť prvýkrát / naposledy prekročí pätinu svojho vrcholu |
| **stred** | kde kolo otočilo polovicu svojej zmeny smeru |
| polomer dnu / von | metre jazdené cez polovicu zmeny smeru, pred / po strede |
| **tvar** | najužší polomer ku priemernému polomeru počas zatáčania: pod **0,55** **V**, nad **0,75** **U**, medzi tým „U/V“ |
| **vrchol** | polomer von ku polomeru dnu: nad **1,25** neskorý, pod **0,8** skorý, inak stredový |
| **vrchol rýchlosti** | najpomalší bod viac než **15 m** pred stredom: pomaly dnu, rýchlo von; viac než 15 m za ním: stále spomaľuje za stredom |

Voči druhému kolu: ako ďaleko vnútri (+) alebo vonku bežalo pri vstupe do zákruty, cez najužšiu časť a tam, kde boli obe rovné (hovorené od 1 m); kde sa každé otočilo (hovorené od 8 m).

### Ktorá čiara sa hodí tomuto autu tu {#which-line-suits-this-car-here}

`lineFor`, z toho, na čo zákruta vedie, a z charakteru auta v tej zákrute:

- **výkon k priľnavosti** = zrýchlenie auta naplno pri rýchlosti výjazdu delené jeho priľnavosťou pri minimálnej rýchlosti (z jeho obálky). **Point and shoot** pri **0,45** a viac; **momentum** pri **0,25** a menej.
- **prítlak**: priľnavosť pri 151 - 252 km/h delená priľnavosťou pri 54 - 108 km/h **1,15** a viac, pre zákrutu prejdenú pri **144 km/h** (40 m/s) alebo rýchlejšie - potom je to zákruta na hybnosť bez ohľadu na výkon. Na nespevnenom povrchu sa nehodnotí.

| Typ zákruty | Auto | Čiara |
|---|---|---|
| za rovinkou | point and shoot / iné | V / U, vrchol v strede: „zóna brzdenia je cena“ |
| medzi dvoma rovinkami | momentum / iné | U / V, neskorý vrchol |
| spojka | momentum / iné | U / V, vrchol v strede: „jazdi ju pre výjazd z ďalšej“ |
| na rovinku | momentum (alebo rýchla zákruta s prítlakom) | široké okrúhle U, mierne neskorý vrchol |
| na rovinku | point and shoot | V: brzdiť rovno, otočiť neskoro, natočiť v krátkom tesnom strede, skoro rovno |
| na rovinku | medzi tým | U s neskorým vrcholom: pomaly dnu, rýchlo von |

Tam, kde záleží na výjazde (na rovinku, medzi dvoma), pohon pridá jednu vetu: **FWD** - natočiť ho brzdou, pridávať výkon len vtedy, keď sa koleso odvinie; **RWD** s výkonom k priľnavosti 0,35 a viac - vyrovnať ho pred plným plynom; **AWD** - môže dávať výkon aj počas zatáčania. Na nespevnenom povrchu pridáva každá čiara: natočiť auto pri vstupe.

Veta potom hovorí, čo kolo jazdilo, a či to sedí: *najpomalší neskorý vrchol zviaže výjazd* alebo *skorý vrchol zviaže výjazd*, keď sa chcel neskorý vrchol a kolo ani neskoro nevrcholilo, ani nebolo skoro najpomalšie; *zaoblenejšie, než toto auto chce*, keď sa chcelo V; *hranatejšie, než toto auto chce*, keď sa chcelo U; inak *sedí to*.

## Pre vývojárov {#for-developers}

Kód: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Odôvodnenie a jeho zdroje: [postup](race-analytics.md).
