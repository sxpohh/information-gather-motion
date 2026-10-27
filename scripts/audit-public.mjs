import {readdirSync,readFileSync} from 'node:fs';import {resolve,join,relative} from 'node:path';import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url))),files=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','.tmp','out','__pycache__'].includes(e.name))continue;const path=join(dir,e.name);if(e.isDirectory())walk(path);else files.push(path);}}
walk(root);const issues=[],text=/\.(?:md|txt|mjs|js|json|ya?ml|html|svg)$/i;
const privatePath=/[CD]:[\\/](?:Users[\\/]|AiStudy[\\/]|AI[\\/])/i,token=/(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/;
for(const f of files){const name=relative(root,f);if(/(?:^|[\\/])\.env(?:\.|$)/.test(name))issues.push(name+': environment file');if(text.test(name)){const s=readFileSync(f,'utf8');if(privatePath.test(s))issues.push(name+': machine-specific private path');if(token.test(s))issues.push(name+': credential pattern');if(/RELEASE_TIMESTAMP|\bTODO\b|\bTBD\b/.test(s)&&name!=='scripts'+(process.platform==='win32'?'\\':'/')+'audit-public.mjs')issues.push(name+': unfinished release text');}}
if(files.some(f=>relative(root,f).replaceAll('\\','/').includes('examples/xiaok')))issues.push('product-specific example included');
console.log(JSON.stringify({pass:issues.length===0,files:files.length,issues},null,2));if(issues.length)process.exitCode=1;
