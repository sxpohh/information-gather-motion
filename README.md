# Information Gather Motion · 信息归位动画 Skill

一句话，让Agent把你的产品做成介绍动画：**双机透视入场 → 功能前后交接 → 核心内容推近 → 结尾归拢**。

**本项目基于 [huashu-motion](https://github.com/alchaincyf/huashu-motion) 的制作工作流与工具链扩展**，针对真实产品截图整理信息归位镜头、配置生成与素材询问流程。感谢上游作者花叔的开源贡献；本项目由sxpohh维护，非上游官方发布。

这是一个可被Agent调用的 **Skill**，包含制作流程、镜头判断、配置工具、模板与验收方法。它不只是一个代码模板；模板是Skill随带的资源。

![信息归位示例：双机交错和重点推近](media/demo.gif)

[完整示例视频](media/demo.mp4) · [Skill入口](skills/information-gather-motion/SKILL.md) · [配置说明](skills/information-gather-motion/references/config.md)

> 演示中的轻记是虚构产品，界面仅供说明模板用法，不代表真实上线产品。仓库不包含真实客户截图、原项目数据、配音模型或私有素材。

## 安装

使用支持Agent Skills的客户端，例如Codex、Claude Code或Cursor：

```sh
npx skills add sxpohh/information-gather-motion --skill information-gather-motion
```

全局安装到Codex：

```sh
npx skills add sxpohh/information-gather-motion --skill information-gather-motion -g -a codex
```

也可以把 `skills/information-gather-motion` 整个文件夹安装到客户端支持的Skill目录。安装后在新会话调用 `$information-gather-motion`；某些客户端需要重新载入Skill列表。

## 一句话开始

```text
用 $information-gather-motion 做一个产品介绍动画。
```

没有提供相关截图，也没有指定可读取的项目时，Agent会先问你：

> 你想介绍哪个产品？发几张相关截图，或者告诉我可以读取的项目目录或仓库地址就行。

**提供截图，或指定一个Agent可以读取的项目，任一即可。** 已有材料会直接读取，不会重复索要。只给项目时，Agent会先理解项目并尝试获取真实界面；无法读取或还缺画面时，再向你询问。

你不需要先写完整需求、选择模型或填写镜头参数。Agent负责梳理文案、安排镜头、生成配置和检查导出，也不会自动公开你的素材。

## 能复用什么

| 项目 | 可替换或调整 |
|---|---|
| 品牌 | 产品名称、logo、背景色、品牌色、文字色 |
| 内容 | 真实截图、开场、功能标题、结尾、字幕、完整混音 |
| 镜头 | 功能顺序、重点区域、多重点平移、阅读停留 |
| 编辑 | 本地播放器、截图重点框选、huashu-motion Studio变量与批注 |
| 交付 | 1080×1920 / 30fps、可编辑源码、SRT、MP4导出流程 |

当前支持2–8张截图、1–6个功能场景、每场景1–4处重点；截图保持等比，镜头对准相对原图的区域。横屏和桌面设备外框尚未提供。低分辨率截图不会因为套用模板就变高清。

## 不启动Agent也能试

克隆仓库后运行；输出目录必须尚不存在：

```sh
node skills/information-gather-motion/scripts/create.mjs skills/information-gather-motion/assets/template/examples/other-product/product.json ./my-product-film
node skills/information-gather-motion/scripts/serve.mjs ./my-product-film 4860
```

打开 http://127.0.0.1:4860/ 预览，或进入 `/focus.html` 在截图上框选重点。生成器无npm依赖，工程自带图片、脚本和字体；请通过本地HTTP访问，不要直接双击HTML。

生成需要Node.js22+。编辑/导出另需Chrome或Edge、ffmpeg和huashu-motion，已验证版本为0.3.1：

```sh
npx --yes huashu-motion@0.3.1 studio ./my-product-film --no-open
npx --yes huashu-motion@0.3.1 check ./my-product-film --samples 24
npx --yes huashu-motion@0.3.1 sound ./my-product-film
npx --yes huashu-motion@0.3.1 render ./my-product-film --blur 2 --workers 2
npx --yes huashu-motion@0.3.1 qa ./my-product-film
```

有现成huashu-motion安装时可直接用其CLI，不必重复安装。模板预置音乐谱与落点音效；旁白由用户选用的音频流程提供。本仓库不附TTS模型，也不保证某个特定声音已经在你的环境可用。

## 验证

```sh
npm test
npm run check:public
node skills/information-gather-motion/scripts/verify.mjs ./my-product-film <huashu-motion安装根目录>
```

Node测试覆盖配置、防覆盖、素材路径、焦点范围、字幕时间和整帧时长。浏览器检查图片加载、素材哈希、字幕位置、变量修改与正倒序跳转。它们不能替代实际观看或人耳审听；需要看关键帧和正常速度全片，并结合内容判断QA阅读停顿提示。

## 来源、改造范围与许可

Information Gather Motion是在 [huashu-motion](https://github.com/alchaincyf/huashu-motion) 基础上扩展的产品介绍动画Skill，当前使用的上游工具版本为0.3.1。它可以单独安装，但底层工具链仍依赖上游，不宣称完全独立实现或全部代码原创。

| 来源 | 具体内容 |
|---|---|
| huashu-motion提供的基础 | 通用动画制作工作流、OM运行辅助代码、Studio、声音处理、视频导出与检查；浏览器验收也使用其捕获工具。 |
| 本项目新增与整理 | 信息归位镜头编排、截图与文案的对应规则、配置生成器、重点框选、本地播放器、字幕布局、素材询问和针对模板的验收流程。 |

上游明确将其自身代码与文档按MIT许可发布。我们保留Huashu版权与完整MIT许可；本项目新增内容也采用MIT。GSAP仍按[GSAP Standard License](https://gsap.com/standard-license/)使用，**不是MIT**；Noto Sans SC字体按SIL OFL 1.1使用。

本仓库按扩展Skill的结构维护，未建立GitHub Fork关系。MIT不要求必须点击Fork；Fork标记也不能替代版权与许可声明。详见 [来源记录与仓库关系](docs/PROVENANCE.md)、[第三方许可清单](THIRD_PARTY.md) 和 [上游许可](https://github.com/alchaincyf/huashu-motion/blob/52467f99c602b76ba86d511d37acdfe93fa1e16e/LICENSE)。

## GitHub 推送记录

| 时间（北京） | 改动 |
|---|---|
| 2026-10-27 14:27 | 去掉信息归位示例动图、完整示例视频和预览图底部的提示文案，并清空示例配置的默认提示；保留README中虚构产品说明和原视频配乐，让演示画面更清爽。 |
| 2026-10-27 14:16 | 明确本项目基于huashu-motion工作流与工具链扩展，在README前部致谢花叔并区分上游基础与本项目新增；补充来源、MIT与GitHub Fork关系说明，保留原版权和第三方许可，纠正独立Skill可能造成的完全独立实现误解及手动安装路径。 |
| 2026-10-27 13:57 | 发布v1.1.0：将Skill和仓库更名为Information Gather Motion以突出产品动画用途，并把调用简化为一句话；缺少相关截图且未指定可读项目时先询问素材入口，已有材料先读、无法读取再补问，配置与镜头参数由Agent处理。 |
| 2026-10-27 13:33 | 首次公开信息归位Skill v1.0.0：加入可发现的SKILL入口、Codex元数据、真实素材到镜头的制作流程、通用生成器与框选工具；只提供虚构产品示例及必要依赖，核对来源许可并排除内部路径、真实产品数据和私有配音，以便其他产品和Agent直接复用。 |
