import './font.css';

const specimen = 'Hello, I’m Harshpreet.\nFrom notebook to typeface →\nHello, hello!';

export function mountFont(root) {
  root.innerHTML = `
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
    </section>`;

  const sample = root.querySelector('textarea');
  const size = root.querySelector('input[type="range"]');
  const sizeLabel = root.querySelector('output');
  const weightButtons = root.querySelectorAll('[data-weight]');
  const alternates = root.querySelector('[data-alternates]');
  const plainR = root.querySelector('[data-plain-r]');
  sample.value = specimen;

  function updateFeatures() {
    sample.style.fontFeatureSettings = `"calt" ${Number(alternates.checked)}, "ss01" ${Number(plainR.checked)}, "kern" 1`;
  }

  size.addEventListener('input', () => {
    sample.style.setProperty('--hand-size', `${size.value}px`);
    sizeLabel.value = `${size.value} px`;
  });

  weightButtons.forEach((button) => {
    button.addEventListener('click', () => {
      weightButtons.forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
      sample.style.fontWeight = button.dataset.weight;
    });
  });

  alternates.addEventListener('change', updateFeatures);
  plainR.addEventListener('change', updateFeatures);
  root.querySelector('[data-reset]').addEventListener('click', () => {
    sample.value = specimen;
    sample.focus();
    sample.setSelectionRange(0, 0);
  });
}
