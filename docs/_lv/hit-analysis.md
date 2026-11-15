---
title: "Trāpījumu analīze (cilne Tehnika)"
parent: "Atskaņojums"
nav_order: 4
lang: "lv"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Trāpījumu analīze (cilne Tehnika)

Cilne **Tehnika** parāda, kur tika trāpīts vienam tankam, kuģim vai karavīram un kas to trāpīja. Izmanto to, lai redzētu, kura tanka puse tiek apšaudīta, vai kurš ienaidnieks nodara bojājumus.

## Izmēģini {#try-it}

1. Ielādē mača datus, kuros ir trāpījumi (zemāk esošā tabula rāda, kuras spēles tos dod).
2. Atver cilni **Tehnika** augšā.
3. Sadaļā **Transportlīdzeklis** izvēlies vienību, piemēram, tanka tipu. Skaitlis iekavās ir, cik trāpījumu tā saņēma.
4. Izlasi attēlu: katra atzīme ir trāpījums, novietots tur, kur tas trāpīja.
5. Atver **Kas trāpīja**, lai redzētu šāvējus, ieročus vai šāvēju transportlīdzekļus ar trāpījumiem, bojājumiem, nogalinājumiem un attālumu.

![Cilne Tehnika: demonstrācijas tanks ar trāpījumu atzīmēm un atvērts Kas trāpīja](../assets/img/en/hit-analysis-tank.webp)

Ja nekas nav ielādēts vai datos nav trāpījumu uz transportlīdzekļiem, cilne saka, kas trūkst un kuru konvertētāju lietot.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

Attēlā trāpījumi ir rādīti tur, kur dati dod punktu vai ķermeņa daļu. Sadalījums (kas trāpīja, ar ko, cik stipri, no cik tālu) darbojas katram avotam.

## Ko dod katrs avots {#what-each-source-gives}

| Avots | Punkts uz vienības | Šāvējs | Ierocis | Bojājums / iznākums |
|---|---|---|---|---|
| War Thunder | jā, vienības rāmī, ar šāviena virzienu | jā | šāvēja transportlīdzeklis | kritisks, smags, moduļi iznīcināti, nogalinošs šāviens |
| CS2 | ķermeņa daļa (hitgroup) | jā | jā | bojājums, bruņas, atlikusī veselība |
| World of Tanks | jā (komponentu kaste, ieeja un izeja) | jā | — | bojājums vai nekas (atlēciens, bez caurdurēšanas) |
| World of Warships | jā, kuģa rāmī | jā | trāpījuma veids | — |
| Squad | transportlīdzekļi: jā — trieciens novietots transportlīdzekļa rāmī pēc tā pašu pozīcijas un virziena | nē (dati nenosauc nevienu) | bojājuma veids | transportlīdzekļa veselības krišana tajā brīdī, iznīcināts |
| Squad karavīri | nē: trāpījuma rezultāti (kauls un trieciena punkts) konvertētājā tiek saglabāti neapstrādāti; rindas `impact` ar `hitBone` tiek nolasītas, tiklīdz tās tiek ierakstītas | | | ievainojumi un nāves tikai |
| Arma (OCAP, Arma 3 ierakstītājs) | nē: OCAP ieraksta, kas kuru trāpīja vai nogalināja, ar ko un no cik tālu, nevis kur | jā | jā | trāpījums vai nāve, attālums |
| Tacview ACMI | jā, kur ieroča objekts beidzas 30 m attālumā no vienības (ne pats palaidējs): tā pēdējā vieta vienības rāmī (virziens, slīpums, rullis), nākot tādā veidā, kā tas lidoja | ieroča `Parent` | ieroča nosaukums vai Timeout AmmoType | Timeout Outcome, `Health` krišanas, `Destroyed`; bez ieroča — nogalinājums vai bojājums bez punkta |
| IL-2 telemetrija (Watcher) | jā: `hit` / `damage` notikumi nes punktu spēlētāja pašas lidmašīnas rāmī (ņemts kā x uz priekšu, y uz augšu, z pa labi) | nē | nē | spēks |
| Dota 2 | nē: kaujas žurnālam nav vietas varonim | uzbrucējs | spēja vai priekšmets (nav: uzbrukums) | bojājums, varoņa nāve |
| Battlefield 6 (GameCapture) | nē: ierakstā ir nogalinājumu lente (nogalinājumi, nāves, galvas karodziņš), nevis trāpījumi | | | |
| DCS / citi Watcher tiešraides avoti | nav trāpījumu notikumu, kas pārsniegtu to, ko satur viņu Tacview ieraksti | | | |

Kur neviens vienības trāpījums nav ar punktu, attēlā nav atzīmju, un sadalījums **Kas trāpīja** atveras pats: pēc šāvēja, ieroča vai šāvēja transportlīdzekļa, katrs ar saviem trāpījumiem, bojājumiem un nogalinājumiem, kā arī vidējo un tālāko attālumu.

## Ierobežot līdz apgabalam {#restrict-to-an-area}

Sadaļa **Apgabals** ierobežo analīzi līdz trāpījumiem, kas notika kartes vietā.

1. Nospied **Zīmēt taisnstūri** vai **Zīmēt daudzstūri** un zīmē uz 3D zemes vai taktiskās kartes.
2. Izvēlies **Upuris iekšā** (skaita trāpījumu, ja trāpītā vienība bija apgabalā) vai **Šāvējs iekšā** (ja tas, kas šāva, bija).
3. Nospied **Izmantot kā filtru**. Čipi rāda "{n} no {total} trāpījumiem apgabalā".
4. **Atiestatīt apgabalu** noņem visus apgabalus.

Katrs apgabals ir [tilpums](volumes.md), tāpēc tās pašas formas filtrē arī siltumkarti un atkārtojumu. Apgabals var iekļaut vai izslēgt (izslēdzošs apgabals atstāj savus trāpījumus ārpus, rādīts kā "{n} no {total} trāpījumiem ārpus apgabala"). Katrs apgabals rādās kā čips ar to, cik vienības trāpījumu tajā bija; čipa × to noņem. Skaitļi, attēls, sadalījums un filtru saraksti visi seko.

Trāpījuma vietas: rinda, no kuras tas nāca, satur vienas puses vietu (upura — par ievainojumu vai trāpījumu, šāvēja — par šāvienu); otras vieta ir šīs vienības pašas paraugs, kas tuvākais laikā (5 s robežās). Trāpījums, kura puses vieta nav zināma, tiek izlaists, kamēr apgabals filtrē, un panelis saka, cik to ir ("Izlaisti, nav zināma vieta").

## Izstrādātājiem {#for-developers}

Jebkurš konvertētājs var pievienot trāpījumus: upura rindu (`hit`, `impact`, `hurt`, `wounded`) ar `hitBone` (skeleta kaulu, Arma atlasi, Reforger trāpījumu zonu — kartētu uz galvu, krūtīm, vēderu, rokām un kājām) vai `hitLocalX/Y/Z` (metros, x uz priekšu, y uz augšu, z pa labi), ar `other` kā šāvēju un `damage`.
