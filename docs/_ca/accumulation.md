---
title: "Acumulació"
parent: "Detalls interns del renderitzat"
nav_order: 2
lang: "ca"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Acumulació

Quan el visor no pot dibuixar cada punt en un sol fotograma, en dibuixa una part, després una altra, i sumi les imatges mentre no et mous. La imatge es veu més clara, com una fotografia que es revela. Moure la càmera ho torna a començar. La línia **Cobertura** de la superposició d'estadístiques mostra fins on ha arribat.

![La superposició d'estadístiques: Cobertura mostra un percentatge mentre la imatge es revela i *exacta* quan està completa](../assets/img/en/performance-stats-overlay.webp)

## Per a desenvolupadors {#for-developers}

Quan un fotograma no pot dibuixar totes les files, en dibuixa una mostra i la pondera; la imatge és aleshores una estimació sense biaix però sorollosa. **L'acumulació** fusiona els fotogrames successius perquè l'estimació convergeixi a la resposta exacta mentre res no canvia. Cada fotograma tria un dels cinc modes ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); l'últim usat és a `engine.live.accumMode`.

| Mode | Quan | Què passa amb l'acumulador |
|---|---|---|
| **reinicia** | la càmera s'ha mogut, ha canviat alguna cosa que altera el camp, la refinació progressiva està desactivada, comença una finestra creixent (primer fotograma de la reproducció, després d'un salt), o la calor en línies reproduïda s'ha mogut | Es substitueix per l'estimació d'aquest fotograma. |
| **estén** | una finestra **Acumulat** que només ha crescut des de l'últim fotograma | Aquest fotograma només dibuixa les files que acaben de ser visibles, amb pes complet, i les suma. Res no es desintegra. |
| **ema** | una finestra lliscant (**Finestra**, **Temps de vida**) s'ha mogut | `acc = acc × (1 - 0,34) + fotograma × 0,34` - una mitjana mòbil exponencial d'uns tres fotogrames. |
| **mitjana** | no ha canviat res i l'estimació no és completa | `acc = acc × (1 - 1/n) + fotograma × 1/n` al *n*è fotograma: una mitjana corrent. |
| **omet** (inactiu) | convergit i no ha canviat res | No es dibuixa res; el fotograma només es torna a compondre. |

### Per què cadascun {#why-each}

- **Mitjana corrent, no suma.** Escalar el buffer per 1 - 1/n i sumar 1/n del fotograma nou és algebraicament el mateix que sumar i dividir per *n* al final, però el buffer sempre conté la quantitat d'un sol camp. Una suma arriba a *n* vegades el camp, i en un destí de 16 bits se satura a 65.504; amb un divisor que no para de créixer, una vista quieta s'esvairia com més temps estigués quieta - mentre que una càmera en moviment, que es reinicia a cada fotograma, es veu perfectament correcta. La suite de proves afirma que 16 fotogrames fusionats mantenen 1,00× el que mantindria un de sol.
- **Estendre per a la reproducció acumulada.** Les files ja acumulades continuen visibles, de manera que un fotograma només necessita la fracció de segon que acaba d'arribar - que cap en un fotograma, així que s'hi posa exacta. Tornar a estimar il·luminaria un subconjunt aleatori diferent a cada fotograma i l'esvairia, i es llegiria com a ràfegues que s'encenen i desapareixen, i un fotograma aturat continuaria omplint. La suite afirma que el total puja monòtonament durant la reproducció i es manté dins de 0,02% durant 2,5 s en pausa.
- **Mitjana mòbil per a les finestres lliscants.** Aquestes canvien de veritat a cada fotograma. Un pes de barreja fix segueix la finestra en moviment (una mitjana de tots els fotogrames des de l'inici de la reproducció es quedaria darrere del capçal) i és molt més tranquil que començar de nou.
- **Reiniciar per a les línies reproduïdes.** Els caps de la calor en línies es mouen a cada fotograma; una mitjana mòbil els esborraria en una ratlla, així que cada fotograma es dibuixa sencer i l'esvaïment de la cua és el de la pròpia imatge.
- **Els fotogrames parcials passen per un destí intermedi.** Un fotograma fusionat a una fracció del pes complet s'esclafa en un destí separat des de zero i després es barreja amb l'acumulador, en lloc d'esclafar-lo directament a pes 1/n. Directament, cada sprite se sumaria a 1/n de la mida del total al qual s'uneix, cosa que un destí de mitja precisió arrodoneix - el pitjor on és més dens ([Acumulació de mitja precisió](half-float-accumulation.md)).

### Convergència {#convergence}

El pla de cada fotograma sap quantes files candidates hi ha i quantes en envia, de manera que el nombre de fotogrames necessaris per cobrir cada fila és ⌈candidates / enviades⌉. Un cop s'han fusionat tants fotogrames, la vista és **convergida**: la línia *Cobertura* de la superposició d'estadístiques passa de percentatge a *exacta*, i els fotogrames següents queden inactius. Amb **Dibuixa totes les files a cada fotograma** activat (per defecte) un sol fotograma sol cobrir-ho tot, així que la convergència és immediata, i la maquinària progressiva només cal quan la finestra conté més files de les que pot portar un sol pla de dibuix (uns 67 milions).

### Què la reinicia {#what-restarts-it}

Els ajustos es divideixen en tres grups, segons el que encara significa el buffer acumulat després de canviar-los:

| Grup | Canvis | Efecte |
|---|---|---|
| **Geometria** - quines files contribueixen i quant | mode de vista; rutes de línies; radi del sprite, intensitat del centre i de la vora, atenuació, rampa suau, la corba, límits de píxels, aplanament; retall per distància proper, llunyà i pla; oclusió i amagar darrere del terreny; el tall; mida del llenç; resolució de la calor; visibilitat i signes dels grups; la divisió de la diferència; Tot / Reprodueix; l'historial; els filtres de columna i la selecció d'Entitats; el guany de mitja precisió | Reinici. |
| **Finestra** - l'interval de temps | el moviment del capçal de reproducció; la reserva i l'esvaïment del Temps de vida | Estendre (acumulada) o mitjana mòbil (lliscant). |
| **Composició** - només el color | saturació, resposta a la densitat, calor mínima, les rampes de color; tallar el nivell; la graella i els eixos; ajustos i sessió de la repetició de caixes; profunditat de camp | Redibuixa sense tocar la calor. |

Un moviment de càmera sempre reinicia. Així que arrossegar la saturació o la rampa és gratuït; arrossegar el radi del sprite reinicia la convergència a cada pas.
