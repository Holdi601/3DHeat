---
title: "Programinio atvaizdavimo aptikimas"
parent: "Atvaizdavimo vidus"
nav_order: 6
lang: "lt"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Programinio atvaizdavimo aptikimas

Jei jūsų naršyklė piešia pagrindiniu procesoriumi, o ne grafikos kortele, peržiūros programa veikia keliais kartais lėčiau. Peržiūros programa tai pastebi ir parodo raudoną langelį, kuris nurodo, ką įjungti.

Kai naršyklėje išjungtas aparatinis pagreitis arba jos tvarkyklė įtraukta į juodąjį sąrašą, WebGL ir WebGPU piešiami procesoriumi. Viskas vis dar veikia, bet keliais kartais lėčiau, ir patirtis yra „su mano duomenimis ši peržiūra neįmanomai lėta“ – simptomas, rodantis į įrankį, o ne į naršyklės jungiklį. Todėl peržiūros programa pažiūri į atvaizdavimo sistemos pavadinimą ir apie tai praneša ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Langelis {#the-banner}

Kai atvaizdavimo sistema tikrai nustatoma kaip programinė, šoninės juostos viršuje (skirtukuose Šilumos žemėlapis ir Rungtynės), virš režimų juostos, atsiranda raudonas langelis:

![Raudonas langelis: veikia be grafikos kortelės](../assets/img/en/software-rendering-banner.webp)

> **Veikia be grafikos kortelės.**
> Ši naršyklė piešia procesoriumi, o ne grafikos kortele. Tai keliais kartais lėčiau ir nepajėgs apdoroti didelių duomenų rinkinių. Įjunkite aparatinį pagreitį naršyklės nustatymuose (Chrome: Nustatymai → Sistema → „Naudoti grafikos pagreitį, jei galima“, tada paleiskite iš naujo) ir patikrinkite, ar grafikos tvarkyklė atnaujinta.

## Kūrėjams {#for-developers}

### Kaip nusprendžiama {#how-it-decides}

Atvaizdavimo sistemos eilutė – WebGL2 `UNMASKED_RENDERER_WEBGL` arba WebGPU adapterio gamintojas, architektūra ir įrenginys – paverčiama mažosiomis raidėmis ir klasifikuojama:

- **programinė**, kai joje yra `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` arba `generic renderer`;
- **aparatinė**, kai joje yra žinomas GPU gamintojas arba šeima (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **nežinoma** kitais atvejais.

Langelį iškelia tik *programinė*. Neatpažintas adapteris nieko nesako: siųsti žmogų, turintį veikiančią GPU, perkonfigūruoti savo naršyklę yra blogesnė klaida nei praleisti atvejį.

### Trumpas pavadinimas {#the-short-name}

Tas pats modulis sutrumpina atvaizdavimo sistemos eilutę rodymui: iš ANGLE eilutės, pavyzdžiui, `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, palieka įrenginio lauką, nuima PCI id ir galinę API bei šešėliavimo modelio versijas, ir rodo `Vendor Model`. Trumpas pavadinimas rodomas skiltyje **Išteklių biudžetai**, o visa eilutė – kaip patarimas; atminties įvertinime rodoma visa eilutė.
