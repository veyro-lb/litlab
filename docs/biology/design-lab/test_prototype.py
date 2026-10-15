"""Offline smoke/visual testing for LitLab Biology Design Lab. No production services used."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json
ROOT=Path(__file__).parent
html=(ROOT/'index.html').read_text().replace('<link rel="stylesheet" href="styles.css">','').replace('<script defer src="app.js"></script>','')
css=(ROOT/'styles.css').read_text()
js=(ROOT/'app.js').read_text()
def load(page):
    page.goto('about:blank')
    page.set_content(html)
    page.add_style_tag(content=css)
    page.add_script_tag(content=js)
def navigate(page,hash):
    page.evaluate('(h)=>{location.hash=h}',hash)
    page.wait_for_timeout(65)
results=[]
def record(name,passed,extra=''):
    results.append({'test':name,'pass':bool(passed),'details':str(extra)})
    print(('PASS' if passed else 'FAIL')+' '+name+(' :: '+str(extra) if extra else ''))
def shot(page,name):
    page.screenshot(path=str(ROOT/'screenshots'/name),full_page=True,animations='disabled')
def overflow(page):
    return page.evaluate('({width:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth, body:document.body.scrollWidth})')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/lib/chromium/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,label in [(1440,'desktop'),(768,'tablet'),(390,'phone'),(320,'narrow')]:
        page=browser.new_page(viewport={'width':width,'height':880},device_scale_factor=1,reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        load(page)
        navigate(page,'#dashboard')
        page.wait_for_timeout(150)
        record(label+' dashboard loads',page.get_by_role('heading',name='Topic directory').count()==1 and not errors,errors)
        record(label+' no page overflow',overflow(page)['scroll']<=width,overflow(page))
        shot(page,label+'-dashboard-light.png')
        navigate(page,'#topic')
        record(label+' topic displays eight IDs',len(page.locator('.understanding-list li').all())==8)
        shot(page,label+'-topic-light.png') if label in ('desktop','phone') else None
        navigate(page,'#lesson/2')
        record(label+' lesson shows ID and bond diagram',page.locator('.lesson-article .curriculum-line').inner_text().startswith('A1.1.2') and page.locator('svg[aria-labelledby="diagram-title diagram-desc"]').count()==1)
        record(label+' lesson no overflow',overflow(page)['scroll']<=width,overflow(page))
        shot(page,label+'-lesson-light.png')
        if width<=760:
            toggle=page.locator('#sections-toggle')
            toggle.click()
            record(label+' mobile navigation opens',toggle.get_attribute('aria-expanded')=='true' and page.locator('.lesson-sidebar').is_visible())
            shot(page,label+'-navigation-open.png')
            page.get_by_role('button',name='A1.1.3 Cohesion and its biological importance').click()
            page.wait_for_timeout(80)
            record(label+' mobile section navigation',page.locator('.curriculum-line').inner_text().startswith('A1.1.3'))
        else:
            page.get_by_role('button',name='A1.1.3 Cohesion and its biological importance').click()
            page.wait_for_timeout(80)
            record(label+' desktop section navigation',page.locator('.curriculum-line').inner_text().startswith('A1.1.3'))
        navigate(page,'#revision')
        shot(page,label+'-revision-light.png') if label in ('desktop','phone') else None
        page.get_by_role('button',name='Reveal key explanation').first.click()
        record(label+' revision reveal',page.locator('#revision-answer-1').is_visible())
        navigate(page,'#practice')
        shot(page,label+'-practice-light.png') if label in ('desktop','phone') else None
        page.get_by_role('radio',name='A. Each O–H bond is a hydrogen bond.').check()
        record(label+' MCQ feedback',page.locator('#feedback-bonding').inner_text().startswith('Not quite'))
        page.locator('#question-bonding').get_by_role('button',name='Try again').click()
        record(label+' try again resets',not page.locator('#question-bonding input[type=radio]:checked').count())
        page.get_by_role('button',name='Paper 1B · Data').click()
        record(label+' data table and response',page.get_by_role('table').count()==1 and page.locator('#data-answer').count()==1)
        page.get_by_role('button',name='Paper 2 · Written').click()
        page.locator('#paper2-answer').fill('Original student draft to evaluate manually.')
        page.get_by_role('button',name='Compare with marking guidance').click()
        record(label+' Paper 2 marking reveal, no automated mark',page.locator('#model-2').is_visible() and 'not automatic marking' in page.locator('#model-2').inner_text())
        navigate(page,'#lesson/2')
        page.get_by_role('button',name='Hide partial charges for recall').click()
        record(label+' labels hidden',page.locator('.diagram-board').first.evaluate("el=>el.classList.contains('labels-hidden')"))
        page.get_by_role('button',name='Enlarge figure').click()
        record(label+' enlarged figure opens',page.locator('#figure-modal').is_visible())
        page.keyboard.press('Escape')
        record(label+' modal closes on Escape',not page.locator('#figure-modal').is_visible())
        page.locator('#theme-toggle').click()
        record(label+' dark mode toggle',page.locator('body').get_attribute('data-theme')=='dark')
        shot(page,label+'-lesson-dark.png') if label in ('desktop','phone','narrow') else None
        record(label+' dark no overflow',overflow(page)['scroll']<=width,overflow(page))
        record(label+' no script errors',len(errors)==0,errors)
        page.close()
    page=browser.new_page(viewport={'width':1440,'height':880})
    load(page)
    navigate(page,'#dashboard')
    record('SL lists 34 topics',page.get_by_text('Showing 34 of 34 SL topics').count()==1)
    page.locator('input[name=level][value=HL]').check()
    record('HL lists 40 topics',page.get_by_text('Showing 40 of 40 HL topics').count()==1)
    page.get_by_role('searchbox',name='Search Biology topics').fill('proteins')
    record('search filters results',page.get_by_text('Showing 1 of 40 HL topics').count()==1)
    navigate(page,'#lesson/8')
    record('HL section 8 visible',page.locator('.curriculum-line').inner_text().startswith('A1.1.8'))
    page.locator('input[name=level][value=SL]').check()
    record('SL blocks HL content from navigation',page.locator('.curriculum-line').inner_text().startswith('A1.1.6') and page.get_by_role('button',name='A1.1.8').count()==0)
    record('site has no external dependencies',all(('https:' not in x and 'http:' not in x) for x in page.evaluate('performance.getEntriesByType("resource").map(r=>r.name)')))
    page.close()
    browser.close()
(ROOT/'test-results.json').write_text(json.dumps({'tests':results,'passed':sum(x['pass'] for x in results),'total':len(results)},indent=2))
print('SUMMARY',sum(x['pass'] for x in results),'/',len(results))
if not all(x['pass'] for x in results):raise SystemExit(1)
