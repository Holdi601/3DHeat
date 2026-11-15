---
title: "Paridade com o Tacview"
parent: "Repetição da partida"
grand_parent: "Replay"
nav_order: 1
lang: "pt"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Paridade com o Tacview

O Tacview é um programa muito usado para ver gravações de voo. Se o conhece, esta página mostra onde está cada uma das suas ferramentas no 3DHeat.

Lista cada funcionalidade do Tacview 1.9 (o seu manual, a sua tabela de textos da interface e o formato de ficheiro ACMI 2.2) e onde se encontra a [repetição da partida](match-replay.md) do 3DHeat em relação a ela. O objetivo: o que o Tacview pode fazer por uma repetição e os seus dados, o 3DHeat também pode fazer.

**Estado:**
- **done**: já existe no 3DHeat.
- **new**: construído para igualar uma funcionalidade do Tacview.
- **not yet**: aplica-se, mas ainda não foi construído.
- **n/a**: não se aplica aqui, com a razão.

Onde encontrar as funcionalidades: o separador **Partida**, a **Repetição com figuras** (ou **Figuras sobrepostas** no separador Calor), nas secções da barra lateral **Repetição**, **Unidades**, **Eventos**, **Marcadores**, **Visualização tática**, **Estatísticas**, **Deslocamento no tempo e corte**, **Mapa e posição**, **Áudio e vídeo** e **Etiquetas**. Ver [Repetição da partida](match-replay.md).

## Câmaras {#cameras}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Vista de cabina (F5), com o horizonte a rodar com a aeronave | **Cabina**: fora da unidade ao longo da sua atitude, como o modelo de movimento a tem. A própria figura da unidade é recortada. Arraste para olhar à volta; **Olhar de novo em frente** repõe. | new |
| HUD na vista de cabina (escolha de IAS/CAS/TAS) | **Visor de cabeça alta** (H): horizonte e escada de inclinação da vista real, marcador da trajetória de voo, fita de rumo, IAS, altura, TAS, Mach, G, ângulo de ataque, velocidade vertical, AGL | new |
| Instrumentos 3D de cabina, seguimento da cabeça do piloto (PilotHead*), TrackIR | Sem modelos de cabina; os ângulos da cabeça são mostrados na vista **Bruto** do cartão da unidade | n/a (sem modelos de cabina; o seguimento da cabeça é hardware para voo ao vivo) |
| Vista externa (F6): orbitar o objeto principal | **Perseguição** (roda com a unidade) e **Órbita** (mantém a sua própria direção) | done |
| Câmara de combate aéreo, «Olhar para o alvo» (padlock) | **Padlock**: da cabina, mantida sobre o alvo | new |
| Câmara de combate aéreo, «Centrada» / «Olhar em frente» | **Alvo**: atrás da unidade na linha do alvo, olhando para além dela para o alvo. **Fixa** no azimute 0 olha em frente, a partir da frente. | new |
| Trocar o principal e o secundário | **Trocar** ao lado do alvo | new |
| Vista de satélite (F7), vista de cima ortográfica | **Satélite**: diretamente de cima sobre a unidade, norte para cima; arraste para rodar. O mapa 2D é o plano ortográfico. | new |
| Câmara livre (F8), W/A/S/D, E/C | A câmara livre de voo (W/A/S/D, Espaço/Q, Shift/Alt) | done |
| Câmara Head-On de complemento; câmara externa presa ao objeto | **Fixa**: um lugar à volta da unidade que roda e inclina com ela; arraste para o mover (atrás, numa ponta de asa, de frente) | new |
| Câmara Lock de complemento (congelar a posição) | Deixar de seguir (Esc): a câmara fica onde estava | done |
| Vista estratégica (afastar até à Terra inteira) | [Cenário do mundo](world-backdrop.md) e a moldura da gravação inteira do mapa 2D | done |
| Definição do campo de visão | **Câmara e cena**, campo de visão (FOV) | done |
| Mudar de vista com teclas | **V** vista seguinte, **Shift+V** volta atrás | new |

## Opções da vista 3D e do ecrã {#d-view-and-display-options}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Rastos em fita, controlo de comprimento | Rastos (segundos) no visualizador de equipas | done |
| Rasto antecipado (trajeto à frente) | **Trajeto à frente**: por onde a unidade realmente vai nos próximos segundos | new |
| Linhas de altura do objeto / paredes | **Linhas verticais** | done (linhas; paredes não construídas) |
| Vetores do objeto selecionado: rumo (pontilhado), rota (sólido), sustentação | **Vetores de velocidade** (rota e velocidade durante tantos segundos, com uma dica) e **Linhas de nariz e sustentação** (nariz tracejado, sustentação curta e escura) | new |
| Linha de visão do piloto | **Linha de visão do piloto**: uma linha ciano tracejada ao longo de PilotHeadYaw/PilotHeadPitch (ou de uma coluna HeadYaw, ViewYaw ou LookYaw) contra os eixos da unidade | new |
| Cúpulas de alcance letal de SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, os gémeos «2») | **Zonas de engajamento**: cúpulas, ovoides onde o alcance vertical é diferente, desligadas enquanto EngagementMode for 0 | new |
| Bloqueios de radar (LockedTarget..9) com etiquetas | **Bloqueios**: linhas vermelhas para cada objeto bloqueado; tracejado âmbar para FocusedTarget; ao longo de LockedTargetAzimuth/Elevation/Range onde nenhum objeto é nomeado. **Etiquetas de bloqueio**: o nome e o alcance do alvo em cada linha de bloqueio | new |
| Cone de radar (RadarMode, Azimuth, Elevation, Roll, Range, larguras do feixe) e porta de alcance | **Cones de radar**: aro e anel do meio do feixe, virado pelo azimute, pela elevação e pelo roll contra a unidade; a porta de alcance como dois aros amarelos. Sem larguras do feixe, só o eixo do feixe. | new |
| Linha de visão entre os dois objetos selecionados (verde / vermelha pontilhada quando o terreno bloqueia) | A linha do par medido fica vermelha e tracejada quando o nível está entre eles | new |
| Aumentar automaticamente os objetos distantes | Figura mais pequena no ecrã (pixels) | done |
| Grelha de latitude/longitude | **Mapa e posição → Grelha**: linhas de latitude e longitude no chão por baixo da câmara, com um espaçamento redondo conforme a altura (de 10° até 1'), com etiquetas; ou a grelha de quilómetros **MGRS** da zona UTM, com a zona e o quadrado de 100 km mostrados. A grelha do próprio mapa 2D como antes | new |
| Anéis de bullseye | Anéis à volta do bullseye de cada equipa no mapa 2D | new (só 2D) |
| Sobreposição de rampa de planeio | **Rampas de planeio**: trajetos de 3° com as bordas de escala total de ±0,7° em ambas as extremidades de cada pista perto da gravação, a partir das soleiras e elevações medidas da OurAirports (descarregadas uma vez, guardadas offline), uma marca em cada milha náutica, com o nome do aeroporto e da pista | new |
| Restrições de altitude (alarme de teto/piso) | **Restrição de altitude**: um piso e um teto; as etiquetas das unidades fora ficam vermelhas, e cada cruzamento (abaixo do piso, acima do teto, de volta para dentro) fica listado - um clique vai lá e segue a unidade | new |
| Objetos destruídos a cinzento, removidos ao fim de 15 min | As vidas acabam com o seu rasto; uma unidade morta fica esbatida na lista de unidades | done |
| Propriedades Visible / Disabled | Mostradas em **Bruto**; nada fica escondido por elas | not yet |
| Mostrar posições do manche/acelerador/pedais | Acelerador e valores do motor em campos; entradas de comando em **Bruto** | done (como valores) |
| Comentários como legendas | **Mensagens como legendas** (Etiquetas): eventos ACMI Message e Comment, e conversas de qualquer jogo (eventos Chat, Say ou Radio, ou uma coluna de conversa), na parte de baixo da vista com quem disse, durante seis segundos | new |
| Visualização de data e hora UTC | Relógio da linha temporal com UTC onde a gravação tem uma hora de referência | done |
| Posição do rato em lat/long, MGRS, bullseye | O cartão do ponto (clicar num ponto) dá a latitude/longitude em graus, minutos e segundos e o MGRS ao lado dos metros do mundo; bullseye por unidade (campo) | new |
| Logótipo personalizado | Não construído | n/a (marca) |
| Modelos 3D, o mais próximo quando desconhecido | Catálogo próprio de figuras, o equivalente mais próximo, tamanho real | done |
| Múltiplos engajamentos (linhas entre todos os pares) | **Linhas de engajamento**: de cada unidade no âmbito até cada adversário dentro do alcance definido (1-200 km), cada uma com o seu alcance, os 60 pares mais próximos; o par medido como antes | new |

## Etiquetas {#labels}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Etiquetas ligadas/desligadas, em separado para objetos selecionados e não selecionados | **Etiquetas** com regras para **Selecionadas**, **Aeronaves**, **Terrestres**, **Navios**, **Armas** e **IA**: mostradas ou não, valores próprios, prioridade | new |
| Campos de etiqueta: nome, indicativo, piloto, velocidades (TAS/CAS/IAS/Mach/GS), alturas (ASL/AGL), VS, AOA, AOS, G (vertical, lateral, longitudinal), taxa e raio de viragem, energia, peso/volume/fluxo de combustível, rumo/rota, roll/pitch, frequência cardíaca | Cada valor de `fields.ts`: a mesma lista, calculado onde não foi registado (estimativas marcadas com ~). Taxa de roll e SpO2 só por Bruto. | done |
| Posição do bullseye nas etiquetas | Campo **Bullseye (rumo / distância)** | new |
| Desvios de ILS, distância voada | Valores em Bruto; distância voada nas estatísticas | done (em parte) |
| Retirar telemetria não selecionada do ecrã | **Manter as etiquetas afastadas**, ordenadas pela prioridade de cada regra | done / new |
| Etiquetar todos os objetos terrestres / só as ameaças | As regras Terrestres e IA | new |
| Escala das etiquetas | **Tamanho das etiquetas** (60-250 %) | new |
| Unidades métricas / imperiais | Métricas / imperiais | done (duas predefinições, não oito) |

## Informação e telemetria do objeto {#object-info-and-telemetry}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Seleção principal e secundária | Clicar segue e seleciona; shift-clique em dois para medir; seletor **Alvo** | done / new |
| Alcance / rumo / aspeto / aproximação entre dois objetos | Linha BRAA do par medido; campos Alcance, Rumo, Aspeto e Aproximação da unidade seguida | done |
| Marcação relativa, taxa da linha de visada | Campos **Marcação relativa** (fora do nariz da unidade seguida, E/D) e **Velocidade angular da linha de visada** (°/s) | new |
| Janelas de telemetria | O cartão da unidade e o cartão ao passar o rato | done |
| Telemetria bruta (cada propriedade registada, também as desconhecidas) | **Bruto** no cartão da unidade: cada coluna na linha da unidade, como escrita | new |
| Lista de objetos ativos | **Unidades**: jogadores, IA, armas em voo, as vivas em destaque | done |
| Janela de propriedades da gravação (título, autor, briefing...) | Guardadas na coluna RecordingInfo; mostradas em Bruto | done (sem janela) |
| Formatos de posição DMS/MGRS, norte magnético | Campo **Posição (lat / long)** em DMS e campos **MGRS**; campo **Rumo magnético**; **Rumos magnéticos** escreve o rumo, a rota e o rolamento magnéticos (°M) e mostra uma bússola com os dois nortes e a variação - o World Magnetic Model 2025 (coeficientes de domínio público), calculado aqui no lugar e data da unidade | new |

## Gráficos {#charts}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Gráfico de um objeto, até 4 valores | **Ao longo do tempo** (e o gráfico em Repetição) | done |
| Traçar até 4 objetos de uma vez | **Comparar**: um valor de até 8 unidades numa só escala | new |
| Valor contra valor (estilo energia-manobrabilidade) | **Valor vs valor**: taxa de viragem contra velocidade ou qualquer par, cada unidade uma linha, o seu ponto atual marcado | new |
| Eixo X pelo tempo; zoom; deslocar o tempo a partir do gráfico | A roda do rato aproxima no tempo, duplo clique repõe, clicar vai para o momento | new |
| Eixo X pela distância no ar ou no solo | **Tempo / Distância no ar / Distância no solo** nos gráficos de tempo e de comparação; o zoom e o ir-ao-clicar funcionam da mesma forma | new |
| Gráficos predefinidos (energia, aceleração...) | Qualquer valor pode ser escolhido (a altura de energia e a sua taxa são valores) | done |

## Estatísticas, registo de voo, eventos {#statistics-flight-log-events}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Registo de voo: descolou, aterrou, disparou, atingido por, destruído por, saiu da área | **Estatísticas** por unidade: vidas, abates, mortes, disparos, acertos, taxa de acerto, descolagens, aterragens, tempo no ar, G máximo (e mínimo), velocidade máxima, altura e Mach, distância. As descolagens vêm dos eventos TakenOff/Landed, de OnGround, de AGL, ou de uma estimativa marcada com ~. | new |
| Quadro de pontuações e complementos de relatório de missão | Resumo por equipa e mais abates; o próprio quadro de pontuações do resumo da partida | new / done |
| Exportar registo de voo em XML/CSV | **Exportar CSV** das estatísticas, e dos eventos como listados | new (só CSV) |
| Exportar telemetria em CSV a uma taxa | **Telemetria da unidade selecionada**: cada valor, de 1 a 20 por segundo | new |
| Registo de eventos, duplo clique para ir lá e selecionar | Lista **Eventos**, filtrada por tipo e unidade; um clique voa até lá | done |
| Evento anterior / seguinte (Ctrl+←/→) | **Page Up / Page Down** | new |
| Pausar no evento | **Pausar no evento** | new |
| Marcadores na linha temporal (libertações, acertos, destruições; os da unidade selecionada a azul; marcadores a vermelho) | Abates e mortes como barra de densidade, os da unidade seguida a azul, marcadores a vermelho; clicar para ir | new |
| Remover um evento, remover abate | Não construído | n/a (os eventos são da gravação; os filtros os escondem) |

## Marcadores {#bookmarks}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Inserir marcador com seleção e ponto de vista | **Adicionar marcador** (B): o momento, a câmara livre ou a unidade seguida com a sua vista, distância e alvo; com nome; guardado neste navegador por gravação | new |
| Remover marcador | × na lista | new |
| Marcadores na linha temporal e nos registos | Marcas a vermelho; a lista | new |
| Event=Bookmark no ACMI | Listado nas marcas da gravação, com abates, mortes e mensagens | new |
| Atalho copiar/colar (partilhar uma vista) | **Exportar / Importar** os marcadores como ficheiro; C copia a pose da câmara | new |

## Reprodução {#playback}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Reproduzir/pausa, para o início, velocidade, deslocar na linha temporal | Linha temporal | done |
| Quadro a quadro | **,** e **.** um segundo para trás e para a frente (Shift: dez) | new |
| Reprodução ao contrário | **◀** na linha temporal, **J** (**L** para a frente; a mesma tecla outra vez pausa): reproduz do fim para o início à velocidade escolhida, em ciclo ou parando no início | new |
| Janela de salto no tempo | A linha temporal e a lista de eventos | done |
| Deslocar no tempo um objeto (fantasma) | **Deslocamento no tempo e corte**: mover o voo de uma unidade, ou uma gravação inteira, em tantos segundos; **Alinhar as gravações** move várias gravações para começarem juntas e reproduz-as ao mesmo tempo (duas saídas em dias diferentes lado a lado). A gravação é reconstruída, por isso os rastos, os eventos, os gráficos e as estatísticas acompanham | new |
| Cortar antes/depois | **Desde agora / Até agora / Cortar a este intervalo** (desfazer mantém os deslocamentos), depois **Exportar CSV** (volta a carregar no 3DHeat) ou **Exportar ACMI** (texto Tacview 2.2, para uma gravação colocada na terra) | new |

## Terreno e mapa {#terrain-and-map}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Terreno real, elevação e texturas personalizadas | Níveis (o próprio mapa do jogo como modelo 3D), mosaicos do cenário do mundo | done |
| Modos de terreno plano / vazio / de alto contraste | [Aspeto do nível](level-appearance.md): relevo do solo, superfície e estruturas mostrados ou não | done (não são os mesmos modos) |
| Mapa tático 2D (o Tacview não tem; tem vista de satélite) | **Mapa 2D**: vista de canto ou inteira, símbolos por tipo e equipa (jogadores preenchidos, IA contornada) virados para o seu rumo, rastos, nomes, barra de escala, anéis de alcance à volta da unidade seguida, anéis de bullseye, o lugar da câmara 3D, mortes recentes; arrastar, roda, clicar para seguir (M) | new |
| Objetos estáticos (aeroportos, pistas, pontos de passagem, áreas, KML) | Pistas medidas (OurAirports) no cenário do mundo e as suas rampas de planeio; pontos de passagem GPX e marcas KML carregam como objetos fixos; o [Quadro tático](tactics-board.md) desenha áreas e rotas | new |

## Importação, exportação, gravação {#import-export-recording}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Texto e zip ACMI | [Gravações Tacview (ACMI)](tacview-acmi.md) | done |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (trajetos, rotas, pontos de passagem; frequência cardíaca, cadência, potência, temperatura da Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC e GGA de qualquer emissor, somas de controlo verificadas, passando da meia-noite), **IGC** (registos B, data, piloto e planador), **FIT** (mensagens de registo, marcas de tempo comprimidas) - cada um colocado por latitude e longitude no plano a meio dos trajetos, para que o cenário do mundo fique alinhado; rumo, inclinação e velocidade do ficheiro ou de ponto a ponto. CSV e Parquet como antes | new (DIS n/a: é um protocolo de rede ao vivo) |
| Gravadores nativos (DCS, BMS, IL-2, MSFS...) | Os conversores próprios do 3DHeat (War Thunder, CS2, Squad, Arma e outros) | done (próprios) |
| Telemetria em tempo real por TCP, ADS-B | Não construído | n/a (repetições depois da partida) |
| Áudio e vídeo sincronizados | **Áudio e vídeo**: um ficheiro local reproduz, pausa, procura e muda de velocidade com a linha temporal a partir de um início definido (**Começa agora**, ±0,1 s); um vídeo num painel redimensionável sobre a vista, ou imagem-em-imagem. O ficheiro fica no navegador | new |
| Exportação de vídeo | [Percurso da câmara e vídeo](camera-path-and-video.md) | done |

## Outros {#other}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Complementos Lua | Não construído | n/a (código aberto: altere o próprio visualizador) |
| Debriefing online (sessão partilhada) | Não construído | n/a (o do Tacview é uma sessão alojada que mantém todos no mesmo cursor de reprodução. O 3DHeat não tem servidor e guarda as gravações na máquina do visualizador, e até uma ligação ponto a ponto precisa de um servidor de sinalização. Um debriefing partilha-se como ficheiros: a gravação cortada (Exportar ACMI ou CSV) e o ficheiro de marcadores, que abrem nos mesmos momentos e vistas) |
| Controlo remoto pelo instrutor | Não construído | n/a (controla um simulador em execução) |
| Edição de objetos (adicionar, editar, remover objetos) | [Quadro tático](tactics-board.md) para objetos planeados; as gravações são só de leitura | n/a |
| Idiomas | 40 idiomas | done |
| Autenticação das gravações | Não construído | n/a |

## Para programadores: propriedades ACMI 2.2 {#for-developers-acmi-22-properties}

Lidas por `data/acmi.ts`; as propriedades numéricas tornam-se colunas numéricas, as de texto colunas de categoria. Todas são mostradas em **Bruto** no cartão da unidade. Estas são lidas com um fim:

| Propriedades | Utilização |
|---|---|
| T (as quatro formas), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Posição, atitude, figura, nome da unidade, equipa |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Campos, gráficos, HUD, deteção de descolagem e aterragem |
| VerticalGForce, LongitudinalGForce, LateralGForce | Campos de G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Campos |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Campos de combustível, somados pelos depósitos |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Cones de radar e porta de alcance |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Linhas de bloqueio |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Cúpulas de engajamento |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Campos |
| Health | Campo |
| Eventos: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Lista de eventos, estatísticas (mortes, descolagens, aterragens), marcadores; Message e Comment como legendas |
| PilotHeadYaw, PilotHeadPitch | Linha de visão do piloto |
| Etiqueta de tipo Bullseye (Navaid+Static+Bullseye) | Campo de bullseye e anéis do mapa |
| Tudo o resto (PilotHeadRoll, comandos, superfícies, desvios de ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, tamanhos...) | Mostrado como escrito em **Bruto** |

Os ângulos do radar e dos bloqueios são tomados contra os eixos próprios da unidade: azimute para a direita, elevação para cima, roll com a asa direita para baixo. A especificação ACMI diz que são relativos à aeronave, mas não qual o sentido positivo; esta leitura segue a sua transformação (guinada no sentido horário, inclinação para cima, roll com a direita para baixo).
