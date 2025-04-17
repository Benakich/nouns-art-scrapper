const { chromium } = require('playwright');

async function scrapeWarpcast(channel = 'nouns-draws', scrolls = 5) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = `https://warpcast.com/~/channel/${channel}`;

  console.log(`Navigating to: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Scroll to load more
  for (let i = 0; i < scrolls; i++) {
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(1500);
  }

  // Scrape the posts with media
  const results = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid="feed-item"]'));
    return cards.map(card => {
      const text = card.querySelector('[data-testid="cast-text"]')?.innerText || '';
      const username = card.querySelector('[data-testid="username"]')?.innerText || '';
      const images = Array.from(card.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => src.includes('cdn.farcaster'));

      const linkEl = card.querySelector('a[href*="/"]');
      const link = linkEl ? `https://warpcast.com${linkEl.getAttribute('href')}` : '';

      if (images.length === 0) return null;

      return {
        username,
        text,
        media: images,
        timestamp: Date.now(),
        link,
      };
    }).filter(Boolean);
  });

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  return results;
}

// Run if script is executed directly
if (require.main === module) {
  const channel = process.env.CHANNEL || 'nouns-draws';
  scrapeWarpcast(channel).catch(console.error);
}
