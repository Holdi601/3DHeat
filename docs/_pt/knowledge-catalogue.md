---
title: "Catálogo de conhecimento"
parent: "A lente de conhecimento"
nav_order: 2
lang: "pt"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Catálogo de conhecimento

Esta é a lista completa do que a [lente de conhecimento](knowledge.md) sabe: os padrões que procura, as ideias, os métodos, os casos históricos e os estudos que cita, e os livros e artigos por trás deles. Use-a para procurar uma entrada pelo seu id ou para verificar uma fonte.

Esta página é gerada a partir da base de conhecimento por `node tools/knowledge-doc.mjs`; não a edite entre as marcas.

<!-- kb:begin -->

A base de conhecimento tem 579 entradas (135 conceitos, 37 métodos, 277 casos históricos, 17 princípios de desenho, 113 estudos) sobre 93 padrões, com 556 referências.

### Padrões (93) {#patterns-93}

| id | família | o que se vê nos dados |
|---|---|---|
| `concentration` | força | O lado que traz mais unidades para um mesmo sítio ganha esse sítio por mais do que o seu número sozinho explicaria. |
| `local-superiority` | força | Os abates vão para o lado que supera o outro em número dentro do alcance de combate, seja qual for o total. |
| `attrition` | força | As perdas seguem as forças dos dois lados ao longo do tempo; a luta é decidida por quem fica sem recursos primeiro. |
| `exchange-ratio` | força | Os abates por perda diferem muito consoante o sítio, o lado ou a classe. |
| `aimed-fire` | força | As perdas crescem com o número do inimigo, mas não com o próprio número. |
| `area-fire` | força | As perdas crescem com o produto dos números dos dois lados: a aglomeração é penalizada. |
| `defeat-in-detail` | força | Um lado é destruído aos poucos, à medida que as suas partes chegam uma de cada vez. |
| `mutual-support` | força | Uma perda é rapidamente respondida por um companheiro próximo: trocas. |
| `combined-arms` | força | As classes saem-se bem em conjunto quando cada uma cobre a fraqueza da outra, e mal sozinhas. |
| `class-counter` | força | Uma classe ganha de forma desproporcionada contra uma determinada outra classe ou num determinado sítio. |
| `initiative` | força | Quem marca primeiro num combate tende a ganhá-lo. |
| `key-terrain` | terreno | Os mesmos poucos sítios decidem os combates, partida após partida. |
| `fields-of-fire` | terreno | Os sítios que veem longe sobre o terreno que os outros têm de atravessar fazem mais abates. |
| `high-ground` | terreno | Os abates são feitos de cima do terreno onde estão as vítimas. |
| `cover` | terreno | As mortes por tempo descem onde a geometria bloqueia a vista e o fogo. |
| `open-ground` | terreno | As mortes por tempo sobem onde nada bloqueia a vista e o fogo. |
| `kill-zone` | terreno | As mortes concentram-se onde o movimento é forçado por um terreno observado e coberto por fogo. |
| `chokepoint` | terreno | Muitas passagens espremidas por pouco terreno, com perdas nesse sítio. |
| `reverse-slope` | terreno | Segurança logo atrás de uma crista ou de um muro, fora da vista direta do inimigo. |
| `safe-ground` | terreno | Um sítio onde se passa tempo mas onde morre pouca gente. |
| `obstacle` | terreno | As rotas contornam o terreno bloqueado e reduzem-se a poucos corredores. |
| `flank` | movimento | Uma rota pouco usada leva a mais abates do que as principais. |
| `avenue-of-approach` | movimento | O movimento flui por alguns corredores entre zonas. |
| `mobility` | movimento | As unidades em movimento morrem menos (ou mais) por tempo do que as lentas ou paradas. |
| `static-exposure` | movimento | As unidades paradas morrem mais por tempo do que as que se movem. |
| `interior-lines` | movimento | Um lado com rotas curtas entre os seus combates desloca a força mais depressa do que o outro. |
| `envelopment` | movimento | Os abates vêm de várias direções sobre a posição de um lado. |
| `ambush` | movimento | As unidades que avançam por uma rota morrem depressa para inimigos já em posição. |
| `spawn-pressure` | tempo | As vidas acabam pouco depois de começarem num mesmo spawn. |
| `tempo` | tempo | O lado mais rápido chega ao combate e marca antes de o outro reagir. |
| `surprise` | tempo | As perdas chegam em rajada, antes de as vítimas responderem. |
| `energy-advantage` | ar | Os que abatem têm mais altura e velocidade do que as suas vítimas. |
| `air-superiority` | ar | Os aviões de um lado abatem muitas vezes mais do que perdem. |
| `sead` | ar | As defesas antiaéreas de terra levam muitos aviões até serem encontradas e destruídas. |
| `bvr` | ar | Os abates acontecem a longa distância, antes de a vítima se aproximar. |
| `fleet-salvo` | mar | Uma força que desfere o primeiro golpe perde pouco; a outra sobrevive pouco para responder. |
| `scouting` | mar | O lado que encontra primeiro o outro escolhe o combate. |
| `urban-close` | urbano | Alcances de combate curtos, muitas mortes entre geometria densa, limpeza lenta. |
| `vertical` | urbano | Abates a partir de andares superiores ou telhados sobre as ruas. |
| `skill-dispersion` | pessoas | Poucos jogadores respondem por uma grande parte dos abates ou das mortes. |
| `ai-vs-player` | pessoas | As unidades controladas por IA têm resultados diferentes dos jogadores no mesmo sítio. |
| `balance` | desenho | Os lados, os spawns ou as classes começam com possibilidades desiguais. |
| `economy` | desenho | Os recursos ganhos, gastos e perdidos concentram-se em poucos sítios ou jogadores. |
| `flow` | desenho | Como os jogadores se movem pelo nível: ciclos, corredores, becos sem saída. |
| `sightlines` | desenho | As linhas de vista longas decidem onde começam os combates e quem os ganha. |
| `readability` | desenho | Mortes que os jogadores não conseguem ver chegar: por trás, de fora da vista. |
| `formation` | movimento | As unidades de um lado movem-se juntas numa forma reconhecível: linha, coluna, cunha, escalão, caixa. |
| `frontal-assault` | movimento | Um grupo aproxima-se do inimigo em linha reta, de frente para a sua frente. |
| `double-envelopment` | movimento | Dois grupos atacam os dois flancos de um mesmo corpo inimigo quase ao mesmo tempo. |
| `encirclement` | movimento | Um grupo inimigo fica cercado por todos os lados pelo outro lado e com poucas saídas. |
| `penetration` | movimento | Um grupo atravessa a linha inimiga quando há inimigos dos dois lados. |
| `fire-and-maneuver` | movimento | Parte de um grupo move-se enquanto o resto fica parado a cobri-lo, e os papéis alternam. |
| `feint` | movimento | Um pequeno grupo atrai o inimigo para um sítio; o esforço principal ataca noutro sítio pouco depois. |
| `withdrawal` | movimento | Um grupo em contacto vira-se e aumenta a distância ao inimigo. |
| `pursuit` | movimento | Um grupo segue um inimigo que se afasta, mantendo ou reduzindo a distância. |
| `defence-in-depth` | terreno | Os defensores ficam em várias faixas, uma atrás da outra, ao longo do eixo de avanço do inimigo. |
| `screening` | movimento | Um pequeno elemento avança bem à frente do seu corpo principal e encontra o inimigo primeiro. |
| `dispersion` | força | Um lado espalha-se ao longo do tempo; menos unidades suas ficam no mesmo sítio. |
| `missile-defence` | ar | Os aviões sob ameaça de míssil viram a ameaça para o lado ou para a cauda: crank, notch, drag, pump. |
| `angles-fight` | ar | Combate aéreo a curta distância, a baixa velocidade e com grande taxa de viragem, travado pela posição do nariz e não pela energia. |
| `cap` | ar | Os aviões orbitam uma posição fixa durante minutos, à espera que o inimigo apareça. |
| `strike-package` | ar | Aviões de funções diferentes voam juntos até um alvo; uns atacam o solo, outros dão cobertura. |
| `line-of-battle` | mar | Os navios avançam em coluna, um atrás do outro, para que todas as bordadas possam disparar. |
| `crossing-the-t` | mar | Uma coluna passa à frente da coluna inimiga: todos os seus canhões disparam, e poucos do inimigo. |
| `fatal-funnel` | urbano | Jogadores que entram por uma mesma porta, sala ou passagem estreita morrem ali em instantes com muito mais frequência do que se entrarem noutro sítio. |
| `crossfire` | força | Os jogadores cujas linhas de tiro convergem de ângulos diferentes ganham mais duelos do que um só jogador. |
| `peeker-advantage` | tempo | O jogador que entra em vista ganha os duelos contra quem segura o ângulo mais (ou menos) vezes do que a metade. |
| `entry` | tempo | O primeiro abate de uma ronda decide grande parte dela; as entradas ganham ou perdem consoante o sítio e o apoio. |
| `utility-support` | força | Um flash ou fumo logo antes de um duelo muda quem o ganha. |
| `man-advantage` | força | As rondas são ganhas pelo lado com mais jogadores vivos, e alguns lados convertem ou desperdiçam uma vantagem. |
| `clutch` | pessoas | Os últimos jogadores vivos ganham mais (ou menos) vezes do que o estado da ronda prevê. |
| `action-value` | pessoas | Abates, trocas, plantas e utilitários diferem no quanto mudam a probabilidade de vencer. |
| `lurk` | movimento | Um jogador sozinho, longe da equipa, abate (ou morre) a um ritmo diferente do grupo. |
| `rotation` | movimento | A rapidez com que um lado desloca jogadores para o combate ou para o objetivo decide se mantém ou recupera. |
| `collective-order` | pessoas | As unidades em movimento de um lado seguem na mesma direção muito mais vezes do que os seus próprios trajetos, deslocados no tempo, dariam ao acaso. |
| `milling` | pessoas | As unidades de um lado andam à volta de um centro comum: rotação sem deslocação líquida. |
| `herding` | pessoas | As unidades saem de um sítio da mesma forma que o companheiro anterior, para além das probabilidades do próprio sítio e para além de copiar o inimigo. |
| `lane-formation` | pessoas | Fluxos opostos mantêm-se em corredores separados; o movimento concentra-se em alguns trilhos reutilizados partida após partida. |
| `crowding` | pessoas | A velocidade e o fluxo descem quando as unidades se apertam; numa passagem estreita, empurrar com mais força faz passar menos. |
| `leadership` | pessoas | Algumas unidades viram primeiro e outras copiam o seu rumo alguns segundos depois. |
| `cohesion` | pessoas | As unidades que se afastam do seu grupo morrem com mais frequência do que as que o acompanham. |
| `breaking-point` | pessoas | Um lado que perdeu uma parte da sua força deixa de se aproximar e recua, para além do que a distância ao inimigo explica. |
| `panic` | pessoas | Sob uma ameaça súbita, as unidades dispersam-se, fogem ou ficam paradas, e a coordenação desfaz-se. |
| `loss-chasing` | pessoas | Depois de uma perda, as unidades correm mais (ou menos) riscos do que depois de um ganho. |
| `hot-hand` | pessoas | O sucesso segue o sucesso com mais frequência do que permitem sequências baralhadas do mesmo jogador. |
| `conformity` | pessoas | Os membros de um lado escolhem de forma semelhante - compras, equipamentos, rotas - para além das suas próprias preferências. |
| `suppression` | pessoas | O fogo que chega muda a forma como as unidades se movem e disparam, mesmo quando não as mata. |
| `social-loafing` | pessoas | A ação por cabeça desce à medida que há mais companheiros presentes. |
| `mixed-strategy` | pessoas | Escolhas que deviam ser imprevisíveis tornam-se padronizadas: uma opção ganha mais, ou as escolhas seguem sequências. |
| `coordination` | pessoas | Os membros atuam em sintonia sem ordens visíveis: movimento, tempo e escolhas sincronizados. |
| `contagion` | pessoas | Um estado passa de unidade para unidade por contacto ou proximidade e espalha-se pelo mapa. |
| `territoriality` | pessoas | As unidades mantêm distância entre si e defendem o seu próprio terreno. |
| `interaction-network` | pessoas | Quem luta, apoia e segue quem forma uma rede com centros, agrupamentos e pontes. |

### Conceitos (135) {#concepts-135}

| id | título | lentes | padrões | fontes |
|---|---|---|---|---|
| `concept.lanchester-square` | Lei do quadrado de Lanchester (tiro dirigido) | militar, ar, naval, esports | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lei linear de Lanchester (tiro de área, um contra um) | militar, urbano, esports | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Concentração de forças (massa) | militar, ar, naval, esports | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Rácios de forças e a regra de 3:1 | militar | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Rácio de trocas de perdas | militar, ar, esports, desenho | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Poder de combate e os seus multiplicadores | militar | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | O sistema moderno de emprego de forças | militar | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | O ciclo OODA (observar-orientar-decidir-agir) | militar, ar, esports | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Teoria da energia e da manobrabilidade | ar | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Manobras básicas de caça e manobra em combate aéreo | ar | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Análise do terreno: OAKOC / KOCOA | militar, desenho, urbano | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: variáveis da missão | militar | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Terreno-chave e terreno decisivo | militar, desenho, esports | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Observação e campos de tiro | militar, desenho, esports, urbano | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Abrigo e ocultação | militar, urbano, desenho | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Eixos de aproximação e corredores de mobilidade | militar, desenho | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Pontos de estrangulamento e desfiladeiros | militar, desenho, esports | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Áreas de combate e zonas de abate | militar, urbano, desenho | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Defesa da vertente oposta e abrigo em depressão | militar, desenho | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | As posições elevadas | militar, desenho | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Linhas interiores e exteriores | militar | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Derrota por partes | militar, esports | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Apoio mútuo | militar, ar, esports | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Armas combinadas | militar, desenho | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Supressão | militar, urbano | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Supressão e destruição das defesas aéreas inimigas (SEAD/DEAD) | ar, militar | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Patrulha aérea de combate e superioridade aérea | ar | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Combate além do alcance visual | ar | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | A abordagem indireta | militar, esports, desenho | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Envolvimento e cerco | militar | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Emboscada | militar, esports, desenho | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Defesa em profundidade | militar | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Fricção e a névoa da guerra | militar, esports | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Ponto culminante do ataque | militar | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Surpresa | militar, ar, naval, esports | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Economia de forças | militar, esports | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Terreno urbano | urbano, militar, esports | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Controlo do mar e a batalha decisiva da frota | naval | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Modelo de salva de Hughes: atacar primeiro com eficácia | naval, ar | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Teoria da busca e da deteção | naval, ar, militar | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Investigação operacional: medidas de eficácia | militar, ar, naval, desenho | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Jogos de guerra como análise | militar, desenho | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Guerra de manobra | militar, esports | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Coesão e o fator moral | militar | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Centro de gravidade | militar | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Pontos decisivos | militar, esports | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Linhas de operação | militar | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Estratégias de aniquilação e de desgaste | militar | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Batalha em profundidade e operações em profundidade | militar | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | militar, ar | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Comando por missão (Auftragstaktik) | militar, esports | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Rutura e exploração | militar | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Fogo e movimento | militar, esports | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Avanço por saltos com cobertura | militar, esports | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Reconhecimento em fases e infiltração | militar, esports | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | A reserva | militar, esports | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Defesa elástica e contra-ataque | militar | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | A cadeia de abate (encontrar, fixar, seguir, designar alvo, atacar, avaliar) | militar, ar, naval | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Alcance de deteção versus alcance de combate | ar, naval, militar | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Valor de eficácia de combate | militar, esports | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Dispersão no campo de batalha | militar, esports | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Apoio aéreo aproximado | ar, militar | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Interdição aérea | ar, militar | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Escolta versus varredura de caças | ar | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Combate de energia versus combate de viragem | ar | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Perseguição por antecipação, pura e por atraso | ar | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | O zigue-zague de Thach | ar | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | O grupo de quatro e o par de combate | ar | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Frota em existência | naval | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Cruzar o T | naval, militar | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Comboio | naval | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Antiacesso e negação de área | naval, ar, militar | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Defesa de posto avançado em zonas edificadas | urbano, militar | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Abrir passagem entre edifícios e movimento por dentro deles | urbano, militar, desenho | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Cerco | militar, urbano | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Guerrilha | militar, urbano | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Contrainsurgência | militar, urbano | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Santuário | militar, desenho | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Engano (maskirovka) | militar, esports | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Vantagem de informação | militar, esports | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Rondas de economia e ritmo de recursos | esports, desenho | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Formações de movimento: linha, coluna, cunha, escalão | militar, esports | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Ataque frontal | militar | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Duplo envolvimento (a pinça) | militar | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Cerco e a bolsa | militar | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Penetração e rutura | militar | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Perseguição | militar | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Movimento retrógrado: retirada, atraso e recuo | militar | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Finta e demonstração | militar, esports | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Cortina, guarda e cobertura: segurança à frente do corpo principal | militar | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Defesa contra um míssil: crank, notch, drag e pump | ar | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formações além do alcance visual: parede, líder-seguidor, moedor, pinça | ar | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | O combate de ângulos e o combate de energia | ar | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Pacote de ataque e a sequência da supressão | ar | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | A linha de batalha | naval | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | O funil fatal | urbano, militar, esports, desenho | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Limpeza de salas: surpresa, velocidade, violência controlada | urbano, militar, esports | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Pontos de domínio | urbano, militar, esports | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Limpar os cantos: cortar a fatia | urbano, militar, esports | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Fogo cruzado e campos de tiro entrelaçados | militar, urbano, esports, desenho | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | A vantagem de quem espreita | esports, desenho | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Vantagem numérica em rondas de eliminação | esports, militar | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Entrada e o duelo de abertura | esports, urbano | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Utilitários antes da entrada: flash e fumo | esports, urbano, militar | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Modelo de forças sociais do movimento de peões | desenho, urbano, militar | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Formação de corredores em fluxo contrário | desenho, urbano | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Mais depressa é mais devagar | desenho, urbano, militar | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | O diagrama fundamental das multidões | desenho, urbano | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Formação de trilhos e linhas de desejo | desenho, militar | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | O pânico é raro: resistência coletiva | militar, urbano, desenho | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: separação, alinhamento, coesão | desenho, militar | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Parâmetro de ordem e o início do movimento coletivo | desenho, militar, ar, naval | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Estados de enxame, de rotação e polarizados | desenho, militar, naval | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Liderança eficaz sem sinais | militar, esports, desenho | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Vizinhos por número, não por distância | ar, militar | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Inteligência de enxame | desenho, esports, militar | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Manada e cascatas de informação | esports, desenho, militar | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Preguiça social | esports, desenho, militar | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Difusão de responsabilidade | esports, militar | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Coesão do grupo primário | militar, esports | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Pontos de rutura e limiares de baixas | militar | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Supressão: o que o fogo faz além de matar | militar, urbano | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Medo e stresse nas decisões em combate | militar, esports | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Bloqueio sob pressão | esports | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Teoria das perspetivas e aversão à perda | esports, desenho | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Efeitos do ponto de equilíbrio e do dinheiro da casa | esports | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt (descontrolo emocional) | esports | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Custo afundado | esports, militar | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | A mão quente e a sua falácia | esports | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Estratégias mistas: ser imprevisível | esports, desenho, militar | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Modelos mentais partilhados | esports, militar | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | As componentes do trabalho de equipa | esports, militar | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Mundos virtuais como laboratórios do comportamento | desenho, esports | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Espaço pessoal e território | desenho, urbano | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Redes de interação: centros e laços fracos | esports, desenho | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Métodos (37) {#methods-37}

| id | título | padrões | fontes |
|---|---|---|---|
| `method.lanchester-fit` | Ajuste dos expoentes de Lanchester aos dados de combate | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Rácio de trocas por lado e por sítio | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Rácio de forças local no momento de cada abate | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Área visível: campos de tiro pela linha de vista | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Energia específica nos abates e nas mortes (ar) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Persistência de zonas quentes entre partidas | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Taxa de trocas (apoio mútuo) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Combates e vantagem do primeiro abate | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Autocorrelação espacial das mortes (I de Moran) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Taxas comparadas com a linha de base do próprio mapa, com controlo de FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Preparação do campo de batalha pelo serviço de informações (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Modelos de classificação por comparação aos pares (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Probabilidade de vitória e valorização das ações | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Controlo do espaço e controlo do campo | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Equação de salva ajustada a navios em contacto | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Rácio de eficácia de combate por unidade-hora em ação | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Alcances de deteção até combate e alcances de combate | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Tempo da cadeia de abate | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Dispersão face à parte dos abates (concentração de forças no tempo) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Taxa de perdas e abates por missão | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Modelo de probabilidade de vitória da ronda | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Valor da ação: probabilidade de vitória acrescentada | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Mais-menos ajustado por regressão de crista (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Encolhimento: Bayes empírico | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Resultados esperados: dos golos esperados aos duelos esperados | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Medição de posicionamentos, rotações e esperas | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | O problema da reflexão: cópia ou causa comum | herding, conformity | Manski 1993 |
| `method.streak-correction` | Sequências com a correção para sequências finitas | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Parâmetros de ordem de polarização e de rotação | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Líderes a partir da correlação de rumo com atraso no tempo | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Teste de cascata de rotas para a manada | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Separação de corredores e persistência de trilhos | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Risco dos retardatários | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Curva de rutura | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Resposta ao fogo que chega | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Risco depois de uma perda ou de um ganho | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Acordo de compras (kappa de Fleiss) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Casos históricos (277) {#historical-cases-277}

| id | caso | quando | escala | padrões | fontes |
|---|---|---|---|---|---|
| `case.thermopylae` | Termópilas | 480 a.C. | batalha | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamina | 480 a.C. | batalha | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Maratona | 490 a.C. | batalha | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuctra | 371 a.C. | batalha | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 a.C. | batalha | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Lago Trasimeno | 217 a.C. | batalha | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Canas | 216 a.C. | batalha | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Floresta de Teutoburgo | ano 9 | batalha | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | batalha | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Ponte de Stirling | 1297 | batalha | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Azincourt | 1415 | batalha | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | batalha | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | batalha | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | batalha | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | batalha | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | combate | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | combate | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Carga de Pickett | 1863 | combate | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | batalha | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | combate | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | campanha | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | O Somme, primeiro dia | 1 de julho de 1916 | batalha | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | campanha | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutlândia | 1916 | batalha | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | batalha | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan e as Ardenas | maio de 1940 | campanha | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Contra-ataque de Arras | 21 de maio de 1940 | combate | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Batalha de Inglaterra | jul.-out. 1940 | campanha | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Batalha do Atlântico: investigação operacional dos comboios | 1939-45 | campanha | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | junho de 1942 | batalha | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Segunda El Alamein | out.-nov. 1942 | batalha | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Passo de Kasserine | fev. 1943 | batalha | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Estalinegrado | ago. 1942-fev. 1943 | campanha | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | julho de 1943 | campanha | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prokhorovka | 12 de julho de 1943 | combate | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13 de junho de 1944 | combate | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Sebes da Normandia | junho-julho de 1944 | campanha | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operação Cobra | julho de 1944 | campanha | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Golfo de Leyte | out. 1944 | batalha | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | dez. 1944 | batalha | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | maio de 1905 | batalha | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Incheon | set. 1950 | campanha | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | Corredor dos MiG | 1950-53 | campanha | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | batalha | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | nov. 1965 | combate | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operação Bolo | 2 de janeiro de 1967 | combate | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golã: o Vale das Lágrimas | out. 1973 | batalha | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinai: a Quinta Chinesa | out. 1973 | batalha | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Vale do Bekaa (Operação Mole Cricket 19) | junho de 1982 | batalha | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Guerra aérea das Falkland | maio-junho de 1982 | campanha | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Campanha aérea da Tempestade no Deserto | jan.-fev. 1991 | campanha | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 de fevereiro de 1991 | combate | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadíscio | out. 1993 | combate | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozny | dez. 1994-fev. 1995 | batalha | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hué | jan.-mar. 1968 | batalha | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Campanha aérea do Kosovo | mar.-jun. 1999 | campanha | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallujah (Operação Al Fajr) | nov. 2004 | batalha | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mossul | 2016-17 | campanha | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Cades | c. 1274 a.C. | batalha | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issos | 333 a.C. | batalha | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 a.C. | batalha | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carras | 53 a.C. | batalha | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsália | 48 a.C. | batalha | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianópolis | ano 378 | batalha | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmuk | ano 636 | batalha | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manziquerta | 1071 | batalha | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattin | 1187 | batalha | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | batalha | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | batalha | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | batalha | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | batalha | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | batalha | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | batalha | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | batalha | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | batalha | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | campanha | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | batalha | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | batalha | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodinó | 1812 | batalha | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | batalha | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | batalha | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | batalha | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | campanha | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | batalha | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | batalha | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | batalha | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | batalha | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | combate | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Galípoli | 1915 | campanha | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nov. 1917 | batalha | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | out.-nov. 1917 | campanha | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | A ofensiva alemã da primavera (Operação Michael) | mar.-abr. 1918 | campanha | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | ago. 1918 | batalha | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Khalkhin Gol (Nomonhan) | ago. 1939 | batalha | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | A campanha da Polónia | set. 1939 | campanha | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut e Gembloux | maio de 1940 | batalha | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | maio de 1940 | combate | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | O perímetro de Dunquerque | maio-junho de 1940 | campanha | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operação Compass e Beda Fomm | dez. 1940-fev. 1941 | campanha | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operação Crusader e Sidi Rezegh | nov.-dez. 1941 | campanha | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | maio-junho de 1942 | batalha | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | ago.-set. 1942 | batalha | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | junho de 1941 | batalha | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Cerco de Kiev | set. 1941 | campanha | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moscovo | out. 1941-jan. 1942 | campanha | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rjev e a Operação Marte | 1942 | campanha | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Segunda Kharkov | maio de 1942 | batalha | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Terceira Kharkov (o golpe de revés de Manstein) | fev.-mar. 1943 | campanha | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operação Bagration | junho-ago. 1944 | campanha | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Bolsa de Korsun-Cherkassy | jan.-fev. 1944 | batalha | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Bolsa de Kamenets-Podolsky | mar.-abr. 1944 | campanha | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operação Epsom | junho de 1944 | batalha | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operação Goodwood | julho de 1944 | batalha | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operação Totalize | ago. 1944 | batalha | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | ago. 1944 | batalha | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Bolsa de Falaise | ago. 1944 | campanha | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden e Arnhem | set. 1944 | campanha | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aquisgrana | out. 1944 | batalha | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Floresta de Hürtgen | set. 1944-fev. 1945 | campanha | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | set. 1944 | batalha | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | dez. 1944 | batalha | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Crista de Elsenborn | dez. 1944 | batalha | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Colinas de Seelow | abr. 1945 | batalha | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlim | abr.-mai. 1945 | batalha | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operação Despertar da Primavera | mar. 1945 | batalha | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | dez. 1943 | batalha | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Insurreição de Varsóvia | ago.-out. 1944 | campanha | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | nov. 1943 | batalha | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | set.-nov. 1944 | batalha | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | fev.-mar. 1945 | batalha | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | abr.-junho de 1945 | campanha | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | fev.-mar. 1945 | batalha | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Manchúria (Tempestade de Agosto) | ago. 1945 | campanha | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Perímetro de Busan | ago.-set. 1950 | campanha | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Reservatório de Chosin | nov.-dez. 1950 | campanha | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Rio Imjin | abr. 1951 | batalha | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | abr. 1951 | batalha | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | abr. e julho de 1953 | combate | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | jan.-abr. 1968 | batalha | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nov. 1967 | batalha | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Monte Ap Bia) | maio de 1969 | combate | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | junho de 1967 | batalha | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | out. 1973 | batalha | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | junho de 1982 | combate | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Cerco de Beirute | junho-ago. 1982 | campanha | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Líbano 2006: Bint Jbeil e a ameaça anticarro | julho-ago. 2006 | campanha | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | fev. 1986 | batalha | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | jan.-fev. 1987 | batalha | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | jan.-fev. 1991 | batalha | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Objetivo Norfolk | 26-27 de fevereiro de 1991 | batalha | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27 de fevereiro de 1991 | batalha | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Fintas de Wadi al-Batin | fev. 1991 | campanha | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiriyah | mar. 2003 | batalha | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objetivo Peach | abr. 2003 | combate | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | As corridas do trovão | abr. 2003 | batalha | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Passo de Debecka | abr. 2003 | combate | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | campanha | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | mar.-mai. 2008 | batalha | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operação Anaconda | mar. 2002 | batalha | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | julho de 2008 | combate | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | out. 2009 | combate | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala e as casas de pelotão | 2006-07 | campanha | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Batalha de Argel | 1956-57 | campanha | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Fireforce da Rodésia | 1974-79 | campanha | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Cerco de Sarajevo | 1992-96 | campanha | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozny 1999-2000 | dez. 1999-fev. 2000 | batalha | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Guerra russo-georgiana | ago. 2008 | campanha | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | julho de 2014 | combate | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaisk | ago. 2014 | batalha | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltseve | jan.-fev. 2015 | batalha | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Aeroporto de Donetsk | set. 2014-jan. 2015 | batalha | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Aeroporto de Hostomel | fev. 2022 | combate | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | O eixo de Kiev e a emboscada de Brovary | mar. 2022 | combate | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol e Azovstal | fev.-mai. 2022 | batalha | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Contraofensiva de Kharkiv | set. 2022 | campanha | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Travessia do Siverskyi Donets em Bilohorivka | mai. 2022 | combate | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bakhmut | ago. 2022-mai. 2023 | batalha | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Ofensiva de Zaporíjia | junho-nov. 2023 | campanha | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Guerra de Nagorno-Karabakh | set.-nov. 2020 | campanha | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | O Blitz | set. 1940-mai. 1941 | campanha | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: o primeiro dia no ar | 22 de junho de 1941 | batalha | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Creta | mai. 1941 | batalha | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | O cerco de Malta | 1940-1942 | campanha | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | A ponte aérea de Estalinegrado | nov. 1942-fev. 1943 | campanha | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Batalhas aéreas sobre o Kuban | abr.-junho de 1943 | campanha | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk no ar | julho de 1943 | batalha | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operação Bagration no ar | junho-ago. 1944 | campanha | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (Operação Tidal Wave) | 1 de agosto de 1943 | combate | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | O ataque às barragens (Operação Chastise) | 16-17 de maio de 1943 | combate | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburgo (Operação Gomorra) | julho-ago. 1943 | batalha | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17 de agosto de 1943 | batalha | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Segunda Schweinfurt ("Quinta-feira Negra") | 14 de outubro de 1943 | combate | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | A Grande Semana (Operação Argument) | fev. 1944 | campanha | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | O ataque a Nuremberga | 30-31 de março de 1944 | combate | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operação Bodenplatte | 1 de janeiro de 1945 | batalha | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Batalha do Mar de Bismarck | mar. 1943 | batalha | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutralizar Rabaul | 1943-1944 | campanha | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Mar das Filipinas ("Tiro ao Peru das Marianas") | junho de 1944 | batalha | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Terça-feira Negra sobre Namsi | 23 de outubro de 1951 | combate | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operação Rolling Thunder | 1965-1968 | campanha | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | A ponte de Thanh Hoa | 1965-1972 | combate | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Os Wild Weasels | 1965-1973 | campanha | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | O relatório de Ault e a Top Gun | 1968-1972 | campanha | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operação Linebacker | maio-out. 1972 | campanha | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("a Guerra dos Onze Dias") | dez. 1972 | campanha | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operação Foco (Moked) | 5 de junho de 1967 | batalha | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Guerra de Desgaste: o cinto de mísseis | 1969-1970 | campanha | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | O guarda-chuva de SAM sobre o canal | out. 1973 | batalha | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Operação Ópera) | 7 de junho de 1981 | combate | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operação El Dorado Canyon | 15 de abril de 1986 | combate | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | A guerra aérea Irão-Iraque | 1980-1988 | campanha | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Incursões Black Buck | maio-junho de 1982 | combate | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: planear a campanha aérea do Golfo | ago. 1990-jan. 1991 | campanha | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: o ataque inicial dos Apache | 17 de janeiro de 1991 | combate | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | A grande caça aos Scud | jan.-fev. 1991 | campanha | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Cumeada de Mutla ("Estrada da Morte") | 26-27 de fevereiro de 1991 | combate | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operação Anaconda: Apaches em Shahi-Kot | mar. 2002 | batalha | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | O ataque dos Apache a Karbala | 24 de março de 2003 | combate | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | A campanha aérea da Líbia | mar.-out. 2011 | campanha | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Nagorno-Karabakh: drones e defesas aéreas | set.-nov. 2020 | campanha | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ucrânia: o ar disputado | 2022 | campanha | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Aeroporto de Hostomel | fev. 2022 | combate | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | fev.-mar. 1971 | campanha | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operação Garra de Águia | abr. 1980 | combate | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afeganistão: o Stinger | 1986-1989 | campanha | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | batalha | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | A Armada Invencível | 1588 | campanha | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Baía de Quiberon | 1759 | batalha | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | A Chesapeake (Virginia Capes) | 1781 | batalha | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | O Nilo (Baía de Aboukir) | 1798 | batalha | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Copenhaga | 1801 | batalha | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | mar. 1862 | combate | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | batalha | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | O Yalu | 1894 | batalha | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Baía de Manila | 1898 | batalha | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Baía de Heligoland | ago. 1914 | batalha | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel e as Falkland | nov.-dez. 1914 | campanha | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | jan. 1915 | batalha | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | O Río de la Plata | dez. 1939 | batalha | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Tarento | nov. 1940 | combate | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Cabo Matapan | mar. 1941 | batalha | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Estreito da Dinamarca e o afundamento do Bismarck | mai. 1941 | campanha | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7 de dezembro de 1941 | combate | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales e Repulse | 10 de dezembro de 1941 | combate | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | O Mar de Java | fev. 1942 | batalha | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | O Mar de Coral | mai. 1942 | batalha | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Ilha Savo | ago. 1942 | batalha | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | As Salomão Orientais | ago. 1942 | batalha | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cabo Esperance | out. 1942 | batalha | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Ilhas Santa Cruz | out. 1942 | batalha | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Batalha naval de Guadalcanal | 12-15 de novembro de 1942 | batalha | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nov. 1942 | combate | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | A corrida do Canal | fev. 1942 | combate | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operação Pedestal | ago. 1942 | batalha | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Maio Negro | maio de 1943 | campanha | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Cabo Norte | dez. 1943 | batalha | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | A campanha submarina dos EUA contra o Japão | 1941-1945 | campanha | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Ao largo de Samar | 25 de outubro de 1944 | batalha | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Estreito de Surigao | 25 de outubro de 1944 | batalha | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: a campanha dos kamikaze | abr.-junho de 1945 | campanha | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | O afundamento do Eilat | out. 1967 | combate | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | out. 1973 | batalha | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | O afundamento do General Belgrano | 2 de maio de 1982 | combate | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | A perda do HMS Sheffield | 4 de maio de 1982 | combate | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17 de maio de 1987 | combate | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operação Praying Mantis | 18 de abril de 1988 | batalha | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | ago. 2004 | combate | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | A revolução Bisu | mar. 2007 | batalha | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | O Dream Coil no The International 2013 | ago. 2013 | combate | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | O Zed do Faker contra o Ryu | set. 2013 | combate | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | O impulso da passagem superior | nov. 2014 | combate | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | A AWP a saltar no Mirage | abr. 2016 | combate | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis e a era dos utilitários | 2018 | campanha | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five contra a OG | abr. 2019 | batalha | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar chega a grão-mestre | 2019 | campanha | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | O gancho esquerdo (ofensiva terrestre da Tempestade no Deserto) | 24-28 de fevereiro de 1991 | campanha | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | O incidente do Sangue Corrompido | setembro de 2005 | campanha | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Desenho de jogo e de níveis (17) {#game-and-level-design-17}

| id | título | padrões | fontes |
|---|---|---|---|
| `design.chokepoint` | Pontos de estrangulamento no desenho de níveis | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Rotas de flanco e caminhos alternativos | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Linhas de vista e distância de combate | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Colocação e ritmo das coberturas | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Desenho dos spawns e proteção de spawn | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Equilíbrio de mapas simétricos e assimétricos | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Equilíbrio de classes e contras | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Fluxo, ciclos e layouts legíveis | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Economias de jogo e ciclos de retorno | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Emparelhamento e dispersão de habilidade | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Adversários de IA como sondas do nível | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Jogo significativo e escolha | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Trocas e jogo de equipa em jogos de tiro | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Controlo do mapa | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Mapas de calor e telemetria espacial no desenho | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Domínio, aprendizagem e diversão | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Economias de ronda e decisões de compra | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Estudos (113) {#studies-113}

| id | título | fontes |
|---|---|---|
| `study.engel-1954` | Engel: a lei do quadrado de Lanchester em Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: modelos de Lanchester para as Ardenas | Bracken 1995 |
| `study.fricker-1998` | Fricker: revisão dos modelos de desgaste nas Ardenas | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas e Turkes: Kursk e as Ardenas | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley e Helmbold: validar a lei do quadrado | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Análise SIG das mortes dos jogadores | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: visualizar o comportamento competitivo | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Valorizar ações no Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Deteção de encontros no desporto eletrónico | Schubert et al. 2016 |
| `study.red-baron` | Projeto Red Baron: combate aéreo sobre o Vietname | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: juízo quantificado de batalhas históricas | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: o emprego de forças explica os resultados | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Revisão da visualização de dados de jogo | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester face a três séculos de batalhas terrestres | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: sessenta combates da Segunda Guerra Mundial | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: modelos de combate e a Guerra Civil dos EUA | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: um modelo estatístico de dados de desgaste | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: ritmos de avanço em combate terrestre | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas e Dinges: as circunstâncias pesam mais do que a lei | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | A base de dados de Kursk | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | A base de dados da campanha das Ardenas | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson e MacKay: a Batalha de Inglaterra como dados de Lanchester | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte e Schmidt: os números continuam a ganhar batalhas | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: regularidades das baixas em combate | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Modelo Numérico Determinístico Tático de Dupuy | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: a guerra em números | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: o poder de combate | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter e Stam: democracias em guerra | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: o modelo dinâmico adaptativo | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester e a guerrilha | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: o modelo estocástico de salva | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: os fundamentos da tática de frota | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | O debate sobre a regra de 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modelar conflitos armados | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | O Relatório Ault: mísseis disparados fora do seu envelope | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | O circo de Blackett | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Regulação das cargas de profundidade no Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Parte de baixo branca nos aviões antissubmarino | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: blindagem onde os bombardeiros que regressaram não foram atingidos | Mangel & Samaniego 1984 |
| `study.optimal-search` | Busca ótima: dos submarinos ao AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: combate no inferno | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Antiacesso e negação de área | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Como os jogadores perdem o interesse | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Agrupar o comportamento dos jogadores em situação real | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Detetar a frustração do jogador | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: painéis de telemetria em produção | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: análise visual do jogo | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Movimento dos avatares nos campos de batalha do World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: instrumentar testes com utilizadores em grande escala | Kim et al. 2008 |
| `study.game-data-science` | Ciência de dados de jogos | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Inteligência artificial e jogos | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Habilidade e movimento de equipa no Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Padrões de combate que preveem vitórias em MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Papéis dos jogadores no Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Prever resultados do Dota 2 a partir das escolhas iniciais | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Previsão de vitória em tempo real no desporto eletrónico profissional | Hodge et al. 2021 |
| `study.rioult-2014` | Topologia das posições dos jogadores | Rioult et al. 2014 |
| `study.bednarek-2017` | Avaliar jogadores em jogos de tiro por equipas | Bednárek et al. 2017 |
| `study.katona-2019` | Prever quem morre a seguir | Katona et al. 2019 |
| `study.block-2018` | Histórias com base em dados para o público do desporto eletrónico | Block et al. 2018 |
| `study.ggviz` | ggViz: pesquisar estados de jogo em grande escala | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: aprendizagem por reforço em grande escala no Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: nível de grão-mestre no StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Valor esperado da posse de bola no basquetebol | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: valorizar as ações com bola no futebol | Decroos et al. 2019 |
| `study.pitch-control` | Controlo do campo e criação de espaço | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | A estrutura espacial da habilidade defensiva | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Papéis de equipa a partir de dados de rastreamento | Lucey et al. 2013 |
| `study.shot-quality` | Golos esperados e qualidade do remate | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: eficiência espacial do lançamento | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Análise espácio-temporal de desportos de equipa | Gudmundsson & Horton 2017 |
| `study.ripley-k` | K de Ripley: agrupamento em todas as escalas | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark e Evans: dispersão pelo vizinho mais próximo | Clark & Evans 1954 |
| `study.getis-ord` | Zonas quentes de Getis-Ord | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Indicadores locais de associação espacial | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | A estatística de varrimento espacial | Kulldorff 1997 |
| `study.kde` | Estimação de densidade por núcleos | Silverman 1986 |
| `study.knox-1964` | Interação espaço-tempo | Knox 1964; Diggle 2013 |
| `study.maup` | O problema da unidade de área modificável | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isovistas e grafos de visibilidade | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Sintaxe espacial | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Aglomeração média | Lloyd 1967 |
| `study.survival-analysis` | Análise de sobrevivência para o tempo até à morte | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Modelos lineares generalizados para contagens | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap e intervalos de estimativa | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: latência e a vantagem de quem espreita | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee e Chang: o tiro ao virar a esquina | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: latência e as ações do jogador | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: profissionais e amadores pela probabilidade de vitória | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: decisões económicas no Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: abates inteligentes e mortes sem valor | Maymin 2021 |
| `study.moba-live-prediction` | Previsão do resultado em tempo real nos MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: rondas de Valorant a partir de características táticas | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: papéis no Counter-Strike 2 profissional | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: treino de combate em espaço fechado | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Turbulência de multidão na peregrinação de 2006 a Meca | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Grupos a caminhar moldam as multidões | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Dinâmica hierárquica de grupos em bandos de pombos | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | A influência social torna o sucesso desigual e imprevisível | Salganik et al. 2006 |
| `study.wisdom-undermined` | A influência social mina a sabedoria das multidões | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | O poder de atração de uma multidão | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Conformidade com a maioria unânime | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: motivação para o combate no Iraque | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Coesão e desempenho: meta-análises | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Aversão à perda em golfistas profissionais | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Mãos quentes no basebol | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Penáltis: os profissionais jogam minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Jogo minimax em Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Inteligência coletiva das equipas | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Redes sociais de um mundo online | Szell et al. 2010 |
| `study.team-networks` | Redes de passes e desempenho de equipa | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | O comportamento espalha-se por redes agrupadas | Centola 2010 |
### Bibliografia {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(verificado 2026-11-15: detalhe)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(verificado 2026-11-15: detalhe)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(verificado 2026-11-15: detalhe)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(verificado 2026-11-15: detalhe)*
- Ammianus Marcellinus (trad. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(verificado 2026-11-15: detalhe)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(verificado 2026-11-15: detalhe)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(verificado 2026-11-15: detalhe)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(verificado 2026-11-15: detalhe)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Ardant du Picq, C. (trad. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(verificado 2026-11-15: detalhe)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(verificado 2026-11-15: detalhe)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(domínio público)* *(verificado 2026-11-15: existência)*
- Arrian (trad. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(verificado 2026-11-15: detalhe)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(verificado 2026-11-15: detalhe)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(verificado 2026-11-15: detalhe)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(verificado 2026-11-15: detalhe)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(verificado 2026-11-15: detalhe)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(verificado 2026-11-15: detalhe)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(verificado 2026-11-15: detalhe)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(verificado 2026-11-15: detalhe)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(verificado 2026-11-15: detalhe)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(verificado 2026-11-15: detalhe)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(verificado 2026-11-15: detalhe)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(verificado 2026-11-15: detalhe)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(verificado 2026-11-15: detalhe)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(verificado 2026-11-15: detalhe)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(verificado 2026-11-15: detalhe)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(verificado 2026-11-15: detalhe)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(verificado 2026-11-15: detalhe)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(verificado 2026-11-15: existência)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(verificado 2026-11-15: detalhe)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(verificado 2026-11-15: detalhe)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(verificado 2026-11-15: detalhe)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(verificado 2026-11-15: detalhe)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(verificado 2026-11-15: detalhe)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(verificado 2026-11-15: detalhe)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(verificado 2026-11-15: existência)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(verificado 2026-11-15: detalhe)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(verificado 2026-11-15: detalhe)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(verificado 2026-11-15: detalhe)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(verificado 2026-11-15: detalhe)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(verificado 2026-11-15: detalhe)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(verificado 2026-11-15: detalhe)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(verificado 2026-11-15: existência)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(verificado 2026-11-15: detalhe)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(verificado 2026-11-15: detalhe)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(verificado 2026-11-15: detalhe)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(verificado 2026-11-15: detalhe)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(verificado 2026-11-15: existência)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(verificado 2026-11-15: detalhe)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(verificado 2026-11-15: detalhe)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(verificado 2026-11-15: detalhe)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(verificado 2026-11-15: detalhe)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(verificado 2026-11-15: existência)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(verificado 2026-11-15: detalhe)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(verificado 2026-11-15: detalhe)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(verificado 2026-11-15: detalhe)*
- Caesar, G. J. (trad. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(verificado 2026-11-15: detalhe)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(verificado 2026-11-15: detalhe)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(verificado 2026-11-15: detalhe)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(verificado 2026-11-15: detalhe)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(verificado 2026-11-15: detalhe)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(verificado 2026-11-15: detalhe)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(verificado 2026-11-15: detalhe)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(verificado 2026-11-15: detalhe)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(verificado 2026-11-15: detalhe)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(verificado 2026-11-15: detalhe)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(verificado 2026-11-15: detalhe)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(verificado 2026-11-15: detalhe)*
- Clausewitz, C. von (trad. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(domínio público)* *(verificado 2026-11-15: existência)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(verificado 2026-11-15: detalhe)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(verificado 2026-11-15: detalhe)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(verificado 2026-11-15: detalhe)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(verificado 2026-11-15: detalhe)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(verificado 2026-11-15: detalhe)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(verificado 2026-11-15: detalhe)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(verificado 2026-11-15: detalhe)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(domínio público)* *(verificado 2026-11-15: existência)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(domínio público)* *(verificado 2026-11-15: existência)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(domínio público)* *(verificado 2026-11-15: existência)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(verificado 2026-11-15: existência)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(verificado 2026-11-15: detalhe)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(verificado 2026-11-15: detalhe)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(verificado 2026-11-15: detalhe)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(verificado 2026-11-15: existência)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(verificado 2026-11-15: existência)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(verificado 2026-11-15: detalhe)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(verificado 2026-11-15: detalhe)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(verificado 2026-11-15: detalhe)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(verificado 2026-11-15: existência)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(verificado 2026-11-15: detalhe)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(verificado 2026-11-15: detalhe)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(verificado 2026-11-15: detalhe)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(verificado 2026-11-15: detalhe)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(verificado 2026-11-15: detalhe)*
- Delbrück, H. (trad. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(verificado 2026-11-15: existência)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(domínio público)* *(verificado 2026-11-15: existência)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(verificado 2026-11-15: detalhe)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(verificado 2026-11-15: detalhe)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(verificado 2026-11-15: detalhe)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(verificado 2026-11-15: detalhe)*
- Douhet, G. (trad. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(verificado 2026-11-15: detalhe)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(verificado 2026-11-15: detalhe)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(verificado 2026-11-15: detalhe)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(verificado 2026-11-15: detalhe)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(verificado 2026-11-15: existência)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(verificado 2026-11-15: detalhe)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(verificado 2026-11-15: detalhe)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(verificado 2026-11-15: detalhe)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(verificado 2026-11-15: detalhe)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(verificado 2026-11-15: detalhe)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(verificado 2026-11-15: detalhe)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(verificado 2026-11-15: detalhe)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(verificado 2026-11-15: detalhe)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(verificado 2026-11-15: detalhe)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(verificado 2026-11-15: existência)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(verificado 2026-11-15: detalhe)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(verificado 2026-11-15: detalhe)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(verificado 2026-11-15: detalhe)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(verificado 2026-11-15: detalhe)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(verificado 2026-11-15: detalhe)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(verificado 2026-11-15: detalhe)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(verificado 2026-11-15: detalhe)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(verificado 2026-11-15: detalhe)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(verificado 2026-11-15: detalhe)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(verificado 2026-11-15: detalhe)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(verificado 2026-11-15: detalhe)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(verificado 2026-11-15: detalhe)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(verificado 2026-11-15: detalhe)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(verificado 2026-11-15: detalhe)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(verificado 2026-11-15: detalhe)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(verificado 2026-11-15: detalhe)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(verificado 2026-11-15: detalhe)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(verificado 2026-11-15: detalhe)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(verificado 2026-11-15: existência)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(verificado 2026-11-15: detalhe)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(verificado 2026-11-15: detalhe)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(verificado 2026-11-15: detalhe)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(verificado 2026-11-15: detalhe)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(verificado 2026-11-15: detalhe)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(verificado 2026-11-15: detalhe)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(verificado 2026-11-15: detalhe)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(verificado 2026-11-15: detalhe)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(verificado 2026-11-15: detalhe)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(verificado 2026-11-15: detalhe)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(verificado 2026-11-15: detalhe)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(verificado 2026-11-15: detalhe)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(verificado 2026-11-15: detalhe)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(verificado 2026-11-15: detalhe)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(domínio público)* *(verificado 2026-11-15: existência)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(verificado 2026-11-15: detalhe)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(verificado 2026-11-15: detalhe)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(verificado 2026-11-15: detalhe)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(verificado 2026-11-15: detalhe)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(verificado 2026-11-15: detalhe)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(verificado 2026-11-15: detalhe)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(verificado 2026-11-15: detalhe)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(verificado 2026-11-15: detalhe)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(verificado 2026-11-15: detalhe)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(verificado 2026-11-15: detalhe)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(verificado 2026-11-15: detalhe)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(verificado 2026-11-15: detalhe)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(verificado 2026-11-15: detalhe)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(verificado 2026-11-15: detalhe)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(verificado 2026-11-15: detalhe)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(verificado 2026-11-15: detalhe)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(verificado 2026-11-15: detalhe)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(verificado 2026-11-15: detalhe)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(verificado 2026-11-15: detalhe)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(verificado 2026-11-15: detalhe)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(verificado 2026-11-15: detalhe)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(verificado 2026-11-15: detalhe)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(verificado 2026-11-15: detalhe)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(verificado 2026-11-15: detalhe)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(verificado 2026-11-15: detalhe)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(verificado 2026-11-15: detalhe)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(verificado 2026-11-15: detalhe)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(verificado 2026-11-15: detalhe)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(verificado 2026-11-15: detalhe)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(verificado 2026-11-15: detalhe)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(verificado 2026-11-15: detalhe)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(verificado 2026-11-15: detalhe)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(verificado 2026-11-15: detalhe)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(verificado 2026-11-15: detalhe)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(verificado 2026-11-15: detalhe)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(domínio público)* *(verificado 2026-11-15: existência)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(verificado 2026-11-15: detalhe)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(verificado 2026-11-15: detalhe)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(verificado 2026-11-15: detalhe)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(verificado 2026-11-15: detalhe)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(verificado 2026-11-15: detalhe)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(verificado 2026-11-15: detalhe)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(verificado 2026-11-15: detalhe)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(verificado 2026-11-15: detalhe)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(verificado 2026-11-15: existência)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Herodotus (trad. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(domínio público)* *(verificado 2026-11-15: existência)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(verificado 2026-11-15: detalhe)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(verificado 2026-11-15: detalhe)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(verificado 2026-11-15: detalhe)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(verificado 2026-11-15: detalhe)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(verificado 2026-11-15: detalhe)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(verificado 2026-11-15: detalhe)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(verificado 2026-11-15: detalhe)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(verificado 2026-11-15: detalhe)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(verificado 2026-11-15: detalhe)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(verificado 2026-11-15: detalhe)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(verificado 2026-11-15: detalhe)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(verificado 2026-11-15: detalhe)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(verificado 2026-11-15: detalhe)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(verificado 2026-11-15: detalhe)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(verificado 2026-11-15: detalhe)*
- Isserson, G. S. (trad. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(verificado 2026-11-15: detalhe)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(verificado 2026-11-15: detalhe)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Jomini, A.-H. de (trad. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(verificado 2026-11-15: detalhe)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(verificado 2026-11-15: detalhe)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(verificado 2026-11-15: detalhe)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(verificado 2026-11-15: detalhe)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(verificado 2026-11-15: detalhe)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(verificado 2026-11-15: existência)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(verificado 2026-11-15: detalhe)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(verificado 2026-11-15: detalhe)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(verificado 2026-11-15: detalhe)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(verificado 2026-11-15: detalhe)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(verificado 2026-11-15: detalhe)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(verificado 2026-11-15: detalhe)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(verificado 2026-11-15: detalhe)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(verificado 2026-11-15: detalhe)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(verificado 2026-11-15: detalhe)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(verificado 2026-11-15: detalhe)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(verificado 2026-11-15: detalhe)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(verificado 2026-11-15: detalhe)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(verificado 2026-11-15: detalhe)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(verificado 2026-11-15: existência)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(verificado 2026-11-15: detalhe)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(verificado 2026-11-15: detalhe)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(verificado 2026-11-15: detalhe)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(verificado 2026-11-15: detalhe)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(verificado 2026-11-15: detalhe)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(verificado 2026-11-15: detalhe)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(verificado 2026-11-15: detalhe)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(verificado 2026-11-15: detalhe)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(verificado 2026-11-15: detalhe)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(domínio público)* *(verificado 2026-11-15: existência)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(verificado 2026-11-15: detalhe)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(verificado 2026-11-15: existência)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(verificado 2026-11-15: detalhe)*
- Livy (trad. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(domínio público)* *(verificado 2026-11-15: existência)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(verificado 2026-11-15: detalhe)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(verificado 2026-11-15: detalhe)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(verificado 2026-11-15: detalhe)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(verificado 2026-11-15: detalhe)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(verificado 2026-11-15: existência)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(verificado 2026-11-15: detalhe)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(verificado 2026-11-15: detalhe)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(verificado 2026-11-15: detalhe)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(verificado 2026-11-15: detalhe)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(verificado 2026-11-15: detalhe)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(verificado 2026-11-15: existência)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(verificado 2026-11-15: detalhe)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(verificado 2026-11-15: detalhe)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(verificado 2026-11-15: detalhe)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(verificado 2026-11-15: detalhe)*
- Mao Tse-tung (trad. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(verificado 2026-11-15: existência)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(verificado 2026-11-15: detalhe)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(verificado 2026-11-15: detalhe)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(verificado 2026-11-15: detalhe)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(verificado 2026-11-15: detalhe)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(verificado 2026-11-15: detalhe)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(verificado 2026-11-15: detalhe)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(verificado 2026-11-15: detalhe)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(verificado 2026-11-15: detalhe)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(verificado 2026-11-15: detalhe)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(verificado 2026-11-15: detalhe)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(verificado 2026-11-15: existência)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(verificado 2026-11-15: detalhe)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(verificado 2026-11-15: detalhe)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(verificado 2026-11-15: detalhe)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(verificado 2026-11-15: detalhe)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(verificado 2026-11-15: detalhe)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(verificado 2026-11-15: detalhe)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(verificado 2026-11-15: detalhe)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(verificado 2026-11-15: detalhe)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(verificado 2026-11-15: detalhe)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(verificado 2026-11-15: detalhe)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(verificado 2026-11-15: existência)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(verificado 2026-11-15: existência)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(verificado 2026-11-15: detalhe)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(verificado 2026-11-15: detalhe)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(verificado 2026-11-15: detalhe)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(verificado 2026-11-15: detalhe)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(verificado 2026-11-15: detalhe)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(verificado 2026-11-15: existência)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(verificado 2026-11-15: existência)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(verificado 2026-11-15: detalhe)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(verificado 2026-11-15: detalhe)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(verificado 2026-11-15: existência)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(verificado 2026-11-15: detalhe)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(verificado 2026-11-15: detalhe)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(verificado 2026-11-15: detalhe)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(verificado 2026-11-15: detalhe)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(verificado 2026-11-15: detalhe)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(verificado 2026-11-15: detalhe)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(verificado 2026-11-15: detalhe)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(verificado 2026-11-15: detalhe)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(verificado 2026-11-15: detalhe)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(verificado 2026-11-15: detalhe)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(verificado 2026-11-15: detalhe)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(verificado 2026-11-15: detalhe)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(verificado 2026-11-15: detalhe)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(verificado 2026-11-15: detalhe)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(verificado 2026-11-15: existência)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(verificado 2026-11-15: detalhe)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(verificado 2026-11-15: detalhe)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(verificado 2026-11-15: detalhe)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(verificado 2026-11-15: detalhe)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(verificado 2026-11-15: detalhe)*
- Osipov, M. (trad. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(verificado 2026-11-15: detalhe)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(verificado 2026-11-15: detalhe)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(verificado 2026-11-15: detalhe)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(verificado 2026-11-15: detalhe)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(verificado 2026-11-15: detalhe)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(verificado 2026-11-15: detalhe)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(verificado 2026-11-15: detalhe)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(verificado 2026-11-15: detalhe)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(verificado 2026-11-15: detalhe)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(verificado 2026-11-15: detalhe)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(verificado 2026-11-15: detalhe)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(verificado 2026-11-15: detalhe)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(verificado 2026-11-15: detalhe)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(verificado 2026-11-15: detalhe)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(verificado 2026-11-15: detalhe)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(verificado 2026-11-15: detalhe)*
- Plutarch (trad. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(domínio público)* *(verificado 2026-11-15: existência)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(verificado 2026-11-15: detalhe)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(verificado 2026-11-15: detalhe)*
- Polybius (trad. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(domínio público)* *(verificado 2026-11-15: existência)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(verificado 2026-11-15: detalhe)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(verificado 2026-11-15: detalhe)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(verificado 2026-11-15: detalhe)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(verificado 2026-11-15: detalhe)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(verificado 2026-11-15: detalhe)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(verificado 2026-11-15: detalhe)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(verificado 2026-11-15: detalhe)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(verificado 2026-11-15: detalhe)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(verificado 2026-11-15: detalhe)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(verificado 2026-11-15: detalhe)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(verificado 2026-11-15: detalhe)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(verificado 2026-11-15: detalhe)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(verificado 2026-11-15: detalhe)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(verificado 2026-11-15: detalhe)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(verificado 2026-11-15: detalhe)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(verificado 2026-11-15: detalhe)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(verificado 2026-11-15: detalhe)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(verificado 2026-11-15: detalhe)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(verificado 2026-11-15: detalhe)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(verificado 2026-11-15: detalhe)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(verificado 2026-11-15: existência)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(verificado 2026-11-15: existência)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(verificado 2026-11-15: existência)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(verificado 2026-11-15: existência)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(verificado 2026-11-15: detalhe)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(verificado 2026-11-15: detalhe)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(verificado 2026-11-15: detalhe)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(verificado 2026-11-15: detalhe)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(verificado 2026-11-15: detalhe)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(verificado 2026-11-15: detalhe)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(verificado 2026-11-15: detalhe)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(verificado 2026-11-15: detalhe)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(verificado 2026-11-15: existência)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(verificado 2026-11-15: detalhe)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(verificado 2026-11-15: detalhe)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(verificado 2026-11-15: detalhe)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(verificado 2026-11-15: detalhe)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(verificado 2026-11-15: existência)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(verificado 2026-11-15: detalhe)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(verificado 2026-11-15: existência)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(verificado 2026-11-15: detalhe)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(verificado 2026-11-15: detalhe)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(verificado 2026-11-15: detalhe)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(verificado 2026-11-15: detalhe)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(verificado 2026-11-15: existência)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(verificado 2026-11-15: detalhe)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(verificado 2026-11-15: detalhe)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(verificado 2026-11-15: detalhe)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(verificado 2026-11-15: detalhe)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(verificado 2026-11-15: detalhe)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(verificado 2026-11-15: detalhe)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(verificado 2026-11-15: detalhe)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(verificado 2026-11-15: detalhe)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(verificado 2026-11-15: detalhe)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(verificado 2026-11-15: detalhe)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(verificado 2026-11-15: detalhe)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(verificado 2026-11-15: existência)*
- Sun Tzu (trad. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(verificado 2026-11-15: detalhe)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(verificado 2026-11-15: detalhe)*
- Tacitus (trad. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(domínio público)* *(verificado 2026-11-15: existência)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(verificado 2026-11-15: detalhe)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(verificado 2026-11-15: detalhe)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(verificado 2026-11-15: detalhe)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(verificado 2026-11-15: detalhe)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(verificado 2026-11-15: detalhe)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(verificado 2026-11-15: detalhe)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(verificado 2026-11-15: detalhe)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(verificado 2026-11-15: detalhe)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(verificado 2026-11-15: detalhe)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(verificado 2026-11-15: detalhe)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(verificado 2026-11-15: detalhe)*
- Triandafillov, V. K. (trad. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(verificado 2026-11-15: detalhe)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(verificado 2026-11-15: detalhe)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(verificado 2026-11-15: detalhe)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(verificado 2026-11-15: detalhe)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(verificado 2026-11-15: detalhe)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(verificado 2026-11-15: detalhe)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(verificado 2026-11-15: detalhe)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(verificado 2026-11-15: existência)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(domínio público)* *(verificado 2026-11-15: existência)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(verificado 2026-11-15: detalhe)*
- Vegetius (trad. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(domínio público)* *(verificado 2026-11-15: existência)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(verificado 2026-11-15: detalhe)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(verificado 2026-11-15: detalhe)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(verificado 2026-11-15: detalhe)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(verificado 2026-11-15: detalhe)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(verificado 2026-11-15: detalhe)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(verificado 2026-11-15: detalhe)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(verificado 2026-11-15: detalhe)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(verificado 2026-11-15: detalhe)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(verificado 2026-11-15: existência)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(verificado 2026-11-15: detalhe)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(verificado 2026-11-15: existência)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(verificado 2026-11-15: existência)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(verificado 2026-11-15: detalhe)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(verificado 2026-11-15: existência)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(verificado 2026-11-15: detalhe)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(verificado 2026-11-15: detalhe)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(verificado 2026-11-15: detalhe)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(verificado 2026-11-15: detalhe)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(verificado 2026-11-15: detalhe)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(verificado 2026-11-15: existência)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(verificado 2026-11-15: detalhe)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(verificado 2026-11-15: detalhe)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(verificado 2026-11-15: detalhe)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(verificado 2026-11-15: detalhe)*
- Xenophon (trad. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(domínio público)* *(verificado 2026-11-15: detalhe)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(verificado 2026-11-15: detalhe)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(verificado 2026-11-15: detalhe)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(verificado 2026-11-15: detalhe)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(verificado 2026-11-15: existência)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(verificado 2026-11-15: detalhe)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(verificado 2026-11-15: existência)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(verificado 2026-11-15: existência)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(verificado 2026-11-15: detalhe)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(verificado 2026-11-15: detalhe)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(verificado 2026-11-15: detalhe)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(verificado 2026-11-15: detalhe)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(verificado 2026-11-15: detalhe)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(verificado 2026-11-15: detalhe)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(verificado 2026-11-15: detalhe)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(verificado 2026-11-15: detalhe)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(verificado 2026-11-15: detalhe)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(verificado 2026-11-15: detalhe)*

<!-- kb:end -->
