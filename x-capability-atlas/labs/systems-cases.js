(() => {
  const scenes = {
    '11': {
      title: '课程摘要审批',
      intro: '提交课程摘要和修改理由，对照修订前后内容，审批后下载完整记录。',
      deliverable: '课程版本、审批记录 · JSON',
      principle: 'OpenMausBot 可以把身份、工具和运行环境绑定到角色，并在关键操作前请求审批。身份和能力的分配是两个独立设置。',
      adaptation: '浏览器模拟角色规则，并保存每次提交时的原稿与新稿。批准才更新版本，拒绝和撤回也会进入本页的审批记录。',
      links: [['OpenMausBot 项目', 'https://github.com/milind-soni/OpenMausBot']],
      mount: permissions,
    },
    '12': {
      title: '图鉴案例交接',
      intro: '用同一份协议审阅图鉴案例或自己的材料，核对原文与引用，再交付带出处的报告。',
      deliverable: '角色协议、验收报告 · JSON',
      principle: 'Grok Bot 的官方模板可复用指令、相关记忆、技能和插件。Foreman 的社区实现展示了另一层机制，即派发任务后收集证据并按可验收条件结束。',
      adaptation: '本站以 JSON 保存角色和交接协议。采集记录所填地址和摘录，分析整理用途和引文，复核检查引文能否在当前摘录中找到。',
      links: [['Grok Bot 官方模板指南', 'https://x.ai/bot/guides/templates-for-grok-bot'], ['Foreman 社区实现', 'https://github.com/Archive228/foreman']],
      mount: dispatch,
    },
    '13': {
      title: '图鉴知识库',
      intro: '把引文核查报告整理成带出处的笔记，保存后可刷新、重开页面或在另一窗口回查。',
      deliverable: '笔记、目录 · Markdown / 共享索引 · JSON',
      principle: '这四个仓库各自解决不同层的问题。Obsidian Skills 描述格式与 CLI。Claude Obsidian 组织导入、Wiki 和查询。Obsidian Second Brain 侧重共享记录。Second Brain Starter 把需求访谈变成计划。',
      adaptation: '索引写入当前浏览器的 IndexedDB，多个同源窗口共享已保存的记录。下载的 JSON 也可在其他浏览器导入，Markdown 目录用双链指向各条笔记。',
      links: [['Obsidian Skills', 'https://github.com/kepano/obsidian-skills'], ['Claude Obsidian', 'https://github.com/AgriciDaniel/claude-obsidian'], ['Obsidian Second Brain', 'https://github.com/eugeniughelbur/obsidian-second-brain'], ['Second Brain Starter', 'https://github.com/coleam00/second-brain-starter']],
      mount: knowledge,
    },
    '14': {
      title: '原文与引文核查',
      intro: '导入第 12 条的验收报告，或提供自己的原文，定位引用的行号与上下文，再登记原文是否支持结论。',
      deliverable: '引文核查与带行号摘录 · Markdown / JSON',
      principle: '作者的工作流把原始资料、综合 Wiki 和交付输出分层，并保存来源路径。脚本用原文匹配检出凭空写入的引文。',
      adaptation: '工作台归一化空白与 Unicode，在提供的文本中匹配连续字串，并记录匹配所在的行。结论支持度单独由使用者登记。',
      links: [['作者的搭建长文', 'https://x.com/danikkk_wqs/status/2113001913662734619']],
      mount: citations,
    },
    '15': {
      title: '剪辑排期风险',
      intro: '填写粗剪、配画与复核的预计工时，固定一轮基准。也可导入之前的排期报告，复算同一批轨迹和对照结果。',
      deliverable: '240 次轨迹与工时对照 · CSV / JSON',
      principle: '作者展示了相同初始状态下的多次随机仿真，并比较分叉及不同结局。平均曲线会压平少数轨迹的变化。',
      adaptation: '本地模型把每次运行拆成三个审核阶段，每阶段按设定概率返工。使用固定伪随机种子，方便逐项比较同一批随机样本。所有时间和概率都来自这里的示意规则。',
      links: [['作者的仿真说明', 'https://x.com/0xCodio/status/2118290123255349265']],
      mount: simulation,
    },
  };

  const atlasDrafts = {
    galaxy: { title: '银河旋臂与镜头', source: 'https://x.com/0xAIlabs/status/2118379258607251490', excerpt: 'Lyren 公开了四条对数旋臂、分层粒子和镜头路线的制作提示词。', value: '分开控制结构参数和镜头路线，验证哪一种改变了画面。' },
    lesson: { title: 'Papermorph 互动课', source: 'https://github.com/DozenTwelve/Papermorph', excerpt: '第 12 章的案例将平面方程、立体图与可操作的练习排在同一个课程内。', value: '把可操作的验证安排进讲解，不必让读者跳到其他页面。' },
    collage: { title: '口播的拼贴配画', source: 'https://github.com/pyang5166/gbro-collage-broll', excerpt: '旧版公开 Skill 用同底色的空场首帧和确认后的拼贴尾帧约束生成。', value: '把同一句话的两种入场顺序放在同一时间点比较。' },
  };

  const $ = id => document.getElementById(id);
  const lineRange = ({ startLine, endLine }) => `第 ${startLine === endLine ? startLine : `${startLine}–${endLine}`} 行`;
  const key = new URLSearchParams(location.search).get('case');
  const caseNumber = Object.hasOwn(scenes, key) ? key : '12';
  const scene = scenes[caseNumber];
  $('back').href = `../#case-${caseNumber}`;
  $('kicker').textContent = `${caseNumber} / 图鉴工作系统`;
  $('title').textContent = scene.title;
  $('intro').textContent = scene.intro;
  $('deliverable').textContent = scene.deliverable;
  $('principle').textContent = scene.principle;
  $('adaptation').textContent = scene.adaptation;
  for (const [label, href] of scene.links) {
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${label} ↗`;
    $('source-links').append(link);
  }
  document.title = `${scene.title} · 能力图鉴`;
  scene.mount();
  if (caseNumber === '13') $('data-location').textContent = '当前浏览器持久保存';

  function workbench(left, right) {
    $('experiment').innerHTML = `<div class="workbench"><section class="panel input-panel"><p class="panel-kicker">01 / 操作</p>${left}</section><section class="panel output-panel"><p class="panel-kicker">02 / 结果与交付</p>${right}</section></div>`;
  }

  function status(id, message, kind = '') {
    $(id).textContent = message;
    $(id).dataset.kind = kind;
  }

  function log(id, message, kind = '') {
    const row = document.createElement('li');
    row.dataset.kind = kind;
    row.textContent = message;
    $(id).append(row);
  }

  function topicOptions() {
    return Object.entries(atlasDrafts).map(([id, draft]) => `<option value="${id}">${draft.title}</option>`).join('');
  }

  function setDownload(id, data, filename) {
    const link = $(id);
    const oldUrl = link.getAttribute('href');
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    if (data === undefined) {
      link.removeAttribute('href');
      link.hidden = true;
      return;
    }
    const markdown = typeof data === 'string';
    const body = markdown ? data : JSON.stringify(data, null, 2);
    const type = markdown ? 'text/markdown;charset=utf-8' : 'application/json';
    const file = new Blob([body + '\n'], { type });
    if (filename) link.download = filename;
    link.href = URL.createObjectURL(file);
    link.hidden = false;
  }

  function permissions() {
    workbench(`
      <h2>提交摘要修订</h2>
      <label>工作角色<select id="role"><option value="visitor">学习者</option><option value="reviewer">资料核对员</option><option value="editor">图鉴维护者</option></select></label>
      <p class="info-strip" id="role-scope" aria-live="polite"></p>
      <label>拟发布的课程摘要<textarea id="proposed" rows="4" maxlength="1500">先预测相加结果，再用通道值验证判断。</textarea></label>
      <label>修改理由<input id="revision-reason" type="text" maxlength="300" placeholder="例如补上课程练习目标"></label>
      <div class="controls"><button id="read">读取审核便笺</button><button id="request" class="primary">申请更新课程摘要</button></div>
      <section class="subsection" id="approval" hidden><h3>待审批摘要</h3>
        <div class="revision-compare"><div><h4 id="pending-base"></h4><p id="pending-before"></p></div><div><h4>拟发布</h4><p id="pending-summary"></p></div></div>
        <label>审批意见<input id="revision-decision" type="text" maxlength="300" placeholder="例如保留预测与验证两个动作"></label><div class="controls"><button id="allow" class="primary">批准并写入</button><button id="deny">拒绝</button></div>
      </section>
      <p class="hint">本页模拟角色和审批。下载的记录可交接给同事复核。</p>`, `
      <h2>已发布的课程摘要</h2><div class="result-card"><p class="status" id="revision"></p><h3>同一像素，三束光</h3><p class="published-copy" id="published"></p></div>
      <section class="subsection" id="review-memo" hidden><h3>审核便笺</h3><p>任务需同时保留预测和验证结果。</p></section>
      <section class="subsection"><h3>审批记录</h3><p class="hint" id="audit-empty">尚无修订操作。试着以学习者身份提交，再切换到维护者。</p><ol class="rows" id="permission-log" aria-live="polite"></ol></section>
      <div class="download-area"><p class="hint" id="revision-export-state"></p><a id="download-revision" class="file-download" download="atlas-course-revision.json" hidden>下载已发布版本 · JSON ↓</a><a id="download-approval-log" class="file-download" download="atlas-approval-log.json" hidden>下载审批记录 · JSON ↓</a></div>`);
    const rules = { visitor: [], reviewer: ['read'], editor: ['read', 'write'] };
    const roleScopes = { visitor: '学习者 · 可读公开摘要', reviewer: '资料核对员 · 可读公开摘要和审核便笺', editor: '图鉴维护者 · 可查看便笺、提交及批准修订' };
    const asset = '同一像素，三束光 · 课程摘要';
    const trail = [];
    let record = { asset, revision: 1, summary: '拖动光强，观察取样点的 RGB 数值。' };
    let pending;
    const can = action => rules[$('role').value].includes(action);
    function renderDownloads() {
      const exportable = can('write') && record.approval;
      $('revision-export-state').textContent = exportable ? `版本 ${record.revision} 已归档为可下载的修订记录。` : '维护者批准修订后，可下载版本记录。';
      setDownload('download-revision', exportable ? record : undefined);
      setDownload('download-approval-log', can('write') && trail.length ? { version: 1, asset, current: record, decisions: trail } : undefined);
    }
    function renderRecord() {
      $('role-scope').textContent = roleScopes[$('role').value];
      $('revision').textContent = `已发布 · 版本 ${record.revision}`;
      $('published').textContent = record.summary;
      renderDownloads();
    }
    function audit(message, kind) {
      $('audit-empty').hidden = true;
      log('permission-log', message, kind);
    }
    function closeApproval() {
      pending = undefined;
      $('approval').hidden = true;
      $('proposed').disabled = $('revision-reason').disabled = $('request').disabled = false;
      $('revision-decision').value = '';
    }
    function decide(decision, comment = '') {
      const entry = { ...pending, decision, comment, decidedAt: new Date().toISOString() };
      trail.push(entry);
      closeApproval();
      return entry;
    }
    $('role').addEventListener('change', () => {
      if (pending) {
        decide('withdrawn', '切换角色');
        audit('切换角色，待审批的请求已撤回。', 'skip');
      }
      $('review-memo').hidden = true;
      renderRecord();
    });
    $('read').onclick = () => {
      const readable = can('read');
      $('review-memo').hidden = !readable;
      audit(readable ? '已打开审核便笺。' : '拒绝读取。此角色没有审核便笺权限。', readable ? 'success' : 'error');
    };
    $('request').onclick = () => {
      if (!can('write')) return audit('拒绝申请。此角色没有改稿权限。', 'error');
      const summary = $('proposed').value.trim();
      if (!summary) return audit('请先填写新摘要。', 'error');
      if (summary === record.summary) return audit('新摘要与当前版本相同。请修改后再提交。', 'skip');
      pending = { request: trail.length + 1, baseRevision: record.revision, before: record.summary, after: summary, reason: $('revision-reason').value.trim(), submittedAt: new Date().toISOString(), role: '图鉴维护者' };
      $('pending-base').textContent = `当前版本 ${pending.baseRevision}`;
      $('pending-before').textContent = pending.before;
      $('pending-summary').textContent = pending.after;
      $('approval').hidden = false;
      $('proposed').disabled = $('revision-reason').disabled = $('request').disabled = true;
      audit('请求已进入审批，摘要还处于原版本。');
    };
    $('allow').onclick = () => {
      if (!pending || !can('write')) return;
      const entry = decide('approved', $('revision-decision').value.trim());
      record = {
        asset,
        revision: record.revision + 1,
        previousRevision: record.revision,
        summary: entry.after,
        approval: { ...entry, action: '页面手动批准', status: 'published' },
        scope: '当前页面的模拟审批',
      };
      renderRecord();
      audit(`写入成功。当前为版本 ${record.revision}。`, 'success');
    };
    $('deny').onclick = () => {
      if (!pending || !can('write')) return;
      decide('rejected', $('revision-decision').value.trim());
      renderDownloads();
      audit('请求被拒绝。摘要维持原版本。', 'skip');
    };
    renderRecord();
  }

  function httpSource(value) {
    try {
      const url = new URL(value.trim());
      if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return url.href;
    } catch {
      // Incomplete or non-web addresses stay unlinked.
    }
    return '';
  }

  function dispatch() {
    workbench(`
      <h2>配置审阅任务</h2>
      <label>角色协议 · JSON<textarea class="template-input" id="template" rows="6" spellcheck="false"></textarea></label>
      <div class="controls"><button id="import-template">导入当前协议</button><button id="reset-template">恢复范例</button></div>
      <details class="inline-details"><summary>从本地导入协议</summary><label>选择 JSON 文件<input id="template-file" type="file" accept=".json,application/json"></label></details>
      <p id="import-state" class="status" aria-live="polite"></p>
      <label>材料<select id="topic">${topicOptions()}<option value="custom">提交自己的材料</option></select></label>
      <section class="subsection" id="dispatch-custom" hidden>
        <label>材料题名<input id="dispatch-title" type="text" maxlength="150"></label>
        <label>原始来源 URL<input id="dispatch-url" type="url" maxlength="2048" placeholder="https://"></label>
        <label>来源摘录<textarea id="dispatch-excerpt" rows="5" maxlength="20000" placeholder="粘贴原文，保留引文所在的段落"></textarea></label>
        <label>稿件中的引文<textarea id="dispatch-quote" rows="2" maxlength="20000"></textarea></label>
        <label>用途或分析结论<textarea id="dispatch-value" rows="2" maxlength="1500"></textarea></label>
        <p class="hint">复核以粘贴的文本为准。报告会标明来源地址由提交者填写。</p>
      </section>
      <label class="check-row" id="bad-evidence-row"><input type="checkbox" id="bad-evidence"> 用错误引文检查拦截</label>
      <div class="controls"><button id="dispatch" class="primary" disabled>执行审阅任务</button></div>`, `
      <h2>审阅与验收</h2><p id="dispatch-state" class="status" aria-live="polite">等待导入模板</p>
      <ol class="stage-track" id="dispatch-track"><li><span>01</span>采集来源</li><li><span>02</span>分析用途</li><li><span>03</span>复核引文</li></ol>
      <p class="empty-card" id="dispatch-empty">先导入左侧的协议，再运行任务。这里会列出每个角色提交的证据及复核结论。</p>
      <ol class="rows" id="dispatch-log"></ol><pre class="artifact" id="delivery" hidden></pre>
      <div class="download-area"><p class="hint">报告记录提交的材料、引文匹配结果和复核范围。下载后可载入<a href="../#explore-14" target="_top">第 14 条 · 引文核验 ↗</a>。</p><div class="controls"><a id="dispatch-source" class="source-link" target="_blank" rel="noopener noreferrer" hidden>本次任务原始资料 ↗</a>
      <a class="file-download" id="download-template" download="atlas-review-template.json" hidden>下载协议 · JSON ↓</a>
      <a class="file-download" id="download-report" download="atlas-evidence-report.json" hidden>下载验收报告 · JSON ↓</a></div></div>`);
    const example = {
      name: '图鉴案例审阅', version: 1,
      stages: [
        { role: '采集员', task: 'collect' },
        { role: '分析员', task: 'analyze' },
        { role: '复核员', task: 'verify' },
      ],
    };
    let template;
    let editorVersion = 0;

    function clearDelivery(message) {
      $('dispatch-log').replaceChildren();
      $('dispatch-empty').hidden = false;
      for (const stage of $('dispatch-track').children) stage.dataset.kind = '';
      $('delivery').hidden = true;
      $('dispatch-source').hidden = true;
      setDownload('download-report');
      status('dispatch-state', message);
    }

    function invalidateTemplate() {
      editorVersion++;
      template = undefined;
      $('dispatch').disabled = true;
      setDownload('download-template');
      clearDelivery('等待导入模板');
    }

    function restore() {
      $('template').value = JSON.stringify(example, null, 2);
      $('template').dispatchEvent(new Event('input'));
    }
    $('template').addEventListener('input', () => {
      invalidateTemplate();
      status('import-state', '请导入当前协议。');
    });
    $('reset-template').onclick = restore;
    function importTemplate() {
      invalidateTemplate();
      try {
        const parsed = JSON.parse($('template').value);
        if (!parsed || parsed.version !== 1 || typeof parsed.name !== 'string' || !parsed.name.trim() || !Array.isArray(parsed.stages)) throw Error('协议须包含名称、版本 1 和 stages。');
        if (parsed.stages.some(stage => typeof stage?.role !== 'string' || !stage.role.trim())) throw Error('每个环节都需要角色名。');
        if (new Set(parsed.stages.map(stage => stage.role.trim())).size !== parsed.stages.length) throw Error('采集、分析、复核须使用三个不同角色。');
        const expected = ['collect', 'analyze', 'verify'];
        if (parsed.stages.length !== expected.length || parsed.stages.some((stage, index) => stage.task !== expected[index])) throw Error('交接顺序须是 collect、analyze、verify。');
        template = {
          name: parsed.name.trim(), version: parsed.version,
          stages: parsed.stages.map(stage => ({ role: stage.role.trim(), task: stage.task })),
        };
        $('dispatch').disabled = false;
        setDownload('download-template', template);
        status('dispatch-state', '请选择案例，再执行模板。');
        status('import-state', `已导入「${template.name}」，角色 ${template.stages.length} 个。`, 'success');
      } catch (error) {
        status('import-state', error instanceof SyntaxError ? 'JSON 无法解析，请检查括号和逗号。' : error.message, 'error');
      }
    }
    $('import-template').onclick = importTemplate;
    $('template-file').addEventListener('change', async event => {
      const input = event.currentTarget;
      const file = input.files[0];
      input.value = '';
      if (!file) return;
      invalidateTemplate();
      const version = editorVersion;
      if (file.size > 128 * 1024) return status('import-state', '模板文件须小于或等于 128 KB。', 'error');
      status('import-state', '正在读取模板文件。');
      try {
        const text = await file.text();
        if (version !== editorVersion) return;
        $('template').value = text.replace(/^\uFEFF/, '');
        importTemplate();
      } catch {
        if (version === editorVersion) status('import-state', '无法读取这个模板文件。', 'error');
      }
    });
    for (const id of ['topic', 'bad-evidence', 'dispatch-title', 'dispatch-url', 'dispatch-excerpt', 'dispatch-quote', 'dispatch-value']) {
      $(id).addEventListener('input', () => {
        const custom = $('topic').value === 'custom';
        $('dispatch-custom').hidden = !custom;
        $('bad-evidence-row').hidden = custom;
        clearDelivery(template ? '任务条件已改变，请重新执行。' : '等待导入模板');
      });
    }
    $('dispatch').onclick = () => {
      if (!template) return;
      const topic = $('topic').value;
      const custom = topic === 'custom';
      const draft = custom ? {
        title: $('dispatch-title').value.trim(),
        source: httpSource($('dispatch-url').value),
        excerpt: $('dispatch-excerpt').value.trim(),
        quote: $('dispatch-quote').value.trim(),
        value: $('dispatch-value').value.trim(),
      } : atlasDrafts[topic];
      if (!draft || Object.values(draft).some(value => !value)) {
        const message = '请填写题名、有效的网页地址、来源摘录、引文和用途。';
        clearDelivery(message);
        status('dispatch-state', message, 'error');
        return;
      }
      const [collect, analyze, verify] = template.stages;
      clearDelivery('正在核对本地证据。');
      $('dispatch-empty').hidden = true;
      const [collectStage, analyzeStage, verifyStage] = $('dispatch-track').children;
      const collected = { title: draft.title, source: draft.source, excerpt: draft.excerpt };
      $('dispatch-source').href = collected.source;
      $('dispatch-source').hidden = false;
      log('dispatch-log', `${collect.role}提交了《${collected.title}》的来源地址与 ${collected.excerpt.length} 字摘录。`, 'success');
      const quote = custom ? draft.quote : $('bad-evidence').checked ? '这是已在真实生产中验证的最优方案。' : collected.excerpt;
      const analysis = { ...collected, quote, value: draft.value };
      log('dispatch-log', `${analyze.role}登记了用途与 ${analysis.quote.length} 字引文。`);
      const normalize = value => value.normalize('NFKC').replace(/\s+/g, ' ').trim();
      const normalizedQuote = normalize(analysis.quote);
      const passed = Boolean(normalizedQuote) && normalize(collected.excerpt).includes(normalizedQuote);
      collectStage.dataset.kind = analyzeStage.dataset.kind = 'success';
      verifyStage.dataset.kind = passed ? 'success' : 'error';
      if (!passed) {
        log('dispatch-log', `${verify.role}发现引文不在本地来源摘录里，驳回稿件。`, 'error');
        status('dispatch-state', '2 个环节完成 · 1 项证据校验失败 · 0 份交付', 'error');
        return;
      }
      log('dispatch-log', `${verify.role}在已提交的摘录中定位到引文，来源地址随报告登记。`, 'success');
      $('delivery').textContent = `交付稿 · ${analysis.title}\n适用方向 · ${analysis.value}\n证据 · ${analysis.quote}\n来源 · ${analysis.source}`;
      $('delivery').hidden = false;
      setDownload('download-report', {
        version: 1, template,
        delivery: { topic, title: analysis.title, use: analysis.value },
        evidence: { source: analysis.source, sourceKind: custom ? '用户填写的地址' : '图鉴来源', localExcerpt: draft.excerpt, checkedQuote: analysis.quote },
        verification: { reviewer: verify.role, sourceMatch: custom ? null : true, quoteMatch: true, scope: '在所提交的摘录中定位引文，并登记来源地址。' },
      });
      status('dispatch-state', '3 个环节完成 · 证据校验通过 · 1 份交付', 'success');
    };
    restore();
  }

  function knowledge() {
    workbench(`
      <h2>整理与回查</h2>
      <details class="inline-details"><summary>导入核查报告或恢复索引</summary>
        <label>第 14 条的核查报告 JSON<input id="wiki-citation-file" type="file" accept=".json,application/json"></label>
        <p class="hint">导入会填入当前笔记草稿。检查摘录和复核记录后，再写入共享索引。</p>
        <label>本工作台导出的索引 JSON<input id="wiki-index-file" type="file" accept=".json,application/json"></label>
        <p class="hint">索引文件只在本页读取，恢复时保留现有笔记。</p>
        <p class="status" id="wiki-file-state" role="status"></p>
      </details>
      <label>笔记来源<select id="wiki-topic">${topicOptions()}<option value="custom">撰写自己的笔记</option></select></label>
      <p class="hint" id="wiki-topic-use"></p>
      <section class="subsection" id="wiki-custom" hidden>
        <label>笔记题名<input id="wiki-title" type="text" maxlength="300"></label>
        <label>原始来源 URL（选填）<input id="wiki-source" type="url" maxlength="8192" placeholder="https://"></label>
        <label>原文摘录或观察记录<textarea id="wiki-excerpt" rows="5" maxlength="20000"></textarea></label>
        <label>选择理由（选填）<textarea id="wiki-value" rows="2" maxlength="1500"></textarea></label>
        <p class="hint wiki-review" id="wiki-review" hidden></p>
      </section>
      <div class="controls"><button id="format">预览 Markdown</button><button id="ingest" class="primary">写入共享索引</button></div>
      <section class="subsection"><h3>验证跨会话回查</h3>
      <label>当前会话<select id="context"><option>会话 A</option><option>会话 B</option></select></label>
      <label>题名、正文、来源或核查备注<input id="wiki-query" type="search" value="旋臂"></label>
      <div class="controls"><button id="recall">检索索引</button><button id="plan">生成补齐清单</button></div></section>`, `
      <h2>Wiki 笔记与索引</h2><p id="wiki-state" class="status" aria-live="polite">当前索引为空。先预览笔记，或将选中案例写入索引。</p>
      <p class="empty-card" id="wiki-empty">笔记保留正文、来源和选择理由，并附有指向 Obsidian 目录的双链。</p><pre class="artifact" id="wiki-output" hidden></pre>
      <section class="subsection"><h3>共享索引 <span id="wiki-count" class="count">0</span></h3><p class="hint" id="wiki-storage-state" role="status">正在读取本地索引。</p><p id="wiki-index-empty" class="hint">写入后自动保存在当前浏览器。可下载 JSON 迁移到其他浏览器。</p><ul class="rows" id="wiki-log"></ul></section>
      <div class="download-area"><p class="hint">将笔记和目录文件放入同一个 Obsidian 库，即可通过双链打开笔记。可点选索引中的旧笔记重新下载。</p><div class="controls"><a id="download-note" class="file-download" hidden>下载当前 Markdown ↓</a><a id="download-wiki-toc" class="file-download" download="atlas-wiki-index.md" hidden>下载双链目录 · Markdown ↓</a><a id="download-index" class="file-download" download="atlas-wiki-index.json" hidden>下载共享索引 · JSON ↓</a></div></div>`);
    const shared = new Map();
    const maxNotes = 200;
    const maxEvidence = 20000;
    const maxSource = 8192;
    const reviewLabels = {
      'no-claim': '仅定位引文', supported: '支持结论', overreach: '结论超出原文', pending: '待人工复核',
    };
    let draftReview;
    let fileReadVersion = 0;
    let readingCitation = false;
    const noteFilename = id => `atlas-note-${id}.md`;
    const mdText = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replace(/[\\`*_{}\[\]()#+.!|~$]/g, '\\$&');
    const sourceLine = draft => {
      if (draft.source) return `[${draft.review ? '报告登记的来源' : '原始来源'}](<${draft.source}>)`;
      return `来源 · ${draft.review ? mdText(draft.review.sourceName) : '自记'}`;
    };
    function reviewMarkdown(review) {
      const fields = [`- 资料 · ${mdText(review.sourceName)}`, `- 原报告状态 · ${reviewLabels[review.status]}`, `- 匹配位置 · ${lineRange(review)}`, `- 拟引用 · ${mdText(review.quote)}`];
      if (review.sourcePath) fields.splice(1, 0, `- 本地资料 · ${mdText(review.sourcePath)}${review.recordId ? ` · ${mdText(review.recordId)}` : ''}`);
      if (review.claim) fields.push(`- 待复核结论 · ${mdText(review.claim)}`);
      if (review.note) fields.push(`- 处理备注 · ${mdText(review.note)}`);
      fields.push(`- 核查范围 · ${mdText(review.scope)}`);
      return ['## 第 14 条核查记录', '', ...fields].join('\n');
    }
    function asMarkdown(draft) {
      const excerpt = mdText(draft.excerpt).split(/\r?\n/).map(line => `> ${line}`).join('\n');
      return [`# ${mdText(draft.title)}`, '## 原文与观察', excerpt, draft.value && `## 选择理由\n\n${mdText(draft.value)}`, draft.review && reviewMarkdown(draft.review), sourceLine(draft), '关联 · [[atlas-wiki-index|图鉴 Wiki 目录]]'].filter(Boolean).join('\n\n');
    }
    const sameNote = (left, right) => left.title === right.title && left.source === right.source &&
      left.review?.quote === right.review?.quote && left.review?.claim === right.review?.claim &&
      left.review?.startLine === right.review?.startLine && left.review?.endLine === right.review?.endLine &&
      (!left.review || left.excerpt === right.excerpt);
    const wikiChanges = typeof BroadcastChannel === 'function' ? new BroadcastChannel('capability-atlas-wiki') : null;
    const wikiStorage = new Promise((resolve, reject) => {
      const request = indexedDB.open('capability-atlas-wiki', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('notes', { keyPath: 'topic' });
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(Error('另一个窗口正在更新索引，请关闭旧版窗口后重试。'));
    });
    function replaceShared(index) {
      shared.clear();
      for (const [topic, record] of index) shared.set(topic, record);
      renderWikiIndex();
    }
    async function reloadWikiStorage() {
      try {
        const database = await wikiStorage;
        const stored = await new Promise((resolve, reject) => {
          const request = database.transaction('notes').objectStore('notes').getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        replaceShared(parseWikiIndex({ version: 1, entries: stored }));
        status('wiki-storage-state', `已保存 ${shared.size} 条，可刷新或在另一窗口回查。`, 'success');
        if (shared.size && $('wiki-state').textContent.startsWith('当前索引为空')) {
          status('wiki-state', `已恢复 ${shared.size} 条笔记。可以直接检索。`, 'success');
        }
      } catch (error) {
        status('wiki-storage-state', `读取本地索引失败。可用 JSON 导入和导出。 ${error.message}`, 'error');
      }
    }
    async function saveWikiNotes(incoming, keepExisting = false) {
      const database = await wikiStorage;
      const merged = await new Promise((resolve, reject) => {
        const transaction = database.transaction('notes', 'readwrite');
        const store = transaction.objectStore('notes');
        const read = store.getAll();
        let result;
        let failure;
        read.onsuccess = () => {
          try {
            result = parseWikiIndex({ version: 1, entries: read.result });
            for (const [topic, record] of incoming) {
              const custom = topic.startsWith('custom-');
              const match = custom && [...result].find(([key, value]) => key.startsWith('custom-') && sameNote(value, record));
              if (keepExisting && (match || (!custom && result.has(topic)))) continue;
              const target = match ? match[0] : custom && result.has(topic) ? nextCustomId(result, incoming) : topic;
              result.set(target, record);
              if (result.size > maxNotes) throw Error(`索引最多保存 ${maxNotes} 条，请先导出已有笔记。`);
              store.put({ topic: target, ...record, file: noteFilename(target) });
            }
          } catch (error) {
            failure = error;
            transaction.abort();
          }
        };
        transaction.oncomplete = () => resolve(result);
        transaction.onabort = () => reject(failure ?? transaction.error ?? Error('本地保存被中断。'));
        transaction.onerror = () => reject(transaction.error);
      });
      replaceShared(merged);
      status('wiki-storage-state', `已保存 ${shared.size} 条，可刷新或在另一窗口回查。`, 'success');
      wikiChanges?.postMessage('updated');
    }
    if (wikiChanges) wikiChanges.onmessage = reloadWikiStorage;
    window.addEventListener('focus', reloadWikiStorage);
    window.addEventListener('pagehide', event => { if (!event.persisted) wikiChanges?.close(); });
    function nextCustomId(index, reserved = index) {
      let number = 1;
      while (index.has(`custom-${number}`) || reserved.has(`custom-${number}`)) number++;
      return `custom-${number}`;
    }
    function getNote() {
      const id = $('wiki-topic').value;
      if (id !== 'custom') return { id, draft: atlasDrafts[id] };
      const sourceText = $('wiki-source').value.trim();
      const draft = {
        title: $('wiki-title').value.trim(), source: httpSource(sourceText),
        excerpt: draftReview ? $('wiki-excerpt').value : $('wiki-excerpt').value.trim(), value: $('wiki-value').value.trim(),
        review: draftReview,
      };
      if (!draft.title || !draft.excerpt || (sourceText && (!draft.source || draft.source.length > maxSource))) {
        status('wiki-state', '请填写题名和正文。来源地址留空或填写有效的网页地址。', 'error');
        return null;
      }
      const existing = [...shared].find(([id, record]) => id.startsWith('custom-') && sameNote(record, draft));
      return { id: existing?.[0] ?? nextCustomId(shared), draft };
    }
    function topicUse() {
      const draft = atlasDrafts[$('wiki-topic').value];
      $('wiki-custom').hidden = Boolean(draft);
      $('wiki-topic-use').textContent = draft?.value ?? '核查笔记会保留原报告的判断和范围，选择理由可另外填写。';
      $('wiki-review').hidden = !draftReview;
      $('wiki-review').textContent = draftReview ? `第 14 条核查 · ${reviewLabels[draftReview.status]} · ${lineRange(draftReview)}。完整记录可预览 Markdown。` : '';
    }
    function showMarkdown(text, filename) {
      $('wiki-output').textContent = text;
      $('wiki-output').hidden = false;
      $('wiki-empty').hidden = true;
      setDownload('download-note', text, filename);
    }
    function clearWikiPreview() {
      setDownload('download-note');
      $('wiki-output').hidden = true;
      $('wiki-empty').hidden = false;
    }
    for (const id of ['wiki-topic', 'context', 'wiki-query', 'wiki-title', 'wiki-source', 'wiki-excerpt', 'wiki-value']) {
      $(id).addEventListener('input', () => {
        if (readingCitation) {
          fileReadVersion++;
          readingCitation = false;
          status('wiki-file-state', '已保留当前输入。');
        }
        if (draftReview && (id === 'wiki-source' || id === 'wiki-excerpt')) {
          draftReview = undefined;
          status('wiki-file-state', '原文或来源已编辑，当前草稿按手写笔记整理。');
        }
        clearWikiPreview();
        topicUse();
        status('wiki-state', `当前索引有 ${shared.size} 条，等待生成新产物。`);
      });
    }
    $('format').onclick = () => {
      const note = getNote();
      if (!note) return;
      showMarkdown(asMarkdown(note.draft), noteFilename(note.id));
      status('wiki-state', '已生成含 Obsidian 双链和来源链接的 Markdown。', 'success');
    };
    function renderWikiIndex() {
      const rows = [...shared].map(([topic, record]) => ({ topic, ...record, file: noteFilename(topic) }));
      $('wiki-count').textContent = shared.size;
      $('wiki-index-empty').hidden = shared.size > 0;
      setDownload('download-index', { version: 1, entries: rows });
      const toc = ['# 图鉴 Wiki 目录', '', ...rows.map(record => {
        const name = record.title.replace(/[\[\]|]/g, ' ');
        return `- [[${record.file.slice(0, -3)}|${mdText(name)}]]`;
      })];
      setDownload('download-wiki-toc', toc.join('\n'));
      $('wiki-log').replaceChildren();
      for (const record of rows) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'wiki-item';
        button.textContent = record.title;
        button.addEventListener('click', () => {
          showMarkdown(asMarkdown(record), record.file);
          status('wiki-state', `已打开「${record.title}」。`, 'success');
        });
        item.append(button, ` · ${record.author} 导入`);
        $('wiki-log').append(item);
      }
    }
    $('ingest').onclick = async () => {
      const note = getNote();
      if (!note) return;
      const { id, draft } = note;
      const existing = shared.has(id);
      if (!existing && shared.size >= maxNotes) return status('wiki-state', `本页索引已达到 ${maxNotes} 条。可先导出当前索引。`, 'error');
      showMarkdown(asMarkdown(draft), noteFilename(id));
      try {
        await saveWikiNotes(new Map([[id, { ...draft, author: shared.get(id)?.author ?? $('context').value }]]));
        status('wiki-state', existing ? '已更新并保存笔记。' : `Wiki 索引已保存 ${shared.size} 条。可以重开页面回查。`, 'success');
      } catch (error) {
        status('wiki-state', `保存失败，请下载当前 Markdown。 ${error.message}`, 'error');
      }
    };
    const boundedText = (value, max, required = false) => typeof value === 'string' && value.length <= max && (!required || Boolean(value.trim()));
    function validReview(review) {
      return review && typeof review.status === 'string' && Object.hasOwn(reviewLabels, review.status) && boundedText(review.sourceName, 300, true)
        && Number.isSafeInteger(review.startLine) && Number.isSafeInteger(review.endLine)
        && review.startLine > 0 && review.startLine <= review.endLine && review.endLine <= 400
        && boundedText(review.quote, maxEvidence, true) && boundedText(review.claim, 1500)
        && boundedText(review.note, 1000) && boundedText(review.scope, 1000, true)
        && (review.sourcePath === undefined || boundedText(review.sourcePath, 300, true))
        && (review.recordId === undefined || boundedText(review.recordId, 300, true));
    }
    function normalizedReview(review) {
      const { status: verdict, sourceName, startLine, endLine, quote, claim, note, scope, sourcePath, recordId } = review;
      return { status: verdict, sourceName, startLine, endLine, quote, claim, note, scope, sourcePath, recordId };
    }
    function importCitation(report) {
      const source = report?.source;
      const location = report?.selectedLocation;
      const context = report?.context;
      const review = {
        status: report?.reviewStatus, sourceName: source?.name, startLine: location?.startLine, endLine: location?.endLine,
        quote: report?.quote, claim: report?.claim, note: report?.reviewNote, scope: report?.scope, sourcePath: source?.path, recordId: source?.recordId,
      };
      if (report?.version !== 1 || report.literalMatch !== true || !validReview(review) || !Array.isArray(context)
        || !context.length || context.length > 400 || !Number.isSafeInteger(context[0]?.line)
        || context[0].line < 1 || context[0].line > review.startLine || context.at(-1)?.line < review.endLine || context.at(-1)?.line > 400
        || !context.every((row, index) => row?.line === context[0].line + index && boundedText(row.text, maxEvidence))) {
        throw Error('请选择第 14 条导出的核查 JSON，报告须有已定位的引文和摘录。');
      }
      const sourceURL = typeof source.url === 'string' ? httpSource(source.url) : '';
      if (source.url !== undefined && (!sourceURL || sourceURL.length > maxSource)) throw Error('报告登记的来源地址无效。');
      const excerpt = context.map(row => row.text).join('\n');
      if (!boundedText(excerpt, maxEvidence, true)) throw Error('报告所附摘录为空或超出本页范围。');

      draftReview = review;
      $('wiki-topic').value = 'custom';
      $('wiki-title').value = review.sourceName;
      $('wiki-source').value = sourceURL;
      $('wiki-excerpt').value = excerpt;
      $('wiki-value').value = '';
      clearWikiPreview();
      topicUse();
      status('wiki-file-state', '已填入核查摘录及原报告状态，可预览 Markdown 或写入索引。', 'success');
      status('wiki-state', `当前索引有 ${shared.size} 条，核查笔记等待写入。`);
    }
    function parseWikiIndex(index) {
      if (index?.version !== 1 || !Array.isArray(index.entries) || index.entries.length > maxNotes) {
        throw Error(`请选择本工作台导出的索引 JSON，每份最多 ${maxNotes} 条。`);
      }
      const incoming = new Map();
      for (const row of index.entries) {
        const topic = row?.topic;
        if (typeof topic !== 'string' || (!Object.hasOwn(atlasDrafts, topic) && !/^custom-[1-9]\d{0,8}$/.test(topic))
          || incoming.has(topic) || row.file !== noteFilename(topic) || !['会话 A', '会话 B'].includes(row.author)
          || !boundedText(row.title, 300, true) || !boundedText(row.excerpt, maxEvidence, true) || !boundedText(row.value, 1500)
          || !boundedText(row.source, maxSource) || (row.source && httpSource(row.source) !== row.source)
          || (row.review !== undefined && !validReview(row.review))) throw Error('索引包含无效或重复的条目，当前笔记已保留。');
        const { title, source, excerpt, value, author, review } = row;
        incoming.set(topic, { title, source, excerpt, value, review: review && normalizedReview(review), author });
      }
      return incoming;
    }
    async function restoreIndex(index) {
      await saveWikiNotes(parseWikiIndex(index), true);
      status('wiki-file-state', `已合并并保存索引，共 ${shared.size} 条。`, 'success');
      status('wiki-state', '可以检索、刷新或重开窗口回查。', 'success');
    }
    function readWikiFile(id, maxMegabytes, accept) {
      $(id).onchange = async event => {
        const input = event.currentTarget;
        const file = input.files[0];
        input.value = '';
        if (!file) return;
        const version = ++fileReadVersion;
        readingCitation = id === 'wiki-citation-file';
        status('wiki-file-state', '正在读取本地文件。');
        try {
          if (file.size > maxMegabytes * 1024 * 1024) throw Error(`文件须小于或等于 ${maxMegabytes} MiB。`);
          const text = await file.text();
          if (version === fileReadVersion) await accept(JSON.parse(text.replace(/^\uFEFF/, '')));
        } catch (error) {
          if (version === fileReadVersion) status('wiki-file-state', error instanceof SyntaxError ? '无法解析 JSON，当前草稿和索引已保留。' : error.message, 'error');
        } finally {
          if (version === fileReadVersion) readingCitation = false;
        }
      };
    }
    readWikiFile('wiki-citation-file', 8, importCitation);
    readWikiFile('wiki-index-file', 64, restoreIndex);
    $('recall').onclick = () => {
      const query = $('wiki-query').value.trim().normalize('NFKC').toLowerCase();
      const matches = query ? [...shared].filter(([, draft]) => [draft.title, draft.source, draft.excerpt, draft.value, draft.review?.claim, draft.review?.note].some(text => text?.normalize('NFKC').toLowerCase().includes(query))) : [];
      if (matches.length) {
        const rows = matches.map(([id, draft]) => [
          `## ${mdText(draft.title)}`,
          draft.value && mdText(draft.value),
          draft.review && `第 14 条核查 · ${reviewLabels[draft.review.status]} · ${lineRange(draft.review)}`,
          sourceLine(draft),
          `笔记 · [[${noteFilename(id).slice(0, -3)}]] · ${draft.author}导入`,
        ].filter(Boolean).join('\n\n'));
        showMarkdown(['# 图鉴回查记录', ...rows].join('\n\n'), 'atlas-wiki-lookup.md');
      } else {
        $('wiki-empty').hidden = true;
        $('wiki-output').hidden = false;
        $('wiki-output').textContent = shared.size ? '尝试输入部分题名、来源地址、正文或核查备注。' : '先将一条笔记写入共享索引，再尝试回查。';
        setDownload('download-note');
      }
      status('wiki-state', `${$('context').value} 回查「${query}」，得到 ${matches.length} 条来源记录。`, matches.length ? 'success' : '');
    };
    $('plan').onclick = () => {
      const missing = Object.values(atlasDrafts).filter(draft => ![...shared.values()].some(record => record.source === draft.source));
      const checklist = ['# 图鉴 Wiki 补齐清单', '', `当前目标 · 让 ${Object.keys(atlasDrafts).length} 个图鉴案例都能回查原始地址和选择理由`, '', ...missing.map(draft => `- [ ] 导入[${draft.title}](${draft.source})，保留原始地址。`), '- [ ] 切到会话 B，分别用题名和选择理由复查。'];
      showMarkdown(checklist.join('\n'), 'atlas-wiki-plan.md');
      status('wiki-state', `根据当前索引生成计划，发现 ${missing.length} 项缺口。`, 'success');
    };
    topicUse();
    reloadWikiStorage();
  }

  function citations() {
    const maxSourceLength = 20000;
    const maxSourceLines = 400;
    const records = [
      '图鉴将十五个实验放在同一个本地入口。',
      '在银河实验中，固定种子可以让旋臂参数的对照复现。',
      '目前记录的是本地图鉴的示意结果，适用范围尚需验证。',
    ];
    const presets = {
      exact: [records[1], '固定种子可以让本图鉴的旋臂对照复现。'],
      fake: ['旋臂实验采用了实测银河星表。', '实验可以解释真实银河的演化。'],
      over: [records[1], '因此任意银河生成模型都能精确预测真实银河。'],
    };
    workbench(`
      <h2>核查材料</h2>
      <details class="inline-details" id="citation-import-panel"><summary>导入第 12 条的验收报告</summary>
        <label>选择验收报告 JSON<input id="citation-report-file" type="file" accept=".json,application/json"></label>
        <p class="hint">文件只在本页读取。核查行号从报告所附摘录起算。</p>
        <a href="../#explore-12" target="_top">打开第 12 条 · 图鉴案例交接 ↗</a>
        <p class="status" id="citation-import-state" role="status"></p>
      </details>
      <label>原文来源<select id="citation-source-mode"><option value="atlas">图鉴实验记录</option><option value="custom">自备原文或报告摘录</option></select></label>
      <div class="controls" id="citation-presets" aria-label="可切换的图鉴核查样例"><button data-preset="exact">准确引用</button><button data-preset="fake">找不到原文</button><button data-preset="over">结论越界</button></div>
      <div class="subsection" id="citation-custom" hidden>
        <label>资料名称或出处<input id="citation-source-name" maxlength="300" placeholder="例如 会议记录 11 月 6 日 / 第 2 页"></label>
        <label>原文或报告摘录<textarea id="citation-source-text" rows="4" placeholder="请保留原有换行，核查报告的行号以这里为准。"></textarea></label>
        <p class="hint">最多 ${maxSourceLength.toLocaleString('en-US')} 字符及 ${maxSourceLines} 行。文本只在当前页面处理。</p>
      </div>
      <label>拟引用的原话<textarea id="quote" rows="2" maxlength="${maxSourceLength}"></textarea></label>
      <label>待复核的结论或用途 <span class="hint">可选</span><textarea id="claim" rows="2" maxlength="1500"></textarea></label>
      <div class="controls"><button id="check-cite" class="primary">查找原文位置</button></div>`, `
      <h2>证据定位</h2><p class="status" id="citation-state" aria-live="polite"></p>
      <div class="result-card evidence-card"><div class="result-heading"><h3 id="raw-title"></h3><span class="count" id="raw-count"></span></div><p id="raw-origin" class="hint"></p><a class="source-link" id="citation-origin-link" target="_blank" rel="noopener noreferrer" hidden>查看报告登记的来源 ↗</a><ol class="source-lines" id="raw-record" aria-label="原文行号" tabindex="0"></ol><p class="empty-card" id="raw-empty" hidden></p></div>
      <section class="result-card citation-context" id="citation-context" aria-labelledby="citation-context-title" hidden>
        <div class="result-heading"><h3 id="citation-context-title">可交接摘录</h3><span class="count" id="citation-range"></span></div>
        <label id="citation-location-label" hidden>选取核查位置<select id="citation-location"></select></label>
        <pre class="artifact" id="citation-excerpt" aria-label="摘录及相邻行" tabindex="0"></pre>
        <p class="hint" id="context-warning"></p>
      </section>
      <fieldset class="subsection review-options" id="manual-review" hidden><legend>结论的人工复核</legend><p id="review-state" class="hint" aria-live="polite"></p>
      <label><input type="radio" name="review" id="review-undecided" checked> 待人工复核</label><label><input type="radio" name="review" id="reviewed"> 支持结论</label><label><input type="radio" name="review" id="review-rejected"> 结论超出原文</label>
      <label class="citation-review-note">复核依据或处理备注<textarea id="citation-review-note" rows="2" maxlength="1000" placeholder="例如，原文支持在本实验中复现，建议保留范围限定。"></textarea></label></fieldset>
      <div class="download-area"><p class="hint">Markdown 可交给编辑复核，JSON 保留全部匹配位置。文件会标明当前的复核状态。</p><a id="download-citation-proof" class="file-download" download="atlas-citation-proof.md" hidden>下载核查单 · Markdown ↓</a><a id="download-citation" class="file-download" download="atlas-citation-report.json" hidden>下载完整报告 · JSON ↓</a><a id="citation-to-wiki" class="source-link" href="../#explore-13" target="_top" hidden>到图鉴知识库导入 JSON ↗</a></div>`);
    let result;
    let customSource = false;
    let importedSource;
    let importVersion = 0;
    let readingReport = false;
    const normalize = text => text.normalize('NFKC').replace(/\s+/g, ' ').trim();
    const activeLines = () => customSource ? $('citation-source-text').value.split(/\r\n?|\n/) : records;
    const sourceLabel = () => customSource ? $('citation-source-name').value.trim() || '未命名的粘贴资料' : '本地图鉴实验记录';
    const sourceTooLarge = lines => lines.length > maxSourceLines || (customSource && $('citation-source-text').value.length > maxSourceLength);

    function setCustomSource(enabled) {
      customSource = enabled;
      $('citation-source-mode').value = enabled ? 'custom' : 'atlas';
      $('citation-custom').hidden = !enabled;
      $('citation-presets').hidden = enabled;
    }

    function cancelReportRead() {
      if (!readingReport) return;
      importVersion++;
      readingReport = false;
      status('citation-import-state', '已按当前输入继续。');
    }

    $('citation-report-file').addEventListener('change', async event => {
      const input = event.currentTarget;
      const file = input.files[0];
      input.value = '';
      if (!file) return;
      const version = ++importVersion;
      readingReport = true;
      clearReview();
      status('citation-import-state', '正在读取验收报告。');
      try {
        if (file.size > 512 * 1024) throw Error('报告文件须小于或等于 512 KB。');
        const text = await file.text();
        if (version !== importVersion) return;
        const report = JSON.parse(text.replace(/^\uFEFF/, ''));
        const { delivery, evidence } = report ?? {};
        const url = typeof evidence?.source === 'string' && evidence.source.length <= 2048 ? httpSource(evidence.source) : '';
        if (report?.version !== 1 || report.verification?.quoteMatch !== true || !url
          || typeof delivery?.title !== 'string' || !delivery.title.trim() || delivery.title.length > 300
          || typeof delivery.use !== 'string' || !delivery.use.trim() || delivery.use.length > 1500
          || typeof evidence.localExcerpt !== 'string' || !evidence.localExcerpt.trim()
          || typeof evidence.checkedQuote !== 'string' || !evidence.checkedQuote.trim() || evidence.checkedQuote.length > maxSourceLength) {
          throw Error('请选择第 12 条导出的版本 1 验收报告，报告须含题名、来源、摘录和引文。');
        }
        if (evidence.localExcerpt.length > maxSourceLength || evidence.localExcerpt.split(/\r\n?|\n/).length > maxSourceLines) {
          throw Error('报告附带的摘录超出本页核查范围。请选取需要核查的段落后粘贴。');
        }
        setCustomSource(true);
        importedSource = { url };
        $('citation-source-name').value = delivery.title;
        $('citation-source-text').value = evidence.localExcerpt;
        $('quote').value = evidence.checkedQuote;
        $('claim').value = delivery.use;
        clearReview();
        status('citation-import-state', '已带入摘录、引文和待复核的用途或结论。请查找原文位置，再登记判断。', 'success');
      } catch (error) {
        if (version !== importVersion) return;
        status('citation-import-state', error instanceof SyntaxError ? '无法解析验收报告 JSON。' : error.message, 'error');
      } finally {
        if (version === importVersion) readingReport = false;
      }
    });

    function showSource(lines, matches = [], selected = matches[0]) {
      const overflow = sourceTooLarge(lines);
      const empty = customSource && !$('citation-source-text').value.trim();
      const origin = customSource ? importedSource : undefined;
      const highlighted = new Set();
      for (const match of matches) {
        for (let number = match.startLine; number <= match.endLine; number++) highlighted.add(number);
      }
      $('raw-title').textContent = sourceLabel();
      $('raw-count').textContent = empty ? '0 行' : `${lines.length} 行`;
      $('raw-origin').textContent = origin ? '第 12 条验收报告所附摘录 · 来源由使用者核对'
        : customSource ? '用户粘贴 · 来源身份由使用者核对' : '预载资料 · 图鉴实验记录摘录';
      const sourceLink = $('citation-origin-link');
      sourceLink.hidden = !origin;
      if (origin) sourceLink.href = origin.url;
      else sourceLink.removeAttribute('href');
      $('raw-empty').hidden = !empty && !overflow;
      $('raw-empty').textContent = overflow ? `请缩小核查范围至 ${maxSourceLength.toLocaleString('en-US')} 字符及 ${maxSourceLines} 行以内。` : '粘贴文本后，这里会显示带行号的原文。';
      $('raw-record').hidden = empty || overflow;
      if (empty || overflow) return $('raw-record').replaceChildren();
      $('raw-record').replaceChildren(...lines.map((line, index) => {
        const item = document.createElement('li');
        const content = document.createElement('span');
        item.dataset.line = index + 1;
        if (highlighted.has(index + 1)) item.dataset.kind = 'success';
        content.textContent = line;
        item.append(content);
        return item;
      }));
      if (selected) $('raw-record').scrollTop = Math.max(0, $('raw-record').children[selected.startLine - 1].offsetTop - 30);
    }

    function selectLocation() {
      const location = result.matches[Number($('citation-location').value)];
      const lines = activeLines();
      const start = Math.max(1, location.startLine - 1);
      const end = Math.min(lines.length, location.endLine + 1);
      result.selectedLocation = location;
      result.context = lines.slice(start - 1, end).map((text, index) => ({ line: start + index, text }));
      $('citation-excerpt').textContent = result.context.map(({ line, text }) => `${line}  ${text}`).join('\n');
      $('citation-range').textContent = lineRange(location);
      showSource(lines, result.matches, location);
      resetJudgment();
      saveReport();
    }

    function saveReport() {
      const claim = $('claim').value.trim();
      const origin = customSource ? importedSource : undefined;
      const reviewStatus = !result.literalMatch ? 'unmatched' : !claim ? 'no-claim' : $('reviewed').checked ? 'supported' : $('review-rejected').checked ? 'overreach' : 'pending';
      const manualReview = {
        unmatched: '未定位到原文，等待修正引文', 'no-claim': '仅定位引文，未提交待复核结论', supported: '已登记为支持结论',
        overreach: '已登记为结论超出原文', pending: '待人工复核',
      }[reviewStatus];
      const report = {
        version: 1,
        source: origin ? { name: sourceLabel(), kind: 'handoff-report', url: origin.url }
          : customSource ? { name: sourceLabel(), kind: 'user-paste' } : { name: sourceLabel(), path: 'labs/systems-cases.js', recordId: 'atlas-lab-notes', kind: 'atlas' },
        ...result,
        claim,
        quote: $('quote').value.trim(),
        manualReview,
        reviewStatus,
        reviewNote: $('citation-review-note').value.trim(),
        scope: `在${origin ? '第 12 条报告附带的摘录' : '当前页面文本'}中匹配连续字串，统一 Unicode NFKC 和连续空白，行号按${origin ? '摘录' : '输入文本'}编号。来源身份和结论支持度由使用者判断。`,
      };
      const fields = [`资料 · ${report.source.name}`, `拟引用 · ${report.quote}`];
      if (origin) fields.splice(1, 0, `报告登记的来源 · ${origin.url}`);
      if (claim) fields.push(`待复核结论 · ${claim}`);
      if (report.reviewNote) fields.push(`处理备注 · ${report.reviewNote}`);
      const literalBlock = text => {
        const fence = '`'.repeat(Math.max(2, ...Array.from(text.matchAll(/`+/g), match => match[0].length)) + 1);
        return `${fence}text\n${text}\n${fence}`;
      };
      const lines = ['# 引文核查单', '', `- 复核状态 · ${manualReview}`, `- 选取位置 · ${result.selectedLocation ? `${lineRange(result.selectedLocation)}，共 ${result.matches.length} 个命中区间` : '无'}`, '', '## 交接信息', '', literalBlock(fields.join('\n\n'))];
      if (result.context) lines.push('', '## 原文摘录与相邻行', '', literalBlock($('citation-excerpt').textContent));
      lines.push('', '## 核查范围', '', report.scope);
      setDownload('download-citation', report);
      setDownload('download-citation-proof', lines.join('\n'));
      $('citation-to-wiki').hidden = !report.literalMatch;
    }

    function resetJudgment() {
      $('reviewed').checked = false;
      $('review-rejected').checked = false;
      $('review-undecided').checked = true;
      $('citation-review-note').value = '';
      status('review-state', '核对这处命中及相邻原文，再登记你的判断。');
    }

    function clearReview() {
      result = undefined;
      setDownload('download-citation');
      setDownload('download-citation-proof');
      $('citation-to-wiki').hidden = true;
      $('manual-review').hidden = true;
      $('citation-context').hidden = true;
      $('citation-location').replaceChildren();
      $('citation-excerpt').textContent = '';
      resetJudgment();
      $('context-warning').textContent = '';
      status('citation-state', '等待定位原文。');
      showSource(activeLines());
    }
    function choose(preset) {
      cancelReportRead();
      [$('quote').value, $('claim').value] = presets[preset];
      for (const button of document.querySelectorAll('[data-preset]')) button.setAttribute('aria-pressed', button.dataset.preset === preset ? 'true' : 'false');
      clearReview();
    }
    for (const button of document.querySelectorAll('[data-preset]')) button.onclick = () => choose(button.dataset.preset);
    $('citation-source-mode').onchange = () => {
      cancelReportRead();
      setCustomSource($('citation-source-mode').value === 'custom');
      if (!customSource) return choose('exact');
      $('quote').value = $('claim').value = '';
      clearReview();
    };
    $('citation-source-text').oninput = $('citation-source-name').oninput = () => {
      cancelReportRead();
      if (importedSource) {
        importedSource = undefined;
        status('citation-import-state', '原文资料已编辑，将按当前输入核查。');
      }
      clearReview();
    };
    $('quote').oninput = $('claim').oninput = () => {
      cancelReportRead();
      for (const button of document.querySelectorAll('[data-preset]')) button.setAttribute('aria-pressed', 'false');
      clearReview();
    };
    for (const id of ['reviewed', 'review-rejected', 'review-undecided']) {
      $(id).onchange = () => {
        const message = $('reviewed').checked ? '已登记为支持结论。' : $('review-rejected').checked ? '已登记为结论超出原文。' : '核对命中位置及前后文，再登记你的判断。';
        status('review-state', message);
        if (result) saveReport();
      };
    }
    $('citation-location').onchange = selectLocation;
    $('citation-review-note').oninput = () => { if (result) saveReport(); };

    $('check-cite').onclick = () => {
      cancelReportRead();
      clearReview();
      const quote = normalize($('quote').value);
      const lines = activeLines();
      if (sourceTooLarge(lines)) return status('citation-state', '请缩小原文范围后再核查。', 'error');
      if (customSource && !$('citation-source-text').value.trim()) return status('citation-state', '请先粘贴需要核查的原文。', 'error');
      if (!quote) return status('citation-state', '请输入拟引用的原话。', 'error');
      let sourceText = '';
      const offsets = [];
      lines.forEach((line, index) => {
        const segment = normalize(line);
        if (!segment) return;
        if (sourceText) sourceText += ' ';
        offsets.push({ start: sourceText.length, line: index + 1 });
        sourceText += segment;
      });
      const matches = [];
      let cursor = 0;
      let index = sourceText.indexOf(quote);
      while (index >= 0) {
        while (offsets[cursor + 1]?.start <= index) cursor++;
        const startLine = offsets[cursor].line;
        let end = cursor;
        while (offsets[end + 1]?.start < index + quote.length) end++;
        const endLine = offsets[end].line;
        const previous = matches.at(-1);
        if (previous?.startLine !== startLine || previous?.endLine !== endLine) {
          matches.push({ startLine, endLine, sourceExcerpt: lines.slice(startLine - 1, endLine).join('\n') });
        }
        index = sourceText.indexOf(quote, index + 1);
      }
      result = { literalMatch: matches.length > 0, location: matches[0] ?? null, matches };
      if (!matches.length) {
        saveReport();
        return status('citation-state', '所提供的原文中没有找到这段引文。', 'error');
      }
      status('citation-state', `定位到 ${matches.length} 个行区间 · 首处在${lineRange(matches[0])}`, 'success');
      const hasClaim = Boolean($('claim').value.trim());
      $('context-warning').textContent = customSource && importedSource ? '摘录含命中范围和前后各一行。行号对应验收报告所附摘录。' : '摘录含命中范围和前后各一行。行号对应本次输入的原文。';
      $('citation-location-label').hidden = matches.length < 2;
      $('citation-location').replaceChildren(...matches.map((location, index) => new Option(lineRange(location), index)));
      $('citation-context').hidden = false;
      $('manual-review').hidden = !hasClaim;
      selectLocation();
    };
    choose('exact');
    $('check-cite').onclick();
  }

  function simulation() {
    const stageNames = ['起点', '粗剪', '配画', '复核'];
    const defaults = [4, 5, 6];
    const sampleCount = 240;
    const model = '图鉴剪辑排期示意';
    workbench(`
      <h2>配置排期假设</h2>
      <details class="inline-details schedule-replay"><summary>复算已有排期报告</summary>
        <label>选择排期报告 JSON<input id="sim-report-file" type="file" accept=".json,application/json" aria-describedby="sim-replay-hint"></label>
        <p id="sim-replay-hint" class="hint">用报告中的方案和基准替换当前设置，再按原种子重新计算轨迹。文件只在当前页面读取。</p>
        <p id="sim-replay-state" class="status" role="status"></p>
      </details>
      <div class="subsection"><h3>假设前置审稿减少返工</h3><p class="hint">用同一批抽样和 24 分钟截止线，对照每阶段 15% 与 5% 的返工概率。载入时会替换当前方案与基准。</p><div class="controls"><button id="sim-review-preset" type="button">试算返工减少的情形</button></div></div>
      <label>每阶段返工概率 <output id="rate-value">15%</output><input id="rework" type="range" min="0" max="60" step="1" value="15"></label>
      <div class="field-grid"><label>截止时间（分钟）<input id="sim-deadline" type="number" min="1" max="480" value="24"></label><label>随机种子<input id="sim-seed" type="number" min="1" max="4294967295" value="42"></label></div>
      <fieldset class="subsection schedule-fields"><legend>各阶段基准工时（分钟）</legend><div class="field-grid">${defaults.map((minutes, index) => `<label>${stageNames[index + 1]}<input id="sim-base-${index}" type="number" min="0.1" max="180" step="any" value="${minutes}"></label>`).join('')}</div></fieldset>
      <details class="subsection schedule-details"><summary>编辑工时浮动与返工区间</summary><div class="field-grid"><label>随机浮动上限（分钟）<input id="sim-noise" type="number" min="0" max="60" step="any" value="3"></label><label>返工下限（分钟）<input id="sim-rework-min" type="number" min="0" max="120" step="any" value="3"></label><label>返工上限（分钟）<input id="sim-rework-max" type="number" min="0" max="120" step="any" value="9"></label></div></details>
      <div class="controls"><button id="run-sim" class="primary">计算 240 条排期</button><button id="change-seed">换种子再跑</button></div>
      <section class="subsection"><h3>模型假设</h3><p class="hint">每个阶段各抽一次均匀工时浮动和返工。三个阶段顺序执行，触发返工后增加区间内的随机工时。输入值由你设定，模型未用实际项目数据校准。</p></section>`, `
      <h2>排期分布</h2><div class="kpis" id="sim-kpis" aria-live="polite"></div>
      <svg id="sim-chart" class="chart" viewBox="0 0 380 173" role="img" aria-label="从相同起点出发的剪辑审核排期轨迹"></svg>
      <div class="chart-legend"><span data-series="average">全部平均</span><span data-series="late">超过截止</span><span data-series="ontime">未超时</span></div>
      <p class="hint">图中显示前 60 条轨迹，统计包含 240 条。P90 表示覆盖 90% 样本所需的时长，所需缓冲等于 P90 减截止时间后取正值。</p>
      <p id="simulation-state" class="status sample-note" aria-live="polite"></p>
      <section class="result-card schedule-comparison" id="schedule-comparison" aria-labelledby="schedule-compare-title"><h3 id="schedule-compare-title">基准与当前方案</h3><div class="controls"><button id="sim-pin" type="button">将当前结果设为基准</button><button id="sim-match-seed" type="button" hidden>用基准种子重算</button><button id="sim-clear" type="button" hidden>清除基准</button></div><p class="hint" id="sim-baseline-state" aria-live="polite"></p><table><caption class="schedule-sr-only">本轮各阶段与基准的平均工时</caption><thead><tr><th scope="col">指标</th><th scope="col">当前</th><th scope="col">基准</th><th scope="col">变化</th></tr></thead><tbody id="sim-comparison"></tbody></table></section>
      <div class="download-area"><p class="hint">CSV 含逐次阶段用时、返工次数和超时结果。JSON 另含配置及百分位统计。</p><a id="download-simulation-csv" class="file-download" download="atlas-schedule-trajectories.csv" hidden>下载 240 条轨迹 · CSV ↓</a><a id="download-simulation" class="file-download" download="atlas-schedule-simulation.json" hidden>下载参数与 240 条轨迹 · JSON ↓</a></div>`);
    const settingsIds = ['sim-deadline', 'sim-seed', 'sim-base-0', 'sim-base-1', 'sim-base-2', 'sim-noise', 'sim-rework-min', 'sim-rework-max'];
    let current;
    let baseline;
    let replayRequest = 0;

    function rng(seed) {
      let state = seed >>> 0;
      return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
      };
    }
    function draw(rows, means, deadlineMinutes) {
      const end = 3;
      const peak = Math.max(30, deadlineMinutes, ...rows.map(row => row[end]));
      const step = Math.ceil(peak / 50) * 10;
      const max = Math.ceil(peak / step) * step;
      const x = index => 30 + 100 * index;
      const y = minutes => 140 - (114 * minutes / max);
      const poly = (row, color, width, opacity) => `<polyline points="${row.map((minutes, index) => `${x(index)},${y(minutes).toFixed(2)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" />`;
      const grid = Array.from({ length: max / step + 1 }, (_, i) => {
        const minute = i * step;
        return `<line x1="30" y1="${y(minute)}" x2="330" y2="${y(minute)}" stroke="#443d59"/><text x="24" y="${y(minute) + 3}" text-anchor="end">${minute}</text>`;
      }).join('');
      const paths = rows.slice(0, 60).map(row => poly(row, row[end] > deadlineMinutes ? '#ff889b' : '#cab3ed', 1, .28)).join('');
      $('sim-chart').innerHTML = `${grid}<text x="11" y="13">分钟</text><line x1="30" y1="${y(deadlineMinutes)}" x2="330" y2="${y(deadlineMinutes)}" stroke="#ffc2cb" stroke-dasharray="4 3" /><text x="333" y="${y(deadlineMinutes) + 3}">${deadlineMinutes} 分</text>${paths}${poly(means, '#d6ef99', 3, 1)}${stageNames.map((name, i) => `<text x="${x(i)}" y="160" text-anchor="middle">${name}</text>`).join('')}`;
    }

    function parametersFromInputs() {
      const inputs = settingsIds.map($);
      const invalid = inputs.find(input => !Number.isFinite(input.valueAsNumber) || !input.checkValidity());
      if (invalid) {
        invalid.focus();
        return status('simulation-state', '请填写有效数值，并检查字段的最小值与最大值。', 'error');
      }
      const [deadlineMinutes, seed, rough, broll, review, noise, reworkMin, reworkMax] = inputs.map(input => input.valueAsNumber);
      if (reworkMin > reworkMax) {
        $('sim-rework-max').focus();
        return status('simulation-state', '返工上限需大于或等于返工下限。', 'error');
      }
      return { seed, reworkProbability: Number($('rework').value) / 100, deadlineMinutes, baseMinutes: [rough, broll, review], noiseMinutes: [0, noise], additionalReworkMinutes: [reworkMin, reworkMax], samples: sampleCount };
    }

    function settingValues(parameters) {
      const { deadlineMinutes, seed, baseMinutes, noiseMinutes, additionalReworkMinutes } = parameters;
      return [deadlineMinutes, seed, ...baseMinutes, noiseMinutes[1], ...additionalReworkMinutes];
    }

    function reportParameters(parameters) {
      const { seed, reworkProbability, deadlineMinutes, baseMinutes, noiseMinutes, additionalReworkMinutes, samples } = parameters ?? {};
      const rate = $('rework');
      if (!Number.isFinite(reworkProbability)) return;
      const percent = Math.round(reworkProbability * 100);
      if (samples !== sampleCount || percent / 100 !== reworkProbability || percent < Number(rate.min) || percent > Number(rate.max)
        || !Array.isArray(baseMinutes) || baseMinutes.length !== 3
        || !Array.isArray(noiseMinutes) || noiseMinutes.length !== 2 || noiseMinutes[0] !== 0
        || !Array.isArray(additionalReworkMinutes) || additionalReworkMinutes.length !== 2) return;
      const values = settingValues(parameters);
      const inBounds = settingsIds.every((id, index) => {
        const input = $(id);
        const value = values[index];
        return Number.isFinite(value) && value >= Number(input.min) && value <= Number(input.max)
          && (input.step === 'any' || Number.isInteger(value));
      });
      if (!inBounds || additionalReworkMinutes[0] > additionalReworkMinutes[1]) return;
      return { seed, reworkProbability, deadlineMinutes, baseMinutes, noiseMinutes, additionalReworkMinutes, samples };
    }

    function applySettings(parameters) {
      settingValues(parameters).forEach((value, index) => { $(settingsIds[index]).value = value; });
      const percent = Math.round(parameters.reworkProbability * 100);
      $('rework').value = percent;
      $('rate-value').textContent = `${percent}%`;
    }

    function cancelReplay() {
      replayRequest++;
      status('sim-replay-state', '');
    }

    const minutesText = value => `${value.toFixed(1)} 分`;
    const rateText = value => `${(value * 100).toFixed(1)}%`;
    function signed(value, suffix) {
      const rounded = Number(value.toFixed(1));
      return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)} ${suffix}`;
    }

    function renderComparison() {
      const sameSeed = baseline?.parameters.seed === current.parameters.seed;
      const { result } = current;
      const previous = baseline?.result;
      const metrics = [
        ['超时率', result.exceedanceRate, previous?.exceedanceRate, rateText, 100, '百分点'],
        ['P90 总时长', result.p90Minutes, previous?.p90Minutes, minutesText, 1, '分'],
        ...result.stageAverageMinutes.map((value, index) => [`${stageNames[index + 1]}平均`, value, previous?.stageAverageMinutes[index], minutesText, 1, '分']),
      ];
      $('sim-comparison').replaceChildren(...metrics.map(([label, value, reference, format, multiplier, unit]) => {
        const row = document.createElement('tr');
        const heading = document.createElement('th');
        heading.scope = 'row';
        heading.textContent = label;
        row.append(heading);
        for (const text of [format(value), previous ? format(reference) : '—', sameSeed ? signed((value - reference) * multiplier, unit) : '—']) {
          row.append(Object.assign(document.createElement('td'), { textContent: text }));
        }
        return row;
      }));
      $('sim-clear').hidden = !baseline;
      $('sim-match-seed').hidden = !baseline || sameSeed;
      const seedText = baseline ? `基准种子 ${baseline.parameters.seed} · 截止 ${baseline.parameters.deadlineMinutes} 分钟。` : '';
      $('sim-baseline-state').textContent = baseline ? `${seedText}${sameSeed ? '当前和基准共享同一批随机抽样。' : '当前种子不同，使用基准种子后可比较变化。'}` : '可把本轮设为基准，再保留种子调整工时、返工概率或截止时间。';
    }

    function exportSimulation() {
      const comparable = baseline?.parameters.seed === current.parameters.seed;
      const comparison = baseline ? { baseline: { parameters: baseline.parameters, result: baseline.result }, paired: comparable } : undefined;
      setDownload('download-simulation', { ...current, comparison });
      const columns = ['样本', '粗剪分钟', '配画分钟', '复核分钟', '累计分钟', '返工阶段数', '是否超时'];
      if (comparable) columns.push('基准累计分钟', '较基准增减分钟');
      const rows = current.trajectories.map((row, index) => {
        const total = row.cumulativeMinutes.at(-1);
        const values = [row.run, ...row.stageMinutes.map(minutes => minutes.toFixed(3)), total.toFixed(3), row.reworked.filter(Boolean).length, row.exceeded ? '是' : '否'];
        if (comparable) {
          const reference = baseline.trajectories[index].cumulativeMinutes.at(-1);
          values.push(reference.toFixed(3), (total - reference).toFixed(3));
        }
        return values.join(',');
      });
      setDownload('download-simulation-csv');
      const link = $('download-simulation-csv');
      link.href = URL.createObjectURL(new Blob(['\uFEFF', columns.join(','), '\r\n', rows.join('\r\n'), '\r\n'], { type: 'text/csv;charset=utf-8' }));
      link.hidden = false;
    }

    function simulate(parameters) {
      const { seed, deadlineMinutes, reworkProbability, baseMinutes, noiseMinutes, additionalReworkMinutes, samples } = parameters;
      const [reworkMin, reworkMax] = additionalReworkMinutes;
      const sample = rng(seed);
      const trajectories = Array.from({ length: samples }, (_, index) => {
        const cumulativeMinutes = [0];
        const reworked = [];
        for (const base of baseMinutes) {
          const noise = sample() * noiseMinutes[1];
          const rework = sample() < reworkProbability;
          const extra = reworkMin + sample() * (reworkMax - reworkMin);
          cumulativeMinutes.push(cumulativeMinutes.at(-1) + base + noise + (rework ? extra : 0));
          reworked.push(rework);
        }
        const stageMinutes = cumulativeMinutes.slice(1).map((minutes, i) => minutes - cumulativeMinutes[i]);
        return { run: index + 1, cumulativeMinutes, stageMinutes, reworked, exceeded: cumulativeMinutes.at(-1) > deadlineMinutes };
      });
      const rows = trajectories.map(row => row.cumulativeMinutes);
      const ends = rows.map(row => row.at(-1)).sort((a, b) => a - b);
      const means = [0, 1, 2, 3].map(i => rows.reduce((sum, row) => sum + row[i], 0) / rows.length);
      const over = ends.filter(time => time > deadlineMinutes).length;
      const percentile = proportion => ends[Math.ceil(proportion * ends.length) - 1];
      const p90 = percentile(.9);
      const exceedanceRate = over / ends.length;
      const buffer = Math.max(0, p90 - deadlineMinutes);
      return {
        version: 1,
        model,
        scope: '顺序执行的三个阶段按配置独立抽样。本结果用于比较给定假设，未用实际项目数据校准。',
        parameters,
        result: { averageMinutes: means[3], p50Minutes: percentile(.5), p90Minutes: p90, p95Minutes: percentile(.95), bufferP90Minutes: buffer, exceeded: over, exceedanceRate, stageAverageMinutes: means.slice(1).map((minutes, index) => minutes - means[index]) },
        stageNames,
        trajectories,
      };
    }

    function showRun(report) {
      current = report;
      const { parameters, result, trajectories } = report;
      const { seed, deadlineMinutes, reworkProbability, samples } = parameters;
      const { exceedanceRate, p90Minutes, bufferP90Minutes, exceeded, averageMinutes, stageAverageMinutes } = result;
      const cards = [['超时率', rateText(exceedanceRate)], ['P90 时长', minutesText(p90Minutes)], ['P90 缓冲', minutesText(bufferP90Minutes)]];
      $('sim-kpis').replaceChildren(...cards.map(([label, value]) => {
        const card = document.createElement('div');
        card.append(Object.assign(document.createElement('span'), { textContent: label }), Object.assign(document.createElement('strong'), { textContent: value }));
        return card;
      }));
      const [rough, broll] = stageAverageMinutes;
      draw(trajectories.map(row => row.cumulativeMinutes), [0, rough, rough + broll, averageMinutes], deadlineMinutes);
      $('sim-kpis').removeAttribute('data-stale');
      $('sim-chart').removeAttribute('data-stale');
      $('schedule-comparison').removeAttribute('data-stale');
      $('sim-pin').disabled = false;
      status('simulation-state', `种子 ${seed} · 返工概率 ${Math.round(reworkProbability * 100)}% · ${exceeded} / ${samples} 条超过 ${deadlineMinutes} 分钟`, 'success');
      renderComparison();
      exportSimulation();
    }

    function run() {
      cancelReplay();
      const parameters = parametersFromInputs();
      if (parameters) showRun(simulate(parameters));
    }

    $('sim-report-file').addEventListener('change', async event => {
      const input = event.currentTarget;
      const file = input.files[0];
      input.value = '';
      if (!file) return;
      const request = ++replayRequest;
      status('sim-replay-state', '正在读取报告。');
      try {
        if (file.size > 512 * 1024) throw Error('报告须小于或等于 512 KiB。');
        const source = await file.text();
        if (request !== replayRequest) return;
        const report = JSON.parse(source.replace(/^\uFEFF/, ''));
        if (report?.version !== 1 || report.model !== model) throw Error('请选择第 15 条导出的版本 1 排期报告。');
        const parameters = reportParameters(report.parameters);
        const reference = reportParameters(report.comparison?.baseline?.parameters);
        if (!parameters || (report.comparison !== undefined && !reference)) throw Error('报告中的方案或基准参数超出支持范围。');

        const next = simulate(parameters);
        baseline = reference ? simulate(reference) : undefined;
        applySettings(parameters);
        showRun(next);
        status('sim-replay-state', `已复算 ${sampleCount} 条轨迹${baseline ? '，并恢复报告中的基准' : ''}。`, 'success');
      } catch (error) {
        if (request !== replayRequest) return;
        status('sim-replay-state', error instanceof SyntaxError ? '无法解析排期报告 JSON。' : error.message, 'error');
      }
    });

    function invalidateSimulation() {
      cancelReplay();
      current = undefined;
      setDownload('download-simulation');
      setDownload('download-simulation-csv');
      $('sim-pin').disabled = true;
      $('sim-kpis').dataset.stale = $('sim-chart').dataset.stale = $('schedule-comparison').dataset.stale = 'true';
      status('simulation-state', '上方显示上一轮结果。重新计算以更新图表和下载。');
    }
    $('rework').oninput = () => {
      $('rate-value').textContent = `${$('rework').value}%`;
      invalidateSimulation();
    };
    for (const id of settingsIds) $(id).oninput = invalidateSimulation;
    $('sim-pin').onclick = () => {
      if (!current) return;
      cancelReplay();
      baseline = current;
      renderComparison();
      exportSimulation();
    };
    $('sim-match-seed').onclick = () => {
      if (!baseline) return;
      $('sim-seed').value = baseline.parameters.seed;
      invalidateSimulation();
      run();
    };
    $('sim-clear').onclick = () => {
      cancelReplay();
      baseline = undefined;
      if (current) {
        renderComparison();
        exportSimulation();
      } else {
        $('sim-clear').hidden = true;
        $('sim-match-seed').hidden = true;
        $('sim-comparison').replaceChildren();
        $('sim-baseline-state').textContent = '已清除基准，重新计算以更新工时对照。';
      }
    };
    $('run-sim').onclick = run;
    $('change-seed').onclick = () => {
      const seed = $('sim-seed').valueAsNumber;
      $('sim-seed').value = Number.isInteger(seed) && seed >= 1 && seed < 4294967295 ? seed + 1 : 1;
      invalidateSimulation();
      run();
    };
    const initial = parametersFromInputs();
    if (!initial) return;
    showRun(simulate(initial));
    $('sim-review-preset').onclick = () => {
      cancelReplay();
      const parameters = { ...initial, reworkProbability: .05 };
      baseline = simulate(initial);
      applySettings(parameters);
      showRun(simulate(parameters));
    };
  }
})();
