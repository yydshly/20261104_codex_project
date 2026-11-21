(() => {
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };

  async function readFile(path, json = false) {
    const response = await fetch(path);
    if (!response.ok) throw Error('无法读取 ' + path);
    return json ? response.json() : response.text();
  }

  function table(headers, rows) {
    const result = element('table');
    const head = element('tr');
    for (const text of headers) {
      const cell = element('th', text);
      cell.scope = 'col';
      head.append(cell);
    }
    const heading = element('thead');
    heading.append(head);
    const body = element('tbody');
    for (const cells of rows) {
      const row = element('tr');
      for (const text of cells) row.append(element('td', String(text)));
      body.append(row);
    }
    result.append(heading, body);
    return result;
  }

  async function renderRecord(item, target) {
    target.classList.add('review-record');
    if (!item.preview.file.endsWith('.json')) {
      target.append(element('pre', await readFile(item.preview.file)));
      return;
    }
    const record = await readFile(item.preview.file, true);
    if (item.id === '08') {
      target.append(element('h3', '本轮八种配置'));
      target.append(table(['规则', '正确', '误放', '误拦'], record.search.runs.map(run => [
        run.rules.map(rule => rule.name).join('、') || '只查来源',
        run.totals.correct + ' / ' + run.totals.samples, run.totals.falseAccept, run.totals.falseReject,
      ])));
    } else if (item.id === '11') {
      target.append(element('h3', '已发布 · 版本 ' + record.current.revision),
        element('blockquote', record.current.summary),
        element('p', '批准依据 · ' + record.current.approval.comment));
    } else if (item.id === '12') {
      target.append(element('h3', record.delivery.title),
        element('blockquote', record.evidence.checkedQuote),
        element('p', record.delivery.use),
        element('p', '引文匹配通过 · ' + record.template.stages.length + ' 个交接环节'));
    } else if (item.id === '13') {
      target.append(element('h3', record.entries.length + ' 条已保存笔记'));
      const list = element('ul');
      for (const note of record.entries) {
        list.append(element('li', note.title + (note.review ? ' · 附原文行号与复核意见' : ' · 附原始来源')));
      }
      target.append(list, element('p', '本轮已验证刷新恢复、第二窗口回查和双窗同时新增。'));
    } else if (item.id === '14') {
      target.append(element('h3', '引文位于第 ' + record.selectedLocation.startLine + ' 行'),
        element('blockquote', record.quote),
        element('p', '人工复核 · ' + (record.reviewStatus === 'supported' ? '支持结论' : '待复核')),
        element('p', record.reviewNote));
    } else if (item.id === '15') {
      const baseline = record.comparison.baseline;
      const oldResult = baseline.result;
      const current = record.result;
      const percent = value => (value * 100).toFixed(1) + '%';
      target.append(element('h3', '同一批 240 次抽样'),
        table(['结果', '基准', '当前'], [
          ['返工概率', percent(baseline.parameters.reworkProbability), percent(record.parameters.reworkProbability)],
          ['超时率', percent(oldResult.exceedanceRate), percent(current.exceedanceRate)],
          ['超过 24 分钟', oldResult.exceeded + ' 条', current.exceeded + ' 条'],
          ['P90 时长', oldResult.p90Minutes.toFixed(1) + ' 分', current.p90Minutes.toFixed(1) + ' 分'],
        ]));
    }
  }

  async function renderPreview(item, target) {
    const preview = item.preview;
    if (preview.type === 'record') {
      await renderRecord(item, target);
    } else if (preview.type === 'portraits') {
      target.classList.add('review-portraits');
      preview.files.forEach((file, index) => {
        const figure = element('figure');
        const image = element('img');
        image.src = file;
        image.alt = preview.labels[index];
        image.loading = 'lazy';
        figure.append(image, element('figcaption', preview.labels[index]));
        target.append(figure);
      });
    } else if (preview.type === 'image') {
      const image = element('img');
      image.src = preview.file;
      image.alt = preview.alt;
      image.loading = 'lazy';
      target.append(image);
    } else {
      if (preview.type === 'audio') {
        const cover = element('img');
        cover.src = preview.poster;
        cover.alt = item.title + '节目封面';
        cover.loading = 'lazy';
        target.append(cover);
      }
      const media = element(preview.type);
      media.src = preview.file;
      media.controls = true;
      media.preload = 'none';
      media.setAttribute('aria-label', item.title + '验收成品');
      if (preview.type === 'video') {
        media.poster = preview.poster;
        media.playsInline = true;
      }
      target.append(media);
    }
  }

  function renderCard(item) {
    const details = element('details', undefined, 'review-card');
    details.id = 'check-' + item.id;
    const summary = element('summary');
    const name = element('div', undefined, 'review-name');
    name.append(element('h2', item.title), element('p', item.implementation));
    summary.append(element('span', item.id, 'review-number'), name, element('span', item.status, 'review-badge'));
    const body = element('div', undefined, 'review-body');
    const preview = element('div', undefined, 'review-preview');
    const copy = element('div', undefined, 'review-copy');
    const actions = element('div', undefined, 'review-actions');
    const open = element('a', '打开工作台 ↗', 'review-open');
    open.href = item.path;
    actions.append(open);
    for (const output of item.outputs) {
      const anchor = element('a', output.label + ' ↓');
      anchor.href = output.file;
      anchor.download = '';
      actions.append(anchor);
    }
    copy.append(element('p', item.checked), element('p', item.limit, 'review-limit'), actions);
    body.append(preview, copy);
    details.append(summary, body);
    let loaded = false;
    details.addEventListener('toggle', async () => {
      if (!details.open) {
        for (const media of preview.querySelectorAll('video,audio')) media.pause();
        return;
      }
      if (loaded) return;
      loaded = true;
      preview.replaceChildren();
      try {
        await renderPreview(item, preview);
      } catch (error) {
        loaded = false;
        preview.replaceChildren(element('p', error.message, 'review-record'));
      }
    });
    return details;
  }

  function revealHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target?.classList.contains('review-card')) return;
    target.open = true;
    target.scrollIntoView({ block: 'start' });
  }

  async function start() {
    const error = document.getElementById('review-error');
    try {
      const report = await readFile('acceptance-data.json', true);
      const summary = document.getElementById('review-summary');
      const mediaCount = report.cases.filter(item => item.kind === 'media').length;
      for (const [count, text] of [[report.cases.length, '条已逐项打开复核'], [mediaCount, '项有媒体成品'], [report.cases.length - mediaCount, '项可操作并导出']]) {
        const metric = element('div');
        metric.append(element('strong', String(count)), element('span', text));
        summary.append(metric);
      }
      const index = document.getElementById('review-index');
      const list = document.getElementById('review-list');
      for (const item of report.cases) {
        const link = element('a', item.id);
        link.href = '#check-' + item.id;
        link.setAttribute('aria-label', item.id + ' ' + item.title);
        index.append(link);
        list.append(renderCard(item));
      }
      error.hidden = true;
      if (location.hash) revealHash();
      else list.firstElementChild.open = true;
      window.addEventListener('hashchange', revealHash);
    } catch (failure) {
      error.textContent = '验收记录载入失败，请刷新页面。' + failure.message;
    }
  }
  start();
})();
