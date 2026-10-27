import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {createHash} from 'node:crypto';

const available = ['ffmpeg', 'ffprobe'].every(tool => spawnSync(tool, ['-version'], {stdio:'ignore'}).status === 0);
const script = resolve('skills/information-gather-motion/scripts/mix-audio.mjs');

test('mixes to the requested duration and refuses truncation or overwrite', {skip: !available && 'ffmpeg/ffprobe unavailable'}, () => {
  const dir = mkdtempSync(join(tmpdir(), 'information-gather-mix-'));
  const input = join(dir, 'voice.wav'), output = join(dir, 'mix.wav'), rejected = join(dir, 'rejected.wav');
  const rate = 16000, samples = rate, wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF',0); wav.writeUInt32LE(wav.length-8,4); wav.write('WAVEfmt ',8);
  wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20); wav.writeUInt16LE(1,22);
  wav.writeUInt32LE(rate,24); wav.writeUInt32LE(rate*2,28); wav.writeUInt16LE(2,32); wav.writeUInt16LE(16,34);
  wav.write('data',36); wav.writeUInt32LE(samples*2,40);
  for(let i=0;i<samples;i++) wav.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*440/rate)*4000),44+i*2);
  writeFileSync(input,wav);
  const run = args => spawnSync(process.execPath,[script,...args],{encoding:'utf8'});
  const good = run(['--voice',input,'--music',input,'--duration','2','--start','0.25','--out',output]);
  assert.equal(good.status,0,good.stderr);
  const probe = spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',output],{encoding:'utf8'});
  assert.equal(probe.status,0,probe.stderr);
  assert.ok(Math.abs(Number(probe.stdout.trim())-2)<0.01);
  const hash = () => createHash('sha256').update(readFileSync(output)).digest('hex');
  const before = hash();
  assert.notEqual(run(['--voice',input,'--duration','2','--out',output]).status,0);
  assert.equal(hash(),before);
  const tooLong = run(['--voice',input,'--duration','1','--start','0.25','--out',rejected]);
  assert.notEqual(tooLong.status,0);
  assert.match(tooLong.stderr,/exceeds film duration/);
  assert.equal(existsSync(rejected),false);
});
