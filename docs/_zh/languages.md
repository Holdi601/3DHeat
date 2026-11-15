---
title: "语言"
nav_order: 17
lang: "zh"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---


# 语言

查看器可以说你的语言：每个按钮、提示和消息，以及赛车分析和对局分析的每一句话，都会以你选择的语言显示。它支持 40 种语言，并且如果有你浏览器所用的语言，就会以它开始。

欧洲各国的官方语言都有（欧盟的 24 种，以及挪威语、冰岛语、乌克兰语、俄语、白俄罗斯语、塞尔维亚语、波斯尼亚语、马其顿语、阿尔巴尼亚语、土耳其语、卢森堡语和加泰罗尼亚语），另外还有日语、韩语，以及简体和繁体中文。完整列表：[语言列表](ref-languages.md)。

英语是其他所有语言翻译所依据的源语言，也是缺少某条消息时退回显示的语言。

## 更改语言 {#change-the-language}

1. 打开侧边栏顶部名称旁边的下拉框。它的第一项是**自动 - <语言>**（即浏览器当前检测到的语言）；之后是每种语言的本名，因此即使你看不懂当前显示的语言，也能找到自己的语言。
2. 选择一种语言。它会立即切换，并保存在此浏览器中。选择*自动*即可忘记这个选择。

在隐私窗口中，或存储被禁用时，此选择只在页面关闭前有效。

切换语言会做以下事情：

- 每个标签、提示和消息都会以新语言重新渲染；
- 赛车分析会以新语言**重新计算**（它的句子是根据测量值构建的，而不是事后翻译的），示范圈会被重新命名，图表也会被重绘；
- 数字、列表和复数形式都会遵循新语言的规则。

## 启动时使用的语言 {#which-language-it-starts-in}

1. 在此浏览器中**选定**的语言（如果有的话，保存在 `localStorage` 的 `heat3d.language` 中）。
2. 否则使用**浏览器**的语言：`navigator.languages` 中查看器支持的第一个语言。标签按其语言部分匹配（`de-AT` → `de`），并有以下别名：`nb` 和 `nn` → 挪威语（`no`）；`zh-TW`、`zh-HK`、`zh-MO`、`zh-Hant`，以及任何带有 `Hant` 书写系统的标签 → 繁体中文；`zh-Hans`、`zh-CN`、`zh-SG` 以及其他 `zh` → 简体中文；`cnr`（黑山语）→ 塞尔维亚语。
3. 否则使用**英语**。

页面的 `<html lang>` 会设置为所使用的语言。

## 数字、列表与复数 {#numbers-lists-and-plurals}

查看器文本中的数字、列表和复数，会按该语言的习惯书写（“3.5”或“3,5”，“a、b和c”）。比英语更长的标签会换行，在语言允许的地方加连字符，而不会超出侧边栏。名称过长的图表行会用省略号截断，并在鼠标悬停时完整显示。

你在输入框中输入的数字，可以使用小数点，也可以使用逗号。

## 面向译者和开发者 {#for-translators-and-developers}

代码位于 [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)（[`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)、[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts)、[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)）以及 [`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx)。

### 数字、列表与复数的写法 {#how-numbers-lists-and-plurals-are-written}

- 带小数的**数字**（`num`）使用该语言的小数点符号，并且**不做数字分组**——3108 m 的距离在每种语言中都保持为一个数字。
- 作为计数或大小的**整数**（`int`）使用该语言的数字分组方式。
- **列表**（`list`）按该语言的方式连接：“a、b和c”、“a、b或c”，或使用该语言自己的分隔符依次排列（消息 `common.listSeparator`：英语为 ", "，日语和两种中文为“、”）。
- **复数**通过 `Intl.PluralRules`（`one`、`two`、`few`、`many`、`other`）遵循该语言自己的规则。
- 传给 `Intl` 的区域是该语言的标签，但如果只靠标签会套用其他国家的规则，则例外：葡萄牙语为 `pt-PT`（巴西的复数规则会把 0 视为 one），挪威语为 `nb`，简体中文为 `zh-CN`，繁体中文为 `zh-TW`。

### 译文目录 {#the-catalogs}

`src/i18n/locales/<语言>/<部分>.json`，查看器的每个部分一个文件，所有语言的部分都相同。

查看器共有 30 个部分的文件（例如 `app.json`、`heat.json`、`match.json`、`race-text.json`、`units.json`），每种语言都有同样的一组。文件夹中列出了所有文件。

每个文件都是一个扁平的 JSON 对象：键写全称（`"race.ui.laps.load"`），消息作为其值。英语随查看器一起打包；其他语言则在被选中时才获取。

**查找顺序：** 当前语言的消息，然后是英语消息，最后是键本身（开发时控制台会显示“i18n: no message …”警告）。如果某条消息格式化失败，则退回英语消息，因此有问题的译文不会导致查看器崩溃。

#### 消息语法 {#the-message-syntax}

查看器使用的 ICU 消息语法部分：

| 形式 | 示例 | 含义 |
|---|---|---|
| `{name}` | `{file} has no rows` | 按原样放入的值 |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | 根据该语言的复数规则为数字选择的分支，或精确的 `=0`、`=1` 等；`#` 是按该语言方式书写的数字 |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | 按词选择的分支 |

分支可以嵌套，每个 `plural` 和 `select` 都必须有一个 `other` 分支。
与完整的 ICU 不同，**撇号只是撇号**——赛车名称和英语所有格中有很多撇号，因此无需任何转义。无法写出字面的 `{` 或 `}`。

译文必须保留的消息内容：大括号中的名称由代码填入；`select` 中的词是代码用来选择分支的依据（`crash`、`onto-straight`、`yes`/`none`），必须与英语保持一致；复数类别可以不同（每种语言使用自己的类别：波兰语为 `one`、`few`、`many`、`other`；日语只有 `other`）。

### 译文如何制作，以及测试 {#how-the-translations-were-made-and-the-tests}

译文由 AI 模型根据英语译出，并附有赛车术语表；赛车文本在填入数值后又经过了第二次校读。欢迎母语者更正（见下文）。

`src/i18n/i18n.test.ts` 检查：

- 代码请求的每条消息在英语中都存在——包括每一次 `t('…')` 调用，以及保存在表格中、之后交给 `t()` 的每个键（以某个部分的名称开头的键，例如 `app.` 或 `heat.`）；
- 代码从各部分构建的消息都存在：每个错误的 `label`、`short`、`count` 和 `here`，每个赛车比较特征，每个通道的标签；
- 每条消息在每种语言中都能**解析**；
- 每条译文都**保留英语消息的值和选择**（不增加也不丢失任何值；每个 `select` 都保留其词）；
- 每种语言都拥有英语的**全部**消息，并且已翻译的语言集合恰好是上面的列表；
- 消息以所选语言显示，并在缺失时退回英语。

### 更正译文 {#correcting-a-translation}

欢迎母语者更正——每项更正只是一行 JSON。

1. 找到消息：在英语目录（`src/i18n/locales/en/`）中搜索你看到的英文文本（把选择器切换为英语即可阅读），并记下它的键。
2. 打开你语言中的同一部分，例如 `src/i18n/locales/de/race-ui.json`，修改该键的值。保留其中的每个 `{name}`，保留 `select` 中的词，写出你的语言所需的复数分支：

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. 运行 `npm test`（或只运行 `npx vitest run src/i18n`）：测试会告诉你某个值或选择是否丢失，或某条消息是否已无法解析。
4. 开发服务器运行时，切换语言（或重新加载）后即可看到更改。

**添加消息**（在代码中）：先把它加入英语部分，然后加入每种其他语言（在每种语言都有它之前，测试都会失败）。

**添加语言**：把它加入 `languages.ts` 中的 `LANGUAGES`（其 BCP 47 标签及其本名，以及需要时的别名或 `Intl` 区域），并创建包含所有部分的文件夹 `src/i18n/locales/<标签>/`。
