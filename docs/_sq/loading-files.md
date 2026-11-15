---
title: "Ngarkimi i skedarëve"
parent: "Si të futni të dhënat"
nav_order: 1
lang: "sq"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Ngarkimi i skedarëve

Kjo faqe tregon si t'i jepni 3DHeat skedarët tuaj dhe çfarë bën me ta. Lëshoni një dosje dhe ai zgjedh skedarët që mbajnë pozicione dhe i bashkon në një pamje të vetme.

1. Hapni **Burimi** lart, në shiritin anësor të Hartës së nxehtësisë.
2. Lëshoni skedarë ose një dosje në zonën e lëshimit, ose shtypni **Skedarë…** ose **Dosje…**.
3. Lexoni rreshtin e zgjedhjes dhe **Vlerësimin e memories** (shih figurën më poshtë).
4. Shtypni **Ngarko**.

![Paneli Burimi pasi u lëshua një dosje me dhjetë ndeshje: 1 rreshti i zgjedhjes, 2 Vlerësimi i memories te fits, dhe 3 Ngarko 10 skedarë](../assets/img/en/loading-files-source.webp)

*Pasi lëshoni një dosje, 3DHeat ju thotë çfarë gjeti dhe nëse përshtatet.*

Skedarët ngarkohen në panelin **Burimi** lart, në shiritin anësor të skedës Harta e nxehtësisë. Gjithçka e zgjedhur njëherësh bëhet **një** grup të dhënash.

## Zgjedhja e skedarëve {#choosing-files}

| Kontrolli | Çfarë bën |
|---|---|
| **Lësho skedarë ose një dosje këtu** (zona e lëshimit) | Lësho çfarëdo përzierjeje skedarësh dhe dosjesh. Dosjet shqyrtohen rekursivisht. Klikimi në zonën e lëshimit hap të njëjtin zgjedhës si **Skedarë…**. |
| **Një skedar…** | Një zgjedhës skedarësh për një skedar të vetëm. |
| **Skedarë…** | Një zgjedhës skedarësh që pranon disa skedarë. |
| **Dosje…** | Një zgjedhës dosjesh (zgjedhësi `webkitdirectory` i shfletuesit); çdo skedar në pemën e dosjes ofrohet. |

Zgjedhësit pranojnë llojet e skedarëve të [listës së skedarëve të ngarkueshëm](data-formats.md#files). Shkurt: `.parquet`/`.pq` lexohen si Parquet, `.csv`/`.tsv`/`.txt` si tekst me ndarës, `.acmi` (Tacview), `.json`/`.json.gz` të OCAP dhe formatet GPS (GPX, KML, KMZ, NMEA, IGC, FIT) kalojnë nga lexuesit e tyre, dhe kontejnerët e ndeshjeve `.3dheat` ngarkohen si tabelat që mbajnë ([Një skedar për ndeshje](container.md)). Një kontejner që s'mund të lexohet anashkalohet si *jo një skedar csv/parquet*.

Dosjet e lëshuara shqyrtohen deri në 12 nivele thellësi dhe jo më shumë se 20,000 skedarë, si mbrojtje nga lidhjet simbolike rrethore dhe pemët e pakontrolluara.

## Cilët skedarë mbahen {#which-files-are-kept}

Para se të lexohet ndonjë gjë, zgjedhja filtrohet ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Një skedar me zgjatim tjetër anashkalohet: *jo një skedar csv/parquet*.
- Një skedar me 0 bajt anashkalohet: *bosh (0 bajt)*.
- **Sidecar-ët e konvertuesit** - të dhënat e papërpunuara që mban një konvertues pranë tabelës së një ndeshjeje, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` dhe të tjerët e listuar te [Konvertuesit ruajnë gjithçka](converters.md) - anashkalohen: *sidecar i një konvertuesi*. Për ta hapur një të tillë, zgjidheni ose lëshojeni vetëm (ose vetëm sidecar-ët): një zgjedhje që përmban vetëm sidecar-ë i ngarkon si çdo tabelë tjetër. JSON-i pranë një tabele (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` dhe `.hints.json`) nuk ofrohet kurrë si pozicione.
- **Rregulli i skedarit të lëvizjes.** Nëse ndonjë skedar në zgjedhje emërtohet `movement*.parquet`, `movement*.csv` (dhe zgjatimet e tjera) - `movement.parquet`, `movement_1.parquet` e kështu me radhë - atëherë çdo skedar tjetër të dhënash anashkalohet: *jo një skedar lëvizjeje, dhe kjo dosje ka skedarë lëvizjeje*. Eksportet e telemetrisë shpesh mbajnë një tabelë pozicionesh pranë dhjetëra tabelash pa pozicione, dhe vetëm e para mund të vizatohet. Një dosje pa asnjë skedar lëvizjeje ngarkon të gjithë skedarët e saj të të dhënave. Shembull: një dosje me `movement_1.parquet`, `kills.parquet` dhe `shop.parquet` ngarkon `movement_1.parquet`; të tjerët dy listohen si të anashkaluar. Shembull: një dosje me `movement_1.parquet`, `kills.parquet` dhe `shop.parquet` ngarkon `movement_1.parquet`; të tjerët dy listohen si të anashkaluar.
- Skedarët e mbajtur renditen sipas shtegut të tyre brenda zgjedhjes, kështu që e njëjta dosje prodhon gjithmonë të njëjtin grup të dhënash dhe të njëjtat ngjyra.

Paneli pastaj shfaq zgjedhjen (emri i një skedari të vetëm, ose `dosja (N skedarë)` duke përdorur dosjen e përbashkët më të gjatë), numrin e skedarëve, madhësinë e tyre të përgjithshme dhe numrin total të rreshtave - i saktë kur çdo skedar është Parquet, i shënuar `≈` kur ndonjë është CSV. Skedarët e anashkaluar listohen me arsyen e tyre, katër të parët me emër.

## Leximi i skemës {#reading-the-schema}

Skedari **i parë** i zgjedhjes hapet për të përshkruar skemën ("Duke lexuar skemën"): emrat e kolonave, 50 rreshtat e parë të të dhënave, cilat kolona duken numerike dhe, për Parquet, tipi logjik i çdo kolone dhe hyrja e footer-it `heat3d`. Një dosje eksportesh të një tabele ndan një skemë të vetme, kështu që një skedar përfaqëson të gjithë. Pastaj çdo skedar matet ("Duke numëruar rreshtat"): një footer Parquet jep numrin e saktë në një lexim të vogël; numri i një CSV vlerësohet nga gjatësia mesatare e rreshtit të megabajtit të parë.

Paneli [Përcaktimi i kolonave](column-mapping.md) hapet me hamendjet e automatike të përcaktuara, dhe [vlerësimi i memories](memory-and-budgets.md) shfaqet mbi butonin **Ngarko**.

## Mesazhet para ngarkimit {#messages-before-loading}

Nën zgjedhjen paneli liston, nga [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):


- **Gabimet** (të kuqe) - ngarkimi nuk mund të nisë: më pak se dy boshte pozicioni, e njëjta kolonë në dy boshte, një kolonë e hartëzuar që nuk është në skedar, një kolonë pozicioni që nuk duket numerike, një kolonë kohe ku vlerat e mostruara janë tekst ndërsa njësia është numër (çdo rresht do të lexohej NaN dhe do të binte në kohën 0), një kolonë kohe e vendosur ISO-8601 ku asnjë nga vlerat e mostruara nuk lexohet si datë, ose një shkallë njësish 0.
- **Paralajmërimet** (qelibar) - do të ngarkohet, por ndoshta jo ashtu si synohet: një kolonë grupi që merr një vlerë të veçantë te shumica e rreshtave të mostruar (pra është një id, jo grup), një kolonë kohe `DATE` (çdo rresht i një dite ndan të njëjtën çast), kah shikimi i vendosur pa kolonat e tij.
- **Shënimet** - çfarë nënkupton përcaktimi: vizatim në një plan kur një bosht nuk është hartëzuar, pa vijë kohore pa kolonë kohe, pa gjurmë pa kolonë personi, dhe pa kolonë grupi një ngjyrë për gjithçka dhe një diferencë që mund të ndahet vetëm sipas një kolone të mbajtur për filtrim.

## Ngarkimi {#loading}

Butoni **Ngarko** shfaq *Ngarko skedarin*, *Ngarko N skedarë*, ose *Ngarko N skedarë (1 në K)* kur është vendosur një [hap zvogëlimi](memory-and-budgets.md#decimation). Shfaq *Shumë i madh - zvogëloje ose zvogëloje me hapa* dhe është i çaktivizuar kur [kontrolli i përshtatjes](memory-and-budgets.md#the-fit-check) thotë se ngarkimi nuk do të përshtatet; është gjithashtu i çaktivizuar kur përcaktimi ka gabime ose po punon një ngarkim tjetër.

Gjatë ngarkimit, paneli tregon hapin aktual (me `[skedar/skedarë]` përpara kur janë disa skedarë), rreshtat e lexuar deri tani, një shirit përparimi dhe **Anulo**. Anulo ndal punëtorin e ingestimit, dhe me të çdo punëtor analizues që ka nisur.

Faqja vazhdon të vizatojë gjatë ngarkimit, sepse puna bëhet në sfond. Shihni hapin aktual, rreshtat e lexuar, një shirit përparimi dhe **Anulo**. Pas skedarit të fundit paneli shfaq hapat *Duke vendosur rreshtat në rend kohor*, *Duke rirenditur kolonat (n nga m)*, *Duke matur shtrirjen*, *Duke ndërtuar listën*, *Duke përmbledhur seancat* dhe *Duke llogaritur jetëgjatësitë*, pastaj *Duke ngarkuar N rreshta në GPU* për një kornizë, që një ngarkim i gjatë të mos ngatërrohet kurrë me një ngrirje.

### Si funksionon {#how-it-works}

Ngarkimi zhvillohet në një Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Me disa skedarë dhe më shumë se një [fije analizuese](memory-and-budgets.md#parser-threads), deri në atë numër skedarësh analizohen **njëherësh**, secili në një punëtor analizues të vetin ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), deri sa buxheti i RAM-it lë vend; ata bashkohen prapë një nga një sipas radhës së zgjedhjes, kështu që grupi i të dhënave është i njëjtë me një ngarkim një nga një. Ndërsa disa janë në punë, rreshti i përparimit emërton skedarin që raportoi të fundit, dhe shiriti dhe numri i rreshtave mblidhen për çdo skedar në punë. Me një fije, ose një skedar të vetëm, skedarët analizohen njëri pas tjetrit në vetë punëtorin e ingestimit. Lexohen vetëm kolonat që përcaktimi i emëron: një kolonë e pahartëzuar e një skedari Parquet nuk kushton asgjë; një CSV skanohet bajt për bajt, por vetëm fushat e hartëzuara dekodohen.

## Disa skedarë bëhen një grup të dhënash {#several-files-become-one-dataset}

Kur ngarkohet më shumë se një skedar ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Një listë e vetme.** Personat, grupet, seancat dhe vlerat e kategorive janë fjalorë të përbashkët për të gjithë skedarët, kështu që i njëjti lojtar në dy eksporte është një person me një gjurmë.
- **Një origjinë e vetme kohore.** Kohët mbahen si sekonda 64-bit gjatë bashkimit dhe rikalohen mbi kohën më të hershme të *gjithë* zgjedhjes, pastaj ruhen si sekonda 32-bit nga ajo origjinë. Katër eksporte nga katër pasdite vendosen në renditjen e tyre reale, jo të shtyra njëri mbi tjetrin.
- **Një rend i vetëm kohor.** Rreshtat nga të gjithë skedarët renditen sipas kohës me një renditje radix (shih [kufirin e renditjes](memory-and-budgets.md#the-sort-ceiling)).
- **Një kolonë `Source file`.** Çdo rresht mban mend cili skedar e solli, si kolonë kategorie e quajtur `Source file`. Ajo shfaqet te [Filtrat](filters.md) dhe si *Source file - krahaso dy ngarkime* te [ndarja e diferencës](difference.md). Një ngarkim me një skedar të vetëm nuk e merr - një kolonë konstante do të kushtonte 4 bajt për rresht për të thënë asgjë.
- **Kolona që mungojnë.** Një skedar që nuk ka një nga kolonat *filtër* thjesht nuk jep vlera për të. Një skedar që nuk ka një kolonë *roli* të hartëzuar (X, koha, personi, ...) dështon me *skedari nuk ka kolonën "emri"*; në një ngarkim me disa skedarë ai skedar anashkalohet dhe të tjerët ngarkohen prapë, dhe skedarët e anashkaluar listohen te grupi i të dhënave. Një ngarkim me një skedar të vetëm që dështon raporton gabimin.
- **Paralajmërim mungese.** Kur rreshtat e ngarkuar janë më pak se 95% e rreshtave të numëruar më parë, grupi i të dhënave mban një paralajmërim me pjesën që mungon - nga skedarët e palexueshëm ose nga rreshta pa pozicion të përdorshëm, që hiqen gjatë hyrjes.

## Pas ngarkimit {#after-loading}

Grupi i ri zëvendëson çdo grup të mëparshëm. Në çdo ngarkim ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- pastrohen të gjitha filtrat dhe dukshmëria e grupeve;
- ndarja e diferencës sipas grupit rivendoset: gjysma e parë e grupeve (e rrumbullakosur lart) pozitive, pjesa tjetër negative;
- rrezja e pikës vendoset në shtrirjen horizontale / 120 dhe ngopja në një vlerësim analitik; madhësia e kubit, gjatësia e rrezes së shikimit, shpejtësia e fluturimit dhe planet e afërta/largëta vendosen nga shtrirja (shih [Seancat, personat dhe grupet](sessions-persons-groups.md#entity-size));
- seanca e riluajtjes së kutisë vendoset te seanca me më shumë rreshta;
- rrugët e nxehtësisë së linjës merren përsëri me hamendje ([Nxehtësi vijash](line-heat.md));
- mënyra e pamjes bie te **Nxehtësi** nëse mënyra aktuale nuk mbështetet nga të dhënat e reja; kohëvizata bie te **Të gjitha** pa kolonë kohe, dhe historia te **Kumulative** pa jetëgjatësi;
- koka e riluajtjes vendoset në fillim dhe riluajtja ndalet;
- kamera e kornizon gjithë grupin e të dhënave nga drejtimi i parazgjedhur (duke parë sipas -Z, e prirur poshtë rreth 36°).

Paneli **Grupi i të dhënave** shfaq pastaj emrin e grupit (zgjedhjen, numrat e rreshtave dhe skedarëve, dhe hapin kur është përdorur), `N ekipe · N persona · Ns shtrirje`, dhe çdo paralajmërim që dha ngarkimi, me ngjyrë qelibar, për aq kohë sa grupi është i ngarkuar. **Hiq** në atë panel e heq grupin.
