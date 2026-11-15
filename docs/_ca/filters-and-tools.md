---
title: "Filtres i eines"
nav_order: 6
has_children: true
lang: "ca"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtres i eines

Aquests panells et deixen triar *quines* dades mires i mesurar el que veus. Fes-los servir quan la imatge és massa carregada: mostra un equip, un jugador, un lloc, o una planta d'un edifici.

Cada panell redueix les dades, i funcionen junts: una fila només es dibuixa si passa **tots** (I).

```
totes les files -> Filtres -> Equips -> Entitats -> Llesca -> imatge
                    I          I          I          I
```

Exemple: desmarca *Tank* a Filtres, amaga l'equip Red a Equips, i tria un jugador a Entitats. Només veus els moviments no de tanc d'aquell jugador.

| Panell | Què fa | Modes de calor | Figures superposades |
|---|---|---|---|
| [Filtres](filters.md) | Filtres d'interval i de categoria sobre qualsevol columna retinguda en carregar. | Sí | No (només filtres de columna) |
| [Divisió de diferència](difference.md#the-difference-split-panel) | Quines files sumen i quines resten, en mode Diferència. | Només Diferència | No |
| [Equips](teams-list.md) | Mostra o amaga cada equip; posa els equips al bàndol + o -. | Sí | Sí |
| [Entitats](entities.md) | Tria jugadors individuals. | Sí | Sí |
| [Llesca](slice.md) | Talla una llosa del nivell i de la calor, per mirar dins dels edificis. | Sí, i el nivell | No |
| [Mesurar](measure.md) | Una regla, i el valor de calor sota el cursor. | Sí | Sí |
| [Volums i comparació](volumes.md) | Dibuixa formes 3D i pregunta què ha passat a dins. També pot filtrar. | Sí | Sí |
| [Desglossament](breakdown.md) | Quin vehicle, jugador o arma funciona millor en un lloc. | n/a | n/a |

L'anàlisi d'impactes té el seu propi filtre d'àrea a la pestanya **Vehicles**: vegeu [Anàlisi d'impactes](hit-analysis.md).

Termes com mapa de calor, fila, persona i grup s'expliquen al [glossari](glossary.md).

## On són els panells {#where-the-panels-are}

La barra lateral de la pestanya Mapa de calor, de dalt a baix:

1. Barra de modes i selector de sessions
2. Origen, Assignació de columnes, Conjunt de dades
3. Rutes (mode Línies)
4. Els panells de calor, o el Visor d'equips
5. Divisió de diferència
6. Equips
7. Entitats
8. Filtres
9. Fons / nivell
10. Llesca
11. Mesurar
12. Recorregut de càmera i renderització
13. Rendiment
14. Càmera i escena

La pestanya Partida mostra la barra de modes, el selector de sessions, el seu propi panell, Filtres, Fons / nivell i Càmera i escena.
