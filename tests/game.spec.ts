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
    timeout: 15_000
  });
}

test.describe('Tiny Planet Delivery', () => {
  test('completes all delivery quests via test hooks', async ({ page }) => {
    const targetUrl = process.env.DEMO_URL ?? '/index.html';
    await page.goto(targetUrl);

    await page.waitForSelector('[data-game-ready="1"]', { timeout: 15_000 });
    await waitForTestApi(page);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await canvas.click({ position: { x: 100, y: 100 } });

    await page.evaluate(() => {
      const api = (window as any).__GAME_TEST__;
      api.tpToPost();
      api.clickInteract();
    });

    await page.waitForFunction(() => (window as any).__GAME_TEST__.carrying() === true);

    for (let delivery = 0; delivery < 3; delivery++) {
      await page.evaluate(() => {
        const api = (window as any).__GAME_TEST__;
        api.tpToHouse();
        api.clickInteract();
      });

      if (delivery < 2) {
        await page.waitForFunction(
          (expectedQuest) => {
            const api = (window as any).__GAME_TEST__;
            return api.quest() === expectedQuest && api.carrying() === false;
          },
          delivery + 1
        );

        await page.evaluate(() => {
          const api = (window as any).__GAME_TEST__;
          api.tpToPost();
          api.clickInteract();
        });

        await page.waitForFunction(() => (window as any).__GAME_TEST__.carrying() === true);
      } else {
        await page.waitForFunction(() => (window as any).__GAME_TEST__.winVisible() === true, {
          timeout: 5_000
        });
      }
    }

    await expect(page.locator('#win')).toBeVisible();
  });
});
