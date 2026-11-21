(() => {
  const materials = [
    {
      id: '01',
      title: '拼贴 GIF',
      source: 'https://openai.com/index/introducing-images-2-6/',
      sourceName: 'OpenAI · Images 2.6 发布说明',
      notes: ['Images 2.6 可以生成 GIF。'],
      draft: {
        summary: 'Images 2.6 可以生成 GIF。对于只需表达一个短动作的口播辅助画面，可以先尝试 GIF。',
        evidence: 'Images 2.6 可以生成 GIF。',
      },
    },
    {
      id: '09',
      title: '可听日报',
      source: 'https://github.com/monoradio102/myradio',
      sourceName: 'myradio · 项目说明',
      notes: ['向仓库提供台本和音频，网页据此播放节目。'],
      draft: {
        summary: '把台本推送到 GitHub 后，myradio 会自动为它生成旁白。',
        evidence: '只提交台本，仓库会生成旁白。',
      },
      correction: {
        summary: 'myradio 用已准备的台本和音频组装节目。可以先做好朗读素材，再让网页按时间轴播放。',
        evidence: '向仓库提供台本和音频，网页据此播放节目。',
      },
    },
    {
      id: '10',
      title: '互动网页课',
      source: 'https://github.com/DozenTwelve/Papermorph',
      sourceName: 'Papermorph · 项目说明',
      notes: ['静态网页课程可以包含旁白、动态图解和交互练习。'],
      draft: {
        summary: 'Papermorph 的静态课程可以包含旁白、动态图解和交互练习。一个概念可以先讲，再让学习者动手验证。',
        evidence: '静态网页课程可以包含旁白、动态图解和交互练习。',
      },
    },
  ];

  const nodes = Object.fromEntries([
    'policy', 'records', 'check-all', 'fix', 'retry', 'reset', 'status', 'assemble',
    'brief-body', 'chapters', 'chapter', 'speak', 'stop', 'audio-status', 'chapter-audio', 'record-template',
  ].map(id => [id, document.getElementById(id)]));

  const state = materials.map(material => ({ ...material, checks: 0, assessment: null }));
  const cards = state.map(record => {
    const card = nodes['record-template'].content.firstElementChild.cloneNode(true);
    card.querySelector('.record-number').textContent = `#${record.id}`;
    card.querySelector('h3').textContent = record.title;
    const sourceLink = card.querySelector('.record-source');
    sourceLink.href = record.source;
    sourceLink.textContent = `${record.sourceName} ↗`;
    nodes.records.append(card);
    return card;
  });

  let activeChapter = 0;
  const audio = nodes['chapter-audio'];

  function normalizeEvidence(value) {
    return value.normalize('NFKC').replace(/\s+/g, ' ').trim();
  }

  function validate(record, policy) {
    let parsed;
    try {
      parsed = new URL(record.source);
    } catch {
      return { passed: false, reason: '来源网址无法解析。' };
    }
    if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password) {
      return { passed: false, reason: '来源须是有效的 HTTPS 链接。' };
    }
    if (policy === 'links') {
      return { passed: true, reason: '链接格式通过，证据句尚未核对。' };
    }
    const evidence = normalizeEvidence(record.draft.evidence);
    const matches = evidence && record.notes.some(note => normalizeEvidence(note) === evidence);
    return matches
      ? { passed: true, reason: '证据句与本地来源摘记匹配。' }
      : { passed: false, reason: '这句证据在来源摘记中没有对应项，请检查是否夸大了自动化范围。' };
  }

  function currentAssessment(record) {
    return record.assessment?.policy === nodes.policy.value && record.assessment.draft === record.draft;
  }

  function failureRecords() {
    return state.filter(record => record.assessment?.policy === nodes.policy.value && !record.assessment.passed);
  }

  function render() {
    state.forEach((record, index) => {
      const card = cards[index];
      const assessment = record.assessment;
      const current = currentAssessment(record);
      card.dataset.state = !assessment ? 'pending' : !current ? 'stale' : assessment.passed ? 'passed' : 'failed';
      card.querySelector('.record-state').textContent = !assessment ? '待检查'
        : !current ? '待重检' : !assessment.passed ? '未通过'
          : assessment.policy === 'links' ? '格式通过' : '已通过';
      card.querySelector('.draft').textContent = record.draft.summary;
      card.querySelector('.checks').textContent = `检查 ${record.checks} 次`;
      card.querySelector('.evidence').textContent = record.draft.evidence;
      card.querySelector('.note').textContent = record.notes.join(' ');
      card.querySelector('.reason').textContent = !assessment ? '尚未运行检查。'
        : !current ? '样稿或规则已变更，需重新检查。' : assessment.reason;
    });

    const failures = failureRecords();
    nodes.fix.disabled = !failures.some(record => record.correction && record.draft !== record.correction);
    nodes.retry.disabled = failures.length === 0;
    nodes.assemble.disabled = nodes.policy.value !== 'strict'
      || !state.every(record => currentAssessment(record) && record.assessment.passed);
  }

  function stopSpeech(message = '已附对应章节的中文朗读音频。') {
    audio.pause();
    if (audio.readyState) audio.currentTime = 0;
    nodes.stop.disabled = true;
    nodes['audio-status'].textContent = message;
  }

  function invalidateBrief() {
    stopSpeech();
    nodes['brief-body'].hidden = true;
  }

  function runChecks(records) {
    invalidateBrief();
    const policy = nodes.policy.value;
    for (const record of records) {
      record.checks += 1;
      record.assessment = { ...validate(record, policy), policy, draft: record.draft };
      if (!record.assessment.passed) cards[state.indexOf(record)].querySelector('details').open = true;
    }
    const passed = records.filter(record => record.assessment.passed).length;
    const kept = state.length - records.length;
    nodes.status.textContent = `本轮检查 ${records.length} 条，${passed} 条通过，${records.length - passed} 条未通过。`
      + (kept ? `其余 ${kept} 条的检查结果与次数保持不变。` : '')
      + (policy === 'links' ? '本轮只检查了链接格式。' : '');
    render();
  }

  function showChapter(index) {
    stopSpeech();
    activeChapter = index;
    const record = state[index];
    for (const [buttonIndex, button] of [...nodes.chapters.children].entries()) {
      button.setAttribute('aria-pressed', String(buttonIndex === index));
    }
    const heading = document.createElement('h3');
    heading.textContent = record.title;
    const copy = document.createElement('p');
    copy.textContent = record.draft.summary;
    const sourceLink = document.createElement('a');
    sourceLink.href = record.source;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    sourceLink.textContent = `${record.sourceName} ↗`;
    nodes.chapter.replaceChildren(heading, copy, sourceLink);
  }

  nodes['check-all'].addEventListener('click', () => runChecks(state));
  nodes.retry.addEventListener('click', () => runChecks(failureRecords()));
  nodes.fix.addEventListener('click', () => {
    const records = failureRecords().filter(record => record.correction && record.draft !== record.correction);
    for (const record of records) record.draft = record.correction;
    nodes.status.textContent = `已按来源摘记修正 ${records.length} 条样稿。可以只重跑失败项。`;
    render();
  });
  nodes.policy.addEventListener('change', () => {
    invalidateBrief();
    nodes.status.textContent = '已切换规则。重新检查全部，可比较两套规则的结果。';
    render();
  });
  nodes.reset.addEventListener('click', () => {
    for (const [index, record] of state.entries()) {
      record.checks = 0;
      record.assessment = null;
      record.draft = materials[index].draft;
      cards[index].querySelector('details').open = false;
    }
    nodes.policy.value = 'strict';
    invalidateBrief();
    nodes.status.textContent = '已恢复初始样稿。待运行。';
    render();
  });

  nodes.assemble.addEventListener('click', () => {
    const buttons = state.map((record, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${index + 1} · ${record.title}`;
      button.addEventListener('click', () => showChapter(index));
      return button;
    });
    nodes.chapters.replaceChildren(...buttons);
    nodes['brief-body'].hidden = false;
    showChapter(0);
    nodes.status.textContent = '已组装三章本地简报，可以逐章阅读、朗读和回查来源。';
  });

  nodes.speak.addEventListener('click', () => {
    stopSpeech();
    const record = state[activeChapter];
    audio.src = `media/brief-${record.id}.wav`;
    nodes.stop.disabled = false;
    nodes['audio-status'].textContent = `正在朗读「${record.title}」。`;
    audio.play().catch(error => {
      if (error.name !== 'AbortError') stopSpeech('未能加载朗读音频，仍可查看文字。');
    });
  });
  audio.addEventListener('ended', () => stopSpeech('本章朗读完毕。'));
  nodes.stop.addEventListener('click', () => stopSpeech('已停止朗读。'));
  window.addEventListener('pagehide', () => stopSpeech());

  render();
})();
