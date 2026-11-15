---
title: "Gravações Tacview (ACMI)"
parent: "Carregar dados"
nav_order: 7
lang: "pt"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---


# Gravações do Tacview (ACMI)

O Tacview é um programa que grava voos em simuladores de voo; os seus ficheiros terminam em `.acmi`. O 3DHeat abre-os para que veja por onde voou cada aeronave.

As gravações de voo do Tacview carregam como qualquer tabela: escolha ou arraste um `.acmi` (texto, `.txt.acmi`, ou comprimido, `.zip.acmi`) e prima **Carregar**. Fica então com o calor de todos os voos e, no separador **Partida**, um replay com figuras, trajetos e uma lista de eventos ([Replay de partida](match-replay.md)). O ACMI é o formato público de ficheiros do Tacview ([documentação](https://www.tacview.net/documentation/acmi/)); o DCS (através do exportador do Tacview), o IL-2 Great Battles, o Falcon BMS, o X-Plane, o MSFS e outros escrevem-no, por isso isto lê qualquer um deles.

## O que uma gravação se torna {#what-a-recording-becomes}

Uma linha de cada vez que a posição de um objeto é escrita, uma linha por evento no lugar do objeto, e uma linha quando um objeto sai (`Removed`, onde estava por último). Um evento sobre um objeto ainda não visto - um marcador, uma mensagem para todos - é uma linha do objeto `(recording)` no ponto de referência. A gravação traz as suas próprias instruções de leitura, por isso o passo de mapeamento preenche-se sozinho. O leitor escreve estas colunas: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, e depois quaisquer outras propriedades que a gravação tenha. Os seus papéis:

| Coluna | Papel | Significado |
|---|---|---|
| Time | tempo | Segundos depois do ReferenceTime da gravação; segundos Unix quando tem um, para que o relógio mostre a hora real. |
| X, Y | posição | Este e norte, em metros, num plano tangente à Terra no ponto de referência da gravação: distâncias e rumos são verdadeiros perto dele, com um desvio inferior a uma parte em mil a 100 km. O norte passa a ser o -Z do mundo. |
| Altitude | posição (para cima) | Metros. |
| Object | pessoa | O piloto e o nome do objeto com o seu id, por exemplo `Viper 1 (F-16C_50) #a01`; um objeto não tripulado `(T-90A) #401`. |
| Coalition | equipa | O lado (ou a cor, quando não há coligação). |
| Heading, Pitch | olhar | Graus; o rumo 0 é o norte. |
| Recording | sessão | O Title da gravação, ou o nome do ficheiro: várias gravações carregam lado a lado sem que os seus trajetos se juntem. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtros | Guardadas para filtrar; Type e Name escolhem a [figura](figures.md) de cada objeto, Event alimenta a lista de eventos da análise, Roll inclina a aeronave. |
| U, V | | As metros planas do mundo do próprio jogo, quando todas as amostras as têm (o DCS escreve-as). |
| EventObjects | filtros | Cada objeto que um evento nomeia (`Message|a01|b02|...`), pelo id. |
| RecordingInfo | | As propriedades da própria gravação tal como estavam nesse momento - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - em JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtros | Qualquer outra propriedade numérica que a gravação tenha. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtros | Qualquer outra propriedade de texto que a gravação tenha; uma propriedade com um valor que não é número é texto. |

Lêem-se as quatro formas da posição do Tacview (`lon|lat|alt`, com `u|v`, com `roll|pitch|yaw`, e com todas elas e um rumo), e os campos vazios mantêm o último valor; `-id` remove um objeto, e um id usado de novo depois disso é um objeto novo. As vírgulas escapadas e as linhas continuadas são tratadas.

As posições são sempre projetadas a partir da latitude e da longitude, nunca tiradas de U/V, por isso as gravações de todos os jogos partilham uma projeção com um fundo do mundo real.
