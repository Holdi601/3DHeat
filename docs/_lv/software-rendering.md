---
title: "Programmatūras renderēšanas noteikšana"
parent: "Renderēšanas iekšējā uzbūve"
nav_order: 6
lang: "lv"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Programmatūras renderēšanas noteikšana

Ja jūsu pārlūks zīmē uz galvenā procesora, nevis uz grafikas kartes, skatītājs ir daudzkārt lēnāks. Skatītājs to pamana un parāda sarkanu lodziņu, kas saka, ko ieslēgt.

Kad pārlūkam ir izslēgta aparatūras paātrināšana vai tā draiveris ir melnajā sarakstā, tas zīmē WebGL un WebGPU uz CPU. Viss joprojām darbojas, bet daudzkārt lēnāk, un pieredze ir "šis skatītājs ar maniem datiem ir nelietojams". Tas ir simptoms, kas norāda uz rīku, nevis uz pārlūka slēdzi. Tāpēc skatītājs apskata renderētāja nosaukumu un to pasaka ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Baneris {#the-banner}

Kad renderētājs ir droši noteikts kā programmatūra, sānjoslas augšdaļā (cilnēs Siltumkarte un Mačs), virs režīma joslas, parādās sarkans lodziņš:

![Sarkanais baneris: darbojas bez grafikas kartes](../assets/img/en/software-rendering-banner.webp)

> **Darbojas bez grafikas kartes.**
> Šis pārlūks zīmē uz CPU, nevis uz grafikas kartes. Tas ir daudzkārt lēnāk un netiks galā ar lielām datu kopām. Ieslēdziet aparatūras paātrināšanu pārlūka iestatījumos (Chrome: Settings → System → "Use graphics acceleration when available", pēc tam restartējiet), un pārbaudiet, vai grafikas draiveris ir atjaunināts.

## Izstrādātājiem {#for-developers}

### Kā tas nosaka {#how-it-decides}

Renderētāja virkne (WebGL2 `UNMASKED_RENDERER_WEBGL` vai WebGPU adaptera pārdevējs, arhitektūra un ierīce) tiek pārvērsta mazajos burtos un klasificēta:

- **software**, ja tajā ir `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` vai `generic renderer`;
- **hardware**, ja tajā ir zināms GPU pārdevējs vai saime (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unknown** citādi.

Banneri rāda tikai *software*. Nepazīts adapteris nekā neizsaka: nosūtīt cilvēku ar darbojošu GPU pārkonfigurēt savu pārlūku ir sliktāka kļūme nekā neatpazīt gadījumu.

### Īsais nosaukums {#the-short-name}

Tas pats modulis saīsina renderētāja virkni attēlošanai: no ANGLE virknes, piemēram, `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, tas paturi ierīces lauku, noņem PCI id un beigu API un shaderu modeli, un rāda `Vendor Model`. Īsais nosaukums parādās sadaļā **Resursu budžeti**, ar pilno virkni kā rīkpadomu. Atmiņas aplēse rāda pilno virkni.
