---
title: "Zadrževanje v pomnilniku GPU"
parent: "Notranjosti upodabljanja"
nav_order: 5
lang: "sl"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Rezidenca v pomnilniku GPU

Grafična kartica ima omejen pomnilnik. Če vaši podatki ne gredo vanj, pregledovalnik pokaže, kar se prilega, in to tudi pove: okvirček statistike dobi jantarno vrstico **Ni v pomnilniku** s številom vrstic, ki so ostale zunaj. Skrajšani podatkovni niz, ki je videti popoln, bi bila najhujša napaka, ki jo lahko stori orodje za analizo, zato te vrstice nikoli ne skrijemo.

![Prekrivni prikaz statistike z jantarno vrstico Ni v pomnilniku](../assets/img/en/gpu-memory-not-resident.webp)

Če želite spraviti več, povečajte proračun GPU pod **Proračuni virov** in ponovno naložite ([Pomnilnik in proračuni](memory-and-budgets.md#raising-the-gpu-budget)), najprej zožite podatke ali uporabite kartico z več pomnilnika.

## Za razvijalce {#for-developers}

### Kako so vrstice shranjene na GPU {#how-rows-are-stored-on-the-gpu}

Vrstice se naložijo enkrat, ko pride podatkovna množica, v **kosih** po 8.388.608 vrstic (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Vsak kos se kvantizira glede na svoj lasten omejevalni okvir in časovni razpon:

| Podatki | Oblika | Bajtov na vrstico |
|---|---|---|
| Položaj X, Y, Z in id skupine | štiri 16-bitna brezpredznačna cela števila (RGBA16UI v WebGL2); X, Y, Z znotraj omejevalnega okvirja kosa | 8 |
| Čas in življenjska doba (kadar ima podatkovna množica tako čas kot osebo) | dve 16-bitni brezpredznačni celi števili (RG16UI): čas znotraj časovnega razpona kosa; življenjska doba, pri čemer 65.535 pomeni »ni naslednjega vzorca« | 4 |

Omejevalni okvirji po kosih so razlog, da 16 bitov zadostuje: kos običajno pokrije le delček zemljevida, zato je korak kvantizacije na zemljevidu širokem kilometre veliko pod centimetrom, daleč pod šumom v resničnih telemetričnih podatkih. Id skupine, ki se vozi v četrtem kanalu, je brezplačen – zato je lahko skupin največ 4.096 ([Skupine](sessions-persons-groups.md#limits)).

V WebGL2 je vsak kos tekstura, široka 8.192 texelov, zapolnjena do celih vrstic teksture; do vrstic se pride iz `gl_VertexID` prek bločne teksture indeksov, ki se obnovi vsako sličico. V WebGPU so to medpomnilniki za shranjevanje.

Dodatni pomnilnik GPU na vrstico, dodeljen ob uporabi:

- vsak aktivni stolpčni [filter](filters.md): 4 bajte na vrstico (vrednosti s plavajočo vejico 32-bit ali id-ji kategorij), naložen po kosih ob prvi uporabi filtra;
- [toplotna črta](line-heat.md): 8 bajtov na vrstico (začetek vsakega segmenta, kvantiziran znotraj omejevalnega okvirja podatkov, in njegove zastavice), medtem ko je način Črte vklopljen.

Plus cilji upodabljanja: barva prizora in globina, cilj toplote in njegov pomožni dvojnik (štirje kanali v [Toplota ekip](team-heat.md)), plasti luščenja globine za [zakritje](depth-and-culling.md); in geometrija ravni.

### Proračun je uveljavljen ob nalaganju {#the-budget-is-enforced-at-upload}

WebGL sprejme dodelitve, ki jih ne more opraviti, nato pa bodisi izgubi kontekst bodisi se vrne v sistemski pomnilnik po uničujoči ceni, zato se proračun GPU uveljavi ob nalaganju podatkovne množice ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- kosi se naložijo po vrsti (to je po časovnem redu), dokler se prilegajo;
- prvi kos, ki se ne prilega, se naloži **delno** – toliko celih vrstic teksture, kolikor jih drži preostali proračun – namesto da se ne naloži nič, zato proračun, ki ne more zadržati celotnega kosa, še vedno pokaže kar največ lahko, in ker so vrstice urejene po času, je prikazani del združen časovni odsek;
- vse po tem je **ni v pomnilniku**.

Primanjkljaj ni skrit: okvirček statistike pokaže vrstico **Ni v pomnilniku** s številom vrstic, ki se niso prilegale, v jantarni barvi, kadar je to več kot nič. Skrajšani podatkovni niz, ki je videti popoln, je najhujša napaka, ki jo lahko ima orodje za analizo. [Preverjanje prileganja](memory-and-budgets.md#the-fit-check) pred nalaganjem naj bi temu preprečilo.

Proračun, ki ga upodabljalnik uporablja, je proračun GPU iz **Proračunov virov**, isto število, ki ga uporablja preverjanje prileganja – tudi nad zaznano vrednostjo, do zgornje meje drsnika (glejte [Povečanje proračuna GPU](memory-and-budgets.md#raising-the-gpu-budget)). Uveljavi se ob nalaganju podatkovne množice; če ga spremenite pozneje, začne veljati ob naslednjem nalaganju.
