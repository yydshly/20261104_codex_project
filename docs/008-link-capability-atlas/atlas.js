(() => {
  const catalog = [...window.atlasEntries].sort((a, b) => a.id - b.id);
  const list = document.querySelector('#case-list');
  const index = document.querySelector('#index-list');
  const search = document.querySelector('#search');
  const filters = [...document.querySelectorAll('.filters button')];
  const count = document.querySelector('#result-count');
  const toggleAll = document.querySelector('#toggle-all');
  const empty = document.querySelector('#empty');
  const caseTemplate = document.querySelector('#case-template');
  let activeCategory = 'all';
  let visibleEntries = [];

  function twoDigits(number) {
    return String(number).padStart(2, '0');
  }

  function normalize(value) {
    return value.normalize('NFKC').toLowerCase().trim();
  }

  const entries = catalog.map(entry => {
    const number = twoDigits(entry.id);
    const card = caseTemplate.content.firstElementChild.cloneNode(true);
    card.id = `case-${number}`;
    card.dataset.category = entry.category;
    card.open = entry.id === 1;

    const fields = {
      '.case-no': number,
      '.badge': entry.kind,
      '.case-author': entry.author,
      '.case-title': entry.title,
      '.case-deck': entry.summary,
      '.capability': entry.capability,
      '.relevance': entry.relevance,
      '.exercise': entry.exercise,
      '.boundary span': entry.boundary,
    };
    for (const [selector, value] of Object.entries(fields)) {
      card.querySelector(selector).textContent = value;
    }

    const steps = card.querySelector('.steps');
    entry.steps.forEach((step, position) => {
      const item = document.createElement('li');
      const badge = document.createElement('span');
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = twoDigits(position + 1);
      item.append(badge, step);
      steps.append(item);
    });

    window.renderAtlasShowcase(card.querySelector('.case-showcase'), entry.id);
    window.atlasResearch.render(card.querySelector('.case-research'), entry.id);

    const sources = card.querySelector('.sources');
    for (const source of entry.links) {
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const arrow = document.createElement('span');
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      link.append(source.label, arrow);
      sources.append(link);
    }

    const indexLink = document.createElement('a');
    indexLink.href = `#${card.id}`;
    indexLink.setAttribute('aria-label', `${number} ${entry.title}`);
    indexLink.title = entry.title;
    const indexNo = document.createElement('span');
    indexNo.className = 'index-no';
    indexNo.textContent = number;
    const indexTitle = document.createElement('span');
    indexTitle.className = 'index-title';
    indexTitle.textContent = entry.title;
    indexLink.append(indexNo, indexTitle);
    card.addEventListener('toggle', updateToggle);
    list.append(card);
    index.append(indexLink);

    const searchable = normalize([
      entry.title, entry.author, entry.kind, entry.summary, entry.capability,
      entry.relevance, entry.exercise, entry.boundary, ...entry.steps,
      window.atlasResearch.searchText(entry.id),
      ...entry.links.flatMap(link => [link.label, link.url]),
    ].join(' '));
    return { entry, card, indexLink, searchable };
  });

  function updateToggle() {
    const allExpanded = visibleEntries.every(item => item.card.open);
    toggleAll.textContent = allExpanded ? '收起全部' : '展开全部';
  }

  function renderFilters() {
    const query = normalize(search.value);
    const number = query.match(/^#?(0?[1-9]|1[0-6])$/);
    const words = query.split(/\s+/).filter(Boolean);
    visibleEntries = entries.filter(item => {
      const { entry, card, indexLink, searchable } = item;
      const matchesQuery = number ? entry.id === Number(number[1]) : words.every(word => searchable.includes(word));
      const visible = (activeCategory === 'all' || entry.category === activeCategory) && matchesQuery;
      card.hidden = !visible;
      indexLink.hidden = !visible;
      return visible;
    });
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.category === activeCategory));
    count.textContent = `显示 ${visibleEntries.length} / ${catalog.length} 条`;
    index.closest('.index').hidden = visibleEntries.length === 0;
    toggleAll.hidden = visibleEntries.length === 0;
    empty.hidden = visibleEntries.length !== 0;
    updateToggle();
  }

  function resetFilters() {
    activeCategory = 'all';
    search.value = '';
    renderFilters();
  }

  function openLinkedCase() {
    const target = entries.find(item => `#${item.card.id}` === location.hash);
    for (const item of entries) item.indexLink.removeAttribute('aria-current');
    if (!target) return;
    if (target.card.hidden) resetFilters();
    target.card.open = true;
    target.indexLink.setAttribute('aria-current', 'location');
    target.card.scrollIntoView({ block: 'start' });
  }

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      activeCategory = filter.dataset.category;
      renderFilters();
    });
  }
  search.addEventListener('input', renderFilters);
  toggleAll.addEventListener('click', () => {
    const open = !visibleEntries.every(item => item.card.open);
    for (const { card } of visibleEntries) card.open = open;
    updateToggle();
  });
  document.querySelector('#reset').addEventListener('click', () => {
    resetFilters();
    search.focus();
  });
  window.addEventListener('hashchange', openLinkedCase);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#case-"]');
    if (link?.hash === location.hash) openLinkedCase();
  });

  renderFilters();
  if (location.hash.startsWith('#case-')) requestAnimationFrame(openLinkedCase);
})();
