import { exhibits, groups } from "./exhibits.mjs";

const byId = (id) => document.getElementById(id);
const groupLabels = new Map(groups.map(({ id, label }) => [id, label]));
const search = byId("search");
const cards = byId("cards");
const template = byId("exhibit-template");
const modules = new Map();
const previewByElement = new WeakMap();
const quickIds = ["fold", "melt", "cloth-sim-alley", "typegpu-webgpu", "4dgs-world-foundation-model"];
let groupFilter = "all";
let activeInteraction;

function mountPreview(preview) {
  if (preview.frame || preview.article.hidden || !preview.nearby) return;

  const { exhibit, viewport, standby, message, interact, fullscreen } = preview;
  const frame = document.createElement("iframe");
  if (exhibit.requiresIsolation && !window.crossOriginIsolated) {
    message.textContent = "此 4DGS 场景需要独立播放环境，请从下方「原站」打开";
    return;
  }
  if (window.crossOriginIsolated) {
    if (!("credentialless" in frame)) {
      message.textContent = "请在原站查看此场景";
      return;
    }
    frame.credentialless = true;
  }

  frame.title = exhibit.name + " · 作者原版互动场景";
  frame.allow = "fullscreen; autoplay; cross-origin-isolated";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.tabIndex = -1;
  frame.src = exhibit.url;
  preview.frame = frame;
  message.textContent = "正在载入原版场景…";
  viewport.setAttribute("aria-busy", "true");

  frame.addEventListener("load", () => {
    clearTimeout(preview.loadTimeout);
    standby.hidden = true;
    viewport.removeAttribute("aria-busy");
    frame.classList.add("loaded");
    interact.disabled = false;
    fullscreen.disabled = false;
  }, { once: true });
  frame.addEventListener("error", () => {
    clearTimeout(preview.loadTimeout);
    message.textContent = "场景未能载入，可在原站打开";
    viewport.removeAttribute("aria-busy");
  }, { once: true });
  preview.loadTimeout = setTimeout(() => {
    message.textContent = "场景加载较慢，也可在原站打开";
  }, 12000);

  viewport.append(frame);
}

function setInteraction(preview, enabled) {
  const { viewport, interact, frame } = preview;
  viewport.classList.toggle("is-interactive", enabled);
  interact.setAttribute("aria-pressed", String(enabled));
  interact.textContent = enabled ? "结束操作" : "操作场景";
  if (frame) frame.tabIndex = enabled ? 0 : -1;
  if (enabled) activeInteraction = preview;
  else if (activeInteraction === preview) activeInteraction = undefined;
}

function enableInteraction(preview) {
  if (activeInteraction && activeInteraction !== preview) setInteraction(activeInteraction, false);
  setInteraction(preview, true);
}

function unmountPreview(preview) {
  const { viewport, standby, message, interact, fullscreen } = preview;
  if (document.fullscreenElement === viewport) return;
  clearTimeout(preview.loadTimeout);
  setInteraction(preview, false);
  preview.frame?.remove();
  preview.frame = undefined;
  standby.hidden = false;
  message.textContent = "滚动到此处时自动加载场景";
  viewport.removeAttribute("aria-busy");
  interact.disabled = true;
  fullscreen.disabled = true;
}

function schedulePreview(preview, nearby) {
  preview.nearby = nearby;
  clearTimeout(preview.visibilityTimeout);
  if (nearby && !preview.frame) {
    preview.visibilityTimeout = setTimeout(() => mountPreview(preview), 90);
  } else if (!nearby && preview.frame) {
    preview.visibilityTimeout = setTimeout(() => unmountPreview(preview), 600);
  }
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    schedulePreview(previewByElement.get(entry.target), entry.isIntersecting);
  }
}, { rootMargin: "140px 0px" });

function createModule(exhibit, index) {
  const article = template.content.firstElementChild.cloneNode(true);
  const find = (selector) => article.querySelector(selector);
  const title = find("h3");
  const { id, name, group, poster, summary, mechanism, value, controls, tags, source, url } = exhibit;

  article.id = "exhibit-" + id;
  title.id = article.id + "-title";
  article.setAttribute("aria-labelledby", title.id);
  find(".exhibit-meta").textContent = [
    String(index + 1).padStart(2, "0"), groupLabels.get(group), exhibit.title,
  ].join(" / ");
  title.textContent = name;
  find(".summary").textContent = summary;
  find(".mechanism").textContent = mechanism;
  find(".value").textContent = value;
  if (controls) {
    find(".controls").textContent = controls;
    find(".controls-row").hidden = false;
  }
  for (const tag of tags) {
    const item = document.createElement("li");
    item.textContent = tag;
    find(".tags").append(item);
  }
  const original = find(".original");
  original.href = url;
  original.setAttribute("aria-label", "在原站打开" + name);
  if (source) {
    const sourceLink = find(".source");
    sourceLink.href = source;
    sourceLink.hidden = false;
  }
  if (poster) {
    const image = find(".poster");
    image.addEventListener("load", () => { image.hidden = false; }, { once: true });
    image.src = poster;
  }

  const preview = {
    exhibit, article,
    viewport: find(".viewport"),
    standby: find(".standby"),
    message: find(".preview-message"),
    interact: find(".interact"),
    fullscreen: find(".fullscreen"),
    searchable: [name, exhibit.title, summary, mechanism, value, ...tags].join(" ").toLowerCase(),
  };

  preview.interact.addEventListener("click", () => {
    if (activeInteraction === preview) {
      setInteraction(preview, false);
    } else {
      enableInteraction(preview);
      preview.frame?.focus({ preventScroll: true });
    }
  });

  preview.fullscreen.hidden = !document.fullscreenEnabled;
  preview.fullscreen.addEventListener("click", async () => {
    try {
      await preview.viewport.requestFullscreen();
      enableInteraction(preview);
      preview.frame?.focus();
    } catch {
      original.focus();
    }
  });

  preview.viewport.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && !preview.nearby) unmountPreview(preview);
  });

  previewByElement.set(preview.viewport, preview);
  return preview;
}

function filterModules() {
  const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let visible = 0;

  for (const preview of modules.values()) {
    const matchesGroup = groupFilter === "all" || preview.exhibit.group === groupFilter;
    const matchesSearch = terms.every((term) => preview.searchable.includes(term));
    const show = matchesGroup && matchesSearch;
    preview.article.hidden = !show;
    if (show) visible += 1;
    else if (preview.frame) unmountPreview(preview);
  }

  byId("results").textContent = visible + " / " + exhibits.length + " 件展品";
  byId("empty").hidden = visible > 0;
  for (const button of byId("filters").children) {
    button.setAttribute("aria-pressed", String(button.dataset.group === groupFilter));
  }
}

function scrollToExhibit(id) {
  const preview = modules.get(id);
  if (!preview) return;
  if (preview.article.hidden) {
    groupFilter = "all";
    search.value = "";
    filterModules();
  }
  preview.article.scrollIntoView({ block: "start" });
}

exhibits.forEach((exhibit, index) => {
  const preview = createModule(exhibit, index);
  modules.set(exhibit.id, preview);
  cards.append(preview.article);
  observer.observe(preview.viewport);
});

for (const { id, label } of [{ id: "all", label: "全部" }, ...groups]) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.group = id;
  button.addEventListener("click", () => {
    groupFilter = id;
    filterModules();
  });
  byId("filters").append(button);
}

function createExhibitLink(preview) {
  const id = preview.exhibit.id;
  const url = new URL(location.href);
  url.searchParams.set("exhibit", id);
  url.hash = preview.article.id;
  const link = document.createElement("a");
  link.href = url.href;
  link.textContent = preview.exhibit.name;
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, "", link.href);
    scrollToExhibit(id);
  });
  return link;
}

for (const id of quickIds) {
  const preview = modules.get(id);
  if (preview) byId("quick-items").append(createExhibitLink(preview));
}

for (const group of groups) {
  const entries = exhibits.filter((exhibit) => exhibit.group === group.id);
  const section = document.createElement("section");
  section.className = "inventory-group";
  const heading = document.createElement("h3");
  heading.textContent = group.label;
  const count = document.createElement("span");
  count.textContent = String(entries.length) + " 项";
  heading.append(count);
  const list = document.createElement("ul");
  for (const exhibit of entries) {
    const item = document.createElement("li");
    item.append(createExhibitLink(modules.get(exhibit.id)));
    list.append(item);
  }
  section.append(heading, list);
  byId("effect-inventory").append(section);
}

search.addEventListener("input", filterModules);
function openLinkedExhibit() {
  const id = new URL(location.href).searchParams.get("exhibit");
  if (modules.has(id)) scrollToExhibit(id);
}
window.addEventListener("popstate", openLinkedExhibit);
byId("hero-count").textContent = String(exhibits.length);
for (const cell of document.querySelectorAll("[data-group-count]")) {
  cell.textContent = String(exhibits.filter((exhibit) => exhibit.group === cell.dataset.groupCount).length);
}
filterModules();
requestAnimationFrame(openLinkedExhibit);
