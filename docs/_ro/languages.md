---
title: "Limbi"
nav_order: 17
lang: "ro"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Limbi

Vizualizatorul poate vorbi limba ta: fiecare buton, indiciu și mesaj, precum și fiecare propoziție din analiza cursei și a meciului, sunt afișate în limba pe care o alegi. Cunoaște 40 de limbi și pornește în limba browserului tău, atunci când o are.

Sunt acolo toate limbile oficiale ale statelor din Europa (cele 24 ale UE, plus norvegiana, islandeza, ucraineana, rusa, belarusa, sârba, bosniaca, macedoneana, albaneza, turca, luxemburgheza și catalana), plus japoneza, coreeana, și chineza simplificată și tradițională. Lista completă: [Lista de limbi](ref-languages.md).

Engleza este sursa din care este tradusă orice altă limbă și ceea ce se afișează când lipsește un mesaj.

## Schimbă limba {#change-the-language}

1. Deschide lista derulantă de lângă nume, din partea de sus a barei laterale. Prima intrare este **Automată - <limbă>** (a browserului, cum a fost detectată acum); apoi fiecare limbă cu propriul nume, ca să-ți găsești limba chiar dacă nu poți citi cea afișată.
2. Alege una. Se schimbă imediat și este păstrată în acest browser. Alege *Automată* ca să uiți alegerea.

Într-o fereastră privată sau cu stocarea blocată, alegerea ține până se închide pagina.

Ce face schimbarea:

- fiecare etichetă, indiciu și mesaj se redesenează în limba nouă;
- analiza cursei este **calculată din nou** în ea (propozițiile sale sunt construite din măsurători, nu traduse după aceea), turele demonstrative sunt redenumite, iar graficele sunt redesenate;
- numerele, listele și pluralele urmează noua limbă.

## În ce limbă pornește {#which-language-it-starts-in}

1. Limba **aleasă** în acest browser, dacă există una (păstrată în `localStorage`, sub `heat3d.language`).
2. Altfel, cea a **browserului**: prima dintre `navigator.languages` pe care o vorbește vizualizatorul. O etichetă este potrivită după partea de limbă (`de-AT` → `de`), cu aceste alias-uri: `nb` și `nn` → norvegiana (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` și orice etichetă cu scriptul `Hant` → chineza tradițională; `zh-Hans`, `zh-CN`, `zh-SG` și alte `zh` → chineza simplificată; `cnr` (muntenegreana) → sârba.
3. Altfel, **engleza**.

Atributul `<html lang>` al paginii este setat la limba vorbită.

## Numere, liste și plurale {#numbers-lists-and-plurals}

Numerele, listele și pluralele din textul vizualizatorului sunt scrise în felul limbii ("3.5" sau "3,5", "a, b și c"). Etichetele mai lungi decât în engleză se rup pe rânduri, cu cratimă acolo unde limba o permite, în loc să iasă din bara laterală. Numele rândurilor din grafice care sunt prea lungi sunt tăiate cu puncte de suspensie și afișate complet la trecerea cu mouse-ul.

Numerele pe care le scrii într-o casetă pot folosi fie punct, fie virgulă.

## Pentru traducători și dezvoltatori {#for-translators-and-developers}

Cod: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Cum sunt scrise numerele, listele și pluralele {#how-numbers-lists-and-plurals-are-written}

- **Numerele** cu zecimale (`num`) folosesc semnul zecimal al limbii și **nicio grupare a cifrelor** - o distanță de 3108 m rămâne un singur număr în fiecare limbă.
- **Numerele întregi care sunt numărători sau mărimi** (`int`) folosesc gruparea cifrelor din limbă.
- **Listele** (`list`) sunt unite în felul limbii: "a, b și c", "a, b sau c", sau una după alta cu separatorul propriu limbii (mesajul `common.listSeparator`: ", " în engleză, "、" în japoneză și în ambele chineze).
- **Pluralele** urmează regulile proprii limbii prin `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Localul cerut lui `Intl` este eticheta limbii, cu excepția cazurilor în care doar eticheta ar primi regulile altei țări: portugheza este `pt-PT` (pluralul din Brazilia numără 0 ca unu), norvegiana `nb`, chineza simplificată `zh-CN`, chineza tradițională `zh-TW`.

### Cataloagele {#the-catalogs}

`src/i18n/locales/<limbă>/<parte>.json`, câte un fișier pentru fiecare parte a vizualizatorului, aceleași părți în fiecare limbă.

Există câte un fișier pentru fiecare parte a vizualizatorului (30 astăzi, de exemplu `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), iar fiecare limbă are același set. Dosarul le listează pe toate.

Fiecare fișier este un obiect JSON plat: cheia scrisă complet (`"race.ui.laps.load"`), mesajul ca valoare. Engleza este inclusă în vizualizator; orice altă limbă este adusă atunci când este aleasă.

**Căutarea:** mesajul limbii curente, altfel cel în engleză, altfel chiar cheia (în dezvoltare, consola avertizează „i18n: no message …"). Un mesaj care nu poate fi formatat revine la varianta engleză, astfel încât o traducere defectă nu strică niciodată vizualizatorul.

#### Sintaxa mesajelor {#the-message-syntax}

Partea din sintaxa ICU a mesajelor pe care o folosește vizualizatorul:

| Forma | Exemplu | Înțeles |
|---|---|---|
| `{nume}` | `{file} has no rows` | o valoare pusă așa cum este |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | ramura pentru număr, după regulile de plural ale limbii, sau un `=0`, `=1` exact …; `#` este numărul scris în felul limbii |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | ramura pentru un cuvânt |

Ramurile se pot cuibări, iar fiecare `plural` și `select` trebuie să aibă o ramură `other`. Spre deosebire de ICU complet, un **apostrof este doar un apostrof** - numele mașinilor și posesivele engleze sunt pline de ele - deci nimic nu trebuie pus între ghilimele. Un `{` sau `}` literal nu poate fi scris.

Mesaje cu valori pe care o traducere trebuie să le păstreze: numele din acolade sunt completate de cod; cuvintele unui `select` sunt cele după care alege codul (`crash`, `onto-straight`, `yes`/`none`) și trebuie să rămână ca în engleză; categoriile de plural pot diferi (fiecare limbă are pe ale sale: poloneza `one`, `few`, `many`, `other`; japoneza doar `other`).

### Cum au fost făcute traducerile și testele {#how-the-translations-were-made-and-the-tests}

Traducerile au fost făcute cu un model de IA din engleză, cu un glosar de termeni de curse, iar textele cursei au fost citite încă o dată cu valorile completate. Corecturile din partea vorbitorilor nativi sunt binevenite (mai jos).

`src/i18n/i18n.test.ts` verifică:

- că fiecare mesaj cerut de cod există în engleză - fiecare apel `t('…')` și fiecare cheie păstrată într-un tabel și trimisă lui `t()` mai târziu (cheile care încep cu numele unei părți, precum `app.` sau `heat.`);
- că mesajele construite de cod din părți există: fiecare `label`, `short`, `count` și `here` al unei greșeli, fiecare trăsătură din compararea mașinilor, fiecare etichetă de canal;
- că fiecare mesaj **se analizează** corect, în fiecare limbă;
- că fiecare traducere **păstrează valorile și alegerile mesajului englez** (nicio valoare adăugată sau pierdută; fiecare `select` își păstrează cuvintele);
- că fiecare limbă are **fiecare** mesaj englez și că mulțimea limbilor traduse este exact lista de mai sus;
- că un mesaj este spus în limba aleasă și revine la engleză.

### Corectarea unei traduceri {#correcting-a-translation}

Corecturile unui vorbitor nativ sunt binevenite - fiecare este o linie de JSON.

1. Găsește mesajul: caută în cataloagele engleze (`src/i18n/locales/en/`) textul pe care îl vezi în engleză (comută lista de limbi pe engleză ca să-l citești) și notează cheia.
2. Deschide aceeași parte în limba ta, de exemplu `src/i18n/locales/de/race-ui.json`, și schimbă valoarea acelei chei. Păstrează fiecare `{nume}` din ea, păstrează cuvintele `select`, scrie ramurile de plural de care are nevoie limba ta:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Rulează `npm test` (sau doar `npx vitest run src/i18n`): testele spun dacă a lipsit o valoare sau o alegere ori dacă un mesaj nu mai se analizează.
4. Cu serverul de dezvoltare pornit, schimbarea apare după ce schimbi limba (sau reîncarci pagina).

**Adăugarea unui mesaj** (în cod): adaugă-l mai întâi în partea engleză, apoi în fiecare altă limbă (testele eșuează până când fiecare îl are).

**Adăugarea unei limbi**: adaugă-o în `LANGUAGES` din `languages.ts` (eticheta ei BCP 47 și numele ei propriu, plus un alias sau un locale `Intl` dacă este nevoie) și un dosar `src/i18n/locales/<etichetă>/` cu toate părțile.
