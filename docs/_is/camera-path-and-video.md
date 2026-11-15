---
title: "Myndavélarleið og myndband"
nav_order: 15
lang: "is"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Myndavélarleið og myndband

Gerðu kvikmynd af gögnunum þínum: þú setur myndavélina á fáa staði og skoðarinn flýgur á milli þeirra og vistar myndband. Hver rammi er mjög hreinn, án kornótts. Myndavélin og spilunarhausinn hreyfast saman, svo sama spjald býr líka til tímaraffskotið ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Búðu til flugferð {#make-a-flythrough}

1. Fljúgðu þangað sem myndin byrjar og ýttu á **Bæta við lykilramma hér** í **Myndavélarleið og myndgerð**.
2. Fljúgðu á næsta stað og ýttu aftur á hann. Endurtaktu fyrir hvern stoppistað.
3. Hakaðu við **Forskoða eftir leiðinni** og dragðu **Staða á leiðinni** til að athuga hreyfinguna.
4. Stilltu **Lengd** (hversu langt myndbandið er). Hreyfing sem er rétt en of snögg þarf aðeins lengri lengd.
5. Ýttu á **Búa til myndband**. Bíddu eftir framvindulínunni; skráin er sótt þegar henni lýkur.

![Spjaldið Myndavélarleið og myndgerð með þremur lykilrömmum, mjúkri brúun, 12 s, 30 fps og 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Lykilrammar {#keyframes}

| Stilling | Áhrif |
|---|---|
| **Bæta við lykilramma hér** | Bætir núverandi stöðu myndavélar, stefnuhorni (yaw), hallahorni (pitch) og sjónsviði við sem lykilramma. |
| **Hreinsa** | Fjarlægir alla lykilramma. |
| Listi lykilramma | Ein röð fyrir hvern lykil: númer hans (smelltu til að fljúga myndavélinni þangað, og stilla sjónsviðið líka), staða, `yaw° / pitch°`, og **×** til að fjarlægja hann. |

Lyklar eru settir **jafnt** á eðlilegan ás leiðarinnar frá 0 til 1 í hvert sinn sem einn bætist við eða er fjarlægður; úttakslengdin teygir síðan alla hreyfinguna, svo skot sem er rétt en of snögg þarf aðeins lengri lengd. Stefnuhornið er losað á milli lykla svo myndavélin snúist stystu leið.

Án lykilramma heldur myndgerð núverandi myndavél kyrri í allt myndskeiðið - fullkomlega gott tímaraffskot.

## Stillingar leiðar {#path-settings}

| Stilling | Sjálfgefið | Svið (sleði) | Merking |
|---|---|---|---|
| **Brúun** (2+ lyklar) | *Mjúk* | *Mjúk* / *Bein* | *Mjúk*: þriðja stigs Hermite-ferill í gegnum lykla, með snertilum frá nágrannalyklum, svo hraðinn passar yfir hvern lykil og enginn kippur er þar sem hlutar mætast. *Bein*: beinar línur milli lykla, fyrirsjáanlegar, með sýnilegu horni við hvern lykil. Sjónsvið er alltaf brúað línulega. |
| Ferðalína (2+ lyklar) | | | `N einingar af ferð - M á sekúndu við þessa lengd`, eða athugasemd um að allir lyklar séu á einum stað. |
| **Forskoða eftir leiðinni** (1+ lyklar) | slökkt | | Stýrir myndavél sýnisins eftir leiðinni, og færir spilunarhausinn með henni eins og myndgerðin gerir, svo hægt sé að dæma hreyfinguna áður en hún er gerð. |
| **Staða á leiðinni** (meðan forskoðað er) | 0% | 0-100% | Hvar á leiðinni á að forskoða. |
| **Lengd** | 12 s | 1-120 s (3600) | Lengd myndbandsins. |
| **Rammatíðni** | 30 fps | 6-60 (240) | |
| **Bitahraði** | 16 Mbps | 1-60 Mbps, lógaritmískt (400) | Hitahallar fá rendur við lágan bitahraða: lítið er þá af smáatriðum sem kóðarinn getur falið villur á bak við. |
| **Biðþak samleitni** | 240 rammar | 2-600 (10.000) | Lengst sem einn úttaksrammi má bíða eftir að verða nákvæmur. Rammar sem ná þakinu eru samt skrifaðir og taldir. |
| Samantekt | | | `N rammar · gluggi: uppsafnað/fast/líftími`, og þegar tímalínan er í Allt-ham: *(myndgerðin skiptir Allt yfir í Spila svo spilunarhausinn merki eitthvað)*. |
| **Búa til myndband** / **Hætta við** | | | Ræsir myndgerðina; meðan hún keyrir sýnir hún `rammi i / n · beðið w · X MB` og hversu margir rammar voru ekki nákvæmir. Krefst gagnasafns. |

## Ábendingar {#tips}

- Stærð úttaks er stærð striga í tækjapixlum (pixlahlutfall skjásins, takmarkað við 2). Breyttu stærð vafragluggans til að breyta henni.
- Uppsöfnuð saga byggir hitann upp yfir myndskeiðið; gluggi eða líftímasaga sýnir hreyfanlega sneið af tíma.
- Staða lykla eru skjáhnit: með [snúnum heimsás](camera.md#invert-world-axis) benda lyklar sem gerðir voru áður en skipt var á honum á annan stað eftir það.

## Fyrir forritara {#for-developers}

### Hvað myndgerð gerir {#what-a-render-does}

1. Tekur prófunarmynd af rammanum til að læra nákvæma úttaksstærð í tækjapixlum.
2. Velur kóðara í gegnum WebCodecs: **VP9** (`vp09.00.10.08`), annars **VP8**, á völdum bitahraða og rammatíðni. Án `VideoEncoder` hættir hún með *Þessi vafri hefur engan VideoEncoder - WebCodecs er nauðsynlegt til að skrifa myndband*; án hvors kóðara, *Enginn studdur myndbandskóðari (reyndi VP9, VP8)*.
3. Tekur yfir stillingarnar sem myndgerð þarfnast: stöðvar spilun, slekkur á **aðlögunarhæfri heimild**, kveikir á **stigvaxandi fínpússun** og setur spritekvótann í 64M á ramma (aðlögunarhæfa heimildin verndar rammatíðnina, sem er rangt markmið hér: hún myndi lesa hvern hægan samleitandi ramma sem ástæðu til að sprauta færri röðum, sem þarf fleiri ramma til að ná samleitni), og skiptir tímalínunni úr **Allt** í **Spila**. Sögustillingin (uppsafnað, gluggi, líftími) er látin vera: myndgerð á að vera það sem þú varst að horfa á, spilað í gegn og skrifað niður.
4. Fyrir hvern úttaksramma *f* af *n*, þar sem *u* = f / (n - 1):
   - setur myndavélina í stöðu leiðarinnar við *u* (ef lyklar eru til);
   - leitar spilunarhausinum að sama hluta *u* af bili tímalínunnar (valin lota í kassaendurspilun);
   - neyðir fram nýtt mat, jafnvel þótt myndavélin hafi ekki hreyfst - að erfa uppsöfnun fyrri ramma myndi skilja eftir draug af fyrri glugganum;
   - bíður, ramma fyrir ramma, þar til myndin er nákvæm (allar frambjóðendaraðir teiknaðar í einum ramma, eða uppsöfnun lokið), upp að biðþakinu;
   - grípur samsetta rammann og kóðar hann, með lykilramma á 2 sekúndna fresti úttaks svo skráin sé leitanleg.
5. Setur rammana í WebM-skrá ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) með tímastimplum valdir út frá rammatíðninni - veggklukkutíminn sem hver rammi tók skiptir engu máli.
6. Endurheimtir kvótann, sjónsviðið, tímalínuhaminn, spilunarhausinn og hvort var verið að spila.
7. Sækir myndbandið sem `3dheat-<width>x<height>-<frames>f.webm` og skilar `N rammar við W×H, X MB - hver rammi nákvæmur`, eða hversu margir náðu biðþakinu.

**Hætta við** stoppar eftir núverandi ramma (*Myndgerð hætt við.*) og endurheimtir stillingarnar.
