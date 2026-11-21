import { Vector3 } from 'three';
import { cameraClearance } from './world-collision.js';

export function createObservation({ world, camera, controls, canvas, sites, collision, onEnter, onExit }) {
  const entry = document.createElement('button');
  entry.type = 'button';
  entry.className = 'tool observation-entry';
  entry.hidden = true;
  const panel = document.createElement('section');
  panel.className = 'observation-panel';
  panel.setAttribute('aria-label', '近距离观察');
  panel.hidden = true;
  const kicker = document.createElement('p');
  kicker.className = 'observation-kicker';
  const heading = document.createElement('h2');
  const description = document.createElement('p');
  description.className = 'observation-description';
  description.setAttribute('aria-live', 'polite');
  const choices = document.createElement('div');
  choices.className = 'observation-choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', '观察细节');
  const hint = document.createElement('p');
  hint.className = 'observation-hint';
  hint.textContent = '拖动环视 · 滚轮或双指缩放 · Esc 返回';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'tool';
  back.textContent = '返回原处';
  panel.append(kicker, heading, description, choices, hint, back);
  world.append(entry, panel);
  const anchor = new Vector3();
  const safe = new Vector3();
  const tracked = new Vector3();
  const trackingDelta = new Vector3();
  let candidate = null;
  let selected = null;
  let snapshot = null;
  let viewIndex = 0;

  function followSubject(initial = false) {
    const follow = selected?.views[viewIndex].follow;
    if (!follow) return;
    const next = follow();
    trackingDelta.fromArray(next).sub(initial ? controls.target : tracked);
    camera.position.add(trackingDelta);
    controls.target.add(trackingDelta);
    tracked.fromArray(next);
    // Sweep from the subject itself so foreground rocks cannot hide it.
    anchor.copy(tracked);
  }

  function selectView(index) {
    viewIndex = (index + selected.views.length) % selected.views.length;
    const view = selected.views[viewIndex];
    heading.textContent = view.title;
    description.textContent = view.description;
    [...choices.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === viewIndex)));
    controls.target.fromArray(view.target);
    camera.position.fromArray(view.position);
    anchor.fromArray(view.anchor);
    followSubject(true);
    controls.minDistance = view.minDistance ?? .65;
    controls.maxDistance = view.maxDistance ?? 7;
    controls.minPolarAngle = .08;
    controls.maxPolarAngle = Math.PI * .87;
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = damping;
    collision.constrainCamera(anchor, camera.position, safe, cameraClearance(camera));
    camera.position.copy(safe);
    camera.lookAt(controls.target);
  }

  function open() {
    if (!candidate || selected) return;
    snapshot = {
      position: camera.position.clone(), quaternion: camera.quaternion.clone(), target: controls.target.clone(),
      fov: camera.fov, near: camera.near, enabled: controls.enabled, pan: controls.enablePan,
      minDistance: controls.minDistance, maxDistance: controls.maxDistance,
      minPolar: controls.minPolarAngle, maxPolar: controls.maxPolarAngle,
    };
    selected = candidate;
    onEnter();
    world.classList.add('is-observing');
    entry.hidden = true;
    panel.hidden = false;
    kicker.textContent = selected.title;
    choices.replaceChildren(...selected.views.map((view, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = view.label;
      button.addEventListener('click', () => selectView(index));
      return button;
    }));
    controls.enabled = true;
    controls.enablePan = false;
    controls.stopListenToKeyEvents();
    camera.fov = 44;
    camera.near = .025;
    camera.updateProjectionMatrix();
    selectView(0);
    back.focus({ preventScroll: true });
  }

  function close() {
    if (!selected) return;
    selected = null;
    panel.hidden = true;
    world.classList.remove('is-observing');
    controls.enabled = snapshot.enabled;
    controls.enablePan = snapshot.pan;
    controls.minDistance = snapshot.minDistance;
    controls.maxDistance = snapshot.maxDistance;
    controls.minPolarAngle = snapshot.minPolar;
    controls.maxPolarAngle = snapshot.maxPolar;
    controls.target.copy(snapshot.target);
    camera.position.copy(snapshot.position);
    camera.quaternion.copy(snapshot.quaternion);
    camera.fov = snapshot.fov;
    camera.near = snapshot.near;
    camera.updateProjectionMatrix();
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = damping;
    onExit();
    canvas.focus({ preventScroll: true });
    snapshot = null;
  }

  entry.addEventListener('click', open);
  back.addEventListener('click', close);
  window.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (selected) {
      if (event.code === 'Escape') close();
      else if (event.code === 'ArrowLeft') selectView(viewIndex - 1);
      else if (event.code === 'ArrowRight') selectView(viewIndex + 1);
      else if (!/^(Key[WASDCE]|Space)$/.test(event.code)
        || (document.activeElement !== canvas && document.activeElement !== document.body)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    } else if (event.code === 'KeyE' && !event.repeat && candidate
      && (document.activeElement === canvas || document.activeElement === document.body || document.activeElement === entry)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      open();
    }
  }, { capture: true });

  return {
    close,
    get active() { return selected !== null; },
    updateCandidate(position, stopId, available) {
      if (selected) return;
      const next = available ? sites.find((site) => position
        ? Math.hypot(position.x - site.position[0], position.z - site.position[2]) < site.radius
          && Math.abs(position.y - site.position[1]) < 5
        : site.id === stopId) : null;
      if (candidate !== next) {
        candidate = next;
        entry.textContent = next ? `近看${next.title} · E` : '';
      }
      entry.hidden = !candidate;
    },
    update() {
      if (camera.fov !== 44 || camera.near !== .025) {
        camera.fov = 44;
        camera.near = .025;
        camera.updateProjectionMatrix();
      }
      followSubject();
      controls.update();
      collision.constrainCamera(anchor, camera.position, safe, cameraClearance(camera));
      camera.position.copy(safe);
      camera.lookAt(controls.target);
    },
  };
}
