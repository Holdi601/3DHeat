---
title: "Komandu saraksts"
parent: "Filtri un rīki"
nav_order: 2
lang: "lv"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Komandu saraksts

Panelis **Komandas** ļauj paslēpt komandu vai novietot to vienā no pusēm salīdzinājumā. Izmantojiet to, lai skatītos tikai Blue vai lai uzdotu jautājumu "kur Blue iet, kur Red neiet?".

*Grupa* ir komanda vai puse, piemēram, Blue un Red ([Grupas](sessions-persons-groups.md#group)). Panelis tiek rādīts, kad datu kopai ir grupu kolonna. Grupu skaits ir redzams tā galvenē. Cilnē Komandu siltums sānjoslā ir arī sadaļa **Komandu skats** ar saviem iestatījumiem. Šī lapa aptver sarakstu **Komandas**.

## Paslēpt komandu {#hide-a-team}

1. Atveriet **Komandas** sānjoslā.
2. Noņemiet atzīmi izvēles rūtiņā (*Redzams*) komandai, ko paslēpt. Attēls uzreiz atjaunojas.
3. Nospiediet **Rādīt visas**, lai atjaunotu katru komandu.

![Komandu saraksts: Blue 5p, Red 5p, ar Rādīt visas](../assets/img/en/teams-list.webp)

## Katra rinda {#each-row}

| Daļa | Nozīme |
|---|---|
| Izvēles rūtiņa (*Redzams*) | Rāda vai slēpj grupu. |
| Krāsas paraugs | Grupas krāsa: tās [komandu siltuma](team-heat.md) krāsa komandu siltuma režīmā, tās pamatkrāsa citos režīmos. |
| Nosaukums | Grupas etiķete (pilna etiķete, uzvedot virsū). |
| **+** / **-** (Starpības režīmā) | Novieto grupu [starpības](difference.md) pozitīvajā vai negatīvajā pusē. Noklikšķiniet uz aktīvās pogas vēlreiz, lai novietotu grupu nevienā pusē. |
| `Np` (citos režīmos) | Personu skaits, kuru pirmā rinda ir šajā grupā. |

![Starpības režīms: Blue + pusē, Red - pusē](../assets/img/en/teams-list-difference.webp)

## Pogas {#buttons}

| Poga | Iedarbība |
|---|---|
| **Rādīt visas** | Padara katru grupu atkal redzamu. |
| **Sadalīt vienmērīgi** (Starpības režīmā) | Pirmā grupu puse (noapaļota uz augšu) ir +, pārējās ir -; tā pati sadalījuma secība sākas katrā ielādē. |

## Ko dara grupas paslēpšana {#what-hiding-a-group-does}

- Režīmos **Siltums**, **Komandu siltums** un **Līnijas** grupas rindas neko neiegulda.
- **Starpībā** paslēpta grupa neko neiegulda neatkarīgi no tā, kurā pusē tā atrodas, arī ar sadalījumu pēc citas kolonnas (skatiet [Starpība](difference.md#for-developers)).
- **Figūru pārklājumā** personas, kuru pirmā rinda ir šajā grupā, netiek zīmētas.
- **Komandu siltumā** citas grupas saglabā savas krāsas: nokrāsas tiek piešķirtas no kopējā grupu skaita, nevis no redzamā, tāpēc divi attēli paliek salīdzināmi.

Redzamības maiņa restartē uzkrāšanu. Katrā jaunā datu kopā katra grupa atkal ir redzama.

Paneļa norāde mainās atkarībā no režīma: Starpībā tā izskaidro + un -; Komandu siltumā tā saka, ka krāsu paraugi ir tās krāsas, ar kurām katra grupa zīmējas.
