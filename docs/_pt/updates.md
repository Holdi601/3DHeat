---
title: "Atualizações"
nav_order: 21
lang: "pt"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Atualizações

O visualizador diz-lhe quando existe uma versão mais nova, e só se atualiza quando diz que sim. Nada é alterado no seu computador sem a sua resposta.

## Atualizar o visualizador {#update-the-viewer}

1. **Na página.** Quando existe uma versão mais nova, aparece uma caixa por baixo do nome no topo da barra lateral: "Está disponível uma versão mais recente do 3DHeat". Clique em **Atualizar agora**. A página recarrega-se sozinha quando termina. **Mais tarde** oculta a caixa até recarregar a página.
2. **Se disser para executar restart.bat**, feche a janela do servidor (a janela preta que o `start.bat` abriu) e faça duplo clique em `restart.bat`.
3. **Ao iniciar o visualizador.** O `start.bat` também verifica. Se existir uma versão mais nova, pergunta **Atualizar agora? [S/N]**. Prima `S` para atualizar. Prima `N`, ou espere 60 segundos sem responder, para iniciar a versão que tem.

![O aviso de atualização com Atualizar agora e Mais tarde](../assets/img/en/updates-notice.webp)

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

1. Encontra o Node.js - no `PATH`, senão em `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ou `%LOCALAPPDATA%\Programs\nodejs` - e oferece-se para o instalar com `winget install -e --id OpenJS.NodeJS.LTS` quando não existe (pergunta, S/N; depois a janela tem de ser reaberta para o Windows apanhar o novo `PATH`).
2. **Atualizações**, quando o git está instalado e a pasta tem `.git`:
   - `git fetch --quiet` (sem rede ou sem upstream: ignorado em silêncio);
   - conta `git rev-list --count HEAD..@{u}`; nada atrás: nada se diz;
   - alterações locais: "Está disponível uma versão mais recente do 3DHeat (N alterações), mas esta cópia tem alterações locais, por isso não é atualizada. Faça commit ou stash delas, depois execute git pull." - e inicia a versão que lá está;
   - commits próprios (`git rev-list --count @{u}..HEAD` diferente de 0): "Está disponível uma versão mais recente do 3DHeat (N alterações), mas esta cópia tem commits próprios que a versão mais nova não tem, por isso não é atualizada. Atualize-a com git pull." - e inicia a versão que lá está;
   - caso contrário "Está disponível uma versão mais recente do 3DHeat (N alterações)." e a pergunta **Atualizar agora? [S/N]**. `N`, ou nenhuma resposta durante 60 segundos, imprime "Não atualizado; a iniciar a versão que tem." e inicia a versão que lá está. Com `S`: "A atualizar...", indica se `package.json` ou `package-lock.json` mudam, executa `git pull --ff-only` (se mesmo assim falhar - a rede, por exemplo: "A atualização não foi concluída; a iniciar a versão que tem."), depois `git submodule update --init` (as ferramentas fixadas, ver [Manutenção da documentação](maintaining.md#the-tools-under-exporters)), depois `npm install` quando os ficheiros de pacotes mudam e `node_modules` existe, e "Atualizado."
3. Recusa iniciar um segundo servidor: quando algo já escuta na porta **5273** diz isso e aponta para `restart.bat` / `stop.bat`.
4. Na primeira execução (sem `node_modules`), pergunta antes de transferir as dependências (cerca de 300 MB para `node_modules\`, nada à escala do sistema).
5. Inicia o servidor de desenvolvimento em `127.0.0.1:5273` (`--strictPort`) e abre o navegador quando estiver pronto.

O `restart.bat` para o servidor (pela porta) e volta a executar o `start.bat`, por isso faz a mesma pergunta. O `stop.bat` apenas para o servidor.

## Para programadores {#for-developers}

### Enquanto corre: a rota de atualização {#while-it-runs-the-update-route}

The dev server (Vite plugin `heat3d-self-update` in `vite.config.ts`) serves
`/__heat3d/update`. It exists only on the dev server - not in a static build
and not in `vite preview`.

**`GET /__heat3d/update`** answers whether the checkout is behind:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` when the folder is not a git checkout;
- it runs `git fetch --quiet` **at most every 30 minutes** (asks in between
  answer from what was last fetched);
- `behind` / `ahead` from `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`,
  `dirty` from `git status --porcelain --untracked-files=no`, `latest` the
  subject of the upstream's newest commit;
- with no upstream branch, `upstream: null` and `behind: 0`.

**`POST /__heat3d/update/apply`** brings the checkout up:

1. Refused with `403 { ok: false, reason: "forbidden" }` unless the request has
   the header `X-Heat3d-Update: 1` and, when it carries an `Origin`, that
   origin's host is the request's `Host`. A cross-site form cannot send a
   custom header without a CORS preflight, which this server never grants.
2. Nothing to do (not a checkout, no upstream, not behind):
   `{ ok: true, updated: false }`.
3. Local changes: `{ ok: false, reason: "dirty" }`; local commits:
   `{ ok: false, reason: "diverged" }`.
4. Otherwise: notes the files that change (`git diff --name-only HEAD @{u}`),
   `git pull --ff-only` (2 min timeout), `git submodule update --init`
   (failure ignored), `npm install` when `package.json` or
   `package-lock.json` changed (15 min timeout), and answers
   `{ ok: true, updated: true, restart }` - `restart` says why the running
   server cannot pick the update up: `"dependencies"` when they were
   reinstalled, `"config"` when only a `vite.config` file changed, `false`
   when nothing needs a restart.
5. A failing git or npm command answers `{ ok: false, reason: "<the error,
   up to 300 characters>" }`.

Responses are JSON with `Cache-Control: no-store`. The server listens on
`127.0.0.1` only, so the route is not reachable from the network.

### O aviso na página {#the-notice-in-the-page}

`UpdateBanner`, under the name at the top of the sidebar:

- It asks the route **4 seconds** after the page loads (not in the first
  seconds: the page has a dataset to load and a GPU to start) and again
  **every 6 hours** while the page stays open.
- It shows **nothing** when there is no such route (a static build), the
  folder is not a checkout, or nothing is newer - a notice on every start is
  one people learn to ignore.
- Behind, with no local changes: "A newer version of 3DHeat is available (N
  changes, the newest: <subject>)." with **Update now** and **Later**
  (*Later* hides it until the page is reloaded).
- Behind, with local changes: the same sentence and "This copy has local
  changes, so it is not updated automatically; commit or stash them, then
  run git pull." - no button.
- **Update now** posts to `/apply` ("Updating..."). Then:
  - "Updated. The page reloads." - and it reloads 1.5 s later (the server
    already serves the new files);
  - when the dependencies were reinstalled: "Updated. Its dependencies
    changed: close the server window and run **restart.bat** to finish.";
  - when only the server's settings changed: "Updated. Its server settings
    changed: close the server window and run **restart.bat** to finish.";
  - nothing to bring in after all (`updated: false` - the copy was brought up
    meanwhile, by `start.bat` say): "Nothing to update: this copy is already
    the newest version." - and no reload;
  - refused: the *dirty* sentence, or "This copy has commits of its own that
    the newest version does not; update it with git pull.", or "The update
    did not go through: <reason>".
