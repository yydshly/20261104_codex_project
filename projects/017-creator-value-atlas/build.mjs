import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = dirname(fileURLToPath(import.meta.url));
const output = resolve(project, "../../docs/017-creator-value-atlas");
const html = await readFile(join(project, "index.html"), "utf8");
const styles = await readFile(join(project, "styles.css"), "utf8");
const data = await readFile(join(project, "data.js"), "utf8");
const indieZhData = await readFile(join(project, "indie-zh-data.js"), "utf8");
const publishingData = await readFile(join(project, "publishing-data.js"), "utf8");
const soloData = await readFile(join(project, "solo-release-data.js"), "utf8");
const indieData = await readFile(join(project, "indie-data.js"), "utf8");
const app = await readFile(join(project, "app.js"), "utf8");
const guideFile = "research-goal-map-v2-20261121.png";
const guide = await readFile(join(project, "assets", guideFile));
const offlineApp = app.replaceAll(
  `src="assets/${guideFile}"`,
  `src="data:image/png;base64,${guide.toString("base64")}"`,
);
const inlineScript = (source) => source.replace(/<\/script/gi, "<\\/script");
const offline = html
  .replace(
    /<link\s+rel="stylesheet"\s+href="styles\.css"\s*\/?>/,
    `<style>\n${styles}\n</style>`,
  )
  .replace('<script defer src="data.js"></script>', "")
  .replace('<script defer src="indie-zh-data.js"></script>', "")
  .replace('<script defer src="publishing-data.js"></script>', "")
  .replace('<script defer src="solo-release-data.js"></script>', "")
  .replace('<script defer src="indie-data.js"></script>', "")
  .replace('<script defer src="app.js"></script>', "")
  .replace(/^[ \t]+(?=\r?$)/gm, "")
  .replace(
    "</body>",
    `<script>\n${inlineScript(data)}\n${inlineScript(indieZhData)}\n${inlineScript(publishingData)}\n${inlineScript(soloData)}\n${inlineScript(indieData)}\n${inlineScript(offlineApp)}\n</script>\n</body>`,
  );

if (/<script[^>]*\bsrc=|<link[^>]*\brel=["']stylesheet/i.test(offline)) {
  throw new Error(
    "The offline page still contains an external style or script.",
  );
}

await writeFile(join(project, "offline.html"), offline, "utf8");
await mkdir(output, { recursive: true });
for (const file of [
  "index.html",
  "styles.css",
  "data.js",
  "indie-zh-data.js",
  "publishing-data.js",
  "solo-release-data.js",
  "indie-data.js",
  "app.js",
  "offline.html",
]) {
  if (file.endsWith(".html")) {
    const source = await readFile(join(project, file), "utf8");
    await writeFile(
      join(output, file),
      source.replace('href="../../docs/index.html"', 'href="../index.html"'),
      "utf8",
    );
  } else {
    await copyFile(join(project, file), join(output, file));
  }
}
await mkdir(join(output, "assets"), { recursive: true });
for (const file of [guideFile, "research-goal-map-v2-20261121.svg"]) {
  await copyFile(join(project, "assets", file), join(output, "assets", file));
}
console.log("Generated the offline page and docs/017-creator-value-atlas.");
