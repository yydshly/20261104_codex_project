"""Render static third-round evidence; pending tasks are never shown as results."""
from pathlib import Path
from html import escape as esc
import json
ROOT=Path(__file__).resolve().parent
RUN=ROOT/'ai-video-validation/run-20261115-v3'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def media(path,poster,label):return f'<video controls muted playsinline preload="metadata" src="{esc(path)}" poster="{esc(poster)}" aria-label="{esc(label)}"></video>'
def probe_card(key):
    name='茶器探针' if key=='teapot' else '山水迁移'
    report=ROOT/f'assets/ai-video/{key}-v3-validation.json'
    if report.exists() and load(report).get('visual_review_status')=='reviewed':
        r=load(report);rows=''.join(f'<li><strong>{esc(c["name"])}</strong><span class="r3-check {esc(c["status"])}">{esc(c["label"])}</span><p>{esc(c["observation"])}</p></li>' for c in r['criteria'])
        return f'''<article class="r3-probe-card"><div><span class="label">第三轮 · 原生 AI 原片 / {name}</span>{media(r['video'],f'assets/ai-video/{key}-v3-poster.jpg',name+'第三轮原片')}<p class="quiet-note">Seedance 2.0 · 单图参考 · {r['width']}×{r['height']} · {r['duration']:.2f}秒 · {int(r['actual_credits'])}积分</p></div><div><h3>{esc(r['verdict'])}</h3><p>{esc(r['summary'])}</p><ul class="r3-criteria">{rows}</ul><div class="ai-asset-links"><a href="{r['video']}" download>下载第三轮原片 ↓</a><a href="assets/ai-video/{key}-v3-validation.json" download>原片验收记录 ↓</a><a href="prompts/ai-{key}-v3.txt" download>准确提交指令 ↓</a></div><button class="text-link" data-zoom="{r['filmstrip']}" data-caption="{name} · 第三轮原片25帧时间序列">查看25帧对照 ↗</button></div></article>'''
    state=RUN/key/'state.json'
    message='正在等待原任务返回，尚未评价成片。' if state.exists() else '等待茶器通过全部门槛后再提交；当前尚未生成。'
    if state.exists() and load(state).get('status')=='failed':message='服务端任务失败，尚无可验收原片；此处不把输入图或交付校正版作为原生生成结果。'
    if key=='landscape' and (RUN/'phase-gate.json').exists() and not load(RUN/'phase-gate.json').get('all_raw_output_gates_passed'):
        message='茶器原片未通过全部门槛，按确认方案停止追加生成；本轮未提交山水 AI 任务。'
    return f'<article class="r3-waiting"><span class="label">第三轮 · {name}</span><p>{message}</p></article>'
def main():
    plan=load(RUN/'plan.json');assert plan['user_confirmed']
    spent=0;known_cost=False
    for key in ['teapot','landscape']:
        p=RUN/key/'state.json'
        if p.exists():
            value=load(p).get('actual_credits')
            try:spent+=int(value);known_cost=True
            except (ValueError,TypeError):pass
    gate=load(RUN/'phase-gate.json') if (RUN/'phase-gate.json').exists() else None
    phase_note=('茶器未通过全部原生门槛，山水未追加生成。' if gate and not gate.get('all_raw_output_gates_passed') else '先验茶器，只有全部原生门槛通过后才生成山水。')
    cost_note=f'本轮 AI 已返回的实际消耗为 {spent} 积分' if known_cost else '茶器探针处理中，预计90积分，实际计费尚未返回'
    parts=[f'''<section class="section round3-section" id="round3" aria-labelledby="round3-title"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">04B / THIRD ROUND & DELIVERY</p><h2 id="round3-title">把原生结果，与交付修正都看清。</h2></div><p>保留第二轮已有的运动，<br>另行验证新生成路径的光色与声音。</p></div><p class="ai-generation-status">{cost_note}；两段本地校正交付均为0积分。{phase_note}</p><div class="r3-probes">{probe_card('teapot')}{probe_card('landscape')}</div><div class="r3-delivery-heading"><span class="label">第二轮 · 本地后处理交付</span><h3>运动保留，明暗重新匹配。</h3><p>下方视频把同一时间点并排呈现：左侧是第二轮原片，右侧是曝光匹配与去音轨交付版。后处理结果单独记录，原生 AI 的验收结论保留。</p></div><div class="r3-delivery-grid">''']
    for key in ['landscape','teapot']:
        name='山水' if key=='landscape' else '茶器';r=load(ROOT/f'assets/ai-video/{key}-v2-exposure-matched.json');assert r['visual_review_status']=='reviewed'
        variability=r['worst_all_tested_region_brightness_range_fraction']*100
        poster=f'assets/ai-video/{key}-v2-exposure-compare.jpg'
        parts.append(f'''<article class="r3-delivery-card"><div class="r3-card-title"><h4>{name} · 第二轮曝光校正版</h4><span>后处理 / 0积分</span></div>{media(r['comparison_video'],poster,name+'第二轮原片与曝光匹配交付版同步并排视频')}<p>10个已测背景与结构区域的最大亮度波动约 {variability:.1f}%；无音轨，{r['decoded_frames']}帧、{r['fps']:.0f}fps、{r['duration']:.2f}秒。对照包含未参与拟合的留出区域。</p><p class="quiet-note">{esc(r['visual_observations'])}</p><div class="ai-asset-links"><a href="{r['video']}" download>下载曝光匹配交付版 ↓</a><a href="{r['source']}" download>第二轮原片 ↓</a><a href="assets/ai-video/{key}-v2-exposure-matched.json" download>校正验证记录 ↓</a></div><div class="ai-evidence-links"><button data-zoom="{r['comparison']}" data-caption="{name} · 原片与曝光匹配版五时点对照">放大时间对照 ↗</button><button data-zoom="{r['motion_detail']}" data-caption="{name} · 同时点船位或蒸汽局部对照">放大运动细节 ↗</button></div></article>''')
    parts.append('''</div><details class="r3-diagnosis"><summary>查看排查依据与边界</summary><p>已有上传 PNG 与本地原件逐字节一致；返回视频的亮度通道在开场已下降，两条解码路径测量一致。第二轮实际送出整数0，第三轮改测单图参考路径与布尔false；这是路径探针，不能据此预先判定网关内部映射或模型原生问题已修复。</p><p>校正版逐帧匹配开场明暗并去除音轨，未做空间变形或时间重排；颜色校正涉及重新编码，原件与后处理文件分别保留。它不替代原生无声或曝光验收。</p><a href="reports/round3-diagnostics/diagnosis.json" download>下载排查记录 ↓</a></details><p class="ai-study-limit">每个路径只做一份样本，未知随机种子。第三轮同时改变参考路径与声音值类型，不能单独归因，也不能据单次结果推广稳定成功率。</p></div></section>''')
    fragment='\n'.join(parts)
    p=ROOT/'index.html';s=p.read_text(encoding='utf-8');start='<!-- ROUND3-START -->';end='<!-- ROUND3-END -->'
    if start in s:s=s[:s.index(start)]+start+'\n'+fragment+'\n'+end+s[s.index(end)+len(end):]
    else:
        needle='<section class="section wrap" id="motion"';assert s.count(needle)==1
        s=s.replace(needle,start+'\n'+fragment+'\n'+end+'\n'+needle,1)
    if 'href="round3.css"' not in s:s=s.replace('</head>','<link rel="stylesheet" href="round3.css">\n</head>',1)
    s=s.replace('<a class="header-action" href="#ai-validation">看动态对比','<a class="header-action" href="#round3">看第三轮')
    p.write_text(s,encoding='utf-8',newline='\n')
    print('Rendered truthful third-round status and two reviewed local deliveries.')
if __name__=='__main__':main()
