(() => {
  'use strict';

  const data = window.CAVE_DEMO || {};
  const video = document.getElementById('demo-video');
  const poster = document.getElementById('start-frame');
  const stageEmpty = document.getElementById('stage-empty');
  const stageMessage = document.getElementById('stage-message');
  const stageMessageText = document.getElementById('stage-message-text');
  const stageStatus = document.getElementById('stage-status');
  const stageCaption = document.getElementById('stage-caption');
  const reviewStage = document.getElementById('review-stage');
  const failureMessage = '动态小样暂未完成。首帧与故事已保留，可查看作品记录。';

  function plain(value) {
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }

  function localPath(value) {
    const path = plain(value).trim().replace(/\\/g, '/');
    if (!path || /^(?:[a-z]+:|\/\/|\/)/i.test(path) || path.split('/').includes('..')) return '';
    return path;
  }

  function node(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = plain(content);
    return element;
  }

  const title = plain(data.title) || '海洞里的邀请';
  const duration = Number(data.durationSeconds);
  const durationLabel = Number.isFinite(duration) && duration > 0 ? `${duration} 秒` : '8 秒';
  const posterPath = localPath(data.posterPath);
  const videoPath = localPath(data.videoPath);
  const rawPath = localPath(data.rawPath);
  const ready = data.status === 'ready' && Boolean(videoPath);
  const processing = data.status === 'processing';
  const unavailable = data.status === 'unavailable';

  document.getElementById('page-title').textContent = title;
  document.title = `${title} · ${durationLabel}动态小样`;
  video.setAttribute('aria-label', `${title}，${durationLabel}动态小样`);

  function showPoster() {
    if (!posterPath) {
      stageEmpty.hidden = false;
      stageEmpty.querySelector('p').textContent = processing ? '等待动态小样' : '首帧与故事记录已保留';
      return;
    }
    poster.src = posterPath;
    poster.hidden = false;
    stageEmpty.hidden = true;
  }

  poster.addEventListener('error', () => {
    poster.hidden = true;
    stageEmpty.hidden = false;
    stageEmpty.querySelector('p').textContent = '首帧暂未加载，可查看作品记录。';
  }, {once: true});

  if (ready) {
    stageEmpty.hidden = true;
    video.hidden = false;
    if (posterPath) video.poster = posterPath;
    video.src = videoPath;
    stageStatus.textContent = '动态小样 · 可播放';
    stageCaption.textContent = '原创 AI 动态小样 · 完整竖屏画幅';
    reviewStage.textContent = '成片记录';
    const download = document.getElementById('download-video');
    download.href = videoPath;
    download.download = videoPath.split('/').pop() || 'cave-welcome-8s.mp4';
    document.getElementById('open-video').href = videoPath;
    if (rawPath && rawPath !== videoPath) {
      const raw = document.getElementById('open-raw');
      raw.href = rawPath;
      raw.hidden = false;
    }
    document.getElementById('media-actions').hidden = false;
  } else {
    showPoster();
    stageStatus.textContent = unavailable ? '尚未取得视频结果' : processing ? '动态小样生成中' : data.status === 'failed' ? '本次小样未完成' : '作品状态待更新';
    stageMessage.hidden = false;
    stageMessageText.textContent = unavailable ? '截至最近核对尚未取得视频，当前展示首帧参考；旧的“生成中”记录不代表已经完成。' : processing ? '动态小样生成中，当前展示首帧参考。' : data.status === 'failed' ? failureMessage : '作品状态尚未就绪，当前展示已有参考。';
    stageCaption.textContent = '首帧参考 · 动态视频尚未就绪';
    document.getElementById('pending-actions').hidden = false;
    reviewStage.textContent = unavailable ? '核对记录' : processing ? '等待成片' : '待更新';
  }

  const notes = Array.isArray(data.reviewNotes) ? data.reviewNotes.filter(note => typeof note === 'string' && note.trim()) : [];
  if (notes.length) {
    const list = document.getElementById('review-notes');
    for (const note of notes) list.append(node('li', '', note));
    list.hidden = false;
    document.getElementById('review-empty').hidden = true;
  }

  const metadata = document.getElementById('production-meta');
  function addMeta(label, value) {
    if (!value) return;
    const row = node('div');
    row.append(node('dt', '', label), node('dd', '', value));
    metadata.append(row);
  }
  addMeta(ready ? '时长' : '目标时长', durationLabel);
  addMeta('模型', plain(data.model));
  if (typeof data.actualCredits === 'number' && Number.isFinite(data.actualCredits) && data.actualCredits >= 0) {
    addMeta('本次积分', String(data.actualCredits));
  }

  document.getElementById('refresh-status').addEventListener('click', () => window.location.reload());
  video.addEventListener('error', () => {
    const message = document.getElementById('playback-error');
    message.textContent = '当前播放器暂时无法读取视频。可使用“打开视频”查看原文件，或查看作品记录。';
    message.hidden = false;
  });
})();
