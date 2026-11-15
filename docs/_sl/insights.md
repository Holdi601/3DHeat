---
title: "Vpogledi"
nav_order: 7
has_children: true
lang: "sl"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: true
---

# Ugotovitve

**Ugotovitve** pregledajo naložene podatke za tem, kar izstopa - močne pozicije, smrtonosna tla, pasti ob pojavitvi, ozka grla, igralce daleč nad vrstniki - in vam jih povedo, najmočnejše najprej, z dokazi. Uporabite jih, če v minuti želite izvedeti, kje je bila tekma dobljena ali izgubljena. Nato lahko napišejo povzetek, v enem samem predvajanju pa lahko delujejo kot komentator, ki skoči na velike trenutke.

Vse se šteje v vašem brskalniku. Nič ne zapusti računalnika, dokler ne vklopite zunanjega UI (glejte [Zunanji UI](#external-ai)).

![Ugotovitve na demo tenkih: 14 ugotovitev, najmočnejše najprej](../assets/img/sl/insights.webp)

Razdelek **Ugotovitve** je v stranski vrstici zavihkov Toplotni zemljevid in Tekma. Ima tri zavihke: **Ugotovitve**, **Povzetek** in **Komentator**.

## Ugotovitve {#findings}

1. Naložite podatke in odprite **Ugotovitve**. Pritisnite **Poišči ugotovitve** (»Štejem … n %« kaže napredek).
2. Preberite seznam. Vsaka ugotovitev ima vrstico moči, stavek, kako dober je dokaz (*Močan dokaz*, *Dober dokaz* ali *Nekaj dokazov*), zaznavnik, ki jo je našel, in razred vozila, kjer je to pomembno.
3. **Kliknite ugotovitev**: pregledovalnik uporabi njene filtre, poleti s kamero na mesto in skoči na čas ter odpre podrobnosti: učinek z 95-odstotnim intervalom, vrednosti p in q, prešteti dokazi in **Prostornina tukaj**, ki nariše [prostornino](volumes.md) okoli mesta.
4. **Obnovi filtre** vrne vaše filtre. **Kopiraj JSON** kopira celotno poročilo.

Štetje uporablja trenutne filtre, skrite skupine in izbrano tekmo čez celoten časovni razpon. Če kasneje spremenite filtre, se to pokaže v opombi; pritisnite **Preštej znova**.

Vrstice na vrhu seznama (na primer skupni zneski denarja) povzamejo celotne podatke pred ugotovitvami.

![Odprta ugotovitev: vroče območje streljanja, njene številke in ustrezen odlomek iz literature](../assets/img/sl/insights-finding.webp)

### Zaznavniki {#the-detectors}

| Zaznavnik | Kaj najde | Potrebuje v podatkih |
|---|---|---|
| **Močne pozicije** | Mesta z veliko boljšimi možnostmi kill-proti-smrti kot ostali zemljevid in *varna tla*, kjer v času, ki ga preživi, malokdo umre | dogodke kill in smrti |
| **Vroča in hladna območja** | Mesta, kjer se vrsta dogodka (streli, zadetki, zajemi ...) zgodi precej pogosteje ali redkeje, kot bi napovedal čas, preživet tam | stolpec dogodkov |
| **Odprt teren in kritje** | Smrti na odprtem proti bližnji geometriji ravni in počasi proti hitremu gibanju | smrti; 3D raven za del z geometrijo |
| **Spawni** | Močni spawni, pasti ob pojavitvi, varni spawni, čas do prvega stika | čas in osebe |
| **Razred po kraju** | Razred vozila ali igralci proti UI, ki v nekem območju delujejo precej bolje ali slabše | ubitja in stolpec razreda vozila ali igralec/UI |
| **Igralci** | Igralci, ki ubijajo ali umirajo precej bolj ali manj kot drugi v istem razredu | osebe in ubitja |
| **Ozka grla in boki** | Ozka grla (precej več prehodov kot okoliška tla) in bočne poti (redko uporabljene, a vodijo do ubitja) | osebe |
| **Vrednost** | *Drago ozemlje* in *Donosno ozemlje* | [stolpci vrednosti](value-weighting.md) |

Zaznavniki, ki na podatkih ne morejo delovati, so na dnu seznama z razlogom.

### Kako so ugotovitve razvrščene {#how-findings-are-ranked}

Vsako mesto ali skupina se preizkusi proti preostalemu zemljevidu (natančni binomski ali hitrostni testi). Stopnja lažnih odkritij je zadržana pri 5 % (Benjamini-Hochberg). Naključje lahko izgleda kot vzorec; to drži lažne alarme nizko: med prikazanimi ugotovitvami je pričakovano največ okoli ena od dvajsetih naključna. Učinki iz malo dogodkov so pred razvrščanjem potegnjeni proti »brez učinka«. Navedenih je največ 60 ugotovitev, vsak zaznavnik pa dobi nekaj mest blizu vrha.

## Povzetek {#debrief}

Zavihek **Povzetek** ugotovitve zapiše v kratko besedilo: uvod, najjasnejšo ugotovitev, eno za taktiko, eno za uravnoteženje, ostale razvrščene po zaznavniku in koliko jih temelji na šibkejših dokazih. Vsak odstavek ima oštevilčene gumbe, ki prikažejo njegove ugotovitve. **Kopiraj besedilo** ga kopira.

![Povzetek, ki ga napiše vgrajeni pripovedovalec](../assets/img/sl/debrief.webp)

Vgrajeni pripovedovalec deluje brez povezave, v vašem jeziku. Izbirnik **Leča** nad njim (glejte [Leča znanja](knowledge.md)) določi, katero literaturo odstavki navedejo.

### Zunanji UI {#external-ai}

**Nastavitve UI** omogoča, da povzetek napiše model umetne inteligence po vaši izbiri:

| Nastavitev | Pomen |
|---|---|
| **Ponudnik** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (lokalno), LM Studio (lokalno), strežnik llama.cpp (lokalno) ali katera koli končna točka, združljiva z OpenAI |
| **Osnovni URL**, **Model** | Izpolni ponudnik; **Prikaži modele** vpraša strežnik |
| **Ključ API** | Pošlje se le na osnovni URL. Nikoli se ne beleži, nikoli se ne shrani v poglede, izvoze ali datoteke `.3dheat`. Večina lokalnih strežnikov ga ne potrebuje. |
| **Zapomni si ključ v tem brskalniku** | Privzeto izklopljeno: ključ se pozabi, ko se stran zapre |
| **Uporabi zunanji UI** | Privzeto izklopljeno |
| **Pošiljaj imena igralcev** | Privzeto izklopljeno: igralci se pošljejo kot P1, P2 ... |

Nato vpišite neobvezno vprašanje in pritisnite **Napiši z UI**. Pošljejo se le ugotovitve in njihove številke - nikoli vrstice vaših podatkov. Odgovor se pretaka, navedene ugotovitve pa postanejo gumbi.

## Komentator {#caster}

Za **eno tekmo** (izberite eno, če je naloženih več), **Komentator** najde trenutke, vredne ogleda: prvo kri, večkratna ubitja, zamenjave, zadnje preživele, premike pri ciljih, preobrate, izstopajoče igralce, dolge strele.

![Trenutki komentatorja za en krog demo streljanja](../assets/img/sl/caster.webp)

- Kliknite trenutek: pogled preklopi na predvajanje, skoči tik pred njega, poleti tja in sledi igralcu.
- **Predvajaj trenutke** predvaja vsakega do konca in gre naprej; **Prejšnji** / **Naslednji** se premikata med njimi.
- Ob vklopljenem zunanjem UI **Komentar UI** napiše komentar iz seznama trenutkov (vrste, časi, imena ali psevdonimi, ekipe, razredi, razdalje).

Potrebuje osebe in dogodke kill/smrt (ali zajem); stolpec `other`/`victim` omogoča zamenjave in dolge strele.

## Leča znanja {#knowledge-lens}

Ugotovitev lahko preberete skozi **lečo** uveljavljenega znanja: vojaški nauk, zračni in pomorski boj, urbane operacije, oblikovanje iger in e-šport (ali *Samodejno*, ki ga izberejo enote v podatkih). Odprta ugotovitev nato pokaže najbližji vnos **nauka in literature** ter **zgodovinsko vzporednico** z navedbami, **Meritve leče** pa iz te literature izračuna mere na podatkih (prileganja Lanchester, razmerja izmenjav, razmerja sil, polja ognja, ključni teren, zamenjave, pobuda). Povzetek in poziv UI jih vključujeta. Vse o tem: [Leča znanja](knowledge.md).

Meritve leče merijo tudi, kako se igralci vedejo kot množica in kot skupina - poravnavanje in kroženje, vodenje po poteh, pasovi in sledi, gneča, voditelji in sledilci, zaostanki, točka zloma pod izgubami, tveganje po izgubljenem življenju, nizi, dogovor o nakupih in odziv na prihajajoči ogenj - vsako proti svojemu ničelnemu modelu: [Skupinsko vedenje](collective-behaviour.md).

## Podatki, ki omogočajo ugotovitve {#data-that-makes-insights-work}

- položaji s **časom**, stolpcem **osebe** in stolpcem **ekipe**;
- stolpec **dogodkov** s kills in smrtmi (`kill`, `death`) ter drugimi (`hit`, `fire`, `capture` ...);
- stolpec **nasprotne strani** (`other`, `victim`) za zamenjave in smeri;
- stolpec **vozila** ali **tipa** za razrede; stolpec `ai` za igralce proti UI;
- stolpec **seje** / **tekme** / **kroga**, kadar je več tekem.

[Demo podatki](demo-data.md) imajo vse to.
