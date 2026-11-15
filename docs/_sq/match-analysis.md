---
title: "Analiza e ndeshjes (CS2)"
nav_order: 10
lang: "sq"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Analiza e ndeshjes (Counter-Strike 2)

Skeda **Ndeshja** e luan një regjistrim si figura, dhe për një ndeshje Counter-Strike 2 shfaq edhe tabelën e rezultateve: kush fitoi çdo raund, si, dhe kush mori vrasjet. Përdoreni për të shqyrtuar një ndeshje raund për raund, pastaj kaloni në të njëjtin moment te harta e nxehtësisë.

Skeda Ndeshja luan çdo regjistrim si figura: një regjistrim War Thunder ose Tacview, ose një demo CS2, të listuara nën **Ndeshjet në riluajtje** ([Riluajtja e ndeshjes](match-replay.md)). Një skedar `.match.json` i CS2 shton tabelën e rezultateve të përshkruar në këtë faqe.

## Shqyrtoni një ndeshje CS2 {#review-a-cs2-match}

1. Konvertoni demon ([më poshtë](#where-the-data-comes-from)) në një skedar `.parquet` dhe një `.match.json`.
2. Te skeda **Harta e nxehtësisë**, ngarkoni skedarin `.parquet` nën **Burimi**.
3. Hapni skedën **Ndeshja** dhe klikoni **Ngarko skedarët e ndeshjeve…**, ose hidhni skedarin `.match.json` mbi pamje.
4. Klikoni një ndeshje te **Përmbledhjet e ndeshjeve**, pastaj një qelizë të shiritit të raundeve për ta hapur atë raund.
5. Klikoni **Shfaq raundin** për ta parë atë raund në hartën e nxehtësisë, ose **Riluaj raundin** për ta parë si figura.

![Skeda Ndeshja: shiriti i raundeve me një raund të hapur, rrjedha e vrasjeve dhe tabela e rezultateve](../assets/img/en/match-analysis-round.webp)

Fjalë si KAST, ADR, eco, blerje forcë dhe trade janë te [fjalori](glossary.md#counter-strike-words).

## Ku vijnë të dhënat {#where-the-data-comes-from}

Konvertuesi i demove të [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) i kthen demot në dy skedarë për ndeshje, në një dosje për çdo hartë:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Skedari | Ngarkohet në | Mban |
|---|---|---|
| `<match>.parquet` | skeda **Harta e nxehtësisë** (paneli Burimi, si çdo Parquet - një skedar, disa, ose e tërë dosja) | pozicionin e çdo lojtari tetë herë në sekondë, dhe çdo ngjarje aty ku ndodhi: vrasje, vdekje, lëndim, të shtënë, hedhje, tym, flash, HE, molotov, decoy, verbim, vendosje, shpërçim, shpërthim; me `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, drejtimin e shikimit, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | skeda **Ndeshja** | ekipet, rezultatin, çdo raund (fituesin, si, ekonominë, vendosjen e bombës, çdo vrasje me radhë, clutch-et, të mbijetuarit), çdo rresht të tabelës së rezultateve të çdo lojtari |

Footer-i i skedarit Parquet mban udhëzimet e leximit (çelësi `heat3d`), kështu që hapet pa asgjë për të vendosur: lojtari si personi, ana si grupi, çdo raund (`roundId`, "<match> #NN") si seancë, drejtimi i shikimit i ndezur, dhe bota në drejtimin e duhur (bota e CS2 është e dorës së djathtë me Z lart; e lexuar me pasqyrimin parazgjedhje Z-lart do të dilte e pasqyruar). Shih [Pasqyrimi i kolonave](column-mapping.md) dhe [Ngarkimi i skedarëve](loading-files.md). `python -m heat3d_cs2 map <map>` eksporton gjeometrinë e hartës në të njëjtin kuadër, e ngarkuar te **Niveli**.

Konventat pas numrave janë të konvertuesit (të thëna në README e tij dhe të mbajtura në çdo përmbledhje): një vdekje është **e hakmarrë** kur vrasësi i saj vritet nga një shok skuadre i viktimës brenda **5 s**; **KAST** është pjesa e raundeve me një vrasje, një asistim (një asistim me flash numërohet), mbijetesë ose një vdekje të hakmarrë; **dëmi** është shëndeti që humbet vërtet, vetëm nga armiqtë; një **clutch** është të qenit i fundit i gjallë në një anë me armiq ende në këmbë, i fituar kur ana fiton; **blerja** për anë nga vlera mesatare e pajisjes në fund të kohës së ngrirjes - raundi i parë i çdo gjysme të rregullt një raund pistoletë (asnjë në kohë shtesë), pastaj nën $1.500 një eco, nën $4.000 një blerje forcë, çdo gjë më shumë një blerje e plotë.

## Skeda {#the-tab}

Shiriti anësor i skedës Ndeshja mban në krye ndërrimin e modalitetit të hartës së nxehtësisë dhe zgjedhësin e seancës, pastaj seksionet e ndeshjes më poshtë, pastaj panelet e hartës së nxehtësisë **Filtrat**, **Niveli** dhe **Kamera** - pamja është harta e nxehtësisë së çdo Parquet të ngarkuar te skeda Harta e nxehtësisë.

### Përmbledhjet e ndeshjeve {#match-summaries}

| Kontrolli | Bën |
|---|---|
| **Ngarko skedarët e ndeshjeve…** | zgjedh skedarë `.json` (disa njëherësh): përmbledhjet `.match.json` |
| hidhni mbi pamje | skedarët JSON të hedhur mbi pamje ndërsa skeda Ndeshja është e hapur ngarkohen po kështu (të tjerët injorohen) |
| **Pastro** | heq çdo ndeshje |
| **Të gjitha ndeshjet** (me dy ose më shumë) | "N ndeshje, M raunde": statistikat mbi të gjitha |
| një rresht ndeshjeje | "TeamA 13 kundrejt TeamB 9", harta · N raunde: hap atë ndeshje |

Një skedar pranohet kur është JSON me `"format": "heat3d-cs2-match"` dhe vargje `rounds`, `players` dhe `teams`. Gabimet listohen nën butona: "<file>: nuk është JSON", "<file>: nuk është përmbledhje ndeshjeje CS2 (heat3d-cs2-match)", "<file>: mungojnë rounds, players ose teams". Një ndeshje e ngarkuar sërish (i njëjti emër `match`) zëvendëson të mëparshmen. Ndeshjet renditen sipas hartës, pastaj sipas emrit. Kur ngarkohet saktësisht një ndeshje, ajo hapet; përndryshe përzgjedhja mbetet (si parazgjedhje të gjitha ndeshjet).

Kur nuk është ngarkuar asgjë, seksioni shpjegon: konvertoni me `python -m heat3d_cs2 demos`, ngarkoni këtu skedarët `.match.json` dhe skedarët `.parquet` te skeda Harta e nxehtësisë.

### Ndeshja (një ndeshje e hapur) {#match-one-match-open}

**Koka:** të dyja ekipet me rezultatin e tyre, harta, gjysmat - "gjysmat 7-5, 6-6": raundet 1-12 dhe 13-24 (luajtja premier dhe konkurruese MR12; gjatësia e gjysmës së vet të përmbledhjes kur e thotë, pra 1-15 dhe 16-30 për MR15) - pastaj, kur ndeshja shkoi në kohë shtesë, rezultati i saj veçmas: "kohë shtesë 4-2", raundet pas të dyja gjysmave. Një raund barazim nuk numërohet për asnjë ekip. Dhe "N raunde të prera në demo" kur përmbledhja liston raunde të paplota.

**Shiriti i raundeve:** një qelizë për raund, e ngjyrosur sipas anës që fitoi, me numrin e tij dhe një shenjë për mënyrën si mbaroi. Një raund barazim (pa fitues) është një qelizë gri neutrale e shënuar `=`, kurrë ngjyra e një ane; tooltip-i i tij thotë "Raundi 30: barazim - asnjëra anë nuk e fitoi".

| Shenja | Mbaroi nga |
|---|---|
| B | bomba shpërtheu |
| D | bomba u çmontua |
| K | u eliminua |
| T | mbaroi koha |
| S | dorëzim |
| = | barazim |
| ? | tjetër |

Një ndarje shënon fillimin e gjysmës së dytë (raundi 13, ose raundi pas gjatësisë së gjysmës së përmbledhjes) dhe të çdo gjysme tre-raundëshe të kohës shtesë (raundet 25, 28, 31, …). Kaloni mbi një qelizë: "Raundi 7: TeamA (T) - bomba shpërtheu, u vendos A" ("…, u vendos, vend i panjohur" kur përmbledhja nuk ka vend) dhe blerjen dhe vlerën e pajisjes së të dyja anëve. Klikoni për ta hapur raundin; klikoni sërish për ta mbyllur ("Klikoni një raund për vrasjet, ekonominë dhe riluajtjen e tij").

**Raundi:**

- "Raundi 7: <team> fitoi - <how>" ("Raundi 30: barazim - asnjëra anë nuk e fitoi" për barazim) dhe sa zgjati raundi (nga fundi i ngrirjes deri te vendimi, m:ss);
- ekonomia: ekipi i secilës anë, blerja (pistoletë, eco, blerje forcë, blerje e plotë) dhe vlera e pajisjes ("$4.350");
- vendosja: vendi, lojtari dhe koha në raund (nga cilado version e përmbledhjes); "Vendosur nga <player> në 1:05, vend i panjohur" kur vendi nuk njihet;
- **rrjedha e vrasjeve**, me radhë: koha në raund, sulmuesi (me ngjyrën e anës; "world" kur nuk ka sulmues), arma dhe shenjat - **HS** kokë, **WB** përmes muri, **SM** përmes tymit; **open** vrasja e parë e raundit, **trade** (hakmori një shok skuadre brenda 5 s), **traded** (vrasësi u vra brenda 5 s), **team** një vrasje mes shokësh skuadre (vetëvrasja nuk numërohet). Vrasjet pas vendimit të raundit zbehen;
- clutch-et: "<player> (T) vetëm kundër 3: fitoi clutch-in" / "e humbi";
- kush ishte gjallë në fund, për anë ("askush");
- **Shfaq raundin**: çdo gjë në këtë raund, në hartën e nxehtësisë;
- **Riluaj raundin**: e luan raundin si kutiza, nga fillimi i tij (më poshtë).

Butonat **Shfaq në hartën e nxehtësisë** (shih [më poshtë](#show-in-the-heatmap)) për këtë ndeshje, ose për raundin e hapur.

### Tabela e rezultateve {#scoreboard}

Një tabelë për ekip, një rresht për lojtar:

| Kolona | Është |
|---|---|
| K, D | vrasje, vdekje |
| A | asistime, përfshirë asistimet me flash |
| ± | vrasje minus vdekje (jeshile mbi 0, e kuqe nën) |
| ADR | dëmi për raund, shëndeti që humbet vërtet |
| KAST | % e raundeve me një vrasje, asistim, mbijetesë ose vdekje të hakmarrë |
| HS | % vrasje me kokë |
| Open | duele hapëse të fituara-humbura |
| Cl | clutch-e të fituara/luajtura |

Kaloni mbi një lojtar: vrasjet e hakmarrjes, herë të hakmarrë, asistime me flash, armiq të verbuar, dëmi nga utilitet, dhe raundet me shumë vrasje ("2×3k"). **Klikoni një lojtar** për vrasjet dhe vdekjet e tij në hartën e nxehtësisë (kjo ndeshje).

### Përtej ndeshjeve (Të gjitha ndeshjet) {#across-matches-all-matches}

Mbi çdo ndeshje të ngarkuar:

- "N ndeshje · M raunde · <harta>", dhe "N raunde të barazuara, të fituara nga asnjëra anë" kur pati barazime;
- **Raunde të fituara** për anë: përgjithësisht, në raundet **pistoletë** (raundet e pistoletës të përmbledhjes), dhe në blerjet **eco**, **force** dhe **full** (secila si përqindje me raundet e luajtura; kaloni mbi të për "të fituara nga të luajtura"). Një raund barazimi luhet nga të dyja anët dhe nuk fitohet nga asnjëra;
- **Bomba**: vendosjet për vend, dhe sa shpesh ana T vazhdoi dhe i fitoi ato raunde ("12 vendosje në A (T fitoi 67%)"), vendosjet kur vendi nuk njihet vetë nga përmbledhja ("2 vendosje në vend të panjohur (T fitoi 50%)"), ose "asnjëherë nuk u vendos"; si mbaruan raundet, më të shpeshtat e para;
- "Ana që mori vrasjen e parë fitoi N% të atyre raundeve." (vetëvrasja nuk është vrasje e parë; një raund barazimi nuk shndërron asnjë hapje);
- **Duelet hapëse, ku**: dhjetë vendet me më shumë vrasje hapëse (sipas vendit ku ishte viktima; emrat e vendeve të lojës të lexueshëm, "TopofMid" → "Top of Mid"), duelet dhe pjesa që fitoi ana T;
- **Lojtarët**: pesëmbëdhjetë më të mirët sipas vrasjeve minus vdekjeve, të bashkuar mbi të gjitha ndeshjet e tyre (të përputhur sipas Steam ID): ndeshjet, K-D, ADR dhe KAST të peshuara me raundet e luajtura, HS% e peshuar me vrasjet, duelet hapëse. **Klikoni një lojtar** për vrasjet dhe vdekjet e tij në të gjitha ndeshjet, në hartën e nxehtësisë.

Butonat Shfaq-në-hartën-e-nxehtësisë për të gjitha ndeshjet e ngarkuara janë nën të.

## Shfaq në hartën e nxehtësisë {#show-in-the-heatmap}

Çdo lidhje vendos **filtrat** e vetë hartës së nxehtësisë, kështu që ajo që shfaqet mbetet e dukshme dhe e redaktueshme te paneli Filtrat, dhe **Shfaq të gjitha** i pastron ato. Punojnë mbi tabelën e hartës së nxehtësisë të ngarkuar te skeda Harta e nxehtësisë; skeda Ndeshja nuk e ngarkon kurrë vetë.

| Butoni | Ngjarjet e shfaqura |
|---|---|
| **Pozicione** | `position` - ku ishin lojtarët, tetë herë në sekondë |
| **Vrasje** | `kill` - ku qëndronte vrasësi |
| **Vdekje** | `death` - ku ra viktima |
| **Hapjet** | `kill` dhe `death` me `opening` = 1 - vrasja e parë e çdo raundi, ku qëndronin të dy (ofrohet vetëm kur tabela ka kolonën `opening`) |
| **Tymueset** | `smoke` - ku u vendosën tymueset |
| **Flash-et** | `flash` - ku u hap flash-i |
| **Molotovët** | `molotov` - ku u dogjën molotovët dhe incendiarët |
| **HE** | `he` - ku shpërthyen granatat HE |
| **Vendosjet** | `plant` - ku u vendos bomba |
| **Të shtëna** | `shot` - ku u qëlluan të shtënat |

Kufizohen sipas vendit ku janë butonat: të gjitha ndeshjet e ngarkuara, kjo ndeshje, ose ky raund ("Shfaq në hartën e nxehtësisë - raundi 7").

Ajo që nuk mund të zbatohet thuhet nën butona, në vend që të filtrohet heshtazi në asgjë: "nuk u mbajt asnjë kolonë ndeshjeje - ndeshja nuk u zbatua", "ndeshja: X nuk është në të dhënat e ngarkuara", njëlloj për raundin dhe ngjarjet, "lojtari X nuk është në të dhënat e ngarkuara", "ana X nuk është në të dhënat e ngarkuara", "nuk është ngarkuar asnjë e dhënë nxehtësie: ngarkoni skedarët .parquet të ndeshjeve te skeda Harta e nxehtësisë". Pa të dhëna të ngarkuara, lidhjet thonë edhe: "Ngarkoni skedarët .parquet të ndeshjeve te skeda Harta e nxehtësisë për t'i parë në hartë."

**Riluaj raundin** shtesisht e kthen hartën e nxehtësisë në **Riluajtja me kuti**, linjën kohore në mënyrën *luaj* me dritaren e saj të vënë në *jetëgjatësi*, shkon te fillimi i seancës së raundit dhe luan. Kur raundi nuk është një seancë e të dhënave të ngarkuara: "ky raund nuk është seancë e të dhënave të ngarkuara: asgjë për të riluajtur".

## Për zhvilluesit {#for-developers}

Kodi: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Versionet e përmbledhjes {#summary-versions}

Skeda lexon përmbledhjet e versionit 1 dhe të versionit 2 (`"version"` në skedar) njëra pranë tjetrës, dhe i trajton njësoj:

| | Versioni 2 | Versioni 1 |
|---|---|---|
| koha e vendosjes | sekonda në raund, si vrasjet | sekonda të ndeshjes; skeda zbret fillimin e raundit |
| vendi i vendosjes | `A` ose `B`; bosh kur demo nuk e thotë | `A`, `B`, ose një numër entiteti - lexohet si vend i panjohur |
| gjatësia e gjysmës | `halfLength`, nga ku ndërrojnë anët për herë të parë; 12 kur është null | 12 (MR12) |
| raundet e pistoletës | `pistolRounds` (raundi 1 dhe raundi i parë pas gjysmës) | raundet kur blerja është `pistol` |
| raund barazimi | `winner` dhe `winnerTeam` bosh | - |
| vetëvrasja | `suicide` te vrasja, kurrë një vrasje mes shokësh skuadre | e thënë kur sulmuesi dhe viktima janë i njëjti lojtar |

`noscope` dhe `attackerBlind` e një vrasjeje (versioni 2) nuk shfaqen te skeda Ndeshja, e cila gjithashtu nuk shfaq vend nga tabela e hartës së nxehtësisë, kështu që vendi bosh i një rreshti granate atje nuk ndryshon asgjë këtu.

Si bëhet një fokus filtra (`focusFilters`):

- **ndeshja** → një filtër kategorie mbi kolonën `match`;
- **raundi** → një filtër intervali `round` = N mbi një kolonë numerike `round` (një filtër kategorie mbi një kolonë kategorike), dhe seanca e raundit (`<match> #NN`) zgjidhet te zgjedhësi i seancës;
- **ngjarjet** → një filtër kategorie mbi kolonën `event`;
- **lojtari** → një filtër personi mbi atë lojtar;
- **ana** → një filtër grupi.
