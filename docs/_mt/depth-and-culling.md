---
title: "Fond u culling"
parent: "Modi tas-sħana"
nav_order: 4
lang: "mt"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Fond u qtugħ

Il-fond jagħmel li għoljiet u ħitan jaħbu s-sħana warajhom, bħalma ħajt veru jaħbi persuna. Il-qtugħ skont id-distanza iżomm biss is-sħana bejn distanza viċina u distanza 'l bogħod mill-kamera.

![Kamera baxxa wara għolja, b'Aħbi wara t-terren mitfi (xellug) u mixgħul (lemin)](../assets/img/en/depth-and-culling-terrain.webp)

![Qtugħ skont id-distanza b'Bogħod fuq 400 m u Aqta' l-livell ukoll mixgħul: biċċa mill-mappa madwar il-kamera](../assets/img/en/depth-and-culling-far.webp)

Mingħajr fond, mappa tas-sħana fuq [livell](levels.md) 3D hija saff ċatt: kollox li fih is-settijiet tad-dejta jiddi minn kull ħajt bl-intensità sħiħa, is-siment tal-fond li l-livell jipprovdi jitħassar, u punt sħun ġewwa bini jidher daqs wieħed ma' dak fuq is-saqaf tiegħu. It-taqsima **Fond** tagħmel li l-livell jaħbi dak li hu wara tiegħu; **Qtugħ skont id-distanza** jillimita s-sħana għal qoxra jew lastra madwar il-kamera; l-[Qtugħ](slice.md) jaqta' lastra mid-dinja. It-tlieta japplikaw għall-modi tas-sħana u jbiddlu liema ringieli jikkontribwixxu, għalhekk meta jinbidlu l-akkumulazzjoni terġa' tibda.

## Fond {#depth}

Iż-żewġ kontrolli jeħtieġu [livell](levels.md) - immaġni ta' mappa jew mudell 3D. Mingħajr livell mgħobbi m'hemmx x'jinħeba wara, u ma jagħmlu xejn. It-tnejn huma mitfija meta [Iċċattja fuq il-pjan tal-art](sprite-shape.md#flatten-onto-ground-plane) tkun mixgħula.

### Aħbi wara t-terren {#hide-behind-terrain}

**Aħbi wara t-terren** (default mixgħul): punt tad-dejta li l-wiċċ l-iktar qrib tiegħu lejn il-kamera hu l-*art* (mhux struttura) jitwarrab għal kollox, mhux jiddi biss.

It-terren u l-ħitan huma opachi b'modi differenti. Tħares *mill-ħajt* apposta, biex tara liema sular kien fih it-traffiku; qatt ma tridx tħares mill-għolja, għax wara waħda hemm in-naħa l-bogħod tal-mappa - li fuq mappa ta' kilometri hi l-biċċa l-kbira tad-dejta, u l-ammonti tagħha f'linja fl-orizzont jiffurmaw fasxa iktar brillanti minn kollox fil-quddiem. Dimmer wieħed ma jistax jaqdi t-tnejn, allura t-terren jingħata qtugħ u l-ħitan iżommu d-dimmer aktar 'l isfel.

### Moħbi wara l-ġeometrija {#hidden-behind-geometry}

**Moħbi wara l-ġeometrija** (default 0.8): kemm punt tad-dejta wara ġeometrija tal-livell jiġi mdgħajjef. Il-valur jaqra *juri permezz* f'0, *N% iktar dim* f'nofs (il-pożizzjoni tal-slider, mhux id-dimming imkejjel), *moħbi għal kollox* f'1.

Kull ħajt jew art bejn punt u l-kamera tniżżel il-dawl tiegħu iktar: ħajt wieħed iħalli ftit f'mija bid-default, u kull wiċċ żejjed jaqsam għal nofs dak li jibqa', sa erba' wiċċiet. Fuq 1 ebda ġeometrija warajha ma titpitter, u dak hu l-issettjar l-irħas.

Ara wkoll [Id-dehra tal-livell](level-appearance.md).

## Qtugħ skont id-distanza {#distance-culling}

**Qtugħ skont id-distanza** (magħluq b'default) jillimita s-sħana għal ringieli bejn limitu viċin u limitu 'l bogħod mill-kamera. Ħalli limitu 'l bogħod biex taqra d-densità ġewwa bini mingħajr in-naħa l-bogħod tal-mappa tgħaqqad fuqu; ħalli limitu viċin biex tgħaddi *minn* punt sħun minflok ma tidħol fih.

| Kontroll | Default | Firxa (jog) | Tifsira |
|---|---|---|---|
| **Viċin** | mitfi | 0.5-5000 m, logaritmika, l-5% t'isfel tal-binarju = mitfi (200,000) | Ringieli iqrib minn dan jitħallew barra. |
| **Bogħod** | mitfi | 1-200,000 m, logaritmika, isfel = mitfi (10,000,000) | Ringieli iktar 'il bogħod minn dan jitħallew barra. |
| **Aqta' f'pjan** | mixgħul | | Ikkejjel il-limiti fuq l-assi tal-veduta minflok mill-għajn, sabiex il-qtugħ ikun pjan parallel mal-iskrin minflok sfera madwarek. Il-bordura ta' sfera titlaq 'l barra fuq il-frame u titbiegħed kull meta tduwwar; pjan jibqa' fejn tpoġġih. |
| **Aqta' l-livell ukoll** | mixgħul | | Aqta' l-art, l-istrutturi u l-ilma fl-istess limiti. Bil-livell sħiħ, il-qtugħ jneħħi l-punti tad-dejta u jħalli l-bini wieqaf quddiemhom; bit-tnejn maqtugħin, huwa taqsima mill-mappa u l-punti jinsabu kontra l-ħitan u s-sulari tagħhom. Dan jerġa' jpitter biss; ma jerġax jibda l-akkumulazzjoni. |

### It-tastiera {#keyboard}

Il-limitu 'l bogħod hu kontroll li tgħaddi bih - immexxih minn ġewwa bini u ara f'liema sular jidher it-traffiku - għalhekk hu fuq it-tastiera waqt li titlaq ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tasta | Effett |
|---|---|
| `]` | Ittella' l-limitu 'l bogħod 'il barra b'fattur 1.12 (Shift: 1.35) |
| `[` | Iġibu lura 'l ġewwa bl-istess fattur |
| `\` | Itfa' l-limitu 'l bogħod, jew terġa' tixgħelu fid-distanza fejn ħallejtu (6000 l-ewwel darba) |

Il-passi huma ġeometriċi għax il-firxa utli tkopri erba' ordnijiet ta' manjitudni, minn kamra sa mappa. It-tastiera żżomm il-limitu 'l bogħod bejn 100 u 400,000. It-tasti ma jagħmlu xejn meta kaxxa tat-test jew menu jkun fokus.

## Għall-iżviluppaturi {#for-developers}

### Aħbi wara t-terren {#hide-behind-terrain}

L-istrutturi jinġibdu f'texture tal-fond tagħhom stess. Fragment li jinsab wara l-fond tax-xena imma *mhux* wara l-fond tal-istrutturi jkun wara l-art, u jitwarrab. Jiswa passaġġ wieħed tal-fond fuq l-istrutturi, li jitneħħa meta l-iswiċċ ikun mitfi.

### Moħbi wara l-ġeometrija {#hidden-behind-geometry}

Jitkejjel **għal kull wiċċ**. Paragun wieħed tal-fond jista' jgħid biss "hemm xi ħaġa quddiem", allura punt wara ħajt wieħed u punt erba' kmamar ġewwa bini jiddu bl-istess mod u l-interjur jaqra bħala tebqa' ħafifa waħda. Minflok, il-ġeometrija tal-istrutturi tiġi **depth-peeled** f'sa 3 saffi oħra ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); kull fragment jgħodd kemm hemm wiċċ quddiemu (il-fond tax-xena stess flimkien mas-saffi mqaxxra: sa erba'), u d-dimming jitgħaqqad:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Slider | 1 wiċċ | 2 | 3 | 4 |
|---|---|---|---|---|
| 0.5 | 25% | 12.5% | 6.25% | 3.1% |
| 0.8 (default) | 4% | 2% | 1% | 0.6% (sogħba) |
| 1.0 | mhux mpitter | mhux mpitter | mhux mpitter | mhux mpitter |

Għaliex żewġ fatturi: l-slider hu kkalibrat biex ħajt wieħed iħalli ftit f'mija - l-aspett li jaqra bħala "wara xi ħaġa" - u ftit f'mija mgħaqqda tkun xejn sa t-tielet ħajt; in-nofs għal kull wiċċ żejjed iżomm erba' passi li jinftehmu. Għaliex kwadrat: lineari jħalli qasam issaturat issaturat wara ħajt; ir-raba' qawwa tħassarha f'0.8. Għaliex sogħba: li taħbi s-sħana mgħoddija għal kollox tagħmel kamra mimlija traffiku moħbi tidher bħala kamra vojta, bla xejn li jissuġġerixxi li tmur għall-[Qtugħ](slice.md). Biss slider miżmum fuq 1 jaħbiha għal kollox - u dan hu l-issettjar l-irħas, għax punti mgħottija mbagħad jitwarrbu.

Kif ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), ix-shaders tas-sħana tal-punti): il-paragun isir għal kull fragment, kontra l-texture tal-fond tax-xena, fil-**fond tat-tieqa** minflok id-distanza tad-dinja. Fetch ta' texture tal-fond fil-vertex stage jaqra "'l bogħod" kullimkien f'xi drivers (fost oħrajn ir-rasterizer software ta' ANGLE), u li tgħaqqad iż-żewġ fondi f'metri titlef is-separazzjoni għall-preċiżjoni meta l-firxa near/far tkun wiesgħa. Il-bias hu raġġ sprite wieħed maħdum f'unitajiet tat-tieqa flimkien ma' ftit bits l-inqas sinifikanti, sabiex punt tad-dejta li jkun fuq wiċċ ma jagħmlx lilu nnifsu ombra.

L-istrutturi jinġibdu trasparenti, imma jinġibdu fil-fond li l-okkluzjoni taqra; livell li l-istrutturi tiegħu ma kinux laħqu t-texture tal-fond jkun okkluż biss kontra l-art.

### Qtugħ skont id-distanza {#distance-culling}

Iż-żewġ limiti jiġu evalwati fil-vertex shader, għalhekk ringiela maqtugħa tiswa vertex wieħed u ebda fragment.
