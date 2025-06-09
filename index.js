const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function takeScreenshots(options) {
  // Set default options
  const {
    url = "http://localhost:8000/demo/",
    outputDir = "./screenshots",
    selectorsToRemove = [],
    domainsToBlock = [
      "ketch.com",
      "ketchcdn.com",
      "cookiebot.com",
      "cookielaw.org",
      "onetrust.com",
      "consensu.org",
      "trustarc.com",
      "evidon.com",
      "cookiepro.com",
    ],
    viewports = {
      desktop: { width: 1920, height: 1080 },
      mobile: {
        width: 430,
        height: 932,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    waitTimeAfterPageLoad = 1500,
  } = options;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Helper function for waiting that works across Puppeteer versions
  const wait = async (ms) => {
    if (typeof page.waitForTimeout === "function") {
      await page.waitForTimeout(ms);
    } else if (typeof page.waitFor === "function") {
      await page.waitFor(ms);
    } else {
      // Fallback to setTimeout with Promise
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  };

  // Helper function to remove elements based on selectors
  async function removeElements(selectors) {
    for (const selector of selectors) {
      try {
        // Wait for the element to be available
        await page
          .waitForSelector(selector, { timeout: 5000 })
          .then(async () => {
            console.log(`Found element with selector: ${selector}`);

            // Remove the element from DOM
            await page.evaluate((sel) => {
              const element = document.querySelector(sel);
              if (element) {
                element.remove();
                console.log(`Removed element with selector: ${sel}`);
                return true;
              }
              return false;
            }, selector);
          })
          .catch(() => {
            console.log(`No element found with selector: ${selector}`);
          });
      } catch (error) {
        console.error(
          `Error handling element with selector ${selector}:`,
          error
        );
      }
    }
  }

  // Block specified domains
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const requestUrl = request.url().toLowerCase();

    // Check if the request URL contains any of the blocked domains
    if (domainsToBlock.some((domain) => requestUrl.includes(domain))) {
      console.log(`Blocking request to: ${request.url()}`);
      request.abort();
    } else {
      request.continue();
    }
  });

  // --- Desktop Screenshot ---
  await page.setViewport(viewports.desktop);
  await page.goto(url, { waitUntil: "networkidle2" });
  await removeElements(selectorsToRemove);
  // Wait for animations to finish
  await wait(waitTimeAfterPageLoad);
  await page.screenshot({
    path: path.join(outputDir, "desktop.png"),
    fullPage: true,
  });

  // --- Mobile Screenshot ---
  try {
    // Set mobile viewport and user agent
    await page.setViewport(viewports.mobile);
    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1"
    );

    await page.goto(url, { waitUntil: "networkidle2" });
    await removeElements(selectorsToRemove);
    // Wait for animations to finish
    await wait(waitTimeAfterPageLoad);
    await page.screenshot({
      path: path.join(outputDir, "mobile.png"),
      fullPage: true,
    });
  } catch (error) {
    console.error("Error during mobile emulation:", error);
  }

  await browser.close();
  console.log(`Screenshots saved to: ${outputDir}`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let url = null;
  let folderName = null;
  let selectorsToRemove = null;
  let domainsToBlock = null;

  // Parse positional arguments
  if (args[0] && !args[0].startsWith("--")) {
    url = args[0];
  }

  if (args[1] && !args[1].startsWith("--")) {
    folderName = args[1];
  }

  // Parse named arguments
  for (const arg of args) {
    if (arg.startsWith("--selectors=")) {
      selectorsToRemove = arg.replace("--selectors=", "").split(",");
    }

    if (arg.startsWith("--domains=")) {
      domainsToBlock = arg.replace("--domains=", "").split(",");
    }
  }

  return {
    url: url || "http://localhost:8000/demo/",
    folderName: folderName || "screenshots",
    selectorsToRemove: selectorsToRemove || [".backgroundCreateYourPage"],
    domainsToBlock: domainsToBlock || [
      "ketch.com",
      "ketchcdn.com",
      "cookiebot.com",
      "cookielaw.org",
      "onetrust.com",
      "consensu.org",
      "trustarc.com",
      "evidon.com",
      "cookiepro.com",
    ],
  };
}

// Parse arguments and run the screenshot function
const args = parseArgs();
const outputDir = path.join("./screenshots/", args.folderName);

// Run the screenshot function with options
console.log(`Taking screenshots of ${args.url}`);
console.log(`Saving to folder: ${outputDir}`);
console.log(`Elements to remove: ${args.selectorsToRemove.join(", ")}`);
console.log(`Domains to block: ${args.domainsToBlock.join(", ")}`);

takeScreenshots({
  url: args.url,
  outputDir,
  selectorsToRemove: args.selectorsToRemove,
  domainsToBlock: args.domainsToBlock,
});
