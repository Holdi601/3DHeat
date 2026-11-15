---
title: "更新"
nav_order: 18
lang: "zh"
source: "updates.md"
source_hash: "0d33b694a31d"
translated: true
outdated: false
---

# 更新

查看器会在有更新版本时告诉你，并且只有在你同意时才会自行更新。在你回答之前，你的电脑上不会有任何东西被改动。

## 更新查看器 {#update-the-viewer}

1. **在页面中。** 当有更新版本时，侧边栏顶部名称下方会出现一个方框："3DHeat 有新版本可用"。点击 **立即更新**。完成后页面会自行重新加载。**稍后** 会隐藏该方框，直到你重新加载页面。
2. **如果它提示运行 restart.bat**，关闭服务器窗口（由 `start.bat` 打开的黑色窗口），然后双击 `restart.bat`。
3. **启动查看器时。** `start.bat` 也会检查。如果有更新版本，它会询问 **Update now? [Y/N]**（立即更新？）。按 `Y` 即可更新。按 `N`，或者 60 秒内不作回答，则启动你现有的版本。

![带有 Update now 和 Later 按钮的更新提示](../assets/img/zh/updates-notice.webp)

对你自己做过修改的副本，从不会被自动更新；方框只会告诉你有更新在等待，并建议你提交或暂存你的修改，然后运行 `git pull`。不是通过 git 安装的副本（例如 zip 文件）则不会显示任何内容。

检查的工作方式，分步如下：

```
页面 ---（4 秒后，之后每 6 小时）---> 开发服务器 ---> git fetch
   落后？  否  -> 不显示任何内容
           是  -> 你有自己的修改或提交？  是 -> 只告诉你
                                        否 -> [立即更新] -> git pull
                                                -> 重新加载，或"运行 restart.bat"
```

## 安全规则 {#the-safety-rules}

- **仅快进**（`git pull --ff-only`）：更新从不合并、变基或改写任何内容。
- **没有本地修改**：对受版本控制的文件有未提交修改的副本（`git status --porcelain --untracked-files=no` 的结果不为空）从不会被自动更新——别人自己的工作不能被更新覆盖。它只会被告知有更新在等待。未跟踪的文件（数据、导出文件）不计为修改。
- **没有本地提交**：有上游没有的提交的副本（"已分叉"）不会被更新——快进无法把它带上来，合并则是手动 `git pull` 的事。页面和 `start.bat` 都会用同样的话说明这一点，而 `start.bat` 会启动现有的版本。
- **只来自页面本身**：开发服务器的更新请求必须带有一个自定义标头，并且当浏览器发送 `Origin` 时，必须来自服务器自身的主机（见下文）。
- 只有带有上游分支的 git 副本才会被更新；其他一切（没有 `.git` 的副本、没有安装 git、静态构建）都会被忽略，并且不作任何提示。

## start.bat 做什么 {#what-startbat-does}

`start.bat`（双击它；该窗口即服务器）按顺序执行以下操作：

1. 查找 Node.js——先在 `PATH` 中查找，然后在 `%ProgramFiles%\nodejs`、`%ProgramFiles(x86)%\nodejs` 或 `%LOCALAPPDATA%\Programs\nodejs` 中查找——如果缺失，则提议用 `winget install -e --id OpenJS.NodeJS.LTS` 安装（会询问，回答 Y/N；之后需要重新打开窗口，Windows 才会读取新的 `PATH`）。
2. **更新**，前提是安装了 git 且文件夹中有 `.git`：
   - 执行 `git fetch --quiet`（没有网络或没有上游：静默跳过）；
   - 统计 `git rev-list --count HEAD..@{u}`；落后为零：不作任何提示；
   - 有本地修改："有 3DHeat 的新版本可用（N 项更改），但此副本有本地修改，因此不会更新。请提交或暂存它们，然后运行 git pull。"——并启动现有的版本；
   - 有自己的提交（`git rev-list --count @{u}..HEAD` 不为 0）："有 3DHeat 的新版本可用（N 项更改），但此副本有新版本中没有的自有提交，因此不会更新。请用 git pull 更新它。"——并启动现有的版本；
   - 其他情况："有 3DHeat 的新版本可用（N 项更改）。"并提出问题 **Update now? [Y/N]**（立即更新？）。`N`，或 60 秒内没有回答，会打印"未更新；正在启动你现有的版本。"并启动现有的版本。回答 `Y` 时：打印"正在更新..."，记录 `package.json` 或 `package-lock.json` 是否有变化，运行 `git pull --ff-only`（如果仍然失败——例如网络问题——则显示："更新未成功；正在启动你现有的版本。"），然后运行 `git submodule update --init`（固定版本的工具，见[维护文档](maintaining.md#the-tools-under-exporters)），若包文件有变化且存在 `node_modules`，则运行 `npm install`，最后显示"已更新。"。
3. 拒绝启动第二个服务器：当端口 **5273** 已被占用时，它会说明这一点，并指向 `restart.bat` / `stop.bat`。
4. 首次运行时（没有 `node_modules`），在下载依赖项之前询问（大约 300 MB，存放在 `node_modules\` 中，不影响系统）。
5. 在 `127.0.0.1:5273` 上启动开发服务器（`--strictPort`），并在其就绪时打开浏览器。

`restart.bat` 会（通过端口）停止服务器，然后再次运行 `start.bat`，因此它会问同样的问题。`stop.bat` 只负责停止。


## 开发者信息 {#for-developers}

### 运行时：更新路由 {#while-it-runs-the-update-route}

开发服务器（`vite.config.ts` 中的 Vite 插件 `heat3d-self-update`）提供 `/__heat3d/update`。它只存在于开发服务器上——静态构建中没有，`vite preview` 中也没有。

**`GET /__heat3d/update`** 回答副本是否落后：

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "最新提交的标题" }
```

- 当文件夹不是 git 副本时，`checkout: false`；
- 它**最多每 30 分钟**执行一次 `git fetch --quiet`（期间的询问则以上次获取的结果作答）；
- `behind` / `ahead` 来自 `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`，`dirty` 来自 `git status --porcelain --untracked-files=no`，`latest` 是上游最新提交的标题；
- 没有上游分支时，`upstream: null` 且 `behind: 0`。

**`POST /__heat3d/update/apply`** 把副本更新到最新：

1. 除非请求带有标头 `X-Heat3d-Update: 1`，并且当请求带有 `Origin` 时，该来源的主机与请求的 `Host` 一致，否则以 `403 { ok: false, reason: "forbidden" }` 拒绝。跨站表单若没有 CORS 预检便无法发送自定义标头，而此服务器从不授予 CORS 预检。
2. 无事可做（不是副本、没有上游、不落后）：`{ ok: true, updated: false }`。
3. 有本地修改：`{ ok: false, reason: "dirty" }`；有本地提交：`{ ok: false, reason: "diverged" }`。
4. 否则：记录将要变化的文件（`git diff --name-only HEAD @{u}`），执行 `git pull --ff-only`（超时 2 分钟），执行 `git submodule update --init`（失败则忽略），当 `package.json` 或 `package-lock.json` 有变化时执行 `npm install`（超时 15 分钟），并回答 `{ ok: true, updated: true, restart }`——`restart` 说明为什么正在运行的服务器无法接收此次更新：依赖项被重新安装时为 `"dependencies"`，只有 `vite.config` 文件有变化时为 `"config"`，不需要重启时为 `false`。
5. git 或 npm 命令失败时回答 `{ ok: false, reason: "<错误信息，最多 300 个字符>" }`。

响应为 JSON，并带有 `Cache-Control: no-store`。服务器只监听 `127.0.0.1`，因此该路由无法从网络访问。

### 页面中的提示 {#the-notice-in-the-page}

`UpdateBanner`，位于侧边栏顶部名称下方：

- 它会在页面加载后 **4 秒** 询问该路由（不是在最初几秒：页面还要加载数据集并启动 GPU），并且在页面保持打开期间，每 **6 小时** 再询问一次。
- 当没有这样的路由（静态构建）、文件夹不是副本、或没有更新的版本时，它 **什么也不显示**——每次启动都出现的提示会让人学会忽略它。
- 落后且没有本地修改时："有 3DHeat 的新版本可用（N 项更改，最新：<标题>）。"并带有 **立即更新** 和 **稍后** 按钮（*稍后* 会隐藏它，直到页面重新加载）。
- 落后且有本地修改时：同样的句子，加上"此副本有本地修改，因此不会自动更新；请提交或暂存它们，然后运行 git pull。"——没有按钮。
- 点击 **立即更新** 会向 `/apply` 发送请求（显示"正在更新..."）。然后：
  - "已更新。页面将重新加载。"——并在 1.5 秒后重新加载（服务器已经在提供新文件）；
  - 依赖项被重新安装时："已更新。其依赖项已变化：请关闭服务器窗口，并运行 **restart.bat** 以完成更新。"；
  - 只有服务器设置变化时："已更新。其服务器设置已变化：请关闭服务器窗口，并运行 **restart.bat** 以完成更新。"；
  - 最终没有需要带入的内容（`updated: false`——例如这期间副本已被 `start.bat` 更新）："无需更新：此副本已是最新版本。"——并且不重新加载；
  - 被拒绝时：显示有关修改的那句话，或"此副本有新版本中没有的自有提交；请用 git pull 更新它。"，或"更新未成功：<原因>"。
