"use strict";

const promptList = document.getElementById("promptList");
const prompts = window.YUNXI_PROMPTS || [];
const categoryButtons = [...document.querySelectorAll("[data-category]")];
const toast = document.getElementById("toast");
let toastTimer;

function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    field.setAttribute("aria-label", "待复制的文本");
    document.body.append(field);
    const previouslyFocused = document.activeElement;
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    previouslyFocused?.focus({ preventScroll: true });
    if (!copied) {
      notify("自动复制未成功，可展开后选中文字复制");
      return;
    }
  }
  notify("已复制");
}

for (const prompt of prompts) {
  const detail = document.createElement("details");
  detail.className = "prompt searchable";
  detail.id = "prompt-" + prompt.id;
  detail.dataset.category = prompt.category;
  detail.dataset.title = "提示词 · " + prompt.title;
  const summary = document.createElement("summary");
  const summaryText = document.createElement("span");
  const heading = document.createElement("span");
  heading.className = "prompt-title";
  const title = document.createElement("strong");
  title.textContent = prompt.title;
  const tag = document.createElement("span");
  tag.className = "tag synthesized-tag";
  tag.textContent = prompt.category + " · " + prompt.kind;
  heading.append(title, tag);
  const description = document.createElement("span");
  description.className = "prompt-description";
  description.textContent = prompt.summary;
  summaryText.append(heading, description);
  summary.append(summaryText);
  const body = document.createElement("div");
  body.className = "prompt-body";
  const pre = document.createElement("pre");
  pre.textContent = prompt.text;
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "copy-button";
  copy.textContent = "复制提示词";
  copy.setAttribute("aria-label", "复制提示词「" + prompt.title + "」");
  copy.addEventListener("click", () => copyText(prompt.text));
  body.append(pre, copy);
  detail.append(summary, body);
  promptList.append(detail);
}

function filterPrompts(category) {
  let count = 0;
  for (const detail of promptList.children) {
    detail.hidden = category !== "全部" && detail.dataset.category !== category;
    if (!detail.hidden) count++;
  }
  for (const button of categoryButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.category === category));
  }
  document.getElementById("promptCount").textContent = count + " 条提示词";
}

for (const button of categoryButtons) {
  button.addEventListener("click", () => filterPrompts(button.dataset.category));
}
filterPrompts("全部");
document.getElementById("promptNavCount").textContent = prompts.length + " 条 · 支持复制与筛选";

const search = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchItems = [...document.querySelectorAll(".searchable")].map(element => ({
  element,
  title: element.dataset.title || element.querySelector("h3")?.textContent || "项目笔记",
  text: element.textContent.replace(/\s+/g, " ").trim()
}));

function showSearch() {
  searchResults.replaceChildren();
  const query = search.value.trim().toLocaleLowerCase();
  searchResults.hidden = !query;
  if (!query) return;
  const matches = searchItems.filter(item => (item.title + " " + item.text).toLocaleLowerCase().includes(query));
  for (const item of matches.slice(0, 12)) {
    const link = document.createElement("a");
    link.href = "#" + item.element.id;
    const title = document.createElement("strong");
    title.textContent = item.title;
    const snippet = document.createElement("span");
    const location = item.text.toLocaleLowerCase().indexOf(query);
    const start = Math.max(0, location - 22);
    snippet.textContent = (start ? "…" : "") + item.text.slice(start, start + 105) + "…";
    link.append(title, snippet);
    link.addEventListener("click", () => {
      filterPrompts("全部");
      if (item.element instanceof HTMLDetailsElement) item.element.open = true;
      searchResults.hidden = true;
      item.element.classList.remove("search-target");
      requestAnimationFrame(() => item.element.classList.add("search-target"));
    });
    searchResults.append(link);
  }
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.textContent = "没有找到相关条目。可试试「踏频」「点灯」「歌词」「录制」。";
    searchResults.append(empty);
  }
}

search.addEventListener("input", showSearch);
search.addEventListener("focus", showSearch);
search.addEventListener("keydown", event => {
  if (event.key === "Enter") searchResults.querySelector("a")?.click();
  if (event.key === "Escape") {
    searchResults.hidden = true;
    search.blur();
  }
});
document.addEventListener("pointerdown", event => {
  if (!event.target.closest(".search-wrap")) searchResults.hidden = true;
});
document.addEventListener("keydown", event => {
  if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey &&
      !event.target.matches("input, textarea, [contenteditable]")) {
    event.preventDefault();
    search.focus();
  }
});

const navLinks = [...document.querySelectorAll("#chapterNav a")];
const chapters = [...document.querySelectorAll(".chapter")];
const observer = new IntersectionObserver(entries => {
  const chapter = entries.find(entry => entry.isIntersecting)?.target;
  if (!chapter) return;
  for (const link of navLinks) {
    const active = link.hash === "#" + chapter.id;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}, { rootMargin: "-18% 0px -65% 0px" });
chapters.forEach(chapter => observer.observe(chapter));

const video = document.getElementById("fullRecording");
for (const button of document.querySelectorAll("[data-seek]")) {
  button.addEventListener("click", async () => {
    const seek = () => { video.currentTime = Number(button.dataset.seek); };
    if (video.readyState) seek();
    else video.addEventListener("loadedmetadata", seek, { once: true });
    try {
      await video.play();
    } catch {
      notify("已定位，可点击视频播放按钮观看");
    }
  });
}

const media = [...document.querySelectorAll("audio, video")];
for (const player of media) {
  player.addEventListener("play", () => media.forEach(other => {
    if (other !== player) other.pause();
  }));
}

document.getElementById("copyX").addEventListener("click", () => {
  copyText(document.getElementById("xCopyText").innerText);
});

const printStates = new Map();
window.addEventListener("beforeprint", () => {
  for (const detail of document.querySelectorAll("details")) {
    printStates.set(detail, { open: detail.open, hidden: detail.hidden });
    detail.hidden = false;
    detail.open = true;
  }
});
window.addEventListener("afterprint", () => {
  for (const [detail, state] of printStates) {
    detail.open = state.open;
    detail.hidden = state.hidden;
  }
  printStates.clear();
});
document.getElementById("printButton").addEventListener("click", () => window.print());

if (location.hash.startsWith("#prompt-")) {
  const detail = document.getElementById(location.hash.slice(1));
  if (detail) {
    detail.open = true;
    requestAnimationFrame(() => detail.scrollIntoView());
  }
}
