const palettes = {
  sketch: ['#f5efe0', '#e6dfcf', '#f0e8d7', '#ddd5c4', '#c9c0ae', '#e7decc', '#d3c7b2', '#b5a890', '#eee0c7', '#d1bba2', '#585248'],
  color: ['#a7c4c8', '#6a8998', '#759eae', '#557d89', '#3c626d', '#a7b5af', '#bf8b42', '#8c6037', '#dba95c', '#ad4c3c', '#384c52'],
}

export function balconyDraft(stage) {
  const [sky, roof, wall, floor, rail, reflection, wood, woodSide, woodTop, cloth, line] = palettes[stage]
  return `<svg viewBox="0 0 960 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${stage === 'sketch' ? '阳台构图草图' : '阳台配色小稿'}" stroke-linecap="round" stroke-linejoin="round">
    <path fill="${sky}" d="M0 0H960V640H0Z"/>
    <path fill="${roof}" d="M0 241V202L80 163 175 194 260 162 343 189 411 170 533 226V275H0Z"/>
    <path fill="${wall}" d="M520 0H960V422L520 299Z"/>
    <path fill="${floor}" stroke="${line}" stroke-width="4" d="M0 318L520 299 960 422V640H0Z"/>
    <g fill="none" stroke="${line}" stroke-width="3" opacity=".55">
      <path d="M24 640L279 310M288 640L410 304M545 640L550 308M805 640L711 355M0 428L728 358M0 535L960 427"/>
      <path d="M542 302V0"/>
    </g>
    <g fill="none" stroke="${rail}" stroke-width="13">
      <path d="M-15 181L319 211 527 167M-15 321L319 317 527 270M37 187V319M111 194V318M183 201V318M254 207V317M319 211V317M389 198V301M457 183V285M525 169V269"/>
    </g>
    <g fill="none" stroke="${reflection}" stroke-width="9" opacity=".84">
      <path d="M62 492L147 483M113 513L200 503M255 400L324 393M298 421L378 414M362 572L465 558M387 596L505 582"/>
    </g>
    <path fill="${rail}" opacity=".42" d="M500 566L714 516 943 575 895 624 543 614Z"/>
    <g stroke="${line}" stroke-width="4">
      <path fill="${woodSide}" d="M520 374L604 402V608L520 555Z"/>
      <path fill="${wood}" d="M604 402L925 353V544L604 608Z"/>
      <path fill="${woodTop}" d="M520 374L824 333 925 353 604 402Z"/>
      <path fill="none" opacity=".56" d="M604 468L925 414M604 534L925 479M520 434L604 468M520 493L604 534"/>
    </g>
    <path fill="${cloth}" stroke="${line}" stroke-width="3" d="M752 347L807 340 853 351 822 366 825 401 793 411 786 373 741 369Z"/>
  </svg>`
}

const stages = [
  {
    label: '01 构图草图',
    heading: '先决定哪里近、哪里远',
    source: '《卧室》用近处的大床和椅子，把桌子和窗衬到后面。',
    decision: '我们把木箱放大推到右下，把栏杆和远处山脊留在左后方。地面留出一条斜向的空带，视线能沿着它走进画里。',
  },
  {
    label: '02 配色小稿',
    heading: '只分三块颜色，先看焦点',
    source: '《卧室》用大面积蓝墙衬出黄褐床架，红色只用了一小块。',
    decision: '阳台的墙面和湿地用蓝灰，近处木箱用暖赭，箱盖上一小块朱红留给抹布。先确认三块颜色的面积，再画细节。',
  },
  {
    label: '03 成画',
    heading: '用笔触画出木头和雨水',
    source: '《卧室》的木条和草编椅面，各有顺着材质变化的笔触。',
    decision: '箱面顺着木板拉长笔触，湿地上的倒影用断开的浅笔横扫。保留前两稿定下的远近和冷暖关系。',
  },
]

export function balconyStudy(finalImage) {
  return `
    <section class="font-workshop__balcony" aria-labelledby="balcony-study-title">
      <h4 id="balcony-study-title" tabindex="-1">我们的画 · 雨后的阳台</h4>
      <p>同一张画的三个阶段。每一步都标出从原画借来的做法，以及它在阳台里怎么用。</p>
      <div class="font-workshop__actions font-workshop__study-controls" role="group" aria-label="阳台绘画阶段">
        ${stages.map(({ label }, i) => `<button type="button" data-balcony-stage="${i}" aria-controls="balcony-stage-${i}" aria-pressed="${i === 2}">${label}</button>`).join('')}
      </div>
      ${stages.map(({ heading, source, decision }, i) => `
        <div class="font-workshop__balcony-stage" id="balcony-stage-${i}"${i === 2 ? '' : ' hidden'}>
          <div class="font-workshop__study">
            <figure class="font-workshop__balcony-frame">
              ${i === 2
                ? `<img src="${finalImage}" width="1536" height="1024" loading="lazy" decoding="async" alt="《雨后的阳台》成画。暖赭木箱和朱红抹布在右侧近景，蓝灰湿地和栏杆通向左后的山脊。">`
                : balconyDraft(i === 0 ? 'sketch' : 'color')}
              <figcaption>${i === 2 ? '按配色小稿生成的成画' : i === 0 ? '用大形状画出近景和远景' : '沿用同一构图的色块规划'}</figcaption>
            </figure>
            <div class="font-workshop__exercise">
              <h5>${heading}</h5>
              <dl><dt>从原画借什么</dt><dd>${source}</dd><dt>这张画怎么用</dt><dd>${decision}</dd></dl>
            </div>
          </div>
        </div>`).join('')}
    </section>`
}

export function bindBalconyStudy(root) {
  const buttons = [...root.querySelectorAll('[data-balcony-stage]')]
  const panels = buttons.map(button => root.querySelector(`#${button.getAttribute('aria-controls')}`))
  const heading = root.querySelector('#balcony-study-title')

  function selectStage(index) {
    buttons.forEach((button, i) => {
      button.setAttribute('aria-pressed', i === index)
      panels[i].hidden = i !== index
    })
  }

  buttons.forEach((button, i) => button.addEventListener('click', () => selectStage(i)))
  root.querySelectorAll('[data-balcony-jump]').forEach(button => button.addEventListener('click', () => {
    selectStage(Number(button.dataset.balconyJump))
    heading.focus()
    heading.scrollIntoView({ block: 'start' })
  }))
}
