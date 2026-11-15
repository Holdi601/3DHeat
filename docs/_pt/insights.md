---
title: "Descobertas"
nav_order: 7
has_children: true
lang: "pt"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: false
---

# Descobertas

**Descobertas** procura nos dados carregados o que se destaca - posições fortes, terreno mortal, armadilhas de nascimento, pontos de estrangulamento, jogadores muito acima dos seus pares - e diz-lho, o mais forte primeiro, com as provas. Use-o para perceber num minuto onde uma partida foi ganha ou perdida. Pode depois escrever um resumo, e numa única repetição pode funcionar como comentador que salta para os grandes momentos.

Tudo é contado no seu navegador. Nada sai do seu computador a não ser que ligue uma IA externa (ver [IA externa](#external-ai)).

![Descobertas no demo de tanques: 14 achados, o mais forte primeiro](../assets/img/pt/insights.webp)

A secção **Descobertas** está na barra lateral dos separadores Mapa de calor e Partida. Tem três separadores: **Descobertas**, **Resumo** e **Comentarista**.

## Descobertas {#findings}

1. Carregue dados e abra **Descobertas**. Prima **Encontrar descobertas** ("A contar... n%" mostra o progresso).
2. Leia a lista. Cada descoberta tem uma barra de força, uma frase, a qualidade das provas (*Provas fortes*, *Provas boas* ou *Algumas provas*), o detetor que a encontrou, e a classe de veículo quando isso importa.
3. **Clique numa descoberta**: o visualizador aplica os seus filtros, leva a câmara ao sítio e salta para o tempo, e abre os detalhes: o efeito com o seu intervalo de 95%, os valores de p e q, as provas contadas, e **Volume aqui**, que desenha um [volume](volumes.md) à volta do sítio.
4. **Restaurar filtros** repõe os seus filtros. **Copiar JSON** copia o relatório completo.

A contagem usa os filtros atuais, os grupos ocultos e a partida escolhida em todo o intervalo de tempo. Quando depois mudar os filtros, uma nota avisa-o; prima **Contar de novo**.

As linhas no topo da lista (por exemplo os totais de dinheiro) resumem o conjunto de dados inteiro antes das descobertas.

![Uma descoberta aberta: a zona quente de disparos, os seus números e uma passagem correspondente da literatura](../assets/img/pt/insights-finding.webp)

### Os detetores {#the-detectors}

| Detetor | O que encontra | Necessita nos dados |
|---|---|---|
| **Posições de poder** | Sítios com probabilidades de abate-morte muito melhores que o resto do mapa, e *terreno seguro* onde morrem poucos pelo tempo passado | eventos de abate e morte |
| **Zonas quentes e frias** | Sítios onde um tipo de evento (disparos, impactos, capturas ...) acontece muito mais ou menos do que o tempo ali passado prevê | uma coluna de eventos |
| **Terreno aberto e cobertura** | Mortes a descoberto contra geometria do nível próxima, e lentidão contra movimento rápido | mortes; um nível 3D para a parte da geometria |
| **Spawns** | Spawns fortes, armadilhas de spawn, spawns seguros, tempo até ao primeiro contacto | tempo e pessoas |
| **Classe por local** | Uma classe de veículo, ou jogadores contra IA, a sair-se muito melhor ou pior numa área | abates mais uma classe de veículo ou uma coluna jogador/IA |
| **Jogadores** | Jogadores que matam ou morrem muito mais ou menos que outros da mesma classe | pessoas e abates |
| **Gargalos e flancos** | Pontos de estrangulamento (muito mais travessias do que o terreno em volta) e rotas de flanco (pouco usadas, mas que levam a abates) | pessoas |
| **Valor** | *Terreno caro* e *Terreno rentável* | [colunas de valor](value-weighting.md) |

Os detetores que não conseguem correr nos dados aparecem no fundo da lista com o motivo.

### Como as descobertas são ordenadas {#how-findings-are-ranked}

Cada sítio ou grupo é testado contra o resto do mapa (testes binomiais exatos ou de taxa). A taxa de falsas descobertas é mantida em 5% (Benjamini-Hochberg). O acaso pode parecer um padrão; isto mantém os falsos alarmes baixos: entre as descobertas mostradas, espera-se no máximo cerca de uma em vinte por acaso. Efeitos com poucos eventos são puxados para "nenhum efeito" antes de se ordenar. São listadas no máximo 60 descobertas, e cada detetor fica com algumas posições no topo.

## Resumo {#debrief}

O separador **Resumo** escreve as descobertas num texto curto: uma abertura, a descoberta mais clara, uma para táticas, uma para equilíbrio, as restantes agrupadas por detetor, e quantas assentam em provas mais fracas. Cada parágrafo tem botões numerados que mostram as suas descobertas. **Copiar texto** copia-o.

![O resumo escrito pelo narrador incorporado](../assets/img/pt/debrief.webp)

O narrador incorporado funciona offline, no seu idioma. O seletor **Lente** acima dele (ver [A lente de conhecimento](knowledge.md)) decide que literatura os parágrafos citam.

### IA externa {#external-ai}

**Configurações de IA** permite que um modelo de IA à sua escolha escreva o resumo:

| Definição | Significado |
|---|---|
| **Provedor** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (local), LM Studio (local), servidor llama.cpp (local), ou qualquer endpoint compatível com OpenAI |
| **URL base**, **Modelo** | Preenchidos pelo provedor; **Listar modelos** pergunta ao servidor |
| **Chave de API** | Enviada apenas para o URL base. Nunca registada, nunca guardada em vistas, exportações ou ficheiros `.3dheat`. A maioria dos servidores locais não precisa de nenhuma. |
| **Lembrar a chave neste navegador** | Desligado por omissão: a chave é esquecida quando a página fecha |
| **Usar uma IA externa** | Desligado por omissão |
| **Enviar nomes dos jogadores** | Desligado por omissão: os jogadores são enviados como P1, P2 ... |

Depois escreva uma pergunta opcional e prima **Escrever com IA**. Só as descobertas e os seus números são enviados - nunca as linhas dos seus dados. A resposta chega em fluxo; as descobertas citadas tornam-se botões.

## Comentarista {#caster}

Para **uma partida** (escolha uma se houver várias carregadas), o **Comentarista** encontra os momentos que valem a pena ver: primeiro sangue, multi-abates, trocas, clutches, viragens de objetivos, reviravoltas, jogadores em destaque, tiros longos.

![Os momentos do comentarista para uma ronda do demo de atirador](../assets/img/pt/caster.webp)

- Clique num momento: a vista passa para a repetição, salta para pouco antes, voa até lá e segue o jogador.
- **Reproduzir os momentos** reproduz cada um até ao fim e avança; **Anterior** / **Próximo** percorrem-nos.
- Com uma IA externa ligada, **Comentários da IA** escreve um comentário a partir da lista de momentos (tipos, tempos, nomes ou pseudónimos, equipas, classes, distâncias).

Precisa de pessoas e de eventos de abate/morte (ou captura); uma coluna `other`/`victim` torna possíveis as trocas e os tiros longos.

## A lente de conhecimento {#knowledge-lens}

Uma descoberta pode ser lida através de uma **lente** de conhecimento estabelecido: doutrina militar, combate aéreo e naval, operações urbanas, design de jogos e desporto eletrónico (ou *Auto*, escolhida pelas unidades dos dados). Uma descoberta aberta mostra então a entrada de **doutrina e literatura** mais próxima e um **paralelo histórico**, com referências, e **Métricas da lente** calcula medidas dessa literatura sobre os dados (ajustes de Lanchester, rácios de troca, rácios de forças, campos de tiro, terreno-chave, trocas, iniciativa). O resumo e o pedido à IA incluem-nas. Tudo sobre isto: [A lente de conhecimento](knowledge.md).

As métricas da lente também medem como os jogadores se comportam como multidão e como grupo - alinhamento e aglomeração, condução de rotas, faixas e trilhos, concentração, líderes e seguidores, retardatários, o ponto de rutura sob perdas, risco depois de uma vida perdida, sequências, concordância nas compras e a resposta ao fogo recebido - cada uma contra o seu próprio modelo nulo: [Comportamento coletivo](collective-behaviour.md).

## Dados que fazem as descobertas funcionar {#data-that-makes-insights-work}

- posições com **tempo**, uma coluna de **pessoa** e uma de **equipa**;
- uma coluna de **evento** com abates e mortes (`kill`, `death`), e outros (`hit`, `fire`, `capture` ...);
- uma coluna de **outra parte** (`other`, `victim`) para trocas e direções;
- uma coluna de **veículo** ou **tipo** para as classes; uma coluna `ai` para jogadores contra IA;
- uma coluna de **sessão** / **partida** / **ronda** quando há várias partidas.

Os [dados de demonstração](demo-data.md) têm todas elas.
