---
title: "Grumbullimi"
parent: "Brendësitë e vizatimit"
nav_order: 2
lang: "sq"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---


# Grumbullimi

Kur shikuesi nuk mund të vizatojë çdo pikë në një kuadër, vizaton një pjesë të tyre, pastaj një pjesë tjetër, dhe i mbledh imazhet së bashku ndërsa qëndron i palëvizur. Imazhi bëhet më i qartë, ashtu si një foto që zhvillohet. Lëvizja e kamerës e nis përsëri. Rreshti **Mbulimi** i shtresës së statistikave tregon sa ka përparuar.

![Shtresa e statistikave: Mbulimi tregon një përqindje ndërsa imazhi zhvillohet, dhe *e saktë* kur është i plotë](../assets/img/en/performance-stats-overlay.webp)

## Për zhvilluesit {#for-developers}

Kur një kuadër nuk mund të vizatojë çdo rresht, vizaton një mostër dhe e peshon atë më lart; imazhi është atëherë një vlerësim i paanshëm por me zhurmë. **Grumbullimi** i bashkon kuadrat radhazi, që vlerësimi t'i afrohet përgjigjes së saktë ndërsa asgjë nuk ndryshon. Çdo kuadër zgjedh një nga pesë modalitetet ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); i fundit i përdorur është te `engine.live.accumMode`.

| Modaliteti | Kur | Çfarë i ndodh grumbulluesit |
|---|---|---|
| **reset** | kamera u lëvizi, ndryshoi diçka që e ndryshon fushën, përmirësimi progresiv është i fikur, po nis një dritare në rritje (kuadri i parë i luajtjes, pas një kërkimi), ose u lëvizën vijat e nxehtësisë së riluajtur | Zëvendësohet me vlerësimin e këtij kuadri. |
| **extend** | një dritare **Kumulative** që vetëm u zgjerua që nga kuadri i mëparshëm | Ky kuadër vizaton vetëm rreshtat që sapo u bënë të dukshëm, me peshë të plotë, dhe i shton. Asgjë nuk zbehet. |
| **ema** | një dritare rrëshqitëse (**Dritare**, **Jetëgjatësi**) u zhvendos | `acc = acc × (1 - 0,34) + frame × 0,34` — një mesatare eksponenciale lëvizëse e rreth tre kuadrave. |
| **mean** | asgjë nuk ndryshoi dhe vlerësimi nuk është i plotë | `acc = acc × (1 - 1/n) + frame × 1/n` te kuadri i *n*-të: një mesatare rrjedhëse. |
| **skip** (joaktiv) | konvergjoi dhe asgjë nuk ndryshoi | Asgjë nuk vizatohet; kuadri rikompozohet vetëm. |

### Pse secili {#why-each}

- **Mesatare rrjedhëse, jo shumë.** Shkallëzimi i buffer-it me 1 - 1/n dhe shtimi i 1/n të kuadrit të ri është algjebrikisht e njëjta gjë me mbledhjen dhe pjesëtimin me *n* në fund, por buffer-i mban gjithmonë sasinë e një fushe. Një shumë arrin *n* herë fushën, dhe në një target 16-bit ngopet në 65 504; me një pjesëtues që vazhdon të rritet, një pamje e palëvizur do të zbehej sa më gjatë të qëndronte — ndërsa një kamerë në lëvizje, që rifillon çdo kuadër, duket krejt e saktë. Suita e tymit pohon se 16 kuadra të bashkuar mbajnë 1,00× sa mban një kuadër i vetëm.
- **Extend për luajtjen kumulative.** Rreshtat e grumbulluar tashmë janë akoma të dukshëm, kështu që një kuadër ka nevojë vetëm për pjesën e sekondës që sapo arriti — që hyn në një kuadër të vetëm, prandaj hyn saktësisht. Rivlerësimi do të ndriçonte një nëngrup tjetër të rastësishëm çdo kuadër dhe do ta zbehte, duke u lexuar si shpërthime që ndizen dhe zhduken, dhe një kuadër i pauzuar do të vazhdonte të mbushej. Suita pohon se totali rritet në mënyrë monotone gjatë luajtjes, dhe mbahet brenda 0,02% gjatë 2,5 s të pauzuara.
- **Mesatare lëvizëse për dritaret rrëshqitëse.** Ato ndryshojnë vërtet çdo kuadër. Një peshë e fiksuar përzierjeje e ndjek dritaren lëvizëse (një mesatare e të gjitha kuadrave që nga nisi luajtja do të mbetej pas treguesit të luajtjes), dhe është shumë më e qetë se të nisësh nga e para.
- **Reset për vijat e riluajtura.** Kokat e vijave të nxehtësisë lëvizin çdo kuadër; një mesatare lëvizëse do t'i shtrinte secilën në një rrip, kështu që çdo kuadër vizatohet i plotë, dhe zbehja e bishtit është vetë e pamjes.
- **Kuadrat e pjesshëm kalojnë përmes një target pune.** Një kuadër i bashkuar me një pjesë të peshës së plotë spërkatet në një target të veçantë nga zero dhe pastaj përzihet në grumbullues, në vend që të spërkatet drejtpërdrejt me peshë 1/n. Drejtpërdrejt, çdo sprite do të shtohej me 1/n të madhësisë së totalit ku bashkohet, gjë që një target gjysmë-pikë lundruese e rrumbullos — më keq aty ku është më i dendur ([Grumbullimi me gjysmë-pikë lundruese](half-float-accumulation.md)).

### Konvergjenca {#convergence}

Plani për çdo kuadër di sa rreshta kandidatë ka dhe sa paraqet, kështu që numri i kuadrave që duhen për të mbuluar çdo rresht është ⌈kandidatë / të dorëzuar⌉. Pasi janë bashkuar aq kuadra, pamja është **konverguar**: rreshti *Mbulimi* i shtresës së statistikave kthehet nga përqindje në *e saktë*, dhe kuadrat e mëtejshëm janë joaktivë. Me **Vizato çdo rresht në çdo kuadër** të ndezur (parazgjedhje), një kuadër i vetëm zakonisht mbulon çdo gjë, kështu që konvergjenca është e menjëhershme, dhe mekanizmi progresiv nevojitet vetëm kur dritarja përmban më shumë rreshta se sa mund të mbajë një plan vizatimi i vetëm (rreth 67 milionë).

### Çfarë e rinis {#what-restarts-it}

Cilësimet bien në tri grupe, sipas asaj që buffer-i i grumbulluar do të thotë akoma pasi ndryshojnë:

| Grupi | Ndryshon | Efekti |
|---|---|---|
| **Gjeometria** — cilat rreshta kontribuojnë dhe sa | modaliteti i pamjes; rrugët e vijave; rrezja e sprite-it, intensiteti në qendër dhe në buzë, rënia, shkalla e butë, kurba, kufijtë e pikselëve, shtrirja; heqja sipas largësisë afër, larg dhe planare; errësimi dhe fshehja pas terrenit; prerja; madhësia e canvas; rezolucioni i nxehtësisë; dukshmëria e grupeve dhe shenjat; ndarja e diferencës; Të gjitha / Luaj; historia; filtrat e kolonave dhe përzgjedhja e Entiteteve; fitimi gjysmë-pikë lundruese | Reset. |
| **Dritarja** — intervali kohor | treguesi i luajtjes që lëviz; rezerva dhe zbehja e jetëgjatësisë | Zgjerim (kumulative) ose mesatare lëvizëse (rrëshqitëse). |
| **Përbërja** — vetëm ngjyrosja | ngopja, përgjigja e dendësisë, nxehtësia minimale, shkallët e ngjyrave; prerja e nivelit; rrjeti dhe boshtet; cilësimet e riluajtjes së kutive dhe sesionit; thellësia e fushës | Rivizaton pa prekur nxehtësinë. |

Një lëvizje kamere e rinis gjithmonë. Pra, tërheqja e ngopjes ose e shkallës është pa kosto; tërheqja e rrezes së sprite-it e rinis konvergjencën në çdo hap.
