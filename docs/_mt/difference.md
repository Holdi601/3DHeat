---
title: "Differenza"
parent: "Modi tas-sħana"
nav_order: 5
lang: "mt"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: true
---

# Differenza

Aħmar fejn it-tim A kien iktar, blu-aħdar fejn kien it-tim B, xejn fejn kienu ndaqs.

**Differenza** (ċavetta 2) hija sħana b'sinjal. Ringieli ta' populazzjoni waħda jiżdiedu; ringieli ta' oħra jitnaqqsu. Fejn it-tnejn jaqgħu fuq xulxin b'mod ndaqs, ir-riżultat huwa zero u kompletament trasparenti; fejn waħda tkun dominata, turi f'kuluri dik in-naħa - b'mod predefinit sħan (trasparenti → aħmar → isfar → abjad) għan-naħa **+** u friski (trasparenti → aħdar → blu → vjola) għan-naħa **−**.

![Sħana tad-differenza: aħmar fejn in-naħa + kienet iktar, aħdar u blu fejn in-naħa - kienet iktar](../assets/img/mt/difference-split.webp)

## Kif tuża dan {#how-to-use-it}

1. Agħfas `2` (jew agħżel **Differenza** fil-bar tal-modalitajiet).
2. Iftaħ **Qasma tad-differenza** fis-sidebar.
3. Agħżel x'tuża biex **Taqsam skont**: normalment *Gruppi*.
4. Poġġi grupp wieħed (jew valur) fuq **+** u ieħor fuq **−**.
5. Aqra l-kuluri: is-sħan ifisser in-naħa +, il-friski ifisser in-naħa −. Il-pannell iwissi jekk naħa waħda m'għandhiex ringieli (ara [Messaġġi li tista' tara](#messages-you-may-see)).

*Liema żewġ populazzjonijiet* hija l-mistoqsija kollha, għalhekk il-qasma tista' tkun kwalunkwe kolonna miżmuma, mhux biss gruppi. Ringieli li jaqgħu **fl-ebda naħa** jitħallew barra, mhux jitqiesu bħala zero: dan hu li jagħmel qasma fuq żewġ valuri minn ħafna tqabbel eżattament dawk iż-żewġ valuri, u tgħaqqad ma' [il-filtri](filters.md) - iffiltra sa mappa waħda, imbagħad aqsam dik skont il-build.

Il-modalità teħtieġ żewġ naħat: kolonna ta' grupp b'mill-inqas żewġ gruppi, jew qasma fuq kolonna miżmuma għall-filtrar. Fuq data b'anqas minn żewġ gruppi, tagħbija tibda b'qasma ta' kolonna - l-kolonna *Fajl tas-sors* ta' tagħbija b'ħafna fajls l-ewwel, altrimenti l-ewwel kolonna kategorika b'żewġ valuri, altrimenti l-ewwel kolonna numerika b'medda - sabiex *qabbel żewġ tagħbijiet* jaħdem fuq data mingħajr gruppi. Biss data mingħajr xejn minn dan tħalli l-modalità griża; hekk ukoll qasma ta' kolonna mħallija bl-ebda ħaġa fuq naħa waħda.

## Il-pannell tal-Qasma tad-differenza {#the-difference-split-panel}

Jidher fil-modalità Differenza, taħt il-pannelli tas-sħana.

**Aqsam skont** joffri:

| Għażla | Kif tidher | Regola tal-qasma |
|---|---|---|
| Gruppi | *Grupp (N)* (meta hemm kolonna ta' grupp) | Kull grupp fuq +, − jew xejn, imwaħħal fil-[Lista tat-timijiet](teams-list.md) |
| Kolonna kategorika | *kolonna (N valuri)* | Valuri fuq +, − jew xejn |
| Kolonna numerika | *kolonna (numerika)* | Medda ta' valuri għal kull naħa |
| Il-fajl ta' oriġini | *Fajl tas-sors - qabbel żewġ tagħbijiet* (meta tħabbew diversi fajls) | Fajls fuq +, − jew xejn |

Jiġu offruti biss kolonni mħallija taħt *Żomm għall-filtrar* fil-ħin tat-tagħbija.

### Qabbel proporzjonijiet, mhux għadd {#compare-shares-not-counts}

**Qabbel proporzjonijiet, mhux għadd** (mitfi b'mod predefinit) jiżen kull naħa b'wieħed fuq l-għadd ta' ringieli tagħha, sabiex naħa b'ħames darbiet ir-ringieli ma tirbaħx bin-numri biss. Il-kulur imbagħad juri fejn kull naħa hija iktar komuni proporzjonalment mill-oħra. Uża dan meta ż-żewġ naħat ikollhom ammonti differenti ħafna ta' data, pereżempju żewġ sessjonijiet b'tul differenti.

### Messaġġi li tista' tara {#messages-you-may-see}

Il-pannell iwissi meta l-istampa ma tkunx differenza vera:

| Messaġġ | Tifsira |
|---|---|
| *N + / M −* (jew *N + / M − / K ma nużawx*) | Kemm hemm valuri f'kull naħa (u fl-ebda naħa). |
| Ebda ringiela fil-medda mhi fuq in-naħa **+** | Tinżel biss in-naħa **−**. Mexxi l-medda tal-timeline jew ibdel il-qasma. |
| Ebda ringiela fil-medda mhi fuq in-naħa **−** | Tinżel biss in-naħa **+**. |
| Ebda valur mhu fuq xi naħa | Id-differenza ma tpingi xejn. Poġġi mill-inqas valur wieħed fuq **+** jew **−**. |
| *kolonna* ma tistax tinqasam b'dan il-mod | Il-kolonna magħżula ma taqbilx mal-qasma. Agħżel il-kolonna mill-ġdid. |
| Il-kolonna tal-qasma ma daħlitx fil-memorja tal-GPU għal N minn M biċċiet | Dawk ir-ringieli ma jinżlux. Ogħla l-baġit tal-GPU taħt Prestazzjoni → Baġits tar-riżorsi, jew tella' inqas ringieli. |

### Bil-grupp {#by-group}

Il-pannell jindika biss lill-[Lista tat-timijiet](teams-list.md), fejn kull grupp għandu buttuna **+** u **−**. Fuq kull tagħbija, l-ewwel nofs tal-gruppi (arrotondat 'il fuq) jitpoġġew fuq +, il-bqija fuq −; **Aqsam indaqs** fil-Lista tat-timijiet jagħmel l-istess mill-ġdid. Grupp fuq l-ebda naħa, jew moħbi bil-kaxxa tiegħu, ma jikkontribwixxix xejn.

### Bil-valuri tal-kategorija {#by-category-values}

| Parti | Tifsira |
|---|---|
| `a + / b − / c ma nużawx` | Kemm hemm valuri f'kull naħa u fl-ebda naħa. |
| **Neħħi** | Iqiegħed kull valur fuq l-ebda naħa. |
| Lista tal-valuri | Kull valur b'buttuna **+** u **−** (ikklikkja l-buttuna attiva mill-ġdid biex titneħħa minn dik in-naħa). Valur vojt jidher bħala *(nieqes)*. |
| Nota dwar il-limitu | Jinħtieġu biss l-ewwel 200 valur: *Qed juri l-ewwel 200 minn N valur. Kolonna wiesgħa daqs din tkun aħjar li tiġi mnaqqsa bil-filtru l-ewwel, jew maqsuma skont medda jekk il-valuri tagħha huma ordnati.* |

Meta tagħżel il-kolonna, l-ewwel valur tagħha jmur fuq + u t-tieni fuq −. Meta l-ebda naħa ma jkollha valur, il-qasma terġa' tmur għall-gruppi minflok ma turi qafas vojt. *Fajl tas-sors* jaħdem bl-istess mod, valur wieħed għal kull fajl - hekk jitqabblu żewġ esportazzjonijiet, żewġ testijiet jew żewġ build.

### Bil-medda {#by-range}

| Parti | Tifsira |
|---|---|
| Indikazzjoni | Il-minimu u l-massimu tal-kolonna. |
| **Medda pożittiva (+)**, **minn** / **sa** | Ringieli b'valur f'din il-medda, inklużi t-tnejn fit-truf, jiżdiedu. |
| **Medda negattiva (−)**, **minn** / **sa** | Ringieli f'din il-medda jitnaqqsu. |
| **Aqsam fin-nofs** | Iqiegħed + għal [minimu, nofs] u − għal [nofs, massimu] - dak li jsir ukoll meta tagħżel il-kolonna. |

Valur fiż-żewġ medde jitqies bħala +. Il-medde m'għandhomx bilfors jkopru l-kolonna kollha; valuri f'ebda waħda jitħallew barra. *L-ewwel żewġ minuti kontra l-aħħar żewġ minuti* hija qasma b'medda fuq kolonna li tixbah il-ħin.

## Kuluri {#colours}

Is-sezzjoni **Kuluri tas-sħana** turi żewġ editur tar-rampa f'din il-modalità: **Pożittiva (timijiet li jżidu)** u **Negattiva (timijiet li jnaqqsu)**, kull wieħed b'buttuna ta' reset tiegħu (*Irrisettja għal trasparenti → aħmar → isfar → abjad*, *Irrisettja għal trasparenti → aħdar → blu → vjola*). Il-kompożizzjoni tieħu l-valur assolut tas-sħana netta permezz tal-[punt tas-saturazzjoni u r-rispons](colour-and-exposure.md), u tagħżel ir-rampa negattiva fejn in-netta hija taħt żero. Ara [Kulur u esponiment](colour-and-exposure.md#the-ramp-editor).

Uża r-*rispons Lineari* tad-densità meta d-daqs tad-differenza jimporta: hu r-rispons biss fejn kulur ugwali jfisser għadd ugwali.

## Kif taħdem {#how-it-works}

Kull ringiela tieħu sinjal ta' +1, -1 jew 0 fil-vertex shader ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 jiċħad ir-ringiela qabel ma jinżel kwalunkwe fragment.

- Bil-grupp, is-sinjal ġej minn tabella ta' 4,096 entry indiċizzata bl-ID tal-grupp tar-ringiela (l-ID tal-grupp jgħaddi fil-kanal ir-raba' tat-texel tal-pożizzjoni tar-ringiela).
- Bil-kategorija, is-sinjal ġej minn tieni tabella ta' 4,096 entry, mimlija għal kull valur tal-kategorija, u l-valur tar-ringiela jinqara mit-texture tal-filtru tal-kolonna; valur wara t-tmiem tat-tabella jiġi miċħud fuq it-tliet backends.
- Bil-medda, il-valur tar-ringiela jitqabbel maż-żewġ medde.

Tibdil fil-qasma jerġa' jibda l-akkumulazzjoni.

**Gruppi moħbijin jibqgħu moħbijin bil-qasma kollha.** Taħt qasma b'kolonna, it-tabella tal-gruppi ma tiġix bis-sinjali; iżżomm 1 għal grupp muri u 0 għal grupp moħbi ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), u t-tnejn jaslu lill-shader flimkien - żewġ nofsijiet ta' texture tas-sinjali waħda fuq WebGL2, żewġ nofsijiet ta' buffer ta' ħażna waħda fuq WebGPU. Ringiela tinżel biss meta l-grupp tagħha jkun muri *u* il-valur tal-kolonna tagħha jkun fuq naħa. Għalhekk grupp li titneħħa mill-kaxxa fil-[Lista tat-timijiet](teams-list.md), jew li jitħalla barra mill-fokus tan-naħa tat-tab Partita, ma jikkontribwixxix xejn kif ukoll tinqasam id-differenza.
