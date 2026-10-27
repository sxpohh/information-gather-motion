# 配置与本地工具

`product.json` 使用UTF-8，图片与音频路径相对该文件所在文件夹。可复制 `assets/template/examples/other-product/` 到工作目录再修改；不要把真实用户素材写入安装目录。

| 字段 | 含义 |
|---|---|
| version / id | version固定1；id为小写字母、数字、连字符 |
| brand.name / logo | 名称、可选logo相对路径；缺logo时使用首字标识 |
| theme.background / accent / ink | 背景、品牌、文字颜色；#rrggbb |
| intro / outro | {title,caption,duration}；标题可用\n换行 |
| screens | 2–8项{id,src,alt}；PNG/JPEG/WebP/SVG |
| hero | 两张开场/结尾截图的id |
| features | 1–6项{id,screen,title,steps} |
| steps | 每功能1–4项{rect,hold,caption} |
| rect | 相对原图的[x,y,width,height]，范围0–1，不得越界 |
| hold | 到达重点后停留1–20秒 |
| captions | 可选[{start,end,text}]，提供则替换自动镜头字幕，禁止时间重叠 |
| audio | 可选{src,duration}，整段完整混音，长度与计算时长差不超过0.1秒 |
| notice | 页面底部必要的演示说明 |

字幕最多28字符，标题最多24字符；接近上限时检查实际换行。相对路径不得包含远程URL、绝对盘符或越界的../。空白示例仅用虚构产品图，不含用户真实账号或数据。

## 时间

总时长为intro.duration + 每功能1.1秒 + 每重点0.85秒与hold + outro.duration。结尾再补到30fps整帧，最多不足一帧。修改hold时后续场景同步顺延。计算结果在生成工程的timing.json。

已有配音的准确时间应先核对；不要为了让duration字段通过而谎填音频长度。先生成工作草案得到timing，再按真实音频调整停留、字幕和混音。

需要将旁白和可选背景音乐组合成整段WAV时，参照 [narration.md](narration.md) 使用 `scripts/mix-audio.mjs`；时间、字幕和声音质量仍需实际核对。

## 工程

生成后包含index.html、config.js、product.json、motion.mjs、style.css、player.html/player.js、focus.html、serve.mjs、素材、字体、许可、timing.json、sources.json和subtitles/captions.srt。可整体移动，通过本地HTTP预览；不要双击HTML（模块加载受浏览器限制）。

`focus.html`：在原图上拖选区域，复制rect回工作配置。`player.html`：正常播放、暂停、跳转章节。预览器会一次读取本地音轨为Blob播放，避免部分浏览器续传音频时的读取错误；导出仍读取原始音频文件。

## 验证边界

浏览器检查包括图像实际加载、来源哈希、重点安全区、字幕居中/最多两行、变量覆盖、正倒序跳转。DOM状态必须一致；边缘抗锯齿的PNG容差为最多1色阶且不超过0.01%像素，报告保留原始差异数。

默认重点在画布上方的90–990px、470–1410px范围，字幕中心x540、底边1660。仍需实际看图与正常速度播放；检查脚本不能确认声音是否像真人或所有内容是否适合发布。

低分辨率原图会给出提示，模板不会提升其信息量。字体为Noto Sans SC子集，生僻字或其他语言可能需要替换授权字体。当前仅提供竖屏手机构图，横屏或桌面设备外框需另做布局。
