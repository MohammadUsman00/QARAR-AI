import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.resolve("public", "screenshots");

const routes = [
  { path: "/", file: "landing.png" },
  { path: "/login", file: "login.png" },
  { path: "/signup", file: "signup.png" },
  { path: "/onboarding", file: "onboarding.png" },
];

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

for (const route of routes) {
  await page.goto(`${baseURL}${route.path}`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(outDir, route.file),
    fullPage: true,
  });
  console.log(`captured ${route.file}`);
}

await browser.close();
