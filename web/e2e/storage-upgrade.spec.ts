import { test, expect } from '@playwright/test';
import { createGame, deleteDatabase } from './helpers';

// Recreates storage as it was before players and settings moved into IndexedDB (DB version 1).
test.beforeEach(async ({ page }) => {
  await page.goto('favicon.svg'); // same origin, but the app isn't holding the database open
  await page.evaluate(() => localStorage.clear());
  await deleteDatabase(page);
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('scorekeepers', 1);
        req.onupgradeneeded = () => {
          req.result.createObjectStore('games', { keyPath: 'id' }).createIndex('updatedAt', 'updatedAt');
        };
        req.onsuccess = () => {
          const tx = req.result.transaction('games', 'readwrite');
          tx.objectStore('games').put({
            id: 'old-game',
            name: 'Old Game',
            createdAt: 1,
            updatedAt: 1,
            players: [
              { id: 'p1', name: 'Dana', emoji: '🦊' },
              { id: 'p2', name: 'Eli' },
            ],
            rounds: [],
            settings: { rankDir: 'high', trackWinner: true, timer: { enabled: false, seconds: 30 } },
          });
          tx.oncomplete = () => {
            req.result.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      }),
  );
  await page.evaluate(() => {
    localStorage.setItem('sb-theme', 'light');
    localStorage.setItem('sb-migrated-v1', '1');
  });
  await page.goto('./');
});

test('remembers players from existing games', async ({ page }) => {
  await expect(page.getByTestId('game-list-item')).toHaveCount(1);
  await createGame(page, 'New Game');
  await expect(page.locator('#known-players option')).toHaveCount(2);

  await page.getByPlaceholder('Player 1').fill('Dana');
  await expect(page.getByRole('button', { name: 'Choose avatar for Dana' })).toContainText('🦊');
});

test('moves the theme and import flag out of localStorage', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByTestId('game-list-item')).toHaveCount(1);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
