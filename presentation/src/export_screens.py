"""Export each wireframe (A to P) from deck.html as a PNG."""
import asyncio, pathlib, re
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT.parent / "wireframes" / "screens"
NAMES = dict(A="my-trips", B="booking-details", C="preview-loading", D="preview-full-refund", E="preview-partial-refund", F="preview-no-refund",
             G="reason-and-final-review", H="sending", I="cancellation-confirmed", J="outcome-unknown", K="fee-waiver-request", L="fee-waiver-pending",
             M="fee-waiver-outcome", N="cannot-cancel-in-app", O="already-cancelled", P="could-not-cancel")
async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=2)
        await pg.goto("file://" + str(ROOT / "deck.html"))
        heads = pg.locator(".wfhead")
        for i in range(await heads.count()):
            code = (await heads.nth(i).locator(".code").inner_text()).strip()
            ph = heads.nth(i).locator("xpath=following-sibling::div[1]").locator(".pw").first
            await ph.screenshot(path=str(OUT / f"{code}-{NAMES[code]}.png"))
        await b.close()
asyncio.run(main())
