import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://master.mapa-interactivo-295.pages.dev', { waitUntil: 'networkidle' });

const notifs = await page.evaluate(() => {
  const data = localStorage.getItem('mapa-terremoto-notifications');
  return data ? JSON.parse(data) : [];
});

console.log(JSON.stringify(notifs, null, 2));

await browser.close();
