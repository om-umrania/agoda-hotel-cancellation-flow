import asyncio, sys, pathlib
from playwright.async_api import async_playwright
OUT = pathlib.Path(__file__).resolve().parent.parent
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1280,"height":720})
        await pg.goto("file://" + str(OUT/"deck.html")); await pg.wait_for_timeout(500)
        await pg.pdf(path=str(OUT/"final-submission.pdf"), width="1280px", height="720px", print_background=True)
        # overflow report
        r = await pg.evaluate("""() => [...document.querySelectorAll('.slide')].map((s,i)=>{let bad=[];s.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect(),sr=s.getBoundingClientRect(); if(e.closest('svg')) return; if(r.bottom>sr.bottom-28||r.right>sr.right-20) bad.push(e.className||e.tagName)}); return [i+1,bad.length,bad.slice(0,3).join('|')]})""")
        print(r)
        await b.close()
asyncio.run(main())
