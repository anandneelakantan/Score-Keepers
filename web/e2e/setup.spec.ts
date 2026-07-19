import { test, expect } from '@playwright/test';
import { resetAppState, createGame, setPlayers, goToTab } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetAppState(page);
});

test('creates a game and applies players', async ({ page }) => {
  await createGame(page, 'Friday Game Night');
  await page.getByPlaceholder('Player 1').fill('Alice');
  await page.getByPlaceholder('Player 2').fill('Bob');
  await page.getByRole('button', { name: 'Apply Players →' }).click();
  await expect(page.getByTestId('toast')).toContainText('2 players set. Rounds reset.');
});

test('rejects fewer than 2 players', async ({ page }) => {
  await createGame(page, 'Solo Test');
  await page.getByPlaceholder('Player 1').fill('OnlyOne');
  await page.getByRole('button', { name: 'Apply Players →' }).click();
  await expect(page.getByTestId('toast')).toContainText('Add at least 2 players.');
});

test('rejects duplicate player names', async ({ page }) => {
  await createGame(page, 'Dup Test');
  await page.getByPlaceholder('Player 1').fill('Sam');
  await page.getByPlaceholder('Player 2').fill('sam');
  await page.getByRole('button', { name: 'Apply Players →' }).click();
  await expect(page.getByTestId('toast')).toContainText('Player names must be unique.');
});

test('auto-grows the player input list as names are typed', async ({ page }) => {
  await createGame(page, 'Grow Test');
  await expect(page.getByPlaceholder('Player 2')).toHaveCount(0);
  await page.getByPlaceholder('Player 1').fill('Alice');
  await expect(page.getByPlaceholder('Player 2')).toHaveCount(1);
});

test('shows existing player names when reopening a saved game', async ({ page }) => {
  await createGame(page, 'Reopen Test');
  await setPlayers(page, ['Alice', 'Bob']);

  await goToTab(page, 'Rounds');

  await page.getByRole('button', { name: 'My Games' }).click();
  await page.getByTestId('game-list-item').getByRole('button', { name: 'Open' }).click();

  await goToTab(page, 'Game setup');
  await expect(page.getByPlaceholder('Player 1')).toHaveValue('Alice');
  await expect(page.getByPlaceholder('Player 2')).toHaveValue('Bob');
});
