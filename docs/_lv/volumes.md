---
title: "Tilpumi un salīdzināšana"
parent: "Filtri un rīki"
nav_order: 6
lang: "lv"
source: "volumes.md"
source_hash: "25cc132dbe25"
translated: true
outdated: false
---

# Tilpumi un salīdzināšana

**Tilpums** ir neredzama kaste (vai cilindrs, vai sfēra), ko zīmējat ap kādu vietu, lai uzdotu jautājumu: kas šeit notika? Izmantojiet to, lai saskaitītu nogalinājumus pie tilta, salīdzinātu divus kalnus vai parādītu aktivitāti tikai vienā apgabalā.

```
 skats no augšas          Jūs zīmējat formu ->  skaitītājs
 +------------+           saskaita, kas ir iekšpusē:
 |   ( A )    |            rindas, spēlētāji, nogalinājumi, laiks ...
 |        [B] |           Salīdziniet A ar B blakus.
 +------------+
```

![Trīs tilpumi demonstrācijas ielejā: divi cilindri ap kalniem, kaste ap ciematu](../assets/img/en/volumes.webp)

Tilpumi mēra, kas notiek iekšpusē, filtrē skatu tikai uz tiem, eksportē to rindas un var tikt salīdzināti blakus. Skatiet arī [glosāriju](glossary.md) par rindu, personu un spēli.

## Zīmējiet tilpumu {#draw-a-volume}

1. Sānjoslā atveriet **Tilpumi**.
2. Izvēlieties rīku un zīmējiet 3D skatā vai 2D kartē. Grīda un griesti sākas no zemākajiem datiem. Esc atceļ.
3. Noklikšķiniet uz tilpuma, lai to atlasītu; parādās tā **Statistika**.

| Rīks | Kā zīmēt |
|---|---|
| **Kaste** | Velciet taisnstūri (Shift: kvadrāts). Klikšķis novieto noklusējuma kasti. |
| **n-stūris** | Velciet no centra (Shift saglabā regulāru formu). *Stūri* iestata n no 3 līdz 64 (noklusējums 8, tāpēc poga rāda **8-stūris**). |
| **Daudzstūris** | Noklikšķiniet stūrus; aizveriet ar dubultklikšķi, Enter vai klikšķi uz pirmā stūra. Backspace noņem pēdējo stūri. |
| **Cilindrs** | Velciet rādiusu. |
| **Sfēra** | Velciet rādiusu; tā atrodas uz zemes. |

## Rediģēšana {#edit}

- Noklikšķiniet uz tilpuma, lai to atlasītu. Velciet tā korpusu, lai pārvietotu, stūrus, lai pārveidotu (Shift uz stūra mērogo).
- **Dzeltenie** rokturi iestata grīdu un griestus, **ciānzilais** rokturis to pagriež.
- Alt+velkot kopē, Del noņem, Ctrl+Z / Ctrl+Y atceļ un atkārto, Ctrl+D dublē. **Noņemt visu** izdzēš visus tilpumus.
- Precīzas vērtības: Grīda, Griesti, Pagrieziens / Slīpums / Ripojums (kastes), Rādiuss (sfēras, cilindri).

Katrai tilpuma rindai ir izvēles rūtiņa rādīšanai, krāsa, nosaukums, **iekļaut** vai **izslēgt**, dublēšana un dzēšana. Tilpumi tiek saglabāti pārlūkā katrai datu kopai, un **Saglabāt...** / **Ielādēt...** raksta un lasa failu `volumes.json`.

## Filtrējiet skatu {#filter-the-view}

| Filtrs | Efekts |
|---|---|
| **Rādīt visas** (noklusējums) | Tilpumi tikai mēra. |
| **Tikai iekšā** | Siltums, atkārtojums un [trāpījumu analīze](hit-analysis.md) zīmē tikai to, kas atrodas iekļautajos tilpumos un ārpus izslēgtajiem. |
| **Paslēpt iekšpusi** | Pretēji. |

GPU filtrs aptver līdz 8 tilpumiem ar 64 kontūras punktiem kopā; "!" atzīmē tilpumu, kas pāri šai robežai. Statistika un eksports to joprojām skaita.

## Statistika {#statistics}

Apgabals **Statistika** seko filtriem, laika logam un paslēptajām grupām. *Atlasīts* rāda atlasīto tilpumu, *Salīdzināt visas* novieto visus tilpumus blakus. Tas rāda:

- **Rindas iekšā (rādītās)** un **Rindas iekšā (visi dati)**, **Spēlētāji**, **Komandas**, **Spēles**, **Laiks iekšā**, **Ieejas / izejas**, **Siltuma maksimums**, **Vidējais siltums**, **Tilpums / pamatne** un **Kad** histogrammu;
- katrai kolonnai: kategorijas ar **Lift** (daļa iekšā, dalīta ar daļu visos rādītajos datos), un skaitļi ar diapazonu, mediānu un 5.-95. procentili.

**Statistika kā CSV / JSON** to saglabā. **Eksportēt datus iekšā** raksta rindas iekšā kā CSV vai Parquet (*Tikai rādītās rindas* pēc noklusējuma ieslēgts), vienu tilpumu vai visus, ar kolonnu, kas norāda, kuram tilpumam pieder katra rinda.

## Salīdziniet tilpumus {#compare-volumes}

Ar diviem vai vairāk redzamiem tilpumiem nospiediet **Salīdzināt...**.

1. Zīmējiet trīs tilpumus, piemēram, Rietumu kalns, Austrumu kalns un Ciemats.
2. Nospiediet **Salīdzināt...** zem Statistikas.
3. Sadaļā **Tabula** lasiet katras vērtības starpību no pirmā tilpuma.
4. Pārslēdzieties uz **Joslas**, lai redzētu daļas kā joslas.

![Salīdzinājuma tilpumu tabula: rindas, laiks iekšā, spēlētāji un vairāk katram tilpumam, ar starpību no pirmā](../assets/img/en/compare.webp)

| Skats | Rāda |
|---|---|
| **Tabula** | Rindas, laiks iekšā, spēlētāji, spēles, komandas, ieejas, izejas, apmeklējumi, apmeklējuma garums, nogalinājumi, nāves, nogalinājumi uz nāvi, nogalinājumi minūtē, laiks uz spēlētāju, vērtību kolonnas; grupētas pēc notikumiem, transportlīdzekļa klases, spēlētāja vai MI, komandas un virziena. Katra vērtība rāda savu starpību no pirmā tilpuma un efekta lielumu (niecīgs, mazs, vidējs, liels). Noklikšķiniet uz tilpuma virsraksta, lai kārtotu pēc attāluma no pirmā. |
| **Joslas** | Skaiti vai daļas pēc notikumiem, klases, aktora, komandas vai virziena. Noklikšķiniet uz joslas, lai filtrētu skatu uz to. |
| **Spēles laikā** | Viena diagramma katram tilpumam pār spēles minūtēm: klātbūtne, rindas vai nogalinājumi. Noklikšķiniet, lai pārietu uz to. |
| **Apmeklējumi** | Kastu un vijoļu diagrammas par to, cik ilgi ilgst apmeklējumi (logaritmiska skala). |
| **Plūsma** | Kur trases ved pēc atstāšanas katru tilpumu: pāreju matrica vai plūsmas lentes. |

![Joslu skats: notikumu veidi katrā tilpumā kā daļas](../assets/img/en/compare-bars.webp)

## Padomi {#tips}

- Sāciet no atziņas: [Atziņās](insights.md) **Tilpums šeit** pievieno cilindru ap atziņas vietu.
- **Sadalījums...** atver [Sadalījumu](breakdown.md) atlasītajam tilpumam: kas un kas labi darbojas iekšpusē.
- [Virziena siltums](directional-heat.md) var attēlot virzienus atlasītā tilpuma iekšpusē.
- [Tehnikas cilne](hit-analysis.md#restrict-to-an-area) izmanto tos pašus tilpumus kā savu apgabala filtru.
