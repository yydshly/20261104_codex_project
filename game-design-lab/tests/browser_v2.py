"""Use actual canvas/keyboard/card controls; read the product's own save files as evidence."""
import json, math, struct, re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'.runtime'/'v2-qa';OUT.mkdir(parents=True,exist_ok=True)
REPORT={'checks':[],'errors':[],'failed_requests':[]}
def check(name,value=True):
 if not value:raise AssertionError(name)
 REPORT['checks'].append(name)
 print('OK: '+name,flush=True)
def state(page,game):return page.evaluate('(game)=>JSON.parse(localStorage.getItem(`playform-run-v2-${game}`)).run',game)
def save(page):page.locator('[data-cmd="save"]').click()
def switch(page,game):
 page.locator('#lab-game').select_option(game);page.locator('#lab-reset').click();page.locator('.play-canvas').scroll_into_view_if_needed()
def farm_click(page,x,y):
 save(page);s=state(page,'valley');box=page.locator('canvas.play-canvas').bounding_box();scale=1.25;t=32
 ox=max(box['width']-36*t*scale,min(0,box['width']/2-s['player']['x']*t*scale))
 oy=max(box['height']-23*t*scale,min(0,box['height']/2-(s['player']['y']-2.5)*t*scale))
 px=ox+(x+.5)*t*scale;py=oy+(y+.5)*t*scale
 assert 0<px<box['width'] and 0<py<box['height'],(px,py)
 page.locator('canvas.play-canvas').click(position={'x':px,'y':py})
def choose_tool(page,tool):page.locator(f'[data-cmd="tool"][data-tool="{tool}"]').click()
def wait_notice(page,text):expect(page.locator('#lab-notice')).to_contain_text(text,timeout=12000)
def farm_use(page,tool,text):choose_tool(page,tool);farm_click(page,8,10);wait_notice(page,text)
def hex_click(page,q,r):
 box=page.locator('canvas.play-canvas').bounding_box();size=34;ww=10.5*math.sqrt(3)*size;wh=8*1.5*size;scale=min(box['width']/(ww+55),box['height']/(wh+10));ox=(box['width']-ww*scale)/2+size*scale;oy=(box['height']-wh*scale)/2+size*1.1*scale
 page.locator('canvas.play-canvas').click(position={'x':ox+math.sqrt(3)*size*(q+.5*(r%2))*scale,'y':oy+size*1.5*r*scale})

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 ctx=browser.new_context(viewport={'width':1440,'height':1050},accept_downloads=True,reduced_motion='reduce')
 page=ctx.new_page();page.on('pageerror',lambda e:REPORT['errors'].append(str(e)));page.on('requestfailed',lambda r:REPORT['failed_requests'].append(r.url))
 response=page.goto('http://127.0.0.1:5214/?game=valley#lab');page.wait_for_selector('.play-canvas');check('module page returns 200',response.status==200)
 for game in ['valley','spire','dungeon','factory','brothers']:
  switch(page,game);page.locator('.original-reference summary').click();image=page.locator('.reference-body img');expect(image).to_be_visible();page.wait_for_function('document.querySelector(".reference-body img").naturalWidth>0');check(game+': original screenshot and sourced rules are available');page.locator('.original-reference summary').click()
 switch(page,'valley');save(page);before=state(page,'valley')['player']['x'];page.locator('canvas').focus();page.keyboard.down('d');page.wait_for_timeout(400);page.keyboard.up('d');save(page);check('farm character really walks with keyboard input',state(page,'valley')['player']['x']>before+.7)
 farm_use(page,'hoe','翻开了土地');farm_use(page,'seed','种下防风草');farm_use(page,'water','土地湿润');save(page);s=state(page,'valley');check('canvas tools till, seed and water the same world tile',s['soil']['8,10']['crop']=='parsnip' and s['soil']['8,10']['watered'])
 for day in range(2,6):
  page.locator('[data-cmd="station"][data-station="home"]').click();expect(page.locator('.room-stat').first).to_contain_text(f'春 {day} 日',timeout=15000)
  if day<5:
   choose_tool(page,'water');farm_click(page,8,10);expect(page.locator('#lab-notice')).to_contain_text(re.compile('土地湿润了|今天已经浇过水'),timeout=12000)
 save(page);check('four nights of growth really mature the planted crop',state(page,'valley')['soil']['8,10']['growth']==4)
 farm_use(page,'harvest','收获 1 株');page.locator('[data-cmd="station"][data-station="shipping"]').click();wait_notice(page,'放入出货箱');page.locator('[data-cmd="station"][data-station="home"]').click();expect(page.locator('.room-stat').first).to_contain_text('春 6 日',timeout=15000);save(page);check('harvest, walk to shipping bin and sleep settle 35g',state(page,'valley')['gold']==535)
 page.reload();page.wait_for_selector('.play-canvas');save(page);check('actual farm progress survives a page reload',state(page,'valley')['day']==6)

 switch(page,'spire');page.locator('[data-cmd="node"]').click();s=state(page,'spire');check('card battle starts with five real hand cards',len(s['hand'])==5)
 defs=page.evaluate('async()=> (await import("./play-engine.js")).RUN_CARDS')
 turns=0
 while turns<100:
  s=state(page,'spire');phase=s['phase'];turns+=1
  if phase in ['lost','complete']:break
  if phase=='map':page.locator('[data-cmd="node"][data-node="camp"], [data-cmd="node"][data-node="boss"]').first.click();continue
  if phase=='camp':page.locator('[data-cmd="rest"]').click();continue
  if phase=='reward':page.locator('[data-cmd="reward"][data-card]').first.click();continue
  if phase=='enemy':page.wait_for_timeout(220);continue
  living=[e for e in s['enemies'] if e['hp']>0];target=min(living,key=lambda e:e['hp']);cards=[]
  for index,code in enumerate(s['hand']):
   c=dict(defs[code.replace('+','')]);c['index']=index;c['code']=code;c['damage']=c.get('damage',0)+(c.get('upgrade',0) if code.endswith('+') and c.get('damage') else 0)
   if c['cost']<=s['energy']:cards.append(c)
  chosen=next((c for c in cards if c.get('damage') and math.floor((c['damage']+s['strength'])*(1.5 if target['vulnerable'] else 1))>=target['hp']),None)
  if chosen is None:chosen=next((c for c in cards if c['code']=='bash' and not target['vulnerable']),None)
  if chosen is None:chosen=next((c for c in cards if c.get('strength') and s['strength']==0),None)
  if chosen is None:chosen=next((c for c in cards if c.get('damage')),None)
  if chosen is None:chosen=next(iter(cards),None)
  if chosen:
   page.locator(f'[data-cmd="card"][data-index="{chosen["index"]}"]').click()
   if chosen.get('damage') and not chosen.get('all'):page.locator(f'[data-cmd="target"][data-target="{target["id"]}"]').click()
  else:page.locator('[data-cmd="end"]').click()
 check('three-node card journey can be won through the actual card and target controls',state(page,'spire')['phase']=='complete')

 switch(page,'factory');page.locator('[data-cmd="speed"]').click();page.locator('[data-cmd="speed"]').click();page.wait_for_timeout(1000)
 box=page.locator('canvas').bounding_box();scale=min(box['width']/(22*46),box['height']/(12*46));ox=(box['width']-22*46*scale)/2;oy=(box['height']-12*46*scale)/2
 page.locator('canvas').click(position={'x':ox+5.5*46*scale,'y':oy+5.5*46*scale});save(page);check('canvas placement fills the actual missing belt cell','5,5' in state(page,'factory')['entities'])
 page.wait_for_function('JSON.parse(localStorage.getItem("playform-run-v2-factory")).run.delivered>=1',timeout=20000);save(page);check('items actually pass through mining, smelting, assembly and chest',state(page,'factory')['delivered']>=1)
 page.locator('[data-cmd="run"]').click();save(page);paused=state(page,'factory')['time'];page.wait_for_timeout(600);save(page);check('production can be paused without background progress',state(page,'factory')['time']==paused)
 page.locator('canvas').focus();page.keyboard.press('r');check('R rotates the actual placement direction',state(page,'factory')['direction']==1)

 switch(page,'dungeon');page.locator('[data-cmd="enter"]').click();skills=page.evaluate('async()=> (await import("./play-engine.js")).DUNGEON_SKILLS');actions=0
 while actions<220:
  s=state(page,'dungeon');actions+=1
  if s['phase'] in ['complete','lost','escaped']:break
  if s['phase']=='explore':
   camp=page.locator('[data-cmd="camp"]')
   if camp.is_enabled():camp.click()
   if s['torch']<50 and page.locator('[data-cmd="torch"]').is_enabled():page.locator('[data-cmd="torch"]').click()
   page.locator('[data-cmd="enter"]').click();continue
  if not s['active'] or s['active'].startswith('foe'):page.wait_for_timeout(220);continue
  actor=next(h for h in s['party'] if h['id']==s['active']);options=[]
  for key in actor['skills']:
   skill=skills[key]
   if actor['rank'] not in skill['from']:continue
   targets=[t for t in (s['party'] if skill.get('ally') else s['enemies']) if (not t['dead'] or t.get('corpse')) and t['rank'] in skill['to']]
   for t in targets:
    score=(t['maxHp']-t['hp'])*3 if skill.get('heal') else 0 if skill.get('guard') else 10+(8 if not t['dead'] else -8)+(12 if t['role']=='cultist' else 0)+(6 if skill.get('blight') and t.get('blight',0)<3 else 0)
    options.append((score,key,t['id']))
  if not options:page.locator('[data-cmd="rank"]:not(:disabled)').first.click();continue
  _,key,target=max(options,key=lambda x:x[0]);page.locator(f'[data-cmd="skill"][data-skill="{key}"]').click();page.locator(f'.dungeon-targets [data-target="{target}"]').click()
 check('rank-targeted combat, enemy AI and recovery can complete three dungeon rooms',state(page,'dungeon')['phase']=='complete')

 switch(page,'brothers');page.locator('[data-cmd="start"]').first.click();check('tactical initiative starts with the fastest archer',state(page,'brothers')['active']=='m2');steps=0;observed_move=False;observed_attack=False
 while steps<200:
  s=state(page,'brothers');steps+=1
  if s['phase']!='battle':break
  if s['active'].startswith('e'):page.wait_for_timeout(220);continue
  recommendation=page.evaluate('''async s=>{const m=await import('./play-engine.js');const actor=s.roster.find(p=>p.id===s.active),targets=s.enemies.filter(p=>!p.dead);const inRange=targets.filter(t=>m.attackPreview(s,actor,t).valid).sort((a,b)=>a.hp-b.hp);if(inRange.length)return {type:'attack',target:inRange[0].id};const moves=m.reachableHexes(s,actor).sort((a,b)=>Math.min(...targets.map(t=>m.hexDistance(a,t)))-Math.min(...targets.map(t=>m.hexDistance(b,t)))||a.cost-b.cost);const before=Math.min(...targets.map(t=>m.hexDistance(actor,t)));if(moves.length&&Math.min(...targets.map(t=>m.hexDistance(moves[0],t)))<before&&actor.fatigue<75)return {type:'move',q:moves[0].q,r:moves[0].r};return {type:'end'};}''',s)
  if recommendation['type']=='attack':
   page.locator('[data-cmd="mode"][data-mode="attack"]').click();page.locator(f'.target-strip [data-target="{recommendation["target"]}"]').click();observed_attack=True
  elif recommendation['type']=='move':
   page.locator('[data-cmd="mode"][data-mode="move"]').click();hex_click(page,recommendation['q'],recommendation['r']);observed_move=True
  else:page.locator('[data-cmd="end"]').click()
 check('tactical actors really move across hexes and perform attacks',observed_move and observed_attack)
 check('the tactical contract is settled only after winning the battle',state(page,'brothers')['phase']=='victory' and state(page,'brothers')['contracts']==1)
 page.locator('[data-cmd="claim"]').click();check('surviving mercenaries return to the persistent camp',state(page,'brothers')['phase']=='camp')

 page.locator('#project-title').fill('实机研究草案');page.locator('#primary-game').select_option('factory');page.locator('#secondary-game').select_option('valley')
 with page.expect_download() as event:page.locator('#export-json').click()
 event.value.save_as(OUT/'brief.json');check('design workbench export remains functional',json.loads((OUT/'brief.json').read_text('utf-8'))['brief']['title']=='实机研究草案')
 with page.expect_download() as event:page.locator('[data-cmd="export"]').click()
 event.value.save_as(OUT/'actual-game-save.json');check('real gameplay save export contains actors and progression','roster' in json.loads((OUT/'actual-game-save.json').read_text('utf-8'))['run'])
 page.locator('[data-cmd="focus"]').click();check('focus mode opens an interactive full-window game',page.locator('.focused-game').count()==1);page.keyboard.press('Escape');check('Escape exits focus mode',page.locator('.focused-game').count()==0)
 for game in ['valley','spire','dungeon','factory','brothers']:
  switch(page,game)
  if game=='spire':page.locator('[data-cmd="node"]').click()
  if game=='dungeon':page.locator('[data-cmd="enter"]').click()
  if game=='brothers':page.locator('[data-cmd="start"]').first.click()
  page.locator('.play-canvas').scroll_into_view_if_needed();page.wait_for_timeout(250);page.locator('#lab-content').screenshot(path=str(OUT/f'{game}.png'))
 phone=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce');mobile=phone.new_page();mobile.on('pageerror',lambda e:REPORT['errors'].append(str(e)));mobile.goto('http://127.0.0.1:5214/?game=valley#lab');mobile.wait_for_selector('.play-canvas')
 for game in ['valley','spire','dungeon','factory','brothers']:
  mobile.locator('#lab-game').select_option(game);check(game+': mobile page fits 390px',mobile.evaluate('document.documentElement.scrollWidth<=innerWidth && document.body.scrollWidth<=innerWidth'))
 mobile.locator('#lab-game').select_option('valley');mobile.locator('#lab-content').screenshot(path=str(OUT/'mobile.png'));check('mobile farm provides touch movement controls',mobile.locator('.touch-pad').is_visible())
 check('no JavaScript errors',not REPORT['errors']);check('no failed resource requests',not REPORT['failed_requests']);browser.close()
(OUT/'browser-report.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps({'passed':len(REPORT['checks']),'errors':REPORT['errors'],'failed_requests':REPORT['failed_requests']}))
