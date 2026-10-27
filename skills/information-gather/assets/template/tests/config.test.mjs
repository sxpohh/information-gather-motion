import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {validateConfig,planScenes,safeLocalAsset} from '../scripts/config.mjs';
import {createProject} from '../scripts/create.mjs';

const fixture=()=>({version:1,id:'sample',brand:{name:'产品示例'},theme:{background:'#fff9ee',accent:'#3c6b6e',ink:'#2f271f'},intro:{title:'把重点放在一起',caption:'真实界面，直接看。',duration:4},outro:{title:'产品示例',caption:'每天少找几次。',duration:3},screens:[{id:'home',src:'home.svg',alt:'示意首页'},{id:'detail',src:'detail.svg',alt:'示意详情'}],features:[{id:'one',screen:'home',title:'看清重点',steps:[{rect:[0.05,0.25,0.9,0.4],hold:3,caption:'看这块核心内容。'}]},{id:'two',screen:'detail',title:'继续处理',steps:[{rect:[0,0,1,1],hold:2,caption:'在这里完成。'}]}],notice:'模板示意'});

test('holds determine scene starts and all later scenes shift together',()=>{
 const c=validateConfig(fixture()),a=planScenes(c);c.features[0].steps[0].hold+=2;const b=planScenes(c);
 for(const delta of [b.features[1].start-a.features[1].start,b.outro.start-a.outro.start,b.duration-a.duration])assert.ok(Math.abs(delta-2)<1e-9);
});
test('the final hold pads to an exact 30fps frame boundary',()=>{
 const c=fixture();c.features[0].steps.push({rect:[0,0,1,1],hold:2,caption:'第二个重点'});const p=planScenes(validateConfig(c));assert.ok(Math.abs(p.duration*30-Math.round(p.duration*30))<1e-8);assert.equal(p.duration,p.outro.end);
});
test('rejects off-image focus and references to missing screens',()=>{
 const c=fixture();c.features[0].steps[0].rect=[.8,.2,.5,.5];assert.throws(()=>validateConfig(c),/rect/);
 c.features[0].steps[0].rect=[0,0,1,1];c.features[0].screen='absent';assert.throws(()=>validateConfig(c),/screen/);
});
test('rejects remote/absolute/traversing assets but accepts local filenames',()=>{
 const base=resolve(tmpdir(),'safe/config');for(const x of ['../secret.png','https://example.com/a.png','C:\\private.png','/tmp/file.png'])assert.throws(()=>safeLocalAsset(base,x),/local/);
 assert.equal(safeLocalAsset(base,'images/home.png'),resolve(base,'images/home.png'));
});
test('rejects duplicate ids, long captions and overlapping timed captions',()=>{
 let c=fixture();c.features[1].id='one';assert.throws(()=>validateConfig(c),/duplicate/);
 c=fixture();c.intro.caption='长'.repeat(31);assert.throws(()=>validateConfig(c),/caption/);
 c=fixture();c.captions=[{start:1,end:3,text:'第一句'},{start:2,end:4,text:'第二句'}];assert.throws(()=>validateConfig(c),/overlap/);
});
test('generates portable projects with original asset bytes and refuses overwrite',()=>{
 const root=mkdtempSync(join(tmpdir(),'gather-test-'));
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="363" height="785"><rect width="363" height="785" fill="white"/></svg>';
 for(const f of ['home.svg','detail.svg'])writeFileSync(join(root,f),svg);
 const c=fixture();c.brand.name='A < B';writeFileSync(join(root,'product.json'),JSON.stringify(c));
 const out=join(root,'portable');const result=createProject(join(root,'product.json'),out);
 assert.equal(readFileSync(join(out,'assets/screen-01.svg'),'utf8'),svg);
 assert.equal(existsSync(join(out,'vendor/gsap.min.js')),true);
 assert.equal(result.duration,planScenes(validateConfig(c)).duration);
 const js=readFileSync(join(out,'config.js'),'utf8');assert.equal(js.includes(root),false);assert.equal(js.includes('< B'),false);
 assert.throws(()=>createProject(join(root,'product.json'),out),/exists/);
});
test('missing inputs fail before creating output directory',()=>{
 const root=mkdtempSync(join(tmpdir(),'gather-missing-'));writeFileSync(join(root,'product.json'),JSON.stringify(fixture()));const out=join(root,'output');
 assert.throws(()=>createProject(join(root,'product.json'),out),/asset/);assert.equal(existsSync(out),false);
});
