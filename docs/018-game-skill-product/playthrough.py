"""Play all three chapters through keyboard and visible menu entry points.

The QA API is read only in this run. No fixtures, damage edits, teleports or
simulation stepping are used to obtain a campaign completion.
"""
import base64
import heapq
import json
import math
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'evidence'/'v2'
OUT.mkdir(exist_ok=True)
OBSTACLES=[ [(-6.1,-3.8,1.2),(6.1,-3.8,1.2)], [(-3.3,-1.7,.75),(3.3,1.5,.75)], [(-6.5,-2.5,.7),(6.5,-2.5,.7)] ]
held=set()
trace=[]

def valid(x,z,chapter):
    return math.hypot(x/8.05,z/5.95)<1 and all(math.hypot(x-ox,z-oz)>r+.42 for ox,oz,r in OBSTACLES[chapter]+[(0,-4.7,.75)])

def route(x,z,tx,tz,chapter):
    if all(valid(x+(tx-x)*i/20,z+(tz-z)*i/20,chapter) for i in range(1,21)):
        return tx,tz
    start=(round(x*2),round(z*2)); goal=(round(tx*2),round(tz*2))
    queue=[(0,start)]; cost={start:0}; previous={}
    reached=start
    while queue:
        _,node=heapq.heappop(queue)
        if math.hypot(node[0]-goal[0],node[1]-goal[1])<=1.5:
            reached=node;break
        for dx,dz in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]:
            nxt=(node[0]+dx,node[1]+dz)
            if not valid(nxt[0]/2,nxt[1]/2,chapter):continue
            candidate=cost[node]+math.hypot(dx,dz)
            if candidate>=cost.get(nxt,1e9):continue
            cost[nxt]=candidate;previous[nxt]=node
            heapq.heappush(queue,(candidate+math.hypot(nxt[0]-goal[0],nxt[1]-goal[1]),nxt))
    path=[reached]
    while path[-1] in previous and previous[path[-1]]!=start:path.append(previous[path[-1]])
    point=path[-1]
    return point[0]/2,point[1]/2

def hold(page,desired):
    global held
    for key in held-desired:page.keyboard.up(key)
    for key in desired-held:page.keyboard.down(key)
    held=desired

def steer(page,dx,dz,attack=True):
    length=max(.01,math.hypot(dx,dz))
    x=(.81*dx-.586*dz)/length;y=(.586*dx+.81*dz)/length
    desired={'j'} if attack else set()
    if x>.3:desired.add('d')
    if x<-.3:desired.add('a')
    if y>.3:desired.add('s')
    if y<-.3:desired.add('w')
    hold(page,desired)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    context=browser.new_context(viewport={'width':1280,'height':800},device_scale_factor=1,record_video_dir=str(ROOT/'evidence'/'recordings'),record_video_size={'width':1280,'height':800})
    video_started=time.monotonic()
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto('http://127.0.0.1:5267/?qa')
    page.wait_for_function('window.__qa')
    page.wait_for_timeout(2500)
    page.locator('#primary').click()
    page.wait_for_function('__qa.snapshot().soundBank.decodedSounds===10')
    audio_offset=round(time.monotonic()-video_started,3)
    page.evaluate('__qa.beginAudioCapture()')
    started=time.monotonic()
    previous_phase=None
    captures=set()
    retries=0
    while time.monotonic()-started<240:
        state=page.evaluate('__qa.snapshot()')
        phase=state['phase'];chapter=state['chapter'];player=state['player']
        marker=(chapter,phase)
        if marker!=previous_phase:
            trace.append({'chapter':chapter,'phase':phase,'wallSeconds':round(time.monotonic()-started,2),'score':state['score'],'hp':player['hp'],'upgrades':state['upgrades']})
            print(json.dumps(trace[-1],ensure_ascii=False),flush=True)
            previous_phase=marker
        if phase=='won':
            hold(page,set())
            page.wait_for_timeout(400)
            page.screenshot(path=str(OUT/'ending-playthrough.png'))
            break
        if phase=='briefing':
            hold(page,set());page.locator('#primary').click();continue
        if phase=='paused':
            hold(page,set());page.locator('#primary').click();continue
        if phase=='upgrade':
            hold(page,set())
            page.screenshot(path=str(OUT/f'playthrough-upgrade-{chapter}.png'))
            page.locator('[data-upgrade="'+('edge' if chapter==0 else 'heart')+'"]').click();continue
        if phase=='lost':
            hold(page,set());retries+=1
            if retries>2:raise AssertionError('Campaign failed after two retry attempts')
            page.locator('#primary').click();continue
        if phase!='playing':raise AssertionError(phase)
        if chapter not in captures and state['elapsed']>2:
            page.screenshot(path=str(OUT/f'playthrough-chapter-{chapter+1}.png'))
            captures.add(chapter)
        enemies=[enemy for enemy in state['enemies'] if enemy['hp']>0]
        pickups=[item for item in state['pickups'] if not item['collected']]
        if pickups:
            target=min(pickups,key=lambda item:math.hypot(item['x']-player['x'],item['z']-player['z']))
            target_distance=.35
        elif enemies:
            target=min(enemies,key=lambda item:math.hypot(item['x']-player['x'],item['z']-player['z']))
            target_distance=2.1 if target['type']=='boss' else 1.25
        else:
            target={'x':0,'z':-3.2};target_distance=.4
            if math.hypot(player['x'],player['z']+4.7)<2.2:page.keyboard.press('e')
        dx=target['x']-player['x'];dz=target['z']-player['z']
        if math.hypot(dx,dz)>target_distance:
            wx,wz=route(player['x'],player['z'],target['x'],target['z'],chapter)
            steer(page,wx-player['x'],wz-player['z'])
        else:hold(page,{'j'})
        if enemies and player['energy']>=100 and any(math.hypot(enemy['x']-player['x'],enemy['z']-player['z'])<4.3 for enemy in enemies):
            page.keyboard.press('q')
        if enemies and target.get('type')=='boss' and target['mode']=='windup' and target['move']%2==1 and target['timer']<.4 and math.hypot(dx,dz)<5:
            steer(page,math.cos(target['angle']),-math.sin(target['angle']))
            if player['dashCooldown']==0:page.keyboard.press('Space')
        page.wait_for_timeout(100)
    else:raise AssertionError('Campaign did not finish within 240 seconds')
    final=page.evaluate('__qa.snapshot()')
    assert final['phase']=='won' and len(final['history'])==3 and not errors
    report={'completed':True,'mode':'real keyboard inputs and menu clicks from a fresh start; snapshot read only','retries':retries,'wallSeconds':round(time.monotonic()-started,2),'trace':trace,'final':final,'runtimeErrors':errors}
    encoded=page.evaluate('__qa.endAudioCapture()')
    (OUT/'game-audio.webm').write_bytes(base64.b64decode(encoded))
    report['audioOffsetSeconds']=audio_offset
    report['audio']='captured from the game Web Audio output; aligned to browser video by wall-clock offset'
    video=page.video
    context.close()
    video.save_as(str(OUT/'full-playthrough.webm'))
    browser.close()
    (OUT/'playthrough.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    print(json.dumps({'completed':True,'wallSeconds':report['wallSeconds'],'score':final['score'],'damage':final['totals']['damage'],'retries':retries},ensure_ascii=False))
