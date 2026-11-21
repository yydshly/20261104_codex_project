"""Open the distributable directly from disk, including every embedded image."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1];out=root/'.runtime'/'v2-qa';out.mkdir(parents=True,exist_ok=True)
checks=[];errors=[];network=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':1440,'height':1000},accept_downloads=True,reduced_motion='reduce')
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda req:network.append(req.url) if req.url.startswith(('https:','http:')) else None)
 page.goto((root/'offline.html').as_uri()+'?game=valley#lab');page.wait_for_selector('.play-canvas');checks.append('single-file game room opens directly from disk')
 for game in ['valley','spire','dungeon','factory','brothers']:
  page.locator('#lab-game').select_option(game);page.locator('.original-reference summary').click();page.wait_for_function('document.querySelector(".reference-body img").naturalWidth>0');page.locator('.original-reference summary').click();checks.append(game+': controls and embedded reference image load offline')
 page.locator('#lab-game').select_option('spire');page.locator('[data-cmd="node"]').click();expect(page.locator('.real-card')).to_have_count(5);checks.append('offline card battle initializes a real five-card hand')
 page.locator('#lab-game').select_option('factory');page.locator('[data-cmd="demo"]').click();page.locator('[data-cmd="speed"]').click();page.locator('[data-cmd="speed"]').click();page.locator('.play-canvas').scroll_into_view_if_needed();page.wait_for_function('JSON.parse(localStorage.getItem("playform-run-v2-factory")).run.oreMined>=1');checks.append('embedded machine assets and factory simulation work without a server')
 page.locator('[data-cmd="run"]').click();page.locator('[data-cmd="save"]').click();saved=page.evaluate('JSON.parse(localStorage.getItem("playform-run-v2-factory")).run');page.reload();page.wait_for_selector('.play-canvas');restored=page.evaluate('JSON.parse(localStorage.getItem("playform-run-v2-factory")).run');assert restored['oreMined']==saved['oreMined'];assert restored['running']==False;checks.append('offline game save and paused simulation restore after refresh')
 with page.expect_download() as event:page.locator('[data-cmd="export"]').click()
 event.value.save_as(out/'offline-game-save.json');assert json.loads((out/'offline-game-save.json').read_text('utf-8'))['run']['kind']=='factory';checks.append('offline game save can be exported as a usable JSON file')
 assert not errors,errors;assert not network,network;checks.extend(['no offline JavaScript exceptions','no required network requests'])
 b.close()
report={'checks':checks,'errors':errors,'network_requests':network}
(out/'offline-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8');print(json.dumps({'passed':len(checks),'errors':errors,'network_requests':network}))
