import {readFileSync,existsSync,realpathSync} from 'node:fs';
import {resolve,relative,isAbsolute,dirname} from 'node:path';
export {planScenes} from '../template/plan.mjs';
import {planScenes} from '../template/plan.mjs';
const fail=s=>{throw Error(s);};
const text=(x,name,max)=>typeof x==='string'&&x.trim()&&[...x].length<=max?x:fail(`${name}: expected 1–${max} characters`);
const number=(x,name,min,max)=>Number.isFinite(x)&&x>=min&&x<=max?x:fail(`${name}: expected ${min}–${max}`);
const ident=(x,name)=>typeof x==='string'&&/^[a-z][a-z0-9-]{0,39}$/.test(x)?x:fail(`${name}: use lowercase letters/digits/hyphens`);
const unique=(list,name)=>{if(new Set(list).size!==list.length)fail(`duplicate ${name}`);};
export function safeLocalAsset(base,asset) {
 if(typeof asset!=='string'||!asset||/[:?#\x00-\x1f]/.test(asset)||isAbsolute(asset)||/^[\\/]/.test(asset))fail('asset must be a relative local path');
 const target=resolve(base,asset),rel=relative(resolve(base),target);
 if(rel==='..'||rel.startsWith('..\\')||rel.startsWith('../')||isAbsolute(rel))fail('asset must stay within local config folder');
 if(existsSync(target)){const actual=relative(realpathSync(base),realpathSync(target));if(actual==='..'||actual.startsWith('..\\')||actual.startsWith('../')||isAbsolute(actual))fail('asset symlink escapes local folder');}
 return target;
}
export function validateConfig(input) {
 const c=structuredClone(input);
 if(c.version!==1)fail('version must be 1');ident(c.id,'id');
 c.brand??={};text(c.brand.name,'brand.name',16);
 c.theme={background:'#fff9ee',accent:'#3c6b6e',ink:'#2f271f',...c.theme};
 for(const[k,v]of Object.entries(c.theme))if(!/^#[\da-f]{6}$/i.test(v))fail(`theme.${k}: use #rrggbb`);
 for(const name of ['intro','outro']){if(!c[name])fail(`${name} required`);text(c[name].title,`${name}.title`,24);c[name].caption??='';if(c[name].caption)text(c[name].caption,`${name}.caption`,28);number(c[name].duration,`${name}.duration`,2.5,12);}
 if(!Array.isArray(c.screens)||c.screens.length<2||c.screens.length>8)fail('screens: supply 2–8 screenshots');
 for(const s of c.screens){ident(s.id,'screen.id');text(s.src,'screen.src',240);text(s.alt,'screen.alt',100);}
 unique(c.screens.map(s=>s.id),'screen id');
 if(!Array.isArray(c.features)||c.features.length<1||c.features.length>6)fail('features: supply 1–6 scenes');
 unique(c.features.map(f=>f.id),'feature id');
 for(const f of c.features){ident(f.id,'feature.id');if(!c.screens.some(s=>s.id===f.screen))fail(`feature ${f.id}: screen missing`);text(f.title,'feature.title',24);
  if(!Array.isArray(f.steps)||!f.steps.length||f.steps.length>4)fail('steps: supply 1–4 focus steps');
  for(const s of f.steps){const r=s.rect;if(!Array.isArray(r)||r.length!==4||!r.every(Number.isFinite)||r[0]<0||r[1]<0||r[2]<=0||r[3]<=0||r[0]+r[2]>1.000001||r[1]+r[3]>1.000001)fail(`feature ${f.id}: rect must be within [0,1]`);number(s.hold,'step.hold',1,20);s.caption??='';if(s.caption)text(s.caption,'step.caption',28);}
 }
 c.hero??=[c.screens[0].id,c.screens[1].id];if(!Array.isArray(c.hero)||c.hero.length!==2||!c.hero.every(id=>c.screens.some(s=>s.id===id)))fail('hero: reference two screens');
 c.notice??='';if(c.notice)text(c.notice,'notice',48);
 const p=planScenes(c);if(p.duration>180)fail('duration exceeds 180 seconds');
 if(c.captions){let end=0;if(!Array.isArray(c.captions))fail('captions must be an array');for(const cap of c.captions){text(cap.text,'caption.text',28);number(cap.start,'caption.start',0,p.duration);number(cap.end,'caption.end',cap.start+.25,p.duration);if(cap.start<end)fail('caption overlap');end=cap.end;}}
 if(c.audio){text(c.audio.src,'audio.src',240);number(c.audio.duration,'audio.duration',.1,180);if(Math.abs(c.audio.duration-p.duration)>.1)fail('audio.duration must match the computed film duration within 0.1 second');}
 return c;
}
export function loadConfig(file){const base=dirname(resolve(file)),config=validateConfig(JSON.parse(readFileSync(file,'utf8')));return {base,config};}
