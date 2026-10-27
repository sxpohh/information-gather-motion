# 来源、改造范围与仓库关系

Information Gather Motion基于[huashu-motion](https://github.com/alchaincyf/huashu-motion)的制作工作流与工具链扩展，面向真实产品截图的信息归位介绍动画。感谢上游作者花叔的开源贡献。本项目由sxpohh维护，非上游官方发布。

## 核查基线

- 核查日期：2026-10-27（北京时间）。
- 已验证上游工具版本：huashu-motion 0.3.1。
- 本次核查的上游main提交：[52467f99c602b76ba86d511d37acdfe93fa1e16e](https://github.com/alchaincyf/huashu-motion/commit/52467f99c602b76ba86d511d37acdfe93fa1e16e)。这是核查基线，不是声称本仓库继承了上游全部Git历史。
- [上游Skill](https://github.com/alchaincyf/huashu-motion/blob/52467f99c602b76ba86d511d37acdfe93fa1e16e/skills/huashu-motion/SKILL.md)、[MIT许可](https://github.com/alchaincyf/huashu-motion/blob/52467f99c602b76ba86d511d37acdfe93fa1e16e/LICENSE)、[第三方声明](https://github.com/alchaincyf/huashu-motion/blob/52467f99c602b76ba86d511d37acdfe93fa1e16e/THIRD_PARTY.md)。上游第三方声明明确其自身代码与文档采用MIT；第三方资源和明确列出的例外不因此自动成为MIT。

## 实际复用与新增

| 部分 | 关系与范围 |
|---|---|
| 制作工作流 | 以huashu-motion的代码动画、真实产品材料、Studio与导出流程为基础，整理适用于信息归位产品介绍的专门指令。 |
| OM辅助代码 | `skills/information-gather-motion/assets/template/vendor/om.js`来自上游`runtime/om.js`；与现有0.3.1运行包对应文件的SHA256一致：`83ac6c45f566d148ef93d9d8e4d785954d69398d67900a47c6d48088cb6f559f`。完整上游MIT许可保留在相邻的`HUASHU-MIT.txt`。 |
| Studio、声音、导出和检查 | 通过huashu-motion CLI调用；这些工具的实现不是本项目新增。 |
| 浏览器验收 | 本项目验收脚本加载上游`cli/lib/capture.js`，在此之上检查模板行为。 |
| 本项目新增与整理 | 信息归位镜头编排、重点区域与文案规则、配置生成器、框选工具、本地播放器、字幕布局、素材询问与模板验收。具体文件见Skill及其随带模板。 |
| GSAP与字体 | 按各自许可使用；详见[模板许可清单](../skills/information-gather-motion/assets/template/THIRD_PARTY.md)。 |

“可单独安装的Skill”描述安装方式，不表示底层完全独立或全部代码原创。新增内容的版权不取代上游版权。

## 为什么没有必须使用GitHub Fork

MIT允许使用、复制、修改和分发，要求保留适用的版权与许可声明，未要求必须使用GitHub的Fork功能。GitHub的[Fork说明](https://docs.github.com/en/pull-requests/reference/forks)描述的是带有上游连接的仓库组织方式。Fork标记本身不能代替许可证。

当前仓库主要维护专门的Skill、配置与模板，并调用上游工具链，因此按扩展仓库组织。若未来要维护整个huashu-motion的修改版、持续合并上游源码，再考虑使用GitHub Fork。当前未重建仓库或改写发布历史。

公开案例也存在不同组织方式：[VSCodium](https://github.com/VSCodium/vscodium/blob/master/README.md)明确以独立构建脚本仓库生成VS Code发行版，并在[MIT许可](https://github.com/VSCodium/vscodium/blob/master/LICENSE)中保留微软版权；[Git for Windows](https://github.com/git-for-windows/git/blob/main/README.md)则以Git的Windows移植维护，其GitHub Fork父仓库为`git/git`。后者采用GPLv2，这里只比较来源表述和仓库组织，不套用其许可条件。

本次仅澄清来源和署名，没有改动动画运行逻辑。既有v1.0.0、v1.1.0发布包未被替换；包内已有上游MIT全文和第三方声明，后续发布继续携带这些材料。
