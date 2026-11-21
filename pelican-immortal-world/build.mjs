import { readFile, writeFile } from "node:fs/promises";

const local = name => new URL(name, import.meta.url);
const read = name => readFile(local(name), "utf8");
const soundtracks = [{
  id: "mountain",
  title: "乘风啸过重山",
  file: "music/cheng-feng-xiao-guo-chong-shan.mp3",
  cadence: 32.5,
  cruisePace: 4.59,
  downbeat: 1.073,
  fadeIn: [.62, 2.8],
  fadeOut: [144, 158],
  softPhrases: [[10, 15, 30, 38, .46], [94, 99, 105, 112, .48]]
}, {
  id: "valley",
  title: "Steps Across the Valley",
  file: "music/steps-across-the-valley.mp3",
  cadence: 34,
  cruisePace: 4.7,
  fadeIn: [1, 5],
  fadeOut: [161, 176],
  softPhrases: []
}];
const [shell, world, fish, herb, lantern, rider, motion, collision, pilot, audio, engine, recordings] = await Promise.all(
  ["shell.html", "world.js", "fish-island.js", "herb-cove.js", "lantern-stop.js", "rider.js",
    "motion.js", "collision.js", "autopilot.js", "music.js", "engine.js"].map(read)
    .concat(Promise.all(soundtracks.map(async ({ file, ...profile }) => ({
      ...profile,
      source: "data:audio/mpeg;base64," + (await readFile(local(file))).toString("base64")
    }))))
);
const marker = "<!-- SCENE_BUNDLE -->";
if (shell.split(marker).length !== 2) throw new Error("Expected one scene bundle marker");
const source = `const IMMORTAL_SOUNDTRACKS = ${JSON.stringify(recordings)};`;
const script = ["\"use strict\";", world, fish, herb, lantern, rider, collision, motion, pilot, audio, source, engine].join("\n");
await writeFile(local("index.html"), shell.replace(marker, () => `<script>\n${script}\n</script>`));
