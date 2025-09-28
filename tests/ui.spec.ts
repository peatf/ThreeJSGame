import { expect, test, Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('console', (msg) => {
    console.log(`[console.${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    console.log(`[pageerror] ${err.message ?? err}`);
  });
});

async function waitForTestApi(page: Page) {
  await page.waitForFunction(() => Boolean((window as any).__GAME_TEST__), undefined, {
    timeout: 30_000
  });
  const apiExists = await page.evaluate(() => Boolean((window as any).__GAME_TEST__));
  expect(apiExists, '__GAME_TEST__ global did not resolve in time').toBe(true);
}

test.describe('Tiny Planet Delivery HUD controls', () => {
  test('orbit and music toggles reflect state and reset clears progress', async ({ page }) => {
    const targetUrl = process.env.DEMO_URL ?? '/index.html';
    await page.goto(targetUrl);

    await page.waitForSelector('[data-game-ready="1"]', { timeout: 30_000 });
    await waitForTestApi(page);

    await page.evaluate(() => (window as any).__GAME_TEST__.reset());

    await page.waitForFunction(() => (window as any).__GAME_TEST__.quest() === 0);
    await expect(page.locator('#quest')).toContainText('Quest 1/');

    const orbitBtn = page.locator('#orbitBtn');
    await page.evaluate(() => (window as any).__GAME_TEST__.setOrbitEnabled(false));
    await expect(orbitBtn).toContainText('Orbit');

    await page.evaluate(() => (window as any).__GAME_TEST__.toggleOrbit());
    await page.waitForFunction(() => (window as any).__GAME_TEST__.orbitEnabled() === true);
    await expect(orbitBtn).toContainText('Orbit On ✓');

    await page.evaluate(() => (window as any).__GAME_TEST__.toggleOrbit());
    await page.waitForFunction(() => (window as any).__GAME_TEST__.orbitEnabled() === false);
    await expect(orbitBtn).toContainText('Orbit');

    const musicBtn = page.locator('#muteBtn');
    await page.evaluate(() => (window as any).__GAME_TEST__.setMusicEnabled(true));
    await expect(musicBtn).toContainText('♪ Music');

    await musicBtn.click();
    await page.waitForFunction(() => (window as any).__GAME_TEST__.musicOn() === false);
    await expect(musicBtn).toContainText('♪ Music ✕');

    await page.evaluate(() => (window as any).__GAME_TEST__.toggleMusic());
    await page.waitForFunction(() => (window as any).__GAME_TEST__.musicOn() === true);
    await expect(musicBtn).toContainText('♪ Music ✓');

    await page.evaluate(() => {
      const api = (window as any).__GAME_TEST__;
      api.tpToPost();
      api.clickInteract();
    });

    await page.waitForFunction(() => (window as any).__GAME_TEST__.carrying() === true);

    await page.evaluate(() => {
      const win = document.getElementById('win');
      if (win) win.style.display = 'grid';
    });
    await expect(page.locator('#win')).toBeVisible();

    await page.evaluate(() => (window as any).__GAME_TEST__.reset());
    await page.waitForFunction(() => (window as any).__GAME_TEST__.winVisible() === false);
    await expect(page.locator('#win')).toBeHidden();
    await page.waitForFunction(() => (window as any).__GAME_TEST__.quest() === 0);
    await page.waitForFunction(() => (window as any).__GAME_TEST__.carrying() === false);
  });
});
