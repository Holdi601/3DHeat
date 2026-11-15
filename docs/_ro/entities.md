---
title: "Entități"
parent: "Filtre și instrumente"
nav_order: 3
lang: "ro"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entități

**Entități** te lasă să alegi un jucător (sau câțiva) ca să vezi doar unde a mers acel jucător. Folosește-l ca să urmărești propria mișcare sau un adversar.

Panoul apare când setul de date are o coloană de persoană. Antetul lui arată numărul de persoane, sau `selectate din total` cât timp o selecție este activă (o *persoană* este un jucător sau un AI, vezi [glosarul](glossary.md)).

## Alege un jucător {#pick-a-player}

1. Deschide **Entități** în bara laterală.
2. Scrie o parte din nume în caseta de căutare.
3. Bifează jucătorul. Antetul arată, de exemplu, `2 din 10`, iar tot restul dispare.
4. **Golește** îi arată din nou pe toți.

![Entități cu doi din zece jucători selectați](../assets/img/en/entities-selected.webp)

Selecția arată doar persoanele selectate, în modurile de căldură (puncte, linii, diferență, căldură pe echipe), precum și în traseele, figurile și urmele din [redarea figurilor](box-replay.md). Lasă-o goală ca să arăți pe toată lumea; a selecta pe toată lumea este la fel cu a nu selecta pe nimeni.

## Panoul {#the-panel}

| Parte | Înseamnă |
|---|---|
| Caseta de căutare | *Caută în N entități...* - filtrează lista după un subșir al numelui, fără a ține cont de majuscule. Arată `N potriviri`, sau `N potriviri, arătând primele 200`; *Nimic nu se potrivește cu „..."* când căutarea nu găsește nimic. |
| Lista | Până la 200 de persoane (primele 200 care se potrivesc), fiecare cu o casetă de bifare, o mostră a culorii persoanei și numele (*(fără nume)* pentru un nume gol). |
| Indiciul „în joc" | Când timpul rulează, lista cuprinde pe cei *în joc la capul de redare*; o căutare le găsește pe toate. |
| **AI (n)** | Un grup pliabil cu unitățile controlate de AI, separat de jucători. |
| **Adaugă afișate** | Adaugă la selecție pe toți cei listați acum. |
| **Doar afișate** | Face selecția exact pe cei listați. |
| **Golește** | Golește selecția. |

## Limite {#limits}

În căldură, selecția este un filtru și folosește unul dintre cele patru [locuri de filtru](filters.md#rules). Când celelalte filtre folosesc deja toate cele patru, panoul spune *Nu se aplică la căldură: toate locurile de filtru sunt ocupate. Redarea figurilor arată tot doar aceste entități. Golește un filtru din Filtre ca să eliberezi unul.* Golește un filtru ca să eliberezi un loc.

Selecția se golește la fiecare set de date nou. Fila Meciuri setează aceeași selecție când se concentrează pe un jucător.

## Pentru dezvoltatori {#for-developers}

Selecția este stocată ca un filtru de *persoane* ([Filtre](filters.md#for-developers)). Masca shaderului ține 65.536 de id-uri de persoane; o persoană peste acest număr nu este desenată în căldură cât timp o selecție este activă.
