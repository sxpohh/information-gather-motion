---
name: information-gather
description: "制作信息归位风格的竖屏产品介绍视频：真实截图以双机透视入场、前后交接、重点推近和结尾归拢展开。适用于小程序、App、工具产品介绍，以及明确要求复用信息归位运镜的任务。包含配置生成器、重点框选、字幕、预览与huashu-motion导出流程。"
metadata:
  version: "1.0.0"
  author: "sxpohh"
  repository: "https://github.com/sxpohh/information-gather-skill"
---

# 信息归位

把产品截图放进同一个空间，让镜头从整体走向重点，再回到品牌。默认输出1080×1920、30fps竖屏；这套动作是叙事骨架，产品文案、截图、顺序和停留时间由当前需求决定。

以下 `<SKILL_DIR>` 指本文件所在目录，使用实际安装路径。不要假定用户的盘符、项目目录、模型路径或GitHub账号。

## 1. 先建立产品与镜头的对应关系

读取用户已有的产品说明和真实截图；先确认：它是做什么的、提供什么、为什么方便、谁会愿意用。功能结论只能来自实际材料。已有确认的文案、声音和视觉选择直接沿用；只询问会改变结果的缺失信息。

给每个要点安排一张截图和一个重点区域。**镜头对准价值所在的表格、列表、操作或图表，不因日期或装饰容易放大就把它当重点。**用户提供低分辨率原图时优先取得更清晰的原图，无法取得则如实使用；不重绘UI或伪造数据充当真实产品。

写简短的文案—镜头表：画面、要说的话、观众要看清的区域、阅读停留。需要更细的编排时读 [references/storyboard.md](references/storyboard.md)。

## 2. 配置并生成工程

读取 [references/config.md](references/config.md)，从 `assets/template/examples/other-product/product.json` 开始。这个示例是虚构产品，只说明配置用法；做真实介绍时换成用户的素材。

产品素材与配置放在新工作的专用目录，图片路径相对配置文件。不要把素材复制进已安装的Skill目录。`steps[].rect` 是相对原截图的 `[x,y,width,height]`，各值0–1；每个重点只保留一个明确阅读目标。

```sh
node "<SKILL_DIR>/scripts/create.mjs" "<素材目录>/product.json" "<新的输出目录>"
node "<SKILL_DIR>/scripts/serve.mjs" "<输出目录>" 4860
```

打开命令打印的本地地址，使用 `focus.html` 拖选真实截图重点并复制rect。将结果写回工作配置，再生成到新的输出目录。生成器会拒绝覆盖已有工程。

`hold` 调整阅读停留，后续场景会顺延；最终时长见 `timing.json`。不要靠加快旁白压缩密集画面的阅读时间。

## 3. 声音与字幕

有用户选定的声音就保留。模板不包含TTS权重或固定音色；需要旁白时使用当前可用且符合用户要求的音频工作流，先定文案再生成声音。

- 没有音频：模板提供示例音乐谱和落点音效，经 `om sound` 合成；默认字幕是镜头说明。
- 已有完整混音：配置 `audio.src` 和 `audio.duration`；模板关闭额外配乐，不把音乐叠两遍。
- 有旁白：按真实音频时间填写 `captions`，替代默认字幕。不要将镜头时间表说成语音识别或人工逐字听审的结果。

字幕保持下方居中、清晰醒目，产品核心区域在上方独立留出。单句建议10–20字，过长则断句或拆镜头；不要缩成小字。试听容易误读的词和局部衔接，音频改动同步更新字幕。

## 4. 编辑并导出

本Skill自带离线预览所需的库与字体；生成不需要安装npm依赖。编辑/导出需要Node.js22+、Chrome或Edge、ffmpeg和huashu-motion。已安装huashu-motion时优先用现有CLI；否则可按下列固定版本运行，网络/安装权限遵循当前会话规则。

```sh
npx --yes huashu-motion@0.3.1 studio "<输出目录>" --no-open
npx --yes huashu-motion@0.3.1 check "<输出目录>" --samples 24
npx --yes huashu-motion@0.3.1 sound "<输出目录>"
npx --yes huashu-motion@0.3.1 render "<输出目录>" --blur 2 --workers 2
npx --yes huashu-motion@0.3.1 qa "<输出目录>"
```

Studio可改名称、标题、颜色和字幕开关，支持对稳定的 `data-om-id` 批注。配置负责素材、重点和结构；Studio修改在工程的 `index.html`，重新生成不会自动合并这些修改。

## 5. 看真实输出后交付

检查开场、最密集的重点、交接和结尾关键帧；实际看图，核对核心内容是否清楚、字幕是否遮挡、转场是否突然。全片正常速度播放，并检查音画、完整解码、分辨率和时长。源码存在或渲染命令成功，都不等于画面已验收。

可用现有huashu-motion安装做浏览器检查：

```sh
node "<SKILL_DIR>/scripts/verify.mjs" "<输出目录>" "<huashu-motion安装根目录>"
```

报告区分实测通过、低分辨率提示及未完成的人工审听。静态检查可能看不到JS加载的图片；用 `sources.json` 和浏览器实际加载核对，不能借提示忽略素材来源。阅读/结尾停顿的QA提示需要结合画面判断。

交付成片、可编辑工程和简短的验证结果。不要自动上传视频、公开用户素材或创建仓库；这些需用户在当前任务中授权。
