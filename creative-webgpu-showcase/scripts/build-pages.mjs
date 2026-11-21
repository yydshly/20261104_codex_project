import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = new URL("../dist/", import.meta.url);
const target = new URL("../../docs/007-creative-webgpu-showcase/", import.meta.url);
const files = [
  "index.html",
  "styles.css",
  "showcase.mjs",
  "exhibits.mjs",
  "assets/research-overview.png",
];

await mkdir(new URL("assets/", target), { recursive: true });
for (const file of files) {
  const original = new URL(file, source);
  const published = new URL(file, target);
  await copyFile(original, published);
  const originalHash = createHash("sha256").update(await readFile(original)).digest("hex");
  const publishedHash = createHash("sha256").update(await readFile(published)).digest("hex");
  if (originalHash !== publishedHash) throw new Error("复制校验失败 " + file);
}
console.log("GitHub Pages 已准备并逐文件校验 " + files.length + " 个文件");
console.log(fileURLToPath(target));
