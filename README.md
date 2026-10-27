# 信息归位 · Information Gather Skill

把真实产品截图做成一支连贯的竖屏介绍片：**双机透视入场 → 功能前后交接 → 核心内容推近 → 结尾归拢**。

这是一个可被Agent调用的 **Skill**，包含制作流程、镜头判断、配置工具、模板与验收方法。它不只是一个代码模板；模板是Skill随带的资源。

![信息归位示例：双机交错和重点推近](media/demo.gif)

[完整示例视频](media/demo.mp4) · [Skill入口](skills/information-gather/SKILL.md) · [配置说明](skills/information-gather/references/config.md)

> 演示中的轻记是虚构产品，界面仅供说明模板用法，不代表真实上线产品。仓库不包含真实客户截图、原项目数据、配音模型或私有素材。

## 安装

使用支持Agent Skills的客户端，例如Codex、Claude Code或Cursor：

```sh
npx skills add sxpohh/information-gather-skill --skill information-gather
```

全局安装到Codex：

```sh
npx skills add sxpohh/information-gather-skill --skill information-gather -g -a codex
```

也可以把 `skills/information-gather` 整个文件夹安装到客户端支持的Skill目录。安装后在新会话调用 `$information-gather`；某些客户端需要重新载入Skill列表。

## 这样调用

```text
用 $information-gather 给我的产品做一支竖屏介绍片。
产品是【产品名】，主要帮助【谁】完成【什么】。
截图在【素材目录】，重点讲【功能与方便之处】。
沿用双机交错、重点放大和结尾归拢，字幕放下方居中。
```

Skill会读取真实素材，将文案对应到截图中的重点，生成可编辑工程，检查预览与导出。它不把某款产品的列名、日期、业务文案或声音写死，也不会自动公开你的素材。

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
node skills/information-gather/scripts/create.mjs skills/information-gather/assets/template/examples/other-product/product.json ./my-product-film
node skills/information-gather/scripts/serve.mjs ./my-product-film 4860
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
node skills/information-gather/scripts/verify.mjs ./my-product-film <huashu-motion安装根目录>
```

Node测试覆盖配置、防覆盖、素材路径、焦点范围、字幕时间和整帧时长。浏览器检查图片加载、素材哈希、字幕位置、变量修改与正倒序跳转。它们不能替代实际观看或人耳审听；需要看关键帧和正常速度全片，并结合内容判断QA阅读停顿提示。

## 来源与许可

由sxpohh整理的独立Skill。原始指令、生成器、布局、时间线与虚构示例采用MIT；依赖 [huashu-motion](https://github.com/alchaincyf/huashu-motion) 提供Studio、声音和导出。不是huashu-motion官方模板或官方分支。

GSAP仍按[GSAP Standard License](https://gsap.com/standard-license/)使用，**不是MIT**；Noto Sans SC字体按SIL OFL 1.1使用。许可与原始版权声明均保留，详见 [THIRD_PARTY.md](THIRD_PARTY.md)。

## GitHub 推送记录

| 时间（北京） | 改动 |
|---|---|
| 2026-10-27 13:33 | 首次公开信息归位Skill v1.0.0：加入可发现的SKILL入口、Codex元数据、真实素材到镜头的制作流程、通用生成器与框选工具；只提供虚构产品示例及必要依赖，核对来源许可并排除内部路径、真实产品数据和私有配音，以便其他产品和Agent直接复用。 |
