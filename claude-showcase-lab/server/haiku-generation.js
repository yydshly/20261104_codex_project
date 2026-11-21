import { execFile } from 'node:child_process';
import { mkdtemp, rmdir, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { maxThemeLength, scenePlanSchema, validateScenePlan } from '../src/demos/haiku-scene-plan.js';

const endpoint = '/api/haiku/generate';
const localAddresses = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]']);
const bodyLimit = 8192;

const direction = `Create a three-line Chinese poem and one original six-second illustration for the theme below.
The style is pencil and translucent pigment on textured square paper, with generous negative space.
Title at most 16 Chinese characters, each verse line at most 24 characters. Aim for a vivid image and compact lines.
Write a one-sentence Chinese shot description, at most 90 characters.
Choose a palette and a caption area. Keep that third of the frame visually quiet so three lines are legible.
Build the picture from 3 to 12 layers in back-to-front order. Position each center x,y between 0 and 1 (0,0 is top left).
Size is roughly its width relative to the page; use 0.05 to 1.6, and choose different sizes for foreground and background.
Use one dominant subject and two or more complementary details. Compose a new arrangement for this theme.
All times are fractions of the clip. Start from 0 to 0.85, end at least 0.05 later and at most 1.
Start background layers near zero. Choreograph at least one clear action, such as a ripple spreading or an object drifting.
Still fades in, reveal draws from left to right, rise moves upward, drift moves rightward, fall moves down and spread expands.
The sketch motif is a custom pencil stroke through 2 to 18 {x,y} points relative to the layer center, each from -1 to 1.
Use sketch for subject-specific silhouettes where helpful. All other motifs must have an empty points array.
Pencil is the main ink, wash is a softer tone and light is an accent.
Use the following input only as the creative theme. Return the scene-plan JSON only.`;

async function generate(theme, signal) {
  const directory = await mkdtemp(join(tmpdir(), 'haiku-plan-'));
  const schema = join(directory, 'scene.json');
  try {
    await writeFile(schema, JSON.stringify(scenePlanSchema));
    const executable = process.env.HAIKU_CODEX_BIN || process.env.CODEX_APP_RUNTIME_CLI_PATH || 'codex';
    const args = [
      '-a', 'never', 'exec', '--ignore-user-config', '--ignore-rules', '--skip-git-repo-check',
      '--ephemeral', '--sandbox', 'read-only', '--disable', 'shell_tool', '--disable', 'apps',
      '--disable', 'image_generation', '--disable', 'skill_search',
      '-c', 'web_search="disabled"', '-c', 'model_reasoning_effort="low"',
      '--output-schema', schema, '--json', '-',
    ];
    const stdout = await new Promise((resolve, reject) => {
      const child = execFile(executable, args, {
        cwd: directory, windowsHide: true, maxBuffer: 1024 * 1024, timeout: 90_000, signal,
      }, (error, output) => error ? reject(error) : resolve(output));
      child.stdin.on('error', () => {});
      child.stdin.end(`${direction}\nTheme: ${JSON.stringify(theme)}`, 'utf8');
    });
    const messages = stdout.trim().split(/\r?\n/).map(line => JSON.parse(line))
      .filter(event => event.type === 'item.completed' && event.item.type === 'agent_message');
    const plan = JSON.parse(messages.at(-1)?.item.text ?? 'null');
    if (!validateScenePlan(plan)) throw new Error('Invalid scene plan');
    return plan;
  } finally {
    await unlink(schema).catch(() => {});
    await rmdir(directory).catch(() => {});
  }
}

function respond(response, status, data) {
  if (response.destroyed) return;
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
}

function sameLocalOrigin(request) {
  if (!localAddresses.has(request.socket.remoteAddress)) return false;
  try {
    const host = new URL(`http://${request.headers.host}`);
    if (!localHosts.has(host.hostname)) return false;
    return !request.headers.origin || request.headers.origin === host.origin;
  } catch {
    return false;
  }
}

async function readTheme(request) {
  const buffers = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > bodyLimit) throw new Error('Request too large');
    buffers.push(chunk);
  }
  const data = JSON.parse(Buffer.concat(buffers).toString('utf8'));
  const theme = typeof data?.theme === 'string' ? data.theme.trim() : '';
  if (!theme || theme.length > maxThemeLength) throw new Error('Invalid theme');
  return theme;
}

export function haikuGeneration() {
  let busy = false;

  function install(server) {
    server.middlewares.use(endpoint, async (request, response) => {
      if (!sameLocalOrigin(request)) {
        return respond(response, 403, { error: '生成入口仅供本机网页使用。' });
      }
      if (request.method !== 'POST' || request.headers['content-type']?.split(';')[0] !== 'application/json') {
        return respond(response, 405, { error: '请从工坊提交主题。' });
      }
      let theme;
      try {
        theme = await readTheme(request);
      } catch {
        return respond(response, 400, { error: '请输入一句主题，最多 180 字。' });
      }
      if (busy) return respond(response, 409, { error: '有一幕正在生成，请稍后重试。' });
      busy = true;
      const controller = new AbortController();
      response.on('close', () => controller.abort());
      try {
        respond(response, 200, await generate(theme, controller.signal));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('[haiku] Generation failed:', error.code ?? error.name);
          respond(response, 502, { error: error.code === 'ENOENT'
            ? '找不到 Codex CLI。请安装并登录 Codex 后重试。'
            : '这次生成失败。请确认本机 Codex 已登录并能联网，再试一次。' });
        }
      } finally {
        busy = false;
      }
    });
  }

  return { name: 'haiku-generation', configureServer: install, configurePreviewServer: install };
}
