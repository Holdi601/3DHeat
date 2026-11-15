---
title: "Détection du rendu logiciel"
parent: "Fonctionnement interne du rendu"
nav_order: 6
lang: "fr"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Détection du rendu logiciel

Si votre navigateur dessine avec le processeur principal au lieu de la carte graphique, la visionneuse est plusieurs fois plus lente. La visionneuse le remarque et affiche une case rouge qui vous dit quoi activer.

Quand un navigateur a l'accélération matérielle désactivée, ou que son pilote est sur liste noire, il dessine WebGL et WebGPU sur le processeur. Tout fonctionne encore, plusieurs fois plus lentement. Le ressenti est alors « cette visionneuse est inutilisable avec mes données ». C'est un symptôme qui pointe vers l'outil, pas vers un réglage du navigateur. La visionneuse regarde donc le nom du moteur de rendu et le signale ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## La bannière {#the-banner}

Quand le moteur de rendu est identifié sans ambiguïté comme logiciel, une case rouge apparaît en haut de la barre latérale (onglets Carte de chaleur et Match), au-dessus de la barre des modes :

![La bannière rouge : Rendu sans la carte graphique](../assets/img/en/software-rendering-banner.webp)

> **Rendu sans la carte graphique.**
> Ce navigateur dessine sur le CPU au lieu de la carte graphique, ce qui est bien plus lent et ne tiendra pas les grands jeux de données. Activez l’accélération matérielle dans les paramètres du navigateur (Chrome : Paramètres → Système → « Utiliser l’accélération graphique si disponible », puis redémarrez), et vérifiez que le pilote graphique est à jour.

## Pour les développeurs {#for-developers}

### Comment il décide {#how-it-decides}

La chaîne du moteur de rendu (le `UNMASKED_RENDERER_WEBGL` de WebGL2, ou le fournisseur, l'architecture et le périphérique de l'adaptateur WebGPU) est mise en minuscules et classée :

- **logiciel** quand elle contient `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` ou `generic renderer` ;
- **matériel** quand elle contient un fabricant ou une famille de GPU connu (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`) ;
- **inconnu** sinon.

Seul le cas *logiciel* affiche la bannière. Un adaptateur non reconnu ne dit rien du tout : renvoyer une personne dont le GPU fonctionne reconfigurer son navigateur serait une pire erreur que de manquer un cas.

### Le nom court {#the-short-name}

Le même module raccourcit la chaîne du moteur de rendu pour l'affichage. À partir d'une chaîne ANGLE comme `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, il garde le champ du périphérique, retire l'identifiant PCI et le modèle d'API et de shader de fin, et affiche `Vendor Model`. Le nom court apparaît dans **Budgets de ressources**, avec la chaîne complète en infobulle. L'estimation de mémoire affiche la chaîne complète.
