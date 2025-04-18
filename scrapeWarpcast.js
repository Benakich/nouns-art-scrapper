import puppeteer from "puppeteer";

const main = async () => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium", // Use system Chromium
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto("https://warpcast.com/~/channel/nouns-draws", {
    waitUntil: "networkidle2",
    timeout: 0
  });

  await page.waitForSelector('[data-testid="feed-item"]', { timeout: 20000 });

  const posts = await page.$$eval('[data-testid="feed-item"]', (items) =>
    items.map((el) => {
      const text = el.querySelector('[data-testid="cast-text"]');
      const img = el.querySelector("img");
      return {
        text: text?.innerText,
        image: img?.src
      };
    })
  );

  console.log("Extracted Posts:", posts.slice(0, 5));
  await browser.close();
};

main();
