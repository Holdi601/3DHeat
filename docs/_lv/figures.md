---
title: "Figūras"
parent: "Replay"
nav_order: 3
has_children: true
lang: "lv"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: true
---

# Figūras

**Figūra** ir neliels 3D modelis tam, kas vienība patiesībā ir: tanks, reaktīvā lidmašīna, kuģis, karavīrs. [Atkārtojums](match-replay.md) zīmē katru vienību kā tās figūru patiesā izmērā, nevis kā vienkāršu kasti.

Ir apmēram 2000 nosaukto transportlīdzekļu, lidmašīnu, kuģu, ieroču un karavīru, visi veidoti pašā skatītājā.

![Demonstrācijas tanki, zīmēti kā savas figūras](../assets/img/lv/replay-tanks.webp)

## Kas ir katalogā {#what-is-in-the-catalogue}

| Joma | Piemēri |
|---|---|
| Cilvēki | karavīrs stāvus, pietupies, guļus; snaiperis, pretbruņu, mediķis, apkalpe |
| Sauszeme | tanki, kājnieku kaujas transportlīdzekļi, pretgaisa aizsardzība, artilērija, kravas auto un automašīnas, vilcieni un tramvaji |
| Gaisa telpa | iznīcinātāji, triecienlidmašīnas, bumbvedēji, transporta lidmašīnas, helikopteri, no divplāņiem līdz mūsdienu reaktīvajām |
| Jūra | kaujas kuģi pēc klases, lidmašīnu kuģi, zemūdenes, laivas, tirdzniecības kuģi |
| Ieroči | raķetes, rokas raķetes, bumbas, torpēdas, uguns ķērāji un plēves |
| Marķieri | dūmu, zibspuldzes un uguns granātas, uzstādītas bumbas, karogi, spawni, ceļa punkti |

## Kā figūras tiek veidotas {#how-the-figures-are-made}

- **Veidotas pēc publicētiem izmēriem.** Lielākā daļa figūru tiek veidotas ar paša skatītāja figūru veidotāju no publiskiem skaitļiem: garums, platums, augstums, ceļa riteņi, tornis un ieroči, spārni un aste. To forma pēc tam tiek noregulēta pēc publiskām fotogrāfijām, zīmējumiem un publicētiem izmēriem. Nevienas spēles modeļi netiek izmantoti.
- **Brīvi modeļi.** Dažas figūras izmanto brīvus 3D modeļus (CC0 vai CC BY), kur tie ir patiesāki, dažreiz apvienojot ar veidoto korpusu. CC BY darbu autori ir minēti sadaļā [Figūru autori](figure-credits.md); CC0 darbiem autora norāde nav vajadzīga, un tie tur nav uzskaitīti.
- Katrai figūrai ir pilna, rupja un tālas redzamības versija (detalizācijas līmeņi, LOD), tāpēc var zīmēt tūkstošus uzreiz.

## Kādu figūru saņem vienība {#which-figure-a-unit-gets}

Skatītājs skatās datu pašas kolonnas:

1. **Nosaukumi** - kolonnas *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* vai *Figure* - tiek salīdzinātas ar katalogu: precīzi, caur apmēram 4000 pseidonīmiem (vairāku spēļu vienību id), pēc garākā zināmā sākuma (`F-16C_50` ir F-16C), vai pēc īsākā figūras nosaukuma, kas sākas ar to.
2. Nosaukums, kura figūra neatbilst vienības **tipam**, netiek izmantots (kravas auto ar nosaukumu *Typhoon* nav iznīcinātājs).
3. **Tipi** - kolonnas *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* vai *Domain* - dod klases figūru: Tacview tagus (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kartes ikonas vai vienkāršus vārdus (tank, helicopter, infantry).
4. Dati bez abiem ir cilvēku dati: visi ir karavīri.

Tātad visvienkāršākais veids, kā iegūt pareizās figūras, ir kolonna `vehicle` ar īstajiem nosaukumiem vai kolonna `type` ar Tacview tagiem.

**Mana vienība rādās kā kaste vai karavīrs.** Pievienojiet kolonnu `vehicle` ar īsto nosaukumu vai kolonnu `type` ar Tacview tagu. Uzvediet virsū vienībai, lai redzētu, kurš nosaukums tika salīdzināts. Dati, kuriem ir šādas kolonnas, bet kas neko nesaka par vienību, atstāj to kā kasti; dati bez abiem tiek zīmēti kā karavīri.

## Iestatījumi {#settings}

Atkārtojuma sānjoslas sadaļa **Figūras** nosaka izmēru, mazāko izmēru ekrānā, par ko kļūst tālās vienības (figūra, bulta, simbols), un uz tām zīmētos efektus. Skatiet [Spēles atkārtojums](match-replay.md#figures). Dūmi, uguns un citi laikotie efekti: [Figūras figūru pārklājumā](figure-replay.md).

## Neobligāta vietēja figūru pakete {#an-optional-local-figure-pack}

Savā datorā varat glabāt neobligātu savu figūru paketi. Tās figūras aizvieto kataloga figūras ar tādiem pašiem nosaukumiem. Tā nekad nav daļa no repozitorija vai publicētas versijas; bez tās nekas nemainās.
