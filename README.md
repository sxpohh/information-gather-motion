# Information Gather Motion · 信息归位动画 Skill

一句话，让Agent把你的产品做成介绍动画：**双机透视入场 → 功能前后交接 → 核心内容推近 → 结尾归拢**。

**本项目基于 [huashu-motion](https://github.com/alchaincyf/huashu-motion) 的制作工作流与工具链扩展**，针对真实产品截图整理信息归位镜头、配置生成与素材询问流程。感谢上游作者花叔的开源贡献；本项目由sxpohh维护，非上游官方发布。

这是一个可被Agent调用的 **Skill**，包含制作流程、镜头判断、配置工具、模板与验收方法。它不只是一个代码模板；模板是Skill随带的资源。

![信息归位示例：双机交错和重点推近](media/demo.gif)

[在线播放完整示例](https://cdn.jsdelivr.net/gh/sxpohh/information-gather-motion@2eed170e1297fc42abaf1aeb29ded33926dcddf0/media/demo.mp4) · [下载视频](https://raw.githubusercontent.com/sxpohh/information-gather-motion/main/media/demo.mp4) · [Skill入口](skills/information-gather-motion/SKILL.md) · [配置说明](skills/information-gather-motion/references/config.md)

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

## 需要配音时

直接说：

```text
用 $information-gather-motion 做产品介绍动画，需要自然的普通话配音。
```

有现成录音或已选音色就沿用；需要选音色时，Agent先用环境中可用的声音制作短样音，听过再定稿。也可以只用音乐和音效。Skill不附TTS模型；本机Qwen3-TTS等可作为可选方案，并非安装前提。没有可用声音时，Agent会说明并询问可用方案。

选好旁白后，Agent核听读音、按实际音频安排字幕，并可用随附的混音工具合成与影片等长的音轨。工具不会自动把文字变成声音，也不会自动识别字幕；音质、读音与字幕仍需要核对。详见 [配音流程](skills/information-gather-motion/references/narration.md)。

## 能复用什么

| 项目 | 可替换或调整 |
|---|---|
| 品牌 | 产品名称、logo、背景色、品牌色、文字色 |
| 内容 | 真实截图、开场、功能标题、结尾、字幕、完整混音 |
| 镜头 | 功能顺序、重点区域、多重点平移、阅读停留 |
| 编辑 | 本地播放器、截图重点框选、huashu-motion Studio变量与批注 |
| 交付 | 1080×1920 / 30fps、可编辑源码、SRT、MP4导出流程 |

当前支持2–8张截图、1–6个功能场景、每场景1–4处重点；截图保持等比，镜头对准相对原图的区域。横屏和桌面设备外框尚未提供。低分辨率截图不会因为套用模板就变高清。

## 验证

```sh
npm test
npm run check:public
node skills/information-gather-motion/scripts/verify.mjs ./my-product-film <huashu-motion安装根目录>
```

Node测试覆盖配置、防覆盖、素材路径、焦点范围、字幕时间和整帧时长。浏览器检查图片加载、素材哈希、字幕位置、变量修改与正倒序跳转。它们不能替代实际观看或人耳审听；需要看关键帧和正常速度全片，并结合内容判断QA阅读停顿提示。

## License

本项目新增代码和文档采用 [MIT License](LICENSE)；复用的 huashu-motion 代码保留其 MIT 许可。

GSAP、字体等第三方组件采用各自的许可，详见 [THIRD_PARTY.md](THIRD_PARTY.md)。
