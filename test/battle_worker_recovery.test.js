const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { chromium } = require("playwright");

test("battle generation retries after one self-contained worker network failure", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: path.resolve(__dirname, "../vite.config.js"),
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => window.pu && window.SudokuTools?.generatePuzzle && window.SudokuGenerator,
    );
    let abortedRequests = 0;
    await page.route("**/js/sudoku_generator_worker_bundle.js*", async (route) => {
      if (abortedRequests++ === 0) await route.abort("failed");
      else await route.continue();
    });
    const result = await page.evaluate(() => new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({ type: "timeout" }), 20000);
      document.addEventListener("sudoku-generated", (event) => {
        clearTimeout(timeout);
        resolve({ type: "result", givens: event.detail.givens });
      }, { once: true });
      document.addEventListener("sudoku-generation-error", (event) => {
        clearTimeout(timeout);
        resolve({ type: "error", message: event.detail });
      }, { once: true });
      window.SudokuTools.prepareBattleGrid(6);
      window.SudokuTools.generatePuzzle(6, ["classic"], {}, null, 123, "easy");
    }));
    assert.equal(abortedRequests >= 1, true);
    assert.equal(result.type, "result", result.message || "generation timed out");
  } finally {
    await browser.close();
    await server.close();
  }
});

test("Windoku generation cache-busts the self-contained worker after startup fails", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: path.resolve(__dirname, "../vite.config.js"),
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.pu && window.SudokuTools?.generatePuzzle && window.SudokuGenerator);
    await page.route("**/js/sudoku_generator_worker_bundle.js*", async (route) => {
      const retry = new URL(route.request().url()).searchParams.has("retry");
      if (retry) await route.continue();
      else await route.abort("failed");
    });
    const result = await page.evaluate(() => new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({
        type: "timeout",
        message: `${document.getElementById("sudoku-solver-status")?.textContent || ""}: ${document.getElementById("sudoku-solver-log-output")?.textContent || ""}`,
      }), 20000);
      document.addEventListener("sudoku-generated", (event) => {
        clearTimeout(timeout);
        resolve({ type: "result", givens: event.detail.givens });
      }, { once: true });
      document.addEventListener("sudoku-generation-error", (event) => {
        clearTimeout(timeout);
        resolve({ type: "error", message: event.detail });
      }, { once: true });
      window.SudokuTools.prepareBattleGrid(9);
      window.SudokuTools.generatePuzzle(9, ["classic", "windoku"], {}, null, 321, "easy");
    }));
    assert.equal(result.type, "result", result.message || "generation timed out");
  } finally {
    await browser.close();
    await server.close();
  }
});

test("variant generation does not leak an uncaught importScripts error", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({ configFile: path.resolve(__dirname, "../vite.config.js"), logLevel: "silent", server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const uncaught = [];
    page.on("pageerror", (error) => uncaught.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") uncaught.push(message.text()); });
    await page.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.pu && window.SudokuTools?.generatePuzzle && window.SudokuGenerator);
    let failures = 0;
    await page.route("**/js/sudoku_csp_variants/browser.js*", async (route) => {
      if (failures++ < 2) await route.abort("failed");
      else await route.continue();
    });
    const result = await page.evaluate(() => new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({ type: "timeout" }), 20000);
      document.addEventListener("sudoku-generated", () => { clearTimeout(timeout); resolve({ type: "result" }); }, { once: true });
      document.addEventListener("sudoku-generation-error", (event) => { clearTimeout(timeout); resolve({ type: "error", message: event.detail }); }, { once: true });
      window.SudokuTools.prepareBattleGrid(6);
      window.SudokuTools.generatePuzzle(6, ["classic"], {}, null, 456, "easy");
    }));
    assert.equal(result.type, "result", result.message || "generation timed out");
    assert.deepEqual(uncaught.filter((message) => /importScripts/.test(message)), []);
  } finally {
    await browser.close();
    await server.close();
  }
});

test("battle generation does not depend on runtime importScripts variant requests", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({ configFile: path.resolve(__dirname, "../vite.config.js"), logLevel: "silent", server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const uncaught = [];
    page.on("pageerror", (error) => uncaught.push(error.message));
    await page.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.pu && window.SudokuTools?.generatePuzzle && window.SudokuGenerator);
    let variantRequests = 0;
    await page.route("**/js/sudoku_csp_variants/browser.js*", (route) => {
      variantRequests += 1;
      return route.abort("failed");
    });
    const result = await page.evaluate(() => new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({ type: "timeout" }), 20000);
      document.addEventListener("sudoku-generated", () => {
        clearTimeout(timeout);
        resolve({ type: "result" });
      }, { once: true });
      document.addEventListener("sudoku-generation-error", (event) => {
        clearTimeout(timeout);
        resolve({ type: "error", message: event.detail });
      }, { once: true });
      window.SudokuTools.prepareBattleGrid(6);
      window.SudokuTools.generatePuzzle(6, ["classic"], {}, null, 789, "easy");
    }));
    assert.equal(result.type, "result", result.message || "generation timed out");
    assert.equal(variantRequests, 0);
    assert.deepEqual(uncaught.filter((message) => /importScripts/.test(message)), []);
    const mark = await page.evaluate(() => {
      for (let row = 0; row < 6; row += 1) {
        for (let col = 0; col < 6; col += 1) {
          const key = window.SudokuSolver.cellKey(window.pu, row, col);
          if (window.pu.pu_q.number[key]) continue;
          window.SudokuTools.setBattleDigit(row, col, 1, "#ff0000", "rgba(255,0,0,.14)");
          return {
            color: window.pu.pu_a_col.number[key],
            shade: window.pu.pu_a_col.surface[key],
            customColors: window.UserSettings.custom_colors_on,
          };
        }
      }
      return null;
    });
    assert.deepEqual(mark, { color: "#ff0000", shade: "rgba(255,0,0,.14)", customColors: true });
  } finally {
    await browser.close();
    await server.close();
  }
});
