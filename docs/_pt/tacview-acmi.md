---
title: "Gravações Tacview (ACMI)"
parent: "Carregar dados"
nav_order: 7
lang: "pt"
source: "tacview-acmi.md"
source_hash: "08423333214c"
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

## Servidores de DCS: quem ganhou e como terminou cada saída {#dcs-servers-who-won-and-how-each-sortie-ended}

Um servidor multijogador de DCS grava as suas missões com o Tacview a qualquer hora, e um servidor PvP persistente conduz uma campanha ao longo de muitas delas: um lado ganha ao tomar todos os aeródromos, FARP e zonas do outro, o que leva dias e muitos reinícios de missão. As gravações contêm os voos, não a campanha: nenhuma mensagem diz quem tomou o quê, os aeródromos são escritos uma vez no início, e nenhuma diz quem ganhou. O conversor do Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) acrescenta a cada linha o que se pode saber e deixa vazio o que não se pode - nunca adivinha.

| Coluna | Significado |
|---|---|
| `server` | o servidor ou a campanha, a partir do cabeçalho da gravação (o seu Title, Author e Comments nomeiam os servidores públicos conhecidos - Blue Flag, SPS Contention, Growling Sidewinder; caso contrário, um Author que nomeie alguém); `--server Name` dá-lhe nome para uma pasta inteira. Uma gravação cujo cabeçalho não nomeia nenhum servidor - um Author como `Admin`, um Title e Comments que nenhum servidor conhecido escreve - fica sem atribuição: `server` vazio, mesmo que tenha sido transferida da página de gravações de um servidor, pois essa página pode conter também missões de outras comunidades |
| `mission` | o Title da gravação sem a versão nem o mês de campanha: `Operation_Example_V7.7.99` passa a `Operation Example` |
| `campaign` | a ronda de campanha a que a gravação pertence, por servidor, mapa e número: `Example Server North 3`. Uma gravação é uma sessão (de reinício a reinício); uma ronda dura muitas sessões, dias ou semanas |
| `round` | o número dessa ronda: o do servidor, se publicar um, senão a n-ésima ronda vista desse servidor e desse mapa; vem de um ficheiro de rondas (abaixo), vazio sem ele |
| `session` | o lugar da gravação entre as sessões da ronda, 1, 2, ...; `sessionStart` o seu início real (segundos Unix) |
| `heldRed`, `heldBlue` | os lugares disputados que cada lado tinha no início da sessão, a partir de um ficheiro de rondas encadeado (abaixo) |
| `won`, `matchWon` | 1 quando o lado da linha (a sua Color, Red ou Blue) ganhou essa campanha, 0 quando a perdeu; vazio onde nenhum ficheiro de rondas nomeia um vencedor, e nas linhas neutras. Uma campanha é ao mesmo tempo a ronda e a partida, por isso ambas têm o mesmo valor |
| `roundEndReason` | `capture` para uma campanha ganha ao tomar tudo |
| `won`, `matchWon` em cada sessão de uma ronda | o resultado da ronda, escrito em cada uma das suas gravações assim que o seu fim é conhecido |
| `sortie` | nas linhas de um avião: o seu voo, 1, 2, ... de descolagem a descolagem; o tempo em terra antes da primeira descolagem e depois de uma aterragem conta para o voo a que pertence |
| `sortieResult` | como esse voo terminou: `landed`, `landed damaged` (depois de ser atingido no ar), `ejected`, `shot down`, `destroyed` (em terra), `crashed`, `despawned` (desapareceu no ar sem causa visível - um jogador que sai), `airborne at end`, `no takeoff` |
| `sortieKills` | os abates atribuídos ao avião nesse voo |

Num servidor persistente, a saída é a unidade que faz sentido: filtre por `sortieResult` = `shot down` para ver onde se perderam voos, ou divida o calor por `sortieResult` ou por `server` no [detalhamento](breakdown.md). As descolagens, aterragens, ejeções, abates e despenhamentos de que é feita são os eventos que o conversor deduz da forma como os aviões se movem (acima).

Os lugares tomados entre duas sessões de uma ronda - conhecidos pelo ficheiro de rondas, abaixo - são eventos `capture` no início da gravação seguinte: `Object` `(campaign)`, no lugar, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Um aeródromo ou FARP que muda de lado onde a gravação o mostra - escrito de novo na outra cor, ou removido e escrito de novo no seu sítio na outra em menos de cinco minutos - torna-se um evento `capture` na pista: `Event` = `capture`, `Airfield` o seu nome, `Detail` `Red to Blue`, `Coalition` o seu novo lado. Uma pista escrita pela primeira vez numa cor não é uma captura. Os servidores analisados até agora escrevem as suas pistas uma única vez, por isso as suas gravações não contêm capturas.

### Ficheiros de rondas {#rounds-files}

Um ficheiro de rondas indica, por servidor, as suas rondas de campanha, quem as ganhou e as sessões de cada uma. Vem do que o servidor publica, ou das próprias gravações (abaixo).

Quem ganhou uma campanha é o servidor que o publica - um registo de campanhas na sua página web -, não está na gravação. Um ficheiro de rondas transporta-o, e o conversor lê-o com `--rounds file.json` (pode indicar-se mais do que um):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Uma gravação pertence às rondas do seu `server` cujo `title` (uma expressão regular) corresponde ao seu Title; cada linha pertence à ronda em que cai a sua hora real - o RecordingTime da gravação mais os segundos da linha, não a data da missão dentro do jogo. As horas estão em UTC. Uma ronda sem vencedor (rodada, ainda a decorrer) dá às suas linhas o número da ronda e um resultado vazio.

O equivalente no documento da partida, o rodapé `acmi`, diz de onde veio o resultado, tal como `result.source` numa partida de War Thunder: `outcome.result` é `{ winner, round, endReason, source }`, sendo `source` a `source` do ficheiro de rondas, ou `null` quando nada nomeou um vencedor. `outcome` lista também as rondas da gravação, as suas capturas e as suas saídas consoante a forma como terminaram:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Uma linha de um piloto `Viper 1 (F-16C_50) #a01` do lado azul nessa campanha diz então: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Rondas a partir das próprias gravações {#rounds-from-the-recordings-themselves}

Um servidor persistente mantém a sua campanha entre reinícios, e cada gravação começa com as unidades terrestres e os objetos estáticos de ambos os lados onde a campanha os deixou. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` lê os primeiros minutos de cada gravação ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), ordena no tempo as gravações de um mesmo mapa de cada servidor e encadeia-as:

- **Lugares**: o terreno em células de cerca de 2 km; uma célula é de um lado quando três quartos das unidades que lá estão no início de uma sessão são suas. Os lugares *disputados* são os que se viram nas mãos de ambos os lados.
- **Capturas**: um lugar nas mãos do outro lado no início da sessão seguinte - tomado entre as missões, ou durante a anterior.
- **Uma nova ronda**: uma sessão cujos lugares diferem dos da anterior em mais de 60 % - a disposição inicial de uma nova ronda, não um passo da antiga. Uma ronda também termina quando o servidor passa para outro mapa (as suas sessões começam depois da última e continuam).
- **Quem ganhou**: numa ronda terminada, o lado que tinha todos os lugares no início da sua última sessão (`capture`, confiança alta); senão, o lado que tinha mais lugares disputados (média se tinha o dobro do outro, senão baixa; baixa quando terminou com uma mudança de mapa). Uma ronda aberta não tem vencedor, mas cada sessão diz quantos lugares cada lado tinha no seu início, por isso vê-se quem ia à frente.
- Um servidor cujas sessões começam todas da mesma forma não guarda estado entre elas: não é encadeado.

O início da última sessão pode estar horas antes do fim da ronda, por isso a confiança importa. Verificada num servidor que publica os seus vencedores, a cadeia encontrou cada nova ronda na sessão em que começava a ronda publicada, e o lado que ia à frente no último início foi o vencedor publicado em cada uma das 9 rondas que conseguiu verificar. `--official file.json` mantém as rondas publicadas de um servidor assim e acrescenta-lhes as sessões da cadeia; o `validation` do ficheiro diz até que ponto a cadeia coincidiu. Numa campanha inventada:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Ver uma ronda de campanha como uma série {#watching-a-campaign-round-as-a-series}

Carregue juntas as gravações de uma ronda - os ficheiros com a mesma `campaign` - e o visualizador reprodu-las como uma única série: sessão após sessão pela sua ordem real, com as horas ou dias entre duas sessões reduzidos a uma pausa de um minuto. A linha temporal marca a amarelo o início de cada sessão e as pausas como faixas escuras, e o relógio diz que sessão está a ser reproduzida e a sua data real (`session 4/12 · 2026-11-02 12:38 UTC`). O calor, o replay, os filtros e as Descobertas funcionam sobre toda a série como sobre quaisquer dados carregados. A secção **Ronda de campanha** do separador Partida lista as sessões com as suas datas, quantos lugares disputados cada lado tinha em cada início - também como gráfico ao longo da ronda - e quantos foram tomados antes; um clique leva ao início de uma sessão. Uma gravação carregada sozinha diz lá que ronda e que sessão é. Gravações de rondas diferentes carregadas juntas não são uma série: cada uma começa em zero, como partidas separadas. O carregador de muitas partidas (**Muitas partidas de uma vez**) também reproduz uma ronda como série, em streaming e dimensionada para a GPU, para rondas de muitos gigabytes.

Os lugares que mudaram de mãos durante a ronda são desenhados no mapa como zonas de captura, coloridas pelo lado que tinha cada um no início da sessão em reprodução, e mudam nas fronteiras entre sessões; cada mudança é uma captura na lista de eventos do replay. São deduzidos das linhas carregadas - as unidades terrestres e os objetos estáticos de cada sessão nos seus primeiros minutos, em células de cerca de 2 km, como faz a cadeia -, por isso precisam do carregador completo (o carregador de muitas partidas guarda demasiado pouco de cada linha).

**Carregar a ronda inteira a partir de uma das suas gravações.** Num navegador normal, o visualizador não pode abrir ficheiros que não escolheu: carregue juntos os ficheiros da ronda. Servido pelo servidor local do visualizador (`npm run dev` ou `npm run preview`), já pode: dê ao ficheiro `tools/local-data.json`, ignorado pelo git, uma entrada `campaigns` que nomeie a pasta dos ficheiros de rondas e as pastas das gravações convertidas, e a secção Ronda de campanha de uma gravação isolada oferece **Carregar a ronda inteira**, obtém as sessões da ronda que lá encontra e carrega-as com o carregador de muitas partidas:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Só são servidas as gravações que um ficheiro de rondas nomeia (`tools/campaign-files.mjs`); uma sessão que não se encontra nessas pastas é contada, não carregada.

O que os servidores conhecidos publicam:

| Servidor | Uma ronda | Como um lado ganha | Onde se pode ler o vencedor |
|---|---|---|---|
| SPS Contention | uma campanha num mapa e numa época (dias), ao longo de muitos reinícios | todos os aeródromos, FARP e redutos tomados; uma campanha que terminou sem vencedor foi rodada | o registo público de campanhas do servidor (vencedor, início e fim de cada campanha) |
| Blue Flag | uma ronda de campanha ao longo de muitas missões de 5 horas; o `_YYYY_MM` do Title avança um mês a cada reinício | todas as posições inimigas tomadas; as rondas mais antigas indicavam o lado que tinha mais após um tempo fixo | não publicado em nenhuma forma encontrada até agora; a cadeia das gravações acompanha cada ronda e quem tem quanto em cada início |
| Growling Sidewinder | uma execução (6 horas) de uma missão de conflito aberto | zonas e aeródromos tomados | a sua página de estatísticas mostra pilotos, não resultados; cada sessão começa da mesma forma, por isso nenhuma ronda abrange várias sessões: vazio |
| Missões contra a IA (missões de capturar zonas) | uma execução da missão | o lado dos jogadores contra a IA da missão: sem resultado PvP | vazio |
| Sem atribuição (o cabeçalho não nomeia nenhum servidor) | - | - | vazio, `server` também vazio |
