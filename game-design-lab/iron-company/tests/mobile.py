import json,math,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1];out=root/'.runtime/qa';out.mkdir(parents=True,exist_ok=True);checks=[];errors=[]
def state(page):return page.evaluate('JSON.parse(localStorage.getItem("grey-banner-blackwater-v1"))')
def cell(page,q,r,zoom=1,pan=(0,0)):
 b=page.locator('#battlefield').bounding_box();s=state(page);scale=min((b['width']-20)/980,(b['height']-24)/550)*zoom;ox=(b['width']-980*scale)/2+pan[0];oy=(b['height']-550*scale)/2+pan[1];height=s['terrain'][f'{q},{r}']['height'];page.locator('#battlefield').click(position={'x':ox+(65+math.sqrt(3)*34*(q+.5*(r%2)))*scale,'y':oy+(80+34*1.5*r*.8-height*15)*scale})
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:5215/');page.locator('#launch').click();expect(page.locator('#game')).to_have_attribute('data-phase','battle')
 page.locator('.inspect-toggle').click();expect(page.locator('#inspector')).to_be_visible();page.locator('.inspector-close').click();expect(page.locator('#inspector')).not_to_be_visible();checks.append('phone inspector opens and closes with reachable controls')
 page.locator('[data-ui="zoomin"]').click();page.wait_for_timeout(100);cell(page,3,4,1.2);expect(page.locator('#game')).not_to_have_class(re.compile('is-busy'));mira=next(u for u in state(page)['units'] if u['id']=='mira');assert mira['q']==3 and mira['r']==4 and mira['ap']==7;checks.append('zoomed map preserves exact target coordinates and AP cost')
 box=page.locator('#battlefield').bounding_box();page.mouse.move(box['x']+100,box['y']+box['height']*.7);page.mouse.down();page.mouse.move(box['x']+120,box['y']+box['height']*.7+10,steps=5);page.mouse.up();page.wait_for_timeout(100);cell(page,3,3,1.2,(20,10));expect(page.locator('#game')).not_to_have_class(re.compile('is-busy'));mira=next(u for u in state(page)['units'] if u['id']=='mira');assert mira['q']==3 and mira['r']==3 and mira['ap']==5;checks.append('drag-panned map preserves exact target coordinates and AP cost')
 assert not errors,errors;checks.append('no script exceptions in real mobile input flow');page.screenshot(path=str(out/'mobile-controls.png'));b.close()
(out/'mobile-report.json').write_text(json.dumps({'checks':checks,'errors':errors},ensure_ascii=False,indent=2),'utf-8');print(json.dumps({'passed':len(checks),'errors':errors}))
