const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

async function scrapeWarpcast(channel = "nouns-draws", maxScrolls = 6) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: process.env.CHROME_BIN || await chromium.executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  const url = `https://warpcast.com/~/channel/${channel}`;
  console.log("Navigating to:", url);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // 🕐 Wait for feed-item cards to load
  try {
    await page.waitForSelector('[data-testid="feed-item"]', { timeout: 10000 });
  } catch (e) {
    console.log("Feed items not found in time");
  }

  // Scroll to load more content
  for (let i = 0; i < maxScrolls; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(3000);
  }

  const results = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid="feed-item"]'));
    return cards.map(card => {
      const text = card.innerText || "";
      const username = card.querySelector('[data-testid="username"]')?.innerText || "";
      const imgs = Array.from(card.querySelectorAll('img')).map(img => img.src);
      const media = imgs.filter(src => src.includes("cdn.farcaster"));
      const link = card.querySelector('a[href*="/"]')?.href || "";
      return { username, text, media, link };
    }).filter(c => c.media.length > 0);
  });

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

scrapeWarpcast("nouns-draws").catch(console.error);
