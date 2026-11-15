---
title: "Toplota ekip"
parent: "Načini toplote"
nav_order: 6
lang: "sl"
source: "team-heat.md"
source_hash: "e18e62600e3e"
translated: true
outdated: false
---

# Toplota ekip

Toplota ekip pokaže, kje je bila vsaka ekipa, vsaka v svoji barvi. Kjer se ekipe prekrivajo, se barve mešajo.

**Toplota ekip** (tipka 3) je polje gostote iz [Toplote](heat.md), kjer ima vsaka [skupina](glossary.md) svoj odtenek. Kjer se skupine prekrivajo, se njihovi odtenki mešajo; enakovreden dvoboj je nevtralen. Neprosojnost še vedno nosi gostoto natanko kot v drugih načinih, zato slika hkrati odgovori *koliko* in *čigava*. Potrebuje stolpec skupin.

![Toplota ekip: vsaka stran v svoji barvi; kjer se prekrivajo, se barve mešajo](../assets/img/sl/heat-teams.webp)

Ni isto kot [prekrivanje figur](box-replay.md): to nariše eno figuro na osebo; to je toplotno polje, obarvano s tem istim stolpcem.

## Kako uporabiti {#how-to-use-it}

1. Pritisnite `3` (ali izberite **Toplota ekip** v vrstici načinov).
2. Odprite **Barve toplote**. Vzorci kažejo barvo vsake skupine; če se z miško ustavite nad vzorcem, se prikaže ime ekipe.
3. Če se vse zdi sivo, povečajte **Ločevanje barv**.
4. Odznačite skupino v [Seznamu ekip](teams-list.md), da jo odstranite; druge barve ostanejo, kjer so bile.

## Kontrole {#controls}

V razdelku **Barve toplote**:

| Kontrola | Privzeto | Pomen |
|---|---|---|
| Vzorci | | Barva vsake skupine, za prvih 12 skupin, nato *+N več*. Če se z miško ustavite nad njo, se prikaže ime skupine in barva. |
| **Ločevanje barv** | 1,4 | Kako daleč je mešanica potisnjena od nevtralne, 0–4. 0 vse naredi sivo; 1 je pravo povprečje; nad približno 2 najsvetlejše mešanice zapustijo prikazljivo območje in se na vsakem kanalu omejijo, kar premakne njihov odtenek. |
| **Lestvica neprosojnosti (barva pride iz skupine)** | privzeta lestvica toplote | Tu se uporabi samo **alfa** lestvice: prosojno tam, kjer ni ničesar, neprosojno na vrhu. Njene barve se prezrejo. |

Skupina, katere oznaka pomeni »brez skupine« (`0`, prazno, `none`, `unknown`, `null` ali `-1`), se riše sivo.

Vse druge kontrole toplote – oblika, nasičenost, odziv, najmanjša toplota, globina, izrezovanje – delujejo kot v [Toploti](heat.md).

[Ekipe](teams-list.md) v tem načinu pokaže barvo toplote ekipe kot njen vzorec. Če skrijete skupino, vse druge skupine ohranijo svojo barvo: odtenki prihajajo iz skupnega števila skupin, ne iz tega, kaj je vključeno, zato ostaneta obe sliki primerljivi.

## Za razvijalce {#for-developers}

### Paleta {#the-palette}

Iz [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Barve živijo na ravnini barv **Oklab** pri stalni svetlosti (0,7) in kromi (0,115), zato je vsaka skupina enako svetla in rdeča skupina ni videti bolj vroča kot modra.
- Pri *n* skupinah se krog odtenkov razdeli na *n* enakih delov, skupina *i* pa zavzame **središče** svojega dela, `(i + 0,5) / n` obrata. Katerikoli dve skupini sta tako daleč, kot to število dopušča, in nasprotja ostanejo nasprotja ne glede na število.
- Uporabljenih je največ **16** različnih odtenkov. Pri več skupinah se identifikatorji razporedijo s ponavljajočim se razpolavljanjem (identifikatorji z obrnjenimi biti: 0, ½, ¼, ¾, ⅛, …), da sosednji identifikatorji ne delijo odtenka; skupine nad 16 nujno delijo.
- Skupina, katere oznaka pomeni »brez skupine« – `0`, prazno, `none`, `unknown`, `null` ali `-1`, ne glede na velikost črk – se riše kot **nevtralno siva** namesto da bi dobila kos kroga. Tako se obravnava samo prva taka oznaka v seznamu skupin.

Privzeto ločevanje je 1,4, ne 1, ker je pri 1 mešanica petih enakomerno razporejenih odtenkov *res* siva: pravilno, a nebrano. Nekoliko nad 1 ohrani poštene izenačitve in hkrati naredi delitev 60/40 vidno.

### Kako deluje {#how-it-works}

Cilj toplote ima v tem načinu štiri kanale. Vsak sprajt prišteje svojo gostoto *v* prvemu kanalu in *v* × koordinati Oklab *a* in *b* skupine drugemu in tretjemu. Ob sestavljanju je mešanica pike tehtano povprečje po gostoti: *a* = G / R, *b* = B / R, pomnoženo z ločevanjem barv in pretvorjeno v sRGB pri svetlosti palete. Deljenje z nabrano gostoto ohrani odtenek neodvisen od tega, koliko podatkov je, zato vsaka kontrola gostote še vedno deluje samo na neprosojnost.

Cilj s štirimi kanali stane štirikrat toliko pomnilnika GPU kot enokanalni cilj toplote pri isti ločljivosti.
