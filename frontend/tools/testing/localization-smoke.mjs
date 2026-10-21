// Offline integration checks against the production bundle, using existing IPC fixtures.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { chromium, expect } from "@playwright/test";
import { installBrowserFixture } from "../performance/browser-fixture.mjs";
import { installSessionFixture } from "./desktop-session-fixture.mjs";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const output = process.env.ARTCRAFT_LOCALIZATION_OUTPUT;
assert(output, "Set ARTCRAFT_LOCALIZATION_OUTPUT to a local evidence directory.");
await fs.mkdir(output, { recursive: true });
const url = "http://127.0.0.1:5193";
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--config", "apps/artcraft/vite.config.ts", "--host", "127.0.0.1", "--port", "5193", "--strictPort"], {
  cwd: workspace, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (data) => { serverLog += data; });
server.stderr.on("data", (data) => { serverLog += data; });
let browser, page;
const results = [];
const errors = [];
try {
  const deadline = Date.now() + 30000;
  while (true) {
    try { if ((await fetch(url)).ok) break; } catch {}
    if (Date.now() > deadline || server.exitCode !== null) throw new Error(`Preview failed: ${serverLog}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(installBrowserFixture);
  await context.addInitScript(installSessionFixture, "zh-CN");
  await context.route("**/*", (route) => {
    const target = route.request().url();
    return target.startsWith(url) || target.startsWith("blob:") || target.startsWith("data:") ? route.continue() : route.abort();
  });
  page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { name: /今天想要.*创作.*什么/ })).toBeVisible();
  await page.screenshot({ path: path.join(output, "home.zh-CN.png"), fullPage: true });
  results.push("Chinese startup and home");

  async function appearance(language) {
    await page.getByRole("button", { name: language === "en" ? "Settings" : "设置", exact: true }).click();
    await page.getByRole("button", { name: language === "en" ? "Appearance" : "外观", exact: true }).click();
  }
  await appearance("zh-CN");
  await page.getByLabel("语言", { exact: true }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByLabel("Language", { exact: true })).toHaveValue("en");
  await page.screenshot({ path: path.join(output, "settings.en.png"), fullPage: true });
  await page.evaluate(() => { window.__LOCALIZATION_FAIL_SAVE__ = true; });
  await page.getByLabel("Language", { exact: true }).selectOption("zh-CN");
  await expect(page.getByRole("alert")).toContainText("Could not save the language preference");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.evaluate(() => { window.__LOCALIZATION_FAIL_SAVE__ = false; });
  await page.getByLabel("Language", { exact: true }).selectOption("zh-CN");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.screenshot({ path: path.join(output, "settings.zh-CN.png"), fullPage: true });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  results.push("Live language switch, save failure, and restart persistence");

  await page.getByRole("button", { name: /生成图像.*生成 AI 图像/ }).click();
  const prompt = page.getByRole("textbox").first();
  await prompt.fill("中文输入测试，User prompt Save 123");
  await prompt.evaluate((input) => { window.__LOCALIZATION_INPUT__ = input; input.setSelectionRange(2, 6); });
  await appearance("zh-CN");
  await page.getByLabel("语言", { exact: true }).selectOption("en");
  await page.keyboard.press("Escape");
  await expect(prompt).toHaveValue("中文输入测试，User prompt Save 123");
  assert(await prompt.evaluate((input) => input === window.__LOCALIZATION_INPUT__), "Prompt DOM identity survived switch");
  await expect(page.getByRole("heading", { name: /Create.*Image/ }).first()).toBeVisible();
  await page.screenshot({ path: path.join(output, "image.en.png"), fullPage: true });
  await appearance("en");
  await page.getByLabel("Language", { exact: true }).selectOption("zh-CN");
  await page.keyboard.press("Escape");
  await expect(prompt).toHaveValue("中文输入测试，User prompt Save 123");
  await page.screenshot({ path: path.join(output, "image.zh-CN.png"), fullPage: true });
  results.push("Generation prompt unchanged across both languages; no request submitted");

  for (const size of [{ width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(size);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal page overflow");
    await page.screenshot({ path: path.join(output, `image.${size.width}.png`), fullPage: true });
  }
  results.push("1280×800 and 1024×768 layouts");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url);
  await page.getByRole("button", { name: /图像编辑器.*轻松编辑/ }).click();
  await page.getByRole("button", { name: "空白画布", exact: true }).click();
  await page.getByRole("button", { name: "512 × 512", exact: true }).click();
  await page.getByRole("button", { name: "创建画布", exact: true }).click();
  const canvas = page.locator(".konvajs-content canvas").first();
  await expect(canvas).toBeVisible({ timeout: 30000 });
  await canvas.evaluate((element) => { window.__LOCALIZATION_CANVAS__ = element; });
  const pixels = () => page.locator(".konvajs-content canvas").evaluateAll((elements) => elements.map((element) => element.toDataURL()));
  const drawing = () => page.evaluate(() => window.Konva.stages.flatMap((stage) => stage.find("Line").map((line) => line.getAttrs())));
  const blankDrawing = await drawing();
  const blank = await pixels();
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.keyboard.press("3");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 30, { steps: 8 });
  await page.mouse.up();
  await page.mouse.move(1400, 50);
  await expect.poll(async () => JSON.stringify(await pixels())).not.toBe(JSON.stringify(blank));
  const before = await pixels();
  const beforeDrawing = await drawing();
  assert(beforeDrawing.some((line) => line.points?.length > 4), "An actual brush stroke exists");
  await appearance("zh-CN");
  await page.getByLabel("语言", { exact: true }).selectOption("en");
  await page.keyboard.press("Escape");
  assert(await canvas.evaluate((element) => element === window.__LOCALIZATION_CANVAS__), "Canvas stayed mounted");
  await page.mouse.move(1400, 50);
  const after = await pixels();
  for (let index = 0; index < before.length; index++) {
    if (before[index] !== after[index]) {
      await fs.writeFile(path.join(output, `canvas-before.${index}.png`), Buffer.from(before[index].split(",")[1], "base64"));
      await fs.writeFile(path.join(output, `canvas-after.${index}.png`), Buffer.from(after[index].split(",")[1], "base64"));
    }
  }
  assert.deepEqual(await drawing(), beforeDrawing, "Brush node properties survived switch");
  await expect.poll(async () => JSON.stringify(await pixels()) === JSON.stringify(before)).toBe(true);
  await page.screenshot({ path: path.join(output, "canvas.en.png"), fullPage: true });
  await appearance("en");
  await page.getByLabel("Language", { exact: true }).selectOption("zh-CN");
  await page.keyboard.press("Escape");
  await page.screenshot({ path: path.join(output, "canvas.zh-CN.png"), fullPage: true });
  await page.keyboard.press("Control+z");
  await expect.poll(async () => JSON.stringify(await drawing())).toBe(JSON.stringify(blankDrawing));
  await page.keyboard.press("Control+Shift+z");
  await expect.poll(async () => JSON.stringify(await drawing())).toBe(JSON.stringify(beforeDrawing));
  results.push("2D canvas retains real brush strokes and undo/redo history across language changes");

  for (const [name, card] of [
    ["video", /生成视频.*从图像生成视频/],
    ["audio", /生成音频.*生成音乐与音效/],
    ["video-editor", /视频编辑器.*时间轴/],
    ["moodboard", /情绪板.*收集参考素材/],
  ]) {
    await page.goto(url);
    await page.getByRole("button", { name: card }).click();
    await expect(page.getByRole("button", { name: "设置", exact: true })).toBeVisible();
    if (name === "video" || name === "audio") await expect(page.getByRole("textbox").first()).toBeVisible({ timeout: 60000 });
    if (name === "video-editor") {
      const welcome = page.getByRole("dialog");
      await expect(welcome).toBeVisible({ timeout: 60000 });
      await welcome.getByRole("button", { name: "关闭", exact: true }).click();
      await expect(page.getByRole("button", { name: "导出", exact: true })).toBeVisible({ timeout: 30000 });
    }
    if (name === "moodboard") await expect(page.getByText("开始收集灵感", { exact: true })).toBeVisible({ timeout: 30000 });
    await page.screenshot({ path: path.join(output, `${name}.zh-CN.png`), fullPage: true });
    await fs.writeFile(path.join(output, `${name}.dom.txt`), await page.locator("body").innerText());
    results.push(`${name} opens offline`);
  }

  await page.goto(url);
  await page.getByRole("button", { name: /3D 场景.*精准控制/ }).click();
  const stage = page.locator("canvas").first();
  await expect(stage).toBeVisible({ timeout: 60000 });
  await stage.evaluate((element) => { window.__LOCALIZATION_STAGE__ = element; });
  const contextsBefore = await page.evaluate(() => window.__ARTCRAFT_COUNTERS__.webglContexts);
  await appearance("zh-CN");
  await page.getByLabel("语言", { exact: true }).selectOption("en");
  await page.keyboard.press("Escape");
  assert(await stage.evaluate((element) => element === window.__LOCALIZATION_STAGE__), "3D canvas stayed mounted");
  await appearance("en");
  await page.getByLabel("Language", { exact: true }).selectOption("zh-CN");
  await page.keyboard.press("Escape");
  await page.screenshot({ path: path.join(output, "stage3d.zh-CN.png"), fullPage: true });
  assert.equal(await page.evaluate(() => window.__ARTCRAFT_COUNTERS__.webglContexts), contextsBefore, "3D renderer was not reconstructed");
  results.push("3D viewport and WebGL renderer stay mounted across language changes");
  assert.deepEqual(errors, [], "Application runtime errors");
  console.log(JSON.stringify({ passed: results, errors }, null, 2));
} catch (error) {
  if (page) {
    await page.screenshot({ path: path.join(output, "failure.png"), fullPage: true }).catch(() => {});
    await fs.writeFile(path.join(output, "failure-dom.txt"), await page.locator("body").innerText());
  }
  throw error;
} finally {
  await fs.writeFile(path.join(output, "browser-results.json"), JSON.stringify({ passed: results, errors }, null, 2));
  await browser?.close();
  server.kill();
}
