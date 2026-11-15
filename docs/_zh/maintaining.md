---
title: "维护文档"
nav_order: 23
lang: "zh"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# 维护文档

本页面向负责本查看器和本网站的人。它列出在发生变更后，保持页面、图片和翻译正确的步骤。

每次**发布**时，以及任何发生大幅变化时（快捷键、界面操作路径、设置、文件格式），本网站都会重新检查。检查清单：

1. **重新生成参考页面**：运行 `node tools/docs-refs.mjs`（每种语言分别加上 `--lang <lang>`）。当某个页面已过期时，`node tools/docs-refs.mjs --check` 会失败。
2. **重新生成截图**，使用[演示数据](demo-data.md)。请使用区域设置为 en-US 的电脑或容器，这样数字会显示为 `0.35` 而不是 `0,35`（在更改之前，数字输入框会跟随浏览器的区域设置）。用 `node tools/demo-data.mjs` 生成演示数据，在端口 5321 上启动开发服务器，**不**加载本地图形包：`HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`，然后运行 `node tools/docs-shots.mjs --lang <lang>`。逐张检查每一张图片：只能出现演示名称（*Demo Valley*、*Blue 1*、*Red 3* ……），不能有真实地图、玩家或录像。
3. **列出自上次发布标签以来的变更**：`git log --oneline <last tag>..HEAD`，以及 `CHANGELOG.md` 中的 **Docs** 部分，它把每个功能对应到其页面。每个新功能都需要一个页面或一个小节，若它会在屏幕上显示，还需要配图。
4. **由未撰写这些英文页面的人进行独立审阅**，针对三类读者：初学者、八岁的孩子、专家。步骤是否完整、顺序是否正确，用词是否与界面一致，图片是否是最新的，图表的标签是否正确？
5. **修正审阅发现的问题。**
6. **按源哈希重新翻译已变更的页面**，然后按语言进行审阅。见 `tools/docs-translate.md`。
7. **扫描已变更文件中的机密词语**，并检查每张图片都只显示演示数据。
8. **只有在版本获得批准后才发布。**

同样的检查也覆盖相关代码库的文档网站（见[首页](index.md#related-repositories)）。

## exporters/ 下的工具 {#the-tools-under-exporters}

围绕查看器的工具是各自独立的公开项目，每个都有自己的 MIT 许可证、版本发布、维基和更新检查，并以 git 子模块的形式固定在本代码库中：

| 文件夹 | 代码库 |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles)——从游戏自身的归档中提取赛道和关卡 |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)——圈遥测记录器；从游戏录像中提取关卡 |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter)——Unreal Editor 插件 |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2)——CS2 demo 和地图 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher)——在后台记录游戏过程 |

**固定**是指本代码库记录了每个工具的一个确切提交。查看器的检出会获得这些提交：

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# 或者，在普通克隆之后：
git submodule update --init
```

上述两种更新方式在拉取后都会运行 `git submodule update --init`，因此工具会跟随查看器，到达其最新版本所固定的提交——而不是工具自身的最新提交。工具的新版本只有在此处的固定被更新时才会到达查看器：对工具的更改首先在其自己的文件夹（其自己的代码库）中提交并推送，然后在此处提交新的固定。每个工具也会检查自己的更新版本；这在其自己的代码库中有说明。
