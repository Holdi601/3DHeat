---
title: "Toplina timova"
parent: "Načini topline"
nav_order: 6
lang: "hr"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Toplina timova

Toplina timova pokazuje gdje je bio svaki tim, svaki u svojoj boji. Tamo gdje se timovi preklapaju boje se miješaju.

**Toplina timova** (tipka 3) je polje gustoće iz [Topline](heat.md) s dodijeljenom vlastitom nijansom svakoj [grupi](glossary.md). Tamo gdje se grupe preklapaju, njihove nijanse se miješaju; izjednačeno natjecanje daje neutralnu boju. Neprozirnost i dalje nosi gustoću točno kao u ostalim načinima, pa slika odgovara na *koliko* i *čija* u isto vrijeme. Treba stupac grupe.

![Toplina timova: svaka strana u svojoj boji; tamo gdje se preklapaju boje se miješaju](../assets/img/en/heat-teams.webp)

To nije [prekrivanje figura](box-replay.md): ono crta jednu figuru po osobi; ovo je polje topline obojeno istim stupcem.

## Kako se koristi {#how-to-use-it}

1. Pritisnite `3` (ili odaberite **Toplina timova** na traci načina).
2. Otvorite **Boje topline**. Uzorci pokazuju boju svake grupe; zadržite pokazivač na uzorku za ime tima.
3. Ako sve izgleda sivo, povećajte **Razdvajanje boja**.
4. Odznačite grupu u [Popisu timova](teams-list.md) da je uklonite; ostale boje ostaju gdje su bile.

## Kontrole {#controls}

U odjeljku **Boje topline**:

| Kontrola | Zadano | Značenje |
|---|---|---|
| Uzorci | | Boja svake grupe, za prvih 12 grupa, zatim *+N još*. Zadržite pokazivač za ime grupe i boju. |
| **Razdvajanje boja** | 1,4 | Koliko se miješana boja gura od neutralne, 0-4. 0 sve čini sivim; 1 je pravi prosjek; iznad otprilike 2 najsvjetlije mješavine izlaze iz prikazivog raspona i po kanalu se ograničavaju, što pomiče njihovu nijansu. |
| **Skala neprozirnosti (boja dolazi od skupine)** | zadana skala topline | Ovdje se koristi samo **alfa** skale: prozirno gdje nema ničega, neprozirno na vrhu. Njezine boje se ignoriraju. |

Sve ostale kontrole topline - oblik, zasićenje, odziv, minimalna toplina, dubina, odbacivanje - rade kao u [Toplini](heat.md).

[Popis timova](teams-list.md) u ovom načinu prikazuje boju topline timova svake grupe kao njezin uzorak. Skrivanje grupe ostavlja boju svake druge grupe gdje je bila: nijanse dolaze iz ukupnog broja grupa, a ne iz onoga što je uključeno, pa slike ostaju usporedive.

## Paleta {#the-palette}

Iz [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Boje žive na ravnini boja **Oklab** pri fiksnoj svjetlini (0,7) i kromi (0,115), pa je svaka grupa jednako svijetla i crvena grupa ne djeluje toplije od plave.
- S *n* grupa krug nijansi dijeli se na *n* jednakih dijelova, a grupa *i* uzima **središte** svog dijela, `(i + 0,5) / n` okreta. Svake dvije grupe su što je moguće dalje jedna od druge s obzirom na njihov broj, a suprotnosti ostaju suprotne bez obzira na broj.
- Koristi se najviše **16** različitih nijansi. S više grupa id-evi se raspoređuju ponovljenim prepolavljanjem (id-evi obrnutih bitova: 0, ½, ¼, ¾, ⅛, …) tako da susjedni id-evi ne dijele nijansu; grupe iza 16 nužno dijele.
- Grupa čija oznaka znači „nema grupe” - `0`, prazno, `none`, `unknown`, `null` ili `-1`, bez obzira na velika i mala slova - crta se **neutralno sivo** umjesto da uzme dio kruga. Samo prva takva oznaka na popisu grupa tako se tretira.

Zadano razdvajanje je 1,4, a ne 1, jer je pri 1 mješavina pet ravnomjerno raspoređenih nijansi *upravo* siva: točno, ali nečitljivo. Malo iznad 1 čuva poštenje izjednačenja, a čini podjelu 60/40 vidljivom.

## Kako radi {#how-it-works}

Cilj topline u ovom načinu ima četiri kanala. Svaki sprite dodaje svoju gustoću *v* prvom kanalu, a *v* × Oklab koordinate *a* i *b* grupe drugom i trećem kanalu. U trenutku kompozicije mješavina piksela je prosjek ponderiran gustoćom: *a* = G / R, *b* = B / R, skalirano razdvajanjem boja i pretvoreno u sRGB pri svjetlini palete. Dijeljenje s akumuliranom gustoćom čini nijansu neovisnom o tome koliko je podataka tu, i zato svaka kontrola gustoće nastavlja djelovati samo na neprozirnost.

Cilj s četiri kanala košta četiri puta više memorije GPU-a od cilja topline s jednim kanalom pri istoj rezoluciji.
