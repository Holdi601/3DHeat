---
title: "Toplota tima"
parent: "Načini toplote"
nav_order: 6
lang: "bs"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Toplota timova

Toplota timova pokazuje gdje je bio svaki tim, svaki tim u svojoj boji. Tamo gdje se timovi preklapaju, boje se miješaju.

**Toplota timova** (tipka 3) je polje gustine iz [Toplote](heat.md) uz svaku [grupu](glossary.md) date sopstvene nijanse. Tamo gdje se grupe preklapaju, nijanse se miješaju; ravnopravno nadmetanje ispada neutralno. Neprozirnost i dalje nosi gustinu kao i u ostalim načinima, pa slika odgovara na *koliko* i *čija* u isto vrijeme. Potrebna je kolona grupe.

![Toplota timova: svaka strana u svojoj boji; tamo gdje se preklapaju, boje se miješaju](../assets/img/en/heat-teams.webp)

To nije [preklapanje figura](box-replay.md): ono crta jednu figuru po osobi; ovo je polje toplote obojeno istom kolonom.

## Kako se koristi {#how-to-use-it}

1. Pritisnite `3` (ili izaberite **Toplota timova** na traci načina).
2. Otvorite **Boje toplote**. Uzorci pokazuju boju svake grupe; zadržite pokazivač iznad uzorka za naziv tima.
3. Ako sve izgleda sivo, povećajte **Razdvajanje boja**.
4. Odštiklirajte grupu u [Spisku timova](teams-list.md) da je izuzmete; boje ostalih ostaju tamo gdje su bile.

## Kontrole {#controls}

U odjeljku **Boje toplote**:

| Kontrola | Podrazumijevano | Značenje |
|---|---|---|
| Uzorci | | Boja svake grupe, za prvih 12 grupa, zatim *+N još*. Zadržite pokazivač za naziv grupe i boju. |
| **Razdvajanje boja** | 1,4 | Koliko je miješana boja odgurnuta od neutralne, 0-4. 0 sve čini sivim; 1 je pravi prosjek; iznad otprilike 2 najsvjetlije mješavine izlaze iz prikazivog opsega i po kanalu se stežu, što pomjera njihovu nijansu. |
| **Skala neprozirnosti (boja dolazi od grupe)** | podrazumijevana skala toplote | Ovdje se koristi samo **alfa** skale: prozirno tamo gdje nema ničega, neprozirno na vrhu. Njene boje se ignorišu. |

Sve ostale kontrole toplote - oblik, zasićenje, odziv, najmanja toplota, dubina, culling - rade kao u [Toploti](heat.md).

[Spisak timova](teams-list.md) u ovom načinu prikazuje boju toplote timova svake grupe kao njen uzorak. Sakrivanje grupe ostavlja boju svih ostalih grupa tamo gdje je bila: nijanse dolaze iz ukupnog broja grupa, a ne iz onoga što je uključeno, pa dvije slike ostaju uporedive.

## Paleta {#the-palette}

Iz [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Boje žive na **Oklab** ravni boja pri fiksnoj svjetlini (0,7) i hromi (0,115), pa je svaka grupa jednako svijetla i crvena grupa ne djeluje toplije od plave.
- Uz *n* grupa, krug nijansi dijeli se na *n* jednakih dijelova, a grupa *i* uzima **sredinu** svog dijela, `(i + 0,5) / n` punog kruga. Svake dvije grupe su onoliko udaljene koliko broj dozvoljava, a suprotnosti ostaju suprotnosti kakav god da je broj.
- Koristi se najviše **16** različitih nijansi. Uz više grupa, id-ovi se raspoređuju ponovljenim polovljenjem (id-ovi s obrnutim bitovima: 0, ½, ¼, ¾, ⅛, …) da susjedni id-ovi ne dijele nijansu; grupe iza 16. nužno dijele.
- Grupa čija oznaka znači „bez grupe” - `0`, prazno, `none`, `unknown`, `null` ili `-1`, bez obzira na velika i mala slova - crta se **neutralnom sivom** umjesto da uzme dio kruga. Samo prva takva oznaka u spisku grupa tretira se tako.

Podrazumijevana razdvojenost je 1,4 umjesto 1, jer pri 1 mješavina pet ravnomjerno raspoređenih nijansi *jeste* siva: tačno, ali nečitljivo. Malo iznad 1 čuva izjednačenja poštenim, a istovremeno čini vidljivom podjelu 60/40.

## Kako radi {#how-it-works}

Meta toplote u ovom načinu ima četiri kanala. Svaki sprajt dodaje svoju gustinu *v* prvom kanalu, a *v* × Oklab koordinate *a* i *b* grupe drugom i trećem. U trenutku kompozicije mješavina pixela je prosjek ponderisan gustinom: *a* = G / R, *b* = B / R, skaliran razdvojenošću boja i pretvoren u sRGB pri svjetlini palete. Dijeljenje akumuliranom gustinom čini nijansu nezavisnom od toga koliko ima podataka, i zato sve kontrole gustine i dalje djeluju samo na neprozirnost.

Meta s četiri kanala košta četiri puta više GPU memorije od meta toplote s jednim kanalom pri istoj rezoluciji.
