---
title: "Līmeņu bibliotēka"
parent: "Līmeņi un fona ģeometrija"
nav_order: 4
lang: "lv"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Līmeņu bibliotēka

Bibliotēka glabā jūsu līmeņus šajā pārlūkā, lai tos nevajadzētu ielādēt un vienkāršot vēlreiz. **Ja notīrīsiet vietnes datus pārlūkā, bibliotēka tiks dzēsta, un eksporta iespējas nav.** Paturiet savus oriģinālos failus.

Līmeņa apstrāde — parsēšana, klasificēšana, savienošana, decimācija, tekstūru iepakošana — ir lēna, un rezultāts ir vienāds katru reizi. **Bibliotēka** paneļa Fons / līmenis apakšā glabā apstrādātus līmeņus šajā pārlūkā, tāpēc decimēts tīkls nekad netiek veidots divreiz ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Saglabāt un ielādēt līmeni atkal {#save-and-reload-a-level}

1. Ielādējiet kartes attēlu vai 3D modeli un pārbaudiet, vai tas izskatās pareizi.
2. Nospiediet **Saglabāt bibliotēkā**. Panelis rāda *Saglabāts. Nākamreiz ielādēsies uzreiz.*
3. Nākamreiz atveriet **Bibliotēka** sarakstu un nospiediet ▸ uz līmeņa.
4. Nospiediet ✕, lai dzēstu ierakstu, kas vairs nav vajadzīgs.

## Lietošana {#using-it}

| Vadība | Iedarbība |
|---|---|
| **Saglabāt bibliotēkā** | Saglabā pašreizējo līmeni. Kartes attēls tiek glabāts kā PNG ar abiem enkuriem; modelis kā tā apstrādātie bufferi. Panelis rāda *Saglabāts. Nākamreiz ielādēsies uzreiz.* |
| Bibliotēkas saraksts | Viena rinda katram saglabātajam līmenim: nosaukums (ar tā saglabāto izmēru, uzvedot virsū), trijstūri modelim vai platums pikseļos attēlam. |
| ▸ (*Ielādēt*) | Ielādē ierakstu kā pašreizējo līmeni. |
| ✕ (*Dzēst*) | Noņem ierakstu. |
| Izmantošanas rinda | `Using X of Y.` ir pārlūka krātuves novērtējums šai vietnei. |

Ja nekas nav saglabāts, sarakstā rakstīts *Tukšs. Ielādējiet karti vai modeli un tad "Saglabāt bibliotēkā".*

## Kas tiek glabāts {#what-is-stored}

| Veids | Glabāts | Netiek glabāts |
|---|---|---|
| Kartes attēls | Attēls (PNG), tā izmērs, tā enkuri | Augstums, apgriešana, necaurredzamība, spilgtums, nokrāsas atņemšana — atjaunoti uz noklusējumiem (augstums = pašreizējās datu kopas zemākais Y, apgriešana ieslēgta) |
| 3D līmenis | Virsotnes, virsotņu krāsas, tekstūras koordinātas, to flīzes un tekstūru atlants, zemes / struktūru / ūdens trijstūri, struktūru malas, trijstūru skaits | Daļu nosaukumi un klasifikācijas iemesli, un katrs izskata iestatījums — atjaunoti uz jaunas importēšanas noklusējumiem |

Modelis, kas ielādēts no bibliotēkas, nav daļu saraksta, un tā robežas un zemes augstuma josla tiek pārrēķinātas no tā virsotnēm.

## Kur tas atrodas {#where-it-lives}

Pārlūka IndexedDB, datubāzē `3dheat`, objektu krātuvē `levels`, lapas izcelsmei (adresei pārlūka adreses joslā). Tā ir lokāla šim pārlūka profilam. Cits pārlūks, cits profils vai cita adrese (piemēram, `localhost` `127.0.0.1` vietā) redz citu, tukšu bibliotēku. Notīrot vietnes datus pārlūkā, tā tiek dzēsta. Ieraksti, kas saglabāti vecākās versijās bez struktūrām, krāsām vai ūdens, joprojām tiek ielādēti.
