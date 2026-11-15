---
title: "Atualizações"
nav_order: 18
lang: "pt"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: true
---

# Atualizações

O visualizador diz-lhe quando existe uma versão mais nova, e só se atualiza quando diz que sim. Nada é alterado no seu computador sem a sua resposta.

## Atualizar o visualizador {#update-the-viewer}

1. **Na página.** Quando existe uma versão mais nova, aparece uma caixa por baixo do nome no topo da barra lateral: "Está disponível uma versão mais recente do 3DHeat". Clique em **Atualizar agora**. A página recarrega-se sozinha quando termina. **Mais tarde** oculta a caixa até recarregar a página.
2. **Se disser para executar restart.bat**, feche a janela do servidor (a janela preta que o `start.bat` abriu) e faça duplo clique em `restart.bat`.
3. **Ao iniciar o visualizador.** O `start.bat` também verifica. Se existir uma versão mais nova, pergunta **Update now? [Y/N]** (o script está em inglês). Prima `Y` para atualizar. Prima `N`, ou espere 60 segundos sem responder, para iniciar a versão que tem.

![O aviso de atualização com Atualizar agora e Mais tarde](../assets/img/pt/updates-notice.webp)

Uma cópia com alterações suas nunca é atualizada por si; a caixa só diz que há uma atualização à espera, e pede para fazer commit ou stash das suas alterações e executar `git pull`. Uma cópia que não foi instalada com o git (um ficheiro zip, por exemplo) não mostra nada.

Como a verificação funciona, passo a passo:

```
página ---(após 4 s, depois a cada 6 h)---> servidor de desenvolvimento ---> git fetch
   atrás?  não  -> não se mostra nada
           sim  -> alterações ou commits seus?  sim -> só avisa
                                                 não -> [Atualizar agora] -> git pull
                                                        -> recarregar, ou "execute restart.bat"
```

## As regras de segurança {#the-safety-rules}

- **Só avanço rápido** (`git pull --ff-only`): uma atualização nunca faz merge, rebase ou reescreve nada.
- **Sem alterações locais**: uma cópia com alterações não submetidas a ficheiros controlados pelo git (`git status --porcelain --untracked-files=no` não vazio) nunca é atualizada automaticamente - o trabalho de alguém não é para uma atualização sobrescrever. Só é avisada de que há uma atualização à espera. Os ficheiros não controlados (dados, exportações) não contam como alterações.
- **Sem commits locais**: uma cópia com commits que o upstream não tem ("divergida") não é atualizada - um avanço rápido não a consegue pôr em dia, e o merge é para o `git pull` manual. A página e o `start.bat` dizem isso nas mesmas palavras, e o `start.bat` inicia a versão que lá está.
- **Só a partir da própria página**: o pedido de atualização do servidor de desenvolvimento tem de levar um cabeçalho personalizado e, quando o navegador envia um `Origin`, vir do próprio anfitrião do servidor (abaixo).
- Só um checkout do git com um ramo upstream é alguma vez atualizado; qualquer outra coisa (uma cópia sem `.git`, sem git instalado, uma compilação estática) fica como está e não diz nada.

## O que o start.bat faz {#what-startbat-does}

O `start.bat` (faça duplo clique; a janela é o servidor) faz, por ordem:

1. Encontra o Node.js - no `PATH`, senão em `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ou `%LOCALAPPDATA%\Programs\nodejs` - e oferece-se para o instalar com `winget install -e --id OpenJS.NodeJS.LTS` quando não existe (pergunta, Y/N; depois a janela tem de ser reaberta para o Windows apanhar o novo `PATH`).
2. **Atualizações**, quando o git está instalado e a pasta tem `.git`:
   - `git fetch --quiet` (sem rede ou sem upstream: ignorado em silêncio);
   - conta `git rev-list --count HEAD..@{u}`; nada atrás: nada se diz;
   - alterações locais: o script mostra "A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull." - e inicia a versão que lá está;
   - commits próprios (`git rev-list --count @{u}..HEAD` diferente de 0): o script mostra "A newer version of 3DHeat is available (N changes), but this copy has commits of its own that the newest version does not, so it is not updated. Update it with git pull." - e inicia a versão que lá está;
   - caso contrário "A newer version of 3DHeat is available (N changes)." e a pergunta **Update now? [Y/N]**. `N`, ou nenhuma resposta durante 60 segundos, imprime "Not updated; starting the version you have." e inicia a versão que lá está. Com `Y`: "Updating...", indica se `package.json` ou `package-lock.json` mudam, executa `git pull --ff-only` (se mesmo assim falhar - a rede, por exemplo: "The update did not go through; starting the version you have."), depois `git submodule update --init` (as ferramentas fixadas, ver [Manutenção da documentação](maintaining.md#the-tools-under-exporters)), depois `npm install` quando os ficheiros de pacotes mudam e `node_modules` existe, e "Updated."
3. Recusa iniciar um segundo servidor: quando algo já escuta na porta **5273** diz isso e aponta para `restart.bat` / `stop.bat`.
4. Na primeira execução (sem `node_modules`), pergunta antes de transferir as dependências (cerca de 300 MB para `node_modules\`, nada à escala do sistema).
5. Inicia o servidor de desenvolvimento em `127.0.0.1:5273` (`--strictPort`) e abre o navegador quando estiver pronto.

O `restart.bat` para o servidor (pela porta) e volta a executar o `start.bat`, por isso faz a mesma pergunta. O `stop.bat` apenas para o servidor.

## Para programadores {#for-developers}

### Enquanto corre: a rota de atualização {#while-it-runs-the-update-route}

O servidor de desenvolvimento (o plugin do Vite `heat3d-self-update` em `vite.config.ts`) serve `/__heat3d/update`. Só existe no servidor de desenvolvimento: não numa compilação estática nem em `vite preview`.

**`GET /__heat3d/update`** responde se a cópia está atrás:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` quando a pasta não é uma cópia do git;
- executa `git fetch --quiet` **no máximo a cada 30 minutos** (as consultas entretanto respondem com o que foi buscado por último);
- `behind` / `ahead` vêm de `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` de `git status --porcelain --untracked-files=no`, `latest` é o assunto do commit mais recente do upstream;
- sem ramo upstream, `upstream: null` e `behind: 0`.

**`POST /__heat3d/update/apply`** põe a cópia em dia:

1. Recusado com `403 { ok: false, reason: "forbidden" }` a não ser que o pedido tenha o cabeçalho `X-Heat3d-Update: 1` e, quando traz um `Origin`, que o anfitrião desse origin seja o `Host` do pedido. Um formulário de outro site não consegue enviar um cabeçalho personalizado sem um preflight de CORS, e este servidor nunca o concede.
2. Nada a fazer (não é uma cópia, não há upstream, não está atrás): `{ ok: true, updated: false }`.
3. Alterações locais: `{ ok: false, reason: "dirty" }`; commits locais: `{ ok: false, reason: "diverged" }`.
4. Caso contrário: regista os ficheiros que mudam (`git diff --name-only HEAD @{u}`), executa `git pull --ff-only` (limite de 2 min), `git submodule update --init` (as falhas são ignoradas), `npm install` quando `package.json` ou `package-lock.json` mudam (limite de 15 min), e responde `{ ok: true, updated: true, restart }` - `restart` indica porque é que o servidor em execução não consegue aplicar a atualização: `"dependencies"` quando as dependências foram reinstaladas, `"config"` quando só mudou um ficheiro `vite.config`, `false` quando não é preciso reiniciar.
5. Um comando git ou npm que falha responde `{ ok: false, reason: "<o erro, até 300 caracteres>" }`.

As respostas são JSON com `Cache-Control: no-store`. O servidor escuta só em `127.0.0.1`, por isso a rota não é acessível a partir da rede.

### O aviso na página {#the-notice-in-the-page}

`UpdateBanner`, por baixo do nome no topo da barra lateral:

- Pergunta à rota **4 segundos** depois de a página carregar (não nos primeiros segundos: a página tem um conjunto de dados para carregar e uma GPU para iniciar) e de novo **a cada 6 horas** enquanto a página estiver aberta.
- Não mostra **nada** quando essa rota não existe (uma compilação estática), a pasta não é uma cópia do git, ou nada é mais recente: um aviso em cada arranque é algo que as pessoas aprendem a ignorar.
- Atrás, sem alterações locais: «Está disponível uma versão mais recente do 3DHeat (N alterações, a mais recente: assunto).», com **Atualizar agora** e **Mais tarde** (*Mais tarde* oculta o aviso até recarregar a página).
- Atrás, com alterações locais: a mesma frase e «Esta cópia tem alterações locais, por isso não é atualizada automaticamente; faça commit ou stash delas e depois execute git pull.», sem botão.
- **Atualizar agora** envia para `/apply` («A atualizar…»). Depois:
  - «Atualizado. A página vai recarregar.», e recarrega 1,5 s depois (o servidor já serve os ficheiros novos);
  - quando as dependências foram reinstaladas: «Atualizado. As dependências mudaram: feche a janela do servidor e execute **restart.bat** para concluir.»;
  - quando só mudaram as definições do servidor: «Atualizado. As definições do servidor mudaram: feche a janela do servidor e execute **restart.bat** para concluir.»;
  - se afinal não há nada a trazer (`updated: false`: a cópia foi posta em dia entretanto, por exemplo pelo `start.bat`): «Nada para atualizar: esta cópia já é a versão mais recente.», e sem recarregar;
  - recusado: a frase de alterações locais, ou «Esta cópia tem commits próprios que a versão mais recente não tem; atualize-a com git pull.», ou «A atualização não foi concluída: <motivo>».
