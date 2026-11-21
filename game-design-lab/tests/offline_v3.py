"""Verify the standalone bundle in an isolated browser and block all asset fetches.

Serve the exact disk artifact over localhost; no automation of the user's file tab.
"""
import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1];out=root/'.runtime'/'v3-qa';out.mkdir(parents=True,exist_ok=True)
checks=[];errors=[];blocked=[]
source=(root/'research.html').read_text('utf-8')
assert 'src="./app.js"' not in source and '<link rel="stylesheet"' not in source
assert not re.search(r'^import\s',source,re.M)
checks.append('standalone artifact embeds all modules, styles and images')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':1280,'height':720},accept_downloads=True)
 def route(req):
  if req.request.resource_type=='document':req.continue_()
  else:blocked.append(req.request.url);req.abort()
 page.route('http://**/*',route);page.route('https://**/*',route)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:5214/research.html?game=dungeon#lab');expect(page.locator('.chapter-panel h2')).to_have_text('钟声之下')
 checks.append('bundled chapter runs with every network asset request blocked')
 # A legacy save fixture belongs only to this isolated test context.
 page.evaluate('localStorage.setItem("playform-run-v2-dungeon", "legacy-fixture-do-not-replace")')
 page.locator('[data-cmd="route"]').click();page.locator('[data-cmd="target"][data-target="foe-cultist"]').click()
 page.locator('[data-cmd="save"]').click();saved=page.evaluate('JSON.parse(localStorage.getItem("playform-run-v3-dungeon"))')
 assert saved['version']==3 and saved['run']['room']==1 and saved['run']['revision']>=2
 checks.append('bundled attack, initiative and v3 save actually operate')
 page.reload();expect(page.locator('.game-room')).to_have_attribute('data-phase','combat')
 assert page.evaluate('localStorage.getItem("playform-run-v2-dungeon")')=='legacy-fixture-do-not-replace'
 checks.append('chapter refresh preserves new progress and leaves the old save untouched')
 with page.expect_download() as event:page.locator('[data-cmd="export"]').click()
 event.value.save_as(out/'offline-save.json');assert json.loads((out/'offline-save.json').read_text('utf-8'))['version']==3
 checks.append('standalone save exports as ordinary JSON')
 for game in ['spire','valley','factory','brothers','dungeon']:
  page.locator(f'.room-games [data-game="{game}"]').click()
  assert page.locator('.game-room').get_attribute('data-kind')==game
  checks.append(game+': bundled scene and controls initialize')
 assert not blocked,blocked;assert not errors,errors
 checks.extend(['no runtime asset dependencies','no bundled JavaScript exceptions']);b.close()
report={'checks':checks,'errors':errors,'blocked_asset_requests':blocked}
(out/'offline-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8');print(json.dumps({'passed':len(checks),'errors':errors}))
