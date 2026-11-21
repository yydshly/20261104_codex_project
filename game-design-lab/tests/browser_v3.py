"""Player-facing acceptance: click the shipped UI, never inject or advance game state.

Dungeon decisions use the same names, health tooltips and range buttons players see.
The exported save is inspected only after completing the expedition as evidence.
"""
import json,re,math
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'.runtime'/'v3-qa';OUT.mkdir(parents=True,exist_ok=True)
REPORT={'checks':[],'errors':[],'failed_requests':[],'dungeon_actions':0}
def check(name,ok=True):
 assert ok,name
 REPORT['checks'].append(name);print('OK: '+name,flush=True)
def bounds(page,selector):
 b=page.locator(selector).bounding_box();v=page.viewport_size
 return b and b['x']>=-1 and b['y']>=-1 and b['x']+b['width']<=v['width']+1 and b['y']+b['height']<=v['height']+1
def game(page,key,reset=True):
 page.locator(f'.room-games [data-game="{key}"]').click()
 if reset:page.locator('.room-top-buttons [data-cmd="reset"]').click()
def targets(page):
 result=[]
 for b in page.locator('.dungeon-targets [data-target]').all():
  title=b.get_attribute('title') or '';hp=re.search(r'生命 (\d+)/(\d+)',title);rank=re.search(r'位置 (\d+)',title)
  if hp:result.append({'button':b,'id':b.get_attribute('data-target'),'title':title,'hp':int(hp[1]),'max':int(hp[2]),'rank':int(rank[1]),'corpse':'尸体' in title})
 return result
def skill_target(page,key,prefer):
 button=page.locator(f'.chapter-skills [data-skill="{key}"]')
 if not button.count() or not button.is_enabled():return False
 button.click();valid=[t for t in targets(page) if t['button'].is_enabled()]
 if not valid:return False
 target=sorted(valid,key=prefer)[0];target['button'].click();REPORT['dungeon_actions']+=1;page.wait_for_timeout(400);return True
def fight(page):
 actor=page.locator('.hero-command>strong').inner_text();ts=targets(page)
 enemies=[t for t in ts if t['id'].startswith('foe') and not t['corpse']]
 allies=[t for t in ts if not t['id'].startswith('foe')]
 front=lambda t:(t['corpse'],t['hp'])
 priority=lambda t:(t['corpse'],0 if t['id']=='foe-bell' else 1 if '祭司' in t['title'] or '抄写员' in t['title'] else 2,t['hp'])
 if actor=='阿黛':
  if any(t['rank']>=3 and t['hp']>4 for t in enemies) and skill_target(page,'plague',priority):return
  if skill_target(page,'incision',front):return
  if skill_target(page,'plague',priority):return
 if actor=='迪斯':
  if any(t['rank']>=2 and ('祭司' in t['title'] or '敲钟' in t['title']) for t in enemies) and skill_target(page,'pistol',priority):return
  if skill_target(page,'slice',front):return
  if skill_target(page,'pistol',priority):return
 if actor=='雷诺' and skill_target(page,'smite',front):return
 if actor=='朱妮':
  if any(t['hp']<t['max']-5 for t in allies) and skill_target(page,'heal',lambda t:t['hp']/t['max']):return
  if skill_target(page,'light',lambda t:('眩晕' in t['title'],t['corpse'],t['hp'])):return
  if skill_target(page,'heal',lambda t:t['hp']/t['max']):return
 # No enemy action is advanced by test code: the room's real timer handles it.
 page.wait_for_timeout(250)

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1280,'height':720},accept_downloads=True)
 page.on('pageerror',lambda e:REPORT['errors'].append(str(e)))
 page.on('requestfailed',lambda r:REPORT['failed_requests'].append(r.url))
 page.goto('http://127.0.0.1:5214/?game=dungeon#lab');expect(page.locator('.chapter-panel h2')).to_have_text('钟声之下')
 page.screenshot(path=str(OUT/'dungeon-title.png'))
 check('opening directly presents the playable chapter',page.locator('.focused-game').count()==1)
 check('opening route and supplies fit a normal 1280×720 screen',bounds(page,'.route-cards') and bounds(page,'.room-controls'))
 page.locator('[data-cmd="route"][data-node="gate"]').click()
 expect(page.locator('.hero-command>strong')).to_have_text('阿黛')
 check('combat scene and skill controls are visible together',bounds(page,'.room-stage') and bounds(page,'.chapter-skills') and bounds(page,'.dungeon-targets'))
 page.locator('[data-skill="blast"]').click();expect(page.locator('[data-skill="blast"]')).to_have_attribute('aria-pressed','true')
 page.locator('canvas').focus();page.keyboard.press('1');expect(page.locator('[data-skill="plague"]')).to_have_attribute('aria-pressed','true')
 check('number keys select the same visible skills as clicking')
 page.wait_for_timeout(500);page.screenshot(path=str(OUT/'dungeon-combat.png'))
 visited=[]
 for step in range(280):
  phase=page.locator('.game-room').get_attribute('data-phase')
  if phase in ['complete','lost','escaped']:break
  if phase=='combat':
   if page.locator('[data-node="sanctum"]').count():pass
   if page.locator('.room-stat').first.inner_text().find('5/5')>=0 and 'boss' not in visited:
    page.screenshot(path=str(OUT/'dungeon-boss.png'));visited.append('boss')
   fight(page)
  elif phase=='reward':
   page.screenshot(path=str(OUT/'dungeon-loot.png'))
   page.locator('[data-cmd="reward"][data-card="recovery"]').click()
   visited.append('reward')
  elif phase=='explore':
   for node in ['shrine','library','hearth','sanctum']:
    b=page.locator(f'[data-cmd="route"][data-node="{node}"]')
    if b.count():
     page.screenshot(path=str(OUT/f'dungeon-route-{node}.png'));b.click();visited.append(node);break
   else:raise AssertionError('route offers no next destination')
  elif phase=='event':page.locator('[data-cmd="continue"]').click()
 else:raise AssertionError('expedition failed to end with ordinary UI actions')
 check('complete the expedition through visible skills, targets, events and loot',phase=='complete')
 check('route includes real events, two encounters and the boss','boss' in visited and visited.count('reward')==3 and all(n in visited for n in ['shrine','library','hearth','sanctum']))
 page.screenshot(path=str(OUT/'dungeon-complete.png'))
 with page.expect_download() as d:page.locator('[data-cmd="export"]').click()
 d.value.save_as(OUT/'completed-expedition.json');run=json.loads((OUT/'completed-expedition.json').read_text('utf-8'))['run']
 check('completed save records persistent wounds, chosen route, boss and rewards',run['stage']==5 and run['bossDefeated'] and len(run['path'])==5 and run['loot']>0)
 page.reload();expect(page.locator('.result-panel')).to_contain_text('归途仍有光');check('chapter result survives refresh')
 page.locator('.room-top-buttons [data-cmd="reset"]').click();page.locator('.chapter-idle [data-cmd="retreat"]').click();expect(page.locator('.result-panel')).to_contain_text('活着回家');check('safe retreat and a new expedition are actual playable exits')
 for key in ['spire','valley','factory','brothers','dungeon']:
  game(page,key);page.wait_for_timeout(300)
  check(key+': scene and controls fit the desktop screen',bounds(page,'.room-stage') and bounds(page,'.room-controls'))
  if key=='spire':
   page.locator('[data-cmd="node"]').click();expect(page.locator('.real-card')).to_have_count(5);check('spire uses distinct illustrated cards and a playable hand',page.locator('.card-art>svg').count()==5)
  if key=='factory':
   b=page.locator('canvas').bounding_box();ww=22*46;wh=12*46;scale=min(b['width']/ww,b['height']/wh)
   # Grid is centered using the renderer's documented world transform.
   ox=(b['width']-ww*scale)/2;oy=(b['height']-wh*scale)/2
   page.locator('canvas').click(position={'x':ox+5.5*46*scale,'y':oy+5.5*46*scale})
   page.locator('[data-cmd="speed"]').click();page.locator('[data-cmd="speed"]').click()
   expect(page.locator('.room-objective strong')).to_contain_text('10 / 10',timeout=35000)
   check('repairing a physical belt delivers the actual ten-gear order')
  page.screenshot(path=str(OUT/f'{key}-desktop.png'))
 page.locator('[data-cmd="focus"]').click();check('research remains reachable from the game',page.locator('.focused-game').count()==0)
 page.locator('.original-reference summary').click();expect(page.locator('.reference-body img')).to_be_visible();check('original screenshot and precise scope remain accessible')
 page.locator('.original-reference summary').click();page.locator('[data-cmd="focus"]').click()
 for key in ['dungeon','spire','valley','factory','brothers']:
  game(page,key);page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(250)
  if key=='dungeon':page.locator('[data-cmd="route"]').click()
  check(key+': scene and controls fit a 390px phone',bounds(page,'.room-stage') and bounds(page,'.room-controls'))
  if key=='dungeon':check('phone retains torch and retreat controls',page.locator('.mobile-utilities [data-cmd="torch"]').is_visible() and page.locator('.mobile-utilities [data-cmd="retreat"]').is_visible())
  check(key+': no page-width overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  page.screenshot(path=str(OUT/f'{key}-mobile.png'));page.set_viewport_size({'width':1280,'height':720})
 check('no uncaught game exceptions',not REPORT['errors']);check('all local resources loaded',not REPORT['failed_requests'])
 browser.close()
(OUT/'browser-report.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps({'passed':len(REPORT['checks']),'dungeon_actions':REPORT['dungeon_actions'],'errors':REPORT['errors']},ensure_ascii=False))
