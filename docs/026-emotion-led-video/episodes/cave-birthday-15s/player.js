(() => {
  'use strict';
  const data = window.CAVE_DEMO || {};
  const byId = id => document.getElementById(id);
  const video = byId('demo-video');
  const poster = byId('start-frame');
  const empty = byId('stage-empty');
  const status = byId('stage-status');
  const caption = byId('stage-caption');
  const plain = value => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  function localPath(value) {
    const path = plain(value).trim().replace(/\\/g, '/');
    return !path || /^(?:[a-z]+:|\/\/|\/)/i.test(path) || path.split('/').includes('..') ? '' : path;
  }
  function element(tag, content) {
    const node = document.createElement(tag);
    if (content !== undefined) node.textContent = plain(content);
    return node;
  }
  const title = plain(data.title) || '最后一单，收件人是你';
  const duration = Number(data.durationSeconds);
  const durationLabel = Number.isFinite(duration) && duration > 0 ? `${duration} 秒` : '15 秒';
  const videoPath = localPath(data.videoPath);
  const posterPath = localPath(data.posterPath);
  const ready = data.status === 'ready' && Boolean(videoPath);
  byId('page-title').textContent = title;
  byId('player-heading').textContent = `${durationLabel}故事版`;
  document.title = `${title} · ${durationLabel}故事版`;
  video.setAttribute('aria-label', `${title}，${durationLabel}故事版`);

  if (ready) {
    empty.hidden = true;
    video.hidden = false;
    if (posterPath) video.poster = posterPath;
    video.src = videoPath;
    status.textContent = '故事版 · 可播放';
    caption.textContent = '原创 AI 剧情 · 完整竖屏画幅';
    byId('download-video').href = videoPath;
    byId('download-video').download = videoPath.split('/').pop() || 'cave-birthday-15s-v1.mp4';
    byId('open-video').href = videoPath;
    byId('media-actions').hidden = false;
  } else {
    const failed = data.status === 'failed';
    status.textContent = failed ? '本次制作尚未完成' : '故事版制作中';
    empty.querySelector('p').textContent = failed ? '新版视频尚未完成' : '15秒故事版制作中';
    if (posterPath) {
      poster.src = posterPath;
      poster.hidden = false;
      empty.hidden = true;
    }
    byId('stage-message').hidden = false;
    byId('stage-message-text').textContent = failed ? (plain(data.failureReason) || '新版视频尚未完成，当前展示场景参考图。') : '15秒故事版正在制作，当前展示场景参考图。';
    caption.textContent = '场景参考 · 新版视频尚未就绪';
    byId('pending-actions').hidden = false;
  }

  poster.addEventListener('error', () => {
    poster.hidden = true;
    empty.hidden = false;
    empty.querySelector('p').textContent = '场景参考暂未加载，新版视频尚未就绪。';
  }, {once:true});

  const metadata = byId('production-meta');
  function addMeta(label, value) {
    if (!value) return;
    const row = element('div');
    row.append(element('dt', label), element('dd', value));
    metadata.append(row);
  }
  addMeta(ready ? '时长' : '目标时长', durationLabel);
  addMeta(ready ? '模型' : '制作模型', plain(data.model));
  addMeta(ready ? '分辨率' : '制作规格', plain(data.resolution));
  addMeta('画幅', plain(data.aspectRatio));
  if (typeof data.actualCredits === 'number' && Number.isFinite(data.actualCredits) && data.actualCredits >= 0) addMeta('实际积分', String(data.actualCredits));
  const notes = Array.isArray(data.reviewNotes) ? data.reviewNotes.filter(note => typeof note === 'string' && note.trim()) : [];
  if (ready && notes.length) {
    for (const note of notes) byId('review-notes').append(element('li', note));
    byId('review-section').hidden = false;
  }
  byId('refresh-status').addEventListener('click', () => window.location.reload());
  video.addEventListener('error', () => {
    status.textContent = '视频暂未成功读取';
    byId('playback-error').textContent = '播放器暂时无法读取这段视频。可点击“打开视频”查看文件。';
    byId('playback-error').hidden = false;
  });
})();
