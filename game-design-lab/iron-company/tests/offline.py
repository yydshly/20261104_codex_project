"""Validate the exact standalone file over localhost with all asset requests denied."""
import json,re,hashlib,math
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.runtime/qa';OUT.mkdir(parents=True,exist_ok=True)
checks=[];errors=[];blocked=[]
source=(ROOT/'offline.html').read_text('utf-8')
assert not re.search(r'^import\s',source,re.M)
assert '<link rel="stylesheet"' not in source and 'src="./app.js"' not in source
assert source.count('data:image/png;base64,')>=4
checks.append('all four painted atlases, modules and CSS are embedded')
assert (ROOT/'offline.html').read_bytes()==(ROOT.parents[1]/'docs/014-game-design-lab/iron-company/offline.html').read_bytes()
checks.append('archived standalone game matches its static packaged copy')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':1280,'height':720},accept_downloads=True)
 def route(r):
  if r.request.resource_type=='document':r.continue_()
  else:blocked.append(r.request.url);r.abort()
 page.route('http://**/*',route);page.route('https://**/*',route);page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:5215/offline.html');expect(page.locator('#launch')).to_be_enabled();page.wait_for_timeout(500)
 checks.append('standalone preparation initializes with network assets blocked')
 page.locator('#launch').click();expect(page.locator('#game')).to_have_attribute('data-phase','battle');page.wait_for_timeout(200)
 box=page.locator('#battlefield').bounding_box();scale=min((box['width']-20)/980,(box['height']-24)/550);ox=(box['width']-980*scale)/2;oy=(box['height']-550*scale)/2
 page.locator('#battlefield').click(position={'x':ox+(65+math.sqrt(3)*34*3)*scale,'y':oy+(80+34*1.5*4*.8)*scale})
 saved=page.evaluate('JSON.parse(localStorage.getItem("grey-banner-blackwater-v1"))');mira=next(u for u in saved['units'] if u['id']=='mira');assert mira['q']==3 and mira['r']==4 and mira['ap']==7
 checks.append('bundled canvas movement consumes real AP')
 page.reload();expect(page.locator('#game')).to_have_attribute('data-phase','battle');restored=page.evaluate('JSON.parse(localStorage.getItem("grey-banner-blackwater-v1"))');assert next(u for u in restored['units'] if u['id']=='mira')['ap']==7
 checks.append('standalone battle resumes after a refresh')
 with page.expect_download() as event:page.locator('[data-ui="export"]').click()
 event.value.save_as(OUT/'offline-save.json');assert json.loads((OUT/'offline-save.json').read_text('utf-8'))['phase']=='battle'
 checks.append('standalone progress exports as complete JSON')
 assert not errors,errors;assert not blocked,blocked;checks.extend(['no bundled JavaScript exceptions','no runtime network dependencies']);page.screenshot(path=str(OUT/'offline.png'));b.close()
(OUT/'offline-report.json').write_text(json.dumps({'checks':checks,'errors':errors,'blocked':blocked},ensure_ascii=False,indent=2),'utf-8');print(json.dumps({'passed':len(checks),'errors':errors}))
