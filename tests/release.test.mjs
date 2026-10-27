import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync,existsSync}from'node:fs';import{resolve}from'node:path';
const skill=resolve('skills/information-gather-motion'),md=readFileSync(skill+'/SKILL.md','utf8');
test('skill is discoverable and its local references exist',()=>{
 assert.match(md,/^---\nname: information-gather-motion\ndescription:/);assert.match(md,/metadata:\n  version: "1\.2\.0"/);
 for(const f of ['agents/openai.yaml','scripts/create.mjs','scripts/serve.mjs','scripts/verify.mjs','scripts/mix-audio.mjs','references/storyboard.md','references/config.md','references/narration.md','assets/template/examples/other-product/product.json'])assert.ok(existsSync(skill+'/'+f),f);
});
test('generated assets keep dependency-specific licenses',()=>{
 const notice=readFileSync(skill+'/assets/template/THIRD_PARTY.md','utf8');assert.match(notice,/not MIT/);assert.ok(existsSync(skill+'/assets/template/vendor/HUASHU-MIT.txt'));assert.ok(existsSync(skill+'/assets/template/vendor/GSAP-LICENSE.txt'));assert.ok(existsSync(skill+'/assets/template/assets/OFL.txt'));
});
test('Codex invocation names the installed skill',()=>{assert.match(readFileSync(skill+'/agents/openai.yaml','utf8'),/\$information-gather-motion/);});
