const { chromium } = require('playwright');

async function scrapeWarpcast(channel = 'nouns-draws', scrolls = 5) {
  const browser = await chromium.launch({
    headless: true,
    slowMo: 50 // mimic more realistic behavior
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const url = `https://warpcast.com/~/channel/${channel}`;

  console.log(`Navigating to: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // ⏳ Wait up to 20s for at least one cast to appear
  await page.waitForSelector('[data-testid="feed-item"]', { timeout: 20000 });

  // Scroll to load more posts
  for (let i = 0; i < scrolls; i++) {
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(1500);
  }

  // Extract cast data with images
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
        link
      };
    }).filter(Boolean); // Remove null entries
  });

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  return results;
}

// Run the script if called directly
if (require.main === module) {
  const channel = process.env.CHANNEL || 'nouns-draws';
  scrapeWarpcast(channel).catch(err => {
    console.error('Scraper error:', err.message);
    process.exit(1);
  });
}
