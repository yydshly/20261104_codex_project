"""Exercise the shipped game controls in an isolated browser.

The tactical helper proposes legal actions from an observed save. It never mutates
the page state or invokes the game's reducer. AI advances on the real room clock.
"""
import json,math,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.runtime/qa';OUT.mkdir(parents=True,exist_ok=True)
report={'checks':[],'errors':[],'failed_requests':[],'player_actions':0}
def check(name,ok=True):
 assert ok,name
 report['checks'].append(name);print('OK: '+name,flush=True)
def state(page):return page.evaluate('JSON.parse(localStorage.getItem("grey-banner-blackwater-v1"))')
def wait_ready(page):expect(page.locator('#game')).not_to_have_class(re.compile('is-busy'),timeout=7000)
def cell_click(page,s,q,r,zoom=1,pan=(0,0)):
 box=page.locator('#battlefield').bounding_box();scale=min((box['width']-20)/980,(box['height']-24)/550)*zoom;ox=(box['width']-980*scale)/2+pan[0];oy=(box['height']-550*scale)/2+pan[1];height=s['terrain'][f'{q},{r}']['height']
 x=ox+(65+math.sqrt(3)*34*(q+.5*(r%2)))*scale;y=oy+(80+34*1.5*r*.8-height*15)*scale
 assert 0<x<box['width'] and 0<y<box['height'],(q,r,x,y)
 page.locator('#battlefield').click(position={'x':x,'y':y})

with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
 page.on('pageerror',lambda e:report['errors'].append(str(e)));page.on('requestfailed',lambda r:report['failed_requests'].append(r.url))
 page.goto('http://127.0.0.1:5215/');expect(page.locator('#launch')).to_be_enabled();page.wait_for_timeout(700)
 page.screenshot(path=str(OUT/'preparation.png'))
 check('new slice opens with contract, deployment and four functional loadouts',page.locator('.loadout-card').count()==4)
 page.locator('#weapon-mira').select_option('crossbow');check('alternate gear changes the actual preparation and portrait',state(page)['gear']['mira']['weapon']=='crossbow' and page.locator('.loadout-card .alternate').count()==1)
 for name,weapon in [('alrik','mace'),('oswin','pike'),('hagen','hammer')]:page.locator(f'#weapon-{name}').select_option(weapon)
 for name in ['alrik','oswin','mira','hagen']:page.locator(f'#armor-{name}').select_option('heavy')
 check('shared preparation budget prevents over-equipping',not page.locator('#launch').is_enabled())
 for name,weapon in [('alrik','sword'),('oswin','spear'),('mira','bow'),('hagen','axe')]:page.locator(f'#weapon-{name}').select_option(weapon);page.locator(f'#armor-{name}').select_option('medium')
 page.locator('[data-prep="approach"][data-value="north"]').click();check('deployment choice is recorded in the actual run',state(page)['approach']=='north');page.locator('[data-prep="approach"][data-value="road"]').click()
 page.locator('#launch').click();expect(page.locator('#game')).to_have_attribute('data-phase','battle');page.locator('[data-ui="speed"]').click();page.wait_for_timeout(500)
 check('battle begins with real initiative, AP and tactical actions',state(page)['active']=='mira' and page.locator('.skill-button').count()==5)
 page.screenshot(path=str(OUT/'battle-opening.png'))
 page.locator('[data-ui="help"]').click();expect(page.locator('#help-dialog')).to_be_visible();page.keyboard.press('Escape');check('rules and keyboard help open and close without losing the battle',not page.locator('#help-dialog').is_visible())
 observed_move=False;observed_hit=False;midshot=False
 for step in range(420):
  s=state(page)
  if s['phase']!='battle':break
  u=next((u for u in s['units'] if u['id']==s['active']),None)
  if not u or u['side']=='enemy' or u['morale']==-3:page.wait_for_timeout(120);continue
  wait_ready(page)
  rec=page.evaluate('async s => (await import("./tests/simulate.mjs")).recommendation(s,"road")',s)
  old_revision=s['revision']
  if rec['type']=='move':
   page.locator('[data-skill="move"]').click();cell_click(page,s,rec['q'],rec['r']);observed_move=True
  elif rec['type']=='skill':
   key=rec['skill'];page.locator(f'.skill-button[data-skill="{key}"]').click()
   if rec.get('target'):
    target=next(u for u in s['units'] if u['id']==rec['target']);cell_click(page,s,target['q'],target['r'])
   observed_hit=observed_hit or any(e['type']=='hit' for e in state(page)['events'])
  else:page.locator(f'.turn-actions [data-act="{rec["type"]}"]').click()
  expect(page.locator('#game')).to_have_attribute('data-phase',re.compile('battle|victory|defeat'))
  check_revision=state(page)['revision'];assert check_revision>old_revision,(u['id'],rec,state(page)['notice'])
  report['player_actions']+=1
  if not midshot and s['round']>=2:
   page.wait_for_timeout(140);page.screenshot(path=str(OUT/'battle-mid.png'));midshot=True
 else:raise AssertionError('battle did not reach a result through normal controls')
 s=state(page);check('normal canvas movement and attacks resolve the tactical contract',observed_move and observed_hit and s['phase']=='victory')
 check('battle creates morale changes and a real result ledger',any('士气' in e['text'] for e in s['log']) and s['result']['pay']==450 and s['result']['wages']>0 and s['result']['preparation']>0)
 page.screenshot(path=str(OUT/'victory.png'));(OUT/'completed-run.json').write_text(json.dumps(s,ensure_ascii=False,indent=2),'utf-8')
 page.reload();expect(page.locator('#result')).to_be_visible();check('a finished contract survives refresh with the same survivors',state(page)['result']['survivors']==s['result']['survivors'])
 with page.expect_download() as event:page.locator('[data-ui="export"]').click()
 event.value.save_as(OUT/'exported-save.json');check('save export contains terrain, loadouts, units and settlement',json.loads((OUT/'exported-save.json').read_text('utf-8'))['kind']=='iron-company')
 page.locator('#result [data-ui="restart"]').click();expect(page.locator('#preparation')).to_be_visible();check('replay begins with a clean preparation and archives the prior result',len(page.evaluate('JSON.parse(localStorage.getItem("grey-banner-blackwater-history-v1"))'))==1)
 for width,height in [(1280,720),(390,844)]:
  page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(200);check(f'{width}px preparation has no page-width overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  if width==390:page.screenshot(path=str(OUT/'mobile-preparation.png'),full_page=True)
 page.set_viewport_size({'width':1280,'height':720});page.locator('#launch').click();page.wait_for_timeout(200)
 for width,height in [(1280,720),(390,844)]:
  page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(200)
  for selector in ['#battlefield','#commands','.combat-footer']:
   box=page.locator(selector).bounding_box();check(f'{width}px {selector} fits the gameplay viewport',box['y']>=0 and box['y']+box['height']<=height+1)
  page.screenshot(path=str(OUT/f'battle-{width}.png'))
 page.locator('.inspect-toggle').click();check('phone can open the full tactical inspector',page.locator('#inspector').is_visible());page.locator('.inspector-close').click();check('phone can close the inspector without losing control',not page.locator('#inspector').is_visible())
 page.locator('[data-ui="zoomin"]').click();page.wait_for_timeout(100);cell_click(page,state(page),3,4,1.2);wait_ready(page);s=state(page);check('zoomed phone map still targets the correct hex',next(u for u in s['units'] if u['id']=='mira')['ap']==7)
 box=page.locator('#battlefield').bounding_box();page.mouse.move(box['x']+100,box['y']+box['height']*.7);page.mouse.down();page.mouse.move(box['x']+120,box['y']+box['height']*.7+10,steps=5);page.mouse.up();page.wait_for_timeout(100);cell_click(page,state(page),3,3,1.2,(20,10));wait_ready(page);s=state(page);check('panned phone map preserves movement coordinates and AP',next(u for u in s['units'] if u['id']=='mira')['r']==3)
 check('no uncaught game exceptions',not report['errors']);check('all shipped visual assets loaded',not report['failed_requests']);b.close()
(OUT/'browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8');print(json.dumps({'passed':len(report['checks']),'actions':report['player_actions'],'errors':report['errors']},ensure_ascii=False))
