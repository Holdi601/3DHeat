---
title: "Akumulacija u polupreciznom formatu"
parent: "Unutarnji dijelovi iscrtavanja"
nav_order: 4
lang: "hr"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Akumulacija u polupreciznom formatu

Neke grafičke kartice mogu čuvati toplinu samo u malim 16-bitnim brojevima, što bi moglo odrezati ili zaokružiti najtopnija mjesta. Preglednik skalira brojeve pa se to ne vidi. Ne moraš ništa raditi; ova stranica je za razvojne programere.

## Za razvojne programere {#for-developers}

Uređaj koji ne može miješati u teksture s 32-bitnom pomičnom zarezom (nema `float32-blendable` i `float32-filterable` na WebGPU-u, nema `EXT_float_blend` na WebGL2-u) dobija cilj topline s **16-bitnom pomičnom zarezom** (`r16float`): najveća vrijednost je 65.504, a mantisa ima 11 bitova. Gusto polje doseže nekoliko stotina tisuća, pa 16-bitni cilj i **reže** i **zaokružuje**, a greška zaokruživanja raste s vrijednošću - što se pokazuje vrlo posebno: najgušća područja izgledaju mnogo hladnija nego što jesu, dok rijetka područja izgledaju dobro. Dva mehanizma to rješavaju; slika je točna samo ako oba rade.

### Raspon: pojačanje na svakom raspršivanju {#range-a-gain-on-every-splat}

Svako raspršivanje množi se s **pojačanjem** (gain), a kompozit ga dijeli natrag, pa polje leži u veličinama koje polovične pomične zareze dobro podnose ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
procjena = analitička procjena zasićenja za ovaj skup podataka, polumjer i intenzitet u središtu
pojačanje = 2 ^ round(log2(2048 / procjena)), eksponent ograničen na -20..20
```

2048 ostavlja oko 32 puta rezerve iznad vrha rampe prije 65.504. Pojačanje je **potencija broja dva**, pa mala promjena procjene ne mijenja ni pojačanje ni akumulirani međuspremnik; dio je [potpisa geometrije](accumulation.md#what-restarts-it), pa promjena ponovno pokreće akumulaciju.

Vezano je uz analitičku procjenu, a namjerno **ne** uz točku zasićenja. Zasićenje se primjenjuje pri kompozitu upravo zato da povlačenje klizača nikad ne pokrene ponovno konvergenciju; da se pojačanje pomicalo s njim, međuspremnik bi i dalje držao vrijednosti zapisane pri starom pojačanju, dok bi kompozit dijelio s novim. Te dvije greške bi se točno poništile, a klizač bi izgledao kao da ne radi ništa.

Na 32-bitnom cilju pojačanje je uvijek 1.

### Preciznost: djelomični kadrovi od nule {#precision-partial-frames-from-zero}

Kadar spojen u akumulator s težinom 1/n najprije se raspršuje u **pomoćni cilj** od nule, pa se tek onda miješa, umjesto da se raspršuje izravno u akumulator s težinom 1/n ([Akumulacija](accumulation.md#why-each)). Izravno bi doprinos svakog spritea bio 1/n veličine zbroja kojem se pribraja, a polovična pomična zareza ih zaokružuje - to gore što je piksel gušći. Od nule je svaki pribrojnik usporediv sa zbrojem kojem se pridružuje, što je ista aritmetika koju već radi jedan kadar.

### Izmjereni učinak {#measured-effect}

Na gustoj sintetičkoj sceni polje se čita u usporedivim jedinicama:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bit (referenca) | 6051 | 60742 | 121199 | 232744 |
| 16-bit prije | 1372 | 6972 | 7840 | 7840 |
| 16-bit poslije | 5996 | 59666 | 118824 | 210357 |

Vrh je prešao s 30 puta premalog na 0,90 puta, a kompozitni kadar podudara se s 32-bitnim do 0,1% srednje svjetline (luma).

### Ispitivanje {#testing-it}

`?heat=f16` prisiljava ovaj put na bilo kojem pozadinskom sustavu - bez prekidača, aritmetiku koju rade samo slabije grafičke kartice testirali bi samo ljudi koji ih pokreću. `npm run smoke:f16` pokreće cijeli skup testova u pregledniku s tim putem.

Očitanja poništavaju pojačanje: automatska ekspozicija dijeli pročitano polje s njim, a `engine.readHeatProbe()` ga predaje iscrtavaču - što je ujedno način na koji se čita [očitanje topline uživo na ravnalu](measure.md#notes).
