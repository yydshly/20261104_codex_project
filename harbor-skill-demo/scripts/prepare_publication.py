"""Apply publication provenance without changing the retained research guide."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOTE = '<aside class="publication-note"><strong>公开研究版</strong><p>引导图沿用原研究图，图中“本机评估”是当时状态。发布核验已确认海面模块为 MIT；无许可证声明的 asset-maker 工具包、复制模板与 Skill 全文不随包分发。游戏使用现有生成资源，<a href="THIRD-PARTY-NOTICES.md">发布范围与许可说明</a>可核对。</p></aside>'
RIGHTS = '海面模块现已核对为 MIT，许可证随运行时保留。asset-maker 未找到仓库许可证声明，其工具包、复制模板与上游 Skill 全文不随公开包分发；网页提供来源、版本与指纹。生成资源与项目编写的代码、配方保留，详见 THIRD-PARTY-NOTICES.md。'

def prepare():
    p=ROOT/'research.html';s=p.read_text('utf-8')
    if 'class="publication-note"' not in s:s=s.replace('<main>', '<main>'+NOTE, 1)
    s=s.replace('本页是研究回顾，未运行的同模型独立对照会明确标记。','本页是公开研究回顾，未运行的同模型独立对照会明确标记。')
    s=s.replace('2240 × 4480 · 所有截图来自现有游戏 · 原始记录截至 2026-11-21 · 未填写尚未测得的效率或偏好分数。','2240 × 4480 · 原图保持不变 · 研究记录截至 2026-11-21 · 图中发布状态为历史记录，当前范围见上方发布说明。')
    s=s.replace('asset-maker 未找到许可证声明，海面模块的再分发授权未在本轮确认。当前交付供本机评估；公开分发与商业采用前需确认适用授权。本轮未公开发布游戏。Three.js 的 MIT 许可证保存在 vendor/LICENSE。', RIGHTS)
    s=s.replace('来源已固定到 commit 并保存 SHA-256。asset-maker 未找到许可证声明，水面模块的再分发授权也未在本轮确认；本交付供本机评估，公开发布与商业采用前需要确认上游授权。','来源已固定到 commit 并保存 SHA-256。公开包不分发未声明许可的工具包与上游全文；Three.js 与海面模块按 MIT 保留许可。生成图中记录的是发布核验前的研究状态。')
    s=s.replace('读取四项固定版本…','读取四项固定版本…')
    s=s.replace('研究回顾 · 证据截至 2026-11-21 · 本机评估','公开研究回顾 · 证据截至 2026-11-21 · 发布范围见许可说明')
    p.write_text(s,'utf-8')
    for name in ['research.js','research-v1.js','research-v2.js']:
        p=ROOT/name;s=p.read_text('utf-8')
        s=s.replace("link('本轮原文快照', source.snapshot)","link('来源与已记录指纹', 'skill-sources/v2/manifest.json')")
        s=s.replace("link('快照', source.snapshot)","link('来源清单', 'skill-sources/manifest.json')")
        s=s.replace('source?.snapshot','source?.source').replace('source.snapshot','source.source')
        s=s.replace('下载快照','上游原文').replace('本轮原文快照','上游原文')
        p.write_text(s,'utf-8')
    for name in ['research-v1.html','research-v2.html']:
        p=ROOT/name;s=p.read_text('utf-8')
        if 'class="publication-note"' not in s:s=s.replace('<main', '<main',1).replace('<main>','<main>'+NOTE,1).replace('<main id="top">','<main id="top">'+NOTE,1)
        p.write_text(s,'utf-8')

if __name__=='__main__':
    prepare();print('Publication notes prepared; retained guide unchanged.')
