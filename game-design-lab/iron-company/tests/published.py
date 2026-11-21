import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=sys.argv[1].rstrip('/')+'/';root=Path(__file__).resolve().parents[1];out=root/'.runtime/qa';checks=[];errors=[];failed=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':1440,'height':900});page.on('pageerror',lambda e:errors.append(str(e)));page.on('requestfailed',lambda r:failed.append(r.url))
 page.goto(base);expect(page.locator('#launch')).to_be_visible();expect(page).to_have_title('灰旗佣兵团 · 黑水渡口');checks.append('static project root starts the new game with its base path')
 assert page.locator('.loadout-card').count()==4;checks.append('all four real loadouts are present in the packaged entry')
 page.locator('.header-tools a').click();expect(page.locator('#study-name')).to_have_text('战场兄弟');checks.append('packaged game opens the preserved five-game research page')
 page.locator('.hero-actions .primary').click();expect(page.locator('#launch')).to_be_enabled();checks.append('research page returns to the dedicated standalone game')
 page.locator('#launch').click();expect(page.locator('#game')).to_have_attribute('data-phase','battle');page.wait_for_timeout(500);page.screenshot(path=str(out/'published.png'));checks.append('packaged game starts a real battle')
 assert not errors,errors;assert not failed,failed;checks.extend(['no packaged JavaScript exceptions','no broken packaged resource requests']);b.close()
(out/'published-report.json').write_text(json.dumps({'checks':checks,'errors':errors,'failed_requests':failed},ensure_ascii=False,indent=2),'utf-8');print(json.dumps({'passed':len(checks),'errors':errors}))
