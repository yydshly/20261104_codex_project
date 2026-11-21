const chapterLinks = [...document.querySelectorAll('.reading-rail nav a')];
const chapters = chapterLinks.map(link => document.querySelector(link.hash));

function updateReadingPosition() {
  const readingLine = Math.min(180, window.innerHeight * 0.25);
  let current = chapters[0];
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= readingLine) current = chapter;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    current = chapters.at(-1);
  }
  for (const link of chapterLinks) {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

let pendingFrame = false;
window.addEventListener('scroll', () => {
  if (pendingFrame) return;
  pendingFrame = true;
  requestAnimationFrame(() => {
    updateReadingPosition();
    pendingFrame = false;
  });
}, { passive: true });
window.addEventListener('resize', updateReadingPosition);
updateReadingPosition();
