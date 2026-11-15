---
title: "Gjenkjenning av programvarerendering"
parent: "Rendering i detalj"
nav_order: 6
lang: "no"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Oppdaging av programvaretegning

Hvis nettleseren din tegner med hovedprosessoren i stedet for grafikkortet, er visningsprogrammet mange ganger tregere. Visningsprogrammet merker dette og viser en rød boks som forteller deg hva du skal slå på.

Når en nettleser har maskinvareakselerasjon slått av, eller driveren står på en svarteliste, tegner den WebGL og WebGPU på CPU-en. Alt virker fortsatt, bare mange ganger tregere, og opplevelsen blir "dette visningsprogrammet er ubrukelig tregt med dataene mine" - et symptom som peker på verktøyet, ikke på en bryter i nettleseren. Derfor ser visningsprogrammet på navnet til tegnemotoren og sier fra ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Banneret {#the-banner}

Når tegnemotoren med sikkerhet er identifisert som programvare, vises en rød boks øverst i sidepanelet (fanene Varmekart og Kamp), over modusraden:

![Det røde banneret: Kjører uten grafikkortet](../assets/img/en/software-rendering-banner.webp)

> **Kjører uten grafikkortet.**
> Denne nettleseren tegner på CPU-en i stedet for grafikkortet, noe som er mange ganger tregere og ikke klarer store datasett. Slå på maskinvareakselerasjon i nettleserens innstillinger (Chrome: Innstillinger → System → «Bruk grafikkakselerasjon når det er tilgjengelig», start deretter på nytt), og sjekk at grafikkdriveren er oppdatert.

## For utviklere {#for-developers}

### Slik avgjøres det {#how-it-decides}

Tegnemotorstrengen - WebGL2 sin `UNMASKED_RENDERER_WEBGL`, eller WebGPU sin adapterleverandør, arkitektur og enhet - gjøres med små bokstaver og klassifiseres:

- **programvare** når den inneholder `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` eller `generic renderer`;
- **maskinvare** når den inneholder en kjent GPU-leverandør eller -familie (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **ukjent** ellers.

Bare *programvare* viser banneret. En ukjent adapter sier ingenting i det hele tatt: å sende noen med et fungerende grafikkort av gårde for å sette opp nettleseren sin på nytt er en verre feil enn å gå glipp av et tilfelle.

### Det korte navnet {#the-short-name}

Den samme modulen forkorter tegnemotorstrengen for visning: fra en ANGLE-streng som `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` beholder den enhetsfeltet, fjerner PCI-id-en og det avsluttende API-et og shadermodellen, og viser `Vendor Model`. Det korte navnet vises under **Ressursbudsjetter**, med hele strengen som verktøytips; minneanslaget viser hele strengen.
