import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL(".", import.meta.url));
const output = fileURLToPath(new URL("../docs/003-eian-seedance-workflow/", import.meta.url));

// Publish only the research materials referenced by the page and its notes.
const files = [
  "index.html", "exhibit.css", "exhibit.js", "README.md",
  "A-short.txt", "C-structured.txt", "director-brief.txt",
  "first.png", "last.png", "first-generated.png", "last-generated.png",
  "character-reference.png", "frames-side-by-side.png", "frame-difference.png",
  "wind-envelope-research-infographic.png",
  "exhibit-media/a.webp", "exhibit-media/b.webp", "exhibit-media/c.webp",
  "exhibit-media/compare.webp",
  "chatart-results/A/raw.mp4", "chatart-results/B/raw.mp4",
  "chatart-results/C/raw.mp4", "chatart-results/abc-comparison.mp4",
  "chatart-results/abc-contact-sheet.png",
];

for (const file of files) {
  const destination = join(output, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(source, file), destination);
}

console.log(`Published ${files.length} research files to ${output}`);
