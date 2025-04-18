import puppeteer from "puppeteer";

const CHANNEL_URL = "https://warpcast.com/~/channel/nouns-draws";

const main = async () => {
  const browser = await puppeteer.launch({
    headless: "new", // use 'false' locally if debugging
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to:", CHANNEL_URL);
  await page.goto(CHANNEL_URL, { waitUntil: "networkidle2", timeout: 0 });

  try {
    // Wait for posts to appear
    await page.waitForSelector('[data-testid="feed-item"]', { timeout: 20000 });
    console.log("✅ Found feed items");

    const posts = await page.$$eval('[data-testid="feed-item"]', (items) => {
      return items.map((el) => {
        const textEl = el.querySelector('[data-testid="cast-text"]');
        const imgEl = el.querySelector("img");
        return {
          text: textEl?.innerText || null,
          image: imgEl?.src || null,
        };
      });
    });

    console.log("Extracted posts:", posts.slice(0, 5)); // log only first few
  } catch (err) {
    console.error("❌ Error while scraping:", err);
  }

  await browser.close();
};

main();
