---
title: "Valodas"
nav_order: 17
lang: "lv"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Valodas

Skatītājs var runāt tavā valodā: katru pogu, norādi un ziņojumu, un katru teikumu sacīkšu un mača analīzē rāda valodā, ko izvēlies. Tas zina 40 valodas un sākas ar tavas pārlūka valodu, ja tā ir pieejama.

Visas Eiropas valsts valodas ir tur (ES 24, kā arī norvēģu, islandiešu, ukraiņu, krievu, baltkrievu, serbu, bosniešu, maķedoniešu, albāņu, turku, luksemburgiešu un katalāņu), kā arī japāņu, korejiešu un ķīniešu vienkāršotā un tradicionālā raksta. Pilns saraksts: [Valodu saraksts](ref-languages.md).

Angļu valoda ir avots, no kura tulko visas pārējās, un to rāda, ja ziņojums kādā valodā trūkst.

## Mainīt valodu {#change-the-language}

1. Atver nolaižamo sarakstu blakus vārdam sānjoslas augšā. Tā pirmais ieraksts ir **Automātiski — <valoda>** (pārlūka, kā tā tagad atpazīta); tad katra valoda ar savu vārdu, lai tu atrastu savu pat tad, ja nevari lasīt rādīto.
2. Izvēlies vienu. Tā pārslēdzas uzreiz un tiek saglabāta šajā pārlūkā. Izvēlies *Automātiski*, lai aizmirstu izvēli.

Privātā logā vai ja glabāšana ir bloķēta, izvēle paliek spēkā, līdz lapa tiek aizvērta.

Ko dara pārslēgšana:

- katra etiķete, norāde un ziņojums tiek atkārtoti attēlots jaunajā valodā;
- sacīkšu analīze tiek **atkal aprēķināta** tajā (tās teikumi tiek veidoti no mērījumiem, nevis tulkoti pēc fakta), demo apļi tiek pārdēvēti un diagrammas tiek pārzīmētas;
- skaitļi, saraksti un daudzskaitļi seko jaunajai valodai.

## Kurā valodā tā sākas {#which-language-it-starts-in}

1. Valoda, kas **izvēlēta** šajā pārlūkā, ja tāda ir (saglabāta `localStorage` ar atslēgu `heat3d.language`).
2. Citādi **pārlūka**: pirmā no `navigator.languages`, ko skatītājs runā. Tags tiek saskaņots pēc tā valodas daļas (`de-AT` → `de`), ar šiem aizstājvārdiem: `nb` un `nn` → norvēģu (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` un jebkurš tags ar `Hant` rakstu → tradicionālā ķīniešu; `zh-Hans`, `zh-CN`, `zh-SG` un citi `zh` → vienkāršotā ķīniešu; `cnr` (melnkalniešu) → serbu.
3. Citādi **angļu**.

Lapas `<html lang>` tiek iestatīts uz runātās valodas kodu.

## Skaitļi, saraksti un daudzskaitļi {#numbers-lists-and-plurals}

Skaitļi, saraksti un daudzskaitļi skatītāja tekstā tiek rakstīti valodas veidā ("3.5" vai "3,5", "a, b un c"). Etiķetes, kas ir garākas nekā angliski, tiek pārnestas rindā, dalītas ar defisi, kur valoda to atļauj, nevis iziet ārpus sānjoslas. Diagrammu rindu nosaukumi, kas ir par garu, tiek saīsināti ar daudzpunktu un rādīti pilnībā, uzvelkot ar peli.

Skaitļus, ko ieraksti kastē, var rakstīt ar punktu vai komatu.

## Tulkotājiem un izstrādātājiem {#for-translators-and-developers}

Kods: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Kā raksta skaitļus, sarakstus un daudzskaitļus {#how-numbers-lists-and-plurals-are-written}

- **Skaitļi** ar decimāldaļām (`num`) izmanto valodas decimālzīmi un **nav cipara grupēšanas** — attālums 3108 m paliek viens skaitlis katrā valodā.
- **Veselie skaitļi, kas ir skaiti vai izmēri** (`int`), izmanto valodas cipara grupēšanu.
- **Saraksti** (`list`) tiek savienoti valodas veidā: "a, b un c", "a, b vai c", vai viens aiz otra ar valodas paša atdalītāju (ziņojums `common.listSeparator`: ", " angliski, "、" japāņu un abās ķīniešu valodās).
- **Daudzskaitļi** seko valodas pašas likumiem caur `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Lokāle, ko pieprasa `Intl`, ir valodas tags, izņemot gadījumus, kad tikai tags dotu citas valsts likumus: portugāļu ir `pt-PT` (Brazīlijas daudzskaitlis skaita 0 kā vienu), norvēģu `nb`, vienkāršotā ķīniešu `zh-CN`, tradicionālā `zh-TW`.

### Kataloga {#the-catalogs}

`src/i18n/locales/<language>/<part>.json`, viens fails katrai skatītāja daļai, tās pašas daļas katrā valodā.

Ir viens fails katrai skatītāja daļai (šodien 30, piemēram, `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), un katrai valodai ir tā pati kopa. Mape tos visus uzskaita.

Katrs fails ir plakans JSON objekts: atslēga pilnā veidā (`"race.ui.laps.load"`), ziņojums kā vērtība. Angļu valoda ir iekļauta skatītājā; jebkura cita valoda tiek ielādēta, kad tā tiek izvēlēta.

**Meklēšana:** pašreizējās valodas ziņojums, citādi angļu, citādi pati atslēga (izstrādes režīmā konsole brīdina "i18n: no message …"). Ziņojums, kuru nevar formatēt, atkāpjas uz angļu, tāpēc bojāts tulkojums nekad neizjauc skatītāju.

#### Ziņojumu sintakse {#the-message-syntax}

ICU ziņojumu sintakses daļa, ko skatītājs izmanto:

| Forma | Piemērs | Nozīme |
|---|---|---|
| `{name}` | `{file} has no rows` | vērtība, ievietota kā dota |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | atzars skaitlim pēc valodas daudzskaitļa likumiem vai precīzs `=0`, `=1` …; `#` ir skaitlis valodas veidā |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | atzars vārdam |

Atzari ir ligzdoti, un katram `plural` un `select` jābūt `other` atzaram. Atšķirībā no pilna ICU, **apostrofs ir tikai apostrofs** — automašīnu nosaukumi un angļu īpašības ir pilni ar tiem —, tāpēc nekas nav jāpēdiņo. Burtisku `{` vai `}` rakstīt nevar.

Ziņojumi ar vērtībām, kuras tulkojumam jāsaglabā: nosaukumus figūriekavās aizpilda kods; `select` vārdi ir tie, pēc kuriem kods izvēlas (`crash`, `onto-straight`, `yes`/`none`), un tiem jāpaliek kā angliski; daudzskaitļa kategorijas var atšķirties (valoda lieto savas: poļu `one`, `few`, `many`, `other`; japāņu tikai `other`).

### Kā tulkojumi tika veidoti un testi {#how-the-translations-were-made-and-the-tests}

Tulkojumi tika veidoti ar MI modeli no angļu valodas, ar sacīkšu terminu glosāriju, un sacīkšu tekstus pārlasīja vēlreiz ar ievietotām vērtībām. Dzimtās valodas runātāju labojumi ir laipni gaidīti (zemāk).

`src/i18n/i18n.test.ts` pārbauda:

- ka katrs ziņojums, ko kods pieprasa, eksistē angliski — katrs `t('…')` izsaukums un katra atslēga, kas glabāta tabulā un vēlāk nodota `t()` (atslēgas, kas sākas ar daļas nosaukumu, piemēram, `app.` vai `heat.`);
- ka ziņojumi, ko kods veido no daļām, eksistē: katrs kļūdas `label`, `short`, `count` un `here`, katra automašīnu salīdzinājuma īpašība, katra kanāla etiķete;
- ka katrs ziņojums **parsējas** katrā valodā;
- ka katrs tulkojums **saglabā angļu ziņojuma vērtības un izvēles** (nav pievienotas vai zaudētas vērtības; katrs `select` saglabā savus vārdus);
- ka katrai valodai ir **katrs** angļu ziņojums un ka tulkoto valodu kopa ir tieši augstāk minētais saraksts;
- ka ziņojums tiek parādīts izvēlētajā valodā un atkāpjas uz angļu.

### Tulkojuma labošana {#correcting-a-translation}

Dzimtās valodas runātāja labojumi ir laipni gaidīti — katrs ir viena JSON rinda.

1. Atrodi ziņojumu: meklē angļu katalogos (`src/i18n/locales/en/`) tekstu, ko redzi angliski (pārslēdz izvēlni uz angļu, lai to izlasītu), un ieraksti tā atslēgu.
2. Atver to pašu daļu savā valodā, piemēram, `src/i18n/locales/de/race-ui.json`, un maini šīs atslēgas vērtību. Saglabā katru `{name}`, saglabā `select` vārdus, raksti daudzskaitļa atzarus, kādus tava valoda vajag:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Palaid `npm test` (vai vienkārši `npx vitest run src/i18n`): testi saka, ja vērtība vai izvēle ir pazudusi vai ziņojums vairs neparsējas.
4. Ar darbojošos izstrādes serveri izmaiņa parādās pēc valodas pārslēgšanas (vai pārlādēšanas).

**Ziņojuma pievienošana** (kodā): vispirms pievieno to angļu daļā, tad katrai citai valodai (testi kļūst nederīgi, kamēr katrai nav).

**Valodas pievienošana**: pievieno to `LANGUAGES` failā `languages.ts` (tās BCP 47 tags un tās pašas nosaukums, un aizstājvārds vai `Intl` lokāle, ja vajag), un mapi `src/i18n/locales/<tag>/` ar visām daļām.
