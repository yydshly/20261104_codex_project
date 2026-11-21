// Rebuild the published 01 cut with Node, resvg, FFmpeg, and Windows Chinese speech.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { Resvg } = require('@resvg/resvg-js');
const { duration, fps, layers, pose } = require('./collage-motion.js');

const source = fs.readFileSync(path.join(__dirname, 'collage.html'), 'utf8');
const board = source.match(/<svg id="board"[\s\S]*?<\/svg>/)[0].replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
const cues = [
  { start: 0.30, end: 1.55, text: '先找出问题。' },
  { start: 1.66, end: 3.10, text: '再拆成三步。' },
  { start: 3.26, end: 4.80, text: '逐项完成。' },
];

function frameAt(time) {
  let svg = board;
  for (const layer of layers) {
    const { visible, transform } = pose(layer, time);
    const tag = `<g id="${layer.id}"`;
    svg = svg.replace(tag, `${tag} ${visible ? `transform="${transform}"` : 'display="none"'}`);
  }
  return new Resvg(svg, { fitTo: { mode: 'width', value: 720 }, font: { loadSystemFonts: false } }).render().asPng();
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd, env: options.env, encoding: options.binary ? null : 'utf8' });
  if (result.status !== 0) throw result.error ?? new Error(`${command}: ${result.stderr || result.stdout}`);
  return result.stdout;
}

async function renderClean(folder) {
  const ffmpeg = spawn('ffmpeg', [
    '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', 'pipe:0',
    '-r', '24', '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'collage-clean.mp4',
  ], { cwd: folder, stdio: ['pipe', 'inherit', 'inherit'] });
  const encoded = new Promise((resolve, reject) => {
    ffmpeg.on('error', reject);
    ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited with ${code}`)));
  });
  function* frames() {
    for (let index = 0; index < duration * fps; index++) yield frameAt(index / fps);
  }
  await Promise.all([pipeline(Readable.from(frames()), ffmpeg.stdin), encoded]);
}

function timestamp(seconds) {
  return `00:00:${seconds.toFixed(3).padStart(6, '0').replace('.', ',')}`;
}

function renderNarrated(folder) {
  const voice = `
    $ErrorActionPreference = 'Stop'
    Add-Type -AssemblyName System.Speech
    $synth = [System.Speech.Synthesis.SpeechSynthesizer]::new()
    $synth.SelectVoice('Microsoft Huihui Desktop')
    $synth.Rate = 1
    $cues = ConvertFrom-Json $env:ATLAS_COLLAGE_VOICE
    try {
      for ($i = 0; $i -lt $cues.Count; $i++) {
        $synth.SetOutputToWaveFile((Join-Path (Get-Location).Path "cue-$i.wav"))
        $synth.Speak([string]$cues[$i])
        $synth.SetOutputToNull()
      }
    } finally { $synth.Dispose() }
  `;
  run('powershell.exe', ['-NoProfile', '-Command', voice], {
    cwd: folder, env: { ...process.env, ATLAS_COLLAGE_VOICE: JSON.stringify(cues.map(cue => cue.text)) },
  });

  fs.writeFileSync(path.join(folder, 'captions.srt'), cues.map(({ start, end, text }, index) => (
    `${index + 1}\n${timestamp(start)} --> ${timestamp(end)}\n${text}\n`
  )).join('\n'));
  const sampleRate = 22050;
  const sampleBytes = 2;
  const pcm = Buffer.alloc(sampleRate * duration * sampleBytes);
  for (const [index, { start, end }] of cues.entries()) {
    const input = ['-v', 'error', '-i', `cue-${index}.wav`];
    const format = ['-f', 's16le', '-ar', String(sampleRate), '-ac', '1'];
    let clip = run('ffmpeg', [...input, ...format, '-'], { cwd: folder, binary: true });
    const slot = end - start;
    const length = clip.length / (sampleRate * sampleBytes);
    if (length > slot) {
      const speed = length / (slot - .04);
      clip = run('ffmpeg', [...input, '-af', `atempo=${speed.toFixed(4)}`, ...format, '-'], { cwd: folder, binary: true });
    }
    const maxBytes = Math.round(slot * sampleRate) * sampleBytes;
    if (clip.length === 0 || clip.length > maxBytes) throw new Error(`Narration cue ${index + 1} did not fit`);
    clip.copy(pcm, Math.round(start * sampleRate) * sampleBytes);
  }
  fs.writeFileSync(path.join(folder, 'narration.pcm'), pcm);
  run('ffmpeg', [
    '-v', 'error', '-i', 'collage-clean.mp4', '-f', 's16le', '-ar', String(sampleRate), '-ac', '1', '-i', 'narration.pcm',
    '-map', '0:v', '-map', '1:a',
    '-vf', "subtitles=captions.srt:force_style='FontName=Microsoft YaHei,FontSize=15,MarginV=12,BorderStyle=3,Outline=4,OutlineColour=&H3523181C'",
    '-t', String(duration), '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '112k', '-movflags', '+faststart', 'collage-narrated.mp4',
  ], { cwd: folder });
}

async function main() {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-collage-'));
  try {
    await renderClean(folder);
    renderNarrated(folder);
    run('ffmpeg', ['-v', 'error', '-ss', '4', '-i', 'collage-clean.mp4', '-frames:v', '1', '-update', '1', 'cover.jpg'], { cwd: folder });
    const output = path.join(__dirname, 'collage-media');
    fs.mkdirSync(output, { recursive: true });
    for (const name of ['collage-clean.mp4', 'collage-narrated.mp4', 'cover.jpg']) {
      fs.copyFileSync(path.join(folder, name), path.join(output, name));
    }
  } finally {
    for (const name of fs.readdirSync(folder)) fs.unlinkSync(path.join(folder, name));
    fs.rmdirSync(folder);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
