---
title: "Figūras"
parent: "Atskaņojums"
nav_order: 3
has_children: true
lang: "lv"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figūras

**Figūra** ir maza 3D modeļa forma tam, kas vienība patiesībā ir: tanks, reaktīvais lidaparāts, kuģis, karavīrs. [Atkārtojums](match-replay.md) zīmē katru vienību kā tās figūru īstajā izmērā, nevis kā vienkāršu kasti.

Ir aptuveni 2000 nosaukto transportlīdzekļu, lidaparātu, kuģu, ieroču un karavīru. Visus tos veido pats skatītājs.

![Demonstrācijas tanki, zīmēti kā to paši figūras](../assets/img/lv/replay-tanks.webp)

## Ko katalogs satur {#what-is-in-the-catalogue}

| Joma | Piemēri |
|---|---|
| Cilvēki | karavīrs stāv, pieliecas, guļ; snaiperis, prettanku, medicīnas darbinieks, apkalpe |
| Sauszeme | tanki, kājnieku kaujas transportlīdzekļi, pretgaisa aizsardzība, artilērija, kravas automašīnas un automašīnas, vilcieni un tramvaji |
| Gaisā | iznīcinātāji, triecienlidaparāti, bumbvedēji, transporta lidaparāti, helikopteri, no divplāksnēm līdz mūsdienu reaktīvajiem |
| Jūrā | kara kuģi pēc klases, lidmašīnu nesēji, zemūdenes, laivas, tirdzniecības kuģi |
| Ieroči | raķetes, reaktīvie šāviņi, bumbas, torpēdas, signālraķetes un folija |
| Marķieri | dūmu, uzliesmojuma un uguns granātas, uzspridzināti spridzekļi, karogi, dzemdēšanas vietas, maršruta punkti |

## Kā figūras tiek veidotas {#how-the-figures-are-made}

- **Veidotas pēc publicētiem izmēriem.** Lielākā daļa figūru tiek veidotas ar paša skatītāja figūru veidotāju no publiskiem skaitļiem: garums, platums, augstums, ceļa riteņi, tornis un lielgabals, spārni un astes. To forma pēc tam tiek noregulēta pēc publiskām fotogrāfijām, zīmējumiem un publicētiem izmēriem. Nekādi spēļu modeļi netiek izmantoti.
- **Brīvi modeļi.** Dažas figūras izmanto brīvus 3D modeļus (CC0 vai CC BY), kur tie ir patiesāki, dažreiz kombinējot ar veidoto korpusu. CC BY darbu autori ir norādīti lapā [Figūru autori](figure-credits.md). CC0 darbi nepieprasa norādi, tāpēc tie tur nav uzskaitīti.
- Katrai figūrai ir pilna, rupja un tāla versija (detalizācijas līmeņi jeb LOD), tāpēc var zīmēt tūkstošus vienlaikus.

## Kuru figūru saņem vienība {#which-figure-a-unit-gets}

Skatītājs apskata datu paša kolonnas:

1. **Nosaukumi** — kolonnas, ko sauc *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* vai *Figure* — tiek salīdzinātas ar katalogu: precīzi, caur aptuveni 4000 aizstājvārdiem (vairāku spēļu vienību id), pēc garākā zināmā sākuma (`F-16C_50` ir F-16C) vai pēc īsākā figūras nosaukuma, kas ar to sākas.
2. Nosaukums, kura figūra neatbilst vienības **tipam**, netiek izmantots (kravas automašīna ar nosaukumu *Typhoon* nav iznīcinātājs).
3. **Tipi** — kolonnas, ko sauc *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* vai *Domain* — dod klases figūru: Tacview tagus (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kartes ikonas vai vienkāršus vārdus (tank, helicopter, infantry).
4. Dati bez abiem ir cilvēku dati: visi ir karavīri.

Tātad vieglākais veids, kā iegūt pareizās figūras, ir `vehicle` kolonna ar īstajiem nosaukumiem vai `type` kolonna ar Tacview tagiem.

**Mana vienība rādās kā kaste vai karavīrs.** Pievienojiet `vehicle` kolonnu ar īstu nosaukumu vai `type` kolonnu ar Tacview tagu. Uzvediet virsū vienībai, lai redzētu, kurš nosaukums tika atrasts. Dati, kam ir šādas kolonnas, bet kas nerunā par vienību, atstāj to kā kasti. Dati bez tām tiek zīmēti kā karavīri.

## Iestatījumi {#settings}

Sadaļa **Figūras** atkārtojuma sānjoslā nosaka izmēru, mazāko izmēru ekrānā, to, kļūst par ko tālas vienības (figūra, bulta vai simbols), un efektus, kas uz tām zīmēti. Skatiet [Spēles atkārtojums](match-replay.md#figures). Dūmi, uguns un citi laikā ierobežoti efekti: [Figūras figūru pārklājumā](figure-replay.md).

## Neobligāts vietējais figūru komplekts {#an-optional-local-figure-pack}

Savā datorā var paturēt neobligātu savu figūru komplektu. Tā figūras aizstāj katalogā esošās figūras ar tādiem pašiem nosaukumiem. Tas nekad nav daļa no repozitorija vai publicētas versijas; bez tā nekas nemainās.
