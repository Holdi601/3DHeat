---
title: "Lingwi"
nav_order: 17
lang: "mt"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Lingwi

Il-viewer jista' jitkellem bil-lingwa tiegħek: kull buttuna, nota u messaġġ, u kull sentenza tal-analiżi tal-ġirja u tal-partita, juru bil-lingwa li tagħżel. Jaf 40, u jibda bil-lingwa tal-browser tiegħek meta jkun jafha.

L-lingwi statali kollha tal-Ewropa huma hawn (il-24 tal-UE, u n-Norveġiż, l-Islandiż, l-Ukrain, ir-Russu, il-Belarussu, is-Serb, il-Bosnjak, il-Maċedonjan, l-Albaniż, it-Turk, il-Lussemburgiż u l-Katalan), flimkien mal-Ġappuniż, il-Korean, u ċ-Ċiniż simplifikat u tradizzjonali. Il-lista sħiħa: [Lista tal-lingwi](ref-languages.md).

L-Ingliż hu s-sors li minnu jinġibdu t-traduzzjonijiet l-oħra, u dak li messaġġ nieqes jerġa' jieħu.

## Ibdel il-lingwa {#change-the-language}

1. Iftaħ il-lista tal-għażla ħdejn l-isem fuq nett tal-barra tal-ġenb. L-ewwel ħaġa fiha hi **Awtomatiku - <lingwa>** (dik tal-browser, kif tinstab issa); imbagħad kull lingwa bl-isem tagħha stess, sabiex tkun tista' ssib tiegħek anki meta ma tistax taqra dik murija.
2. Agħżel waħda. Tinbidel minnufih u tinżamm f'dan il-browser. Agħżel *Awtomatiku* biex titlef l-għażla.

F'tieqa privata jew meta l-ħażna tkun imblukkata, l-għażla tdum sakemm il-paġna tingħalaq.

Dak li jagħmel it-tibdil:

- kull tikketta, nota u messaġġ jerġa' jinbena bil-lingwa l-ġdida;
- l-analiżi tal-ġirja titħadem **mill-ġdid** fiha (is-sentenzi tagħha jinbnew mill-kejl, mhux jitterġmu wara), l-igrieghat demo jinbdlu isimhom, u l-grafiċi jerġgħu jinġibdu;
- in-numri, il-listi u l-pluraliżmi jsegwu l-lingwa l-ġdida.

## B'liema lingwa jibda {#which-language-it-starts-in}

1. Il-lingwa **magħżula** f'dan il-browser, jekk hemm waħda (miżmuma f'`localStorage` taħt `heat3d.language`).
2. Inkella dik **tal-browser**: l-ewwel waħda ta' `navigator.languages` li l-viewer jitkellem. Tag jitqabbel permezz tal-parti tal-lingwa tiegħu (`de-AT` → `de`), bl-aliases: `nb` u `nn` → Norveġiż (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` u kull tag bl-iscript `Hant` → Ċiniż tradizzjonali; `zh-Hans`, `zh-CN`, `zh-SG` u `zh` oħra → Ċiniż simplifikat; `cnr` (Montenegrin) → Serb.
3. Inkella **Ingliż**.

L-`<html lang>` tal-paġna jiġi mmarkat bil-lingwa li titkellem.

## Numri, listi u pluralijiet {#numbers-lists-and-plurals}

In-numri, il-listi u l-pluralijiet fit-test tal-viewer jinkitbu bil-mod tal-lingwa ("3.5" jew "3,5", "a, b u c"). Tikketti itwal mill-Ingliż jinqasmu fl-aħħar tal-linja, b'hyphen fejn il-lingwa tippermetti, minflok ma joħorġu barra mill-barra tal-ġenb. Isimijiet ta' ringieli fil-grafiċi li huma twal wisq jitqatgħu b'ellipsis u jidhru sħaħ meta toqgħod fuqhom.

In-numri li tikteb f'kaxxa jistgħu jużaw jew punt jew virgola.

## Għat-traduttturi u l-iżviluppaturi {#for-translators-and-developers}

Il-kodiċi: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Kif jinkitbu n-numri, il-listi u l-pluralijiet {#how-numbers-lists-and-plurals-are-written}

- **Numri** b'deċimali (`num`) jużaw is-sinjal deċimali tal-lingwa u **ebda qsim tad-diġits** - distanza ta' 3108 m tibqa' numru wieħed f'kull lingwa.
- **Numri sħaħ li huma għadd jew daqsijiet** (`int`) jużaw il-qsim tad-diġits tal-lingwa.
- **Listi** (`list`) jingħaqdu bil-mod tal-lingwa: "a, b u c", "a, b jew c", jew wieħed wara l-ieħor bis-separatur tal-lingwa stess (il-messaġġ `common.listSeparator`: ", " bl-Ingliż, "、" bil-Ġappuniż u t-tnejn iċ-Ċiniżi).
- **Pluralijiet** jsegwu r-regoli tal-lingwa stess permezz ta' `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Il-locale mitlub minn `Intl` hu t-tag tal-lingwa, ħlief fejn it-tag waħdu jiġbed regoli ta' pajjiż ieħor: il-Portugiż hu `pt-PT` (il-plural tal-Brażil iqis 0 bħala one), in-Norveġiż `nb`, iċ-Ċiniż simplifikat `zh-CN`, iċ-Ċiniż tradizzjonali `zh-TW`.

### Il-katalogi {#the-catalogs}

`src/i18n/locales/<language>/<part>.json`, fajl wieħed għal kull parti tal-viewer, l-istessi partijiet f'kull lingwa.

Hemm fajl wieħed għal kull parti tal-viewer (30 illum, pereżempju `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), u kull lingwa għandha l-istess sett. Il-folder jelenkahom kollha.

Kull fajl hu oġġett JSON wieħed: iċ-ċavetta miktuba sħiħa (`"race.ui.laps.load"`), il-messaġġ bħala l-valur tagħha. L-Ingliż jinħuż mal-viewer; kull lingwa oħra tinġieb meta tintgħażel.

**Tfittxija:** il-messaġġ tal-lingwa kurrenti, inkella dak Ingliż, inkella iċ-ċavetta innifisha (fl-iżvilupp il-console tgħid "i18n: no message …"). Messaġġ li ma jinfurmatx jerġa' jieħu l-Ingliż, għalhekk traduzzjoni ħażina qatt ma tkisser il-viewer.

#### Is-sintassi tal-messaġġ {#the-message-syntax}

Il-parti tas-sintassi tal-messaġġi ICU li l-viewer juża:

| Forma | Eżempju | Tifsira |
|---|---|---|
| `{name}` | `{file} has no rows` | valur imqiegħed kif inhu |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | il-fergħa għan-numru taħt ir-regoli tal-plural tal-lingwa, jew `=0`, `=1` eżatt …; `#` hu n-numru miktub bil-mod tal-lingwa |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | il-fergħa għal kelma |

Il-fergħat jistgħu jkunu fi fergħat oħra, u kull `plural` u `select` irid ikollu fergħa `other`. Differentement mill-ICU sħiħ, **l-apostrofu hu biss apostrofu** - ismijiet ta' karozzi u pussessivi Ingliżi jimtlew bihom - għalhekk ebda ħaġa ma teħtieġ ikwotazzjoni. Parentesi `{` jew `}` litterali ma jistgħux jinkitbu.

Messaġġi b'valuri li traduzzjoni trid iżżomm: l-ismijiet fil-parentesi jimtlew mill-kodiċi; il-kliem ta' `select` huma dak li l-kodiċi jagħżel bih (`crash`, `onto-straight`, `yes`/`none`) u jridu jibqgħu kif inhuma bl-Ingliż; il-kategoriji tal-plural jistgħu jinbidlu (lingwa tuża l-tagħha: il-Pollakk `one`, `few`, `many`, `other`; il-Ġappuniż biss `other`).

### Kif saru t-traduzzjonijiet, u t-testijiet {#how-the-translations-were-made-and-the-tests}

It-traduzzjonijiet saru b'mudell tal-AI mill-Ingliż, b'glossarju ta' termini tal-logħba tal-karozzi, u t-testi tal-ġirja ġew moqrija darba oħra bil-valuri mimlija. Korrezzjonijiet minn dawk li jitkellmu l-lingwa huma milqugħa (hawn taħt).

`src/i18n/i18n.test.ts` jiċċekkja:

- li kull messaġġ li l-kodiċi jitlob jeżisti bl-Ingliż - kull sejħa `t('…')`, u kull ċavetta miżmuma f'tabella u mgħoddija lil `t()` aktar tard (ċwievet li jibdew bl-isem ta' parti, bħal `app.` jew `heat.`);
- li l-messaġġi li l-kodiċi jibni mill-partijiet jeżistu: kull `label`, `short`, `count` u `here` ta' żball, kull karatteristika ta' paragun tal-karozzi, kull tikketta ta' kanal;
- li kull messaġġ **jiġi pparsjat**, f'kull lingwa;
- li kull traduzzjoni **iżżomm il-valuri u l-għażliet tal-messaġġ Ingliż** (ebda valur miżjud jew mitluf; kull `select` iżomm il-kliem tiegħu);
- li kull lingwa għandha **kull** messaġġ Ingliż, u li s-sett tal-lingwi tradotti hu eżattament il-lista ta' hawn fuq;
- li messaġġ jingħad fil-lingwa magħżula u jerġa' jieħu l-Ingliż.

### Il-korrezzjoni ta' traduzzjoni {#correcting-a-translation}

Korrezzjonijiet minn min jitkellem il-lingwa huma milqugħa - kull wieħed hu linja JSON waħda.

1. Sib il-messaġġ: fittex fil-katalogi Ingliżi (`src/i18n/locales/en/`) it-test li tara bl-Ingliż (aqleb il-picker għall-Ingliż biex taqrah), u innota ċ-ċavetta tiegħu.
2. Iftaħ l-istess parti fil-lingwa tiegħek, pereżempju `src/i18n/locales/de/race-ui.json`, u ibdel il-valur ta' dik iċ-ċavetta. Żomm kull `{name}` fih, żomm il-kliem tal-`select`, u kiteb il-fergħat tal-plural li l-lingwa tiegħek teħtieġ:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Ħaddem `npm test` (jew sempliċiment `npx vitest run src/i18n`): it-testijiet jgħidu jekk valur jew għażla tkun intilfet jew jekk messaġġ ma għadux jiġi pparsjat.
4. Bis-server tal-iżvilupp mixgħul, il-bidla tidher wara li tibdel il-lingwa (jew terġa' tgħabbi l-paġna).

**Iż-żieda ta' messaġġ** (fil-kodiċi): żidu lill-parti Ingliża l-ewwel, imbagħad lil kull lingwa oħra (it-testijiet jaqgħu sakemm kull waħda jkollha).

**Iż-żieda ta' lingwa**: żidha ma' `LANGUAGES` f'`languages.ts` (it-tag BCP 47 tagħha u l-isem tagħha stess, u alias jew locale ta' `Intl` jekk hemm bżonn), u folder `src/i18n/locales/<tag>/` bil-partijiet kollha.
