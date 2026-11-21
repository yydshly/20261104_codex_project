import './hub.css';
import { heroCatalog, heroSceneUrl, orbitHeroIds, readHeroSelection, setHeroSelection } from './hero-catalog.js';
import { createHubPreview } from './hub-preview.js';
import { makeOrbitBookmark } from './orbit-bookmark.js';

const heroById = new Map(heroCatalog.map(hero => [hero.id, hero]));
const rosterPanel = document.querySelector('#hero-roster');
const roster = document.querySelector('#roster-grid');
const rosterCount = document.querySelector('#roster-count');
const filters = [...document.querySelectorAll('[data-filter]')];
const stage = document.querySelector('#preview-stage');
const viewport = document.querySelector('#hub-viewport');
const ability = document.querySelector('#preview-ability');
const resetCamera = document.querySelector('#reset-camera');
const fallback = document.querySelector('#preview-fallback');
const fallbackGlyph = document.querySelector('#fallback-glyph');
const hint = document.querySelector('#preview-hint');
const profileIcon = document.querySelector('#hero-icon');
const profileName = document.querySelector('#hero-name');
const profileType = document.querySelector('#hero-type');
const profileGroup = document.querySelector('#hero-group');
const profileDescription = document.querySelector('#hero-description');
const profileReference = document.querySelector('#hero-ref');
const arenaLink = document.querySelector('#enter-arena');
const rescueLink = document.querySelector('#enter-rescue');
const browseRescue = document.querySelector('#browse-rescue');
const arenaStatus = document.querySelector('#arena-status');
const rescueStatus = document.querySelector('#rescue-status');
const orbitLink = document.querySelector('#enter-orbit');
const orbitComparisonLink = document.querySelector('#enter-orbit-comparison');
const orbitRelayLink = document.querySelector('#enter-orbit-relay');
const orbitLinkLabel = document.querySelector('#orbit-link-label');
const orbitStatus = document.querySelector('#orbit-status');
const quickArena = document.querySelector('#quick-arena');
const quickRescue = document.querySelector('#quick-rescue');
const quickOrbit = document.querySelector('#quick-orbit');
const quickMagnetLab = document.querySelector('#quick-magnet-lab');

const rosterFilters = {
  all: () => true,
  powered: hero => hero.group === 'powered',
  species: hero => hero.group === 'species',
  rescue: hero => hero.rescue,
  orbit: hero => orbitHeroIds.includes(hero.id),
};

let selected;
let preview;

function glyph(hero) {
  const stroke = hero.glyphFill === 'none' ? 'currentColor' : 'none';
  return `<svg viewBox="${hero.glyphViewBox}" fill="${hero.glyphFill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${hero.glyph}</svg>`;
}

const heroCards = new Map(heroCatalog.map((hero, index) => {
  const card = document.createElement('button');
  card.className = 'hero-card';
  card.type = 'button';
  card.dataset.hero = hero.id;
  card.setAttribute('aria-pressed', 'false');
  card.style.setProperty('--card-accent', hero.accent);
  card.innerHTML = `
    <span class="card-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
    <span class="card-icon" aria-hidden="true">${glyph(hero)}</span>
    <span class="card-name"></span>
    <span class="card-type"></span>
  `;
  card.querySelector('.card-name').textContent = hero.name;
  card.querySelector('.card-type').textContent = hero.type.split(' · ')[0];
  roster.append(card);
  return [hero.id, card];
}));

document.querySelector('#total-heroes').textContent = heroCatalog.length;
document.querySelector('#total-scenes').textContent = String(document.querySelectorAll('.scene-card').length).padStart(2, '0');

function applyFilter(filter) {
  const matchesFilter = rosterFilters[filter];
  let count = 0;
  for (const hero of heroCatalog) {
    const matches = matchesFilter(hero);
    heroCards.get(hero.id).hidden = !matches;
    if (matches) count += 1;
  }
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  rosterCount.textContent = `${String(count).padStart(2, '0')} / ${heroCatalog.length}`;
}

function showFallback(error) {
  if (error) console.warn('3D hero preview unavailable', error);
  preview = undefined;
  fallback.hidden = false;
  viewport.hidden = true;
  hint.hidden = true;
  stage.querySelector('.preview-tag').hidden = true;
  ability.disabled = true;
  resetCamera.disabled = true;
}

function selectHero(hero) {
  if (!hero || hero === selected) return;
  if (selected) heroCards.get(selected.id).setAttribute('aria-pressed', 'false');
  selected = hero;
  heroCards.get(hero.id).setAttribute('aria-pressed', 'true');
  setHeroSelection(hero.id);

  stage.style.setProperty('--hero-accent', hero.accent);
  profileIcon.style.color = hero.accent;
  profileIcon.innerHTML = glyph(hero);
  fallbackGlyph.innerHTML = glyph(hero);
  profileName.textContent = hero.name;
  profileType.textContent = hero.type;
  profileGroup.textContent = hero.group === 'powered' ? '超能英雄' : '竞技异种';
  profileDescription.textContent = hero.description;
  profileReference.textContent = `FIG / ${String(heroCatalog.indexOf(hero) + 1).padStart(2, '0')}`;

  const onOrbit = orbitHeroIds.includes(hero.id);
  quickMagnetLab.hidden = hero.id !== 'magnet';
  arenaLink.href = quickArena.href = heroSceneUrl('arena.html', hero.id);
  arenaStatus.textContent = `出场 · ${hero.name}`;
  quickRescue.hidden = !hero.rescue;
  rescueLink.hidden = !hero.rescue;
  browseRescue.hidden = hero.rescue;
  rescueStatus.textContent = hero.rescue ? `出场 · ${hero.name}` : `${hero.name}暂无缆车救援`;
  rescueStatus.classList.toggle('scene-status-unavailable', !hero.rescue);
  if (hero.rescue) {
    rescueLink.href = quickRescue.href = heroSceneUrl('rescue.html', hero.id);
  } else {
    browseRescue.href = heroSceneUrl('rescue.html', hero.id);
  }
  quickOrbit.hidden = !onOrbit;
  const orbitUrl = heroSceneUrl('orbit.html', hero.id);
  orbitLink.href = orbitUrl;
  if (onOrbit) quickOrbit.href = orbitUrl;
  const comparisonHero = onOrbit ? hero.id : 'rewind';
  orbitComparisonLink.href = makeOrbitBookmark({
    heroId: comparisonHero,
    compareId: comparisonHero === 'rewind' ? 'portal' : 'rewind',
    time: 6.6,
  });
  orbitRelayLink.href = makeOrbitBookmark({ heroId: hero.id, mission: 'relay', time: 7.35 });
  orbitStatus.textContent = onOrbit ? `出场 · ${hero.name}` : `${orbitHeroIds.length} 位英雄可出场`;
  orbitStatus.classList.toggle('scene-status-unavailable', !onOrbit);
  orbitLink.classList.toggle('scene-link-secondary', !onOrbit);
  orbitLinkLabel.textContent = onOrbit ? '进入轨道' : '浏览轨道现场';

  try {
    preview?.select(hero);
  } catch (error) {
    showFallback(error);
  }
}

roster.addEventListener('click', event => {
  const card = event.target.closest('[data-hero]');
  if (card) selectHero(heroById.get(card.dataset.hero));
});
filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
document.querySelectorAll('[data-scene-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.sceneFilter;
    applyFilter(filter);
    rosterPanel.scrollIntoView({ block: 'start' });
    filters.find(filterButton => filterButton.dataset.filter === filter).focus({ preventScroll: true });
  });
});
ability.addEventListener('click', () => preview?.previewAbility());
resetCamera.addEventListener('click', () => preview?.resetCamera());
viewport.addEventListener('webglcontextlost', () => showFallback(), { capture: true });

applyFilter('all');
try {
  preview = createHubPreview(viewport);
  if (preview) {
    ability.disabled = false;
    resetCamera.disabled = false;
  } else {
    showFallback();
  }
} catch (error) {
  showFallback(error);
}
selectHero(heroById.get(readHeroSelection()) ?? heroById.get('web') ?? heroCatalog[0]);
