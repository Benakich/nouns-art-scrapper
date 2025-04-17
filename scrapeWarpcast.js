const puppeteer = require('puppeteer');

async function scrapeWarpcast(channel = 'nouns-draws', scrolls = 5) {
  const url = `https://warpcast.com/~/channel/${channel}`;
  console.log(`Navigating to: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
  );

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for at least one feed item
  await page.waitForSelector('[data-testid="feed-item"]', { timeout: 20000 });

  // Scroll the feed
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1500);
  }

  // Extract cast data
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
    }).filter(Boolean);
  });

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  return results;
}

// Run the scraper if called directly
if (require.main === module) {
  const channel = process.env.CHANNEL || 'nouns-draws';
  scrapeWarpcast(channel).catch(err => {
    console.error('Scraper error:', err.message);
    process.exit(1);
  });
}
