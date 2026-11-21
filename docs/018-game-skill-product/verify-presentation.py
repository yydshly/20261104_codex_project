"""Check the comparison, actual media, model viewer and responsive presentation."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent
report={'checks':[],'errors':[],'failedResponses':[]}
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.on('pageerror',lambda error:report['errors'].append(str(error)))
    page.on('response',lambda response:report['failedResponses'].append({'url':response.url,'status':response.status}) if response.status>=400 else None)
    page.goto('http://127.0.0.1:5267/research.html')
    page.wait_for_function('document.querySelector("#verified").textContent==="56 项"')
    report['checks'].append('all evidence loads; 56 game checks displayed')
    page.locator('#comparison-slider').fill('20')
    assert page.locator('#compare-line').evaluate('e=>e.style.left')=='20%'
    report['checks'].append('comparison slider updates clip and divider')
    page.screenshot(path=str(ROOT/'evidence/v2/research-desktop.png'),full_page=True)
    page.locator('audio').first.evaluate('async e=>{await e.play();await new Promise(r=>setTimeout(r,60));e.pause()}')
    report['checks'].append('audio example decodes and plays')
    page.locator('video').evaluate('async e=>{e.muted=true;await e.play();await new Promise(r=>setTimeout(r,150));e.pause()}')
    report['checks'].append('game video decodes and plays')
    page.goto('http://127.0.0.1:5267/gallery.html')
    page.wait_for_function('document.querySelector("#model-stats").textContent.includes("974")')
    for name,count in [('guardian','1,094'),('cannon','496'),('beacon','1,198')]:
        page.locator(f'[data-model="{name}"]').click()
        page.wait_for_function('(text)=>document.querySelector("#model-stats").textContent.includes(text)',arg=count)
    report['checks'].append('four actual GLBs render and report geometry counts')
    page.screenshot(path=str(ROOT/'evidence/v2/gallery-models.png'))
    page.locator('[data-vfx="impact"]').click();page.locator('#vfx-frame').fill('12')
    assert page.locator('#frame-label').inner_text()=='13 / 24'
    report['checks'].append('VFX atlas selection and frame scrub work')
    page.locator('#sound-select').select_option('pulse')
    page.wait_for_function('document.querySelector("#sound-player").src.endsWith("sfx-pulse.wav")')
    report['checks'].append('sound selection changes actual WAV')
    page.set_viewport_size({'width':390,'height':844})
    page.goto('http://127.0.0.1:5267/research.html')
    page.wait_for_function('document.querySelector("#verified").textContent==="56 项"')
    assert page.evaluate('document.documentElement.scrollWidth===innerWidth')
    page.screenshot(path=str(ROOT/'evidence/v2/research-phone.png'),full_page=True)
    report['checks'].append('research fits 390px phone')
    page.goto('http://127.0.0.1:5267/gallery.html')
    page.wait_for_function('document.querySelector("#model-stats").textContent.includes("974")')
    assert page.evaluate('document.documentElement.scrollWidth===innerWidth')
    report['checks'].append('gallery fits 390px phone')
    browser.close()
assert not report['errors'],report['errors']
assert not report['failedResponses'],report['failedResponses']
(ROOT/'evidence/v2/presentation-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps(report,ensure_ascii=False))
