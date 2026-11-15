---
title: "Generatore sintetico"
parent: "Caricare i dati"
nav_order: 5
lang: "it"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Generatore sintetico

Non hai dati tuoi? Premi un pulsante e 3DHeat inventa per te una battaglia finta, piccola o grande come vuoi.

1. Apri il pannello **Dataset** nella barra laterale della Mappa di calore (sotto **Sorgente**).
2. Scorri fino a **Generatore sintetico**.
3. Imposta **Righe (milioni)**. Prova prima con 1: il valore predefinito di 8 milioni è pesante per una prima prova.
4. Premi **Genera**.

![1 milione di righe, 8 squadre, disegnate in Calore per squadra](../assets/img/en/synthetic-generator-team-heat.webp)

Il pannello **Dataset** può generare un dataset invece di caricarne uno. Serve a due cose: provare il visualizzatore senza dati propri, e verificare se un certo numero di righe, il raggio degli sprite e il budget reggono una frequenza di fotogrammi utilizzabile su una macchina *prima* di affidarle un grande carico reale. Il suo movimento ha la forma di una partita battle royale - le squadre partono separate, poi vengono strette insieme - perché il rumore uniforme sembra a posto a qualsiasi budget e nasconde proprio gli artefatti che vale la pena cogliere.

## Controlli {#controls}

| Controllo | Predefinito | Significato |
|---|---|---|
| **Righe (milioni)** | 8 | Righe da generare. Arrotondate per difetto a un numero intero di tick per ogni giocatore. |
| **Squadre** | 8 | Numero di gruppi (almeno 1). |
| **Per squadra** | 12 | Giocatori per gruppo (almeno 1). |
| **Semiestensione della mappa (m)** | 4000 | Metà della larghezza dell'area di gioco su X e Z. |
| Riga di stima | | "≈ X GB di RAM, Y GB sulla GPU dopo la quantizzazione." (circa 26 byte di RAM e 8 byte sulla GPU per riga). |
| **Genera** | | Genera nel worker di importazione, con l'avanzamento, e sostituisce qualsiasi dataset caricato. |

La generazione avviene nel worker in background, così decine di milioni di righe non bloccano la pagina.

## Che cosa genera {#what-it-generates}

Da [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Colonne:** posizione, tempo, persona (`P000`, `P001`, ...), gruppo (`Team 1`, `Team 2`, ...), imbardata e beccheggio, e durate di vita. Nessuna colonna di sessione e nessuna colonna di filtro.
- **Tempo:** un campione per giocatore ogni 0,25 s, a partire da 0 (tempo relativo, nessun orologio reale).
- **Movimento:** ogni squadra parte nel proprio settore di un anello al 55-95% della semiestensione. Un cerchio sicuro centrato vicino al centro (spostato a caso fino a un quarto della semiestensione) si restringe all'8% della semiestensione in sei fasi con pianori; ogni giocatore si dirige verso un punto vagante al suo interno, con smorzamento e rumore. L'altezza oscilla tra 0 e 220 m.
- **Direzione dello sguardo:** imbardata lungo la direzione di marcia, beccheggio dalla velocità verticale.
- **Ripetibile:** il seme casuale è fisso (1337), quindi le stesse impostazioni producono sempre gli stessi dati.

Ogni modalità di calore, il replay dei box e la mappa di calore delle linee (tracce intere, dato che non c'è una colonna di eventi) funzionano su di esso. Anche la Cronologia della durata funziona.
