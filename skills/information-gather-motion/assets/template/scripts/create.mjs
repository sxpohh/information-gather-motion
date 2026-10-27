import {existsSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,statSync} from 'node:fs';
import {resolve,dirname,join,extname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {loadConfig,safeLocalAsset,planScenes} from './config.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=x=>JSON.stringify(x,null,2).replace(/</g,'\\u003c');
const html=x=>x.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll("'",'&#39;');
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
export function createProject(configPath,outputPath){
 const out=resolve(outputPath);if(existsSync(out))throw Error(`output exists: ${out}`);
 const {base,config:c}=loadConfig(configPath),plan=planScenes(c),assets=[];
 const asset=(src,target,kind)=>{const source=safeLocalAsset(base,src);if(!existsSync(source)||!statSync(source).isFile())throw Error(`asset missing: ${src}`);const ext=extname(source).toLowerCase();if(!(kind==='audio'?['.wav','.mp3','.m4a','.ogg']:['.png','.jpg','.jpeg','.webp','.svg']).includes(ext))throw Error(`asset format unsupported: ${src}`);assets.push({source,target:target+ext,sha256:sha(source),bytes:statSync(source).size,original:src});return target+ext;};
 for(const[s,i]of c.screens.map((s,i)=>[s,i]))s.src=asset(s.src,`assets/screen-${String(i+1).padStart(2,'0')}`,'image');
 if(c.brand.logo)c.brand.logo=asset(c.brand.logo,'assets/logo','image');
 if(c.audio)c.audio.src=asset(c.audio.src,'assets/mix','audio');
 // Validate all required inputs BEFORE creating an output directory.
 const copies=[['template/style.css','style.css'],['template/motion.mjs','motion.mjs'],['template/plan.mjs','plan.mjs'],['template/player.html','player.html'],['template/focus.html','focus.html'],['scripts/serve.mjs','serve.mjs'],['vendor/gsap.min.js','vendor/gsap.min.js'],['vendor/om.js','vendor/om.js'],['vendor/GSAP-LICENSE.txt','vendor/GSAP-LICENSE.txt'],['vendor/HUASHU-MIT.txt','vendor/HUASHU-MIT.txt'],['assets/NotoSansSC-500.woff','assets/NotoSansSC-500.woff'],['assets/NotoSansSC-900.woff','assets/NotoSansSC-900.woff'],['assets/OFL.txt','assets/OFL.txt'],['THIRD_PARTY.md','THIRD_PARTY.md'],['LICENSE.txt','LICENSE.txt']];
 for(const[a]of copies)if(!existsSync(join(root,a)))throw Error(`template asset missing: ${a}`);
 copies.push(['template/player.js','player.js']);
 if(!existsSync(join(root,'template/player.js')))throw Error('template player.js missing');
 const vars=[{id:'brandName',type:'string',label:'产品名称',default:c.brand.name},{id:'introTitle',type:'string',label:'开场标题',default:c.intro.title},{id:'outroTitle',type:'string',label:'结尾标题',default:c.outro.title},{id:'accent',type:'color',label:'品牌色',default:c.theme.accent},{id:'canvas',type:'color',label:'背景色',default:c.theme.background},{id:'ink',type:'color',label:'文字色',default:c.theme.ink},{id:'captionsOn',type:'boolean',label:'显示底部字幕',default:true},...c.features.map(f=>({id:`title-${f.id}`,type:'string',label:`功能：${f.id}`,default:f.title}))];
 const baseHtml=readFileSync(join(root,'template/index.html'),'utf8');
 let built=baseHtml.replace('@@VARIABLES@@',html(JSON.stringify(vars))).replaceAll('@@ID@@',c.id).replace('@@DURATION@@',String(plan.duration));
 const bars=Math.ceil(plan.duration*108/240)+1;
 const score=`X:1\nT:Information Gather\nM:4/4\nL:1/8\nQ:1/4=108\nK:D\nV:KEYS inst=rhodes gain=0.32\n${Array.from({length:bars},(_,i)=>i%2?'[GBdf]4 [FAce]4':'[DFAc]4 [EAce]4').join(' | ')} |\nV:MOTIF inst=marimba gain=0.16 role=melody\n${Array.from({length:bars},(_,i)=>i%2?'E2 A2 F2 E2':'D2 F2 A2 e2').join(' | ')} |`;
 built=built.replace('@@SOUND@@',c.audio?`<audio id="product-mix" src="${html(c.audio.src)}" data-start="0" data-duration="${plan.duration}" data-track-index="1" preload="auto"></audio>`:`<script type="text/vnd.abc" id="om-score">${score}</script>`);
 mkdirSync(out,{recursive:true});
 for(const[a,b]of copies){mkdirSync(dirname(join(out,b)),{recursive:true});copyFileSync(join(root,a),join(out,b));}
 for(const a of assets){mkdirSync(dirname(join(out,a.target)),{recursive:true});copyFileSync(a.source,join(out,a.target));}
 writeFileSync(join(out,'index.html'),built);writeFileSync(join(out,'config.js'),`window.INFORMATION_GATHER_CONFIG = ${json(c)};\n`);
 writeFileSync(join(out,'product.json'),JSON.stringify(c,null,2)+'\n');writeFileSync(join(out,'timing.json'),JSON.stringify(plan,null,2)+'\n');
 writeFileSync(join(out,'sources.json'),JSON.stringify({template:'information-gather',version:'1.0.0',assets:assets.map(({source,...rest})=>rest)},null,2)+'\n');
 writeFileSync(join(out,'treatment.md'),`# ${c.brand.name} · 信息归位\n\n本工程由信息归位Skill的通用模板1.0.0生成。\n\n连续路线：双机入场 → 功能交接 → 真实截图重点 → 双机归拢。\n\n时长${plan.duration}秒；1080×1920，30fps。\n\n${plan.features.map(f=>`- ${f.start.toFixed(2)}–${f.end.toFixed(2)}s：${f.title.replaceAll('\n',' ')}；${f.steps.length}个重点。`).join('\n')}\n\n素材不重绘；${c.audio?'沿用提供的完整混音。':'预置谱与落点音效，需运行om sound生成音乐；本示例没有旁白。'}\n\n声明：${c.notice||'发布前核对截图来源与文字。'}\n`);
 const fmtTime=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
 const caps=c.captions??[{start:.1,end:plan.intro.end-.2,text:c.intro.caption},...plan.features.flatMap(f=>f.steps.map(s=>({start:s.land+.05,end:s.end-.15,text:s.caption}))),{start:plan.outro.start+.6,end:plan.duration,text:c.outro.caption}].filter(s=>s.text);
 mkdirSync(join(out,'subtitles'),{recursive:true});writeFileSync(join(out,'subtitles/captions.srt'),caps.map((s,i)=>`${i+1}\n${fmtTime(s.start)} --> ${fmtTime(s.end)}\n${s.text}\n`).join('\n'));
 writeFileSync(join(out,'START-HERE.md'),'# 信息归位工程\n\n在本目录运行 node serve.mjs . 4860，打开 http://127.0.0.1:4860/ 预览，focus.html可框选截图重点。使用huashu-motion的studio/check/sound/render命令编辑及导出。不要直接双击HTML（浏览器会限制本地模块）。\n\n原始产品配置见product.json。修改配置后用模板create.mjs生成到新目录；已在Studio修改的变量保留在index.html，不要覆盖。默认字幕是镜头说明，SRT在subtitles/；有旁白时必须换成实际音频对齐时间。\n\n截图与脚本均在本目录，可整体复制后通过本地HTTP离线预览。字体和库的许可见THIRD_PARTY.md。\n');
 return {output:out,duration:plan.duration,features:c.features.length,assets:assets.length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{if(process.argv.length!==4)throw Error('Usage: node create.mjs <product.json> <NEW-output-directory>');console.log(JSON.stringify(createProject(process.argv[2],process.argv[3]),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
