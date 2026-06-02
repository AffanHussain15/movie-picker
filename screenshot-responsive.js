const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, 'responsive-screenshots');

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812  },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1280, height: 900  },
];

const PAGES = [
  { name: 'home',         path: '/'               },
  { name: 'about',        path: '/about'           },
  { name: 'watchlist',    path: '/watchlist'       },
  { name: 'group-create', path: '/group/create'    },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();

    for (const pg of PAGES) {
      try {
        await page.goto(`${BASE_URL}${pg.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);
        const file = path.join(OUT_DIR, `${vp.name}-${pg.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`OK  ${vp.name.padEnd(8)} ${pg.path}`);
      } catch (e) {
        console.log(`ERR ${vp.name.padEnd(8)} ${pg.path} — ${e.message}`);
      }
    }
    await ctx.close();
  }

  await browser.close();
  console.log('\nDone. Screenshots saved to:', OUT_DIR);
})();
