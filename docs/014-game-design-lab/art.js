const iso = (x, y, size, height, top, left, right) => `<g transform="translate(${x} ${y})"><path d="M0 ${-height} ${size} ${size / 2 - height} 0 ${size - height} ${-size} ${size / 2 - height}Z" fill="${top}"/><path d="M${-size} ${size / 2 - height} 0 ${size - height}V${size}L${-size} ${size / 2}Z" fill="${left}"/><path d="M0 ${size - height} ${size} ${size / 2 - height}V${size / 2}L0 ${size}Z" fill="${right}"/></g>`;
const stars = Array.from({ length: 27 }, (_, i) => `<circle class="art-star" cx="${40 + (i * 137 % 680)}" cy="${25 + (i * 59 % 370)}" r="${i % 3 === 0 ? 1.8 : 1}" fill="#d5e5f3" opacity="${.15 + i % 4 * .1}" style="animation-delay:${i % 7}s"/>`).join('');
const tree = (x, y, c = '#417d5e', scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-4 0H4V-45H-4Z" fill="#5d4541"/><path d="M0-112-36-50H-23L-45-20H45L23-50H36Z" fill="${c}"/><path d="M0-112V-20H45L23-50H36Z" fill="#183f3d" opacity=".32"/></g>`;
const person = (x, y, color, helm = false) => `<g transform="translate(${x} ${y})"><ellipse rx="27" ry="12" fill="#070f18" opacity=".4"/><path d="M-20-12Q-24-53 0-54Q24-53 20-12L0-3Z" fill="${color}" stroke="#17232b" stroke-width="3"/><circle cy="-64" r="16" fill="#d1a486" stroke="#302e32" stroke-width="3"/>${helm ? '<path d="M-17-65Q-19-87 0-86Q19-87 17-65L5-70H-5Z" fill="#8b9ca3"/><path d="M0-84V-59" stroke="#465964" stroke-width="4"/>' : '<path d="M-15-69Q-15-85 2-82L15-70" fill="#423c3a"/>'}<path d="M-7-62H-3M4-62H8" stroke="#27343b" stroke-width="3"/><path d="M-23-47-37-33-30-13-14-18Z" fill="#b9a17c" stroke="#38424a" stroke-width="3"/><path d="M30-65V-13" stroke="#bbbdb8" stroke-width="5"/><path d="M20-24H40" stroke="#a1845a" stroke-width="4"/></g>`;

function spire() {
  let blocks = '';
  for (let i = 0; i < 6; i++) blocks += iso(397, 311 - i * 33, 66 - i * 5, 25, i % 2 ? '#56557d' : '#686184', '#302f50', '#403b60');
  return `${iso(389, 320, 205, 36, '#343b51', '#151c30', '#222941')}<ellipse cx="396" cy="348" rx="175" ry="50" fill="#9e86f5" opacity=".06"/>${blocks}<path d="m353 141 44-94 44 94-44 26Z" fill="#8472a7"/><path d="m397 47 44 94-44 26Z" fill="#544575"/><path d="M383 202q14-29 28 0v27h-28Z" fill="#dcba88"/><path d="M386 202q10-20 19 0v22h-19Z" fill="#ffe2ae" class="art-glow"/><path d="m270 322 45-41 30 12 30-37" fill="none" stroke="#c3addb" stroke-width="3" stroke-dasharray="5 9"/>${tree(526, 327, '#4c526f', .7)}${tree(254, 333, '#615377', .65)}<g class="float-a" transform="translate(144 216) rotate(-15)"><rect width="95" height="133" rx="9" fill="#29283e" stroke="#b9a4e9" stroke-width="2"/><rect x="8" y="8" width="79" height="72" rx="4" fill="#544066"/><path d="m47 19-19 45h38Z" fill="#ddc29a"/><path d="M43 38h8v41h-8Z" fill="#ba7184"/><path d="M20 99h54m-54 13h39" stroke="#938ba8" stroke-width="4"/><circle cx="8" cy="9" r="12" fill="#a290d4"/><text x="8" y="14" text-anchor="middle" fill="#161828" font-size="15">1</text></g><g class="float-b" transform="translate(568 165) rotate(13)"><rect width="85" height="120" rx="8" fill="#242b3c" stroke="#94b1d3" stroke-width="2"/><path d="m42 24-23 13 5 28 18 12 18-12 5-28Z" fill="#6a829e"/><path d="M19 96h47m-47 12h32" stroke="#8a98b0" stroke-width="4"/></g><path d="m473 127 24 16-5 27-26-4-9-22Z" fill="#a68eb8" class="float-c"/><path d="m490 139-14 5 5 12" fill="none" stroke="#ddd1ea" stroke-width="3"/>`;
}
function valley() {
  let crops = '';
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
    const x = 278 + col * 39 - row * 31, y = 294 + col * 19 + row * 18;
    crops += `<g transform="translate(${x} ${y})"><path d="m0-8 25 12-25 13-25-13Z" fill="#805b48" stroke="#ab7e55"/><path class="art-sprout" d="M0 0v-24m0 13q-20 0-15-13 14-1 15 13m0-4q18-3 14-15-13 0-14 15" stroke="#86b880" fill="#4c965c" stroke-width="2"/></g>`;
  }
  return `${iso(390, 320, 220, 34, '#537864', '#263f3e', '#34564c')}<path d="m194 294 130 65 56-28 118 56" fill="none" stroke="#bcb183" stroke-width="25"/>${crops}${iso(446, 194, 65, 66, '#bb9c72', '#806c58', '#998260')}<path d="m381 160 65-74 94 75-65 33Z" fill="#79927a"/><path d="m446 86 94 75-65 33-29-35Z" fill="#486b62"/><path d="m464 228 25-13v-35l-25 13Z" fill="#3d534f"/><path d="m391 194 21 10v-23l-21-10Z" fill="#f3d29d" class="art-glow"/>${tree(260, 224, '#739770', .85)}${tree(556, 319, '#789b79', 1.1)}${tree(551, 230, '#5d8469', .7)}<path d="m368 350 64-31 71 35-58 33Z" fill="#76a8ae" opacity=".85"/><path d="m393 352 27-13m20 20 28-13" stroke="#b9d3cf" stroke-width="3"/><g class="float-b"><path d="m232 161 7-5 7 5-7 5Z" fill="#e4c782"/><path d="M239 155v-10m-3 4h6" stroke="#e4c782"/></g><g transform="translate(363 263)"><circle r="10" cy="-31" fill="#d4ad8b"/><path d="M-10-20h20v22h-20" fill="#d6b56e"/><path d="M-6 2v11m12-11v11" stroke="#455968" stroke-width="5"/><path d="M-16-35h32m-23-8h14v8" stroke="#c3a56f" stroke-width="6"/></g><path d="m175 228 22-11m-13-1 22-11" stroke="#92beaa" stroke-width="3"/>`;
}
function dungeon() {
  let arches = '';
  for (let i = 0; i < 4; i++) arches += `<path d="M${191 + i * 91} 327V184q37-107 75 0v143" fill="#182230" stroke="#41434e" stroke-width="13"/><path d="M${201 + i * 91} 325V186q28-77 55 0" fill="none" stroke="#292d3a" stroke-width="5"/>`;
  return `${iso(389, 321, 222, 27, '#373440', '#1c1f2b', '#242331')}<path d="m181 335 5-174 203-93 203 93v174" fill="#252b37"/>${arches}<path d="m178 163 211-95 211 95" fill="none" stroke="#55505a" stroke-width="10"/><path d="M374 75V42h30v33" fill="#44434e"/><path d="M389 32v53m-15-36h30" stroke="#777079" stroke-width="7"/><ellipse cx="391" cy="312" rx="92" ry="65" fill="#e6845f" opacity=".06"/><path d="m274 332 70-38 149 70-70 39Z" fill="#48404a"/><path d="m312 347 35-20m3 34 35-20m4 35 35-20" stroke="#66606a" stroke-width="2"/>${person(295, 317, '#675564', true)}${person(360, 344, '#72716d')}<g transform="translate(471 279)"><path d="M0 34v-75" stroke="#b3976b" stroke-width="8"/><path d="M-18-49q9 3 9-23 22 13 8 32 18-3 13-24 21 35-7 40-26-1-23-25Z" fill="#e69b67" class="art-flame"/><path d="M-5-46q12 12 5 18-12 1-5-18" fill="#ffe8ad"/></g><g fill="#6e767e"><path d="m516 313 16-29 19 30-16 10Z"/><path d="M528 314v15h13v-15Z"/></g><path d="m529 307 3 1m8-1 3-1" stroke="#171e28" stroke-width="5"/><path d="M211 202h19m-10-14v35" stroke="#8b6255" stroke-width="5"/>`;
}
function factory() {
  let lines = '';
  const points = [[234, 284], [354, 345], [483, 278]];
  for (let i = 0; i < 2; i++) {
    const [x,y] = points[i], [x2,y2] = points[i+1];
    lines += `<path d="M${x} ${y} ${x2} ${y2}" stroke="#343e49" stroke-width="24"/><path d="M${x} ${y} ${x2} ${y2}" stroke="#9e8d5d" stroke-width="15" stroke-dasharray="3 8" class="art-belt"/>`;
  }
  return `${iso(389, 321, 220, 30, '#62695c', '#333d3d', '#444b42')}${lines}${iso(254, 246, 48, 49, '#7d9291', '#475d66', '#566b70')}${iso(357, 303, 45, 67, '#b39467', '#695f52', '#8a7255')}${iso(485, 235, 61, 50, '#8a9990', '#485d63', '#68786a')}<g transform="translate(356 221)"><path d="m-24 25 24 12 24-12V-2l-24-12-24 12Z" fill="#6b7374"/><path d="m-24-2 24 12 24-12-24-12Z" fill="#a9ad9e"/><ellipse cy="-2" rx="13" ry="6" fill="#353d43"/><circle class="art-smoke" cy="-26" r="12" fill="#89928c" opacity=".35"/><circle class="art-smoke" cx="-7" cy="-47" r="17" fill="#89928c" opacity=".18" style="animation-delay:1s"/></g><path d="m473 211 10-29 24-11 21 15" fill="none" stroke="#c1a265" stroke-width="9"/><path d="m515 189 6 16 15 6" fill="none" stroke="#aeb5a4" stroke-width="6"/><path d="m249 196-8-32 25-14 25 13-9 19" fill="none" stroke="#b6aa7e" stroke-width="10"/><path d="M537 219v-79m-19 13 38-18m-32 34 38-18" stroke="#929b87" stroke-width="5"/><path d="m545 147-123 30-167-27" fill="none" stroke="#ccaf6f" stroke-width="1.5"/><g fill="#c9ac70"><path d="m212 292 12-6 12 6-12 6Z"/><path d="m329 338 12-6 12 6-12 6Z"/></g><g transform="translate(470 321)"><circle r="16" fill="#bdab77"/><circle r="7" fill="#4b5c5a"/><path d="M-22 0h44M0-22v44m-16-16 32 32m-32 0 32-32" stroke="#bdab77" stroke-width="6"/></g>${tree(177, 319, '#64735b', .5)}`;
}
function brothers() {
  let hexes = '';
  for (let r=0;r<4;r++) for(let c=0;c<5;c++) { const x=215+c*65+(r%2?33:0),y=225+r*42; hexes += `<path d="m${x} ${y-25} 29 13v25l-29 14-29-14v-25Z" fill="${(r+c)%3?'#536568':'#627172'}" stroke="#83918a" stroke-opacity=".25" stroke-width="1"/>`; }
  return `${iso(388, 321, 224, 31, '#526568', '#293d49', '#354d56')}${hexes}<path d="m253 229 62-57 87 40 47-52 66 34" fill="none" stroke="#c2b58d" stroke-width="7" opacity=".5"/>${tree(210, 261, '#60766d', .65)}${tree(559, 322, '#6f8172', .75)}${person(282, 314, '#7d8a90', true)}${person(360, 346, '#987f6d', true)}${person(434, 312, '#6b7d7d')}<path d="M503 249v-131" stroke="#9e967f" stroke-width="5"/><path d="m505 121 57 26-16 14 16 28-57-26Z" fill="#b89b6a"/><path d="m525 143 9 5v14l-9-4Z" fill="#576c77"/><g fill="#b4b7a3"><path d="m463 345 26-14 18 21-26 13Z"/><path d="m215 306 17-9 14 15-17 9Z"/></g><path d="m342 198 27-15 24 13-27 15Z" fill="#b8a788"/><path d="m342 198v24l24 13v-24m0 24 27-15v-24" fill="#7b7565" stroke="#555d59"/>`;
}
const renderers = { spire, valley, dungeon, factory, brothers };
let sceneSerial = 0;
export function scene(id, label = '原创机制概念插画') {
  const gradientId = `halo-${id}-${++sceneSerial}`;
  return `<svg class="world-svg" viewBox="0 0 760 480" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="${gradientId}"><stop stop-color="currentColor" stop-opacity=".18"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient></defs><ellipse cx="389" cy="250" rx="310" ry="220" fill="url(#${gradientId})"/>${stars}<g class="island">${renderers[id]()}</g><ellipse cx="389" cy="426" rx="151" ry="13" fill="#050b15" opacity=".3"/></svg>`;
}
export function icon(name, size = 20) {
  const paths = {
    cards: '<rect x="5" y="4" width="13" height="17" rx="2"/><path d="m5 7-3 1 3 12m6-12v9m-3-5h6"/>',
    leaf: '<path d="M20 3c-1 9-1 15-9 15-6 0-8-6-4-10 3-3 7-1 13-5Z"/><path d="m4 21 11-11"/>',
    flame: '<path d="M13 2c2 7-5 8-2 12 2-1 3-4 3-5 5 3 8 11-1 13C3 23 1 15 5 10c-1 5 2 6 3 5-3-6 4-7 5-13Z"/>',
    gear: '<path d="m10 2 4 0 1 4 4-1 2 4-3 3 3 3-2 4-4-1-1 4h-4l-1-4-4 1-2-4 3-3-3-3 2-4 4 1Z"/><circle cx="12" cy="12" r="3"/>',
    shield: '<path d="m12 2 8 4v7c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="M12 6v11m-4-7h8"/>',
    play: '<path d="m9 5 11 7-11 7Z"/>',
    reset: '<path d="M4 9a8 8 0 1 1 0 7M4 3v6h6"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
    moon: '<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',
    book: '<path d="M12 5c-3-2-7-2-10 0v15c3-2 7-2 10 0 3-2 7-2 10 0V5c-3-2-7-2-10 0Zm0 0v15"/>',
    spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    water: '<path d="M12 2C9 8 4 12 4 16a8 8 0 0 0 16 0c0-4-5-8-8-14Z"/>',
    sword: '<path d="m20 3-2 8L8 21l-5-5L13 6Zm-7 10 4 4M5 19l-3 3"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
}
