---
title: "Kameras ceļš un video"
nav_order: 15
lang: "lv"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kameras ceļš un video

Uzfilmē savus datus: tu novieto kameru dažās vietās, un skatītājs lido starp tām un saglabā video. Katrs kadrs ir ļoti tīrs, bez graudainības. Kamera un atskaņošanas galviņa pārvietojas kopā, tāpēc tā pati panelis veido laika uzņēmumu ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Izveido lidojumu {#make-a-flythrough}

1. Nolido līdz vietai, kur filma sākas, un nospied **Pievienot atslēgkadru šeit** sadaļā **Kameras ceļš un renderēšana**.
2. Nolido līdz nākamajai vietai un nospied to vēlreiz. Atkārto katrai pieturai.
3. Atzīmē **Priekšskatīt pa ceļu** un velc **Pozīcija ceļā**, lai pārbaudītu kustību.
4. Iestati **Ilgums** (cik garš ir video). Kustība, kas ir pareiza, bet par ātru, prasa tikai garāku ilgumu.
5. Nospied **Renderēt video**. Pagaidi progresa rindu; fails tiek lejupielādēts, kad tas ir pabeigts.

![Panelis Kameras ceļš un renderēšana ar trim atslēgkadriem, Gludu interpolāciju, 12 s, 30 fps un 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Atslēgkadri {#keyframes}

| Vadība | Efekts |
|---|---|
| **Pievienot atslēgkadru šeit** | Pievieno pašreizējo kameras pozīciju, pagriezienu (yaw), slīpumu (pitch) un redzes lauku kā atslēgkadru. |
| **Notīrīt** | Noņem visus atslēgkadrus. |
| Atslēgkadru saraksts | Viena rinda katram: tā numurs (noklikšķini, lai nolidotu kameru tur, iestatot arī redzes lauku), pozīcija, `yaw° / pitch°` un **×**, lai to noņemtu. |

Atslēgkadri tiek izvietoti **vienmērīgi** pa normalizētu ceļa asi no 0 līdz 1, kad kāds tiek pievienots vai noņemts. Izvades ilgums tad izstiepj visu kustību, tāpēc kadrs, kas ir pareizs, bet par ātru, prasa tikai garāku ilgumu. Pagrieziens starp atslēgkadriem tiek atvērts, lai kamera pagrieztos īsāko ceļu.

Bez atslēgkadriem renderēšana visu klipu tur kameru nekustīgi — pilnīgi labs laika uzņēmums.

## Ceļa iestatījumi {#path-settings}

| Vadība | Noklusējums | Diapazons (kustināšana) | Nozīme |
|---|---|---|---|
| **Interpolācija** (2+ atslēgas) | *Gluda* | *Gluda* / *Taisna* | *Gluda*: kubiska Ermita līkne caur atslēgām ar pieskarēm no blakus atslēgām, tāpēc ātrums sakrīt katrā atslēgā un nav lēciena, kur posmi saskaras. *Taisna*: taisnas līnijas starp atslēgām, paredzamas, ar redzamu stūri katrā atslēgā. Redzes lauks vienmēr tiek interpolēts lineāri. |
| Ceļa līnija (2+ atslēgas) | | | `N vienības ceļā - M sekundē šajā ilgumā` vai piezīme, ka visas atslēgas atrodas vienā vietā. |
| **Priekšskatīt pa ceļu** (1+ atslēgas) | izslēgts | | Vada skata kameru pa ceļu un pārvieto atskaņošanas galviņu līdzi, kā to dara renderēšana, lai kustību varētu novērtēt pirms renderēšanas. |
| **Pozīcija ceļā** (kamēr priekšskata) | 0% | 0–100% | Kur ceļā priekšskatīt. |
| **Ilgums** | 12 s | 1–120 s (3600) | Video garums. |
| **Kadru ātrums** | 30 fps | 6–60 (240) | |
| **Bitu ātrums** | 16 Mbps | 1–60 Mbps, logaritmiski (400) | Siltuma gradienti sliktā veidā sadalās joslās zemos bitu ātrumos: kodekam ir maz detaļu, aiz kurām paslēpt kļūdu. |
| **Konverģences gaidīšanas robeža** | 240 kadri | 2–600 (10 000) | Ilgākais laiks, cik viens izvades kadrs var gaidīt, lai kļūtu precīzs. Kadri, kas to sasniedz, tiek tik un tā ierakstīti un saskaitīti. |
| Kopsavilkums | | | `N kadri · logs: kumulatīvs/fiksēts/dzīvildze`, un, kad laika skala ir režīmā Viss: *(renderēšana pārslēdz Viss uz Atskaņot, lai atskaņotās galviņas pozīcijai būtu jēga)*. |
| **Renderēt video** / **Atcelt** | | | Sāk renderēšanu; kamēr tā darbojas, rāda `kadrs i / n · gaidīts w · X MB` un cik kadru nebija precīzi. Prasa datu kopu. |

## Padomi {#tips}

- Izvades izmērs ir audekla izmērs ierīces pikseļos (displeja pikseļu attiecība, ierobežota līdz 2). Lai to mainītu, pārlādē pārlūka logu.
- Kumulatīvā vēsture veido siltumu visa klipa garumā; logs vai dzīvildze rāda kustīgu laika griezumu.
- Atslēgkadru pozīcijas ir displeja koordinātas: ar [apgrieztu pasaules asi](camera.md#invert-world-axis) atslēgas, kas izveidotas pirms pārslēgšanas, pēc tās norāda citur.

## Izstrādātājiem {#for-developers}

### Ko dara renderēšana {#what-a-render-does}

1. Uzņem testa attēlu, lai uzzinātu precīzo izvades izmēru ierīces pikseļos.
2. Izvēlas kodeku caur WebCodecs: **VP9** (`vp09.00.10.08`), citādi **VP8**, ar izvēlēto bitu ātrumu un kadru ātrumu. Bez `VideoEncoder` tā apstājas ar *Šim pārlūkam nav VideoEncoder — video ierakstīšanai nepieciešams WebCodecs*; ja neviens kodeks nav atbalstīts, ar *Nav atbalstīta video kodeka (mēģināti VP9, VP8)*.
3. Pārņem iestatījumus, kas vajadzīgi renderēšanai: pauzē atskaņošanu, **izslēdz adaptīvo budžetu**, **ieslēdz progresīvo precizēšanu** un spraitu budžetu uzstāda uz 64M katrā kadrā. (Adaptīvais budžets sargā kadru ātrumu, kas šeit ir nepareizs mērķis: tas katru lēnu konverģējošu kadru uztvertu kā iemeslu zīmēt mazāk rindu, kas prasa vairāk kadru konverģencei.) Pārslēdz laika skalu no **Viss** uz **Atskaņot**. Vēstures iestatījums (kumulatīvs, logs, dzīvildze) paliek kāds bija: renderēšanai jābūt tam, ko tu skatīji, atskaņotam un ierakstītam.
4. Katram izvades kadram *f* no *n*, kur *u* = f / (n - 1):
   - novieto kameru ceļa pozā pie *u* (ja ir atslēgas);
   - pārvieto atskaņošanas galviņu uz to pašu daļu *u* laika skalas diapazonā (izvēlētās sesijas diapazons kastes atkārtojumā);
   - piespiež jaunu aplēsi, pat ja kamera nav kustējusies, jo mantot iepriekšējā kadra uzkrāšanu atstātu iepriekšējā loga spoku;
   - kadru pa kadram gaida, līdz attēls ir precīzs (visas kandidātu rindas zīmētas vienā kadrā vai uzkrāšana pabeigta), līdz gaidīšanas robežai;
   - uzņem saliktu kadru un kodē to, ar atslēgkadru ik pēc 2 izvades sekundēm, lai faili būtu meklējami.
5. Ievieto kadrus WebM failā ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) ar laika zīmogiem, kas izvēlēti pēc kadru ātruma. Laiks pulksteņa nozīmē, cik ilgi katrs kadrs prasīja, nav svarīgs.
6. Atjauno budžetu, redzes lauku, laika skalas režīmu, atskaņošanas galviņu un to, vai tā darbojās.
7. Lejupielādē video kā `3dheat-<width>x<height>-<frames>f.webm` un ziņo `N kadri pie W×H, X MB - katrs kadrs precīzs` vai cik kadru sasniedza gaidīšanas robežu.

**Atcelt** aptur pēc pašreizējā kadra (*Renderēšana atcelta.*) un atjauno iestatījumus.
