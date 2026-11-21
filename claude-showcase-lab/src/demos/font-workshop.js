import { alphabet, baseline, buildWorkshopFont, exampleStrokes, penWidth } from './font-workshop-glyphs.js'
import { balconyStudy, bindBalconyStudy } from './balcony-study.js'
import './font-workshop.css'

const museumPage = 'https://www.artic.edu/artworks/28560/the-bedroom'
const museumImageSource = 'https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_The_Bedroom_-_1926.417_-_Art_Institute_of_Chicago.jpg'
const painting = `${import.meta.env.BASE_URL}van-gogh-the-bedroom-1889.jpg`
const balconyPainting = `${import.meta.env.BASE_URL}balcony-after-the-rain.png`
const comparison = `${import.meta.env.BASE_URL}bedroom-style-comparison.png`
const qingmingBridge = `${import.meta.env.BASE_URL}qingming-zhang-zeduan-hongqiao.jpg`
const qingmingScroll = `${import.meta.env.BASE_URL}qingming-zhang-zeduan-scroll.jpg`
const springMarket = `${import.meta.env.BASE_URL}qingming-hongqiao-spring-market.png`
const huangpuSpring = `${import.meta.env.BASE_URL}huangpu-river-spring-scroll.png`
const qingmingMuseumPage = 'https://minghuaji.dpm.org.cn/paint/detail?id=592d80e225aac624977fee2e19452c1f'
const qingmingScrollSource = 'https://commons.wikimedia.org/wiki/File:Alongtheriver_QingMing.jpg'
const qingmingBridgeSource = 'https://commons.wikimedia.org/wiki/File:Along_the_River_During_the_Qingming_Festival_(detail_of_original).jpg'
const huangpuSource = 'https://english.shanghai.gov.cn/en-NationalDevelopmentZone/20231211/0a27a204c2f7473482d824b5715daab6.html'

const paintingStudies = [
  {
    label: '构图',
    heading: '用大形状安排远近',
    observe: '看右侧的大床和左下角的椅子。它们离画面边缘很近，把后面的桌子和窗框在中间。',
    practice: '用铅笔给自己的房间画一张小草图。先放三个形状：近处的桌角或椅背、后面的窗、一块露出来的地面。画两版，一版把近处物件放大，一版缩小，看看哪版更有空间感。',
    check: '眯起眼睛看，能分出哪个物件在最前面吗？',
    marks: '<path d="M620 271 L858 255 L891 329 Q1014 270 1120 322 L1163 308 L1202 775 L1150 790 L1145 725 L808 771 L815 853 L762 851 L749 735 L627 512 Z M10 436 L89 400 L115 551 L205 570 L219 746 L180 855 L162 742 L50 761 L25 821 Z"/>',
  },
  {
    label: '配色',
    heading: '用大面积冷色衬出暖色主体',
    observe: '这幅画里，蓝墙铺得很大，黄褐色床架占据前景，床毯的红只露出一小块。',
    practice: '在刚才的草图上，先用一种偏冷的颜色铺背景，再用暖色画最想让人注意的家具。最后只留一小块更鲜明的颜色，比如杯子。颜色可以按你的房间来选。',
    check: '画到一半停下来，第一眼落在你想强调的物件上吗？',
    marks: '<circle cx="1040" cy="126" r="46"/><circle cx="1000" cy="476" r="55"/><circle cx="713" cy="498" r="32"/>',
  },
  {
    label: '笔触',
    heading: '顺着物体的结构落笔',
    observe: '看左下椅面的短笔触，它们顺着草编的形状转向。再看床尾横档，笔触沿着木条展开。',
    practice: '挑你画里的一把椅子，先顺着木条画几笔，再沿着坐垫边缘改变笔触方向。用铅笔或彩笔也可以先练这个变化。',
    check: '去掉颜色，只看笔触方向，还能分出木条和椅面吗？',
    marks: '<ellipse cx="121" cy="614" rx="88" ry="51" transform="rotate(-10 121 614)"/><ellipse cx="976" cy="695" rx="161" ry="24" transform="rotate(-9 976 695)"/>',
  },
]

export function mountFontWorkshop(root) {
  root.innerHTML = `
    <section class="font-workshop" aria-label="笔迹字体工坊">
      <header class="font-workshop__header">
        <span>TYPE LAB / 03</span>
        <h3>从一笔，做成一套字体</h3>
        <p>先用 26 个示例字母试字，再把其中任意一个换成自己写的。支持 A–Z 和空格。</p>
        <div class="font-workshop__actions">
          <button type="button" data-workshop-jump="workshop-art">去看名画怎么参考 ↓</button>
          <button type="button" data-workshop-jump="workshop-qingming">看《清明上河图》对照 ↓</button>
          <button type="button" data-workshop-jump="workshop-huangpu">看现代上海长卷 ↓</button>
        </div>
      </header>
      <div class="font-workshop__grid">
        <section aria-label="字形编辑">
          <label class="font-workshop__letter">要写的字母
            <select aria-label="要写的字母">${[...alphabet].map(letter => `<option>${letter}</option>`).join('')}</select>
          </label>
          <canvas width="300" height="300" aria-label="手写板，可用鼠标、触屏或笔书写"></canvas>
          <p class="font-workshop__hint">点「清空画板」后在两条横线之间写字。写好后点「应用字形」。</p>
          <div class="font-workshop__actions">
            <button type="button" data-clear>清空画板</button>
            <button type="button" data-example>恢复这个字母</button>
            <button type="button" data-apply>应用字形</button>
          </div>
        </section>
        <section aria-label="字体预览与导出" class="font-workshop__preview">
          <label for="workshop-preview">实时试字</label>
          <textarea id="workshop-preview" lang="en" spellcheck="false" maxlength="180">HELLO WORLD
MY OWN HAND</textarea>
          <p data-status class="font-workshop__hint" role="status"></p>
          <button type="button" data-download disabled>下载 OTF 字体</button>
          <p class="font-workshop__hint">文件包含所有 A–Z 字形。你应用过的字形会替换示例，其余字母保留示例写法。</p>
        </section>
      </div>
    </section>
    <section class="font-workshop__art" aria-labelledby="workshop-art">
      <h3 id="workshop-art" tabindex="-1">从《卧室》学怎么画自己的房间</h3>
      <p>换画风给你看生成后的成品。绘画参考帮你找到原画里的一个做法，把它用到自己正在画的场景里。</p>
      <div class="font-workshop__study">
        <figure>
          <div class="font-workshop__original">
            <img src="${painting}" width="1280" height="1005" loading="lazy" decoding="async"
              alt="梵高《卧室》原作。蓝色房间里，右侧有一张木床，左下角有一把草编椅，后方是桌子和窗。">
            <svg viewBox="0 0 1280 1005" aria-hidden="true">
              ${paintingStudies.map(({ marks }, i) => `<g data-art-mark="${i}"${i ? ' hidden' : ''}>${marks}</g>`).join('')}
            </svg>
          </div>
          <figcaption>梵高《卧室》，1889 年 · 芝加哥艺术博物馆藏 · <a href="${museumPage}" target="_blank" rel="noopener noreferrer">馆藏说明</a> · <a href="${museumImageSource}" target="_blank" rel="noopener noreferrer">图像来源</a></figcaption>
        </figure>
        <div>
          <div class="font-workshop__actions font-workshop__study-controls" role="group" aria-label="选择观察重点">
            ${paintingStudies.map(({ label }, i) => `<button type="button" data-art-step="${i}" aria-controls="painting-study-${i}" aria-pressed="${i === 0}">${label}</button>`).join('')}
            <button type="button" data-art-marks aria-pressed="true">显示标注</button>
          </div>
          ${paintingStudies.map(({ heading, observe, practice, check }, i) => `
            <div class="font-workshop__exercise" id="painting-study-${i}" data-art-exercise="${i}"${i ? ' hidden' : ''}>
              <h4>${heading}</h4>
              <dl>
                <dt>看原画</dt><dd>${observe}</dd>
                <dt>动手画</dt><dd>${practice}</dd>
                <dt>画完自查</dt><dd>${check}</dd>
              </dl>
              <button class="font-workshop__reference-jump" type="button" data-balcony-jump="${i}">看这一步怎么用在《雨后的阳台》 ↓</button>
            </div>`).join('')}
        </div>
      </div>
      ${balconyStudy(balconyPainting)}
      <details class="font-workshop__comparison">
        <summary>展开上次的生成式换画风示例</summary>
        <figure>
          <img src="${comparison}" width="1536" height="1024" loading="lazy" decoding="async"
            alt="生成式画风对照。左侧是靠窗书桌的照片风格，右侧用蓝紫墙面、黄色木椅和油画笔触表现同一场景。">
          <figcaption>左图 · 生成的照片风格场景　｜　右图 · 生成的油画风格场景</figcaption>
        </figure>
      </details>
    </section>
    <section class="font-workshop__art font-workshop__qingming" aria-labelledby="workshop-qingming">
      <h3 id="workshop-qingming" tabindex="-1">《清明上河图》原作与再创作</h3>
      <p>把同一主题下的桥、船和市集放在一起看。《虹桥春市》沿用细墨线和淡设色，把虹桥拉到横幅中央，右边留给柳岸和码头，左边接上市集。</p>
      <div class="font-workshop__qingming-pair">
        <figure>
          <h4>张择端《清明上河图》 · 虹桥局部</h4>
          <a href="${qingmingBridge}" target="_blank" rel="noopener" aria-label="打开大图查看原作虹桥局部">
            <img src="${qingmingBridge}" width="1920" height="960" loading="lazy" decoding="async"
              alt="张择端《清明上河图》原卷局部，木拱虹桥横跨汴河，桥上人群俯看河里的船只。">
          </a>
          <figcaption>北宋 · 故宫博物院藏 · <a href="${qingmingMuseumPage}" target="_blank" rel="noopener noreferrer">馆藏说明</a> · <a href="${qingmingBridgeSource}" target="_blank" rel="noopener noreferrer">图像来源</a></figcaption>
        </figure>
        <figure>
          <h4>《虹桥春市》 · AI 再创作</h4>
          <a href="${springMarket}" target="_blank" rel="noopener" aria-label="打开大图查看虹桥春市">
            <img src="${springMarket}" width="2172" height="724" loading="lazy" decoding="async"
              alt="《虹桥春市》生成效果图。横幅中央是木拱桥和货船，左侧是街市，右侧是柳岸和码头。">
          </a>
          <figcaption>从柳岸出发，沿着货船和桥上的人群走到街市。点击图片可以看大图。</figcaption>
        </figure>
      </div>
      <details class="font-workshop__comparison">
        <summary>展开《清明上河图》原作全卷</summary>
        <figure>
          <p>从右端郊野开始，向左横向浏览，经过汴河、虹桥和城内街市。</p>
          <div class="font-workshop__qingming-scroll" dir="rtl" tabindex="0" role="region" aria-label="《清明上河图》全卷，可横向滚动">
            <img src="${qingmingScroll}" width="1920" height="90" loading="lazy" decoding="async"
              alt="张择端《清明上河图》全卷预览。右端是郊野，中段是汴河和虹桥，左端是城门和街市。">
          </div>
          <figcaption><a href="${qingmingMuseumPage}" target="_blank" rel="noopener noreferrer">在故宫名画记查看细节</a> · <a href="${qingmingScrollSource}" target="_blank" rel="noopener noreferrer">全卷图像来源</a></figcaption>
        </figure>
      </details>
      <section class="font-workshop__comparison" aria-labelledby="workshop-huangpu">
        <h4 id="workshop-huangpu" tabindex="-1">《黄浦江春景》 · 现代城市长卷</h4>
        <p>沿用细墨线、绢本淡彩和沿河展开的叙事，画今天的上海。外滩和陆家嘴隔江相望，渡轮、码头和沿江行人把两岸的生活连起来。</p>
        <figure>
          <a href="${huangpuSpring}" target="_blank" rel="noopener" aria-label="打开《黄浦江春景》高清长卷">
            <img src="${huangpuSpring}" width="2172" height="724" loading="lazy" decoding="async"
              alt="绢本淡彩风格的上海长卷。左侧是外滩历史建筑与步道，中间是黄浦江和渡轮，右侧是陆家嘴高楼。">
          </a>
          <figcaption>AI 再创作 · 两岸按真实地理安排，楼群间距和视角按长卷构图调整 · <a href="${huangpuSource}" target="_blank" rel="noopener noreferrer">上海地理资料</a></figcaption>
        </figure>
      </section>
    </section>
  `

  bindBalconyStudy(root)
  const studyButtons = [...root.querySelectorAll('[data-art-step]')]
  const studyMarks = [...root.querySelectorAll('[data-art-mark]')]
  const studyExercises = [...root.querySelectorAll('[data-art-exercise]')]
  const markButton = root.querySelector('[data-art-marks]')
  let activeStudy = 0

  function updateStudy() {
    const showMarks = markButton.getAttribute('aria-pressed') === 'true'
    studyButtons.forEach((button, i) => {
      button.setAttribute('aria-pressed', i === activeStudy)
      studyExercises[i].hidden = i !== activeStudy
      studyMarks[i].toggleAttribute('hidden', !showMarks || i !== activeStudy)
    })
  }

  root.querySelectorAll('[data-workshop-jump]').forEach(button => button.addEventListener('click', () => {
    const heading = root.querySelector(`#${button.dataset.workshopJump}`)
    heading.focus({ preventScroll: true })
    heading.scrollIntoView({ block: 'start' })
  }))
  studyButtons.forEach((button, i) => button.addEventListener('click', () => {
    activeStudy = i
    updateStudy()
  }))
  markButton.addEventListener('click', () => {
    markButton.setAttribute('aria-pressed', markButton.getAttribute('aria-pressed') !== 'true')
    updateStudy()
  })

  const custom = new Map()
  const letterPicker = root.querySelector('select')
  const canvas = root.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  const preview = root.querySelector('textarea')
  const status = root.querySelector('[data-status]')
  const apply = root.querySelector('[data-apply]')
  const download = root.querySelector('[data-download]')
  let strokes = exampleStrokes(letterPicker.value)
  let activeStroke
  let pointerId
  let fontBytes
  let previewFont
  let revision = 0
  let disposed = false

  ctx.scale(3, 3)

  function draw() {
    ctx.clearRect(0, 0, 100, 100)
    ctx.strokeStyle = '#9da6ba'
    ctx.lineWidth = 0.45
    ctx.setLineDash([1.5, 1.5])
    for (const y of [22, baseline]) {
      ctx.beginPath()
      ctx.moveTo(5, y)
      ctx.lineTo(95, y)
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.strokeStyle = '#173b66'
    ctx.fillStyle = ctx.strokeStyle
    ctx.lineWidth = penWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const stroke of strokes) {
      ctx.beginPath()
      if (stroke.length === 1) {
        ctx.arc(...stroke[0], penWidth / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.moveTo(...stroke[0])
        for (const point of stroke.slice(1)) ctx.lineTo(...point)
        ctx.stroke()
      }
    }
    apply.disabled = strokes.length === 0 || pointerId !== undefined
  }

  async function updateFont() {
    const current = ++revision
    download.disabled = true
    try {
      const bytes = buildWorkshopFont(custom).toArrayBuffer()
      const face = await new FontFace('Workshop Hand', bytes).load()
      if (disposed || current !== revision) return
      if (previewFont) document.fonts.delete(previewFont)
      document.fonts.add(face)
      previewFont = face
      fontBytes = bytes
      preview.style.fontFamily = '"Workshop Hand", monospace'
      status.textContent = custom.size ? `已替换 ${custom.size} / 26 个字母。字体可以下载。` : '示例字体已就绪。可以改字母，也可以直接下载。'
      download.disabled = false
    } catch {
      if (disposed || current !== revision) return
      status.textContent = '字体生成失败，请恢复当前字母后再试。'
    }
  }

  function position(event) {
    const rect = canvas.getBoundingClientRect()
    const clamp = value => Math.max(3, Math.min(97, value))
    return [clamp((event.clientX - rect.left) * 100 / rect.width), clamp((event.clientY - rect.top) * 100 / rect.height)]
  }

  canvas.addEventListener('pointerdown', event => {
    if (pointerId !== undefined || event.button !== 0 || strokes.length >= 40) return
    pointerId = event.pointerId
    canvas.setPointerCapture(pointerId)
    activeStroke = [position(event)]
    strokes.push(activeStroke)
    draw()
  })
  canvas.addEventListener('pointermove', event => {
    if (pointerId !== event.pointerId || activeStroke.length >= 400) return
    const point = position(event)
    const [x, y] = activeStroke.at(-1)
    if (Math.hypot(point[0] - x, point[1] - y) < 0.7) return
    activeStroke.push(point)
    draw()
  })
  canvas.addEventListener('lostpointercapture', event => {
    if (pointerId !== event.pointerId) return
    pointerId = undefined
    activeStroke = undefined
    draw()
  })

  letterPicker.addEventListener('change', () => {
    strokes = custom.get(letterPicker.value)?.map(stroke => [...stroke]) ?? exampleStrokes(letterPicker.value)
    draw()
  })
  root.querySelector('[data-clear]').addEventListener('click', () => {
    strokes = []
    draw()
  })
  root.querySelector('[data-example]').addEventListener('click', () => {
    custom.delete(letterPicker.value)
    strokes = exampleStrokes(letterPicker.value)
    draw()
    updateFont()
  })
  apply.addEventListener('click', () => {
    custom.set(letterPicker.value, strokes.map(stroke => [...stroke]))
    updateFont()
  })
  preview.addEventListener('input', () => {
    const text = preview.value.toUpperCase().replace(/[^A-Z \n]/g, '')
    if (text !== preview.value) preview.value = text
  })
  download.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([fontBytes], { type: 'font/otf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'Notebook-Hand-Lab.otf'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  })

  draw()
  updateFont()
  return () => {
    disposed = true
    if (previewFont) document.fonts.delete(previewFont)
  }
}
