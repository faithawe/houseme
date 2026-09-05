import { chromium } from "@playwright/test";

const captureId = process.argv[2];
const endpoint = process.argv[3];
const baseUrl = process.argv[4] ?? "http://localhost:3000/";

if (!captureId || !endpoint) {
  console.error(
    "Usage: node scripts/figma-capture-landing.mjs <captureId> <endpoint> [baseUrl]",
  );
  process.exit(1);
}

console.log("Launching browser…");
const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(120000);

page.on("console", (msg) => console.log(`[page] ${msg.text()}`));
page.on("pageerror", (err) => console.error(`[page error] ${err.message}`));

console.log(`Loading ${baseUrl}`);
await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(4000);

console.log("Loading Figma capture script…");
const scriptResponse = await page.context().request.get(
  "https://mcp.figma.com/mcp/html-to-design/capture.js",
);
const scriptText = await scriptResponse.text();

await page.evaluate((script) => {
  if (window.figma?.captureForDesign) return;
  const el = document.createElement("script");
  el.textContent = script;
  document.head.appendChild(el);
}, scriptText);

await page.waitForFunction(
  () => typeof window.figma?.captureForDesign === "function",
  { timeout: 30000 },
);

console.log("Submitting capture (this can take a few minutes)…");
const result = await page.evaluate(
  async ({ captureId: id, endpoint: url }) =>
    window.figma.captureForDesign({
      captureId: id,
      endpoint: url,
      selector: "body",
    }),
  { captureId, endpoint },
);

console.log("Done:", JSON.stringify(result));
await browser.close();
