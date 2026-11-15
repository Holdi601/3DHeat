---
title: "Gamepad i HOTAS"
parent: "Kamera i upravljanje"
nav_order: 1
lang: "bs"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad i HOTAS

Kameru možete letjeti kontrolerom u stilu Xboxa umjesto tastaturom. Koristite ga kad želite da se opustite i pogledate okolo po velikoj sceni. Njegov unos **dodaje** se tastaturnom, pa možete koristiti oboje istovremeno.

## Povežite kontroler {#connect-a-controller}

1. Priključite kontroler (ili ga upari).
2. Kliknite na pogled i pritisnite bilo koje dugme na kontroleru. Pregledači prikazuju kontroler tek nakon prvog unosa.
3. Otvorite **Kamera i scena → Kontroler**. Lista uređaja prikazuje ga sa `●`.
4. Gurnite lijevu palicu za letenje, desnu za gledanje. Ako se kamera pomjera dok su palice u sredini, povećajte **Mrtva zona**.

Svaki uređaj koji pregledač preslikava na standardni raspored gamepada radi. Palica za letenje ili gas (HOTAS) se podrazumijevano ignoriše; vidi dolje.

## Raspored {#mapping}

| Kontrola | Učinak |
|---|---|
| Lijeva palica | Kretanje: naprijed/nazad i bočno |
| Desna palica | Gledanje: zakretanje i nagib, sa *Brzina gledanja* stepeni u sekundi pri punom otklonu |
| `RT` / `LT` (analogno) | Gore / dolje; u paralelnoj projekciji, uvećavanje / umanjivanje |
| `RB` (držano) | 6× brže |
| `LB` (držano) | 15% brzine |
| `A` (držano) | 3× sprint (kombinuje se sa RB/LB) |
| `Y` (pritisak) | Uokviri podatke |

Brojevi dugmadi slijede standardni raspored: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; palice na osama 0-1 (lijeva) i 2-3 (desna).

## Postavke gamepada {#the-gamepad-settings}

U **Kamera i scena → Kontroler**. **Postavke** / **Sakrij** otvara kontrole za podešavanje.

| Kontrola | Zadano | Opseg (pomak) | Značenje |
|---|---|---|---|
| **Uključeno** | uključeno | | |
| Status uređaja | | | Svaki povezani uređaj, `●` kad se prati, `○` kad ne, uz *– nije XInput kontroler, zanemaruje se* ili *– nije XInput kontroler, ipak se koristi* za nestandardne uređaje. Ako ništa nije povezano: *Nije otkriven kontroler. Preglednici otkrivaju kontroler tek nakon što pošalje prvi unos – pritisnite neko dugme na njemu.* |
| **Koristi uređaj** | *Samo XInput kontroleri (preporučeno)* | | Prikazuje se kad je priključen nestandardni uređaj. Izaberite uređaj po imenu da ga pratite umjesto toga. |
| **Brzina gledanja** | 150°/s | 20-540 (5000) | Brzina okretanja pri punom otklonu desne palice. |
| **Mrtva zona** | 12% | 0-50% (95%) | Radijalna: dijagonalni pritisak nikad ne prelazi u samo jednu osu. Povećajte je ako se kamera pomjera dok su palice u sredini. |
| **Krivulja palice** | x² | linearno (1) do x⁴ (16) | Eksponent odziva nakon mrtve zone: finija kontrola blizu centra, a i dalje puna brzina na rubu. |
| **Obrni Y palice** | isključeno | | |
| **Zamijeni palice** | isključeno | | Kretanje na desnoj palici, gledanje na lijevoj. |

Oblikovanje palice: uz otklon *m* (dužina vektora palice) i mrtvu zonu *d*, izlaz = ((m - d) / (1 - d)) ^ krivulja duž smjera palice, a 0 unutar mrtve zone.

## Zašto su podrazumijevano samo standardni gamepadi {#why-only-standard-pads-by-default}

Gamepad API prijavljuje **svaki** HID uređaj sa osama: palice za letenje, gasove, pedale, volane. Ti uređaji ne miruju u centru: osa za uvrtanje ili poluga gasa stoje na punom otklonu kad ih niko ne dodiruje. Ako se to čita kao palica, to je stalan unos punom brzinom koji nijedna mrtva zona ne može potisnuti, pa se kamera vrti sama od trenutka učitavanja stranice (a svi režimi toplote izgledaju pokvareno, jer pokretna kamera pokreće akumulaciju iz početka pri svakoj sličici).

Zato se uređaj prati samo kad pregledač prijavi `mapping: "standard"`, što znači "gamepad u stilu XInput sa osama tamo gdje ih očekujete". Ostali uređaji se navode i označavaju kao ignorisani, a **Koristi uređaj** ih eksplicitno uključuje, na primjer za letenje kamerom sa HOTAS-om. Kad se jedan gamepad prati, kamera ostaje uz njega, pa dva kontrolera ne budu u sukobu oko kamere u zavisnosti od redoslijeda nabrajanja.

**HOTAS:** čitaju se samo ose 0-3 (dvije palice) i standardna dugmad. Gas ili pedale na drugim osama ne rade ništa, a palica ili gas čije ose ne miruju u centru mogu zahtijevati veću **Mrtvu zonu**.

Pregledači sakrivaju kontroler dok ne pošalje prvi unos, pa priključen gamepad koji se nije dodirnuo, za stranicu još ne postoji.
