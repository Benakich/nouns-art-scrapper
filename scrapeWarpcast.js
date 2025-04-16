const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

async function scrapeWarpcast(channel = "nouns-animators", maxScrolls = 5) {
  const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: process.env.CHROME_BIN || await chromium.executablePath,
  headless: true,
});

  const page = await browser.newPage();
  const url = `https://warpcast.com/~/channel/${channel}`;
  await page.goto(url, { waitUntil: "networkidle2" });

  for (let i = 0; i < maxScrolls; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1500);
  }

  const results = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid="feed-item"]'));
    return cards.map(card => {
      const text = card.querySelector('[data-testid="cast-text"]')?.innerText || "";
      const username = card.querySelector('[data-testid="username"]')?.innerText || "";
      const media = Array.from(card.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => src.includes('cdn.farcaster'));
      const link = card.querySelector('a[href*="/"]')?.href || "";
      return { username, text, media, link };
    });
  });

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

scrapeWarpcast().catch(console.error);
