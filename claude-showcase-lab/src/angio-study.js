import './angio-study.css';

export function createAngioStudy() {
  const study = document.createElement('details');
  study.className = 'lab-angio-study';
  study.innerHTML = `
    <summary>第一课 · 同一段血管，为什么看起来更短？</summary>
    <div class="lab-angio-study-body">
      <p>打开 <a href="#angio">AngioView 原版展台</a>练习。让左冠系统 <strong>Left</strong> 保持选中，在二维造影视图打开 <strong>Labels</strong>，并在三维心脏打开 <strong>Foreshort.</strong>（投影缩短着色）。</p>
      <ol>
        <li>选 <strong>RAO caudal</strong>（RAO 30° / CAU 30°），找到标为 <strong>pLAD</strong> 的前降支近段。</li>
        <li>切换到 <strong>Spider</strong>（LAO 45° / CAU 35°），再找一次 pLAD。对照它在二维图上的走向，以及三维图里表示投影缩短的颜色。</li>
      </ol>
      <form>
        <fieldset>
          <legend>如果同一段 pLAD 在二维画面里更短，换角度本身能解释这个变化吗？</legend>
          <label><input type="radio" name="projection" value="yes" required> 能。越接近顺着血管看，它在平面上的投影越短。</label>
          <label><input type="radio" name="projection" value="no"> 不能。画面里的长度只由三维模型里的血管长度决定。</label>
        </fieldset>
        <button type="submit">检查理解</button>
        <p data-angio-feedback role="status" hidden></p>
      </form>
      <p class="lab-angio-study-note">本练习使用同一个教学模型比较投影。角度改变的是观察方向。</p>
    </div>`;
  const form = study.querySelector('form');
  const feedback = study.querySelector('[data-angio-feedback]');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const answer = new FormData(form).get('projection');
    feedback.textContent = answer === 'yes'
      ? '对。就像从正上方看一支平放的笔，能看到它的长度。视线慢慢转到笔尖方向，笔在画面里就会缩短。'
      : '再看看三维图里那段血管的走向。视线越贴近它的轴向，它在二维画面里的投影越短。';
    feedback.hidden = false;
  });
  form.addEventListener('change', () => { feedback.hidden = true; });
  return study;
}

const directions = [
  {
    title: '医学影像练习库',
    audience: '医学生、住院医师和带教老师',
    detail: '把同一病例的不同角度或 CT 切片编成练习。学生先标记结构，再看教师标注与三维回放。第三课演示了三视角识别流程，病例库可以使用有教学使用许可的去标识影像。',
    label: '公开医学影像库 TCIA',
    url: 'https://www.cancerimagingarchive.net/about-the-cancer-imaging-archive-tcia/',
  },
  {
    title: '操作模拟训练',
    audience: '住院医师、技能培训中心',
    detail: '在虚拟人体上移动超声探头，对照探头方向和屏幕切面。老师可以设定目标切面，学员可以反复练习并回看操作。',
    label: '医学模拟训练研究',
    url: 'https://pubmed.ncbi.nlm.nih.gov/12368674/',
  },
  {
    title: '检查前讲解',
    audience: '患者、家属和医护',
    detail: '用几步动画展示导管如何到达检查部位、拍摄设备怎样转动，以及屏幕上显示的是什么。方便医护现场讲解，患者也能回看。',
    label: '放射学会患者资料',
    url: 'https://www.radiologyinfo.org/en/info/angiocath',
  },
  {
    title: '术前讨论',
    audience: '临床团队',
    detail: '用患者影像重建血管和邻近器官，供团队共同标记、测量和讨论路径。进入临床工作流前，由临床团队验证模型和测量的准确性。',
    label: 'SlicerHeart',
    url: 'https://slicerheart.org/',
  },
  {
    title: '出院随访与康复',
    audience: '患者、康复团队',
    detail: '把医护制定的康复计划拆成每天能查看和记录的任务。复诊时对照完成情况和遇到的困难，便于医患一起调整计划。',
    label: '居家心脏康复科学声明',
    url: 'https://www.jacc.org/doi/10.1016/j.jacc.2019.03.008',
  },
];

export function createAngioDirections() {
  const section = document.createElement('section');
  section.className = 'lab-future lab-angio-directions';
  section.id = 'lab-angio-directions';
  section.tabIndex = -1;
  section.setAttribute('aria-labelledby', 'lab-angio-directions-title');
  section.innerHTML = `
    <div class="lab-future-heading">
      <h4 id="lab-angio-directions-title">医学产品扩展方向</h4>
    </div>
    <dl>
      ${directions.map(({ title, audience, detail, label, url }) => `
        <div>
          <dt>${title}</dt>
          <dd><p class="lab-angio-audience">${audience}</p>
            <p>${detail}</p>
            <a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>
          </dd>
        </div>`).join('')}
    </dl>`;
  return section;
}
