---
title: "Sħana tat-tim"
parent: "Modi tas-sħana"
nav_order: 6
lang: "mt"
source: "team-heat.md"
source_hash: "e18e62600e3e"
translated: true
outdated: false
---

# Sħana tat-tim

Is-sħana tat-tim turi fejn kien kull tim, kull tim bil-kulur tiegħu. Fejn it-timijiet jaqbdu fuq xulxin il-kuluri jitħalltu.

**Sħana tat-tim** (ċavetta 3) huwa l-qasam tad-densità tal-[Sħana](heat.md) b'kull [grupp](glossary.md) mogħti t-ton tiegħu stess. Fejn il-gruppi jaqbdu fuq xulxin, it-toni tagħhom jitħalltu; logħba ugwali toħroġ newtrali. L-opaċità xorta tgħaddi d-densità daqs kif tagħmel fil-modi l-oħra, għalhekk l-istampa twieġeb *kemm* u *ta' min* fl-istess ħin. Teħtieġ kolonna tal-gruppi.

![Sħana tat-tim: kull naħa bil-kulur tagħha; fejn jaqbdu fuq xulxin il-kuluri jitħalltu](../assets/img/mt/heat-teams.webp)

Mhix l-[overlay tal-figuri](box-replay.md): dik tpinġi figura waħda għal kull persuna; din hija qasam tas-sħana kkuluriat bl-istess kolonna.

## Kif tużah {#how-to-use-it}

1. Agħfas `3` (jew agħżel **Sħana tat-tim** fil-mode bar).
2. Iftaħ **Kuluri tas-sħana**. Il-kwadratini juru l-kulur ta' kull grupp; ħalli l-mouse fuq kwadratin biex tara l-isem tat-tim.
3. Jekk kollox jidher griż, oġħla **Separazzjoni tal-kuluri**.
4. Neħħi l-għażla ta' grupp fil-[Lista tat-timijiet](teams-list.md) biex tħallih barra; il-kuluri l-oħra jibqgħu fejn kienu.

## Kontrolli {#controls}

Fit-taqsima **Kuluri tas-sħana**:

| Kontroll | Default | Tifsira |
|---|---|---|
| Kwadratini | | Il-kulur ta' kull grupp, għall-ewwel 12-il grupp, imbagħad *+N aktar*. Ħalli l-mouse fuqhom għall-isem tal-grupp u l-kulur. |
| **Separazzjoni tal-kuluri** | 1.4 | Kemm titbiegħed taħlita mill-newtrali, 0-4. 0 jagħmel kollox griż; 1 hija l-medja vera; wara madwar 2 it-taħlitiet l-aktar iddi'in jaqbżu l-firxa li tista' tintwera u jiġu mqaffla kanal b'kanal, u dan ibiddel it-ton tagħhom. |
| **Rampa tal-opaċità (il-kulur jiġi mill-grupp)** | ir-rampa default tas-sħana | Minnha tintuża biss l-**alpha** tar-rampa hawn: trasparenti fejn ma hemm xejn, opaka fil-quċċata. Il-kuluri tagħha jiġu injorati. |

Grupp li t-tikketta tiegħu tfisser "l-ebda grupp" (`0`, vojt, `none`, `unknown`, `null` jew `-1`) jinpinġa griż.

Il-kontrolli l-oħra kollha tas-sħana - forma, saturazzjoni, rispons, sħana minima, fond, culling - jaħdmu kif fi [Sħana](heat.md).

Il-[Lista tat-timijiet](teams-list.md) turi l-kulur tas-sħana tat-tim ta' kull grupp bħala l-kwadratin tiegħu f'dan il-mod. Meta taħbi grupp, kull grupp ieħor jibqa' bil-kulur tiegħu fejn kien: it-toni jiġu mill-għadd sħiħ tal-gruppi, mhux minn dak li hu mixgħul, għalhekk żewġ stampi jibqgħu jitqabblu.

## Għall-iżviluppaturi {#for-developers}

### Il-paletta {#the-palette}

Minn [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Il-kuluri jgħixu fuq il-pjan **Oklab** f'dawl fiss (0.7) u chroma fissa (0.115), għalhekk kull grupp huwa daqstant brillanti u grupp aħmar ma jidhirx sħun aktar minn wieħed blu.
- B'*n* gruppi, iċ-ċirku tat-ton jinqasam f'*n* partijiet ugwali u l-grupp *i* jieħu ċ-**ċentru** tal-parti tiegħu, `(i + 0.5) / n` ta' dawra. Kull tnejn mill-gruppi huma imbiegħda kemm jippermetti l-għadd, u l-oppost jibqa' oppost f'kull għadd.
- Jintużaw **16** ton differenti biss lil hinn minn hekk. Bi tnejn aktar mill-gruppi, l-ID-ijiet jitqiegħdu bi tnaqqis ripetut (ID-ijiet bit-reverse: 0, ½, ¼, ¾, ⅛, …) sabiex l-ID-ijiet ġirien ma jaqsmux ton; il-gruppi ta' wara s-16 neċessarjament jaqsmu.
- Grupp li t-tikketta tiegħu tfisser "l-ebda grupp" - `0`, vojt, `none`, `unknown`, `null` jew `-1`, mingħajr ma tagħmel attenzjoni għall-kbar u ż-żgħar - jinpinġa **griż newtrali** minflok ma jieħu biċċa miċ-ċirku. Biss l-ewwel tikketta bħal din fil-lista tal-gruppi tittratta b'dan il-mod.

Is-separazzjoni default hija 1.4 u mhux 1 għax, fuq 1, taħlita ta' ħames toni mqassma b'mod ugwali *hija* griża: korretta u mhux leġġibbli. Ftit aktar minn 1 iżomm il-pariġġi onesti filwaqt li tagħmel qsim ta' 60/40 viżibbli.

### Kif taħdem {#how-it-works}

Target tas-sħana għandu erba' kanali f'dan il-mod. Kull sprite iżid id-densità tiegħu *v* mal-ewwel kanal u *v* × il-koordinati Oklab *a* u *b* tal-grupp mat-tieni u t-tielet. Fil-ħin tal-composite t-taħlita tal-pixel hija l-medja mpiża bid-densità: *a* = G / R, *b* = B / R, imkabbra bis-separazzjoni tal-kuluri u mqalbla għal sRGB fid-dawl tal-paletta. Il-qsim bid-densità totali miksuba iżomm it-ton indipendenti minn kemm hemm dejta, u dan huwa l-għaliex kull kontroll tad-densità jibqa' jaħdem fuq l-opaċità biss.

Target bi erba' kanali jiswa erba' darbiet il-memorja tal-GPU tat-target tas-sħana b'kanal wieħed fl-istess riżoluzzjoni.
