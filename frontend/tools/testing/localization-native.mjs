// Exercise the packaged Windows executable and its real Rust preference commands.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { chromium, expect } from "@playwright/test";

const output = process.env.ARTCRAFT_LOCALIZATION_OUTPUT;
assert(output && process.platform === "win32", "Run on Windows with ARTCRAFT_LOCALIZATION_OUTPUT set.");
const executable = path.resolve("../target/x86_64-pc-windows-msvc/debug/artcraft.exe");
const checksum = createHash("sha256");
for await (const chunk of createReadStream(executable)) checksum.update(chunk);
const executableSha256 = checksum.digest("hex");
const preferenceFile = path.join(process.env.USERPROFILE, "Artcraft/settings/app_preferences.json");
const originalPreferences = await fs.readFile(preferenceFile).catch((error) => {
  if (error.code === "ENOENT") return null;
  throw error;
});
const child = spawn(executable, [], {
  windowsHide: true,
  stdio: "ignore",
  env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: "--remote-debugging-port=9333 --remote-debugging-address=127.0.0.1" },
});
let browser;
const passed = [];
try {
  const deadline = Date.now() + 45000;
  while (!browser && Date.now() < deadline && child.exitCode === null) {
    try { browser = await chromium.connectOverCDP("http://127.0.0.1:9333"); }
    catch { await new Promise((resolve) => setTimeout(resolve, 300)); }
  }
  assert(browser, `Native WebView2 did not become available (exit ${child.exitCode}).`);
  const context = browser.contexts()[0];
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["tauri.localhost", "ipc.localhost", "asset.localhost", "127.0.0.1", "localhost"].includes(url.hostname) || ["data:", "blob:", "tauri:"].includes(url.protocol)
      ? route.continue() : route.abort();
  });
  let page;
  while (!page && Date.now() < deadline) {
    page = context.pages().find((candidate) => /tauri\.localhost|tauri:\/\//.test(candidate.url()));
    if (!page) await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert(page, "Native app page not found.");
  await expect(page.locator("#root")).not.toBeEmpty({ timeout: 30000 });
  assert.equal(await page.title(), "ArtCraft");
  passed.push("Windows executable launched; embedded frontend rendered in real WebView2");

  for (const [locale, filename] of [["en", "native.en.png"], ["zh-CN", "native.zh-CN.png"]]) {
    const before = await page.locator("html").getAttribute("lang");
    await page.getByRole("button", { name: before === "en" ? "Settings" : "设置", exact: true }).click();
    await page.getByRole("button", { name: before === "en" ? "Appearance" : "外观", exact: true }).click();
    await page.getByLabel(before === "en" ? "Language" : "语言", { exact: true }).selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const success = await page.evaluate(async (language) => {
      const saved = await window.__TAURI_INTERNALS__.invoke("get_app_preferences_command");
      return saved.preferences.ui_language === language;
    }, locale);
    assert(success, `Native preference write/read failed for ${locale}`);
    await page.screenshot({ path: path.join(output, `native.settings.${locale}.png`), fullPage: true });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("#root")).not.toBeEmpty();
    await page.screenshot({ path: path.join(output, filename), fullPage: true });
    passed.push(`Native settings UI saves ${locale} through real Rust IPC; WebView reload restores it`);
  }
  console.log(JSON.stringify({ passed, executableSha256, paidApiCalls: 0 }, null, 2));
} finally {
  await fs.writeFile(path.join(output, "native-results.json"), JSON.stringify({ passed, executableSha256, paidApiCalls: 0 }, null, 2));
  await browser?.close().catch(() => {});
  if (child.exitCode === null) child.kill();
  await new Promise((resolve) => { if (child.exitCode !== null) resolve(); else { child.once("exit", resolve); setTimeout(resolve, 3000); } });
  if (originalPreferences) await fs.writeFile(preferenceFile, originalPreferences);
}
