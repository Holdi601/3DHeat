---
title: "Putanja kamere i video"
nav_order: 15
lang: "bs"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Putanja kamere i video

Snimi film svojih podataka: postavljaš kameru na nekoliko mjesta, prikaz leti između njih i snima video. Svaka sličica je vrlo čista, bez zrna. Kamera i pokazivač reprodukcije se kreću zajedno, pa isti panel pravi i ubrzani snimak ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Napravi let kroz prostor {#make-a-flythrough}

1. Odleti tamo gdje film počinje i pritisni **Dodaj ključni kadar ovdje** u **Putanja kamere i renderiranje**.
2. Odleti do sljedećeg mjesta i pritisni ponovo. Ponovi za svaku stanicu.
3. Označi **Pregled duž putanje** i prevuci **Položaj na putanji** da provjeriš kretanje.
4. Postavi **Trajanje** (koliko dugo traje video). Kretanje koje je tačno, ali prebrzo, treba samo duže trajanje.
5. Pritisni **Renderiraj video**. Sačekaj liniju napretka; datoteka se preuzima kada završi.

![Panel Putanja kamere i renderiranje sa tri ključna kadra, Glatkom interpolacijom, 12 s, 30 fps i 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Ključni kadrovi {#keyframes}

| Kontrola | Efekat |
|---|---|
| **Dodaj ključni kadar ovdje** | Dodaje trenutnu poziciju kamere, zakret, nagib i vidno polje kao ključni kadar. |
| **Očisti** | Uklanja sve ključne kadrove. |
| Spisak ključnih kadrova | Jedan red po kadru: njegov broj (klik da odletiš kamerom tamo, postavljajući i vidno polje), pozicija, `zakret° / nagib°`, i **×** da ga ukloniš. |

Kadrovi su **ravnomjerno** raspoređeni duž normalizovane ose putanje od 0 do 1 kad god se jedan doda ili ukloni; trajanje izlaza tada rasteže cijelo kretanje, pa kadar koji je tačan, ali prebrz, treba samo duže trajanje. Zakret se odmotava između kadrova, pa se kamera okreće najkraćim putem.

Bez ključnih kadrova, renderovanje drži trenutnu kameru nepomičnom kroz cijeli isječak - sasvim dobar ubrzani snimak.

## Postavke putanje {#path-settings}

| Kontrola | Zadano | Opseg (klizač) | Značenje |
|---|---|---|---|
| **Interpolacija** (2+ kadra) | *Glatko* | *Glatko* / *Pravo* | *Glatko*: kubična Hermitova kriva kroz kadrove s tangentama iz susjednih kadrova, pa se brzina slaže na svakom kadru i nema trzaja gdje se segmenti spajaju. *Pravo*: prave linije između kadrova, predvidljivo, s vidljivim uglom na svakom kadru. Vidno polje se uvijek interpolira linearno. |
| Linija putovanja (2+ kadra) | | | `N jedinica putovanja - M u sekundi pri ovom trajanju`, ili napomena da su svi kadrovi na jednom mjestu. |
| **Pregled duž putanje** (1+ kadar) | isključeno | | Vodi kameru prikaza po putanji i pomjera pokazivač reprodukcije s njom, kao što to radi renderovanje, pa se kretanje može ocijeniti prije renderovanja. |
| **Položaj na putanji** (dok je pregled uključen) | 0% | 0-100% | Gdje na putanji se pregleda. |
| **Trajanje** | 12 s | 1-120 s (3600) | Dužina videa. |
| **Brzina sličica** | 30 fps | 6-60 (240) | |
| **Protok** | 16 Mbps | 1-60 Mbps, logaritamski (400) | Toplotni gradijenti loše pucaju pri niskom protoku: malo je detalja iza kojeg kodek može sakriti grešku. |
| **Gornja granica čekanja konvergencije** | 240 sličica | 2-600 (10.000) | Najduže što jedna izlazna sličica može čekati da postane tačna. Sličice koje dostignu granicu se i dalje upisuju, i broje se. |
| Sažetak | | | `N sličica · prozor: kumulativan/fiksan/trajanje`, a kada je vremenska linija u režimu Sve: *(renderovanje prebacuje Sve na Reprodukciju da pokazivač reprodukcije nešto znači)*. |
| **Renderiraj video** / **Otkaži** | | | Pokreće renderovanje; dok radi, pokazuje `sličica i / n · čekano w · X MB` i koliko sličica nije bilo tačno. Traži skup podataka. |

## Savjeti {#tips}

- Veličina izlaza je veličina platna u fizičkim pikselima (odnos piksela ekrana, najviše 2). Promijeni veličinu prozora browsera da je promijeniš.
- Kumulativna historija gradi toplotu kroz isječak; historija prozora ili trajanja prikazuje pokretni isječak vremena.
- Pozicije ključnih kadrova su koordinate prikaza: uz [obrnutu osu svijeta](camera.md#invert-world-axis), kadrovi napravljeni prije promjene pokazuju na drugo mjesto poslije nje.

## Za programere {#for-developers}

### Šta radi renderovanje {#what-a-render-does}

1. Pravi probno snimanje sličice da sazna tačnu veličinu izlaza u fizičkim pikselima.
2. Bira kodek preko WebCodecs: **VP9** (`vp09.00.10.08`), inače **VP8**, pri izabranom protoku i brzini sličica. Bez `VideoEncoder` staje uz *Ovaj browser nema VideoEncoder - za pisanje videa potreban je WebCodecs*; bez oba kodeka, *Nema podržanog video kodeka (pokušano VP9, VP8)*.
3. Preuzima postavke koje renderovanje treba: pauzira reprodukciju, isključuje **prilagodljivi budžet**, uključuje **progresivno izoštravanje** i budžet sprajtova postavlja na 64M po sličici (prilagodljivi budžet štiti broj sličica, što je ovdje pogrešan cilj: svaku sporu sličicu koja konvergira čita kao razlog da se nacrta manje redova, a to traži više sličica da konvergira), i prebacuje vremensku liniju iz **Sve** u **Reprodukciju**. Postavka historije (kumulativna, prozor, trajanje) ostaje kakva jeste: renderovanje treba da bude baš ono što si gledao, proigrano i zapisano.
4. Za svaku izlaznu sličicu *f* od *n*, pri *u* = f / (n - 1):
   - postavlja kameru na položaj putanje pri *u* (ako ima kadrova);
   - pomjera pokazivač reprodukcije na isti udio *u* raspona vremenske linije (raspon izabrane sesije u reprodukciji kutije);
   - traži svježu procjenu, čak i kad se kamera nije pomjerila - nasljeđivanje akumulacije prethodne sličice ostavilo bi duh prethodnog prozora;
   - čeka, sličicu po sličicu, dok slika ne bude tačna (svi kandidatni redovi nacrtani u jednoj sličici, ili akumulacija završena), do gornje granice čekanja;
   - hvata sastavljenu sličicu i kodira je, s ključnom sličicom svake 2 sekunde izlaza da datoteka bude pretraživa.
5. Spaja sličice u WebM datoteku ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) s vremenskim oznakama izabranim iz brzine sličica - stvarno vrijeme koje je svaka sličica trajala nije bitno.
6. Vraća budžet, vidno polje, režim vremenske linije, pokazivač reprodukcije i to da li je reprodukcija tekla.
7. Preuzima video kao `3dheat-<širina>x<visina>-<sličice>f.webm` i javlja `N sličica pri W×H, X MB - svaka sličica tačna`, ili koliko ih je dostiglo gornju granicu čekanja.

**Otkaži** zaustavlja poslije trenutne sličice (*Renderovanje otkazano.*) i vraća postavke.
