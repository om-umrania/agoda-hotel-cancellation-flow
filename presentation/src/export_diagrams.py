"""Export the IA and flow slides (pages 3 and 4) as PNGs for the flows folder."""
import asyncio, pathlib
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT.parent / "flows"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=2)
        await pg.goto("file://" + str(ROOT / "deck.html"))
        s = pg.locator(".slide")
        await s.nth(2).screenshot(path=str(OUT / "information-architecture.png"))
        await s.nth(3).screenshot(path=str(OUT / "cancellation-flow.png"))
        await b.close()
asyncio.run(main())
