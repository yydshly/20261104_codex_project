import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const project = dirname(fileURLToPath(import.meta.url));
const docs = join(project, "..", "docs", "011-yunxi-ride");
const base = "https://yydshly.github.io/20261104_codex_project/011-yunxi-ride/";
const recording = "showcase/yunxi-x-full-ui.mp4";

async function publishFile(from, to = from) {
  const target = join(docs, to);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(join(project, from), target);
}

await import("./build.mjs");
await mkdir(docs, { recursive: true });

const sourceFiles = [
  "autopilot.js", "build.mjs", "collision.js", "engine.js", "fish-island.js",
  "herb-cove.js", "lantern-stop.js", "motion.js", "music.js", "rider.js",
  "shell.html", "world.js"
];
const researchFiles = [
  "app.js", "prompts.js", "styles.css", "yunxi-project-overview.png",
  "assets/ride.jpg", "assets/fish.jpg", "assets/herb.jpg", "assets/lantern.jpg"
];
const musicFiles = ["music/cheng-feng-xiao-guo-chong-shan.mp3", "music/steps-across-the-valley.mp3"];

await Promise.all([
  publishFile("index.html", "play.html"),
  ...researchFiles.map(file => publishFile("research/" + file, file)),
  ...sourceFiles.map(file => publishFile(file, "source/" + file)),
  ...musicFiles.map(file => publishFile(file))
]);

// A fresh checkout already has the full recording in the Pages tree.
try {
  await publishFile(recording);
} catch (error) {
  if (error.code !== "ENOENT" || !(await stat(join(docs, recording))).isFile()) throw error;
}

const description = "研究如何把 3D 鹈鹕骑行做成可操作、可验证的修仙世界。提供互动原型、完整界面实录、程序化场景与动作机制、复用价值和 12 条提示词。";
let page = await readFile(join(project, "research", "index.html"), "utf8");
page = page
  .replaceAll('href="../index.html"', 'href="play.html"')
  .replace(/(href|src)="\.\.\/(music|showcase)\//g, '$1="$2/')
  .replace(/href="\.\.\/([^"/]+\.(?:js|mjs|html))"/g, 'href="source/$1"')
  .replace('<a href="showcase/yunxi-x-showcase.mp4" target="_blank" rel="noopener">回看旧版</a>', "")
  .replace("本地存档", "在线研究")
  .replace("所有链接指向本地工程文件，网页与游戏均可从当前文件夹直接打开。", "从这里进入可玩的原型、完整实录和对应源码。")
  .replace("本页记录的是本地作品、素材和发布草稿。公开发布状态应以实际帖子链接为准。", "本页公开归档工程、素材和 X 发布草稿。X 帖子的发布状态以实际帖子链接为准。")
  .replace("可离线阅读 · 提示词可复制", "提供在线试玩 · 提示词可复制")
  .replace("  <title>", `  <link rel="canonical" href="${base}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="云隙行 · 3D 骑行世界研究与实机效果">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${base}">
  <meta property="og:image" content="${base}yunxi-project-overview.png">
  <meta name="twitter:card" content="summary">
  <title>`);
await writeFile(join(docs, "index.html"), page);
console.log("Built docs/011-yunxi-ride/");
