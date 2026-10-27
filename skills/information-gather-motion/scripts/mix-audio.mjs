import {spawnSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {resolve, extname} from 'node:path';

const usage = 'Usage: node mix-audio.mjs --voice <audio> --duration <seconds> --out <new.wav> [--music <audio>] [--start <seconds>] [--music-gain <0..1>]';
try {
  const options = {};
  const valid = new Set(['voice', 'duration', 'out', 'music', 'start', 'music-gain']);
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.startsWith('--') ? args[i].slice(2) : '';
    if (!valid.has(key) || args[i + 1] === undefined || args[i + 1].startsWith('--') || key in options) throw Error(usage);
    options[key] = args[i + 1];
  }
  if (!options.voice || !options.duration || !options.out) throw Error(usage);
  const duration = Number(options.duration), start = Number(options.start ?? 0), gain = Number(options['music-gain'] ?? 0.12);
  if (!Number.isFinite(duration) || duration <= 0 || duration > 180) throw Error('duration must be > 0 and <= 180 seconds');
  if (!Number.isFinite(start) || start < 0 || start >= duration) throw Error('start must be within the film');
  if (!Number.isFinite(gain) || gain < 0 || gain > 1) throw Error('music-gain must be between 0 and 1');
  const voice = resolve(options.voice), out = resolve(options.out), music = options.music ? resolve(options.music) : null;
  for (const file of [voice, ...(music ? [music] : [])]) if (!existsSync(file) || !statSync(file).isFile()) throw Error(`input is not a file: ${file}`);
  if (extname(out).toLowerCase() !== '.wav') throw Error('output must use .wav');
  if (existsSync(out)) throw Error(`output already exists: ${out}`);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', voice], {encoding: 'utf8'});
  if (probe.error || probe.status !== 0) throw Error(`ffprobe failed: ${probe.error?.message || probe.stderr.trim()}`);
  const voiceDuration = Number(probe.stdout.trim());
  if (!Number.isFinite(voiceDuration) || voiceDuration <= 0) throw Error('cannot determine narration duration');
  if (start + voiceDuration > duration + 0.01) throw Error('narration exceeds film duration; lengthen the film instead of cutting the voice');
  const base = 'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo';
  const voiceChain = `[0:a:0]${base},adelay=${Math.round(start * 1000)}:all=1,apad,atrim=duration=${duration},asetpts=PTS-STARTPTS[v]`;
  const musicChain = music ? `;[1:a:0]${base},volume=${gain},apad,atrim=duration=${duration},asetpts=PTS-STARTPTS[m];[v][m]amix=inputs=2:duration=first:dropout_transition=0:normalize=0` : ';[v]anull';
  const filter = `${voiceChain}${musicChain},alimiter=limit=0.95:level=false:latency=1[out]`;
  const ffargs = ['-n', '-hide_banner', '-loglevel', 'error', '-i', voice, ...(music ? ['-i', music] : []), '-filter_complex', filter, '-map', '[out]', '-t', String(duration), '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', out];
  const result = spawnSync('ffmpeg', ffargs, {encoding: 'utf8'});
  if (result.error || result.status !== 0) throw Error(`ffmpeg failed: ${result.error?.message || result.stderr.trim()}`);
  console.log(JSON.stringify({output: out, duration, voiceDuration, start, music: !!music, musicGain: music ? gain : null}, null, 2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
