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

  // Wait extra time for JS to render posts
  await page.waitForTimeout(7000);

  // Scroll a few times to load more content
  for (let i = 0; i < maxScrolls; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(3000);
  }

  const results = await page.evaluate(() => {
    const posts = [];
    const cards = document.querySelectorAll('[data-testid="feed-item"]');

    cards.forEach(card => {
      const text = card.innerText || "";
      const username = card.querySelector('[data-testid="username"]')?.innerText || "";
      const imgs = Array.from(card.querySelectorAll('img')).map(img => img.src);
      const media = imgs.filter(src => src.includes("cdn.farcaster"));
      const castLinkEl = card.querySelector('a[href^="/"]');
      const castLink = castLinkEl ? `https://warpcast.com${castLinkEl.getAttribute("href")}` : "";

      if (media.length) {
        posts.push({ username, text, media, castLink });
      }
    });

    return posts;
  });

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

scrapeWarpcast("nouns-draws").catch(console.error);
