---
title: "设置、单位与按键"
nav_order: 16
lang: "zh"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: true
---

# 设置、单位与按键

侧边栏顶部的小控件会改变查看器与你交流的方式：语言、单位（米或英尺、公里每小时或节）以及解释颜色的帮助模式。你的选择会记录在你的浏览器中。

## 页眉 {#the-header}

侧边栏顶部：

| 控件 | 作用 |
|---|---|
| **?** | 帮助模式：每种颜色的含义（也可按 `?` 或 `F1`） |
| **单位**菜单 | 公制、英制、航空或海里制 |
| **单位**旁边的 **...** 按钮 | 打开“为每个量选择单位”：每个量一个下拉菜单 |
| **语言**菜单 | 查看器的语言：[40 种语言](languages.md)，或浏览器的语言 |

![The header with the Units menu and the unit-per-quantity window open](../assets/img/zh/settings-units.webp)

你在输入框中键入的数字可以使用小数点或逗号（`0.35` 或 `0,35`）。查看器两者都能读取，并按查看器语言的书写习惯显示数字。

## 单位 {#units}

1. 在**单位**菜单中选择一个预设。所有量会一起切换。
2. 若只想更改某一个量，点击其旁边的 **...** 按钮，并为该量选择一个单位。菜单随后会在预设后显示 `*`。
3. 你未设置的量会跟随预设。选择“按预设”即可恢复。

| 量 | 公制（默认） | 英制 | 航空 | 海里制 |
|---|---|---|---|---|
| 距离 | km | mi | NM | NM |
| 高度、长度 | m | ft | ft | m |
| 速度 | km/h | mph | kt | kt |
| 垂直速度 | m/s | ft/min | ft/min | m/s |
| 温度 | °C | °F | °C | °C |
| 气压 | hPa | inHg | hPa | hPa |
| 质量、燃油 | kg, l | lb, gal | lb, gal | t, m³ |
| 角度 | 度 | 度 | 度 | 度 |

你可以为单个量选择的其他单位：距离 km、mi、NM；速度 km/h、m/s、kt、mph；垂直速度 m/s、ft/min、m/min；温度 °C、°F、K；气压 hPa、inHg、mmHg、psi；质量 kg、lb、t；角度为度或 NATO mil（一圈 6400）。单位在查看器的各处都相同：标签、卡片、图表、统计。

## 帮助模式 {#help-mode}

![Help mode: what the colours mean](../assets/img/zh/help.webp)

按 `?` 或 `F1`，或点击 **?** 按钮。它会显示*颜色的含义*：三维视图、热度色带、队伍颜色、关卡颜色、面板状态颜色、对局面板和赛车视图的图例。在关闭之前它会一直保持开启。在对局标签页中，它也会解释对局面板的颜色。

![Help mode in the Match tab](../assets/img/zh/settings-help-match.webp)

## 浏览器记住的内容 {#what-the-browser-remembers}

以下设置会在两次访问之间保存在你的浏览器中（不会发送到任何地方）：

- 语言、单位和帮助模式；
- 回放的图形、符号、标签、摄像机和战术显示设置；
- 播放速度和镜像；
- 每个录像的书签、每个数据集的体积、目标图层；
- 外部 AI 设置（仅当你勾选了*记住*时保存密钥）。

热度设置、筛选和模式在每次加载时都会重新开始。完整的、自动生成的列表：[已保存的设置](ref-settings-storage.md)。

## 查看器从浏览器保留的按键 {#keys-the-viewer-keeps-from-the-browser}

大型数据的会话需要时间来加载，因此查看器会阻止浏览器无意中将其丢弃：

- 在文本框之外，`Ctrl`/`Cmd` 加上会输出字符、保存、打开、重新加载、关闭或打开新窗口的字母键不起作用；`F1`、`F3`、`F5`、`F6` 和 `F7` 不起作用。
- 在加载了数据或关卡的情况下关闭或重新加载标签页，会先询问。
- 全屏时，查看器会锁定它所使用的按键（W、T、N、S、R、P、Q、Esc），以免浏览器将其占用。

完整列表：[浏览器按键](ref-browser-keys.md)。查看器自身的全部按键：[键盘与鼠标参考](keyboard-reference.md)。
