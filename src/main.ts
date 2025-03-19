import puppeteer, { Browser } from "puppeteer-core";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const demoLink =
  "https://www.district.in/tata-ipl-2025-match-09-gujarat-titans-vs-mumbai-indians-in-ahmedabad-march29/event";

async function start() {
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      "ws://127.0.0.1:9222/devtools/browser/6c8a1c0b-ab82-4058-b970-aacb875f2518",
  });

  async function doIt() {
    let c = 0;
    while (true) {
      const page = await browser.newPage();
      await page.setViewport({
        width: 1280,
        height: 800,
      });
      await page.goto(
        "https://www.district.in/tata-ipl-2025-match-03-chennai-super-kings-vs-mumbai-indians-in-chennai-march23/event",
      );
      await page.waitForNetworkIdle();
      // check for notify me button;
      const noti_button = await page.$(
        "#there-you-go > div > main > div > div.css-vic76r > div > div > div > div > div.css-4nv82y > div > div.css-slumcv > div",
      );
      if (!noti_button) {
        console.log("got it");
        // await sleep(1000);
        const bookBtn = await page.waitForSelector(
          "#there-you-go > div > main > div > div.css-vic76r > div > div > div > div > div.css-4nv82y > div > div.css-1yqk2cb > div > p",
        );
        if (!bookBtn) {
          console.log("error book btn not found");
        } else {
          await bookBtn.evaluate((b) => b.click());
        }
        return page;
      }
      await sleep(1000);
      await page.close();
      console.log("page repopening");
      c += 1;
    }
  }
  doIt();
  // await browser.disconnect();
}

start();
