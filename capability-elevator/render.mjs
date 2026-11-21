import { once } from 'node:events';
import { readFile, rename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { startServer } from './server.mjs';
import { createTimeline } from './src/timeline.js';
import { makeSoundtrack } from './src/audio.mjs';

const draft = process.argv.includes('--draft');
const viewport = draft ? { width: 800, height: 450 } : { width: 1280, height: 720 };
const outputName = draft ? 'cognition-elevator-draft.mp4' : 'cognition-elevator.mp4';
const output = fileURLToPath(new URL('./public/media/' + outputName, import.meta.url));
const pending = fileURLToPath(new URL('./public/media/' + randomUUID() + '.partial.mp4', import.meta.url));

if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status !== 0) {
  throw new Error('需要可从 PATH 调用的 FFmpeg。');
}

const tour = JSON.parse(await readFile(new URL('./public/tour.json', import.meta.url), 'utf8'));
const timeline = createTimeline(tour);
const seconds = timeline.frames / timeline.fps;
const soundtrack = makeSoundtrack(seconds, timeline.stops.slice(1).map((stop) => stop.start), timeline.finaleStart);
const { server, url } = await startServer({ port: 0, soundtrack });
let browser;
let encoder;

try {
  browser = await chromium.launch({
    channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.goto(url + '/?render=1');
  await page.waitForFunction(() => window.renderFrame || document.documentElement.dataset.sceneError);
  const sceneError = await page.evaluate(() => document.documentElement.dataset.sceneError);
  if (sceneError) throw new Error(sceneError);

  encoder = spawn('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe',
    '-framerate', String(timeline.fps), '-vcodec', 'mjpeg', '-i', 'pipe:0',
    '-i', url + '/soundtrack.wav', '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'fast', '-crf', '19',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', pending,
  ], { stdio: ['pipe', 'ignore', 'inherit'] });

  async function* images() {
    for (let frame = 0; frame < timeline.frames; frame += 1) {
      await page.evaluate((number) => window.renderFrame(number), frame);
      yield await page.screenshot({ type: 'jpeg', quality: 94 });
      if ((frame + 1) % (timeline.fps * 3) === 0 || frame + 1 === timeline.frames) {
        console.log('已渲染 ' + (frame + 1) + ' / ' + timeline.frames + ' 帧');
      }
    }
  }

  await Promise.all([
    once(encoder, 'close').then(([status]) => {
      if (status !== 0) throw new Error('FFmpeg 退出，状态码 ' + status);
    }),
    pipeline(images(), encoder.stdin),
  ]);
  await rename(pending, output);
  console.log('成片 · ' + output);
} finally {
  if (encoder && encoder.exitCode === null) encoder.kill();
  try {
    await browser?.close();
  } finally {
    server.close();
  }
}
