---
title: "Manutenção da documentação"
nav_order: 23
lang: "pt"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---


# Manutenção da documentação

Esta página é para quem cuida do visualizador e deste site. Lista os passos para manter as páginas, as imagens e as traduções corretas depois de uma alteração.

Este site é revisto de novo em **cada versão** e sempre que algo muda muito: atalhos de teclado, o caminho pela interface, definições, formatos de ficheiro. A lista de verificação:

1. **Regenerar as páginas de referência**: `node tools/docs-refs.mjs` (e `--lang <idioma>` para cada idioma). `node tools/docs-refs.mjs --check` falha quando uma página está desatualizada.
2. **Regenerar as capturas de ecrã** a partir dos [dados de demonstração](demo-data.md). Use um computador ou contentor cuja região seja en-US, para que os números se leiam `0.35` e não `0,35` (as caixas numéricas seguem a região do navegador até serem alteradas). Crie os dados de demonstração com `node tools/demo-data.mjs`, inicie um servidor de desenvolvimento na porta 5321 **sem** um pacote local de figuras, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, e depois execute `node tools/docs-shots.mjs --lang <idioma>`. Veja cada imagem: só nomes de demonstração (*Demo Valley*, *Blue 1*, *Red 3* ...), sem mapas reais, jogadores nem gravações.
3. **Listar o que mudou** desde a última etiqueta de versão: `git log --oneline <última etiqueta>..HEAD`, e a secção **Docs** do `CHANGELOG.md`, que associa cada funcionalidade à sua página. Cada funcionalidade nova precisa de uma página ou de uma secção, com uma imagem onde apareça no ecrã.
4. **Revisão independente** das páginas em inglês por alguém que não as escreveu, para três leitores: um principiante, uma criança de oito anos, um especialista. Os passos estão completos e na ordem certa, as palavras são as da interface, as imagens estão atualizadas, as etiquetas dos diagramas estão certas?
5. **Corrigir o que a revisão encontrou.**
6. **Traduzir de novo as páginas alteradas** pelo seu hash de origem, e depois fazer a revisão por idioma. Veja `tools/docs-translate.md`.
7. **Procurar termos confidenciais** nos ficheiros alterados, e verificar que nenhuma imagem mostra outra coisa que não dados de demonstração.
8. **Publicar** só quando a versão estiver aprovada.

A mesma verificação cobre os sites de documentação dos repositórios relacionados (veja a página [Início](index.md#related-repositories)).

## As ferramentas em exporters/ {#the-tools-under-exporters}

As ferramentas à volta do visualizador são projetos públicos separados, cada um com a sua própria licença MIT, versões, wiki e verificação de atualizações, fixados neste repositório como submódulos git:

| Pasta | Repositório |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - percursos e níveis extraídos dos arquivos dos próprios jogos |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - gravadores de telemetria de voltas; níveis a partir de vídeo de jogo |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - plugin para o Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - demos e mapas de CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - grava o jogo em segundo plano |

**Fixado** significa que este repositório regista um commit exato de cada ferramenta. Uma cópia do visualizador recebe esses commits:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# ou, depois de um clone simples:
git submodule update --init
```

Ambos os caminhos de atualização acima executam `git submodule update --init` depois de puxar, por isso as ferramentas seguem o visualizador até aos commits que a versão mais recente fixa - não aos commits mais recentes das próprias ferramentas. Uma versão mais recente de uma ferramenta chega ao visualizador quando o fixo aqui é movido: as alterações a uma ferramenta são primeiro confirmadas e enviadas na sua própria pasta (o seu próprio repositório), e só depois é confirmado aqui o novo fixo. Cada ferramenta também verifica as suas próprias versões mais recentes; isso está documentado no seu próprio repositório.
