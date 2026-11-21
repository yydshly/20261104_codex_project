const c=`Hello, I’m Harshpreet.
From notebook to typeface →
Hello, hello!`;function h(e){e.innerHTML=`
    <section class="hand-lab" aria-label="Harshpreet Hand 字体实验">
      <header class="hand-lab__heading">
        <div>
          <span class="hand-lab__kicker">TYPE SPECIMEN / 03</span>
          <h3>Harshpreet Hand</h3>
          <p>从 120 页笔记提取笔迹，试试同一个字母在不同位置的变化。</p>
        </div>
        <span class="hand-lab__stamp" aria-hidden="true">Aa</span>
      </header>

      <div class="hand-lab__controls">
        <label class="hand-lab__size">
          字号 <input type="range" min="24" max="76" value="46" aria-label="字号">
          <output>46 px</output>
        </label>
        <div class="hand-lab__weight" role="group" aria-label="字重">
          <button type="button" aria-pressed="true" data-weight="400">常规</button>
          <button type="button" aria-pressed="false" data-weight="700">粗体</button>
        </div>
        <label class="hand-lab__toggle"><input type="checkbox" data-alternates checked> 轮换字形</label>
        <label class="hand-lab__toggle"><input type="checkbox" data-plain-r> 简体 r</label>
      </div>

      <div class="hand-lab__sheet">
        <label class="hand-lab__sheet-caption" for="hand-lab-typing">可编辑样张 <span>输入英文字母试试</span></label>
        <textarea id="hand-lab-typing" rows="4" maxlength="600" spellcheck="false" lang="en"></textarea>
      </div>
      <div class="hand-lab__footer">
        <span>Harshpreet Singh · SIL Open Font License 1.1</span>
        <button type="button" data-reset>恢复示例</button>
      </div>
    </section>`;const a=e.querySelector("textarea"),t=e.querySelector('input[type="range"]'),p=e.querySelector("output"),l=e.querySelectorAll("[data-weight]"),s=e.querySelector("[data-alternates]"),r=e.querySelector("[data-plain-r]");a.value=c;function i(){a.style.fontFeatureSettings=`"calt" ${Number(s.checked)}, "ss01" ${Number(r.checked)}, "kern" 1`}t.addEventListener("input",()=>{a.style.setProperty("--hand-size",`${t.value}px`),p.value=`${t.value} px`}),l.forEach(n=>{n.addEventListener("click",()=>{l.forEach(d=>d.setAttribute("aria-pressed",String(d===n))),a.style.fontWeight=n.dataset.weight})}),s.addEventListener("change",i),r.addEventListener("change",i),e.querySelector("[data-reset]").addEventListener("click",()=>{a.value=c,a.focus(),a.setSelectionRange(0,0)})}export{h as mountFont};
